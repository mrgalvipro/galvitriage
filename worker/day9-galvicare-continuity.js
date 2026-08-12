import day7dWorker from './day7d-engine.js';
import day2Worker from './day2.js';

const text = (value) => String(value ?? '').trim();
const enabled = (value) => text(value).toLowerCase() === 'true';

export function buildDay9CanonicalContinuityInput(payload = {}) {
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

export function isLegacyFounderSessionCollision(status, body) {
  if (Number(status) !== 500) return false;
  const message = `${text(body?.error)} ${text(body?.message)} ${text(body?.detail)}`;
  return /UNIQUE constraint failed:\s*founders\.founder_id/i.test(message);
}

function safeJson(body, status, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      ...extraHeaders
    }
  });
}

async function attachCanonicalContinuity(env, ctx, payload) {
  const continuity = buildDay9CanonicalContinuityInput(payload);
  if (!continuity) {
    throw new Error('Day 9 canonical continuity input is incomplete after a successful GalviTriage submission.');
  }

  const legacySessionId = text(payload?.session?.session_id || payload?.session_id);
  const correlation = text(payload?.correlation_id || payload?.session?.correlation_id) || `day9-${legacySessionId}`;
  const request = new Request('https://galvivault.internal/api/v1/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': `day9-galvicare-${legacySessionId}`,
      'X-Correlation-Id': correlation,
      'X-GalviVault-Actor-Id': 'galvicare_day9_continuity_bridge',
      'X-GalviVault-Actor-Type': 'service'
    },
    body: JSON.stringify(continuity)
  });

  const response = await day2Worker.fetch(request, env, ctx);
  if (!response.ok) {
    let failure = {};
    try { failure = await response.clone().json(); } catch {}
    const code = text(failure?.error?.code || failure?.error_code || failure?.status || 'unknown');
    throw new Error(`Day 9 canonical continuity rejected: ${code}`);
  }
  return response;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return day7dWorker.fetch(request, env, ctx);

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api') {
      return day7dWorker.fetch(request, env, ctx);
    }

    let payload;
    try { payload = await request.clone().json(); }
    catch { return day7dWorker.fetch(request, env, ctx); }

    if (text(payload?.action) !== 'submit_triage') {
      return day7dWorker.fetch(request, env, ctx);
    }

    const galviCareResponse = await day7dWorker.fetch(request, env, ctx);
    if (!galviCareResponse.ok) {
      let body = {};
      try { body = await galviCareResponse.clone().json(); } catch {}
      if (isLegacyFounderSessionCollision(galviCareResponse.status, body)) {
        return safeJson({
          success: false,
          status: 'conflict',
          error_code: 'GALVICARE_SESSION_IDENTITY_CONFLICT',
          message: 'This browser session is already bound to a different founder identity. Start a fresh GalviCare session and resubmit; no canonical Day 9 continuity record was created.'
        }, 409, { 'X-GalviVault-Day9-Continuity': 'fresh-session-required' });
      }
      return galviCareResponse;
    }

    const bridgeEnabled = text(env?.ENVIRONMENT).toLowerCase() === 'qa' &&
      enabled(env?.GALVIVAULT_DAY9_CONTINUITY_BRIDGE);
    if (!bridgeEnabled) return galviCareResponse;
    if (!env?.DB) {
      return safeJson({
        success: false,
        status: 'error',
        error_code: 'DAY9_CANONICAL_CONTINUITY_UNAVAILABLE',
        message: 'GalviCare submission succeeded, but the QA canonical continuity bridge is unavailable.'
      }, 503, { 'X-GalviVault-Day9-Continuity': 'unavailable' });
    }

    try {
      await attachCanonicalContinuity(env, ctx, payload);
    } catch (error) {
      console.error('Day 9 GalviCare canonical continuity bridge', error?.message || error);
      return safeJson({
        success: false,
        status: 'error',
        error_code: 'DAY9_CANONICAL_CONTINUITY_FAILED',
        message: 'GalviCare submission could not be attached to the canonical QA Business Health Record. The run stopped safely.'
      }, 500, { 'X-GalviVault-Day9-Continuity': 'failed' });
    }

    const headers = new Headers(galviCareResponse.headers);
    headers.set('X-GalviVault-Day9-Continuity', 'attached');
    return new Response(galviCareResponse.body, {
      status: galviCareResponse.status,
      statusText: galviCareResponse.statusText,
      headers
    });
  }
};
