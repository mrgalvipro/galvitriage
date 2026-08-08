# GalviVault P0 Day 3 Human E2E Runbook

Use only the isolated QA Worker deployed from `qa-revamped-galvicare-0-5` with `wrangler.day3.json` and QA D1 `galvivault-0-5-qa`.

## Automated prerequisite

The `GalviVault Day 3 QA Evidence Versioning` workflow must be green. It must report schema `0003`, the accepted-evidence trigger, Day 1–2 regression PASS, Day 3 BLOCK PASS, QA deployment convergence, H3.1–H3.13 synthetic execution, direct D1 assertions, Production non-mutation, and a complete `release-evidence/day3` package.

## Authorized human review

1. Open the successful workflow run and verify the candidate SHA and deployed QA Worker URL.
2. Download or inspect the Day 3 evidence artifact and `release-evidence/day3`.
3. Confirm H3.1 submission created assessment-answer v1 and evidence v1 for the same BMR/session.
4. Confirm exact replay returned the same IDs with no duplicate rows, events, audit entries, or receipts.
5. Confirm refresh retrieval returned authoritative D1 state.
6. Confirm acceptance changed governance status only and preserved the content hash.
7. Confirm the prohibited accepted-evidence mutation returned `409 GV_EVIDENCE_IMMUTABLE` and D1 retained the original row/hash.
8. Confirm supersession inserted assessment-answer v2 and evidence v2, retained v1, and created the `corrects` lineage.
9. Confirm current view returns v2 and history returns v1 and v2.
10. Confirm rejected draft evidence remains stored but is excluded from current view.
11. Confirm cross-BMR/session, unauthorized action, and changed idempotency-key reuse all failed without canonical row deltas.
12. Confirm import reconciliation is exactly processed 3, imported 1, skipped 1, errors 1, status `completed_with_errors`.
13. Confirm Production protected-file hashes are unchanged and the public Production baseline remains reachable.
14. Confirm rollback identifies the verified Day 2 QA deployment/commit and does not use destructive down migration.

## Final confirmation

Manually dispatch the same workflow with `human_e2e_confirmed=true` and the authorized tester name only after all evidence above has been reviewed. The exact final status may be emitted only when the rerun remains green:

`DAY 3 HUMAN E2E PASS → DAY 3 BUILD FINAL`
