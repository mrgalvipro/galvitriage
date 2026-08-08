import fs from 'node:fs';

const evidencePath = process.env.DAY3_EVIDENCE_PATH;
if (!evidencePath) throw new Error('DAY3_EVIDENCE_PATH is required.');
const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(evidence.h3_1_through_h3_13 === 'PASS', 'H3.1-H3.13 did not pass.');
for (const key of ['founder_id','venture_id','bmr_id','session_id','answer_v1_id','answer_v2_id','evidence_v1_id','evidence_v2_id','rejected_evidence_id','import_batch_id']) {
  assert(evidence.canonical_ids?.[key], `Missing canonical ID: ${key}`);
}
assert(evidence.hashes?.evidence_v1 === evidence.hashes?.accepted_v1, 'Accepted evidence hash changed.');
assert(evidence.hashes?.evidence_v1 !== evidence.hashes?.evidence_v2, 'Corrected evidence hash did not change.');
const reconciliation = evidence.import_reconciliation || {};
assert(reconciliation.processed === 3, 'Import processed count must equal 3.');
assert(reconciliation.imported === 1, 'Import imported count must equal 1.');
assert(reconciliation.skipped === 1, 'Import skipped count must equal 1.');
assert(reconciliation.errors === 1, 'Import error count must equal 1.');
assert(reconciliation.status === 'completed_with_errors', 'Import final status is invalid.');
assert(reconciliation.reconciled === true, 'Import is not reconciled.');

console.log(JSON.stringify({ success: true, gate: 'verify:day3:evidence', evidence_path: evidencePath, canonical_ids: evidence.canonical_ids, import_reconciliation: reconciliation }, null, 2));
