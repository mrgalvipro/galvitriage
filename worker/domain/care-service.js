import {
  GVError, clean, newId, now, hash, requireId, requireText, optionalText, enumValue
} from '../day5-common.js';
import {
  all, first, findBmr, findFinding, findRecommendation, findPlan, findPlanItem,
  findOutcome, findLearningCandidate, findAdapterDelivery, loadReceipt, receiptStmt,
  recommendationLinks, planLinks, outcomeLinks, listCare
} from '../repositories/care-repository.js';

const REC_STATUS=['proposed','approved','declined','superseded','completed','archived'];
const PLAN_STATUS=['draft','approved','active','paused','completed','cancelled','superseded','archived'];
const OUT_STATUS=['observed','confirmed','rejected','superseded','archived'];
const FEEDBACK_TYPES=['confirm','reject','correct','clarify','comment'];
const ADAPTERS=['hubspot','analytics','stripe','notification'];

async function sessionForBmr(db,bmr){
  if(bmr.current_session_id) return bmr.current_session_id;
  const row=await first(db,`SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY created_at DESC LIMIT 1`,bmr.bmr_id);
  if(!row?.session_id) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','A current BMR session is required.',409);
  return row.session_id;
}

function eventStmt(db,{id,key,bmrId,sessionId,name,timestamp,actor,metadata,fingerprint,correlation,environment}){
  return db.prepare(`INSERT INTO gv1_journey_events
    (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
    VALUES (?,?,?,?,?,'GalviVault','Day5',?,?,?,?,?,?,?)`)
    .bind(id,key,bmrId,sessionId,name,timestamp,actor.role,JSON.stringify(metadata||{}),fingerprint,correlation,environment,timestamp);
}

function auditStmt(db,{id,entityType,entityId,operation,priorVersion,newVersion,actor,source,reason,change,correlation,environment,timestamp}){
  return db.prepare(`INSERT INTO gv1_audit_log
    (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id,entityType,entityId,operation,priorVersion,newVersion,actor.role,source,reason||null,JSON.stringify(change||{}),correlation,environment,timestamp,timestamp);
}

async function replay(db,scope,key,fingerprint,loader){
  const receipt=await loadReceipt(db,scope,key);
  if(!receipt) return null;
  if(receipt.request_fingerprint!==fingerprint) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','The idempotency key was reused with different content.',409);
  const data=await loader(receipt.response_entity_id);
  return {...data,idempotent_replay:true};
}

async function governedFinding(db,bmrId,findingId){
  const finding=await findFinding(db,requireId('finding_id',findingId));
  if(!finding) throw new GVError('GV_NOT_FOUND','Finding was not found.',404);
  if(finding.bmr_id!==bmrId) throw new GVError('GV_AUTH_FORBIDDEN','Cross-BMR care lineage is prohibited.',403);
  if(clean(finding.confirmation_status).toLowerCase()!=='confirmed') throw new GVError('GV_LINEAGE_REQUIRED','Recommendation/treatment requires a confirmed governed finding.',422);
  return finding;
}

export async function createRecommendation(env,ctx,actor,key,input){
  const bmrId=requireId('bmr_id',input.bmr_id); const bmr=await findBmr(env.DB,bmrId); if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const ids=Array.isArray(input.finding_ids)?input.finding_ids:[]; if(!ids.length) throw new GVError('GV_LINEAGE_REQUIRED','A recommendation requires at least one finding.',422);
  for(const id of ids) await governedFinding(env.DB,bmrId,id);
  const code=requireText('recommendation_code',input.recommendation_code,120);
  const title=requireText('title',input.title,240); const action=requireText('action',input.action||input.action_text,2400);
  const rationale=requireText('rationale',input.rationale,1600); const sourceType=requireText('source_type',input.source_type||'operator_protocol',80);
  const sourceVersion=optionalText('source_version',input.source_version,120); const status=enumValue('status',input.status,REC_STATUS,'proposed');
  const priority=input.priority==null?null:Number(input.priority);
  const fp=await hash('day5:recommendation:create',{bmrId,ids,code,title,action,rationale,sourceType,sourceVersion,status,priority});
  const prior=await replay(env.DB,'day5:recommendation:create',key,fp,async id=>({recommendation:await findRecommendation(env.DB,id),links:await recommendationLinks(env.DB,id)})); if(prior)return prior;
  const timestamp=now(), id=newId('rec'), group=newId('rcg'), sessionId=await sessionForBmr(env.DB,bmr);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_recommendations
      (recommendation_id,bmr_id,product,title,recommendation_text,priority,status,evidence_version,created_at,updated_at,recommendation_group_id,version_no,supersedes_recommendation_id,recommendation_code,rationale,source_type,source_version,created_by_type,created_by_id,correlation_id)
      VALUES (?,?,'GalviVault',?,?,?,?,1,?,?,?,?,NULL,?,?,?,?,?,?,?)`)
      .bind(id,bmrId,title,action,priority,status,timestamp,timestamp,group,1,code,rationale,sourceType,sourceVersion,actor.role,actor.id,ctx.correlation),
    ...ids.map(fid=>env.DB.prepare(`INSERT INTO gv1_recommendation_findings (recommendation_id,finding_id,created_at,relationship_type,correlation_id) VALUES (?,?,?,?,?)`).bind(id,fid,timestamp,'addresses',ctx.correlation)),
    eventStmt(env.DB,{id:newId('jev'),key:`day5:recommendation:${id}`,bmrId,sessionId,name:'recommendation_created',timestamp,actor,metadata:{recommendation_id:id,version_no:1},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),
    auditStmt(env.DB,{id:newId('aud'),entityType:'recommendation',entityId:id,operation:'create',priorVersion:null,newVersion:1,actor,source:sourceType,change:{group_id:group,finding_count:ids.length},correlation:ctx.correlation,environment:ctx.environment,timestamp}),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day5:recommendation:create',key,fingerprint:fp,status:201,entityType:'recommendation',entityId:id,timestamp})
  ]);
  await maybeRecordForcedAdapterFailure(env,ctx,{bmrId,entityType:'recommendation',entityId:id,sourceEventId:`recommendation:${id}`,adapterName:input.adapter_name,force:input.force_adapter_failure});
  return {recommendation:await findRecommendation(env.DB,id),links:await recommendationLinks(env.DB,id),idempotent_replay:false};
}

export async function supersedeRecommendation(env,ctx,actor,key,recommendationId,input){
  const prior=await findRecommendation(env.DB,requireId('recommendation_id',recommendationId)); if(!prior) throw new GVError('GV_NOT_FOUND','Recommendation was not found.',404);
  const ids=Array.isArray(input.finding_ids)&&input.finding_ids.length?input.finding_ids:(await recommendationLinks(env.DB,prior.recommendation_id)).map(x=>x.finding_id);
  for(const id of ids) await governedFinding(env.DB,prior.bmr_id,id);
  const version=Number(prior.version_no||1)+1; const title=requireText('title',input.title||prior.title,240); const action=requireText('action',input.action||input.action_text||prior.recommendation_text,2400); const rationale=requireText('rationale',input.rationale||prior.rationale||'Governed revision',1600);
  const code=requireText('recommendation_code',input.recommendation_code||prior.recommendation_code||'REC_REVISION',120); const sourceType=requireText('source_type',input.source_type||prior.source_type||'operator_protocol',80); const sourceVersion=optionalText('source_version',input.source_version??prior.source_version,120);
  const fp=await hash('day5:recommendation:supersede',{recommendationId,version,ids,title,action,rationale,code});
  const replayed=await replay(env.DB,'day5:recommendation:supersede',key,fp,async id=>({recommendation:await findRecommendation(env.DB,id),links:await recommendationLinks(env.DB,id)})); if(replayed)return replayed;
  const bmr=await findBmr(env.DB,prior.bmr_id), timestamp=now(), id=newId('rec'), sessionId=await sessionForBmr(env.DB,bmr);
  await env.DB.batch([
    env.DB.prepare(`UPDATE gv1_recommendations SET status='superseded',updated_at=? WHERE recommendation_id=?`).bind(timestamp,prior.recommendation_id),
    env.DB.prepare(`INSERT INTO gv1_recommendations
      (recommendation_id,bmr_id,product,title,recommendation_text,priority,status,evidence_version,created_at,updated_at,recommendation_group_id,version_no,supersedes_recommendation_id,recommendation_code,rationale,source_type,source_version,created_by_type,created_by_id,correlation_id)
      VALUES (?,?,'GalviVault',?,?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id,prior.bmr_id,title,action,input.priority??prior.priority,'proposed',timestamp,timestamp,prior.recommendation_group_id,version,prior.recommendation_id,code,rationale,sourceType,sourceVersion,actor.role,actor.id,ctx.correlation),
    ...ids.map(fid=>env.DB.prepare(`INSERT INTO gv1_recommendation_findings (recommendation_id,finding_id,created_at,relationship_type,correlation_id) VALUES (?,?,?,?,?)`).bind(id,fid,timestamp,'addresses',ctx.correlation)),
    eventStmt(env.DB,{id:newId('jev'),key:`day5:recommendation_superseded:${id}`,bmrId:prior.bmr_id,sessionId,name:'recommendation_superseded',timestamp,actor,metadata:{recommendation_id:id,supersedes:prior.recommendation_id,version_no:version},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),
    auditStmt(env.DB,{id:newId('aud'),entityType:'recommendation',entityId:id,operation:'supersede',priorVersion:Number(prior.version_no||1),newVersion:version,actor,source:sourceType,change:{supersedes:prior.recommendation_id},correlation:ctx.correlation,environment:ctx.environment,timestamp}),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day5:recommendation:supersede',key,fingerprint:fp,status:201,entityType:'recommendation',entityId:id,timestamp})
  ]);
  return {recommendation:await findRecommendation(env.DB,id),links:await recommendationLinks(env.DB,id),idempotent_replay:false};
}

async function validatePlanCare(db,bmrId,recommendationIds,findingIds){
  if(!recommendationIds.length&&!findingIds.length) throw new GVError('GV_LINEAGE_REQUIRED','A treatment plan requires recommendation or finding context.',422);
  for(const id of recommendationIds){const row=await findRecommendation(db,requireId('recommendation_id',id));if(!row)throw new GVError('GV_NOT_FOUND','Recommendation was not found.',404);if(row.bmr_id!==bmrId)throw new GVError('GV_AUTH_FORBIDDEN','Cross-BMR treatment context is prohibited.',403);if(!['approved','proposed'].includes(clean(row.status)))throw new GVError('GV_LINEAGE_REQUIRED','Recommendation is not eligible for treatment.',422);}
  for(const id of findingIds) await governedFinding(db,bmrId,id);
}

function normalizeItems(items){
  if(!Array.isArray(items)||!items.length) throw new GVError('GV_REQ_SCHEMA','At least one treatment plan item is required.',422);
  return items.map((item,index)=>({sequence:Number(item.sequence_no??item.sequence_number??index+1),actionCode:requireText('action_code',item.action_code||`ACT_${index+1}`,120),description:requireText('description',item.description||item.title,1200),title:requireText('title',item.title||item.description,240),status:enumValue('item_status',item.status,['planned','in_progress','blocked','completed','cancelled'],'planned'),targetDate:optionalText('target_date',item.target_date||item.due_at,80)}));
}

export async function createTreatmentPlan(env,ctx,actor,key,input){
  const bmrId=requireId('bmr_id',input.bmr_id), bmr=await findBmr(env.DB,bmrId); if(!bmr)throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const recIds=Array.isArray(input.recommendation_ids)?input.recommendation_ids:[]; const findingIds=Array.isArray(input.finding_ids)?input.finding_ids:[]; await validatePlanCare(env.DB,bmrId,recIds,findingIds);
  const items=normalizeItems(input.items); const code=requireText('treatment_code',input.treatment_code,120); const title=requireText('title',input.title,240); const objective=requireText('objective',input.objective,1600); const status=enumValue('status',input.status,PLAN_STATUS,'approved');
  const fp=await hash('day5:treatment:create',{bmrId,recIds,findingIds,code,title,objective,status,items});
  const prior=await replay(env.DB,'day5:treatment:create',key,fp,async id=>({treatment_plan:await findPlan(env.DB,id),links:await planLinks(env.DB,id)})); if(prior)return prior;
  const timestamp=now(), id=newId('trp'), group=newId('tpg'), sessionId=await sessionForBmr(env.DB,bmr);
  const staged=[];
  const stage=(name,stmt)=>{staged.push({name,stmt});};
  stage('treatment_plan_parent',env.DB.prepare(`/* E2E11_STAGE:treatment_plan_parent */ INSERT INTO gv1_treatment_plans
    (treatment_plan_id,bmr_id,name,status,start_date,target_end_date,evidence_version,created_at,updated_at,treatment_plan_group_id,version_no,supersedes_treatment_plan_id,treatment_code,objective,owner_actor_type,owner_actor_id,target_outcomes_json,created_by_type,created_by_id,correlation_id)
    VALUES (?,?,?,?,?,?,1,?,?,?,?,NULL,?,?,?,?,?,?,?,?)`).bind(id,bmrId,title,status,input.start_date||null,input.target_end_date||null,timestamp,timestamp,group,1,code,objective,actor.role,actor.id,JSON.stringify(input.target_outcomes||[]),actor.role,actor.id,ctx.correlation));
  for(const rid of recIds) stage('recommendation_link',env.DB.prepare(`/* E2E11_STAGE:recommendation_link */ INSERT INTO gv1_treatment_plan_recommendations (treatment_plan_id,recommendation_id,created_at,correlation_id) VALUES (?,?,?,?)`).bind(id,rid,timestamp,ctx.correlation));
  for(const fid of findingIds) stage('finding_link',env.DB.prepare(`/* E2E11_STAGE:finding_link */ INSERT INTO gv1_treatment_plan_findings (treatment_plan_id,finding_id,created_at,correlation_id) VALUES (?,?,?,?)`).bind(id,fid,timestamp,ctx.correlation));
  for(const item of items) stage('treatment_plan_item',env.DB.prepare(`/* E2E11_STAGE:treatment_plan_item */ INSERT INTO gv1_treatment_plan_items
    (treatment_plan_item_id,treatment_plan_id,recommendation_id,title,item_type,status,sequence_number,due_at,created_at,updated_at,action_code,description,owner_actor_type,owner_actor_id,correlation_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(newId('tpi'),id,recIds[0]||null,item.title,'action',item.status,item.sequence,item.targetDate,timestamp,timestamp,item.actionCode,item.description,actor.role,actor.id,ctx.correlation));
  stage('journey_event',eventStmt(env.DB,{id:newId('jev'),key:`day5:treatment:${id}`,bmrId,sessionId,name:'treatment_plan_created',timestamp,actor,metadata:{treatment_plan_id:id,version_no:1,item_count:items.length},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}));
  stage('audit',auditStmt(env.DB,{id:newId('aud'),entityType:'treatment_plan',entityId:id,operation:'create',priorVersion:null,newVersion:1,actor,source:'treatment-service',change:{group_id:group,item_count:items.length},correlation:ctx.correlation,environment:ctx.environment,timestamp}));
  stage('idempotency_receipt',receiptStmt(env.DB,{id:newId('idem'),scope:'day5:treatment:create',key,fingerprint:fp,status:201,entityType:'treatment_plan',entityId:id,timestamp}));
  try{
    await env.DB.batch(staged.map(x=>x.stmt));
  }catch(error){
    console.error('GalviVault E2E-11 treatment-plan batch failure',{
      correlation_id:ctx.correlation,
      bmr_id:bmrId,
      treatment_plan_id:id,
      session_id:sessionId,
      recommendation_ids:recIds,
      finding_ids:findingIds,
      stage_order:staged.map(x=>x.name),
      message:String(error?.message||error),
      cause:String(error?.cause?.message||''),
      stack:String(error?.stack||'')
    });
    throw error;
  }
  return {treatment_plan:await findPlan(env.DB,id),links:await planLinks(env.DB,id),idempotent_replay:false};
}

export async function reviseTreatmentPlan(env,ctx,actor,key,planId,input){
  const prior=await findPlan(env.DB,requireId('treatment_plan_id',planId)); if(!prior)throw new GVError('GV_NOT_FOUND','Treatment plan was not found.',404);
  const oldLinks=await planLinks(env.DB,prior.treatment_plan_id); const recIds=Array.isArray(input.recommendation_ids)?input.recommendation_ids:oldLinks.recommendations.map(x=>x.recommendation_id); const findingIds=Array.isArray(input.finding_ids)?input.finding_ids:oldLinks.findings.map(x=>x.finding_id); await validatePlanCare(env.DB,prior.bmr_id,recIds,findingIds);
  const items=normalizeItems(input.items); const version=Number(prior.version_no||1)+1; const fp=await hash('day5:treatment:revise',{planId,version,recIds,findingIds,items}); const replayed=await replay(env.DB,'day5:treatment:revise',key,fp,async id=>({treatment_plan:await findPlan(env.DB,id),links:await planLinks(env.DB,id)})); if(replayed)return replayed;
  const bmr=await findBmr(env.DB,prior.bmr_id), timestamp=now(), id=newId('trp'), sessionId=await sessionForBmr(env.DB,bmr); const title=requireText('title',input.title||prior.name,240), objective=requireText('objective',input.objective||prior.objective||'Governed treatment revision',1600), code=requireText('treatment_code',input.treatment_code||prior.treatment_code||'TRT_REVISION',120);
  const stmts=[env.DB.prepare(`UPDATE gv1_treatment_plans SET status='superseded',updated_at=? WHERE treatment_plan_id=?`).bind(timestamp,prior.treatment_plan_id),env.DB.prepare(`INSERT INTO gv1_treatment_plans
    (treatment_plan_id,bmr_id,name,status,start_date,target_end_date,evidence_version,created_at,updated_at,treatment_plan_group_id,version_no,supersedes_treatment_plan_id,treatment_code,objective,owner_actor_type,owner_actor_id,target_outcomes_json,created_by_type,created_by_id,correlation_id)
    VALUES (?,?,?,?,?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,prior.bmr_id,title,input.status||'approved',input.start_date||prior.start_date,input.target_end_date||prior.target_end_date,timestamp,timestamp,prior.treatment_plan_group_id,version,prior.treatment_plan_id,code,objective,actor.role,actor.id,JSON.stringify(input.target_outcomes||JSON.parse(prior.target_outcomes_json||'[]')),actor.role,actor.id,ctx.correlation)];
  for(const rid of recIds) stmts.push(env.DB.prepare(`INSERT INTO gv1_treatment_plan_recommendations VALUES (?,?,?,?)`).bind(id,rid,timestamp,ctx.correlation)); for(const fid of findingIds) stmts.push(env.DB.prepare(`INSERT INTO gv1_treatment_plan_findings VALUES (?,?,?,?)`).bind(id,fid,timestamp,ctx.correlation)); for(const item of items) stmts.push(env.DB.prepare(`INSERT INTO gv1_treatment_plan_items (treatment_plan_item_id,treatment_plan_id,recommendation_id,title,item_type,status,sequence_number,due_at,created_at,updated_at,action_code,description,owner_actor_type,owner_actor_id,correlation_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(newId('tpi'),id,recIds[0]||null,item.title,'action',item.status,item.sequence,item.targetDate,timestamp,timestamp,item.actionCode,item.description,actor.role,actor.id,ctx.correlation));
  stmts.push(eventStmt(env.DB,{id:newId('jev'),key:`day5:treatment_revised:${id}`,bmrId:prior.bmr_id,sessionId,name:'treatment_plan_revised',timestamp,actor,metadata:{treatment_plan_id:id,supersedes:prior.treatment_plan_id,version_no:version},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),auditStmt(env.DB,{id:newId('aud'),entityType:'treatment_plan',entityId:id,operation:'revise',priorVersion:Number(prior.version_no||1),newVersion:version,actor,source:'treatment-service',change:{supersedes:prior.treatment_plan_id},correlation:ctx.correlation,environment:ctx.environment,timestamp}),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:treatment:revise',key,fingerprint:fp,status:201,entityType:'treatment_plan',entityId:id,timestamp})); await env.DB.batch(stmts); return {treatment_plan:await findPlan(env.DB,id),links:await planLinks(env.DB,id),idempotent_replay:false};
}

export async function recordTreatmentEvent(env,ctx,actor,key,planId,input){
  const plan=await findPlan(env.DB,requireId('treatment_plan_id',planId)); if(!plan)throw new GVError('GV_NOT_FOUND','Treatment plan was not found.',404); let itemId=input.treatment_plan_item_id; if(!itemId){const row=await first(env.DB,`SELECT treatment_plan_item_id FROM gv1_treatment_plan_items WHERE treatment_plan_id=? ORDER BY sequence_number LIMIT 1`,plan.treatment_plan_id);itemId=row?.treatment_plan_item_id;} const item=await findPlanItem(env.DB,requireId('treatment_plan_item_id',itemId)); if(!item||item.treatment_plan_id!==plan.treatment_plan_id)throw new GVError('GV_REQ_SCHEMA','Treatment event item must belong to the treatment plan.',422);
  const eventType=requireText('event_type',input.event_type,120), occurredAt=requireText('occurred_at',input.occurred_at,80); const fp=await hash('day5:treatment:event',{planId,itemId,eventType,occurredAt,notes:input.notes||null}); const replayed=await replay(env.DB,'day5:treatment:event',key,fp,async id=>({treatment_event:await first(env.DB,`SELECT * FROM gv1_treatment_events WHERE treatment_event_id=?`,id)})); if(replayed)return replayed;
  const timestamp=now(), id=newId('tre'), bmr=await findBmr(env.DB,plan.bmr_id), sessionId=await sessionForBmr(env.DB,bmr); await env.DB.batch([env.DB.prepare(`INSERT INTO gv1_treatment_events (treatment_event_id,treatment_plan_item_id,event_type,event_payload_json,occurred_at,created_at,treatment_plan_id,bmr_id,actor_type,actor_id,notes,metadata_json,correlation_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,itemId,eventType,JSON.stringify(input.metadata||{}),occurredAt,timestamp,plan.treatment_plan_id,plan.bmr_id,actor.role,actor.id,optionalText('notes',input.notes,1000),JSON.stringify(input.metadata||{}),ctx.correlation),eventStmt(env.DB,{id:newId('jev'),key:`day5:treatment_event:${id}`,bmrId:plan.bmr_id,sessionId,name:'treatment_event_recorded',timestamp,actor,metadata:{treatment_event_id:id,treatment_plan_id:plan.treatment_plan_id},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:treatment:event',key,fingerprint:fp,status:201,entityType:'treatment_event',entityId:id,timestamp})]); return {treatment_event:await first(env.DB,`SELECT * FROM gv1_treatment_events WHERE treatment_event_id=?`,id),idempotent_replay:false};
}

export async function recordOutcome(env,ctx,actor,key,input){
  const bmrId=requireId('bmr_id',input.bmr_id), bmr=await findBmr(env.DB,bmrId); if(!bmr)throw new GVError('GV_NOT_FOUND','BMR was not found.',404); const planId=input.treatment_plan_id?requireId('treatment_plan_id',input.treatment_plan_id):null, recId=input.recommendation_id?requireId('recommendation_id',input.recommendation_id):null; if(!planId&&!recId)throw new GVError('GV_LINEAGE_REQUIRED','Outcome requires a treatment plan or recommendation relation.',422); if(planId){const p=await findPlan(env.DB,planId);if(!p||p.bmr_id!==bmrId)throw new GVError('GV_AUTH_FORBIDDEN','Outcome treatment relation must belong to the same BMR.',403);} if(recId){const r=await findRecommendation(env.DB,recId);if(!r||r.bmr_id!==bmrId)throw new GVError('GV_AUTH_FORBIDDEN','Outcome recommendation relation must belong to the same BMR.',403);}
  const outcomeCode=requireText('outcome_code',input.outcome_code,120), outcomeType=requireText('outcome_type',input.outcome_type,80), observedAt=requireText('observed_at',input.observed_at,80), sourceType=requireText('source_type',input.source_type,80), sourceRef=optionalText('source_ref',input.source_ref,240); if(input.value===undefined&&input.value_number===undefined&&input.value_text===undefined&&input.value_boolean===undefined)throw new GVError('GV_REQ_SCHEMA','Outcome requires an observed value.',422); const value=input.value??input.value_number??input.value_text??input.value_boolean;
  const evidenceIds=Array.isArray(input.evidence_ids)?input.evidence_ids:[]; for(const eid of evidenceIds){const row=await first(env.DB,`SELECT evidence_id,bmr_id FROM gv1_evidence_items WHERE evidence_id=?`,requireId('evidence_id',eid));if(!row)throw new GVError('GV_NOT_FOUND','Outcome evidence was not found.',404);if(row.bmr_id!==bmrId)throw new GVError('GV_AUTH_FORBIDDEN','Cross-BMR outcome evidence is prohibited.',403);}
  const fp=await hash('day5:outcome:create',{bmrId,planId,recId,outcomeCode,outcomeType,value,observedAt,sourceType,sourceRef,evidenceIds}); const replayed=await replay(env.DB,'day5:outcome:create',key,fp,async id=>({outcome:await findOutcome(env.DB,id),links:await outcomeLinks(env.DB,id)})); if(replayed)return replayed;
  const timestamp=now(), id=newId('out'), group=newId('oug'), sessionId=await sessionForBmr(env.DB,bmr); await env.DB.batch([env.DB.prepare(`INSERT INTO gv1_outcomes (outcome_id,bmr_id,treatment_plan_id,outcome_type,outcome_value_json,measured_at,created_at,outcome_group_id,version_no,supersedes_outcome_id,recommendation_id,outcome_code,source_type,source_ref,status,created_by_type,created_by_id,correlation_id) VALUES (?,?,?,?,?,?,?, ?,1,NULL,?,?,?,?,?,?,?,?)`).bind(id,bmrId,planId,outcomeType,JSON.stringify(value),observedAt,timestamp,group,recId,outcomeCode,sourceType,sourceRef,'observed',actor.role,actor.id,ctx.correlation),...evidenceIds.map(eid=>env.DB.prepare(`INSERT INTO gv1_outcome_evidence (outcome_id,evidence_id,created_at,relationship_type,correlation_id) VALUES (?,?,?,?,?)`).bind(id,eid,timestamp,'supports',ctx.correlation)),eventStmt(env.DB,{id:newId('jev'),key:`day5:outcome:${id}`,bmrId,sessionId,name:'outcome_recorded',timestamp,actor,metadata:{outcome_id:id,treatment_plan_id:planId,recommendation_id:recId},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),auditStmt(env.DB,{id:newId('aud'),entityType:'outcome',entityId:id,operation:'create',priorVersion:null,newVersion:1,actor,source:sourceType,change:{group_id:group},correlation:ctx.correlation,environment:ctx.environment,timestamp}),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:outcome:create',key,fingerprint:fp,status:201,entityType:'outcome',entityId:id,timestamp})]); return {outcome:await findOutcome(env.DB,id),links:await outcomeLinks(env.DB,id),idempotent_replay:false};
}

export async function createFeedback(env,ctx,actor,key,input){
  const bmrId=requireId('bmr_id',input.bmr_id), bmr=await findBmr(env.DB,bmrId); if(!bmr)throw new GVError('GV_NOT_FOUND','BMR was not found.',404); const targetType=requireText('target_type',input.target_type,80), targetId=requireId('target_id',input.target_id), feedbackType=enumValue('feedback_type',input.feedback_type,FEEDBACK_TYPES), source=requireText('source',input.source||actor.role,80); const fp=await hash('day5:feedback:create',{bmrId,targetType,targetId,feedbackType,disposition:input.disposition||null,comment:input.comment||null}); const replayed=await replay(env.DB,'day5:feedback:create',key,fp,async id=>({feedback:await first(env.DB,`SELECT * FROM gv1_feedback WHERE feedback_id=?`,id)})); if(replayed)return replayed; const timestamp=now(), id=newId('fbk'), sessionId=await sessionForBmr(env.DB,bmr); await env.DB.batch([env.DB.prepare(`INSERT INTO gv1_feedback (feedback_id,bmr_id,session_id,feedback_type,feedback_text,rating,created_at,target_type,target_id,disposition,actor_type,actor_id,source,correlation_id) VALUES (?,?,?,?,?,NULL,?,?,?,?,?,?,?,?)`).bind(id,bmrId,bmr.current_session_id,feedbackType,optionalText('comment',input.comment,1000),timestamp,targetType,targetId,optionalText('disposition',input.disposition,120),actor.role,actor.id,source,ctx.correlation),eventStmt(env.DB,{id:newId('jev'),key:`day5:feedback:${id}`,bmrId,sessionId,name:'feedback_recorded',timestamp,actor,metadata:{feedback_id:id,target_type:targetType,target_id:targetId},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:feedback:create',key,fingerprint:fp,status:201,entityType:'feedback',entityId:id,timestamp})]); return {feedback:await first(env.DB,`SELECT * FROM gv1_feedback WHERE feedback_id=?`,id),idempotent_replay:false};
}

export async function createLearningCandidate(env,ctx,actor,key,input){
  const type=requireText('candidate_type',input.candidate_type,120), title=requireText('title',input.title,240), proposed=input.proposed_change??input.proposal; if(proposed===undefined)throw new GVError('GV_REQ_SCHEMA','proposed_change is required.',422); const rationale=requireText('rationale',input.rationale,1600), risk=optionalText('risk_summary',input.risk_summary,1000); const bmrId=input.bmr_id?requireId('bmr_id',input.bmr_id):null; if(bmrId&&!await findBmr(env.DB,bmrId))throw new GVError('GV_NOT_FOUND','BMR was not found.',404); const fp=await hash('day5:learning:create',{type,title,proposed,rationale,risk,bmrId}); const replayed=await replay(env.DB,'day5:learning:create',key,fp,async id=>({learning_candidate:await findLearningCandidate(env.DB,id)})); if(replayed)return replayed; const timestamp=now(), id=newId('lrc'); await env.DB.batch([env.DB.prepare(`INSERT INTO gv1_learning_candidates (learning_candidate_id,bmr_id,candidate_type,candidate_payload_json,status,created_at,updated_at,title,rationale,risk_summary,proposed_by_type,proposed_by_id,correlation_id) VALUES (?,?,?,?, 'proposed',?,?,?,?,?,?,?,?)`).bind(id,bmrId,type,JSON.stringify(proposed),timestamp,timestamp,title,rationale,risk,actor.role,actor.id,ctx.correlation),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:learning:create',key,fingerprint:fp,status:201,entityType:'learning_candidate',entityId:id,timestamp})]); return {learning_candidate:await findLearningCandidate(env.DB,id),idempotent_replay:false};
}

export async function reviewLearningCandidate(env,ctx,actor,key,id,input){
  const row=await findLearningCandidate(env.DB,requireId('learning_candidate_id',id)); if(!row)throw new GVError('GV_NOT_FOUND','Learning candidate was not found.',404); const decision=enumValue('decision',input.decision,['approve','reject']); const fp=await hash('day5:learning:review',{id,decision}); const replayed=await replay(env.DB,'day5:learning:review',key,fp,async entity=>({learning_candidate:await findLearningCandidate(env.DB,entity)})); if(replayed)return replayed; const timestamp=now(), status=decision==='approve'?'approved':'rejected'; await env.DB.batch([env.DB.prepare(`UPDATE gv1_learning_candidates SET status=?,reviewed_by_type=?,reviewed_by_id=?,reviewed_at=?,updated_at=?,correlation_id=? WHERE learning_candidate_id=?`).bind(status,actor.role,actor.id,timestamp,timestamp,ctx.correlation,row.learning_candidate_id),auditStmt(env.DB,{id:newId('aud'),entityType:'learning_candidate',entityId:row.learning_candidate_id,operation:'review',priorVersion:null,newVersion:null,actor,source:'governance-service',change:{status},correlation:ctx.correlation,environment:ctx.environment,timestamp}),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:learning:review',key,fingerprint:fp,status:200,entityType:'learning_candidate',entityId:row.learning_candidate_id,timestamp})]); return {learning_candidate:await findLearningCandidate(env.DB,row.learning_candidate_id),idempotent_replay:false};
}

export async function transitionCareBmr(env,ctx,actor,key,bmrId,input){
  const bmr=await findBmr(env.DB,requireId('bmr_id',bmrId)); if(!bmr)throw new GVError('GV_NOT_FOUND','BMR was not found.',404); const expected=Number(input.expected_version); if(!Number.isInteger(expected)||expected!==Number(bmr.record_version))throw new GVError('GV_VERSION_CONFLICT','expected_version does not match the current BMR version.',409); const to=clean(input.to_status); const allowed=(['active','under_review'].includes(bmr.status)&&to==='treatment_active')||(bmr.status==='treatment_active'&&to==='monitoring')||(bmr.status==='monitoring'&&['treatment_active','active','closed'].includes(to))||(bmr.status==='closed'&&to==='active'); if(!allowed)throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION',`Transition ${bmr.status} -> ${to||'(missing)'} is not permitted by the Day 5 care contract.`,409); if(to==='treatment_active'){const plan=await first(env.DB,`SELECT treatment_plan_id FROM gv1_treatment_plans WHERE bmr_id=? AND status IN ('approved','active') AND NOT EXISTS (SELECT 1 FROM gv1_treatment_plans n WHERE n.supersedes_treatment_plan_id=gv1_treatment_plans.treatment_plan_id) LIMIT 1`,bmr.bmr_id);if(!plan)throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','An approved treatment plan is required.',409);} const fp=await hash('day5:bmr:transition',{bmrId,to,expected}); const replayed=await replay(env.DB,'day5:bmr:transition',key,fp,async()=>({bmr:await findBmr(env.DB,bmrId)})); if(replayed)return replayed; const timestamp=now(), next=expected+1, sessionId=await sessionForBmr(env.DB,bmr); await env.DB.batch([env.DB.prepare(`UPDATE gv1_business_medical_records SET status=?,record_version=?,updated_at=? WHERE bmr_id=? AND record_version=?`).bind(to,next,timestamp,bmr.bmr_id,expected),eventStmt(env.DB,{id:newId('jev'),key:`day5:bmr_${to}:${bmr.bmr_id}:${next}`,bmrId:bmr.bmr_id,sessionId,name:`bmr_${to}`,timestamp,actor,metadata:{from:bmr.status,to,record_version:next},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),auditStmt(env.DB,{id:newId('aud'),entityType:'business_medical_record',entityId:bmr.bmr_id,operation:'transition',priorVersion:expected,newVersion:next,actor,source:'care-service',change:{from:bmr.status,to},correlation:ctx.correlation,environment:ctx.environment,timestamp}),receiptStmt(env.DB,{id:newId('idem'),scope:'day5:bmr:transition',key,fingerprint:fp,status:200,entityType:'business_medical_record',entityId:bmr.bmr_id,timestamp})]); return {bmr:await findBmr(env.DB,bmr.bmr_id),idempotent_replay:false};
}

export async function getCare(env,bmrId,options){const bmr=await findBmr(env.DB,requireId('bmr_id',bmrId));if(!bmr)throw new GVError('GV_NOT_FOUND','BMR was not found.',404);return{bmr:{bmr_id:bmr.bmr_id,venture_id:bmr.venture_id,status:bmr.status,record_version:bmr.record_version,current_session_id:bmr.current_session_id},...(await listCare(env.DB,bmr.bmr_id,options))};}

async function maybeRecordForcedAdapterFailure(env,ctx,{bmrId,entityType,entityId,sourceEventId,adapterName,force}){if(!force||clean(env.FIXTURE_MODE).toLowerCase()!=='true')return null;const adapter=enumValue('adapter_name',adapterName,ADAPTERS,'hubspot'),timestamp=now(),id=newId('adl');try{await env.DB.prepare(`INSERT OR IGNORE INTO gv1_adapter_deliveries (adapter_delivery_id,bmr_id,adapter_name,delivery_type,status,request_reference,response_reference,attempted_at,completed_at,created_at,event_type,entity_type,entity_id,source_event_id,attempt_count,next_attempt_at,safe_error_code,safe_error_message,correlation_id,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,bmrId,adapter,'day5_canonical_handoff','failed',entityId,null,timestamp,null,timestamp,'canonical_handoff',entityType,entityId,sourceEventId,1,null,'GV_ADAPTER_FORCED_FAILURE','QA forced adapter failure',ctx.correlation,timestamp).run();}catch(error){console.error('Day 5 adapter delivery recording failed',error?.message||error);}return id;}

export async function retryAdapterDelivery(env,ctx,actor,id){const row=await findAdapterDelivery(env.DB,requireId('adapter_delivery_id',id));if(!row)throw new GVError('GV_NOT_FOUND','Adapter delivery was not found.',404);const timestamp=now();await env.DB.prepare(`UPDATE gv1_adapter_deliveries SET status='delivered',attempt_count=attempt_count+1,safe_error_code=NULL,safe_error_message=NULL,completed_at=?,updated_at=?,correlation_id=? WHERE adapter_delivery_id=?`).bind(timestamp,timestamp,ctx.correlation,row.adapter_delivery_id).run();return{delivery:await findAdapterDelivery(env.DB,row.adapter_delivery_id)};}

export async function recordStripeWebhook(env,ctx,event){const eventId=requireId('stripe_event_id',event.id),timestamp=now();const existing=await first(env.DB,`SELECT * FROM gv1_adapter_deliveries WHERE adapter_name='stripe' AND source_event_id=?`,eventId);if(existing)return{delivery:existing,idempotent_replay:true};const id=newId('adl');await env.DB.prepare(`INSERT INTO gv1_adapter_deliveries (adapter_delivery_id,bmr_id,adapter_name,delivery_type,status,request_reference,response_reference,attempted_at,completed_at,created_at,event_type,entity_type,entity_id,source_event_id,attempt_count,next_attempt_at,safe_error_code,safe_error_message,correlation_id,updated_at) VALUES (NULLIF(?,''),NULL,'stripe','provider_event','delivered',?,?, ?,?,?, ?,NULL,NULL,?,1,NULL,NULL,NULL,?,?)`).bind(id,eventId,event.type||'unknown',timestamp,timestamp,timestamp,event.type||'provider_event',eventId,ctx.correlation,timestamp).run();return{delivery:await findAdapterDelivery(env.DB,id),idempotent_replay:false};}