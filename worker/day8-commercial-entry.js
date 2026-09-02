import day8Worker from './day8-day7-entry.js';
import { GVError, context, failure, headers, jsonBody, requireRuntime, success } from './day5-common.js';
import { requireClinicianIdentity } from './auth/operator-identity.js';
import { generateFounderShot, pendingReassessments } from './domain/day7-commercial-care-service.js';
import { applyLifecycleReview, latestFounderShot, pendingLifecycleReviews } from './domain/day7-lifecycle-service.js';
import { buildGalviBoard } from './domain/day7-galviboard-service.js';

export const DAY8_COMMERCIAL_RUNTIME='galvivault_day8_commercial_foundershot_v1';
const SHOT=/^\/api\/v1\/operator\/principal-contexts\/([^/]+)\/founder-shot$/;
const CHART=/^\/api\/v1\/operator\/principal-contexts\/([^/]+)\/chart$/;
const APPLY=/^\/api\/v1\/operator\/lifecycle-reviews\/([^/]+)\/apply$/;
const REASSESS='/api/v1/operator/commercial-reassessment-queue';
const LIFECYCLE='/api/v1/operator/lifecycle-review-queue';
const GALVIBOARD='/api/v1/operator/galviboard';
const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const parse=(v,f={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return f}};
function wrap(response){const h=new Headers(response.headers);h.set('X-Galvi-Day8-Commercial',DAY8_COMMERCIAL_RUNTIME);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
async function commercialForContext(env,contextId){const order=await first(env.DB,'SELECT * FROM gv1_commercial_care_orders WHERE context_id=? ORDER BY created_at DESC LIMIT 1',contextId);if(!order)return{order:null,queue:null};const queue=await first(env.DB,'SELECT queue_id,status,reason_code,source_completion_ref,created_at,customer_confirmed_at,reviewed_at FROM gv1_care_reassessment_queue WHERE order_id=?',order.order_id);return{order:{...order,required_completion_keys:parse(order.required_completion_keys_json,[]),completed_completion_keys:parse(order.completed_completion_keys_json,[])},queue};}
async function enrichChart(request,env,executionContext,path){const m=path.match(CHART);if(request.method!=='GET'||!m)return null;const downstream=await day8Worker.fetch(request,env,executionContext);if(!downstream.ok)return downstream;const body=await downstream.clone().json().catch(()=>null);if(!body?.success)return downstream;const contextId=decodeURIComponent(m[1]),founder_snapshot=await latestFounderShot(env,contextId),commercial=await commercialForContext(env,contextId);return new Response(JSON.stringify({...body,data:{...body.data,chart:{...body.data.chart,founder_snapshot,commercial}}}),{status:downstream.status,headers:downstream.headers});}
export default {async fetch(request,env,executionContext){
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/',ctx=context(request,env),shot=path.match(SHOT),apply=path.match(APPLY);
  try{
    requireRuntime(env,ctx);
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/operator/'))return new Response(null,{status:204,headers:headers(ctx)});
    if(shot||apply||path===REASSESS||path===LIFECYCLE||path===GALVIBOARD){const identity=await requireClinicianIdentity(request,env);if(identity.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
      if(path===GALVIBOARD&&request.method==='GET')return wrap(success(ctx,await buildGalviBoard(env,ctx,identity),200,'ok',{projection:'galviboard_1_0',read_only:true,source_of_truth:'galvivault_d1'}));
      if(shot&&request.method==='POST')return wrap(success(ctx,await generateFounderShot(env,ctx,decodeURIComponent(shot[1]),{role:'business_physician',id:identity.operator_id}),201,'created',{artifact:'FounderShot',ai_governance:'proposal_not_transition'}));
      if(path===REASSESS&&request.method==='GET')return wrap(success(ctx,await pendingReassessments(env),200,'ok',{queue:'commercial_treatment_reassessment'}));
      if(path===LIFECYCLE&&request.method==='GET')return wrap(success(ctx,await pendingLifecycleReviews(env),200,'ok',{queue:'founder_lifecycle_review'}));
      if(apply&&request.method==='POST')return wrap(success(ctx,await applyLifecycleReview(env,ctx,identity,decodeURIComponent(apply[1]),await jsonBody(request)),200,'ok',{canonical_transition:'business_physician_confirmed'}));
    }
    const enriched=await enrichChart(request,env,executionContext,path);if(enriched)return wrap(enriched);
    return wrap(await day8Worker.fetch(request,env,executionContext));
  }catch(error){return wrap(failure(ctx,error));}
}};
