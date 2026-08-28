import { access, readFile } from 'node:fs/promises';

const required = [
  'worker/day3.js',
  'worker/day3-entry.js',
  'migrations/day1/0001_canonical_business_medical_record.sql',
  'migrations/day1/0002_day2_identity_continuity.sql',
  'migrations/day1/0003_day3_evidence_versioning.sql',
  'wrangler.json',
  'wrangler.day2.json',
  'wrangler.day3.json',
  'scripts/day3-smoke.mjs',
  'scripts/verify-day3-evidence.mjs',
  'docs/GalviVault_P0_Day_3_Builder_Guide_CODEX_Implementation_Engineer_Edition_v1_0.md'
];
for (const path of required) await access(path);

const day1 = JSON.parse(await readFile('wrangler.json', 'utf8'));
const day2 = JSON.parse(await readFile('wrangler.day2.json', 'utf8'));
const day3 = JSON.parse(await readFile('wrangler.day3.json', 'utf8'));
const expectedDb = { binding: 'DB', database_name: 'galvivault-0-5-qa', database_id: 'cdf9042b-ab09-498a-ac66-010b6cce47d4', migrations_dir: 'migrations/day1' };

const assertConfig = (name, cfg, main, schema) => {
  if (cfg.name !== name) throw new Error(`Unexpected Worker name: ${cfg.name}; expected ${name}`);
  if (cfg.main !== main) throw new Error(`${name} must use ${main}`);
  if (cfg.vars?.ENVIRONMENT !== 'qa') throw new Error(`${name} must remain QA`);
  if (cfg.vars?.MIN_SCHEMA_VERSION !== schema) throw new Error(`${name} schema must be ${schema}`);
  const db = cfg.d1_databases?.find((entry) => entry.binding === 'DB');
  for (const [key, value] of Object.entries(expectedDb)) if (db?.[key] !== value) throw new Error(`${name} DB ${key} changed`);
};

// Cumulative Day 3 code still imports/extends Day 2 and shares the canonical QA D1,
// but historical Day 2/Day 3 deployment workflows are intentionally isolated so
// they can never overwrite the cumulative Day 5 runtime at galvivault-p0-day1-qa.
assertConfig('galvivault-p0-day1-qa', day1, 'worker/day1.js', '0001');
assertConfig('galvivault-p0-day2-qa-legacy', day2, 'worker/day2.js', '0002');
assertConfig('galvivault-p0-day3-qa-legacy', day3, 'worker/day3-entry.js', '0003');
if (day2.name === day1.name || day3.name === day1.name) throw new Error('Legacy Day 2/Day 3 deploy ownership must remain isolated from the cumulative QA Worker.');

const worker = await readFile('worker/day3.js', 'utf8');
for (const marker of ['/api/v1/evidence','evidence_accepted','evidence_superseded','gv1_import_row_receipts','processed_count','supersedes_evidence_id']) {
  if (!worker.includes(marker)) throw new Error(`Day 3 runtime marker missing: ${marker}`);
}

const entry = await readFile('worker/day3-entry.js', 'utf8');
for (const marker of ["import day2Worker from './day2.js'","import day3Worker from './day3.js'",'/api/v1/day3/readiness','GV_EVIDENCE_IMMUTABLE','immutableMutation','assessmentSupersede','return day2Worker.fetch(request, env, executionContext)']) {
  if (!entry.includes(marker)) throw new Error(`Day 3 cumulative entry marker missing: ${marker}`);
}

const migration = await readFile('migrations/day1/0003_day3_evidence_versioning.sql', 'utf8');
for (const marker of ['trg_gv1_accepted_evidence_no_update','gv1_import_row_receipts','triage.problem_clarity',"'0003'",'evidence_group_id','answer_group_id']) {
  if (!migration.includes(marker)) throw new Error(`Day 3 migration marker missing: ${marker}`);
}
if (migration.includes("('0002', 'day3_evidence_versioning_v1'")) throw new Error('Day 3 migration must not reuse Day 2 ledger ID 0002');

console.log(JSON.stringify({ success: true, gate: 'verify:day3:files', cumulative_worker_name: day1.name, legacy_day2_worker_name: day2.name, legacy_day3_worker_name: day3.name, day1_entry: day1.main, day2_entry: day2.main, day3_entry: day3.main, day3_schema: day3.vars.MIN_SCHEMA_VERSION, database_name: expectedDb.database_name }, null, 2));
