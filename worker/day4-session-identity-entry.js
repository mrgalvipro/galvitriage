import day4 from './day4-customer-projection-v2.js';

/*
 * GalviCare 1.0 Day 4 session-identity compatibility boundary — QA only.
 *
 * Proven defect:
 * - GalviCare 0.5 deduplicates founders by email.
 * - A later assessment creates a new session-specific venture that points to the
 *   existing founder_id, while the legacy founders.session_id can remain attached
 *   to an earlier session.
 * - Day 3/Day 4 customer authorization historically queried founders.session_id
 *   directly, so an otherwise valid returning/retest session failed with
 *   GV_DAY3_SESSION_IDENTITY_MISSING / GV_DAY4_SESSION_IDENTITY_MISSING.
 *
 * Critical-path remediation:
 * - do not mutate/rebind founders.session_id;
 * - do not mint a second founder/BHR;
 * - do not trust browser-supplied email or record IDs;
 * - when the direct legacy lookup has no founder, resolve the founder through the
 *   server-owned current-session ventures.session_id -> ventures.founder_id link.
 *
 * The adapter changes only the semantics of the one legacy identity SELECT used by
 * the inherited Day 3/Day 4 code. Every other DB statement reaches the original D1
 * binding unchanged. This keeps the closed loop, accepted AI lineage, entitlement,
 * Chart projection, and canonical GalviVault history on their existing code paths.
 */
export const DAY4_SESSION_IDENTITY_COMPAT = 'day4_session_identity_v1';

const LEGACY_FOUNDER_BY_SESSION = /\bfrom\s+founders\s+where\s+session_id\s*=\s*\?/i;
const SESSION_VENTURE_FOUNDER = `SELECT f.founder_id,f.first_name,f.last_name,f.email,f.consent_status
  FROM ventures v
  JOIN founders f ON f.founder_id=v.founder_id
  WHERE v.session_id=?
  ORDER BY v.updated_at DESC,v.created_at DESC
  LIMIT 1`;

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

async function augmentHealth(response) {
  if (!response?.ok) return response;
  let payload;
  try { payload = await response.clone().json(); } catch { return response; }
  payload.data = payload.data || {};
  payload.data.capabilities = {
    ...(payload.data.capabilities || {}),
    returning_session_identity_resolution: true,
    session_identity_source: 'server_session_venture_founder_link',
    founder_session_rebinding: false
  };
  payload.meta = {
    ...(payload.meta || {}),
    session_identity_compat: DAY4_SESSION_IDENTITY_COMPAT
  };
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Galvi-Day4-Session-Identity', DAY4_SESSION_IDENTITY_COMPAT);
  return new Response(JSON.stringify(payload), { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const compatibleEnv = createIdentityCompatibleEnv(env);
    const response = await day4.fetch(request, compatibleEnv, ctx);
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
    return request.method === 'GET' && path === '/health'
      ? augmentHealth(response)
      : response;
  }
};
