import day3Unified from './day3-unified-customer-api.js';

export const DAY4_RELEASE = 'galvicare_1_0_day4';
export const DAY4_SCHEMA = '0103';
export const DAY4_PROJECTION_VERSION = 'galvichart_projection_v1';
const SESSION_HEADER = 'X-Galvi-Day3-Session';
const DAY1_ACTOR_HEADER = 'X-Galvi-Day1-Actor';
const DAY4_SOURCE = 'galvicare-1.0-day4';
const SAFE_ID = /^[A-Za-z0-9:._-]{3,180}$/;
const CUSTOMER_COMMANDS = new Set([
  'submit_check_in',
  'upload_evidence',
  'correct_profile',
  'report_treatment_milestone',
  'acknowledge_treatment_plan',
  'schedule_galviclinic',
  'export_record'
]);
const PERMITTED_PROFILE_FIELDS = new Set(['first_name', 'last_name', 'phone']);

const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();
const now = () => new Date().toISOString();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const all = async (db, sql, ...params) => (await db.prepare(sql).bind(...params).all())?.results || [];
const run = (db, sql, ...params) => db.prepare(sql).bind(...params).run();

class Day4Error extends Error {
  constructor(code, message, status = 400, details = undefined) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function corsHeaders(request, env) {
  const origin = text(request.headers.get('Origin'));
  const allowed = text(env?.ALLOWED_ORIGINS).split(',').map((v) => v.trim()).filter(Boolean);
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin, Access-Control-Request-Headers',
    'X-Galvi-Day4-Contract': DAY4_PROJECTION_VERSION
  });
  if (!origin || allowed.includes(origin)) {
    if (origin) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', `Content-Type, Cache-Control, Idempotency-Key, X-Correlation-Id, ${DAY1_ACTOR_HEADER}, ${SESSION_HEADER}`);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  return headers;
}

function response(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request, env) });
}

function errorResponse(request, env, error) {
  const e = error instanceof Day4Error ? error : new Day4Error('GV_DAY4_INTERNAL', 'GalviChart processing failed safely.', 500);
  const state = e.status === 401 ? 'needs_reauth'
    : e.status === 403 ? 'forbidden'
      : e.status === 404 ? 'not_found'
        : e.status === 409 ? 'conflict'
          : e.status === 402 ? 'locked'
            : e.status >= 500 ? 'internal_error' : 'invalid_request';
  return response(request, env, {
    success: false,
    status: state,
    error: {
      code: e.code,
      message: e.message,
      ...(e.details ? { details: e.details } : {})
    },
    meta: {
      release_version: DAY4_RELEASE,
      schema_version: DAY4_SCHEMA,
      projection_contract: DAY4_PROJECTION_VERSION,
      commit_sha: text(env?.COMMIT_SHA) || null
    }
  }, e.status);
}

function requireQa(env) {
  if (low(env?.ENVIRONMENT) !== 'qa') throw new Day4Error('GV_DAY4_QA_ONLY', 'Day 4 GalviChart routes are QA-only until production cutover.', 404);
  if (!env?.DB || typeof env.DB.prepare !== 'function') throw new Day4Error('GV_DB_UNAVAILABLE', 'QA GalviVault D1 binding is unavailable.', 503);
}

async function parseJson(request) {
  if (!text(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) {
    throw new Day4Error('GV_REQ_CONTENT_TYPE', 'Content-Type must be application/json.', 415);
  }
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('object required');
    return body;
  } catch {
    throw new Day4Error('GV_REQ_BODY_INVALID', 'Request body must be a JSON object.', 400);
  }
}

async function sha256(scope, value) {
  const encoded = new TextEncoder().encode(`${scope}:${JSON.stringify(value)}`);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function parseStoredJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

async function legacyIdentity(db, sessionId) {
  const session = await first(db, 'SELECT session_id,current_stage,status FROM sessions WHERE session_id=?', sessionId);
  if (!session) return null;
  const founder = await first(db, `SELECT founder_id,first_name,last_name,email,consent_status
    FROM founders WHERE session_id=? ORDER BY updated_at DESC LIMIT 1`, sessionId);
  if (!founder?.email) return { session, founder: null };
  return { session, founder };
}

async function latestContextForFounder(db, founderId) {
  return first(db, `SELECT context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,status,record_version,created_at,updated_at
    FROM gv1_principal_contexts
    WHERE founder_id=? AND status='active'
    ORDER BY updated_at DESC,created_at DESC LIMIT 1`, founderId);
}

async function resolveContextById(db, contextId) {
  return first(db, `SELECT context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,status,record_version,created_at,updated_at
    FROM gv1_principal_contexts WHERE context_id=?`, contextId);
}

async function resolveActorScope(request, env, requestedContextId = null) {
  requireQa(env);
  const db = env.DB;
  const legacySessionId = text(request.headers.get(SESSION_HEADER));
  if (legacySessionId) {
    const legacy = await legacyIdentity(db, legacySessionId);
    if (!legacy?.founder?.email) throw new Day4Error('GV_DAY4_SESSION_IDENTITY_MISSING', 'GalviCare session identity is unavailable.', 401);
    const founder = await first(db, `SELECT founder_id,first_name,last_name,email,phone,consent_status,status,record_version
      FROM gv1_founders WHERE lower(email)=?`, low(legacy.founder.email));
    if (!founder) throw new Day4Error('GV_DAY4_CANONICAL_IDENTITY_MISSING', 'Canonical principal identity has not been established for this GalviCare session.', 409);
    const context = requestedContextId ? await resolveContextById(db, requestedContextId) : await latestContextForFounder(db, founder.founder_id);
    if (!context || context.founder_id !== founder.founder_id) {
      throw new Day4Error('GV_AUTH_FORBIDDEN', 'Requested GalviChart does not belong to this authenticated GalviCare session.', 403);
    }
    return {
      role: 'customer',
      actor_type: 'customer',
      actor_id: `session:${legacySessionId}`,
      legacy_session_id: legacySessionId,
      founder,
      context
    };
  }

  const actor = text(request.headers.get(DAY1_ACTOR_HEADER));
  if (actor === 'business_physician') {
    if (!requestedContextId || !SAFE_ID.test(requestedContextId)) {
      throw new Day4Error('GV_DAY4_CONTEXT_REQUIRED', 'Authorized clinician projection requires context_id.', 422);
    }
    const context = await resolveContextById(db, requestedContextId);
    if (!context) throw new Day4Error('GV_NOT_FOUND', 'Canonical context not found.', 404);
    const founder = await first(db, `SELECT founder_id,first_name,last_name,email,phone,consent_status,status,record_version
      FROM gv1_founders WHERE founder_id=?`, context.founder_id);
    if (!founder) throw new Day4Error('GV_NOT_FOUND', 'Canonical founder not found.', 404);
    return {
      role: 'business_physician',
      actor_type: 'business_physician',
      actor_id: 'op_mrgalvipro_qa',
      legacy_session_id: null,
      founder,
      context
    };
  }

  if (actor === 'clinician_unassigned' || actor === 'support') {
    throw new Day4Error('GV_AUTH_FORBIDDEN', 'This role is not authorized for the requested GalviChart.', 403);
  }

  throw new Day4Error('GV_AUTH_REQUIRED', 'Authenticated GalviCare customer session or authorized Business Physician is required.', 401);
}

async function requireConsent(db, scope) {
  const row = await first(db, `SELECT consent_id,status,policy_version,recorded_at
    FROM gv1_consent_events
    WHERE founder_id=? AND purpose='care_processing'
    ORDER BY recorded_at DESC,consent_id DESC LIMIT 1`, scope.founder.founder_id);
  if (row?.status !== 'granted') {
    throw new Day4Error('GV_CONSENT_REQUIRED', 'Active care-processing consent is required for GalviChart.', 403, { current_status: row?.status || null });
  }
  return row;
}

async function legacyShotEntitled(db, sessionId) {
  if (!sessionId) return false;
  const entitlement = await first(db, 'SELECT entitlement_status FROM entitlements WHERE session_id=? AND product=? LIMIT 1', sessionId, 'GalviShot');
  if (entitlement && ['active', 'paid', 'granted', 'test_override'].includes(low(entitlement.entitlement_status))) return true;
  const payment = await first(db, 'SELECT payment_status FROM payments WHERE session_id=? AND product=? LIMIT 1', sessionId, 'GalviShot');
  return Boolean(payment && ['paid', 'succeeded', 'complete'].includes(low(payment.payment_status)));
}

async function latestDay2(db, contextId, resultType) {
  return first(db, `SELECT result_id,result_type,score_type,payload_json,supporting_evidence_ids_json,contradictory_evidence_ids_json,
      rules_version,protocol_version,generation_source,record_version,created_at
    FROM gv1_day2_intake_results
    WHERE context_id=? AND result_type=?
    ORDER BY record_version DESC,created_at DESC LIMIT 1`, contextId, resultType);
}

async function allDay2Versions(db, contextId) {
  return all(db, `SELECT result_id,result_type,record_version,rules_version,protocol_version,created_at
    FROM gv1_day2_intake_results WHERE context_id=? ORDER BY created_at,result_type,record_version`, contextId);
}

async function latestArtifact(db, contextId, product) {
  return first(db, `SELECT artifact_id,generation_id,task,product,artifact_json,supporting_evidence_ids_json,contradictory_evidence_ids_json,
      record_version,generation_source,validation_status,approval_status,customer_projection,request_fingerprint,
      prompt_version,schema_version,rules_version,protocol_version,created_at
    FROM gv1_day3_governed_artifacts
    WHERE context_id=? AND product=? AND validation_status='accepted' AND approval_status IN ('not_required','approved')
    ORDER BY record_version DESC,created_at DESC LIMIT 1`, contextId, product);
}

async function allArtifactVersions(db, contextId) {
  return all(db, `SELECT artifact_id,generation_id,task,product,record_version,generation_source,validation_status,approval_status,
      customer_projection,prompt_version,schema_version,rules_version,protocol_version,created_at
    FROM gv1_day3_governed_artifacts
    WHERE context_id=? AND validation_status='accepted' AND approval_status IN ('not_required','approved')
    ORDER BY created_at,product,record_version`, contextId);
}

async function day4AuditEvents(db, contextId) {
  return all(db, `SELECT audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,
      correlation_id,environment,occurred_at,created_at
    FROM gv1_audit_log
    WHERE entity_id=? AND source=?
    ORDER BY occurred_at,audit_id`, contextId, DAY4_SOURCE);
}

function extractOverallScore(scorePayload) {
  const candidates = [scorePayload?.overall_score, scorePayload?.score, scorePayload?.galviscore_score].map(Number);
  return candidates.find((v) => Number.isFinite(v)) ?? null;
}

function extractClinicalConfidence(scorePayload, triagePayload, vitalsPayload) {
  const candidates = [
    scorePayload?.clinical_confidence,
    scorePayload?.confidence,
    triagePayload?.clinical_confidence,
    vitalsPayload?.clinical_confidence
  ].map(Number);
  return candidates.find((v) => Number.isFinite(v)) ?? null;
}

function artifactContent(row) {
  const parsed = parseStoredJson(row?.artifact_json, {});
  return parsed?.content && typeof parsed.content === 'object' ? parsed.content : parsed;
}

function artifactLineage(row) {
  if (!row) return [];
  const supporting = parseStoredJson(row.supporting_evidence_ids_json, []);
  const contradictory = parseStoredJson(row.contradictory_evidence_ids_json, []);
  return [
    ...(Array.isArray(supporting) ? supporting.map((evidence_id) => ({ evidence_id, relationship: 'supports' })) : []),
    ...(Array.isArray(contradictory) ? contradictory.map((evidence_id) => ({ evidence_id, relationship: 'contradicts' })) : [])
  ];
}

async function projectionFingerprint(scope, inputs) {
  return sha256('galvichart', {
    context_id: scope.context.context_id,
    founder_id: scope.founder.founder_id,
    bmr_id: scope.context.bmr_id,
    ...inputs
  });
}

function timelineFrom(rows) {
  return rows
    .filter((item) => item?.occurred_at || item?.created_at)
    .sort((a, b) => String(a.occurred_at || a.created_at).localeCompare(String(b.occurred_at || b.created_at)));
}

async function buildChartProjection(request, env, scope) {
  const db = env.DB;
  const consent = await requireConsent(db, scope);
  const contextId = scope.context.context_id;
  const [triageRow, vitalsRow, scoreRow, shotRow, sightRow, pathRow, day2Versions, artifactVersions, auditRows] = await Promise.all([
    latestDay2(db, contextId, 'triage'),
    latestDay2(db, contextId, 'vitals'),
    latestDay2(db, contextId, 'score'),
    latestArtifact(db, contextId, 'GalviShot'),
    latestArtifact(db, contextId, 'GalviSight'),
    latestArtifact(db, contextId, 'GalviPath'),
    allDay2Versions(db, contextId),
    allArtifactVersions(db, contextId),
    day4AuditEvents(db, contextId)
  ]);

  const shotProjectable = Boolean(shotRow?.customer_projection === 1 || Number(shotRow?.customer_projection) === 1);
  const customerEntitled = scope.role === 'customer' ? await legacyShotEntitled(db, scope.legacy_session_id) : true;
  const activated = Boolean(shotRow && shotProjectable && customerEntitled);

  if (scope.role === 'customer' && !activated) {
    return {
      locked: true,
      payload: {
        success: true,
        status: 'locked',
        data: {
          activated: false,
          chart_state: 'pre_shot',
          reason: shotRow && !customerEntitled ? 'galvishot_entitlement_required' : 'galvishot_result_required',
          next_action: shotRow ? 'complete_galvishot_entitlement' : 'complete_galvishot'
        },
        meta: {
          release_version: DAY4_RELEASE,
          schema_version: DAY4_SCHEMA,
          projection_contract: DAY4_PROJECTION_VERSION,
          commit_sha: text(env?.COMMIT_SHA) || null
        }
      }
    };
  }

  const triage = parseStoredJson(triageRow?.payload_json, {});
  const vitals = parseStoredJson(vitalsRow?.payload_json, {});
  const score = parseStoredJson(scoreRow?.payload_json, {});
  const shot = artifactContent(shotRow);
  const sight = artifactContent(sightRow);
  const path = artifactContent(pathRow);
  const overallScore = extractOverallScore(score);
  const clinicalConfidence = extractClinicalConfidence(score, triage, vitals);
  const chartState = pathRow ? 'path' : sightRow ? 'sight' : shotRow ? 'explorer' : 'pre_shot';

  const timeline = timelineFrom([
    ...day2Versions.map((row) => ({
      event_type: 'diagnostic',
      event_name: `Galvi${row.result_type === 'score' ? 'Score' : row.result_type[0].toUpperCase() + row.result_type.slice(1)}`,
      version: row.record_version,
      source_id: row.result_id,
      occurred_at: row.created_at
    })),
    ...artifactVersions.filter((row) => scope.role !== 'customer' || Number(row.customer_projection) === 1).map((row) => ({
      event_type: 'governed_intelligence',
      event_name: row.product,
      version: row.record_version,
      source_id: row.artifact_id,
      occurred_at: row.created_at
    })),
    ...auditRows.map((row) => ({
      event_type: 'chart_command',
      event_name: row.reason_code || row.operation,
      source_id: row.audit_id,
      occurred_at: row.occurred_at
    }))
  ]);

  const lineage = [
    ...artifactLineage(shotRow).map((x) => ({ ...x, product: 'GalviShot' })),
    ...artifactLineage(sightRow).map((x) => ({ ...x, product: 'GalviSight' })),
    ...artifactLineage(pathRow).map((x) => ({ ...x, product: 'GalviPath' }))
  ];

  const fingerprint = await projectionFingerprint(scope, {
    day2: day2Versions.map((r) => [r.result_id, r.record_version]),
    artifacts: artifactVersions.map((r) => [r.artifact_id, r.record_version, r.customer_projection]),
    audit: auditRows.map((r) => r.audit_id)
  });

  const overview = {
    current_score: overallScore,
    score_type: scoreRow?.score_type || null,
    health_status: score?.classification || score?.health_band || score?.disposition || null,
    clinical_confidence: clinicalConfidence,
    last_checkup: timeline.length ? timeline[timeline.length - 1].occurred_at : null,
    next_action: pathRow ? 'book_galviclinic' : sightRow ? 'obtain_galvipath' : shotRow ? 'obtain_galvisight' : 'complete_galvishot',
    top_finding: Array.isArray(shot?.findings) ? shot.findings[0] || null : null,
    active_care_priority: path?.objective || null
  };

  const health = {
    dimensions: score?.dimension_scores || score?.dimensions || vitals?.dimensions || {},
    vitals,
    findings: Array.isArray(shot?.findings) ? shot.findings : [],
    strengths: score?.strongest_dimensions || [],
    risks: score?.weakest_dimensions || [],
    clinical_confidence: clinicalConfidence,
    acuity: triage?.acuity || null
  };

  const carePlan = pathRow ? {
    status: 'recommended_path_available',
    recommendation: path,
    physician_confirmed_treatment: null,
    acknowledgement: auditRows.filter((r) => r.reason_code === 'acknowledge_treatment_plan').at(-1) || null
  } : {
    status: 'not_yet_available',
    recommendation: null,
    next_action: shotRow ? 'obtain_galvisight_or_galvipath' : 'complete_galvishot'
  };

  const evidence = {
    lineage,
    supporting_count: lineage.filter((x) => x.relationship === 'supports').length,
    contradictory_count: lineage.filter((x) => x.relationship === 'contradicts').length
  };

  const history = {
    active_projection_version: fingerprint,
    result_versions: day2Versions.map((r) => ({
      type: r.result_type,
      version: r.record_version,
      source_id: r.result_id,
      created_at: r.created_at
    })),
    intelligence_versions: artifactVersions
      .filter((r) => scope.role !== 'customer' || Number(r.customer_projection) === 1)
      .map((r) => ({
        product: r.product,
        version: r.record_version,
        source_id: r.artifact_id,
        generation_source: r.generation_source,
        created_at: r.created_at
      })),
    command_events: auditRows.map((r) => ({
      event: r.reason_code || r.operation,
      occurred_at: r.occurred_at,
      source_id: r.audit_id
    }))
  };

  const customerSections = {
    overview,
    health,
    timeline,
    care_plan: carePlan,
    evidence,
    documents: { status: 'available_when_approved', items: [] },
    galviclinic: {
      status: 'available',
      booking_url: text(env?.GALVICLINIC_BOOKING_URL) || 'https://calendly.com/galvilpro/galviclinic-day7c-qa',
      upcoming: [],
      previous: [],
      follow_up: null
    },
    history
  };

  const clinicianContext = scope.role === 'business_physician' ? {
    generation_metadata: [shotRow, sightRow, pathRow].filter(Boolean).map((row) => ({
      product: row.product,
      generation_id: row.generation_id,
      artifact_id: row.artifact_id,
      generation_source: row.generation_source,
      prompt_version: row.prompt_version,
      schema_version: row.schema_version,
      rules_version: row.rules_version,
      protocol_version: row.protocol_version,
      validation_status: row.validation_status,
      approval_status: row.approval_status,
      record_version: row.record_version
    })),
    internal_controls: {
      can_review: true,
      can_request_evidence: true,
      treatment_controls: 'day5_not_yet_active'
    }
  } : undefined;

  return {
    locked: false,
    payload: {
      success: true,
      status: 'ok',
      data: {
        activated: Boolean(shotRow),
        chart_state: chartState,
        principal_id: scope.founder.founder_id,
        bmr_id: scope.context.bmr_id,
        context_id: scope.context.context_id,
        lifecycle_state: scope.context.lifecycle_state,
        care_protocol: scope.context.care_protocol,
        record_mode: scope.context.record_mode,
        projection_version: fingerprint,
        consent: {
          status: consent.status,
          policy_version: consent.policy_version,
          recorded_at: consent.recorded_at
        },
        sections: customerSections,
        ...(clinicianContext ? { clinician_context: clinicianContext } : {})
      },
      meta: {
        release_version: DAY4_RELEASE,
        schema_version: DAY4_SCHEMA,
        projection_contract: DAY4_PROJECTION_VERSION,
        commit_sha: text(env?.COMMIT_SHA) || null,
        source_of_truth: 'GalviVault',
        side_effect_free_read: true,
        ai_called_on_read: false
      }
    }
  };
}

async function replayReceipt(db, scope, key, fingerprint) {
  const row = await first(db, `SELECT request_fingerprint,response_status,response_json
    FROM gv1_day1_request_receipts WHERE scope=? AND idempotency_key=?`, scope, key);
  if (!row) return null;
  if (row.request_fingerprint !== fingerprint) {
    throw new Day4Error('GV_IDEMPOTENCY_REUSE_MISMATCH', 'Idempotency-Key was reused with a different Day 4 command.', 409);
  }
  return parseStoredJson(row.response_json, {});
}

async function saveReceipt(db, scope, key, fingerprint, data, entityId) {
  await run(db, `INSERT INTO gv1_day1_request_receipts
    (scope,idempotency_key,request_fingerprint,response_status,response_json,entity_type,entity_id,created_at)
    VALUES(?,?,?,?,?,?,?,?)`,
    scope, key, fingerprint, 200, JSON.stringify({ data }), 'galvichart_command', entityId, now());
}

async function audit(db, scope, command, safeChange, idempotencyKey, priorVersion = null, newVersion = null) {
  const digest = await sha256('day4-audit', { context_id: scope.context.context_id, command, idempotencyKey });
  const auditId = `aud_d4_${digest.slice(0, 32)}`;
  const timestamp = now();
  await run(db, `INSERT OR IGNORE INTO gv1_audit_log
    (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,
     correlation_id,environment,occurred_at,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    auditId, 'galvichart', scope.context.context_id, 'append', priorVersion, newVersion, scope.actor_type,
    DAY4_SOURCE, command, JSON.stringify(safeChange || {}), `d4-${digest.slice(0, 24)}`, 'qa', timestamp, timestamp);
  return auditId;
}

async function appendEvidence(db, scope, command, payload, idempotencyKey) {
  if (!scope.context.bmr_id) throw new Day4Error('GV_DAY4_BMR_REQUIRED', 'This Day 4 evidence command requires an active venture Business Health Record.', 409);
  const digest = await sha256('day4-evidence', { context_id: scope.context.context_id, command, idempotencyKey });
  const evidenceId = `evd_d4_${digest.slice(0, 32)}`;
  const versionRow = await first(db, `SELECT COALESCE(MAX(evidence_version),0) AS v FROM gv1_evidence_items WHERE bmr_id=?`, scope.context.bmr_id);
  const evidenceVersion = Number(versionRow?.v || 0) + 1;
  await run(db, `INSERT OR IGNORE INTO gv1_evidence_items
    (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at)
    VALUES(?,?,NULL,?,'GalviChart',?,?,NULL,?,?)`,
    evidenceId,
    scope.context.bmr_id,
    command === 'upload_evidence' ? text(payload?.category || 'operational') : 'behavioral',
    `${command}:${idempotencyKey}`,
    JSON.stringify({
      founder_id: scope.founder.founder_id,
      context_id: scope.context.context_id,
      validation_status: 'reported',
      payload,
      provenance: { source: 'GalviChart', actor: scope.actor_type, captured_server_side: true },
      schema_version: DAY4_SCHEMA
    }),
    evidenceVersion,
    now());
  return { evidence_id: evidenceId, evidence_version: evidenceVersion };
}

async function handleCommand(request, env, body, scope) {
  if (scope.role !== 'customer') throw new Day4Error('GV_AUTH_FORBIDDEN', 'Customer command endpoint requires an authenticated customer session.', 403);
  await requireConsent(env.DB, scope);
  const entitled = await legacyShotEntitled(env.DB, scope.legacy_session_id);
  const shot = await latestArtifact(env.DB, scope.context.context_id, 'GalviShot');
  if (!entitled || !shot || Number(shot.customer_projection) !== 1) {
    throw new Day4Error('GV_CHART_NOT_ACTIVATED', 'GalviChart customer commands require verified GalviShot entitlement and accepted result.', 402);
  }

  const command = low(body.command);
  if (!CUSTOMER_COMMANDS.has(command)) throw new Day4Error('GV_DAY4_COMMAND_INVALID', 'Unsupported GalviChart command.', 422);
  const key = text(request.headers.get('Idempotency-Key'));
  if (!SAFE_ID.test(key)) throw new Day4Error('GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key is required.', 400);
  const payload = body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload) ? body.payload : {};
  const fingerprint = await sha256('day4-command', { context_id: scope.context.context_id, actor_id: scope.actor_id, command, payload });
  const receiptScope = `d4.${command}`;
  const replayed = await replayReceipt(env.DB, receiptScope, key, fingerprint);
  if (replayed) return { ...replayed.data, idempotent_replay: true };

  let result = { command, status: 'recorded' };
  if (command === 'submit_check_in' || command === 'upload_evidence') {
    const evidence = await appendEvidence(env.DB, scope, command, payload, key);
    const auditId = await audit(env.DB, scope, command, { evidence_id: evidence.evidence_id }, key);
    result = { ...result, ...evidence, audit_id: auditId };
  } else if (command === 'correct_profile') {
    const field = low(payload.field);
    const value = text(payload.value).slice(0, 300);
    if (!PERMITTED_PROFILE_FIELDS.has(field) || !value) throw new Day4Error('GV_DAY4_PROFILE_FIELD_FORBIDDEN', 'Only permitted profile fields may be corrected.', 422);
    const current = await first(env.DB, `SELECT first_name,last_name,phone,record_version FROM gv1_founders WHERE founder_id=?`, scope.founder.founder_id);
    const prior = current?.[field] ?? null;
    const priorVersion = Number(current?.record_version || 1);
    const newVersion = priorVersion + 1;
    await run(env.DB, `UPDATE gv1_founders SET ${field}=?,record_version=?,updated_at=? WHERE founder_id=?`,
      value, newVersion, now(), scope.founder.founder_id);
    const auditId = await audit(env.DB, scope, command, { field, prior_value: prior, new_value: value }, key, priorVersion, newVersion);
    result = { ...result, field, record_version: newVersion, audit_id: auditId };
  } else if (command === 'schedule_galviclinic') {
    const bookingUrl = text(env?.GALVICLINIC_BOOKING_URL) || 'https://calendly.com/galvilpro/galviclinic-day7c-qa';
    const auditId = await audit(env.DB, scope, command, { source: 'GalviChart', booking_intent: true }, key);
    result = { ...result, booking_url: bookingUrl, audit_id: auditId };
  } else if (command === 'export_record') {
    const chart = await buildChartProjection(request, env, scope);
    if (chart.locked) throw new Day4Error('GV_CHART_NOT_ACTIVATED', 'GalviChart is not activated.', 402);
    const exportData = {
      projection_version: chart.payload.data.projection_version,
      chart_state: chart.payload.data.chart_state,
      sections: chart.payload.data.sections
    };
    const auditId = await audit(env.DB, scope, command, { projection_version: exportData.projection_version }, key);
    result = { ...result, export: exportData, audit_id: auditId };
  } else {
    const auditId = await audit(env.DB, scope, command, { payload }, key);
    result = { ...result, audit_id: auditId };
  }

  await saveReceipt(env.DB, receiptScope, key, fingerprint, result, scope.context.context_id);
  return result;
}

async function readiness(request, env) {
  requireQa(env);
  const rows = await all(env.DB, `SELECT migration_id,name,environment,checksum,applied_at
    FROM gv1_schema_migrations WHERE migration_id IN ('0100','0101','0102','0103') ORDER BY migration_id`);
  const expected = ['0100', '0101', '0102', '0103'];
  const ready = expected.every((id) => rows.some((row) => row.migration_id === id && row.environment === 'qa'));
  return response(request, env, {
    success: ready,
    status: ready ? 'ok' : 'unavailable',
    data: {
      service: DAY4_RELEASE,
      ready,
      required_migrations: expected,
      observed_migrations: rows,
      source_of_truth: 'GalviVault',
      chart_shadow_database: false
    },
    meta: {
      schema_version: DAY4_SCHEMA,
      projection_contract: DAY4_PROJECTION_VERSION,
      commit_sha: text(env?.COMMIT_SHA) || null
    }
  }, ready ? 200 : 503);
}

async function augmentHealth(request, env, upstream) {
  let body = {};
  try { body = await upstream.clone().json(); } catch { return upstream; }
  body.data = body.data || {};
  body.data.release_version = DAY4_RELEASE;
  body.data.galvicare_schema_version = DAY4_SCHEMA;
  body.data.commit_sha = text(env?.COMMIT_SHA) || body.data.commit_sha || null;
  body.data.capabilities = {
    ...(body.data.capabilities || {}),
    galvichart_1_0: true,
    galvivault_longitudinal_projection: true,
    shot_verified_activation: true,
    customer_clinician_projection_policy: true,
    secure_return_same_record: true,
    chart_read_side_effect_free: true,
    day3_closed_loop_inherited: true
  };
  body.meta = {
    ...(body.meta || {}),
    release_version: DAY4_RELEASE,
    schema_version: DAY4_SCHEMA,
    projection_contract: DAY4_PROJECTION_VERSION,
    commit_sha: text(env?.COMMIT_SHA) || null
  };
  return response(request, env, body, upstream.status);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (request.method === 'OPTIONS' && path.startsWith('/api/v1/day4')) {
        return new Response(null, { status: 204, headers: corsHeaders(request, env) });
      }

      if (request.method === 'GET' && path === '/health') {
        return augmentHealth(request, env, await day3Unified.fetch(request, env, ctx));
      }

      if (request.method === 'GET' && path === '/api/v1/day4/readiness') {
        return readiness(request, env);
      }

      if (request.method === 'POST' && path === '/api/v1/day4/chart') {
        const body = await parseJson(request);
        const contextId = text(body.context_id) || null;
        if (contextId && !SAFE_ID.test(contextId)) throw new Day4Error('GV_REQ_SCHEMA', 'context_id is invalid.', 422);
        const scope = await resolveActorScope(request, env, contextId);
        const projection = await buildChartProjection(request, env, scope);
        return response(request, env, projection.payload, 200);
      }

      if (request.method === 'POST' && path === '/api/v1/day4/chart/command') {
        const body = await parseJson(request);
        const contextId = text(body.context_id) || null;
        if (contextId && !SAFE_ID.test(contextId)) throw new Day4Error('GV_REQ_SCHEMA', 'context_id is invalid.', 422);
        const scope = await resolveActorScope(request, env, contextId);
        const data = await handleCommand(request, env, body, scope);
        return response(request, env, {
          success: true,
          status: 'ok',
          data,
          meta: {
            release_version: DAY4_RELEASE,
            schema_version: DAY4_SCHEMA,
            projection_contract: DAY4_PROJECTION_VERSION,
            commit_sha: text(env?.COMMIT_SHA) || null
          }
        }, 200);
      }

      return day3Unified.fetch(request, env, ctx);
    } catch (error) {
      console.error('GalviCare Day 4', error?.code || 'GV_DAY4_INTERNAL', error?.message || error);
      return errorResponse(request, env, error);
    }
  }
};
