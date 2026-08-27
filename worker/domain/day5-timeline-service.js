import { requireId } from '../day5-common.js';
import { all } from '../repositories/care-repository.js';
import { getTimeline as getDay4Timeline } from './bmr-service.js';

export async function getDay5Timeline(env,bmrId,{limit=100}={}){
  bmrId=requireId('bmr_id',bmrId);
  const safeLimit=Math.max(1,Math.min(200,Number(limit)||100));
  const base=await getDay4Timeline(env,bmrId,{limit:safeLimit});

  // Preserve the Day 4 remote-D1-safe pattern: bounded sequential single-table
  // reads and Worker-side typing/merge, rather than compound UNION queries.
  const recommendations=await all(env.DB,`SELECT recommendation_id,version_no,created_at,source_type,correlation_id FROM gv1_recommendations WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const plans=await all(env.DB,`SELECT treatment_plan_id,version_no,created_at,correlation_id FROM gv1_treatment_plans WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const events=await all(env.DB,`SELECT treatment_event_id,occurred_at,actor_type,correlation_id FROM gv1_treatment_events WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const outcomes=await all(env.DB,`SELECT outcome_id,version_no,measured_at,created_at,source_type,correlation_id FROM gv1_outcomes WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const feedback=await all(env.DB,`SELECT feedback_id,created_at,source,correlation_id FROM gv1_feedback WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const findingDecisions=await all(env.DB,`SELECT finding_decision_id,version_no,decision,actor_type,correlation_id,created_at FROM gv1_finding_decisions WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const rx=await all(env.DB,`SELECT rx_id,version_no,status,actor_type,correlation_id,created_at FROM gv1_galvirx WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const audits=await all(env.DB,`SELECT audit_order_id,status,actor_type,correlation_id,created_at,updated_at FROM gv1_galviaudit_orders WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const referrals=await all(env.DB,`SELECT referral_id,status,actor_type,correlation_id,created_at,updated_at FROM gv1_referrals WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const checkins=await all(env.DB,`SELECT checkin_id,adherence_state,actor_type,correlation_id,created_at FROM gv1_checkins WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const milestones=await all(env.DB,`SELECT milestone_id,status,actor_type,correlation_id,created_at FROM gv1_milestones WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);
  const reassessments=await all(env.DB,`SELECT reassessment_id,decision,actor_type,correlation_id,created_at FROM gv1_reassessments WHERE bmr_id=? LIMIT ?`,bmrId,safeLimit);

  const additions=[
    ...recommendations.map(row=>({entry_type:'recommendation',canonical_id:row.recommendation_id,version_no:row.version_no??null,occurred_at:row.created_at,source:row.source_type||null,safe_summary:'recommendation',correlation_id:row.correlation_id||null})),
    ...plans.map(row=>({entry_type:'treatment_plan',canonical_id:row.treatment_plan_id,version_no:row.version_no??null,occurred_at:row.created_at,source:'treatment-service',safe_summary:'treatment plan',correlation_id:row.correlation_id||null})),
    ...events.map(row=>({entry_type:'treatment_event',canonical_id:row.treatment_event_id,version_no:null,occurred_at:row.occurred_at,source:row.actor_type||'treatment-service',safe_summary:'treatment event',correlation_id:row.correlation_id||null})),
    ...outcomes.map(row=>({entry_type:'outcome',canonical_id:row.outcome_id,version_no:row.version_no??null,occurred_at:row.measured_at||row.created_at,source:row.source_type||null,safe_summary:'outcome',correlation_id:row.correlation_id||null})),
    ...feedback.map(row=>({entry_type:'feedback',canonical_id:row.feedback_id,version_no:null,occurred_at:row.created_at,source:row.source||null,safe_summary:'feedback',correlation_id:row.correlation_id||null})),
    ...findingDecisions.map(row=>({entry_type:'finding_decision',canonical_id:row.finding_decision_id,version_no:row.version_no??null,occurred_at:row.created_at,source:row.actor_type||'Business Physician',safe_summary:`finding ${row.decision||'decision'}`,correlation_id:row.correlation_id||null})),
    ...rx.map(row=>({entry_type:'galvirx',canonical_id:row.rx_id,version_no:row.version_no??null,occurred_at:row.created_at,source:row.actor_type||'Business Physician',safe_summary:`GalviRx ${row.status||'active'}`,correlation_id:row.correlation_id||null})),
    ...audits.map(row=>({entry_type:'galviaudit',canonical_id:row.audit_order_id,version_no:null,occurred_at:row.updated_at||row.created_at,source:row.actor_type||'GalviLab',safe_summary:`GalviAudit ${row.status||'ordered'}`,correlation_id:row.correlation_id||null})),
    ...referrals.map(row=>({entry_type:'referral',canonical_id:row.referral_id,version_no:null,occurred_at:row.updated_at||row.created_at,source:row.actor_type||'referral-care',safe_summary:`referral ${row.status||'proposed'}`,correlation_id:row.correlation_id||null})),
    ...checkins.map(row=>({entry_type:'checkin',canonical_id:row.checkin_id,version_no:null,occurred_at:row.created_at,source:row.actor_type||'continuous-care',safe_summary:`check-in ${row.adherence_state||'recorded'}`,correlation_id:row.correlation_id||null})),
    ...milestones.map(row=>({entry_type:'milestone',canonical_id:row.milestone_id,version_no:null,occurred_at:row.created_at,source:row.actor_type||'continuous-care',safe_summary:`milestone ${row.status||'recorded'}`,correlation_id:row.correlation_id||null})),
    ...reassessments.map(row=>({entry_type:'reassessment',canonical_id:row.reassessment_id,version_no:null,occurred_at:row.created_at,source:row.actor_type||'Business Physician',safe_summary:`reassessment ${row.decision||'recorded'}`,correlation_id:row.correlation_id||null}))
  ];

  const entries=[...(base.entries||[]),...additions];
  entries.sort((a,b)=>{
    const at=String(a.occurred_at||''), bt=String(b.occurred_at||'');
    if(at!==bt) return at<bt?-1:1;
    const ai=String(a.canonical_id||''), bi=String(b.canonical_id||'');
    return ai<bi?-1:ai>bi?1:0;
  });
  return {...base,entries:entries.slice(0,safeLimit)};
}
