import day8Day6Worker from './day8-day6-entry.js';
import { GVError, context, failure, headers, idempotencyKey, requireRuntime, success } from './day5-common.js';
import { requireClinicianIdentity } from './auth/operator-identity.js';
import { issueCustomerAccessInvite, customerAccessReadiness } from './domain/day7-customer-access-service.js';

export const DAY7_CLINICIAN_CUSTOMER_ACCESS_RUNTIME='galvivault_day8_day7_customer_access_v1';
const invitePattern=/^\/api\/v1\/day7\/clinician\/business-medical-records\/([^/]+)\/customer-access-invite$/;
const readyPath='/api/v1/day7/clinician/customer-access-readiness';

function wrap(response){const h=new Headers(response.headers);h.set('X-Galvi-Day7-Customer-Access',DAY7_CLINICIAN_CUSTOMER_ACCESS_RUNTIME);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
async function injectClinicianAsset(response,path){
  if(response.status!==200||!['/','/index.html'].includes(path))return response;
  const type=String(response.headers.get('Content-Type')||'').toLowerCase();if(!type.includes('text/html'))return response;
  const html=await response.text();if(html.includes('day7-customer-access.js'))return new Response(html,{status:response.status,headers:response.headers});
  const next=html.replace('</body>','<script src="./day7-customer-access.js"></script></body>');
  const h=new Headers(response.headers);h.delete('Content-Length');h.set('Cache-Control','no-store');h.set('X-Galvi-Day7-Customer-Access',DAY7_CLINICIAN_CUSTOMER_ACCESS_RUNTIME);
  return new Response(next,{status:response.status,statusText:response.statusText,headers:h});
}

export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/',match=path.match(invitePattern);
  if(!match&&path!==readyPath){const delegated=await day8Day6Worker.fetch(request,env,executionContext);return injectClinicianAsset(delegated,path);}
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&ctx.origin!==url.origin&&!ctx.allowedOrigins.includes(ctx.origin))throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:headers(ctx)});
    const identity=await requireClinicianIdentity(request,env);
    if(identity.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
    if(path===readyPath&&request.method==='GET')return wrap(success(ctx,await customerAccessReadiness(env),200,'ok',{manual_repair:'NO'}));
    if(match&&request.method==='POST'){
      const data=await issueCustomerAccessInvite(env,ctx,identity,decodeURIComponent(match[1]),idempotencyKey(request));
      return wrap(success(ctx,data,201,'created',{manual_repair:'NO',customer_notification:'galvichart_update'}));
    }
    throw new GVError('GV_NOT_FOUND','Clinician customer-access route was not found.',404);
  }catch(error){return wrap(failure(ctx,error));}
}};
