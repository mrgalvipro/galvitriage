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

  const additions=[
    ...recommendations.map(row=>({entry_type:'recommendation',canonical_id:row.recommendation_id,version_no:row.version_no??null,occurred_at:row.created_at,source:row.source_type||null,safe_summary:'recommendation',correlation_id:row.correlation_id||null})),
    ...plans.map(row=>({entry_type:'treatment_plan',canonical_id:row.treatment_plan_id,version_no:row.version_no??null,occurred_at:row.created_at,source:'treatment-service',safe_summary:'treatment plan',correlation_id:row.correlation_id||null})),
    ...events.map(row=>({entry_type:'treatment_event',canonical_id:row.treatment_event_id,version_no:null,occurred_at:row.occurred_at,source:row.actor_type||'treatment-service',safe_summary:'treatment event',correlation_id:row.correlation_id||null})),
    ...outcomes.map(row=>({entry_type:'outcome',canonical_id:row.outcome_id,version_no:row.version_no??null,occurred_at:row.measured_at||row.created_at,source:row.source_type||null,safe_summary:'outcome',correlation_id:row.correlation_id||null})),
    ...feedback.map(row=>({entry_type:'feedback',canonical_id:row.feedback_id,version_no:null,occurred_at:row.created_at,source:row.source||null,safe_summary:'feedback',correlation_id:row.correlation_id||null}))
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
