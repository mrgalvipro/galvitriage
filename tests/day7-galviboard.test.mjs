import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');

test('GalviBoard 1.0 files exist and parse',()=>{
  for(const p of ['worker/domain/day7-galviboard-service.js','worker/day8-commercial-entry.js','clinician-portal/day7-galviboard.js','clinician-portal/galviboard.html']) assert.ok(fs.existsSync(p),p);
  for(const p of ['worker/domain/day7-galviboard-service.js','worker/day8-commercial-entry.js','clinician-portal/day7-galviboard.js']){
    const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});assert.equal(r.status,0,`${p}: ${r.stderr}`);
  }
});

test('GalviBoard is Business Physician protected and read-only over GalviVault',()=>{
  const entry=read('worker/day8-commercial-entry.js'),svc=read('worker/domain/day7-galviboard-service.js');
  assert.match(entry,/GALVIBOARD='\/api\/v1\/operator\/galviboard'/);
  assert.match(entry,/requireClinicianIdentity/);
  assert.match(entry,/identity\.role!=='business_physician'/);
  assert.match(entry,/buildGalviBoard/);
  assert.match(entry,/read_only:true/);
  assert.match(svc,/source_of_truth:'galvivault_d1'/);
  assert.match(svc,/read_only:true/);
  assert.match(svc,/ai_called_on_read:false/);
  assert.doesNotMatch(svc,/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i);
});

test('GalviBoard preserves the Pre-Founder to Scenario C lifecycle gate',()=>{
  const svc=read('worker/domain/day7-galviboard-service.js');
  assert.match(svc,/lifecycle_state='pre_founder'/);
  assert.match(svc,/record_mode='principal_only'/);
  assert.match(svc,/venture_id IS NULL/);
  assert.match(svc,/bmr_id IS NULL/);
  assert.match(svc,/Still Pre-Founder absent venture evidence/);
  assert.match(svc,/scenario_c_requires_governed_venture_evidence:true/);
});

test('GalviBoard represents the decisive Scenario A commercial-developmental loop',()=>{
  const svc=read('worker/domain/day7-galviboard-service.js');
  for(const marker of ['Founder Readiness measured','FounderShot recorded','GalviPath completed','GalviClinic requested','Business Physician Treatment Plan','Customer acknowledged plan','Return credentials established','Stripe TEST Checkout started','Stripe-verified paid','Systeme.io enrolled','Founder Readiness course completed','Customer completion confirmed','Business Physician reassessment pending','Business Physician reassessed']) assert.ok(svc.includes(marker),marker);
  for(const table of ['gv1_commercial_care_orders','gv1_commercial_order_delivery','gv1_systeme_course_fulfillments','gv1_care_reassessment_queue','gv1_founder_snapshots']) assert.ok(svc.includes(table),table);
});

test('GalviBoard exposes four-pillar executive management and honest instrumentation boundaries',()=>{
  const svc=read('worker/domain/day7-galviboard-service.js'),ui=read('clinician-portal/day7-galviboard.js'),html=read('clinician-portal/galviboard.html');
  for(const marker of ['founder_development','product_development','business_development','corporate_development','manage by exception','external_metrics_not_yet_ingested','not_yet_projected_into_galvivault_1_0']) assert.ok((svc+' '+ui+' '+html).toLowerCase().includes(marker.toLowerCase()),marker);
  assert.match(svc,/HubSpot/);assert.match(svc,/GA4/);assert.match(svc,/Microsoft Clarity/);assert.match(svc,/Stripe/);assert.match(svc,/Systeme\.io/);
  assert.match(html,/Mr\. GalviPro's GalviBoard/);assert.match(html,/read-only projection over canonical GalviVault evidence/);
});
