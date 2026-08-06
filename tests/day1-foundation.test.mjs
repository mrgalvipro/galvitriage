import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker, { FIXTURE, REQUIRED_SCHEMA, SERVICE } from '../worker/day1.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(ROOT, relative));

class D1StatementMock {
  constructor(database, sql, params = []) { this.database = database; this.sql = sql; this.params = params; }
  bind(...params) { return new D1StatementMock(this.database, this.sql, params); }
  async first() { return this.database.prepare(this.sql).get(...this.params) ?? null; }
  async all() { return { success: true, results: this.database.prepare(this.sql).all(...this.params) }; }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.params);
    return { success: true, meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid || 0) } };
  }
}

class D1DatabaseMock {
  constructor(database) { this.database = database; }
  prepare(sql) { return new D1StatementMock(this.database, sql); }
  async batch(statements) {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      this.database.exec('COMMIT');
      return results;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }
}

function migratedDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(read('migrations/day1/0001_canonical_business_medical_record.sql'));
  return { sqlite, DB: new D1DatabaseMock(sqlite) };
}

function environment(overrides = {}) {
  const { sqlite, DB } = migratedDatabase();
  return {
    sqlite,
    env: {
      ENVIRONMENT: 'qa',
      FIXTURE_MODE: 'true',
      API_VERSION: 'v1',
      MIN_SCHEMA_VERSION: REQUIRED_SCHEMA,
      ALLOWED_ORIGINS: 'https://galvipro.com,http://localhost:8787',
      DB,
      ...overrides
    }
  };
}

async function call(urlPath, { method = 'GET', env, body, origin = 'https://galvipro.com', idempotencyKey, correlation = 'corr_day1_test_001' } = {}) {
  const headers = new Headers({ 'X-Correlation-Id': correlation });
  if (origin) headers.set('Origin', origin);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey);
  const request = new Request(`https://day1.test${urlPath}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const response = await worker.fetch(request, env);
  const payload = response.status === 204 ? null : await response.json();
  return { response, payload };
}

const sessionPayload = (sessionId = FIXTURE.session_id) => ({
  session_id: sessionId,
  founder_id: FIXTURE.founder_id,
  venture_id: FIXTURE.venture_id,
  bmr_id: FIXTURE.bmr_id,
  source: FIXTURE.source,
  current_stage: FIXTURE.current_stage
});

if (process.env.DAY1_REMOTE_SMOKE === '1') {
  test('remote QA smoke', async () => {
    const base = String(process.env.DAY1_BASE_URL || '').replace(/\/$/, '');
    assert.ok(base, 'DAY1_BASE_URL is required');
    const origin = process.env.DAY1_ALLOWED_ORIGIN || 'https://galvipro.com';
    const request = async (pathname, options = {}) => {
      const headers = new Headers(options.headers || {});
      headers.set('Origin', origin);
      headers.set('X-Correlation-Id', `corr_remote_${Date.now()}_${Math.random().toString(16).slice(2)}`);
      const response = await fetch(`${base}${pathname}`, { ...options, headers });
      const payload = await response.json();
      assert.equal(response.headers.get('x-galvivault-environment'), 'qa');
      assert.ok(response.headers.get('x-correlation-id'));
      return { response, payload };
    };

    const health = await request('/health');
    assert.equal(health.response.status, 200);
    assert.equal(health.payload.data.service, SERVICE);
    const ready = await request('/ready');
    assert.equal(ready.response.status, 200);
    assert.equal(ready.payload.data.ready, true);
    const schema = await request('/api/v1/schema-version');
    assert.equal(schema.response.status, 200);
    assert.equal(schema.payload.data.compatible, true);

    const unique = String(process.env.DAY1_RUN_SUFFIX || Date.now()).replace(/[^A-Za-z0-9_.-]/g, '_');
    const sessionId = `ses_day1_e2e_${unique}`;
    const session = sessionPayload(sessionId);
    const sessionKey = `day1-session-${unique}`;
    const create = await request('/api/v1/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey }, body: JSON.stringify(session)
    });
    assert.equal(create.response.status, 201);
    assert.equal(create.payload.data.session.session_id, sessionId);
    const replay = await request('/api/v1/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey }, body: JSON.stringify(session)
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.meta.idempotent_replay, true);
    const fetched = await request(`/api/v1/sessions/${sessionId}`);
    assert.equal(fetched.payload.data.session.session_id, sessionId);

    const eventKey = `day1:${sessionId}:triage_opened:001`;
    const eventBody = { event_key: eventKey, session_id: sessionId, event_name: 'triage_opened', product: 'GalviTriage', current_stage: 'GalviTriage', metadata: { fixture: true, source: 'day1-human-e2e' } };
    const event = await request('/api/v1/journey-events', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `event-${unique}` }, body: JSON.stringify(eventBody)
    });
    assert.equal(event.response.status, 201);
    const eventReplay = await request('/api/v1/journey-events', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `event-${unique}` }, body: JSON.stringify(eventBody)
    });
    assert.equal(eventReplay.response.status, 200);
    assert.equal(eventReplay.payload.meta.idempotent_replay, true);
    const fixture = await request('/api/v1/fixtures/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(fixture.response.status, 200);
    assert.equal(fixture.payload.data.fixture.deterministic, true);
    console.log(JSON.stringify({ session_id: sessionId, event_key: eventKey, session_key: sessionKey }, null, 2));
  });
} else {
  test('required Day 1 files exist at exact canonical paths', () => {
    for (const file of ['package.json', 'wrangler.json', 'wrangler.day7d.json', 'worker/day1.js', 'migrations/day1/0001_canonical_business_medical_record.sql', 'tests/day1-foundation.test.mjs']) {
      assert.equal(exists(file), true, `missing ${file}`);
    }
  });

  test('package and Wrangler configuration are QA-only and executable', () => {
    const pkg = JSON.parse(read('package.json'));
    const wrangler = JSON.parse(read('wrangler.json'));
    const day7d = JSON.parse(read('wrangler.day7d.json'));
    assert.equal(pkg.type, 'module');
    for (const script of ['test:day1', 'verify:day1-files', 'verify:migration', 'smoke:day1', 'dev:day1', 'deploy:day1:qa']) assert.ok(pkg.scripts[script]);
    assert.equal(wrangler.main, 'worker/day1.js');
    assert.equal(wrangler.name, 'galvivault-p0-day1-qa');
    assert.equal(wrangler.vars.ENVIRONMENT, 'qa');
    assert.equal(wrangler.vars.FIXTURE_MODE, 'true');
    assert.equal(wrangler.vars.MIN_SCHEMA_VERSION, '0001');
    assert.equal(wrangler.d1_databases[0].binding, 'DB');
    assert.equal(wrangler.d1_databases[0].database_name, 'galvivault-0-5-qa');
    assert.equal(wrangler.d1_databases[0].migrations_dir, 'migrations/day1');
    assert.equal(day7d.main, 'worker/day7d-engine.js');
    assert.equal(day7d.name, 'galvicare-triage-intake');
  });

  test('Production protection keeps Day 1 out of the Production entry', () => {
    assert.equal(exists('worker/production-entry.js'), true);
    const production = read('wrangler.production.jsonc');
    assert.match(production, /worker\/production-entry\.js/);
    assert.doesNotMatch(production, /worker\/day1\.js/);
  });

  test('migration cleanly creates complete baseline, indexes, triggers, and ledger', () => {
    const sql = read('migrations/day1/0001_canonical_business_medical_record.sql');
    assert.doesNotMatch(sql, /\bDROP\b/i);
    const sqlite = new DatabaseSync(':memory:');
    sqlite.exec(sql);
    sqlite.exec(sql);
    const expectedTables = ['schema_migrations','founders','ventures','founder_venture_roles','business_medical_records','assessment_sessions','question_definitions','assessment_answers','evidence_items','evidence_relationships','observations','observation_evidence','hypotheses','hypothesis_observations','findings','finding_evidence','finding_observations','finding_hypotheses','recommendations','recommendation_findings','treatment_plans','treatment_plan_items','treatment_events','outcomes','outcome_evidence','feedback','learning_candidates','knowledge_items','journey_events','audit_log','idempotency_keys','adapter_deliveries','import_batches','import_errors','application_errors'];
    const tables = new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
    for (const table of expectedTables) assert.equal(tables.has(table), true, `missing table ${table}`);
    const migration = sqlite.prepare('SELECT migration_id, environment FROM schema_migrations').get();
    assert.deepEqual({ ...migration }, { migration_id: '0001', environment: 'qa' });
    const triggers = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='trigger'").all().map((row) => row.name);
    assert.ok(triggers.includes('trg_journey_events_no_update'));
    assert.ok(triggers.includes('trg_audit_log_no_delete'));
  });

  test('health is canonical and does not expose database identity', async () => {
    const { env } = environment();
    const { response, payload } = await call('/health', { env });
    assert.equal(response.status, 200);
    assert.equal(payload.data.service, SERVICE);
    assert.equal(payload.environment, 'qa');
    assert.equal(response.headers.get('x-galvivault-environment'), 'qa');
    assert.equal(JSON.stringify(payload).includes('cdf9042b'), false);
  });

  test('readiness and schema version agree with migration ledger', async () => {
    const { env } = environment();
    const ready = await call('/ready', { env });
    assert.equal(ready.response.status, 200);
    assert.equal(ready.payload.data.current_schema_version, '0001');
    const schema = await call('/api/v1/schema-version', { env });
    assert.equal(schema.payload.data.compatible, true);
    assert.equal(schema.payload.data.current_schema_version, '0001');
  });

  test('CORS grants only exact approved origins', async () => {
    const { env } = environment();
    const allowed = await call('/health', { env, origin: 'https://galvipro.com' });
    assert.equal(allowed.response.headers.get('access-control-allow-origin'), 'https://galvipro.com');
    const denied = await call('/health', { env, origin: 'https://attacker.example' });
    assert.equal(denied.response.status, 403);
    assert.equal(denied.response.headers.get('access-control-allow-origin'), null);
  });

  test('missing database binding fails closed with safe JSON', async () => {
    const { env } = environment({ DB: undefined });
    const result = await call('/ready', { env });
    assert.equal(result.response.status, 503);
    assert.equal(result.payload.error.code, 'GV_DB_UNAVAILABLE');
    assert.equal(JSON.stringify(result.payload).includes('SQLITE'), false);
    assert.equal(JSON.stringify(result.payload).includes('stack'), false);
  });

  test('session create, replay, get, audit and deduplication persist correctly', async () => {
    const { env, sqlite } = environment();
    const body = sessionPayload();
    const created = await call('/api/v1/sessions', { method: 'POST', env, body, idempotencyKey: 'day1-session-001' });
    assert.equal(created.response.status, 201);
    const replay = await call('/api/v1/sessions', { method: 'POST', env, body, idempotencyKey: 'day1-session-001' });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.meta.idempotent_replay, true);
    const fetched = await call(`/api/v1/sessions/${FIXTURE.session_id}`, { env });
    assert.equal(fetched.payload.data.session.session_id, FIXTURE.session_id);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM assessment_sessions WHERE session_id=?').get(FIXTURE.session_id).n, 1);
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM idempotency_keys WHERE scope='session:create'").get().n, 1);
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE entity_type='assessment_session'").get().n, 1);
  });

  test('journey event create, replay and mismatch are idempotent', async () => {
    const { env, sqlite } = environment();
    await call('/api/v1/sessions', { method: 'POST', env, body: sessionPayload(), idempotencyKey: 'day1-session-002' });
    const body = { event_key: `day1:${FIXTURE.session_id}:triage_opened:001`, session_id: FIXTURE.session_id, event_name: 'triage_opened', product: 'GalviTriage', current_stage: FIXTURE.current_stage, metadata: { fixture: true } };
    const created = await call('/api/v1/journey-events', { method: 'POST', env, body, idempotencyKey: 'day1-event-001' });
    assert.equal(created.response.status, 201);
    const replay = await call('/api/v1/journey-events', { method: 'POST', env, body, idempotencyKey: 'day1-event-001' });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.meta.idempotent_replay, true);
    const mismatch = await call('/api/v1/journey-events', { method: 'POST', env, body: { ...body, event_name: 'changed' }, idempotencyKey: 'day1-event-001' });
    assert.equal(mismatch.response.status, 409);
    assert.equal(mismatch.payload.error.code, 'GV_IDEMPOTENCY_REUSE_MISMATCH');
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM journey_events WHERE event_key=?').get(body.event_key).n, 1);
  });

  test('fixture is deterministic in QA and unavailable under Production policy', async () => {
    const firstEnv = environment();
    const secondEnv = environment();
    const a = await call('/api/v1/fixtures/results', { method: 'POST', env: firstEnv.env, body: {} });
    const b = await call('/api/v1/fixtures/results', { method: 'POST', env: secondEnv.env, body: {} });
    assert.deepEqual(a.payload.data.fixture, b.payload.data.fixture);
    const production = environment({ ENVIRONMENT: 'production', FIXTURE_MODE: 'false' });
    const denied = await call('/api/v1/fixtures/results', { method: 'POST', env: production.env, body: {} });
    assert.equal(denied.response.status, 404);
    assert.equal(denied.payload.error.code, 'GV_FIXTURE_DISABLED');
  });

  test('invalid route, payload and unknown session return safe canonical errors', async () => {
    const { env } = environment();
    const unknownRoute = await call('/unknown', { env });
    assert.equal(unknownRoute.response.status, 404);
    assert.equal(unknownRoute.payload.error.code, 'GV_NOT_FOUND');
    const invalid = await call('/api/v1/sessions', { method: 'POST', env, body: {}, idempotencyKey: 'invalid-001' });
    assert.equal(invalid.response.status, 422);
    assert.equal(invalid.payload.error.code, 'GV_REQ_SCHEMA');
    const missing = await call('/api/v1/sessions/ses_missing_001', { env });
    assert.equal(missing.response.status, 404);
    assert.equal(missing.payload.error.code, 'GV_NOT_FOUND');
  });

  test('OPTIONS returns no body and approved CORS metadata', async () => {
    const { env } = environment();
    const result = await call('/api/v1/sessions', { method: 'OPTIONS', env });
    assert.equal(result.response.status, 204);
    assert.equal(result.response.headers.get('access-control-allow-origin'), 'https://galvipro.com');
    assert.equal(result.payload, null);
  });
}
