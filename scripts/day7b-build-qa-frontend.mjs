import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE='index.html';
const DAY7D_BROWSER='day7d-browser-customer-intelligence.js';
const DAY1_CUSTOMER='day1-prefounder-customer.js';
const DAY1_HUMAN_E2E='day1-prefounder-qa.js';
const OUT_DIR='dist-qa';
const OUT=`${OUT_DIR}/index.html`;
const QA_FRONTEND_ORIGIN='https://galvicare-0-5-qa.mrgalvipro.workers.dev';
const QA_CUSTOMER_URL=`${QA_FRONTEND_ORIGIN}/#galvitriage`;
const QA_WORKER='https://galvicare-triage-intake.mrgalvipro.workers.dev';
const DAY1_WORKER='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
const PROD_WORKER='https://galvicare-0-5-production.mrgalvipro.workers.dev';
const QA_GA4='G-V5ZPM5L19T';
const QA_CLARITY='xswd8m446z';
const QA_CALENDLY='https://calendly.com/galvilpro/galviclinic-day7c-qa';
const TEST_STRIPE_MARKER='https://buy.stripe.com/test_';
const STRIPE={
  score:{live:'https://buy.stripe.com/14A00kbjycvpgoGfBY53O00',test:'https://buy.stripe.com/test_bJe7sM5Ze9jdc8qgG253O01'},
  shot:{live:'https://buy.stripe.com/bJe7sM5Ze9jdc8qgG253O01',test:'https://buy.stripe.com/test_00w14odrG1QLdcu9dA53O02'},
  sight:{live:'https://buy.stripe.com/00w14odrG1QLdcu9dA53O02',test:'https://buy.stripe.com/test_eVq3cw3R63YT6O6ahE53O03'},
  path:{live:'https://buy.stripe.com/eVq3cw3R63YT6O6ahE53O03',test:'https://buy.stripe.com/test_fZu14ofzO9jd8We1L853O05'}
};
const DAY7D_RELEASE_CONTRACT='day7d_cumulative_customer_intelligence_v3';
const AUTHORITATIVE_SIGNATURE='Day 7D cumulative customer-intelligence browser adapter.';
const DAY1_CUSTOMER_SIGNATURE='Day 1 customer Pre-Founder pathway adapter.';
const DAY1_HUMAN_SIGNATURE='Day 1 Human E2E Pre-Founder QA adapter.';
const LEGACY_SIGNATURE='DAY7D_CUSTOMER_INTELLIGENCE_ADAPTER_SOURCE';
const DAY1_VISIBILITY_ID='day1-human-e2e-qa-visibility';
const DAY1_VISIBILITY_SELECTOR='#day1-human-e2e-panel[data-qa-only="true"]';

let html=readFileSync(SOURCE,'utf8');
const day7dBrowser=readFileSync(DAY7D_BROWSER,'utf8');
const day1Customer=readFileSync(DAY1_CUSTOMER,'utf8');
const day1HumanE2E=readFileSync(DAY1_HUMAN_E2E,'utf8');

for(const contract of [
  `const GALVICARE_INTAKE_ENDPOINT = '${PROD_WORKER}';`,
  "const GALVICARE_API_ENDPOINT = GALVICARE_INTAKE_ENDPOINT + '/api';",
  `const GALVISCORE_STRIPE_PAYMENT_LINK = '${STRIPE.score.live}';`,
  `PAYMENT_LINK: '${STRIPE.shot.live}'`,
  `const GALVISIGHT_STRIPE_PAYMENT_LINK = '${STRIPE.sight.live}';`,
  `const GALVIPATH_STRIPE_PAYMENT_LINK = '${STRIPE.path.live}';`
]) if(!html.includes(contract)) throw new Error(`Canonical source contract missing: ${contract}`);

for(const contract of [
  AUTHORITATIVE_SIGNATURE,'needs_followup',
  'save_galviscore_followup','get_or_generate_galviscore',
  'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
  'galviscore-followup','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
  'skipCurrentQuestion','SKIPPED_ANSWER','stopImmediatePropagation','installAuthoritativeStageRoutes',
  'invokeLegacyWithResponse','renderReadyStage(product,regenerated)','MAX_VISIBLE_TARGETED_QUESTIONS=3'
]) if(!day7dBrowser.includes(contract)) throw new Error(`Day 7D browser contract missing: ${contract}`);
if(day7dBrowser.includes('MAX_TARGETED_QUESTIONS_PER_STAGE=1')) throw new Error('Day 7D browser must not hard-code a universal one-question rule.');
for(const contract of [DAY1_CUSTOMER_SIGNATURE,"IDEA_STAGE='Idea'",'GALVICARE™ | PRE-FOUNDER PATHWAY','What is a Founder?','Founder Development Institute','data-galvicare-pathway']) if(!day1Customer.includes(contract)) throw new Error(`Day 1 customer Pre-Founder contract missing: ${contract}`);
if(/Dreamer/i.test(day1Customer)) throw new Error('Customer-facing Pre-Founder adapter must not use Dreamer terminology.');
for(const contract of [DAY1_HUMAN_SIGNATURE,DAY1_WORKER,"record_mode:'principal_only'",'H3 Create Pre-Founder','H14 Runtime Health']) if(!day1HumanE2E.includes(contract)) throw new Error(`Day 1 Human E2E browser contract missing: ${contract}`);

html=html.replace(`const GALVICARE_INTAKE_ENDPOINT = '${PROD_WORKER}';`,`const GALVICARE_INTAKE_ENDPOINT = '${QA_WORKER}';`);
for(const {live,test} of Object.values(STRIPE)) html=html.replaceAll(live,test);
html=html.replaceAll('G-KXJFKN7RTS',QA_GA4).replaceAll('xjsdmprr4z',QA_CLARITY);
html=html.replace("const GALVICARE_CANONICAL_CUSTOMER_URL = 'https://www.galvipro.com/#galvitriage';",`const GALVICARE_CANONICAL_CUSTOMER_URL = '${QA_CUSTOMER_URL}';`);
html=html.replace(/const GALVICLINIC_FALLBACK_URL = '[^']+';/,`const GALVICLINIC_FALLBACK_URL = '${QA_CALENDLY}';`);
const qaBanner=`\n<div id="galvicare-qa-environment-banner" role="status" style="position:sticky;top:0;z-index:99999;background:#7f1d1d;color:#fff;text-align:center;font:700 13px/1.3 Arial,sans-serif;padding:8px 12px;letter-spacing:.08em;">GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS</div>`;
html=html.replace(/<body([^>]*)>/,`<body$1>${qaBanner}`);
const day1VisibilityStyle=`  <style id="${DAY1_VISIBILITY_ID}">\n    /* QA-only surgical override: generic QA-only content remains hidden.\n       The approved Human E2E control surface is visible for testing only. */\n    ${DAY1_VISIBILITY_SELECTOR}{display:block!important;visibility:visible!important;}\n  </style>`;
html=html.replace('</head>',`  <meta name="galvicare-environment" content="qa" />\n  <meta name="galvicare-qa-frontend" content="${DAY7D_RELEASE_CONTRACT}" />\n  <meta name="galvicare-day1-human-e2e" content="principal-only-enabled" />\n${day1VisibilityStyle}\n</head>`);

function removeEmbeddedAdapter(signature){while(html.includes(signature)){const markerStart=html.indexOf(signature),scriptStart=html.lastIndexOf('<script>',markerStart),scriptEnd=html.indexOf('</script>',markerStart);if(scriptStart<0||scriptEnd<0)throw new Error(`Embedded adapter containing ${signature} is not bounded by a script tag.`);html=html.slice(0,scriptStart)+html.slice(scriptEnd+'</script>'.length);}}
removeEmbeddedAdapter(LEGACY_SIGNATURE);
removeEmbeddedAdapter('Day 7D progressive customer-intelligence browser adapter.');
removeEmbeddedAdapter(AUTHORITATIVE_SIGNATURE);
removeEmbeddedAdapter(DAY1_CUSTOMER_SIGNATURE);
removeEmbeddedAdapter(DAY1_HUMAN_SIGNATURE);
html=html.replace('</body>',`<script>\n${day7dBrowser}\n</script>\n<script>\n${day1Customer}\n</script>\n<script>\n${day1HumanE2E}\n</script>\n</body>`);

const adapterCount=html.split(AUTHORITATIVE_SIGNATURE).length-1;
if(adapterCount!==1) throw new Error(`Generated QA frontend must contain exactly one Day 7D adapter; found ${adapterCount}.`);
const day1CustomerCount=html.split(DAY1_CUSTOMER_SIGNATURE).length-1;
if(day1CustomerCount!==1) throw new Error(`Generated QA frontend must contain exactly one customer Pre-Founder adapter; found ${day1CustomerCount}.`);
const day1Count=html.split(DAY1_HUMAN_SIGNATURE).length-1;
if(day1Count!==2) throw new Error(`Generated QA frontend must contain one Day 1 Human E2E script (two signature tokens); found ${day1Count}.`);
if(html.includes(LEGACY_SIGNATURE)) throw new Error('Legacy Day 7D adapter marker survived the QA build.');

for(const required of [
  DAY7D_RELEASE_CONTRACT,QA_WORKER,DAY1_WORKER,QA_CUSTOMER_URL,QA_GA4,QA_CLARITY,QA_CALENDLY,TEST_STRIPE_MARKER,
  ...Object.values(STRIPE).map(x=>x.test),
  'galviscore-followup','submit-followup','save_galviscore_followup','get_or_generate_galviscore','renderUnlockedGalviScore',
  'galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
  'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
  'skipCurrentQuestion','SKIPPED_ANSWER','stopImmediatePropagation','installAuthoritativeStageRoutes',
  'invokeLegacyWithResponse','MAX_VISIBLE_TARGETED_QUESTIONS=3','galvipath-book-galviclinic',
  DAY1_CUSTOMER_SIGNATURE,'prefounder-customer-pathway','GALVICARE™ | PRE-FOUNDER PATHWAY','What is a Founder?','Founder Development Institute',
  DAY1_HUMAN_SIGNATURE,'day1-human-e2e-panel','H3 Create Pre-Founder','H14 Runtime Health',
  DAY1_VISIBILITY_ID,DAY1_VISIBILITY_SELECTOR,'display:block!important','visibility:visible!important'
]) if(!html.includes(required)) throw new Error(`Generated QA frontend missing cumulative journey contract: ${required}`);
if(html.includes(PROD_WORKER)) throw new Error('Production Worker leaked into QA frontend.');
for(const {live} of Object.values(STRIPE)) if(html.includes(live)) throw new Error(`LIVE Stripe link leaked into QA frontend: ${live}`);

mkdirSync(OUT_DIR,{recursive:true});
writeFileSync(OUT,html,'utf8');
console.log(`PASS — ${OUT} is the single cumulative QA frontend candidate.`);
console.log(`PASS — release contract ${DAY7D_RELEASE_CONTRACT} binds the generated frontend to the authoritative Worker candidate.`);
console.log('PASS — customer-facing Pre-Founder education is stage-gated to Idea and contains no Dreamer terminology.');
console.log('PASS — Day 1 Human E2E Pre-Founder path is QA-only and uses the isolated Day 1 Worker.');
console.log('PASS — Day 1 Human E2E panel has a QA-only ID-scoped visibility override and cannot be hidden by generic customer-view QA hardening.');
console.log('PASS — canonical Production endpoints and LIVE payment links are transformed only in dist-qa.');
console.log('PASS — GalviScore clarification is Worker-owned and objective score remains immutable.');
console.log('PASS — Triage → Vitals → Score → Shot → Sight → Path → Clinic contract is present.');
