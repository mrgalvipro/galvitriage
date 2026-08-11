# GalviVault Day 8 Human E2E — Current Evidence

Candidate under test: `a15d02df661357b9d3e9e2f2032fa146b60e6554`
QA portal: `https://galvivault-day8-qa.mrgalvipro.workers.dev/`
Auth mode: `worker_device_ecdsa_session`
Schema: `0006`

## Human evidence recorded

### E2E-01 — Pre-auth fresh/private session — PASS
Observed in fresh Incognito browser session:
- GalviVault Clinician Workspace loaded with `QA — NOT PRODUCTION` marker.
- Business Physician Workspace displayed a real sign-in/enrollment gate.
- No Founder chart or protected BMR content was visible before authentication.
- Network evidence showed `/api/v1/operator/me` returning HTTP `401 Unauthorized`.

This satisfies the Day 8 pre-auth requirement: sign-in gate present; no protected chart/PII exposed.

### E2E-02 — Business Physician enrollment/authentication — PASS
Observed in normal browser profile after one-time approved-device enrollment:
- Enrollment request returned HTTP `201`.
- Subsequent `/api/v1/operator/me` returned HTTP `200`.
- UI rendered `Signed in: Mr. GalviPro (business_physician)`.
- Founder search became available only after successful authenticated session establishment.
- One-time enrollment secret is intentionally not recorded in repository evidence.

This satisfies the Day 8 Business Physician identity/role Human proof.

## Next exact Human E2E target

### E2E-03 — Founder search — PENDING
Action: search one known QA founder by exact email or exact name.
Pass proof required:
- correct single/limited result;
- capture `founder_id`, `venture_id`, and `bmr_id` from the returned result/chart flow;
- no unrelated Founder records leaked.

Do not change implementation code unless this exact Human test fails. If it fails, use the observed HTTP/UI failure as the next remediation target.

## Human E2E status

- [x] E2E-01 fresh-session login screen
- [x] E2E-02 Business Physician enrollment/authentication
- [ ] E2E-03 Founder search
- [ ] E2E-04 canonical BMR chart
- [ ] E2E-05 Findings
- [ ] E2E-06 Care Plan
- [ ] E2E-07 refresh / same BMR
- [ ] E2E-08 GalviClinic note/evidence
- [ ] E2E-09 governed finding decision
- [ ] E2E-10 recommendation
- [ ] E2E-11 treatment plan
- [ ] E2E-12 treatment event
- [ ] E2E-13 outcome/follow-up
- [ ] E2E-14 conflict/idempotency negative
- [ ] E2E-15 logout/direct-URL denial
- [ ] E2E-16 second GalviClinician / same BMR
- [ ] E2E-17 role-negative
- [ ] E2E-18 final D1 assertion catalog
- [ ] E2E-19 final public GalviCare smoke

## Day 8 gate status

- D8-01 Secure clinician identity: **PASS for Business Physician Human proof; second-clinician coverage remains pending under E2E-16/17**
- D8-02 Founder search + chart projection: **PENDING Human E2E-03/04**
- D8-03 Governed GalviClinic care workflow: **PENDING Human E2E-08..13**
- D8-04 Continuity + D1 integrity: **PENDING Human E2E-07/14/15/16/18**
- D8-05 GalviVault + GalviCare regression: **PASS automated/deployment evidence**
- D8-06 Human E2E + evidence: **IN PROGRESS**

Final declaration remains blocked until every mandatory Human E2E and D1 assertion passes on the same Day 8 QA candidate.