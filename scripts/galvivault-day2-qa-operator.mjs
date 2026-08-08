import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BRANCH = 'qa-revamped-galvicare-0-5';
const SOURCE_GUARD_SHA = 'ae41b41892de2e9b88b4e81d5e521c535719bb15';
const DAY1_ROLLBACK_SHA = '63bcb2a2f0a6829915a30c6c4a78106f96cedf7a';
const WORKER = 'galvivault-p0-day1-qa';
const DB = 'galvivault-0-5-qa';
const ORIGIN = process.env.DAY2_ALLOWED_ORIGIN || 'https://galvipro.com';
const STAMP = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const FINAL = path.join('release-evidence', 'day2', `manual-${STAMP}`);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'galvivault-day2-'));
const OUT = path.join(TMP, 'evidence');
fs.mkdirSync(OUT, { recursive: true });

function die(message) { throw new Error(message); }
function run(command, args = [], options = {}) {
  const isWindowsScript = process.platform === 'win32' && /\.(cmd|bat)$/i.test(command);
  const executable = isWindowsScript ? (process.env.ComSpec || 'cmd.exe') : command;
  const executableArgs = isWindowsScript ? ['/d', '/s', '/c', command, ...args] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: process.cwd(),
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe']
  });
  if (result.error) throw result.error;
  const text = `${result.stdout || ''}${result.stderr || ''}`;
  if (options.file) fs.writeFileSync(options.file, text);
  if (result.status !== 0) die(`${command} ${args.join(' ')} failed (${result.status}).\n${text}`);
  return result.stdout || '';
}
async function retry(label, fn) {
  let last;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try { return await fn(); } catch (error) {
      last = error;
      if (attempt === 4) break;
      console.warn(`${label} attempt ${attempt} failed; retrying.`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
    }
  }
  throw last;
}
function git(...args) { return run('git', args).trim(); }
function wrangler(args, file) { return run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', 'wrangler@4', ...args], file ? { file } : {}); }
function objects(value, output = []) {
  if (Array.isArray(value)) value.forEach((item) => objects(item, output));
  else if (value && typeof value === 'object') { output.push(value); Object.values(value).forEach((item) => objects(item, output)); }
  return output;
}
function numberField(value, key) { return Number(objects(value).find((item) => Object.hasOwn(item, key))?.[key] ?? -1); }
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
async function d1(sql, file) {
  const raw = await retry('D1 query', async () => wrangler(['d1', 'execute', DB, '--remote', `--command=${sql}`, '--config', 'wrangler.day2.json', '--json']));
  fs.writeFileSync(file, raw);
  return JSON.parse(raw);
}

async function runDay1CompatibilityRegression(baseUrl, outputFile) {
  const unique = `day2_${STAMP}`.replace(/[^A-Za-z0-9._-]/g, '_');
  const request = async (pathname, options = {}) => {
    const headers = new Headers(options.headers || {});
    headers.set('Origin', ORIGIN);
    headers.set('X-Correlation-Id', `corr_day2_day1_${Date.now()}_${Math.random().toString(16).slice(2)}`);
    const response = await fetch(`${baseUrl}${pathname}`, { ...options, headers });
    const payload = response.status === 204 ? null : await response.json();
    if (response.headers.get('x-galvivault-environment') !== 'qa') die(`${pathname} did not return the QA environment header.`);
    if (!response.headers.get('x-correlation-id')) die(`${pathname} did not return a correlation ID.`);
    return { response, payload };
  };

  const health = await request('/health');
  if (health.response.status !== 200) die('Day 1 health regression failed.');
  if (health.payload?.data?.schema_namespace !== 'gv1_') die('Day 1 schema namespace changed.');

  const ready = await request('/ready');
  if (ready.response.status !== 200 || ready.payload?.data?.ready !== true) die('Day 1 readiness regression failed.');
  if (ready.payload?.data?.present_table_count !== ready.payload?.data?.required_table_count) die('Day 1 readiness table count changed.');

  const schema = await request('/api/v1/schema-version');
  if (schema.response.status !== 200 || schema.payload?.data?.compatible !== true) die('Day 1 schema compatibility regression failed.');
  if (schema.payload?.data?.current_schema_version !== '0002') die(`Day 2 Worker must report schema 0002; received ${schema.payload?.data?.current_schema_version}.`);

  const session = {
    session_id: `ses_day1_${unique}`,
    founder_id: `fdr_day1_${unique}`,
    venture_id: `ven_day1_${unique}`,
    bmr_id: `bmr_day1_${unique}`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: {
      first_name: 'Day 1',
      last_name: 'Compatibility',
      email: `day1.${unique}@example.invalid`
    },
    venture_name: `Day 1 Compatibility Venture ${unique}`
  };
  const sessionKey = `day1-session-${unique}`;

  const created = await request('/api/v1/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey },
    body: JSON.stringify(session)
  });
  if (created.response.status !== 201 || created.payload?.data?.session?.session_id !== session.session_id) die('Day 1 Session creation regression failed.');

  const replay = await request('/api/v1/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey },
    body: JSON.stringify(session)
  });
  if (replay.response.status !== 200 || replay.payload?.meta?.idempotent_replay !== true) die('Day 1 exact replay regression failed.');

  const mismatch = await request('/api/v1/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey },
    body: JSON.stringify({ ...session, venture_name: 'Changed Venture' })
  });
  if (mismatch.response.status !== 409 || mismatch.payload?.error?.code !== 'GV_IDEMPOTENCY_REUSE_MISMATCH') die('Day 1 idempotency-conflict regression failed.');

  const fetched = await request(`/api/v1/sessions/${session.session_id}`);
  if (fetched.response.status !== 200 || fetched.payload?.data?.session?.session_id !== session.session_id || fetched.payload?.data?.business_medical_record?.bmr_id !== session.bmr_id) die('Day 1 Session retrieval regression failed.');

  const eventKey = `day1:${session.session_id}:triage_opened:001`;
  const eventBody = {
    event_key: eventKey,
    session_id: session.session_id,
    event_name: 'triage_opened',
    product: 'GalviTriage',
    current_stage: 'GalviTriage',
    metadata: { fixture: true, source: 'day2-day1-compatibility' }
  };
  const eventIdempotencyKey = `day1-event-${unique}`;

  const event = await request('/api/v1/journey-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': eventIdempotencyKey },
    body: JSON.stringify(eventBody)
  });
  if (event.response.status !== 201) die('Day 1 journey-event creation regression failed.');

  const eventReplay = await request('/api/v1/journey-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': eventIdempotencyKey },
    body: JSON.stringify(eventBody)
  });
  if (eventReplay.response.status !== 200 || eventReplay.payload?.meta?.idempotent_replay !== true) die('Day 1 journey-event replay regression failed.');

  const eventMismatch = await request('/api/v1/journey-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': eventIdempotencyKey },
    body: JSON.stringify({ ...eventBody, event_name: 'changed' })
  });
  if (eventMismatch.response.status !== 409 || eventMismatch.payload?.error?.code !== 'GV_IDEMPOTENCY_REUSE_MISMATCH') die('Day 1 journey-event conflict regression failed.');

  const fixtureA = await request('/api/v1/fixtures/results', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
  });
  const fixtureB = await request('/api/v1/fixtures/results', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
  });
  if (fixtureA.response.status !== 200 || fixtureB.response.status !== 200) die('Day 1 deterministic fixture regression failed.');
  if (JSON.stringify(fixtureA.payload?.data?.fixture) !== JSON.stringify(fixtureB.payload?.data?.fixture)) die('Day 1 deterministic fixture changed between calls.');

  writeJson(outputFile, {
    status: 'pass',
    expected_schema_version: '0002',
    health_status: health.response.status,
    readiness_status: ready.response.status,
    schema_status: schema.response.status,
    session_id: session.session_id,
    founder_id: session.founder_id,
    venture_id: session.venture_id,
    bmr_id: session.bmr_id,
    session_idempotency_key: sessionKey,
    event_key: eventKey,
    event_idempotency_key: eventIdempotencyKey
  });
}

async function main() {
  if (Number(process.versions.node.split('.')[0]) < 22) die(`Node 22+ required; current ${process.version}.`);
  if (git('branch', '--show-current') !== BRANCH) die(`Run from ${BRANCH}.`);
  if (git('status', '--porcelain')) die('Working tree must be clean.');
  const candidate = git('rev-parse', 'HEAD');
  run('git', ['cat-file', '-e', `${SOURCE_GUARD_SHA}^{commit}`]);
  run('git', ['cat-file', '-e', `${DAY1_ROLLBACK_SHA}^{commit}`]);
  run('git', ['merge-base', '--is-ancestor', SOURCE_GUARD_SHA, candidate]);

  const protectedFiles = new Set([
    'package.json', '.github/workflows/day1-qa-foundation.yml', '.github/workflows/day7b-readiness.yml',
    '.github/workflows/qa-stabilization.yml', 'worker/worker.js', 'worker/day7d-engine.js',
    'worker/production-entry.js', 'wrangler.production.jsonc', 'qa-frontend-worker.js',
    'wrangler.day7d.json', 'wrangler.qa-frontend.jsonc', 'index.html', 'galvitriage-cat.html',
    'day7c-browser-observability.js', 'day7d-browser-customer-intelligence.js'
  ]);
  const changed = git('diff', '--name-only', `${SOURCE_GUARD_SHA}..${candidate}`).split(/\r?\n/).filter(Boolean);
  fs.writeFileSync(path.join(OUT, 'changed-files.txt'), `${changed.join('\n')}\n`);
  const violations = changed.filter((file) => protectedFiles.has(file));
  if (violations.length) die(`Protected GalviCare/Production files changed after the approved Day 2 source guard: ${violations.join(', ')}`);

  const config = JSON.parse(fs.readFileSync('wrangler.day2.json', 'utf8'));
  const binding = config.d1_databases?.find((item) => item.binding === 'DB');
  if (config.name !== WORKER || config.main !== 'worker/day2.js' || config.vars?.ENVIRONMENT !== 'qa' || config.vars?.MIN_SCHEMA_VERSION !== '0002' || binding?.database_name !== DB) die('Day 2 QA configuration is not authoritative.');

  writeJson(path.join(OUT, 'baseline.json'), { branch: BRANCH, source_guard_sha: SOURCE_GUARD_SHA, day1_rollback_sha: DAY1_ROLLBACK_SHA, candidate_sha: candidate, worker: WORKER, d1: DB, origin: ORIGIN, started_at: new Date().toISOString() });
  writeJson(path.join(OUT, 'source-hashes.json'), {
    'worker/day2.js': hash('worker/day2.js'),
    'wrangler.day2.json': hash('wrangler.day2.json'),
    'migrations/day1/0002_day2_identity_continuity.sql': hash('migrations/day1/0002_day2_identity_continuity.sql')
  });

  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--ignore-scripts'], { inherit: true });
  for (const file of ['worker/day2.js', 'tests/galvivault-day2-identity-continuity.test.mjs', 'scripts/galvivault-day2-e2e.mjs', 'scripts/verify-galvivault-day2-files.mjs', 'scripts/galvivault-day2-qa-operator.mjs', 'worker/production-entry.js']) run(process.execPath, ['--check', file]);
  run(process.execPath, ['scripts/verify-galvivault-day2-files.mjs'], { file: path.join(OUT, 'file-verification.txt') });
  run(process.execPath, ['--test', 'tests/day1-foundation.test.mjs'], { file: path.join(OUT, 'day1-local-regression.txt') });
  run(process.execPath, ['--test', 'tests/galvivault-day2-identity-continuity.test.mjs'], { file: path.join(OUT, 'day2-local-tests.txt') });
  run(process.execPath, ['--test', 'tests/day7b-environment-isolation.test.mjs'], { file: path.join(OUT, 'environment-isolation.txt') });

  const whoami = wrangler(['whoami'], path.join(OUT, 'wrangler-whoami.txt'));
  if (!whoami) die('Wrangler authentication was not confirmed.');

  const productionBefore = await fetch('https://galvipro.com/');
  fs.writeFileSync(path.join(OUT, 'production-before.html'), await productionBefore.text());
  if (productionBefore.status !== 200) die(`Production precheck returned ${productionBefore.status}.`);

  const preflightSql = "SELECT COUNT(*) AS duplicate_email_groups FROM (SELECT lower(trim(email)) AS normalized FROM gv1_founders WHERE email IS NOT NULL AND trim(email)<>'' GROUP BY lower(trim(email)) HAVING COUNT(*)>1); SELECT COUNT(*) AS duplicate_bmr_ventures FROM (SELECT venture_id FROM gv1_business_medical_records GROUP BY venture_id HAVING COUNT(*)>1); SELECT COUNT(*) AS duplicate_primary_ventures FROM (SELECT venture_id FROM gv1_founder_venture_roles WHERE is_primary=1 AND status='active' GROUP BY venture_id HAVING COUNT(*)>1); SELECT COUNT(*) AS ledger_count FROM gv1_schema_migrations WHERE migration_id='0002'; SELECT COUNT(*) AS day2_column_count FROM (SELECT name FROM pragma_table_info('gv1_founders') WHERE name IN ('normalized_email','profile_json') UNION ALL SELECT name FROM pragma_table_info('gv1_ventures') WHERE name IN ('website','industry','revenue_range','profile_json') UNION ALL SELECT name FROM pragma_table_info('gv1_idempotency_keys') WHERE name='response_json'); SELECT COUNT(*) AS day2_index_count FROM sqlite_master WHERE type='index' AND name IN ('ux_gv1_founders_normalized_email','ux_gv1_bmr_one_per_venture','ux_gv1_roles_one_active_primary','ix_gv1_founders_normalized_email','ix_gv1_roles_founder_status','ix_gv1_roles_venture_status','ix_gv1_bmr_venture_status','ix_gv1_sessions_founder_venture');";
  const preflight = await d1(preflightSql, path.join(OUT, 'migration-preflight.json'));
  for (const field of ['duplicate_email_groups', 'duplicate_bmr_ventures', 'duplicate_primary_ventures']) if (numberField(preflight, field) !== 0) die(`${field} is nonzero.`);
  const ledger = numberField(preflight, 'ledger_count');
  const columns = numberField(preflight, 'day2_column_count');
  const indexes = numberField(preflight, 'day2_index_count');
  if (ledger === 0 && columns === 0 && indexes === 0) {
    const applied = await retry('Migration 0002', async () => wrangler(['d1', 'execute', DB, '--remote', '--file', 'migrations/day1/0002_day2_identity_continuity.sql', '--config', 'wrangler.day2.json']));
    fs.writeFileSync(path.join(OUT, 'migration-apply.txt'), applied);
  } else if (!(ledger === 1 && columns === 7 && indexes === 8)) {
    die(`Partial migration state: ledger=${ledger}, columns=${columns}, indexes=${indexes}.`);
  }

  const verifySql = "SELECT migration_id,name,environment,checksum FROM gv1_schema_migrations WHERE migration_id IN ('0001','0002') ORDER BY migration_id; SELECT COUNT(*) AS day2_column_count FROM (SELECT name FROM pragma_table_info('gv1_founders') WHERE name IN ('normalized_email','profile_json') UNION ALL SELECT name FROM pragma_table_info('gv1_ventures') WHERE name IN ('website','industry','revenue_range','profile_json') UNION ALL SELECT name FROM pragma_table_info('gv1_idempotency_keys') WHERE name='response_json'); SELECT COUNT(*) AS day2_index_count FROM sqlite_master WHERE type='index' AND name IN ('ux_gv1_founders_normalized_email','ux_gv1_bmr_one_per_venture','ux_gv1_roles_one_active_primary','ix_gv1_founders_normalized_email','ix_gv1_roles_founder_status','ix_gv1_roles_venture_status','ix_gv1_bmr_venture_status','ix_gv1_sessions_founder_venture');";
  const verified = await d1(verifySql, path.join(OUT, 'schema-verification.json'));
  if (!objects(verified).find((item) => item.migration_id === '0001') || !objects(verified).find((item) => item.migration_id === '0002') || numberField(verified, 'day2_column_count') !== 7 || numberField(verified, 'day2_index_count') !== 8) die('Remote schema verification failed.');

  const before = await retry('Deployment list before', async () => wrangler(['deployments', 'list', '--config', 'wrangler.day2.json', '--json']));
  fs.writeFileSync(path.join(OUT, 'deployments-before.json'), before);
  const deploy = await retry('QA deployment', async () => wrangler(['deploy', '--config', 'wrangler.day2.json']));
  fs.writeFileSync(path.join(OUT, 'deploy.log'), deploy);
  const baseUrl = (deploy.match(/https:\/\/[A-Za-z0-9.-]+\.workers\.dev/g) || []).at(-1);
  if (!baseUrl) die('QA Worker URL was not found in deploy output.');
  const after = await retry('Deployment list after', async () => wrangler(['deployments', 'list', '--config', 'wrangler.day2.json', '--json']));
  fs.writeFileSync(path.join(OUT, 'deployments-after.json'), after);
  if (before.trim() === after.trim()) die('Deployment history did not change.');

  async function ready(label) {
    const response = await fetch(`${baseUrl}/api/v1/day2/readiness?candidate=${candidate}&proof=${label}`, { headers: { Origin: ORIGIN } });
    const body = await response.text();
    fs.writeFileSync(path.join(OUT, `readiness-${label}.json`), body);
    fs.writeFileSync(path.join(OUT, `readiness-${label}.headers.txt`), [...response.headers.entries()].map(([k, v]) => `${k}: ${v}`).join('\n'));
    if (response.status !== 200 || response.headers.get('x-galvivault-environment') !== 'qa') return false;
    try { const p = JSON.parse(body); return p?.success === true && p?.environment === 'qa' && p?.data?.ready === true && p?.data?.current_schema_version === '0002'; } catch { return false; }
  }
  let converged = false;
  for (let attempt = 1; attempt <= 60; attempt += 1) { if (await ready('first')) { converged = true; break; } await new Promise((resolve) => setTimeout(resolve, 3000)); }
  if (!converged) die('Day 2 runtime did not converge.');
  await new Promise((resolve) => setTimeout(resolve, 10000));
  if (!(await ready('second'))) die('Second readiness proof failed.');

  await runDay1CompatibilityRegression(baseUrl, path.join(OUT, 'day1-remote-regression.json'));
  const h2File = path.join(OUT, 'h2-1-through-h2-9.json');
  run(process.execPath, ['scripts/galvivault-day2-e2e.mjs'], { env: { DAY2_BASE_URL: baseUrl, DAY2_ALLOWED_ORIGIN: ORIGIN, DAY2_RUN_SUFFIX: `manual-${STAMP}`, DAY2_EVIDENCE_PATH: h2File }, file: path.join(OUT, 'h2-1-through-h2-9.log') });

  const e = JSON.parse(fs.readFileSync(h2File, 'utf8'));
  const q = (value) => String(value).replaceAll("'", "''");
  const f = e.canonical_ids.first, s = e.canonical_ids.second_session, v = e.canonical_ids.second_venture, x = q(e.run_suffix);
  const reconcileSql = `SELECT COUNT(*) AS founder_count FROM gv1_founders WHERE founder_id='${q(f.founder_id)}'; SELECT COUNT(*) AS normalized_email_count FROM gv1_founders WHERE normalized_email='founder.day2.${x}@example.test'; SELECT COUNT(DISTINCT venture_id) AS venture_count FROM gv1_founder_venture_roles WHERE founder_id='${q(f.founder_id)}' AND status='active'; SELECT COUNT(*) AS first_bmr_count FROM gv1_business_medical_records WHERE bmr_id='${q(f.bmr_id)}' AND venture_id='${q(f.venture_id)}'; SELECT COUNT(*) AS second_bmr_count FROM gv1_business_medical_records WHERE bmr_id='${q(v.bmr_id)}' AND venture_id='${q(v.venture_id)}'; SELECT COUNT(*) AS first_session_count FROM gv1_assessment_sessions WHERE session_id IN ('${q(f.session_id)}','${q(s.session_id)}') AND founder_id='${q(f.founder_id)}' AND venture_id='${q(f.venture_id)}' AND bmr_id='${q(f.bmr_id)}'; SELECT COUNT(*) AS second_session_count FROM gv1_assessment_sessions WHERE session_id='${q(v.session_id)}' AND founder_id='${q(f.founder_id)}' AND venture_id='${q(v.venture_id)}' AND bmr_id='${q(v.bmr_id)}'; SELECT COUNT(*) AS venture_update_audit_count FROM gv1_audit_log WHERE entity_type='venture' AND entity_id='${q(f.venture_id)}' AND operation='update'; SELECT COUNT(*) AS cross_scope_session_count FROM gv1_assessment_sessions WHERE client_session_key='d2-session-${x}-scope'; SELECT COUNT(*) AS key_reuse_receipt_count FROM gv1_idempotency_keys WHERE idempotency_key='d2-key-reuse-${x}'; SELECT COUNT(*) AS orphan_roles FROM gv1_founder_venture_roles r LEFT JOIN gv1_founders f ON f.founder_id=r.founder_id LEFT JOIN gv1_ventures v ON v.venture_id=r.venture_id WHERE f.founder_id IS NULL OR v.venture_id IS NULL; SELECT COUNT(*) AS orphan_bmrs FROM gv1_business_medical_records b LEFT JOIN gv1_ventures v ON v.venture_id=b.venture_id WHERE v.venture_id IS NULL; SELECT COUNT(*) AS mismatched_sessions FROM gv1_assessment_sessions s LEFT JOIN gv1_business_medical_records b ON b.bmr_id=s.bmr_id WHERE b.bmr_id IS NULL OR b.venture_id<>s.venture_id; SELECT COUNT(*) AS duplicate_founder_emails FROM (SELECT normalized_email FROM gv1_founders WHERE normalized_email IS NOT NULL GROUP BY normalized_email HAVING COUNT(*)>1);`;
  const reconciliation = await d1(reconcileSql, path.join(OUT, 'd1-reconciliation.json'));
  for (const field of ['founder_count','normalized_email_count','first_bmr_count','second_bmr_count','second_session_count','venture_update_audit_count','key_reuse_receipt_count']) if (numberField(reconciliation, field) !== 1) die(`${field} must equal 1.`);
  if (numberField(reconciliation, 'venture_count') !== 2 || numberField(reconciliation, 'first_session_count') !== 2) die('Expected two Ventures and two Sessions for the first Venture.');
  for (const field of ['cross_scope_session_count','orphan_roles','orphan_bmrs','mismatched_sessions','duplicate_founder_emails']) if (numberField(reconciliation, field) !== 0) die(`${field} must equal 0.`);

  const productionAfter = await fetch('https://galvipro.com/');
  const productionHtml = await productionAfter.text();
  fs.writeFileSync(path.join(OUT, 'production-after.html'), productionHtml);
  if (productionAfter.status !== 200) die(`Production regression returned ${productionAfter.status}.`);
  for (const forbidden of [WORKER, DB, 'worker/day2.js', 'cdf9042b-ab09-498a-ac66-010b6cce47d4']) if (productionHtml.includes(forbidden)) die(`Production exposes ${forbidden}.`);

  fs.mkdirSync(FINAL, { recursive: true });
  fs.cpSync(OUT, FINAL, { recursive: true });
  writeJson(path.join(FINAL, 'deployment-metadata.json'), { day: 2, branch: BRANCH, source_guard_sha: SOURCE_GUARD_SHA, day1_rollback_sha: DAY1_ROLLBACK_SHA, candidate_commit: candidate, qa_worker: WORKER, qa_worker_url: baseUrl, qa_d1: DB, migration: '0002', automated_h2_1_through_h2_9: 'pass', human_h2_10: 'pending' });
  fs.writeFileSync(path.join(FINAL, 'rollback.md'), `# Day 2 Rollback\n\nApplication rollback commit: ${DAY1_ROLLBACK_SHA}\n\nCommand: \`npx --yes wrangler@4 deploy --config wrangler.json\`\n\nMigration 0002 is additive and must not be destructively reversed.\n`);
  fs.writeFileSync(path.join(FINAL, 'defect-register.md'), '# Day 2 Defect Register\n\nAutomated blocking defects after this run: none.\nRemaining gate: H2.10 Human Production regression evidence.\n');
  fs.writeFileSync(path.join(FINAL, 'h2-10-human-evidence.md'), '# H2.10 Production Regression\n\n- [ ] Production GalviCare renders in Incognito.\n- [ ] Network traffic does not invoke the GalviVault QA Worker.\n- [ ] Production does not use `galvivault-0-5-qa`.\n- [ ] QA fixtures are unavailable in Production.\n- [ ] Production Worker deployment/version evidence captured.\n- [ ] QA Worker deployment/version evidence captured.\n');

  console.log('\nGALVIVAULT DAY 2 AUTOMATED + REMOTE QA: PASS');
  console.log(`Candidate SHA: ${candidate}`);
  console.log(`QA Worker: ${baseUrl}`);
  console.log(`Evidence: ${FINAL}`);
  console.log('Remaining gate: H2.10 Human Production regression.');
}

main().catch((error) => { console.error(`\n${error.stack || error.message}`); process.exitCode = 1; });
