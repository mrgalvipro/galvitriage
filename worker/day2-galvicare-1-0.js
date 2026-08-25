import day1 from './day1.js';

export const GALVICARE_RELEASE = 'galvicare_1_0_day2';
export const GALVICARE_SCHEMA = '0102';
export const RULES_VERSION = 'galviengine_1_0_score_v1';
export const PROTOCOL_VERSION = 'universal_business_health_v1';

const SAFE_ID = /^[A-Za-z0-9:._-]{3,180}$/;
const ALLOWED_RED_FLAGS = new Set([
  'payroll_or_critical_obligations',
  'legal_regulatory_deadline',
  'fraud_internal_control',
  'cybersecurity_data_breach',
  'insolvency_liquidity_continuity',
  'regulated_professional_dependency'
]);
const FOUNDER_READINESS_DIMENSIONS = [
  'clarity','runway','time','capability','network','domain_knowledge',
  'opportunity_evidence','decision_confidence','leadership_readiness','operating_willingness'
];
const BUSINESS_HEALTH_DIMENSIONS = [
  'revenue','customer','product','leadership','technology','distribution','problem','business_model'
];
const CONFIDENCE_COMPONENTS = [
  'required_data_completeness','evidence_quality','answer_consistency','corroboration','context_completeness'
];
const ACUITY_WEIGHTS = {
  severity: 0.30,
  urgency: 0.25,
  continuity: 0.20,
  reversibility: 0.15,
  complexity: 0.10
};

const clean = (value) => String(value ?? '').trim();
const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value)));

class Day2Error extends Error {
  constructor(code, message, status = 400, details = undefined) {
    super(message);
    Object.assign(this, { code, status, details });
  }
}

function config(env) {
  return {
    environment: clean(env?.ENVIRONMENT).toLowerCase(),
    fixtureMode: clean(env?.FIXTURE_MODE).toLowerCase() === 'true',
    db: env?.DB,
    allowedOrigins: clean(env?.ALLOWED_ORIGINS).split(',').map((x) => x.trim()).filter(Boolean),
    commitSha: clean(env?.COMMIT_SHA) || null
  };
}

function correlationId(request) {
  const supplied = clean(request.headers.get('X-Correlation-Id'));
  return SAFE_ID.test(supplied) ? supplied : id('corr');
}

function originState(request, cfg) {
  const origin = clean(request.headers.get('Origin'));
  return { origin, allowed: !origin || cfg.allowedOrigins.includes(origin) };
}

function responseHeaders(cfg, correlation, origin) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-galvivault-environment': cfg.environment,
    'x-correlation-id': correlation
  });
  if (origin.origin && origin.allowed) {
    headers.set('access-control-allow-origin', origin.origin);
    headers.set('access-control-allow-headers', 'Content-Type, Idempotency-Key, X-Correlation-Id, X-Galvi-Day1-Actor');
    headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  }
  return headers;
}

function ok(cfg, correlation, origin, data, status = 200, state = 'ok', meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    status: state,
    environment: cfg.environment,
    correlation_id: correlation,
    data,
    meta: {
      schema_version: GALVICARE_SCHEMA,
      release_version: GALVICARE_RELEASE,
      rules_version: RULES_VERSION,
      protocol_version: PROTOCOL_VERSION,
      ai_enabled: false,
      ...meta
    }
  }), { status, headers: responseHeaders(cfg, correlation, origin) });
}

function fail(cfg, correlation, origin, error) {
  const safe = error instanceof Day2Error
    ? error
    : new Day2Error('GV_DAY2_INTERNAL', 'Unexpected Day 2 error.', 500);
  const state = safe.code === 'GV_CONSENT_REQUIRED'
    ? 'consent_required'
    : safe.status === 401
      ? 'unauthenticated'
      : safe.status === 403
        ? 'forbidden'
        : safe.status === 404
          ? 'not_found'
          : safe.status === 409
            ? 'conflict'
            : safe.status >= 500
              ? 'internal_error'
              : 'invalid_request';
  return new Response(JSON.stringify({
    success: false,
    status: state,
    environment: cfg.environment,
    correlation_id: correlation,
    error: {
      code: safe.code,
      message: safe.message,
      ...(safe.details ? { details: safe.details } : {})
    },
    meta: {
      schema_version: GALVICARE_SCHEMA,
      release_version: GALVICARE_RELEASE,
      ai_enabled: false
    }
  }), { status: safe.status, headers: responseHeaders(cfg, correlation, origin) });
}

function gate(cfg) {
  if (!['qa', 'local'].includes(cfg.environment) || !cfg.fixtureMode) {
    throw new Day2Error('GV_DAY2_QA_ONLY', 'Day 2 clinical intake routes are QA-only.', 404);
  }
  if (!cfg.db || typeof cfg.db.prepare !== 'function') {
    throw new Day2Error('GV_DB_UNAVAILABLE', 'QA D1 binding is unavailable.', 503);
  }
}

async function requireSchema(cfg) {
  gate(cfg);
  const migration = await first(
    cfg.db,
    'SELECT migration_id, environment FROM gv1_schema_migrations WHERE migration_id=?',
    GALVICARE_SCHEMA
  );
  if (migration?.environment !== 'qa') {
    throw new Day2Error('GV_DAY2_SCHEMA_OUTDATED', 'GalviCare 1.0 Day 2 schema is unavailable.', 503);
  }
}

async function readJson(request) {
  if (!clean(request.headers.get('content-type')).toLowerCase().startsWith('application/json')) {
    throw new Day2Error('GV_REQ_BODY_INVALID', 'Content-Type application/json is required.', 400);
  }
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad');
    return body;
  } catch {
    throw new Day2Error('GV_REQ_BODY_INVALID', 'A JSON object is required.', 400);
  }
}

function requestKey(request) {
  const value = clean(request.headers.get('Idempotency-Key'));
  if (!SAFE_ID.test(value)) {
    throw new Day2Error('GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key is required.', 400);
  }
  return value;
}

function actor(request, cfg) {
  gate(cfg);
  const raw = clean(request.headers.get('X-Galvi-Day1-Actor'));
  if (raw.startsWith('principal:')) {
    const suffix = raw.slice('principal:'.length);
    if (!/^[A-Za-z0-9._-]{1,72}$/.test(suffix)) {
      throw new Day2Error('GV_AUTH_REQUIRED', 'Invalid principal actor.', 401);
    }
    return {
      raw,
      role: 'customer',
      email: `day1.${suffix.toLowerCase()}@example.invalid`
    };
  }
  if (raw === 'business_physician') return { raw, role: 'business_physician', email: null };
  throw new Day2Error('GV_AUTH_REQUIRED', 'An authorized Day 2 actor is required.', 401);
}

async function contextFor(cfg, actorState, contextId) {
  if (!SAFE_ID.test(clean(contextId))) {
    throw new Day2Error('GV_VALIDATION_FAILED', 'context_id is invalid.', 422);
  }
  const context = await first(
    cfg.db,
    `SELECT c.*, f.email
       FROM gv1_principal_contexts c
       JOIN gv1_founders f ON f.founder_id=c.founder_id
      WHERE c.context_id=?`,
    contextId
  );
  if (!context) throw new Day2Error('GV_NOT_FOUND', 'Principal context not found.', 404);
  if (actorState.role !== 'business_physician' && clean(context.email).toLowerCase() !== actorState.email) {
    throw new Day2Error('GV_AUTH_FORBIDDEN', 'Record access denied.', 403);
  }
  return context;
}

async function requireConsent(cfg, context) {
  const current = await first(
    cfg.db,
    `SELECT status
       FROM gv1_consent_events
      WHERE founder_id=? AND purpose='care_processing'
      ORDER BY recorded_at DESC, consent_id DESC LIMIT 1`,
    context.founder_id
  );
  if (current?.status !== 'granted') {
    throw new Day2Error('GV_CONSENT_REQUIRED', 'Care-processing consent is required.', 403, {
      current_status: current?.status || null
    });
  }
}

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
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function replay(cfg, correlation, origin, scope, key, requestFingerprint) {
  const receipt = await first(
    cfg.db,
    `SELECT request_fingerprint,response_json
       FROM gv1_day1_request_receipts
      WHERE scope=? AND idempotency_key=?`,
    scope,
    key
  );
  if (!receipt) return null;
  if (receipt.request_fingerprint !== requestFingerprint) {
    throw new Day2Error('GV_IDEMPOTENCY_REUSE_MISMATCH', 'Idempotency key already used for different input.', 409);
  }
  const stored = JSON.parse(receipt.response_json);
  return ok(cfg, correlation, origin, stored.data, 200, 'replayed', { idempotent_replay: true });
}

function receiptStatement(db, scope, key, requestFingerprint, data, entityId, timestamp) {
  return db.prepare(
    `INSERT INTO gv1_day1_request_receipts
       (scope,idempotency_key,request_fingerprint,response_status,response_json,entity_type,entity_id,created_at)
     VALUES(?,?,?,?,?,?,?,?)`
  ).bind(scope, key, requestFingerprint, 201, JSON.stringify({ data }), scope, entityId, timestamp);
}

function auditStatement(db, entityType, entityId, correlation, timestamp) {
  return db.prepare(
    `INSERT INTO gv1_audit_log
       (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,
        reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
     VALUES(?,?,?,'append',NULL,1,'service','galvicare-1.0-day2','DAY2','{}',?,'qa',?,?)`
  ).bind(id('aud'), entityType, entityId, correlation, timestamp, timestamp);
}

async function appendEvidence(request, env, body, context, scope, key) {
  const evidencePayload = {
    founder_id: context.founder_id,
    ...(context.bmr_id ? { bmr_id: context.bmr_id } : {}),
    category: body.category,
    validation_status: 'reported',
    source_type: 'galvicare_day2',
    source_ref: scope,
    payload: body.payload,
    provenance: {
      release_version: GALVICARE_RELEASE,
      rules_version: RULES_VERSION,
      protocol_version: PROTOCOL_VERSION
    }
  };
  const headers = new Headers({
    'content-type': 'application/json',
    'idempotency-key': `${key}.evidence`,
    'x-galvi-day1-actor': clean(request.headers.get('X-Galvi-Day1-Actor')),
    'x-correlation-id': clean(request.headers.get('X-Correlation-Id')) || id('corr')
  });
  const origin = clean(request.headers.get('Origin'));
  if (origin) headers.set('origin', origin);
  const evidenceRequest = new Request(new URL('/api/v1/evidence', request.url), {
    method: 'POST',
    headers,
    body: JSON.stringify(evidencePayload)
  });
  const response = await day1.fetch(evidenceRequest, env);
  const payload = await response.json();
  if (!response.ok) {
    throw new Day2Error(
      payload?.error?.code || 'GV_DAY2_EVIDENCE_FAILED',
      payload?.error?.message || 'Day 2 evidence write failed.',
      response.status,
      payload?.error?.details
    );
  }
  return payload.data.evidence;
}

function numberObject(value, allowedKeys, min, max, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Day2Error('GV_VALIDATION_FAILED', `${field} must be an object.`, 422);
  }
  const out = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!allowedKeys.includes(key)) throw new Day2Error('GV_VALIDATION_FAILED', `${field}.${key} is not supported.`, 422);
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) {
      throw new Day2Error('GV_VALIDATION_FAILED', `${field}.${key} must be between ${min} and ${max}.`, 422);
    }
    out[key] = n;
  }
  return out;
}

function acuity(body) {
  const inputs = numberObject(body || {}, Object.keys(ACUITY_WEIGHTS), 0, 4, 'acuity');
  for (const key of Object.keys(ACUITY_WEIGHTS)) {
    if (!(key in inputs)) throw new Day2Error('GV_VALIDATION_FAILED', `acuity.${key} is required.`, 422);
  }
  const weighted = Object.entries(ACUITY_WEIGHTS).reduce((sum, [key, weight]) => sum + inputs[key] * weight, 0);
  const score = Math.round((weighted / 4) * 100);
  const band = score >= 75 ? 'red' : score >= 50 ? 'orange' : score >= 25 ? 'yellow' : 'green';
  return { inputs, score, band };
}

function confidence(body = {}, expectedCompleteness = null) {
  const source = { ...body };
  if (source.required_data_completeness === undefined && expectedCompleteness !== null) {
    source.required_data_completeness = expectedCompleteness;
  }
  const components = numberObject(source, CONFIDENCE_COMPONENTS, 0, 100, 'confidence');
  for (const key of CONFIDENCE_COMPONENTS) if (components[key] === undefined) components[key] = 50;
  const score = Math.round(CONFIDENCE_COMPONENTS.reduce((s, key) => s + components[key], 0) / CONFIDENCE_COMPONENTS.length);
  const gaps = CONFIDENCE_COMPONENTS.filter((key) => components[key] < 70);
  const questions = gaps.slice(0, 3).map((gap) => ({
    gap,
    question: {
      required_data_completeness: 'What material information is still missing for this assessment?',
      evidence_quality: 'What source or document can substantiate this answer?',
      answer_consistency: 'Which answer best reflects the current situation where responses conflict?',
      corroboration: 'What independent evidence can corroborate this statement?',
      context_completeness: 'What operating context would materially change this interpretation?'
    }[gap]
  }));
  const band = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  return { components, score, band, gaps, questions };
}

function redFlagState(rawFlags = []) {
  if (!Array.isArray(rawFlags)) throw new Day2Error('GV_VALIDATION_FAILED', 'red_flags must be an array.', 422);
  const flags = [...new Set(rawFlags.map(clean).filter(Boolean))];
  for (const flag of flags) if (!ALLOWED_RED_FLAGS.has(flag)) throw new Day2Error('GV_VALIDATION_FAILED', `Unsupported red flag: ${flag}`, 422);
  const regulated = flags.includes('regulated_professional_dependency');
  return {
    flags,
    override: flags.length > 0,
    route: regulated ? 'referral_required' : flags.length ? 'active_care' : null
  };
}

function disposition(acuityState, redFlag) {
  if (redFlag.override) return 'urgent_active_specialty_referral';
  if (acuityState.score >= 75) return 'urgent_active_specialty_referral';
  if (acuityState.score >= 50) return 'active_care_recommended';
  if (acuityState.score >= 25) return 'passive_intervention';
  return 'passive_monitoring';
}

function nextAction(dispositionValue, confidenceState, followupRound = 0) {
  if (confidenceState.score < 60) return Number(followupRound) > 0 ? 'human_review' : 'targeted_followup';
  if (dispositionValue === 'urgent_active_specialty_referral') return 'referral';
  if (dispositionValue === 'active_care_recommended') return 'book_clinic';
  return 'continue_vitals';
}

async function saveResult(cfg, {
  context, type, scoreType, payload, evidenceIds, requestId, requestFingerprint, correlation, scope
}) {
  const timestamp = now();
  const latest = await first(
    cfg.db,
    `SELECT COALESCE(MAX(record_version),0) AS version
       FROM gv1_day2_intake_results
      WHERE context_id=? AND result_type=?`,
    context.context_id,
    type
  );
  const version = Number(latest?.version || 0) + 1;
  const resultId = id(`d2${type}`);
  const data = {
    result_id: resultId,
    context_id: context.context_id,
    founder_id: context.founder_id,
    bmr_id: context.bmr_id || null,
    record_version: version,
    ...payload
  };
  await cfg.db.batch([
    cfg.db.prepare(
      `INSERT INTO gv1_day2_intake_results
       (result_id,context_id,founder_id,bmr_id,result_type,score_type,payload_json,
        supporting_evidence_ids_json,contradictory_evidence_ids_json,rules_version,
        protocol_version,generation_source,request_fingerprint,record_version,client_request_id,created_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      resultId, context.context_id, context.founder_id, context.bmr_id || null,
      type, scoreType || null, JSON.stringify(data), JSON.stringify(evidenceIds || []), '[]',
      RULES_VERSION, PROTOCOL_VERSION, 'rules', requestFingerprint, version, requestId, timestamp
    ),
    receiptStatement(cfg.db, scope, requestId, requestFingerprint, data, resultId, timestamp),
    auditStatement(cfg.db, `day2_${type}`, resultId, correlation, timestamp)
  ]);
  return data;
}

async function handleTriage(request, env, cfg, correlation, origin) {
  await requireSchema(cfg);
  const actorState = actor(request, cfg);
  const body = await readJson(request);
  const key = requestKey(request);
  const context = await contextFor(cfg, actorState, body.context_id);
  await requireConsent(cfg, context);
  if (context.record_mode === 'principal_only' && (body.venture_id || body.bmr_id)) {
    throw new Day2Error('GV_PREFOUNDER_FAKE_VENTURE', 'Pre-Founder Triage cannot supply a venture/BHR.', 422);
  }
  const a = acuity(body.acuity);
  const conf = confidence(body.confidence);
  const red = redFlagState(body.red_flags || []);
  const disp = disposition(a, red);
  const scoreType = context.record_mode === 'principal_only' ? 'founder_readiness' : 'business_health';
  const action = nextAction(disp, conf, body.followup_round);
  const requestFingerprint = await fingerprint('day2-triage', {
    context_id: context.context_id, acuity: a.inputs, confidence: conf.components,
    red_flags: red.flags, answers: body.answers || {}, followup_round: Number(body.followup_round || 0)
  });
  const old = await replay(cfg, correlation, origin, 'd2_triage', key, requestFingerprint);
  if (old) return old;
  const evidence = await appendEvidence(request, env, {
    category: 'foundational',
    payload: {
      lifecycle_state: context.lifecycle_state,
      record_mode: context.record_mode,
      care_protocol: context.care_protocol,
      payer_type: context.payer_type,
      acuity_inputs: a.inputs,
      confidence_components: conf.components,
      red_flags: red.flags,
      answers: body.answers || {}
    }
  }, context, 'day2_triage', key);
  const data = await saveResult(cfg, {
    context, type: 'triage', scoreType, evidenceIds: [evidence.evidence_id],
    requestId: key, requestFingerprint, correlation, scope: 'd2_triage',
    payload: {
      product: 'GalviTriage',
      lifecycle_state: context.lifecycle_state,
      record_mode: context.record_mode,
      care_protocol: context.care_protocol,
      payer_type: context.payer_type,
      score_type: scoreType,
      acuity_score: a.score,
      acuity_band: a.band,
      acuity_components: a.inputs,
      clinical_confidence: conf.score,
      clinical_confidence_band: conf.band,
      confidence_components: conf.components,
      unresolved_evidence_gaps: conf.gaps,
      followup_questions: conf.questions,
      red_flag_override: red.override,
      red_flags: red.flags,
      override_route: red.route,
      disposition: disp,
      next_action: action,
      status: action === 'human_review' ? 'human_review' : action === 'targeted_followup' ? 'needs_evidence' : 'ok',
      supporting_evidence_ids: [evidence.evidence_id],
      generation_source: 'rules',
      rules_version: RULES_VERSION,
      protocol_version: PROTOCOL_VERSION
    }
  });
  return ok(cfg, correlation, origin, data, 201, 'created');
}

async function handleVitals(request, env, cfg, correlation, origin) {
  await requireSchema(cfg);
  const actorState = actor(request, cfg);
  const body = await readJson(request);
  const key = requestKey(request);
  const context = await contextFor(cfg, actorState, body.context_id);
  await requireConsent(cfg, context);
  const scoreType = context.record_mode === 'principal_only' ? 'founder_readiness' : 'business_health';
  const expected = scoreType === 'founder_readiness' ? FOUNDER_READINESS_DIMENSIONS : BUSINESS_HEALTH_DIMENSIONS;
  const dimensions = numberObject(body.dimensions, expected, 0, 100, 'dimensions');
  if (!Object.keys(dimensions).length) throw new Day2Error('GV_VALIDATION_FAILED', 'At least one Vitals dimension is required.', 422);
  const completeness = Math.round((Object.keys(dimensions).length / expected.length) * 100);
  const conf = confidence(body.confidence || {}, completeness);
  const overall = Math.round(Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length);
  const requestFingerprint = await fingerprint('day2-vitals', {
    context_id: context.context_id, score_type: scoreType, dimensions, confidence: conf.components
  });
  const old = await replay(cfg, correlation, origin, 'd2_vitals', key, requestFingerprint);
  if (old) return old;
  const evidence = await appendEvidence(request, env, {
    category: scoreType === 'founder_readiness' ? 'foundational' : 'operational',
    payload: { score_type: scoreType, dimensions, confidence_components: conf.components }
  }, context, 'day2_vitals', key);
  const data = await saveResult(cfg, {
    context, type: 'vitals', scoreType, evidenceIds: [evidence.evidence_id],
    requestId: key, requestFingerprint, correlation, scope: 'd2_vitals',
    payload: {
      product: 'GalviVitals',
      score_type: scoreType,
      dimension_scores: dimensions,
      overall_score: overall,
      clinical_confidence: conf.score,
      clinical_confidence_band: conf.band,
      unresolved_evidence_gaps: conf.gaps,
      followup_questions: conf.questions,
      supporting_evidence_ids: [evidence.evidence_id],
      generation_source: 'rules',
      rules_version: RULES_VERSION,
      protocol_version: PROTOCOL_VERSION
    }
  });
  return ok(cfg, correlation, origin, data, 201, 'created');
}

async function latestResult(cfg, contextId, type) {
  const row = await first(
    cfg.db,
    `SELECT payload_json FROM gv1_day2_intake_results
      WHERE context_id=? AND result_type=?
      ORDER BY record_version DESC, created_at DESC LIMIT 1`,
    contextId,
    type
  );
  return row ? JSON.parse(row.payload_json) : null;
}

async function handleScore(request, _env, cfg, correlation, origin) {
  await requireSchema(cfg);
  const actorState = actor(request, cfg);
  const body = await readJson(request);
  const key = requestKey(request);
  const context = await contextFor(cfg, actorState, body.context_id);
  await requireConsent(cfg, context);
  const triage = await latestResult(cfg, context.context_id, 'triage');
  const vitals = await latestResult(cfg, context.context_id, 'vitals');
  if (!triage || !vitals) {
    throw new Day2Error('GV_DAY2_PREREQUISITE_MISSING', 'Triage and Vitals are required before GalviScore.', 409);
  }
  const scoreType = context.record_mode === 'principal_only' ? 'founder_readiness' : 'business_health';
  if (vitals.score_type !== scoreType || triage.score_type !== scoreType) {
    throw new Day2Error('GV_DAY2_SCORE_SCOPE_MISMATCH', 'Score subtype does not match the canonical record mode.', 409);
  }
  const support = [...new Set([...(triage.supporting_evidence_ids || []), ...(vitals.supporting_evidence_ids || [])])];
  const requestFingerprint = await fingerprint('day2-score', {
    context_id: context.context_id,
    triage_result_id: triage.result_id,
    vitals_result_id: vitals.result_id,
    support
  });
  const old = await replay(cfg, correlation, origin, 'd2_score', key, requestFingerprint);
  if (old) return old;
  const data = await saveResult(cfg, {
    context, type: 'score', scoreType, evidenceIds: support,
    requestId: key, requestFingerprint, correlation, scope: 'd2_score',
    payload: {
      product: 'GalviScore',
      score_type: scoreType,
      overall_score: vitals.overall_score,
      dimension_scores: vitals.dimension_scores,
      acuity_score: triage.acuity_score,
      acuity_band: triage.acuity_band,
      clinical_confidence: Math.min(triage.clinical_confidence, vitals.clinical_confidence),
      disposition: triage.disposition,
      next_action: triage.next_action,
      supporting_evidence_ids: support,
      contradictory_evidence_ids: [],
      rules_version: RULES_VERSION,
      protocol_version: PROTOCOL_VERSION,
      generation_source: 'rules'
    }
  });
  return ok(cfg, correlation, origin, data, 201, 'created');
}

async function handleState(request, cfg, correlation, origin, contextId) {
  await requireSchema(cfg);
  const actorState = actor(request, cfg);
  const context = await contextFor(cfg, actorState, contextId);
  return ok(cfg, correlation, origin, {
    context: {
      context_id: context.context_id,
      founder_id: context.founder_id,
      bmr_id: context.bmr_id || null,
      venture_id: context.venture_id || null,
      lifecycle_state: context.lifecycle_state,
      record_mode: context.record_mode,
      care_protocol: context.care_protocol,
      payer_type: context.payer_type
    },
    triage: await latestResult(cfg, context.context_id, 'triage'),
    vitals: await latestResult(cfg, context.context_id, 'vitals'),
    score: await latestResult(cfg, context.context_id, 'score')
  });
}

async function readiness(cfg, correlation, origin) {
  await requireSchema(cfg);
  return ok(cfg, correlation, origin, {
    ready: true,
    release_version: GALVICARE_RELEASE,
    schema_version: GALVICARE_SCHEMA,
    commit_sha: cfg.commitSha,
    capabilities: {
      universal_intake: true,
      acuity_index: true,
      red_flag_override: true,
      clinical_confidence: true,
      adaptive_followup: true,
      founder_readiness: true,
      business_health_score: true,
      evidence_lineage: true,
      idempotent_results: true,
      ai_enabled: false
    }
  });
}

async function augmentHealth(request, env, cfg, correlation, origin) {
  const base = await day1.fetch(request, env);
  let payload;
  try { payload = await base.json(); } catch {
    throw new Day2Error('GV_DAY2_HEALTH_UPSTREAM', 'Day 1 health contract returned a non-JSON response.', 500);
  }
  let schemaReady = false;
  try {
    await requireSchema(cfg);
    schemaReady = true;
  } catch {}
  payload.data = {
    ...(payload.data || {}),
    release_version: GALVICARE_RELEASE,
    galvicare_schema_version: GALVICARE_SCHEMA,
    commit_sha: cfg.commitSha,
    capabilities: {
      ...((payload.data || {}).capabilities || {}),
      universal_intake: schemaReady,
      acuity_index: schemaReady,
      red_flag_override: schemaReady,
      clinical_confidence: schemaReady,
      adaptive_followup: schemaReady,
      founder_readiness: schemaReady,
      business_health_score: schemaReady,
      ai_enabled: false
    }
  };
  payload.meta = {
    ...(payload.meta || {}),
    release_version: GALVICARE_RELEASE,
    schema_version: GALVICARE_SCHEMA,
    ai_enabled: false
  };
  return new Response(JSON.stringify(payload), {
    status: base.status,
    headers: responseHeaders(cfg, correlation, origin)
  });
}

const worker = {
  async fetch(request, env, ctx) {
    const cfg = config(env);
    const correlation = correlationId(request);
    const origin = originState(request, cfg);
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const day2Path = path === '/health'
      || path === '/api/v1/day2/readiness'
      || path === '/api/v1/day2/triage'
      || path === '/api/v1/day2/vitals'
      || path === '/api/v1/day2/score'
      || path.startsWith('/api/v1/day2/intake-state/');

    if (!day2Path) return day1.fetch(request, env, ctx);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(cfg, correlation, origin) });
    if (!origin.allowed) return fail(cfg, correlation, origin, new Day2Error('GV_CORS_DENIED', 'Origin denied.', 403));

    try {
      if (path === '/health' && request.method === 'GET') return await augmentHealth(request, env, cfg, correlation, origin);
      if (path === '/api/v1/day2/readiness' && request.method === 'GET') return await readiness(cfg, correlation, origin);
      if (path === '/api/v1/day2/triage' && request.method === 'POST') return await handleTriage(request, env, cfg, correlation, origin);
      if (path === '/api/v1/day2/vitals' && request.method === 'POST') return await handleVitals(request, env, cfg, correlation, origin);
      if (path === '/api/v1/day2/score' && request.method === 'POST') return await handleScore(request, env, cfg, correlation, origin);
      if (path.startsWith('/api/v1/day2/intake-state/') && request.method === 'GET') {
        const contextId = decodeURIComponent(path.split('/').pop());
        return await handleState(request, cfg, correlation, origin, contextId);
      }
      throw new Day2Error('GV_NOT_FOUND', 'Day 2 route not found.', 404);
    } catch (error) {
      return fail(cfg, correlation, origin, error);
    }
  }
};

export default worker;
