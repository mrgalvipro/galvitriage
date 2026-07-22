import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const sessionSource = html.match(/function isValidGalviCareSessionId[\s\S]*?function getAnalyticsSessionId\(\)[\s\S]*?\}/)?.[0];
assert.ok(sessionSource, 'Session continuity helpers must be present in index.html');

function createLocalStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    values() { return Object.fromEntries(store.entries()); }
  };
}

function createSessionContext(seed = {}) {
  const localStorage = createLocalStorage(seed);
  const context = {
    localStorage,
    Date,
    Math,
    Set,
    String,
    GALVICARE_SESSION_STORAGE_KEY: 'galvicare_session_id',
    GALVI_SESSION_STORAGE_KEY: 'galvitriage_session_id',
    GALVI_DAY1_SESSION_STORAGE_KEY: 'galvicare_day1_qa_session_id',
    GALVI_SUBMITTED_STORAGE_KEY: 'galvitriage_session_submitted',
    GALVI_ANALYTICS_STORAGE_KEY: 'galvitriage_analytics_state',
    GALVISCORE_PAYWALL_VIEWED_AT_KEY: 'galviscore_paywall_viewed_at',
    GALVISCORE_LAST_RESULT_KEY: 'galviscore_last_result'
  };
  vm.runInNewContext(`${sessionSource}\nObject.assign(globalThis,{isValidGalviCareSessionId,persistSessionId,getStoredSessionId,getOrCreateSessionId,startNewGalviCareAssessment,getAnalyticsSessionId});`, context);
  return context;
}

function sessionValues(ctx) {
  const values = ctx.localStorage.values();
  return [values.galvicare_session_id, values.galvitriage_session_id, values.galvicare_day1_qa_session_id];
}

test('valid stored session is reused even after GalviTriage submission', () => {
  const ctx = createSessionContext({
    galvicare_session_id: 'gt_existing_123',
    galvitriage_session_submitted: 'true'
  });
  assert.equal(ctx.getOrCreateSessionId(), 'gt_existing_123');
  assert.deepEqual(sessionValues(ctx), ['gt_existing_123', 'gt_existing_123', 'gt_existing_123']);
});

test('drift across session keys is repaired from the first valid stored session', () => {
  const ctx = createSessionContext({
    galvicare_session_id: 'PASTE_SESSION_ID_HERE',
    galvitriage_session_id: 'gt_canonical_456',
    galvicare_day1_qa_session_id: 'gt_drift_789'
  });
  assert.equal(ctx.getStoredSessionId(), 'gt_canonical_456');
  assert.deepEqual(sessionValues(ctx), ['gt_canonical_456', 'gt_canonical_456', 'gt_canonical_456']);
});

test('placeholder and malformed sessions are rejected', () => {
  const ctx = createSessionContext();
  for (const value of ['PASTE_SESSION_ID_HERE', 'ACTUAL_SESSION_ID', 'YOUR_SESSION_ID', 'undefined', 'null', '', null, undefined, 'abc_123', 'gt bad', 'gt_']) {
    assert.equal(ctx.isValidGalviCareSessionId(value), false, `${value} should be invalid`);
  }
  assert.throws(() => ctx.persistSessionId('YOUR_SESSION_ID'), /Invalid GalviCare session ID/);
});

test('submit_triage response session ID becomes canonical before submission is marked complete', () => {
  assert.match(html, /const canonicalSessionId\s*=\s*persistSessionId\(workerResult\.session_id \|\| payload\.session\.session_id\)/);
  assert.ok(html.indexOf('const canonicalSessionId = persistSessionId(workerResult.session_id || payload.session.session_id);') < html.indexOf("localStorage.setItem(GALVI_SUBMITTED_STORAGE_KEY, 'true');"));
  assert.match(html, /score\.session_id\s*=\s*canonicalSessionId/);
});

test('analytics does not create a replacement session after submission', () => {
  const ctx = createSessionContext({ galvitriage_session_submitted: 'true' });
  assert.equal(ctx.getAnalyticsSessionId(), '');
  assert.equal(ctx.localStorage.getItem('galvicare_session_id'), null);
  assert.match(html, /function trackGalviEvent[\s\S]*session_id:getAnalyticsSessionId\(\)/);
  assert.match(html, /function fireGalviEvent[\s\S]*galvicare_session_id:params\.session_id\|\|getAnalyticsSessionId\(\)/);
});

test('GalviShot uses upstream canonical session and does not create one', () => {
  assert.match(html, /function sessionId\(\)\{ const upstreamSessionId=getStoredSessionId\(\); if\(!upstreamSessionId\) throw new Error\('GalviShot requires a valid upstream GalviCare session/);
  assert.doesNotMatch(html, /function sessionId\(\)\{[\s\S]*getOrCreateSessionId\(/);
  assert.match(html, /callGalviCareApi\(\{ action, session_id: sessionId\(\), current_stage: 'GalviShot'/);
});

test('GalviSight handoff retains the same canonical session path', () => {
  assert.match(html, /el\('continue-galvisight'\)[\s\S]*setShotStage\('GalviSight Handoff'\)/);
  assert.match(html, /function setShotStage\(stage\)[\s\S]*updateJourneyStage\(sessionId\(\), stage\)/);
});

test('startNewGalviCareAssessment is the only explicit replacement operation', () => {
  const ctx = createSessionContext({
    galvicare_session_id: 'gt_prior_123',
    galvitriage_session_id: 'gt_prior_123',
    galvicare_day1_qa_session_id: 'gt_prior_123',
    galvitriage_session_submitted: 'true',
    galvicare_current_stage: 'GalviShot Result',
    galviscore_last_result: '{"session_id":"gt_prior_123"}'
  });
  const next = ctx.startNewGalviCareAssessment();
  assert.equal(ctx.isValidGalviCareSessionId(next), true);
  assert.notEqual(next, 'gt_prior_123');
  assert.deepEqual(sessionValues(ctx), [next, next, next]);
  assert.equal(ctx.localStorage.getItem('galvitriage_session_submitted'), 'false');
  assert.equal(ctx.localStorage.getItem('galviscore_last_result'), null);
  assert.equal((html.match(/startNewGalviCareAssessment\(/g) || []).length, 1);
});

test('complete simulated journey uses exactly one session ID', () => {
  const ctx = createSessionContext();
  const triage = ctx.getOrCreateSessionId();
  ctx.persistSessionId(triage);
  ctx.localStorage.setItem('galvitriage_session_submitted', 'true');
  const vitals = ctx.getStoredSessionId();
  const scorePaywall = ctx.persistSessionId(vitals);
  const scoreResult = ctx.getStoredSessionId();
  const shotPaywall = ctx.getStoredSessionId();
  const shotResult = ctx.getStoredSessionId();
  const sight = ctx.getStoredSessionId();
  assert.equal(new Set([triage, vitals, scorePaywall, scoreResult, shotPaywall, shotResult, sight]).size, 1);
});

test('index.html does not expose QA secrets, D1 identifiers, or proprietary deterministic logic', () => {
  for (const forbidden of ['GalviShot-QA-', 'YOUR_QA_OVERRIDE_SECRET', 'D1_DATABASE_ID', 'CLOUDFLARE_ACCOUNT_ID', 'DIMENSION_WEIGHTS', 'GALVISHOT_RULES_VERSION', 'clinical_findings', 'galvishot_evidence_links', 'evaluateGalviShot(', 'MAKE_GALVISHOT_WEBHOOK_URL']) {
    assert.equal(html.includes(forbidden), false, `${forbidden} must not be browser-delivered`);
  }
});
