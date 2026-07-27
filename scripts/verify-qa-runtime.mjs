// scripts/verify-qa-runtime.mjs
//
// GalviCare 0.5 Day 7D critical-path runtime verifier.
// Purpose:
//   1) Prefer a live remote health assertion.
//   2) When the execution environment cannot reach workers.dev, allow a
//      HUMAN-CAPTURED health JSON file to satisfy the exact same assertions.
//   3) Never convert an actual runtime mismatch into a pass.
//
// Usage:
//   node scripts/verify-qa-runtime.mjs
//
// Network-restricted fallback:
//   GALVICARE_QA_RUNTIME_EVIDENCE_FILE=./evidence/day7d-qa-health.json \
//   node scripts/verify-qa-runtime.mjs

import fs from 'node:fs/promises';

const endpoint = process.env.GALVICARE_QA_WORKER_URL ||
  'https://galvicare-triage-intake.mrgalvipro.workers.dev/api';
const expectedMarker = process.env.GALVICARE_EXPECTED_RUNTIME_MARKER ||
  'day7a-payment-products-v1';
const expectedBranch = process.env.GALVICARE_EXPECTED_BRANCH ||
  'qa-revamped-galvicare-0-5';
const evidenceFile = process.env.GALVICARE_QA_RUNTIME_EVIDENCE_FILE || '';
const requiredProducts = ['GalviScore','GalviShot','GalviSight','GalviPath'];
const requiredAliases = {
  galviscore:'GalviScore', galvi_score:'GalviScore',
  galvishot:'GalviShot', galvi_shot:'GalviShot',
  galvisight:'GalviSight', galvi_sight:'GalviSight',
  galvipath:'GalviPath', galvi_path:'GalviPath'
};
const attempts = Number.parseInt(process.env.GALVICARE_QA_RUNTIME_ATTEMPTS || '3', 10);
const timeoutMs = Number.parseInt(process.env.GALVICARE_QA_RUNTIME_TIMEOUT_MS || '8000', 10);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function assert(condition, message) { if (!condition) throw new Error(message); }
function normalizeHealthBody(raw) {
  const build = raw?.build && typeof raw.build === 'object' ? raw.build : {};
  return {
    raw,
    success: raw?.success,
    runtime_marker: raw?.runtime_marker ?? build?.runtime_marker ?? raw?.marker,
    environment: raw?.environment ?? build?.environment,
    branch: raw?.branch ?? build?.branch,
    payment_return_products: raw?.payment_return_products ?? build?.payment_return_products ?? raw?.products ?? [],
    payment_return_aliases: raw?.payment_return_aliases ?? build?.payment_return_aliases ?? raw?.aliases ?? {}
  };
}
function validateHealth(raw, source) {
  const body = normalizeHealthBody(raw);
  assert(body.success === true, `${source}: health_check success must be true`);
  assert(body.runtime_marker === expectedMarker, `${source}: runtime marker mismatch: expected ${expectedMarker}, got ${body.runtime_marker}`);
  assert(body.environment === 'qa', `${source}: environment mismatch: expected qa, got ${body.environment}`);
  assert(body.branch === expectedBranch, `${source}: branch mismatch: expected ${expectedBranch}, got ${body.branch}`);
  assert(Array.isArray(body.payment_return_products), `${source}: payment_return_products must be an array`);
  for (const product of requiredProducts) assert(body.payment_return_products.includes(product), `${source}: missing payment product ${product}`);
  assert(body.payment_return_aliases && typeof body.payment_return_aliases === 'object' && !Array.isArray(body.payment_return_aliases), `${source}: payment_return_aliases must be an object`);
  for (const [alias, product] of Object.entries(requiredAliases)) assert(body.payment_return_aliases[alias] === product, `${source}: alias mismatch ${alias}: expected ${product}, got ${body.payment_return_aliases[alias]}`);
  return body;
}
async function fetchLiveHealth() {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/json','Cache-Control':'no-cache'},
        body:JSON.stringify({action:'health_check'}),
        signal:controller.signal
      });
      const text = await response.text();
      let raw;
      try { raw = JSON.parse(text); } catch { throw new Error(`HTTP ${response.status} returned non-JSON body: ${text.slice(0,200)}`); }
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(raw)}`);
      return validateHealth(raw, 'live-runtime');
    } catch (error) {
      lastError = error;
      console.warn(`Live QA runtime attempt ${attempt}/${attempts} failed: ${error.message}`);
      if (attempt < attempts) await sleep(1500);
    } finally { clearTimeout(timer); }
  }
  throw lastError || new Error('live runtime unavailable');
}
async function loadHumanEvidence(path) {
  const text = await fs.readFile(path, 'utf8');
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error(`Evidence file ${path} is not valid JSON. Save the raw health_check response only.`); }
  return validateHealth(raw, `human-evidence:${path}`);
}
function printPass(mode, body) {
  console.log(JSON.stringify({
    status:'PASS', verification_mode:mode, endpoint,
    runtime_marker:body.runtime_marker, environment:body.environment,
    branch:body.branch, payment_return_products:body.payment_return_products,
    payment_return_aliases:body.payment_return_aliases
  }, null, 2));
}
let liveError;
try {
  const body = await fetchLiveHealth();
  printPass('live-remote', body);
  process.exit(0);
} catch (error) { liveError = error; }
if (!evidenceFile) {
  console.error([
    `QA runtime verification could not reach or validate ${endpoint}.`,
    `Live error: ${liveError?.message || 'unknown error'}`,
    '',
    'CRITICAL-PATH NEXT STEP:',
    'Capture the raw QA POST /api health_check JSON from a network-capable browser/terminal,',
    'save it to a file, then rerun with:',
    '',
    'GALVICARE_QA_RUNTIME_EVIDENCE_FILE=./evidence/day7d-qa-health.json node scripts/verify-qa-runtime.mjs',
    '',
    'This is a NETWORK/EVIDENCE block, not an application-logic failure.'
  ].join('\n'));
  process.exit(2);
}
try {
  const body = await loadHumanEvidence(evidenceFile);
  printPass('human-captured-runtime-evidence', body);
  process.exit(0);
} catch (error) {
  console.error(`QA runtime evidence validation failed: ${error.message}`);
  process.exit(1);
}
