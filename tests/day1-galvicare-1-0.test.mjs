import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker, { GALVICARE_RELEASE, GALVICARE_SCHEMA } from '../worker/day1.js';

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
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    PRAGMA foreign_keys=ON;
    CREATE TABLE gv1_schema_migrations (
      migration_id TEXT PRIMARY KEY, name TEXT NOT NULL, environment TEXT NOT NULL,
      checksum TEXT, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO gv1_schema_migrations(migration_id,name,environment,checksum)
      VALUES('0001','legacy','qa','legacy');
    CREATE TABLE gv1_founders (
      founder_id TEXT PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT,
      phone TEXT, consent_status TEXT NOT NULL DEFAULT 'pending', status TEXT NOT NULL DEFAULT 'active',
      record_version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX ux_gv1_founders_email ON gv1_founders(lower(email)) WHERE email IS NOT NULL AND email<>'';
    CREATE TABLE gv1_ventures (
      venture_id TEXT PRIMARY KEY, venture_name TEXT NOT NULL, stage TEXT, status TEXT NOT NULL DEFAULT 'active',
      record_version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE gv1_founder_venture_roles (
      founder_id TEXT NOT NULL, venture_id TEXT NOT NULL, role_code TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      PRIMARY KEY(founder_id,venture_id,role_code),
      FOREIGN KEY(founder_id) REFERENCES gv1_founders(founder_id),
      FOREIGN KEY(venture_id) REFERENCES gv1_ventures(venture_id)
    );
    CREATE TABLE gv1_business_medical_records (
      bmr_id TEXT PRIMARY KEY, venture_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open',
      record_version INTEGER NOT NULL DEFAULT 1, current_session_id TEXT,
      opened_at TEXT NOT NULL, closed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY(venture_id) REFERENCES gv1_ventures(venture_id)
    );
    CREATE TABLE gv1_evidence_items (
      evidence_id TEXT PRIMARY KEY, bmr_id TEXT NOT NULL, session_id TEXT,
      evidence_type TEXT NOT NULL, source_product TEXT, source_reference TEXT,
      content_json TEXT NOT NULL, confidence REAL, evidence_version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY(bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
    );
    CREATE TABLE gv1_audit_log (
      audit_id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
      operation TEXT NOT NULL, prior_version INTEGER, new_version INTEGER,
      actor_type TEXT NOT NULL, source TEXT NOT NULL, reason_code TEXT, safe_change_json TEXT,
      correlation_id TEXT NOT NULL, environment TEXT NOT NULL, occurred_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);
  sqlite.exec(read('migrations/day1/0100_galvicare_1_0_day1_foundation.sql'));
  return { sqlite, env: { ENVIRONMENT:'qa', FIXTURE_MODE:'true', ALLOWED_ORIGINS:'https://galvipro.com', DB:new D1DatabaseMock(sqlite) } };
}

async function call(env, pathname, { method='GET', actor, key, body, origin='https://galvipro.com' } = {}) {
  const headers = new Headers({ Origin: origin, 'X-Correlation-Id': `corr_${Math.random().toString(16).slice(2)}` });
  if (actor) headers.set('X-Galvi-Day1-Actor', actor);
  if (key) headers.set('Idempotency-Key', key);
  if (body !== undefined) headers.set('Content-Type','application/json');
  const response = await worker.fetch(new Request(`https://day1.test${pathname}`, {
    method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  }), env);
  const payload = response.status === 204 ? null : await response.json();
  return { response, payload };
}

function actorEmail(suffix) { return `day1.${suffix}@example.invalid`; }

if (process.env.DAY1_V10_REMOTE_SMOKE === '1') {
  test('remote GalviCare 1.0 Day 1 smoke', async () => {
    const base = String(process.env.DAY1_BASE_URL || '').replace(/\/$/,'');
    assert.ok(base, 'DAY1_BASE_URL is required');
    const run = String(process.env.DAY1_RUN_SUFFIX || Date.now()).replace(/[^A-Za-z0-9._-]/g,'_').toLowerCase();
    const a = `remotea_${run}`;
    const b = `remoteb_${run}`;
    const req = async (pathname, options={}) => {
      const headers = new Headers(options.headers || {});
      headers.set('Origin','https://galvipro.com');
      headers.set('X-Correlation-Id',`corr_v10_${run}_${Math.random().toString(16).slice(2)}`);
      const response = await fetch(`${base}${pathname}`, {...options, headers});
      const payload = response.status === 204 ? null : await response.json();
      return {response,payload};
    };
    const health = await req('/health');
    assert.equal(health.response.status,200);
    assert.equal(health.payload.data.release_version,GALVICARE_RELEASE);
    assert.equal(health.payload.data.galvicare_schema_version,GALVICARE_SCHEMA);
    assert.equal(health.payload.data.capabilities.ai_enabled,false);
    const ready = await req('/api/v1/day1/readiness',{headers:{'X-Galvi-Day1-Actor':`principal:${a}`}});
    assert.equal(ready.response.status,200);
    assert.equal(ready.payload.data.ready,true);

    const preBody={email:actorEmail(a),first_name:'Pre',last_name:'Founder',lifecycle_state:'pre_founder',record_mode:'principal_only',care_protocol:'founder_smb',payer_type:'self'};
    const pre = await req('/api/v1/principal-contexts',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`ctx-${run}-a`,'X-Galvi-Day1-Actor':`principal:${a}`},body:JSON.stringify(preBody)});
    assert.equal(pre.response.status,201);
    assert.equal(pre.payload.data.context.venture_id,null);
    assert.equal(pre.payload.data.context.bmr_id,null);
    const replay = await req('/api/v1/principal-contexts',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`ctx-${run}-a`,'X-Galvi-Day1-Actor':`principal:${a}`},body:JSON.stringify(preBody)});
    assert.equal(replay.response.status,200);
    assert.equal(replay.payload.meta.idempotent_replay,true);

    const deniedEvidence = await req('/api/v1/evidence',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`ev-denied-${run}`,'X-Galvi-Day1-Actor':`principal:${a}`},body:JSON.stringify({founder_id:pre.payload.data.principal.founder_id,category:'foundational',validation_status:'reported',source_type:'founder_report',payload:{stage:'idea'}})});
    assert.equal(deniedEvidence.response.status,403);
    assert.equal(deniedEvidence.payload.error.code,'GV_CONSENT_REQUIRED');

    const consent = await req('/api/v1/consents',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`cns-${run}-a`,'X-Galvi-Day1-Actor':`principal:${a}`},body:JSON.stringify({founder_id:pre.payload.data.principal.founder_id,purpose:'care_processing',policy_version:'day1_qa_v1',status:'granted'})});
    assert.equal(consent.response.status,201);
    const principalEvidence = await req('/api/v1/evidence',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`ev-${run}-a`,'X-Galvi-Day1-Actor':`principal:${a}`},body:JSON.stringify({founder_id:pre.payload.data.principal.founder_id,category:'foundational',validation_status:'reported',source_type:'founder_report',payload:{stage:'idea'},provenance:{run}})});
    assert.equal(principalEvidence.response.status,201);
    assert.equal(principalEvidence.payload.data.evidence.scope,'principal');
    assert.equal(principalEvidence.payload.data.evidence.bmr_id,null);

    const op = await req('/api/v1/principal-contexts',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`ctx-${run}-b`,'X-Galvi-Day1-Actor':`principal:${b}`},body:JSON.stringify({email:actorEmail(b),first_name:'Operating',last_name:'Founder',lifecycle_state:'founder',record_mode:'principal_plus_venture',care_protocol:'founder_smb',payer_type:'self',venture_name:`Day1 Venture ${run}`})});
    assert.equal(op.response.status,201);
    assert.ok(op.payload.data.context.venture_id);
    assert.ok(op.payload.data.context.bmr_id);
    const opConsent = await req('/api/v1/consents',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`cns-${run}-b`,'X-Galvi-Day1-Actor':`principal:${b}`},body:JSON.stringify({founder_id:op.payload.data.principal.founder_id,bmr_id:op.payload.data.context.bmr_id,purpose:'care_processing',policy_version:'day1_qa_v1',status:'granted'})});
    assert.equal(opConsent.response.status,201);
    const bmrEvidence = await req('/api/v1/evidence',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`ev-${run}-b`,'X-Galvi-Day1-Actor':`principal:${b}`},body:JSON.stringify({founder_id:op.payload.data.principal.founder_id,bmr_id:op.payload.data.context.bmr_id,category:'operational',validation_status:'reported',source_type:'founder_report',payload:{revenue_band:'synthetic'},provenance:{run}})});
    assert.equal(bmrEvidence.response.status,201);
    assert.equal(bmrEvidence.payload.data.evidence.scope,'bmr');

    const cross = await req('/api/v1/evidence-links',{method:'POST',headers:{'content-type':'application/json','idempotency-key':`lnk-${run}`,'X-Galvi-Day1-Actor':'business_physician'},body:JSON.stringify({source_kind:'principal',source_evidence_id:principalEvidence.payload.data.evidence.evidence_id,target_kind:'bmr',target_evidence_id:bmrEvidence.payload.data.evidence.evidence_id,relationship_type:'supports'})});
    assert.equal(cross.response.status,409);
    assert.equal(cross.payload.error.code,'GV_SCOPE_MISMATCH');

    console.log(JSON.stringify({run,pre_founder_id:pre.payload.data.principal.founder_id,pre_context_id:pre.payload.data.context.context_id,operating_founder_id:op.payload.data.principal.founder_id,venture_id:op.payload.data.context.venture_id,bmr_id:op.payload.data.context.bmr_id,principal_evidence_id:principalEvidence.payload.data.evidence.evidence_id,bmr_evidence_id:bmrEvidence.payload.data.evidence.evidence_id},null,2));
  });
} else {
  test('0100 migration is additive and exposes the Day 1 contract tables', () => {
    const sql = read('migrations/day1/0100_galvicare_1_0_day1_foundation.sql');
    assert.doesNotMatch(sql,/\b(DROP|TRUNCATE)\b/i);
    const {sqlite}=database();
    const names=new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name));
    for(const name of ['gv1_principal_contexts','gv1_consent_events','gv1_principal_evidence_items','gv1_evidence_lineage_links','gv1_day1_request_receipts']) assert.ok(names.has(name),name);
    const migration=sqlite.prepare("SELECT migration_id,name,environment FROM gv1_schema_migrations WHERE migration_id='0100'").get();
    assert.equal(migration.environment,'qa');
  });

  test('health preserves legacy identity and self-identifies GalviCare 1.0 with AI off', async()=>{
    const {env}=database();
    const {response,payload}=await call(env,'/health');
    assert.equal(response.status,200);
    assert.equal(payload.data.service,'galvivault-p0');
    assert.equal(payload.data.release_version,GALVICARE_RELEASE);
    assert.equal(payload.data.galvicare_schema_version,GALVICARE_SCHEMA);
    assert.equal(payload.data.capabilities.pre_founder,true);
    assert.equal(payload.data.capabilities.ai_enabled,false);
  });

  test('Pre-Founder is principal-only, replay-safe, and cross-principal access is denied',async()=>{
    const {env,sqlite}=database();
    const body={email:actorEmail('a'),first_name:'Pre',last_name:'Founder',lifecycle_state:'pre_founder',record_mode:'principal_only'};
    const created=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:a',key:'ctx-a-001',body});
    assert.equal(created.response.status,201);
    assert.equal(created.payload.data.context.venture_id,null);
    assert.equal(created.payload.data.context.bmr_id,null);
    const replay=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:a',key:'ctx-a-001',body});
    assert.equal(replay.response.status,200);
    assert.equal(replay.payload.meta.idempotent_replay,true);
    assert.equal(replay.payload.data.context.context_id,created.payload.data.context.context_id);
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_founders').get().n,1);
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_ventures').get().n,0);
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_business_medical_records').get().n,0);
    const denied=await call(env,`/api/v1/principal-contexts/${created.payload.data.context.context_id}`,{actor:'principal:b'});
    assert.equal(denied.response.status,403);
    assert.equal(denied.payload.error.code,'GV_AUTH_FORBIDDEN');
  });

  test('consent fails closed, versions history, and gates principal evidence',async()=>{
    const {env,sqlite}=database();
    const ctx=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:a',key:'ctx-consent-a',body:{email:actorEmail('a'),lifecycle_state:'pre_founder',record_mode:'principal_only'}});
    const founderId=ctx.payload.data.principal.founder_id;
    const denied=await call(env,'/api/v1/evidence',{method:'POST',actor:'principal:a',key:'ev-denied-a',body:{founder_id:founderId,category:'foundational',validation_status:'reported',source_type:'founder_report',payload:{stage:'idea'}}});
    assert.equal(denied.response.status,403);
    assert.equal(denied.payload.status,'consent_required');
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_principal_evidence_items').get().n,0);
    const grant=await call(env,'/api/v1/consents',{method:'POST',actor:'principal:a',key:'cns-grant-a',body:{founder_id:founderId,purpose:'care_processing',policy_version:'qa_v1',status:'granted'}});
    assert.equal(grant.response.status,201);
    const evidence=await call(env,'/api/v1/evidence',{method:'POST',actor:'principal:a',key:'ev-a-001',body:{founder_id:founderId,category:'foundational',validation_status:'reported',source_type:'founder_report',payload:{stage:'idea'},provenance:{source:'qa'}}});
    assert.equal(evidence.response.status,201);
    assert.equal(evidence.payload.data.evidence.scope,'principal');
    const withdraw=await call(env,'/api/v1/consents',{method:'POST',actor:'principal:a',key:'cns-withdraw-a',body:{founder_id:founderId,purpose:'care_processing',policy_version:'qa_v1',status:'withdrawn'}});
    assert.equal(withdraw.response.status,201);
    assert.equal(withdraw.payload.data.consent.supersedes_consent_id,grant.payload.data.consent.consent_id);
    const status=await call(env,`/api/v1/consents/status?founder_id=${founderId}&purpose=care_processing`,{actor:'principal:a'});
    assert.equal(status.payload.data.current.status,'withdrawn');
    assert.equal(status.payload.data.history.length,2);
    const blocked=await call(env,'/api/v1/evidence',{method:'POST',actor:'principal:a',key:'ev-after-withdraw',body:{founder_id:founderId,category:'operational',validation_status:'reported',source_type:'founder_report',payload:{x:1}}});
    assert.equal(blocked.response.status,403);
  });

  test('operating founder resolves exactly one BMR per venture and replay is stable',async()=>{
    const {env,sqlite}=database();
    const body={email:actorEmail('b'),lifecycle_state:'founder',record_mode:'principal_plus_venture',venture_name:'Synthetic Operating Venture'};
    const one=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:b',key:'ctx-b-001',body});
    const replay=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:b',key:'ctx-b-001',body});
    assert.equal(one.response.status,201);
    assert.equal(replay.response.status,200);
    assert.equal(one.payload.data.context.bmr_id,replay.payload.data.context.bmr_id);
    assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_business_medical_records WHERE venture_id=?').get(one.payload.data.context.venture_id).n,1);
  });

  test('venture evidence stays scoped and cross-principal lineage is rejected',async()=>{
    const {env}=database();
    const aCtx=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:a',key:'ctx-line-a',body:{email:actorEmail('a'),lifecycle_state:'pre_founder',record_mode:'principal_only'}});
    const bCtx=await call(env,'/api/v1/principal-contexts',{method:'POST',actor:'principal:b',key:'ctx-line-b',body:{email:actorEmail('b'),lifecycle_state:'founder',record_mode:'principal_plus_venture',venture_name:'Scoped Venture'}});
    await call(env,'/api/v1/consents',{method:'POST',actor:'principal:a',key:'cns-line-a',body:{founder_id:aCtx.payload.data.principal.founder_id,purpose:'care_processing',policy_version:'qa_v1',status:'granted'}});
    await call(env,'/api/v1/consents',{method:'POST',actor:'principal:b',key:'cns-line-b',body:{founder_id:bCtx.payload.data.principal.founder_id,bmr_id:bCtx.payload.data.context.bmr_id,purpose:'care_processing',policy_version:'qa_v1',status:'granted'}});
    const aEv=await call(env,'/api/v1/evidence',{method:'POST',actor:'principal:a',key:'ev-line-a',body:{founder_id:aCtx.payload.data.principal.founder_id,category:'strategic',validation_status:'reported',source_type:'founder_report',payload:{market:'synthetic'}}});
    const bEv=await call(env,'/api/v1/evidence',{method:'POST',actor:'principal:b',key:'ev-line-b',body:{founder_id:bCtx.payload.data.principal.founder_id,bmr_id:bCtx.payload.data.context.bmr_id,category:'operational',validation_status:'reported',source_type:'founder_report',payload:{revenue:'synthetic'}}});
    const cross=await call(env,'/api/v1/evidence-links',{method:'POST',actor:'business_physician',key:'lnk-cross',body:{source_kind:'principal',source_evidence_id:aEv.payload.data.evidence.evidence_id,target_kind:'bmr',target_evidence_id:bEv.payload.data.evidence.evidence_id,relationship_type:'supports'}});
    assert.equal(cross.response.status,409);
    assert.equal(cross.payload.error.code,'GV_SCOPE_MISMATCH');
    const support=await call(env,`/api/v1/evidence?founder_id=${bCtx.payload.data.principal.founder_id}`,{actor:'support'});
    assert.equal(support.response.status,403);
  });
}
