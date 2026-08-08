**GALVIVAULT™ P0**

**DAY 4 BUILDER GUIDE**

**Codex Implementation Engineer Edition**

**Observe • Reason • Govern Findings • Reconstruct the Business Medical Record Timeline**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>AUTHORITATIVE DERIVATIVE<br />
</strong>This Day 4 Builder Guide is derived from the GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5, and uses the approved Day 3 Builder Guide as its execution-format precedent. It converts the governing reasoning, lineage, versioning, confirmation, Business Medical Record projection, Worker, D1, QA, Human E2E, rollback, and release-evidence contracts into one executable Day 4 instruction set for Codex.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**Repository:** mrgalvipro/galvitriage  
**Implementation branch:** qa-revamped-galvicare-0-5  
**Production branch:** main  
**Version:** 1.0 \| August 2026

*Day 4 success is not “reasoning code exists.” Day 4 is complete only when evidence-supported reasoning, governed confirmation, preserved version history, safe projections, and the BMR timeline are proven through the canonical Worker + D1 path.*

# Document Control and Builder Authority

| **Item**                   | **Binding value**                                                                                                                                                                                     |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Document                   | GalviVault™ P0 Day 4 Builder Guide — Codex Implementation Engineer Edition                                                                                                                            |
| Source authority           | GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5                                                                                                        |
| Execution-format precedent | GalviVault™ P0 Day 3 Builder Guide — Codex Implementation Engineer Edition, Version 1.0                                                                                                               |
| Repository                 | mrgalvipro/galvitriage                                                                                                                                                                                |
| Implementation branch      | qa-revamped-galvicare-0-5                                                                                                                                                                             |
| Production branch          | main                                                                                                                                                                                                  |
| Day 4 objective            | Create the evidence-linked reasoning model and a longitudinal Business Medical Record view without allowing generated narrative, facilitator opinion, or future AI output to become ungoverned truth. |
| Prerequisite               | DAY 3 HUMAN E2E PASS → DAY 3 BUILD FINAL with stable Founder/Venture/BMR/session IDs; accepted/current evidence and version lineage; QA/Production isolation; and complete Day 3 evidence.            |
| Canonical QA authority     | Extend only the existing isolated QA Worker and QA D1. Preserve all prior routes, migrations, identities, evidence behavior, deployments, and Production behavior.                                    |
| Final status language      | DAY 4 HUMAN E2E PASS → DAY 4 BUILD FINAL only when every Day 4 BLOCK gate and required evidence artifact passes.                                                                                      |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>NO-ASSUMPTION RULE FOR CODEX<br />
</strong>Repository files, current QA deployment configuration, D1 identifiers, Day 1–3 release evidence, migration ledger, actual schema objects, authorization conventions, and command output are authoritative. Codex must inspect the actual QA branch and deployed resources before editing. It must not reconstruct unseen code from chat history, screenshots, reports, or this guide. If retrieval or platform access fails, record the exact failure and stop dependent work.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## How Codex must use this guide

> 1\. Read Sections 1–5 before modifying any repository file. Confirm DAY 3 BUILD FINAL, QA/Production isolation, the known-good identity set, and at least one accepted/current Day 3 evidence item first.
>
> 2\. Retrieve the actual QA-branch versions of every Day 4 critical file plus every Day 1–3 module that will be extended. Record the starting commit, QA Worker deployment, QA D1 safe reference, schema ledger, and rollback deployment.
>
> 3\. Build in the sequence defined in Sections 6–14. Do not deploy until clean/local schema verification and the complete Day 4 automated BLOCK matrix pass.
>
> 4\. Preserve every Day 1–3 route, migration, identity, BMR, session, question, answer, evidence, import, idempotency, audit, and Production-protection invariant. Day 4 is additive.
>
> 5\. Use the canonical reasoning, BMR, governance, security, validation, idempotency, transaction, and repository modules when they exist. Do not create parallel implementations to avoid integration work.
>
> 6\. Execute Day 4 Human E2E exactly as written. A 2xx response without direct D1 proof of support lineage, version history, explicit confirmation state, current/history selection, timeline reconstruction, and view redaction is not a pass.
>
> 7\. Complete release-evidence/day4 and a tested rollback record before declaring Day 4 complete.
>
> 8\. Return a final implementation report containing exact changed files, starting/final commits, commands, tests, migration decision, QA deployment, D1 assertions, Human E2E evidence, defects, rollback result, and final gate decision.

## Contents

> • 1. Day 4 Executive Outcome and Definition of Done
>
> • 2. Locked Architecture, Scope, and Do-Not-Break Rules
>
> • 3. Day 3 Prerequisite Verification and Starting-State Inspection
>
> • 4. Day 4 Repository Target and File Inventory
>
> • 5. Canonical Reasoning, Lineage, Governance, and BMR Projection Contracts
>
> • 6. Phase A — Freeze Day 3 Baseline and Establish Day 4 Evidence
>
> • 7. Phase B — Constants, Validation, Authentication, Authorization, and Idempotency
>
> • 8. Phase C — Observations and Evidence Support
>
> • 9. Phase D — Hypotheses, Uncertainty, and Typed Relationships
>
> • 10. Phase E — Findings and Atomic Support Lineage
>
> • 11. Phase F — Confirmation, Rejection, Supersession, and Governance History
>
> • 12. Phase G — BMR Current State, History, Reasoning, Timeline, and Safe Projections
>
> • 13. Phase H — REST Routes and Compatibility Actions
>
> • 14. Phase I — Fixtures, Tests, Scripts, Documentation, and Release Evidence
>
> • 15. Automated QA Matrix and Execution Order
>
> • 16. Local and QA Deployment Runbook
>
> • 17. Day 4 Human E2E Procedure
>
> • 18. Acceptance Gate, Rollback, and Final Codex Handoff
>
> • Appendix A — Day 4 API Contract
>
> • Appendix B — Reasoning and Timeline SQL Verification Queries
>
> • Appendix C — Fixture Catalog and Expected Row Deltas
>
> • Appendix D — Release-Evidence Templates
>
> • Appendix E — Codex Final Implementation Report Template

# 1. Day 4 Executive Outcome and Definition of Done

Day 4 turns the proven Day 3 evidence layer into governed reasoning. It must preserve the distinction between what was supplied (evidence), what can be stated neutrally from that evidence (observation), what might explain it (hypothesis), and what has become a governed conclusion (finding). The build must also expose a longitudinal Business Medical Record view that can reconstruct the path from identity to evidence to reasoning without collapsing canonical entities into one generated report.

## 1.1 Day 4 outcome

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>REQUIRED DAY 4 OUTCOME<br />
</strong>For the known-good Day 3 BMR and accepted/current evidence, the QA Worker can create a supported observation, create an explicitly uncertain hypothesis, create an unconfirmed supported finding, allow only authorized governance to confirm/reject it, supersede material reasoning into a new version while retaining prior versions and links, return correct current/history reasoning, reconstruct a typed chronological BMR timeline, and return a customer-safe projection that excludes protected internal/governance fields. Exact replays are duplicate-safe and all canonical proof comes from D1.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 1.2 Required outputs

> • Observation, hypothesis, and finding domain services, repositories, routes, versioning behavior, and support-link persistence through the canonical Worker + D1 path.
>
> • Required evidence-to-observation lineage, observation-to-hypothesis lineage, and evidence/observation/hypothesis-to-finding support lineage with typed relationship semantics.
>
> • Finding confidence, source/rule version, explicit confirmation status, and authorized confirm/reject/supersede workflows.
>
> • BMR current-state, reasoning, history, and chronological timeline projections using canonical IDs and versions.
>
> • Safe customer/operator view separation. Customer-facing responses exclude protected governance/internal reasoning while operator history remains available only to authorized callers.
>
> • Reasoning and timeline fixtures, contract tests, D1 lineage assertions, deployment metadata, Human E2E proof, defects, and rollback evidence.

## 1.3 Definition of Done

| **Dimension**       | **Pass condition**                                                                                                                                                                                                                                             |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Prerequisite        | Day 3 evidence is complete; Day 1–3 automated suites, QA routes, stable identity set, accepted/current evidence, source metadata, version lineage, and Production baseline remain green.                                                                       |
| Schema              | observations, observation_evidence, hypotheses, hypothesis_observations, findings, finding_evidence, finding_observations, and finding_hypotheses exist with the contracted constraints/indexes or an approved additive migration supplies the missing object. |
| Observation         | A created observation is bounded, neutral, belongs to the correct BMR, identifies source/version/actor context, and has at least one valid evidence link. Unsupported observation returns 422 GV_LINEAGE_REQUIRED with no row.                                 |
| Hypothesis          | A hypothesis remains explicitly uncertain, uses confidence 0–100, preserves uncertainty text when required, and links to valid supporting/contradicting/contextual observations. It never becomes a finding implicitly.                                        |
| Finding             | A finding includes finding_code, statement, domain, confidence, source/version, BMR scope, explicit confirmation status, and at least one valid support link committed atomically.                                                                             |
| Governance          | Only the authorized governance route can confirm/reject a finding; reason and expected version are enforced; event/audit evidence is retained; AI/adapter/service proposals cannot self-confirm.                                                               |
| Versioning          | Material reasoning revision creates version_no + 1 in the same group with supersedes\_\* linkage. Prior content and support history remain retrievable.                                                                                                        |
| Idempotency         | Exact finding replay returns the committed finding/support result with no duplicate support rows/events. Changed reuse of the same key conflicts with no state delta.                                                                                          |
| BMR current/history | Current returns the latest eligible non-superseded reasoning versions; history returns preserved versions, source versions, supersession, governance state, timestamps, actors/correlation, and is bounded/authorized.                                         |
| Timeline            | Typed chronological entries reconstruct Day 2 identity, Day 3 evidence, and Day 4 reasoning with canonical IDs, versions, timestamps, source, and safe correlation references.                                                                                 |
| View safety         | Customer scope excludes protected operator/audit/internal fields. Authorized operator scope can retrieve bounded history. No report or view becomes the canonical source of truth.                                                                             |
| Automated QA        | Every applicable Day 4 BLOCK test executes and passes; mandatory skipped count is zero; Day 1–3 regression and Production protection pass.                                                                                                                     |
| Human E2E           | Support lineage, uncertainty, unconfirmed→confirmed governance, supersession/history, idempotency, cross-BMR rejection, current/history, timeline, customer redaction, and Production regression pass with D1 proof.                                           |
| Final decision      | Only then may Codex state: DAY 4 HUMAN E2E PASS → DAY 4 BUILD FINAL.                                                                                                                                                                                           |

## 1.4 Explicit non-goals

> • Do not build recommendations, treatment plans, treatment events, outcomes, feedback/learning-candidate workflows, or downstream adapters as Day 4 features; those are Day 5.
>
> • Do not promote to main or declare Production readiness. Day 4 remains an isolated QA build.
>
> • Do not redesign GalviCare UI, Stripe, HubSpot, GA4, Clarity, Calendly, Pages routing, branch strategy, GitHub workflows, or Production Worker behavior.
>
> • Do not store observation/hypothesis/finding narrative as a substitute for typed evidence or as one mutable BMR report JSON blob.
>
> • Do not introduce autonomous AI, OpenAI calls, Make, Airtable writes, GraphQL, a second writable database, or direct browser-to-D1 writes.
>
> • Do not invent a production finding taxonomy, confidence-band threshold, or direct evidence-to-hypothesis table that the approved contract does not define. Use existing approved rules or clearly scoped synthetic QA fixture values only.

# 2. Locked Architecture, Scope, and Do-Not-Break Rules

## 2.1 Locked execution path

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Approved QA caller / test harness / authorized operator<br />
-&gt; isolated Cloudflare Worker QA deployment<br />
-&gt; approved QA entry + canonical app/router<br />
-&gt; request/CORS/environment/authentication/authorization/error/response utilities<br />
-&gt; reasoning | business-medical-records | governance route<br />
-&gt; reasoning-service | bmr-service | governance-service<br />
-&gt; parameterized reasoning-repository | bmr-repository | governance-repository<br />
-&gt; QA D1 binding: DB<br />
-&gt; reasoning rows + typed support links + domain event + audit + idempotency receipt<br />
-&gt; canonical JSON response / bounded projection</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

No browser, generated report, facilitator tool, import script, AI service, analytics adapter, or compatibility action may write observations, hypotheses, findings, support links, governance state, or BMR timeline state directly to D1 outside approved migration/test setup and the canonical Worker repository/domain path.

## 2.2 Binding Day 4 decisions

| **Decision**                                       | **Day 4 consequence**                                                                                                                             |
|----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| D1 is the sole writable P0 system of record.       | All reasoning, support-link, event, audit, and idempotency writes flow through DB. Views/reports remain non-authoritative projections.            |
| One Worker is the runtime write authority.         | No parallel reasoning endpoint, direct SQL reasoning script, browser persistence, or AI-only business implementation.                             |
| Evidence precedes reasoning.                       | An active observation requires evidence support. A finding requires support. Day 4 cannot proceed against unproven Day 3 evidence.                |
| Record classes remain separate.                    | Evidence, observations, hypotheses, findings, audit/events, and BMR projections remain typed records, not one narrative payload.                  |
| Canonical IDs/version groups are server-governed.  | Clients may send idempotency keys and support references, but not trusted IDs, group IDs, version numbers, privilege, or current-selection flags. |
| Lineage is mandatory.                              | Missing required support is GV_LINEAGE_REQUIRED; no partial derived record/link/event/audit state may remain.                                     |
| Uncertainty is not confirmation.                   | Hypothesis confidence/uncertainty cannot be treated as finding confirmation. A finding confirmation_status remains explicit.                      |
| Material revision is versioned.                    | Changed observation/hypothesis/finding meaning creates a new version and supersession link; prior version remains.                                |
| Current state is a projection over history.        | Current reasoning selects latest eligible leaf versions; history remains preserved and retrievable to authorized operator scope.                  |
| Confirmation is governance.                        | Confirm/reject requires authorized operator policy, reason, expected version, event/audit. A model/adapter cannot confirm its own proposal.       |
| Writes are idempotent by declared key/fingerprint. | Exact replay returns the committed result; changed key reuse returns 409 and no row/link/event delta.                                             |
| QA and Production remain isolated.                 | Day 4 modifies only QA code/data. Production routing, DB, fixture policy, and customer state remain unchanged.                                    |

## 2.3 Record-separation rule

| **Record class** | **Question it answers**                                       | **Evidentiary status**                                 | **Revision behavior**                                                                      |
|------------------|---------------------------------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------|
| Evidence         | What was supplied, selected, imported, measured, or said?     | Source fact/claim with provenance; may be unverified.  | Accepted evidence correction is a new evidence version (Day 3 contract).                   |
| Observation      | What neutral statement is directly derived from evidence?     | Derived statement; must cite evidence.                 | Material wording/interpretation revision creates a new observation version.                |
| Hypothesis       | What might explain the observed state?                        | Uncertain reasoning; may be supported or contradicted. | Revision/supersession preserves prior hypothesis and observation lineage.                  |
| Finding          | What conclusion is supported or confirmed?                    | Governed conclusion with confidence/confirmation.      | Material revision creates a new finding version; governance status stays explicit/audited. |
| BMR view         | What current/history/timeline projection should a caller see? | Projection only.                                       | Never becomes canonical source; regenerated view cannot modify source records.             |

## 2.4 Do-not-break rules

> • Do not overwrite or repurpose the Production entry point or point Production at the Day 4 QA entry.
>
> • Do not rewrite an applied Day 1–3 migration. Any missing contracted object requires an approved additive migration using the next actual ledger ID.
>
> • Do not bypass reasoning-service or reasoning-repository with route-level SQL or a script that inserts canonical reasoning directly.
>
> • Do not trust request-body actor role, BMR ownership, version/group IDs, confirmation privilege, current flags, or source authority.
>
> • Do not allow evidence, observation, hypothesis, or finding support from another BMR. Validate all support references against the same BMR before insert.
>
> • Do not coerce confidence outside 0–100, invent an uncertainty statement, invent a source_version, or infer finding confirmation from confidence.
>
> • Do not silently collapse hypothesis into finding, or treat a model/facilitator narrative as a confirmed fact.
>
> • Do not expose protected history, audit metadata, internal rationale, errors, tokens, or full sensitive evidence to customer-scoped projections.
>
> • Do not add a hypothesis_evidence table merely because one route-level description mentions observation/evidence references. The baseline schema explicitly supplies hypothesis_observations; use the approved schema/service as found and escalate any unresolved contract gap rather than inventing data structures.
>
> • Do not weaken, skip, catch-and-ignore, or alter expected results solely to make a gate green.
>
> • Do not create a new branch or duplicate implementation to bypass retrieval, merge, deployment, migration, or test failures.
>
> • At closeout, QA must be stable and evidenced or reverted to the Day 3 rollback point.

## 2.5 Stop conditions

| **Stop condition**                                                                                                | **Required response**                                                                                                                                     |
|-------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Day 3 final evidence, accepted/current evidence, stable identity set, or deployed QA baseline cannot be verified. | Stop Day 4. Re-establish DAY 3 BUILD FINAL before editing reasoning behavior.                                                                             |
| QA and Production Worker/D1 targets cannot be distinguished.                                                      | Stop deployment/configuration until exact resources and bindings are identified.                                                                          |
| Current critical files cannot be retrieved.                                                                       | Record the exact connector/tool/platform error; do not fabricate unseen code or replace the repository.                                                   |
| Day 1–3 regression fails before Day 4 changes.                                                                    | Record as pre-existing, identify impact, and obtain Product Owner direction; do not hide it or overwrite Production.                                      |
| Reasoning tables/support links/indexes are absent or incompatible.                                                | Stop and determine whether baseline migration is incomplete or an approved additive Day 4 migration is required.                                          |
| Actual contract provides no safe way to resolve the direct-evidence-to-hypothesis wording versus schema.          | Implement the minimum proven hypothesis→observation→evidence lineage; do not invent a table. Escalate any required direct link as a data-contract change. |
| A BLOCK test fails or is skipped.                                                                                 | Stop acceptance; fix root cause and rerun the failed test plus affected regression scope.                                                                 |
| Human E2E requires direct D1 repair, browser-state manipulation, or unapproved SQL.                               | Fail the run, preserve evidence, reset only the approved synthetic QA fixture, and correct the implementation.                                            |
| A secret, Production identifier, protected history field, or sensitive payload is exposed.                        | Stop, scrub/rotate as required, fix redaction/access, and rerun security/view-boundary tests.                                                             |

# 3. Day 3 Prerequisite Verification and Starting-State Inspection

## 3.1 Required retrieval set

| **Priority** | **Path / resource**                                                                              | **Why inspect**                                                                                                             |
|--------------|--------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Critical     | package.json                                                                                     | Preserve Day 1–3 scripts/tooling; add real Day 4 verification/test/smoke commands only after inspection.                    |
| Critical     | wrangler.json                                                                                    | Confirm QA entry, DB binding, environment variables, origins, fixture policy, required schema, and Production isolation.    |
| Critical     | worker/day1.js and actual current QA entry                                                       | Identify exact QA wiring. Extend only the approved application path.                                                        |
| Critical     | worker/app.js, router.js, http/\*, config/\*, security/\*, lib/\*                                | Reuse canonical envelope, auth, scope, validation, redaction, IDs, time, transactions, audit, and idempotency.              |
| Critical     | worker/domain/reasoning-service.js                                                               | Extend/create only the canonical reasoning service: createObservation, createHypothesis, createFinding, supersedeReasoning. |
| Critical     | worker/repositories/reasoning-repository.js                                                      | Verify parameterized insert/list/version methods and current/history selection; no duplicate repository.                    |
| Critical     | worker/routes/reasoning.js                                                                       | Confirm route registration/body limits/idempotency/caller scope.                                                            |
| Critical     | worker/domain/bmr-service.js; repositories/bmr-repository.js; routes/business-medical-records.js | Extend BMR reasoning/timeline projections without collapsing classes or replacing identity/lifecycle behavior.              |
| Critical     | worker/domain/governance-service.js; repositories/governance-repository.js; routes/governance.js | Reuse authorized confirmation/rejection and append-only audit behavior.                                                     |
| Critical     | worker/domain/evidence-service.js; repositories/evidence-repository.js; routes/evidence.js       | Consume known-good Day 3 evidence; do not modify accepted-evidence immutability.                                            |
| Critical     | migrations/\*\* and schema_migrations ledger                                                     | Verify all Day 4 reasoning tables, FKs, constraints, indexes, and append-only audit/event infrastructure.                   |
| Critical     | tests/day1-foundation.test.mjs; Day 2 identity tests; Day 3 evidence tests + helpers             | Preserve prior contracts; reuse actual Worker/D1 test harness and fixture utilities.                                        |
| Critical     | release-evidence/day1/\*, day2/\*, day3/\*                                                       | Verify prior final commits/deployments, schema, known-good IDs/evidence, defects, and rollback point.                       |
| Preserve     | Production entry files/deployment/D1/public route                                                | Establish immutable regression baseline; no Day 4 functional edit.                                                          |
| Platform     | QA Worker, QA D1, Production Worker/D1, approved origins                                         | Prove environment isolation and record exact deployment/database safe references.                                           |

## 3.2 Baseline capture procedure

> 1\. Confirm repository and implementation branch; record the starting commit SHA and working-tree status.
>
> 2\. Read release-evidence/day3 and verify its final commit/deployment corresponds to the selected QA branch or document an approved later regression-only commit.
>
> 3\. Run Day 1, Day 2, and Day 3 file inventory/static/secret checks, automated suites, QA smoke, remote D1 assertions, and non-destructive Production baseline smoke.
>
> 4\. Query schema_migrations and sqlite_master in QA D1. Record actual table/index/trigger names and current schema version before deciding whether Day 4 needs SQL.
>
> 5\. Resolve the known-good Day 3 founder_id, venture_id, bmr_id, session_id, accepted/current evidence_id(s), evidence_group_id(s), and authorized operator test context from actual evidence or D1. Do not guess IDs from screenshots.
>
> 6\. Record pre-Day4 row counts for observations, observation_evidence, hypotheses, hypothesis_observations, findings, finding_evidence, finding_observations, finding_hypotheses, journey_events, audit_log, and idempotency_keys.
>
> 7\. Record QA Worker deployment/version, QA D1 safe reference, Wrangler/Node/npm versions, compatibility date, allowed origins, fixture mode, and required schema.
>
> 8\. Hash or preserve the pre-Day4 versions of every critical file to be edited.
>
> 9\. Create release-evidence/day4 and write baseline.json plus pre-day4-counts.txt before modifying code.

## 3.3 Day 4 resolved variables

| **Variable**                                   | **Resolution rule**                                                                                          |
|------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| \<STARTING_QA_COMMIT_SHA\>                     | Read from qa-revamped-galvicare-0-5 at Day 4 start.                                                          |
| \<DAY3_FINAL_COMMIT_SHA\>                      | Read from Day 3 release evidence and verify against repository history.                                      |
| \<QA_WORKER_NAME/DEPLOYMENT\>                  | Read the actual isolated QA deployment; never guess.                                                         |
| \<QA_D1_DATABASE_NAME/SAFE_REFERENCE\>         | Read the actual QA DB bound as DB; never reuse Production.                                                   |
| \<PRODUCTION_BASELINE_COMMIT/DEPLOYMENT\>      | Record for non-destructive regression and rollback reference only.                                           |
| \<CURRENT_SCHEMA_VERSION\>                     | Read schema_migrations and schema-version/readiness output.                                                  |
| \<DAY4_MIGRATION_ID\>                          | Use the next actual additive migration ID only if a contracted reasoning object/index/constraint is missing. |
| \<KNOWN_GOOD_FOUNDER/VENTURE/BMR/SESSION_IDS\> | Read from Day 3 evidence or actual QA Worker/D1.                                                             |
| \<CURRENT_ACCEPTED_EVIDENCE_IDS\>              | Resolve actual same-BMR accepted/current evidence to support Day 4 fixtures.                                 |
| \<AUTHORIZED_OPERATOR_CONTEXT\>                | Use the actual approved QA auth/role mechanism; never synthesize privilege from request body.                |
| \<CUSTOMER_SCOPED_CONTEXT\>                    | Use the actual approved customer/public read scope for redaction tests.                                      |
| \<DAY4_IDEMPOTENCY_KEYS\>                      | Deterministic, synthetic, non-sensitive keys unique to each semantic Day 4 request.                          |
| \<QA_WORKER_URL\>                              | Capture after deployment and use consistently in smoke and Human E2E.                                        |

# 4. Day 4 Repository Target and File Inventory

## 4.1 Canonical additive tree

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>mrgalvipro/galvitriage/<br />
├── package.json # extend scripts only after inspection<br />
├── wrangler.json # preserve QA/Production isolation<br />
├── worker/<br />
│ ├── day1.js / current QA entry # route wiring only, additive<br />
│ ├── app.js, router.js, http/routes.js<br />
│ ├── config/constants.js<br />
│ ├── domain/constants.js, invariants.js, lifecycle.js<br />
│ ├── domain/reasoning-service.js # Day 4 primary domain owner<br />
│ ├── domain/bmr-service.js # current/history/timeline projection<br />
│ ├── domain/governance-service.js # confirm/reject authority<br />
│ ├── repositories/reasoning-repository.js<br />
│ ├── repositories/bmr-repository.js<br />
│ ├── repositories/governance-repository.js<br />
│ ├── routes/reasoning.js<br />
│ ├── routes/business-medical-records.js<br />
│ └── routes/governance.js<br />
├── migrations/day4/ # ONLY if actual schema lacks contracted objects<br />
├── tests/day4-reasoning-timeline.test.mjs<br />
├── tests/fixtures/day4-reasoning.json<br />
├── scripts/verify-day4-files.mjs<br />
├── scripts/verify-day4-reasoning.mjs<br />
├── scripts/day4-smoke.mjs<br />
├── docs/api/day4-reasoning-timeline.md<br />
├── docs/operations/day4-human-e2e.md<br />
└── release-evidence/day4/<br />
├── README.md<br />
├── baseline.json<br />
├── pre-day4-counts.txt<br />
├── changed-files.txt<br />
├── migration-transcript.txt<br />
├── deployment-metadata.json<br />
├── automated-tests.txt<br />
├── automated-tests.json<br />
├── database-assertions.sql<br />
├── database-assertions.txt<br />
├── reasoning-trace.json<br />
├── timeline-trace.json<br />
├── view-boundary.json<br />
├── human-e2e.md<br />
├── defects.md<br />
├── rollback.md<br />
└── final-gate.md</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

The Day 4 test/script/evidence filenames above follow the approved Day 3 execution-format pattern. They are additive targets, not permission to duplicate an existing repository equivalent. If the actual repository already uses an approved equivalent path, extend it and document the mapping. Material path deviation must not create a second business implementation.

## 4.2 File responsibilities

| **Path**                                    | **Day 4 responsibility**                                                                                                                                          | **Must not do**                                                                                                                                        |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| worker/domain/reasoning-service.js          | Validate/resolve BMR and support lineage; create observation/hypothesis/finding; supersede material reasoning; coordinate idempotency, transaction, event, audit. | Contain raw route parsing, trust client actor/group/version, bypass support validation, auto-confirm findings, or collapse reasoning into report JSON. |
| worker/repositories/reasoning-repository.js | Insert/list/version observations, hypotheses, findings, and link tables; current/history queries; parameterized SQL.                                              | Authorize callers, invent policy, interpolate SQL, or hide partial/constraint failures.                                                                |
| worker/domain/bmr-service.js                | Compose BMR summary/current reasoning/history/timeline projections using canonical repositories and bounded selection.                                            | Mutate reasoning to make a projection, return full raw history by default, or turn projection into canonical storage.                                  |
| worker/repositories/bmr-repository.js       | Preserve one-BMR identity/lifecycle; support bounded timeline/current projection queries when that is the established repository responsibility.                  | Duplicate reasoning repository or bypass lifecycle version checks.                                                                                     |
| worker/domain/governance-service.js         | Authorize and execute confirm/reject against typed record with reason/expected version; append governance evidence.                                               | Let request-body roles or AI/adapter caller self-authorize; modify finding content/support during confirmation.                                        |
| worker/routes/reasoning.js                  | Register POST observations/hypotheses/findings, supersede action, GET reasoning; parse caller/body/limits/idempotency and return canonical envelope.              | Implement business SQL or return route-specific non-canonical envelopes.                                                                               |
| worker/routes/business-medical-records.js   | GET BMR/timeline and existing lifecycle transition path; enforce caller scope and pagination.                                                                     | Expose protected history/internal notes to customer scope or create a parallel timeline implementation.                                                |
| worker/routes/governance.js                 | Expose authorized confirmation/rejection using existing auth policy.                                                                                              | Expose privileged governance to public journey or trust body-provided privilege.                                                                       |
| tests/day4-reasoning-timeline.test.mjs      | Execute Day 4 domain/repository/API/security/idempotency/version/current/history/timeline/view-boundary assertions against D1-compatible persistence.             | Mock away required D1 constraints, skip BLOCK tests, or prove only happy paths.                                                                        |
| scripts/verify-day4-reasoning.mjs           | Run safe D1 assertions for unsupported/orphan reasoning, versions, support, idempotency, confirmation audit, and timeline inputs; nonzero on failure.             | Modify QA/Production data or print success without checking rows.                                                                                      |
| scripts/day4-smoke.mjs                      | Run environment-targeted health/readiness, supported reasoning, replay, governance, history/timeline, view-boundary and negative smoke.                           | Embed secrets, hard-code guessed canonical IDs, or perform direct D1 repair.                                                                           |

## 4.3 Migration decision rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>INSPECT BEFORE CREATING SQL<br />
</strong>The Version 0.5 baseline migration already defines the Day 4 reasoning tables and primary indexes. Day 4 creates no migration merely to show activity. First prove the actual QA schema. Create an additive migration only when the deployed/repository schema lacks a contracted object, FK/check/unique constraint, index, or other required support. Never edit an applied migration.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> • Expected baseline tables: observations, observation_evidence, hypotheses, hypothesis_observations, findings, finding_evidence, finding_observations, finding_hypotheses.
>
> • Expected baseline indexes include idx_observations_bmr, idx_hypotheses_bmr, and idx_findings_bmr.
>
> • If a required object is absent, determine whether Day 1 baseline migration application was incomplete versus a legitimate additive schema fix. Record the decision and checksum.
>
> • If schema is already complete, migration-transcript.txt must explicitly record “no Day 4 migration required” plus the ledger/schema proof used to make that decision.

# 5. Canonical Reasoning, Lineage, Governance, and BMR Projection Contracts

## 5.1 Observation contract

| **Rule**         | **Binding contract**                                                                                                                                         |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity/version | Server-generated observation_id + stable observation_group_id; version_no starts at 1; material revision creates version_no+1 and supersedes_observation_id. |
| BMR scope        | bmr_id must resolve to an existing canonical BMR. Every evidence support reference must belong to that same BMR.                                             |
| Statement        | Neutral, bounded, and no stronger than cited evidence supports. It is not a finding or recommendation.                                                       |
| Support          | At least one observation_evidence row is mandatory for active/draft creation. support_type is supports, contradicts, or contextualizes.                      |
| Confidence       | Optional but when present is 0–100. It does not imply confirmation.                                                                                          |
| Source           | source_type required; source_version retained when applicable. created_by_type required; created_by_id optional according to actual actor contract.          |
| Status           | draft, active, superseded, rejected, archived. Current selection excludes superseded/rejected/archived by default.                                           |

## 5.2 Hypothesis contract

| **Rule**               | **Binding contract**                                                                                                                                                                                                                                                                                                                                          |
|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity/version       | Server-generated hypothesis_id + stable hypothesis_group_id; versioned through supersedes_hypothesis_id.                                                                                                                                                                                                                                                      |
| Meaning                | Hypothesis explicitly represents an uncertain possible explanation and cannot be stored/rendered as a confirmed finding by default.                                                                                                                                                                                                                           |
| Support                | At least one valid observation relationship is required by the baseline schema/service contract. relationship_type is supports, contradicts, contextualizes.                                                                                                                                                                                                  |
| Confidence             | 0–100 when present; uncertainty statement retained when the governing domain rule requires it.                                                                                                                                                                                                                                                                |
| Evidence route wording | The master route summary mentions observation/evidence references, while the baseline schema provides hypothesis_observations but no hypothesis_evidence table. The minimum authoritative implementation is hypothesis → observation → observation_evidence → evidence. Do not invent a new table unless a separately approved additive contract requires it. |
| Rejection/supersession | Does not delete evidence or observations that led to the hypothesis; prior version and support remain retrievable.                                                                                                                                                                                                                                            |

## 5.3 Finding contract

| **Rule**          | **Binding contract**                                                                                                                                                                                 |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Required fields   | finding_code, statement, domain, confidence, source_type/source_version, bmr_id, support lineage; headline optional.                                                                                 |
| Confidence        | 0–100. confidence_band may be low/medium/high/very_high only when an approved existing rule defines the mapping; otherwise leave it null rather than invent thresholds.                              |
| Confirmation      | confirmation_status is unconfirmed, confirmed, rejected, or needs_review. Confidence does not auto-select confirmation.                                                                              |
| Support options   | At least one valid row across finding_evidence, finding_observations, and/or finding_hypotheses. Every support target must belong to the same BMR.                                                   |
| Atomicity         | Finding row and all required support rows commit together, followed by the canonical event/audit/idempotency receipt in the same logical operation. Failure leaves no partial finding/support state. |
| Versioning        | Material revision creates a new finding version in the same finding_group_id with version_no+1 and supersedes_finding_id. Prior version remains.                                                     |
| Governance source | A deterministic rule/operator/import/future proposal may create an unconfirmed finding according to authorized route policy, but only authorized governance confirms/rejects.                        |

## 5.4 Exact baseline schema contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>observations(<br />
observation_id PK, observation_group_id, version_no&gt;=1, supersedes_observation_id,<br />
bmr_id FK, statement, domain, confidence 0..100, source_type, source_version,<br />
status in draft|active|superseded|rejected|archived,<br />
created_by_type, created_by_id, created_at, UNIQUE(group_id,version_no)<br />
)<br />
observation_evidence(<br />
observation_id FK, evidence_id FK, support_type in supports|contradicts|contextualizes,<br />
created_at, PRIMARY KEY(observation_id,evidence_id,support_type)<br />
)<br />
hypotheses(<br />
hypothesis_id PK, hypothesis_group_id, version_no&gt;=1, supersedes_hypothesis_id,<br />
bmr_id FK, statement, domain, confidence 0..100, uncertainty, source_type, source_version,<br />
status in draft|active|superseded|rejected|archived,<br />
created_by_type, created_by_id, created_at, UNIQUE(group_id,version_no)<br />
)<br />
hypothesis_observations(<br />
hypothesis_id FK, observation_id FK, relationship_type in supports|contradicts|contextualizes,<br />
created_at, PRIMARY KEY(hypothesis_id,observation_id,relationship_type)<br />
)<br />
findings(<br />
finding_id PK, finding_group_id, version_no&gt;=1, supersedes_finding_id, bmr_id FK,<br />
finding_code, domain, headline, statement, confidence 0..100,<br />
confidence_band null|low|medium|high|very_high,<br />
confirmation_status in unconfirmed|confirmed|rejected|needs_review,<br />
source_type, source_version, status in draft|active|superseded|rejected|archived,<br />
created_by_type, created_by_id, created_at, UNIQUE(group_id,version_no)<br />
)<br />
finding_evidence(finding_id FK,evidence_id FK,support_type,weight,created_at, composite PK)<br />
finding_observations(finding_id FK,observation_id FK,support_type,created_at, composite PK)<br />
finding_hypotheses(finding_id FK,hypothesis_id FK,relationship_type in derived_from|supports|rejects,created_at, composite PK)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 5.5 Lineage and same-BMR rule

> • Resolve every support target before any write. Gather each target’s bmr_id and reject if any differs from the command bmr_id.
>
> • For observation creation, support is at least one evidence item. The evidence must be a legitimate retained Day 3 version; current/accepted eligibility follows the actual approved service policy and must be tested.
>
> • For hypothesis creation, at least one observation is required; the observation must itself retain evidence lineage. Support/contradiction/context remains explicit.
>
> • For findings, support may be direct evidence, observations, and/or hypotheses. Do not infer a support row merely because IDs appear in narrative text or metadata.
>
> • When a finding references a hypothesis, the finding_hypotheses relationship type uses the contracted derived_from/supports/rejects set; finding evidence/observation support types use supports/contradicts/contextualizes.
>
> • No invalid support list may produce a partial root row. Validation of all targets precedes the transaction; transaction failure rolls back root + links + event/audit/idempotency as supported by the existing transaction utility.

## 5.6 Version/current/history contract

| **Concern**            | **Required behavior**                                                                                                                                    |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Material revision      | Insert a new row with same group ID, version_no=current+1, supersedes\_\* = current ID; preserve prior content and support links.                        |
| Current                | Return latest eligible non-superseded/leaf version in each group; exclude rejected/archived/history by default.                                          |
| History                | Return every version with group/version/supersedes/source/version/status/confirmation/timestamps and support links to authorized operator scope.         |
| Stale expected_version | Return 409 GV_VERSION_CONFLICT; create no new version, support rows, event, audit, or idempotency result indicating success.                             |
| Replay                 | Same key + same semantic fingerprint returns committed version/result. Same key + changed semantic fingerprint returns 409 mismatch with no state delta. |

## 5.7 Confirmation/rejection governance contract

> • Use POST /api/v1/governance/confirmations through the existing governance route/service. Do not add a public shortcut on the finding route that bypasses the same policy.
>
> • Resolve authenticated actor and authorization server-side. Request body cannot select its own operator privilege.
>
> • Require typed target record, target ID/version, decision (confirm or reject per actual route vocabulary), reason, and expected version.
>
> • Confirmation/rejection changes only the permitted governance state and appends audit/event evidence. It must not modify statement, finding_code, support links, source_type/source_version, group ID, version number, or created_at as a side effect.
>
> • The baseline documents do not fully specify whether rejection synchronizes both findings.status and confirmation_status. Codex must follow the approved existing governance implementation/tests if present. If absent, document the required transition policy rather than invent inconsistent dual-field behavior.
>
> • A future AI/model/adapter caller may propose or create an unconfirmed item only through authorized scope; it may not confirm its own result.

## 5.8 BMR projection contract

| **View**            | **Required contents**                                                                                                                      | **Exclusions/defaults**                                                      |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| BMR summary         | Stable BMR/venture identity, lifecycle, current session, counts/status summaries, current BMR record version.                              | No full raw evidence or protected internal notes by default.                 |
| Current reasoning   | Latest active non-superseded observations, hypotheses, findings, support refs, confidence/confirmation.                                    | Rejected/archived/history excluded unless specifically authorized/requested. |
| History             | All reasoning versions, supersession links, source versions, confirmations/rejections, timestamps, actor/correlation context.              | Operator authorization required; bounded/paginated.                          |
| Timeline            | Typed chronological entries for available sessions, evidence, reasoning, lifecycle, governance (and later care/outcomes when those exist). | No undifferentiated free-text report; safe summaries only.                   |
| Customer projection | Only approved/current facts/findings applicable to the product view plus canonical source-version references.                              | Protected governance/internal reasoning/audit/raw errors omitted.            |

## 5.9 Transaction boundaries

| **Command**                    | **Must commit together**                                                                                                    |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Create observation             | observation version + all observation_evidence links + canonical event + audit + idempotency receipt.                       |
| Create hypothesis              | hypothesis version + all hypothesis_observations links + canonical event + audit + idempotency receipt.                     |
| Create finding                 | finding version + all finding\_\* support links + canonical event + audit + idempotency receipt.                            |
| Supersede reasoning            | new version + new-version support links + supersession metadata + event/audit + idempotency receipt; prior version remains. |
| Confirm/reject finding         | authorized governance transition + reason/context + event/audit + idempotency/compare-and-set behavior as established.      |
| BMR transition to under_review | BMR compare-and-set version + lifecycle event + audit; no transition on failed precondition/stale version.                  |

# 6. Phase A — Freeze Day 3 Baseline and Establish Day 4 Evidence

> 1\. Checkout/pull the actual qa-revamped-galvicare-0-5 branch using the repository’s approved process. Record HEAD and ensure the worktree state is known before editing.
>
> 2\. Verify Day 3 final-gate evidence and identify the exact rollback commit/deployment. If Day 3 is not evidenced final, stop.
>
> 3\. Capture current QA and Production Worker/D1 resource identities without recording secret values.
>
> 4\. Run the complete Day 1–3 automated suite and repository/static/secret checks from the current branch. Save raw output.
>
> 5\. Run QA health/readiness/schema checks and a non-destructive Production baseline smoke. Confirm environment headers and Production behavior are unchanged.
>
> 6\. Query QA schema_migrations and sqlite_master for every Day 4 table/index. Decide “no migration required” or author one additive migration based only on actual gaps.
>
> 7\. Resolve a known-good same-BMR Day 3 accepted/current evidence record and capture its evidence_id, evidence_group_id, version_no, bmr_id, optional session_id, source type/ref, and safe hash/value summary.
>
> 8\. Resolve or create through the existing approved QA identity path a second synthetic BMR only if cross-BMR support-negative testing requires it. Never use Production data.
>
> 9\. Resolve authorized operator credentials/context and customer-scoped read context using the existing auth implementation; do not add temporary bypasses.
>
> 10\. Record pre-Day4 row counts for all reasoning/link/event/audit/idempotency tables.
>
> 11\. Create release-evidence/day4/baseline.json, pre-day4-counts.txt, and rollback.md with the starting references.
>
> 12\. Only after all preceding steps pass may Codex edit Day 4 modules.

## 6.1 Baseline evidence JSON minimum

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"repository": "mrgalvipro/galvitriage",<br />
"branch": "qa-revamped-galvicare-0-5",<br />
"starting_commit": "&lt;sha&gt;",<br />
"day3_final_commit": "&lt;sha&gt;",<br />
"qa_worker": "&lt;safe name/deployment ref&gt;",<br />
"qa_d1": "&lt;safe database ref&gt;",<br />
"schema_version": "&lt;actual&gt;",<br />
"known_good": {<br />
"founder_id": "&lt;id&gt;", "venture_id": "&lt;id&gt;", "bmr_id": "&lt;id&gt;",<br />
"session_id": "&lt;id&gt;", "evidence_ids": ["&lt;accepted/current id&gt;"]<br />
},<br />
"production_baseline": "&lt;safe commit/deployment ref&gt;",<br />
"rollback": "&lt;Day 3 known-good deployment&gt;"<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 7. Phase B — Constants, Validation, Authentication, Authorization, and Idempotency

## 7.1 Reuse/extend canonical constants

| **Contract**                         | **Allowed values / rule**                                                                                                              |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| Reasoning status                     | draft \| active \| superseded \| rejected \| archived                                                                                  |
| Observation support type             | supports \| contradicts \| contextualizes                                                                                              |
| Hypothesis relationship type         | supports \| contradicts \| contextualizes                                                                                              |
| Finding evidence/observation support | supports \| contradicts \| contextualizes                                                                                              |
| Finding-hypothesis relationship      | derived_from \| supports \| rejects                                                                                                    |
| Finding confirmation_status          | unconfirmed \| confirmed \| rejected \| needs_review                                                                                   |
| Finding confidence_band              | null \| low \| medium \| high \| very_high; no threshold mapping invented unless existing approved rule defines it                     |
| Confidence                           | 0–100 when supplied; preserve nullability where schema permits; no numeric string coercion unless shared contract explicitly allows it |
| Version                              | Integer \>=1, server-governed; expected_version is a compare-and-set precondition, not a client-selected new version.                  |

## 7.2 Validation order — fail before write

> 1\. Validate route + method + application/json + route-specific body size using existing request helpers.
>
> 2\. Parse JSON and reject malformed/non-object bodies with the canonical error envelope.
>
> 3\. Authenticate caller when route requires it. Resolve actor type/id from trusted server context.
>
> 4\. Authorize route and requested BMR scope. Do not accept a body-provided role/owner/operator flag.
>
> 5\. Resolve bmr_id. For any supplied session context, prove it belongs to the same BMR/venture according to prior-day invariants.
>
> 6\. Validate record-specific fields: bounded statement/headline/domain/source/version, confidence bounds, enums, and required finding_code.
>
> 7\. Resolve every support ID and prove same-BMR ownership before opening the write transaction.
>
> 8\. Validate lineage cardinality: observation \>=1 evidence; hypothesis \>=1 observation; finding \>=1 support across contracted link classes.
>
> 9\. For supersession/governance, load the current version and verify expected_version; reject stale or non-current targets with 409 and no mutation.
>
> 10\. Normalize a semantic request fingerprint using existing fingerprints utility. Exclude untrusted/server-generated fields; include all fields that would change canonical state or links.
>
> 11\. Check the idempotency receipt. Exact match returns prior committed result; mismatch returns GV_IDEMPOTENCY_REUSE_MISMATCH.
>
> 12\. Only then start the canonical transaction/atomic batch and persist the command.

## 7.3 Authorization matrix

| **Operation**                         | **Minimum caller rule**                                                                                                     | **Negative proof**                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| Create observation/hypothesis/finding | Use existing authorized journey/service/operator policy for reasoning creation. Caller cannot claim ownership/role in body. | Unauthenticated/unauthorized or wrong-BMR caller rejected; no reasoning/link rows. |
| Supersede reasoning                   | Authorized scope for the target BMR and record class; expected_version required.                                            | Stale/wrong-BMR/forbidden target rejected; no new version.                         |
| Confirm/reject finding                | Authorized Business Physician/operator governance role only.                                                                | Future AI/service/adapter/public caller receives 401/403; confirmation unchanged.  |
| GET current reasoning                 | Authorized scoped caller; customer variant only if explicitly supported and redacted.                                       | Cross-BMR access denied/not found according to existing policy.                    |
| GET include_history                   | Operator-level authorization; bounded pagination.                                                                           | Customer/public scope cannot retrieve protected history.                           |
| GET timeline                          | Operator/authorized view; customer projection, if provided, must be separately redacted.                                    | Protected audit/internal metadata absent from customer scope.                      |
| BMR under_review transition           | Existing lifecycle authorized operator/service policy + preconditions + expected version.                                   | Invalid/stale transition 409; no lifecycle/event/audit mutation.                   |

## 7.4 Privacy and observability

> • Log timestamp, environment, correlation_id, route, method, status, duration, actor_type, and safe canonical IDs. Do not log full reasoning/evidence bodies by default.
>
> • Audit records may retain safe field names, version transitions, reason codes, source/rule versions, and canonical IDs; redact sensitive free text according to existing policy.
>
> • Customer responses must exclude created_by_id/internal actor context when protected, raw audit diff, internal rationale, application errors, SQL details, tokens, and secrets.
>
> • Release evidence stores IDs, counts, hashes, versions, statuses, and bounded summaries—not full sensitive founder evidence or protected reasoning bodies.

# 8. Phase C — Observations and Evidence Support

## 8.1 Create observation algorithm

> 1\. Receive the canonical observation command and required Idempotency-Key through POST /api/v1/observations.
>
> 2\. Resolve trusted caller and bmr_id; validate bounded statement/domain/confidence/source_type/source_version.
>
> 3\. Require at least one evidence support reference. Reject empty support with 422 GV_LINEAGE_REQUIRED before inserting any row.
>
> 4\. Load every evidence target; prove it exists, belongs to the same bmr_id, and is eligible under the approved Day 3 evidence policy. Do not rewrite, accept, or supersede evidence here.
>
> 5\. Validate each support_type as supports, contradicts, or contextualizes; deduplicate identical links before persistence or reject duplicates consistently according to existing validation policy.
>
> 6\. Generate observation_id and observation_group_id server-side; assign version_no=1; select only the allowed initial status under existing service policy.
>
> 7\. In one logical transaction, insert the observation and every observation_evidence row, then emit the canonical domain event and audit record and persist the idempotency receipt.
>
> 8\. Return canonical JSON containing safe observation identity/version/status/BMR/source metadata and support references. Do not return raw evidence bodies by default.
>
> 9\. Directly query D1 to prove the observation row and support rows reference the expected evidence/BMR and that the same idempotent replay creates no duplicate.

## 8.2 Neutrality and boundedness rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>OBSERVATION IS NOT A FINDING<br />
</strong>An observation states only what the cited evidence directly supports. It must not embed a recommendation, treatment action, unsupported causal inference, or “confirmed diagnosis.” P0 does not require AI narrative generation. If a deterministic rule/operator creates an observation, its source_type/source_version must make that origin inspectable.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 8.3 Observation supersession

> 1\. Retrieve current observation and its group/version/support set.
>
> 2\. Require authorized scope, a material revised statement/context, rationale/reason, and expected_version.
>
> 3\. Validate the new support set independently; all support must belong to the same BMR.
>
> 4\. Generate a new observation_id; retain observation_group_id; set version_no=current+1 and supersedes_observation_id=current observation_id.
>
> 5\. Insert the new version + support links; preserve version 1 and its links. Do not rewrite the prior statement/source/link rows.
>
> 6\. Emit event/audit and return the new current version. History must show both versions and lineage.

## 8.4 Mandatory negatives

| **Scenario**                        | **Expected**                                                             |
|-------------------------------------|--------------------------------------------------------------------------|
| No evidence links                   | 422 GV_LINEAGE_REQUIRED; zero observation/link/event/audit success rows. |
| Evidence from another BMR           | 403/409/422 according to canonical mapping; no partial row.              |
| Unknown evidence ID                 | 404/422 according to canonical mapping; no row.                          |
| Confidence \<0 or \>100             | 422 GV_REQ_SCHEMA; no row.                                               |
| Changed idempotency-key reuse       | 409 GV_IDEMPOTENCY_REUSE_MISMATCH; original result unchanged.            |
| Stale supersession expected_version | 409 GV_VERSION_CONFLICT; no new version/link rows.                       |

# 9. Phase D — Hypotheses, Uncertainty, and Typed Relationships

## 9.1 Create hypothesis algorithm

> 1\. Receive POST /api/v1/hypotheses through the canonical reasoning route and apply normal request/auth/idempotency validation.
>
> 2\. Resolve bmr_id and require at least one observation relationship. Reject an unsupported hypothesis with 422 and no row.
>
> 3\. Load every observation and prove it belongs to the same BMR. Also verify each observation retains at least one evidence support row; Day 4 must not build a hypothesis on an orphan observation.
>
> 4\. Validate statement, domain, confidence 0–100, optional/required uncertainty according to the governing rule, source_type/source_version, and relationship types.
>
> 5\. Generate hypothesis_id and hypothesis_group_id server-side; version_no=1. Do not assign finding_code or confirmation_status to a hypothesis.
>
> 6\. Insert hypothesis + hypothesis_observations rows atomically, then canonical event/audit/idempotency receipt.
>
> 7\. Return the hypothesis with explicit uncertainty/confidence and typed observation links. Never label it “confirmed” merely because confidence is high.

## 9.2 Direct evidence reference clarification

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>CONTRACT RECONCILIATION — DO NOT INVENT SCHEMA<br />
</strong>The master Day 4 prose says hypotheses may be linked from observations/evidence, while the baseline SQL and data dictionary define hypothesis_observations only. Therefore Codex must use the proven transitive path hypothesis → observation → observation_evidence → evidence unless the actual repository already contains an approved direct evidence-link mechanism. Creating hypothesis_evidence is a schema change and requires an explicit approved data-contract decision; it is not an automatic Day 4 task.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 9.3 Hypothesis lifecycle/version behavior

> • Initial status follows the approved reasoning service policy, with draft being the baseline table default. A hypothesis is never a confirmed finding.
>
> • Rejecting a hypothesis preserves the row and all observation/evidence lineage; it is excluded from current reasoning by default.
>
> • Material revision creates a new hypothesis version with supersedes_hypothesis_id; prior version and relationship rows remain.
>
> • Current selection returns only the latest eligible active/draft leaf under actual status policy. Operator history may return all versions.

## 9.4 Mandatory negatives

| **Scenario**                                              | **Expected**                                                      |
|-----------------------------------------------------------|-------------------------------------------------------------------|
| No observations/support                                   | 422 GV_LINEAGE_REQUIRED; no hypothesis row.                       |
| Observation belongs to another BMR                        | Cross-scope error; no hypothesis/link rows.                       |
| Observation itself is orphaned from evidence              | Fail Day 4 lineage validation; do not propagate an invalid chain. |
| Invalid relationship type                                 | 422 GV_REQ_SCHEMA; no row.                                        |
| Missing required uncertainty under configured domain rule | 422; no row. Do not invent uncertainty text.                      |
| Hypothesis later rejected/superseded                      | Original support chain remains queryable; no deletes.             |

# 10. Phase E — Findings and Atomic Support Lineage

## 10.1 Create finding algorithm

> 1\. Receive POST /api/v1/findings with a required Idempotency-Key and trusted caller context.
>
> 2\. Resolve bmr_id and validate finding_code, statement, domain, confidence, source_type/source_version, headline if provided, and confirmation_status initial policy.
>
> 3\. Require at least one support reference across evidence, observation, and/or hypothesis. Empty total support returns 422 GV_LINEAGE_REQUIRED with no root row.
>
> 4\. Load every support target and prove it belongs to the same BMR. Validate typed support semantics for each link table. Verify observation/hypothesis upstream lineage is itself valid.
>
> 5\. Do not infer confirmation from confidence. Unless authorized governance is part of the exact same approved route contract, creation remains explicitly unconfirmed/needs_review according to policy.
>
> 6\. Generate finding_id/finding_group_id server-side, version_no=1. Use confidence_band only if an approved mapping exists; otherwise null is valid.
>
> 7\. Within one transaction/atomic unit insert the finding and all finding_evidence/finding_observations/finding_hypotheses links; then event/audit/idempotency receipt.
>
> 8\. Return the committed finding identity/version/status/confirmation and safe support references. Do not return protected evidence bodies/internal audit content by default.
>
> 9\. Replay the exact request with the same key and prove the same finding/support rows return without duplicates.

## 10.2 Support relationship mapping

| **Link table**       | **Allowed relationship**                  | **Use**                                                                           |
|----------------------|-------------------------------------------|-----------------------------------------------------------------------------------|
| finding_evidence     | supports \| contradicts \| contextualizes | Direct evidence support/context/contradiction.                                    |
| finding_observations | supports \| contradicts \| contextualizes | Neutral observation support/context/contradiction.                                |
| finding_hypotheses   | derived_from \| supports \| rejects       | Finding relation to an uncertain hypothesis. Do not erase hypothesis uncertainty. |

## 10.3 Atomicity and lineage QA

> • Induce one invalid support target among otherwise valid supports. Expected: no finding and no support links commit.
>
> • Use D1 queries to prove every active/draft finding has at least one support row across the three link tables.
>
> • Use orphan queries to prove every link target exists and matches the finding BMR.
>
> • Use count-before/count-after evidence to prove exact idempotent replay creates no additional root/support/event/audit rows.
>
> • Use a changed semantic request with the same idempotency key to prove 409 mismatch and no state delta.

## 10.4 Finding taxonomy guardrail

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>TEST FIXTURE VS. PRODUCT TAXONOMY<br />
</strong>The source contract requires finding_code but does not supply the production finding-code catalog. Codex must first reuse an existing approved repository fixture/taxonomy. If none exists, a Day 4 QA fixture may use a clearly test-scoped deterministic finding_code documented as synthetic; this does not create a production clinical taxonomy or rule library.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 11. Phase F — Confirmation, Rejection, Supersession, and Governance History

## 11.1 Confirm/reject workflow

> 1\. Retrieve the target finding and its current version/confirmation status under operator scope.
>
> 2\. Call the canonical governance confirmation route—not direct SQL and not a body-provided operator shortcut—with target type/ID, decision, reason, expected version, and Idempotency-Key according to the existing route vocabulary.
>
> 3\. Authentication/authorization resolves the Business Physician/operator server-side. Future AI/service/adapter/public caller is denied.
>
> 4\. Compare expected version to current; stale request returns 409 with no governance state/audit success mutation.
>
> 5\. Validate decision against current governance state. Preserve explicit unconfirmed/confirmed/rejected/needs_review semantics.
>
> 6\. Apply only permitted governance fields and append the canonical event/audit reason/context. Statement, code, confidence, source/version, support links, group/version identity, and created_at remain unchanged by the confirmation action.
>
> 7\. Return safe governance result and correlation ID. Query D1 to prove the finding content/support is unchanged and audit/event evidence exists.

## 11.2 Supersede a finding

> 1\. Retrieve current finding and full support set; record version/hash or safe content comparison data.
>
> 2\. Require revised material content, rationale/reason, expected_version, authorized scope, and a new validated support set.
>
> 3\. Create a new finding_id in the same finding_group_id, version_no=current+1, supersedes_finding_id=current ID.
>
> 4\. Insert new-version support links atomically. Preserve version 1 and its support rows unchanged.
>
> 5\. Set the new version’s confirmation_status according to the approved governance policy for revised material content. Do not silently inherit confirmation if the actual policy requires re-review; do not invent policy—follow existing tests/contract and document it.
>
> 6\. Emit event/audit/idempotency receipt. Current reasoning selects the new eligible leaf; operator history returns both versions and governance context.

## 11.3 Governance history requirement

> • Confirmation/rejection reason and actor/correlation must remain inspectable in append-only audit/event evidence.
>
> • Supersession is not deletion. A confirmed version that is later superseded remains historically queryable with its support and prior confirmation context.
>
> • Customer projection may show only the approved/current finding content appropriate to product view. It must not expose protected rejection rationale, internal operator IDs, raw audit diff, or superseded internal reasoning by default.

## 11.4 Mandatory governance negatives

| **Scenario**                                    | **Expected**                                                                         |
|-------------------------------------------------|--------------------------------------------------------------------------------------|
| AI/service/adapter self-confirms proposal       | 401/403; confirmation state unchanged; safe error only.                              |
| Public/customer caller confirms finding         | 401/403; no state change.                                                            |
| Stale expected version                          | 409 GV_VERSION_CONFLICT; no confirmation/rejection mutation.                         |
| Confirm action changes statement/support/source | Test failure / defect. Governance action must not modify material reasoning content. |
| Supersede deletes prior finding/link rows       | BLOCK failure. History must retain prior version and support.                        |

# 12. Phase G — BMR Current State, History, Reasoning, Timeline, and Safe Projections

## 12.1 Current reasoning

> • GET /api/v1/business-medical-records/{bmr_id}/reasoning returns separated typed collections: observations\[\], hypotheses\[\], findings\[\] plus support references—not a single narrative blob.
>
> • Default current mode selects latest eligible non-superseded leaf version for each group. Rejected/archived/history are excluded by default.
>
> • Every returned record identifies canonical ID, group/version, BMR, status, source/version, created_at, confidence where applicable, confirmation where applicable, and bounded support references.
>
> • Pagination/bounds must use the existing shared query/pagination limits found in repository configuration. Do not invent a second numeric limit in Day 4 code.

## 12.2 Operator history

> • History requires explicit include_history/current-history filter and operator-level authorization according to existing route policy.
>
> • Return all versions/supersession links/source versions/status/confirmation/timestamps plus safe actor/correlation/audit references; do not return full raw audit bodies by default.
>
> • History must prove version 1 remains after supersession and that support links for each version remain separately attributable.
>
> • Bound and paginate history deterministically. Stable ordering should use canonical time/version/ID tiebreakers consistent with existing repository conventions.

## 12.3 BMR timeline

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>TIMELINE IS A TYPED PROJECTION<br />
</strong>GET /api/v1/business-medical-records/{bmr_id}/timeline is a bounded chronological union/projection of canonical records. Each entry includes type, canonical ID, version where applicable, occurred/created timestamp, safe summary, source, and correlation reference. It does not store or generate a new canonical report row.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

> • Day 4 minimum timeline proof must include Day 2 identity/session facts, Day 3 evidence submission/acceptance/version events as available, Day 4 observation/hypothesis/finding and governance/lifecycle events.
>
> • Care/outcome/feedback categories may be absent on Day 4 if Day 5 has not been built; the timeline implementation may support them structurally without creating Day 5 data.
>
> • Chronological ordering must be deterministic. Pagination must not reorder/duplicate entries across page boundaries.
>
> • Timeline safe summary never includes secret values, raw SQL errors, or unnecessary sensitive evidence/reasoning bodies.

## 12.4 Customer/operator view separation

| **Field/category**                           | **Authorized operator history**                                        | **Customer projection**                             |
|----------------------------------------------|------------------------------------------------------------------------|-----------------------------------------------------|
| Canonical ID/version/source ref              | Yes, bounded.                                                          | Yes when needed for reproducibility/explainability. |
| Current approved finding statement           | Yes.                                                                   | Yes when approved for that product view.            |
| Unconfirmed hypotheses/internal reasoning    | Yes if authorized.                                                     | No by default.                                      |
| Rejected/superseded history                  | Yes, bounded/paginated.                                                | No by default.                                      |
| Actor IDs/internal governance reason         | Safe/authorized form only.                                             | No.                                                 |
| Audit diff / application errors / SQL detail | Restricted/redacted as policy allows.                                  | No.                                                 |
| Full raw evidence                            | Separate authorized evidence endpoint, not default reasoning/timeline. | No by default.                                      |

## 12.5 BMR lifecycle transition under review

The automated Day 4 matrix includes assessment_in_progress → under_review. Implement or exercise this only through the existing BMR lifecycle service/route with expected version and preconditions. Do not couple “a finding exists” to an invented transition rule. Follow the existing lifecycle matrix and tests. If the known-good BMR is already in another valid state, use a dedicated synthetic Day 4 fixture to prove LC-004 without mutating Production or distorting the primary evidence chain.

# 13. Phase H — REST Routes and Compatibility Actions

## 13.1 Day 4 canonical routes

| **Route**                                                  | **Caller / request essentials**                                                                                             | **Binding behavior**                                                                           |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| POST /api/v1/observations                                  | Authorized reasoning caller; bmr_id; neutral statement; source/version; \>=1 evidence support; Idempotency-Key.             | Create version 1 + observation_evidence links atomically; unsupported =\> GV_LINEAGE_REQUIRED. |
| POST /api/v1/hypotheses                                    | Authorized reasoning caller; bmr_id; uncertain statement/confidence/uncertainty as required; \>=1 observation relationship. | Create hypothesis + typed observation links; never silently promote to finding.                |
| POST /api/v1/findings                                      | Authorized reasoning caller; bmr_id; finding_code; statement/domain/confidence/source/version; \>=1 support.                | Create unconfirmed/explicit-status version + all support links atomically.                     |
| POST /api/v1/{record-class}/{id}/supersede                 | Authorized scope; new content/support; rationale; expected_version; Idempotency-Key.                                        | Create new version and supersession link; old record/support remain.                           |
| GET /api/v1/business-medical-records/{bmr_id}/reasoning    | Scoped caller; class/status/current/history filters; pagination.                                                            | Return separated typed collections + lineage. History protected.                               |
| GET /api/v1/business-medical-records/{bmr_id}/timeline     | Operator/authorized view; cursor/filter.                                                                                    | Return bounded chronological typed entries, never report blob.                                 |
| POST /api/v1/governance/confirmations                      | Authorized operator; typed target; confirm/reject; reason; expected version.                                                | Append authorized governance/audit; no material reasoning mutation.                            |
| POST /api/v1/business-medical-records/{bmr_id}/transitions | Existing lifecycle-authorized caller; to_status/reason/expected_version.                                                    | Exercise under_review transition when fixture/preconditions apply; append event/audit.         |

## 13.2 Compatibility action rule

> • POST /api may remain during the GalviCare transition only as a mapper to canonical route handlers. It must not contain a second reasoning implementation.
>
> • The master contract explicitly maps get_bmr_timeline to the canonical timeline endpoint. Preserve that mapping if present.
>
> • The master contract does not explicitly define compatibility actions for create_observation/create_hypothesis/create_finding. Do not invent those actions merely for Day 4 unless the actual repository already has an approved compatibility naming contract that maps directly to canonical handlers.

## 13.3 Canonical error behavior

| **Code**                                  | **Meaning**                                       | **HTTP** |
|-------------------------------------------|---------------------------------------------------|----------|
| GV_REQ_METHOD_NOT_ALLOWED                 | Method not contracted for route.                  | 400/405  |
| GV_REQ_CONTENT_TYPE                       | Expected application/json.                        | 415      |
| GV_REQ_BODY_INVALID                       | Malformed or non-object JSON.                     | 400      |
| GV_REQ_PAYLOAD_TOO_LARGE                  | Body exceeds route limit.                         | 413      |
| GV_REQ_SCHEMA                             | Field/domain validation failed.                   | 422      |
| GV_AUTH_REQUIRED                          | Authentication required.                          | 401      |
| GV_AUTH_FORBIDDEN                         | Caller lacks route/entity scope.                  | 403      |
| GV_NOT_FOUND                              | Requested resource absent.                        | 404      |
| GV_IDEMPOTENCY_REQUIRED                   | Required Idempotency-Key missing.                 | 400      |
| GV_IDEMPOTENCY_REUSE_MISMATCH             | Key reused with different fingerprint.            | 409      |
| GV_VERSION_CONFLICT                       | Expected version does not match current.          | 409      |
| GV_LINEAGE_REQUIRED                       | Derived record lacks required support references. | 422      |
| GV_DB_UNAVAILABLE / GV_DB_SCHEMA_OUTDATED | D1 unavailable / required migration absent.       | 503      |
| GV_INTERNAL                               | Safe-mapped unexpected internal failure.          | 500      |

## 13.4 Canonical envelope requirements

> • Every success/error is JSON using the existing shared response helper. Do not return HTML, raw exception text, SQL error text, or stack traces.
>
> • Preserve environment/correlation headers and safe response metadata already proven on Days 1–3.
>
> • Create responses normally use the established 2xx semantics (typically 201); retrieval/governance/replay uses the existing route conventions. Codex must inspect current tests rather than changing status codes for convenience.

# 14. Phase I — Fixtures, Tests, Scripts, Documentation, and Release Evidence

## 14.1 Synthetic Day 4 fixture catalog

| **Fixture**                   | **Purpose**                             | **Binding input**                                                                  |
|-------------------------------|-----------------------------------------|------------------------------------------------------------------------------------|
| D4-E1 supported evidence      | Known-good Day 3 support source.        | Existing accepted/current evidence_id on known-good BMR; no hard-coded guessed ID. |
| D4-O1 supported observation   | Positive observation + support lineage. | Neutral synthetic statement + D4-E1 + supports + deterministic source/version.     |
| D4-O0 unsupported observation | RS-001 negative.                        | Same-BMR command with zero evidence links.                                         |
| D4-H1 supported hypothesis    | Uncertainty + typed relation.           | D4-O1 + confidence + uncertainty + supports/contextualizes relationship.           |
| D4-H0 unsupported hypothesis  | RS-003 negative.                        | No observation support.                                                            |
| D4-F1 supported finding       | Unconfirmed finding + atomic support.   | Test-scoped finding_code + D4-E1/O1/H1 support; explicit confirmation state.       |
| D4-F0 unsupported finding     | RS-005 negative.                        | Valid fields but zero total support.                                               |
| D4-F2 superseding finding     | Version/history test.                   | Materially revised synthetic statement/support; expected_version from D4-F1.       |
| D4-XB cross-BMR support       | Scope-negative test.                    | A support target from a second approved synthetic QA BMR.                          |
| D4-CUST customer read         | Protected view test.                    | Actual customer-scoped auth/read context; no elevated header/body flag.            |

## 14.2 Package scripts — add only after package.json inspection

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>verify:day4-files -&gt; static file/import/config/secret/path checks<br />
test:day4 -&gt; Day 4 BLOCK test suite using real D1-compatible persistence<br />
verify:day4-reasoning -&gt; direct safe D1 lineage/version/orphan/current/history assertions<br />
smoke:day4 -&gt; QA health/readiness + reasoning/governance/timeline/view-boundary smoke</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

If the repository already has a different approved script naming pattern, extend it instead of duplicating commands. Scripts must exit nonzero on failed mandatory assertions and must identify candidate commit/environment/schema.

## 14.3 Documentation minimum

> • docs/api/day4-reasoning-timeline.md: routes, semantic request/response fields, auth classes, idempotency, versioning, lineage, governance, errors, current/history/timeline behavior.
>
> • docs/operations/day4-human-e2e.md: preconditions, exact fixture resolution, operator/customer contexts, step sequence, D1 queries, evidence capture, stop/rollback triggers.
>
> • Repository inventory/update: identify actual paths if they differ from canonical tree; explain without creating a second implementation.
>
> • Release evidence README: candidate identity, exact commands, artifact manifest, known defects, rollback point, final gate.

## 14.4 release-evidence/day4 minimum

| **Artifact**                             | **Required contents**                                                                                             |
|------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| baseline.json                            | Starting/day3 commits, QA deployment/DB/schema, known-good IDs/evidence, Production baseline, rollback.           |
| pre-day4-counts.txt                      | Safe counts for all Day 4 root/link/event/audit/idempotency tables.                                               |
| changed-files.txt                        | Exact git diff file inventory; no unexplained GalviCare/Production functional edits.                              |
| migration-transcript.txt                 | Clean/QA migration proof or explicit no-migration-required decision with schema evidence.                         |
| deployment-metadata.json                 | Final commit, QA deployment, URL, D1 safe ref, schema, compatibility date, environment/fixture facts.             |
| automated-tests.txt/json                 | All applicable BLOCK tests with candidate commit/schema/environment, skipped=0.                                   |
| database-assertions.sql/txt              | Lineage/orphan/version/current/history/idempotency/audit/timeline input queries and results.                      |
| reasoning-trace.json                     | Canonical ID chain evidence→observation→hypothesis→finding→superseding finding with versions/links.               |
| timeline-trace.json                      | Typed chronological entry IDs/timestamps and reconciliation to D1.                                                |
| view-boundary.json                       | Safe comparison proving customer projection omits protected fields and operator history is authorized/bounded.    |
| human-e2e.md                             | Step-by-step expected/actual, correlation IDs, canonical IDs, screenshots where useful, D1 assertions, pass/fail. |
| defects.md / rollback.md / final-gate.md | Severity/decision, tested rollback reference, and explicit DAY 4 gate result.                                     |

# 15. Automated QA Matrix and Execution Order

## 15.1 Mandatory execution order

> 1\. Static repository/configuration/import/secret checks.
>
> 2\. Clean local migration or clean schema apply using repository migrations. If Day 4 has no new migration, still verify the full schema on a clean test DB.
>
> 3\. Unit/domain tests for validation, lineage, uncertainty, confirmation, versioning, current selection, redaction.
>
> 4\. Repository integration tests against migrated D1-compatible persistence.
>
> 5\. API contract/security tests in the Worker test harness.
>
> 6\. Integrated QA Worker + QA D1 smoke/workflow tests.
>
> 7\. Failure/idempotency/stale-version/cross-BMR/view-boundary tests.
>
> 8\. Full Day 1–3 regression + Production baseline smoke + release-evidence validation.
>
> 9\. Only after every BLOCK test passes and mandatory skipped=0: Human E2E.

## 15.2 Exact Day 4 BLOCK tests from the master matrix

| **Test ID** | **Scenario**                            | **Expected result / proof**                                                  |
|-------------|-----------------------------------------|------------------------------------------------------------------------------|
| IP-004      | Finding creation exact replay.          | Same finding/support rows; no duplicate event/link. HTTP + DB counts. BLOCK. |
| RS-001      | Observation without evidence.           | 422 GV_LINEAGE_REQUIRED; no row. HTTP + DB. BLOCK.                           |
| RS-002      | Supported observation.                  | Observation + support link + event/audit. HTTP + DB. BLOCK.                  |
| RS-003      | Hypothesis without observation/support. | 422; no row. HTTP + DB. BLOCK.                                               |
| RS-004      | Hypothesis supports/contradicts links.  | Typed links persisted. HTTP + DB. BLOCK.                                     |
| RS-005      | Finding without support.                | 422; no row. HTTP + DB. BLOCK.                                               |
| RS-006      | Supported finding.                      | Finding and all links atomic. HTTP + DB. BLOCK.                              |
| RS-007      | Unconfirmed vs confirmed finding.       | State explicit; authorized confirmation only. HTTP + DB. BLOCK.              |
| RS-008      | Supersede finding.                      | Version 2; version 1 retained; links/history valid. HTTP + DB. BLOCK.        |
| RS-009      | Stale reasoning version.                | 409; no partial version/link rows. HTTP + DB. BLOCK.                         |
| RS-010      | BMR reasoning current/history.          | Correct version selection and pagination. HTTP + DB. BLOCK.                  |
| LC-004      | assessment_in_progress → under_review.  | Valid BMR version/event/audit. HTTP + DB. BLOCK.                             |
| LC-008      | Stale BMR expected version.             | 409; no mutation. HTTP + DB. BLOCK.                                          |
| LC-009      | Identical BMR transition replay.        | Original response; no duplicate event/audit. HTTP + DB. BLOCK.               |
| LC-010      | BMR timeline.                           | Typed chronological identity/evidence/reasoning events. HTTP + DB. BLOCK.    |

## 15.3 Day 4 acceptance gates

| **Gate** | **Acceptance criterion**                                              | **Required evidence**              |
|----------|-----------------------------------------------------------------------|------------------------------------|
| D4-01    | Observation and finding require support lineage.                      | Negative + positive lineage tests. |
| D4-02    | Hypothesis uncertainty and finding confirmation remain distinct.      | Domain/API assertions.             |
| D4-03    | Reasoning revision preserves prior versions.                          | History/supersession query.        |
| D4-04    | BMR timeline reconstructs typed identity/evidence/reasoning sequence. | Timeline response + D1 IDs.        |
| D4-05    | Customer view excludes protected history/internal fields.             | Authorization/view tests.          |

## 15.4 Additional critical-path assertions

> • Cross-BMR support references fail with no partial rows.
>
> • All active/draft observations have at least one observation_evidence row.
>
> • All active/draft hypotheses have at least one hypothesis_observations row under the baseline schema path.
>
> • All active/draft findings have at least one support row across finding_evidence/finding_observations/finding_hypotheses.
>
> • No orphan support link exists.
>
> • Version numbers are unique within group and supersedes links point to same-BMR/same-group prior version.
>
> • Authorized confirmation changes only allowed governance fields and produces audit/event evidence; unauthorized confirmation fails.
>
> • Current reasoning excludes prior superseded/rejected/archived versions; history returns them to operator scope.
>
> • Customer view contains no protected audit/internal reasoning fields.
>
> • Day 1–3 mandatory suites remain green and no Production resource/config file is functionally altered.

## 15.5 Automated report completion rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>AUTOMATED QA PASS<br />
</strong>The Day 4 automated gate passes only when every applicable BLOCK test has executed and passed, mandatory skipped count is zero, artifacts identify the exact candidate commit/schema/environment/Worker deployment, and database-dependent claims include direct D1 proof. A passing subset, mocked persistence, stale report, or rerun without candidate identity cannot authorize Human E2E.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16. Local and QA Deployment Runbook

## 16.1 Local build sequence

> 1\. Fetch actual branch state and save baseline evidence. Do not edit until Day 3 preflight is green.
>
> 2\. Implement repository/domain logic first: reasoning-repository → reasoning-service → any bounded BMR/governance extension.
>
> 3\. Run syntax/static/import checks after each module batch.
>
> 4\. Apply repository migrations to a fresh local/test D1. Verify all reasoning tables/indexes/constraints. If a Day 4 migration exists, rehearse it both clean and upgrade-from-Day3.
>
> 5\. Run Day 4 unit/domain/repository tests until all reasoning lineage/version/governance/current-history assertions pass.
>
> 6\. Wire routes to existing app/router/response/auth infrastructure. No route-level SQL.
>
> 7\. Run full Day 4 API/security/idempotency suite and Day 1–3 regression.
>
> 8\. Run verify-day4-reasoning direct DB assertions. Mandatory failures exit nonzero.
>
> 9\. Review git diff for scope. Confirm no Production/GalviCare workflow file was altered except truly shared canonical modules that require additive Day 4 behavior; regression proof is mandatory for any shared-file edit.

## 16.2 QA deployment gate

| **Gate**              | **Pass condition**                                                                                                |
|-----------------------|-------------------------------------------------------------------------------------------------------------------|
| Static                | All required modules resolve; no syntax/circular-init error; no secrets.                                          |
| Configuration         | QA Worker/D1 are distinct from Production; allowed origins/fixture policy unchanged except approved QA additions. |
| Schema                | Required reasoning objects/indexes exist; ledger/readiness reports correct minimum schema.                        |
| Automated QA          | All Day 4 BLOCK tests pass; skipped=0; Day 1–3 regression green.                                                  |
| Production protection | Production baseline smoke remains unchanged; no Production deployment/migration.                                  |
| Rollback              | Day 3 known-good commit/deployment remains available and documented.                                              |

## 16.3 QA deploy and smoke order

> 1\. Apply an approved Day 4 additive migration to QA only if required and already proven locally. Otherwise record no migration required.
>
> 2\. Deploy the exact candidate commit to the isolated QA Worker.
>
> 3\. Capture Worker deployment/version and call health, readiness, schema-version. Verify QA environment and DB ready.
>
> 4\. Resolve known-good Day 3 IDs/evidence from QA through approved read paths/D1 assertions.
>
> 5\. Create supported observation; exact replay; unsupported negative.
>
> 6\. Create supported hypothesis; unsupported negative; verify typed relationships.
>
> 7\. Create supported unconfirmed finding; exact replay; unsupported negative.
>
> 8\. Confirm the finding through authorized governance; deny unauthorized confirmation.
>
> 9\. Supersede the finding; test stale expected_version; retrieve current/history.
>
> 10\. Retrieve BMR timeline and reconcile typed IDs/timestamps to D1.
>
> 11\. Retrieve customer-scoped projection and prove protected internal/history fields absent.
>
> 12\. Run cross-BMR support negative and BMR lifecycle under_review test on approved synthetic fixture.
>
> 13\. Run full Day 1–3 regression and a non-destructive Production baseline smoke.
>
> 14\. Freeze candidate only if all smoke and assertions pass.

# 17. Day 4 Human E2E Procedure

## 17.1 Preconditions

> • Exact candidate commit, QA Worker deployment, QA D1 database, environment, schema version, and fixture policy are recorded.
>
> • All applicable Day 4 BLOCK tests pass and mandatory skipped count is zero.
>
> • Known-good Day 3 founder/venture/BMR/session and accepted/current evidence IDs are available.
>
> • Authorized operator context and customer-scoped context are verified without temporary bypasses.
>
> • release-evidence/day4 is ready and database-assertions.sql has been reviewed for safe QA use.
>
> • Day 3 rollback commit/deployment is available.
>
> • No one will use direct D1 edits, browser local-state manipulation, or undocumented manual repair to force the flow to pass.

## 17.2 Evidence capture standard

| **Evidence class** | **Required capture**                                                                                                                      |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Run identity       | Run ID, UTC/local time with timezone, environment, branch/commit, Worker deployment, schema, tester roles.                                |
| API/client         | Method/route, safe request summary, HTTP status, canonical envelope, correlation ID, canonical IDs.                                       |
| D1                 | Prepared safe query/result proving row counts, same-BMR links, versions, governance/audit, idempotency, current/history, timeline inputs. |
| View boundary      | Customer vs operator safe field comparison; no secrets/full sensitive payloads.                                                           |
| Defect             | Expected vs actual, severity, reproducibility, IDs/correlation, screenshot/query, workaround if any.                                      |
| Decision           | Pass/fail by scenario and final GO/STOP/ROLLBACK with rationale/known issues.                                                             |

## 17.3 Human E2E steps

| **Step**                              | **Action**                                                                                                                    | **Pass condition**                                                                                                                                      |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| H4.1 — Baseline continuity            | Retrieve the known-good Day 3 BMR, session, current accepted evidence, and Day 3 evidence history through approved paths.     | Same canonical IDs and evidence versions return; D1 counts match Day 3 baseline; no duplicate/repair.                                                   |
| H4.2 — Create supported observation   | POST observation using one current same-BMR evidence link and a deterministic synthetic neutral statement.                    | 201/contracted success; observation v1 + support row + event/audit; source/version retained.                                                            |
| H4.3 — Reject unsupported observation | Submit same-valid observation fields without evidence support using a new key.                                                | 422 GV_LINEAGE_REQUIRED; no root/link/event/audit success delta.                                                                                        |
| H4.4 — Create hypothesis              | POST a hypothesis referencing H4.2 observation with confidence and explicit uncertainty; include a typed relationship.        | Hypothesis v1 persists; relation row exists; uncertainty remains explicit; no finding created implicitly.                                               |
| H4.5 — Reject unsupported hypothesis  | Submit hypothesis with zero observations/support.                                                                             | 422/no row; no partial state.                                                                                                                           |
| H4.6 — Create supported finding       | POST a test-scoped finding_code + statement/domain/confidence/source/version with support to H4.2/H4.4 and/or Day 3 evidence. | Finding v1 + all links atomically; confirmation_status explicit and not silently confirmed.                                                             |
| H4.7 — Idempotent finding replay      | Repeat H4.6 with the same key/fingerprint.                                                                                    | Same finding_id/version/support rows; no duplicate links/event/audit.                                                                                   |
| H4.8 — Changed key reuse              | Reuse H4.6 key with a changed statement/support.                                                                              | 409 idempotency mismatch; no new finding/version/link rows.                                                                                             |
| H4.9 — Authorized confirmation        | Authorized operator confirms H4.6 through governance route with reason + expected version.                                    | Explicit confirmed state; audit/event exists; statement/source/support/version identity unchanged.                                                      |
| H4.10 — Unauthorized confirmation     | Repeat against another test finding as customer/public/AI-service context.                                                    | 401/403; confirmation unchanged; no privileged audit success.                                                                                           |
| H4.11 — Stale version                 | Attempt supersession/governance with stale expected_version.                                                                  | 409 GV_VERSION_CONFLICT; no partial new version/link/event/audit.                                                                                       |
| H4.12 — Supersede finding             | Create material corrected/revised finding version with valid support and expected current version.                            | Finding v2 same group, supersedes v1; v1/support/confirmation history preserved; v2 is new current eligible leaf per policy.                            |
| H4.13 — Current vs history            | GET BMR reasoning current, then authorized history.                                                                           | Current returns latest eligible versions only; history returns v1/v2, supersession, support, source/version, governance context; pagination works.      |
| H4.14 — Timeline                      | GET BMR timeline.                                                                                                             | Chronological typed entries reconstruct Day 2 identity/session → Day 3 evidence → Day 4 observation/hypothesis/finding/governance; IDs reconcile to D1. |
| H4.15 — Customer projection           | Retrieve the applicable customer-scoped BMR/reasoning projection.                                                             | Approved current content only; protected hypothesis/history/audit/internal actor/reason fields excluded.                                                |
| H4.16 — Cross-BMR negative            | Attempt to create one observation/finding using a support ID from a second synthetic BMR.                                     | Cross-scope error; no partial reasoning/link rows in either BMR.                                                                                        |
| H4.17 — BMR under_review lifecycle    | On the dedicated valid fixture, transition assessment_in_progress → under_review using expected version and approved caller.  | BMR version increments and event/audit commit; stale/replay cases behave per LC-008/LC-009.                                                             |
| H4.18 — Refresh/reconnect             | Close/reopen client/test harness and retrieve current reasoning/timeline again.                                               | All canonical IDs/versions/links return from D1; no browser state required.                                                                             |
| H4.19 — Production regression         | Run the approved non-destructive Production baseline smoke only.                                                              | Production remains unchanged and healthy; no Day 4 QA data/routes are promoted.                                                                         |

## 17.4 Required D1 proof before Human PASS

> • One supported observation and its evidence link; zero unsupported observation rows.
>
> • One supported hypothesis and its observation relationship; zero unsupported hypothesis rows.
>
> • One supported finding with all support links committed atomically; exact replay unchanged.
>
> • Confirmation audit/event plus unchanged material finding fields/support set.
>
> • Finding version 1 + version 2, correct finding_group_id/version_no/supersedes_finding_id, and per-version links.
>
> • No active/draft orphan observation/hypothesis/finding; no cross-BMR support link.
>
> • Current reasoning selects expected leaf; authorized history returns preserved versions.
>
> • Timeline IDs/timestamps reconcile to canonical tables/events.
>
> • Customer projection field set omits protected history/internal governance.
>
> • Day 1–3 regression counts/invariants and Production baseline remain unchanged.

# 18. Acceptance Gate, Rollback, and Final Codex Handoff

## 18.1 Final Day 4 GO/STOP rules

| **Decision**           | **Conditions**                                                                                                                                                                                      | **Required action**                                                                                                                                                                      |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GO — DAY 4 BUILD FINAL | All D4-01..D4-05 and applicable IP/RS/LC BLOCK tests pass; Human E2E passes with D1 proof; Day 1–3 regression and Production protection green; no blocker/critical/high defect; rollback available. | Record final commit/deployment/schema, evidence links, known non-blocking issues, owner, and DAY 4 HUMAN E2E PASS → DAY 4 BUILD FINAL.                                                   |
| STOP — hold Day 4      | Any mandatory test/evidence missing; lineage/version/view safety uncertain; issue found before/without need to revert deployment.                                                                   | Fix in QA; create new candidate; rerun affected tests plus regression. Do not declare final.                                                                                             |
| ROLLBACK               | QA runtime stability, data integrity, shared GalviCare behavior, auth/view boundary, or prior-day behavior is adversely affected.                                                                   | Restore Day 3 known-good Worker deployment/commit immediately. Preserve additive schema unless an approved forward compensation is required. Capture incident evidence and return to QA. |

## 18.2 Rollback procedure

> 1\. Stop Day 4 acceptance and record the exact failing request/correlation/deployment/commit and defect severity.
>
> 2\. Do not perform destructive down migrations or manual deletes from canonical QA/Production tables.
>
> 3\. Roll the isolated QA Worker back to the recorded Day 3 known-good deployment/commit using the established deployment process.
>
> 4\. Leave additive schema objects in place unless they themselves create an integrity/security hazard; if schema correction is needed, author an approved forward/compensating migration in QA.
>
> 5\. Run health/readiness + Day 1–3 regression + Day 3 evidence smoke to prove rollback restored the known-good state.
>
> 6\. Record rollback command/output/deployment and D1 assertions in release-evidence/day4/rollback.md.
>
> 7\. Fix Day 4 root cause on a new candidate and rerun full applicable automated gate before redeployment.

## 18.3 Final Codex handoff — required report

> • Starting commit, Day 3 final commit, final Day 4 commit, branch, exact changed files, and concise reason for every shared-file edit.
>
> • Migration decision, migration IDs/checksums if any, clean/QA apply commands, ledger/schema/index results.
>
> • QA Worker name/deployment/URL, QA D1 safe reference, environment/schema/fixture facts, and Production baseline/rollback refs.
>
> • Automated test inventory with pass/fail/skipped counts and IDs; explicitly state mandatory skipped=0.
>
> • Canonical Day 4 IDs: evidence, observation/group/version, hypothesis/group/version, finding/group/version(s), support links, BMR/session, correlation IDs (safe form).
>
> • D1 assertions proving lineage, no orphans, versions/supersession, idempotency, governance audit, current/history selection, and timeline input reconciliation.
>
> • Human E2E scenario table with expected/actual and evidence files.
>
> • Known defects with severity/owner/decision. No critical/high defect may remain for BUILD FINAL.
>
> • Rollback rehearsal/result and exact known-good deployment.
>
> • Final decision: GO, STOP, or ROLLBACK. Never state BUILD FINAL from a code diff or green deployment alone.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>FINAL STATUS LANGUAGE<br />
</strong>Only after every blocking gate and required artifact passes may Codex state: DAY 4 HUMAN E2E PASS → DAY 4 BUILD FINAL. If any required proof is missing, contradictory, stale, mocked, skipped, or obtained through undocumented repair, the correct decision is STOP or ROLLBACK—not “pass with caveats.”</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix A — Day 4 API Contract

The master contract defines the routes and semantic requirements but does not specify every Day 4 JSON property name. The payloads below are a reference implementation shape using the schema field names. Codex must first inspect the actual current route/service/tests; if an approved equivalent property name already exists, preserve it rather than creating a second body contract.

## A.1 Create observation — reference shape

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>POST /api/v1/observations<br />
Idempotency-Key: d4-observation-&lt;run&gt;<br />
{<br />
"bmr_id": "bmr_...",<br />
"statement": "&lt;neutral bounded synthetic statement&gt;",<br />
"domain": "&lt;existing/test domain&gt;",<br />
"confidence": 80,<br />
"source_type": "deterministic_rule",<br />
"source_version": "&lt;existing/test rule version&gt;",<br />
"evidence_links": [<br />
{"evidence_id": "evd_...", "support_type": "supports"}<br />
]<br />
}<br />
<br />
201/contracted success -&gt; observation_id, observation_group_id, version_no=1,<br />
status, bmr_id, source_type/source_version, created_at, safe support references.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## A.2 Create hypothesis — reference shape

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>POST /api/v1/hypotheses<br />
Idempotency-Key: d4-hypothesis-&lt;run&gt;<br />
{<br />
"bmr_id": "bmr_...",<br />
"statement": "&lt;explicitly uncertain explanation&gt;",<br />
"domain": "&lt;existing/test domain&gt;",<br />
"confidence": 55,<br />
"uncertainty": "&lt;bounded uncertainty statement when required&gt;",<br />
"source_type": "authorized_operator",<br />
"source_version": "&lt;version or null per policy&gt;",<br />
"observation_links": [<br />
{"observation_id": "obs_...", "relationship_type": "supports"}<br />
]<br />
}<br />
<br />
Do not add direct evidence link fields/table unless the actual approved contract supports them.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## A.3 Create finding — reference shape

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>POST /api/v1/findings<br />
Idempotency-Key: d4-finding-&lt;run&gt;<br />
{<br />
"bmr_id": "bmr_...",<br />
"finding_code": "&lt;existing or clearly test-scoped code&gt;",<br />
"domain": "&lt;existing/test domain&gt;",<br />
"headline": "&lt;optional bounded headline&gt;",<br />
"statement": "&lt;supported conclusion&gt;",<br />
"confidence": 78,<br />
"confirmation_status": "unconfirmed",<br />
"source_type": "deterministic_rule",<br />
"source_version": "&lt;version&gt;",<br />
"support": {<br />
"evidence": [{"evidence_id":"evd_...","support_type":"supports"}],<br />
"observations": [{"observation_id":"obs_...","support_type":"supports"}],<br />
"hypotheses": [{"hypothesis_id":"hyp_...","relationship_type":"derived_from"}]<br />
}<br />
}<br />
<br />
Root + all support links must be atomic. At least one total support link required.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## A.4 Supersede reasoning — semantic contract

| **Input** | **Requirement**                                                                                                                   |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------|
| Path      | POST /api/v1/{record-class}/{id}/supersede, where record-class is an approved reasoning class supported by the actual router.     |
| Body      | New material content + complete desired support set + rationale/reason + expected_version. Do not trust client group/version IDs. |
| Result    | New server-generated ID, same group ID, version_no+1, supersedes prior ID; prior version/support remain.                          |
| Conflict  | Stale expected version =\> 409 GV_VERSION_CONFLICT and no new version/link/event/audit.                                           |

## A.5 Governance confirmation — semantic contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>POST /api/v1/governance/confirmations<br />
Idempotency-Key: d4-confirm-&lt;run&gt;<br />
{<br />
"record_type": "finding",<br />
"record_id": "fnd_...",<br />
"decision": "confirm | reject",<br />
"reason": "&lt;bounded governance reason&gt;",<br />
"expected_version": 1<br />
}<br />
<br />
Only the actual authorized operator role may succeed. The route appends governance/audit<br />
evidence and must not alter the finding statement/source/support as a side effect.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## A.6 Retrieval contracts

| **Route**                                               | **Default / authorized behavior**                                                                       |
|---------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| GET /api/v1/business-medical-records/{bmr_id}           | BMR header + bounded current summaries; not full raw history.                                           |
| GET /api/v1/business-medical-records/{bmr_id}/reasoning | Separated typed current reasoning; class/status/current/history filters; include_history operator-only. |
| GET /api/v1/business-medical-records/{bmr_id}/timeline  | Bounded chronological typed entries; operator/authorized view; safe summaries.                          |

# Appendix B — Reasoning and Timeline SQL Verification Queries

These are safe QA verification patterns. Codex must adapt only column names that differ in the actual approved repository schema; do not run ad hoc write/repair SQL. Save query text and bounded results in release evidence.

## B.1 Schema inventory

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT migration_id, name, environment, applied_at<br />
FROM schema_migrations ORDER BY migration_id;<br />
<br />
SELECT name, type<br />
FROM sqlite_master<br />
WHERE name IN (<br />
'observations','observation_evidence','hypotheses','hypothesis_observations',<br />
'findings','finding_evidence','finding_observations','finding_hypotheses',<br />
'idx_observations_bmr','idx_hypotheses_bmr','idx_findings_bmr'<br />
)<br />
ORDER BY type, name;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.2 Active/draft observations without evidence — must return zero

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT o.observation_id, o.bmr_id, o.status<br />
FROM observations o<br />
LEFT JOIN observation_evidence oe ON oe.observation_id = o.observation_id<br />
WHERE oe.observation_id IS NULL<br />
AND o.status IN ('active','draft');</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.3 Active/draft hypotheses without observations — must return zero

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT h.hypothesis_id, h.bmr_id, h.status<br />
FROM hypotheses h<br />
LEFT JOIN hypothesis_observations ho ON ho.hypothesis_id = h.hypothesis_id<br />
WHERE ho.hypothesis_id IS NULL<br />
AND h.status IN ('active','draft');</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.4 Active/draft findings without any support — must return zero

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT f.finding_id, f.bmr_id, f.status<br />
FROM findings f<br />
LEFT JOIN finding_evidence fe ON fe.finding_id = f.finding_id<br />
LEFT JOIN finding_observations fo ON fo.finding_id = f.finding_id<br />
LEFT JOIN finding_hypotheses fh ON fh.finding_id = f.finding_id<br />
WHERE fe.finding_id IS NULL<br />
AND fo.finding_id IS NULL<br />
AND fh.finding_id IS NULL<br />
AND f.status IN ('active','draft');</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.5 Cross-BMR support — must return zero

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT o.observation_id, o.bmr_id AS observation_bmr, e.evidence_id, e.bmr_id AS evidence_bmr<br />
FROM observation_evidence oe<br />
JOIN observations o ON o.observation_id = oe.observation_id<br />
JOIN evidence_items e ON e.evidence_id = oe.evidence_id<br />
WHERE o.bmr_id &lt;&gt; e.bmr_id;<br />
<br />
SELECT h.hypothesis_id, h.bmr_id AS hypothesis_bmr, o.observation_id, o.bmr_id AS observation_bmr<br />
FROM hypothesis_observations ho<br />
JOIN hypotheses h ON h.hypothesis_id = ho.hypothesis_id<br />
JOIN observations o ON o.observation_id = ho.observation_id<br />
WHERE h.bmr_id &lt;&gt; o.bmr_id;<br />
<br />
SELECT f.finding_id, f.bmr_id, e.evidence_id, e.bmr_id AS support_bmr<br />
FROM finding_evidence fe JOIN findings f ON f.finding_id=fe.finding_id<br />
JOIN evidence_items e ON e.evidence_id=fe.evidence_id<br />
WHERE f.bmr_id &lt;&gt; e.bmr_id;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.6 Version/supersession integrity

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT finding_group_id, version_no, COUNT(*) AS c<br />
FROM findings GROUP BY finding_group_id, version_no HAVING c &lt;&gt; 1;<br />
<br />
SELECT child.finding_id, child.finding_group_id, child.version_no,<br />
prior.finding_id AS prior_id, prior.finding_group_id AS prior_group, prior.version_no AS prior_version<br />
FROM findings child<br />
JOIN findings prior ON prior.finding_id = child.supersedes_finding_id<br />
WHERE child.finding_group_id &lt;&gt; prior.finding_group_id<br />
OR child.bmr_id &lt;&gt; prior.bmr_id<br />
OR child.version_no &lt;&gt; prior.version_no + 1;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.7 Current finding leaf query — use to verify service selection

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT f.*<br />
FROM findings f<br />
WHERE f.bmr_id = ?<br />
AND f.status NOT IN ('rejected','archived')<br />
AND NOT EXISTS (<br />
SELECT 1 FROM findings newer<br />
WHERE newer.supersedes_finding_id = f.finding_id<br />
)<br />
ORDER BY f.created_at, f.finding_id;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## B.8 Governance/audit trace

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT entity_type, entity_id, operation, correlation_id, occurred_at<br />
FROM audit_log<br />
WHERE entity_type = 'finding' AND entity_id IN (?, ?)<br />
ORDER BY occurred_at, audit_id;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

If audit_log uses a different primary-key/order column in the actual schema, use its approved stable ordering. Do not invent or alter the audit schema just for this query.

## B.9 Row-count delta sheet

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>SELECT 'observations' AS table_name, COUNT(*) AS c FROM observations<br />
UNION ALL SELECT 'observation_evidence', COUNT(*) FROM observation_evidence<br />
UNION ALL SELECT 'hypotheses', COUNT(*) FROM hypotheses<br />
UNION ALL SELECT 'hypothesis_observations', COUNT(*) FROM hypothesis_observations<br />
UNION ALL SELECT 'findings', COUNT(*) FROM findings<br />
UNION ALL SELECT 'finding_evidence', COUNT(*) FROM finding_evidence<br />
UNION ALL SELECT 'finding_observations', COUNT(*) FROM finding_observations<br />
UNION ALL SELECT 'finding_hypotheses', COUNT(*) FROM finding_hypotheses;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix C — Fixture Catalog and Expected Row Deltas

Exact event/audit/idempotency row deltas depend on the already-approved shared utility implementation. The root/link deltas below are binding minimums; event/audit/receipt deltas must match the existing one-command behavior proved on prior days and the Day 4 tests.

| **Action**                | **Root delta**                                                                                               | **Link delta**                                                        | **Replay / failure delta**                                           |
|---------------------------|--------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|----------------------------------------------------------------------|
| Create D4-O1 observation  | +1 observations                                                                                              | +1 or more observation_evidence                                       | Exact replay +0; unsupported/cross-BMR +0.                           |
| Create D4-H1 hypothesis   | +1 hypotheses                                                                                                | +1 or more hypothesis_observations                                    | Exact replay +0; unsupported +0.                                     |
| Create D4-F1 finding      | +1 findings                                                                                                  | +1 or more across finding\_\*                                         | Exact replay +0; unsupported/partial-invalid +0.                     |
| Confirm D4-F1             | No new reasoning root version unless existing approved governance policy explicitly versions the transition. | No support-link changes.                                              | Unauthorized/stale +0 state change; authorized audit/event required. |
| Supersede D4-F1 -\> D4-F2 | +1 findings (same group, v2)                                                                                 | New version receives its own complete support set; v1 links retained. | Stale +0.                                                            |
| Current/history GET       | +0                                                                                                           | +0                                                                    | Read-only; no canonical state mutation.                              |
| Timeline/customer GET     | +0                                                                                                           | +0                                                                    | Read-only; no canonical state mutation.                              |

## C.1 Synthetic data rules

> • Use synthetic QA-only narrative text that contains no real founder secrets or sensitive business data.
>
> • Do not hard-code canonical IDs in committed fixtures when they are environment-generated; resolve from fixture aliases/runtime setup and record actual IDs in release evidence.
>
> • Use deterministic idempotency keys unique to the run semantic request, not random keys that make replay proof difficult.
>
> • If a second BMR is required for cross-scope negatives, create it through Day 2 canonical APIs/fixture setup in QA, not direct SQL.
>
> • Do not delete canonical rows to reset a failed run. Use the approved synthetic fixture reset/rebuild strategy or a fresh test identity as established by prior-day harnesses.

# Appendix D — Release-Evidence Templates

## D.1 automated-tests.json template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"suite": "galvivault-p0-day4",<br />
"candidate_commit": "&lt;sha&gt;",<br />
"environment": "local | qa",<br />
"worker_deployment": "&lt;id-or-null&gt;",<br />
"schema_version": "&lt;actual&gt;",<br />
"started_at": "&lt;ISO-8601&gt;",<br />
"completed_at": "&lt;ISO-8601&gt;",<br />
"summary": {"total":0,"passed":0,"failed":0,"skipped":0},<br />
"blocking_failures": [],<br />
"tests": [<br />
{<br />
"id": "RS-006", "status": "pass", "correlation_id": "corr_...",<br />
"canonical_ids": ["bmr_...","obs_...","hyp_...","fnd_..."],<br />
"evidence": ["release-evidence/day4/reasoning-trace.json"]<br />
}<br />
]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## D.2 reasoning-trace.json template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"bmr_id": "bmr_...",<br />
"day3_evidence": [{"evidence_id":"evd_...","version_no":1}],<br />
"observation": {<br />
"observation_id":"obs_...","group_id":"obg_...","version_no":1,<br />
"evidence_links":[{"evidence_id":"evd_...","support_type":"supports"}]<br />
},<br />
"hypothesis": {<br />
"hypothesis_id":"hyp_...","group_id":"hyg_...","version_no":1,<br />
"uncertainty_present":true,<br />
"observation_links":[{"observation_id":"obs_...","relationship_type":"supports"}]<br />
},<br />
"finding_history": [<br />
{"finding_id":"fnd_v1","group_id":"fng_...","version_no":1,"confirmation_status":"confirmed"},<br />
{"finding_id":"fnd_v2","group_id":"fng_...","version_no":2,"supersedes_finding_id":"fnd_v1"}<br />
]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## D.3 final-gate.md template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># Day 4 Final Gate<br />
- Repository / branch: mrgalvipro/galvitriage / qa-revamped-galvicare-0-5<br />
- Starting commit: &lt;sha&gt;<br />
- Final candidate commit: &lt;sha&gt;<br />
- QA Worker deployment: &lt;safe ref&gt;<br />
- QA D1: &lt;safe ref&gt;<br />
- Schema version / migration decision: &lt;value&gt;<br />
- Automated BLOCK tests: &lt;passed&gt;/&lt;total&gt;; failed=0; skipped=0<br />
- D4-01: PASS | FAIL<br />
- D4-02: PASS | FAIL<br />
- D4-03: PASS | FAIL<br />
- D4-04: PASS | FAIL<br />
- D4-05: PASS | FAIL<br />
- Human E2E: PASS | FAIL<br />
- Day 1–3 regression: PASS | FAIL<br />
- Production baseline unchanged: PASS | FAIL<br />
- Critical/high defects: 0 required for final<br />
- Rollback reference tested: YES | NO<br />
- Decision: GO | STOP | ROLLBACK<br />
- Final status language (GO only): DAY 4 HUMAN E2E PASS → DAY 4 BUILD FINAL</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix E — Codex Final Implementation Report Template

## E.1 Required report sections

> 1\. Executive outcome — one paragraph stating what Day 4 changed and the final GO/STOP/ROLLBACK decision.
>
> 2\. Candidate identity — repository, branch, starting SHA, Day 3 final SHA, final SHA, working tree status.
>
> 3\. Changed files — exact paths plus one-line purpose; explicitly call out every shared GalviCare/Worker file and why the edit was necessary.
>
> 4\. Migration/schema — actual ledger, objects/indexes verified, additive migration details or no-migration-required proof.
>
> 5\. Implementation summary — observation/hypothesis/finding lineage, idempotency, versioning, governance, BMR current/history/timeline, view safety.
>
> 6\. Automated QA — command transcript and machine-readable report summary, including IP-004, RS-001..010, LC-004/008/009/010 and D4 gates.
>
> 7\. QA deployment — deployment ID/URL, environment/readiness/schema outputs, D1 safe reference.
>
> 8\. D1 proof — no unsupported/orphan/cross-BMR reasoning; support rows; v1/v2 supersession; confirmation audit; idempotency counts; current/history/timeline reconciliation.
>
> 9\. Human E2E — H4.1..H4.19 expected/actual with correlation/canonical IDs and evidence artifact paths.
>
> 10\. Regression — Day 1–3 suites and Production baseline smoke.
>
> 11\. Defects — severity, status, owner, decision. Explain any non-blocking residual issue.
>
> 12\. Rollback — Day 3 deployment/commit and rollback rehearsal result.
>
> 13\. Final gate — exact status language. No “final” if required proof is missing.

## E.2 Final response checklist for Codex

> • No claim that a route “works” based only on HTTP 2xx; D1 lineage proof included.
>
> • No claim that history is preserved based only on current view; v1/v2/supersession/link queries included.
>
> • No claim that authorization is correct based only on happy path; unauthorized customer/AI-service confirmation test included.
>
> • No claim that customer view is safe without explicit protected-field absence proof.
>
> • No claim that Production is safe without non-destructive Production baseline smoke and unchanged deployment/config evidence.
>
> • No hidden skipped tests, no mocked D1 substitute for persistence claims, no screenshots substituted for canonical database proof.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>BUILDER CLOSEOUT<br />
</strong>Day 4 creates governed reasoning, not free-form intelligence. Its quality bar is explainability: every active observation/finding is supported, every uncertainty and confirmation state is explicit, every material revision preserves history, and the BMR timeline can reconstruct how the canonical record moved from identity to evidence to reasoning. Codex should optimize for the smallest critical-path change set that proves those outcomes without destabilizing GalviCare, prior GalviVault days, or Production.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>
