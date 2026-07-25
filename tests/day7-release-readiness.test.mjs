import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');

function block(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('Day 7 exact-product entitlement no longer inherits GalviShot continuity', () => {
  const entitlement = block(worker, 'async function hasProductEntitlement', 'async function storedDay4Result');
  assert.match(entitlement, /WHERE session_id=\? AND product=\?/);
  assert.match(entitlement, /acceptedEntitlementStatuses = \['active', 'paid', 'granted', 'test_override'\]/);
  assert.match(entitlement, /acceptedPaymentStatuses = \['paid', 'succeeded', 'complete'\]/);
  assert.doesNotMatch(entitlement, /'GalviShot'/);
  assert.doesNotMatch(entitlement, /product === 'GalviSight' \|\| product === 'GalviPath'/);
});

test('Day 7 Worker accepts GalviSight and GalviPath product names for paid-return verification', () => {
  const aliases = block(worker, 'const PAYMENT_PRODUCT_ALIASES', 'const DAY7A_RUNTIME_MARKER');
  assert.match(aliases, /galvisight: 'GalviSight'/);
  assert.match(aliases, /galvi_sight: 'GalviSight'/);
  assert.match(aliases, /galvipath: 'GalviPath'/);
  assert.match(aliases, /galvi_path: 'GalviPath'/);
});

test('Day 7 downstream handler retains QA override and unauthorized HTTP 402', () => {
  const handler = block(worker, 'async function handleDay4Action', 'async function handleDiagnosticAction');
  assert.match(handler, /hasProductEntitlement\(db, sid, product\) \|\| hasQaOverride\(env, payload\)/);
  assert.match(handler, /payment_required:true[\s\S]*402/);
});

test('Day 7 GalviSight commercial paywall is present while the customer button omits price', () => {
  assert.match(html, /id="galvisight-paywall"/);
  assert.match(html, /id="galvisight-stripe-cta"[\s\S]*>Unlock GalviSight™<\/button>/);
  assert.doesNotMatch(html, /id="galvisight-stripe-cta"[^>]*>[^<]*\$29/);
  assert.match(html, /id="galvisight-qa-override"/);
  assert.match(html, /showGalviSightPaywall\(\)/);
});

test('Day 7 GalviPath commercial paywall is present while the customer button omits price', () => {
  assert.match(html, /id="galvipath-paywall"/);
  assert.match(html, /Chart Your GalviPath™/);
  assert.match(html, /id="galvipath-stripe-cta"[\s\S]*>Unlock GalviPath™<\/button>/);
  assert.doesNotMatch(html, /id="galvipath-stripe-cta"[^>]*>[^<]*\$29/);
  assert.match(html, /id="galvipath-qa-override"/);
  assert.match(html, /showGalviPathPaywall\(\)/);
});

test('Day 7 approved GalviSight and GalviPath Stripe TEST links are configured', () => {
  assert.match(html, /const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https:\/\/buy\.stripe\.com\/test_eVq3cw3R63YT6O6ahE53O03';/);
  assert.match(html, /const GALVIPATH_STRIPE_PAYMENT_LINK = 'https:\/\/buy\.stripe\.com\/test_fZu14ofzO9jd8We1L853O05';/);
});

test('Day 7 GalviSight paid return verifies, restores, then cleans customer URL', () => {
  const route = block(html, "if(product==='galvisight'&&paid==='sight_success')", "if(product==='galvipath'&&paid==='path_success')");
  const resolve = route.indexOf("resolveStripePaymentReturn(stripeSessionId,'galvisight')");
  const persist = route.indexOf('persistSessionId(resolved.session_id)');
  const render = route.indexOf('window.showGalviSight');
  const cleanup = route.indexOf('cleanPaidReturnCustomerUrl()');
  assert.ok(resolve >= 0 && persist > resolve && render > persist && cleanup > render);
});

test('Day 7 GalviPath paid return verifies, restores, then cleans customer URL', () => {
  const route = block(html, "if(product==='galvipath'&&paid==='path_success')", "if(await restoreGalviCareSession())");
  const resolve = route.indexOf("resolveStripePaymentReturn(stripeSessionId,'galvipath')");
  const persist = route.indexOf('persistSessionId(resolved.session_id)');
  const render = route.indexOf('window.showGalviPath');
  const cleanup = route.indexOf('cleanPaidReturnCustomerUrl()');
  assert.ok(resolve >= 0 && persist > resolve && render > persist && cleanup > render);
});

test('Day 7 canonical URL remains the GalviPro GalviTriage customer route', () => {
  assert.match(html, /GALVICARE_CANONICAL_CUSTOMER_URL = 'https:\/\/www\.galvipro\.com\/#galvitriage'/);
});

test('Day 7 restoration requires exact entitlement for downstream paid products', () => {
  const restore = block(html, 'async function restoreGalviCareSession', 'function showGalviCareErrorCard');
  assert.match(restore, /available\.includes\('GalviPath'\)&&entitled\.includes\('GalviPath'\)/);
  assert.match(restore, /available\.includes\('GalviSight'\)&&entitled\.includes\('GalviSight'\)/);
  assert.match(restore, /available\.includes\('GalviShot'\)&&entitled\.includes\('GalviShot'\)/);
  assert.match(restore, /available\.includes\('GalviScore'\)&&entitled\.includes\('GalviScore'\)/);
});

test('Day 7 print architecture is product scoped and GalviVitals no longer exposes Print Save', () => {
  assert.match(html, /body\.print-galviscore #galviscore-result/);
  assert.match(html, /body\.print-galvishot #galvishot-result/);
  assert.match(html, /body\.print-galvisight #galvisight-handoff/);
  assert.match(html, /body\.print-galvipath #galvipath-result/);
  assert.match(html, /function printGalviCareReport\(product\)/);
  assert.doesNotMatch(html, /data-cta-location="galvivitals_result"[^>]*>Print \/ Save Results/);
});

test('Day 7 customer presentation hides QA/debug controls by default', () => {
  assert.doesNotMatch(html, /Baseline QA sequence:/);
  assert.match(html, /#galviscore-qa-override,[\s\S]*#galvishot-live-test-override/);
  assert.match(html, /qa-debug-enabled/);
  assert.match(html, /#galvishot-executive-summary/);
  assert.match(html, /#galvisight-assumptions-section/);
  assert.match(html, /#galvisight-evidence-section/);
});

test('Day 7A approved GalviTriage and GalviVitals customer copy is present', () => {
  assert.match(html, /<h1 class="hero-title">GalviTriage™<\/h1>/);
  assert.match(html, /GalviCare™ can prepare your initial business health snapshot: GalviVitals™/);
  assert.match(html, /placeholder="Example: I need a more consistent way to find and convert customers\."/);
  assert.match(html, /placeholder="Example: I need help deciding which business priority to focus on first\."/);
  assert.match(html, /<h2 class="center">GalviVitals™<\/h2>/);
  assert.match(html, /Your business health snapshot: \$\{vitals\.classification\|\|vitals\.health_band/);
});

test('Day 7A GalviScore preserves proprietary naming and exactly three deterministic priorities', () => {
  assert.match(html, /Your GalviScore™ is Ready/);
  assert.match(html, /<h2 class="center">Your GalviScore™<\/h2>/);
  assert.doesNotMatch(html, /Built from your GalviTriage data using rules-first GalviEngine logic/);
  assert.match(html, /function topThreePriorityText\(result\)/);
  assert.match(html, /\.slice\(0,3\)/);
  assert.match(html, /updatePersistentGalviScore/);
});

test('Day 7A approved product progression copy is present', () => {
  assert.match(html, /GalviScore™ shows where your business stands\. GalviShot™ helps you understand/);
  assert.match(html, /GalviShot™ explains why your business is showing these symptoms\. GalviSight™ turns those findings into clear actions/);
  assert.match(html, /GalviSight™ shows what actions deserve your attention\. GalviPath™ organizes those actions into a focused 90 day path/);
  assert.match(html, /GalviPath™ turns your GalviCare™ findings into a focused 90 day plan/);
  assert.match(html, /Your GalviPath™ gives you a clear direction for the next 90 days\. GalviClinic™ gives you dedicated support/);
});

test('Day 7A confidence and evidence presentation are customer readable without changing Worker authority', () => {
  assert.match(html, /function confidencePresentation\(value\)/);
  assert.match(html, /label:'Strong'/);
  assert.match(html, /label:'Moderate'/);
  assert.match(html, /label:'Limited'/);
  assert.match(html, /function contextualEvidenceSentence\(value\)/);
  assert.match(html, /function pruneGalviPathInternalSections\(panel\)/);
});

test('Day 7 product print controls remain available after paid products', () => {
  assert.match(html, /id="print-galviscore"/);
  assert.match(html, /id="print-galvishot"/);
  assert.match(html, /id="print-galvisight"/);
  assert.match(html, /Print \/ Save GalviPath™/);
});

test('Day 7A payment-product aliases use one authoritative Worker contract', () => {
  assert.match(worker, /const PAYMENT_PRODUCT_ALIASES = Object\.freeze\(\{/);
  assert.match(worker, /galviscore: 'GalviScore'/);
  assert.match(worker, /galvishot: 'GalviShot'/);
  assert.match(worker, /galvisight: 'GalviSight'/);
  assert.match(worker, /galvipath: 'GalviPath'/);
  const paymentNameFn = block(worker, 'function paymentProductName', 'function stripeCheckoutSessionUrl');
  assert.match(paymentNameFn, /PAYMENT_PRODUCT_ALIASES\[normalized\] \|\| ''/);
});

test('Day 7A health_check exposes a deployment fingerprint and all paid-return products', () => {
  assert.match(worker, /const DAY7A_RUNTIME_MARKER = 'day7a-payment-products-v1';/);
  const day1Handler = block(worker, 'async function handleDay1Action', 'async function handleDay2Action');
  assert.match(day1Handler, /runtime_marker: DAY7A_RUNTIME_MARKER/);
  assert.match(day1Handler, /payment_return_products: Array\.from\(new Set\(Object\.values\(PAYMENT_PRODUCT_ALIASES\)\)\)/);
  assert.match(day1Handler, /payment_return_aliases: PAYMENT_PRODUCT_ALIASES/);
});

test('Day 7 approved GalviClinic destination remains unchanged', () => {
  assert.match(html, /GALVICLINIC_FALLBACK_URL = 'https:\/\/calendly\.com\/galvilpro\/gearupwithgalviclinic\?month=2026-07'/);
});
