import day1Worker from './day1.js';

const API_VERSION = 'v1';
const REQUIRED_SCHEMA = '0003';
const VALUE_TYPES = new Set(['text','number','boolean','date','json','reference','file_reference']);
const SOURCE_TYPES = new Set(['assessment_answer','facilitator_capture','imported_reference','file_reference','measurement','transcript_excerpt']);
const OPERATOR_ROLES = new Set(['operator','service','admin']);
const IMPORT_ROLES = new Set(['import','admin']);
const SAFE_ID = /^[A-Za-z0-9:._-]{3,180}$/;
const MAX_BODY_BYTES = 65536;

class GVError extends Error {
  constructor(code, message, status = 400, details = undefined, retryable = false) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.retryable = retryable;
  }
}

const clean = (value) => String(value ?? '').trim();
const now = () => new Date().toISOString();
const newId = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const first = async (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const all = async (db, sql, ...params) => {
  const result = await db.prepare(sql).bind(...params).all();
  return Array.isArray(result?.results) ? result.results : [];
};

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

async function hash(scope, value) {
  const bytes = new TextEncoder().encode(`${scope}:${JSON.stringify(canonicalize(value))}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function config(env) {
  return {
    db: env?.DB,
    environment: clean(env?.ENVIRONMENT || 'unknown').toLowerCase(),
    allowedOrigins: clean(env?.ALLOWED_ORIGINS).split(',').map((v) => v.trim()).filter(Boolean)
  };
}

function correlationId(request) {
  const supplied = clean(request.headers.get('X-Correlation-Id'));
  return SAFE_ID.test(supplied) ? supplied : newId('corr');
}

function originState(request, cfg) {
  const origin = clean(request.headers.get('Origin'));
  if (!origin) return { origin: null, allowed: true };
  return { origin, allowed: cfg.allowedOrigins.includes(origin) };
}

function responseHeaders(cfg, corr, origin) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-GalviVault-Environment': cfg.environment,
    'X-GalviVault-Api-Version': API_VERSION,
    'X-Correlation-Id': corr,
    'Vary': 'Origin'
  });
  if (origin?.origin && origin.allowed) {
    headers.set('Access-Control-Allow-Origin', origin.origin);
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, X-Correlation-Id, X-Galvi-Role, X-Galvi-Actor-Id');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Max-Age', '600');
  }
  return headers;
}

function ok(cfg, corr, origin, data, status = 200, state = 'ok', meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    status: state,
    environment: cfg.environment,
    correlation_id: corr,
    data,
    meta: {
      api_version: API_VERSION,
      schema_version: REQUIRED_SCHEMA,
      idempotent_replay: Boolean(meta.idempotent_replay),
      ...meta
    }
  }), { status, headers: responseHeaders(cfg, corr, origin) });
}

function fail(cfg, corr, origin, error) {
  const safe = error instanceof GVError ? error : new GVError('GV_INTERNAL', 'An unexpected error occurred.', 500, undefined, true);
  let state = 'invalid_request';
  if (safe.status === 401) state = 'unauthorized';
  else if (safe.status === 403) state = 'forbidden';
  else if (safe.status === 404) state = 'not_found';
  else if (safe.status === 409) state = 'conflict';
  else if (safe.status === 503) state = 'unavailable';
  else if (safe.status >= 500) state = 'internal_error';
  return new Response(JSON.stringify({
    success: false,
    status: state,
    environment: cfg.environment,
    correlation_id: corr,
    error: {
      code: safe.code,
      message: safe.message,
      retryable: Boolean(safe.retryable),
      ...(safe.details ? { details: safe.details } : {})
    },
    meta: { api_version: API_VERSION, schema_version: REQUIRED_SCHEMA }
  }), { status: safe.status, headers: responseHeaders(cfg, corr, origin) });
}

function requireRuntime(cfg) {
  if (!['qa','local'].includes(cfg.environment)) throw new GVError('GV_ENV_MISCONFIGURED', 'Day 3 is restricted to QA or local.', 503);
  if (!cfg.db || typeof cfg.db.prepare !== 'function') throw new GVError('GV_DB_UNAVAILABLE', 'The GalviVault DB binding is unavailable.', 503, undefined, true);
}

async function jsonBody(request) {
  if (!clean(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) {
    throw new GVError('GV_REQ_CONTENT_TYPE', 'Content-Type must be application/json.', 415);
  }
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > MAX_BODY_BYTES) throw new GVError('GV_REQ_TOO_LARGE', 'The request body is too large.', 413);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new GVError('GV_REQ_TOO_LARGE', 'The request body is too large.', 413);
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('object required');
    return parsed;
  } catch {
    throw new GVError('GV_REQ_BODY_INVALID', 'The request body must be a JSON object.', 400);
  }
}

function idempotencyKey(request) {
  const key = clean(request.headers.get('Idempotency-Key'));
  if (!SAFE_ID.test(key)) throw new GVError('GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key is required.', 400);
  return key;
}

function actor(request) {
  return {
    role: clean(request.headers.get('X-Galvi-Role')).toLowerCase() || 'public',
    id: clean(request.headers.get('X-Galvi-Actor-Id')) || 'public-session'
  };
}

function requireOperator(request) {
  const resolved = actor(request);
  if (!OPERATOR_ROLES.has(resolved.role)) throw new GVError('GV_AUTH_FORBIDDEN', 'Authorized operator scope is required.', 403);
  return resolved;
}

function requireImport(request) {
  const resolved = actor(request);
  if (!IMPORT_ROLES.has(resolved.role)) throw new GVError('GV_AUTH_FORBIDDEN', 'Authorized import scope is required.', 403);
  return resolved;
}

function requireId(name, value) {
  const normalized = clean(value);
  if (!SAFE_ID.test(normalized)) throw new GVError('GV_REQ_SCHEMA', `${name} is invalid.`, 422, { fields: [{ field: name, issue: 'invalid' }] });
  return normalized;
}

function requireText(name, value, max = 500) {
  const normalized = clean(value);
  if (!normalized || normalized.length > max) throw new GVError('GV_REQ_SCHEMA', `${name} is required and must be bounded.`, 422, { fields: [{ field: name, issue: 'required_or_oversized' }] });
  return normalized;
}

function validateCapturedAt(value) {
  const text = requireText('captured_at', value, 64);
  const time = Date.parse(text);
  if (!Number.isFinite(time) || time > Date.now() + 5 * 60 * 1000) throw new GVError('GV_REQ_SCHEMA', 'captured_at is invalid.', 422);
  return new Date(time).toISOString();
}

function validateTyped(body) {
  const valueType = clean(body.value_type).toLowerCase();
  if (!VALUE_TYPES.has(valueType)) throw new GVError('GV_REQ_SCHEMA', 'value_type is unsupported.', 422);
  const fields = ['value_text','value_number','value_boolean','value_date','value_json'];
  const populated = fields.filter((field) => body[field] !== undefined && body[field] !== null);
  const requiredField = valueType === 'number' ? 'value_number'
    : valueType === 'boolean' ? 'value_boolean'
      : valueType === 'date' ? 'value_date'
        : valueType === 'json' ? 'value_json'
          : 'value_text';
  if (populated.length !== 1 || populated[0] !== requiredField) {
    throw new GVError('GV_REQ_SCHEMA', 'Exactly one compatible typed value field is required.', 422, { fields: populated });
  }
  const typed = { value_type: valueType, value_text: null, value_number: null, value_boolean: null, value_date: null, value_json: null };
  if (requiredField === 'value_text') {
    typed.value_text = requireText(requiredField, body[requiredField], valueType === 'file_reference' ? 1000 : 4000);
    if (valueType === 'reference' && !/^(https?:\/\/|[A-Za-z0-9][A-Za-z0-9:._\/-]{2,})/.test(typed.value_text)) throw new GVError('GV_REQ_SCHEMA', 'The reference value is invalid.', 422);
  } else if (requiredField === 'value_number') {
    if (typeof body.value_number !== 'number' || !Number.isFinite(body.value_number)) throw new GVError('GV_REQ_SCHEMA', 'value_number must be finite.', 422);
    typed.value_number = body.value_number;
  } else if (requiredField === 'value_boolean') {
    if (typeof body.value_boolean !== 'boolean') throw new GVError('GV_REQ_SCHEMA', 'value_boolean must be a JSON boolean.', 422);
    typed.value_boolean = body.value_boolean ? 1 : 0;
  } else if (requiredField === 'value_date') {
    const parsed = Date.parse(requireText(requiredField, body.value_date, 64));
    if (!Number.isFinite(parsed)) throw new GVError('GV_REQ_SCHEMA', 'value_date is invalid.', 422);
    typed.value_date = new Date(parsed).toISOString();
  } else {
    const candidate = body.value_json;
    if (!candidate || typeof candidate !== 'object') throw new GVError('GV_REQ_SCHEMA', 'value_json must be an object or array.', 422);
    const serialized = JSON.stringify(canonicalize(candidate));
    if (serialized.length > 12000) throw new GVError('GV_REQ_SCHEMA', 'value_json is oversized.', 422);
    typed.value_json = serialized;
  }
  return typed;
}

async function loadReceipt(db, scope, key) {
  return first(db, `SELECT scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at
    FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=?`, scope, key);
}

function receiptStmt(db, { scope, key, fingerprint, status, entityType, entityId, timestamp }) {
  return db.prepare(`INSERT INTO gv1_idempotency_keys
    (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at)
    VALUES (?,?,?,?,?,?,?,?)`)
    .bind(newId('idem'), scope, key, fingerprint, status, entityType, entityId, timestamp);
}

async function checkReplay(db, scope, key, fingerprint) {
  const receipt = await loadReceipt(db, scope, key);
  if (!receipt) return null;
  if (receipt.request_fingerprint !== fingerprint) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The idempotency key was reused with different content.', 409);
  return receipt;
}

async function loadScope(db, bmrId, sessionId = null) {
  const bmr = await first(db, `SELECT bmr_id,venture_id,status,record_version,current_session_id FROM gv1_business_medical_records WHERE bmr_id=?`, bmrId);
  if (!bmr) throw new GVError('GV_NOT_FOUND', 'The Business Medical Record was not found.', 404);
  let session = null;
  if (sessionId) {
    session = await first(db, `SELECT session_id,bmr_id,venture_id,founder_id,status FROM gv1_assessment_sessions WHERE session_id=?`, sessionId);
    if (!session) throw new GVError('GV_NOT_FOUND', 'The assessment session was not found.', 404);
    if (session.bmr_id !== bmr.bmr_id || session.venture_id !== bmr.venture_id) throw new GVError('GV_AUTH_FORBIDDEN', 'The session is outside the requested BMR scope.', 403);
  }
  return { bmr, session };
}

async function loadEvidence(db, evidenceId) {
  return first(db, `SELECT * FROM gv1_evidence_items WHERE evidence_id=?`, evidenceId);
}

async function evidenceView(db, evidence) {
  if (!evidence) return null;
  const successor = await first(db, `SELECT evidence_id FROM gv1_evidence_items WHERE supersedes_evidence_id=? ORDER BY version_no LIMIT 1`, evidence.evidence_id);
  const relationships = await all(db, `SELECT relationship_id,from_evidence_id,to_evidence_id,relationship_type,rationale,created_at,correlation_id
    FROM gv1_evidence_relationships WHERE from_evidence_id=? OR to_evidence_id=? ORDER BY created_at,relationship_id`, evidence.evidence_id, evidence.evidence_id);
  return {
    ...evidence,
    value_boolean: evidence.value_boolean === null || evidence.value_boolean === undefined ? null : Boolean(evidence.value_boolean),
    value_json: evidence.value_json ? JSON.parse(evidence.value_json) : null,
    is_current: !successor && !['rejected','archived'].includes(evidence.status),
    superseded_by_evidence_id: successor?.evidence_id || null,
    relationships
  };
}

async function question(db, questionId, version) {
  return first(db, `SELECT question_id,product,version,dimension,prompt,response_type,required_flag,minimum_value,maximum_value,weight,score_direction,status,effective_at,retired_at
    FROM gv1_question_definitions WHERE question_id=? AND version=?`, questionId, version);
}

async function answerView(db, answerId) {
  if (!answerId) return null;
  return first(db, `SELECT answer_id,session_id,question_id,bmr_id,question_version,answer_group_id,version_no,supersedes_answer_id,
    raw_value_text,raw_value_number,normalized_value_text,normalized_value_number,confidence_effect,source,captured_at,status,content_hash
    FROM gv1_assessment_answers WHERE answer_id=?`, answerId);
}

async function submitEvidence(request, cfg, corr, origin) {
  requireRuntime(cfg);
  const input = await jsonBody(request);
  const key = idempotencyKey(request);
  const typed = validateTyped(input);
  const bmrId = requireId('bmr_id', input.bmr_id);
  const sessionId = input.session_id ? requireId('session_id', input.session_id) : null;
  const sourceType = requireText('source_type', input.source_type, 80).toLowerCase();
  if (!SOURCE_TYPES.has(sourceType)) throw new GVError('GV_REQ_SCHEMA', 'source_type is unsupported.', 422);
  const sourceRef = input.source_ref ? requireText('source_ref', input.source_ref, 500) : null;
  const capturedAt = validateCapturedAt(input.captured_at);
  const consent = input.consent_status ? requireText('consent_status', input.consent_status, 80) : null;
  const actorCtx = actor(request);
  await loadScope(cfg.db, bmrId, sessionId);

  let answerInput = null;
  let questionDef = null;
  if (input.assessment_answer) {
    answerInput = input.assessment_answer;
    const questionId = requireText('question_id', answerInput.question_id, 180);
    const questionVersion = requireText('question_version', answerInput.question_version, 80);
    questionDef = await question(cfg.db, questionId, questionVersion);
    if (!questionDef || questionDef.status !== 'active') throw new GVError('GV_NOT_FOUND', 'The active question definition was not found.', 404);
    if (questionDef.response_type === 'number' && typed.value_type !== 'number') throw new GVError('GV_REQ_SCHEMA', 'The question requires numeric evidence.', 422);
    if (typed.value_type === 'number') {
      if (questionDef.minimum_value !== null && typed.value_number < Number(questionDef.minimum_value)) throw new GVError('GV_REQ_SCHEMA', 'The numeric value is below the question minimum.', 422);
      if (questionDef.maximum_value !== null && typed.value_number > Number(questionDef.maximum_value)) throw new GVError('GV_REQ_SCHEMA', 'The numeric value exceeds the question maximum.', 422);
    }
  }

  const semantic = {
    bmr_id: bmrId, session_id: sessionId, source_type: sourceType, source_ref: sourceRef,
    captured_at: capturedAt, consent_status: consent, typed,
    assessment_answer: answerInput || null
  };
  const fingerprint = await hash('evidence-submit', semantic);
  const replay = await checkReplay(cfg.db, 'evidence:submit', key, fingerprint);
  if (replay) {
    const existing = await loadEvidence(cfg.db, replay.response_entity_id);
    return ok(cfg, corr, origin, {
      evidence: await evidenceView(cfg.db, existing),
      answer: existing?.source_type === 'assessment_answer' ? await answerView(cfg.db, existing.source_ref) : null
    }, 200, 'no_change', { idempotent_replay: true });
  }

  const timestamp = now();
  let answerId = null;
  let answerGroupId = null;
  let answerVersion = null;
  let answerStmt = null;
  if (answerInput) {
    answerId = newId('ans');
    answerGroupId = newId('ang');
    answerVersion = 1;
    const rawText = answerInput.raw_value_text ?? null;
    const rawNumber = answerInput.raw_value_number ?? null;
    const normalizedText = answerInput.normalized_value_text ?? null;
    const normalizedNumber = answerInput.normalized_value_number ?? null;
    const confidenceEffect = answerInput.confidence_effect ?? null;
    if (typed.value_type === 'number' && (typeof rawNumber !== 'number' || typeof normalizedNumber !== 'number')) {
      throw new GVError('GV_REQ_SCHEMA', 'Numeric assessment answers require raw_value_number and normalized_value_number.', 422);
    }
    const answerHash = await hash('assessment-answer', {
      question_id: questionDef.question_id, question_version: questionDef.version,
      raw_value_text: rawText, raw_value_number: rawNumber,
      normalized_value_text: normalizedText, normalized_value_number: normalizedNumber,
      confidence_effect: confidenceEffect
    });
    answerStmt = cfg.db.prepare(`INSERT INTO gv1_assessment_answers
      (answer_id,session_id,question_id,answer_text,answer_number,answer_json,evidence_version,created_at,updated_at,
       bmr_id,question_version,answer_group_id,version_no,supersedes_answer_id,raw_value_text,raw_value_number,
       normalized_value_text,normalized_value_number,confidence_effect,source,captured_at,status,content_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      answerId, sessionId, questionDef.question_id,
      typed.value_text, typed.value_number, typed.value_json, 1, timestamp, timestamp,
      bmrId, questionDef.version, answerGroupId, 1, null, rawText, rawNumber,
      normalizedText, normalizedNumber, confidenceEffect, sourceType, capturedAt, 'draft', answerHash
    );
  }

  const evidenceId = newId('evd');
  const evidenceGroupId = newId('evg');
  const effectiveSourceRef = answerId || sourceRef;
  const contentHash = await hash('evidence-content', {
    bmr_id: bmrId, session_id: sessionId, source_type: sourceType, source_ref: effectiveSourceRef,
    captured_at: capturedAt, consent_status: consent, ...typed
  });
  const eventId = newId('jev');
  const auditId = newId('aud');
  const eventKey = `day3:evidence_submitted:${evidenceId}`;
  const evidenceStmt = cfg.db.prepare(`INSERT INTO gv1_evidence_items
    (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,
     evidence_group_id,version_no,supersedes_evidence_id,source_type,source_ref,value_type,value_text,value_number,value_boolean,value_date,value_json,
     status,consent_status,source_actor_type,source_actor_id,captured_at,content_hash,rejection_reason,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
    evidenceId, bmrId, sessionId, typed.value_type, 'GalviVault', effectiveSourceRef,
    JSON.stringify({ value_type: typed.value_type, value_text: typed.value_text, value_number: typed.value_number,
      value_boolean: typed.value_boolean, value_date: typed.value_date, value_json: typed.value_json }),
    null, 1, timestamp, evidenceGroupId, 1, null, sourceType, effectiveSourceRef,
    typed.value_type, typed.value_text, typed.value_number, typed.value_boolean, typed.value_date, typed.value_json,
    'draft', consent, actorCtx.role, actorCtx.id, capturedAt, contentHash, null, timestamp
  );

  const statements = [];
  if (answerStmt) statements.push(answerStmt);
  statements.push(
    evidenceStmt,
    cfg.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
      eventId, eventKey, bmrId, sessionId, 'evidence_submitted', timestamp, actorCtx.role,
      JSON.stringify({ evidence_id: evidenceId, answer_id: answerId, evidence_group_id: evidenceGroupId }),
      fingerprint, corr, cfg.environment, timestamp
    ),
    cfg.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      auditId, 'evidence', evidenceId, 'create', null, 1, actorCtx.role,
      sourceType, 'day3_evidence_submitted', JSON.stringify({ evidence_group_id: evidenceGroupId, version_no: 1 }),
      corr, cfg.environment, timestamp, timestamp
    ),
    receiptStmt(cfg.db, { scope: 'evidence:submit', key, fingerprint, status: 201, entityType: 'evidence', entityId: evidenceId, timestamp })
  );
  await cfg.db.batch(statements);
  const created = await loadEvidence(cfg.db, evidenceId);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, created), answer: answerId ? await answerView(cfg.db, answerId) : null }, 201, 'created');
}

async function acceptEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const resolvedActor = requireOperator(request);
  const input = await jsonBody(request);
  const key = idempotencyKey(request);
  const reason = input.reason ? requireText('reason', input.reason, 500) : 'accepted';
  const evidence = await loadEvidence(cfg.db, requireId('evidence_id', evidenceId));
  if (!evidence) throw new GVError('GV_NOT_FOUND', 'The evidence was not found.', 404);
  const fingerprint = await hash('evidence-accept', { evidence_id: evidence.evidence_id, reason });
  const replay = await checkReplay(cfg.db, 'evidence:accept', key, fingerprint);
  if (replay) {
    return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, evidence.evidence_id)) }, 200, 'no_change', { idempotent_replay: true });
  }
  if (evidence.status === 'accepted') {
    return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, evidence) }, 200, 'no_change');
  }
  if (evidence.status !== 'draft') throw new GVError('GV_VERSION_CONFLICT', 'Only draft evidence can be accepted.', 409);
  const timestamp = now();
  const beforeHash = evidence.content_hash;
  const results = await cfg.db.batch([
    cfg.db.prepare(`UPDATE gv1_evidence_items SET status='accepted' WHERE evidence_id=? AND status='draft'`).bind(evidence.evidence_id),
    cfg.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
      newId('jev'), `day3:evidence_accepted:${evidence.evidence_id}`, evidence.bmr_id, evidence.session_id,
      'evidence_accepted', timestamp, resolvedActor.role, JSON.stringify({ evidence_id: evidence.evidence_id, version_no: evidence.version_no }),
      fingerprint, corr, cfg.environment, timestamp
    ),
    cfg.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      newId('aud'), 'evidence', evidence.evidence_id, 'accept', evidence.version_no, evidence.version_no,
      resolvedActor.role, evidence.source_type, reason, JSON.stringify({ status: 'accepted' }), corr, cfg.environment, timestamp, timestamp
    ),
    receiptStmt(cfg.db, { scope: 'evidence:accept', key, fingerprint, status: 200, entityType: 'evidence', entityId: evidence.evidence_id, timestamp })
  ]);
  const changed = Number(results?.[0]?.meta?.changes ?? results?.[0]?.changes ?? 0);
  if (changed !== 1) throw new GVError('GV_VERSION_CONFLICT', 'The evidence acceptance state changed concurrently.', 409);
  const after = await loadEvidence(cfg.db, evidence.evidence_id);
  if (after.content_hash !== beforeHash) throw new GVError('GV_INTERNAL', 'Evidence content changed during acceptance.', 500);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, after) }, 200, 'accepted');
}

async function rejectEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const resolvedActor = requireOperator(request);
  const input = await jsonBody(request);
  const key = idempotencyKey(request);
  const reason = requireText('reason', input.reason, 500);
  const evidence = await loadEvidence(cfg.db, requireId('evidence_id', evidenceId));
  if (!evidence) throw new GVError('GV_NOT_FOUND', 'The evidence was not found.', 404);
  const fingerprint = await hash('evidence-reject', { evidence_id: evidence.evidence_id, reason });
  const replay = await checkReplay(cfg.db, 'evidence:reject', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, evidence.evidence_id)) }, 200, 'no_change', { idempotent_replay: true });
  if (evidence.status === 'rejected') return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, evidence) }, 200, 'no_change');
  if (evidence.status !== 'draft') throw new GVError('GV_VERSION_CONFLICT', 'Only draft evidence can be rejected.', 409);
  const timestamp = now();
  const results = await cfg.db.batch([
    cfg.db.prepare(`UPDATE gv1_evidence_items SET status='rejected',rejection_reason=?,updated_at=? WHERE evidence_id=? AND status='draft'`).bind(reason, timestamp, evidence.evidence_id),
    cfg.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
      newId('jev'), `day3:evidence_rejected:${evidence.evidence_id}`, evidence.bmr_id, evidence.session_id,
      'evidence_rejected', timestamp, resolvedActor.role, JSON.stringify({ evidence_id: evidence.evidence_id, reason_code: 'rejected' }),
      fingerprint, corr, cfg.environment, timestamp
    ),
    cfg.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      newId('aud'), 'evidence', evidence.evidence_id, 'reject', evidence.version_no, evidence.version_no,
      resolvedActor.role, evidence.source_type, reason, JSON.stringify({ status: 'rejected' }), corr, cfg.environment, timestamp, timestamp
    ),
    receiptStmt(cfg.db, { scope: 'evidence:reject', key, fingerprint, status: 200, entityType: 'evidence', entityId: evidence.evidence_id, timestamp })
  ]);
  const changed = Number(results?.[0]?.meta?.changes ?? results?.[0]?.changes ?? 0);
  if (changed !== 1) throw new GVError('GV_VERSION_CONFLICT', 'The evidence rejection state changed concurrently.', 409);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, evidence.evidence_id)) }, 200, 'rejected');
}

async function supersedeEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const resolvedActor = requireOperator(request);
  const input = await jsonBody(request);
  const key = idempotencyKey(request);
  const reason = requireText('correction_reason', input.correction_reason, 500);
  const source = await loadEvidence(cfg.db, requireId('evidence_id', evidenceId));
  if (!source) throw new GVError('GV_NOT_FOUND', 'The evidence was not found.', 404);
  const latest = await first(cfg.db, `SELECT evidence_id FROM gv1_evidence_items WHERE evidence_group_id=? ORDER BY version_no DESC LIMIT 1`, source.evidence_group_id);
  if (latest?.evidence_id !== source.evidence_id) throw new GVError('GV_VERSION_CONFLICT', 'Only the current leaf evidence can be superseded.', 409);
  const typed = validateTyped(input);
  const capturedAt = validateCapturedAt(input.captured_at);
  const consent = input.consent_status ? requireText('consent_status', input.consent_status, 80) : source.consent_status;
  await loadScope(cfg.db, source.bmr_id, source.session_id);
  const semantic = { evidence_id: source.evidence_id, typed, captured_at: capturedAt, consent_status: consent, correction_reason: reason };
  const fingerprint = await hash('evidence-supersede', semantic);
  const replay = await checkReplay(cfg.db, 'evidence:supersede', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, replay.response_entity_id)) }, 200, 'no_change', { idempotent_replay: true });

  const newEvidenceId = newId('evd');
  const nextVersion = Number(source.version_no) + 1;
  const timestamp = now();
  const contentHash = await hash('evidence-content', {
    bmr_id: source.bmr_id, session_id: source.session_id, source_type: source.source_type,
    source_ref: source.source_ref, captured_at: capturedAt, consent_status: consent, ...typed
  });
  const statements = [
    cfg.db.prepare(`INSERT INTO gv1_evidence_items
      (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,
       evidence_group_id,version_no,supersedes_evidence_id,source_type,source_ref,value_type,value_text,value_number,value_boolean,value_date,value_json,
       status,consent_status,source_actor_type,source_actor_id,captured_at,content_hash,rejection_reason,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      newEvidenceId, source.bmr_id, source.session_id, typed.value_type, source.source_product, source.source_reference,
      JSON.stringify({ value_type: typed.value_type, value_text: typed.value_text, value_number: typed.value_number,
        value_boolean: typed.value_boolean, value_date: typed.value_date, value_json: typed.value_json }),
      source.confidence, nextVersion, timestamp, source.evidence_group_id, nextVersion, source.evidence_id,
      source.source_type, source.source_ref, typed.value_type, typed.value_text, typed.value_number, typed.value_boolean,
      typed.value_date, typed.value_json, 'draft', consent, resolvedActor.role, resolvedActor.id, capturedAt, contentHash, null, timestamp
    ),
    cfg.db.prepare(`INSERT INTO gv1_evidence_relationships
      (relationship_id,from_evidence_id,to_evidence_id,relationship_type,created_at,rationale,correlation_id)
      VALUES (?,?,?,'corrects',?,?,?)`).bind(newId('rel'), newEvidenceId, source.evidence_id, timestamp, reason, corr),
    cfg.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
      newId('jev'), `day3:evidence_superseded:${newEvidenceId}`, source.bmr_id, source.session_id,
      'evidence_superseded', timestamp, resolvedActor.role,
      JSON.stringify({ evidence_id: newEvidenceId, supersedes_evidence_id: source.evidence_id, version_no: nextVersion }),
      fingerprint, corr, cfg.environment, timestamp
    ),
    cfg.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      newId('aud'), 'evidence', newEvidenceId, 'supersede', source.version_no, nextVersion, resolvedActor.role,
      source.source_type, reason, JSON.stringify({ supersedes_evidence_id: source.evidence_id }), corr, cfg.environment, timestamp, timestamp
    ),
    receiptStmt(cfg.db, { scope: 'evidence:supersede', key, fingerprint, status: 201, entityType: 'evidence', entityId: newEvidenceId, timestamp })
  ];
  await cfg.db.batch(statements);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, newEvidenceId)), previous_evidence_id: source.evidence_id }, 201, 'created');
}

async function getEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const evidence = await loadEvidence(cfg.db, requireId('evidence_id', evidenceId));
  if (!evidence) throw new GVError('GV_NOT_FOUND', 'The evidence was not found.', 404);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, evidence), answer: evidence.source_type === 'assessment_answer' ? await answerView(cfg.db, evidence.source_ref) : null });
}

async function listEvidence(request, cfg, corr, origin, bmrId) {
  requireRuntime(cfg);
  bmrId = requireId('bmr_id', bmrId);
  await loadScope(cfg.db, bmrId);
  const url = new URL(request.url);
  const view = clean(url.searchParams.get('view') || 'current').toLowerCase();
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 50)));
  const filters = [];
  const params = [bmrId];
  let sql = `SELECT e.* FROM gv1_evidence_items e WHERE e.bmr_id=?`;
  if (view === 'current') {
    sql += ` AND e.status NOT IN ('rejected','archived') AND NOT EXISTS (
      SELECT 1 FROM gv1_evidence_items newer WHERE newer.supersedes_evidence_id=e.evidence_id
    )`;
  } else if (view !== 'history') {
    throw new GVError('GV_REQ_SCHEMA', 'view must be current or history.', 422);
  }
  const sourceType = clean(url.searchParams.get('source_type'));
  if (sourceType) { filters.push('e.source_type=?'); params.push(sourceType); }
  const sessionId = clean(url.searchParams.get('session_id'));
  if (sessionId) { filters.push('e.session_id=?'); params.push(sessionId); }
  const status = clean(url.searchParams.get('status'));
  if (status) { filters.push('e.status=?'); params.push(status); }
  if (filters.length) sql += ` AND ${filters.join(' AND ')}`;
  sql += ` ORDER BY e.evidence_group_id,e.version_no LIMIT ?`;
  params.push(limit);
  const rows = await all(cfg.db, sql, ...params);
  return ok(cfg, corr, origin, { evidence: await Promise.all(rows.map((row) => evidenceView(cfg.db, row))), view, limit });
}

async function createImportBatch(request, cfg, corr, origin) {
  requireRuntime(cfg);
  const resolvedActor = requireImport(request);
  const input = await jsonBody(request);
  const key = idempotencyKey(request);
  const sourceName = requireText('source_name', input.source_name, 240);
  const sourceChecksum = input.source_checksum ? requireText('source_checksum', input.source_checksum, 240) : null;
  const expected = Number(input.expected_count);
  if (!Number.isInteger(expected) || expected < 0) throw new GVError('GV_REQ_SCHEMA', 'expected_count must be a non-negative integer.', 422);
  const eventBmrId = input.bmr_id ? requireId('bmr_id', input.bmr_id) : null;
  const eventSessionId = input.session_id ? requireId('session_id', input.session_id) : null;
  if (Boolean(eventBmrId) !== Boolean(eventSessionId)) throw new GVError('GV_REQ_SCHEMA', 'bmr_id and session_id must be supplied together for scoped import evidence.', 422);
  if (eventBmrId) await loadScope(cfg.db, eventBmrId, eventSessionId);
  const fingerprint = await hash('import-batch-create', { sourceName, sourceChecksum, expected, eventBmrId, eventSessionId });
  const replay = await checkReplay(cfg.db, 'import:batch:create', key, fingerprint);
  if (replay) {
    const existing = await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, replay.response_entity_id);
    return ok(cfg, corr, origin, { batch: existing }, 200, 'no_change', { idempotent_replay: true });
  }
  const timestamp = now();
  const batchId = newId('imp');
  const statements = [
    cfg.db.prepare(`INSERT INTO gv1_import_batches
      (import_batch_id,source_system,source_reference,status,started_at,completed_at,created_at,source_name,source_checksum,environment,expected_count,
       processed_count,imported_count,skipped_count,error_count,created_by,updated_at)
      VALUES (?,'targeted_day3',?,'open',?,NULL,?,?,?,?,?,0,0,0,0,?,?)`).bind(
      batchId, sourceName, timestamp, timestamp, sourceName, sourceChecksum, cfg.environment, expected, resolvedActor.id, timestamp
    )
  ];
  if (eventBmrId && eventSessionId) {
    statements.push(cfg.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
      newId('jev'), `day3:import_batch_created:${batchId}`, eventBmrId, eventSessionId, 'import_batch_created', timestamp,
      resolvedActor.role, JSON.stringify({ import_batch_id: batchId, expected_count: expected }), fingerprint, corr, cfg.environment, timestamp
    ));
  }
  statements.push(
    cfg.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      newId('aud'), 'import_batch', batchId, 'create', null, 1, resolvedActor.role, 'targeted_day3',
      'day3_import_batch_created', JSON.stringify({ expected_count: expected, bmr_id: eventBmrId, session_id: eventSessionId }), corr, cfg.environment, timestamp, timestamp
    ),
    receiptStmt(cfg.db, { scope: 'import:batch:create', key, fingerprint, status: 201, entityType: 'import_batch', entityId: batchId, timestamp })
  );
  await cfg.db.batch(statements);
  return ok(cfg, corr, origin, { batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId) }, 201, 'created');
}

async function buildImportErrorStatement(db, { errorId, batchId, sourceRowKey, error, safePayload, timestamp, corr }) {
  const info = await all(db, `SELECT name FROM pragma_table_info('gv1_import_errors')`);
  const names = new Set(info.map((row) => clean(row.name)));
  for (const required of ['import_error_id','import_batch_id','error_code','created_at','source_row_key','field_name','quarantined_payload_json','correlation_id']) {
    if (!names.has(required)) throw new GVError('GV_DB_SCHEMA_OUTDATED', `The import error schema is missing ${required}.`, 503);
  }

  const columns = ['import_error_id','import_batch_id'];
  const values = [errorId,batchId];
  if (names.has('source_row_reference')) {
    columns.push('source_row_reference');
    values.push(sourceRowKey);
  } else if (names.has('row_number')) {
    const rowNumberMatch = sourceRowKey.match(/(\d+)$/);
    columns.push('row_number');
    values.push(rowNumberMatch ? Number(rowNumberMatch[1]) : 0);
  }

  columns.push('error_code');
  values.push(error.code);
  if (names.has('safe_error_message')) {
    columns.push('safe_error_message');
    values.push(error.message);
  } else if (names.has('error_message')) {
    columns.push('error_message');
    values.push(error.message);
  } else {
    throw new GVError('GV_DB_SCHEMA_OUTDATED', 'The import error message column is unavailable.', 503);
  }

  if (names.has('safe_error_json')) {
    columns.push('safe_error_json');
    values.push(safePayload);
  } else if (names.has('safe_payload_json')) {
    columns.push('safe_payload_json');
    values.push(safePayload);
  }

  columns.push('created_at','source_row_key','field_name','quarantined_payload_json','correlation_id');
  values.push(timestamp,sourceRowKey,null,safePayload,corr);
  const placeholders = columns.map(() => '?').join(',');
  return db.prepare(`INSERT INTO gv1_import_errors (${columns.join(',')}) VALUES (${placeholders})`).bind(...values);
}

async function importRow(request, cfg, corr, origin, batchId) {
  requireRuntime(cfg);
  const resolvedActor = requireImport(request);
  const input = await jsonBody(request);
  batchId = requireId('import_batch_id', batchId);
  const sourceRowKey = requireText('source_row_key', input.source_row_key, 180);
  const command = input.command && typeof input.command === 'object' ? input.command : null;
  if (!command) throw new GVError('GV_REQ_SCHEMA', 'command is required.', 422);
  const batch = await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId);
  if (!batch) throw new GVError('GV_NOT_FOUND', 'The import batch was not found.', 404);
  if (!['open','validating','importing'].includes(batch.status)) throw new GVError('GV_VERSION_CONFLICT', 'The import batch is closed.', 409);
  const rowFingerprint = await hash('import-row', { batch_id: batchId, source_row_key: sourceRowKey, command });
  const receipt = await first(cfg.db, `SELECT * FROM gv1_import_row_receipts WHERE import_batch_id=? AND source_row_key=?`, batchId, sourceRowKey);
  if (receipt) {
    if (receipt.request_fingerprint !== rowFingerprint) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The source row key was reused with different content.', 409);
    return ok(cfg, corr, origin, { row: JSON.parse(receipt.response_json), replay: true }, 200, 'no_change', { idempotent_replay: true });
  }

  let result;
  let resultType;
  let canonicalEntityId = null;
  let errorCode = null;
  let rowBmrId = null;
  let rowSessionId = null;
  try {
    rowBmrId = requireId('bmr_id', command.bmr_id);
    rowSessionId = command.session_id ? requireId('session_id', command.session_id) : null;
    await loadScope(cfg.db, rowBmrId, rowSessionId);
    const typed = validateTyped(command);
    const sourceToken = `import:${batchId}:${sourceRowKey}`;
    const duplicate = await first(cfg.db, `SELECT evidence_id FROM gv1_evidence_items WHERE bmr_id=? AND session_id IS ? AND source_type='imported_reference'
      AND value_type=? AND COALESCE(value_text,'')=COALESCE(?, '') AND COALESCE(value_number,-9.9e307)=COALESCE(?,-9.9e307)
      AND COALESCE(value_boolean,-1)=COALESCE(?,-1) AND COALESCE(value_date,'')=COALESCE(?,'') AND COALESCE(value_json,'')=COALESCE(?,'')
      ORDER BY version_no DESC LIMIT 1`, rowBmrId, rowSessionId, typed.value_type, typed.value_text, typed.value_number, typed.value_boolean, typed.value_date, typed.value_json);
    if (duplicate) {
      resultType = 'skipped'; canonicalEntityId = duplicate.evidence_id;
      result = { source_row_key: sourceRowKey, result: 'skipped', canonical_entity_id: canonicalEntityId };
    } else {
      const timestamp = now();
      const evidenceId = newId('evd');
      const groupId = newId('evg');
      const capturedAt = command.captured_at ? validateCapturedAt(command.captured_at) : timestamp;
      const contentHash = await hash('evidence-content', {
        bmr_id: rowBmrId, session_id: rowSessionId, source_type: 'imported_reference', source_ref: sourceToken,
        captured_at: capturedAt, consent_status: command.consent_status || null, ...typed
      });
      await cfg.db.batch([
        cfg.db.prepare(`INSERT INTO gv1_evidence_items
          (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,
           evidence_group_id,version_no,supersedes_evidence_id,source_type,source_ref,value_type,value_text,value_number,value_boolean,value_date,value_json,status,
           consent_status,source_actor_type,source_actor_id,captured_at,content_hash,rejection_reason,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
          evidenceId, rowBmrId, rowSessionId, typed.value_type, 'GalviVault', sourceToken,
          JSON.stringify({ value_type: typed.value_type, value_text: typed.value_text, value_number: typed.value_number,
            value_boolean: typed.value_boolean, value_date: typed.value_date, value_json: typed.value_json }),
          null, 1, timestamp, groupId, 1, null, 'imported_reference', sourceToken, typed.value_type,
          typed.value_text, typed.value_number, typed.value_boolean, typed.value_date, typed.value_json, 'draft',
          command.consent_status || null, resolvedActor.role, resolvedActor.id, capturedAt, contentHash, null, timestamp
        ),
        cfg.db.prepare(`INSERT INTO gv1_journey_events
          (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
          VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
          newId('jev'), `day3:row_imported:${batchId}:${sourceRowKey}`, rowBmrId, rowSessionId, 'row_imported', timestamp,
          resolvedActor.role, JSON.stringify({ import_batch_id: batchId, source_row_key: sourceRowKey, evidence_id: evidenceId }),
          rowFingerprint, corr, cfg.environment, timestamp
        ),
        cfg.db.prepare(`INSERT INTO gv1_audit_log
          (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
          newId('aud'), 'evidence', evidenceId, 'import', null, 1, resolvedActor.role, 'targeted_day3',
          'day3_imported', JSON.stringify({ import_batch_id: batchId, source_row_key: sourceRowKey }),
          corr, cfg.environment, timestamp, timestamp
        )
      ]);
      resultType = 'imported'; canonicalEntityId = evidenceId;
      result = { source_row_key: sourceRowKey, result: 'imported', canonical_entity_id: evidenceId };
    }
  } catch (error) {
    if (!(error instanceof GVError)) throw error;
    resultType = 'error'; errorCode = error.code;
    const errorId = newId('imp_err');
    const timestamp = now();
    const safePayload = JSON.stringify({ source_row_key: sourceRowKey, value_type: command.value_type || null });
    const importErrorStatement = await buildImportErrorStatement(cfg.db, { errorId, batchId, sourceRowKey, error, safePayload, timestamp, corr });
    const quarantineStatements = [importErrorStatement];
    if (rowBmrId && rowSessionId) {
      quarantineStatements.push(
        cfg.db.prepare(`INSERT INTO gv1_journey_events
          (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
          VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
          newId('jev'), `day3:row_quarantined:${batchId}:${sourceRowKey}`, rowBmrId, rowSessionId, 'row_quarantined', timestamp,
          resolvedActor.role, JSON.stringify({ import_batch_id: batchId, source_row_key: sourceRowKey, error_code: error.code }),
          rowFingerprint, corr, cfg.environment, timestamp
        ),
        cfg.db.prepare(`INSERT INTO gv1_audit_log
          (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
          newId('aud'), 'import_error', errorId, 'quarantine', null, 1, resolvedActor.role, 'targeted_day3',
          'day3_row_quarantined', JSON.stringify({ import_batch_id: batchId, source_row_key: sourceRowKey, error_code: error.code }),
          corr, cfg.environment, timestamp, timestamp
        )
      );
    }
    await cfg.db.batch(quarantineStatements);
    result = { source_row_key: sourceRowKey, result: 'error', error_code: error.code };
  }

  const timestamp = now();
  const responseJson = JSON.stringify(result);
  const countColumn = resultType === 'imported' ? 'imported_count' : resultType === 'skipped' ? 'skipped_count' : 'error_count';
  await cfg.db.batch([
    cfg.db.prepare(`INSERT INTO gv1_import_row_receipts
      (import_batch_id,source_row_key,request_fingerprint,result_type,canonical_entity_id,error_code,response_json,created_at)
      VALUES (?,?,?,?,?,?,?,?)`).bind(batchId, sourceRowKey, rowFingerprint, resultType, canonicalEntityId, errorCode, responseJson, timestamp),
    cfg.db.prepare(`UPDATE gv1_import_batches SET status='importing',processed_count=processed_count+1,${countColumn}=${countColumn}+1,updated_at=? WHERE import_batch_id=?`).bind(timestamp, batchId)
  ]);
  return ok(cfg, corr, origin, { row: result }, 200, resultType);
}

async function closeImportBatch(request, cfg, corr, origin, batchId) {
  requireRuntime(cfg);
  const resolvedActor = requireImport(request);
  await jsonBody(request);
  const key = idempotencyKey(request);
  batchId = requireId('import_batch_id', batchId);
  const fingerprint = await hash('import-batch-close', { import_batch_id: batchId });
  const replay = await checkReplay(cfg.db, 'import:batch:close', key, fingerprint);
  if (replay) {
    const existing = await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId);
    return ok(cfg, corr, origin, { batch: existing, reconciled: true }, 200, 'no_change', { idempotent_replay: true });
  }
  const batch = await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId);
  if (!batch) throw new GVError('GV_NOT_FOUND', 'The import batch was not found.', 404);
  const processed = Number(batch.processed_count), imported = Number(batch.imported_count), skipped = Number(batch.skipped_count), errors = Number(batch.error_count);
  if (processed !== imported + skipped + errors) throw new GVError('GV_VERSION_CONFLICT', 'Import counts do not reconcile.', 409);
  if (batch.expected_count !== null && Number(batch.expected_count) !== processed) throw new GVError('GV_VERSION_CONFLICT', 'Processed count does not match expected_count.', 409);
  const status = errors > 0 ? 'completed_with_errors' : 'completed';
  const timestamp = now();
  const eventScope = await first(cfg.db, `SELECT e.bmr_id,e.session_id
    FROM gv1_import_row_receipts r
    JOIN gv1_evidence_items e ON e.evidence_id=r.canonical_entity_id
    WHERE r.import_batch_id=? AND e.bmr_id IS NOT NULL AND e.session_id IS NOT NULL
    ORDER BY r.created_at LIMIT 1`, batchId);
  const statements = [
    cfg.db.prepare(`UPDATE gv1_import_batches SET status=?,completed_at=?,updated_at=? WHERE import_batch_id=? AND status IN ('open','validating','importing')`).bind(status, timestamp, timestamp, batchId)
  ];
  if (eventScope?.bmr_id && eventScope?.session_id) {
    statements.push(cfg.db.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
      newId('jev'), `day3:batch_reconciled:${batchId}`, eventScope.bmr_id, eventScope.session_id, 'batch_reconciled', timestamp, resolvedActor.role,
      JSON.stringify({ import_batch_id: batchId, processed, imported, skipped, errors, status }), fingerprint, corr, cfg.environment, timestamp
    ));
  }
  statements.push(
    cfg.db.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      newId('aud'), 'import_batch', batchId, 'reconcile', null, 1, resolvedActor.role, 'targeted_day3',
      'day3_batch_reconciled', JSON.stringify({ processed, imported, skipped, errors, status }), corr, cfg.environment, timestamp, timestamp
    ),
    receiptStmt(cfg.db, { scope: 'import:batch:close', key, fingerprint, status: 200, entityType: 'import_batch', entityId: batchId, timestamp })
  );
  await cfg.db.batch(statements);
  return ok(cfg, corr, origin, { batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId), reconciled: true }, 200, status);
}

async function route(request, env, ctx) {
  const cfg = config(env);
  const corr = correlationId(request);
  const origin = originState(request, cfg);
  try {
    requireRuntime(cfg);
    if (!origin.allowed) throw new GVError('GV_AUTH_FORBIDDEN', 'The request origin is not allowed.', 403);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(cfg, corr, origin) });

    if (request.method === 'POST' && path === '/api/v1/evidence') return await submitEvidence(request, cfg, corr, origin);
    const singleEvidence = path.match(/^\/api\/v1\/evidence\/([^/]+)$/);
    if (singleEvidence && request.method === 'GET') return await getEvidence(request, cfg, corr, origin, decodeURIComponent(singleEvidence[1]));
    const acceptMatch = path.match(/^\/api\/v1\/evidence\/([^/]+)\/accept$/);
    if (acceptMatch && request.method === 'POST') return await acceptEvidence(request, cfg, corr, origin, decodeURIComponent(acceptMatch[1]));
    const rejectMatch = path.match(/^\/api\/v1\/evidence\/([^/]+)\/reject$/);
    if (rejectMatch && request.method === 'POST') return await rejectEvidence(request, cfg, corr, origin, decodeURIComponent(rejectMatch[1]));
    const supersedeMatch = path.match(/^\/api\/v1\/evidence\/([^/]+)\/supersede$/);
    if (supersedeMatch && request.method === 'POST') return await supersedeEvidence(request, cfg, corr, origin, decodeURIComponent(supersedeMatch[1]));
    const bmrEvidence = path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/evidence$/);
    if (bmrEvidence && request.method === 'GET') return await listEvidence(request, cfg, corr, origin, decodeURIComponent(bmrEvidence[1]));
    if (request.method === 'POST' && path === '/api/v1/import-batches') return await createImportBatch(request, cfg, corr, origin);
    const importRows = path.match(/^\/api\/v1\/import-batches\/([^/]+)\/rows$/);
    if (importRows && request.method === 'POST') return await importRow(request, cfg, corr, origin, decodeURIComponent(importRows[1]));
    const importClose = path.match(/^\/api\/v1\/import-batches\/([^/]+)\/close$/);
    if (importClose && request.method === 'POST') return await closeImportBatch(request, cfg, corr, origin, decodeURIComponent(importClose[1]));

    return day1Worker.fetch(request, env, ctx);
  } catch (error) {
    return fail(cfg, corr, origin, error);
  }
}

export default { fetch: route };