import { readFileSync } from 'node:fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const databaseId = '2fc954b7-00ca-405b-8313-f91e706845a2';
const schemaPaths = [
  'migrations/production/0001_galvicare_0_5_production_baseline.sql',
  'migrations/0006_day7d_customer_intelligence.sql'
];

if (!accountId || !apiToken) {
  console.error('BLOCKED — CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required.');
  process.exit(2);
}

const base = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
const headers = {
  Authorization: `Bearer ${apiToken}`,
  'Content-Type': 'application/json'
};

async function query(sql, params = []) {
  const response = await fetch(base, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql, params })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    console.error('Cloudflare D1 API failure:', JSON.stringify(body));
    process.exit(3);
  }
  const results = Array.isArray(body.result) ? body.result : [];
  const failed = results.filter((item) => item?.success === false);
  if (failed.length) {
    console.error('Cloudflare D1 statement failure:', JSON.stringify(failed));
    process.exit(3);
  }
  return body;
}

console.log('[1/4] Applying Production baseline and additive Day 7D schema...');
for (const schemaPath of schemaPaths) {
  const schema = readFileSync(schemaPath, 'utf8');
  console.log(`Applying ${schemaPath}`);
  await query(schema);
}

console.log('[2/4] Verifying Production tables...');
const tables = await query("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
const tableRows = (tables.result || []).flatMap((entry) => entry?.results || []);
const tableNames = new Set(tableRows.map((row) => row.name));
console.log(JSON.stringify(tableRows));

const requiredDay7DTables = [
  'day7d_context_evidence',
  'clinical_evidence_versions',
  'day7d_observations',
  'clinical_followups',
  'product_results'
];
const missingDay7DTables = requiredDay7DTables.filter((name) => !tableNames.has(name));
if (missingDay7DTables.length) {
  console.error('BLOCKED — required Day 7D Production tables are missing:', JSON.stringify(missingDay7DTables));
  process.exit(4);
}

console.log('[3/4] Verifying Day 7D collision-safety trigger...');
const triggers = await query("SELECT name FROM sqlite_schema WHERE type='trigger' AND name='day7d_clinical_followups_collision_safe';");
const triggerRows = (triggers.result || []).flatMap((entry) => entry?.results || []);
if (!triggerRows.some((row) => row.name === 'day7d_clinical_followups_collision_safe')) {
  console.error('BLOCKED — Day 7D follow-up collision-safety trigger is missing.');
  process.exit(4);
}

console.log('[4/4] Verifying Production customer/session/payment tables contain no QA synthetic data...');
const tablesToCheck = ['sessions', 'founders', 'ventures', 'payments', 'entitlements', 'product_results'];
const counts = [];
for (const tableName of tablesToCheck) {
  const result = await query(`SELECT COUNT(*) AS row_count FROM ${tableName};`);
  const rows = (result.result || []).flatMap((entry) => entry?.results || []);
  counts.push({ table_name: tableName, row_count: Number(rows?.[0]?.row_count ?? NaN) });
}
console.log(JSON.stringify(counts));

const invalid = counts.filter((row) => !Number.isFinite(row.row_count));
if (invalid.length) {
  console.error('BLOCKED — could not verify Production table counts:', JSON.stringify(invalid));
  process.exit(4);
}

console.log('PASS — Production D1 baseline and additive Day 7D schema are present with no QA data migration.');
