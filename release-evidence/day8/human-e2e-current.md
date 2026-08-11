# GalviVault Day 8 Human E2E — FINAL

Tested QA candidate: `29a8f38146db2f1f0a096bf5bc4cce67286b8fd8`
Evidence commit after automated run: `d15bddc`
QA portal: `https://galvivault-day8-qa.mrgalvipro.workers.dev/`
Worker deployment version: `3e162399-0387-4291-85f2-ec15bd447123`
Auth mode: `worker_device_ecdsa_session`
Schema: `0007`
Canonical Human fixture BMR: `bmr_0d72e878cc634917ae2ac8430a73331f`
Founder fixture: `founder.day4.31189484560-1@example.test`

## Human E2E result

The Product Owner supplied Human screenshots during the Day 8 execution showing the clinician UI, Network/Console responses, canonical IDs, role context, governed care records, continuity, conflict behavior, and the second GalviClinician path. The final automated QA run then executed read-only D1 proof and a public GalviCare smoke against the same Day 8 build lineage.

- [x] E2E-01 fresh-session login screen — protected chart not visible pre-auth; `/api/v1/operator/me` denied.
- [x] E2E-02 Business Physician enrollment/authentication — approved-device enrollment and authenticated `/me`.
- [x] E2E-03 Founder search — bounded canonical result for the Day Four fixture.
- [x] E2E-04 canonical BMR chart — `bmr_0d72e878cc634917ae2ac8430a73331f` opened.
- [x] E2E-05 Findings — governed reasoning projection visible with source/version/support context.
- [x] E2E-06 Care Plan — recommendations, plans, events and outcomes remain separate record classes.
- [x] E2E-07 refresh/same BMR — same canonical BMR recovered after refresh.
- [x] E2E-08 GalviClinic note/evidence — bounded note persisted as evidence/source material and remained attached to the same BMR.
- [x] E2E-09 governed finding decision — governed finding state/version path completed.
- [x] E2E-10 recommendation — recommendation created/reviewed with governed finding lineage.
- [x] E2E-11 treatment plan — treatment plan created through same-BMR care lineage and atomic validation.
- [x] E2E-12 treatment event — append-only treatment event visible in the longitudinal record.
- [x] E2E-13 outcome/follow-up — one sourced/timed `D8_FOLLOW_UP_STATUS` outcome persisted.
- [x] E2E-14 conflict/idempotency negative — changed-payload idempotency reuse returned HTTP `409`; final D1 assertion confirmed the canonical outcome count remained exactly one.
- [x] E2E-15 logout/direct-URL denial — protected state cleared after logout and direct protected access denied.
- [x] E2E-16 second GalviClinician/same BMR — `GalviClinician QA (clinician)` enrolled/authenticated and retrieved the same BMR/current state.
- [x] E2E-17 role-negative — clinician POST to `/api/v1/governance/confirmations` returned HTTP `403 Forbidden`; Business Physician-only route remained fail-closed.
- [x] E2E-18 final D1 assertion catalog — PASS on QA D1, read-only. One fixture BMR; evidence=2; findings=3; recommendations=3; treatment plans=2; treatment events=2; outcomes=1; E2E-13/14 outcome count=1; orphan recommendation/findings=0; orphan treatment items=0; orphan treatment links=0; orphan outcome/evidence=0.
- [x] E2E-19 public GalviCare smoke — PASS; QA public application returned HTTP `200` and retained GalviCare, GalviTriage and GalviVitals markers.

## Automated regression result

Run `31542636774` / job `93948290315` completed `success` for tested candidate `29a8f38146db2f1f0a096bf5bc4cce67286b8fd8`.

- Day 8 focused suite: `34 passed / 0 failed / 0 skipped`.
- Full inherited suite: `143 passed / 0 failed / 0 skipped`.
- Branch/GalviCare baseline protection: PASS; protected public GalviCare runtime/config files unchanged from baseline `eb8630c112ac5557bd374e5f5e1db05e4435bad5`.
- QA operator/D1 identity: migrations `0001` through `0007` present; duplicate BMR ventures `0`; active operator credentials `2`; active second-clinician credential `1`; used second-clinician invitation `1`.
- Pre-auth protected API: `/api/v1/operator/me` returned `401` and leaked no founder/BMR identifiers.
- Final E2E-18 D1 step: PASS.
- Final E2E-19 public GalviCare smoke: PASS.

## Day 8 gates

- [x] D8-01 Secure clinician identity — PASS.
- [x] D8-02 Founder search + chart projection — PASS.
- [x] D8-03 Governed GalviClinic workflow — PASS.
- [x] D8-04 Continuity + D1 integrity — PASS.
- [x] D8-05 GalviVault + GalviCare regression — PASS.
- [x] D8-06 Human E2E + complete release evidence — PASS, subject to the final evidence index committed with this release-evidence update.

No undocumented repair or direct D1 mutation was used to make a Human E2E assertion pass. E2E-18 used read-only assertions. Day 8 remained isolated from the public GalviCare runtime.

**DAY 8 HUMAN E2E PASS — CLINICIAN GALVIVAULT WORKSPACE READY FOR GALVICARE | GALVIVAULT INTEGRATION E2E.**
