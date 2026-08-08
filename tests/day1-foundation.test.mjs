import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker, { FIXTURE, REQUIRED_SCHEMA, SERVICE, TABLE_PREFIX } from '../worker/day1.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(ROOT, relative));

class D1StatementMock {
  constructor(database, sql, params = []) {
    this.database = database;
    this.sql = sql;
    this.params = params;
  }
  bind(...params) { return new D1StatementMock(this.database, this.sql, params); }
  async first() { return this.database.prepare(this.sql).get(...this.params) ?? null; }
  async all() { return { success: true, results: this.database.prepare(this.sql).all(...this.params) }; }
  async run() {
    const result = this.database.prepare(this.sql).run(...this.params);
    return {
      success: true,
      meta: {
        changes: Number(result.changes),
        last_row_id: Number(result.lastInsertRowid || 0)
      }
    };
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

function migratedDatabase({ withLegacyTables = false } = {}) {
  const sqlite = new DatabaseSync(':memory:');
  if (withLegacyTables) {
    sqlite.exec(`
      CREATE TABLE founders (founder_id TEXT PRIMARY KEY, session_id TEXT, email TEXT);
      CREATE TABLE ventures (venture_id TEXT PRIMARY KEY, session_id TEXT, venture_name TEXT);
      CREATE TABLE journey_events (event_id TEXT PRIMARY KEY, session_id TEXT, event_name TEXT);
      INSERT INTO founders(founder_id, session_id, email) VALUES ('legacy_founder', 'legacy_session', 'legacy@example.com');
    `);
  }
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
      ALLOWED_ORIGINS: 'https://galvipro.com,https://www.galvipro.com,http://localhost:8787',
      DB,
      ...overrides
    }
  };
}

async function call(urlPath, {
  method = 'GET',
  env,
  body,
  origin = 'https://galvipro.com',
  idempotencyKey,
  correlation = 'corr_day1_test_001'
} = {}) {
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

function syntheticContext(suffix = 'fixture_001') {
  const safe = String(suffix).replace(/[^A-Za-z0-9._-]/g, '_');
  return {
    session_id: `ses_day1_${safe}`,
    founder_id: `fdr_day1_${safe}`,
    venture_id: `ven_day1_${safe}`,
    bmr_id: `bmr_day1_${safe}`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: {
      first_name: 'Day 1',
      last_name: 'Evidence',
      email: `day1.${safe}@example.invalid`
    },
    venture_name: `Day 1 Evidence Venture ${safe}`
  };
}

if (process.env.DAY1_REMOTE_SMOKE === '1') {
  test('remote QA smoke', async () => {
    const base = String(process.env.DAY1_BASE_URL || '').replace(/\/$/, '');
    assert.ok(base, 'DAY1_BASE_URL is required');
    const origin = process.env.DAY1_ALLOWED_ORIGIN || 'https://galvipro.com';
    const request = async (pathname, options = {}) => {
      const requestHeaders = new Headers(options.headers || {});
      requestHeaders.set('Origin', origin);
      requestHeaders.set('X-Correlation-Id', `corr_remote_${Date.now()}_${Math.random().toString(16).slice(2)}`);
      const response = await fetch(`${base}${pathname}`, { ...options, headers: requestHeaders });
      const payload = response.status === 204 ? null : await response.json();
      assert.equal(response.headers.get('x-galvivault-environment'), 'qa');
      assert.ok(response.headers.get('x-correlation-id'));
      return { response, payload };
    };

    const health = await request('/health');
    assert.equal(health.response.status, 200);
    assert.equal(health.payload.data.service, SERVICE);
    assert.equal(health.payload.data.schema_namespace, TABLE_PREFIX);

    const ready = await request('/ready');
    assert.equal(ready.response.status, 200);
    assert.equal(ready.payload.data.ready, true);
    assert.equal(ready.payload.data.present_table_count, ready.payload.data.required_table_count);

    const schema = await request('/api/v1/schema-version');
    assert.equal(schema.response.status, 200);
    assert.equal(schema.payload.data.compatible, true);
    assert.equal(schema.payload.data.current_schema_version, REQUIRED_SCHEMA);

    const unique = String(process.env.DAY1_RUN_SUFFIX || Date.now()).replace(/[^A-Za-z0-9._-]/g, '_');
    const session = syntheticContext(`e2e_${unique}`);
    const sessionKey = `day1-session-${unique}`;

    const created = await request('/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey },
      body: JSON.stringify(session)
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.data.session.session_id, session.session_id);

    const replay = await request('/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey },
      body: JSON.stringify(session)
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.meta.idempotent_replay, true);

    const mismatchedSession = await request('/api/v1/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': sessionKey },
      body: JSON.stringify({ ...session, venture_name: 'Changed Venture' })
    });
    assert.equal(mismatchedSession.response.status, 409);
    assert.equal(mismatchedSession.payload.error.code, 'GV_IDEMPOTENCY_REUSE_MISMATCH');

    const fetched = await request(`/api/v1/sessions/${session.session_id}`);
    assert.equal(fetched.response.status, 200);
    assert.equal(fetched.payload.data.session.session_id, session.session_id);
    assert.equal(fetched.payload.data.business_medical_record.bmr_id, session.bmr_id);

    const eventKey = `day1:${session.session_id}:triage_opened:001`;
    const eventBody = {
      event_key: eventKey,
      session_id: session.session_id,
      event_name: 'triage_opened',
      product: 'GalviTriage',
      current_stage: 'GalviTriage',
      metadata: { fixture: true, source: 'day1-automated-smoke' }
    };
    const eventIdempotencyKey = `day1-event-${unique}`;

    const event = await request('/api/v1/journey-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': eventIdempotencyKey },
      body: JSON.stringify(eventBody)
    });
    assert.equal(event.response.status, 201);

    const eventReplay = await request('/api/v1/journey-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': eventIdempotencyKey },
      body: JSON.stringify(eventBody)
    });
    assert.equal(eventReplay.response.status, 200);
    assert.equal(eventReplay.payload.meta.idempotent_replay, true);

    const eventMismatch = await request('/api/v1/journey-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': eventIdempotencyKey },
      body: JSON.stringify({ ...eventBody, event_name: 'changed' })
    });
    assert.equal(eventMismatch.response.status, 409);
    assert.equal(eventMismatch.payload.error.code, 'GV_IDEMPOTENCY_REUSE_MISMATCH');

    const fixtureA = await request('/api/v1/fixtures/results', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
    });
    const fixtureB = await request('/api/v1/fixtures/results', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
    });
    assert.equal(fixtureA.response.status, 200);
    assert.deepEqual(fixtureA.payload.data.fixture, fixtureB.payload.data.fixture);

    console.log(JSON.stringify({
      session_id: session.session_id,
      founder_id: session.founder_id,
      venture_id: session.venture_id,
      bmr_id: session.bmr_id,
      session_idempotency_key: sessionKey,
      event_key: eventKey,
      event_idempotency_key: eventIdempotencyKey
    }, null, 2));
  });
} else {
  test('required Day 1 files exist at exact canonical paths', () => {
    for (const file of [
      'package.json',
      'wrangler.json',
      'wrangler.day7d.json',
      '.github/workflows/day1-qa-foundation.yml',
      'worker/day1.js',
      'migrations/day1/0001_canonical_business_medical_record.sql',
      'tests/day1-foundation.test.mjs'
    ]) {
      assert.equal(exists(file), true, `missing ${file}`);
    }
  });

  test('package and Wrangler configuration are QA-only and executable', () => {
    const pkg = JSON.parse(read('package.json'));
    const wrangler = JSON.parse(read('wrangler.json'));
    const day7d = JSON.parse(read('wrangler.day7d.json'));
    assert.equal(pkg.type, 'module');
    for (const script of [
      'test:day1', 'verify:day1-files', 'verify:migration',
      'smoke:day1', 'qa:smoke', 'dev:day1', 'deploy:day1:qa'
    ]) assert.ok(pkg.scripts[script], `missing package script ${script}`);
    assert.equal(wrangler.main, 'worker/day1.js');
    assert.equal(wrangler.name, 'galvivault-p0-day1-qa');
    assert.equal(wrangler.vars.ENVIRONMENT, 'qa');
    assert.equal(wrangler.vars.FIXTURE_MODE, 'true');
    assert.equal(wrangler.vars.MIN_SCHEMA_VERSION, REQUIRED_SCHEMA);
    assert.equal(wrangler.d1_databases[0].binding, 'DB');
    assert.equal(wrangler.d1_databases[0].database_name, 'galvivault-0-5-qa');
    assert.equal(wrangler.d1_databases[0].migrations_dir, 'migrations/day1');
    assert.equal(day7d.main, 'worker/day7d-engine.js');
    assert.equal(day7d.name, 'galvicare-triage-intake');
  });

  test('Production protection keeps Day 1 out of the Production entry and database', () => {
    assert.equal(exists('worker/production-entry.js'), true);
    const production = read('wrangler.production.jsonc');
    assert.match(production, /worker\/production-entry\.js/);
    assert.doesNotMatch(production, /worker\/day1\.js/);
    assert.doesNotMatch(production, /galvivault-0-5-qa/);
    assert.doesNotMatch(production, /cdf9042b-ab09-498a-ac66-010b6cce47d4/);
  });

  test('migration is additive, namespaced, repeatable, and complete', () => {
    const sql = read('migrations/day1/0001_canonical_business_medical_record.sql');
    assert.doesNotMatch(sql, /\b(DROP|TRUNCATE)\b/i);
    assert.match(sql, /gv1_schema_migrations/);
    const sqlite = new DatabaseSync(':memory:');
    sqlite.exec(sql);
    sqlite.exec(sql);
    const expectedTables = [
      'gv1_schema_migrations','gv1_founders','gv1_ventures','gv1_founder_venture_roles',
      'gv1_business_medical_records','gv1_assessment_sessions','gv1_question_definitions',
      'gv1_assessment_answers','gv1_evidence_items','gv1_evidence_relationships',
      'gv1_observations','gv1_observation_evidence','gv1_hypotheses',
      'gv1_hypothesis_observations','gv1_findings','gv1_finding_evidence',
      'gv1_finding_observations','gv1_finding_hypotheses','gv1_recommendations',
      'gv1_recommendation_findings','gv1_treatment_plans','gv1_treatment_plan_items',
      'gv1_treatment_events','gv1_outcomes','gv1_outcome_evidence','gv1_feedback',
      'gv1_learning_candidates','gv1_knowledge_items','gv1_journey_events','gv1_audit_log',
      'gv1_idempotency_keys','gv1_adapter_deliveries','gv1_import_batches',
      'gv1_import_errors','gv1_application_errors'
    ];
    const tables = new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name));
    for (const table of expectedTables) assert.equal(tables.has(table), true, `missing table ${table}`);
    const migration = sqlite.prepare('SELECT migration_id, environment FROM gv1_schema_migrations').get();
    assert.deepEqual({ ...migration }, { migration_id: '0001', environment: 'qa' });
    const triggers = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='trigger'").all().map((row) => row.name);
    assert.ok(triggers.includes('trg_gv1_journey_events_no_update'));
    assert.ok(triggers.includes('trg_gv1_audit_log_no_delete'));
  });

  test('migration coexists with incompatible legacy GalviCare table names and data', () => {
    const { sqlite } = migratedDatabase({ withLegacyTables: true });
    assert.equal(sqlite.prepare('SELECT email FROM founders WHERE founder_id=?').get('legacy_founder').email, 'legacy@example.com');
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name LIKE 'gv1_%'").get().n, 35);
  });

  test('health is canonical, QA-only, and does not expose database identity', async () => {
    const { env } = environment();
    const { response, payload } = await call('/health', { env });
    assert.equal(response.status, 200);
    assert.equal(payload.data.service, SERVICE);
    assert.equal(payload.data.schema_namespace, TABLE_PREFIX);
    assert.equal(payload.environment, 'qa');
    assert.equal(response.headers.get('x-galvivault-environment'), 'qa');
    assert.equal(JSON.stringify(payload).includes('cdf9042b'), false);
  });

  test('readiness and schema version agree with the namespaced migration ledger', async () => {
    const { env } = environment();
    const readyResult = await call('/ready', { env });
    assert.equal(readyResult.response.status, 200);
    assert.equal(readyResult.payload.data.current_schema_version, REQUIRED_SCHEMA);
    assert.equal(readyResult.payload.data.present_table_count, readyResult.payload.data.required_table_count);
    const schema = await call('/api/v1/schema-version', { env });
    assert.equal(schema.response.status, 200);
    assert.equal(schema.payload.data.compatible, true);
    assert.equal(schema.payload.data.current_schema_version, REQUIRED_SCHEMA);
  });

  test('CORS grants only exact approved origins', async () => {
    const { env } = environment();
    for (const approved of ['https://galvipro.com', 'https://www.galvipro.com']) {
      const result = await call('/health', { env, origin: approved });
      assert.equal(result.response.headers.get('access-control-allow-origin'), approved);
    }
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

  test('session create, replay, get, audit, and actual idempotency key persist correctly', async () => {
    const { env, sqlite } = environment();
    const body = syntheticContext('session_001');
    const created = await call('/api/v1/sessions', {
      method: 'POST', env, body, idempotencyKey: 'day1-session-key-001'
    });
    assert.equal(created.response.status, 201);
    const replay = await call('/api/v1/sessions', {
      method: 'POST', env, body, idempotencyKey: 'day1-session-key-001'
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.meta.idempotent_replay, true);
    const mismatch = await call('/api/v1/sessions', {
      method: 'POST', env, body: { ...body, venture_name: 'Changed' }, idempotencyKey: 'day1-session-key-001'
    });
    assert.equal(mismatch.response.status, 409);
    assert.equal(mismatch.payload.error.code, 'GV_IDEMPOTENCY_REUSE_MISMATCH');
    const fetched = await call(`/api/v1/sessions/${body.session_id}`, { env });
    assert.equal(fetched.payload.data.session.session_id, body.session_id);
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_assessment_sessions WHERE session_id=?').get(body.session_id).n, 1);
    assert.equal(sqlite.prepare("SELECT idempotency_key FROM gv1_idempotency_keys WHERE scope='session:create'").get().idempotency_key, 'day1-session-key-001');
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM gv1_audit_log WHERE entity_type='assessment_session'").get().n, 1);
  });

  test('journey event create, replay, and mismatch are idempotent', async () => {
    const { env, sqlite } = environment();
    const session = syntheticContext('event_001');
    await call('/api/v1/sessions', {
      method: 'POST', env, body: session, idempotencyKey: 'day1-session-event-001'
    });
    const body = {
      event_key: `day1:${session.session_id}:triage_opened:001`,
      session_id: session.session_id,
      event_name: 'triage_opened',
      product: 'GalviTriage',
      current_stage: 'GalviTriage',
      metadata: { fixture: true }
    };
    const created = await call('/api/v1/journey-events', {
      method: 'POST', env, body, idempotencyKey: 'day1-event-key-001'
    });
    assert.equal(created.response.status, 201);
    const replay = await call('/api/v1/journey-events', {
      method: 'POST', env, body, idempotencyKey: 'day1-event-key-001'
    });
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.meta.idempotent_replay, true);
    const mismatch = await call('/api/v1/journey-events', {
      method: 'POST', env, body: { ...body, event_name: 'changed' }, idempotencyKey: 'day1-event-key-001'
    });
    assert.equal(mismatch.response.status, 409);
    assert.equal(mismatch.payload.error.code, 'GV_IDEMPOTENCY_REUSE_MISMATCH');
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_journey_events WHERE event_key=?').get(body.event_key).n, 1);
    assert.equal(sqlite.prepare("SELECT idempotency_key FROM gv1_idempotency_keys WHERE scope='journey-event:create'").get().idempotency_key, 'day1-event-key-001');
  });

  test('fixture is deterministic in QA and unavailable under Production policy', async () => {
    const firstEnv = environment();
    const secondEnv = environment();
    const a = await call('/api/v1/fixtures/results', { method: 'POST', env: firstEnv.env, body: {} });
    const b = await call('/api/v1/fixtures/results', { method: 'POST', env: secondEnv.env, body: {} });
    assert.deepEqual(a.payload.data.fixture, b.payload.data.fixture);
    assert.deepEqual(a.payload.data.fixture, FIXTURE);
    const production = environment({ ENVIRONMENT: 'production', FIXTURE_MODE: 'false' });
    const denied = await call('/api/v1/fixtures/results', { method: 'POST', env: production.env, body: {} });
    assert.equal(denied.response.status, 404);
    assert.equal(denied.payload.error.code, 'GV_FIXTURE_DISABLED');
  });

  test('invalid route, payload, and unknown session return safe canonical errors', async () => {
    const { env } = environment();
    const unknownRoute = await call('/unknown', { env });
    assert.equal(unknownRoute.response.status, 404);
    assert.equal(unknownRoute.payload.error.code, 'GV_NOT_FOUND');
    const invalid = await call('/api/v1/sessions', {
      method: 'POST', env, body: {}, idempotencyKey: 'invalid-001'
    });
    assert.equal(invalid.response.status, 422);
    assert.equal(invalid.payload.error.code, 'GV_REQ_SCHEMA');
    const missing = await call('/api/v1/sessions/ses_day1_missing_001', { env });
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
