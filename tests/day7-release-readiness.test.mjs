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
  const paymentNames = block(worker, 'function paymentProductName', 'function stripeCheckoutSessionUrl');
  assert.match(paymentNames, /galvisight[\s\S]*return 'GalviSight'/);
  assert.match(paymentNames, /galvipath[\s\S]*return 'GalviPath'/);
});

test('Day 7 downstream handler retains QA override and unauthorized HTTP 402', () => {
  const handler = block(worker, 'async function handleDay4Action', 'async function handleDiagnosticAction');
  assert.match(handler, /hasProductEntitlement\(db, sid, product\) \|\| hasQaOverride\(env, payload\)/);
  assert.match(handler, /payment_required:true[\s\S]*402/);
});

test('Day 7 GalviSight commercial paywall is present at $29', () => {
  assert.match(html, /id="galvisight-paywall"/);
  assert.match(html, /Unlock GalviSight™ — \$29/);
  assert.match(html, /id="galvisight-stripe-cta"/);
  assert.match(html, /id="galvisight-qa-override"/);
  assert.match(html, /showGalviSightPaywall\(\)/);
});

test('Day 7 GalviPath commercial paywall is present at $29', () => {
  assert.match(html, /id="galvipath-paywall"/);
  assert.match(html, /Unlock GalviPath™ — \$29/);
  assert.match(html, /id="galvipath-stripe-cta"/);
  assert.match(html, /id="galvipath-qa-override"/);
  assert.match(html, /showGalviPathPaywall\(\)/);
});

test('Day 7 approved GalviSight and GalviPath Stripe TEST links are configured', () => {
  assert.match(
    html,
    /const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https:\/\/buy\.stripe\.com\/test_eVq3cw3R63YT6O6ahE53O03';/
  );
  assert.match(
    html,
    /const GALVIPATH_STRIPE_PAYMENT_LINK = 'https:\/\/buy\.stripe\.com\/test_fZu14ofzO9jd8We1L853O05';/
  );
  assert.doesNotMatch(html, /const GALVISIGHT_STRIPE_PAYMENT_LINK = '';/);
  assert.doesNotMatch(html, /const GALVIPATH_STRIPE_PAYMENT_LINK = '';/);
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

test('Day 7 print architecture is product scoped and does not reveal all hidden states', () => {
  assert.match(html, /body\.print-galviscore #galviscore-result/);
  assert.match(html, /body\.print-galvishot #galvishot-result/);
  assert.match(html, /body\.print-galvisight #galvisight-handoff/);
  assert.match(html, /body\.print-galvipath #galvipath-result/);
  assert.match(html, /function printGalviCareReport\(product\)/);
  assert.match(html, /afterprint/);
  assert.doesNotMatch(html, /\.galvicare-card,\.hidden\{display:block!important/);
});

test('Day 7 product print controls are present', () => {
  assert.match(html, /id="print-galviscore"/);
  assert.match(html, /id="print-galvishot"/);
  assert.match(html, /id="print-galvisight"/);
  assert.match(html, /Print \/ Save GalviPath/);
});

test('Day 7 approved GalviClinic destination remains unchanged', () => {
  assert.match(html, /GALVICLINIC_FALLBACK_URL = 'https:\/\/calendly\.com\/galvilpro\/gearupwithgalviclinic\?month=2026-07'/);
});
