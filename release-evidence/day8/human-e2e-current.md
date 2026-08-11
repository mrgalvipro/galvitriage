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

### E2E-02 — Business Physician enrollment/authentication — PASS
Observed in normal browser profile after one-time approved-device enrollment:
- Enrollment request returned HTTP `201`.
- Subsequent `/api/v1/operator/me` returned HTTP `200`.
- UI rendered `Signed in: Mr. GalviPro (business_physician)`.
- Founder search became available only after successful authenticated session establishment.

### E2E-03 — Founder search — IN PROGRESS / FIXTURE MISMATCH IDENTIFIED
Human test used `Test2 Tester` and `test2@tester.com` from prior GalviCare runs.
Observed:
- authenticated founder-search route returned HTTP `200` for both exact name and exact email;
- UI returned no result and therefore did not enter E2E-04.

Read-only QA D1 diagnostic proved the exact cause:
- `Test2 Tester` / `test2@tester.com` does **not** exist in the canonical GalviVault QA Founder/Venture/BMR join used by Day 8 search;
- the search route itself is functioning and returning a valid empty bounded result;
- HubSpot/contact presence is not proof of canonical GalviVault QA D1 presence.

No implementation change is warranted for this observed result. The correct next action is to use an existing canonical QA D1 Founder/Venture/BMR fixture.

Approved next fixture from QA D1:
- Founder: `Day Four`
- Email: `founder.day4.31189484560-1@example.test`
- founder_id: `fdr_3ba68b8ee59543c793ad735bb43a858e`
- venture_id: `ven_82fab4017a4a473bab403755276be4ff`
- venture_name: `Day 4 Reasoning Venture 31189484560-1`
- bmr_id: `bmr_0d72e878cc634917ae2ac8430a73331f`
- bmr_status: `treatment_active`
- record_version: `2`
- active primary founder/venture role: yes

## Next exact Human E2E target

### E2E-03 retry — canonical QA D1 fixture
Search the exact email `founder.day4.31189484560-1@example.test`.
Pass proof required:
- one correct bounded result;
- returned IDs match the recorded canonical fixture;
- no unrelated Founder records leaked.
Then open that result to begin E2E-04 and prove the canonical BMR chart.

## Human E2E status

- [x] E2E-01 fresh-session login screen
- [x] E2E-02 Business Physician enrollment/authentication
- [ ] E2E-03 Founder search — fixture corrected; Human retry pending
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
- D8-02 Founder search + chart projection: **IN PROGRESS — search implementation healthy; canonical fixture retry pending**
- D8-03 Governed GalviClinic care workflow: **PENDING Human E2E-08..13**
- D8-04 Continuity + D1 integrity: **PENDING Human E2E-07/14/15/16/18**
- D8-05 GalviVault + GalviCare regression: **PASS automated/deployment evidence**
- D8-06 Human E2E + evidence: **IN PROGRESS**

Final declaration remains blocked until every mandatory Human E2E and D1 assertion passes on the same Day 8 QA candidate.