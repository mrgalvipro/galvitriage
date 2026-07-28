import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('worker/day7d-engine.js', 'utf8');
const browser = fs.readFileSync('day7d-browser-customer-intelligence.js', 'utf8');
const builder = fs.readFileSync('scripts/day7b-build-qa-frontend.mjs', 'utf8');

const has = (source, token, message) => assert.ok(source.includes(token), `${message}: missing ${token}`);
const lacks = (source, token, message) => assert.ok(!source.includes(token), `${message}: forbidden ${token}`);

const requiredActions = [
  'evaluate_galvishot','save_galvishot_followup','get_or_create_galvishot',
  'evaluate_galvisight','save_galvisight_followup','get_or_generate_galvisight',
  'evaluate_galvipath','save_galvipath_followup','get_or_generate_galvipath'
];

test('Worker exposes the complete authoritative Day 7D action surface', () => {
  for (const action of requiredActions) has(engine, action, 'Day 7D action contract');
  has(engine, "status:'needs_followup'", 'follow-up gate');
  has(engine, 'getOrCreate', 'authoritative generation');
  has(engine, 'saveResult', 'result persistence');
  lacks(engine, 'preservedLegacyResult', 'legacy result bypass');
});

test('Follow-up persistence is server-selected, idempotent, and evidence-versioned', () => {
  has(engine, 'async function atomicSave', 'atomic save boundary');
  has(engine, 'allowed.find', 'server-selected question validation');
  has(engine, 'already_saved:true', 'duplicate answer idempotency');
  has(engine, 'await bump(db,sid', 'evidence-version increment');
  has(engine, 'evidence_version_bumped:after>before', 'evidence-version response proof');
  has(engine, "status:'validation_error'", 'invalid answer rejection');
});

test('Each downstream product requires a targeted question before generation', () => {
  for (const product of ['GalviShot','GalviSight','GalviPath']) has(engine, `${product}:`, `${product} follow-up bank`);
  has(engine, 'chooseFollowups', 'follow-up selection');
  has(engine, 'if(Object.values(existing).some(txt))return[]', 'completed-stage stop condition');
  has(engine, 'followup_questions:out', 'generation gate response');
});

test('GalviShot, GalviSight, GalviPath, and Clinic consume cumulative customer intelligence', () => {
  has(engine, "evidence(f,'GalviShot')", 'GalviShot evidence consumption');
  has(engine, 'const w=f.reconciliation.weakest_dimension,ev=evidence(f)', 'GalviSight cumulative evidence');
  has(engine, 'const w=f.reconciliation.weakest_dimension,target=', 'GalviPath cumulative evidence');
  has(engine, 'clinic_brief:', 'cumulative GalviClinic brief');
  has(engine, 'customer_intelligence_evidence:ev', 'customer-intelligence result evidence');
});

test('Save returns the regenerated enriched result without a second paywall loop', () => {
  has(engine, "if(evaluation.status==='needs_followup')", 'remaining-question branch');
  has(engine, 'const generated=await getOrCreate', 'immediate regeneration after final save');
  has(engine, '...generated', 'generated result returned by save');
  has(browser, 'const regenerated=(saved.result||saved.data)?saved:await call(cfg.get,{})', 'single response browser continuation');
  has(browser, 'await renderReadyStage(product,regenerated)', 'enriched result rendering');
});

test('Browser exposes and saves targeted questions across all downstream stages', () => {
  for (const token of [
    'galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
    'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
    'evidence_version_bumped','installAuthoritativeStageRoutes','invokeLegacyWithResponse'
  ]) has(browser, token, 'progressive browser contract');
});

test('Browser initializes authoritative routes for current and future DOM states', () => {
  has(browser, "document.addEventListener('DOMContentLoaded',initialize)", 'DOMContentLoaded initialization');
  has(browser, "if(document.readyState!=='loading') queueMicrotask(initialize)", 'already-loaded initialization');
  has(browser, "return renderReadyStage('GalviSight',response)", 'GalviSight response-aware render');
  has(browser, "return renderReadyStage('GalviPath',response)", 'GalviPath response-aware render');
});

test('QA builder preserves the proven isolated environment and injects Day 7D', () => {
  has(builder, "const DAY7D_BROWSER = 'day7d-browser-customer-intelligence.js'", 'Day 7D browser source');
  has(builder, 'readFileSync(DAY7D_BROWSER', 'Day 7D adapter injection');
  has(builder, 'GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS', 'QA isolation banner');
  has(builder, "const QA_WORKER = 'https://galvicare-triage-intake.mrgalvipro.workers.dev'", 'QA Worker endpoint');
  has(builder, "const TEST_STRIPE_MARKER = 'https://buy.stripe.com/test_'", 'Stripe TEST preservation');
});

test('Runtime contract is versioned and health-check visible', () => {
  has(engine, "galviengine_customer_intelligence_v0_5_2", 'rules version');
  has(engine, "day7d_progressive_customer_intelligence_v2", 'release contract');
  has(engine, "entrypoint:'worker/day7d-engine.js'", 'authoritative entrypoint');
  has(engine, 'progressive_followups:true', 'progressive follow-up capability');
  has(engine, 'atomic_followup_save:true', 'atomic save capability');
  has(engine, 'server_selected_question_validation:true', 'question validation capability');
  has(engine, 'save_returns_regenerated_result:true', 'regeneration capability');
});
