import day7d, {
  DAY7D_RULES_VERSION,
  clinicalFile,
  chooseFollowups
} from './day7d-engine.js';

/*
 * Day 3 critical-path customer API compatibility layer.
 *
 * P0 invariants:
 * - GalviScore clarification and downstream GalviShot / GalviSight / GalviPath
 *   questions are evidence intake and must never disappear merely because
 *   deterministic/reconciliation confidence is high.
 * - GalviScore keeps its one targeted clarification question.
 * - GalviShot / GalviSight / GalviPath each require three bounded, server-owned,
 *   non-repeating targeted questions before that stage can generate a result.
 * - Answers are versioned pre-entitlement evidence. Paid generation remains server-entitlement-gated.
 * - Browser/legacy action aliases are normalized here so a known customer action
 *   never falls through to the legacy UNSUPPORTED_API_ACTION router.
 */
const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();
const now = () => new Date().toISOString();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const run = (db, sql, ...params) => db.prepare(sql).bind(...params).run();
const SKIPPED_ANSWER = 'Skipped for now — no additional evidence supplied.';
const DOWNSTREAM_REQUIRED_QUESTION_COUNT = 3;
const PRE_ENTITLEMENT_PRODUCTS = new Set(['GalviShot', 'GalviSight', 'GalviPath']);

const ACTION_ALIASES = new Map([
  ['get_or_create_galviscore', 'get_or_generate_galviscore'],
  ['get_galviscore', 'get_or_generate_galviscore'],
  ['generate_galviscore', 'get_or_generate_galviscore'],
  ['get_or_generate_galvishot', 'get_or_create_galvishot'],
  ['get_galvishot', 'get_or_create_galvishot'],
  ['generate_galvishot', 'get_or_create_galvishot'],
  ['get_or_create_galvisight', 'get_or_generate_galvisight'],
  ['get_galvisight', 'get_or_generate_galvisight'],
  ['generate_galvisight', 'get_or_generate_galvisight'],
  ['get_or_create_galvipath', 'get_or_generate_galvipath'],
  ['generate_galvipath', 'get_or_generate_galvipath'],
  ['save_galvishot_followups', 'save_galvishot_followup'],
  ['save_galvisight_followups', 'save_galvisight_followup'],
  ['save_galvipath_followups', 'save_galvipath_followup']
]);

const SCORE_ACTIONS = new Set([
  'evaluate_galviscore',
  'get_or_generate_galviscore',
  'save_galviscore_followup'
]);
const EVAL_ACTIONS = new Map([
  ['evaluate_galvishot', 'GalviShot'],
  ['evaluate_galvisight_readiness', 'GalviSight'],
  ['evaluate_galvisight', 'GalviSight'],
  ['evaluate_galvipath', 'GalviPath']
]);
const SAVE_ACTIONS = new Map([
  ['save_galvishot_followup', 'GalviShot'],
  ['save_galvisight_followup', 'GalviSight'],
  ['save_galvipath_followup', 'GalviPath']
]);
const GET_ACTIONS = new Map([
  ['get_or_create_galvishot', 'GalviShot'],
  ['get_or_generate_galvisight', 'GalviSight'],
  ['get_or_generate_galvipath', 'GalviPath'],
  ['get_galvipath', 'GalviPath']
]);
const CANONICAL_GET_ACTION = {
  GalviShot: 'get_or_create_galvishot',
  GalviSight: 'get_or_generate_galvisight',
  GalviPath: 'get_or_generate_galvipath'
};

function canonicalAction(value) {
  const action = text(value);
  return ACTION_ALIASES.get(action) || action;
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
      'X-Galvi-Day7D-Rules': DAY7D_RULES_VERSION,
      'X-Galvi-Day3-Question-Contract': 'score-1-downstream-3',
      'X-Galvi-Day3-PreEntitlement-Evidence': 'active',
      ...extra
    }
  });
}

function forwardedRequest(request, payload, action) {
  if (text(payload?.action) === action) return request;
  const headers = new Headers(request.headers);
  headers.set('Content-Type', 'application/json');
  return new Request(request.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, action })
  });
}

async function entitled(db, sessionId, product) {
  const entitlement = await first(
    db,
    'SELECT entitlement_status FROM entitlements WHERE session_id=? AND product=? LIMIT 1',
    sessionId,
    product
  );
  if (entitlement && ['active', 'paid', 'granted', 'test_override'].includes(low(entitlement.entitlement_status))) {
    return true;
  }
  const payment = await first(
    db,
    'SELECT payment_status FROM payments WHERE session_id=? AND product=? LIMIT 1',
    sessionId,
    product
  );
  return Boolean(payment && ['paid', 'succeeded', 'complete'].includes(low(payment.payment_status)));
}

async function evidenceVersion(db, sessionId) {
  const row = await first(db, 'SELECT evidence_version FROM clinical_evidence_versions WHERE session_id=?', sessionId);
  return Number(row?.evidence_version || 0);
}

async function bumpEvidence(db, sessionId, reason) {
  const timestamp = now();
  const existing = await first(db, 'SELECT evidence_version FROM clinical_evidence_versions WHERE session_id=?', sessionId);
  if (existing) {
    await run(
      db,
      'UPDATE clinical_evidence_versions SET evidence_version=?,last_reason=?,updated_at=? WHERE session_id=?',
      Number(existing.evidence_version || 0) + 1,
      reason,
      timestamp,
      sessionId
    );
  } else {
    await run(
      db,
      'INSERT INTO clinical_evidence_versions(session_id,evidence_version,last_reason,updated_at) VALUES(?,?,?,?)',
      sessionId,
      1,
      reason,
      timestamp
    );
  }
  return evidenceVersion(db, sessionId);
}

function currentQuestions(file, product) {
  const existing = file.followups_by_product?.[product] || {};
  if (product === 'GalviScore') {
    return chooseFollowups(file.reconciliation, existing, product);
  }

  const evidenceIntakeReconciliation = {
    ...file.reconciliation,
    confidence: Math.min(59, Number(file.reconciliation?.confidence || 0))
  };
  return chooseFollowups(evidenceIntakeReconciliation, existing, product)
    .slice(0, DOWNSTREAM_REQUIRED_QUESTION_COUNT);
}

function evaluationPayload(file, product, hasEntitlement = false) {
  const questions = currentQuestions(file, product);
  if (questions.length) {
    return {
      success: true,
      status: 'needs_followup',
      session_id: file.session_id,
      product,
      confidence: file.reconciliation.confidence,
      evidence_version: file.evidence_version,
      rules_version: DAY7D_RULES_VERSION,
      required_question_count: product === 'GalviScore' ? 1 : DOWNSTREAM_REQUIRED_QUESTION_COUNT,
      questions_remaining: questions.length,
      followups: questions,
      followup_questions: questions,
      payment_required: product === 'GalviScore' ? !hasEntitlement : true,
      result_generation_locked: true,
      next_screen: product
    };
  }

  if (!hasEntitlement) {
    return {
      success: true,
      status: 'entitlement_required',
      session_id: file.session_id,
      product,
      confidence: file.reconciliation.confidence,
      evidence_version: file.evidence_version,
      rules_version: DAY7D_RULES_VERSION,
      required_question_count: product === 'GalviScore' ? 1 : DOWNSTREAM_REQUIRED_QUESTION_COUNT,
      questions_remaining: 0,
      followups: [],
      followup_questions: [],
      payment_required: true,
      evidence_ready: true,
      result_generation_locked: true,
      next_screen: product
    };
  }

  return {
    success: true,
    status: 'evidence_ready',
    session_id: file.session_id,
    product,
    confidence: file.reconciliation.confidence,
    evidence_version: file.evidence_version,
    rules_version: DAY7D_RULES_VERSION,
    required_question_count: product === 'GalviScore' ? 1 : DOWNSTREAM_REQUIRED_QUESTION_COUNT,
    questions_remaining: 0,
    followups: [],
    followup_questions: [],
    payment_required: false,
    evidence_ready: true,
    result_generation_locked: false,
    next_screen: product
  };
}

async function saveOne(db, sessionId, product, input, allowed) {
  const questionId = text(input?.question_id || input?.question_code).slice(0, 80);
  const answer = text(input?.answer || input?.answer_text).slice(0, 1000);
  const selected = allowed.find((item) => item.question_id === questionId || item.question_code === questionId);
  if (!questionId || !answer || !selected) {
    return { invalid: true, changed: false };
  }

  const skipped = input?.skipped === true || answer === SKIPPED_ANSWER;
  const impact = skipped ? 0 : Number(input?.confidence_impact ?? selected.confidence_impact ?? 10);
  const questionText = text(selected.question_text || selected.question).slice(0, 500);
  const existing = await first(
    db,
    'SELECT followup_id,answer,confidence_impact FROM clinical_followups WHERE session_id=? AND product=? AND question_id=? LIMIT 1',
    sessionId,
    product,
    questionId
  );

  if (text(existing?.answer) === answer && Number(existing?.confidence_impact || 0) === impact) {
    return { invalid: false, changed: false, already_saved: true };
  }

  const timestamp = now();
  if (existing?.followup_id) {
    await run(
      db,
      'UPDATE clinical_followups SET current_stage=?,question_text=?,answer=?,confidence_impact=?,updated_at=? WHERE followup_id=?',
      product,
      questionText,
      answer,
      impact,
      timestamp,
      existing.followup_id
    );
  } else {
    await run(
      db,
      'INSERT INTO clinical_followups(followup_id,session_id,current_stage,product,question_id,question_text,answer,confidence_impact,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
      `followup_${sessionId}_${product}_${questionId}`,
      sessionId,
      product,
      product,
      questionId,
      questionText,
      answer,
      impact,
      timestamp,
      timestamp
    );
  }
  return { invalid: false, changed: true, already_saved: false };
}

async function handleEvaluation(env, sessionId, product, action, hasEntitlement) {
  const file = await clinicalFile(env.DB, sessionId);
  return json({ action, ...evaluationPayload(file, product, hasEntitlement) });
}

async function handleSave(env, sessionId, product, action, payload, hasEntitlement, request, ctx) {
  const beforeFile = await clinicalFile(env.DB, sessionId);
  const allowed = currentQuestions(beforeFile, product);
  const answers = payload?.payload?.answers || payload?.answers || [];
  const list = (Array.isArray(answers) ? answers : [answers]).slice(0, DOWNSTREAM_REQUIRED_QUESTION_COUNT);
  if (!list.length) {
    return json({ success: false, status: 'validation_error', product, detail: 'At least one answer is required.' }, 400);
  }

  let changed = false;
  let already = true;
  for (const answer of list) {
    const saved = await saveOne(env.DB, sessionId, product, answer, allowed);
    if (saved.invalid) {
      return json({ success: false, status: 'validation_error', product, detail: 'Answer does not match the server-governed follow-up bank.' }, 400);
    }
    changed ||= saved.changed;
    already &&= saved.already_saved === true;
  }

  const before = beforeFile.evidence_version;
  const after = changed
    ? await bumpEvidence(env.DB, sessionId, `${product}:required_customer_context_submission`)
    : await evidenceVersion(env.DB, sessionId);
  const afterFile = await clinicalFile(env.DB, sessionId);
  const evaluation = evaluationPayload(afterFile, product, hasEntitlement);

  if (evaluation.status === 'needs_followup' || evaluation.status === 'entitlement_required') {
    return json({
      action,
      ...evaluation,
      evaluation,
      save_status: already ? 'already_saved' : 'saved',
      evidence_version_before: before,
      evidence_version: after,
      evidence_version_bumped: after > before,
      evidence_saved: true,
      paid_result_generated: false
    });
  }

  const getAction = CANONICAL_GET_ACTION[product];
  const generationRequest = forwardedRequest(request, { ...payload, payload: {}, session_id: sessionId }, getAction);
  const generated = await day7d.fetch(generationRequest, env, ctx);
  let generatedBody = {};
  try { generatedBody = await generated.clone().json(); } catch {}
  if (!generated.ok || generatedBody?.success === false) return generated;

  return json({
    action,
    ...generatedBody,
    evaluation,
    save_status: already ? 'already_saved' : 'saved',
    evidence_version_before: before,
    evidence_version: after,
    evidence_version_bumped: after > before,
    evidence_saved: true,
    paid_result_generated: true
  }, generated.status);
}

async function augmentHealth(response) {
  let body = {};
  try { body = await response.clone().json(); } catch { return response; }
  if (!body?.day7d) return response;
  body.day7d = {
    ...body.day7d,
    entrypoint: 'worker/day7d-day3-critical-path.js',
    score_clarification_action_surface: true,
    score_clarification_get_action: 'get_or_generate_galviscore',
    score_clarification_save_action: 'save_galviscore_followup',
    pre_entitlement_evidence_capture: true,
    paid_generation_server_verified: true,
    browser_api_alias_normalization: true,
    downstream_required_question_count: DOWNSTREAM_REQUIRED_QUESTION_COUNT,
    downstream_questions_always_collect_customer_context: true
  };
  return json(body, response.status);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return day7d.fetch(request, env, ctx);
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api') return day7d.fetch(request, env, ctx);

    let payload;
    try { payload = await request.clone().json(); }
    catch { return day7d.fetch(request, env, ctx); }

    const rawAction = text(payload?.action);
    const action = canonicalAction(rawAction);
    const routed = forwardedRequest(request, payload, action);

    if (action === 'health_check') return augmentHealth(await day7d.fetch(routed, env, ctx));
    if (SCORE_ACTIONS.has(action)) return day7d.fetch(routed, env, ctx);

    const product = EVAL_ACTIONS.get(action) || SAVE_ACTIONS.get(action) || GET_ACTIONS.get(action);
    if (!product || !PRE_ENTITLEMENT_PRODUCTS.has(product)) return day7d.fetch(routed, env, ctx);
    if (!env?.DB) return json({ success: false, status: 'error', message: 'D1 binding DB is not configured' }, 500);

    const sessionId = text(payload?.session_id || payload?.session?.session_id);
    if (!sessionId) return json({ success: false, status: 'error', message: 'Missing session_id' }, 400);

    try {
      let hasEntitlement = false;
      if (await entitled(env.DB, sessionId, product)) {
        hasEntitlement = true;
      }

      if (EVAL_ACTIONS.has(action)) {
        return await handleEvaluation(env, sessionId, product, action, hasEntitlement);
      }

      if (SAVE_ACTIONS.has(action)) {
        return await handleSave(env, sessionId, product, action, payload, hasEntitlement, routed, ctx);
      }

      const file = await clinicalFile(env.DB, sessionId);
      const evaluation = evaluationPayload(file, product, hasEntitlement);
      if (evaluation.status === 'needs_followup') {
        return json({ action, ...evaluation });
      }
      if (!hasEntitlement) {
        return json({ action, ...evaluation }, 200);
      }

      const canonicalGet = CANONICAL_GET_ACTION[product];
      return day7d.fetch(forwardedRequest(routed, { ...payload, action, session_id: sessionId }, canonicalGet), env, ctx);
    } catch (error) {
      console.error('Day 3 customer evidence/API path', action, error?.stack || error);
      return json({
        success: false,
        status: 'error',
        action,
        requested_action: rawAction,
        product,
        error_code: 'DAY3_CUSTOMER_API_EVIDENCE_ERROR',
        message: 'Customer evidence could not be processed safely.',
        detail: String(error?.message || error)
      }, 500);
    }
  }
};
