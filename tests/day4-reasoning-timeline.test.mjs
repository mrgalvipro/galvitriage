import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const migration = read('migrations/day1/0004_day4_governed_reasoning.sql');
const config = JSON.parse(read('wrangler.day4.json'));
const entry = read('worker/day4-entry.js');
const service = read('worker/domain/reasoning-service.js');
const governance = read('worker/domain/governance-service.js');
const bmr = read('worker/domain/bmr-service.js');
const reasoningRoute = read('worker/routes/reasoning.js');

const requiredFiles = [
  'worker/day4-common.js','worker/day4-entry.js','worker/domain/reasoning-service.js',
  'worker/domain/governance-service.js','worker/domain/bmr-service.js',
  'worker/repositories/reasoning-repository.js','worker/routes/reasoning.js',
  'worker/routes/governance.js','worker/routes/business-medical-records.js',
  'migrations/day1/0004_day4_governed_reasoning.sql','wrangler.day4.json'
];

test('D4-FILES critical path files exist', () => {
  for (const file of requiredFiles) assert.doesNotThrow(() => read(file), file);
});

test('D4-CONFIG advances only isolated GalviVault QA worker to schema 0004', () => {
  assert.equal(config.name, 'galvivault-p0-day1-qa');
  assert.equal(config.main, 'worker/day4-entry.js');
  assert.equal(config.vars.ENVIRONMENT, 'qa');
  assert.equal(config.vars.MIN_SCHEMA_VERSION, '0004');
  const db = config.d1_databases.find(x => x.binding === 'DB');
  assert.equal(db.database_name, 'galvivault-0-5-qa');
  assert.equal(db.database_id, 'cdf9042b-ab09-498a-ac66-010b6cce47d4');
  assert.equal(db.migrations_dir, 'migrations/day1');
});

test('D4-MIGRATION is additive and supplies governed reasoning versioning', () => {
  for (const required of ['observation_group_id','hypothesis_group_id','finding_group_id','supersedes_finding_id','confirmation_status','governance_version','idx_observations_bmr','idx_hypotheses_bmr','idx_findings_bmr',"'0004'"]) assert.ok(migration.includes(required), required);
  for (const forbidden of ['DROP TABLE','DELETE FROM','ALTER TABLE gv1_evidence_items']) assert.equal(migration.includes(forbidden), false, forbidden);
});

test('D4-01 lineage is mandatory for observations and findings', () => {
  assert.ok(service.includes('GV_LINEAGE_REQUIRED'));
  assert.ok(service.includes('An observation requires at least one evidence link.'));
  assert.ok(service.includes('A finding requires explicit support lineage.'));
  assert.ok(service.includes('Cross-BMR'));
});

test('D4-02 hypothesis uncertainty remains separate from finding confirmation', () => {
  assert.ok(service.includes("requireText('uncertainty'"));
  assert.ok(service.includes("confirmation_status && clean(input.confirmation_status).toLowerCase() !== 'unconfirmed'"));
  assert.ok(governance.includes("decision==='confirm'?'confirmed':'rejected'"));
});

test('D4-03 material finding revision preserves version and supersession lineage', () => {
  for (const required of ['currentFindingForGroup','expected_version','supersedes_finding_id','versionNo=Number(source.version_no)+1']) assert.ok(service.includes(required), required);
});

test('IP-004 exact finding replay and changed key mismatch are explicit', () => {
  assert.ok(service.includes("'day4:finding:create'"));
  assert.ok(service.includes('GV_IDEMPOTENCY_REUSE_MISMATCH'));
  assert.ok(service.includes('idempotent_replay:true'));
});

test('RS-007 governance is privileged and cannot rewrite finding content', () => {
  assert.ok(governance.includes('UPDATE gv1_findings SET confirmation_status='));
  assert.equal(governance.includes('statement='), false);
  assert.equal(governance.includes('finding_code='), false);
});

test('LC-004/008/009 Day 4 BMR transition uses versioned idempotent lifecycle', () => {
  assert.ok(bmr.includes("bmr.status==='assessment_in_progress'&&toStatus==='under_review'"));
  assert.ok(bmr.includes('GV_VERSION_CONFLICT'));
  assert.ok(bmr.includes('idempotent_replay:true'));
});

test('D4-04 timeline reconstructs typed identity evidence reasoning governance', () => {
  for (const type of ["'session' AS entry_type","'evidence'","'observation'","'hypothesis'","'finding'","'governance'"]) assert.ok(bmr.includes(type), type);
});

test('D4-05 customer projection excludes internal reasoning and returns confirmed current findings only', () => {
  assert.ok(service.includes("confirmation_status==='confirmed'"));
  assert.ok(reasoningRoute.includes('/customer-projection'));
  assert.equal(service.includes('confirmation_reason:f.confirmation_reason'), false);
});

test('Day 4 entry remains cumulative and falls through to Day 3', () => {
  assert.ok(entry.includes("import day3Worker from './day3-entry.js'"));
  assert.ok(entry.includes('return day3Worker.fetch(request,env,executionContext)'));
});
