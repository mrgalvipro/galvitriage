import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'index.html';
const OUT_DIR = 'dist-qa';
const OUT = `${OUT_DIR}/index.html`;
const QA_FRONTEND_ORIGIN = 'https://galvicare-0-5-qa.mrgalvipro.workers.dev';
const QA_CUSTOMER_URL = `${QA_FRONTEND_ORIGIN}/#galvitriage`;
const QA_WORKER = 'https://galvicare-triage-intake.mrgalvipro.workers.dev';
const PROD_WORKER = 'https://galvicare-0-5-production.mrgalvipro.workers.dev';
const LIVE_STRIPE_MARKER = 'https://buy.stripe.com/';
const TEST_STRIPE_MARKER = 'https://buy.stripe.com/test_';

let html = readFileSync(SOURCE, 'utf8');

const requiredQaContracts = [
  `const GALVICARE_INTAKE_ENDPOINT = '${QA_WORKER}';`,
  "const GALVISCORE_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_",
  "PAYMENT_LINK: 'https://buy.stripe.com/test_",
  "const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_",
  "const GALVIPATH_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_"
];
for (const contract of requiredQaContracts) {
  if (!html.includes(contract)) {
    console.error(`BLOCKED — QA source contract missing: ${contract}`);
    process.exit(2);
  }
}

if (html.includes(PROD_WORKER)) {
  console.error('BLOCKED — Production Worker endpoint is present in QA source.');
  process.exit(2);
}

// The QA browser must return to the QA browser after Stripe TEST checkout.
html = html.replace(
  "const GALVICARE_CANONICAL_CUSTOMER_URL = 'https://www.galvipro.com/#galvitriage';",
  `const GALVICARE_CANONICAL_CUSTOMER_URL = '${QA_CUSTOMER_URL}';`
);

// Prevent QA human testing from contaminating Production GA4 / Clarity telemetry.
html = html.replace(/\s*<!-- Google Analytics 4[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/, `\n  <!-- QA analytics intentionally disabled -->\n  <script>window.gtag=function(){};</script>`);
html = html.replace(/\s*<!-- Microsoft Clarity[\s\S]*?<\/script>/, `\n  <!-- QA Clarity intentionally disabled -->\n  <script>window.clarity=function(){};</script>`);

// Make the lane impossible to confuse visually with Production.
const qaBanner = `
<div id="galvicare-qa-environment-banner" role="status" style="position:sticky;top:0;z-index:99999;background:#7f1d1d;color:#fff;text-align:center;font:700 13px/1.3 Arial,sans-serif;padding:8px 12px;letter-spacing:.08em;">GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS</div>`;
html = html.replace(/<body([^>]*)>/, `<body$1>${qaBanner}`);
html = html.replace('</head>', `  <meta name="galvicare-environment" content="qa" />\n  <meta name="galvicare-qa-frontend" content="day7b-qa-browser-v1" />\n</head>`);

// Post-build authority checks.
if (!html.includes(QA_WORKER) || !html.includes(QA_CUSTOMER_URL)) {
  console.error('BLOCKED — QA endpoint/canonical URL missing from generated QA frontend.');
  process.exit(3);
}
if (!html.includes(TEST_STRIPE_MARKER)) {
  console.error('BLOCKED — Stripe TEST mappings missing from QA frontend.');
  process.exit(3);
}
if (html.includes(PROD_WORKER)) {
  console.error('BLOCKED — Production Worker leaked into QA frontend.');
  process.exit(3);
}

// Reject the four approved LIVE links specifically. Generic buy.stripe.com also appears in TEST URLs.
const liveLinks = [
  'https://buy.stripe.com/14A00kbivcypgoGfBY53000',
  'https://buy.stripe.com/bJe7sM5Ze9jdc8qgG253001',
  'https://buy.stripe.com/00w14odrG1QLdcu9dA53002',
  'https://buy.stripe.com/eVq3cw3R63YT6O6ahE53003'
];
for (const link of liveLinks) {
  if (html.includes(link)) {
    console.error(`BLOCKED — LIVE Stripe link leaked into QA frontend: ${link}`);
    process.exit(3);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html, 'utf8');
console.log(`PASS — ${OUT} generated as isolated QA browser/customer E2E frontend.`);
console.log(`QA URL: ${QA_CUSTOMER_URL}`);
console.log(`QA API: ${QA_WORKER}/api`);
