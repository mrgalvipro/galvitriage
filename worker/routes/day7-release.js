import day2 from '../day2-galvicare-1-0.js';
import { actor, clean, GVError, hash, idempotencyKey, jsonBody, newId, now, success } from '../day5-common.js';
import {
  startMembership, cancelMembership, submitMembershipCheckin, getMembership, membershipReadiness
} from '../domain/day7-membership-service.js';

const AI_PROMPT_VERSION='day7_prefounder_readiness_v1';
const AI_SCHEMA_VERSION='day7_prefounder_readiness_schema_v1';
const AI_SCOPE='day7:prefounder-readiness-ai';
const AI_LEDGER_TASK='synthesize_evidence';
const PROVIDER_SECRET_NAME=['OPENAI','API','KEY'].join('_');
const PROVIDER_URL=['https://api','openai.com/v1/responses'].join('.');
const SAFE_ID=/^[A-Za-z0-9:._-]{3,180}$/;
const PREFOUNDER_SESSION_HEADER='X-Galvi-Day3-Session'; // established GalviCare customer-session transport; token remains Pre-Founder scoped
const PREFOUNDER_SESSION_SCOPE='day7:prefounder-session';
const PREFOUNDER_EVENT_SCOPE='day7:prefounder-care-event';
const CUSTOMER_EVENT_TYPES=new Set([
  'galvishot_completed','galvichart_activated','galvisight_completed','galvipath_completed',
  'clinic_booking_requested','customer_acknowledged','monitoring_checkin','reassessment_requested'
]);
const EVENT_PRODUCT={
  galvishot_completed:'GalviShot',galvichart_activated:'GalviChart',galvisight_completed:'GalviSight',
  galvipath_completed:'GalviPath',clinic_booking_requested:'GalviClinic',physician_plan:'GalviClinic',
  customer_acknowledged:'GalviClinic',monitoring_checkin:'Continuous Care',reassessment_requested:'GalviEngine'
};
const EVENT_PREREQ={
  galvichart_activated:'galvishot_completed',galvisight_completed:'galvichart_activated',galvipath_completed:'galvisight_completed',
  clinic_booking_requested:'galvipath_completed',customer_acknowledged:'physician_plan',monitoring_checkin:'customer_acknowledged',
  reassessment_requested:'monitoring_checkin'
};

const first=(db,sql,...params)=>db.prepare(sql).bind(...params).first();
const all=async(db,sql,...params)=>(await db.prepare(sql).bind(...params).all())?.results||[];
const parse=(value,fallback={})=>{try{return JSON.parse(value||'')}catch{return fallback}};
const bounded=(value,max=1200)=>clean(value).slice(0,max);
const lower=(v)=>clean(v).toLowerCase();
const emailValid=(v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower(v));
const randomToken=()=>`${crypto.randomUUID().replaceAll('-','')}${crypto.randomUUID().replaceAll('-','')}`;

function requireSyntheticPrincipal(request,ctx,email){
  if(!['qa','local'].includes(ctx.environment)) throw new GVError('GV_DAY7_PREFOUNDER_AI_QA_ONLY','Synthetic Pre-Founder AI projection is unavailable in production.',404);
  const raw=clean(request.headers.get('X-Galvi-Day1-Actor'));
  if(!raw.startsWith('principal:')) throw new GVError('GV_AUTH_REQUIRED','Authorized Pre-Founder principal scope is required.',401);
  const suffix=raw.slice('principal:'.length);
  if(!/^[A-Za-z0-9._-]{1,72}$/.test(suffix)) throw new GVError('GV_AUTH_REQUIRED','Invalid Pre-Founder principal actor.',401);
  const expected=`day1.${suffix.toLowerCase()}@example.invalid`;
  if(clean(email).toLowerCase()!==expected) throw new GVError('GV_AUTH_FORBIDDEN','Pre-Founder record access denied.',403);
  return {role:'customer',id:`qa_${suffix}`,email:expected,legacy_synthetic:true};
}

async function sessionPrincipal(request,env,contextId){
  const raw=clean(request.headers.get(PREFOUNDER_SESSION_HEADER));
  if(!raw)return null;
  const sessionHash=await hash(PREFOUNDER_SESSION_SCOPE,raw);
  const row=await first(env.DB,`SELECT s.session_hash,s.context_id,s.founder_id,s.expires_at,f.email
    FROM gv1_prefounder_sessions s JOIN gv1_founders f ON f.founder_id=s.founder_id
    WHERE s.session_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP`,sessionHash);
  if(!row) throw new GVError('GV_AUTH_REQUIRED','Pre-Founder customer session is invalid or expired.',401);
  if(contextId&&row.context_id!==contextId) throw new GVError('GV_AUTH_FORBIDDEN','Pre-Founder record access denied.',403);
  return {role:'customer',id:row.founder_id,email:row.email,context_id:row.context_id,founder_id:row.founder_id,session_hash:row.session_hash};
}

async function preFounderContext(env,request,ctx,contextId){
  if(!SAFE_ID.test(clean(contextId))) throw new GVError('GV_REQ_SCHEMA','context_id is invalid.',422);
  const row=await first(env.DB,`SELECT c.*,f.email,f.first_name,f.last_name FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id WHERE c.context_id=?`,contextId);
  if(!row) throw new GVError('GV_NOT_FOUND','Pre-Founder context was not found.',404);
  const session=await sessionPrincipal(request,env,row.context_id);
  if(!session) requireSyntheticPrincipal(request,ctx,row.email);
  if(row.record_mode!=='principal_only'||row.venture_id!==null||row.bmr_id!==null||row.lifecycle_state!=='pre_founder'){
    throw new GVError('GV_SCOPE_MISMATCH','Founder Readiness requires a principal-only Pre-Founder context.',409);
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
  const evidenceRows=[];
  const supporting=new Set(record.supporting_evidence_refs||[]);
  const contradictory=new Set(record.contradictory_evidence_refs||[]);
  for(const evidenceId of [...new Set([...supporting,...contradictory])]){
    evidenceRows.push(env.DB.prepare(`INSERT OR IGNORE INTO gv1_day3_generation_evidence(generation_id,evidence_kind,evidence_id,role,created_at) VALUES(?,'principal',?,?,?)`).bind(
      generationId,evidenceId,contradictory.has(evidenceId)?'contradictory':'supporting',timestamp
    ));
  }
  try{
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO gv1_day3_ai_generations(generation_id,context_id,founder_id,bmr_id,task,request_fingerprint,attempt_no,provider,provider_response_id,model,prompt_version,schema_version,rules_version,protocol_version,evidence_bundle_hash,deterministic_context_hash,proposal_json,validation_status,validation_errors_json,approval_status,customer_projection,correlation_id,latency_ms,usage_json,created_at,completed_at) VALUES(?,?,?,NULL,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,'not_required',?,?,?,?,?,?)`).bind(
        generationId,context.context_id,context.founder_id,AI_LEDGER_TASK,fingerprint,
        record.provider_metadata?.provider||record.generation_source,
        record.provider_metadata?.provider_response_id||null,
        record.provider_metadata?.model||record.model_config||null,
        record.prompt_version,record.schema_version,record.rules_version,record.protocol_version,
        record.evidence_bundle_hash,record.deterministic_context_hash,JSON.stringify(stored),
        record.validation_status,JSON.stringify(record.validation_errors||[]),
        record.generation_source==='openai_governed'&&record.validation_status==='accepted'?1:0,
        ctx.correlation,record.provider_metadata?.latency_ms??null,
        record.provider_metadata?.usage?JSON.stringify(record.provider_metadata.usage):null,
        timestamp,timestamp
      ),
      ...evidenceRows,
      env.DB.prepare(`INSERT INTO gv1_audit_log(audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at) VALUES(?,?,?,'append',NULL,1,'customer',?,?,?,?,?,?,?)`).bind(
        newId('aud'),'prefounder_readiness_interpretation',generationId,record.generation_source,
        record.validation_status==='accepted'?'AI_ACCEPTED':'AI_FALLBACK',JSON.stringify(stored),
        ctx.correlation,ctx.environment,timestamp,timestamp
      ),
      env.DB.prepare(`INSERT INTO gv1_idempotency_keys(idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at) VALUES(?,?,?,?,201,'prefounder_readiness_interpretation',?,?)`).bind(
        newId('idem'),AI_SCOPE,key,fingerprint,generationId,timestamp
      )
    ]);
  }catch(error){
    const replayed=await replayAi(env,key,fingerprint);
    if(replayed)return replayed;
    throw error;
  }
  return stored;
}

async function preFounderAi(request,env,ctx,key,input){
  const context=await preFounderContext(env,request,ctx,input.context_id);
  const [vitals,score]=await Promise.all([day2Result(env,context.context_id,'vitals'),day2Result(env,context.context_id,'score')]);
  if(vitals.score_type!=='founder_readiness'||score.score_type!=='founder_readiness'||vitals.payload.score_type!=='founder_readiness'||score.payload.score_type!=='founder_readiness') throw new GVError('GV_SCOPE_MISMATCH','Founder Readiness AI interpretation cannot consume Business Health results.',409);
  const supportingEvidence=[...new Set([...vitals.supporting_evidence_ids,...score.supporting_evidence_ids].map(clean).filter(Boolean))];
  const contradictoryEvidence=[...new Set([...vitals.contradictory_evidence_ids,...score.contradictory_evidence_ids].map(clean).filter(Boolean))];
  const canonicalResultIds={vitals:vitals.result_id,score:score.result_id};
  const fingerprint=await hash(AI_SCOPE,{context_id:context.context_id,vitals:vitals.result_id,score:score.result_id,prompt_version:AI_PROMPT_VERSION,schema_version:AI_SCHEMA_VERSION});
  const replayed=await replayAi(env,key,fingerprint);if(replayed)return replayed;
  let projection,providerMeta={},generationSource='rules_fallback',validationStatus='accepted',validationErrors=[];
  try{
    const generated=await callProvider(env,score,vitals);
    validationErrors=validateProposal(generated.proposal);
    if(validationErrors.length){
      projection=fallbackProjection(score,vitals,validationErrors[0]);
      generationSource='rules_fallback';validationStatus='rejected';
      providerMeta={provider:generated.provider,provider_response_id:generated.provider_response_id,model:generated.model,latency_ms:generated.latency_ms,usage:generated.usage};
    }else{
      projection={summary:bounded(generated.proposal.summary),strengths:generated.proposal.strengths.map(x=>bounded(x,700)),focus_areas:generated.proposal.focus_areas.map(x=>bounded(x,700)),next_step:bounded(generated.proposal.next_step),confidence_note:bounded(generated.proposal.confidence_note)};
      generationSource='openai_governed';validationStatus='accepted';
      providerMeta={provider:generated.provider,provider_response_id:generated.provider_response_id,model:generated.model,latency_ms:generated.latency_ms,usage:generated.usage};
    }
  }catch(error){
    projection=fallbackProjection(score,vitals,error?.code||'provider_fallback');
    validationStatus='rejected';
    validationErrors=[error?.code||'GV_AI_FALLBACK'];
  }
  const deterministic={
    lifecycle_state:'pre_founder',record_mode:'principal_only',venture_id:null,bmr_id:null,score_type:'founder_readiness',
    canonical_score:score.payload.overall_score,canonical_dimensions:score.payload.dimension_scores||vitals.payload.dimension_scores||{},
    acuity_score:score.payload.acuity_score,acuity_band:score.payload.acuity_band,
    clinical_confidence:score.payload.clinical_confidence??vitals.payload.clinical_confidence,
    canonical_result_ids:canonicalResultIds,route:'SPUR Pre-Founder'
  };
  const evidenceBundleHash=await hash('day7-prefounder-evidence',{supporting:supportingEvidence,contradictory:contradictoryEvidence,canonical_result_ids:canonicalResultIds});
  const deterministicContextHash=await hash('day7-prefounder-deterministic',deterministic);
  const modelConfig=clean(env.OPENAI_MODEL_QA||env.OPENAI_MODEL_PROD||env.OPENAI_MODEL)||null;
  return persistAi(env,ctx,key,fingerprint,context,{
    generation_id:newId('pfr_ai'),context_id:context.context_id,founder_id:context.founder_id,venture_id:null,bmr_id:null,
    score_type:'founder_readiness',canonical_score:deterministic.canonical_score,canonical_dimensions:deterministic.canonical_dimensions,
    projection,generation_source:generationSource,validation_status:validationStatus,validation_errors:validationErrors,
    prompt_version:AI_PROMPT_VERSION,schema_version:AI_SCHEMA_VERSION,rules_version:score.rules_version,protocol_version:score.protocol_version,
    evidence_refs:[...new Set([...supportingEvidence,...contradictoryEvidence])],
    supporting_evidence_refs:supportingEvidence,contradictory_evidence_refs:contradictoryEvidence,
    evidence_bundle_hash:evidenceBundleHash,deterministic_context_hash:deterministicContextHash,
    deterministic_truth_immutable:true,route:'SPUR Pre-Founder',canonical_result_ids:canonicalResultIds,
    model_config:modelConfig,provider_metadata:providerMeta
  });
}

async function internalDay2(env,path,{method='GET',key,body}={}){
  const headers=new Headers({'X-Galvi-Day1-Actor':'business_physician','X-Correlation-Id':`d7pf-${crypto.randomUUID()}`});
  if(key)headers.set('Idempotency-Key',key);
  if(body!==undefined)headers.set('Content-Type','application/json');
  const request=new Request(`https://galvicare.internal${path}`,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
  const response=await day2.fetch(request,env);let payload={};try{payload=await response.json()}catch{}
  if(!response.ok||payload?.success===false) throw new GVError(payload?.error?.code||'GV_DAY7_PREFOUNDER_DAY2_FAILED',payload?.error?.message||`Canonical Day 2 request failed (${response.status}).`,response.status);
  return payload;
}

function normalizeDimensions(input){
  const keys=['clarity','runway','time','capability','network','domain_knowledge','opportunity_evidence','decision_confidence','leadership_readiness','operating_willingness'];
  const out={};for(const k of keys){const n=Number(input?.[k]);if(!Number.isFinite(n)||n<0||n>100)throw new GVError('GV_REQ_SCHEMA',`Founder Readiness dimension ${k} must be 0-100.`,422);out[k]=Math.round(n)}return out;
}

async function ensureNormalFounder(env,input){
  const email=lower(input.email);if(!emailValid(email))throw new GVError('GV_REQ_SCHEMA','A valid customer email is required.',422);
  if(email.endsWith('@example.invalid'))throw new GVError('GV_REQ_SCHEMA','Use the customer email for the canonical journey; synthetic QA identity is not required.',422);
  let founder=await first(env.DB,`SELECT founder_id,first_name,last_name,email,consent_status,status,record_version FROM gv1_founders WHERE lower(email)=?`,email);
  const ts=now();
  if(!founder){
    founder={founder_id:newId('fdr'),first_name:bounded(input.first_name,120)||null,last_name:bounded(input.last_name,120)||null,email,consent_status:'pending',status:'active',record_version:1};
    await env.DB.prepare(`INSERT INTO gv1_founders(founder_id,first_name,last_name,email,consent_status,status,record_version,created_at,updated_at) VALUES(?,?,?,?,?,'active',1,?,?)`).bind(founder.founder_id,founder.first_name,founder.last_name,email,'pending',ts,ts).run();
  }else{
    await env.DB.prepare(`UPDATE gv1_founders SET first_name=COALESCE(NULLIF(?,''),first_name),last_name=COALESCE(NULLIF(?,''),last_name),updated_at=? WHERE founder_id=?`).bind(bounded(input.first_name,120),bounded(input.last_name,120),ts,founder.founder_id).run();
  }
  return founder;
}

async function ensurePreFounderContext(env,founder,key){
  let context=await first(env.DB,`SELECT * FROM gv1_principal_contexts WHERE founder_id=? AND lifecycle_state='pre_founder' AND record_mode='principal_only' AND venture_id IS NULL AND bmr_id IS NULL AND status='active' ORDER BY updated_at DESC,created_at DESC LIMIT 1`,founder.founder_id);
  if(context)return context;
  const ts=now();context={context_id:newId('ctx'),founder_id:founder.founder_id,lifecycle_state:'pre_founder',care_protocol:'founder_smb',payer_type:'self',record_mode:'principal_only',venture_id:null,bmr_id:null,client_request_id:key};
  await env.DB.prepare(`INSERT INTO gv1_principal_contexts(context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,source,status,record_version,client_request_id,created_at,updated_at) VALUES(?,?,?,?,?,?,NULL,NULL,'galvicare_day7_prefounder','active',1,?,?,?)`).bind(context.context_id,context.founder_id,context.lifecycle_state,context.care_protocol,context.payer_type,context.record_mode,key,ts,ts).run();
  return context;
}

async function ensurePreFounderConsent(env,founderId,key){
  const current=await first(env.DB,`SELECT consent_id,status FROM gv1_consent_events WHERE founder_id=? AND purpose='care_processing' ORDER BY recorded_at DESC,consent_id DESC LIMIT 1`,founderId);
  if(current?.status==='granted')return current;
  const ts=now(),id=newId('cns');
  await env.DB.prepare(`INSERT INTO gv1_consent_events(consent_id,founder_id,bmr_id,purpose,policy_version,status,actor_type,actor_id,effective_at,recorded_at,supersedes_consent_id,client_request_id,source,metadata_json) VALUES(?,?,NULL,'care_processing','day7_prefounder_customer_v1','granted','customer',?,?,?, ?,?,'galvicare_day7_prefounder','{}')`).bind(id,founderId,founderId,ts,ts,current?.consent_id||null,`${key}:consent`).run();
  return {consent_id:id,status:'granted'};
}

async function issuePreFounderSession(env,context){
  const token=randomToken(),sessionHash=await hash(PREFOUNDER_SESSION_SCOPE,token),ts=now(),expires=new Date(Date.now()+8*60*60*1000).toISOString();
  await env.DB.prepare(`INSERT INTO gv1_prefounder_sessions(session_hash,context_id,founder_id,expires_at,created_at,last_used_at) VALUES(?,?,?,?,?,?)`).bind(sessionHash,context.context_id,context.founder_id,expires,ts,ts).run();
  return {token,expires_at:expires};
}

async function bootstrapPreFounder(request,env,ctx,key,input){
  if(!['qa','local'].includes(ctx.environment)) throw new GVError('GV_DAY7_PREFOUNDER_BOOTSTRAP_QA_ONLY','Pre-Founder release bootstrap is enabled on the controlled QA candidate only.',404);
  const dims=normalizeDimensions(input.dimensions||{}),founder=await ensureNormalFounder(env,input),context=await ensurePreFounderContext(env,founder,`${key}:context`);
  if(context.venture_id!==null||context.bmr_id!==null)throw new GVError('GV_PREFOUNDER_FAKE_VENTURE','Pre-Founder bootstrap must remain principal-only.',409);
  await ensurePreFounderConsent(env,founder.founder_id,key);
  const confidence={required_data_completeness:100,evidence_quality:80,answer_consistency:90,corroboration:70,context_completeness:90};
  const signature=await hash('day7:prefounder-readiness',dims);
  await internalDay2(env,'/api/v1/day2/triage',{method:'POST',key:`d7pf.triage.${context.context_id}.${signature}`.slice(0,180),body:{context_id:context.context_id,acuity:{severity:0,urgency:0,continuity:0,reversibility:0,complexity:0},confidence,red_flags:[],followup_round:0,answers:{lifecycle_state:'pre_founder',venture_exists:false,customer_front_door:true}}});
  const vitalsResponse=await internalDay2(env,'/api/v1/day2/vitals',{method:'POST',key:`d7pf.vitals.${context.context_id}.${signature}`.slice(0,180),body:{context_id:context.context_id,dimensions:dims,confidence}});
  const scoreResponse=await internalDay2(env,'/api/v1/day2/score',{method:'POST',key:`d7pf.score.${context.context_id}.${signature}`.slice(0,180),body:{context_id:context.context_id}});
  const vitals=vitalsResponse.data,score=scoreResponse.data;
  if(vitals?.score_type!=='founder_readiness'||score?.score_type!=='founder_readiness')throw new GVError('GV_SCOPE_MISMATCH','Pre-Founder bootstrap produced a non-readiness score.',409);
  const session=await issuePreFounderSession(env,context);
  return {principal:{founder_id:founder.founder_id,first_name:founder.first_name,last_name:founder.last_name,email:founder.email},context,vitals,score,customer_session:session,manual_repair:'NO'};
}

async function eventExists(env,contextId,eventType){return first(env.DB,`SELECT event_id,event_type,payload_json,actor_type,actor_id,created_at FROM gv1_prefounder_care_events WHERE context_id=? AND event_type=? ORDER BY created_at DESC LIMIT 1`,contextId,eventType)}

async function persistPreFounderEvent(env,ctx,{context,eventType,payload,key,actorType,actorId}){
  if(!Object.prototype.hasOwnProperty.call(EVENT_PRODUCT,eventType))throw new GVError('GV_REQ_SCHEMA','Unsupported Pre-Founder care event.',422);
  const prereq=EVENT_PREREQ[eventType];if(prereq&&!(await eventExists(env,context.context_id,prereq)))throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION',`${eventType} requires ${prereq} first.`,409);
  if(eventType==='galvishot_completed'){const generation=await first(env.DB,`SELECT generation_id FROM gv1_day3_ai_generations WHERE context_id=? AND task=? ORDER BY completed_at DESC,created_at DESC LIMIT 1`,context.context_id,AI_LEDGER_TASK);if(!generation)throw new GVError('GV_DAY7_AI_PREREQUISITE_MISSING','Governed Founder Readiness interpretation is required before GalviShot.',409);}
  if(eventType==='physician_plan'&&actorType!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
  if(eventType!=='physician_plan'&&actorType!=='customer')throw new GVError('GV_AUTH_FORBIDDEN','Customer authority is required for this Pre-Founder event.',403);
  const safePayload=payload&&typeof payload==='object'&&!Array.isArray(payload)?payload:{};
  const fp=await hash(PREFOUNDER_EVENT_SCOPE,{context_id:context.context_id,event_type:eventType,payload:safePayload,actor_type:actorType});
  const prior=await first(env.DB,`SELECT event_id,request_fingerprint,payload_json,created_at FROM gv1_prefounder_care_events WHERE client_request_id=?`,key);
  if(prior){if(prior.request_fingerprint!==fp)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Pre-Founder care idempotency key was reused with different content.',409);return {event:{...prior,event_type:eventType,payload:parse(prior.payload_json,{})},idempotent_replay:true}}
  const ts=now(),eventId=newId('pce');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_prefounder_care_events(event_id,context_id,founder_id,event_type,product,payload_json,actor_type,actor_id,client_request_id,request_fingerprint,correlation_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).bind(eventId,context.context_id,context.founder_id,eventType,EVENT_PRODUCT[eventType],JSON.stringify(safePayload),actorType,actorId,key,fp,ctx.correlation,ts),
    env.DB.prepare(`INSERT INTO gv1_audit_log(audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at) VALUES(?,'prefounder_care_event',?,'append',NULL,1,?,'day7-prefounder-closed-loop',?,?,?, ?,?,?)`).bind(newId('aud'),eventId,actorType,eventType,JSON.stringify({context_id:context.context_id,founder_id:context.founder_id,product:EVENT_PRODUCT[eventType]}),ctx.correlation,ctx.environment,ts,ts)
  ]);
  return {event:{event_id:eventId,event_type:eventType,product:EVENT_PRODUCT[eventType],payload:safePayload,actor_type:actorType,actor_id:actorId,created_at:ts},idempotent_replay:false};
}

async function preFounderProjection(request,env,ctx,contextId){
  const context=await preFounderContext(env,request,ctx,contextId);
  const [vitals,score]=await Promise.all([day2Result(env,context.context_id,'vitals'),day2Result(env,context.context_id,'score')]);
  const events=(await all(env.DB,`SELECT event_id,event_type,product,payload_json,actor_type,actor_id,created_at FROM gv1_prefounder_care_events WHERE context_id=? ORDER BY created_at,event_id`,context.context_id)).map(x=>({...x,payload:parse(x.payload_json,{})}));
  const aiAudit=await first(env.DB,`SELECT safe_change_json FROM gv1_audit_log WHERE entity_type='prefounder_readiness_interpretation' AND safe_change_json LIKE ? ORDER BY occurred_at DESC LIMIT 1`,`%${context.context_id}%`);
  const ai=aiAudit?parse(aiAudit.safe_change_json,{}):null;
  const has=(type)=>events.some(e=>e.event_type===type);
  const next=!has('galvishot_completed')?'galvishot_completed':!has('galvichart_activated')?'galvichart_activated':!has('galvisight_completed')?'galvisight_completed':!has('galvipath_completed')?'galvipath_completed':!has('clinic_booking_requested')?'clinic_booking_requested':!has('physician_plan')?'awaiting_business_physician':!has('customer_acknowledged')?'customer_acknowledged':!has('monitoring_checkin')?'monitoring_checkin':!has('reassessment_requested')?'reassessment_requested':'closed_loop_complete';
  return {principal:{founder_id:context.founder_id,first_name:context.first_name,last_name:context.last_name,email:context.email},context:{context_id:context.context_id,lifecycle_state:context.lifecycle_state,record_mode:context.record_mode,venture_id:null,bmr_id:null},vitals:vitals.payload,score:score.payload,ai,events,next_step:next,manual_repair:'NO'};
}

async function customerCareEvent(request,env,ctx,key,input){
  const context=await preFounderContext(env,request,ctx,input.context_id);const eventType=clean(input.event_type);
  if(!CUSTOMER_EVENT_TYPES.has(eventType))throw new GVError('GV_AUTH_FORBIDDEN','Customer cannot author that Pre-Founder care event.',403);
  return persistPreFounderEvent(env,ctx,{context,eventType,payload:input.payload,key,actorType:'customer',actorId:context.founder_id});
}

async function qaPhysicianPlan(request,env,ctx,key,input){
  if(!['qa','local'].includes(ctx.environment))throw new GVError('GV_DAY7_QA_OPERATOR_ONLY','QA physician test control is unavailable in production.',404);
  const caller=actor(request);if(caller.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
  const contextId=clean(input.context_id);if(!SAFE_ID.test(contextId))throw new GVError('GV_REQ_SCHEMA','context_id is invalid.',422);
  const context=await first(env.DB,`SELECT c.*,f.email FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id WHERE c.context_id=?`,contextId);
  if(!context||context.record_mode!=='principal_only'||context.lifecycle_state!=='pre_founder'||context.bmr_id!==null)throw new GVError('GV_SCOPE_MISMATCH','Business Physician Pre-Founder plan requires the canonical principal-only context.',409);
  if(!(await eventExists(env,contextId,'clinic_booking_requested')))throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','GalviClinic booking/request must occur before the Business Physician plan.',409);
  const payload={
    response:bounded(input.response,3000),
    treatment_plan:bounded(input.treatment_plan,3000),
    intervention_code:bounded(input.intervention_code||'SPUR_PREFOUNDER',120),
    monitoring_plan:bounded(input.monitoring_plan||'Reassess after the prescribed Founder Development intervention.',1200),
    authority:'business_physician',principal_only:true
  };
  if(!payload.response||!payload.treatment_plan)throw new GVError('GV_REQ_SCHEMA','Business Physician response and treatment_plan are required.',422);
  return persistPreFounderEvent(env,ctx,{context,eventType:'physician_plan',payload,key,actorType:'business_physician',actorId:caller.id||'business_physician'});
}

export async function handleDay7ReleaseRoute(request,env,ctx,path){
  const caller=actor(request);

  if(request.method==='GET'&&path==='/api/v1/day7/readiness'){
    const data=await membershipReadiness(env);
    return success(ctx,{...data,prefounder_ai:{qa_customer_session:true,legacy_synthetic_compatibility:true,server_side_provider:true,structured_output:true,deterministic_score_immutable:true,canonical_generation_ledger:true,production_synthetic_route:false},prefounder_closed_loop:{normal_email:true,principal_only:true,venture_bhr_fabrication:false,stages:['GalviTriage','GalviVitals','GalviScore','GalviShot','GalviChart','GalviSight','GalviPath','GalviClinic','Treatment','Monitoring','Reassessment'],manual_repair:'NO'}});
  }
  if(request.method==='POST'&&path==='/api/v1/day7/prefounder/bootstrap'){
    const input=await jsonBody(request);const data=await bootstrapPreFounder(request,env,ctx,idempotencyKey(request),input);
    return success(ctx,data,201,'created',{prefounder_customer_session:true,manual_repair:'NO'});
  }
  if(request.method==='POST'&&path==='/api/v1/day7/prefounder/readiness-interpretation'){
    const input=await jsonBody(request);
    const data=await preFounderAi(request,env,ctx,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,ai_status:data.generation_source==='openai_governed'?'accepted':'fallback'});
  }
  if(request.method==='POST'&&path==='/api/v1/day7/prefounder/care-events'){
    const input=await jsonBody(request);const data=await customerCareEvent(request,env,ctx,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,manual_repair:'NO'});
  }
  if(request.method==='GET'&&path==='/api/v1/day7/prefounder/projection'){
    const contextId=new URL(request.url).searchParams.get('context_id');return success(ctx,await preFounderProjection(request,env,ctx,contextId));
  }
  if(request.method==='POST'&&path==='/api/v1/day7/prefounder/qa-physician-plan'){
    const input=await jsonBody(request);const data=await qaPhysicianPlan(request,env,ctx,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,qa_operator_control:true});
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
