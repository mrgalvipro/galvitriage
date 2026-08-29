import { actor, idempotencyKey, jsonBody, success } from '../day5-common.js';
import {
  startMembership, cancelMembership, submitMembershipCheckin, getMembership, membershipReadiness
} from '../domain/day7-membership-service.js';

export async function handleDay7ReleaseRoute(request,env,ctx,path){
  const caller=actor(request);

  if(request.method==='GET'&&path==='/api/v1/day7/readiness'){
    return success(ctx,await membershipReadiness(env));
  }
  if(request.method==='POST'&&path==='/api/v1/day7/memberships'){
    const input=await jsonBody(request);
    const data=await startMembership(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const cancel=path.match(/^\/api\/v1\/day7\/memberships\/([^/]+)\/cancel$/);
  if(request.method==='POST'&&cancel){
    const data=await cancelMembership(env,ctx,caller,idempotencyKey(request),decodeURIComponent(cancel[1]));
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
  }
  const checkin=path.match(/^\/api\/v1\/day7\/memberships\/([^/]+)\/checkins$/);
  if(request.method==='POST'&&checkin){
    const input=await jsonBody(request);
    const data=await submitMembershipCheckin(env,ctx,caller,idempotencyKey(request),decodeURIComponent(checkin[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const read=path.match(/^\/api\/v1\/day7\/memberships\/([^/]+)$/);
  if(request.method==='GET'&&read){
    return success(ctx,await getMembership(env,caller,decodeURIComponent(read[1])));
  }
  return null;
}
