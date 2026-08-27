import day4Worker from './day4-session-identity-entry.js';
import { GVError, context, failure, headers, requireRuntime, success } from './day5-common.js';
import { first } from './repositories/care-repository.js';
import { handleCareRoute } from './routes/care.js';

async function readiness(env,ctx){
  const migration=await first(env.DB,`SELECT migration_id,name,environment,checksum,applied_at FROM gv1_schema_migrations WHERE migration_id='0005'`);
  const requiredTables=[
    'gv1_recommendations','gv1_recommendation_findings','gv1_treatment_plans',
    'gv1_treatment_plan_items','gv1_treatment_events','gv1_treatment_plan_recommendations',
    'gv1_treatment_plan_findings','gv1_outcomes','gv1_outcome_evidence','gv1_feedback',
    'gv1_learning_candidates','gv1_knowledge_items','gv1_adapter_deliveries'
  ];
  const tables={};
  for(const table of requiredTables){
    const row=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name=?`,table);
    tables[table]=Number(row?.count||0);
  }
  const indexRow=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='index' AND name IN ('idx_recommendations_bmr','idx_treatment_plans_bmr','idx_treatment_events_plan','idx_outcomes_bmr','idx_feedback_target','idx_adapter_status')`);
  const triggerRow=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='trigger' AND name IN ('trg_gv1_treatment_events_no_update','trg_gv1_treatment_events_no_delete')`);
  const ready=Boolean(migration&&Object.values(tables).every(v=>v===1)&&Number(indexRow?.count)===6&&Number(triggerRow?.count)===2);
  return success(ctx,{service:'galvicare-1-0-day5',ready,current_schema_version:migration?.migration_id||null,required_schema_version:'0005',migration:migration||null,care_tables:tables,contracted_index_count:Number(indexRow?.count||0),append_only_trigger_count:Number(triggerRow?.count||0),inherited_runtime:'galvicare_1_0_day4'},ready?200:503,ready?'ok':'unavailable');
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
