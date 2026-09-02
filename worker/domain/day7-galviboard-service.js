// GalviStudio 1.0 | GalviBoard™ executive projection.
// Read-only by contract: GalviVault D1 remains canonical; this service performs SELECTs only.
// Day 7 purpose: compress the already-built clinical + commercial + developmental + longitudinal
// loop into an exception-first Executive Director view without creating a second record system.

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const pct=(a,b)=>b>0?Math.round((a/b)*1000)/10:null;

async function metric(db,key,sql,...params){
  try{
    const row=await first(db,sql,...params);
    return {key,value:num(row?.n),available:true};
  }catch(error){
    return {key,value:null,available:false,reason:/no such table|no such column/i.test(String(error?.message||error))?'schema_unavailable':'query_unavailable'};
  }
}

async function grouped(db,key,sql,...params){
  try{return {key,items:await all(db,sql,...params),available:true};}
  catch(error){return {key,items:[],available:false,reason:/no such table|no such column/i.test(String(error?.message||error))?'schema_unavailable':'query_unavailable'};}
}

const value=m=>m?.available?num(m.value):null;
const conversion=(numerator,denominator)=>{
  const n=value(numerator),d=value(denominator);
  return n===null||d===null?null:pct(n,d);
};
const stateFor=(critical,warning)=>critical>0?'critical':warning>0?'attention':'healthy';

export async function buildGalviBoard(env,ctx,identity){
  const db=env.DB;
  const [
    activePreFounders,lifecycleIntegrityViolations,founderReadinessScores,founderShots,paths,clinicRequests,
    physicianPlans,acknowledgements,returnCredentials,scenarioOrders,scenarioPaid,scenarioEnrolled,
    scenarioCourseCompleted,scenarioCustomerConfirmed,scenarioReassessmentPending,scenarioReassessed,
    scenarioRemainPreFounder,paidNotEnrolled,enrollmentExceptions,completedNotConfirmed,pendingReassessments,
    pendingLifecycleReviews,totalOrders,paidOrders,totalVerifiedRevenue,totalEnrolled,totalCompleted,totalConfirmed,
    activeStudioEngagements,completedStudioEngagements,studioOutcomes,validatedStudioOutcomes,
    operatingContexts,totalPrincipalContexts,totalBhrs,activeMemberships,clinicQueue,
    proofByDimension,engagementsByPillar
  ]=await Promise.all([
    metric(db,'active_pre_founders',`SELECT COUNT(*) n FROM gv1_principal_contexts WHERE lifecycle_state='pre_founder' AND record_mode='principal_only' AND venture_id IS NULL AND bmr_id IS NULL AND status='active'`),
    metric(db,'lifecycle_integrity_violations',`SELECT COUNT(*) n FROM gv1_principal_contexts WHERE (record_mode='principal_only' AND (venture_id IS NOT NULL OR bmr_id IS NOT NULL)) OR (record_mode='principal_plus_venture' AND (venture_id IS NULL OR bmr_id IS NULL))`),
    metric(db,'founder_readiness_scores',`SELECT COUNT(DISTINCT context_id) n FROM gv1_day2_intake_results WHERE context_id IS NOT NULL AND result_type='score' AND score_type='founder_readiness'`),
    metric(db,'founder_shots',`SELECT COUNT(DISTINCT context_id) n FROM gv1_founder_snapshots WHERE context_id IS NOT NULL AND validation_status='accepted'`),
    metric(db,'prefounder_paths',`SELECT COUNT(DISTINCT context_id) n FROM gv1_prefounder_care_events WHERE event_type='galvipath_completed'`),
    metric(db,'clinic_requests',`SELECT COUNT(DISTINCT context_id) n FROM gv1_prefounder_care_events WHERE event_type='clinic_booking_requested'`),
    metric(db,'physician_plans',`SELECT COUNT(DISTINCT context_id) n FROM gv1_prefounder_care_events WHERE event_type='physician_plan'`),
    metric(db,'customer_acknowledgements',`SELECT COUNT(DISTINCT context_id) n FROM gv1_prefounder_care_events WHERE event_type='customer_acknowledged'`),
    metric(db,'return_credentials',`SELECT COUNT(DISTINCT c.context_id) n FROM gv1_principal_contexts c JOIN gv1_customer_accounts a ON a.principal_id=c.founder_id AND a.status='active' WHERE c.lifecycle_state='pre_founder' AND c.record_mode='principal_only' AND c.venture_id IS NULL AND c.bmr_id IS NULL`),
    metric(db,'scenario_a_checkout_started',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE persona_code='A' AND service_code='founder_readiness_sprint' AND status NOT IN ('canceled','refunded')`),
    metric(db,'scenario_a_paid',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE persona_code='A' AND service_code='founder_readiness_sprint' AND paid_at IS NOT NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'scenario_a_enrolled',`SELECT COUNT(DISTINCT o.order_id) n FROM gv1_commercial_care_orders o JOIN gv1_commercial_order_delivery d ON d.order_id=o.order_id WHERE o.persona_code='A' AND o.service_code='founder_readiness_sprint' AND o.paid_at IS NOT NULL AND o.status NOT IN ('canceled','refunded') AND d.enrollment_status='enrolled'`),
    metric(db,'scenario_a_course_completed',`SELECT COUNT(DISTINCT o.order_id) n FROM gv1_commercial_care_orders o JOIN gv1_systeme_course_fulfillments f ON f.order_id=o.order_id WHERE o.persona_code='A' AND o.service_code='founder_readiness_sprint' AND f.completion_key='founder_readiness_sprint' AND f.completion_status='completed' AND o.status NOT IN ('canceled','refunded')`),
    metric(db,'scenario_a_customer_confirmed',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE persona_code='A' AND service_code='founder_readiness_sprint' AND customer_confirmed_at IS NOT NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'scenario_a_reassessment_pending',`SELECT COUNT(*) n FROM gv1_care_reassessment_queue q JOIN gv1_commercial_care_orders o ON o.order_id=q.order_id WHERE o.persona_code='A' AND o.service_code='founder_readiness_sprint' AND q.status='pending'`),
    metric(db,'scenario_a_reassessed',`SELECT COUNT(*) n FROM gv1_care_reassessment_queue q JOIN gv1_commercial_care_orders o ON o.order_id=q.order_id WHERE o.persona_code='A' AND o.service_code='founder_readiness_sprint' AND q.status IN ('reviewed','closed')`),
    metric(db,'scenario_a_remain_prefounder',`SELECT COUNT(*) n FROM gv1_care_reassessment_queue q JOIN gv1_commercial_care_orders o ON o.order_id=q.order_id JOIN gv1_principal_contexts c ON c.context_id=o.context_id WHERE o.persona_code='A' AND o.service_code='founder_readiness_sprint' AND q.status IN ('reviewed','closed') AND c.lifecycle_state='pre_founder' AND c.record_mode='principal_only' AND c.venture_id IS NULL AND c.bmr_id IS NULL`),
    metric(db,'paid_not_enrolled',`SELECT COUNT(*) n FROM gv1_commercial_care_orders o JOIN gv1_commercial_order_delivery d ON d.order_id=o.order_id WHERE o.paid_at IS NOT NULL AND o.status NOT IN ('canceled','refunded') AND d.payment_status='paid' AND d.enrollment_status<>'enrolled'`),
    metric(db,'enrollment_exceptions',`SELECT COUNT(*) n FROM gv1_commercial_order_delivery d JOIN gv1_commercial_care_orders o ON o.order_id=d.order_id WHERE o.paid_at IS NOT NULL AND o.status NOT IN ('canceled','refunded') AND d.payment_status='paid' AND d.enrollment_status IN ('pending_configuration','retry_required','failed')`),
    metric(db,'completed_not_confirmed',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE completed_at IS NOT NULL AND customer_confirmed_at IS NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'pending_reassessments',`SELECT COUNT(*) n FROM gv1_care_reassessment_queue WHERE status='pending'`),
    metric(db,'pending_lifecycle_reviews',`SELECT COUNT(*) n FROM gv1_lifecycle_transition_reviews WHERE status='proposed'`),
    metric(db,'total_orders',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE status NOT IN ('canceled')`),
    metric(db,'paid_orders',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE paid_at IS NOT NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'verified_revenue_cents',`SELECT COALESCE(SUM(amount_cents),0) n FROM gv1_commercial_care_orders WHERE paid_at IS NOT NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'enrolled_orders',`SELECT COUNT(DISTINCT o.order_id) n FROM gv1_commercial_care_orders o JOIN gv1_commercial_order_delivery d ON d.order_id=o.order_id WHERE o.paid_at IS NOT NULL AND o.status NOT IN ('canceled','refunded') AND d.enrollment_status='enrolled'`),
    metric(db,'completed_orders',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE completed_at IS NOT NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'confirmed_orders',`SELECT COUNT(*) n FROM gv1_commercial_care_orders WHERE customer_confirmed_at IS NOT NULL AND status NOT IN ('canceled','refunded')`),
    metric(db,'active_studio_engagements',`SELECT COUNT(*) n FROM gv1_studio_engagements WHERE status IN ('accepted','active','waiting_evidence')`),
    metric(db,'completed_studio_engagements',`SELECT COUNT(*) n FROM gv1_studio_engagements WHERE status IN ('completed','closed')`),
    metric(db,'studio_outcomes',`SELECT COUNT(*) n FROM gv1_studio_outcomes WHERE status NOT IN ('superseded','archived')`),
    metric(db,'validated_studio_outcomes',`SELECT COUNT(*) n FROM gv1_studio_outcomes WHERE status='validated'`),
    metric(db,'operating_contexts',`SELECT COUNT(*) n FROM gv1_principal_contexts WHERE record_mode='principal_plus_venture' AND venture_id IS NOT NULL AND bmr_id IS NOT NULL AND status='active'`),
    metric(db,'total_principal_contexts',`SELECT COUNT(*) n FROM gv1_principal_contexts WHERE status='active'`),
    metric(db,'total_bhrs',`SELECT COUNT(*) n FROM gv1_business_medical_records`),
    metric(db,'active_memberships',`SELECT COUNT(*) n FROM gv1_memberships WHERE status='active'`),
    metric(db,'clinic_queue',`SELECT COUNT(DISTINCT c.context_id) n FROM gv1_principal_contexts c JOIN gv1_prefounder_care_events book ON book.context_id=c.context_id AND book.event_type='clinic_booking_requested' LEFT JOIN gv1_prefounder_care_events plan ON plan.context_id=c.context_id AND plan.event_type='physician_plan' WHERE c.lifecycle_state='pre_founder' AND c.record_mode='principal_only' AND c.venture_id IS NULL AND c.bmr_id IS NULL AND plan.event_id IS NULL`),
    grouped(db,'venture_proof_by_dimension',`SELECT proof_dimension,COUNT(*) total,SUM(CASE WHEN validation_status='validated' THEN 1 ELSE 0 END) validated FROM gv1_studio_venture_proof GROUP BY proof_dimension ORDER BY proof_dimension`),
    grouped(db,'studio_engagements_by_pillar',`SELECT pillar_code,COUNT(*) total,SUM(CASE WHEN status IN ('accepted','active','waiting_evidence') THEN 1 ELSE 0 END) active,SUM(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) completed FROM gv1_studio_engagements GROUP BY pillar_code ORDER BY pillar_code`)
  ]);

  const critical=num(value(lifecycleIntegrityViolations));
  const warnings=num(value(paidNotEnrolled))+num(value(enrollmentExceptions))+num(value(completedNotConfirmed))+num(value(pendingReassessments));
  const projectionHealth=[lifecycleIntegrityViolations,paidNotEnrolled,enrollmentExceptions,completedNotConfirmed,pendingReassessments].every(m=>m.available)?'available':'degraded';

  const scenarioA=[
    ['Triage / principal-only Pre-Founder',activePreFounders],
    ['Founder Readiness measured',founderReadinessScores],
    ['FounderShot recorded',founderShots],
    ['GalviPath completed',paths],
    ['GalviClinic requested',clinicRequests],
    ['Business Physician Treatment Plan',physicianPlans],
    ['Customer acknowledged plan',acknowledgements],
    ['Return credentials established',returnCredentials],
    ['Stripe TEST Checkout started',scenarioOrders],
    ['Stripe-verified paid',scenarioPaid],
    ['Systeme.io enrolled',scenarioEnrolled],
    ['Founder Readiness course completed',scenarioCourseCompleted],
    ['Customer completion confirmed',scenarioCustomerConfirmed],
    ['Business Physician reassessment pending',scenarioReassessmentPending],
    ['Business Physician reassessed',scenarioReassessed],
    ['Still Pre-Founder absent venture evidence',scenarioRemainPreFounder]
  ].map(([label,m])=>({key:m.key,label,value:value(m),available:m.available,reason:m.reason||null}));

  const paid=value(paidOrders),enrolled=value(totalEnrolled),completed=value(totalCompleted),confirmed=value(totalConfirmed),orders=value(totalOrders);
  const revenue=value(totalVerifiedRevenue);

  return {
    projection:'galviboard_1_0_executive_control_tower_v1',
    read_only:true,
    ai_called_on_read:false,
    source_of_truth:'galvivault_d1',
    environment:ctx.environment,
    as_of:new Date().toISOString(),
    executive:{operator_id:identity.operator_id,role:identity.role,management_mode:'exception_first_passive_management'},
    executive_attention:{
      overall_state:stateFor(critical,warnings),
      projection_health:projectionHealth,
      lifecycle_integrity_violations:value(lifecycleIntegrityViolations),
      paid_not_enrolled:value(paidNotEnrolled),
      enrollment_exceptions:value(enrollmentExceptions),
      completed_not_customer_confirmed:value(completedNotConfirmed),
      reassessments_pending:value(pendingReassessments),
      lifecycle_reviews_pending:value(pendingLifecycleReviews),
      clinic_reviews_pending:value(clinicQueue),
      decision_rule:'Work exceptions and human-judgment queues first; healthy flows remain passive.'
    },
    scenario_a:{
      name:'New Pre-Founder | Founder Readiness closed loop',
      purpose:'Prove one clinical + commercial + developmental + longitudinal loop without fabricating an operating venture.',
      stages:scenarioA,
      invariants:{principal_only_until_real_venture_evidence:true,scenario_c_requires_governed_venture_evidence:true,payment_authority:'stripe',fulfillment_authority:'systeme_public_api',record_authority:'galvivault'},
      note:'Stage values are cumulative canonical counts, not a same-day marketing cohort; do not subtract adjacent stages as churn without cohort instrumentation.'
    },
    four_pillars:{
      founder_development:{
        owner:'FDI / SPUR',
        executive_question:'Are people developing the capabilities required to become successful founders, executives, or stewards?',
        metrics:{active_pre_founders:value(activePreFounders),founder_readiness_measured:value(founderReadinessScores),founder_shots:value(founderShots),treatment_plans:value(physicianPlans),course_completions:value(scenarioCourseCompleted),reassessments_pending:value(pendingReassessments)}
      },
      product_development:{
        owner:'GalviCare | Venture 001',
        executive_question:'Is GalviCare reliably acquiring, diagnosing, routing, treating, retaining, and learning through one canonical record?',
        metrics:{active_principal_contexts:value(totalPrincipalContexts),canonical_bhrs:value(totalBhrs),lifecycle_integrity_violations:value(lifecycleIntegrityViolations),paid_not_enrolled:value(paidNotEnrolled),completed_not_confirmed:value(completedNotConfirmed)}
      },
      business_development:{
        owner:'GalviPro',
        executive_question:'Is trusted Business Physician / Fractional Executive demand converting into verified treatment and longitudinal return?',
        metrics:{commercial_orders:orders,paid_orders:paid,verified_revenue_cents:revenue,checkout_to_paid_pct:conversion(paidOrders,totalOrders),paid_to_enrolled_pct:conversion(totalEnrolled,paidOrders),enrolled_to_completed_pct:conversion(totalCompleted,totalEnrolled),completed_to_return_confirmed_pct:conversion(totalConfirmed,totalCompleted)}
      },
      corporate_development:{
        owner:'GalviStudio',
        executive_question:'Is the Studio repeatedly converting evidence into governed Venture Development outcomes while protecting capital and lifecycle integrity?',
        metrics:{active_studio_engagements:value(activeStudioEngagements),completed_studio_engagements:value(completedStudioEngagements),studio_outcomes:value(studioOutcomes),validated_outcomes:value(validatedStudioOutcomes),operating_venture_contexts:value(operatingContexts),venture_transition_reviews_pending:value(pendingLifecycleReviews)},
        venture_proof:proofByDimension.items,
        engagements_by_pillar:engagementsByPillar.items
      }
    },
    idn:{
      fdi:{role:'Founder Development institution',state:'instrumented_through_galvivault',active_pre_founders:value(activePreFounders)},
      galvicare:{role:'Digital Business Healthcare acquisition + diagnosis + routing + longitudinal retention',state:'canonical_runtime',principal_contexts:value(totalPrincipalContexts),business_health_records:value(totalBhrs)},
      galvipro:{role:'Active Business Physician + Fractional Executive practice',state:'active_care_runtime',clinic_queue:value(clinicQueue),reassessment_queue:value(pendingReassessments)},
      galvistudio:{role:'Venture Development / Innovation Management Studio',state:'venture_development_runtime',active_engagements:value(activeStudioEngagements),validated_outcomes:value(validatedStudioOutcomes)},
      galvileague:{role:'Founder Development community / maintenance + prevention',state:'not_yet_projected_into_galvivault_1_0',metrics_available:false},
      memberships:{role:'Continuous Business Health maintenance',active:value(activeMemberships)}
    },
    galvistack:{
      core:[
        {system:'GalviVault / Cloudflare D1',job:'Canonical principal, BHR, treatment, Studio, commercial and longitudinal record',authority:'system_of_record',board_state:'projected'},
        {system:'Cloudflare Worker',job:'Server authority, RBAC, orchestration, governed writes and executive projection',authority:'application_authority',board_state:'projected'},
        {system:'GalviEngine / OpenAI provider adapter',job:'Evidence synthesis and governed decision support',authority:'reasoning_proposal_only',board_state:'indirect_evidence'},
        {system:'GalviBoard',job:'Read-only Executive Director control tower over canonical evidence',authority:'projection_only',board_state:'active'}
      ],
      commercial_and_delivery:[
        {system:'Stripe',job:'Checkout and payment verification',authority:'payment_authority',board_state:'projected_from_verified_d1_events'},
        {system:'Systeme.io',job:'Sprint/course enrollment and provider-verified completion',authority:'treatment_fulfillment_authority',board_state:'projected_from_verified_d1_events'},
        {system:'Calendly',job:'Scheduling adapter where applicable',authority:'scheduling_adapter',board_state:'operational_adapter_not_executive_kpi_source'}
      ],
      growth_and_experience:[
        {system:'HubSpot',job:'CRM, referral, institutional and partnership lifecycle',authority:'crm_adapter',board_state:'external_metrics_not_yet_ingested'},
        {system:'GA4',job:'Anonymous acquisition and journey analytics',authority:'analytics_adapter',board_state:'external_metrics_not_yet_ingested'},
        {system:'Microsoft Clarity',job:'Masked pre-auth/public UX behavior and friction evidence',authority:'experience_adapter',board_state:'external_metrics_not_yet_ingested'}
      ],
      missing_for_scaled_executive_management:[
        {capability:'Finance / accounting system',examples:'QuickBooks, Xero, ERP',why:'True P&L, runway, cash, A/R and margin cannot be inferred from Stripe treatment receipts alone.',day7_action:'defer_integration_do_not_fabricate_metric'},
        {capability:'Product delivery telemetry',examples:'GitHub + Linear/Jira',why:'Cycle time, deployment frequency, defect escape and product-delivery throughput require engineering telemetry.',day7_action:'defer_integration_do_not_fabricate_metric'},
        {capability:'Cohort analytics / BI layer',examples:'BigQuery + Looker/Power BI or equivalent',why:'Institutional CBE reporting needs de-identified longitudinal cohort trends across CRM, product, care and outcomes.',day7_action:'defer_until_1_5_scale'},
        {capability:'GalviLeague event/member telemetry',examples:'future community/member system adapter',why:'Community maintenance, alumni engagement and advocacy cannot be managed from the current canonical 1.0 record.',day7_action:'instrument_after_1_0_release'}
      ]
    },
    cbe_readiness:{
      current_1_0_use:'Executive exception management plus patient-level Business Physician care in the protected workspace.',
      cohort_rule:'Institution-facing reporting must use de-identified aggregate cohort measures; no sponsor-side patient record access.',
      recommended_aggregate_dimensions:['readiness distribution','evidence gaps','decision bottlenecks','treatment uptake','completion','return/reassessment','validated outcomes'],
      status:'architecture_ready_aggregate_bi_adapter_deferred'
    },
    manual_repair:'NO'
  };
}
