const SERVICE = 'galvivault-p0';
const API_VERSION = 'v1';
const REQUIRED_SCHEMA = '0001';
const FIXTURE = Object.freeze({
  fixture_id: 'galvivault-day1-fixture-v1',
  founder_id: 'fdr_day1_fixture_001',
  venture_id: 'ven_day1_fixture_001',
  bmr_id: 'bmr_day1_fixture_001',
  session_id: 'ses_day1_fixture_001',
  venture_name: 'Day 1 Synthetic Venture',
  source: 'galvicare',
  current_stage: 'GalviTriage'
});

class GVError extends Error {
  constructor(code, message, status = 400, details = undefined, retryable = false) {
    super(message);
    this.name = 'GVError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.retryable = retryable;
  }
}

const now = () => new Date().toISOString();
const text = (value) => String(value ?? '').trim();
const bool = (value) => String(value ?? '').toLowerCase() === 'true';
const id = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const safeId = (value) => /^[A-Za-z0-9:_-]{3,128}$/.test(text(value));
const correlationId = (request) => {
  const supplied = text(request.headers.get('X-Correlation-Id'));
  return safeId(supplied) ? supplied : id('corr');
};

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

async function fingerprint(scope, value) {
  const payload = new TextEncoder().encode(`${scope}:${JSON.stringify(canonicalize(value))}`);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function runtime(env) {
  return {
    environment: text(env?.ENVIRONMENT || 'unknown').toLowerCase(),
    fixtureMode: bool(env?.FIXTURE_MODE),
    apiVersion: text(env?.API_VERSION || API_VERSION),
    minimumSchema: text(env?.MIN_SCHEMA_VERSION || REQUIRED_SCHEMA),
    allowedOrigins: text(env?.ALLOWED_ORIGINS).split(',').map((item) => item.trim()).filter(Boolean),
    db: env?.DB
  };
}

function assertQaRuntime(config) {
  if (!['qa', 'local'].includes(config.environment)) {
    throw new GVError('GV_ENV_MISCONFIGURED', 'The Day 1 Worker is restricted to QA or local execution.', 503, undefined, false);
  }
  if (!config.db || typeof config.db.prepare !== 'function') {
    throw new GVError('GV_DB_UNAVAILABLE', 'The GalviVault database binding is unavailable.', 503, undefined, true);
  }
}

function allowedOrigin(request, config) {
  const origin = text(request.headers.get('Origin'));
  if (!origin) return { origin: null, allowed: true };
  return { origin, allowed: config.allowedOrigins.includes(origin) };
}

function responseHeaders(config, corr, originState, extra = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-GalviVault-Environment': config.environment,
    'X-GalviVault-Api-Version': config.apiVersion || API_VERSION,
    'X-Correlation-Id': corr,
    'Vary': 'Origin',
    ...extra
  });
  if (originState?.origin && originState.allowed) {
    headers.set('Access-Control-Allow-Origin', originState.origin);
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, X-Correlation-Id');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Max-Age', '600');
  }
  return headers;
}

function success(config, corr, originState, data, status = 200, state = 'ok', meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    status: state,
    environment: config.environment,
    correlation_id: corr,
    data,
    meta: {
      api_version: config.apiVersion || API_VERSION,
      schema_version: meta.schema_version ?? REQUIRED_SCHEMA,
      record_version: meta.record_version ?? null,
      idempotent_replay: Boolean(meta.idempotent_replay),
      ...meta
    }
  }), { status, headers: responseHeaders(config, corr, originState) });
}

function failure(config, corr, originState, error) {
  const known = error instanceof GVError;
  const safe = known ? error : new GVError('GV_INTERNAL', 'An unexpected error occurred.', 500, undefined, true);
  return new Response(JSON.stringify({
    success: false,
    status: safe.status === 404 ? 'not_found' : safe.status === 409 ? 'conflict' : safe.status === 503 ? 'unavailable' : safe.status >= 500 ? 'internal_error' : 'invalid_request',
    environment: config.environment,
    correlation_id: corr,
    error: {
      code: safe.code,
      message: safe.message,
      retryable: Boolean(safe.retryable),
      ...(safe.details ? { details: safe.details } : {})
    },
    meta: { api_version: config.apiVersion || API_VERSION, schema_version: REQUIRED_SCHEMA }
  }), { status: safe.status, headers: responseHeaders(config, corr, originState) });
}

async function parseJson(request) {
  if (!text(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) {
    throw new GVError('GV_REQ_CONTENT_TYPE', 'Content-Type must be application/json.', 415);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    throw new GVError('GV_REQ_BODY_INVALID', 'The request body must be valid JSON.', 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new GVError('GV_REQ_BODY_INVALID', 'The request body must be a JSON object.', 400);
  }
  return body;
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !text(body[field]));
  if (missing.length) {
    throw new GVError('GV_REQ_SCHEMA', 'Required fields are missing.', 422, {
      fields: missing.map((field) => ({ field, issue: 'required' }))
    });
  }
}

function requireIdempotencyHeader(request) {
  const key = text(request.headers.get('Idempotency-Key'));
  if (!key || !/^[A-Za-z0-9:._-]{1,128}$/.test(key)) {
    throw new GVError('GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key header is required.', 400);
  }
  return key;
}

const first = async (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const all = async (db, sql, ...params) => db.prepare(sql).bind(...params).all();
const run = async (db, sql, ...params) => db.prepare(sql).bind(...params).run();

async function schemaState(config) {
  assertQaRuntime(config);
  try {
    await first(config.db, 'SELECT 1 AS ok');
    const row = await first(config.db, 'SELECT migration_id, name, environment, applied_at FROM schema_migrations ORDER BY migration_id DESC LIMIT 1');
    const current = text(row?.migration_id);
    return {
      ready: Boolean(current && current.localeCompare(config.minimumSchema, undefined, { numeric: true }) >= 0),
      current,
      required: config.minimumSchema,
      migration: row || null
    };
  } catch {
    throw new GVError('GV_DB_UNAVAILABLE', 'The GalviVault database or migration ledger is unavailable.', 503, undefined, true);
  }
}

async function handleHealth(config, corr, originState) {
  return success(config, corr, originState, {
    service: SERVICE,
    timestamp: now(),
    environment: config.environment,
    database_bound: Boolean(config.db),
    fixture_mode: config.fixtureMode,
    api_version: config.apiVersion || API_VERSION,
    required_schema_version: config.minimumSchema
  });
}

async function handleReady(config, corr, originState) {
  const state = await schemaState(config);
  if (!state.ready) {
    throw new GVError('GV_DB_SCHEMA_OUTDATED', 'The GalviVault schema does not meet the Day 1 minimum.', 503, {
      current_schema_version: state.current || null,
      required_schema_version: state.required
    });
  }
  return success(config, corr, originState, {
    service: SERVICE,
    ready: true,
    database: true,
    current_schema_version: state.current,
    required_schema_version: state.required
  }, 200, 'ok', { schema_version: state.current });
}

async function handleSchemaVersion(config, corr, originState) {
  const state = await schemaState(config);
  return success(config, corr, originState, {
    current_schema_version: state.current || null,
    required_schema_version: state.required,
    compatible: state.ready,
    migration: state.migration
  }, state.ready ? 200 : 503, state.ready ? 'ok' : 'unavailable', { schema_version: state.current || REQUIRED_SCHEMA });
}

function validateFixtureSession(body) {
  requireFields(body, ['session_id', 'founder_id', 'venture_id', 'bmr_id', 'source', 'current_stage']);
  for (const field of ['session_id', 'founder_id', 'venture_id', 'bmr_id']) {
    if (!safeId(body[field])) throw new GVError('GV_REQ_SCHEMA', `${field} is invalid.`, 422, { fields: [{ field, issue: 'invalid' }] });
  }
  const required = {
    founder_id: FIXTURE.founder_id,
    venture_id: FIXTURE.venture_id,
    bmr_id: FIXTURE.bmr_id
  };
  for (const [field, expected] of Object.entries(required)) {
    if (text(body[field]) !== expected) {
      throw new GVError('GV_REQ_SCHEMA', 'Day 1 accepts only the approved synthetic fixture context.', 422, { fields: [{ field, issue: 'fixture_context_required' }] });
    }
  }
  if (text(body.source) !== FIXTURE.source || text(body.current_stage) !== FIXTURE.current_stage) {
    throw new GVError('GV_REQ_SCHEMA', 'The Day 1 fixture source or stage is invalid.', 422);
  }
}

async function loadSession(db, sessionId) {
  return first(db, `SELECT session_id, bmr_id, venture_id, founder_id, client_session_key, source,
    current_stage, status, started_at, completed_at, created_at, updated_at
    FROM assessment_sessions WHERE session_id = ?`, sessionId);
}

async function handleCreateSession(request, config, corr, originState) {
  assertQaRuntime(config);
  if (!config.fixtureMode) throw new GVError('GV_FIXTURE_DISABLED', 'The Day 1 fixture context is disabled.', 404);
  requireIdempotencyHeader(request);
  const body = await parseJson(request);
  validateFixtureSession(body);
  const sessionId = text(body.session_id);
  const requestFingerprint = await fingerprint('session:create', body);
  const existingReceipt = await first(config.db, 'SELECT request_fingerprint FROM idempotency_keys WHERE scope = ? AND idempotency_key = ?', 'session:create', sessionId);
  if (existingReceipt && existingReceipt.request_fingerprint !== requestFingerprint) {
    throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The session business key was reused with a different request.', 409);
  }
  const existing = await loadSession(config.db, sessionId);
  if (existing) {
    if ([existing.bmr_id, existing.venture_id, existing.founder_id, existing.source].join('|') !== [body.bmr_id, body.venture_id, body.founder_id, body.source].join('|')) {
      throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The existing session does not match the requested context.', 409);
    }
    if (!existingReceipt) {
      await run(config.db, `INSERT INTO idempotency_keys
        (idempotency_id, scope, idempotency_key, request_fingerprint, response_status, response_entity_type, response_entity_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, id('idem'), 'session:create', sessionId, requestFingerprint, 200, 'assessment_session', sessionId, now());
    }
    return success(config, corr, originState, { session: existing }, 200, 'resumed', { record_version: 1, idempotent_replay: true });
  }

  const timestamp = now();
  const statements = [
    config.db.prepare(`INSERT OR IGNORE INTO founders
      (founder_id, first_name, last_name, consent_status, status, record_version, created_at, updated_at)
      VALUES (?, ?, ?, 'approved', 'active', 1, ?, ?)`).bind(body.founder_id, 'Day 1', 'Fixture', timestamp, timestamp),
    config.db.prepare(`INSERT OR IGNORE INTO ventures
      (venture_id, venture_name, stage, status, record_version, created_at, updated_at)
      VALUES (?, ?, 'fixture', 'active', 1, ?, ?)`).bind(body.venture_id, FIXTURE.venture_name, timestamp, timestamp),
    config.db.prepare(`INSERT OR IGNORE INTO founder_venture_roles
      (founder_id, venture_id, role_code, is_primary, status, created_at, updated_at)
      VALUES (?, ?, 'founder', 1, 'active', ?, ?)`).bind(body.founder_id, body.venture_id, timestamp, timestamp),
    config.db.prepare(`INSERT OR IGNORE INTO business_medical_records
      (bmr_id, venture_id, status, record_version, current_session_id, opened_at, created_at, updated_at)
      VALUES (?, ?, 'assessment_in_progress', 1, ?, ?, ?, ?)`).bind(body.bmr_id, body.venture_id, sessionId, timestamp, timestamp, timestamp),
    config.db.prepare(`INSERT INTO assessment_sessions
      (session_id, bmr_id, venture_id, founder_id, client_session_key, source, current_stage, status, started_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`).bind(sessionId, body.bmr_id, body.venture_id, body.founder_id, sessionId, body.source, body.current_stage, timestamp, timestamp, timestamp),
    config.db.prepare('UPDATE business_medical_records SET current_session_id = ?, status = ?, updated_at = ? WHERE bmr_id = ?').bind(sessionId, 'assessment_in_progress', timestamp, body.bmr_id),
    config.db.prepare(`INSERT INTO journey_events
      (journey_event_id, event_key, bmr_id, session_id, event_name, product, current_stage, occurred_at, actor_type, metadata_json, correlation_id, environment, created_at)
      VALUES (?, ?, ?, ?, 'session_created', 'GalviTriage', ?, ?, 'service', ?, ?, ?, ?)`).bind(id('jev'), `day1:${sessionId}:session_created`, body.bmr_id, sessionId, body.current_stage, timestamp, JSON.stringify({ fixture: true, source: 'day1-worker' }), corr, config.environment, timestamp),
    config.db.prepare(`INSERT INTO audit_log
      (audit_id, entity_type, entity_id, operation, prior_version, new_version, actor_type, source, reason_code, safe_change_json, correlation_id, environment, occurred_at, created_at)
      VALUES (?, 'assessment_session', ?, 'create', NULL, 1, 'service', 'day1-worker', 'DAY1_SESSION_CREATE', ?, ?, ?, ?, ?)`).bind(id('aud'), sessionId, JSON.stringify({ fixture: true, stage: body.current_stage }), corr, config.environment, timestamp, timestamp),
    config.db.prepare(`INSERT INTO idempotency_keys
      (idempotency_id, scope, idempotency_key, request_fingerprint, response_status, response_entity_type, response_entity_id, created_at)
      VALUES (?, 'session:create', ?, ?, 201, 'assessment_session', ?, ?)`).bind(id('idem'), sessionId, requestFingerprint, sessionId, timestamp)
  ];
  await config.db.batch(statements);
  const created = await loadSession(config.db, sessionId);
  return success(config, corr, originState, { session: created }, 201, 'created', { record_version: 1, idempotent_replay: false });
}

async function handleGetSession(sessionId, config, corr, originState) {
  assertQaRuntime(config);
  if (!safeId(sessionId)) throw new GVError('GV_REQ_SCHEMA', 'session_id is invalid.', 422);
  const session = await loadSession(config.db, sessionId);
  if (!session) throw new GVError('GV_NOT_FOUND', 'The requested session was not found.', 404);
  return success(config, corr, originState, { session }, 200, 'ok', { record_version: 1 });
}

function validateEvent(body) {
  requireFields(body, ['event_key', 'session_id', 'event_name']);
  if (!safeId(body.session_id) || !/^[A-Za-z0-9:._-]{3,180}$/.test(text(body.event_key))) {
    throw new GVError('GV_REQ_SCHEMA', 'The event key or session ID is invalid.', 422);
  }
  if (body.metadata !== undefined && (!body.metadata || typeof body.metadata !== 'object' || Array.isArray(body.metadata))) {
    throw new GVError('GV_REQ_SCHEMA', 'metadata must be a JSON object.', 422);
  }
  if (JSON.stringify(body.metadata || {}).length > 4096) {
    throw new GVError('GV_REQ_SCHEMA', 'metadata exceeds the Day 1 size limit.', 422);
  }
}

async function handleJourneyEvent(request, config, corr, originState) {
  assertQaRuntime(config);
  requireIdempotencyHeader(request);
  const body = await parseJson(request);
  validateEvent(body);
  const session = await loadSession(config.db, text(body.session_id));
  if (!session) throw new GVError('GV_NOT_FOUND', 'The referenced session was not found.', 404);

  const eventKey = text(body.event_key);
  const requestFingerprint = await fingerprint('journey_event:create', body);
  const receipt = await first(config.db, 'SELECT request_fingerprint FROM idempotency_keys WHERE scope = ? AND idempotency_key = ?', 'journey_event:create', eventKey);
  if (receipt && receipt.request_fingerprint !== requestFingerprint) {
    throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The event key was reused with a different request.', 409);
  }
  const existing = await first(config.db, 'SELECT * FROM journey_events WHERE event_key = ?', eventKey);
  if (existing) {
    if (!receipt) {
      throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The event key already exists without a matching receipt.', 409);
    }
    return success(config, corr, originState, { journey_event: existing }, 200, 'no_change', { idempotent_replay: true });
  }

  const timestamp = now();
  const eventId = id('jev');
  const statements = [
    config.db.prepare(`INSERT INTO journey_events
      (journey_event_id, event_key, bmr_id, session_id, event_name, product, current_stage, occurred_at, actor_type, metadata_json, correlation_id, environment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'service', ?, ?, ?, ?)`).bind(eventId, eventKey, session.bmr_id, session.session_id, text(body.event_name), text(body.product) || null, text(body.current_stage) || session.current_stage, text(body.occurred_at) || timestamp, JSON.stringify(body.metadata || {}), corr, config.environment, timestamp),
    config.db.prepare(`INSERT INTO audit_log
      (audit_id, entity_type, entity_id, operation, actor_type, source, reason_code, safe_change_json, correlation_id, environment, occurred_at, created_at)
      VALUES (?, 'journey_event', ?, 'append', 'service', 'day1-worker', 'DAY1_EVENT_APPEND', ?, ?, ?, ?, ?)`).bind(id('aud'), eventId, JSON.stringify({ event_key: eventKey, event_name: text(body.event_name) }), corr, config.environment, timestamp, timestamp),
    config.db.prepare(`INSERT INTO idempotency_keys
      (idempotency_id, scope, idempotency_key, request_fingerprint, response_status, response_entity_type, response_entity_id, created_at)
      VALUES (?, 'journey_event:create', ?, ?, 201, 'journey_event', ?, ?)`).bind(id('idem'), eventKey, requestFingerprint, eventId, timestamp)
  ];
  await config.db.batch(statements);
  const created = await first(config.db, 'SELECT * FROM journey_events WHERE event_key = ?', eventKey);
  return success(config, corr, originState, { journey_event: created }, 201, 'accepted', { idempotent_replay: false });
}

async function handleFixture(config, corr, originState) {
  if (!['qa', 'local'].includes(config.environment) || !config.fixtureMode) {
    throw new GVError('GV_FIXTURE_DISABLED', 'The Day 1 fixture route is unavailable.', 404);
  }
  return success(config, corr, originState, {
    fixture: {
      ...FIXTURE,
      deterministic: true,
      schema_version: REQUIRED_SCHEMA,
      expected_session_request: {
        session_id: FIXTURE.session_id,
        founder_id: FIXTURE.founder_id,
        venture_id: FIXTURE.venture_id,
        bmr_id: FIXTURE.bmr_id,
        source: FIXTURE.source,
        current_stage: FIXTURE.current_stage
      },
      expected_event_request: {
        event_key: `day1:${FIXTURE.session_id}:triage_opened:001`,
        session_id: FIXTURE.session_id,
        event_name: 'triage_opened',
        product: 'GalviTriage',
        current_stage: FIXTURE.current_stage,
        metadata: { fixture: true, source: 'day1-human-e2e' }
      }
    }
  });
}

async function dispatchCompatibility(request, config, corr, originState) {
  const body = await parseJson(request);
  const action = text(body.action);
  const payload = body.payload && typeof body.payload === 'object' ? body.payload : body;
  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');
  const origin = new URL(request.url).origin;
  if (action === 'health') return handleHealth(config, corr, originState);
  if (action === 'readiness') return handleReady(config, corr, originState);
  if (action === 'get_session') return handleGetSession(text(payload.session_id), config, corr, originState);
  if (action === 'fixture_result') return handleFixture(config, corr, originState);
  if (action === 'create_or_resume_session') {
    return handleCreateSession(new Request(`${origin}/api/v1/sessions`, { method: 'POST', headers, body: JSON.stringify(payload) }), config, corr, originState);
  }
  if (action === 'journey_event') {
    return handleJourneyEvent(new Request(`${origin}/api/v1/journey-events`, { method: 'POST', headers, body: JSON.stringify(payload) }), config, corr, originState);
  }
  throw new GVError('GV_NOT_FOUND', 'The requested compatibility action is not supported.', 404);
}

async function route(request, config, corr, originState) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (request.method === 'GET' && path === '/health') return handleHealth(config, corr, originState);
  if (request.method === 'GET' && path === '/ready') return handleReady(config, corr, originState);
  if (request.method === 'GET' && path === '/api/v1/schema-version') return handleSchemaVersion(config, corr, originState);
  if (request.method === 'POST' && path === '/api/v1/sessions') return handleCreateSession(request, config, corr, originState);
  if (request.method === 'GET' && path.startsWith('/api/v1/sessions/')) return handleGetSession(decodeURIComponent(path.slice('/api/v1/sessions/'.length)), config, corr, originState);
  if (request.method === 'POST' && path === '/api/v1/journey-events') return handleJourneyEvent(request, config, corr, originState);
  if (request.method === 'POST' && path === '/api/v1/fixtures/results') return handleFixture(config, corr, originState);
  if (request.method === 'POST' && ['/api', '/api/v1/actions'].includes(path)) return dispatchCompatibility(request, config, corr, originState);
  if (['GET', 'POST'].includes(request.method)) throw new GVError('GV_NOT_FOUND', 'The requested route was not found.', 404);
  throw new GVError('GV_REQ_METHOD_NOT_ALLOWED', 'The request method is not allowed.', 405);
}

export default {
  async fetch(request, env) {
    const config = runtime(env);
    const corr = correlationId(request);
    const originState = allowedOrigin(request, config);
    try {
      if (!originState.allowed) throw new GVError('GV_ORIGIN_FORBIDDEN', 'The request origin is not allowed.', 403);
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: responseHeaders(config, corr, originState) });
      }
      return await route(request, config, corr, originState);
    } catch (error) {
      return failure(config, corr, originState, error);
    }
  }
};

export { API_VERSION, FIXTURE, REQUIRED_SCHEMA, SERVICE };
