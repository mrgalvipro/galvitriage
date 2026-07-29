import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const qaWorker = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');
const prodEntry = readFileSync(new URL('../worker/production-entry.js', import.meta.url), 'utf8');
const qaWrangler = readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8');
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

test('Production has a separate security boundary around the approved Day 7D runtime', () => {
  expectIncludes(prodWrangler, ['"main": "worker/production-entry.js"']);
  expectIncludes(prodEntry, [
    "import day7dWorker from './day7d-engine.js'",
    "DAY7B_RUNTIME_MARKER = 'day7b-production-isolation-v1'",
    "DAY7D_PRODUCTION_MARKER = 'day7d-cumulative-customer-intelligence-v1'"
  ]);
  expectExcludes(prodEntry, ["import day7aWorker from './worker.js'"]);
});

test('QA and Production Worker services are distinct', () => {
  expectIncludes(qaWrangler, ['"name": "galvicare-triage-intake"']);
  expectIncludes(prodWrangler, ['"name": "galvicare-0-5-production"']);
});

test('QA and Production D1 targets are physically distinct', () => {
  expectIncludes(qaWrangler, ['"database_name": "galvivault-0-5-qa"', QA_D1_ID]);
  expectIncludes(prodWrangler, ['"database_name": "galvivault-0-5-production"', PROD_D1_ID]);
  expectExcludes(prodWrangler, [QA_D1_ID, 'galvivault-0-5-qa']);
});

test('Production runtime is explicitly production and customer-origin only', () => {
  expectIncludes(prodWrangler, [
    '"ENVIRONMENT": "production"',
    '"APP_ENV": "production"',
    '"ALLOWED_ORIGIN": "https://www.galvipro.com"',
    '"preview_urls": false'
  ]);
  expectIncludes(prodEntry, [
    "const PRODUCTION_ORIGIN = 'https://www.galvipro.com'",
    'origin !== PRODUCTION_ORIGIN'
  ]);
  expectExcludes(prodEntry, ["'Access-Control-Allow-Origin': '*'", '"Access-Control-Allow-Origin": "*"']);
});

test('QA-only fixture and override capabilities are denied by Production boundary', () => {
  expectIncludes(prodEntry, [
    "action === 'get_fixture_result'",
    "action === 'grant_test_override'",
    'QA-only capability is unavailable in production.',
    "status:'not_found'"
  ]);
});

test('Production health fingerprint identifies RUN lane, Production GalviVault, DB binding, Stripe mode and Day 7D runtime', () => {
  expectIncludes(prodEntry, [
    "environment:'production'",
    "galvivault:'galvivault-0-5-production'",
    "release_branch:'qa-revamped-galvicare-0-5'",
    'db_bound:Boolean(env?.DB)',
    'stripe_mode:stripeMode(env)',
    'day7d_runtime_marker:DAY7D_PRODUCTION_MARKER'
  ]);
});

test('Production payment return is fail-closed and requires Stripe LIVE paid authority', () => {
  expectIncludes(prodEntry, [
    "if (stripeMode(env) !== 'live')",
    "stripeSession.livemode === true",
    "paymentStatus !== 'paid'",
    'paymentIntent',
    'payment_amount_mismatch',
    'payment_product_mismatch',
    'A verified Stripe LIVE paid transaction is required before GalviCare can unlock this product.'
  ]);
});

test('Production config contains no QA-only D1 or test-payment authority', () => {
  expectExcludes(prodWrangler, [
    'galvivault-0-5-qa',
    'buy.stripe.com/test_',
    'QA_OVERRIDE_SECRET',
    'TEST_OVERRIDE_SECRET'
  ]);
});
