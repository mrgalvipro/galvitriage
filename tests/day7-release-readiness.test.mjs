import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');

function functionBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `Missing start marker: ${startMarker}`);
  assert.notEqual(end, -1, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('Day 7 preserves exact-product entitlement/payment authority', () => {
  const entitlementFn = functionBlock(
    worker,
    'async function hasProductEntitlement',
    'async function storedDay4Result'
  );

  assert.match(
    entitlementFn,
    /SELECT \* FROM entitlements WHERE session_id=\? AND product=\?/
  );
  assert.match(
    entitlementFn,
    /SELECT \* FROM payments WHERE session_id=\? AND product=\?/
  );
  assert.match(
    entitlementFn,
    /acceptedEntitlementStatuses = \['active', 'paid', 'granted', 'test_override'\]/
  );
  assert.match(
    entitlementFn,
    /acceptedPaymentStatuses = \['paid', 'succeeded', 'complete'\]/
  );
});

test('Day 7 permits same-session GalviShot continuity only for GalviSight and GalviPath', () => {
  const entitlementFn = functionBlock(
    worker,
    'async function hasProductEntitlement',
    'async function storedDay4Result'
  );

  assert.match(
    entitlementFn,
    /product === 'GalviSight' \|\| product === 'GalviPath'/
  );

  const shotProductReferences = entitlementFn.match(/'GalviShot'/g) || [];
  assert.ok(
    shotProductReferences.length >= 2,
    'Expected GalviShot entitlement and payment continuity checks.'
  );

  assert.doesNotMatch(
    entitlementFn,
    /product === 'GalviScore'/
  );
});

test('Day 7 retains QA override and unauthorized downstream HTTP 402', () => {
  const day4Handler = functionBlock(
    worker,
    'async function handleDay4Action',
    'async function handleDiagnosticAction'
  );

  assert.match(
    day4Handler,
    /hasProductEntitlement\(db, sid, product\) \|\| hasQaOverride\(env, payload\)/
  );
  assert.match(
    day4Handler,
    /if \(!entitled\) return jsonResponse\([\s\S]*payment_required:true[\s\S]*402, env\)/
  );
});

test('Day 7 canonical customer URL is the approved GalviPro GalviTriage route', () => {
  assert.match(
    html,
    /const GALVICARE_CANONICAL_CUSTOMER_URL = 'https:\/\/www\.galvipro\.com\/#galvitriage';/
  );
});

test('Day 7 paid-return URL cleanup avoids cross-origin history.replaceState', () => {
  const cleanup = functionBlock(
    html,
    'function cleanPaidReturnCustomerUrl',
    'function galviCareStateIds'
  );

  assert.match(
    cleanup,
    /window\.location\.origin===canonical\.origin/
  );
  assert.match(
    cleanup,
    /window\.history\.replaceState/
  );
  assert.match(
    cleanup,
    /window\.top\.location\.replace\(GALVICARE_CANONICAL_CUSTOMER_URL\)/
  );
  assert.match(
    cleanup,
    /window\.location\.replace\(GALVICARE_CANONICAL_CUSTOMER_URL\)/
  );
});

test('Day 7 GalviShot paid-return cleanup occurs only after verification, session persistence, and render', () => {
  const route = functionBlock(
    html,
    "if(product==='galvishot'&&paid==='shot_success')",
    "if(product==='galviscore'&&paid==='score_success')"
  );

  const resolveIndex = route.indexOf(
    "resolveStripePaymentReturn(stripeSessionId,'galvishot')"
  );
  const persistIndex = route.indexOf(
    'persistSessionId(resolved.session_id)'
  );
  const renderIndex = route.indexOf(
    'showIntegratedGalviShotResult'
  );
  const cleanupIndex = route.indexOf(
    'cleanPaidReturnCustomerUrl()'
  );

  assert.ok(resolveIndex >= 0);
  assert.ok(persistIndex > resolveIndex);
  assert.ok(renderIndex > persistIndex);
  assert.ok(cleanupIndex > renderIndex);
});

test('Day 7 GalviScore paid-return cleanup occurs only after verification, session persistence, and successful render', () => {
  const route = functionBlock(
    html,
    "if(product==='galviscore'&&paid==='score_success')",
    "if(product==='galvisight'&&paid"
  );

  const resolveIndex = route.indexOf(
    "resolveStripePaymentReturn(stripeSessionId,'galviscore')"
  );
  const persistIndex = route.indexOf(
    'persistSessionId(resolved.session_id)'
  );
  const renderIndex = route.indexOf(
    'renderGalviScoreAfterPayment(paidSessionId)'
  );
  const renderCheckIndex = route.indexOf(
    "if(rendered===false)"
  );
  const cleanupIndex = route.indexOf(
    'cleanPaidReturnCustomerUrl()'
  );

  assert.ok(resolveIndex >= 0);
  assert.ok(persistIndex > resolveIndex);
  assert.ok(renderIndex > persistIndex);
  assert.ok(renderCheckIndex > renderIndex);
  assert.ok(cleanupIndex > renderCheckIndex);
});

test('Day 7 failure paths retain visible payment recovery and do not perform cleanup', () => {
  const route = functionBlock(
    html,
    'async function routeGalviCareOnLoad',
    'function hasValidGalviScoreResult'
  );

  const catches = route.match(
    /catch\(error\)\{[\s\S]*?showPaymentSessionRecoveryError[\s\S]*?return true;[\s\S]*?\}/g
  ) || [];

  assert.ok(catches.length >= 2);
  for (const catchBlock of catches) {
    assert.doesNotMatch(catchBlock, /cleanPaidReturnCustomerUrl/);
  }
});

test('Day 7 preserves approved GalviClinic destination and rejects obsolete contact fallback', () => {
  assert.match(
    html,
    /const GALVICLINIC_FALLBACK_URL = 'https:\/\/calendly\.com\/galvilpro\/gearupwithgalviclinic\?month=2026-07';/
  );

  assert.doesNotMatch(
    html,
    /GALVICLINIC_FALLBACK_URL = 'https:\/\/www\.galvipro\.com\/#contact'/
  );

  assert.match(
    html,
    /window\.open\(GALVICLINIC_FALLBACK_URL,'_blank','noopener'\)/
  );
});
