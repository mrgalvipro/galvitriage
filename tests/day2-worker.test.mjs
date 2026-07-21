import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/worker.js';
import fixture from '../fixtures/known_good_session_day2.json' with { type: 'json' };
import { readFileSync } from 'node:fs';

class MockStmt {
  constructor(db, sql) { this.db = db; this.sql = sql; this.params = []; }
  bind(...params) { this.params = params; return this; }
  async run() { return this.db.run(this.sql, this.params); }
  async first() { return this.db.first(this.sql, this.params); }
  async all() { return { results: this.db.all(this.sql, this.params) }; }
}
class MockD1 {
  constructor() { this.sessions = new Map(); this.responses = new Map(); this.results = new Map(); this.events = []; this.findings = new Map(); this.followups = new Map(); this.entitlements = new Map(); this.payments = new Map(); this.founders = new Map(); this.ventures = new Map(); }
  prepare(sql) { return new MockStmt(this, sql); }
  async run(sql, p) {
    if (sql.includes('INSERT INTO sessions')) { this.sessions.set(p[0], { session_id:p[0], current_stage:p[1], status:p[2], source:p[3], utm_source:p[4], utm_campaign:p[5], created_at:p[6], updated_at:p[7], last_seen_at:p[8] }); return { success:true }; }
    if (sql.includes('INSERT OR IGNORE INTO founders')) { if (![...this.founders.values()].some(x => x.email === p[4])) this.founders.set(p[0], { founder_id:p[0], session_id:p[1], email:p[4] }); return { success:true }; }
    if (sql.includes('INSERT INTO ventures')) { this.ventures.set(p[0], { venture_id:p[0], session_id:p[1], founder_id:p[2], venture_name:p[3] }); return { success:true }; }
    if (sql.includes('INSERT INTO assessment_responses')) { this.responses.set(`${p[1]}:${p[2]}:${p[3]}`, { response_id:p[0], session_id:p[1], product:p[2], question_id:p[3], dimension:p[4], answer_number:p[5], rules_version:p[6] }); return { success:true }; }
    if (sql.includes('INSERT INTO journey_events')) { this.events.push({ event_id:p[0], session_id:p[1], event_name:p[2], product:p[3], current_stage:p[4], event_json:p[5], created_at:p[6] }); return { success:true }; }
    if (sql.includes('INSERT INTO product_results')) { if (sql.includes('DO NOTHING') && this.results.has(`${p[1]}:${p[2]}`)) return { success:true }; this.results.set(`${p[1]}:${p[2]}`, { result_id:p[0], session_id:p[1], product:p[2], status:p[3], confidence:p[4], confidence_band:p[5], result_json:p[6], generation_source:p[7], rules_version:p[8], content_version:p[9] }); return { success:true }; }
    if (sql.includes('INSERT INTO clinical_followups')) { this.followups.set(`${p[1]}:${p[3]}:${p[5]}`, { followup_id:p[0], session_id:p[1], current_stage:p[2], product:p[3], question_id:p[5], question_text:p[6], answer:p[7], confidence_impact:p[8] }); return { success:true }; }
    if (sql.includes('INSERT INTO clinical_findings')) { this.findings.set(`${p[1]}:${p[2]}:${p[3]}`, { finding_id:p[0], session_id:p[1], product:p[2], finding_code:p[3], finding_text:p[4], evidence_ids_json:p[5] }); return { success:true }; }
    throw new Error(`Unhandled SQL run: ${sql}`);
  }
  async first(sql, p) {
    if (sql.includes('FROM product_results')) return this.results.get(`${p[0]}:${p[1]}`) || null;
    if (sql.includes('FROM entitlements')) return this.entitlements.get(`${p[0]}:${p[1]}`) || null;
    if (sql.includes('FROM payments')) return this.payments.get(`${p[0]}:${p[1]}`) || null;
    if (sql.includes('FROM sessions')) return this.sessions.get(p[0]) || null;
    throw new Error(`Unhandled SQL first: ${sql}`);
  }
  all(sql, p) {
    if (sql.includes('FROM assessment_responses')) return [...this.responses.values()].filter(x => x.session_id === p[0] && x.product === 'GalviTriage').sort((a,b) => a.question_id.localeCompare(b.question_id));
    if (sql.includes('FROM clinical_followups')) return [...this.followups.values()].filter(x => x.session_id === p[0] && x.product === p[1]).sort((a,b) => a.question_id.localeCompare(b.question_id));
    throw new Error(`Unhandled SQL all: ${sql}`);
  }
}
function req(path, body, method = 'POST') { return new Request(`https://worker.test${path}`, { method, headers: { 'Content-Type':'application/json' }, body: body ? JSON.stringify(body) : undefined }); }
async function json(response) { return response.json(); }
function payload(overrides = {}) { return { action:'submit_triage', session:{ session_id: fixture.session_id, source:'test' }, founder:{ ...fixture.founder, consent:true }, venture:{ venture_name:fixture.venture.venture_name, organization_stage:fixture.venture.organization_stage, organization_type:fixture.venture.organization_type, industry:fixture.venture.industry, revenue_range:fixture.venture.revenue_range, team_size:fixture.venture.team_size }, priority:{ highest_impact_area:fixture.venture.highest_impact_area }, open_text:{ biggest_challenge:fixture.venture.biggest_challenge, one_30_day_problem:'One focused customer acquisition test.' }, scored_answers: fixture.answers, ...overrides }; }
function env() { return { DB:new MockD1(), D1_FOUNDATION_ENABLED:'true' }; }

async function withBlockedFetch(fn) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected outbound fetch in test'); };
  try { return await fn(); } finally { globalThis.fetch = originalFetch; }
}

test('Day 1 /api route regression uses D1 handlers', async () => withBlockedFetch(async () => {
  const e = env();
  let res = await worker.fetch(new Request('https://worker.test/api', { method:'OPTIONS' }), e);
  assert.equal(res.status, 204);
  res = await worker.fetch(req('/api', { action:'health_check' }), e);
  assert.equal(res.status, 200);
  assert.equal((await json(res)).success, true);
  res = await worker.fetch(req('/api', { action:'create_or_resume_session', session_id:'gt_test', current_stage:'QA' }), e);
  assert.equal((await json(res)).session_id, 'gt_test');
  res = await worker.fetch(req('/api', { action:'journey_event', session_id:'gt_test', event_name:'unit_event', product:'GalviCare' }), e);
  assert.equal((await json(res)).success, true);
  res = await worker.fetch(req('/api', { action:'get_fixture_result', session_id:'gt_test', product:'GalviVitals' }), e);
  assert.equal((await json(res)).fixture, true);
}));

test('Day 2 deterministic actions reject invalid payloads safely', async () => withBlockedFetch(async () => {
  const e = env();
  const res = await worker.fetch(req('/api', payload({ scored_answers:{ ...fixture.answers, q01_business_clarity: 6 } })), e);
  const body = await json(res);
  assert.equal(res.status, 422);
  assert.equal(body.success, false);
  assert.deepEqual(body.invalid_questions, ['q01_business_clarity']);
}));

test('Day 2 submit stores triage, vitals, and score without outbound fetch', async () => withBlockedFetch(async () => {
  const e = env();
  const res = await worker.fetch(req('/api', payload()), e);
  const submitted = await json(res);
  assert.equal(res.status, 200);
  assert.equal(submitted.success, true);
  assert.equal(submitted.vitals.product, 'GalviVitals');
  assert.equal(submitted.score.product, 'GalviScore');
  assert.equal(submitted.score.rules_version, 'galviengine_score_v0_5_1');
  assert.equal(submitted.score.confidence, 100);
  assert.equal(e.DB.sessions.size, 1);
  assert.equal(e.DB.responses.size, 20);
  assert.equal(e.DB.results.size, 2);
}));

test('Day 2 duplicate submission is idempotent and prevents duplicate stored results', async () => withBlockedFetch(async () => {
  const e = env();
  let res = await worker.fetch(req('/api', payload()), e);
  assert.equal(res.status, 200);
  res = await worker.fetch(req('/api', payload()), e);
  assert.equal(res.status, 200);
  assert.equal(e.DB.sessions.size, 1);
  assert.equal(e.DB.responses.size, 20);
  assert.equal(e.DB.results.size, 2);
}));

test('Day 2 retrieval returns stored triage and product results', async () => withBlockedFetch(async () => {
  const e = env();
  await worker.fetch(req('/api', payload()), e);
  let res = await worker.fetch(req('/api', { action:'get_triage', session_id:fixture.session_id }), e);
  assert.equal((await json(res)).triage.answers.q20_execution_action, 2);
  res = await worker.fetch(req('/api', { action:'get_or_create_vitals', session_id:fixture.session_id }), e);
  assert.equal((await json(res)).stored, true);
  res = await worker.fetch(req('/api', { action:'get_or_create_score', session_id:fixture.session_id }), e);
  assert.equal((await json(res)).result.product, 'GalviScore');
}));

test('Root journey_event keeps legacy GalviSight forwarding and is not merged with /api journey_event', async () => {
  const originalFetch = globalThis.fetch;
  const forwarded = [];
  globalThis.fetch = async (url, init) => {
    forwarded.push({ url:String(url), body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ success:true, product:'GalviSight', action:'journey_event', session_id:'root_sight' }), { status:200, headers:{ 'Content-Type':'application/json' } });
  };
  try {
    const res = await worker.fetch(req('/', { action:'journey_event', session:{ session_id:'root_sight' }, current_stage:'GalviSight Handoff' }), { MAKE_GALVISIGHT_WEBHOOK_URL:'https://make.test/galvisight' });
    const rootJourney = await json(res);
    assert.equal(res.status, 200);
    assert.equal(rootJourney.product, 'GalviSight');
    assert.equal(forwarded.length, 1);
    assert.equal(forwarded[0].url, 'https://make.test/galvisight');
    assert.equal(forwarded[0].body.session.session_id, 'root_sight');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Root legacy intake does not write to mocked D1 when Airtable credentials are absent', async () => withBlockedFetch(async () => {
  const legacyRootEnv = env();
  const originalConsoleError = console.error;
  console.error = () => {};
  let res;
  try {
    res = await worker.fetch(req('/', payload({ action: undefined })), legacyRootEnv);
  } finally {
    console.error = originalConsoleError;
  }
  const legacyRoot = await json(res);
  assert.equal(res.status, 500);
  assert.match(legacyRoot.error, /AIRTABLE_BASE_ID/);
  assert.equal(legacyRootEnv.DB.sessions.size, 0);
}));


test('Browser Day 2 QA path contains no GalviVitals/GalviScore scoring fallback and has governed retry error card', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const forbidden of ['domainWeights','GALVISCORE_WEIGHTS','calculateDerivedScores','calculateGalviScore','normalizeFivePoint','mapRevenueRange','classifyGalviScore','buildGalviScoreDiagnosticFields']) {
    assert.equal(html.includes(forbidden), false, `${forbidden} must not be browser-delivered`);
  }
  assert.equal(html.includes('showGalviCareErrorCard'), true);
  assert.equal(html.includes('retry-galvicare-worker'), true);
  assert.equal(html.includes('Session ID:'), true);
});

test('Worker locks the exact Product Owner approved 20-question key/order/dimension mapping', () => {
  const source = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');
  const approvedDimensions = [
    ['q01_business_clarity', 'business_model'],
    ['q02_stage_signal', 'business_model'],
    ['q03_real_problem', 'problem'],
    ['q04_ideal_customer', 'customer'],
    ['q05_attract_customers', 'distribution'],
    ['q06_customer_conversations', 'distribution'],
    ['q07_predictable_revenue', 'revenue'],
    ['q08_revenue_growth_confidence', 'revenue'],
    ['q09_revenue_driver_clarity', 'revenue'],
    ['q10_customer_satisfaction', 'customer'],
    ['q11_feedback_improvement', 'product'],
    ['q12_organized_operations', 'technology_operations'],
    ['q13_founder_dependency', 'business_model'],
    ['q14_systems_support_growth', 'technology_operations'],
    ['q15_technology_effectiveness', 'technology_operations'],
    ['q16_ai_readiness', 'technology_operations'],
    ['q17_leadership_confidence', 'leadership'],
    ['q18_vision_clarity', 'leadership'],
    ['q19_decision_information', 'leadership'],
    ['q20_execution_action', 'leadership']
  ];
  const matches = [...source.matchAll(/order:\s*(\d+), key:\s*'([^']+)', dimension:\s*'([^']+)'/g)]
    .map(([, order, key, dimension]) => [Number(order), key, dimension]);
  assert.equal(matches.length, 20);
  assert.deepEqual(matches.map(([, key, dimension]) => [key, dimension]), approvedDimensions);
  assert.deepEqual(matches.map(([order]) => order), Array.from({ length: 20 }, (_, index) => index + 1));
});

test('triage_completeness reports complete and incomplete Day 2 intake without outbound fetch', async () => withBlockedFetch(async () => {
  const e = env();
  let res = await worker.fetch(req('/api', { ...payload(), action:'triage_completeness' }), e);
  let body = await json(res);
  assert.equal(res.status, 200);
  assert.equal(body.complete, true);
  assert.equal(body.completion_percent, 100);
  res = await worker.fetch(req('/api', { ...payload({ scored_answers:{ ...fixture.answers, q20_execution_action: undefined } }), action:'triage_completeness' }), e);
  body = await json(res);
  assert.equal(body.complete, false);
  assert.deepEqual(body.missing_questions, ['q20_execution_action']);
}));

test('Root submit_triage remains legacy and isolated from the /api D1 submit handler', async () => withBlockedFetch(async () => {
  const legacyRootEnv = env();
  const originalConsoleError = console.error;
  console.error = () => {};
  let res;
  try {
    res = await worker.fetch(req('/', payload()), legacyRootEnv);
  } finally {
    console.error = originalConsoleError;
  }
  const rootSubmit = await json(res);
  assert.equal(res.status, 500);
  assert.match(rootSubmit.error, /AIRTABLE_BASE_ID/);
  assert.equal(legacyRootEnv.DB.sessions.size, 0);
  assert.equal(legacyRootEnv.DB.responses.size, 0);
  assert.equal(legacyRootEnv.DB.results.size, 0);
}));
