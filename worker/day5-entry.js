import day5Worker from './day5-core-entry.js';
import day2 from './day2-galvicare-1-0.js';

/* Cumulative Day 5 critical-path adapter.
 * Preserves the complete Day 5 Worker underneath while fixing only proven
 * Human-E2E provider-size, canonical Score/Acuity convergence and projection defects.
 */
export const DAY5_CRITICAL_PATH_RUNTIME='day5_governed_ai_evidence_window_v2';
export const MAX_PROVIDER_EVIDENCE_ITEMS=3;
const CUSTOMER_HEADER='X-Galvi-Day3-Session';
const STAGE_BY_PATH=Object.freeze({'/api/v1/day3/shot':'GalviShot','/api/v1/day3/sight':'GalviSight','/api/v1/day3/path':'GalviPath'});
const text=value=>String(value??'').trim();
const low=value=>text(value).toLowerCase();
const first=(db,sql,...params)=>db.prepare(sql).bind(...params).first();
const safe=value=>text(value).replace(/[^A-Za-z0-9._:-]/g,'_').slice(0,120);

function classification(score){const value=Number(score);if(!Number.isFinite(value))return null;if(value<40)return'Critical';if(value<60)return'Strained';if(value<80)return'Stable but Watch';if(value<90)return'Healthy';return'Healthy/Scaling';}
function lowestCategory(scores={}){const ranked=Object.entries(scores||{}).map(([key,value])=>[text(key),Number(value)]).filter(([key,value])=>key&&Number.isFinite(value)).sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0]));return ranked[0]?.[0]||null;}
function parseJson(value,fallback={}){if(value&&typeof value==='object')return value;try{return JSON.parse(value||'{}')}catch{return fallback}}
function followupPayload(row){const content=parseJson(row?.content_json,{});return Array.isArray(content?.payload?.followups)?content.payload.followups:Array.isArray(content?.followups)?content.followups:[];}
function hasCurrentStageAnswer(row,stage){if(text(row?.evidence_type)!=='customer_followup')return false;return followupPayload(row).some(item=>{const answer=text(item?.answer);return text(item?.product)===stage&&answer&&!low(answer).startsWith('skipped for now');});}

export function selectProviderEvidence(rows=[],stage,limit=MAX_PROVIDER_EVIDENCE_ITEMS){
  const max=Math.max(1,Math.min(MAX_PROVIDER_EVIDENCE_ITEMS,Number(limit)||MAX_PROVIDER_EVIDENCE_ITEMS));
  const source=Array.isArray(rows)?rows.filter(row=>text(row?.evidence_id)):[],selected=[];
  const add=row=>{const id=text(row?.evidence_id);if(id&&!selected.includes(id)&&selected.length<max)selected.push(id);};
  add(source.find(row=>hasCurrentStageAnswer(row,stage)));
  for(const row of source){if(text(row?.evidence_type)!=='customer_followup')add(row);if(selected.length>=max)break;}
  for(const row of source){add(row);if(selected.length>=max)break;}
  return selected;
}

function cors(request){const origin=text(request.headers.get('Origin'))||'*';return new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':`Content-Type, Cache-Control, Idempotency-Key, X-Correlation-Id, X-Galvi-Day1-Actor, ${CUSTOMER_HEADER}`,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin, Access-Control-Request-Headers','X-Galvi-Day5-Critical-Path':DAY5_CRITICAL_PATH_RUNTIME});}
function json(request,body,status=200){return new Response(JSON.stringify(body),{status,headers:cors(request)});}
async function requestBody(request){try{const value=await request.clone().json();return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return{}}}
async function legacyIdentity(db,sessionId){return first(db,`SELECT f.founder_id,f.email,v.venture_name FROM ventures v JOIN founders f ON f.founder_id=v.founder_id WHERE v.session_id=? ORDER BY v.updated_at DESC,v.created_at DESC LIMIT 1`,sessionId)||first(db,`SELECT f.founder_id,f.email,'' AS venture_name FROM founders f WHERE f.session_id=? ORDER BY f.updated_at DESC LIMIT 1`,sessionId);}
async function customerCanonicalContext(db,sessionId,requestedContextId=''){
  if(!sessionId)return null;const legacy=await legacyIdentity(db,sessionId);if(!legacy?.email)return null;
  const founder=await first(db,'SELECT founder_id FROM gv1_founders WHERE lower(email)=lower(?) LIMIT 1',legacy.email);if(!founder?.founder_id)return null;
  const contextId=text(requestedContextId);
  if(contextId){const scoped=await first(db,`SELECT context_id,bmr_id,venture_id,founder_id FROM gv1_principal_contexts WHERE context_id=? AND founder_id=? AND status='active' LIMIT 1`,contextId,founder.founder_id);return scoped?.bmr_id?scoped:null;}
  const ventureName=text(legacy.venture_name);
  if(ventureName)return first(db,`SELECT c.context_id,c.bmr_id,c.venture_id,c.founder_id FROM gv1_principal_contexts c JOIN gv1_ventures v ON v.venture_id=c.venture_id WHERE c.founder_id=? AND c.status='active' AND lower(trim(v.venture_name))=lower(trim(?)) ORDER BY c.updated_at DESC,c.created_at DESC LIMIT 1`,founder.founder_id,ventureName);
  return first(db,`SELECT context_id,bmr_id,venture_id,founder_id FROM gv1_principal_contexts WHERE founder_id=? AND status='active' ORDER BY updated_at DESC,created_at DESC LIMIT 1`,founder.founder_id);
}

function acuityInputsFromClassification(value){
  const state=low(value);
  if(state.includes('critical'))return{severity:3,urgency:3,continuity:3,reversibility:2,complexity:2};
  if(state.includes('strained')||state.includes('at risk'))return{severity:2,urgency:2,continuity:2,reversibility:2,complexity:2};
  if(state.includes('stable'))return{severity:1,urgency:1,continuity:1,reversibility:1,complexity:1};
  return{severity:0,urgency:0,continuity:0,reversibility:0,complexity:0};
}
function expectedAcuity(classificationValue){
  const inputs=acuityInputsFromClassification(classificationValue);
  const weighted=inputs.severity*.30+inputs.urgency*.25+inputs.continuity*.20+inputs.reversibility*.15+inputs.complexity*.10;
  const score=Math.round((weighted/4)*100);
  const band=score>=75?'red':score>=50?'orange':score>=25?'yellow':'green';
  return{inputs,score,band};
}
function normalizedDimensions(payload={}){
  const raw=payload?.category_scores||payload?.dimension_scores||{};
  const dimensions={
    revenue:Number(raw.revenue),customer:Number(raw.customer),product:Number(raw.product),leadership:Number(raw.leadership),
    technology:Number(raw.technology??raw.technology_operations),distribution:Number(raw.distribution),problem:Number(raw.problem),business_model:Number(raw.business_model)
  };
  return Object.fromEntries(Object.entries(dimensions).filter(([,value])=>Number.isFinite(value)));
}
function dimensionMismatch(current={},expected={}){
  const keys=Object.keys(expected);if(!keys.length)return false;
  return keys.some(key=>!Number.isFinite(Number(current?.[key]))||Math.abs(Number(current[key])-Number(expected[key]))>.5);
}
async function internalDay2(env,path,{method='GET',key,body}={}){
  const headers=new Headers({'X-Galvi-Day1-Actor':'business_physician','X-Correlation-Id':`day5-converge-${crypto.randomUUID()}`});
  if(key)headers.set('Idempotency-Key',key);if(body!==undefined)headers.set('Content-Type','application/json');
  const request=new Request(`https://galvicare.internal${path}`,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
  const response=await day2.fetch(request,env);let payload={};try{payload=await response.json()}catch{}
  if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`Canonical Day 2 convergence failed (${response.status}).`);error.code=payload?.error?.code||'GV_DAY5_DAY2_CONVERGENCE_FAILED';error.status=response.status;throw error;}
  return payload;
}
async function convergeBootstrapBaseline(request,env,input,bootstrap){
  if(!env?.DB||bootstrap?.success!==true||!bootstrap?.data?.context_id)return null;
  const sessionId=text(request.headers.get(CUSTOMER_HEADER)||input?.legacy_session_id);if(!sessionId)return null;
  const legacyRow=await first(env.DB,`SELECT result_json FROM product_results WHERE session_id=? AND product='GalviScore' ORDER BY created_at DESC LIMIT 1`,sessionId);
  const legacy=parseJson(legacyRow?.result_json,{});
  const expectedOverall=Number(bootstrap?.data?.canonical_score??legacy?.galviscore_score??legacy?.score);
  const confidenceValue=Number(bootstrap?.data?.clinical_confidence??legacy?.galviscore_confidence??legacy?.clinical_confidence);
  const clinicalConfidence=Number.isFinite(confidenceValue)?Math.max(0,Math.min(100,confidenceValue)):0;
  const classificationValue=text(input?.classification||legacy?.galviscore_classification||legacy?.classification||classification(expectedOverall));
  const acuity=expectedAcuity(classificationValue);
  const dimensions=normalizedDimensions(legacy);
  let state=await internalDay2(env,`/api/v1/day2/intake-state/${encodeURIComponent(bootstrap.data.context_id)}`);
  const triage=state?.data?.triage||{},vitals=state?.data?.vitals||{},score=state?.data?.score||{};
  const acuityMismatch=Number(triage?.acuity_score)!==acuity.score||low(triage?.acuity_band)!==acuity.band;
  const vitalsMismatch=dimensionMismatch(vitals?.dimension_scores,dimensions)||!Number.isFinite(Number(vitals?.clinical_confidence))||Math.abs(Number(vitals.clinical_confidence)-clinicalConfidence)>.5;
  const scoreMismatch=!Number.isFinite(Number(score?.overall_score))||!Number.isFinite(expectedOverall)||Math.abs(Number(score.overall_score)-expectedOverall)>1||!Number.isFinite(Number(score?.clinical_confidence))||Math.abs(Number(score.clinical_confidence)-clinicalConfidence)>.5;
  if(!acuityMismatch&&!vitalsMismatch&&!scoreMismatch)return{corrected:false,state:state.data};

  const dimKey=Object.values(dimensions).map(value=>Math.round(value)).join('-')||'nodims';
  const keyBase=`${safe(sessionId)}.${acuity.score}.${Math.round(clinicalConfidence)}.${dimKey}`.slice(0,110);
  const confidence={required_data_completeness:clinicalConfidence,evidence_quality:clinicalConfidence,answer_consistency:clinicalConfidence,corroboration:clinicalConfidence,context_completeness:clinicalConfidence};
  if(acuityMismatch){
    await internalDay2(env,'/api/v1/day2/triage',{method:'POST',key:`d5acuity.v1.${keyBase}`,body:{context_id:bootstrap.data.context_id,acuity:acuity.inputs,confidence,red_flags:Array.isArray(triage?.red_flags)?triage.red_flags:[],followup_round:0,answers:{source:'galvicare_day5_canonical_convergence_v1',legacy_session_id:sessionId,classification:classificationValue}}});
  }
  if(vitalsMismatch&&Object.keys(dimensions).length){
    await internalDay2(env,'/api/v1/day2/vitals',{method:'POST',key:`d5vitals.v1.${keyBase}`,body:{context_id:bootstrap.data.context_id,dimensions,confidence}});
  }
  if(acuityMismatch||vitalsMismatch||scoreMismatch){
    await internalDay2(env,'/api/v1/day2/score',{method:'POST',key:`d5score.v1.${keyBase}`,body:{context_id:bootstrap.data.context_id}});
  }
  state=await internalDay2(env,`/api/v1/day2/intake-state/${encodeURIComponent(bootstrap.data.context_id)}`);
  const verified=state?.data?.score||{};
  if(Number(verified?.acuity_score)!==acuity.score||low(verified?.acuity_band)!==acuity.band||!Number.isFinite(Number(verified?.overall_score))||Math.abs(Number(verified.overall_score)-expectedOverall)>1){
    const error=new Error('Canonical GalviScore/Acuity did not converge to the authoritative customer record.');error.code='GV_DAY5_CANONICAL_SCORE_ACUITY_MISMATCH';error.status=409;throw error;
  }
  return{corrected:true,state:state.data,classification:classificationValue};
}

async function boundedDay3Request(request,env,path){
  if(request.method!=='POST'||!env?.DB)return request;const stage=STAGE_BY_PATH[path];if(!stage)return request;const input=await requestBody(request);
  if(Array.isArray(input?.evidence_ids)&&input.evidence_ids.map(text).filter(Boolean).length)return request;
  const sessionId=text(request.headers.get(CUSTOMER_HEADER));if(!sessionId)return request;
  const context=await customerCanonicalContext(env.DB,sessionId,input?.context_id);if(!context?.bmr_id)return request;
  const rows=await env.DB.prepare(`SELECT evidence_id,evidence_type,content_json,created_at FROM gv1_evidence_items WHERE bmr_id=? ORDER BY created_at DESC,evidence_id DESC LIMIT 32`).bind(context.bmr_id).all();
  const ids=selectProviderEvidence(rows?.results||[],stage);if(!ids.length)return request;
  const headers=new Headers(request.headers);headers.set('Content-Type','application/json');return new Request(request.url,{method:'POST',headers,body:JSON.stringify({...input,evidence_ids:ids})});
}
async function scoreMetadata(request,env){
  if(!env?.DB)return json(request,{success:false,status:'unavailable',error:{code:'GV_DB_UNAVAILABLE',message:'QA record store is unavailable.'}},503);
  const sessionId=text(request.headers.get(CUSTOMER_HEADER));if(!sessionId)return json(request,{success:false,status:'unauthenticated',error:{code:'GV_AUTH_REQUIRED',message:'An authenticated GalviCare session is required.'}},401);
  const context=await customerCanonicalContext(env.DB,sessionId);if(!context?.context_id)return json(request,{success:false,status:'not_found',error:{code:'GV_DAY5_CANONICAL_CONTEXT_MISSING',message:'Canonical GalviCare context is unavailable.'}},404);
  const canonical=await first(env.DB,`SELECT result_id,payload_json,record_version,created_at FROM gv1_day2_intake_results WHERE context_id=? AND result_type='score' ORDER BY record_version DESC,created_at DESC LIMIT 1`,context.context_id);
  const legacy=await first(env.DB,`SELECT result_json FROM product_results WHERE session_id=? AND product='GalviScore' ORDER BY created_at DESC LIMIT 1`,sessionId);
  const cp=parseJson(canonical?.payload_json,{}),lp=parseJson(legacy?.result_json,{}),legacyOverall=Number(lp?.galviscore_score??lp?.score),overall=Number(Number.isFinite(legacyOverall)?legacyOverall:cp?.overall_score),dimensions=lp?.category_scores||lp?.dimension_scores||cp?.dimension_scores||{};
  const canonicalOverall=Number(cp?.overall_score),sourceMatches=!Number.isFinite(legacyOverall)||!Number.isFinite(canonicalOverall)||Math.abs(legacyOverall-canonicalOverall)<=1;
  return json(request,{success:true,status:'ok',environment:text(env?.ENVIRONMENT)||'qa',data:{overall_score:Number.isFinite(overall)?overall:null,classification:text(lp?.galviscore_classification||lp?.classification)||classification(overall),lowest_category:text(lp?.galviscore_lowest_category||lp?.lowest_category)||lowestCategory(dimensions),acuity_score:cp?.acuity_score??null,acuity_band:text(cp?.acuity_band)||null,clinical_confidence:lp?.galviscore_confidence??lp?.clinical_confidence??cp?.clinical_confidence??null,score_result_id:canonical?.result_id||null,score_record_version:Number(canonical?.record_version||0),canonical_source:'gv1_day2_intake_results',source_converged:sourceMatches},meta:{read_only:true,score_recomputed_in_browser:false,acuity_recomputed_in_browser:false,provider_evidence_window_max:MAX_PROVIDER_EVIDENCE_ITEMS}});
}

export default{async fetch(request,env,ctx){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
  if(path==='/api/v1/day5/customer/score-metadata'){
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(request)});
    if(request.method==='POST')return scoreMetadata(request,env);
    return json(request,{success:false,status:'not_found',error:{code:'GV_NOT_FOUND',message:'Route not found.'}},404);
  }
  if(path==='/api/v1/day3/customer-bootstrap'&&request.method==='POST'){
    const input=await requestBody(request),response=await day5Worker.fetch(request,env,ctx);let payload={};try{payload=await response.clone().json()}catch{}
    if(response.ok&&payload?.success===true){
      try{const convergence=await convergeBootstrapBaseline(request,env,input,payload);if(convergence?.corrected){payload.data={...(payload.data||{}),acuity_score:convergence.state?.score?.acuity_score??null,acuity_band:convergence.state?.score?.acuity_band??null,canonical_score:convergence.state?.score?.overall_score??payload.data?.canonical_score,clinical_confidence:convergence.state?.score?.clinical_confidence??payload.data?.clinical_confidence};const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('X-Galvi-Day5-Canonical-Convergence','corrected');headers.set('X-Galvi-Day5-Critical-Path',DAY5_CRITICAL_PATH_RUNTIME);return new Response(JSON.stringify(payload),{status:response.status,statusText:response.statusText,headers});}}
      catch(error){return json(request,{success:false,status:'conflict',error:{code:error?.code||'GV_DAY5_CANONICAL_CONVERGENCE_FAILED',message:error?.message||'Canonical GalviScore/Acuity convergence failed.'}},Number(error?.status)||409);}
    }
    return response;
  }
  if(STAGE_BY_PATH[path]&&request.method==='POST'){
    const forwarded=await boundedDay3Request(request,env,path),response=await day5Worker.fetch(forwarded,env,ctx),headers=new Headers(response.headers);headers.set('X-Galvi-Day5-Critical-Path',DAY5_CRITICAL_PATH_RUNTIME);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
  const response=await day5Worker.fetch(request,env,ctx);if(path==='/health'||path==='/api/v1/day5/readiness'){const headers=new Headers(response.headers);headers.set('X-Galvi-Day5-Critical-Path',DAY5_CRITICAL_PATH_RUNTIME);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}return response;
}};
