import { buildGalviBoard as buildBaseGalviBoard } from './day7-galviboard-service.js';

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const pct=(a,b)=>b>0?Math.round((a/b)*1000)/10:null;
const parse=(v,f={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return f}};

async function count(db,sql,...params){
  try{return {value:n((await first(db,sql,...params))?.n),available:true};}
  catch(error){return {value:null,available:false,reason:/no such table|no such column/i.test(String(error?.message||error))?'schema_unavailable':'query_unavailable'};}
}
async function rows(db,sql,...params){
  try{return {items:await all(db,sql,...params),available:true};}
  catch(error){return {items:[],available:false,reason:/no such table|no such column/i.test(String(error?.message||error))?'schema_unavailable':'query_unavailable'};}
}
const add=(...metrics)=>metrics.every(x=>x.available)?metrics.reduce((s,x)=>s+n(x.value),0):null;

const TREATMENTS=[
  {code:'founder_readiness_sprint',label:'Founder Readiness Sprint™',kind:'individual_treatment'},
  {code:'spur_pathway',label:'SPUR™ Pre-Founder Pathway',kind:'individual_treatment'},
  {code:'founder_development_sprint',label:'Targeted Founder Development Sprint™',kind:'individual_treatment'},
  {code:'venture_readiness_sprint',label:'Venture Readiness Sprint™',kind:'individual_treatment'},
  {code:'product_readiness_sprint',label:'Product Readiness Sprint™',kind:'individual_treatment'},
  {code:'gtm_readiness_sprint',label:'GTM Readiness Sprint™',kind:'individual_treatment'},
  {code:'fundraising_readiness_sprint',label:'Fundraising Readiness Sprint™',kind:'individual_treatment'},
  {code:'founder_foundation_plan',label:'Founder Foundation Plan™',kind:'treatment_plan_package'},
  {code:'venture_builder_plan',label:'Venture Builder Plan™',kind:'treatment_plan_package'},
  {code:'startup_launch_plan',label:'Startup Launch Plan™',kind:'treatment_plan_package'},
  {code:'venture_acceleration_plan',label:'Venture Acceleration Plan™',kind:'treatment_plan_package'}
];

async function treatmentPerformance(db){
  const [plans,orders,delivery,reassess]=await Promise.all([
    rows(db,`SELECT context_id,payload_json FROM gv1_prefounder_care_events WHERE event_type='physician_plan'`),
    rows(db,`SELECT service_code,COUNT(*) orders,
      SUM(CASE WHEN paid_at IS NOT NULL AND status NOT IN ('canceled','refunded') THEN 1 ELSE 0 END) paid,
      SUM(CASE WHEN completed_at IS NOT NULL AND status NOT IN ('canceled','refunded') THEN 1 ELSE 0 END) completed,
      SUM(CASE WHEN customer_confirmed_at IS NOT NULL AND status NOT IN ('canceled','refunded') THEN 1 ELSE 0 END) customer_confirmed
      FROM gv1_commercial_care_orders WHERE status NOT IN ('canceled') GROUP BY service_code ORDER BY service_code`),
    rows(db,`SELECT o.service_code,
      COUNT(DISTINCT CASE WHEN d.enrollment_status='enrolled' THEN o.order_id END) enrolled
      FROM gv1_commercial_care_orders o LEFT JOIN gv1_commercial_order_delivery d ON d.order_id=o.order_id
      WHERE o.status NOT IN ('canceled','refunded') GROUP BY o.service_code ORDER BY o.service_code`),
    rows(db,`SELECT o.service_code,
      COUNT(DISTINCT CASE WHEN q.status IN ('reviewed','closed') THEN o.order_id END) reassessed
      FROM gv1_commercial_care_orders o LEFT JOIN gv1_care_reassessment_queue q ON q.order_id=o.order_id
      WHERE o.status NOT IN ('canceled','refunded') GROUP BY o.service_code ORDER BY o.service_code`)
  ]);
  const prescribed=new Map();
  if(plans.available){
    const perCode=new Map();
    for(const row of plans.items){
      const code=String(parse(row.payload_json,{})?.intervention_code||'').trim().toLowerCase();
      if(!code)continue;
      if(!perCode.has(code))perCode.set(code,new Set());
      perCode.get(code).add(row.context_id);
    }
    for(const [code,set] of perCode)prescribed.set(code,set.size);
  }
  const by=(arr,key)=>new Map((arr.available?arr.items:[]).map(x=>[String(x.service_code||'').toLowerCase(),x[key]===null?null:n(x[key])]));
  const orderMap=by(orders,'orders'),paidMap=by(orders,'paid'),completedMap=by(orders,'completed'),confirmedMap=by(orders,'customer_confirmed'),enrolledMap=by(delivery,'enrolled'),reassessedMap=by(reassess,'reassessed');
  return TREATMENTS.map(t=>{
    const ordered=orders.available?(orderMap.get(t.code)||0):null;
    const paid=orders.available?(paidMap.get(t.code)||0):null;
    const enrolled=delivery.available?(enrolledMap.get(t.code)||0):null;
    const completed=orders.available?(completedMap.get(t.code)||0):null;
    const confirmed=orders.available?(confirmedMap.get(t.code)||0):null;
    const reassessedCount=reassess.available?(reassessedMap.get(t.code)||0):null;
    return {...t,prescribed:plans.available?(prescribed.get(t.code)||0):null,ordered,paid,enrolled,completed,customer_confirmed:confirmed,reassessed:reassessedCount,
      prescribed_to_ordered_pct:ordered===null?null:pct(ordered,prescribed.get(t.code)||0),
      enrolled_to_completed_pct:completed===null||enrolled===null?null:pct(completed,enrolled),
      completed_to_reassessed_pct:reassessedCount===null||completed===null?null:pct(reassessedCount,completed)};
  });
}

async function clinicMetrics(db){
  const [recommendations,operatingPlans,prefounderPlans,rx,audits,referrals,checkins,milestones,reassessments,prefounderReassessments,treatmentEvents,outcomes]=await Promise.all([
    count(db,`SELECT COUNT(*) n FROM gv1_recommendations r WHERE r.status NOT IN ('declined','archived','superseded') AND NOT EXISTS (SELECT 1 FROM gv1_recommendations x WHERE x.supersedes_recommendation_id=r.recommendation_id)`),
    count(db,`SELECT COUNT(*) n FROM gv1_treatment_plans p WHERE p.status NOT IN ('cancelled','archived','superseded') AND NOT EXISTS (SELECT 1 FROM gv1_treatment_plans x WHERE x.supersedes_treatment_plan_id=p.treatment_plan_id)`),
    count(db,`SELECT COUNT(DISTINCT context_id) n FROM gv1_prefounder_care_events WHERE event_type='physician_plan'`),
    count(db,`SELECT COUNT(*) n FROM gv1_galvirx WHERE status NOT IN ('cancelled','archived')`),
    count(db,`SELECT COUNT(*) n FROM gv1_galviaudit_orders WHERE status NOT IN ('cancelled','archived')`),
    count(db,`SELECT COUNT(*) n FROM gv1_referrals WHERE status NOT IN ('cancelled','declined','archived')`),
    count(db,`SELECT COUNT(*) n FROM gv1_checkins`),
    count(db,`SELECT COUNT(*) n FROM gv1_milestones`),
    count(db,`SELECT COUNT(*) n FROM gv1_reassessments`),
    count(db,`SELECT COUNT(*) n FROM gv1_care_reassessment_queue`),
    count(db,`SELECT COUNT(*) n FROM gv1_treatment_events`),
    count(db,`SELECT COUNT(*) n FROM gv1_outcomes o WHERE o.status NOT IN ('rejected','archived','superseded') AND NOT EXISTS (SELECT 1 FROM gv1_outcomes x WHERE x.supersedes_outcome_id=o.outcome_id)`)
  ]);
  return {
    recommendations:recommendations.available?recommendations.value:null,
    treatment_plans:add(operatingPlans,prefounderPlans),
    galvirx:rx.available?rx.value:null,
    galviaudit:audits.available?audits.value:null,
    referrals:referrals.available?referrals.value:null,
    check_ins:checkins.available?checkins.value:null,
    milestones:milestones.available?milestones.value:null,
    reassessments:add(reassessments,prefounderReassessments),
    treatment_events:treatmentEvents.available?treatmentEvents.value:null,
    outcomes:outcomes.available?outcomes.value:null,
    scope_note:'Current canonical BMR care plus principal-only Pre-Founder physician plans/reassessment queue where those objects are stored outside the BMR care tables.'
  };
}

export async function buildGalviBoard(env,ctx,identity){
  const base=await buildBaseGalviBoard(env,ctx,identity),db=env.DB;
  const [uniquePreFounders,activePreFounderContexts,businessHealthMemberships,clinic,treatments]=await Promise.all([
    count(db,`SELECT COUNT(DISTINCT founder_id) n FROM gv1_principal_contexts WHERE lifecycle_state='pre_founder' AND record_mode='principal_only' AND venture_id IS NULL AND bmr_id IS NULL AND status='active'`),
    count(db,`SELECT COUNT(*) n FROM gv1_principal_contexts WHERE lifecycle_state='pre_founder' AND record_mode='principal_only' AND venture_id IS NULL AND bmr_id IS NULL AND status='active'`),
    count(db,`SELECT COUNT(*) n FROM gv1_memberships WHERE status='active'`),
    clinicMetrics(db),
    treatmentPerformance(db)
  ]);
  const contextRows=activePreFounderContexts.available?activePreFounderContexts.value:null;
  const uniquePeople=uniquePreFounders.available?uniquePreFounders.value:null;
  const surplus=contextRows===null||uniquePeople===null?null:Math.max(0,contextRows-uniquePeople);

  base.scenario_a={...base.scenario_a,
    name:'Pre-Founder Board: Scenario A - Clinical + Commercial + Developmental + Longitudinal Loop',
    population_scope:{environment:ctx.environment,population:'all canonical active principal-only Pre-Founder contexts',cohort_filter:'not_yet_instrumented',institution_filter:'not_yet_instrumented',time_filter:'all canonical history represented by each stage query',unique_principals:uniquePeople,active_context_rows:contextRows},
    treatment_performance:treatments,
    scope_note:'This is not a CBE-only cohort. Until the institution/program/cohort/track overlay is instrumented, CBE and non-CBE Pre-Founders are combined in the aggregate Board.'
  };
  base.data_stewardship={
    active_prefounder_context_rows:contextRows,
    unique_active_prefounder_principals:uniquePeople,
    context_rows_beyond_unique_principals:surplus,
    interpretation:'A principal context is a longitudinal care/development context row, not necessarily one unique human. Context count and unique principal count must be displayed separately.',
    search_warning:'GalviVault/clinician search result cards are a bounded lookup projection and are not a population denominator. Do not compare the number of visible search cards directly with the GalviBoard context count.',
    source_of_truth:'galvivault_d1',environment:ctx.environment,as_of:new Date().toISOString()
  };
  base.clinic_metrics=clinic;
  if(base.four_pillars?.founder_development?.metrics){
    base.four_pillars.founder_development.metrics.active_prefounder_contexts=contextRows;
    base.four_pillars.founder_development.metrics.unique_prefounder_principals=uniquePeople;
  }
  if(base.four_pillars?.business_development?.metrics){
    base.four_pillars.business_development.metrics.business_health_memberships=businessHealthMemberships.available?businessHealthMemberships.value:null;
    base.four_pillars.business_development.metrics.galvileague_memberships=null;
  }
  base.reporting={
    board_filtering:'institution/program/cohort/track filtering requires the bounded CBE institutional overlay; not fabricated in Day 7',
    print_supported:true,
    export_recommendation:'Use governed read-only CSV/XLSX/Power BI projections from GalviVault; never make Excel, Access or a BI tool the canonical record.',
    metric_contract:'Each future export must include metric_id, definition, source, distinct_key, inclusion/exclusion rules, time grain, population/cohort scope, environment and as_of timestamp.'
  };
  return base;
}
