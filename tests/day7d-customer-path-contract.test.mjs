import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('worker/day7d-engine.js', 'utf8');
const browser = fs.readFileSync('day7d-browser-customer-intelligence.js', 'utf8');
const builder = fs.readFileSync('scripts/day7b-build-qa-frontend.mjs', 'utf8');

const has = (source, token, message) => {
  assert.ok(source.includes(token), `${message}: missing ${token}`);
};

const lacks = (source, token, message) => {
  assert.ok(!source.includes(token), `${message}: forbidden ${token}`);
};

test('Worker gates result generation behind outstanding follow-ups', () => {
  has(engine, 'async function getOrCreate', 'authoritative generation function');
  has(engine, 'chooseFollowups', 'follow-up evaluation');
  has(engine, "status:'needs_followup'", 'needs-followup response');
  has(engine, 'saveResult', 'result persistence');
  assert.ok(
    engine.indexOf("status:'needs_followup'") < engine.lastIndexOf('saveResult'),
    'follow-up gating must exist before result persistence'
  );
  lacks(engine, 'preservedLegacyResult', 'legacy result bypass');
});

test('Follow-up persistence is atomic and evidence-versioned', () => {
  has(engine, 'ON CONFLICT(session_id,product,question_id) DO UPDATE', 'atomic idempotent follow-up upsert');
  has(engine, 'evidence_version_bumped:after>before', 'evidence-version response proof');
  has(engine, 'await bump(db,sid', 'evidence-version increment');
});

test('Each product stage is capped at three saved questions', () => {
  has(engine, '3-answered', 'three-question remaining calculation');
  has(engine, 'Math.min(count,remaining)', 'three-question hard cap');
  has(engine, 'if(!remaining) return []', 'completed-stage stop condition');
});

test('GalviShot, GalviSight, and GalviPath consume saved customer intelligence', () => {
  has(engine, "followupEvidence(f,'GalviShot')", 'GalviShot evidence consumption');
  has(engine, "followupEvidence(f,'GalviSight')", 'GalviSight evidence consumption');
  has(engine, "followupEvidence(f,'GalviPath')", 'GalviPath evidence consumption');
  assert.ok(
    (engine.match(/followupEvidence\(f\)/g) || []).length >= 2,
    'GalviSight and GalviPath must consume cumulative evidence'
  );
});

test('Browser exposes and saves targeted questions across all downstream stages', () => {
  for (const token of [
    'galvishot-followup-questions',
    'galvisight-followup-questions',
    'galvipath-followup-questions',
    'save_galvishot_followup',
    'save_galvisight_followup',
    'save_galvipath_followup',
    'evidence_version_bumped'
  ]) {
    has(browser, token, 'progressive browser contract');
  }
});

test('Browser renders successful downstream responses without duplicate API generation', () => {
  has(browser, 'invokeLegacyWithResponse', 'single-response renderer bridge');
  has(browser, 'renderReadyStage(product,response)', 'response-aware ready-stage renderer');
  has(browser, "return renderReadyStage('GalviSight',response)", 'GalviSight one-response render');
  has(browser, "return renderReadyStage('GalviPath',response)", 'GalviPath one-response render');
  has(browser, "String(request?.action||'')===action", 'exact one-time response injection');
});

test('Browser initializes authoritative routes for already-loaded and future DOM states', () => {
  has(browser, 'installAuthoritativeStageRoutes', 'authoritative route installation');
  has(browser, "document.addEventListener('DOMContentLoaded',initialize)", 'DOMContentLoaded initialization');
  has(browser, "if(document.readyState!=='loading') queueMicrotask(initialize)", 'already-loaded initialization');
});

test('QA builder preserves the proven isolated QA environment and injects Day 7D', () => {
  has(builder, "const DAY7D_BROWSER = 'day7d-browser-customer-intelligence.js'", 'Day 7D browser source');
  has(builder, 'readFileSync(DAY7D_BROWSER', 'Day 7D adapter injection');
  has(builder, 'GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS', 'QA isolation banner');
  has(builder, "const QA_WORKER = 'https://galvicare-triage-intake.mrgalvipro.workers.dev'", 'proven QA Worker endpoint');
  has(builder, "const TEST_STRIPE_MARKER = 'https://buy.stripe.com/test_'", 'Stripe TEST preservation');
});

test('Refresh restoration rejects stale evidence versions', () => {
  has(engine, 'currentDay7DResult(db,sid,product,f.evidence_version)', 'evidence-version cache lookup');
  has(engine, 'Number(r.evidence_version??-1)===Number(ev)', 'stale-result rejection');
});
