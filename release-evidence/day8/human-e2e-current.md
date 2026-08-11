# GalviVault Day 8 Human E2E — Current Evidence

Current clinician UI candidate under Human test: `bf3c5883004e9286f11f325676262cd95184e495`
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

### E2E-07 — Refresh / same BMR — PASS
Human continuity proof after hard browser refresh:
- active Business Physician session survived refresh; `/api/v1/operator/me` returned HTTP `200` without re-enrollment;
- the SPA returned to the authenticated Business Physician workspace and the same Founder was searched again;
- founder search returned HTTP `200`;
- re-opened chart returned HTTP `200`;
- the same canonical BMR `bmr_0d72e878cc634917ae2ac8430a73331f` was returned;
- lifecycle/version remained `treatment_active · v2` because no governed write had yet occurred;
- Founder and venture identity remained `Day Four` / `Day 4 Reasoning Venture 31189484560-1`;
- no duplicate BMR or alternate venture identity appeared.

### E2E-08 — GalviClinic note/evidence — REMEDIATION IN PROGRESS
Human attempt used the bounded QA note:
`Day 8 Human E2E clinician note — continuity verified; no production action.`

Observed exact failure before remediation:
- protected `POST /api/v1/evidence` reached the QA Worker;
- Worker returned HTTP `422 Unprocessable Content`;
- canonical error code: `GV_REQ_SCHEMA`;
- message: `value_type is unsupported.`;
- correlation ID: `corr_4c043031fd5041a1a0b9a32dab55dfa9`;
- request was correctly scoped to BMR `bmr_0d72e878cc634917ae2ac8430a73331f` and the active assessment session;
- no evidence write was committed because schema validation failed before persistence.

Root cause confirmed against the inherited Day 3 canonical evidence contract:
- `/api/v1/evidence` expects top-level `source_type`, optional `source_ref`, `value_type`, exactly one compatible typed value field, and `captured_at`;
- the Day 8 portal incorrectly sent Day 8 convenience fields (`evidence_type`, `source_product`, `source_reference`, nested `content.value_text`, `observed_at`) instead of the canonical evidence-write payload.

Bounded remediation committed directly to approved QA branch:
- commit: `bf3c5883004e9286f11f325676262cd95184e495`;
- changed file only: `clinician-portal/app.js`;
- no Worker canonical evidence validation was weakened;
- no schema or migration was changed;
- no public GalviCare file/workflow was changed;
- note submission now sends `source_type:'facilitator_capture'`, `source_ref`, `value_type:'text'`, top-level `value_text`, and `captured_at`, preserving the existing Worker + D1 evidence contract.

E2E-08 remains PENDING until the remediated QA deployment is Human-retested and the evidence/timeline record is proven durable.

## Next exact Human E2E target

### E2E-08 RETEST — GalviClinic note/evidence
After the QA deployment for `bf3c5883004e9286f11f325676262cd95184e495` completes:
1. hard refresh the QA clinician portal;
2. reopen the same `Day Four` canonical BMR;
3. open `GalviClinic Session`;
4. enter the same bounded QA note;
5. click Save once;
6. verify the evidence POST succeeds (expected created/success response rather than 422);
7. open Evidence and Timeline and prove one new note/source evidence record exists against the same BMR with actor/source/time/correlation lineage;
8. verify the note did not silently create or confirm a finding, recommendation, or treatment action.

Do not change any additional implementation unless this exact retest exposes another specific defect.

## Human E2E status

- [x] E2E-01 fresh-session login screen
- [x] E2E-02 Business Physician enrollment/authentication
- [x] E2E-03 Founder search
- [x] E2E-04 canonical BMR chart
- [x] E2E-05 Findings
- [x] E2E-06 Care Plan
- [x] E2E-07 refresh / same BMR
- [ ] E2E-08 GalviClinic note/evidence — exact 422 schema defect remediated; Human retest pending
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
- D8-03 Governed GalviClinic care workflow: **IN PROGRESS — E2E-08 exact payload defect remediated; Human retest required before E2E-09**
- D8-04 Continuity + D1 integrity: **PARTIAL PASS — refresh continuity E2E-07 passed; E2E-14/15/16/18 remain pending**
- D8-05 GalviVault + GalviCare regression: **PASS before this bounded UI-only remediation; deployment workflow will rerun inherited regression gates for the new candidate**
- D8-06 Human E2E + evidence: **IN PROGRESS**

Final declaration remains blocked until every mandatory Human E2E and D1 assertion passes on the same Day 8 QA build lineage.