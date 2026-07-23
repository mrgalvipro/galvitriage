import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const wrangler = JSON.parse(readFileSync(new URL('../wrangler.json', import.meta.url), 'utf8'));

test('Day 6 D1 configuration preserves the existing QA database binding', () => {
  assert.ok(Array.isArray(wrangler.d1_databases), 'd1_databases must be present');
  const db = wrangler.d1_databases.find(entry => entry.binding === 'DB');
  assert.ok(db, 'DB binding must not be removed');
  assert.equal(db.database_name, 'galvivault-0-5-qa');
  assert.equal(db.database_id, 'cdf9042b-ab09-498a-ac66-010b6cce47d4');
  assert.notEqual(db.database_id, '');
  assert.notEqual(db.database_id, 'YOUR_EXISTING_D1_DATABASE_ID');
});

test('Day 6 browser GalviVitals renders before non-blocking Worker persistence can fail', () => {
  const start = html.indexOf("assessmentForm.addEventListener('submit', async function(e){");
  const end = html.indexOf("document.getElementById('continue-to-galviscore')");
  assert.ok(start >= 0 && end > start, 'submit handler must be present');
  const submitHandler = html.slice(start, end);
  assert.ok(submitHandler.indexOf('displayResults(vitals);') < submitHandler.indexOf('submitToGalviCareWorker(payload).then'), 'GalviVitals must render before Worker persistence begins');
  assert.match(submitHandler, /submitToGalviCareWorker\(payload\)\.then[\s\S]*\.catch\(err=>showGalviCareErrorCard\(err, canonicalSessionId\)\)/);
  assert.doesNotMatch(submitHandler, /await submitToGalviCareWorker\(payload\)/);
  const errorHandler = html.match(/function showGalviCareErrorCard[\s\S]*?function labelize/)?.[0];
  assert.ok(errorHandler, 'Worker warning handler must be present');
  assert.doesNotMatch(errorHandler, /innerHTML|retry-galvicare-worker|could not prepare your Worker-based result/);
});

