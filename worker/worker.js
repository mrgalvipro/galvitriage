

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

function jsonResponse(
  body,
  status = 200,
  env = {}
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders(env)
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
            corsHeaders(env)
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
          ]
        },
        200,
        env
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

      /*
       * GALVISHOT ACTION ROUTE
       *
       * Runs before GalviTriage
       * required-field validation.
       */
      if (
        GALVISHOT_ACTIONS.has(action)
      ) {
        return await handleDiagnosticAction(
          env,
          payload,
          action,
          'GalviShot'
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

