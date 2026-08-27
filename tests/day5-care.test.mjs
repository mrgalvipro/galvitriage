import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const migration=read('migrations/day1/0005_day5_governed_care.sql');
const activeMigration=read('migrations/day1/0006_day5_active_care_loop.sql');
const entry=read('worker/day5-entry.js');
const routes=read('worker/routes/care.js');
const service=read('worker/domain/care-service.js');
const activeService=read('worker/domain/day5-active-care-service.js');
const repository=read('worker/repositories/care-repository.js');
const timeline=read('worker/domain/day5-timeline-service.js');
const wrangler=JSON.parse(read('wrangler.day5.json'));

const has=(text,values)=>values.every(value=>text.includes(value));

test('D5-01 recommendation requires finding lineage and version history',()=>{
  assert.ok(has(service,['A recommendation requires at least one finding.','confirmed governed finding','recommendation_group_id','supersedeRecommendation','GV_LINEAGE_REQUIRED']));
  assert.ok(has(migration,['ux_gv1_recommendation_group_version','idx_recommendations_bmr','supersedes_recommendation_id']));
});

test('D5-02 treatment authorization, same-BMR context, and atomic plan/items are wired',()=>{
  assert.ok(routes.includes("path==='/api/v1/treatment-plans'"));
  assert.ok(routes.includes('requireOperator(request)'));
  assert.ok(has(service,['Cross-BMR treatment context is prohibited.','normalizeItems','env.DB.batch(stmts)','gv1_treatment_plan_items']));
});

test('D5-03 plan revisions and treatment events preserve history and events are DB append-only',()=>{
  assert.ok(has(service,['reviseTreatmentPlan','superseded','recordTreatmentEvent']));
  assert.ok(has(migration,['trg_gv1_treatment_events_no_update','trg_gv1_treatment_events_no_delete','GV_APPEND_ONLY']));
});

test('D5-04 outcome requires source/time/relation and feedback is separate',()=>{
  assert.ok(has(service,["requireText('observed_at'","requireText('source_type'",'Outcome requires a treatment plan or recommendation relation.','createFeedback','INSERT INTO gv1_feedback']));
  assert.equal(service.includes('UPDATE gv1_feedback'),false);
});

test('D5-05 learning remains a candidate and does not update active knowledge',()=>{
  assert.ok(has(service,['createLearningCandidate',"'proposed'",'reviewLearningCandidate']));
  assert.equal(service.includes('UPDATE gv1_knowledge_items'),false);
  assert.equal(service.includes('INSERT INTO gv1_knowledge_items'),false);
});

test('D5-06 adapter failures are isolated in delivery ledger',()=>{
  assert.ok(has(service,['maybeRecordForcedAdapterFailure','gv1_adapter_deliveries','retryAdapterDelivery','QA forced adapter failure']));
  assert.ok(has(migration,['ux_gv1_adapter_source_event','idx_adapter_status']));
});

test('MG-011 append-only treatment event guards exist',()=>{
  assert.match(migration,/BEFORE UPDATE ON gv1_treatment_events/);
  assert.match(migration,/BEFORE DELETE ON gv1_treatment_events/);
});

test('SC-009 future service can propose but privileged learning review requires operator',()=>{
  assert.ok(routes.includes("path==='/api/v1/learning-candidates'"));
  assert.ok(routes.includes("/review$/"));
  const reviewSection=routes.slice(routes.indexOf("const review="),routes.indexOf("const care="));
  assert.ok(reviewSection.includes('requireOperator(request)'));
});

test('SC-010 Stripe webhook validates signature before provider-event persistence',()=>{
  assert.ok(has(routes,['verifyStripe','Stripe-Signature','HMAC','GV_WEBHOOK_INVALID','recordStripeWebhook']));
});

test('CR-012 care and timeline use bounded typed remote-D1-safe reads',()=>{
  assert.ok(repository.includes('listCare'));
  assert.ok(routes.includes('/care$/'));
  assert.ok(routes.includes('/timeline$/'));
  assert.ok(has(timeline,['sequential single-table','getDay4Timeline','recommendation','treatment_plan','treatment_event','outcome','feedback']));
  assert.equal(timeline.includes('UNION ALL'),false);
});

test('Day 5 cumulative Worker preserves QA authority, governed AI/clarification config, booking continuity, and signed Day 4 runtime',()=>{
  assert.equal(wrangler.name,'galvivault-p0-day1-qa');
  assert.equal(wrangler.main,'worker/day5-entry.js');
  assert.equal(wrangler.vars.ENVIRONMENT,'qa');
  assert.equal(wrangler.vars.MIN_SCHEMA_VERSION,'0006');
  assert.equal(wrangler.vars.AI_ENABLED,'true');
  assert.equal(wrangler.vars.OPENAI_MODEL_QA,'gpt-4.1-mini');
  assert.equal(wrangler.vars.DAY3_CUSTOMER_SESSION_BRIDGE,'true');
  assert.equal(wrangler.vars.DAY3_CUSTOMER_EVIDENCE_RUNTIME,'collision_safe_v2');
  assert.equal(wrangler.vars.DAY4_GALVICHART_PROJECTION,'v1');
  assert.equal(wrangler.vars.DAY4_GALVICHART_CUSTOMER_PROJECTION,'v2');
  assert.equal(wrangler.vars.DAY5_ACTIVE_CARE_SCHEMA,'v1');
  assert.ok(wrangler.vars.GALVICLINIC_BOOKING_URL.includes('calendly.com'));
  assert.equal(wrangler.d1_databases[0].binding,'DB');
  assert.equal(wrangler.d1_databases[0].database_name,'galvivault-0-5-qa');
  assert.equal(wrangler.d1_databases[0].database_id,'cdf9042b-ab09-498a-ac66-010b6cce47d4');
  assert.ok(entry.includes("migration_id='0006'"));
  assert.ok(entry.includes("import day4Worker from './day4-session-identity-entry.js'"));
  assert.equal(entry.includes("import day4Worker from './day4-entry.js'"),false);
  assert.ok(has(activeMigration,['gv1_finding_decisions','gv1_galvirx','gv1_galviaudit_orders','gv1_referrals','gv1_checkins','gv1_reassessments']));
  assert.ok(has(activeService,['getClinicBrief','recordFindingDecision','addGalviRx','orderGalviAudit','createReferral','submitCheckin','reassessCare']));
});

test('Production and GalviCare baseline files remain outside the Day 5 implementation target',()=>{
  const packageJson=read('package.json');
  assert.equal(service.includes('worker/production-entry.js'),false);
  assert.equal(routes.includes('wrangler.production.jsonc'),false);
  assert.ok(packageJson.includes('galvicare-day2-qa'));
});
