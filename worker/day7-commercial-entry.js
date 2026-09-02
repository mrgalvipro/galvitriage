import day7CustomerWorker from './day7-customer-entry.js';
import { GVError, context, failure, headers, idempotencyKey, jsonBody, requireRuntime, success } from './day5-common.js';
import {
  CARE_CATALOG, setupPreFounderAccount, loginPreFounder,
  ingestSystemeEvent, preFounderCommercialState, confirmTreatmentCompletion,
  requireTreatmentCompletionBeforeMonitoring
} from './domain/day7-commercial-care-service.js';
import {
  COMMERCIAL_SCHEMA_D7A3, createStripeTreatmentOrder, ingestStripeTreatmentWebhook,
  retrySystemeEnrollment, commercialStateD7A3
} from './domain/day7-stripe-systeme-service.js';

export const DAY7_COMMERCIAL_RUNTIME='galvicare_1_0_day7_stripe_systeme_return_v2';
const SETUP='/api/v1/day7/prefounder/account/setup';
const LOGIN='/api/v1/day7/prefounder/login';
const ORDER='/api/v1/day7/prefounder/treatment-order';
const STATE='/api/v1/day7/prefounder/commercial-state';
const CONFIRM='/api/v1/day7/prefounder/treatment-completion-confirmation';
const RETRY_ENROLL='/api/v1/day7/prefounder/systeme-enrollment/retry';
const CATALOG='/api/v1/day7/commercial/catalog';
const CARE='/api/v1/day7/prefounder/care-events';
const STRIPE_TREATMENT='/api/v1/integrations/stripe/treatment';
const SYSTEME=/^\/api\/v1\/integrations\/systeme\/([^/]+)\/(course-completed)$/;

function wrap(response){const h=new Headers(response.headers);h.set('X-Galvi-Day7-Commercial',DAY7_COMMERCIAL_RUNTIME);h.set('X-Galvi-Day7-Commercial-Schema',COMMERCIAL_SCHEMA_D7A3);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
async function state(request,env,contextId){
  try{return await commercialStateD7A3(env,request,contextId)}catch(error){
    // Migration-safe compatibility before D7A3 is applied to a runtime. Do not convert a
    // D7A3 database or authorization error into legacy state.
    if(!/no such column|no such table/i.test(String(error?.message||error)))throw error;
    return preFounderCommercialState(env,request,contextId);
  }
}
async function enrichProjection(request,env,executionContext,path){
  if(request.method!=='GET'||path!=='/api/v1/day7/prefounder/projection')return null;
  const downstream=await day7CustomerWorker.fetch(request,env,executionContext);if(!downstream.ok)return downstream;
  const body=await downstream.clone().json().catch(()=>null);if(!body?.success)return downstream;
  const contextId=new URL(request.url).searchParams.get('context_id');const commercial=await state(request,env,contextId);
  const founder_snapshot=body.data?.founder_snapshot||null;
  const data={...body.data,commercial,founder_snapshot};
  if(body.data?.events?.some(e=>e.event_type==='customer_acknowledged')&&commercial?.next_action)data.next_step=`commercial:${commercial.next_action}`;
  return new Response(JSON.stringify({...body,data}),{status:downstream.status,headers:downstream.headers});
}

export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/',ctx=context(request,env),systeme=path.match(SYSTEME);
  try{
    requireRuntime(env,ctx);
    if(request.method==='OPTIONS'&&(path.startsWith('/api/v1/day7/')||path.startsWith('/api/v1/integrations/systeme/')||path===STRIPE_TREATMENT))return new Response(null,{status:204,headers:headers(ctx)});
    if(path===STRIPE_TREATMENT&&request.method==='POST'){
      const data=await ingestStripeTreatmentWebhook(env,ctx,request);
      return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:!!data.idempotent_replay,payment_authority:'stripe',fulfillment_authority:'systeme'}));
    }
    if(systeme&&request.method==='POST'){
      const completionKey=String(url.searchParams.get('completion_key')||'').trim();
      if(!completionKey)throw new GVError('GV_SYSTEME_COMPLETION_KEY_REQUIRED','Course completion webhook requires completion_key.',422);
      // Systeme.io is treatment-delivery authority only. There is deliberately no Systeme sale
      // webhook route in D7A3; payment must already be server-verified by Stripe.
      const data=await ingestSystemeEvent(env,ctx,request,decodeURIComponent(systeme[1]),'course_completed',completionKey);
      return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,fulfillment_provider:'systeme',payment_authority:'stripe'}));
    }
    if(path===CATALOG&&request.method==='GET')return wrap(success(ctx,{catalog:CARE_CATALOG,commercial_schema:'D7A3',payment_authority:'stripe',fulfillment_authority:'systeme',read_only:true}));
    if(path===SETUP&&request.method==='POST')return wrap(success(ctx,await setupPreFounderAccount(env,ctx,request,await jsonBody(request)),201,'created',{manual_repair:'NO'}));
    if(path===LOGIN&&request.method==='POST')return wrap(success(ctx,await loginPreFounder(env,ctx,await jsonBody(request)),200,'ok',{customer_access:'principal_only_return'}));
    if(path===ORDER&&request.method==='POST'){const data=await createStripeTreatmentOrder(env,ctx,request,idempotencyKey(request),await jsonBody(request));return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{commercial_event:'stripe_treatment_checkout_started',payment_authority:'stripe',idempotent_replay:data.idempotent_replay}));}
    if(path===STATE&&request.method==='GET'){const id=url.searchParams.get('context_id');return wrap(success(ctx,await state(request,env,id),200,'ok',{commercial_loop:'stripe_payment_systeme_completion_v2'}));}
    if(path===RETRY_ENROLL&&request.method==='POST')return wrap(success(ctx,await retrySystemeEnrollment(env,ctx,request,await jsonBody(request)),200,'ok',{fulfillment_authority:'systeme'}));
    if(path===CONFIRM&&request.method==='POST'){const data=await confirmTreatmentCompletion(env,ctx,request,idempotencyKey(request),await jsonBody(request));return wrap(success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{commercial_event:'customer_treatment_completion_confirmed',business_physician_queue:'pending'}));}
    if(path===CARE&&request.method==='POST'){const input=await request.clone().json().catch(()=>({}));await requireTreatmentCompletionBeforeMonitoring(env,request,input);}
    const enriched=await enrichProjection(request,env,executionContext,path);if(enriched)return wrap(enriched);
    return wrap(await day7CustomerWorker.fetch(request,env,executionContext));
  }catch(error){return wrap(failure(ctx,error));}
}};