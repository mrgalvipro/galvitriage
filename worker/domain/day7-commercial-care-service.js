import { GVError, clean, hash, newId, now } from '../day5-common.js';

export const COMMERCIAL_SCHEMA='D7A2';
export const FOUNDER_SHOT_PROMPT='foundershot_founder_mri_v1';
export const FOUNDER_SHOT_SCHEMA='foundershot_snapshot_v1';
const PREFOUNDER_SESSION_SCOPE='day7:prefounder-session';
const PASSWORD_ITERATIONS=100000;
const SESSION_TTL_MS=12*60*60*1000;
const PROVIDER_URL=['https://api','openai.com/v1/responses'].join('.');
const PROVIDER_SECRET=['OPENAI','API','KEY'].join('_');
const SYSTEME_IPS=new Set(['185.236.142.1','185.236.142.2','185.236.142.3']);

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
const lower=v=>clean(v).toLowerCase();
const parse=(v,f={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return f}};
const arr=v=>Array.isArray(v)?v.map(clean).filter(Boolean):[];
const isoAfter=ms=>new Date(Date.now()+ms).toISOString();
const randomToken=prefix=>`${prefix}${crypto.randomUUID().replaceAll('-','')}${crypto.randomUUID().replaceAll('-','')}`;
const bytesToB64url=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const b64urlToBytes=value=>{const raw=clean(value).replaceAll('-','+').replaceAll('_','/');const padded=raw+'='.repeat((4-raw.length%4)%4);return Uint8Array.from(atob(padded),c=>c.charCodeAt(0));};
const safeEqual=(a,b)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i];return d===0;};

export const CARE_CATALOG=Object.freeze({
  founder_readiness_sprint:{name:'Founder Readiness Sprint™',kind:'sprint',personas:['A','C'],completion:['founder_readiness_sprint'],checkout_env:'SYSTEME_FOUNDER_READINESS_CHECKOUT_URL',offer_env:'SYSTEME_FOUNDER_READINESS_OFFER_KEY'},
  spur_pathway:{name:'SPUR™ Pre-Founder Pathway',kind:'course',personas:['A','C'],completion:['spur_prefounder'],checkout_env:'SYSTEME_SPUR_PREFOUNDER_CHECKOUT_URL',offer_env:'SYSTEME_SPUR_PREFOUNDER_OFFER_KEY'},
  founder_development_sprint:{name:'Targeted Founder Development Sprint™',kind:'sprint',personas:['A','B','C'],completion:['founder_development_sprint'],checkout_env:'SYSTEME_TARGETED_FOUNDER_DEVELOPMENT_CHECKOUT_URL',offer_env:'SYSTEME_TARGETED_FOUNDER_DEVELOPMENT_OFFER_KEY'},
  venture_readiness_sprint:{name:'Venture Readiness Sprint™',kind:'sprint',personas:['A','B','C'],completion:['venture_readiness_sprint'],checkout_env:'SYSTEME_VENTURE_READINESS_CHECKOUT_URL',offer_env:'SYSTEME_VENTURE_READINESS_OFFER_KEY'},
  product_readiness_sprint:{name:'Product Readiness Sprint™',kind:'sprint',personas:['B','C'],completion:['product_readiness_sprint'],checkout_env:'SYSTEME_PRODUCT_READINESS_CHECKOUT_URL',offer_env:'SYSTEME_PRODUCT_READINESS_OFFER_KEY'},
  gtm_readiness_sprint:{name:'GTM Readiness Sprint™',kind:'sprint',personas:['B','C'],completion:['gtm_readiness_sprint'],checkout_env:'SYSTEME_GTM_READINESS_CHECKOUT_URL',offer_env:'SYSTEME_GTM_READINESS_OFFER_KEY'},
  fundraising_readiness_sprint:{name:'Fundraising Readiness Sprint™',kind:'sprint',personas:['B','C'],completion:['fundraising_readiness_sprint'],checkout_env:'SYSTEME_FUNDRAISING_READINESS_CHECKOUT_URL',offer_env:'SYSTEME_FUNDRAISING_READINESS_OFFER_KEY'},
  founder_foundation_plan:{name:'Founder Foundation Plan™',kind:'treatment_plan',personas:['A'],completion:['founder_readiness_sprint','venture_readiness_sprint'],checkout_env:'SYSTEME_FOUNDER_FOUNDATION_CHECKOUT_URL',offer_env:'SYSTEME_FOUNDER_FOUNDATION_OFFER_KEY'},
  venture_builder_plan:{name:'Venture Builder Plan™',kind:'treatment_plan',personas:['A','C'],completion:['founder_readiness_sprint','venture_readiness_sprint','product_readiness_sprint'],checkout_env:'SYSTEME_VENTURE_BUILDER_CHECKOUT_URL',offer_env:'SYSTEME_VENTURE_BUILDER_OFFER_KEY'},
  startup_launch_plan:{name:'Startup Launch Plan™',kind:'treatment_plan',personas:['B','C'],completion:['founder_readiness_sprint','venture_readiness_sprint','product_readiness_sprint','gtm_readiness_sprint'],checkout_env:'SYSTEME_STARTUP_LAUNCH_CHECKOUT_URL',offer_env:'SYSTEME_STARTUP_LAUNCH_OFFER_KEY'},
  venture_acceleration_plan:{name:'Venture Acceleration Plan™',kind:'treatment_plan',personas:['B'],completion:['founder_readiness_sprint','venture_readiness_sprint','product_readiness_sprint','gtm_readiness_sprint','fundraising_readiness_sprint'],checkout_env:'SYSTEME_VENTURE_ACCELERATION_CHECKOUT_URL',offer_env:'SYSTEME_VENTURE_ACCELERATION_OFFER_KEY'}
});

async function passwordDigest(password,salt){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:PASSWORD_ITERATIONS},key,256);
  return new Uint8Array(bits);
}
async function encodePassword(password){
  const value=String(password||'');
  if(value.length<12||value.length>128)throw new GVError('GV_CUSTOMER_PASSWORD_POLICY','Password must be between 12 and 128 characters.',422);
  const salt=crypto.getRandomValues(new Uint8Array(24)),digest=await passwordDigest(value,salt);
  return{salt:bytesToB64url(salt),digest:bytesToB64url(digest)};
}
async function verifyPassword(password,row){try{return safeEqual(await passwordDigest(String(password||''),b64urlToBytes(row.password_salt)),b64urlToBytes(row.password_hash));}catch{return false}}

export async function requirePreFounderSession(request,env,expectedContext=''){
  const raw=clean(request.headers.get('X-Galvi-Day3-Session'));
  if(!raw)throw new GVError('GV_AUTH_REQUIRED','Pre-Founder customer session is required.',401);
  const sessionHash=await hash(PREFOUNDER_SESSION_SCOPE,raw);
  const row=await first(env.DB,`SELECT s.context_id,s.founder_id,s.expires_at,c.lifecycle_state,c.record_mode,c.bmr_id,c.venture_id,f.email,f.first_name,f.last_name
    FROM gv1_prefounder_sessions s JOIN gv1_principal_contexts c ON c.context_id=s.context_id JOIN gv1_founders f ON f.founder_id=s.founder_id
    WHERE s.session_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP LIMIT 1`,sessionHash);
  if(!row)throw new GVError('GV_AUTH_REQUIRED','Pre-Founder customer session is invalid or expired.',401);
  if(expectedContext&&row.context_id!==expectedContext)throw new GVError('GV_AUTH_FORBIDDEN','Pre-Founder record access denied.',403);
  if(row.lifecycle_state!=='pre_founder'||row.record_mode!=='principal_only'||row.bmr_id||row.venture_id)throw new GVError('GV_SCOPE_MISMATCH','This route requires the canonical principal-only Pre-Founder context.',409);
  return row;
}

export async function setupPreFounderAccount(env,ctx,request,input){
  const session=await requirePreFounderSession(request,env,clean(input.context_id));
  const ack=await first(env.DB,`SELECT event_id FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='customer_acknowledged' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  if(!ack)throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','Acknowledge the Business Physician Treatment Plan before creating return credentials.',409);
  const encoded=await encodePassword(input.password),email=lower(session.email),ts=now();
  let account=await first(env.DB,'SELECT account_id,principal_id FROM gv1_customer_accounts WHERE principal_id=? OR email_normalized=? LIMIT 1',session.founder_id,email);
  if(account&&account.principal_id!==session.founder_id)throw new GVError('GV_CUSTOMER_ACCOUNT_IDENTITY_CONFLICT','This email is linked to a different canonical principal.',409);
  if(account){await env.DB.prepare(`UPDATE gv1_customer_accounts SET password_salt=?,password_hash=?,password_iterations=?,password_version=3,status='active',failed_attempts=0,locked_until=NULL,updated_at=? WHERE account_id=?`).bind(encoded.salt,encoded.digest,PASSWORD_ITERATIONS,ts,account.account_id).run();}
  else{account={account_id:newId('gca'),principal_id:session.founder_id};await env.DB.prepare(`INSERT INTO gv1_customer_accounts(account_id,principal_id,email_normalized,password_salt,password_hash,password_iterations,password_version,status,failed_attempts,locked_until,last_login_at,created_at,updated_at) VALUES(?,?,?,?,?,?,3,'active',0,NULL,NULL,?,?)`).bind(account.account_id,session.founder_id,email,encoded.salt,encoded.digest,PASSWORD_ITERATIONS,ts,ts).run();}
  return{account_ready:true,principal_id:session.founder_id,context_id:session.context_id,email,manual_repair:'NO'};
}

export async function loginPreFounder(env,ctx,input){
  const email=lower(input.email),account=await first(env.DB,'SELECT * FROM gv1_customer_accounts WHERE email_normalized=? LIMIT 1',email);
  if(!account||account.status!=='active'||!(await verifyPassword(input.password,account)))throw new GVError('GV_CUSTOMER_LOGIN_INVALID','Email or password is incorrect.',401);
  const contexts=await all(env.DB,`SELECT context_id,founder_id FROM gv1_principal_contexts WHERE founder_id=? AND lifecycle_state='pre_founder' AND record_mode='principal_only' AND venture_id IS NULL AND bmr_id IS NULL AND status='active' ORDER BY updated_at DESC`,account.principal_id);
  if(contexts.length!==1)throw new GVError('GV_CUSTOMER_ACCESS_SCOPE_MISMATCH','Returning Pre-Founder access requires exactly one active principal-only context.',409,{active_contexts:contexts.length});
  const raw=randomToken('gpf1_'),sessionHash=await hash(PREFOUNDER_SESSION_SCOPE,raw),ts=now(),expires=isoAfter(SESSION_TTL_MS);
  await env.DB.batch([
    env.DB.prepare('INSERT INTO gv1_prefounder_sessions(session_hash,context_id,founder_id,expires_at,revoked_at,created_at,last_used_at) VALUES(?,?,?,?,NULL,?,?)').bind(sessionHash,contexts[0].context_id,account.principal_id,expires,ts,ts),
    env.DB.prepare('UPDATE gv1_customer_accounts SET failed_attempts=0,locked_until=NULL,last_login_at=?,updated_at=? WHERE account_id=?').bind(ts,ts,account.account_id)
  ]);
  return{access_token:raw,expires_at:expires,principal_id:account.principal_id,context_id:contexts[0].context_id,record_mode:'principal_only',manual_repair:'NO'};
}

function physicianServiceCode(plan){return lower(parse(plan?.payload_json,{}).intervention_code||'');}
function catalogItem(code){const item=CARE_CATALOG[lower(code)];if(!item)throw new GVError('GV_TREATMENT_NOT_COMMERCIALLY_CONFIGURED','The prescribed treatment is not in the Day 7 commercial care catalog.',409,{service_code:code});return item}
async function latestOrder(db,contextId){return first(db,'SELECT * FROM gv1_commercial_care_orders WHERE context_id=? ORDER BY created_at DESC LIMIT 1',contextId)}

export async function createPreFounderTreatmentOrder(env,ctx,request,key,input={}){
  const session=await requirePreFounderSession(request,env,clean(input.context_id));
  const physician=await first(env.DB,`SELECT event_id,payload_json FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='physician_plan' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  const ack=await first(env.DB,`SELECT event_id FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='customer_acknowledged' ORDER BY created_at DESC LIMIT 1`,session.context_id);
  if(!physician||!ack)throw new GVError('GV_TREATMENT_PLAN_REQUIRED','Business Physician Treatment Plan and customer acknowledgement are required before enrollment.',409);
  const serviceCode=physicianServiceCode(physician),item=catalogItem(serviceCode);
  const existing=await latestOrder(env.DB,session.context_id);if(existing&&!['canceled','refunded'].includes(existing.status))return{order:existing,checkout_url:clean(env[item.checkout_env])||null,idempotent_replay:true};
  const account=await first(env.DB,'SELECT account_id FROM gv1_customer_accounts WHERE principal_id=? AND status=\'active\' LIMIT 1',session.founder_id);
  if(!account)throw new GVError('GV_RETURN_ACCOUNT_REQUIRED','Create your GalviCare return password before leaving for the prescribed program.',409,{next_action:'setup_return_credentials'});
  const checkout=clean(env[item.checkout_env]);if(!checkout)throw new GVError('GV_SYSTEME_CHECKOUT_NOT_CONFIGURED','The Systeme.io QA checkout URL for this prescribed treatment is not configured.',503,{required_setting:item.checkout_env});
  const fp=await hash('day7:commercial-order',{context_id:session.context_id,physician_event_id:physician.event_id,service_code:serviceCode,email:lower(session.email)}),ts=now(),orderId=newId('gco'),engagementId=newId('se');
  const required=item.completion;
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_studio_engagements(engagement_id,principal_id,bmr_id,source_treatment_plan_id,source_action_id,support_level,pillar_code,program_code,sprint_code,intervention_code,catalog_version,sprint_version,objective,entry_gate_json,required_evidence_json,expected_outcomes_json,assigned_actor_type,assigned_actor_id,status,version_no,client_request_id,request_fingerprint,correlation_id,created_at,updated_at) VALUES(?,?,NULL,NULL,?,'galvistudio','founder_development',?,?,?,'galvistudio_1_0_day7_commercial_v1','galvistudio_1_0_sprints_v1',?,?,?,?,?,'active',1,?,?,?,?,?)`).bind(engagementId,session.founder_id,physician.event_id,serviceCode,serviceCode,serviceCode,`Complete the Business Physician prescribed ${item.name} and return verified outcome evidence to GalviVault.`,JSON.stringify({source:'business_physician_plan',context_id:session.context_id}),JSON.stringify(required.map(x=>`systeme:${x}:completed`)),JSON.stringify(['provider-verified completion','customer return confirmation','Business Physician reassessment']),'studio_operator',null,`${key}.studio`,fp,ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_commercial_care_orders(order_id,principal_id,context_id,bmr_id,source_physician_event_id,source_treatment_plan_id,studio_engagement_id,persona_code,service_code,service_kind,provider,provider_offer_key,provider_sale_id,purchaser_email_normalized,amount_cents,currency,required_completion_keys_json,completed_completion_keys_json,status,paid_at,completed_at,customer_confirmed_at,client_request_id,request_fingerprint,correlation_id,created_at,updated_at) VALUES(?,?,?,NULL,?,NULL,?,'A',?,?, 'systeme',?,NULL,?,NULL,NULL,?,'[]','checkout_started',NULL,NULL,NULL,?,?,?,?,?)`).bind(orderId,session.founder_id,session.context_id,physician.event_id,engagementId,serviceCode,item.kind,clean(env[item.offer_env])||null,lower(session.email),JSON.stringify(required),key,fp,ctx.correlation,ts,ts)
  ]);
  return{order:await first(env.DB,'SELECT * FROM gv1_commercial_care_orders WHERE order_id=?',orderId),checkout_url:checkout,idempotent_replay:false,return_url:clean(env.GALVICARE_CUSTOMER_URL)||null};
}

function safeProviderEvent(payload){
  const type=clean(payload?.type),data=payload?.data||{},customer=data.customer||{},contact=data.contact||{},course=data.course||{},order=data.order||{},price=data.offer_price_plan||{};
  return{type,email:lower(customer.email||contact.email),provider_contact_id:String(customer.contact_id||contact.id||''),order_id:String(order.id||''),offer_price_plan_id:String(price.id||''),course_id:String(course.id||''),course_name:clean(course.name),amount:Number.isFinite(Number(price.direct_charge_amount))?Number(price.direct_charge_amount):null,currency:lower(price.currency),created_at:clean(payload?.created_at)};
}
function eventKey(payload,safe,completionKey){return clean(payload?.id)||`${safe.type}:${safe.order_id||safe.provider_contact_id}:${completionKey||safe.course_id||safe.created_at}`}
function validSystemeRequest(request,env,pathToken){
  const configured=clean(env.SYSTEME_WEBHOOK_TOKEN);if(!configured||pathToken!==configured)throw new GVError('GV_SYSTEME_WEBHOOK_AUTH','Systeme.io webhook authorization failed.',401);
  const enforce=lower(env.SYSTEME_ENFORCE_IP_ALLOWLIST||'true')!=='false';const ip=clean(request.headers.get('CF-Connecting-IP'));
  if(enforce&&ip&&!SYSTEME_IPS.has(ip))throw new GVError('GV_SYSTEME_WEBHOOK_SOURCE','Systeme.io webhook source is not allowlisted.',403);
}
async function resolveSystemeOrder(env,safe,completionKey=''){
  let rows=[];
  if(safe.order_id)rows=await all(env.DB,"SELECT * FROM gv1_commercial_care_orders WHERE provider='systeme' AND provider_sale_id=?",safe.order_id);
  if(!rows.length&&safe.email)rows=await all(env.DB,"SELECT * FROM gv1_commercial_care_orders WHERE provider='systeme' AND purchaser_email_normalized=? AND status NOT IN ('fulfilled','refunded','canceled') ORDER BY created_at DESC",safe.email);
  if(completionKey)rows=rows.filter(r=>arr(parse(r.required_completion_keys_json,[])).includes(completionKey));
  if(rows.length!==1)throw new GVError('GV_SYSTEME_ORDER_AMBIGUOUS','Systeme.io event could not be matched to exactly one canonical treatment order.',409,{matches:rows.length,email:safe.email,completion_key:completionKey||null});
  return rows[0];
}

export async function ingestSystemeEvent(env,ctx,request,pathToken,eventType,completionKey=''){
  validSystemeRequest(request,env,pathToken);const raw=await request.text();if(raw.length>64000)throw new GVError('GV_REQ_BODY_TOO_LARGE','Webhook payload is too large.',413);
  let payload={};try{payload=JSON.parse(raw)}catch{throw new GVError('GV_REQ_BODY_INVALID','Systeme.io webhook requires JSON.',400)}
  const safe=safeProviderEvent(payload),expected=eventType==='new_sale'?'customer.sale.completed':eventType==='course_completed'?'contact.course.completed':'customer.sale.canceled';
  if(safe.type&&safe.type!==expected&&!(eventType==='course_completed'&&/course.*completed/i.test(safe.type)))throw new GVError('GV_SYSTEME_EVENT_TYPE','Unexpected Systeme.io event type.',422,{expected,received:safe.type});
  const pkey=eventKey(payload,safe,completionKey),fp=await hash('day7:systeme-event',{eventType,pkey,safe,completionKey}),existing=await first(env.DB,'SELECT integration_event_id,order_id,processing_status FROM gv1_systeme_integration_events WHERE provider_event_key=?',pkey);
  if(existing)return{event:existing,idempotent_replay:true};
  let order;try{order=await resolveSystemeOrder(env,safe,completionKey);}catch(error){const ts=now();await env.DB.prepare(`INSERT INTO gv1_systeme_integration_events(integration_event_id,provider_event_key,event_type,order_id,contact_email_normalized,completion_key,request_fingerprint,safe_payload_json,processing_status,failure_code,correlation_id,received_at,processed_at) VALUES(?,?,?,NULL,?,?,?,?,?,'quarantined',?,?,?,?)`).bind(newId('sie'),pkey,eventType,safe.email||null,completionKey||null,fp,JSON.stringify(safe),'GV_SYSTEME_ORDER_AMBIGUOUS',ctx.correlation,ts,ts).run();throw error;}
  const ts=now(),eventId=newId('sie'),stmts=[];
  if(eventType==='new_sale'){
    const providerSale=safe.order_id||pkey;stmts.push(env.DB.prepare(`UPDATE gv1_commercial_care_orders SET provider_sale_id=COALESCE(provider_sale_id,?),amount_cents=COALESCE(?,amount_cents),currency=COALESCE(?,currency),status='paid',paid_at=COALESCE(paid_at,?),updated_at=? WHERE order_id=? AND status IN ('proposed','checkout_started','paid','enrolled')`).bind(providerSale,safe.amount,safe.currency||null,ts,ts,order.order_id));
  }else if(eventType==='course_completed'){
    if(!order.paid_at&&!['paid','enrolled','course_completed','customer_confirmed','fulfilled'].includes(order.status))throw new GVError('GV_TREATMENT_PAYMENT_REQUIRED','Course completion cannot close care before server-verified payment.',409);
    const required=arr(parse(order.required_completion_keys_json,[])),done=new Set(arr(parse(order.completed_completion_keys_json,[])));done.add(completionKey);const complete=required.every(x=>done.has(x));
    stmts.push(env.DB.prepare(`UPDATE gv1_commercial_care_orders SET completed_completion_keys_json=?,status=?,completed_at=CASE WHEN ? THEN COALESCE(completed_at,?) ELSE completed_at END,updated_at=? WHERE order_id=?`).bind(JSON.stringify([...done]),complete?'course_completed':'enrolled',complete?1:0,ts,ts,order.order_id));
    const artifactId=newId('sar');stmts.push(env.DB.prepare(`INSERT INTO gv1_studio_artifact_refs(artifact_ref_id,engagement_id,evidence_id,artifact_type,artifact_ref,provenance_json,validation_status,actor_type,actor_id,client_request_id,request_fingerprint,correlation_id,created_at) VALUES(?,?,NULL,'systeme_course_completion',?,?, 'validated','systeme','systeme.io',?,?,?,?,?)`).bind(artifactId,order.studio_engagement_id,`systeme:${completionKey}:completed`,JSON.stringify({provider:'systeme',course_id:safe.course_id,course_name:safe.course_name,completion_key:completionKey,provider_event_key:pkey}),`systeme.${pkey}`,fp,ctx.correlation,ts));
    if(complete){const outcomeId=newId('so');stmts.push(env.DB.prepare(`INSERT INTO gv1_studio_outcomes(studio_outcome_id,engagement_id,source_gate_id,objective,evidence_refs_json,outcome_payload_json,status,reassessment_required,actor_type,actor_id,version_no,client_request_id,request_fingerprint,correlation_id,recorded_at,created_at) VALUES(?,?,NULL,?, ?,?,'validated',1,'systeme','systeme.io',1,?,?,?,?,?)`).bind(outcomeId,order.studio_engagement_id,`Provider-verified completion of ${order.service_code}.`,JSON.stringify([artifactId]),JSON.stringify({order_id:order.order_id,required_completion_keys:required,completed_completion_keys:[...done]}),`systeme.outcome.${pkey}`,fp,ctx.correlation,ts,ts));stmts.push(env.DB.prepare(`INSERT OR IGNORE INTO gv1_care_reassessment_queue(queue_id,principal_id,context_id,bmr_id,order_id,status,reason_code,source_completion_ref,physician_decision_json,correlation_id,created_at,customer_confirmed_at,reviewed_at) VALUES(?,?,?,?,?,'awaiting_customer_return','provider_verified_treatment_completion',?,NULL,?,?,NULL,NULL)`).bind(newId('crq'),order.principal_id,order.context_id,order.bmr_id,order.order_id,outcomeId,ctx.correlation,ts));}
  }else{stmts.push(env.DB.prepare("UPDATE gv1_commercial_care_orders SET status='refunded',updated_at=? WHERE order_id=?").bind(ts,order.order_id));}
  stmts.push(env.DB.prepare(`INSERT INTO gv1_systeme_integration_events(integration_event_id,provider_event_key,event_type,order_id,contact_email_normalized,completion_key,request_fingerprint,safe_payload_json,processing_status,failure_code,correlation_id,received_at,processed_at) VALUES(?,?,?,?,?,?,?,?,'processed',NULL,?,?,?)`).bind(eventId,pkey,eventType,order.order_id,safe.email||null,completionKey||null,fp,JSON.stringify(safe),ctx.correlation,ts,ts));
  await env.DB.batch(stmts);return{event:{integration_event_id:eventId,order_id:order.order_id,event_type:eventType,processing_status:'processed'},idempotent_replay:false};
}

export async function preFounderCommercialState(env,request,contextId){
  const session=await requirePreFounderSession(request,env,contextId),order=await latestOrder(env.DB,session.context_id),snapshot=await first(env.DB,"SELECT founder_snapshot_id,snapshot_json,lifecycle_assessment_json,generation_source,validation_status,version_no,created_at FROM gv1_founder_snapshots WHERE principal_id=? AND validation_status IN ('accepted','needs_review') ORDER BY version_no DESC,created_at DESC LIMIT 1",session.founder_id);
  if(!order)return{order:null,founder_snapshot:snapshot?{...snapshot,snapshot:parse(snapshot.snapshot_json,{}),lifecycle_assessment:parse(snapshot.lifecycle_assessment_json,{})}:null,next_action:'await_treatment_order'};
  const queue=await first(env.DB,'SELECT queue_id,status,reason_code,created_at,customer_confirmed_at FROM gv1_care_reassessment_queue WHERE order_id=?',order.order_id);
  const item=CARE_CATALOG[order.service_code]||{};
  const next=order.status==='checkout_started'?'complete_payment':['paid','enrolled'].includes(order.status)?'complete_prescribed_course':order.status==='course_completed'?'confirm_treatment_completion':order.status==='customer_confirmed'?'await_business_physician_reassessment':order.status==='fulfilled'?'treatment_closed':order.status;
  return{order:{...order,required_completion_keys:parse(order.required_completion_keys_json,[]),completed_completion_keys:parse(order.completed_completion_keys_json,[])},queue,checkout_url:clean(env[item.checkout_env])||null,founder_snapshot:snapshot?{...snapshot,snapshot:parse(snapshot.snapshot_json,{}),lifecycle_assessment:parse(snapshot.lifecycle_assessment_json,{})}:null,next_action:next,manual_repair:'NO'};
}

export async function confirmTreatmentCompletion(env,ctx,request,key,input){
  const session=await requirePreFounderSession(request,env,clean(input.context_id)),order=await latestOrder(env.DB,session.context_id);
  if(!order||order.status!=='course_completed')throw new GVError('GV_PROVIDER_COMPLETION_REQUIRED','Systeme.io must verify completion before the customer can record treatment completion in GalviCare.',409);
  const fp=await hash('day7:customer-treatment-confirmation',{order_id:order.order_id,principal_id:session.founder_id}),prior=await first(env.DB,'SELECT event_id FROM gv1_prefounder_care_events WHERE client_request_id=?',key);if(prior)return{order:await latestOrder(env.DB,session.context_id),idempotent_replay:true};
  const ts=now(),eventId=newId('pce');await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_prefounder_care_events(event_id,context_id,founder_id,event_type,product,payload_json,actor_type,actor_id,client_request_id,request_fingerprint,correlation_id,created_at) VALUES(?,?,?,'monitoring_checkin','GalviStudio',?,'customer',?,?,?,?,?)`).bind(eventId,session.context_id,session.founder_id,JSON.stringify({order_id:order.order_id,service_code:order.service_code,provider_verified:true,completion_recorded:true}),session.founder_id,key,fp,ctx.correlation,ts),
    env.DB.prepare("UPDATE gv1_commercial_care_orders SET status='customer_confirmed',customer_confirmed_at=?,updated_at=? WHERE order_id=?").bind(ts,ts,order.order_id),
    env.DB.prepare("UPDATE gv1_care_reassessment_queue SET status='pending',customer_confirmed_at=? WHERE order_id=? AND status='awaiting_customer_return'").bind(ts,order.order_id)
  ]);return{order:await latestOrder(env.DB,session.context_id),queue:await first(env.DB,'SELECT * FROM gv1_care_reassessment_queue WHERE order_id=?',order.order_id),idempotent_replay:false};
}

export async function requireTreatmentCompletionBeforeMonitoring(env,request,input){
  if(!['monitoring_checkin','reassessment_requested'].includes(clean(input?.event_type)))return;
  const session=await requirePreFounderSession(request,env,clean(input.context_id)),plan=await first(env.DB,"SELECT event_id FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='physician_plan' ORDER BY created_at DESC LIMIT 1",session.context_id);if(!plan)return;
  const order=await latestOrder(env.DB,session.context_id);if(!order||!['customer_confirmed','fulfilled'].includes(order.status))throw new GVError('GV_TREATMENT_COMPLETION_REQUIRED','Complete the prescribed treatment and record provider-verified completion before post-treatment monitoring or reassessment.',409,{next_action:!order?'enroll_in_prescribed_treatment':order.status==='checkout_started'?'complete_payment':['paid','enrolled'].includes(order.status)?'complete_systeme_course':'confirm_treatment_completion'});
}

function founderShotSchema(){return{type:'object',additionalProperties:false,required:['founder_snapshot','lifecycle_assessment'],properties:{founder_snapshot:{type:'object',additionalProperties:false,required:['founder_archetype','founder_identity','current_founder_stage','founder_performance_trajectory','current_founder_transition','long_term_founder_potential','founder_performance_genome','founder_story','recommended_next_step'],properties:{founder_archetype:{type:'string'},founder_identity:{type:'string'},current_founder_stage:{type:'string'},founder_performance_trajectory:{type:'string'},current_founder_transition:{type:'string'},long_term_founder_potential:{type:'string'},founder_performance_genome:{type:'object',additionalProperties:false,required:['founder_identity','primary_motivation','decision_style','leadership_style','learning_style','communication_style','risk_orientation','founder_energy','greatest_untapped_asset'],properties:{founder_identity:{type:'string'},primary_motivation:{type:'string'},decision_style:{type:'string'},leadership_style:{type:'string'},learning_style:{type:'string'},communication_style:{type:'string'},risk_orientation:{type:'string'},founder_energy:{type:'string'},greatest_untapped_asset:{type:'string'}}},founder_story:{type:'string'},recommended_next_step:{type:'string'}}},lifecycle_assessment:{type:'object',additionalProperties:false,required:['classification','confidence','supporting_evidence_refs','missing_evidence','rationale','recommended_action'],properties:{classification:{type:'string',enum:['pre_founder','operating_founder','uncertain']},confidence:{type:'integer',minimum:0,maximum:100},supporting_evidence_refs:{type:'array',items:{type:'string'},maxItems:12},missing_evidence:{type:'array',items:{type:'string'},maxItems:10},rationale:{type:'string'},recommended_action:{type:'string'}}}}};}
function extractOutput(payload){if(typeof payload?.output_text==='string'&&payload.output_text.trim())return payload.output_text.trim();for(const item of payload?.output||[])for(const part of item?.content||[])if((part?.type==='output_text'||part?.type==='text')&&clean(part?.text))return clean(part.text);return''}
async function founderEvidence(env,context){
  const results=await all(env.DB,"SELECT result_id,result_type,score_type,payload_json,created_at FROM gv1_day2_intake_results WHERE context_id=? ORDER BY created_at DESC LIMIT 12",context.context_id);
  let evidence=[];if(context.bmr_id)evidence=await all(env.DB,"SELECT evidence_id,evidence_type AS category,source_product AS source_type,content_json AS payload_json,created_at FROM gv1_evidence_items WHERE bmr_id=? ORDER BY created_at DESC LIMIT 30",context.bmr_id);else evidence=await all(env.DB,"SELECT evidence_id,category,source_type,payload_json,created_at FROM gv1_principal_evidence_items WHERE founder_id=? AND status='accepted' ORDER BY created_at DESC LIMIT 30",context.founder_id);
  return{results:results.map(x=>({...x,payload:parse(x.payload_json,{})})),evidence:evidence.map(x=>({...x,payload:parse(x.payload_json,{})}))};
}
export async function generateFounderShot(env,ctx,contextId,actor){
  const context=await first(env.DB,`SELECT c.*,f.first_name,f.last_name,f.email,v.venture_name FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id LEFT JOIN gv1_ventures v ON v.venture_id=c.venture_id WHERE c.context_id=?`,contextId);if(!context)throw new GVError('GV_NOT_FOUND','Principal context was not found.',404);
  const bundle=await founderEvidence(env,context),refs=bundle.evidence.map(x=>x.evidence_id).concat(bundle.results.map(x=>x.result_id));
  const evidence={principal:{first_name:context.first_name,last_name:context.last_name},self_reported_venture_name:context.venture_name||null,current_record_mode:context.record_mode,current_lifecycle_state:context.lifecycle_state,rule:'A venture name or founder title alone is NOT evidence of an operating venture. Operating Founder requires evidence of an actually operating enterprise such as active customers/users, delivered product/service, revenue/transactions, recurring operating activity, or accountable operating team/process. If evidence is insufficient classify uncertain or pre_founder. Do not invent facts.',canonical_results:bundle.results,canonical_evidence:bundle.evidence};
  let proposal,generationSource='deterministic_fallback',provider=null,providerResponseId=null,model=null;
  const apiKey=clean(env[PROVIDER_SECRET]),enabled=lower(env.AI_ENABLED)==='true';
  if(enabled&&apiKey){
    model=clean(env.OPENAI_MODEL_QA||env.OPENAI_MODEL_PROD||'gpt-4.1-mini');const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.min(15000,Number(env.OPENAI_TIMEOUT_MS_QA||10000)));
    try{const response=await fetch(PROVIDER_URL,{method:'POST',signal:controller.signal,headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({model,store:false,max_output_tokens:1800,instructions:'You are GalviEngine producing FounderShot™, the Founder Snapshot section of GalviChart. Synthesize founder identity from only supplied evidence. Separately classify lifecycle evidence as pre_founder, operating_founder, or uncertain. A named venture, LLC, founder title, deck, prototype, idea, research project, or intention alone does not prove operating-founder status. Cite supplied evidence refs; state missing evidence. Never create, delete, or transition a BMR. The Business Physician governs lifecycle transitions.',input:JSON.stringify(evidence),text:{format:{type:'json_schema',name:'foundershot_snapshot',strict:true,schema:founderShotSchema()}}})});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error('provider');proposal=JSON.parse(extractOutput(payload));generationSource='openai_governed';provider='openai';providerResponseId=clean(payload.id)||null;model=clean(payload.model)||model;}catch{proposal=null}finally{clearTimeout(timer)}
  }
  if(!proposal){const named=Boolean(clean(context.venture_name));proposal={founder_snapshot:{founder_archetype:'Founder in Development',founder_identity:'Evidence-Building Founder',current_founder_stage:context.record_mode==='principal_only'?'Pre-Founder':'Founder Status Requires Review',founder_performance_trajectory:'Developing',current_founder_transition:'Evidence → Operating Readiness',long_term_founder_potential:'Evidence-dependent',founder_performance_genome:{founder_identity:'Evidence-Building Founder',primary_motivation:'Not yet sufficiently evidenced',decision_style:'Not yet sufficiently evidenced',leadership_style:'Not yet sufficiently evidenced',learning_style:'Not yet sufficiently evidenced',communication_style:'Not yet sufficiently evidenced',risk_orientation:'Not yet sufficiently evidenced',founder_energy:'Not yet sufficiently evidenced',greatest_untapped_asset:'Convert founder intent into operating evidence'},founder_story:'GalviCare has insufficient governed evidence for a richer FounderShot narrative. Continue gathering evidence rather than manufacturing certainty.',recommended_next_step:'Complete the prescribed GalviPath / Founder Development evidence-gathering pathway.'},lifecycle_assessment:{classification:context.record_mode==='principal_only'?'pre_founder':'uncertain',confidence:context.record_mode==='principal_only'?80:45,supporting_evidence_refs:refs.slice(0,12),missing_evidence:named?['verified customers/users','delivered product/service','revenue/transactions or repeat operating activity']:['venture formation evidence','verified customers/users','delivered product/service'],rationale:named?'A named venture is present, but a name alone does not prove an operating enterprise.':'No canonical operating venture is attached to this context.',recommended_action:'Business Physician lifecycle review before any canonical transition.'}};}
  const allowed=new Set(refs),invalid=(proposal.lifecycle_assessment?.supporting_evidence_refs||[]).filter(x=>!allowed.has(x));if(invalid.length)throw new GVError('GV_AI_EVIDENCE_SCOPE','FounderShot referenced evidence outside the authorized context.',409,{invalid_refs:invalid});
  const latest=await first(env.DB,'SELECT MAX(version_no) v FROM gv1_founder_snapshots WHERE principal_id=?',context.founder_id),version=Number(latest?.v||0)+1,ts=now(),snapshotId=newId('fshot'),classification=proposal.lifecycle_assessment.classification,confidence=Number(proposal.lifecycle_assessment.confidence||0),validation=classification==='uncertain'||confidence<70?'needs_review':'accepted';
  await env.DB.prepare(`INSERT INTO gv1_founder_snapshots(founder_snapshot_id,principal_id,context_id,bmr_id,snapshot_json,lifecycle_assessment_json,generation_source,provider,provider_response_id,model,prompt_version,schema_version,evidence_refs_json,validation_status,version_no,correlation_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(snapshotId,context.founder_id,context.context_id,context.bmr_id||null,JSON.stringify(proposal.founder_snapshot),JSON.stringify(proposal.lifecycle_assessment),generationSource,provider,providerResponseId,model,FOUNDER_SHOT_PROMPT,FOUNDER_SHOT_SCHEMA,JSON.stringify(refs),validation,version,ctx.correlation,ts,ts).run();
  const canonicalCurrent=context.record_mode==='principal_only'?'pre_founder':'operating_founder';let review=null;if(classification!==canonicalCurrent||validation==='needs_review'){const reviewId=newId('ltr');await env.DB.prepare(`INSERT INTO gv1_lifecycle_transition_reviews(review_id,principal_id,source_context_id,source_snapshot_id,from_lifecycle,proposed_lifecycle,confidence,rationale_json,status,venture_name,applied_context_id,applied_bmr_id,actor_type,actor_id,correlation_id,created_at,decided_at) VALUES(?,?,?,?,?,?,?,?,'proposed',?,NULL,NULL,?,?,?, ?,NULL)`).bind(reviewId,context.founder_id,context.context_id,snapshotId,canonicalCurrent,classification,confidence,JSON.stringify({rationale:proposal.lifecycle_assessment.rationale,supporting_evidence_refs:proposal.lifecycle_assessment.supporting_evidence_refs,missing_evidence:proposal.lifecycle_assessment.missing_evidence}),context.venture_name||null,actor?.role||'business_physician',actor?.id||'business_physician',ctx.correlation,ts).run();review={review_id:reviewId,status:'proposed'};}
  return{founder_snapshot_id:snapshotId,principal_id:context.founder_id,context_id:context.context_id,bmr_id:context.bmr_id||null,snapshot:proposal.founder_snapshot,lifecycle_assessment:proposal.lifecycle_assessment,generation_source:generationSource,validation_status:validation,version_no:version,lifecycle_review:review,manual_repair:'NO'};
}

export async function pendingReassessments(env){const rows=await all(env.DB,`SELECT q.queue_id,q.status,q.reason_code,q.created_at,q.customer_confirmed_at,q.order_id,o.context_id,o.bmr_id,o.principal_id,o.service_code,o.provider,o.completed_at,f.first_name,f.last_name,f.email FROM gv1_care_reassessment_queue q JOIN gv1_commercial_care_orders o ON o.order_id=q.order_id JOIN gv1_founders f ON f.founder_id=o.principal_id WHERE q.status='pending' ORDER BY q.customer_confirmed_at,q.created_at`);return{items:rows,manual_repair:'NO'}}
