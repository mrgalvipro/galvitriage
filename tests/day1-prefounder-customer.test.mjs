import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');

test('customer Pre-Founder education is triggered only by Idea stage',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/const IDEA_STAGE='Idea'/);
  assert.match(source,/String\(stageSelect\.value\|\|''\)\.trim\(\)===IDEA_STAGE/);
  assert.match(source,/panel\.classList\.toggle\('hidden',!isIdea\)/);
  assert.match(source,/data-galvicare-pathway/);
  assert.match(source,/pre_founder/);
});

test('customer pathway teaches founder identity and Founder Development Institute handoff',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/GALVICARE™ \| PRE-FOUNDER PATHWAY/);
  assert.match(source,/What is a Founder\?/);
  assert.match(source,/turning a business idea into a real company/);
  assert.match(source,/Founder Development Institute/);
  assert.doesNotMatch(source,/dreamer/i);
});

test('Idea stage does not require a fabricated venture name and non-Idea restores the requirement',()=>{
  const source=read('day1-prefounder-customer.js');
  assert.match(source,/input\.required=false/);
  assert.match(source,/optional at the Idea stage/);
  assert.match(source,/input\.required=true/);
  assert.match(source,/operating_venture/);
});

test('customer pathway contains no Human E2E controls while QA adapter retains H3-H14',()=>{
  const customer=read('day1-prefounder-customer.js');
  const qa=read('day1-prefounder-qa.js');
  const builder=read('scripts/day7b-build-qa-frontend.mjs');
  assert.doesNotMatch(customer,/H3 Create Pre-Founder|H14 Runtime Health|data-qa-only/);
  assert.match(qa,/H3 Create Pre-Founder/);
  assert.match(qa,/H14 Runtime Health/);
  assert.match(builder,/DAY1_CUSTOMER='day1-prefounder-customer\.js'/);
  assert.match(builder,/DAY1_HUMAN_E2E='day1-prefounder-qa\.js'/);
});
