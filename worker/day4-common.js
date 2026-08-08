export const API_VERSION = 'v1';
export const REQUIRED_SCHEMA = '0004';
export const SAFE_ID = /^[A-Za-z0-9:._-]{3,180}$/;
export const MAX_BODY_BYTES = 65536;

export class GVError extends Error {
  constructor(code, message, status = 400, details = undefined, retryable = false) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.retryable = retryable;
  }
}

export const clean = (value) => String(value ?? '').trim();
export const now = () => new Date().toISOString();
export const newId = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export async function hash(scope, value) {
  const bytes = new TextEncoder().encode(`${scope}:${JSON.stringify(canonicalize(value))}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function context(request, env) {
  const environment = clean(env?.ENVIRONMENT || 'unknown').toLowerCase();
  const allowedOrigins = clean(env?.ALLOWED_ORIGINS).split(',').map((v) => v.trim()).filter(Boolean);
  const origin = clean(request.headers.get('Origin'));
  const supplied = clean(request.headers.get('X-Correlation-Id'));
  const correlation = SAFE_ID.test(supplied) ? supplied : newId('corr');
  return { environment, allowedOrigins, origin, correlation };
}

export function headers(ctx) {
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
    result.set('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key, X-Correlation-Id, X-Galvi-Role, X-Galvi-Actor-Id');
    result.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
  const safe = error instanceof GVError ? error : new GVError('GV_INTERNAL', 'An unexpected error occurred.', 500, undefined, true);
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
  if (!['qa','local','production'].includes(ctx.environment)) throw new GVError('GV_ENV_MISCONFIGURED', 'Day 4 runtime environment is not permitted.', 503);
  if (!env?.DB || typeof env.DB.prepare !== 'function') throw new GVError('GV_DB_UNAVAILABLE', 'The GalviVault DB binding is unavailable.', 503, undefined, true);
}

export async function jsonBody(request) {
  if (!clean(request.headers.get('Content-Type')).toLowerCase().startsWith('application/json')) {
    throw new GVError('GV_REQ_CONTENT_TYPE', 'Content-Type must be application/json.', 415);
  }
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > MAX_BODY_BYTES) throw new GVError('GV_REQ_PAYLOAD_TOO_LARGE', 'The request body is too large.', 413);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new GVError('GV_REQ_PAYLOAD_TOO_LARGE', 'The request body is too large.', 413);
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('object required');
    return parsed;
  } catch {
    throw new GVError('GV_REQ_BODY_INVALID', 'The request body must be a JSON object.', 400);
  }
}

export function idempotencyKey(request) {
  const key = clean(request.headers.get('Idempotency-Key'));
  if (!SAFE_ID.test(key)) throw new GVError('GV_IDEMPOTENCY_REQUIRED', 'A valid Idempotency-Key is required.', 400);
  return key;
}

export function actor(request) {
  return { role: clean(request.headers.get('X-Galvi-Role')).toLowerCase() || 'public', id: clean(request.headers.get('X-Galvi-Actor-Id')) || 'public-session' };
}

export function requireOperator(request) {
  const resolved = actor(request);
  if (!['operator','admin'].includes(resolved.role)) throw new GVError('GV_AUTH_FORBIDDEN', 'Authorized operator scope is required.', 403);
  return resolved;
}

export function requireId(name, value) {
  const normalized = clean(value);
  if (!SAFE_ID.test(normalized)) throw new GVError('GV_REQ_SCHEMA', `${name} is invalid.`, 422);
  return normalized;
}

export function requireText(name, value, max = 2000) {
  const normalized = clean(value);
  if (!normalized || normalized.length > max) throw new GVError('GV_REQ_SCHEMA', `${name} is required and must be bounded.`, 422);
  return normalized;
}

export function optionalText(name, value, max = 1000) {
  if (value === undefined || value === null || value === '') return null;
  const normalized = clean(value);
  if (normalized.length > max) throw new GVError('GV_REQ_SCHEMA', `${name} is oversized.`, 422);
  return normalized;
}

export function confidence(value, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new GVError('GV_REQ_SCHEMA', 'confidence is required.', 422);
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) throw new GVError('GV_REQ_SCHEMA', 'confidence must be between 0 and 100.', 422);
  return value;
}

export function enumValue(name, value, allowed, fallback = null) {
  const normalized = clean(value || fallback).toLowerCase();
  if (!allowed.includes(normalized)) throw new GVError('GV_REQ_SCHEMA', `${name} is invalid.`, 422);
  return normalized;
}
