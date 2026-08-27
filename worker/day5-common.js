import * as day4 from './day4-common.js';

export const {
  GVError, clean, now, newId, canonicalize, hash, context,
  jsonBody, idempotencyKey, actor, requireOperator, requireId, requireText,
  optionalText, confidence, enumValue
} = day4;

export const API_VERSION = 'v1';
export const REQUIRED_SCHEMA = '0005';
export const CUSTOMER_SESSION_HEADER = 'X-Galvi-Day3-Session';

export function headers(ctx) {
  const result = day4.headers(ctx);
  if (ctx.origin && ctx.allowedOrigins.includes(ctx.origin)) {
    const allowed = String(result.get('Access-Control-Allow-Headers') || '')
      .split(',').map((value) => value.trim()).filter(Boolean);
    if (!allowed.some((value) => value.toLowerCase() === CUSTOMER_SESSION_HEADER.toLowerCase())) allowed.push(CUSTOMER_SESSION_HEADER);
    result.set('Access-Control-Allow-Headers', allowed.join(', '));
  }
  return result;
}

export function success(ctx, data, status = 200, state = 'ok', meta = {}) {
  return new Response(JSON.stringify({
    success: true,
    status: state,
    environment: ctx.environment,
    correlation_id: ctx.correlation,
    data,
    meta: { api_version: API_VERSION, schema_version: REQUIRED_SCHEMA, ...meta }
  }), { status, headers: headers(ctx) });
}

export function failure(ctx, error) {
  const safe = error instanceof day4.GVError
    ? error
    : new day4.GVError('GV_INTERNAL', 'An unexpected error occurred.', 500, undefined, true);
  const state = safe.status === 401 ? 'unauthorized'
    : safe.status === 403 ? 'forbidden'
      : safe.status === 404 ? 'not_found'
        : safe.status === 409 ? 'conflict'
          : safe.status === 503 ? 'unavailable'
            : safe.status >= 500 ? 'internal_error' : 'invalid_request';
  return new Response(JSON.stringify({
    success: false,
    status: state,
    environment: ctx.environment,
    correlation_id: ctx.correlation,
    error: { code: safe.code, message: safe.message, retryable: Boolean(safe.retryable), ...(safe.details ? { details: safe.details } : {}) },
    meta: { api_version: API_VERSION, schema_version: REQUIRED_SCHEMA }
  }), { status: safe.status, headers: headers(ctx) });
}

export function requireRuntime(env, ctx) {
  if (!['qa','local','production'].includes(ctx.environment)) throw new day4.GVError('GV_ENV_MISCONFIGURED', 'Day 5 runtime environment is not permitted.', 503);
  if (!env?.DB || typeof env.DB.prepare !== 'function') throw new day4.GVError('GV_DB_UNAVAILABLE', 'The GalviVault DB binding is unavailable.', 503, undefined, true);
}
