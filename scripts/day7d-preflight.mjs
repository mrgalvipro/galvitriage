import fs from 'node:fs';

const requiredFiles = [
  'worker/day7d-engine.js',
  'migrations/0006_day7d_customer_intelligence.sql',
  'tests/day7d-customer-intelligence.test.mjs'
];

const failures = [];
for (const path of requiredFiles) {
  if (!fs.existsSync(path)) failures.push(`missing required Day 7D file: ${path}`);
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts?.['test:day7d']) failures.push('package.json is missing scripts.test:day7d');

const wrangler = JSON.parse(fs.readFileSync('wrangler.json', 'utf8'));
const db = (wrangler.d1_databases || []).find((entry) => entry.binding === 'DB');
if (!db) failures.push('wrangler.json must expose QA D1 as binding DB');
else {
  if (db.database_name !== 'galvivault-0-5-qa') failures.push(`DB database_name must be galvivault-0-5-qa, got ${db.database_name}`);
  if (db.database_id !== 'cdf9042b-ab09-498a-ac66-010b6cce47d4') failures.push(`DB database_id mismatch: ${db.database_id}`);
}
if (wrangler.vars?.ENVIRONMENT !== 'qa' || wrangler.vars?.APP_ENV !== 'qa') failures.push('wrangler QA environment vars must both equal qa');

const worker = fs.readFileSync('worker/worker.js', 'utf8');
if (!worker.includes('env.DB')) failures.push('worker/worker.js must continue to use env.DB');
if (worker.includes('env.D1')) failures.push('worker/worker.js must not be migrated to env.D1');

if (failures.length) {
  console.error('DAY 7D PREFLIGHT: BLOCKED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'PASS',
  environment: 'qa',
  binding: 'DB',
  database: db.database_name,
  database_id: db.database_id,
  required_files: requiredFiles,
  test_script: pkg.scripts['test:day7d']
}, null, 2));
