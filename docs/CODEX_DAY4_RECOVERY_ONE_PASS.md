# GalviCare 0.5 Day 4 — Persistent One-Pass Recovery Implementation

## Objective
Reconstruct and publish the previously completed Day 4 GalviSight + GalviPath implementation directly on the persistent GitHub branch `codex/day4-deterministic-sight-path-recovery`, then open one PR into `qa-revamped-galvicare-0-5` for human QA review.

## Authoritative Sources
1. `docs/CODEX_DAY4_IMPLEMENTATION_BRIEF.md`
2. Current repository reality on `qa-revamped-galvicare-0-5`
3. This runbook

Do not rely on DOCX files. Do not attempt to recover expired local commit `6e36b38` or missing patch artifacts.

## Root Cause Already Resolved
The earlier implementation disappeared because it existed only in an ephemeral local Codex worktree and was never persisted remotely. The recovery branch already exists on GitHub. All implementation work must be committed and pushed to this branch before continuing to the next checkpoint.

## Non-Negotiable Scope
Modify only these files unless a specific repository contradiction makes one additional file unavoidable:

- `fixtures/day4/broad_weakness.json`
- `fixtures/day4/diagnose_low_confidence.json`
- `fixtures/day4/stabilize.json`
- `fixtures/day4/validate_grow.json`
- `index.html`
- `migrations/0004_day4_galvisight_galvipath.sql`
- `package.json`
- `tests/day3-worker.test.mjs`
- `tests/day4-worker.test.mjs`
- `tests/session-continuity.test.mjs`
- `worker/worker.js`

Do not modify `main`, deploy Cloudflare, apply migrations, rotate secrets, or merge the PR.

## Mandatory Preflight — Maximum 10 Minutes
1. Confirm the checked-out branch is `codex/day4-deterministic-sight-path-recovery`.
2. Confirm the branch is linked to the remote repository and visible remotely.
3. Confirm the branch descends from `qa-revamped-galvicare-0-5`.
4. Confirm `docs/CODEX_DAY4_IMPLEMENTATION_BRIEF.md`, `worker/worker.js`, `index.html`, `package.json`, `migrations/`, `tests/`, and `fixtures/` exist.
5. Confirm the Day 4 implementation is not already present.
6. State the exact planned changed files.

If remote persistence is unavailable, stop before editing and report `REMOTE PERSISTENCE UNAVAILABLE`.

## Checkpoint 1 — Backend, Migration, Fixtures
Implement:

- Deterministic Day 4 version constants.
- D1-backed GalviSight and GalviPath actions under the existing `/api` router.
- Preservation of legacy root GalviSight/Make behavior.
- Server-side entitlement/payment and QA-only override checks.
- Stored-first retrieval and one-write `product_results` persistence.
- GalviShot evidence extraction.
- Deterministic GalviSight interpretation with confidence, follow-up, facilitator-review, evidence trace, labeled hypotheses, risks, opportunities, urgency, actions, and assumptions.
- Deterministic GalviPath selection of exactly one pathway from `stabilize`, `diagnose`, `validate`, `build`, `grow`, `fundraise`, `automate`, or `transform`.
- Deterministic 30/60/90 sequencing, evidence-to-collect, cadence, support recommendation, escalation triggers, assumptions, and source references.
- Authorized Day 3 security correction: `get_galvishot` must enforce the existing server-side entitlement or QA override before returning stored paid content. Do not change Day 3 scoring, findings, ranking, confidence, evidence, narrative, or persistence.
- Additive-only migration `migrations/0004_day4_galvisight_galvipath.sql`; preserve `UNIQUE(session_id, product)`.
- Four sanitized Day 4 fixtures with no real customer PII.
- Backend and security tests.

Run targeted backend tests. Commit and push immediately:

`Day 4 recovery checkpoint 1: backend and fixtures`

Verify the commit is visible remotely before continuing.

## Checkpoint 2 — Frontend Integration
Implement renderer-only GalviSight states:

- locked
- needs follow-up
- facilitator review
- result
- retry/error
- Continue to Chart Your GalviPath

Implement renderer-only GalviPath states:

- locked
- result
- retry/error
- print
- Book GalviClinic

Preserve canonical session continuity, current analytics, existing styles, Triage, Vitals, Score, Shot, and browser presentation-only security.

Run affected frontend/session tests. Commit and push immediately:

`Day 4 recovery checkpoint 2: frontend integration`

Verify the commit is visible remotely before continuing.

## Checkpoint 3 — Final Validation
Run exactly once:

```bash
npm run check && npm test
```

Make only targeted corrections for actual failures. After any correction, rerun only the failed targeted test. Run the full suite again only if code changed after the successful full-suite run.

Commit and push any final correction:

`Day 4 recovery checkpoint 3: final validation`

## Required Test Coverage
Confirm:

- low-confidence withholding
- entitlement locking
- stored GalviShot retrieval authorization
- QA override isolation from production
- evidence traceability
- explicit hypothesis labeling
- no unsupported invention
- stored refresh idempotency
- exactly one primary pathway
- correct 30/60/90 ordering
- canonical session continuity
- no Day 4 outbound Make/OpenAI/Airtable calls
- no Day 4 clinical rules in browser code
- legacy route regression
- Day 1–3 regression

## Pull Request
After all commits are remotely visible and tests pass, create one PR:

- **Title:** `Day 4: deterministic GalviSight and GalviPath in QA`
- **Base:** `qa-revamped-galvicare-0-5`
- **Head:** `codex/day4-deterministic-sight-path-recovery`

Do not merge.

## Final Output
Return exactly:

`DAY 4 RECOVERY IMPLEMENTATION PUBLISHED`

Then provide:

1. Remote branch URL
2. Checkpoint commit SHAs
3. PR URL and number
4. Exact changed files
5. Test commands and exact results
6. Migration path and confirmation it was not applied
7. Security/browser-boundary confirmation
8. Manual QA steps
9. `GO` or `BLOCK` for QA review

Do not create local-only patches, bundles, ZIPs, or recovery packages.