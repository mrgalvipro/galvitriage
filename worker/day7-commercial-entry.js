import day7CustomerWorker from './day7-customer-entry.js';
import { GVError, context, failure, headers, idempotencyKey, jsonBody, requireRuntime, success } from './day5-common.js';
import {
  CARE_CATALOG, setupPreFounderAccount, loginPreFounder, createPreFounderTreatmentOrder,
  ingestSystemeEvent, preFounderCommercialState, confirmTreatmentCompletion,
  requireTreatmentCompletionBeforeMonitoring
} from './domain/day7-commercial-care-service.js';

export const DAY7_COMMERCIAL_RUNTIME='galvicare_1_0_day7_commercial_return_v1';
const SETUP='/api/v1/day7/prefounder/account/setup';
const LOGIN='/api/v1/day7/prefounder/login';
const ORDER='/api/v1/day7/prefounder/treatment-order';
const STATE='/api/v1/day7/prefounder/commercial-state';
const CONFIRM='/api/v1/day7/prefounder/treatment-completion-confirmation';
const CATALOG='/api/v1/day7/commercial/catalog';
const CARE='/api/v1/day7/prefounder/care-events';
const SYSTEME=/^\/api\/v1\/integrations\/systeme\/([^/]+)\/(sale|course-completed|sale-canceled)$/;

function wrap(response){const h=new Headers(response.headers);h.set('X-Galvi-Day7-Commercial',DAY7_COMMERCIAL_RUNTIME);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
async function enrichProjection(request,env,executionContext,path){
  if(request.method!=='GET'||path!=='/api/v1/day7/prefounder/projection')return null;
  const downstream=await day7CustomerWorker.fetch(request,env,executionContext);if(!downstream.ok)return downstream;
  const body=await downstream.clone().json().catch(()=>null);if(!body?.success)return downstream;
  const contextId=new URL(request.url).searchParams.get('context_id');const commercial=await preFounderCommercialState(env,request,contextId);
  const data={...body.data,commercial,founder_snapshot:commercial.founder_snapshot||null};
  if(body.data?.events?.some(e=>e.event_type==='customer_acknowledged')&&commercial?.next_action)data.next_step=`commercial:${commercial.next_action}`;
  return new Response(JSON.stringify({...body,data}),{status:downstream.status,headers:downstream.headers});
}

export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/',ctx=context(request,env),systeme=path.match(SYSTEME);
  try{
    requireRuntime(env,ctx);
    if(request.method==='OPTIONS'&&(path.startsWith('/api/v1/day7/')||path.startsWith('/api/v1/integrations/systeme/')))return new Response(null,{status:204,headers:headers(ctx)});
    if(systeme&&request.method==='POST'){
      const kind=systeme[2]==='sale'?'new_sale':systeme[2]==='course-completed'?'course_completed':'sale_canceled';
      const completionKey=kind==='course_completed'?String(url.searchParams.get('completion_key')||'').trim():'';
      if(kind==='course_completed'&&!completionKey)throw new GVError('GV_SYSTEME_COMPLETION_KEY_REQUIRED','Course completion webhook requires completion_key.',422);
      const data=await ingestSystemeEvent(env,ctx,request,decodeURIComponent(systeme[1]),kind,completionKey);
      return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,provider:'systeme'}));
    }
    if(path===CATALOG&&request.method==='GET')return wrap(success(ctx,{catalog:CARE_CATALOG,commercial_schema:'D7A2',read_only:true}));
    if(path===SETUP&&request.method==='POST')return wrap(success(ctx,await setupPreFounderAccount(env,ctx,request,await jsonBody(request)),201,'created',{manual_repair:'NO'}));
    if(path===LOGIN&&request.method==='POST')return wrap(success(ctx,await loginPreFounder(env,ctx,await jsonBody(request)),200,'ok',{customer_access:'principal_only_return'}));
    if(path===ORDER&&request.method==='POST'){const data=await createPreFounderTreatmentOrder(env,ctx,request,idempotencyKey(request),await jsonBody(request));return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{commercial_event:'treatment_checkout_started',idempotent_replay:data.idempotent_replay}));}
    if(path===STATE&&request.method==='GET'){const id=url.searchParams.get('context_id');return wrap(success(ctx,await preFounderCommercialState(env,request,id),200,'ok',{commercial_loop:'provider_verified_v1'}));}
    if(path===CONFIRM&&request.method==='POST'){const data=await confirmTreatmentCompletion(env,ctx,request,idempotencyKey(request),await jsonBody(request));return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{commercial_event:'customer_treatment_completion_confirmed',business_physician_queue:'pending'}));}
    if(path===CARE&&request.method==='POST'){const input=await request.clone().json().catch(()=>({}));await requireTreatmentCompletionBeforeMonitoring(env,request,input);}
    const enriched=await enrichProjection(request,env,executionContext,path);if(enriched)return wrap(enriched);
    return wrap(await day7CustomerWorker.fetch(request,env,executionContext));
  }catch(error){return wrap(failure(ctx,error));}
}};
