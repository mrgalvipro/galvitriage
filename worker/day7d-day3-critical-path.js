import day7d, {
  DAY7D_RULES_VERSION,
  clinicalFile,
  chooseFollowups
} from './day7d-engine.js';

/*
 * Day 3 critical-path compatibility layer.
 *
 * GalviScore clarification and GalviShot / GalviSight / GalviPath follow-up
 * questions are evidence intake. The score clarification action surface remains
 * owned by day7d-engine.js. Paid downstream result generation remains strictly
 * server-entitlement-gated.
 *
 * This wrapper intentionally does NOT create an entitlement, trust a URL flag,
 * trust localStorage, or generate a paid product before verified entitlement.
 */
const text = (value) => String(value ?? '').trim();
const low = (value) => text(value).toLowerCase();
const now = () => new Date().toISOString();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const run = (db, sql, ...params) => db.prepare(sql).bind(...params).run();
const SKIPPED_ANSWER = 'Skipped for now — no additional evidence supplied.';
const SCORE_ACTIONS = new Set(['get_or_generate_galviscore', 'save_galviscore_followup']);
const PRE_ENTITLEMENT_PRODUCTS = new Set(['GalviShot', 'GalviSight', 'GalviPath']);
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
      'X-Galvi-Day3-PreEntitlement-Evidence': 'active',
      ...extra
    }
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
  return chooseFollowups(
    file.reconciliation,
    file.followups_by_product?.[product] || {},
    product
  );
}

function evaluationPayload(file, product) {
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
      followups: questions,
      followup_questions: questions,
      payment_required: true,
      result_generation_locked: true,
      next_screen: product
    };
  }
  return {
    success: true,
    status: 'entitlement_required',
    session_id: file.session_id,
    product,
    confidence: file.reconciliation.confidence,
    evidence_version: file.evidence_version,
    rules_version: DAY7D_RULES_VERSION,
    followups: [],
    followup_questions: [],
    payment_required: true,
    evidence_ready: true,
    result_generation_locked: true,
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

async function handlePreEntitlementEvaluation(env, sessionId, product, action) {
  const file = await clinicalFile(env.DB, sessionId);
  return json({ action, ...evaluationPayload(file, product) });
}

async function handlePreEntitlementSave(env, sessionId, product, action, payload) {
  const beforeFile = await clinicalFile(env.DB, sessionId);
  const allowed = currentQuestions(beforeFile, product);
  const answers = payload?.payload?.answers || payload?.answers || [];
  const list = (Array.isArray(answers) ? answers : [answers]).slice(0, 3);
  if (!list.length) {
    return json({ success: false, status: 'validation_error', product, detail: 'At least one answer is required.' }, 400);
  }

  let changed = false;
  let already = true;
  for (const answer of list) {
    const saved = await saveOne(env.DB, sessionId, product, answer, allowed);
    if (saved.invalid) {
      return json({
        success: false,
        status: 'validation_error',
        product,
        detail: 'Answer does not match the server-governed follow-up bank.'
      }, 400);
    }
    changed ||= saved.changed;
    already &&= saved.already_saved === true;
  }

  const before = beforeFile.evidence_version;
  const after = changed
    ? await bumpEvidence(env.DB, sessionId, `${product}:pre_entitlement_followup_submission`)
    : await evidenceVersion(env.DB, sessionId);
  const afterFile = await clinicalFile(env.DB, sessionId);
  const evaluation = evaluationPayload(afterFile, product);

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
    paid_generation_server_verified: true
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

    const action = text(payload?.action);
    if (action === 'health_check') return augmentHealth(await day7d.fetch(request, env, ctx));

    // GalviScore clarification is always delegated to the authoritative cumulative
    // engine. This explicit route prevents a compatibility wrapper or future
    // paid-product interceptor from swallowing the score follow-up actions.
    if (SCORE_ACTIONS.has(action)) return day7d.fetch(request, env, ctx);

    const product = EVAL_ACTIONS.get(action) || SAVE_ACTIONS.get(action);
    if (!product || !PRE_ENTITLEMENT_PRODUCTS.has(product)) return day7d.fetch(request, env, ctx);
    if (!env?.DB) return json({ success: false, status: 'error', message: 'D1 binding DB is not configured' }, 500);

    const sessionId = text(payload?.session_id || payload?.session?.session_id);
    if (!sessionId) return json({ success: false, status: 'error', message: 'Missing session_id' }, 400);

    if (await entitled(env.DB, sessionId, product)) {
      return day7d.fetch(request, env, ctx);
    }

    try {
      if (EVAL_ACTIONS.has(action)) {
        return await handlePreEntitlementEvaluation(env, sessionId, product, action);
      }
      return await handlePreEntitlementSave(env, sessionId, product, action, payload);
    } catch (error) {
      console.error('Day 3 pre-entitlement evidence path', action, error?.stack || error);
      return json({
        success: false,
        status: 'error',
        action,
        product,
        error_code: 'DAY3_PRE_ENTITLEMENT_EVIDENCE_ERROR',
        message: 'Customer evidence could not be saved safely before entitlement.',
        detail: String(error?.message || error)
      }, 500);
    }
  }
};
