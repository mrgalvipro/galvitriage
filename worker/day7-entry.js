import day6Worker from './day6-entry.js';
import { clinicalFile } from './day7d-engine.js';
import { GVError, context, failure, headers, requireRuntime, hash, idempotencyKey, jsonBody, success } from './day5-common.js';
import { handleDay7ReleaseRoute } from './routes/day7-release.js';
import { getCustomerMembershipOffer, presentCustomerMembershipOffer, resolvePaidMembershipActivation } from './domain/day7-membership-service.js';

export const DAY7_RELEASE_RUNTIME='galvistudio_galvicare_1_0_day7_release_v1';

const PREFOUNDER_AI_PATH='/api/v1/day7/prefounder/readiness-interpretation';
const PREFOUNDER_SESSION_HEADER='X-Galvi-Day3-Session';
const PREFOUNDER_SESSION_SCOPE='day7:prefounder-session';
const PREFOUNDER_AI_SCOPE='day7:prefounder-readiness-ai';
const PREFOUNDER_AI_TASK='synthesize_evidence';
const PREFOUNDER_AI_PROMPT='day7_prefounder_readiness_v1';
const PREFOUNDER_AI_SCHEMA='day7_prefounder_readiness_schema_v1';
const OPERATING_BOOTSTRAP_PATH='/api/v1/day3/customer-bootstrap';
const OPERATING_SCORE_RECONCILIATION='day7_p1_authoritative_galviscore';
const SAFE_ID=/^[A-Za-z0-9:._-]{3,180}$/;
const MEMBERSHIP_OFFER_PATH='/api/v1/day7/customer/membership-offer';
const MEMBERSHIP_PAYMENT_PATH='/api/v1/day7/customer/membership-payment-return';

function wrap(response){
  if(!response)return response;
  const out=new Headers(response.headers);
  out.set('X-Galvi-Day7-Release',DAY7_RELEASE_RUNTIME);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:out});
}

function parse(value,fallback={}){try{return JSON.parse(value||'')}catch{return fallback}}
function text(value){return String(value??'').trim()}
function low(value){return text(value).toLowerCase()}
function safe(value){return text(value).replace(/[^A-Za-z0-9._:-]/g,'_').slice(0,120)}
function resultId(type){return `d2${type}_d7p1_${crypto.randomUUID().replaceAll('-','')}`}
function iso(){return new Date().toISOString()}

async function customerMembershipRoute(request,env,ctx,path){
  if(path===MEMBERSHIP_OFFER_PATH&&request.method==='GET'){
    const data=await getCustomerMembershipOffer(env,request);
    return success(ctx,data,200,'ok',{manual_repair:'NO',membership_conversion:'clinical_decision_to_commercial_offer_v1'});
  }
  if(path===MEMBERSHIP_OFFER_PATH&&request.method==='POST'){
    const data=await presentCustomerMembershipOffer(env,ctx,request,idempotencyKey(request));
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{manual_repair:'NO',commercial_event:'membership_offered',idempotent_replay:data.idempotent_replay});
  }
  if(path===MEMBERSHIP_PAYMENT_PATH&&request.method==='POST'){
    const input=await jsonBody(request),data=await resolvePaidMembershipActivation(env,ctx,request,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{manual_repair:'NO',commercial_event:'membership_started',revenue_conversion:true,idempotent_replay:data.idempotent_replay});
  }
  return null;
}

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
  if(!token)return null;
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

function normalizedDimensions(raw={}){
  return {
    revenue:Number(raw.revenue||0),
    customer:Number(raw.customer||0),
    product:Number(raw.product||0),
    leadership:Number(raw.leadership||0),
    technology:Number(raw.technology??raw.technology_operations??0),
    distribution:Number(raw.distribution||0),
    problem:Number(raw.problem||0),
    business_model:Number(raw.business_model||0)
  };
}

async function latestDay2Row(db,contextId,type){
  return db.prepare(`SELECT result_id,context_id,founder_id,bmr_id,result_type,score_type,payload_json,
    supporting_evidence_ids_json,rules_version,protocol_version,generation_source,request_fingerprint,
    record_version,client_request_id,created_at FROM gv1_day2_intake_results
    WHERE context_id=? AND result_type=? ORDER BY record_version DESC,created_at DESC LIMIT 1`).bind(contextId,type).first();
}

async function operatingContextForSession(db,sessionId){
  const legacyFounder=await db.prepare(`SELECT email FROM founders WHERE session_id=? ORDER BY updated_at DESC LIMIT 1`).bind(sessionId).first();
  if(!legacyFounder?.email)return null;
  return db.prepare(`SELECT c.context_id,c.founder_id,c.bmr_id,c.venture_id,c.record_mode
    FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id
    WHERE lower(f.email)=? AND c.record_mode='principal_plus_venture' AND c.status='active'
    ORDER BY c.updated_at DESC,c.created_at DESC LIMIT 1`).bind(low(legacyFounder.email)).first();
}

async function appendConvergedDay2Row(env,row,type,payload,fingerprint,version){
  const rid=resultId(type),created=iso();
  const data={...payload,result_id:rid,context_id:row.context_id,founder_id:row.founder_id,bmr_id:row.bmr_id||null,record_version:version,
    day7_release_reconciliation:OPERATING_SCORE_RECONCILIATION,manual_repair:'NO'};
  await env.DB.prepare(`INSERT INTO gv1_day2_intake_results
    (result_id,context_id,founder_id,bmr_id,result_type,score_type,payload_json,supporting_evidence_ids_json,
     contradictory_evidence_ids_json,rules_version,protocol_version,generation_source,request_fingerprint,record_version,
     client_request_id,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      rid,row.context_id,row.founder_id,row.bmr_id||null,type,row.score_type||'business_health',JSON.stringify(data),
      row.supporting_evidence_ids_json||'[]','[]',row.rules_version||'galviengine_1_0_score_v1',
      row.protocol_version||'universal_business_health_v1','rules',fingerprint,version,
      `d7p1.${type}.${safe(row.context_id)}.${version}`,created
    ).run();
  return data;
}

/*
 * Operating-Founder canonical score convergence.
 *
 * The inherited GalviCare UI uses the current deterministic weighted GalviScore,
 * while an older Day 2 intake snapshot may retain the unweighted Vitals aggregate.
 * Day 3 correctly fails closed when those values differ. On that exact 409 only,
 * Day 7 appends a new versioned Day 2 Vitals + Score projection carrying the current
 * authoritative GalviScore and current dimensions, then retries the same bootstrap.
 * No row is updated/deleted, Acuity is not derived from Business Health, and the
 * mismatch guard remains active after convergence. This is application code, not
 * manual SQL repair; signed evidence remains manual_repair=NO.
 */
async function reconcileOperatingScoreMismatch(request,env,executionContext,path,response){
  if(request.method!=='POST'||path!==OPERATING_BOOTSTRAP_PATH||response.status!==409||!env?.DB)return response;
  let failureBody={};try{failureBody=await response.clone().json()}catch{return response}
  if(failureBody?.error?.code!=='GV_DAY3_CUSTOMER_SCORE_MISMATCH')return response;
  const sessionId=text(request.headers.get(PREFOUNDER_SESSION_HEADER));
  if(!sessionId)return response;
  const file=await clinicalFile(env.DB,sessionId);
  const authoritative=Number(file?.score?.score);
  const dimensions=normalizedDimensions(file?.score?.dimension_scores||{});
  if(!Number.isFinite(authoritative)||Object.values(dimensions).some(v=>!Number.isFinite(v)))return response;
  const canonical=await operatingContextForSession(env.DB,sessionId);
  if(!canonical?.context_id||!canonical?.bmr_id)return response;
  const [triage,vitals,score]=await Promise.all([
    latestDay2Row(env.DB,canonical.context_id,'triage'),latestDay2Row(env.DB,canonical.context_id,'vitals'),latestDay2Row(env.DB,canonical.context_id,'score')
  ]);
  if(!triage||!vitals||!score)return response;
  const vitalsPayload=parse(vitals.payload_json,{}),scorePayload=parse(score.payload_json,{}),triagePayload=parse(triage.payload_json,{});
  const currentVitals=Number(vitalsPayload.overall_score),currentScore=Number(scorePayload.overall_score);
  const dimensionMatch=JSON.stringify(normalizedDimensions(vitalsPayload.dimension_scores||{}))===JSON.stringify(dimensions);
  if(Math.abs(currentVitals-authoritative)<=0.5&&Math.abs(currentScore-authoritative)<=0.5&&dimensionMatch)return response;
  const fingerprint=await hash('day7:p1:operating-founder-score-convergence',{
    session_id:sessionId,context_id:canonical.context_id,authoritative_score:authoritative,dimensions,evidence_version:Number(file?.evidence_version||0)
  });
  const prior=await env.DB.prepare(`SELECT result_id FROM gv1_day2_intake_results WHERE context_id=? AND request_fingerprint IN (?,?) LIMIT 1`)
    .bind(canonical.context_id,`${fingerprint}:vitals`,`${fingerprint}:score`).first();
  if(!prior){
    const vitalsVersion=Number(vitals.record_version||0)+1,scoreVersion=Number(score.record_version||0)+1;
    const nextVitals={...vitalsPayload,product:'GalviVitals',score_type:'business_health',dimension_scores:dimensions,overall_score:authoritative,
      clinical_confidence:Number(vitalsPayload.clinical_confidence??scorePayload.clinical_confidence??0)};
    const nextScore={...scorePayload,product:'GalviScore',score_type:'business_health',overall_score:authoritative,dimension_scores:dimensions,
      acuity_score:Number(triagePayload.acuity_score??scorePayload.acuity_score??0),acuity_band:text(triagePayload.acuity_band||scorePayload.acuity_band||'green'),
      clinical_confidence:Number(scorePayload.clinical_confidence??vitalsPayload.clinical_confidence??0)};
    await appendConvergedDay2Row(env,vitals,'vitals',nextVitals,`${fingerprint}:vitals`,vitalsVersion);
    await appendConvergedDay2Row(env,score,'score',nextScore,`${fingerprint}:score`,scoreVersion);
  }
  const retried=await day6Worker.fetch(request,env,executionContext);
  let retriedBody={};try{retriedBody=await retried.clone().json()}catch{}
  if(retried.status===409&&retriedBody?.error?.code==='GV_DAY3_CUSTOMER_SCORE_MISMATCH')return retried;
  const out=new Headers(retried.headers);out.set('X-Galvi-Day7-P1-Score-Convergence','versioned-no-manual-repair');
  return new Response(retried.body,{status:retried.status,statusText:retried.statusText,headers:out});
}

export default {async fetch(request,env,executionContext){
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/day7/')) return new Response(null,{status:204,headers:headers(ctx)});
    const membershipResponse=await customerMembershipRoute(request,env,ctx,path);
    if(membershipResponse)return wrap(membershipResponse);
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
    const downstream=await day6Worker.fetch(request,env,executionContext);
    return wrap(await reconcileOperatingScoreMismatch(request,env,executionContext,path,downstream));
  }catch(error){return wrap(failure(ctx,error));}
}};