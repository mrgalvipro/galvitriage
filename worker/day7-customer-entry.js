import day7Worker from './day7-entry.js';
import { GVError, context, failure, headers, requireRuntime, jsonBody, success } from './day5-common.js';
import { activateCustomerAccess, loginCustomerAccess, customerAccessReadiness } from './domain/day7-customer-access-service.js';

export const DAY7_CUSTOMER_ACCESS_RUNTIME='galvicare_1_0_returning_customer_access_v1';
const ACTIVATE='/api/v1/day7/customer-access/activate';
const LOGIN='/api/v1/day7/customer-access/login';
const READY='/api/v1/day7/customer-access/readiness';

function wrap(response){
  if(!response)return response;
  const h=new Headers(response.headers);h.set('X-Galvi-Day7-Customer-Access',DAY7_CUSTOMER_ACCESS_RUNTIME);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
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
