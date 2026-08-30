import { actor, clean, GVError, hash, idempotencyKey, jsonBody, newId, now, success } from '../day5-common.js';
import {
  startMembership, cancelMembership, submitMembershipCheckin, getMembership, membershipReadiness
} from '../domain/day7-membership-service.js';

const AI_PROMPT_VERSION='day7_prefounder_readiness_v1';
const AI_SCHEMA_VERSION='day7_prefounder_readiness_schema_v1';
const AI_SCOPE='day7:prefounder-readiness-ai';
const PROVIDER_SECRET_NAME=['OPENAI','API','KEY'].join('_');
const PROVIDER_URL=['https://api','openai.com/v1/responses'].join('.');
const SAFE_ID=/^[A-Za-z0-9:._-]{3,180}$/;

const first=(db,sql,...params)=>db.prepare(sql).bind(...params).first();
const parse=(value,fallback={})=>{try{return JSON.parse(value||'')}catch{return fallback}};
const bounded=(value,max=1200)=>clean(value).slice(0,max);

function requireSyntheticPrincipal(request,ctx,email){
  if(!['qa','local'].includes(ctx.environment)) throw new GVError('GV_DAY7_PREFOUNDER_AI_QA_ONLY','Synthetic Pre-Founder AI projection is unavailable in production.',404);
  const raw=clean(request.headers.get('X-Galvi-Day1-Actor'));
  if(!raw.startsWith('principal:')) throw new GVError('GV_AUTH_REQUIRED','Authorized Pre-Founder principal scope is required.',401);
  const suffix=raw.slice('principal:'.length);
  if(!/^[A-Za-z0-9._-]{1,72}$/.test(suffix)) throw new GVError('GV_AUTH_REQUIRED','Invalid Pre-Founder principal actor.',401);
  const expected=`day1.${suffix.toLowerCase()}@example.invalid`;
  if(clean(email).toLowerCase()!==expected) throw new GVError('GV_AUTH_FORBIDDEN','Pre-Founder record access denied.',403);
  return {role:'customer',id:`qa_${suffix}`,email:expected};
}

async function preFounderContext(env,request,ctx,contextId){
  if(!SAFE_ID.test(clean(contextId))) throw new GVError('GV_REQ_SCHEMA','context_id is invalid.',422);
  const row=await first(env.DB,`SELECT c.*,f.email FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id WHERE c.context_id=?`,contextId);
  if(!row) throw new GVError('GV_NOT_FOUND','Pre-Founder context was not found.',404);
  requireSyntheticPrincipal(request,ctx,row.email);
  if(row.record_mode!=='principal_only'||row.venture_id!==null||row.bmr_id!==null||row.lifecycle_state!=='pre_founder'){
    throw new GVError('GV_SCOPE_MISMATCH','Founder Readiness AI projection requires a principal-only Pre-Founder context.',409);
  }
  const consent=await first(env.DB,`SELECT status FROM gv1_consent_events WHERE founder_id=? AND purpose='care_processing' ORDER BY recorded_at DESC,consent_id DESC LIMIT 1`,row.founder_id);
  if(consent?.status!=='granted') throw new GVError('GV_CONSENT_REQUIRED','Care-processing consent is required.',403);
  return row;
}

async function day2Result(env,contextId,type){
  const row=await first(env.DB,`SELECT result_id,score_type,payload_json,supporting_evidence_ids_json,contradictory_evidence_ids_json,rules_version,protocol_version,record_version,created_at FROM gv1_day2_intake_results WHERE context_id=? AND result_type=? ORDER BY record_version DESC,created_at DESC LIMIT 1`,contextId,type);
  if(!row) throw new GVError('GV_DAY7_AI_PREREQUISITE_MISSING',`Founder Readiness ${type} result is required before AI interpretation.`,409);
  return {...row,payload:parse(row.payload_json,{}),supporting_evidence_ids:parse(row.supporting_evidence_ids_json,[]),contradictory_evidence_ids:parse(row.contradictory_evidence_ids_json,[])};
}

function fallbackProjection(score,vitals,reason='provider_fallback'){
  const dims=score.payload.dimension_scores||vitals.payload.dimension_scores||{};
  const ranked=Object.entries(dims).map(([key,value])=>[key,Number(value)||0]).sort((a,b)=>b[1]-a[1]);
  const pretty=(key)=>key.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
  const strengths=ranked.slice(0,2).map(([key,value])=>`${pretty(key)} is currently one of your stronger readiness signals (${value}/100).`);
  const focus=ranked.slice(-2).reverse().map(([key,value])=>`${pretty(key)} is a useful place to build evidence and capability next (${value}/100).`);
  const overall=Number(score.payload.overall_score??vitals.payload.overall_score??0);
  return {
    summary:`Your Founder Readiness score is ${overall}/100. This is not a judgment on whether your idea will succeed; it is a snapshot of how prepared you are to move from an idea toward sustained founder work today.`,
    strengths:strengths.length?strengths:['You have already begun building a baseline for founder development.'],
    focus_areas:focus.length?focus:['Use the next SPUR step to turn uncertainty into evidence.'],
    next_step:'Continue into the GalviStudio Founder Development Institute / SPUR™ Pre-Founder pathway and focus first on the lowest-confidence readiness signal.',
    confidence_note:'This interpretation is bounded to the Founder Readiness signals you provided and does not create a venture, Business Health Record, or regulated professional conclusion.',
    fallback_reason:reason
  };
}

function schema(){return{
  type:'object',additionalProperties:false,
  properties:{
    summary:{type:'string'},
    strengths:{type:'array',items:{type:'string'},minItems:1,maxItems:3},
    focus_areas:{type:'array',items:{type:'string'},minItems:1,maxItems:3},
    next_step:{type:'string'},
    confidence_note:{type:'string'}
  },
  required:['summary','strengths','focus_areas','next_step','confidence_note']
}};

function extractOutput(payload){
  if(typeof payload?.output_text==='string'&&payload.output_text.trim()) return payload.output_text.trim();
  for(const item of Array.isArray(payload?.output)?payload.output:[]){
    for(const part of Array.isArray(item?.content)?item.content:[]){
      if((part?.type==='output_text'||part?.type==='text')&&typeof part?.text==='string'&&part.text.trim()) return part.text.trim();
    }
  }
  return '';
}

function validateProposal(value){
  if(!value||typeof value!=='object'||Array.isArray(value)) return ['invalid_object'];
  const errors=[];
  for(const field of ['summary','next_step','confidence_note']) if(!clean(value[field])||clean(value[field]).length>1600) errors.push(`invalid_${field}`);
  for(const field of ['strengths','focus_areas']){
    if(!Array.isArray(value[field])||value[field].length<1||value[field].length>3||value[field].some(x=>!clean(x)||clean(x).length>700)) errors.push(`invalid_${field}`);
  }
  const combined=JSON.stringify(value);
  if(/\b(guaranteed|guarantee of success|legal advice|tax advice|investment advice|medical advice)\b/i.test(combined)) errors.push('regulated_or_guaranteed_claim');
  if(!/(SPUR|Founder Development)/i.test(clean(value.next_step))) errors.push('route_not_bounded_to_spur');
  return [...new Set(errors)];
}

async function callProvider(env,score,vitals){
  const enabled=clean(env.AI_ENABLED).toLowerCase()==='true';
  const apiKey=clean(env[PROVIDER_SECRET_NAME]);
  if(!enabled||!apiKey) throw new GVError('GV_AI_PROVIDER_NOT_CONFIGURED','Governed AI provider is not configured.',503,undefined,true);
  const model=clean(env.OPENAI_MODEL_QA||env.OPENAI_MODEL_PROD||env.OPENAI_MODEL)||'gpt-4.1-mini';
  const timeoutMs=Math.max(1000,Math.min(15000,Number(env.OPENAI_TIMEOUT_MS_QA||env.OPENAI_TIMEOUT_MS_PROD||8000)));
  const evidence={
    lifecycle_state:'pre_founder',record_mode:'principal_only',venture_exists:false,bhr_exists:false,
    score_type:'founder_readiness',overall_score:score.payload.overall_score,
    clinical_confidence:score.payload.clinical_confidence??vitals.payload.clinical_confidence,
    dimension_scores:score.payload.dimension_scores||vitals.payload.dimension_scores||{},
    acuity_score:score.payload.acuity_score,acuity_band:score.payload.acuity_band,
    deterministic_truth_immutable:true,authorized_route:'Founder Development Institute / SPUR Pre-Founder',
    canonical_result_ids:{vitals:vitals.result_id,score:score.result_id}
  };
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  const started=Date.now();
  let response;
  try{
    response=await fetch(PROVIDER_URL,{method:'POST',signal:controller.signal,headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({
      model,store:false,max_output_tokens:900,
      instructions:'You are GalviGuide™, a bounded Founder Readiness interpreter. Explain the supplied deterministic Founder Readiness signals in warm, plain, customer-friendly language. Do not alter any score, invent a venture/BHR, diagnose Business Health, predict success, give regulated advice, or create a treatment decision. Treat the deterministic values as immutable. Strengths and focus areas must be directly supported by the supplied dimensions. The next step must remain the GalviStudio Founder Development Institute / SPUR Pre-Founder pathway.',
      input:JSON.stringify(evidence),
      text:{format:{type:'json_schema',name:'galvicare_prefounder_readiness_interpretation',strict:true,schema:schema()}}
    })});
  }catch(error){
    if(error?.name==='AbortError') throw new GVError('GV_AI_PROVIDER_TIMEOUT','Founder Readiness interpretation timed out.',503,undefined,true);
    throw new GVError('GV_AI_PROVIDER_UNAVAILABLE','Founder Readiness interpretation provider is unavailable.',503,undefined,true);
  }finally{clearTimeout(timer)}
  let payload={};try{payload=await response.json()}catch{}
  if(!response.ok) throw new GVError('GV_AI_PROVIDER_ERROR','Founder Readiness interpretation provider returned an error.',503,{provider_status:response.status},true);
  const output=extractOutput(payload);if(!output) throw new GVError('GV_AI_PROVIDER_SCHEMA','Founder Readiness interpretation returned no structured output.',503);
  let proposal;try{proposal=JSON.parse(output)}catch{throw new GVError('GV_AI_PROVIDER_SCHEMA','Founder Readiness interpretation returned invalid structured output.',503)}
  return {proposal,provider:'openai',provider_response_id:clean(payload?.id)||null,model:clean(payload?.model)||model,usage:payload?.usage||null,latency_ms:Date.now()-started};
}

async function replayAi(env,key,fingerprint){
  const receipt=await first(env.DB,'SELECT request_fingerprint,response_entity_id FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=?',AI_SCOPE,key);
  if(!receipt) return null;
  if(receipt.request_fingerprint!==fingerprint) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Founder Readiness AI idempotency key was reused with different evidence.',409);
  const audit=await first(env.DB,"SELECT safe_change_json FROM gv1_audit_log WHERE entity_type='prefounder_readiness_interpretation' AND entity_id=? ORDER BY occurred_at DESC LIMIT 1",receipt.response_entity_id);
  if(!audit) throw new GVError('GV_AI_REPLAY_MISSING','Stored Founder Readiness interpretation could not be replayed.',409);
  return {...parse(audit.safe_change_json,{}),idempotent_replay:true};
}

async function persistAi(env,ctx,key,fingerprint,context,record){
  const generationId=record.generation_id||newId('pfr_ai');
  const timestamp=now();
  const stored={...record,generation_id:generationId,idempotent_replay:false};
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_audit_log(audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at) VALUES(?,?,?,'append',NULL,1,'customer',?,?,?,?,?,?,?,?)`).bind(newId('aud'),'prefounder_readiness_interpretation',generationId,record.generation_source,record.validation_status==='accepted'?'AI_ACCEPTED':'AI_FALLBACK',JSON.stringify(stored),ctx.correlation,ctx.environment,timestamp,timestamp),
    env.DB.prepare(`INSERT INTO gv1_idempotency_keys(idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at) VALUES(?,?,?,?,201,'prefounder_readiness_interpretation',?,?)`).bind(newId('idem'),AI_SCOPE,key,fingerprint,generationId,timestamp)
  ]);
  return stored;
}

async function preFounderAi(request,env,ctx,key,input){
  const context=await preFounderContext(env,request,ctx,input.context_id);
  const [vitals,score]=await Promise.all([day2Result(env,context.context_id,'vitals'),day2Result(env,context.context_id,'score')]);
  if(vitals.score_type!=='founder_readiness'||score.score_type!=='founder_readiness'||vitals.payload.score_type!=='founder_readiness'||score.payload.score_type!=='founder_readiness') throw new GVError('GV_SCOPE_MISMATCH','Founder Readiness AI interpretation cannot consume Business Health results.',409);
  const evidenceRefs=[vitals.result_id,score.result_id,...vitals.supporting_evidence_ids,...score.supporting_evidence_ids].filter(Boolean);
  const fingerprint=await hash(AI_SCOPE,{context_id:context.context_id,vitals:vitals.result_id,score:score.result_id,prompt_version:AI_PROMPT_VERSION,schema_version:AI_SCHEMA_VERSION});
  const replayed=await replayAi(env,key,fingerprint);if(replayed)return replayed;
  let projection,providerMeta={},generationSource='rules_fallback',validationStatus='accepted',validationErrors=[];
  try{
    const generated=await callProvider(env,score,vitals);
    validationErrors=validateProposal(generated.proposal);
    if(validationErrors.length){projection=fallbackProjection(score,vitals,validationErrors[0]);generationSource='rules_fallback';validationStatus='rejected';providerMeta={provider:generated.provider,provider_response_id:generated.provider_response_id,model:generated.model,latency_ms:generated.latency_ms};}
    else{projection={summary:bounded(generated.proposal.summary),strengths:generated.proposal.strengths.map(x=>bounded(x,700)),focus_areas:generated.proposal.focus_areas.map(x=>bounded(x,700)),next_step:bounded(generated.proposal.next_step),confidence_note:bounded(generated.proposal.confidence_note)};generationSource='openai_governed';validationStatus='accepted';providerMeta={provider:generated.provider,provider_response_id:generated.provider_response_id,model:generated.model,latency_ms:generated.latency_ms,usage:generated.usage};}
  }catch(error){
    projection=fallbackProjection(score,vitals,error?.code||'provider_fallback');
    validationErrors=[error?.code||'GV_AI_FALLBACK'];
  }
  return persistAi(env,ctx,key,fingerprint,context,{
    generation_id:newId('pfr_ai'),context_id:context.context_id,founder_id:context.founder_id,venture_id:null,bmr_id:null,
    score_type:'founder_readiness',canonical_score:score.payload.overall_score,canonical_dimensions:score.payload.dimension_scores||vitals.payload.dimension_scores||{},
    projection,generation_source:generationSource,validation_status:validationStatus,validation_errors:validationErrors,
    prompt_version:AI_PROMPT_VERSION,schema_version:AI_SCHEMA_VERSION,evidence_refs:[...new Set(evidenceRefs)],
    deterministic_truth_immutable:true,route:'SPUR Pre-Founder',provider_metadata:providerMeta
  });
}

export async function handleDay7ReleaseRoute(request,env,ctx,path){
  const caller=actor(request);

  if(request.method==='GET'&&path==='/api/v1/day7/readiness'){
    const data=await membershipReadiness(env);
    return success(ctx,{...data,prefounder_ai:{qa_synthetic_projection:true,server_side_provider:true,structured_output:true,deterministic_score_immutable:true,production_synthetic_route:false}});
  }
  if(request.method==='POST'&&path==='/api/v1/day7/prefounder/readiness-interpretation'){
    const input=await jsonBody(request);
    const data=await preFounderAi(request,env,ctx,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,ai_status:data.generation_source==='openai_governed'?'accepted':'fallback'});
  }
  if(request.method==='POST'&&path==='/api/v1/day7/memberships'){
    const input=await jsonBody(request);
    const data=await startMembership(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const cancel=path.match(/^\/api\/v1\/day7\/memberships\/([^/]+)\/cancel$/);
  if(request.method==='POST'&&cancel){
    const data=await cancelMembership(env,ctx,caller,idempotencyKey(request),decodeURIComponent(cancel[1]));
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
  }
  const checkin=path.match(/^\/api\/v1\/day7\/memberships\/([^/]+)\/checkins$/);
  if(request.method==='POST'&&checkin){
    const input=await jsonBody(request);
    const data=await submitMembershipCheckin(env,ctx,caller,idempotencyKey(request),decodeURIComponent(checkin[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const read=path.match(/^\/api\/v1\/day7\/memberships\/([^/]+)$/);
  if(request.method==='GET'&&read){
    return success(ctx,await getMembership(env,caller,decodeURIComponent(read[1])));
  }
  return null;
}