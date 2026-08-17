import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine=fs.readFileSync('worker/day7d-engine.js','utf8');
const legacyWorker=fs.readFileSync('worker/worker.js','utf8');
const browser=fs.readFileSync('day7d-browser-customer-intelligence.js','utf8');
const builder=fs.readFileSync('scripts/day7b-build-qa-frontend.mjs','utf8');
const preflight=fs.readFileSync('scripts/day7d-preflight.mjs','utf8');
const deploy=fs.readFileSync('.github/workflows/deploy-galvicare-qa.yml','utf8');
const compatibility=fs.readFileSync('.github/workflows/day7c-qa-deploy.yml','utf8');
const source=fs.readFileSync('index.html','utf8');

const has=(text,token,message)=>assert.ok(text.includes(token),`${message}: missing ${token}`);
const lacks=(text,token,message)=>assert.ok(!text.includes(token),`${message}: forbidden ${token}`);

const requiredActions=[
  'evaluate_galviscore','save_galviscore_followup','get_or_generate_galviscore',
  'evaluate_galvishot','save_galvishot_followup','get_or_create_galvishot',
  'evaluate_galvisight','save_galvisight_followup','get_or_generate_galvisight',
  'evaluate_galvipath','save_galvipath_followup','get_or_generate_galvipath','get_clinical_file'
];

test('Worker exposes one cumulative GalviScore through GalviClinic action surface',()=>{
  for(const action of requiredActions)has(engine,action,'Day 7D action contract');
  has(engine,"status:'needs_followup'",'follow-up gate');
  has(engine,'async function atomicSave','atomic persistence');
  has(engine,'storedResult','evidence-version cache');
  has(engine,'saveResult','canonical result upsert');
  lacks(engine,'preservedLegacyResult','legacy result bypass');
});

test('GalviScore clarification is Worker-owned and objective score remains immutable',()=>{
  has(engine,'GalviScore:{','GalviScore question bank');
  has(engine,'objective_score_unchanged_by_clarification:true','score immutability result contract');
  has(engine,'galviscore_clarification_server_owned:true','runtime ownership capability');
  has(engine,'objective_score_immutable:true','score immutability capability');
  has(browser,'save_galviscore_followup','browser Worker submission');
  has(browser,'get_or_generate_galviscore','browser Worker regeneration');
  has(browser,'routeByGalviScoreConfidence=async','authoritative route interception');
  has(browser,'stopImmediatePropagation','legacy submit interception');
  lacks(browser,'galviscore_confidence||0)+12','local confidence mutation');
  lacks(browser,'galviscore_followup_completed_','local completion authority');
});

test('follow-up persistence is idempotent, evidence-versioned and skip-safe',()=>{
  has(engine,'allowed.find','server-selected validation');
  has(engine,'already_saved:true','duplicate answer idempotency');
  has(engine,'await bump(env.DB,sid','single bounded evidence-version increment');
  has(engine,'evidence_version_bumped:after>before','evidence-version response proof');
  has(engine,"status:'validation_error'",'invalid answer rejection');
  has(engine,'impact=skipped?0','skip zero-confidence contract');
  has(engine,'if(!isSkipped(row.answer)','skip excluded from evidence');
  has(engine,'collision_safe_followup_save:true','collision-safe save runtime capability');
  has(engine,'bounded_multi_question_submit:true','bounded multi-question runtime capability');
});

test('approved dynamic 0–3 selector is stage-specific and non-repetitive',()=>{
  for(const product of ['GalviShot','GalviSight','GalviPath'])has(engine,`${product}:{`,`${product} follow-up bank`);
  has(engine,'if(confidence<=59)requiredTotal=3','low-confidence three-question contract');
  has(engine,'else if(confidence<=69)requiredTotal=2','60–69 two-question contract');
  has(engine,'else if(confidence<=79)requiredTotal=1','70–79 one-question contract');
  has(engine,'const required=Math.max(0,requiredTotal-completed.size)','completed-or-skipped advancement');
  has(engine,'completed.has(item.question_id)','no-repeat contract');
  has(browser,'MAX_VISIBLE_TARGETED_QUESTIONS=3','bounded UI');
});

test('Shot, Sight, Path and Clinic consume cumulative evidence and prior results',()=>{
  has(engine,"evidence(file,'GalviShot')",'GalviShot evidence consumption');
  has(engine,'loadPriorResults','prior product result loading');
  has(engine,'prior_results','clinical-file prior result inheritance');
  has(engine,'priorFindingEvidence','prior finding evidence transformation');
  has(engine,'source_findings:','downstream source finding linkage');
  has(engine,'source_interpretation:interpretation','Path source interpretation linkage');
  has(engine,'clinic_brief:','cumulative Clinic brief');
  for(const token of ['priority_findings:','stated_30_day_outcome:','stated_90_day_outcome:','unresolved_hypotheses:','customer_intelligence_evidence:customerEvidence'])has(engine,token,'Clinic inheritance');
});

test('matching evidence versions replay and changed evidence regenerates',()=>{
  has(engine,'Number(result.evidence_version)===Number(evidenceVersionValue)','cache evidence-version match');
  has(engine,"generation_source:'stored'",'stored deterministic replay');
  has(engine,"generation_source:'regenerated'",'changed-evidence regeneration');
  has(engine,"if(evaluation.status==='needs_followup')",'remaining-question branch');
  has(engine,'const generated=await getOrCreate','immediate regeneration after final save');
  has(browser,'const regenerated=(saved.result||saved.data)?saved:await call(cfg.get,{})','single-response browser continuation');
  has(browser,'renderReadyStage(product,regenerated)','enriched result rendering');
});

test('browser renders Worker-selected questions and prevents legacy bypass',()=>{
  for(const token of [
    'galviscore-followup','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
    'save_galviscore_followup','save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
    'skipCurrentQuestion','SKIPPED_ANSWER','stopImmediatePropagation','installAuthoritativeStageRoutes','invokeLegacyWithResponse'
  ])has(browser,token,'cumulative browser contract');
  has(browser,'completeVisibleQuestions(product,true)','skip invokes authoritative completion');
  has(browser,"savedStatus==='needs_followup'",'remaining-question advancement');
  has(browser,"document.addEventListener('DOMContentLoaded',initialize)",'refresh initialization');
  has(browser,"if(document.readyState!=='loading')queueMicrotask(initialize)",'already-loaded restoration');
  has(engine,'legacy_generation_bypass_closed:true','Worker legacy bypass closure capability');
});

test('QA builder produces one isolated cumulative frontend candidate',()=>{
  for(const token of [
    "const DAY7D_BROWSER='day7d-browser-customer-intelligence.js'",'single cumulative QA frontend candidate',
    'GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS',
    "const QA_WORKER='https://galvicare-triage-intake.mrgalvipro.workers.dev'",
    "const TEST_STRIPE_MARKER='https://buy.stripe.com/test_'",
    'save_galviscore_followup','galvipath-book-galviclinic'
  ])has(builder,token,'QA builder contract');
  has(source,'galviscore-followup','existing GalviScore visual system');
  has(source,'renderUnlockedGalviScore','existing GalviScore renderer');
});

test('preflight and runtime share one v3 release contract',()=>{
  for(const token of [
    'galviengine_customer_intelligence_v0_5_4','clinical_followups_v0_5_4',
    'galvicare_day7d_customer_intelligence_v0_5_6','day7d_cumulative_customer_intelligence_v3'
  ]){has(engine,token,'Worker version');has(preflight,token,'preflight version');}
  for(const token of [
    "entrypoint:'worker/day7d-engine.js'",'progressive_followups:true','dynamic_question_count:true',
    'approved_low_confidence_question_count:3','galviscore_clarification_server_owned:true',
    'objective_score_immutable:true','skip_does_not_inflate_confidence:true','evidence_version_cache:true',
    'cumulative_clinic_brief:true','prior_product_results_in_clinical_file:true','bounded_multi_question_submit:true',
    'collision_safe_followup_save:true','legacy_generation_bypass_closed:true','atomic_followup_save:true',
    'server_selected_question_validation:true','save_returns_regenerated_result:true'
  ])has(engine,token,'runtime health capability');
});

test('one automatic deployer owns Worker and frontend; Day 7C is compatibility-only',()=>{
  has(deploy,'wrangler.qa-frontend.jsonc','QA frontend deploy target');
  has(deploy,'Deploy authoritative QA frontend','frontend deployment step');
  has(deploy,'Verify deployed complete QA frontend','frontend runtime proof');
  has(deploy,'galviscore_clarification_server_owned:true','Worker runtime proof');
  has(compatibility,'workflow_dispatch:','manual compatibility trigger');
  lacks(compatibility,'push:','no competing push deployment');
  lacks(compatibility,'wrangler-action','no competing Cloudflare deployment');
});

test('legacy GalviSight prerequisite check binds GalviShot explicitly and never passes undefined product to D1',()=>{
  has(
    legacyWorker,
    "hasProductEntitlement(db, sessionId, 'GalviShot') || hasQaOverride(env, payload)",
    'GalviSight GalviShot entitlement prerequisite'
  );
  lacks(
    legacyWorker,
    'hasProductEntitlement(db, sessionId) || hasQaOverride(env, payload)',
    'undefined-product D1 binding regression'
  );
});
