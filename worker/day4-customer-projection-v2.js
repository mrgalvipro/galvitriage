import day4 from './day4-galvicare-1-0.js';

/*
 * GalviCare 1.0 Day 4 customer projection v2 — QA only.
 *
 * Additive read-only compatibility adapter. It enriches the already-authorized
 * GalviChart payload with customer-safe content from accepted, customer-projectable
 * GalviEngine artifacts already persisted in GalviVault. It never calls OpenAI,
 * never writes D1, never changes entitlement/identity decisions, and never exposes
 * rejected/raw/internal artifacts.
 */
export const DAY4_CUSTOMER_PROJECTION_VERSION = 'galvichart_customer_projection_v2';
const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();

function parseStoredJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function artifactContent(row) {
  const parsed = parseStoredJson(row?.artifact_json, {});
  return parsed?.content && typeof parsed.content === 'object' ? parsed.content : parsed;
}

async function latestCustomerArtifact(db, contextId, product) {
  return db.prepare(`SELECT product,artifact_json,record_version,created_at
    FROM gv1_day3_governed_artifacts
    WHERE context_id=? AND product=? AND customer_projection=1
      AND validation_status='accepted' AND approval_status IN ('not_required','approved')
    ORDER BY record_version DESC,created_at DESC LIMIT 1`)
    .bind(contextId, product)
    .first();
}

function cleanStrings(values, max = 8) {
  return (Array.isArray(values) ? values : [])
    .map((value) => typeof value === 'string' ? text(value) : text(value?.statement || value?.action || value?.label))
    .filter(Boolean)
    .slice(0, max);
}

function customerShot(content = {}) {
  const findings = (Array.isArray(content.findings) ? content.findings : []).slice(0, 4).map((finding) => ({
    statement: text(finding?.statement || finding?.title || finding?.finding_code),
    reasoning_summary: text(finding?.reasoning_summary || finding?.finding_text),
    next_step: text(finding?.next_step || finding?.action || finding?.prescription),
    why_it_matters: text(finding?.why_it_matters || finding?.implication),
    confidence: Number.isFinite(Number(finding?.confidence)) ? Number(finding.confidence) : null,
    hypothesis_only: finding?.hypothesis_only === true || low(finding?.assumption_marker).includes('hypothesis')
  })).filter((finding) => finding.statement || finding.reasoning_summary || finding.next_step);
  return findings.length ? { findings } : null;
}

function customerSight(content = {}) {
  const summary = text(content.summary || content.interpretation || content.clinical_summary);
  const risks = cleanStrings(content.risks || content.strategic_risks, 5);
  const opportunities = cleanStrings(content.opportunities || content.recommended_actions, 5);
  const urgency = typeof content.urgency === 'object'
    ? { label: text(content.urgency?.label), horizon: text(content.urgency?.horizon) }
    : { label: text(content.urgency), horizon: '' };
  if (!summary && !risks.length && !opportunities.length && !urgency.label) return null;
  return { summary, risks, opportunities, urgency };
}

function customerPath(content = {}) {
  const objective = text(content.objective || content.primary_pathway || content.clinical_rationale);
  const sequence = cleanStrings(content.sequence, 8);
  const evidence = cleanStrings(content.evidence_to_collect, 8);
  const cadence = text(content.cadence || content.operating_cadence);
  const owner = text(content.owner || content.check_in_owner);
  const escalation = text(content.escalation || content.escalation_rule || content.support_recommendation);
  const supportLevel = text(content.support_level || content.recommended_support_level);
  if (!objective && !sequence.length && !evidence.length && !cadence && !owner && !escalation && !supportLevel) return null;
  return { objective, sequence, evidence_to_collect: evidence, cadence, owner, escalation, support_level: supportLevel };
}

async function enrichChart(payload, env) {
  const data = payload?.data;
  const contextId = text(data?.context_id);
  if (!env?.DB || typeof env.DB.prepare !== 'function' || !contextId || payload?.status !== 'ok') return payload;
  const [shotRow, sightRow, pathRow] = await Promise.all([
    latestCustomerArtifact(env.DB, contextId, 'GalviShot'),
    latestCustomerArtifact(env.DB, contextId, 'GalviSight'),
    latestCustomerArtifact(env.DB, contextId, 'GalviPath')
  ]);
  const shot = customerShot(artifactContent(shotRow));
  const sight = customerSight(artifactContent(sightRow));
  const path = customerPath(artifactContent(pathRow));
  const intelligence = {
    source: 'accepted_galviengine_artifacts',
    progressively_complete: true,
    shot,
    sight,
    path
  };
  data.sections = { ...(data.sections || {}), customer_intelligence: intelligence };
  payload.meta = {
    ...(payload.meta || {}),
    customer_projection_version: DAY4_CUSTOMER_PROJECTION_VERSION,
    accepted_artifact_projection: true,
    ai_called_on_read: false
  };
  return payload;
}

async function augmentJsonResponse(response, mutate) {
  let payload;
  try { payload = await response.clone().json(); } catch { return response; }
  const next = await mutate(payload);
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Galvi-Day4-Customer-Projection', DAY4_CUSTOMER_PROJECTION_VERSION);
  return new Response(JSON.stringify(next), { status: response.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const upstream = await day4.fetch(request, env, ctx);

    if (request.method === 'GET' && path === '/health' && upstream.ok) {
      return augmentJsonResponse(upstream, async (payload) => {
        payload.data = payload.data || {};
        payload.data.capabilities = {
          ...(payload.data.capabilities || {}),
          galvichart_progressive_customer_intelligence: true,
          accepted_artifact_projection: true,
          customer_projection_read_only: true
        };
        payload.meta = { ...(payload.meta || {}), customer_projection_version: DAY4_CUSTOMER_PROJECTION_VERSION };
        return payload;
      });
    }

    if (request.method === 'POST' && path === '/api/v1/day4/chart' && upstream.ok) {
      return augmentJsonResponse(upstream, (payload) => enrichChart(payload, env));
    }

    return upstream;
  }
};