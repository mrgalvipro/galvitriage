import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const qaWorker = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');
const prodEntry = readFileSync(new URL('../worker/production-entry.js', import.meta.url), 'utf8');
const day7dWrangler = readFileSync(new URL('../wrangler.day7d.json', import.meta.url), 'utf8');
const day1Wrangler = readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8');
const prodWrangler = readFileSync(new URL('../wrangler.production.jsonc', import.meta.url), 'utf8');

const PROD_D1_ID = '2fc954b7-00ca-405b-8313-f91e706845a2';
const QA_D1_ID = 'cdf9042b-ab09-498a-ac66-010b6cce47d4';

function expectIncludes(haystack, needles) {
  for (const needle of needles) assert.ok(haystack.includes(needle), `Missing required production/QA contract: ${needle}`);
}

function expectExcludes(haystack, needles) {
  for (const needle of needles) assert.ok(!haystack.includes(needle), `Forbidden production/QA contract present: ${needle}`);
}

test('Day 7A Worker remains the QA/build source without product-logic rewrite', () => {
  expectIncludes(qaWorker, [
    "DAY7A_RUNTIME_MARKER = 'day7a-payment-products-v1'",
    "environment: 'qa'",
    "branch: 'qa-revamped-galvicare-0-5'"
  ]);
});

test('Production keeps the current GalviCare security boundary and approved entry point', () => {
  expectIncludes(prodWrangler, [
    '"name": "galvicare-0-5-production"',
    '"main": "worker/production-entry.js"',
    '"ENVIRONMENT": "production"',
    '"APP_ENV": "production"',
    '"RELEASE_BRANCH": "main"'
  ]);
  expectIncludes(prodEntry, [
    "import day7aWorker from './worker.js'",
    "DAY7B_RUNTIME_MARKER = 'day7b-production-isolation-v4'",
    "ENVIRONMENT: 'production'",
    "APP_ENV: 'production'",
    "RELEASE_BRANCH: 'main'",
    "GALVIVAULT_NAME: 'galvivault-0-5-production'"
  ]);
  expectExcludes(prodEntry, ["import day7dWorker from './day7d-engine.js'"]);
});

test('Day 1, Day 7D and Production Worker services are distinct', () => {
  expectIncludes(day1Wrangler, [
    '"name": "galvivault-p0-day1-qa"',
    '"main": "worker/day1.js"'
  ]);
  expectIncludes(day7dWrangler, [
    '"name": "galvicare-triage-intake"',
    '"main": "worker/day7d-engine.js"'
  ]);
  expectIncludes(prodWrangler, [
    '"name": "galvicare-0-5-production"',
    '"main": "worker/production-entry.js"'
  ]);
});

test('QA and Production D1 targets are physically distinct', () => {
  expectIncludes(day1Wrangler, ['"database_name": "galvivault-0-5-qa"', QA_D1_ID]);
  expectIncludes(day7dWrangler, ['"database_name": "galvivault-0-5-qa"', QA_D1_ID]);
  expectIncludes(prodWrangler, ['"database_name": "galvivault-0-5-production"', PROD_D1_ID]);
  expectExcludes(prodWrangler, [QA_D1_ID, 'galvivault-0-5-qa']);
});

test('Production runtime is explicitly production with an exact origin allowlist', () => {
  expectIncludes(prodWrangler, [
    '"ENVIRONMENT": "production"',
    '"APP_ENV": "production"',
    '"ALLOWED_ORIGIN": "https://www.galvipro.com"',
    '"preview_urls": false'
  ]);
  expectIncludes(prodEntry, [
    "const PRODUCTION_ORIGINS = new Set([",
    "'https://www.galvipro.com'",
    "const PRIMARY_PRODUCTION_ORIGIN = 'https://www.galvipro.com'",
    '!PRODUCTION_ORIGINS.has(origin)',
    "'Access-Control-Allow-Origin': origin"
  ]);
  expectExcludes(prodEntry, ["'Access-Control-Allow-Origin': '*'", '"Access-Control-Allow-Origin": "*"']);
});

test('QA-only fixture and override capabilities are denied by the current Production boundary', () => {
  expectIncludes(prodEntry, [
    "action === 'get_fixture_result' || action === 'grant_test_override'",
    'QA-only capability is unavailable in production.',
    "status: 'not_found'"
  ]);
});

test('Production health fingerprint identifies Production GalviVault, main release, DB binding and runtime', () => {
  expectIncludes(prodEntry, [
    "environment: 'production'",
    "release_branch: 'main'",
    "galvivault: 'galvivault-0-5-production'",
    'db_bound: Boolean(env?.DB)',
    'runtime_marker: DAY7B_RUNTIME_MARKER',
    "day7a_runtime_marker: 'day7a-payment-products-v1'"
  ]);
});

test('Production payment return remains server-verified and cannot use a browser/test authority', () => {
  expectIncludes(qaWorker, [
    "const secret = String(env.STRIPE_SECRET_KEY || '').trim()",
    "if (!secret) throw new Error('STRIPE_SECRET_KEY is required for Worker-side Stripe Checkout Session verification.')",
    "Authorization: `Bearer ${secret}`",
    "const paymentStatus = String(session?.payment_status || '').toLowerCase()",
    "paymentStatus === 'paid'",
    "if (!isStripePaid(stripeSession))",
    "Stripe payment is not complete."
  ]);
  expectIncludes(prodEntry, [
    'return delegate(request, env, ctx, payload)',
    'day7aWorker.fetch(request, productionEnv(env, request), ctx)'
  ]);
  expectExcludes(prodEntry, [
    'QA_OVERRIDE_SECRET',
    'TEST_OVERRIDE_SECRET',
    'buy.stripe.com/test_'
  ]);
});

test('Production config contains no QA-only D1 or test-payment authority', () => {
  expectExcludes(prodWrangler, [
    'galvivault-0-5-qa',
    'buy.stripe.com/test_',
    'QA_OVERRIDE_SECRET',
    'TEST_OVERRIDE_SECRET',
    '"FIXTURE_MODE": "true"'
  ]);
});