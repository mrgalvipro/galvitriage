import day8Worker from './day8-day7-entry.js';
import { GVError, context, failure, headers, jsonBody, requireRuntime, success } from './day5-common.js';
import { requireClinicianIdentity } from './auth/operator-identity.js';
import { generateFounderShot, pendingReassessments } from './domain/day7-commercial-care-service.js';
import { applyLifecycleReview, latestFounderShot, pendingLifecycleReviews } from './domain/day7-lifecycle-service.js';

export const DAY8_COMMERCIAL_RUNTIME='galvivault_day8_commercial_foundershot_v1';
const SHOT=/^\/api\/v1\/operator\/principal-contexts\/([^/]+)\/founder-shot$/;
const CHART=/^\/api\/v1\/operator\/principal-contexts\/([^/]+)\/chart$/;
const APPLY=/^\/api\/v1\/operator\/lifecycle-reviews\/([^/]+)\/apply$/;
const REASSESS='/api/v1/operator/commercial-reassessment-queue';
const LIFECYCLE='/api/v1/operator/lifecycle-review-queue';
function wrap(response){const h=new Headers(response.headers);h.set('X-Galvi-Day8-Commercial',DAY8_COMMERCIAL_RUNTIME);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
async function enrichChart(request,env,executionContext,path){const m=path.match(CHART);if(request.method!=='GET'||!m)return null;const downstream=await day8Worker.fetch(request,env,executionContext);if(!downstream.ok)return downstream;const body=await downstream.clone().json().catch(()=>null);if(!body?.success)return downstream;const founder_snapshot=await latestFounderShot(env,decodeURIComponent(m[1]));return new Response(JSON.stringify({...body,data:{...body.data,chart:{...body.data.chart,founder_snapshot}}}),{status:downstream.status,headers:downstream.headers});}
export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/',ctx=context(request,env),shot=path.match(SHOT),apply=path.match(APPLY);
  try{
    requireRuntime(env,ctx);
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/operator/'))return new Response(null,{status:204,headers:headers(ctx)});
    if(shot||apply||path===REASSESS||path===LIFECYCLE){const identity=await requireClinicianIdentity(request,env);if(identity.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
      if(shot&&request.method==='POST')return wrap(success(ctx,await generateFounderShot(env,ctx,decodeURIComponent(shot[1]),{role:'business_physician',id:identity.operator_id}),201,'created',{artifact:'FounderShot',ai_governance:'proposal_not_transition'}));
      if(path===REASSESS&&request.method==='GET')return wrap(success(ctx,await pendingReassessments(env),200,'ok',{queue:'commercial_treatment_reassessment'}));
      if(path===LIFECYCLE&&request.method==='GET')return wrap(success(ctx,await pendingLifecycleReviews(env),200,'ok',{queue:'founder_lifecycle_review'}));
      if(apply&&request.method==='POST')return wrap(success(ctx,await applyLifecycleReview(env,ctx,identity,decodeURIComponent(apply[1]),await jsonBody(request)),200,'ok',{canonical_transition:'business_physician_confirmed'}));
    }
    const enriched=await enrichChart(request,env,executionContext,path);if(enriched)return wrap(enriched);
    return wrap(await day8Worker.fetch(request,env,executionContext));
  }catch(error){return wrap(failure(ctx,error));}
}};
