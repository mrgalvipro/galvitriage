# GalviVault Day 8 Human E2E — Current Evidence

Current clinician UI candidate under Human test: `5107b4cf957131267765b5a2e068aaf21e414b63`
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

### E2E-03 — Founder search — PASS
Canonical QA fixture used:
- Founder: `Day Four`
- Email: `founder.day4.31189484560-1@example.test`
- founder_id: `fdr_3ba68b8ee59543c793ad735bb43a858e`
- venture_id: `ven_82fab4017a4a473bab403755276be4ff`
- venture_name: `Day 4 Reasoning Venture 31189484560-1`
- bmr_id: `bmr_0d72e878cc634917ae2ac8430a73331f`
- BMR status/version: `treatment_active v2`
Observed:
- authenticated founder-search route returned HTTP `200`;
- one bounded canonical result rendered;
- no unrelated Founder result was displayed.

### E2E-04 — Canonical BMR chart — PASS
Observed after selecting the E2E-03 result:
- chart request returned HTTP `200`;
- canonical BMR `bmr_0d72e878cc634917ae2ac8430a73331f` opened;
- lifecycle/version rendered as `treatment_active · v2`;
- chart tabs rendered Overview, Timeline, Evidence, Findings, Care Plan, GalviClinic Session, and Outcomes / Follow-up;
- venture identity matched the selected canonical result.

### E2E-05 — Findings projection — PASS
Human recheck after the bounded clinician-UI projection remediation showed structured current reasoning rather than a raw JSON blob.
Observed:
- Current Reasoning rendered separate Observations, Hypotheses, and Findings sections;
- canonical IDs were visible;
- statements were visible;
- status/confirmation state was visible;
- confidence was visible;
- source/version context was visible;
- support counts were visible;
- Business Physician Finding Governance form was present below the read projection;
- no finding mutation was submitted during this read-only proof.

### E2E-06 — Care Plan projection — PASS
Human recheck showed structured current care rather than a raw JSON blob.
Observed:
- Recommendations rendered separately with canonical ID, title, status, code, version, and created timestamp;
- Treatment Plans rendered separately with canonical ID, title, status, version, and created timestamp;
- Treatment Events rendered as their own record class;
- Outcomes displayed an explicit empty state when none were recorded;
- Feedback / Follow-up displayed an explicit empty state when none were recorded;
- Recommendation/Treatment Plan action forms were present below the read projection;
- no clinical mutation was submitted during this read-only proof.

## Next exact Human E2E target

### E2E-07 — Refresh / same BMR — PENDING
Use the currently open `Day Four` chart.
Required Human proof:
1. record the currently visible canonical BMR ID and lifecycle/version;
2. hard-refresh the browser page;
3. re-authentication must not be required while the active secure session remains valid;
4. search/re-open the same `Day Four` Founder if the SPA intentionally returns to workspace home after refresh;
5. the same canonical BMR ID `bmr_0d72e878cc634917ae2ac8430a73331f` must return;
6. lifecycle/version must remain `treatment_active · v2` unless a governed write occurred (none has yet);
7. no duplicate BMR or alternate venture identity may appear.

Do not change implementation code unless this exact continuity test fails. If it fails, use the observed UI/HTTP/canonical-ID discrepancy as the next remediation target.

## Human E2E status

- [x] E2E-01 fresh-session login screen
- [x] E2E-02 Business Physician enrollment/authentication
- [x] E2E-03 Founder search
- [x] E2E-04 canonical BMR chart
- [x] E2E-05 Findings
- [x] E2E-06 Care Plan
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
- D8-02 Founder search + chart projection: **PASS Human E2E-03/04/05/06**
- D8-03 Governed GalviClinic care workflow: **PENDING Human E2E-08..13**
- D8-04 Continuity + D1 integrity: **IN PROGRESS — E2E-07 is next; E2E-14/15/16/18 remain pending**
- D8-05 GalviVault + GalviCare regression: **PASS automated/deployment evidence**
- D8-06 Human E2E + evidence: **IN PROGRESS**

Final declaration remains blocked until every mandatory Human E2E and D1 assertion passes on the same Day 8 QA build lineage.