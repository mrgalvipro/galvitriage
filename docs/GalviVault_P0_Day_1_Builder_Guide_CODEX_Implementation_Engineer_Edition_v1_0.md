# GalviVault™ P0 Day 1 Builder Guide

## Codex Implementation Engineer Edition

*Preserve • Replatform • Prove the Worker + D1 Foundation*

> **Authoritative derivative**
>
> This Day 1 Builder Guide is derived from the GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5. It converts the governing architecture, repository, Worker, API, D1, QA, Human E2E, rollback, and evidence contracts into one executable Day 1 instruction set for Codex.

**Repository:** `mrgalvipro/galvitriage`  
**Implementation branch:** `qa-revamped-galvicare-0-5`  
**Production branch:** `main`  
**Version:** 1.0 — August 2026

# Document Control and Builder Authority

| **Item**                   | **Binding value**                                                                                                        |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------|
| Document                   | GalviVault™ P0 Day 1 Builder Guide — Codex Implementation Engineer Edition                                               |
| Source authority           | GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5                           |
| Repository                 | mrgalvipro/galvitriage                                                                                                   |
| Implementation branch      | qa-revamped-galvicare-0-5                                                                                                |
| Production branch          | main                                                                                                                     |
| Day 1 objective            | Create and prove an isolated QA Cloudflare Worker + D1 foundation without changing the current Production customer path. |
| Canonical QA entry         | worker/day1.js                                                                                                           |
| Canonical D1 binding       | DB, pointing only to the QA D1 database for the Day 1 deployment                                                         |
| Primary migration          | migrations/day1/0001_canonical_business_medical_record.sql                                                               |
| Primary automated contract | tests/day1-foundation.test.mjs                                                                                           |
| Final status language      | DAY 1 HUMAN E2E PASS → DAY 1 BUILD FINAL only when every blocking gate and required evidence artifact passes.            |

> **No-assumption rule for Codex**
>
> Repository files, deployed configuration, D1 identifiers, current Production behavior, and command output are authoritative. Codex must inspect the actual QA branch and platform configuration before editing. It must not reconstruct current file contents from chat history, implementation reports, screenshots, or memory. When a required file cannot be retrieved, record the exact retrieval/tool error and stop that dependent step rather than fabricating content.

## How Codex must use this guide

> 1\. Read Sections 1–4 before modifying any repository file. These sections define the Day 1 outcome, scope, environment, and no-break rules.
>
> 2\. Retrieve and inspect the current QA-branch versions of every critical file identified in Section 4. Record current contents and the starting commit.
>
> 3\. Execute the build in the order defined in Sections 5–13. Do not begin QA deployment until local migration and automated tests pass.
>
> 4\. Create complete replacement content for small critical files when partial patching could leave ambiguous or invalid configuration.
>
> 5\. Run the full Day 1 automated matrix and the Human E2E exactly as defined. API success without D1 proof is not a pass.
>
> 6\. Generate the release-evidence package and rollback record before declaring Day 1 complete.
>
> 7\. Return a final implementation report that identifies the exact files changed, commit, commands, results, deployment, D1 assertions, Human E2E evidence, remaining defects, and final gate decision.

## Contents

- 1\. Day 1 Executive Outcome and Definition of Done

- 2\. Locked Architecture, Scope, and Do-Not-Break Rules

- 3\. Starting-State Inspection and Source Acquisition

- 4\. Day 1 Repository Target and File Inventory

- 5\. Day 1 Build Sequence and Time-Boxed Working Plan

- 6\. Phase A — Freeze Baseline and Establish Evidence

- 7\. Phase B — Package, Configuration, and Environment Contracts

- 8\. Phase C — D1 Baseline Migration

- 9\. Phase D — Worker Foundation Modules and Entry Point

- 10\. Phase E — REST/Compatibility Foundation Routes

- 11\. Phase F — Fixtures, Tests, Scripts, Documentation, and Evidence Files

- 12\. Automated QA Matrix and Execution Order

- 13\. Local, QA Deployment, and Smoke-Test Runbook

- 14\. Day 1 Human E2E Procedure

- 15\. Acceptance Gate, Rollback, and Final Codex Handoff

- Appendix A — Full Baseline SQL Migration

- Appendix B — D1 Verification Queries

- Appendix C — Canonical API Examples and Error Contract

- Appendix D — Release-Evidence Templates

# 1. Day 1 Executive Outcome and Definition of Done

Day 1 establishes the safe execution and persistence foundation on which every later GalviVault capability depends. It does not build the full customer journey, scoring, clinical reasoning, treatment workflow, operator portal, or Production cutover. It proves that the repository, isolated QA Worker, Cloudflare D1 schema, deterministic foundation actions, tests, evidence, and rollback discipline are real and executable.

> **Day 1 outcome**
>
> A clean QA D1 database can be created from the committed migration; an isolated QA Worker whose main entry is worker/day1.js can report health and readiness, return schema version, create or resume one session without duplication, append one idempotent journey event, return a deterministic QA fixture, and preserve the existing Production flow unchanged.

## 1.1 Required outputs

- A complete repository and environment inventory for mrgalvipro/galvitriage on qa-revamped-galvicare-0-5.

- The five canonical critical-path files exist at exact paths: package.json; wrangler.json; worker/day1.js; migrations/day1/0001_canonical_business_medical_record.sql; tests/day1-foundation.test.mjs.

- All required Day 1 support modules, test helpers, fixtures, scripts, documentation, and release-evidence paths defined in Section 4 exist.

- A clean local/test D1 database and the QA D1 database are created from repository migrations, including schema_migrations, the P0 table inventory, indexes, constraints, and append-only protections.

- The QA Worker is isolated from Production; its DB binding points only to the QA D1 database; ENVIRONMENT=qa; FIXTURE_MODE=true only where approved.

- Foundation actions/routes are operational: health, readiness, schema version, create/resume session, get session, journey event, and QA fixture result.

- Automated evidence proves configuration safety, migration integrity, deterministic envelopes, CORS, failure behavior, session idempotency, event idempotency, fixture determinism, and Production protection.

- Human E2E proves the QA foundation through the intended client/test path without direct D1 repair.

- The release-evidence package and known rollback point are complete.

## 1.2 Day 1 Definition of Done

| **Dimension**  | **Pass condition**                                                                                                                                                                              |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Repository     | The reviewed QA commit contains the exact required paths, no duplicate entry/migration/test path, and no secret/local artifacts.                                                                |
| Environment    | QA and Production Worker/D1 resources are objectively distinct; worker/day1.js is QA-only; Production entry and public path remain unchanged.                                                   |
| Migration      | 0001 applies to a clean database, produces the full contracted schema, records the migration ledger, and passes integrity verification.                                                         |
| Worker         | All foundation routes return canonical JSON envelopes, environment/correlation headers, safe errors, and deterministic behavior.                                                                |
| Persistence    | Session and journey-event writes commit to QA D1; duplicate/replay scenarios do not create unintended duplicate canonical rows.                                                                 |
| Failure safety | Missing binding/schema, invalid payload, disallowed origin, unsupported route/action, and Production fixture access fail safely without raw SQL, stack trace, blank response, or partial write. |
| Automated QA   | All Day 1 BLOCK tests execute and pass; mandatory skipped count is zero.                                                                                                                        |
| Human E2E      | H1.1–H1.7 pass with API, D1, and Production-regression proof.                                                                                                                                   |
| Evidence       | The Day 1 evidence package identifies commit, branch, Worker deployment, QA D1, schema, commands, results, Human E2E, defects, and rollback.                                                    |
| Final decision | Only then may Codex state: DAY 1 HUMAN E2E PASS → DAY 1 BUILD FINAL.                                                                                                                            |

## 1.3 Explicit non-goals

- Do not build general Founder/Venture/BMR customer creation routes; those are Day 2 capabilities.

- Do not implement GalviScore, GalviShot, GalviSight, GalviPath, payment/paywall, clinician workspace, or complex reporting logic.

- Do not add Make, OpenAI, Airtable writes, a second database, GraphQL, a new repository, or a new implementation branch.

- Do not redesign the existing Production Worker or public GalviCare flow.

- Do not perform broad historical migration.

- Do not declare Production readiness or promote to main during Day 1.

# 2. Locked Architecture, Scope, and Do-Not-Break Rules

## 2.1 Locked execution path

``` text
Approved QA client or test harness
-> Cloudflare Worker QA deployment
-> worker/day1.js
-> shared request/CORS/environment/error/response utilities
-> Day 1 route handler
-> Day 1 service
-> parameterized D1 repository
-> QA D1 binding: DB
-> domain event/audit/idempotency receipt where contracted
-> canonical JSON response
-> non-blocking evidence capture
No browser, fixture, adapter, script, or external platform may write
directly to canonical D1 state outside the approved migration/test setup
and Worker repositories.
```

## 2.2 Binding architecture decisions for Day 1

| **Decision**                                          | **Day 1 consequence**                                                                                                                                  |
|-------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| D1 is the sole writable P0 system of record.          | All canonical Day 1 session/event state is written through DB; Airtable, files, browser state, HubSpot, and analytics are not persistence authorities. |
| One Cloudflare Worker is the runtime write authority. | worker/day1.js is the isolated QA entry. No parallel action implementation or direct D1 client path.                                                   |
| Identifiers are generated/governed server-side.       | Opaque IDs and correlation IDs come from shared utilities; client keys are separately validated.                                                       |
| Writes are idempotent by declared business key.       | Session create/resume and journey-event replay have explicit uniqueness and request-fingerprint behavior.                                              |
| Migrations are additive and forward-only.             | The baseline migration creates the schema; no destructive down migration or Production data manipulation.                                              |
| QA and Production are isolated.                       | Different Worker deployments, D1 resources, variables, fixture policies, origins, evidence, and decisions.                                             |
| Canonical JSON envelope is mandatory.                 | No HTML error pages, blank bodies, raw exceptions, or route-specific response formats.                                                                 |
| Audit/evidence is part of the product.                | Material writes and the release itself must produce inspectable evidence.                                                                              |
| Repository paths are contractual.                     | worker/day1.js, migration, test, and evidence paths must exist exactly as defined.                                                                     |
| Tests define behavior.                                | Implementation reports and screenshots do not replace automated, D1, and Human E2E proof.                                                              |

## 2.3 Do-not-break rules

- Do not overwrite, rename, repurpose, or point Production to worker/day1.js.

- Do not delete or destructively alter existing D1 tables or Production data.

- Do not remove or modify existing Stripe, HubSpot, GA4, Clarity, Calendly, Pages routing, or Production Worker behavior merely to prove Day 1.

- Do not expose secrets, database IDs, authorization values, raw SQL errors, stack traces, or sensitive payloads in source, responses, logs, screenshots, or evidence.

- Do not add a wildcard Production CORS policy.

- Do not add a generic JSON blob as a substitute for the typed P0 schema.

- Do not mark tests skipped, weaken expectations, or catch-and-ignore failures to make the build appear green.

- Do not use direct D1 edits or browser local-state manipulation during Human E2E to force a pass.

- Do not create another branch to work around connector, merge, test, or deployment problems without Product Owner approval.

- At closeout, QA must be stable and evidenced or reverted to the prior working commit/deployment.

## 2.4 Stop conditions

| **Stop condition**                                                   | **Required response**                                                                                                      |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| Current repository content cannot be retrieved.                      | Record the exact GitHub connector/tool error. Do not fabricate or replace unseen files from memory.                        |
| QA and Production D1/Worker targets cannot be distinguished.         | Stop configuration/deployment work until the actual resources are identified.                                              |
| Baseline Production smoke fails before Day 1 changes.                | Record the pre-existing failure and obtain a Product Owner decision; do not attribute it to Day 1 or overwrite Production. |
| Migration fails on a clean database.                                 | Stop. Preserve transcript. Correct the migration in QA/local and restart the clean-apply gate.                             |
| Required automated BLOCK test fails or is skipped.                   | Stop Day 1 acceptance. Fix, rerun affected and regression tests, or formally remove scope.                                 |
| Human E2E requires manual data repair.                               | Fail the run. Reset to a clean fixture and correct the implementation.                                                     |
| Secret or Production database identifier appears in an unsafe place. | Stop, rotate/remove as appropriate, scrub evidence, and rerun security checks.                                             |

# 3. Starting-State Inspection and Source Acquisition

Codex begins by establishing the actual repository and deployment baseline. The purpose is to avoid building against an imagined file tree or accidentally redirecting the current Production runtime.

## 3.1 Required retrieval set

| **Priority** | **Path / resource**                                                                                   | **Why it must be inspected before editing**                                                                                                      |
|--------------|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Critical     | package.json                                                                                          | Determine current module type, scripts, dependencies, Wrangler/test tooling, and whether a replacement or merge is safe.                         |
| Critical     | wrangler.json                                                                                         | Identify current configuration shape, QA/Production environment blocks, entry points, D1 binding, compatibility date, routes, and observability. |
| Critical     | worker/day1.js                                                                                        | Determine whether the required Day 1 entry exists; create it only when absent/incomplete.                                                        |
| Critical     | migrations/day1/0001_canonical_business_medical_record.sql                                            | Compare actual schema to the authoritative baseline; do not assume a report means the SQL exists.                                                |
| Critical     | tests/day1-foundation.test.mjs                                                                        | Compare the executable contract to the Day 1 QA matrix.                                                                                          |
| Preserve     | worker/production-entry.js, worker/worker.js, existing day7c/day7d files                              | Establish the current Production/legacy path and avoid accidental replacement.                                                                   |
| Supporting   | existing tests, scripts, migrations, docs, release-evidence, GitHub workflows                         | Reuse proven helpers, avoid duplicate paths, and identify regression commands.                                                                   |
| Platform     | QA Worker deployment, QA D1 database, Production Worker/deployment, Production D1, Pages/public route | Prove environment isolation and establish rollback/baseline references.                                                                          |

## 3.2 Baseline capture procedure

> 1\. Confirm the repository owner/name and selected branch. Record the starting commit SHA.
>
> 2\. Confirm main remains the Production branch and identify the commit/deployment currently serving the Production customer path.
>
> 3\. Fetch the critical file set and preserve exact pre-build contents or hashes in the evidence package.
>
> 4\. Inventory current Worker entry points and identify which file Wrangler uses for QA and which path currently serves Production.
>
> 5\. Inventory D1 bindings by binding name, database name, and non-secret identifier. Record that QA and Production differ.
>
> 6\. Record the Wrangler version, package manager version, Node version, and compatibility date currently used by the repository.
>
> 7\. Record current GitHub workflow names and whether deployment is manual or workflow-driven.
>
> 8\. Run one non-destructive Production baseline smoke path. Record URL, timestamp, HTTP result, visible behavior, deployment/commit, and any pre-existing defect.
>
> 9\. Create release-evidence/day1 and write the baseline before modifying code.

## 3.3 Variables Codex must resolve from the repository/platform

| **Variable**                          | **Resolution rule**                                                                                  |
|---------------------------------------|------------------------------------------------------------------------------------------------------|
| \<STARTING_QA_COMMIT_SHA\>            | Read from the selected QA branch at build start.                                                     |
| \<PRODUCTION_BASELINE_COMMIT_SHA\>    | Read from main/current approved Production deployment.                                               |
| \<QA_WORKER_NAME\>                    | Use the existing approved QA naming convention or create the explicitly approved GalviVault QA name. |
| \<QA_D1_DATABASE_NAME/ID\>            | Use the actual QA D1 resource. Never guess or reuse Production.                                      |
| \<PRODUCTION_WORKER_NAME/DEPLOYMENT\> | Record for regression and rollback only; do not redirect on Day 1.                                   |
| \<PRODUCTION_D1_DATABASE_NAME/ID\>    | Record privately for isolation comparison; never place in QA config/evidence unnecessarily.          |
| \<COMPATIBILITY_DATE\>                | Preserve the valid current project date unless an intentional update is tested.                      |
| \<ALLOWED_QA_ORIGINS\>                | Exact approved QA Pages/client/local origins; no wildcard for privileged routes.                     |
| \<WRANGLER_VERSION\>                  | Resolve from package-lock/package.json or current project tooling and pin compatibly.                |
| \<QA_WORKER_URL\>                     | Capture after deployment and use consistently in automated smoke/Human E2E.                          |

## 3.4 Baseline evidence template

``` json
{
"day": 1,
"repository": "mrgalvipro/galvitriage",
"branch": "qa-revamped-galvicare-0-5",
"starting_commit": "<sha>",
"production_branch": "main",
"production_commit": "<sha>",
"production_worker": "<name-or-deployment>",
"qa_worker_before": "<name-or-null>",
"qa_d1_target": "<safe-name-or-reference>",
"production_d1_reference": "<safe-reference-only>",
"wrangler_version": "<version>",
"node_version": "<version>",
"baseline_smoke": {
"timestamp": "<utc>",
"url_or_flow": "<safe-reference>",
"result": "pass | fail",
"notes": "<pre-existing defects>"
}
}
```

# 4. Day 1 Repository Target and File Inventory

The five canonical files are the minimum critical-path proof points. They are not the complete implementation. The full Day 1 foundation also requires the support modules, tests, fixtures, scripts, documentation, and evidence paths below so Codex can build and verify the behavior without placing everything inline in worker/day1.js.

## 4.1 Canonical Day 1 repository tree

``` text
mrgalvipro/galvitriage/
├── package.json
├── package-lock.json # required when npm install changes dependencies
├── wrangler.json # QA/Production-safe Worker + D1 configuration
├── .gitignore
├── README.md
├── worker/
│ ├── day1.js # REQUIRED Day 1 QA entry point
│ ├── production-entry.js # preserve existing approved production entry
│ ├── worker.js # preserve existing worker module if present
│ ├── domain/
│ │ ├── constants.js
│ │ ├── lifecycle.js
│ │ └── invariants.js
│ ├── lib/
│ │ ├── audit.js
│ │ ├── cors.js
│ │ ├── env.js
│ │ ├── errors.js
│ │ ├── ids.js
│ │ ├── response.js
│ │ ├── time.js
│ │ └── validation.js
│ ├── routes/
│ │ ├── health.js
│ │ ├── sessions.js
│ │ ├── events.js
│ │ └── fixtures.js
│ ├── services/
│ │ ├── session-service.js
│ │ ├── event-service.js
│ │ └── fixture-service.js
│ ├── repositories/
│ │ ├── schema-repository.js
│ │ ├── session-repository.js
│ │ └── event-repository.js
│ └── fixtures/
│ └── day1.js
├── migrations/
│ └── day1/
│ └── 0001_canonical_business_medical_record.sql
├── tests/
│ ├── day1-foundation.test.mjs
│ ├── helpers/
│ │ ├── d1-assertions.mjs
│ │ ├── fixture-loader.mjs
│ │ └── worker-client.mjs
│ └── fixtures/
│ ├── day1-session.json
│ └── day1-event.json
├── scripts/
│ ├── day1-smoke.mjs
│ ├── verify-day1-files.mjs
│ └── verify-migration.mjs
├── docs/
│ ├── architecture/
│ │ ├── README.md
│ │ └── adr-index.md
│ ├── api/
│ │ └── day1-foundation.md
│ ├── operations/
│ │ └── day1-human-e2e.md
│ └── repository-inventory.md
└── release-evidence/
└── day1/
├── README.md
├── deployment-metadata.json
├── automated-tests.txt
├── database-assertions.sql
├── human-e2e.md
└── rollback.md
```

## 4.2 Root file inventory

| **Path**          | **Required by**                | **Purpose / acceptance**                                                                                                                                                                                     |
|-------------------|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| package.json      | Day 1                          | Defines module/runtime metadata and executable scripts for tests, local/remote Worker checks, migration verification, file inventory, and deployment. Must not contain placeholder scripts that always pass. |
| package-lock.json | Day 1 when dependencies change | Pins dependency resolution. Must match package.json and be committed if npm modifies dependencies.                                                                                                           |
| wrangler.json     | Day 1                          | Defines QA Day 1 Worker entry, compatibility date, D1 binding DB, non-secret variables, and environment-safe configuration. Must not redirect Production to day1.js.                                         |
| .gitignore        | Day 1                          | Excludes node_modules, local D1 state, .dev.vars, secrets, temp render/test output, and unapproved local artifacts while preserving intentional release evidence.                                            |
| README.md         | Day 1                          | Repository-level setup, commands, environment safety, critical paths, and pointer to authoritative guide. It is operational documentation, not a substitute for this contract.                               |

## 4.3 Worker foundation file inventory

| **Path**                                  | **Status**          | **Purpose**                                                                                                              |
|-------------------------------------------|---------------------|--------------------------------------------------------------------------------------------------------------------------|
| worker/day1.js                            | Required            | QA Day 1 fetch entry; wires shared middleware and Day 1 routes. Exports the Worker handler. No production-only behavior. |
| worker/production-entry.js                | Preserve            | Existing production entry. No Day 1 functional changes.                                                                  |
| worker/worker.js                          | Preserve if present | Existing worker implementation/module. Reuse only proven helpers without changing production behavior.                   |
| worker/domain/constants.js                | Required            | Stable Day 1 action names, statuses, environments, event names, error codes, and schema compatibility constants.         |
| worker/domain/lifecycle.js                | Required            | Allowed Day 1 session/BMR state transitions and transition validation.                                                   |
| worker/domain/invariants.js               | Required            | Pure invariant helpers for IDs, required relationships, idempotency expectations, and environment restrictions.          |
| worker/lib/audit.js                       | Required            | Builds safe audit/event context: correlation, actor/service, environment, source, entity IDs, version.                   |
| worker/lib/cors.js                        | Required            | Environment-specific allowlist evaluation and OPTIONS response. No wildcard Production CORS.                             |
| worker/lib/env.js                         | Required            | Validates ENVIRONMENT, FIXTURE_MODE, DB binding, and required variables; supports readiness.                             |
| worker/lib/errors.js                      | Required            | Typed internal errors and safe public error mapping; removes stack/SQL detail from responses.                            |
| worker/lib/ids.js                         | Required            | Server-side opaque ID and correlation ID generation plus accepted ID validation.                                         |
| worker/lib/response.js                    | Required            | Canonical success/error envelope and headers, including environment and correlation ID.                                  |
| worker/lib/time.js                        | Required            | UTC ISO timestamp helper and testability boundary; no inconsistent direct timestamp formatting.                          |
| worker/lib/validation.js                  | Required            | Reusable payload, action, ID, string, enum, and object validation; produces field-level safe errors.                     |
| worker/routes/health.js                   | Required            | health and readiness/schema-version handling. Health can be live while readiness is false if DB/schema is unavailable.   |
| worker/routes/sessions.js                 | Required            | create_or_resume_session and get_session route/action handlers.                                                          |
| worker/routes/events.js                   | Required            | journey_event handler with declared event idempotency/append behavior and safe payload bounds.                           |
| worker/routes/fixtures.js                 | Required            | fixture_result handler, QA-only guard, deterministic schema output.                                                      |
| worker/services/session-service.js        | Required            | Session/BMR identity resolution, create/resume idempotency, lifecycle and audit orchestration.                           |
| worker/services/event-service.js          | Required            | Validates and persists canonical journey events; enforces safe bounded metadata.                                         |
| worker/services/fixture-service.js        | Required            | Selects approved deterministic fixture payloads and records fixture evidence where contracted.                           |
| worker/repositories/schema-repository.js  | Required            | Reads migration/schema compatibility and readiness from D1.                                                              |
| worker/repositories/session-repository.js | Required            | Parameterized session/BMR read/upsert operations and unique-conflict handling.                                           |
| worker/repositories/event-repository.js   | Required            | Parameterized journey/audit event inserts and bounded query support.                                                     |
| worker/fixtures/day1.js                   | Required            | Synthetic deterministic GalviVault/GalviCare fixture payload definitions; unavailable in Production.                     |

## 4.4 Migration, test, fixture, script, documentation, and evidence inventory

| **Path**                                                   | **Status** | **Purpose / pass condition**                                                                                                                                                                                      |
|------------------------------------------------------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| migrations/day1/0001_canonical_business_medical_record.sql | Required   | Complete Day 1 baseline schema and indexes/constraints needed for canonical identity, BMR, sessions, evidence/reasoning foundations, events, errors, audit, and migration ledger. Applies cleanly to empty QA D1. |
| tests/day1-foundation.test.mjs                             | Required   | Primary executable Day 1 contract. Covers file/config, health/readiness, CORS, invalid requests, session idempotency, event write, fixture determinism, DB assertions, missing binding, and Production guard.     |
| tests/helpers/d1-assertions.mjs                            | Required   | Reusable queries/assertions for tables, indexes, schema version, row counts, deduplication, and relationships.                                                                                                    |
| tests/helpers/fixture-loader.mjs                           | Required   | Loads synthetic fixture JSON/modules without real customer data.                                                                                                                                                  |
| tests/helpers/worker-client.mjs                            | Required   | Canonical request helper that captures status, headers, JSON envelope, correlation ID, and timeout behavior.                                                                                                      |
| tests/fixtures/day1-session.json                           | Required   | Valid and invalid synthetic session payloads, including retry/idempotency cases.                                                                                                                                  |
| tests/fixtures/day1-event.json                             | Required   | Synthetic journey event payloads, size/field edge cases, and declared dedup/append cases.                                                                                                                         |

| **Path**                          | **Purpose**                                                                                                                                                                 |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| scripts/day1-smoke.mjs            | Runs an environment-targeted smoke sequence: health → readiness → create/resume twice → event → get session → fixture; prints safe evidence and returns nonzero on failure. |
| scripts/verify-day1-files.mjs     | Asserts every required Day 1 path exists and prohibited secret/local artifacts are absent.                                                                                  |
| scripts/verify-migration.mjs      | Applies/verifies migration against the intended local/QA process and checks schema version/table inventory.                                                                 |
| docs/architecture/README.md       | Human-readable architecture summary and pointer to locked ADRs in this guide.                                                                                               |
| docs/architecture/adr-index.md    | Repository index mapping ADR-001 through ADR-020 to implementation files/tests.                                                                                             |
| docs/api/day1-foundation.md       | Day 1 route/action payload examples, error codes, headers, and curl/client examples consistent with the later API section.                                                  |
| docs/operations/day1-human-e2e.md | Operator instructions for the Day 1 Human E2E and evidence capture.                                                                                                         |
| docs/repository-inventory.md      | Current vs required file inventory, ownership, status, and approved deviations.                                                                                             |
| release-evidence/day1/\*          | Immutable evidence package for the reviewed Day 1 commit/deployment, as defined in Section 5.8.                                                                             |

## 4.5 File ownership and edit policy

| **File class**                           | **Day 1 action**                                                                                                                                   |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Critical small configuration/entry files | Return or commit complete replacement content when the existing file is absent or a partial patch could produce invalid JSON/import/configuration. |
| Existing Production entry files          | Preserve. Reuse only proven shared helpers with regression evidence and no changed Production behavior.                                            |
| New Day 1 modules                        | Create at the exact canonical path with one responsibility and direct tests.                                                                       |
| Existing helpers/tests                   | Reuse only after inspection; do not create a parallel duplicate abstraction.                                                                       |
| Migration                                | Create or replace before shared QA apply only. After shared apply, corrections use a new migration rather than rewriting history.                  |
| Generated/local files                    | Exclude through .gitignore unless intentionally retained as redacted release evidence.                                                             |
| Documentation                            | Explain operational contracts and commands; never substitute narrative for executable behavior.                                                    |

# 5. Day 1 Build Sequence and Time-Boxed Working Plan

## 5.1 Required sequence

| **Step** | **Build block**                    | **Required work**                                                                                                     | **Exit**                                            |
|----------|------------------------------------|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| 0        | Read and freeze                    | Retrieve actual files/configuration; record commit, Production baseline, QA/Production resources, rollback reference. | No code changed before baseline.                    |
| 1        | Create repository skeleton         | Create missing Day 1 directories/files; preserve Production files.                                                    | File verifier can identify exact target paths.      |
| 2        | Lock package/config                | Update package.json, .gitignore, README, wrangler.json with QA-only entry/binding/variables/scripts.                  | Config parses; QA/Production isolation test passes. |
| 3        | Create migration                   | Author full baseline SQL and verification script.                                                                     | Clean local apply succeeds.                         |
| 4        | Create shared Worker foundation    | Domain constants/invariants; env/CORS/errors/response/IDs/time/validation/audit.                                      | Unit tests for shared behavior pass.                |
| 5        | Create repositories/services       | Schema, session, event repositories; session/event/fixture services.                                                  | D1 integration tests pass.                          |
| 6        | Create routes/entry                | Health/readiness/schema, sessions, events, fixtures, action compatibility, worker/day1.js.                            | Route contract tests pass locally.                  |
| 7        | Create fixtures/tests/scripts/docs | Primary test, helpers, synthetic fixtures, smoke/file/migration scripts, operator docs, evidence templates.           | All commands execute and fail nonzero on defects.   |
| 8        | Run local gate                     | File verification, clean migration, test:day1, smoke against local Worker/test D1.                                    | All BLOCK tests pass; no skip.                      |
| 9        | Apply QA migration                 | Apply 0001 to QA D1 and query ledger/schema.                                                                          | QA schema verified.                                 |
| 10       | Deploy QA Worker                   | Deploy exact commit/config to isolated QA Worker.                                                                     | Health/readiness and environment headers pass.      |
| 11       | Run QA smoke                       | Run automated route/D1 smoke and Production baseline regression.                                                      | Machine-readable evidence complete.                 |
| 12       | Run Human E2E                      | Execute H1.1–H1.7 without manual repair.                                                                              | Human, API, D1, and Production proof pass.          |
| 13       | Closeout                           | Generate evidence, known issues, rollback, gate record, final status.                                                 | GO/STOP/ROLLBACK explicit.                          |

## 5.2 Recommended Day 1 working rhythm

| **Time block** | **Activity**                                                        | **Deliverable**                               |
|----------------|---------------------------------------------------------------------|-----------------------------------------------|
| 0:00–0:30      | Baseline, branch, deployment, D1, Production smoke, evidence setup. | Frozen starting state and rollback reference. |
| 0:30–2:30      | Repository/configuration/migration implementation.                  | Files exist; clean migration passes locally.  |
| 2:30–5:00      | Shared Worker modules, repositories, services, routes, entry point. | Local route and D1 behavior implemented.      |
| 5:00–6:30      | Primary automated suite, helpers, fixtures, scripts, documentation. | All Day 1 tests executable.                   |
| 6:30–7:30      | Full automated QA and defect correction.                            | BLOCK test pass and database assertions.      |
| 7:30–8:15      | QA migration/deployment/smoke.                                      | QA Worker ready and evidence captured.        |
| 8:15–9:00      | Human E2E, Production regression, evidence closeout.                | Signed Day 1 gate decision.                   |

> **Efficiency rule**
>
> Build from the database and shared contracts outward: migration -> repositories -> services -> routes -> entry -> client/smoke. Do not start with browser wiring or a monolithic worker/day1.js. A clean local database and automated contract tests must pass before remote deployment.

# 6. Phase A — Freeze Baseline and Establish Evidence

## 6.1 Codex actions

> 1\. Create release-evidence/day1 if absent. Add README.md, deployment-metadata.json, automated-tests.txt, database-assertions.sql, human-e2e.md, and rollback.md placeholders.
>
> 2\. Record repository, branch, starting commit, current main commit, current Production entry point, Worker/deployment, D1 resources, Pages/public path, and workflow names.
>
> 3\. Run and record the pre-Day-1 Production smoke. Do not make a Day 1 change until the baseline is known.
>
> 4\. Run the file inventory against the canonical target. Classify every required file: present and compliant; present but incomplete; missing; preserve-only.
>
> 5\. Capture pre-build hashes or copies of package.json, wrangler.json, the current Production entry, and any existing Day 1 files.
>
> 6\. Write rollback.md with the starting QA commit/deployment and Production baseline. The rollback must be executable before QA deployment.

## 6.2 Required inventory report

| **Path/resource**        | **Status**                 | **Action**                           | **Evidence**                            |
|--------------------------|----------------------------|--------------------------------------|-----------------------------------------|
| package.json             | present/incomplete/missing | Merge or complete replacement        | Hash and script inventory               |
| wrangler.json            | present/incomplete/missing | Complete QA-safe configuration       | Parsed target inventory                 |
| worker/day1.js           | present/incomplete/missing | Review or create                     | Import/route responsibility             |
| Production entry files   | present                    | Preserve                             | Hash/diff baseline                      |
| Migration 0001           | present/incomplete/missing | Review or author before shared apply | SQL hash and clean-apply result         |
| Primary Day 1 test       | present/incomplete/missing | Review or author                     | Test ID coverage map                    |
| QA Worker and D1         | existing/new               | Resolve exact target                 | Safe names/IDs and isolation comparison |
| Production Worker and D1 | existing                   | Record only                          | Regression/rollback reference           |

## 6.3 Baseline phase gate

- The actual repository and branch are confirmed.

- The five canonical files have been retrieved or their exact absence is proven.

- The current Production runtime and smoke behavior are known.

- QA and Production Worker/D1 resources are distinguishable.

- A rollback reference and Day 1 evidence folder exist.

- No source modification occurred before this information was captured.

# 7. Phase B — Package, Configuration, and Environment Contracts

## 7.1 package.json contract

Codex must preserve existing valid dependencies and scripts required by the current application while adding the Day 1 commands. The repository remains ESM. New runtime dependencies should be avoided unless the existing stack requires them.

``` json
{
"type": "module",
"scripts": {
"test": "node --test tests/**/*.test.mjs",
"test:day1": "node --test tests/day1-foundation.test.mjs",
"verify:day1-files": "node scripts/verify-day1-files.mjs",
"verify:migration": "node scripts/verify-migration.mjs",
"smoke:day1": "node scripts/day1-smoke.mjs",
"qa:smoke": "node scripts/day1-smoke.mjs",
"evidence:day1": "node scripts/release-evidence.mjs day1",
"dev:day1": "wrangler dev --config wrangler.json",
"deploy:day1:qa": "wrangler deploy --config wrangler.json"
}
}
```

- Use the installed Wrangler/package-manager shape already approved in the repository. Pin compatible versions; update package-lock.json when dependencies change.

- Scripts must return nonzero on failure and print safe, useful evidence. A script that catches all errors or always exits 0 is invalid.

- There must be no ambiguous deploy script that could target Production during Day 1.

- test and test:day1 must execute the primary Day 1 contract; the full test command may include existing regression suites.

- Document any necessary environment variables without storing secret values.

## 7.2 .gitignore contract

``` text
node_modules/
.wrangler/
.dev.vars
.dev.vars.*
.env
.env.*
*.local
*.sqlite
*.sqlite3
.DS_Store
Thumbs.db
coverage/
tmp/
temp/
rendered/
test-output/
# Preserve intentional release-evidence/day1 artifacts.
# Do not ignore committed migration, fixture, documentation, or evidence
templates.
```

## 7.3 wrangler.json configuration contract

Codex must adapt the following structure to the valid configuration format and existing project convention. Actual account/database identifiers, routes, and compatibility date must be retrieved; placeholders must not be committed.

``` json
{
"$schema": "node_modules/wrangler/config-schema.json",
"name": "<QA_WORKER_NAME>",
"main": "worker/day1.js",
"compatibility_date": "<CURRENT_APPROVED_COMPATIBILITY_DATE>",
"workers_dev": true,
"observability": {
"enabled": true
},
"vars": {
"ENVIRONMENT": "qa",
"FIXTURE_MODE": "true",
"API_VERSION": "v1",
"MIN_SCHEMA_VERSION": "0001",
"ALLOWED_ORIGINS": "<EXACT_QA_ORIGINS>"
},
"d1_databases": [
{
"binding": "DB",
"database_name": "<QA_D1_DATABASE_NAME>",
"database_id": "<QA_D1_DATABASE_ID>",
"migrations_dir": "migrations"
}
]
}
```

## 7.4 Configuration tests

| **Check**             | **Pass condition**                                                                                  |
|-----------------------|-----------------------------------------------------------------------------------------------------|
| Parse                 | wrangler.json is valid for the installed Wrangler version.                                          |
| QA entry              | main resolves exactly to worker/day1.js for the Day 1 QA deployment.                                |
| Production protection | No Day 1 edit points the Production deployment or main branch to worker/day1.js.                    |
| D1 binding            | Binding name is DB and target is the actual QA D1 resource.                                         |
| Isolation             | QA and Production database names/identifiers are different.                                         |
| Environment           | ENVIRONMENT=qa; response envelope/header must report qa.                                            |
| Fixture               | FIXTURE_MODE=true only in QA/local; Production false/absent and route fails closed.                 |
| Origins               | Allowed origins are exact QA origins; no privileged wildcard.                                       |
| Secrets               | No tokens, provider secrets, or Production credentials/IDs are committed or returned.               |
| Readiness             | Missing DB, wrong environment, or schema below 0001 makes /ready fail and write routes fail closed. |

# 8. Phase C — D1 Baseline Migration

Day 1 applies the full canonical P0 baseline schema even though only foundation actions are activated. This prevents repeated schema redesign and ensures later days build on one migration-controlled Business Medical Record model.

## 8.1 Required migration behavior

- Path is exactly migrations/day1/0001_canonical_business_medical_record.sql.

- PRAGMA foreign_keys is enabled for migration/test verification.

- The schema includes the migration ledger, identity/BMR/session, evidence/reasoning, care, governance, event, audit, idempotency, adapter, import, and safe application-error tables defined by the source contract.

- Primary keys, unique constraints, status checks, foreign keys, indexes, and append-only/immutability triggers are present.

- The migration is safe to apply to an empty database and is verified against a clean local/test database before QA.

- The applied migration row records the correct environment. No Production database ID or secret appears in SQL.

- After application to a shared environment, 0001 is immutable; corrections use a new migration.

- No DROP, destructive rename, or data-loss operation is permitted.

## 8.2 Tables used directly by Day 1

| **Table**                                                              | **Day 1 use**                                                                                     |
|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| schema_migrations                                                      | Readiness and schema-version proof.                                                               |
| founders / ventures / founder_venture_roles / business_medical_records | Synthetic fixture context/precondition only; general public identity routes remain Day 2.         |
| assessment_sessions                                                    | create_or_resume_session and get_session canonical state.                                         |
| journey_events                                                         | journey_event write and deduplication proof.                                                      |
| audit_log                                                              | Material session/event context where contracted.                                                  |
| idempotency_keys                                                       | Stored request fingerprint and replay receipt.                                                    |
| application_errors                                                     | Optional safe operational error evidence; never raw SQL/secrets.                                  |
| All remaining baseline tables                                          | Created and integrity-verified for future days; no out-of-scope public behavior enabled on Day 1. |

## 8.3 Migration implementation steps

> 1\. Author or compare the complete baseline SQL in Appendix A. Do not substitute placeholder tables.
>
> 2\. Create scripts/verify-migration.mjs to apply the migration to a clean local/test D1 database using the repository’s pinned Wrangler workflow.
>
> 3\. Verify the exact table inventory, indexes, triggers, foreign keys, unique constraints, and schema ledger.
>
> 4\. Run a second verification/application path to prove rerunning verification does not corrupt the schema or produce false ledger state.
>
> 5\. Run explicit negative assertions: duplicate BMR for venture; duplicate session ID; update/delete append-only rows; mutate accepted evidence; orphan foreign key when FK enforcement is active.
>
> 6\. Store the exact local command and output in automated-tests/evidence.
>
> 7\. Only after local clean apply passes, apply 0001 to the QA D1 database.
>
> 8\. Query QA schema_migrations and sqlite_master. Store safe results and the migration command transcript.
>
> 9\. Call GET /ready and GET /api/v1/schema-version through the deployed QA Worker.

## 8.4 Migration exit gate

| **Gate**             | **Pass**                                                                                           |
|----------------------|----------------------------------------------------------------------------------------------------|
| Clean local apply    | No SQL error; ledger row exists; complete table/index/trigger inventory.                           |
| Constraint proof     | Unique, FK, CHECK, append-only, and accepted-evidence protections behave as contracted.            |
| QA apply             | Migration applies only to QA D1 and ledger environment is correct.                                 |
| Worker compatibility | /ready is 200; current schema meets minimum 0001.                                                  |
| Evidence             | Command, exit code, SQL hash/commit, ledger, object inventory, and verification queries saved.     |
| Rollback awareness   | Prior Worker compatibility/additive schema handling is understood; no destructive rollback script. |

# 9. Phase D — Worker Foundation Modules and Entry Point

Codex must implement Day 1 as a modular Worker foundation. The entry point wires the application. Validation, domain behavior, SQL, response formatting, CORS, and fixtures remain in their assigned modules.

## 9.1 Implementation order

> 1\. worker/domain/constants.js
>
> 2\. worker/lib/time.js and worker/lib/ids.js
>
> 3\. worker/lib/errors.js and worker/lib/response.js
>
> 4\. worker/lib/env.js and worker/lib/cors.js
>
> 5\. worker/lib/validation.js and worker/lib/audit.js
>
> 6\. worker/domain/invariants.js and worker/domain/lifecycle.js
>
> 7\. worker/repositories/schema-repository.js
>
> 8\. worker/repositories/session-repository.js and event-repository.js
>
> 9\. worker/services/session-service.js, event-service.js, fixture-service.js
>
> 10\. worker/routes/health.js, sessions.js, events.js, fixtures.js
>
> 11\. worker/fixtures/day1.js
>
> 12\. worker/day1.js

## 9.2 Shared module contracts

| **Module**                  | **Required behavior**                                                                                                              |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| worker/domain/constants.js  | Export action names, environments, API/schema versions, event/status/error constants. No mutable state.                            |
| worker/domain/lifecycle.js  | Validate only Day 1 session/BMR transitions used by the foundation. Return typed conflict; do not embed HTTP.                      |
| worker/domain/invariants.js | Pure validation for canonical IDs, required context, event-key rules, idempotency expectations, and QA fixture restrictions.       |
| worker/lib/time.js          | Return UTC ISO timestamps behind a testable function.                                                                              |
| worker/lib/ids.js           | Generate opaque prefixed IDs and correlation IDs; validate accepted IDs; never infer authority from prefix.                        |
| worker/lib/errors.js        | Typed errors with HTTP status, safe code/message/details, retryable flag, internal cause retained server-side only.                |
| worker/lib/response.js      | Canonical success/error envelopes and X-GalviVault-Environment, X-Correlation-Id, API-version headers.                             |
| worker/lib/env.js           | Validate ENVIRONMENT, FIXTURE_MODE, DB, minimum schema, origins, required variables; expose readiness facts without secret values. |
| worker/lib/cors.js          | Exact-match allowlist; Vary: Origin; approved headers/methods; OPTIONS without D1/domain work.                                     |
| worker/lib/validation.js    | Bounded JSON/object/string/enum/ID validation and field-level safe errors; no silent coercion.                                     |
| worker/lib/audit.js         | Create safe event/audit context with entity IDs, operation, source, actor/service, environment, correlation, version.              |

## 9.3 Repository contracts

| **Repository**        | **Contract**                                                                                                                      |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| schema-repository.js  | SELECT 1; read schema_migrations; return current/required schema; no automatic migration during request.                          |
| session-repository.js | Find session by ID/business key; parameterized insert; conflict-safe create/resume; bounded get; no HTTP concerns.                |
| event-repository.js   | Insert/find journey event by event_key; append audit/event rows; store/read idempotency receipt as implemented; bounded metadata. |

## 9.4 Service contracts

| **Service**        | **Contract**                                                                                                                                                                                              |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| session-service.js | Validate context; resolve existing session; create once; attach valid venture/BMR fixture context; emit session_created/session_resumed and audit where contracted; return authoritative committed state. |
| event-service.js   | Validate session and safe event fields; enforce event_key/idempotency behavior; append exactly one canonical event for replay; return stored event receipt.                                               |
| fixture-service.js | Return deterministic non-sensitive QA-only GalviVault-ready shape; use shared response/persistence utilities where appropriate; Production guard fails closed.                                            |

## 9.5 Day 1 synthetic context rule

> **Required test precondition**
>
> Because general Founder/Venture/BMR creation is a Day 2 capability while assessment_sessions requires canonical venture/BMR context, the Day 1 test harness must provision one explicitly synthetic QA/local context before session E2E. The context may be established by the controlled fixture loader/test setup or the approved QA fixture service. It must be version-controlled, repeatable, non-sensitive, idempotent, recorded in evidence, and never available as a general Production customer route. It is setup, not manual repair.

## 9.6 worker/day1.js entry-point contract

``` text
// Required responsibility shape — implementation may differ internally.
import { handleHealth, handleReady, handleSchemaVersion } from
"./routes/health.js";
import { createOrResumeSession, getSession } from
"./routes/sessions.js";
import { writeJourneyEvent } from "./routes/events.js";
import { getFixtureResult } from "./routes/fixtures.js";
import { applyCors, handleOptions } from "./lib/cors.js";
import { loadEnvironment } from "./lib/env.js";
import { toErrorResponse } from "./lib/errors.js";
import { withRequestContext } from "./lib/response.js";
export default {
async fetch(request, env, ctx) {
// 1. Resolve correlation and environment.
// 2. Validate environment/bindings.
// 3. Apply CORS and OPTIONS.
// 4. Match exact REST route or compatibility action.
// 5. Call one route handler.
// 6. Return canonical JSON.
// 7. Catch and map through safe typed error response.
}
};
```

- worker/day1.js contains no large SQL, hidden fixture data, secret values, Production-only integrations, or duplicated domain rules.

- The action compatibility endpoint and REST routes dispatch to the same handlers/services.

- Unknown route/action returns a deterministic safe 404/400 envelope and performs no write.

- An uncaught exception is mapped to GV_INTERNAL with correlation ID; raw stack is not returned.

- Every response identifies the QA environment and correlation ID.

# 10. Phase E — REST and Compatibility Foundation Routes

## 10.1 Canonical response envelopes

``` text
SUCCESS
{
"success": true,
"status": "ok | created | resumed | no_change | accepted",
"environment": "qa",
"correlation_id": "corr_...",
"data": {},
"meta": {
"api_version": "v1",
"schema_version": "0001",
"record_version": 1,
"idempotent_replay": false
}
}
ERROR
{
"success": false,
"status": "invalid_request | unauthorized | forbidden | not_found |
conflict | unavailable | internal_error",
"environment": "qa",
"correlation_id": "corr_...",
"error": {
"code": "GV_...",
"message": "Safe actionable message.",
"retryable": false,
"details": {
"fields": [{"field": "session_id", "issue": "required"}]
}
},
"meta": {
"api_version": "v1",
"schema_version": "0001"
}
}
```

## 10.2 Foundation route contract

| **Foundation action/route**                      | **Required behavior**                                                                                                             | **Pass criteria**                                                    |
|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| GET /health / action=health                      | Return service, timestamp, environment, DB boolean, fixture policy, API/schema version, and correlation ID.                       | HTTP 200 JSON; environment qa; no secrets/database IDs.              |
| GET /ready / action=readiness                    | Execute SELECT 1 and minimum migration check.                                                                                     | 200 when ready; 503 canonical error when DB/schema missing.          |
| GET /api/v1/schema-version                       | Return current and required migration IDs.                                                                                        | Matches schema_migrations; safe metadata only.                       |
| POST /api/v1/sessions / create_or_resume_session | Create or return one assessment_session by session ID/business key; attach available BMR context; emit event/audit as contracted. | Two identical requests produce one session row and stable response.  |
| GET /api/v1/sessions/{id} / get_session          | Return authoritative stored session state.                                                                                        | Refresh retrieves committed state; unknown ID returns canonical 404. |
| POST /api/v1/journey-events / journey_event      | Append one bounded safe event, idempotent by event_key/key.                                                                       | Event queryable by session/correlation; replay creates no duplicate. |
| POST /api/v1/fixtures/results / fixture_result   | Return approved deterministic fixture in QA only.                                                                                 | Correct schema; Production policy test rejects route.                |

## 10.3 Route-by-route implementation instructions

| **Route/action**                  | **Implementation contract**                                                                                                                                                                                                                         |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET /health                       | No auth. Return service galvivault-p0, UTC timestamp, environment, db boolean, fixture mode, API version, schema version when available, correlation. Liveness may be true while readiness false. No database IDs or secrets.                       |
| GET /ready                        | No protected data. Validate ENVIRONMENT, DB binding, SELECT 1, and minimum schema 0001. Return 200 success when ready; otherwise 503 canonical GV_DB_UNAVAILABLE, GV_DB_SCHEMA_OUTDATED, or GV_ENV_MISCONFIGURED.                                   |
| GET /api/v1/schema-version        | Return current migration identifier(s), required schema, and compatibility status. Do not expose database name/id or migration SQL.                                                                                                                 |
| POST /api/v1/sessions             | Require valid JSON and declared session/business key plus valid synthetic/available venture/BMR context. Use Idempotency-Key or session ID. Insert once or return existing. Return authoritative session. Record event/audit/receipt as contracted. |
| GET /api/v1/sessions/{session_id} | Return stored session state within approved scope. Unknown ID -\> 404 GV_NOT_FOUND. No fabricated state from request/local storage.                                                                                                                 |
| POST /api/v1/journey-events       | Require session_id, event_name, event_key/Idempotency-Key, occurred_at or server time, bounded safe metadata. Identical replay -\> one row and replay/no_change. Key reused with different fingerprint -\> 409.                                     |
| POST /api/v1/fixtures/results     | QA fixture mode only. Return deterministic synthetic GalviVault-ready shape. Production returns 404/403. No external API calls and no real data.                                                                                                    |
| POST /api compatibility action    | Map action=health, readiness, create_or_resume_session, get_session, journey_event, fixture_result to the same handlers. Unsupported action -\> safe 400/404; no second logic path.                                                                 |

## 10.4 Canonical headers

| **Header**                 | **Contract**                                                                                   |
|----------------------------|------------------------------------------------------------------------------------------------|
| Content-Type               | application/json for request bodies and all API responses.                                     |
| Idempotency-Key            | Required for declared writes; 1–128 safe characters; scoped by route/actor/context.            |
| X-Correlation-Id           | Optional valid request header; required response header. Server generates when absent/invalid. |
| X-GalviVault-Environment   | Required response header; qa for the Day 1 deployment.                                         |
| X-GalviVault-Api-Version   | Required response header; v1.                                                                  |
| Origin / Access-Control-\* | Exact approved QA origin receives grant; denied origin receives no access-control grant.       |
| Authorization              | Only if current approved session/operator mechanism is used; never echoed or logged.           |

## 10.5 Error code minimum

| **Code**                      | **HTTP** | **Use**                                             |
|-------------------------------|----------|-----------------------------------------------------|
| GV_REQ_METHOD_NOT_ALLOWED     | 400/405  | Wrong method for route.                             |
| GV_REQ_CONTENT_TYPE           | 415      | Unsupported content type.                           |
| GV_REQ_BODY_INVALID           | 400      | Malformed/non-object JSON.                          |
| GV_REQ_SCHEMA                 | 422      | Field/domain validation failure.                    |
| GV_ENV_MISCONFIGURED          | 503      | Required environment/fixture/origin config invalid. |
| GV_DB_UNAVAILABLE             | 503      | DB binding/query unavailable.                       |
| GV_DB_SCHEMA_OUTDATED         | 503      | Minimum migration not present.                      |
| GV_NOT_FOUND                  | 404      | Session/resource absent.                            |
| GV_IDEMPOTENCY_REQUIRED       | 400      | Required key absent.                                |
| GV_IDEMPOTENCY_REUSE_MISMATCH | 409      | Same key, changed request fingerprint.              |
| GV_FIXTURE_DISABLED           | 404/403  | Fixture route not available in this environment.    |
| GV_INTERNAL                   | 500      | Unexpected safe-mapped failure.                     |

## 10.6 Session and event examples

``` text
POST /api/v1/sessions
Idempotency-Key: day1-session-test-001
Content-Type: application/json
{
"session_id": "ses_day1_fixture_001",
"founder_id": "fdr_day1_fixture_001",
"venture_id": "ven_day1_fixture_001",
"bmr_id": "bmr_day1_fixture_001",
"source": "galvicare",
"current_stage": "GalviTriage"
}
Expected first result: 201 status=created.
Expected identical replay: 200 status=resumed or no_change, same
session_id, meta.idempotent_replay=true.
Expected D1: exactly one assessment_sessions row for the session
business key.
```

``` text
POST /api/v1/journey-events
Idempotency-Key: day1-event-test-001
Content-Type: application/json
{
"event_key": "day1:ses_day1_fixture_001:triage_opened:001",
"session_id": "ses_day1_fixture_001",
"event_name": "triage_opened",
"product": "GalviTriage",
"current_stage": "GalviTriage",
"metadata": {
"fixture": true,
"source": "day1-human-e2e"
}
}
Expected first result: 201/202 status=accepted.
Expected identical replay: 200 status=no_change/replay.
Expected changed body with same key: 409 GV_IDEMPOTENCY_REUSE_MISMATCH.
Expected D1: exactly one journey_events row for event_key.
```

# 11. Phase F — Fixtures, Tests, Scripts, Documentation, and Evidence Files

## 11.1 Fixture design

- Use synthetic IDs and content clearly labeled day1_fixture; never use a real founder email, phone, venture-confidential evidence, payment data, or secret.

- Fixtures are deterministic and versioned. The same fixture code returns the same semantic record shape.

- Valid and invalid session/event fixtures cover idempotent replay, changed fingerprint, missing fields, unsafe metadata, oversized payload, and unknown session.

- Fixture mode is QA/local only and explicitly tested as unavailable in Production policy.

- Fixture behavior uses the same response helpers and route/service/repository behavior where applicable; it is not a hidden second application.

- The test harness may create one repeatable synthetic Founder/Venture/BMR precondition for the Day 1 session route. This setup is documented and never performed as manual repair during the test.

## 11.2 tests/day1-foundation.test.mjs structure

``` text
import test from "node:test";
import assert from "node:assert/strict";
// Suggested top-level organization:
// 1. required file inventory and prohibited artifacts
// 2. package.json / wrangler.json parse and isolation
// 3. clean migration / table / index / trigger assertions
// 4. Worker import and canonical envelope
// 5. health / readiness / schema version
// 6. CORS and OPTIONS
// 7. invalid method, content type, body, route/action
// 8. missing DB and outdated schema
// 9. session create/resume/get and D1 deduplication
// 10. journey event write/replay/mismatch and D1 counts
// 11. fixture determinism and Production guard
// 12. safe error/no secret/no raw SQL/no stack
// 13. existing Production entry/regression guard
// 14. evidence manifest required paths
```

## 11.3 Test helper contracts

| **Helper**                       | **Required behavior**                                                                                                                                |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| tests/helpers/worker-client.mjs  | Build requests, apply origin/idempotency/correlation headers, capture status/headers/JSON, enforce timeout, and fail when body is non-JSON.          |
| tests/helpers/d1-assertions.mjs  | Read schema/table/index/trigger inventory; count rows; assert one session/event; check ledger and relationships; never mutate shared QA as a repair. |
| tests/helpers/fixture-loader.mjs | Load deterministic fixtures and establish approved ephemeral/test context; no real data and no Production use.                                       |
| tests/fixtures/day1-session.json | Valid create/replay/mismatch, missing IDs/context, invalid stage/source, oversized/unknown fields.                                                   |
| tests/fixtures/day1-event.json   | Valid event, identical replay, changed fingerprint, unknown session, oversized metadata, unsafe field attempts.                                      |

## 11.4 Script contracts

| **Script**                    | **Steps and exit behavior**                                                                                                                                                                          |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| scripts/verify-day1-files.mjs | Check all required paths, exact casing, no alternate migration/test/entry substitute, no .dev.vars/env secrets, and preserved Production entry. Exit nonzero on any missing/prohibited condition.    |
| scripts/verify-migration.mjs  | Create/use clean local/test D1, apply 0001, query ledger/sqlite_master, exercise constraints/triggers, print safe summary, exit nonzero on mismatch.                                                 |
| scripts/day1-smoke.mjs        | Target explicit base URL; health -\> ready -\> schema -\> create/resume twice -\> get session -\> event twice -\> fixture; validate headers/envelopes/IDs; print safe JSON; exit nonzero on failure. |
| scripts/release-evidence.mjs  | Collect command metadata and safe summaries into release-evidence/day1; never scrape/store secrets or full sensitive payloads.                                                                       |

## 11.5 Documentation contracts

| **Document**                      | **Minimum content**                                                                                                            |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| docs/architecture/README.md       | Day 1 architecture, single Worker/D1 authority, environment topology, module boundaries, no-break rules, link to source guide. |
| docs/architecture/adr-index.md    | ADR-001 through ADR-020 mapping to Day 1 files/tests; mark later-day applicability.                                            |
| docs/api/day1-foundation.md       | Routes/actions, headers, requests/responses, error codes, CORS, idempotency, curl/client examples.                             |
| docs/operations/day1-human-e2e.md | Preconditions, H1.1–H1.7, database queries, evidence, failure behavior, final declaration.                                     |
| docs/repository-inventory.md      | Starting vs target paths, current status, owner/responsibility, created/modified/preserved decision, approved deviations.      |

## 11.6 Release-evidence file contract

| **Artifact**                    | **Minimum content**                                                                                                                           |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| release-evidence/day1/README.md | Objective; candidate commit; QA environment/Worker/D1; migration; test/Human E2E summaries; defects; GO/STOP/ROLLBACK.                        |
| deployment-metadata.json        | Branch, commit, Worker name/deployment, environment, safe D1 reference, schema version, timestamp, actor/tool, Production baseline.           |
| automated-tests.txt or .json    | Exact commands, versions, exit codes, test IDs/counts, pass/fail/skip, duration, timestamps.                                                  |
| database-assertions.sql         | Read-only queries proving schema, one session, one event, idempotency receipt, audit/event records, and no duplicates/orphans.                |
| human-e2e.md                    | H1.1–H1.7 actions/results, response/correlation/canonical IDs, D1 proof, screenshots/log references, Production regression, final result.     |
| rollback.md                     | Starting QA commit/deployment, restoration command/route, Production baseline, additive-schema considerations, verification smoke, authority. |

# 12. Automated QA Matrix and Execution Order

The following 36 Day 1 tests are the minimum automated contract extracted from the authoritative QA matrix. Equivalent test organization is allowed, but every BLOCK behavior must execute and pass. The primary file remains tests/day1-foundation.test.mjs.

## 12.1 Required execution order

> 1\. Static repository and configuration checks.
>
> 2\. Clean local migration and schema assertions.
>
> 3\. Shared utility/domain unit tests.
>
> 4\. Repository integration tests against migrated test D1.
>
> 5\. Worker route and canonical envelope tests.
>
> 6\. Security/CORS/fixture/environment failure tests.
>
> 7\. Session and journey-event idempotency tests with D1 proof.
>
> 8\. Integrated QA Worker + QA D1 smoke tests.
>
> 9\. Production-entry and Production-smoke regression guard.
>
> 10\. Evidence manifest validation.
>
> 11\. Only after all BLOCK tests pass: Human E2E.

## 12.2 Day 1 automated matrix

| **Test ID** | **Category** | **Scenario**                                            | **Expected result**                                                     | **Proof**            | **Level** |
|-------------|--------------|---------------------------------------------------------|-------------------------------------------------------------------------|----------------------|-----------|
| ST-001      | Static       | Required Day 1 files exist at exact paths.              | All five canonical files exist; no alternate path substituted.          | File inventory       | BLOCK     |
| ST-002      | Static       | package.json is valid ESM and required scripts resolve. | Commands execute; no missing script/module.                             | Process exit/output  | BLOCK     |
| ST-003      | Static       | wrangler.json parses and QA main is worker/day1.js.     | QA entry exact; environment qa.                                         | Parsed config        | BLOCK     |
| ST-004      | Static       | QA and Production D1 identifiers/names differ.          | No shared DB binding target.                                            | Parsed config        | BLOCK     |
| ST-005      | Static       | Fixture policy is QA-only.                              | QA true when approved; Production false/absent.                         | Parsed policy test   | BLOCK     |
| ST-006      | Static       | Required Worker imports resolve.                        | No syntax/import failure.                                               | Node import test     | BLOCK     |
| ST-007      | Static       | Migration IDs are unique and ordered.                   | No duplicate/missing predecessor.                                       | Migration scanner    | BLOCK     |
| ST-008      | Static       | Secret-pattern scan.                                    | No token/secret/private key values in tracked source/fixtures/evidence. | Scan report          | BLOCK     |
| MG-001      | Migration    | Apply 0001 to clean local D1.                           | Exit success; ledger row 0001.                                          | Migration + DB proof | BLOCK     |
| MG-002      | Migration    | Apply 0001 a second time.                               | No duplicate-object failure; ledger remains valid.                      | Migration + DB proof | BLOCK     |
| MG-003      | Migration    | Schema inventory.                                       | All contracted tables exist.                                            | sqlite_master query  | BLOCK     |
| MG-004      | Migration    | Index inventory.                                        | All contracted indexes exist.                                           | sqlite_master query  | BLOCK     |
| MG-005      | Migration    | Trigger inventory.                                      | Append-only and accepted-evidence triggers exist.                       | sqlite_master query  | BLOCK     |
| MG-006      | Migration    | Foreign keys enabled and valid.                         | PRAGMA foreign_keys=1; no FK violations.                                | PRAGMA proof         | BLOCK     |
| MG-007      | Migration    | One BMR per venture unique constraint.                  | Second BMR insert conflicts.                                            | DB constraint        | BLOCK     |
| MG-008      | Migration    | Session/client key uniqueness.                          | Duplicate key conflicts safely.                                         | DB constraint        | BLOCK     |
| HT-001      | HTTP         | GET /health.                                            | 200 canonical JSON with service, environment, timestamp, correlation.   | HTTP response        | BLOCK     |
| HT-002      | HTTP         | GET /ready with valid DB/schema.                        | 200; db=true; current\>=required.                                       | HTTP + DB            | BLOCK     |
| HT-003      | HTTP         | GET /ready without DB.                                  | 503 canonical error; no raw exception.                                  | HTTP response        | BLOCK     |
| HT-004      | HTTP         | Schema version route.                                   | Current/required IDs correct and safe.                                  | HTTP + ledger        | BLOCK     |
| HT-005      | HTTP         | Unknown route/action.                                   | 404/400 canonical JSON; no mutation.                                    | HTTP + DB counts     | BLOCK     |
| HT-006      | HTTP         | Unsupported method.                                     | 405/400 safe error.                                                     | HTTP response        | BLOCK     |
| HT-007      | HTTP         | Invalid JSON.                                           | 400 GV_REQ_BODY_INVALID.                                                | HTTP response        | BLOCK     |
| HT-008      | HTTP         | Unsupported content type.                               | 415\.                                                                   | HTTP response        | BLOCK     |
| HT-009      | HTTP         | Oversized payload.                                      | 413 before domain write.                                                | HTTP + DB counts     | BLOCK     |
| HT-010      | HTTP         | Correlation header missing/invalid.                     | Server generates valid corr\_ ID and returns it.                        | HTTP response        | BLOCK     |
| HT-011      | HTTP         | Environment headers.                                    | QA response says qa; Production policy says production.                 | HTTP response        | BLOCK     |
| SC-001      | Security     | Approved QA origin.                                     | Correct allow-origin and Vary header.                                   | HTTP headers         | BLOCK     |
| SC-002      | Security     | Unapproved origin.                                      | No allow-origin grant.                                                  | HTTP headers         | BLOCK     |
| SC-003      | Security     | OPTIONS request.                                        | No domain/DB mutation; approved headers only.                           | HTTP + DB counts     | BLOCK     |
| ID-001      | Identity     | Create session.                                         | One session row; canonical response.                                    | HTTP + DB            | BLOCK     |
| ID-002      | Identity     | Replay create session same key/fingerprint.             | Same session; one row; replay metadata.                                 | HTTP + DB counts     | BLOCK     |
| ID-003      | Identity     | Reuse key with changed session payload.                 | 409 mismatch; no new row.                                               | HTTP + DB counts     | BLOCK     |
| ID-004      | Identity     | Get existing/unknown session.                           | 200 committed state / 404 safe error.                                   | HTTP + DB            | BLOCK     |
| IP-001      | Idempotency  | Journey event same event_key twice.                     | One event row.                                                          | HTTP + DB count      | BLOCK     |
| IP-002      | Idempotency  | Journey event key changed fingerprint.                  | 409; row unchanged.                                                     | HTTP + DB            | BLOCK     |

## 12.3 Additional builder-level tests

| **Test ID** | **Category**       | **Scenario**                                                                                     | **Expected result**                                                       | **Level** |
|-------------|--------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------|
| BLD-001     | Retrieval          | Every edited critical file was read from the actual branch or proven missing before replacement. | Evidence includes pre-build hash/content reference; no fabricated source. | BLOCK     |
| BLD-002     | Preservation       | Existing Production entry hashes match baseline after Day 1 change.                              | No unapproved Production diff.                                            | BLOCK     |
| BLD-003     | Import graph       | worker/day1.js and all required module imports resolve in a clean checkout.                      | No missing/case-sensitive path issue.                                     | BLOCK     |
| BLD-004     | Script integrity   | Every Day 1 npm script exits nonzero when a controlled failure is introduced.                    | No always-green script.                                                   | BLOCK     |
| BLD-005     | Evidence integrity | Evidence manifest references the exact commit/deployment/database/schema under test.             | No stale or mixed-candidate evidence.                                     | BLOCK     |
| BLD-006     | Source scan        | No secret-like values, Production D1 ID in QA block, raw token, or real fixture PII.             | Repository and evidence scan clean.                                       | BLOCK     |

## 12.4 Test report contract

``` json
{
"suite": "galvivault-p0-day1",
"candidate_commit": "<sha>",
"environment": "local | qa",
"worker_deployment": "<id-or-null>",
"schema_version": "0001",
"started_at": "<utc>",
"completed_at": "<utc>",
"summary": {
"total": 0,
"passed": 0,
"failed": 0,
"skipped": 0
},
"blocking_failures": [],
"tests": [
{
"id": "ST-001",
"status": "pass",
"duration_ms": 0,
"correlation_id": null,
"canonical_ids": [],
"evidence": "<safe-reference>"
}
]
}
```

> **Automated QA PASS**
>
> Every applicable Day 1 BLOCK test and builder-level BLOCK test has executed and passed; mandatory skipped count is zero; the test report identifies the exact candidate; database proof agrees with API results; no manual repair was used.

# 13. Local, QA Deployment, and Smoke-Test Runbook

## 13.1 Clean-checkout local sequence

``` markdown
# From a clean checkout of the reviewed QA branch:
node --version
npm --version
npx wrangler --version
npm ci
npm run verify:day1-files
npm run verify:migration
npm run test:day1
# Start the local Day 1 Worker using the repository's approved local D1
workflow:
npm run dev:day1
# In a separate shell, target the explicit local URL:
DAY1_BASE_URL="<local-worker-url>" npm run smoke:day1
```

## 13.2 Local gate

- All imports resolve on the repository’s case-sensitive CI/runtime path.

- The migration builds a clean D1 state from repository files only.

- All BLOCK tests pass and no required test is skipped.

- The local smoke produces canonical JSON and D1 proof.

- The deliberate missing-binding/readiness failure produces 503 JSON without raw internals.

- The deliberate idempotency mismatch produces 409 and no additional rows.

- No Production endpoint or resource is invoked by the local test.

## 13.3 QA migration sequence

> 1\. Confirm the deployed QA configuration points to the intended QA D1 database and worker/day1.js.
>
> 2\. Record the current QA D1 schema/ledger before applying 0001.
>
> 3\. Apply the migration using the pinned Wrangler command and explicit QA target.
>
> 4\. Capture the command, exit code, migration ledger, sqlite_master inventory, and verification queries.
>
> 5\. Do not mark the migration applied manually when a statement fails.
>
> 6\. Confirm the QA schema version is 0001 and the database is not the Production database.

## 13.4 QA deployment sequence

> 1\. Freeze the candidate commit. Ensure the working tree is clean.
>
> 2\. Run verify files, migration verification, test:day1, and existing regression tests on that commit.
>
> 3\. Deploy the QA Worker using deploy:day1:qa or the approved QA workflow. Record deployment ID and URL.
>
> 4\. Call /health, /ready, and /api/v1/schema-version. Validate environment headers and safe response content.
>
> 5\. Run DAY1_BASE_URL=\<QA_WORKER_URL\> npm run qa:smoke.
>
> 6\. Run prepared read-only D1 assertions for schema/session/event/idempotency/audit.
>
> 7\. Run allowed-origin and denied-origin checks.
>
> 8\. Run the Production baseline smoke and compare to the pre-build result.
>
> 9\. If any blocking checkpoint fails, stop. Roll QA Worker back to the prior working deployment and preserve evidence.

## 13.5 QA smoke expected sequence

| **Order** | **Action**                                | **Expected**                                          |
|-----------|-------------------------------------------|-------------------------------------------------------|
| 1         | GET /health                               | 200; qa; galvivault-p0; correlation; no secret/DB ID. |
| 2         | GET /ready                                | 200; DB true; schema \>= 0001.                        |
| 3         | GET /api/v1/schema-version                | Current=0001 or approved later; required=0001.        |
| 4         | Provision/load approved synthetic context | One repeatable fixture context; no real data.         |
| 5         | POST session first time                   | created; stable session ID; one row.                  |
| 6         | POST identical session                    | resumed/no_change/replay; same ID; still one row.     |
| 7         | GET session                               | Authoritative committed state.                        |
| 8         | POST journey event first time             | accepted; one event row.                              |
| 9         | POST identical event                      | no_change/replay; still one event row.                |
| 10        | POST changed event with same key          | 409; row unchanged.                                   |
| 11        | POST fixture result                       | Deterministic QA JSON.                                |
| 12        | Denied-origin call                        | No access-control grant.                              |
| 13        | Production smoke                          | Matches pre-Day-1 baseline.                           |

# 14. Day 1 Human E2E Procedure

Human E2E begins only after the automated QA gate passes. It verifies the intended QA path, visible response behavior, canonical D1 state, replay safety, and Production preservation. It is not a debugging session and must not include direct database repair.

## 14.1 Preconditions

- Exact candidate commit, QA Worker deployment, QA D1 database, environment, schema version, and fixture policy are recorded.

- Every applicable automated BLOCK test passes; mandatory skipped count is zero.

- The approved synthetic fixture/context and approved QA browser/client origin are ready.

- The QA client points to the exact QA Worker URL.

- The evidence folder and prepared D1 assertion sheet are ready.

- The starting QA rollback commit/deployment and current Production baseline are known.

- No tester will modify D1, browser local state, or expected values during the run.

## 14.2 Human E2E steps

| **Step** | **Tester action**                                                            | **Expected visible/API result**                                                      | **D1/evidence proof**                                         |
|----------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|---------------------------------------------------------------|
| H1.1     | Open the QA Worker health URL.                                               | 200 JSON; service galvivault-p0; environment qa; correlation; fixture mode expected. | Capture response and deployment identity.                     |
| H1.2     | Open readiness/schema-version.                                               | DB ready; current schema meets required; no secret/database ID.                      | schema_migrations query.                                      |
| H1.3     | From approved QA browser/client, create/resume a session using the test key. | Created response with session_id; no CORS error.                                     | One assessment_sessions row; event/audit/idempotency receipt. |
| H1.4     | Repeat the identical request.                                                | Resumed/no_change/idempotent replay; same session_id.                                | Still one session and no duplicate event outside contract.    |
| H1.5     | Write a journey event and repeat it.                                         | Accepted then no_change/replay.                                                      | One journey_events row by event_key.                          |
| H1.6     | Request the Day 1 fixture result.                                            | Deterministic fixture JSON in QA.                                                    | Fixture event if contracted; no Production state.             |
| H1.7     | Open current Production customer smoke path.                                 | Behavior matches pre-Day-1 baseline.                                                 | Production deployment/commit unchanged.                       |

## 14.3 Expanded operator instructions

| **Step**                   | **Detailed execution**                                                                                                                                                                  |
|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| H1.1 Health                | Open/call the exact QA health URL. Capture URL, timestamp, status, headers, body, correlation, deployment. Fail on HTML, blank body, wrong environment, secret/DB ID.                   |
| H1.2 Readiness/schema      | Open /ready and schema-version. Query schema_migrations independently. Fail if DB/schema is missing, wrong environment, or response claims readiness contrary to D1.                    |
| H1.3 Create session        | From approved origin, submit the synthetic session request with a unique Idempotency-Key. Capture response and IDs. Query D1 for exactly one session plus required event/audit/receipt. |
| H1.4 Replay session        | Submit byte/semantic-identical request with same key. Confirm same session ID and replay/no_change. Query row counts; fail on duplicate.                                                |
| H1.5 Event/replay          | Submit one journey event and identical replay. Confirm one event row. Optionally perform changed-fingerprint negative check after the positive step.                                    |
| H1.6 Fixture               | Request fixture result. Confirm deterministic shape, synthetic values, QA environment, no external calls, and no Production state.                                                      |
| H1.7 Production regression | Open current Production smoke path. Confirm same commit/deployment/behavior baseline and that Production was not redirected to day1.js.                                                 |

## 14.4 Human E2E database assertion sheet

``` sql
-- Replace only synthetic canonical IDs from the run.
SELECT migration_id, name, environment, applied_at
FROM schema_migrations
ORDER BY migration_id;
SELECT COUNT(*) AS session_count
FROM assessment_sessions
WHERE session_id = '<SESSION_ID>';
SELECT session_id, bmr_id, venture_id, founder_id, source,
current_stage, status,
created_at, updated_at
FROM assessment_sessions
WHERE session_id = '<SESSION_ID>';
SELECT COUNT(*) AS event_count
FROM journey_events
WHERE event_key = '<EVENT_KEY>';
SELECT journey_event_id, event_key, session_id, event_name, product,
current_stage, correlation_id, environment, occurred_at
FROM journey_events
WHERE event_key = '<EVENT_KEY>';
SELECT scope, idempotency_key, request_fingerprint, response_status,
response_entity_type, response_entity_id, created_at
FROM idempotency_keys
WHERE idempotency_key IN ('<SESSION_KEY>',
'<EVENT_KEY_OR_IDEMPOTENCY_KEY>');
SELECT entity_type, entity_id, operation, actor_type, source,
correlation_id, environment, occurred_at
FROM audit_log
WHERE correlation_id IN ('<CORRELATION_1>', '<CORRELATION_2>')
ORDER BY occurred_at;
SELECT application_error_id, correlation_id, error_code, safe_message,
retryable, created_at
FROM application_errors
WHERE correlation_id = '<FAILURE_CORRELATION_ID>';
```

## 14.5 Human E2E failure rules

- Fail when any visible/API result disagrees with D1 state.

- Fail when the same session/event creates an unintended duplicate.

- Fail when an error returns HTML, blank body, raw SQL, stack trace, secret, or unsafe payload.

- Fail when QA claims ready but schema/binding is not ready.

- Fail when a denied origin receives an access-control grant.

- Fail when fixture behavior is available under Production policy.

- Fail when Production behavior or entry point changed.

- Fail when manual D1/browser repair is needed.

- A rerun after a code fix is a new run ID and must rerun the affected automated suite and complete Human E2E.

> **Day 1 Human E2E PASS**
>
> All H1.1–H1.7 steps complete without manual repair; session and event replay do not duplicate; QA headers/configuration/schema are correct; D1 evidence agrees with API results; fixture behavior is QA-only; and the current Production path remains unchanged.

# 15. Acceptance Gate, Rollback, and Final Codex Handoff

## 15.1 Day 1 acceptance gate

| **Gate**       | **Pass condition**                                                                                                         |
|----------------|----------------------------------------------------------------------------------------------------------------------------|
| Required files | Every Day 1 required path in Section 6 exists in the QA branch at the reviewed commit.                                     |
| Entrypoint     | wrangler.json resolves the QA Worker to worker/day1.js without changing the Production deployment.                         |
| Configuration  | Environment and DB binding names are correct; no secrets or Production database IDs are exposed in inappropriate contexts. |
| Migration      | 0001_canonical_business_medical_record.sql applies cleanly and creates the contracted foundation.                          |
| Tests          | npm test / Day 1 commands pass with no hidden skips or changed expectations.                                               |
| Evidence       | Release-evidence/day1 contains the minimum artifacts and exact commands/results.                                           |
| Regression     | Existing Production flow and production entry files remain unchanged from the pre-Day-1 baseline.                          |

## 15.2 Complete Day 1 GO checklist

| **\#** | **GO requirement**                                                                 | **Status/evidence**          |
|--------|------------------------------------------------------------------------------------|------------------------------|
| 1      | Starting repository/Production/QA baseline recorded.                               | PASS \| FAIL \| evidence ref |
| 2      | All canonical and support files exist at exact paths.                              | PASS \| FAIL \| evidence ref |
| 3      | worker/day1.js is the QA entry and Production entry is preserved.                  | PASS \| FAIL \| evidence ref |
| 4      | package.json scripts execute from a clean checkout.                                | PASS \| FAIL \| evidence ref |
| 5      | wrangler.json is valid and QA/Production resources are isolated.                   | PASS \| FAIL \| evidence ref |
| 6      | No secrets or inappropriate Production database identifiers are committed/exposed. | PASS \| FAIL \| evidence ref |
| 7      | 0001 applies cleanly and full schema/integrity verification passes.                | PASS \| FAIL \| evidence ref |
| 8      | Health, readiness, and schema-version routes pass.                                 | PASS \| FAIL \| evidence ref |
| 9      | Session first write, identical replay, get, and D1 row-count proof pass.           | PASS \| FAIL \| evidence ref |
| 10     | Journey-event first write, replay, mismatch, and D1 proof pass.                    | PASS \| FAIL \| evidence ref |
| 11     | Fixture determinism and Production guard pass.                                     | PASS \| FAIL \| evidence ref |
| 12     | CORS allowed/denied-origin behavior passes.                                        | PASS \| FAIL \| evidence ref |
| 13     | Missing binding/outdated schema/invalid request errors are safe and non-mutating.  | PASS \| FAIL \| evidence ref |
| 14     | All Day 1 BLOCK tests pass; skipped count zero.                                    | PASS \| FAIL \| evidence ref |
| 15     | Human E2E H1.1–H1.7 passes.                                                        | PASS \| FAIL \| evidence ref |
| 16     | Production baseline regression passes.                                             | PASS \| FAIL \| evidence ref |
| 17     | Release evidence and rollback are complete and identify the exact candidate.       | PASS \| FAIL \| evidence ref |

## 15.3 Rollback strategy

Day 1 does not promote to Production. Rollback primarily restores the prior QA Worker deployment/configuration and preserves the additive QA schema for diagnosis. Never drop canonical tables merely to simulate an application rollback.

> 1\. Declare STOP or ROLLBACK and record the failed checkpoint/correlation/test ID.
>
> 2\. Stop further QA writes or disable the affected QA route when necessary.
>
> 3\. Redeploy the recorded prior working QA commit/deployment and restore prior QA routing/configuration.
>
> 4\. Do not point QA to Production resources and do not change Production.
>
> 5\. Leave additive migration objects in place unless the QA database is an explicitly disposable clean-test database. For shared QA, use a forward correction rather than destructive down migration.
>
> 6\. Run /health, /ready for the restored version as applicable, and the baseline QA smoke.
>
> 7\. Run the current Production smoke and confirm it remains unchanged.
>
> 8\. Capture rollback commands, deployment, schema state, verification, owner, timestamp, and next action in rollback.md.

## 15.4 Codex final implementation report

``` text
GALVIVAULT DAY 1 IMPLEMENTATION REPORT
Repository:
Branch:
Starting commit:
Final candidate commit:
Files created:
Files replaced/modified:
Files explicitly preserved:
QA Worker:
QA deployment ID:
QA D1:
Schema version:
Production baseline commit/deployment:
Commands executed:
1.
2.
Automated QA:
- Total:
- Passed:
- Failed:
- Skipped:
- Blocking failures:
Database proof:
- Schema migration:
- Session count / ID:
- Journey event count / key:
- Idempotency receipts:
- Audit/event proof:
- Integrity/duplicate/orphan checks:
Human E2E:
- Run ID:
- H1.1–H1.7 result:
- Evidence path:
- Production regression:
Open defects:
- Blocking:
- Non-blocking:
Rollback point:
Rollback verified:
FINAL DECISION:
DAY 1 HUMAN E2E PASS → DAY 1 BUILD FINAL
OR
DAY 1 STOP — <blocking reason>
OR
DAY 1 ROLLBACK — <reason and restored baseline>
```

## 15.5 Declaration discipline

- Do not state PASS because files were written, a deployment workflow is green, or /health returns 200.

- Do not state PASS when D1 assertions, idempotency, readiness, Production regression, evidence, or Human E2E are incomplete.

- Do not hide a blocking defect as a known issue.

- If evidence is incomplete, state the exact incomplete gate and the current safe status.

- The exact PASS declaration is reserved for the complete gate: DAY 1 HUMAN E2E PASS → DAY 1 BUILD FINAL.

# Appendix A — Full Baseline SQL Migration

The following is the authoritative baseline schema extracted from the Version 0.5 implementation guide. Codex may adjust comments/formatting and the environment-specific migration-ledger execution mechanism, but may not remove contracted tables, keys, relationships, constraints, indexes, or protections without an approved data-change decision.

``` sql
-- migrations/day1/0001_canonical_business_medical_record.sql
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS schema_migrations (
migration_id TEXT PRIMARY KEY,
name TEXT NOT NULL,
checksum TEXT,
applied_at TEXT NOT NULL,
applied_by TEXT NOT NULL,
environment TEXT NOT NULL CHECK (environment IN
('local','qa','production'))
);
CREATE TABLE IF NOT EXISTS founders (
founder_id TEXT PRIMARY KEY,
normalized_email TEXT UNIQUE,
email TEXT,
first_name TEXT,
last_name TEXT,
phone TEXT,
linkedin_url TEXT,
consent_status TEXT NOT NULL DEFAULT 'unknown'
CHECK (consent_status IN
('unknown','requested','approved','declined','withdrawn')),
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active','inactive','archived')),
record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
archived_at TEXT
);
CREATE TABLE IF NOT EXISTS ventures (
venture_id TEXT PRIMARY KEY,
venture_name TEXT NOT NULL,
website TEXT,
industry TEXT,
stage TEXT,
revenue_range TEXT,
profile_json TEXT,
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active','inactive','archived')),
record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
archived_at TEXT
);
CREATE TABLE IF NOT EXISTS founder_venture_roles (
founder_id TEXT NOT NULL,
venture_id TEXT NOT NULL,
role_code TEXT NOT NULL DEFAULT 'founder',
is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active','inactive','archived')),
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
PRIMARY KEY (founder_id, venture_id, role_code),
FOREIGN KEY (founder_id) REFERENCES founders(founder_id) ON DELETE
RESTRICT,
FOREIGN KEY (venture_id) REFERENCES ventures(venture_id) ON DELETE
RESTRICT
);
CREATE TABLE IF NOT EXISTS business_medical_records (
bmr_id TEXT PRIMARY KEY,
venture_id TEXT NOT NULL UNIQUE,
status TEXT NOT NULL DEFAULT 'created'
CHECK (status IN (
'created','active','assessment_in_progress','under_review',
'treatment_active','monitoring','closed','archived'
)),
record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
current_session_id TEXT,
opened_at TEXT NOT NULL,
closed_at TEXT,
archived_at TEXT,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
FOREIGN KEY (venture_id) REFERENCES ventures(venture_id) ON DELETE
RESTRICT
);
CREATE TABLE IF NOT EXISTS assessment_sessions (
session_id TEXT PRIMARY KEY,
bmr_id TEXT NOT NULL,
venture_id TEXT NOT NULL,
founder_id TEXT,
client_session_key TEXT UNIQUE,
source TEXT NOT NULL,
current_stage TEXT,
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN
('active','completed','abandoned','expired','archived')),
started_at TEXT NOT NULL,
completed_at TEXT,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT,
FOREIGN KEY (venture_id) REFERENCES ventures(venture_id) ON DELETE
RESTRICT,
FOREIGN KEY (founder_id) REFERENCES founders(founder_id) ON DELETE SET
NULL
);
CREATE TABLE IF NOT EXISTS question_definitions (
question_id TEXT NOT NULL,
question_version TEXT NOT NULL,
product TEXT NOT NULL,
dimension TEXT,
prompt TEXT NOT NULL,
response_type TEXT NOT NULL,
required_flag INTEGER NOT NULL DEFAULT 0 CHECK (required_flag IN (0,1)),
minimum_value REAL,
maximum_value REAL,
weight REAL,
score_direction TEXT,
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('draft','active','retired')),
effective_at TEXT,
retired_at TEXT,
created_at TEXT NOT NULL,
PRIMARY KEY (question_id, question_version)
);
CREATE TABLE IF NOT EXISTS assessment_answers (
answer_id TEXT PRIMARY KEY,
answer_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_answer_id TEXT,
bmr_id TEXT NOT NULL,
session_id TEXT NOT NULL,
question_id TEXT NOT NULL,
question_version TEXT NOT NULL,
raw_value_text TEXT,
raw_value_number REAL,
normalized_value_text TEXT,
normalized_value_number REAL,
confidence_effect REAL,
source TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'accepted'
CHECK (status IN ('draft','accepted','superseded','rejected')),
captured_at TEXT NOT NULL,
created_at TEXT NOT NULL,
UNIQUE (answer_group_id, version_no),
UNIQUE (session_id, question_id, version_no),
FOREIGN KEY (supersedes_answer_id) REFERENCES
assessment_answers(answer_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT,
FOREIGN KEY (session_id) REFERENCES assessment_sessions(session_id) ON
DELETE RESTRICT,
FOREIGN KEY (question_id, question_version)
REFERENCES question_definitions(question_id, question_version) ON DELETE
RESTRICT
);
CREATE TABLE IF NOT EXISTS evidence_items (
evidence_id TEXT PRIMARY KEY,
evidence_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_evidence_id TEXT,
bmr_id TEXT NOT NULL,
session_id TEXT,
source_type TEXT NOT NULL,
source_ref TEXT,
value_type TEXT NOT NULL
CHECK (value_type IN
('text','number','boolean','date','json','reference','file_reference')),
value_text TEXT,
value_number REAL,
value_boolean INTEGER CHECK (value_boolean IN (0,1)),
value_date TEXT,
value_json TEXT,
source_actor_type TEXT,
source_actor_id TEXT,
consent_status TEXT,
content_hash TEXT,
status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN
('draft','accepted','superseded','rejected','archived')),
captured_at TEXT NOT NULL,
created_at TEXT NOT NULL,
UNIQUE (evidence_group_id, version_no),
FOREIGN KEY (supersedes_evidence_id) REFERENCES
evidence_items(evidence_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT,
FOREIGN KEY (session_id) REFERENCES assessment_sessions(session_id) ON
DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS evidence_relationships (
relationship_id TEXT PRIMARY KEY,
from_evidence_id TEXT NOT NULL,
to_evidence_id TEXT NOT NULL,
relationship_type TEXT NOT NULL
CHECK (relationship_type IN
('corrects','duplicates','contradicts','contextualizes','derived_from')),
rationale TEXT,
created_at TEXT NOT NULL,
UNIQUE (from_evidence_id, to_evidence_id, relationship_type),
FOREIGN KEY (from_evidence_id) REFERENCES evidence_items(evidence_id) ON
DELETE RESTRICT,
FOREIGN KEY (to_evidence_id) REFERENCES evidence_items(evidence_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS observations (
observation_id TEXT PRIMARY KEY,
observation_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_observation_id TEXT,
bmr_id TEXT NOT NULL,
statement TEXT NOT NULL,
domain TEXT,
confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND
confidence <= 100)),
source_type TEXT NOT NULL,
source_version TEXT,
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('draft','active','superseded','rejected','archived')),
created_by_type TEXT NOT NULL,
created_by_id TEXT,
created_at TEXT NOT NULL,
UNIQUE (observation_group_id, version_no),
FOREIGN KEY (supersedes_observation_id) REFERENCES
observations(observation_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS observation_evidence (
observation_id TEXT NOT NULL,
evidence_id TEXT NOT NULL,
support_type TEXT NOT NULL DEFAULT 'supports'
CHECK (support_type IN ('supports','contradicts','contextualizes')),
created_at TEXT NOT NULL,
PRIMARY KEY (observation_id, evidence_id, support_type),
FOREIGN KEY (observation_id) REFERENCES observations(observation_id) ON
DELETE RESTRICT,
FOREIGN KEY (evidence_id) REFERENCES evidence_items(evidence_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS hypotheses (
hypothesis_id TEXT PRIMARY KEY,
hypothesis_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_hypothesis_id TEXT,
bmr_id TEXT NOT NULL,
statement TEXT NOT NULL,
domain TEXT,
confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND
confidence <= 100)),
uncertainty TEXT,
source_type TEXT NOT NULL,
source_version TEXT,
status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('draft','active','superseded','rejected','archived')),
created_by_type TEXT NOT NULL,
created_by_id TEXT,
created_at TEXT NOT NULL,
UNIQUE (hypothesis_group_id, version_no),
FOREIGN KEY (supersedes_hypothesis_id) REFERENCES
hypotheses(hypothesis_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS hypothesis_observations (
hypothesis_id TEXT NOT NULL,
observation_id TEXT NOT NULL,
relationship_type TEXT NOT NULL
CHECK (relationship_type IN
('supports','contradicts','contextualizes')),
created_at TEXT NOT NULL,
PRIMARY KEY (hypothesis_id, observation_id, relationship_type),
FOREIGN KEY (hypothesis_id) REFERENCES hypotheses(hypothesis_id) ON
DELETE RESTRICT,
FOREIGN KEY (observation_id) REFERENCES observations(observation_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS findings (
finding_id TEXT PRIMARY KEY,
finding_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_finding_id TEXT,
bmr_id TEXT NOT NULL,
finding_code TEXT NOT NULL,
domain TEXT,
headline TEXT,
statement TEXT NOT NULL,
confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND
confidence <= 100)),
confidence_band TEXT
CHECK (confidence_band IS NULL OR confidence_band IN
('low','medium','high','very_high')),
confirmation_status TEXT NOT NULL DEFAULT 'unconfirmed'
CHECK (confirmation_status IN
('unconfirmed','confirmed','rejected','needs_review')),
source_type TEXT NOT NULL,
source_version TEXT,
status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('draft','active','superseded','rejected','archived')),
created_by_type TEXT NOT NULL,
created_by_id TEXT,
created_at TEXT NOT NULL,
UNIQUE (finding_group_id, version_no),
FOREIGN KEY (supersedes_finding_id) REFERENCES findings(finding_id) ON
DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS finding_evidence (
finding_id TEXT NOT NULL,
evidence_id TEXT NOT NULL,
support_type TEXT NOT NULL DEFAULT 'supports'
CHECK (support_type IN ('supports','contradicts','contextualizes')),
weight REAL,
created_at TEXT NOT NULL,
PRIMARY KEY (finding_id, evidence_id, support_type),
FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE
RESTRICT,
FOREIGN KEY (evidence_id) REFERENCES evidence_items(evidence_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS finding_observations (
finding_id TEXT NOT NULL,
observation_id TEXT NOT NULL,
support_type TEXT NOT NULL DEFAULT 'supports'
CHECK (support_type IN ('supports','contradicts','contextualizes')),
created_at TEXT NOT NULL,
PRIMARY KEY (finding_id, observation_id, support_type),
FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE
RESTRICT,
FOREIGN KEY (observation_id) REFERENCES observations(observation_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS finding_hypotheses (
finding_id TEXT NOT NULL,
hypothesis_id TEXT NOT NULL,
relationship_type TEXT NOT NULL DEFAULT 'derived_from'
CHECK (relationship_type IN ('derived_from','supports','rejects')),
created_at TEXT NOT NULL,
PRIMARY KEY (finding_id, hypothesis_id, relationship_type),
FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE
RESTRICT,
FOREIGN KEY (hypothesis_id) REFERENCES hypotheses(hypothesis_id) ON
DELETE RESTRICT
);
```

``` sql
CREATE TABLE IF NOT EXISTS recommendations (
recommendation_id TEXT PRIMARY KEY,
recommendation_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_recommendation_id TEXT,
bmr_id TEXT NOT NULL,
recommendation_code TEXT NOT NULL,
title TEXT NOT NULL,
action_text TEXT NOT NULL,
rationale TEXT,
priority INTEGER,
source_type TEXT NOT NULL,
source_version TEXT,
status TEXT NOT NULL DEFAULT 'proposed'
CHECK (status IN
('proposed','approved','declined','superseded','completed','archived')),
created_by_type TEXT NOT NULL,
created_by_id TEXT,
created_at TEXT NOT NULL,
UNIQUE (recommendation_group_id, version_no),
FOREIGN KEY (supersedes_recommendation_id) REFERENCES
recommendations(recommendation_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS recommendation_findings (
recommendation_id TEXT NOT NULL,
finding_id TEXT NOT NULL,
relationship_type TEXT NOT NULL DEFAULT 'addresses'
CHECK (relationship_type IN ('addresses','mitigates','monitors')),
created_at TEXT NOT NULL,
PRIMARY KEY (recommendation_id, finding_id, relationship_type),
FOREIGN KEY (recommendation_id) REFERENCES
recommendations(recommendation_id) ON DELETE RESTRICT,
FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE
RESTRICT
);
CREATE TABLE IF NOT EXISTS treatment_plans (
treatment_plan_id TEXT PRIMARY KEY,
treatment_plan_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
supersedes_treatment_plan_id TEXT,
bmr_id TEXT NOT NULL,
treatment_code TEXT NOT NULL,
title TEXT NOT NULL,
objective TEXT NOT NULL,
owner_actor_type TEXT,
owner_actor_id TEXT,
start_date TEXT,
target_end_date TEXT,
status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN
('draft','approved','active','paused','completed','cancelled','superseded','archived')),
created_by_type TEXT NOT NULL,
created_by_id TEXT,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
UNIQUE (treatment_plan_group_id, version_no),
FOREIGN KEY (supersedes_treatment_plan_id) REFERENCES
treatment_plans(treatment_plan_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS treatment_plan_items (
treatment_plan_item_id TEXT PRIMARY KEY,
treatment_plan_id TEXT NOT NULL,
sequence_no INTEGER NOT NULL,
action_code TEXT,
description TEXT NOT NULL,
owner_actor_type TEXT,
owner_actor_id TEXT,
target_date TEXT,
status TEXT NOT NULL DEFAULT 'planned'
CHECK (status IN
('planned','in_progress','blocked','completed','cancelled')),
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
UNIQUE (treatment_plan_id, sequence_no),
FOREIGN KEY (treatment_plan_id) REFERENCES
treatment_plans(treatment_plan_id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS treatment_events (
treatment_event_id TEXT PRIMARY KEY,
treatment_plan_id TEXT NOT NULL,
bmr_id TEXT NOT NULL,
event_type TEXT NOT NULL,
occurred_at TEXT NOT NULL,
actor_type TEXT NOT NULL,
actor_id TEXT,
notes TEXT,
metadata_json TEXT,
created_at TEXT NOT NULL,
FOREIGN KEY (treatment_plan_id) REFERENCES
treatment_plans(treatment_plan_id) ON DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS outcomes (
outcome_id TEXT PRIMARY KEY,
outcome_group_id TEXT NOT NULL,
version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
supersedes_outcome_id TEXT,
bmr_id TEXT NOT NULL,
treatment_plan_id TEXT,
recommendation_id TEXT,
outcome_code TEXT NOT NULL,
outcome_type TEXT NOT NULL,
value_text TEXT,
value_number REAL,
value_boolean INTEGER CHECK (value_boolean IN (0,1)),
observed_at TEXT NOT NULL,
source_type TEXT NOT NULL,
source_ref TEXT,
status TEXT NOT NULL DEFAULT 'observed'
CHECK (status IN
('observed','confirmed','rejected','superseded','archived')),
created_by_type TEXT NOT NULL,
created_by_id TEXT,
created_at TEXT NOT NULL,
UNIQUE (outcome_group_id, version_no),
FOREIGN KEY (supersedes_outcome_id) REFERENCES outcomes(outcome_id) ON
DELETE RESTRICT,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT,
FOREIGN KEY (treatment_plan_id) REFERENCES
treatment_plans(treatment_plan_id) ON DELETE SET NULL,
FOREIGN KEY (recommendation_id) REFERENCES
recommendations(recommendation_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS outcome_evidence (
outcome_id TEXT NOT NULL,
evidence_id TEXT NOT NULL,
relationship_type TEXT NOT NULL DEFAULT 'supports'
CHECK (relationship_type IN ('supports','contradicts','documents')),
created_at TEXT NOT NULL,
PRIMARY KEY (outcome_id, evidence_id, relationship_type),
FOREIGN KEY (outcome_id) REFERENCES outcomes(outcome_id) ON DELETE
RESTRICT,
FOREIGN KEY (evidence_id) REFERENCES evidence_items(evidence_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS feedback (
feedback_id TEXT PRIMARY KEY,
bmr_id TEXT NOT NULL,
target_type TEXT NOT NULL,
target_id TEXT NOT NULL,
feedback_type TEXT NOT NULL
CHECK (feedback_type IN
('confirm','reject','correct','clarify','comment')),
disposition TEXT,
comment_text TEXT,
actor_type TEXT NOT NULL,
actor_id TEXT,
source TEXT NOT NULL,
created_at TEXT NOT NULL,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS learning_candidates (
learning_candidate_id TEXT PRIMARY KEY,
candidate_type TEXT NOT NULL,
title TEXT NOT NULL,
proposed_change_json TEXT NOT NULL,
source_bmr_ids_json TEXT,
rationale TEXT NOT NULL,
risk_summary TEXT,
status TEXT NOT NULL DEFAULT 'proposed'
CHECK (status IN
('proposed','under_review','approved','rejected','released','archived')),
proposed_by_type TEXT NOT NULL,
proposed_by_id TEXT,
reviewed_by_type TEXT,
reviewed_by_id TEXT,
reviewed_at TEXT,
release_version TEXT,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS knowledge_items (
knowledge_item_id TEXT PRIMARY KEY,
knowledge_code TEXT NOT NULL,
knowledge_type TEXT NOT NULL,
version_no INTEGER NOT NULL CHECK (version_no >= 1),
content_json TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'draft'
CHECK (status IN ('draft','approved','active','retired','archived')),
approved_by TEXT,
approved_at TEXT,
effective_at TEXT,
retired_at TEXT,
created_at TEXT NOT NULL,
UNIQUE (knowledge_code, version_no)
);
CREATE TABLE IF NOT EXISTS journey_events (
journey_event_id TEXT PRIMARY KEY,
event_key TEXT UNIQUE,
bmr_id TEXT,
session_id TEXT,
event_name TEXT NOT NULL,
product TEXT,
current_stage TEXT,
occurred_at TEXT NOT NULL,
actor_type TEXT,
actor_id TEXT,
metadata_json TEXT,
correlation_id TEXT NOT NULL,
environment TEXT NOT NULL CHECK (environment IN
('local','qa','production')),
created_at TEXT NOT NULL,
FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON
DELETE SET NULL,
FOREIGN KEY (session_id) REFERENCES assessment_sessions(session_id) ON
DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
audit_id TEXT PRIMARY KEY,
entity_type TEXT NOT NULL,
entity_id TEXT NOT NULL,
operation TEXT NOT NULL,
prior_version INTEGER,
new_version INTEGER,
actor_type TEXT NOT NULL,
actor_id TEXT,
source TEXT NOT NULL,
reason_code TEXT,
safe_change_json TEXT,
correlation_id TEXT NOT NULL,
environment TEXT NOT NULL CHECK (environment IN
('local','qa','production')),
occurred_at TEXT NOT NULL,
created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS idempotency_keys (
idempotency_id TEXT PRIMARY KEY,
scope TEXT NOT NULL,
idempotency_key TEXT NOT NULL,
request_fingerprint TEXT NOT NULL,
response_status INTEGER NOT NULL,
response_entity_type TEXT,
response_entity_id TEXT,
response_json TEXT,
created_at TEXT NOT NULL,
expires_at TEXT,
UNIQUE (scope, idempotency_key)
);
CREATE TABLE IF NOT EXISTS adapter_deliveries (
adapter_delivery_id TEXT PRIMARY KEY,
adapter_name TEXT NOT NULL,
event_type TEXT NOT NULL,
entity_type TEXT,
entity_id TEXT,
source_event_id TEXT,
status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN
('pending','attempting','delivered','failed','dead_letter','cancelled')),
attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
next_attempt_at TEXT,
external_id TEXT,
safe_error_code TEXT,
safe_error_message TEXT,
correlation_id TEXT NOT NULL,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
UNIQUE (adapter_name, source_event_id)
);
CREATE TABLE IF NOT EXISTS import_batches (
import_batch_id TEXT PRIMARY KEY,
source_type TEXT NOT NULL,
source_name TEXT NOT NULL,
source_checksum TEXT,
environment TEXT NOT NULL CHECK (environment IN
('local','qa','production')),
status TEXT NOT NULL DEFAULT 'open'
CHECK (status IN
('open','validating','importing','completed','completed_with_errors','failed','cancelled')),
expected_count INTEGER,
processed_count INTEGER NOT NULL DEFAULT 0,
imported_count INTEGER NOT NULL DEFAULT 0,
skipped_count INTEGER NOT NULL DEFAULT 0,
error_count INTEGER NOT NULL DEFAULT 0,
created_by TEXT NOT NULL,
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
completed_at TEXT
);
CREATE TABLE IF NOT EXISTS import_errors (
import_error_id TEXT PRIMARY KEY,
import_batch_id TEXT NOT NULL,
source_row_key TEXT,
field_name TEXT,
error_code TEXT NOT NULL,
safe_message TEXT NOT NULL,
quarantined_payload_json TEXT,
created_at TEXT NOT NULL,
FOREIGN KEY (import_batch_id) REFERENCES import_batches(import_batch_id)
ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS application_errors (
application_error_id TEXT PRIMARY KEY,
correlation_id TEXT NOT NULL,
environment TEXT NOT NULL CHECK (environment IN
('local','qa','production')),
route TEXT,
action TEXT,
error_code TEXT NOT NULL,
safe_message TEXT NOT NULL,
entity_type TEXT,
entity_id TEXT,
retryable INTEGER NOT NULL DEFAULT 0 CHECK (retryable IN (0,1)),
created_at TEXT NOT NULL
);
```

``` sql
CREATE INDEX IF NOT EXISTS idx_founders_status ON founders(status);
CREATE INDEX IF NOT EXISTS idx_ventures_status_stage ON ventures(status,
stage);
CREATE INDEX IF NOT EXISTS idx_roles_venture ON
founder_venture_roles(venture_id, status);
CREATE INDEX IF NOT EXISTS idx_bmr_status ON
business_medical_records(status);
CREATE INDEX IF NOT EXISTS idx_sessions_bmr ON
assessment_sessions(bmr_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_venture ON
assessment_sessions(venture_id, created_at);
CREATE INDEX IF NOT EXISTS idx_answers_session_question ON
assessment_answers(session_id, question_id, version_no);
CREATE INDEX IF NOT EXISTS idx_evidence_bmr_current ON
evidence_items(bmr_id, evidence_group_id, version_no);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON
evidence_items(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_observations_bmr ON observations(bmr_id,
status, created_at);
CREATE INDEX IF NOT EXISTS idx_hypotheses_bmr ON hypotheses(bmr_id,
status, created_at);
CREATE INDEX IF NOT EXISTS idx_findings_bmr ON findings(bmr_id, status,
confirmation_status, created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_bmr ON
recommendations(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_bmr ON
treatment_plans(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_treatment_events_plan ON
treatment_events(treatment_plan_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_outcomes_bmr ON outcomes(bmr_id,
observed_at);
CREATE INDEX IF NOT EXISTS idx_feedback_target ON feedback(target_type,
target_id, created_at);
CREATE INDEX IF NOT EXISTS idx_journey_session ON
journey_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_journey_bmr ON journey_events(bmr_id,
occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type,
entity_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON
audit_log(correlation_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_adapter_status ON
adapter_deliveries(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_import_errors_batch ON
import_errors(import_batch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_application_errors_correlation ON
application_errors(correlation_id, created_at);
CREATE TRIGGER IF NOT EXISTS trg_schema_migrations_no_update
BEFORE UPDATE ON schema_migrations
BEGIN
SELECT RAISE(ABORT, 'schema_migrations is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_schema_migrations_no_delete
BEFORE DELETE ON schema_migrations
BEGIN
SELECT RAISE(ABORT, 'schema_migrations is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_audit_log_no_update
BEFORE UPDATE ON audit_log
BEGIN
SELECT RAISE(ABORT, 'audit_log is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_audit_log_no_delete
BEFORE DELETE ON audit_log
BEGIN
SELECT RAISE(ABORT, 'audit_log is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_journey_events_no_update
BEFORE UPDATE ON journey_events
BEGIN
SELECT RAISE(ABORT, 'journey_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_journey_events_no_delete
BEFORE DELETE ON journey_events
BEGIN
SELECT RAISE(ABORT, 'journey_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_treatment_events_no_update
BEFORE UPDATE ON treatment_events
BEGIN
SELECT RAISE(ABORT, 'treatment_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_treatment_events_no_delete
BEFORE DELETE ON treatment_events
BEGIN
SELECT RAISE(ABORT, 'treatment_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_accepted_evidence_no_content_update
BEFORE UPDATE ON evidence_items
WHEN OLD.status = 'accepted'
BEGIN
SELECT RAISE(ABORT, 'accepted evidence is immutable; create a new
version');
END;
INSERT OR IGNORE INTO schema_migrations
(migration_id, name, checksum, applied_at, applied_by, environment)
VALUES
('0001', 'canonical_business_medical_record', NULL,
strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'wrangler', 'qa');
```

# Appendix B — D1 Verification Queries

Store these or equivalent read-only assertions in release-evidence/day1/database-assertions.sql and scripts/verify-migration.mjs.

``` sql
PRAGMA foreign_keys;
SELECT migration_id, name, environment, applied_at
FROM schema_migrations
ORDER BY migration_id;
SELECT name, type
FROM sqlite_master
WHERE type IN ('table','index','trigger','view')
ORDER BY type, name;
SELECT venture_id, COUNT(*) AS bmr_count
FROM business_medical_records
GROUP BY venture_id
HAVING COUNT(*) <> 1;
SELECT session_id, COUNT(*) AS row_count
FROM assessment_sessions
GROUP BY session_id
HAVING COUNT(*) <> 1;
SELECT e.evidence_id
FROM evidence_items e
LEFT JOIN business_medical_records b ON b.bmr_id = e.bmr_id
WHERE b.bmr_id IS NULL;
SELECT o.observation_id
FROM observations o
LEFT JOIN observation_evidence oe ON oe.observation_id =
o.observation_id
WHERE oe.observation_id IS NULL AND o.status IN ('active','draft');
SELECT f.finding_id
FROM findings f
LEFT JOIN finding_evidence fe ON fe.finding_id = f.finding_id
LEFT JOIN finding_observations fo ON fo.finding_id = f.finding_id
LEFT JOIN finding_hypotheses fh ON fh.finding_id = f.finding_id
WHERE fe.finding_id IS NULL AND fo.finding_id IS NULL AND fh.finding_id
IS NULL
AND f.status IN ('active','draft');
SELECT entity_type, entity_id, operation, correlation_id, occurred_at
FROM audit_log
ORDER BY occurred_at DESC
LIMIT 20;
```

## Appendix B.1 Additional Day 1 row-count queries

``` sql
SELECT COUNT(*) AS session_count
FROM assessment_sessions
WHERE session_id = '<DAY1_SESSION_ID>';
SELECT COUNT(*) AS event_count
FROM journey_events
WHERE event_key = '<DAY1_EVENT_KEY>';
SELECT COUNT(*) AS idempotency_receipt_count
FROM idempotency_keys
WHERE scope = '<EXPECTED_SCOPE>'
AND idempotency_key = '<EXPECTED_KEY>';
SELECT COUNT(*) AS audit_count
FROM audit_log
WHERE correlation_id = '<CORRELATION_ID>';
SELECT session_id, COUNT(*) AS duplicates
FROM assessment_sessions
GROUP BY session_id
HAVING COUNT(*) > 1;
SELECT event_key, COUNT(*) AS duplicates
FROM journey_events
WHERE event_key IS NOT NULL
GROUP BY event_key
HAVING COUNT(*) > 1;
```

# Appendix C — Canonical API Examples and Error Contract

## C.1 Health

``` bash
curl -i "<QA_BASE_URL>/health" -H "Origin: <APPROVED_QA_ORIGIN>" -H
"X-Correlation-Id: corr_day1_health_001"
Expect:
HTTP/2 200
Content-Type: application/json
X-GalviVault-Environment: qa
X-Correlation-Id: corr_day1_health_001
Body: canonical success envelope; service=galvivault-p0; no secrets or
database ID.
```

## C.2 Readiness

``` bash
curl -i "<QA_BASE_URL>/ready" -H "Origin: <APPROVED_QA_ORIGIN>"
Ready: HTTP 200, success=true, schema compatible.
Not ready: HTTP 503, success=false, safe GV_DB_* or GV_ENV_* error.
Never: HTML, raw SQLite error, stack trace, or blank body.
```

## C.3 Session create/replay

``` bash
curl -i -X POST "<QA_BASE_URL>/api/v1/sessions" -H "Origin:
<APPROVED_QA_ORIGIN>" -H "Content-Type: application/json" -H
"Idempotency-Key: day1-session-test-001" --data
@tests/fixtures/day1-session.json
Repeat the identical command:
- same session_id
- status resumed/no_change
- idempotent replay metadata
- exactly one D1 session row
```

## C.4 Journey event create/replay

``` bash
curl -i -X POST "<QA_BASE_URL>/api/v1/journey-events" -H "Origin:
<APPROVED_QA_ORIGIN>" -H "Content-Type: application/json" -H
"Idempotency-Key: day1-event-test-001" --data
@tests/fixtures/day1-event.json
Repeat identical:
- accepted/no_change replay
- one D1 event row
Change a material field with same key:
- HTTP 409
- code GV_IDEMPOTENCY_REUSE_MISMATCH
- no D1 mutation
```

## C.5 Fixture Production guard

``` text
QA policy:
POST /api/v1/fixtures/results -> deterministic synthetic JSON
Production policy:
POST /api/v1/fixtures/results -> 404 or 403 canonical error
No Production fixture state and no external calls.
```

# Appendix D — Release-Evidence Templates

## D.1 release-evidence/day1/README.md

``` markdown
# GalviVault P0 — Day 1 Release Evidence
## Candidate
- Repository:
- Branch:
- Commit:
- QA Worker/deployment:
- QA D1:
- Schema version:
- Timestamp:
## Objective
Preserve, replatform, and prove the isolated Worker + D1 foundation
without changing Production.
## Changes
- Created:
- Modified:
- Preserved:
## Automated QA
- Commands:
- Total/pass/fail/skip:
- Blocking failures:
- Report:
## Database proof
- Migration:
- Tables/indexes/triggers:
- Session:
- Event:
- Idempotency:
- Audit:
- Integrity:
## Human E2E
- Run ID:
- H1.1–H1.7:
- Evidence:
## Production regression
- Baseline:
- After Day 1:
- Result:
## Defects
- Blocking:
- Non-blocking:
## Rollback
- Prior commit/deployment:
- Procedure:
- Verification:
## Decision
GO | STOP | ROLLBACK
Final declaration:
```

## D.2 deployment-metadata.json

``` json
{
"repository": "mrgalvipro/galvitriage",
"branch": "qa-revamped-galvicare-0-5",
"commit_sha": "<sha>",
"worker_name": "<qa-worker>",
"worker_deployment_id": "<id>",
"worker_url": "<qa-url>",
"environment": "qa",
"d1_database_safe_reference": "<qa-d1>",
"schema_version": "0001",
"fixture_mode": true,
"compatibility_date": "<date>",
"deployed_at": "<utc>",
"deployed_by": "<actor/tool>",
"production_baseline_commit": "<sha>",
"production_baseline_deployment": "<id>"
}
```

## D.3 human-e2e.md

``` markdown
# Day 1 Human E2E
Run ID:
Candidate commit:
QA Worker/deployment:
QA D1/schema:
Tester:
Started/finished:
| Step | Result | HTTP/API evidence | D1 evidence | Screenshot/log ref |
|---|---|---|---|---|
| H1.1 | PASS/FAIL | | | |
| H1.2 | PASS/FAIL | | | |
| H1.3 | PASS/FAIL | | | |
| H1.4 | PASS/FAIL | | | |
| H1.5 | PASS/FAIL | | | |
| H1.6 | PASS/FAIL | | | |
| H1.7 | PASS/FAIL | | | |
Manual repair used: NO
Blocking defects:
Production regression:
Final result:
```

## D.4 rollback.md

``` markdown
# Day 1 Rollback
Starting QA commit:
Starting QA deployment:
Candidate commit/deployment:
Failure trigger:
Decision owner/time:
## Restore
1.
2.
3.
## D1 considerations
- Migration state:
- Additive objects retained:
- Disposable local/test DB reset, if applicable:
- No destructive shared-QA/Production down migration:
## Verification
- QA health:
- QA readiness:
- Baseline QA smoke:
- Production smoke:
- Evidence:
Result:
```

> **Builder file completion gate**
>
> This guide is sufficient for Codex to begin and complete Day 1 when Codex has authenticated access to the actual QA branch and Cloudflare QA resources. Values intentionally not embedded here—current file contents, commit SHAs, Worker/D1 IDs, approved origins, deployed URLs, and tool versions—must be retrieved from the repository/platform and recorded in evidence rather than guessed.
