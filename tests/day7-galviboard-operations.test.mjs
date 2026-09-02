import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p,'utf8');

test('GalviStudio operator navigator separates the three Mr. GalviPro jobs',()=>{
  const h=read('clinician-portal/index.html'),n=read('clinician-portal/day7-studio-navigator.js');
  for(const marker of ['GalviStudio™ Navigator','GalviStudio CEO','GalviClinic Business Physician','GalviVault Clinician','Open GalviBoard','Open GalviClinic','Open GalviVault'])assert.ok(h.includes(marker),marker);
  for(const marker of ['studioNavigator','clinicWorkspace','vaultWorkspace','galviboard','clinicMetrics'])assert.ok((h+n).includes(marker),marker);
  const r=spawnSync(process.execPath,['--check','clinician-portal/day7-studio-navigator.js'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);
});

test('GalviBoard explains population stewardship and treatment performance without inventing CBE filters',()=>{
  const svc=read('worker/domain/day7-galviboard-enriched-service.js'),ui=read('clinician-portal/day7-galviboard.js');
  for(const marker of ['COUNT(DISTINCT founder_id)','active_prefounder_context_rows','unique_active_prefounder_principals','cohort_filter','not_yet_instrumented','treatment_performance','business_health_memberships','galvileague_memberships:null','clinic_metrics'])assert.ok(svc.includes(marker),marker);
  assert.match(ui,/Pre-Founder Board: Scenario A - Clinical \+ Commercial \+ Developmental \+ Longitudinal Loop/);
  assert.match(ui,/Population & Data Stewardship/);
  assert.match(ui,/FDI \/ GalviStudio Treatment Performance/);
  assert.match(ui,/Business Health Memberships/);
  assert.match(ui,/GalviLeague Memberships/);
});

test('GalviBoard is printable and remains a read-only D1 projection',()=>{
  const html=read('clinician-portal/galviboard.html'),ui=read('clinician-portal/day7-galviboard.js'),css=read('clinician-portal/styles.css'),svc=read('worker/domain/day7-galviboard-enriched-service.js');
  assert.match(html,/printGalviBoard/);assert.match(ui,/window\.print\(\)/);assert.match(css,/@media print/);
  assert.match(svc,/buildBaseGalviBoard/);assert.doesNotMatch(svc,/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i);
});
