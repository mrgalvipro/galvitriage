const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const PROD_DB_ID = '2fc954b7-00ca-405b-8313-f91e706845a2';
const QA_DB_ID = 'cdf9042b-ab09-498a-ac66-010b6cce47d4';
const PROD_URL = 'https://galvicare-0-5-production.mrgalvipro.workers.dev';
const ORIGIN = 'https://www.galvipro.com';

if (!accountId || !apiToken) {
  console.error('BLOCKED — Cloudflare account/token secrets are required.');
  process.exit(2);
}

async function d1(databaseId, sql, params = []) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(`D1 API failure ${response.status}: ${JSON.stringify(body)}`);
  }
  const batches = Array.isArray(body.result) ? body.result : [];
  if (batches.some((item) => item?.success === false)) {
    throw new Error(`D1 statement failure: ${JSON.stringify(batches)}`);
  }
  return batches.flatMap((item) => item?.results || []);
}

async function workerPost(payload) {
  return fetch(`${PROD_URL}/api`, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

console.log('[1/5] Verify Production health fingerprint');
const healthResponse = await fetch(`${PROD_URL}/health`, { headers: { Origin: ORIGIN } });
if (!healthResponse.ok) throw new Error(`Production /health returned ${healthResponse.status}`);
const health = await healthResponse.json();
if (!(health?.success === true && health?.environment === 'production' && health?.galvivault === 'galvivault-0-5-production' && health?.runtime_marker === 'day7b-production-isolation-v1' && health?.day7a_runtime_marker === 'day7a-payment-products-v1' && health?.db_bound === true)) {
  throw new Error(`Unexpected Production health fingerprint: ${JSON.stringify(health)}`);
}
console.log('PASS — Production health fingerprint');

console.log('[2/5] Verify QA-only controls denied in Production');
const fixture = await workerPost({ action: 'get_fixture_result', product: 'GalviVitals' });
if (fixture.status !== 404) throw new Error(`get_fixture_result expected 404, got ${fixture.status}`);
const override = await workerPost({ action: 'grant_test_override' });
if (override.status !== 404) throw new Error(`grant_test_override expected 404, got ${override.status}`);
console.log('PASS — QA-only controls denied');

const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const qaSession = `gt_day7b_qa_${stamp}`;
const prodSession = `gt_day7b_prod_${stamp}`;
const now = new Date().toISOString();
const insertSql = "INSERT INTO sessions(session_id,current_stage,status,source,created_at,updated_at,last_seen_at) VALUES(?, 'Welcome', 'active', 'day7b-isolation-proof', ?, ?, ?);";
const countSql = 'SELECT COUNT(*) AS row_count FROM sessions WHERE session_id = ?;';

try {
  console.log('[3/5] Prove QA -> Production isolation');
  await d1(QA_DB_ID, insertSql, [qaSession, now, now, now]);
  const qaOwn = await d1(QA_DB_ID, countSql, [qaSession]);
  const qaInProd = await d1(PROD_DB_ID, countSql, [qaSession]);
  if (Number(qaOwn?.[0]?.row_count) !== 1 || Number(qaInProd?.[0]?.row_count) !== 0) {
    throw new Error(`QA->Production isolation failed: QA=${JSON.stringify(qaOwn)} PROD=${JSON.stringify(qaInProd)}`);
  }
  console.log('PASS — QA session present only in QA');

  console.log('[4/5] Prove Production -> QA isolation');
  await d1(PROD_DB_ID, insertSql, [prodSession, now, now, now]);
  const prodOwn = await d1(PROD_DB_ID, countSql, [prodSession]);
  const prodInQa = await d1(QA_DB_ID, countSql, [prodSession]);
  if (Number(prodOwn?.[0]?.row_count) !== 1 || Number(prodInQa?.[0]?.row_count) !== 0) {
    throw new Error(`Production->QA isolation failed: PROD=${JSON.stringify(prodOwn)} QA=${JSON.stringify(prodInQa)}`);
  }
  console.log('PASS — Production session present only in Production');
} finally {
  await d1(QA_DB_ID, 'DELETE FROM sessions WHERE session_id = ?;', [qaSession]).catch(() => {});
  await d1(PROD_DB_ID, 'DELETE FROM sessions WHERE session_id = ?;', [prodSession]).catch(() => {});
}

console.log('[5/5] PASS — Production security + reciprocal D1 isolation GREEN');
