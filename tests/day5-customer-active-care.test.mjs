import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// This browser regression file is an approved deploy-qa-frontend path trigger so a
// corrected inherited deployment-ownership assertion is always re-gated at the new exact SHA.
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const browser=read('day5-customer-active-care.js');
const routing=read('day5-customer-care-routing.js');
const metadata=read('day5-score-metadata.js');
const build=read('scripts/day5-build-qa-frontend.mjs');

test('H06-H08 browser shows canonical Acuity/GalviGuide routing without replacing clarification or recomputing truth',()=>{
  for(const required of [
    'GalviCare Day 5 customer care routing + GalviGuide v1',
    '/api/v1/day5/customer/galviguide','X-Galvi-Day3-Session',
    'GalviScore + Business Health Acuity','Yellow — passive care / needs attention',
    'Orange — active care recommended','Open GalviGuide','Prepare with GalviGuide',
    'The existing “What you should watch?” box is GalviScore guidance',
    'testBoundary','change_score','stageHosts','galvisight-result-panel','galvipath-result-panel'
  ]) assert.ok(routing.includes(required),required);
  assert.equal(/api\.openai\.com|OPENAI_API_KEY/.test(routing),false);
  assert.equal(/bmr_id\s*:/.test(routing),false);
  assert.equal(/calculateGalviScore|calculateAcuity|ACUITY_WEIGHTS|acuityScore\s*=.*reduce/.test(routing),false);
  assert.ok(build.includes('GalviCare Day 5 customer care routing + GalviGuide v1'));
  assert.ok(build.includes('server-owned Acuity/GalviGuide routing'));
});

test('H02/H06 hidden completed clarification DOM cannot suppress canonical Score metadata or care routing',()=>{
  for(const required of [
    "byId('galviscore-followup')",
    'for(let current=node;current&&current.nodeType===1;current=current.parentElement)',
    "current.classList?.contains('hidden')",
    'node.getClientRects().length>0'
  ]) assert.ok(metadata.includes(required),`metadata: ${required}`);
  for(const required of [
    "FOLLOWUP_PANELS=['galviscore-followup','galvishot-followup','galvisight-followup','galvipath-followup']",
    'for(let c=n;c&&c.nodeType===1;c=c.parentElement)',
    "c.classList?.contains('hidden')",
    'n.getClientRects().length>0',
    "e?.code==='GV_DAY5_CARE_ROUTE_NOT_READY'||e?.status===404||e?.status===409"
  ]) assert.ok(routing.includes(required),`routing: ${required}`);
  assert.equal(routing.includes("FOLLOWUP_IDS=['followup-question-container'"),false);
});

test('H02/H06 Score metadata projection is canonical, clarification-safe and DOM-idempotent',()=>{
  for(const required of [
    'GalviCare Day 5 canonical GalviScore metadata v1','/api/v1/day5/customer/score-metadata',
    'galviscore-classification','galviscore-lowest-category','day5-score-acuity-summary',
    'clarificationActive','lastFingerprint','fingerprint(data)','ensureAcuityNode',
    "classificationValue=text(data?.classification)||'Unavailable'",
    "lowestValue=text(data?.lowest_category)?label(data.lowest_category):'Unavailable'",
    'acuity.innerHTML!==acuityHtml'
  ]) assert.ok(metadata.includes(required),required);
  assert.equal(/api\.openai\.com|OPENAI_API_KEY|bmr_id\s*:/.test(metadata),false);
  assert.equal(/calculateGalviScore|calculateAcuity|ACUITY_WEIGHTS/.test(metadata),false);
});

test('H17-H19 Chart active-care projection cannot self-trigger an unbounded Chart/customer-bootstrap read loop',()=>{
  for(const required of [
    'chartWasActive','lastActiveFingerprint','activeFingerprint','chartRebuilt','needsActiveCare',
    "mutation.type==='childList'&&mutation.target===chart",
    "active&&(!chartWasActive||(chartRebuilt&&needsActiveCare))",
    'ensureChartButtons','View GalviChart™','galvishot-result','galvisight-result-panel','galvipath-result-panel'
  ]) assert.ok(browser.includes(required),required);
  assert.equal(browser.includes("MutationObserver(()=>{if(byId('galvichart-day4')?.classList.contains('active'))queueMicrotask(refresh)});"),false);
});

test('H19 browser acknowledges physician-authored plan and submits one idempotent scheduled check-in',()=>{
  for(const required of ['GalviCare Day 5 customer Treatment Plan acknowledgement v1','Acknowledge Treatment Plan','Submit scheduled check-in','Acknowledgement is separate from Treatment Plan authorship.','/api/v1/day5/customer/treatment-plans/','/acknowledgement','/api/v1/day5/customer/checkins','X-Galvi-Day3-Session','Idempotency-Key','stableKey','GalviChartDay4.read','GalviChartDay4.open']) assert.ok(browser.includes(required),required);
  assert.equal(/api\.openai\.com|OPENAI_API_KEY/.test(browser),false);
  assert.equal(/bmr_id\s*:/.test(browser),false);
  assert.ok(build.includes('GalviCare Day 5 customer Treatment Plan acknowledgement v1'));
  assert.ok(build.includes('without browser score/Acuity/BMR/OpenAI authority'));
});
