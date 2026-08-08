const SERVICE = 'galvivault-p0';
const API_VERSION = 'v1';
const REQUIRED_SCHEMA = '0001';
const TABLE_PREFIX = 'gv1_';

const FIXTURE = Object.freeze({
  fixture_id: 'galvivault-day1-fixture-v1',
  deterministic: true,
  source: 'galvicare',
  current_stage: 'GalviTriage',
  result: {
    status: 'foundation_ready',
    schema_version: REQUIRED_SCHEMA,
    record_version: 1,
    evidence_version: 1
  }
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
const clean = (value) => String(value ?? '').trim();
const enabled = (value) => clean(value).toLowerCase() === 'true';
const newId = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const SAFE_ID = /^[A-Za-z0-9:._-]{3,160}$/;
const safeId = (value) => SAFE_ID.test(clean(value));

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

async function fingerprint(scope, value) {
  const encoded = new TextEncoder().encode(`${scope}:${JSON.stringify(canonicalize(value))}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function runtime(env) {
  return {
    environment: clean(env?.ENVIRONMENT || 'unknown').toLowerCase(),
    fixtureMode: enabled(env?.FIXTURE_MODE),
    apiVersion: clean(env?.API_VERSION || API_VERSION),
    minimumSchema: clean(env?.MIN_SCHEMA_VERSION || REQUIRED_SCHEMA),
    allowedOrigins: clean(env?.ALLOWED_ORIGINS)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    db: env?.DB
  };
}

function correlationId(request) {
  const supplied = clean(request.headers.get('X-Correlation-Id'));
  return safeId(supplied) ? supplied : newId('corr');
}

function requireQa(config) {
  if (!['qa', 'local', 'production'].includes(config.environment)) {
    throw new GVError(
      'GV_ENV_MISCONFIGURED',
      'The GalviVault Day 1 Worker is restricted to QA or local execution.',
      503
    );
  }
}

function requireDb(config) {
  requireQa(config);
  if (!config.db || typeof config.db.prepare !== 'function') {
    throw new GVError(
      'GV_DB_UNAVAILABLE',
      'The GalviVault database binding is unavailable.',
      503,
      undefined,
      true
    );
  }
}

function originState(request, config) {
  const origin = clean(request.headers.get('Origin'));
  if (!origin) return { origin: null, allowed: true };
  return { origin, allowed: config.allowedOrigins.includes(origin) };
}

function headers(config, corr, origin, extra = {}) {
  const output = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-GalviVault-Environment': config.environment,
    'X-GalviVault-Api-Version': config.apiVersion || API_VERSION,
    'X-Correlation-Id': corr,
    'Vary': 'Origin',
    ...extra
  });
  if (origin?.origin && origin.allowed) {
    output.set('Access-Control-Allow-Origin', origin.origin);
    output.set('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, X-Correlation-Id');
    output.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    output.set('Access-Control-Max-Age', '600');
  }
  return output;
}

function ok(config, corr, origin, data, status = 200, state = 'ok', meta = {}) {
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
  }), { status, headers: headers(config, corr, origin) });
}

function fail(config, corr, origin, error) {
  const safe = error instanceof GVError
    ? error
    : new GVError('GV_INTERNAL', 'An unexpected error occurred.', 500, undefined, true);
  const state = safe.status === 404
    ? 'not_found'
    : safe.status === 409
      ? 'conflict'
      : safe.status === 503
        ? 'unavailable'
        : safe.status >= 500
          ? 'internal_error'
          : 'invalid_request';
  return new Response(JSON.stringify({
    success: false,
    status: state,
    environment: config.environment,
    correlation_id: corr,
    error: {
      code: safe.code,
      message: safe.message,
      retryable: Boolean(safe.retryable),
      ...(safe.details ? { details: safe.details } : {})
    },
    meta: {
      api_version: config.apiVersion || API_VERSION,
      schema_version: REQUIRED_SCHEMA
    }
  }), { status: safe.status, headers: headers(config, corr, origin) });
}

async function jsonBody(request) {
  if (!clean(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) {
    throw new GVError('GV_REQ_CONTENT_TYPE', 'Content-Type must be application/json.', 415);
  }
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('object required');
    return parsed;
  } catch {
    throw new GVError('GV_REQ_BODY_INVALID', 'The request body must be a JSON object.', 400);
  }
}

function idempotencyKey(request) {
  const key = clean(request.headers.get('Idempotency-Key'));
  if (!key || !SAFE_ID.test(key)) {
    throw new GVError('GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key header is required.', 400);
  }
  return key;
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !clean(body[field]));
  if (missing.length) {
    throw new GVError('GV_REQ_SCHEMA', 'Required fields are missing.', 422, {
      fields: missing.map((field) => ({ field, issue: 'required' }))
    });
  }
}

function requireSyntheticId(field, value, prefix) {
  const normalized = clean(value);
  if (!safeId(normalized) || !normalized.startsWith(prefix)) {
    throw new GVError('GV_REQ_SCHEMA', `${field} must use the approved Day 1 synthetic prefix.`, 422, {
      fields: [{ field, issue: `must_start_with_${prefix}` }]
    });
  }
  return normalized;
}

const first = async (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const all = async (db, sql, ...params) => db.prepare(sql).bind(...params).all();

async function schemaState(config) {
  requireDb(config);
  try {
    await first(config.db, 'SELECT 1 AS ok');
    const row = await first(
      config.db,
      `SELECT migration_id, name, environment, applied_at
       FROM gv1_schema_migrations
       ORDER BY migration_id DESC
       LIMIT 1`
    );
    const current = clean(row?.migration_id);
    const requiredTables = [
      'gv1_founders',
      'gv1_ventures',
      'gv1_business_medical_records',
      'gv1_assessment_sessions',
      'gv1_journey_events',
      'gv1_audit_log',
      'gv1_idempotency_keys'
    ];
    const placeholders = requiredTables.map(() => '?').join(',');
    const tableResult = await all(
      config.db,
      `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${placeholders})`,
      ...requiredTables
    );
    const tableCount = Array.isArray(tableResult?.results) ? tableResult.results.length : 0;
    const compatible = Boolean(
      current &&
      current.localeCompare(config.minimumSchema, undefined, { numeric: true }) >= 0 &&
      tableCount === requiredTables.length
    );
    return {
      ready: compatible,
      current,
      required: config.minimumSchema,
      migration: row || null,
      required_table_count: requiredTables.length,
      present_table_count: tableCount
    };
  } catch (error) {
    if (error instanceof GVError) throw error;
    throw new GVError(
      'GV_DB_UNAVAILABLE',
      'The GalviVault database or Day 1 migration ledger is unavailable.',
      503,
      undefined,
      true
    );
  }
}

async function health(config, corr, origin) {
  requireQa(config);
  return ok(config, corr, origin, {
    service: SERVICE,
    timestamp: now(),
    environment: config.environment,
    database_bound: Boolean(config.db),
    fixture_mode: config.fixtureMode,
    api_version: config.apiVersion || API_VERSION,
    required_schema_version: config.minimumSchema,
    schema_namespace: TABLE_PREFIX
  });
}

async function ready(config, corr, origin) {
  const state = await schemaState(config);
  if (!state.ready) {
    throw new GVError('GV_DB_SCHEMA_OUTDATED', 'The GalviVault schema does not meet the Day 1 minimum.', 503, {
      current_schema_version: state.current || null,
      required_schema_version: state.required,
      required_table_count: state.required_table_count,
      present_table_count: state.present_table_count
    });
  }
  return ok(config, corr, origin, {
    service: SERVICE,
    ready: true,
    database: true,
    current_schema_version: state.current,
    required_schema_version: state.required,
    required_table_count: state.required_table_count,
    present_table_count: state.present_table_count
  }, 200, 'ok', { schema_version: state.current });
}

async function schemaVersion(config, corr, origin) {
  const state = await schemaState(config);
  if (!state.ready) {
    throw new GVError('GV_DB_SCHEMA_OUTDATED', 'The GalviVault schema does not meet the Day 1 minimum.', 503, {
      current_schema_version: state.current || null,
      required_schema_version: state.required,
      required_table_count: state.required_table_count,
      present_table_count: state.present_table_count
    });
  }
  return ok(config, corr, origin, {
    current_schema_version: state.current,
    required_schema_version: state.required,
    compatible: true,
    migration: state.migration,
    schema_namespace: TABLE_PREFIX
  }, 200, 'ok', { schema_version: state.current });
}

function validateSessionBody(body) {
  requireFields(body, ['session_id', 'founder_id', 'venture_id', 'bmr_id', 'source', 'current_stage']);
  const session_id = requireSyntheticId('session_id', body.session_id, 'ses_day1_');
  const founder_id = requireSyntheticId('founder_id', body.founder_id, 'fdr_day1_');
  const venture_id = requireSyntheticId('venture_id', body.venture_id, 'ven_day1_');
  const bmr_id = requireSyntheticId('bmr_id', body.bmr_id, 'bmr_day1_');
  const source = clean(body.source);
  const current_stage = clean(body.current_stage);
  if (source !== 'galvicare' || current_stage !== 'GalviTriage') {
    throw new GVError('GV_REQ_SCHEMA', 'The Day 1 synthetic source or stage is invalid.', 422);
  }
  return {
    session_id,
    founder_id,
    venture_id,
    bmr_id,
    source,
    current_stage,
    founder: {
      first_name: clean(body.founder?.first_name || 'Day 1'),
      last_name: clean(body.founder?.last_name || 'Fixture'),
      email: clean(body.founder?.email || '') || null
    },
    venture_name: clean(body.venture_name || 'Day 1 Synthetic Venture')
  };
}

async function loadSession(db, sessionId) {
  return first(db, `SELECT session_id, bmr_id, venture_id, founder_id, client_session_key,
      source, current_stage, status, started_at, completed_at, created_at, updated_at
    FROM gv1_assessment_sessions
    WHERE session_id = ?`, sessionId);
}

async function loadReceipt(db, scope, key) {
  return first(db, `SELECT scope, idempotency_key, request_fingerprint, response_status,
      response_entity_type, response_entity_id, created_at
    FROM gv1_idempotency_keys
    WHERE scope = ? AND idempotency_key = ?`, scope, key);
}

function receiptStatement(db, { scope, key, requestFingerprint, status, entityType, entityId, timestamp }) {
  return db.prepare(`INSERT INTO gv1_idempotency_keys
      (idempotency_id, scope, idempotency_key, request_fingerprint, response_status,
       response_entity_type, response_entity_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(newId('idem'), scope, key, requestFingerprint, status, entityType, entityId, timestamp);
}

async function createSession(request, config, corr, origin) {
  requireDb(config);
  if (!config.fixtureMode) throw new GVError('GV_FIXTURE_DISABLED', 'The Day 1 fixture context is disabled.', 404);
  const key = idempotencyKey(request);
  const body = validateSessionBody(await jsonBody(request));
  const requestFingerprint = await fingerprint('session:create', body);
  const receipt = await loadReceipt(config.db, 'session:create', key);

  if (receipt) {
    if (receipt.request_fingerprint !== requestFingerprint) {
      throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The idempotency key was reused with a different session request.', 409);
    }
    const replay = await loadSession(config.db, receipt.response_entity_id);
    if (!replay) throw new GVError('GV_INTERNAL', 'The idempotency receipt references an unavailable session.', 500, undefined, true);
    return ok(config, corr, origin, { session: replay }, 200, 'replayed', {
      record_version: 1,
      idempotent_replay: true
    });
  }

  const existing = await loadSession(config.db, body.session_id);
  if (existing) {
    const same = [existing.bmr_id, existing.venture_id, existing.founder_id, existing.source, existing.current_stage].join('|') ===
      [body.bmr_id, body.venture_id, body.founder_id, body.source, body.current_stage].join('|');
    if (!same) {
      throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The existing session does not match the requested synthetic context.', 409);
    }
    await receiptStatement(config.db, {
      scope: 'session:create', key, requestFingerprint, status: 200,
      entityType: 'assessment_session', entityId: body.session_id, timestamp: now()
    }).run();
    return ok(config, corr, origin, { session: existing }, 200, 'resumed', {
      record_version: 1,
      idempotent_replay: true
    });
  }

  const timestamp = now();
  const sessionCreatedFingerprint = await fingerprint('journey-event:create', {
    event_key: `day1:${body.session_id}:session_created`,
    session_id: body.session_id,
    event_name: 'session_created',
    product: 'GalviTriage',
    current_stage: body.current_stage,
    metadata: { fixture: true, source: 'day1-worker' }
  });

  const statements = [
    config.db.prepare(`INSERT INTO gv1_founders
      (founder_id, first_name, last_name, email, consent_status, status, record_version, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'approved', 'active', 1, ?, ?)`)
      .bind(body.founder_id, body.founder.first_name, body.founder.last_name, body.founder.email, timestamp, timestamp),
    config.db.prepare(`INSERT INTO gv1_ventures
      (venture_id, venture_name, stage, status, record_version, created_at, updated_at)
      VALUES (?, ?, 'fixture', 'active', 1, ?, ?)`)
      .bind(body.venture_id, body.venture_name, timestamp, timestamp),
    config.db.prepare(`INSERT INTO gv1_founder_venture_roles
      (founder_id, venture_id, role_code, is_primary, status, created_at, updated_at)
      VALUES (?, ?, 'founder', 1, 'active', ?, ?)`)
      .bind(body.founder_id, body.venture_id, timestamp, timestamp),
    config.db.prepare(`INSERT INTO gv1_business_medical_records
      (bmr_id, venture_id, status, record_version, current_session_id, opened_at, created_at, updated_at)
      VALUES (?, ?, 'assessment_in_progress', 1, ?, ?, ?, ?)`)
      .bind(body.bmr_id, body.venture_id, body.session_id, timestamp, timestamp, timestamp),
    config.db.prepare(`INSERT INTO gv1_assessment_sessions
      (session_id, bmr_id, venture_id, founder_id, client_session_key, source,
       current_stage, status, started_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`)
      .bind(body.session_id, body.bmr_id, body.venture_id, body.founder_id, body.session_id,
        body.source, body.current_stage, timestamp, timestamp, timestamp),
    config.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id, event_key, bmr_id, session_id, event_name, product,
       current_stage, occurred_at, actor_type, metadata_json, request_fingerprint,
       correlation_id, environment, created_at)
      VALUES (?, ?, ?, ?, 'session_created', 'GalviTriage', ?, ?, 'service', ?, ?, ?, ?, ?)`)
      .bind(newId('jev'), `day1:${body.session_id}:session_created`, body.bmr_id, body.session_id,
        body.current_stage, timestamp, JSON.stringify({ fixture: true, source: 'day1-worker' }),
        sessionCreatedFingerprint, corr, config.environment, timestamp),
    config.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id, entity_type, entity_id, operation, prior_version, new_version, actor_type,
       source, reason_code, safe_change_json, correlation_id, environment, occurred_at, created_at)
      VALUES (?, 'assessment_session', ?, 'create', NULL, 1, 'service', 'day1-worker',
       'DAY1_SESSION_CREATE', ?, ?, ?, ?, ?)`)
      .bind(newId('aud'), body.session_id, JSON.stringify({ fixture: true, stage: body.current_stage }),
        corr, config.environment, timestamp, timestamp),
    receiptStatement(config.db, {
      scope: 'session:create', key, requestFingerprint, status: 201,
      entityType: 'assessment_session', entityId: body.session_id, timestamp
    })
  ];

  await config.db.batch(statements);
  const created = await loadSession(config.db, body.session_id);
  return ok(config, corr, origin, { session: created }, 201, 'created', { record_version: 1 });
}

async function getSession(config, corr, origin, sessionId) {
  requireDb(config);
  if (!safeId(sessionId)) throw new GVError('GV_REQ_SCHEMA', 'The session ID is invalid.', 422);
  const session = await loadSession(config.db, sessionId);
  if (!session) throw new GVError('GV_NOT_FOUND', 'The requested Day 1 session was not found.', 404);
  const bmr = await first(config.db, `SELECT bmr_id, venture_id, status, record_version,
      current_session_id, opened_at, closed_at, created_at, updated_at
    FROM gv1_business_medical_records WHERE bmr_id = ?`, session.bmr_id);
  return ok(config, corr, origin, { session, business_medical_record: bmr }, 200, 'ok', {
    record_version: Number(bmr?.record_version || 1)
  });
}

function validateEventBody(body) {
  requireFields(body, ['event_key', 'session_id', 'event_name', 'product', 'current_stage']);
  const event_key = clean(body.event_key);
  const session_id = requireSyntheticId('session_id', body.session_id, 'ses_day1_');
  if (!safeId(event_key) || !event_key.startsWith(`day1:${session_id}:`)) {
    throw new GVError('GV_REQ_SCHEMA', 'event_key must be scoped to the Day 1 session.', 422);
  }
  return {
    event_key,
    session_id,
    event_name: clean(body.event_name),
    product: clean(body.product),
    current_stage: clean(body.current_stage),
    metadata: body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? body.metadata
      : {}
  };
}

async function loadEvent(db, eventKey) {
  return first(db, `SELECT journey_event_id, event_key, bmr_id, session_id, event_name,
      product, current_stage, occurred_at, actor_type, metadata_json, request_fingerprint,
      correlation_id, environment, created_at
    FROM gv1_journey_events WHERE event_key = ?`, eventKey);
}

async function createJourneyEvent(request, config, corr, origin) {
  requireDb(config);
  if (!config.fixtureMode) throw new GVError('GV_FIXTURE_DISABLED', 'The Day 1 fixture context is disabled.', 404);
  const key = idempotencyKey(request);
  const body = validateEventBody(await jsonBody(request));
  const requestFingerprint = await fingerprint('journey-event:create', body);
  const receipt = await loadReceipt(config.db, 'journey-event:create', key);

  if (receipt) {
    if (receipt.request_fingerprint !== requestFingerprint) {
      throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The idempotency key was reused with a different journey event.', 409);
    }
    const replay = await loadEvent(config.db, receipt.response_entity_id);
    if (!replay) throw new GVError('GV_INTERNAL', 'The idempotency receipt references an unavailable event.', 500, undefined, true);
    return ok(config, corr, origin, { journey_event: replay }, 200, 'replayed', {
      idempotent_replay: true
    });
  }

  const session = await loadSession(config.db, body.session_id);
  if (!session) throw new GVError('GV_NOT_FOUND', 'The Day 1 session must exist before appending a journey event.', 404);
  const existing = await loadEvent(config.db, body.event_key);
  if (existing) {
    if (existing.request_fingerprint !== requestFingerprint) {
      throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The event key was reused with different event content.', 409);
    }
    await receiptStatement(config.db, {
      scope: 'journey-event:create', key, requestFingerprint, status: 200,
      entityType: 'journey_event', entityId: body.event_key, timestamp: now()
    }).run();
    return ok(config, corr, origin, { journey_event: existing }, 200, 'replayed', {
      idempotent_replay: true
    });
  }

  const timestamp = now();
  const statements = [
    config.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id, event_key, bmr_id, session_id, event_name, product,
       current_stage, occurred_at, actor_type, metadata_json, request_fingerprint,
       correlation_id, environment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'human_e2e', ?, ?, ?, ?, ?)`)
      .bind(newId('jev'), body.event_key, session.bmr_id, body.session_id, body.event_name,
        body.product, body.current_stage, timestamp, JSON.stringify(body.metadata),
        requestFingerprint, corr, config.environment, timestamp),
    config.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id, entity_type, entity_id, operation, prior_version, new_version, actor_type,
       source, reason_code, safe_change_json, correlation_id, environment, occurred_at, created_at)
      VALUES (?, 'journey_event', ?, 'append', NULL, 1, 'human_e2e', 'day1-worker',
       'DAY1_JOURNEY_APPEND', ?, ?, ?, ?, ?)`)
      .bind(newId('aud'), body.event_key, JSON.stringify({ event_name: body.event_name, product: body.product }),
        corr, config.environment, timestamp, timestamp),
    receiptStatement(config.db, {
      scope: 'journey-event:create', key, requestFingerprint, status: 201,
      entityType: 'journey_event', entityId: body.event_key, timestamp
    })
  ];
  await config.db.batch(statements);
  const created = await loadEvent(config.db, body.event_key);
  return ok(config, corr, origin, { journey_event: created }, 201, 'created');
}

async function fixtureResult(request, config, corr, origin) {
  if (!['qa', 'local'].includes(config.environment) || !config.fixtureMode) {
    throw new GVError('GV_FIXTURE_DISABLED', 'The Day 1 fixture context is disabled.', 404);
  }
  if (request.method === 'POST') await jsonBody(request);
  return ok(config, corr, origin, { fixture: FIXTURE }, 200, 'ok', {
    record_version: 1,
    evidence_version: 1
  });
}

async function route(request, config, corr, origin) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: headers(config, corr, origin) });
  }
  if (request.method === 'GET' && pathname === '/health') return health(config, corr, origin);
  if (request.method === 'GET' && pathname === '/ready') return ready(config, corr, origin);
  if (request.method === 'GET' && pathname === '/api/v1/schema-version') return schemaVersion(config, corr, origin);
  if (request.method === 'POST' && pathname === '/api/v1/sessions') return createSession(request, config, corr, origin);
  if (request.method === 'POST' && pathname === '/api/v1/journey-events') return createJourneyEvent(request, config, corr, origin);
  if (request.method === 'POST' && pathname === '/api/v1/fixtures/results') return fixtureResult(request, config, corr, origin);
  if (request.method === 'GET' && pathname.startsWith('/api/v1/sessions/')) {
    return getSession(config, corr, origin, decodeURIComponent(pathname.slice('/api/v1/sessions/'.length)));
  }
  throw new GVError('GV_NOT_FOUND', 'The requested GalviVault Day 1 route was not found.', 404);
}

const worker = {
  async fetch(request, env) {
    const config = runtime(env);
    const corr = correlationId(request);
    const origin = originState(request, config);
    if (!origin.allowed) {
      return fail(config, corr, origin, new GVError('GV_CORS_DENIED', 'The request origin is not allowed.', 403));
    }
    try {
      return await route(request, config, corr, origin);
    } catch (error) {
      return fail(config, corr, origin, error);
    }
  }
};

export { API_VERSION, FIXTURE, REQUIRED_SCHEMA, SERVICE, TABLE_PREFIX };
export default worker;
