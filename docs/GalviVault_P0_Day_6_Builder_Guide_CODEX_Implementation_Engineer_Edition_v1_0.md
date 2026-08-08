**GALVIVAULT™ P0**

Day 6 Builder Guide

Integration, Hardening & Release Rehearsal

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CURRENT BUILD STATUS — DAY 6 NOT YET STARTED</strong></p>
<p>Entry is conditional. Day 6 begins only from an evidenced Day 5 GO / known-good QA baseline. The current overall build checklist places Day 6 after the Day 4/5 contractual sequence; unresolved Day 4 or Day 5 blockers are a STOP condition, not work to defer into hardening.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 6 MISSION</strong></p>
<p>Prove the complete GalviVault P0 candidate is deterministic and recoverable under normal, duplicate, invalid, unauthorized, degraded, and recovery conditions; then assemble the exact evidence and Human E2E preflight needed for the Day 7 Production decision.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>NON-NEGOTIABLE RELEASE PRINCIPLE</strong></p>
<p>Day 6 is a hardening and proof day, not a feature-expansion day. Do not rewrite working Day 1–5 behavior, do not create a second Worker/D1 path, do not bypass failing tests, and do not use Production to discover whether the candidate works.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Prepared for GalviPro / GalviStudio \| August 2026

*Derivative execution companion to the authoritative Version 0.5 build contract. The source contract governs any conflict.*

# How Codex Must Use This Builder

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EXECUTION CONTRACT</strong></p>
<p>Codex should treat this file as the Day 6 implementation runbook: inspect first, reuse the existing canonical implementation, add only missing Day 6 hardening/evidence capability, execute gates in dependency order, and stop on the first unresolved blocking criterion. A narrative implementation report never substitutes for test, D1, deployment, rollback, or Human E2E evidence.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Priority** | **Instruction**                          | **What it means in practice**                                                                                                     |
|--------------|------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| P0           | Preserve the Day 1–5 known-good baseline | No speculative rewrites, no production-entry churn, no alternate canonical path.                                                  |
| P0           | Prove before promoting                   | All blocking automated matrix items pass on the exact candidate; mandatory skipped tests = 0.                                     |
| P0           | Keep Worker + D1 authority singular      | All canonical writes remain Worker-mediated; D1 remains the sole writable canonical store.                                        |
| P0           | Use QA for destructive/fault proof       | Missing DB, stale schema, adapter timeout, rollback/redeploy and other fault injection are QA-only.                               |
| P0           | Build evidence while testing             | Every command, commit, deployment, schema state, correlation ID, defect and rollback result is captured as it occurs.             |
| P1           | Prefer reuse over new files              | If equivalent Day 6 scripts/tests/evidence generators already exist, extend them rather than introduce redundant implementations. |

## Source Authority and Precedence

> • The authoritative source is the “GalviVault™ P0 \| Seven-Day Build, QA, and Production Readiness Implementation Guide”, Version 0.5, Parts I–IV / Sections 1–25.
>
> • Sections 15–19 govern Day 6 implementation and verification. Sections 20–23 govern the subsequent Production-readiness/cutover decision. Day 6 prepares that evidence; it does not perform uncontrolled Production promotion.
>
> • Where this builder supplies an implementation file name or script organization that the source contract does not prescribe, it is explicitly labeled a recommended Codex convention. Existing equivalent repository structures should be reused.
>
> • If the current repository state conflicts with an explicit contract invariant, Codex must surface the conflict and implement the smallest contract-compliant correction. It must not silently “normalize” the architecture.

## Day 6 Definition of Done

> ☐ All mandatory unit, repository integration, migration, API contract, lifecycle, security, idempotency, adapter and regression suites pass; mandatory skips = 0.
>
> ☐ Clean-database and upgrade-from-prior-state migration rehearsals pass on the exact candidate commit.
>
> ☐ Security/privacy controls pass for CORS, authentication, authorization, protected scope, secret handling, redaction, payload limits and safe errors.
>
> ☐ Failure and recovery proof passes for DB unavailable, stale schema, duplicate/idempotency conflict, invalid lifecycle/cross-scope, adapter failure, rollback and redeploy.
>
> ☐ BMR current/history/timeline retrieval is bounded and pagination/filters are enforced; oversized evidence/import payloads are rejected early.
>
> ☐ Targeted import reconciliation proves valid/duplicate/invalid handling and quarantine without silent coercion.
>
> ☐ The prior QA Worker deployment can be restored against the additive candidate schema, and the candidate can be redeployed with deterministic smoke recovery.
>
> ☐ No Blocker, Critical, or High defect remains in approved P0 scope.
>
> ☐ The Day 7 Human E2E runbook and clearly marked Production-safe test identity/fixture plan are complete and executable without undocumented repair.
>
> ☐ The draft release evidence package maps to one candidate commit, one QA deployment, one QA D1 state, one migration ledger and one rollback reference.

# Day 6 Execution Map

| **Section** | **Execution block**                                       |
|-------------|-----------------------------------------------------------|
| 1           | Day 6 mission, scope & guardrails                         |
| 2           | Entry gate and starting-baseline fingerprint              |
| 3           | Repository ownership & minimal Day 6 change set           |
| 4           | Critical-path execution sequence                          |
| 5           | Phase 0 — inspect, inventory & freeze the baseline        |
| 6           | Phase 1 — test manifest & static hardening                |
| 7           | Phase 2 — clean-database migration rehearsal              |
| 8           | Phase 3 — upgrade migration rehearsal                     |
| 9           | Phase 4 — full automated regression                       |
| 10          | Phase 5 — idempotency & concurrency proof                 |
| 11          | Phase 6 — security & privacy hardening                    |
| 12          | Phase 7 — performance & bounded-query proof               |
| 13          | Phase 8 — import reconciliation & quarantine              |
| 14          | Phase 9 — failure, recovery & Worker rollback rehearsal   |
| 15          | Phase 10 — existing Production baseline smoke             |
| 16          | Phase 11 — defect triage, remediation & retest discipline |
| 17          | Phase 12 — release-evidence generation                    |
| 18          | Phase 13 — Day 7 Human E2E preflight                      |
| 19          | Phase 14 — Day 6 acceptance gate & handoff                |
| A           | Automated QA matrix — Day 6 critical IDs                  |
| B           | Canonical D1 assertion catalog                            |
| C           | Recommended Day 6 evidence manifest                       |
| D           | Codex final implementation report template                |
| E           | Prohibited shortcuts / anti-regression rules              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FASTEST SAFE PATH</strong></p>
<p>Do not create new feature code first. Start by proving the existing Day 1–5 candidate. Most Day 6 work should be orchestration, regression coverage, fault harnesses, direct D1 assertions, evidence automation and small root-cause fixes discovered by those proofs.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Day 6 Mission, Scope & Guardrails

| **Day 6 dimension**  | **Binding outcome**                                                                                                                                |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary outcome      | Integrate, harden and rehearse the complete QA system.                                                                                             |
| Implementation scope | Full regression; security/privacy; performance/bounded queries; failure injection; import reconciliation; rollback rehearsal; evidence automation. |
| Daily stop/go result | All blocking suites pass; no critical/high defects; rollback and recovery are evidenced; Human E2E is ready.                                       |
| Repository ownership | Full regression/security/performance/failure/rollback scripts; evidence generator and release-candidate report.                                    |
| Production posture   | Production remains the existing baseline. Day 6 does not use Production for first-time feature, migration, failure or lifecycle testing.           |

## 1.1 Locked architectural invariants

> • Cloudflare Worker remains the sole runtime write authority.
>
> • Cloudflare D1 remains the sole writable canonical system of record for P0.
>
> • Exactly one active canonical Business Medical Record exists per venture; repeated valid requests cannot create a second BMR.
>
> • Accepted evidence is immutable. Corrections create new versions/relationships; prior accepted rows remain traceable.
>
> • Observations require evidence; findings require support; recommendations require findings; treatment requires authorized actor plus approved care context; outcomes require source and observed_at.
>
> • Material reasoning/care changes are versioned. Journey events, audit records and treatment events remain append-only.
>
> • Learning candidates cannot change active runtime knowledge until a governed release.
>
> • Adapter failures are non-authoritative: canonical state commits first and remains valid when HubSpot/analytics/notification delivery fails.
>
> • QA and Production are isolated across Worker deployment, D1 database, secrets, origins, fixture policy and release evidence.
>
> • Migrations are additive/forward-only for P0. Worker rollback must not depend on destructive down migrations.

## 1.2 Day 6 out-of-scope

> • New product features, new customer journeys, autonomous AI behavior, broad historical migration, enterprise IAM/SSO, multi-tenancy, or a new data store.
>
> • Rewriting Day 1–5 services merely to make tests easier.
>
> • Replacing existing production runtime/entry configuration before the controlled Day 7 release decision.
>
> • Deleting or mutating evidence, audit, journey or treatment history to “clean” test state.
>
> • Quarantining/skipping required tests to convert a failure into a pass.
>
> • Manual D1 repair that cannot be reproduced, reviewed, audited and safely repeated.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ENTRY DEPENDENCY</strong></p>
<p>Reasoning must be proven before care, care before integration hardening, and complete QA before Production. Any earlier-day test that was deferred becomes a blocking Day 6 item unless the Product Owner formally removes the corresponding scope from the authoritative contract.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 2. Entry Gate and Starting-Baseline Fingerprint

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 6 ENTRY GATE — STOP UNLESS ALL ARE TRUE</strong></p>
<p>The Day 5 governed care chain is evidenced; the QA branch is stable; the active QA deployment and D1 database are known; Day 1–5 mandatory tests have known results; a rollback deployment/commit exists; and there is no unresolved Blocker/Critical/High defect from Days 1–5.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 2.1 Required starting state

| **Check**  | **Required state**                                    | **Codex evidence**                        |
|------------|-------------------------------------------------------|-------------------------------------------|
| Branch     | qa-revamped-galvicare-0-5                             | git branch --show-current; commit SHA     |
| Repository | mrgalvipro/galvitriage                                | remote/repo identity recorded             |
| Day 5      | GO / known-good QA care-chain baseline                | Day 5 gate + test/evidence references     |
| QA Worker  | Current known-good deployment identified              | deployment name/ID/URL + commit           |
| QA D1      | Correct QA DB binding, schema ledger known            | binding/config + schema_migrations output |
| Production | Existing Production GalviCare baseline unchanged      | safe smoke reference; no Day 6 mutation   |
| Rollback   | Prior known-good Worker deployment/commit retrievable | deployment ID/commit                      |
| Defects    | No inherited untriaged blocker                        | defect register                           |

## 2.2 Baseline fingerprint — first Codex actions

> 1\. Confirm the repository and branch. If the branch is not qa-revamped-galvicare-0-5, STOP; do not create a replacement branch.
>
> 2\. Capture git status and the current commit SHA before touching files. A dirty working tree must be classified before implementation.
>
> 3\. Inventory package.json, lockfile state, wrangler configuration, Worker entries, migrations, tests, fixtures, scripts, docs and release-evidence directories.
>
> 4\. Record the QA Worker deployment identity and verify the D1 binding resolves to the QA database, not Production.
>
> 5\. Query schema_migrations and record the current ordered migration state.
>
> 6\. Run the narrowest known-good health/readiness smoke without changing canonical state.
>
> 7\. Locate the prior known-good Worker deployment and commit that will be used in rollback rehearsal.
>
> 8\. Review Day 1–5 gate records and defects. Convert any deferred required test or unresolved prior defect into the Day 6 blocking worklist.
>
> 9\. Write the Day 6 scope statement: hardening/evidence only unless a failing test exposes a necessary root-cause code fix.

## 2.3 Baseline command template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>COMMANDS ARE TEMPLATES, NOT A LICENSE TO BYPASS REPO SCRIPTS</strong></p>
<p>Codex must prefer scripts already declared in package.json and the repository. Add a Day 6 wrapper only when the behavior does not already exist. Do not invent generic Production deploy commands.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>git status --short<br />
git branch --show-current<br />
git rev-parse HEAD<br />
git log -1 --oneline<br />
node --version<br />
npm --version<br />
# inspect package.json scripts before running anything<br />
# inspect wrangler.json and Worker entry/bindings<br />
# capture schema_migrations from the QA D1 through the approved repo/Wrangler path</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 3. Repository Ownership & Minimal Day 6 Change Set

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>REUSE-FIRST RULE</strong></p>
<p>Day 6 should not introduce parallel business logic. Tests call the canonical routes/services; fault harnesses inject bounded failures; evidence scripts collect results. If the repository already contains equivalent Day 6 files, update those exact paths instead of duplicating them.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 3.1 Binding Day 6 ownership

> • Full regression orchestration and stable test-manifest validation.
>
> • Security/privacy test coverage and redaction/secret validation.
>
> • Performance and bounded-query tests for BMR current/history/timeline.
>
> • Failure-injection and recovery/rollback rehearsal tooling.
>
> • Import reconciliation/quarantine verification.
>
> • Evidence generation, manifest validation and release-candidate reporting.
>
> • Human E2E runbook preflight artifacts for Day 7.

## 3.2 Recommended Codex file convention (non-binding if equivalents exist)

| **Recommended path**               | **Purpose**                                                      | **Rule**                                                                        |
|------------------------------------|------------------------------------------------------------------|---------------------------------------------------------------------------------|
| scripts/day6-release-rehearsal.mjs | Orchestrate Day 6 stages in deterministic order.                 | Must stop non-zero on any blocking failure; no swallowed errors.                |
| tests/day6-hardening.test.mjs      | Day 6-specific recovery/security/performance/release assertions. | Do not duplicate prior-day feature tests; invoke/reuse them in full regression. |
| scripts/day6-evidence.mjs          | Build redacted evidence manifest from actual outputs.            | Must bind all artifacts to same commit/deployment/migration.                    |
| docs/operations/day7-human-e2e.md  | Executable Day 7 Human E2E runbook prepared on Day 6.            | No undocumented manual repair steps.                                            |
| release-evidence/day6/...          | Stable Day 6 proof artifacts.                                    | Names may follow existing repo convention; content requirements are binding.    |

## 3.3 Package-script recommendation

> • Inspect existing package.json scripts first. Reuse canonical test/migration/smoke commands when present.
>
> • If missing, Codex may add explicit QA-only aliases such as verify:day6, test:day6, qa:day6, and evidence:day6, provided they call real checks, target QA unambiguously and return a non-zero exit status on blocking failure.
>
> • Do not add dependencies merely for convenience when Node/Wrangler/current repo utilities are sufficient. If dependencies change, package-lock.json must match package.json and the change becomes part of candidate evidence.
>
> • Never add a generic deploy command that can ambiguously target Production.

## 3.4 Files Codex should not change without a demonstrated defect

> • Existing production entry files and production route configuration.
>
> • Day 1–5 migrations that have already been applied to shared QA. Corrections require a new ordered migration ID, never edits to applied SQL.
>
> • Canonical entity identity rules, one-BMR uniqueness, evidence immutability, version lineage or append-only triggers.
>
> • Existing GalviCare Production workflows and telemetry integrations not directly required to fix a proven Day 6 regression.

# 4. Critical-Path Execution Sequence

| **Order** | **Gate**             | **Primary action**                                                                      | **Exit condition**                                            |
|-----------|----------------------|-----------------------------------------------------------------------------------------|---------------------------------------------------------------|
| 0         | Entry                | Fingerprint branch, commit, QA deployment, QA D1, prior rollback and inherited defects. | Known-good Day 5 baseline or STOP.                            |
| 1         | Static               | Validate files/imports/config/test manifest/secret patterns.                            | ST-009/ST-010 and inherited static checks pass.               |
| 2         | Migration-clean      | Build fresh disposable DB from repository migrations.                                   | Ledger/schema/constraints/triggers/readiness pass.            |
| 3         | Migration-upgrade    | Upgrade prior known-good fixture/schema to exact candidate.                             | Existing records readable; constraints valid.                 |
| 4         | Full regression      | Run unit → repository → API/security → integrated QA suites.                            | All blocking matrix tests pass; skips=0.                      |
| 5         | Security/perf/import | Run full Day 6 negative, bounded-query and reconciliation suites.                       | No high-risk failure; no partial/cross-scope state.           |
| 6         | Failure/recovery     | Perform exact QA fault + rollback/redeploy rehearsal.                                   | Prior deployment works; candidate recovers deterministically. |
| 7         | Prod baseline smoke  | Run only the established safe Production GalviCare smoke.                               | No Day 6 regression; no new Production functionality tested.  |
| 8         | Evidence             | Generate/validate evidence manifest and defect register.                                | All artifacts map to candidate/deployment/migration.          |
| 9         | Human E2E preflight  | Validate runbook, F12 test identity plan, D1 queries, rollback.                         | D6-06 pass.                                                   |
| 10        | Day 6 gate           | Evaluate D6-01 through D6-06 and universal gate.                                        | GO Day 7 or STOP in QA.                                       |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FAIL-FAST ORDER</strong></p>
<p>Static and migration failures are cheaper and more fundamental than remote QA failures. Do not deploy a candidate to QA until local/static and clean migration gates pass. Do not begin rollback rehearsal until the candidate is otherwise green enough to represent a real release candidate.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. Phase 0 — Inspect, Inventory & Freeze the Baseline

> 1\. Create a Day 6 work manifest containing branch, starting commit, intended scope and source contract version.
>
> 2\. Enumerate changed files versus the Day 5 known-good commit. Classify each as Day 6 hardening/evidence, required root-cause fix, or out-of-scope change.
>
> 3\. Parse package.json and verify every intended script resolves to a real file/module. Record lockfile status.
>
> 4\. Parse wrangler.json using the installed Wrangler-compatible configuration shape. Confirm QA/Production environments remain objectively distinct.
>
> 5\. Inspect import graphs: Production entry must not import QA fixture modules; browser/adapter code must not expose direct D1 access.
>
> 6\. Scan migration IDs for uniqueness/order and identify exact minimum schema required by the candidate.
>
> 7\. Inventory the stable test IDs already represented in test files. Missing coverage is implementation work; missing mandatory coverage cannot be waived by report prose.
>
> 8\. Create/refresh the defect register with inherited open items and owners.
>
> 9\. Identify the prior Worker deployment/commit for rollback. Verify it remains addressable before proceeding.

## 5.1 Static STOP conditions

> • Wrong branch, wrong repository, wrong QA D1 binding, or Production entry accidentally targeted by QA config.
>
> • Uncommitted/unknown changes whose purpose cannot be reconciled to the Day 6 scope.
>
> • Duplicate migration IDs, modified applied migration content, unresolved imports or package scripts that always pass.
>
> • Required tests marked skip/only/todo/quarantine.
>
> • Secret/token/private-key values in tracked source, fixtures, logs or release evidence.
>
> • Production entry imports QA fixture logic or FIXTURE_MODE behavior is reachable in Production.

## 5.2 Static evidence

> ☐ repository tree / required-file inventory
>
> ☐ branch and commit SHA
>
> ☐ diff scope
>
> ☐ package and lockfile state
>
> ☐ Wrangler environment/binding assertions
>
> ☐ migration inventory
>
> ☐ test-manifest scan
>
> ☐ secret-pattern scan

# 6. Phase 1 — Test Manifest & Static Hardening

| **Stable ID** | **Day 6 required behavior**                                          | **Proof**                                | **Level** |
|---------------|----------------------------------------------------------------------|------------------------------------------|-----------|
| ST-009        | No required test is skip/only/todo; mandatory skipped count is zero. | Test-manifest scan                       | BLOCK     |
| ST-010        | Production entry cannot reach QA fixture module/policy.              | Import graph / configuration policy test | BLOCK     |
| RL-002        | Required failed=0 and mandatory skipped=0 for the candidate.         | Combined test summary                    | BLOCK     |

## 6.1 Test-manifest implementation behavior

> • Enumerate all test files that represent the Section 18 matrix, including prior-day tests. Day 6’s combined report must prove the full required behavior, not only files whose names contain “day6”.
>
> • Detect Node test skip/todo/only patterns and any repository-specific quarantine mechanism. Mandatory coverage may not be silently excluded.
>
> • If a test is flaky, classify it as a defect. Do not loop/re-run until green without root cause.
>
> • Associate stable matrix IDs with executable tests or generated report entries. Equivalent test organization is allowed, but each blocking behavior must have proof.
>
> • The orchestrator must propagate failure exit codes. A script that logs an error and exits 0 is itself a Day 6 defect.

## 6.2 Static security scan

> • Scan tracked source, fixtures, docs and evidence for token/secret/private-key patterns.
>
> • Ensure database identifiers, raw SQL errors, stack traces and sensitive evidence bodies are not copied into user-facing errors or release evidence.
>
> • Check Production fixture reachability by import graph and runtime policy, not filename assumption alone.
>
> • Confirm no new browser-to-D1 or adapter-to-D1 write path exists.

# 7. Phase 2 — Clean-Database Migration Rehearsal

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CLEAN DATABASE RULE</strong></p>
<p>The clean test database must be created from repository migrations only. Hand-building a schema that differs from migrations invalidates the rehearsal.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> 1\. Create a disposable local/ephemeral database with no Production data and no real secrets.
>
> 2\. Apply every repository migration in order from the baseline through the exact candidate state.
>
> 3\. Assert schema_migrations contains the expected ordered ledger and that readiness would recognize the candidate minimum schema.
>
> 4\. Inventory all contracted tables, indexes and triggers from sqlite_master / the approved D1 inspection path.
>
> 5\. Enable/verify foreign-key behavior in the test environment; confirm zero FK violations.
>
> 6\. Execute uniqueness/constraint tests, including one-BMR-per-venture and request/business-key protections.
>
> 7\. Execute append-only mutation rejection for journey_events, audit_log and treatment_events, plus accepted-evidence immutability.
>
> 8\. Apply the migration sequence a second time using the repository’s supported idempotent/ledger mechanism; verify there is no duplicate-object corruption and the ledger remains valid.
>
> 9\. Archive the transcript, ledger, inventory and assertion output under Day 6 evidence.

## 7.1 Migration matrix items to prove

| **ID**     | **Scenario**                                                                               | **Expected result**                                                                 | **Proof**              |
|------------|--------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|------------------------|
| MG-001…011 | Inherited baseline migration, inventories, constraints and append-only/immutability tests. | Remain green on candidate.                                                          | Migration + DB proof   |
| MG-012     | Upgrade prior fixture schema to candidate.                                                 | Existing records readable; constraints valid.                                       | Migration + regression |
| MG-013     | Readiness below minimum schema.                                                            | 503 with GV_DB_SCHEMA_OUTDATED; fail closed.                                        | HTTP + ledger          |
| MG-014     | Applied migration content/change control.                                                  | Applied content not silently edited; change uses new ID; commit/checksum evidenced. | Script/audit           |

## 7.2 Migration Definition of Done

> ☐ Clean local and clean QA-compatible database can be built from repository migrations only.
>
> ☐ One ordered ledger row per applied migration; no false ledger success on a failed migration.
>
> ☐ All contracted schema objects and integrity controls exist.
>
> ☐ FK, unique, version, append-only and accepted-evidence immutability tests pass.
>
> ☐ Migration transcript includes candidate commit/checksum context and verification results.
>
> ☐ No Production migration occurs on Day 6.

# 8. Phase 3 — Upgrade Migration Rehearsal

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>WHY THIS IS BLOCKING</strong></p>
<p>A clean install is not enough. Day 7 will encounter an existing Production schema state. Day 6 must prove the exact candidate can move forward from the prior released/known-good state without losing readable data or invalidating constraints.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> 1\. Create a disposable database representing the prior known-good schema/migration level. Populate it with the approved prior fixture state, not invented Production data.
>
> 2\. Capture pre-upgrade schema ledger, representative canonical IDs and row counts.
>
> 3\. Apply only the forward candidate migration set.
>
> 4\. Run the full schema/constraint verification against the upgraded database.
>
> 5\. Read the previously seeded founder, venture, BMR, sessions, evidence, reasoning and care records using the current repository retrieval path.
>
> 6\. Prove exactly one BMR per seeded venture and zero new duplicate canonical identities.
>
> 7\. Prove accepted evidence/version history and append-only events remain readable and unmodified.
>
> 8\. Run the prior-day known-good fixture suite against the upgraded database.
>
> 9\. Capture before/after ledger, record counts, representative IDs and regression results.
>
> 10\. If a compatibility defect is found, author a new additive migration/fix; never edit an already-applied migration to hide it.

## 8.1 Application rollback compatibility check

> • Identify which candidate schema changes are additive and what the prior Worker reads.
>
> • Before remote rollback rehearsal, test or reason explicitly whether the prior Worker can health/read its supported state against the candidate schema.
>
> • If the prior Worker cannot safely operate against the additive schema, the release plan must identify the compatibility boundary and Day 6 cannot claim rollback readiness until a contract-compliant solution exists.

# 9. Phase 4 — Full Automated Regression

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>MANDATORY EXECUTION ORDER</strong></p>
<p>Static repository/configuration → clean migration → unit/domain → repository integration → API contract/security → integrated QA Worker+D1 → failure/recovery/adapters → full regression + evidence-manifest validation. Only after all blocking automated tests pass may the Human E2E preflight be treated as release-ready.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 9.1 Full suite requirements

| **Suite**               | **Minimum Day 6 proof**                                                                                                      |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------|
| Static/repository       | Required files/imports/package scripts/Wrangler entry+bindings; migration IDs unique; no secret patterns; no required skips. |
| Migration               | Clean apply; second safe apply/ledger behavior; schema inventory; constraints/triggers; forward compatibility.               |
| Domain                  | Identity; BMR lifecycle; evidence versioning; lineage; recommendation/treatment/outcome/learning invariants.                 |
| API contract            | Routes/methods/envelopes/status+error codes/headers/content type/payload limit/pagination.                                   |
| Idempotency/concurrency | New request; identical replay; changed fingerprint conflict; duplicate business keys; webhook/import replay.                 |
| Security/privacy        | CORS allow/deny; authN/authZ; cross-BMR; operator-only; redaction; safe logs/errors; secret policy.                          |
| Adapters                | Forced failure and retry cannot roll back or mutate the canonical transaction.                                               |
| Regression              | All Day 1–5 known-good fixtures plus existing Production GalviCare baseline remain valid.                                    |

## 9.2 Candidate test-report contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"suite": "galvivault-p0",<br />
"candidate_commit": "&lt;exact-sha&gt;",<br />
"environment": "local | qa | production-safe",<br />
"worker_deployment": "&lt;qa-deployment-id-or-null&gt;",<br />
"schema_version": "&lt;exact-ledger-version&gt;",<br />
"started_at": "&lt;UTC&gt;",<br />
"completed_at": "&lt;UTC&gt;",<br />
"summary": {"total": 0, "passed": 0, "failed": 0, "skipped": 0},<br />
"blocking_failures": [],<br />
"tests": [<br />
{"id": "RC-001", "status": "pass", "duration_ms": 0,<br />
"correlation_id": "corr_...", "artifact": "&lt;path&gt;"}<br />
]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> • The report must reflect actual executed tests. Never prepopulate PASS.
>
> • If a blocking test is not implemented, it is not a pass; it becomes missing mandatory coverage and blocks D6-01.
>
> • Artifact references must resolve to evidence generated from the same candidate run.

## 9.3 Regression fixture catalog

| **Fixture**       | **State**                                         | **Primary use**                                              |
|-------------------|---------------------------------------------------|--------------------------------------------------------------|
| F00_EMPTY         | No records                                        | Migration/readiness/404 behavior                             |
| F01_NEW           | New founder + new venture, no BMR                 | Create identity/BMR/session                                  |
| F02_RETURN        | Existing founder/venture/BMR, prior session       | Resume/new session continuity                                |
| F03_MULTI_VENTURE | One founder, two ventures/BMRs                    | Scope and one-BMR-per-venture                                |
| F04_DUPLICATE     | Case/whitespace email + repeated idempotency keys | Normalization/duplicate protection                           |
| F05_CROSS_SCOPE   | Session/evidence IDs from different BMRs          | Boundary rejection                                           |
| F06_EVIDENCE      | Typed + accepted evidence                         | Value types, immutability, supersession                      |
| F07_REASONING     | Supported observation/hypothesis/finding          | Lineage/confidence/confirmation/history                      |
| F08_CARE          | Confirmed finding + approved recommendation       | Plan/events/outcomes                                         |
| F09_ADAPTER_FAIL  | Care action + forced adapter failure              | Non-blocking adapter behavior                                |
| F10_IMPORT        | Valid + duplicate + invalid rows                  | Idempotency/quarantine/reconciliation                        |
| F11_AUTH          | Public/operator/service/expired/wrong scope       | Auth matrix                                                  |
| F12_PROD_SAFE     | Minimum clearly marked release-test venture       | Day 7 controlled Production Human E2E; prepare only on Day 6 |

# 10. Phase 5 — Idempotency & Concurrency Proof

> 1\. For every mutating route, execute a brand-new valid request with a unique Idempotency-Key and capture committed IDs/versions/row counts.
>
> 2\. Replay the identical request with the same key. Require the same canonical entity/version and an idempotent replay indicator/equivalent status; no duplicate event, support link or receipt may appear.
>
> 3\. Reuse the same Idempotency-Key with a changed request fingerprint. Require HTTP 409 conflict and prove all canonical and append-only row counts remain unchanged.
>
> 4\. Test business-key uniqueness independently of the HTTP idempotency key so a new key cannot create a second BMR for the same venture or duplicate provider/source event.
>
> 5\. Exercise import row replay and webhook/source-event replay where implemented; duplicates must be recognized deterministically.
>
> 6\. Where concurrency simulation is feasible in the existing harness, issue competing create/update attempts and require database uniqueness/version checks to select one valid state rather than partial/duplicate state.

## 10.1 Required no-partial-write assertions

> ☐ No extra founder, venture, BMR, session or idempotency receipt outside the explicit append-only model.
>
> ☐ No duplicate lineage/support row from a replay.
>
> ☐ No event/audit entry representing a state transition that did not commit.
>
> ☐ No cross-BMR reassignment when a request references valid IDs from different aggregates.
>
> ☐ No version increment on a rejected expected_version request.

# 11. Phase 6 — Security & Privacy Hardening

| **Control**     | **Automated proof**                                                                    | **Review proof**                                                     |
|-----------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| CORS            | Approved origin, denied origin, OPTIONS, Vary: Origin; no state mutation on preflight. | Origin inventory matches QA configuration.                           |
| Authentication  | Missing, malformed, expired, wrong token/session.                                      | Operator/session mechanism documented and configured.                |
| Authorization   | Public vs operator/service; cross-BMR; protected action scope.                         | Least-privilege route matrix.                                        |
| Secrets         | Repository/evidence/log scan.                                                          | Cloudflare shows names/configured state only; values never captured. |
| Errors          | No raw SQL, stack, token, DB ID or unsafe payload.                                     | Messages are safe/actionable and carry correlation ID.               |
| Payload limits  | Oversized/deep/invalid content-type requests rejected before expensive persistence.    | Limits fit approved product inputs.                                  |
| Protected views | Customer cannot obtain operator history/audit/internal rationale.                      | Customer/operator projections reviewed.                              |
| Fixture policy  | Production path rejects fixture-only behavior.                                         | Production policy documented for Day 7.                              |
| Logging         | Safe fields/redaction only.                                                            | Minimum-necessary log/evidence sample review.                        |

## 11.1 Day 6 security matrix IDs

| **ID** | **Scenario**                                   | **Expected**                                                           |
|--------|------------------------------------------------|------------------------------------------------------------------------|
| HT-012 | Canonical error safety                         | No SQL, stack, token, database ID or unsafe payload in responses/logs. |
| SC-011 | Logs and application_errors redaction          | No secret, raw evidence body or SQL leakage.                           |
| LN-004 | Learning candidate cross-BMR source references | Only authorized/safe references; source data cannot be overwritten.    |
| LN-005 | Approved candidate not yet released            | Runtime continues using prior active knowledge version.                |

## 11.2 Root-cause remediation rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DO NOT WEAKEN CONTROLS TO MAKE A TEST PASS</strong></p>
<p>Performance or convenience is never repaired by disabling integrity, audit, version checks, authorization, redaction, payload limits or environment isolation. Fix the defect at the lowest safe layer and rerun the affected security matrix plus regression.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 12. Phase 7 — Performance & Bounded-Query Proof

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>P0 PERFORMANCE TARGET</strong></p>
<p>P0 does not require enterprise load testing. It does require bounded, paginated/index-aware retrieval so early-stage volume cannot trigger unbounded full-table responses or bypass canonical controls.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **ID** | **Scenario**                                          | **Required result**                                                | **Level** |
|--------|-------------------------------------------------------|--------------------------------------------------------------------|-----------|
| PF-001 | BMR current view at representative early-stage volume | Bounded response within QA test threshold; row counts constrained. | BLOCK     |
| PF-002 | BMR history pagination                                | Limit/cursor respected; no unbounded result.                       | BLOCK     |
| PF-003 | Timeline pagination/type filters                      | Correct order, limit, cursor and filtering.                        | BLOCK     |
| PF-004 | Index/query-plan smoke                                | Critical lookup paths use contracted indexes where practical.      | REVIEW    |
| PF-005 | Oversized import/evidence payload                     | Rejected before expensive persistence; DB counts unchanged.        | BLOCK     |

## 12.1 Performance test method

> 1\. Seed deterministic representative volume using synthetic QA fixtures; do not use unmarked real customer data.
>
> 2\. Exercise BMR current, history and timeline routes with explicit limit/cursor parameters and capture returned row counts/payload size/duration.
>
> 3\. Attempt omitted/extreme limit values and prove server-side bounds apply.
>
> 4\. Exercise timeline type filters and stable ordering; verify cursor continuation does not duplicate or skip records unexpectedly.
>
> 5\. Inspect query plans or index use where practical for BMR, session, evidence, finding, treatment, event and audit retrieval.
>
> 6\. Send oversized evidence/import requests and prove rejection occurs before domain/database write.
>
> 7\. Record the measured QA threshold used. Do not invent a release threshold after seeing results; use the repository/contracted threshold if one already exists.

# 13. Phase 8 — Import Reconciliation & Quarantine

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>TARGETED REHEARSAL ONLY</strong></p>
<p>Day 6 proves repeatable import behavior with approved fixture data. It is not permission for broad historical Airtable/legacy migration.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> 1\. Use F10_IMPORT or the repository-equivalent fixture containing valid, duplicate and invalid source rows.
>
> 2\. Create the import batch through the approved privileged path. Record source type/name/checksum, expected count, environment and actor context.
>
> 3\. Process a valid source row and prove canonical entities/relationships are created or resolved according to the import contract.
>
> 4\. Replay the same source row key and prove idempotent handling; do not create duplicate canonical state.
>
> 5\. Process an invalid/ambiguous row and prove it is quarantined with a safe error rather than silently coerced into canonical tables.
>
> 6\. Close/reconcile the batch and prove processed/imported/skipped/error counts match row-level evidence.
>
> 7\. Query import_errors / reconciliation output and prove invalid records remain outside canonical truth.
>
> 8\. Re-run the reconciliation proof and ensure evidence references the candidate commit and exact QA database state.

## 13.1 Import STOP conditions

> • Silent field invention/coercion to force success.
>
> • Manual copy/paste that cannot be reproduced or audited.
>
> • Direct writes from Airtable/CRM/script into D1 outside the Worker/approved import boundary.
>
> • Unreconciled batch counts or duplicate source-row effects.
>
> • Quarantined payload/evidence leaking sensitive content into logs/release artifacts.

# 14. Phase 9 — Failure, Recovery & Worker Rollback Rehearsal

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>QA-ONLY DESTRUCTIVE/FAULT REHEARSAL</strong></p>
<p>Execute the following against the QA candidate and approved fault harness/configuration. Do not perform destructive failure injection in Production.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Contract step** | **Required action**                                                                                                                                 |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| 74                | Deploy the exact candidate to QA. Record Worker deployment ID/name/URL, candidate commit and migration state.                                       |
| 75                | Run the complete known-good BMR workflow and capture canonical founder/venture/BMR/session/evidence/reasoning/care IDs plus correlation IDs.        |
| 76                | Using an approved test harness/configuration, simulate missing DB and stale schema. Require fail-closed readiness/writes and safe canonical errors. |
| 77                | Force an adapter timeout/failure. Require canonical state to remain committed and adapter delivery to be retryable/reconcilable.                    |
| 78                | Send stale expected_version and cross-BMR references. Require conflict/forbidden behavior and prove zero partial write.                             |
| 79                | Roll the QA Worker back to the prior known-good deployment. Run health/read and verify it remains compatible with the additive candidate schema.    |
| 80                | Redeploy the exact Day 6 candidate and rerun the full smoke suite. Require deterministic recovery to the expected state.                            |
| 81                | Record every command, deployment ID, result, defect, correlation/canonical IDs and final state in release evidence.                                 |

## 14.1 Stable recovery test IDs

| **ID** | **Failure condition**        | **Expected result**                                              | **Proof**          |
|--------|------------------------------|------------------------------------------------------------------|--------------------|
| RC-001 | DB unavailable               | Readiness/write 503 safe; no partial canonical state.            | HTTP/log           |
| RC-002 | Stale schema                 | Readiness/write fail closed with schema code.                    | HTTP + ledger      |
| RC-003 | Rollback Worker deployment   | Prior deployment health/read works against additive schema.      | Deployment + smoke |
| RC-004 | Redeploy candidate           | Full smoke returns to expected state.                            | Deployment + tests |
| RC-005 | Unexpected application error | 500 GV_INTERNAL; correlation; safe application_error; no secret. | HTTP + DB/log      |

## 14.2 Rollback evidence must prove

> ☐ The rollback target exists and is the prior known-good deployment/commit, not a newly invented “rollback” build.
>
> ☐ Rollback does not require a destructive down migration.
>
> ☐ Prior Worker can health/read its supported state against additive schema or an explicit compatibility boundary is documented and resolved before GO.
>
> ☐ Canonical data created before the forced adapter failure remains intact.
>
> ☐ Redeploying the candidate after rollback restores the same deterministic smoke behavior.
>
> ☐ All rollback and redeploy deployment IDs/timestamps/commit references are captured.

# 15. Phase 10 — Existing Production Baseline Smoke

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRODUCTION SAFETY</strong></p>
<p>Day 6 regression includes the established existing Production GalviCare smoke only to prove no unapproved regression. Do not deploy the Day 6 candidate, apply candidate migrations, enable fixtures, run destructive faults, or discover new lifecycle behavior in Production.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> • Use the already approved non-destructive Production smoke path established by prior build days.
>
> • Confirm the existing Production entry/route is still the approved baseline and has not been redirected to a QA entry point.
>
> • Confirm the smoke returns expected customer/runtime behavior without requiring Day 6 changes.
>
> • Capture date/time, production deployment reference if available, test action/result and any correlation ID that is safe to record.
>
> • Any Production regression is a Blocker for Day 6 and must be root-caused in QA before further release rehearsal.

| **ID** | **Regression proof**                                                                        |
|--------|---------------------------------------------------------------------------------------------|
| RG-006 | Existing Production GalviCare smoke remains valid; no unapproved regression before cutover. |

# 16. Phase 11 — Defect Triage, Remediation & Retest Discipline

| **Severity** | **Definition**                                                                                                                                                                             | **Day 6 disposition**                                                                          |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| Blocker      | Data loss/corruption; duplicate canonical identity; wrong environment/DB; unauthorized write; secret exposure; migration failure; Production regression; unrecoverable paid/care workflow. | Fix + full relevant retest. Release prohibited.                                                |
| Critical     | Core route/lifecycle/evidence/lineage/care failure; rollback unavailable; major privacy/safety issue.                                                                                      | Fix + full relevant retest. Release prohibited.                                                |
| High         | Important P0 behavior or required QA path fails without canonical corruption.                                                                                                              | Normally blocking. Scope reduction requires formal contract/gate update; no hidden workaround. |
| Medium       | Recoverable non-core defect/operator inconvenience/non-critical adapter issue with evidence/retry.                                                                                         | May accept only with documented workaround, owner, dated backlog and all gates still true.     |
| Low          | Cosmetic/documentation issue with no contract/data/security/recovery impact.                                                                                                               | May accept and record.                                                                         |

## 16.1 Root-cause fix loop

> 1\. Record failing stable test ID/step, expected vs actual, environment, candidate commit/deployment, canonical/correlation IDs, severity and evidence.
>
> 2\. Identify the lowest-layer root cause: static/config, migration, repository, domain invariant, API mapping, authorization, adapter, or test harness.
>
> 3\. Make the smallest critical-path correction. Do not refactor unrelated files or alter expected values to fit actual behavior.
>
> 4\. Add/strengthen the regression test at the lowest reliable layer.
>
> 5\. Rerun the failed test plus its dependent workflow.
>
> 6\. For identity, migration, lifecycle, security, canonical-data or cross-scope fixes, rerun the broader affected matrix and then the combined regression.
>
> 7\. Update evidence from the new candidate. Never mix artifacts from pre-fix and post-fix commits.
>
> 8\. If the QA state becomes unstable or integrity is at risk, rollback to the recorded starting deployment/commit and preserve the failed-attempt evidence.

## 16.2 No “green by manipulation”

> • Do not change expected values solely to make a test pass.
>
> • Do not disable constraints/triggers/security controls.
>
> • Do not mark mandatory tests skipped/todo/quarantined.
>
> • Do not edit release evidence to remove a failure.
>
> • Do not rerun flaky tests until one happens to pass and report only that run.
>
> • Do not use manual direct D1 repair as an undocumented workaround.

# 17. Phase 12 — Release-Evidence Generation

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EVIDENCE IS PART OF THE PRODUCT</strong></p>
<p>Day 6 proof must identify one exact candidate branch/commit, one QA deployment, one QA D1/migration state and one rollback reference. A stale or mixed artifact invalidates RL-001.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 17.1 Binding evidence content

> ☐ Candidate branch and commit SHA; exact diff scope; package-lock state; required-file inventory.
>
> ☐ QA Worker deployment name/ID/URL; environment header; D1 database reference; schema_migrations output.
>
> ☐ Automated test summary: total/passed/failed/skipped/duration plus full machine-readable artifact. Mandatory skipped = 0.
>
> ☐ Direct D1 assertion output covering identities, one BMR/venture, version history, lineage, append-only records and zero orphan/partial state.
>
> ☐ Security/privacy results, failure-injection results, rollback/redeploy rehearsal and safe log/error samples.
>
> ☐ Import reconciliation/quarantine proof and performance/bounded-query report.
>
> ☐ Defect register, accepted Medium/Low limitations (if any), owner/workaround/due date and Product Owner decision placeholders.
>
> ☐ Human E2E fixture/test identity, runbook preflight and cleanup/retention plan.
>
> ☐ Rollback commit/deployment and post-rollback/redeploy smoke evidence.

## 17.2 Recommended evidence folder convention

| **Artifact**                    | **Required content**                                                       |
|---------------------------------|----------------------------------------------------------------------------|
| release-evidence/day6/README.md | Scope, candidate identity, run order, final Day 6 decision.                |
| candidate.json                  | Branch/SHA/diff/lockfile/QA Worker/D1/schema/rollback IDs.                 |
| automated-tests.json            | Stable test IDs and summary; failed=0, mandatory skipped=0 for GO.         |
| migration-clean.txt             | Clean apply, second apply/ledger behavior, schema + constraint assertions. |
| migration-upgrade.txt           | Prior→candidate rehearsal, before/after ledger, data continuity.           |
| database-assertions.txt         | Canonical identity/lineage/version/orphan/append-only proof.               |
| security-report.md              | CORS/authN/authZ/redaction/secrets/payload/protected-view results.         |
| performance-report.md           | PF-001…PF-005 results and representative thresholds.                       |
| import-reconciliation.md        | F10 batch/row outcomes/quarantine/reconciliation.                          |
| failure-recovery.md             | RC-001…RC-005 plus contract steps 74–81.                                   |
| production-baseline-smoke.md    | Existing Production GalviCare smoke only.                                  |
| defects.md                      | All open/closed defects, severity, disposition, owner.                     |
| rollback.md                     | Prior deployment/commit and compatibility/redeploy proof.                  |
| human-e2e-preflight.md          | F12 identity plan, runbook readiness, D1 queries, cleanup/retention.       |
| evidence-manifest.json          | Checksums/paths/candidate metadata proving no stale/mixed artifact.        |
| daily-gate.md                   | D6-01…D6-06 + universal gate + GO/STOP/ROLLBACK.                           |
| release-candidate-report.md     | Concise Codex handoff; summary only, never substitute for evidence.        |

> • These filenames are a recommended convention; reuse equivalent existing Day 6 evidence names if present.
>
> • Evidence must be redacted: no secrets, raw sensitive payloads, or unnecessary founder details.
>
> • Store commands/results contemporaneously; do not reconstruct “perfect” transcripts after the fact.

## 17.3 Release matrix IDs

| **ID** | **Required proof**                                                                                                |
|--------|-------------------------------------------------------------------------------------------------------------------|
| RL-001 | Evidence manifest matches the exact candidate commit, QA deployment and migration state; no stale/mixed artifact. |
| RL-002 | Required tests: failed=0 and mandatory skipped=0.                                                                 |

# 18. Phase 13 — Day 7 Human E2E Preflight

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 6 DOES NOT DECLARE THE FINAL PRODUCTION HUMAN E2E PASS</strong></p>
<p>Day 6’s blocking requirement is that the runbook and fixture/test identity are ready. The final Human E2E and canonical Production D1 proof occur under the controlled Day 7 release procedure.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 18.1 Runbook preflight contents

> ☐ Exact candidate SHA, expected Production target, migration target and rollback reference placeholders.
>
> ☐ Named tester/operator roles and a single time standard (UTC preferred or explicitly stated timezone).
>
> ☐ Clearly marked F12_PROD_SAFE test identity/venture using normal supported Production routes — never fixture mode.
>
> ☐ Expected canonical ID patterns and exact data-retention/archive rule for the release-test record.
>
> ☐ Step-by-step supported founder/operator workflow with expected UI/API state after each step.
>
> ☐ Expected adapter status and how to distinguish adapter failure from canonical failure.
>
> ☐ Canonical D1 assertion sheet that proves one BMR, separated record classes, versions/lineage/care chain, append-only events/audit and no duplicate/partial state.
>
> ☐ Critical Production-safe negative checks: unauthorized protected route, duplicate idempotent replay, fixture route unavailable and retrieval/refresh continuity.
>
> ☐ Explicit prohibition on destructive fault injection/ad hoc SQL in Production; those proofs reference Day 6 QA evidence.
>
> ☐ Defect capture template with expected/actual, environment, commit/deployment, correlation/canonical IDs, severity and decision.
>
> ☐ Cleanup/retention plan that does not delete a Production test record merely to hide release evidence.

## 18.2 Preflight acceptance questions

| **Question**                                                                                              | **Required Day 6 answer**                                            |
|-----------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| Can the run be completed without direct D1 repair, browser-state manipulation or undocumented workaround? | YES — runbook contains only approved UI/API/operational steps.       |
| Will UI/API state be reconciled to committed D1 IDs?                                                      | YES — assertion sheet is prepared.                                   |
| Are replay/duplicate checks defined?                                                                      | YES — stable IDs/row counts expected.                                |
| Are evidence, version, lineage, care, event and audit proofs defined?                                     | YES — record classes remain separated.                               |
| Are unauthorized/cross-scope/fixture-disabled/invalid-state checks safe?                                  | YES — destructive QA-only checks are excluded from Production.       |
| Is adapter failure interpreted correctly?                                                                 | YES — canonical success and adapter status are evaluated separately. |
| Does the evidence identify environment, commit, deployment, migration, tester, run, IDs and defects?      | YES — fields are present before Day 7.                               |
| Is rollback available and understood?                                                                     | YES — prior deployment/commit and procedure are named.               |

## 18.3 D6-06 preflight test

> • Have a second reader/Codex pass execute the runbook as a dry read against QA identifiers: every referenced route, required credential class, query, expected status and evidence destination must be explicit.
>
> • Any instruction that says “fix manually if needed”, “update D1”, “try again until it passes”, or requires undocumented state is a D6-06 failure.

# 19. Phase 14 — Day 6 Acceptance Gate & Handoff

| **Gate** | **Acceptance criterion**                                         | **Required evidence**         | **Level** |
|----------|------------------------------------------------------------------|-------------------------------|-----------|
| D6-01    | All mandatory automated suites pass; required skips=0.           | Combined test report.         | BLOCK     |
| D6-02    | Clean and upgrade migration rehearsals pass on candidate commit. | Migration evidence.           | BLOCK     |
| D6-03    | Security/privacy matrix passes.                                  | Security suite/report.        | BLOCK     |
| D6-04    | Failure/recovery and Worker rollback rehearsal pass.             | Deployment/recovery evidence. | BLOCK     |
| D6-05    | No Blocker/Critical/High defect remains.                         | Defect register.              | BLOCK     |
| D6-06    | Human E2E runbook and fixture/test identity are ready.           | Runbook preflight.            | BLOCK     |

## 19.1 Universal gate overlay

| **Dimension**    | **Pass condition**                                                                                                         |
|------------------|----------------------------------------------------------------------------------------------------------------------------|
| Scope            | Only approved Day 6 hardening/evidence/root-cause fixes; no new canonical owner/dependency/lifecycle/environment shortcut. |
| Repository       | Required paths/imports resolve; no mandatory skipped test; no secret value present.                                        |
| Migration/data   | Clean/upgrade assertions pass; no duplicate/orphan/partial canonical state.                                                |
| Worker/API       | QA deployment returns canonical JSON, correct environment/correlation headers and contracted errors/statuses.              |
| Security/privacy | Caller boundaries, CORS, authZ, redaction and server-side secrets remain correct.                                          |
| Regression       | All prior known-good fixtures and existing Production baseline remain valid.                                               |
| Recovery         | Known rollback point tested; no destructive data loss required.                                                            |
| Human proof      | Day 7 runbook/test identity preflight is executable; final Production Human E2E remains Day 7.                             |
| Decision         | Business Owner/implementation lead records GO, STOP or ROLLBACK plus defects and next baseline.                            |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 6 GO RULE</strong></p>
<p>GO to Day 7 only when every blocking automated matrix item passes, mandatory skips equal zero, the exact candidate has passed clean and upgrade migration rehearsals, failure/recovery and rollback are proven, no Blocker/Critical/High defect remains in approved P0 scope, and the Human E2E runbook can be executed without undocumented repair. Otherwise: STOP and continue in QA.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 19.2 Daily gate record Codex must produce

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GALVIVAULT P0 DAILY GATE — DAY 6<br />
Date/time:<br />
Branch and candidate commit:<br />
QA Worker deployment:<br />
QA D1 / schema migration:<br />
Start-of-day rollback deployment/commit:<br />
Daily objective: Integration, hardening &amp; release rehearsal<br />
<br />
Mandatory gate results:<br />
- Scope:<br />
- Repository/static:<br />
- Migration/data:<br />
- Worker/API:<br />
- Security/privacy:<br />
- Regression:<br />
- Recovery/rollback:<br />
- Human E2E preflight:<br />
<br />
Automated tests: total / passed / failed / skipped<br />
D6-01: PASS | FAIL<br />
D6-02: PASS | FAIL<br />
D6-03: PASS | FAIL<br />
D6-04: PASS | FAIL<br />
D6-05: PASS | FAIL<br />
D6-06: PASS | FAIL<br />
Blocking defects:<br />
Accepted Medium/Low defects:<br />
Evidence paths:<br />
Decision: GO TO DAY 7 | STOP IN QA | ROLLBACK<br />
Decision owner/rationale:<br />
Day 7 starting baseline:</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 19.3 Required Codex handoff statement

> • Codex must not say “Day 6 complete” merely because CI is green.
>
> • If GO: state the exact candidate SHA, QA deployment ID, schema version, rollback deployment, test totals (with zero mandatory skips), D6-01…D6-06 status, open accepted Medium/Low defects, evidence manifest path and “READY FOR DAY 7 CONTROLLED PRODUCTION READINESS — NOT YET PRODUCTION FINAL.”
>
> • If STOP: identify the first blocking gate/test ID, root cause, affected files, current canonical state, rollback status and next remediation action. Do not claim partial completion as a pass.

# Appendix A — Automated QA Matrix: Day 6 Critical IDs

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IMPORTANT</strong></p>
<p>These are the tests explicitly labeled Day 6 or Day 6 release-critical in the authoritative matrix. Day 6 must also run all blocking inherited Day 1–5 tests; passing only the list below is insufficient.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Static / migration / HTTP / security

| **ID** | **Scenario**                          | **Expected**                                                     | **Proof**            | **Level** |
|--------|---------------------------------------|------------------------------------------------------------------|----------------------|-----------|
| ST-009 | No required test skipped/only/todo    | mandatory skipped=0                                              | Manifest scan        | BLOCK     |
| ST-010 | Production entry imports QA fixtures? | No fixture module/policy reachable                               | Import graph         | BLOCK     |
| MG-012 | Upgrade prior fixture schema          | Existing records readable; constraints valid                     | Migration+regression | BLOCK     |
| MG-013 | Readiness below minimum schema        | 503 GV_DB_SCHEMA_OUTDATED                                        | HTTP+ledger          | BLOCK     |
| MG-014 | Applied migration content change      | New content requires new migration ID; commit/checksum evidenced | Script/audit         | BLOCK     |
| HT-012 | Canonical error safety                | No SQL/stack/token/database ID/unsafe payload                    | Response/log         | BLOCK     |
| SC-011 | Log/application_errors redaction      | No secrets/raw evidence/SQL                                      | Log/DB scan          | BLOCK     |

## Learning / recovery

| **ID** | **Scenario**                             | **Expected**                                                      | **Proof**        | **Level** |
|--------|------------------------------------------|-------------------------------------------------------------------|------------------|-----------|
| LN-004 | Cross-BMR source refs                    | Authorized/safe refs only; no source overwrite                    | Domain/security  | BLOCK     |
| LN-005 | Approved learning candidate not released | Runtime remains prior active knowledge version                    | Integration      | BLOCK     |
| RC-001 | DB unavailable                           | Readiness/write 503 safe; no partial state                        | HTTP/log         | BLOCK     |
| RC-002 | Stale schema                             | Readiness/write fail closed with schema code                      | HTTP+ledger      | BLOCK     |
| RC-003 | Rollback Worker deployment               | Prior deployment health/read works against additive schema        | Deployment+smoke | BLOCK     |
| RC-004 | Redeploy candidate                       | Full smoke returns to expected state                              | Deployment+tests | BLOCK     |
| RC-005 | Unexpected application error             | 500 GV_INTERNAL + correlation + safe application_error; no secret | HTTP+DB/log      | BLOCK     |

## Performance / regression / release

| **ID** | **Scenario**                          | **Expected**                                           | **Proof**           | **Level** |
|--------|---------------------------------------|--------------------------------------------------------|---------------------|-----------|
| PF-001 | BMR current representative volume     | Bounded response within QA threshold                   | Timing+rows         | BLOCK     |
| PF-002 | BMR history pagination                | Limit/cursor respected; no unbounded result            | HTTP                | BLOCK     |
| PF-003 | Timeline pagination/type filters      | Correct order/limit/cursor                             | HTTP+DB             | BLOCK     |
| PF-004 | Index/query plan smoke                | Contracted indexes used where practical                | Query plan          | REVIEW    |
| PF-005 | Oversized import/evidence             | Rejected before expensive persistence                  | Timing+DB           | BLOCK     |
| RG-001 | Day 1 foundation regression           | Remains green                                          | Combined report     | BLOCK     |
| RG-002 | Identity/continuity regression        | Stable IDs + one BMR                                   | Combined report     | BLOCK     |
| RG-003 | Evidence version/history regression   | Immutability/versioning remain                         | Combined report     | BLOCK     |
| RG-004 | Reasoning lineage/timeline regression | Lineage/views remain                                   | Combined report     | BLOCK     |
| RG-005 | Care/adapter regression               | Care chain + non-blocking behavior remain              | Combined report     | BLOCK     |
| RG-006 | Existing Production GalviCare smoke   | No unapproved regression                               | Smoke evidence      | BLOCK     |
| RL-001 | Evidence manifest consistency         | No stale/mixed artifact; commit/deploy/migration match | Manifest validation | BLOCK     |
| RL-002 | Failed/skipped count                  | failed=0; mandatory skipped=0                          | Test summary        | BLOCK     |

# Appendix B — Canonical D1 Assertion Catalog

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ASSERT COMMITTED STATE, NOT JUST API RESPONSES</strong></p>
<p>“DB proof” means the test or evidence reads the committed database state. Adapt query syntax only to the exact schema in the candidate; do not alter schema merely to make an assertion easier.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.1 Canonical table inventory to include in schema proof

| **Table**              | **Table**                | **Table**            |
|------------------------|--------------------------|----------------------|
| schema_migrations      | founders                 | ventures             |
| founder_venture_roles  | business_medical_records | assessment_sessions  |
| question_definitions   | assessment_answers       | evidence_items       |
| evidence_relationships | observations             | observation_evidence |
| hypotheses             | hypothesis_observations  | findings             |
| finding_evidence       | finding_observations     | finding_hypotheses   |
| recommendations        | recommendation_findings  | treatment_plans      |
| treatment_plan_items   | treatment_events         | outcomes             |
| outcome_evidence       | feedback                 | learning_candidates  |
| knowledge_items        | journey_events           | audit_log            |
| idempotency_keys       | adapter_deliveries       | import_batches       |
| import_errors          | application_errors       |                      |

## B.2 Required assertion intents

| **Invariant**              | **Assertion intent**                                                                                                 | **Expected**                                                            |
|----------------------------|----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| One BMR per venture        | Group business_medical_records by venture_id; detect count \> 1; target known-good venture resolves exactly one BMR. | Zero duplicates; target count=1.                                        |
| No orphan identity/lineage | LEFT JOIN child record classes to their required BMR/parent/support records.                                         | Zero orphan rows.                                                       |
| Evidence immutability      | Attempt material update to accepted evidence via test DB transaction.                                                | Mutation rejected; original row/hash/content unchanged.                 |
| Version history            | Retrieve versions by group/root; inspect supersedes/current semantics.                                               | Prior versions remain; current selection deterministic.                 |
| Append-only events         | Attempt UPDATE/DELETE against audit_log, journey_events, treatment_events in test environment.                       | Mutation rejected.                                                      |
| Idempotency receipt        | Same request key+fingerprint replay, then changed fingerprint.                                                       | One receipt/result; replay stable; mismatch 409 and counts unchanged.   |
| Care lineage               | Recommendation→finding; treatment→approved care context; outcome→plan/recommendation/evidence where applicable.      | All required links resolve; no disconnected care rows.                  |
| Learning governance        | Candidate approved but not released.                                                                                 | Active knowledge/runtime version unchanged.                             |
| Adapter isolation          | Forced failed delivery.                                                                                              | Canonical entity unchanged; adapter_deliveries records failure/attempt. |
| Import reconciliation      | Batch/row/error counts reconcile.                                                                                    | Processed totals match; invalid rows remain quarantined.                |

## B.3 Safe SQL examples (assertion templates)

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>-- Duplicate BMR detection (expected: zero rows)<br />
SELECT venture_id, COUNT(*) AS bmr_count<br />
FROM business_medical_records<br />
GROUP BY venture_id<br />
HAVING COUNT(*) &gt; 1;<br />
<br />
-- Example orphan evidence check (expected: zero rows)<br />
SELECT e.evidence_id<br />
FROM evidence_items e<br />
LEFT JOIN business_medical_records b ON b.bmr_id = e.bmr_id<br />
WHERE b.bmr_id IS NULL;<br />
<br />
-- Migration ledger (record exact candidate state)<br />
SELECT * FROM schema_migrations ORDER BY migration_id;<br />
<br />
-- Use repository/schema-exact columns for other orphan/version/idempotency assertions.<br />
-- Never run mutation/fault assertions against Production.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix C — Recommended Day 6 Evidence Manifest

| **Evidence domain** | **Must identify**                             | **Minimum pass fact**                                           |
|---------------------|-----------------------------------------------|-----------------------------------------------------------------|
| Candidate           | branch, SHA, diff, lockfile                   | One exact candidate; no mixed commit artifacts.                 |
| QA deployment       | Worker name/ID/URL, environment header        | Deployment is QA and maps to candidate SHA.                     |
| D1/schema           | QA DB reference, migration ledger             | Correct QA DB; exact candidate minimum schema.                  |
| Automated QA        | stable IDs, totals, duration, artifacts       | All blocking pass; failed=0; mandatory skipped=0.               |
| Migration clean     | commands, ledger, schema objects, constraints | Clean and repeated application/ledger behavior pass.            |
| Migration upgrade   | before/after ledger/IDs/counts                | Prior records readable; no duplicate/orphan/constraint failure. |
| Security            | origins/authN/authZ/redaction/secrets/errors  | No blocker/critical/high exposure or unauthorized mutation.     |
| Performance         | PF-001…PF-005                                 | Bounded/paginated; oversized request fails early.               |
| Import              | F10 batch/reconciliation/errors               | Valid/duplicate/invalid behavior reconciles; quarantine works.  |
| Recovery            | RC-001…005 + steps 74–81                      | Fail closed; prior Worker works; candidate redeploy recovers.   |
| Production baseline | safe existing GalviCare smoke                 | No unapproved regression.                                       |
| Defects             | severity, expected/actual, owner, disposition | No Blocker/Critical/High remains.                               |
| Human E2E preflight | F12 identity plan, runbook, queries, rollback | Executable without undocumented repair.                         |
| Decision            | D6-01…D6-06 + universal gate                  | Explicit GO/STOP/ROLLBACK with owner/rationale.                 |

# Appendix D — Codex Final Implementation Report Template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>REPORT PURPOSE</strong></p>
<p>The report is a concise index to objective evidence. It must never substitute for the evidence or state that a gate passed when its required artifacts are absent.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GALVIVAULT P0 — DAY 6 IMPLEMENTATION REPORT<br />
<br />
1. Candidate<br />
- Repository: mrgalvipro/galvitriage<br />
- Branch: qa-revamped-galvicare-0-5<br />
- Starting baseline commit:<br />
- Final candidate commit:<br />
- QA Worker deployment:<br />
- QA D1 / schema version:<br />
- Rollback deployment/commit:<br />
<br />
2. Scope delta<br />
- Files added:<br />
- Files modified:<br />
- Files intentionally unchanged (especially Production entry):<br />
- Dependencies/lockfile changed? YES/NO<br />
- Migrations added? If yes: IDs/reason<br />
<br />
3. Automated QA<br />
- Total / passed / failed / skipped:<br />
- Mandatory skipped: 0 required<br />
- D6 critical test IDs:<br />
- Prior Day 1–5 regression:<br />
- Existing Production GalviCare smoke:<br />
<br />
4. Migration rehearsal<br />
- Clean database: PASS/FAIL<br />
- Second apply/ledger behavior: PASS/FAIL<br />
- Upgrade prior → candidate: PASS/FAIL<br />
- Integrity/orphan/duplicate assertions: PASS/FAIL<br />
<br />
5. Security / privacy<br />
- CORS: PASS/FAIL<br />
- authN/authZ/cross-BMR: PASS/FAIL<br />
- secrets/redaction/safe errors: PASS/FAIL<br />
- payload/protected views: PASS/FAIL<br />
<br />
6. Performance / import<br />
- PF-001…PF-005:<br />
- F10 reconciliation/quarantine:<br />
<br />
7. Failure / recovery / rollback<br />
- RC-001…RC-005:<br />
- Prior Worker rollback health/read:<br />
- Candidate redeploy smoke:<br />
<br />
8. Defects<br />
- Blocker:<br />
- Critical:<br />
- High:<br />
- Accepted Medium/Low with owner/date:<br />
<br />
9. Human E2E preflight<br />
- Runbook path:<br />
- F12 test identity plan:<br />
- D1 assertion sheet:<br />
- Cleanup/retention:<br />
- Preflight: PASS/FAIL<br />
<br />
10. Evidence manifest<br />
- Path:<br />
- Candidate/deployment/migration consistency: PASS/FAIL<br />
<br />
11. DAY 6 GATE<br />
- D6-01:<br />
- D6-02:<br />
- D6-03:<br />
- D6-04:<br />
- D6-05:<br />
- D6-06:<br />
- Decision: GO TO DAY 7 | STOP IN QA | ROLLBACK<br />
- Rationale:<br />
<br />
If GO, end exactly with:<br />
DAY 6 BUILD PASS — READY FOR DAY 7 CONTROLLED PRODUCTION READINESS.<br />
GALVIVAULT P0 IS NOT YET PRODUCTION FINAL.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix E — Prohibited Shortcuts / Anti-Regression Rules

| **Do not**                                                         | **Why it invalidates Day 6**                                                                                 |
|--------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| Create a new branch to work around test/deploy problems.           | Day 1–6 branch is contractually qa-revamped-galvicare-0-5 unless Product Owner approves otherwise.           |
| Use Production as the first test environment.                      | Day 7 may not discover whether migrations/routes/secrets/CORS/idempotency/lifecycle work.                    |
| Modify applied migrations in place.                                | P0 migrations are additive/forward-only; change control requires a new ordered migration.                    |
| Skip/quarantine a mandatory test.                                  | Deferred required behavior becomes a blocking Day 6 item; D6-01/RL-002 require zero mandatory skips.         |
| Lower an expected result or disable a constraint to make CI green. | Tests and invariants define behavior; reports/green workflows do not override them.                          |
| Create parallel Worker or database write paths.                    | One Worker + one D1 authority is a locked P0 architecture decision.                                          |
| Let adapter failure roll back canonical care.                      | External systems are downstream/non-authoritative; canonical transaction commits first.                      |
| Expose SQL/stack/token/database IDs/raw evidence in errors.        | Safe canonical error envelope and privacy/redaction are blocking controls.                                   |
| Directly repair D1 to make Human E2E work.                         | Undocumented manual repair means the runbook and canonical workflow are not releasable.                      |
| Treat missing outcome as success/failure.                          | Outcome truth requires source and observed_at; absence is not an outcome.                                    |
| Promote learning candidate automatically.                          | Learning remains proposal-only until governed release.                                                       |
| Mix evidence from different commits/deployments.                   | RL-001 requires one coherent candidate evidence manifest.                                                    |
| Rewrite unrelated GalviCare files during hardening.                | Day 6 is release proof, not speculative product refactoring; existing Production baseline must remain valid. |

# Day 6 Codex Completion Checklist — One-Page Gate

> ☐ Entry: Day 5 GO / stable QA baseline evidenced; prior rollback known.
>
> ☐ Branch: qa-revamped-galvicare-0-5; exact candidate SHA recorded.
>
> ☐ No new branch, no Production candidate deployment, no broad feature rewrite.
>
> ☐ ST-009/ST-010 pass; required test skips/only/todo = 0.
>
> ☐ Clean migration rehearsal passes from repository migrations only.
>
> ☐ Upgrade migration rehearsal passes from prior known-good state.
>
> ☐ All inherited Day 1–5 blocking suites remain green.
>
> ☐ HT-012 / SC-011 / authN/authZ/CORS/redaction/payload/protected-view matrix passes.
>
> ☐ Idempotent new/replay/mismatch and business-key uniqueness proofs pass.
>
> ☐ LN-004/LN-005 governed-learning boundary passes.
>
> ☐ PF-001…PF-005 pass/review as contracted; current/history/timeline bounded.
>
> ☐ F10 import reconciliation/quarantine proof passes.
>
> ☐ RC-001…RC-005 and contract steps 74–81 pass.
>
> ☐ Prior QA Worker rollback works against additive schema; candidate redeploy recovers.
>
> ☐ RG-001…RG-006 pass, including existing Production GalviCare smoke.
>
> ☐ RL-001 evidence-manifest consistency passes; RL-002 failed=0 / mandatory skipped=0.
>
> ☐ No Blocker/Critical/High defect remains.
>
> ☐ F12 Production-safe test identity plan + Day 7 Human E2E runbook preflight passes.
>
> ☐ D6-01…D6-06 all PASS.
>
> ☐ Daily gate records explicit GO TO DAY 7, or STOP/ROLLBACK with evidence.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FINAL DAY 6 STATUS LANGUAGE</strong></p>
<p>Only when every item above is evidenced: “DAY 6 BUILD PASS — READY FOR DAY 7 CONTROLLED PRODUCTION READINESS. GALVIVAULT P0 IS NOT YET PRODUCTION FINAL.”</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Authoritative Source References

> • GalviVault™ P0 \| Seven-Day Build, QA, and Production Readiness Implementation Guide \| Version 0.5 — Authoritative Build Contract, Parts I–IV.
>
> • Primary Day 6 execution: Section 15.9; daily acceptance gates: Section 16; QA strategy: Section 17; automated QA matrix: Section 18; Human E2E: Section 19.
>
> • Production readiness/cutover/rollback/evidence/operations that Day 6 prepares: Sections 20–24.
>
> • The source contract remains controlling if this execution companion and the authoritative guide ever conflict.
