import { idempotencyKey, jsonBody, requireOperator, success } from '../day4-common.js';
import { getTimeline, transitionUnderReview } from '../domain/bmr-service.js';

export async function handleBmrRoute(request,env,ctx,path){
  const timeline=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/timeline$/);
  if(request.method==='GET'&&timeline){
    requireOperator(request);
    const url=new URL(request.url);
    const data=await getTimeline(env,decodeURIComponent(timeline[1]),{limit:url.searchParams.get('limit')||100});
    return success(ctx,data);
  }
  const transition=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/transitions$/);
  if(request.method==='POST'&&transition){
    const operator=requireOperator(request);
    const input=await jsonBody(request);
    const data=await transitionUnderReview(env,ctx,operator,idempotencyKey(request),decodeURIComponent(transition[1]),input);
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
  }
  return null;
}
