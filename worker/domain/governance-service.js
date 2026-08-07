import { GVError, newId, now, hash, requireId, requireText, enumValue } from '../day4-common.js';
import { first, findFinding, findBmr, loadReceipt, receiptStmt } from '../repositories/reasoning-repository.js';

async function sessionForBmr(db,bmr){
  if(bmr.current_session_id) return bmr.current_session_id;
  const row=await first(db,`SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY created_at DESC LIMIT 1`,bmr.bmr_id);
  if(!row?.session_id) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','A current BMR session is required.',409);
  return row.session_id;
}

export async function confirmFinding(env,ctx,actor,key,input){
  const findingId=requireId('finding_id',input.finding_id||input.target_id);
  const finding=await findFinding(env.DB,findingId);
  if(!finding) throw new GVError('GV_NOT_FOUND','Finding was not found.',404);
  const expected=Number(input.expected_version);
  if(!Number.isInteger(expected)||expected!==Number(finding.governance_version)) throw new GVError('GV_VERSION_CONFLICT','expected_version does not match the current governance version.',409);
  const decision=enumValue('decision',input.decision,['confirm','reject']);
  const reason=requireText('reason',input.reason,500);
  const fp=await hash('day4:governance:finding',{findingId,expected,decision,reason,actor});
  const prior=await loadReceipt(env.DB,'day4:governance:finding',key);
  if(prior){
    if(prior.request_fingerprint!==fp) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','The idempotency key was reused with different content.',409);
    return {finding:await findFinding(env.DB,prior.response_entity_id),idempotent_replay:true};
  }
  const timestamp=now(); const nextGovernance=Number(finding.governance_version)+1; const confirmationStatus=decision==='confirm'?'confirmed':'rejected';
  const bmr=await findBmr(env.DB,finding.bmr_id); const sessionId=await sessionForBmr(env.DB,bmr);
  await env.DB.batch([
    env.DB.prepare(`UPDATE gv1_findings SET confirmation_status=?,governance_version=?,confirmation_reason=?,confirmed_by_type=?,confirmed_by_id=?,confirmed_at=?,updated_at=? WHERE finding_id=? AND governance_version=?`)
      .bind(confirmationStatus,nextGovernance,reason,actor.role,actor.id,timestamp,timestamp,findingId,expected),
    env.DB.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day4',?,?,?,?,?,?,?)`)
      .bind(newId('jev'),`day4:finding_${confirmationStatus}:${findingId}:${nextGovernance}`,finding.bmr_id,sessionId,`finding_${confirmationStatus}`,timestamp,actor.role,JSON.stringify({finding_id:findingId,governance_version:nextGovernance}),fp,ctx.correlation,ctx.environment,timestamp),
    env.DB.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(newId('aud'),'finding',findingId,confirmationStatus,expected,nextGovernance,actor.role,'governance-service',reason,JSON.stringify({confirmation_status:confirmationStatus}),ctx.correlation,ctx.environment,timestamp,timestamp),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day4:governance:finding',key,fingerprint:fp,status:200,entityType:'finding',entityId:findingId,timestamp})
  ]);
  const updated=await findFinding(env.DB,findingId);
  if(Number(updated.governance_version)!==nextGovernance) throw new GVError('GV_VERSION_CONFLICT','Finding governance state changed concurrently.',409);
  return {finding:updated,idempotent_replay:false};
}
