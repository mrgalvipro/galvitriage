import day7Worker from './day7-entry.js';
import { GVError, context, failure, headers, requireRuntime, jsonBody, success, hash } from './day5-common.js';
import { activateCustomerAccess, loginCustomerAccess, customerAccessReadiness } from './domain/day7-customer-access-service.js';

export const DAY7_CUSTOMER_ACCESS_RUNTIME='galvicare_1_0_returning_customer_access_v2';
const ACTIVATE='/api/v1/day7/customer-access/activate';
const LOGIN='/api/v1/day7/customer-access/login';
const READY='/api/v1/day7/customer-access/readiness';
const INVITE_SCOPE='day7:customer-access:invite';

function wrap(response){
  if(!response)return response;
  const h=new Headers(response.headers);h.set('X-Galvi-Day7-Customer-Access',DAY7_CUSTOMER_ACCESS_RUNTIME);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}

/*
 * P0-15 returning-customer recovery.
 *
 * The clinician invitation is intentionally one-time. After the first successful
 * activation, gv1_customer_login_invites.consumed_at is set. A browser retry, a
 * previously-open tab, or a second click therefore reaches activateCustomerAccess
 * with the same valid token and receives GV_CUSTOMER_ACCESS_INVITE_EXPIRED / 401.
 * That was the Human E2E defect: the browser remained in invitation mode even though
 * the canonical customer account/password had already been established.
 *
 * Recover only the narrow consumed-invite case while the original invitation is
 * still unrevoked and unexpired. The consumed token is never sufficient by itself:
 * resolve only its canonical principal, then reuse loginCustomerAccess so the stored
 * password verifier, lockout, Business-Physician queue scope, canonical BHR selection,
 * session issuance and audit rules remain authoritative. Missing/revoked/expired
 * invitations keep the original fail-closed response. No D1 repair is performed.
 */
async function recoverConsumedInvite(env,ctx,input,originalError){
  if(originalError?.code!=='GV_CUSTOMER_ACCESS_INVITE_EXPIRED')throw originalError;
  const raw=String(input?.invite_token||'').trim();
  if(!raw.startsWith('gva1_'))throw originalError;
  const inviteHash=await hash(INVITE_SCOPE,raw);
  const invite=await env.DB.prepare(`SELECT principal_id,bmr_id,consumed_at,revoked_at,expires_at FROM gv1_customer_login_invites WHERE invite_hash=? LIMIT 1`).bind(inviteHash).first();
  if(!invite?.consumed_at||invite.revoked_at||!invite.expires_at||Date.parse(invite.expires_at)<=Date.now())throw originalError;
  const principal=await env.DB.prepare(`SELECT email FROM gv1_founders WHERE founder_id=? LIMIT 1`).bind(invite.principal_id).first();
  if(!principal?.email)throw originalError;
  const data=await loginCustomerAccess(env,ctx,{email:principal.email,password:input?.password});
  if(data?.principal_id!==invite.principal_id||data?.bmr_id!==invite.bmr_id){
    throw new GVError('GV_CUSTOMER_ACCESS_SCOPE_MISMATCH','The returning GalviCare record no longer matches this invitation. Contact GalviCare support.',409);
  }
  return {...data,activation_replay:true,manual_repair:'NO'};
}

export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
  if(!path.startsWith('/api/v1/day7/customer-access/'))return day7Worker.fetch(request,env,executionContext);
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin))throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers(ctx)});
    if(path===READY&&request.method==='GET')return wrap(success(ctx,await customerAccessReadiness(env),200,'ok',{manual_repair:'NO'}));
    if(path===ACTIVATE&&request.method==='POST'){
      const input=await jsonBody(request);
      let data,recovered=false;
      try{data=await activateCustomerAccess(env,ctx,input);}
      catch(error){data=await recoverConsumedInvite(env,ctx,input,error);recovered=true;}
      return wrap(success(ctx,data,recovered?200:201,recovered?'ok':'created',{manual_repair:'NO',customer_access:recovered?'consumed_invite_authenticated_recovery':'invite_to_existing_bhr',activation_replay:recovered}));
    }
    if(path===LOGIN&&request.method==='POST'){
      const data=await loginCustomerAccess(env,ctx,await jsonBody(request));
      return wrap(success(ctx,data,200,'ok',{manual_repair:'NO',customer_access:'physician_queue_only'}));
    }
    throw new GVError('GV_NOT_FOUND','Returning-customer access route was not found.',404);
  }catch(error){return wrap(failure(ctx,error));}
}};
