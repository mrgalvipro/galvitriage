import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine=fs.readFileSync('worker/day7d-engine.js','utf8');
const criticalPath=fs.readFileSync('worker/day7d-day3-critical-path.js','utf8');
const unified=fs.readFileSync('worker/day3-unified-customer-api.js','utf8');
const day3Config=fs.readFileSync('wrangler.galvicare-day3.json','utf8');
const legacyWorker=fs.readFileSync('worker/worker.js','utf8');
const browser=fs.readFileSync('day7d-browser-customer-intelligence.js','utf8');
const builder=fs.readFileSync('scripts/day7b-build-qa-frontend.mjs','utf8');
const preflight=fs.readFileSync('scripts/day7d-preflight.mjs','utf8');
const deploy=fs.readFileSync('.github/workflows/deploy-galvicare-qa.yml','utf8');
const cumulativeFrontend=fs.readFileSync('.github/workflows/deploy-qa-frontend.yml','utf8');
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
  has(browser,"installRoute('routeByGalviScoreConfidence','GalviScore')",'authoritative route interception');
  has(browser,'stopImmediatePropagation','legacy submit interception');
  lacks(browser,'galviscore_confidence||0)+12','local confidence mutation');
  lacks(browser,'galviscore_followup_completed_','local completion authority');
});

test('paid GalviScore return restores the authoritative clarification before rendering result',()=>{
  has(browser,'resumeGalviScoreAfterVerifiedPayment','paid-return authoritative resume');
  has(browser,'installPaidScoreReturnRoute','paid-return route override');
  has(browser,"if(status==='needs_followup')",'paid-return clarification branch');
  has(browser,"exposeFollowupStage('GalviScore',response)",'paid-return clarification render');
  has(browser,"host.style.display='block'",'follow-up display restoration');
  has(browser,'clearGalviCareReturnPending','paid-return hidden-state release');
  has(browser,'PAID_SCORE_ENTITLEMENT_RETRIES=6','bounded entitlement convergence retries');
  has(browser,'DAY7D_REQUEST_TIMEOUT_MS=12000','bounded canonical evidence request');
  has(browser,'hydrationFlight','duplicate hydration suppression');
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

test('observation and product-result generation are collision-safe under overlapping requests',()=>{
  has(engine,'ON CONFLICT(session_id,observation_code) DO UPDATE','atomic observation upsert');
  has(engine,'ON CONFLICT(session_id,product) DO UPDATE','atomic product-result upsert');
  has(engine,'collision_safe_observation_upsert:true','runtime observation collision capability');
  has(engine,'collision_safe_result_upsert:true','runtime product result collision capability');
  lacks(engine,"SELECT observation_id FROM day7d_observations WHERE session_id=? AND observation_code=?",'observation select-then-insert race');
  lacks(engine,"SELECT result_id FROM product_results WHERE session_id=? AND product=? LIMIT 1",'result select-then-insert race');
});

test('Day 3 requires customer context questions before every downstream paid result',()=>{
  for(const product of ['GalviShot','GalviSight','GalviPath'])has(engine,`${product}:{`,`${product} follow-up bank`);
  has(criticalPath,'const DOWNSTREAM_REQUIRED_QUESTION_COUNT = 3','three-question evidence-intake contract');
  has(criticalPath,'confidence: Math.min(59','confidence cannot eliminate downstream evidence intake');
  has(criticalPath,'downstream_questions_always_collect_customer_context: true','runtime customer-context capability');
  has(criticalPath,"if (evaluation.status === 'needs_followup')",'paid generation cannot bypass outstanding questions');
  has(criticalPath,'required_customer_context_submission','versioned required-context persistence');
  has(engine,'completed.has(item.question_id)','no-repeat contract');
  has(browser,'MAX_VISIBLE_TARGETED_QUESTIONS=3','bounded three-question UI');
});

test('QA customer evidence is bound to the existing governed Day 3 Worker',()=>{
  has(browser,'https://galvivault-p0-day1-qa.mrgalvipro.workers.dev/api','governed QA customer-evidence endpoint');
  has(browser,"host==='galvicare-0-5-qa.mrgalvipro.workers.dev'",'QA-only browser endpoint switch');
  has(unified,"import governedDay3 from './day3-customer-session.js'",'governed Day 3 composition');
  has(unified,"import customerEvidenceApi from './day7d-day3-critical-path.js'",'customer evidence composition');
  has(unified,"if (path === '/api'",'unified customer evidence route');
  has(day3Config,'worker/day3-unified-customer-api.js','existing governed Worker entrypoint');
  has(day3Config,'galvivault-p0-day1-qa','existing governed Worker name');
  has(day3Config,'galvivault-0-5-qa','existing QA D1 binding');
});

test('authoritative browser customer-intelligence calls bypass mutable legacy API wrappers',()=>{
  has(browser,'response=await fetch(endpoint()','direct canonical Worker fetch');
  has(browser,'CLIENT_ACTION_ALIASES','browser action canonicalization');
  has(browser,'NON_JSON_API_RESPONSE','structured browser API error');
  has(browser,'callAuthoritativeApi:call','debuggable authoritative client surface');
  lacks(browser,"if(typeof callGalviCareApi==='function')return callGalviCareApi",'mutable legacy API delegation');
  has(criticalPath,'const ACTION_ALIASES = new Map','Worker action alias normalization');
  for(const alias of ['get_or_generate_galvishot','get_galvishot','generate_galvishot','get_or_create_galvisight','get_or_create_galvipath'])has(criticalPath,alias,'known action alias');
  has(criticalPath,'browser_api_alias_normalization: true','runtime API normalization capability');
});

test('browser reasserts authoritative stage routes and hydrates visible question surfaces',()=>{
  has(browser,'wrapper.__day7dAuthoritative=true','authoritative route ownership marker');
  has(browser,"window.addEventListener(event,()=>initialize(true))",'payment-return/navigation route restoration');
  has(browser,'new MutationObserver','late legacy renderer replacement detection');
  has(browser,'stageShouldHydrate','visible-stage hydration');
  has(browser,"if(responseStatus(response)==='needs_followup')return exposeFollowupStage(product,response)",'server question restoration');
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
  has(browser,"document.addEventListener('DOMContentLoaded'",'refresh initialization');
  has(browser,"if(document.readyState!=='loading')queueMicrotask",'already-loaded restoration');
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
    'collision_safe_followup_save:true','collision_safe_observation_upsert:true','collision_safe_result_upsert:true',
    'legacy_generation_bypass_closed:true','atomic_followup_save:true','server_selected_question_validation:true','save_returns_regenerated_result:true'
  ])has(engine,token,'runtime health capability');
});

test('cumulative Day 5 frontend owns automatic QA deployment; legacy Day 7D and Day 7C are manual compatibility validators',()=>{
  has(deploy,'workflow_dispatch:','legacy Day7D manual trigger');
  lacks(deploy,'push:','legacy Day7D has no competing automatic push deployment');
  has(cumulativeFrontend,'wrangler.qa-frontend.jsonc','cumulative QA frontend deploy target');
  has(cumulativeFrontend,'Deploy existing dedicated QA frontend Worker','cumulative frontend deployment step');
  has(cumulativeFrontend,'Verify QA frontend runtime convergence','cumulative frontend runtime proof step');
  has(cumulativeFrontend,'day7d-browser-customer-intelligence.js','authoritative browser source is watched by deployment trigger');
  has(cumulativeFrontend,'tests/day7d-customer-path-contract.test.mjs','paid-return regression test is watched by deployment trigger');
  has(compatibility,'workflow_dispatch:','manual Day7C compatibility trigger');
  lacks(compatibility,'push:','no competing Day7C push deployment');
  lacks(compatibility,'wrangler-action','no competing Day7C Cloudflare deployment');
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
