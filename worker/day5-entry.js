import day4Worker from './day4-session-identity-entry.js';
import { GVError, actor, context, failure, headers, idempotencyKey, jsonBody, requireRuntime, success } from './day5-common.js';
import { first } from './repositories/care-repository.js';
import { handleCareRoute } from './routes/care.js';
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
  return success(ctx,{service:'galvicare-1-0-day5',ready,current_schema_version:'D5A2',required_schema_version:'D5A2',migration:migration||null,active_care_migration:activeCareMigration||null,care_tables:tables,contracted_index_count:Number(indexRow?.count||0),expected_index_count:indexNames.length,append_only_trigger_count:Number(triggerRow?.count||0),inherited_runtime:'galvicare_1_0_day4',active_care_contract:'v1',treatment_contract:'evidence_bound_v1',business_physician_governance:'v1',active_care_projection:'v1',care_result_evidence:'v1',governed_treatment_revision:'v1'},ready?200:503,ready?'ok':'unavailable');
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
      if(request.method==='POST'&&path==='/api/v1/day4/chart'){
        const upstream=await day4Worker.fetch(request,env,executionContext);
        return augmentCustomerChartResponse(upstream,env);
      }
      const response=await handleCareRoute(request,env,ctx,path);
      if(response) return response;
      return day4Worker.fetch(request,env,executionContext);
    }catch(error){
      console.error('GalviCare 1.0 Day 5 error',error?.code||'GV_INTERNAL',error?.message||'unexpected');
      return failure(ctx,error);
    }
  }
};

export default worker;
