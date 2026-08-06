import day1Worker from './day1.js';

const API_VERSION = 'v1';
const REQUIRED_SCHEMA = '0002';
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
  const relationships = await all(db, `SELECT relationship_id,from_evidence_id,to_evidence_id,relationship_type,rationale,created_at
    FROM gv1_evidence_relationships WHERE from_evidence_id=? OR to_evidence_id=? ORDER BY created_at`, evidence.evidence_id, evidence.evidence_id);
  const answer = evidence.source_type === 'assessment_answer'
    ? await first(db, `SELECT answer_id,answer_group_id,version_no,question_id,question_version,supersedes_answer_id FROM gv1_assessment_answers WHERE answer_id=?`, evidence.source_ref)
    : null;
  return {
    ...evidence,
    is_current: !successor && !['rejected','archived'].includes(evidence.status),
    superseded_by_evidence_id: successor?.evidence_id || null,
    relationships,
    answer_trace: answer
  };
}

function eventStmt(db, { bmrId, sessionId, eventName, corr, cfg, timestamp, metadata }) {
  if (!sessionId) return null;
  const eventKey = `day3:${eventName}:${newId('evt')}`;
  return db.prepare(`INSERT INTO gv1_journey_events
    (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
    VALUES (?,?,?,?,?,'GalviVault','Day3',?,'service',?,?,?,?,?)`)
    .bind(newId('jev'), eventKey, bmrId, sessionId, eventName, timestamp,
      JSON.stringify(metadata || {}), eventKey, corr, cfg.environment, timestamp);
}

function auditStmt(db, { entityType, entityId, operation, priorVersion, newVersion, actorInfo, reason, corr, cfg, timestamp, change }) {
  return db.prepare(`INSERT INTO gv1_audit_log
    (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(newId('aud'), entityType, entityId, operation, priorVersion, newVersion,
      actorInfo.role, 'day3-worker', reason, JSON.stringify(change || {}), corr, cfg.environment, timestamp, timestamp);
}

function evidenceInsertStmt(db, command) {
  const content = {
    value_type: command.typed.value_type,
    value_text: command.typed.value_text,
    value_number: command.typed.value_number,
    value_boolean: command.typed.value_boolean,
    value_date: command.typed.value_date,
    value_json: command.typed.value_json
  };
  return db.prepare(`INSERT INTO gv1_evidence_items
    (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,
     evidence_group_id,version_no,supersedes_evidence_id,source_type,source_ref,value_type,value_text,value_number,value_boolean,value_date,value_json,
     status,consent_status,source_actor_type,source_actor_id,captured_at,content_hash,rejection_reason,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(command.evidenceId, command.bmrId, command.sessionId, command.typed.value_type,
      'GalviVault', command.sourceRef, JSON.stringify(content), null, command.versionNo, command.timestamp,
      command.groupId, command.versionNo, command.supersedesEvidenceId, command.sourceType, command.sourceRef,
      command.typed.value_type, command.typed.value_text, command.typed.value_number, command.typed.value_boolean,
      command.typed.value_date, command.typed.value_json, command.status, command.consentStatus,
      command.actorInfo.role, command.actorInfo.id, command.capturedAt, command.contentHash, null, command.timestamp);
}

async function prepareEvidence(db, body, actorInfo, options = {}) {
  const bmrId = requireId('bmr_id', body.bmr_id);
  const sessionId = body.session_id ? requireId('session_id', body.session_id) : null;
  await loadScope(db, bmrId, sessionId);
  const sourceType = clean(options.sourceType || body.source_type).toLowerCase();
  if (!SOURCE_TYPES.has(sourceType)) throw new GVError('GV_REQ_SCHEMA', 'source_type is unsupported.', 422);
  const sourceRef = requireText('source_ref', options.sourceRef || body.source_ref, 500);
  const typed = validateTyped(body);
  const capturedAt = validateCapturedAt(body.captured_at);
  const consentStatus = clean(body.consent_status || 'not_applicable');
  const contentHash = await hash('evidence-content', { bmr_id: bmrId, session_id: sessionId, source_type: sourceType, source_ref: sourceRef, captured_at: capturedAt, consent_status: consentStatus, ...typed });
  return { bmrId, sessionId, sourceType, sourceRef, typed, capturedAt, consentStatus, contentHash, actorInfo };
}

async function submitEvidence(request, cfg, corr, origin, override = null) {
  requireRuntime(cfg);
  const key = override?.key || idempotencyKey(request);
  const body = override?.body || await jsonBody(request);
  const actorInfo = override?.actorInfo || actor(request);
  const prepared = await prepareEvidence(cfg.db, body, actorInfo, override || {});
  const requestFingerprint = await hash('evidence-submit', { ...body, actor: actorInfo, sourceType: prepared.sourceType, sourceRef: prepared.sourceRef });
  const scope = override?.scope || 'evidence:submit';
  const replay = await checkReplay(cfg.db, scope, key, requestFingerprint);
  if (replay) {
    const existing = await loadEvidence(cfg.db, replay.response_entity_id);
    return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, existing) }, 200, 'no_change', { idempotent_replay: true });
  }

  let answerStmt = null;
  let answerId = null;
  let answerGroupId = null;
  let answerVersion = null;
  let supersedesAnswerId = null;
  let groupId = newId('evg');
  let versionNo = 1;
  let supersedesEvidenceId = null;

  if (prepared.sourceType === 'assessment_answer') {
    const answer = body.assessment_answer;
    if (!answer || typeof answer !== 'object') throw new GVError('GV_REQ_SCHEMA', 'assessment_answer is required.', 422);
    const questionId = requireId('question_id', answer.question_id);
    const questionVersion = requireText('question_version', answer.question_version, 40);
    const question = await first(cfg.db, `SELECT * FROM gv1_question_definitions WHERE question_id=? AND version=?`, questionId, questionVersion);
    if (!question || question.status !== 'active' || Number(question.active) !== 1) throw new GVError('GV_NOT_FOUND', 'The active question version was not found.', 404);
    if (question.response_type !== prepared.typed.value_type) throw new GVError('GV_REQ_SCHEMA', 'The evidence value type does not match the question.', 422);
    if (prepared.typed.value_type === 'number') {
      if (question.minimum_value !== null && prepared.typed.value_number < Number(question.minimum_value)) throw new GVError('GV_REQ_SCHEMA', 'The answer is below the question minimum.', 422);
      if (question.maximum_value !== null && prepared.typed.value_number > Number(question.maximum_value)) throw new GVError('GV_REQ_SCHEMA', 'The answer exceeds the question maximum.', 422);
    }
    const current = await first(cfg.db, `SELECT * FROM gv1_assessment_answers WHERE session_id=? AND question_id=? ORDER BY version_no DESC LIMIT 1`, prepared.sessionId, questionId);
    const answerHash = await hash('assessment-answer', { question_id: questionId, question_version: questionVersion, raw_value_text: answer.raw_value_text ?? null, raw_value_number: answer.raw_value_number ?? null, normalized_value_text: answer.normalized_value_text ?? null, normalized_value_number: answer.normalized_value_number ?? null, confidence_effect: answer.confidence_effect ?? null });
    if (current?.content_hash === answerHash) {
      const linked = await first(cfg.db, `SELECT * FROM gv1_evidence_items WHERE source_type='assessment_answer' AND source_ref=?`, current.answer_id);
      return ok(cfg, corr, origin, { answer: current, evidence: await evidenceView(cfg.db, linked) }, 200, 'no_change');
    }
    answerId = newId('ans');
    answerGroupId = current?.answer_group_id || newId('ang');
    answerVersion = Number(current?.version_no || 0) + 1;
    supersedesAnswerId = current?.answer_id || null;
    if (current) {
      const priorEvidence = await first(cfg.db, `SELECT * FROM gv1_evidence_items WHERE source_type='assessment_answer' AND source_ref=?`, current.answer_id);
      if (priorEvidence) {
        groupId = priorEvidence.evidence_group_id;
        versionNo = Number(priorEvidence.version_no) + 1;
        supersedesEvidenceId = priorEvidence.evidence_id;
      }
    }
    prepared.sourceRef = answerId;
    answerStmt = cfg.db.prepare(`INSERT INTO gv1_assessment_answers
      (answer_id,session_id,question_id,answer_text,answer_number,answer_json,evidence_version,created_at,updated_at,
       bmr_id,question_version,answer_group_id,version_no,supersedes_answer_id,raw_value_text,raw_value_number,
       normalized_value_text,normalized_value_number,confidence_effect,source,captured_at,status,content_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(answerId, prepared.sessionId, questionId, prepared.typed.value_text, prepared.typed.value_number,
        prepared.typed.value_json, answerVersion, now(), now(), prepared.bmrId, questionVersion, answerGroupId,
        answerVersion, supersedesAnswerId, answer.raw_value_text ?? null, answer.raw_value_number ?? null,
        answer.normalized_value_text ?? null, answer.normalized_value_number ?? null, answer.confidence_effect ?? null,
        'day3-worker', prepared.capturedAt, 'draft', answerHash);
  }

  const timestamp = now();
  const evidenceId = newId('evd');
  const command = { ...prepared, evidenceId, groupId, versionNo, supersedesEvidenceId, timestamp, status: 'draft' };
  const statements = [];
  if (answerStmt) statements.push(answerStmt);
  statements.push(evidenceInsertStmt(cfg.db, command));
  if (supersedesEvidenceId) {
    statements.push(cfg.db.prepare(`INSERT INTO gv1_evidence_relationships
      (relationship_id,from_evidence_id,to_evidence_id,relationship_type,created_at,rationale,correlation_id)
      VALUES (?,?,?,'corrects',?,?,?)`)
      .bind(newId('rel'), evidenceId, supersedesEvidenceId, timestamp, 'Assessment answer correction', corr));
  }
  const event = eventStmt(cfg.db, { bmrId: prepared.bmrId, sessionId: prepared.sessionId, eventName: supersedesEvidenceId ? 'evidence_superseded' : 'evidence_submitted', corr, cfg, timestamp, metadata: { evidence_id: evidenceId, version_no: versionNo, source_type: prepared.sourceType } });
  if (event) statements.push(event);
  statements.push(auditStmt(cfg.db, { entityType: 'evidence', entityId: evidenceId, operation: 'create', priorVersion: supersedesEvidenceId ? versionNo - 1 : null, newVersion: versionNo, actorInfo, reason: supersedesEvidenceId ? 'DAY3_EVIDENCE_SUPERSEDE' : 'DAY3_EVIDENCE_SUBMIT', corr, cfg, timestamp, change: { bmr_id: prepared.bmrId, source_type: prepared.sourceType, version_no: versionNo } }));
  statements.push(receiptStmt(cfg.db, { scope, key, fingerprint: requestFingerprint, status: 201, entityType: 'evidence', entityId: evidenceId, timestamp }));
  await cfg.db.batch(statements);
  const created = await loadEvidence(cfg.db, evidenceId);
  const answerRow = answerId ? await first(cfg.db, `SELECT * FROM gv1_assessment_answers WHERE answer_id=?`, answerId) : null;
  return ok(cfg, corr, origin, { answer: answerRow, evidence: await evidenceView(cfg.db, created) }, 201, 'created');
}

async function acceptEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const actorInfo = requireOperator(request);
  const key = idempotencyKey(request);
  const body = await jsonBody(request);
  const reason = requireText('reason', body.reason || 'operator_acceptance', 500);
  const fingerprint = await hash('evidence-accept', { evidenceId, reason, actorInfo });
  const replay = await checkReplay(cfg.db, 'evidence:accept', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, evidenceId)) }, 200, 'no_change', { idempotent_replay: true });
  const current = await loadEvidence(cfg.db, evidenceId);
  if (!current) throw new GVError('GV_NOT_FOUND', 'Evidence was not found.', 404);
  if (current.status === 'accepted') return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, current) }, 200, 'no_change');
  if (current.status !== 'draft') throw new GVError('GV_VERSION_CONFLICT', 'Only draft evidence can be accepted.', 409);
  const timestamp = now();
  const statements = [
    cfg.db.prepare(`UPDATE gv1_evidence_items SET status='accepted',updated_at=? WHERE evidence_id=? AND status='draft'`).bind(timestamp, evidenceId)
  ];
  const event = eventStmt(cfg.db, { bmrId: current.bmr_id, sessionId: current.session_id, eventName: 'evidence_accepted', corr, cfg, timestamp, metadata: { evidence_id: evidenceId, content_hash: current.content_hash } });
  if (event) statements.push(event);
  statements.push(auditStmt(cfg.db, { entityType: 'evidence', entityId: evidenceId, operation: 'accept', priorVersion: current.version_no, newVersion: current.version_no, actorInfo, reason, corr, cfg, timestamp, change: { status: 'accepted', content_hash: current.content_hash } }));
  statements.push(receiptStmt(cfg.db, { scope: 'evidence:accept', key, fingerprint, status: 200, entityType: 'evidence', entityId: evidenceId, timestamp }));
  await cfg.db.batch(statements);
  const accepted = await loadEvidence(cfg.db, evidenceId);
  if (accepted.content_hash !== current.content_hash) throw new GVError('GV_INTERNAL', 'Evidence content changed during acceptance.', 500);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, accepted) }, 200, 'accepted');
}

async function rejectEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const actorInfo = requireOperator(request);
  const key = idempotencyKey(request);
  const body = await jsonBody(request);
  const reason = requireText('reason', body.reason, 500);
  const fingerprint = await hash('evidence-reject', { evidenceId, reason, actorInfo });
  const replay = await checkReplay(cfg.db, 'evidence:reject', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, evidenceId)) }, 200, 'no_change', { idempotent_replay: true });
  const current = await loadEvidence(cfg.db, evidenceId);
  if (!current) throw new GVError('GV_NOT_FOUND', 'Evidence was not found.', 404);
  if (current.status !== 'draft') throw new GVError(current.status === 'accepted' ? 'GV_EVIDENCE_IMMUTABLE' : 'GV_VERSION_CONFLICT', 'Only draft evidence can be rejected.', 409);
  const timestamp = now();
  const statements = [cfg.db.prepare(`UPDATE gv1_evidence_items SET status='rejected',rejection_reason=?,updated_at=? WHERE evidence_id=? AND status='draft'`).bind(reason, timestamp, evidenceId)];
  const event = eventStmt(cfg.db, { bmrId: current.bmr_id, sessionId: current.session_id, eventName: 'evidence_rejected', corr, cfg, timestamp, metadata: { evidence_id: evidenceId } });
  if (event) statements.push(event);
  statements.push(auditStmt(cfg.db, { entityType: 'evidence', entityId: evidenceId, operation: 'reject', priorVersion: current.version_no, newVersion: current.version_no, actorInfo, reason, corr, cfg, timestamp, change: { status: 'rejected' } }));
  statements.push(receiptStmt(cfg.db, { scope: 'evidence:reject', key, fingerprint, status: 200, entityType: 'evidence', entityId: evidenceId, timestamp }));
  await cfg.db.batch(statements);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, evidenceId)) }, 200, 'updated');
}

async function supersedeEvidence(request, cfg, corr, origin, evidenceId) {
  requireRuntime(cfg);
  const actorInfo = requireOperator(request);
  const source = await loadEvidence(cfg.db, evidenceId);
  if (!source) throw new GVError('GV_NOT_FOUND', 'Evidence was not found.', 404);
  const body = await jsonBody(request);
  body.bmr_id = source.bmr_id;
  body.session_id = source.session_id;
  body.source_type = source.source_type;
  body.source_ref = source.source_ref;
  body.captured_at = body.captured_at || now();
  const key = idempotencyKey(request);
  const prepared = await prepareEvidence(cfg.db, body, actorInfo);
  const fingerprint = await hash('evidence-supersede', { evidenceId, body, actorInfo });
  const replay = await checkReplay(cfg.db, 'evidence:supersede', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, replay.response_entity_id)) }, 200, 'no_change', { idempotent_replay: true });
  const latest = await first(cfg.db, `SELECT * FROM gv1_evidence_items WHERE evidence_group_id=? ORDER BY version_no DESC LIMIT 1`, source.evidence_group_id);
  if (latest?.evidence_id !== source.evidence_id) throw new GVError('GV_VERSION_CONFLICT', 'Only the current leaf evidence can be superseded.', 409);
  const reason = requireText('correction_reason', body.correction_reason, 500);
  const timestamp = now();
  const newEvidenceId = newId('evd');
  const versionNo = Number(source.version_no) + 1;
  const command = { ...prepared, sourceRef: source.source_ref, evidenceId: newEvidenceId, groupId: source.evidence_group_id, versionNo, supersedesEvidenceId: source.evidence_id, timestamp, status: 'draft' };
  const statements = [
    evidenceInsertStmt(cfg.db, command),
    cfg.db.prepare(`INSERT INTO gv1_evidence_relationships
      (relationship_id,from_evidence_id,to_evidence_id,relationship_type,created_at,rationale,correlation_id)
      VALUES (?,?,?,'corrects',?,?,?)`).bind(newId('rel'), newEvidenceId, source.evidence_id, timestamp, reason, corr)
  ];
  const event = eventStmt(cfg.db, { bmrId: source.bmr_id, sessionId: source.session_id, eventName: 'evidence_superseded', corr, cfg, timestamp, metadata: { evidence_id: newEvidenceId, supersedes_evidence_id: source.evidence_id, version_no: versionNo } });
  if (event) statements.push(event);
  statements.push(auditStmt(cfg.db, { entityType: 'evidence', entityId: newEvidenceId, operation: 'supersede', priorVersion: source.version_no, newVersion: versionNo, actorInfo, reason, corr, cfg, timestamp, change: { supersedes_evidence_id: source.evidence_id } }));
  statements.push(receiptStmt(cfg.db, { scope: 'evidence:supersede', key, fingerprint, status: 201, entityType: 'evidence', entityId: newEvidenceId, timestamp }));
  await cfg.db.batch(statements);
  return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, await loadEvidence(cfg.db, newEvidenceId)), previous: await evidenceView(cfg.db, source) }, 201, 'created');
}

async function listEvidence(cfg, corr, origin, bmrId, url) {
  requireRuntime(cfg);
  requireId('bmr_id', bmrId);
  await loadScope(cfg.db, bmrId);
  const view = clean(url.searchParams.get('view') || 'current').toLowerCase();
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 50), 1), 100);
  let rows;
  if (view === 'history') {
    rows = await all(cfg.db, `SELECT * FROM gv1_evidence_items WHERE bmr_id=? ORDER BY evidence_group_id,version_no LIMIT ?`, bmrId, limit);
  } else {
    rows = await all(cfg.db, `SELECT e.* FROM gv1_evidence_items e
      WHERE e.bmr_id=? AND e.status NOT IN ('rejected','archived')
      AND NOT EXISTS (SELECT 1 FROM gv1_evidence_items newer WHERE newer.supersedes_evidence_id=e.evidence_id)
      ORDER BY e.created_at DESC,e.evidence_id DESC LIMIT ?`, bmrId, limit);
  }
  const expanded = [];
  for (const row of rows) expanded.push(await evidenceView(cfg.db, row));
  return ok(cfg, corr, origin, { view, evidence: expanded, limit }, 200, 'ok');
}

async function createImportBatch(request, cfg, corr, origin) {
  requireRuntime(cfg);
  const actorInfo = requireImport(request);
  const key = idempotencyKey(request);
  const body = await jsonBody(request);
  const sourceName = requireText('source_name', body.source_name, 300);
  const sourceChecksum = requireText('source_checksum', body.source_checksum, 300);
  const expectedCount = Number(body.expected_count);
  if (!Number.isInteger(expectedCount) || expectedCount < 0) throw new GVError('GV_REQ_SCHEMA', 'expected_count must be a non-negative integer.', 422);
  const fingerprint = await hash('import-batch-create', { sourceName, sourceChecksum, expectedCount, actorInfo });
  const replay = await checkReplay(cfg.db, 'import:batch:create', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, replay.response_entity_id) }, 200, 'no_change', { idempotent_replay: true });
  const batchId = newId('imp');
  const timestamp = now();
  await cfg.db.batch([
    cfg.db.prepare(`INSERT INTO gv1_import_batches
      (import_batch_id,source_system,source_reference,status,row_count,accepted_count,rejected_count,started_at,completed_at,created_at,
       source_name,source_checksum,environment,expected_count,processed_count,imported_count,skipped_count,error_count,created_by,updated_at)
      VALUES (?,'day3',?,'open',0,0,0,?,NULL,?,?,?,?,?,0,0,0,0,?,?)`)
      .bind(batchId, sourceName, timestamp, timestamp, sourceName, sourceChecksum, cfg.environment, expectedCount, actorInfo.id, timestamp),
    auditStmt(cfg.db, { entityType: 'import_batch', entityId: batchId, operation: 'create', priorVersion: null, newVersion: 1, actorInfo, reason: 'DAY3_IMPORT_BATCH_CREATE', corr, cfg, timestamp, change: { source_name: sourceName, expected_count: expectedCount } }),
    receiptStmt(cfg.db, { scope: 'import:batch:create', key, fingerprint, status: 201, entityType: 'import_batch', entityId: batchId, timestamp })
  ]);
  return ok(cfg, corr, origin, { batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId) }, 201, 'created');
}

async function processImportRow(request, cfg, corr, origin, batchId) {
  requireRuntime(cfg);
  const actorInfo = requireImport(request);
  const body = await jsonBody(request);
  const rowKey = requireId('source_row_key', body.source_row_key);
  const batch = await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId);
  if (!batch) throw new GVError('GV_NOT_FOUND', 'The import batch was not found.', 404);
  if (!['open','validating','importing'].includes(batch.status)) throw new GVError('GV_VERSION_CONFLICT', 'The import batch is closed.', 409);
  const fingerprint = await hash('import-row', { batchId, rowKey, command: body.command });
  const existing = await first(cfg.db, `SELECT * FROM gv1_import_row_receipts WHERE import_batch_id=? AND source_row_key=?`, batchId, rowKey);
  if (existing) {
    if (existing.request_fingerprint !== fingerprint) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The source row key was reused with changed content.', 409);
    return ok(cfg, corr, origin, { row: JSON.parse(existing.response_json), batch }, 200, 'no_change', { idempotent_replay: true });
  }
  const timestamp = now();
  let resultType = 'error';
  let entityId = null;
  let errorCode = null;
  let response = null;
  try {
    const command = body.command;
    if (!command || typeof command !== 'object') throw new GVError('GV_REQ_SCHEMA', 'command is required.', 422);
    command.source_type = 'imported_reference';
    command.source_ref = `${batchId}:${rowKey}`;
    command.captured_at = command.captured_at || timestamp;
    const prepared = await prepareEvidence(cfg.db, command, actorInfo, { sourceType: 'imported_reference', sourceRef: command.source_ref });
    const duplicate = await first(cfg.db, `SELECT evidence_id FROM gv1_evidence_items WHERE bmr_id=? AND content_hash=? AND status NOT IN ('rejected','archived') LIMIT 1`, prepared.bmrId, prepared.contentHash);
    if (duplicate) {
      resultType = 'skipped';
      entityId = duplicate.evidence_id;
      response = { source_row_key: rowKey, result: 'skipped', canonical_entity_id: entityId };
    } else {
      const evidenceId = newId('evd');
      const commandInsert = { ...prepared, evidenceId, groupId: newId('evg'), versionNo: 1, supersedesEvidenceId: null, timestamp, status: 'draft' };
      const event = eventStmt(cfg.db, { bmrId: prepared.bmrId, sessionId: prepared.sessionId, eventName: 'row_imported', corr, cfg, timestamp, metadata: { import_batch_id: batchId, source_row_key: rowKey, evidence_id: evidenceId } });
      const statements = [evidenceInsertStmt(cfg.db, commandInsert)];
      if (event) statements.push(event);
      await cfg.db.batch(statements);
      resultType = 'imported';
      entityId = evidenceId;
      response = { source_row_key: rowKey, result: 'imported', canonical_entity_id: entityId };
    }
  } catch (error) {
    const safe = error instanceof GVError ? error : new GVError('GV_REQ_SCHEMA', 'The import row is invalid.', 422);
    errorCode = safe.code;
    response = { source_row_key: rowKey, result: 'error', error_code: errorCode };
    await cfg.db.prepare(`INSERT INTO gv1_import_errors
      (import_error_id,import_batch_id,source_row_reference,error_code,safe_error_message,safe_error_json,created_at,source_row_key,field_name,quarantined_payload_json,correlation_id)
      VALUES (?,?,?,?,?,?,?,?,'command',?,?)`)
      .bind(newId('ime'), batchId, rowKey, errorCode, safe.message, JSON.stringify({ code: errorCode }), timestamp, rowKey,
        JSON.stringify({ source_row_key: rowKey }), corr).run();
  }
  const importedDelta = resultType === 'imported' ? 1 : 0;
  const skippedDelta = resultType === 'skipped' ? 1 : 0;
  const errorDelta = resultType === 'error' ? 1 : 0;
  await cfg.db.batch([
    cfg.db.prepare(`INSERT INTO gv1_import_row_receipts
      (import_batch_id,source_row_key,request_fingerprint,result_type,canonical_entity_id,error_code,response_json,created_at)
      VALUES (?,?,?,?,?,?,?,?)`).bind(batchId, rowKey, fingerprint, resultType, entityId, errorCode, JSON.stringify(response), timestamp),
    cfg.db.prepare(`UPDATE gv1_import_batches SET status='importing',processed_count=processed_count+1,imported_count=imported_count+?,skipped_count=skipped_count+?,error_count=error_count+?,row_count=row_count+1,accepted_count=accepted_count+?,rejected_count=rejected_count+?,updated_at=? WHERE import_batch_id=?`)
      .bind(importedDelta, skippedDelta, errorDelta, importedDelta, errorDelta, timestamp, batchId)
  ]);
  return ok(cfg, corr, origin, { row: response, batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId) }, 200, resultType === 'error' ? 'invalid_request' : 'updated');
}

async function closeImportBatch(request, cfg, corr, origin, batchId) {
  requireRuntime(cfg);
  const actorInfo = requireImport(request);
  const key = idempotencyKey(request);
  await jsonBody(request);
  const fingerprint = await hash('import-batch-close', { batchId, actorInfo });
  const replay = await checkReplay(cfg.db, 'import:batch:close', key, fingerprint);
  if (replay) return ok(cfg, corr, origin, { batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId) }, 200, 'no_change', { idempotent_replay: true });
  const batch = await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId);
  if (!batch) throw new GVError('GV_NOT_FOUND', 'The import batch was not found.', 404);
  const processed = Number(batch.processed_count);
  const imported = Number(batch.imported_count);
  const skipped = Number(batch.skipped_count);
  const errors = Number(batch.error_count);
  if (processed !== imported + skipped + errors || (batch.expected_count !== null && processed !== Number(batch.expected_count))) {
    throw new GVError('GV_VERSION_CONFLICT', 'The import batch counts do not reconcile.', 409, { processed, imported, skipped, errors, expected: batch.expected_count });
  }
  const status = errors > 0 ? 'completed_with_errors' : 'completed';
  const timestamp = now();
  await cfg.db.batch([
    cfg.db.prepare(`UPDATE gv1_import_batches SET status=?,completed_at=?,updated_at=? WHERE import_batch_id=?`).bind(status, timestamp, timestamp, batchId),
    auditStmt(cfg.db, { entityType: 'import_batch', entityId: batchId, operation: 'reconcile', priorVersion: null, newVersion: null, actorInfo, reason: 'DAY3_IMPORT_BATCH_RECONCILE', corr, cfg, timestamp, change: { processed, imported, skipped, errors, status } }),
    receiptStmt(cfg.db, { scope: 'import:batch:close', key, fingerprint, status: 200, entityType: 'import_batch', entityId: batchId, timestamp })
  ]);
  return ok(cfg, corr, origin, { batch: await first(cfg.db, `SELECT * FROM gv1_import_batches WHERE import_batch_id=?`, batchId), reconciled: true }, 200, 'updated');
}

async function day3Route(request, cfg, corr, origin) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (request.method === 'OPTIONS' && path.startsWith('/api/v1/')) return new Response(null, { status: 204, headers: responseHeaders(cfg, corr, origin) });
  if (request.method === 'POST' && path === '/api/v1/evidence') return submitEvidence(request, cfg, corr, origin);
  const evidenceMatch = path.match(/^\/api\/v1\/evidence\/([^/]+)(?:\/(accept|reject|supersede))?$/);
  if (evidenceMatch) {
    const evidenceId = decodeURIComponent(evidenceMatch[1]);
    const action = evidenceMatch[2];
    if (request.method === 'GET' && !action) {
      requireRuntime(cfg);
      const evidence = await loadEvidence(cfg.db, evidenceId);
      if (!evidence) throw new GVError('GV_NOT_FOUND', 'Evidence was not found.', 404);
      return ok(cfg, corr, origin, { evidence: await evidenceView(cfg.db, evidence) });
    }
    if (request.method === 'POST' && action === 'accept') return acceptEvidence(request, cfg, corr, origin, evidenceId);
    if (request.method === 'POST' && action === 'reject') return rejectEvidence(request, cfg, corr, origin, evidenceId);
    if (request.method === 'POST' && action === 'supersede') return supersedeEvidence(request, cfg, corr, origin, evidenceId);
  }
  const bmrEvidence = path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/evidence$/);
  if (request.method === 'GET' && bmrEvidence) return listEvidence(cfg, corr, origin, decodeURIComponent(bmrEvidence[1]), url);
  if (request.method === 'POST' && path === '/api/v1/import-batches') return createImportBatch(request, cfg, corr, origin);
  const importMatch = path.match(/^\/api\/v1\/import-batches\/([^/]+)\/(rows|close)$/);
  if (request.method === 'POST' && importMatch?.[2] === 'rows') return processImportRow(request, cfg, corr, origin, decodeURIComponent(importMatch[1]));
  if (request.method === 'POST' && importMatch?.[2] === 'close') return closeImportBatch(request, cfg, corr, origin, decodeURIComponent(importMatch[1]));
  return null;
}

const worker = {
  async fetch(request, env, ctx) {
    const cfg = config(env);
    const corr = correlationId(request);
    const origin = originState(request, cfg);
    if (!origin.allowed) return fail(cfg, corr, origin, new GVError('GV_CORS_DENIED', 'The request origin is not allowed.', 403));
    try {
      const handled = await day3Route(request, cfg, corr, origin);
      if (handled) return handled;
      return day1Worker.fetch(request, env, ctx);
    } catch (error) {
      const message = clean(error?.message);
      if (message.includes('GV_EVIDENCE_IMMUTABLE')) error = new GVError('GV_EVIDENCE_IMMUTABLE', 'Accepted evidence cannot be updated in place.', 409);
      return fail(cfg, corr, origin, error);
    }
  }
};

export default worker;
