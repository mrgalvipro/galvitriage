import { access, readFile } from 'node:fs/promises';

const required = [
  'worker/day3.js',
  'migrations/day1/0002_day3_evidence_versioning.sql',
  'wrangler.json',
  'package.json',
  'docs/GalviVault_P0_Day_3_Builder_Guide_CODEX_Implementation_Engineer_Edition_v1_0.md'
];

for (const path of required) await access(path);

const wrangler = JSON.parse(await readFile('wrangler.json', 'utf8'));
if (wrangler.main !== 'worker/day3.js') throw new Error('wrangler.json must use worker/day3.js');
if (wrangler.vars?.ENVIRONMENT !== 'qa') throw new Error('ENVIRONMENT must remain qa');
if (wrangler.vars?.MIN_SCHEMA_VERSION !== '0002') throw new Error('MIN_SCHEMA_VERSION must be 0002');
const binding = wrangler.d1_databases?.find((entry) => entry.binding === 'DB');
if (!binding) throw new Error('DB binding is missing');
if (binding.database_name !== 'galvivault-0-5-qa') throw new Error('DB must remain bound to galvivault-0-5-qa');
if (binding.database_id !== 'cdf9042b-ab09-498a-ac66-010b6cce47d4') throw new Error('QA D1 database_id changed');
if (binding.migrations_dir !== 'migrations/day1') throw new Error('migrations_dir must include 0001 and 0002');

const worker = await readFile('worker/day3.js', 'utf8');
for (const marker of [
  '/api/v1/evidence',
  'evidence_accepted',
  'evidence_superseded',
  'GV_EVIDENCE_IMMUTABLE',
  'gv1_import_row_receipts',
  'processed_count',
  'supersedes_evidence_id'
]) {
  if (!worker.includes(marker)) throw new Error(`Day 3 runtime marker missing: ${marker}`);
}

const migration = await readFile('migrations/day1/0002_day3_evidence_versioning.sql', 'utf8');
for (const marker of [
  'trg_gv1_accepted_evidence_no_update',
  'gv1_import_row_receipts',
  'triage.problem_clarity',
  "'0002'",
  'evidence_group_id',
  'answer_group_id'
]) {
  if (!migration.includes(marker)) throw new Error(`Day 3 migration marker missing: ${marker}`);
}

console.log(JSON.stringify({
  success: true,
  gate: 'verify:day3:files',
  required_files: required,
  worker_entry: wrangler.main,
  schema: wrangler.vars.MIN_SCHEMA_VERSION,
  database_name: binding.database_name
}, null, 2));
