import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'index.html';
const DAY7D_BROWSER = 'day7d-browser-customer-intelligence.js';
const OUT_DIR = 'dist-qa';
const OUT = `${OUT_DIR}/index.html`;
const QA_FRONTEND_ORIGIN = 'https://galvicare-0-5-qa.mrgalvipro.workers.dev';
const QA_CUSTOMER_URL = `${QA_FRONTEND_ORIGIN}/#galvitriage`;
const QA_WORKER = 'https://galvicare-triage-intake.mrgalvipro.workers.dev';
const PROD_WORKER = 'https://galvicare-0-5-production.mrgalvipro.workers.dev';
const QA_GA4 = 'G-V5ZPM5L19T';
const QA_CLARITY = 'xswd8m446z';
const QA_CALENDLY = 'https://calendly.com/galvilpro/galviclinic-day7c-qa';
const TEST_STRIPE_MARKER = 'https://buy.stripe.com/test_';
const AUTHORITATIVE_SIGNATURE = 'Day 7D progressive customer-intelligence browser adapter.';
const LEGACY_SIGNATURE = 'DAY7D_CUSTOMER_INTELLIGENCE_ADAPTER_SOURCE';

let html = readFileSync(SOURCE, 'utf8');
const day7dBrowser = readFileSync(DAY7D_BROWSER, 'utf8');

const requiredQaContracts = [
  `const GALVICARE_INTAKE_ENDPOINT = '${QA_WORKER}';`,
  "const GALVISCORE_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_",
  "PAYMENT_LINK: 'https://buy.stripe.com/test_",
  "const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_",
  "const GALVIPATH_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_"
];
for (const contract of requiredQaContracts) {
  if (!html.includes(contract)) throw new Error(`QA source contract missing: ${contract}`);
}
if (html.includes(PROD_WORKER)) throw new Error('Production Worker endpoint is present in QA source.');

const day7dRequired = [
  AUTHORITATIVE_SIGNATURE,
  'needs_followup',
  'save_galvishot_followup',
  'save_galvisight_followup',
  'save_galvipath_followup',
  'galvisight-followup-questions',
  'galvipath-followup-questions',
  'evidence_version_bumped',
  'installAuthoritativeStageRoutes',
  'invokeLegacyWithResponse',
  'MAX_VISIBLE_TARGETED_QUESTIONS=3',
  'slice(0,MAX_VISIBLE_TARGETED_QUESTIONS)'
];
for (const contract of day7dRequired) {
  if (!day7dBrowser.includes(contract)) throw new Error(`Day 7D browser contract missing: ${contract}`);
}
if (day7dBrowser.includes('MAX_TARGETED_QUESTIONS_PER_STAGE=1')) {
  throw new Error('Day 7D browser must not hard-code a universal one-question rule.');
}

html = html.replaceAll('G-KXJFKN7RTS', QA_GA4);
html = html.replaceAll('xjsdmprr4z', QA_CLARITY);
html = html.replace(
  "const GALVICARE_CANONICAL_CUSTOMER_URL = 'https://www.galvipro.com/#galvitriage';",
  `const GALVICARE_CANONICAL_CUSTOMER_URL = '${QA_CUSTOMER_URL}';`
);
html = html.replace(
  /const GALVICLINIC_FALLBACK_URL = '[^']+';/,
  `const GALVICLINIC_FALLBACK_URL = '${QA_CALENDLY}';`
);

const qaBanner = `\n<div id="galvicare-qa-environment-banner" role="status" style="position:sticky;top:0;z-index:99999;background:#7f1d1d;color:#fff;text-align:center;font:700 13px/1.3 Arial,sans-serif;padding:8px 12px;letter-spacing:.08em;">GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS</div>`;
html = html.replace(/<body([^>]*)>/, `<body$1>${qaBanner}`);
html = html.replace('</head>', `  <meta name="galvicare-environment" content="qa" />\n  <meta name="galvicare-qa-frontend" content="day7d-progressive-intelligence-v2" />\n</head>`);

function removeEmbeddedAdapter(signature) {
  while (html.includes(signature)) {
    const markerStart = html.indexOf(signature);
    const scriptStart = html.lastIndexOf('<script>', markerStart);
    const scriptEnd = html.indexOf('</script>', markerStart);
    if (scriptStart < 0 || scriptEnd < 0) throw new Error(`Embedded adapter containing ${signature} is not bounded by a script tag.`);
    html = html.slice(0, scriptStart) + html.slice(scriptEnd + '</script>'.length);
  }
}
removeEmbeddedAdapter(LEGACY_SIGNATURE);
removeEmbeddedAdapter(AUTHORITATIVE_SIGNATURE);

html = html.replace('</body>', `<script>\n${day7dBrowser}\n</script>\n</body>`);

const adapterCount = html.split(AUTHORITATIVE_SIGNATURE).length - 1;
if (adapterCount !== 1) throw new Error(`Generated QA frontend must contain exactly one Day 7D adapter; found ${adapterCount}.`);
if (html.includes(LEGACY_SIGNATURE)) throw new Error('Legacy Day 7D adapter marker survived the QA build.');
if (html.includes("if(product==='GalviShot') return;")) throw new Error('Stale GalviShot adapter bypass survived the QA build.');

for (const required of [QA_WORKER, QA_CUSTOMER_URL, TEST_STRIPE_MARKER, QA_GA4, QA_CLARITY, QA_CALENDLY, 'galvisight-followup-questions', 'galvipath-followup-questions', 'evidence_version_bumped', 'installAuthoritativeStageRoutes', 'invokeLegacyWithResponse', 'MAX_VISIBLE_TARGETED_QUESTIONS=3']) {
  if (!html.includes(required)) throw new Error(`Generated QA frontend missing: ${required}`);
}
if (html.includes(PROD_WORKER)) throw new Error('Production Worker leaked into QA frontend.');

const liveLinks = [
  'https://buy.stripe.com/14A00kbjycvpgoGfBY53O00',
  'https://buy.stripe.com/bJe7sM5Ze9jdc8qgG253O01',
  'https://buy.stripe.com/00w14odrG1QLdcu9dA53O02',
  'https://buy.stripe.com/eVq3cw3R63YT6O6ahE53O03'
];
for (const link of liveLinks) {
  if (html.includes(link)) throw new Error(`LIVE Stripe link leaked into QA frontend: ${link}`);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html, 'utf8');
console.log(`PASS — ${OUT} generated with exactly one authoritative Day 7D downstream controller.`);
console.log('PASS — follow-up UI is bounded to three visible questions; the Worker determines the approved 0–3 count.');
console.log(`QA URL: ${QA_CUSTOMER_URL}`);
console.log(`QA API: ${QA_WORKER}/api`);
console.log(`QA Calendly: ${QA_CALENDLY}`);
