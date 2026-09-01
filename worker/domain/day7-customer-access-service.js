import { GVError, clean, hash, newId, now, requireId } from '../day5-common.js';

const INVITE_SCOPE='day7:customer-access:invite';
const SESSION_SCOPE='day7:customer-access:session';
const PASSWORD_ITERATIONS=210000;
const INVITE_TTL_MS=24*60*60*1000;
const SESSION_TTL_MS=12*60*60*1000;
const MAX_FAILED_ATTEMPTS=5;
const LOCK_MS=15*60*1000;
const PRODUCT='business_health_membership';
const MEMBER_ALIASES=new Set(['business_health_membership','business_health_membership_beta','business-health-membership']);

const first=(db,sql,...params)=>db.prepare(sql).bind(...params).first();
const all=async(db,sql,...params)=>(await db.prepare(sql).bind(...params).all())?.results||[];
const lower=v=>clean(v).toLowerCase();
const isoAfter=ms=>new Date(Date.now()+ms).toISOString();
const randomToken=prefix=>`${prefix}${crypto.randomUUID().replaceAll('-','')}${crypto.randomUUID().replaceAll('-','')}`;
const bytesToB64url=bytes=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const b64urlToBytes=value=>{const raw=clean(value).replaceAll('-','+').replaceAll('_','/');const padded=raw+'='.repeat((4-raw.length%4)%4);return Uint8Array.from(atob(padded),c=>c.charCodeAt(0));};
const safeEqual=(a,b)=>{if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;};

async function passwordDigest(password,salt,iterations=PASSWORD_ITERATIONS){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations},key,256);
  return new Uint8Array(bits);
}
async function encodePassword(password){
  const value=clean(password);
  if(value.length<12||value.length>128)throw new GVError('GV_CUSTOMER_PASSWORD_POLICY','Password must be between 12 and 128 characters.',422);
  const salt=crypto.getRandomValues(new Uint8Array(24));
  const digest=await passwordDigest(value,salt);
  return {salt:bytesToB64url(salt),digest:bytesToB64url(digest),iterations:PASSWORD_ITERATIONS};
}
async function verifyPassword(password,row){
  const supplied=clean(password);if(!supplied)return false;
  let salt,stored;try{salt=b64urlToBytes(row.password_salt);stored=b64urlToBytes(row.password_hash);}catch{return false;}
  const digest=await passwordDigest(supplied,salt,Number(row.password_iterations)||PASSWORD_ITERATIONS);
  return safeEqual(digest,stored);
}
function audit(db,ctx,actorType,entityType,entityId,operation,change,reasonCode){
  const ts=now();
  return db.prepare(`INSERT INTO gv1_audit_log
    (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
    VALUES (?,?,?,?,NULL,NULL,?,'day7-customer-access',?,?,?,?,?,?)`)
    .bind(newId('aud'),entityType,entityId,operation,actorType,reasonCode||null,JSON.stringify(change||{}),ctx.correlation,ctx.environment,ts,ts);
}
async function canonicalForBmr(db,bmrId){
  const row=await first(db,`SELECT b.bmr_id,b.venture_id,b.status,v.venture_name,f.founder_id,f.email,f.first_name,f.last_name
    FROM gv1_business_medical_records b
    JOIN gv1_ventures v ON v.venture_id=b.venture_id
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
    JOIN gv1_founders f ON f.founder_id=r.founder_id
    WHERE b.bmr_id=? ORDER BY r.is_primary DESC,r.created_at ASC LIMIT 1`,requireId('bmr_id',bmrId));
  if(!row?.founder_id)throw new GVError('GV_LINEAGE_REQUIRED','Returning access requires one canonical principal and Business Health Record.',409);
  return row;
}
async function activePlan(db,bmrId){return first(db,`SELECT treatment_plan_id FROM gv1_treatment_plans WHERE bmr_id=? AND status='active' ORDER BY updated_at DESC,created_at DESC LIMIT 1`,bmrId);}
async function offerId(principalId,bmrId,planId){const fp=await hash('day7:membership:offer-id',{principal_id:principalId,bmr_id:bmrId,treatment_plan_id:planId,membership_type:'business_health_beta'});return `moffer_${fp.slice(0,32)}`;}
async function queueStateForBmr(db,bmrId){
  const canonical=await canonicalForBmr(db,bmrId),plan=await activePlan(db,bmrId);
  const active=await first(db,`SELECT membership_id,status,treatment_plan_id FROM gv1_memberships WHERE bmr_id=? AND status='active' ORDER BY created_at DESC LIMIT 1`,bmrId);
  if(active)return {eligible:true,reason:'active_membership',source_entity_id:active.membership_id,canonical,plan};
  const pending=await first(db,`SELECT q.queue_id,q.treatment_plan_id FROM gv1_membership_reassessment_queue q WHERE q.bmr_id=? AND q.status='pending' ORDER BY q.created_at DESC LIMIT 1`,bmrId);
  if(pending)return {eligible:true,reason:'membership_reassessment',source_entity_id:pending.queue_id,canonical,plan};
  if(!plan)return {eligible:false,reason:'no_physician_queue',canonical,plan:null};
  const oid=await offerId(canonical.founder_id,bmrId,plan.treatment_plan_id);
  const recommended=await first(db,`SELECT audit_id,occurred_at FROM gv1_audit_log WHERE entity_type='membership_offer' AND entity_id=? AND operation='membership_recommended' ORDER BY occurred_at DESC LIMIT 1`,oid);
  if(recommended)return {eligible:true,reason:'membership_recommended',source_entity_id:oid,canonical,plan};
  return {eligible:false,reason:'no_physician_queue',canonical,plan};
}
async function legacySessionFor(db,canonical){
  let row=await first(db,`SELECT v.session_id FROM ventures v JOIN founders f ON f.founder_id=v.founder_id
    WHERE lower(f.email)=? AND lower(trim(v.venture_name))=lower(trim(?)) ORDER BY v.updated_at DESC,v.created_at DESC LIMIT 1`,lower(canonical.email),clean(canonical.venture_name));
  if(!row?.session_id)row=await first(db,`SELECT session_id FROM founders WHERE lower(email)=? ORDER BY updated_at DESC LIMIT 1`,lower(canonical.email));
  const sessionId=clean(row?.session_id);
  if(!/^gt_[A-Za-z0-9_-]{5,92}$/.test(sessionId))throw new GVError('GV_CUSTOMER_SESSION_LINEAGE_MISSING','The existing GalviCare session for this Business Health Record could not be resolved.',409);
  const activated=await first(db,`SELECT 1 AS ok FROM entitlements WHERE session_id=? AND product='GalviShot' AND lower(entitlement_status) IN ('active','paid','granted','test_override') LIMIT 1`,sessionId)
    ||await first(db,`SELECT 1 AS ok FROM payments WHERE session_id=? AND product='GalviShot' AND lower(payment_status) IN ('paid','succeeded','complete') LIMIT 1`,sessionId);
  if(!activated)throw new GVError('GV_CUSTOMER_CHART_NOT_ACTIVATED','GalviChart returning access requires a server-verified GalviShot entitlement.',409);
  return sessionId;
}
async function eligibleRecordsForPrincipal(db,principalId){
  const rows=await all(db,`SELECT DISTINCT c.bmr_id FROM gv1_principal_contexts c WHERE c.founder_id=? AND c.status='active' AND c.bmr_id IS NOT NULL`,principalId);
  const eligible=[];for(const row of rows){const state=await queueStateForBmr(db,row.bmr_id);if(state.eligible)eligible.push(state);}return eligible;
}
async function activationAccountState(db,invite,canonical,password){
  const email=lower(canonical.email);
  let account=await first(db,`SELECT * FROM gv1_customer_accounts WHERE principal_id=? LIMIT 1`,invite.principal_id);
  if(account)return {account,created:false,insert:null};
  const emailOwner=await first(db,`SELECT * FROM gv1_customer_accounts WHERE email_normalized=? LIMIT 1`,email);
  if(emailOwner){
    if(emailOwner.principal_id!==invite.principal_id)throw new GVError('GV_CUSTOMER_ACCOUNT_IDENTITY_CONFLICT','This GalviCare login is linked to a different canonical principal. Contact GalviCare support.',409);
    return {account:emailOwner,created:false,insert:null};
  }
  const encoded=await encodePassword(password),accountId=newId('gca'),ts=now();
  account={account_id:accountId,principal_id:invite.principal_id,email_normalized:email,status:'active'};
  const insert=db.prepare(`INSERT INTO gv1_customer_accounts(account_id,principal_id,email_normalized,password_salt,password_hash,password_iterations,password_version,status,failed_attempts,locked_until,last_login_at,created_at,updated_at) VALUES(?,?,?,?,?,?,1,'active',0,NULL,NULL,?,?)`).bind(accountId,invite.principal_id,email,encoded.salt,encoded.digest,encoded.iterations,ts,ts);
  return {account,created:true,insert};
}
async function prepareSession(env,ctx,account,queue){
  const raw=randomToken('gvs1_'),sessionHash=await hash(SESSION_SCOPE,raw),ts=now(),expires=isoAfter(SESSION_TTL_MS),legacySessionId=await legacySessionFor(env.DB,queue.canonical);
  return {
    insert:env.DB.prepare(`INSERT INTO gv1_customer_login_sessions(session_hash,account_id,principal_id,bmr_id,legacy_session_id,expires_at,revoked_at,created_at,last_used_at) VALUES(?,?,?,?,?,?,NULL,?,?)`).bind(sessionHash,account.account_id,account.principal_id,queue.canonical.bmr_id,legacySessionId,expires,ts,ts),
    audit:audit(env.DB,ctx,'customer','customer_account',account.account_id,'login_session_issued',{bmr_id:queue.canonical.bmr_id,queue_reason:queue.reason,manual_repair:'NO'},'business_physician_queue_access'),
    data:{access_token:raw,expires_at:expires,legacy_session_id:legacySessionId,principal_id:account.principal_id,bmr_id:queue.canonical.bmr_id,queue_reason:queue.reason,galvichart_open_allowed:true,manual_repair:'NO'}
  };
}
async function issueSession(env,ctx,account,queue){
  const state=await prepareSession(env,ctx,account,queue);
  try{await env.DB.batch([state.insert,state.audit]);}
  catch(error){
    if(error instanceof GVError)throw error;
    throw new GVError('GV_CUSTOMER_SESSION_WRITE_FAILED','Secure GalviCare access could not be established. Please retry.',503,{stage:'login_session',manual_repair:'NO'},true);
  }
  return state.data;
}
function customerUrl(env,token){
  const base=clean(env.GALVICARE_CUSTOMER_URL)||'https://galvicare-0-5-qa.mrgalvipro.workers.dev/#galvitriage';
  const split=base.split('#')[0],fragment=(base.includes('#')?base.split('#').slice(1).join('#'):'galvitriage').replace(/^#/,'');
  return `${split}#${fragment||'galvitriage'}&galviaccess=${encodeURIComponent(token)}`;
}
async function hubSpotNotification(env,email,activationUrl){
  const token=clean(env.HUBSPOT_PRIVATE_APP_TOKEN),emailId=clean(env.HUBSPOT_TRANSACTIONAL_EMAIL_ID);
  if(!token||!emailId)return {attempted:false,status:'skipped_not_configured'};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
  try{
    const response=await fetch('https://api.hubapi.com/marketing/v3/transactional/single-email/send',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({emailId:Number(emailId)||emailId,message:{to:email},customProperties:{galvicare_update_url:activationUrl,galvicare_update_type:'Business Physician GalviChart update'}})});
    return {attempted:true,status:response.ok?'delivered':'failed',provider_status:response.status};
  }catch(error){return {attempted:true,status:error?.name==='AbortError'?'timeout':'failed'};}finally{clearTimeout(timer);}
}

export async function issueCustomerAccessInvite(env,ctx,identity,bmrId,key){
  if(identity?.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required to issue customer record access.',403);
  const queue=await queueStateForBmr(env.DB,bmrId);if(!queue.eligible)throw new GVError('GV_CUSTOMER_ACCESS_NOT_QUEUED','Customer GalviChart access opens only when Business Physician care is waiting or Continuous Care is active.',409);
  const legacySessionId=await legacySessionFor(env.DB,queue.canonical),fp=await hash(INVITE_SCOPE,{principal_id:queue.canonical.founder_id,bmr_id:queue.canonical.bmr_id,source_entity_id:queue.source_entity_id});
  const receipt=await first(env.DB,`SELECT request_fingerprint FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=? LIMIT 1`,INVITE_SCOPE,key);
  if(receipt&&receipt.request_fingerprint!==fp)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused for different customer access.',409);
  if(receipt)throw new GVError('GV_CUSTOMER_ACCESS_LINK_ALREADY_ISSUED','This access-link request was already completed. Generate a fresh link if the original was not captured.',409);
  const raw=randomToken('gva1_'),inviteHash=await hash(INVITE_SCOPE,raw),ts=now(),expires=isoAfter(INVITE_TTL_MS),activationUrl=customerUrl(env,raw);
  await env.DB.batch([
    env.DB.prepare(`UPDATE gv1_customer_login_invites SET revoked_at=? WHERE principal_id=? AND bmr_id=? AND consumed_at IS NULL AND revoked_at IS NULL`).bind(ts,queue.canonical.founder_id,queue.canonical.bmr_id),
    env.DB.prepare(`INSERT INTO gv1_customer_login_invites(invite_hash,principal_id,bmr_id,legacy_session_id,source_type,source_entity_id,client_request_id,created_by_actor_type,created_by_actor_id,expires_at,consumed_at,revoked_at,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,NULL,NULL,?)`).bind(inviteHash,queue.canonical.founder_id,queue.canonical.bmr_id,legacySessionId,PRODUCT,queue.source_entity_id,key,'business_physician',identity.operator_id,expires,ts),
    env.DB.prepare(`INSERT INTO gv1_idempotency_keys(idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at) VALUES(?,?,?,?,201,'customer_access_invite',?,?)`).bind(newId('idem'),INVITE_SCOPE,key,fp,inviteHash,ts),
    audit(env.DB,ctx,'business_physician','customer_access_invite',inviteHash,'issue',{principal_id:queue.canonical.founder_id,bmr_id:queue.canonical.bmr_id,source_entity_id:queue.source_entity_id,queue_reason:queue.reason,manual_repair:'NO'},'galvichart_update_available')
  ]);
  const hubspot=await hubSpotNotification(env,queue.canonical.email,activationUrl);
  return {activation_url:activationUrl,expires_at:expires,email:queue.canonical.email.replace(/^(.).+(@.*)$/,'$1***$2'),bmr_id:queue.canonical.bmr_id,queue_reason:queue.reason,hubspot,manual_repair:'NO'};
}

export async function activateCustomerAccess(env,ctx,input){
  const raw=clean(input?.invite_token);if(!raw.startsWith('gva1_'))throw new GVError('GV_CUSTOMER_ACCESS_INVITE_INVALID','A valid GalviCare access invitation is required.',422);
  const inviteHash=await hash(INVITE_SCOPE,raw),invite=await first(env.DB,`SELECT * FROM gv1_customer_login_invites WHERE invite_hash=? LIMIT 1`,inviteHash);
  if(!invite||invite.revoked_at||invite.consumed_at||Date.parse(invite.expires_at)<=Date.now())throw new GVError('GV_CUSTOMER_ACCESS_INVITE_EXPIRED','This GalviCare access invitation is invalid or expired.',401);
  const queue=await queueStateForBmr(env.DB,invite.bmr_id);if(!queue.eligible||queue.canonical.founder_id!==invite.principal_id)throw new GVError('GV_CUSTOMER_ACCESS_NOT_QUEUED','No current Business Physician care item is available for this record.',403);
  const accountState=await activationAccountState(env.DB,invite,queue.canonical,input?.password),account=accountState.account;
  if(account.status==='disabled')throw new GVError('GV_CUSTOMER_ACCESS_DISABLED','This GalviCare account is disabled.',403);
  const sessionState=await prepareSession(env,ctx,account,queue),ts=now(),statements=[];
  if(accountState.insert)statements.push(accountState.insert);
  statements.push(
    env.DB.prepare(`UPDATE gv1_customer_login_invites SET consumed_at=? WHERE invite_hash=? AND consumed_at IS NULL`).bind(ts,inviteHash),
    env.DB.prepare(`UPDATE gv1_customer_accounts SET status='active',failed_attempts=0,locked_until=NULL,last_login_at=?,updated_at=? WHERE account_id=?`).bind(ts,ts,account.account_id),
    audit(env.DB,ctx,'customer','customer_account',account.account_id,'activate',{bmr_id:invite.bmr_id,account_created:accountState.created,manual_repair:'NO'},'galvichart_update_access'),
    sessionState.insert,
    sessionState.audit
  );
  try{await env.DB.batch(statements);}
  catch(error){
    if(error instanceof GVError)throw error;
    throw new GVError('GV_CUSTOMER_ACTIVATION_WRITE_FAILED','Secure GalviCare activation could not be completed. Please retry.',503,{stage:'activation_transaction',manual_repair:'NO'},true);
  }
  return {...sessionState.data,account_created:accountState.created};
}

export async function loginCustomerAccess(env,ctx,input){
  const email=lower(input?.email),password=clean(input?.password);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password)throw new GVError('GV_CUSTOMER_LOGIN_INVALID','Email and password are required.',422);
  const account=await first(env.DB,`SELECT * FROM gv1_customer_accounts WHERE email_normalized=? LIMIT 1`,email);
  if(!account)throw new GVError('GV_CUSTOMER_LOGIN_FAILED','Email or password is incorrect.',401);
  if(account.status==='disabled')throw new GVError('GV_CUSTOMER_ACCESS_DISABLED','This GalviCare account is disabled.',403);
  if(account.locked_until&&Date.parse(account.locked_until)>Date.now())throw new GVError('GV_CUSTOMER_LOGIN_LOCKED','Too many login attempts. Try again later.',429);
  const ok=await verifyPassword(password,account),ts=now();
  if(!ok){const attempts=Number(account.failed_attempts||0)+1,locked=attempts>=MAX_FAILED_ATTEMPTS?new Date(Date.now()+LOCK_MS).toISOString():null;await env.DB.prepare(`UPDATE gv1_customer_accounts SET failed_attempts=?,locked_until=?,status=?,updated_at=? WHERE account_id=?`).bind(attempts,locked,locked?'locked':'active',ts,account.account_id).run();throw new GVError('GV_CUSTOMER_LOGIN_FAILED','Email or password is incorrect.',401);}
  const eligible=await eligibleRecordsForPrincipal(env.DB,account.principal_id);
  if(eligible.length===0)throw new GVError('GV_CUSTOMER_ACCESS_NOT_QUEUED','There is no current Business Physician update waiting. Complete GalviTriage to begin a new care event.',403);
  if(eligible.length>1)throw new GVError('GV_CUSTOMER_ACCESS_AMBIGUOUS','More than one Business Health Record has an active care item. Contact GalviCare to select the correct record safely.',409);
  await env.DB.prepare(`UPDATE gv1_customer_accounts SET failed_attempts=0,locked_until=NULL,status='active',last_login_at=?,updated_at=? WHERE account_id=?`).bind(ts,ts,account.account_id).run();
  return issueSession(env,ctx,account,eligible[0]);
}

export async function customerAccessReadiness(env){
  const tables=await all(env.DB,`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('gv1_customer_accounts','gv1_customer_login_invites','gv1_customer_login_sessions') ORDER BY name`);
  return {ready:tables.length===3,password_storage:'pbkdf2_sha256_salted_hash_only',password_iterations:PASSWORD_ITERATIONS,queue_scope:'business_health_membership_release_critical',hubspot_transactional_email_configured:Boolean(clean(env.HUBSPOT_PRIVATE_APP_TOKEN)&&clean(env.HUBSPOT_TRANSACTIONAL_EMAIL_ID)),tables:tables.map(x=>x.name),manual_repair:'NO'};
}

export const CUSTOMER_ACCESS_HEADER='X-Galvi-Customer-Access';
export const CUSTOMER_ACCESS_PRODUCT_ALIASES=MEMBER_ALIASES;