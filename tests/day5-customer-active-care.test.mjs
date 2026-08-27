import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const browser=read('day5-customer-active-care.js');
const routing=read('day5-customer-care-routing.js');
const build=read('scripts/day5-build-qa-frontend.mjs');

test('H06-H08 browser shows canonical Acuity/GalviGuide routing without replacing clarification or recomputing truth',()=>{
  for(const required of [
    'GalviCare Day 5 customer care routing + GalviGuide v1',
    '/api/v1/day5/customer/galviguide','X-Galvi-Day3-Session',
    'GalviScore + Business Health Acuity','Yellow — passive care / needs attention',
    'Orange — active care recommended','Open GalviGuide','Prepare with GalviGuide',
    'The existing “What you should watch?” box is GalviScore guidance',
    'testBoundary','change_score'
  ]) assert.ok(routing.includes(required),required);
  assert.equal(/api\.openai\.com|OPENAI_API_KEY/.test(routing),false);
  assert.equal(/bmr_id\s*:/.test(routing),false);
  assert.equal(/calculateGalviScore|calculateAcuity|ACUITY_WEIGHTS|acuityScore\s*=.*reduce/.test(routing),false);
  assert.ok(build.includes('GalviCare Day 5 customer care routing + GalviGuide v1'));
  assert.ok(build.includes('server-owned Acuity/GalviGuide routing'));
});

test('H19 browser acknowledges physician-authored plan and submits one idempotent scheduled check-in',()=>{
  for(const required of ['GalviCare Day 5 customer Treatment Plan acknowledgement v1','Acknowledge Treatment Plan','Submit scheduled check-in','Acknowledgement is separate from Treatment Plan authorship.','/api/v1/day5/customer/treatment-plans/','/acknowledgement','/api/v1/day5/customer/checkins','X-Galvi-Day3-Session','Idempotency-Key','stableKey','GalviChartDay4.read','GalviChartDay4.open']) assert.ok(browser.includes(required),required);
  assert.equal(/api\.openai\.com|OPENAI_API_KEY/.test(browser),false);
  assert.equal(/bmr_id\s*:/.test(browser),false);
  assert.ok(build.includes('GalviCare Day 5 customer Treatment Plan acknowledgement v1'));
  assert.ok(build.includes('without browser BMR/OpenAI authority'));
});
