import { access, readFile } from 'node:fs/promises';

const required = [
  'worker/day3.js',
  'migrations/day1/0001_canonical_business_medical_record.sql',
  'migrations/day1/0002_day2_identity_continuity.sql',
  'migrations/day1/0003_day3_evidence_versioning.sql',
  'wrangler.json',
  'wrangler.day2.json',
  'wrangler.day3.json',
  'docs/GalviVault_P0_Day_3_Builder_Guide_CODEX_Implementation_Engineer_Edition_v1_0.md'
];

for (const path of required) await access(path);

const day1 = JSON.parse(await readFile('wrangler.json', 'utf8'));
const day2 = JSON.parse(await readFile('wrangler.day2.json', 'utf8'));
const day3 = JSON.parse(await readFile('wrangler.day3.json', 'utf8'));

const expectedDb = {
  binding: 'DB',
  database_name: 'galvivault-0-5-qa',
  database_id: 'cdf9042b-ab09-498a-ac66-010b6cce47d4',
  migrations_dir: 'migrations/day1'
};

const assertConfig = (name, cfg, main, schema) => {
  if (cfg.name !== name) throw new Error(`Unexpected Worker name: ${cfg.name}`);
  if (cfg.main !== main) throw new Error(`${name} must use ${main}`);
  if (cfg.vars?.ENVIRONMENT !== 'qa') throw new Error(`${name} must remain QA`);
  if (cfg.vars?.MIN_SCHEMA_VERSION !== schema) throw new Error(`${name} schema must be ${schema}`);
  const db = cfg.d1_databases?.find((entry) => entry.binding === 'DB');
  for (const [key, value] of Object.entries(expectedDb)) {
    if (db?.[key] !== value) throw new Error(`${name} DB ${key} changed`);
  }
};

assertConfig('galvivault-p0-day1-qa', day1, 'worker/day1.js', '0001');
assertConfig('galvivault-p0-day1-qa', day2, 'worker/day2.js', '0002');
assertConfig('galvivault-p0-day3-qa', day3, 'worker/day3.js', '0003');

const worker = await readFile('worker/day3.js', 'utf8');
for (const marker of [
  '/api/v1/evidence',
  'evidence_accepted',
  'evidence_superseded',
  'GV_EVIDENCE_IMMUTABLE',
  'gv1_import_row_receipts',
  'processed_count',
  'supersedes_evidence_id',
  "return day1Worker.fetch(request, env, ctx)"
]) {
  if (!worker.includes(marker)) throw new Error(`Day 3 runtime marker missing: ${marker}`);
}

const migration = await readFile('migrations/day1/0003_day3_evidence_versioning.sql', 'utf8');
for (const marker of [
  'trg_gv1_accepted_evidence_no_update',
  'gv1_import_row_receipts',
  'triage.problem_clarity',
  "'0003'",
  'evidence_group_id',
  'answer_group_id'
]) {
  if (!migration.includes(marker)) throw new Error(`Day 3 migration marker missing: ${marker}`);
}
if (migration.includes("('0002', 'day3_evidence_versioning_v1'")) throw new Error('Day 3 migration must not reuse Day 2 ledger ID 0002');

console.log(JSON.stringify({
  success: true,
  gate: 'verify:day3:files',
  day1_entry: day1.main,
  day2_entry: day2.main,
  day3_entry: day3.main,
  day3_schema: day3.vars.MIN_SCHEMA_VERSION,
  database_name: expectedDb.database_name
}, null, 2));
