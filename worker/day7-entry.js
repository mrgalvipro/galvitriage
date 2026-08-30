import day6Worker from './day6-entry.js';
import { GVError, context, failure, headers, requireRuntime, hash, idempotencyKey, success } from './day5-common.js';
import { handleDay7ReleaseRoute } from './routes/day7-release.js';

export const DAY7_RELEASE_RUNTIME='galvistudio_galvicare_1_0_day7_release_v1';

const PREFOUNDER_AI_PATH='/api/v1/day7/prefounder/readiness-interpretation';
const PREFOUNDER_SESSION_HEADER='X-Galvi-Day3-Session';
const PREFOUNDER_SESSION_SCOPE='day7:prefounder-session';
const PREFOUNDER_AI_SCOPE='day7:prefounder-readiness-ai';
const PREFOUNDER_AI_TASK='synthesize_evidence';
const PREFOUNDER_AI_PROMPT='day7_prefounder_readiness_v1';
const PREFOUNDER_AI_SCHEMA='day7_prefounder_readiness_schema_v1';
const SAFE_ID=/^[A-Za-z0-9:._-]{3,180}$/;

function wrap(response){
  if(!response)return response;
  const out=new Headers(response.headers);
  out.set('X-Galvi-Day7-Release',DAY7_RELEASE_RUNTIME);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:out});
}

function parse(value,fallback={}){try{return JSON.parse(value||'')}catch{return fallback}}

/*
 * Day 7 P1 refresh/recovery bridge.
 *
 * A browser refresh can legitimately resubmit the same canonical Founder Readiness
 * evidence with a new client idempotency key. Day 3's generation table correctly
 * enforces UNIQUE(request_fingerprint, attempt_no), so a second provider generation
 * for the exact same deterministic evidence must never be attempted. Before the
 * normal Day 7 route runs (and once more after a route error to close a race), this
 * bridge returns the already persisted generation when its canonical result IDs
 * still match the current Pre-Founder Vitals + Score. It never mutates the score,
 * acuity, evidence, principal, venture/BHR scope, or AI proposal.
 */
async function storedPreFounderAiReplay(request,env,ctx,path){
  if(request.method!=='POST'||path!==PREFOUNDER_AI_PATH)return null;
  const token=String(request.headers.get(PREFOUNDER_SESSION_HEADER)||'').trim();
  if(!token)return null; // legacy synthetic QA probes remain handled by the release route.
  let input={};try{input=await request.clone().json()}catch{return null}
  const contextId=String(input?.context_id||'').trim();
  if(!SAFE_ID.test(contextId))return null;

  const sessionHash=await hash(PREFOUNDER_SESSION_SCOPE,token);
  const session=await env.DB.prepare(`SELECT context_id,founder_id FROM gv1_prefounder_sessions
    WHERE session_hash=? AND revoked_at IS NULL AND expires_at>CURRENT_TIMESTAMP LIMIT 1`).bind(sessionHash).first();
  if(!session||session.context_id!==contextId)return null;

  const [vitals,score]=await Promise.all([
    env.DB.prepare(`SELECT result_id,score_type FROM gv1_day2_intake_results WHERE context_id=? AND result_type='vitals' ORDER BY record_version DESC,created_at DESC LIMIT 1`).bind(contextId).first(),
    env.DB.prepare(`SELECT result_id,score_type FROM gv1_day2_intake_results WHERE context_id=? AND result_type='score' ORDER BY record_version DESC,created_at DESC LIMIT 1`).bind(contextId).first()
  ]);
  if(!vitals||!score||vitals.score_type!=='founder_readiness'||score.score_type!=='founder_readiness')return null;

  const fingerprint=await hash(PREFOUNDER_AI_SCOPE,{
    context_id:contextId,
    vitals:vitals.result_id,
    score:score.result_id,
    prompt_version:PREFOUNDER_AI_PROMPT,
    schema_version:PREFOUNDER_AI_SCHEMA
  });
  const generation=await env.DB.prepare(`SELECT generation_id,proposal_json,validation_status FROM gv1_day3_ai_generations
    WHERE request_fingerprint=? AND attempt_no=1 AND context_id=? AND task=? ORDER BY completed_at DESC,created_at DESC LIMIT 1`)
    .bind(fingerprint,contextId,PREFOUNDER_AI_TASK).first();
  if(!generation?.proposal_json)return null;
  const stored=parse(generation.proposal_json,null);
  if(!stored||stored?.canonical_result_ids?.vitals!==vitals.result_id||stored?.canonical_result_ids?.score!==score.result_id)return null;

  const key=idempotencyKey(request);
  const prior=await env.DB.prepare(`SELECT request_fingerprint,response_entity_id FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=? LIMIT 1`)
    .bind(PREFOUNDER_AI_SCOPE,key).first();
  if(prior&&prior.request_fingerprint!==fingerprint)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Founder Readiness AI idempotency key was reused with different evidence.',409);
  if(!prior){
    await env.DB.prepare(`INSERT OR IGNORE INTO gv1_idempotency_keys
      (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at)
      VALUES (?,?,?,?,200,'prefounder_readiness_interpretation',?,?)`)
      .bind(`idem_${crypto.randomUUID().replaceAll('-','')}`,PREFOUNDER_AI_SCOPE,key,fingerprint,generation.generation_id,new Date().toISOString()).run();
  }
  const data={...stored,idempotent_replay:true,canonical_generation_reuse:true};
  return success(ctx,data,200,'no_change',{
    idempotent_replay:true,
    canonical_generation_reuse:true,
    ai_status:data.generation_source==='openai_governed'?'accepted':'fallback'
  });
}

export default {async fetch(request,env,executionContext){
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/day7/')) return new Response(null,{status:204,headers:headers(ctx)});
    const stored=await storedPreFounderAiReplay(request,env,ctx,path);
    if(stored)return wrap(stored);
    let response;
    try{
      response=await handleDay7ReleaseRoute(request,env,ctx,path);
    }catch(error){
      const recovered=await storedPreFounderAiReplay(request,env,ctx,path);
      if(recovered)return wrap(recovered);
      throw error;
    }
    if(response)return wrap(response);
    return wrap(await day6Worker.fetch(request,env,executionContext));
  }catch(error){return wrap(failure(ctx,error));}
}};
