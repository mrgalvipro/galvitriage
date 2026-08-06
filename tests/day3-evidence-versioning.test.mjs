import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../worker/day3.js';

const source = readFileSync(new URL('../worker/day3.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/day1/0002_day3_evidence_versioning.sql', import.meta.url), 'utf8');
const wrangler = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));

test('D3-A01 QA entry preserves protected QA D1 binding and requires schema 0002', () => {
  assert.equal(wrangler.main, 'worker/day3.js');
  assert.equal(wrangler.vars.ENVIRONMENT, 'qa');
  assert.equal(wrangler.vars.MIN_SCHEMA_VERSION, '0002');
  const binding = wrangler.d1_databases.find((entry) => entry.binding === 'DB');
  assert.equal(binding.database_name, 'galvivault-0-5-qa');
  assert.equal(binding.database_id, 'cdf9042b-ab09-498a-ac66-010b6cce47d4');
  assert.equal(binding.migrations_dir, 'migrations/day1');
});

test('D3-A02 additive migration supplies Day 3 version, import, and immutable evidence objects', () => {
  for (const required of [
    'answer_group_id',
    'evidence_group_id',
    'supersedes_evidence_id',
    'gv1_import_row_receipts',
    'trg_gv1_accepted_evidence_no_update',
    'triage.problem_clarity',
    "'0002'"
  ]) assert.ok(migration.includes(required), `missing migration contract: ${required}`);
  assert.equal(migration.includes('DROP TABLE'), false);
  assert.equal(migration.includes('DELETE FROM'), false);
});

test('D3-A03 runtime exposes only the canonical Day 3 route family and falls back to Day 1', () => {
  for (const required of [
    "path === '/api/v1/evidence'",
    '/business-medical-records',
    '/import-batches',
    'return day1Worker.fetch(request, env, ctx)'
  ]) assert.ok(source.includes(required), `missing runtime contract: ${required}`);
});

test('EV-001/002 typed evidence contract is explicit and exactly-one validation is present', () => {
  for (const valueType of ['text','number','boolean','date','json','reference','file_reference']) {
    assert.ok(source.includes(`'${valueType}'`));
  }
  assert.ok(source.includes('populated.length !== 1'));
  assert.ok(source.includes('Exactly one compatible typed value field is required.'));
});

test('EV-004 acceptance and immutable correction paths are separated', () => {
  assert.ok(source.includes("SET status='accepted'"));
  assert.ok(source.includes('GV_EVIDENCE_IMMUTABLE'));
  assert.ok(source.includes("relationship_type='corrects'") || source.includes("'corrects'"));
  assert.ok(source.includes('Only the current leaf evidence can be superseded.'));
  assert.equal(source.includes("SET status='superseded'"), false, 'accepted predecessor must not be updated to superseded');
});

test('EV-005 current selection derives from supersession lineage', () => {
  assert.ok(source.includes('newer.supersedes_evidence_id=e.evidence_id'));
  assert.ok(source.includes("e.status NOT IN ('rejected','archived')"));
});

test('IP-003 exact replay and changed-key reuse are implemented', () => {
  assert.ok(source.includes('GV_IDEMPOTENCY_REUSE_MISMATCH'));
  assert.ok(source.includes('idempotent_replay'));
  assert.ok(source.includes('checkReplay'));
});

test('IM-001 import rows use receipts, quarantine, and reconciled counts', () => {
  for (const required of [
    'gv1_import_row_receipts',
    'gv1_import_errors',
    'processed_count',
    'imported_count',
    'skipped_count',
    'error_count',
    'processed !== imported + skipped + errors'
  ]) assert.ok(source.includes(required), `missing import contract: ${required}`);
});

test('Day 1 health remains available through the Day 3 wrapper', async () => {
  const response = await worker.fetch(new Request('https://worker.test/health'), {
    ENVIRONMENT: 'qa',
    FIXTURE_MODE: 'true',
    API_VERSION: 'v1',
    MIN_SCHEMA_VERSION: '0002',
    ALLOWED_ORIGINS: ''
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.service, 'galvivault-p0');
});
