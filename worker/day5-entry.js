import day4Worker from './day4-session-identity-entry.js';
import { GVError, CUSTOMER_SESSION_HEADER, actor, context, failure, headers, idempotencyKey, jsonBody, requireRuntime, success } from './day5-common.js';
import { first } from './repositories/care-repository.js';
import { handleCareRoute } from './routes/care.js';
import { acknowledgeTreatmentPlan, submitCheckin } from './domain/day5-active-care-service.js';
import { createGovernedTreatmentPlan, reviseGovernedTreatmentPlan } from './domain/day5-treatment-service.js';
import { augmentCustomerChartResponse } from './domain/day5-projection-service.js';

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
  return success(ctx,{service:'galvicare-1-0-day5',ready,current_schema_version:'D5A2',required_schema_version:'D5A2',migration:migration||null,active_care_migration:activeCareMigration||null,care_tables:tables,contracted_index_count:Number(indexRow?.count||0),expected_index_count:indexNames.length,append_only_trigger_count:Number(triggerRow?.count||0),inherited_runtime:'galvicare_1_0_day4',active_care_contract:'v1',treatment_contract:'evidence_bound_v1',business_physician_governance:'v1',active_care_projection:'v1',care_result_evidence:'v1',governed_treatment_revision:'v1',customer_treatment_acknowledgement:'v1',customer_checkin_session_bound:'v1',inherited_customer_cors:'v1'},ready?200:503,ready?'ok':'unavailable');
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

const worker={
  async fetch(request,env,executionContext){
    const ctx=context(request,env);
    try{
      requireRuntime(env,ctx);
      if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
      const url=new URL(request.url); const path=url.pathname.replace(/\/+$/,'')||'/';
      if(request.method==='OPTIONS'&&path.startsWith('/api/v1/')) return new Response(null,{status:204,headers:headers(ctx)});
      if(request.method==='GET'&&(path==='/api/v1/day5/readiness'||path==='/api/v1/day5/schema-version')) return readiness(env,ctx);
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
