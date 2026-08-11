import day5Worker from './day5-entry.js';
import { GVError, context, failure, headers, success } from './day5-common.js';
import { requireClinicianIdentity, asLegacyOperatorHeaders } from './auth/operator-identity.js';
import { handleOperatorAuth } from './routes/operator-auth.js';
import { handleOperatorWorkspace } from './routes/operator-workspace.js';

const authPath=(path)=>path.startsWith('/api/v1/operator/auth/');
const protectedPath=(path)=> path.startsWith('/api/v1/operator/') ||
  /^\/api\/v1\/business-medical-records\/[^/]+\/(timeline|reasoning|care|transitions|evidence)/.test(path) ||
  path==='/api/v1/evidence' || path.startsWith('/api/v1/evidence/') ||
  path==='/api/v1/governance/confirmations' || path.startsWith('/api/v1/findings/') ||
  path==='/api/v1/recommendations' || path.startsWith('/api/v1/recommendations/') ||
  path==='/api/v1/treatment-plans' || path.startsWith('/api/v1/treatment-plans/') ||
  path==='/api/v1/outcomes' || path==='/api/v1/feedback';
const isApi=(path)=>path.startsWith('/api/')||path==='/health'||path==='/ready';

const worker={async fetch(request,env,executionContext){
  const ctx=context(request,env), path=new URL(request.url).pathname.replace(/\/+$/,'')||'/';
  try{
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/')) return new Response(null,{status:204,headers:headers(ctx)});
    if(authPath(path)){
      const response=await handleOperatorAuth(request,env,ctx,path,success);
      if(response)return response;
    }
    if(!isApi(path)){
      if(!env?.ASSETS?.fetch) throw new GVError('GV_NOT_READY','Clinician portal assets are unavailable.',503);
      const response=await env.ASSETS.fetch(request);
      const h=new Headers(response.headers); h.set('Cache-Control','no-store'); h.set('X-Content-Type-Options','nosniff'); h.set('Referrer-Policy','no-referrer');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
    }
    if(!protectedPath(path)) return day5Worker.fetch(request,env,executionContext);
    const identity=await requireClinicianIdentity(request,env);
    if(identity.role!=='business_physician'&&(path==='/api/v1/governance/confirmations'||/\/transitions$/.test(path)))
      throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
    const secured=asLegacyOperatorHeaders(request,identity);
    const response=await handleOperatorWorkspace(secured,env,ctx,path,identity);
    return response||day5Worker.fetch(secured,env,executionContext);
  }catch(error){ return failure(ctx,error); }
}};
export default worker;
