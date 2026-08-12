**Day 9 Builder Guide**

**Founder Health Record Build → Business Health Record Integration**

Historical FCD / GalviShot Backfill • Returning-Founder Continuity • Founder Intelligence Context

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

> **Git-safe conversion note:** Founder email values supplied for the controlled Day 9 migration have been replaced with environment-variable placeholders in this Markdown file. Load the real values only through secure, untracked runtime input.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CURRENT BUILD STATUS — DAY 8 COMPLETE / DAY 9 AUTHORIZED EXTENSION</strong></p>
<p>Day 9 begins only from the exact evidenced Day 8 Build Final baseline. The Product Owner has authorized a bounded post-Day-8 capability: ingest approved pre-GalviCare Founder Collaboration Discussion (FCD) / GalviShot history into GalviVault, preserve it as governed historical founder intelligence, resolve returning founders to the correct existing canonical record, and make that internal context available to the future GalviEngine Decision Intelligence layer without exposing the FHR/BHR directly to founders.</p></th>
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
<th><p><strong>DAY 9 MISSION</strong></p>
<p>Build the historical Founder Health Record (FHR) capability as a governed projection over the existing canonical GalviVault record model, integrate it with the Business Health Record (BHR) continuity path, and prove that a pre-GalviCare founder can later enter GalviCare and continue one longitudinal record rather than starting over. Build the smallest complete capability needed for the upcoming GalviCare | GalviVault Integration E2E.</p></th>
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
<p>BHR is the customer-facing product name; BMR remains the internal canonical technical aggregate. FHR is not a second database, second source of truth, or a public portal. Historical founder intelligence is stored through existing GalviVault record classes and exposed internally through a governed projection. Founders do not receive self-service access to FHR/BHR in Day 9 or GalviCare MVP 1.0.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Prepared for GalviPro / GalviStudio \| August 2026

# How Codex Must Use This Builder

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>EXECUTION CONTRACT</strong></p>
<p>Treat this file as an implementation runbook, not a design brainstorm. First fingerprint the exact Day 8 final baseline and actual repository/schema reality. Then implement only the missing historical-import, FHR projection, returning-founder continuity, and internal Founder Intelligence Context capability. Reuse the existing Worker, D1, import service, evidence model, Day 8 operator workspace, authorization, versioning, idempotency, audit, and regression machinery. Stop at the first blocking identity, privacy, data-integrity, cross-BMR, import-reconciliation, or GalviCare-regression defect.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Priority** | **Instruction**                                | **What it means in practice**                                                                                                                                                                                               |
|--------------|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Start from Day 8 Build Final                   | Verify exact Day 8 final SHA/deployments/schema/evidence before any Day 9 edit.                                                                                                                                             |
| P0           | Approved branch model only                     | Implementation stays on qa-revamped-galvicare-0-5. Production remains main. No work branch and no new workaround branch.                                                                                                    |
| P0           | Protect GalviCare                              | Do not rewrite public GalviCare screens, payment, telemetry, CRM, Calendly, or unrelated workflows to make historical continuity work.                                                                                      |
| P0           | Preserve Worker + D1 authority                 | All historical imports and continuity resolution execute through the Worker/domain service boundary. No direct Production SQL import.                                                                                       |
| P0           | Identity before history                        | A historical record is imported only after deterministic founder identity and venture context are resolved or explicitly quarantined.                                                                                       |
| P0           | No founder self-service record access          | FHR/BHR is internal clinical/intelligence context. Do not add customer login, customer record retrieval, or a public BHR/FHR API.                                                                                           |
| P0           | No physical FHR→BHR merge                      | Same founder + same venture resolves the same BMR. Same founder + new venture gets a new BMR; historical founder context may be referenced internally but BMRs are not merged.                                              |
| P0           | Historical interpretation is not current truth | GalviShot assessments become source evidence + historical observations. Do not silently import them as active current findings, recommendations, or treatments.                                                             |
| P1           | Aidan is intelligence-reference only           | Do not create a canonical Aidan Founder/Venture/BMR profile in Day 9. Use validated Aidan-specific GalviShot 3.0 content only as a governed learning/intelligence reference; quarantine contaminated Harry/Duplex material. |
| P1           | Evidence decides completion                    | Automated tests, import reconciliation, D1 assertions, authorization negatives, Day 8 regression, GalviCare regression, and Human E2E determine pass/fail.                                                                  |

## Source Authority and Day 9 Scope Decision

- The GalviVault P0 Version 0.5 guide remains authoritative for canonical identity, one-BMR-per-venture ownership, Worker/D1 boundaries, evidence immutability, record-class separation, import reconciliation, governance, QA, rollback, and future AI constraints.

- The Day 8 Builder is the immediate operational handoff. Day 9 may extend the Day 8 clinician chart and operator projection but may not weaken or replace Day 8 authentication, chart authorization, or GalviCare regression safeguards.

- The Product Owner has authorized BHR as the customer-facing term while retaining the current canonical internal BMR aggregate and has explicitly selected the minimal launch path: GalviCare/GalviEngine may use historical context internally, but founders do not receive FHR/BHR self-service access.

- The Product Owner supplied HubSpot contact evidence for seven historical founders. The exact emails are controlled migration input and must not be committed to a public/shared repository, test fixture, log, screenshot evidence package, or browser bundle.

- Aidan de Grandpre is excluded from the canonical historical founder backfill. His GalviShot 3.0 is permitted only as a governed Founder Intelligence reference source and must be sanitized against known mixed-source contamination before any learning candidate is created.

## Day 9 Definition of Done

☐ Day 8 Build Final is re-verified on one exact commit/deployment/schema baseline; QA is synchronized to that baseline before Day 9 changes.

☐ A Day 9 repository diff plan exists and confirms no unrelated GalviCare or Day 8 clinical workflow rewrite.

☐ A secure, untracked historical-founder identity input mechanism exists; real founder emails are never committed to Git or copied into automated fixtures.

☐ Each source-ready historical founder is resolved or created as one stable founder_id, one stable venture_id, one founder_venture_role, and exactly one BMR for that venture.

☐ Each imported pre-GalviCare FCD/GalviShot episode is represented as a historical assessment session linked to the correct founder, venture, and BMR.

☐ The original historical artifact is represented as source/file-reference evidence with checksum/provenance; structured Founder Snapshot / Genome fields are stored as historical observations linked to source evidence.

☐ No Day 9 historical import silently creates current findings, active recommendations, treatment plans, or outcomes.

☐ Import replay is idempotent; duplicate founder/BMR/session/evidence is not created and batch counts reconcile.

☐ Ambiguous or missing source/identity rows are quarantined or skipped with explicit reconciliation; no invented venture, date, evidence, or profile field is forced into canonical tables.

☐ A returning synthetic founder entering the GalviCare continuity path resolves the existing founder_id + venture_id + bmr_id and creates a new GalviCare session_id rather than a second BMR.

☐ A same-founder/new-venture scenario creates a new venture/BMR and does not merge the prior venture record.

☐ Day 8 clinician chart can display a clearly labeled Historical Founder Context / FHR section sourced from Worker projections, with provenance and as-of dates.

☐ GalviEngine-ready Founder Intelligence Context can be composed server-side from approved current + historical records without exposing raw FHR/BHR to the public client.

☐ A public/unauthenticated caller cannot retrieve historical FHR/BHR, operator history, source narrative, or internal Founder Intelligence Context.

☐ Aidan produces no canonical Day 9 Founder/Venture/BMR backfill record; validated Aidan-specific patterns may create a proposed learning candidate only, with contaminated sections excluded/quarantined.

☐ All Day 1-Day 8 GalviVault regression and public GalviCare regression remain green; mandatory skipped tests = 0.

☐ QA Human E2E and D1 proof pass with no undocumented repair; Production backfill, if executed, is controlled, reconciled, and separately evidenced.

## Day 9 Execution Map

| **Section** | **Execution block**                                                     |
|-------------|-------------------------------------------------------------------------|
| 1           | Mission, terminology, approved extension, and scope guardrails          |
| 2           | Day 8 entry gate and baseline fingerprint                               |
| 3           | Day 9 architecture: FHR projection, BHR naming, BMR canonical authority |
| 4           | Historical founder identity manifest and source provenance              |
| 5           | Critical-path Day 9 build sequence                                      |
| 6           | Phase 0 — synchronize QA to Day 8 final baseline                        |
| 7           | Phase 1 — repository/schema/import inventory and minimal-change plan    |
| 8           | Phase 2 — secure identity/source input and normalization                |
| 9           | Phase 3 — historical FCD/GalviShot import service path                  |
| 10          | Phase 4 — FHR structured observation build                              |
| 11          | Phase 5 — returning-founder FHR-to-BHR continuity resolver              |
| 12          | Phase 6 — Founder Intelligence Context service/projection               |
| 13          | Phase 7 — Aidan intelligence-reference / learning-candidate path        |
| 14          | Phase 8 — Day 8 clinician chart + timeline integration                  |
| 15          | Phase 9 — customer-access negative controls, privacy, and logging       |
| 16          | Phase 10 — automated QA and full regression                             |
| 17          | Phase 11 — QA Human E2E                                                 |
| 18          | Phase 12 — Production historical backfill / reconciliation              |
| 19          | Phase 13 — D1 proof, evidence package, GO/STOP decision                 |
| A           | Controlled identity crosswalk                                           |
| B           | FHR normalized projection contract                                      |
| C           | Import command and file/source contract                                 |
| D           | Founder Intelligence Context contract                                   |
| E           | Day 9 automated test catalog                                            |
| F           | Human E2E runbook                                                       |
| G           | D1 assertion catalog                                                    |
| H           | Rollback/deactivation and data-correction runbook                       |
| I           | Codex final implementation report template                              |
| J           | One-page Day 9 completion checklist                                     |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FASTEST SAFE PATH</strong></p>
<p>Verify Day 8 final → inventory existing import/evidence/observation services → build secure untracked identity manifest → build one synthetic historical import fixture → prove idempotent canonical import → add read-only FHR projection → prove returning-founder same-BMR continuity → add internal Founder Intelligence Context → wire historical context into Day 8 clinician chart → run Day 1-Day 8 + GalviCare regression → QA Human E2E → controlled Production backfill → D1 reconciliation.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Day 9 Mission, Terminology & Scope Guardrails

| **Day 9 dimension**           | **Binding outcome**                                                                                                                                                                                               |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Primary outcome               | Pre-GalviCare founder history becomes governed, longitudinal GalviVault memory and can be used internally when the same founder later begins GalviCare.                                                           |
| Customer-facing product term  | Business Health Record (BHR). This is naming/presentation terminology; it does not create a second persistence aggregate.                                                                                         |
| Canonical technical aggregate | Business Medical Record (BMR) remains the internal D1/Worker aggregate and stable venture-level record root.                                                                                                      |
| Founder Health Record (FHR)   | An internal founder-history/intelligence projection assembled from historical sessions, source evidence, historical observations, and provenance. It is not a separate writable database or public record portal. |
| Returning-founder behavior    | Same founder + same venture → same founder_id/venture_id/bmr_id; new GalviCare session only.                                                                                                                      |
| Multi-venture behavior        | Same founder + new venture → same founder_id; new venture_id and BMR. Do not merge BMRs. Cross-venture founder context, if used, is read-only/provenance-bearing internal intelligence.                           |
| Founder access                | No founder/customer self-service FHR/BHR view, export, login, recovery, or public API in Day 9 or GalviCare MVP 1.0.                                                                                              |
| AI posture                    | Day 9 prepares governed structured context; it does not enable autonomous AI decisions, vector search, model training, or automatic rule promotion.                                                               |
| Release posture               | QA first with synthetic/pseudonymous fixtures. Real historical founder data stays out of QA unless separately authorized; Production backfill occurs only after QA/Human gates.                                   |

## 1.1 Locked inherited invariants

- Cloudflare Worker remains the sole runtime write authority; browser, scripts, adapters, future AI, and clinician UI do not write D1 directly.

- Cloudflare D1 remains the sole writable canonical persistence authority for Founder, Venture, BMR, sessions, evidence, reasoning, care, governance, import, and audit.

- Exactly one BMR exists per venture. A retry, import replay, returning founder, Day 8 chart refresh, or GalviCare session cannot create a second BMR for the same venture.

- Accepted evidence is immutable. Historical correction creates a new version/supersession or a governed relationship; no in-place rewrite.

- Evidence, observations, hypotheses, findings, recommendations, treatments, outcomes, feedback, learning candidates, events, and audit remain separate record classes.

- QA and Production remain isolated. Real founder data should not be copied into QA merely to prove Day 9.

- Imports are validation-first, idempotent, quarantinable, reconciled, and executed through domain services rather than direct Production SQL.

- Future AI output remains a proposal, not truth. Day 9 Founder Intelligence Context is read-only input and cannot itself mutate canonical state.

- Customer-facing/public callers never receive operator-only history, raw historical source narrative, clinician notes, audit detail, internal rationale, or cross-founder search.

## 1.2 Explicit Day 9 in-scope / out-of-scope matrix

| **Capability**                     | **Day 9 requirement**                                                                                                             | **Not allowed**                                                                                     |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Historical identity crosswalk      | Use Product Owner-confirmed founder emails as initial resolution keys through secure input.                                       | Committing real emails to Git or treating email as immutable founder_id.                            |
| Historical FCD/GalviShot ingestion | Create/reuse Founder/Venture/BMR, historical assessment session, source evidence, structured observations, import/audit evidence. | Universal file upload, OCR pipeline, arbitrary document ingestion, or data warehouse.               |
| FHR projection                     | Compose founder history from canonical records; version/provenance-aware.                                                         | New independent FHR database/table that becomes a second source of truth.                           |
| BHR integration                    | BHR is customer-facing term for the longitudinal BMR-backed record; continuity uses same BMR.                                     | Physical merge/copy of BMRs or duplicate customer record store.                                     |
| Returning founder                  | Resolve same email + same venture to existing IDs; new session only.                                                              | Creating a new BMR because GalviCare starts a new browser session.                                  |
| Founder Intelligence Context       | Server-side read-only projection for future GalviEngine and Day 8 clinician chart.                                                | Returning raw FHR context to the public browser or allowing AI to approve its own conclusions.      |
| Aidan reference                    | Validated Aidan-specific content may become a proposed learning candidate/intelligence reference.                                 | Creating Aidan canonical Founder/Venture/BMR profile or importing mixed Harry/Duplex contamination. |
| Day 8 chart                        | Add historical founder section/timeline rows through existing protected projection.                                               | Rebuilding clinician portal, auth, role model, or treatment workflows.                              |
| Customer access                    | None; prove negative controls.                                                                                                    | Founder portal, BHR download, customer search, cross-device account recovery, or public record API. |
| Production backfill                | Controlled batch after QA pass; reconcile counts and IDs.                                                                         | Bulk uncontrolled history load, direct SQL, silent coercion, or deleting valid imports ad hoc.      |

# 2. Day 8 Entry Gate & Baseline Fingerprint

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 9 ENTRY GATE — STOP UNLESS ALL ARE TRUE</strong></p>
<p>Day 8 must be evidenced as Build Final on one exact code/deployment/schema/auth baseline. Day 9 is not allowed to repair an unknown Day 8 release while simultaneously introducing historical identity/data. If Day 8 authentication, chart authorization, D1 binding, or GalviCare regression is unresolved, stop and restore the Day 8 baseline first.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Check**              | **Required starting state**                     | **Codex evidence**                  |
|------------------------|-------------------------------------------------|-------------------------------------|
| Repository             | mrgalvipro/galvitriage                          | git remote -v / repository identity |
| QA branch              | qa-revamped-galvicare-0-5                       | git branch --show-current           |
| Production branch      | main                                            | remote main HEAD                    |
| Forbidden branch       | No work / no new workaround branch              | branch inventory                    |
| Day 8 result           | DAY 8 HUMAN E2E PASS / Build Final              | Day 8 final evidence package        |
| Day 8 clinician portal | Known-good auth/search/chart/session workflow   | deployment URL + smoke evidence     |
| Production Worker      | One exact released deployment                   | release/deployment ID               |
| Production D1          | Known schema_migrations and one-BMR integrity   | read-only ledger/assertions         |
| QA baseline            | Synchronized to Day 8 final code before edits   | merge-base/diff evidence            |
| Rollback               | Prior safe Day 8 deployment/config known        | rollback manifest                   |
| GalviCare baseline     | Public flow known-good before Day 9             | regression smoke                    |
| Open defects           | No blocking Day 8 identity/security/data defect | defect register                     |

## 2.1 First Codex actions — fingerprint before touching files

1\. Confirm repository and branch. If current branch is work, main, or any unapproved branch, STOP. Do not create another branch.

2\. Capture git status, current SHA, origin/main SHA, Day 8 final SHA, package-lock checksum, migration inventory, workflow inventory, Worker config identity, and Day 8 clinician UI deployment identity.

3\. Open the Day 8 evidence package and identify the exact final Worker deployment, Production D1 schema version, auth mechanism, clinician portal deployment, rollback target, and final Human E2E result.

4\. Determine whether qa-revamped-galvicare-0-5 contains the exact released Day 8 baseline. Synchronize through the approved Git operation if necessary and record before/after refs.

5\. Run Day 8 known-good clinician login/search/chart read smoke and public GalviCare smoke before any Day 9 code change.

6\. Inventory current Founder/Venture/BMR/session/import/evidence/observation services, routes, repositories, tables, tests, and any source metadata conventions already used.

7\. Inventory Day 8 clinician chart projection and timeline composition. Identify the smallest additive point to surface historical FHR context.

8\. Write a Day 9 diff plan naming every file expected to change/add and an explicit DO NOT MODIFY list.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>git status --short<br />
git branch --show-current<br />
git rev-parse HEAD<br />
git rev-parse origin/main<br />
git log -1 --oneline<br />
git remote -v<br />
git diff --name-status origin/main...HEAD<br />
# inspect package.json, wrangler config, migrations, worker/services, worker/routes,<br />
# Day 8 clinician portal/projection, import service, evidence/observation repositories,<br />
# and Day 8/Day 1-7 workflows before editing.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 3. Day 9 Architecture — FHR Projection, BHR Naming, BMR Authority

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>LOCKED DAY 9 EXECUTION PATH</strong></p>
<p>Historical FCD/GalviShot source + controlled identity input → validated import request → Worker authorization/import scope → canonical Founder/Venture/BMR resolution → historical assessment session → source evidence → historical observations → audit/event/import reconciliation → protected FHR projection → internal Founder Intelligence Context → future GalviEngine / Day 8 clinician chart. No direct SQL, no public FHR/BHR retrieval, and no second database.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 3.1 Record semantics

| **Term**                       | **Meaning in Day 9**                                                                                                 | **Persistence rule**                                                             |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| BMR                            | Internal canonical venture-level aggregate already implemented in GalviVault.                                        | One BMR per venture; stable bmr_id.                                              |
| BHR                            | Customer-facing/marketing name aligned to continuous, evidence-informed Digital Business Healthcare.                 | A view/name over BMR-backed longitudinal care; not a second table/database.      |
| FHR                            | Internal founder-history/intelligence projection from pre-GalviCare and later founder-related evidence/observations. | Composed from canonical records; do not persist as one mutable report blob.      |
| Historical FCD session         | Bounded pre-GalviCare interaction episode tied to source date/provenance.                                            | assessment_sessions row linked to correct founder/venture/BMR.                   |
| Historical GalviShot artifact  | Facilitator-generated assessment/deliverable used as source material.                                                | file-reference/text evidence + checksum/provenance; accepted evidence immutable. |
| Historical founder observation | Structured interpretation such as archetype/stage/trajectory/motivation from source artifact.                        | observation linked to supporting evidence; source/as-of time explicit.           |
| Founder Intelligence Context   | Bounded server-side projection combining historical + current governed context for future decision support.          | Read-only composition; public client does not receive raw context.               |
| Learning candidate             | Governed proposal that a validated pattern may inform future rules/content.                                          | Status proposed/under_review/etc.; never auto-promotes runtime.                  |

## 3.2 FHR is a projection, not a new aggregate

Codex must not add a new canonical FHR table merely because the product language uses “Founder Health Record.” The current P0 model already provides the required durable components: Founder identity, Venture, one BMR, assessment sessions, immutable evidence, versioned observations, journey events, import batches, audit, learning candidates, and knowledge items. Day 9 should compose these records into an FHR-shaped read model.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Founder (founder_id)<br />
└─ FounderVentureRole<br />
└─ Venture (venture_id)<br />
└─ BusinessMedicalRecord / BHR backing aggregate (bmr_id)<br />
├─ AssessmentSession: historical FCD / future GalviCare episodes<br />
├─ Evidence: source artifact + structured extracts<br />
├─ Observations: historical Founder Snapshot / Genome<br />
├─ Current reasoning/care: existing GalviVault records<br />
├─ JourneyEvents / Audit<br />
└─ FHR projection (read model only)<br />
└─ FounderIntelligenceContext (internal only)</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 3.3 Continuity decision matrix

| **Incoming situation**                                                       | **Required identity outcome**                                                      | **FHR/BHR behavior**                                                                                                                               |
|------------------------------------------------------------------------------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Same normalized email + same venture                                         | Resolve existing founder_id + venture_id + bmr_id.                                 | Create new GalviCare session only; historical FHR remains in same longitudinal BHR.                                                                |
| Same normalized email + venture name/stage changed but clearly same business | Same founder_id + venture_id + bmr_id; audited venture profile update if required. | Do not create second BMR because display/profile fields changed.                                                                                   |
| Same founder + genuinely new venture                                         | Same founder_id; new venture_id + new BMR + new session.                           | Do not merge prior BMR. Internal Founder Intelligence Context may reference prior founder history with explicit source BMRs only if policy allows. |
| Same email + ambiguous venture identity                                      | Do not guess or merge.                                                             | Return safe conflict / require deterministic venture resolution; quarantine import or continue as unlinked until resolved.                         |
| Email differs but other identity hints match                                 | Do not name-match into canonical continuity automatically.                         | Use approved identity correction/reconciliation process; email is lookup, not immutable ID.                                                        |
| Unknown founder                                                              | Create new founder/venture/BMR/session through existing Day 2 services.            | No historical FHR context.                                                                                                                         |

# 4. Historical Founder Identity Manifest & Source Provenance

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CONTROLLED DATA — DO NOT COMMIT TO GIT</strong></p>
<p>The Product Owner supplied exact historical founder emails as identity evidence. This Git-safe Markdown version intentionally replaces those values with secure-input placeholders. Populate the real values only in a local/untracked or secret-backed Day 9 import manifest. Do not copy real values into public test fixtures, browser code, console output, GitHub Actions logs, release screenshots, or committed JSON/MD files.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Founder**          | **Verified email input** | **Known venture context**                                                              | **Source status**                                               | **Day 9 disposition**                                                              |
|----------------------|--------------------------|----------------------------------------------------------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------------------------------|
| Harry Akligoh        | ${DAY9_FHR_EMAIL_HARRY_AKLIGOH}   | Duplex Bioscience                                                                      | GalviShot 4.0 source available                                  | Canonical FHR backfill candidate                                                   |
| Gilles Loïc Djayep   | ${DAY9_FHR_EMAIL_GILLES_DJAYEP} | Decision Engine                                                                        | GalviShot 4.0 source available                                  | Canonical FHR backfill candidate                                                   |
| Ahmet Kilic          | ${DAY9_FHR_EMAIL_AHMET_KILIC}    | AI-enabled remote post-surgical monitoring / hospital-integrated recovery intelligence | GalviShot 4.0 source previously supplied                        | Canonical FHR backfill candidate                                                   |
| Naima Bogran         | ${DAY9_FHR_EMAIL_NAIMA_BOGRAN} | Field IQ                                                                               | GalviShot 4.0 source available                                  | Canonical FHR backfill candidate                                                   |
| Danielle S Petterson | ${DAY9_FHR_EMAIL_DANIELLE_PETTERSON}   | S.A.J. Gin                                                                             | GalviShot 4.0 source available                                  | Canonical FHR backfill candidate                                                   |
| Nnenna Ukwu          | ${DAY9_FHR_EMAIL_NNENNA_UKWU} | Founder Ecosystem Development / Founder Infrastructure Methodology                     | GalviShot 4.0 source available                                  | Canonical FHR backfill candidate                                                   |
| Dayo Ogundipe        | ${DAY9_FHR_EMAIL_DAYO_OGUNDIPE}       | SOURCE/VENTURE TO RESOLVE                                                              | Contact identity confirmed; source artifact must be inventoried | Do not invent missing source data; reconcile/skip/quarantine until source is found |

## 4.1 Identity evidence handling rules

- Use normalized lowercase trimmed email for initial founder lookup exactly as the existing founder-service supports; the permanent identity remains founder_id.

- Display-name variation is not a new founder. Example: “Danielle S Petterson” versus “Danielle Petterson,” or “Gilles Loic Djayep” versus “Gilles Loïc Djayep,” must be resolved through the same canonical founder if the verified email matches.

- Meeting history can help establish provenance dates but must not be used to guess which meeting produced a GalviShot when multiple meetings exist. Prefer the source artifact date or approved FCD record.

- Do not infer a venture solely from the email domain. Venture identity comes from the approved FCD/GalviShot source or another authoritative founder record.

- Every import row must identify the source artifact and source checksum. If a source artifact is missing, the row is not allowed to generate empty or invented historical observations.

- Real emails belong only in the controlled import input and the canonical founder contact context; release evidence should use opaque IDs or redacted aliases.

## 4.2 Recommended secure input shape

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># NEVER commit the real file. Keep it local/untracked or secret-backed.<br />
# Example path: .local/day9-founder-identity-input.json<br />
{<br />
"manifest_version": "day9-fhr-identity-v1",<br />
"founders": [<br />
{<br />
"source_row_key": "hist_&lt;opaque&gt;",<br />
"display_name": "&lt;founder&gt;",<br />
"email": "&lt;secure-input&gt;",<br />
"venture_name": "&lt;approved source value&gt;",<br />
"source_artifact": "&lt;private file/reference&gt;",<br />
"source_artifact_version": "GalviShot 4.0",<br />
"source_event_at": "&lt;ISO date if proven&gt;",<br />
"import_disposition": "canonical_fhr_backfill"<br />
}<br />
]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Repository rule: commit only a synthetic example manifest such as data/day9/fhr-identity-manifest.example.json. Real values are supplied at execution time through a non-committed file, environment-mounted artifact, or equivalent secure operator-controlled input.

# 5. Critical-Path Day 9 Build Sequence

| **Order** | **Gate**             | **Primary action**                                                                                          | **Exit condition**                                                                        |
|-----------|----------------------|-------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| 0         | Entry                | Prove Day 8 Build Final; synchronize QA.                                                                    | Exact stable baseline or STOP.                                                            |
| 1         | Inventory            | Discover current import/evidence/observation/identity/chart code and schema.                                | Minimal Day 9 diff plan approved.                                                         |
| 2         | Secure inputs        | Create untracked identity/source manifest contract and synthetic fixtures.                                  | No real PII in Git; source-ready rows deterministic.                                      |
| 3         | Historical import    | Use existing import-service/domain services to create/resolve identity/BMR/session and source evidence.     | One synthetic historical FCD imports with no duplicate or direct SQL.                     |
| 4         | FHR normalization    | Transform Founder Snapshot/Genome/history into historical observations linked to source evidence.           | Structured provenance-bearing FHR context exists; no current finding/treatment pollution. |
| 5         | Continuity           | Wire returning-founder resolution so same founder/venture keeps same BMR and creates new GalviCare session. | Stable IDs; no duplicate BMR.                                                             |
| 6         | Intelligence context | Compose server-side Founder Intelligence Context with current + historical source refs.                     | Internal read works; public read denied/not exposed.                                      |
| 7         | Aidan reference      | Create sanitized proposed learning candidate only; no canonical profile.                                    | No Aidan BMR; contaminated content excluded.                                              |
| 8         | Clinician chart      | Add read-only historical founder context/timeline to Day 8 protected chart.                                 | Clinician sees provenance; existing care actions unaffected.                              |
| 9         | Privacy/security     | Verify no customer self-service access, PII logs, cross-founder leakage, or browser historical payload.     | Negative matrix passes.                                                                   |
| 10        | Regression           | Run Day 9 + full GalviVault + Day 8 + public GalviCare regression.                                          | failed=0; mandatory skipped=0.                                                            |
| 11        | QA E2E               | Run synthetic historical import + returning founder continuity + clinician review.                          | Human E2E PASS with D1 proof.                                                             |
| 12        | Production backfill  | Run controlled real-founder batch after approval; reconcile every row.                                      | No silent rows; valid IDs captured; source-missing rows explicit.                         |
| 13        | Evidence             | Package D1/import/security/regression/rollback evidence and decide GO/STOP.                                 | Day 9 PASS or documented STOP.                                                            |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FAIL-FAST ORDER</strong></p>
<p>Wrong branch → unknown Day 8 baseline → wrong D1 binding → real PII committed/logged → ambiguous identity auto-merged → duplicate founder/BMR → cross-BMR evidence link → accepted evidence mutation → historical observation promoted to current finding/treatment → customer historical-record exposure → import counts do not reconcile → Day 8 clinician regression → public GalviCare regression. Any of these is an immediate STOP.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 6. Phase 0 — Synchronize QA to Day 8 Final Baseline

1\. Record the exact Day 8 final SHA, Worker deployment, clinician portal deployment, auth configuration identity, Production D1 schema, and rollback deployment.

2\. Compare qa-revamped-galvicare-0-5 with that released baseline. Do not assume QA is already synchronized.

3\. If QA is behind, use the approved merge/fast-forward method. If it contains divergent unrelated changes, classify them before proceeding; do not carry them silently.

4\. Run read-only health/readiness/schema checks and Day 8 clinician login/search/chart smoke against the baseline.

5\. Run the known-good public GalviCare smoke before Day 9 implementation and store it as the pre-change comparison.

6\. Freeze the Day 9 starting SHA. All later diff review uses this baseline.

## 6.1 Phase 0 STOP conditions

- Day 8 evidence cannot identify one exact release baseline.

- QA cannot be synchronized without unexplained unrelated changes.

- Day 8 clinician auth/search/chart is already failing before Day 9.

- Public GalviCare is already failing before Day 9.

- Current Worker/D1 binding is ambiguous or schema ledger differs from released evidence.

- Any existing critical identity duplication, cross-founder leakage, or accepted-evidence mutation defect is open.

# 7. Phase 1 — Repository, Schema, Import & Projection Inventory

Codex must inspect actual repository paths before creating new ones. Reuse existing modules whenever they satisfy the Day 9 contract. The paths below are recommendations only if repository equivalents do not already exist.

| **Recommended path**                            | **Purpose**                                                                | **Rule**                                                                |
|-------------------------------------------------|----------------------------------------------------------------------------|-------------------------------------------------------------------------|
| worker/services/import-service.js               | Existing createBatch/validateRow/importRow/closeBatch authority.           | Reuse; do not create parallel importer.                                 |
| worker/services/founder-service.js              | Create/resolve founder identity.                                           | Reuse normalized email + stable founder_id logic.                       |
| worker/services/venture-service.js              | Create/resolve venture + founder role.                                     | Reuse stable venture identity rules.                                    |
| worker/services/bmr-service.js                  | Create/get BMR + timeline.                                                 | Reuse one-BMR-per-venture service.                                      |
| worker/services/session-service.js              | Create/resume historical and GalviCare sessions.                           | Reuse canonical session ownership.                                      |
| worker/services/evidence-service.js             | Submit/accept historical artifact/extract evidence.                        | Reuse immutability/version rules.                                       |
| worker/services/reasoning-service.js            | Create historical observations where supported.                            | Historical observation only; no silent finding promotion.               |
| worker/services/founder-intelligence-service.js | NEW only if no equivalent: read-only FHR/Founder Intelligence composition. | No writes; source/version/provenance required.                          |
| worker/routes/operator-workspace.js             | Day 8 chart projection.                                                    | Add historical section only if needed; protected route stays protected. |
| scripts/day9-fhr-backfill.mjs                   | Controlled import driver/dry-run wrapper.                                  | Calls Worker/import API/service; no direct Production SQL.              |
| data/day9/fhr-identity-manifest.example.json    | Synthetic committed example input.                                         | No real PII.                                                            |
| tests/day9-fhr-bhr-integration.test.mjs         | Day 9 identity/import/continuity/security tests.                           | Mandatory; fail non-zero.                                               |
| scripts/day9-human-e2e.mjs                      | Optional bounded QA helper.                                                | No direct D1 mutation; evidence only.                                   |
| .github/workflows/galvivault-day9-qa.yml        | Day 9-only workflow if generic workflow cannot execute tests.              | Do not edit unrelated GalviCare workflows just to run Day 9.            |

## 7.1 Schema sufficiency gate

The existing P0 schema is expected to be sufficient: founders, ventures, founder_venture_roles, business_medical_records, assessment_sessions, evidence_items, observations, support links, journey_events, audit_log, import_batches/import_errors, learning_candidates, and knowledge_items already exist. Day 9 should prefer zero schema migration.

- Do not add an FHR table just to store a report-shaped JSON blob.

- Do not add a BHR table solely to support customer-facing naming.

- Add a migration only if repository reality proves a required index/field is absent and existing metadata/source fields cannot represent the Day 9 requirement safely.

- Any migration must be additive, forward-only, tested against Day 8 rollback compatibility, and separately evidenced.

## 7.2 Explicit DO NOT MODIFY unless exact blocker proves necessary

- Public GalviCare GalviTriage/GalviVitals/GalviScore/GalviShot/GalviSight/GalviPath screens and customer routing.

- Stripe, HubSpot, GA4, Clarity, Calendly, Day7b readiness, broad QA stabilization, or other known-good GalviCare workflow files.

- Applied Day 1-Day 8 migrations or schema_migrations history.

- Day 8 authentication mechanism, operator role semantics, logout/session hardening, or clinical write routes unless an exact Day 9 regression proves a targeted compatibility fix.

- P0 domain services solely for cleanup, renaming, style, or speculative refactor.

- main branch directly during Day 9 implementation.

# 8. Phase 2 — Secure Identity/Source Input & Normalization

## 8.1 Required row validation

| **Field**                | **Requirement**                                                   | **Failure disposition**                                                                               |
|--------------------------|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| source_row_key           | Stable non-PII row identifier; repeatable across replay.          | Reject/quarantine if missing or reused with changed meaning.                                          |
| display_name             | Source display only; never primary identity.                      | May differ from CRM/GalviShot; do not create duplicate solely on spelling.                            |
| email                    | Normalize lower/trim; secure input; lookup only.                  | Missing may be allowed only if another approved canonical identity is supplied; otherwise quarantine. |
| venture_name             | Must come from approved source/context.                           | Missing/ambiguous → no BMR import; quarantine/skip.                                                   |
| source_artifact          | Private file/reference must be available for FHR build.           | Missing → skip/quarantine; never create empty FHR.                                                    |
| source_artifact_checksum | SHA-256 or repository-approved content hash.                      | Mismatch after prior import → conflict/review.                                                        |
| source_artifact_version  | GalviShot 3.0/4.0 or approved FCD version.                        | Unknown allowed only if explicitly represented as unknown; do not invent.                             |
| source_event_at          | Original FCD/GalviShot date when proven.                          | If unknown, preserve unknown; use import timestamp separately.                                        |
| consent/source policy    | Use existing approved contact/consent handling.                   | Do not infer legal consent from screenshot alone.                                                     |
| disposition              | canonical_fhr_backfill / intelligence_reference / source_pending. | Unknown disposition → stop row.                                                                       |

## 8.2 Dry-run first

1\. Parse secure manifest and source artifacts without mutating canonical data.

2\. Normalize email and source metadata; compute artifact checksum.

3\. Resolve whether founder already exists and whether venture/BMR already exists.

4\. Detect duplicate source artifacts already imported by checksum/source_ref.

5\. Validate expected mapping fields and size limits.

6\. Return a dry-run plan: create founder? create venture? existing BMR? new historical session? evidence count? observation count? quarantine reason?

7\. Require operator approval before real import when dry-run reveals an identity/venture conflict.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># Recommended command interface; adapt to repository scripts.<br />
npm run day9:import:dry-run -- --input &lt;secure-untracked-manifest&gt;<br />
# Output must redact email and source narrative. Use canonical IDs / row keys / counts.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 9. Phase 3 — Historical FCD / GalviShot Canonical Import

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>IMPORT RULE</strong></p>
<p>Day 9 is a targeted governed backfill, not a generic document-ingestion platform. Every valid historical founder row must pass through the same domain services and import reconciliation already required by GalviVault.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 9.1 Import batch contract

1\. Create one import_batch for the Day 9 historical backfill with source_type such as historical_fcd_galvishot, source_name/version, source checksum where applicable, environment, expected_count, and authorized created_by.

2\. Set batch status through validating/importing/completed or completed_with_errors according to the existing service contract.

3\. For each source row, use import_batch_id + source_row_key as the idempotent replay identity.

4\. Resolve/create Founder through founder-service. Normalize email; preserve any existing founder_id.

5\. Resolve/create Venture through venture-service using approved venture source context. Do not overwrite venture identity based on a GalviShot display name without version/audit rules.

6\. Create or get the canonical BMR through bmr-service. If a BMR already exists for the venture, return it.

7\. Create one historical assessment session for the FCD/GalviShot episode. Reuse an existing exact historical session if the source artifact/session was already imported; replay must not create another.

8\. Submit the historical artifact reference/content extract as evidence with source_type/source_ref, checksum, actor/import context, captured_at/source date when known, BMR/session linkage, and status under existing evidence policy.

9\. Create structured historical observations from validated assessment fields and link each observation to supporting source evidence.

10\. Emit the appropriate journey event/audit/import result. Do not generate current care state from import alone.

11\. Write invalid/ambiguous rows to import_errors with safe reason and bounded quarantined metadata; do not put full sensitive source documents into release evidence.

12\. Close/reconcile the batch only when processed = imported + skipped + errors and every expected row has a disposition.

## 9.2 Historical session semantics

| **Attribute**                    | **Required Day 9 behavior**                                                                                                                                                                                       |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| source                           | Use existing source field with a repository-approved historical FCD/GalviShot value; if current enum/constants do not contain it, add the smallest additive constant/metadata mapping without changing ownership. |
| current_stage                    | Represent historical FCD/GalviShot episode using an existing compatible stage or metadata field. Do not introduce a new BMR lifecycle state solely for history.                                                   |
| status                           | Historical session may be completed/closed according to existing session status contract.                                                                                                                         |
| started/completed timestamps     | Use source event dates only when proven; import time remains separate.                                                                                                                                            |
| founder_id / venture_id / bmr_id | All must resolve to the same canonical context.                                                                                                                                                                   |
| client_session_key               | If required, generate deterministic import-safe key; do not reuse a browser key.                                                                                                                                  |
| audit actor                      | import_service / authorized operator, not the founder unless the source was actually founder-submitted through the platform.                                                                                      |

## 9.3 Source artifact representation

The P0 evidence model supports imported/file-reference material and does not require storing the original binary file bytes in D1. Day 9 should preserve a durable source reference + checksum and, where useful, bounded typed text/JSON extracts needed for retrieval and future intelligence. Raw private source files remain outside the public repo/browser.

| **Source component**                 | **Canonical representation**                                                                    | **Why**                                                                        |
|--------------------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| Whole GalviShot/FCD file             | Evidence item of file-reference/reference type with private source_ref + checksum.              | Proves provenance without turning the binary file into the database.           |
| What We See / Founder Story          | Bounded text evidence or source-referenced section extract if needed by future intelligence.    | Preserves narrative source without making it a finding.                        |
| Founder Snapshot                     | Historical observations with source link.                                                       | Structured reusable founder intelligence.                                      |
| Founder Performance Genome           | Historical observations per dimension or one structured observation group with explicit fields. | Enables deterministic comparison/personalization later.                        |
| Growth Opportunities / Priorities    | Historical observations, not active care recommendation unless separately governed.             | Prevents old coaching output from becoming current treatment truth.            |
| Recommended Next Step                | Historical observation/evidence tagged recommended_next_step_at_time.                           | Does not create an active recommendation requiring current finding linkage.    |
| Scores from older GalviShot versions | Historical measurement/observation only if definition/version is known.                         | Do not compare incompatible score definitions as if they were the same metric. |

# 10. Phase 4 — FHR Structured Observation Build

## 10.1 FHR v1 projection fields

The FHR projection must be tolerant of missing fields and must preserve the source/as-of state. It is a read model, not a new write model. The service should select the latest applicable historical non-superseded observation for each field while retaining source references.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"schema_version": "fhr-context-v1",<br />
"founder_id": "fdr_...",<br />
"venture_id": "ven_...",<br />
"bmr_id": "bmr_...",<br />
"context_as_of": "2026-..",<br />
"historical_sessions": [<br />
{<br />
"session_id": "ses_...",<br />
"source": "historical_fcd_galvishot",<br />
"source_artifact_version": "GalviShot 4.0",<br />
"source_event_at": "...",<br />
"imported_at": "...",<br />
"evidence_refs": ["evd_..."]<br />
}<br />
],<br />
"founder_snapshot": {<br />
"archetype": {"value":"...", "observation_id":"obs_...", "as_of":"..."},<br />
"founder_identity": {"value":"...", "observation_id":"obs_...", "as_of":"..."},<br />
"stage": {"value":"...", "observation_id":"obs_...", "as_of":"..."},<br />
"trajectory": {"value":"...", "observation_id":"obs_...", "as_of":"..."},<br />
"transition": {"value":"...", "observation_id":"obs_...", "as_of":"..."},<br />
"long_term_potential": {"value":"...", "observation_id":"obs_...", "as_of":"..."}<br />
},<br />
"genome": {<br />
"primary_motivation": {"value":"...", "source":["obs_..."]},<br />
"decision_style": {"value":"...", "source":["obs_..."]},<br />
"leadership_style": {"value":"...", "source":["obs_..."]},<br />
"learning_style": {"value":"...", "source":["obs_..."]},<br />
"communication_style": {"value":"...", "source":["obs_..."]},<br />
"risk_orientation": {"value":"...", "source":["obs_..."]},<br />
"founder_energy": {"value":"...", "source":["obs_..."]},<br />
"greatest_untapped_asset": {"value":"...", "source":["obs_..."]}<br />
},<br />
"historical_growth_opportunities": [],<br />
"historical_next_steps": [],<br />
"provenance": {<br />
"source_bmr_ids": ["bmr_..."],<br />
"source_artifact_checksums": ["sha256:..."],<br />
"generated_from_canonical_records": true<br />
}<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 10.2 Canonical mapping rules

- Every FHR field must trace to one or more evidence/observation IDs. Never return an untraceable generated value.

- Historical FHR fields remain time-bounded. They describe what was observed at the FCD/GalviShot date, not what is necessarily true now.

- If multiple historical sessions disagree, the FHR projection returns the latest version and may expose bounded history/contradiction flags internally; it does not silently delete prior values.

- Do not convert historical observations into current findings solely because the same field appears in a later GalviCare assessment.

- Do not merge founder context across ventures into the BMR. Cross-venture context, when enabled later, remains an internal founder-level projection with source BMR identifiers.

- Keep projection payload bounded. Full source narrative should be retrieved only by authorized operator/intelligence code that genuinely needs it.

## 10.3 Current known structured source examples

| **Founder**        | **Archetype**         | **Stage**                                | **Trajectory**        | **Primary motivation**                             | **Decision style**            |
|--------------------|-----------------------|------------------------------------------|-----------------------|----------------------------------------------------|-------------------------------|
| Harry Akligoh      | Scientific Visionary  | Research-Driven Founder                  | Accelerating          | Scientific Impact                                  | Evidence First                |
| Gilles Loïc Djayep | Decision Architect    | Decision Intelligence Founder            | Rapidly Accelerating  | Reducing Uncertainty                               | Evidence Seeking              |
| Naima Bogran       | Opportunity Architect | Emerging Founder                         | Rapidly Accelerating  | Growth                                             | Opportunity Seeking           |
| Danielle Petterson | Enterprise Builder    | Founder-Operator                         | Steadily Accelerating | Long-Term Independence                             | Operational                   |
| Nnenna Ukwu        | Integrative Builder   | Founder Discernment & Platform Formation | Emerging              | Human Development Through Organizational Alignment | Reflective & Systems-Oriented |

These values are examples of source-derived structured fields already present in supplied GalviShot 4.0 artifacts. Codex must still transform the actual approved source file/reference at import time and preserve source version/checksum. Ahmet and Dayo must follow the same contract using their approved source materials; do not fill missing fields from memory or name-based inference.

# 11. Phase 5 — Returning-Founder FHR to BHR Continuity Resolver

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CRITICAL CUSTOMER-JOURNEY BEHAVIOR</strong></p>
<p>A returning founder does not receive the FHR/BHR. The system recognizes the canonical identity server-side and uses that context to continue care. The public GalviCare client should not download the historical founder profile just because the email matches.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 11.1 Integration point

Use the existing GalviCare founder/session bootstrap or equivalent Worker entry. Do not redesign the public intake. Add the smallest server-side continuity hook necessary to call existing founder/venture/BMR resolution before a new GalviCare assessment session is established.

1\. Receive the normal GalviCare founder/venture identity input through the existing public journey contract.

2\. Normalize email and resolve/create Founder through existing founder-service.

3\. Resolve the venture through the existing venture-service using the current venture context supplied by the journey.

4\. Call createOrGetBmr(venture_id). If the historical backfill already created that venture BMR, return the existing bmr_id.

5\. Create a new GalviCare assessment session for the current journey. Never reuse the old historical FCD session as the active digital session.

6\. Internally flag continuity state as new / returning_same_venture / returning_new_venture / ambiguous.

7\. If returning_same_venture, permit internal Founder Intelligence Context composition against that bmr_id.

8\. If returning_new_venture, do not merge BMRs. Any founder-level historical context requires explicit internal cross-venture policy and must carry source BMR IDs.

9\. Return only the public-safe response required by the existing GalviCare journey. Do not return raw historical FHR observations/source narrative to the browser.

## 11.2 Continuity state contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>continuity = {<br />
"status": "new | returning_same_venture | returning_new_venture | ambiguous",<br />
"founder_id": "fdr_...", // if existing public contract already exposes opaque IDs<br />
"venture_id": "ven_...",<br />
"bmr_id": "bmr_...",<br />
"session_id": "ses_current",<br />
"historical_context_available": true<br />
}<br />
# historical_context_available is an internal/service fact.<br />
# Do not attach FHR content to the public browser response.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 11.3 Ambiguity behavior

- If email resolves but venture cannot be deterministically matched, do not attach the current session to an old BMR by name similarity alone.

- Return a safe, recoverable identity/venture resolution state or create a clearly new venture only when the submitted information actually represents a new venture.

- Do not allow a client-supplied bmr_id or founder_id to override server resolution.

- Any later manual reconciliation must be audited and preserve prior IDs/history.

# 12. Phase 6 — Founder Intelligence Context Service / Projection

Day 9 prepares the bridge into the upcoming GalviCare MVP 1.0 GalviEngine Decision Intelligence Architecture. The service is read-only and server-side. It can be implemented as a new service module only if no equivalent read composition exists.

## 12.1 Purpose

| **Question**                  | **Day 9 answer**                                                                                                                  |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| What happened?                | Historical FCD/GalviShot sessions, current GalviCare sessions, source evidence, journey events.                                   |
| Why might it be happening?    | Historical founder observations + current governed observations/findings with explicit provenance and confidence.                 |
| What should happen next?      | Day 9 does not autonomously decide. It provides context for deterministic/current rules and later governed GalviEngine proposals. |
| What is learned across cases? | Learning candidates only; no automatic runtime change.                                                                            |

## 12.2 Minimum service contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>composeFounderIntelligenceContext({<br />
actorContext, // internal service or authorized operator<br />
founderId,<br />
ventureId,<br />
bmrId,<br />
includeHistorical=true,<br />
includeCurrent=true,<br />
includeCare=true,<br />
maxEvidenceRefs=...<br />
}) -&gt; {<br />
context_version,<br />
founder_identity_ref,<br />
venture_ref,<br />
bmr_ref,<br />
continuity_status,<br />
historical_fhr,<br />
current_business_health,<br />
current_findings_summary,<br />
treatment_outcome_summary,<br />
evidence_refs,<br />
source_versions,<br />
contradictions_or_staleness,<br />
generated_at<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

- Service must reject public/unauthenticated actor context or never be exposed as a public route.

- All returned historical facts carry source/session/evidence IDs or safe source references.

- Current findings/treatments remain governed P0 records; historical observations cannot override them.

- Staleness is explicit: a 2026 FCD assessment is historical context, not current-state confirmation.

- Service is bounded and can omit full source narratives by default.

- Future AI consumers receive this structured context plus source refs; they do not get authority to mutate D1.

## 12.3 Closed-loop Founder Intelligence alignment

| **Decision Intelligence layer** | **Galvi Day 9 / MVP path**                                                                                                                 |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| Engagement layer                | FCD/GalviShot, GalviTriage, GalviVitals, GalviScore, GalviPath, GalviClinic notes, journey events, outcomes.                               |
| Intelligence layer              | GalviVault BMR/BHR + FHR historical observations + current evidence/findings/care + provenance.                                            |
| Action layer                    | Current deterministic rules now; later GalviEngine assisted next-best question / next-best journey / draft recommendation with governance. |
| Learning loop                   | Outcome/feedback and cross-case patterns create learning_candidates; approved knowledge/rule releases alone change runtime.                |

# 13. Phase 7 — Aidan GalviShot 3.0 Intelligence-Reference Path

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRODUCT OWNER DECISION</strong></p>
<p>Do not build Aidan de Grandpre as a Day 9 canonical historical founder profile. His GalviShot 3.0 may be used only to enrich the future Founder Intelligence corpus through governed learning/reference data.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 13.1 Known source-quality issue

The supplied Aidan GalviShot 3.0 contains valid Aidan-specific founder material (Adaptive Founder, experimentation/iteration, strong problem understanding, strong commercialization/GTM orientation, 7.8/10 Founder Readiness in the source), but later portions contain unrelated Harry/Duplex Bioscience/healthcare content. Day 9 must never ingest the mixed document wholesale as one canonical truth source.

## 13.2 Required handling

1\. Do not call createOrResolveFounder, createOrResolveVenture, or createOrGetBmr for Aidan as part of the Day 9 historical founder batch.

2\. Create a separate source review/import batch or controlled processing step with disposition intelligence_reference.

3\. Accept only sections that are unambiguously Aidan-specific. Exclude any passage that references Harry, Duplex Bioscience, Microbeads, AMR, hospitals, healthcare regulatory readiness, or other clearly foreign context.

4\. Record excluded segments as quarantined source-quality issues or a bounded source review artifact; do not silently discard the fact that the source was mixed.

5\. Create at most a proposed learning_candidate such as historical_founder_pattern_reference. source_bmr_ids_json remains null/empty because Day 9 creates no Aidan BMR.

6\. proposed_change_json may contain de-identified structured founder-pattern features and source-document checksum/reference, not a rule activation.

7\. Keep status=proposed unless a later Product Owner/Business Physician governance review explicitly approves/rejects it.

8\. Do not create an active knowledge_item or runtime rule solely because the source pattern appears plausible.

## 13.3 Validated Aidan-specific candidate features

| **Feature**                    | **Source-safe candidate value**                          | **Use**                                                         |
|--------------------------------|----------------------------------------------------------|-----------------------------------------------------------------|
| Founder archetype              | Adaptive Founder                                         | Pattern/reference only                                          |
| Founder orientation            | Identity-driven entrepreneurship / broad experimentation | Pattern/reference only                                          |
| Problem understanding          | Strong                                                   | Pattern/reference only                                          |
| Founder commitment             | Strong                                                   | Pattern/reference only                                          |
| Commercialization experience   | Strong                                                   | Pattern/reference only                                          |
| Go-to-market readiness         | Strong                                                   | Pattern/reference only                                          |
| Product development experience | Moderate                                                 | Pattern/reference only                                          |
| Fundraising readiness          | Early                                                    | Pattern/reference only                                          |
| Team-building readiness        | Developing                                               | Pattern/reference only                                          |
| Founder readiness score        | 7.8 / 10, source-version specific                        | Do not compare to later score models without definition mapping |

# 14. Phase 8 — Day 8 Clinician Chart & Timeline Integration

The clinician workspace is the authorized operational view for Day 9 verification. Add a bounded, read-only historical context section to the existing Day 8 Founder chart rather than creating a new application.

## 14.1 Required chart behavior

| **Chart area**    | **Day 9 addition**                                                                                             | **Guardrail**                                                                        |
|-------------------|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| BMR/BHR header    | Optional display label “Business Health Record (BHR)” while internal IDs remain BMR-backed.                    | Do not rename database tables/routes in a breaking migration for marketing language. |
| Founder context   | Historical FHR summary: archetype/identity/stage/trajectory/genome values with as-of date.                     | Clearly label Historical / FCD / GalviShot; do not imply current confirmation.       |
| Timeline          | Historical FCD/GalviShot session and import provenance appear chronologically before later GalviCare sessions. | Timeline reads Worker projection; browser cache is not source of truth.              |
| Source/provenance | Show artifact type/version, source date when known, evidence/observation references or safe summary.           | No raw private file path/token; no public access.                                    |
| Current care      | Existing Day 8 findings/recommendations/treatment/outcomes remain unchanged.                                   | Historical import must not trigger treatment state.                                  |
| Errors            | Safe error + correlation ID when historical projection fails.                                                  | Current chart should remain usable if optional historical section is unavailable.    |

## 14.2 Visual labeling rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>HISTORICAL ≠ CURRENT</strong></p>
<p>The clinician UI must visually distinguish “Historical Founder Context — FCD/GalviShot, as of &lt;date&gt;” from “Current Business Health / Current Findings / Current Treatment.” A prior GalviShot assessment can inform review but does not silently become a current confirmed finding.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 15. Phase 9 — Founder Access, Privacy, Security & Logging

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FOUNDER ACCESS POLICY</strong></p>
<p>There is no founder/customer FHR/BHR self-service capability in Day 9 or GalviCare MVP 1.0. GalviCare may use the record internally to personalize/continue the journey; the founder cannot open, search, export, or retrieve the clinical/intelligence record.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 15.1 Required negative controls

| **Control**                   | **Required proof**                                                                                                                                                           |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| No public FHR route           | Any guessed/public FHR/BHR record endpoint returns 404/401/403 per routing policy and no protected payload.                                                                  |
| No browser historical payload | Network response for public GalviCare bootstrap does not contain source narrative, genome details, clinician notes, audit history, or internal Founder Intelligence Context. |
| No email enumeration          | Public response must not reveal whether an arbitrary email has a historical record in a way that enables cross-founder enumeration beyond the intended journey behavior.     |
| No cross-founder retrieval    | Supplying another founder’s IDs/email/context cannot retrieve their BHR/FHR.                                                                                                 |
| No client-selected IDs        | Public client cannot force founder_id, venture_id, bmr_id, historical session ID, or source BMR.                                                                             |
| No PII in logs                | Real email/source text redacted from routine request/import logs and release evidence; use row key/correlation/canonical IDs.                                                |
| Protected clinician view      | Day 8 auth/role required for historical chart section.                                                                                                                       |
| Internal intelligence service | Only trusted service/operator actor may compose full Founder Intelligence Context.                                                                                           |
| Source file privacy           | Private GalviShot/FCD binaries remain outside public repo/browser; only approved references/extracts reach canonical storage.                                                |

## 15.2 QA data policy

- Automated Day 9 tests use synthetic founder emails, synthetic venture names, and synthetic source artifacts shaped like the real inputs.

- QA Human E2E uses a synthetic returning founder whose historical record is created by the Day 9 importer, then re-enters through the GalviCare continuity path.

- Do not copy the seven real founder records into QA merely to prove the build.

- Production historical backfill is a separately approved migration step after QA pass, with read-only post-import assertions and no first-time code behavior.

# 16. Phase 10 — Automated QA & Full Regression

## 16.1 Required scripts

| **Script / command**        | **Purpose**                                                   | **Rule**                                                 |
|-----------------------------|---------------------------------------------------------------|----------------------------------------------------------|
| verify:day9-files           | Required Day 9 paths/config/import fixture checks.            | Fail if real PII detected in committed Day 9 data/tests. |
| test:day9                   | Unit/service/repository/API/import/continuity/security tests. | failed=0; mandatory skipped=0.                           |
| qa:day9-smoke               | QA Worker/import/FHR projection smoke.                        | No direct D1 mutation outside Worker/import service.     |
| day9:import:dry-run         | Validate controlled manifest without mutation.                | Redacted output.                                         |
| test:galvivault             | Existing Day 1-Day 8 regression.                              | Must remain green.                                       |
| Day 8 clinician tests       | Auth/search/chart/care workflows.                             | Historical projection must not break clinical workflow.  |
| Public GalviCare regression | GalviTriage through known-good public flow.                   | No Day 9 regression.                                     |

## 16.2 Day 9 automated acceptance categories

| **Category**            | **Required coverage**                                                                                              |
|-------------------------|--------------------------------------------------------------------------------------------------------------------|
| Repository              | approved branch, no work branch, no unrelated workflow rewrite, no real PII in committed fixtures                  |
| Identity                | email normalization, display-name variation, existing founder resolution, new founder, ambiguous identity conflict |
| Venture/BMR             | existing same venture returns same IDs, new venture gets new BMR, no duplicate BMR                                 |
| Import                  | batch create/row import/replay/quarantine/reconciliation/checksum mismatch                                         |
| Historical session      | one source episode, replay-safe, correct BMR ownership                                                             |
| Evidence                | source ref/checksum/captured time, accepted immutability, cross-BMR rejection                                      |
| FHR observations        | structured fields linked to evidence, historical as-of, no unlinked observation                                    |
| Current-care separation | historical import creates no active finding/recommendation/treatment/outcome                                       |
| Continuity              | returning founder new GalviCare session same BMR; new venture not merged                                           |
| Intelligence context    | internal composition includes historical/current refs; public actor denied/not exposed                             |
| Aidan                   | no canonical profile; proposed candidate only; mixed-source contamination excluded                                 |
| Clinician chart         | historical section protected, labeled, durable after refresh/re-login                                              |
| Privacy                 | no email/source narrative in logs/evidence; no public self-service record route                                    |
| Regression              | Day 1-Day 8 + clinician + public GalviCare all green                                                               |

# 17. Phase 11 — QA Deployment & Human E2E

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>QA HUMAN E2E PRINCIPLE</strong></p>
<p>Use a synthetic founder shaped like the real historical cohort. The E2E must prove the complete longitudinal behavior: historical import → protected clinician FHR view → public GalviCare return → same BMR/new session → internal Founder Intelligence Context → protected chart refresh. Real founder data is not needed in QA.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 17.1 Human E2E run sequence

1\. Record run ID, exact Day 9 candidate SHA, QA Worker deployment, QA D1 schema version, Day 8 clinician portal deployment, tester, and synthetic fixture identity.

2\. Create a Day 9 import batch for the synthetic historical founder source.

3\. Import the synthetic source row and verify one founder, one venture, one role, one BMR, one historical session, source evidence, structured historical observations, journey/audit/import evidence.

4\. Replay the identical import row and prove no second founder/BMR/session/evidence/observation is created.

5\. Open the Day 8 clinician portal as an authorized clinician, search the synthetic founder, open the chart, and verify Historical Founder Context is visible with provenance and clearly labeled historical.

6\. Attempt the same chart/FHR/history read unauthenticated and prove denial/no payload.

7\. Start a new public GalviCare session using the synthetic founder’s same normalized email and same venture context.

8\. Verify the new GalviCare session attaches to the same founder_id + venture_id + bmr_id while producing a new session_id.

9\. Verify the public browser response does not contain the raw FHR/Founder Intelligence Context.

10\. From the internal service/authorized operator path, compose Founder Intelligence Context and verify it includes the historical source references plus the current GalviCare session context.

11\. Refresh/re-login to the clinician portal and verify the same BMR now shows both historical FCD/GalviShot and new GalviCare episode in timeline order.

12\. Run a same-founder/new-venture test and prove a new venture/BMR is created without merging the prior BMR.

13\. Run a source-missing/ambiguous row and prove quarantine or explicit skip with reconciled batch counts.

14\. Run the Aidan intelligence-reference fixture and prove no canonical Aidan profile/BMR is created; only a proposed candidate is created from validated safe sections.

15\. Run full Day 1-Day 8 GalviVault regression and public GalviCare regression on the same candidate.

16\. Run D1 assertion catalog and sign PASS/FAIL. No undocumented manual repair is permitted.

## 17.2 Human E2E failure rules

- Wrong environment/database, unauthorized historical read, duplicate canonical identity/BMR, cross-BMR evidence, accepted evidence mutation, public raw FHR payload, unreconciled import counts, or public GalviCare regression = immediate STOP.

- Do not manually edit D1 and continue the same run. Preserve evidence, classify defect, restore/redeploy, fix in QA, and begin a new identified E2E run.

- A source-missing historical row is acceptable only when the row is explicitly skipped/quarantined and reconciliation explains it. Silent omission is a failure.

- An optional historical projection rendering defect can be retried only after the underlying canonical data is proven intact; do not hide data-integrity defects with UI fallback.

# 18. Phase 12 — Controlled Production Historical Backfill

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRODUCTION PRINCIPLE</strong></p>
<p>Production is not the place to discover whether the importer works. The real founder backfill runs only after the exact Day 9 code candidate has passed synthetic QA/Human E2E and import replay/quarantine tests.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 18.1 Pre-import approval gate

- Exact Day 9 candidate SHA/deployment approved.

- Production readiness/health/schema green.

- Secure real-founder manifest prepared outside Git and checksum recorded.

- Source artifacts available and checksummed for each source-ready founder.

- Dry-run returns expected create/existing identity decisions with no unexplained conflicts.

- Import batch expected_count equals the number of rows presented for execution.

- Rollback/deactivation path and prior Day 8 Worker target recorded.

- Operator/release authority approves the controlled data migration.

## 18.2 Production import order

1\. Create Production import batch and record import_batch_id.

2\. Process one founder row at a time or in a bounded batch with per-row receipts; do not run a blind bulk SQL script.

3\. After each row, capture safe canonical IDs and status. Do not capture full source narrative in release evidence.

4\. On the first unexpected identity, venture, checksum, authorization, or canonical integrity error, stop the batch and classify before continuing.

5\. Rows with missing source artifact or ambiguous venture remain skipped/quarantined. Do not invent data to satisfy expected_count.

6\. Close/reconcile the batch. processed_count must equal imported_count + skipped_count + error_count and explain every row.

7\. Run read-only D1 assertions for every imported BMR and source session.

8\. Open a bounded sample through the Day 8 clinician portal to confirm historical context renders from Production canonical state.

9\. Do not simulate public GalviCare re-entry with a real founder without a separate approved production-safe test plan. Returning-founder behavior was already proven in QA.

## 18.3 Expected founder dispositions

| **Founder**          | **Expected production disposition**                                                                                                             |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Harry Akligoh        | Import if source artifact/checksum and venture match are confirmed.                                                                             |
| Gilles Loïc Djayep   | Import if source artifact/checksum and venture match are confirmed.                                                                             |
| Ahmet Kilic          | Import if approved GalviShot source is available and venture context is confirmed.                                                              |
| Naima Bogran         | Import if source artifact/checksum and venture match are confirmed.                                                                             |
| Danielle S Petterson | Import if source artifact/checksum and venture match are confirmed.                                                                             |
| Nnenna Ukwu          | Import if source artifact/checksum and venture match are confirmed.                                                                             |
| Dayo Ogundipe        | Identity is confirmed; import only after approved historical source artifact + venture context are located. Otherwise explicit skip/quarantine. |
| Aidan de Grandpre    | NO canonical backfill. Intelligence-reference processing only.                                                                                  |

# 19. Phase 13 — D1 Proof, Evidence Package & Day 9 Decision

## 19.1 Required evidence package

| **Evidence ID** | **Artifact**                                                                                                          |
|-----------------|-----------------------------------------------------------------------------------------------------------------------|
| D9-EV-01        | Baseline fingerprint: Day 8 final SHA, Day 9 start SHA, branch sync, main, deployment/schema identity.                |
| D9-EV-02        | Day 9 diff inventory + proof unrelated GalviCare/Day 8 clinical files were not rewritten.                             |
| D9-EV-03        | Secure identity-input mechanism attestation; no real emails/secrets committed.                                        |
| D9-EV-04        | Schema/migration inventory; explicit zero-migration decision or migration transcript/checksum if needed.              |
| D9-EV-05        | Automated Day 9 test report; failed=0; mandatory skipped=0.                                                           |
| D9-EV-06        | Day 1-Day 8 full GalviVault regression report.                                                                        |
| D9-EV-07        | Day 8 clinician workspace regression report.                                                                          |
| D9-EV-08        | Public GalviCare regression report.                                                                                   |
| D9-EV-09        | QA synthetic import dry-run + import batch reconciliation.                                                            |
| D9-EV-10        | QA Human E2E screenshots/request-response/correlation IDs using synthetic identity.                                   |
| D9-EV-11        | QA D1 assertion sheet: identity/BMR/session/evidence/observation/import/intelligence.                                 |
| D9-EV-12        | Security negatives: public FHR/BHR access denial, no browser historical payload, cross-founder denial, log redaction. |
| D9-EV-13        | Aidan intelligence-reference proof: no canonical profile; proposed candidate + contamination exclusion.               |
| D9-EV-14        | Production historical import batch reconciliation, if executed; safe canonical IDs only.                              |
| D9-EV-15        | Rollback/deactivation and data-correction plan + prior Day 8 deployment.                                              |
| D9-EV-16        | Known defects / accepted residual low-severity items.                                                                 |
| D9-EV-17        | Final Product Owner GO/STOP decision.                                                                                 |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ONLY VALID FINAL DAY 9 PASS STATEMENT</strong></p>
<p>If and only if the exact Day 9 QA candidate passes all blocking automated/regression/security gates, Human E2E proves historical import → protected FHR view → returning-founder same-BMR/new-session continuity → internal Founder Intelligence Context, and Production backfill is either safely completed or explicitly deferred with no hidden data state, the implementation report may end with:<br />
<br />
DAY 9 HUMAN E2E PASS → FHR BUILD + BHR CONTINUITY READY FOR GALVICARE | GALVIVAULT INTEGRATION E2E.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix A — Controlled Founder Identity Crosswalk

This Git-safe appendix intentionally replaces the founder email values supplied by the Product Owner with environment-variable placeholders. The real values must be provided only through the secure, untracked Day 9 identity input at execution time; do not commit them to Git or copy them into public release evidence.

| **Founder**          | **Email**                | **Identity note**                                                                     |
|----------------------|--------------------------|---------------------------------------------------------------------------------------|
| Harry Akligoh        | ${DAY9_FHR_EMAIL_HARRY_AKLIGOH}   | Use normalized email for lookup; founder_id remains canonical.                        |
| Gilles Loïc Djayep   | ${DAY9_FHR_EMAIL_GILLES_DJAYEP} | Accent/display-name variation must not create duplicate.                              |
| Ahmet Kilic          | ${DAY9_FHR_EMAIL_AHMET_KILIC}    | Use only with approved source venture context.                                        |
| Naima Bogran         | ${DAY9_FHR_EMAIL_NAIMA_BOGRAN} | Use normalized email for lookup.                                                      |
| Danielle S Petterson | ${DAY9_FHR_EMAIL_DANIELLE_PETTERSON}   | Middle initial/display-name variation must not create duplicate.                      |
| Nnenna Ukwu          | ${DAY9_FHR_EMAIL_NNENNA_UKWU} | Use normalized email for lookup.                                                      |
| Dayo Ogundipe        | ${DAY9_FHR_EMAIL_DAYO_OGUNDIPE}       | Identity confirmed; source artifact/venture still must be resolved before FHR import. |

# Appendix B — FHR Normalized Source-to-Record Contract

| **Source field**                     | **Meaning**                                 | **Canonical target**                | **Rule**                                                                   |
|--------------------------------------|---------------------------------------------|-------------------------------------|----------------------------------------------------------------------------|
| source_document                      | Historical GalviShot/FCD artifact reference | evidence_items                      | reference/file-reference/text extract; source_ref + checksum + session/BMR |
| founder_snapshot.archetype           | Founder archetype at time of FCD            | observations + observation_evidence | historical; evidence-linked; version/as-of                                 |
| founder_snapshot.identity            | Founder identity phrase                     | observations                        | historical; not auth identity                                              |
| founder_snapshot.stage               | Founder stage at time of assessment         | observations                        | historical stage; do not overwrite current venture stage                   |
| founder_snapshot.trajectory          | Performance trajectory                      | observations                        | historical                                                                 |
| founder_snapshot.transition          | Current founder transition                  | observations                        | historical                                                                 |
| founder_snapshot.long_term_potential | Long-term potential                         | observations                        | historical/projection, not finding                                         |
| genome.primary_motivation            | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.decision_style                | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.leadership_style              | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.learning_style                | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.communication_style           | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.risk_orientation              | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.founder_energy                | Founder Performance Genome                  | observations                        | historical + source version                                                |
| genome.greatest_untapped_asset       | Founder Performance Genome                  | observations                        | historical + source version                                                |
| founder_story                        | Narrative founder history                   | evidence_items/reference            | bounded/private; not current finding                                       |
| growth_opportunities                 | Prior FCD opportunities                     | observations                        | historical; do not activate care plan                                      |
| recommended_next_step                | Prior recommendation at time                | observation/evidence                | historical_next_step; not active recommendation                            |
| legacy_score                         | Version-specific prior score if present     | observation/evidence                | only if score definition/version is known                                  |

# Appendix C — Import Command & Reconciliation Contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># Illustrative API shape; reuse repository-equivalent routes/services if already present.<br />
<br />
POST /api/v1/import-batches<br />
{<br />
"source_type": "historical_fcd_galvishot",<br />
"source_name": "day9_fhr_backfill_v1",<br />
"expected_count": 7<br />
}<br />
<br />
POST /api/v1/import-batches/{batch_id}/rows<br />
Idempotency-Key: &lt;batch_id&gt;:&lt;source_row_key&gt;<br />
{<br />
"source_row_key": "&lt;opaque&gt;",<br />
"disposition": "canonical_fhr_backfill",<br />
"identity": {"email":"&lt;secure&gt;","display_name":"..."},<br />
"venture": {"venture_name":"..."},<br />
"source": {<br />
"artifact_ref":"&lt;private-ref&gt;",<br />
"artifact_version":"GalviShot 4.0",<br />
"artifact_checksum":"sha256:...",<br />
"event_at":"..."<br />
},<br />
"normalized_fhr": {...}<br />
}<br />
<br />
POST /api/v1/import-batches/{batch_id}/close<br />
# Batch closes only when every expected row is imported/skipped/error.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## C.1 Reconciliation invariants

- Same source row + same fingerprint returns original import result.

- Same source row key + changed identity/source checksum returns conflict/quarantine and no canonical mutation.

- imported_count increases only after full canonical row operation succeeds.

- skipped_count is explicit and reasoned (e.g., source_missing, already_imported, product_owner_excluded).

- error_count maps to import_errors; malformed row does not create partial founder/BMR/evidence.

- Close fails or returns completed_with_errors when counts do not explain expected_count.

# Appendix D — Founder Intelligence Context Contract

| **Section**       | **Required contents**                                    | **Default exposure**                                            |
|-------------------|----------------------------------------------------------|-----------------------------------------------------------------|
| identity_ref      | Opaque founder/venture/BMR IDs; continuity status.       | Internal/operator                                               |
| historical_fhr    | Snapshot/genome/growth history + source/as-of refs.      | Internal/operator only                                          |
| current_evidence  | Current/latest bounded evidence refs.                    | Internal/operator; browser gets only existing public projection |
| current_reasoning | Governed observations/findings with confidence/status.   | Operator/internal                                               |
| care              | Recommendations/treatment/outcome summary.               | Operator/internal                                               |
| contradictions    | Historical/current mismatches or stale context flags.    | Internal review                                                 |
| provenance        | Session/evidence/source versions/checksums.              | Internal/operator                                               |
| learning hooks    | Candidate source references, never active rule mutation. | Internal governance                                             |

## D.1 Consumer rules

- GalviEngine consumes the context server-side. It may use historical patterns to select questions, compare current vs historical state, or draft proposals in MVP 1.0 only under the future governed AI contract.

- Public GalviCare responses must not expose the raw context object.

- Any future AI-generated observation/recommendation is stored as proposal/review content with source references; it does not overwrite evidence or auto-promote to finding/treatment.

- Cross-case use requires learning_candidates and later knowledge release governance.

# Appendix E — Day 9 Automated Test Catalog

| **Test ID** | **Category** | **Scenario / expected behavior**                                              | **Level**                     |
|-------------|--------------|-------------------------------------------------------------------------------|-------------------------------|
| D9-REP-001  | Repo         | Branch is qa-revamped-galvicare-0-5; no work/new branch.                      | BLOCK                         |
| D9-REP-002  | Repo         | No unrelated GalviCare/Day 8 workflow/source rewrite.                         | BLOCK                         |
| D9-REP-003  | Repo         | Committed Day 9 fixtures contain no real founder emails/source PII.           | BLOCK                         |
| D9-REP-004  | Repo         | Applied Day 1-Day 8 migrations unchanged.                                     | BLOCK                         |
| D9-ID-001   | Identity     | Normalized email resolves same founder across case/whitespace.                | BLOCK                         |
| D9-ID-002   | Identity     | Display-name variation does not create duplicate founder.                     | BLOCK                         |
| D9-ID-003   | Identity     | Changed email cannot silently replace founder_id without audited correction.  | BLOCK                         |
| D9-ID-004   | Identity     | Ambiguous identity/venture returns conflict/quarantine; no merge.             | BLOCK                         |
| D9-BMR-001  | BMR          | Existing venture returns same bmr_id.                                         | BLOCK                         |
| D9-BMR-002  | BMR          | Same founder + new venture creates new BMR; prior BMR unchanged.              | BLOCK                         |
| D9-BMR-003  | BMR          | Import replay cannot create second BMR.                                       | BLOCK                         |
| D9-IMP-001  | Import       | Create batch with expected count/environment/actor.                           | BLOCK                         |
| D9-IMP-002  | Import       | Valid historical row creates canonical result via services.                   | BLOCK                         |
| D9-IMP-003  | Import       | Identical replay returns same receipt/IDs.                                    | BLOCK                         |
| D9-IMP-004  | Import       | Changed fingerprint conflicts; no mutation.                                   | BLOCK                         |
| D9-IMP-005  | Import       | Missing source artifact quarantined/skipped explicitly.                       | BLOCK                         |
| D9-IMP-006  | Import       | Close batch reconciles processed=imported+skipped+errors.                     | BLOCK                         |
| D9-SES-001  | Session      | Historical source episode creates one session linked to correct BMR.          | BLOCK                         |
| D9-SES-002  | Session      | Replay does not duplicate historical session.                                 | BLOCK                         |
| D9-EVD-001  | Evidence     | Artifact reference/checksum/source/session/BMR persisted.                     | BLOCK                         |
| D9-EVD-002  | Evidence     | Accepted historical evidence cannot be updated in place.                      | BLOCK                         |
| D9-EVD-003  | Evidence     | Cross-BMR historical evidence link rejected.                                  | BLOCK                         |
| D9-FHR-001  | FHR          | Snapshot/genome fields compose from evidence-linked observations.             | BLOCK                         |
| D9-FHR-002  | FHR          | FHR field exposes as-of/source refs and tolerates missing values.             | BLOCK                         |
| D9-FHR-003  | FHR          | Historical import creates no active current finding/recommendation/treatment. | BLOCK                         |
| D9-CON-001  | Continuity   | Returning same founder/venture → same bmr_id + new GalviCare session_id.      | BLOCK                         |
| D9-CON-002  | Continuity   | Returning new venture → new BMR; no merge.                                    | BLOCK                         |
| D9-CON-003  | Continuity   | Public client cannot force bmr_id/founder_id ownership.                       | BLOCK                         |
| D9-INT-001  | Intelligence | Internal service composes historical + current refs.                          | BLOCK                         |
| D9-INT-002  | Intelligence | Public actor cannot retrieve raw Founder Intelligence Context.                | BLOCK                         |
| D9-AID-001  | Aidan        | No canonical Aidan founder/venture/BMR created by Day 9 source processing.    | BLOCK                         |
| D9-AID-002  | Aidan        | Mixed Harry/Duplex segments are excluded/quarantined.                         | BLOCK                         |
| D9-AID-003  | Aidan        | Candidate status remains proposed; no active knowledge/runtime rule.          | BLOCK                         |
| D9-UI-001   | Clinician    | Protected chart shows historical FHR section with as-of/source labeling.      | BLOCK                         |
| D9-UI-002   | Clinician    | Refresh/re-login recovers historical + current timeline.                      | BLOCK                         |
| D9-SEC-001  | Security     | Unauthenticated FHR/BHR/chart read denied.                                    | BLOCK                         |
| D9-SEC-002  | Security     | Public browser payload excludes source narrative/genome/internal context.     | BLOCK                         |
| D9-SEC-003  | Security     | Logs/evidence redact real email/source body.                                  | BLOCK                         |
| D9-SEC-004  | Security     | Cross-founder IDs/email cannot retrieve another record.                       | BLOCK                         |
| D9-REG-001  | Regression   | Full Day 1-Day 8 GalviVault regression passes.                                | BLOCK                         |
| D9-REG-002  | Regression   | Day 8 clinician workflow regression passes.                                   | BLOCK                         |
| D9-REG-003  | Regression   | Public GalviCare regression passes.                                           | BLOCK                         |
| D9-PROD-001 | Production   | Real import runs only after QA approval; batch reconciles.                    | BLOCK if prod import executed |
| D9-PROD-002 | Production   | Source-pending row never creates invented FHR data.                           | BLOCK                         |

# Appendix F — Day 9 Human E2E Runbook

| **Step** | **Scenario**          | **Required proof**                                                                         |
|----------|-----------------------|--------------------------------------------------------------------------------------------|
| F1       | Baseline              | Confirm exact Day 8 final, QA branch, Worker/DB, clinician portal, public GalviCare smoke. |
| F2       | Synthetic import      | Create synthetic historical FCD/GalviShot import batch and valid row.                      |
| F3       | Canonical proof       | Verify founder/venture/BMR/session/evidence/observations/audit/import counts.              |
| F4       | Replay                | Replay same row; verify stable IDs and no duplicate rows.                                  |
| F5       | Clinician view        | Authenticated clinician opens Founder chart and sees historical context + provenance.      |
| F6       | Public negative       | Unauthenticated/public caller cannot retrieve FHR/BHR/history.                             |
| F7       | Return journey        | Same synthetic founder/venture starts GalviCare; new session attaches to same BMR.         |
| F8       | Browser privacy       | Inspect network response; no raw FHR/Founder Intelligence Context.                         |
| F9       | Internal intelligence | Authorized service composes historical + current context with source refs.                 |
| F10      | Timeline continuity   | Clinician refresh/re-login shows historical episode then current GalviCare episode.        |
| F11      | New venture           | Same founder with new venture gets new BMR, no merge.                                      |
| F12      | Quarantine            | Missing/ambiguous source row is explicitly quarantined/skipped and reconciled.             |
| F13      | Aidan reference       | Source review produces no Aidan BMR and only proposed candidate from safe segments.        |
| F14      | Regression            | Day 1-Day 8 + Day 8 clinician + public GalviCare all green.                                |
| F15      | D1 assertions         | Run Appendix G; no duplicate/orphan/cross-BMR/current-care pollution.                      |
| F16      | Decision              | Sign PASS/FAIL/ROLLBACK with exact candidate evidence.                                     |

# Appendix G — D1 Assertion Catalog

Use repository/schema-exact column names. The queries below follow the P0 schema contract and may need safe adjustment if the released schema uses equivalent names. Production queries are read-only. Substitute approved synthetic or real canonical IDs; do not paste real emails/source narratives into the release evidence.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>-- 1. One BMR per venture: must return zero rows<br />
SELECT venture_id, COUNT(*) AS bmr_count<br />
FROM business_medical_records<br />
GROUP BY venture_id<br />
HAVING COUNT(*) &lt;&gt; 1;<br />
<br />
-- 2. Historical session for the target BMR<br />
SELECT session_id, bmr_id, venture_id, founder_id, source, current_stage, status<br />
FROM assessment_sessions<br />
WHERE bmr_id = ?<br />
ORDER BY created_at;<br />
<br />
-- 3. Historical evidence versions<br />
SELECT evidence_id, evidence_group_id, version_no, status,<br />
supersedes_evidence_id, source_type, source_ref, captured_at<br />
FROM evidence_items<br />
WHERE bmr_id = ?<br />
ORDER BY evidence_group_id, version_no;<br />
<br />
-- 4. Observation linkage: historical observations must have source evidence<br />
SELECT o.observation_id, o.bmr_id, oe.evidence_id<br />
FROM observations o<br />
LEFT JOIN observation_evidence oe ON oe.observation_id = o.observation_id<br />
WHERE o.bmr_id = ?<br />
AND oe.evidence_id IS NULL;<br />
<br />
-- 5. Cross-BMR evidence support: must return zero<br />
SELECT o.observation_id, o.bmr_id AS observation_bmr,<br />
e.evidence_id, e.bmr_id AS evidence_bmr<br />
FROM observation_evidence oe<br />
JOIN observations o ON o.observation_id = oe.observation_id<br />
JOIN evidence_items e ON e.evidence_id = oe.evidence_id<br />
WHERE o.bmr_id &lt;&gt; e.bmr_id;<br />
<br />
-- 6. Current-care pollution check after historical import.<br />
-- Expected: no new Day 9 historical-import generated active findings/recommendations/treatments.<br />
SELECT finding_id, finding_code, status, source_type<br />
FROM findings<br />
WHERE bmr_id = ? AND source_type = 'historical_fcd_galvishot';<br />
<br />
SELECT recommendation_id, recommendation_code, status<br />
FROM recommendations<br />
WHERE bmr_id = ? AND source_type = 'historical_fcd_galvishot';<br />
<br />
-- Use schema-exact source columns if names differ. The intended assertion is zero<br />
-- active care records created solely by the historical import.<br />
<br />
-- 7. Import reconciliation<br />
SELECT import_batch_id, source_type, source_name, status,<br />
expected_count, processed_count, imported_count, skipped_count, error_count<br />
FROM import_batches<br />
WHERE import_batch_id = ?;<br />
<br />
SELECT source_row_key, field_name, error_code, safe_message, created_at<br />
FROM import_errors<br />
WHERE import_batch_id = ?<br />
ORDER BY created_at;<br />
<br />
-- 8. Timeline proof<br />
SELECT event_name, bmr_id, session_id, occurred_at, correlation_id<br />
FROM journey_events<br />
WHERE bmr_id = ?<br />
ORDER BY occurred_at;<br />
<br />
-- 9. Audit trace<br />
SELECT entity_type, entity_id, operation, prior_version, new_version,<br />
actor_type, reason_code, correlation_id, occurred_at<br />
FROM audit_log<br />
WHERE entity_id = ? OR correlation_id IN (<br />
SELECT correlation_id FROM journey_events WHERE bmr_id = ?<br />
)<br />
ORDER BY occurred_at;<br />
<br />
-- 10. Aidan Day 9 learning-reference proof<br />
SELECT learning_candidate_id, candidate_type, title, status,<br />
source_bmr_ids_json, release_version<br />
FROM learning_candidates<br />
WHERE candidate_type = 'historical_founder_pattern_reference'<br />
ORDER BY created_at DESC;</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## G.1 Interpretation rules

- A zero-row integrity query is evidence only when the query targets the correct released schema and candidate IDs.

- Do not add or change schema merely to make an appendix query run. Use repository-exact names while preserving the stated assertion.

- Production proof should record counts/status/canonical IDs, not sensitive evidence values.

- Any cross-BMR link, duplicate BMR, partial import, or historical-import-generated active care record blocks Day 9.

# Appendix H — Rollback / Deactivation / Data Correction

## H.1 Application rollback

1\. Announce rollback with candidate SHA/deployment, reason, time, and affected Day 9 component.

2\. Disable Day 9 historical continuity/intelligence feature flag if implemented and stop any open import batch.

3\. Redeploy the prior known-good Day 8 Worker/clinician UI configuration.

4\. Do not remove additive migrations; verify the prior Worker remains compatible with the current schema.

5\. Run health/readiness and Day 8 clinician + public GalviCare rollback smoke.

6\. Run read-only D1 integrity checks for any records created during the failed window.

7\. Resume only after rollback verification is accepted and evidence package is complete.

## H.2 Import/data rollback rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>NO AD HOC DELETE</strong></p>
<p>Valid canonical historical records are not deleted simply because a Day 9 application build is rolled back. Pause/close the import batch, quarantine disputed rows, and correct imported evidence through the governed version/supersession/reconciliation path. If an identity merge/split issue is discovered, preserve both records and perform an approved reconciliation design; do not change primary IDs or delete history manually.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Failure type**               | **Approved response**                                                             | **Prohibited shortcut**                      |
|--------------------------------|-----------------------------------------------------------------------------------|----------------------------------------------|
| Wrong application/projection   | Redeploy Day 8; leave canonical imported records intact if valid.                 | Delete historical data to match old UI.      |
| Bad source extract             | Create corrected evidence/observation version; preserve prior source/audit.       | Update accepted evidence content in place.   |
| Duplicate source replay defect | Stop importer; reconcile duplicate/conflict via idempotency/audit evidence.       | Delete rows and rerun blindly.               |
| Wrong venture/BMR association  | Quarantine; approved identity/relationship reconciliation preserving IDs/history. | Move evidence across BMR with direct SQL.    |
| Open failed import batch       | Pause/cancel/close with accurate counts; corrective batch later.                  | Edit counts to appear reconciled.            |
| Founder access leak            | Disable Day 9 projection/route, revert app, preserve incident evidence.           | Hide UI only while endpoint remains exposed. |

# Appendix I — Codex Final Implementation Report Template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>DAY 9 IMPLEMENTATION REPORT — FHR BUILD / BHR INTEGRATION<br />
Run date/time:<br />
Repository / branch:<br />
Starting Day 8 final SHA:<br />
Day 9 candidate SHA:<br />
QA Worker deployment:<br />
QA clinician portal deployment:<br />
QA D1 / schema version:<br />
Production deployment/import executed? YES | NO<br />
<br />
1. BASELINE<br />
- Day 8 Build Final verified: PASS | FAIL<br />
- QA synchronized to released baseline: PASS | FAIL<br />
- Public GalviCare pre-change smoke: PASS | FAIL<br />
<br />
2. DAY 9 DIFF<br />
- Files added:<br />
- Files modified:<br />
- Unrelated GalviCare files unchanged: PASS | FAIL<br />
- Migration added? YES | NO. If yes, ID/checksum:<br />
<br />
3. HISTORICAL IMPORT<br />
- Import service path used:<br />
- Synthetic QA batch ID:<br />
- QA expected / processed / imported / skipped / errors:<br />
- Idempotent replay: PASS | FAIL<br />
- Cross-BMR/duplicate checks: PASS | FAIL<br />
<br />
4. FHR / BHR CONTINUITY<br />
- FHR projection implemented: PASS | FAIL<br />
- Historical observation provenance: PASS | FAIL<br />
- Returning same venture keeps same BMR/new session: PASS | FAIL<br />
- New venture does not merge BMR: PASS | FAIL<br />
<br />
5. FOUNDER INTELLIGENCE CONTEXT<br />
- Internal context service/projection: PASS | FAIL<br />
- Public raw context exposure: NONE | DEFECT<br />
- Aidan canonical profile created: MUST BE NO<br />
- Aidan proposed learning candidate: YES | NO | DEFERRED<br />
- Contaminated source segments excluded: PASS | FAIL<br />
<br />
6. CLINICIAN / PUBLIC ACCESS<br />
- Day 8 chart historical section: PASS | FAIL<br />
- Unauthenticated/public FHR/BHR retrieval blocked: PASS | FAIL<br />
- Logs/release evidence redact real founder PII: PASS | FAIL<br />
<br />
7. REGRESSION<br />
- Day 9 tests: PASS | FAIL<br />
- Day 1-Day 8 GalviVault regression: PASS | FAIL<br />
- Day 8 clinician regression: PASS | FAIL<br />
- Public GalviCare regression: PASS | FAIL<br />
- Mandatory skipped tests: 0 | &lt;count&gt;<br />
<br />
8. HUMAN E2E<br />
- Historical import: PASS | FAIL<br />
- Clinician historical chart: PASS | FAIL<br />
- Returning-founder continuity: PASS | FAIL<br />
- Internal intelligence context: PASS | FAIL<br />
- D1 assertions: PASS | FAIL<br />
- Undocumented manual repair used? MUST BE NO<br />
<br />
9. PRODUCTION BACKFILL<br />
- Executed? YES | NO<br />
- Production import batch ID:<br />
- Rows expected / imported / skipped / errors:<br />
- Source-pending founders:<br />
- Reconciliation complete: PASS | FAIL | N/A<br />
<br />
10. DEFECTS / ROLLBACK<br />
- Blockers:<br />
- Residual defects:<br />
- Rollback target:<br />
- Day 9 feature/import deactivation plan:<br />
<br />
FINAL DECISION:<br />
DAY 9 HUMAN E2E PASS → FHR BUILD + BHR CONTINUITY READY FOR GALVICARE | GALVIVAULT INTEGRATION E2E<br />
or<br />
FAIL / STOP / ROLLBACK</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix J — One-Page Day 9 Completion Checklist

| **Gate**           | **Completion requirement**                                                                                        |
|--------------------|-------------------------------------------------------------------------------------------------------------------|
| Entry              | Exact Day 8 Build Final baseline verified; QA on approved branch and synchronized.                                |
| Scope              | No public founder FHR/BHR access; BHR naming does not create new persistence authority.                           |
| Repo               | No work branch; no unrelated GalviCare/Day 8 workflow rewrite.                                                    |
| PII                | Real founder identity input is secure/untracked; no real emails in committed fixtures/log evidence.               |
| Import             | Historical import uses existing Worker/import/domain services; no direct Production SQL.                          |
| Identity           | Same founder/venture resolves stable founder_id + venture_id + bmr_id.                                            |
| Historical session | One source episode per FCD/GalviShot; replay-safe.                                                                |
| Evidence           | Artifact source/checksum/provenance stored; accepted evidence immutable.                                          |
| FHR                | Snapshot/Genome/history structured as evidence-linked historical observations.                                    |
| Care separation    | No historical import auto-creates current findings/recommendations/treatment/outcomes.                            |
| Continuity         | Returning founder starts new GalviCare session on same BMR.                                                       |
| Multi-venture      | New venture gets new BMR; no merge/cross-BMR reassignment.                                                        |
| Intelligence       | Internal Founder Intelligence Context exists and is provenance-bearing/bounded.                                   |
| Aidan              | No canonical profile; safe Aidan-specific patterns only as proposed learning candidate; contamination excluded.   |
| Clinician          | Day 8 chart shows labeled historical context and timeline.                                                        |
| Founder access     | Public/unauthenticated cannot retrieve FHR/BHR/internal context.                                                  |
| QA                 | Day 9 automated + security + import reconciliation all pass; mandatory skipped=0.                                 |
| Regression         | Day 1-Day 8 GalviVault + Day 8 clinician + public GalviCare all green.                                            |
| Human E2E          | Synthetic historical import → clinician view → GalviCare return → same BMR/new session → context → D1 proof PASS. |
| Production         | Controlled real-founder backfill reconciled or explicitly deferred; source-pending rows explicit.                 |
| Evidence           | D9-EV-01 through D9-EV-17 complete; rollback/deactivation documented.                                             |
| Decision           | Final statement is PASS only when every blocking gate is green.                                                   |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 9 BUILD FINAL GATE</strong></p>
<p>Do not hand off to the GalviCare | GalviVault Integration E2E until the synthetic returning-founder path proves one continuous canonical record and the public client remains unable to retrieve FHR/BHR content. The Day 9 build is successful when GalviVault remembers the founder, GalviCare can continue care internally, the clinician can see governed history, and GalviEngine has a provenance-bearing intelligence substrate—without creating a second source of truth or a new customer record portal.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>
