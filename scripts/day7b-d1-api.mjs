import { readFileSync } from 'node:fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const databaseId = '2fc954b7-00ca-405b-8313-f91e706845a2';
const schemaPath = 'migrations/production/0001_galvicare_0_5_production_baseline.sql';

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

const schema = readFileSync(schemaPath, 'utf8');
console.log('[1/3] Applying Production schema through Cloudflare D1 REST API...');
await query(schema);

console.log('[2/3] Verifying Production tables...');
const tables = await query("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");
console.log(JSON.stringify(tables.result));

console.log('[3/3] Verifying Production customer/session/payment tables start empty...');
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

const dirty = counts.filter((row) => row.row_count !== 0);
if (dirty.length) {
  console.error('BLOCKED — unexpected Production customer/session/payment rows:', JSON.stringify(dirty));
  process.exit(4);
}

console.log('PASS — Production D1 schema initialized through REST API with no QA/customer seed data.');
