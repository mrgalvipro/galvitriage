import { GVError, clean, hash, now } from '../day5-common.js';

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const parse=(v,f={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return f}};
const text=(v,max=4000)=>String(v??'').trim().slice(0,max);
const refs=v=>(Array.isArray(v)?v:[]).map(x=>text(x,240)).filter(Boolean).slice(0,20);
const ALLOWED_DECISIONS=new Set(['remain_pre_founder','continue_founder_development','hold_for_more_evidence']);

export async function recordPreFounderCommercialReassessment(env,ctx,request,identity,queueId,input={}){
  if(identity?.role!=='business_physician') throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
  const key=clean(request.headers.get('Idempotency-Key'));
  if(!key) throw new GVError('GV_IDEMPOTENCY_REQUIRED','Idempotency-Key is required.',422);

  const row=await first(env.DB,`SELECT q.queue_id,q.status,q.order_id,q.source_completion_ref,q.physician_decision_json,q.customer_confirmed_at,q.reviewed_at,
      o.principal_id,o.context_id,o.bmr_id AS order_bmr_id,o.service_code,o.status AS order_status,o.completed_at,o.customer_confirmed_at AS order_customer_confirmed_at,o.studio_engagement_id,
      c.lifecycle_state,c.record_mode,c.venture_id,c.bmr_id AS context_bmr_id
    FROM gv1_care_reassessment_queue q
    JOIN gv1_commercial_care_orders o ON o.order_id=q.order_id
    JOIN gv1_principal_contexts c ON c.context_id=o.context_id
    WHERE q.queue_id=? LIMIT 1`,queueId);
  if(!row) throw new GVError('GV_NOT_FOUND','Commercial reassessment queue item was not found.',404);

  const prior=parse(row.physician_decision_json,null);
  if(['reviewed','closed'].includes(row.status)){
    if(prior?.client_request_id===key) return {queue:{...row,physician_decision:prior},idempotent_replay:true,manual_repair:'NO'};
    throw new GVError('GV_REASSESSMENT_ALREADY_RECORDED','This treatment reassessment has already been recorded.',409);
  }
  if(row.status!=='pending') throw new GVError('GV_REASSESSMENT_NOT_READY','Provider completion and customer return confirmation are required before Business Physician reassessment.',409,{queue_status:row.status});
  if(row.order_status!=='customer_confirmed'||!row.completed_at||!row.order_customer_confirmed_at||!row.customer_confirmed_at)
    throw new GVError('GV_REASSESSMENT_NOT_READY','The commercial treatment loop is not yet provider-complete and customer-confirmed.',409);
  if(row.lifecycle_state!=='pre_founder'||row.record_mode!=='principal_only'||row.venture_id!==null||row.context_bmr_id!==null||row.order_bmr_id!==null)
    throw new GVError('GV_SCOPE_MISMATCH','Scenario A commercial reassessment requires the canonical principal-only Pre-Founder context.',409);

  const decision=clean(input.decision||'remain_pre_founder');
  if(!ALLOWED_DECISIONS.has(decision)) throw new GVError('GV_REQ_SCHEMA','Scenario A reassessment may remain Pre-Founder, continue Founder Development, or hold for more evidence. Venture formation must use the separate governed Scenario C lifecycle-review path.',422);
  const reassessmentSummary=text(input.reassessment_summary);
  if(reassessmentSummary.length<20) throw new GVError('GV_REQ_SCHEMA','reassessment_summary must contain at least 20 characters of Business Physician rationale.',422);
  const nextStep=text(input.next_step||'Remain Pre-Founder and continue evidence-building until genuine operating-venture evidence supports a separate Scenario C lifecycle review.',1200);
  const evidenceRefs=refs(input.evidence_refs);
  const fp=await hash('day7:commercial-reassessment',{queue_id:row.queue_id,order_id:row.order_id,principal_id:row.principal_id,decision,reassessment_summary:reassessmentSummary,next_step:nextStep,evidence_refs:evidenceRefs,actor_id:identity.operator_id});
  const ts=now();
  const physicianDecision={
    decision,
    reassessment_summary:reassessmentSummary,
    next_step:nextStep,
    evidence_refs:evidenceRefs,
    lifecycle_before:'pre_founder',
    lifecycle_after:'pre_founder',
    canonical_transition_applied:false,
    scenario_c_route:'separate_governed_lifecycle_review_required',
    actor_type:'business_physician',
    actor_id:identity.operator_id,
    client_request_id:key,
    request_fingerprint:fp,
    decided_at:ts
  };

  const statements=[
    env.DB.prepare(`UPDATE gv1_care_reassessment_queue SET status='reviewed',physician_decision_json=?,reviewed_at=? WHERE queue_id=? AND status='pending'`).bind(JSON.stringify(physicianDecision),ts,row.queue_id),
    env.DB.prepare(`UPDATE gv1_commercial_care_orders SET status='fulfilled',updated_at=? WHERE order_id=? AND status='customer_confirmed'`).bind(ts,row.order_id)
  ];
  if(row.studio_engagement_id) statements.push(env.DB.prepare(`UPDATE gv1_studio_engagements SET status='completed',updated_at=? WHERE engagement_id=? AND status IN ('accepted','active','waiting_evidence')`).bind(ts,row.studio_engagement_id));
  await env.DB.batch(statements);

  const context=await first(env.DB,`SELECT context_id,founder_id,lifecycle_state,record_mode,venture_id,bmr_id,status,updated_at FROM gv1_principal_contexts WHERE context_id=?`,row.context_id);
  if(!context||context.lifecycle_state!=='pre_founder'||context.record_mode!=='principal_only'||context.venture_id!==null||context.bmr_id!==null)
    throw new GVError('GV_LIFECYCLE_INTEGRITY','Reassessment must not transition a Scenario A Pre-Founder or create a venture/BHR.',409);
  const queue=await first(env.DB,`SELECT queue_id,status,order_id,reason_code,source_completion_ref,physician_decision_json,customer_confirmed_at,reviewed_at FROM gv1_care_reassessment_queue WHERE queue_id=?`,row.queue_id);
  return {queue:{...queue,physician_decision:parse(queue.physician_decision_json,{})},context,order_status:'fulfilled',idempotent_replay:false,manual_repair:'NO'};
}
