import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;
const enc = new TextEncoder();
const b64u = (bytes) => Buffer.from(bytes).toString('base64url');
const sha256 = async (value) => b64u(await subtle.digest('SHA-256', enc.encode(String(value))));
const randomToken = (n = 32) => { const bytes = new Uint8Array(n); webcrypto.getRandomValues(bytes); return b64u(bytes); };

const mode = process.argv[2];
const statePath = process.env.OPERATOR_STATE || '/tmp/production-galvivault-operator.json';

if (mode === 'prepare') {
  const suffix = String(process.env.CANARY_SUFFIX || Date.now()).replace(/[^A-Za-z0-9_-]/g, '-');
  const token = randomToken(32);
  const keyPair = await subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const publicJwk = await subtle.exportKey('jwk', keyPair.publicKey);
  const state = {
    invitation_token: token,
    invitation_hash: await sha256(token),
    operator_id: `op_prod_e2e_${suffix}`,
    email: `prod.e2e.clinician+${suffix}@example.invalid`,
    display_name: 'Production E2E Clinician',
    role: 'clinician',
    credential_id: `cred_prod_e2e_${suffix}`,
    public_jwk: publicJwk,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  };
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ operator_id: state.operator_id, email: '[REDACTED_TEST_IDENTITY]', expires_at: state.expires_at }, null, 2));
  process.exit(0);
}

if (mode !== 'verify') throw new Error('Usage: node production-galvivault-operator-canary.mjs prepare|verify');
const prodUrl = String(process.env.PROD_URL || '').replace(/\/$/, '');
const versionId = String(process.env.VERSION_ID || '').trim();
const bmrId = String(process.env.BMR_ID || '').trim();
const founderId = String(process.env.FOUNDER_ID || '').trim();
const ventureId = String(process.env.VENTURE_ID || '').trim();
if (!prodUrl || !versionId || !bmrId || !founderId || !ventureId) throw new Error('PROD_URL, VERSION_ID, BMR_ID, FOUNDER_ID, and VENTURE_ID are required');
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const override = `galvicare-0-5-production="${versionId}"`;

function headerValue(rawHeaders, name) {
  const target = `${String(name).toLowerCase()}:`;
  return rawHeaders.split(/\r?\n/).reverse().find((line) => line.toLowerCase().startsWith(target))?.slice(target.length).trim() || null;
}

function requestJson(url, { method = 'GET', headers = {}, body = undefined } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'galvivault-prod-operator-'));
  const headerPath = join(dir, 'headers.txt');
  const bodyPath = join(dir, 'body.txt');
  try {
    const args = ['-sS', '-D', headerPath, '-o', bodyPath, '-w', '%{http_code}', '-X', method];
    for (const [name, value] of Object.entries(headers)) args.push('-H', `${name}: ${value}`);
    if (body !== undefined) args.push('--data-binary', body);
    args.push(url);
    const result = spawnSync('curl', args, { encoding: 'utf8' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`curl failed (${result.status}): ${result.stderr || result.stdout}`);
    const status = Number(String(result.stdout || '').trim());
    const rawHeaders = readFileSync(headerPath, 'utf8');
    const rawBody = readFileSync(bodyPath, 'utf8');
    let parsed = {};
    try { parsed = rawBody ? JSON.parse(rawBody) : {}; } catch { parsed = { raw: rawBody }; }
    return { status, body: parsed, rawHeaders };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const enroll = requestJson(`${prodUrl}/api/v1/operator/auth/enroll`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cloudflare-Workers-Version-Overrides': override
  },
  body: JSON.stringify({ email: state.email, enrollment_token: state.invitation_token, credential_id: state.credential_id, public_jwk: state.public_jwk })
});
if (enroll.status !== 201 || enroll.body?.success !== true) throw new Error(`Operator enroll failed: HTTP ${enroll.status} ${JSON.stringify(enroll.body)}`);
const cookieHeader = headerValue(enroll.rawHeaders, 'set-cookie') || '';
const cookie = cookieHeader.split(';')[0];
if (!cookie.startsWith('gv8_session=')) throw new Error('Operator enroll did not issue gv8_session cookie');

function get(path) {
  const response = requestJson(`${prodUrl}${path}`, {
    headers: {
      Cookie: cookie,
      'Cloudflare-Workers-Version-Overrides': override
    }
  });
  if (response.status !== 200 || response.body?.success !== true) throw new Error(`Operator route failed ${path}: HTTP ${response.status} ${JSON.stringify(response.body)}`);
  return { path, http_status: response.status, success: true };
}

const checks = [];
checks.push(get(`/api/v1/operator/business-medical-records/${encodeURIComponent(bmrId)}/chart`));
checks.push(get(`/api/v1/operator/business-medical-records/${encodeURIComponent(bmrId)}/founder-health-record`));
checks.push(get(`/api/v1/operator/business-medical-records/${encodeURIComponent(bmrId)}/founder-intelligence-context?founder_id=${encodeURIComponent(founderId)}&venture_id=${encodeURIComponent(ventureId)}`));

const logout = requestJson(`${prodUrl}/api/v1/operator/auth/logout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
    'Cloudflare-Workers-Version-Overrides': override
  },
  body: '{}'
});
if (logout.status !== 200) throw new Error(`Operator logout failed: HTTP ${logout.status}`);

writeFileSync(process.env.OPERATOR_RESULT || '/tmp/production-galvivault-operator-result.json', `${JSON.stringify({ operator_id: state.operator_id, checks, logout_status: logout.status }, null, 2)}\n`);
console.log(JSON.stringify({ operator_id: state.operator_id, checks, logout_status: logout.status }, null, 2));
