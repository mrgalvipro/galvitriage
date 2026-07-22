import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/worker.js';
import fixture from '../fixtures/known_good_session_day2.json' with { type: 'json' };
import { readFileSync } from 'node:fs';

class MockStmt { constructor(db, sql) { this.db = db; this.sql = sql; this.params = []; } bind(...params) { this.params = params; return this; } async run() { return this.db.run(this.sql, this.params); } async first() { return this.db.first(this.sql, this.params); } async all() { return { results: this.db.all(this.sql, this.params) }; } }
class MockD1 {
  constructor() { this.sessions = new Map(); this.responses = new Map(); this.results = new Map(); this.events = []; this.findings = new Map(); this.evidenceLinks = new Map(); this.followups = new Map(); this.entitlements = new Map(); this.payments = new Map(); this.founders = new Map(); this.ventures = new Map(); }
  prepare(sql) { return new MockStmt(this, sql); }
  async run(sql, p) {
    if (sql.includes('INSERT INTO sessions')) { this.sessions.set(p[0], { session_id:p[0], current_stage:p[1], status:p[2], source:p[3], utm_source:p[4], utm_campaign:p[5], created_at:p[6], updated_at:p[7], last_seen_at:p[8] }); return { success:true }; }
    if (sql.includes('INSERT OR IGNORE INTO founders')) { this.founders.set(p[0], { founder_id:p[0], session_id:p[1], email:p[4] }); return { success:true }; }
    if (sql.includes('INSERT INTO ventures')) { this.ventures.set(p[0], { venture_id:p[0], session_id:p[1], founder_id:p[2], venture_name:p[3] }); return { success:true }; }
    if (sql.includes('INSERT INTO assessment_responses')) { this.responses.set(`${p[1]}:${p[2]}:${p[3]}`, { response_id:p[0], session_id:p[1], product:p[2], question_id:p[3], dimension:p[4], answer_number:p[5], rules_version:p[6] }); return { success:true }; }
    if (sql.includes('INSERT INTO journey_events')) { this.events.push({ event_id:p[0], session_id:p[1], event_name:p[2], product:p[3] }); return { success:true }; }
    if (sql.includes('INSERT INTO product_results')) { if (sql.includes('DO NOTHING') && this.results.has(`${p[1]}:${p[2]}`)) return { success:true }; this.results.set(`${p[1]}:${p[2]}`, { result_id:p[0], session_id:p[1], product:p[2], status:p[3], confidence:p[4], confidence_band:p[5], result_json:p[6], generation_source:p[7], rules_version:p[8], content_version:p[9] }); return { success:true }; }
    if (sql.includes('INSERT INTO clinical_followups')) { this.followups.set(`${p[1]}:${p[3]}:${p[5]}`, { session_id:p[1], product:p[3], question_id:p[5], question_text:p[6], answer:p[7] }); return { success:true }; }
    if (sql.includes('INSERT INTO clinical_findings')) { this.findings.set(`${p[1]}:${p[2]}:${p[3]}`, { session_id:p[1], product:p[2], finding_code:p[3], evidence_ids_json:p[5] }); return { success:true }; }
    if (sql.includes('INSERT INTO galvishot_evidence_links')) { this.evidenceLinks.set(`${p[1]}:${p[2]}:${p[3]}:${p[5]}:${p[8]}`, { evidence_link_id:p[0], session_id:p[1], product:p[2], finding_code:p[3], source_type:p[4], source_field:p[5], display_value:p[6], used_for:p[7], rules_version:p[8], created_at:p[9] }); return { success:true }; }
    throw new Error(`Unhandled SQL run: ${sql}`);
  }
  async first(sql, p) { if (sql.includes('FROM product_results')) return this.results.get(`${p[0]}:${p[1]}`) || null; if (sql.includes('FROM entitlements')) return this.entitlements.get(`${p[0]}:${p[1]}`) || null; if (sql.includes('FROM payments')) return this.payments.get(`${p[0]}:${p[1]}`) || null; if (sql.includes('FROM sessions')) return this.sessions.get(p[0]) || null; throw new Error(`Unhandled SQL first: ${sql}`); }
  all(sql, p) { if (sql.includes('FROM assessment_responses')) return [...this.responses.values()].filter(x => x.session_id === p[0] && x.product === 'GalviTriage').sort((a,b)=>a.question_id.localeCompare(b.question_id)); if (sql.includes('FROM clinical_followups')) return [...this.followups.values()].filter(x => x.session_id === p[0] && x.product === p[1]).sort((a,b)=>a.question_id.localeCompare(b.question_id)); throw new Error(`Unhandled SQL all: ${sql}`); }
}
function req(body) { return new Request('https://worker.test/api', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(body) }); }

const requiredSecurityHeaders = Object.freeze({
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'cross-origin',
  'x-frame-options': 'DENY'
});

function lowerHeaders(response) { return new Map([...response.headers.entries()].map(([key, value]) => [key.toLowerCase(), value])); }
function assertSecurityHeaders(response) {
  const headers = lowerHeaders(response);
  for (const [name, value] of Object.entries(requiredSecurityHeaders)) assert.equal(headers.get(name), value, `${name} header mismatch`);
  assert.equal(headers.has('content-security-policy'), false, 'Worker/API responses must not add Content-Security-Policy in this step');
}
function assertCorsHeaders(response, expectedOrigin = '*') {
  const headers = lowerHeaders(response);
  assert.equal(headers.get('access-control-allow-origin'), expectedOrigin);
  assert.equal(headers.get('access-control-allow-methods'), 'GET, POST, OPTIONS');
  assert.equal(headers.get('access-control-allow-headers'), 'Content-Type');
}
async function json(response) { return response.json(); }
function env(extra = {}) { return { DB:new MockD1(), D1_FOUNDATION_ENABLED:'true', ENVIRONMENT:'qa', GALVISHOT_QA_OVERRIDE_TOKEN:'qa-ok', ...extra }; }
function payload(session_id, answers) { return { action:'submit_triage', session:{ session_id, source:'test' }, founder:{ ...fixture.founder, consent:true }, venture:{ venture_name:fixture.venture.venture_name, organization_stage:fixture.venture.organization_stage, organization_type:fixture.venture.organization_type, industry:fixture.venture.industry, revenue_range:fixture.venture.revenue_range }, scored_answers:answers }; }
async function seed(e, session_id, overrides = {}) { const answers = { ...fixture.answers, ...overrides }; const res = await worker.fetch(req(payload(session_id, answers)), e); assert.equal(res.status, 200); return answers; }



test('Worker API responses include baseline security headers without changing CORS or build identity', async () => {
  const e = env();

  const health = await worker.fetch(new Request('https://worker.test/', { method:'GET' }), e);
  const healthBody = await json(health);
  assertSecurityHeaders(health);
  assertCorsHeaders(health);
  assert.equal(health.headers.get('X-Galvi-Environment'), 'qa');
  assert.equal(health.headers.get('X-Galvi-Stabilization'), 'day3_stabilization_v1');
  assert.equal(health.headers.get('X-Galvi-Score-Rules'), 'galviengine_score_v0_5_1');
  assert.equal(health.headers.get('X-GalviShot-Rules'), 'galvishot_rules_v0_5_1');
  assert.equal(healthBody.build.stabilization_version, 'day3_stabilization_v1');

  const success = await worker.fetch(req({ action:'health_check' }), e);
  assert.equal(success.status, 200);
  assertSecurityHeaders(success);
  assertCorsHeaders(success);

  const controlledError = await worker.fetch(req({ action:'unsupported_security_header_check' }), e);
  assert.equal(controlledError.status, 404);
  assertSecurityHeaders(controlledError);
  assertCorsHeaders(controlledError);

  const legacyDisabled = await worker.fetch(new Request('https://worker.test/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ action:'evaluate_galvishot', session_id:'legacy_headers' }) }), e);
  assert.equal(legacyDisabled.status, 410);
  assertSecurityHeaders(legacyDisabled);
  assertCorsHeaders(legacyDisabled);

  const preflight = await worker.fetch(new Request('https://worker.test/api', { method:'OPTIONS' }), e);
  assert.equal(preflight.status, 204);
  assertSecurityHeaders(preflight);
  assertCorsHeaders(preflight);
});

test('Worker health exposes non-sensitive Day 3 build identity and headers', async () => {
  const e = env({
    DB_NAME: 'private_d1_database',
    CLOUDFLARE_ACCOUNT_ID: 'private_account_id',
    GALVISHOT_QA_OVERRIDE_TOKEN: 'secret_override_token',
    MAKE_GALVISHOT_WEBHOOK_URL: 'https://make-webhook.example.invalid/private'
  });
  const res = await worker.fetch(new Request('https://worker.test/', { method:'GET' }), e);
  const body = await json(res);
  const serialized = JSON.stringify(body);
  const serializedHeaders = JSON.stringify([...res.headers.entries()]);

  assert.equal(res.status, 200);
  assert.deepEqual(body.build, {
    environment: 'qa',
    branch: 'qa-revamped-galvicare-0-5',
    stabilization_version: 'day3_stabilization_v1',
    score_rules_version: 'galviengine_score_v0_5_1',
    galvishot_rules_version: 'galvishot_rules_v0_5_1',
    galvishot_content_version: 'galvishot_content_v0_5_1',
    galvisight_rules_version: 'galvisight_rules_v0_5_1',
    galvisight_content_version: 'galvisight_content_v0_5_1',
    galvipath_rules_version: 'galvipath_rules_v0_5_1',
    galvipath_content_version: 'galvipath_content_v0_5_1',
    unified_worker_version: 'day4_unified_worker_v0_5_1',
    legacy_make_api_enabled: false,
    day4_deterministic_actions: ['get_or_generate_galvisight', 'get_galvisight', 'get_or_generate_galvipath', 'get_galvipath']
  });
  assert.equal(body.build.legacy_make_api_enabled, false);
  assert.equal(res.headers.get('X-Galvi-Environment'), 'qa');
  assert.equal(res.headers.get('X-Galvi-Stabilization'), 'day3_stabilization_v1');
  assert.equal(res.headers.get('X-Galvi-Score-Rules'), 'galviengine_score_v0_5_1');
  assert.equal(res.headers.get('X-GalviShot-Rules'), 'galvishot_rules_v0_5_1');
  for (const forbidden of ['secret_override_token', 'private_d1_database', 'private_account_id', 'make-webhook.example.invalid', 'MAKE_GALVISHOT_WEBHOOK_URL', 'GALVISHOT_QA_OVERRIDE_TOKEN', 'DB_NAME', 'CLOUDFLARE_ACCOUNT_ID']) {
    assert.equal(serialized.includes(forbidden), false, `Health response exposed sensitive identifier: ${forbidden}`);
    assert.equal(serializedHeaders.includes(forbidden), false, `Health headers exposed sensitive identifier: ${forbidden}`);
  }
});

test('Day 3 locks unpaid GalviShot and omits paid result content', async () => { const e=env(); await seed(e, 'shot_locked', { q07_predictable_revenue:1 }); const res=await worker.fetch(req({ action:'get_or_create_galvishot', session_id:'shot_locked' }), e); const body=await json(res); assert.equal(res.status, 402); assert.equal(body.status, 'locked'); assert.equal(body.result, undefined); });

test('Day 3 QA override is environment scoped and production rejects it', async () => { const e=env({ ENVIRONMENT:'production' }); await seed(e, 'shot_prod', { q07_predictable_revenue:1 }); const res=await worker.fetch(req({ action:'get_or_create_galvishot', session_id:'shot_prod', payload:{ qa_override_token:'qa-ok' } }), e); assert.equal(res.status, 402); });


test('Day 3 stored GalviShot retrieval requires entitlement or QA override', async () => { const e=env(); await seed(e, 'shot_stored_auth', { q07_predictable_revenue:1, q08_revenue_growth_confidence:1, q09_revenue_driver_clarity:1 }); await worker.fetch(req({ action:'get_or_create_galvishot', session_id:'shot_stored_auth', payload:{ qa_override_token:'qa-ok' } }), e); let res=await worker.fetch(req({ action:'get_galvishot', session_id:'shot_stored_auth' }), e); assert.equal(res.status, 402); res=await worker.fetch(req({ action:'get_galvishot', session_id:'shot_stored_auth', payload:{ qa_override_token:'qa-ok' } }), e); const body=await json(res); assert.equal(res.status, 200); assert.equal(body.stored, true); assert.equal(body.result.product, 'GalviShot'); });

test('Day 3 creates deterministic stored evidence-linked GalviShot once', async () => { const e=env(); await seed(e, 'shot_revenue', { q07_predictable_revenue:1, q08_revenue_growth_confidence:1, q09_revenue_driver_clarity:1, q04_ideal_customer:1, q10_customer_satisfaction:1 }); let res=await worker.fetch(req({ action:'evaluate_galvishot', session_id:'shot_revenue' }), e); assert.equal((await json(res)).status, 'eligible'); res=await worker.fetch(req({ action:'get_or_create_galvishot', session_id:'shot_revenue', payload:{ qa_override_token:'qa-ok' } }), e); const first=await json(res); assert.equal(first.status, 'ok'); assert.equal(first.result.rules_version, 'galvishot_rules_v0_5_1'); assert.ok(first.result.findings.length >= 3); assert.ok(first.result.findings.every(f => f.evidence.length > 0)); for (const finding of first.result.findings) { const persisted = [...e.DB.evidenceLinks.values()].filter(row => row.session_id === 'shot_revenue' && row.product === 'GalviShot' && row.finding_code === finding.finding_code); assert.ok(persisted.length >= 1); assert.equal(persisted.length, finding.evidence.length); for (const evidence of finding.evidence) { const row = persisted.find(x => x.source_field === evidence.source_field); assert.ok(row); assert.equal(row.source_type, evidence.source_type); assert.equal(row.display_value, evidence.display_value); assert.equal(row.used_for, evidence.used_for); assert.equal(row.rules_version, 'galvishot_rules_v0_5_1'); assert.equal(row.evidence_link_id, `evidence_link_shot_revenue_GalviShot_${finding.finding_code}_${evidence.source_field}_galvishot_rules_v0_5_1`); } } const firstEvidenceCount = e.DB.evidenceLinks.size; assert.equal(firstEvidenceCount, first.result.findings.reduce((count, finding) => count + finding.evidence.length, 0)); assert.equal(e.DB.results.size, 3); res=await worker.fetch(req({ action:'get_or_create_galvishot', session_id:'shot_revenue', payload:{ qa_override_token:'qa-ok' } }), e); const second=await json(res); assert.equal(second.stored, true); assert.deepEqual(second.result, first.result); assert.equal(e.DB.evidenceLinks.size, firstEvidenceCount); assert.equal(e.DB.results.size, 3); });

test('Day 3 follow-up save upserts and low-confidence record withholds final result', async () => { const e=env(); await seed(e, 'shot_low'); for (const key of [...e.DB.responses.keys()].filter(k => k.startsWith('shot_low:')).slice(0, 10)) e.DB.responses.delete(key); let res=await worker.fetch(req({ action:'evaluate_galvishot', session_id:'shot_low' }), e); assert.equal((await json(res)).status, 'needs_followup'); await worker.fetch(req({ action:'save_galvishot_followup', session_id:'shot_low', payload:{ answers:[{ question_code:'EVIDENCE_PRIORITY', question_text:'Which evidence signal is strongest?', answer_text:'Customer conversations', confidence_impact:5 }] } }), e); await worker.fetch(req({ action:'save_galvishot_followup', session_id:'shot_low', payload:{ answers:[{ question_code:'EVIDENCE_PRIORITY', question_text:'Which evidence signal is strongest?', answer_text:'Revenue conversion', confidence_impact:5 }] } }), e); assert.equal(e.DB.followups.size, 1); });


test('Day 3 /api router is closed to unsupported actions without legacy fallback', async () => {
  const e = env();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected outbound fetch in test'); };
  try {
    const res = await worker.fetch(req({ action:'unknown_api_action', session_id:'closed_route' }), e);
    const body = await json(res);
    assert.equal(res.status, 404);
    assert.equal(body.success, false);
    assert.equal(body.code, 'UNSUPPORTED_API_ACTION');
    assert.equal(body.action, 'unknown_api_action');
    assert.equal(e.DB.sessions.size, 0);
    assert.equal(e.DB.results.size, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Day 3 GalviShot actions outside /api return legacy route disabled', async () => {
  const e = env();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected outbound fetch in test'); };
  try {
    const res = await worker.fetch(new Request('https://worker.test/', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ action:'evaluate_galvishot', session_id:'legacy_disabled' }) }), e);
    const body = await json(res);
    assert.equal(res.status, 410);
    assert.equal(body.success, false);
    assert.equal(body.code, 'LEGACY_DIAGNOSTIC_ROUTE_DISABLED');
    assert.equal(body.action, 'evaluate_galvishot');
    assert.equal(e.DB.sessions.size, 0);
    assert.equal(e.DB.results.size, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Day 3 frontend contains no browser finding generator or payment unlock from URL', () => { const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8'); assert.equal(html.includes('function buildResult()'), false); assert.equal(html.includes('localStorage.setItem(GSHOT.PAYMENT_KEY'), false); assert.ok(html.includes('get_or_create_galvishot')); });
