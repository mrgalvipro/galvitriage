import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const qaWorker = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');
const prodEntry = readFileSync(new URL('../worker/production-entry.js', import.meta.url), 'utf8');
const qaWrangler = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const prodWrangler = readFileSync(new URL('../wrangler.production.jsonc', import.meta.url), 'utf8');

const PROD_D1_ID = '2fc954b7-00ca-405b-8313-f91e706845a2';
const QA_D1_ID = 'cdf9042b-ab09-498a-ac66-010b6cce47d4';

test('Day 7A Worker remains the QA/build source without product-logic rewrite', () => {
  assert.match(qaWorker, /DAY7A_RUNTIME_MARKER = 'day7a-payment-products-v1'/);
  assert.match(qaWorker, /environment: 'qa'/);
  assert.match(qaWorker, /branch: 'qa-revamped-galvicare-0-5'/);
});

test('Production has a separate runtime entrypoint', () => {
  assert.match(prodWrangler, /"main": "worker\/production-entry\.js"/);
  assert.match(prodEntry, /import day7aWorker from '\.\/worker\.js'/);
  assert.match(prodEntry, /day7b-production-isolation-v1/);
});

test('QA and Production Worker services are distinct', () => {
  assert.match(qaWrangler, /"name": "galvicare-triage-intake"/);
  assert.match(prodWrangler, /"name": "galvicare-0-5-production"/);
});

test('QA and Production D1 targets are physically distinct', () => {
  assert.match(qaWrangler, /"database_name": "galvivault-0-5-qa"/);
  assert.match(prodWrangler, /"database_name": "galvivault-0-5-production"/);
  assert.match(prodWrangler, new RegExp(PROD_D1_ID.replaceAll('-', '\\-')));
  assert.doesNotMatch(prodWrangler, new RegExp(QA_D1_ID.replaceAll('-', '\\-')));
});

test('Production runtime is explicitly production and customer-origin only', () => {
  assert.match(prodWrangler, /"ENVIRONMENT": "production"/);
  assert.match(prodWrangler, /"APP_ENV": "production"/);
  assert.match(prodWrangler, /"ALLOWED_ORIGIN": "https:\/\/www\.galvipro\.com"/);
  assert.match(prodWrangler, /"preview_urls": false/);
  assert.match(prodEntry, /origin !== PRODUCTION_ORIGIN/);
  assert.doesNotMatch(prodEntry, /Access-Control-Allow-Origin['"]?:\s*['"]\*['"]/);
});

test('QA-only fixture and override capabilities are denied by Production boundary', () => {
  assert.match(prodEntry, /action === 'get_fixture_result'/);
  assert.match(prodEntry, /action === 'grant_test_override'/);
  assert.match(prodEntry, /QA-only capability is unavailable in production\./);
  assert.match(prodEntry, /}, 404\);/);
});

test('Production health fingerprint identifies RUN lane and Production GalviVault', () => {
  assert.match(prodEntry, /environment: 'production'/);
  assert.match(prodEntry, /galvivault: 'galvivault-0-5-production'/);
  assert.match(prodEntry, /release_branch: 'qa-revamped-galvicare-0-5'/);
  assert.match(prodEntry, /db_bound: Boolean\(env\?\.DB\)/);
});

test('Production config contains no QA-only D1 or test-payment authority', () => {
  assert.doesNotMatch(prodWrangler, /galvivault-0-5-qa/);
  assert.doesNotMatch(prodWrangler, /buy\.stripe\.com\/test_/);
  assert.doesNotMatch(prodWrangler, /QA_OVERRIDE_SECRET|TEST_OVERRIDE_SECRET/);
});
