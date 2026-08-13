import productionWorker from './production-entry.js';
import canonicalWorker from './day2.js';
import clinicianWorker from './day8-entry.js';

const text = (value) => String(value ?? '').trim();
const enabled = (value) => text(value).toLowerCase() === 'true';

function productionBridgeEnabled(env) {
  return text(env?.ENVIRONMENT).toLowerCase() === 'production' &&
    text(env?.APP_ENV).toLowerCase() === 'production' &&
    enabled(env?.GALVIVAULT_DAY9_CONTINUITY_BRIDGE) &&
    !enabled(env?.FIXTURE_MODE);
}

function withHeaders(response, extraHeaders = {}) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function safeJson(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-GalviCare-Environment': 'production',
      ...extraHeaders
    }
  });
}

export function buildProductionCanonicalContinuityInput(payload = {}) {
  const legacySessionId = text(payload?.session?.session_id || payload?.session_id);
  const founder = payload?.founder && typeof payload.founder === 'object' ? payload.founder : {};
  const venture = payload?.venture && typeof payload.venture === 'object' ? payload.venture : {};
  if (!legacySessionId || !text(founder.email) || !text(venture.venture_name)) return null;

  return {
    client_session_key: `galvicare:${legacySessionId}`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: {
      email: text(founder.email),
      first_name: text(founder.first_name) || undefined,
      last_name: text(founder.last_name) || undefined,
      phone: text(founder.phone) || undefined,
      consent_status: founder.consent === true ? 'approved' : 'missing'
    },
    venture: {
      venture_name: text(venture.venture_name),
      stage: text(venture.organization_stage || venture.stage) || undefined,
      website: text(venture.website) || undefined,
      industry: text(venture.industry) || undefined,
      revenue_range: text(venture.revenue_range) || undefined
    }
  };
}

async function attachCanonicalContinuity(env, ctx, payload) {
  const continuity = buildProductionCanonicalContinuityInput(payload);
  if (!continuity) {
    throw new Error('Production canonical continuity input is incomplete after successful GalviTriage submission.');
  }

  const legacySessionId = text(payload?.session?.session_id || payload?.session_id);
  const correlation = text(payload?.correlation_id || payload?.session?.correlation_id) || `prod-day9-${legacySessionId}`;
  const request = new Request('https://galvivault.internal/api/v1/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': `prod-day9-galvicare-${legacySessionId}`,
      'X-Correlation-Id': correlation,
      'X-GalviVault-Actor-Id': 'galvicare_production_continuity_bridge',
      'X-GalviVault-Actor-Type': 'service'
    },
    body: JSON.stringify(continuity)
  });

  const response = await canonicalWorker.fetch(request, env, ctx);
  if (!response.ok) {
    let failure = {};
    try { failure = await response.clone().json(); } catch {}
    const code = text(failure?.error?.code || failure?.error_code || failure?.status || 'unknown');
    throw new Error(`Production canonical continuity rejected: ${code}`);
  }
  return response;
}

async function integrationReady(env) {
  if (!env?.DB || typeof env.DB.prepare !== 'function') return false;
  const migration = await env.DB.prepare("SELECT migration_id, name, environment FROM gv1_schema_migrations WHERE migration_id='0006' AND name='day8_operator_device_auth' AND environment='production' LIMIT 1").first();
  if (!migration) return false;
  const tables = await env.DB.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name IN ('gv8_operator_credentials','gv8_operator_invitations','gv8_auth_challenges','gv8_operator_sessions')").first();
  return Number(tables?.count || 0) === 4;
}

function isClinicianApi(pathname) {
  return pathname.startsWith('/api/v1/operator/');
}

function localProductionHealthRequest(request) {
  const url = new URL(request.url);
  url.pathname = '/health';
  url.search = '';
  return new Request(url.toString(), {
    method: 'GET',
    headers: request.headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const bridgeEnabled = productionBridgeEnabled(env);
    const runtimeHeaders = bridgeEnabled
      ? {
          'X-GalviVault-Day9-Continuity-Runtime': 'active',
          'X-GalviVault-Production-Integration': 'day9-production-v1'
        }
      : {};

    if (url.pathname === '/ready' && bridgeEnabled) {
      const base = await productionWorker.fetch(localProductionHealthRequest(request), env, ctx);
      if (!base.ok) return withHeaders(base, runtimeHeaders);
      let ready = false;
      try { ready = await integrationReady(env); } catch {}
      if (!ready) {
        return safeJson({
          success: false,
          status: 'unavailable',
          error_code: 'PRODUCTION_GALVIVAULT_INTEGRATION_NOT_READY',
          message: 'Production GalviVault integration schema is not ready.'
        }, 503, { ...runtimeHeaders, 'X-GalviVault-Production-Schema': 'not-ready' });
      }
      return withHeaders(base, { ...runtimeHeaders, 'X-GalviVault-Production-Schema': '0006' });
    }

    if (isClinicianApi(url.pathname)) {
      const response = await clinicianWorker.fetch(request, env, ctx);
      return bridgeEnabled ? withHeaders(response, runtimeHeaders) : response;
    }

    if (request.method !== 'POST' || url.pathname !== '/api') {
      const response = await productionWorker.fetch(request, env, ctx);
      return bridgeEnabled ? withHeaders(response, runtimeHeaders) : response;
    }

    let payload;
    try { payload = await request.clone().json(); }
    catch {
      const response = await productionWorker.fetch(request, env, ctx);
      return bridgeEnabled ? withHeaders(response, runtimeHeaders) : response;
    }

    const action = text(payload?.action);
    const galviCareResponse = await productionWorker.fetch(request, env, ctx);

    if (action !== 'submit_triage' || !galviCareResponse.ok || !bridgeEnabled) {
      return bridgeEnabled ? withHeaders(galviCareResponse, runtimeHeaders) : galviCareResponse;
    }

    if (!env?.DB) {
      return safeJson({
        success: false,
        status: 'error',
        error_code: 'PRODUCTION_CANONICAL_CONTINUITY_UNAVAILABLE',
        message: 'GalviCare submission succeeded, but canonical Business Health Record continuity is unavailable. The request stopped safely.'
      }, 503, { ...runtimeHeaders, 'X-GalviVault-Day9-Continuity': 'unavailable' });
    }

    try {
      await attachCanonicalContinuity(env, ctx, payload);
    } catch (error) {
      console.error('Production GalviCare canonical continuity bridge', error?.message || error);
      return safeJson({
        success: false,
        status: 'error',
        error_code: 'PRODUCTION_CANONICAL_CONTINUITY_FAILED',
        message: 'GalviCare submission could not be attached to the canonical Business Health Record. The request stopped safely.'
      }, 500, { ...runtimeHeaders, 'X-GalviVault-Day9-Continuity': 'failed' });
    }

    return withHeaders(galviCareResponse, {
      ...runtimeHeaders,
      'X-GalviVault-Day9-Continuity': 'attached'
    });
  }
};
