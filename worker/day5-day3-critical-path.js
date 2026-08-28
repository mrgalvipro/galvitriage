import unifiedDay3 from './day3-unified-customer-api.js';
import { clinicalFile } from './day7d-engine.js';

/*
 * GalviCare 1.0 Day 5 critical-path adapter for the inherited Day 3 runtime.
 *
 * Proven defects addressed here, without changing canonical scoring or removing
 * clarification questions:
 *   1) customer governed-AI requests accumulated many cumulative follow-up
 *      evidence versions and could exceed OPENAI_MAX_INPUT_BYTES;
 *   2) the customer GalviScore surface did not receive Classification, Lowest
 *      Category, or canonical Acuity metadata after clarification.
 *
 * This adapter is intentionally narrow. It delegates authorization, canonical
 * persistence, provider governance, validation, fallback, and all Day 1-4 routes
 * to the inherited unified worker. It only selects a bounded authorized evidence
 * projection for provider input and exposes one read-only customer score-metadata
 * projection. It never changes the deterministic GalviScore in the browser.
 */

export const SIGNATURE = 'GalviCare Day 5 Day 3 critical-path evidence window + score metadata v1';
export const SCORE_METADATA_PATH = '/api/v1/day3/customer-score-metadata';
export const MAX_GOVERNED_EVIDENCE_ITEMS = 3;
const SESSION_HEADER = 'X-Galvi-Day3-Session';
const REASONING_STAGE = Object.freeze({
  '/api/v1/day3/shot': 'GalviShot',
  '/api/v1/day3/sight': 'GalviSight',
  '/api/v1/day3/path': 'GalviPath'
});

const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();

export function classificationForScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return '';
  if (score < 40) return 'Critical';
  if (score < 60) return 'Strained';
  if (score < 80) return 'Stable but Watch';
  if (score < 90) return 'Healthy';
  return 'Healthy/Scaling';
}

export function lowestCategory(scores = {}) {
  const ranked = Object.entries(scores || {})
    .map(([key, value]) => [text(key), Number(value)])
    .filter(([key, value]) => key && Number.isFinite(value))
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  return ranked[0]?.[0] || '';
}

function parseEvidence(row) {
  try { return JSON.parse(row?.content_json || '{}'); } catch { return {}; }
}

function hasCurrentStageAnswer(row, stage) {
  if (text(row?.evidence_type) !== 'customer_followup') return false;
  const content = parseEvidence(row);
  const followups = Array.isArray(content?.payload?.followups)
    ? content.payload.followups
    : Array.isArray(content?.followups) ? content.followups : [];
  return followups.some((item) => {
    const answer = text(item?.answer);
    return text(item?.product) === stage && answer && !low(answer).startsWith('skipped for now');
  });
}

export function selectGovernedEvidenceIds(rows = [], stage, limit = MAX_GOVERNED_EVIDENCE_ITEMS) {
  const max = Math.max(1, Math.min(MAX_GOVERNED_EVIDENCE_ITEMS, Number(limit) || MAX_GOVERNED_EVIDENCE_ITEMS));
  const ordered = Array.isArray(rows) ? rows.filter((row) => text(row?.evidence_id)) : [];
  const selected = [];
  const add = (row) => {
    const evidenceId = text(row?.evidence_id);
    if (evidenceId && !selected.includes(evidenceId) && selected.length < max) selected.push(evidenceId);
  };

  // The newest current-stage customer answer is mandatory when present. The
  // customer-followup evidence is cumulative, so the newest version preserves
  // prior answers while keeping provider input bounded.
  add(ordered.find((row) => hasCurrentStageAnswer(row, stage)));

  // Prefer independent canonical evidence next so the provider reasons over
  // more than repeated cumulative follow-up versions.
  for (const row of ordered) {
    if (text(row?.evidence_type) !== 'customer_followup') add(row);
    if (selected.length >= max) break;
  }
  for (const row of ordered) {
    add(row);
    if (selected.length >= max) break;
  }
  return selected;
}

function cors(request, extra = {}) {
  const origin = text(request.headers.get('Origin')) || '*';
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': `Content-Type, Cache-Control, Idempotency-Key, X-Correlation-Id, X-Galvi-Day1-Actor, ${SESSION_HEADER}`,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin, Access-Control-Request-Headers',
    'X-Galvi-Day5-Day3-Critical-Path': 'active',
    ...extra
  };
}

function json(request, body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: cors(request, extraHeaders) });
}

async function requestJson(request) {
  try {
    const value = await request.clone().json();
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

async function customerBootstrap(request, env) {
  const sessionId = text(request.headers.get(SESSION_HEADER));
  if (!sessionId || !env?.DB) return null;

  let file;
  try { file = await clinicalFile(env.DB, sessionId); } catch { file = null; }
  if (!file?.session_id) return null;

  const score = Number(file?.score?.score);
  const classification = classificationForScore(score);
  const confidenceCandidates = [
    file?.prior_results?.GalviScore?.galviscore_confidence,
    file?.prior_results?.GalviScore?.clinical_confidence,
    file?.prior_results?.GalviScore?.confidence,
    file?.reconciliation?.confidence
  ];
  const visibleConfidence = confidenceCandidates.map(Number)
    .find((value) => Number.isFinite(value) && value >= 0 && value <= 100);

  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');
  const bootstrapRequest = new Request('https://galvicare.internal/api/v1/day3/customer-bootstrap', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      legacy_session_id: sessionId,
      ...(Number.isFinite(score) ? { visible_score: score } : {}),
      ...(Number.isFinite(visibleConfidence) ? { visible_confidence: visibleConfidence } : {}),
      classification
    })
  });
  const response = await unifiedDay3.fetch(bootstrapRequest, env);
  let body = {};
  try { body = await response.clone().json(); } catch {}
  return { response, body, file, classification, sessionId };
}

async function canonicalScopeForActor(request, env, input) {
  if (!env?.DB) return null;
  const contextId = text(input?.context_id);
  if (!contextId) return null;

  const customer = text(request.headers.get(SESSION_HEADER));
  if (customer) {
    const boot = await customerBootstrap(request, env);
    if (!boot?.response?.ok || text(boot?.body?.data?.context_id) !== contextId) return null;
    return {
      context_id: contextId,
      bmr_id: text(boot.body?.data?.bmr_id),
      bootstrap: boot
    };
  }

  const actor = text(request.headers.get('X-Galvi-Day1-Actor'));
  if (actor === 'business_physician') {
    const row = await first(env.DB, 'SELECT context_id,bmr_id FROM gv1_principal_contexts WHERE context_id=? AND status=\'active\'', contextId);
    return row?.bmr_id ? row : null;
  }
  if (actor.startsWith('principal:')) {
    const suffix = actor.slice('principal:'.length).toLowerCase();
    if (!/^[a-z0-9._-]{1,72}$/.test(suffix)) return null;
    const email = `day1.${suffix}@example.invalid`;
    const row = await first(env.DB, `SELECT c.context_id,c.bmr_id
      FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id
      WHERE c.context_id=? AND c.status='active' AND lower(f.email)=?`, contextId, email);
    return row?.bmr_id ? row : null;
  }
  return null;
}

async function boundedReasoningRequest(request, env, path) {
  const stage = REASONING_STAGE[path];
  if (!stage || request.method !== 'POST' || !env?.DB) return { request, evidenceIds: [] };
  const input = await requestJson(request);
  if (Array.isArray(input?.evidence_ids) && input.evidence_ids.map(text).filter(Boolean).length) {
    return { request, evidenceIds: input.evidence_ids.map(text).filter(Boolean), explicit: true };
  }

  const scope = await canonicalScopeForActor(request, env, input);
  if (!scope?.bmr_id) return { request, evidenceIds: [] };
  const result = await env.DB.prepare(`SELECT evidence_id,evidence_type,content_json,created_at
    FROM gv1_evidence_items WHERE bmr_id=?
    ORDER BY created_at DESC,evidence_id DESC LIMIT 32`).bind(scope.bmr_id).all();
  const evidenceIds = selectGovernedEvidenceIds(result?.results || [], stage);
  if (!evidenceIds.length) return { request, evidenceIds: [] };

  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');
  const forwarded = new Request(request.url, {
    method: request.method,
    headers,
    body: JSON.stringify({ ...input, evidence_ids: evidenceIds })
  });
  return { request: forwarded, evidenceIds };
}

async function scoreMetadata(request, env) {
  const boot = await customerBootstrap(request, env);
  if (!boot) {
    return json(request, { success: false, status: 'unauthenticated', error: { code: 'GV_DAY3_SESSION_REQUIRED', message: 'GalviCare session is required.' } }, 401);
  }
  if (!boot.response.ok || boot.body?.success === false) return boot.response;
  const contextId = text(boot.body?.data?.context_id);
  const row = await first(env.DB, `SELECT result_id,payload_json,record_version,created_at
    FROM gv1_day2_intake_results WHERE context_id=? AND result_type='score'
    ORDER BY record_version DESC,created_at DESC LIMIT 1`, contextId);
  if (!row) {
    return json(request, { success: false, status: 'not_found', error: { code: 'GV_DAY5_SCORE_METADATA_NOT_READY', message: 'Canonical GalviScore metadata is not ready.' } }, 404);
  }
  let payload = {};
  try { payload = JSON.parse(row.payload_json || '{}'); } catch {}
  const canonicalScore = Number(payload?.overall_score ?? boot.file?.score?.score);
  const dimensions = payload?.dimension_scores || boot.file?.score?.dimension_scores || {};
  const classification = classificationForScore(canonicalScore);
  const lowest = lowestCategory(dimensions);
  return json(request, {
    success: true,
    status: 'ok',
    environment: text(env?.ENVIRONMENT) || 'qa',
    data: {
      overall_score: Number.isFinite(canonicalScore) ? canonicalScore : null,
      classification,
      lowest_category: lowest,
      acuity_score: payload?.acuity_score ?? null,
      acuity_band: text(payload?.acuity_band) || null,
      clinical_confidence: payload?.clinical_confidence ?? boot.body?.data?.clinical_confidence ?? null,
      score_result_id: row.result_id,
      score_record_version: Number(row.record_version || 0),
      canonical_source: 'gv1_day2_intake_results'
    },
    meta: {
      read_only_projection: true,
      browser_score_recomputed: false,
      browser_acuity_recomputed: false,
      classification_applied_to_customer_bootstrap: true,
      evidence_window_max_items: MAX_GOVERNED_EVIDENCE_ITEMS
    }
  }, 200);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === SCORE_METADATA_PATH) {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
      if (request.method === 'POST') return scoreMetadata(request, env);
      return json(request, { success: false, status: 'not_found', error: { code: 'GV_NOT_FOUND', message: 'Route not found.' } }, 404);
    }

    if (request.method === 'POST' && REASONING_STAGE[path]) {
      const bounded = await boundedReasoningRequest(request, env, path);
      const response = await unifiedDay3.fetch(bounded.request, env, ctx);
      if (!bounded.evidenceIds?.length) return response;
      const headers = new Headers(response.headers);
      headers.set('X-Galvi-Day5-Governed-Evidence-Window', String(bounded.evidenceIds.length));
      headers.set('X-Galvi-Day5-Day3-Critical-Path', 'active');
      return new Response(response.body, { status: response.status, headers });
    }

    return unifiedDay3.fetch(request, env, ctx);
  }
};
