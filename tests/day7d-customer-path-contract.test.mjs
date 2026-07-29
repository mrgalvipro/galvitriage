import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine = fs.readFileSync('worker/day7d-engine.js', 'utf8');
const browser = fs.readFileSync('day7d-browser-customer-intelligence.js', 'utf8');
const builder = fs.readFileSync('scripts/day7b-build-qa-frontend.mjs', 'utf8');

const has = (source, token, message) => assert.ok(source.includes(token), `${message}: missing ${token}`);
const lacks = (source, token, message) => assert.ok(!source.includes(token), `${message}: forbidden ${token}`);

const requiredActions = [
  'get_clinical_file',
  'evaluate_galvishot','save_galvishot_followup','get_or_create_galvishot',
  'evaluate_galvisight','save_galvisight_followup','get_or_generate_galvisight',
  'evaluate_galvipath','save_galvipath_followup','get_or_generate_galvipath'
];

test('Worker exposes the complete authoritative Day 7D action surface', () => {
  for (const action of requiredActions) has(engine, action, 'Day 7D action contract');
  has(engine, "status:'needs_followup'", 'follow-up gate');
  has(engine, 'getOrCreate', 'authoritative generation');
  has(engine, 'storedResult', 'evidence-version cache');
  has(engine, 'saveResult', 'result persistence');
  lacks(engine, 'preservedLegacyResult', 'legacy result bypass');
});

test('Follow-up persistence is server-selected, idempotent, evidence-versioned, and skip-safe', () => {
  has(engine, 'async function atomicSave', 'atomic save boundary');
  has(engine, 'allowed.find', 'server-selected question validation');
  has(engine, 'already_saved:true', 'duplicate answer idempotency');
  has(engine, 'await bump(db,sid', 'evidence-version increment');
  has(engine, 'evidence_version_bumped:after>before', 'evidence-version response proof');
  has(engine, "status:'validation_error'", 'invalid answer rejection');
  has(engine, "const impact=skipped?0", 'skip zero-confidence contract');
  has(engine, 'if(!isSkipped(x.answer)', 'skip excluded from evidence');
});

test('Each downstream product uses the approved dynamic 0–3 follow-up selector', () => {
  for (const product of ['GalviShot','GalviSight','GalviPath']) has(engine, `${product}:`, `${product} follow-up bank`);
  has(engine, 'export function chooseFollowups', 'follow-up selection');
  has(engine, 'if(confidence<=59)requiredTotal=3', 'low-confidence three-question contract');
  has(engine, 'else if(confidence<=69)requiredTotal=2', 'moderate-confidence two-question contract');
  has(engine, 'else if(confidence<=79)requiredTotal=1', 'moderate-confidence one-question contract');
  has(engine, 'const required=Math.max(0,requiredTotal-completed.size)', 'completed-or-skipped advancement');
  has(engine, 'completed.has(q.question_id)', 'no-repeat contract');
});

test('GalviShot, GalviSight, GalviPath, and Clinic consume cumulative customer intelligence', () => {
  has(engine, "evidence(f,'GalviShot')", 'GalviShot evidence consumption');
  has(engine, 'const w=f.reconciliation.weakest_dimension,ev=evidence(f)', 'GalviSight cumulative evidence');
  has(engine, 'const w=f.reconciliation.weakest_dimension,target=', 'GalviPath cumulative evidence');
  has(engine, 'clinic_brief:', 'cumulative GalviClinic brief');
  has(engine, 'priority_findings:', 'Clinic priority findings');
  has(engine, 'stated_30_day_outcome:', 'Clinic 30-day outcome');
  has(engine, 'stated_90_day_outcome:', 'Clinic 90-day outcome');
  has(engine, 'customer_intelligence_evidence:ev', 'customer-intelligence result evidence');
});

test('Results reuse matching evidence versions and regenerate after evidence changes', () => {
  has(engine, 'Number(result.evidence_version)===Number(evidenceVersionValue)', 'cache evidence-version match');
  has(engine, "generation_source:'stored'", 'stored deterministic replay');
  has(engine, "generation_source:'regenerated'", 'changed-evidence regeneration');
  has(engine, "if(evaluation.status==='needs_followup')", 'remaining-question branch');
  has(engine, 'const generated=await getOrCreate', 'immediate regeneration after final save');
  has(browser, 'const regenerated=(saved.result||saved.data)?saved:await call(cfg.get,{})', 'single response browser continuation');
  has(browser, 'await renderReadyStage(product,regenerated)', 'enriched result rendering');
});

test('Browser skip advances inside the progressive flow and cannot fall through to Stripe', () => {
  for (const token of [
    'galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
    'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
    'skipCurrentQuestion','SKIPPED_ANSWER','stopImmediatePropagation',
    'installAuthoritativeStageRoutes','invokeLegacyWithResponse'
  ]) has(browser, token, 'progressive browser contract');
  has(browser, 'return completeCurrentQuestion(product,true)', 'skip invokes authoritative completion');
  has(browser, 'if(savedStatus===\'needs_followup\')', 'skip advances to remaining question');
});

test('Browser initializes authoritative routes for current and future DOM states', () => {
  has(browser, "document.addEventListener('DOMContentLoaded',initialize)", 'DOMContentLoaded initialization');
  has(browser, "if(document.readyState!=='loading')queueMicrotask(initialize)", 'already-loaded initialization');
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
  has(engine, "galviengine_customer_intelligence_v0_5_3", 'rules version');
  has(engine, "clinical_followups_v0_5_3", 'question version');
  has(engine, "galvicare_day7d_customer_intelligence_v0_5_4", 'content version');
  has(engine, "day7d_progressive_customer_intelligence_v2", 'release contract');
  has(engine, "entrypoint:'worker/day7d-engine.js'", 'authoritative entrypoint');
  has(engine, 'progressive_followups:true', 'progressive follow-up capability');
  has(engine, 'dynamic_question_count:true', 'dynamic question capability');
  has(engine, 'approved_low_confidence_question_count:3', 'low-confidence question capability');
  has(engine, 'skip_does_not_inflate_confidence:true', 'skip safety capability');
  has(engine, 'evidence_version_cache:true', 'deterministic cache capability');
  has(engine, 'cumulative_clinic_brief:true', 'Clinic inheritance capability');
});
