import day5Worker from './day5-entry.js';

/*
 * Cumulative Day 5 critical-path adapter.
 *
 * This remains above the complete Day 5 Worker so Day 1-5 routes, Chart, Clinic,
 * treatment, referral, monitoring and rollback behavior stay owned by the same
 * cumulative runtime. It fixes only two proven Human-E2E defects:
 *
 * 1. Governed Shot/Sight/Path requests can accumulate many versioned customer
 *    follow-up evidence rows. Canonical evidence remains intact in GalviVault,
 *    but the provider projection is bounded to a current-stage evidence window
 *    before the inherited Day 3 schema/authorization/provider pipeline executes.
 * 2. The browser needs a read-only server projection of Classification, Lowest
 *    Category and canonical Acuity after the Score clarification. No browser
 *    scoring or acuity recomputation is introduced.
 */

export const DAY5_CRITICAL_PATH_RUNTIME='day5_governed_ai_evidence_window_v1';
export const MAX_PROVIDER_EVIDENCE_ITEMS=3;
const CUSTOMER_HEADER='X-Galvi-Day3-Session';
const STAGE_BY_PATH=Object.freeze({
  '/api/v1/day3/shot':'GalviShot',
  '/api/v1/day3/sight':'GalviSight',
  '/api/v1/day3/path':'GalviPath'
});

const text=value=>String(value??'').trim();
const low=value=>text(value).toLowerCase();
const first=(db,sql,...params)=>db.prepare(sql).bind(...params).first();

function classification(score){
  const value=Number(score);
  if(!Number.isFinite(value))return null;
  if(value<40)return'Critical';
  if(value<60)return'Strained';
  if(value<80)return'Stable but Watch';
  if(value<90)return'Healthy';
  return'Healthy/Scaling';
}

function lowestCategory(scores={}){
  const ranked=Object.entries(scores||{})
    .map(([key,value])=>[text(key),Number(value)])
    .filter(([key,value])=>key&&Number.isFinite(value))
    .sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0]));
  return ranked[0]?.[0]||null;
}

function parseJson(value,fallback={}){
  if(value&&typeof value==='object')return value;
  try{return JSON.parse(value||'{}')}catch{return fallback}
}

function followupPayload(row){
  const content=parseJson(row?.content_json,{});
  return Array.isArray(content?.payload?.followups)?content.payload.followups
    :Array.isArray(content?.followups)?content.followups:[];
}

function hasCurrentStageAnswer(row,stage){
  if(text(row?.evidence_type)!=='customer_followup')return false;
  return followupPayload(row).some(item=>{
    const answer=text(item?.answer);
    return text(item?.product)===stage&&answer&&!low(answer).startsWith('skipped for now');
  });
}

export function selectProviderEvidence(rows=[],stage,limit=MAX_PROVIDER_EVIDENCE_ITEMS){
  const max=Math.max(1,Math.min(MAX_PROVIDER_EVIDENCE_ITEMS,Number(limit)||MAX_PROVIDER_EVIDENCE_ITEMS));
  const source=Array.isArray(rows)?rows.filter(row=>text(row?.evidence_id)):[];
  const selected=[];
  const add=row=>{
    const id=text(row?.evidence_id);
    if(id&&!selected.includes(id)&&selected.length<max)selected.push(id);
  };

  // Customer follow-up evidence is cumulative/versioned. The newest row containing
  // the current-stage answer therefore carries that answer plus prior answers without
  // sending every historical version to the provider.
  add(source.find(row=>hasCurrentStageAnswer(row,stage)));

  // Add independent accepted record evidence before any older cumulative copy.
  for(const row of source){
    if(text(row?.evidence_type)!=='customer_followup')add(row);
    if(selected.length>=max)break;
  }
  for(const row of source){
    add(row);
    if(selected.length>=max)break;
  }
  return selected;
}

function cors(request){
  const origin=text(request.headers.get('Origin'))||'*';
  return new Headers({
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
    'Access-Control-Allow-Origin':origin,
    'Access-Control-Allow-Headers':`Content-Type, Cache-Control, Idempotency-Key, X-Correlation-Id, X-Galvi-Day1-Actor, ${CUSTOMER_HEADER}`,
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
    'Vary':'Origin, Access-Control-Request-Headers',
    'X-Galvi-Day5-Critical-Path':DAY5_CRITICAL_PATH_RUNTIME
  });
}

function json(request,body,status=200){return new Response(JSON.stringify(body),{status,headers:cors(request)});}

async function requestBody(request){
  try{const value=await request.clone().json();return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return{}}
}

async function legacyIdentity(db,sessionId){
  return first(db,`SELECT f.founder_id,f.email,v.venture_name
    FROM ventures v JOIN founders f ON f.founder_id=v.founder_id
    WHERE v.session_id=? ORDER BY v.updated_at DESC,v.created_at DESC LIMIT 1`,sessionId)
    ||first(db,`SELECT f.founder_id,f.email,'' AS venture_name
      FROM founders f WHERE f.session_id=? ORDER BY f.updated_at DESC LIMIT 1`,sessionId);
}

async function customerCanonicalContext(db,sessionId,requestedContextId=''){
  if(!sessionId)return null;
  const legacy=await legacyIdentity(db,sessionId);
  if(!legacy?.email)return null;
  const founder=await first(db,'SELECT founder_id FROM gv1_founders WHERE lower(email)=lower(?) LIMIT 1',legacy.email);
  if(!founder?.founder_id)return null;
  const contextId=text(requestedContextId);
  if(contextId){
    const scoped=await first(db,`SELECT context_id,bmr_id,venture_id,founder_id
      FROM gv1_principal_contexts WHERE context_id=? AND founder_id=? AND status='active' LIMIT 1`,contextId,founder.founder_id);
    return scoped?.bmr_id?scoped:null;
  }
  const ventureName=text(legacy.venture_name);
  if(ventureName){
    return first(db,`SELECT c.context_id,c.bmr_id,c.venture_id,c.founder_id
      FROM gv1_principal_contexts c JOIN gv1_ventures v ON v.venture_id=c.venture_id
      WHERE c.founder_id=? AND c.status='active' AND lower(trim(v.venture_name))=lower(trim(?))
      ORDER BY c.updated_at DESC,c.created_at DESC LIMIT 1`,founder.founder_id,ventureName);
  }
  return first(db,`SELECT context_id,bmr_id,venture_id,founder_id FROM gv1_principal_contexts
    WHERE founder_id=? AND status='active' ORDER BY updated_at DESC,created_at DESC LIMIT 1`,founder.founder_id);
}

async function boundedDay3Request(request,env,path){
  if(request.method!=='POST'||!env?.DB)return request;
  const stage=STAGE_BY_PATH[path];if(!stage)return request;
  const input=await requestBody(request);
  if(Array.isArray(input?.evidence_ids)&&input.evidence_ids.map(text).filter(Boolean).length)return request;
  const sessionId=text(request.headers.get(CUSTOMER_HEADER));
  if(!sessionId)return request; // physician/direct contract remains unchanged
  const context=await customerCanonicalContext(env.DB,sessionId,input?.context_id);
  if(!context?.bmr_id)return request; // inherited authorization will fail closed
  const rows=await env.DB.prepare(`SELECT evidence_id,evidence_type,content_json,created_at
    FROM gv1_evidence_items WHERE bmr_id=?
    ORDER BY created_at DESC,evidence_id DESC LIMIT 32`).bind(context.bmr_id).all();
  const ids=selectProviderEvidence(rows?.results||[],stage);
  if(!ids.length)return request;
  const headers=new Headers(request.headers);headers.set('Content-Type','application/json');
  return new Request(request.url,{method:'POST',headers,body:JSON.stringify({...input,evidence_ids:ids})});
}

async function scoreMetadata(request,env){
  if(!env?.DB)return json(request,{success:false,status:'unavailable',error:{code:'GV_DB_UNAVAILABLE',message:'QA record store is unavailable.'}},503);
  const sessionId=text(request.headers.get(CUSTOMER_HEADER));
  if(!sessionId)return json(request,{success:false,status:'unauthenticated',error:{code:'GV_AUTH_REQUIRED',message:'An authenticated GalviCare session is required.'}},401);
  const context=await customerCanonicalContext(env.DB,sessionId);
  if(!context?.context_id)return json(request,{success:false,status:'not_found',error:{code:'GV_DAY5_CANONICAL_CONTEXT_MISSING',message:'Canonical GalviCare context is unavailable.'}},404);
  const canonical=await first(env.DB,`SELECT result_id,payload_json,record_version,created_at
    FROM gv1_day2_intake_results WHERE context_id=? AND result_type='score'
    ORDER BY record_version DESC,created_at DESC LIMIT 1`,context.context_id);
  const legacy=await first(env.DB,`SELECT result_json FROM product_results
    WHERE session_id=? AND product='GalviScore' LIMIT 1`,sessionId);
  const cp=parseJson(canonical?.payload_json,{}),lp=parseJson(legacy?.result_json,{});
  const overall=Number(cp?.overall_score??lp?.galviscore_score??lp?.score);
  const dimensions=cp?.dimension_scores||lp?.category_scores||lp?.dimension_scores||{};
  return json(request,{
    success:true,status:'ok',environment:text(env?.ENVIRONMENT)||'qa',
    data:{
      overall_score:Number.isFinite(overall)?overall:null,
      classification:text(lp?.galviscore_classification||lp?.classification)||classification(overall),
      lowest_category:text(lp?.galviscore_lowest_category||lp?.lowest_category)||lowestCategory(dimensions),
      acuity_score:cp?.acuity_score??null,
      acuity_band:text(cp?.acuity_band)||null,
      clinical_confidence:cp?.clinical_confidence??lp?.galviscore_confidence??lp?.clinical_confidence??null,
      score_result_id:canonical?.result_id||null,
      score_record_version:Number(canonical?.record_version||0),
      canonical_source:'gv1_day2_intake_results'
    },
    meta:{read_only:true,score_recomputed_in_browser:false,acuity_recomputed_in_browser:false,provider_evidence_window_max:MAX_PROVIDER_EVIDENCE_ITEMS}
  });
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
    if(path==='/api/v1/day5/customer/score-metadata'){
      if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(request)});
      if(request.method==='POST')return scoreMetadata(request,env);
      return json(request,{success:false,status:'not_found',error:{code:'GV_NOT_FOUND',message:'Route not found.'}},404);
    }
    if(STAGE_BY_PATH[path]&&request.method==='POST'){
      const forwarded=await boundedDay3Request(request,env,path);
      const response=await day5Worker.fetch(forwarded,env,ctx);
      const headers=new Headers(response.headers);headers.set('X-Galvi-Day5-Critical-Path',DAY5_CRITICAL_PATH_RUNTIME);
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }
    const response=await day5Worker.fetch(request,env,ctx);
    if(path==='/health'||path==='/api/v1/day5/readiness'){
      const headers=new Headers(response.headers);headers.set('X-Galvi-Day5-Critical-Path',DAY5_CRITICAL_PATH_RUNTIME);
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
    }
    return response;
  }
};
