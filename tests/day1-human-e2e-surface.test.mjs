import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(path,'utf8');

test('Day 1 QA Human E2E surface exposes lifecycle-based Pre-Founder entry only in QA build',()=>{
  const adapter=read('day1-prefounder-qa.js');
  const builder=read('scripts/day7b-build-qa-frontend.mjs');
  assert.match(adapter,/Day 1 Human E2E Pre-Founder QA adapter\./);
  assert.match(adapter,/record_mode:'principal_only'/);
  assert.match(adapter,/lifecycle_state:'pre_founder'/);
  assert.match(adapter,/venture_id!==null/);
  assert.match(adapter,/bmr_id!==null/);
  assert.match(adapter,/This is a lifecycle path, not a low-score path\./);
  assert.match(adapter,/galvivault-p0-day1-qa\.mrgalvipro\.workers\.dev/);
  assert.match(builder,/DAY1_HUMAN_E2E='day1-prefounder-qa\.js'/);
  assert.match(builder,/Day 1 Human E2E Pre-Founder QA adapter\./);
  assert.doesNotMatch(read('index.html'),/Day 1 Human E2E Pre-Founder QA adapter\./);
});

test('Day 1 principal-only sessions are additive and never require a fake venture or BMR',()=>{
  const migration=read('migrations/day1/0101_day1_principal_session_continuity.sql');
  assert.match(migration,/CREATE TABLE IF NOT EXISTS gv1_principal_sessions/);
  assert.match(migration,/context_id TEXT NOT NULL/);
  assert.match(migration,/founder_id TEXT NOT NULL/);
  assert.match(migration,/client_session_key TEXT NOT NULL/);
  assert.doesNotMatch(migration,/venture_id TEXT NOT NULL/);
  assert.doesNotMatch(migration,/bmr_id TEXT NOT NULL/);
  assert.doesNotMatch(migration,/\b(DROP|TRUNCATE)\b/i);
  const entry=read('worker/day1.js');
  assert.match(entry,/day1-human-e2e\.js/);
});

test('deployed QA Worker source owns get_or_generate_galviscore and Day 9 delegates it',()=>{
  const day7d=read('worker/day7d-engine.js');
  const day9=read('worker/day9-galvicare-continuity.js');
  assert.match(day7d,/get_or_generate_galviscore:'GalviScore'/);
  assert.match(day7d,/GENERATE=new Set\(\['get_or_generate_galviscore'/);
  assert.match(day9,/if \(action !== 'submit_triage'\) \{/);
  assert.match(day9,/return day7dWorker\.fetch\(request, env, ctx\);/);
});
