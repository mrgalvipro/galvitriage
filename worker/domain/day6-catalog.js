export const DAY6_CATALOG_VERSION = 'galvistudio_1_0_day6_catalog_v1';
export const DAY6_SPRINT_VERSION = 'galvistudio_1_0_sprints_v1';
export const DAY6_PRACTICE_VERSION = 'galvipro_business_physician_practice_v1';

export const FOUR_PILLARS = Object.freeze([
  {
    code: 'founder_development',
    name: 'Founder Development',
    packages: [
      { code: 'founder_readiness', name: 'Founder Readiness', entry_signal: 'leadership/capability/clarity/readiness gap', deliverables: ['Founder Readiness assessment', 'development plan'], duration_pattern: 'bounded sprint', required_evidence: ['readiness evidence'], expected_outcomes: ['readiness delta', 'development plan', 'operating cadence evidence'], handoff: 'reassessment_or_next_spur_stage', commercial_mode: 'both' },
      { code: 'spur_pathway', name: 'SPUR Pathway', entry_signal: 'pre-founder/founder/operator development need', deliverables: ['track/stage assignment', 'stage deliverable'], duration_pattern: 'stage-gated pathway', required_evidence: ['stage evidence'], expected_outcomes: ['evidence-backed next-stage decision'], handoff: 'next_spur_stage_or_stop', commercial_mode: 'both' },
      { code: 'founder_development_sprint', name: 'Targeted Founder Development Sprint', entry_signal: 'specific founder capability gap', deliverables: ['bounded development intervention'], duration_pattern: 'bounded sprint', required_evidence: ['capability evidence'], expected_outcomes: ['measured capability progress'], handoff: 'care_reassessment', commercial_mode: 'both' }
    ]
  },
  {
    code: 'product_development',
    name: 'Product Development',
    packages: [
      { code: 'venture_validation', name: 'Venture Validation', entry_signal: 'problem/customer/business-model uncertainty', deliverables: ['validated venture thesis', 'go/no-go'], duration_pattern: 'bounded validation sprint', required_evidence: ['customer/problem evidence'], expected_outcomes: ['validated thesis', 'go/no-go'], handoff: 'build_hold_rework_or_stop', commercial_mode: 'both' },
      { code: 'product_build', name: 'Product Build', entry_signal: 'validated opportunity requiring MVP/service build', deliverables: ['operating MVP/service'], duration_pattern: 'milestone bounded', required_evidence: ['validated thesis', 'build evidence'], expected_outcomes: ['working MVP/service', 'QA evidence'], handoff: 'launch_readiness', commercial_mode: 'both' },
      { code: 'product_launch_readiness', name: 'Product Launch Readiness', entry_signal: 'built product requiring launch gate', deliverables: ['launch readiness decision'], duration_pattern: 'bounded readiness sprint', required_evidence: ['product QA', 'instrumentation'], expected_outcomes: ['launch readiness evidence'], handoff: 'launch_hold_rework_or_stop', commercial_mode: 'both' }
    ]
  },
  {
    code: 'business_development',
    name: 'Business Development',
    packages: [
      { code: 'gtm_readiness', name: 'GTM Readiness', entry_signal: 'ICP/positioning/distribution/conversion weakness', deliverables: ['ICP', 'offer', 'channel/funnel plan'], duration_pattern: 'bounded readiness sprint', required_evidence: ['market/customer/commercial evidence'], expected_outcomes: ['GTM readiness decision', 'launch plan'], handoff: 'commercial_launch_or_rework', commercial_mode: 'both' },
      { code: 'commercial_launch', name: 'Commercial Launch', entry_signal: 'launch-ready product/offer', deliverables: ['go-to-market execution plan'], duration_pattern: 'milestone bounded', required_evidence: ['launch readiness evidence'], expected_outcomes: ['real usage/customer/revenue evidence'], handoff: 'operate_and_monitor', commercial_mode: 'both' },
      { code: 'revenue_growth_optimization', name: 'Revenue/Growth Optimization', entry_signal: 'commercial weakness after basic market evidence', deliverables: ['measured growth experiment'], duration_pattern: 'bounded experiment', required_evidence: ['funnel/revenue baseline'], expected_outcomes: ['measured experiment result'], handoff: 'reassessment', commercial_mode: 'both' }
    ]
  },
  {
    code: 'corporate_development',
    name: 'Corporate Development',
    packages: [
      { code: 'capital_investor_readiness', name: 'Capital/Investor Readiness', entry_signal: 'capital objective with diligence/readiness gap', deliverables: ['diligence package', 'capital-use thesis'], duration_pattern: 'bounded readiness sprint', required_evidence: ['metrics', 'diligence evidence'], expected_outcomes: ['readiness evidence'], handoff: 'qualified_external_specialist_when_regulated', commercial_mode: 'both', regulated_boundary: 'securities/investment/fiduciary advice remains external' },
      { code: 'governance_operating_model_readiness', name: 'Governance/Operating Model Readiness', entry_signal: 'governance/operating-model gap', deliverables: ['governance/operating-model artifacts'], duration_pattern: 'bounded readiness sprint', required_evidence: ['operating evidence'], expected_outcomes: ['governance readiness evidence'], handoff: 'stewardship_or_reassessment', commercial_mode: 'both' },
      { code: 'strategic_partnership_readiness', name: 'Strategic Partnership Readiness', entry_signal: 'partnership/JV readiness need', deliverables: ['partnership readiness package'], duration_pattern: 'bounded readiness sprint', required_evidence: ['partner/strategy evidence'], expected_outcomes: ['partnership readiness decision'], handoff: 'partner_process_or_rework', commercial_mode: 'both' }
    ]
  }
]);

export const SPUR_TRACKS = Object.freeze([
  { code: 'dreamer', name: 'SPUR Dreamer', primary_person: 'opportunity holder without a company', outcome: 'Founder Life/Ownership Thesis + Evidence-Based Opportunity Thesis' },
  { code: 'founder', name: 'SPUR Founder', primary_person: 'individual preparing to create a venture', outcome: 'Readiness Development Plan + evidence-based go/no-go' },
  { code: 'operator_steward', name: 'SPUR Operator/Steward', primary_person: 'existing owner/executive', outcome: 'operating venture/treatment roadmap + stewardship plan' }
]);

export const SPUR_STAGES = Object.freeze([
  { code: 'Discern', question: 'What life/career/ownership future is this person trying to create?', deliverable: 'Founder Life/Ownership Thesis' },
  { code: 'Discover', question: 'Where does experience/capital/network create a credible opportunity to solve a real problem?', deliverable: 'Evidence-Based Opportunity Thesis' },
  { code: 'Prepare', question: 'Is this person ready to become responsible for enterprise?', deliverable: 'Founder Readiness Assessment + Development Plan' },
  { code: 'Validate', question: 'Is problem/customer/product/business model/distribution/revenue evidence sufficient to proceed?', deliverable: 'Validated venture thesis + go/no-go' },
  { code: 'Build', question: 'Can validated evidence become a functioning enterprise?', deliverable: 'Operating MVP/venture + 90/180/365-day roadmap' },
  { code: 'Steward', question: 'Can the owner responsibly scale, govern, allocate capital and plan succession/exit?', deliverable: 'Founder Stewardship Plan' }
]);

export const VDM_STAGES = Object.freeze(['Discover','Validate','Build','Launch','Operate','Scale','Steward','Exit/Reinvest']);

export const SPRINTS = Object.freeze([
  { code: 'founder_readiness_sprint', name: 'Founder Readiness', pillar: 'founder_development', trigger: 'leadership/capability/clarity/runway gap', expected_outcomes: ['readiness delta','development plan','operating cadence evidence'] },
  { code: 'venture_validation_sprint', name: 'Venture Validation', pillar: 'product_development', trigger: 'problem/customer/business-model uncertainty', expected_outcomes: ['customer discovery evidence','validated thesis','go/no-go'] },
  { code: 'product_readiness_sprint', name: 'Product Readiness', pillar: 'product_development', trigger: 'product promise/MVP/delivery/technology gap', expected_outcomes: ['product thesis','MVP/QA evidence','launch readiness'] },
  { code: 'gtm_readiness_sprint', name: 'GTM Readiness', pillar: 'business_development', trigger: 'ICP/positioning/distribution/conversion weakness', expected_outcomes: ['ICP','offer','channel/funnel evidence','launch plan'] },
  { code: 'revenue_growth_recovery_sprint', name: 'Revenue/Growth Recovery', pillar: 'business_development', trigger: 'commercial weakness after basic market evidence exists', expected_outcomes: ['measured funnel/revenue experiment','result'] },
  { code: 'operational_readiness_sprint', name: 'Operational Readiness', pillar: 'corporate_development', trigger: 'process/system/capacity constraint', expected_outcomes: ['operating workflow','KPI','reliability evidence'] },
  { code: 'fundraising_capital_readiness_sprint', name: 'Fundraising/Capital Readiness', pillar: 'corporate_development', trigger: 'capital objective with narrative/metrics/diligence gap', expected_outcomes: ['diligence package','metrics/narrative','capital-use thesis'], regulated_boundary: 'securities/investment/fiduciary advice remains external' }
]);

export const GALVIPRO_PRACTICE = Object.freeze({
  version: DAY6_PRACTICE_VERSION,
  business_physician: ['clinical/business-health interpretation','treatment planning','intervention decision','complex escalation','sign-off'],
  galviclinician: ['routine coordination','check-ins','evidence collection','referral status'],
  galviguide: ['bounded explanation','navigation','reminders','approved evidence requests','rule-based escalation'],
  studio_operator: ['execute prescribed development intervention','collect artifacts/evidence','record authorized Studio stage-gate decisions'],
  regulated_boundary: 'legal/tax/securities/investment/fiduciary/medical and other licensed-specialty conclusions route to qualified external professionals'
});

export function findCatalogItem(code) {
  const normalized = String(code || '').trim().toLowerCase();
  for (const pillar of FOUR_PILLARS) {
    for (const item of pillar.packages) if (item.code === normalized) return { ...item, pillar: pillar.code, kind: 'package' };
  }
  const sprint = SPRINTS.find((item) => item.code === normalized);
  return sprint ? { ...sprint, kind: 'sprint' } : null;
}

export function catalogProjection() {
  return { version: DAY6_CATALOG_VERSION, sprint_version: DAY6_SPRINT_VERSION, pillars: FOUR_PILLARS, spur: { tracks: SPUR_TRACKS, stages: SPUR_STAGES }, vdm_stages: VDM_STAGES, sprints: SPRINTS };
}
