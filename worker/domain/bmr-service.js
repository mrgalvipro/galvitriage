import { GVError, newId, now, hash, requireId } from '../day4-common.js';
import { all, findBmr, loadReceipt, receiptStmt } from '../repositories/reasoning-repository.js';

export async function getTimeline(env,bmrId,{limit=100}={}){
  bmrId=requireId('bmr_id',bmrId);
  const bmr=await findBmr(env.DB,bmrId);
  if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const safeLimit=Math.max(1,Math.min(200,Number(limit)||100));

  // Keep each D1 query simple and independently bindable. The previous compound
  // UNION query passed local SQLite tests but returned GV_INTERNAL from deployed
  // Cloudflare D1 at H4.14. Merge the bounded typed projections in Worker code so
  // the canonical timeline remains deterministic without relying on a compound
  // remote SQL execution path.
  const [sessions,evidence,observations,hypotheses,findings,governance] = await Promise.all([
    all(env.DB,`SELECT session_id AS canonical_id,NULL AS version_no,COALESCE(started_at,created_at) AS occurred_at,source,NULL AS correlation_id
      FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY occurred_at,canonical_id LIMIT ?`,bmrId,safeLimit),
    all(env.DB,`SELECT evidence_id AS canonical_id,version_no,COALESCE(captured_at,created_at) AS occurred_at,source_type AS source,NULL AS correlation_id
      FROM gv1_evidence_items WHERE bmr_id=? ORDER BY occurred_at,canonical_id LIMIT ?`,bmrId,safeLimit),
    all(env.DB,`SELECT observation_id AS canonical_id,version_no,created_at AS occurred_at,source_type AS source,correlation_id
      FROM gv1_observations WHERE bmr_id=? ORDER BY occurred_at,canonical_id LIMIT ?`,bmrId,safeLimit),
    all(env.DB,`SELECT hypothesis_id AS canonical_id,version_no,created_at AS occurred_at,source_type AS source,correlation_id
      FROM gv1_hypotheses WHERE bmr_id=? ORDER BY occurred_at,canonical_id LIMIT ?`,bmrId,safeLimit),
    all(env.DB,`SELECT finding_id AS canonical_id,version_no,created_at AS occurred_at,source_type AS source,correlation_id
      FROM gv1_findings WHERE bmr_id=? ORDER BY occurred_at,canonical_id LIMIT ?`,bmrId,safeLimit),
    all(env.DB,`SELECT entity_id AS canonical_id,new_version AS version_no,occurred_at,source,operation AS safe_summary,correlation_id
      FROM gv1_audit_log
      WHERE (entity_type='business_medical_record' AND entity_id=?)
         OR (entity_type='finding' AND entity_id IN (SELECT finding_id FROM gv1_findings WHERE bmr_id=?))
      ORDER BY occurred_at,canonical_id LIMIT ?`,bmrId,bmrId,safeLimit)
  ]);

  const typed = [
    ...sessions.map(row=>({...row,entry_type:'session',safe_summary:'assessment session'})),
    ...evidence.map(row=>({...row,entry_type:'evidence',safe_summary:'evidence'})),
    ...observations.map(row=>({...row,entry_type:'observation',safe_summary:'observation'})),
    ...hypotheses.map(row=>({...row,entry_type:'hypothesis',safe_summary:'hypothesis'})),
    ...findings.map(row=>({...row,entry_type:'finding',safe_summary:'finding'})),
    ...governance.map(row=>({...row,entry_type:'governance',safe_summary:row.safe_summary||'governance'}))
  ];

  typed.sort((a,b)=>{
    const at=String(a.occurred_at||'');
    const bt=String(b.occurred_at||'');
    if(at!==bt) return at<bt?-1:1;
    const ai=String(a.canonical_id||'');
    const bi=String(b.canonical_id||'');
    return ai<bi?-1:ai>bi?1:0;
  });

  return {
    bmr:{bmr_id:bmr.bmr_id,venture_id:bmr.venture_id,status:bmr.status,record_version:bmr.record_version,current_session_id:bmr.current_session_id},
    entries:typed.slice(0,safeLimit)
  };
}

export async function transitionBmr(env,ctx,actor,key,bmrId,input){
  bmrId=requireId('bmr_id',bmrId);
  const bmr=await findBmr(env.DB,bmrId);
  if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const expected=Number(input.expected_version);
  const toStatus=String(input.to_status||'').trim();
  const reason=String(input.reason_code||input.reason||`day4_${toStatus}`).trim().slice(0,120);
  const scope=`day4:bmr:${toStatus}`;
  const fp=await hash(scope,{bmrId,expected,to_status:toStatus,reason,actor});
  const receipt=await loadReceipt(env.DB,scope,key);
  if(receipt){
    if(receipt.request_fingerprint!==fp) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','The idempotency key was reused with different content.',409);
    return {bmr:await findBmr(env.DB,bmrId),idempotent_replay:true};
  }
  if(!Number.isInteger(expected)||expected!==Number(bmr.record_version)) throw new GVError('GV_VERSION_CONFLICT','expected_version does not match the current BMR version.',409);
  const allowed=(bmr.status==='active'&&toStatus==='assessment_in_progress')||(bmr.status==='assessment_in_progress'&&toStatus==='under_review');
  if(!allowed) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION',`Transition ${bmr.status} -> ${toStatus||'(missing)'} is not permitted by the Day 4 critical path.`,409);
  if(!bmr.current_session_id) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','A current session is required for the requested transition.',409);
  const timestamp=now(); const nextVersion=expected+1;
  await env.DB.batch([
    env.DB.prepare(`UPDATE gv1_business_medical_records SET status=?,record_version=?,updated_at=? WHERE bmr_id=? AND record_version=?`).bind(toStatus,nextVersion,timestamp,bmrId,expected),
    env.DB.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day4',?,?,?,?,?,?,?)`)
      .bind(newId('jev'),`day4:bmr_${toStatus}:${bmrId}:${nextVersion}`,bmrId,bmr.current_session_id,`bmr_${toStatus}`,timestamp,actor.role,JSON.stringify({prior_status:bmr.status,new_status:toStatus,record_version:nextVersion}),fp,ctx.correlation,ctx.environment,timestamp),
    env.DB.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(newId('aud'),'business_medical_record',bmrId,'transition',expected,nextVersion,actor.role,'bmr-service',reason,JSON.stringify({from:bmr.status,to:toStatus}),ctx.correlation,ctx.environment,timestamp,timestamp),
    receiptStmt(env.DB,{id:newId('idem'),scope,key,fingerprint:fp,status:200,entityType:'business_medical_record',entityId:bmrId,timestamp})
  ]);
  const updated=await findBmr(env.DB,bmrId);
  if(updated.status!==toStatus||Number(updated.record_version)!==nextVersion) throw new GVError('GV_VERSION_CONFLICT','BMR changed concurrently.',409);
  return {bmr:updated,idempotent_replay:false};
}
