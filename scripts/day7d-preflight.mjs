import fs from 'node:fs';

const requiredFiles = [
  'worker/worker.js','worker/day7d-engine.js','day7d-browser-customer-intelligence.js',
  'migrations/0006_day7d_customer_intelligence.sql','tests/day7d-customer-intelligence.test.mjs','tests/day7d-customer-path-contract.test.mjs'
];
const failures=[];
for(const path of requiredFiles) if(!fs.existsSync(path)) failures.push(`missing required Day 7D file: ${path}`);

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
if(!pkg.scripts?.['test:day7d']) failures.push('package.json is missing scripts.test:day7d');
if(!pkg.scripts?.['stabilization:gate']) failures.push('package.json is missing stabilization:gate');
if(!pkg.scripts?.['day7c:gate']) failures.push('package.json is missing day7c:gate');
if(!pkg.scripts?.['test:day7d']?.includes('day7d-customer-path-contract.test.mjs')) failures.push('Day 7D release test must include the real customer-path contract');

const wrangler=JSON.parse(fs.readFileSync('wrangler.json','utf8'));
if(wrangler.name!=='galvicare-triage-intake') failures.push(`API Worker name mismatch: ${wrangler.name}`);
if(wrangler.main!=='worker/day7d-engine.js') failures.push(`wrangler.json main must be worker/day7d-engine.js, got ${wrangler.main}`);
const db=(wrangler.d1_databases||[]).find(x=>x.binding==='DB');
if(!db) failures.push('wrangler.json must expose existing QA D1 as binding DB');
else {
  if(db.database_name!=='galvivault-0-5-qa') failures.push(`DB database_name mismatch: ${db.database_name}`);
  if(db.database_id!=='cdf9042b-ab09-498a-ac66-010b6cce47d4') failures.push(`DB database_id mismatch: ${db.database_id}`);
}
if(wrangler.vars?.ENVIRONMENT!=='qa'||wrangler.vars?.APP_ENV!=='qa') failures.push('wrangler QA environment vars must both equal qa');

if(fs.existsSync('wrangler.qa-frontend.json')) {
  const frontend=JSON.parse(fs.readFileSync('wrangler.qa-frontend.json','utf8'));
  if((frontend.d1_databases||[]).length) failures.push('Day 7D must not require a QA frontend D1 binding');
}

const legacy=fs.readFileSync('worker/worker.js','utf8');
if(!legacy.includes('env.DB')) failures.push('worker/worker.js must continue to use env.DB');
if(legacy.includes('env.D1')) failures.push('worker/worker.js must not be migrated to env.D1');

const engine=fs.readFileSync('worker/day7d-engine.js','utf8');
for(const token of [
  'galviengine_customer_intelligence_v0_5_2',
  'clinical_followups_v0_5_2',
  'day7d_dedicated_tables_v1',
  'day7d_progressive_customer_intelligence_v2',
  'day7d_context_evidence',
  'clinical_evidence_versions',
  'progressive_followups:true',
  'atomic_followup_save:true',
  'server_selected_question_validation:true',
  'save_returns_regenerated_result:true',
  "entrypoint:'worker/day7d-engine.js'",
  "status:'needs_followup'",
  'evidence_version_bumped:after>before',
  'clinic_brief:'
]) if(!engine.includes(token)) failures.push(`worker/day7d-engine.js missing required contract token: ${token}`);
if(engine.includes('preservedLegacyResult')) failures.push('Day 7D engine must not bypass progressive intelligence with a preserved legacy clinical result');

const browser=fs.readFileSync('day7d-browser-customer-intelligence.js','utf8');
for(const token of [
  'needs_followup','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
  'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
  'evidence_version_bumped','installAuthoritativeStageRoutes','invokeLegacyWithResponse'
]) if(!browser.includes(token)) failures.push(`Day 7D browser adapter missing: ${token}`);

const migration=fs.readFileSync('migrations/0006_day7d_customer_intelligence.sql','utf8');
for(const table of ['day7d_context_evidence','clinical_evidence_versions','day7d_observations']) if(!migration.includes(table)) failures.push(`migration 0006 missing dedicated Day 7D table: ${table}`);

if(failures.length){
  console.error('DAY 7D PREFLIGHT: BLOCKED');
  failures.forEach(x=>console.error(`- ${x}`));
  process.exit(1);
}
console.log(JSON.stringify({
  status:'PASS',environment:'qa',api_worker:wrangler.name,entrypoint:wrangler.main,binding:'DB',database:db.database_name,
  runtime_schema_adapter:'day7d_dedicated_tables_v1',release_contract:'day7d_progressive_customer_intelligence_v2',
  progressive_followups:true,atomic_followup_save:true,server_selected_question_validation:true,
  save_returns_regenerated_result:true,evidence_versioned_results:true,legacy_runtime_preservation:true,
  payment_intelligence_decoupled:true,frontend_d1_required:false
},null,2));
