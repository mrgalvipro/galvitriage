**GALVIVAULT™ P0**

Day 7 Builder Guide

Production Readiness, Controlled Cutover & Build Final

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CURRENT BUILD STATUS - DAY 7 NOT YET STARTED</strong></p>
<p>Entry is conditional. Day 7 begins only after an evidenced Day 6 GO on the exact QA release candidate. The current build checklist places Day 7 as the final integration/release-readiness stage. Any unresolved Day 4, Day 5, or Day 6 blocking gate remains a STOP condition; Day 7 is not a place to defer unfinished implementation.</p></th>
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
<th><p><strong>DAY 7 MISSION</strong></p>
<p>Promote one already-proven GalviVault P0 candidate from QA into Production through a controlled, evidence-first process; verify environment isolation, forward-only migration, Worker readiness, Production-safe Human E2E, canonical D1 integrity, rollback availability, and launch stability; then issue the only valid final outcomes: BUILD FINAL, STOP, or ROLLBACK.</p></th>
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
<p>Day 7 is a release-control day, not a feature-development day and not a live debugging session. Do not discover first-time behavior in Production. Do not create a new branch or use the errant work branch. Do not rewrite unrelated GalviCare workflows. Any unplanned code, SQL, route, secret, schema, or configuration change creates a new candidate that must return to QA and re-pass the applicable gates.</p></th>
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
<p>Codex must treat this file as the Day 7 release runbook: inspect and fingerprint the exact Day 6 candidate first; preserve the QA branch and existing Production baseline; add only missing Day 7 release-control/evidence capability; execute readiness, migration, deployment, Human E2E, monitoring, and rollback gates in dependency order; and stop at the first unresolved blocking criterion. A green workflow or narrative implementation report never substitutes for Production D1 proof, Human E2E, or release evidence.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Priority** | **Instruction**                     | **What it means in practice**                                                                                                                                                                                   |
|--------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Use the approved branch model       | Day 1-Day 6 candidate work remains on qa-revamped-galvicare-0-5. Production is main. Do not create or use work or another workaround branch.                                                                    |
| P0           | Freeze one exact candidate          | All test, migration, deployment, Human E2E, and evidence artifacts must map to one SHA / tag / release ID.                                                                                                      |
| P0           | Prove before promoting              | Full automated gates and final QA Human E2E must pass before Production migration/deployment.                                                                                                                   |
| P0           | Production is not a test lab        | Only bounded Production-safe checks are permitted. Destructive failure injection, first-time feature exploration, broad import, or direct D1 repair stay in QA.                                                 |
| P0           | Protect GalviCare                   | Do not modify unrelated GalviCare workflows, telemetry, or Production entry behavior to make Day 7 green. A demonstrated release blocker may receive only the smallest approved fix through a new QA candidate. |
| P0           | Keep Worker + D1 authority singular | All canonical writes remain Worker-mediated; Production D1 is the sole writable canonical store.                                                                                                                |
| P0           | Rollback must stay available        | The prior Worker/configuration must be known, retrievable, and compatible with the additive schema before cutover.                                                                                              |
| P1           | Build evidence contemporaneously    | Capture commands, commit, deployment, migration ledger, correlation IDs, D1 assertions, defects, decisions, and monitoring as each step occurs.                                                                 |

## Source Authority and Precedence

- Authoritative source: GalviVault P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5, Parts I-IV, Sections 1-25.

- Primary Day 7 execution is governed by Section 15.10; daily gates by Section 16; automated QA by Section 18; Human E2E by Section 19; Production readiness, cutover, rollback, evidence, and operations by Sections 20-24.

- Day 6 Builder v1.0 is the immediate handoff contract: Day 7 may start only from its evidenced GO and must preserve the exact release candidate it prepared.

- Where this builder recommends implementation file names or script organization not explicitly prescribed by the source, existing equivalent repository structures must be reused.

- If repository reality conflicts with a locked contract invariant, surface the conflict and implement the smallest approved contract-compliant correction in QA. Do not silently normalize architecture or rewrite surrounding systems.

## Day 7 Definition of Done

- [ ] Day 6 gate is GO and D6-01 through D6-06 are evidenced against the exact candidate; no inherited Blocker/Critical/High defect remains.

- [ ] Candidate commit, tag/release ID, dependency lock state, migration set, QA deployment, QA schema, rollback target, and evidence package are frozen and mutually consistent.

- [ ] Production Readiness Checklist categories all pass or qualify for an explicitly approved CONDITIONAL GO that does not involve canonical data, security, authorization, migration, environment isolation, Human E2E, or rollback.

- [ ] Production branch remains main and the promoted code is the approved QA candidate; no direct feature development or unreviewed merge occurs during cutover.

- [ ] Production Worker, route, environment, DB binding, CORS, secrets, API/schema version, fixture policy, and observability are verified before canonical writes.

- [ ] Approved forward-only Production migration applies once, in order; schema ledger, tables/indexes/triggers/constraints, and data-integrity verification pass.

- [ ] Exact candidate Worker is deployed and /health, /ready, schema-version, CORS, fixture-negative, and startup-log checks pass.

- [ ] Production-safe Human E2E completes through the canonical Worker + D1 path with no undocumented manual repair.

- [ ] Critical Production-safe negative checks pass: unauthorized protected route rejected, same-key replay is duplicate-safe, changed-payload key reuse conflicts with no mutation, fixture route unavailable, refresh/retrieval continuity preserved.

- [ ] Production D1 assertions prove canonical IDs, one BMR per venture, record-class separation, version/lineage preservation, care-chain relationships, events/audit, and no duplicate/orphan/partial state for the release fixture.

- [ ] Rollback target remains available and all rollback triggers, commands/procedures, compatibility, and authority are documented; actual rollback is executed immediately if a blocking Production condition occurs.

- [ ] Stabilization monitoring and hypercare show acceptable readiness/error/data-integrity signals; adapter failures remain non-authoritative and reconcilable.

- [ ] Release evidence package EV-01 through EV-12 is complete, redacted, checksummed, and identifies the exact commit/configuration/migration/deployment/Human E2E/cutover/rollback state.

- [ ] Final decision is explicitly recorded by the release authority: DAY 7 HUMAN E2E PASS -\> GALVIVAULT P0 BUILD FINAL, or STOP/ROLLBACK with evidence and a return-to-QA plan.

# Day 7 Execution Map

| **Section** | **Execution block**                                              |
|-------------|------------------------------------------------------------------|
| 1           | Mission, scope, release guardrails                               |
| 2           | Entry gate and Day 6 handoff fingerprint                         |
| 3           | Repository, branch, promotion, and minimal-change contract       |
| 4           | Critical-path release sequence                                   |
| 5           | Phase 0 - validate Day 6 GO and freeze candidate                 |
| 6           | Phase 1 - clean rerun and release-manifest validation            |
| 7           | Phase 2 - Production Readiness Checklist                         |
| 8           | Phase 3 - cutover roles, timing, access, and recovery preflight  |
| 9           | Phase 4 - main-branch promotion and change freeze                |
| 10          | Phase 5 - Production pre-mutation baseline and recovery point    |
| 11          | Phase 6 - Production migration and schema verification           |
| 12          | Phase 7 - Worker deployment, routing, readiness, and safe config |
| 13          | Phase 8 - Production-safe Human E2E                              |
| 14          | Phase 9 - canonical D1 proof and critical negative checks        |
| 15          | Phase 10 - stabilization monitoring and adapter reconciliation   |
| 16          | Phase 11 - defect triage and release/rollback decision           |
| 17          | Phase 12 - release evidence finalization and checksums           |
| 18          | Phase 13 - operational handoff and hypercare                     |
| 19          | Phase 14 - final Day 7 acceptance and BUILD FINAL declaration    |
| A           | Day 7 automated/release gate matrix                              |
| B           | Production Readiness Checklist - PR-\* catalog                   |
| C           | Canonical Production D1 assertion catalog                        |
| D           | Release evidence directory + manifest contract                   |
| E           | Cutover and rollback record templates                            |
| F           | Codex final implementation report template                       |
| G           | Prohibited shortcuts / anti-regression rules                     |
| H           | One-page Day 7 completion checklist                              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FASTEST SAFE PATH</strong></p>
<p>Do not start by editing Production code or workflows. First prove that Day 6 already produced a releasable candidate. Most Day 7 work should be candidate identity validation, promotion orchestration, Production preflight, forward-only migration, bounded smoke/Human E2E, direct D1 assertions, monitoring, evidence packaging, and an explicit decision. Any code change after freeze should be treated as a new QA candidate, not patched live.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Day 7 Mission, Scope & Release Guardrails

| **Day 7 dimension**  | **Binding outcome**                                                                                                                                                                                              |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary outcome      | Controlled Production promotion and evidence-based GalviVault P0 BUILD FINAL decision.                                                                                                                           |
| Implementation scope | Production readiness; promotion workflow/config validation; forward-only migration; Worker deployment/routing; Production-safe Human E2E; D1 proof; monitoring; rollback; release evidence; operational handoff. |
| Daily stop/go result | BUILD FINAL only when every blocking Day 7 gate passes on the exact Production candidate. Otherwise STOP before traffic or ROLLBACK after a blocking Production failure.                                         |
| Repository ownership | Production environment configuration/promotion workflow and final release evidence. No new untested feature module.                                                                                              |
| Production posture   | Production proves the already-tested candidate. It must not be used to discover whether core routes, migrations, CORS, authorization, idempotency, lifecycle, or care-chain behavior works.                      |

## 1.1 Locked architectural invariants

- Cloudflare Worker is the sole runtime write authority; no browser, adapter, CRM, analytics service, Make scenario, or future AI service writes directly to canonical D1 tables.

- Cloudflare D1 is the sole writable canonical persistence authority in Production.

- Exactly one active BMR exists per venture; retries and resumed sessions cannot create a second BMR.

- Accepted evidence is immutable; corrections create new versions and explicit lineage.

- Observations/findings/recommendations/treatments/outcomes remain distinct and traceable; care actions require the contracted support and authority.

- Material changes are versioned; journey events, audit records, and treatment events remain append-only.

- Adapters are downstream and non-authoritative; their failure cannot invalidate a committed canonical transaction.

- QA and Production remain isolated across deployment, D1 database, secrets, origins, fixture policy, evidence, and promotion decisions.

- Migrations are additive and forward-only during P0. Application rollback must not depend on destructive down migrations.

- P0 remains AI-ready but not AI-dependent; learning candidates do not silently alter active runtime knowledge.

## 1.2 Day 7 out-of-scope

- New feature development, new customer journeys, new record classes, new lifecycle states, new external dependencies, autonomous AI behavior, enterprise IAM/SSO, multi-tenancy, or broad historical migration.

- Refactoring Day 1-Day 6 code because a cleaner design is possible. Day 7 changes require a demonstrated release blocker and must return through QA.

- Creating a work branch or any new branch to bypass merge, connector, test, or deployment problems.

- Editing unrelated GalviCare workflows, telemetry, frontend behavior, or release files simply because they are adjacent to the GalviVault release path.

- Direct Production D1 repair, destructive fault injection, broad import, first-time feature testing, or ad hoc SQL mutation.

- Changing applied migration files, manually editing schema_migrations, or using destructive down migrations.

- Disabling security, CORS, fixture, idempotency, authorization, or evidence controls to make the release appear green.

- Treating a green GitHub Action, Cloudflare deployment, or implementation report as BUILD FINAL without Human E2E and D1 proof.

# 2. Entry Gate and Day 6 Handoff Fingerprint

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 7 ENTRY GATE - STOP UNLESS ALL ARE TRUE</strong></p>
<p>Day 6 must have ended with an evidenced GO for controlled Production readiness. The exact candidate commit must be frozen on qa-revamped-galvicare-0-5; all required tests pass with zero mandatory skips; clean/upgrade migration rehearsals, security, failure/recovery, rollback rehearsal, release-manifest consistency, and Human E2E preflight are complete; no Blocker/Critical/High defect remains; and the prior safe Production Worker/configuration can be identified before any Production mutation.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Check**            | **Required starting state**                                | **Codex evidence**                          |
|----------------------|------------------------------------------------------------|---------------------------------------------|
| Repository           | mrgalvipro/galvitriage                                     | remote identity recorded                    |
| Candidate branch     | qa-revamped-galvicare-0-5                                  | git branch --show-current                   |
| Production branch    | main                                                       | repo branch/protection/promotion target     |
| Forbidden workaround | No work/new branch                                         | branch inventory / no new branch creation   |
| Day 6 gate           | GO TO DAY 7                                                | Day 6 gate record + D6-01..D6-06            |
| Candidate            | One exact frozen SHA/tag/release ID                        | git rev-parse HEAD; tag/RC identifier       |
| QA Worker            | Known-good candidate deployment                            | deployment ID/URL + candidate SHA           |
| QA D1                | Known schema ledger and candidate state                    | schema_migrations + QA binding/config       |
| Automated QA         | failed=0; mandatory skipped=0                              | timestamped combined report                 |
| QA Human E2E         | Final QA run still current for candidate                   | signed run + D1 assertion sheet             |
| Production baseline  | Current GalviCare/Worker baseline identified and safe      | deployment/route/schema/readiness baseline  |
| Rollback             | Prior safe Worker/config retrievable and schema-compatible | deployment/commit/config reference + drill  |
| Defects              | No inherited blocking defect                               | defect register                             |
| Evidence             | Draft package coherent                                     | manifest validation / release-evidence path |

## 2.1 First Codex actions - fingerprint before touching files

1\. Confirm repository mrgalvipro/galvitriage and current branch qa-revamped-galvicare-0-5. If on work, main, or any other branch, STOP. Do not create a replacement branch.

2\. Capture git status, candidate SHA, latest commit, tags, and remote. Classify any dirty/untracked file before release preparation.

3\. Locate the signed Day 6 gate/evidence. Verify D6-01 through D6-06, RL-001/RL-002, RG-006, rollback drill, and Human E2E preflight all refer to the same SHA.

4\. Inventory production-entry files, wrangler configuration, migration set, package/lockfile, GitHub workflows, release scripts, and evidence directories. Do not modify them yet.

5\. Record the current Production branch main head, Worker deployment/version, route/domain, Production D1 current schema version, and known customer-facing baseline.

6\. Verify the prior rollback Worker/commit/configuration is still available and was proven against the additive candidate schema.

7\. Reconcile the Day 6 defect register. Any untriaged or newly discovered Blocker/Critical/High item blocks Day 7.

8\. Write the Day 7 scope statement: release-control/evidence only; any code/schema correction after freeze creates a new QA candidate and invalidates current Production readiness approval.

## 2.2 Baseline command template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>COMMANDS ARE TEMPLATES, NOT A LICENSE TO BYPASS REPOSITORY WORKFLOWS</strong></p>
<p>Prefer scripts and approved GitHub/Cloudflare workflows already declared in the repository. Inspect before executing. Do not invent a generic Production deploy command, database name, route, or secret handling pattern.</p></th>
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
git remote -v<br />
git tag --points-at HEAD<br />
node --version<br />
npm --version<br />
# inspect package.json scripts, wrangler.json, workflows, migration inventory<br />
# inspect Day 6 evidence manifest and rollback references<br />
# capture current Production deployment / route / schema through approved operator paths</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 3. Repository, Branch, Promotion & Minimal-Change Contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>BRANCH CONTRACT</strong></p>
<p>Day 1-Day 6 implementation is performed on qa-revamped-galvicare-0-5. Production is main. Day 7 promotes only the approved candidate from QA to main after readiness approval. Codex must not create or use a work branch, and must not commit feature changes directly to main.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Repository object**                                   | **Day 7 rule**                                                                                                                                                     |
|---------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| qa-revamped-galvicare-0-5                               | Source candidate branch. Must contain the exact candidate proven by Day 6 and final QA evidence.                                                                   |
| main                                                    | Production branch. Receives only approved candidate promotion after the Day 7 readiness GO; no direct feature work.                                                |
| work / any new branch                                   | Prohibited workaround unless the Product Owner explicitly changes the authoritative branch contract.                                                               |
| worker/production-entry.js or approved Production entry | Preserve existing behavior until controlled promotion. Verify the actual approved Production entry; do not accidentally deploy worker/day1.js or QA fixture logic. |
| wrangler.json / equivalent                              | May be changed only for the approved Production promotion/configuration. Must preserve QA/Production isolation and contain no secrets.                             |
| migrations/\*                                           | Applied files are immutable. Production receives only the exact candidate migration set already rehearsed.                                                         |
| .github/workflows/\*                                    | Reuse the approved release/promotion workflow. Do not modify unrelated GalviCare workflows or broad DevOps behavior absent a demonstrated blocker.                 |
| release-evidence/\*                                     | Day 7 owns final release evidence, cutover record, rollback reference, monitoring log, approvals, checksums, and post-release acceptance.                          |

## 3.1 Recommended Day 7 file convention - only if equivalents do not already exist

| **Recommended path**                | **Purpose**                                                                      | **Rule**                                                                               |
|-------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| scripts/day7-release-readiness.mjs  | Validates candidate identity, Day 6 handoff, PR checklist, manifest consistency. | Must fail non-zero on any blocking gap; no auto-waivers.                               |
| scripts/day7-production-smoke.mjs   | Runs Production-safe health/ready/schema/CORS/fixture/idempotency smoke.         | Bounded and non-destructive; no first-time feature exploration.                        |
| scripts/day7-evidence.mjs           | Finalizes redacted evidence manifest/checksums.                                  | Must bind all artifacts to the same release_id and candidate SHA.                      |
| docs/operations/day7-cutover.md     | Executable cutover runbook and role/abort thresholds.                            | Must match the authoritative Section 21 sequence; no hidden manual repair.             |
| docs/operations/day7-rollback.md    | Application/config rollback and verification runbook.                            | No destructive down migration; preserve canonical history.                             |
| release-evidence/p0-\<release-id\>/ | Canonical final evidence package.                                                | Use existing repo convention if already established; content requirements are binding. |

## 3.2 Package-script / workflow rule

- Inspect package.json and existing GitHub workflows first. Reuse canonical verify/test/migration/smoke/evidence commands.

- If a missing Day 7 wrapper is truly required, it must call real existing checks, distinguish QA versus Production-safe behavior, and return non-zero on a blocking failure.

- Do not add a generic deploy script that can ambiguously target Production. The Production promotion path must be explicit and access-controlled.

- Do not change dependencies for convenience. If a dependency changes, package-lock.json must match and the candidate must return to QA for full applicable regression.

- Do not merge a release-only change after final QA without invalidating the previous evidence. The candidate SHA is the unit of truth.

# 4. Critical-Path Day 7 Release Sequence

| **Order** | **Gate**     | **Primary action**                                                                                      | **Exit condition**                                 |
|-----------|--------------|---------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| 0         | Entry        | Validate Day 6 GO, candidate SHA, QA evidence, defect register, rollback target.                        | Exact releasable candidate or STOP.                |
| 1         | Freeze       | Re-run clean automated matrix + final QA Human E2E if anything changed; lock release ID/tag.            | No failures/skips; QA proof current.               |
| 2         | Readiness    | Complete PR-001 through PR-B06 and GO/Conditional GO/NO-GO decision.                                    | Explicit signed GO/Conditional GO or STOP.         |
| 3         | Preflight    | Verify access, main promotion target, Production Worker/route/D1/config, evidence path, recovery point. | All operators/resources ready.                     |
| 4         | Promotion    | Promote exact QA candidate to main through approved process; no extra code changes.                     | main represents approved candidate.                |
| 5         | Pre-mutation | Capture Production health/ready/schema, deployment/route/config, read-only D1 checks, recovery point.   | Preflight PASS and final GO.                       |
| 6         | Migration    | Apply exact forward-only migration set and verify ledger/schema/integrity.                              | Target schema ready or rollback/STOP.              |
| 7         | Deploy       | Deploy exact candidate Worker; verify route, health/ready/schema/CORS/fixture-negative/logs.            | Production runtime identity unambiguous and ready. |
| 8         | Human E2E    | Run bounded Production-safe founder/BMR/evidence/care path.                                             | Core workflow PASS with canonical IDs.             |
| 9         | D1/negative  | Run direct D1 assertions + unauthorized/idempotency/fixture/retrieval checks.                           | No duplicate/orphan/partial/unauthorized state.    |
| 10        | Stabilize    | Monitor readiness/errors/performance/events/audit/adapters and repeat durable retrieval.                | Stable window or rollback trigger.                 |
| 11        | Decision     | Classify defects and choose COMPLETE / EXTEND MONITORING / ROLLBACK.                                    | No hidden blocking condition.                      |
| 12        | Evidence     | Finalize EV-01..EV-12, checksums, release decision, known issues.                                       | Evidence package complete and coherent.            |
| 13        | Handoff      | Assign hypercare/operations owners, support/escalation, adapter reconciliation, governance cadence.     | Production operational ownership accepted.         |
| 14        | Final        | Evaluate D7-01..D7-05 + universal gate.                                                                 | BUILD FINAL or STOP/ROLLBACK.                      |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FAIL-FAST ORDER</strong></p>
<p>Do not merge/promote/deploy merely because later steps might pass. A wrong branch, stale evidence, failed readiness item, migration inconsistency, wrong Production binding, unauthorized path, duplicate canonical state, failed Human E2E, missing rollback, or incomplete evidence stops the release at that checkpoint.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. Phase 0 - Validate Day 6 GO and Freeze the Candidate

1\. Read the Day 6 implementation report and evidence manifest; verify the final candidate SHA is exactly the SHA currently on qa-revamped-galvicare-0-5.

2\. Confirm D6-01 full automated suites, D6-02 migration rehearsals, D6-03 security/privacy, D6-04 failure/recovery/rollback, D6-05 defect threshold, and D6-06 Human E2E runbook/fixture readiness are all PASS.

3\. Confirm required tests failed=0 and mandatory skipped=0. A stale or mixed-commit report is a release blocker.

4\. Confirm existing Production GalviCare regression smoke (RG-006) passed during Day 6 and no subsequent candidate change invalidated it.

5\. Confirm the prior Worker rollback deployment/commit and configuration reference still exist and are compatible with the additive schema.

6\. Stop feature changes. Create or record the release candidate identifier/tag according to existing repo practice.

7\. Record package/lockfile and migration checksums. From this point, any source/config/migration change creates a new candidate and requires returning to QA.

8\. Establish one release_id, e.g. galvivault-p0-YYYYMMDD-NN, for every Day 7 artifact.

## 5.1 Freeze STOP conditions

- Current branch is not qa-revamped-galvicare-0-5, or a work/new branch contains candidate-only changes.

- main contains unreviewed release code that is not in the approved QA candidate.

- Day 6 evidence does not map to one SHA/deployment/migration state.

- Mandatory tests are skipped, todo, quarantined, or rerun selectively until green.

- Rollback target is missing or post-migration compatibility was never proven.

- A Blocker/Critical/High defect is open, hidden, or reclassified only to avoid blocking.

- Applied migration content differs from the version rehearsed in QA.

# 6. Phase 1 - Final Clean Rerun and Release-Manifest Validation

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>RERUN RULE</strong></p>
<p>If code, config, dependency lock, migration, test logic, or release behavior changed after the last Day 6 full run, Day 7 must rerun the full applicable automated matrix and final QA Human E2E before Production promotion. Reusing older evidence after a material change is prohibited.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

1\. Start from a clean install/worktree using the frozen candidate.

2\. Run static/repository checks, clean migration rehearsal, unit/domain, repository integration, API/security, integrated QA Worker + QA D1, failure/recovery, adapter, and full regression suites in the contracted order.

3\. Confirm no required test is skip/only/todo/quarantined and the orchestrator propagates non-zero failures.

4\. Re-run final QA Human E2E and D1 assertion sheet if the candidate changed after the previous QA Human E2E. Do not reuse a stale Human run.

5\. Validate the Day 6 draft release manifest: candidate branch/SHA, QA deployment, QA schema ledger, rollback target, test totals, and Human E2E identifiers must be internally consistent.

6\. Generate a release-readiness summary that contains evidence references but does not replace raw artifacts.

| **Release proof** | **Minimum Day 7 pre-Production requirement**                                                           |
|-------------------|--------------------------------------------------------------------------------------------------------|
| Static/repository | Required files/imports/config/migration IDs/secret scan pass; no wrong branch or fixture reachability. |
| Migration         | Clean apply and prior-state upgrade rehearsal pass on exact frozen candidate.                          |
| Automated QA      | Every applicable BLOCK test passes; failed=0; mandatory skipped=0.                                     |
| QA Human E2E      | Full P0 run PASS with direct D1 proof; exact candidate/deployment/schema identified.                   |
| Regression        | Day 1-Day 6 known-good behavior and existing Production GalviCare baseline remain valid.               |
| Rollback          | Prior deployment/config can be restored; compatibility with additive schema is proven.                 |
| Evidence          | Manifest identifies one candidate, one QA deployment, one migration set, one rollback point.           |

# 7. Phase 2 - Complete the Production Readiness Checklist

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>READINESS DECISION RULE</strong></p>
<p>GO requires every blocking readiness item to be evidenced against the exact candidate and planned Production migration set. CONDITIONAL GO is allowed only for explicitly non-blocking limitations with owner, workaround, monitoring, due date, escalation threshold, and Product Owner acceptance. Any canonical-data, authorization, migration, environment-isolation, rollback, Human E2E, secret, or evidence blocker is NO-GO.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 7.1 Candidate identity and freeze

| **ID** | **Required condition**                                               | **Evidence / pass proof**                         |
|--------|----------------------------------------------------------------------|---------------------------------------------------|
| PR-001 | One candidate SHA declared/protected                                 | Commit SHA, branch, tag/RC ID                     |
| PR-002 | Required repository paths present; no parallel Worker/migration path | Repository inventory / verify:files               |
| PR-003 | Dependencies and lockfile match tested candidate                     | package.json + lockfile + install/test transcript |
| PR-004 | Code review and architecture exceptions resolved                     | PR review / ADR references                        |
| PR-005 | Release freeze active                                                | Freeze timestamp / change-control statement       |
| PR-006 | Known defects fully listed and dispositioned                         | Known-issues register                             |

## 7.2 Architecture and scope

| **ID** | **Required condition**                                                          | **Evidence / pass proof**                 |
|--------|---------------------------------------------------------------------------------|-------------------------------------------|
| PR-A01 | Worker remains sole runtime write authority                                     | Architecture/source/config review         |
| PR-A02 | Production D1 remains sole canonical persistence authority                      | Production DB binding + readiness         |
| PR-A03 | No browser/CRM/analytics/adapter/Make/AI direct canonical writes                | Source search + security/adapter evidence |
| PR-A04 | Production entry is approved; no accidental worker/day1.js or QA fixture policy | wrangler + deployed Worker metadata       |
| PR-A05 | Release remains inside approved P0 scope                                        | Scope delta + Product Owner review        |
| PR-A06 | Material architecture/data changes have approved change control                 | ADR/change log                            |

## 7.3 Environment, configuration, and secrets

| **ID** | **Required condition**                                          | **Evidence / pass proof**              |
|--------|-----------------------------------------------------------------|----------------------------------------|
| PR-C01 | Production Worker/route distinct from QA                        | Deployment/route record                |
| PR-C02 | DB binding points only to approved Production D1                | Private resource confirmation + config |
| PR-C03 | ENVIRONMENT=production and environment header matches           | health/ready evidence                  |
| PR-C04 | FIXTURE_MODE=false and fixture routes unavailable               | Production negative route test         |
| PR-C05 | Production CORS allowlist is approved/default-deny              | Allowed + denied origin tests          |
| PR-C06 | Required secrets configured server-side; no values exposed      | Secret-name attestation + scan         |
| PR-C07 | QA/Prod secrets not improperly shared                           | Secret inventory attestation           |
| PR-C08 | API version/minimum schema match candidate                      | Worker config + readiness              |
| PR-C09 | Adapter flags/endpoints match launch posture                    | Configuration manifest                 |
| PR-C10 | No debug/bypass/test-admin/broad-import/unsafe-log flag enabled | Config review + negative tests         |

## 7.4 D1 schema and data

| **ID** | **Required condition**                                  | **Evidence / pass proof**            |
|--------|---------------------------------------------------------|--------------------------------------|
| PR-D01 | Migration plan starts from actual Production schema     | Pre-cutover schema_migrations + plan |
| PR-D02 | Migrations proven clean locally and in QA               | Migration transcripts                |
| PR-D03 | Applied migration files unchanged after QA              | Checksum/commit comparison           |
| PR-D04 | Required recovery point captured and accessible         | Backup/export/recovery artifact      |
| PR-D05 | FK/unique/append-only/immutability controls pass        | DB test report                       |
| PR-D06 | No duplicate canonical identities in approved test data | Prepared integrity queries           |
| PR-D07 | No orphan evidence/reasoning/care/lineage rows          | Orphan query results = zero          |
| PR-D08 | Production test identities are bounded and marked       | Test-data register                   |
| PR-D09 | Import batches reconciled; invalid rows quarantined     | Import report                        |
| PR-D10 | Rollback does not require destructive down migration    | Rollback review                      |

## 7.5 API, domain, and BMR

| **ID** | **Required condition**                                       | **Evidence / pass proof**       |
|--------|--------------------------------------------------------------|---------------------------------|
| PR-P01 | Production API uses canonical JSON envelope/safe errors      | Contract + smoke                |
| PR-P02 | Mutating routes enforce idempotency/mismatch conflict        | Duplicate/idempotency matrix    |
| PR-P03 | AuthN/authZ separates caller classes correctly               | Security + Human negative E2E   |
| PR-P04 | One venture -\> one BMR; multi-session continuity preserved  | Automated + Human continuity    |
| PR-P05 | Accepted evidence immutable; correction versions/lineage     | Correction E2E + D1 proof       |
| PR-P06 | Reasoning/care lineage requirements enforced                 | Domain matrix                   |
| PR-P07 | BMR lifecycle enforces state/actor/version/event/audit       | Lifecycle report                |
| PR-P08 | Current/history/timeline are bounded and separated           | API tests + operator validation |
| PR-P09 | Adapter failure cannot invalidate canonical success          | Fault + adapter_deliveries      |
| PR-P10 | Fixture routes and direct SQL/browser write paths impossible | Negative evidence               |

## 7.6 Security, privacy, and access

| **ID** | **Required condition**                                    | **Evidence / pass proof**        |
|--------|-----------------------------------------------------------|----------------------------------|
| PR-S01 | No secrets or sensitive raw payloads in repo/evidence     | Secret/redaction scan            |
| PR-S02 | Protected routes reject missing/invalid/out-of-scope auth | AuthN/authZ report               |
| PR-S03 | Webhook signature/timestamp/replay controls pass          | Webhook negative/duplicate tests |
| PR-S04 | CORS allowed/denied origins behave exactly                | HTTP/browser evidence            |
| PR-S05 | Logs/errors use safe summaries + correlation IDs          | Log review                       |
| PR-S06 | Operator access is minimum-necessary and traceable        | Access inventory + audit         |
| PR-S07 | Production test data marked and handled by policy         | Test-data record                 |
| PR-S08 | Hard delete/broad export/privacy request not improvised   | Scope/route review               |

## 7.7 QA, Human E2E, and defects

| **ID** | **Required condition**                                  | **Evidence / pass proof**      |
|--------|---------------------------------------------------------|--------------------------------|
| PR-Q01 | All required automated suites pass cleanly              | Timestamped report tied to SHA |
| PR-Q02 | No test skip/quarantine/weakening to make release green | Test report + diff             |
| PR-Q03 | Day 1 Human E2E remains evidenced                       | Signed result                  |
| PR-Q04 | Full P0 Human E2E passes in QA                          | Scenario + D1 sheet            |
| PR-Q05 | Production-safe Human E2E runbook approved              | Approved runbook               |
| PR-Q06 | Severity-1/2 closed; residual defects within policy     | Defect register                |
| PR-Q07 | Existing Production GalviCare preserved until cutover   | Regression evidence            |
| PR-Q08 | Rollback drill passed for candidate                     | Rollback drill report          |

## 7.8 Observability and operations

| **ID** | **Required condition**                                                       | **Evidence / pass proof**  |
|--------|------------------------------------------------------------------------------|----------------------------|
| PR-O01 | Health/readiness expose accurate Production status                           | Pre-write smoke            |
| PR-O02 | Correlation IDs trace API/log/audit/error records                            | Trace sample               |
| PR-O03 | Request/error/readiness/migration/idempotency/adapter status inspectable     | Monitoring/query checklist |
| PR-O04 | Launch monitoring ownership and first response defined                       | Monitoring roster          |
| PR-O05 | Support distinguishes canonical success from adapter failure                 | Operational runbook        |
| PR-O06 | Recovery uses approved API/deploy/migration/reconciliation; no manual repair | Recovery runbook           |
| PR-O07 | Production access and emergency ownership confirmed                          | Access/owner attestation   |
| PR-O08 | Evidence retention location writable/access-controlled                       | Evidence path verification |

## 7.9 Business and launch

| **ID** | **Required condition**                                          | **Evidence / pass proof**       |
|--------|-----------------------------------------------------------------|---------------------------------|
| PR-B01 | Business Owner states P0 launch outcome and deferred scope      | Release decision                |
| PR-B02 | Supported founder/operator workflow documented/rehearsed        | Operating procedure / Human E2E |
| PR-B03 | Error/recovery messages usable and safe                         | Human review                    |
| PR-B04 | Launch/monitoring window, rollback authority, channel scheduled | Cutover runbook                 |
| PR-B05 | Known limitations and support escalation documented             | Release notes                   |
| PR-B06 | Release claim does not exceed tested P0 capability              | Product Owner approval          |

## 7.10 GO / CONDITIONAL GO / NO-GO

| **Decision**   | **Permitted conditions**                                                                                                                                                                          | **Required action**                                                                          |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| GO             | All blockers closed; evidence complete; only accepted low-severity residual defects; cutover and rollback ready.                                                                                  | Proceed to controlled cutover.                                                               |
| CONDITIONAL GO | Only non-canonical, non-security, non-migration, non-authorization, non-Human-E2E limitations with workaround/monitoring.                                                                         | Document condition, owner, due date, threshold, and Product Owner acceptance before cutover. |
| NO-GO          | Wrong environment/binding; failed migration/readiness; duplicate/orphan/partial state; unauthorized write; exposed secret; missing rollback; failed Human E2E; incomplete/contradictory evidence. | Stop release, preserve evidence, return to QA, create a new candidate.                       |

# 8. Phase 3 - Cutover Roles, Timing, Access & Recovery Preflight

| **Role**                          | **During cutover**                                                          | **Authority**                                                  |
|-----------------------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------|
| Release commander / Product Owner | Owns GO/HOLD/ROLLBACK/COMPLETE decision and scope.                          | Final release decision.                                        |
| Release operator                  | Executes approved GitHub/Cloudflare/D1 runbook and records timestamps.      | Immediate operational stop on failed checkpoint.               |
| Implementation Engineer / Codex   | Validates candidate, migration, deployment and defects; prepares artifacts. | Technical recommendation; fixes only through new QA candidate. |
| QA / Human E2E tester             | Executes smoke/Human path and D1 assertions.                                | Declares scenario pass/fail.                                   |
| Business Physician / operator     | Validates operational usability and BMR continuity.                         | Operational acceptance.                                        |
| Monitor / scribe                  | Watches readiness/errors/data/adapter signals and captures evidence.        | Escalates threshold breach.                                    |

## 8.1 Cutover timing model

| **Window**   | **Primary activity**                                                                      | **Exit condition**                                      |
|--------------|-------------------------------------------------------------------------------------------|---------------------------------------------------------|
| T-24 to T-4h | Candidate freeze, final regression/QA Human E2E, readiness sign-off, recovery prep.       | GO/Conditional GO documented.                           |
| T-2h         | Access, route, D1, Worker, evidence path, rollback target, communication channel checks.  | No access blocker; required roles available.            |
| T-30m        | Final Production preflight; pause conflicting deploys/imports; capture pre-cutover state. | Preflight PASS + explicit GO.                           |
| T0           | Apply Production migration; verify; deploy Worker/config.                                 | Ready PASS before canonical write testing.              |
| T+5 to +20m  | Production smoke + bounded Human E2E + D1 assertions.                                     | Core path PASS or rollback invoked.                     |
| T+20 to +60m | Enhanced monitoring, adapter review, repeat retrieval/idempotency.                        | Stable signals / decision.                              |
| T+1 to +24h  | Hypercare, defect intake, reconciliation, evidence finalization.                          | Accepted, extended monitoring, or governed remediation. |

## 8.2 Access/artifact preflight

| **Preflight item** | **Required confirmation**                                                                                              |
|--------------------|------------------------------------------------------------------------------------------------------------------------|
| GitHub             | Candidate commit/tag is accessible; correct repo/QA branch; main target known; no unreviewed commit after freeze.      |
| Cloudflare Worker  | Release operator can inspect Production Worker, routes, deployment history and logs.                                   |
| Cloudflare D1      | Release operator can inspect Production schema/migrations and execute only approved migration/verification operations. |
| Secrets/config     | Required secret names configured; no value copied into runbook; production variables/CORS/flags prepared.              |
| Rollback           | Prior Worker/commit, route and config state recorded; operator access confirmed; post-migration compatibility proven.  |
| Evidence           | Release folder writable; manifest/templates ready; screenshots/log exports can be stored safely.                       |
| Test client        | Approved browser/API client available; cache/session reset procedure known; bounded Production-safe identity ready.    |
| Support            | QA tester, Business Physician/operator, release commander, and escalation channel available.                           |

# 9. Phase 4 - Promote the Exact Candidate to main and Freeze Changes

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PROMOTION RULE</strong></p>
<p>The Production branch is main. The release is a promotion of the exact approved QA candidate, not a reconstruction of that candidate on main. Do not cherry-pick extra cleanup, workflow, documentation, or configuration changes into the release unless they are already part of the proven candidate or they trigger a new QA candidate cycle.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

1\. Confirm qa-revamped-galvicare-0-5 HEAD equals the signed candidate SHA.

2\. Confirm main is the Production branch and record its pre-cutover SHA.

3\. Review the exact diff from current main to the candidate. Classify each changed path as approved GalviVault P0 scope, required shared runtime support, or out-of-scope. Any unexplained GalviCare workflow change is a STOP.

4\. Use the existing approved pull request / merge / release workflow to promote the candidate. Do not create a new branch and do not use work.

5\. Ensure branch protection/review requirements are satisfied. The release authority must know exactly what SHA main will contain after promotion.

6\. After merge/promotion, record main SHA and verify it corresponds to the approved candidate content. If merge mechanics create a merge SHA, record both the candidate SHA and resulting main release SHA and prove source equivalence.

7\. Freeze unrelated deployments, imports, manual D1 operations, and configuration changes for the cutover window.

8\. If the merge requires conflict resolution that changes behavior, STOP. Resolve on QA, rerun gates, and create a new candidate.

# 10. Phase 5 - Production Pre-Mutation Baseline and Recovery Point

1\. Announce cutover start, release_id, candidate/main SHA, and planned migration/deployment target in the release channel.

2\. Confirm no conflicting deployment, migration, import, or manual Production D1 operation is in progress.

3\. Capture current Production GET /health, GET /ready, and schema-version before any mutation.

4\. Capture current Production Worker deployment ID/version, route/domain, approved entry point, environment variables/feature flags, and DB binding reference without exposing secrets.

5\. Run approved read-only D1 preflight queries: schema_migrations, required table existence, duplicate/orphan checks relevant to existing Production state, and test-record inventory.

6\. Capture the required D1 backup/export/recovery point and verify the authorized operator can access it.

7\. Confirm target migration files/checksums and target Worker release match the signed readiness package.

8\. Ask each required role for READY; release commander records final GO or HOLD before migration begins.

## 10.1 Pre-mutation abort conditions

- Current Production environment is not the expected baseline.

- QA and Production DB/Worker/route identities are ambiguous or shared unexpectedly.

- Recovery point cannot be captured or accessed.

- Migration checksums differ from QA-proven files.

- main/release SHA does not match the approved candidate content.

- Any required operator/access path is unavailable.

- Read-only integrity queries reveal unexplained duplicate/orphan/partial state that affects the release.

# 11. Phase 6 - Production Migration and Schema Verification

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>MIGRATION RULE</strong></p>
<p>Execute only the exact forward-only migration set already rehearsed on clean and QA databases. Never edit applied migration files, mark the ledger manually, or use a destructive down migration to recover. A migration error stops the release before Worker deployment.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

1\. Set release state to MIGRATION IN PROGRESS. Verify the Production D1 target from approved Production configuration.

2\. Execute the repository-approved Production migration command or workflow against that D1 target. Do not invent the database name or command path.

3\. Capture command pattern, operator, timestamp, migration output, and result. Never capture secret values.

4\. If the migration reports any error, STOP. Do not manually mark schema_migrations and do not deploy the candidate Worker.

5\. Query schema_migrations and confirm each target migration appears exactly once and in order.

6\. Verify required tables, indexes, triggers, foreign-key behavior, minimum schema version, and migration-specific objects.

7\. Run data-integrity verification for duplicates, orphans, append-only/immutability protections in a safe context, and any migration-specific reconciliation.

8\. If verification fails, invoke the Section 22 rollback/compensation decision. Application rollback may coexist with additive schema; data correction must be forward/governed.

| **Migration proof** | **Pass condition**                                                                                   |
|---------------------|------------------------------------------------------------------------------------------------------|
| Ledger              | Actual Production schema_migrations matches planned before/after state; no duplicate/manual rows.    |
| Structure           | Required candidate tables/indexes/triggers/constraints exist and are queryable.                      |
| Compatibility       | Prior safe Worker is compatible with post-migration additive schema or release is blocked.           |
| Integrity           | No release-induced duplicate/orphan/partial/lineage defect is present.                               |
| Immutability        | Accepted-evidence and append-only protections remain active.                                         |
| Evidence            | Migration files/checksums, transcript, verification queries/results and operator/timestamp captured. |

# 12. Phase 7 - Worker Deployment, Routing, Readiness & Safe Configuration

1\. Deploy the exact approved candidate/release SHA using the approved Production configuration and workflow. Record Cloudflare deployment/version ID.

2\. Verify the Production route/domain resolves to the intended new deployment and no QA route was modified.

3\. Call GET /health. Require canonical JSON, service identity, environment=production, API version, fixture_mode=false, and correlation ID as contracted.

4\. Call GET /ready. Require DB=true, candidate-required schema satisfied, correct environment/configuration, and no fail-closed condition.

5\. Call schema-version and compare to the release manifest and Production migration ledger.

6\. Test one approved Production Origin and one denied Origin. Exact-match/default-deny CORS must hold.

7\. Attempt the Production fixture route/action. It must be unavailable (404/403 as contracted) and create no fixture state.

8\. Review initial Worker logs/application_errors for startup, import, binding, route, secret, stack/SQL leakage, or unexpected exceptions before any canonical write.

9\. If any runtime identity/config/readiness result contradicts the signed package, STOP and rollback/hold before Human E2E.

| **Check**    | **Pass condition**                                         | **Blocking failure example**                  |
|--------------|------------------------------------------------------------|-----------------------------------------------|
| Environment  | Production response/header and config agree.               | qa header, fixture true, wrong route.         |
| DB readiness | Production D1 available at required schema.                | wrong DB, missing binding, stale schema.      |
| JSON/errors  | Canonical envelope; safe error mapping.                    | HTML, blank body, raw stack/SQL.              |
| CORS         | Approved origin works; denied origin blocked.              | wildcard/broad origin or valid origin broken. |
| Fixture      | Fixture route unavailable.                                 | Fixture action succeeds in Production.        |
| Routing      | Production route points to approved release; QA untouched. | Wrong Worker or QA route changed.             |

# 13. Phase 8 - Execute Production-Safe Human E2E

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRODUCTION HUMAN E2E CONSTRAINT</strong></p>
<p>Production Human E2E proves the already-tested release. It does not perform destructive fault injection, direct database repair, broad import, or first-time feature exploration. Use the minimum clearly marked Production-safe fixture, preserve audit history, and stop immediately on any environment, migration, authorization, canonical-integrity, or lineage inconsistency.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Step** | **Tester action**                                                                                                                                 | **Expected result**                                                        | **Canonical proof / abort trigger**                        |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|------------------------------------------------------------|
| P7.1     | Verify health, ready, schema-version.                                                                                                             | production; DB ready; fixture false; approved schema.                      | Abort on wrong env/binding/schema.                         |
| P7.2     | Create/resolve approved Production-safe Founder + Venture.                                                                                        | Stable IDs; one row each.                                                  | Abort on real-identity collision, duplicate, unsafe error. |
| P7.3     | Create/get BMR + assessment session.                                                                                                              | One BMR per venture; session on same BMR.                                  | Abort on wrong/duplicate/cross-venture relation.           |
| P7.4     | Submit one bounded evidence item.                                                                                                                 | Evidence v1 committed with source + event/audit.                           | Abort on partial write, missing audit, SQL leakage.        |
| P7.5     | Refresh/reconnect and retrieve BMR/session/evidence.                                                                                              | Same IDs and committed state from D1.                                      | Abort on missing/non-durable state.                        |
| P7.6     | Repeat same write with same idempotency key.                                                                                                      | Original result/no duplicate; replay/no_change.                            | Abort on duplicate canonical/support/event state.          |
| P7.7     | Reuse key with changed payload.                                                                                                                   | 409 mismatch; no mutation.                                                 | Abort if request succeeds or state changes.                |
| P7.8     | Attempt one protected route without authorization.                                                                                                | 401/403 safe error; no mutation.                                           | Abort on unauthorized read/write.                          |
| P7.9     | If full operator chain is in release scope, execute minimum finding -\> recommendation -\> treatment -\> outcome path with authorized test actor. | Required lineage, authorization, versioning, lifecycle and audit all hold. | Abort on missing support/authority/history.                |
| P7.10    | Run D1 assertions for the Production-safe BMR.                                                                                                    | No duplicate/orphan/partial state; expected events/audit/lineage.          | Any canonical integrity defect triggers rollback.          |
| P7.11    | Retain/archive test record according to policy.                                                                                                   | Soft archive or approved retention; history preserved.                     | Never hard-delete to clean release evidence.               |

## 13.1 Human evidence capture - mandatory

- [ ] Run ID, environment, release_id, candidate/main SHA, Production deployment ID, schema version, tester roles, and Production-safe identity reference.

- [ ] UI/client state or concise screenshots for each major step, with no secret or unnecessary sensitive data.

- [ ] HTTP method/route/action, status, canonical envelope, correlation ID, and canonical IDs for the exercised steps.

- [ ] Prepared D1 query outputs proving row counts, relationships, versions, events/audit, and no duplicate/partial state.

- [ ] Any adapter status, shown separately from canonical success.

- [ ] Every defect with expected vs actual, severity, reproducibility, correlation/IDs, evidence, and disposition.

- [ ] Explicit statement that no undocumented manual D1 repair or browser-state manipulation was used.

- [ ] Final Human E2E scenario result and whether rollback was required.

# 14. Phase 9 - Canonical D1 Proof and Critical Production-Safe Negative Checks

## 14.1 Mandatory D1 proof dimensions

| **Dimension**  | **Production-safe assertion**                                                                                |
|----------------|--------------------------------------------------------------------------------------------------------------|
| Identity       | Founder and Venture resolve to expected stable IDs; no duplicate canonical business key.                     |
| BMR uniqueness | Exactly one BMR for the test venture; current_session_id and session rows are coherent.                      |
| Evidence       | Bounded evidence version exists with source/captured_at; no in-place mutation; lineage present if corrected. |
| Reasoning/care | If exercised, finding/recommendation/treatment/outcome relationships and current versions reconcile.         |
| Events/audit   | Expected journey/lifecycle/audit records exist with correlation IDs and actor/source context.                |
| Idempotency    | Same-key replay does not create a second canonical row; mismatch attempt creates no mutation.                |
| Integrity      | No orphan evidence/reasoning/care/lineage rows for test BMR; no partial transaction state.                   |
| Environment    | No QA fixture data/path created by the Production run.                                                       |

## 14.2 Critical negative checks

| **Check**                       | **Expected result**                                                    | **Rollback threshold**                                              |
|---------------------------------|------------------------------------------------------------------------|---------------------------------------------------------------------|
| Unauthorized protected route    | 401/403 canonical safe error; no read/write outside scope.             | Any unauthorized read/write = immediate rollback/security incident. |
| Idempotent replay               | Same canonical result; no duplicate.                                   | Duplicate canonical state = rollback.                               |
| Changed payload with reused key | 409 GV_IDEMPOTENCY_REUSE_MISMATCH or contracted conflict; no mutation. | Success/partial state = rollback.                                   |
| Production fixture route        | Unavailable; no fixture state.                                         | Fixture enabled = immediate rollback.                               |
| Refresh/retrieval               | Same committed state after cache/session reset.                        | Data not recoverable = rollback/hold.                               |
| CORS denied origin              | Rejected; allowed origin unaffected.                                   | Broad unauthorized origin = rollback/hold.                          |

# 15. Phase 10 - Stabilization Monitoring and Adapter Reconciliation

- Monitor health/readiness, safe Worker error codes, request duration, idempotency conflicts, application_errors, journey/audit write success, and adapter_deliveries status.

- Repeat read-only retrieval of the Production-safe BMR after cache/session reset to prove durable continuity.

- Verify HubSpot/analytics/notification or other non-blocking adapters either delivered or recorded actionable retry/reconciliation state. Never mutate canonical state to make an adapter appear successful.

- Compare Production request/error behavior with the pre-release baseline and agreed thresholds.

- Record every anomaly with release_id, timestamp, correlation ID, severity, expected/actual, owner, and disposition.

- The release commander must explicitly choose CONTINUE, EXTEND MONITORING, or ROLLBACK before the launch window closes.

| **Hypercare activity**            | **Minimum cadence / owner**                                        | **Evidence**                                   |
|-----------------------------------|--------------------------------------------------------------------|------------------------------------------------|
| Health/readiness and error review | Launch + 15m + 30m + 60m, then agreed cadence.                     | Monitoring log.                                |
| Canonical integrity spot checks   | After Production-safe E2E and after first approved real workflows. | Read-only query results.                       |
| Adapter reconciliation            | 30m, 60m, and end of hypercare.                                    | Delivery/retry report.                         |
| Support/UX issue intake           | Continuous during launch window.                                   | Defect register.                               |
| Evidence package completion       | Release operator/QA within 24h.                                    | Final manifest/checksums/sign-offs.            |
| Release acceptance review         | Business Owner at end of agreed window.                            | Accepted / rolled back / remediation decision. |

# 16. Phase 11 - Defect Triage, Release Decision & Rollback Triggers

| **Trigger / severity**                                           | **Immediate Day 7 action**                                                                                |
|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Wrong Worker/route/environment/D1 binding                        | Stop writes; rollback routing/deployment immediately; treat as R0/SEV-1.                                  |
| Migration error or target schema not ready                       | Do not deploy candidate; invoke migration recovery/compensation decision.                                 |
| Unauthorized protected operation succeeds                        | Stop release; disable/rollback candidate; initiate security incident.                                     |
| Duplicate founder/venture/BMR/session/evidence created by replay | Stop writes; preserve state; rollback application; reconcile only through approved process.               |
| Accepted evidence changes in place or history/lineage lost       | Rollback application; preserve database for forensic/reconciliation review.                               |
| Worker returns HTML/blank/raw stack/SQL on core path             | Rollback unless an explicitly pre-approved config-only restoration can be safely applied and revalidated. |
| Core Production-safe Human E2E fails                             | Rollback; Conditional GO is not allowed.                                                                  |
| Readiness/error threshold exceeds launch limit                   | Hold/rollback according to commander decision and rollback matrix.                                        |
| Evidence cannot identify exact commit/config/migration           | Hold release; evidence gap blocks completion.                                                             |
| Adapter failure only with canonical success/retry record         | Usually continue with monitoring/reconciliation if readiness policy permits.                              |

## 16.1 Standard application rollback - if triggered

1\. Announce ROLLBACK INITIATED with release_id, candidate deployment, reason/severity, and timestamp.

2\. Stop/disable affected writes, imports, or adapters where possible without causing additional data loss.

3\. Record failing deployment, route, current schema version, correlation IDs, and impacted time window before changing state.

4\. Select/redeploy the recorded prior known-good Worker application and restore its approved route/configuration.

5\. Leave additive migrations in place unless a later approved forward compensating migration is required. Never run an unreviewed destructive down migration.

6\. Call health, ready, and schema-version; confirm prior Worker is compatible with current additive schema and fixture remains false.

7\. Run rollback smoke: retrieve a known record; execute only an approved safe operation or intentional paused-write probe; confirm authorization and safe errors.

8\. Run D1 integrity checks for the impacted window: duplicates, orphans, incomplete version/link sets, missing audit/events, import/adapter states.

9\. Classify every canonical record created during the failed window as valid, incomplete, duplicate/conflict, or requires governed correction. Do not delete to tidy the database.

10\. Resume traffic only after the release commander accepts rollback verification; finalize rollback evidence and open root-cause/corrective-candidate work.

## 16.2 Rollback verification gate

| **ID** | **Verification**        | **Pass condition**                                                          |
|--------|-------------------------|-----------------------------------------------------------------------------|
| RB-01  | Prior deployment active | Recorded rollback Worker/route is active.                                   |
| RB-02  | Environment/readiness   | Production health/ready/schema pass; fixture false.                         |
| RB-03  | Authorization           | Protected negative test remains denied.                                     |
| RB-04  | Core read continuity    | Existing BMR/session/evidence retrievable.                                  |
| RB-05  | Bounded write/retry     | Safe operation succeeds idempotently or writes intentionally remain paused. |
| RB-06  | Data integrity          | No new duplicate/orphan/partial state from rollback.                        |
| RB-07  | Adapter containment     | Failing adapter disabled/retry state controlled.                            |
| RB-08  | Evidence                | Failure + rollback deployment IDs/times/queries/results/decisions captured. |
| RB-09  | Operational acceptance  | Business Physician/operator confirms supported workflow is safe.            |
| RB-10  | Resume decision         | Commander records resumed/paused/incident status.                           |

# 17. Phase 12 - Finalize the Release Evidence Package

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EVIDENCE INTEGRITY RULE</strong></p>
<p>An artifact counts as release evidence only when it identifies the release, environment, timestamp, source command/procedure, result, and responsible actor without exposing secrets or unnecessary sensitive founder data. Missing, ambiguous, recreated-after-the-fact, or contradictory evidence blocks release acceptance.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 17.1 Canonical evidence package structure

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>release-evidence/<br />
p0-&lt;release-id&gt;/<br />
00-manifest/<br />
release-manifest.json<br />
release-decision.md<br />
approvals.md<br />
checksums.txt<br />
01-source/<br />
repository-inventory.txt<br />
commit-and-tag.txt<br />
change-summary.md<br />
adr-and-scope-delta.md<br />
dependency-lock-summary.txt<br />
02-configuration/<br />
wrangler-redacted.json<br />
environment-manifest.md<br />
cors-feature-flags.md<br />
secrets-attestation.md<br />
03-migrations/<br />
migration-files/<br />
checksums.txt<br />
local-clean-apply.log<br />
qa-apply.log<br />
production-apply.log<br />
verification-queries.sql<br />
verification-results.txt<br />
04-automated-qa/<br />
test-report.json<br />
test-report.txt<br />
coverage-or-test-inventory.txt<br />
failure-freeze-attestation.md<br />
05-human-e2e/<br />
qa-human-e2e-result.md<br />
production-safe-e2e-result.md<br />
screenshots/<br />
correlation-index.csv<br />
database-assertions.txt<br />
06-deployment/<br />
qa-deployment.md<br />
production-deployment.md<br />
health-ready-schema.txt<br />
route-and-version-proof.md<br />
07-cutover/<br />
readiness-checklist.md<br />
cutover-record.md<br />
monitoring-log.md<br />
release-notes.md<br />
08-rollback/<br />
rollback-plan.md<br />
rollback-drill-result.md<br />
prior-deployment-reference.md<br />
rollback-record.md<br />
09-security-privacy/<br />
access-and-secret-attestation.md<br />
redaction-scan.txt<br />
authorization-negative-tests.txt<br />
test-data-register.md<br />
10-operations/<br />
known-issues.md<br />
support-and-escalation.md<br />
adapter-reconciliation.md<br />
operational-acceptance.md<br />
11-post-release/<br />
acceptance-review.md<br />
incident-or-defect-log.md<br />
follow-up-actions.md</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 17.2 Evidence completeness EV-01 through EV-12

| **ID** | **Evidence gate** | **Complete when**                                                                 |
|--------|-------------------|-----------------------------------------------------------------------------------|
| EV-01  | Manifest          | All required identities/versions/results populated; no placeholders.              |
| EV-02  | Source            | Commit/tag/inventory/delta match candidate and main release.                      |
| EV-03  | Configuration     | Redacted QA/Production separation and secret attestation present.                 |
| EV-04  | Migration         | Local/QA/Production apply + verification tied to exact migration files/checksums. |
| EV-05  | Automated QA      | Full required report PASS with no hidden skips.                                   |
| EV-06  | Human E2E         | QA and Production-safe runs signed and linked to D1 proof.                        |
| EV-07  | Cutover           | Every checkpoint, timestamp, deviation, and decision recorded.                    |
| EV-08  | Rollback          | Plan + drill evidence present; actual rollback record completed if invoked.       |
| EV-09  | Security/privacy  | Redaction, access, secrets, authorization and test-data evidence complete.        |
| EV-10  | Operations        | Known issues, support, adapter, monitoring and operational acceptance complete.   |
| EV-11  | Checksums         | Critical artifact checksums generated after finalization.                         |
| EV-12  | Approvals         | Required approvers and final release decision recorded.                           |

## 17.3 Release manifest contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"release_id": "galvivault-p0-YYYYMMDD-NN",<br />
"document_version": "0.5",<br />
"repository": "mrgalvipro/galvitriage",<br />
"candidate_branch": "qa-revamped-galvicare-0-5",<br />
"production_branch": "main",<br />
"candidate_commit_sha": "...",<br />
"production_release_sha": "...",<br />
"tag": "...",<br />
"worker": {<br />
"qa_deployment_id": "...",<br />
"production_deployment_id": "...",<br />
"api_version": "v1",<br />
"environment": "production"<br />
},<br />
"database": {<br />
"binding": "DB",<br />
"schema_version_before": "...",<br />
"schema_version_after": "...",<br />
"migration_ids": ["..."]<br />
},<br />
"qa": {<br />
"automated_result": "PASS",<br />
"human_e2e_result": "PASS",<br />
"production_safe_e2e_result": "PASS"<br />
},<br />
"decision": "GO | CONDITIONAL_GO | ROLLED_BACK",<br />
"decision_at": "UTC timestamp",<br />
"rollback_target": "prior deployment/commit reference",<br />
"evidence_generated_at": "UTC timestamp"<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 17.4 Redaction and immutability rules

- May include opaque canonical IDs, correlation IDs, safe event/error codes, schema/version, deployment IDs, timestamps, approved pseudonymous test identity, field names, counts, hashes, and bounded summaries.

- Must omit/redact secret values, authorization headers/tokens/signatures, credentials, full evidence bodies, transcripts/files, payment details, raw sensitive notes, customer PII not strictly required, raw database dumps, and broad-access screenshots exposing Cloudflare/GitHub secrets.

- Use one release_id across every artifact and UTC ISO-8601 timestamps unless the release record clearly states another single standard.

- Evidence created after the fact must be labeled reconstructed and cannot replace missing contemporaneous proof.

- Generate checksums after package completion; never overwrite an accepted package. Corrections create a new revision/change note and new checksums.

# 18. Phase 13 - Operational Handoff and Hypercare

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 7 DOES NOT END AT DEPLOYMENT</strong></p>
<p>The build is final only when the Production release is supportable. Day 7 must hand off monitoring, support, data-quality checks, adapter reconciliation, access ownership, recovery procedures, known issues, and post-release evidence to an explicit operational owner.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Operational control** | **Day 7 handoff requirement**                                                                                                  |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Canonical ownership     | D1 changes only through approved Worker services, migrations, or governed reconciliation scripts.                              |
| Access/secrets          | Named owners for GitHub, Cloudflare Worker/D1/routes/evidence; least privilege and recovery method documented.                 |
| Monitoring              | Health/ready, errors, request latency, data integrity, idempotency, audit/events, and adapters have inspectable procedures.    |
| Data quality            | Duplicate BMR per venture=0; orphan/lineage violations=0; accepted evidence in-place updates=0; cross-environment anomalies=0. |
| Adapters                | Failures are visible/reconcilable and never rewrite BMR truth.                                                                 |
| Incident response       | SEV classification, containment, evidence preservation, rollback, reconciliation and Business Owner communication defined.     |
| Recovery                | Application rollback and data recovery are distinct; prior Worker selection and D1 recovery point are documented.              |
| Known issues            | Residual accepted issues have owner, impact, workaround, due date, escalation threshold, and release disposition.              |
| Cadence                 | Daily during hypercare; weekly after stabilization; monthly control review; incident review after material events.             |

## 18.1 Initial 24-hour hypercare responsibilities

- [ ] Review readiness and safe error signals at launch, +15m, +30m, +60m, then agreed cadence.

- [ ] Re-run read-only integrity spot checks after the Production-safe E2E and after first approved real workflows.

- [ ] Reconcile pending/failed adapter deliveries at 30m, 60m, and end of hypercare.

- [ ] Capture support/UX issues as defects; do not silently patch Production.

- [ ] Complete evidence manifest/checksums and final approvals within the agreed window.

- [ ] At end of hypercare, Business Owner records ACCEPTED, EXTEND MONITORING, ROLLED BACK, or NEW QA CANDIDATE REQUIRED.

# 19. Phase 14 - Day 7 Final Acceptance and BUILD FINAL Decision

| **Stable ID** | **Blocking behavior**                                                  | **Required proof**                                                      |
|---------------|------------------------------------------------------------------------|-------------------------------------------------------------------------|
| D7-01         | Candidate commit/config/migration are frozen and approved.             | Approval record / release manifest.                                     |
| D7-02         | Production environment isolated; fixture disabled; readiness passes.   | Production config + health/ready/schema/CORS/fixture-negative.          |
| D7-03         | Production Human E2E passes with canonical D1 proof.                   | Section 19 / Day 7 Human E2E evidence package.                          |
| D7-04         | Critical negative checks pass safely in Production.                    | Unauthorized + replay/mismatch + fixture-disabled + retrieval evidence. |
| D7-05         | Rollback reference remains available and evidence package is complete. | Deployment/commit reference + EV-01..EV-12.                             |

| **Decision**           | **Conditions**                                                                                                                                        | **Required action**                                                                                                            |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| DAY 7 GO / BUILD FINAL | All acceptance gates and Human E2E pass; Production D1 proof correct; no Blocker/Critical/High defect; rollback remains available; evidence complete. | Record final deployment/migration/commit, evidence path, known issues, owner, operational status, and exact final declaration. |
| STOP - HOLD CANDIDATE  | Production mutation not yet attempted or safe to remain unavailable; evidence/readiness issue discovered before customer traffic.                     | Resolve in QA, create new candidate, rerun full applicable gates.                                                              |
| ROLLBACK               | Production config/migration compatibility/canonical workflow/security/data integrity fails after deployment.                                          | Restore prior Worker/config immediately; preserve additive schema/history; capture incident/evidence; return to QA.            |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FINAL DAY 7 STATUS LANGUAGE</strong></p>
<p>Only when D7-01 through D7-05, the applicable universal gates, Production-safe Human E2E, direct D1 assertions, rollback availability, and release evidence all pass may the release record end with:<br />
<br />
DAY 7 HUMAN E2E PASS -&gt; GALVIVAULT P0 BUILD FINAL<br />
<br />
Any missing, contradictory, stale, or manually repaired evidence means the build is not final.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix A - Day 7 Automated / Release Gate Matrix

| **ID** | **Day** | **Requirement**                                                           | **Proof**                                       | **Level** |
|--------|---------|---------------------------------------------------------------------------|-------------------------------------------------|-----------|
| RG-006 | 1-7     | Existing Production GalviCare smoke remains valid before cutover.         | Safe baseline smoke evidence.                   | BLOCK     |
| RL-001 | 6/7     | Evidence manifest maps to candidate commit/deployment/migration.          | Manifest validation.                            | BLOCK     |
| RL-002 | 6/7     | Required tests failed=0 and mandatory skipped=0.                          | Combined test summary.                          | BLOCK     |
| RL-003 | 7       | Production health/readiness/environment correct.                          | production + DB ready + fixture false.          | BLOCK     |
| RL-004 | 7       | Production idempotent replay preserves same canonical state/no duplicate. | HTTP + D1.                                      | BLOCK     |
| RL-005 | 7       | Production fixture route unavailable.                                     | 404/403 + no fixture state.                     | BLOCK     |
| D7-01  | 7       | Candidate commit/config/migration frozen and approved.                    | Approval record.                                | BLOCK     |
| D7-02  | 7       | Production isolated; fixture disabled; readiness passes.                  | Config + health/ready.                          | BLOCK     |
| D7-03  | 7       | Human E2E passes with canonical D1 proof.                                 | Human E2E package.                              | BLOCK     |
| D7-04  | 7       | Critical negative checks pass safely in Production.                       | Unauthorized/replay/fixture/retrieval evidence. | BLOCK     |
| D7-05  | 7       | Rollback reference available and release evidence complete.               | Rollback ref + manifest.                        | BLOCK     |

## Execution rule

- The full applicable Section 18 matrix must already be green before Human E2E. The Day 7 release IDs above are additive release gates, not permission to run only a small Day 7 subset.

- A Production-safe BLOCK test may run only after migration/deployment readiness. Destructive failure/recovery tests remain QA evidence and are referenced, not replayed in Production.

- If a Day 7 production check exposes a real code/config defect, stop and create a new QA candidate rather than patching the release in place.

# Appendix B - Production Readiness Checklist - One Consolidated Operator Sheet

| **ID** | **Category**                            | **Condition**                                                                   | **Status**  | **Evidence reference**                            |
|--------|-----------------------------------------|---------------------------------------------------------------------------------|-------------|---------------------------------------------------|
| PR-001 | Candidate identity and freeze           | One candidate SHA declared/protected                                            | PASS / FAIL | Commit SHA, branch, tag/RC ID                     |
| PR-002 | Candidate identity and freeze           | Required repository paths present; no parallel Worker/migration path            | PASS / FAIL | Repository inventory / verify:files               |
| PR-003 | Candidate identity and freeze           | Dependencies and lockfile match tested candidate                                | PASS / FAIL | package.json + lockfile + install/test transcript |
| PR-004 | Candidate identity and freeze           | Code review and architecture exceptions resolved                                | PASS / FAIL | PR review / ADR references                        |
| PR-005 | Candidate identity and freeze           | Release freeze active                                                           | PASS / FAIL | Freeze timestamp / change-control statement       |
| PR-006 | Candidate identity and freeze           | Known defects fully listed and dispositioned                                    | PASS / FAIL | Known-issues register                             |
| PR-A01 | Architecture and scope                  | Worker remains sole runtime write authority                                     | PASS / FAIL | Architecture/source/config review                 |
| PR-A02 | Architecture and scope                  | Production D1 remains sole canonical persistence authority                      | PASS / FAIL | Production DB binding + readiness                 |
| PR-A03 | Architecture and scope                  | No browser/CRM/analytics/adapter/Make/AI direct canonical writes                | PASS / FAIL | Source search + security/adapter evidence         |
| PR-A04 | Architecture and scope                  | Production entry is approved; no accidental worker/day1.js or QA fixture policy | PASS / FAIL | wrangler + deployed Worker metadata               |
| PR-A05 | Architecture and scope                  | Release remains inside approved P0 scope                                        | PASS / FAIL | Scope delta + Product Owner review                |
| PR-A06 | Architecture and scope                  | Material architecture/data changes have approved change control                 | PASS / FAIL | ADR/change log                                    |
| PR-C01 | Environment, configuration, and secrets | Production Worker/route distinct from QA                                        | PASS / FAIL | Deployment/route record                           |
| PR-C02 | Environment, configuration, and secrets | DB binding points only to approved Production D1                                | PASS / FAIL | Private resource confirmation + config            |
| PR-C03 | Environment, configuration, and secrets | ENVIRONMENT=production and environment header matches                           | PASS / FAIL | health/ready evidence                             |
| PR-C04 | Environment, configuration, and secrets | FIXTURE_MODE=false and fixture routes unavailable                               | PASS / FAIL | Production negative route test                    |
| PR-C05 | Environment, configuration, and secrets | Production CORS allowlist is approved/default-deny                              | PASS / FAIL | Allowed + denied origin tests                     |
| PR-C06 | Environment, configuration, and secrets | Required secrets configured server-side; no values exposed                      | PASS / FAIL | Secret-name attestation + scan                    |
| PR-C07 | Environment, configuration, and secrets | QA/Prod secrets not improperly shared                                           | PASS / FAIL | Secret inventory attestation                      |
| PR-C08 | Environment, configuration, and secrets | API version/minimum schema match candidate                                      | PASS / FAIL | Worker config + readiness                         |
| PR-C09 | Environment, configuration, and secrets | Adapter flags/endpoints match launch posture                                    | PASS / FAIL | Configuration manifest                            |
| PR-C10 | Environment, configuration, and secrets | No debug/bypass/test-admin/broad-import/unsafe-log flag enabled                 | PASS / FAIL | Config review + negative tests                    |
| PR-D01 | D1 schema and data                      | Migration plan starts from actual Production schema                             | PASS / FAIL | Pre-cutover schema_migrations + plan              |
| PR-D02 | D1 schema and data                      | Migrations proven clean locally and in QA                                       | PASS / FAIL | Migration transcripts                             |
| PR-D03 | D1 schema and data                      | Applied migration files unchanged after QA                                      | PASS / FAIL | Checksum/commit comparison                        |
| PR-D04 | D1 schema and data                      | Required recovery point captured and accessible                                 | PASS / FAIL | Backup/export/recovery artifact                   |
| PR-D05 | D1 schema and data                      | FK/unique/append-only/immutability controls pass                                | PASS / FAIL | DB test report                                    |
| PR-D06 | D1 schema and data                      | No duplicate canonical identities in approved test data                         | PASS / FAIL | Prepared integrity queries                        |
| PR-D07 | D1 schema and data                      | No orphan evidence/reasoning/care/lineage rows                                  | PASS / FAIL | Orphan query results = zero                       |
| PR-D08 | D1 schema and data                      | Production test identities are bounded and marked                               | PASS / FAIL | Test-data register                                |
| PR-D09 | D1 schema and data                      | Import batches reconciled; invalid rows quarantined                             | PASS / FAIL | Import report                                     |
| PR-D10 | D1 schema and data                      | Rollback does not require destructive down migration                            | PASS / FAIL | Rollback review                                   |
| PR-P01 | API, domain, and BMR                    | Production API uses canonical JSON envelope/safe errors                         | PASS / FAIL | Contract + smoke                                  |
| PR-P02 | API, domain, and BMR                    | Mutating routes enforce idempotency/mismatch conflict                           | PASS / FAIL | Duplicate/idempotency matrix                      |
| PR-P03 | API, domain, and BMR                    | AuthN/authZ separates caller classes correctly                                  | PASS / FAIL | Security + Human negative E2E                     |
| PR-P04 | API, domain, and BMR                    | One venture -\> one BMR; multi-session continuity preserved                     | PASS / FAIL | Automated + Human continuity                      |
| PR-P05 | API, domain, and BMR                    | Accepted evidence immutable; correction versions/lineage                        | PASS / FAIL | Correction E2E + D1 proof                         |
| PR-P06 | API, domain, and BMR                    | Reasoning/care lineage requirements enforced                                    | PASS / FAIL | Domain matrix                                     |
| PR-P07 | API, domain, and BMR                    | BMR lifecycle enforces state/actor/version/event/audit                          | PASS / FAIL | Lifecycle report                                  |
| PR-P08 | API, domain, and BMR                    | Current/history/timeline are bounded and separated                              | PASS / FAIL | API tests + operator validation                   |
| PR-P09 | API, domain, and BMR                    | Adapter failure cannot invalidate canonical success                             | PASS / FAIL | Fault + adapter_deliveries                        |
| PR-P10 | API, domain, and BMR                    | Fixture routes and direct SQL/browser write paths impossible                    | PASS / FAIL | Negative evidence                                 |
| PR-S01 | Security, privacy, and access           | No secrets or sensitive raw payloads in repo/evidence                           | PASS / FAIL | Secret/redaction scan                             |
| PR-S02 | Security, privacy, and access           | Protected routes reject missing/invalid/out-of-scope auth                       | PASS / FAIL | AuthN/authZ report                                |
| PR-S03 | Security, privacy, and access           | Webhook signature/timestamp/replay controls pass                                | PASS / FAIL | Webhook negative/duplicate tests                  |
| PR-S04 | Security, privacy, and access           | CORS allowed/denied origins behave exactly                                      | PASS / FAIL | HTTP/browser evidence                             |
| PR-S05 | Security, privacy, and access           | Logs/errors use safe summaries + correlation IDs                                | PASS / FAIL | Log review                                        |
| PR-S06 | Security, privacy, and access           | Operator access is minimum-necessary and traceable                              | PASS / FAIL | Access inventory + audit                          |
| PR-S07 | Security, privacy, and access           | Production test data marked and handled by policy                               | PASS / FAIL | Test-data record                                  |
| PR-S08 | Security, privacy, and access           | Hard delete/broad export/privacy request not improvised                         | PASS / FAIL | Scope/route review                                |
| PR-Q01 | QA, Human E2E, and defects              | All required automated suites pass cleanly                                      | PASS / FAIL | Timestamped report tied to SHA                    |
| PR-Q02 | QA, Human E2E, and defects              | No test skip/quarantine/weakening to make release green                         | PASS / FAIL | Test report + diff                                |
| PR-Q03 | QA, Human E2E, and defects              | Day 1 Human E2E remains evidenced                                               | PASS / FAIL | Signed result                                     |
| PR-Q04 | QA, Human E2E, and defects              | Full P0 Human E2E passes in QA                                                  | PASS / FAIL | Scenario + D1 sheet                               |
| PR-Q05 | QA, Human E2E, and defects              | Production-safe Human E2E runbook approved                                      | PASS / FAIL | Approved runbook                                  |
| PR-Q06 | QA, Human E2E, and defects              | Severity-1/2 closed; residual defects within policy                             | PASS / FAIL | Defect register                                   |
| PR-Q07 | QA, Human E2E, and defects              | Existing Production GalviCare preserved until cutover                           | PASS / FAIL | Regression evidence                               |
| PR-Q08 | QA, Human E2E, and defects              | Rollback drill passed for candidate                                             | PASS / FAIL | Rollback drill report                             |
| PR-O01 | Observability and operations            | Health/readiness expose accurate Production status                              | PASS / FAIL | Pre-write smoke                                   |
| PR-O02 | Observability and operations            | Correlation IDs trace API/log/audit/error records                               | PASS / FAIL | Trace sample                                      |
| PR-O03 | Observability and operations            | Request/error/readiness/migration/idempotency/adapter status inspectable        | PASS / FAIL | Monitoring/query checklist                        |
| PR-O04 | Observability and operations            | Launch monitoring ownership and first response defined                          | PASS / FAIL | Monitoring roster                                 |
| PR-O05 | Observability and operations            | Support distinguishes canonical success from adapter failure                    | PASS / FAIL | Operational runbook                               |
| PR-O06 | Observability and operations            | Recovery uses approved API/deploy/migration/reconciliation; no manual repair    | PASS / FAIL | Recovery runbook                                  |
| PR-O07 | Observability and operations            | Production access and emergency ownership confirmed                             | PASS / FAIL | Access/owner attestation                          |
| PR-O08 | Observability and operations            | Evidence retention location writable/access-controlled                          | PASS / FAIL | Evidence path verification                        |
| PR-B01 | Business and launch                     | Business Owner states P0 launch outcome and deferred scope                      | PASS / FAIL | Release decision                                  |
| PR-B02 | Business and launch                     | Supported founder/operator workflow documented/rehearsed                        | PASS / FAIL | Operating procedure / Human E2E                   |
| PR-B03 | Business and launch                     | Error/recovery messages usable and safe                                         | PASS / FAIL | Human review                                      |
| PR-B04 | Business and launch                     | Launch/monitoring window, rollback authority, channel scheduled                 | PASS / FAIL | Cutover runbook                                   |
| PR-B05 | Business and launch                     | Known limitations and support escalation documented                             | PASS / FAIL | Release notes                                     |
| PR-B06 | Business and launch                     | Release claim does not exceed tested P0 capability                              | PASS / FAIL | Product Owner approval                            |

# Appendix C - Canonical Production D1 Assertion Catalog

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>QUERY SAFETY</strong></p>
<p>Use repository/schema-exact column names and prepared read-only queries. Substitute approved Production-safe IDs. Do not paste sensitive evidence values into release evidence. Do not run mutation/fault assertions against Production.</p></th>
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
<th>-- Migration ledger<br />
SELECT * FROM schema_migrations ORDER BY migration_id;<br />
<br />
-- Founder / venture / BMR / sessions<br />
SELECT founder_id, normalized_email, record_version, status<br />
FROM founders WHERE founder_id = ?;<br />
<br />
SELECT venture_id, venture_name, record_version, status<br />
FROM ventures WHERE venture_id = ?;<br />
<br />
SELECT bmr_id, venture_id, status, record_version, current_session_id<br />
FROM business_medical_records WHERE bmr_id = ?;<br />
<br />
SELECT session_id, bmr_id, status, current_stage, started_at, completed_at<br />
FROM assessment_sessions WHERE bmr_id = ? ORDER BY created_at;<br />
<br />
-- Evidence versions<br />
SELECT evidence_group_id, version_no, status, supersedes_evidence_id, source_type, captured_at<br />
FROM evidence_items WHERE bmr_id = ? ORDER BY evidence_group_id, version_no;<br />
<br />
-- Findings / recommendations / treatment / outcomes<br />
SELECT finding_group_id, version_no, finding_code, confirmation_status, status<br />
FROM findings WHERE bmr_id = ? ORDER BY finding_group_id, version_no;<br />
<br />
SELECT recommendation_group_id, version_no, recommendation_code, status<br />
FROM recommendations WHERE bmr_id = ? ORDER BY recommendation_group_id, version_no;<br />
<br />
SELECT treatment_plan_group_id, version_no, treatment_code, status<br />
FROM treatment_plans WHERE bmr_id = ? ORDER BY treatment_plan_group_id, version_no;<br />
<br />
SELECT outcome_code, outcome_type, observed_at, source_type, status<br />
FROM outcomes WHERE bmr_id = ? ORDER BY observed_at;<br />
<br />
-- Events / audit trace<br />
SELECT event_name, session_id, occurred_at, correlation_id<br />
FROM journey_events WHERE bmr_id = ? ORDER BY occurred_at;<br />
<br />
SELECT entity_type, entity_id, operation, prior_version, new_version,<br />
actor_type, reason_code, correlation_id, occurred_at<br />
FROM audit_log<br />
WHERE entity_id = ? OR correlation_id IN (<br />
SELECT correlation_id FROM journey_events WHERE bmr_id = ?<br />
)<br />
ORDER BY occurred_at;<br />
<br />
-- Generic orphan check pattern; use schema-exact child tables and FK columns<br />
SELECT e.evidence_id<br />
FROM evidence_items e<br />
LEFT JOIN business_medical_records b ON b.bmr_id = e.bmr_id<br />
WHERE b.bmr_id IS NULL;<br />
<br />
-- Add repository-approved duplicate, orphan, lineage, idempotency and adapter queries.<br />
-- Expected release fixture result: zero unintended duplicates/orphans/partial state.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## C.1 Required interpretation

- Row counts and canonical IDs must reconcile with the Human E2E response, not merely look plausible.

- One BMR per venture and stable Founder/Venture/BMR identity are blocking invariants.

- If the operator path was exercised, recommendation/treatment/outcome rows must trace to findings and source context.

- Journey/audit records must show the material transitions and the Human E2E correlation path.

- Any query that reveals an unexplained duplicate/orphan/partial/lineage defect is a release blocker; preserve evidence and rollback/hold.

# Appendix D - Release Evidence Manifest and Artifact Rules

| **Evidence domain**      | **Must identify**                                                                  | **Minimum pass fact**                                           |
|--------------------------|------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| Candidate                | QA branch, candidate SHA, production main SHA/tag, diff, lockfile.                 | Exact release source; no mixed-commit artifacts.                |
| QA baseline              | QA Worker deployment, QA D1, schema, Day 6 gates.                                  | Day 6 GO is real and current.                                   |
| Production configuration | Worker/route/entry, environment, DB binding, CORS, flags, secret-name attestation. | QA/Production separation; fixture false; no secret values.      |
| Migration                | Before/after ledger, exact files/checksums, apply transcript, verification.        | Production schema matches candidate; integrity pass.            |
| Deployment               | Production deployment/version, route, health/ready/schema.                         | Runtime maps to approved release.                               |
| Human E2E                | Run ID, tester, fixture, steps, correlations, screenshots, D1 proof.               | Mandatory Production-safe scenarios pass without manual repair. |
| Negative checks          | Unauthorized, replay/mismatch, fixture disabled, retrieval.                        | Safe rejection/no duplicate/no mutation.                        |
| Rollback                 | Prior deployment/config, drill, trigger matrix, actual record if invoked.          | Safe recovery remains available.                                |
| Monitoring               | Readiness/errors/duration/data integrity/adapter status over launch window.        | Stable signals or explicit rollback/extended monitoring.        |
| Defects                  | Severity, expected/actual, owner, workaround, disposition.                         | No Blocker/Critical/High remains for BUILD FINAL.               |
| Decision                 | GO/Conditional GO/NO-GO/ROLLBACK/ACCEPTED, owner, rationale, timestamps.           | Release authority explicitly decides.                           |
| Operations               | Support/escalation, adapter reconciliation, known issues, operational acceptance.  | Release is supportable after cutover.                           |

# Appendix E - Cutover and Rollback Record Templates

## E.1 Production Readiness Decision

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GALVIVAULT P0 PRODUCTION READINESS DECISION<br />
Release candidate / release_id:<br />
Candidate SHA / tag:<br />
Production target branch: main<br />
QA Worker deployment / schema:<br />
Production current Worker / schema:<br />
Production target schema:<br />
Planned cutover window / timezone:<br />
Rollback deployment / commit / config reference:<br />
Evidence package path:<br />
<br />
Readiness categories:<br />
- Candidate/freeze: PASS | FAIL<br />
- Architecture/scope: PASS | FAIL<br />
- Environment/config/secrets: PASS | FAIL<br />
- D1 schema/data: PASS | FAIL<br />
- API/domain/BMR: PASS | FAIL<br />
- Security/privacy/access: PASS | FAIL<br />
- Automated QA: PASS | FAIL<br />
- QA Human E2E: PASS | FAIL<br />
- Observability/operations: PASS | FAIL<br />
- Business/launch: PASS | FAIL<br />
- Rollback rehearsal: PASS | FAIL<br />
<br />
Open non-blocking conditions:<br />
Decision: GO | CONDITIONAL GO | NO-GO<br />
Business Owner/Product Owner:<br />
Implementation Engineer:<br />
QA/Test owner:<br />
Release operator:<br />
Security/privacy reviewer:<br />
Decision timestamp:<br />
Notes:</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## E.2 Production Cutover Record

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GALVIVAULT P0 PRODUCTION CUTOVER RECORD<br />
Release ID:<br />
Candidate SHA/tag:<br />
Production release SHA on main:<br />
Production Worker / route / D1 target:<br />
Migration set/checksum:<br />
Cutover window/timezone:<br />
Release commander / operator / QA tester / Business Physician / scribe:<br />
<br />
CHECKPOINTS<br />
[ ] Candidate freeze confirmed<br />
[ ] Readiness decision = GO / CONDITIONAL GO<br />
[ ] Prior deployment/rollback point recorded<br />
[ ] D1 recovery point captured<br />
[ ] Preflight health/ready/schema captured<br />
[ ] Migration executed<br />
[ ] Migration ledger/structure/data verification passed<br />
[ ] Worker deployed; deployment ID recorded<br />
[ ] Health/ready/schema/CORS/fixture-negative passed<br />
[ ] Production-safe Human E2E passed<br />
[ ] D1 assertion sheet passed<br />
[ ] Monitoring window stable<br />
[ ] Adapter status reviewed<br />
[ ] Final decision announced<br />
<br />
Final decision: COMPLETE | EXTEND MONITORING | ROLLBACK<br />
Decision timestamp:<br />
Open conditions/defects:<br />
Evidence package path:<br />
Signatures/approvals:</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## E.3 Rollback Record

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GALVIVAULT P0 ROLLBACK RECORD<br />
Release ID:<br />
Failed candidate SHA/deployment:<br />
Rollback target SHA/deployment/config:<br />
Production schema version:<br />
Trigger/severity:<br />
Decision timestamp / initiated by / release commander:<br />
Impacted time window:<br />
Known impacted correlation IDs/entities:<br />
<br />
ACTIONS<br />
[ ] Writes/imports/adapters contained<br />
[ ] Failed deployment/config recorded<br />
[ ] Prior Worker/route/config restored<br />
[ ] Health/ready/schema passed<br />
[ ] Authorization negative test passed<br />
[ ] Core read/write or approved paused-write smoke passed<br />
[ ] D1 integrity queries passed<br />
[ ] Impacted records classified/reconciliation opened<br />
[ ] Operations resumed or intentionally paused<br />
[ ] Evidence package completed<br />
<br />
Result: ROLLBACK VERIFIED | PARTIAL RECOVERY | INCIDENT OPEN<br />
Root-cause owner:<br />
Corrective release requires new candidate? YES | NO<br />
Notes/approvals:</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix F - Codex Final Day 7 Implementation Report Template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>REPORT PURPOSE</strong></p>
<p>The report is a concise index to objective release evidence. It must never substitute for the evidence, Human E2E, D1 proof, or approvals, and it must not state BUILD FINAL when required artifacts are absent.</p></th>
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
<th>GALVIVAULT P0 - DAY 7 IMPLEMENTATION / RELEASE REPORT<br />
<br />
1. Candidate and promotion<br />
- Repository: mrgalvipro/galvitriage<br />
- Candidate branch: qa-revamped-galvicare-0-5<br />
- Production branch: main<br />
- Candidate SHA/tag:<br />
- Production release SHA:<br />
- Release ID:<br />
- Diff scope:<br />
- Files intentionally unchanged (especially unrelated GalviCare workflows):<br />
<br />
2. Day 6 handoff<br />
- D6-01..D6-06:<br />
- Failed / mandatory skipped:<br />
- QA Human E2E:<br />
- QA Worker / schema:<br />
- Rollback drill/target:<br />
<br />
3. Production readiness<br />
- PR-001..PR-B06 summary:<br />
- Decision: GO | CONDITIONAL GO | NO-GO<br />
- Conditions / accepted residual defects:<br />
<br />
4. Production baseline and recovery point<br />
- Pre-cutover Worker / route / schema:<br />
- D1 recovery point:<br />
- Access/operator readiness:<br />
<br />
5. Migration<br />
- Before schema ledger:<br />
- Migration IDs/checksums:<br />
- Production apply result:<br />
- After ledger / structural / integrity verification:<br />
<br />
6. Worker deployment<br />
- Production deployment ID:<br />
- Route/domain:<br />
- Health / ready / schema:<br />
- CORS allowed/denied:<br />
- Fixture-negative:<br />
- Startup logs/errors:<br />
<br />
7. Production-safe Human E2E<br />
- Run ID / tester / identity:<br />
- Founder / Venture / BMR / Session IDs:<br />
- Evidence / operator-chain scope:<br />
- Idempotent replay / mismatch:<br />
- Unauthorized protected route:<br />
- Refresh/retrieval:<br />
- D1 assertion sheet:<br />
- Manual repair used? NO required<br />
<br />
8. Monitoring / adapters<br />
- Launch monitoring result:<br />
- Canonical integrity spot checks:<br />
- Adapter reconciliation:<br />
- Open defects:<br />
<br />
9. Rollback<br />
- Prior target remains available:<br />
- Actual rollback invoked? YES/NO<br />
- If yes: RB-01..RB-10 and incident reference<br />
<br />
10. Evidence<br />
- Evidence package path:<br />
- EV-01..EV-12:<br />
- Manifest checksum:<br />
- Redaction scan:<br />
<br />
11. DAY 7 GATE<br />
- D7-01:<br />
- D7-02:<br />
- D7-03:<br />
- D7-04:<br />
- D7-05:<br />
- Final decision: BUILD FINAL | STOP | ROLLBACK | EXTEND MONITORING<br />
- Decision owner / rationale / known issues / operational owner:<br />
<br />
If and only if every required final gate passes, end exactly with:<br />
DAY 7 HUMAN E2E PASS -&gt; GALVIVAULT P0 BUILD FINAL</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix G - Prohibited Shortcuts / Anti-Regression Rules

| **Do not**                                                                                                     | **Why it invalidates Day 7**                                                                                                         |
|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| Use work or create a new branch to bypass release problems.                                                    | The contract fixes QA implementation on qa-revamped-galvicare-0-5 and Production on main unless Product Owner explicitly changes it. |
| Patch feature code directly on main during cutover.                                                            | Any behavior change creates a new candidate that must return through QA and evidence gates.                                          |
| Rewrite unrelated GalviCare workflows or production files.                                                     | Day 7 is controlled GalviVault promotion, not speculative workflow refactoring; existing Production behavior must remain protected.  |
| Use Production to discover whether migrations/routes/CORS/auth/idempotency/lifecycle work.                     | Those behaviors must already be proven in QA; Production-safe tests only verify the release.                                         |
| Deploy before the required schema is ready.                                                                    | Worker/schema mismatch can create availability or integrity failure; migration/readiness order is binding.                           |
| Modify an applied migration or schema_migrations row manually.                                                 | P0 uses additive forward-only migrations and auditable ledger state.                                                                 |
| Run destructive failure injection, broad import, or direct D1 repair in Production.                            | Production Human E2E is bounded; failure injection and repair are QA/governed recovery activities.                                   |
| Disable fixture/security/CORS/idempotency/auth controls to make smoke pass.                                    | Those controls are themselves blocking release requirements.                                                                         |
| Treat a green GitHub/Cloudflare workflow as BUILD FINAL.                                                       | Release truth requires Human E2E, D1 assertions, rollback, evidence, and explicit decision.                                          |
| Reuse stale QA/Human evidence after a source/config/migration change.                                          | Evidence must map to the exact candidate.                                                                                            |
| Delete the Production-safe test record or audit history to make D1 look clean.                                 | Canonical history is preserved; retention/soft archive follows policy.                                                               |
| Let adapter failure overwrite or roll back canonical state.                                                    | Adapters are downstream/non-authoritative and must be reconciled separately.                                                         |
| Continue after wrong environment/binding, unauthorized write, duplicate canonical state, or lineage loss.      | These are immediate release/rollback triggers.                                                                                       |
| Reconstruct missing evidence from memory/chat and present it as contemporaneous proof.                         | Missing/ambiguous/recreated evidence blocks release acceptance.                                                                      |
| Declare Conditional GO for canonical-data, security, migration, authorization, Human E2E, or rollback defects. | Conditional GO is limited to explicitly non-blocking limitations only.                                                               |

# Appendix H - Day 7 Codex Completion Checklist - One-Page Gate

- [ ] Entry: Day 6 GO evidenced; D6-01..D6-06 pass; no inherited Blocker/Critical/High defect.

- [ ] Branch: candidate is on qa-revamped-galvicare-0-5; Production branch is main; no work/new branch used.

- [ ] Candidate: exact SHA/tag/release_id frozen; package lock and migration checksums recorded.

- [ ] Automated QA: all applicable BLOCK tests pass; failed=0; mandatory skipped=0; final QA Human E2E is current for candidate.

- [ ] RG-006: existing Production GalviCare baseline remains valid before cutover.

- [ ] Readiness: PR-001 through PR-B06 complete; signed GO/Conditional GO; no impermissible condition.

- [ ] Preflight: Production Worker/route/D1/config/secrets/CORS/fixture policy/access/evidence path/rollback target verified.

- [ ] Promotion: exact approved candidate promoted to main; no extra behavior change or unrelated GalviCare workflow rewrite.

- [ ] Recovery point: Production pre-cutover health/ready/schema, deployment/config, D1 read-only state and recovery artifact captured.

- [ ] Migration: exact forward-only set applied; schema_migrations, structure, constraints/triggers and integrity verification pass.

- [ ] Worker: approved candidate deployment recorded; route resolves correctly; QA route untouched.

- [ ] RL-003: Production health/readiness/environment pass; DB ready; fixture false.

- [ ] RL-005: Production fixture route unavailable.

- [ ] Human E2E: bounded Production-safe founder/venture/BMR/session/evidence path passes without undocumented repair.

- [ ] RL-004: same-key Production replay returns same canonical state with no duplicate; changed-payload reuse conflicts with no mutation.

- [ ] Authorization: protected route without authorization fails safely; CORS denied origin fails safely.

- [ ] D1 proof: one BMR, stable canonical IDs, record separation, lineage/care chain as exercised, events/audit, no duplicate/orphan/partial state.

- [ ] Monitoring: launch readiness/errors/data-integrity/retrieval stable; adapter failures, if any, are non-authoritative and reconciled.

- [ ] Rollback: target remains available; RB procedure/authority known; actual rollback executed if any blocking trigger occurred.

- [ ] Evidence: EV-01..EV-12 complete, redacted, checksummed, one release_id, no stale/mixed artifacts.

- [ ] D7-01..D7-05 all PASS.

- [ ] Operations: support/escalation, hypercare cadence, known issues, adapter reconciliation, access/recovery owner documented.

- [ ] Final authority records BUILD FINAL, STOP, ROLLBACK, or EXTEND MONITORING with rationale and timestamp.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FINAL DECLARATION</strong></p>
<p>Only after every required checkbox above is objectively evidenced:<br />
<br />
DAY 7 HUMAN E2E PASS -&gt; GALVIVAULT P0 BUILD FINAL</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Authoritative Source References

- GalviVault P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5, Parts I-IV, Sections 1-25.

- Primary Day 7 execution: Section 15.10; repository/branch contract: Section 5; daily acceptance gates: Section 16; automated matrix: Section 18; Human E2E: Section 19.

- Production release control: Section 20 Production Readiness Checklist; Section 21 Production Cutover Procedure; Section 22 Rollback Strategy; Section 23 Release Evidence Package; Section 24 Operational Governance.

- Immediate entry dependency: GalviVault P0 Day 6 Builder Guide v1.0. The source contract remains controlling if this execution companion and the authoritative guide ever conflict.
