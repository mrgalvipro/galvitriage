import { GVError, clean, hash } from '../day5-common.js';
import { all, first } from '../repositories/care-repository.js';
import { getClinicBrief } from './day5-active-care-service.js';

const json=(value,fallback)=>{if(value===null||value===undefined||value==='')return fallback;if(typeof value==='object')return value;try{return JSON.parse(value)}catch{return fallback}};
const version=(row)=>row?.record_version==null?null:String(row.record_version);

async function canonicalTreatmentSources(db,bmrId){
  const context=await first(db,`SELECT context_id,record_version,updated_at FROM gv1_principal_contexts WHERE bmr_id=? AND status='active' ORDER BY record_version DESC,updated_at DESC LIMIT 1`,bmrId);
  if(!context)return {context_id:null,source_versions:{score:null,shot:null,sight:null,path:null},source_refs:{},generation_sources:{}};
  const score=await first(db,`SELECT result_id,record_version,created_at FROM gv1_day2_intake_results WHERE context_id=? AND bmr_id=? AND result_type='score' ORDER BY record_version DESC,created_at DESC LIMIT 1`,context.context_id,bmrId);
  const rows=await all(db,`SELECT artifact_id,product,record_version,generation_source,created_at FROM gv1_day3_governed_artifacts WHERE context_id=? AND bmr_id=? AND validation_status='accepted' AND approval_status IN ('not_required','approved') ORDER BY record_version DESC,created_at DESC`,context.context_id,bmrId);
  const latest=(product)=>rows.find(row=>row.product===product)||null;
  const shot=latest('GalviShot'),sight=latest('GalviSight'),path=latest('GalviPath');
  return {
    context_id:context.context_id,
    source_versions:{score:version(score),shot:version(shot),sight:version(sight),path:version(path)},
    source_refs:{score:score?.result_id||null,shot:shot?.artifact_id||null,sight:sight?.artifact_id||null,path:path?.artifact_id||null},
    generation_sources:{shot:shot?.generation_source||null,sight:sight?.generation_source||null,path:path?.generation_source||null}
  };
}

export async function getGovernedClinicBrief(env,actor,bmrId){
  const base=await getClinicBrief(env,actor,bmrId);
  const sources=await canonicalTreatmentSources(env.DB,base.bmr_id);
  const sourceState={...base.source_state,context_id:sources.context_id,treatment_source_versions:sources.source_versions,treatment_source_refs:sources.source_refs};
  const briefFingerprint=await hash('day5:clinic-brief',sourceState);
  return {...base,brief_fingerprint:briefFingerprint,source_state:sourceState,source_versions:sources.source_versions,source_refs:sources.source_refs,generation_sources:sources.generation_sources};
}

export function assertCanonicalSourceVersions(brief,supplied){
  const actual=brief?.source_versions||{};
  const requested=supplied&&typeof supplied==='object'&&!Array.isArray(supplied)?supplied:{};
  for(const key of ['score','shot','sight','path']){
    if(!clean(actual[key]))throw new GVError('GV_LINEAGE_REQUIRED',`Canonical ${key} source version is unavailable for treatment.`,422,{source:key});
    if(clean(requested[key])!==clean(actual[key]))throw new GVError('GV_STALE_SOURCE',`source_versions.${key} does not match the current canonical record.`,409,{source:key,expected:actual[key]});
  }
  return requested;
}

export async function augmentCustomerChartResponse(response,env){
  if(!response?.ok)return response;
  let payload;try{payload=await response.clone().json()}catch{return response}
  const data=payload?.data,bmrId=clean(data?.bmr_id);
  if(payload?.success!==true||payload?.status!=='ok'||data?.activated!==true||!bmrId||!env?.DB)return response;
  const [plans,rx,audits,referrals,acknowledgements,checkins,milestones,outcomes,reassessments]=await Promise.all([
    all(env.DB,`SELECT treatment_plan_id,name,status,version_no,objective,clinical_priority,target_metrics_json,milestones_json,monitoring_plan_json,escalation_triggers_json,follow_up_at,created_at,updated_at FROM gv1_treatment_plans WHERE bmr_id=? AND status NOT IN ('archived','cancelled','superseded') ORDER BY version_no DESC,created_at DESC LIMIT 10`,bmrId),
    all(env.DB,`SELECT rx_id,treatment_plan_id,action_id,intervention_code,resource_type,resource_ref,instructions,owner,expected_evidence,cadence,guardrails,status,version_no,created_at,updated_at FROM gv1_galvirx WHERE bmr_id=? AND customer_visible=1 AND status NOT IN ('archived','cancelled') ORDER BY created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT audit_order_id,treatment_plan_id,domain,assigned_service,status,result_evidence_id,created_at,updated_at FROM gv1_galviaudit_orders WHERE bmr_id=? ORDER BY created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT referral_id,treatment_plan_id,category,provider_name,provider_verification_status,service_mode,geography,consent_status,status,outcome_summary,created_at,updated_at FROM gv1_referrals WHERE bmr_id=? AND consent_status='consented' ORDER BY created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT treatment_event_id,treatment_plan_id,event_type,occurred_at,created_at FROM gv1_treatment_events WHERE bmr_id=? AND actor_type='customer' AND event_type='customer_acknowledged' ORDER BY occurred_at DESC,created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT checkin_id,treatment_plan_id,due_context,adherence_state,created_at FROM gv1_checkins WHERE bmr_id=? ORDER BY created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT milestone_id,treatment_plan_id,milestone_code,status,observed_value,created_at FROM gv1_milestones WHERE bmr_id=? ORDER BY created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT outcome_id,treatment_plan_id,outcome_code,outcome_type,outcome_value_json,status,measured_at,created_at FROM gv1_outcomes WHERE bmr_id=? AND status NOT IN ('rejected','archived','superseded') ORDER BY measured_at DESC,created_at DESC LIMIT 20`,bmrId),
    all(env.DB,`SELECT reassessment_id,treatment_plan_id,decision,created_at FROM gv1_reassessments WHERE bmr_id=? ORDER BY created_at DESC LIMIT 20`,bmrId)
  ]);
  const safePlans=plans.map(row=>({treatment_plan_id:row.treatment_plan_id,name:row.name,status:row.status,version_no:row.version_no,objective:row.objective,clinical_priority:row.clinical_priority,target_metrics:json(row.target_metrics_json,[]),milestones:json(row.milestones_json,[]),monitoring_plan:json(row.monitoring_plan_json,{}),escalation_triggers:json(row.escalation_triggers_json,[]),follow_up_at:row.follow_up_at,created_at:row.created_at,updated_at:row.updated_at}));
  const safeOutcomes=outcomes.map(row=>{const value=json(row.outcome_value_json,null);return {outcome_id:row.outcome_id,treatment_plan_id:row.treatment_plan_id,outcome_code:row.outcome_code,outcome_type:row.outcome_type,value,value_text:typeof value==='string'?value:null,value_number:typeof value==='number'&&Number.isFinite(value)?value:null,status:row.status,measured_at:row.measured_at,created_at:row.created_at};});
  data.sections={...(data.sections||{}),active_care:{source:'accepted_business_physician_care',progressively_complete:true,treatment_plans:safePlans,galvirx:rx,galviaudit:audits,referrals,acknowledgements,checkins,milestones,outcomes:safeOutcomes,reassessments}};
  payload.meta={...(payload.meta||{}),day5_active_care_projection:'v1',active_care_ai_called_on_read:false,customer_acknowledgement_projection:'v1'};
  const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.set('Cache-Control','no-store');headers.set('X-Galvi-Day5-Active-Care-Projection','v1');
  return new Response(JSON.stringify(payload),{status:response.status,headers});
}