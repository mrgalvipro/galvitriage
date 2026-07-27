import { readFileSync, writeFileSync } from 'node:fs';

const PRESTRIPE = process.argv.includes('--prestripe');
const PROD_ENDPOINT = 'https://galvicare-0-5-production.mrgalvipro.workers.dev';

const defaults = {
  GALVISCORE_LIVE_PAYMENT_LINK: 'https://buy.stripe.com/14A00kbivcypgoGfBY53000',
  GALVISHOT_LIVE_PAYMENT_LINK: 'https://buy.stripe.com/bJe7sM5Ze9jdc8qgG253001',
  GALVISIGHT_LIVE_PAYMENT_LINK: 'https://buy.stripe.com/00w14odrG1QLdcu9dA53002',
  GALVIPATH_LIVE_PAYMENT_LINK: 'https://buy.stripe.com/eVq3cw3R63YT6O6ahE53003'
};

const approved = {
  GALVISCORE_LIVE_PAYMENT_LINK: process.env.GALVISCORE_LIVE_PAYMENT_LINK || defaults.GALVISCORE_LIVE_PAYMENT_LINK,
  GALVISHOT_LIVE_PAYMENT_LINK: process.env.GALVISHOT_LIVE_PAYMENT_LINK || defaults.GALVISHOT_LIVE_PAYMENT_LINK,
  GALVISIGHT_LIVE_PAYMENT_LINK: process.env.GALVISIGHT_LIVE_PAYMENT_LINK || defaults.GALVISIGHT_LIVE_PAYMENT_LINK,
  GALVIPATH_LIVE_PAYMENT_LINK: process.env.GALVIPATH_LIVE_PAYMENT_LINK || defaults.GALVIPATH_LIVE_PAYMENT_LINK
};

const placeholders = {
  GALVISCORE_LIVE_PAYMENT_LINK: '__PENDING_APPROVED_LIVE_GALVISCORE__',
  GALVISHOT_LIVE_PAYMENT_LINK: '__PENDING_APPROVED_LIVE_GALVISHOT__',
  GALVISIGHT_LIVE_PAYMENT_LINK: '__PENDING_APPROVED_LIVE_GALVISIGHT__',
  GALVIPATH_LIVE_PAYMENT_LINK: '__PENDING_APPROVED_LIVE_GALVIPATH__'
};

if (!PRESTRIPE) {
  for (const [key, value] of Object.entries(approved)) {
    if (!/^https:\/\/buy\.stripe\.com\//.test(value) || value.includes('/test_')) {
      console.error(`BLOCKED — ${key} is not an approved-looking Stripe LIVE Payment Link.`);
      process.exit(2);
    }
  }
}

const links = PRESTRIPE ? placeholders : approved;
let html = readFileSync('index.html', 'utf8');

const replacements = [
  [
    "const GALVICARE_INTAKE_ENDPOINT = 'https://galvicare-triage-intake.mrgalvipro.workers.dev';",
    `const GALVICARE_INTAKE_ENDPOINT = '${PROD_ENDPOINT}';`
  ],
  [
    "const GALVISCORE_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_bJe7sM5Ze9jdc8qgG253O01';",
    `const GALVISCORE_STRIPE_PAYMENT_LINK = '${links.GALVISCORE_LIVE_PAYMENT_LINK}';`
  ],
  [
    "PAYMENT_LINK: 'https://buy.stripe.com/test_00w14odrG1QLdcu9dA53O02'",
    `PAYMENT_LINK: '${links.GALVISHOT_LIVE_PAYMENT_LINK}'`
  ],
  [
    "const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_eVq3cw3R63YT6O6ahE53O03';",
    `const GALVISIGHT_STRIPE_PAYMENT_LINK = '${links.GALVISIGHT_LIVE_PAYMENT_LINK}';`
  ],
  [
    "const GALVIPATH_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_fZu14ofzO9jd8We1L853O05';",
    `const GALVIPATH_STRIPE_PAYMENT_LINK = '${links.GALVIPATH_LIVE_PAYMENT_LINK}';`
  ]
];

for (const [from, to] of replacements) {
  if (!html.includes(from)) {
    console.error(`BLOCKED — expected production patch anchor not found: ${from.slice(0, 90)}`);
    process.exit(3);
  }
  html = html.replace(from, to);
}

html = html.replace('</head>', `<style id="day7b-production-hardening">\n[id$="-qa-override"], #qa-ribbon, .qa-ribbon, [data-qa-only="true"] { display:none !important; }\n</style>\n</head>`);

if (html.includes('buy.stripe.com/test_')) {
  console.error('BLOCKED — TEST Stripe Payment Link remains in generated Production artifact.');
  process.exit(4);
}
if (html.includes("const GALVICARE_INTAKE_ENDPOINT = 'https://galvicare-triage-intake.mrgalvipro.workers.dev';")) {
  console.error('BLOCKED — QA Worker endpoint remains in generated Production artifact.');
  process.exit(4);
}
if (!html.includes(PROD_ENDPOINT)) {
  console.error('BLOCKED — Production Worker endpoint missing from generated artifact.');
  process.exit(4);
}

if (!PRESTRIPE) {
  for (const [key, value] of Object.entries(approved)) {
    if (!html.includes(value)) {
      console.error(`BLOCKED — ${key} missing from generated Production artifact.`);
      process.exit(4);
    }
  }
}

const output = PRESTRIPE ? 'index.production.prestripe.html' : 'index.production.html';
writeFileSync(output, html, 'utf8');
console.log(PRESTRIPE
  ? `PASS — ${output} generated with Production Worker, QA controls hidden, TEST Stripe links removed, and four explicit LIVE-link placeholders.`
  : `PASS — ${output} generated with Production Worker, four approved Stripe LIVE links, and QA UI controls hidden.`);
