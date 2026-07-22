

const TABLES = {
  FOUNDERS: 'Founders',
  VENTURES: 'Ventures',
  TRIAGE: 'Triage Responses',
  DIAGNOSTIC: 'Diagnostic Results',
  JOURNEY: 'Journey Events'
};



const DAY2_QUESTION_CONTRACT_VERSION = 'galvitriage_questions_v0_5_1';
const DAY2_RULES_VERSION = 'galviengine_score_v0_5_1';
const DAY2_GENERATION_SOURCE = 'rules';

const GALVISHOT_RULES_VERSION = 'galvishot_rules_v0_5_1';
const GALVISHOT_CONTENT_VERSION = 'galvishot_content_v0_5_1';
const GALVISIGHT_RULES_VERSION = 'galvisight_rules_v0_5_1';
const GALVISIGHT_CONTENT_VERSION = 'galvisight_content_v0_5_1';
const GALVIPATH_RULES_VERSION = 'galvipath_rules_v0_5_1';
const GALVIPATH_CONTENT_VERSION = 'galvipath_content_v0_5_1';

const GALVICARE_BUILD = Object.freeze({
  environment: 'qa',
  branch: 'qa-revamped-galvicare-0-5',
  stabilization_version: 'day3_stabilization_v1',
  score_rules_version: DAY2_RULES_VERSION,
  galvishot_rules_version: GALVISHOT_RULES_VERSION,
  galvishot_content_version: GALVISHOT_CONTENT_VERSION,
  galvisight_rules_version: GALVISIGHT_RULES_VERSION,
  galvisight_content_version: GALVISIGHT_CONTENT_VERSION,
  galvipath_rules_version: GALVIPATH_RULES_VERSION,
  galvipath_content_version: GALVIPATH_CONTENT_VERSION,
  legacy_make_api_enabled: false
});

const DAY1_ACTIONS = new Set([
  'health_check',
  'create_or_resume_session',
  'journey_event',
  'get_fixture_result'
]);

const DAY2_ACTIONS = new Set([
  'submit_triage',
  'get_triage',
  'triage_completeness',
  'get_or_create_vitals',
  'get_or_create_score'
]);

const TRIAGE_QUESTIONS = Object.freeze([
  { order: 1, key: 'q01_business_clarity', dimension: 'business_model', text: 'How clearly can you explain what your organization does in one sentence?' },
  { order: 2, key: 'q02_stage_signal', dimension: 'business_model', text: 'How clearly does your current stage reflect where your organization actually is today?' },
  { order: 3, key: 'q03_real_problem', dimension: 'problem', text: 'How confident are you that your business solves a real customer problem?' },
  { order: 4, key: 'q04_ideal_customer', dimension: 'customer', text: 'How clearly do you understand who your ideal customer is?' },
  { order: 5, key: 'q05_attract_customers', dimension: 'distribution', text: 'How consistently are you attracting new customers, users, donors, or supporters?' },
  { order: 6, key: 'q06_customer_conversations', dimension: 'distribution', text: 'How often do you speak directly with customers, users, donors, or stakeholders?' },
  { order: 7, key: 'q07_predictable_revenue', dimension: 'revenue', text: 'How predictable is your revenue or funding today?' },
  { order: 8, key: 'q08_revenue_growth_confidence', dimension: 'revenue', text: 'How confident are you in growing revenue or funding over the next 12 months?' },
  { order: 9, key: 'q09_revenue_driver_clarity', dimension: 'revenue', text: 'How well do you understand what is driving or limiting your revenue today?' },
  { order: 10, key: 'q10_customer_satisfaction', dimension: 'customer', text: 'How satisfied are customers with your product, service, program, or offering?' },
  { order: 11, key: 'q11_feedback_improvement', dimension: 'product', text: 'How consistently do you improve your offering based on feedback?' },
  { order: 12, key: 'q12_organized_operations', dimension: 'technology_operations', text: 'How organized are your day-to-day operations?' },
  { order: 13, key: 'q13_founder_dependency', dimension: 'business_model', text: 'How dependent is the organization on you personally?' },
  { order: 14, key: 'q14_systems_support_growth', dimension: 'technology_operations', text: 'How well are your systems supporting growth?' },
  { order: 15, key: 'q15_technology_effectiveness', dimension: 'technology_operations', text: 'How effectively are you using technology today?' },
  { order: 16, key: 'q16_ai_readiness', dimension: 'technology_operations', text: 'How ready is your organization to use AI responsibly and practically?' },
  { order: 17, key: 'q17_leadership_confidence', dimension: 'leadership', text: 'How confident are you in your leadership?' },
  { order: 18, key: 'q18_vision_clarity', dimension: 'leadership', text: 'How clear is your vision?' },
  { order: 19, key: 'q19_decision_information', dimension: 'leadership', text: 'How confident are you that decisions are based on the right information?' },
  { order: 20, key: 'q20_execution_action', dimension: 'leadership', text: 'How consistently do decisions turn into action?' }
]);

const DIMENSION_WEIGHTS = Object.freeze({
  problem: 0.12,
  customer: 0.15,
  product: 0.15,
  revenue: 0.16,
  business_model: 0.12,
  distribution: 0.10,
  leadership: 0.10,
  technology_operations: 0.10
});

function nowIso() { return new Date().toISOString(); }
function id(prefix) { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`; }
function requireDb(env) { if (!env.DB) throw new Error('D1 binding DB is not configured'); return env.DB; }
function normalizeAnswer(value) { const n = Number(value); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; }
function getPayloadSessionId(payload) { return normalizeSessionId(safe(payload, 'session.session_id') || safe(payload, 'session_id')); }
function confidenceBand(confidence) { if (confidence >= 90) return 'high'; if (confidence >= 70) return 'medium'; return 'low'; }
function scoreBand(score) { if (score < 40) return 'Critical'; if (score < 60) return 'At Risk'; if (score < 80) return 'Stable'; return 'Healthy'; }
function scoreClassification(score) { if (score < 40) return 'Critical'; if (score < 60) return 'Strained'; if (score < 80) return 'Stable but Watch'; if (score < 90) return 'Healthy'; return 'Healthy/Scaling'; }
function scaleToHundred(answer) { return Math.round(((answer - 1) / 4) * 100); }
function dimensionLabel(key) { return ({problem:'Problem', customer:'Customer', product:'Product', revenue:'Revenue', business_model:'Business Model', distribution:'Distribution', leadership:'Leadership', technology_operations:'Technology / Operations'})[key] || key; }
function insightForDimension(key) { return ({problem:'Clarify the customer problem and the evidence that proves it matters now.',customer:'Deepen customer understanding through direct conversations and sharper segmentation.',product:'Use feedback to tighten the offer around clearer customer outcomes.',revenue:'Focus on the most repeatable path to revenue or funding before adding complexity.',business_model:'Clarify the model, stage, promise, and next measurable milestone.',distribution:'Strengthen the channel or motion that consistently creates qualified demand.',leadership:'Improve leadership cadence, decision quality, and follow-through.',technology_operations:'Reduce operating friction with simpler systems, process discipline, and practical technology use.'})[key] || 'Focus on the weakest dimension first.'; }
function answersFromPayload(payload) { return payload.scored_answers || payload.answers || {}; }
function calculateCompleteness(payload) {
  const answers = answersFromPayload(payload);
  const missing_questions = [];
  const invalid_questions = [];
  for (const q of TRIAGE_QUESTIONS) {
    const answer = normalizeAnswer(answers[q.key]);
    if (answers[q.key] === undefined || answers[q.key] === null || answers[q.key] === '') missing_questions.push(q.key);
    else if (answer === null) invalid_questions.push(q.key);
  }
  const requiredFields = {
    session_id: getPayloadSessionId(payload),
    email: safe(payload, 'founder.email'),
    venture_name: safe(payload, 'venture.venture_name'),
    consent: safe(payload, 'founder.consent', false) === true
  };
  const missing_fields = Object.entries(requiredFields).filter(([, v]) => !required(v) && v !== true).map(([k]) => k);
  const answered = TRIAGE_QUESTIONS.length - missing_questions.length - invalid_questions.length;
  return { complete: missing_fields.length === 0 && missing_questions.length === 0 && invalid_questions.length === 0, answered_questions: answered, total_questions: TRIAGE_QUESTIONS.length, completion_percent: Math.round((answered / TRIAGE_QUESTIONS.length) * 100), missing_fields, missing_questions, invalid_questions, question_contract_version: DAY2_QUESTION_CONTRACT_VERSION };
}
function calculateDeterministicScore(payload) {
  const answers = answersFromPayload(payload);
  const buckets = {};
  for (const dim of Object.keys(DIMENSION_WEIGHTS)) buckets[dim] = [];
  for (const q of TRIAGE_QUESTIONS) buckets[q.dimension].push(scaleToHundred(normalizeAnswer(answers[q.key]) || 1));
  const dimension_scores = {};
  for (const [dim, values] of Object.entries(buckets)) dimension_scores[dim] = Math.round(values.reduce((a,b)=>a+b,0) / values.length);
  const score = Math.round(Object.entries(DIMENSION_WEIGHTS).reduce((sum, [dim, weight]) => sum + dimension_scores[dim] * weight, 0));
  const sorted = Object.entries(dimension_scores).sort((a,b) => a[1] - b[1]);
  const confidence = calculateCompleteness(payload).completion_percent;
  return { session_id: getPayloadSessionId(payload), product: 'GalviScore', score, classification: scoreClassification(score), health_band: scoreBand(score), dimension_scores, strongest_dimensions: sorted.slice(-2).reverse().map(([key, value]) => ({ key, label: dimensionLabel(key), score: value })), weakest_dimensions: sorted.slice(0, 2).map(([key, value]) => ({ key, label: dimensionLabel(key), score: value, insight: insightForDimension(key) })), confidence, confidence_band: confidenceBand(confidence), rules_version: DAY2_RULES_VERSION, question_contract_version: DAY2_QUESTION_CONTRACT_VERSION, generation_source: DAY2_GENERATION_SOURCE };
}
function buildVitalsResult(payload) {
  const scoreResult = calculateDeterministicScore(payload);
  const weakest = scoreResult.weakest_dimensions[0];
  return { session_id: scoreResult.session_id, product: 'GalviVitals', score: scoreResult.score, classification: scoreResult.health_band, health_band: scoreResult.health_band, dimension_scores: scoreResult.dimension_scores, strongest_dimensions: scoreResult.strongest_dimensions, weakest_dimensions: scoreResult.weakest_dimensions, confidence: scoreResult.confidence, confidence_band: scoreResult.confidence_band, rules_version: DAY2_RULES_VERSION, question_contract_version: DAY2_QUESTION_CONTRACT_VERSION, generation_source: DAY2_GENERATION_SOURCE, interpretation: `Your business health snapshot is ${scoreResult.health_band}.`, growth_insight: `${weakest.insight} Your priority risk signal is ${weakest.label} (${weakest.score}/100).` };
}
async function dbRun(db, sql, ...params) { return db.prepare(sql).bind(...params).run(); }
async function dbFirst(db, sql, ...params) { return db.prepare(sql).bind(...params).first(); }
async function upsertSession(db, payload, stage = 'GalviTriage') {
  const ts = nowIso(); const sid = getPayloadSessionId(payload);
  await dbRun(db, `INSERT INTO sessions(session_id,current_stage,status,source,utm_source,utm_campaign,created_at,updated_at,last_seen_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET current_stage=excluded.current_stage, source=COALESCE(excluded.source, sessions.source), utm_source=COALESCE(excluded.utm_source, sessions.utm_source), utm_campaign=COALESCE(excluded.utm_campaign, sessions.utm_campaign), updated_at=excluded.updated_at, last_seen_at=excluded.last_seen_at`, sid, stage, 'active', safe(payload,'session.source'), safe(payload,'session.utm_source'), safe(payload,'session.utm_campaign'), ts, ts, ts);
  return sid;
}
async function persistTriage(db, payload) {
  const sid = await upsertSession(db, payload, 'GalviTriage Submitted'); const ts = nowIso(); const founderId = `founder_${sid}`; const ventureId = `venture_${sid}`;
  await dbRun(db, `INSERT OR IGNORE INTO founders(founder_id,session_id,first_name,last_name,email,phone,linkedin_url,consent_status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)`, founderId, sid, safe(payload,'founder.first_name'), safe(payload,'founder.last_name'), safe(payload,'founder.email'), safe(payload,'founder.phone'), safe(payload,'founder.linkedin_url'), safe(payload,'founder.consent', false) ? 'accepted' : 'missing', ts, ts);
  await dbRun(db, `INSERT INTO ventures(venture_id,session_id,founder_id,venture_name,organization_type,stage,industry,revenue_range,primary_goal,primary_challenge,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(venture_id) DO UPDATE SET venture_name=excluded.venture_name,organization_type=excluded.organization_type,stage=excluded.stage,industry=excluded.industry,revenue_range=excluded.revenue_range,primary_goal=excluded.primary_goal,primary_challenge=excluded.primary_challenge,updated_at=excluded.updated_at`, ventureId, sid, founderId, safe(payload,'venture.venture_name'), safe(payload,'venture.organization_type'), safe(payload,'venture.organization_stage'), safe(payload,'venture.industry'), safe(payload,'venture.revenue_range'), safe(payload,'priority.highest_impact_area'), safe(payload,'open_text.biggest_challenge'), ts, ts);
  const answers = answersFromPayload(payload);
  for (const q of TRIAGE_QUESTIONS) await dbRun(db, `INSERT INTO assessment_responses(response_id,session_id,product,question_id,dimension,answer_number,rules_version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product,question_id) DO UPDATE SET dimension=excluded.dimension,answer_number=excluded.answer_number,rules_version=excluded.rules_version,updated_at=excluded.updated_at`, `resp_${sid}_${q.key}`, sid, 'GalviTriage', q.key, q.dimension, normalizeAnswer(answers[q.key]), DAY2_RULES_VERSION, ts, ts);
  await dbRun(db, `INSERT INTO journey_events(event_id,session_id,event_name,product,current_stage,event_json,created_at) VALUES(?,?,?,?,?,?,?)`, id('evt'), sid, 'galvitriage_submitted', 'GalviTriage', 'GalviTriage Submitted', JSON.stringify({ source: 'day2_worker', contract: DAY2_QUESTION_CONTRACT_VERSION }), ts);
  return sid;
}
async function storedProductResult(db, sessionId, product) { return dbFirst(db, `SELECT * FROM product_results WHERE session_id=? AND product=? AND rules_version=?`, sessionId, product, DAY2_RULES_VERSION); }
async function writeProductResult(db, sessionId, product, result) { const ts = nowIso(); await dbRun(db, `INSERT INTO product_results(result_id,session_id,product,status,confidence,confidence_band,result_json,generation_source,rules_version,content_version,generated_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product) DO UPDATE SET status=excluded.status,confidence=excluded.confidence,confidence_band=excluded.confidence_band,result_json=excluded.result_json,generation_source=excluded.generation_source,rules_version=excluded.rules_version,content_version=excluded.content_version,updated_at=excluded.updated_at`, `result_${sessionId}_${product}`, sessionId, product, 'generated', result.confidence, result.confidence_band, JSON.stringify(result), DAY2_GENERATION_SOURCE, DAY2_RULES_VERSION, DAY2_QUESTION_CONTRACT_VERSION, ts, ts); return result; }
async function getStoredTriage(db, sessionId) {
  const session = await dbFirst(db, `SELECT * FROM sessions WHERE session_id=?`, sessionId);
  if (!session) return null;
  const rows = await db.prepare(`SELECT question_id,dimension,answer_number FROM assessment_responses WHERE session_id=? AND product='GalviTriage' ORDER BY question_id`).bind(sessionId).all();
  return { session, answers: (rows.results || []).reduce((acc, row) => { acc[row.question_id] = row.answer_number; return acc; }, {}) };
}
async function handleDay1Action(env, payload, action) {
  const db = requireDb(env); const ts = nowIso();
  if (action === 'health_check') return jsonResponse({ success: true, action, service: 'GalviCare D1 foundation', schema_version: 'galvivault_schema_v0_5_1' }, 200, env);
  if (action === 'create_or_resume_session') { const sid = normalizeSessionId(payload.session_id) || id('gt'); await dbRun(db, `INSERT INTO sessions(session_id,current_stage,status,source,created_at,updated_at,last_seen_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET current_stage=excluded.current_stage,updated_at=excluded.updated_at,last_seen_at=excluded.last_seen_at`, sid, payload.current_stage || 'Day 1 Browser QA', 'active', payload.source || 'day1_api', ts, ts, ts); return jsonResponse({ success: true, action, session_id: sid }, 200, env); }
  if (action === 'journey_event') { await dbRun(db, `INSERT INTO journey_events(event_id,session_id,event_name,product,current_stage,event_json,created_at) VALUES(?,?,?,?,?,?,?)`, id('evt'), normalizeSessionId(payload.session_id), payload.event_name || 'journey_event', payload.product || 'GalviCare', payload.current_stage || '', JSON.stringify(payload.event_data || payload), ts); return jsonResponse({ success: true, action, session_id: normalizeSessionId(payload.session_id) }, 200, env); }
  if (action === 'get_fixture_result') return jsonResponse({ success: true, action, session_id: normalizeSessionId(payload.session_id), product: payload.product || 'GalviVitals', fixture: true, result: { product: payload.product || 'GalviVitals', status: 'fixture_available', rules_version: DAY2_RULES_VERSION } }, 200, env);
}
async function handleDay2Action(env, payload, action) {
  const db = requireDb(env); const sid = getPayloadSessionId(payload);
  if (action === 'triage_completeness') return jsonResponse({ success: true, action, session_id: sid, ...calculateCompleteness(payload) }, 200, env);
  if (action === 'submit_triage') { const completeness = calculateCompleteness(payload); if (!completeness.complete) return jsonResponse({ success: false, action, message: 'GalviTriage intake is incomplete or invalid.', ...completeness }, 422, env); const session_id = await persistTriage(db, payload); const vitals = await writeProductResult(db, session_id, 'GalviVitals', buildVitalsResult(payload)); const score = await writeProductResult(db, session_id, 'GalviScore', calculateDeterministicScore(payload)); return jsonResponse({ success: true, action, session_id, next_screen: 'GalviVitals', triage: { session_id, question_contract_version: DAY2_QUESTION_CONTRACT_VERSION }, vitals, score }, 200, env); }
  if (!required(sid)) return jsonResponse({ success: false, action, message: 'Missing session_id' }, 400, env);
  if (action === 'get_triage') { const triage = await getStoredTriage(db, sid); if (!triage) return jsonResponse({ success: false, action, message: 'GalviTriage session not found', session_id: sid }, 404, env); return jsonResponse({ success: true, action, session_id: sid, triage }, 200, env); }
  const product = action === 'get_or_create_vitals' ? 'GalviVitals' : 'GalviScore';
  const stored = await storedProductResult(db, sid, product); if (stored) return jsonResponse({ success: true, action, session_id: sid, product, stored: true, result: JSON.parse(stored.result_json) }, 200, env);
  const triage = await getStoredTriage(db, sid); if (!triage) return jsonResponse({ success: false, action, message: 'GalviTriage session not found', session_id: sid }, 404, env);
  const resultPayload = { session: { session_id: sid }, founder: {}, venture: {}, scored_answers: triage.answers };
  const result = product === 'GalviVitals' ? buildVitalsResult(resultPayload) : calculateDeterministicScore(resultPayload);
  await writeProductResult(db, sid, product, result);
  return jsonResponse({ success: true, action, session_id: sid, product, stored: false, result }, 200, env);
}

const GALVISHOT_ACTIONS = new Set([
  'evaluate_galvishot',
  'save_galvishot_followup',
  'get_or_create_galvishot',
  'get_galvishot',
  'generate_galvishot'
]);

const GALVISIGHT_ACTIONS = new Set([
  'evaluate_galvisight_readiness',
  'save_galvisight_followup',
  'record_galvisight_payment_success',
  'get_or_generate_galvisight',
  'hubspot_recovery_tag',
  'journey_event'
]);

const GALVIPATH_ACTIONS = new Set([
  'get_or_generate_galvipath',
  'get_galvipath'
]);

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin':
      env.ALLOWED_ORIGIN || '*',

    'Access-Control-Allow-Methods':
      'GET, POST, OPTIONS',

    'Access-Control-Allow-Headers':
      'Content-Type',

    'Content-Type':
      'application/json'
  };
}

function securityHeaders() {
  return {
    'X-Content-Type-Options':
      'nosniff',

    'Referrer-Policy':
      'strict-origin-when-cross-origin',

    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=()',

    'Cross-Origin-Opener-Policy':
      'same-origin',

    'Cross-Origin-Resource-Policy':
      'cross-origin',

    'X-Frame-Options':
      'DENY'
  };
}

function buildIdentityHeaders() {
  return {
    'X-Galvi-Environment':
      GALVICARE_BUILD.environment,

    'X-Galvi-Stabilization':
      GALVICARE_BUILD.stabilization_version,

    'X-Galvi-Score-Rules':
      GALVICARE_BUILD.score_rules_version,

    'X-GalviShot-Rules':
      GALVICARE_BUILD.galvishot_rules_version
  };
}

function responseHeaders(env, extraHeaders = {}) {
  return {
    ...corsHeaders(env),
    ...securityHeaders(),
    ...extraHeaders
  };
}

function jsonResponse(
  body,
  status = 200,
  env = {},
  extraHeaders = {}
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: responseHeaders(env, extraHeaders)
    }
  );
}

function safe(
  obj,
  path,
  fallback = ''
) {
  return (
    path
      .split('.')
      .reduce(
        (acc, key) => {
          if (
            acc &&
            Object.prototype.hasOwnProperty.call(
              acc,
              key
            )
          ) {
            return acc[key];
          }

          return undefined;
        },
        obj
      ) ?? fallback
  );
}

function required(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ''
  );
}

function normalizeSessionId(value) {
  return String(value || '').trim();
}

async function airtableRequest(
  env,
  tableName,
  method = 'POST',
  body = null,
  query = ''
) {
  if (
    !env.AIRTABLE_BASE_ID ||
    !env.AIRTABLE_TOKEN
  ) {
    throw new Error(
      'AIRTABLE_BASE_ID or AIRTABLE_TOKEN is not configured'
    );
  }

  const url =
    'https://api.airtable.com/v0/' +
    `${env.AIRTABLE_BASE_ID}/` +
    `${encodeURIComponent(tableName)}` +
    query;

  const response = await fetch(
    url,
    {
      method,

      headers: {
        Authorization:
          `Bearer ${env.AIRTABLE_TOKEN}`,

        'Content-Type':
          'application/json'
      },

      body:
        body !== null
          ? JSON.stringify(body)
          : undefined
    }
  );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  if (!response.ok) {
    throw new Error(
      `Airtable ${tableName} failed: ` +
      `${response.status} ` +
      `${JSON.stringify(data)}`
    );
  }

  return data;
}

async function createAirtableRecord(
  env,
  tableName,
  fields
) {
  return airtableRequest(
    env,
    tableName,
    'POST',
    {
      fields
    }
  );
}

async function findExistingBySession(
  env,
  tableName,
  sessionId
) {
  const escapedSessionId =
    String(sessionId)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');

  const formula =
    encodeURIComponent(
      `{session_id} = "${escapedSessionId}"`
    );

  const query =
    `?filterByFormula=${formula}` +
    '&maxRecords=1';

  const data =
    await airtableRequest(
      env,
      tableName,
      'GET',
      null,
      query
    );

  if (
    data.records &&
    data.records.length > 0
  ) {
    return data.records[0];
  }

  return null;
}

/*
 * Returns the correct Make webhook.
 *
 * Recommended Worker variables:
 *
 * MAKE_GALVISHOT_WEBHOOK_URL
 * MAKE_GALVISIGHT_WEBHOOK_URL
 *
 * Optional shared fallback:
 *
 * MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL
 */
function resolveMakeWebhook(
  env,
  productName
) {
  if (productName === 'GalviSight') {
    return (
      env.MAKE_GALVISIGHT_WEBHOOK_URL ||
      env.MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL ||
      ''
    );
  }

  if (productName === 'GalviShot') {
    return (
      env.MAKE_GALVISHOT_WEBHOOK_URL ||
      env.MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL ||
      ''
    );
  }

  return (
    env.MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL ||
    ''
  );
}

async function forwardToMake(
  env,
  payload,
  productName
) {
  const webhookUrl =
    resolveMakeWebhook(
      env,
      productName
    );

  if (!webhookUrl) {
    const variableName =
      productName === 'GalviSight'
        ? 'MAKE_GALVISIGHT_WEBHOOK_URL'
        : 'MAKE_GALVISHOT_WEBHOOK_URL';

    return {
      ok: false,
      status: 500,
      data: {
        success: false,
        product: productName,
        message:
          `${variableName} is not configured`
      }
    };
  }

  const response =
    await fetch(
      webhookUrl,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(payload)
      }
    );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      success: response.ok,
      raw: text
    };
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

function buildFounderFields(payload) {
  return {
    founder_id: safe(
      payload,
      'session.session_id'
    ),

    first_name: safe(
      payload,
      'founder.first_name'
    ),

    last_name: safe(
      payload,
      'founder.last_name'
    ),

    email: safe(
      payload,
      'founder.email'
    ),

    phone: safe(
      payload,
      'founder.phone'
    ),

    linkedin_url: safe(
      payload,
      'founder.linkedin_url'
    ),

    consent: Boolean(
      safe(
        payload,
        'founder.consent',
        false
      )
    ),

    source: safe(
      payload,
      'session.source'
    ),

    created_at: safe(
      payload,
      'session.timestamp'
    ),

    last_session_id: safe(
      payload,
      'session.session_id'
    )
  };
}

function buildVentureFields(payload) {
  return {
    venture_id: safe(
      payload,
      'session.session_id'
    ),

    founder_email: safe(
      payload,
      'founder.email'
    ),

    venture_name: safe(
      payload,
      'venture.venture_name'
    ),

    website: safe(
      payload,
      'venture.website'
    ),

    organization_stage: safe(
      payload,
      'venture.organization_stage'
    ),

    organization_type: safe(
      payload,
      'venture.organization_type'
    ),

    industry: safe(
      payload,
      'venture.industry'
    ),

    revenue_range: safe(
      payload,
      'venture.revenue_range'
    ),

    team_size: safe(
      payload,
      'venture.team_size'
    ),

    created_at: safe(
      payload,
      'session.timestamp'
    ),

    session_id: safe(
      payload,
      'session.session_id'
    )
  };
}

function buildTriageFields(payload) {
  const scored =
    payload.scored_answers || {};

  const derived =
    payload.derived_scores || {};

  return {
    session_id: safe(
      payload,
      'session.session_id'
    ),

    email: safe(
      payload,
      'founder.email'
    ),

    venture_name: safe(
      payload,
      'venture.venture_name'
    ),

    timestamp: safe(
      payload,
      'session.timestamp'
    ),

    source: safe(
      payload,
      'session.source'
    ),

    device_type: safe(
      payload,
      'session.device_type'
    ),

    utm_source: safe(
      payload,
      'session.utm_source'
    ),

    utm_campaign: safe(
      payload,
      'session.utm_campaign'
    ),

    organization_stage: safe(
      payload,
      'venture.organization_stage'
    ),

    organization_type: safe(
      payload,
      'venture.organization_type'
    ),

    industry: safe(
      payload,
      'venture.industry'
    ),

    revenue_range: safe(
      payload,
      'venture.revenue_range'
    ),

    team_size: safe(
      payload,
      'venture.team_size'
    ),

    highest_impact_area: safe(
      payload,
      'priority.highest_impact_area'
    ),

    biggest_challenge: safe(
      payload,
      'open_text.biggest_challenge'
    ),

    one_30_day_problem: safe(
      payload,
      'open_text.one_30_day_problem'
    ),

    growth_blocker: safe(
      payload,
      'open_text.growth_blocker'
    ),

    feels_broken: safe(
      payload,
      'open_text.feels_broken'
    ),

    keeps_up_at_night: safe(
      payload,
      'open_text.keeps_up_at_night'
    ),

    total_score: Number(
      derived.total_score || 0
    ),

    health_band:
      derived.health_band || '',

    lowest_domain:
      derived.lowest_domain || '',

    confidence_percent: Number(
      derived.confidence_percent || 0
    ),

    scoring_version:
      derived.scoring_version ||
      payload.scoring_version ||
      'galvitriage_0_5_worker',

    q01_business_clarity: Number(
      scored.q01_business_clarity || 0
    ),

    q02_stage_signal: Number(
      scored.q02_stage_signal || 0
    ),

    q03_real_problem: Number(
      scored.q03_real_problem || 0
    ),

    q04_ideal_customer: Number(
      scored.q04_ideal_customer || 0
    ),

    q05_attract_customers: Number(
      scored.q05_attract_customers || 0
    ),

    q06_customer_conversations: Number(
      scored.q06_customer_conversations || 0
    ),

    q07_predictable_revenue: Number(
      scored.q07_predictable_revenue || 0
    ),

    q08_revenue_growth_confidence:
      Number(
        scored.q08_revenue_growth_confidence ||
        0
      ),

    q09_revenue_driver_clarity:
      Number(
        scored.q09_revenue_driver_clarity ||
        0
      ),

    q10_customer_satisfaction:
      Number(
        scored.q10_customer_satisfaction ||
        0
      ),

    q11_feedback_improvement:
      Number(
        scored.q11_feedback_improvement ||
        0
      ),

    q12_organized_operations:
      Number(
        scored.q12_organized_operations ||
        0
      ),

    q13_founder_dependency:
      Number(
        scored.q13_founder_dependency ||
        0
      ),

    q14_systems_support_growth:
      Number(
        scored.q14_systems_support_growth ||
        0
      ),

    q15_technology_effectiveness:
      Number(
        scored.q15_technology_effectiveness ||
        0
      ),

    q16_ai_readiness:
      Number(
        scored.q16_ai_readiness ||
        0
      ),

    q17_leadership_confidence:
      Number(
        scored.q17_leadership_confidence ||
        0
      ),

    q18_vision_clarity:
      Number(
        scored.q18_vision_clarity ||
        0
      ),

    q19_decision_information:
      Number(
        scored.q19_decision_information ||
        0
      ),

    q20_execution_action:
      Number(
        scored.q20_execution_action ||
        0
      )
  };
}

function buildDiagnosticFields(payload) {
  const derived =
    payload.derived_scores || {};

  return {
    session_id: safe(
      payload,
      'session.session_id'
    ),

    product:
      'GalviVitals',

    score: Number(
      derived.total_score || 0
    ),

    classification:
      derived.health_band || '',

    bottleneck:
      derived.lowest_domain || '',

    narrative:
      'Initial GalviVitals generated ' +
      'from GalviTriage 0.5 ' +
      'rules-first scoring.',

    confidence: Number(
      derived.confidence_percent || 0
    ),

    prompt_version:
      derived.scoring_version ||
      'rules_first_v0_5_worker',

    created_at: safe(
      payload,
      'session.timestamp'
    )
  };
}

function buildJourneyFields(payload) {
  return {
    session_id: safe(
      payload,
      'session.session_id'
    ),

    email: safe(
      payload,
      'founder.email'
    ),

    screen: safe(
      payload,
      'journey_event.screen',
      'GalviTriage'
    ),

    event_name: safe(
      payload,
      'journey_event.event_name',
      'galvitriage_submitted'
    ),

    timestamp: safe(
      payload,
      'session.timestamp'
    ),

    device_type: safe(
      payload,
      'session.device_type'
    ),

    source: safe(
      payload,
      'session.source'
    ),

    utm_source: safe(
      payload,
      'session.utm_source'
    ),

    utm_campaign: safe(
      payload,
      'session.utm_campaign'
    )
  };
}

function buildHubSpotContactProperties(
  payload
) {
  return {
    email: safe(
      payload,
      'founder.email'
    ),

    firstname: safe(
      payload,
      'founder.first_name'
    ),

    lastname: safe(
      payload,
      'founder.last_name'
    ),

    phone: safe(
      payload,
      'founder.phone'
    ),

    company: safe(
      payload,
      'venture.venture_name'
    ),

    website: safe(
      payload,
      'venture.website'
    )
  };
}

async function hubspotRequest(
  env,
  path,
  method = 'POST',
  body = null
) {
  if (
    env.HUBSPOT_ENABLED !== 'true' ||
    !env.HUBSPOT_PRIVATE_APP_TOKEN
  ) {
    return {
      skipped: true,

      reason:
        'HubSpot disabled or ' +
        'HUBSPOT_PRIVATE_APP_TOKEN missing'
    };
  }

  const response =
    await fetch(
      `https://api.hubapi.com${path}`,
      {
        method,

        headers: {
          Authorization:
            `Bearer ` +
            `${env.HUBSPOT_PRIVATE_APP_TOKEN}`,

          'Content-Type':
            'application/json'
        },

        body:
          body !== null
            ? JSON.stringify(body)
            : undefined
      }
    );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      raw: text
    };
  }

  if (!response.ok) {
    throw new Error(
      `HubSpot ${path} failed: ` +
      `${response.status} ` +
      `${JSON.stringify(data)}`
    );
  }

  return data;
}

async function upsertHubSpotContact(
  env,
  payload
) {
  const properties =
    buildHubSpotContactProperties(
      payload
    );

  return hubspotRequest(
    env,
    '/crm/v3/objects/contacts',
    'POST',
    {
      properties
    }
  );
}

/*
 * Shared diagnostic action handler.
 *
 * This sends GalviShot or GalviSight
 * actions to Make before the request
 * reaches GalviTriage validation.
 */

function galviShotConfidence(scoreResult, responseCount, followupCount = 0) {
  const scores = scoreResult.dimension_scores || {};
  const completeness = Math.round((responseCount / TRIAGE_QUESTIONS.length) * 100);
  const spread = Object.values(scores).filter(v => Number.isFinite(v)).length;
  return Math.max(0, Math.min(100, Math.round(completeness - (spread < 8 ? 20 : 0) + Math.min(10, followupCount * 5))));
}

function isQaEnvironment(env) { return !['production', 'prod'].includes(String(env.ENVIRONMENT || env.APP_ENV || 'qa').toLowerCase()); }
function hasQaOverride(env, payload) {
  const token = safe(payload, 'payload.qa_override_token') || safe(payload, 'qa_override_token');
  if (!isQaEnvironment(env) || !env.GALVISHOT_QA_OVERRIDE_TOKEN || !required(token)) return false;
  return String(token) === String(env.GALVISHOT_QA_OVERRIDE_TOKEN);
}
async function hasGalviShotEntitlement(db, sessionId) {
  const entitlement = await dbFirst(db, `SELECT * FROM entitlements WHERE session_id=? AND product=?`, sessionId, 'GalviShot');
  if (entitlement && ['active', 'paid', 'granted', 'test_override'].includes(String(entitlement.entitlement_status || '').toLowerCase())) return true;
  const payment = await dbFirst(db, `SELECT * FROM payments WHERE session_id=? AND product=?`, sessionId, 'GalviShot');
  return Boolean(payment && ['paid', 'succeeded', 'complete'].includes(String(payment.payment_status || '').toLowerCase()));
}
async function galviShotFollowups(db, sessionId) {
  const rows = await db.prepare(`SELECT question_id,question_text,answer,confidence_impact FROM clinical_followups WHERE session_id=? AND product=? ORDER BY question_id`).bind(sessionId, 'GalviShot').all();
  return rows.results || [];
}
async function storedGalviShot(db, sessionId) {
  return dbFirst(db, `SELECT * FROM product_results WHERE session_id=? AND product=? AND rules_version=?`, sessionId, 'GalviShot', GALVISHOT_RULES_VERSION);
}
function findingLibrary() { return [
  { code:'PRODUCT_MARKET_EVIDENCE_CONTRADICTION', family:'Cross-dimension contradiction', domain:'customer', priority:5, eligible:s=>s.product>=70&&(s.customer<55||s.revenue<55), suppress:['PRODUCT_VALIDATION_GAP'], title:'Product strength is ahead of customer or revenue evidence.', text:'The current record shows a stronger product signal than the customer or revenue evidence around it.', risk:'Build effort may continue ahead of proof that the offer is repeatable.', action:'Rebalance the next sprint toward customer and revenue evidence before adding product scope.' },
  { code:'BROAD_FOCUS_DILUTION', family:'Broad weakness', domain:'strategy', priority:10, eligible:s=>Object.values(s).filter(v=>v<60).length>=3, title:'Multiple constraints are competing for attention.', text:'The current assessment has at least three dimensions below 60, so the useful next step is sequencing rather than treating every signal at once.', risk:'Trying to improve every weak area at the same time may dilute execution.', action:'Choose one 90-day constraint and sequence two evidence sprints behind it.' },
  { code:'REVENUE_SIGNAL_WEAK', family:'Revenue weakness', domain:'revenue', priority:20, eligible:s=>s.revenue<55, title:'Revenue evidence is the clearest weak signal.', text:'The current assessment shows limited evidence that revenue or funding is predictable and understood.', risk:'Growth activity may increase without a clear conversion or funding signal.', action:'Define the conversion, funding, or retention signal that would prove improvement.' },
  { code:'CUSTOMER_EVIDENCE_GAP', family:'Customer evidence', domain:'customer', priority:30, eligible:s=>s.customer<55, title:'Customer evidence needs tightening.', text:'The current record shows limited evidence about the ideal customer and satisfaction signal.', risk:'Priorities may be based on assumed demand rather than observed customer evidence.', action:'Run a focused customer signal test with a defined ideal customer profile.' },
  { code:'PRODUCT_VALIDATION_GAP', family:'Product validation', domain:'product', priority:40, eligible:s=>s.product<55, title:'Product validation evidence is thin.', text:'The current assessment shows limited evidence that feedback is consistently improving the offer.', risk:'The offer may be refined without enough proof of customer outcome.', action:'Define one proof-of-value test tied to customer feedback.' },
  { code:'LEADERSHIP_CAPACITY_STRAIN', family:'Leadership capacity', domain:'leadership', priority:50, eligible:s=>s.leadership<55, title:'Leadership capacity is a material constraint.', text:'The current assessment shows strain in leadership confidence, decision information, or follow-through.', risk:'Decision load may slow action if it remains unmanaged.', action:'Reduce decision load by naming the next three owner-level decisions and review cadence.' },
  { code:'OPERATIONS_FRAGILITY', family:'Operations', domain:'technology_operations', priority:60, eligible:s=>s.technology_operations<55, title:'Operating systems may not be supporting execution.', text:'The current record shows limited evidence that operations and technology are supporting growth consistently.', risk:'Manual or unclear workflows may make improvements harder to sustain.', action:'Identify the process most likely to break and standardize its critical steps.' },
  { code:'PROBLEM_CLARITY_GAP', family:'Problem clarity', domain:'problem', priority:70, eligible:s=>s.problem<55, title:'Problem clarity is not yet strong enough.', text:'The current assessment shows limited evidence that the customer problem is clearly proven.', risk:'The venture may spend effort on solutions before urgency is established.', action:'Write the customer problem statement and test urgency with direct evidence.' },
  { code:'BUSINESS_MODEL_STRAIN', family:'Business model', domain:'business_model', priority:80, eligible:s=>s.business_model<55, title:'Business model clarity needs focus.', text:'The current assessment shows limited clarity around model, stage, or founder dependency.', risk:'Planning may rely on assumptions that have not been made explicit.', action:'Name the business model assumption that most needs validation.' },
  { code:'DISTRIBUTION_BOTTLENECK', family:'Distribution', domain:'distribution', priority:90, eligible:s=>s.distribution<55, title:'Distribution repeatability is constrained.', text:'The current assessment shows limited evidence of consistently attracting or learning from customers.', risk:'Demand generation may remain episodic rather than repeatable.', action:'Test one channel signal and connect it to direct customer conversations.' }
]; }
function buildEvidenceForFinding(f, scores) {
  const dimScores = Object.entries(scores).sort((a,b)=>a[1]-b[1]);
  const direct = dimScores.find(([dim]) => dim === f.domain) || dimScores[0];
  const ids = direct ? [`evidence_${direct[0]}`] : ['evidence_galviscore'];
  return ids.map(source_id => ({ source_id, source_type:'assessment_response', source_field:direct ? direct[0] : 'dimension_scores', display_value:direct ? `${dimensionLabel(direct[0])}: ${direct[1]}/100` : 'Stored GalviScore dimension scores', used_for:f.code }));
}
function composeGalviShot(scoreResult, followups) {
  const scores = scoreResult.dimension_scores || {};
  let candidates = findingLibrary().filter(f => f.eligible(scores)).sort((a,b)=>a.priority-b.priority || a.code.localeCompare(b.code));
  const suppressed = new Set(candidates.flatMap(f => f.suppress || []));
  candidates = candidates.filter(f => !suppressed.has(f.code));
  if (!candidates.length) candidates = [{ code:'FACILITATOR_REVIEW', family:'Facilitator review', domain:'review', priority:999, title:'A facilitator should review this record.', text:'The stored evidence does not support a deterministic finding set without human review.', risk:'A generic automated interpretation could overstate the record.', action:'Review the Day 2 record with a facilitator before generating paid findings.' }];
  const selected = [];
  const usedDomains = new Set();
  for (const f of candidates) { if (selected.length >= (scoreResult.confidence >= 90 ? 5 : 3)) break; if (!usedDomains.has(f.domain) || selected.length < 3) { selected.push(f); usedDomains.add(f.domain); } }
  const findings = selected.slice(0, scoreResult.confidence >= 90 ? 5 : 3).map((f, i) => ({ rank:i+1, finding_code:f.code, family:f.family, domain:f.domain, title:f.title, finding_text:f.text, evidence:buildEvidenceForFinding(f, scores), confidence:scoreResult.confidence, confidence_language:scoreResult.confidence >= 90 ? 'strong evidence in the current record' : 'sufficient evidence with stated assumptions', action:f.action, risk:f.risk }));
  return { session_id:scoreResult.session_id, product:'GalviShot', status:'ok', rules_version:GALVISHOT_RULES_VERSION, content_version:GALVISHOT_CONTENT_VERSION, generation_source:'rules', confidence:scoreResult.confidence, confidence_band:scoreResult.confidence >= 90 ? 'high' : 'standard', executive_summary:`The strongest pattern in the current GalviCare record is ${findings[0].title.toLowerCase()} This GalviShot uses only stored Day 2 evidence${followups.length ? ' and approved follow-up answers' : ''}, so each finding is constrained to what the record supports.`, findings, strategic_risks:[...new Set(findings.map(f=>f.risk))].slice(0,3), recommended_actions:[...new Set(findings.map(f=>f.action))].slice(0,3), assumptions:['This result is based on the stored Day 2 assessment and any saved GalviShot follow-up answers.', 'No revenue amounts, market conditions, or founder biography are inferred beyond the stored record.'], next_step:{ label:'Continue to GalviSight', route:'GalviSight Handoff' } };
}
async function evaluateGalviShot(db, sessionId) {
  const triage = await getStoredTriage(db, sessionId);
  if (!triage) return { success:false, status:'not_found', message:'Complete GalviTriage before requesting GalviShot.', session_id:sessionId };
  const resultPayload = { session:{ session_id:sessionId }, scored_answers:triage.answers };
  const score = calculateDeterministicScore(resultPayload);
  const followups = await galviShotFollowups(db, sessionId);
  score.confidence = galviShotConfidence(score, Object.keys(triage.answers).length, followups.filter(f=>required(f.answer)).length);
  if (score.confidence < 60) return { success:true, status:'needs_followup', session_id:sessionId, confidence:score.confidence, confidence_language:'More evidence is needed before GalviShot can produce a paid finding set.', followup_questions:[{ question_code:'PRIMARY_CONSTRAINT_CLARITY', question_text:'What is the clearest business constraint you want GalviShot to interpret?' }] };
  if (score.confidence < 80) return { success:true, status:'needs_followup', session_id:sessionId, confidence:score.confidence, confidence_language:'The record is close but needs targeted follow-up before final GalviShot findings.', followup_questions:[{ question_code:'EVIDENCE_PRIORITY', question_text:'Which evidence signal is strongest right now: customers, revenue, product feedback, operations, or leadership capacity?' }] };
  const eligibleCount = findingLibrary().filter(f => f.eligible(score.dimension_scores)).length;
  return { success:true, status:eligibleCount ? 'eligible' : 'facilitator_review', session_id:sessionId, confidence:score.confidence, confidence_language:score.confidence >= 90 ? 'Strong evidence is available in the current record.' : 'Sufficient evidence is available with stated assumptions.', rules_version:GALVISHOT_RULES_VERSION };
}
function stableGalviShotEvidenceLinkId(sessionId, findingCode, sourceField) {
  return `evidence_link_${sessionId}_GalviShot_${findingCode}_${sourceField}_${GALVISHOT_RULES_VERSION}`.replace(/[^A-Za-z0-9_:-]/g, '_');
}
async function writeGalviShot(db, sessionId, result) {
  const ts = nowIso();
  await dbRun(db, `INSERT INTO product_results(result_id,session_id,product,status,confidence,confidence_band,result_json,generation_source,rules_version,content_version,generated_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product) DO NOTHING`, `result_${sessionId}_GalviShot`, sessionId, 'GalviShot', result.status, result.confidence, result.confidence_band, JSON.stringify(result), 'rules', GALVISHOT_RULES_VERSION, GALVISHOT_CONTENT_VERSION, ts, ts);
  for (const f of result.findings) {
    const evidence = Array.isArray(f.evidence) ? f.evidence : [];
    await dbRun(db, `INSERT INTO clinical_findings(finding_id,session_id,product,finding_code,finding_text,evidence_ids_json,severity,confidence,confidence_band,status,rules_version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product,finding_code) DO UPDATE SET finding_text=excluded.finding_text,evidence_ids_json=excluded.evidence_ids_json,confidence=excluded.confidence,confidence_band=excluded.confidence_band,updated_at=excluded.updated_at`, `finding_${sessionId}_${f.finding_code}`, sessionId, 'GalviShot', f.finding_code, f.finding_text, JSON.stringify(evidence.map(e=>e.source_id)), f.domain, f.confidence, f.confidence_language, 'supported', GALVISHOT_RULES_VERSION, ts, ts);
    for (const e of evidence) {
      const sourceField = String(e.source_field || e.source_id || 'unknown');
      await dbRun(db, `INSERT INTO galvishot_evidence_links(evidence_link_id,session_id,product,finding_code,source_type,source_field,display_value,used_for,rules_version,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product,finding_code,source_field,rules_version) DO UPDATE SET source_type=excluded.source_type,display_value=excluded.display_value,used_for=excluded.used_for`, stableGalviShotEvidenceLinkId(sessionId, f.finding_code, sourceField), sessionId, 'GalviShot', f.finding_code, String(e.source_type || 'assessment_response'), sourceField, String(e.display_value || ''), String(e.used_for || f.finding_code), GALVISHOT_RULES_VERSION, ts);
    }
  }
}
async function handleDay3GalviShotAction(env, payload, action) {
  const db = requireDb(env); const sid = normalizeSessionId(safe(payload, 'session_id') || safe(payload, 'session.session_id'));
  if (!required(sid)) return jsonResponse({ success:false, action, status:'error', message:'Missing session_id' }, 400, env);
  if (action === 'get_galvishot') { const entitled = await hasGalviShotEntitlement(db, sid) || hasQaOverride(env, payload); if (!entitled) return jsonResponse({ success:false, action, status:'locked', message:'GalviShot is locked until server-side entitlement is verified.', session_id:sid, payment_required:true }, 402, env); const stored = await storedGalviShot(db, sid); if (!stored) return jsonResponse({ success:false, action, status:'not_found', session_id:sid }, 404, env); return jsonResponse({ success:true, action, status:'ok', stored:true, session_id:sid, result:JSON.parse(stored.result_json) }, 200, env); }
  if (action === 'evaluate_galvishot') return jsonResponse({ action, ...(await evaluateGalviShot(db, sid)) }, 200, env);
  if (action === 'save_galvishot_followup') { const answers = safe(payload, 'payload.answers', []); if (!Array.isArray(answers)) return jsonResponse({ success:false, action, status:'error', message:'answers must be an array' }, 400, env); const ts = nowIso(); for (const a of answers.slice(0, 5)) { const code = String(a.question_code || a.question_id || '').slice(0,64); const text = String(a.question_text || code).slice(0,500); const ans = String(a.answer_text || a.answer || '').trim().slice(0,1000); if (required(code) && required(ans)) await dbRun(db, `INSERT INTO clinical_followups(followup_id,session_id,current_stage,product,question_id,question_text,answer,confidence_impact,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product,question_id) DO UPDATE SET question_text=excluded.question_text,answer=excluded.answer,confidence_impact=excluded.confidence_impact,updated_at=excluded.updated_at`, `followup_${sid}_${code}`, sid, 'GalviShot', 'GalviShot', code, text, ans, Number(a.confidence_impact || 5), ts, ts); } return jsonResponse({ success:true, action, status:'ok', session_id:sid, evaluation:await evaluateGalviShot(db, sid) }, 200, env); }
  const entitled = await hasGalviShotEntitlement(db, sid) || hasQaOverride(env, payload);
  if (!entitled) return jsonResponse({ success:false, action, status:'locked', message:'GalviShot is locked until server-side entitlement is verified.', session_id:sid, payment_required:true }, 402, env);
  const stored = await storedGalviShot(db, sid); if (stored) return jsonResponse({ success:true, action, status:'ok', stored:true, session_id:sid, result:JSON.parse(stored.result_json) }, 200, env);
  const evaluation = await evaluateGalviShot(db, sid); if (!evaluation.success || evaluation.status !== 'eligible') return jsonResponse({ action, ...evaluation }, evaluation.status === 'not_found' ? 404 : 200, env);
  const triage = await getStoredTriage(db, sid); const score = calculateDeterministicScore({ session:{ session_id:sid }, scored_answers:triage.answers }); const followups = await galviShotFollowups(db, sid); score.confidence = galviShotConfidence(score, Object.keys(triage.answers).length, followups.filter(f=>required(f.answer)).length); const result = composeGalviShot(score, followups); await writeGalviShot(db, sid, result); return jsonResponse({ success:true, action, status:'ok', stored:false, session_id:sid, result }, 200, env);
}


function day4ProductVersion(product) {
  return product === 'GalviPath'
    ? { rules: GALVIPATH_RULES_VERSION, content: GALVIPATH_CONTENT_VERSION }
    : { rules: GALVISIGHT_RULES_VERSION, content: GALVISIGHT_CONTENT_VERSION };
}
async function hasProductEntitlement(db, sessionId, product) {
  const entitlement = await dbFirst(db, `SELECT * FROM entitlements WHERE session_id=? AND product=?`, sessionId, product);
  if (entitlement && ['active', 'paid', 'granted', 'test_override'].includes(String(entitlement.entitlement_status || '').toLowerCase())) return true;
  const payment = await dbFirst(db, `SELECT * FROM payments WHERE session_id=? AND product=?`, sessionId, product);
  return Boolean(payment && ['paid', 'succeeded', 'complete'].includes(String(payment.payment_status || '').toLowerCase()));
}
async function storedDay4Result(db, sessionId, product) {
  const v = day4ProductVersion(product);
  return dbFirst(db, `SELECT * FROM product_results WHERE session_id=? AND product=? AND rules_version=?`, sessionId, product, v.rules);
}
async function writeDay4Result(db, sessionId, product, result) {
  const ts = nowIso(); const v = day4ProductVersion(product);
  await dbRun(db, `INSERT INTO product_results(result_id,session_id,product,status,confidence,confidence_band,result_json,generation_source,rules_version,content_version,generated_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,product) DO NOTHING`, `result_${sessionId}_${product}`, sessionId, product, result.status, result.confidence || 0, result.confidence_band || confidenceBand(result.confidence || 0), JSON.stringify(result), 'rules', v.rules, v.content, ts, ts);
  return result;
}
async function getPaidGalviShotForDay4(db, env, payload, sessionId) {
  const entitled = await hasGalviShotEntitlement(db, sessionId) || hasQaOverride(env, payload);
  if (!entitled) return { locked:true, response:{ success:false, status:'locked', message:'GalviShot is locked until server-side entitlement is verified.', session_id:sessionId, payment_required:true } };
  const stored = await storedGalviShot(db, sessionId);
  if (!stored) return { missing:true, response:{ success:false, status:'not_found', message:'Generate GalviShot before requesting Day 4.', session_id:sessionId } };
  return { shot: JSON.parse(stored.result_json) };
}
function shotFindingEvidence(shot) {
  return (shot.findings || []).flatMap(f => (f.evidence || []).map(e => ({ finding_code:f.finding_code, title:f.title, source_id:e.source_id, source_field:e.source_field, display_value:e.display_value, used_for:e.used_for })));
}
function buildGalviSight(shot) {
  const findings = shot.findings || []; const confidence = Number(shot.confidence || 0);
  if (confidence < 70) return { session_id:shot.session_id, product:'GalviSight', status:'needs_followup', confidence, confidence_band:confidenceBand(confidence), rules_version:GALVISIGHT_RULES_VERSION, content_version:GALVISIGHT_CONTENT_VERSION, followup_questions:[{ question_code:'DAY4_EVIDENCE_GAP', question_text:'Which stored evidence signal should a facilitator validate first?' }], assumptions:['GalviSight withholds interpretation until the stored clinical file has enough confidence.'] };
  if (!findings.length || findings.some(f => f.finding_code === 'FACILITATOR_REVIEW')) return { session_id:shot.session_id, product:'GalviSight', status:'facilitator_review', confidence, confidence_band:confidenceBand(confidence), rules_version:GALVISIGHT_RULES_VERSION, content_version:GALVISIGHT_CONTENT_VERSION, message:'A facilitator should review this record before automated interpretation.', assumptions:['The stored findings do not support a deterministic interpretation.'] };
  const top = findings[0];
  return { session_id:shot.session_id, product:'GalviSight', status:'ready', rules_version:GALVISIGHT_RULES_VERSION, content_version:GALVISIGHT_CONTENT_VERSION, generation_source:'rules', confidence, confidence_band:confidenceBand(confidence), interpretation:`GalviSight interprets the strongest supported pattern as: ${top.title}`, hypotheses:findings.map(f=>({ label:'Hypothesis', finding_code:f.finding_code, statement:`Hypothesis: ${f.title}`, support:f.evidence || [] })), risks:[...new Set(findings.map(f=>f.risk))], opportunities:findings.map(f=>({ finding_code:f.finding_code, statement:`Opportunity: ${f.action}` })), urgency:findings.length >= 3 ? 'High — multiple supported constraints need sequencing.' : 'Standard — address the strongest supported constraint first.', assumptions:['All meaning statements are constrained to the stored GalviShot findings and evidence references.', 'Root-cause language is labeled as hypothesis unless directly supported by stored evidence.'], recommended_actions:findings.map((f,i)=>({ priority:i+1, finding_code:f.finding_code, action:f.action, evidence_refs:(f.evidence||[]).map(e=>e.source_id) })), evidence_trace:shotFindingEvidence(shot), next_step:{ label:'Continue to Chart Your GalviPath', route:'GalviPath' } };
}
function selectPathway(shot) {
  const codes=(shot.findings||[]).map(f=>f.finding_code);
  if (codes.includes('BROAD_FOCUS_DILUTION') || codes.includes('LEADERSHIP_CAPACITY_STRAIN') || codes.includes('OPERATIONS_FRAGILITY')) return 'stabilize';
  if (Number(shot.confidence||0) < 80) return 'diagnose';
  if (codes.includes('CUSTOMER_EVIDENCE_GAP') || codes.includes('PRODUCT_VALIDATION_GAP') || codes.includes('PROBLEM_CLARITY_GAP')) return 'validate';
  if (codes.includes('REVENUE_SIGNAL_WEAK') || codes.includes('DISTRIBUTION_BOTTLENECK')) return 'grow';
  return 'build';
}
function buildGalviPath(shot, sight) {
  const pathway = selectPathway(shot); const evidence = shotFindingEvidence(shot);
  return { session_id:shot.session_id, product:'GalviPath', status:'ready', rules_version:GALVIPATH_RULES_VERSION, content_version:GALVIPATH_CONTENT_VERSION, generation_source:'rules', confidence:shot.confidence, confidence_band:confidenceBand(shot.confidence), primary_pathway:pathway, primary_pathway_count:1, clinical_rationale:`${pathway} is selected from stored GalviShot findings and GalviSight interpretation, not browser rules.`, sequence:[{ window:'30 days', order:1, actions:['Name the single operating constraint and baseline evidence.'] },{ window:'60 days', order:2, actions:['Run the focused evidence sprint and review measured signals.'] },{ window:'90 days', order:3, actions:['Decide whether to continue, escalate, or change pathway based on collected evidence.'] }], evidence_to_collect:['Customer or stakeholder signal tied to the primary constraint.','Revenue, funding, delivery, or capacity signal affected by the selected pathway.'], operating_cadence:'Weekly owner review with one monthly facilitator checkpoint.', support_recommendation:'Book GalviClinic if the primary constraint remains unresolved after the first evidence sprint.', escalation_triggers:['Confidence drops below 70.', 'New evidence contradicts the primary finding.', 'More than two constraints require simultaneous intervention.'], assumptions:[...(sight.assumptions || []), 'GalviPath sequences care from stored Day 3 and Day 4 records only.'], evidence_trace:evidence, source_references:evidence.map(e=>e.source_id), ctas:{ print:'Print GalviPath', clinic:'Book GalviClinic' } };
}
async function handleDay4Action(env, payload, action) {
  const db = requireDb(env); const sid = normalizeSessionId(safe(payload,'session_id') || safe(payload,'session.session_id'));
  if (!required(sid)) return jsonResponse({ success:false, action, status:'error', message:'Missing session_id' }, 400, env);
  const product = action.includes('galvipath') ? 'GalviPath' : 'GalviSight';
  const entitled = await hasProductEntitlement(db, sid, product) || hasQaOverride(env, payload);
  if (!entitled) return jsonResponse({ success:false, action, status:'locked', product, session_id:sid, payment_required:true, message:`${product} is locked until server-side entitlement is verified.` }, 402, env);
  const stored = await storedDay4Result(db, sid, product); if (stored) return jsonResponse({ success:true, action, status:'ok', stored:true, product, session_id:sid, result:JSON.parse(stored.result_json) }, 200, env);
  const shotState = await getPaidGalviShotForDay4(db, env, payload, sid); if (!shotState.shot) return jsonResponse({ action, ...shotState.response }, shotState.locked ? 402 : 404, env);
  const sightStored = product === 'GalviPath' ? await storedDay4Result(db, sid, 'GalviSight') : null;
  const sight = sightStored ? JSON.parse(sightStored.result_json) : buildGalviSight(shotState.shot);
  if (product === 'GalviSight') { if (sight.status === 'ready') await writeDay4Result(db, sid, 'GalviSight', sight); return jsonResponse({ success:true, action, status:sight.status, stored:false, product, session_id:sid, result:sight }, 200, env); }
  if (sight.status !== 'ready') return jsonResponse({ success:true, action, status:sight.status, product, session_id:sid, result:sight }, 200, env);
  const path = buildGalviPath(shotState.shot, sight); await writeDay4Result(db, sid, 'GalviPath', path); return jsonResponse({ success:true, action, status:'ok', stored:false, product, session_id:sid, result:path }, 200, env);
}

async function handleDiagnosticAction(
  env,
  payload,
  action,
  productName
) {
  const sessionId =
    normalizeSessionId(
      safe(
        payload,
        'session.session_id'
      ) ||
      safe(
        payload,
        'session_id'
      )
    );

  if (!required(sessionId)) {
    return jsonResponse(
      {
        success: false,
        product: productName,
        action,

        message:
          `Missing required ${productName} field`,

        required: [
          'session.session_id'
        ]
      },
      400,
      env
    );
  }

  const normalizedPayload = {
    ...payload,

    action,

    product_name:
      payload.product_name ||
      productName,

    current_stage:
      payload.current_stage ||
      `${productName} Processing`,

    session: {
      ...(payload.session || {}),

      session_id:
        sessionId
    }
  };

  const makeResult =
    await forwardToMake(
      env,
      normalizedPayload,
      productName
    );

  const makeData =
    makeResult.data || {};

  /*
   * Return Make's status code.
   *
   * This allows a Make response such as
   * HTTP 402 payment_required to remain
   * HTTP 402 instead of becoming a 500.
   */
  return jsonResponse(
    {
      ...makeData,

      success:
        makeData.success !== undefined
          ? makeData.success
          : makeResult.ok,

      product:
        makeData.product ||
        productName,

      action:
        makeData.action ||
        action,

      session_id:
        makeData.session_id ||
        sessionId
    },
    makeResult.status,
    env
  );
}

export default {
  async fetch(request, env) {
    /*
     * CORS preflight
     */
    if (request.method === 'OPTIONS') {
      return new Response(
        null,
        {
          status: 204,
          headers:
            responseHeaders(env)
        }
      );
    }

    /*
     * Browser health check
     */
    if (request.method === 'GET') {
      return jsonResponse(
        {
          success: true,

          service:
            'GalviCare 0.5 Worker',

          status:
            'available',

          supported_actions: [
            ...GALVISHOT_ACTIONS,
            ...GALVISIGHT_ACTIONS
          ],

          build:
            GALVICARE_BUILD
        },
        200,
        env,
        buildIdentityHeaders()
      );
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        {
          success: false,

          message:
            'Method not allowed'
        },
        405,
        env
      );
    }

    try {
      let payload;

      try {
        payload =
          await request.json();
      } catch {
        return jsonResponse(
          {
            success: false,

            message:
              'Invalid or empty JSON body'
          },
          400,
          env
        );
      }

      const action =
        String(
          safe(
            payload,
            'action'
          )
        ).trim();

      const pathname = new URL(request.url).pathname;

      /*
       * Pathname is authoritative for Day 2 coexistence:
       * /api is the D1-backed action router; root POST remains legacy.
       */
      if (pathname === '/api' && DAY1_ACTIONS.has(action)) {
        return await handleDay1Action(env, payload, action);
      }

      if (pathname === '/api' && DAY2_ACTIONS.has(action)) {
        return await handleDay2Action(env, payload, action);
      }

      if (pathname === '/api' && GALVISHOT_ACTIONS.has(action)) {
        return await handleDay3GalviShotAction(env, payload, action);
      }

      if (pathname === '/api' && (GALVISIGHT_ACTIONS.has(action) || GALVIPATH_ACTIONS.has(action))) {
        return await handleDay4Action(env, payload, action);
      }

      if (pathname === '/api') {
        return jsonResponse(
          {
            success: false,

            code:
              'UNSUPPORTED_API_ACTION',

            action,

            message:
              'Unsupported /api action'
          },
          404,
          env
        );
      }

      /*
       * GALVISHOT ACTION ROUTE
       *
       * The legacy diagnostic route is disabled for
       * GalviShot. Day 3 actions must use /api so they
       * stay on the D1-only router.
       */
      if (
        GALVISHOT_ACTIONS.has(action)
      ) {
        return jsonResponse(
          {
            success: false,

            code:
              'LEGACY_DIAGNOSTIC_ROUTE_DISABLED',

            action,

            message:
              'GalviShot legacy diagnostic route is disabled; use /api.'
          },
          410,
          env
        );
      }

      /*
       * GALVISIGHT ACTION ROUTES
       *
       * Runs before GalviTriage
       * required-field validation.
       *
       * Make remains responsible for:
       *
       * - retrieving GalviVault data
       * - calculating confidence
       * - returning follow-up questions
       * - saving follow-up answers
       * - verifying payment/test override
       * - retrieving an existing result first
       * - calling OpenAI only if needed
       * - saving one GalviSight result
       * - updating HubSpot non-blockingly
       */
      if (
        GALVISIGHT_ACTIONS.has(action)
      ) {
        return await handleDiagnosticAction(
          env,
          payload,
          action,
          'GalviSight'
        );
      }

      /*
       * EXISTING GALVITRIAGE FLOW
       */
      const sessionId =
        normalizeSessionId(
          safe(
            payload,
            'session.session_id'
          )
        );

      const email =
        safe(
          payload,
          'founder.email'
        );

      const ventureName =
        safe(
          payload,
          'venture.venture_name'
        );

      if (
        !required(sessionId) ||
        !required(email) ||
        !required(ventureName)
      ) {
        return jsonResponse(
          {
            success: false,

            message:
              'Missing required fields',

            required: [
              'session.session_id',
              'founder.email',
              'venture.venture_name'
            ]
          },
          400,
          env
        );
      }

      /*
       * Prevent duplicate triage records.
       */
      const existingTriage =
        await findExistingBySession(
          env,
          TABLES.TRIAGE,
          sessionId
        );

      if (existingTriage) {
        return jsonResponse(
          {
            success: true,

            duplicate: true,

            message:
              'GalviTriage submission ' +
              'already received',

            next_screen:
              'GalviVitals',

            session_id:
              sessionId,

            existing_record_id:
              existingTriage.id
          },
          200,
          env
        );
      }

      const founder =
        await createAirtableRecord(
          env,
          TABLES.FOUNDERS,
          buildFounderFields(payload)
        );

      const venture =
        await createAirtableRecord(
          env,
          TABLES.VENTURES,
          buildVentureFields(payload)
        );

      const triage =
        await createAirtableRecord(
          env,
          TABLES.TRIAGE,
          buildTriageFields(payload)
        );

      const diagnostic =
        await createAirtableRecord(
          env,
          TABLES.DIAGNOSTIC,
          buildDiagnosticFields(payload)
        );

      const journey =
        await createAirtableRecord(
          env,
          TABLES.JOURNEY,
          buildJourneyFields(payload)
        );

      /*
       * HubSpot is non-blocking.
       *
       * Airtable/GalviCare success should
       * still return even if HubSpot fails.
       */
      const hubspot = {
        attempted: false,
        success: false,
        error: null,
        response: null
      };

      try {
        hubspot.attempted =
          env.HUBSPOT_ENABLED === 'true';

        if (hubspot.attempted) {
          hubspot.response =
            await upsertHubSpotContact(
              env,
              payload
            );

          hubspot.success = true;
        }
      } catch (hubspotError) {
        console.error(
          'HubSpot recovery failed',
          hubspotError
        );

        hubspot.error =
          hubspotError.message;
      }

      return jsonResponse(
        {
          success: true,

          duplicate: false,

          message:
            'GalviTriage submitted successfully',

          next_screen:
            'GalviVitals',

          session_id:
            sessionId,

          records: {
            founder_id:
              founder.id,

            venture_id:
              venture.id,

            triage_id:
              triage.id,

            diagnostic_id:
              diagnostic.id,

            journey_id:
              journey.id
          },

          hubspot
        },
        200,
        env
      );
    } catch (error) {
      console.error(
        'Worker submission failed',
        error
      );

      return jsonResponse(
        {
          success: false,

          message:
            'Worker submission failed',

          error:
            error.message
        },
        500,
        env
      );
    }
  }
};

