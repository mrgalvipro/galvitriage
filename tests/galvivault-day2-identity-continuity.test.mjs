import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import worker from '../worker/day2.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');

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
      meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid || 0) }
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

function environment(overrides = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(read('migrations/day1/0001_canonical_business_medical_record.sql'));
  sqlite.exec(read('migrations/day1/0002_day2_identity_continuity.sql'));
  return {
    sqlite,
    env: {
      ENVIRONMENT: 'qa',
      FIXTURE_MODE: 'true',
      API_VERSION: 'v1',
      MIN_SCHEMA_VERSION: '0002',
      ALLOWED_ORIGINS: 'https://galvipro.com,http://localhost:8787',
      DB: new D1DatabaseMock(sqlite),
      ...overrides
    }
  };
}

async function call(pathname, {
  env,
  method = 'GET',
  body,
  key,
  origin = 'https://galvipro.com',
  correlation = `corr_${Date.now()}_${Math.random().toString(16).slice(2)}`
} = {}) {
  const headers = new Headers({ 'X-Correlation-Id': correlation });
  if (origin) headers.set('Origin', origin);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (key) headers.set('Idempotency-Key', key);
  const request = new Request(`https://day2.test${pathname}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const response = await worker.fetch(request, env);
  const payload = response.status === 204 ? null : await response.json();
  return { response, payload };
}

function sessionPayload(suffix = '001', overrides = {}) {
  return {
    client_session_key: `d2-session-${suffix}`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: {
      email: `founder.${suffix}@example.test`,
      first_name: 'Day',
      last_name: 'Two',
      consent_status: 'approved'
    },
    venture: {
      venture_name: `Canonical Venture ${suffix}`,
      stage: 'ideation',
      industry: 'business-services',
      role_code: 'founder',
      is_primary: true
    },
    ...overrides
  };
}

function identity(result) {
  return result.payload.data.identity;
}

test('Day 2 migration is additive and enforces identity continuity constraints', () => {
  const sql = read('migrations/day1/0002_day2_identity_continuity.sql');
  assert.doesNotMatch(sql, /\b(DROP|TRUNCATE)\b/i);
  const { sqlite } = environment();
  const migration = sqlite.prepare("SELECT migration_id FROM gv1_schema_migrations WHERE migration_id='0002'").get();
  assert.equal(migration.migration_id, '0002');
  const indexes = new Set(sqlite.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map((row) => row.name));
  for (const name of [
    'ux_gv1_founders_normalized_email',
    'ux_gv1_bmr_one_per_venture',
    'ux_gv1_roles_one_active_primary'
  ]) assert.equal(indexes.has(name), true, `missing ${name}`);
});

test('Day 2 readiness proves migration 0002 and required constraints', async () => {
  const { env } = environment();
  const result = await call('/api/v1/day2/readiness', { env });
  assert.equal(result.response.status, 200);
  assert.equal(result.payload.data.ready, true);
  assert.equal(result.payload.data.current_schema_version, '0002');
});

test('new identity, exact replay, and refresh retrieval preserve one canonical identity set', async () => {
  const { env, sqlite } = environment();
  const body = sessionPayload('new');
  const created = await call('/api/v1/sessions', {
    env, method: 'POST', body, key: 'd2-session-new-001'
  });
  assert.equal(created.response.status, 201);
  const first = identity(created);
  const replay = await call('/api/v1/sessions', {
    env, method: 'POST', body, key: 'd2-session-new-001'
  });
  assert.equal(replay.response.status, 200);
  assert.equal(replay.payload.meta.idempotent_replay, true);
  assert.deepEqual(identity(replay), first);
  const fetched = await call(`/api/v1/sessions/${first.session.session_id}`, { env });
  assert.equal(fetched.response.status, 200);
  assert.equal(fetched.payload.data.identity.founder.founder_id, first.founder.founder_id);
  assert.equal(fetched.payload.data.identity.venture.venture_id, first.venture.venture_id);
  assert.equal(fetched.payload.data.identity.business_medical_record.bmr_id, first.business_medical_record.bmr_id);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_founders').get().n, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_ventures').get().n, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_business_medical_records').get().n, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_assessment_sessions').get().n, 1);
});

test('email case and whitespace variation resolve the same Founder', async () => {
  const { env, sqlite } = environment();
  const first = await call('/api/v1/founders', {
    env,
    method: 'POST',
    key: 'd2-founder-case-001',
    body: { email: ' Founder.Case@Example.Test ', first_name: 'Case', source: 'galvicare' }
  });
  const second = await call('/api/v1/founders', {
    env,
    method: 'POST',
    key: 'd2-founder-case-002',
    body: { email: 'founder.case@example.test', first_name: 'Ignored', source: 'galvicare' }
  });
  assert.equal(first.response.status, 201);
  assert.equal(second.response.status, 200);
  assert.equal(first.payload.data.founder.founder_id, second.payload.data.founder.founder_id);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM gv1_founders WHERE normalized_email='founder.case@example.test'").get().n, 1);
});

test('new session reuses Founder, Venture, and BMR while changing only session_id', async () => {
  const { env, sqlite } = environment();
  const firstResult = await call('/api/v1/sessions', {
    env, method: 'POST', body: sessionPayload('continuity'), key: 'd2-continuity-001'
  });
  const first = identity(firstResult);
  const secondBody = {
    client_session_key: 'd2-session-continuity-002',
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: { founder_id: first.founder.founder_id, email: first.founder.email },
    venture: { venture_id: first.venture.venture_id, role_code: 'founder' },
    bmr_id: first.business_medical_record.bmr_id
  };
  const secondResult = await call('/api/v1/sessions', {
    env, method: 'POST', body: secondBody, key: 'd2-continuity-002'
  });
  assert.equal(secondResult.response.status, 201);
  const second = identity(secondResult);
  assert.equal(second.founder.founder_id, first.founder.founder_id);
  assert.equal(second.venture.venture_id, first.venture.venture_id);
  assert.equal(second.business_medical_record.bmr_id, first.business_medical_record.bmr_id);
  assert.notEqual(second.session.session_id, first.session.session_id);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_assessment_sessions').get().n, 2);
});

test('same Founder can create a second Venture with its own BMR and Session', async () => {
  const { env, sqlite } = environment();
  const firstResult = await call('/api/v1/sessions', {
    env, method: 'POST', body: sessionPayload('multi'), key: 'd2-multi-001'
  });
  const first = identity(firstResult);
  const secondResult = await call('/api/v1/sessions', {
    env,
    method: 'POST',
    key: 'd2-multi-002',
    body: {
      client_session_key: 'd2-session-multi-002',
      source: 'galvicare',
      founder: { founder_id: first.founder.founder_id, email: first.founder.email },
      venture: { venture_name: 'Second Canonical Venture', stage: 'validation', role_code: 'founder' }
    }
  });
  const second = identity(secondResult);
  assert.equal(second.founder.founder_id, first.founder.founder_id);
  assert.notEqual(second.venture.venture_id, first.venture.venture_id);
  assert.notEqual(second.business_medical_record.bmr_id, first.business_medical_record.bmr_id);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_founders').get().n, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_ventures').get().n, 2);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_business_medical_records').get().n, 2);
});

test('Venture update is versioned, no-op safe, and stale-version safe', async () => {
  const { env, sqlite } = environment();
  const created = identity(await call('/api/v1/sessions', {
    env, method: 'POST', body: sessionPayload('version'), key: 'd2-version-create'
  }));
  const ventureId = created.venture.venture_id;
  const bmrId = created.business_medical_record.bmr_id;
  const changed = await call(`/api/v1/ventures/${ventureId}`, {
    env,
    method: 'PATCH',
    key: 'd2-version-update-001',
    body: { expected_version: 1, venture_name: 'Canonical Venture Corrected', stage: 'validation', source: 'operator' }
  });
  assert.equal(changed.response.status, 200);
  assert.equal(changed.payload.data.venture.venture_id, ventureId);
  assert.equal(changed.payload.data.bmr_id, bmrId);
  assert.equal(changed.payload.data.venture.record_version, 2);
  const auditCount = sqlite.prepare("SELECT COUNT(*) AS n FROM gv1_audit_log WHERE entity_type='venture' AND entity_id=? AND operation='update'").get(ventureId).n;
  assert.equal(auditCount, 1);

  const noChange = await call(`/api/v1/ventures/${ventureId}`, {
    env,
    method: 'PATCH',
    key: 'd2-version-noop-001',
    body: { expected_version: 2, venture_name: 'Canonical Venture Corrected', stage: 'validation', source: 'operator' }
  });
  assert.equal(noChange.response.status, 200);
  assert.equal(noChange.payload.status, 'no_change');
  assert.equal(sqlite.prepare('SELECT record_version FROM gv1_ventures WHERE venture_id=?').get(ventureId).record_version, 2);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM gv1_audit_log WHERE entity_type='venture' AND entity_id=? AND operation='update'").get(ventureId).n, 1);

  const stale = await call(`/api/v1/ventures/${ventureId}`, {
    env,
    method: 'PATCH',
    key: 'd2-version-stale-001',
    body: { expected_version: 1, stage: 'growth', source: 'operator' }
  });
  assert.equal(stale.response.status, 409);
  assert.equal(stale.payload.error.code, 'GV_VERSION_CONFLICT');
  assert.equal(sqlite.prepare('SELECT record_version FROM gv1_ventures WHERE venture_id=?').get(ventureId).record_version, 2);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM gv1_audit_log WHERE entity_type='venture' AND entity_id=? AND operation='update'").get(ventureId).n, 1);
});

test('idempotency-key reuse, privilege injection, and cross-scope mismatch produce no mutation', async () => {
  const { env, sqlite } = environment();
  const first = identity(await call('/api/v1/sessions', {
    env, method: 'POST', body: sessionPayload('negative-a'), key: 'd2-negative-create-a'
  }));
  const second = identity(await call('/api/v1/sessions', {
    env, method: 'POST', body: sessionPayload('negative-b'), key: 'd2-negative-create-b'
  }));
  const beforeSessions = sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_assessment_sessions').get().n;
  const reuse = await call('/api/v1/founders', {
    env,
    method: 'POST',
    key: 'd2-reuse-key',
    body: { email: 'reuse.one@example.test', source: 'galvicare' }
  });
  assert.equal(reuse.response.status, 201);
  const reuseConflict = await call('/api/v1/founders', {
    env,
    method: 'POST',
    key: 'd2-reuse-key',
    body: { email: 'reuse.two@example.test', source: 'galvicare' }
  });
  assert.equal(reuseConflict.response.status, 409);
  assert.equal(reuseConflict.payload.error.code, 'GV_IDEMPOTENCY_KEY_REUSE');

  const privilege = await call(`/api/v1/ventures/${first.venture.venture_id}/founder-roles`, {
    env,
    method: 'POST',
    key: 'd2-privilege-001',
    body: { founder_id: first.founder.founder_id, role_code: 'admin', is_primary: true }
  });
  assert.equal(privilege.response.status, 403);
  assert.equal(privilege.payload.error.code, 'GV_FORBIDDEN');

  const mismatch = await call('/api/v1/sessions', {
    env,
    method: 'POST',
    key: 'd2-scope-001',
    body: {
      client_session_key: 'd2-session-scope-001',
      source: 'galvicare',
      founder: { founder_id: first.founder.founder_id, email: first.founder.email },
      venture: { venture_id: first.venture.venture_id, role_code: 'founder' },
      bmr_id: second.business_medical_record.bmr_id
    }
  });
  assert.equal(mismatch.response.status, 409);
  assert.equal(mismatch.payload.error.code, 'GV_SCOPE_MISMATCH');
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_assessment_sessions').get().n, beforeSessions);
});

test('one BMR per Venture is enforced independently of idempotency key', async () => {
  const { env, sqlite } = environment();
  const created = identity(await call('/api/v1/sessions', {
    env, method: 'POST', body: sessionPayload('bmr'), key: 'd2-bmr-session-001'
  }));
  const first = await call('/api/v1/business-medical-records', {
    env,
    method: 'POST',
    key: 'd2-bmr-create-001',
    body: { venture_id: created.venture.venture_id, source: 'galvicare' }
  });
  const second = await call('/api/v1/business-medical-records', {
    env,
    method: 'POST',
    key: 'd2-bmr-create-002',
    body: { venture_id: created.venture.venture_id, source: 'galvicare' }
  });
  assert.equal(first.response.status, 200);
  assert.equal(second.response.status, 200);
  assert.equal(first.payload.data.business_medical_record.bmr_id, created.business_medical_record.bmr_id);
  assert.equal(second.payload.data.business_medical_record.bmr_id, created.business_medical_record.bmr_id);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM gv1_business_medical_records WHERE venture_id=?').get(created.venture.venture_id).n, 1);
});

test('Day 2 CORS and missing DB failures remain safe JSON', async () => {
  const first = environment();
  const denied = await call('/api/v1/day2/readiness', { env: first.env, origin: 'https://attacker.example' });
  assert.equal(denied.response.status, 403);
  assert.equal(denied.response.headers.get('access-control-allow-origin'), null);
  const missing = environment({ DB: undefined });
  const unavailable = await call('/api/v1/day2/readiness', { env: missing.env });
  assert.equal(unavailable.response.status, 503);
  assert.equal(unavailable.payload.error.code, 'GV_NOT_READY');
  assert.equal(JSON.stringify(unavailable.payload).includes('stack'), false);
  assert.equal(JSON.stringify(unavailable.payload).includes('SQLITE'), false);
});
