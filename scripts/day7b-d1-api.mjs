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
  'Authorization': `Bearer ${apiToken}`,
  'Content-Type': 'application/json'
};

async function query(sql) {
  const response = await fetch(base, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql })
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
const countsSql = "SELECT 'sessions' AS table_name, COUNT(*) AS row_count FROM sessions UNION ALL SELECT 'founders', COUNT(*) FROM founders UNION ALL SELECT 'ventures', COUNT(*) FROM ventures UNION ALL SELECT 'payments', COUNT(*) FROM payments UNION ALL SELECT 'entitlements', COUNT(*) FROM entitlements UNION ALL SELECT 'product_results', COUNT(*) FROM product_results;";
const counts = await query(countsSql);
console.log(JSON.stringify(counts.result));
const rows = (counts.result || []).flatMap((entry) => entry?.results || []);
const dirty = rows.filter((row) => Number(row.row_count) !== 0);
if (dirty.length) {
  console.error('BLOCKED — unexpected Production customer/session/payment rows:', JSON.stringify(dirty));
  process.exit(4);
}

console.log('PASS — Production D1 schema initialized through REST API with no QA/customer seed data.');
