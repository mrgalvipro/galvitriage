# GalviVault Day 8 — Final Release Evidence Index

Status: **DAY 8 HUMAN E2E PASS**
Decision: **GO — Day 8 Build Final / ready for GalviCare | GalviVault Integration E2E**

## Release identity

- Repository: `mrgalvipro/galvitriage`
- Approved QA branch: `qa-revamped-galvicare-0-5`
- Production branch: `main` (not used for first-time Day 8 behavior)
- Day 7 protected baseline SHA: `eb8630c112ac5557bd374e5f5e1db05e4435bad5`
- Exact tested Day 8 QA candidate SHA: `29a8f38146db2f1f0a096bf5bc4cce67286b8fd8`
- Workflow evidence commit: `d15bddc`
- Human E2E finalization commit: `2588c3a151b7bcf060ed3b70a98eede0025ed1f7`
- QA Worker: `galvivault-day8-qa`
- QA portal: `https://galvivault-day8-qa.mrgalvipro.workers.dev/`
- Worker deployment version: `3e162399-0387-4291-85f2-ec15bd447123`
- QA D1: `galvivault-0-5-qa`
- Schema ledger through: `0007`
- Auth mode: `worker_device_ecdsa_session`
- Final QA workflow run: `31542636774`
- Final QA workflow job: `93948290315`
- Evidence artifact ID: `9121275715`
- Evidence artifact SHA256: `ac20d32383c73341737ee89640655538f801734bac1a2d299d238992e99486aa`

## D8-EV-01 through D8-EV-14

### D8-EV-01 — Baseline fingerprint — PASS
Day 8 executed only on `qa-revamped-galvicare-0-5`. The workflow proves Day 7 baseline SHA `eb8630c112ac5557bd374e5f5e1db05e4435bad5` is an ancestor of the tested candidate and rejects use of another branch for this QA job.

### D8-EV-02 — Diff inventory / GalviCare isolation — PASS
The final workflow's baseline-protection step performed an explicit `git diff --exit-code` against protected public GalviCare runtime/config paths and passed. Day 8 finalization changed only the Day 8 workflow and release-evidence files; no public GalviCare runtime, payment, telemetry, HubSpot/GA4/Clarity/Calendly, production entry, or unrelated workflow file was rewritten for E2E-18/19.

### D8-EV-03 — Authentication / operator mapping — PASS
Worker-native approved-device authentication remained active. QA D1 proved two active operator credentials, including exactly one active `clinician` credential for the second GalviClinician. Human E2E proved Business Physician and GalviClinician login paths.

### D8-EV-04 — Schema/migration evidence — PASS
QA schema ledger returned migrations `0001` through `0007`; `0006` is `day8_operator_device_auth`, `0007` is `day8_second_galviclinician_invitation`. The final workflow reapplied additive migrations idempotently with zero new rows written.

### D8-EV-05 — Day 8 automated test report — PASS
Focused Day 8/inherited care suite: **34 pass / 0 fail / 0 skipped**. Mandatory role-negative, device-auth, canonical chart, treatment-lineage, second-clinician and isolation tests passed.

### D8-EV-06 — Full GalviVault regression — PASS
Authoritative inherited regression suite: **143 pass / 0 fail / 0 skipped**.

### D8-EV-07 — Public GalviCare regression — PASS
Final E2E-19 smoke called the isolated GalviCare QA surface and returned HTTP `200`. The rendered response retained `GalviCare`, `GalviTriage`, and `GalviVitals` application markers. The protected GalviCare source/config diff also remained clean.

### D8-EV-08 — QA deployment identity — PASS
Tested candidate `29a8f38146db2f1f0a096bf5bc4cce67286b8fd8` deployed to `galvivault-day8-qa` with Worker version `3e162399-0387-4291-85f2-ec15bd447123`, D1 binding `galvivault-0-5-qa`, and isolated clinician assets.

### D8-EV-09 — Human E2E evidence — PASS
Human E2E-01 through E2E-17 were evidenced through Product Owner screenshots/Network/Console proof during the Day 8 run. `release-evidence/day8/human-e2e-current.md` records the final consolidated Human E2E status. Automated E2E-18 and E2E-19 then completed on the final tested candidate.

### D8-EV-10 — D1 assertion sheet — PASS
Final read-only D1 assertion step against BMR `bmr_0d72e878cc634917ae2ac8430a73331f` returned:
- BMR count: `1`
- evidence: `2`
- findings: `3`
- recommendations: `3`
- treatment plans: `2`
- treatment events: `2`
- outcomes: `1`
- `D8_FOLLOW_UP_STATUS` outcome count after changed-payload E2E-14 conflict: `1`
- orphan recommendation/finding links: `0`
- orphan treatment items: `0`
- orphan treatment recommendation links: `0`
- orphan outcome/evidence links: `0`

This proves the E2E-14 `409` conflict did not create an extra canonical outcome and that the tested care chain contains no checked orphan state.

### D8-EV-11 — Security negatives — PASS
Evidence includes: unauthenticated protected `/me` = `401`; no founder/BMR identifiers leaked pre-auth; changed-payload idempotency reuse = `409` with no duplicate outcome; logout/direct protected access denial; GalviClinician Business Physician-only governance attempt = `403 Forbidden` with no permitted write path.

### D8-EV-12 — Rollback/deactivation — PASS
Day 8 uses an isolated QA Worker/client surface. Immediate rollback is to disable/restore the Day 8 QA Worker/clinician route while preserving canonical D1 state. The protected public GalviCare baseline remains `eb8630c112ac5557bd374e5f5e1db05e4435bad5` and was not rewritten by the final Day 8 proof. No destructive D1 down migration is required or permitted.

### D8-EV-13 — Known defects / residual risk — PASS / no blocking defects
No blocking Day 8 defect remains in the final run. GitHub Actions emitted platform deprecation warnings regarding Node 20-targeting action metadata being forced onto Node 24; the job completed successfully and this did not alter application behavior. Inherited test-harness diagnostic logging for Day 7C integration trace writes remained non-blocking while all authoritative regression tests passed.

### D8-EV-14 — Final GO/STOP decision — GO
The Product Owner directed completion of E2E-18, E2E-19, release evidence, and DAY 8 HUMAN E2E PASS. All blocking Day 8 gates on the final tested QA candidate are now green. Decision: **GO — DAY 8 BUILD FINAL**.

## Final gates

- D8-01 Secure clinician identity: **PASS**
- D8-02 Founder search + chart: **PASS**
- D8-03 Governed GalviClinic workflow: **PASS**
- D8-04 Continuity + D1 integrity: **PASS**
- D8-05 GalviVault + GalviCare regression: **PASS**
- D8-06 Human E2E + complete release evidence: **PASS**

**DAY 8 HUMAN E2E PASS — CLINICIAN GALVIVAULT WORKSPACE READY FOR GALVICARE | GALVIVAULT INTEGRATION E2E.**
