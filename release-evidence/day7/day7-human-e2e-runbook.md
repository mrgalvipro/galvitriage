# GalviStudio 1.0 | GalviCare 1.0 — Day 7 Human E2E Runbook

**Candidate rule:** run only against the exact deployed immutable QA candidate after the automated Day 7 QA gate is green.  
**Repair rule:** `manual_repair=NO`. Never use ad-hoc SQL, row deletion, session manipulation, URL entitlement flags, or fixture mutation to create a PASS.  
**Mutation rule:** any application code, runtime config, or migration change invalidates affected Human E2E evidence; rerun the failed step, its regression slice, and the complete affected gate.  
**Promotion rule:** Do not promote `main` or touch Production until P0-01..P0-16, Golden A-I, all three release gates, security/accessibility, D1-1..D1-22, and rollback evidence are green.

## Tester setup
1. Open the QA customer URL in a clean browser profile with DevTools available.
2. Record QA frontend `/health`, backend `/health`, and `/api/v1/day7/readiness`.
3. Record the exact candidate SHA shown by runtime health.
4. Use Stripe TEST only in QA. Never use LIVE payment in QA.
5. For every case capture timestamp, browser, session/context ID, principal ID, BHR ID if applicable, Chart/BHR identity, product/result IDs, plan/action IDs, screenshots, API status, and canonical D1/audit evidence location.
6. For negative cases capture the safe 4xx status/error code and confirm no partial write.
7. Mark PASS only when UI + runtime + canonical record evidence agree.

## Golden clinical cases
- **Golden A:** Founder/SMB revenue/customer evidence gap — evidence weighting/contradiction, governed Shot/Sight/Path, GTM route.
- **Golden B:** Founder capacity strain — readiness/acuity, Founder Development, correct active/passive care.
- **Golden C:** Product readiness gap — Product Sprint route and governed Studio handoff.
- **Golden D:** Broad early-stage weakness + low confidence — targeted evidence request, no invented certainty.
- **Golden E:** Strong venture with distribution bottleneck — positive framing and bounded root-cause hypothesis without PMF overdiagnosis.
- **Golden F:** Pre-Founder athlete/professional — principal-only record, Founder Readiness subtype, SPUR/FDI, no fabricated venture/BHR.
- **Golden G:** Regulated/red-flag — acuity override/referral and safe AI boundary.
- **Golden H:** Payment/Chart recovery — server-verified entitlement, same Chart/BHR, replay safety.
- **Golden I:** Active treatment → Studio Sprint → outcome — Clinic/plan → Studio → outcome → Vault/Chart → reassessment.

## P0-01 — Founder full journey
Complete Triage → Vitals → Score (including clarification) → QA TEST Shot payment → Chart → Sight → Path → Clinic → Business Physician Treatment Plan. Capture one continuous session/context/principal/BHR/Chart lineage. **PASS:** no blank critical state, no duplicate identity, correct evidence/entitlements, same BHR/Chart throughout.

## P0-02 — Pre-Founder / athlete principal-only
Start without a real venture; complete intake; verify Founder Readiness + SPUR/FDI route; inspect record. **PASS:** principal exists while venture/BHR remain null; Founder path is not unlocked until canonical venture context exists.

## P0-03 — Low confidence / needs evidence
Use insufficient or contradictory evidence; confirm targeted clarification; answer only part and re-check. **PASS:** uncertainty remains explicit and unresolved state routes to needs-evidence/`human_review`, not autonomous certainty.

## P0-04 — Acuity versus health
Run a healthy-but-urgent/red-flag case and an unhealthy-but-nonurgent case. **PASS:** disposition is independent of aggregate health and red-flag override works.

## P0-05 — Regulated referral
Use a legal/tax/securities/regulated judgment case; open GalviGuide/care action. **PASS:** no autonomous regulated advice; referral, consent and minimum-disclosure handoff are explicit.

## P0-06 — Governed OpenAI
Execute supported Shot/Sight/Path reasoning with governed evidence; inspect accepted generation metadata; inspect rejected/unsupported path and provider fallback. **PASS:** same-record evidence refs; model/prompt/schema versions retained; rejected proposal not projected; deterministic/stored fallback remains usable.

## P0-07 — GalviChart activation/progression
Attempt Chart pre-Shot; complete QA TEST Shot; reopen Chart; progress Sight/Path/Clinic/check-in. **PASS:** pre-Shot locked, post-Shot activated, one Chart/BHR becomes progressively richer.

## P0-08 — Clinician projection
Open same Founder as Business Physician, verify authorized clinical context/controls, then customer view. **PASS:** customer cannot see protected clinician/internal/audit controls and both projections reference same BHR.

## P0-09 — Treatment → Studio Sprint → outcome
From Treatment Plan prescribe approved Studio Sprint; verify one linked engagement; exercise HOLD/ADVANCE evidence gate; record outcome; reopen Chart/timeline. **PASS:** outcome writes back and creates reassessment without a second record.

## P0-10 — GalviAudit / GalviLab
Order diagnostic from governed Treatment Plan and inspect result/evidence linkage. **PASS:** order/result remains linked to same BHR/plan/finding/action and history is preserved.

## P0-11 — Stripe TEST duplicate return
Complete one QA TEST paid return; replay/refresh same return; reopen result. **PASS:** one payment/entitlement/result and no duplicate Chart activation.

## P0-12 — Business Health Membership
Start Membership from an active Treatment Plan; replay start; submit check-in; verify timeline; verify same BHR/plan plus pending reassessment queue; replay check-in; cancel and replay cancel. **PASS:** one active membership per BHR, start/cancel replay safe, check-in plan-bound/timeline-visible, next human reassessment queued.

## P0-13 — Unauthorized / cross-record
Attempt clinician/Studio action as customer/GalviGuide and mismatched principal/BHR or plan/BHR action. **PASS:** safe 403/404, no leak, no partial write, audit evidence.

## P0-14 — Adapter outage
Use approved QA mechanism to produce HubSpot/GA4/Clarity adapter failure and complete a core care write/read. **PASS:** canonical D1 completes, adapter failure is non-blocking, no sensitive AI/protected payload emitted.

## P0-15 — Refresh / return / incognito
Refresh during journey and after paid result; close/reopen supported return; open clean incognito/new session. **PASS:** authorized return resumes same record and new user does not inherit another user's state.

## P0-16 — Non-destructive rollback
Record final candidate/runtime IDs and canonical IDs; run approved QA rollback to prior Day 6 runtime without down-migration; verify representative Triage/Vitals/Chart/Clinic/Studio data; restore exact Day 7 candidate; re-check IDs/readiness. **PASS:** prior runtime tolerates additive schema, final candidate restores, no data deletion/reconstruction/manual SQL, `manual_repair=NO`.

## Final Human sign-off
Record exact QA candidate SHA, frontend/Worker versions, QA D1 ID/schema, Golden A-I status, P0-01..P0-16 status, security/accessibility/trust status, GalviCare/GalviStudio/GalviPro gate status, rollback status, `manual_repair=NO`, and final PRE-PRODUCTION GO / NO-GO decision.
