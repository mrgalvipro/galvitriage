import day3Worker from './day3-entry.js';
import { GVError, context, failure, headers, requireRuntime, success } from './day4-common.js';
import { first } from './repositories/reasoning-repository.js';
import { handleReasoningRoute } from './routes/reasoning.js';
import { handleGovernanceRoute } from './routes/governance.js';
import { handleBmrRoute } from './routes/business-medical-records.js';

async function readiness(env,ctx){
  const migration=await first(env.DB,`SELECT migration_id,name,environment,checksum,applied_at FROM gv1_schema_migrations WHERE migration_id='0004'`);
  const counts={};
  for(const table of ['gv1_observations','gv1_observation_evidence','gv1_hypotheses','gv1_hypothesis_observations','gv1_findings','gv1_finding_evidence','gv1_finding_observations','gv1_finding_hypotheses']){
    const row=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name=?`,table);
    counts[table]=Number(row?.count||0);
  }
  const indexRow=await first(env.DB,`SELECT COUNT(*) AS count FROM sqlite_master WHERE type='index' AND name IN ('idx_observations_bmr','idx_hypotheses_bmr','idx_findings_bmr')`);
  const ready=Boolean(migration&&Object.values(counts).every(v=>v===1)&&Number(indexRow?.count)===3);
  return success(ctx,{service:'galvivault-p0-day4',ready,current_schema_version:migration?.migration_id||null,required_schema_version:'0004',migration:migration||null,reasoning_tables:counts,contracted_index_count:Number(indexRow?.count||0)},ready?200:503,ready?'ok':'unavailable');
}

const worker={
  async fetch(request,env,executionContext){
    const ctx=context(request,env);
    try{
      requireRuntime(env,ctx);
      if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
      const url=new URL(request.url); const path=url.pathname.replace(/\/+$/,'')||'/';
      if(request.method==='OPTIONS'&&path.startsWith('/api/v1/')) return new Response(null,{status:204,headers:headers(ctx)});
      if(request.method==='GET'&&(path==='/api/v1/day4/readiness'||path==='/api/v1/day4/schema-version')) return readiness(env,ctx);
      for(const handler of [handleReasoningRoute,handleGovernanceRoute,handleBmrRoute]){
        const response=await handler(request,env,ctx,path);
        if(response) return response;
      }
      return day3Worker.fetch(request,env,executionContext);
    }catch(error){
      console.error('GalviVault Day 4 error',error?.code||'GV_INTERNAL',error?.message||'unexpected');
      return failure(ctx,error);
    }
  }
};

export default worker;
