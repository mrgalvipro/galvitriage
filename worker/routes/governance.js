import { idempotencyKey, jsonBody, requireOperator, success } from '../day4-common.js';
import { confirmFinding } from '../domain/governance-service.js';

export async function handleGovernanceRoute(request,env,ctx,path){
  if(request.method==='POST'&&path==='/api/v1/governance/confirmations'){
    const operator=requireOperator(request);
    const input=await jsonBody(request);
    const data=await confirmFinding(env,ctx,operator,idempotencyKey(request),input);
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
  }
  return null;
}
