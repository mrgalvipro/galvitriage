import day1Worker from './day1.js';

export const SERVICE = 'galvivault-p0-day2';
export const API_VERSION = 'v1';
export const REQUIRED_SCHEMA = '0002';
export const TABLE_PREFIX = 'gv1_';

const SAFE_ID = /^[A-Za-z0-9:._-]{3,180}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_FOUNDER_ROLES = new Set(['founder', 'cofounder', 'owner']);
const PRIVILEGED_FIELDS = new Set([
  'owner_id', 'actor_type', 'actor_id', 'is_operator', 'is_admin',
  'is_clinician', 'is_service', 'permissions', 'scopes', 'tenant_id'
]);

class GVError extends Error {
  constructor(code, message, status = 400, fields = undefined, retryable = false) {
    super(message);
    this.name = 'GVError';
    this.code = code;
    this.status = status;
    this.fields = fields;
    this.retryable = retryable;
  }
}

const clean = (value) => String(value ?? '').trim();
const enabled = (value) => clean(value).toLowerCase() === 'true';
const now = () => new Date().toISOString();
const newId = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const asInt = (value) => Number.isInteger(Number(value)) ? Number(value) : null;

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

async function fingerprint(scope, value) {
  const bytes = new TextEncoder().encode(`${scope}:${JSON.stringify(canonicalize(value))}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function runtime(env) {
  return {
    environment: clean(env?.ENVIRONMENT || 'unknown').toLowerCase(),
    fixtureMode: enabled(env?.FIXTURE_MODE),
    apiVersion: clean(env?.API_VERSION || API_VERSION),
    minimumSchema: clean(env?.MIN_SCHEMA_VERSION || REQUIRED_SCHEMA),
    allowedOrigins: clean(env?.ALLOWED_ORIGINS).split(',').map((item) => item.trim()).filter(Boolean),
    db: env?.DB
  };
}

function requireQa(config) {
  if (!['qa', 'local', 'production'].includes(config.environment)) {
    throw new GVError('GV_ENV_MISCONFIGURED', 'The GalviVault Day 2 Worker is restricted to QA or local execution.', 503);
  }
}

function requireDb(config) {
  requireQa(config);
  if (!config.db || typeof config.db.prepare !== 'function') {
    throw new GVError('GV_NOT_READY', 'The GalviVault database binding is unavailable.', 503, undefined, true);
  }
}

function correlationId(request) {
  const supplied = clean(request.headers.get('X-Correlation-Id'));
  return SAFE_ID.test(supplied) ? supplied : newId('corr');
}

function originState(request, config) {
  const origin = clean(request.headers.get('Origin'));
  if (!origin) return { origin: null, allowed: true };
  return { origin, allowed: config.allowedOrigins.includes(origin) };
}

function responseHeaders(config, corr, origin, extra = {}) {
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
    output.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Idempotency-Key, X-Correlation-Id, X-GalviVault-Actor-Id, X-GalviVault-Actor-Type'
    );
    output.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    output.set('Access-Control-Max-Age', '600');
  }
  return output;
}

function success(config, corr, origin, data, status = 200, state = 'ok', meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    status: state,
    environment: config.environment,
    correlation_id: corr,
    data,
    meta: {
      api_version: config.apiVersion || API_VERSION,
      schema_version: REQUIRED_SCHEMA,
      record_version: meta.record_version ?? null,
      idempotent_replay: Boolean(meta.idempotent_replay),
      ...meta
    }
  }), { status, headers: responseHeaders(config, corr, origin) });
}

function failure(config, corr, origin, error) {
  const safe = error instanceof GVError
    ? error
    : new GVError('GV_INTERNAL_ERROR', 'An unexpected error occurred.', 500, undefined, true);
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
      ...(safe.fields ? { fields: safe.fields } : {})
    },
    meta: { api_version: config.apiVersion || API_VERSION, schema_version: REQUIRED_SCHEMA }
  }), { status: safe.status, headers: responseHeaders(config, corr, origin) });
}

async function readJson(request) {
  if (!clean(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) {
    throw new GVError('GV_INVALID_REQUEST', 'Content-Type must be application/json.', 400);
  }
  let parsed;
  try {
    parsed = await request.json();
  } catch {
    throw new GVError('GV_INVALID_REQUEST', 'The request body must be valid JSON.', 400);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new GVError('GV_INVALID_REQUEST', 'The request body must be a JSON object.', 400);
  }
  return parsed;
}

function requireIdempotencyKey(request) {
  const value = clean(request.headers.get('Idempotency-Key'));
  if (!SAFE_ID.test(value)) {
    throw new GVError('GV_INVALID_REQUEST', 'A valid Idempotency-Key header is required.', 400, [
      { field: 'Idempotency-Key', issue: 'required_or_invalid' }
    ]);
  }
  return value;
}

function normalizeEmail(value) {
  const email = clean(value).toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    throw new GVError('GV_VALIDATION_FAILED', 'A valid Founder email is required.', 422, [
      { field: 'email', issue: 'invalid' }
    ]);
  }
  return email;
}

function optionalString(value, field, max = 240) {
  if (value === undefined || value === null) return null;
  const result = clean(value);
  if (result.length > max) {
    throw new GVError('GV_VALIDATION_FAILED', `${field} exceeds the allowed length.`, 422, [
      { field, issue: `max_length_${max}` }
    ]);
  }
  return result || null;
}

function requiredString(value, field, max = 240) {
  const result = optionalString(value, field, max);
  if (!result) {
    throw new GVError('GV_VALIDATION_FAILED', `${field} is required.`, 422, [
      { field, issue: 'required' }
    ]);
  }
  return result;
}

function validateOpaqueId(value, field, prefix) {
  const result = clean(value);
  if (!SAFE_ID.test(result) || (prefix && !result.startsWith(`${prefix}_`))) {
    throw new GVError('GV_VALIDATION_FAILED', `${field} is invalid.`, 422, [
      { field, issue: prefix ? `must_start_with_${prefix}_` : 'invalid' }
    ]);
  }
  return result;
}

function boundedJson(value, field, maxBytes = 4096) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new GVError('GV_VALIDATION_FAILED', `${field} must be an object.`, 422, [
      { field, issue: 'object_required' }
    ]);
  }
  const encoded = JSON.stringify(value);
  if (new TextEncoder().encode(encoded).byteLength > maxBytes) {
    throw new GVError('GV_VALIDATION_FAILED', `${field} is too large.`, 422, [
      { field, issue: `max_bytes_${maxBytes}` }
    ]);
  }
  return encoded;
}

function rejectPrivilegeFields(value, path = 'body') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectPrivilegeFields(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (PRIVILEGED_FIELDS.has(key)) {
      throw new GVError('GV_FORBIDDEN', 'Privileged identity or authorization fields cannot be supplied by the client.', 403, [
        { field: `${path}.${key}`, issue: 'prohibited' }
      ]);
    }
    rejectPrivilegeFields(child, `${path}.${key}`);
  }
}

function actorContext(request, config) {
  const suppliedId = clean(request.headers.get('X-GalviVault-Actor-Id'));
  const suppliedType = clean(request.headers.get('X-GalviVault-Actor-Type')).toLowerCase();
  if (suppliedId && SAFE_ID.test(suppliedId) && ['operator', 'service', 'qa_fixture'].includes(suppliedType)) {
    return { actorId: suppliedId, actorType: suppliedType };
  }
  if (config.fixtureMode && ['qa', 'local'].includes(config.environment)) {
    return { actorId: 'galvivault_day2_qa_harness', actorType: 'qa_fixture' };
  }
  throw new GVError('GV_UNAUTHENTICATED', 'An approved GalviVault actor context is required.', 401);
}

const first = async (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const all = async (db, sql, ...params) => db.prepare(sql).bind(...params).all();
const run = async (db, sql, ...params) => db.prepare(sql).bind(...params).run();

async function batch(db, statements) {
  if (typeof db.batch === 'function') return db.batch(statements);
  const results = [];
  for (const statement of statements) results.push(await statement.run());
  return results;
}

function changeCount(result) {
  return Number(result?.meta?.changes ?? result?.changes ?? 0);
}

async function day2SchemaState(config) {
  requireDb(config);
  try {
    const migration = await first(
      config.db,
      `SELECT migration_id, name, environment, applied_at
       FROM gv1_schema_migrations
       WHERE migration_id = '0002'`
    );
    const indexes = await all(
      config.db,
      `SELECT name FROM sqlite_master
       WHERE type='index' AND name IN (
         'ux_gv1_founders_normalized_email',
         'ux_gv1_bmr_one_per_venture',
         'ux_gv1_roles_one_active_primary'
       )`
    );
    const founderColumns = await all(config.db, 'PRAGMA table_info(gv1_founders)');
    const receiptColumns = await all(config.db, 'PRAGMA table_info(gv1_idempotency_keys)');
    const indexCount = Array.isArray(indexes?.results) ? indexes.results.length : 0;
    const founderNames = new Set((founderColumns?.results || []).map((row) => row.name));
    const receiptNames = new Set((receiptColumns?.results || []).map((row) => row.name));
    const ready = Boolean(
      migration &&
      indexCount === 3 &&
      founderNames.has('normalized_email') &&
      receiptNames.has('response_json')
    );
    return {
      ready,
      migration: migration || null,
      current_schema_version: migration?.migration_id || null,
      required_schema_version: REQUIRED_SCHEMA,
      required_index_count: 3,
      present_index_count: indexCount,
      normalized_email_column: founderNames.has('normalized_email'),
      response_json_column: receiptNames.has('response_json')
    };
  } catch {
    throw new GVError('GV_NOT_READY', 'The GalviVault Day 2 schema is unavailable.', 503, undefined, true);
  }
}

async function loadReceipt(db, scope, key) {
  return first(
    db,
    `SELECT scope, idempotency_key, request_fingerprint, response_status,
            response_entity_type, response_entity_id, response_json, created_at
     FROM gv1_idempotency_keys
     WHERE scope = ? AND idempotency_key = ?`,
    scope,
    key
  );
}

function receiptStatement(db, {
  scope, key, requestFingerprint, status, entityType, entityId, responsePayload, timestamp
}) {
  return db.prepare(
    `INSERT INTO gv1_idempotency_keys
       (idempotency_id, scope, idempotency_key, request_fingerprint, response_status,
        response_entity_type, response_entity_id, created_at, response_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    newId('idem'), scope, key, requestFingerprint, status,
    entityType, entityId, timestamp, JSON.stringify(responsePayload)
  );
}

function conditionalReceiptStatement(db, {
  scope, key, requestFingerprint, status, entityType, entityId, responsePayload, timestamp,
  table, idColumn, versionColumn = 'record_version', expectedNewVersion
}) {
  return db.prepare(
    `INSERT INTO gv1_idempotency_keys
       (idempotency_id, scope, idempotency_key, request_fingerprint, response_status,
        response_entity_type, response_entity_id, created_at, response_json)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
     WHERE EXISTS (
       SELECT 1 FROM ${table} WHERE ${idColumn} = ? AND ${versionColumn} = ?
     )`
  ).bind(
    newId('idem'), scope, key, requestFingerprint, status,
    entityType, entityId, timestamp, JSON.stringify(responsePayload), entityId, expectedNewVersion
  );
}

function replayResponse(config, corr, origin, receipt) {
  if (!receipt?.response_json) {
    throw new GVError('GV_INTERNAL_ERROR', 'The idempotency receipt is incomplete.', 500, undefined, true);
  }
  const stored = JSON.parse(receipt.response_json);
  return success(
    config,
    corr,
    origin,
    stored.data,
    200,
    'replayed',
    { ...(stored.meta || {}), idempotent_replay: true }
  );
}

async function enforceReceipt(config, corr, origin, scope, key, requestFingerprint) {
  const receipt = await loadReceipt(config.db, scope, key);
  if (!receipt) return null;
  if (receipt.request_fingerprint !== requestFingerprint) {
    throw new GVError(
      'GV_IDEMPOTENCY_KEY_REUSE',
      'The Idempotency-Key was already used for a different request.',
      409
    );
  }
  return replayResponse(config, corr, origin, receipt);
}

function auditStatement(db, {
  entityType, entityId, operation, priorVersion = null, newVersion = null,
  actor, source, reasonCode, changedFields = [], correlation, environment, timestamp
}) {
  return db.prepare(
    `INSERT INTO gv1_audit_log
       (audit_id, entity_type, entity_id, operation, prior_version, new_version,
        actor_type, source, reason_code, safe_change_json, correlation_id,
        environment, occurred_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    newId('aud'), entityType, entityId, operation, priorVersion, newVersion,
    actor.actorType, source, reasonCode,
    JSON.stringify({ changed_fields: changedFields, actor_id: actor.actorId }),
    correlation, environment, timestamp, timestamp
  );
}

function conditionalAuditStatement(db, {
  entityType, entityId, operation, priorVersion, newVersion,
  actor, source, reasonCode, changedFields, correlation, environment, timestamp,
  table, idColumn
}) {
  return db.prepare(
    `INSERT INTO gv1_audit_log
       (audit_id, entity_type, entity_id, operation, prior_version, new_version,
        actor_type, source, reason_code, safe_change_json, correlation_id,
        environment, occurred_at, created_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
     WHERE EXISTS (SELECT 1 FROM ${table} WHERE ${idColumn} = ? AND record_version = ?)`
  ).bind(
    newId('aud'), entityType, entityId, operation, priorVersion, newVersion,
    actor.actorType, source, reasonCode,
    JSON.stringify({ changed_fields: changedFields, actor_id: actor.actorId }),
    correlation, environment, timestamp, timestamp, entityId, newVersion
  );
}

async function getFounder(db, founderId) {
  return first(
    db,
    `SELECT founder_id, first_name, last_name, email, normalized_email, phone,
            consent_status, status, record_version, profile_json, created_at, updated_at
     FROM gv1_founders WHERE founder_id = ?`,
    founderId
  );
}

async function getFounderByEmail(db, normalizedEmail) {
  return first(
    db,
    `SELECT founder_id, first_name, last_name, email, normalized_email, phone,
            consent_status, status, record_version, profile_json, created_at, updated_at
     FROM gv1_founders WHERE normalized_email = ?`,
    normalizedEmail
  );
}

async function getVenture(db, ventureId) {
  return first(
    db,
    `SELECT venture_id, venture_name, stage, website, industry, revenue_range,
            profile_json, status, record_version, created_at, updated_at
     FROM gv1_ventures WHERE venture_id = ?`,
    ventureId
  );
}

async function resolveFounderVentureByExactName(db, founderId, ventureName) {
  const normalized = clean(ventureName).toLowerCase().replace(/\s+/g, ' ');
  if (!founderId || !normalized) return null;
  const result = await all(db,
    `SELECT v.venture_id, v.venture_name, v.stage, v.website, v.industry, v.revenue_range,
            v.profile_json, v.status, v.record_version, v.created_at, v.updated_at
     FROM gv1_founder_venture_roles r
     JOIN gv1_ventures v ON v.venture_id = r.venture_id
     WHERE r.founder_id = ? AND r.status = 'active'
       AND lower(trim(v.venture_name)) = ?
     ORDER BY v.venture_id LIMIT 2`, founderId, normalized);
  const rows = result?.results || [];
  if (rows.length > 1) throw new GVError('GV_VENTURE_AMBIGUOUS', 'Venture identity is ambiguous; canonical ownership was not changed.', 409);
  return rows[0] || null;
}

async function getRole(db, founderId, ventureId) {
  return first(
    db,
    `SELECT founder_id, venture_id, role_code, is_primary, status, created_at, updated_at
     FROM gv1_founder_venture_roles
     WHERE founder_id = ? AND venture_id = ? AND status = 'active'
     ORDER BY is_primary DESC, role_code LIMIT 1`,
    founderId,
    ventureId
  );
}

async function getBmr(db, bmrId) {
  return first(
    db,
    `SELECT bmr_id, venture_id, status, record_version, current_session_id,
            opened_at, closed_at, created_at, updated_at
     FROM gv1_business_medical_records WHERE bmr_id = ?`,
    bmrId
  );
}

async function getBmrByVenture(db, ventureId) {
  return first(
    db,
    `SELECT bmr_id, venture_id, status, record_version, current_session_id,
            opened_at, closed_at, created_at, updated_at
     FROM gv1_business_medical_records WHERE venture_id = ?`,
    ventureId
  );
}

async function getSession(db, sessionId) {
  return first(
    db,
    `SELECT session_id, bmr_id, venture_id, founder_id, client_session_key,
            source, current_stage, status, started_at, completed_at, created_at, updated_at
     FROM gv1_assessment_sessions WHERE session_id = ?`,
    sessionId
  );
}

async function getSessionByBusinessKey(db, key) {
  return first(
    db,
    `SELECT session_id, bmr_id, venture_id, founder_id, client_session_key,
            source, current_stage, status, started_at, completed_at, created_at, updated_at
     FROM gv1_assessment_sessions WHERE client_session_key = ?`,
    key
  );
}

async function getIdentitySet(db, sessionId) {
  const session = await getSession(db, sessionId);
  if (!session) return null;
  const [founder, venture, bmr, role] = await Promise.all([
    getFounder(db, session.founder_id),
    getVenture(db, session.venture_id),
    getBmr(db, session.bmr_id),
    getRole(db, session.founder_id, session.venture_id)
  ]);
  return { founder, venture, founder_venture_role: role, business_medical_record: bmr, session };
}

function sourceValue(body) {
  return optionalString(body.source, 'source', 80) || 'galvicare';
}

async function createOrResolveFounder(request, config, corr, origin, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  const email = requiredString(body.email, 'email', 254);
  const normalizedEmail = normalizeEmail(email);
  const source = sourceValue(body);
  const requestFingerprint = await fingerprint('day2:founder:create-or-resolve', {
    ...body,
    email: normalizedEmail
  });
  const replay = await enforceReceipt(config, corr, origin, 'day2:founder:create-or-resolve', key, requestFingerprint);
  if (replay) return replay;

  const existing = await getFounderByEmail(config.db, normalizedEmail);
  const timestamp = now();
  if (existing) {
    const payload = { data: { founder: existing }, meta: { record_version: existing.record_version } };
    await receiptStatement(config.db, {
      scope: 'day2:founder:create-or-resolve', key, requestFingerprint, status: 200,
      entityType: 'founder', entityId: existing.founder_id, responsePayload: payload, timestamp
    }).run();
    return success(config, corr, origin, payload.data, 200, 'existing', payload.meta);
  }

  const founderId = newId('fdr');
  const founder = {
    founder_id: founderId,
    first_name: optionalString(body.first_name, 'first_name', 120),
    last_name: optionalString(body.last_name, 'last_name', 120),
    email,
    normalized_email: normalizedEmail,
    phone: optionalString(body.phone, 'phone', 60),
    consent_status: optionalString(body.consent_status, 'consent_status', 40) || 'approved',
    status: 'active',
    record_version: 1,
    profile_json: boundedJson(body.profile, 'profile'),
    created_at: timestamp,
    updated_at: timestamp
  };
  const payload = { data: { founder }, meta: { record_version: 1 } };
  const statements = [
    config.db.prepare(
      `INSERT INTO gv1_founders
         (founder_id, first_name, last_name, email, normalized_email, phone,
          consent_status, status, record_version, profile_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?)`
    ).bind(
      founder.founder_id, founder.first_name, founder.last_name, founder.email,
      founder.normalized_email, founder.phone, founder.consent_status,
      founder.profile_json, timestamp, timestamp
    ),
    auditStatement(config.db, {
      entityType: 'founder', entityId: founderId, operation: 'create', newVersion: 1,
      actor, source, reasonCode: 'day2_founder_created',
      changedFields: ['founder_id', 'email', 'first_name', 'last_name', 'consent_status'],
      correlation: corr, environment: config.environment, timestamp
    }),
    receiptStatement(config.db, {
      scope: 'day2:founder:create-or-resolve', key, requestFingerprint, status: 201,
      entityType: 'founder', entityId: founderId, responsePayload: payload, timestamp
    })
  ];

  try {
    await batch(config.db, statements);
  } catch (error) {
    const concurrent = await getFounderByEmail(config.db, normalizedEmail);
    if (!concurrent) throw error;
    const concurrentPayload = { data: { founder: concurrent }, meta: { record_version: concurrent.record_version } };
    try {
      await receiptStatement(config.db, {
        scope: 'day2:founder:create-or-resolve', key, requestFingerprint, status: 200,
        entityType: 'founder', entityId: concurrent.founder_id,
        responsePayload: concurrentPayload, timestamp: now()
      }).run();
    } catch {
      // Another request may have inserted the receipt. The next read is authoritative.
    }
    return success(config, corr, origin, concurrentPayload.data, 200, 'existing', concurrentPayload.meta);
  }
  return success(config, corr, origin, payload.data, 201, 'created', payload.meta);
}

async function updateFounder(request, config, corr, origin, founderId, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  founderId = validateOpaqueId(founderId, 'founder_id', 'fdr');
  const expectedVersion = asInt(body.expected_version);
  if (!expectedVersion || expectedVersion < 1) {
    throw new GVError('GV_VALIDATION_FAILED', 'expected_version is required.', 422, [
      { field: 'expected_version', issue: 'positive_integer_required' }
    ]);
  }
  const source = sourceValue(body);
  const requestFingerprint = await fingerprint('day2:founder:update', { founder_id: founderId, ...body });
  const replay = await enforceReceipt(config, corr, origin, 'day2:founder:update', key, requestFingerprint);
  if (replay) return replay;

  const current = await getFounder(config.db, founderId);
  if (!current) throw new GVError('GV_NOT_FOUND', 'Founder not found.', 404);
  if (Number(current.record_version) !== expectedVersion) {
    throw new GVError('GV_VERSION_CONFLICT', 'The Founder changed before this update was applied.', 409, [
      { field: 'expected_version', issue: 'stale' }
    ]);
  }

  const allowed = {
    first_name: optionalString(body.first_name, 'first_name', 120),
    last_name: optionalString(body.last_name, 'last_name', 120),
    phone: optionalString(body.phone, 'phone', 60),
    consent_status: optionalString(body.consent_status, 'consent_status', 40),
    profile_json: body.profile === undefined ? undefined : boundedJson(body.profile, 'profile')
  };
  if (body.email !== undefined) {
    const email = requiredString(body.email, 'email', 254);
    allowed.email = email;
    allowed.normalized_email = normalizeEmail(email);
    const conflict = await getFounderByEmail(config.db, allowed.normalized_email);
    if (conflict && conflict.founder_id !== founderId) {
      throw new GVError('GV_IDENTITY_CONFLICT', 'The email is already associated with another Founder.', 409);
    }
  }
  const changedFields = Object.entries(allowed)
    .filter(([, value]) => value !== undefined)
    .filter(([field, value]) => (current[field] ?? null) !== value)
    .map(([field]) => field);

  if (!changedFields.length) {
    const payload = { data: { founder: current, changed_fields: [] }, meta: { record_version: current.record_version } };
    await receiptStatement(config.db, {
      scope: 'day2:founder:update', key, requestFingerprint, status: 200,
      entityType: 'founder', entityId: founderId, responsePayload: payload, timestamp: now()
    }).run();
    return success(config, corr, origin, payload.data, 200, 'no_change', payload.meta);
  }

  const newVersion = expectedVersion + 1;
  const timestamp = now();
  const sets = [];
  const values = [];
  for (const field of changedFields) {
    sets.push(`${field} = ?`);
    values.push(allowed[field]);
  }
  sets.push('record_version = ?', 'updated_at = ?');
  values.push(newVersion, timestamp, founderId, expectedVersion);
  const updated = { ...current };
  for (const field of changedFields) updated[field] = allowed[field];
  updated.record_version = newVersion;
  updated.updated_at = timestamp;
  const payload = { data: { founder: updated, changed_fields: changedFields }, meta: { record_version: newVersion } };

  const results = await batch(config.db, [
    config.db.prepare(
      `UPDATE gv1_founders SET ${sets.join(', ')}
       WHERE founder_id = ? AND record_version = ?`
    ).bind(...values),
    conditionalAuditStatement(config.db, {
      entityType: 'founder', entityId: founderId, operation: 'update',
      priorVersion: expectedVersion, newVersion, actor, source,
      reasonCode: 'day2_founder_profile_corrected', changedFields,
      correlation: corr, environment: config.environment, timestamp,
      table: 'gv1_founders', idColumn: 'founder_id'
    }),
    conditionalReceiptStatement(config.db, {
      scope: 'day2:founder:update', key, requestFingerprint, status: 200,
      entityType: 'founder', entityId: founderId, responsePayload: payload, timestamp,
      table: 'gv1_founders', idColumn: 'founder_id', expectedNewVersion: newVersion
    })
  ]);
  if (changeCount(results[0]) !== 1) {
    throw new GVError('GV_VERSION_CONFLICT', 'The Founder changed before this update was applied.', 409);
  }
  return success(config, corr, origin, payload.data, 200, 'changed', payload.meta);
}

function validateRoleCode(value) {
  const roleCode = clean(value || 'founder').toLowerCase();
  if (!ALLOWED_FOUNDER_ROLES.has(roleCode)) {
    throw new GVError('GV_FORBIDDEN', 'The requested Founder-Venture role is not permitted.', 403, [
      { field: 'role_code', issue: 'privileged_or_unsupported' }
    ]);
  }
  return roleCode;
}

async function createVenture(request, config, corr, origin, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  const founderId = validateOpaqueId(body.founder_id, 'founder_id', 'fdr');
  const founder = await getFounder(config.db, founderId);
  if (!founder) throw new GVError('GV_NOT_FOUND', 'Founder not found.', 404);
  const roleCode = validateRoleCode(body.role_code);
  const isPrimary = body.is_primary === false ? 0 : 1;
  const source = sourceValue(body);
  const requestFingerprint = await fingerprint('day2:venture:create', body);
  const replay = await enforceReceipt(config, corr, origin, 'day2:venture:create', key, requestFingerprint);
  if (replay) return replay;

  const timestamp = now();
  const ventureId = newId('ven');
  const venture = {
    venture_id: ventureId,
    venture_name: requiredString(body.venture_name, 'venture_name', 240),
    stage: optionalString(body.stage, 'stage', 80),
    website: optionalString(body.website, 'website', 400),
    industry: optionalString(body.industry, 'industry', 120),
    revenue_range: optionalString(body.revenue_range, 'revenue_range', 120),
    profile_json: boundedJson(body.profile, 'profile'),
    status: 'active',
    record_version: 1,
    created_at: timestamp,
    updated_at: timestamp
  };
  const role = {
    founder_id: founderId, venture_id: ventureId, role_code: roleCode,
    is_primary: isPrimary, status: 'active', created_at: timestamp, updated_at: timestamp
  };
  const payload = { data: { venture, founder_venture_role: role }, meta: { record_version: 1 } };
  await batch(config.db, [
    config.db.prepare(
      `INSERT INTO gv1_ventures
         (venture_id, venture_name, stage, website, industry, revenue_range,
          profile_json, status, record_version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?)`
    ).bind(
      ventureId, venture.venture_name, venture.stage, venture.website, venture.industry,
      venture.revenue_range, venture.profile_json, timestamp, timestamp
    ),
    config.db.prepare(
      `INSERT INTO gv1_founder_venture_roles
         (founder_id, venture_id, role_code, is_primary, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?)`
    ).bind(founderId, ventureId, roleCode, isPrimary, timestamp, timestamp),
    auditStatement(config.db, {
      entityType: 'venture', entityId: ventureId, operation: 'create', newVersion: 1,
      actor, source, reasonCode: 'day2_venture_created',
      changedFields: ['venture_id', 'venture_name', 'stage'],
      correlation: corr, environment: config.environment, timestamp
    }),
    auditStatement(config.db, {
      entityType: 'founder_venture_role', entityId: `${founderId}:${ventureId}:${roleCode}`,
      operation: 'create', newVersion: 1, actor, source,
      reasonCode: 'day2_founder_venture_role_created',
      changedFields: ['founder_id', 'venture_id', 'role_code', 'is_primary'],
      correlation: corr, environment: config.environment, timestamp
    }),
    receiptStatement(config.db, {
      scope: 'day2:venture:create', key, requestFingerprint, status: 201,
      entityType: 'venture', entityId: ventureId, responsePayload: payload, timestamp
    })
  ]);
  return success(config, corr, origin, payload.data, 201, 'created', payload.meta);
}

async function updateVenture(request, config, corr, origin, ventureId, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  ventureId = validateOpaqueId(ventureId, 'venture_id', 'ven');
  const expectedVersion = asInt(body.expected_version);
  if (!expectedVersion || expectedVersion < 1) {
    throw new GVError('GV_VALIDATION_FAILED', 'expected_version is required.', 422, [
      { field: 'expected_version', issue: 'positive_integer_required' }
    ]);
  }
  const source = sourceValue(body);
  const requestFingerprint = await fingerprint('day2:venture:update', { venture_id: ventureId, ...body });
  const replay = await enforceReceipt(config, corr, origin, 'day2:venture:update', key, requestFingerprint);
  if (replay) return replay;

  const current = await getVenture(config.db, ventureId);
  if (!current) throw new GVError('GV_NOT_FOUND', 'Venture not found.', 404);
  if (Number(current.record_version) !== expectedVersion) {
    throw new GVError('GV_VERSION_CONFLICT', 'The Venture changed before this update was applied.', 409, [
      { field: 'expected_version', issue: 'stale' }
    ]);
  }
  const allowed = {
    venture_name: body.venture_name === undefined ? undefined : requiredString(body.venture_name, 'venture_name', 240),
    stage: body.stage === undefined ? undefined : optionalString(body.stage, 'stage', 80),
    website: body.website === undefined ? undefined : optionalString(body.website, 'website', 400),
    industry: body.industry === undefined ? undefined : optionalString(body.industry, 'industry', 120),
    revenue_range: body.revenue_range === undefined ? undefined : optionalString(body.revenue_range, 'revenue_range', 120),
    profile_json: body.profile === undefined ? undefined : boundedJson(body.profile, 'profile')
  };
  const changedFields = Object.entries(allowed)
    .filter(([, value]) => value !== undefined)
    .filter(([field, value]) => (current[field] ?? null) !== value)
    .map(([field]) => field);

  if (!changedFields.length) {
    const bmr = await getBmrByVenture(config.db, ventureId);
    const payload = {
      data: { venture: current, bmr_id: bmr?.bmr_id || null, changed_fields: [] },
      meta: { record_version: current.record_version }
    };
    await receiptStatement(config.db, {
      scope: 'day2:venture:update', key, requestFingerprint, status: 200,
      entityType: 'venture', entityId: ventureId, responsePayload: payload, timestamp: now()
    }).run();
    return success(config, corr, origin, payload.data, 200, 'no_change', payload.meta);
  }

  const bmr = await getBmrByVenture(config.db, ventureId);
  const newVersion = expectedVersion + 1;
  const timestamp = now();
  const sets = [];
  const values = [];
  for (const field of changedFields) {
    sets.push(`${field} = ?`);
    values.push(allowed[field]);
  }
  sets.push('record_version = ?', 'updated_at = ?');
  values.push(newVersion, timestamp, ventureId, expectedVersion);
  const updated = { ...current };
  for (const field of changedFields) updated[field] = allowed[field];
  updated.record_version = newVersion;
  updated.updated_at = timestamp;
  const payload = {
    data: { venture: updated, bmr_id: bmr?.bmr_id || null, changed_fields: changedFields },
    meta: { record_version: newVersion }
  };
  const results = await batch(config.db, [
    config.db.prepare(
      `UPDATE gv1_ventures SET ${sets.join(', ')}
       WHERE venture_id = ? AND record_version = ?`
    ).bind(...values),
    conditionalAuditStatement(config.db, {
      entityType: 'venture', entityId: ventureId, operation: 'update',
      priorVersion: expectedVersion, newVersion, actor, source,
      reasonCode: 'day2_venture_profile_corrected', changedFields,
      correlation: corr, environment: config.environment, timestamp,
      table: 'gv1_ventures', idColumn: 'venture_id'
    }),
    conditionalReceiptStatement(config.db, {
      scope: 'day2:venture:update', key, requestFingerprint, status: 200,
      entityType: 'venture', entityId: ventureId, responsePayload: payload, timestamp,
      table: 'gv1_ventures', idColumn: 'venture_id', expectedNewVersion: newVersion
    })
  ]);
  if (changeCount(results[0]) !== 1) {
    throw new GVError('GV_VERSION_CONFLICT', 'The Venture changed before this update was applied.', 409);
  }
  return success(config, corr, origin, payload.data, 200, 'changed', payload.meta);
}

async function createOrResolveRole(request, config, corr, origin, ventureId, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  ventureId = validateOpaqueId(ventureId, 'venture_id', 'ven');
  const founderId = validateOpaqueId(body.founder_id, 'founder_id', 'fdr');
  const roleCode = validateRoleCode(body.role_code);
  const isPrimary = body.is_primary === true ? 1 : 0;
  const source = sourceValue(body);
  const requestFingerprint = await fingerprint('day2:role:create-or-resolve', {
    founder_id: founderId, venture_id: ventureId, role_code: roleCode, is_primary: isPrimary
  });
  const replay = await enforceReceipt(config, corr, origin, 'day2:role:create-or-resolve', key, requestFingerprint);
  if (replay) return replay;
  const [founder, venture] = await Promise.all([getFounder(config.db, founderId), getVenture(config.db, ventureId)]);
  if (!founder || !venture) throw new GVError('GV_NOT_FOUND', 'Founder or Venture not found.', 404);
  const existing = await getRole(config.db, founderId, ventureId);
  const timestamp = now();
  if (existing) {
    if (existing.role_code !== roleCode || Number(existing.is_primary) !== isPrimary) {
      throw new GVError('GV_IDENTITY_CONFLICT', 'An active Founder-Venture relationship already exists with different context.', 409);
    }
    const payload = { data: { founder_venture_role: existing }, meta: { record_version: 1 } };
    await receiptStatement(config.db, {
      scope: 'day2:role:create-or-resolve', key, requestFingerprint, status: 200,
      entityType: 'founder_venture_role', entityId: `${founderId}:${ventureId}:${roleCode}`,
      responsePayload: payload, timestamp
    }).run();
    return success(config, corr, origin, payload.data, 200, 'existing', payload.meta);
  }
  const role = {
    founder_id: founderId, venture_id: ventureId, role_code: roleCode,
    is_primary: isPrimary, status: 'active', created_at: timestamp, updated_at: timestamp
  };
  const payload = { data: { founder_venture_role: role }, meta: { record_version: 1 } };
  await batch(config.db, [
    config.db.prepare(
      `INSERT INTO gv1_founder_venture_roles
         (founder_id, venture_id, role_code, is_primary, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?)`
    ).bind(founderId, ventureId, roleCode, isPrimary, timestamp, timestamp),
    auditStatement(config.db, {
      entityType: 'founder_venture_role', entityId: `${founderId}:${ventureId}:${roleCode}`,
      operation: 'create', newVersion: 1, actor, source,
      reasonCode: 'day2_founder_venture_role_created',
      changedFields: ['founder_id', 'venture_id', 'role_code', 'is_primary'],
      correlation: corr, environment: config.environment, timestamp
    }),
    receiptStatement(config.db, {
      scope: 'day2:role:create-or-resolve', key, requestFingerprint, status: 201,
      entityType: 'founder_venture_role', entityId: `${founderId}:${ventureId}:${roleCode}`,
      responsePayload: payload, timestamp
    })
  ]);
  return success(config, corr, origin, payload.data, 201, 'created', payload.meta);
}

async function createOrGetBmr(request, config, corr, origin, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  const ventureId = validateOpaqueId(body.venture_id, 'venture_id', 'ven');
  const source = sourceValue(body);
  const requestFingerprint = await fingerprint('day2:bmr:create-or-get', body);
  const replay = await enforceReceipt(config, corr, origin, 'day2:bmr:create-or-get', key, requestFingerprint);
  if (replay) return replay;
  const venture = await getVenture(config.db, ventureId);
  if (!venture) throw new GVError('GV_NOT_FOUND', 'Venture not found.', 404);
  const existing = await getBmrByVenture(config.db, ventureId);
  const timestamp = now();
  if (existing) {
    const payload = { data: { business_medical_record: existing }, meta: { record_version: existing.record_version } };
    await receiptStatement(config.db, {
      scope: 'day2:bmr:create-or-get', key, requestFingerprint, status: 200,
      entityType: 'business_medical_record', entityId: existing.bmr_id,
      responsePayload: payload, timestamp
    }).run();
    return success(config, corr, origin, payload.data, 200, 'existing', payload.meta);
  }
  const bmrId = newId('bmr');
  const bmr = {
    bmr_id: bmrId, venture_id: ventureId, status: 'active', record_version: 1,
    current_session_id: null, opened_at: timestamp, closed_at: null,
    created_at: timestamp, updated_at: timestamp
  };
  const payload = { data: { business_medical_record: bmr }, meta: { record_version: 1 } };
  try {
    await batch(config.db, [
      config.db.prepare(
        `INSERT INTO gv1_business_medical_records
           (bmr_id, venture_id, status, record_version, current_session_id,
            opened_at, closed_at, created_at, updated_at)
         VALUES (?, ?, 'active', 1, NULL, ?, NULL, ?, ?)`
      ).bind(bmrId, ventureId, timestamp, timestamp, timestamp),
      auditStatement(config.db, {
        entityType: 'business_medical_record', entityId: bmrId, operation: 'create', newVersion: 1,
        actor, source, reasonCode: 'day2_bmr_created',
        changedFields: ['bmr_id', 'venture_id', 'status'],
        correlation: corr, environment: config.environment, timestamp
      }),
      receiptStatement(config.db, {
        scope: 'day2:bmr:create-or-get', key, requestFingerprint, status: 201,
        entityType: 'business_medical_record', entityId: bmrId,
        responsePayload: payload, timestamp
      })
    ]);
  } catch (error) {
    const concurrent = await getBmrByVenture(config.db, ventureId);
    if (!concurrent) throw error;
    const concurrentPayload = {
      data: { business_medical_record: concurrent },
      meta: { record_version: concurrent.record_version }
    };
    try {
      await receiptStatement(config.db, {
        scope: 'day2:bmr:create-or-get', key, requestFingerprint, status: 200,
        entityType: 'business_medical_record', entityId: concurrent.bmr_id,
        responsePayload: concurrentPayload, timestamp: now()
      }).run();
    } catch {
      // Receipt may have been inserted by the concurrent request.
    }
    return success(config, corr, origin, concurrentPayload.data, 200, 'existing', concurrentPayload.meta);
  }
  return success(config, corr, origin, payload.data, 201, 'created', payload.meta);
}

function validateSessionBody(body) {
  const clientSessionKey = requiredString(body.client_session_key, 'client_session_key', 180);
  if (!SAFE_ID.test(clientSessionKey)) {
    throw new GVError('GV_VALIDATION_FAILED', 'client_session_key is invalid.', 422, [
      { field: 'client_session_key', issue: 'invalid' }
    ]);
  }
  const founderInput = body.founder && typeof body.founder === 'object' ? body.founder : {};
  const ventureInput = body.venture && typeof body.venture === 'object' ? body.venture : {};
  rejectPrivilegeFields(founderInput, 'body.founder');
  rejectPrivilegeFields(ventureInput, 'body.venture');
  const founderId = founderInput.founder_id
    ? validateOpaqueId(founderInput.founder_id, 'founder.founder_id', 'fdr')
    : null;
  const normalizedEmail = founderInput.email ? normalizeEmail(founderInput.email) : null;
  if (!founderId && !normalizedEmail) {
    throw new GVError('GV_VALIDATION_FAILED', 'Founder identity requires founder_id or email.', 422, [
      { field: 'founder', issue: 'founder_id_or_email_required' }
    ]);
  }
  const ventureId = ventureInput.venture_id
    ? validateOpaqueId(ventureInput.venture_id, 'venture.venture_id', 'ven')
    : null;
  if (!ventureId && !clean(ventureInput.venture_name)) {
    throw new GVError('GV_VALIDATION_FAILED', 'Venture identity requires venture_id or venture_name.', 422, [
      { field: 'venture', issue: 'venture_id_or_venture_name_required' }
    ]);
  }
  const bmrId = body.bmr_id ? validateOpaqueId(body.bmr_id, 'bmr_id', 'bmr') : null;
  return {
    clientSessionKey,
    founderInput,
    ventureInput,
    founderId,
    normalizedEmail,
    ventureId,
    bmrId,
    roleCode: validateRoleCode(ventureInput.role_code),
    isPrimary: ventureInput.is_primary === false ? 0 : 1,
    source: sourceValue(body),
    currentStage: optionalString(body.current_stage, 'current_stage', 120) || 'GalviTriage'
  };
}

async function createOrResumeSession(request, config, corr, origin, bodyOverride = null) {
  requireDb(config);
  const actor = actorContext(request, config);
  const body = bodyOverride || await readJson(request);
  rejectPrivilegeFields(body);
  const key = requireIdempotencyKey(request);
  const input = validateSessionBody(body);
  const requestFingerprint = await fingerprint('day2:session:create-or-resume', body);
  const replay = await enforceReceipt(config, corr, origin, 'day2:session:create-or-resume', key, requestFingerprint);
  if (replay) return replay;

  const existingSession = await getSessionByBusinessKey(config.db, input.clientSessionKey);
  if (existingSession) {
    const identity = await getIdentitySet(config.db, existingSession.session_id);
    if (!identity) throw new GVError('GV_INTERNAL_ERROR', 'The existing Session identity set is incomplete.', 500);
    if (
      (input.founderId && input.founderId !== existingSession.founder_id) ||
      (input.ventureId && input.ventureId !== existingSession.venture_id) ||
      (input.bmrId && input.bmrId !== existingSession.bmr_id) ||
      (input.normalizedEmail && input.normalizedEmail !== identity.founder?.normalized_email)
    ) {
      throw new GVError('GV_SCOPE_MISMATCH', 'The supplied identity hints conflict with the canonical Session.', 409);
    }
    const timestamp = now();
    const payload = { data: { identity }, meta: { record_version: identity.business_medical_record?.record_version || null } };
    await receiptStatement(config.db, {
      scope: 'day2:session:create-or-resume', key, requestFingerprint, status: 200,
      entityType: 'assessment_session', entityId: existingSession.session_id,
      responsePayload: payload, timestamp
    }).run();
    return success(config, corr, origin, payload.data, 200, 'resumed', payload.meta);
  }

  let founder = input.founderId ? await getFounder(config.db, input.founderId) : null;
  if (!founder && input.normalizedEmail) founder = await getFounderByEmail(config.db, input.normalizedEmail);
  if (input.founderId && !founder) throw new GVError('GV_NOT_FOUND', 'Founder not found.', 404);
  if (founder && input.normalizedEmail && founder.normalized_email !== input.normalizedEmail) {
    throw new GVError('GV_IDENTITY_CONFLICT', 'The supplied Founder ID and email do not identify the same record.', 409);
  }

  let venture = input.ventureId ? await getVenture(config.db, input.ventureId) : null;
  if (input.ventureId && !venture) throw new GVError('GV_NOT_FOUND', 'Venture not found.', 404);
  if (!venture && founder && input.ventureInput.venture_name) {
    venture = await resolveFounderVentureByExactName(config.db, founder.founder_id, input.ventureInput.venture_name);
  }

  const timestamp = now();
  const creatingFounder = !founder;
  const creatingVenture = !venture;
  if (creatingFounder) {
    const displayEmail = requiredString(input.founderInput.email, 'founder.email', 254);
    founder = {
      founder_id: newId('fdr'),
      first_name: optionalString(input.founderInput.first_name, 'founder.first_name', 120),
      last_name: optionalString(input.founderInput.last_name, 'founder.last_name', 120),
      email: displayEmail,
      normalized_email: input.normalizedEmail,
      phone: optionalString(input.founderInput.phone, 'founder.phone', 60),
      consent_status: optionalString(input.founderInput.consent_status, 'founder.consent_status', 40) || 'approved',
      status: 'active', record_version: 1,
      profile_json: boundedJson(input.founderInput.profile, 'founder.profile'),
      created_at: timestamp, updated_at: timestamp
    };
  }
  if (creatingVenture) {
    venture = {
      venture_id: newId('ven'),
      venture_name: requiredString(input.ventureInput.venture_name, 'venture.venture_name', 240),
      stage: optionalString(input.ventureInput.stage, 'venture.stage', 80),
      website: optionalString(input.ventureInput.website, 'venture.website', 400),
      industry: optionalString(input.ventureInput.industry, 'venture.industry', 120),
      revenue_range: optionalString(input.ventureInput.revenue_range, 'venture.revenue_range', 120),
      profile_json: boundedJson(input.ventureInput.profile, 'venture.profile'),
      status: 'active', record_version: 1,
      created_at: timestamp, updated_at: timestamp
    };
  }

  let role = await getRole(config.db, founder.founder_id, venture.venture_id);
  if (!creatingVenture && !role) {
    throw new GVError('GV_FORBIDDEN', 'The Founder is not authorized for the requested Venture.', 403);
  }
  if (!role) {
    role = {
      founder_id: founder.founder_id,
      venture_id: venture.venture_id,
      role_code: input.roleCode,
      is_primary: input.isPrimary,
      status: 'active', created_at: timestamp, updated_at: timestamp
    };
  }

  let bmr = await getBmrByVenture(config.db, venture.venture_id);
  if (input.bmrId && (!bmr || input.bmrId !== bmr.bmr_id)) {
    throw new GVError('GV_SCOPE_MISMATCH', 'The supplied BMR does not belong to the requested Venture.', 409);
  }
  const creatingBmr = !bmr;
  const sessionId = newId('ses');
  if (creatingBmr) {
    bmr = {
      bmr_id: newId('bmr'), venture_id: venture.venture_id, status: 'active', record_version: 1,
      current_session_id: sessionId, opened_at: timestamp, closed_at: null,
      created_at: timestamp, updated_at: timestamp
    };
  }
  const session = {
    session_id: sessionId, bmr_id: bmr.bmr_id, venture_id: venture.venture_id,
    founder_id: founder.founder_id, client_session_key: input.clientSessionKey,
    source: input.source, current_stage: input.currentStage, status: 'active',
    started_at: timestamp, completed_at: null, created_at: timestamp, updated_at: timestamp
  };
  const resultingBmr = creatingBmr
    ? bmr
    : { ...bmr, current_session_id: sessionId, record_version: Number(bmr.record_version) + 1, updated_at: timestamp };
  const identity = {
    founder,
    venture,
    founder_venture_role: role,
    business_medical_record: resultingBmr,
    session
  };
  const payload = { data: { identity }, meta: { record_version: resultingBmr.record_version } };
  const statements = [];

  if (creatingFounder) {
    statements.push(config.db.prepare(
      `INSERT INTO gv1_founders
         (founder_id, first_name, last_name, email, normalized_email, phone,
          consent_status, status, record_version, profile_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?)`
    ).bind(
      founder.founder_id, founder.first_name, founder.last_name, founder.email,
      founder.normalized_email, founder.phone, founder.consent_status,
      founder.profile_json, timestamp, timestamp
    ));
    statements.push(auditStatement(config.db, {
      entityType: 'founder', entityId: founder.founder_id, operation: 'create', newVersion: 1,
      actor, source: input.source, reasonCode: 'day2_founder_created',
      changedFields: ['founder_id', 'email'], correlation: corr,
      environment: config.environment, timestamp
    }));
  }
  if (creatingVenture) {
    statements.push(config.db.prepare(
      `INSERT INTO gv1_ventures
         (venture_id, venture_name, stage, website, industry, revenue_range,
          profile_json, status, record_version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?)`
    ).bind(
      venture.venture_id, venture.venture_name, venture.stage, venture.website,
      venture.industry, venture.revenue_range, venture.profile_json, timestamp, timestamp
    ));
    statements.push(auditStatement(config.db, {
      entityType: 'venture', entityId: venture.venture_id, operation: 'create', newVersion: 1,
      actor, source: input.source, reasonCode: 'day2_venture_created',
      changedFields: ['venture_id', 'venture_name'], correlation: corr,
      environment: config.environment, timestamp
    }));
  }
  if (!await getRole(config.db, founder.founder_id, venture.venture_id)) {
    statements.push(config.db.prepare(
      `INSERT INTO gv1_founder_venture_roles
         (founder_id, venture_id, role_code, is_primary, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?)`
    ).bind(
      founder.founder_id, venture.venture_id, role.role_code,
      role.is_primary, timestamp, timestamp
    ));
    statements.push(auditStatement(config.db, {
      entityType: 'founder_venture_role',
      entityId: `${founder.founder_id}:${venture.venture_id}:${role.role_code}`,
      operation: 'create', newVersion: 1, actor, source: input.source,
      reasonCode: 'day2_founder_venture_role_created',
      changedFields: ['founder_id', 'venture_id', 'role_code', 'is_primary'],
      correlation: corr, environment: config.environment, timestamp
    }));
  }
  if (creatingBmr) {
    statements.push(config.db.prepare(
      `INSERT INTO gv1_business_medical_records
         (bmr_id, venture_id, status, record_version, current_session_id,
          opened_at, closed_at, created_at, updated_at)
       VALUES (?, ?, 'active', 1, ?, ?, NULL, ?, ?)`
    ).bind(bmr.bmr_id, venture.venture_id, sessionId, timestamp, timestamp, timestamp));
    statements.push(auditStatement(config.db, {
      entityType: 'business_medical_record', entityId: bmr.bmr_id,
      operation: 'create', newVersion: 1, actor, source: input.source,
      reasonCode: 'day2_bmr_created',
      changedFields: ['bmr_id', 'venture_id', 'status', 'current_session_id'],
      correlation: corr, environment: config.environment, timestamp
    }));
  }
  statements.push(config.db.prepare(
    `INSERT INTO gv1_assessment_sessions
       (session_id, bmr_id, venture_id, founder_id, client_session_key, source,
        current_stage, status, started_at, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, NULL, ?, ?)`
  ).bind(
    sessionId, bmr.bmr_id, venture.venture_id, founder.founder_id,
    input.clientSessionKey, input.source, input.currentStage,
    timestamp, timestamp, timestamp
  ));
  statements.push(auditStatement(config.db, {
    entityType: 'assessment_session', entityId: sessionId, operation: 'create', newVersion: 1,
    actor, source: input.source, reasonCode: 'day2_session_created',
    changedFields: ['session_id', 'founder_id', 'venture_id', 'bmr_id', 'client_session_key'],
    correlation: corr, environment: config.environment, timestamp
  }));
  if (!creatingBmr) {
    statements.push(config.db.prepare(
      `UPDATE gv1_business_medical_records
       SET current_session_id = ?, record_version = record_version + 1, updated_at = ?
       WHERE bmr_id = ? AND venture_id = ?`
    ).bind(sessionId, timestamp, bmr.bmr_id, venture.venture_id));
    statements.push(auditStatement(config.db, {
      entityType: 'business_medical_record', entityId: bmr.bmr_id,
      operation: 'update', priorVersion: bmr.record_version, newVersion: resultingBmr.record_version,
      actor, source: input.source, reasonCode: 'day2_current_session_changed',
      changedFields: ['current_session_id'], correlation: corr,
      environment: config.environment, timestamp
    }));
  }
  const eventKey = `day2:${sessionId}:identity_session_ready`;
  statements.push(config.db.prepare(
    `INSERT INTO gv1_journey_events
       (journey_event_id, event_key, bmr_id, session_id, event_name, product,
        current_stage, occurred_at, actor_type, metadata_json, request_fingerprint,
        correlation_id, environment, created_at)
     VALUES (?, ?, ?, ?, 'identity_session_ready', 'GalviVault', ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    newId('evt'), eventKey, bmr.bmr_id, sessionId, input.currentStage,
    timestamp, actor.actorType,
    JSON.stringify({ founder_id: founder.founder_id, venture_id: venture.venture_id }),
    requestFingerprint, corr, config.environment, timestamp
  ));
  statements.push(receiptStatement(config.db, {
    scope: 'day2:session:create-or-resume', key, requestFingerprint, status: 201,
    entityType: 'assessment_session', entityId: sessionId, responsePayload: payload, timestamp
  }));

  try {
    await batch(config.db, statements);
  } catch (error) {
    const existingByKey = await getSessionByBusinessKey(config.db, input.clientSessionKey);
    if (existingByKey) {
      const concurrentIdentity = await getIdentitySet(config.db, existingByKey.session_id);
      const concurrentPayload = {
        data: { identity: concurrentIdentity },
        meta: { record_version: concurrentIdentity?.business_medical_record?.record_version || null }
      };
      try {
        await receiptStatement(config.db, {
          scope: 'day2:session:create-or-resume', key, requestFingerprint, status: 200,
          entityType: 'assessment_session', entityId: existingByKey.session_id,
          responsePayload: concurrentPayload, timestamp: now()
        }).run();
      } catch {
        // A concurrent request may have completed the receipt.
      }
      return success(config, corr, origin, concurrentPayload.data, 200, 'resumed', concurrentPayload.meta);
    }
    throw error;
  }
  return success(config, corr, origin, payload.data, 201, 'created', payload.meta);
}

async function retrieveFounder(config, corr, origin, founderId) {
  requireDb(config);
  const founder = await getFounder(config.db, validateOpaqueId(founderId, 'founder_id', 'fdr'));
  if (!founder) throw new GVError('GV_NOT_FOUND', 'Founder not found.', 404);
  return success(config, corr, origin, { founder }, 200, 'ok', { record_version: founder.record_version });
}

async function retrieveVenture(config, corr, origin, ventureId) {
  requireDb(config);
  const venture = await getVenture(config.db, validateOpaqueId(ventureId, 'venture_id', 'ven'));
  if (!venture) throw new GVError('GV_NOT_FOUND', 'Venture not found.', 404);
  const bmr = await getBmrByVenture(config.db, venture.venture_id);
  return success(config, corr, origin, { venture, bmr_id: bmr?.bmr_id || null }, 200, 'ok', {
    record_version: venture.record_version
  });
}

async function retrieveBmr(config, corr, origin, bmrId) {
  requireDb(config);
  const bmr = await getBmr(config.db, validateOpaqueId(bmrId, 'bmr_id', 'bmr'));
  if (!bmr) throw new GVError('GV_NOT_FOUND', 'Business Medical Record not found.', 404);
  return success(config, corr, origin, { business_medical_record: bmr }, 200, 'ok', {
    record_version: bmr.record_version
  });
}

async function retrieveSession(config, corr, origin, sessionId) {
  requireDb(config);
  const identity = await getIdentitySet(config.db, validateOpaqueId(sessionId, 'session_id', null));
  if (!identity) throw new GVError('GV_NOT_FOUND', 'Assessment Session not found.', 404);
  return success(config, corr, origin, {
    identity,
    session: identity.session,
    founder: identity.founder,
    venture: identity.venture,
    business_medical_record: identity.business_medical_record,
    founder_venture_role: identity.founder_venture_role
  }, 200, 'ok', { record_version: identity.business_medical_record?.record_version || null });
}

async function day2Readiness(config, corr, origin) {
  const state = await day2SchemaState(config);
  if (!state.ready) {
    throw new GVError('GV_NOT_READY', 'The GalviVault schema does not meet the Day 2 minimum.', 503, [
      { field: 'schema_version', issue: `requires_${REQUIRED_SCHEMA}` }
    ]);
  }
  return success(config, corr, origin, {
    service: SERVICE,
    ready: true,
    ...state
  }, 200, 'ok', { schema_version: state.current_schema_version });
}

async function compatibilityAction(request, config, corr, origin, body) {
  const action = clean(body.action);
  const payload = body.payload && typeof body.payload === 'object' ? body.payload : body;
  switch (action) {
    case 'create_or_resolve_founder':
      return createOrResolveFounder(request, config, corr, origin, payload.founder || payload);
    case 'update_founder':
      return updateFounder(request, config, corr, origin, payload.founder_id, payload);
    case 'create_venture':
      return createVenture(request, config, corr, origin, payload.venture || payload);
    case 'update_venture':
      return updateVenture(request, config, corr, origin, payload.venture_id, payload);
    case 'create_or_resolve_founder_role':
      return createOrResolveRole(request, config, corr, origin, payload.venture_id, payload);
    case 'create_or_get_bmr':
      return createOrGetBmr(request, config, corr, origin, payload);
    case 'create_or_resume_session':
      return createOrResumeSession(request, config, corr, origin, payload);
    case 'get_founder':
      return retrieveFounder(config, corr, origin, payload.founder_id);
    case 'get_venture':
      return retrieveVenture(config, corr, origin, payload.venture_id);
    case 'get_bmr':
      return retrieveBmr(config, corr, origin, payload.bmr_id);
    case 'get_session':
      return retrieveSession(config, corr, origin, payload.session_id);
    default:
      throw new GVError('GV_NOT_FOUND', 'The requested Day 2 action was not found.', 404);
  }
}

function isDay1SyntheticSession(body) {
  return clean(body?.session_id).startsWith('ses_day1_') &&
    clean(body?.founder_id).startsWith('fdr_day1_') &&
    clean(body?.venture_id).startsWith('ven_day1_') &&
    clean(body?.bmr_id).startsWith('bmr_day1_');
}

async function route(request, env, ctx) {
  const config = runtime(env);
  const corr = correlationId(request);
  const origin = originState(request, config);
  try {
    requireQa(config);
    if (!origin.allowed) throw new GVError('GV_FORBIDDEN', 'The request origin is not allowed.', 403);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: responseHeaders(config, corr, origin) });
    }

    if (request.method === 'GET' && path === '/api/v1/day2/readiness') {
      return await day2Readiness(config, corr, origin);
    }
    if (request.method === 'GET' && path === '/api/v1/day2/schema-version') {
      const state = await day2SchemaState(config);
      if (!state.ready) throw new GVError('GV_NOT_READY', 'The GalviVault Day 2 schema is unavailable.', 503);
      return success(config, corr, origin, state, 200, 'ok', { schema_version: state.current_schema_version });
    }

    if (request.method === 'POST' && path === '/api') {
      const body = await readJson(request.clone());
      if (clean(body.action).startsWith('day2_') || [
        'create_or_resolve_founder', 'update_founder', 'create_venture', 'update_venture',
        'create_or_resolve_founder_role', 'create_or_get_bmr', 'create_or_resume_session',
        'get_founder', 'get_venture', 'get_bmr', 'get_session'
      ].includes(clean(body.action))) {
        return await compatibilityAction(request, config, corr, origin, body);
      }
      return await day1Worker.fetch(request, env, ctx);
    }

    if (request.method === 'POST' && path === '/api/v1/founders') {
      return await createOrResolveFounder(request, config, corr, origin);
    }
    const founderMatch = path.match(/^\/api\/v1\/founders\/([^/]+)$/);
    if (founderMatch && request.method === 'GET') {
      return await retrieveFounder(config, corr, origin, decodeURIComponent(founderMatch[1]));
    }
    if (founderMatch && request.method === 'PATCH') {
      return await updateFounder(request, config, corr, origin, decodeURIComponent(founderMatch[1]));
    }

    if (request.method === 'POST' && path === '/api/v1/ventures') {
      return await createVenture(request, config, corr, origin);
    }
    const roleMatch = path.match(/^\/api\/v1\/ventures\/([^/]+)\/founder-roles$/);
    if (roleMatch && request.method === 'POST') {
      return await createOrResolveRole(request, config, corr, origin, decodeURIComponent(roleMatch[1]));
    }
    const ventureMatch = path.match(/^\/api\/v1\/ventures\/([^/]+)$/);
    if (ventureMatch && request.method === 'GET') {
      return await retrieveVenture(config, corr, origin, decodeURIComponent(ventureMatch[1]));
    }
    if (ventureMatch && request.method === 'PATCH') {
      return await updateVenture(request, config, corr, origin, decodeURIComponent(ventureMatch[1]));
    }

    if (request.method === 'POST' && path === '/api/v1/business-medical-records') {
      return await createOrGetBmr(request, config, corr, origin);
    }
    const bmrMatch = path.match(/^\/api\/v1\/business-medical-records\/([^/]+)$/);
    if (bmrMatch && request.method === 'GET') {
      return await retrieveBmr(config, corr, origin, decodeURIComponent(bmrMatch[1]));
    }

    if (request.method === 'POST' && path === '/api/v1/sessions') {
      const body = await readJson(request.clone());
      if (isDay1SyntheticSession(body)) return await day1Worker.fetch(request, env, ctx);
      return await createOrResumeSession(request, config, corr, origin, body);
    }
    const sessionMatch = path.match(/^\/api\/v1\/sessions\/([^/]+)$/);
    if (sessionMatch && request.method === 'GET') {
      return await retrieveSession(config, corr, origin, decodeURIComponent(sessionMatch[1]));
    }

    return await day1Worker.fetch(request, env, ctx);
  } catch (error) {
    return failure(config, corr, origin, error);
  }
}

export default { fetch: route };
