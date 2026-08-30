import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');

test('customer Pre-Founder education remains Idea-stage scoped',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/const IDEA_STAGE='Idea'/);
  assert.match(source,/data-galvicare-pathway/);
  assert.match(source,/pre_founder/);
  assert.match(source,/document\.body\.dataset\.galvicareLifecycle=on\?'pre_founder':'operating_venture'/);
});

test('customer pathway teaches founder identity and Founder Development Institute handoff',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/GALVICARE™ \| PRE-FOUNDER PATHWAY/);
  assert.match(source,/What is a Founder\?/);
  assert.match(source,/turning a business idea into a real company/);
  assert.match(source,/Founder Development Institute/);
  assert.match(source,/SPUR™ Pre-Founder/);
  assert.doesNotMatch(source,/dreamer/i);
});

test('Idea stage never fabricates a venture and canonical P0-02 is principal-only',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/v\.required=!on/);
  assert.match(source,/record_mode:'principal_only'/);
  assert.match(source,/lifecycle_state:'pre_founder'/);
  assert.match(source,/context\.venture_id!==null\|\|context\.bmr_id!==null/);
  assert.match(source,/No real venture exists yet/);
});

test('P0-02 Human E2E preserves its marker across internal navigation',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/galvicare_human_e2e_active_v1/);
  assert.match(source,/sessionStorage\.setItem\(HUMAN_KEY,'1'\)/);
  assert.match(source,/u\.searchParams\.set\('human_e2e','1'\)/);
  assert.match(source,/history\.replaceState/);
});

test('P0-02 replaces legacy Business Health intake with canonical Founder Readiness APIs',()=>{
  const source=read('day1-prefounder-customer.js');
  for(const endpoint of ['/api/v1/principal-contexts','/api/v1/consents','/api/v1/day2/triage','/api/v1/day2/vitals','/api/v1/day2/score','/api/v1/day6/studio/catalog']) assert.ok(source.includes(endpoint),endpoint);
  for(const dimension of ['clarity','runway','time','capability','network','domain_knowledge','opportunity_evidence','decision_confidence','leadership_readiness','operating_willingness']) assert.ok(source.includes(`['${dimension}'`),dimension);
  assert.match(source,/score\.score_type!=='founder_readiness'/);
  assert.match(source,/vitals\.score_type!=='founder_readiness'/);
  assert.match(source,/e\.stopImmediatePropagation\(\)/);
  assert.match(source,/legacyBusiness\(!\(h&&on\)\)/);
});

test('P0-02 renders Founder Readiness and SPUR evidence, not Business Health result',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/GalviVitals™ \| Founder Readiness Vitals/);
  assert.match(source,/GalviScore™ \| Founder Readiness/);
  assert.match(source,/SPUR™ Pre-Founder Route/);
  assert.match(source,/P0-02 evidence:/);
  assert.match(source,/Venture \/ BHR:/);
});

test('P0-06 adds customer-friendly governed AI interpretation without replacing deterministic truth',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/\/api\/v1\/day7\/prefounder\/readiness-interpretation/);
  assert.match(source,/GALVIGUIDE™ \| FOUNDER READINESS INTERPRETATION/);
  assert.match(source,/What Your Readiness Signals Mean/);
  assert.match(source,/generation_source/);
  assert.match(source,/approved fallback/i);
  assert.doesNotMatch(source,/api\.openai\.com|OPENAI_API_KEY/);
});

test('default customer source contains no QA control panel while QA adapter retains H3-H14',()=>{
  const customer=read('day1-prefounder-customer.js');
  const qa=read('day1-prefounder-qa.js');
  const builder=read('scripts/day7b-build-qa-frontend.mjs');
  assert.doesNotMatch(customer,/H3 Create Pre-Founder|H14 Runtime Health|data-qa-only/);
  assert.match(qa,/H3 Create Pre-Founder/);
  assert.match(qa,/H14 Runtime Health/);
  assert.match(builder,/DAY1_CUSTOMER='day1-prefounder-customer\.js'/);
  assert.match(builder,/DAY1_HUMAN_E2E='day1-prefounder-qa\.js'/);
});