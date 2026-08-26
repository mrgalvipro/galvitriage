import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Day 4 release-convergence contract: core authorization remains inherited while
// the v2 adapter adds only accepted, customer-projectable intelligence to reads
// and the outer identity compatibility boundary resolves a current legacy session
// through its server-owned venture -> founder relationship without rebinding or
// minting a second founder/BHR.
const core=readFileSync(new URL('../worker/day4-galvicare-1-0.js',import.meta.url),'utf8');
const projection=readFileSync(new URL('../worker/day4-customer-projection-v2.js',import.meta.url),'utf8');
const identity=readFileSync(new URL('../worker/day4-session-identity-entry.js',import.meta.url),'utf8');
const browser=readFileSync(new URL('../day4-galvichart-browser.js',import.meta.url),'utf8');
const hardening=readFileSync(new URL('../day4-customer-experience-hardening.js',import.meta.url),'utf8');
const singleCurrent=readFileSync(new URL('../day4-single-current-governed-product.js',import.meta.url),'utf8');
const config=JSON.parse(readFileSync(new URL('../wrangler.day4.json',import.meta.url),'utf8'));

test('Day 4 stays on the existing QA Worker/D1 and uses additive projection + identity compatibility adapters',()=>{
  assert.equal(config.name,'galvivault-p0-day1-qa');
  assert.equal(config.main,'worker/day4-session-identity-entry.js');
  assert.equal(config.d1_databases?.[0]?.database_name,'galvivault-0-5-qa');
  assert.equal(config.d1_databases?.[0]?.database_id,'cdf9042b-ab09-498a-ac66-010b6cce47d4');
  assert.equal(config.vars?.ENVIRONMENT,'qa');
  assert.equal(config.vars?.AI_ENABLED,'true');
  assert.equal(config.vars?.DAY4_GALVICHART_CUSTOMER_PROJECTION,'v2');
  assert.equal(config.vars?.DAY4_SESSION_IDENTITY_COMPAT,'v1');
  assert.ok(projection.startsWith("import day4 from './day4-galvicare-1-0.js';"));
  assert.ok(identity.startsWith("import day4 from './day4-customer-projection-v2.js';"));
});

test('Returning/retest customer session resolves through server-owned venture founder link without rebinding identity',()=>{
  for(const required of [
    'day4_session_identity_v1','LEGACY_FOUNDER_BY_SESSION','SESSION_VENTURE_FOUNDER',
    'FROM ventures v','JOIN founders f ON f.founder_id=v.founder_id','WHERE v.session_id=?',
    'returning_session_identity_resolution: true',"session_identity_source: 'server_session_venture_founder_link'",
    'founder_session_rebinding: false','createIdentityCompatibleDb'
  ]) assert.ok(identity.includes(required),`missing identity compatibility contract ${required}`);
  for(const forbidden of ['UPDATE founders','INSERT INTO founders','DELETE FROM founders','CREATE TABLE','api.openai.com','OPENAI_API_KEY'])
    assert.equal(identity.includes(forbidden),false,`identity boundary contains forbidden mutation/provider contract ${forbidden}`);
});

test('H13 secure return restores the same canonical record without Triage resubmission or localStorage identity authority',()=>{
  for(const required of [
    'day4_secure_return_v1','/api/v1/day4/secure-return/issue','/api/v1/day4/secure-return/exchange',
    'gv1_principal_sessions','galvicare_day4_secure_return','client_session_key',
    'chartForSession','legacySessionForGrant','same_record_verified: true',
    'requires_triage_resubmission: false','new_principal_created: false','new_bmr_created: false',
    'secure_cross_device_return: true','chart_authorization_rechecked: true'
  ]) assert.ok(identity.includes(required),`missing H13 server return contract ${required}`);
  for(const required of [
    'GalviCare Day 4 secure cross-device return v1','galvireturn','returnTokenFromLocation','installReturnUrl',
    'exchangeSecureReturn','persistRecoveredSession','omitSession:true','same_record_verified',
    'No new GalviTriage is required','returnUrl:()=>returnTokenFromLocation()?location.href'
  ]) assert.ok(browser.includes(required),`missing H13 browser return contract ${required}`);
  assert.equal(browser.includes('context_id='+RETURN_FRAGMENT_PLACEHOLDER),false);
  for(const forbidden of ['email='+RETURN_FRAGMENT_PLACEHOLDER,'bmr_id='+RETURN_FRAGMENT_PLACEHOLDER,'principal_id='+RETURN_FRAGMENT_PLACEHOLDER])
    assert.equal(browser.includes(forbidden),false,`secure return URL must not expose record identity: ${forbidden}`);
  assert.equal(identity.includes('INSERT INTO gv1_founders'),false,'secure return must not mint a founder');
  assert.equal(identity.includes('INSERT INTO gv1_business_medical_records'),false,'secure return must not mint a BHR');
  assert.equal(identity.includes('INSERT INTO sessions'),false,'secure return must not create a replacement legacy session');
});

const RETURN_FRAGMENT_PLACEHOLDER='';

test('Core Day 4 projection remains server-authorized, Shot-gated and side-effect free on reads',()=>{
  for(const required of [
    "'/api/v1/day4/chart'","'/api/v1/day4/chart/command'",'legacyShotEntitled','requireConsent',
    'gv1_day3_governed_artifacts','customer_projection','side_effect_free_read: true','ai_called_on_read: false',
    "status: 'locked'",'galvishot_entitlement_required','GV_AUTH_FORBIDDEN'
  ]) assert.ok(core.includes(required),`missing ${required}`);
  assert.equal(/api\.openai\.com/.test(core),false);
  assert.equal(/chart_truth|CREATE TABLE/i.test(core),false);
});

test('Customer projection v2 reads only accepted projectable governed artifacts and cannot mutate D1',()=>{
  for(const required of [
    'galvichart_customer_projection_v2','latestCustomerArtifact','gv1_day3_governed_artifacts',
    "customer_projection=1","validation_status='accepted'","approval_status IN ('not_required','approved')",
    'accepted_galviengine_artifacts','progressively_complete','customer_intelligence',
    "latestCustomerArtifact(env.DB, contextId, 'GalviShot')",
    "latestCustomerArtifact(env.DB, contextId, 'GalviSight')",
    "latestCustomerArtifact(env.DB, contextId, 'GalviPath')",
    'ai_called_on_read: false','customer_projection_read_only: true'
  ]) assert.ok(projection.includes(required),`missing projection contract ${required}`);
  for(const forbidden of ['api.openai.com','OPENAI_API_KEY','INSERT INTO','UPDATE gv1_','DELETE FROM','CREATE TABLE'])
    assert.equal(projection.includes(forbidden),false,`projection contains forbidden write/provider contract ${forbidden}`);
});

test('Day 4 exposes all eight required Chart sections from canonical state',()=>{
  for(const required of ['overview','health','timeline','care_plan','evidence','documents','galviclinic','history'])
    assert.ok(core.includes(required),`missing section ${required}`);
  for(const required of ['gv1_day2_intake_results','gv1_day3_governed_artifacts','gv1_audit_log','gv1_evidence_items'])
    assert.ok(core.includes(required),`missing canonical source ${required}`);
});

test('Day 4 customer commands are idempotent/versioned and do not silently rewrite history',()=>{
  for(const required of ['gv1_day1_request_receipts','Idempotency-Key','GV_IDEMPOTENCY_REUSE_MISMATCH','gv1_audit_log','record_version'])
    assert.ok(core.includes(required),`missing ${required}`);
  for(const command of ['submit_check_in','upload_evidence','correct_profile','report_treatment_milestone','acknowledge_treatment_plan','schedule_galviclinic','export_record'])
    assert.ok(core.includes(`'${command}'`),`missing ${command}`);
});

test('Base browser remains renderer-only and cannot create entitlement or call OpenAI/D1 directly',()=>{
  assert.ok(browser.includes('GalviCare Day 4 GalviChart customer projection v1'));
  assert.ok(browser.includes('/api/v1/day4/chart'));
  assert.ok(browser.includes('X-Galvi-Day3-Session'));
  assert.ok(browser.includes('View GalviChart™'));
  for(const source of [browser,hardening,singleCurrent]){
    for(const forbidden of ['api.openai.com','OPENAI_API_KEY','wrangler','SELECT ','INSERT INTO ','UPDATE gv1_','payment_required=true'])
      assert.equal(source.includes(forbidden),false,`browser contains forbidden contract ${forbidden}`);
  }
});

test('Unsaved Score/Shot/Sight/Path follow-up drafts survive focus loss and re-render until server save succeeds',()=>{
  for(const required of [
    'GalviCare Day 4 customer experience hardening v1','GalviCare Day 4 follow-up draft resilience v1',
    'GalviCare Day 4 customer continuity remediation v2','galvicare_followup_drafts_v2',
    'followup-question-container','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
    'save_galviscore_followup','save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
    "document.addEventListener('input'","document.addEventListener('visibilitychange'","window.addEventListener('blur'",
    "window.addEventListener('pagehide'",'MutationObserver','persistAllDrafts();',
    'clearSavedDrafts(product,submittedQuestionIds(init.body))'
  ]) assert.ok(hardening.includes(required),`missing draft resilience contract ${required}`);
  assert.ok(hardening.includes('questionCode||field?.dataset?.questionId||field?.name||field?.id'));
  assert.ok(hardening.includes('if(payload?.success!==false)clearSavedDrafts'));
});

test('Sight/Path present one current governed customer result and refresh only after canonical evidence advances',()=>{
  for(const required of [
    'GalviCare Day 4 single-current governed product projection v1',
    'save_galvisight_followup','save_galvipath_followup','evidence_version_bumped','evidenceAdvanced',
    'day4-superseded-current','data-day4-governed-current','stale current projection invalidated after evidence-version advance',
    'Current view — updated using your latest answers. Earlier accepted views remain preserved in GalviChart History.',
    'galvisight-result-panel','galvipath-result-panel','day3-ai-galvisight','day3-ai-galvipath',
    'galvipath-detail-section','day3-governed-primary','body.qa-debug-enabled [data-day4-technical-meta="1"]'
  ]) assert.ok(singleCurrent.includes(required),`missing single-current contract ${required}`);
  assert.ok(singleCurrent.includes("card?.remove();"),'GalviPath duplicate governed summary card must be removed after in-place governed plan projection.');
  assert.ok(singleCurrent.includes("child.classList.add(SUPERSEDED)"),'GalviSight deterministic parallel current view must be suppressed only after governed projection succeeds.');
  for(const forbidden of ['localStorage','sessionStorage','textarea','galvicare_followup_drafts','/api/v1/day4/chart','api.openai.com','OPENAI_API_KEY','SELECT ','INSERT INTO ','UPDATE ','DELETE FROM '])
    assert.equal(singleCurrent.includes(forbidden),false,`single-current projection must not own canonical truth or follow-up draft state: ${forbidden}`);
});

test('Customer-safe Chart hardening is race-free and uses the authorized read projection, not raw machinery',()=>{
  for(const required of [
    'GalviCare Day 4 customer-safe governed interpretation v1','requestChartProjection','ensureChartHardening',
    "DAY4_BASE+'/api/v1/day4/chart'",'X-Galvi-Day3-Session','MutationObserver',
    'What GalviCare understands right now','renderDimensions','How confident is this view?',
    'GalviSight interpretation','Why these symptoms may be happening','Your care objective',
    'Record version details','accepted GalviEngine reasoning already saved in GalviVault',
    'Opening GalviChart does not rerun AI or change your clinical record',
    'customer_intelligence'
  ]) assert.ok(hardening.includes(required),`missing customer-safe Chart contract ${required}`);
  assert.equal(hardening.includes("url.includes('/api/v1/day4/chart')"),false,'old first-fetch interception race survived');
});

test('Day 3 closed-loop runtime remains inherited, not replaced',()=>{
  assert.ok(core.startsWith("import day3Unified from './day3-unified-customer-api.js';"));
  assert.ok(core.includes('return day3Unified.fetch(request, env, ctx)'));
  assert.equal(core.includes('get_or_generate_galviscore'),false);
  assert.equal(core.includes('save_galvishot_followup'),false);
  assert.ok(projection.includes('return upstream;'));
  assert.ok(identity.includes('day4.fetch(request, compatibleEnv, ctx)'));
});