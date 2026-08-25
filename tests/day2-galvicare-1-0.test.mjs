import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker, {
  GALVICARE_RELEASE, GALVICARE_SCHEMA, RULES_VERSION, PROTOCOL_VERSION
} from '../worker/day2-galvicare-1-0.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

class D1StatementMock {
  constructor(database, sql, params = []) { this.database = database; this.sql = sql; this.params = params; }
  bind(...params) { return new D1StatementMock(this.database, this.sql, params); }
  async first() { return this.database.prepare(this.sql).get(...this.params) ?? null; }
  async all() { return { success: true, results: this.database.prepare(this.sql).all(...this.params) }; }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.params);
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid || 0) } };
  }
}
class D1DatabaseMock {
  constructor(database) { this.database = database; }
  prepare(sql) { return new D1StatementMock(this.database, sql); }
  async batch(statements) {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const out = [];
      for (const statement of statements) out.push(await statement.run());
      this.database.exec('COMMIT');
      return out;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(read('migrations/day1/0001_canonical_business_medical_record.sql'));
  sqlite.exec(read('migrations/day1/0100_galvicare_1_0_day1_foundation.sql'));
  sqlite.exec(read('migrations/day1/0101_day1_principal_session_continuity.sql'));
  sqlite.exec(read('migrations/day1/0102_galvicare_1_0_day2_intake_results.sql'));
  return {
    sqlite,
    env: {
      ENVIRONMENT: 'qa',
      FIXTURE_MODE: 'true',
      COMMIT_SHA: 'local-day2-test',
      ALLOWED_ORIGINS: 'https://galvipro.com',
      DB: new D1DatabaseMock(sqlite)
    }
  };
}

async function call(env, pathname, { method='GET', actor, key, body, origin='https://galvipro.com' } = {}) {
  const headers = new Headers({ Origin: origin, 'X-Correlation-Id': `corr_${Math.random().toString(16).slice(2)}` });
  if (actor) headers.set('X-Galvi-Day1-Actor', actor);
  if (key) headers.set('Idempotency-Key', key);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const response = await worker.fetch(new Request(`https://day2.test${pathname}`, {
    method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  }), env);
  return { response, payload: response.status === 204 ? null : await response.json() };
}

const email = (suffix) => `day1.${suffix}@example.invalid`;

async function createContext(env, suffix, mode='principal_only') {
  const body = mode === 'principal_only'
    ? { email: email(suffix), lifecycle_state: 'pre_founder', record_mode: 'principal_only', care_protocol: 'founder_smb', payer_type: 'self' }
    : { email: email(suffix), lifecycle_state: 'founder', record_mode: 'principal_plus_venture', care_protocol: 'founder_smb', payer_type: 'self', venture_name: `Venture ${suffix}` };
  const created = await call(env, '/api/v1/principal-contexts', {
    method: 'POST', actor: `principal:${suffix}`, key: `ctx-${suffix}`, body
  });
  assert.equal(created.response.status, 201);
  const founder_id = created.payload.data.principal.founder_id;
  const bmr_id = created.payload.data.context.bmr_id;
  const consent = await call(env, '/api/v1/consents', {
    method: 'POST', actor: `principal:${suffix}`, key: `consent-${suffix}`,
    body: { founder_id, ...(bmr_id ? { bmr_id } : {}), purpose: 'care_processing', policy_version: 'day2_qa_v1', status: 'granted' }
  });
  assert.equal(consent.response.status, 201);
  return created.payload.data;
}

const greenAcuity = { severity:1, urgency:0, continuity:1, reversibility:1, complexity:0 };
const redAcuity = { severity:4, urgency:4, continuity:4, reversibility:3, complexity:2 };
const highConfidence = {
  required_data_completeness:95, evidence_quality:90, answer_consistency:95, corroboration:85, context_completeness:90
};
const lowConfidence = {
  required_data_completeness:30, evidence_quality:25, answer_consistency:40, corroboration:20, context_completeness:35
};

if (process.env.DAY2_V10_REMOTE_SMOKE === '1') {
  test('remote Day 2 universal intake / acuity / confidence Human-E2E critical path', async () => {
    const base = String(process.env.DAY2_BASE_URL || '').replace(/\/$/, '');
    assert.ok(base, 'DAY2_BASE_URL is required');
    const run = String(process.env.DAY2_RUN_SUFFIX || Date.now()).replace(/[^A-Za-z0-9._-]/g, '_').toLowerCase();
    const req = async (pathname, { method='GET', actor, key, body } = {}) => {
      const headers = new Headers({ Origin:'https://galvipro.com', 'X-Correlation-Id':`corr-${run}-${Date.now()}` });
      if (actor) headers.set('X-Galvi-Day1-Actor', actor);
      if (key) headers.set('Idempotency-Key', key);
      if (body !== undefined) headers.set('Content-Type','application/json');
      const response = await fetch(`${base}${pathname}`, { method, headers, ...(body !== undefined ? { body:JSON.stringify(body) } : {}) });
      return { response, payload: response.status === 204 ? null : await response.json() };
    };
    const health = await req('/health');
    assert.equal(health.response.status, 200);
    assert.equal(health.payload.data.release_version, GALVICARE_RELEASE);
    assert.equal(health.payload.data.galvicare_schema_version, GALVICARE_SCHEMA);
    assert.equal(health.payload.data.capabilities.ai_enabled, false);

    const suffix = `h_${run}`;
    const actor = `principal:${suffix}`;
    const context = await req('/api/v1/principal-contexts', {
      method:'POST', actor, key:`ctx-${run}`,
      body:{email:email(suffix),lifecycle_state:'pre_founder',record_mode:'principal_only',care_protocol:'athlete_career_ownership',payer_type:'self'}
    });
    assert.equal(context.response.status, 201);
    assert.equal(context.payload.data.context.bmr_id, null);
    assert.equal(context.payload.data.context.care_protocol, 'athlete_career_ownership');
    const founder = context.payload.data.principal.founder_id;
    const contextId = context.payload.data.context.context_id;
    const consent = await req('/api/v1/consents', {
      method:'POST', actor, key:`cns-${run}`,
      body:{founder_id:founder,purpose:'care_processing',policy_version:'day2_qa_v1',status:'granted'}
    });
    assert.equal(consent.response.status, 201);

    const triageBody = { context_id:contextId, acuity:greenAcuity, confidence:highConfidence, answers:{intent:'explore'} };
    const triage = await req('/api/v1/day2/triage', { method:'POST', actor, key:`tri-${run}`, body:triageBody });
    assert.equal(triage.response.status, 201);
    assert.equal(triage.payload.data.score_type, 'founder_readiness');
    assert.equal(triage.payload.data.bmr_id, null);
    const triageReplay = await req('/api/v1/day2/triage', { method:'POST', actor, key:`tri-${run}`, body:triageBody });
    assert.equal(triageReplay.payload.meta.idempotent_replay, true);

    const dimensions = Object.fromEntries(FOUNDER_READINESS_DIMENSIONS.map((d, i) => [d, 65 + i]));
    const vitals = await req('/api/v1/day2/vitals', { method:'POST', actor, key:`vit-${run}`, body:{context_id:contextId,dimensions,confidence:highConfidence} });
    assert.equal(vitals.response.status, 201);
    const score = await req('/api/v1/day2/score', { method:'POST', actor, key:`score-${run}`, body:{context_id:contextId} });
    assert.equal(score.response.status, 201);
    assert.equal(score.payload.data.generation_source, 'rules');
    assert.equal(score.payload.data.score_type, 'founder_readiness');

    const low = await req('/api/v1/day2/triage', {
      method:'POST', actor, key:`low-${run}`,
      body:{context_id:contextId,acuity:greenAcuity,confidence:lowConfidence,skip_for_now:true}
    });
    assert.equal(low.response.status, 201);
    assert.equal(low.payload.data.status, 'needs_evidence');
    assert.notEqual(low.payload.data.next_action, 'stripe');
    const unresolved = await req('/api/v1/day2/triage', {
      method:'POST', actor, key:`low2-${run}`,
      body:{context_id:contextId,acuity:greenAcuity,confidence:lowConfidence,followup_round:1}
    });
    assert.equal(unresolved.payload.data.status, 'human_review');

    const opSuffix = `op_${run}`, opActor=`principal:${opSuffix}`;
    const op = await req('/api/v1/principal-contexts', {
      method:'POST', actor:opActor, key:`opctx-${run}`,
      body:{email:email(opSuffix),lifecycle_state:'founder',record_mode:'principal_plus_venture',care_protocol:'founder_smb',payer_type:'self',venture_name:`Day2 ${run}`}
    });
    assert.equal(op.response.status, 201);
    const opFounder=op.payload.data.principal.founder_id, opBmr=op.payload.data.context.bmr_id, opContext=op.payload.data.context.context_id;
    await req('/api/v1/consents', { method:'POST', actor:opActor, key:`opcns-${run}`, body:{founder_id:opFounder,bmr_id:opBmr,purpose:'care_processing',policy_version:'day2_qa_v1',status:'granted'} });
    const urgent = await req('/api/v1/day2/triage', { method:'POST', actor:opActor, key:`urgent-${run}`, body:{context_id:opContext,acuity:redAcuity,confidence:highConfidence} });
    assert.ok(['orange','red'].includes(urgent.payload.data.acuity_band));
    const strongDims=Object.fromEntries(BUSINESS_HEALTH_DIMENSIONS.map(d=>[d,88]));
    await req('/api/v1/day2/vitals', { method:'POST', actor:opActor, key:`opvit-${run}`, body:{context_id:opContext,dimensions:strongDims,confidence:highConfidence} });
    const opScore=await req('/api/v1/day2/score', { method:'POST', actor:opActor, key:`opscore-${run}`, body:{context_id:opContext} });
    assert.ok(opScore.payload.data.overall_score >= 80);
    assert.ok(['orange','red'].includes(opScore.payload.data.acuity_band));

    const weakSuffix = `weak_${run}`, weakActor=`principal:${weakSuffix}`;
    const weak = await req('/api/v1/principal-contexts', {
      method:'POST', actor:weakActor, key:`weakctx-${run}`,
      body:{email:email(weakSuffix),lifecycle_state:'founder',record_mode:'principal_plus_venture',care_protocol:'founder_smb',payer_type:'self',venture_name:`Day2 Weak ${run}`}
    });
    assert.equal(weak.response.status, 201);
    const weakFounder=weak.payload.data.principal.founder_id, weakBmr=weak.payload.data.context.bmr_id, weakContext=weak.payload.data.context.context_id;
    await req('/api/v1/consents', { method:'POST', actor:weakActor, key:`weakcns-${run}`, body:{founder_id:weakFounder,bmr_id:weakBmr,purpose:'care_processing',policy_version:'day2_qa_v1',status:'granted'} });
    await req('/api/v1/day2/triage', { method:'POST', actor:weakActor, key:`weaktri-${run}`, body:{context_id:weakContext,acuity:greenAcuity,confidence:highConfidence} });
    const weakDims=Object.fromEntries(BUSINESS_HEALTH_DIMENSIONS.map(d=>[d,20]));
    await req('/api/v1/day2/vitals', { method:'POST', actor:weakActor, key:`weakvit-${run}`, body:{context_id:weakContext,dimensions:weakDims,confidence:highConfidence} });
    const weakScore=await req('/api/v1/day2/score', { method:'POST', actor:weakActor, key:`weakscore-${run}`, body:{context_id:weakContext} });
    assert.ok(weakScore.payload.data.overall_score <= 25);
    assert.equal(weakScore.payload.data.acuity_band, 'green');

    const regulated = await req('/api/v1/day2/triage', { method:'POST', actor:opActor, key:`reg-${run}`, body:{context_id:opContext,acuity:greenAcuity,confidence:highConfidence,red_flags:['regulated_professional_dependency']} });
    assert.equal(regulated.payload.data.override_route, 'referral_required');
    assert.equal(regulated.payload.data.disposition, 'urgent_active_specialty_referral');

    const cross = await req(`/api/v1/day2/intake-state/${encodeURIComponent(opContext)}`, { actor });
    assert.equal(cross.response.status, 403);

    const stale = await req(`/api/v1/day2/intake-state/ctx_stale_${run}`, { actor });
    assert.equal(stale.response.status, 404);

    const state = await req(`/api/v1/day2/intake-state/${encodeURIComponent(contextId)}`, { actor });
    assert.equal(state.response.status, 200);
    assert.equal(state.payload.data.context.bmr_id, null);
    console.log(JSON.stringify({run,pre_context:contextId,operating_context:opContext,operating_bmr:opBmr}, null, 2));
  });
} else {
  test('0102 migration is additive and preserves Day 1 canonical authority', () => {
    const sql = read('migrations/day1/0102_galvicare_1_0_day2_intake_results.sql');
    assert.doesNotMatch(sql, /\b(DROP|TRUNCATE|DELETE\s+FROM)\b/i);
    const { sqlite } = database();
    assert.equal(sqlite.prepare("SELECT environment FROM gv1_schema_migrations WHERE migration_id='0102'").get().environment, 'qa');
    assert.ok(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='gv1_day2_intake_results'").get());
  });

  test('health self-identifies Day 2, same QA authority, and AI remains off', async () => {
    const { env } = database();
    const { response, payload } = await call(env, '/health');
    assert.equal(response.status, 200);
    assert.equal(payload.data.release_version, GALVICARE_RELEASE);
    assert.equal(payload.data.galvicare_schema_version, GALVICARE_SCHEMA);
    assert.equal(payload.data.capabilities.universal_intake, true);
    assert.equal(payload.data.capabilities.ai_enabled, false);
  });

  test('Pre-Founder remains principal-only and produces Founder Readiness', async () => {
    const { env, sqlite } = database();
    const ctx = await createContext(env, 'pre');
    const triage = await call(env, '/api/v1/day2/triage', {
      method:'POST', actor:'principal:pre', key:'tri-pre',
      body:{context_id:ctx.context.context_id,acuity:greenAcuity,confidence:highConfidence}
    });
    assert.equal(triage.response.status, 201);
    assert.equal(triage.payload.data.score_type, 'founder_readiness');
    assert.equal(triage.payload.data.bmr_id, null);
    const dims=Object.fromEntries(FOUNDER_READINESS_DIMENSIONS.map(d=>[d,70]));
    const vitals=await call(env,'/api/v1/day2/vitals',{method:'POST',actor:'principal:pre',key:'vit-pre',body:{context_id:ctx.context.context_id,dimensions:dims,confidence:highConfidence}});
    assert.equal(vitals.payload.data.score_type,'founder_readiness');
    const score=await call(env,'/api/v1/day2/score',{method:'POST',actor:'principal:pre',key:'score-pre',body:{context_id:ctx.context.context_id}});
    assert.equal(score.payload.data.generation_source,'rules');
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_ventures').get().n,0);
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_business_medical_records').get().n,0);
  });

  test('Acuity stays independent from Business Health: healthy urgent and unhealthy non-urgent', async () => {
    const { env } = database();
    const healthy = await createContext(env,'healthy','principal_plus_venture');
    await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:healthy',key:'tri-healthy',body:{context_id:healthy.context.context_id,acuity:redAcuity,confidence:highConfidence}});
    const strong=Object.fromEntries(BUSINESS_HEALTH_DIMENSIONS.map(d=>[d,90]));
    await call(env,'/api/v1/day2/vitals',{method:'POST',actor:'principal:healthy',key:'vit-healthy',body:{context_id:healthy.context.context_id,dimensions:strong,confidence:highConfidence}});
    const strongScore=await call(env,'/api/v1/day2/score',{method:'POST',actor:'principal:healthy',key:'score-healthy',body:{context_id:healthy.context.context_id}});
    assert.ok(strongScore.payload.data.overall_score>=85);
    assert.ok(['orange','red'].includes(strongScore.payload.data.acuity_band));

    const weak = await createContext(env,'weak','principal_plus_venture');
    await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:weak',key:'tri-weak',body:{context_id:weak.context.context_id,acuity:greenAcuity,confidence:highConfidence}});
    const low=Object.fromEntries(BUSINESS_HEALTH_DIMENSIONS.map(d=>[d,20]));
    await call(env,'/api/v1/day2/vitals',{method:'POST',actor:'principal:weak',key:'vit-weak',body:{context_id:weak.context.context_id,dimensions:low,confidence:highConfidence}});
    const lowScore=await call(env,'/api/v1/day2/score',{method:'POST',actor:'principal:weak',key:'score-weak',body:{context_id:weak.context.context_id}});
    assert.ok(lowScore.payload.data.overall_score<=25);
    assert.equal(lowScore.payload.data.acuity_band,'green');
  });

  test('low confidence is bounded/recoverable and Skip never routes to payment', async () => {
    const { env } = database();
    const ctx=await createContext(env,'confidence');
    const first=await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:confidence',key:'low-one',body:{context_id:ctx.context.context_id,acuity:greenAcuity,confidence:lowConfidence,skip_for_now:true}});
    assert.equal(first.payload.data.status,'needs_evidence');
    assert.ok(first.payload.data.followup_questions.length>=1 && first.payload.data.followup_questions.length<=3);
    assert.notEqual(first.payload.data.next_action,'stripe');
    const second=await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:confidence',key:'low-two',body:{context_id:ctx.context.context_id,acuity:greenAcuity,confidence:lowConfidence,followup_round:1}});
    assert.equal(second.payload.data.status,'human_review');
  });

  test('red-flag override preserves base acuity and routes regulated issues to referral', async () => {
    const { env } = database();
    const ctx=await createContext(env,'regulated','principal_plus_venture');
    const result=await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:regulated',key:'reg-1',body:{context_id:ctx.context.context_id,acuity:greenAcuity,confidence:highConfidence,red_flags:['regulated_professional_dependency']}});
    assert.equal(result.payload.data.acuity_band,'green');
    assert.equal(result.payload.data.red_flag_override,true);
    assert.equal(result.payload.data.override_route,'referral_required');
    assert.equal(result.payload.data.disposition,'urgent_active_specialty_referral');
  });

  test('duplicate replay is stable and cross-founder state access is denied', async () => {
    const { env, sqlite } = database();
    const a=await createContext(env,'idem');
    await createContext(env,'other');
    const body={context_id:a.context.context_id,acuity:greenAcuity,confidence:highConfidence};
    const first=await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:idem',key:'same-triage',body});
    const replay=await call(env,'/api/v1/day2/triage',{method:'POST',actor:'principal:idem',key:'same-triage',body});
    assert.equal(first.response.status,201);
    assert.equal(replay.response.status,200);
    assert.equal(replay.payload.meta.idempotent_replay,true);
    assert.equal(replay.payload.data.result_id,first.payload.data.result_id);
    assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM gv1_day2_intake_results WHERE result_type='triage' AND context_id=?").get(a.context.context_id).n,1);
    const denied=await call(env,`/api/v1/day2/intake-state/${a.context.context_id}`,{actor:'principal:other'});
    assert.equal(denied.response.status,403);
  });
}

const FOUNDER_READINESS_DIMENSIONS = [
  'clarity','runway','time','capability','network','domain_knowledge',
  'opportunity_evidence','decision_confidence','leadership_readiness','operating_willingness'
];
const BUSINESS_HEALTH_DIMENSIONS = [
  'revenue','customer','product','leadership','technology','distribution','problem','business_model'
];
