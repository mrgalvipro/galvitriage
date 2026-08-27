import { GVError, clean, hash, newId, now, requireId, requireText, optionalText } from '../day5-common.js';
import { first, findBmr } from '../repositories/care-repository.js';

const CLINIC_ROLES=new Set(['business_physician','galviclinician','operator','admin']);
function requireClinic(actor){if(!CLINIC_ROLES.has(clean(actor?.role).toLowerCase()))throw new GVError('GV_AUTH_FORBIDDEN','Authorized clinician scope is required.',403);}
async function receipt(db,scope,key){return first(db,`SELECT * FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=?`,scope,key);}
function receiptStmt(db,{scope,key,fp,type,id,ts}){return db.prepare(`INSERT INTO gv1_idempotency_keys (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at) VALUES (?,?,?,?,201,?,?,?)`).bind(newId('idem'),scope,key,fp,type,id,ts);}
async function replay(db,scope,key,fp,loader){const r=await receipt(db,scope,key);if(!r)return null;if(r.request_fingerprint!==fp)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused with different content.',409);return {...await loader(r.response_entity_id),idempotent_replay:true};}
function auditStmt(db,ctx,actor,{entityType,entityId,operation,change,ts}){return db.prepare(`INSERT INTO gv1_audit_log (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at) VALUES (?,?,?,?,NULL,NULL,?,'day5-active-care-result',NULL,?,?,?,?,?)`).bind(newId('aud'),entityType,entityId,operation,actor.role,JSON.stringify(change||{}),ctx.correlation,ctx.environment,ts,ts);}
function journeyStmt(db,ctx,actor,{bmrId,sessionId,eventName,entityId,fp,ts}){return db.prepare(`INSERT INTO gv1_journey_events (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at) VALUES (?,?,?,?,?,'GalviClinic','Day5',?,?,?,?,?,?,?)`).bind(newId('jev'),`day5:${eventName}:${entityId}`,bmrId,sessionId||null,eventName,ts,actor.role,JSON.stringify({entity_id:entityId}),fp,ctx.correlation,ctx.environment,ts);}
function acceptedEvidenceStmt(db,{id,bmrId,sessionId,groupId,sourceType,sourceRef,valueText,actor,fp,ts,content}){return db.prepare(`INSERT INTO gv1_evidence_items (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,evidence_group_id,version_no,supersedes_evidence_id,source_type,source_ref,value_type,value_text,status,consent_status,source_actor_type,source_actor_id,captured_at,content_hash,updated_at) VALUES (?,?,?,'active_care_result','GalviClinic',?,?,NULL,1,?,?,1,NULL,?,?,'text',?,'accepted','confirmed',?,?,?,?,?)`).bind(id,bmrId,sessionId||null,sourceRef,JSON.stringify(content||{}),ts,groupId,sourceType,sourceRef,valueText,actor.role,actor.id,ts,fp,ts);}

export async function recordGalviAuditResult(env,ctx,actor,key,auditOrderId,input){
  requireClinic(actor);auditOrderId=requireId('audit_order_id',auditOrderId);
  const order=await first(env.DB,`SELECT * FROM gv1_galviaudit_orders WHERE audit_order_id=?`,auditOrderId);if(!order)throw new GVError('GV_NOT_FOUND','GalviAudit order was not found.',404);
  const record=await findBmr(env.DB,order.bmr_id);if(!record)throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  if(input.bmr_id&&clean(input.bmr_id)!==order.bmr_id)throw new GVError('GV_AUTH_FORBIDDEN','Cross-BMR GalviAudit result is prohibited.',403);
  const summary=requireText('result_summary',input.result_summary||input.value_text,4000),sourceRef=requireText('source_ref',input.source_ref||`galviaudit:${auditOrderId}`,400),sourceType=clean(input.source_type)||'galviaudit_result';
  const fp=await hash('day5:galviaudit-result',{auditOrderId,bmr_id:order.bmr_id,summary,sourceRef,sourceType,metadata:input.metadata||{}});
  const prior=await replay(env.DB,'day5:galviaudit-result',key,fp,async id=>({evidence:await first(env.DB,`SELECT * FROM gv1_evidence_items WHERE evidence_id=?`,id),galviaudit_order:await first(env.DB,`SELECT * FROM gv1_galviaudit_orders WHERE audit_order_id=?`,auditOrderId)}));if(prior)return prior;
  if(order.result_evidence_id)throw new GVError('GV_VERSION_CONFLICT','GalviAudit order already has a governed result. Create a new diagnostic order for new evidence.',409);
  const ts=now(),evidenceId=newId('evi'),groupId=`egrp_${auditOrderId}`;
  await env.DB.batch([
    acceptedEvidenceStmt(env.DB,{id:evidenceId,bmrId:order.bmr_id,sessionId:record.current_session_id,groupId,sourceType,sourceRef,valueText:summary,actor,fp,ts,content:{audit_order_id:auditOrderId,treatment_plan_id:order.treatment_plan_id||null,finding_id:order.finding_id||null,domain:order.domain,result_summary:summary,metadata:input.metadata||{}}}),
    env.DB.prepare(`UPDATE gv1_galviaudit_orders SET status='completed',result_ref=?,result_evidence_id=?,correlation_id=?,updated_at=? WHERE audit_order_id=? AND result_evidence_id IS NULL`).bind(sourceRef,evidenceId,ctx.correlation,ts,auditOrderId),
    auditStmt(env.DB,ctx,actor,{entityType:'galviaudit_order',entityId:auditOrderId,operation:'record_result',change:{result_evidence_id:evidenceId,treatment_plan_id:order.treatment_plan_id||null,finding_id:order.finding_id||null},ts}),
    journeyStmt(env.DB,ctx,actor,{bmrId:order.bmr_id,sessionId:record.current_session_id,eventName:'galviaudit_result_recorded',entityId:auditOrderId,fp,ts}),
    receiptStmt(env.DB,{scope:'day5:galviaudit-result',key,fp,type:'evidence',id:evidenceId,ts})
  ]);
  return {evidence:await first(env.DB,`SELECT * FROM gv1_evidence_items WHERE evidence_id=?`,evidenceId),galviaudit_order:await first(env.DB,`SELECT * FROM gv1_galviaudit_orders WHERE audit_order_id=?`,auditOrderId),idempotent_replay:false};
}

export async function recordReferralOutcome(env,ctx,actor,key,referralId,input){
  requireClinic(actor);referralId=requireId('referral_id',referralId);
  const referral=await first(env.DB,`SELECT * FROM gv1_referrals WHERE referral_id=?`,referralId);if(!referral)throw new GVError('GV_NOT_FOUND','Referral was not found.',404);
  const record=await findBmr(env.DB,referral.bmr_id);if(!record)throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  if(input.bmr_id&&clean(input.bmr_id)!==referral.bmr_id)throw new GVError('GV_AUTH_FORBIDDEN','Cross-BMR referral outcome is prohibited.',403);
  if(clean(referral.consent_status)!=='consented')throw new GVError('GV_CONSENT_REQUIRED','Consent is required before a referral outcome may return to the BHR.',409);
  const summary=requireText('outcome_summary',input.outcome_summary||input.value_text,4000),sourceRef=requireText('source_ref',input.source_ref||`referral:${referralId}`,400),sourceType=clean(input.source_type)||'referral_outcome';
  const fp=await hash('day5:referral-outcome',{referralId,bmr_id:referral.bmr_id,summary,sourceRef,sourceType});
  const prior=await replay(env.DB,'day5:referral-outcome',key,fp,async id=>({evidence:await first(env.DB,`SELECT * FROM gv1_evidence_items WHERE evidence_id=?`,id),referral:await first(env.DB,`SELECT referral_id,bmr_id,treatment_plan_id,category,provider_name,consent_status,status,outcome_summary,created_at,updated_at FROM gv1_referrals WHERE referral_id=?`,referralId)}));if(prior)return prior;
  if(clean(referral.status)==='completed'&&clean(referral.outcome_summary))throw new GVError('GV_VERSION_CONFLICT','Referral already has a returned outcome. Create a corrective evidence version through governance rather than overwrite it.',409);
  const ts=now(),evidenceId=newId('evi'),groupId=`egrp_${referralId}`;
  await env.DB.batch([
    acceptedEvidenceStmt(env.DB,{id:evidenceId,bmrId:referral.bmr_id,sessionId:record.current_session_id,groupId,sourceType,sourceRef,valueText:summary,actor,fp,ts,content:{referral_id:referralId,treatment_plan_id:referral.treatment_plan_id||null,finding_id:referral.finding_id||null,category:referral.category,provider_name:referral.provider_name,outcome_summary:summary}}),
    env.DB.prepare(`UPDATE gv1_referrals SET status='completed',outcome_summary=?,correlation_id=?,updated_at=? WHERE referral_id=?`).bind(summary,ctx.correlation,ts,referralId),
    auditStmt(env.DB,ctx,actor,{entityType:'referral',entityId:referralId,operation:'record_outcome',change:{evidence_id:evidenceId,treatment_plan_id:referral.treatment_plan_id||null},ts}),
    journeyStmt(env.DB,ctx,actor,{bmrId:referral.bmr_id,sessionId:record.current_session_id,eventName:'referral_outcome_recorded',entityId:referralId,fp,ts}),
    receiptStmt(env.DB,{scope:'day5:referral-outcome',key,fp,type:'evidence',id:evidenceId,ts})
  ]);
  return {evidence:await first(env.DB,`SELECT * FROM gv1_evidence_items WHERE evidence_id=?`,evidenceId),referral:await first(env.DB,`SELECT referral_id,bmr_id,treatment_plan_id,category,provider_name,consent_status,status,outcome_summary,created_at,updated_at FROM gv1_referrals WHERE referral_id=?`,referralId),idempotent_replay:false};
}
