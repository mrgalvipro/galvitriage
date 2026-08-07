import { GVError, actor, idempotencyKey, jsonBody, requireOperator, success } from '../day4-common.js';
import { createObservation, createHypothesis, createFinding, supersedeFinding, getReasoning, getCustomerProjection } from '../domain/reasoning-service.js';

export async function handleReasoningRoute(request,env,ctx,path){
  if(request.method==='POST'&&path==='/api/v1/observations'){
    const input=await jsonBody(request); const data=await createObservation(env,ctx,actor(request),idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/hypotheses'){
    const input=await jsonBody(request); const data=await createHypothesis(env,ctx,actor(request),idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/findings'){
    const input=await jsonBody(request); const data=await createFinding(env,ctx,actor(request),idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const supersede=path.match(/^\/api\/v1\/findings\/([^/]+)\/supersede$/);
  if(request.method==='POST'&&supersede){
    const input=await jsonBody(request); const data=await supersedeFinding(env,ctx,requireOperator(request),idempotencyKey(request),decodeURIComponent(supersede[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const reasoning=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/reasoning$/);
  if(request.method==='GET'&&reasoning){
    const url=new URL(request.url); const history=url.searchParams.get('history')==='true'||url.searchParams.get('include_history')==='true';
    if(history) requireOperator(request);
    const data=await getReasoning(env,decodeURIComponent(reasoning[1]),{history,limit:url.searchParams.get('limit')||100});
    return success(ctx,data);
  }
  const customer=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/customer-projection$/);
  if(request.method==='GET'&&customer){
    const data=await getCustomerProjection(env,decodeURIComponent(customer[1]));
    return success(ctx,data);
  }
  return null;
}
