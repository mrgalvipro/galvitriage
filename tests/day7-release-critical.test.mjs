import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
const req=JSON.parse(read('release-evidence/day7/day7-release-requirements.json'));

test('Day 7 release requirements enumerate exact mandatory matrices',()=>{
  assert.equal(req.manual_repair,false);
  assert.deepEqual(req.t01_t60.map(x=>x.id),Array.from({length:60},(_,i)=>`T${String(i+1).padStart(2,'0')}`));
  assert.deepEqual(req.d1.map(x=>x.id),Array.from({length:22},(_,i)=>`D1-${i+1}`));
  assert.deepEqual(req.golden_cases.map(x=>x.id),['A','B','C','D','E','F','G','H','I']);
  assert.deepEqual(req.human_e2e.map(x=>x.id),Array.from({length:16},(_,i)=>`P0-${String(i+1).padStart(2,'0')}`));
  assert.deepEqual(req.release_gates,['GalviCare 1.0','GalviStudio 1.0','GalviPro 1.0']);
  assert.equal(req.evidence_sections.length,14);
  assert.equal(req.go_rule,'FAIL_CLOSED_UNTIL_ALL_MANDATORY_GREEN');
});

for(const item of req.t01_t60){
  test(`${item.id} release control is explicit and evidence-bound`,()=>{
    assert.ok(item.assertion.length>=30,`${item.id} assertion too weak`);
    assert.ok(['automated_or_contract','hybrid','human_or_hybrid'].includes(item.evidence_mode));
  });
}

test('Day 7 membership migration is additive and preserves canonical record authority',()=>{
  const sql=read('migrations/day1/0700_day7_release_membership.sql');
  for(const table of ['gv1_memberships','gv1_membership_events','gv1_membership_checkins','gv1_membership_reassessment_queue']){
    assert.match(sql,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
  assert.match(sql,/D7A1/);
  assert.match(sql,/ux_gv1_memberships_one_active_bmr/);
  assert.doesNotMatch(sql,/\b(DROP|DELETE FROM|ALTER TABLE|TRUNCATE)\b/i);
});

test('Day 7 runtime is an additive wrapper over the signed Day 6 runtime',()=>{
  const entry=read('worker/day7-entry.js');
  assert.match(entry,/import day6Worker from '.\/day6-entry\.js'/);
  assert.match(entry,/handleDay7ReleaseRoute/);
  assert.match(entry,/return wrap\(await day6Worker\.fetch/);
  assert.match(entry,/X-Galvi-Day7-Release/);
});

test('Business Health Membership is server governed, treatment-plan bound and human-review queued',()=>{
  const svc=read('worker/domain/day7-membership-service.js');
  const route=read('worker/routes/day7-release.js');
  assert.match(svc,/Business Physician or operator authority is required to start Membership/);
  assert.match(svc,/Cross-BMR membership treatment scope is prohibited/);
  assert.match(svc,/gv1_membership_reassessment_queue/);
  assert.match(svc,/submitCheckin/);
  assert.match(svc,/idempotent_replay/);
  assert.match(route,/\/api\/v1\/day7\/memberships/);
  assert.doesNotMatch(svc,/api\.openai\.com|OPENAI_API_KEY|STRIPE_SECRET_KEY/);
});

test('Day 7 QA config reuses exact QA Worker and canonical QA D1 with D7 additive schema',()=>{
  const w=JSON.parse(read('wrangler.day7.json'));
  const db=w.d1_databases?.[0];
  assert.equal(w.name,'galvivault-p0-day1-qa');
  assert.equal(w.main,'worker/day7-entry.js');
  assert.equal(w.vars?.ENVIRONMENT,'qa');
  assert.equal(w.vars?.MIN_SCHEMA_VERSION,'D7A1');
  assert.equal(w.vars?.DAY7_BUSINESS_HEALTH_MEMBERSHIP,'server_governed_beta_v1');
  assert.equal(db?.binding,'DB');
  assert.equal(db?.database_name,'galvivault-0-5-qa');
  assert.equal(db?.database_id,'cdf9042b-ab09-498a-ac66-010b6cce47d4');
});

test('Human E2E and release evidence remain fail-closed rather than auto-passed',()=>{
  const runbook=read('release-evidence/day7/day7-human-e2e-runbook.md');
  for(const id of req.human_e2e.map(x=>x.id)) assert.match(runbook,new RegExp(id));
  for(const id of req.golden_cases.map(x=>`Golden ${x.id}`)) assert.match(runbook,new RegExp(id));
  assert.match(runbook,/manual_repair=NO/);
  assert.match(runbook,/Do not promote `main`/i);
});
