import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const migration=read('migrations/day1/0006_day5_active_care_loop.sql');
const treatmentMigration=read('migrations/day1/0007_day5_treatment_contract.sql');
const ledger=read('migrations/day1/0590_day5_active_care_ledger_reconcile.sql');
const routes=read('worker/routes/care.js');
const common=read('worker/day5-common.js');
const service=read('worker/domain/day5-active-care-service.js');
const artifactReview=read('worker/domain/day5-artifact-review-service.js');
const treatment=read('worker/domain/day5-treatment-service.js');
const projection=read('worker/domain/day5-projection-service.js');
const results=read('worker/domain/day5-care-result-service.js');
const timeline=read('worker/domain/day5-timeline-service.js');
const entryAdapter=read('worker/day5-entry.js');
const entryCore=read('worker/day5-core-entry.js');
const entry=`${entryAdapter}\n${entryCore}`;
const wrangler=JSON.parse(read('wrangler.day5.json'));
const has=(t,a)=>a.every(x=>t.includes(x));

test('AC-01 canonical active-care schema covers physician decisions Rx Audit referral monitoring without shadow BHR',()=>{
  assert.ok(has(migration,['gv1_finding_decisions','gv1_galvirx','gv1_galviaudit_orders','gv1_referrals','gv1_checkins','gv1_milestones','gv1_reassessments']));
  assert.ok((migration.match(/bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records\(bmr_id\)/g)||[]).length>=7);
  assert.equal(migration.includes('DROP TABLE'),false);assert.equal(migration.includes('DELETE FROM'),false);
});

test('AC-02 clinic brief is read-only same-BHR projection with no OpenAI call',()=>{
  assert.ok(routes.includes('/clinic-brief$/'));assert.ok(has(service,['getClinicBrief','brief_fingerprint','read_only:true','gv1_evidence_items','gv1_findings','gv1_hypotheses','gv1_recommendations','gv1_treatment_plans']));
  const brief=service.slice(service.indexOf('export async function getClinicBrief'),service.indexOf('export async function recordFindingDecision'));
  assert.equal(brief.includes('INSERT INTO'),false);assert.equal(brief.toLowerCase().includes('openai'),false);
});

test('AC-03 Business Physician governs finding/Rx/Audit/referral/reassessment',()=>{assert.ok(has(service,['Business Physician treatment authority is required.','recordFindingDecision','addGalviRx','orderGalviAudit','createReferral','reassessCare']));});

test('AC-04 finding decisions preserve source artifact and append decision version',()=>{assert.ok(has(service,['gv1_finding_decisions','source_finding_version','version_no','confirmation_status']));assert.equal(service.includes('DELETE FROM gv1_findings'),false);});

test('AC-04A accepted governed GalviShot AI remains review-only until explicit physician decision materializes canonical finding',()=>{
  assert.ok(has(artifactReview,['acceptedArtifactReviewCandidates','review_candidate:true','canonical:false',"confirmation_status:'needs_review'","source_type:'openai_governed'",'materializeAcceptedFindingCandidate','INSERT OR IGNORE INTO gv1_findings']));
  const readOnly=artifactReview.slice(artifactReview.indexOf('export async function acceptedArtifactReviewCandidates'),artifactReview.indexOf('export async function materializeAcceptedFindingCandidate'));
  assert.equal(/INSERT|UPDATE|DELETE/i.test(readOnly),false);
  assert.ok(routes.includes('materializeAcceptedFindingCandidate'));
  const decision=routes.slice(routes.indexOf("path==='/api/v1/finding-decisions'"),routes.indexOf("path==='/api/v1/galvirx'"));
  assert.ok(decision.includes('materializeAcceptedFindingCandidate'));
  assert.ok(decision.includes('recordFindingDecision'));
});

test('AC-05 material active-care writes are idempotent',()=>{for(const scope of ['day5:finding-decision','day5:galvirx','day5:galviaudit','day5:referral','day5:checkin','day5:milestone','day5:reassessment']) assert.ok(service.includes(scope),scope);assert.ok(service.includes('GV_IDEMPOTENCY_REUSE_MISMATCH'));});

test('AC-06 referral consent fails closed before protected handoff',()=>{assert.ok(has(service,['GV_CONSENT_REQUIRED','Consent is required before protected referral handoff.','needs_consent','consented']));});

test('AC-07 GalviGuide prohibited authority fails closed',()=>{assert.ok(has(service,['enforceGalviGuideBoundary','GV_GUIDE_BOUNDARY','may not confirm findings, approve treatment, change scores, or provide licensed advice']));assert.ok(routes.includes("enforceGalviGuideBoundary(caller,'create_treatment_plan')"));});

test('AC-08 monitoring stays linked to canonical plan/BHR',()=>{assert.ok(has(service,['submitCheckin','reportMilestone','reassessCare','planInBmr','Cross-BMR active-care access is prohibited.']));assert.ok(has(migration,['idx_checkins_bmr_plan','idx_milestones_bmr_plan','idx_reassessments_bmr_plan']));});

test('AC-09 Treatment Plan requires physician authority, fresh brief, source versions, evidence lineage, monitoring and idempotency',()=>{
  assert.ok(has(treatment,['Business Physician treatment authority is required.','brief_fingerprint','GV_STALE_SOURCE','requiredSourceVersions',"['score','shot','sight','path']",'accepted/clinician-confirmed findings','target_metrics','milestones','monitoring_plan.cadence','escalation_triggers','day5:governed-treatment','GV_IDEMPOTENCY_REUSE_MISMATCH']));
  assert.ok(has(treatmentMigration,['clinical_priority','source_versions_json','target_metrics_json','milestones_json','monitoring_plan_json','escalation_triggers_json','brief_fingerprint']));
  assert.ok(entry.includes("path==='/api/v1/treatment-plans'"));assert.ok(entry.includes('createGovernedTreatmentPlan'));
});

test('AC-10 readiness uses collision-safe Day 5 ledger IDs while preserving signed Day4 cumulative runtime',()=>{
  assert.equal(wrangler.vars.MIN_SCHEMA_VERSION,'D5A2');assert.equal(wrangler.vars.DAY5_ACTIVE_CARE_SCHEMA,'v1');assert.equal(wrangler.vars.DAY5_TREATMENT_CONTRACT,'evidence_bound_v1');
  assert.ok(has(ledger,["'D5A1'","'D5A2'",'day5_active_care_loop_v1','day5_treatment_contract_v1']));
  assert.ok(entry.includes("name='day5_treatment_contract_v1'"));assert.ok(entry.includes("required_schema_version:'D5A2'"));assert.ok(entry.includes("import day4Worker from './day4-session-identity-entry.js'"));
});

test('AC-11 governed Clinic brief exposes canonical Score/Shot/Sight/Path versions without AI regeneration',()=>{
  assert.ok(has(projection,['gv1_day2_intake_results','result_type=\'score\'','gv1_day3_governed_artifacts','GalviShot','GalviSight','GalviPath','source_versions','source_refs','getGovernedClinicBrief']));
  assert.equal(projection.toLowerCase().includes('openai.responses'),false);
  assert.ok(routes.includes('getGovernedClinicBrief'));
});

test('AC-12 GalviAudit and referral returned results become immutable governed BHR evidence',()=>{
  assert.ok(has(results,['recordGalviAuditResult','recordReferralOutcome','gv1_evidence_items','status=\'completed\'','result_evidence_id','GV_CONSENT_REQUIRED','day5:galviaudit-result','day5:referral-outcome']));
  assert.ok(has(routes,['/galviaudit-orders\\/([^/]+)\\/result$/','/referrals\\/([^/]+)\\/outcome$/']));
  assert.equal(results.includes('DELETE FROM'),false);
});

test('AC-13 customer Chart active-care projection is read-only, canonical-schema-bound, remote-D1-safe and customer-safe',()=>{
  assert.ok(has(projection,['augmentCustomerChartResponse','active_care','customer_visible=1',"consent_status='consented'",'active_care_ai_called_on_read:false','outcome_value_json','measured_at','sequential, single-table and parameterized']));
  assert.ok(entry.includes("path==='/api/v1/day4/chart'"));
  const augment=projection.slice(projection.indexOf('export async function augmentCustomerChartResponse'));
  assert.equal(/Promise\.all\s*\(/.test(augment),false);
  assert.equal(augment.includes('value_text,value_number,observed_at'),false);
  assert.equal(augment.includes('INSERT INTO'),false);assert.equal(augment.includes('UPDATE '),false);assert.equal(augment.includes('DELETE FROM'),false);
});

test('AC-14 Day 5 timeline includes treatment decisions, Rx, diagnostics, referrals and monitoring',()=>{
  assert.ok(has(timeline,['finding_decision','galvirx','galviaudit','referral','checkin','milestone','reassessment']));
  assert.equal(timeline.includes('UNION ALL'),false);
});

test('AC-15 Treatment Plan revision preserves the full governed Day 5 contract',()=>{
  assert.ok(has(treatment,['reviseGovernedTreatmentPlan','Only the current governed Treatment Plan version may be revised.','A newer Treatment Plan version already exists. Refresh before revising.','Clinic brief is stale; refresh before revising treatment.','day5:governed-treatment:revise','supersedes_treatment_plan_id','source_versions','brief_fingerprint']));
  assert.ok(entry.includes('reviseGovernedTreatmentPlan'));
  assert.ok(entry.includes("const governedRevision=path.match(/^\\/api\\/v1\\/treatment-plans\\/([^/]+)\\/revisions$/)"));
  assert.ok(entry.includes("governed_treatment_revision:'v1'"));
});

test('AC-16 H19 customer acknowledgement is separate from physician authorship, session-bound and idempotent',()=>{
  assert.ok(has(service,['acknowledgeTreatmentPlan','CUSTOMER_ACK_ROLES','customer_acknowledged','day5:treatment-acknowledgement','authorship_changed:false','gv1_treatment_events']));
  const ack=service.slice(service.indexOf('export async function acknowledgeTreatmentPlan'),service.indexOf('export async function submitCheckin'));
  assert.equal(ack.includes('UPDATE gv1_treatment_plans'),false);
  assert.ok(has(entry,['authorizedCustomerChart','CUSTOMER_SESSION_HEADER','/api/v1/day4/chart',"role:'customer'","identity_source:'authenticated_galvichart'","/day5\\/customer\\/treatment-plans\\/([^/]+)\\/acknowledgement$/","path==='/api/v1/day5/customer/checkins'"]));
  assert.ok(has(common,['CUSTOMER_SESSION_HEADER','X-Galvi-Day3-Session','Access-Control-Allow-Headers']));
  assert.ok(has(projection,["event_type='customer_acknowledged'",'acknowledgements','customer_acknowledgement_projection']));
});

test('AC-17 inherited Day3/Day4 customer routes preserve the exact browser CORS contract through Day5',()=>{
  assert.ok(has(common,['Cache-Control',CUSTOMER_HEADER_TOKEN(),'Access-Control-Request-Headers']));
  assert.ok(has(entry,['preserveDay5Cors','inheritedResponse','Access-Control-Allow-Origin','Access-Control-Allow-Headers','X-Galvi-Day5-Inherited-Cors','return inheritedResponse(request,env,executionContext,ctx)']));
  assert.ok(wrangler.vars.ALLOWED_ORIGINS.includes('https://galvicare-0-5-qa.mrgalvipro.workers.dev'));
});

test('AC-18 cumulative adapter preserves all active-care authority while bounding only provider projection',()=>{
  assert.ok(has(entryAdapter,["import day5Worker from './day5-core-entry.js'",'MAX_PROVIDER_EVIDENCE_ITEMS=3','selectProviderEvidence','/api/v1/day5/customer/score-metadata']));
  assert.equal(entryAdapter.includes('createGovernedTreatmentPlan('),false);
  assert.equal(entryAdapter.includes('DELETE FROM gv1_evidence_items'),false);
});

function CUSTOMER_HEADER_TOKEN(){return 'X-Galvi-Day3-Session';}
