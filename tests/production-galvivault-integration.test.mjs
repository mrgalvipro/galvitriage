import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync(new URL('../worker/production-galvivault-integration.js', import.meta.url), 'utf8');
const config = readFileSync(new URL('../wrangler.production-galvivault.jsonc', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/production/0006_operator_device_auth.sql', import.meta.url), 'utf8');
const productionEntry = readFileSync(new URL('../worker/production-entry.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const parsed = JSON.parse(config);

test('Production integration is additive around the accepted GalviCare entrypoint', () => {
  assert.match(worker, /import productionWorker from '.\/production-entry\.js'/);
  assert.match(worker, /import canonicalWorker from '.\/day2\.js'/);
  assert.match(worker, /import clinicianWorker from '.\/day8-entry\.js'/);
  assert.match(worker, /productionWorker\.fetch\(request, env, ctx\)/);
  assert.doesNotMatch(productionEntry, /GALVIVAULT_DAY9_CONTINUITY_BRIDGE/);
});

test('Production continuity is explicitly production-only and fixture-disabled', () => {
  assert.match(worker, /ENVIRONMENT.*production/s);
  assert.match(worker, /APP_ENV.*production/s);
  assert.match(worker, /GALVIVAULT_DAY9_CONTINUITY_BRIDGE/);
  assert.match(worker, /!enabled\(env\?\.FIXTURE_MODE\)/);
  assert.match(worker, /X-GalviVault-Day9-Continuity/);
  assert.match(worker, /X-GalviVault-Day9-Continuity-Runtime/);
});

test('Production continuity reuses canonical Day 2 session authority', () => {
  assert.match(worker, /https:\/\/galvivault\.internal\/api\/v1\/sessions/);
  assert.match(worker, /prod-day9-galvicare-/);
  assert.match(worker, /galvicare_production_continuity_bridge/);
  assert.match(worker, /'X-GalviVault-Day9-Continuity': 'attached'/);
});

test('Production protected clinician routes use the existing authenticated Day 8 boundary', () => {
  assert.match(worker, /pathname\.startsWith\('\/api\/v1\/operator\/'\)/);
  assert.match(worker, /clinicianWorker\.fetch\(request, env, ctx\)/);
});

test('Production config keeps exact Production D1 and enables no QA fixture mode', () => {
  assert.equal(parsed.name, 'galvicare-0-5-production');
  assert.equal(parsed.main, 'worker/production-galvivault-integration.js');
  assert.equal(parsed.vars.ENVIRONMENT, 'production');
  assert.equal(parsed.vars.APP_ENV, 'production');
  assert.equal(parsed.vars.RELEASE_BRANCH, 'main');
  assert.equal(parsed.vars.GALVIVAULT_NAME, 'galvivault-0-5-production');
  assert.equal(parsed.vars.GALVIVAULT_DAY9_CONTINUITY_BRIDGE, 'true');
  assert.equal(parsed.vars.FIXTURE_MODE, 'false');
  assert.equal(parsed.d1_databases[0].binding, 'DB');
  assert.equal(parsed.d1_databases[0].database_name, 'galvivault-0-5-production');
  assert.equal(parsed.d1_databases[0].database_id, '2fc954b7-00ca-405b-8313-f91e706845a2');
  assert.ok(!config.includes('galvivault-0-5-qa'));
});

test('Operator auth migration is additive and Production-ledgered', () => {
  for (const table of ['gv8_operator_credentials','gv8_operator_invitations','gv8_auth_challenges','gv8_operator_sessions']) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(migration, /'0006', 'day8_operator_device_auth', 'production'/);
  assert.doesNotMatch(migration, /\b(DROP TABLE|DELETE FROM gv1_|UPDATE gv1_)\b/i);
});

test('GalviCare LIVE payment and customer frontend baseline remains untouched', () => {
  for (const liveLink of [
    'https://buy.stripe.com/14A00kbjycvpgoGfBY53O00',
    'https://buy.stripe.com/bJe7sM5Ze9jdc8qgG253O01',
    'https://buy.stripe.com/00w14odrG1QLdcu9dA53O02',
    'https://buy.stripe.com/eVq3cw3R63YT6O6ahE53O03'
  ]) assert.ok(html.includes(liveLink), liveLink);
  assert.ok(!html.includes('buy.stripe.com/test_'));
  assert.match(productionEntry, /HUBSPOT_ENABLED: 'true'/);
});
