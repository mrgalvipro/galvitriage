import day7aWorker from './worker.js';

const PRODUCTION_ORIGIN = 'https://www.galvipro.com';
const DAY7B_RUNTIME_MARKER = 'day7b-production-isolation-v2';

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

function stripeMode(env = {}) {
  const key = String(env.STRIPE_SECRET_KEY || '').trim();
  if (key.startsWith('sk_live_')) return 'live';
  if (key.startsWith('sk_test_')) return 'test';
  return 'missing';
}

function normalizeProduct(value) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[™®]/g, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  if (normalized === 'galviscore' || normalized === 'galvi score' || normalized === 'galviscore unlock') return 'galviscore';
  if (normalized === 'galvishot' || normalized === 'galvi shot' || normalized === 'galvishot unlock') return 'galvishot';
  if (normalized === 'galvisight' || normalized === 'galvi sight' || normalized === 'galvisight unlock') return 'galvisight';
  if (normalized === 'galvipath' || normalized === 'galvi path' || normalized === 'galvipath unlock') return 'galvipath';
  return '';
}

function expectedAmountCents(product) {
  if (product === 'galviscore') return 900;
  if (['galvishot', 'galvisight', 'galvipath'].includes(product)) return 2900;
  return null;
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

async function apiPayload(request) {
  if (request.method !== 'POST') return null;
  if (new URL(request.url).pathname !== '/api') return null;
  try {
    return await request.clone().json();
  } catch {
    return null;
  }
}

function sessionProductFromStripe(stripeSession) {
  const metadata = normalizeProduct(stripeSession?.metadata?.product || stripeSession?.metadata?.galvicare_product);
  if (metadata) return metadata;
  const items = stripeSession?.line_items?.data || [];
  for (const item of items) {
    const product = item?.price?.product;
    const name = typeof product === 'object' ? product?.name : '';
    const description = item?.description || '';
    const normalized = normalizeProduct(name || description);
    if (normalized) return normalized;
  }
  return '';
}

async function verifyProductionStripeReturn(request, env, payload) {
  if (stripeMode(env) !== 'live') {
    return json(request, {
      success: false,
      action: 'resolve_payment_return',
      status: 'stripe_live_configuration_required',
      message: 'Production payment verification is unavailable until a Stripe LIVE secret key is configured.'
    }, 503);
  }

  const stripeSessionId = String(payload?.payload?.stripe_session_id || payload?.stripe_session_id || '').trim();
  const expectedProduct = normalizeProduct(payload?.payload?.expected_product || payload?.expected_product);
  if (!stripeSessionId.startsWith('cs_') || !expectedProduct) {
    return json(request, { success:false, action:'resolve_payment_return', status:'invalid_payment_return' }, 400);
  }

  const secret = String(env.STRIPE_SECRET_KEY || '').trim();
  const url = `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(stripeSessionId)}?expand[]=line_items.data.price.product`;
  const stripeResponse = await fetch(url, { headers: { Authorization: `Bearer ${secret}` } });
  let stripeSession = {};
  try { stripeSession = await stripeResponse.json(); } catch { stripeSession = {}; }
  if (!stripeResponse.ok) {
    return json(request, {
      success:false,
      action:'resolve_payment_return',
      status:'stripe_session_not_verified',
      message:'Stripe did not verify this Checkout Session.'
    }, stripeResponse.status === 404 ? 404 : 402);
  }

  const paymentStatus = String(stripeSession.payment_status || '').toLowerCase();
  const livemode = stripeSession.livemode === true;
  const paymentIntent = String(stripeSession.payment_intent || '').trim();
  const amountTotal = Number(stripeSession.amount_total);
  const currency = String(stripeSession.currency || '').toLowerCase();
  const actualProduct = sessionProductFromStripe(stripeSession);
  const expectedAmount = expectedAmountCents(expectedProduct);

  if (!livemode || paymentStatus !== 'paid' || !paymentIntent || !Number.isFinite(amountTotal) || amountTotal <= 0) {
    return json(request, {
      success:false,
      action:'resolve_payment_return',
      status:'payment_not_live_and_paid',
      message:'A verified Stripe LIVE paid transaction is required before GalviCare can unlock this product.'
    }, 402);
  }

  if (currency !== 'usd' || expectedAmount === null || amountTotal !== expectedAmount) {
    return json(request, {
      success:false,
      action:'resolve_payment_return',
      status:'payment_amount_mismatch',
      message:'Stripe payment amount does not match the requested GalviCare product.'
    }, 409);
  }

  if (!actualProduct || actualProduct !== expectedProduct) {
    return json(request, {
      success:false,
      action:'resolve_payment_return',
      status:'payment_product_mismatch',
      message:'Stripe Checkout product does not match the requested GalviCare product.'
    }, 409);
  }

  return null;
}

async function delegate(request, env, ctx) {
  const response = await day7aWorker.fetch(request, productionEnv(env), ctx);
  const headers = new Headers(response.headers);
  headers.delete('Access-Control-Allow-Origin');
  headers.delete('Access-Control-Allow-Credentials');
  headers.delete('Access-Control-Allow-Headers');
  headers.delete('Access-Control-Allow-Methods');
  headers.delete('Access-Control-Max-Age');
  for (const [key, value] of Object.entries(commonHeaders(request))) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname;

    if (request.method === 'OPTIONS') {
      if (forbiddenOrigin(request)) return json(request, { success:false, status:'forbidden_origin' }, 403);
      return new Response(null, { status:204, headers:commonHeaders(request) });
    }

    if (forbiddenOrigin(request)) return json(request, { success:false, status:'forbidden_origin' }, 403);

    if (request.method === 'GET' && (pathname === '/' || pathname === '/health')) {
      return json(request, {
        success:true,
        service:'GalviCare 0.5 Worker',
        environment:'production',
        release_branch:'qa-revamped-galvicare-0-5',
        galvivault:'galvivault-0-5-production',
        runtime_marker:DAY7B_RUNTIME_MARKER,
        day7a_runtime_marker:'day7a-payment-products-v1',
        db_bound:Boolean(env?.DB),
        stripe_mode:stripeMode(env)
      });
    }

    const payload = await apiPayload(request);
    const action = String(payload?.action || '').trim();

    if (action === 'health_check') {
      return json(request, {
        success:true,
        action,
        environment:'production',
        release_branch:'qa-revamped-galvicare-0-5',
        galvivault:'galvivault-0-5-production',
        runtime_marker:DAY7B_RUNTIME_MARKER,
        day7a_runtime_marker:'day7a-payment-products-v1',
        db_bound:Boolean(env?.DB),
        stripe_mode:stripeMode(env)
      });
    }

    if (action === 'get_fixture_result' || action === 'grant_test_override') {
      return json(request, { success:false, action, status:'not_found', message:'QA-only capability is unavailable in production.' }, 404);
    }

    if (action === 'resolve_payment_return') {
      const rejection = await verifyProductionStripeReturn(request, env, payload);
      if (rejection) return rejection;
    }

    return delegate(request, env, ctx);
  }
};
