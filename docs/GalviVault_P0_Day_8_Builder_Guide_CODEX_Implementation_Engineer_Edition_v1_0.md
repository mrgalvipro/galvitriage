**GALVIVAULT™**

Day 8 Builder Guide

Clinician Login → Founder Chart → GalviClinic Session Workspace

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CURRENT BUILD STATUS — DAY 7 COMPLETE / DAY 8 AUTHORIZED EXTENSION</strong></p>
Day 8 begins only from an evidenced Day 7 GalviVault P0 Build Final baseline. The seven-day P0 contract intentionally deferred the full clinician portal; the Product Owner has now authorized the first post-P0 operating slice: a secure clinician-facing GalviVault workspace that lets Mr. GalviPro / Business Physician and approved GalviClinicians authenticate, find a founder, open the canonical Founder chart, review the longitudinal Business Medical Record, and perform a governed GalviClinic session through the existing Worker + D1 authority.</th>
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
<th><p><strong>DAY 8 MISSION</strong></p>
Make GalviVault operational at the point of care. Build the smallest complete clinician workspace needed to move from secure login to Founder chart to a real GalviClinic session without creating a second source of truth, bypassing the Worker, weakening authorization, or disturbing the public GalviCare experience.</th>
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
<th><p><strong>NON-NEGOTIABLE PRODUCT PRINCIPLE</strong></p>
The clinician UI is a projection and action surface over the canonical BMR. It is never the BMR itself. Every read comes from authorized Worker APIs; every material write returns through the Worker and preserves version, lineage, lifecycle, event, and audit rules. No direct browser-to-D1 access and no client-held privileged secret is allowed.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Prepared for GalviPro / GalviStudio \| August 2026

Derivative Day 8 execution companion. The Version 0.5 P0 contract governs all inherited canonical, data, Worker, lifecycle, QA, and release invariants. This Day 8 file governs the explicitly authorized clinician-workspace extension described herein.

# How Codex Must Use This Builder

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EXECUTION CONTRACT</strong></p>
Treat this file as an implementation runbook, not a brainstorming document. First fingerprint the exact Day 7 final baseline and the repository reality. Then build only the minimum secure clinician surface and missing operator APIs needed for the end-to-end clinical workflow. Reuse proven P0 services, routes, schema, validation, error mapping, idempotency, lifecycle, and audit behavior. Additive change only. Stop at the first blocking security, data-integrity, authorization, or GalviCare-regression defect.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Priority** | **Instruction**                             | **What it means in practice**                                                                                                                                                                                               |
|--------------|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Start from Day 7 Build Final                | Day 8 is not allowed to repair an unknown Day 7 baseline. Verify exact Production SHA, QA branch state, Worker deployment, schema ledger, and release evidence first.                                                       |
| P0           | Use the approved branch model               | Implementation stays on qa-revamped-galvicare-0-5. Production remains main. Do not create or use work or another workaround branch.                                                                                         |
| P0           | Protect GalviCare                           | Do not rewrite public GalviCare screens, payments, telemetry, HubSpot/GA4/Clarity/Calendly flows, or unrelated workflows to make the clinician portal work.                                                                 |
| P0           | Preserve Worker + D1 authority              | Browser UI calls the Worker. The Worker remains the sole runtime write authority; D1 remains the sole writable canonical store.                                                                                             |
| P0           | Real authentication, not a decorative login | A login screen that can be bypassed, trusts spoofable headers, stores privileged secrets in the browser, or grants access without a validated operator identity is an immediate STOP.                                       |
| P0           | Minimum useful clinical workflow            | The Day 8 slice must support secure entry, founder search, chart review, governed note/evidence capture, finding confirmation/rejection, recommendation/treatment actions, outcome/follow-up capture, and durable re-entry. |
| P1           | Additive extension only                     | Prefer existing P0 APIs. Add only bounded operator/search/auth/projection capability that is truly missing. New tables or routes require tests, migration impact, and rollback/deactivation.                                |
| P1           | Evidence decides completion                 | A visually good portal is not a pass. Automated tests, Human E2E, Worker responses, D1 assertions, authorization negatives, deployment evidence, and GalviCare regression determine status.                                 |

## Source Authority and Scope Boundary

- The Version 0.5 P0 guide is the authority for canonical record ownership, Worker/D1 boundaries, API envelopes, BMR lifecycle, record-class separation, versioning, audit, security, QA, migration, release, and operations.

- The Day 7 Builder is the immediate operational handoff: Day 8 may begin only after the exact Day 7 release is evidenced as BUILD FINAL and the prior safe release/rollback identity is known.

- The P0 source deliberately deferred a full clinician portal while preserving the Business Physician Workspace as a future client surface and defining protected operator routes and minimum operator workflows.

- Section 25 of the source explicitly places Business Physician Workspace minimum viable views/actions in the first post-P0 operating backlog and MVP 1.0: search, BMR summary/timeline, confirm/reject, treatment/outcome entry, export, and a GalviClinic workflow using one BMR.

- The Product Owner instruction for this Day 8 builder is the authorizing scope decision to pull that minimum clinician-facing slice forward now, before the GalviCare \| GalviVault integration test.

- Where this builder specifies exact screen layout, UI file names, operator-search endpoints, or authentication adapter details not fixed by the source, those are Day 8 implementation recommendations. Reuse repository equivalents when they already exist.

## Day 8 Definition of Done

- [ ] Day 7 P0 Build Final evidence is valid, Production is stable, and qa-revamped-galvicare-0-5 is synchronized to the exact released baseline before Day 8 edits begin.

- [ ] A clinician-facing GalviVault portal is available in QA at an isolated operator URL/subdomain/path that does not alter the public GalviCare route or entry behavior.

- [ ] Mr. GalviPro / Business Physician and at least one approved GalviClinician can authenticate through a real server-validated identity boundary and are mapped to explicit operator roles/status.

- [ ] Unauthenticated, invalid, expired, disabled, and out-of-scope callers cannot open a Founder chart or call protected operator APIs.

- [ ] Authenticated clinicians can search for a founder/venture using bounded search and open the one canonical BMR for the venture without exposing unrelated founder records.

- [ ] The Founder chart renders authoritative BMR identity, lifecycle/version, current session, GalviCare evidence/journey context, current findings, recommendations, treatment plans, outcomes, and a typed chronological timeline using Worker projections.

- [ ] The clinician can capture a bounded GalviClinic note as evidence/source material, then perform only governed care actions supported by existing P0 routes: confirm/reject a finding, create/revise a recommendation/treatment plan where preconditions are met, append treatment events, and record outcomes/feedback.

- [ ] No UI action mutates accepted evidence in place, erases history, bypasses expected version, creates unsupported findings, activates treatment without approved care context, or writes directly to D1.

- [ ] Logout/session expiry removes access; re-login and browser refresh recover the same Founder chart and canonical IDs from Worker + D1.

- [ ] Full Day 1-Day 7 regression plus public GalviCare regression remains green; no unrelated GalviCare workflow file is rewritten.

- [ ] QA Human E2E demonstrates login → search → chart → session → save governed clinical actions → logout → re-login → retrieve same canonical state, with D1 proof and no undocumented repair.

- [ ] Day 8 evidence package identifies exact SHA, UI deployment, Worker deployment, schema version, auth configuration identity, tests, Human E2E, D1 assertions, defects, rollback/deactivation plan, and final GO/STOP decision.

## Day 8 Execution Map

| **Section** | **Execution block**                                                        |
|-------------|----------------------------------------------------------------------------|
| 1           | Mission, approved extension, and scope guardrails                          |
| 2           | Day 7 entry gate and baseline fingerprint                                  |
| 3           | Clinician-workspace architecture and trust boundaries                      |
| 4           | Critical-path Day 8 build sequence                                         |
| 5           | Phase 0 — synchronize QA to Day 7 final baseline                           |
| 6           | Phase 1 — repository inventory and minimal-change plan                     |
| 7           | Phase 2 — authentication and operator identity gate                        |
| 8           | Phase 3 — operator search and chart projection APIs                        |
| 9           | Phase 4 — clinician UI shell, login state, and navigation                  |
| 10          | Phase 5 — Founder chart summary, current state, and timeline               |
| 11          | Phase 6 — GalviClinic session preparation and clinical note capture        |
| 12          | Phase 7 — findings governance, recommendations, and treatment plan actions |
| 13          | Phase 8 — outcomes, follow-up, and continuity                              |
| 14          | Phase 9 — accessibility, privacy, error, and session hardening             |
| 15          | Phase 10 — automated QA and regression                                     |
| 16          | Phase 11 — QA deployment and Human E2E                                     |
| 17          | Phase 12 — D1 proof, evidence package, and Day 8 decision                  |
| A           | Day 8 automated test catalog                                               |
| B           | Day 8 API/projection contract                                              |
| C           | Optional operator identity migration                                       |
| D           | Clinician UI acceptance specification                                      |
| E           | Human E2E runbook                                                          |
| F           | D1 assertion catalog                                                       |
| G           | Rollback/deactivation runbook                                              |
| H           | Codex final implementation report template                                 |
| I           | One-page Day 8 completion checklist                                        |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FASTEST SAFE PATH</strong></p>
Do not start by designing the portal. First prove the Day 7 final baseline, discover the existing auth/operator mechanism and Worker routes, and identify exactly which capabilities are already present. The fastest safe build is usually: reuse auth if real → add bounded operator search/me endpoint if missing → build read-only chart first → wire existing governed care writes → run focused Day 8 tests → run full GalviVault/GalviCare regression → QA Human E2E → D1 proof.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Day 8 Mission, Approved Extension & Scope Guardrails

| **Day 8 dimension** | **Binding outcome**                                                                                                                                                                                              |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary outcome     | Secure clinician-facing GalviVault workspace that turns the canonical BMR into the operational chart used by Mr. GalviPro / Business Physician and approved GalviClinicians during GalviClinic.                  |
| User journey        | Login/authenticated entry → Founder search → Founder chart → review longitudinal record → perform governed GalviClinic actions → save through Worker → verify durable retrieval.                                 |
| Technical posture   | Post-P0 additive slice. Preserve the proven Worker/D1 platform. UI is a client surface; it does not create a second persistence or business-logic layer.                                                         |
| Release posture     | Build/test in QA first. Promote only after Day 8 Human E2E and regression pass. Production is not used for first-time clinician behavior.                                                                        |
| Security posture    | Minimum real operator identity + role boundary. No enterprise IAM/SSO program, no fine-grained enterprise ABAC, no password-reset ecosystem unless separately approved.                                          |
| Scope discipline    | Only capabilities necessary to perform a complete governed GalviClinic session from the canonical chart. AI assistance, portfolio analytics, document ingestion, multi-tenancy, and broad admin remain deferred. |

## 1.1 Locked inherited invariants

- Cloudflare Worker remains the sole runtime write authority. The clinician browser never holds D1 credentials, migration credentials, privileged service tokens, or direct SQL access.

- Cloudflare D1 remains the sole writable canonical persistence authority for the Founder/Venture/BMR and all clinical/business-health records.

- Exactly one active BMR exists per venture; clinician search, refresh, duplicate clicks, and session resume cannot create a second BMR.

- Evidence, observations, hypotheses, findings, recommendations, treatments, outcomes, feedback, events, and audit remain separate record classes with explicit lineage.

- Accepted evidence is immutable. Corrections and material care changes create versions/supersession or append-only records according to the P0 contract.

- BMR lifecycle changes are server-authorized, preconditioned, version-checked, evented, and audited. UI state does not become lifecycle truth.

- Adapters remain downstream and non-authoritative. A HubSpot/analytics/notification failure cannot undo a committed clinical action.

- QA and Production remain isolated across UI deployment, Worker, D1, secrets, origins, identity policy, and evidence.

- Migrations are additive and forward-only. Rollback is application/configuration rollback or feature deactivation, not destructive down migration.

- A customer-facing/public caller never receives operator-only history, internal rationale, audit detail, privileged notes, or cross-founder search.

## 1.2 Explicit Day 8 in-scope capability

| **Capability**           | **Day 8 requirement**                                                                                         | **Not allowed**                                                                                                 |
|--------------------------|---------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| Secure entry             | Authenticated operator entry; active approved operator identity required.                                     | Decorative login, shared hardcoded browser secret, trust in spoofable email/header without server verification. |
| Founder search           | Bounded search by approved identity keys such as email/name/venture; minimal result projection.               | Unbounded table dump, wildcard-all on page load, client-side full-dataset search.                               |
| Founder chart            | BMR header, lifecycle/version, current session, current reasoning/care, timeline, relevant GalviCare context. | One mutable report blob or copied browser cache presented as canonical truth.                                   |
| GalviClinic session prep | Review current findings/recommendations, recent evidence, treatment history, unresolved review items.         | AI-generated diagnosis/treatment or inferred truth not already governed.                                        |
| Clinical note capture    | Bounded note captured as source evidence or existing approved note representation with actor/source/time.     | Free-text note silently stored as confirmed finding or treatment decision.                                      |
| Finding governance       | Confirm/reject/supersede only through existing privileged governance route and version checks.                | Client-only status toggle or overwrite of prior finding.                                                        |
| Treatment workflow       | Create/revise approved treatment plan; append events; capture target outcomes.                                | Treatment activation without supported finding/recommendation and authorized actor.                             |
| Outcome/follow-up        | Record sourced/timed outcomes/feedback and monitor continuity.                                                | Missing observation interpreted as success.                                                                     |
| Continuity               | Logout, refresh, re-login, and return recover same BMR from Worker/D1.                                        | LocalStorage as source of truth or duplicate chart records.                                                     |

## 1.3 Deferred after Day 8

- Enterprise SSO/SCIM, organization/tenant administration, broad user-management console, delegated access, fine-grained ABAC, and enterprise compliance claims.

- Founder/customer login, cross-device founder account recovery, and public self-service chart access.

- Autonomous AI diagnosis, treatment selection, cross-case learning, unrestricted summarization, or AI promotion into canonical truth.

- Portfolio dashboards, cohort analytics, data warehouse/lakehouse, vector search, knowledge graph UI, or enterprise reporting.

- Broad file upload/document ingestion, transcript processing, quarantine workflow, or universal ETL.

- Full billing, scheduling, Calendly replacement, CRM case management, or messaging center inside the clinician portal.

- General-purpose CMS/theme redesign of GalviCare or GalviPro public surfaces.

# 2. Day 7 Entry Gate & Baseline Fingerprint

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 8 ENTRY GATE — STOP UNLESS ALL ARE TRUE</strong></p>
Day 7 must be evidenced as GalviVault P0 Build Final. The exact Production release SHA, main branch, Worker deployment, Production D1 schema ledger, and release evidence must be known. The QA branch must be brought to that released baseline before Day 8 changes. Any unresolved Day 7 canonical-data, security, authorization, migration, or rollback defect blocks Day 8.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Check**            | **Required starting state**                        | **Codex evidence**                      |
|----------------------|----------------------------------------------------|-----------------------------------------|
| Repository           | mrgalvipro/galvitriage                             | remote identity                         |
| QA branch            | qa-revamped-galvicare-0-5                          | git branch --show-current               |
| Production branch    | main                                               | remote main head                        |
| Forbidden workaround | No work/new branch                                 | branch inventory                        |
| Day 7 result         | BUILD FINAL / Human E2E PASS                       | Day 7 final evidence                    |
| Production release   | One exact SHA/deployment                           | release manifest + Worker deployment ID |
| Production D1        | Known schema_migrations and integrity              | read-only ledger/assertions             |
| QA baseline          | Matches released Day 7 code before edits           | merge-base/diff evidence                |
| Rollback             | Prior safe Day 7 target known                      | deployment/config reference             |
| GalviCare baseline   | Public flow known-good                             | RG smoke evidence                       |
| Defects              | No inherited blocker/critical/high affecting Day 8 | defect register                         |
| Auth baseline        | Current P0 operator auth mechanism identified      | source/config/test inventory            |

## 2.1 First Codex actions — fingerprint before touching files

**1.** Confirm repository and branch. If current branch is work, main, or any unapproved branch, STOP. Do not create a replacement branch.

**2.** Capture git status, current SHA, remote main SHA, latest Day 7 release tag/identifier, package-lock checksum, migration inventory, and relevant workflow inventory.

**3.** Open the Day 7 release evidence and verify the exact Production SHA, deployment ID, D1 schema version, rollback target, and final Human E2E result.

**4.** Determine whether qa-revamped-galvicare-0-5 already contains the exact Day 7 Production release. If not, synchronize it through the approved Git operation without creating a new branch; record the before/after refs.

**5.** Inventory all existing P0 auth/authz middleware, operator/service caller context, protected-route tests, CORS rules, secrets, and any Cloudflare Access configuration references. Do not design new auth until this is known.

**6.** Inventory current BMR read routes, reasoning/care/history/timeline routes, governance writes, treatment/outcome writes, and any existing search/list/operator projection.

**7.** Inventory existing public GalviCare frontend assets and workflows. Create an explicit “DO NOT MODIFY” list for files unrelated to Day 8.

**8.** Write the Day 8 diff plan before coding: exact files expected to add/change, why each is required, and which P0/GalviCare files are intentionally untouched.

git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git log -1 --oneline
git remote -v
git diff --name-status origin/main...HEAD
\# inspect package.json, wrangler config, migrations, worker auth/routes, workflows
\# inspect Day 7 release evidence and current Cloudflare QA/Production deployment identity

# 3. Clinician Workspace Architecture & Trust Boundaries

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>LOCKED DAY 8 EXECUTION PATH</strong></p>
Clinician browser / operator surface → validated edge/session identity → Cloudflare Worker API → authorization + scope → existing domain services → D1 repositories → canonical GalviVault records → structured operator projection → browser. Material actions also emit the existing idempotency receipt, domain event, and audit evidence. The UI never bypasses the Worker.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Layer**              | **Recommended Day 8 implementation**                                                 | **Responsibility**                                                                | **Failure behavior**                                                                      |
|------------------------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Clinician surface      | Isolated static app / Pages asset set under approved clinician route                 | Render login/session state, founder search, chart, forms, recoverable errors.     | Show safe message + correlation ID; never fallback to direct D1 or local canonical state. |
| Identity edge          | Existing proven operator auth or verified Cloudflare Access identity adapter         | Prove authenticated subject before protected UI/API.                              | Fail closed; no chart/API response.                                                       |
| Operator authorization | Worker auth middleware + operator account/role mapping                               | Map authenticated subject to active role and entity/action scope.                 | 401 for no identity; 403 for invalid/disabled/out-of-scope role.                          |
| API/projection         | Existing Worker route modules plus minimal operator read/search endpoints if missing | Return bounded chart projections and accept governed actions.                     | Canonical JSON error envelope; no HTML/stack/SQL.                                         |
| Domain services        | Reuse Day 1-Day 7 services                                                           | Validate identity, lifecycle, lineage, versions, idempotency, care preconditions. | No partial canonical writes.                                                              |
| Persistence            | Existing D1 repositories and additive operator identity table only if required       | Canonical records, audit/events, operator mapping.                                | Fail closed; readiness/error evidence.                                                    |
| Adapters               | Existing downstream adapters                                                         | Commercial/analytics/notification copies after canonical commit.                  | Record failure; do not invalidate clinical action.                                        |

## 3.1 Day 8 identity principle

- Do not build a new password system merely to display a branded login page if a proven server-validated operator identity mechanism already exists.

- Preferred order: (A) reuse an existing validated Cloudflare Access/edge identity path if present; (B) reuse the existing P0 operator authentication mechanism if it is real, non-bypassable, server-side, and supports individual clinicians; (C) if neither exists, STOP and implement the minimal operator identity mapping/session boundary specified in Appendix C before enabling any chart data.

- If Cloudflare Access is used, the Worker must validate the Access JWT or equivalent trusted proof. It must not accept an arbitrary client-supplied email header as identity.

- A clinician email/subject is not authorization by itself. The authenticated subject must map to an active operator account/role allowed to use the portal.

- Day 8 roles are intentionally small: business_physician and clinician. Do not build enterprise role hierarchies or organization tenancy.

## 3.2 Minimum role/action matrix

| **Action**                                 | **Business Physician**             | **GalviClinician**                                                         | **Public/unauthenticated** |
|--------------------------------------------|------------------------------------|----------------------------------------------------------------------------|----------------------------|
| Open clinician workspace                   | Allow                              | Allow                                                                      | Deny                       |
| Search founder/venture                     | Allow                              | Allow                                                                      | Deny                       |
| Open BMR summary/timeline/current care     | Allow                              | Allow                                                                      | Deny                       |
| View protected history/internal governance | Allow                              | Allow only if source policy permits; default allow for Day 8 clinical role | Deny                       |
| Capture clinician note/source evidence     | Allow                              | Allow                                                                      | Deny                       |
| Confirm/reject finding                     | Allow                              | Allow if authorized clinical actor                                         | Deny                       |
| Create/revise recommendation               | Allow                              | Allow if clinical actor route permits                                      | Deny                       |
| Create/revise treatment plan               | Allow                              | Allow if clinical actor route permits                                      | Deny                       |
| Append treatment event/outcome/feedback    | Allow                              | Allow                                                                      | Deny                       |
| Archive BMR                                | Business Physician only by default | Deny                                                                       | Deny                       |
| Operator/user administration               | Not Day 8 UI                       | Not Day 8 UI                                                               | Deny                       |
| Direct D1 access                           | Never from UI                      | Never from UI                                                              | Never                      |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ROLE RULE</strong></p>
If the current P0 authorization matrix is stricter than this table, preserve the stricter rule. Day 8 may not broaden privileges simply to make the UI easier. Any broadened clinician permission requires an explicit test and Product Owner acceptance.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 4. Critical-Path Day 8 Build Sequence

| **Order** | **Gate**     | **Primary action**                                                                       | **Exit condition**                                           |
|-----------|--------------|------------------------------------------------------------------------------------------|--------------------------------------------------------------|
| 0         | Entry        | Prove Day 7 Build Final; synchronize QA to release baseline.                             | Exact stable baseline or STOP.                               |
| 1         | Inventory    | Discover auth, routes, UI assets, deployment, and do-not-modify GalviCare files.         | Minimal diff plan approved.                                  |
| 2         | Identity     | Select/reuse real operator identity path; add minimal operator mapping only if required. | Protected /me returns active role; negatives fail closed.    |
| 3         | Read APIs    | Add/reuse bounded operator founder search + BMR chart projection.                        | Authenticated search/chart read works; cross-scope denied.   |
| 4         | UI shell     | Build isolated clinician portal shell and authenticated session state.                   | Login/session/logout and routing work in QA.                 |
| 5         | Chart read   | Render summary, current reasoning/care, timeline, source/version metadata.               | One canonical BMR displayed without browser-side truth.      |
| 6         | Session prep | Add GalviClinic preparation view and clinician note/source capture.                      | Note/evidence persists with actor/source/time.               |
| 7         | Care actions | Wire confirm/reject, recommendation, treatment plan/revision/events.                     | All actions use P0 governance/version/idempotency.           |
| 8         | Outcome      | Wire outcome/feedback/follow-up and durable continuity.                                  | Clinical episode data is retrievable after refresh/re-login. |
| 9         | Hardening    | Accessibility, privacy, errors, timeout, CSRF/session, bounded queries.                  | Security/usability matrix passes.                            |
| 10        | Regression   | Run Day 8 tests + full GalviVault + public GalviCare regression.                         | failed=0; mandatory skipped=0.                               |
| 11        | QA E2E       | Deploy isolated QA portal + Worker candidate; perform Human E2E.                         | Login→chart→clinic workflow PASS.                            |
| 12        | Evidence     | Run D1 assertions, package evidence, decide GO/STOP.                                     | Day 8 HUMAN E2E PASS or documented STOP.                     |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FAIL-FAST ORDER</strong></p>
Wrong branch, unknown Day 7 baseline, spoofable identity, unauthorized chart access, wrong D1 binding, cross-founder leakage, duplicate BMR, lineage loss, accepted-evidence mutation, treatment without care preconditions, public GalviCare regression, or missing rollback/deactivation is an immediate STOP.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. Phase 0 — Synchronize QA to the Day 7 Final Baseline

**1.** Record the exact Day 7 Production release SHA from main and release evidence.

**2.** Compare qa-revamped-galvicare-0-5 with the release SHA. Do not assume the QA branch already contains the final promoted code.

**3.** If QA is behind, bring it to the release baseline using the approved merge/fast-forward method. If QA has divergent Day 8-unrelated changes, classify them before proceeding; do not silently carry them forward.

**4.** Run the Day 7 production-safe health/readiness/schema checks against the known Production release without mutations and record the baseline.

**5.** Run the known-good public GalviCare smoke against the current baseline before Day 8 implementation. This becomes the comparison point for later regression.

**6.** Freeze and label the Day 8 starting SHA. Every later changed file must be explainable against this baseline.

## 5.1 Baseline STOP conditions

- Day 7 final evidence cannot identify one exact Production SHA/deployment/schema.

- QA branch cannot be reconciled to the Day 7 release without unexplained unrelated changes.

- Public GalviCare is already failing before Day 8 changes; classify and resolve baseline ownership before attributing failures to Day 8.

- P0 protected-route authorization is known to be bypassable or unresolved.

- The current Worker/D1 Production binding is ambiguous or schema_migrations does not match release evidence.

# 6. Phase 1 — Repository Inventory & Minimal-Change Plan

Codex must inspect actual repository paths first. The following layout is a recommendation only when equivalent structures do not already exist.

| **Recommended path**                          | **Purpose**                                            | **Rule**                                                                         |
|-----------------------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------------|
| clinician-portal/index.html                   | Portal shell / authenticated root                      | Separate from public GalviCare entry; no privileged data hardcoded.              |
| clinician-portal/app.js                       | Client routing/state/API calls                         | No D1 SQL, secrets, auth bypass, or canonical local state.                       |
| clinician-portal/styles.css                   | Accessible clinician UI styles                         | Reuse approved brand tokens where practical; no dependency change for cosmetics. |
| clinician-portal/components/\*                | Search, chart, timeline, forms                         | Small view components; render server projections.                                |
| worker/routes/operator-workspace.js           | /api/v1/operator/me, search/projections if missing     | Protected, bounded, minimal fields.                                              |
| worker/auth/operator-identity.js              | Verified identity → operator role/context              | Reuse existing middleware; do not duplicate auth policy.                         |
| worker/services/operator-workspace-service.js | Search/projection composition                          | Read-only composition; writes still use existing domain services.                |
| worker/repositories/operator-repository.js    | Operator mapping/search if required                    | No canonical BMR duplication.                                                    |
| migrations/day8/\*                            | Optional additive operator identity/index changes      | Only if repository reality proves missing schema.                                |
| tests/day8-clinician-workspace.test.mjs       | Day 8 unit/API/security/UI contract tests              | Fail non-zero; no mandatory skips.                                               |
| scripts/day8-human-e2e.mjs                    | Optional bounded QA E2E helper                         | No direct D1 mutation; evidence only.                                            |
| .github/workflows/galvivault-day8-qa.yml      | Day 8-only QA workflow if no existing generic workflow | Do not edit unrelated GalviCare workflows merely to run Day 8.                   |

## 6.1 Explicit “do not modify unless proven necessary” list

- Public GalviCare route/screen code that controls GalviTriage, GalviVitals, GalviScore, GalviShot, GalviSight, GalviPath, Stripe handoff, or Calendly.

- Existing known-good GalviCare GitHub workflows such as broad QA stabilization or production readiness workflows, unless an exact Day 8 blocker proves a targeted change is unavoidable and regression is rerun.

- Applied Day 1-Day 7 migration files or schema_migrations history.

- P0 domain services solely for code cleanup or renaming.

- HubSpot/GA4/Clarity/Stripe adapters simply to expose data in the portal; the chart must read canonical Worker projections.

- main branch directly during implementation.

# 7. Phase 2 — Authentication & Operator Identity Gate

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>AUTHENTICATION SELECTION GATE</strong></p>
Codex must choose the smallest existing real identity path. Do not build a second parallel login system. Document the selected mechanism, how the Worker verifies it, how logout/expiry works, and how authenticated identity maps to an active operator role.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Path**                                     | **Use when**                                                                                         | **Required Day 8 proof**                                                                                                                       |
|----------------------------------------------|------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| A — Existing Cloudflare Access/edge identity | QA/portal is already protected or account configuration supports a verified Access identity.         | Worker validates trusted Access token/proof; subject/email maps to active operator; spoofed headers fail; denied identity never reaches chart. |
| B — Existing P0 operator auth                | P0 already has a tested individual operator/session mechanism appropriate for clinician browser use. | Login UI uses that mechanism; credentials/tokens remain server-side or secure session storage; expiry/logout/revocation tested.                |
| C — Minimal operator mapping extension       | Authentication exists at edge but there is no durable clinician role/status mapping.                 | Add operator_accounts mapping only; no password store; Worker enforces role/status.                                                            |
| STOP — No real auth                          | Only a shared secret, client flag, or unverified header exists.                                      | Do not expose chart. Implement/approve a real server-validated identity boundary before continuing.                                            |

## 7.1 Required operator identity fields

| **Field**               | **Required behavior**                                                                           |
|-------------------------|-------------------------------------------------------------------------------------------------|
| operator_id             | Server-generated opaque stable ID.                                                              |
| auth_subject            | Stable identity subject from trusted auth mechanism when available; unique.                     |
| email_normalized        | Normalized operator email for display/mapping; unique among active accounts as policy requires. |
| display_name            | Clinician display name; never used as authorization key.                                        |
| role                    | business_physician or clinician for Day 8.                                                      |
| status                  | active, disabled, invited/pending only if needed. Disabled accounts fail closed.                |
| created_at / updated_at | UTC timestamps; updates audited if represented in canonical governance.                         |
| last_login_at           | Optional operational field; do not make clinical authorization depend on it.                    |

## 7.2 Protected session/API behavior

- GET /api/v1/operator/me (or existing equivalent) returns only the active operator context needed by the UI: operator_id, display_name, role, environment, session expiry/identity facts safe to expose.

- Missing/invalid/expired identity returns the canonical GV_AUTH_REQUIRED / 401 behavior. An authenticated identity without active operator mapping returns GV_AUTH_FORBIDDEN / 403.

- Do not leak whether another clinician email is registered. Login/denial messages remain generic and actionable.

- Logout invalidates the application/session mechanism where supported and always removes client-held session state. Edge sessions may also require the provider logout path.

- The portal must not cache protected chart responses in a service worker or persistent browser storage unless separately designed and approved.

- All protected responses should send no-store/private cache directives as appropriate for sensitive operator data.

## 7.3 Day 8 authentication negative tests

| **Test ID** | **Scenario**                                                    | **Expected**                                                 |
|-------------|-----------------------------------------------------------------|--------------------------------------------------------------|
| D8-AUTH-001 | Open portal/API with no identity                                | Login/Access challenge or 401; no chart data.                |
| D8-AUTH-002 | Malformed/invalid token/session                                 | 401 safe error; no data.                                     |
| D8-AUTH-003 | Expired session                                                 | 401; UI returns to sign-in; no stale chart remains.          |
| D8-AUTH-004 | Authenticated subject not in active operator mapping            | 403; no founder search results.                              |
| D8-AUTH-005 | Disabled operator                                               | 403; no chart or writes.                                     |
| D8-AUTH-006 | Spoof identity header/email from browser                        | Rejected because Worker validates trusted proof.             |
| D8-AUTH-007 | Clinician attempts Business Physician-only archive/admin action | 403; no state change.                                        |
| D8-AUTH-008 | Logout then browser back/refresh                                | Protected route rechecks identity; no cached chart exposure. |

# 8. Phase 3 — Operator Search & Founder Chart Projection APIs

Day 8 should reuse the P0 BMR routes wherever possible. Add new endpoints only for missing operator-specific search/composition. New endpoints are read-only projections and cannot become a parallel domain service.

| **Endpoint / capability**                                               | **Purpose**                                                                                  | **Rules**                                                                                                   |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| GET /api/v1/operator/me                                                 | Return validated operator context.                                                           | Protected; minimal safe fields; no secrets.                                                                 |
| GET /api/v1/operator/founders?query=&cursor=&limit=                     | Bounded founder/venture search.                                                              | Protected; indexed normalized search; max limit; minimal result fields; no cross-record payload dump.       |
| GET /api/v1/business-medical-records/{bmr_id}                           | Existing BMR header/current identity.                                                        | Reuse existing route; operator scope required.                                                              |
| GET /api/v1/business-medical-records/{bmr_id}/timeline                  | Existing typed timeline.                                                                     | Bounded/paginated; operator view.                                                                           |
| GET /api/v1/business-medical-records/{bmr_id}/reasoning                 | Existing current/history reasoning.                                                          | Separated record classes; current default.                                                                  |
| GET /api/v1/business-medical-records/{bmr_id}/care                      | Existing recommendations/plans/events/outcomes/feedback.                                     | Current/history filters; bounded.                                                                           |
| GET /api/v1/operator/business-medical-records/{bmr_id}/chart (optional) | One optimized operator chart projection if multiple reads create unacceptable UI complexity. | Composition only; identifies source record versions; no new canonical store; must not hide lineage/history. |
| Existing POST governance/care/evidence routes                           | Clinical actions.                                                                            | Do not create UI-only write endpoints that bypass existing validations.                                     |

## 8.1 Founder search result projection

- Return only enough data to identify the correct chart: founder_id, founder display name, normalized/safe email, venture_id, venture name, bmr_id, BMR lifecycle status, current record_version, latest relevant session timestamp, and optional current care status.

- Do not return full evidence, findings, audit, clinical notes, payment facts, or other sensitive record bodies in search results.

- Use deterministic stable sorting (for example exact match rank then updated_at then IDs) so pagination is reproducible.

- Enforce maximum limit (recommended 25) and minimum query length unless exact ID/email lookup. An empty query must not dump all founders unless explicitly approved for the small operator model.

- Search is case-insensitive/normalized through indexed normalized columns or safe exact/prefix queries. Do not use unbounded LIKE scans if indexes can be added safely.

## 8.2 Founder chart projection contract

| **Chart section**    | **Required source**                                     | **Minimum fields shown**                                                                                                                              |
|----------------------|---------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| Header               | Founder + Venture + BMR                                 | Founder/venture display identity, canonical IDs in technical detail drawer, BMR lifecycle, record_version, last updated.                              |
| Journey snapshot     | Sessions + journey events + existing product references | Current/most recent session, GalviCare stage/product facts already canonical, paid/unlocked facts only when supported by canonical/provider evidence. |
| Clinical summary     | BMR + current reasoning + care                          | Current confirmed/needs-review findings, active recommendations, active treatment plan, unresolved follow-up/outcome state.                           |
| Evidence             | Evidence route                                          | Current evidence summaries, source_type/source_ref, captured_at, status/version; full value only when authorized and needed.                          |
| Reasoning            | Reasoning route                                         | Observations/hypotheses/findings with confidence, confirmation, source/version, support references.                                                   |
| Care                 | Care route                                              | Recommendations, treatment plans/items/events, outcomes, feedback; current first with history accessible.                                             |
| Timeline             | Timeline route                                          | Typed chronological session/evidence/reasoning/care/outcome/governance entries.                                                                       |
| History/audit detail | Authorized history/audit routes if already supported    | Only when needed for traceability; bounded; no default giant payload.                                                                                 |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PROJECTION RULE</strong></p>
Every chart screen must be reproducible from canonical Worker responses. A UI-composed “summary” may format or group records, but it may not invent new clinical/business-health truth, hide source/version context, or persist a new shadow chart document.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 9. Phase 4 — Clinician UI Shell, Login State & Navigation

The clinician portal should be desktop-first but responsive, fast, and deliberately simpler than the public GalviCare experience. Its primary job is trusted chart review and governed action, not marketing or decorative analytics.

| **Screen**                  | **Required elements**                                                                                                            | **Acceptance rule**                                                           |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| Secure entry                | GalviVault / GalviClinic identity, secure sign-in/continue action, environment marker in QA.                                     | Cannot reveal chart data before verified identity.                            |
| Workspace home              | Operator name/role, Founder search field, recent/reopened chart optional only if server-projected.                               | No full-founder preload; clear logout.                                        |
| Search results              | Founder + venture + BMR status/version + last activity.                                                                          | Bounded results; exact chart selected by canonical IDs.                       |
| Founder chart               | Sticky chart header + tabs/sections: Overview, Timeline, Evidence, Findings, Care Plan, GalviClinic Session, Outcomes/Follow-up. | Data comes from protected Worker APIs; loading/error/empty states visible.    |
| GalviClinic session         | Pre-session snapshot, note capture, finding governance, recommendation/treatment forms, follow-up.                               | No action silently persists; success shows canonical IDs/version/correlation. |
| Technical provenance drawer | Optional IDs/source versions/correlation for operator debugging.                                                                 | Operator-only; does not replace user-friendly display.                        |

## 9.1 UI state rules

- Canonical state lives on the server. The browser may hold temporary form/input state and the currently selected bmr_id only.

- Refresh must refetch chart state from the Worker and recover the same BMR. If a write succeeded but the response was lost, replay uses the same idempotency key and then refetches.

- Every mutating form generates one idempotency key per intended operation and reuses it only for network retry of the identical request.

- Disable duplicate submit while a request is in flight, but never rely on button disabling as the only idempotency protection.

- Version-sensitive forms carry expected_version/current version from the server and surface 409 conflicts as “record changed; refresh/review” rather than overwriting.

- QA environment must be visually unmistakable to prevent a clinician from mistaking QA for Production.

## 9.2 Accessibility and usability minimum

- Keyboard-accessible search, tabs, forms, modal/drawer controls, and logout.

- Visible focus state; semantic labels; error messages associated with fields; status not communicated by color alone.

- Readable contrast and type sizes; tables must collapse or scroll safely on smaller screens.

- Loading skeleton/spinner cannot obscure a previous founder’s protected data while a new chart loads.

- Empty, unauthorized, expired-session, validation, conflict, and server-error states each have a clear operator action.

- No console logging of full founder evidence, tokens, or sensitive clinical notes.

# 10. Phase 5 — Founder Chart Summary, Current State & Timeline

Build read-only chart functionality before enabling any clinical mutation. Codex should be able to prove that an authenticated clinician can locate a known founder and reconstruct the BMR chronology from existing P0 routes before any Day 8 write form is turned on.

**1.** Implement authenticated Founder search and select the exact founder/venture/BMR result.

**2.** Fetch BMR header and current version. Verify one BMR per venture and display status/version.

**3.** Fetch current reasoning and render observations/hypotheses/findings in separate groups. Findings show confidence, confirmation state, source/version, and support count/links.

**4.** Fetch current care and render recommendations, active/latest treatment plan and plan items, recent treatment events, outcomes, and feedback separately.

**5.** Fetch timeline with a bounded initial page. Render each entry by typed event/class, timestamp, actor/source summary, and relevant canonical ID. Load more through cursor, not unbounded fetch.

**6.** Fetch evidence only when the Evidence section/tab is opened or when a selected finding needs support detail. Avoid retrieving the entire evidence corpus on initial chart load.

**7.** Verify refresh, back/forward navigation, and re-opening the chart all return the same canonical IDs and versions.

**8.** Do not enable clinical action forms until D8-READ tests and cross-founder authorization negatives pass.

## 10.1 Overview screen clinical prioritization

| **Priority panel** | **Show**                                                                      | **Do not infer**                                                          |
|--------------------|-------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| Current status     | BMR lifecycle, latest session, active treatment/monitoring state.             | Do not map browser page or paywall status to BMR lifecycle.               |
| Needs review       | Findings with needs_review/unconfirmed states; unresolved follow-up evidence. | Do not auto-confirm based on confidence alone.                            |
| Active care        | Current recommendations, plan objective, owners, target dates/outcomes.       | Do not mark treatment successful without sourced outcome.                 |
| Recent change      | Latest typed timeline items and version changes.                              | Do not collapse history into one narrative note.                          |
| GalviCare context  | Canonical product/journey facts already stored from GalviCare.                | Do not scrape public browser UI or HubSpot to reconstruct clinical truth. |

# 11. Phase 6 — GalviClinic Session Preparation & Clinical Note Capture

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>SESSION MODEL</strong></p>
Day 8 does not need a second “clinic chart” database. The GalviClinic session works directly against the existing Founder/Venture/BMR and, where appropriate, the existing assessment/session identity. The clinician’s narrative note is source material/evidence; confirmed findings and treatment decisions remain separate governed records.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 11.1 Pre-session preparation panel

- Founder/venture identity and BMR lifecycle/version.

- Most recent GalviCare session/journey stage and canonical product artifacts or references that exist in the BMR.

- Current findings grouped by confirmed, needs review, and unconfirmed.

- Active recommendations and treatment plan, if any.

- Open target outcomes/follow-up dates and recent outcomes.

- Recent evidence changes/corrections and relevant timeline entries.

- A visible “Data provenance” affordance to inspect source IDs/versions when making a clinical decision.

## 11.2 Clinical note capture contract

| **Field**                | **Requirement**                                                                                                                                                                                   |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bmr_id                   | Current chart BMR; server verifies scope.                                                                                                                                                         |
| session_id               | Use existing active/relevant session when appropriate; otherwise optional according to P0 evidence contract.                                                                                      |
| source_type              | Use existing approved operator/facilitator/clinician note source type if present. If the schema restricts values and no suitable type exists, add an additive migration only after impact review. |
| source_ref               | Stable Day 8 note context such as galviclinic.session_note or an approved code/version.                                                                                                           |
| value_type/value_text    | Bounded text. Enforce payload limit. Do not store arbitrary HTML.                                                                                                                                 |
| captured_at              | Server-validated timestamp or approved operator-supplied observation timestamp per contract.                                                                                                      |
| actor/source metadata    | Authenticated operator_id and role/source. Browser display name is not trusted as actor identity.                                                                                                 |
| status                   | Follow existing evidence draft/accepted workflow. Do not auto-accept clinician free text as a finding.                                                                                            |
| consent/privacy metadata | Reuse existing required evidence metadata; do not weaken validation for notes.                                                                                                                    |

## 11.3 Note acceptance behavior

- Saving a note creates or appends the approved source evidence representation and emits the normal event/audit context.

- The note appears in the chart/timeline only after successful canonical Worker response.

- Editing an already accepted note must use the existing evidence correction/supersession path; no in-place mutation.

- A note may support a later observation/finding, but the UI must require the governed finding route and support references. “Save note” never means “diagnose.”

# 12. Phase 7 — Findings Governance, Recommendations & Treatment Plan Actions

Day 8 care actions are UI orchestration over P0 governance. The clinician interface must make the required source/version/lineage visible enough that a user understands what they are confirming or treating.

## 12.1 Confirm / reject a finding

**1.** Open a finding from the current reasoning projection and show statement, confidence, confirmation_status, source/version, and support links.

**2.** Require an explicit action: Confirm or Reject. Do not default either action.

**3.** Require reason/comment where the existing governance route requires it; carry expected_version.

**4.** POST through the existing governance confirmation route. Do not patch the finding row directly from the UI.

**5.** On success, refetch current reasoning/timeline and display the new governed state with event/audit/correlation context.

**6.** On 409 version conflict, discard no data; inform the clinician the record changed and refetch before resubmission.

## 12.2 Create / revise recommendation

| **UI field**                     | **P0 requirement**                                                                  |
|----------------------------------|-------------------------------------------------------------------------------------|
| Finding selection                | At least one current supported finding.                                             |
| Recommendation code/title/action | Approved code/source or authorized operator source; bounded text.                   |
| Rationale                        | Evidence/finding-linked rationale; not a generic free-text replacement for lineage. |
| Priority/status                  | Explicit allowed values.                                                            |
| Source/version                   | Operator/rule source context.                                                       |
| Revision                         | Use supersede/version route; preserve prior recommendation and links.               |

## 12.3 Create / revise treatment plan

| **UI field**                    | **Required behavior**                                                                                                       |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| Treatment code / objective      | Required approved care context; bounded.                                                                                    |
| Linked findings/recommendations | Server validates support and same BMR.                                                                                      |
| Owner                           | Authenticated clinical/business owner context or approved owner field; do not trust arbitrary privileged actor from client. |
| Start/target dates              | Validated dates; no lifecycle inference from UI alone.                                                                      |
| Plan items                      | Ordered responsibilities/actions created atomically with plan version.                                                      |
| Target outcomes                 | Explicit target outcome definitions; missing future observations are not automatically success.                             |
| Activation                      | Only after server lifecycle preconditions. BMR transition occurs through approved domain behavior.                          |
| Revision                        | New plan version; prior plan/items/events retained.                                                                         |
| Treatment event                 | Append-only event with occurred_at, actor, safe notes/metadata; no update/delete of history.                                |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CARE ACTION STOP RULE</strong></p>
If the UI can create a recommendation without a finding, activate a plan without approved care context, overwrite a prior plan, bypass expected_version, or confirm a finding without privileged authorization, Day 8 is failed even if the screen appears to work.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 13. Phase 8 — Outcomes, Follow-Up & Longitudinal Continuity

A complete GalviClinic session must leave the BMR ready for the next contact. Day 8 therefore needs an explicit follow-up/outcome path, even when the first clinic session has no measured outcome yet.

| **Action**              | **Required behavior**                                                                                                              |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Record outcome          | Require bmr_id, plan/recommendation relation, outcome code/type, typed value, observed_at, source, and optional evidence links.    |
| Record feedback         | Append target type/id, feedback type, disposition/comment, actor/source; do not overwrite target record.                           |
| Schedule/follow-up note | Day 8 may record a follow-up treatment event or approved metadata; do not build a new scheduling system unless already integrated. |
| Move to monitoring      | Only through existing BMR lifecycle transition when treatment activity and preconditions are satisfied.                            |
| Close care episode      | Only explicit authorized transition with closure reason and no unresolved blocking care state.                                     |
| Reopen later            | Use existing BMR reopen transition; never create a new BMR for the same venture merely because a new GalviClinic session occurs.   |

## 13.1 Continuity acceptance

- After every successful write, the UI refetches canonical chart state rather than assuming the local form represents saved truth.

- Browser refresh returns the same BMR, latest versions, and appended treatment/outcome history.

- Logout and re-login as the same clinician returns the same chart.

- A second approved clinician can open the same chart and see canonical state, subject to the same role/scope policy.

- Two sessions for the same venture remain attached to the same BMR; no duplicate chart is created.

- A later GalviCare journey submission remains part of the same longitudinal BMR and appears in chart/timeline through the existing integration path.

# 14. Phase 9 — Accessibility, Privacy, Error & Session Hardening

| **Control**        | **Day 8 required proof**                                                                                                                                                                                            |
|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CORS/origin        | Clinician portal QA/Production origin exact-match is allowed; arbitrary origin denied. Public GalviCare origin behavior remains unchanged.                                                                          |
| Authentication     | Missing, invalid, expired, spoofed identity fails closed.                                                                                                                                                           |
| Authorization      | Public caller cannot search founders or retrieve operator chart; clinician cannot exceed role.                                                                                                                      |
| Cross-BMR scope    | Changing bmr_id/venture_id in URL/request cannot expose an unrelated record beyond the operator’s approved global clinical scope; if global clinical scope is intended, it must still require active operator role. |
| Sensitive caching  | Protected responses use safe cache policy; logout/back does not reveal stale chart.                                                                                                                                 |
| Logging            | No token, raw full evidence, clinical note body, password, SQL, or secret in console/log/evidence.                                                                                                                  |
| Errors             | Canonical JSON safe error + correlation ID; UI maps 401/403/404/409/422/503 without blank screen.                                                                                                                   |
| Payload limits     | Notes and forms enforce bounded length/content type before expensive work.                                                                                                                                          |
| Query bounds       | Founder search/timeline/evidence/history are limited/paginated and indexed.                                                                                                                                         |
| Accessibility      | Keyboard, focus, labels, contrast, error association, reduced ambiguity.                                                                                                                                            |
| QA environment cue | Visible QA banner/environment marker; Production has no QA fixture paths.                                                                                                                                           |
| Session timeout    | Expired identity triggers sign-in and clears protected client state.                                                                                                                                                |

# 15. Phase 10 — Automated QA & Regression

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>AUTOMATED PASS RULE</strong></p>
Day 8 is not allowed to pass on a focused clinician UI suite alone. Run the Day 8 unit/API/security/projection tests first, then the full applicable GalviVault Day 1-Day 7 regression and the known-good public GalviCare regression. failed=0 and mandatory skipped=0.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Suite**                   | **Minimum Day 8 coverage**                                                                                                                                          | **Blocking** |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| Static/repository           | No wrong branch; required UI/routes present; no secret patterns; no direct D1 client code; no modified applied migrations; no unrelated GalviCare workflow rewrite. | Yes          |
| Operator identity           | /me, active role mapping, no/invalid/expired/disabled/spoof identity, logout.                                                                                       | Yes          |
| Search/projection           | Bounded search, exact canonical IDs, chart summary, current/history/timeline, pagination, safe fields.                                                              | Yes          |
| Security                    | Public vs operator routes, role restrictions, CORS, cache headers, error safety, payload limits.                                                                    | Yes          |
| Clinical note/evidence      | Source/actor/time, immutability/correction, idempotency, same BMR.                                                                                                  | Yes          |
| Governance/care             | Confirm/reject, recommendation lineage, plan atomicity/versioning, treatment events append-only, outcomes sourced/timed.                                            | Yes          |
| Continuity                  | Refresh/re-login, repeated request, two clinicians same BMR, no duplicate records.                                                                                  | Yes          |
| UI smoke                    | Login/session state, search, chart render, forms, conflict/error states, accessibility basics.                                                                      | Yes          |
| Full GalviVault regression  | All Day 1-Day 7 BLOCK tests, migrations, lifecycle, idempotency, adapters, release invariants.                                                                      | Yes          |
| Public GalviCare regression | Known-good founder journey entry and critical paths unaffected.                                                                                                     | Yes          |

## 15.1 Mandatory anti-skip checks

- No test.only, describe.only, skip, todo, quarantine, or conditional pass for any Day 8 BLOCK test.

- The test orchestrator must propagate non-zero exit status. A child test failure cannot be swallowed by a wrapper script.

- UI tests must not mock away authorization for the integrated QA gate. Unit mocks are fine only when an integrated protected-route test also exists.

- Do not change expected values solely to fit current broken behavior.

- If a new migration is added, run clean apply, second apply, prior Day 7 schema → candidate upgrade, constraint checks, and prior Worker compatibility/rollback assessment.

# 16. Phase 11 — QA Deployment & Human E2E

Deploy Day 8 only to the isolated QA clinician surface and QA Worker/D1 configuration first. Production must not become the first place where login, search, chart, or GalviClinic write forms are exercised.

**1.** Confirm qa-revamped-galvicare-0-5 is the branch being built/deployed and record candidate SHA.

**2.** Deploy the QA Worker through the existing approved mechanism. Verify /health, /ready, schema-version, environment, QA DB binding, CORS, and fixture policy.

**3.** Deploy the clinician portal QA surface. Verify it points only to the QA Worker/API origin and cannot call Production.

**4.** Configure/verify the QA operator identity path and approved test operator accounts. No Production clinician data is required for QA.

**5.** Run automated integrated Day 8 gate against the actual QA deployment and QA D1.

**6.** Run the Human E2E in Appendix E with one Business Physician operator and one GalviClinician operator where available.

**7.** Capture correlation IDs, canonical IDs, screenshots, HTTP results, D1 assertions, and any defect in the Day 8 evidence package.

**8.** Re-run the public GalviCare QA/Production-safe regression after the clinician deployment to prove isolation.

**9.** Only after all blocking gates pass may the Product Owner approve controlled promotion to Production using the established Day 7 release discipline.

## 16.1 Human E2E minimum journey

| **Step** | **Human action**                                                   | **Pass evidence**                                                                    |
|----------|--------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1        | Open clinician portal without active identity.                     | Secure sign-in/Access gate; no founder data.                                         |
| 2        | Authenticate as Business Physician.                                | Workspace loads operator name/role/environment from /me.                             |
| 3        | Search known QA founder/venture.                                   | One correct canonical result; bmr_id stable.                                         |
| 4        | Open Founder chart.                                                | Summary/current reasoning/care/timeline load; source/version visible.                |
| 5        | Refresh and reopen chart.                                          | Same canonical IDs and state.                                                        |
| 6        | Capture a short GalviClinic note.                                  | Evidence/source record created with operator/time/correlation; timeline updates.     |
| 7        | Confirm or reject one eligible finding.                            | Governance route succeeds; version/audit/event visible.                              |
| 8        | Create or revise recommendation/treatment plan as fixture permits. | Lineage/preconditions enforced; plan version/items atomic.                           |
| 9        | Append treatment event and/or record outcome/follow-up.            | Append-only/sourced record appears in care/timeline.                                 |
| 10       | Logout.                                                            | Protected state cleared; direct chart refresh denied.                                |
| 11       | Re-login as GalviClinician and open same founder.                  | Same BMR/current canonical state visible; role policy enforced.                      |
| 12       | Attempt unauthorized/admin-only action.                            | 403 safe; no mutation.                                                               |
| 13       | Run D1 assertions.                                                 | One BMR; no duplicates/orphans/partial state; expected events/audit/version history. |
| 14       | Run public GalviCare regression.                                   | Existing founder experience remains known-good.                                      |

# 17. Phase 12 — Canonical D1 Proof, Evidence Package & Day 8 Decision

The clinician UI can only be declared complete when the screen behavior and the canonical D1 state agree. Use read-only D1 assertions against the QA test fixture; never repair the fixture through ad hoc SQL to make the evidence look clean.

| **Proof area**       | **Required assertion**                                                                                      |
|----------------------|-------------------------------------------------------------------------------------------------------------|
| Identity             | Exactly one founder, venture, and BMR for the fixture; operator mapping active and unique as designed.      |
| Session continuity   | All relevant assessment/GalviClinic session references attach to the same BMR.                              |
| Note/evidence        | Clinical note/source evidence has correct BMR, actor/source/time/version/status and no in-place overwrite.  |
| Finding governance   | Confirmed/rejected finding retains prior version/support and emits expected governance/audit/event records. |
| Recommendation       | At least one finding link for created recommendation; no orphan recommendation.                             |
| Treatment plan       | Plan version and all items committed atomically; prior version retained after revision.                     |
| Treatment events     | Append-only; no update/delete behavior.                                                                     |
| Outcomes             | Source and observed_at present; relationship to plan/recommendation/BMR valid.                              |
| Timeline             | New Day 8 actions appear as typed chronological entries with canonical IDs/timestamps.                      |
| Idempotency          | Identical replay no duplicate rows/events/audit; changed fingerprint conflicts without mutation.            |
| Security             | Unauthorized attempts created no canonical rows or state changes.                                           |
| GalviCare regression | No Day 8 change altered public GalviCare canonical journey behavior.                                        |

## 17.1 Day 8 evidence package

| **Evidence ID** | **Artifact**                                                                             |
|-----------------|------------------------------------------------------------------------------------------|
| D8-EV-01        | Baseline fingerprint: Day 7 release SHA, QA start SHA, main, branch sync evidence.       |
| D8-EV-02        | Day 8 diff inventory and “unrelated GalviCare files unchanged” proof.                    |
| D8-EV-03        | Auth mechanism/identity mapping configuration attestation; no secret values.             |
| D8-EV-04        | Optional migration transcript/checksums and schema ledger, if Day 8 schema changed.      |
| D8-EV-05        | Automated Day 8 test report; failed=0; mandatory skipped=0.                              |
| D8-EV-06        | Full GalviVault regression report.                                                       |
| D8-EV-07        | Public GalviCare regression report.                                                      |
| D8-EV-08        | QA Worker + clinician portal deployment IDs/URLs/config identity.                        |
| D8-EV-09        | Human E2E screenshots/transcript/correlation IDs.                                        |
| D8-EV-10        | D1 assertion sheet for the Human E2E fixture.                                            |
| D8-EV-11        | Security negative results: unauthenticated/disabled/spoof/cross-role/CORS/cache/session. |
| D8-EV-12        | Rollback/deactivation proof and prior Day 7 deployment reference.                        |
| D8-EV-13        | Known defects / accepted residual low-severity items.                                    |
| D8-EV-14        | Final Day 8 GO/STOP decision signed by Product Owner/release authority.                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ONLY VALID FINAL DAY 8 PASS STATEMENT</strong></p>
If and only if every blocking gate passes on the exact Day 8 QA candidate and Human E2E/D1 proof are complete, the implementation report may end with: DAY 8 HUMAN E2E PASS → CLINICIAN GALVIVAULT WORKSPACE READY FOR GALVICARE | GALVIVAULT INTEGRATION E2E.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix A — Day 8 Automated Test Catalog

| **Test ID** | **Category** | **Scenario / expected behavior**                                           | **Level** |
|-------------|--------------|----------------------------------------------------------------------------|-----------|
| D8-REP-001  | Repo         | Branch is qa-revamped-galvicare-0-5; no work/new branch.                   | BLOCK     |
| D8-REP-002  | Repo         | No unrelated GalviCare workflow/source rewrite.                            | BLOCK     |
| D8-REP-003  | Repo         | No direct D1/browser SQL or client secret patterns.                        | BLOCK     |
| D8-REP-004  | Repo         | Applied Day 1-Day 7 migrations unchanged.                                  | BLOCK     |
| D8-AUTH-001 | Auth         | No identity cannot retrieve operator/me or founder search.                 | BLOCK     |
| D8-AUTH-002 | Auth         | Invalid/expired identity returns 401.                                      | BLOCK     |
| D8-AUTH-003 | Auth         | Unmapped/disabled operator returns 403.                                    | BLOCK     |
| D8-AUTH-004 | Auth         | Spoofed identity header does not authenticate.                             | BLOCK     |
| D8-AUTH-005 | Auth         | Role-restricted action denied with no mutation.                            | BLOCK     |
| D8-AUTH-006 | Auth         | Logout/expiry prevents cached chart retrieval.                             | BLOCK     |
| D8-SRCH-001 | Search       | Exact founder email/name/venture returns correct bounded result.           | BLOCK     |
| D8-SRCH-002 | Search       | No/short query follows policy; no full-table dump.                         | BLOCK     |
| D8-SRCH-003 | Search       | Pagination stable; limit enforced.                                         | BLOCK     |
| D8-SRCH-004 | Search       | Search result excludes full evidence/audit/note bodies.                    | BLOCK     |
| D8-READ-001 | Chart        | BMR summary returns stable founder/venture/BMR IDs/version/lifecycle.      | BLOCK     |
| D8-READ-002 | Chart        | Current reasoning classes remain separated.                                | BLOCK     |
| D8-READ-003 | Chart        | Current care/history remains separated/versioned.                          | BLOCK     |
| D8-READ-004 | Chart        | Timeline is typed, bounded, chronological.                                 | BLOCK     |
| D8-READ-005 | Chart        | Refresh returns same BMR and current version.                              | BLOCK     |
| D8-NOTE-001 | Clinic note  | Authorized note/source evidence persists with actor/time/source.           | BLOCK     |
| D8-NOTE-002 | Clinic note  | Duplicate identical replay does not duplicate note/event/audit.            | BLOCK     |
| D8-NOTE-003 | Clinic note  | Changed-payload idempotency reuse returns 409/no mutation.                 | BLOCK     |
| D8-NOTE-004 | Clinic note  | Accepted note correction creates version/supersession, not overwrite.      | BLOCK     |
| D8-GOV-001  | Governance   | Confirm finding preserves support/version and audits actor.                | BLOCK     |
| D8-GOV-002  | Governance   | Reject finding preserves prior evidence/reasoning.                         | BLOCK     |
| D8-GOV-003  | Governance   | Stale expected_version returns 409/no mutation.                            | BLOCK     |
| D8-CARE-001 | Care         | Recommendation without finding rejected.                                   | BLOCK     |
| D8-CARE-002 | Care         | Valid recommendation linked and versioned.                                 | BLOCK     |
| D8-CARE-003 | Care         | Treatment plan unauthorized rejected.                                      | BLOCK     |
| D8-CARE-004 | Care         | Valid plan + items atomic.                                                 | BLOCK     |
| D8-CARE-005 | Care         | Plan revision preserves prior plan/items/events.                           | BLOCK     |
| D8-CARE-006 | Care         | Treatment event append-only.                                               | BLOCK     |
| D8-CARE-007 | Care         | Outcome missing source/time rejected.                                      | BLOCK     |
| D8-CARE-008 | Care         | Valid outcome linked/sourced/timed.                                        | BLOCK     |
| D8-CONT-001 | Continuity   | Two approved clinicians see same canonical BMR.                            | BLOCK     |
| D8-CONT-002 | Continuity   | New session for same venture does not create second BMR.                   | BLOCK     |
| D8-CONT-003 | Continuity   | Logout/re-login recovers current chart from Worker/D1.                     | BLOCK     |
| D8-SEC-001  | Security     | Denied origin CORS fails safely.                                           | BLOCK     |
| D8-SEC-002  | Security     | Protected responses do not leak raw SQL/stack/token/evidence body in logs. | BLOCK     |
| D8-SEC-003  | Security     | Payload limits enforced for notes/forms.                                   | BLOCK     |
| D8-SEC-004  | Security     | Protected response cache policy safe.                                      | BLOCK     |
| D8-REG-001  | Regression   | Full GalviVault Day 1-Day 7 suite passes.                                  | BLOCK     |
| D8-REG-002  | Regression   | Known-good public GalviCare critical flow passes.                          | BLOCK     |
| D8-REG-003  | Regression   | QA/Production isolation remains intact.                                    | BLOCK     |

# Appendix B — Day 8 API / Projection Contract

## B.1 Operator identity endpoint (recommended if no equivalent exists)

GET /api/v1/operator/me
200 {
"ok": true,
"data": {
"operator_id": "opr\_...",
"display_name": "...",
"role": "business_physician\|clinician",
"environment": "qa",
"auth_expires_at": "..."
},
"meta": {"correlation_id": "corr\_..."}
}

## B.2 Founder search endpoint (recommended if missing)

GET /api/v1/operator/founders?query=\<bounded\>&limit=20&cursor=\<opaque\>
200 data.items\[\] = {
founder_id, founder_display_name, founder_email,
venture_id, venture_name,
bmr_id, bmr_status, bmr_record_version,
latest_activity_at
}
Rules: authenticated operator only; bounded result; safe fields; stable pagination; no full evidence/care payload.

## B.3 Optional optimized chart projection

GET /api/v1/operator/business-medical-records/{bmr_id}/chart
200 data = {
header: {...canonical BMR/founder/venture refs...},
current_session: {...},
current_reasoning: {observations:\[\], hypotheses:\[\], findings:\[\]},
current_care: {recommendations:\[\], treatment_plans:\[\], outcomes:\[\], feedback:\[\]},
recent_timeline: {items:\[\], next_cursor:"..."},
source_versions: {...}
}
This is a read-only composition. It MUST use existing repositories/services and MUST NOT persist a chart blob.

## B.4 Existing write routes Day 8 should reuse

| **Action**                    | **Existing P0 route family / rule**                                              |
|-------------------------------|----------------------------------------------------------------------------------|
| Clinical note/source evidence | POST /api/v1/evidence; existing accept/supersede flow.                           |
| Confirm/reject finding        | POST /api/v1/governance/confirmations or existing equivalent.                    |
| Recommendation                | POST /api/v1/recommendations; supersede route for material revision.             |
| Treatment plan                | POST /api/v1/treatment-plans; revision and events routes.                        |
| Outcome                       | POST /api/v1/outcomes.                                                           |
| Feedback                      | POST /api/v1/feedback.                                                           |
| BMR lifecycle                 | POST /api/v1/business-medical-records/{bmr_id}/transitions; never infer from UI. |

# Appendix C — Optional Minimal Operator Identity Migration

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>USE ONLY IF REPOSITORY REALITY REQUIRES IT</strong></p>
Do not add this schema if the existing P0 implementation already has a durable individual operator/role mapping that satisfies Day 8. If added, it is an additive post-P0 schema change and must receive the full migration/test/evidence treatment.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

-- Example Day 8 additive migration; adapt to existing naming conventions.
CREATE TABLE IF NOT EXISTS operator_accounts (
operator_id TEXT PRIMARY KEY,
auth_subject TEXT UNIQUE,
email_normalized TEXT NOT NULL UNIQUE,
display_name TEXT NOT NULL,
role TEXT NOT NULL CHECK (role IN ('business_physician','clinician')),
status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','pending')),
created_at TEXT NOT NULL,
updated_at TEXT NOT NULL,
archived_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_operator_accounts_status_role
ON operator_accounts(status, role);

-- Do NOT store plaintext passwords, shared API secrets, or Access JWTs in this table.
-- If an existing auth mechanism supplies a stable subject, map it to auth_subject.

## C.1 Operator provisioning

- Provision approved operators through a controlled server/admin procedure or migration/seed mechanism appropriate to the current repository. Do not expose a public signup endpoint on Day 8.

- Never commit real passwords, one-time codes, provider secrets, or Production tokens to Git.

- Provisioning evidence may list operator_id, role, status, and redacted email; do not include authentication secret material.

- Disabling an operator must immediately fail authorization on the next server check. Cache role/status only for a bounded safe duration if at all.

# Appendix D — Clinician UI Acceptance Specification

| **Component**       | **Acceptance criteria**                                                                                                        |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| Secure entry        | No protected data pre-auth; clear GalviVault/GalviClinic identity; QA marker; fail-closed path.                                |
| Top bar             | Operator display name/role, environment, logout; no founder PII in URL title where avoidable.                                  |
| Founder search      | Debounced/submit search, bounded results, clear no-match/error, keyboard accessible.                                           |
| Chart header        | Founder/venture identity, BMR lifecycle/version, last activity; stable while navigating tabs.                                  |
| Overview            | Needs review, active care, current session/journey, recent changes. No inferred diagnosis.                                     |
| Timeline            | Typed entries, timestamps, actor/source summary, pagination, expandable provenance.                                            |
| Evidence            | Current evidence grouped by source/type; accepted/superseded status clear; protected details lazy loaded.                      |
| Findings            | Statement, confidence, confirmation state, support/source/version; explicit Confirm/Reject actions only when allowed.          |
| Care Plan           | Recommendations + active plan/items + target outcomes + treatment events + versions.                                           |
| GalviClinic Session | Pre-session context, note capture, governed finding/care forms, save confirmation.                                             |
| Outcomes            | Observed outcome/feedback/follow-up records; missing observation distinct from success.                                        |
| Errors              | 401→sign-in; 403→not authorized; 404→record not found; 409→refresh conflict; 422→field errors; 503→safe retry/support message. |
| Loading             | No stale prior-founder data displayed while new chart loads.                                                                   |
| Responsive          | Usable at common laptop/tablet widths; no clipped tables or hidden critical actions.                                           |
| Accessibility       | Keyboard, labels, focus, contrast, semantic headings, status text, field errors.                                               |

# Appendix E — Day 8 Human E2E Runbook

## E.1 Fixture preparation

- Use one known QA founder/venture/BMR fixture containing representative GalviCare evidence, at least one current finding eligible for governance, and enough care context to create/revise a treatment plan.

- Have one active Business Physician operator and one active GalviClinician operator. If only one clinician account is available, complete the full path with that operator and record the second-role coverage as automated only until a second account is provisioned; do not call the multi-clinician continuity item Human PASS.

- Record expected founder_id, venture_id, bmr_id, starting record_version, current finding IDs, and starting row counts through read-only queries before the run.

- Use a unique run_id and idempotency-key prefix for the E2E.

## E.2 Human actions and evidence capture

| **ID** | **Phase**            | **Action**                                                                                                 | **Pass proof**                                         |
|--------|----------------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| E2E-01 | Pre-auth             | Open portal in fresh/private session.                                                                      | Sign-in gate; no PII/chart.                            |
| E2E-02 | Login                | Authenticate Business Physician.                                                                           | /me identity/role; screenshot.                         |
| E2E-03 | Search               | Search exact founder email/name.                                                                           | Correct single/limited result; IDs captured.           |
| E2E-04 | Open chart           | Open result.                                                                                               | BMR header/version + overview + timeline.              |
| E2E-05 | Read reasoning       | Open Findings.                                                                                             | Support/source/confidence/confirmation visible.        |
| E2E-06 | Read care            | Open Care Plan.                                                                                            | Current recommendations/plan/outcomes separate.        |
| E2E-07 | Refresh              | Browser refresh.                                                                                           | Same BMR/current state.                                |
| E2E-08 | Note                 | Save bounded GalviClinic note.                                                                             | Success + evidence ID/correlation; timeline update.    |
| E2E-09 | Governance           | Confirm or reject eligible finding.                                                                        | New governed status/version + audit/event.             |
| E2E-10 | Recommendation       | Create/revise recommendation if fixture requires.                                                          | Finding link + version.                                |
| E2E-11 | Treatment            | Create/revise plan and items.                                                                              | Atomic plan; lifecycle preconditions respected.        |
| E2E-12 | Treatment event      | Record session/intervention event.                                                                         | Append-only event.                                     |
| E2E-13 | Outcome/follow-up    | Record outcome or explicit follow-up event.                                                                | Source/time/relationship preserved.                    |
| E2E-14 | Conflict negative    | Attempt stale expected_version or reuse idempotency key with changed payload using controlled test helper. | 409; no mutation.                                      |
| E2E-15 | Logout               | Log out and refresh direct chart URL.                                                                      | Access denied / sign-in.                               |
| E2E-16 | Second clinician     | Login approved GalviClinician; search same founder.                                                        | Same bmr_id and current canonical state.               |
| E2E-17 | Role negative        | Attempt Business Physician-only operation if configured.                                                   | 403/no mutation.                                       |
| E2E-18 | D1 proof             | Run Appendix F assertions.                                                                                 | Expected versions/events/audit; no duplicates/orphans. |
| E2E-19 | GalviCare regression | Run public journey smoke.                                                                                  | No Day 8 regression.                                   |

## E.3 Human E2E STOP conditions

- Any protected chart is visible before validated authentication.

- Wrong founder/BMR appears, search leaks unrelated sensitive data, or bmr_id can be tampered to expose a record outside the intended operator scope.

- A clinical write succeeds in UI but is absent in D1, or a D1 row appears without the UI/Worker success evidence.

- Duplicate rows/events/audit appear after replay, or version history is erased.

- Finding/treatment governance is bypassed, accepted evidence is overwritten, or missing outcome is represented as success.

- Logout does not clear protected access, or browser back reveals recoverable protected chart content.

- Any public GalviCare critical flow regresses because of Day 8.

# Appendix F — Day 8 D1 Assertion Catalog

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>SQL USE RULE</strong></p>
Queries below are read-only templates. Adapt table/column names to the exact implemented schema. Do not use ad hoc UPDATE/DELETE to “fix” a failing Human E2E. A failing assertion is a defect requiring a code/migration/reconciliation path.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

-- F-01 One BMR per venture
SELECT venture_id, COUNT(\*) AS bmr_count
FROM business_medical_records
WHERE venture_id = ? AND archived_at IS NULL
GROUP BY venture_id;
-- expect 1

-- F-02 Session continuity
SELECT session_id, bmr_id, status, created_at
FROM assessment_sessions
WHERE bmr_id = ?
ORDER BY created_at;

-- F-03 Day 8 note/evidence versions
SELECT evidence_id, evidence_group_id, version_no, status, source_type, source_ref, captured_at, created_at
FROM evidence_items
WHERE bmr_id = ? AND source_ref LIKE 'galviclinic.%'
ORDER BY evidence_group_id, version_no;

-- F-04 Current finding + history/support (adapt exact table names)
SELECT \* FROM findings WHERE bmr_id = ? ORDER BY finding_group_id, version_no;

-- F-05 Care chain
SELECT \* FROM recommendations WHERE bmr_id = ? ORDER BY created_at;
SELECT \* FROM treatment_plans WHERE bmr_id = ? ORDER BY created_at;
SELECT \* FROM treatment_events WHERE bmr_id = ? ORDER BY occurred_at;
SELECT \* FROM outcomes WHERE bmr_id = ? ORDER BY observed_at;

-- F-06 Events/audit for Human E2E correlation
SELECT \* FROM domain_events WHERE correlation_id = ? ORDER BY created_at;
SELECT \* FROM audit_log WHERE correlation_id = ? ORDER BY created_at;

-- F-07 duplicate/orphan checks must reuse the authoritative P0 integrity queries
-- Expect zero duplicate BMRs, orphan evidence/support/care rows, or partial transactions.

## F.1 Required assertion result sheet

| **ID**   | **Assertion**                | **Expected**                                                     |
|----------|------------------------------|------------------------------------------------------------------|
| D8-DB-01 | Founder/venture/BMR identity | One canonical record each; stable IDs.                           |
| D8-DB-02 | Operator identity mapping    | Exactly one active mapping per tested subject/email as designed. |
| D8-DB-03 | Clinical note/evidence       | Correct BMR/source/actor/time/version; no overwrite.             |
| D8-DB-04 | Finding governance           | Version/history/support/audit preserved.                         |
| D8-DB-05 | Recommendation lineage       | At least one valid finding link; no orphan.                      |
| D8-DB-06 | Treatment plan               | Plan/items atomic; revision history retained.                    |
| D8-DB-07 | Treatment events             | Append-only expected count.                                      |
| D8-DB-08 | Outcome                      | Source/time/relationship present.                                |
| D8-DB-09 | Idempotency                  | One canonical result for identical replay; mismatch no mutation. |
| D8-DB-10 | Timeline/audit               | Expected typed events and audit rows for each material action.   |
| D8-DB-11 | Unauthorized attempts        | Zero canonical state change.                                     |
| D8-DB-12 | Orphans/duplicates           | Zero.                                                            |

# Appendix G — Rollback / Feature Deactivation Runbook

Day 8 introduces a new client surface and may add read/protected identity capability. Rollback must preserve the Day 7 canonical platform and all Day 8 canonical clinical actions already committed.

| **Trigger**                                | **Immediate action**                                                                                | **Data rule**                                                             |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| Unauthorized chart/read/write              | Disable clinician route/access policy and rollback Worker/UI candidate; treat as security incident. | Preserve D1 and audit for investigation; no destructive cleanup.          |
| Wrong QA/Production binding                | Stop portal/API; rollback routing/deployment immediately.                                           | Preserve state; investigate any writes.                                   |
| Cross-founder leakage                      | Disable portal; rollback; security/privacy review.                                                  | Do not delete evidence of access event.                                   |
| Clinical write violates lineage/versioning | Stop write UI; rollback Worker candidate.                                                           | Preserve canonical state; reconcile via approved correction/version path. |
| Portal UI defect only                      | Rollback/deactivate clinician UI asset deployment; keep Day 7 Worker if unchanged.                  | No D1 changes required.                                                   |
| Operator search performance issue          | Disable search or reduce feature safely; rollback read route if needed.                             | Canonical data unchanged.                                                 |
| Public GalviCare regression                | Revert Day 8 change causing regression; restore prior Day 7 baseline.                               | Do not modify canonical data solely to fix UI regression.                 |
| Migration defect                           | Stop deployment; use forward-fix/compensation plan.                                                 | No destructive down migration.                                            |

## G.1 Rollback order

**1.** Declare incident/STOP and block further clinician writes if authorization or canonical integrity is at risk.

**2.** Disable clinician portal route or access policy when necessary to stop exposure.

**3.** Restore prior Day 7 Worker/configuration or the most recent known-good Day 8 candidate according to deployment history.

**4.** Do not roll back D1 by destructive down migration. Validate prior Worker compatibility with additive schema.

**5.** Run health/readiness/schema, protected-route negatives, and public GalviCare regression.

**6.** Run read-only D1 integrity checks for any Day 8 records already created.

**7.** Record incident, affected correlation IDs, root cause, recovery proof, and next QA candidate plan.

# Appendix H — Codex Final Day 8 Implementation Report Template

GALVIVAULT DAY 8 IMPLEMENTATION REPORT

1. Baseline / branch
- Repository: mrgalvipro/galvitriage
- Day 7 Production release SHA/deployment/schema:
- QA branch: qa-revamped-galvicare-0-5
- Day 8 start SHA:
- Day 8 candidate SHA:
- Production branch: main
- work/new branch used? NO required

2. Scope / diff
- Added/changed files:
- Why each changed:
- Applied migrations changed? NO required
- Unrelated GalviCare files/workflows changed? NO required

3. Authentication / authorization
- Selected auth mechanism:
- Worker verification method:
- Operator role mapping:
- QA operators:
- Missing/invalid/expired/disabled/spoof tests:

4. Clinician portal
- QA URL/deployment:
- Login/session/logout:
- Founder search:
- Founder chart sections:
- Accessibility/error/session hardening:

5. Worker/API
- Existing routes reused:
- New read-only operator routes:
- New write routes? NONE expected unless source-equivalent missing and approved
- CORS/cache/payload bounds:

6. GalviClinic workflow
- Clinical note/source capture:
- Finding confirm/reject:
- Recommendation:
- Treatment plan/revision/event:
- Outcome/feedback/follow-up:
- Continuity after refresh/re-login:

7. Automated QA
- Day 8 tests failed/skipped:
- Full GalviVault regression:
- Public GalviCare regression:

8. QA deployment / Human E2E
- Worker deployment ID:
- UI deployment ID:
- Run ID / operators:
- Founder/Venture/BMR IDs:
- Human E2E result:
- Manual repair used? NO required

9. D1 proof
- One BMR per venture:
- Note/evidence lineage:
- Governance/version history:
- Treatment/outcome chain:
- Events/audit:
- Duplicates/orphans/partial state:

10. Rollback / deactivation
- Prior Day 7 target:
- Day 8 rollback path proven:
- Any rollback invoked?:

11. Evidence
- D8-EV-01..D8-EV-14:
- Evidence path / checksums:
- Known defects / residual risk:

12. DAY 8 GATE
- D8-01 Secure clinician identity: PASS/FAIL
- D8-02 Founder search + chart projection: PASS/FAIL
- D8-03 Governed GalviClinic care workflow: PASS/FAIL
- D8-04 Continuity + D1 integrity: PASS/FAIL
- D8-05 GalviVault + GalviCare regression: PASS/FAIL
- D8-06 Human E2E + evidence: PASS/FAIL
- Decision: GO \| STOP \| ROLLBACK

If and only if every blocking item passes, end exactly with:
DAY 8 HUMAN E2E PASS -\> CLINICIAN GALVIVAULT WORKSPACE READY FOR GALVICARE \| GALVIVAULT INTEGRATION E2E

# Appendix I — Day 8 Codex Completion Checklist — One-Page Gate

- [ ] Entry: Day 7 HUMAN E2E PASS → GALVIVAULT P0 BUILD FINAL evidenced; no inherited blocker/critical/high defect.

- [ ] Branch: qa-revamped-galvicare-0-5 synchronized to Day 7 final baseline; Production main; no work/new branch.

- [ ] Diff: every Day 8 changed file is critical-path; unrelated GalviCare workflows/source remain untouched.

- [ ] Authority: browser → validated identity → Worker → D1 only; no direct D1, client secret, or shadow chart store.

- [ ] Identity: real authenticated operator boundary; Business Physician and GalviClinician active mappings; disabled/unmapped denied.

- [ ] Security negatives: no/invalid/expired/spoof identity denied; role-restricted action denied; safe cache/logout behavior.

- [ ] Search: authenticated bounded founder/venture search; minimal results; stable canonical IDs; no bulk data dump.

- [ ] Chart: BMR summary/version/lifecycle, current reasoning, care, evidence, and typed timeline render from Worker projections.

- [ ] Clinical prep: current GalviCare/BMR context, findings, recommendations, plan, outcomes, follow-up are visible when canonical data exists.

- [ ] Clinical note: source evidence captured with BMR, actor, source, time, version/status; accepted evidence not overwritten.

- [ ] Governance: finding confirm/reject uses existing privileged route, expected version, event/audit, and preserved lineage.

- [ ] Care: recommendation requires finding; treatment plan authorized/atomic/versioned; treatment events append-only.

- [ ] Outcome: sourced/timed/related outcome or follow-up captured; missing observation not treated as success.

- [ ] Continuity: refresh/logout/re-login and second clinician retrieve same BMR/current state; no duplicate chart.

- [ ] Idempotency: identical replay duplicate-safe; changed-payload key reuse conflicts with no mutation.

- [ ] Automated QA: Day 8 BLOCK tests failed=0; mandatory skipped=0.

- [ ] GalviVault regression: full Day 1-Day 7 applicable suite passes.

- [ ] GalviCare regression: known-good public critical flow passes; no workflow/telemetry/payment regression.

- [ ] QA deployment: isolated clinician portal + QA Worker/D1 identity correct; Production not used for first-time behavior.

- [ ] Human E2E: login → search → chart → note/governance/care/outcome → logout → re-login PASS without undocumented repair.

- [ ] D1 proof: one BMR, valid lineage/versioning/care chain/events/audit; zero duplicate/orphan/partial unauthorized state.

- [ ] Rollback: clinician UI/Worker can be disabled/restored to prior Day 7 baseline without destructive DB rollback.

- [ ] Evidence: D8-EV-01 through D8-EV-14 complete, redacted, coherent, and bound to one candidate SHA.

- [ ] Final decision: Product Owner/release authority explicitly records GO/STOP/ROLLBACK.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 8 FINAL ACCEPTANCE</strong></p>
All checkboxes above must be evidenced. A green deployment, a working chart screenshot, or a Codex implementation summary does not substitute for authorization negatives, full regression, Human E2E, D1 proof, and rollback readiness.</th>
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
<th><p><strong>PASS DECLARATION</strong></p>
DAY 8 HUMAN E2E PASS → CLINICIAN GALVIVAULT WORKSPACE READY FOR GALVICARE | GALVIVAULT INTEGRATION E2E</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Source Alignment Note

Source-derived invariants in this builder include: one Worker write authority, D1 canonical persistence, one BMR per venture, record-class separation, protected operator routes, versioning/audit/lifecycle controls, Day 7 release discipline, and the post-P0 roadmap requirement for a Business Physician Workspace and GalviClinic record workflow. The specific Day 8 screen hierarchy, operator-search endpoint naming, clinician portal file layout, and optional operator_accounts mapping are implementation choices introduced by this Day 8 extension and must yield to existing equivalent repository structures.
