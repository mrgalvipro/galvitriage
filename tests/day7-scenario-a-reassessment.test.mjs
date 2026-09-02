import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');

test('Scenario A commercial reassessment files parse',()=>{
  for(const p of ['worker/domain/day7-commercial-reassessment-service.js','worker/day8-commercial-entry.js','clinician-portal/day7-prefounder-queue.js']){
    assert.ok(fs.existsSync(p),p);
    const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});
    assert.equal(r.status,0,`${p}: ${r.stderr}`);
  }
});

test('Business Physician can close the provider-completed customer-returned reassessment queue',()=>{
  const svc=read('worker/domain/day7-commercial-reassessment-service.js'),entry=read('worker/day8-commercial-entry.js'),ui=read('clinician-portal/day7-prefounder-queue.js');
  for(const marker of ["row.status!=='pending'","row.order_status!=='customer_confirmed'","status='reviewed'","physician_decision_json","status='fulfilled'","status='completed'"]) assert.ok(svc.includes(marker),marker);
  assert.match(entry,/commercial-reassessments/);
  assert.match(entry,/recordPreFounderCommercialReassessment/);
  assert.match(ui,/Business Physician Reassessment \| Scenario A/);
  assert.match(ui,/commercial-reassessments/);
});

test('Scenario A reassessment cannot fabricate or transition an operating venture',()=>{
  const svc=read('worker/domain/day7-commercial-reassessment-service.js');
  for(const marker of ["row.lifecycle_state!=='pre_founder'","row.record_mode!=='principal_only'","row.venture_id!==null","row.context_bmr_id!==null","row.order_bmr_id!==null","canonical_transition_applied:false","separate_governed_lifecycle_review_required"]) assert.ok(svc.includes(marker),marker);
  assert.ok(svc.includes("remain_pre_founder"));
  assert.ok(svc.includes("continue_founder_development"));
  assert.ok(svc.includes("hold_for_more_evidence"));
  assert.doesNotMatch(svc,/INSERT\s+INTO\s+gv1_ventures|INSERT\s+INTO\s+gv1_business_medical_records/i);
});

test('Scenario C remains the only governed path for venture formation evidence',()=>{
  const svc=read('worker/domain/day7-commercial-reassessment-service.js'),lifecycle=read('worker/domain/day7-lifecycle-service.js');
  assert.match(svc,/Scenario C.*separate governed venture-formation evidence.*lifecycle review/i);
  assert.match(lifecycle,/lifecycle_transition_reviews|operating_founder|venture/i);
});
