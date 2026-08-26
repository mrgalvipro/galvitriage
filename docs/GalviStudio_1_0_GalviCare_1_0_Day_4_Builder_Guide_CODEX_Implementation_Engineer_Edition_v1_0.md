# GALVISTUDIO 1.0 | GALVICARE 1.0 — Day 4 Builder Guide

**GalviChart 1.0 • GalviVault 1.0 Longitudinal Care • Secure Return • Progressive Record • Customer + Clinician Projections**

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

> **CURRENT BUILD STATUS — DAY 3 BUILD FINAL IS THE ONLY AUTHORIZED STARTING POINT**
>
> Day 4 begins only after the signed Day 3 HUMAN E2E PASS / DAY 3 BUILD FINAL baseline is proven in the repository and deployed QA runtime. Day 4 must consume, not recreate, the deterministic Day 1/2 contracts and the governed Day 3 evidence/AI generation/acceptance lineage. The Day 3 Build2 runtime remediation is inherited: the clarifying-question closed loop remains intact; observation/product-result persistence remains atomic/idempotent; and the unified Worker reasoning/evidence routes remain the supported path. Do not “simplify” Day 4 by removing clarification, evidence capture, or governed reasoning.

> **DAY 4 MISSION**
>
> Operationalize the canonical GalviVault record as a secure, progressively complete GalviChart experience for the customer and Business Physician. GalviShot verified entitlement activates Explorer access; Sight, Path, Clinic, treatment, monitoring, and reassessment enrich the same record. No Chart-specific shadow database, no browser-side canonical truth, no leakage of protected clinician context, and no duplicate identity on return.

> **CRITICAL-PATH RULE**
>
> Every Day 4 change must do one of five things: (1) prove secure return/record resolution, (2) enforce Shot-based Chart activation, (3) project the canonical record into permission-correct Chart sections, (4) append governed customer commands without rewriting history, or (5) close Day 4 QA/release evidence. If a change does not materially increase DAY 4 HUMAN E2E PASS probability or preserve an inherited Day 1-3 invariant, do not make it.

# How Codex Must Use This Builder

> **EXECUTION CONTRACT**
>
> This is an implementation runbook, not a design brainstorm. Prove the exact Day 3 Build Final baseline first. Inventory the real repository, Worker routes, existing auth/session behavior, entitlement service, current D1 schema/migrations, GalviVault projection/read services, Day 3 governed-intelligence contracts, frontend routes, tests, QA deployment path, and runtime versions. Reuse working contracts. Implement the smallest additive Day 4 delta. Run focused tests, full inherited Day 3 regression, exact-SHA deployed QA verification, D1 integrity assertions, Human E2E, and rollback. Stop on the first P0/P1 defect and remediate only the proven root cause.

| **Priority** | **Instruction**                     | **Practical meaning**                                                                                                                                                                         |
|--------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Exact Day 3 handoff only            | Begin only from the signed Day 3 Build Final SHA, QA Worker deployment, QA D1 binding/schema, release evidence, and rollback target.                                                          |
| P0           | Approved branch only                | Implementation stays on qa-revamped-galvicare-0-5. Never create/use work or a workaround branch. main is read-only reference.                                                                 |
| P0           | Production untouched                | No main merge, PROD Worker deploy, Production D1 mutation, LIVE payment/auth changes, or public cutover on Day 4.                                                                             |
| P0           | One canonical record                | GalviChart is a projection of GalviVault/BHR/FHR. Never create a second clinical record system or duplicate canonical evidence/findings/results.                                              |
| P0           | Server-side authorization           | Identity, entitlement, consent, role, and record-scope checks occur in the Worker. UI hiding/localStorage/URL flags are never authorization.                                                  |
| P0           | Shot activation economics           | Customer Chart access is locked before verified GalviShot entitlement/result and becomes Explorer only after server-verified activation.                                                      |
| P0           | Day 3 intelligence preserved        | Only accepted/openai_governed or clinician-approved artifacts are projectable. Raw/rejected proposals never become customer truth.                                                            |
| P0           | History is append/versioned         | Return, correction, check-in, evidence upload, and milestone actions append/version; they do not silently overwrite canonical history.                                                        |
| P0           | Clarification closed loop preserved | Score clarification and targeted GalviShot questions continue to write versioned evidence and drive governed Shot/Sight/Path reasoning. Day 4 must not remove them to avoid runtime defects.  |
| P1           | Evidence decides completion         | Local rendering is insufficient. Exact-SHA QA, permission negatives, record-history assertions, cross-device return, inherited Day 3 regression, Human E2E, and rollback determine PASS/FAIL. |

# 1. Day 4 Scope Decision, Objectives & Definition of Done

Authoritative Day 4 objective: turn the canonical record into a secure, progressively complete customer and clinician experience without creating a second record system or changing the established GalviShot activation economics.

## 1.1 Day 4 Definition of Done

- Exact Day 3 Build Final SHA/deployment/schema/binding/rollback target is captured before edits; Day 3 HUMAN E2E PASS evidence is available and inherited tests are green.

- qa-revamped-galvicare-0-5 is the only implementation branch; main remains untouched; no work/new branch is created.

- Customer secure-return path resolves the same authorized principal/BHR across refresh and supported return/cross-device scenarios; account recovery does not mint a duplicate record.

- Before GalviShot entitlement, direct Chart access returns a structured locked/not_activated state without leaking protected record content.

- After server-verified GalviShot entitlement/result, Explorer GalviChart activates against the existing canonical record ID.

- Explorer Chart shows the required baseline projection: Overview, Health, Timeline, Care Plan, Evidence, Documents, GalviClinic, and History with appropriate empty/locked states rather than blank/crashed screens.

- GalviSight, GalviPath, GalviClinic, treatment, monitoring, and reassessment enrich the same Chart/BHR by versioned events/projections; no new Chart identity is created per product.

- Customer and Business Physician use the same GalviCare visual language; role-based projections differ. Customer cannot see protected notes, internal hypotheses, audit metadata, clinician controls, or unapproved artifacts.

- Only governed accepted Day 3 intelligence is customer-projectable; deterministic Score/Acuity/Clinical Confidence/protocol remain stored facts and are never recomputed in browser code.

- Chart evidence/findings retain lineage to accepted artifacts and authorized evidence IDs/versions. Generation metadata remains traceable in canonical/admin evidence even if not shown to the customer.

- Customer commands route through the Worker and append/version canonical state: check-in, permitted correction, requested evidence upload baseline, treatment milestone, Treatment Plan acknowledgement, Clinic scheduling intent, and approved export foundation.

- Browser cannot directly mutate D1, invent entitlement, switch BHR, elevate role, reveal protected clinician fields, or convert rejected AI output into customer truth.

- Day 3 Build2 runtime fix remains green under Chart projection/replay: observation/product-result upserts remain atomic/idempotent and repeated projection reads do not re-trigger duplicate writes or runtime failures.

- Full inherited Day 3 gate plus Day 4 automated QA, deployed negatives, D1 assertions, Human E2E, and rollback pass with manual repair=NO.

- Final declaration is DAY 4 HUMAN E2E PASS / DAY 4 BUILD FINAL or FAIL / STOP / ROLLBACK.

## 1.2 Explicit in-scope / out-of-scope

| **Capability**          | **Day 4 requirement**                                                                         | **Not authorized on Day 4**                                                                       |
|-------------------------|-----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| GalviChart              | Secure customer projection, Shot activation, progressive sections, same-record history.       | Second database/MDM, standalone Chart clinical truth, broad redesign unrelated to release gates.  |
| GalviVault              | Read/projection continuity, minimal additive chart/history/document metadata only if missing. | Destructive schema rewrite, shadow BHR, duplicate evidence/findings/results.                      |
| Authentication / return | Minimum 1.0 secure return/account recovery using existing identity/session capability.        | New enterprise SSO/SAML/SCIM, broad IAM platform replacement, speculative new auth vendor.        |
| RBAC / consent          | Server-side customer/clinician projection policy and existing consent enforcement.            | Client-only role checks, privilege expansion, bypassing consent for convenience.                  |
| Entitlement             | Reuse verified GalviShot entitlement/result to activate Explorer.                             | URL/localStorage unlocks, new pricing/economic model, Production payment changes.                 |
| Day 3 AI                | Project accepted governed artifacts and preserve metadata/lineage/fallback.                   | New autonomous agent, new model workflow, rerunning AI on every Chart view, raw proposal display. |
| Two-way commands        | Append-only/versioned customer commands required by Day 4.                                    | Day 5 full treatment workflow, autonomous treatment, broad referral/Lab build.                    |
| Documents               | Secure metadata/authorized projection and safe ingestion baseline.                            | Enterprise document management, broad file processing platform.                                   |
| Commercial adapters     | Regression only; non-blocking.                                                                | Unrelated Stripe/Calendly/HubSpot/GA4/Clarity redesign.                                           |
| Production              | None.                                                                                         | main merge, PROD deploy/migration, LIVE auth/payment/public cutover.                              |

# 2. Recurring GalviCare/GalviVault Defects — Day 4 Mandatory Prevention Controls

The controls below convert recurring branch, deployment, D1, runtime, identity, entitlement, and Day 3 reasoning defects into explicit Day 4 release gates. They are not optional engineering preferences.

| **Defect pattern**                 | **Observed risk**                                                                    | **Day 4 control**                                                                                                               | **Required proof**                                                                            |
|------------------------------------|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Branch drift / work checkout       | Chart code lands on non-authoritative work branch.                                   | STOP on work/main; sync only qa-revamped-galvicare-0-5; no new branch.                                                          | Remote + tracking branch + HEAD SHA before edit/deploy.                                       |
| Repo/remote ambiguity              | Tests/deploy run against reconstructed or wrong repo.                                | Capture repository root and git remote -v; never rebuild a “similar” repo.                                                      | Repo/root/SHA manifest.                                                                       |
| Deployment drift                   | Local Chart passes while active Worker/frontend serves older code.                   | Deploy exact candidate SHA through approved QA path; verify runtime SHA/capabilities and direct Chart probes.                   | SHA \<-\> deployment ID \<-\> runtime behavior chain.                                         |
| Wrangler 403 / binding mismatch    | Cloudflare auth/config problem misread as application defect; new Worker/DB created. | Compare to known-good auth/config/binding; fix credentials/config only. Never create bypass DB/Worker.                          | Same QA Worker/D1 binding + smoke PASS.                                                       |
| Hosted runner queue/outage         | CI delay triggers needless workflow/application changes.                             | Separate platform state from code state; retry approved path; no speculative rewrite.                                           | Run-state evidence + unchanged app diff.                                                      |
| Shadow Chart record                | Developer creates chart row that duplicates canonical clinical truth.                | Chart is a projection/read model over principal/BHR; projection metadata may reference canonical IDs only.                      | No duplicated score/evidence/finding payloads as competing truth.                             |
| Client entitlement as truth        | URL/localStorage says Chart unlocked.                                                | Worker verifies existing GalviShot entitlement/result every activation decision.                                                | Tamper negative stays locked.                                                                 |
| Protected projection leak          | Customer response contains clinician notes/hypotheses/audit controls.                | Build role-specific server projection allowlists; deny by default.                                                              | Customer-vs-clinician response diff + unauthorized negative.                                  |
| Cross-record contamination         | BHR ID supplied by client leaks another record.                                      | Resolve record scope from authenticated canonical context; validate any requested IDs against assignment/ownership.             | Cross-record request 403/404-safe + audit; no leaked existence/content.                       |
| Duplicate identity on return       | Refresh/recovery/cross-device mints new principal/BHR.                               | Resolve existing canonical identity before create; use idempotency/unique keys.                                                 | Same principal/BHR across supported return.                                                   |
| History overwrite                  | Correction or check-in mutates previous evidence/result in place.                    | Append correction/check-in/version event; preserve prior version and provenance.                                                | Before/after history remains traceable.                                                       |
| Blank/HTML runtime error           | Projection exception yields unusable page.                                           | Structured JSON error + visible recovery; preserve session/BHR reference.                                                       | Deployed negative returns JSON and recovery path.                                             |
| Stale cache / stale projection     | Chart shows old data after Sight/Path/Clinic.                                        | Version/fingerprint projection by canonical event/version; refresh invalidates only projection cache, not truth.                | Progressive update shows new version without new Chart identity.                              |
| Day 3 raw proposal leak            | Rejected/openai_proposal appears in customer Chart.                                  | Project accepted/openai_governed or clinician-approved only.                                                                    | Rejected sample remains hidden; canonical accepted artifact shown.                            |
| Day 3 clarification regression     | Chart work bypasses clarifying questions/evidence to avoid runtime complexity.       | Rerun closed loop exactly; Chart reads its results, never replaces evidence-gathering stages.                                   | Clarification + answer + versioned evidence + targeted Shot questions + governed output PASS. |
| Day7D duplicate/runtime regression | Repeated evidence/result write reintroduces conflict/runtime defect.                 | Preserve atomic ON CONFLICT DO UPDATE/idempotent observation/product-result persistence; projection reads are side-effect free. | Replay/refresh produces one current version, no 500/blank screen.                             |
| Manual QA repair                   | Ad hoc SQL/delete makes E2E pass.                                                    | Use migration/domain service/corrective versioning; manual repair prohibited for PASS run.                                      | Evidence sheet manual repair=NO.                                                              |
| Speculative multi-layer rewrite    | UI + Worker + DB + workflows changed before failing layer is known.                  | Name exact failing assertion/request/route/SQL/runtime first; smallest diff; focused retest then regression.                    | Defect log proves failure -\> root cause -\> minimal diff -\> PASS.                           |

> **REMEDIATION RULE**
>
> When a Day 4 test fails, Codex must name the exact failing assertion, route, entitlement check, projection field, BHR/principal resolution, authorization decision, SQL statement, deployment, browser/runtime layer, or event version before editing. Fix the smallest proven root cause. Rerun the failed test first, then its regression slice, then the complete Day 4 gate. Do not simultaneously change UI + Worker + database + workflow unless evidence independently proves each layer is broken.

# 3. Day 4 Entry Gate & Exact Baseline Fingerprint

> **STOP UNLESS ALL ARE TRUE**
>
> Day 4 must not build GalviChart on top of an unproven Day 3 state. If the signed Day 3 Build Final baseline cannot be proven, restore/synchronize it first. Chart implementation must never conceal a deterministic, governed-AI, evidence, identity, entitlement, routing, D1, or deployment defect.

| **Check**    | **Required starting state**                                                                                           | **Codex evidence**                                     |
|--------------|-----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| Repository   | Authoritative mrgalvipro/galvitriage repository used by QA.                                                           | git remote -v + repository root.                       |
| QA branch    | qa-revamped-galvicare-0-5 at exact signed Day 3 Build Final SHA.                                                      | branch + origin tracking + HEAD SHA.                   |
| Production   | main is read-only reference.                                                                                          | origin/main HEAD; no implementation checkout/deploy.   |
| Working tree | Clean or explicitly explained pre-existing changes.                                                                   | git status --short.                                    |
| QA runtime   | Existing QA Worker/frontend serving Day 3 Build Final.                                                                | health/capabilities + deployed SHA/ID where available. |
| D1 binding   | Existing QA GalviVault D1 binding/schema; no new DB.                                                                  | wrangler config/binding + schema/migration manifest.   |
| Day 3 AI     | ai_enabled=true in QA; accepted/rejected/fallback behavior proven.                                                    | Day 3 release evidence + direct probe.                 |
| Closed loop  | Score clarification -\> answer -\> versioned evidence -\> targeted Shot questions -\> governed Shot/Sight/Path works. | Human E2E evidence from Day 3 Build2/final.            |
| Rollback     | Known-good Day 3 deployment and prior Day 2 fallback recorded.                                                        | rollback target IDs/SHAs + procedure.                  |

## 3.1 First Codex actions — no implementation yet

```bash
set -euo pipefail

# 1) Prove repository and remote

pwd

git rev-parse --show-toplevel

git remote -v

# 2) Prove branch; STOP if current branch is work or main

git status --short --branch

git branch -vv

git rev-parse HEAD

git rev-parse origin/qa-revamped-galvicare-0-5

git rev-parse origin/main

# 3) Synchronize only the approved QA branch using the repository's proven procedure

# Do not create a new branch. Do not force-reset unexplained local work.

# 4) Inventory before editing

find . -maxdepth 3 -type f | sort | sed -n '1,260p'

# Inspect package scripts, Worker entrypoint/routes, frontend Chart/record files,

# D1 migrations/schema, auth/session helpers, entitlement helpers, Day 3 reasoning/evidence modules, and tests.

# 5) Capture the exact signed Day 3 Build Final fingerprint

# SHA, QA deployment ID/runtime marker, D1 binding/schema version, rules/protocol/prompt/schema versions, rollback target.
```

## 3.2 Required baseline fingerprint artifact

| **Field**        | **Required value/evidence**                                                                                    |
|------------------|----------------------------------------------------------------------------------------------------------------|
| repository       | Owner/repo + root path + remote URL.                                                                           |
| branch           | qa-revamped-galvicare-0-5 + upstream tracking.                                                                 |
| day3_final_sha   | Exact signed Day 3 Build Final commit. Do not assume an interim candidate from chat/report prose.              |
| qa_worker        | Existing Worker name/deployment ID/route.                                                                      |
| frontend_runtime | Current QA page/deployment source and version marker if available.                                             |
| d1_binding       | Exact QA binding name and database ID/name.                                                                    |
| schema           | Applied migration set/checksums; confirm whether 0004_chart_treatment_monitoring or equivalents already exist. |
| day3_versions    | Rules/protocol/prompt/schema/provider/model metadata used by accepted artifacts.                               |
| capabilities     | Inherited Day 1-3 flags and health response.                                                                   |
| rollback         | Known-good Day 3 deployment + previous fallback target.                                                        |
| manual_repair    | Must be NO for the baseline used to start Day 4.                                                               |

# 4. Day 4 Target Architecture & Authority Boundary

```text
Customer / Founder / Athlete / Owner

|

GalviCare web experience / secure return

|

Cloudflare Worker — authentication + authorization + entitlement + projection orchestration

|----------------------------|----------------------------|

GalviVault D1 GalviEngine Day 3 Non-blocking adapters

canonical principal/BHR governed accepted artifacts Stripe/Calendly/HubSpot/GA4/Clarity

evidence/events/history deterministic Score/Acuity existing integrations only

| |

+-------- canonical + governed intelligence ---------+

|

GalviChart projection service

/ \

Customer projection Clinician projection

allowlisted fields additional authorized context

\ /

Worker-governed commands

append check-in/evidence/correction/milestone/etc.

|

GalviVault history
```

| **Layer**           | **Authoritative responsibility**                                                                                        | **Day 4 failure behavior**                                                        |
|---------------------|-------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| Browser/UI          | Render authorized projection; submit commands with session context.                                                     | Visible recovery; preserve record/session reference; never invent truth.          |
| Worker              | Authenticate, authorize, verify Shot entitlement, resolve canonical record, build projection, validate commands, audit. | Structured JSON error; deny safely; no blank/HTML response.                       |
| GalviVault D1       | Canonical identity, BHR/FHR, evidence, findings, accepted intelligence, events/history, consent/audit.                  | Idempotent/versioned writes; no silent overwrite.                                 |
| GalviEngine Day 3   | Deterministic facts and governed accepted reasoning artifacts.                                                          | Stored/deterministic fallback remains usable; Chart does not rerun model on view. |
| Entitlement adapter | Server-verified GalviShot access state.                                                                                 | locked/pending/retry; URL flag never unlocks.                                     |
| Projection policy   | Role/consent/entitlement-based allowlist over canonical data.                                                           | Deny-by-default protected fields; no cross-record leakage.                        |
| Adapters            | Booking/CRM/analytics side effects only.                                                                                | Log and continue where noncritical.                                               |

> **NON-NEGOTIABLE AUTHORITY RULE**
>
> GalviChart shows; GalviVault remembers. The Chart may materialize/cache a versioned read projection only if necessary for performance, but that projection can never become a competing source of clinical truth. Canonical writes always go through governed Worker/domain services into the existing GalviVault record.

# 5. Repository Change Strategy — Discover First, Then Minimal Additive Delta

> **1.** Locate the current Worker API router and every route/action already used by Triage/Vitals/Score/Shot/Sight/Path. Reuse the same envelope and error conventions.
>
> **2.** Locate identity/session resolution and existing clinician portal/role authorization helpers. Extend one shared authorization path; do not create Chart-only identity logic.
>
> **3.** Locate GalviShot entitlement verification and persisted paid-result behavior. Chart activation must call/reuse this server-side authority.
>
> **4.** Locate Day 3 accepted-artifact retrieval, evidence lineage, generation status, and fallback helpers. Chart only consumes accepted/stored outputs.
>
> **5.** Locate D1 schema/migrations for principal, venture/BHR, evidence, results, journey/audit events, documents/artifacts, and any chart/timeline/history support.
>
> **6.** Locate frontend navigation and existing GalviChart placeholder/CTA if present. Reuse GalviCare visual language and routing.
>
> **7.** Locate tests for identity, authorization, Stripe entitlement, Day 3 reasoning, Day7D clarifying questions, and replay/idempotency. Promote these into inherited Day 4 regression.
>
> **8.** Only after the inventory is documented, choose the minimum file/migration delta. A “clean architecture rewrite” is explicitly disallowed.

| **If repository already has…**                    | **Then Day 4 should…**                                                                     |
|---------------------------------------------------|--------------------------------------------------------------------------------------------|
| A general projection/read service                 | Extend it with Chart sections and policy instead of creating chart-service-v2.             |
| A generic journey/audit/event ledger              | Use it for Timeline/History rather than duplicating timeline rows.                         |
| A generic artifact/document table                 | Project authorized document metadata rather than creating a separate Chart document store. |
| A generic idempotency/request fingerprint service | Reuse it for command writes and replay.                                                    |
| A role/assignment authorization service           | Add Chart resource/action policy there, not in browser JS.                                 |
| A canonical result/evidence version model         | Reference those versions in projection; do not copy payloads into new truth columns.       |

# 6. GalviVault 1.0 Data Strategy — Longitudinal Projection, Not a New Record System

## 6.1 Schema inspection before migration

- Enumerate current tables, indexes, foreign keys, unique constraints, migrations, and D1 binding before adding anything.

- Confirm whether the recommended migrations/galvicare_1_0/0004_chart_treatment_monitoring.sql (or equivalent functionality) already exists/applied.

- Prefer existing generic event/version/artifact/access objects. Only add fields/tables that close a Day 4 requirement and have no canonical equivalent.

- Every new write must be additive, migration-safe, re-runnable where practical, and compatible with rollback to the prior Worker.

- Do not duplicate Score, Vitals, evidence, Shot/Sight/Path content into a new chart_truth table. Reference canonical IDs/versions.

## 6.2 Logical Day 4 data needs — map to existing schema first

| **Logical need**              | **Minimum behavior**                                                                     | **Preferred storage rule**                                                                                 |
|-------------------------------|------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Chart activation state        | Derivable from verified GalviShot entitlement/result and canonical record.               | Prefer derivation; persist activation event/metadata only if existing event/entitlement model supports it. |
| Projection version            | Identify which canonical record/event versions formed a rendered Chart.                  | Optional metadata/cache keyed to principal/BHR + projection version; never duplicate truth.                |
| Timeline/History              | Chronological canonical events and prior versions.                                       | Reuse journey/audit/domain event/version tables.                                                           |
| Document metadata             | Authorized title/type/source/status/version/reference.                                   | Reuse artifact/document metadata; content remains governed canonical object/storage reference.             |
| Correction/check-in/milestone | Append-only command result/event linked to principal/BHR and relevant plan/evidence.     | Reuse evidence/event/version services; idempotent client_request_id.                                       |
| Access/audit                  | actor, role, action, entity, entity_id, purpose, environment, correlation_id, timestamp. | Append-only access/audit event.                                                                            |
| Projection policy             | Role/consent/entitlement rules in code/config with version marker.                       | Do not rely on client state or mutable D1 free-form ACL rows unless existing architecture already does.    |

> **MIGRATION DECISION**
>
> If Day 4 can pass using existing canonical tables plus read/projection logic, make no migration. If a missing Day 4 object is proven, add the smallest additive migration, record checksum and rollback behavior, and test it against a copy/current shape of QA D1 before remote apply.

# 7. Lock the GalviChart Activation Contract

Architectural record creation may occur at Triage as already governed. Customer access does not. The 1.0 customer activation event is successful server-verified GalviShot entitlement/result.

| **Journey stage**         | **Record state**                                                          | **Customer Chart state**                                    |
|---------------------------|---------------------------------------------------------------------------|-------------------------------------------------------------|
| Triage                    | Principal resolved; BHR resolved/created only when a real venture exists. | No customer Chart access.                                   |
| Vitals                    | Canonical measurements/evidence added.                                    | No customer Chart access.                                   |
| Score                     | Deterministic score + clarification loop/evidence may be present.         | No customer Chart access.                                   |
| GalviShot verified        | Accepted findings/result + verified entitlement.                          | Explorer GalviChart activates on the SAME canonical record. |
| GalviSight                | Interpretation/evidence contradiction/hypotheses accepted.                | Existing Chart enriched.                                    |
| GalviPath                 | Care pathway accepted/stored.                                             | Existing Chart enriched.                                    |
| GalviClinic / Treatment   | Physician review/plan when later built.                                   | Existing Chart enriched; no new Chart.                      |
| Monitoring / reassessment | Check-ins/outcomes/new versions.                                          | Existing Chart shows longitudinal change/history.           |

## 7.1 Server activation algorithm

> **1.** Authenticate the request using the existing supported session/identity path.
>
> **2.** Resolve the authorized principal and, when applicable, canonical BHR from server-side context; never trust a client-supplied record ID without ownership/assignment validation.
>
> **3.** Check required consent state for the requested projection.
>
> **4.** Call/reuse the canonical GalviShot entitlement/result verifier. A client URL parameter, localStorage flag, or prior UI state is insufficient.
>
> **5.** If not verified, return success=false or status=locked/not_activated using the repository’s common envelope without returning protected Chart payload.
>
> **6.** If verified, build Explorer projection from canonical stored Vitals/Score/Shot findings and record history. Do not regenerate Score or AI content.
>
> **7.** Emit/audit chart_activated once idempotently when the access state first transitions, then chart_viewed on authorized views if analytics architecture supports it.
>
> **8.** Return the same principal_id/bhr_id and a projection/version marker so later updates can prove continuity.

# 8. Secure Return, Authentication & Account Recovery — Minimum 1.0

> **SCOPE BOUNDARY**
>
> The authoritative Day 4 requirement is a secure-return/account-recovery path sufficient for 1.0. Do not introduce an enterprise IAM program, SAML/SCIM, or a new auth vendor unless the repository already uses it and a proven Day 4 defect requires configuration. Extend the existing identity/session mechanism.

| **Requirement**                 | **Implementation rule**                                                                                                      | **Required proof**                                                |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| Return after completion         | Resolve existing canonical principal/BHR before any create path.                                                             | Refresh/reopen returns same record IDs.                           |
| Cross-device/supportable return | Use existing authenticated identity/token/session mechanism; never depend solely on browser localStorage.                    | Supported cross-device path resolves same record.                 |
| Account recovery                | Recovery must restore identity mapping, not create a replacement principal.                                                  | Recovery test: one principal/BHR before and after.                |
| Session expiry                  | Return structured unauthenticated/re-auth state without record leakage.                                                      | Expired session negative.                                         |
| Incognito/new user              | Independent unauthenticated/new identity does not inherit previous local state.                                              | No stale cross-user projection.                                   |
| Record selection                | If multiple authorized ventures exist in future, server returns authorized set; 1.0 must not accept arbitrary BHR injection. | Unauthorized ID swap rejected.                                    |
| Clinician access                | Assignment/role controls are checked server-side independently of customer ownership.                                        | Unassigned clinician denied; assigned Business Physician allowed. |

# 9. Server-Side Authorization, Consent & Projection Policy

## 9.1 Role projection contract

| **Data / control**                         | **Customer**                                  | **Business Physician / authorized clinician**                                            |
|--------------------------------------------|-----------------------------------------------|------------------------------------------------------------------------------------------|
| Navigation and current scores/findings     | Yes, after entitlement.                       | Yes, if assigned/authorized.                                                             |
| Evidence summaries/provenance              | Authorized summaries only.                    | Authorized detail/lineage as permitted.                                                  |
| Accepted governed hypotheses               | Customer-safe language only when projectable. | Full authorized governed detail; internal hypothesis context may be visible.             |
| Rejected/raw AI proposal                   | Never.                                        | Not by default; only governance/admin context if explicitly authorized.                  |
| Protected notes                            | Never.                                        | Authorized clinical notes.                                                               |
| Confidence diagnostics/internal validation | Simplified/customer-safe confidence.          | Authorized diagnostics/validation context.                                               |
| Audit metadata/correlation IDs             | No.                                           | Only if role/purpose requires.                                                           |
| Treatment controls                         | No authoring controls.                        | Confirm/reject/modify/request evidence/order/referral controls later as Day 5 adds them. |
| Export                                     | Only approved customer projection.            | Role/purpose-specific export where authorized.                                           |

## 9.2 Deny-by-default projection builder

> **1.** Construct projection from server-known role, principal/BHR scope, consent, entitlement, and approved artifact states.
>
> **2.** Use explicit allowlists per projection role. Do not serialize a broad canonical object and then “delete” a few protected keys in browser code.
>
> **3.** For every referenced evidence/finding/artifact, verify it belongs to the same authorized principal/BHR scope.
>
> **4.** Filter by acceptance/customer_projection policy: accepted/openai_governed or clinician-approved only for customer-facing intelligence.
>
> **5.** Exclude protected notes, raw prompt/response bodies, hidden validation details, secrets, and internal audit context from customer response.
>
> **6.** Audit authorization failures and material projection/export actions using existing access/audit event support.

# 10. Build the GalviChart Projection Service

> **READ MODEL PRINCIPLE**
>
> The projection service is intentionally side-effect free on ordinary views. It reads canonical state, applies authorization/entitlement/projection policy, and returns a versioned view. It must not call OpenAI, recompute deterministic scores, write duplicate product results, or “repair” missing data during GET/view operations.

## 10.1 Recommended internal contract — adapt to existing repository names

```javascript
buildChartProjection({

actor, // authenticated server context

principal_id,

bhr_id, // null only where principal-only mode is valid

role,

entitlement_state,

requested_sections,

as_of_version // optional historical view

}) -> {

status: "ok|locked|unauthorized|needs_reauth",

chart_state: "pre_shot|explorer|sight|path|clinic|member",

principal_id, bhr_id,

projection_version,

sections: { overview, health, timeline, care_plan, evidence, documents, galviclinic, history },

next_action,

audit_correlation_id

}

// Implementation MUST reuse existing repository envelope/action naming when equivalents exist.
```

## 10.2 Projection assembly sequence

> **1.** Authenticate and authorize actor.
>
> **2.** Resolve canonical principal/BHR and protocol/lifecycle state.
>
> **3.** Verify GalviShot activation entitlement for customer role.
>
> **4.** Read canonical deterministic facts: Vitals, GalviScore, Acuity, Clinical Confidence, lifecycle/protocol.
>
> **5.** Read accepted stored Shot/Sight/Path artifacts and their evidence lineage; never call provider on Chart view.
>
> **6.** Read canonical journey/domain events and version history for Timeline/History.
>
> **7.** Read approved artifact/document metadata and authorized Clinic/plan metadata that exists.
>
> **8.** Compute chart_state from verified canonical milestones, not browser progression flags.
>
> **9.** Apply role/consent/entitlement allowlists and protected-field filters.
>
> **10.** Calculate projection_version/fingerprint from canonical version/event IDs so stale-state tests are observable.
>
> **11.** Return structured response with next action and safe empty states. No blank sections caused by missing future Day 5 data.

# 11. GalviChart Section Contract — Overview

| **Field**               | **Source**                                 | **Day 4 behavior**                                        |
|-------------------------|--------------------------------------------|-----------------------------------------------------------|
| Current score/readiness | Stored deterministic GalviScore.           | Display exact stored value/subtype; no browser recompute. |
| Health status           | Governed rules/result state.               | Customer-safe status with no invented certainty.          |
| Last checkup            | Canonical latest relevant event timestamp. | Use stored event time.                                    |
| Next action/check-in    | Canonical next_action/path state.          | Reflect entitlement/care progression.                     |
| Top finding             | Accepted GalviShot finding.                | Only customer-projectable accepted artifact.              |
| Active care priority    | Current accepted priority/path if present. | Safe empty/not-yet-available before Day 5 plan exists.    |

# 12. GalviChart Section Contract — Health

| **Content**                                          | **Required behavior**                                                                                                                                    |
|------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Eight Business Health / Founder Readiness dimensions | Use the active score subtype/protocol and stored values. Preserve dimension labels/contracts inherited from Day 2.                                       |
| Vitals                                               | Show current governed measurements/inputs that are authorized for customer projection.                                                                   |
| Current / previous / direction                       | Compare stored versions only when history exists. Do not infer trend from one point.                                                                     |
| Findings                                             | Accepted Shot findings with severity/confidence/customer-safe why-it-matters.                                                                            |
| Strengths / risks                                    | Derived only from governed/stored results; avoid raw model speculation.                                                                                  |
| Clinical Confidence                                  | Show customer-safe confidence representation; full diagnostics remain clinician-only.                                                                    |
| Clarification/evidence effect                        | When clarifying answers changed evidence/accepted results, show the newer canonical version and preserve prior history rather than hiding the evolution. |

# 13. GalviChart Section Contract — Timeline

| **Event class**   | **Examples**                                                                                               | **Rules**                                                                |
|-------------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| Intake            | Triage, consent, lifecycle/protocol assignment.                                                            | Chronological; customer-safe details only.                               |
| Diagnostics       | Vitals, Score, clarification asked/answered, Shot targeted questions/evidence, Shot/Sight/Path completion. | Reference canonical event/result versions.                               |
| Chart             | Activated, viewed/updated when useful.                                                                     | Activation once; views may be analytics/audit events.                    |
| Clinic / plan     | Booking intent, encounter, Treatment Plan, acknowledgement.                                                | May be empty until Day 5; no fake future event.                          |
| Monitoring        | Check-ins, milestones, outcomes, reassessment.                                                             | Append-only longitudinal events.                                         |
| Studio stage gate | Future Day 6 care-to-Studio events.                                                                        | Projection can support event class without building Day 6 workflows now. |

> **TIMELINE INVARIANT**
>
> Timeline is assembled from canonical domain/journey/version events. Do not create a second independently maintained timeline that can drift from GalviVault history.

# 14. GalviChart Section Contract — Care Plan

| **State**                 | **Projection behavior**                                                                                                             |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Pre-Path / Explorer       | Show “care pathway not yet available” plus next eligible action; do not invent plan content.                                        |
| After GalviPath           | Show stored recommended objective, sequence, evidence required, cadence, owner, escalation, and support level as accepted/governed. |
| After GalviClinic / Day 5 | Add active physician-approved Treatment Plan when one exists; clearly distinguish recommendation from confirmed treatment.          |
| Historical plan           | Prior Path/Plan versions remain traceable in History; current view points to active version.                                        |
| Acknowledgement           | Customer may acknowledge via Worker command; acknowledgement does not change clinical authorship.                                   |

# 15. GalviChart Section Contract — Evidence

| **Element**                             | **Customer projection**                                              | **Clinician projection**                                                                                   |
|-----------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| Evidence item                           | Authorized source/provenance summary, status, relevant date/version. | Authorized detail and lineage.                                                                             |
| Supports / contradicts                  | Customer-safe relationship to accepted finding.                      | Detailed support/contradiction links and confidence diagnostics.                                           |
| Confidence                              | Meaningful user-facing level/explanation.                            | Underlying evidence quality/validation context where authorized.                                           |
| AI generation metadata                  | Normally hidden operational details.                                 | Provider/model/prompt/schema/rules/protocol version metadata available to appropriate clinical/admin role. |
| Raw prompt / hidden reasoning / secrets | Never.                                                               | Never expose secrets; raw hidden reasoning not a Chart artifact.                                           |
| Rejected proposal                       | Never customer-projectable.                                          | Only governance trace if role/purpose explicitly permits; canonical accepted state remains distinct.       |

# 16. GalviChart Section Contract — Documents

- Project approved deliverables, reports, Treatment Plans, and other authorized artifact metadata as views/references to canonical artifacts, not copies that replace them.

- Validate document access using the same principal/BHR/role/consent scope as the Chart.

- For Day 4 ingestion baseline, validate allowed type/size/provenance/consent before accepting metadata/content through existing secure path. Do not expose direct D1/object-storage secrets to browser code.

- Quarantine/scan policy may remain a bounded baseline consistent with existing infrastructure; document any fallback rather than building an enterprise DMS.

- Never include raw OpenAI prompts, secrets, protected internal notes, or unrelated personal data in customer documents/exports.

# 17. GalviChart Section Contract — GalviClinic

| **Element**        | **Day 4 behavior**                                                                                                  |
|--------------------|---------------------------------------------------------------------------------------------------------------------|
| Upcoming encounter | Show approved booking status/source context if it already exists.                                                   |
| Previous encounter | Show authorized approved encounter metadata/notes when available; protected notes remain clinician-only.            |
| Plan/follow-up     | Show current approved follow-up/plan metadata; safe empty state before Day 5.                                       |
| Booking CTA        | Route through existing approved Calendly/booking path and write booking intent/source/session context if supported. |
| Payment            | Reuse existing server-verified Clinic payment/entitlement logic; Day 4 does not redesign economics.                 |

# 18. GalviChart Section Contract — History

> **1.** Expose prior versions and longitudinal changes that the customer is authorized to see.
>
> **2.** Current Chart view must identify active/current versions without silently deleting or overwriting historical truth.
>
> **3.** Corrections create a correction/version event and preserve the prior value where governance requires.
>
> **4.** When clarified evidence changes a finding or Path, retain the prior accepted version and show the progression at an appropriate customer-safe level.
>
> **5.** Historical projection requests must enforce current authorization/consent rules; “old version” is not a bypass to protected context.
>
> **6.** History queries are read-only and side-effect free.

# 19. Progressive GalviChart Entitlement / State Machine

| **Tier/state**         | **1.0 Chart experience**                                                                       | **Server derivation**                                     |
|------------------------|------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| Pre-Shot               | No customer Chart access; record may already exist architecturally.                            | No verified GalviShot entitlement/result.                 |
| Explorer after Shot    | Baseline + Vitals + Score + accepted findings; limited history; Chart persists.                | Verified Shot entitlement/result.                         |
| \+ GalviSight          | Adds interpretation, support/contradiction, hypotheses, urgency, risks/opportunities.          | Stored accepted/projectable Sight artifact exists.        |
| \+ GalviPath           | Adds care pathway, objectives, evidence requirements, sequencing, escalation.                  | Stored accepted/projectable Path artifact exists.         |
| \+ GalviClinic         | Adds physician review, confirmed/rejected findings, Treatment Plan, targets when later built.  | Authorized canonical Clinic/plan objects exist.           |
| Business Health Member | Adds ongoing check-ins, monitoring, outcomes, trends, care-plan management/periodic summaries. | Server-verified membership + canonical monitoring events. |

> **STATE MACHINE RULE**
>
> The client may render the returned chart_state, but it never decides chart_state. State is derived on the server from canonical entitlement + stored product/care milestones. A refresh, back button, replay, or local storage edit cannot advance it.

# 20. Clinician Projection — Same Visual Language, More Authorized Context

- Keep the same core navigation, score/findings/evidence/timeline/care-plan/document language as the customer experience so the Business Physician sees the same “chart” the customer recognizes.

- Add only role-authorized detail: evidence lineage, internal governed hypotheses, confidence diagnostics, clinician confirmation/rejection state, protected notes, treatment controls, escalation/referral controls, and audit-aware context.

- Do not fork the canonical record or create a separate clinician copy. Both projections resolve the same principal/BHR and canonical artifact IDs.

- Authorization is assignment/purpose aware. Possessing a BHR ID or clinician URL is insufficient.

- Customer response/schema must not accidentally serialize clinician-only fields even if CSS hides them.

# 21. Governed Two-Way Commands — Append, Version, Audit

| **Customer action**             | **Worker behavior**                                                                                    | **Day 4 acceptance**                               |
|---------------------------------|--------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| Submit check-in                 | Validate identity/entitlement/record; append evidence/check-in; never overwrite prior event.           | Idempotent replay; Timeline/History updates.       |
| Upload requested evidence       | Validate type/size/provenance/consent; safe ingestion baseline; create evidence item after acceptance. | Correct scope/version/provenance; no cross-record. |
| Report treatment milestone      | Append milestone/outcome linked to active plan/action when one exists.                                 | Safe no-plan behavior; no fabricated plan.         |
| Correct permitted profile field | Create correction/version event; preserve prior value where required.                                  | History shows change; unauthorized fields denied.  |
| Acknowledge Treatment Plan      | Record acknowledgement; customer does not become clinical author.                                      | No plan content mutation.                          |
| Schedule GalviClinic            | Write booking intent and route with source/session/BHR context.                                        | Adapter failure non-blocking with fallback route.  |
| Export approved record          | Generate authorized projection/export; exclude protected internal notes/rationale.                     | Role/consent filtered; audit event.                |

## 21.1 Command orchestration pattern

```text
authorize(actor, action, principal_id, bhr_id)

-> validate consent / entitlement / current object state

-> validate payload schema + size/type/provenance where applicable

-> check client_request_id / idempotency fingerprint

-> append versioned canonical event/evidence/correction/acknowledgement

-> emit audit/journey event

-> return updated projection_version + next_action

Never: browser -> D1; direct UPDATE of historical truth; client role/entitlement override.
```

# 22. Safe Ingestion, Correction & Export Baseline

| **Control**    | **Minimum Day 4 requirement**                                                                          |
|----------------|--------------------------------------------------------------------------------------------------------|
| Payload bounds | Reject oversized/invalid/unexpected inputs with structured errors.                                     |
| Provenance     | Capture source, actor, timestamp, version/validation status for accepted evidence.                     |
| Consent        | Apply purpose/status/version before protected ingestion/export.                                        |
| Scope          | Every artifact/evidence item belongs to authorized principal/BHR; no orphan/cross-record acceptance.   |
| Correction     | Version event; do not silently rewrite prior clinical/business history.                                |
| Export         | Server-generated authorized projection only; protected clinician context excluded.                     |
| Logging        | Redact secrets/sensitive payloads; use correlation IDs and structured error codes.                     |
| Failure        | Core Chart remains usable; failed upload/export returns recoverable state and does not corrupt record. |

# 23. Frontend Integration — Project, Do Not Re-Author Truth

## 23.1 Customer UI rules

- Add/reuse one GalviChart route/view in the existing GalviCare visual system. Do not build a separate application unless the current architecture already defines it as such.

- On navigation, call the Worker projection action; render locked/not_activated, reauth, error/retry, Explorer, and progressively enriched states explicitly.

- Preserve session/principal/BHR reference only as opaque client context where needed; server re-resolves/authorizes on every request.

- Never compute Score/Acuity/Clinical Confidence, acceptance status, entitlement, or role in browser JS.

- Never call OpenAI from Chart. Day 3 accepted content is read from GalviVault/GalviEngine storage through Worker.

- Prevent stale UI after new Sight/Path/Clinic result by refetching projection after successful canonical writes/results; use projection_version rather than inventing client progression.

- Chart view/read must not trigger evidence/product-result writes. This explicitly protects the Day 3 Build2 atomic upsert/runtime remediation from accidental replay loops.

- Use visible, actionable recovery on structured errors; no blank page.

## 23.2 Accessibility/responsiveness minimum

- All required sections are keyboard reachable and have meaningful headings/labels.

- Locked/empty/error states are textually clear, not conveyed only by color/icons.

- Critical actions remain usable on the viewport sizes already supported by GalviCare 0.5/1.0; major mobile-responsive breakage is P1.

- Clinician/customer protected content separation is enforced server-side regardless of responsive hiding.

# 24. Preserve Day 3 Governed Intelligence & Closed-Loop Clarification

> **INHERITED DAY 3 BUILD2 CONTRACT**
>
> The expected closed loop remains: GalviTriage -> GalviVitals -> deterministic GalviScore -> clarification question -> customer answer -> versioned Business Health evidence -> GalviShot targeted questions where clinically useful -> more evidence -> GalviEngine/OpenAI governed synthesis -> customer-specific GalviShot/GalviSight/GalviPath reasoning -> GalviVault accepted history -> GalviChart projection. Day 4 must display and preserve this lineage, not bypass it.

| **Inherited Day 3 control** | **Day 4 obligation**                                                                                                                                 |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity / record           | Use the same principal/BHR context and authorization; no Chart-specific shadow record.                                                               |
| Deterministic truth         | Display stored Score/Acuity/Clinical Confidence/protocol as governed facts; never regenerate in browser.                                             |
| Governed intelligence       | Project only accepted/openai_governed or clinician-approved artifacts; raw/rejected proposals are not customer truth.                                |
| Evidence lineage            | Findings/evidence link to accepted artifact and authorized source evidence IDs/versions.                                                             |
| Generation metadata         | Preserve provider/model/prompt/schema/rules/protocol traceability in canonical/admin evidence even when UI hides detail.                             |
| Fallback                    | Chart remains usable with stored accepted/deterministic content when AI is disabled/unavailable.                                                     |
| Clarifying questions        | Continue normal stage behavior; Chart projection is downstream of the evidence loop, not a replacement for it.                                       |
| Day7D runtime fix           | Preserve atomic/idempotent observation/product-result upserts and unified reasoning/evidence route contracts; projection reads are side-effect free. |
| Regression                  | Rerun the full Day 3 gate before Day 4 PASS.                                                                                                         |

# 25. Automated Day 4 QA Matrix — Mandatory Tests

| **ID** | **Scenario**                     | **Pass criteria**                                                                                                         |
|--------|----------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| T01    | Baseline exact SHA               | Exact signed Day 3 Build Final, branch, D1 binding, runtime and rollback target recorded.                                 |
| T02    | Inherited Day 3 full gate        | All Day 3 unit/contract/golden/adversarial/regression tests pass before Day 4 delta.                                      |
| T03    | Pre-Shot lock                    | Direct customer get_chart returns locked/not_activated and no protected payload.                                          |
| T04    | URL/localStorage tamper          | Client unlock flags cannot activate Chart.                                                                                |
| T05    | Shot activation                  | Verified Shot entitlement/result activates Explorer against same principal/BHR.                                           |
| T06    | Duplicate activation replay      | Repeated activation/view yields one activation state/event and same Chart identity.                                       |
| T07    | Explorer sections                | Overview/Health/Timeline/Care Plan/Evidence/Documents/Clinic/History render safe baseline/empty states.                   |
| T08    | Sight progressive update         | Accepted Sight enriches same projection_version lineage; no new Chart/BHR.                                                |
| T09    | Path progressive update          | Accepted Path enriches same Chart; care-plan section uses stored accepted artifact.                                       |
| T10    | AI rejected proposal hidden      | Rejected/raw proposal never appears in customer projection.                                                               |
| T11    | AI outage fallback               | Chart still renders stored deterministic/accepted content with provider disabled/unavailable.                             |
| T12    | Customer vs clinician projection | Same core record/UI language; protected clinician fields absent from customer response.                                   |
| T13    | Unauthorized customer record     | Cross-user/BHR request denied/logged with no leakage.                                                                     |
| T14    | Unauthorized clinician record    | Unassigned clinician denied/logged.                                                                                       |
| T15    | Consent withdrawn/missing        | Protected projection/action denied according to existing consent policy.                                                  |
| T16    | Refresh return                   | Same authenticated customer returns to same principal/BHR and current Chart state.                                        |
| T17    | Supported cross-device/recovery  | Identity recovery resolves same canonical record; no duplicate.                                                           |
| T18    | Incognito isolation              | New/unauthenticated session does not inherit prior customer Chart.                                                        |
| T19    | History versions                 | Prior accepted versions remain traceable; current view identifies active version.                                         |
| T20    | Correction append                | Permitted correction creates version event; prior value/history retained.                                                 |
| T21    | Check-in idempotency             | Replay with same client_request_id produces one canonical check-in/evidence event.                                        |
| T22    | Evidence upload scope            | Accepted evidence is correctly scoped/versioned; invalid/cross-record payload rejected.                                   |
| T23    | Export filtering                 | Approved export excludes protected notes/internal rationale and is audited.                                               |
| T24    | Clinic scheduling intent         | Booking route preserves source/session/BHR; adapter failure uses documented fallback.                                     |
| T25    | Structured runtime error         | Projection/action failure returns JSON/common envelope; no HTML/blank page.                                               |
| T26    | Day7D replay regression          | Clarification + evidence + targeted Shot questions + governed outputs + Chart view repeat without duplicate/500.          |
| T27    | Projection read side-effect free | Repeated Chart reads do not insert/modify clinical truth or trigger AI generation.                                        |
| T28    | Stale update                     | After new accepted result, refetch returns higher projection version/new data; old version remains in history.            |
| T29    | D1 integrity                     | No duplicate principals/BHRs, orphan evidence, cross-record links, duplicate accepted results or invalid activation rows. |
| T30    | Rollback                         | Known-good Day 3 Worker/frontend can be restored without destructive D1 repair; Chart delta fails closed safely.          |

# 26. D1 Integrity Assertions — Before and After Deployed Human E2E

Codex must map these logical assertions to the actual existing schema. Do not copy the example SQL literally until table/column names are verified.

| **Assertion**                   | **Must prove**                                                                                                         |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------|
| D1-1 Principal uniqueness       | No duplicate principal for the same canonical identity key.                                                            |
| D1-2 Venture/BHR uniqueness     | No duplicate canonical venture/BHR for the same founder/venture mapping.                                               |
| D1-3 No shadow Chart truth      | No competing Chart copy of Score/evidence/findings/results used as authority.                                          |
| D1-4 Shot activation continuity | Activated Chart references/resolves same principal/BHR as paid Shot result.                                            |
| D1-5 Evidence scope             | All projected evidence belongs to authorized principal/BHR and valid version.                                          |
| D1-6 Governed AI state          | Customer-projectable artifacts are accepted/governed or clinician-approved; rejected proposals remain non-projectable. |
| D1-7 History lineage            | Current and prior result/evidence versions remain traceable; no silent destructive overwrite.                          |
| D1-8 Command idempotency        | No duplicate check-in/correction/milestone/acknowledgement for same stable request fingerprint.                        |
| D1-9 Access/audit               | Unauthorized attempts and material export/projection actions produce appropriate audit events.                         |
| D1-10 Day7D persistence         | Observation/product-result replay maintains one correct current row/version and no conflict-induced runtime failure.   |
| D1-11 Orphans                   | No orphan evidence, document metadata, events, or projection references.                                               |
| D1-12 Migration                 | Any Day 4 migration applied once/equivalently rerunnable and checksum recorded.                                        |
| D1-13 Rollback compatibility    | Prior Day 3 Worker can read required schema after Day 4 rollback.                                                      |
| D1-14 Manual repair             | PASS run requires manual repair=NO.                                                                                    |

```sql
# Example shape only — inspect actual schema first.

# Use read-only queries wherever possible.

-- duplicate canonical identity

SELECT canonical_identity_key, COUNT(*)

FROM <principal_table>

GROUP BY canonical_identity_key

HAVING COUNT(*) > 1;

-- duplicate BHR mapping

SELECT principal_id, venture_id, COUNT(*)

FROM <bhr_table>

GROUP BY principal_id, venture_id

HAVING COUNT(*) > 1;

-- projectable AI artifact must be accepted/governed

SELECT * FROM <artifact_or_generation_table>

WHERE customer_projection = 1

AND approval_status NOT IN ('accepted','approved','clinician_approved');

-- cross-record/orphan evidence checks must be adapted to actual FKs/IDs.
```

# 27. Exact-SHA QA Deployment & Runtime Verification

## 27.1 Pre-deploy gate

- Working tree contains only the intended Day 4 critical-path delta plus explicitly documented pre-existing files.

- All focused Day 4 tests and full inherited Day 3 gate pass locally/approved CI path.

- Any D1 migration was validated against current QA schema shape and has a non-destructive rollback/compatibility plan.

- No secret, protected payload, raw AI prompt, or environment-specific credential appears in diff/log/evidence.

- Candidate commit SHA is recorded and immutable before deployment.

- qa-revamped-galvicare-0-5 remote head equals the candidate intended for QA; no work branch is involved.

## 27.2 Deploy exact candidate through existing approved path

> **DO NOT INVENT A NEW DEPLOYMENT PATH**
>
> Use the same known-good Cloudflare/GitHub deployment mechanism proven in Days 1-3. If Wrangler returns 403 or CI is queued, diagnose platform/auth state; do not create a new Worker, D1 database, or workflow as a workaround.

> **1.** Deploy the exact candidate SHA to the existing QA Worker/frontend using the approved path.
>
> **2.** If a Day 4 additive migration is required, apply only to the existing QA D1 binding after binding identity is re-verified.
>
> **3.** Capture deployment ID, deployed SHA/runtime marker, Worker route, D1 binding, schema/migration version, and timestamp.
>
> **4.** Call health/capabilities and confirm inherited Day 1-3 capability flags plus any Day 4 chart capability marker if the architecture exposes one.
>
> **5.** Run direct deployed probes for pre-Shot lock, verified Shot activation, customer projection, clinician projection, unauthorized access, and structured error behavior.
>
> **6.** Run Day7D clarification/AI closed-loop regression on deployed QA before Human E2E.

## 27.3 Deployed proof chain

| **Proof**        | **Required evidence**                                                       |
|------------------|-----------------------------------------------------------------------------|
| Git              | Candidate SHA + remote QA SHA.                                              |
| Deployment       | Existing QA Worker/frontend deployment ID/source commit.                    |
| D1               | Existing QA binding/database + schema/migration checksum.                   |
| Runtime          | Health/capability response + direct get_chart/action probes.                |
| Security         | Unauthorized/cross-record/protected-field negatives.                        |
| Progression      | Shot activates; Sight/Path enrich same record/projection.                   |
| Day 3 regression | Clarifications, evidence, governed AI, fallback, Day7D replay remain green. |
| Human E2E        | Run ID + screenshots/logs/D1 assertions + manual repair=NO.                 |

# 28. Day 4 Human E2E Run Sheet — No Manual Repair

| **ID** | **Human step**                                                                              | **Expected result / evidence**                                                     |
|--------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| H01    | Open a clean customer session and complete/resolve Triage.                                  | Canonical principal/BHR matches Day 1/2 rules; no duplicate.                       |
| H02    | Complete Vitals and deterministic GalviScore.                                               | Stored score renders; no browser recompute.                                        |
| H03    | Trigger required Score clarification and answer it.                                         | Question remains present/functional; answer writes versioned evidence.             |
| H04    | Continue to GalviShot and answer targeted questions when clinically useful.                 | More evidence persists; no runtime failure/duplicate.                              |
| H05    | Complete governed Shot/Sight/Path path.                                                     | Customer-specific reasoning renders; accepted artifacts and lineage stored.        |
| H06    | Before verified Shot entitlement in a separate eligible test state, request Chart directly. | locked/not_activated; no record content leakage.                                   |
| H07    | Verify/complete GalviShot entitlement/result and open Chart.                                | Explorer activates; same principal/BHR; required sections render.                  |
| H08    | Inspect Overview + Health.                                                                  | Stored score/vitals/findings/customer-safe confidence correct.                     |
| H09    | Inspect Timeline + History.                                                                 | Clarification/evidence/Shot/Sight/Path events and prior versions are traceable.    |
| H10    | Inspect Evidence.                                                                           | Authorized support/contradiction/provenance shown; protected/internal data absent. |
| H11    | Inspect Care Plan/Documents/Clinic sections.                                                | Stored available data shown; future/missing data uses safe empty states.           |
| H12    | Refresh/reopen authenticated customer path.                                                 | Same canonical record/Chart state; no duplicate identity.                          |
| H13    | Run supported recovery/cross-device return.                                                 | Same record resolves; no localStorage dependency.                                  |
| H14    | Attempt client BHR swap / unauthorized record.                                              | Denied/logged; no existence/content leak.                                          |
| H15    | Open Business Physician/clinician projection with authorized test actor.                    | Same core Chart language plus authorized clinical context.                         |
| H16    | Compare customer projection.                                                                | Protected notes/internal hypotheses/audit/treatment controls absent.               |
| H17    | Submit a permitted check-in/correction test command.                                        | Versioned append; History/Timeline updates; prior state retained.                  |
| H18    | Replay same command/request.                                                                | No duplicate canonical write.                                                      |
| H19    | Disable/simulate provider outage and reload Chart.                                          | Stored deterministic/accepted content remains usable; no AI call required.         |
| H20    | Exercise structured error/recovery path.                                                    | No blank/HTML runtime error; session/BHR reference preserved.                      |
| H21    | Run D1 assertions.                                                                          | D1-1..D1-14 clean; no cross-record/duplicate/projectability defect.                |
| H22    | Rollback rehearsal then restore Day 4 candidate as needed for evidence.                     | Non-destructive rollback to Day 3 proven; no manual D1 repair.                     |

> **HUMAN E2E PASS RULE**
>
> A screenshot that “looks right” is not sufficient. PASS requires the exact deployed candidate, correct branch/runtime/D1 identity, server-verified entitlement, permission-correct customer/clinician projections, same-record continuity, version/history integrity, inherited Day 3 closed-loop regression, clean D1 assertions, and manual repair=NO.

# 29. Critical-Path Defect Remediation Playbook

| **Failure**                       | **First isolate**                                             | **Minimal critical-path remediation**                                              |
|-----------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------------------|
| Chart locked after paid Shot      | Entitlement verifier vs paid result vs server record scope.   | Fix the proven verification/mapping defect; do not add client unlock flag.         |
| Chart unlocks before Shot         | Server activation guard.                                      | Restore verified entitlement gate; remove client-derived truth.                    |
| Wrong/duplicate Chart record      | Identity/BHR resolution path.                                 | Fix canonical resolver/idempotency; merge-by-manual-SQL is not PASS remediation.   |
| Protected clinician field leaks   | Projection allowlist/serialization layer.                     | Remove from customer server projection; add negative contract test.                |
| Sight/Path not reflected          | Canonical accepted artifact retrieval/projection fingerprint. | Fix read/version mapping; do not rerun AI as workaround.                           |
| Blank Chart/runtime 500           | Exact Worker/browser error and request/response.              | Structured error + proven route/data fix; preserve recovery.                       |
| Day7D conflict/runtime returns    | Observation/product-result upsert path/replay.                | Preserve/repair atomic ON CONFLICT DO UPDATE and idempotency; no question removal. |
| Clarification question disappears | Stage state/projection integration.                           | Restore Day 3 evidence-gathering flow; Chart must be downstream only.              |
| Cross-device duplicate            | Auth identity mapping/create-before-resolve.                  | Resolve existing principal first; fix idempotent create path.                      |
| History lost after correction     | Update-in-place domain write.                                 | Convert to append/version event; preserve prior row/version.                       |
| Wrangler 403                      | Cloudflare auth/environment/binding.                          | Fix credential/config only; no new Worker/DB.                                      |
| CI runner unavailable             | Platform state.                                               | Wait/retry approved path; do not rewrite application/workflow.                     |
| Deployment serves old code        | Deploy/source mismatch.                                       | Redeploy exact candidate; verify runtime SHA/behavior.                             |
| D1 migration conflict             | Schema reality vs migration assumption.                       | Inspect schema, make smallest additive compatibility fix; no destructive reset.    |

# 30. Day 4 Release Evidence Package

| **Artifact**             | **Required content**                                                                             |
|--------------------------|--------------------------------------------------------------------------------------------------|
| E01 Baseline manifest    | Repo/root/branch/exact Day 3 Build Final SHA/QA deployment/D1 binding/schema/rollback.           |
| E02 Inherited gate       | Day 3 full regression results including clarification closed loop, governed AI and Day7D replay. |
| E03 Architecture map     | Canonical GalviVault -\> Worker -\> customer/clinician projection; no second record system.      |
| E04 Schema diff          | Before/after D1 schema, migration checksum if any, compatibility/rollback notes.                 |
| E05 API contracts        | Chart read/action request/response examples; locked/unauthorized/error envelopes.                |
| E06 Activation evidence  | Pre-Shot locked + verified Shot activation + same principal/BHR IDs.                             |
| E07 Progressive evidence | Sight/Path (and existing Clinic if available) enrich same Chart/projection history.              |
| E08 Projection security  | Customer vs clinician response comparison; protected-field negative.                             |
| E09 Return/recovery      | Refresh/cross-device/account recovery resolves same canonical record.                            |
| E10 History/versioning   | Prior/current versions and correction/check-in append behavior.                                  |
| E11 D1 assertions        | D1-1 through D1-14 results before/after Human E2E.                                               |
| E12 Deployment proof     | Candidate SHA \<-\> remote QA SHA \<-\> deployment ID \<-\> runtime probes.                      |
| E13 Human E2E            | H01-H22 expected/actual with run ID; screenshots supplemental.                                   |
| E14 Defect log           | Each blocker: failure -\> root cause -\> minimal diff -\> focused PASS -\> regression PASS.      |
| E15 Rollback proof       | Day 3 code/deployment restore procedure and non-destructive verification.                        |
| E16 Final decision       | DAY 4 HUMAN E2E PASS / FAIL-STOP-ROLLBACK + exact Day 5 handoff baseline.                        |

# 31. Day 4 Rollback Strategy

## 31.1 Two rollback levels

| **Level**                  | **Use when**                                                               | **Action**                                                                                                                                                          |
|----------------------------|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Feature/projection disable | Chart-specific projection path causes P0/P1 but schema remains compatible. | Disable/revert Day 4 route/UI to prior safe behavior through existing config/code path; keep canonical data intact.                                                 |
| Code deployment rollback   | Candidate introduces systemic defect or projection security risk.          | Restore exact signed Day 3 Build Final Worker/frontend deployment.                                                                                                  |
| Database                   | Only if an additive migration was used.                                    | Do not destructively drop canonical history as routine rollback. Prior Day 3 Worker must remain schema-compatible; quarantine unused additive objects if necessary. |

## 31.2 Rollback must prove

- Known-good Day 3 deployment can be restored through the approved path.

- Existing principal/BHR/evidence/accepted AI history remains intact.

- No Day 4 migration makes the Day 3 Worker unreadable.

- GalviShot/GalviSight/GalviPath closed loop remains usable after rollback.

- No manual destructive SQL is required to recover.

- Rollback target, deployment ID/SHA, and post-rollback smoke evidence are recorded.

# 32. Day 4 Stop/Go Gate

> **GO ONLY WHEN**
>
> GalviShot verified entitlement activates a secure persistent GalviChart on the same canonical record; Sight/Path and later care milestones enrich that same record; customer and clinician projections are permission-correct; secure return does not duplicate identity; History/evidence lineage remain intact; the Day 3 clarification/governed-intelligence loop is unchanged; deployed exact-SHA QA + D1 assertions + Human E2E + rollback all pass with manual repair=NO.

> **STOP / ROLLBACK IF**
>
> Chart becomes a second database/source of truth; a browser can unlock or mutate canonical state directly; a customer sees protected clinician context; return/recovery creates duplicate principals/BHRs; rejected/raw AI content becomes customer truth; Chart view re-triggers writes/AI or reintroduces Day7D runtime conflicts; history is overwritten; cross-record access leaks; exact deployment/D1 identity cannot be proven; or rollback is destructive/unavailable.

| **Gate**         | **PASS evidence**                                                                                                   |
|------------------|---------------------------------------------------------------------------------------------------------------------|
| Baseline         | Signed Day 3 Build Final baseline proven and inherited gate green.                                                  |
| Activation       | Pre-Shot lock + verified Shot activation + same canonical ID.                                                       |
| Projection       | All required sections render authorized canonical state; no shadow truth.                                           |
| Progression      | Sight/Path/available care events enrich existing Chart.                                                             |
| Security         | Customer/clinician allowlists, unauthorized negatives, consent/entitlement checks pass.                             |
| Continuity       | Refresh/recovery/cross-device supported path resolves same record.                                                  |
| History          | Version lineage/correction/check-in behavior append and remain traceable.                                           |
| Day 3 regression | Clarification questions, versioned evidence, targeted Shot questions, governed AI, fallback, Day7D replay all pass. |
| Runtime          | Exact candidate deployed to existing QA Worker/D1; structured errors/recovery pass.                                 |
| D1               | Integrity assertions clean; manual repair=NO.                                                                       |
| Rollback         | Day 3 deployment restore non-destructive and verified.                                                              |
| Decision         | DAY 4 HUMAN E2E PASS signed; exact Day 5 handoff baseline recorded.                                                 |

# Appendix A — One-Page Day 4 Completion Checklist

- [ ] Exact signed Day 3 Build Final SHA/deployment/D1/rollback baseline recorded.

- [ ] qa-revamped-galvicare-0-5 only; main untouched; no work/new branch.

- [ ] Full inherited Day 3 gate green before Day 4 changes.

- [ ] Clarification question -\> answer -\> versioned evidence -\> targeted Shot questions -\> governed Shot/Sight/Path closed loop preserved.

- [ ] Day7D atomic/idempotent observation/product-result upsert regression green.

- [ ] GalviChart is a projection of GalviVault; no shadow record/database.

- [ ] Customer secure return/account recovery resolves same canonical identity/BHR.

- [ ] Pre-Shot direct Chart is locked/not_activated without leakage.

- [ ] Verified GalviShot entitlement/result activates Explorer on same record.

- [ ] Overview, Health, Timeline, Care Plan, Evidence, Documents, GalviClinic, History sections render.

- [ ] Sight/Path progressively enrich same Chart; no new Chart identity.

- [ ] Customer and clinician projections share core visual language but protected fields differ correctly.

- [ ] Only accepted/governed or clinician-approved intelligence is customer-projectable.

- [ ] Chart reads do not call OpenAI, recompute deterministic truth, or write duplicate product/evidence rows.

- [ ] Customer commands route through Worker and append/version history.

- [ ] Unauthorized/cross-record/role/consent/entitlement tamper negatives pass.

- [ ] Refresh/incognito/recovery/cross-device tests pass without stale cross-user state.

- [ ] D1-1 through D1-14 clean; manual repair=NO.

- [ ] Exact candidate SHA deployed to existing QA Worker/frontend and expected QA D1 binding.

- [ ] H01-H22 Human E2E PASS with evidence index.

- [ ] Rollback to Day 3 Build Final tested/non-destructive.

- [ ] DAY 4 HUMAN E2E PASS / DAY 4 BUILD FINAL signed and Day 5 handoff baseline recorded.

# Appendix B — Day 5 Handoff Contract

Day 5 (Treatment, Active Care, GalviRx, GalviAudit, GalviGuide, Referrals, and Outcomes) may begin only from the exact Day 4 Build Final baseline. Day 5 consumes the secure GalviChart/GalviVault continuity created on Day 4; it must not rebuild identity, entitlement, projection, or Day 3 governed intelligence.

| **Inherited control** | **Day 5 obligation**                                                                                                                  |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Identity / record     | Use the same authorized principal/BHR and Chart context for the Business Physician encounter.                                         |
| Chart activation      | Preserve GalviShot Explorer activation economics; Day 5 enriches an existing Chart.                                                   |
| Projection security   | Business Physician receives authorized clinical context; customer remains protected from internal notes/controls.                     |
| Governed intelligence | Clinic reviews accepted Shot/Sight/Path artifacts and evidence lineage; AI remains distinguishable from confirmed physician judgment. |
| History/versioning    | Treatment Plan, Rx, Audit, referral, monitoring, outcomes append/version into the same longitudinal record.                           |
| Day 3 closed loop     | Clarifications/evidence/AI lineage remain available as the pre-visit evidence base.                                                   |
| Fallback              | Stored deterministic/accepted Chart remains usable if provider unavailable.                                                           |
| Regression            | Day 5 reruns Day 4 + inherited Day 3 gates before its own PASS.                                                                       |

> **TARGET DAY 5 START STATE**
>
> DAY 4 HUMAN E2E PASS -> DAY 4 BUILD FINAL -> SECURE PERSISTENT GALVICHART / LONGITUDINAL GALVIVAULT FOUNDATION READY FOR ACTIVE CARE. If any P0/P1 gate is red, the only valid declaration is FAIL / STOP / ROLLBACK.

# Appendix C — Codex Evidence / Status Report Template

```text
DAY 4 BUILD STATUS

Baseline

- repo/root:

- branch/upstream:

- Day 3 Build Final SHA:

- QA deployment ID/runtime:

- QA D1 binding/database:

- schema/migrations:

- rollback target:

Implementation delta

- files changed:

- migration (if any):

- reason each file is critical path:

Automated QA

- inherited Day 3 gate: PASS/FAIL

- Day 4 T01-T30: PASS/FAIL (mandatory skipped=0)

- D1-1..D1-14: PASS/FAIL

Deployed QA

- candidate SHA:

- remote QA SHA:

- deployment ID:

- direct lock/activation/projection/security probes:

Human E2E

- H01-H22: PASS/FAIL

- manual repair: NO

Defects

- failure -> proven root cause -> minimal diff -> focused retest -> regression

Rollback

- Day 3 restore: PASS/FAIL

- non-destructive D1 compatibility: PASS/FAIL

FINAL DECLARATION

DAY 4 HUMAN E2E PASS / DAY 4 BUILD FINAL

OR

DAY 4 FAIL / STOP / ROLLBACK
```

# Appendix D — Source Alignment Notes

- Authoritative Seven-Day Guide Day 4 defines GalviChart 1.0 + GalviVault 1.0 longitudinal care, secure return, Shot-only activation, progressive enrichment, eight Chart sections, customer/clinician projection differences, governed two-way commands, entitlements, QA matrix, and stop/go gate.

- The Authoritative Guide master plan explicitly places Day 4 after governed AI and requires Shot activation + same-record enrichment + correct customer/clinician permissions.

- Day 3 Builder Appendix B requires Day 4 to consume the same principal/BHR authority, deterministic facts, accepted governed intelligence, evidence lineage, generation metadata, fallback behavior, activation economics, and progressive-record model, and to rerun the full Day 3 gate.

- The Day 3 Build2 execution history adds a critical inherited regression: the clarifying-question closed loop must remain present and functional, and the permanent runtime correction uses atomic/idempotent observation/product-result persistence rather than removing questions or evidence steps.

- Critical-path principle: ship the correct 1.0 longitudinal record/projection foundation, not a final 3.0 enterprise portal, autonomous agent, or new record platform.
