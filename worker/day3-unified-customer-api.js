import governedDay3 from './day3-customer-session.js';
import customerEvidenceApi from './day7d-day3-critical-path.js';

/*
 * GalviCare 1.0 Day 3 unified QA entrypoint.
 *
 * The governed Day 3 Worker is the stable customer-intelligence boundary:
 * - /api serves GalviScore clarification + GalviShot/Sight/Path customer evidence.
 * - /api/v1/day3/* serves governed GalviEngine/OpenAI reasoning.
 * - /health remains the governed Day 3 readiness/capability surface.
 *
 * This deliberately removes Day 3 customer-evidence requests from the mutable
 * legacy galvicare-triage-intake runtime without changing deterministic
 * GalviTriage/GalviVitals/GalviScore arithmetic or creating a new Worker/DB.
 *
 * CORS ownership is intentionally fixed at this unified boundary. The QA browser
 * sends application/json with Cache-Control:no-cache, so /api preflight must not
 * fall through to an older Worker CORS contract that only permits Content-Type.
 * A successful HTTP 204 that omits a requested header is still a browser-level
 * CORS failure and prevents the clarification/follow-up JSON from reaching UI.
 */
const CUSTOMER_API_ALLOW_HEADERS = [
  'Content-Type',
  'Cache-Control',
  'Idempotency-Key',
  'X-Correlation-Id',
  'X-Galvi-Day1-Actor',
  'X-Galvi-Day3-Session'
].join(', ');

function customerApiPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': CUSTOMER_API_ALLOW_HEADERS,
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin, Access-Control-Request-Headers',
      'Cache-Control': 'no-store',
      'X-Galvi-Day3-Cors-Contract': 'customer-api-v1'
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // Own the cross-origin browser contract here. Do not delegate /api OPTIONS to
    // Day 7D/legacy Worker code, because that reintroduces the historical
    // Content-Type-only preflight contract and blocks Cache-Control at the browser.
    if (path === '/api' && request.method === 'OPTIONS') {
      return customerApiPreflight();
    }

    if (path === '/api' && request.method === 'POST') {
      return customerEvidenceApi.fetch(request, env, ctx);
    }

    return governedDay3.fetch(request, env, ctx);
  }
};
