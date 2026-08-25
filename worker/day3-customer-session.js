import day3 from './day3-galvicare-1-0.js';
import day2 from './day2-galvicare-1-0.js';
import { clinicalFile } from './day7d-engine.js';

/*
 * GalviCare 1.0 Day 3 customer-session bridge — QA only.
 *
 * Converts the existing authoritative GalviCare session into the Day 1/Day 2
 * canonical principal/BHR context server-side. The browser never receives or
 * impersonates a privileged actor. Subsequent Day 3 requests are authorized by
 * the legacy GalviCare session -> founder email -> canonical context mapping,
 * then delegated internally to the governed Day 3 worker as Business Physician.
 */
const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();
const safe = (value) => text(value).replace(/[^A-Za-z0-9._:-]/g, '_').slice(0, 120);
const id = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const now = () => new Date().toISOString();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const run = (db, sql, ...params) => db.prepare(sql).bind(...params).run();
const CUSTOMER_HEADER = 'X-Galvi-Day3-Session';
const DAY3_PATHS = new Set(['/api/v1/day3/shot', '/api/v1/day3/sight', '/api/v1/day3/path', '/api/v1/day3/ai-reason']);

function cors(origin = '*') {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': `Content-Type, Idempotency-Key, X-Correlation-Id, X-Galvi-Day1-Actor, ${CUSTOMER_HEADER}`,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'X-Galvi-Day3-Customer-Session': 'active'
  };
}

function json(body, status = 200, request = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors(request?.headers?.get('Origin') || '*')
  });
}

function qa(env) {
  return low(env?.ENVIRONMENT) === 'qa' && Boolean(env?.DB);
}

async function legacyIdentity(db, sessionId) {
  const session = await first(db, 'SELECT session_id,current_stage,status FROM sessions WHERE session_id=?', sessionId);
  if (!session) return null;
  const founder = await first(db, `SELECT founder_id,first_name,last_name,email,consent_status
    FROM founders WHERE session_id=? ORDER BY updated_at DESC LIMIT 1`, sessionId);
  if (!founder?.email) return { session, founder: null, venture: null };
  const venture = await first(db, `SELECT venture_id,venture_name,stage,industry,revenue_range
    FROM ventures WHERE session_id=? ORDER BY updated_at DESC LIMIT 1`, sessionId);
  return { session, founder, venture: venture || null };
}

async function canonicalFounder(db, legacyFounder) {
  const email = low(legacyFounder.email);
  let founder = await first(db, `SELECT founder_id,first_name,last_name,email,status,record_version
    FROM gv1_founders WHERE lower(email)=?`, email);
  const timestamp = now();
  if (founder) {
    await run(db, `UPDATE gv1_founders
      SET first_name=COALESCE(NULLIF(?,''),first_name),last_name=COALESCE(NULLIF(?,''),last_name),updated_at=?
      WHERE founder_id=?`, text(legacyFounder.first_name), text(legacyFounder.last_name), timestamp, founder.founder_id);
    return founder;
  }
  founder = {
    founder_id: id('fdr'),
    first_name: text(legacyFounder.first_name) || null,
    last_name: text(legacyFounder.last_name) || null,
    email,
    status: 'active',
    record_version: 1
  };
  await run(db, `INSERT INTO gv1_founders
    (founder_id,first_name,last_name,email,consent_status,status,record_version,created_at,updated_at)
    VALUES(?,?,?,?,?,'active',1,?,?)`, founder.founder_id, founder.first_name, founder.last_name, founder.email,
    ['accepted','granted'].includes(low(legacyFounder.consent_status)) ? 'accepted' : 'pending', timestamp, timestamp);
  return founder;
}

async function canonicalVenture(db, founderId, legacyVenture) {
  const ventureName = text(legacyVenture?.venture_name);
  if (!ventureName) return null;
  let venture = await first(db, `SELECT v.venture_id,v.venture_name,v.stage
    FROM gv1_founder_venture_roles r JOIN gv1_ventures v ON v.venture_id=r.venture_id
    WHERE r.founder_id=? AND r.status='active' AND lower(trim(v.venture_name))=lower(trim(?)) LIMIT 1`, founderId, ventureName);
  const timestamp = now();
  if (!venture) {
    venture = { venture_id: id('ven'), venture_name: ventureName, stage: text(legacyVenture?.stage) || 'founder' };
    await run(db, `INSERT INTO gv1_ventures
      (venture_id,venture_name,stage,status,record_version,created_at,updated_at)
      VALUES(?,?,?,'active',1,?,?)`, venture.venture_id, venture.venture_name, venture.stage, timestamp, timestamp);
    await run(db, `INSERT OR IGNORE INTO gv1_founder_venture_roles
      (founder_id,venture_id,role_code,is_primary,status,created_at,updated_at)
      VALUES(?,?,'founder',1,'active',?,?)`, founderId, venture.venture_id, timestamp, timestamp);
  }
  let bmr = await first(db, 'SELECT bmr_id,venture_id,status,record_version FROM gv1_business_medical_records WHERE venture_id=?', venture.venture_id);
  if (!bmr) {
    bmr = { bmr_id: id('bmr'), venture_id: venture.venture_id, status: 'open', record_version: 1 };
    await run(db, `INSERT INTO gv1_business_medical_records
      (bmr_id,venture_id,status,record_version,current_session_id,opened_at,created_at,updated_at)
      VALUES(?,?,'open',1,NULL,?,?,?)`, bmr.bmr_id, venture.venture_id, timestamp, timestamp, timestamp);
  }
  return { venture, bmr };
}

async function canonicalContext(db, sessionId, founder, ventureState) {
  if (!ventureState?.bmr?.bmr_id) throw new Error('Operating-founder Day 3 reasoning requires a real venture/BHR.');
  let context = await first(db, `SELECT * FROM gv1_principal_contexts
    WHERE founder_id=? AND bmr_id=? AND record_mode='principal_plus_venture' AND status='active'
    ORDER BY updated_at DESC,created_at DESC LIMIT 1`, founder.founder_id, ventureState.bmr.bmr_id);
  if (context) return context;
  const timestamp = now();
  context = {
    context_id: id('ctx'),
    founder_id: founder.founder_id,
    lifecycle_state: 'founder',
    care_protocol: 'founder_smb',
    payer_type: 'self',
    record_mode: 'principal_plus_venture',
    venture_id: ventureState.venture.venture_id,
    bmr_id: ventureState.bmr.bmr_id,
    client_request_id: `day3customer.${safe(sessionId)}`
  };
  await run(db, `INSERT INTO gv1_principal_contexts
    (context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,source,status,record_version,client_request_id,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,'galvicare_day3_customer','active',1,?,?,?)`, context.context_id, context.founder_id,
    context.lifecycle_state, context.care_protocol, context.payer_type, context.record_mode, context.venture_id, context.bmr_id,
    context.client_request_id, timestamp, timestamp);
  return context;
}

async function ensureConsent(db, sessionId, founderId, bmrId, legacyConsent) {
  if (!['accepted','granted'].includes(low(legacyConsent))) {
    const error = new Error('Care-processing consent is required before governed intelligence can use the Business Health Record.');
    error.status = 403;
    error.code = 'GV_CONSENT_REQUIRED';
    throw error;
  }
  const current = await first(db, `SELECT consent_id,status FROM gv1_consent_events
    WHERE founder_id=? AND purpose='care_processing' ORDER BY recorded_at DESC,consent_id DESC LIMIT 1`, founderId);
  if (current?.status === 'granted') return current;
  const timestamp = now();
  const consentId = id('cns');
  await run(db, `INSERT INTO gv1_consent_events
    (consent_id,founder_id,bmr_id,purpose,policy_version,status,actor_type,actor_id,effective_at,recorded_at,
     supersedes_consent_id,client_request_id,source,metadata_json)
    VALUES(?,?,?,'care_processing','day3_customer_qa_v2','granted','service','galvicare_day3_customer_bridge',?,?,?,?,?,'galvicare_day3_customer','{}')`,
    consentId, founderId, bmrId, timestamp, timestamp, current?.consent_id || null, `d3consent.${safe(sessionId)}`);
  return { consent_id: consentId, status: 'granted' };
}

function acuityFromClassification(value) {
  const classification = low(value);
  if (classification.includes('critical')) return { severity: 3, urgency: 3, continuity: 3, reversibility: 2, complexity: 2 };
  if (classification.includes('strained') || classification.includes('at risk')) return { severity: 2, urgency: 2, continuity: 2, reversibility: 2, complexity: 2 };
  if (classification.includes('stable')) return { severity: 1, urgency: 1, continuity: 1, reversibility: 1, complexity: 1 };
  // Unknown acuity is not inferred from Business Health score; stay conservative and preserve the distinction.
  return { severity: 0, urgency: 0, continuity: 0, reversibility: 0, complexity: 0 };
}

function confidenceComponents(value) {
  const c = Math.max(0, Math.min(100, Number(value) || 0));
  return { required_data_completeness: c, evidence_quality: c, answer_consistency: c, corroboration: c, context_completeness: c };
}

async function internalDay2(env, path, { method = 'GET', key, body } = {}) {
  const headers = new Headers({
    'X-Galvi-Day1-Actor': 'business_physician',
    'X-Correlation-Id': `d3cust-${crypto.randomUUID()}`
  });
  if (key) headers.set('Idempotency-Key', key);
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  const request = new Request(`https://galvicare.internal${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const response = await day2.fetch(request, env);
  let payload = {};
  try { payload = await response.json(); } catch {}
  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || `Canonical Day 2 request failed (${response.status}).`);
    error.status = response.status;
    error.code = payload?.error?.code || 'GV_DAY3_CUSTOMER_DAY2_FAILED';
    throw error;
  }
  return payload;
}

async function ensureDay2Baseline(env, sessionId, context, input) {
  const legacyFile = await clinicalFile(env.DB, sessionId);
  const score = Number(legacyFile?.score?.score);
  const visible = Number(input?.visible_score);
  if (!Number.isFinite(score) || !legacyFile?.score?.dimension_scores || !Object.keys(legacyFile.score.dimension_scores).length) {
    const error = new Error('The authoritative GalviCare clinical file does not contain a complete deterministic GalviScore baseline.');
    error.status = 409;
    error.code = 'GV_DAY3_CUSTOMER_SCORE_MISSING';
    throw error;
  }
  if (Number.isFinite(visible) && Math.abs(score - visible) > 1) {
    const error = new Error(`Visible GalviScore ${visible} does not match authoritative server score ${score}.`);
    error.status = 409;
    error.code = 'GV_DAY3_CUSTOMER_SCORE_MISMATCH';
    throw error;
  }

  const rawDims = legacyFile.score.dimension_scores || {};
  const dimensions = {
    revenue: Number(rawDims.revenue || 0),
    customer: Number(rawDims.customer || 0),
    product: Number(rawDims.product || 0),
    leadership: Number(rawDims.leadership || 0),
    technology: Number(rawDims.technology ?? rawDims.technology_operations ?? 0),
    distribution: Number(rawDims.distribution || 0),
    problem: Number(rawDims.problem || 0),
    business_model: Number(rawDims.business_model || 0)
  };
  const cumulativeConfidence = Number(legacyFile?.reconciliation?.confidence || input?.visible_confidence || 0);
  const confidence = confidenceComponents(cumulativeConfidence);
  const state = await internalDay2(env, `/api/v1/day2/intake-state/${encodeURIComponent(context.context_id)}`);
  const contextEvidence = legacyFile?.context || {};

  if (!state?.data?.triage) {
    await internalDay2(env, '/api/v1/day2/triage', {
      method: 'POST',
      key: `d3triage.${safe(sessionId)}`,
      body: {
        context_id: context.context_id,
        acuity: acuityFromClassification(input?.classification),
        confidence,
        red_flags: [],
        followup_round: 0,
        answers: {
          source: 'galvicare_day3_customer_session_v2',
          legacy_session_id: sessionId,
          founder_reported_context: contextEvidence,
          cumulative_followup_count: Array.isArray(legacyFile?.followup_rows) ? legacyFile.followup_rows.length : 0
        }
      }
    });
  }

  if (!state?.data?.vitals) {
    await internalDay2(env, '/api/v1/day2/vitals', {
      method: 'POST',
      key: `d3vitals.${safe(sessionId)}`,
      body: { context_id: context.context_id, dimensions, confidence }
    });
  }

  let refreshed = await internalDay2(env, `/api/v1/day2/intake-state/${encodeURIComponent(context.context_id)}`);
  if (!refreshed?.data?.score) {
    await internalDay2(env, '/api/v1/day2/score', {
      method: 'POST',
      key: `d3score.${safe(sessionId)}`,
      body: { context_id: context.context_id }
    });
    refreshed = await internalDay2(env, `/api/v1/day2/intake-state/${encodeURIComponent(context.context_id)}`);
  }
  const canonicalScore = Number(refreshed?.data?.score?.overall_score);
  if (!Number.isFinite(canonicalScore) || Math.abs(canonicalScore - score) > 1) {
    const error = new Error(`Canonical Day 2 score ${canonicalScore} does not match authoritative GalviCare score ${score}.`);
    error.status = 409;
    error.code = 'GV_DAY3_CUSTOMER_SCORE_MISMATCH';
    throw error;
  }
  return {
    score: canonicalScore,
    clinical_confidence: Number(refreshed?.data?.score?.clinical_confidence ?? cumulativeConfidence),
    followup_count: Array.isArray(legacyFile?.followup_rows) ? legacyFile.followup_rows.length : 0
  };
}

async function bootstrap(request, env) {
  if (!qa(env)) return json({ success: false, status: 'not_found', error: { code: 'GV_DAY3_QA_ONLY', message: 'Day 3 customer bootstrap is QA-only.' } }, 404, request);
  let input = {};
  try { input = await request.json(); } catch { return json({ success: false, status: 'invalid_request', error: { code: 'GV_REQ_BODY_INVALID', message: 'JSON body required.' } }, 400, request); }
  const sessionId = text(request.headers.get(CUSTOMER_HEADER) || input?.legacy_session_id);
  if (!sessionId) return json({ success: false, status: 'unauthenticated', error: { code: 'GV_DAY3_SESSION_REQUIRED', message: 'GalviCare session is required.' } }, 401, request);

  try {
    const legacy = await legacyIdentity(env.DB, sessionId);
    if (!legacy?.session || !legacy?.founder?.email) {
      return json({ success: false, status: 'not_found', error: { code: 'GV_DAY3_SESSION_IDENTITY_MISSING', message: 'The GalviCare session is not bound to a founder identity.' } }, 404, request);
    }
    const founder = await canonicalFounder(env.DB, legacy.founder);
    const ventureState = await canonicalVenture(env.DB, founder.founder_id, legacy.venture);
    if (!ventureState) {
      return json({ success: false, status: 'needs_evidence', error: { code: 'GV_DAY3_VENTURE_REQUIRED', message: 'A real venture is required for the Business Health governed-AI pathway.' } }, 409, request);
    }
    const context = await canonicalContext(env.DB, sessionId, founder, ventureState);
    await ensureConsent(env.DB, sessionId, founder.founder_id, context.bmr_id, legacy.founder.consent_status);
    const baseline = await ensureDay2Baseline(env, sessionId, context, input);
    return json({
      success: true,
      status: 'ok',
      data: {
        legacy_session_id: sessionId,
        context_id: context.context_id,
        principal_id: founder.founder_id,
        founder_id: founder.founder_id,
        bmr_id: context.bmr_id,
        venture_id: context.venture_id,
        record_mode: context.record_mode,
        canonical_score: baseline.score,
        clinical_confidence: baseline.clinical_confidence,
        cumulative_followup_count: baseline.followup_count,
        identity_source: 'authoritative_galvicare_session'
      },
      meta: { customer_session_bridge: true, deterministic_fallback: true }
    }, 200, request);
  } catch (error) {
    return json({
      success: false,
      status: error?.status === 403 ? 'forbidden' : error?.status === 409 ? 'conflict' : 'error',
      error: { code: error?.code || 'GV_DAY3_CUSTOMER_BOOTSTRAP_FAILED', message: text(error?.message) || 'Customer bootstrap failed safely.' }
    }, Number(error?.status || 500), request);
  }
}

async function authorizeCustomerRequest(request, env) {
  const sessionId = text(request.headers.get(CUSTOMER_HEADER));
  if (!sessionId || !qa(env)) return null;
  let input = {};
  try { input = await request.clone().json(); } catch { return { error: json({ success: false, status: 'invalid_request', error: { code: 'GV_REQ_BODY_INVALID', message: 'JSON body required.' } }, 400, request) }; }
  const contextId = text(input?.context_id);
  const legacy = await legacyIdentity(env.DB, sessionId);
  if (!legacy?.founder?.email) return { error: json({ success: false, status: 'unauthenticated', error: { code: 'GV_DAY3_SESSION_IDENTITY_MISSING', message: 'GalviCare session identity is unavailable.' } }, 401, request) };
  const context = await first(env.DB, `SELECT c.context_id,f.email FROM gv1_principal_contexts c
    JOIN gv1_founders f ON f.founder_id=c.founder_id WHERE c.context_id=?`, contextId);
  if (!context || low(context.email) !== low(legacy.founder.email)) {
    return { error: json({ success: false, status: 'forbidden', error: { code: 'GV_AUTH_FORBIDDEN', message: 'The requested canonical record does not belong to this GalviCare session.' } }, 403, request) };
  }
  const headers = new Headers(request.headers);
  headers.set('X-Galvi-Day1-Actor', 'business_physician');
  headers.delete(CUSTOMER_HEADER);
  const forwarded = new Request(request.url, { method: request.method, headers, body: JSON.stringify(input) });
  return { request: forwarded };
}

async function augmentHealth(response, request) {
  let body = {};
  try { body = await response.clone().json(); } catch { return response; }
  body.data = body.data || {};
  body.data.capabilities = { ...(body.data.capabilities || {}), customer_session_bridge: true, canonical_session_identity: true };
  body.meta = { ...(body.meta || {}), customer_session_bridge: true };
  const headers = new Headers(response.headers);
  headers.set('X-Galvi-Day3-Customer-Session', 'active');
  return new Response(JSON.stringify(body), { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request.headers.get('Origin') || '*') });
    if (request.method === 'GET' && path === '/health') return augmentHealth(await day3.fetch(request, env, ctx), request);
    if (request.method === 'POST' && path === '/api/v1/day3/customer-bootstrap') return bootstrap(request, env);
    if (request.method === 'POST' && DAY3_PATHS.has(path) && request.headers.get(CUSTOMER_HEADER)) {
      const authorized = await authorizeCustomerRequest(request, env);
      if (authorized?.error) return authorized.error;
      if (authorized?.request) return day3.fetch(authorized.request, env, ctx);
    }
    return day3.fetch(request, env, ctx);
  }
};
