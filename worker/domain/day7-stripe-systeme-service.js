import { GVError, clean, hash, newId, now } from '../day5-common.js';
import { CARE_CATALOG, requirePreFounderSession } from './day7-commercial-care-service.js';

export const COMMERCIAL_SCHEMA_D7A3='D7A3';
const STRIPE_API='https://api.stripe.com/v1';
const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const parse=(v,f={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return f}};
const lower=v=>clean(v).toLowerCase();
const arr=v=>Array.isArray(v)?v.map(clean).filter(Boolean):[];
const utf8=v=>new TextEncoder().encode(v);
const bytesHex=bytes=>[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
const timingSafeHex=(a,b)=>{a=String(a||'').toLowerCase();b=String(b||'').toLowerCase();if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;};

const PRICE_ENV={
  founder_readiness_sprint:'STRIPE_FOUNDER_READINESS_PRICE_ID',
  spur_pathway:'STRIPE_SPUR_PREFOUNDER_PRICE_ID',
  founder_development_sprint:'STRIPE_TARGETED_FOUNDER_DEVELOPMENT_PRICE_ID',
  venture_readiness_sprint:'STRIPE_VENTURE_READINESS_PRICE_ID',
  product_readiness_sprint:'STRIPE_PRODUCT_READINESS_PRICE_ID',
  gtm_readiness_sprint:'STRIPE_GTM_READINESS_PRICE_ID',
  fundraising_readiness_sprint:'STRIPE_FUNDRAISING_READINESS_PRICE_ID',
  founder_foundation_plan:'STRIPE_FOUNDER_FOUNDATION_PRICE_ID',
  venture_builder_plan:'STRIPE_VENTURE_BUILDER_PRICE_ID',
  startup_launch_plan:'STRIPE_STARTUP_LAUNCH_PRICE_ID',
  venture_acceleration_plan:'STRIPE_VENTURE_ACCELERATION_PRICE_ID'
};
const COURSE_ENV={
  founder_readiness_sprint:'SYSTEME_FOUNDER_READINESS_COURSE_ID',
  spur_pathway:'SYSTEME_SPUR_PREFOUNDER_COURSE_ID',
  founder_development_sprint:'SYSTEME_TARGETED_FOUNDER_DEVELOPMENT_COURSE_ID',
  venture_readiness_sprint:'SYSTEME_VENTURE_READINESS_COURSE_ID',
  product_readiness_sprint:'SYSTEME_PRODUCT_READINESS_COURSE_ID',
  gtm_readiness_sprint:'SYSTEME_GTM_READINESS_COURSE_ID',
  fundraising_readiness_sprint:'SYSTEME_FUNDRAISING_READINESS_COURSE_ID'
};
function itemFor(code){const item=CARE_CATALOG[lower(code)];if(!item)throw new GVError('GV_TREATMENT_NOT_COMMERCIALLY_CONFIGURED','The prescribed treatment is not in the Day 7 commercial care catalog.',409,{service_code:code});return item;}
function physicianServiceCode(plan){return lower(parse(plan?.payload_json,{}).intervention_code||'');}
async function latestOrder(db,contextId){return first(db,'SELECT * FROM gv1_commercial_care_orders WHERE context_id=? ORDER BY created_at DESC LIMIT 1',contextId);}
function customerUrl(env){return clean(env.GALVICARE_CUSTOMER_URL)||'https://galvicare-0-5-qa.mrgalvipro.workers.dev/#galvitriage';}
function priceEnvFor(code){return PRICE_ENV[lower(code)]||'';}
function courseIdFor(env,code){const e=COURSE_ENV[lower(code)];return e?clean(env[e]):'';}
function form(params){const b=new URLSearchParams();for(const [k,v] of Object.entries(params))if(v!==undefined&&v!==null&&String(v)!=='')b.set(k,String(v));return b;}

async function stripeRequest(env,path,params){
  const secret=clean(env.STRIPE_SECRET_KEY);
  if(!secret)throw new GVError('GV_STRIPE_NOT_CONFIGURED','Stripe server configuration is unavailable.',503);
  if(lower(env.ENVIRONMENT)==='qa'&&!secret.startsWith('sk_test_'))throw new GVError('GV_STRIPE_ENVIRONMENT_MISMATCH','QA treatment checkout requires a Stripe TEST secret.',500);
  const r=await fetch(`${STRIPE_API}${path}`,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/x-www-form-urlencoded'},body:form(params)});
  const body=await r.json().catch(()=>({}));
  if(!r.ok)throw new GVError('GV_STRIPE_CHECKOUT_FAILED','Stripe could not create the prescribed-treatment checkout.',502,{stripe_status:r.status,stripe_type:clean(body?.error?.type)||null});
  return body;
}

function successUrl(env){const u=new URL(customerUrl(env));u.searchParams.set('prefounder_return','payment');u.searchParams.set('stripe_session_id','{CHECKOUT_SESSION_ID}');u.hash='galvitriage';return u.toString().replace('%7BCHECKOUT_SESSION_ID%7D','{CHECKOUT_SESSION_ID}');}
function cancelUrl(env){const u=new URL(customerUrl(env));u.searchParams.set('prefounder_return','payment_canceled');u.hash='galvitriage';return u.toString();}

export async function createStripeTreatmentOrder(env,ctx,request,key,input={}){
  const session=await requirePreFounderSession(request,env,clean(input.context_id));
  const physician=await first(env.DB,`SELECT event_id,payload_json FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='physician_plan' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  const ack=await first(env.DB,`SELECT event_id FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='customer_acknowledged' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  if(!physician||!ack)throw new GVError('GV_TREATMENT_PLAN_REQUIRED','Business Physician Treatment Plan and customer acknowledgement are required before enrollment.',409);
  const serviceCode=physicianServiceCode(physician),item=itemFor(serviceCode);
  const existing=await latestOrder(env.DB,session.context_id);
  if(existing&&!['canceled','refunded'].includes(existing.status))return{order:normalizeOrder(existing),checkout_url:existing.stripe_checkout_url||null,idempotent_replay:true};
  const account=await first(env.DB,"SELECT account_id FROM gv1_customer_accounts WHERE principal_id=? AND status='active' LIMIT 1",session.founder_id);
  if(!account)throw new GVError('GV_RETURN_ACCOUNT_REQUIRED','Create your GalviCare return password before leaving for the prescribed program.',409,{next_action:'setup_return_credentials'});
  const priceEnv=priceEnvFor(serviceCode),priceId=priceEnv?clean(env[priceEnv]):'';
  if(!priceId)throw new GVError('GV_STRIPE_TREATMENT_PRICE_NOT_CONFIGURED','The Stripe TEST price for this prescribed treatment is not configured.',503,{required_setting:priceEnv||null,service_code:serviceCode});
  const orderId=newId('gco'),engagementId=newId('se'),ts=now(),fp=await hash('day7:d7a3-treatment-order',{context_id:session.context_id,physician_event_id:physician.event_id,service_code:serviceCode,email:lower(session.email)}),required=item.completion;
  const checkout=await stripeRequest(env,'/checkout/sessions',{
    mode:'payment',
    'line_items[0][price]':priceId,
    'line_items[0][quantity]':'1',
    success_url:successUrl(env),
    cancel_url:cancelUrl(env),
    client_reference_id:orderId,
    customer_email:lower(session.email),
    'metadata[galvicare_order_id]':orderId,
    'metadata[principal_id]':session.founder_id,
    'metadata[context_id]':session.context_id,
    'metadata[service_code]':serviceCode,
    'metadata[persona_code]':'A'
  });
  if(!clean(checkout.id)||!clean(checkout.url))throw new GVError('GV_STRIPE_CHECKOUT_INVALID','Stripe returned an incomplete Checkout Session.',502);
  const courseId=courseIdFor(env,serviceCode);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_studio_engagements(engagement_id,principal_id,bmr_id,source_treatment_plan_id,source_action_id,support_level,pillar_code,program_code,sprint_code,intervention_code,catalog_version,sprint_version,objective,entry_gate_json,required_evidence_json,expected_outcomes_json,assigned_actor_type,assigned_actor_id,status,version_no,client_request_id,request_fingerprint,correlation_id,created_at,updated_at) VALUES(?,?,NULL,NULL,?,'galvistudio','founder_development',?,?,?,'galvistudio_1_0_day7_commercial_v1','galvistudio_1_0_sprints_v1',?,?,?,?,?,'active',1,?,?,?,?,?)`).bind(engagementId,session.founder_id,physician.event_id,serviceCode,serviceCode,serviceCode,`Complete the Business Physician prescribed ${item.name} and return verified outcome evidence to GalviVault.`,JSON.stringify({source:'business_physician_plan',context_id:session.context_id}),JSON.stringify(required.map(x=>`systeme:${x}:completed`)),JSON.stringify(['Stripe-verified payment','Systeme.io enrollment','provider-verified completion','customer return confirmation','Business Physician reassessment']),'studio_operator',null,`${key}.studio`,fp,ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_commercial_care_orders(order_id,principal_id,context_id,bmr_id,source_physician_event_id,source_treatment_plan_id,studio_engagement_id,persona_code,service_code,service_kind,provider,provider_offer_key,provider_sale_id,purchaser_email_normalized,amount_cents,currency,required_completion_keys_json,completed_completion_keys_json,status,paid_at,completed_at,customer_confirmed_at,client_request_id,request_fingerprint,correlation_id,created_at,updated_at,payment_provider,stripe_price_id,stripe_checkout_session_id,stripe_checkout_url,stripe_payment_intent_id,payment_status,payment_verified_at,fulfillment_provider,systeme_course_id,systeme_contact_id,systeme_enrollment_id,enrollment_status,enrollment_attempted_at,enrolled_at,enrollment_error_code) VALUES(?,?,?,NULL,?,NULL,?,'A',?,?,'systeme',NULL,NULL,?,NULL,NULL,?,'[]','checkout_started',NULL,NULL,NULL,?,?,?,?,?,'stripe',?,?,?,NULL,'checkout_started',NULL,'systeme',?,NULL,NULL,?,NULL,NULL,NULL)`).bind(orderId,session.founder_id,session.context_id,physician.event_id,engagementId,serviceCode,item.kind,lower(session.email),JSON.stringify(required),key,fp,ctx.correlation,ts,ts,priceId,checkout.id,checkout.url,courseId||null,courseId?'not_started':'pending_configuration')
  ]);
  return{order:normalizeOrder(await first(env.DB,'SELECT * FROM gv1_commercial_care_orders WHERE order_id=?',orderId)),checkout_url:checkout.url,idempotent_replay:false,return_url:successUrl(env)};
}

async function stripeSignatureValid(secret,header,raw){
  const parts=String(header||'').split(',').map(x=>x.trim()),t=parts.find(x=>x.startsWith('t='))?.slice(2),sigs=parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3));
  if(!t||!sigs.length)return false;
  const epoch=Number(t);if(!Number.isFinite(epoch)||Math.abs(Date.now()/1000-epoch)>300)return false;
  const key=await crypto.subtle.importKey('raw',utf8(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const digest=bytesHex(await crypto.subtle.sign('HMAC',key,utf8(`${t}.${raw}`)));
  return sigs.some(s=>timingSafeHex(s,digest));
}
async function verifyStripeWebhook(request,env,raw){const secret=clean(env.STRIPE_TREATMENT_WEBHOOK_SECRET||env.STRIPE_WEBHOOK_SECRET);if(!secret)throw new GVError('GV_STRIPE_WEBHOOK_NOT_CONFIGURED','Stripe treatment webhook secret is not configured.',503);if(!(await stripeSignatureValid(secret,request.headers.get('Stripe-Signature'),raw)))throw new GVError('GV_STRIPE_WEBHOOK_SIGNATURE','Stripe webhook signature verification failed.',400);}
async function orderForStripeEvent(db,obj){const orderId=clean(obj?.metadata?.galvicare_order_id||obj?.client_reference_id);if(orderId){const row=await first(db,'SELECT * FROM gv1_commercial_care_orders WHERE order_id=? LIMIT 1',orderId);if(row)return row;}const sid=clean(obj?.id);if(sid)return first(db,'SELECT * FROM gv1_commercial_care_orders WHERE stripe_checkout_session_id=? LIMIT 1',sid);return null;}

async function requestSystemeEnrollment(env,order,ctx){
  const courseId=clean(order.systeme_course_id)||courseIdFor(env,order.service_code),endpoint=clean(env.SYSTEME_ENROLLMENT_ADAPTER_URL),apiKey=clean(env.SYSTEME_API_KEY),ts=now();
  if(!courseId){await env.DB.prepare("UPDATE gv1_commercial_care_orders SET enrollment_status='pending_configuration',enrollment_error_code='SYSTEME_COURSE_NOT_CONFIGURED',enrollment_attempted_at=?,updated_at=? WHERE order_id=?").bind(ts,ts,order.order_id).run();return{status:'pending_configuration',reason:'SYSTEME_COURSE_NOT_CONFIGURED'};}
  if(!endpoint||!apiKey){await env.DB.prepare("UPDATE gv1_commercial_care_orders SET enrollment_status='pending_configuration',enrollment_error_code='SYSTEME_ADAPTER_NOT_CONFIGURED',enrollment_attempted_at=?,systeme_course_id=COALESCE(systeme_course_id,?),updated_at=? WHERE order_id=?").bind(ts,courseId,ts,order.order_id).run();return{status:'pending_configuration',reason:'SYSTEME_ADAPTER_NOT_CONFIGURED'};}
  await env.DB.prepare("UPDATE gv1_commercial_care_orders SET enrollment_status='requested',enrollment_attempted_at=?,systeme_course_id=COALESCE(systeme_course_id,?),enrollment_error_code=NULL,updated_at=? WHERE order_id=?").bind(ts,courseId,ts,order.order_id).run();
  let response,payload={};try{response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':apiKey},body:JSON.stringify({course_id:courseId,email:order.purchaser_email_normalized,galvicare_order_id:order.order_id,principal_id:order.principal_id,service_code:order.service_code})});payload=await response.json().catch(()=>({}));}catch{await env.DB.prepare("UPDATE gv1_commercial_care_orders SET enrollment_status='retry_required',enrollment_error_code='SYSTEME_ENROLLMENT_NETWORK',updated_at=? WHERE order_id=?").bind(now(),order.order_id).run();return{status:'retry_required',reason:'SYSTEME_ENROLLMENT_NETWORK'};}
  if(!response.ok){await env.DB.prepare("UPDATE gv1_commercial_care_orders SET enrollment_status='retry_required',enrollment_error_code='SYSTEME_ENROLLMENT_HTTP',updated_at=? WHERE order_id=?").bind(now(),order.order_id).run();return{status:'retry_required',reason:'SYSTEME_ENROLLMENT_HTTP',http_status:response.status};}
  const enrollmentId=clean(payload.enrollment_id||payload.id),contactId=clean(payload.contact_id||payload.student_id),done=now();
  await env.DB.prepare("UPDATE gv1_commercial_care_orders SET enrollment_status='enrolled',systeme_course_id=COALESCE(systeme_course_id,?),systeme_contact_id=COALESCE(?,systeme_contact_id),systeme_enrollment_id=COALESCE(?,systeme_enrollment_id),enrolled_at=COALESCE(enrolled_at,?),enrollment_error_code=NULL,status=CASE WHEN status='paid' THEN 'enrolled' ELSE status END,updated_at=? WHERE order_id=?").bind(courseId,contactId||null,enrollmentId||null,done,done,order.order_id).run();
  return{status:'enrolled',course_id:courseId,enrollment_id:enrollmentId||null,contact_id:contactId||null};
}

export async function ingestStripeTreatmentWebhook(env,ctx,request){
  const raw=await request.text();if(raw.length>128000)throw new GVError('GV_REQ_BODY_TOO_LARGE','Stripe webhook payload is too large.',413);await verifyStripeWebhook(request,env,raw);
  let event;try{event=JSON.parse(raw)}catch{throw new GVError('GV_REQ_BODY_INVALID','Stripe webhook requires JSON.',400);}
  const type=clean(event?.type),allowed=new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','charge.refunded']);if(!allowed.has(type))return{ignored:true,event_type:type};
  const providerKey=clean(event?.id);if(!providerKey)throw new GVError('GV_STRIPE_EVENT_ID_REQUIRED','Stripe event ID is required.',422);
  const prior=await first(env.DB,'SELECT payment_event_id,order_id,processing_status FROM gv1_treatment_payment_events WHERE provider_event_key=?',providerKey);if(prior)return{event:prior,idempotent_replay:true};
  const obj=event?.data?.object||{},order=await orderForStripeEvent(env.DB,obj),ts=now(),fp=await hash('day7:d7a3-stripe-webhook',{id:providerKey,type,object_id:clean(obj.id),client_reference_id:clean(obj.client_reference_id)});
  if(!order){await env.DB.prepare(`INSERT INTO gv1_treatment_payment_events(payment_event_id,provider_event_key,event_type,order_id,stripe_checkout_session_id,stripe_payment_intent_id,payment_status,amount_cents,currency,request_fingerprint,processing_status,failure_code,correlation_id,received_at,processed_at) VALUES(?,?,?,NULL,?,?,?,?,?,?,'quarantined','GV_TREATMENT_ORDER_NOT_FOUND',?,?,?)`).bind(newId('tpe'),providerKey,type,clean(obj.id)||null,clean(obj.payment_intent)||null,clean(obj.payment_status)||null,Number.isFinite(Number(obj.amount_total))?Number(obj.amount_total):null,lower(obj.currency)||null,fp,ctx.correlation,ts,ts).run();throw new GVError('GV_TREATMENT_ORDER_NOT_FOUND','Stripe payment could not be linked to one canonical treatment order.',409);}
  const eventId=newId('tpe'),paymentIntent=clean(obj.payment_intent),checkoutId=type.startsWith('checkout.session.')?clean(obj.id):clean(order.stripe_checkout_session_id),amount=Number.isFinite(Number(obj.amount_total))?Number(obj.amount_total):null,currency=lower(obj.currency)||null;
  let newStatus='processed',failure=null,enrollment=null;
  if(type==='checkout.session.completed'||type==='checkout.session.async_payment_succeeded'){
    if(lower(obj.payment_status)!=='paid'){newStatus='quarantined';failure='GV_STRIPE_PAYMENT_NOT_PAID';}
    else{await env.DB.prepare("UPDATE gv1_commercial_care_orders SET stripe_checkout_session_id=COALESCE(stripe_checkout_session_id,?),stripe_payment_intent_id=COALESCE(?,stripe_payment_intent_id),payment_status='paid',payment_verified_at=COALESCE(payment_verified_at,?),paid_at=COALESCE(paid_at,?),amount_cents=COALESCE(?,amount_cents),currency=COALESCE(?,currency),status='paid',updated_at=? WHERE order_id=?").bind(checkoutId||null,paymentIntent||null,ts,ts,amount,currency,ts,order.order_id).run();const refreshed=await first(env.DB,'SELECT * FROM gv1_commercial_care_orders WHERE order_id=?',order.order_id);enrollment=await requestSystemeEnrollment(env,refreshed,ctx);}
  }else if(type==='checkout.session.async_payment_failed'){await env.DB.prepare("UPDATE gv1_commercial_care_orders SET payment_status='failed',updated_at=? WHERE order_id=? AND payment_status<>'paid'").bind(ts,order.order_id).run();}
  else if(type==='charge.refunded'){await env.DB.prepare("UPDATE gv1_commercial_care_orders SET payment_status='refunded',status='refunded',updated_at=? WHERE order_id=?").bind(ts,order.order_id).run();}
  await env.DB.prepare(`INSERT INTO gv1_treatment_payment_events(payment_event_id,provider_event_key,event_type,order_id,stripe_checkout_session_id,stripe_payment_intent_id,payment_status,amount_cents,currency,request_fingerprint,processing_status,failure_code,correlation_id,received_at,processed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(eventId,providerKey,type,order.order_id,checkoutId||null,paymentIntent||null,lower(obj.payment_status)||null,amount,currency,fp,newStatus,failure,ctx.correlation,ts,ts).run();
  if(failure)throw new GVError(failure,'Stripe event did not contain a verified paid treatment Checkout Session.',409);
  return{event:{payment_event_id:eventId,order_id:order.order_id,event_type:type,processing_status:newStatus},enrollment,idempotent_replay:false};
}

export async function retrySystemeEnrollment(env,ctx,request,input={}){const session=await requirePreFounderSession(request,env,clean(input.context_id)),order=await latestOrder(env.DB,session.context_id);if(!order||order.payment_status!=='paid')throw new GVError('GV_TREATMENT_PAYMENT_REQUIRED','Stripe-verified payment is required before treatment enrollment.',409);return{order_id:order.order_id,enrollment:await requestSystemeEnrollment(env,order,ctx)};}

export function normalizeOrder(order){if(!order)return null;return{...order,required_completion_keys:arr(parse(order.required_completion_keys_json,[])),completed_completion_keys:arr(parse(order.completed_completion_keys_json,[]))};}
export async function commercialStateD7A3(env,request,contextId){const session=await requirePreFounderSession(request,env,contextId),order=await latestOrder(env.DB,session.context_id);if(!order)return{order:null,next_action:'await_treatment_order',commercial_schema:'D7A3',manual_repair:'NO'};const queue=await first(env.DB,'SELECT queue_id,status,reason_code,created_at,customer_confirmed_at,reviewed_at FROM gv1_care_reassessment_queue WHERE order_id=?',order.order_id);let next='complete_payment';if(order.payment_status==='paid'){if(['pending_configuration','retry_required','failed','requested','not_started'].includes(order.enrollment_status))next='await_systeme_enrollment';else if(order.status==='course_completed')next='confirm_treatment_completion';else if(order.status==='customer_confirmed')next='await_business_physician_reassessment';else if(order.status==='fulfilled')next='treatment_closed';else next='complete_prescribed_course';}if(order.payment_status==='refunded')next='payment_refunded';return{order:normalizeOrder(order),queue,next_action:next,commercial_schema:'D7A3',payment_authority:'stripe',fulfillment_authority:'systeme',manual_repair:'NO'};}
