import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const migration=read('migrations/day1/0006_day5_active_care_loop.sql');
const treatmentMigration=read('migrations/day1/0007_day5_treatment_contract.sql');
const routes=read('worker/routes/care.js');
const service=read('worker/domain/day5-active-care-service.js');
const treatment=read('worker/domain/day5-treatment-service.js');
const entry=read('worker/day5-entry.js');
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

test('AC-03 Business Physician governs finding/Rx/Audit/referral/reassessment',()=>{
  assert.ok(has(service,['Business Physician treatment authority is required.','recordFindingDecision','addGalviRx','orderGalviAudit','createReferral','reassessCare']));
});

test('AC-04 finding decisions preserve source artifact and append decision version',()=>{
  assert.ok(has(service,['gv1_finding_decisions','source_finding_version','version_no','confirmation_status']));assert.equal(service.includes('DELETE FROM gv1_findings'),false);
});

test('AC-05 material active-care writes are idempotent',()=>{
  for(const scope of ['day5:finding-decision','day5:galvirx','day5:galviaudit','day5:referral','day5:checkin','day5:milestone','day5:reassessment']) assert.ok(service.includes(scope),scope);
  assert.ok(service.includes('GV_IDEMPOTENCY_REUSE_MISMATCH'));
});

test('AC-06 referral consent fails closed before protected handoff',()=>{
  assert.ok(has(service,['GV_CONSENT_REQUIRED','Consent is required before protected referral handoff.','needs_consent','consented']));
});

test('AC-07 GalviGuide prohibited authority fails closed',()=>{
  assert.ok(has(service,['enforceGalviGuideBoundary','GV_GUIDE_BOUNDARY','may not confirm findings, approve treatment, change scores, or provide licensed advice']));
  assert.ok(routes.includes("enforceGalviGuideBoundary(caller,'create_treatment_plan')"));
});

test('AC-08 monitoring stays linked to canonical plan/BHR',()=>{
  assert.ok(has(service,['submitCheckin','reportMilestone','reassessCare','planInBmr','Cross-BMR active-care access is prohibited.']));assert.ok(has(migration,['idx_checkins_bmr_plan','idx_milestones_bmr_plan','idx_reassessments_bmr_plan']));
});

test('AC-09 Treatment Plan requires physician authority, fresh brief, source versions, evidence lineage, monitoring and idempotency',()=>{
  assert.ok(has(treatment,['Business Physician treatment authority is required.','brief_fingerprint','GV_STALE_SOURCE','source_versions.score','source_versions.shot','source_versions.sight','source_versions.path','accepted/clinician-confirmed findings','target_metrics','milestones','monitoring_plan.cadence','escalation_triggers','day5:governed-treatment','GV_IDEMPOTENCY_REUSE_MISMATCH']));
  assert.ok(has(treatmentMigration,['clinical_priority','source_versions_json','target_metrics_json','milestones_json','monitoring_plan_json','escalation_triggers_json','brief_fingerprint']));
  assert.ok(entry.includes("path==='/api/v1/treatment-plans'"));assert.ok(entry.includes('createGovernedTreatmentPlan'));
});

test('AC-10 readiness requires schema 0007 while preserving signed Day4 cumulative runtime',()=>{
  assert.equal(wrangler.vars.MIN_SCHEMA_VERSION,'0007');assert.equal(wrangler.vars.DAY5_ACTIVE_CARE_SCHEMA,'v1');assert.equal(wrangler.vars.DAY5_TREATMENT_CONTRACT,'evidence_bound_v1');
  assert.ok(entry.includes("migration_id='0007'"));assert.ok(entry.includes("required_schema_version:'0007'"));assert.ok(entry.includes("import day4Worker from './day4-session-identity-entry.js'"));
});
