import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const worker = await readFile(new URL('../worker/worker.js', import.meta.url), 'utf8');
const browser = await readFile(new URL('../index.html', import.meta.url), 'utf8');

const browserForbidden = [
  'DIMENSION_WEIGHTS',
  'GALVISHOT_RULES_VERSION',
  'clinical_findings',
  'galvishot_evidence_links',
  'evaluateGalviShot(',
  'writeGalviShot(',
  'MAKE_GALVISHOT_WEBHOOK_URL',
  'MAKE_GALVICARE_DIAGNOSTICS_WEBHOOK_URL'
];

test('browser contains presentation and transport logic only', () => {
  for (const token of browserForbidden) {
    assert.equal(browser.includes(token), false, `Browser source exposes protected server token: ${token}`);
  }
});

test('browser sends Day 3 requests only to the Worker API endpoint', () => {
  assert.match(browser, /GALVICARE_API_ENDPOINT\s*=\s*GALVICARE_INTAKE_ENDPOINT\s*\+\s*['"]\/api['"]/);
  assert.equal(/hook\.(?:us1|eu1)\.make\.com/i.test(browser), false, 'Browser must not contain Make webhook URLs');
});

test('Worker owns deterministic GalviShot evaluation and D1 evidence persistence', () => {
  assert.match(worker, /handleDay3GalviShotAction/);
  assert.match(worker, /evaluateGalviShot/);
  assert.match(worker, /INSERT INTO clinical_findings/);
  assert.match(worker, /INSERT INTO galvishot_evidence_links/);
  assert.match(worker, /pathname\s*===\s*['"]\/api['"]\s*&&\s*GALVISHOT_ACTIONS\.has\(action\)/);
});

test('Worker does not route /api GalviShot actions through legacy diagnostics', () => {
  const apiRoute = worker.indexOf("pathname === '/api' && GALVISHOT_ACTIONS.has(action)");
  const legacyRoute = worker.indexOf('return await handleDiagnosticAction');
  assert.ok(apiRoute >= 0, 'Missing authoritative /api GalviShot route');
  assert.ok(legacyRoute < 0 || apiRoute < legacyRoute, 'Authoritative Day 3 route must run before legacy diagnostic routing');
});

test('no literal QA override secret is committed to browser source', () => {
  assert.equal(/GalviShot-QA-\d{4}/.test(browser), false, 'QA override secret must not be committed to public browser code');
  assert.equal(/YOUR_QA_OVERRIDE_SECRET/.test(browser), false, 'Placeholder QA secret must not ship in public browser code');
});
