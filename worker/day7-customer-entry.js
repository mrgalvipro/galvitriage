import day7Worker from './day7-entry.js';
import { GVError, context, failure, headers, requireRuntime, jsonBody, success, hash, newId } from './day5-common.js';
import { activateCustomerAccess, loginCustomerAccess, customerAccessReadiness } from './domain/day7-customer-access-service.js';

export const DAY7_CUSTOMER_ACCESS_RUNTIME='galvicare_1_0_returning_customer_access_v1';
const ACTIVATE='/api/v1/day7/customer-access/activate';
const LOGIN='/api/v1/day7/customer-access/login';
const READY='/api/v1/day7/customer-access/readiness';
const DAY4_CHART='/api/v1/day4/chart';
const CUSTOMER_SESSION_HEADER='X-Galvi-Day3-Session';
const SECURITY_AUDIT_HEADER='X-Galvi-Authorization-Audit';
const SAFE_ID=/^[A-Za-z0-9:._-]{3,180}$/;

function wrap(response){
  if(!response)return response;
  const h=new Headers(response.headers);h.set('X-Galvi-Day7-Customer-Access',DAY7_CUSTOMER_ACCESS_RUNTIME);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}

/*
 * Day 7 P0-13 / D1-18 release evidence bridge.
 *
 * Day 4 already fails closed when an authenticated customer session requests a
 * different principal-context: GV_AUTH_FORBIDDEN / HTTP 403. Day 7 additionally
 * requires the denied cross-record attempt itself to be auditable. Record only the
 * denied scope, a one-way session fingerprint and safe release metadata. Never store
 * the raw session credential or return target-record data to the browser.
 */
async function auditCrossRecordChartDenial(request,env,path,response){
  if(path!==DAY4_CHART||request.method!=='POST'||response?.status!==403||!env?.DB)return response;
  let result={};try{result=await response.clone().json()}catch{return response}
  if(result?.error?.code!=='GV_AUTH_FORBIDDEN')return response;
  let input={};try{input=await request.clone().json()}catch{return response}
  const requestedContextId=String(input?.context_id||'').trim();
  const sessionToken=String(request.headers.get(CUSTOMER_SESSION_HEADER)||'').trim();
  if(!SAFE_ID.test(requestedContextId)||!sessionToken)return response;

  const sessionFingerprint=await hash('day7:authorization-denial-session',sessionToken);
  const correlation=String(request.headers.get('X-Correlation-Id')||`d7auth-${crypto.randomUUID()}`).trim().slice(0,180);
  const timestamp=new Date().toISOString();
  const auditId=newId('aud');
  const safeChange={
    denied_scope:'principal_context',
    requested_context_id:requestedContextId,
    session_fingerprint:sessionFingerprint,
    error_code:'GV_AUTH_FORBIDDEN',
    target_data_returned:false,
    canonical_write_performed:false,
    manual_repair:'NO'
  };
  const h=new Headers(response.headers);
  try{
    await env.DB.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,'authorization_denial',?,'deny',NULL,NULL,'customer','day7-security','cross_record_denied',?,?,?,?,?)`)
      .bind(auditId,requestedContextId,JSON.stringify(safeChange),correlation,String(env.ENVIRONMENT||'qa'),timestamp,timestamp).run();
    h.set(SECURITY_AUDIT_HEADER,'recorded');
  }catch{
    // Preserve the original fail-closed 403. Audit failure must never turn a denied
    // cross-record request into target-data leakage or a successful request.
    h.set(SECURITY_AUDIT_HEADER,'failed');
  }
  h.set('X-Galvi-Day7-Security','p0-13-cross-record-denial-v1');
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}

export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
  if(!path.startsWith('/api/v1/day7/customer-access/')){
    const securityProbe=path===DAY4_CHART&&request.method==='POST'?request.clone():null;
    const response=await day7Worker.fetch(request,env,executionContext);
    return securityProbe?auditCrossRecordChartDenial(securityProbe,env,path,response):response;
  }
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin))throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers(ctx)});
    if(path===READY&&request.method==='GET')return wrap(success(ctx,await customerAccessReadiness(env),200,'ok',{manual_repair:'NO'}));
    if(path===ACTIVATE&&request.method==='POST'){
      const data=await activateCustomerAccess(env,ctx,await jsonBody(request));
      return wrap(success(ctx,data,201,'created',{manual_repair:'NO',customer_access:'invite_to_existing_bhr'}));
    }
    if(path===LOGIN&&request.method==='POST'){
      const data=await loginCustomerAccess(env,ctx,await jsonBody(request));
      return wrap(success(ctx,data,200,'ok',{manual_repair:'NO',customer_access:'physician_queue_only'}));
    }
    throw new GVError('GV_NOT_FOUND','Returning-customer access route was not found.',404);
  }catch(error){return wrap(failure(ctx,error));}
}};
