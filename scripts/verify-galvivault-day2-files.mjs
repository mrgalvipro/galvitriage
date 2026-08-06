import fs from 'node:fs';
import path from 'node:path';

const required = [
  'package.json',
  'wrangler.json',
  'wrangler.day2.json',
  'worker/day1.js',
  'worker/day2.js',
  'migrations/day1/0001_canonical_business_medical_record.sql',
  'migrations/day1/0002_day2_identity_continuity.sql',
  'tests/day1-foundation.test.mjs',
  'tests/galvivault-day2-identity-continuity.test.mjs',
  'scripts/galvivault-day2-e2e.mjs',
  '.github/workflows/day2-qa-identity-continuity.yml'
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error(`Missing required GalviVault Day 2 files:\n${missing.join('\n')}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const script of [
  'test:day1',
  'test:galvivault:day2',
  'test:galvivault:day2:regression',
  'verify:galvivault:day2',
  'smoke:galvivault:day2:qa',
  'deploy:galvivault:day2:qa'
]) {
  if (!pkg.scripts?.[script]) {
    console.error(`Missing package script: ${script}`);
    process.exit(1);
  }
}

const day1 = JSON.parse(fs.readFileSync('wrangler.json', 'utf8'));
const day2 = JSON.parse(fs.readFileSync('wrangler.day2.json', 'utf8'));
const production = fs.readFileSync('wrangler.production.jsonc', 'utf8');

if (day1.main !== 'worker/day1.js') throw new Error('wrangler.json no longer preserves worker/day1.js.');
if (day2.main !== 'worker/day2.js') throw new Error('wrangler.day2.json must target worker/day2.js.');
if (day2.name !== day1.name) throw new Error('Day 2 must extend the isolated GalviVault QA Worker.');
if (day2.vars?.ENVIRONMENT !== 'qa') throw new Error('Day 2 environment must be qa.');
if (day2.vars?.MIN_SCHEMA_VERSION !== '0002') throw new Error('Day 2 minimum schema must be 0002.');
const db = day2.d1_databases?.find((item) => item.binding === 'DB');
if (db?.database_name !== 'galvivault-0-5-qa') throw new Error('Day 2 must target the QA D1.');
if (db?.migrations_dir !== 'migrations/day1') throw new Error('Day 2 must preserve the migration directory.');
if (!production.includes('worker/production-entry.js')) throw new Error('Production entry is not preserved.');
if (production.includes('worker/day2.js')) throw new Error('Production configuration references worker/day2.js.');
if (production.includes('galvivault-0-5-qa')) throw new Error('Production configuration references the QA D1.');

for (const alias of [
  'worker/worker_day2.js.txt',
  'migrations/day1/migrations_day1_0002_day2_identity_continuity.sql.txt',
  'tests/tests_galvivault-day2-identity-continuity.test.mjs.txt',
  'scripts/scripts_galvivault-day2-e2e.mjs.txt',
  'scripts/scripts_verify-galvivault-day2-files.mjs.txt',
  'wrangler.day2.json.txt',
  'package.json.txt'
]) {
  if (fs.existsSync(alias)) throw new Error(`Temporary Day 2 alias remains: ${alias}`);
}

console.log('PASS: canonical Day 2 files, scripts, QA Worker/D1 authority, Production isolation, and the immutable QA workflow are valid.');
