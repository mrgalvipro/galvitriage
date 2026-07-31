import day7aWorker from './worker.js';

const PRODUCTION_ORIGINS = new Set([
  'https://www.galvipro.com',
  'https://galvipro.com',
  'https://mrgalvipro.github.io'
]);
const PRIMARY_PRODUCTION_ORIGIN = 'https://www.galvipro.com';
const DAY7B_RUNTIME_MARKER = 'day7b-production-isolation-v3';
const HUBSPOT_ADAPTER_MARKER = 'production-hubspot-upsert-v1';

function requestOrigin(request) {
  return String(request.headers.get('Origin') || '').trim();
}

function isAllowedOrigin(origin) {
  return !origin || PRODUCTION_ORIGINS.has(origin);
}

function productionEnv(env = {}, request = null) {
  const origin = request ? requestOrigin(request) : '';
  return {
    ...env,
    ENVIRONMENT: 'production',
    APP_ENV: 'production',
    RELEASE_BRANCH: 'main',
    GALVIVAULT_NAME: 'galvivault-0-5-production',
    HUBSPOT_ENABLED: 'true',
    ALLOWED_ORIGIN: isAllowedOrigin(origin) && origin ? origin : PRIMARY_PRODUCTION_ORIGIN
  };
}

function corsHeaders(request) {
  const origin = requestOrigin(request);
  if (!origin || !PRODUCTION_ORIGINS.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function commonHeaders(request) {
  return {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-GalviCare-Environment': 'production',
    'X-GalviCare-Runtime-Marker': DAY7B_RUNTIME_MARKER,
    ...corsHeaders(request)
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...commonHeaders(request)
    }
  });
}

function forbiddenOrigin(request) {
  return !isAllowedOrigin(requestOrigin(request));
}

async function parseApiPayload(request) {
  if (request.method !== 'POST') return null;
  if (new URL(request.url).pathname !== '/api') return null;
  try {
    return await request.clone().json();
  } catch {
    return null;
  }
}

function textAt(object, path, fallback = '') {
  const value = path.split('.').reduce((current, key) => current?.[key], object);
  return String(value ?? fallback).trim();
}

function isCertificationRecord(payload) {
  const email = textAt(payload, 'founder.email').toLowerCase();
  const source = textAt(payload, 'session.source').toLowerCase();
  return /(^|[+._-])test|tester|galvipro\.com/.test(email) || /test|certif/.test(source);
}

function hubspotProperties(payload, delegatedBody) {
  const vitals = delegatedBody?.vitals || {};
  const scores = vitals.dimension_scores || delegatedBody?.score?.dimension_scores || {};
  const weakest = Object.entries(scores)
    .filter(([, value]) => Number.isFinite(Number(value)))
    .sort((a, b) => Number(a[1]) - Number(b[1]))[0];

  return {
    email: textAt(payload, 'founder.email'),
    firstname: textAt(payload, 'founder.first_name'),
    lastname: textAt(payload, 'founder.last_name'),
    phone: textAt(payload, 'founder.phone'),
    company: textAt(payload, 'venture.venture_name'),
    website: textAt(payload, 'venture.website'),
    galvicare_environment: 'production',
    galvicare_test_record: isCertificationRecord(payload) ? 'true' : 'false',
    galvicare_session_id: String(delegatedBody?.session_id || textAt(payload, 'session.session_id')),
    galvicare_journey_stage: 'GalviVitals',
    galvivitals_score: String(vitals.score ?? delegatedBody?.score?.score ?? ''),
    galvicare_lowest_dimension: weakest ? String(weakest[0]) : ''
  };
}

async function hubspotFetch(env, path, options = {}) {
  const token = String(env?.HUBSPOT_PRIVATE_APP_TOKEN || '').trim();
  if (!token) throw new Error('HUBSPOT_PRIVATE_APP_TOKEN is missing');
  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!response.ok) {
    const error = new Error(`HubSpot request failed (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function upsertHubSpotContact(env, payload, delegatedBody) {
  if (String(env?.HUBSPOT_ENABLED || '').toLowerCase() !== 'true') {
    return { attempted: false, success: false, status: 'disabled', adapter: HUBSPOT_ADAPTER_MARKER };
  }

  const properties = hubspotProperties(payload, delegatedBody);
  if (!properties.email) {
    return { attempted: false, success: false, status: 'missing_email', adapter: HUBSPOT_ADAPTER_MARKER };
  }

  const search = await hubspotFetch(env, '/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: properties.email }] }],
      properties: ['email'],
      limit: 1
    })
  });

  let contact;
  if (Array.isArray(search.results) && search.results.length > 0) {
    const contactId = search.results[0].id;
    contact = await hubspotFetch(env, `/crm/v3/objects/contacts/${encodeURIComponent(contactId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties })
    });
    return { attempted: true, success: true, status: 'updated', contact_id: contact.id, adapter: HUBSPOT_ADAPTER_MARKER };
  }

  contact = await hubspotFetch(env, '/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({ properties })
  });
  return { attempted: true, success: true, status: 'created', contact_id: contact.id, adapter: HUBSPOT_ADAPTER_MARKER };
}

async function delegate(request, env, ctx, payload = null) {
  const response = await day7aWorker.fetch(request, productionEnv(env, request), ctx);
  let responseBody = null;
  const contentType = String(response.headers.get('Content-Type') || '');

  if (payload?.action === 'submit_triage' && response.ok && contentType.includes('application/json')) {
    try {
      responseBody = await response.clone().json();
      let hubspot;
      try {
        hubspot = await upsertHubSpotContact(productionEnv(env, request), payload, responseBody);
      } catch (error) {
        console.error('Production HubSpot synchronization failed', error?.body || error);
        hubspot = {
          attempted: true,
          success: false,
          status: 'failed',
          error: error?.message || String(error),
          http_status: error?.status || null,
          details: error?.body || null,
          adapter: HUBSPOT_ADAPTER_MARKER
        };
      }
      responseBody = { ...responseBody, hubspot };
    } catch (error) {
      console.error('Unable to enrich submit_triage response', error);
    }
  }

  const headers = new Headers(response.headers);
  headers.delete('Access-Control-Allow-Origin');
  headers.delete('Access-Control-Allow-Credentials');
  headers.delete('Access-Control-Allow-Headers');
  headers.delete('Access-Control-Allow-Methods');
  headers.delete('Access-Control-Max-Age');
  for (const [key, value] of Object.entries(commonHeaders(request))) headers.set(key, value);

  return new Response(responseBody ? JSON.stringify(responseBody) : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    if (request.method === 'OPTIONS') {
      if (forbiddenOrigin(request)) return json(request, { success: false, status: 'forbidden_origin' }, 403);
      return new Response(null, { status: 204, headers: commonHeaders(request) });
    }

    if (forbiddenOrigin(request)) return json(request, { success: false, status: 'forbidden_origin' }, 403);

    if (request.method === 'GET' && (pathname === '/' || pathname === '/health')) {
      return json(request, {
        success: true,
        service: 'GalviCare 0.5 Worker',
        environment: 'production',
        release_branch: 'main',
        galvivault: 'galvivault-0-5-production',
        runtime_marker: DAY7B_RUNTIME_MARKER,
        day7a_runtime_marker: 'day7a-payment-products-v1',
        allowed_origins: Array.from(PRODUCTION_ORIGINS),
        hubspot_enabled: true,
        hubspot_credential_present: Boolean(String(env?.HUBSPOT_PRIVATE_APP_TOKEN || '').trim()),
        hubspot_adapter: HUBSPOT_ADAPTER_MARKER,
        db_bound: Boolean(env?.DB)
      });
    }

    const payload = await parseApiPayload(request);
    const action = String(payload?.action || '').trim();

    if (action === 'health_check') {
      return json(request, {
        success: true,
        action,
        environment: 'production',
        release_branch: 'main',
        galvivault: 'galvivault-0-5-production',
        runtime_marker: DAY7B_RUNTIME_MARKER,
        day7a_runtime_marker: 'day7a-payment-products-v1',
        allowed_origins: Array.from(PRODUCTION_ORIGINS),
        hubspot_enabled: true,
        hubspot_credential_present: Boolean(String(env?.HUBSPOT_PRIVATE_APP_TOKEN || '').trim()),
        hubspot_adapter: HUBSPOT_ADAPTER_MARKER,
        db_bound: Boolean(env?.DB)
      });
    }

    if (action === 'get_fixture_result' || action === 'grant_test_override') {
      return json(request, { success: false, action, status: 'not_found', message: 'QA-only capability is unavailable in production.' }, 404);
    }

    return delegate(request, env, ctx, payload);
  }
};
