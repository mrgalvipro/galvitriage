import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const wrangler = readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8');
const builder = readFileSync(new URL('../scripts/day7b-build-qa-frontend.mjs', import.meta.url), 'utf8');
const obs = readFileSync(new URL('../day7c-browser-observability.js', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0005_day7c_integration_trace.sql', import.meta.url), 'utf8');

const required = [
  'galvivault-0-5-qa',
  'G-V5ZPM5L19T',
  'xswd8m446z',
  'https://calendly.com/galvilpro/galviclinic-day7c-qa'
];

test('Day 7C QA external integration configuration is explicit', () => {
  for (const marker of required) assert.ok(wrangler.includes(marker), `wrangler missing ${marker}`);
  assert.ok(wrangler.includes('"HUBSPOT_ENABLED": "true"'));
  assert.ok(!wrangler.includes('galvivault-0-5-production'));
});

test('Day 7C QA browser build preserves QA analytics and Calendly isolation', () => {
  for (const marker of required.slice(1)) assert.ok(builder.includes(marker), `builder missing ${marker}`);
  assert.ok(builder.includes('galvicare-0-5-qa.mrgalvipro.workers.dev'));
  assert.ok(builder.includes('galvicare-triage-intake.mrgalvipro.workers.dev'));
});

test('Day 7C browser observability excludes free-text/PII analytics fields', () => {
  for (const marker of required.slice(1)) assert.ok(obs.includes(marker), `observability contract missing ${marker}`);
  for (const field of ['email','phone','biggest_challenge','growth_blocker','keeps_up_at_night']) assert.ok(obs.includes(`'${field}'`));
});

test('Day 7C D1 migration is additive and trace-only', () => {
  assert.ok(migration.includes('CREATE TABLE IF NOT EXISTS integration_trace'));
  assert.ok(migration.includes('CREATE INDEX IF NOT EXISTS'));
  assert.ok(!/\b(DROP|ALTER|DELETE FROM|UPDATE)\b/i.test(migration));
});
