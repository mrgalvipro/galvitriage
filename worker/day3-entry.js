import day2Worker from './day2.js';
import day3Worker from './day3.js';

const API_VERSION = 'v1';
const REQUIRED_SCHEMA = '0003';
const SAFE_ID = /^[A-Za-z0-9:._-]{3,180}$/;

const clean = (value) => String(value ?? '').trim();
const now = () => new Date().toISOString();
const newId = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const first = async (db, sql, ...params) => db.prepare(sql).bind(...params).first();

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

function context(request, env) {
  const environment = clean(env?.ENVIRONMENT || 'unknown').toLowerCase();
  const allowedOrigins = clean(env?.ALLOWED_ORIGINS).split(',').map((item) => item.trim()).filter(Boolean);
  const origin = clean(request.headers.get('Origin'));
  const correlation = SAFE_ID.test(clean(request.headers.get('X-Correlation-Id')))
    ? clean(request.headers.get('X-Correlation-Id'))
    : newId('corr');
  return { environment, allowedOrigins, origin, correlation };
}

function headers(ctx) {
  const result = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    'X-GalviVault-Environment': ctx.environment,
    'X-GalviVault-Api-Version': API_VERSION,
    'X-Correlation-Id': ctx.correlation
  });
  if (ctx.origin && ctx.allowedOrigins.includes(ctx.origin)) {
    result.set('Access-Control-Allow-Origin', ctx.origin);
    result.set('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, X-Correlation-Id, X-Galvi-Role, X-Galvi-Actor-Id, X-GalviVault-Actor-Id, X-GalviVault-Actor-Type');
    result.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, OPTIONS');
  }
  return result;
}

function success(ctx, data, status = 200, state = 'ok', meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    status: state,
    environment: ctx.environment,
    correlation_id: ctx.correlation,
    data,
    meta: { api_version: API_VERSION, schema_version: REQUIRED_SCHEMA, ...meta }
  }), { status, headers: headers(ctx) });
}

function failure(ctx, code, message, status) {
  return new Response(JSON.stringify({
    success: false,
    status: status === 404 ? 'not_found' : status === 409 ? 'conflict' : status === 403 ? 'forbidden' : 'invalid_request',
    environment: ctx.environment,
    correlation_id: ctx.correlation,
    error: { code, message, retryable: false },
    meta: { api_version: API_VERSION, schema_version: REQUIRED_SCHEMA }
  }), { status, headers: headers(ctx) });
}

async function body(request) {
  const parsed = await request.json();
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('JSON object required');
  return parsed;
}

function requireOperator(request) {
  const role = clean(request.headers.get('X-Galvi-Role')).toLowerCase();
  if (!['operator','service','admin'].includes(role)) return null;
  return { role, id: clean(request.headers.get('X-Galvi-Actor-Id')) || 'day3-operator' };
}

async function readiness(request, env, ctx) {
  if (!env?.DB) return failure(ctx, 'GV_DB_UNAVAILABLE', 'The GalviVault DB binding is unavailable.', 503);
  const migration = await first(env.DB, `SELECT migration_id,name,environment,checksum,applied_at FROM gv1_schema_migrations WHERE migration_id='0003'`);
  const trigger = await first(env.DB, `SELECT name FROM sqlite_master WHERE type='trigger' AND name='trg_gv1_accepted_evidence_no_update'`);
  const question = await first(env.DB, `SELECT question_id,version,product,dimension,prompt,response_type,required_flag,minimum_value,maximum_value,weight,score_direction,status,effective_at,created_at FROM gv1_question_definitions WHERE question_id='triage.problem_clarity' AND version='v1'`);
  const ready = Boolean(migration && trigger && question && question.status === 'active' && Number(question.required_flag) === 1);
  const data = {
    service: 'galvivault-p0-day3',
    ready,
    current_schema_version: migration?.migration_id || null,
    required_schema_version: REQUIRED_SCHEMA,
    migration: migration || null,
    immutable_trigger: trigger?.name || null,
    question_definition: question || null
  };
  return success(ctx, data, ready ? 200 : 503, ready ? 'ok' : 'unavailable');
}

async function immutableMutation(request, env, ctx, evidenceId) {
  const evidence = await first(env.DB, `SELECT evidence_id,status FROM gv1_evidence_items WHERE evidence_id=?`, evidenceId);
  if (!evidence) return failure(ctx, 'GV_NOT_FOUND', 'Evidence was not found.', 404);
  if (evidence.status === 'accepted') return failure(ctx, 'GV_EVIDENCE_IMMUTABLE', 'Accepted evidence cannot be updated in place.', 409);
  return failure(ctx, 'GV_REQ_METHOD', 'Evidence content updates are not supported; submit a new version.', 405);
}

async function assessmentSupersede(request, env, ctx, evidenceId) {
  const actor = requireOperator(request);
  if (!actor) return failure(ctx, 'GV_AUTH_FORBIDDEN', 'Authorized operator scope is required.', 403);
  const key = clean(request.headers.get('Idempotency-Key'));
  if (!SAFE_ID.test(key)) return failure(ctx, 'GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key is required.', 400);
  const input = await body(request);
  const reason = clean(input.correction_reason);
  if (!reason || reason.length > 500) return failure(ctx, 'GV_REQ_SCHEMA', 'correction_reason is required and must be bounded.', 422);

  const source = await first(env.DB, `SELECT * FROM gv1_evidence_items WHERE evidence_id=?`, evidenceId);
  if (!source) return failure(ctx, 'GV_NOT_FOUND', 'Evidence was not found.', 404);
  if (source.source_type !== 'assessment_answer') return day3Worker.fetch(request, env);
  const latest = await first(env.DB, `SELECT evidence_id FROM gv1_evidence_items WHERE evidence_group_id=? ORDER BY version_no DESC LIMIT 1`, source.evidence_group_id);
  if (latest?.evidence_id !== source.evidence_id) return failure(ctx, 'GV_VERSION_CONFLICT', 'Only the current leaf evidence can be superseded.', 409);
  const priorAnswer = await first(env.DB, `SELECT * FROM gv1_assessment_answers WHERE answer_id=?`, source.source_ref);
  if (!priorAnswer) return failure(ctx, 'GV_NOT_FOUND', 'The source assessment answer was not found.', 404);

  const requestFingerprint = await hash('evidence:supersede:assessment', { evidenceId, input, actor });
  const receipt = await first(env.DB, `SELECT request_fingerprint,response_entity_id FROM gv1_idempotency_keys WHERE scope='evidence:supersede' AND idempotency_key=?`, key);
  if (receipt) {
    if (receipt.request_fingerprint !== requestFingerprint) return failure(ctx, 'GV_IDEMPOTENCY_REUSE_MISMATCH', 'The idempotency key was reused with different content.', 409);
    const replay = await first(env.DB, `SELECT * FROM gv1_evidence_items WHERE evidence_id=?`, receipt.response_entity_id);
    return success(ctx, { evidence: replay }, 200, 'no_change', { idempotent_replay: true });
  }

  const valueFields = ['value_text','value_number','value_boolean','value_date','value_json'];
  const populated = valueFields.filter((field) => input[field] !== undefined && input[field] !== null);
  const valueType = clean(input.value_type).toLowerCase();
  const requiredField = valueType === 'number' ? 'value_number' : valueType === 'boolean' ? 'value_boolean' : valueType === 'date' ? 'value_date' : valueType === 'json' ? 'value_json' : 'value_text';
  if (populated.length !== 1 || populated[0] !== requiredField) return failure(ctx, 'GV_REQ_SCHEMA', 'Exactly one compatible typed value field is required.', 422);
  const typed = { value_text: null, value_number: null, value_boolean: null, value_date: null, value_json: null };
  if (requiredField === 'value_number') {
    if (typeof input.value_number !== 'number' || !Number.isFinite(input.value_number)) return failure(ctx, 'GV_REQ_SCHEMA', 'value_number must be finite.', 422);
    typed.value_number = input.value_number;
  } else if (requiredField === 'value_boolean') {
    if (typeof input.value_boolean !== 'boolean') return failure(ctx, 'GV_REQ_SCHEMA', 'value_boolean must be a JSON boolean.', 422);
    typed.value_boolean = input.value_boolean ? 1 : 0;
  } else if (requiredField === 'value_json') {
    if (!input.value_json || typeof input.value_json !== 'object') return failure(ctx, 'GV_REQ_SCHEMA', 'value_json must be an object or array.', 422);
    typed.value_json = JSON.stringify(canonicalize(input.value_json));
  } else if (requiredField === 'value_date') {
    const time = Date.parse(input.value_date);
    if (!Number.isFinite(time)) return failure(ctx, 'GV_REQ_SCHEMA', 'value_date is invalid.', 422);
    typed.value_date = new Date(time).toISOString();
  } else {
    typed.value_text = clean(input.value_text);
    if (!typed.value_text) return failure(ctx, 'GV_REQ_SCHEMA', 'value_text is required.', 422);
  }

  const timestamp = now();
  const capturedAt = input.captured_at ? new Date(input.captured_at).toISOString() : timestamp;
  const answerId = newId('ans');
  const evidenceId2 = newId('evd');
  const answerVersion = Number(priorAnswer.version_no) + 1;
  const evidenceVersion = Number(source.version_no) + 1;
  const answerInput = input.assessment_answer && typeof input.assessment_answer === 'object' ? input.assessment_answer : {};
  const rawText = answerInput.raw_value_text ?? typed.value_text;
  const rawNumber = answerInput.raw_value_number ?? typed.value_number;
  const normalizedText = answerInput.normalized_value_text ?? typed.value_text;
  const normalizedNumber = answerInput.normalized_value_number ?? typed.value_number;
  const confidenceEffect = answerInput.confidence_effect ?? priorAnswer.confidence_effect ?? null;
  const answerHash = await hash('assessment-answer', {
    question_id: priorAnswer.question_id,
    question_version: priorAnswer.question_version,
    raw_value_text: rawText,
    raw_value_number: rawNumber,
    normalized_value_text: normalizedText,
    normalized_value_number: normalizedNumber,
    confidence_effect: confidenceEffect
  });
  const contentHash = await hash('evidence-content', {
    bmr_id: source.bmr_id,
    session_id: source.session_id,
    source_type: 'assessment_answer',
    source_ref: answerId,
    captured_at: capturedAt,
    consent_status: input.consent_status || source.consent_status || 'not_applicable',
    value_type: valueType,
    ...typed
  });
  const eventKey = `day3:evidence_superseded:${evidenceId2}`;
  const statements = [
    env.DB.prepare(`INSERT INTO gv1_assessment_answers
      (answer_id,session_id,question_id,answer_text,answer_number,answer_json,evidence_version,created_at,updated_at,bmr_id,question_version,answer_group_id,version_no,supersedes_answer_id,raw_value_text,raw_value_number,normalized_value_text,normalized_value_number,confidence_effect,source,captured_at,status,content_hash)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        answerId, priorAnswer.session_id, priorAnswer.question_id, typed.value_text, typed.value_number, typed.value_json,
        answerVersion, timestamp, timestamp, priorAnswer.bmr_id, priorAnswer.question_version, priorAnswer.answer_group_id,
        answerVersion, priorAnswer.answer_id, rawText, rawNumber, normalizedText, normalizedNumber, confidenceEffect,
        'day3-entry', capturedAt, 'draft', answerHash
      ),
    env.DB.prepare(`INSERT INTO gv1_evidence_items
      (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,evidence_group_id,version_no,supersedes_evidence_id,source_type,source_ref,value_type,value_text,value_number,value_boolean,value_date,value_json,status,consent_status,source_actor_type,source_actor_id,captured_at,content_hash,rejection_reason,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        evidenceId2, source.bmr_id, source.session_id, valueType, 'GalviVault', answerId,
        JSON.stringify({ value_type: valueType, ...typed }), null, evidenceVersion, timestamp, source.evidence_group_id,
        evidenceVersion, source.evidence_id, 'assessment_answer', answerId, valueType, typed.value_text, typed.value_number,
        typed.value_boolean, typed.value_date, typed.value_json, 'draft', input.consent_status || source.consent_status || 'not_applicable',
        actor.role, actor.id, capturedAt, contentHash, null, timestamp
      ),
    env.DB.prepare(`INSERT INTO gv1_evidence_relationships
      (relationship_id,from_evidence_id,to_evidence_id,relationship_type,created_at,rationale,correlation_id)
      VALUES (?,?,?,'corrects',?,?,?)`).bind(newId('rel'), evidenceId2, source.evidence_id, timestamp, reason, ctx.correlation),
    env.DB.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,?,'GalviVault','Day3',?,?,?,?,?,?,?)`).bind(
        newId('jev'), eventKey, source.bmr_id, source.session_id, 'evidence_superseded', timestamp, actor.role,
        JSON.stringify({ evidence_id: evidenceId2, supersedes_evidence_id: source.evidence_id, version_no: evidenceVersion }),
        requestFingerprint, ctx.correlation, ctx.environment, timestamp
      ),
    env.DB.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
        newId('aud'), 'evidence', evidenceId2, 'supersede', source.version_no, evidenceVersion, actor.role,
        'day3-entry', reason, JSON.stringify({ supersedes_evidence_id: source.evidence_id, answer_id: answerId }),
        ctx.correlation, ctx.environment, timestamp, timestamp
      ),
    env.DB.prepare(`INSERT INTO gv1_idempotency_keys
      (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at)
      VALUES (?,?,?,?,?,?,?,?)`).bind(newId('idem'), 'evidence:supersede', key, requestFingerprint, 201, 'evidence', evidenceId2, timestamp)
  ];
  await env.DB.batch(statements);
  const created = await first(env.DB, `SELECT * FROM gv1_evidence_items WHERE evidence_id=?`, evidenceId2);
  const createdAnswer = await first(env.DB, `SELECT * FROM gv1_assessment_answers WHERE answer_id=?`, answerId);
  return success(ctx, { evidence: created, answer: createdAnswer, previous_evidence_id: source.evidence_id }, 201, 'created');
}

const worker = {
  async fetch(request, env, executionContext) {
    const ctx = context(request, env);
    if (ctx.origin && !ctx.allowedOrigins.includes(ctx.origin)) return failure(ctx, 'GV_CORS_DENIED', 'The request origin is not allowed.', 403);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (request.method === 'OPTIONS' && path.startsWith('/api/v1/')) return new Response(null, { status: 204, headers: headers(ctx) });
    if (request.method === 'GET' && (path === '/api/v1/day3/readiness' || path === '/api/v1/schema-version')) return readiness(request, env, ctx);
    const evidenceMatch = path.match(/^\/api\/v1\/evidence\/([^/]+)(?:\/(accept|reject|supersede))?$/);
    if (evidenceMatch && ['PATCH','PUT','DELETE'].includes(request.method) && !evidenceMatch[2]) {
      return immutableMutation(request, env, ctx, decodeURIComponent(evidenceMatch[1]));
    }
    if (evidenceMatch && request.method === 'POST' && evidenceMatch[2] === 'supersede') {
      const source = await first(env.DB, `SELECT source_type FROM gv1_evidence_items WHERE evidence_id=?`, decodeURIComponent(evidenceMatch[1]));
      if (source?.source_type === 'assessment_answer') return assessmentSupersede(request, env, ctx, decodeURIComponent(evidenceMatch[1]));
    }
    const day3Path = path === '/api/v1/evidence' || path.startsWith('/api/v1/evidence/') ||
      /^\/api\/v1\/business-medical-records\/[^/]+\/evidence$/.test(path) || path.startsWith('/api/v1/import-batches');
    if (day3Path) return day3Worker.fetch(request, env, executionContext);
    return day2Worker.fetch(request, env, executionContext);
  }
};

export default worker;
