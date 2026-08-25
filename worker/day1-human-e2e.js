import day1 from './day1-galvicare-1-0.js';

const text=value=>String(value??'').trim();
const id=prefix=>`${prefix}_${crypto.randomUUID().replaceAll('-','')}`;

function jsonResponse(body,response){
  return new Response(JSON.stringify(body),{status:response.status,statusText:response.statusText,headers:new Headers(response.headers)});
}
async function first(db,sql,...params){return db.prepare(sql).bind(...params).first();}

async function principalSession(env,body,data){
  const key=text(body?.client_session_key);
  const context=data?.context;
  if(!key||context?.record_mode!=='principal_only'||!context?.context_id||!context?.founder_id||!env?.DB)return null;
  let session=await first(env.DB,'SELECT session_id,context_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at FROM gv1_principal_sessions WHERE client_session_key=?',key);
  if(session){
    if(session.context_id!==context.context_id||session.founder_id!==context.founder_id)throw new Error('Principal session key is already bound to a different Day 1 context.');
    return session;
  }
  const now=new Date().toISOString();
  session={session_id:id('pfs'),context_id:context.context_id,founder_id:context.founder_id,client_session_key:key,source:'galvicare_1_0_customer_qa',current_stage:'GalviTriage',status:'active',started_at:now,completed_at:null,created_at:now,updated_at:now};
  await env.DB.prepare("INSERT INTO gv1_principal_sessions(session_id,context_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at) VALUES(?,?,?,?,?,'GalviTriage','active',?,NULL,?,?)")
    .bind(session.session_id,session.context_id,session.founder_id,session.client_session_key,session.source,now,now,now).run();
  return session;
}

async function augmentContextPost(request,env,ctx){
  let body={};
  try{body=await request.clone().json();}catch{}
  const response=await day1.fetch(request,env,ctx);
  if(!response.ok||!text(body?.client_session_key))return response;
  let payload={};
  try{payload=await response.clone().json();}catch{return response;}
  try{
    const session=await principalSession(env,body,payload?.data);
    if(!session)return response;
    payload.data={...(payload.data||{}),session};
    payload.meta={...(payload.meta||{}),principal_session_continuity:true};
    return jsonResponse(payload,response);
  }catch(error){
    console.error('Day 1 principal session continuity',error?.message||error);
    const headers=new Headers(response.headers);
    return new Response(JSON.stringify({success:false,status:'error',environment:text(env?.ENVIRONMENT)||'qa',correlation_id:headers.get('x-correlation-id')||null,error:{code:'GV_PRINCIPAL_SESSION_FAILED',message:'Pre-Founder context was not released because principal session continuity could not be established.'},meta:{schema_version:'0101',release_version:'galvicare_1_0_day1',ai_enabled:false}}),{status:500,headers});
  }
}

async function augmentContextGet(request,env,ctx){
  const response=await day1.fetch(request,env,ctx);
  if(!response.ok||!env?.DB)return response;
  let payload={};
  try{payload=await response.clone().json();}catch{return response;}
  const context=payload?.data?.context;
  if(context?.record_mode!=='principal_only'||!context?.context_id)return response;
  const session=await first(env.DB,'SELECT session_id,context_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at FROM gv1_principal_sessions WHERE context_id=? ORDER BY updated_at DESC LIMIT 1',context.context_id);
  payload.data={...(payload.data||{}),session:session||null};
  payload.meta={...(payload.meta||{}),principal_session_continuity:Boolean(session)};
  return jsonResponse(payload,response);
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
    if(request.method==='POST'&&path==='/api/v1/principal-contexts')return augmentContextPost(request,env,ctx);
    if(request.method==='GET'&&path.startsWith('/api/v1/principal-contexts/'))return augmentContextGet(request,env,ctx);
    return day1.fetch(request,env,ctx);
  }
};
