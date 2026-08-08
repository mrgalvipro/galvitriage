**GALVIVAULT™ P0**

**DAY 3 BUILDER GUIDE**

**Codex Implementation Engineer Edition**

*Capture • Verify • Preserve Source Evidence and Version History*

| Authoritative derivative                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| This Day 3 Builder Guide is derived from the GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5, and uses the approved Day 2 Builder Guide as its execution-format model. It converts the governing question-definition, assessment-answer, evidence, immutability, versioning, import, Worker, D1, QA, Human E2E, rollback, and release-evidence contracts into one executable Day 3 instruction set for Codex. |

**Repository: mrgalvipro/galvitriage**

Implementation branch: qa-revamped-galvicare-0-5

Production branch: main

August 2026 • Version 1.0

# Document Control and Builder Authority

| Item                       | Binding value                                                                                                                                                           |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Document                   | GalviVault™ P0 Day 3 Builder Guide — Codex Implementation Engineer Edition                                                                                              |
| Source authority           | GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5                                                                          |
| Execution-format precedent | GalviVault™ P0 Day 2 Builder Guide — Codex Implementation Engineer Edition, Version 1.0                                                                                 |
| Repository                 | mrgalvipro/galvitriage                                                                                                                                                  |
| Implementation branch      | qa-revamped-galvicare-0-5                                                                                                                                               |
| Production branch          | main                                                                                                                                                                    |
| Day 3 objective            | Make founder-submitted and authorized operator-captured source material a durable, typed, versioned evidence record linked to the canonical BMR and assessment session. |
| Prerequisite               | DAY 2 HUMAN E2E PASS → DAY 2 BUILD FINAL with stable Founder, Venture, BMR, and session IDs; one BMR per Venture; QA/Production isolation; and complete Day 2 evidence. |
| Canonical QA authority     | Extend the existing isolated QA Worker and QA D1 established on Days 1–2. Preserve all prior routes, migrations, deployments, and Production behavior.                  |
| Final status language      | DAY 3 HUMAN E2E PASS → DAY 3 BUILD FINAL only when every blocking gate and required evidence artifact passes.                                                           |

| No-assumption rule for Codex                                                                                                                                                                                                                                                                                                                                                                                                                        |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Repository files, current QA deployment configuration, D1 identifiers, Day 1 and Day 2 evidence, migration ledger, schema objects, and command output are authoritative. Codex must inspect the actual QA branch and deployed resources before editing. It must not reconstruct unseen contents from chat history, screenshots, or implementation reports. A retrieval or platform failure must be recorded exactly and the dependent step stopped. |

## How Codex must use this guide

1.  Read Sections 1–5 before modifying any repository file. Confirm Day 2 BUILD FINAL, environment isolation, and the stable known-good Founder/Venture/BMR/session identity set first.

2.  Retrieve the actual QA-branch versions of every Day 3 critical file and every Day 1–2 module that will be extended. Record the starting commit, QA Worker deployment, QA D1 safe reference, schema ledger, and rollback deployment.

3.  Build in the sequence defined in Sections 6–14. Do not deploy until clean/local schema verification and the complete Day 3 automated BLOCK matrix pass.

4.  Preserve every Day 1 and Day 2 route, migration, identity, BMR, and continuity invariant. Day 3 is additive and may not replace the approved Worker foundation or Production entry.

5.  Use the existing canonical modules when present. Do not create parallel question, answer, evidence, import, response, authorization, idempotency, or D1 implementations merely to avoid integrating with the approved architecture.

6.  Execute the Day 3 Human E2E exactly as written. A 2xx response without direct D1 proof of typing, source metadata, BMR/session scope, immutability, supersession lineage, and import reconciliation is not a pass.

7.  Complete release-evidence/day3 and a tested rollback record before declaring Day 3 complete.

8.  Return a final implementation report containing exact changed files, starting/final commits, commands, tests, migration decision, QA deployment, D1 assertions, Human E2E evidence, defects, rollback result, and final gate decision.

## Contents

- 1\. Day 3 Executive Outcome and Definition of Done

- 2\. Locked Architecture, Scope, and Do-Not-Break Rules

- 3\. Day 2 Prerequisite Verification and Starting-State Inspection

- 4\. Day 3 Repository Target and File Inventory

- 5\. Canonical Question, Answer, Evidence, and Import Contracts

- 6\. Phase A — Freeze Day 2 Baseline and Establish Day 3 Evidence

- 7\. Phase B — Constants, Validation, Authentication, Authorization, and Idempotency

- 8\. Phase C — Question Definitions and Assessment Answers

- 9\. Phase D — Typed Evidence Submission and Retrieval

- 10\. Phase E — Acceptance and Immutable Evidence

- 11\. Phase F — Supersession, Rejection, Current, and History

- 12\. Phase G — Targeted Import, Quarantine, and Reconciliation

- 13\. Phase H — REST Routes and Compatibility Actions

- 14\. Phase I — Fixtures, Tests, Scripts, Documentation, and Evidence

- 15\. Automated QA Matrix and Execution Order

- 16\. Local and QA Deployment Runbook

- 17\. Day 3 Human E2E Procedure

- 18\. Acceptance Gate, Rollback, and Final Codex Handoff

- Appendix A — Day 3 API Contract

- Appendix B — Evidence and Import SQL Verification Queries

- Appendix C — Fixture Catalog and Expected Row Deltas

- Appendix D — Release-Evidence Templates

- Appendix E — Codex Final Implementation Report Template

# 1. Day 3 Executive Outcome and Definition of Done

Day 3 creates the canonical source-evidence layer on top of the proven Day 2 identity and continuity foundation. It preserves versioned assessment questions, assessment-answer versions, generic typed evidence, source and consent context, acceptance decisions, correction lineage, and targeted import reconciliation without collapsing source facts into a generated report or silently changing accepted history.

| Day 3 outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| For the known-good Day 2 BMR and session, the QA Worker can validate and persist a versioned assessment answer and its canonical evidence record; retrieve the same record after refresh/reconnect; accept it without changing content; reject invalid or unauthorized actions safely; supersede it with a new version while retaining the prior accepted version and lineage; and process a small import batch with valid, duplicate, and invalid rows whose counts fully reconcile. All retries are duplicate-safe and all canonical proof comes from D1. |

## 1.1 Required outputs

- Versioned question definitions and assessment-answer versions with exact question_id + question_version references, raw and normalized values, confidence effect where applicable, source, captured_at, BMR, and session.

- Evidence service, repository, and route behavior for submit, retrieve, accept, reject, and supersede using the canonical Worker and D1 path.

- Typed evidence enforcement for text, number, boolean, date, JSON, reference, and file_reference with exactly one compatible typed value field.

- Stable server-generated evidence_id/evidence_group_id and answer_id/answer_group_id, deterministic version numbers, explicit supersedes links, and correction relationships.

- Accepted-evidence immutability enforced at both service and database levels without weakening the approved trigger.

- Bounded current/history retrieval that distinguishes current selection from preserved versions and returns source/lineage metadata.

- Targeted import batches with source metadata, checksum, expected counts, idempotent source-row keys, canonical service execution, quarantine, and reconciliation.

- Day 3 fixtures, tests, scripts, API/operations documentation, deployment metadata, D1 assertions, Human E2E proof, defects, and rollback record in release-evidence/day3.

## 1.2 Definition of Done

| Dimension            | Pass condition                                                                                                                                                                            |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Prerequisite         | Day 2 evidence is complete; Day 1–2 automated suites, QA routes, stable identity set, one-BMR invariant, session continuity, and Production baseline remain green.                        |
| Question definitions | The referenced question_id + question_version exists, is active/effective for the fixture, and retains product, dimension, prompt, response type, bounds, status, and dates.              |
| Assessment answers   | Each submitted assessment answer preserves the exact question version, raw and normalized values, BMR/session, source, captured_at, group/version, and supersession history.              |
| Typed evidence       | value_type matches exactly one typed value field; ambiguous, unsupported, malformed, or oversized values return canonical 4xx errors with no row.                                         |
| Source and scope     | Source type/ref, actor context, consent context where applicable, captured_at, BMR, and optional same-BMR session are preserved; cross-BMR/session references fail without partial state. |
| Acceptance           | Authorized acceptance changes only allowed status/governance fields, emits event/audit evidence, and leaves content/hash unchanged.                                                       |
| Immutability         | Any in-place update to accepted evidence fails safely at the service/API and D1 trigger layers; no value, source, hash, or timestamp is changed.                                          |
| Supersession         | Correction creates version_no + 1 in the same group, links supersedes_evidence_id and a corrects relationship, preserves version 1, and makes the new leaf version current.               |
| Rejection            | Authorized rejection retains the record and reason/audit; rejected evidence is excluded from current by default and is never deleted.                                                     |
| Import               | Valid rows use canonical services; duplicate source-row replay creates no duplicate; invalid rows are quarantined; processed = imported + skipped + errors and final status is correct.   |
| Automated QA         | Every Day 3 BLOCK test passes; mandatory skipped count is zero; Day 1–2 regression and Production protection pass.                                                                        |
| Human E2E            | Submission, replay, refresh, acceptance, immutable failure, supersession/history, cross-scope rejection, rejection, import reconciliation, and Production regression pass with D1 proof.  |
| Evidence             | The Day 3 package identifies exact repository/branch/commits, deployment, QA D1, migration/schema, commands, tests, canonical IDs, D1 queries, defects, and rollback.                     |
| Final decision       | Only then may Codex state: DAY 3 HUMAN E2E PASS → DAY 3 BUILD FINAL.                                                                                                                      |

## 1.3 Explicit non-goals

- Do not build observations, hypotheses, findings, confirmation workflows, or BMR reasoning/timeline projections; those are Day 4.

- Do not build recommendations, treatment plans, outcomes, feedback, learning-candidate governance, or downstream adapters; those are Day 5.

- Do not promote to main or declare Production readiness.

- Do not redesign the Production Worker, GalviCare UI, Stripe, HubSpot, GA4, Clarity, Calendly, Pages routing, repository, or branch strategy.

- Do not store file bytes, transcripts, reports, or arbitrary source payloads in evidence_items. Store a governed reference and bounded metadata only.

- Do not add autonomous AI, OpenAI calls, Make, Airtable writes, GraphQL, a second writable database, or direct browser-to-D1 writes.

- Do not perform broad historical import, identity merge, destructive cleanup, or ad hoc Production SQL.

# 2. Locked Architecture, Scope, and Do-Not-Break Rules

## 2.1 Locked execution path

> Approved QA client, test harness, or authorized import caller  
> -\> isolated Cloudflare Worker QA deployment  
> -\> approved QA entry and canonical app/router  
> -\> request/CORS/environment/authentication/authorization/error/response utilities  
> -\> evidence or import route / compatibility action  
> -\> evidence-service or import-service  
> -\> parameterized evidence-repository / import-repository  
> -\> QA D1 binding: DB  
> -\> atomic answer/evidence/event/audit/idempotency or import result/quarantine/counts  
> -\> canonical JSON response

No browser, fixture, report generator, import script, CRM, analytics client, or adapter may write question definitions, assessment answers, evidence, relationships, import batches, or import errors directly to D1 outside approved migration/test setup and the canonical Worker repository/domain path.

## 2.2 Binding Day 3 decisions

| Decision                                               | Day 3 consequence                                                                                                                                                           |
|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| D1 is the sole writable P0 system of record.           | All question, answer, evidence, relationship, import, event, audit, and idempotency writes flow through DB. External copies and generated reports remain non-authoritative. |
| One Worker is the runtime write authority.             | No parallel evidence endpoint, direct SQL script, browser persistence, or import-only business implementation.                                                              |
| Identity before evidence.                              | Every evidence/answer command resolves an existing BMR and, when supplied, a session that belongs to the same BMR/venture.                                                  |
| Evidence classes remain separated.                     | Question definitions, assessment answers, evidence items, relationships, events, audit, and import errors remain separate typed records, not one report JSON blob.          |
| Canonical IDs and version groups are server-governed.  | Clients may submit idempotency and source-row keys, but not trusted evidence_id, answer_id, group IDs, version numbers, actor privilege, or current-selection flags.        |
| Accepted evidence is immutable.                        | Service exposes no content update path; database trigger remains enabled; correction creates a new version and relationship.                                                |
| Current state is a projection over history.            | Current evidence is derived from the leaf/latest eligible version in a group. History never disappears because a newer version exists.                                      |
| Question versions are exact references.                | An answer never silently moves to the latest question version; it preserves the question_id + question_version used at capture.                                             |
| Imports use the same domain services.                  | Import rows are commands into the canonical services. Invalid rows are quarantined instead of coerced or inserted into canonical tables.                                    |
| Writes are idempotent by declared key and fingerprint. | Exact replay returns the committed result; changed reuse returns 409 and creates no row/count/event/audit delta.                                                            |
| QA and Production remain isolated.                     | Day 3 extends only QA code/data and does not change Production routing, bindings, fixture policy, or customer state.                                                        |
| Prior days remain regression-protected.                | Health, readiness, schema, identity, one-BMR, session continuity, profile versioning, CORS, envelopes, fixtures, and Production baseline remain green.                      |

## 2.3 Critical immutability implementation clarification

| Preserve the stronger approved trigger                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The approved baseline trigger rejects every UPDATE when OLD.status = accepted. Day 3 must not weaken or replace that trigger merely to set the prior row status to superseded. Insert the corrected version and the corrects/supersedes lineage, then derive is_current=false / superseded_by from the version chain. The prior accepted row remains byte-for-byte unchanged. If the actual approved schema already contains a narrower content-only trigger, Codex must document that exact behavior and prove it; it may not silently edit an applied migration. |

## 2.4 Do-not-break rules

- Do not overwrite or repurpose the Production entry point or point Production at the Day 3 QA entry.

- Do not rewrite an applied Day 1/Day 2 migration. Any missing Day 3 constraint, index, trigger, or seed requires a new additive migration using the next actual ledger ID.

- Do not create an UPDATE repository method for accepted evidence content or bypass the trigger with direct SQL.

- Do not trust request-body source_actor_type, source_actor_id, role, owner, operator, import authorization, BMR scope, group ID, version number, or status transition.

- Do not attach a session, answer, evidence item, or import result to a BMR from another Venture.

- Do not coerce a string to a number/boolean/date, choose among multiple populated typed fields, invent missing consent/source metadata, or accept invalid JSON.

- Do not log or place in release evidence full sensitive evidence bodies, imported source files, uploaded file bytes, tokens, raw SQL errors, or stack traces.

- Do not mark a batch completed when expected/processed/reconciliation counts do not explain every row.

- Do not weaken, skip, catch-and-ignore, or alter expected values solely to make a gate green.

- Do not create a new branch or duplicate implementation to bypass retrieval, merge, deployment, migration, or test failures.

- At closeout, QA must be stable and evidenced or reverted to the Day 2 rollback point.

## 2.5 Stop conditions

| Stop condition                                                                           | Required response                                                                                                             |
|------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Day 2 final evidence, stable identity set, or deployed QA baseline cannot be verified.   | Stop Day 3. Re-establish DAY 2 BUILD FINAL before editing evidence behavior.                                                  |
| QA and Production Worker/D1 targets cannot be distinguished.                             | Stop configuration/deployment work until exact resources and bindings are identified.                                         |
| Current critical files cannot be retrieved.                                              | Record the exact connector/tool error; do not fabricate unseen content or replace the repository.                             |
| Day 1 or Day 2 regression fails before Day 3 changes.                                    | Record as pre-existing, identify impact, and obtain Product Owner direction; do not overwrite Production or hide the failure. |
| Required evidence tables, indexes, or accepted-evidence trigger are absent/incompatible. | Stop and determine whether prior-day migration is incomplete or an approved additive Day 3 migration is required.             |
| A BLOCK test fails or is skipped.                                                        | Stop acceptance; fix root cause and rerun the failed test plus the affected regression scope.                                 |
| Human E2E needs D1 repair, browser-state manipulation, or unapproved SQL.                | Fail the run, preserve evidence, reset only the approved synthetic fixture, and correct the implementation.                   |
| A secret, Production identifier, or sensitive source payload is exposed.                 | Stop, remove/rotate/scrub as required, and rerun security/redaction checks before continuing.                                 |

# 3. Day 2 Prerequisite Verification and Starting-State Inspection

## 3.1 Required retrieval set

| Priority | Path/resource                                                                           | Why inspect                                                                                                                                                     |
|----------|-----------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Critical | package.json                                                                            | Preserve Day 1–2 scripts/tooling and add real Day 3 verification/test/smoke commands without placeholders.                                                      |
| Critical | wrangler.json                                                                           | Confirm QA entry, DB binding, environment variables, origins, fixture policy, schema requirement, and Production isolation.                                     |
| Critical | worker/day1.js and actual current QA entry                                              | Identify exact routing/wiring and extend only the approved QA application path.                                                                                 |
| Critical | worker/app.js, router.js, http/\*, config/\*, security/\*, lib/\*                       | Reuse canonical request, envelope, auth, scope, redaction, IDs, time, validation, transactions, audit, and idempotency utilities.                               |
| Critical | worker/domain/evidence-service.js and import-service.js if present                      | Extend actual services; do not create a second evidence/import implementation.                                                                                  |
| Critical | worker/repositories/evidence-repository.js and import-repository.js if present          | Verify parameterized SQL, version selection, trigger expectations, batch counts, and receipt usage.                                                             |
| Critical | worker/routes/evidence.js, imports.js, and http/routes.js                               | Confirm registered methods, caller classes, body limits, idempotency requirement, and compatibility mapping.                                                    |
| Critical | migrations/\*\* and schema_migrations ledger                                            | Verify question_definitions, assessment_answers, evidence_items, evidence_relationships, import_batches, import_errors, indexes, and accepted-evidence trigger. |
| Critical | tests/day1-foundation.test.mjs and tests/day2-identity-continuity.test.mjs plus helpers | Preserve prior contracts and reuse proven Worker/D1 test harness, fixtures, and assertion utilities.                                                            |
| Critical | release-evidence/day1/\* and release-evidence/day2/\*                                   | Verify prior final commits/deployments, migration/schema, Human E2E, stable identity set, defects, and rollback point.                                          |
| Preserve | Production entry files, deployment, D1, Pages/public route                              | Establish immutable regression baseline; no Day 3 functional edit.                                                                                              |
| Platform | QA Worker, QA D1, Production Worker/D1, allowed origins                                 | Prove environment isolation and record exact deployment/database rollback references.                                                                           |

## 3.2 Baseline capture procedure

**1.** Confirm repository and implementation branch; record the starting commit SHA and working-tree status.

**2.** Read release-evidence/day2 and verify its final commit/deployment corresponds to the selected QA branch or document an approved later regression-only commit.

**3.** Run Day 1 and Day 2 file inventory, static/secret checks, automated suites, QA smoke, remote D1 identity assertions, and non-destructive Production baseline smoke.

**4.** Query schema_migrations and sqlite_master in QA D1. Record actual table/index/trigger names and current schema version before deciding whether Day 3 needs SQL.

**5.** Resolve the known-good Day 2 founder_id, venture_id, bmr_id, session_id, fixture/business keys, and authorized operator/import test context. Do not guess IDs from screenshots.

**6.** Record row counts for question_definitions, assessment_answers, evidence_items, evidence_relationships, import_batches, import_errors, journey_events, audit_log, and idempotency_keys before Day 3 fixtures.

**7.** Record QA Worker deployment/version, QA D1 safe reference, Wrangler/Node/npm versions, compatibility date, approved QA origins, fixture mode, and required schema.

**8.** Hash or preserve the pre-Day 3 versions of every critical file to be edited.

**9.** Create release-evidence/day3 and write baseline.json plus pre-day3-counts.txt before modification.

## 3.3 Day 3 resolved variables

| Variable                                       | Resolution rule                                                                              |
|------------------------------------------------|----------------------------------------------------------------------------------------------|
| \<STARTING_QA_COMMIT_SHA\>                     | Read from qa-revamped-galvicare-0-5 at Day 3 start.                                          |
| \<DAY2_FINAL_COMMIT_SHA\>                      | Read from Day 2 evidence and verify against repository history.                              |
| \<QA_WORKER_NAME/DEPLOYMENT\>                  | Read the actual isolated QA deployment; never guess.                                         |
| \<QA_D1_DATABASE_NAME/SAFE_REFERENCE\>         | Read the actual QA DB bound as DB; never reuse Production.                                   |
| \<PRODUCTION_BASELINE_COMMIT/DEPLOYMENT\>      | Record for regression and rollback reference only.                                           |
| \<ALLOWED_QA_ORIGINS\>                         | Exact approved QA/local origins; no privileged wildcard.                                     |
| \<CURRENT_SCHEMA_VERSION\>                     | Read schema_migrations and /api/v1/schema-version.                                           |
| \<DAY3_MIGRATION_ID\>                          | Use the next actual additive migration ID only if a schema/index/trigger change is required. |
| \<DAY3_SEED_MIGRATION_ID\>                     | Use only if the required versioned question definition is not already present.               |
| \<KNOWN_GOOD_FOUNDER/VENTURE/BMR/SESSION_IDS\> | Read from Day 2 evidence or the actual QA Worker/D1.                                         |
| \<DAY3_IDEMPOTENCY_KEYS\>                      | Synthetic, deterministic, non-sensitive keys unique to each semantic request.                |
| \<DAY3_IMPORT_BATCH_SOURCE/CHECKSUM\>          | Version-controlled synthetic fixture identity and checksum.                                  |
| \<QA_WORKER_URL\>                              | Capture after deployment and use consistently in smoke and Human E2E.                        |

# 4. Day 3 Repository Target and File Inventory

## 4.1 Canonical additive tree

> mrgalvipro/galvitriage/  
> ├── package.json \# extend scripts only after inspection  
> ├── wrangler.json \# preserve QA/Production isolation  
> ├── worker/  
> │ ├── day1.js / current approved QA entry \# extend routing additively  
> │ ├── app.js, router.js, http/routes.js \# register canonical Day 3 routes  
> │ ├── config/constants.js, domain/constants.js \# statuses, value/source types, limits  
> │ ├── lib/validation.js, ids.js, fingerprints.js, idempotency.js, transactions.js, audit.js  
> │ ├── security/authentication.js, authorization.js, redaction.js  
> │ ├── domain/evidence-service.js  
> │ ├── domain/import-service.js  
> │ ├── repositories/evidence-repository.js  
> │ ├── repositories/import-repository.js  
> │ ├── routes/evidence.js  
> │ └── routes/imports.js  
> ├── migrations/day3/ \# only if additive SQL/seed is required  
> ├── tests/day3-evidence-versioning.test.mjs  
> ├── tests/fixtures/day3-evidence.json  
> ├── tests/fixtures/day3-import.json  
> ├── scripts/verify-day3-files.mjs  
> ├── scripts/verify-day3-evidence.mjs  
> ├── scripts/day3-smoke.mjs  
> ├── docs/api/day3-evidence-versioning.md  
> ├── docs/operations/day3-human-e2e.md  
> └── release-evidence/day3/  
> ├── README.md  
> ├── baseline.json  
> ├── changed-files.txt  
> ├── migration-transcript.txt  
> ├── deployment-metadata.json  
> ├── automated-tests.txt  
> ├── automated-tests.json  
> ├── database-assertions.sql  
> ├── database-assertions.txt  
> ├── evidence-trace.json  
> ├── import-reconciliation.json  
> ├── human-e2e.md  
> ├── defects.md  
> ├── rollback.md  
> └── final-gate.md

The paths above are additive targets, not permission to duplicate existing modules. When the actual repository uses an approved equivalent path, extend it and update docs/repository-inventory.md. Any material path deviation must be documented with rationale and no second implementation path.

## 4.2 File responsibilities

| Path                                       | Day 3 responsibility                                                                                                                                                      | Must not do                                                                                                                     |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| worker/domain/evidence-service.js          | Validate question/answer/evidence commands; resolve BMR/session scope; submit atomically; accept/reject; supersede; return current/history; emit event/audit/idempotency. | Contain raw route parsing, trust client actor/group/version fields, update accepted content, or collapse evidence into reports. |
| worker/repositories/evidence-repository.js | Read question definitions; resolve answer/evidence versions; insert answer/evidence/relationship rows; current/history queries; no accepted-content update method.        | Generate policy, authorize callers, interpolate SQL, or hide trigger failures.                                                  |
| worker/domain/import-service.js            | Create batch, validate/normalize row command, execute canonical service, classify imported/skipped/error, reconcile/close.                                                | Insert canonical rows directly, coerce invalid data, or close unexplained counts.                                               |
| worker/repositories/import-repository.js   | Create/read batch; append import error; update counts/status with expected state; use source-row idempotency receipt.                                                     | Treat import_errors as canonical evidence, overwrite source checksum, or silently omit rows.                                    |
| worker/routes/evidence.js                  | Register submit/accept/reject/supersede/get/list handlers, caller metadata, body limits, and idempotency policy.                                                          | Implement business SQL or return non-canonical envelopes.                                                                       |
| worker/routes/imports.js                   | Register batch/row/close handlers for authorized import scope.                                                                                                            | Expose to public journey or bypass authentication/authorization.                                                                |
| worker/lib/validation.js and constants     | Centralize allowed value/source/status types, exactly-one-field checks, question/answer constraints, timestamps, JSON/reference checks, and bounded fields.               | Silently coerce/invent values or scatter duplicate enums/limits.                                                                |
| tests/day3-evidence-versioning.test.mjs    | Execute schema, domain, repository, API, security, idempotency, version/history, import, and regression assertions with real D1-compatible persistence.                   | Mock away required D1 constraints or mark BLOCK tests skipped.                                                                  |
| scripts/verify-day3-evidence.mjs           | Run safe direct D1 assertions and produce nonzero exit on duplicate/orphan/immutability/version/reconciliation failures.                                                  | Modify Production or print success without checking rows.                                                                       |
| scripts/day3-smoke.mjs                     | Run environment-targeted health/readiness, evidence, replay, retrieval, acceptance, supersession, import, and negative smoke with safe output.                            | Embed secrets, hard-code guessed IDs, or use direct D1 repair.                                                                  |

## 4.3 Migration decision rule

| Inspect before creating SQL                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| The Version 0.5 baseline contract already defines question_definitions, assessment_answers, evidence_items, evidence_relationships, import_batches, import_errors, evidence indexes, and the accepted-evidence trigger. Day 3 creates no migration merely to show activity. Create an additive migration only when the actual QA schema lacks a contracted object/constraint/index/trigger or when the required question seed is absent. Never edit an applied migration. |

# 5. Canonical Question, Answer, Evidence, and Import Contracts

## 5.1 Question-definition contract

| Field/rule            | Binding contract                                                                                                                                                          |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity              | Composite identity is question_id + question_version. Neither field is inferred from the prompt text.                                                                     |
| Required content      | product, prompt, response_type, required_flag, status, created_at; dimension, bounds, weight, score_direction, effective_at/retired_at where applicable.                  |
| Statuses              | draft, active, retired. A submitted answer references an active/effective version unless the authorized import contract explicitly preserves a historical source version. |
| Version behavior      | Changing prompt, type, bounds, weight, score direction, or meaning creates a new question_version. Prior definitions remain.                                              |
| Seed behavior         | Use INSERT OR IGNORE only for immutable versioned reference rows and verify exact values/checksum. Do not overwrite a version in place.                                   |
| Known-good P0 fixture | triage.problem_clarity + v1, product GalviTriage, dimension Problem, response_type number, required, bounds 0–100, weight 1.0, higher_is_better, active.                  |

## 5.2 Assessment-answer contract

| Rule           | Required behavior                                                                                                                                                                               |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity       | answer_id is a server-generated version-row ID; answer_group_id is a stable server-generated group. For assessment capture, the current group is resolved by session_id + question_id.          |
| Reference      | Every answer stores bmr_id, session_id, question_id, and exact question_version. The session and question must exist.                                                                           |
| Values         | Preserve raw_value_text or raw_value_number and normalized_value_text or normalized_value_number according to the question response type. Do not discard the raw value after normalization.     |
| Versioning     | First answer is version_no 1. A material changed answer creates version_no + 1 and supersedes_answer_id. Prior rows remain retrievable.                                                         |
| No change      | Semantically identical current answer may return no_change/current identity; it does not create a new version.                                                                                  |
| Source/time    | source and captured_at are required; confidence_effect is preserved when applicable.                                                                                                            |
| Status         | draft, accepted, superseded, rejected according to the approved schema; no in-place content rewrite.                                                                                            |
| Evidence trace | An assessment-answer submission also creates the evidence version in the same logical operation with source_type=assessment_answer and source_ref=answer_id (or the exact approved equivalent). |

## 5.3 Typed evidence contract

| value_type     | Required populated field                                               | Validation and storage rule                                                                                                     |
|----------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| text           | value_text                                                             | Bounded UTF-8 text; preserve meaningful whitespace policy; no HTML/script execution; all other typed fields null.               |
| number         | value_number                                                           | Finite numeric value; apply question/domain bounds when present; no string coercion; all other typed fields null.               |
| boolean        | value_boolean                                                          | Exactly 0/1 in D1 and boolean in JSON contract; no truthy-string coercion.                                                      |
| date           | value_date                                                             | Validated ISO date/date-time according to the route contract; preserve source meaning; reject invalid/free-form dates.          |
| json           | value_json                                                             | Validated bounded object/array; stable serialization; reject malformed, scalar-only when prohibited, or excessive nesting/size. |
| reference      | value_text                                                             | Governed canonical/external reference token or URI string; validation only, no automatic fetch or side effect.                  |
| file_reference | value_text or bounded value_json metadata per actual schema convention | Reference to an approved stored file/object plus safe metadata; never store file bytes or unbounded extracted content.          |

Exactly-one rule: for each evidence version, the field compatible with value_type is populated and every incompatible typed field is NULL. A request with zero or more than one typed value field is rejected with 422 GV_REQ_SCHEMA before persistence.

## 5.4 Evidence provenance and scope

| Required fact  | Contract                                                                                                                                                           |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bmr_id         | Must exist and be authorized for the resolved actor/session.                                                                                                       |
| session_id     | Optional for non-session evidence; when supplied it must exist and belong to the same BMR and Venture.                                                             |
| source_type    | Required approved enum such as assessment_answer, facilitator_capture, imported_reference, file_reference, measurement, or transcript_excerpt when later approved. |
| source_ref     | Required when a source has a stable reference, such as answer_id/question reference/import row/file reference.                                                     |
| source actor   | Derived from authenticated/authorized request context or approved service context. Body fields cannot grant privilege.                                             |
| consent_status | Preserved and validated where applicable; no invented approval.                                                                                                    |
| captured_at    | Required UTC ISO-8601 and not unreasonably future-dated; distinct from created_at.                                                                                 |
| content_hash   | Deterministic hash over canonical typed content used for immutability proof; excludes mutable status and volatile timestamps.                                      |

## 5.5 Evidence version, acceptance, and current-selection rules

| Scenario                 | Canonical result                                                                                                                                                                                                             |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Submit new evidence      | Create evidence_id + evidence_group_id, version_no 1, status draft, provenance, event, audit, idempotency receipt.                                                                                                           |
| Exact replay             | Return the same evidence/answer version and replay metadata; do not duplicate answer, evidence, relationships, event, audit, or counts.                                                                                      |
| Accept draft             | Authorized status transition to accepted; content_hash and all content/provenance fields unchanged; evidence_accepted + audit.                                                                                               |
| Accept already accepted  | Return no_change/idempotent response; no duplicate event/audit.                                                                                                                                                              |
| Reject draft             | Authorized transition to rejected with reason/event/audit; record remains and is excluded from current by default.                                                                                                           |
| Correct accepted/draft   | Insert new version in the same group, create supersedes and corrects lineage, and preserve prior row unchanged. New version starts draft unless the approved service explicitly performs a separately authorized acceptance. |
| Current retrieval        | Return the eligible leaf/latest version in each group that is not itself superseded by a newer version and is not rejected/archived by default.                                                                              |
| History retrieval        | Return all versions ordered by group/version with supersedes/superseded_by and relationship metadata.                                                                                                                        |
| In-place accepted update | 409 GV_EVIDENCE_IMMUTABLE or safely mapped trigger error; no row/event/audit/idempotency mutation except optional safe application error.                                                                                    |

## 5.6 Transaction boundaries

| Operation                         | Atomic statements                                                                                                                                                                                                            |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Submit assessment answer/evidence | Validate actor/BMR/session/question/type; resolve next answer/evidence versions; insert answer; insert evidence; optional relationship; event; audit; idempotency receipt. No partial answer without evidence or vice versa. |
| Submit generic evidence           | Validate scope/type/source; insert evidence version; event; audit; idempotency receipt.                                                                                                                                      |
| Accept/reject                     | Compare allowed current status; update only permitted governance/status fields; event; audit; idempotency receipt.                                                                                                           |
| Supersede                         | Read source version/current chain; insert new answer version when applicable; insert new evidence version; insert corrects relationship; event; audit; idempotency receipt. Prior accepted row untouched.                    |
| Import row                        | Validate batch/open state and source-row fingerprint; call canonical service; persist receipt and canonical result or append quarantine error; update one set of counts.                                                     |
| Close import batch                | Compare expected/processed/count equation and current batch state; set final status/completed_at; audit/receipt.                                                                                                             |

## 5.7 Import contract

| Rule             | Binding behavior                                                                                                                                                                                       |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Batch identity   | import_batch_id is server-generated; source_type, source_name, source_checksum, environment, expected_count, created_by, and timestamps preserved.                                                     |
| Authorized scope | Only approved operator/import service context may create, process, or close a batch. Public journey callers receive 401/403.                                                                           |
| Row key          | import_batch_id + source_row_key is the repeatable idempotency scope. Exact replay returns prior result and does not change counts.                                                                    |
| Canonical path   | A valid row is translated to the same evidence/domain command used by API routes; no direct insert shortcut.                                                                                           |
| Quarantine       | Invalid/ambiguous row creates import_errors with field/error/safe message/bounded quarantined payload; no malformed canonical row.                                                                     |
| Count semantics  | First processed valid row: processed+1/imported+1. First valid no-change/business duplicate: processed+1/skipped+1. First invalid row: processed+1/error+1. Replay: no count delta.                    |
| Close/reconcile  | Require processed = imported + skipped + error and, when expected_count is provided, processed = expected_count. Final status completed or completed_with_errors; otherwise conflict/validation error. |
| No silent repair | Checksum/source mismatch, changed source-row fingerprint, unexplained counts, or closed batch writes fail safely and remain evidenced.                                                                 |

# 6. Phase A — Freeze Day 2 Baseline and Establish Day 3 Evidence

**1.** Create release-evidence/day3 and record scope: question/answer/evidence/import only; no Day 4 reasoning or Day 5 care.

**2.** Write baseline.json with repository, branch, starting SHA, Day 2 final SHA, QA Worker/deployment, QA D1 safe reference, schema version, allowed origins, fixture policy, known-good identity IDs (redacted), and rollback deployment.

**3.** Run and archive Day 1 and Day 2 tests, QA smoke, remote identity/BMR/session assertions, and Production baseline smoke before edits.

**4.** Capture pre-Day 3 row counts and schema object inventory for all Day 3 tables/indexes/triggers.

**5.** Inspect the actual migration and trigger behavior. Record migration decision as none required or identify the exact missing contracted object requiring an additive migration.

**6.** Create changed-files.txt with intended files and a clear preserve list for Production entry/configuration and applied migrations.

**7.** Stop if any prerequisite, environment, schema, retrieval, regression, or security condition is unresolved.

## 6.1 Required baseline command categories

> git status --short  
> git rev-parse HEAD  
> node --version  
> npm --version  
> npx wrangler --version  
>   
> \# Use the actual package scripts and Wrangler/D1 names discovered in the repository:  
> npm run verify:day1:files  
> npm run test:day1  
> npm run test:day2:regression  
> npm run smoke:day2:qa  
> \<QA_D1_EXECUTE\> --command "SELECT migration_id,name,environment,applied_at FROM schema_migrations ORDER BY migration_id"  
> \<QA_D1_EXECUTE\> --file release-evidence/day3/database-assertions.sql  
> \<PRODUCTION_SAFE_SMOKE_COMMAND\>

Command names above are patterns. Codex must merge with the actual package.json and record every command actually run; it may not invent a successful transcript.

# 7. Phase B — Constants, Validation, Authentication, Authorization, and Idempotency

## 7.1 Constants and status enums

| Category           | Required values/behavior                                                                                                                                                                                                                                            |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Evidence statuses  | draft, accepted, superseded, rejected, archived as defined by schema; currentness may be derived from lineage rather than mutating accepted status.                                                                                                                 |
| Value types        | text, number, boolean, date, json, reference, file_reference.                                                                                                                                                                                                       |
| Relationship types | corrects, duplicates, contradicts, contextualizes, derived_from. Day 3 correction uses corrects.                                                                                                                                                                    |
| Question statuses  | draft, active, retired.                                                                                                                                                                                                                                             |
| Answer statuses    | draft, accepted, superseded, rejected.                                                                                                                                                                                                                              |
| Import statuses    | open, validating, importing, completed, completed_with_errors, failed, cancelled.                                                                                                                                                                                   |
| Events             | evidence_submitted, evidence_accepted, evidence_superseded, evidence_rejected, import_batch_created, row_imported, row_quarantined, batch_reconciled.                                                                                                               |
| Error codes        | Use the authoritative central catalog: GV_REQ_SCHEMA, GV_AUTH_REQUIRED, GV_AUTH_FORBIDDEN, GV_NOT_FOUND, GV_IDEMPOTENCY_REQUIRED, GV_IDEMPOTENCY_REUSE_MISMATCH, GV_VERSION_CONFLICT, GV_EVIDENCE_IMMUTABLE, GV_DB_UNAVAILABLE, GV_DB_SCHEMA_OUTDATED, GV_INTERNAL. |

## 7.2 Input validation order

9.  Validate method/path, Content-Type, body limit, JSON object shape, correlation ID, and required Idempotency-Key.

10. Resolve environment and minimum schema before a write.

11. Authenticate caller and authorize route class before trusting entity IDs or source metadata.

12. Validate canonical ID formats and required BMR/session/question/import-batch references.

13. Validate enums, timestamps, fields, exactly-one typed value, bounds, JSON/reference/file-reference shape, and correction/import reason.

14. Load BMR/session/question/batch and enforce same-scope/current-state preconditions.

15. Compute normalized command and request fingerprint only after validation normalization.

16. Run idempotency lookup: exact replay returns prior result; mismatch returns 409 before any new write.

17. Execute domain transaction; map all failures to the canonical JSON envelope and safe error details.

## 7.3 Authentication and authorization matrix

| Action                             | Public journey/session                                                                                        | Authorized operator/service                                           | Authorized import caller                                                          |
|------------------------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| Submit assessment/generic evidence | Allowed only within resolved same-BMR session/self-service scope and approved source types.                   | Allowed within explicit entity scope.                                 | Allowed only through import row command, not public identity injection.           |
| Get scoped evidence/current        | Allowed only for approved customer/session projection; protected fields excluded.                             | Allowed for scoped BMR.                                               | Allowed as needed for reconciliation under scope.                                 |
| Accept/reject/supersede            | Not privileged by body fields; normally forbidden unless an approved self-service correction contract exists. | Allowed with scope, reason/context, and status/version preconditions. | Allowed only when the canonical imported command and policy explicitly permit it. |
| Create/process/close import batch  | Forbidden.                                                                                                    | Only when operator also has import permission.                        | Allowed.                                                                          |
| Read audit/import errors           | Forbidden or protected projection.                                                                            | Allowed by scope and redaction policy.                                | Allowed for the batch under scope.                                                |

## 7.4 Security and privacy requirements

- Actor/source IDs in persisted records come from authenticated context or approved service identity; request body cannot impersonate an operator/importer.

- Errors and logs contain correlation ID, safe code/message, route/action, entity IDs where safe, and bounded field issues—not raw evidence values, imported files, SQL, secrets, or stack traces.

- CORS remains exact-match by environment with Vary: Origin and no privileged wildcard.

- Payload limits reject oversized evidence/import requests before expensive parsing or persistence.

- Customer/session retrieval excludes audit internals, source actor secrets, quarantined payloads, and protected operator metadata.

- QA fixture/import data is clearly synthetic and Production fixture mode remains disabled.

# 8. Phase C — Question Definitions and Assessment Answers

## 8.1 Verify or seed the known-good question definition

18. Query question_definitions for triage.problem_clarity + v1 and record the exact row.

19. If present and exact, do not insert or update it.

20. If absent, add the next approved additive seed migration with INSERT OR IGNORE for the immutable versioned row and a migration-ledger entry using the actual environment handling pattern.

21. If present but materially different, stop. Do not overwrite v1. Resolve whether the existing row is authoritative or create a new approved question_version with updated contract/tests.

22. Apply seed to a clean local database, verify repeat apply, then QA only after local automated gates pass.

> INSERT OR IGNORE INTO question_definitions (  
> question_id, question_version, product, dimension, prompt,  
> response_type, required_flag, minimum_value, maximum_value,  
> weight, score_direction, status, effective_at, created_at  
> ) VALUES (  
> 'triage.problem_clarity','v1','GalviTriage','Problem',  
> 'How clearly defined is the problem your venture solves?',  
> 'number',1,0,100,1.0,'higher_is_better','active',  
> strftime('%Y-%m-%dT%H:%M:%fZ','now'),  
> strftime('%Y-%m-%dT%H:%M:%fZ','now')  
> );

## 8.2 Assessment-answer create/version algorithm

23. Resolve BMR and session. Reject when session.bmr_id differs from request bmr_id or session.venture_id differs from BMR venture_id.

24. Load the exact question_id + question_version and verify allowed status/effective dates and response_type.

25. Validate raw/normalized fields against response_type and question bounds. Preserve both raw and normalized values; do not infer missing normalized values unless the approved deterministic normalization rule exists.

26. Resolve current answer for session_id + question_id. If none, create answer_group_id, answer_id, version_no=1. If semantically identical, return existing/no_change. If materially changed, create version_no+1 with same group and supersedes_answer_id.

27. Create the corresponding evidence version in the same transaction. Use source_type=assessment_answer and source_ref=answer_id or the existing approved equivalent. Copy the canonical typed value used as source evidence.

28. Insert evidence_submitted domain event and audit record containing IDs, versions, source type, actor context, BMR/session, and correlation—not the full sensitive answer.

29. Persist the idempotency receipt only with the committed result. Return answer and evidence identifiers/versions in one canonical response.

## 8.3 Answer repository obligations

- Use parameterized SQL only and central D1 transaction/batch utilities.

- Expose findQuestionDefinition, findCurrentAnswer, nextAnswerVersion, insertAnswerVersion, listAnswerHistory, and answer/evidence trace retrieval through the approved repository module; exact method names may follow current conventions.

- Do not expose a content UPDATE for accepted/current answer rows. Material changes insert a new version.

- Current answer selection must be deterministic and bounded. History orders by answer_group_id/version_no.

- Unique(session_id, question_id, version_no) and unique(answer_group_id, version_no) conflicts map safely; they are not ignored.

# 9. Phase D — Typed Evidence Submission and Retrieval

## 9.1 Generic submitEvidence algorithm

30. Validate the canonical request envelope, Idempotency-Key, bmr_id, optional session_id, source_type/ref, value_type, exactly-one typed value, captured_at, and consent/source context.

31. Resolve actor and same-BMR/session scope. Reject cross-BMR references before generating IDs or statements.

32. Normalize only according to explicit type rules. Compute content_hash from stable canonical typed content.

33. Generate evidence_id and evidence_group_id server-side; set version_no=1 and status=draft.

34. Insert evidence version, evidence_submitted event, audit record, and idempotency receipt atomically.

35. Return 201 created. Exact replay returns 200 with the same IDs/version and meta.idempotent_replay=true; changed key reuse returns 409.

## 9.2 Current and history query contract

| Query                                                               | Required behavior                                                                                                                                     |
|---------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET /api/v1/evidence/{evidence_id}                                  | Return one version plus BMR/session/source/type/status/content hash and lineage references under authorization.                                       |
| GET /api/v1/business-medical-records/{bmr_id}/evidence?view=current | Return one eligible leaf/latest version per evidence_group_id, bounded/paginated, with derived is_current=true. Exclude rejected/archived by default. |
| GET ...?view=history                                                | Return all versions and correction/context relationships, ordered deterministically, with is_current and superseded_by fields derived from lineage.   |
| Filters                                                             | Allow contracted source_type, session_id, status, and cursor/limit filters; never unbounded full-table output.                                        |
| Protected data                                                      | Customer/session projection excludes protected actor/audit/import fields; operator view remains bounded/redacted.                                     |

## 9.3 Repository query pattern for current evidence

> -- Conceptual pattern; adapt to the actual D1 repository conventions.  
> SELECT e.\*  
> FROM evidence_items e  
> WHERE e.bmr_id = ?  
> AND e.status NOT IN ('rejected','archived')  
> AND NOT EXISTS (  
> SELECT 1 FROM evidence_items newer  
> WHERE newer.supersedes_evidence_id = e.evidence_id  
> )  
> ORDER BY e.created_at DESC, e.evidence_id DESC  
> LIMIT ?;

This lineage-derived current selection preserves an accepted predecessor unchanged and is compatible with the approved trigger. If the repository uses MAX(version_no) per group, it must produce the same result and remain bounded/indexed.

## 9.4 Failure behavior

| Failure                               | HTTP/code/result                                                                           |
|---------------------------------------|--------------------------------------------------------------------------------------------|
| Unknown BMR/session/question/evidence | 404 GV_NOT_FOUND when safe; no write.                                                      |
| Cross-BMR/session scope               | 403 GV_AUTH_FORBIDDEN or 409 conflict according to existing route policy; no partial rows. |
| Ambiguous/mismatched typed fields     | 422 GV_REQ_SCHEMA with field issues; no row.                                               |
| Missing idempotency key               | 400 GV_IDEMPOTENCY_REQUIRED; no row.                                                       |
| Same key/different fingerprint        | 409 GV_IDEMPOTENCY_REUSE_MISMATCH; counts unchanged.                                       |
| DB unavailable/stale schema           | 503 GV_DB_UNAVAILABLE or GV_DB_SCHEMA_OUTDATED; no HTML/stack/partial state.               |

# 10. Phase E — Acceptance and Immutable Evidence

## 10.1 Acceptance algorithm

36. Authenticate/authorize the caller and resolve evidence within its BMR scope.

37. Require the expected source evidence ID/version and allowed current status. Accept only draft evidence under Day 3 policy.

38. Capture content_hash and immutable content/provenance values before the status transaction.

39. Update status to accepted without changing value, source, BMR/session, captured_at, created_at, group/version, or hash.

40. Insert evidence_accepted event, audit record, and idempotency receipt atomically.

41. Reload and assert content_hash plus canonical content fields equal the pre-accept values. If not, fail the transaction/test.

42. Return 200 accepted. Exact replay returns accepted/no_change and no duplicate event/audit.

## 10.2 Required immutability layers

| Layer            | Required proof                                                                                                                                |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| API/route        | No PATCH/PUT content mutation route exists for accepted evidence; any unsupported attempt returns safe 4xx.                                   |
| Domain service   | submit/accept/supersede are separate commands; accepted content update is rejected with GV_EVIDENCE_IMMUTABLE.                                |
| Repository       | No method issues UPDATE of accepted content. Supersession is INSERT-only for new version/relationship.                                        |
| D1 trigger       | trg_accepted_evidence_no_content_update (or exact approved equivalent) rejects update and leaves row/hash unchanged.                          |
| Retrieval        | History still returns accepted version 1 after correction; current selection changes through lineage.                                         |
| Evidence package | Before/after row values/hash, failed update response/trigger proof, correlation, and queries are captured without exposing sensitive payload. |

## 10.3 Trigger verification

> SELECT name, sql  
> FROM sqlite_master  
> WHERE type='trigger'  
> AND name='trg_accepted_evidence_no_content_update';

The automated repository test must use a disposable local/test database to attempt the prohibited update and assert the expected failure. The QA verification script may repeat the controlled failure only against the clearly marked synthetic fixture, then prove the row/hash is unchanged. It may not modify or repair real customer evidence.

# 11. Phase F — Supersession, Rejection, Current, and History

## 11.1 Supersession algorithm

43. Authenticate/authorize and load the source evidence version, group, BMR/session, answer trace, status, content hash, and current lineage.

44. Validate correction_reason and corrected typed content/source metadata. Reject same-key fingerprint mismatch and cross-BMR references.

45. If source_type=assessment_answer, create the new assessment-answer version first within the same transaction, preserving the question version unless the correction explicitly references another approved version and the contract allows it.

46. Create evidence version_no+1 with the same evidence_group_id and supersedes_evidence_id=source evidence ID. Generate a new evidence_id; do not reuse IDs.

47. Insert evidence_relationships from the new version to the prior version with relationship_type=corrects and bounded rationale.

48. Do not update the prior accepted row. Derive its non-current state from the incoming supersession link.

49. Insert evidence_superseded event, audit record, and idempotency receipt. Return both version IDs and current/history links.

50. Retrieve current and history in the same test and assert version 2 is current, version 1 is unchanged, and lineage is complete.

## 11.2 Rejection algorithm

- Day 3 rejection is an authorized status decision for draft evidence with a required reason/context.

- Rejecting draft evidence changes status only, emits evidence_rejected and audit, and retains the row/history.

- Accepted evidence is not rejected or edited in place under the stronger immutable-row contract. Correct/supersede it; future governance may add separate confirmation/rejection records without rewriting history.

- Exact replay returns the prior rejection; changed key reuse returns 409; rejected evidence is excluded from current by default.

## 11.3 Required lineage response fields

| Field                           | Meaning                                                                      |
|---------------------------------|------------------------------------------------------------------------------|
| evidence_id / evidence_group_id | Version row identity and stable evidence lineage group.                      |
| version_no                      | Monotonic integer within group.                                              |
| supersedes_evidence_id          | Immediate predecessor, when present.                                         |
| superseded_by_evidence_id       | Derived immediate successor for retrieval, when present.                     |
| relationships\[\]               | Typed correction/context links with IDs, type, rationale, and created_at.    |
| is_current                      | Derived from lineage/status filters; not trusted from request body.          |
| content_hash                    | Safe immutability comparison; do not expose sensitive content unnecessarily. |
| answer_trace                    | answer_id/group/version and question_id/version for assessment evidence.     |

# 12. Phase G — Targeted Import, Quarantine, and Reconciliation

## 12.1 Create import batch

51. Authenticate an approved import caller.

52. Validate source_type, source_name, optional/required source_checksum according to policy, environment=qa, and non-negative expected_count.

53. Generate import_batch_id, set status=open, zero counts, created_by from actor context, timestamps, audit/event, and idempotency receipt.

54. Return batch identity and counts. Exact replay returns the same batch; changed source metadata with the same key returns 409.

## 12.2 Process one import row

55. Load batch and require open/validating/importing state, matching environment/source/checksum policy, and authorized scope.

56. Require source_row_key and compute fingerprint over batch ID, row key, command type, and normalized payload.

57. Use idempotency scope import:\<batch_id\> and key source_row_key. Exact replay returns prior imported/skipped/error result and no count change.

58. Validate row into a canonical command. Do not write raw ambiguous fields into canonical tables.

59. For a valid row, call evidence-service (or the appropriate approved canonical service), capture canonical IDs, and classify imported or skipped/no_change.

60. For an invalid row, append import_errors with field/error/safe message and bounded quarantined payload; do not create a malformed canonical row.

61. Atomically persist the row receipt/result and exactly one count delta for the first processing attempt.

62. Changed reuse of the same source_row_key returns 409 and leaves counts/state unchanged.

## 12.3 Close and reconcile

63. Load the batch and reject close when already failed/cancelled or when concurrent state/version expectations do not match.

64. Calculate processed_count, imported_count, skipped_count, error_count and verify processed = imported + skipped + errors.

65. When expected_count is not null, require processed = expected_count. No row may be silently omitted.

66. Set completed when error_count=0, otherwise completed_with_errors; set completed_at/updated_at.

67. Emit batch_reconciled and audit/idempotency evidence, then return counts and safe error summary.

68. A replay returns the same closed result; a new row against a closed batch fails without count or canonical mutation.

## 12.4 Import reconciliation fixture

| Row                    | Input                                                                                                                                        | Expected result/count delta                                       |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| R1 valid               | New synthetic assessment/evidence command for the known-good BMR/session.                                                                    | Canonical result; processed +1, imported +1.                      |
| R1 replay              | Same source_row_key and identical payload.                                                                                                   | Same result; no count delta and no duplicate canonical row.       |
| R2 duplicate/no-change | New row key that resolves to an already-current semantically identical canonical answer/evidence, when fixture supports this classification. | processed +1, skipped +1; no duplicate version.                   |
| R3 invalid             | Missing/ambiguous typed value or wrong question/BMR reference.                                                                               | import_error; processed +1, error +1; no malformed canonical row. |
| Close                  | expected_count equals first-time processed rows.                                                                                             | completed_with_errors and exact reconciliation equation.          |

# 13. Phase H — REST Routes and Compatibility Actions

## 13.1 Required canonical routes

| Method and route                                       | Caller                                                   | Required behavior                                                                           |
|--------------------------------------------------------|----------------------------------------------------------|---------------------------------------------------------------------------------------------|
| POST /api/v1/evidence                                  | Approved public/session or operator/service scope        | Submit generic evidence or assessment-answer/evidence atomically; Idempotency-Key required. |
| GET /api/v1/evidence/{evidence_id}                     | Authorized scoped caller                                 | Return one version and lineage metadata.                                                    |
| GET /api/v1/business-medical-records/{bmr_id}/evidence | Authorized scoped caller                                 | Bounded current/history list with filters and protected-field policy.                       |
| POST /api/v1/evidence/{evidence_id}/accept             | Authorized operator/service                              | Accept draft without changing content; event/audit; idempotent.                             |
| POST /api/v1/evidence/{evidence_id}/reject             | Authorized operator/service                              | Reject draft with reason; retain record; event/audit; idempotent.                           |
| POST /api/v1/evidence/{evidence_id}/supersede          | Authorized operator/service or approved correction scope | Insert corrected answer/evidence version and corrects lineage; prior immutable.             |
| POST /api/v1/import-batches                            | Authorized import scope                                  | Create batch with source/checksum/expected counts.                                          |
| POST /api/v1/import-batches/{batch_id}/rows            | Authorized import scope                                  | Validate and import/quarantine one row idempotently.                                        |
| POST /api/v1/import-batches/{batch_id}/close           | Authorized import scope                                  | Reconcile counts and close with completed/completed_with_errors.                            |

## 13.2 Standard route behavior

- Every JSON route uses the canonical success/error envelope and response headers: environment, correlation ID, API version, schema version.

- Every contracted write requires Idempotency-Key and actor/route-scoped fingerprinting.

- Every route performs authentication/authorization and BMR/entity scope checks before persistence.

- No route returns HTML, raw exception, SQL, stack trace, token, database ID, full quarantined payload, or unbounded history.

- 201 is used for new resource/version/batch; 200 for read/update/replay/no_change; 400/401/403/404/409/413/415/422/500/503 follow the master catalog.

- Unknown methods/actions fail safely and never fall through to direct SQL or a second business implementation.

## 13.3 Compatibility action router

| Compatibility action                                   | Canonical handler       | Rule                                                                                     |
|--------------------------------------------------------|-------------------------|------------------------------------------------------------------------------------------|
| submit_evidence                                        | POST /api/v1/evidence   | Required mapping for transition clients; same validator/service/repository/envelope.     |
| get_evidence / get_bmr_evidence when already approved  | Canonical GET handler   | Add only if the existing client requires it and the route contract is documented/tested. |
| accept/reject/supersede evidence compatibility actions | Canonical POST handlers | Do not add merely for convenience; operator harness may use REST directly.               |
| import actions                                         | Canonical import routes | No public compatibility action unless explicitly approved; import remains privileged.    |

POST /api compatibility code validates and maps to the canonical handler. It may not implement separate evidence, import, idempotency, or SQL behavior.

# 14. Phase I — Fixtures, Tests, Scripts, Documentation, and Evidence

## 14.1 Fixture catalog

| Fixture        | Purpose                                                                                    | Expected result                                                             |
|----------------|--------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| D3_BASE        | Known-good Day 2 Founder/Venture/BMR/session and active triage.problem_clarity v1.         | No identity delta.                                                          |
| D3_ANSWER_V1   | Assessment answer/evidence number value 42.                                                | Answer v1 + evidence v1 draft + event/audit/receipt.                        |
| D3_REPLAY      | Exact replay of D3_ANSWER_V1.                                                              | Same IDs/version; no canonical/event/audit duplicate.                       |
| D3_ACCEPT      | Authorized acceptance of evidence v1.                                                      | Status accepted; content/hash unchanged; one accept event/audit.            |
| D3_IMMUTABLE   | Attempt accepted content update.                                                           | 409/trigger failure; no row/hash/count change.                              |
| D3_CORRECTION  | Supersede v1 with corrected number value 55 and reason.                                    | Answer/evidence v2; same groups; corrects/supersedes lineage; v1 unchanged. |
| D3_TYPES       | Text, boolean, date, JSON, reference, and file-reference synthetic evidence within limits. | Correct typed field only for each.                                          |
| D3_AMBIGUOUS   | Multiple typed value fields or mismatched value_type.                                      | 422; no row.                                                                |
| D3_CROSS_SCOPE | Session/evidence/BMR IDs from different Ventures.                                          | 403/409; no row or relationship.                                            |
| D3_REJECT      | New draft generic evidence then authorized rejection.                                      | Retained rejected row; excluded from current default.                       |
| D3_KEY_REUSE   | Same idempotency key with changed material body.                                           | 409; no delta.                                                              |
| D3_IMPORT      | Batch with valid, replay/duplicate, and invalid rows.                                      | Canonical result, stable replay, quarantine, reconciled counts.             |
| D3_INVALID     | Missing IDs/source/time, invalid date/JSON/reference, oversized body.                      | Canonical 400/413/422; no sensitive error.                                  |

## 14.2 Required package scripts

> "verify:day3:files": "node scripts/verify-day3-files.mjs",  
> "verify:day3:evidence": "node scripts/verify-day3-evidence.mjs",  
> "test:day3": "node --test tests/day3-evidence-versioning.test.mjs",  
> "test:day3:regression": "npm run test:day1 && npm run test:day2 && npm run test:day3",  
> "smoke:day3:local": "node scripts/day3-smoke.mjs --target local",  
> "smoke:day3:qa": "node scripts/day3-smoke.mjs --target qa"

Merge with the actual package.json and project conventions. No script may be a placeholder that prints success without assertions, hides failed subcommands, or skips mandatory tests.

## 14.3 Documentation obligations

- docs/api/day3-evidence-versioning.md: route/action payloads, headers, canonical envelopes, value/source types, question/answer trace, acceptance/rejection/supersession, current/history, import, status/error/idempotency behavior, and examples.

- docs/operations/day3-human-e2e.md: exact operator/import steps, synthetic values, expected IDs/versions/statuses/counts, correlation capture, screenshots/transcripts, D1 queries, and pass/fail rules.

- docs/repository-inventory.md: update Day 3 file status/ownership, actual paths, migration decision, and any approved deviation.

- release-evidence/day3/README.md: exact candidate identity, environment, evidence inventory, known defects, rollback point, and final decision.

## 14.4 Release-evidence completeness

| Artifact                    | Minimum content                                                                                                                   |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| baseline.json               | Starting/final authority references, environment, schema, known-good identity set, pre-counts, rollback.                          |
| automated-tests.txt/json    | All commands, candidate identity, totals, failed=0, mandatory skipped=0, test IDs and evidence paths.                             |
| database-assertions.sql/txt | Schema objects, question/answer/evidence trace, typed fields, hashes, versions, lineage, orphans, receipts, import counts/errors. |
| evidence-trace.json         | Redacted question -\> answer v1 -\> evidence v1 acceptance -\> answer/evidence v2 -\> current/history IDs and hashes.             |
| import-reconciliation.json  | Batch metadata, row keys/results, canonical IDs, errors, counts equation, final status.                                           |
| human-e2e.md                | Steps H3.1–H3.13, correlations, HTTP, IDs, D1 proof, screenshots/notes, result.                                                   |
| defects.md                  | Expected/actual, severity, environment/candidate/IDs/correlation, root cause/status/acceptance.                                   |
| rollback.md                 | Trigger, authority, Day 2 target, actions, migration/data handling, verification, final state.                                    |
| final-gate.md               | Every gate, evidence path, defects, decision owner/rationale, exact final phrase or STOP/ROLLBACK.                                |

# 15. Automated QA Matrix and Execution Order

## 15.1 Execution order

69. Static file/config/import/syntax/secret scan.

70. Day 1 and Day 2 regression suites.

71. Clean local migration/seed apply and schema object/constraint/trigger assertions.

72. Pure unit tests: enums, timestamps, exactly-one typed value, question/answer normalization, content hashing, fingerprints, current-leaf selection, count equations, auth/scope predicates, error mapping.

73. Repository integration tests against migrated isolated D1.

74. Service transaction/idempotency/version/concurrency tests.

75. REST and compatibility contract tests.

76. Negative security/scope/payload/redaction tests.

77. Import batch/row/reconciliation tests.

78. QA deployment smoke and remote D1 assertions.

79. Human E2E only after every automated/remote BLOCK gate passes.

80. Production baseline regression after Day 3 QA proof.

## 15.2 Day 3 BLOCK matrix

| ID              | Test                             | Pass assertion                                                                                                   | Gate  |
|-----------------|----------------------------------|------------------------------------------------------------------------------------------------------------------|-------|
| D3-A01 / RG-002 | Day 1–2 regression               | All prior BLOCK tests pass; stable IDs/one BMR/session continuity preserved; skipped=0.                          | BLOCK |
| D3-A02          | Schema objects                   | Question/answer/evidence/relationship/import tables, required indexes, FKs, and accepted-evidence trigger exist. | BLOCK |
| D3-A03          | Question definition              | Known-good question/version exact and active/effective; no in-place reference mutation.                          | BLOCK |
| EV-010          | Question/answer trace            | Answer links exact question version, BMR/session, raw/normalized/source/captured_at and evidence version.        | BLOCK |
| EV-001          | Text evidence                    | Typed text row, source, BMR/session, event/audit.                                                                | BLOCK |
| EV-002          | Other evidence types             | Number/boolean/date/json/reference/file_reference populate only correct field and satisfy bounds.                | BLOCK |
| EV-003          | Ambiguous/invalid type           | 422; no answer/evidence/event/audit/idempotency result.                                                          | BLOCK |
| IP-003          | Evidence exact replay            | Same answer/evidence version and no duplicate relationship/event/audit.                                          | BLOCK |
| D3-A09          | Key reuse mismatch               | Same key/different fingerprint returns 409; all counts/hashes unchanged.                                         | BLOCK |
| EV-008          | Wrong BMR/session                | 403/409; no row or partial answer/evidence relationship.                                                         | BLOCK |
| EV-004          | Accept evidence                  | Status accepted; one event/audit; content/hash unchanged.                                                        | BLOCK |
| D3-A12          | Acceptance replay/no-change      | Same accepted result; no duplicate event/audit.                                                                  | BLOCK |
| EV-005 / MG-009 | Accepted evidence update         | API/service and D1 trigger reject; content/hash unchanged.                                                       | BLOCK |
| EV-006          | Supersede evidence               | Answer/evidence v2, same groups, supersedes/corrects lineage, v1 retained unchanged.                             | BLOCK |
| EV-007          | Current vs history               | Current returns v2; history returns v1+v2 and complete lineage.                                                  | BLOCK |
| EV-009          | Reject draft evidence            | Retained rejected row and audit; excluded from current default.                                                  | BLOCK |
| D3-A17          | Unauthorized/privilege injection | 401/403; body actor/import fields do not grant privilege; no mutation.                                           | BLOCK |
| D3-A18          | Payload/redaction/CORS           | Oversized/invalid input fails early; errors/logs contain no raw evidence/SQL/secrets; origins correct.           | BLOCK |
| IM-001          | Create import batch              | Open batch with source/checksum/environment/expected counts and authorized actor.                                | BLOCK |
| IM-002          | Import valid row                 | Canonical service result and imported count; no direct SQL shortcut.                                             | BLOCK |
| IM-003          | Invalid row                      | Quarantined import_error; no malformed canonical row.                                                            | BLOCK |
| IM-004 / IP-007 | Import row replay                | One canonical result; counts stable; changed fingerprint conflicts.                                              | BLOCK |
| IM-005          | Close/reconcile batch            | processed=imported+skipped+errors and expected count; correct final status.                                      | BLOCK |
| D3-A24          | Refresh/new context              | Authoritative current/history returns from Worker+D1, not browser state.                                         | BLOCK |
| D3-A25          | Production protection            | Production deployment/config/data unchanged; fixture/import test behavior unavailable.                           | BLOCK |
| D3-A26          | Evidence package                 | Candidate/deployment/schema/tests/D1/Human/rollback artifacts complete and consistent.                           | BLOCK |

## 15.3 Required D1 assertions

- Known-good question_id + question_version exists exactly once with expected fields.

- Answer v1 and evidence v1 share the correct BMR/session/question/source trace; exact replay does not add rows.

- Each evidence row satisfies the exactly-one typed-field rule.

- Accepted evidence content_hash and immutable content fields match pre-accept values.

- Evidence v2 uses the same group, version_no=2, supersedes v1, has one corrects relationship, and v1 remains unchanged.

- Current query returns v2 while history returns both versions.

- No evidence/answer is orphaned or attached to a session/BMR/Venture mismatch.

- Rejected draft remains present and does not appear in default current results.

- Events, audit, and idempotency receipts match successful material actions only; failed/stale/cross-scope requests have no canonical mutation.

- Import batch counts reconcile; replay does not increment; invalid row exists only in import_errors and no malformed canonical table.

- No Production row/config/deployment delta is attributable to Day 3 QA.

# 16. Local and QA Deployment Runbook

## 16.1 Local build and verification

81. Confirm clean working tree or document approved pre-existing changes and exact starting SHA.

82. Install locked dependencies. Do not perform broad dependency upgrades.

83. Run Day 1–3 file/config/import/secret verification.

84. Apply all repository migrations to a clean local D1. Apply Day 3 additive schema/seed migration only when approved and required; verify repeat apply and ledger.

85. Run Day 1 regression, Day 2 regression, then Day 3 tests in the required order.

86. Run local Day 3 smoke twice to prove exact replay, then run changed-fingerprint, cross-scope, and immutable failures.

87. Execute local SQL assertions and archive redacted output.

88. Review diff for scope, direct SQL, secrets, duplicate modules, Production changes, migration edits, and skipped tests.

89. Commit only reviewed source, tests, docs, migration if any, and evidence templates—not local D1 files, tokens, or raw sensitive fixtures.

## 16.2 QA deployment

90. Confirm Wrangler QA entry and DB binding still point only to the isolated QA Worker/D1. Confirm ENVIRONMENT=qa and approved fixture/test guards.

91. If a migration/seed is required, apply it to QA and capture transcript, ledger, object inventory, and verification output before deploying routes that require it.

92. Run config/dry-run validation as supported.

93. Deploy the reviewed candidate and record commit SHA, deployment ID/version, timestamp UTC, Worker URL, compatibility date, QA DB safe reference, and migration/schema version.

94. Run health, readiness, schema version, Day 1 smoke, Day 2 smoke, then Day 3 smoke.

95. Execute remote D1 assertions including trigger/schema, answer/evidence trace, immutability hash, current/history, import counts, orphans, events/audit, and receipts.

96. Run security/CORS/payload/redaction negatives against QA.

97. Do not begin Human E2E until every automated and remote database gate is green with zero mandatory skips.

## 16.3 QA smoke sequence

> 1\. GET health, readiness, and schema version  
> 2. Resolve the known-good Day 2 Founder/Venture/BMR/session  
> 3. Verify active question definition triage.problem_clarity v1  
> 4. POST assessment-answer evidence v1  
> 5. Repeat exact request and verify same answer/evidence IDs  
> 6. GET evidence current/history; verify v1  
> 7. POST accept; verify content hash unchanged  
> 8. Attempt prohibited accepted update; verify safe failure/no change  
> 9. POST supersede with corrected value; verify v2 + corrects lineage  
> 10. GET current/history; verify current v2 and preserved v1  
> 11. Submit/reject one draft generic evidence item  
> 12. Send cross-BMR/session mismatch; verify no write  
> 13. Create import batch; process valid, replay/duplicate, invalid; close/reconcile  
> 14. Run remote D1 assertions  
> 15. Run Production baseline smoke

# 17. Day 3 Human E2E Procedure

## 17.1 Preconditions

- Reviewed Day 3 candidate commit deployed to the isolated QA Worker.

- QA D1 migration ledger, question seed, evidence schema/indexes/trigger, and Day 2 stable identity set verified.

- Day 1 + Day 2 + Day 3 automated BLOCK suites green with zero mandatory skips.

- Synthetic fixture values, operator credential/test context, and import caller context approved; no real customer data.

- Production baseline smoke recorded before Human E2E.

- Evidence directory open; UTC timestamps, correlation IDs, canonical IDs, request/response, screenshots/notes, and D1 queries ready.

- Known Day 2 rollback commit/deployment available. No participant will repair D1 or manipulate browser state to force a pass.

## 17.2 Human evidence steps

### H3.1 — Verify Day 2 continuity baseline

Through the QA Worker/client, retrieve the known-good session/BMR. Capture founder_id, venture_id, bmr_id, session_id, environment, correlation, and schema. Query D1 and prove the IDs remain the Day 2 canonical set.

### H3.2 — Verify question definition

Retrieve through the approved repository/QA diagnostic or query D1 for triage.problem_clarity v1. Prove the exact version, prompt/type/bounds/status and no duplicate definition.

### H3.3 — Submit assessment answer/evidence version 1

Submit value 42 through the intended QA client or approved harness. Capture answer_id/group/version and evidence_id/group/version, source, content hash, correlation. Query D1 for answer + evidence + event + audit + receipt.

### H3.4 — Exact replay and refresh

Repeat the identical request with the same key, then open a new client context/retrieve through the Worker. Prove the same IDs/version, replay status, and no duplicate answer/evidence/event/audit rows.

### H3.5 — Accept evidence

Use the authorized operator action to accept v1. Capture response/correlation. Query D1 and prove status accepted, one accept event/audit, and unchanged value/source/hash.

### H3.6 — Prove immutability

Use the approved QA test action/script to attempt an in-place content update. Expect GV_EVIDENCE_IMMUTABLE or safely mapped trigger failure. Query D1 and prove v1 is byte-for-byte/hash unchanged and no material audit/event was created.

### H3.7 — Correct by supersession

Use the supersede route with corrected value 55 and a bounded correction reason. Prove answer/evidence version 2, same groups, supersedes v1, one corrects relationship, new event/audit, and unchanged accepted v1.

### H3.8 — Retrieve current and history

Retrieve current evidence and full history. Current returns v2; history returns v1 and v2 with lineage, statuses, hashes, question/answer trace, and deterministic order.

### H3.9 — Typed evidence and rejection

Submit one additional bounded non-assessment evidence item of an approved type, then reject it as an authorized draft decision. Prove correct typed field, retained rejected row, event/audit, and exclusion from default current.

### H3.10 — Cross-scope negative

Use a session or evidence ID from another BMR/Venture. Expect 403/409 canonical error and prove no answer/evidence/relationship/event/audit delta.

### H3.11 — Idempotency misuse negative

Reuse a Day 3 key with a changed material value. Expect 409 GV_IDEMPOTENCY_REUSE_MISMATCH and no row/hash/count change.

### H3.12 — Import reconciliation

Create the synthetic import batch, process the valid row, replay/duplicate row, process invalid row, and close. Prove canonical IDs, no duplicate, quarantine, counts equation, final completed_with_errors status, and no silent omitted row.

### H3.13 — Production regression

Run the approved non-destructive Production baseline smoke. Prove Production deployment/config/data/fixture policy are unchanged and no Day 3 QA records were written there.

## 17.3 Human E2E evidence standard

- Record step ID, actor/tester, UTC timestamp, environment, candidate commit, QA deployment, correlation ID, HTTP status, canonical IDs/versions, safe request/response evidence, D1 query/result, screenshot/notes when relevant, and pass/fail.

- Redact founder emails, full evidence values, source files, tokens, and quarantined payloads. Use safe hashes, IDs, status, counts, and bounded summaries.

- No verbal assurance, green deployment, implementation report, or screenshot without D1 proof substitutes for the step result.

- Any wrong environment/database, accepted-content change, duplicate version, missing lineage, cross-BMR write, unexplained import row, or manual repair is an automatic failure.

## 17.4 Final Day 3 database assertion sheet

> -- Question definition  
> SELECT \* FROM question_definitions  
> WHERE question_id='triage.problem_clarity' AND question_version='v1';  
>   
> -- Answer/evidence trace  
> SELECT a.answer_id,a.answer_group_id,a.version_no,a.supersedes_answer_id,  
> a.bmr_id,a.session_id,a.question_id,a.question_version,a.status,a.captured_at,  
> e.evidence_id,e.evidence_group_id,e.version_no AS evidence_version,  
> e.supersedes_evidence_id,e.source_type,e.source_ref,e.value_type,e.status,e.content_hash  
> FROM assessment_answers a  
> JOIN evidence_items e ON e.source_type='assessment_answer' AND e.source_ref=a.answer_id  
> WHERE a.bmr_id=? AND a.session_id=?  
> ORDER BY a.question_id,a.version_no;  
>   
> -- Correction relationship  
> SELECT \* FROM evidence_relationships  
> WHERE from_evidence_id=? OR to_evidence_id=?  
> ORDER BY created_at;  
>   
> -- Import reconciliation  
> SELECT import_batch_id,status,expected_count,processed_count,imported_count,skipped_count,error_count,completed_at  
> FROM import_batches WHERE import_batch_id=?;  
> SELECT source_row_key,field_name,error_code,safe_message  
> FROM import_errors WHERE import_batch_id=? ORDER BY created_at;  
>   
> -- Material evidence events/audit  
> SELECT event_name,entity_type,entity_id,correlation_id,occurred_at  
> FROM journey_events WHERE bmr_id=? ORDER BY occurred_at;  
> SELECT entity_type,entity_id,operation,correlation_id,occurred_at  
> FROM audit_log WHERE entity_id IN (?,?,?) ORDER BY occurred_at;

| Day 3 Human E2E pass rule                                                                                                                                                                                                                                                                                                                                                                                             |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PASS only when the approved QA workflow proves question/version trace, typed source evidence, stable replay/refresh, authorized acceptance without content change, service + D1 immutability, correction through a new version and lineage, current/history retrieval, safe rejection and cross-scope/idempotency negatives, fully reconciled import, unchanged Production, and complete candidate/rollback evidence. |

# 18. Acceptance Gate, Rollback, and Final Codex Handoff

## 18.1 GO/STOP gate

| Gate                 | GO condition                                                                                 | STOP condition                                                                                        |
|----------------------|----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| Prior-day protection | All Day 1–2 tests/smoke and Production baseline pass.                                        | Any identity/BMR/session regression or Production routing/data/config change.                         |
| Question/answer      | Exact question version and answer source/version/BMR/session trace preserved.                | Question silently changes, answer loses raw/normalized/source/version, or duplicate current versions. |
| Typed evidence       | Exactly one compatible value field; source/consent/time/scope preserved.                     | Ambiguous/coerced/unbounded value or missing source/scope metadata accepted.                          |
| Immutability         | Accepted row/hash unchanged under API/service/trigger attempt.                               | Accepted content/status/history is silently rewritten or trigger weakened.                            |
| Version/history      | Correction creates v2 and corrects/supersedes lineage; v1 retained; current/history correct. | Overwrite, missing predecessor/relationship, wrong current selection, or lost history.                |
| Authorization/scope  | Only approved actors act; cross-BMR and privilege injection fail with no mutation.           | Unauthorized/import/public action succeeds or body grants privilege.                                  |
| Import               | Valid uses canonical service; replay stable; invalid quarantined; counts reconcile.          | Direct SQL, duplicate, silent row omission/coercion, or unexplained counts.                           |
| Evidence package     | Complete automated/D1/Human/deployment/defect/rollback package tied to one candidate.        | Missing, stale, mixed, contradictory, sensitive, or skipped BLOCK evidence.                           |

## 18.2 Rollback strategy

98. Rollback target is the recorded Day 2 final commit and isolated QA Worker deployment/version.

99. Application rollback is preferred: redeploy the approved Day 2 candidate to the QA Worker.

100. Do not run destructive down migrations or delete accepted/versioned evidence. Leave additive objects in place when backward-compatible; otherwise use an approved compensating migration after QA rehearsal.

101. Preserve Day 3 synthetic evidence/import history and failed-attempt evidence unless a documented non-destructive fixture reset/archive procedure is approved. Do not erase history to make QA look clean.

102. After rollback, run health/readiness/schema, Day 1 and Day 2 automated/smoke, remote identity/BMR/session assertions, and Production baseline regression.

103. Record trigger, decision authority, commands/actions, deployment IDs, migration/data impact, verification results, defects, and final state in release-evidence/day3/rollback.md.

## 18.3 Final Codex handoff requirements

- Exact repository, branch, starting SHA, Day 2 final SHA, final candidate SHA, and changed-file inventory.

- Explicit preserve statement for Production entry/configuration, applied migrations, and Day 1–2 routes/invariants.

- Migration decision: none required or exact additive migration/seed ID, checksum, clean/local/QA apply and verification result.

- All commands actually run with exit/result summary and tool versions.

- Automated BLOCK matrix result, total/pass/fail/skipped, mandatory skipped=0, and evidence paths.

- QA Worker deployment/version, Worker URL, QA D1 safe reference, environment/schema/fixture policy.

- Redacted known-good identity set plus question/answer/evidence v1/v2 IDs, versions, hashes, lineage, and D1 assertion summary.

- Import batch ID, row results, counts equation, final status, and quarantine summary.

- Human E2E H3.1–H3.13 results and evidence paths.

- Known defects with severity, owner, exact gate impact, and explicit acceptance status.

- Rollback point and rollback verification/result.

- Final decision: GO, STOP, or ROLLED BACK.

- Use DAY 3 HUMAN E2E PASS → DAY 3 BUILD FINAL only when every BLOCK condition is green and evidence is complete.

# Appendix A — Day 3 API Contract

## A.1 Canonical success envelope

> {  
> "success": true,  
> "status": "ok \| created \| resumed \| updated \| no_change \| accepted",  
> "environment": "qa",  
> "correlation_id": "corr\_...",  
> "data": {},  
> "meta": {  
> "api_version": "v1",  
> "schema_version": "\<actual\>",  
> "record_version": null,  
> "idempotent_replay": false  
> }  
> }

## A.2 Canonical error envelope

> {  
> "success": false,  
> "status": "invalid_request \| unauthorized \| forbidden \| not_found \| conflict \| unavailable \| internal_error",  
> "environment": "qa",  
> "correlation_id": "corr\_...",  
> "error": {  
> "code": "GV_EVIDENCE_IMMUTABLE",  
> "message": "Accepted evidence cannot be updated in place.",  
> "retryable": false,  
> "details": {"fields": \[\]}  
> },  
> "meta": {"api_version": "v1", "schema_version": "\<actual\>"}  
> }

## A.3 Submit assessment answer and evidence

> POST /api/v1/evidence  
> Idempotency-Key: d3-answer-001  
> Content-Type: application/json  
>   
> {  
> "bmr_id": "bmr\_...",  
> "session_id": "ses\_...",  
> "source_type": "assessment_answer",  
> "source_ref": "triage.problem_clarity",  
> "value_type": "number",  
> "value_number": 42,  
> "captured_at": "2026-08-06T18:00:00.000Z",  
> "consent_status": "approved",  
> "assessment_answer": {  
> "question_id": "triage.problem_clarity",  
> "question_version": "v1",  
> "raw_value_number": 42,  
> "normalized_value_number": 42,  
> "confidence_effect": 0  
> }  
> }  
>   
> 201 data  
> {  
> "answer_id": "ans\_...",  
> "answer_group_id": "ang\_...",  
> "answer_version_no": 1,  
> "evidence_id": "evd\_...",  
> "evidence_group_id": "evg\_...",  
> "version_no": 1,  
> "status": "draft",  
> "bmr_id": "bmr\_...",  
> "session_id": "ses\_...",  
> "content_hash": "..."  
> }

Identifier prefixes for answer rows/groups must follow the actual approved identifier conventions. If the repository has no ans\_/ang\_ convention, Codex must centralize and document the chosen opaque prefixes; clients may not derive meaning beyond the documented type.

## A.4 Accept evidence

> POST /api/v1/evidence/evd\_.../accept  
> Idempotency-Key: d3-accept-001  
>   
> {  
> "expected_status": "draft",  
> "expected_version_no": 1,  
> "confirmation_context": {"reason_code": "SOURCE_CONFIRMED"}  
> }  
>   
> 200 data  
> {  
> "evidence_id": "evd\_...",  
> "evidence_group_id": "evg\_...",  
> "version_no": 1,  
> "status": "accepted",  
> "content_hash": "\<same-as-before\>",  
> "domain_event_id": "evt\_...",  
> "audit_id": "aud\_..."  
> }

## A.5 Supersede accepted evidence

> POST /api/v1/evidence/evd_v1/supersede  
> Idempotency-Key: d3-supersede-001  
>   
> {  
> "expected_version_no": 1,  
> "correction_reason": "Founder corrected the assessment response.",  
> "value_type": "number",  
> "value_number": 55,  
> "captured_at": "2026-08-06T18:15:00.000Z",  
> "assessment_answer": {  
> "question_id": "triage.problem_clarity",  
> "question_version": "v1",  
> "raw_value_number": 55,  
> "normalized_value_number": 55  
> }  
> }  
>   
> 201 data  
> {  
> "evidence_id": "evd_v2",  
> "evidence_group_id": "evg_same",  
> "version_no": 2,  
> "supersedes_evidence_id": "evd_v1",  
> "status": "draft",  
> "is_current": true,  
> "relationship": {"type":"corrects","to_evidence_id":"evd_v1"}  
> }

## A.6 Get current and history

> GET /api/v1/business-medical-records/bmr\_.../evidence?view=current&session_id=ses\_...  
> GET /api/v1/business-medical-records/bmr\_.../evidence?view=history&source_type=assessment_answer

## A.7 Create/process/close import batch

> POST /api/v1/import-batches  
> Idempotency-Key: d3-import-batch-001  
> {  
> "source_type": "version_controlled_fixture",  
> "source_name": "day3-import-v1",  
> "source_checksum": "sha256:...",  
> "expected_count": 3  
> }  
>   
> POST /api/v1/import-batches/imp\_.../rows  
> Idempotency-Key: d3-import-row-R1  
> {  
> "source_row_key": "R1",  
> "command_type": "submit_evidence",  
> "payload": {"bmr_id":"bmr\_...","session_id":"ses\_...","source_type":"imported_reference","source_ref":"R1","value_type":"text","value_text":"Synthetic import evidence","captured_at":"..."}  
> }  
>   
> POST /api/v1/import-batches/imp\_.../close  
> Idempotency-Key: d3-import-close-001  
> { "expected_processed_count": 3 }

## A.8 Day 3 error/status catalog

| HTTP | Code                                          | Use                                                               |
|------|-----------------------------------------------|-------------------------------------------------------------------|
| 400  | GV_REQ_BODY_INVALID / GV_IDEMPOTENCY_REQUIRED | Malformed body or missing required key.                           |
| 401  | GV_AUTH_REQUIRED                              | Required authentication/import/operator context absent/invalid.   |
| 403  | GV_AUTH_FORBIDDEN                             | Caller lacks route/entity/BMR/import scope or injects privilege.  |
| 404  | GV_NOT_FOUND                                  | Authorized target question/BMR/session/evidence/batch absent.     |
| 409  | GV_IDEMPOTENCY_REUSE_MISMATCH                 | Same key/source row reused with changed fingerprint.              |
| 409  | GV_VERSION_CONFLICT                           | Expected status/version/batch state does not match.               |
| 409  | GV_EVIDENCE_IMMUTABLE                         | Accepted evidence content update attempted.                       |
| 413  | GV_REQ_PAYLOAD_TOO_LARGE                      | Evidence/import request exceeds route limit.                      |
| 415  | GV_REQ_CONTENT_TYPE                           | Expected application/json.                                        |
| 422  | GV_REQ_SCHEMA                                 | Type/source/question/value/count/reason/domain validation failed. |
| 500  | GV_INTERNAL                                   | Safe bounded internal failure with correlation; no SQL/stack.     |
| 503  | GV_DB_UNAVAILABLE / GV_DB_SCHEMA_OUTDATED     | D1 or required schema unavailable.                                |

# Appendix B — Evidence and Import SQL Verification Queries

## B.1 Schema objects and trigger

> SELECT name,type,sql  
> FROM sqlite_master  
> WHERE name IN (  
> 'question_definitions','assessment_answers','evidence_items','evidence_relationships',  
> 'import_batches','import_errors','idx_answers_session_question',  
> 'idx_evidence_bmr_current','idx_evidence_session',  
> 'trg_accepted_evidence_no_content_update'  
> )  
> ORDER BY type,name;

## B.2 Duplicate/version/orphan checks

> -- Duplicate question version  
> SELECT question_id,question_version,COUNT(\*) c  
> FROM question_definitions GROUP BY question_id,question_version HAVING c\<\>1;  
>   
> -- Duplicate answer/evidence versions  
> SELECT answer_group_id,version_no,COUNT(\*) c  
> FROM assessment_answers GROUP BY answer_group_id,version_no HAVING c\>1;  
> SELECT evidence_group_id,version_no,COUNT(\*) c  
> FROM evidence_items GROUP BY evidence_group_id,version_no HAVING c\>1;  
>   
> -- Orphan/mismatched answer scope  
> SELECT a.answer_id  
> FROM assessment_answers a  
> LEFT JOIN business_medical_records b ON b.bmr_id=a.bmr_id  
> LEFT JOIN assessment_sessions s ON s.session_id=a.session_id  
> WHERE b.bmr_id IS NULL OR s.session_id IS NULL OR s.bmr_id\<\>a.bmr_id OR s.venture_id\<\>b.venture_id;  
>   
> -- Orphan/mismatched evidence scope  
> SELECT e.evidence_id  
> FROM evidence_items e  
> LEFT JOIN business_medical_records b ON b.bmr_id=e.bmr_id  
> LEFT JOIN assessment_sessions s ON s.session_id=e.session_id  
> WHERE b.bmr_id IS NULL OR (e.session_id IS NOT NULL AND (s.session_id IS NULL OR s.bmr_id\<\>e.bmr_id OR s.venture_id\<\>b.venture_id));

## B.3 Exactly-one typed-field assertion

> SELECT evidence_id,value_type  
> FROM evidence_items  
> WHERE (CASE WHEN value_text IS NOT NULL THEN 1 ELSE 0 END  
> + CASE WHEN value_number IS NOT NULL THEN 1 ELSE 0 END  
> + CASE WHEN value_boolean IS NOT NULL THEN 1 ELSE 0 END  
> + CASE WHEN value_date IS NOT NULL THEN 1 ELSE 0 END  
> + CASE WHEN value_json IS NOT NULL THEN 1 ELSE 0 END) \<\> 1  
> OR (value_type IN ('text','reference','file_reference') AND value_text IS NULL)  
> OR (value_type='number' AND value_number IS NULL)  
> OR (value_type='boolean' AND value_boolean IS NULL)  
> OR (value_type='date' AND value_date IS NULL)  
> OR (value_type='json' AND value_json IS NULL);

## B.4 Current/history and correction lineage

> -- Current leaf versions for one BMR  
> SELECT e.evidence_id,e.evidence_group_id,e.version_no,e.status,e.content_hash  
> FROM evidence_items e  
> WHERE e.bmr_id=?  
> AND e.status NOT IN ('rejected','archived')  
> AND NOT EXISTS (SELECT 1 FROM evidence_items n WHERE n.supersedes_evidence_id=e.evidence_id)  
> ORDER BY e.created_at,e.evidence_id;  
>   
> -- Full group history and relationships  
> SELECT evidence_id,evidence_group_id,version_no,supersedes_evidence_id,status,content_hash,captured_at,created_at  
> FROM evidence_items WHERE evidence_group_id=? ORDER BY version_no;  
> SELECT relationship_id,from_evidence_id,to_evidence_id,relationship_type,rationale,created_at  
> FROM evidence_relationships  
> WHERE from_evidence_id IN (SELECT evidence_id FROM evidence_items WHERE evidence_group_id=?)  
> OR to_evidence_id IN (SELECT evidence_id FROM evidence_items WHERE evidence_group_id=?)  
> ORDER BY created_at;

## B.5 Assessment-answer to evidence trace

> SELECT q.question_id,q.question_version,q.product,q.dimension,q.response_type,q.status AS question_status,  
> a.answer_id,a.answer_group_id,a.version_no,a.supersedes_answer_id,a.raw_value_text,a.raw_value_number,  
> a.normalized_value_text,a.normalized_value_number,a.source,a.status AS answer_status,a.captured_at,  
> e.evidence_id,e.evidence_group_id,e.version_no AS evidence_version,e.supersedes_evidence_id,  
> e.source_type,e.source_ref,e.value_type,e.status AS evidence_status,e.content_hash  
> FROM assessment_answers a  
> JOIN question_definitions q ON q.question_id=a.question_id AND q.question_version=a.question_version  
> LEFT JOIN evidence_items e ON e.source_type='assessment_answer' AND e.source_ref=a.answer_id  
> WHERE a.bmr_id=? AND a.session_id=?  
> ORDER BY a.question_id,a.version_no;

## B.6 Idempotency, events, audit, and import reconciliation

> SELECT scope,idempotency_key,request_fingerprint,response_entity_type,response_entity_id,created_at  
> FROM idempotency_keys WHERE scope LIKE '%evidence%' OR scope LIKE 'import:%' ORDER BY created_at;  
>   
> SELECT event_name,entity_type,entity_id,correlation_id,occurred_at  
> FROM journey_events WHERE bmr_id=? ORDER BY occurred_at;  
>   
> SELECT entity_type,entity_id,operation,correlation_id,occurred_at  
> FROM audit_log WHERE entity_id IN (?,?,?) ORDER BY occurred_at;  
>   
> SELECT import_batch_id,status,expected_count,processed_count,imported_count,skipped_count,error_count,  
> (imported_count+skipped_count+error_count) AS explained_count,completed_at  
> FROM import_batches WHERE import_batch_id=?;  
>   
> SELECT import_error_id,source_row_key,field_name,error_code,safe_message,created_at  
> FROM import_errors WHERE import_batch_id=? ORDER BY created_at;

# Appendix C — Fixture Catalog and Expected Row Deltas

| Run               | Answer              | Evidence                  | Relationship        | Event/audit                       | Import/count delta                      |
|-------------------|---------------------|---------------------------|---------------------|-----------------------------------|-----------------------------------------|
| BASE              | —                   | —                         | —                   | —                                 | No identity/BMR/session delta.          |
| ANSWER V1         | A1 v1               | E1 v1 draft               | —                   | \+ submitted event/audit/receipt  | —                                       |
| REPLAY            | A1 v1               | E1 v1                     | —                   | No duplicate material event/audit | —                                       |
| ACCEPT            | A1 v1               | E1 v1 accepted            | —                   | \+ accept event/audit             | —                                       |
| IMMUTABLE ATTEMPT | Unchanged           | E1 unchanged/hash same    | —                   | No material mutation              | —                                       |
| CORRECTION        | A1 v2               | E1 v2 draft               | \+ corrects E2→E1   | \+ supersede event/audit          | —                                       |
| CURRENT/HISTORY   | A1 v2 current       | E2 current; E1 historical | Existing            | No delta                          | —                                       |
| REJECT DRAFT      | —                   | E3 rejected retained      | —                   | \+ reject event/audit             | —                                       |
| CROSS SCOPE       | —                   | —                         | —                   | No material delta                 | —                                       |
| KEY REUSE         | —                   | —                         | —                   | No delta                          | —                                       |
| IMPORT VALID      | As command requires | Canonical result          | As command requires | Import/canonical evidence         | processed+1 imported+1                  |
| IMPORT REPLAY     | Same                | Same                      | Same                | No duplicate                      | No count delta                          |
| IMPORT INVALID    | —                   | No malformed row          | —                   | Quarantine evidence               | processed+1 error+1                     |
| IMPORT CLOSE      | —                   | —                         | —                   | batch reconciled                  | completed(\_with_errors); equation true |

# Appendix D — Release-Evidence Templates

## D.1 deployment-metadata.json

> {  
> "day": 3,  
> "repository": "mrgalvipro/galvitriage",  
> "branch": "qa-revamped-galvicare-0-5",  
> "starting_commit": "\<sha\>",  
> "candidate_commit": "\<sha\>",  
> "day2_final_commit": "\<sha\>",  
> "qa_worker": "\<safe-name\>",  
> "qa_deployment": "\<id/version\>",  
> "qa_d1": "\<safe-reference\>",  
> "schema_version": "\<actual\>",  
> "migration": "none \| \<id/checksum\>",  
> "deployed_at": "\<utc\>",  
> "human_e2e": "pass \| fail",  
> "final_decision": "go \| stop \| rolled_back"  
> }

## D.2 evidence-trace.json

> {  
> "bmr_id": "bmr\_\<redacted\>",  
> "session_id": "ses\_\<redacted\>",  
> "question": {"question_id":"triage.problem_clarity","question_version":"v1"},  
> "version_1": {  
> "answer_id":"\<id\>", "answer_group_id":"\<id\>", "answer_version":1,  
> "evidence_id":"\<id\>", "evidence_group_id":"\<id\>", "evidence_version":1,  
> "status":"accepted", "content_hash":"\<hash\>"  
> },  
> "immutable_attempt": {"http":409,"code":"GV_EVIDENCE_IMMUTABLE","unchanged":true},  
> "version_2": {  
> "answer_id":"\<id\>", "answer_version":2,  
> "evidence_id":"\<id\>", "evidence_version":2,  
> "supersedes_evidence_id":"\<v1\>", "relationship":"corrects", "is_current":true  
> },  
> "history_verified": true  
> }

## D.3 import-reconciliation.json

> {  
> "import_batch_id": "imp\_...",  
> "source_name": "day3-import-v1",  
> "source_checksum": "sha256:...",  
> "expected_count": 3,  
> "rows": \[  
> {"source_row_key":"R1","result":"imported","canonical_ids":\["evd\_..."\]},  
> {"source_row_key":"R2","result":"skipped","canonical_ids":\["evd\_..."\]},  
> {"source_row_key":"R3","result":"error","error_code":"GV_REQ_SCHEMA"}  
> \],  
> "counts": {"processed":3,"imported":1,"skipped":1,"errors":1},  
> "reconciled": true,  
> "status": "completed_with_errors"  
> }

## D.4 human-e2e.md

> \# Day 3 Human E2E  
> - Candidate commit:  
> - QA deployment:  
> - QA D1 safe reference:  
> - Schema/migration:  
> - Operator/import tester:  
> - Start/end UTC:  
>   
> \| Step \| Correlation ID \| HTTP \| Canonical IDs/versions \| D1 proof \| Result \|  
> \|---\|---\|---:\|---\|---\|---\|  
> \| H3.1 \| \| \| \| \| \|  
> ...  
>   
> \## Evidence trace  
> \## Import reconciliation  
> \## Defects  
> \## Production regression  
> \## Final gate decision

## D.5 rollback.md

> \# Day 3 Rollback Record  
> - Trigger:  
> - Decision authority:  
> - Day 2 rollback commit/deployment:  
> - Commands/actions:  
> - Migration/data impact:  
> - Evidence/version history preserved:  
> - Day 1–2 verification:  
> - Production regression:  
> - Final state:  
> - Evidence paths:

# Appendix E — Codex Final Implementation Report Template

> \# GalviVault Day 3 Final Implementation Report  
>   
> \## 1. Candidate identity  
> - Repository / branch:  
> - Starting SHA:  
> - Day 2 final SHA:  
> - Final SHA:  
> - Changed files:  
> - Preserved Production and Day 1–2 files:  
>   
> \## 2. Starting baseline  
> - QA Worker/deployment:  
> - QA D1 safe reference:  
> - Schema/ledger:  
> - Known-good identity set:  
> - Pre-Day 3 counts:  
> - Production baseline:  
>   
> \## 3. Migration decision  
> - None required, or migration/seed ID/checksum:  
> - Clean local apply/repeat:  
> - QA apply/verification:  
> - Trigger/index/schema proof:  
>   
> \## 4. Implementation  
> - Question definitions and assessment answers:  
> - Typed evidence/source/scope:  
> - Acceptance and immutability:  
> - Supersession/rejection/current/history:  
> - Import/quarantine/reconciliation:  
> - Routes/compatibility/security/idempotency:  
>   
> \## 5. Commands and automated QA  
> - Commands actually run:  
> - Tests total/passed/failed/skipped:  
> - BLOCK matrix:  
> - Day 1–2 regression:  
> - Production protection:  
>   
> \## 6. QA deployment and D1 proof  
> - Deployment/version/UTC/URL:  
> - Question/answer/evidence trace IDs and hashes:  
> - Current/history/lineage assertions:  
> - Import reconciliation:  
> - Orphan/duplicate/cross-scope assertions:  
>   
> \## 7. Human E2E  
> - H3.1–H3.13 results:  
> - Evidence paths:  
> - Tester and decision owner:  
>   
> \## 8. Defects and risks  
> - ID / severity / expected / actual / root cause / status / gate impact / acceptance:  
>   
> \## 9. Rollback  
> - Day 2 commit/deployment:  
> - Migration compatibility:  
> - Verification result:  
>   
> \## 10. Final decision  
> - GO \| STOP \| ROLLED BACK  
> - Rationale:  
> - Final status phrase only if earned:  
> DAY 3 HUMAN E2E PASS → DAY 3 BUILD FINAL
