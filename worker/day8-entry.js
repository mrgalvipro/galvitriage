import day5Worker from './day5-entry.js';
import { GVError, context, failure, headers, success } from './day5-common.js';
import { requireClinicianIdentity, asLegacyOperatorHeaders } from './auth/operator-identity.js';
import { handleOperatorAuth } from './routes/operator-auth.js';
import { handleOperatorWorkspace } from './routes/operator-workspace.js';

const authPath=(path)=>path.startsWith('/api/v1/operator/auth/');
const activeCarePath=(path)=>
  /^\/api\/v1\/business-medical-records\/[^/]+\/clinic-brief$/.test(path) ||
  path==='/api/v1/finding-decisions' || path==='/api/v1/galvirx' ||
  path==='/api/v1/galviaudit-orders' || /^\/api\/v1\/galviaudit-orders\/[^/]+\/result$/.test(path) ||
  path==='/api/v1/referrals' || /^\/api\/v1\/referrals\/[^/]+\/(status|outcome)$/.test(path) ||
  path==='/api/v1/checkins' || path==='/api/v1/milestones' || path==='/api/v1/reassessments' ||
  path==='/api/v1/treatment-plans' || /^\/api\/v1\/treatment-plans\/[^/]+\/revisions$/.test(path);
const physicianOnly=(path)=>
  path==='/api/v1/finding-decisions' || path==='/api/v1/galvirx' || path==='/api/v1/galviaudit-orders' ||
  path==='/api/v1/referrals' || path==='/api/v1/reassessments' || path==='/api/v1/treatment-plans' ||
  /^\/api\/v1\/treatment-plans\/[^/]+\/revisions$/.test(path);
const protectedPath=(path)=> path.startsWith('/api/v1/operator/') || activeCarePath(path) ||
  /^\/api\/v1\/business-medical-records\/[^/]+\/(timeline|reasoning|care|transitions|evidence)/.test(path) ||
  path==='/api/v1/evidence' || path.startsWith('/api/v1/evidence/') ||
  path==='/api/v1/governance/confirmations' || path.startsWith('/api/v1/findings/') ||
  path==='/api/v1/recommendations' || path.startsWith('/api/v1/recommendations/') ||
  path==='/api/v1/treatment-plans' || path.startsWith('/api/v1/treatment-plans/') ||
  path==='/api/v1/outcomes' || path==='/api/v1/feedback';
const isApi=(path)=>path.startsWith('/api/')||path==='/health'||path==='/ready';

function asDay5CareHeaders(request,identity){
  const h=new Headers(request.headers);
  h.delete('X-Galvi-Role');h.delete('X-Galvi-Actor-Id');h.delete('X-Galvi-Email');
  h.set('X-Galvi-Role',identity.role==='business_physician'?'business_physician':'galviclinician');
  h.set('X-Galvi-Actor-Id',identity.operator_id);
  return new Request(request,{headers:h});
}

async function preflightTreatmentPlanFk(request,env){
  if(request.method!=='POST') return;
  let body={};
  try{ body=await request.clone().json(); }catch{ return; }
  const bmrId=String(body?.bmr_id||'').trim();
  if(!bmrId) return;
  const bmr=await env.DB.prepare(`SELECT bmr_id,current_session_id FROM gv1_business_medical_records WHERE bmr_id=? LIMIT 1`).bind(bmrId).first();
  if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  let sessionId=String(bmr.current_session_id||'').trim();
  if(!sessionId){
    const latest=await env.DB.prepare(`SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY created_at DESC LIMIT 1`).bind(bmrId).first();
    sessionId=String(latest?.session_id||'').trim();
  }
  if(!sessionId) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','Treatment plan requires a current BMR session.',409);
  const session=await env.DB.prepare(`SELECT session_id,bmr_id FROM gv1_assessment_sessions WHERE session_id=? LIMIT 1`).bind(sessionId).first();
  if(!session||session.bmr_id!==bmrId) throw new GVError('GV_LINEAGE_REQUIRED','Treatment plan session must exist and belong to the same BMR.',409);
  for(const recommendationId of Array.isArray(body?.recommendation_ids)?body.recommendation_ids:[]){
    const row=await env.DB.prepare(`SELECT recommendation_id,bmr_id FROM gv1_recommendations WHERE recommendation_id=? LIMIT 1`).bind(String(recommendationId)).first();
    if(!row||row.bmr_id!==bmrId) throw new GVError('GV_LINEAGE_REQUIRED','Treatment plan recommendation must exist and belong to the same BMR.',422);
  }
  for(const findingId of Array.isArray(body?.finding_ids)?body.finding_ids:[]){
    const row=await env.DB.prepare(`SELECT finding_id,bmr_id FROM gv1_findings WHERE finding_id=? LIMIT 1`).bind(String(findingId)).first();
    if(!row||row.bmr_id!==bmrId) throw new GVError('GV_LINEAGE_REQUIRED','Treatment plan finding must exist and belong to the same BMR.',422);
  }
  await env.DB.prepare('PRAGMA defer_foreign_keys = ON').run();
}

const worker={async fetch(request,env,executionContext){
  const url=new URL(request.url), ctx=context(request,env), path=url.pathname.replace(/\/+$/,'')||'/';
  try{
    if(ctx.origin&&ctx.origin!==url.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
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
    if(identity.role!=='business_physician'&&(path==='/api/v1/governance/confirmations'||/\/transitions$/.test(path)||physicianOnly(path)))
      throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
    if(path==='/api/v1/treatment-plans') await preflightTreatmentPlanFk(request,env);
    if(activeCarePath(path)) return day5Worker.fetch(asDay5CareHeaders(request,identity),env,executionContext);
    const secured=asLegacyOperatorHeaders(request,identity);
    const response=await handleOperatorWorkspace(secured,env,ctx,path,identity);
    return response||day5Worker.fetch(secured,env,executionContext);
  }catch(error){ return failure(ctx,error); }
}};
export default worker;