import day4Worker from './day4-session-identity-entry.js';
import { GVError, CUSTOMER_SESSION_HEADER, actor, context, failure, headers, idempotencyKey, jsonBody, requireRuntime, success } from './day5-common.js';
import { first } from './repositories/care-repository.js';
import { handleCareRoute } from './routes/care.js';
import { acknowledgeTreatmentPlan, submitCheckin } from './domain/day5-active-care-service.js';
import { createGovernedTreatmentPlan, reviseGovernedTreatmentPlan } from './domain/day5-treatment-service.js';
import { augmentCustomerChartResponse } from './domain/day5-projection-service.js';

const GUIDE_ALLOWED_INTENTS=new Set(['explain_route','navigate','reminder','request_evidence','clinic_prep']);
const GUIDE_BOUNDARY_MESSAGE='GalviGuide may explain approved outputs, navigate the care path, request evidence, prepare GalviClinic, remind, and facilitate routine check-ins, but may not change GalviScore or Acuity, diagnose, approve treatment, override Business Physician judgment, or provide licensed advice.';

async function readiness(env,ctx){
  const migration=await first(env.DB,`SELECT migration_id,name,environment,checksum,applied_at FROM gv1_schema_migrations WHERE name='day5_treatment_contract_v1' ORDER BY applied_at DESC LIMIT 1`);
  const activeCareMigration=await first(env.DB,`SELECT migration_id,name,environment,checksum,applied_at FROM gv1_schema_migrations WHERE name='day5_active_care_loop_v1' ORDER BY applied_at DESC LIMIT 1`);
  const requiredTables=[
    'gv1_recommendations','gv1_recommendation_findings','gv1_treatment_plans',
    'gv1_treatment_plan_items','gv1_treatment_events','gv1_treatment_plan_recommendations',
    'gv1_treatment_plan_findings','gv1_outcomes','gv1_outcome_evidence','gv1_feedback',
    'gv1_learning_candidates','gv1_knowledge_items','gv1_adapter_deliveries',
    'gv1_finding_decisions','gv1_galvirx','gv1_galviaudit_orders','gv1_referrals',
    'gv1_checkins','gv1_milestones','gv1_reassessments'
  ];
  const tables={};
  for(const table of requiredTables){
    const row=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name=?`,table);
    tables[table]=Number(row?.count||0);
  }
  const indexNames=[
    'idx_recommendations_bmr','idx_treatment_plans_bmr','idx_treatment_events_plan','idx_outcomes_bmr','idx_feedback_target','idx_adapter_status',
    'idx_finding_decisions_bmr_finding','idx_galvirx_bmr_plan','idx_galviaudit_bmr_status','idx_referrals_bmr_status','idx_checkins_bmr_plan','idx_milestones_bmr_plan','idx_reassessments_bmr_plan','idx_treatment_plans_bmr_group_version'
  ];
  const placeholders=indexNames.map(()=>'?').join(',');
  const indexRow=await env.DB.prepare(`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='index' AND name IN (${placeholders})`).bind(...indexNames).first();
  const triggerRow=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='trigger' AND name IN ('trg_gv1_treatment_events_no_update','trg_gv1_treatment_events_no_delete')`);
  const ready=Boolean(migration&&activeCareMigration&&Object.values(tables).every(v=>v===1)&&Number(indexRow?.count)===indexNames.length&&Number(triggerRow?.count)===2);
  return success(ctx,{service:'galvicare-1-0-day5',ready,current_schema_version:'D5A2',required_schema_version:'D5A2',migration:migration||null,active_care_migration:activeCareMigration||null,care_tables:tables,contracted_index_count:Number(indexRow?.count||0),expected_index_count:indexNames.length,append_only_trigger_count:Number(triggerRow?.count||0),inherited_runtime:'galvicare_1_0_day4',active_care_contract:'v1',treatment_contract:'evidence_bound_v1',business_physician_governance:'v1',active_care_projection:'v1',care_result_evidence:'v1',governed_treatment_revision:'v1',customer_treatment_acknowledgement:'v1',customer_checkin_session_bound:'v1',customer_care_routing:'v1',galviguide_customer_navigation:'bounded_read_only_v1',acuity_projection:'canonical_day2_score_v1',inherited_customer_cors:'v1'},ready?200:503,ready?'ok':'unavailable');
}

function preserveDay5Cors(response,ctx){
  if(!response)return response;
  const cors=headers(ctx),out=new Headers(response.headers);
  for(const name of ['Access-Control-Allow-Origin','Access-Control-Allow-Headers','Access-Control-Allow-Methods','Vary']){
    const value=cors.get(name);if(value)out.set(name,value);
  }
  out.set('X-Galvi-Day5-Inherited-Cors','v1');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:out});
}

async function inheritedResponse(request,env,executionContext,ctx){
  return preserveDay5Cors(await day4Worker.fetch(request,env,executionContext),ctx);
}

async function authorizedCustomerChart(request,env,executionContext){
  const sessionId=String(request.headers.get(CUSTOMER_SESSION_HEADER)||'').trim();
  if(!sessionId)throw new GVError('GV_AUTH_REQUIRED','An authenticated GalviCare customer session is required.',401);
  const requestHeaders=new Headers({
    'Accept':'application/json',
    'Content-Type':'application/json',
    'Cache-Control':'no-cache',
    [CUSTOMER_SESSION_HEADER]:sessionId,
    'X-Correlation-Id':`day5-customer-${crypto.randomUUID()}`
  });
  const origin=String(request.headers.get('Origin')||'').trim();if(origin)requestHeaders.set('Origin',origin);
  const chartRequest=new Request(`${new URL(request.url).origin}/api/v1/day4/chart`,{method:'POST',headers:requestHeaders,body:'{}'});
  const response=await day4Worker.fetch(chartRequest,env,executionContext);let payload={};try{payload=await response.json()}catch{}
  const data=payload?.data||{};
  if(!response.ok||payload?.success!==true||payload?.status!=='ok'||data?.activated!==true||!data?.bmr_id||!data?.principal_id){
    throw new GVError(response.status===401?'GV_AUTH_REQUIRED':'GV_AUTH_FORBIDDEN','Customer active care requires the same authenticated, activated GalviChart record.',response.status===401?401:403);
  }
  return {bmr_id:String(data.bmr_id),principal_id:String(data.principal_id),context_id:String(data.context_id||''),session_id:sessionId};
}

function parseStored(value){
  if(!value)return{};
  if(typeof value==='object')return value;
  try{return JSON.parse(value)}catch{return{}}
}

async function customerCareContext(request,env){
  const sessionId=String(request.headers.get(CUSTOMER_SESSION_HEADER)||'').trim();
  if(!sessionId)throw new GVError('GV_AUTH_REQUIRED','An authenticated GalviCare customer session is required.',401);

  const legacy=await first(env.DB,`SELECT f.email,v.venture_name
    FROM ventures v
    JOIN founders f ON f.founder_id=v.founder_id
    WHERE v.session_id=?
    ORDER BY v.updated_at DESC,v.created_at DESC
    LIMIT 1`,sessionId)
    ||await first(env.DB,`SELECT f.email,'' AS venture_name
      FROM founders f WHERE f.session_id=? ORDER BY f.updated_at DESC LIMIT 1`,sessionId);
  if(!legacy?.email)throw new GVError('GV_DAY5_SESSION_IDENTITY_MISSING','GalviCare session identity is unavailable.',401);

  const founder=await first(env.DB,`SELECT founder_id,email,status FROM gv1_founders WHERE lower(email)=lower(?) LIMIT 1`,legacy.email);
  if(!founder?.founder_id)throw new GVError('GV_DAY5_CANONICAL_IDENTITY_MISSING','Canonical GalviVault identity has not been established for this GalviCare session.',409);

  let canonical=null;
  const ventureName=String(legacy.venture_name||'').trim();
  if(ventureName){
    canonical=await first(env.DB,`SELECT c.context_id,c.founder_id,c.venture_id,c.bmr_id,c.record_mode,c.status,v.venture_name
      FROM gv1_principal_contexts c
      JOIN gv1_ventures v ON v.venture_id=c.venture_id
      WHERE c.founder_id=? AND c.status='active' AND lower(trim(v.venture_name))=lower(trim(?))
      ORDER BY c.updated_at DESC,c.created_at DESC LIMIT 1`,founder.founder_id,ventureName);
  }else{
    canonical=await first(env.DB,`SELECT context_id,founder_id,venture_id,bmr_id,record_mode,status,'' AS venture_name
      FROM gv1_principal_contexts
      WHERE founder_id=? AND status='active' AND venture_id IS NULL
      ORDER BY updated_at DESC,created_at DESC LIMIT 1`,founder.founder_id);
  }
  if(!canonical?.context_id)throw new GVError('GV_DAY5_CANONICAL_CONTEXT_MISSING','The authenticated session could not be matched to its canonical GalviVault care context.',409);

  const consent=await first(env.DB,`SELECT status FROM gv1_consent_events
    WHERE founder_id=? AND purpose='care_processing'
    ORDER BY recorded_at DESC,consent_id DESC LIMIT 1`,founder.founder_id);
  if(consent?.status!=='granted')throw new GVError('GV_CONSENT_REQUIRED','Active care-processing consent is required for GalviCare routing.',403);

  const score=await first(env.DB,`SELECT result_id,payload_json,record_version,rules_version,protocol_version,created_at
    FROM gv1_day2_intake_results
    WHERE context_id=? AND result_type='score'
    ORDER BY record_version DESC,created_at DESC LIMIT 1`,canonical.context_id);
  if(!score?.payload_json)throw new GVError('GV_DAY5_CARE_ROUTE_NOT_READY','Canonical GalviScore/Acuity is not ready yet. Complete the existing Score clarification flow and retry.',409,undefined,true);

  return {session_id:sessionId,founder,context:canonical,score_row:score,score:parseStored(score.payload_json)};
}

function careRoute(score={}){
  const acuityScore=Number(score.acuity_score);
  const acuityBand=String(score.acuity_band||'').trim().toLowerCase();
  const disposition=String(score.disposition||'').trim().toLowerCase();
  const clinicalConfidence=Number(score.clinical_confidence);
  const overallScore=Number(score.overall_score??score.score??score.galviscore_score);
  const referral=acuityBand==='red'||disposition==='urgent_active_specialty_referral';
  const clinic=referral||acuityBand==='orange'||disposition==='active_care_recommended';
  const passive=acuityBand==='yellow'||disposition==='passive_intervention';
  const supportLevel=referral?'qualified_referral':clinic?'galviclinic':passive?'galviguide':'self_guided';
  const recommendedAction=referral?'qualified_referral':clinic?'book_galviclinic':passive?'use_galviguide':'continue_path';
  const reminder=referral
    ?'Use the governed specialty/referral pathway; GalviGuide cannot provide the licensed conclusion.'
    :clinic
      ?'Continue the governed GalviPath and book GalviClinic for Business Physician review.'
      :passive
        ?'Continue the governed GalviPath and use GalviGuide for explanation, evidence requests, reminders, and routine navigation without forcing active care.'
        :'Continue the governed GalviPath and monitor the evidence; GalviGuide remains available for bounded navigation.';
  return {
    overall_score:Number.isFinite(overallScore)?overallScore:null,
    acuity_score:Number.isFinite(acuityScore)?acuityScore:null,
    acuity_band:acuityBand||null,
    clinical_confidence:Number.isFinite(clinicalConfidence)?clinicalConfidence:null,
    disposition:disposition||null,
    support_level:supportLevel,
    recommended_action:recommendedAction,
    clinic_recommended:clinic,
    referral_required:referral,
    guide_available:true,
    guide_message:GUIDE_BOUNDARY_MESSAGE,
    reminder
  };
}

async function customerGalviGuide(request,env){
  const input=await jsonBody(request);
  const intent=String(input?.intent||'explain_route').trim().toLowerCase();
  if(!GUIDE_ALLOWED_INTENTS.has(intent)){
    throw new GVError('GV_GUIDE_BOUNDARY',GUIDE_BOUNDARY_MESSAGE,403,{intent,next_action:'human_review'});
  }
  const care=await customerCareContext(request,env);
  return {
    ...careRoute(care.score),
    intent,
    read_only:true,
    canonical_source:'gv1_day2_intake_results',
    source_result_id:care.score_row.result_id,
    source_record_version:Number(care.score_row.record_version||1),
    rules_version:care.score_row.rules_version||care.score.rules_version||null,
    protocol_version:care.score_row.protocol_version||care.score.protocol_version||null,
    score_recomputed_in_browser:false,
    acuity_recomputed_in_browser:false
  };
}

const worker={
  async fetch(request,env,executionContext){
    const ctx=context(request,env);
    try{
      requireRuntime(env,ctx);
      if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
      const url=new URL(request.url); const path=url.pathname.replace(/\/+$/,'')||'/';
      if(request.method==='OPTIONS'&&path.startsWith('/api/v1/')) return new Response(null,{status:204,headers:headers(ctx)});
      if(request.method==='GET'&&(path==='/api/v1/day5/readiness'||path==='/api/v1/day5/schema-version')) return readiness(env,ctx);
      if(request.method==='POST'&&path==='/api/v1/day5/customer/galviguide'){
        const data=await customerGalviGuide(request,env);
        return success(ctx,data,200,'ok',{identity_source:'authenticated_session_canonical_context',read_only:true,galviguide_boundary:'v1'});
      }
      if(request.method==='POST'&&path==='/api/v1/treatment-plans'){
        const input=await jsonBody(request),data=await createGovernedTreatmentPlan(env,ctx,actor(request),idempotencyKey(request),input);
        return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
      }
      const governedRevision=path.match(/^\/api\/v1\/treatment-plans\/([^/]+)\/revisions$/);
      if(request.method==='POST'&&governedRevision){
        const input=await jsonBody(request),data=await reviseGovernedTreatmentPlan(env,ctx,actor(request),idempotencyKey(request),decodeURIComponent(governedRevision[1]),input);
        return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
      }
      const customerAck=path.match(/^\/api\/v1\/day5\/customer\/treatment-plans\/([^/]+)\/acknowledgement$/);
      if(request.method==='POST'&&customerAck){
        const customer=await authorizedCustomerChart(request,env,executionContext),input=await jsonBody(request);
        const data=await acknowledgeTreatmentPlan(env,ctx,{role:'customer',id:customer.principal_id},idempotencyKey(request),decodeURIComponent(customerAck[1]),{...input,bmr_id:customer.bmr_id});
        return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,identity_source:'authenticated_galvichart'});
      }
      if(request.method==='POST'&&path==='/api/v1/day5/customer/checkins'){
        const customer=await authorizedCustomerChart(request,env,executionContext),input=await jsonBody(request);
        const data=await submitCheckin(env,ctx,{role:'customer',id:customer.principal_id},idempotencyKey(request),{...input,bmr_id:customer.bmr_id});
        return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,identity_source:'authenticated_galvichart'});
      }
      if(request.method==='POST'&&path==='/api/v1/day4/chart'){
        const upstream=await inheritedResponse(request,env,executionContext,ctx);
        return augmentCustomerChartResponse(upstream,env);
      }
      const response=await handleCareRoute(request,env,ctx,path);
      if(response) return response;
      return inheritedResponse(request,env,executionContext,ctx);
    }catch(error){
      console.error('GalviCare 1.0 Day 5 error',error?.code||'GV_INTERNAL',error?.message||'unexpected');
      return failure(ctx,error);
    }
  }
};

export default worker;
