import { readFileSync, writeFileSync } from 'node:fs';

const required = {
  GALVISCORE_LIVE_PAYMENT_LINK: process.env.GALVISCORE_LIVE_PAYMENT_LINK,
  GALVISHOT_LIVE_PAYMENT_LINK: process.env.GALVISHOT_LIVE_PAYMENT_LINK,
  GALVISIGHT_LIVE_PAYMENT_LINK: process.env.GALVISIGHT_LIVE_PAYMENT_LINK,
  GALVIPATH_LIVE_PAYMENT_LINK: process.env.GALVIPATH_LIVE_PAYMENT_LINK
};

const missing = Object.entries(required).filter(([, value]) => !value).map(([key]) => key);
if (missing.length) {
  console.error(`BLOCKED — MISSING APPROVED STRIPE LIVE PAYMENT LINK(S): ${missing.join(', ')}`);
  process.exit(2);
}

for (const [key, value] of Object.entries(required)) {
  if (!/^https:\/\/buy\.stripe\.com\//.test(value) || value.includes('/test_')) {
    console.error(`BLOCKED — ${key} is not an approved-looking Stripe LIVE Payment Link.`);
    process.exit(2);
  }
}

let html = readFileSync('index.html', 'utf8');

const replacements = [
  [
    "const GALVICARE_INTAKE_ENDPOINT = 'https://galvicare-triage-intake.mrgalvipro.workers.dev';",
    "const GALVICARE_INTAKE_ENDPOINT = 'https://galvicare-0-5-production.mrgalvipro.workers.dev';"
  ],
  [
    "const GALVISCORE_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_bJe7sM5Ze9jdc8qgG253O01';",
    `const GALVISCORE_STRIPE_PAYMENT_LINK = '${required.GALVISCORE_LIVE_PAYMENT_LINK}';`
  ],
  [
    "PAYMENT_LINK: 'https://buy.stripe.com/test_00w14odrG1QLdcu9dA53O02'",
    `PAYMENT_LINK: '${required.GALVISHOT_LIVE_PAYMENT_LINK}'`
  ],
  [
    "const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_eVq3cw3R63YT6O6ahE53O03';",
    `const GALVISIGHT_STRIPE_PAYMENT_LINK = '${required.GALVISIGHT_LIVE_PAYMENT_LINK}';`
  ],
  [
    "const GALVIPATH_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_fZu14ofzO9jd8We1L853O05';",
    `const GALVIPATH_STRIPE_PAYMENT_LINK = '${required.GALVIPATH_LIVE_PAYMENT_LINK}';`
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

writeFileSync('index.production.html', html, 'utf8');
console.log('PASS — index.production.html generated with Production Worker, four Stripe LIVE links, and QA UI controls hidden.');
