# CODEX_DAY3_IMPLEMENTATION_BRIEF

## Mission

Implement GalviCare 0.5 Day 3 on the approved QA baseline using the repository's existing single Cloudflare Worker and D1 architecture. Replace the current browser-generated/OpenAI-dependent GalviShot path with a deterministic, evidence-grounded, paid GalviShot that stores once, retrieves from storage, and preserves the existing GalviSight handoff.

Read `docs/CODEX_DAY3_BUILDER_GUIDE_FULL.md` in full before editing. The full guide is the authoritative engineering specification.

## Product Owner authorization

- Discovery Report: APPROVED
- QA baseline SHA: `a1e9f39c114e33ef1218b87b13433bc0cd7f5e85`
- Authoritative branch: `qa-revamped-galvicare-0-5`
- Isolated Codex worktree name `work` is acceptable when its HEAD matches the approved SHA.
- File modification scope: approved
- Architectural decision: keep Day 3 implementation in `worker/worker.js`; do not split into new Worker modules.
- Migration execution, production deployment, main merge, secrets rotation, and live-data changes: NOT AUTHORIZED

## Non-negotiable constraints

1. One existing Worker only.
2. QA branch/worktree only.
3. No Make and no OpenAI in the new deterministic `/api` GalviShot path.
4. Browser is presentation only. No finding triggers, ranking, confidence formula, paid result content, or permanent entitlement logic in `index.html`.
5. Every displayed finding must trace to stored Day 2 evidence or approved follow-up/facilitator evidence.
6. Never invent facts, causes, market conditions, revenue amounts, customer behavior, or founder biography.
7. Return a stored GalviShot before attempting generation.
8. Preserve Day 1/Day 2 actions, root legacy routes, existing CORS behavior, current Stripe test UX, and Continue to GalviSight.
9. D1 is the authoritative entitlement source. QA override must be server-validated and QA-only.
10. Do not merge, deploy, apply migrations, or declare release acceptance.

## Required API actions

Implement in the existing Worker router:

- `evaluate_galvishot`
- `save_galvishot_followup`
- `get_or_create_galvishot`
- `get_galvishot`

Canonical states:

- `locked`
- `needs_followup`
- `eligible`
- `ok`
- `facilitator_review`
- `not_found`
- governed error state

## Core result contract

- Rules version: `galvishot_rules_v0_5_1`
- Content version: `galvishot_content_v0_5_1`
- 3 findings for confidence 80–89.
- 3–5 findings for confidence 90–100.
- Never pad unsupported findings.
- Include a governed positive/context finding when supported.
- Deterministic ranking, stable tie-breaker, diversity, contradiction checks, and suppression.
- Same session + evidence + rules version must return the same ordered findings and stored result.

## Confidence behavior

- 0–59: `needs_followup`; no final GalviShot.
- 60–79: targeted follow-up or `facilitator_review`.
- 80–89: standard GalviShot with 3 findings and approved assumptions.
- 90–100: 3–5 findings with stronger evidence references.

Store factor metadata server-side. Expose only approved customer-facing confidence language.

## D1 strategy

Prefer existing tables:

- `product_results`
- `assessment_responses`
- `clinical_evidence`
- `clinical_findings`
- `clinical_observations`
- `clinical_followups`
- `recommendations`
- `entitlements`
- `payments`
- existing journey-event table

Prepare `migrations/0003_day3_galvishot.sql` as additive, idempotent, QA-only SQL. Do not apply it.

## Approved file scope

- `worker/worker.js`
- `index.html`
- `migrations/0003_day3_galvishot.sql`
- `tests/day3-worker.test.mjs`
- `docs/CODEX_DAY3_IMPLEMENTATION_NOTES.md`
- `docs/DAY3_QA_EVIDENCE.md`
- Day 3 fixture files under `fixtures/`
- `package.json` only if needed to add a Day 3 test command without changing existing behavior

## Required sequence

### Checkpoint 0 — Baseline
Confirm HEAD SHA, clean tree, Day 2 tests, syntax check, guide read, file plan, and no production access. Stop on failure.

### Checkpoint 1 — Contract lock
Summarize result schema, evidence hard gate, confidence, follow-ups, entitlement, stored-first behavior, ranking/diversity/suppression, D1 reuse, file scope, and preserved legacy behavior. Stop only for a true ambiguity.

### Checkpoint 2 — Backend first
Implement Worker logic, migration draft, fixtures, and backend tests. Do not edit frontend until tests pass.

### Checkpoint 3 — Frontend
Replace browser-generated GalviShot logic with presentation-only Worker calls. Preserve UX and GalviSight handoff.

### Checkpoint 4 — Self-review
Verify security, evidence traceability, idempotency, entitlement, regression, no Make/OpenAI in the new path, no browser rules, and no migration/deployment.

### Checkpoint 5 — QA package and stop
Provide changed files, tests, migration/rollback, golden cases, evidence traces, locked/follow-up/stored-refresh/duplicate/browser-security/regression evidence, manual QA, PR description, and GO/BLOCK recommendation. Then stop.

## Golden cases

1. Revenue/customer weakness.
2. Founder-capacity/leadership strain.
3. Broad multi-dimension weakness.

Each must be deterministic, evidence-linked, stored once, and returned unchanged on repeat request.

## Start instruction

Begin with Checkpoint 0 only. Do not edit until baseline confirmation and contract summary are returned.
