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

test('human_e2e only exposes the QA physician control and never enables it by default',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/qaDiagnostic\(\)/);
  assert.match(s,/QA Human E2E — Business Physician control/);
  assert.match(s,/qa-physician-plan/);
  assert.match(s,/This control is QA-only and appears only when Human E2E mode is explicitly enabled/);
  assert.match(s,/data-human-e2e-control="business-physician"/);
  assert.doesNotMatch(s,/data-qa-only="true"><summary><strong>QA Human E2E — Business Physician control/);
  assert.doesNotMatch(s,/history\.replaceState/);
  assert.doesNotMatch(s,/searchParams\.set\('human_e2e'/);
});

test('hard refresh restores the canonical Pre-Founder session before lifecycle code can clear it',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/function liveSession\(\)/);
  assert.match(s,/function suppressLegacyRestore\(\)/);
  assert.match(s,/function resumeExisting\(\)/);
  assert.match(s,/Canonical Pre-Founder record restored with submitted intake/);
  assert.match(s,/const restoring=liveSession\(\)/);
  assert.match(s,/if\(restoring&&text\(stage\.value\)!==IDEA_STAGE\)stage\.value=IDEA_STAGE/);
  assert.match(s,/if\(restoring\)setTimeout\(resumeExisting,50\)/);
  assert.match(s,/localStorage\.removeItem\(key\);sessionStorage\.removeItem\(key\)/);
});

test('refresh rehydrates submitted About You, GalviScore metadata and Founder Readiness inputs',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/const INTAKE_FIELDS=/);
  for(const field of ['first_name','last_name','email','organization_stage','organization_type','industry','team_size','revenue_range','highest_impact_area','biggest_challenge']) assert.ok(s.includes(field),field);
  assert.match(s,/function intakeSnapshot\(\)/);
  assert.match(s,/function restoreIntake\(snapshot=\{\},projectionData=null\)/);
  assert.match(s,/intake_snapshot:snapshot/);
  assert.match(s,/restoreIntake\(s\.intake_snapshot,p\)/);
  assert.match(s,/Math\.round\(numeric\/25\)\+1/);
});

test('presenting-context inputs travel with the canonical Pre-Founder journey without silently changing readiness dimensions',()=>{
  const s=read('day1-prefounder-customer.js');
  for(const field of ['highest_impact_area','biggest_challenge','one_30_day_problem','growth_blocker','feels_broken','keeps_up_at_night']) assert.ok(s.includes(field),field);
  assert.match(s,/presenting_context:presenting/);
  assert.match(s,/payload\.presenting_context=s\.presenting_context\|\|presentingContext\(\)/);
  assert.match(s,/const identity=customerIdentity\(\),dims=dimensions\(\),presenting=presentingContext\(\),snapshot=intakeSnapshot\(\)/);
});

test('Green zero acuity explains urgency versus Founder Readiness in customer-safe copy',()=>{
  const s=read('day1-prefounder-customer.js');
  assert.match(s,/No urgent care trigger identified from your current intake\. Acuity measures urgency, not Founder Readiness\./);
  assert.match(s,/acuityCopy\(score\)/);
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