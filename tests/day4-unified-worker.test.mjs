import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../worker/worker.js';
import fixture from '../fixtures/known_good_session_day2.json' with { type: 'json' };

class MockStmt {
  constructor(db, sql) { this.db = db; this.sql = sql; this.params = []; }
  bind(...params) { this.params = params; return this; }
  async run() { return this.db.run(this.sql, this.params); }
  async first() { return this.db.first(this.sql, this.params); }
  async all() { return { results: this.db.all(this.sql, this.params) }; }
}

class SchemaCheckedD1 {
  constructor() {
    this.sessions = new Map();
    this.founders = new Map();
    this.ventures = new Map();
    this.responses = new Map();
    this.results = new Map();
    this.events = [];
    this.followups = new Map();
    this.findings = new Map();
    this.evidenceLinks = new Map();
    this.entitlements = new Map();
    this.payments = new Map();
  }
  prepare(sql) { return new MockStmt(this, sql); }
  assertKnown(sql) {
    const known = ['sessions', 'founders', 'ventures', 'assessment_responses', 'journey_events', 'product_results', 'clinical_followups', 'clinical_findings', 'galvishot_evidence_links', 'entitlements', 'payments'];
    assert.ok(known.some(name => sql.includes(name)), `SQL does not match the QA schema contract: ${sql}`);
  }
  async run(sql, p) {
    this.assertKnown(sql);
    if (sql.includes('INSERT INTO sessions')) {
      assert.equal(p[0] !== '', true);
      this.sessions.set(p[0], { session_id:p[0], current_stage:p[1], status:p[2], source:p[3], utm_source:p[4], utm_campaign:p[5], created_at:p[p.length - 3], updated_at:p[p.length - 2], last_seen_at:p[p.length - 1] });
      return { success:true };
    }
    if (sql.includes('INSERT OR IGNORE INTO founders')) {
      this.founders.set(p[0], { founder_id:p[0], session_id:p[1], first_name:p[2], last_name:p[3], email:p[4] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO ventures')) {
      this.ventures.set(p[0], { venture_id:p[0], session_id:p[1], founder_id:p[2], venture_name:p[3] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO assessment_responses')) {
      assert.match(sql, /UNIQUE|ON CONFLICT\(session_id,product,question_id\)/);
      this.responses.set(`${p[1]}:${p[2]}:${p[3]}`, { response_id:p[0], session_id:p[1], product:p[2], question_id:p[3], dimension:p[4], answer_number:p[5], rules_version:p[6] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO journey_events')) {
      this.events.push({ event_id:p[0], session_id:p[1], event_name:p[2], product:p[3], current_stage:p[4] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO product_results')) {
      assert.match(sql, /ON CONFLICT\(session_id,product\)/);
      const key = `${p[1]}:${p[2]}`;
      if (sql.includes('DO NOTHING') && this.results.has(key)) return { success:true };
      this.results.set(key, { result_id:p[0], session_id:p[1], product:p[2], status:p[3], confidence:p[4], confidence_band:p[5], result_json:p[6], generation_source:p[7], rules_version:p[8], content_version:p[9] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO clinical_followups')) {
      assert.match(sql, /ON CONFLICT\(session_id,product,question_id\)/);
      this.followups.set(`${p[1]}:${p[3]}:${p[5]}`, { followup_id:p[0], session_id:p[1], current_stage:p[2], product:p[3], question_id:p[5], question_text:p[6], answer:p[7], confidence_impact:p[8] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO clinical_findings')) {
      assert.match(sql, /ON CONFLICT\(session_id,product,finding_code\)/);
      this.findings.set(`${p[1]}:${p[2]}:${p[3]}`, { finding_id:p[0], session_id:p[1], product:p[2], finding_code:p[3], evidence_ids_json:p[5] });
      return { success:true };
    }
    if (sql.includes('INSERT INTO galvishot_evidence_links')) {
      assert.match(sql, /ON CONFLICT\(session_id,product,finding_code,source_field,rules_version\)/);
      this.evidenceLinks.set(`${p[1]}:${p[2]}:${p[3]}:${p[5]}:${p[8]}`, { evidence_link_id:p[0], session_id:p[1], product:p[2], finding_code:p[3], source_type:p[4], source_field:p[5], display_value:p[6], used_for:p[7], rules_version:p[8] });
      return { success:true };
    }
    throw new Error(`Unhandled SQL run: ${sql}`);
  }
  async first(sql, p) {
    this.assertKnown(sql);
    if (sql.includes('FROM product_results')) {
      const row = this.results.get(`${p[0]}:${p[1]}`) || null;
      return row && (!p[2] || row.rules_version === p[2]) ? row : null;
    }
    if (sql.includes('FROM entitlements')) return this.entitlements.get(`${p[0]}:${p[1]}`) || null;
    if (sql.includes('FROM payments')) return this.payments.get(`${p[0]}:${p[1]}`) || null;
    if (sql.includes('FROM sessions')) return this.sessions.get(p[0]) || null;
    throw new Error(`Unhandled SQL first: ${sql}`);
  }
  all(sql, p) {
    this.assertKnown(sql);
    if (sql.includes('FROM assessment_responses')) return [...this.responses.values()].filter(row => row.session_id === p[0] && row.product === 'GalviTriage').sort((a, b) => a.question_id.localeCompare(b.question_id));
    if (sql.includes('FROM clinical_followups')) return [...this.followups.values()].filter(row => row.session_id === p[0] && row.product === p[1]).sort((a, b) => a.question_id.localeCompare(b.question_id));
    throw new Error(`Unhandled SQL all: ${sql}`);
  }
}

const deterministicActions = Object.freeze(['get_or_generate_galvisight', 'get_galvisight', 'get_or_generate_galvipath', 'get_galvipath']);
const legacySightActions = Object.freeze(['evaluate_galvisight_readiness', 'save_galvisight_followup', 'record_galvisight_payment_success', 'hubspot_recovery_tag', 'journey_event']);
function env(extra = {}) { return { DB:new SchemaCheckedD1(), ENVIRONMENT:'qa', GALVISHOT_QA_OVERRIDE_TOKEN:'qa-ok', ...extra }; }
function request(path, body, method = 'POST') { return new Request(`https://worker.test${path}`, { method, headers:{ 'Content-Type':'application/json' }, body:body ? JSON.stringify(body) : undefined }); }
async function body(response) { return response.json(); }
function intakePayload(sessionId) { return { action:'submit_triage', session:{ session_id:sessionId, source:'unified_runtime_test' }, founder:{ ...fixture.founder, email:`${sessionId}@example.test`, consent:true }, venture:{ venture_name:'Synthetic Unified QA Venture', organization_stage:'Growing', organization_type:'Small Business', industry:'Services', revenue_range:'Synthetic', team_size:'3' }, priority:{ highest_impact_area:'revenue' }, open_text:{ biggest_challenge:'Synthetic challenge for deterministic QA.', one_30_day_problem:'Synthetic customer signal sprint.' }, scored_answers:{ ...fixture.answers, q07_predictable_revenue:1, q08_revenue_growth_confidence:1, q09_revenue_driver_clarity:1, q04_ideal_customer:1, q10_customer_satisfaction:1 } }; }

async function postApi(e, payload) { return worker.fetch(request('/api', payload), e); }

test('unified Worker carries one canonical session from Day 1 through deterministic Day 4 without outbound services', async () => {
  const e = env();
  const sessionId = 'day4_unified_runtime_session';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('No OpenAI, Make, Airtable, or HubSpot request is allowed in the deterministic /api journey.'); };
  try {
    let response = await worker.fetch(new Request('https://worker.test/', { method:'GET' }), e);
    assert.equal(response.status, 200);
    const health = await body(response);
    assert.equal(health.unified_worker_version, 'day4_unified_worker_v0_5_1');
    assert.deepEqual(health.day4_deterministic_actions, deterministicActions);
    assert.deepEqual(health.build.day4_deterministic_actions, deterministicActions);

    response = await postApi(e, { action:'create_or_resume_session', session_id:sessionId, current_stage:'Unified Runtime QA' });
    assert.equal(response.status, 200);
    assert.equal((await body(response)).session_id, sessionId);

    response = await postApi(e, intakePayload(sessionId));
    assert.equal(response.status, 200);
    const submitted = await body(response);
    assert.equal(submitted.success, true);
    assert.equal(submitted.session_id, sessionId);
    assert.equal(submitted.vitals.session_id, sessionId);
    assert.equal(submitted.score.session_id, sessionId);
    assert.equal(e.DB.sessions.has(sessionId), true);
    assert.equal([...e.DB.responses.values()].filter(row => row.session_id === sessionId).length, 20);
    const stableScore = submitted.score.score;

    response = await postApi(e, { action:'get_or_create_vitals', session_id:sessionId });
    assert.equal(response.status, 200);
    assert.equal((await body(response)).result.session_id, sessionId);

    response = await postApi(e, { action:'get_or_create_score', session_id:sessionId });
    assert.equal(response.status, 200);
    const score = await body(response);
    assert.equal(score.result.session_id, sessionId);
    assert.equal(score.result.score, stableScore);

    response = await postApi(e, { action:'evaluate_galvishot', session_id:sessionId });
    assert.equal(response.status, 200);
    assert.equal((await body(response)).status, 'eligible');

    response = await postApi(e, { action:'get_or_create_galvishot', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 200);
    const shot = await body(response);
    assert.equal(shot.result.session_id, sessionId);
    assert.ok(shot.result.findings.length >= 3);
    assert.ok(shot.result.findings.every(finding => finding.evidence.length > 0));

    response = await postApi(e, { action:'get_galvishot', session_id:sessionId });
    assert.equal(response.status, 402);

    response = await postApi(e, { action:'get_galvishot', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 200);
    assert.equal((await body(response)).result.product, 'GalviShot');

    response = await postApi(env({ DB:e.DB, ENVIRONMENT:'production' }), { action:'get_or_create_galvishot', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 402);

    for (const action of deterministicActions) {
      response = await postApi(e, { action, session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
      assert.notEqual(response.status, 404, `${action} must route to handleDay4Action`);
      assert.notEqual((await body(response)).code, 'UNSUPPORTED_API_ACTION', `${action} must not fall through to unsupported /api handling`);
    }

    for (const action of legacySightActions) {
      response = await postApi(e, { action, session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
      const result = await body(response);
      assert.notEqual(result.product, 'GalviSight', `${action} must not be handled by deterministic Day 4`);
      if (action === 'journey_event') assert.equal(response.status, 200);
      else assert.equal(response.status, 404);
    }

    globalThis.fetch = async () => new Response(JSON.stringify({ success:true, product:'GalviSight', session_id:sessionId }), { status:200, headers:{ 'Content-Type':'application/json' } });
    response = await worker.fetch(request('/', { action:'get_or_generate_galvisight', session:{ session_id:sessionId }, current_stage:'GalviSight Legacy' }), { MAKE_GALVISIGHT_WEBHOOK_URL:'https://make.test/legacy' });
    assert.equal(response.status, 200);
    assert.equal((await body(response)).product, 'GalviSight');
    globalThis.fetch = async () => { throw new Error('No OpenAI, Make, Airtable, or HubSpot request is allowed in the deterministic /api journey.'); };

    response = await postApi(e, { action:'get_or_generate_galvisight', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 200);
    const sight = await body(response);
    assert.equal(sight.result.product, 'GalviSight');
    assert.equal(sight.result.status, 'ready');
    assert.equal(sight.result.session_id, sessionId);
    assert.ok(sight.result.evidence_trace.length > 0);
    assert.ok(sight.result.hypotheses.every(hypothesis => hypothesis.label === 'Hypothesis'));
    const resultCountAfterSight = e.DB.results.size;

    response = await postApi(e, { action:'get_galvisight', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 200);
    const storedSight = await body(response);
    assert.equal(storedSight.stored, true);
    assert.deepEqual(storedSight.result, sight.result);
    assert.equal(e.DB.results.size, resultCountAfterSight);

    response = await postApi(e, { action:'get_or_generate_galvipath', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 200);
    const path = await body(response);
    assert.equal(path.result.product, 'GalviPath');
    assert.equal(path.result.primary_pathway_count, 1);
    assert.deepEqual(path.result.sequence.map(item => [item.window, item.order]), [['30 days', 1], ['60 days', 2], ['90 days', 3]]);
    assert.ok(path.result.evidence_trace.length > 0);
    assert.ok(path.result.evidence_to_collect.length > 0);
    assert.ok(path.result.escalation_triggers.length > 0);
    const resultCountAfterPath = e.DB.results.size;

    response = await postApi(e, { action:'get_galvipath', session_id:sessionId, payload:{ qa_override_token:'qa-ok' } });
    assert.equal(response.status, 200);
    const storedPath = await body(response);
    assert.equal(storedPath.stored, true);
    assert.deepEqual(storedPath.result, path.result);
    assert.equal(e.DB.results.size, resultCountAfterPath);

    const browser = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    for (const forbidden of ['DAY4_DETERMINISTIC_ACTIONS', 'GALVISIGHT_RULES_VERSION', 'selectPathway(', 'buildGalviPath(', 'hasProductEntitlement(']) {
      assert.equal(browser.includes(forbidden), false, `${forbidden} must not execute in browser-delivered code`);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
