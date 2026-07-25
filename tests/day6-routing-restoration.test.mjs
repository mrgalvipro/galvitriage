import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Day 6 #continue-galvisight has one effective transition owner with in-flight guard', () => {
  const listenerMatches = html.match(/continue-galvisight'\)\?\.addEventListener\('click'/g) || [];
  assert.equal(listenerMatches.length, 1);
  assert.match(html, /let galviSightInFlight=false/);
  assert.match(html, /showGalviSightPaywall\(\)/);
  assert.match(html, /fireGalviEvent\('continue_clicked',\{product:'galvisight'/);
});

test('Day 6 downstream CTAs route once, recover visibly, and analytics is non-blocking', () => {
  assert.match(html, /let galviPathInFlight=false/);
  assert.match(html, /showGalviPathPaywall\(\)/);
  assert.match(html, /fireGalviEvent\('continue_clicked',\{product:'galvipath'/);
  assert.match(html, /fireGalviEvent\('journey_error',\{product:'galvipath'/);
  assert.match(html, /catch\(e\)\{\}/);
  assert.match(html, /clinic_booking_clicked/);
  assert.match(html, /GALVICLINIC_FALLBACK_URL = 'https:\/\/calendly\.com\/galvilpro\/gearupwithgalviclinic\?month=2026-07'/);
  assert.match(html, /id="galvipath-book-galviclinic"/);
  assert.doesNotMatch(html, /Book GalviClinic booking remains unchanged|alert\('GalviClinic/);
});

test('Day 6 refresh restoration reuses only stored and entitled downstream state instead of restarting GalviTriage', () => {
  assert.match(html, /action:'get_session_state'/);
  assert.match(html, /available\.includes\('GalviShot'\)&&entitled\.includes\('GalviShot'\)[\s\S]*showIntegratedGalviShotResult/);
  assert.match(html, /available\.includes\('GalviSight'\)&&entitled\.includes\('GalviSight'\)[\s\S]*window\.showGalviSight/);
  assert.match(html, /available\.includes\('GalviPath'\)&&entitled\.includes\('GalviPath'\)[\s\S]*window\.showGalviPath/);
  assert.doesNotMatch(html, /restoreGalviCareSession[\s\S]*startNewGalviCareAssessment\(/);
});

test('Day 6 print rules are product scoped and never globally reveal hidden application states', () => {
  assert.match(html, /@media print/);
  assert.match(html, /body\.print-galviscore #galviscore-result/);
  assert.match(html, /body\.print-galvishot #galvishot-result/);
  assert.match(html, /body\.print-galvisight #galvisight-handoff/);
  assert.match(html, /body\.print-galvipath #galvipath-result/);
  assert.doesNotMatch(html, /\.galvicare-card,\.hidden\{display:block!important/);
  assert.doesNotMatch(html, /\.hidden\{display:block!important/);
});

test('Day 6 P0 Stripe success restores GalviScore from Worker before normal journey restart', () => {
  assert.match(html, /galvicare-return-pending #assessmentForm/);
  assert.match(html, /product==='galviscore'&&paid==='score_success'/);
  assert.match(html, /function hideInitialJourneyForPaidReturn\(\)/);
  assert.match(html, /async function restoreGalviScoreFromWorker\(sessionId\)[\s\S]*action:'get_or_create_score'[\s\S]*normalizeScoreResult/);
  assert.match(html, /async function renderGalviScoreAfterPayment\(sessionId\)[\s\S]*persistSessionId\(sessionId\)[\s\S]*restoreGalviScoreFromWorker\(canonicalSessionId\)[\s\S]*cacheGalviScoreResult\(restored\)[\s\S]*renderUnlockedGalviScore\(restored\)/);
  assert.match(html, /product==='galviscore'&&paid==='score_success'[\s\S]*resolveStripePaymentReturn\(stripeSessionId,'galviscore'\)[\s\S]*persistSessionId\(resolved\.session_id\)[\s\S]*renderGalviScoreAfterPayment\(paidSessionId\)/);
});

test('Day 6 P0 non-success queries keep normal routing path', () => {
  assert.match(html, /if\(await restoreGalviCareSession\(\)\) return true;\s*showGalviCareTriageState\(\);\s*return false;/);
  assert.doesNotMatch(html, /product==='galviscore'&&paid!=='score_success'[\s\S]*renderGalviScoreAfterPayment/);
});

test('Day 6 product contract does not use GalviScore confidence thresholds as paid-access gates', () => {
  assert.match(html, /function hasValidGalviScoreResult\(scoreResult\)/);
  assert.match(html, /function routeByGalviScoreConfidence\(scoreResult\)/);
  assert.doesNotMatch(html, /function routeByGalviScoreConfidence\(scoreResult\)[\s\S]*confidence>=70[\s\S]*confidence>=60/);
  assert.doesNotMatch(html, /minimum threshold for a paid GalviScore result/);
});

test('Day 6 QA override no longer falsifies GalviScore confidence', () => {
  assert.doesNotMatch(html, /galviscore_confidence\s*=\s*Math\.max\(80/);
  assert.match(html, /payment_galviscore = 'test_override'/);
  assert.match(html, /renderUnlockedGalviScore\(cached\)/);
});

test('Day 6 complete low, mid, and high GalviScores are valid renderable results', () => {
  for (const score of [20, 55, 90]) {
    const payload = `galviscore_score:${score},galviscore_confidence:100`;
    assert.match(`function routeByGalviScoreConfidence(scoreResult){ if(hasValidGalviScoreResult(scoreResult)){ renderUnlockedGalviScore(scoreResult); return'result'; } } ${payload}`, /hasValidGalviScoreResult/);
  }
  assert.match(html, /galviscore-score/);
  assert.match(html, /document\.getElementById\('galviscore-score'\)\.textContent=result\.galviscore_score/);
});

test('Day 6 GalviShot paid return restores result path instead of restarting triage', () => {
  const start = html.indexOf("if(product==='galvishot'&&paid==='shot_success')");
  const end = html.indexOf("if(product==='galviscore'&&paid==='score_success')", start);
  assert.ok(start >= 0 && end > start);
  const route = html.slice(start, end);
  assert.match(route, /showIntegratedGalviShotResult/);
  assert.doesNotMatch(route, /startNewGalviCareAssessment\(/);
});

test('Day 6 normal clean URL restores exactly GalviTriage presentation when no route owns the page', () => {
  assert.match(html, /if\(await restoreGalviCareSession\(\)\) return true;\s*showGalviCareTriageState\(\);\s*return false;/);
  assert.match(html, /function showGalviCareTriageState\(\)[\s\S]*showGalviCareState\('TRIAGE'\)/);
  assert.match(html, /function showGalviCareState\(state\)[\s\S]*clearGalviCareReturnPending\(\)/);
  assert.match(html, /const scoreContainer=document\.getElementById\('scoreQuestions'\);[\s\S]*questions\.forEach/);
});

test('Day 6 incomplete or unentitled existing session falls through without replacing the canonical session', () => {
  assert.match(html, /const entitled=Array\.isArray\(state\.entitled_products\)\?state\.entitled_products:\[\]/);
  assert.match(html, /return false;\s*\}\s*catch\(error\)/);
  assert.doesNotMatch(html, /restoreGalviCareSession[\s\S]*startNewGalviCareAssessment\(/);
});

test('Day 6 payment-return resolver failure displays standalone visible recovery and not Triage repair', () => {
  assert.match(html, /id="galvicare-payment-recovery"/);
  assert.match(html, /function showPaymentSessionRecoveryError\(error,sessionId\)[\s\S]*showGalviCareState\('PAYMENT_RECOVERY'\)/);
  assert.match(html, /Retry Payment Restoration/);
  assert.match(html, /Start \/ Return to GalviCare/);
  const paymentRecovery = html.match(/function showPaymentSessionRecoveryError\(error,sessionId\)[\s\S]*?function clearGalviCareReturnPending/)[0];
  assert.doesNotMatch(paymentRecovery, /showGalviCareErrorCard/);
  assert.doesNotMatch(paymentRecovery, /renderTriageRepair/);
});

test('Day 6 payment-return paths clear return-pending after success or visible failure', () => {
  assert.match(html, /function showGalviCareState\(state\)[\s\S]*clearGalviCareReturnPending\(\)/);
  assert.match(html, /renderUnlockedGalviScore\(restored\);\s*clearGalviCareReturnPending\(\);\s*return true/);
  assert.match(html, /showIntegratedGalviShotResult[\s\S]*clearGalviCareReturnPending\(\)/);
});
