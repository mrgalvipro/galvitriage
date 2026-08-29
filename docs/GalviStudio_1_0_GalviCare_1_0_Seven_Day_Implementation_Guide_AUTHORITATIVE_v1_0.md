# GalviStudio 1.0 | GalviCare 1.0 — Authoritative Seven-Day Implementation Guide

> Source: authoritative DOCX supplied for Day 7 release execution. This Markdown copy is committed for Codex/repository consumption; the source document remains authoritative.

GALVISTUDIO 1.0 | GALVICARE 1.0

AUTHORITATIVE SEVEN-DAY IMPLEMENTATION GUIDE

Build, QA, Commercial Readiness, Production Cutover, and Release Evidence

Scenario 2: Evidence-First | Vault-First | Governed AI | Business Healthcare + Venture Development Closed Loop

Prepared for GalviPro / GalviStudio | August 24, 2026

## Build objective

Upgrade the proven GalviCare 0.5 + GalviVault 0.5 foundation into a commercially usable GalviCare 1.0 Digital Business Healthcare System and GalviStudio 1.0 Venture Development Management operating system in seven focused build days. Preserve all known-good 0.5 workflows; add the minimum 1.0 clinical, evidence, governed-AI, longitudinal care, Business Physician, Venture Studio, security, commercial, and release-gate capabilities required for real founder/SMB and specialty-protocol design customers.

### What 100% means for this 1.0 seven-day release

- **Ecosystem:** GalviCare manages Business Health; GalviStudio manages Venture Development; GalviPro delivers active Business Physician care; all three operate through one closed-loop record and evidence model.
- **Customer journey:** A customer can enter as Pre-Founder or operating founder, complete Triage -> Vitals -> Score -> Shot -> Chart -> Sight -> Path -> Clinic -> Treatment/Studio intervention -> Monitoring without blank states, duplicate identities, or manual record reconstruction.
- **Clinical intelligence:** Acuity, Clinical Confidence, evidence weighting, findings, contradictions, root-cause hypotheses, care routing, and treatment recommendations are governed, versioned, traceable, and safe.
- **Governed AI:** OpenAI API is enabled on Day 3 as a server-side reasoning assistant. AI produces proposals bound to evidence and schemas; it never becomes the canonical record or silently overrides governed clinical truth.
- **Data / GalviVault:** One canonical Founder/Principal record and, when applicable, one canonical venture BHR. Evidence -> finding -> hypothesis -> recommendation -> treatment -> outcome lineage is preserved and versioned.
- **GalviChart:** Customer access activates after GalviShot entitlement and progressively becomes more complete after Sight, Path, Clinic, and Continuous Care. Clinician uses the same visual language with authorized clinical context.
- **Active care:** GalviClinic supports Business Physician review, finding validation, Treatment Plans, embedded GalviRx prescriptions, GalviAudit orders, referrals, and outcome monitoring.
- **GalviStudio:** Four-pillar service catalog, FDI/SPUR, Venture Development stage gates, initial Treatment/Readiness Sprints, and GalviCare Venture 001 proof system are operational.
- **Security / trust:** Customer identity, consent ledger, basic RBAC, protected clinician/customer projections, audit history, secure secrets, safe ingestion, QA/PROD separation, and rollback are proven.
- **Commercial / operations:** Entitlements, GalviChart activation, Business Health Membership beta, Clinic booking/payment, CRM/analytics, referral routing, Studio prescription handoff, and release evidence operate end to end.

## Seven-day release principle

Ship the correct 1.0 foundation — not the final 3.0 enterprise platform. The build must be aggressive in depth and conservative in breadth. Every new capability must either close a 1.0 release gate, protect the canonical Business Health Record, improve the customer/clinician closed loop, or enable commercialization. Anything else is deferred.

## 1. Executive Build Decision

- Preserve the existing GalviCare 0.5 customer experience and GalviVault 0.5/P0 record foundation. 1.0 is an additive, migration-safe evolution — not a rewrite.
- Use the existing QA branch `qa-revamped-galvicare-0-5` for implementation and `main` for production. Do not create a new `work` branch or branch family for this seven-day release.
- Keep Cloudflare D1 as GalviVault system of record. Do not introduce a paid database or generic MDM replacement merely to appear enterprise-ready.
- Keep the Cloudflare Worker as the authoritative API and clinical orchestration boundary. No browser-to-D1, browser-to-secret, browser-to-Stripe-secret, or browser-to-OpenAI calls.
- Keep Stripe, Calendly, HubSpot, GA4, and Clarity as adapters around the core care system. Adapter failure must never erase paid clinical results or corrupt the BHR.
- Turn on the OpenAI API on Day 3 through a governed GalviEngine provider adapter. GalviVault remains source of truth; GalviEngine remains the clinical-intelligence framework.
- Treat GalviStudio as the Venture Development & Innovation Management Studio; treat FDI as an institution inside GalviStudio, not as the definition of GalviStudio.
- Treat GalviCare as one universal clinical operating system with multiple protocols. Athlete Career/Ownership is the first specialty protocol, not a fork of the core product.

### Permanent operating model

GalviCare cares. GalviEngine thinks. GalviVault remembers. GalviChart shows. GalviClinic encounters. The Business Physician decides. GalviStudio develops. GalviGuide navigates. Outcomes return to GalviVault and improve the next decision.

## 2. Scope Guardrails and Non-Negotiable Invariants

### In scope for the seven-day 1.0 build

Universal Clinical Model; Pre-Founder pathway; acuity + Clinical Confidence; protocol architecture; upgraded Vitals/Score/Shot/Sight/Path; GalviChart 1.0; GalviVault 1.0 longitudinal care foundation; GalviEngine 1.0 governed AI; Clinic Treatment Plans; embedded GalviRx; GalviAudit order; GalviLab service line; bounded GalviGuide; minimum referral network; Business Health Membership beta; GalviStudio four-pillar catalog; FDI/SPUR; initial Sprints; Venture Development stage gates; GalviCare Venture 001 proof; security/consent/RBAC foundation; analytics/CRM; E2E release gates.

### Explicitly deferred

Native mobile app; full institutional admin portal; SAML/SCIM/enterprise SSO; advanced multi-tenant IAM; national Business Physician network; standalone GalviRx pharmacy; autonomous GalviGuide physician; predictive intervention intelligence; Family Enterprise entity graph; portfolio intelligence; enterprise MDM replacement; large-scale APIs/integration marketplace; league-scale sponsorship infrastructure; accreditation claims; national research/standards body; Decision Performance OS.

### Definition of “do not break”

- Do not rewrite working GalviCare 0.5 or GalviVault 0.5/P0 files merely for cleanup or stylistic consistency.
- Do not change unrelated GalviCare workflows to implement a GalviStudio, GalviChart, AI, or care-plan feature.
- Use additive migrations and compatibility adapters. Inspect current D1 schema before adding a table/column; reuse canonical equivalents rather than duplicating them.
- Every material write is idempotent or versioned. Refresh/replay must not create duplicate results, payments, plans, referrals, or AI generations.
- A customer-facing projection can never overwrite canonical history. Browser actions submit authorized commands through the Worker.
- Every accepted AI-derived statement must identify its source evidence and generation metadata. Unsupported AI content is rejected or labeled as a proposal/hypothesis.
- No regulated legal, tax, fiduciary, securities, investment, medical, or other licensed-professional conclusion may be represented as GalviCare autonomous advice.
- At the end of each day, the QA branch must be deployable and either pass the day gate or be rolled back to the prior known-good commit.

### Defect priorities

- **P0:** Security/data exposure, wrong founder/BHR, lost record, wrong paid access, payment integrity, canonical record corruption, unsafe AI acceptance, blank critical path, inability to rollback. Must fix before release.
- **P1:** Broken CTA/routing, incorrect clinical progression, wrong protocol, unusable Chart/Clinic flow, unrecoverable error, major mobile-responsive failure. Must fix before affected path launches.
- **P2:** Copy inconsistency, minor layout, noncritical analytics/CRM failure, secondary content coverage. Fix if time permits; document fallback.
- **P3:** Enhancement, admin convenience, broad protocol expansion, future automation. Post-1.0 backlog.

## 3. Final 1.0 Product and Service Architecture

### Core customer care and clinical products

- GalviCare 1.0 — Digital Business Healthcare experience/orchestration layer — MUST SHIP.
- GalviTriage 1.0 — Digital front door: lifecycle state, acuity, Clinical Confidence, protocol, disposition — MUST SHIP.
- GalviVitals 1.0 — Founder Readiness or Business Health measurements; free immediate value — MUST SHIP.
- GalviScore 1.0 — Quantified Founder Readiness or Business Health intelligence with evidence/confidence — MUST SHIP.
- GalviShot 1.0 — Evidence-informed findings summary; GalviChart activation event after entitlement — MUST SHIP.
- GalviSight 1.0 — Business Health Evidence interpretation: support, contradiction, confidence, implications — MUST SHIP.
- GalviChart 1.0 — Progressively complete customer-facing Business Health Record — MUST SHIP.
- GalviPath 1.0 — Context-aware recommended care pathway — MUST SHIP.
- GalviClinic 1.0 — Business Physician encounter and treatment decision — MUST SHIP.
- GalviClinic Treatment Plan — Physician-governed treatment object with monitoring/outcomes — MUST SHIP.
- GalviGuide 1.0 — Bounded AI care navigator / automated GalviClinician support — MUST SHIP bounded.
- GalviLab 1.0 — Business Diagnostics service layer powered by GalviEngine — MUST OPERATE.
- GalviAudit 1.0 — Ordered specialty diagnostic workup, not a separate platform — MUST OPERATE.
- GalviRx 1.0 — Embedded structured prescription object/resources inside Path/Treatment Plan — MUST DEFINE + EMBED.
- GalviGage 1.0 — Fixed-scope guided implementation only when ordered by treatment — LIMITED ACTIVE CARE.
- Minimum IDN referral network — Qualified external specialist routing for regulated/complex matters — MUST OPERATE.

### Platform / governance

- GalviEngine 1.0 — evidence weighting, graph/lineage, governed AI reasoning assistance, root-cause hypotheses — MUST SHIP.
- GalviVault 1.0 — longitudinally capable BHR + Continuous Care foundation — MUST SHIP.
- GalviSecurity 1.0 — identity, consent, RBAC, audit, safe ingestion, environment trust — MUST SHIP.
- GalviStandards 1.0 — internal methodology/taxonomy/scoring/protocol governance — MUST OPERATE.
- GalviGrowth / GalviAnalytics / GalviLegal / GalviRevenue / GalviOperations / GalviPartner — commercial, measurement, legal, revenue, QA/ops, partner functions — MUST OPERATE; NOT customer apps.

### GalviStudio four-pillar service catalog

1. **Founder Development:** Pre-Founder Pathway; Founder Readiness GalviScore; FDI; SPUR Dreamer/Founder/Operator-Steward; Founder Development Sprints; Executive Development; EIR/Residency blueprint; future GalviLeague. Commercial packages: Founder Readiness | SPUR pathway | targeted Founder Development Sprint.
2. **Product Development:** Problem Discovery; Customer Discovery; Product Strategy; Venture Validation; Product Design; MVP Build; AI/Product Architecture; Product QA; Launch Readiness; Optimization. Commercial packages: Venture Validation | Product Build | Product Launch Readiness.
3. **Business Development:** ICP; category/market strategy; positioning; pricing; GTM; launch management; RevOps; sales enablement; lifecycle; partnerships; growth experiments; commercial optimization. Commercial packages: GTM Readiness | Commercial Launch | Revenue/Growth Optimization.
4. **Corporate Development:** Corporate strategy; operating model; governance; capital/investor readiness; strategic partnerships; JV; portfolio; succession; exit; post-exit; family enterprise. Commercial packages: Capital/Investor Readiness | Governance/Operating Model Readiness | Strategic Partnership Readiness.

### 1.0 Integrated Delivery Network service lines

- Digital Business Hospital / Care Delivery — GalviCare + GalviClinic — owns care experience and active encounter; not a consulting funnel.
- Clinical Intake / Emergency Routing — GalviTriage — owns lifecycle, acuity, confidence, protocol, disposition.
- Business Diagnostics — GalviLab + GalviAudit + GalviEngine — generates/assesses Business Health Evidence; Engine reasons, Lab delivers diagnostic service.
- Business Health Record — GalviVault + GalviChart — Vault owns canonical history; Chart shows authorized projection.
- Business Primary Care / Navigation — GalviClinician + GalviGuide — routine coordination/navigation; escalates judgment to Business Physician.
- Prescription / Treatment — GalviPath + embedded GalviRx + Treatment Plan — Path recommends; Business Physician confirms active treatment.
- Business Rehabilitation / Development — GalviStudio + FDI + SPUR + Sprints — develops capability prescribed by care; not all care equals education.
- Specialty / Referral Care — GalviPro specialty capability + curated external network — routes licensed/regulated work to qualified external professionals.

## 4. Final Target Technical Architecture

Customer / Founder / Athlete / Owner
-> GalviPro.com / GalviCare web experience
-> Cloudflare Worker — API Gateway + Authorization + Clinical Orchestration
-> GalviVault D1 canonical BHR/FHR + GalviEngine 1.0 rules/governed AI + Stripe/Calendly entitlement/care + non-blocking HubSpot/GA4/Clarity adapters
-> OpenAI Responses API server-side only
-> accepted governed intelligence
-> GalviChart / Business Physician projection / GalviStudio stage-gate projection
-> GalviClinic -> Treatment Plan -> GalviRx / GalviAudit / Referral / GalviStudio Sprint
-> Monitoring + Outcomes -> GalviVault -> next GalviEngine decision.

### Failure behavior

- Storefront: direct app/booking fallback if embed fails.
- Journey app: visible recovery; preserve session/BHR reference.
- API gateway: structured JSON error; never HTML/blank response.
- GalviVault: writes idempotent/versioned; no silent overwrite.
- GalviEngine: rules/fallback remains usable; AI failure never destroys care state.
- OpenAI: timeout/invalid schema -> reject AI proposal; use deterministic/approved fallback.
- Stripe: pending/retry; URL flag alone never unlocks.
- Scheduling: fallback contact/scheduling path.
- CRM/Growth: log and continue.
- Analytics: D1 event preferred; third-party failure non-blocking.

## 5. Common API Envelope and Generation Contract

Representative request:

```json
{
  "action": "submit_triage | evaluate_acuity | get_or_create_score | ai_reason | get_chart | ...",
  "session_id": "gc_...",
  "bhr_id": "bhr_... | null-for-prefounder-until-venture-exists",
  "principal_id": "pr_...",
  "protocol": "founder_smb | athlete_career_ownership | ...",
  "current_stage": "GalviShot",
  "payload": {},
  "client_request_id": "uuid"
}
```

Representative response:

```json
{
  "success": true,
  "status": "ok | locked | needs_evidence | needs_followup | active_care | referral_required | human_review",
  "session_id": "gc_...",
  "principal_id": "pr_...",
  "bhr_id": "bhr_... | null",
  "data": {},
  "next_action": "view_chart | obtain_sight | book_clinic | start_spur | referral",
  "schema_version": "gc_1_0_20260824"
}
```

Canonical generation sources include deterministic `rules`, previously accepted `stored` results, unaccepted `openai_proposal`, and accepted governed AI. Previously accepted canonical results return exact stored versions rather than silently regenerating.

## 6. Seven-Day Build Sequence

### Day 1 — Universal Clinical Model + Lifecycle + Triage foundation

- Preserve 0.5 entry path while establishing principal/venture distinction, lifecycle state, protocol, acuity, Clinical Confidence, disposition, consent/audit foundations, and additive schema.
- Pre-Founder does not receive fabricated venture/BHR.
- Customer and clinician projections preserve authorized boundaries.
- Gate: deterministic identity, lifecycle, triage and D1 continuity are clean before proceeding.

### Day 2 — Vitals + Score + Evidence/Confidence architecture

- Add Business Health/Founder Readiness evidence structures, deterministic scoring, confidence, evidence quality, contradictions, targeted follow-up and protocol overlays.
- Preserve canonical identity and version all material evidence/results.
- Gate: no duplicate records/results on refresh or replay; red-flag/acuity remains distinct from health score.

### Day 3 — Governed AI + GalviEngine 1.0

- Enable OpenAI server-side through GalviEngine provider adapter.
- Build governed evidence bundle, prompt/schema/version metadata, validation/acceptance/rejection ledger, timeout/fallback and human-review handling.
- AI is proposal/reasoning assistance, not canonical authority.
- Gate: accepted AI traces to evidence; invalid/cross-record/unsupported output rejects; deterministic/stored fallback works when provider is unavailable.

### Day 4 — GalviChart + Sight/Path customer/clinician projections

- Activate GalviChart after verified GalviShot entitlement.
- Progressively enrich same Chart after Sight, Path, Clinic and monitoring.
- Preserve customer vs clinician authorization boundaries, history, corrections, refresh and return/resume.
- Gate: no new Chart identity on enrichment; reads do not regenerate AI or create material writes.

### Day 5 — Active Care: Clinic + Treatment + Rx/Audit/Referral + Monitoring

- GalviClinic Business Physician encounter uses same Chart and canonical BHR.
- Treatment Plan is governed, versioned and auditable; GalviRx, GalviAudit/Lab, referrals and monitoring/outcomes attach to same plan/action/case.
- GalviGuide remains bounded; regulated/high-stakes decisions escalate to Business Physician or external licensed professionals.
- Gate: closed loop Clinic -> Treatment -> intervention/referral -> monitoring/outcome -> Vault -> reassessment; payments/booking preserve source context.

### Day 6 — GalviStudio + GalviPro operating model

- Operationalize four GalviStudio pillars, FDI/SPUR, Venture Development stage gates, initial Sprints and GalviCare Venture 001 proof.
- Care-to-Studio prescriptions create one linked engagement; ADVANCE/HOLD/REWORK/STOP are evidence-gated and append history.
- Studio outcomes write back to Vault/Chart and create explicit reassessment.
- GalviPro Business Physician scope, encounter protocol, treatment rights and regulated boundaries are operational.
- Gate: same principal/BHR/Chart persists across care and Venture Development; no shadow customer record; rollback remains non-destructive.

### Day 7 — Commercial Readiness + Human E2E + Release Gates + Production Cutover

Day 7 is a release-and-proof day, not an architecture day.

- Freeze features.
- Prove exact Day 6 handoff and deployed QA candidate.
- Lock entitlements, GalviChart activation, paid diagnostics, Clinic payment/booking, Membership beta, Studio package/order contracts.
- Run security/accessibility/trust review.
- Execute complete inherited regression, Day 7 release tests, D1 integrity, Golden Cases, Human E2E P0 matrix, rollback rehearsal and all formal release gates.
- Promote only the exact tested QA candidate to existing `main` after pre-production GO.
- Apply only exact tested additive production migrations.
- Verify production Worker, D1, origins, OpenAI config, Stripe LIVE server-side entitlement and fixture/debug disablement.
- Run controlled no-payment, LIVE paid Shot -> Chart, governed AI, record/audit, Clinic and non-regulated referral/Studio tests before public CTA cutover.
- Switch public Carrd/primary CTA only after controlled production proof and with rollback immediately ready.
- Complete the release evidence package and final owner sign-offs.

## 7. Day 7 Release Principle and Gates

### Feature freeze

Only release-closing P0/P1, security/data, payment/entitlement, unsafe-AI, wrong-routing, deployment/cutover, trust-boundary or evidence gaps are authorized. New feature families, broad UX redesign, schema redesign, pricing experiments, protocol expansion, unrelated refactors and post-1.0 capabilities are deferred.

### Branch and publication policy

- Existing QA ref only for QA implementation: `qa-revamped-galvicare-0-5`.
- No `work`, Day7, release, workaround or new branch family.
- `main` is production destination, not authoring checkout.
- If the task shell is pinned to `work`, do not commit/push `work`; use detached exact-base worktree or GitHub blob/tree/commit publication and update only the existing QA ref after a race check.
- Production publication is existing QA -> existing `main`; if PR is required, PR existing QA -> existing main.
- Never force push.

### Security / trust gate

Customer identity, consent, RBAC, protected projections, audit history, safe ingestion, environment separation, server-side secrets, input controls, safe errors and accessibility must pass. Wrong-record exposure, secret exposure, client-side authorization, unsafe AI projection or consent bypass is NO-GO.

### Commercial gate

Entitlements and paid access are server-verified and idempotent; GalviChart activation, Membership beta, Clinic booking/payment, referral/Studio handoff and recovery operate against the canonical record. Adapter failure cannot block the core care system.

### Formal release gates

**GalviCare 1.0:** universal clinical model; acuity/confidence/red flags; Pre-Founder/Founder; Vitals/Score/Shot/Sight/Path; governed AI; GalviChart; GalviVault; Clinic/Treatment/Rx/monitoring; Audit/Lab/referral; bounded Guide; auth/consent/RBAC/audit; payments/booking/Membership; analytics/recovery.

**GalviStudio 1.0:** Venture Development & Innovation Management identity; four-pillar model; FDI inside Studio; SPUR; Pre-Founder handoff; evidence-gated ADVANCE/HOLD/REWORK/STOP; Sprint library; Protect Optionality First; Venture 001 proof; referral boundaries; KPI/scorecard.

**GalviPro 1.0:** Business Physician methodology/scope/boundaries; Business Physician vs GalviClinician/Guide decision rights; standardized Clinic protocol; Treatment Plan in Vault; passive/active/specialty/referral rules; GalviGage treatment-order requirement; actor/version/audit traceability; mandatory follow-up/outcome; commercially usable scheduling/payment.

Payment/session integrity, record correctness, authorization, AI governance, treatment integrity or rollback failure is an automatic NO-GO for the affected path.

## 8. Pre-Production GO Gate

Production cutover is prohibited until one immutable final QA candidate has all of the following evidence:

- Signed Day 6 baseline proven; no new branch; final Day 7 QA candidate SHA recorded.
- Feature-freeze manifest shows only release-critical changes.
- Focused tests + full inherited Day 1-6 regression + Day 7 T01-T60 PASS, mandatory skipped=0.
- D1-1..D1-22 integrity assertions PASS, `manual_repair=NO`.
- P0-01..P0-16 Human E2E PASS against exact deployed candidate.
- Security/accessibility/trust checklist PASS.
- Commercial entitlement/Membership/Clinic/Studio contract PASS in QA.
- All three formal 1.0 release gates PASS for intended launch paths.
- Exact production migration set and hashes identified; additive rollback compatibility proven.
- Production environment manifest completed: DB, Worker name, origins, Stripe mode, OpenAI model config, frontend/public route.
- Pre-cutover `origin/main` SHA, current production frontend/Worker version, production D1 schema and public CTA/embed route captured.
- Rollback package complete and pre-production rollback rehearsal PASS.
- Release evidence folders 01-13 complete enough to support cutover; `14_release` waits for production proof.

Do not use production cutover as a test environment. If the exact QA candidate has not passed every applicable release gate, STOP / REMEDIATE IN QA / RETEST.

## 9. Production Environment Manifest

Capture before cutover:

- `origin/main` exact SHA and ancestry vs final QA candidate.
- Production frontend deployment/version/URL and current Carrd/CTA/embed route; rollback URL/route.
- Production Worker deployment/version, Worker name, environment marker and rollback version.
- Production D1 database/binding ID and migration manifest; no QA binding.
- OpenAI secret presence and environment-configured model name without disclosing the value; server-side only, debug off, disable/fallback mechanism known.
- Stripe LIVE configuration, webhook identity and approved product/link/metadata map; server verification and prior live rollback path.
- Approved production CORS origins and role matrix; no QA/dev origin or fixture bypass.
- Candidate storefront route testable before public switch.
- Clinic/referral/Studio fallback procedures that do not reconstruct records.

## 10. Production Cutover — Exact Sequence

1. Freeze final QA candidate; record SHA/tag/version manifest; archive QA evidence.
2. Re-fetch QA/main; prove final QA SHA, expected main SHA and ancestry; no race/divergence.
3. Publish exact signed candidate existing QA -> existing main via approved fast-forward or PR. No new branch.
4. Fetch and require `origin/main == signed release SHA`.
5. Verify production D1; apply only exact tested additive migration set in tested order; record hashes/results/post-schema. No production-only SQL.
6. Deploy production Worker using exact signed code; `ENVIRONMENT=production`; fixtures/test overrides disabled; production D1/secrets; capture runtime marker.
7. Verify OpenAI secret/model configuration as Worker-only; prompt/evidence debug off; deterministic/stored fallback available.
8. Verify Stripe LIVE secrets/webhook/payment metadata; server-side entitlement and rollback/disable path.
9. Confirm production CORS, authentication, role/entity scope and consent policy/version.
10. Deploy candidate frontend/app to a testable production URL/path before replacing public Carrd/CTA.
11. Run no-payment production smoke Triage -> Vitals; verify principal/session/evidence/events/audit and correct production D1.
12. Run one controlled paid production Shot -> Chart transaction; verify LIVE payment, one entitlement, one stored result, same Chart activation, refresh/replay safety and D1/audit/events.
13. Run one governed production AI generation; verify evidence lineage, validation, model/prompt/schema versions, customer-safe projection and no sensitive logging.
14. Run one controlled GalviClinic booking and one non-regulated referral or Studio prescription if operationally feasible; preserve source session/BHR/plan lineage.
15. Run safe production role/cross-record negative probe; verify denial/audit/no leak.
16. Check observability for API, record integrity, AI, care progression, commercial, security and adapters.
17. Only after prior steps PASS, switch public Carrd/primary CTA/embed; record prior/new route.
18. Run public-route smoke from clean browser; no stale QA/mixed environment; correct production journey.
19. Complete `14_release` and owner sign-offs. Declare PASS only if rollback remains ready.

## 11. Controlled Production Smoke Matrix

- PROD-01 Runtime identity — frontend/Worker markers equal signed release SHA/version.
- PROD-02 Environment — D1/Stripe/OpenAI/CORS/auth production-specific; no QA/test override.
- PROD-03 No-payment path — fresh Triage -> Vitals; correct production record/event/audit.
- PROD-04 Paid Shot -> Chart — controlled LIVE transaction verifies entitlement and same Chart.
- PROD-05 Paid replay — refresh/return/webhook replay does not duplicate payment/entitlement/result/Chart.
- PROD-06 Governed AI — bounded accepted generation has evidence lineage/versions and safe fallback.
- PROD-07 Clinic booking — preserves source session/principal/BHR; no duplicate context.
- PROD-08 Studio/referral — non-regulated prescription/referral preserves record/plan lineage.
- PROD-09 Authorization — safe cross-record/role probe denied/audited.
- PROD-10 Analytics — canonical D1 events; adapters non-blocking; no sensitive leakage.
- PROD-11 Public route — CTA points to production only after prior checks; clean-browser smoke works.
- PROD-12 Rollback readiness — prior frontend/Worker/public route and disable/fallback assets immediately available.

The controlled paid test is a release gate. QA TEST mode cannot substitute for LIVE payment correctness; general traffic does not open before controlled LIVE proof.

## 12. Rollback Package and Rehearsal

Required assets:

- Frontend: last known-good production commit/deployment + prior public route.
- Worker: last known-good production deployment/version + non-secret config snapshot.
- Database: tested migration files/hashes; backup/export/recovery; additive compatibility; no destructive migration dependency.
- OpenAI: feature/provider disable switch; deterministic/stored fallback.
- Stripe: existing live products/links retained until new flow proven; ability to disable affected entitlement path without deleting authorized records.
- Storefront: previous embed/CTA URL/value and exact switch-back procedure.
- Operations: manual Clinic/referral/Studio scheduling fallback using canonical records if an adapter fails.

Mandatory pre-production rehearsal: restore prior known-good runtime in QA/safe lane without destroying additive Day 6/7 data; prove representative Triage/Vitals and stored Chart/Clinic/Studio data; restore final Day 7 candidate; prove same canonical data; record SHAs/deployment IDs/schema/smoke/duration and `manual_repair=NO`.

Rollback triggers include wrong-record exposure, payment mismatch/lost paid result, canonical corruption/duplicate identity/migration uncertainty, unsafe AI/fallback failure, treatment/referral integrity failure, runtime not equal signed SHA, wrong D1/environment binding, unrecoverable public critical path, or unavailable/destructive rollback.

## 13. Release Evidence Package

1. `01_baseline` — known-good fingerprints, signed Day 6 baseline, branch/remote manifests, deployed versions, rollback targets.
2. `02_architecture` — 1.0 system diagram, Core/Protocol/Payer contract, scope, version manifest.
3. `03_schema` — D1 diff, migration files/hashes/indexes, rollback compatibility, consent/RBAC mapping.
4. `04_api_contracts` — representative request/response, safe errors, authorization negatives.
5. `05_clinical_golden_cases` — Founder, Pre-Founder, acuity, low confidence, red flag, contradiction and expected outputs.
6. `06_governed_ai` — provider config names without secrets, prompt/schema/model versions, accepted/rejected examples, evidence lineage, outage/fallback.
7. `07_galvichart` — activation, progressive update, customer/clinician projection, return/resume, correction/history.
8. `08_active_care` — Clinic, finding validation, Treatment Plan, Rx, Audit/Lab, referral, monitoring/outcome.
9. `09_galvistudio` — four-pillar catalog, SPUR, VDM gates, prescribed Sprint, Venture 001 proof.
10. `10_payments_membership` — QA TEST, controlled LIVE verification, entitlement row, Membership beta, duplicate/replay evidence.
11. `11_security_accessibility` — secret/source/network scan, RBAC negatives, consent, safe errors, accessibility.
12. `12_analytics_growth` — canonical D1 events and non-blocking GA4/Clarity/HubSpot proof.
13. `13_human_e2e` — P0-01..P0-16 run sheet, UI + D1/runtime/audit IDs, defects/resolutions, PASS, `manual_repair=NO`.
14. `14_release` — production URLs, final SHAs/tag, main publication, Worker/frontend deployment IDs, schema/prompt/rules/protocol versions, controlled transaction, public cutover, rollback, sign-offs.

Each artifact must identify exact environment + release SHA/version. Never include secret values, private tokens, raw protected evidence or sensitive prompt content. Screenshots are supporting evidence, not substitutes for D1/audit/runtime identity. QA evidence is not production evidence.

## 14. Final Production Sign-Off

- **Product:** every step delivers distinct customer value and creates a clinically logical next care/development decision.
- **Clinical / Business Medicine:** every score, acuity, finding, hypothesis, pathway, treatment and escalation traces to evidence, rules/protocol versions and authorized decision rights.
- **AI governance:** every customer-facing model statement traces to evidence bundle, model/prompt/schema and validation status; system remains safe when AI unavailable.
- **GalviVault / data:** one canonical longitudinal record per authorized principal/venture; no duplicate/cross-BHR contamination; complete treatment/outcome history.
- **Security / privacy:** secrets server-side, consent persisted, RBAC enforced, projections separated, recovery/export/retention rules defined.
- **GalviStudio:** prescribed Venture Development intervention can be entered, stage-gated, measured and written back as outcome evidence.
- **GalviPro:** Business Physician can conduct standardized Clinic encounter and create/refine treatment from one coherent GalviChart.
- **Commercial:** paywalls, Chart activation, Membership, Clinic, Studio programs and referrals operate as one care system.
- **Operations:** first customers can be operated with fallbacks without reconstructing records across tools.
- **Release:** all P0 Human E2E tests and all three gates pass, controlled production transaction completes, public cutover verifies, rollback rehearsed.

## 15. Day 7 Stop / Go

GO only when the exact signed final QA candidate has passed the full inherited regression, Day 7 release tests, D1 integrity, security/accessibility review, P0-01..P0-16 Human E2E and all applicable GalviCare/GalviStudio/GalviPro release gates; the exact candidate has been published to existing main without a new branch or force; exact tested additive migrations and production bindings/config are verified; controlled production no-payment, LIVE paid Shot -> Chart, governed AI, record/audit and operational Clinic/referral/Studio checks pass; public CTA switches only afterward; rollback remains available; evidence package is complete with `manual_repair=NO`.

STOP / NO-GO / ROLLBACK if the Day 6 baseline is unsigned/unproven; Codex authors on work/main; a new branch is required; QA/main moves unexpectedly; production runtime is not signed SHA; production uses QA/test binding; a production-only SQL/code fix is proposed; payment/session integrity fails; record identity/authorization is wrong; AI governance/fallback fails; regulated routing/treatment integrity fails; a P0 Human E2E or release gate is red; rollback is destructive/unavailable; or PASS depends on manual repair.
