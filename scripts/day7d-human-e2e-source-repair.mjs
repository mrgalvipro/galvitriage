import fs from 'node:fs';

const indexPath='index.html';
const enginePath='worker/day7d-engine.js';
const adapterPath='day7d-browser-customer-intelligence.js';

let html=fs.readFileSync(indexPath,'utf8');
let engine=fs.readFileSync(enginePath,'utf8');
const adapter=fs.readFileSync(adapterPath,'utf8');

const oldRoute="function routeByGalviScoreConfidence(scoreResult){ if(hasValidGalviScoreResult(scoreResult)){ renderUnlockedGalviScore(scoreResult.galviscore_score!==undefined?scoreResult:normalizeScoreResult(scoreResult)); return'result'; } renderTriageRepair(scoreResult||{}); return'triage_repair'; }";
const newRoute="function routeByGalviScoreConfidence(scoreResult){ if(!hasValidGalviScoreResult(scoreResult)){ renderTriageRepair(scoreResult||{}); return'triage_repair'; } const normalized=scoreResult.galviscore_score!==undefined?scoreResult:normalizeScoreResult(scoreResult); const sessionId=normalized.session_id||getStoredSessionId()||''; const key='galviscore_followup_completed_'+sessionId; if(localStorage.getItem(key)!=='true'){ renderClinicalFollowUp(normalized); return'followup'; } renderUnlockedGalviScore(normalized); return'result'; }";
if(html.includes(oldRoute)) html=html.replace(oldRoute,newRoute);
else if(!html.includes("galviscore_followup_completed_")) throw new Error('GalviScore routing signature changed; refusing unsafe patch.');

// Preserve the proven Day 6/7C paid-return restoration contract exactly, then layer
// Day 7D clarification after the unlocked result has been restored and return-pending cleared.
const brokenPaidReturn="    routeByGalviScoreConfidence(restored);\n    clearGalviCareReturnPending();";
const additivePaidReturn="    renderUnlockedGalviScore(restored);\n    clearGalviCareReturnPending();\n    queueMicrotask(()=>routeByGalviScoreConfidence(restored));";
if(html.includes(brokenPaidReturn)) html=html.replace(brokenPaidReturn,additivePaidReturn);
else if(!html.includes(additivePaidReturn)){
  const legacyPaidReturn="    renderUnlockedGalviScore(restored);\n    clearGalviCareReturnPending();";
  if(html.includes(legacyPaidReturn)) html=html.replace(legacyPaidReturn,additivePaidReturn);
  else throw new Error('GalviScore paid-return restoration signature changed; refusing unsafe patch.');
}

// Preserve the existing cached-result render path as the visual restoration authority;
// Day 7D clarification is layered after it rather than replacing it.
const brokenCached="  routeByGalviScoreConfidence(cached);\n});";
const additiveCached="  renderUnlockedGalviScore(cached);\n  queueMicrotask(()=>routeByGalviScoreConfidence(cached));\n});";
if(html.includes(brokenCached)) html=html.replace(brokenCached,additiveCached);

const oldSubmit="document.getElementById('submit-followup')?.addEventListener('click',async function(){ const sessionId=getStoredSessionId(); const textareas=Array.from(document.querySelectorAll('#followup-question-container textarea')); for(const el of textareas){ if(!el.value.trim()){el.reportValidity(); return;} await saveClinicalFollowUp(sessionId,{question_id:el.dataset.questionId,confidence_impact:Number(el.dataset.confidenceImpact||0)},el.value.trim()); } const cached=getCachedGalviScoreResult(); if(cached){ cached.galviscore_confidence=Math.min(100,Number(cached.galviscore_confidence||0)+12); cacheGalviScoreResult(cached); routeByGalviScoreConfidence(cached); } });";
const newSubmit="document.getElementById('submit-followup')?.addEventListener('click',async function(){ const sessionId=getStoredSessionId(); const textareas=Array.from(document.querySelectorAll('#followup-question-container textarea')); for(const el of textareas){ if(!el.value.trim()){el.reportValidity(); return;} await saveClinicalFollowUp(sessionId,{question_id:el.dataset.questionId,confidence_impact:Number(el.dataset.confidenceImpact||0)},el.value.trim()); } localStorage.setItem('galviscore_followup_completed_'+sessionId,'true'); const cached=getCachedGalviScoreResult(); if(cached){ cached.galviscore_confidence=Math.min(100,Number(cached.galviscore_confidence||0)+12); cacheGalviScoreResult(cached); routeByGalviScoreConfidence(cached); } });";
if(html.includes(oldSubmit)) html=html.replace(oldSubmit,newSubmit);
else if(!html.includes("localStorage.setItem('galviscore_followup_completed_'")) throw new Error('GalviScore submit signature changed; refusing unsafe patch.');

const marker='/* DAY7D_CUSTOMER_INTELLIGENCE_ADAPTER_SOURCE */';
if(!html.includes(marker)){
  if(!html.includes('</body>')) throw new Error('index.html has no closing body tag.');
  html=html.replace('</body>',`<script>\n${marker}\n${adapter}\n</script>\n</body>`);
}

const oldCount=`  let count=0;\n  if(r.confidence<60) count=3;\n  else if(r.confidence<80) count=2;\n  else if(divergence) count=1;\n  if(!count) return [];`;
const newCount=`  let count=0;\n  if(r.confidence<60) count=3;\n  else if(r.confidence<80) count=2;\n  else if(divergence) count=1;\n  // Day 7D product contract: every new clinical stage collects at least one\n  // stage-specific founder intelligence input before finalizing its deliverable.\n  if(Object.keys(existing||{}).length===0) count=Math.max(count,1);\n  if(!count) return [];`;
if(engine.includes(oldCount)) engine=engine.replace(oldCount,newCount);
else if(!engine.includes('every new clinical stage collects at least one')) throw new Error('Day 7D follow-up selector signature changed; refusing unsafe patch.');

fs.writeFileSync(indexPath,html);
fs.writeFileSync(enginePath,engine);

const assertions=[
  [html.includes("galviscore_followup_completed_"),'GalviScore completion marker'],
  [html.includes('renderUnlockedGalviScore(restored);\n    clearGalviCareReturnPending();'),'preserved paid-return render contract'],
  [html.includes('queueMicrotask(()=>routeByGalviScoreConfidence(restored))'),'additive GalviScore clarification transition'],
  [html.includes('DAY7D_CUSTOMER_INTELLIGENCE_ADAPTER_SOURCE'),'real QA source adapter'],
  [html.includes('galvisight-followup-questions'),'GalviSight question host'],
  [html.includes('galvipath-followup-questions'),'GalviPath question host'],
  [engine.includes('count=Math.max(count,1)'),'mandatory stage follow-up'],
];
for(const [ok,label] of assertions) if(!ok) throw new Error(`Missing ${label}`);
console.log('PASS: Day 7D human-E2E source repaired additively while preserving Day 1-7C restoration contracts.');