import fs from 'node:fs';
import path from 'node:path';

const base = String(process.env.DAY3_BASE_URL || '').replace(/\/$/, '');
const origin = process.env.DAY3_ALLOWED_ORIGIN || 'https://galvipro.com';
const suffix = String(process.env.DAY3_RUN_SUFFIX || Date.now()).replace(/[^A-Za-z0-9._-]/g, '_').toLowerCase();
const evidencePath = process.env.DAY3_EVIDENCE_PATH || `release-evidence/day3/h3-1-through-h3-13-${suffix}.json`;
if (!base) throw new Error('DAY3_BASE_URL is required.');

const evidence = { day: 3, run_suffix: suffix, base_url: base, origin, started_at: new Date().toISOString(), steps: [] };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function requestHeaders(step, { body, key, role, actorId } = {}) {
  const headers = new Headers({
    Origin: origin,
    'Cache-Control': 'no-cache',
    'X-Correlation-Id': `corr_d3_${suffix}_${step.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
  });
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (key) headers.set('Idempotency-Key', key);
  if (role) headers.set('X-Galvi-Role', role);
  if (actorId) headers.set('X-Galvi-Actor-Id', actorId);
  headers.set('X-GalviVault-Actor-Id', actorId || 'galvivault_day3_qa_harness');
  headers.set('X-GalviVault-Actor-Type', role === 'operator' || role === 'admin' ? 'operator' : 'qa_fixture');
  return headers;
}

async function parsePayload(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { non_json_response: text.slice(0, 500) };
  }
}

async function request(step, pathname, { method = 'GET', body, key, role, actorId, expected = [200] } = {}) {
  const headers = requestHeaders(step, { body, key, role, actorId });
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers,
    cache: 'no-store',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const payload = await parsePayload(response);
  const record = {
    step,
    timestamp: new Date().toISOString(),
    method,
    path: pathname,
    status: response.status,
    correlation_id: response.headers.get('x-correlation-id'),
    environment: response.headers.get('x-galvivault-environment'),
    request: body ?? null,
    response: payload
  };
  evidence.steps.push(record);
  assert(expected.includes(response.status), `${step}: expected ${expected.join('/')} but received ${response.status}: ${JSON.stringify(payload)}`);
  assert(record.environment === 'qa', `${step}: expected QA environment`);
  assert(record.correlation_id, `${step}: missing correlation ID`);
  return { response, payload, record };
}

async function waitForDay3Runtime(step, { maxAttempts = 40, consecutivePasses = 3 } = {}) {
  let consecutive = 0;
  let last = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const probeStep = `${step}_PROBE_${attempt}`;
    const probePath = `/api/v1/day3/readiness?run=${encodeURIComponent(suffix)}&probe=${attempt}`;
    const headers = requestHeaders(probeStep);
    const response = await fetch(`${base}${probePath}`, { method: 'GET', headers, cache: 'no-store' });
    const payload = await parsePayload(response);
    const record = {
      step: probeStep,
      timestamp: new Date().toISOString(),
      method: 'GET',
      path: probePath,
      status: response.status,
      correlation_id: response.headers.get('x-correlation-id'),
      environment: response.headers.get('x-galvivault-environment'),
      request: null,
      response: payload
    };
    evidence.steps.push(record);
    last = record;

    const currentSchema = payload?.data?.current_schema_version;
    const envelopeSchema = payload?.meta?.schema_version;
    const valid = response.status === 200 &&
      record.environment === 'qa' &&
      Boolean(record.correlation_id) &&
      payload?.success === true &&
      payload?.data?.ready === true &&
      currentSchema === '0003' &&
      envelopeSchema === '0003';

    consecutive = valid ? consecutive + 1 : 0;
    if (consecutive >= consecutivePasses) return { response, payload, record };
    await sleep(1500);
  }
  throw new Error(`${step}: Day 3 runtime did not converge through the Node/H3 client after ${maxAttempts} probes. Last response: ${JSON.stringify(last)}`);
}

function identity(result) {
  const item = result.payload?.data?.identity;
  assert(item, 'Canonical identity set is missing.');
  return {
    founder_id: item.founder?.founder_id,
    venture_id: item.venture?.venture_id,
    bmr_id: item.business_medical_record?.bmr_id,
    session_id: item.session?.session_id,
    identity: item
  };
}

try {
  // Cloudflare deployment propagation can briefly expose the prior Day 1/2 Worker on one edge
  // even after a curl probe reaches Day 3. Require three consecutive Day 3 responses through
  // the exact Node/H3 client before any state-changing Human E2E command is allowed to run.
  const ready = await waitForDay3Runtime('H3.0_READINESS');
  assert(ready.payload?.data?.ready === true, 'Day 3 readiness is false.');
  assert(ready.payload?.data?.current_schema_version === '0003', 'Schema 0003 is not active.');

  const identityBody = {
    client_session_key: `d3-session-${suffix}-01`, source: 'galvivault', current_stage: 'GalviTriage',
    founder: { email: `founder.day3.${suffix}@example.test`, first_name: 'Day', last_name: 'Three', consent_status: 'approved' },
    venture: { venture_name: `Day 3 Evidence Venture ${suffix}`, stage: 'validation', industry: 'business-services', role_code: 'founder', is_primary: true }
  };
  const idResult = await request('H3.1_IDENTITY_PRECONDITION', '/api/v1/sessions', { method: 'POST', body: identityBody, key: `d3-identity-${suffix}`, expected: [201] });
  const first = identity(idResult);
  for (const [name, value] of Object.entries(first)) if (name !== 'identity') assert(value, `H3.1: ${name} missing`);

  const capturedAt = new Date().toISOString();
  const answerBody = {
    bmr_id: first.bmr_id, session_id: first.session_id,
    source_type: 'assessment_answer', source_ref: `triage.problem_clarity:v1:${suffix}`,
    value_type: 'number', value_number: 72, consent_status: 'approved', captured_at: capturedAt,
    assessment_answer: { question_id: 'triage.problem_clarity', question_version: 'v1', raw_value_number: 72, normalized_value_number: 72, confidence_effect: 0.2 }
  };
  const submitKey = `d3-answer-${suffix}`;
  const h31 = await request('H3.1_SUBMIT_ANSWER_EVIDENCE', '/api/v1/evidence', { method: 'POST', body: answerBody, key: submitKey, expected: [201] });
  const evidenceV1 = h31.payload?.data?.evidence;
  const answerV1 = h31.payload?.data?.answer;
  assert(evidenceV1?.evidence_id && evidenceV1?.evidence_group_id && Number(evidenceV1.version_no) === 1, 'H3.1 evidence v1 invalid');
  assert(answerV1?.answer_id && answerV1?.answer_group_id && Number(answerV1.version_no) === 1, 'H3.1 answer v1 invalid');

  const h32 = await request('H3.2_EXACT_REPLAY', '/api/v1/evidence', { method: 'POST', body: answerBody, key: submitKey, expected: [200] });
  assert(h32.payload?.meta?.idempotent_replay === true, 'H3.2 idempotent replay flag missing');
  assert(h32.payload?.data?.evidence?.evidence_id === evidenceV1.evidence_id, 'H3.2 evidence ID changed');

  const h33 = await request('H3.3_REFRESH_RETRIEVAL', `/api/v1/evidence/${evidenceV1.evidence_id}`);
  assert(h33.payload?.data?.evidence?.content_hash === evidenceV1.content_hash, 'H3.3 content hash changed');

  const acceptKey = `d3-accept-${suffix}`;
  const h34 = await request('H3.4_ACCEPT', `/api/v1/evidence/${evidenceV1.evidence_id}/accept`, { method: 'POST', body: { reason: 'qa_acceptance' }, key: acceptKey, role: 'operator', actorId: 'day3_qa_operator', expected: [200] });
  assert(h34.payload?.data?.evidence?.status === 'accepted', 'H3.4 evidence not accepted');
  assert(h34.payload?.data?.evidence?.content_hash === evidenceV1.content_hash, 'H3.4 content hash changed during acceptance');

  const h35 = await request('H3.5_ACCEPTED_MUTATION_REJECTED', `/api/v1/evidence/${evidenceV1.evidence_id}`, { method: 'PATCH', body: { value_number: 99 }, role: 'operator', actorId: 'day3_qa_operator', expected: [409] });
  assert(h35.payload?.error?.code === 'GV_EVIDENCE_IMMUTABLE', 'H3.5 wrong immutability error');

  const correctionBody = {
    value_type: 'number', value_number: 81, captured_at: new Date().toISOString(), consent_status: 'approved', correction_reason: 'Founder clarified quantified evidence.',
    assessment_answer: { raw_value_number: 81, normalized_value_number: 81, confidence_effect: 0.3 }
  };
  const h36 = await request('H3.6_SUPERSEDE', `/api/v1/evidence/${evidenceV1.evidence_id}/supersede`, { method: 'POST', body: correctionBody, key: `d3-supersede-${suffix}`, role: 'operator', actorId: 'day3_qa_operator', expected: [201] });
  const evidenceV2 = h36.payload?.data?.evidence;
  const answerV2 = h36.payload?.data?.answer;
  assert(Number(evidenceV2?.version_no) === 2 && evidenceV2?.supersedes_evidence_id === evidenceV1.evidence_id, 'H3.6 evidence v2 lineage invalid');
  assert(Number(answerV2?.version_no) === 2 && answerV2?.supersedes_answer_id === answerV1.answer_id, 'H3.6 answer v2 lineage invalid');

  const h37current = await request('H3.7_CURRENT', `/api/v1/business-medical-records/${first.bmr_id}/evidence?view=current`);
  assert(h37current.payload?.data?.evidence?.some((item) => item.evidence_id === evidenceV2.evidence_id), 'H3.7 v2 not current');
  assert(!h37current.payload?.data?.evidence?.some((item) => item.evidence_id === evidenceV1.evidence_id), 'H3.7 v1 incorrectly current');
  const h37history = await request('H3.7_HISTORY', `/api/v1/business-medical-records/${first.bmr_id}/evidence?view=history`);
  assert(h37history.payload?.data?.evidence?.some((item) => item.evidence_id === evidenceV1.evidence_id), 'H3.7 v1 missing from history');
  assert(h37history.payload?.data?.evidence?.some((item) => item.evidence_id === evidenceV2.evidence_id), 'H3.7 v2 missing from history');

  const rejectBody = { bmr_id: first.bmr_id, session_id: first.session_id, source_type: 'facilitator_capture', source_ref: `reject:${suffix}`, value_type: 'text', value_text: 'Synthetic draft evidence for rejection.', consent_status: 'approved', captured_at: new Date().toISOString() };
  const rejectCreate = await request('H3.8_CREATE_REJECTABLE_DRAFT', '/api/v1/evidence', { method: 'POST', body: rejectBody, key: `d3-reject-create-${suffix}`, expected: [201] });
  const rejectId = rejectCreate.payload?.data?.evidence?.evidence_id;
  const h38 = await request('H3.8_REJECT_DRAFT', `/api/v1/evidence/${rejectId}/reject`, { method: 'POST', body: { reason: 'Synthetic QA rejection' }, key: `d3-reject-${suffix}`, role: 'operator', actorId: 'day3_qa_operator', expected: [200] });
  assert(h38.payload?.data?.evidence?.status === 'rejected', 'H3.8 draft not rejected');

  const secondBody = {
    client_session_key: `d3-session-${suffix}-02`, source: 'galvivault', current_stage: 'GalviTriage',
    founder: { founder_id: first.founder_id, email: identityBody.founder.email },
    venture: { venture_name: `Day 3 Second Venture ${suffix}`, stage: 'ideation', role_code: 'founder', is_primary: true }
  };
  const secondResult = await request('H3.9_CREATE_SECOND_SCOPE', '/api/v1/sessions', { method: 'POST', body: secondBody, key: `d3-second-${suffix}`, expected: [201] });
  const second = identity(secondResult);
  const crossBody = { ...rejectBody, source_ref: `cross:${suffix}`, bmr_id: first.bmr_id, session_id: second.session_id };
  const h39 = await request('H3.9_CROSS_SCOPE_REJECTED', '/api/v1/evidence', { method: 'POST', body: crossBody, key: `d3-cross-${suffix}`, expected: [403] });
  assert(h39.payload?.error?.code === 'GV_AUTH_FORBIDDEN', 'H3.9 wrong cross-scope error');

  const unauth = await request('H3.10_UNAUTHORIZED_ACCEPT', `/api/v1/evidence/${evidenceV2.evidence_id}/accept`, { method: 'POST', body: { reason: 'unauthorized' }, key: `d3-unauth-${suffix}`, expected: [403] });
  assert(unauth.payload?.error?.code === 'GV_AUTH_FORBIDDEN', 'H3.10 unauthorized operation was not rejected');

  const mismatchBody = { ...answerBody, value_number: 73, assessment_answer: { ...answerBody.assessment_answer, raw_value_number: 73, normalized_value_number: 73 } };
  const h311 = await request('H3.11_IDEMPOTENCY_MISMATCH', '/api/v1/evidence', { method: 'POST', body: mismatchBody, key: submitKey, expected: [409] });
  assert(h311.payload?.error?.code === 'GV_IDEMPOTENCY_REUSE_MISMATCH', 'H3.11 wrong idempotency mismatch error');

  const batchResult = await request('H3.12_IMPORT_BATCH', '/api/v1/import-batches', { method: 'POST', body: { source_name: `day3-fixture-${suffix}.json`, source_checksum: `sha256:${suffix}`, expected_count: 3 }, key: `d3-batch-${suffix}`, role: 'import', actorId: 'day3_qa_importer', expected: [201] });
  const batchId = batchResult.payload?.data?.batch?.import_batch_id;
  assert(batchId, 'H3.12 import batch ID missing');
  const importCommand = { bmr_id: first.bmr_id, session_id: first.session_id, value_type: 'text', value_text: 'Synthetic imported evidence.', consent_status: 'approved', captured_at: new Date().toISOString() };
  const row1 = await request('H3.12_IMPORT_VALID', `/api/v1/import-batches/${batchId}/rows`, { method: 'POST', body: { source_row_key: 'R1', command: importCommand }, role: 'import', actorId: 'day3_qa_importer', expected: [200] });
  assert(row1.payload?.data?.row?.result === 'imported', 'H3.12 R1 not imported');
  const row2 = await request('H3.12_IMPORT_DUPLICATE', `/api/v1/import-batches/${batchId}/rows`, { method: 'POST', body: { source_row_key: 'R2', command: importCommand }, role: 'import', actorId: 'day3_qa_importer', expected: [200] });
  assert(row2.payload?.data?.row?.result === 'skipped', 'H3.12 R2 not skipped');
  const row3 = await request('H3.12_IMPORT_INVALID', `/api/v1/import-batches/${batchId}/rows`, { method: 'POST', body: { source_row_key: 'R3', command: { bmr_id: first.bmr_id, session_id: first.session_id, value_type: 'number', value_text: 'not-a-number' } }, role: 'import', actorId: 'day3_qa_importer', expected: [200] });
  assert(row3.payload?.data?.row?.result === 'error', 'H3.12 R3 not quarantined');
  const close = await request('H3.12_IMPORT_RECONCILE', `/api/v1/import-batches/${batchId}/close`, { method: 'POST', body: {}, key: `d3-close-${suffix}`, role: 'import', actorId: 'day3_qa_importer', expected: [200] });
  const batch = close.payload?.data?.batch;
  assert(Number(batch?.processed_count) === 3 && Number(batch?.imported_count) === 1 && Number(batch?.skipped_count) === 1 && Number(batch?.error_count) === 1, 'H3.12 import counts do not reconcile');
  assert(batch?.status === 'completed_with_errors' && close.payload?.data?.reconciled === true, 'H3.12 final batch status invalid');

  const h313 = await waitForDay3Runtime('H3.13_FINAL_READINESS', { maxAttempts: 10, consecutivePasses: 2 });
  assert(h313.payload?.data?.ready === true, 'H3.13 final readiness failed');

  evidence.canonical_ids = { founder_id: first.founder_id, venture_id: first.venture_id, bmr_id: first.bmr_id, session_id: first.session_id, answer_v1_id: answerV1.answer_id, answer_v2_id: answerV2.answer_id, evidence_v1_id: evidenceV1.evidence_id, evidence_v2_id: evidenceV2.evidence_id, rejected_evidence_id: rejectId, import_batch_id: batchId };
  evidence.hashes = { evidence_v1: evidenceV1.content_hash, accepted_v1: h34.payload?.data?.evidence?.content_hash, evidence_v2: evidenceV2.content_hash };
  evidence.import_reconciliation = { processed: Number(batch.processed_count), imported: Number(batch.imported_count), skipped: Number(batch.skipped_count), errors: Number(batch.error_count), status: batch.status, reconciled: true };
  evidence.h3_1_through_h3_13 = 'PASS';
  evidence.production_regression = 'WORKFLOW_SOURCE_AND_HTTP_PROOF_REQUIRED';
  evidence.completed_at = new Date().toISOString();
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
  console.log(`PASS: H3.1-H3.13 synthetic QA execution complete. Evidence: ${evidencePath}`);
} catch (error) {
  evidence.result = 'FAIL';
  evidence.completed_at = new Date().toISOString();
  evidence.error = { message: error.message, stack: error.stack };
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(error);
  process.exit(1);
}
