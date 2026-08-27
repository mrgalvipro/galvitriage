import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const browser=read('day5-customer-active-care.js');
const build=read('scripts/day5-build-qa-frontend.mjs');

test('H19 browser acknowledges physician-authored plan and submits one idempotent scheduled check-in',()=>{
  for(const required of ['GalviCare Day 5 customer Treatment Plan acknowledgement v1','Acknowledge Treatment Plan','Submit scheduled check-in','Acknowledgement is separate from Treatment Plan authorship.','/api/v1/day5/customer/treatment-plans/','/acknowledgement','/api/v1/day5/customer/checkins','X-Galvi-Day3-Session','Idempotency-Key','stableKey','GalviChartDay4.read','GalviChartDay4.open']) assert.ok(browser.includes(required),required);
  assert.equal(/api\.openai\.com|OPENAI_API_KEY/.test(browser),false);
  assert.equal(/bmr_id\s*:/.test(browser),false);
  assert.ok(build.includes('exactly one Day 5 customer active-care adapter'));
  assert.ok(build.includes('without browser BMR authority'));
});
