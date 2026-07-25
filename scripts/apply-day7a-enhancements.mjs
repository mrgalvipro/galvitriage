import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../index.html', import.meta.url);
let html = readFileSync(path, 'utf8');

function replaceOnce(oldValue, newValue, label) {
  if (html.includes(newValue)) return;
  if (!html.includes(oldValue)) {
    throw new Error(`Day 7A enhancement source drift: missing ${label}`);
  }
  html = html.replace(oldValue, newValue);
}

function removeOnce(oldValue, label) {
  if (!html.includes(oldValue)) return;
  html = html.replace(oldValue, '');
}

// Customer-only presentation layer. Internal data and Worker authority remain unchanged.
if (!html.includes('/* Day 7A customer presentation */')) {
  const css = `
  /* Day 7A customer presentation */
  #baseline-qa-status,
  .gshot-stage-pill,
  #galviscore-qa-override,
  #galvishot-live-test-override,
  #galvishot-back-score,
  #galvishot-back-paywall,
  #galvisight-qa-override,
  #galvisight-back-galvishot,
  #return-galvishot-result,
  #galvipath-qa-override,
  #galvipath-back-galvisight,
  #galvishot-executive-summary,
  #galvishot-assumptions,
  #galvisight-assumptions-section,
  #galvisight-evidence-section { display: none !important; }

  body.qa-debug-enabled #baseline-qa-status,
  body.qa-debug-enabled .gshot-stage-pill,
  body.qa-debug-enabled #galviscore-qa-override,
  body.qa-debug-enabled #galvishot-live-test-override,
  body.qa-debug-enabled #galvishot-back-score,
  body.qa-debug-enabled #galvishot-back-paywall,
  body.qa-debug-enabled #galvisight-qa-override,
  body.qa-debug-enabled #galvisight-back-galvishot,
  body.qa-debug-enabled #return-galvishot-result,
  body.qa-debug-enabled #galvipath-qa-override,
  body.qa-debug-enabled #galvipath-back-galvisight,
  body.qa-debug-enabled #galvishot-executive-summary,
  body.qa-debug-enabled #galvishot-assumptions,
  body.qa-debug-enabled #galvisight-assumptions-section,
  body.qa-debug-enabled #galvisight-evidence-section { display: revert !important; }

  .persistent-galviscore {
    margin: 0 0 18px;
    padding: 10px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f8fafc;
    text-align: center;
    font-weight: 700;
  }
  .galvivitals-growth-heading { margin-top: 34px; }
  .customer-progression-copy { margin: 18px 0 8px; line-height: 1.6; }
`;
  html = html.replace('</style>', `${css}\n</style>`);
}

if (!html.includes("qa_debug')==='1'")) {
  html = html.replace(
    '<body>',
    `<body>\n<script>document.addEventListener('DOMContentLoaded',()=>{try{if(new URLSearchParams(location.search).get('qa_debug')==='1')document.body.classList.add('qa-debug-enabled');}catch(e){}});</script>`
  );
}

// GalviTriage
removeOnce(
`<div id="baseline-qa-status" class="panel small" style="border-left:5px solid #174a73;">
    <strong>Baseline QA sequence:</strong> Complete GalviTriage → review GalviVitals → continue to GalviScore → use QA Test Override → continue to GalviShot → use QA Test Override → continue to GalviSight.
  </div>
  `,
'Baseline QA sequence'
);

replaceOnce(
  '<h1 class="hero-title">GalviTriage™ Health Assessment</h1>',
  '<h1 class="hero-title">GalviTriage™</h1>',
  'GalviTriage heading'
);
replaceOnce(
  '<p class="center">In five minutes, GalviTriage™ helps us understand the current symptoms, pressure points, and health signals inside your venture so GalviCare can prepare your initial business health snapshot: GalviVitals™.</p>',
  '<p>In five minutes, GalviTriage™ helps us understand the current symptoms, pressure points, and health signals inside your venture so GalviCare™ can prepare your initial business health snapshot: GalviVitals™.</p>',
  'GalviTriage introduction'
);
replaceOnce(
  '<textarea name="biggest_challenge" required placeholder="Example: We are not getting enough customers, we do not know what to build next, we need investor readiness, or we are not sure how to grow."></textarea>',
  '<textarea name="biggest_challenge" required placeholder="Example: I need a more consistent way to find and convert customers."></textarea>',
  'biggest challenge placeholder'
);
replaceOnce(
  '<textarea name="one_30_day_problem" required></textarea>',
  '<textarea name="one_30_day_problem" required placeholder="Example: I need help deciding which business priority to focus on first."></textarea>',
  '30 day problem placeholder'
);
replaceOnce(
  '<textarea name="growth_blocker"></textarea>',
  '<textarea name="growth_blocker" placeholder="Example: I want to better understand which customers are most likely to buy."></textarea>',
  'growth blocker placeholder'
);
replaceOnce(
  '<textarea name="feels_broken"></textarea>',
  '<textarea name="feels_broken" placeholder="Example: Our current process is inconsistent and I am not sure what to fix first."></textarea>',
  'feels broken placeholder'
);
replaceOnce(
  '<textarea name="keeps_up_at_night"></textarea>',
  '<textarea name="keeps_up_at_night" placeholder="Example: I want a clearer plan for growing the business over the next 90 days."></textarea>',
  'keeps up at night placeholder'
);
replaceOnce(
  'Something went wrong submitting GalviTriage. Please try again or contact GalviPro if needed.',
  'Something went wrong submitting GalviTriage™. Please try again or contact GalviPro if needed.',
  'Triage error trademark'
);
replaceOnce(
  'GalviEngine is preparing your initial business health snapshot...',
  'GalviEngine™ is preparing your initial business health snapshot...',
  'GalviEngine status trademark'
);

// GalviVitals
replaceOnce(
  '<h2 class="center">Your GalviVitals™ Snapshot</h2>',
  '<h2 class="center">GalviVitals™</h2>',
  'GalviVitals heading'
);
replaceOnce(
  '<p id="interpretation"></p>',
  '<p id="interpretation" class="center"></p>',
  'GalviVitals interpretation alignment'
);
replaceOnce(
  '<h2>Growth Insight</h2>',
  '<h2 class="galvivitals-growth-heading">Growth Insight</h2>',
  'Growth Insight spacing'
);
removeOnce(
  '      <button type="button" class="secondary-button" onclick="window.print()" data-cta-name="print_save_results" data-cta-location="galvivitals_result">Print / Save Results</button>\n',
  'GalviVitals print button'
);
replaceOnce(
  '<p>Your GalviVitals™ give you the first business health snapshot. GalviScore™ turns your GalviTriage responses into a quantified business health diagnostic.</p>',
  '<p>Your GalviVitals™ provide your first business health snapshot. Continue to GalviScore™ to see where your venture stands and which areas deserve your attention first.</p>',
  'GalviVitals next step copy'
);

// GalviScore paywall/result
replaceOnce(
  '<h2>Your Business Health Score is ready.</h2>',
  '<h2>Your GalviScore™ is Ready</h2>',
  'GalviScore paywall heading'
);
replaceOnce(
  '<p>GalviScore turns your GalviTriage responses into a quantified business health diagnostic so you can see where your venture is stable, strained, or at risk.</p>',
  '<p>GalviScore™ helps you understand where your venture stands today and where your attention may be needed most.</p>',
  'GalviScore paywall value copy'
);
removeOnce(
  '    <p class="trust-copy">Built from your GalviTriage data using rules-first GalviEngine logic. No guesswork. No generic report.</p>\n',
  'GalviScore proprietary methodology copy'
);
removeOnce(
  '    <p class="microcopy">Secure checkout powered by Stripe. Your score unlocks after payment confirmation.</p>\n',
  'GalviScore Stripe microcopy'
);
replaceOnce(
  '<button id="galviscore-stripe-cta" class="primary-btn" type="button">Unlock GalviScore</button>',
  '<button id="galviscore-stripe-cta" class="primary-btn" type="button">Unlock GalviScore™</button>',
  'GalviScore unlock trademark'
);
replaceOnce(
  '<h2>Your Business Health Score</h2>',
  '<h2 class="center">Your GalviScore™</h2>',
  'GalviScore result heading'
);
if (!html.includes('Your GalviScore™ shows where your business stands. GalviShot™ helps you understand')) {
  html = html.replace(
    '<div class="button-row">\n      <button id="print-galviscore"',
    '<p class="customer-progression-copy">Your GalviScore™ shows where your business stands. GalviShot™ helps you understand what is driving your results, which findings matter most, and what deserves your attention first.</p>\n    <div class="button-row">\n      <button id="print-galviscore"'
  );
}
replaceOnce(
  'Print / Save GalviScore</button>',
  'Print / Save GalviScore™</button>',
  'GalviScore print trademark'
);

// GalviShot paywall/result
replaceOnce(
  '<h1>Your Executive Clinical Findings Are Ready.</h1>',
  '<h1 class="center">Your Executive Clinical Findings Are Ready</h1>',
  'GalviShot paywall heading'
);
replaceOnce(
  '<p>GalviScore showed where your venture may be strained. GalviShot explains what findings are showing up in your business, which symptoms matter most, and what to address before moving deeper into GalviSight™.</p>',
  '<p>GalviScore™ showed where your venture may be strained. GalviShot™ explains what findings are showing up in your business, which symptoms matter most, and what to address before moving deeper into GalviSight™.</p>',
  'GalviShot paywall copy'
);
removeOnce(
`    <div class="gshot-preview-card">
      <strong>Preview:</strong>
      <p>Your GalviShot will identify your highest-priority business symptom, likely bottlenecks, and recommended next-best actions. Full findings unlock after payment confirmation or the approved QA override.</p>
    </div>
`,
  'GalviShot Preview'
);
replaceOnce(
  '<h3>Recommended Next-Best Actions</h3>',
  '<h3>Recommended Next Best Actions</h3>',
  'Next Best Actions heading'
);
replaceOnce(
  'Print / Save GalviShot</button>',
  'Print / Save GalviShot™</button>',
  'GalviShot print trademark'
);
if (!html.includes('GalviShot™ explains why your business is showing these symptoms. GalviSight™ turns those findings into clear actions')) {
  html = html.replace(
    '<button id="continue-galvisight" class="primary-btn" type="button">Continue to GalviSight™</button>',
    '<span class="customer-progression-copy">GalviShot™ explains why your business is showing these symptoms. GalviSight™ turns those findings into clear actions so you know what to focus on next.</span>\n      <button id="continue-galvisight" class="primary-btn" type="button">Continue to GalviSight™</button>'
  );
}

// GalviSight paywall/result
replaceOnce(
  '<h1>Unlock Your Executive Interpretation.</h1>',
  '<h1>Unlock GalviSight™</h1>',
  'GalviSight paywall heading'
);
replaceOnce(
  '<p>GalviSight interprets your GalviShot findings into prioritized executive meaning, risks, opportunities, and recommended actions.</p>',
  '<p>GalviShot™ explains why your business is showing these symptoms. GalviSight™ turns those findings into clear actions so you know what to focus on next.</p>',
  'GalviSight progression copy'
);
replaceOnce(
  '<button id="galvisight-stripe-cta" class="primary-btn" type="button">Unlock GalviSight™ — $29</button>',
  '<button id="galvisight-stripe-cta" class="primary-btn" type="button">Unlock GalviSight™</button>',
  'GalviSight unlock button'
);
replaceOnce(
  'Print / Save GalviSight</button>',
  'Print / Save GalviSight™</button>',
  'GalviSight print trademark'
);
if (!html.includes('GalviSight™ shows what actions deserve your attention. GalviPath™ organizes those actions into a focused 90 day path')) {
  html = html.replace(
    '<button id="continue-galvipath" class="primary-btn" type="button">Continue to Chart Your GalviPath</button>',
    '<span class="customer-progression-copy">GalviSight™ shows what actions deserve your attention. GalviPath™ organizes those actions into a focused 90 day path so you know how to move forward.</span>\n        <button id="continue-galvipath" class="primary-btn" type="button">Continue to GalviPath™</button>'
  );
}

// GalviPath paywall
replaceOnce(
  '<h1>Unlock Your 30 / 60 / 90 Day Treatment Path.</h1>',
  '<h1>Chart Your GalviPath™</h1>',
  'GalviPath paywall heading'
);
replaceOnce(
  '<p>GalviPath converts the supported GalviCare findings into a deterministic treatment path with evidence collection, operating cadence, escalation triggers, and a GalviClinic handoff.</p>',
  '<p>GalviPath™ turns your GalviCare™ findings into a focused 90 day plan. It shows what to work on first, which actions to take, what progress to watch for, and when GalviClinic™ support may help you move forward.</p>',
  'GalviPath paywall description'
);
replaceOnce(
`      <strong>Included in your $29 unlock:</strong>
      <ul>
        <li>Primary treatment pathway and clinical rationale</li>
        <li>30 / 60 / 90 day action sequence</li>
        <li>Evidence to collect and operating cadence</li>
        <li>Escalation triggers and GalviClinic support recommendation</li>
      </ul>`,
`      <strong>Unlock Your GalviPath™ to obtain:</strong>
      <ul>
        <li>Primary Treatment Pathway</li>
        <li>90 Day GalviPath™ Sequence</li>
        <li>90 Day GalviPath™ Actions</li>
        <li>GalviPath™ Guidance</li>
      </ul>`,
  'GalviPath inclusions'
);
replaceOnce(
  '<button id="galvipath-stripe-cta" class="primary-btn" type="button">Unlock GalviPath™ — $29</button>',
  '<button id="galvipath-stripe-cta" class="primary-btn" type="button">Unlock GalviPath™</button>',
  'GalviPath unlock button'
);
replaceOnce(
  '<button id="galvipath-book-galviclinic" type="button" class="primary-btn">Book GalviClinic</button>',
  '<button id="galvipath-book-galviclinic" type="button" class="primary-btn">Book GalviClinic™</button>',
  'GalviClinic button trademark'
);

// Deterministic Top 3 priorities from the same authoritative category scores.
if (!html.includes('function topThreePriorityText(result)')) {
  const helper = `
function topThreePriorityText(result){
  const scores=result&&result.dimension_scores&&typeof result.dimension_scores==='object'?result.dimension_scores:{};
  const ranked=Object.entries(scores)
    .map(([key,value])=>[key,Number(value)])
    .filter(([,value])=>Number.isFinite(value))
    .sort((a,b)=>a[1]-b[1])
    .slice(0,3)
    .map(([key])=>insightForDimension(key));
  if(ranked.length===3) return ranked.join('\\n');
  return (result.weakest_dimensions||[]).map(x=>x.insight||\`Improve \${labelDomain(x.key)}.\`).slice(0,3).join('\\n');
}
`;
  html = html.replace('function normalizeScoreResult(result){', `${helper}\nfunction normalizeScoreResult(result){`);
}
html = html.replace(
  "galviscore_top_priorities:(result.weakest_dimensions||[]).map(x=>x.insight||`Improve ${labelDomain(x.key)}.`).join('\\n')",
  "galviscore_top_priorities:topThreePriorityText(result)"
);

// Customer-readable GalviVitals sentence.
replaceOnce(
  "document.getElementById('classification').innerText='Health Band: '+(vitals.classification||vitals.health_band||''); document.getElementById('interpretation').innerText=vitals.interpretation||'';",
  "document.getElementById('classification').innerText=''; document.getElementById('interpretation').innerText=`Your business health snapshot: ${vitals.classification||vitals.health_band||'Pending'}.`;",
  'GalviVitals customer sentence'
);

// Persistent entitled GalviScore reference.
if (!html.includes('function updatePersistentGalviScore')) {
  const persistent = `
function updatePersistentGalviScore(score){
  const n=Number(score);
  if(!Number.isFinite(n)) return;
  ['galvishot-paywall','galvishot-result','galvisight-paywall','galvisight-handoff','galvipath-paywall','galvipath-result'].forEach(id=>{
    const host=document.getElementById(id);
    if(!host) return;
    let node=host.querySelector('.persistent-galviscore');
    if(!node){
      node=document.createElement('div');
      node.className='persistent-galviscore';
      host.insertBefore(node,host.firstChild);
    }
    node.textContent=\`Your GalviScore™: \${n}/100\`;
  });
}
function refreshPersistentGalviScore(){
  try{
    const cached=getCachedGalviScoreResult();
    const score=cached?.galviscore_score ?? cached?.score;
    updatePersistentGalviScore(score);
  }catch(e){}
}
`;
  html = html.replace('function showGalviCareState(state){', `${persistent}\nfunction showGalviCareState(state){`);
}
html = html.replace(
  "document.getElementById('galviscore-result')?.scrollIntoView({behavior:'smooth'}); }",
  "updatePersistentGalviScore(result.galviscore_score); document.getElementById('galviscore-result')?.scrollIntoView({behavior:'smooth'}); }"
);
if (!html.includes("refreshPersistentGalviScore(); return node;")) {
  html = html.replace(
    "if(node){ node.classList.remove('hidden'); node.style.display=(id==='assessmentForm'||id==='result')?(id==='assessmentForm'?'block':'block'):'block'; } return node;",
    "if(node){ node.classList.remove('hidden'); node.style.display=(id==='assessmentForm'||id==='result')?(id==='assessmentForm'?'block':'block'):'block'; } refreshPersistentGalviScore(); return node;"
  );
}

// Human-readable confidence and presentation helpers.
if (!html.includes('function confidencePresentation(value)')) {
  const presentation = `
function confidencePresentation(value){
  const n=Number(value);
  if(Number.isFinite(n)&&n>=85) return {label:'Strong',explanation:'Your responses consistently point to this issue across multiple business health signals.'};
  if(Number.isFinite(n)&&n>=65) return {label:'Moderate',explanation:'Your responses suggest this issue, although additional information would help confirm its impact.'};
  return {label:'Limited',explanation:'There are early signs of this issue, but GalviCare™ has limited evidence to determine its full impact.'};
}
function humanizeCustomerText(value){
  return String(value||'')
    .replace(/Choose one 90-day constraint and sequence two evidence sprints behind it\\.?/gi,'Choose the most important business challenge to address over the next 90 days. Then complete two focused actions that help you test whether your approach is working.')
    .replace(/next-best/gi,'Next Best')
    .replace(/operating cadence/gi,'review rhythm')
    .replace(/evidence sprint/gi,'focused action');
}
function formatCustomerEvidence(value){
  const text=String(value||'').trim();
  return text.replace(/^([^:]+):\\s*(\\d+\\/100)$/,'$1 - $2');
}
function contextualEvidenceSentence(value){
  const text=String(value||'').trim();
  const m=text.match(/([A-Za-z /]+):\\s*(\\d+)\\/100/);
  if(!m) return humanizeCustomerText(text);
  const category=m[1].trim().replace(/.*\\/\\s*/,'');
  const score=Number(m[2]);
  const signal=score<50?'needs focused attention':score<70?'shows a workable base with room to strengthen':'is currently a relative strength';
  return \`Your \${category} score of \${score}/100 \${signal} as you plan your next actions.\`;
}
function cleanGalviSightCustomerHypotheses(){
  const host=document.getElementById('galvisight-hypotheses');
  if(!host) return;
  host.querySelectorAll('.gshot-evidence').forEach(node=>{
    const text=node.textContent||'';
    if(text.startsWith('Finding code:')){ node.remove(); return; }
    const marker=text.indexOf(': ');
    const display=marker>=0?text.slice(marker+2):text;
    node.textContent=contextualEvidenceSentence(display);
  });
}
function humanizeList(id){
  document.querySelectorAll(\`#\${id} li\`).forEach(li=>{li.textContent=humanizeCustomerText(li.textContent);});
}
function pruneGalviPathInternalSections(panel){
  if(!panel||document.body.classList.contains('qa-debug-enabled')) return;
  const hiddenHeadings=new Set(['Clinical Rationale','Assumptions','Evidence Trace','Source References']);
  panel.querySelectorAll('h3').forEach(h=>{
    if(hiddenHeadings.has((h.textContent||'').trim())) h.parentElement?.remove();
  });
}
`;
  html = html.replace("function el(id){ return document.getElementById(id); }", `function el(id){ return document.getElementById(id); }\n${presentation}`);
}

// GalviShot confidence/evidence display only; Worker values remain authoritative.
html = html.replace(
  "el('galvishot-result-confidence-label').textContent=(result.confidence ?? '--')+'%';",
  "const overallConfidence=confidencePresentation(result.confidence); el('galvishot-result-confidence-label').textContent=overallConfidence.label; el('galvishot-result-confidence-label').title=overallConfidence.explanation;"
);
html = html.replace(
  "const evidence=(f.evidence||[]).map(e=>e.display_value).filter(Boolean).join('; ');",
  "const evidence=(f.evidence||[]).map(e=>formatCustomerEvidence(e.display_value)).filter(Boolean).join('; ');"
);
html = html.replace(
  "node.innerHTML=`<div class=\"gshot-finding-title\">${i+1}. ${f.title || f.finding_code}</div><div class=\"gshot-evidence\"><strong>Evidence:</strong> ${evidence}<br><strong>Confidence:</strong> ${f.confidence_language || ''}</div>`;",
  "const fp=confidencePresentation(f.confidence ?? result.confidence); node.innerHTML=`<div class=\"gshot-finding-title\">${i+1}. ${f.title || f.finding_code}</div><div class=\"gshot-evidence\"><strong>Evidence:</strong> ${evidence}<br><strong>Confidence:</strong> ${fp.label}<br>${fp.explanation}</div>`;"
);
html = html.replace(
  "fill('galvishot-actions', result.recommended_actions); fill('galvishot-risks', result.strategic_risks); fill('galvishot-assumptions', result.assumptions);",
  "fill('galvishot-actions', result.recommended_actions); fill('galvishot-risks', result.strategic_risks); fill('galvishot-assumptions', result.assumptions); humanizeList('galvishot-actions'); humanizeList('galvishot-risks');"
);

// GalviSight customer interpretation cleanup.
html = html.replace(
  "const hypothesisCount=renderGalviSightHypotheses(result.hypotheses);",
  "const hypothesisCount=renderGalviSightHypotheses(result.hypotheses); cleanGalviSightCustomerHypotheses();"
);
html = html.replace("setSectionVisibility('galvisight-assumptions-section',assumptionCount>0);", "setSectionVisibility('galvisight-assumptions-section',false);");
html = html.replace("setSectionVisibility('galvisight-evidence-section',evidenceCount>0);", "setSectionVisibility('galvisight-evidence-section',false);");
html = html.replace("setSectionVisibility('galvisight-actions-section',actionCount>0);", "setSectionVisibility('galvisight-actions-section',actionCount>0); humanizeList('galvisight-actions');");
html = html.replace("setSectionVisibility('galvisight-risks-section',riskCount>0);", "setSectionVisibility('galvisight-risks-section',riskCount>0); humanizeList('galvisight-risks');");

// GalviPath customer presentation.
replaceOnce("heading.textContent='30 / 60 / 90 Day Treatment Path';", "heading.textContent='90 Day GalviPath™ Sequence';", 'GalviPath sequence heading');
html = html.replace("renderGalviPathResult(result);", "renderGalviPathResult(result); pruneGalviPathInternalSections(el('galvipath-result-panel'));");
if (!html.includes('Your GalviPath™ gives you a clear direction for the next 90 days. GalviClinic™ gives you dedicated support')) {
  html = html.replace(
    "buttonRow.appendChild(printButton);\n      buttonRow.appendChild(clinicButton);",
    "const progression=document.createElement('p'); progression.className='customer-progression-copy'; progression.textContent='Your GalviPath™ gives you a clear direction for the next 90 days. GalviClinic™ gives you dedicated support to work through your priorities, make decisions, and keep your business moving forward.'; panel.appendChild(progression);\n\n      buttonRow.appendChild(printButton);\n      buttonRow.appendChild(clinicButton);"
  );
}
html = html.replace("printButton.textContent='Print / Save GalviPath';", "printButton.textContent='Print / Save GalviPath™';");
html = html.replace("clinicButton.textContent='Book GalviClinic';", "clinicButton.textContent='Book GalviClinic™';");
html = html.replace("stateMessage.textContent='Your deterministic GalviPath is ready.';", "stateMessage.textContent='Your GalviPath™ is ready.';");
html = html.replace("stateMessage.textContent='Loading deterministic GalviPath from the Worker.';", "stateMessage.textContent='Preparing your GalviPath™.';");
html = html.replace("stateMessage.textContent='Loading deterministic GalviSight from the Worker.';", "stateMessage.textContent='Preparing your GalviSight™.';");

const displayReplacements = [
  ['GalviCare diagnostic pathway is complete.', 'GalviCare™ diagnostic pathway is complete.'],
  ['GalviClinic treatment discussion is the next step.', 'GalviClinic™ treatment discussion is the next step.'],
  ['Continue to Chart Your GalviPath</button>', 'Continue to GalviPath™</button>'],
  ['Book GalviClinic</button>', 'Book GalviClinic™</button>']
];
for (const [from,to] of displayReplacements) html = html.split(from).join(to);

writeFileSync(path, html);
console.log('Day 7A customer-experience enhancement patch applied successfully.');
