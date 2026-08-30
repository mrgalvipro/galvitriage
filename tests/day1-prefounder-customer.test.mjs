import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');

test('one canonical GalviTriage front door branches by lifecycle, not human_e2e',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/const IDEA_STAGE='Idea'/);
  assert.match(s,/if\(submitting\|\|!idea\(\)\)return/);
  assert.doesNotMatch(s,/!human\(\)\|\|!idea\(\)/);
  assert.match(s,/legacyBusiness\(!on\)/);
  assert.match(s,/galvicare:lifecycle-change/);
});

test('Pre-Founder education and Founder Development route remain customer-facing',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/GALVICARE™ \| PRE-FOUNDER PATHWAY/);
  assert.match(s,/What is a Founder\?/);
  assert.match(s,/Founder Development Institute/);
  assert.match(s,/SPUR™ Pre-Founder/);
  assert.match(s,/data-galvicare-pathway/);
});

test('normal customer email is accepted and synthetic identity is not required',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/Enter a valid customer email/);
  assert.match(s,/\/api\/v1\/day7\/prefounder\/bootstrap/);
  assert.match(s,/X-Galvi-Day3-Session/);
  assert.doesNotMatch(s,/day1\.\\\.<name>|example\\\.invalid/);
  assert.doesNotMatch(s,/P0-02 Human E2E requires a synthetic QA email/);
});

test('Idea-stage path never fabricates venture or BHR',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/No real venture exists yet/);
  assert.match(s,/A venture\/BHR is created only when a real venture exists/);
  assert.match(s,/record_mode/);
  assert.match(s,/principal-only/);
});

test('Pre-Founder customer can continue complete care loop beyond Readiness',()=>{
  const s=read('day1-prefounder-customer.js');
  for(const marker of ['GalviShot™','GalviChart™','GalviSight™','GalviPath™','GalviClinic™','Business Physician Response','Patient acknowledgement','Continuous Care','Request Reassessment']) assert.ok(s.includes(marker),marker);
  for(const event of ['galvishot_completed','galvichart_activated','galvisight_completed','galvipath_completed','clinic_booking_requested','customer_acknowledged','monitoring_checkin','reassessment_requested']) assert.ok(s.includes(event),event);
  assert.match(s,/\/api\/v1\/day7\/prefounder\/care-events/);
  assert.match(s,/\/api\/v1\/day7\/prefounder\/projection/);
});

test('governed AI remains server-side and deterministic Founder Readiness stays canonical',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/\/api\/v1\/day7\/prefounder\/readiness-interpretation/);
  assert.match(s,/GALVIGUIDE™ \| FOUNDER READINESS INTERPRETATION/);
  assert.match(s,/deterministic Founder Readiness result remains canonical/);
  assert.doesNotMatch(s,/api\.openai\.com|OPENAI_API_KEY|sk-[A-Za-z0-9_-]{16,}/);
});

test('human_e2e only exposes QA physician control and does not select customer functionality',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/qaDiagnostic\(\)/);
  assert.match(s,/QA Human E2E — Business Physician control/);
  assert.match(s,/qa-physician-plan/);
  assert.match(s,/This control is QA-only and is not part of the customer-facing production path/);
  assert.doesNotMatch(s,/history\.replaceState/);
  assert.doesNotMatch(s,/searchParams\.set\('human_e2e'/);
});

test('default customer source contains no legacy Day1 operator panel and builder still injects it separately',()=>{
  const customer=read('day1-prefounder-customer.js');
  const qa=read('day1-prefounder-qa.js');
  const builder=read('scripts/day7b-build-qa-frontend.mjs');
  assert.doesNotMatch(customer,/H3 Create Pre-Founder|H14 Runtime Health/);
  assert.match(qa,/H3 Create Pre-Founder/);
  assert.match(qa,/H14 Runtime Health/);
  assert.match(builder,/DAY1_CUSTOMER='day1-prefounder-customer\.js'/);
  assert.match(builder,/DAY1_HUMAN_E2E='day1-prefounder-qa\.js'/);
});
