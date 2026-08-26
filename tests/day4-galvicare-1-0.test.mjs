import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Day 4 release-convergence marker: this shared critical-path contract intentionally
// triggers both QA runtime workflows so backend and frontend prove the same candidate SHA.
const worker=readFileSync(new URL('../worker/day4-galvicare-1-0.js',import.meta.url),'utf8');
const browser=readFileSync(new URL('../day4-galvichart-browser.js',import.meta.url),'utf8');
const hardening=readFileSync(new URL('../day4-customer-experience-hardening.js',import.meta.url),'utf8');
const config=JSON.parse(readFileSync(new URL('../wrangler.day4.json',import.meta.url),'utf8'));

test('Day 4 uses the existing QA Worker/D1 and the approved 1.0 entrypoint',()=>{
  assert.equal(config.name,'galvivault-p0-day1-qa');
  assert.equal(config.main,'worker/day4-galvicare-1-0.js');
  assert.equal(config.d1_databases?.[0]?.database_name,'galvivault-0-5-qa');
  assert.equal(config.d1_databases?.[0]?.database_id,'cdf9042b-ab09-498a-ac66-010b6cce47d4');
  assert.equal(config.vars?.ENVIRONMENT,'qa');
  assert.equal(config.vars?.AI_ENABLED,'true');
});

test('Day 4 projection is server-authorized, Shot-gated and side-effect free on reads',()=>{
  for(const required of [
    "'/api/v1/day4/chart'","'/api/v1/day4/chart/command'",'legacyShotEntitled','requireConsent',
    'gv1_day3_governed_artifacts','customer_projection','side_effect_free_read: true','ai_called_on_read: false',
    "status: 'locked'",'galvishot_entitlement_required','GV_AUTH_FORBIDDEN'
  ]) assert.ok(worker.includes(required),`missing ${required}`);
  assert.equal(/api\.openai\.com/.test(worker),false);
  assert.equal(/chart_truth|CREATE TABLE/i.test(worker),false);
});

test('Day 4 exposes all eight required Chart sections from canonical state',()=>{
  for(const required of ['overview','health','timeline','care_plan','evidence','documents','galviclinic','history'])
    assert.ok(worker.includes(required),`missing section ${required}`);
  for(const required of ['gv1_day2_intake_results','gv1_day3_governed_artifacts','gv1_audit_log','gv1_evidence_items'])
    assert.ok(worker.includes(required),`missing canonical source ${required}`);
});

test('Day 4 customer commands are idempotent/versioned and do not silently rewrite history',()=>{
  for(const required of ['gv1_day1_request_receipts','Idempotency-Key','GV_IDEMPOTENCY_REUSE_MISMATCH','gv1_audit_log','record_version'])
    assert.ok(worker.includes(required),`missing ${required}`);
  for(const command of ['submit_check_in','upload_evidence','correct_profile','report_treatment_milestone','acknowledge_treatment_plan','schedule_galviclinic','export_record'])
    assert.ok(worker.includes(`'${command}'`),`missing ${command}`);
});

test('Day 4 browser is renderer-only and cannot create entitlement or call OpenAI/D1 directly',()=>{
  assert.ok(browser.includes('GalviCare Day 4 GalviChart customer projection v1'));
  assert.ok(browser.includes('/api/v1/day4/chart'));
  assert.ok(browser.includes('X-Galvi-Day3-Session'));
  assert.ok(browser.includes('View GalviChart™'));
  for(const source of [browser,hardening]){
    for(const forbidden of ['api.openai.com','OPENAI_API_KEY','wrangler','SELECT ','INSERT INTO ','UPDATE gv1_','payment_required=true'])
      assert.equal(source.includes(forbidden),false,`browser contains forbidden contract ${forbidden}`);
  }
});

test('Day 4 preserves unsaved Shot/Sight/Path follow-up drafts until a successful server save',()=>{
  for(const required of [
    'GalviCare Day 4 customer experience hardening v1','GalviCare Day 4 follow-up draft resilience v1','galvicare_followup_drafts_v1',
    'galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
    'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
    "document.addEventListener('input'","document.addEventListener('visibilitychange'","window.addEventListener('blur'","window.addEventListener('pagehide'",'MutationObserver'
  ]) assert.ok(hardening.includes(required),`missing draft resilience contract ${required}`);
  assert.ok(hardening.includes('if(response.ok&&init?.body)'));
  assert.ok(hardening.includes('clearSavedDrafts(product,answers)'));
});

test('Day 4 Chart translates authorized canonical data and accepted governed intelligence into customer-safe language',()=>{
  for(const required of [
    'GalviCare Day 4 customer-safe governed interpretation v1','What GalviCare understands right now',
    'renderDimensions','How confident is this view?','Evidence that still needs validation',
    'accepted GalviEngine reasoning already saved in GalviVault','Opening GalviChart does not rerun AI',
    'Record version details'
  ]) assert.ok(hardening.includes(required),`missing customer-safe Chart contract ${required}`);
  assert.ok(hardening.includes("url.includes('/api/v1/day4/chart')"));
});

test('Day 3 closed-loop runtime remains inherited, not replaced',()=>{
  assert.ok(worker.startsWith("import day3Unified from './day3-unified-customer-api.js';"));
  assert.ok(worker.includes('return day3Unified.fetch(request, env, ctx)'));
  assert.equal(worker.includes('get_or_generate_galviscore'),false);
  assert.equal(worker.includes('save_galvishot_followup'),false);
});
