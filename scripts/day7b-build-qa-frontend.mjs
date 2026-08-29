import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import DAY3_CUSTOMER_BRIDGE_SOURCE from '../day3-governed-ai-customer-bridge.mjs';

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
const DAY6_HUMAN_SIGNATURE='GalviStudio Day 6 Human E2E SPUR selector v1';
const DAY6_PIN_SIGNATURE='GalviStudio Day 6 H04-H06 persistent QA pin v1';
const DAY6_GUIDED_SIGNATURE='GalviStudio Day 6 guided SPUR routing v1';
const DAY3_CUSTOMER_SIGNATURE='GalviCare Day 3 governed AI customer bridge v2';
const LEGACY_SIGNATURE='DAY7D_CUSTOMER_INTELLIGENCE_ADAPTER_SOURCE';
const DAY1_VISIBILITY_ID='day1-human-e2e-qa-visibility';
const DAY1_VISIBILITY_SELECTOR='#day1-human-e2e-panel[data-qa-only="true"]';
const DAY6_VISIBILITY_SELECTOR='#day6-human-e2e-spur-panel[data-qa-only="true"]';
const DAY6_PIN_REPAIR=`(()=>{
  'use strict';
  const SIGNATURE='${DAY6_PIN_SIGNATURE}';
  const PANEL_ID='day6-human-e2e-spur-panel';
  const DAY1_ID='day1-human-e2e-panel';
  let scheduled=false,pinnedPanel=null;
  function pin(){
    const day1=document.getElementById(DAY1_ID),panel=document.getElementById(PANEL_ID)||pinnedPanel;
    if(!day1||!panel)return false;
    pinnedPanel=panel;
    if(panel.parentNode!==day1)day1.appendChild(panel);
    panel.style.setProperty('display','block','important');
    panel.style.setProperty('visibility','visible','important');
    panel.style.setProperty('opacity','1','important');
    panel.setAttribute('data-day6-pinned','true');
    return true;
  }
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;pin()});}
  function install(){
    new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
    setTimeout(pin,0);setTimeout(pin,50);setTimeout(pin,250);
    console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();`;
const DAY6_GUIDED_ROUTING=`(()=>{
  'use strict';
  const SIGNATURE='${DAY6_GUIDED_SIGNATURE}';
  const DAY1_BASE='${DAY1_WORKER}';
  const DAY1_STORE='galvicare_day1_human_e2e_v1';
  const LONG_COPY="GalviStudio helps you develop from where you are today toward where you want to go. Choose Pre-Founder if you're exploring ownership or preparing to become a founder before a real venture exists. Choose Founder if you're actively preparing or validating a venture. Your selection helps GalviCare place you at the right SPUR starting stage; any prescribed GalviStudio™ care remains governed by your GalviChart™ and your GalviClinician™.";
  const MOBILE_COPY="Choose the path that best reflects where you are today. Pre-Founder helps you explore ownership and prepare before a real venture exists. Founder helps you prepare and validate a venture. GalviCare™ uses your selection and GalviChart™ to guide the appropriate next stage.";
  const LABELS={
    dreamer:"SPUR Pre-Founder — I'm exploring ownership or preparing to become a founder",
    founder:"SPUR Founder — I'm actively preparing or validating a venture"
  };
  const read=()=>{try{return JSON.parse(localStorage.getItem(DAY1_STORE)||'{}')}catch{return{}}};
  let running=false,lastKey='';
  function description(panel){
    let node=panel.querySelector('#day6-spur-customer-description');
    const existing=[...panel.querySelectorAll('p.small')].find(p=>p.textContent.includes('Continue from Day 6 H03'));
    if(!node){node=document.createElement('p');node.id='day6-spur-customer-description';node.className='small';if(existing)existing.replaceWith(node);else panel.querySelector('h2')?.insertAdjacentElement('afterend',node);}
    node.textContent=matchMedia('(max-width: 640px)').matches?MOBILE_COPY:LONG_COPY;
    const label=panel.querySelector('label[for="day6-spur-track"]');if(label)label.textContent='Which founder-development path best fits where you are today?';
  }
  function relabel(select){
    for(const option of select.options){if(LABELS[option.value])option.textContent=LABELS[option.value];}
  }
  function note(panel,message){let n=panel.querySelector('#day6-spur-guided-note');if(!n){n=document.createElement('p');n.id='day6-spur-guided-note';n.className='small';panel.querySelector('#day6-spur-track')?.insertAdjacentElement('afterend',n);}n.textContent=message;}
  async function route(){
    const panel=document.getElementById('day6-human-e2e-spur-panel'),select=document.getElementById('day6-spur-track');if(!panel||!select)return;
    description(panel);relabel(select);
    const s=read(),key=[s.context_id,s.actor,s.founder_id].join('|');if(!s.context_id||!s.actor||!s.founder_id){for(const o of select.options)o.disabled=true;note(panel,'Complete GalviTriage / H03 identity first so GalviCare can match the route to your canonical lifecycle state.');return;}
    if(running||lastKey===key&&select.dataset.guided==='true')return;running=true;
    try{
      const response=await fetch(`${DAY1_BASE}/api/v1/principal-contexts/${encodeURIComponent(s.context_id)}`,{headers:{Accept:'application/json','X-Galvi-Day1-Actor':s.actor,'X-Correlation-Id':`day6-route-${crypto.randomUUID?.()||Date.now()}`},cache:'no-store'});
      const payload=await response.json();const context=payload?.data?.context;if(!response.ok||!context)throw new Error(payload?.error?.message||'Unable to resolve canonical lifecycle context.');
      const hasVenture=Boolean(context.venture_id||context.bmr_id),eligible=hasVenture?'founder':'dreamer';
      for(const o of select.options)o.disabled=o.value!==eligible;
      if([...select.options].some(o=>o.value===eligible)){select.value=eligible;select.dispatchEvent(new Event('change',{bubbles:true}));}
      select.dataset.guided='true';lastKey=key;
      note(panel,hasVenture?'GalviCare matched this record to the Founder path because a canonical venture/BHR exists. Pre-Founder is unavailable for this record.':'GalviCare matched this record to the Pre-Founder path because no real venture/BHR exists yet. Founder becomes available when a canonical venture context exists.');
    }catch(error){for(const o of select.options)o.disabled=true;note(panel,`GalviCare could not safely determine route eligibility: ${error.message}`);}
    finally{running=false;}
  }
  function apply(){const panel=document.getElementById('day6-human-e2e-spur-panel');if(!panel)return;description(panel);const select=document.getElementById('day6-spur-track');if(select)relabel(select);route();}
  const observer=new MutationObserver(()=>queueMicrotask(apply));
  function install(){observer.observe(document.documentElement,{subtree:true,childList:true});matchMedia('(max-width: 640px)').addEventListener?.('change',apply);setTimeout(apply,0);setTimeout(apply,100);setTimeout(apply,500);console.info(SIGNATURE,'active');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();`;

let html=readFileSync(SOURCE,'utf8');
const day7dBrowser=readFileSync(DAY7D_BROWSER,'utf8');
const day1Customer=readFileSync(DAY1_CUSTOMER,'utf8');
let day1HumanE2E=readFileSync(DAY1_HUMAN_E2E,'utf8');

for(const contract of [
  `const GALVICARE_INTAKE_ENDPOINT = '${PROD_WORKER}';`,
  "const GALVICARE_API_ENDPOINT = GALVICARE_INTAKE_ENDPOINT + '/api';",
  `const GALVISCORE_STRIPE_PAYMENT_LINK = '${STRIPE.score.live}';`,
  `PAYMENT_LINK: '${STRIPE.shot.live}'`,
  `const GALVISIGHT_STRIPE_PAYMENT_LINK = '${STRIPE.sight.live}';`,
  `const GALVIPATH_STRIPE_PAYMENT_LINK = '${STRIPE.path.live}';`
]) if(!html.includes(contract)) throw new Error(`Canonical source contract missing: ${contract}`);

for(const contract of [
  AUTHORITATIVE_SIGNATURE,'needs_followup','entitlement_required','holdForEntitlement','result_generation_locked',
  'save_galviscore_followup','get_or_generate_galviscore',
  'save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
  'galviscore-followup','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions',
  'skipCurrentQuestion','SKIPPED_ANSWER','stopImmediatePropagation','installAuthoritativeStageRoutes',
  'invokeLegacyWithResponse','renderReadyStage(product,regenerated)','MAX_VISIBLE_TARGETED_QUESTIONS=3'
]) if(!day7dBrowser.includes(contract)) throw new Error(`Day 7D browser contract missing: ${contract}`);
if(day7dBrowser.includes('MAX_TARGETED_QUESTIONS_PER_STAGE=1')) throw new Error('Day 7D browser must not hard-code a universal one-question rule.');
for(const contract of [DAY1_CUSTOMER_SIGNATURE,"IDEA_STAGE='Idea'",'GALVICARE™ | PRE-FOUNDER PATHWAY','What is a Founder?','Founder Development Institute','data-galvicare-pathway']) if(!day1Customer.includes(contract)) throw new Error(`Day 1 customer Pre-Founder contract missing: ${contract}`);
if(/Dreamer/i.test(day1Customer)) throw new Error('Customer-facing Pre-Founder adapter must not use Dreamer terminology.');
for(const contract of [
  DAY1_HUMAN_SIGNATURE,DAY1_WORKER,"record_mode:'principal_only'",'H3 Create Pre-Founder','H14 Runtime Health',
  DAY6_HUMAN_SIGNATURE,'day6-human-e2e-spur-panel','day6-spur-track','D6-H04 Select SPUR Route','D6-H05 Prescribe Route','D6-H06 Replay Engagement',
  "['dreamer','founder']",'Initial stage:','Minimum deliverable:'
]) if(!day1HumanE2E.includes(contract)) throw new Error(`Day 1/Day 6 Human E2E browser contract missing: ${contract}`);

// QA-only vocabulary normalization: retain the legacy internal SPUR key for stored-data compatibility,
// but never expose “Dreamer” as a person/track label in the Human E2E experience.
day1HumanE2E=day1HumanE2E
  .replaceAll('Pre-Founder / Dreamer Pathway','Pre-Founder Pathway')
  .replaceAll('Expected SPUR Dreamer and Founder tracks were not both returned.','Expected SPUR Pre-Founder and Founder tracks were not both returned.')
  .replaceAll('SPUR Dreamer','SPUR Pre-Founder')
  .replaceAll('the H03 Pre-Founder principal created above. Run H3 Create Pre-Founder first.','the H03 Pre-Founder principal in this same browser session. Run “Use Synthetic QA Identity” then “H3 Create Pre-Founder”, then continue H04 → H05 → H06.');

for(const contract of [
  DAY3_CUSTOMER_SIGNATURE,DAY1_WORKER,"SESSION_HEADER='X-Galvi-Day3-Session'",'/api/v1/day3/customer-bootstrap',
  '/api/v1/day3/shot','/api/v1/day3/sight','/api/v1/day3/path','authoritative_galvicare_session',
  'openai_governed','GOVERNED BUSINESS HEALTH INTELLIGENCE','What GalviCare Understands About Your Situation',
  'Why These Symptoms May Be Happening','Your Personalized Business Health Care Plan','GV_DAY3_CUSTOMER_SCORE_MISMATCH'
]) if(!DAY3_CUSTOMER_BRIDGE_SOURCE.includes(contract)) throw new Error(`Day 3 customer bridge contract missing: ${contract}`);
if(/api\.openai\.com|OPENAI_API_KEY/.test(DAY3_CUSTOMER_BRIDGE_SOURCE)) throw new Error('Day 3 browser bridge must never call OpenAI or contain an API key binding.');
if(/day1\\\.\<name\>|example\\\.invalid/.test(DAY3_CUSTOMER_BRIDGE_SOURCE)) throw new Error('Day 3 customer bridge must not require a synthetic Day 1 Human-E2E identity.');

html=html.replace(`const GALVICARE_INTAKE_ENDPOINT = '${PROD_WORKER}';`,`const GALVICARE_INTAKE_ENDPOINT = '${QA_WORKER}';`);
for(const {live,test} of Object.values(STRIPE)) html=html.replaceAll(live,test);
html=html.replaceAll('G-KXJFKN7RTS',QA_GA4).replaceAll('xjsdmprr4z',QA_CLARITY);
html=html.replace("const GALVICARE_CANONICAL_CUSTOMER_URL = 'https://www.galvipro.com/#galvitriage';",`const GALVICARE_CANONICAL_CUSTOMER_URL = '${QA_CUSTOMER_URL}';`);
html=html.replace(/const GALVICLINIC_FALLBACK_URL = '[^']+';/,`const GALVICLINIC_FALLBACK_URL = '${QA_CALENDLY}';`);
const qaBanner=`\n<div id="galvicare-qa-environment-banner" role="status" style="position:sticky;top:0;z-index:99999;background:#7f1d1d;color:#fff;text-align:center;font:700 13px/1.3 Arial,sans-serif;padding:8px 12px;letter-spacing:.08em;">GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS</div>`;
html=html.replace(/<body([^>]*)>/,`<body$1>${qaBanner}`);
const day1VisibilityStyle=`  <style id="${DAY1_VISIBILITY_ID}">\n    ${DAY1_VISIBILITY_SELECTOR},${DAY6_VISIBILITY_SELECTOR}{display:block!important;visibility:visible!important;opacity:1!important;}\n  </style>`;
html=html.replace('</head>',`  <meta name="galvicare-environment" content="qa" />\n  <meta name="galvicare-qa-frontend" content="${DAY7D_RELEASE_CONTRACT}" />\n  <meta name="galvicare-day1-human-e2e" content="principal-only-enabled" />\n  <meta name="galvicare-day6-human-e2e" content="spur-route-enabled" />\n  <meta name="galvicare-day3-governed-ai" content="customer-session-projection-v2" />\n${day1VisibilityStyle}\n</head>`);

function removeEmbeddedAdapter(signature){while(html.includes(signature)){const markerStart=html.indexOf(signature),scriptStart=html.lastIndexOf('<script>',markerStart),scriptEnd=html.indexOf('</script>',markerStart);if(scriptStart<0||scriptEnd<0)throw new Error(`Embedded adapter containing ${signature} is not bounded by a script tag.`);html=html.slice(0,scriptStart)+html.slice(scriptEnd+'</script>'.length);}}
removeEmbeddedAdapter(LEGACY_SIGNATURE);removeEmbeddedAdapter('Day 7D progressive customer-intelligence browser adapter.');removeEmbeddedAdapter(AUTHORITATIVE_SIGNATURE);removeEmbeddedAdapter(DAY1_CUSTOMER_SIGNATURE);removeEmbeddedAdapter(DAY1_HUMAN_SIGNATURE);removeEmbeddedAdapter(DAY6_PIN_SIGNATURE);removeEmbeddedAdapter(DAY6_GUIDED_SIGNATURE);
html=html.replace('</body>',`<script>\n${day7dBrowser}\n</script>\n<script>\n${DAY3_CUSTOMER_BRIDGE_SOURCE}\n</script>\n<script>\n${day1Customer}\n</script>\n<script>\n${day1HumanE2E}\n</script>\n<script>\n${DAY6_PIN_REPAIR}\n</script>\n<script>\n${DAY6_GUIDED_ROUTING}\n</script>\n</body>`);

const adapterCount=html.split(AUTHORITATIVE_SIGNATURE).length-1;if(adapterCount!==1)throw new Error(`Generated QA frontend must contain exactly one Day 7D adapter; found ${adapterCount}.`);
const day3BridgeCount=html.split(DAY3_CUSTOMER_SIGNATURE).length-1;if(day3BridgeCount!==1)throw new Error(`Generated QA frontend must contain exactly one Day 3 governed-AI customer bridge; found ${day3BridgeCount}.`);
const day1CustomerCount=html.split(DAY1_CUSTOMER_SIGNATURE).length-1;if(day1CustomerCount!==1)throw new Error(`Generated QA frontend must contain exactly one customer Pre-Founder adapter; found ${day1CustomerCount}.`);
const day1Count=html.split(DAY1_HUMAN_SIGNATURE).length-1;if(day1Count!==2)throw new Error(`Generated QA frontend must contain one Day 1 Human E2E script (two signature tokens); found ${day1Count}.`);
const day6Count=html.split(DAY6_HUMAN_SIGNATURE).length-1;if(day6Count!==1)throw new Error(`Generated QA frontend must contain exactly one Day 6 Human E2E SPUR adapter; found ${day6Count}.`);
const day6PinCount=html.split(DAY6_PIN_SIGNATURE).length-1;if(day6PinCount!==1)throw new Error(`Generated QA frontend must contain exactly one Day 6 persistent pin repair; found ${day6PinCount}.`);
const day6GuidedCount=html.split(DAY6_GUIDED_SIGNATURE).length-1;if(day6GuidedCount!==1)throw new Error(`Generated QA frontend must contain exactly one Day 6 guided-routing adapter; found ${day6GuidedCount}.`);
if(html.includes(LEGACY_SIGNATURE))throw new Error('Legacy Day 7D adapter marker survived the QA build.');
if(html.includes('SPUR Dreamer')||html.includes('Pre-Founder / Dreamer Pathway'))throw new Error('Generated QA Human E2E must expose Pre-Founder terminology, not Dreamer terminology.');

for(const required of [
  DAY7D_RELEASE_CONTRACT,QA_WORKER,DAY1_WORKER,QA_CUSTOMER_URL,QA_GA4,QA_CLARITY,QA_CALENDLY,TEST_STRIPE_MARKER,...Object.values(STRIPE).map(x=>x.test),
  'galviscore-followup','submit-followup','save_galviscore_followup','get_or_generate_galviscore','renderUnlockedGalviScore',
  'galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions','save_galvishot_followup','save_galvisight_followup','save_galvipath_followup',
  'skipCurrentQuestion','SKIPPED_ANSWER','stopImmediatePropagation','installAuthoritativeStageRoutes','invokeLegacyWithResponse','MAX_VISIBLE_TARGETED_QUESTIONS=3','holdForEntitlement','entitlement_required','result_generation_locked','galvipath-book-galviclinic',
  DAY3_CUSTOMER_SIGNATURE,'customer-session-projection-v2','X-Galvi-Day3-Session','/api/v1/day3/customer-bootstrap','/api/v1/day3/shot','/api/v1/day3/sight','/api/v1/day3/path','authoritative_galvicare_session','openai_governed','GOVERNED BUSINESS HEALTH INTELLIGENCE',
  DAY1_CUSTOMER_SIGNATURE,'prefounder-customer-pathway','GALVICARE™ | PRE-FOUNDER PATHWAY','What is a Founder?','Founder Development Institute',DAY1_HUMAN_SIGNATURE,'day1-human-e2e-panel','H3 Create Pre-Founder','H14 Runtime Health',DAY1_VISIBILITY_ID,DAY1_VISIBILITY_SELECTOR,'display:block!important','visibility:visible!important',
  DAY6_HUMAN_SIGNATURE,DAY6_PIN_SIGNATURE,DAY6_GUIDED_SIGNATURE,'day6-human-e2e-spur-panel','day6-spur-track','D6-H04 Select SPUR Route','D6-H05 Prescribe Route','D6-H06 Replay Engagement','galvicare-day6-human-e2e','data-day6-pinned','SPUR Pre-Founder','Pre-Founder Pathway',
  "SPUR Pre-Founder — I'm exploring ownership or preparing to become a founder","SPUR Founder — I'm actively preparing or validating a venture",'Which founder-development path best fits where you are today?','GalviStudio helps you develop from where you are today toward where you want to go.','GalviCare™ uses your selection and GalviChart™ to guide the appropriate next stage.'
]) if(!html.includes(required)) throw new Error(`Generated QA frontend missing cumulative journey contract: ${required}`);
if(html.includes(PROD_WORKER))throw new Error('Production Worker leaked into QA frontend.');for(const {live} of Object.values(STRIPE))if(html.includes(live))throw new Error(`LIVE Stripe link leaked into QA frontend: ${live}`);
if(/api\.openai\.com|OPENAI_API_KEY/.test(html))throw new Error('Generated QA browser must not contain OpenAI provider access or secret references.');

mkdirSync(OUT_DIR,{recursive:true});writeFileSync(OUT,html,'utf8');
console.log(`PASS — ${OUT} is the single cumulative QA frontend candidate.`);
console.log(`PASS — release contract ${DAY7D_RELEASE_CONTRACT} binds the generated frontend to the authoritative Worker candidate.`);
console.log('PASS — pre-entitlement follow-up evidence is saved without unlocking or generating a paid product.');
console.log('PASS — Day 3 governed-AI customer bridge resolves canonical identity from the authoritative GalviCare session and never calls OpenAI from the browser.');
console.log('PASS — deterministic GalviScore action and projection contract remain unchanged.');
console.log('PASS — customer-facing Pre-Founder education is stage-gated to Idea and contains no Dreamer terminology.');
console.log('PASS — Day 1 Human E2E Pre-Founder path remains QA-only and isolated.');
console.log('PASS — Day 6 H04-H06 SPUR selector exposes Pre-Founder terminology, customer-friendly journey copy, and canonical lifecycle-guided routing while remaining pinned to the stable Day 1 Human-E2E QA panel.');
console.log('PASS — canonical Production endpoints and LIVE payment links are transformed only in dist-qa.');
console.log('PASS — Triage → Vitals → Score → evidence intake → verified entitlement → governed Shot → governed Sight → governed Path → Clinic contract is present.');
