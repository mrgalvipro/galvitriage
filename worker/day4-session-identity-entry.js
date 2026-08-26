import day4 from './day4-customer-projection-v2.js';

/*
 * GalviCare 1.0 Day 4 session-identity compatibility + secure-return boundary — QA only.
 *
 * Proven identity defect:
 * - GalviCare 0.5 deduplicates founders by email.
 * - A later assessment creates a new session-specific venture that points to the
 *   existing founder_id, while the legacy founders.session_id can remain attached
 *   to an earlier session.
 * - Day 3/Day 4 customer authorization historically queried founders.session_id
 *   directly, so an otherwise valid returning/retest session failed with
 *   GV_DAY3_SESSION_IDENTITY_MISSING / GV_DAY4_SESSION_IDENTITY_MISSING.
 *
 * Proven H13 return defect:
 * - the browser session credential is stored only in that browser's localStorage;
 * - therefore a genuinely separate/incognito device has no authenticated identity
 *   to resolve and can only show a fresh Triage screen;
 * - asking the customer to re-submit Triage would create the wrong clinical journey
 *   and would not prove secure return to the same longitudinal Business Health Record.
 *
 * Critical-path remediation:
 * - do not mutate/rebind founders.session_id;
 * - do not mint a second founder/BHR or re-submit Triage;
 * - do not trust browser-supplied email, founder, context or BHR identifiers;
 * - keep the existing current-session venture -> founder compatibility resolution;
 * - add an opaque, server-verified secure-return grant over the existing
 *   gv1_principal_sessions identity/session substrate;
 * - a secure-return token restores the existing authoritative GalviCare session,
 *   after which the normal consent, Shot entitlement, ownership and Chart projection
 *   checks run again against the same canonical context/BHR.
 *
 * The secure-return token is authentication material only. It never contains clinical
 * truth, never unlocks Chart client-side, never bypasses entitlement/consent, and never
 * causes AI generation or a Triage/Score/Shot/Sight/Path rewrite.
 */
export const DAY4_SESSION_IDENTITY_COMPAT = 'day4_session_identity_v1';
export const DAY4_SECURE_RETURN = 'day4_secure_return_v1';

const CUSTOMER_HEADER = 'X-Galvi-Day3-Session';
const RETURN_SOURCE = 'galvicare_day4_secure_return';
const RETURN_TOKEN_RE = /^gvr1_[a-f0-9]{64}$/;
const RETURN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const LEGACY_FOUNDER_BY_SESSION = /\bfrom\s+founders\s+where\s+session_id\s*=\s*\?/i;
const SESSION_VENTURE_FOUNDER = `SELECT f.founder_id,f.first_name,f.last_name,f.email,f.consent_status
  FROM ventures v
  JOIN founders f ON f.founder_id=v.founder_id
  WHERE v.session_id=?
  ORDER BY v.updated_at DESC,v.created_at DESC
  LIMIT 1`;

const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();
const now = () => new Date().toISOString();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const run = (db, sql, ...params) => db.prepare(sql).bind(...params).run();

function bindMethod(target, property) {
  const value = Reflect.get(target, property, target);
  return typeof value === 'function' ? value.bind(target) : value;
}

function compatibleBoundStatement(db, bound, params) {
  return new Proxy(bound, {
    get(target, property) {
      if (property === 'first') {
        return async (...args) => {
          const direct = await target.first(...args);
          if (direct?.email) return direct;
          const sessionId = String(params?.[0] ?? '').trim();
          if (!sessionId) return direct ?? null;
          const linked = await db.prepare(SESSION_VENTURE_FOUNDER).bind(sessionId).first();
          return linked || direct || null;
        };
      }
      return bindMethod(target, property);
    }
  });
}

function compatibleIdentityStatement(db, statement) {
  return new Proxy(statement, {
    get(target, property) {
      if (property === 'bind') {
        return (...params) => compatibleBoundStatement(db, target.bind(...params), params);
      }
      return bindMethod(target, property);
    }
  });
}

export function createIdentityCompatibleDb(db) {
  if (!db || typeof db.prepare !== 'function') return db;
  return new Proxy(db, {
    get(target, property) {
      if (property === 'prepare') {
        return (sql) => {
          const statement = target.prepare(sql);
          if (!LEGACY_FOUNDER_BY_SESSION.test(String(sql || ''))) return statement;
          return compatibleIdentityStatement(target, statement);
        };
      }
      return bindMethod(target, property);
    }
  });
}

function createIdentityCompatibleEnv(env) {
  if (!env?.DB) return env;
  const compatibleDb = createIdentityCompatibleDb(env.DB);
  return new Proxy(env, {
    get(target, property) {
      if (property === 'DB') return compatibleDb;
      return Reflect.get(target, property, target);
    }
  });
}

function returnHeaders(request, env) {
  const origin = text(request.headers.get('Origin'));
  const allowed = text(env?.ALLOWED_ORIGINS).split(',').map((value) => value.trim()).filter(Boolean);
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Vary': 'Origin, Access-Control-Request-Headers',
    'X-Galvi-Day4-Secure-Return': DAY4_SECURE_RETURN
  });
  if (!origin || allowed.includes(origin)) {
    if (origin) headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', `Content-Type, Cache-Control, X-Correlation-Id, ${CUSTOMER_HEADER}`);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  return headers;
}

function returnJson(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: returnHeaders(request, env) });
}

async function requestJson(request) {
  if (!text(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) return {};
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `gvr1_${[...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(`galvicare-day4-secure-return:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function expiryFrom(value) {
  const started = Date.parse(text(value));
  return Number.isFinite(started) ? new Date(started + RETURN_TTL_MS).toISOString() : null;
}

function expired(value) {
  const started = Date.parse(text(value));
  return !Number.isFinite(started) || Date.now() - started > RETURN_TTL_MS;
}

async function chartForSession(request, compatibleEnv, ctx, sessionId, contextId = '') {
  const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    [CUSTOMER_HEADER]: sessionId,
    'X-Correlation-Id': `day4-secure-return-${crypto.randomUUID()}`
  });
  const origin = text(request.headers.get('Origin'));
  if (origin) headers.set('Origin', origin);
  const chartRequest = new Request(`${new URL(request.url).origin}/api/v1/day4/chart`, {
    method: 'POST',
    headers,
    body: JSON.stringify(contextId ? { context_id: contextId } : {})
  });
  const response = await day4.fetch(chartRequest, compatibleEnv, ctx);
  let payload = {};
  try { payload = await response.json(); } catch {}
  return { response, payload };
}

async function auditReturn(db, grant, operation, reasonCode) {
  if (!grant?.context_id) return;
  const timestamp = now();
  const auditId = `aud_d4sr_${crypto.randomUUID().replaceAll('-', '')}`;
  await run(db, `INSERT INTO gv1_audit_log
    (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,
     correlation_id,environment,occurred_at,created_at)
    VALUES(?,?,?,?,NULL,NULL,'customer',?,?,?,'{}',?,'qa',?,?)`,
    auditId,
    'secure_return',
    grant.context_id,
    operation,
    RETURN_SOURCE,
    reasonCode,
    `d4sr-${crypto.randomUUID()}`,
    timestamp,
    timestamp);
}

async function issueSecureReturn(request, env, compatibleEnv, ctx) {
  if (low(env?.ENVIRONMENT) !== 'qa' || !env?.DB) {
    return returnJson(request, env, { success: false, status: 'not_found', error: { code: 'GV_DAY4_QA_ONLY', message: 'Secure return is QA-only until production cutover.' } }, 404);
  }
  const sessionId = text(request.headers.get(CUSTOMER_HEADER));
  if (!sessionId) {
    return returnJson(request, env, { success: false, status: 'unauthenticated', error: { code: 'GV_AUTH_REQUIRED', message: 'An authenticated GalviCare session is required to create a secure return.' } }, 401);
  }

  const { response, payload } = await chartForSession(request, compatibleEnv, ctx, sessionId);
  if (!response.ok || payload?.success !== true || payload?.status !== 'ok' || payload?.data?.activated !== true) {
    return returnJson(request, env, {
      success: false,
      status: response.status === 401 ? 'unauthenticated' : 'locked',
      error: { code: 'GV_SECURE_RETURN_NOT_ELIGIBLE', message: 'Secure return becomes available only for an authenticated, activated GalviChart.' }
    }, response.status === 401 ? 401 : 403);
  }

  const data = payload.data;
  const token = randomToken();
  const tokenHash = await sha256(token);
  const timestamp = now();
  const grantId = `gvr_${crypto.randomUUID().replaceAll('-', '')}`;
  await run(env.DB, `INSERT INTO gv1_principal_sessions
    (session_id,context_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at)
    VALUES(?,?,?,?,?,'GalviChart','active',?,NULL,?,?)`,
    grantId, data.context_id, data.principal_id, tokenHash, RETURN_SOURCE, timestamp, timestamp, timestamp);
  const grant = { context_id: data.context_id, founder_id: data.principal_id };
  await auditReturn(env.DB, grant, 'issue', 'secure_return_issued');

  return returnJson(request, env, {
    success: true,
    status: 'ok',
    data: {
      return_token: token,
      expires_at: new Date(Date.now() + RETURN_TTL_MS).toISOString(),
      principal_id: data.principal_id,
      context_id: data.context_id,
      bmr_id: data.bmr_id,
      chart_state: data.chart_state,
      projection_version: data.projection_version,
      requires_triage_resubmission: false
    },
    meta: {
      secure_return_contract: DAY4_SECURE_RETURN,
      token_contains_clinical_data: false,
      browser_record_id_authority: false,
      chart_authorization_rechecked_on_return: true
    }
  });
}

async function secureReturnGrant(db, tokenHash) {
  return first(db, `SELECT ps.session_id AS return_grant_id,ps.context_id,ps.founder_id,ps.started_at,ps.updated_at,
      c.bmr_id,c.venture_id,c.status AS context_status,f.email,v.venture_name
    FROM gv1_principal_sessions ps
    JOIN gv1_principal_contexts c ON c.context_id=ps.context_id AND c.founder_id=ps.founder_id
    JOIN gv1_founders f ON f.founder_id=ps.founder_id
    LEFT JOIN gv1_ventures v ON v.venture_id=c.venture_id
    WHERE ps.client_session_key=? AND ps.source=? AND ps.status='active'
    LIMIT 1`, tokenHash, RETURN_SOURCE);
}

async function legacySessionForGrant(db, grant) {
  const ventureName = text(grant?.venture_name);
  return first(db, `SELECT v.session_id
    FROM ventures v
    JOIN founders f ON f.founder_id=v.founder_id
    JOIN sessions s ON s.session_id=v.session_id
    WHERE lower(f.email)=?
      AND (?='' OR lower(trim(v.venture_name))=lower(trim(?)))
      AND (
        EXISTS (SELECT 1 FROM entitlements e WHERE e.session_id=v.session_id AND e.product='GalviShot'
          AND lower(e.entitlement_status) IN ('active','paid','granted','test_override'))
        OR EXISTS (SELECT 1 FROM payments p WHERE p.session_id=v.session_id AND p.product='GalviShot'
          AND lower(p.payment_status) IN ('paid','succeeded','complete'))
      )
    ORDER BY CASE WHEN lower(COALESCE(s.status,''))='active' THEN 0 ELSE 1 END,
      v.updated_at DESC,v.created_at DESC
    LIMIT 1`, low(grant.email), ventureName, ventureName);
}

async function exchangeSecureReturn(request, env, compatibleEnv, ctx) {
  if (low(env?.ENVIRONMENT) !== 'qa' || !env?.DB) {
    return returnJson(request, env, { success: false, status: 'not_found', error: { code: 'GV_DAY4_QA_ONLY', message: 'Secure return is QA-only until production cutover.' } }, 404);
  }
  const body = await requestJson(request);
  const token = low(body?.return_token);
  if (!RETURN_TOKEN_RE.test(token)) {
    return returnJson(request, env, { success: false, status: 'unauthenticated', error: { code: 'GV_SECURE_RETURN_INVALID', message: 'This secure GalviChart return is invalid or expired.' } }, 401);
  }
  const tokenHash = await sha256(token);
  const grant = await secureReturnGrant(env.DB, tokenHash);
  if (!grant || grant.context_status !== 'active' || expired(grant.started_at)) {
    if (grant?.return_grant_id && expired(grant.started_at)) {
      await run(env.DB, `UPDATE gv1_principal_sessions SET status='abandoned',completed_at=?,updated_at=? WHERE session_id=? AND status='active'`, now(), now(), grant.return_grant_id);
    }
    return returnJson(request, env, { success: false, status: 'unauthenticated', error: { code: 'GV_SECURE_RETURN_INVALID', message: 'This secure GalviChart return is invalid or expired.' } }, 401);
  }

  const legacy = await legacySessionForGrant(env.DB, grant);
  if (!legacy?.session_id) {
    return returnJson(request, env, { success: false, status: 'needs_reauth', error: { code: 'GV_SECURE_RETURN_SESSION_UNAVAILABLE', message: 'GalviCare could not restore an eligible existing customer session for this record.' } }, 401);
  }

  // Re-run the normal Day 4 authorization, consent, Shot entitlement and projection path
  // against the grant's server-owned context before returning the existing session.
  const { response, payload } = await chartForSession(request, compatibleEnv, ctx, legacy.session_id, grant.context_id);
  const sameRecord = response.ok
    && payload?.success === true
    && payload?.status === 'ok'
    && payload?.data?.activated === true
    && payload?.data?.principal_id === grant.founder_id
    && payload?.data?.context_id === grant.context_id
    && payload?.data?.bmr_id === grant.bmr_id;
  if (!sameRecord) {
    return returnJson(request, env, { success: false, status: 'forbidden', error: { code: 'GV_SECURE_RETURN_SCOPE_MISMATCH', message: 'Secure return could not verify the same authorized Business Health Record.' } }, 403);
  }

  await run(env.DB, `UPDATE gv1_principal_sessions SET current_stage='GalviChart Return',updated_at=? WHERE session_id=? AND status='active'`, now(), grant.return_grant_id);
  await auditReturn(env.DB, grant, 'exchange', 'secure_return_exchanged');

  return returnJson(request, env, {
    success: true,
    status: 'ok',
    data: {
      legacy_session_id: legacy.session_id,
      principal_id: grant.founder_id,
      context_id: grant.context_id,
      bmr_id: grant.bmr_id,
      chart_state: payload.data.chart_state,
      projection_version: payload.data.projection_version,
      expires_at: expiryFrom(grant.started_at),
      same_record_verified: true,
      requires_triage_resubmission: false
    },
    meta: {
      secure_return_contract: DAY4_SECURE_RETURN,
      identity_source: 'server_verified_secure_return_grant',
      restored_existing_session: true,
      new_principal_created: false,
      new_bmr_created: false,
      chart_authorization_rechecked: true
    }
  });
}

async function augmentHealth(response) {
  if (!response?.ok) return response;
  let payload;
  try { payload = await response.clone().json(); } catch { return response; }
  payload.data = payload.data || {};
  payload.data.capabilities = {
    ...(payload.data.capabilities || {}),
    returning_session_identity_resolution: true,
    session_identity_source: 'server_session_venture_founder_link',
    founder_session_rebinding: false,
    secure_cross_device_return: true,
    secure_return_contract: DAY4_SECURE_RETURN,
    secure_return_uses_existing_principal_session_substrate: true,
    secure_return_requires_triage_resubmission: false
  };
  payload.meta = {
    ...(payload.meta || {}),
    session_identity_compat: DAY4_SESSION_IDENTITY_COMPAT,
    secure_return_contract: DAY4_SECURE_RETURN
  };
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Galvi-Day4-Session-Identity', DAY4_SESSION_IDENTITY_COMPAT);
  headers.set('X-Galvi-Day4-Secure-Return', DAY4_SECURE_RETURN);
  return new Response(JSON.stringify(payload), { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const compatibleEnv = createIdentityCompatibleEnv(env);
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';

    if (path === '/api/v1/day4/secure-return/issue') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: returnHeaders(request, env) });
      if (request.method !== 'POST') return returnJson(request, env, { success: false, status: 'invalid_request', error: { code: 'GV_METHOD_NOT_ALLOWED', message: 'POST required.' } }, 405);
      return issueSecureReturn(request, env, compatibleEnv, ctx);
    }

    if (path === '/api/v1/day4/secure-return/exchange') {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: returnHeaders(request, env) });
      if (request.method !== 'POST') return returnJson(request, env, { success: false, status: 'invalid_request', error: { code: 'GV_METHOD_NOT_ALLOWED', message: 'POST required.' } }, 405);
      return exchangeSecureReturn(request, env, compatibleEnv, ctx);
    }

    const response = await day4.fetch(request, compatibleEnv, ctx);
    return request.method === 'GET' && path === '/health'
      ? augmentHealth(response)
      : response;
  }
};