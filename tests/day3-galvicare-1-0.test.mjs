import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker, { GALVICARE_RELEASE, GALVICARE_SCHEMA, PROMPT_VERSION } from '../worker/day3-galvicare-1-0.js';
import unifiedWorker from '../worker/day3-unified-customer-api.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
class Stmt {
  constructor(db,sql,params=[]){this.db=db;this.sql=sql;this.params=params}
  bind(...params){return new Stmt(this.db,this.sql,params)}
  async first(){return this.db.prepare(this.sql).get(...this.params)??null}
  async all(){return {success:true,results:this.db.prepare(this.sql).all(...this.params)}}
  async run(){const r=this.db.prepare(this.sql).run(...this.params);return {success:true,meta:{changes:Number(r.changes)}}}
}
class D1 {
  constructor(db){this.db=db}
  prepare(sql){return new Stmt(this.db,sql)}
  async batch(statements){this.db.exec('BEGIN IMMEDIATE');try{const out=[];for(const s of statements)out.push(await s.run());this.db.exec('COMMIT');return out}catch(e){this.db.exec('ROLLBACK');throw e}}
}
function db(){
  const sqlite=new DatabaseSync(':memory:');
  for(const m of [
    'migrations/day1/0001_canonical_business_medical_record.sql',
    'migrations/day1/0100_galvicare_1_0_day1_foundation.sql',
    'migrations/day1/0101_day1_principal_session_continuity.sql',
    'migrations/day1/0102_galvicare_1_0_day2_intake_results.sql',
    'migrations/day1/0103_galvicare_1_0_day3_governed_ai.sql'
  ]) sqlite.exec(read(m));
  return {sqlite,env:{ENVIRONMENT:'qa',FIXTURE_MODE:'true',AI_ENABLED:'true',OPENAI_MODEL_QA:'gpt-5-mini',COMMIT_SHA:'local-day3-test',ALLOWED_ORIGINS:'https://galvipro.com',DB:new D1(sqlite)}};
}
const now=()=>new Date().toISOString();
function seed(sqlite,suffix,{operating=true,confidence=90,regulated=false}={}){
  const t=now(), founder=`fdr_${suffix}`, context=`ctx_${suffix}`, venture=operating?`ven_${suffix}`:null, bmr=operating?`bmr_${suffix}`:null;
  sqlite.prepare("INSERT INTO gv1_founders(founder_id,email,consent_status,status,record_version,created_at,updated_at) VALUES(?,?,'pending','active',1,?,?)").run(founder,`day1.${suffix}@example.invalid`,t,t);
  if(operating){
    sqlite.prepare("INSERT INTO gv1_ventures(venture_id,venture_name,stage,status,record_version,created_at,updated_at) VALUES(?,?,'founder','active',1,?,?)").run(venture,`Venture ${suffix}`,t,t);
    sqlite.prepare("INSERT INTO gv1_founder_venture_roles(founder_id,venture_id,role_code,is_primary,status,created_at,updated_at) VALUES(?,?,'founder',1,'active',?,?)").run(founder,venture,t,t);
    sqlite.prepare("INSERT INTO gv1_business_medical_records(bmr_id,venture_id,status,record_version,current_session_id,opened_at,created_at,updated_at) VALUES(?,?,'open',1,NULL,?,?,?)").run(bmr,venture,t,t,t);
  }
  sqlite.prepare("INSERT INTO gv1_principal_contexts(context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,source,status,record_version,client_request_id,created_at,updated_at) VALUES(?,?,?,'founder_smb','self',?,?,?,'galvicare_1_0','active',1,?,?,?)")
    .run(context,founder,operating?'founder':'pre_founder',operating?'principal_plus_venture':'principal_only',venture,bmr,`req_${suffix}`,t,t);
  sqlite.prepare("INSERT INTO gv1_consent_events(consent_id,founder_id,bmr_id,purpose,policy_version,status,actor_type,actor_id,effective_at,recorded_at,supersedes_consent_id,client_request_id,source,metadata_json) VALUES(?,?,?,'care_processing','day3_qa_v1','granted','customer',?,?,?,NULL,?,'galvicare_1_0','{}')")
    .run(`cns_${suffix}`,founder,bmr,founder,t,t,`cnsreq_${suffix}`);
  const evidence=operating?`evd_${suffix}`:`evp_${suffix}`;
  if(operating){
    sqlite.prepare("INSERT INTO gv1_evidence_items(evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at) VALUES(?,? ,NULL,'operational','GalviCare1.0','day2',?,NULL,1,?)")
      .run(evidence,bmr,JSON.stringify({founder_id:founder,validation_status:'reported',payload:{revenue_signal:'weak',product_retention:'strong',distribution:'inconsistent'}}),t);
  }else{
    sqlite.prepare("INSERT INTO gv1_principal_evidence_items(evidence_id,founder_id,evidence_group_id,version_no,supersedes_evidence_id,category,source_type,source_ref,validation_status,payload_json,provenance_json,schema_version,actor_type,actor_id,client_request_id,captured_at,created_at,status) VALUES(?,?,?,1,NULL,'foundational','galvicare_day2','day2','reported',?,'{}','0100','customer',?,?,?,?,'accepted')")
      .run(evidence,founder,`evg_${suffix}`,JSON.stringify({readiness_signal:'exploring'}),founder,`evreq_${suffix}`,t,t);
  }
  const dims=operating?{revenue:42,customer:65,product:82,leadership:70,technology:72,distribution:38,problem:80,business_model:68}:{clarity:70,runway:65,time:60,capability:70,network:55,domain_knowledge:75,opportunity_evidence:60,decision_confidence:65,leadership_readiness:70,operating_willingness:80};
  const tri={result_id:`tri_${suffix}`,product:'GalviTriage',score_type:operating?'business_health':'founder_readiness',acuity_score:regulated?25:10,acuity_band:regulated?'yellow':'green',clinical_confidence:confidence,red_flag_override:regulated,red_flags:regulated?['regulated_professional_dependency']:[],override_route:regulated?'referral_required':null,disposition:regulated?'urgent_active_specialty_referral':'passive_monitoring',next_action:regulated?'referral':'continue_vitals',unresolved_evidence_gaps:confidence<60?['evidence_quality']:[],supporting_evidence_ids:[evidence],generation_source:'rules'};
  const vit={result_id:`vit_${suffix}`,product:'GalviVitals',score_type:operating?'business_health':'founder_readiness',overall_score:65,dimension_scores:dims,clinical_confidence:confidence,unresolved_evidence_gaps:confidence<60?['evidence_quality']:[],supporting_evidence_ids:[evidence],generation_source:'rules'};
  const score={result_id:`score_${suffix}`,product:'GalviScore',score_type:operating?'business_health':'founder_readiness',overall_score:65,dimension_scores:dims,acuity_score:tri.acuity_score,acuity_band:tri.acuity_band,clinical_confidence:confidence,disposition:tri.disposition,next_action:tri.next_action,supporting_evidence_ids:[evidence],contradictory_evidence_ids:[],generation_source:'rules'};
  for(const [type,p] of [['triage',tri],['vitals',vit],['score',score]]){
    sqlite.prepare("INSERT INTO gv1_day2_intake_results(result_id,context_id,founder_id,bmr_id,result_type,score_type,payload_json,supporting_evidence_ids_json,contradictory_evidence_ids_json,rules_version,protocol_version,generation_source,request_fingerprint,record_version,client_request_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,'galviengine_1_0_score_v1','universal_business_health_v1','rules',?,1,?,?)")
      .run(p.result_id,context,founder,bmr,type,p.score_type,JSON.stringify(p),JSON.stringify([evidence]),'[]',`fp_${type}_${suffix}`,`req_${type}_${suffix}`,t);
  }
  return {founder,context,bmr,evidence};
}
function proposal(task,e){
  if(task==='explain_findings')return {findings:[{finding_code:'DISTRIBUTION_BOTTLENECK',statement:'Distribution is the clearest current constraint.',supporting_evidence_ids:[e],contradictory_evidence_ids:[],confidence:.78,reasoning_summary:'Product evidence is stronger than distribution evidence.',hypothesis_only:false,severity:'moderate',why_it_matters:'Distribution can constrain growth.',next_step:'Collect channel conversion evidence.'}]};
  if(task==='synthesize_evidence')return {summary:'Evidence supports a distribution constraint while broader causality remains uncertain.',supporting_evidence_ids:[e],contradictory_evidence_ids:[],confidence:.74,implications:['Validate channel performance before changing product strategy.'],hypotheses:[{code:'CHANNEL_EXECUTION_CONSTRAINT',statement:'A channel execution constraint may explain the pattern.',supporting_evidence_ids:[e],contradictory_evidence_ids:[],confidence:.64,what_would_change_this:['Evidence of strong acquisition efficiency.']}]};
  if(task==='draft_path')return {objective:'Improve evidence quality around distribution.',sequence:['Collect channel data.','Compare acquisition and retention.','Reassess the finding.'],evidence_required:['Channel conversion evidence.'],cadence:'Reassess after the next evidence cycle.',owner:'customer',escalation:'Escalate to GalviClinic if the constraint remains material.',support_level:'passive_care',supporting_evidence_ids:[e],contradictory_evidence_ids:[],confidence:.72};
  return {hypotheses:[{code:'CHANNEL_EXECUTION_CONSTRAINT',statement:'A channel execution constraint may explain the pattern.',supporting_evidence_ids:[e],contradictory_evidence_ids:[],confidence:.64,what_would_change_this:['New distribution evidence.']}]};
}
async function call(env,path,{suffix='a',body}={}){
  const h=new Headers({Origin:'https://galvipro.com','content-type':'application/json','x-galvi-day1-actor':`principal:${suffix}`});
  const r=await worker.fetch(new Request(`https://day3.test${path}`,{method:body?'POST':'GET',headers:h,...(body?{body:JSON.stringify(body)}:{})}),env);
  return {r,p:await r.json()};
}

test('T01 schema is additive and 0103 is present',()=>{const sql=read('migrations/day1/0103_galvicare_1_0_day3_governed_ai.sql');assert.doesNotMatch(sql,/\b(DROP|TRUNCATE|DELETE\s+FROM)\b/i);const {sqlite}=db();assert.equal(sqlite.prepare("SELECT environment FROM gv1_schema_migrations WHERE migration_id='0103'").get().environment,'qa')});
test('T04 health identifies Day 3 and governed fallback',async()=>{const {env}=db();env.DAY3_PROVIDER_MOCK=async()=>({proposal:{}});const {r,p}=await call(env,'/health');assert.equal(r.status,200);assert.equal(p.data.release_version,GALVICARE_RELEASE);assert.equal(p.data.galvicare_schema_version,GALVICARE_SCHEMA);assert.equal(p.data.capabilities.ai_enabled,true);assert.equal(p.data.capabilities.deterministic_fallback,true);assert.equal(p.data.capabilities.prompt_version,PROMPT_VERSION)});
test('T05/T06/T15/T19 accepted Shot is evidence-scoped and replay-safe',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'accepted');env.DAY3_PROVIDER_MOCK=async({task})=>({proposal:proposal(task,s.evidence),provider_response_id:'resp_ok'});const a=await call(env,'/api/v1/day3/shot',{suffix:'accepted',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(a.r.status,201);assert.equal(a.p.data.generation_source,'openai_governed');assert.deepEqual(a.p.data.supporting_evidence_ids,[s.evidence]);const b=await call(env,'/api/v1/day3/shot',{suffix:'accepted',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(b.p.data.generation_source,'stored');assert.equal(b.p.data.artifact_id,a.p.data.artifact_id);assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM gv1_day3_governed_artifacts WHERE context_id=?").get(s.context).n,1)});
test('T07 cross-record evidence is rejected before provider call',async()=>{const {env,sqlite}=db(),a=seed(sqlite,'scopea'),b=seed(sqlite,'scopeb');let n=0;env.DAY3_PROVIDER_MOCK=async()=>{n++;return{proposal:proposal('explain_findings',a.evidence)}};const x=await call(env,'/api/v1/day3/shot',{suffix:'scopea',body:{context_id:a.context,current_stage:'GalviShot',evidence_ids:[b.evidence]}});assert.equal(x.r.status,403);assert.equal(x.p.error.code,'GV_AI_EVIDENCE_SCOPE');assert.equal(n,0)});
test('T08/T17 deterministic/schema conflict cannot project',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'conflict');env.DAY3_PROVIDER_MOCK=async()=>({proposal:{...proposal('explain_findings',s.evidence),overall_score:999}});const x=await call(env,'/api/v1/day3/shot',{suffix:'conflict',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(x.p.meta.ai_status,'rejected');assert.equal(x.p.data.generation_source,'rules');const g=sqlite.prepare("SELECT validation_status,customer_projection FROM gv1_day3_ai_generations WHERE context_id=?").get(s.context);assert.equal(g.validation_status,'rejected');assert.equal(g.customer_projection,0);assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM gv1_day3_governed_artifacts WHERE context_id=?").get(s.context).n,0)});
test('T09 low confidence returns needs_evidence without provider',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'low',{confidence:35});let n=0;env.DAY3_PROVIDER_MOCK=async()=>{n++;return{proposal:proposal('explain_findings',s.evidence)}};const x=await call(env,'/api/v1/day3/shot',{suffix:'low',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(x.p.status,'needs_evidence');assert.equal(x.p.data.generation_source,'rules');assert.equal(n,0)});
test('T11 regulated red flag routes to referral without AI',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'regulated',{regulated:true});let n=0;env.DAY3_PROVIDER_MOCK=async()=>{n++;return{proposal:proposal('explain_findings',s.evidence)}};const x=await call(env,'/api/v1/day3/shot',{suffix:'regulated',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(x.p.status,'referral_required');assert.equal(n,0)});
test('T13/T14 provider outage preserves deterministic state',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'outage');env.DAY3_PROVIDER_MOCK=async()=>{throw new Error('outage')};const x=await call(env,'/api/v1/day3/shot',{suffix:'outage',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(x.r.status,200);assert.equal(x.p.meta.ai_status,'fallback_provider_error');assert.equal(x.p.data.generation_source,'rules');assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM gv1_day2_intake_results WHERE context_id=?").get(s.context).n,3)});
test('T20/T21 Sight and Path are bounded',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'products');env.DAY3_PROVIDER_MOCK=async({task})=>({proposal:proposal(task,s.evidence)});const sight=await call(env,'/api/v1/day3/sight',{suffix:'products',body:{context_id:s.context,current_stage:'GalviSight'}});assert.equal(sight.r.status,201);assert.ok(sight.p.data.content.summary);const path=await call(env,'/api/v1/day3/path',{suffix:'products',body:{context_id:s.context,current_stage:'GalviPath'}});assert.equal(path.r.status,201);assert.ok(path.p.data.content.objective);assert.doesNotMatch(JSON.stringify(path.p.data.content),/treatment (?:is )?confirmed/i)});
test('T22 Pre-Founder remains principal_only with no fabricated BHR',async()=>{const {env,sqlite}=db(),s=seed(sqlite,'prefounder',{operating:false});env.DAY3_PROVIDER_MOCK=async({task})=>({proposal:proposal(task,s.evidence)});const x=await call(env,'/api/v1/day3/shot',{suffix:'prefounder',body:{context_id:s.context,current_stage:'GalviShot'}});assert.equal(x.r.status,201);assert.equal(x.p.data.bmr_id,null);assert.equal(sqlite.prepare("SELECT bmr_id FROM gv1_day3_ai_generations WHERE context_id=?").get(s.context).bmr_id,null)});

test('T23 browser-realistic governed /api preflight permits JSON and no-cache headers',async()=>{
  const {env}=db();
  const origin='https://galvicare-0-5-qa.mrgalvipro.workers.dev';
  const response=await unifiedWorker.fetch(new Request('https://day3.test/api',{
    method:'OPTIONS',
    headers:{
      Origin:origin,
      'Access-Control-Request-Method':'POST',
      'Access-Control-Request-Headers':'content-type,cache-control'
    }
  }),env);
  assert.equal(response.status,204);
  assert.equal(response.headers.get('access-control-allow-origin'),'*');
  assert.match(response.headers.get('access-control-allow-methods')||'',/POST/i);
  const allowed=(response.headers.get('access-control-allow-headers')||'').toLowerCase();
  assert.match(allowed,/content-type/);
  assert.match(allowed,/cache-control/);
  assert.equal(response.headers.get('x-galvi-day3-cors-contract'),'customer-api-v1');
});

if(process.env.DAY3_V10_REMOTE_SMOKE==='1'){
  test('H01-H22 remote critical path smoke',async()=>{
    const base=String(process.env.DAY3_BASE_URL||'').replace(/\/$/,'');assert.ok(base);
    const health=await fetch(`${base}/health`);assert.equal(health.status,200);const h=await health.json();assert.equal(h.data.release_version,GALVICARE_RELEASE);assert.equal(h.data.capabilities.ai_enabled,true);assert.equal(h.data.capabilities.provider_configured,true);
  });
}