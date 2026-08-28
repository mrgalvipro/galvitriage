import base from './day5-customer-context-entry.js';
import { GVError, CUSTOMER_SESSION_HEADER, context, failure, requireRuntime, success } from './day5-common.js';
import { first } from './repositories/care-repository.js';

/*
 * Day 5 final critical-path compatibility boundary.
 *
 * Proven Human-E2E defects addressed here:
 * 1) H19 must use the exact customer session -> canonical founder -> founder/venture
 *    role -> venture -> BMR -> context chain already enforced by day5-customer-context-entry.
 * 2) GalviPath "Evidence to Strengthen Your Care Plan" must not be driven by raw
 *    deterministic confidence-gap identifiers. For care-conversation/Clinic-prep
 *    intents, GalviGuide receives the accepted governed Shot/Sight/Path artifacts
 *    from that exact BMR and uses server-side OpenAI Responses under a strict schema.
 * 3) If the provider is unavailable or rejects schema, the fallback remains bounded,
 *    customer-safe and evidence-oriented; it never becomes treatment authority.
 *
 * No browser-to-OpenAI/D1 access, no treatment approval, no canonical write, no new DB.
 */
export const DAY5_FINAL_RUNTIME='day5_exact_bmr_governed_path_evidence_v1';
const AI_INTENTS=new Set(['care_conversation','clinic_prep','supportive_explanation']);
const PROHIBITED=/\b(?:change|raise|lower|override|rewrite|recalculate|edit)\b.{0,60}\b(?:galviscore|score|acuity|clinical confidence)\b|\bdiagnos(?:e|is|tic)\b|\bapprove\b.{0,40}\b(?:treatment|plan|prescription)\b|\b(?:legal|tax|fiduciary|investment|securities|medical)\s+advice\b/i;
const UNSAFE=/\b(?:your diagnosis is|i diagnose|treatment (?:is )?approved|prescription (?:is )?approved|authorized treatment|legal advice:|tax advice:|investment advice:|medical advice:)\b/i;
const SCHEMA={type:'object',additionalProperties:false,required:['supportive_explanation','care_conversation','next_actions','escalation'],properties:{supportive_explanation:{type:'string',minLength:1,maxLength:1600},care_conversation:{type:'string',minLength:1,maxLength:1600},next_actions:{type:'array',minItems:1,maxItems:5,items:{type:'string',minLength:1,maxLength:360}},escalation:{type:['string','null'],maxLength:600}}};
const text=v=>String(v??'').trim();
const low=v=>text(v).toLowerCase();
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)));
const parse=(v,fallback={})=>{if(v&&typeof v==='object')return v;try{return JSON.parse(v||'')}catch{return fallback}};
const GAP_COPY=Object.freeze({
  required_data_completeness:'Provide the missing operating facts needed to validate the current care priority and next decision.',
  evidence_quality:'Provide primary-source evidence supporting the current finding, such as an operating report, system record, customer record, or business artifact.',
  answer_consistency:'Resolve any conflicting or changed answers that could materially alter the current care recommendation.',
  corroboration:'Provide an independent source, observation, or result that corroborates the current finding before the next care decision.',
  context_completeness:'Add the operating context that could materially change how the current evidence should be interpreted or acted on.'
});
const customerSafeEvidence=value=>{const key=low(value).replace(/[\s-]+/g,'_');return GAP_COPY[key]||text(value)};

async function legacyIdentity(db,sessionId){
  return first(db,`SELECT f.email,v.venture_name FROM ventures v JOIN founders f ON f.founder_id=v.founder_id WHERE v.session_id=? ORDER BY v.updated_at DESC,v.created_at DESC LIMIT 1`,sessionId)
    ||first(db,`SELECT f.email,'' AS venture_name FROM founders f WHERE f.session_id=? ORDER BY f.updated_at DESC LIMIT 1`,sessionId);
}
async function exactCareContext(env,sessionId){
  const legacy=await legacyIdentity(env.DB,sessionId);if(!legacy?.email)throw new GVError('GV_DAY5_SESSION_IDENTITY_MISSING','GalviCare session identity is unavailable.',401);
  const founder=await first(env.DB,`SELECT founder_id,email FROM gv1_founders WHERE lower(email)=lower(?) LIMIT 1`,legacy.email);if(!founder?.founder_id)throw new GVError('GV_DAY5_CANONICAL_IDENTITY_MISSING','Canonical GalviVault identity is unavailable.',409);
  const ventureName=text(legacy.venture_name);if(!ventureName)throw new GVError('GV_DAY5_CANONICAL_VENTURE_MISSING','The customer session is not bound to an operating venture.',409);
  const venture=await first(env.DB,`SELECT v.venture_id,v.venture_name FROM gv1_founder_venture_roles r JOIN gv1_ventures v ON v.venture_id=r.venture_id WHERE r.founder_id=? AND r.status='active' AND v.status='active' AND lower(trim(v.venture_name))=lower(trim(?)) ORDER BY r.is_primary DESC,v.updated_at DESC,v.created_at DESC LIMIT 1`,founder.founder_id,ventureName);if(!venture?.venture_id)throw new GVError('GV_DAY5_CANONICAL_VENTURE_MISSING','Canonical venture identity is unavailable for this customer session.',409);
  const record=await first(env.DB,`SELECT bmr_id,venture_id,status,current_session_id,updated_at FROM gv1_business_medical_records WHERE venture_id=? AND status IN ('open','active') ORDER BY CASE WHEN current_session_id=? THEN 0 ELSE 1 END,updated_at DESC,created_at DESC LIMIT 1`,venture.venture_id,sessionId);if(!record?.bmr_id)throw new GVError('GV_DAY5_CANONICAL_BMR_MISSING','Canonical Business Health Record is unavailable for this customer session.',409);
  const canonical=await first(env.DB,`SELECT context_id,founder_id,venture_id,bmr_id,record_mode,status FROM gv1_principal_contexts WHERE founder_id=? AND venture_id=? AND bmr_id=? AND status='active' ORDER BY updated_at DESC,created_at DESC LIMIT 1`,founder.founder_id,venture.venture_id,record.bmr_id);if(!canonical?.context_id)throw new GVError('GV_DAY5_CANONICAL_CONTEXT_MISSING','Canonical care context is unavailable for this customer session.',409);
  const consent=await first(env.DB,`SELECT status FROM gv1_consent_events WHERE founder_id=? AND purpose='care_processing' ORDER BY recorded_at DESC,consent_id DESC LIMIT 1`,founder.founder_id);if(consent?.status!=='granted')throw new GVError('GV_CONSENT_REQUIRED','Active care-processing consent is required.',403);
  const scoreRow=await first(env.DB,`SELECT result_id,payload_json,record_version,rules_version,protocol_version FROM gv1_day2_intake_results WHERE context_id=? AND bmr_id=? AND result_type='score' ORDER BY record_version DESC,created_at DESC LIMIT 1`,canonical.context_id,record.bmr_id);if(!scoreRow?.payload_json)throw new GVError('GV_DAY5_CARE_ROUTE_NOT_READY','Canonical GalviScore/Acuity is not ready.',409);
  return {session_id:sessionId,founder,venture,record,context:canonical,score_row:scoreRow,score:parse(scoreRow.payload_json,{})};
}

async function governedArtifacts(env,care){
  const rows=(await env.DB.prepare(`SELECT artifact_id,product,artifact_json,record_version,generation_source,validation_status,approval_status,prompt_version,schema_version,rules_version,protocol_version,created_at FROM gv1_day3_governed_artifacts WHERE context_id=? AND bmr_id=? AND validation_status='accepted' AND approval_status IN ('not_required','approved') AND product IN ('GalviShot','GalviSight','GalviPath') ORDER BY created_at DESC,record_version DESC LIMIT 9`).bind(care.context.context_id,care.record.bmr_id).all())?.results||[];
  const seen=new Set(),out=[];
  for(const row of rows){if(seen.has(row.product))continue;seen.add(row.product);const parsed=parse(row.artifact_json,{}),artifact=parsed?.content&&typeof parsed.content==='object'?parsed.content:parsed;out.push({...row,artifact});}
  return out;
}
function routeFromScore(score={}){const acuityBand=low(score.acuity_band),disposition=low(score.disposition),overall=Number(score.overall_score??score.score),confidence=Number(score.clinical_confidence),referral=acuityBand==='red'||disposition==='urgent_active_specialty_referral',clinic=referral||acuityBand==='orange'||disposition==='active_care_recommended';return {overall_score:Number.isFinite(overall)?overall:null,acuity_score:Number.isFinite(Number(score.acuity_score))?Number(score.acuity_score):null,acuity_band:acuityBand||null,clinical_confidence:Number.isFinite(confidence)?confidence:null,disposition:disposition||null,support_level:referral?'qualified_referral':clinic?'galviclinic':acuityBand==='yellow'?'galviguide':'self_guided',recommended_action:referral?'qualified_referral':clinic?'book_galviclinic':acuityBand==='yellow'?'use_galviguide':'continue_path',clinic_recommended:clinic,referral_required:referral,guide_available:true};}
function pathArtifact(artifacts){return artifacts.find(x=>x.product==='GalviPath')?.artifact||{};}
function fallback(care,route,artifacts,reason,attempted=false){const path=pathArtifact(artifacts),raw=Array.isArray(path.evidence_required)?path.evidence_required:Array.isArray(path.evidence_to_collect)?path.evidence_to_collect:[],evidence=raw.map(customerSafeEvidence).filter(Boolean).slice(0,5),sequence=(Array.isArray(path.sequence)?path.sequence:[]).map(text).filter(Boolean).slice(0,5),next=evidence.length?evidence:sequence.length?sequence:['Continue collecting primary-source evidence against the current GalviPath priority and bring material changes to the next Business Physician review.'];return {...route,supportive_explanation:'Your care plan remains anchored to the accepted Business Health evidence and Business Physician governance. The items below describe what evidence would most improve confidence in the next care decision.',care_conversation:'Use these evidence requests to strengthen the current GalviPath. They do not change GalviScore, Acuity, Clinical Confidence, findings, or treatment authority.',next_actions:next,escalation:route.referral_required?'Continue through the qualified referral pathway.':text(path.escalation)||null,ai_metadata:{attempted,used:false,fallback:true,reason,provider:attempted?'openai':null,provider_response_id:null,model:null}};}
function config(env){const model=text(env.OPENAI_MODEL_QA),apiKey=text(env.OPENAI_API_KEY),enabled=low(env.AI_ENABLED)==='true'&&Boolean(model&&apiKey);return {model,apiKey,enabled,timeoutMs:clamp(env.OPENAI_TIMEOUT_MS||20000,1000,20000),maxBytes:clamp(env.OPENAI_MAX_INPUT_BYTES||24000,4000,64000)}}
function outputText(raw){if(text(raw?.output_text))return text(raw.output_text);for(const item of raw?.output||[]){for(const c of item?.content||[]){if(c?.type==='output_text'&&text(c.text))return text(c.text)}}return''}
function valid(v){return Boolean(v&&typeof v==='object'&&!Array.isArray(v)&&text(v.supportive_explanation)&&text(v.care_conversation)&&Array.isArray(v.next_actions)&&v.next_actions.length&&v.next_actions.length<=5&&v.next_actions.every(x=>text(x))&&(v.escalation===null||typeof v.escalation==='string'));}
async function synthesize(env,care,route,artifacts,message){
  const cfg=config(env),safeFallback=fallback(care,route,artifacts,cfg.enabled?'provider_fallback':'provider_not_configured',false);if(!cfg.enabled)return safeFallback;
  const payload={user_message:message||'What evidence should I collect to strengthen my current GalviPath care plan and prepare for the next care decision?',canonical_route:route,canonical_score:{result_id:care.score_row.result_id,record_version:Number(care.score_row.record_version||1),overall_score:route.overall_score,dimension_scores:care.score.dimension_scores||care.score.category_scores||{},acuity_score:route.acuity_score,acuity_band:route.acuity_band,clinical_confidence:route.clinical_confidence,disposition:route.disposition},accepted_governed_artifacts:artifacts.map(x=>({artifact_id:x.artifact_id,product:x.product,record_version:Number(x.record_version||1),generation_source:x.generation_source,artifact:x.artifact})),policy:{canonical_truth_immutable:true,business_physician_owns_treatment:true,customer_safe_evidence_language:true,regulated_advice_prohibited:true}};
  const input=JSON.stringify(payload);if(new TextEncoder().encode(input).byteLength>cfg.maxBytes)return {...safeFallback,ai_metadata:{...safeFallback.ai_metadata,attempted:true,reason:'provider_input_too_large',provider:'openai',model:cfg.model}};
  const instructions=['You are GalviGuide 1.0, a bounded virtual GalviClinician inside GalviCare.','Synthesize the accepted governed Business Health evidence into concrete, customer-specific evidence requests that will strengthen the current GalviPath and next Business Physician decision.','Do not output internal confidence-gap keys such as required_data_completeness, evidence_quality, answer_consistency, corroboration, or context_completeness. Translate them into plain-language evidence requests tied to the supplied business context.','Treat canonical score, acuity, confidence, accepted findings and GalviPath as immutable. Do not diagnose, approve treatment, alter scores, invent facts, or provide licensed advice.','Return only the strict JSON schema.'].join('\n');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),cfg.timeoutMs);let response,raw={};try{response=await fetch('https://api.openai.com/v1/responses',{method:'POST',signal:controller.signal,headers:{authorization:`Bearer ${cfg.apiKey}`,'content-type':'application/json'},body:JSON.stringify({model:cfg.model,store:false,instructions,input,max_output_tokens:1000,text:{format:{type:'json_schema',name:'galvicare_day5_path_evidence',strict:true,schema:SCHEMA}}})});try{raw=await response.json()}catch{}if(!response.ok)return {...safeFallback,ai_metadata:{attempted:true,used:false,fallback:true,reason:`provider_http_${response.status}`,provider:'openai',provider_response_id:text(raw.id)||null,model:text(raw.model)||cfg.model}};}catch(error){return {...safeFallback,ai_metadata:{attempted:true,used:false,fallback:true,reason:error?.name==='AbortError'?'provider_timeout':'provider_unavailable',provider:'openai',provider_response_id:null,model:cfg.model}};}finally{clearTimeout(timer)}
  let result=null;try{result=JSON.parse(outputText(raw))}catch{}if(!valid(result)||UNSAFE.test(JSON.stringify(result||{})))return {...safeFallback,ai_metadata:{attempted:true,used:false,fallback:true,reason:valid(result)?'unsafe_output':'invalid_schema',provider:'openai',provider_response_id:text(raw.id)||null,model:text(raw.model)||cfg.model}};
  return {...route,...result,ai_metadata:{attempted:true,used:true,fallback:false,reason:null,provider:'openai',provider_response_id:text(raw.id)||null,model:text(raw.model)||cfg.model,usage:raw.usage||null}};
}

async function governedPathEvidence(request,env,ctx){
  let input={};try{input=await request.clone().json()}catch{}
  const intent=low(input?.intent||'care_conversation'),message=text(input?.message).slice(0,1200);if(!AI_INTENTS.has(intent))return null;if(PROHIBITED.test(message))throw new GVError('GV_GUIDE_BOUNDARY','This request requires Business Physician or qualified professional judgment.',403,{write_performed:false});
  const sessionId=text(request.headers.get(CUSTOMER_SESSION_HEADER));if(!sessionId)throw new GVError('GV_AUTH_REQUIRED','An authenticated GalviCare customer session is required.',401);
  const care=await exactCareContext(env,sessionId),route=routeFromScore(care.score),artifacts=await governedArtifacts(env,care),narration=await synthesize(env,care,route,artifacts,message);
  return success(ctx,{...route,intent,read_only:true,canonical_source:'exact_session_venture_bmr_context',source_result_id:care.score_row.result_id,source_record_version:Number(care.score_row.record_version||1),source_artifact_ids:artifacts.map(x=>x.artifact_id),guide_version:'governed_path_evidence_v1',...narration},200,'ok',{identity_source:'session_venture_bmr_context_v2',galviguide_ai:'server_side_bounded_path_evidence_v1',write_performed:false});
}

export default {async fetch(request,env,executionContext){
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    const path=new URL(request.url).pathname.replace(/\/+$/,'')||'/';
    if(request.method==='POST'&&path==='/api/v1/day5/customer/galviguide'){
      const response=await governedPathEvidence(request,env,ctx);if(response)return response;
    }
    const response=await base.fetch(request,env,executionContext);
    const headers=new Headers(response.headers);headers.set('X-Galvi-Day5-Final-Runtime',DAY5_FINAL_RUNTIME);
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }catch(error){console.error('GalviCare Day 5 final boundary error',error?.code||'GV_INTERNAL',error?.message||'unexpected');return failure(ctx,error);}
}};
