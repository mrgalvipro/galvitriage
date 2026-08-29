import { GVError, actor, idempotencyKey, jsonBody, success } from '../day5-common.js';
import { first } from '../repositories/care-repository.js';
import { createGalviGage, createStudioEngagement, getDay6Readiness, getStudioCatalog, getStudioEngagement, recordStudioArtifact, recordStudioGate, recordStudioOutcome, recordVentureProof } from '../domain/day6-studio-service.js';

const ENGAGEMENT_READ_ROLES=new Set(['business_physician','studio_operator','galviclinician','operator','admin']);
async function scopedEngagement(env,id){const row=await first(env.DB,'SELECT engagement_id,principal_id,bmr_id FROM gv1_studio_engagements WHERE engagement_id=?',String(id||''));if(!row)throw new GVError('GV_NOT_FOUND','Studio engagement was not found.',404);return row;}
async function validateEvidenceRefs(env,engagementId,ids=[]){const e=await scopedEngagement(env,engagementId);for(const raw of Array.isArray(ids)?ids:[]){const id=String(raw||'').trim();if(!id)continue;let found=null;if(e.bmr_id)found=await first(env.DB,'SELECT evidence_id FROM gv1_evidence_items WHERE evidence_id=? AND bmr_id=?',id,e.bmr_id);if(!found)found=await first(env.DB,'SELECT evidence_id FROM gv1_principal_evidence_items WHERE evidence_id=? AND founder_id=?',id,e.principal_id);if(!found)throw new GVError('GV_STAGE_EVIDENCE_SCOPE','Stage evidence is missing or outside the authorized principal/BHR scope.',409,{evidence_id:id});}}
async function validateResolvableProofEvidence(env,ids=[]){for(const raw of Array.isArray(ids)?ids:[]){const id=String(raw||'').trim();if(!id)continue;const found=await first(env.DB,'SELECT evidence_id FROM gv1_evidence_items WHERE evidence_id=?',id)||await first(env.DB,'SELECT evidence_id FROM gv1_principal_evidence_items WHERE evidence_id=?',id);if(!found)throw new GVError('GV_PROOF_EVIDENCE_REQUIRED','Venture proof evidence reference is not resolvable.',409,{evidence_id:id});}}

export async function handleDay6StudioRoute(request,env,ctx,path){
  const caller=actor(request);
  if(request.method==='GET'&&path==='/api/v1/day6/readiness')return success(ctx,await getDay6Readiness(env),200,'ok',{day6:true});
  if(request.method==='GET'&&path==='/api/v1/day6/studio/catalog')return success(ctx,getStudioCatalog(),200,'ok',{read_only:true,day6:true});
  if(request.method==='POST'&&path==='/api/v1/day6/studio/engagements'){
    const input=await jsonBody(request),data=await createStudioEngagement(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,day6:true});
  }
  const engagement=path.match(/^\/api\/v1\/day6\/studio\/engagements\/([^/]+)$/);
  if(request.method==='GET'&&engagement){if(!ENGAGEMENT_READ_ROLES.has(caller.role))throw new GVError('GV_AUTH_FORBIDDEN','Authorized clinician/Studio scope is required.',403);return success(ctx,await getStudioEngagement(env,caller,decodeURIComponent(engagement[1])),200,'ok',{read_only:true,day6:true});}
  if(request.method==='POST'&&path==='/api/v1/day6/studio/stage-gates'){
    const input=await jsonBody(request);await validateEvidenceRefs(env,input.engagement_id,input.current_evidence_ids||[]);const data=await recordStudioGate(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,day6:true});
  }
  if(request.method==='POST'&&path==='/api/v1/day6/studio/artifacts'){
    const input=await jsonBody(request);if(input.evidence_id)await validateEvidenceRefs(env,input.engagement_id,[input.evidence_id]);const data=await recordStudioArtifact(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,day6:true});
  }
  if(request.method==='POST'&&path==='/api/v1/day6/studio/outcomes'){
    const input=await jsonBody(request);await validateEvidenceRefs(env,input.engagement_id,input.evidence_refs||[]);const data=await recordStudioOutcome(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,day6:true,explicit_reassessment:Boolean(data.reassessment_id)});
  }
  if(request.method==='POST'&&path==='/api/v1/day6/studio/venture-proof'){
    const input=await jsonBody(request);await validateResolvableProofEvidence(env,input.evidence_refs||[]);const data=await recordVentureProof(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,day6:true});
  }
  if(request.method==='POST'&&path==='/api/v1/day6/galvigage'){
    const input=await jsonBody(request),data=await createGalviGage(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,day6:true});
  }
  if(path.startsWith('/api/v1/day6/'))throw new GVError('GV_NOT_FOUND','Day 6 route not found.',404);
  return null;
}
