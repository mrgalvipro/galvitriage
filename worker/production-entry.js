import day7aWorker from './worker.js';

const PRODUCTION_ORIGIN = 'https://www.galvipro.com';
const DAY7B_RUNTIME_MARKER = 'day7b-production-isolation-v1';

function productionEnv(env = {}) {
  return {
    ...env,
    ENVIRONMENT: 'production',
    APP_ENV: 'production',
    RELEASE_BRANCH: 'qa-revamped-galvicare-0-5',
    GALVIVAULT_NAME: 'galvivault-0-5-production',
    ALLOWED_ORIGIN: PRODUCTION_ORIGIN
  };
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  if (origin !== PRODUCTION_ORIGIN) return {};
  return {
    'Access-Control-Allow-Origin': PRODUCTION_ORIGIN,
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
  const origin = request.headers.get('Origin');
  return Boolean(origin && origin !== PRODUCTION_ORIGIN);
}

async function apiAction(request) {
  if (request.method !== 'POST') return '';
  if (new URL(request.url).pathname !== '/api') return '';
  try {
    const payload = await request.clone().json();
    return String(payload?.action || '').trim();
  } catch {
    return '';
  }
}

async function delegate(request, env, ctx) {
  const response = await day7aWorker.fetch(request, productionEnv(env), ctx);
  const headers = new Headers(response.headers);
  headers.delete('Access-Control-Allow-Origin');
  headers.delete('Access-Control-Allow-Credentials');
  headers.delete('Access-Control-Allow-Headers');
  headers.delete('Access-Control-Allow-Methods');
  headers.delete('Access-Control-Max-Age');
  for (const [key, value] of Object.entries(commonHeaders(request))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    if (request.method === 'OPTIONS') {
      if (forbiddenOrigin(request)) {
        return json(request, { success: false, status: 'forbidden_origin' }, 403);
      }
      return new Response(null, { status: 204, headers: commonHeaders(request) });
    }

    if (forbiddenOrigin(request)) {
      return json(request, { success: false, status: 'forbidden_origin' }, 403);
    }

    if (request.method === 'GET' && (pathname === '/' || pathname === '/health')) {
      return json(request, {
        success: true,
        service: 'GalviCare 0.5 Worker',
        environment: 'production',
        release_branch: 'qa-revamped-galvicare-0-5',
        galvivault: 'galvivault-0-5-production',
        runtime_marker: DAY7B_RUNTIME_MARKER,
        day7a_runtime_marker: 'day7a-payment-products-v1',
        db_bound: Boolean(env?.DB)
      });
    }

    const action = await apiAction(request);

    if (action === 'health_check') {
      return json(request, {
        success: true,
        action,
        environment: 'production',
        release_branch: 'qa-revamped-galvicare-0-5',
        galvivault: 'galvivault-0-5-production',
        runtime_marker: DAY7B_RUNTIME_MARKER,
        day7a_runtime_marker: 'day7a-payment-products-v1',
        db_bound: Boolean(env?.DB)
      });
    }

    if (action === 'get_fixture_result' || action === 'grant_test_override') {
      return json(request, {
        success: false,
        action,
        status: 'not_found',
        message: 'QA-only capability is unavailable in production.'
      }, 404);
    }

    return delegate(request, env, ctx);
  }
};
