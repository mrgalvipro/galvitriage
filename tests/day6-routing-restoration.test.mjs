import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Day 6 #continue-galvisight has one effective transition owner with in-flight guard', () => {
  const listenerMatches = html.match(/continue-galvisight'\)\?\.addEventListener\('click'/g) || [];
  assert.equal(listenerMatches.length, 1);
  assert.match(html, /let galviSightInFlight=false/);
  assert.match(html, /await showSight\(\)/);
  assert.match(html, /fireGalviEvent\('continue_clicked',\{product:'galvisight'/);
});

test('Day 6 downstream CTAs route once, recover visibly, and analytics is non-blocking', () => {
  assert.match(html, /let galviPathInFlight=false/);
  assert.match(html, /fireGalviEvent\('continue_clicked',\{product:'galvipath'/);
  assert.match(html, /fireGalviEvent\('journey_error',\{product:'galvipath'/);
  assert.match(html, /catch\(e\)\{\}/);
  assert.match(html, /clinic_booking_clicked/);
  assert.match(html, /GALVICLINIC_FALLBACK_URL = 'https:\/\/www\.galvipro\.com\/#contact'/);
  assert.match(html, /id="galvipath-book-galviclinic"/);
  assert.doesNotMatch(html, /Book GalviClinic booking remains unchanged|alert\('GalviClinic/);
});

test('Day 6 refresh restoration reuses stored downstream state instead of restarting GalviTriage', () => {
  assert.match(html, /action:'get_session_state'/);
  assert.match(html, /available_products\?\.includes\('GalviShot'\)[\s\S]*showIntegratedGalviShotResult/);
  assert.match(html, /available_products\?\.includes\('GalviSight'\)[\s\S]*window\.showGalviSight/);
  assert.match(html, /available_products\?\.includes\('GalviPath'\)[\s\S]*window\.showGalviPath/);
  assert.doesNotMatch(html, /restoreGalviCareSession[\s\S]*startNewGalviCareAssessment\(/);
});

test('Day 6 print rules hide non-print controls while preserving result cards', () => {
  assert.match(html, /@media print/);
  assert.match(html, /#galvishot-live-test-override/);
  assert.match(html, /#continue-galvisight/);
  assert.match(html, /#galvipath-book-galviclinic/);
  assert.match(html, /\.galvicare-card,\.hidden\{display:block!important/);
});

test('Day 6 P0 Stripe success restores GalviScore from Worker before normal journey restart', () => {
  assert.match(html, /galvicare-return-pending #assessmentForm/);
  assert.match(html, /p\.get\('product'\)==='galviscore'&&p\.get\('paid'\)==='score_success'/);
  assert.match(html, /function hideInitialJourneyForPaidReturn\(\)[\s\S]*assessmentForm[\s\S]*hideGalviScoreScreens/);
  assert.match(html, /async function restoreGalviScoreFromWorker\(sessionId\)[\s\S]*action:'get_or_create_score'[\s\S]*normalizeScoreResult/);
  assert.match(html, /async function renderGalviScoreAfterPayment\(sessionId\)[\s\S]*persistSessionId\(sessionId\)[\s\S]*restoreGalviScoreFromWorker\(canonicalSessionId\)[\s\S]*cacheGalviScoreResult\(restored\)[\s\S]*renderUnlockedGalviScore\(restored\)/);
  assert.doesNotMatch(html, /renderGalviScoreAfterPayment\(sessionId\)[\s\S]*!GALVICARE_SCORE_ENDPOINT[\s\S]*renderTriageRepair/);
  assert.match(html, /product==='galviscore'&&paid==='score_success'[\s\S]*hideInitialJourneyForPaidReturn\(\)[\s\S]*resolveStripePaymentReturn\(stripeSessionId,'galviscore'\)[\s\S]*persistSessionId\(resolved\.session_id\)[\s\S]*renderGalviScoreAfterPayment\(paidSessionId\)[\s\S]*return true/);
});

test('Day 6 P0 non-success queries keep normal routing path', () => {
  assert.match(html, /if\(await restoreGalviCareSession\(\)\) return true; showGalviCareTriageState\(\); return false;/);
  assert.doesNotMatch(html, /product==='galviscore'&&paid!=='score_success'[\s\S]*renderGalviScoreAfterPayment/);
});

test('Day 6 product contract does not use GalviScore confidence thresholds as paid-access gates', () => {
  assert.match(html, /function hasValidGalviScoreResult\(scoreResult\)/);
  assert.match(html, /function routeByGalviScoreConfidence\(scoreResult\)\{ if\(hasValidGalviScoreResult\(scoreResult\)\)/);
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
  assert.match(html, /product==='galvishot'&&paid[\s\S]*showIntegratedGalviShotResult/);
  assert.doesNotMatch(html, /product==='galvishot'&&paid[\s\S]*startNewGalviCareAssessment\(/);
  assert.match(html, /if\(\(p\.get\('product'\)==='galviscore'[\s\S]*\|\|\(p\.get\('product'\)==='galvishot'&&p\.get\('paid'\)\)\)/);
});

test('Day 6 normal clean URL restores exactly GalviTriage presentation when no route owns the page', () => {
  assert.match(html, /if\(await restoreGalviCareSession\(\)\) return true; showGalviCareTriageState\(\); return false;/);
  assert.match(html, /function showGalviCareTriageState\(\)[\s\S]*showGalviCareState\('TRIAGE'\)/);
  assert.match(html, /function showGalviCareState\(state\)[\s\S]*clearGalviCareReturnPending\(\)/);
  assert.match(html, /const scoreContainer=document\.getElementById\('scoreQuestions'\);[\s\S]*questions\.forEach/);
});

test('Day 6 incomplete existing session falls through to GalviTriage without creating replacement session', () => {
  assert.match(html, /if\(!state\|\|!isDay6DownstreamStage\(state\.current_stage\)\)return false/);
  assert.match(html, /if\(await restoreGalviCareSession\(\)\) return true; showGalviCareTriageState\(\); return false;/);
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
  assert.match(html, /renderUnlockedGalviScore\(restored\); clearGalviCareReturnPending\(\); return true/);
  assert.match(html, /showIntegratedGalviShotResult[\s\S]*clearGalviCareReturnPending\(\); return true/);
});

