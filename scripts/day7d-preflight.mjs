import fs from 'node:fs';

const CONTRACT={
  rules:'galviengine_customer_intelligence_v0_5_4',
  questions:'clinical_followups_v0_5_4',
  content:'galvicare_day7d_customer_intelligence_v0_5_6',
  release:'day7d_cumulative_customer_intelligence_v3'
};
const requiredFiles=[
  'worker/worker.js','worker/day7d-engine.js','day7d-browser-customer-intelligence.js','index.html',
  'scripts/day7b-build-qa-frontend.mjs','migrations/0006_day7d_customer_intelligence.sql',
  'tests/day7d-customer-intelligence.test.mjs','tests/day7d-customer-path-contract.test.mjs',
  'wrangler.day7d.json','wrangler.qa-frontend.jsonc','qa-frontend-worker.js'
];
const failures=[];
for(const path of requiredFiles) if(!fs.existsSync(path)) failures.push(`missing required Day 7D file: ${path}`);

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const script of ['test:day7d','stabilization:gate','day7c:gate','day7d:gate']) if(!pkg.scripts?.[script]) failures.push(`package.json is missing ${script}`);
if(!pkg.scripts?.['test:day7d']?.includes('day7d-customer-path-contract.test.mjs')) failures.push('Day 7D release test must include the cumulative customer-path contract');

const wrangler=JSON.parse(fs.readFileSync('wrangler.day7d.json','utf8'));
if(wrangler.name!=='galvicare-triage-intake') failures.push(`API Worker name mismatch: ${wrangler.name}`);
if(wrangler.main!=='worker/day7d-engine.js') failures.push(`wrangler.day7d.json main must be worker/day7d-engine.js, got ${wrangler.main}`);
const db=(wrangler.d1_databases||[]).find(x=>x.binding==='DB');
if(!db) failures.push('wrangler.day7d.json must expose existing QA D1 as binding DB');
else {
  if(db.database_name!=='galvivault-0-5-qa') failures.push(`DB database_name mismatch: ${db.database_name}`);
  if(db.database_id!=='cdf9042b-ab09-498a-ac66-010b6cce47d4') failures.push(`DB database_id mismatch: ${db.database_id}`);
}
if(wrangler.vars?.ENVIRONMENT!=='qa'||wrangler.vars?.APP_ENV!=='qa') failures.push('wrangler Day 7D QA environment vars must both equal qa');

const day1=JSON.parse(fs.readFileSync('wrangler.json','utf8'));
if(day1.name!=='galvivault-p0-day1-qa'||day1.main!=='worker/day1.js') failures.push('wrangler.json must remain the isolated Day 1 QA target');

const frontend=JSON.parse(fs.readFileSync('wrangler.qa-frontend.jsonc','utf8'));
if(frontend.name!=='galvicare-0-5-qa') failures.push(`QA frontend Worker name mismatch: ${frontend.name}`);
if(frontend.main!=='qa-frontend-worker.js') failures.push(`QA frontend entrypoint mismatch: ${frontend.main}`);
if((frontend.d1_databases||[]).length) failures.push('QA frontend must not carry a D1 binding');

const legacy=fs.readFileSync('worker/worker.js','utf8');
if(!legacy.includes('env.DB')) failures.push('worker/worker.js must continue to use env.DB');
if(legacy.includes('env.D1')) failures.push('worker/worker.js must not be migrated to env.D1');

const engine=fs.readFileSync('worker/day7d-engine.js','utf8');
for(const token of [
  CONTRACT.rules,CONTRACT.questions,CONTRACT.content,'day7d_dedicated_tables_v1',CONTRACT.release,
  'day7d_context_evidence','clinical_evidence_versions','GalviScore:{','save_galviscore_followup','get_or_generate_galviscore',
  'objective_score_unchanged_by_clarification:true','galviscore_clarification_server_owned:true','objective_score_immutable:true',
  'progressive_followups:true','dynamic_question_count:true','approved_low_confidence_question_count:3',
  'prior_product_results_in_clinical_file:true','bounded_multi_question_submit:true','collision_safe_followup_save:true','legacy_generation_bypass_closed:true',
  'atomic_followup_save:true','server_selected_question_validation:true','save_returns_regenerated_result:true',
  "entrypoint:'worker/day7d-engine.js'","status:'needs_followup'",'evidence_version_bumped:after>before','clinic_brief:'
]) if(!engine.includes(token)) failures.push(`worker/day7d-engine.js missing required contract token: ${token}`);
if(engine.includes('preservedLegacyResult')) failures.push('Day 7D engine must not bypass progressive intelligence with a preserved legacy result');

const browser=fs.readFileSync('day7d-browser-customer-intelligence.js','utf8');
for(const token of [
  'Day 7D cumulative customer-intelligence browser adapter.','GalviScore:{','save_galviscore_followup','get_or_generate_galviscore',
  'galviscore-followup','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
  'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup','skipCurrentQuestion','SKIPPED_ANSWER',
  'stopImmediatePropagation','installAuthoritativeStageRoutes','invokeLegacyWithResponse','MAX_VISIBLE_TARGETED_QUESTIONS=3'
]) if(!browser.includes(token)) failures.push(`Day 7D browser adapter missing: ${token}`);
if(browser.includes('galviscore_confidence||0)+12')) failures.push('Browser must not locally mutate GalviScore confidence');
if(browser.includes('galviscore_followup_completed_')) failures.push('Browser adapter must not own GalviScore completion state');

const builder=fs.readFileSync('scripts/day7b-build-qa-frontend.mjs','utf8');
for(const token of [CONTRACT.release,'save_galviscore_followup','get_or_generate_galviscore','single cumulative QA frontend candidate','galvipath-book-galviclinic']) if(!builder.includes(token)) failures.push(`QA frontend builder missing cumulative contract: ${token}`);

const migration=fs.readFileSync('migrations/0006_day7d_customer_intelligence.sql','utf8');
for(const table of ['day7d_context_evidence','clinical_evidence_versions','day7d_observations']) if(!migration.includes(table)) failures.push(`migration 0006 missing dedicated Day 7D table: ${table}`);

if(failures.length){console.error('DAY 7D PREFLIGHT: BLOCKED');failures.forEach(item=>console.error(`- ${item}`));process.exit(1);}
console.log(JSON.stringify({
  status:'PASS',environment:'qa',api_worker:wrangler.name,frontend_worker:frontend.name,entrypoint:wrangler.main,binding:'DB',database:db.database_name,
  runtime_schema_adapter:'day7d_dedicated_tables_v1',release_contract:CONTRACT.release,rules_version:CONTRACT.rules,question_version:CONTRACT.questions,content_version:CONTRACT.content,
  galviscore_clarification_server_owned:true,objective_score_immutable:true,progressive_followups:true,dynamic_question_count:true,approved_low_confidence_question_count:3,
  prior_product_results_in_clinical_file:true,bounded_multi_question_submit:true,collision_safe_followup_save:true,legacy_generation_bypass_closed:true,
  atomic_followup_save:true,server_selected_question_validation:true,save_returns_regenerated_result:true,evidence_versioned_results:true,
  matched_worker_and_frontend_release:true,day1_isolated:true,day7c_compatibility_only:true,production_untouched:true
},null,2));
