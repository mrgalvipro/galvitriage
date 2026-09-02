import { GVError, clean, hash, newId, now } from '../day5-common.js';
import { CARE_CATALOG, requirePreFounderSession } from './day7-commercial-care-service.js';

export const COMMERCIAL_SCHEMA_D7A4='D7A4';
export const COMMERCIAL_SCHEMA_D7A3=COMMERCIAL_SCHEMA_D7A4;
const STRIPE_API='https://api.stripe.com/v1';
const SYSTEME_API='https://api.systeme.io/api';
// SYSTEME_ENROLLMENT_ADAPTER_URL is intentionally retired in D7A4; the Worker calls the Systeme.io Public API directly.
const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
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
  spur_prefounder:'SYSTEME_SPUR_PREFOUNDER_COURSE_ID',
  spur_pathway:'SYSTEME_SPUR_PREFOUNDER_COURSE_ID',
  founder_development_sprint:'SYSTEME_TARGETED_FOUNDER_DEVELOPMENT_COURSE_ID',
  venture_readiness_sprint:'SYSTEME_VENTURE_READINESS_COURSE_ID',
  product_readiness_sprint:'SYSTEME_PRODUCT_READINESS_COURSE_ID',
  gtm_readiness_sprint:'SYSTEME_GTM_READINESS_COURSE_ID',
  fundraising_readiness_sprint:'SYSTEME_FUNDRAISING_READINESS_COURSE_ID'
};
const ORDER_SELECT=`SELECT o.*,d.payment_provider,d.stripe_price_id,d.stripe_checkout_session_id,d.stripe_checkout_url,d.stripe_payment_intent_id,d.payment_status,d.payment_verified_at,d.fulfillment_provider,d.systeme_course_id,d.systeme_contact_id,d.systeme_enrollment_id,d.enrollment_status,d.enrollment_attempted_at,d.enrolled_at,d.enrollment_error_code FROM gv1_commercial_care_orders o LEFT JOIN gv1_commercial_order_delivery d ON d.order_id=o.order_id`;

function itemFor(code){const item=CARE_CATALOG[lower(code)];if(!item)throw new GVError('GV_TREATMENT_NOT_COMMERCIALLY_CONFIGURED','The prescribed treatment is not in the Day 7 commercial care catalog.',409,{service_code:code});return item;}
function physicianServiceCode(plan){return lower(parse(plan?.payload_json,{}).intervention_code||'');}
async function latestOrder(db,contextId){return first(db,`${ORDER_SELECT} WHERE o.context_id=? ORDER BY o.created_at DESC LIMIT 1`,contextId);}
async function orderById(db,orderId){return first(db,`${ORDER_SELECT} WHERE o.order_id=? LIMIT 1`,orderId);}
async function fulfillmentRows(db,orderId){return all(db,`SELECT * FROM gv1_systeme_course_fulfillments WHERE order_id=? ORDER BY created_at,completion_key`,orderId);}
function customerUrl(env){return clean(env.GALVICARE_CUSTOMER_URL)||'https://galvicare-0-5-qa.mrgalvipro.workers.dev/#galvitriage';}
function priceEnvFor(code){return PRICE_ENV[lower(code)]||'';}
function courseSettingFor(completionKey){return COURSE_ENV[lower(completionKey)]||'';}
function courseIdFor(env,completionKey){const e=courseSettingFor(completionKey);return e?clean(env[e]):'';}
function form(params){const b=new URLSearchParams();for(const [k,v] of Object.entries(params))if(v!==undefined&&v!==null&&String(v)!=='')b.set(k,String(v));return b;}
function numericId(v){const n=Number(v);return Number.isSafeInteger(n)&&n>0?n:String(v);}
function systemeHeaders(apiKey,json=false){const h={'X-API-Key':apiKey,Accept:'application/json'};if(json)h['Content-Type']='application/json';return h;}
function systemeRetryableStatus(status){return status===408||status===425||status===429||status>=500;}

async function stripeRequest(env,path,params){
  const secret=clean(env.STRIPE_SECRET_KEY),environment=lower(env.ENVIRONMENT);
  if(!secret)throw new GVError('GV_STRIPE_NOT_CONFIGURED','Stripe server configuration is unavailable.',503);
  if(environment==='qa'&&!secret.startsWith('sk_test_'))throw new GVError('GV_STRIPE_ENVIRONMENT_MISMATCH','QA treatment checkout requires a Stripe TEST secret.',500);
  if(['production','prod'].includes(environment)&&!secret.startsWith('sk_live_'))throw new GVError('GV_STRIPE_ENVIRONMENT_MISMATCH','Production treatment checkout requires a Stripe LIVE secret.',500);
  const r=await fetch(`${STRIPE_API}${path}`,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/x-www-form-urlencoded'},body:form(params)});
  const body=await r.json().catch(()=>({}));
  if(!r.ok)throw new GVError('GV_STRIPE_CHECKOUT_FAILED','Stripe could not create the prescribed-treatment checkout.',502,{stripe_status:r.status,stripe_type:clean(body?.error?.type)||null});
  return body;
}
function successUrl(env){const u=new URL(customerUrl(env));u.searchParams.set('prefounder_return','payment');u.searchParams.set('stripe_session_id','{CHECKOUT_SESSION_ID}');u.hash='galvitriage';return u.toString().replace('%7BCHECKOUT_SESSION_ID%7D','{CHECKOUT_SESSION_ID}');}
function cancelUrl(env){const u=new URL(customerUrl(env));u.searchParams.set('prefounder_return','payment_canceled');u.hash='galvitriage';return u.toString();}

function requiredCourseConfig(env,required){
  return required.map(completionKey=>({completion_key:completionKey,setting:courseSettingFor(completionKey),course_id:courseIdFor(env,completionKey)}));
}
function fulfillmentInsert(orderId,entry,ts){
  return {
    stmt:`INSERT OR IGNORE INTO gv1_systeme_course_fulfillments(fulfillment_id,order_id,completion_key,systeme_course_id,systeme_contact_id,systeme_enrollment_id,access_type,enrollment_status,completion_status,attempt_count,enrollment_attempted_at,enrolled_at,completed_at,enrollment_error_code,created_at,updated_at) VALUES(?,?,?,?,NULL,NULL,'full_access','not_started','not_started',0,NULL,NULL,NULL,NULL,?,?)`,
    binds:[newId('scf'),orderId,entry.completion_key,entry.course_id,ts,ts]
  };
}
async function ensureFulfillmentRows(env,order){
  const required=arr(parse(order.required_completion_keys_json,[])),config=requiredCourseConfig(env,required),missing=config.filter(x=>!x.setting||!x.course_id);
  if(missing.length)throw new GVError('GV_SYSTEME_COURSE_NOT_CONFIGURED','One or more prescribed Sprint courses are not configured in Systeme.io. Enrollment cannot proceed.',503,{missing:missing.map(x=>({completion_key:x.completion_key,required_setting:x.setting||null}))});
  const existing=await fulfillmentRows(env.DB,order.order_id),have=new Set(existing.map(x=>x.completion_key)),ts=now();
  const inserts=config.filter(x=>!have.has(x.completion_key)).map(x=>fulfillmentInsert(order.order_id,x,ts));
  if(inserts.length)await env.DB.batch(inserts.map(x=>env.DB.prepare(x.stmt).bind(...x.binds)));
  return fulfillmentRows(env.DB,order.order_id);
}

export async function createStripeTreatmentOrder(env,ctx,request,key,input={}){
  const session=await requirePreFounderSession(request,env,clean(input.context_id));
  const physician=await first(env.DB,`SELECT event_id,payload_json FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='physician_plan' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  const ack=await first(env.DB,`SELECT event_id FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='customer_acknowledged' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  if(!physician||!ack)throw new GVError('GV_TREATMENT_PLAN_REQUIRED','Business Physician Treatment Plan and customer acknowledgement are required before enrollment.',409);
  const serviceCode=physicianServiceCode(physician),item=itemFor(serviceCode),existing=await latestOrder(env.DB,session.context_id);
  if(existing&&!['canceled','refunded'].includes(existing.status))return{order:normalizeOrder(existing),checkout_url:existing.stripe_checkout_url||null,idempotent_replay:true};
  const account=await first(env.DB,"SELECT account_id FROM gv1_customer_accounts WHERE principal_id=? AND status='active' LIMIT 1",session.founder_id);
  if(!account)throw new GVError('GV_RETURN_ACCOUNT_REQUIRED','Create your GalviCare return password before leaving for the prescribed program.',409,{next_action:'setup_return_credentials'});
  const priceEnv=priceEnvFor(serviceCode),priceId=priceEnv?clean(env[priceEnv]):'',systemeApiKey=clean(env.SYSTEME_API_KEY),required=arr(item.completion),courseConfig=requiredCourseConfig(env,required),missing=courseConfig.filter(x=>!x.setting||!x.course_id);
  if(!priceId)throw new GVError('GV_STRIPE_TREATMENT_PRICE_NOT_CONFIGURED','The Stripe price for this prescribed treatment is not configured.',503,{required_setting:priceEnv||null,service_code:serviceCode});
  if(missing.length)throw new GVError('GV_SYSTEME_COURSE_NOT_CONFIGURED','Every prescribed Sprint must map to a real Systeme.io course before checkout. Checkout is blocked so a customer cannot be charged before treatment can be delivered.',503,{missing:missing.map(x=>({completion_key:x.completion_key,required_setting:x.setting||null})),service_code:serviceCode});
  if(!systemeApiKey)throw new GVError('GV_SYSTEME_ENROLLMENT_NOT_CONFIGURED','The Systeme.io Public API key is not configured. Checkout is blocked so a customer cannot be charged before direct Worker-to-Systeme enrollment is available.',503,{required_settings:['SYSTEME_API_KEY'],service_code:serviceCode});
  const orderId=newId('gco'),engagementId=newId('se'),ts=now(),fp=await hash('day7:d7a4-treatment-order',{context_id:session.context_id,physician_event_id:physician.event_id,service_code:serviceCode,email:lower(session.email),required_completion_keys:required});
  const checkout=await stripeRequest(env,'/checkout/sessions',{mode:'payment','line_items[0][price]':priceId,'line_items[0][quantity]':'1',success_url:successUrl(env),cancel_url:cancelUrl(env),client_reference_id:orderId,customer_email:lower(session.email),'metadata[galvicare_order_id]':orderId,'metadata[principal_id]':session.founder_id,'metadata[context_id]':session.context_id,'metadata[service_code]':serviceCode,'metadata[persona_code]':'A'});
  if(!clean(checkout.id)||!clean(checkout.url))throw new GVError('GV_STRIPE_CHECKOUT_INVALID','Stripe returned an incomplete Checkout Session.',502);
  const fulfillmentInserts=courseConfig.map(x=>fulfillmentInsert(orderId,x,ts));
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_studio_engagements(engagement_id,principal_id,bmr_id,source_treatment_plan_id,source_action_id,support_level,pillar_code,program_code,sprint_code,intervention_code,catalog_version,sprint_version,objective,entry_gate_json,required_evidence_json,expected_outcomes_json,assigned_actor_type,assigned_actor_id,status,version_no,client_request_id,request_fingerprint,correlation_id,created_at,updated_at) VALUES(?,?,NULL,NULL,?,'galvistudio','founder_development',?,?,?,'galvistudio_1_0_day7_commercial_v1','galvistudio_1_0_sprints_v1',?,?,?,?,?,'active',1,?,?,?,?,?)`).bind(engagementId,session.founder_id,physician.event_id,serviceCode,serviceCode,serviceCode,`Complete the Business Physician prescribed ${item.name} and return verified outcome evidence to GalviVault.`,JSON.stringify({source:'business_physician_plan',context_id:session.context_id}),JSON.stringify(required.map(x=>`systeme:${x}:completed`)),JSON.stringify(['Stripe-verified payment','Systeme.io enrollment','provider-verified completion','customer return confirmation','Business Physician reassessment']),'studio_operator',null,`${key}.studio`,fp,ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_commercial_care_orders(order_id,principal_id,context_id,bmr_id,source_physician_event_id,source_treatment_plan_id,studio_engagement_id,persona_code,service_code,service_kind,provider,provider_offer_key,provider_sale_id,purchaser_email_normalized,amount_cents,currency,required_completion_keys_json,completed_completion_keys_json,status,paid_at,completed_at,customer_confirmed_at,client_request_id,request_fingerprint,correlation_id,created_at,updated_at) VALUES(?,?,?,NULL,?,NULL,?,'A',?,?,'systeme',NULL,NULL,?,NULL,NULL,?,'[]','checkout_started',NULL,NULL,NULL,?,?,?,?,?)`).bind(orderId,session.founder_id,session.context_id,physician.event_id,engagementId,serviceCode,item.kind,lower(session.email),JSON.stringify(required),key,fp,ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_commercial_order_delivery(order_id,payment_provider,stripe_price_id,stripe_checkout_session_id,stripe_checkout_url,stripe_payment_intent_id,payment_status,payment_verified_at,fulfillment_provider,systeme_course_id,systeme_contact_id,systeme_enrollment_id,enrollment_status,enrollment_attempted_at,enrolled_at,enrollment_error_code,created_at,updated_at) VALUES(?,'stripe',?,?,?,NULL,'checkout_started',NULL,'systeme',?,NULL,NULL,'not_started',NULL,NULL,NULL,?,?)`).bind(orderId,priceId,checkout.id,checkout.url,courseConfig[0]?.course_id||null,ts,ts),
    ...fulfillmentInserts.map(x=>env.DB.prepare(x.stmt).bind(...x.binds))
  ]);
  return{order:normalizeOrder(await orderById(env.DB,orderId)),fulfillments:await fulfillmentRows(env.DB,orderId),checkout_url:checkout.url,idempotent_replay:false,return_url:successUrl(env)};
}

async function stripeSignatureValid(secret,header,raw){const parts=String(header||'').split(',').map(x=>x.trim()),t=parts.find(x=>x.startsWith('t='))?.slice(2),sigs=parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3));if(!t||!sigs.length)return false;const epoch=Number(t);if(!Number.isFinite(epoch)||Math.abs(Date.now()/1000-epoch)>300)return false;const key=await crypto.subtle.importKey('raw',utf8(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const digest=bytesHex(await crypto.subtle.sign('HMAC',key,utf8(`${t}.${raw}`)));return sigs.some(s=>timingSafeHex(s,digest));}
async function verifyStripeWebhook(request,env,raw){const secret=clean(env.STRIPE_TREATMENT_WEBHOOK_SECRET||env.STRIPE_WEBHOOK_SECRET);if(!secret)throw new GVError('GV_STRIPE_WEBHOOK_NOT_CONFIGURED','Stripe treatment webhook secret is not configured.',503);if(!(await stripeSignatureValid(secret,request.headers.get('Stripe-Signature'),raw)))throw new GVError('GV_STRIPE_WEBHOOK_SIGNATURE','Stripe webhook signature verification failed.',400);}
async function orderForStripeEvent(db,obj){const orderId=clean(obj?.metadata?.galvicare_order_id||obj?.client_reference_id);if(orderId){const row=await orderById(db,orderId);if(row)return row;}const sid=clean(obj?.id);if(sid)return first(db,`${ORDER_SELECT} WHERE d.stripe_checkout_session_id=? LIMIT 1`,sid);return null;}

async function systemeRequest(env,path,options={}){
  const apiKey=clean(env.SYSTEME_API_KEY);
  if(!apiKey)throw Object.assign(new Error('SYSTEME_API_KEY_NOT_CONFIGURED'),{code:'SYSTEME_API_KEY_NOT_CONFIGURED',retryable:false});
  let response,payload={};
  try{
    response=await fetch(`${SYSTEME_API}${path}`,{method:options.method||'GET',headers:systemeHeaders(apiKey,options.body!==undefined),body:options.body===undefined?undefined:JSON.stringify(options.body)});
    payload=await response.json().catch(()=>({}));
  }catch{
    throw Object.assign(new Error('SYSTEME_NETWORK'),{code:'SYSTEME_NETWORK',retryable:true});
  }
  return{response,payload};
}
async function findSystemeContactByEmail(env,email){
  let startingAfter='';
  for(let page=0;page<20;page++){
    const q=new URLSearchParams({limit:'100',order:'desc'});if(startingAfter)q.set('startingAfter',startingAfter);
    const {response,payload}=await systemeRequest(env,`/contacts?${q}`);
    if(!response.ok)throw Object.assign(new Error('SYSTEME_CONTACT_LOOKUP_HTTP'),{code:'SYSTEME_CONTACT_LOOKUP_HTTP',retryable:systemeRetryableStatus(response.status),status:response.status});
    const items=Array.isArray(payload?.items)?payload.items:[];
    const hit=items.find(x=>lower(x?.email)===email);if(hit?.id)return String(hit.id);
    if(!payload?.hasMore||!items.length)return '';
    startingAfter=String(items.at(-1)?.id||'');if(!startingAfter)return '';
  }
  return '';
}
async function priorSystemeContactId(env,order){
  const row=await first(env.DB,`SELECT f.systeme_contact_id FROM gv1_systeme_course_fulfillments f JOIN gv1_commercial_care_orders o ON o.order_id=f.order_id WHERE o.principal_id=? AND f.systeme_contact_id IS NOT NULL AND f.systeme_contact_id<>'' ORDER BY f.enrolled_at DESC,f.updated_at DESC LIMIT 1`,order.principal_id);
  return clean(row?.systeme_contact_id);
}
async function resolveSystemeContact(env,order){
  const prior=await priorSystemeContactId(env,order);if(prior)return prior;
  const email=lower(order.purchaser_email_normalized);if(!email)throw Object.assign(new Error('SYSTEME_CONTACT_EMAIL_REQUIRED'),{code:'SYSTEME_CONTACT_EMAIL_REQUIRED',retryable:false});
  const {response,payload}=await systemeRequest(env,'/contacts',{method:'POST',body:{email,locale:'en'}});
  if(response.ok&&payload?.id)return String(payload.id);
  if([400,409,422].includes(response.status)){const duplicate=await findSystemeContactByEmail(env,email);if(duplicate)return duplicate;}
  throw Object.assign(new Error('SYSTEME_CONTACT_CREATE_HTTP'),{code:'SYSTEME_CONTACT_CREATE_HTTP',retryable:systemeRetryableStatus(response.status),status:response.status});
}
function enrollmentIdentity(row){return{contact_id:String(row?.contactId||row?.contact_id||row?.contact?.id||''),course_id:String(row?.courseId||row?.course_id||row?.course?.id||''),enrollment_id:String(row?.id||row?.enrollmentId||row?.enrollment_id||'')};}
async function findSystemeEnrollment(env,contactId,courseId){
  let startingAfter='';
  for(let page=0;page<20;page++){
    const q=new URLSearchParams({limit:'100',order:'desc'});if(startingAfter)q.set('startingAfter',startingAfter);
    const {response,payload}=await systemeRequest(env,`/school/enrollments?${q}`);
    if(!response.ok)throw Object.assign(new Error('SYSTEME_ENROLLMENT_LOOKUP_HTTP'),{code:'SYSTEME_ENROLLMENT_LOOKUP_HTTP',retryable:systemeRetryableStatus(response.status),status:response.status});
    const items=Array.isArray(payload?.items)?payload.items:[];
    for(const row of items){const id=enrollmentIdentity(row);if(id.contact_id===String(contactId)&&id.course_id===String(courseId))return id.enrollment_id||String(row?.id||'');}
    if(!payload?.hasMore||!items.length)return '';
    startingAfter=String(items.at(-1)?.id||'');if(!startingAfter)return '';
  }
  return '';
}
async function recordFulfillmentFailure(env,row,error){
  const ts=now(),status=error?.retryable?'retry_required':'failed',code=clean(error?.code)||'SYSTEME_ENROLLMENT_FAILED';
  await env.DB.prepare(`UPDATE gv1_systeme_course_fulfillments SET enrollment_status=?,enrollment_error_code=?,updated_at=? WHERE fulfillment_id=?`).bind(status,code,ts,row.fulfillment_id).run();
  return{completion_key:row.completion_key,status,reason:code,http_status:error?.status||null};
}
async function enrollFulfillment(env,row,contactId){
  if(row.enrollment_status==='enrolled'&&clean(row.systeme_enrollment_id))return{completion_key:row.completion_key,status:'enrolled',course_id:row.systeme_course_id,contact_id:row.systeme_contact_id,enrollment_id:row.systeme_enrollment_id,idempotent_replay:true};
  const ts=now();
  await env.DB.prepare(`UPDATE gv1_systeme_course_fulfillments SET enrollment_status='requested',systeme_contact_id=?,attempt_count=attempt_count+1,enrollment_attempted_at=?,enrollment_error_code=NULL,updated_at=? WHERE fulfillment_id=?`).bind(String(contactId),ts,ts,row.fulfillment_id).run();
  let response,payload={};
  try{
    ({response,payload}=await systemeRequest(env,`/school/courses/${encodeURIComponent(row.systeme_course_id)}/enrollments`,{method:'POST',body:{contactId:numericId(contactId),accessType:'full_access'}}));
  }catch(error){return recordFulfillmentFailure(env,row,error);}
  let enrollmentId=response.ok?clean(payload?.id||payload?.enrollmentId||payload?.enrollment_id):'';
  if(!response.ok&&[400,409,422].includes(response.status)){
    try{enrollmentId=await findSystemeEnrollment(env,contactId,row.systeme_course_id);}catch(error){return recordFulfillmentFailure(env,row,error);}
  }
  if(!response.ok&&!enrollmentId)return recordFulfillmentFailure(env,row,Object.assign(new Error('SYSTEME_ENROLLMENT_HTTP'),{code:'SYSTEME_ENROLLMENT_HTTP',retryable:systemeRetryableStatus(response.status),status:response.status}));
  if(!enrollmentId)return recordFulfillmentFailure(env,row,Object.assign(new Error('SYSTEME_ENROLLMENT_ID_MISSING'),{code:'SYSTEME_ENROLLMENT_ID_MISSING',retryable:true,status:response.status}));
  const done=now();
  await env.DB.prepare(`UPDATE gv1_systeme_course_fulfillments SET enrollment_status='enrolled',systeme_contact_id=?,systeme_enrollment_id=?,enrolled_at=COALESCE(enrolled_at,?),enrollment_error_code=NULL,updated_at=? WHERE fulfillment_id=?`).bind(String(contactId),enrollmentId,done,done,row.fulfillment_id).run();
  return{completion_key:row.completion_key,status:'enrolled',course_id:row.systeme_course_id,contact_id:String(contactId),enrollment_id:enrollmentId,idempotent_replay:false};
}
async function syncAggregateEnrollment(env,order){
  const rows=await fulfillmentRows(env.DB,order.order_id),allEnrolled=rows.length>0&&rows.every(x=>x.enrollment_status==='enrolled'),anyRetry=rows.some(x=>x.enrollment_status==='retry_required'),anyFailed=rows.some(x=>x.enrollment_status==='failed'),anyRequested=rows.some(x=>x.enrollment_status==='requested'),anyPending=rows.some(x=>x.enrollment_status==='pending_configuration'||x.enrollment_status==='not_started');
  const aggregate=allEnrolled?'enrolled':anyRetry?'retry_required':anyFailed?'failed':anyRequested?'requested':anyPending?'pending_configuration':'not_started',primary=rows[0]||{},ts=now(),error=rows.find(x=>x.enrollment_error_code)?.enrollment_error_code||null;
  await env.DB.batch([
    env.DB.prepare(`UPDATE gv1_commercial_order_delivery SET systeme_course_id=COALESCE(?,systeme_course_id),systeme_contact_id=COALESCE(?,systeme_contact_id),systeme_enrollment_id=COALESCE(?,systeme_enrollment_id),enrollment_status=?,enrollment_attempted_at=COALESCE(?,enrollment_attempted_at),enrolled_at=CASE WHEN ?='enrolled' THEN COALESCE(enrolled_at,?) ELSE enrolled_at END,enrollment_error_code=?,updated_at=? WHERE order_id=?`).bind(primary.systeme_course_id||null,primary.systeme_contact_id||null,primary.systeme_enrollment_id||null,aggregate,rows.find(x=>x.enrollment_attempted_at)?.enrollment_attempted_at||null,aggregate,ts,error,ts,order.order_id),
    env.DB.prepare(`UPDATE gv1_commercial_care_orders SET status=CASE WHEN ?='enrolled' AND status='paid' THEN 'enrolled' ELSE status END,updated_at=? WHERE order_id=?`).bind(aggregate,ts,order.order_id)
  ]);
  return{status:aggregate,fulfillments:rows.map(normalizeFulfillment)};
}
async function requestSystemeEnrollments(env,order,ctx){
  let rows;
  try{rows=await ensureFulfillmentRows(env,order);}catch(error){
    const ts=now();await env.DB.prepare(`UPDATE gv1_commercial_order_delivery SET enrollment_status='pending_configuration',enrollment_error_code=?,enrollment_attempted_at=?,updated_at=? WHERE order_id=?`).bind(clean(error?.code)||'SYSTEME_COURSE_NOT_CONFIGURED',ts,ts,order.order_id).run();
    return{status:'pending_configuration',reason:clean(error?.code)||'SYSTEME_COURSE_NOT_CONFIGURED'};
  }
  if(!clean(env.SYSTEME_API_KEY)){
    const ts=now();await env.DB.batch([
      ...rows.map(row=>env.DB.prepare(`UPDATE gv1_systeme_course_fulfillments SET enrollment_status='pending_configuration',enrollment_error_code='SYSTEME_API_KEY_NOT_CONFIGURED',enrollment_attempted_at=?,updated_at=? WHERE fulfillment_id=?`).bind(ts,ts,row.fulfillment_id)),
      env.DB.prepare(`UPDATE gv1_commercial_order_delivery SET enrollment_status='pending_configuration',enrollment_error_code='SYSTEME_API_KEY_NOT_CONFIGURED',enrollment_attempted_at=?,updated_at=? WHERE order_id=?`).bind(ts,ts,order.order_id)
    ]);
    return{status:'pending_configuration',reason:'SYSTEME_API_KEY_NOT_CONFIGURED'};
  }
  let contactId;
  try{contactId=await resolveSystemeContact(env,order);}catch(error){
    const ts=now(),status=error?.retryable?'retry_required':'failed',code=clean(error?.code)||'SYSTEME_CONTACT_FAILED';
    await env.DB.batch([
      ...rows.map(row=>env.DB.prepare(`UPDATE gv1_systeme_course_fulfillments SET enrollment_status=?,enrollment_error_code=?,enrollment_attempted_at=?,attempt_count=attempt_count+1,updated_at=? WHERE fulfillment_id=?`).bind(status,code,ts,ts,row.fulfillment_id)),
      env.DB.prepare(`UPDATE gv1_commercial_order_delivery SET enrollment_status=?,enrollment_error_code=?,enrollment_attempted_at=?,updated_at=? WHERE order_id=?`).bind(status,code,ts,ts,order.order_id)
    ]);
    return{status,reason:code,http_status:error?.status||null};
  }
  const results=[];
  for(const row of rows)results.push(await enrollFulfillment(env,row,contactId));
  const aggregate=await syncAggregateEnrollment(env,order);
  return{...aggregate,contact_id:String(contactId),results};
}

export async function ingestStripeTreatmentWebhook(env,ctx,request){
  const raw=await request.text();if(raw.length>128000)throw new GVError('GV_REQ_BODY_TOO_LARGE','Stripe webhook payload is too large.',413);await verifyStripeWebhook(request,env,raw);
  let event;try{event=JSON.parse(raw)}catch{throw new GVError('GV_REQ_BODY_INVALID','Stripe webhook requires JSON.',400);}
  const type=clean(event?.type),allowed=new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','charge.refunded']);if(!allowed.has(type))return{ignored:true,event_type:type};
  const providerKey=clean(event?.id);if(!providerKey)throw new GVError('GV_STRIPE_EVENT_ID_REQUIRED','Stripe event ID is required.',422);
  const prior=await first(env.DB,'SELECT payment_event_id,order_id,processing_status FROM gv1_treatment_payment_events WHERE provider_event_key=?',providerKey);if(prior)return{event:prior,idempotent_replay:true};
  const obj=event?.data?.object||{},order=await orderForStripeEvent(env.DB,obj),ts=now(),fp=await hash('day7:d7a4-stripe-webhook',{id:providerKey,type,object_id:clean(obj.id),client_reference_id:clean(obj.client_reference_id)});
  if(!order){await env.DB.prepare(`INSERT INTO gv1_treatment_payment_events(payment_event_id,provider_event_key,event_type,order_id,stripe_checkout_session_id,stripe_payment_intent_id,payment_status,amount_cents,currency,request_fingerprint,processing_status,failure_code,correlation_id,received_at,processed_at) VALUES(?,?,?,NULL,?,?,?,?,?,?,'quarantined','GV_TREATMENT_ORDER_NOT_FOUND',?,?,?)`).bind(newId('tpe'),providerKey,type,clean(obj.id)||null,clean(obj.payment_intent)||null,clean(obj.payment_status)||null,Number.isFinite(Number(obj.amount_total))?Number(obj.amount_total):null,lower(obj.currency)||null,fp,ctx.correlation,ts,ts).run();throw new GVError('GV_TREATMENT_ORDER_NOT_FOUND','Stripe payment could not be linked to one canonical treatment order.',409);}
  const eventId=newId('tpe'),paymentIntent=clean(obj.payment_intent),checkoutId=type.startsWith('checkout.session.')?clean(obj.id):clean(order.stripe_checkout_session_id),amount=Number.isFinite(Number(obj.amount_total))?Number(obj.amount_total):null,currency=lower(obj.currency)||null;
  let processing='processed',failure=null,enrollment=null;
  if(type==='checkout.session.completed'||type==='checkout.session.async_payment_succeeded'){
    if(lower(obj.payment_status)!=='paid'){processing='quarantined';failure='GV_STRIPE_PAYMENT_NOT_PAID';}
    else{
      await env.DB.batch([
        env.DB.prepare("UPDATE gv1_commercial_order_delivery SET stripe_checkout_session_id=COALESCE(stripe_checkout_session_id,?),stripe_payment_intent_id=COALESCE(?,stripe_payment_intent_id),payment_status='paid',payment_verified_at=COALESCE(payment_verified_at,?),updated_at=? WHERE order_id=?").bind(checkoutId||null,paymentIntent||null,ts,ts,order.order_id),
        env.DB.prepare("UPDATE gv1_commercial_care_orders SET paid_at=COALESCE(paid_at,?),amount_cents=COALESCE(?,amount_cents),currency=COALESCE(?,currency),status='paid',updated_at=? WHERE order_id=?").bind(ts,amount,currency,ts,order.order_id)
      ]);
      enrollment=await requestSystemeEnrollments(env,await orderById(env.DB,order.order_id),ctx);
    }
  }else if(type==='checkout.session.async_payment_failed')await env.DB.prepare("UPDATE gv1_commercial_order_delivery SET payment_status=CASE WHEN payment_status='paid' THEN payment_status ELSE 'failed' END,updated_at=? WHERE order_id=?").bind(ts,order.order_id).run();
  else if(type==='charge.refunded')await env.DB.batch([env.DB.prepare("UPDATE gv1_commercial_order_delivery SET payment_status='refunded',updated_at=? WHERE order_id=?").bind(ts,order.order_id),env.DB.prepare("UPDATE gv1_commercial_care_orders SET status='refunded',updated_at=? WHERE order_id=?").bind(ts,order.order_id)]);
  await env.DB.prepare(`INSERT INTO gv1_treatment_payment_events(payment_event_id,provider_event_key,event_type,order_id,stripe_checkout_session_id,stripe_payment_intent_id,payment_status,amount_cents,currency,request_fingerprint,processing_status,failure_code,correlation_id,received_at,processed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(eventId,providerKey,type,order.order_id,checkoutId||null,paymentIntent||null,lower(obj.payment_status)||null,amount,currency,fp,processing,failure,ctx.correlation,ts,ts).run();
  if(failure)throw new GVError(failure,'Stripe event did not contain a verified paid treatment Checkout Session.',409);
  return{event:{payment_event_id:eventId,order_id:order.order_id,event_type:type,processing_status:processing},enrollment,idempotent_replay:false};
}

export async function retrySystemeEnrollment(env,ctx,request,input={}){const session=await requirePreFounderSession(request,env,clean(input.context_id)),order=await latestOrder(env.DB,session.context_id);if(!order||order.payment_status!=='paid')throw new GVError('GV_TREATMENT_PAYMENT_REQUIRED','Stripe-verified payment is required before treatment enrollment.',409);return{order_id:order.order_id,enrollment:await requestSystemeEnrollments(env,order,ctx)};}
export function normalizeOrder(order){if(!order)return null;return{...order,required_completion_keys:arr(parse(order.required_completion_keys_json,[])),completed_completion_keys:arr(parse(order.completed_completion_keys_json,[]))};}
export function normalizeFulfillment(row){if(!row)return null;return{fulfillment_id:row.fulfillment_id,order_id:row.order_id,completion_key:row.completion_key,systeme_course_id:row.systeme_course_id,systeme_contact_id:row.systeme_contact_id,systeme_enrollment_id:row.systeme_enrollment_id,access_type:row.access_type,enrollment_status:row.enrollment_status,completion_status:row.completion_status,attempt_count:row.attempt_count,enrollment_attempted_at:row.enrollment_attempted_at,enrolled_at:row.enrolled_at,completed_at:row.completed_at,enrollment_error_code:row.enrollment_error_code};}
export async function commercialStateD7A4(env,request,contextId){const session=await requirePreFounderSession(request,env,contextId),order=await latestOrder(env.DB,session.context_id);if(!order)return{order:null,fulfillments:[],next_action:'await_treatment_order',commercial_schema:'D7A4',manual_repair:'NO'};const queue=await first(env.DB,'SELECT queue_id,status,reason_code,created_at,customer_confirmed_at,reviewed_at FROM gv1_care_reassessment_queue WHERE order_id=?',order.order_id),fulfillments=(await fulfillmentRows(env.DB,order.order_id)).map(normalizeFulfillment);let next='complete_payment';if(order.payment_status==='paid'){if(order.status==='course_completed')next='confirm_treatment_completion';else if(order.status==='customer_confirmed')next='await_business_physician_reassessment';else if(order.status==='fulfilled')next='treatment_closed';else if(['pending_configuration','retry_required','failed','requested','not_started'].includes(order.enrollment_status))next='await_systeme_enrollment';else next='complete_prescribed_course';}if(order.payment_status==='refunded')next='payment_refunded';return{order:normalizeOrder(order),fulfillments,queue,next_action:next,commercial_schema:'D7A4',payment_authority:'stripe',fulfillment_authority:'systeme_public_api',treatment_plan_orchestrator:'galvivault',manual_repair:'NO'};}
export const commercialStateD7A3=commercialStateD7A4;
