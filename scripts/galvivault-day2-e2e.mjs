import fs from 'node:fs';
import path from 'node:path';

const base = String(process.env.DAY2_BASE_URL || '').replace(/\/$/, '');
const origin = process.env.DAY2_ALLOWED_ORIGIN || 'https://galvipro.com';
const suffix = String(process.env.DAY2_RUN_SUFFIX || Date.now()).replace(/[^A-Za-z0-9._-]/g, '_').toLowerCase();
const evidencePath = process.env.DAY2_EVIDENCE_PATH || `release-evidence/day2/e2e-${suffix}.json`;

if (!base) {
  console.error('DAY2_BASE_URL is required.');
  process.exit(1);
}

const evidence = {
  day: 2,
  run_suffix: suffix,
  base_url: base,
  origin,
  started_at: new Date().toISOString(),
  steps: []
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(step, pathname, {
  method = 'GET',
  body,
  key,
  expected = [200],
  correlation = `corr_d2_${suffix}_${step.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
} = {}) {
  const headers = new Headers({
    Origin: origin,
    'X-Correlation-Id': correlation,
    'X-GalviVault-Actor-Id': 'galvivault_day2_human_evidence',
    'X-GalviVault-Actor-Type': 'qa_fixture'
  });
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (key) headers.set('Idempotency-Key', key);
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const payload = response.status === 204 ? null : await response.json();
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
  assert(expected.includes(response.status), `${step}: expected ${expected.join('/')} but received ${response.status}`);
  assert(record.environment === 'qa', `${step}: expected QA environment header`);
  assert(record.correlation_id, `${step}: correlation ID missing`);
  return { response, payload, record };
}

function ids(result) {
  const identity = result.payload?.data?.identity;
  assert(identity, 'Canonical identity set is missing.');
  return {
    founder_id: identity.founder?.founder_id,
    venture_id: identity.venture?.venture_id,
    bmr_id: identity.business_medical_record?.bmr_id,
    session_id: identity.session?.session_id,
    founder_version: identity.founder?.record_version,
    venture_version: identity.venture?.record_version,
    bmr_version: identity.business_medical_record?.record_version,
    identity
  };
}

try {
  const readiness = await request('PRECONDITION_DAY2_READINESS', '/api/v1/day2/readiness');
  assert(readiness.payload?.data?.ready === true, 'Day 2 readiness is false.');
  assert(readiness.payload?.data?.current_schema_version === '0002', 'Schema 0002 is not active.');

  const newBody = {
    client_session_key: `d2-session-${suffix}-01`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: {
      email: `founder.day2.${suffix}@example.test`,
      first_name: 'Day',
      last_name: 'Two',
      consent_status: 'approved'
    },
    venture: {
      venture_name: `Day 2 Canonical Venture ${suffix}`,
      stage: 'ideation',
      industry: 'business-services',
      role_code: 'founder',
      is_primary: true
    }
  };

  const h21 = await request('H2.1_NEW_IDENTITY', '/api/v1/sessions', {
    method: 'POST', body: newBody, key: `d2-new-${suffix}`, expected: [201]
  });
  const first = ids(h21);
  for (const [name, value] of Object.entries({
    founder_id: first.founder_id,
    venture_id: first.venture_id,
    bmr_id: first.bmr_id,
    session_id: first.session_id
  })) assert(value, `H2.1: ${name} missing`);

  const h22 = await request('H2.2_EXACT_RETRY', '/api/v1/sessions', {
    method: 'POST', body: newBody, key: `d2-new-${suffix}`, expected: [200]
  });
  const retry = ids(h22);
  assert(h22.payload?.meta?.idempotent_replay === true, 'H2.2: idempotent_replay is not true.');
  assert(JSON.stringify(retry.identity) === JSON.stringify(first.identity), 'H2.2: identity set changed on exact replay.');

  const h23 = await request('H2.3_REFRESH_RETRIEVAL', `/api/v1/sessions/${first.session_id}`);
  const refresh = ids(h23);
  assert(refresh.founder_id === first.founder_id, 'H2.3: Founder changed.');
  assert(refresh.venture_id === first.venture_id, 'H2.3: Venture changed.');
  assert(refresh.bmr_id === first.bmr_id, 'H2.3: BMR changed.');

  const newSessionBody = {
    client_session_key: `d2-session-${suffix}-02`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: { founder_id: first.founder_id, email: newBody.founder.email },
    venture: { venture_id: first.venture_id, role_code: 'founder' },
    bmr_id: first.bmr_id
  };
  const h24 = await request('H2.4_NEW_SESSION', '/api/v1/sessions', {
    method: 'POST', body: newSessionBody, key: `d2-new-session-${suffix}`, expected: [201]
  });
  const secondSession = ids(h24);
  assert(secondSession.founder_id === first.founder_id, 'H2.4: Founder changed.');
  assert(secondSession.venture_id === first.venture_id, 'H2.4: Venture changed.');
  assert(secondSession.bmr_id === first.bmr_id, 'H2.4: BMR changed.');
  assert(secondSession.session_id !== first.session_id, 'H2.4: Session did not change.');

  const h25 = await request('H2.5_PROFILE_CORRECTION', `/api/v1/ventures/${first.venture_id}`, {
    method: 'PATCH',
    key: `d2-update-${suffix}`,
    body: {
      expected_version: first.venture_version,
      venture_name: `Day 2 Canonical Venture Corrected ${suffix}`,
      stage: 'validation',
      source: 'operator'
    },
    expected: [200]
  });
  assert(h25.payload?.data?.venture?.venture_id === first.venture_id, 'H2.5: venture_id changed.');
  assert(h25.payload?.data?.bmr_id === first.bmr_id, 'H2.5: bmr_id changed.');
  assert(Number(h25.payload?.data?.venture?.record_version) === Number(first.venture_version) + 1, 'H2.5: version did not increment once.');

  const h26 = await request('H2.6_STALE_VERSION', `/api/v1/ventures/${first.venture_id}`, {
    method: 'PATCH',
    key: `d2-stale-${suffix}`,
    body: { expected_version: first.venture_version, stage: 'growth', source: 'operator' },
    expected: [409]
  });
  assert(h26.payload?.error?.code === 'GV_VERSION_CONFLICT', 'H2.6: wrong error code.');

  const secondVentureBody = {
    client_session_key: `d2-session-${suffix}-03`,
    source: 'galvicare',
    current_stage: 'GalviTriage',
    founder: { founder_id: first.founder_id, email: newBody.founder.email.toUpperCase() },
    venture: {
      venture_name: `Day 2 Second Venture ${suffix}`,
      stage: 'ideation',
      role_code: 'founder',
      is_primary: true
    }
  };
  const h27 = await request('H2.7_SECOND_VENTURE', '/api/v1/sessions', {
    method: 'POST', body: secondVentureBody, key: `d2-second-venture-${suffix}`, expected: [201]
  });
  const secondVenture = ids(h27);
  assert(secondVenture.founder_id === first.founder_id, 'H2.7: Founder was duplicated.');
  assert(secondVenture.venture_id !== first.venture_id, 'H2.7: Venture was not new.');
  assert(secondVenture.bmr_id !== first.bmr_id, 'H2.7: BMR was not new.');

  const privilege = await request('H2.8_PRIVILEGE_INJECTION', `/api/v1/ventures/${first.venture_id}/founder-roles`, {
    method: 'POST',
    key: `d2-privilege-${suffix}`,
    body: { founder_id: first.founder_id, role_code: 'admin', is_primary: true },
    expected: [403]
  });
  assert(privilege.payload?.error?.code === 'GV_FORBIDDEN', 'H2.8 privilege: wrong error code.');

  const scope = await request('H2.8_CROSS_SCOPE', '/api/v1/sessions', {
    method: 'POST',
    key: `d2-scope-${suffix}`,
    body: {
      client_session_key: `d2-session-${suffix}-scope`,
      source: 'galvicare',
      founder: { founder_id: first.founder_id, email: newBody.founder.email },
      venture: { venture_id: first.venture_id, role_code: 'founder' },
      bmr_id: secondVenture.bmr_id
    },
    expected: [409]
  });
  assert(scope.payload?.error?.code === 'GV_SCOPE_MISMATCH', 'H2.8 scope: wrong error code.');

  const founderKey = `d2-key-reuse-${suffix}`;
  const keyFirst = await request('H2.9_KEY_INITIAL', '/api/v1/founders', {
    method: 'POST',
    key: founderKey,
    body: { email: `key.one.${suffix}@example.test`, source: 'galvicare' },
    expected: [201]
  });
  assert(keyFirst.payload?.data?.founder?.founder_id, 'H2.9 initial Founder missing.');
  const keyReuse = await request('H2.9_KEY_REUSE', '/api/v1/founders', {
    method: 'POST',
    key: founderKey,
    body: { email: `key.two.${suffix}@example.test`, source: 'galvicare' },
    expected: [409]
  });
  assert(keyReuse.payload?.error?.code === 'GV_IDEMPOTENCY_KEY_REUSE', 'H2.9: wrong error code.');

  evidence.canonical_ids = {
    first: {
      founder_id: first.founder_id,
      venture_id: first.venture_id,
      bmr_id: first.bmr_id,
      session_id: first.session_id
    },
    second_session: { session_id: secondSession.session_id },
    second_venture: {
      founder_id: secondVenture.founder_id,
      venture_id: secondVenture.venture_id,
      bmr_id: secondVenture.bmr_id,
      session_id: secondVenture.session_id
    }
  };
  evidence.h2_1_through_h2_9 = 'PASS';
  evidence.h2_10_production_regression = 'HUMAN_EVIDENCE_REQUIRED';
  evidence.completed_at = new Date().toISOString();
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));
  console.log(`PASS: H2.1-H2.9 complete. Evidence written to ${evidencePath}.`);
} catch (error) {
  evidence.completed_at = new Date().toISOString();
  evidence.result = 'FAIL';
  evidence.error = { message: error.message, stack: error.stack };
  try {
    fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  } catch {}
  console.error(error);
  process.exit(1);
}
