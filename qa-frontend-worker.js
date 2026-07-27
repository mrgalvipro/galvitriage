// GalviCare 0.5 QA browser/customer E2E static frontend host.
// Deploy ONLY to galvicare-0-5-qa. Never bind this Worker to Production D1.
import QA_HTML from './dist-qa/index.html';

const SECURITY_HEADERS = Object.freeze({
  'Content-Type': 'text/html; charset=UTF-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://buy.stripe.com"
});

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({
        success: true,
        service: 'GalviCare 0.5 QA Frontend',
        environment: 'qa',
        stripe_mode: 'test',
        api: 'https://galvicare-triage-intake.mrgalvipro.workers.dev/api',
        build: 'day7b-qa-browser-v1'
      }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return new Response(request.method === 'HEAD' ? null : QA_HTML, { status: 200, headers: SECURITY_HEADERS });
  }
};
