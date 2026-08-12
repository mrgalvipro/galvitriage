import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { composeFounderIntelligenceContext, getFounderHealthProjection, importHistoricalFounder, normalizeFounderEmail, sanitizeIntelligenceReference, validateHistoricalRow } from '../worker/domain/founder-history-service.js';
import { handleOperatorWorkspace } from '../worker/routes/operator-workspace.js';
import day2Worker from '../worker/day2.js';

const fixture=JSON.parse(fs.readFileSync(new URL('../data/day9/fhr-identity-manifest.example.json',import.meta.url)));
class Statement{constructor(db,sql,params=[]){this.db=db;this.sql=sql;this.params=params}bind(...p){return new Statement(this.db,this.sql,p)}async first(){return this.db.prepare(this.sql).get(...this.params)??null}async all(){return {results:this.db.prepare(this.sql).all(...this.params)}}async run(){return this.db.prepare(this.sql).run(...this.params)}}
class D1{constructor(db){this.db=db}prepare(sql){return new Statement(this.db,sql)}async batch(stmts){this.db.exec('BEGIN');try{for(const s of stmts)await s.run();this.db.exec('COMMIT')}catch(e){this.db.exec('ROLLBACK');throw e}}}
function database(){const sqlite=new DatabaseSync(':memory:');for(const name of ['0001_canonical_business_medical_record.sql','0002_day2_identity_continuity.sql','0003_day3_evidence_versioning.sql','0004_day4_governed_reasoning.sql','0005_day5_governed_care.sql'])sqlite.exec(fs.readFileSync(new URL(`../migrations/day1/${name}`,import.meta.url),'utf8'));return {sqlite,env:{DB:new D1(sqlite)}};}

test('Day 9 secure manifest is synthetic, normalized, provenance-bearing, and maps only historical observations',async()=>{
  const row={...fixture.rows[0],email:'  SYNTHETIC.FOUNDER@EXAMPLE.INVALID  '};
  const result=await validateHistoricalRow(row);
  assert.equal(result.valid,true);assert.equal(result.normalized.email,'synthetic.founder@example.invalid');
  assert.equal(result.normalized.observations.length,6);
  assert.ok(result.normalized.observations.every(x=>['snapshot','genome','growth_opportunity','next_step'].includes(x.section)));
  assert.equal(JSON.stringify(fixture).includes('@gmail.com'),false);
});

test('missing source and checksum are explicitly reconciled as a skipped quarantine with no canonical mutation',async()=>{
  const {sqlite,env}=database(),ctx={environment:'qa',correlation:'corr_quarantine'},actor={role:'business_physician',operator_id:'opr_test'};
  const row={...fixture.rows[0],source_row_key:'synthetic-quarantine-001',email:'synthetic.quarantine@example.invalid',venture_name:'Synthetic Quarantine Labs',source_ref:'',source_artifact_checksum:''};
  const validated=await validateHistoricalRow(row);
  assert.equal(validated.valid,false);assert.deepEqual(validated.issues,['source_reference_required','sha256_checksum_required']);
  const result=await importHistoricalFounder(env,ctx,actor,row,{batchId:'imp_day9_quarantine'});
  assert.equal(result.disposition,'quarantine');assert.equal(result.result_type,'skipped');assert.equal(result.idempotent_replay,false);
  const replay=await importHistoricalFounder(env,ctx,actor,row,{batchId:'imp_day9_quarantine'});
  assert.equal(replay.idempotent_replay,true);assert.equal(replay.result_type,'skipped');
  const batch=sqlite.prepare(`SELECT expected_count,processed_count,imported_count,skipped_count,error_count FROM gv1_import_batches WHERE import_batch_id='imp_day9_quarantine'`).get();
  assert.equal(batch.expected_count,1);assert.equal(batch.processed_count,1);assert.equal(batch.imported_count,0);assert.equal(batch.skipped_count,1);assert.equal(batch.error_count,0);
  assert.equal(batch.processed_count,batch.imported_count+batch.skipped_count+batch.error_count);
  const receipt=sqlite.prepare(`SELECT result_type,error_code FROM gv1_import_row_receipts WHERE import_batch_id='imp_day9_quarantine'`).get();
  assert.equal(receipt.result_type,'skipped');assert.equal(receipt.error_code,'GV_IMPORT_QUARANTINED');
  assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM gv1_import_errors WHERE import_batch_id='imp_day9_quarantine'`).get().n,1);
  assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM gv1_founders WHERE normalized_email='synthetic.quarantine@example.invalid'`).get().n,0);
  assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM gv1_ventures WHERE lower(venture_name)='synthetic quarantine labs'`).get().n,0);
});

test('identity normalization does not use display name as canonical identity',()=>assert.equal(normalizeFounderEmail(' Founder@Example.Invalid '),'founder@example.invalid'));

test('Aidan intelligence reference excludes known mixed-source contamination and never creates canonical care',()=>{
  const result=sanitizeIntelligenceReference({sections:['Aidan-specific synthetic leadership pattern','Harry Duplex hospital AMR content']});
  assert.equal(result.status,'proposed');assert.equal(result.accepted_sections.length,1);assert.equal(result.quarantined_count,1);assert.equal(result.canonical_profile_created,false);assert.deepEqual(result.source_bmr_ids,[]);
});

test('authenticated Day 9 intelligence-reference route creates only a proposed governed learning candidate',async()=>{
  const {sqlite,env}=database(),ctx={environment:'qa',correlation:'corr_aidan'},identity={role:'business_physician',operator_id:'opr_test',display_name:'Tester',exp:4102444800};
  const request=new Request('https://worker.test/api/v1/operator/day9/intelligence-reference',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':'day9-aidan-reference-001'},body:JSON.stringify({sections:['Aidan-specific synthetic leadership pattern','Harry Duplex hospital AMR content']})});
  const response=await handleOperatorWorkspace(request,env,ctx,'/api/v1/operator/day9/intelligence-reference',identity);
  assert.equal(response.status,201);
  const body=await response.json();
  assert.equal(body.data.sanitized.accepted_sections.length,1);assert.equal(body.data.sanitized.quarantined_count,1);assert.equal(body.data.sanitized.canonical_profile_created,false);
  assert.equal(body.data.learning_candidate.candidate_type,'historical_founder_pattern_reference');assert.equal(body.data.learning_candidate.status,'proposed');assert.equal(body.data.learning_candidate.bmr_id,null);
  assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM gv1_founders`).get().n,0);
  assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM gv1_business_medical_records`).get().n,0);
  assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM gv1_knowledge_items WHERE status='active'`).get().n,0);
});

test('Day 9 routes remain under authenticated operator namespace and public runtime is unchanged',()=>{
  const entry=fs.readFileSync(new URL('../worker/day8-entry.js',import.meta.url),'utf8');
  const route=fs.readFileSync(new URL('../worker/routes/operator-workspace.js',import.meta.url),'utf8');
  assert.match(route,/\/api\/v1\/operator\/day9\/historical-import/);assert.match(route,/founder-intelligence-context/);assert.match(route,/\/api\/v1\/operator\/day9\/intelligence-reference/);
  assert.match(entry,/path\.startsWith\('\/api\/v1\/operator\/'\)/);
  assert.doesNotMatch(entry,/public.*founder-intelligence/i);
});

test('FHR is a read-only projection and historical import creates no care records',()=>{
  const source=fs.readFileSync(new URL('../worker/domain/founder-history-service.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/INSERT INTO gv1_(findings|recommendations|treatment_plans|outcomes)/);
  assert.match(source,/gv1_observation_evidence/);assert.match(source,/e\.bmr_id=o\.bmr_id/);assert.match(source,/GV_IMPORT_FINGERPRINT_CONFLICT/);assert.match(source,/GV_VENTURE_AMBIGUOUS/);
});

test('one BMR per venture remains enforced by the released Day 2 schema without a Day 9 migration',()=>{
  const schema=fs.readFileSync(new URL('../migrations/day1/0002_day2_identity_continuity.sql',import.meta.url),'utf8');
  assert.match(schema,/UNIQUE INDEX IF NOT EXISTS ux_gv1_bmr_one_per_venture\s+ON gv1_business_medical_records\(venture_id\)/);
  assert.equal(fs.existsSync(new URL('../migrations/day9',import.meta.url)),false);
});

test('clinician chart labels historical context and distinguishes it from current care',()=>{
  const portal=fs.readFileSync(new URL('../clinician-portal/app.js',import.meta.url),'utf8');
  assert.match(portal,/Historical Founder Context \/ FHR/);assert.match(portal,/not a current finding, recommendation, treatment, or outcome/);assert.match(portal,/FCD\/GalviShot, as of/);
});

test('synthetic D1 import, replay, current-session intelligence context and continuity reconcile without care pollution',async()=>{
  const {sqlite,env}=database(),ctx={environment:'qa',correlation:'corr_day9'},actor={role:'business_physician',operator_id:'opr_test'};
  const first=await importHistoricalFounder(env,ctx,actor,fixture.rows[0],{batchId:'imp_day9_synthetic'});
  const replay=await importHistoricalFounder(env,ctx,actor,fixture.rows[0],{batchId:'imp_day9_synthetic'});
  assert.equal(replay.idempotent_replay,true);assert.equal(replay.bmr_id,first.bmr_id);
  assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_business_medical_records WHERE venture_id=?').get(first.venture_id).n,1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_assessment_sessions WHERE bmr_id=?').get(first.bmr_id).n,1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM gv1_observations o LEFT JOIN gv1_observation_evidence x ON x.observation_id=o.observation_id WHERE o.bmr_id=? AND x.evidence_id IS NULL').get(first.bmr_id).n,0);
  for(const table of ['gv1_findings','gv1_recommendations','gv1_treatment_plans','gv1_outcomes'])assert.equal(sqlite.prepare(`SELECT COUNT(*) n FROM ${table} WHERE bmr_id=?`).get(first.bmr_id).n,0);
  const fhr=await getFounderHealthProjection(env,first.bmr_id);assert.equal(fhr.provenance.observation_refs.length,6);assert.equal(fhr.founder_snapshot.archetype.evidence_ref,first.evidence_id);
  const historicalOnly=await composeFounderIntelligenceContext(env,actor,{founderId:first.founder_id,ventureId:first.venture_id,bmrId:first.bmr_id});
  assert.equal(historicalOnly.continuity_status,'historical_only');assert.equal(historicalOnly.current_business_health.current_session_ref,null);
  await assert.rejects(()=>composeFounderIntelligenceContext(env,{role:'public'},{founderId:first.founder_id,ventureId:first.venture_id,bmrId:first.bmr_id}),e=>e.code==='GV_AUTH_FORBIDDEN');
  await assert.rejects(()=>importHistoricalFounder(env,ctx,actor,{...fixture.rows[0],source_artifact_checksum:'b'.repeat(64)},{batchId:'imp_day9_synthetic'}),e=>e.code==='GV_IMPORT_FINGERPRINT_CONFLICT');
  const batch=sqlite.prepare('SELECT processed_count,imported_count,skipped_count,error_count FROM gv1_import_batches').get();assert.equal(batch.processed_count,batch.imported_count+batch.skipped_count+batch.error_count);
  Object.assign(env,{ENVIRONMENT:'qa',FIXTURE_MODE:'true',MIN_SCHEMA_VERSION:'0002',ALLOWED_ORIGINS:'https://galvipro.com'});
  const publicBody={client_session_key:'day9-returning-session',source:'galvicare',current_stage:'GalviTriage',founder:{email:' SYNTHETIC.FOUNDER@EXAMPLE.INVALID ',first_name:'Display Name Changed'},venture:{venture_name:'Synthetic Continuity Labs'}};
  const response=await day2Worker.fetch(new Request('https://worker.test/api/v1/sessions',{method:'POST',headers:{Origin:'https://galvipro.com','Content-Type':'application/json','Idempotency-Key':'day9-returning-create'},body:JSON.stringify(publicBody)}),env);
  assert.equal(response.status,201);const identity=(await response.json()).data.identity;
  assert.equal(identity.founder.founder_id,first.founder_id);assert.equal(identity.venture.venture_id,first.venture_id);assert.equal(identity.business_medical_record.bmr_id,first.bmr_id);assert.notEqual(identity.session.session_id,first.historical_session_id);
  assert.equal(JSON.stringify(identity).includes('historical_fhr'),false);assert.equal(JSON.stringify(identity).includes('founder_intelligence'),false);
  const context=await composeFounderIntelligenceContext(env,actor,{founderId:first.founder_id,ventureId:first.venture_id,bmrId:first.bmr_id});
  assert.equal(context.continuity_status,'returning_same_venture');assert.equal(context.current_business_health.current_session_ref,identity.session.session_id);assert.equal(context.current_business_health.current_session.source,'galvicare');
  assert.ok(context.evidence_refs.includes(first.evidence_id));
  const newVentureResponse=await day2Worker.fetch(new Request('https://worker.test/api/v1/sessions',{method:'POST',headers:{Origin:'https://galvipro.com','Content-Type':'application/json','Idempotency-Key':'day9-new-venture'},body:JSON.stringify({...publicBody,client_session_key:'day9-new-venture-session',venture:{venture_name:'Separate Synthetic Venture'}})}),env);
  const newIdentity=(await newVentureResponse.json()).data.identity;assert.equal(newIdentity.founder.founder_id,first.founder_id);assert.notEqual(newIdentity.venture.venture_id,first.venture_id);assert.notEqual(newIdentity.business_medical_record.bmr_id,first.bmr_id);
});
