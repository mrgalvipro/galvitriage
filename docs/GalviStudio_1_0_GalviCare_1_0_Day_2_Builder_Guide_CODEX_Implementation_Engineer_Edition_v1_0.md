**GALVISTUDIO 1.0 \| GALVICARE 1.0**

**Day 2 Builder Guide**

**GalviTriage 1.0 • Founder Readiness • Acuity • Clinical Confidence • GalviVitals 1.0 • GalviScore 1.0**

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

> **CURRENT BUILD STATUS — DAY 1 BUILD FINAL IS THE ONLY AUTHORIZED STARTING POINT**
>
> Day 2 is an additive clinical-intake upgrade. Codex must start from the exact Day 1 HUMAN E2E PASS candidate SHA/deployment/schema. No work branch, no new branch family, no Production changes, no OpenAI activation, and no broad cleanup rewrite are authorized.

> **DAY 2 MISSION**
>
> Turn GalviTriage, GalviVitals, and GalviScore into one universal, evidence-governed front door that distinguishes lifecycle state, Business Health, urgency, and Clinical Confidence; routes Pre-Founders and operating ventures correctly; preserves one canonical record; and leaves the system ready for Day 3 governed AI without using AI on Day 2.

> **CRITICAL-PATH RULE**
>
> Every code change must close a Day 2 acceptance gate, preserve a Day 1/0.5/P0 invariant, or remove a proven blocking defect. If a change does not directly improve Day 2 Human E2E PASS probability, do not make it.

# How Codex Must Use This Builder

> **EXECUTION CONTRACT**
>
> This is an implementation runbook, not a design brainstorm. Prove the Day 1 Build Final baseline first. Inventory the real repository, current GalviTriage/Vitals/Score logic, routes, scoring functions, question banks, D1 schema, bindings, and deployment state. Reuse Day 1 identity/consent/evidence/auth contracts. Implement the smallest additive Day 2 delta. Run focused tests, inherited regression, deployed QA verification, and Human E2E. Stop on the first P0/P1 defect and remediate only the proven root cause.

| **Priority** | **Instruction**                       | **Practical meaning**                                                                                                                                                                                    |
|--------------|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Exact Day 1 handoff only              | Day 2 begins only from the signed Day 1 candidate SHA, QA Worker deployment, QA D1 schema/binding, and rollback target.                                                                                  |
| P0           | Approved branch only                  | Implementation stays on qa-revamped-galvicare-0-5. Never create or use work or a workaround branch.                                                                                                      |
| P0           | Production untouched                  | No main merge, Production Worker deploy, Production D1 migration/backfill, Stripe LIVE, production adapter, or public-route cutover.                                                                     |
| P0           | Day 1 contracts are dependencies      | Consume stable person/principal identity, principal_only behavior, consent ledger, evidence service, authorization helpers, protocol metadata, and one-record-per-venture mapping. Do not recreate them. |
| P0           | Acuity ≠ Business Health ≠ Confidence | Keep severity/urgency routing, health/readiness scoring, and evidence sufficiency as separate governed outputs.                                                                                          |
| P0           | OpenAI remains OFF                    | Day 2 is deterministic. ai_enabled remains false. No provider key/model/AI output path changes.                                                                                                          |
| P0           | Idempotent retrieval/write            | Refresh, back, retry, duplicate submit, test rerun, and resume return stored canonical Triage/Vitals/Score outcomes instead of duplicating evidence/results.                                             |
| P1           | Evidence decides completion           | Local tests are insufficient. Deployed exact-SHA runtime, D1 assertions, golden cases, negatives, inherited regression, rollback, and Human E2E determine PASS/FAIL.                                     |

# 1. Day 2 Scope Decision, Objectives & Definition of Done

Authoritative Day 2 objective: upgrade intake into a universal clinical front door that separates Business Health from urgency, separates confidence from severity, and routes Pre-Founders, founders, and owners into passive care, active care, specialty diagnostic, referral, or GalviStudio development.

> **FASTEST SAFE PATH**
>
> Freeze exact Day 1 Build Final → inventory current Triage/Vitals/Score implementation → map Day 2 outputs to existing code/schema → implement lifecycle/protocol-aware triage → deterministic Acuity + red-flag overrides → independent Clinical Confidence + adaptive follow-up → Pre-Founder Founder Readiness pathway → venture Business Health Vitals/Score → persist governed evidence/results → golden-case QA → exact-SHA QA deployment → Human E2E + D1 assertions → rollback proof → sign Day 2 PASS/STOP.

## 1.1 Day 2 Definition of Done

- Exact Day 1 Build Final SHA/deployment/schema/binding/rollback target recorded before edits.

- qa-revamped-galvicare-0-5 is the only implementation branch; main is untouched; no work/new branch exists for Day 2.

- Existing 0.5 journey + Day 1 identity/consent/evidence/RBAC/clinician regression is green before Day 2 edits.

- GalviTriage determines lifecycle_state and protocol using Day 1 canonical identity/context, without creating a Triage-specific identity.

- Pre-Founder remains principal_only with venture/BHR null; operating founder resolves the existing one-record-per-venture aggregate.

- Acuity Index uses five 0–4 dimensions and deterministic 0–100 normalization with required weights.

- Red-flag overrides can elevate routing independent of mathematical acuity and never autonomously solve regulated/crisis issues.

- Clinical Confidence is independently calculated from data completeness/quality/consistency/corroboration/context; low confidence triggers targeted follow-up/evidence or human_review/diagnostic_order.

- GalviVitals produces Founder Readiness Vitals for Pre-Founders and Business Health Vitals for ventures.

- GalviScore response contract returns correct score_type, overall/dimension scores, acuity, confidence, evidence IDs, rule/protocol versions, and generation_source=rules.

- All Triage/Vitals/Score inputs and accepted results are persisted/linked through Day 1 governed evidence services; no client-only authoritative result.

- Golden cases A-E and duplicate/replay pass locally and on deployed QA.

- Day 1 inherited gate reruns green after Day 2 changes.

- Deployed QA Worker matches exact candidate SHA and expected QA D1 binding; health/capabilities identify Day 2 and ai_enabled=false.

- Day 2 Human E2E passes without undocumented manual repair; D1 assertions show no duplicate/cross-record data.

- Rollback to Day 1 Build Final code/deployment remains tested and non-destructive.

- Final declaration is DAY 2 HUMAN E2E PASS / DAY 2 BUILD FINAL or FAIL / STOP / ROLLBACK.

## 1.2 Explicit in-scope / out-of-scope

| **Capability**      | **Day 2 requirement**                                                                | **Not authorized on Day 2**                                                 |
|---------------------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| GalviTriage         | Lifecycle, protocol, acuity inputs, confidence inputs, disposition, next-care route. | Broad UX redesign, unrelated intake fields, new app fork.                   |
| Acuity              | Five dimensions, weights, 0–100 banding, red-flag override.                          | AI-derived urgency or collapsing health score into acuity.                  |
| Clinical Confidence | Independent deterministic confidence + targeted follow-up behavior.                  | Invented certainty, free-form AI follow-ups, hidden client-only confidence. |
| Pre-Founder         | Founder Readiness Vitals/Score; principal_only; SPUR/FDI route metadata.             | Fake venture/BHR, fake Business Health, Day 6 Studio implementation.        |
| Operating venture   | Business Health Vitals/Score subtype using same core engine.                         | Payer/protocol forked database or duplicate score engine.                   |
| Evidence            | Persist Triage answers, Vitals inputs/results, Score outputs with lineage.           | Untraceable JSON blob; in-place mutation of accepted evidence.              |
| OpenAI              | OFF; preserve Day 3 readiness only.                                                  | API key, model config, AI adapter activation, AI-generated output.          |
| Commercial adapters | Regression only; non-blocking.                                                       | Payment, Calendly, HubSpot, GA4, Clarity redesign.                          |
| Production          | None.                                                                                | main merge, PROD deploy/migration, public CTA change.                       |

# 2. Recurring GalviCare/GalviVault Build Defects — Day 2 Mandatory Prevention Controls

These are release gates, not suggestions. They incorporate recurring defects from the 0.5 and GalviVault builds and the branch/deployment issues already encountered during the current 1.0 build.

| **Defect pattern**                             | **Observed risk**                                                               | **Day 2 control**                                                                                                  | **Required proof**                                                                     |
|------------------------------------------------|---------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| Branch drift / work checkout                   | Changes land on local work or non-authoritative branch.                         | STOP on work/main. Fetch/synchronize only qa-revamped-galvicare-0-5; no new branch.                                | Remote, branch, candidate SHA recorded before edit and at deploy.                      |
| Repo/remote ambiguity                          | Tests run against a reconstructed or wrong repo.                                | Capture repo root + git remote -v; do not rebuild a “similar” repo.                                                | Authoritative remote + root + SHA manifest.                                            |
| Deployment drift                               | Source passes while active Worker serves older code.                            | Deploy exact candidate SHA and verify health/capability version + deployed POST /api behavior.                     | SHA ↔ deployment ID ↔ health release match.                                            |
| Wrangler 403 / binding mismatch                | Cloudflare auth/config issue misdiagnosed as app defect; workaround DB created. | Compare auth/config/binding to known-good; remediate credential/config only; never create new D1/Worker to bypass. | Same QA D1 binding + successful deploy/smoke.                                          |
| Hosted runner queue/outage                     | CI infrastructure delay triggers needless code/workflow edits.                  | Separate platform state from code defect. Wait/retry approved path; no speculative rewrite.                        | Workflow/run state + unchanged application diff.                                       |
| Unrelated workflow triggering                  | Non-Day workflows modify or threaten GalviCare.                                 | No workflow edits by default. If proven necessary, isolate Day 2 QA/exact-SHA only.                                | Final diff contains no unrelated workflow rewrite.                                     |
| GalviCare regression from GalviVault/Day build | Shared files changed unnecessarily.                                             | DO NOT MODIFY list + narrow allowed-files manifest; run 0.5/P0 smoke before/after.                                 | Diff audit + inherited regression green.                                               |
| Stale canonical IDs / 422                      | Superseded ID reused; valid rejection mistaken for Worker defect.               | Derive IDs from latest canonical response; never weaken validation.                                                | Fresh ID passes; stale/cross-record ID still fails.                                    |
| Schema duplication / wrong D1                  | New table/DB appears before inventory.                                          | Map current schema/migrations/bindings first; additive only if genuinely missing.                                  | Before/after schema map + binding identity.                                            |
| Direct/unsafe QA repair                        | Manual SQL/delete makes test pass but breaks lineage/idempotency.               | Use migration/domain service/corrective versioning; no undocumented repair.                                        | Evidence sheet says manual repair=NO.                                                  |
| Client signal treated as truth                 | URL/localStorage/UI state becomes authorization or completion proof.            | Worker/D1 canonical response decides; client is projection only.                                                   | Negative test cannot alter outcome with client-only flag.                              |
| Blank/HTML runtime error                       | Exception obscures exact failure.                                               | Structured JSON error envelope with action/correlation/code/environment.                                           | Deployed negative probe returns JSON.                                                  |
| Evidence ambiguity                             | Screenshots treated as proof without build/runtime identity.                    | Index every human artifact to run ID, SHA, deployment, schema, expected/actual.                                    | Complete evidence index; screenshots supplemental only.                                |
| Speculative multi-file remediation             | UI + Worker + DB + workflow all changed before root cause is isolated.          | Name exact failing assertion/layer first; minimal diff; focused retest; regression next.                           | Defect log shows failure → root cause → minimal diff → focused PASS → regression PASS. |
| Browser/cache confusion                        | Stale page makes deployed fix look absent.                                      | Verify network/health/deployment first; hard refresh/incognito only as observation control.                        | Runtime response proves actual candidate independent of cache.                         |

> **REMEDIATION RULE**
>
> When a Day 2 test fails, Codex must name the exact failing assertion, request, route, data row, deployment, or runtime layer before editing. Fix the smallest proven root cause. Rerun the failed test first, then its regression slice, then the complete Day 2 gate. Do not change UI + Worker + database + workflow together unless evidence independently proves each layer broken.

# 3. Day 2 Entry Gate & Exact Baseline Fingerprint

> **STOP UNLESS ALL ARE TRUE**
>
> Day 2 cannot repair an unknown Day 1 state while simultaneously changing clinical intake/scoring. If the signed Day 1 HUMAN E2E PASS baseline cannot be proven, restore/synchronize it first.

| **Check**         | **Required starting state**                                     | **Codex evidence**                               |
|-------------------|-----------------------------------------------------------------|--------------------------------------------------|
| Repository        | Authoritative mrgalvipro/galvitriage repo used by QA.           | git remote -v + repo root.                       |
| QA branch         | qa-revamped-galvicare-0-5 at exact Day 1 Build Final SHA.       | branch + origin tracking + SHA.                  |
| Production        | main read-only reference.                                       | origin/main HEAD; no implementation checkout.    |
| Working tree      | Clean or explicitly explained pre-existing changes.             | git status --short.                              |
| QA Worker         | Exact Day 1 Build Final deployment.                             | deployment ID/URL + health payload.              |
| QA D1             | Known Day 1 schema/binding/ledger.                              | wrangler + read-only schema/migration proof.     |
| Day 1 gate        | Human E2E PASS; identity/consent/evidence/RBAC/rollback proven. | Day 1 final report/evidence.                     |
| 0.5/P0 regression | Known-good public journey + Vault/clinician.                    | pre-change smoke.                                |
| OpenAI            | Disabled.                                                       | health ai_enabled=false; no Day 2 secret change. |
| Rollback          | Day 1 code/deployment restore point retained.                   | rollback manifest.                               |
| Scope             | Allowed-files manifest + DO NOT MODIFY list drafted.            | manifest evidence.                               |

## 3.1 First Codex actions

1.  Confirm repository, remote, QA branch, candidate SHA, clean working tree, and Day 1 rollback target. If current branch is work/main/unapproved: STOP; do not create another branch.

2.  Fetch remote refs through the existing authenticated path; confirm local QA tracks origin/qa-revamped-galvicare-0-5 and exact Day 1 Build Final SHA.

3.  Capture package-lock checksum, workflow inventory, Worker/wrangler config identity, D1 binding name, schema/migration ledger, QA deployment identity, health/capabilities payload, and prior Day 1 evidence IDs.

4.  Run pre-change GalviCare 0.5 smoke, Day 1 API/identity/consent/evidence/RBAC regression, and GalviVault/clinician smoke. Any P0/P1 regression means Day 2 has not started.

5.  Inventory actual GalviTriage, GalviVitals, GalviScore files/functions/routes/tests/question banks and the common /api envelope. Map Day 2 logical requirements onto real implementation names before proposing files.

6.  Create allowed-files manifest. Put unrelated GalviVault, clinician portal, Stripe, Calendly, HubSpot, GA4, Clarity, Make, production workflows, and Day 3 AI files on DO NOT MODIFY unless a failing Day 2 critical-path assertion proves dependency.

# 4. Canonical Day 2 Clinical Contract

## 4.1 Universal front-door decision contract

| **Decision**        | **Canonical question**                                                                                           | **Required output**                                                                                           |
|---------------------|------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| Lifecycle state     | Does the person have a real operating venture, an idea/opportunity, or only exploration/career-ownership intent? | lifecycle_state + record_mode.                                                                                |
| Protocol            | Which contextual overlay applies while preserving one core system?                                               | care_protocol, default founder_smb + specialty overlay when applicable.                                       |
| Acuity              | How much attention does the current situation require now?                                                       | acuity_score 0–100 + band + dimension inputs.                                                                 |
| Clinical Confidence | How sufficient/reliable is the evidence for interpretation?                                                      | confidence score/band + follow-up requirement.                                                                |
| Score subtype       | Are we assessing Founder Readiness or Business Health?                                                           | founder_readiness for principal_only Pre-Founder; business_health for real venture.                           |
| Disposition         | What level of care is appropriate?                                                                               | passive_monitoring \| passive_intervention \| active_care_recommended \| urgent_active_specialty_referral.    |
| Next evidence/care  | What happens next?                                                                                               | Vitals/Score, targeted follow-up, Clinic, Audit, Studio development, external referral, reassessment cadence. |

## 4.2 Locked separation rules

- Business Health score measures health/readiness state; it is not an emergency score.

- Acuity measures current need for attention/urgency; a healthy business can have a high-acuity issue and an unhealthy business can be low-acuity.

- Clinical Confidence measures evidence sufficiency, not optimism, severity, or health.

- Red flags can override mathematical acuity but cannot authorize autonomous licensed-professional conclusions.

- Protocol modifies context/questions/interpretation/routing overlays; it does not fork the core database, identity, evidence service, or scoring infrastructure.

- Payer type remains metadata only and does not select a separate clinical scoring engine.

- Pre-Founder Founder Readiness never fabricates Business Health dimensions for a nonexistent venture.

# 5. Phase 0 — Inventory Existing Triage/Vitals/Score Before Editing

Codex must inspect current code before selecting filenames. The logical examples below are contracts, not permission to invent parallel modules.

| **Inventory area** | **Questions Codex must answer**                                                                           | **Decision**                                                                                   |
|--------------------|-----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| UI                 | Where are Triage/Vitals/Score screens, forms, follow-up questions, navigation, recovery state?            | Reuse current screens; only minimal fields/labels/flow changes needed for Day 2.               |
| Worker/API         | Which actions currently submit Triage, calculate Vitals/Score, retrieve stored results, route next stage? | Extend existing actions/services where safe; no parallel /api.                                 |
| Scoring            | Where are current 0.5 dimensions, formulas, confidence/follow-up rules?                                   | Preserve known-good rules unless Day 2 explicitly supersedes; version rule outputs.            |
| D1                 | Where are answers/results/evidence/session/BMR/BHR records persisted?                                     | Reuse Day 1 evidence/canonical result homes; add only missing fields/table if truly necessary. |
| Identity           | How does current session resolve person/founder/venture/BMR?                                              | Consume Day 1 principal/record_mode mapping.                                                   |
| Tests              | What 0.5/Day 1 Triage/Vitals/Score tests already exist?                                                   | Extend with Day 2 golden/negative cases; keep inherited tests green.                           |
| Deployment         | Which workflow/path deploys QA exact SHA?                                                                 | Use proven Day 1 path; avoid workflow changes unless deployment root cause demands it.         |

# 6. Phase 1 — Implement GalviTriage 1.0 Lifecycle + Protocol Assignment

7.  Normalize incoming Triage request using the existing common Worker envelope and Day 1 stable principal/person resolution.

8.  Resolve record_mode. Pre-Founder/exploration with no real venture must remain principal_only; venture_id/BHR stay null. Operating founder uses the existing venture-backed canonical record.

9.  Assign lifecycle_state deterministically from explicit intake responses; do not infer a fake business from role/title/ambition.

10. Assign care_protocol using Day 1 validated protocol contract. founder_smb is default; athlete_career_ownership is an overlay, not a fork.

11. Carry payer_type as metadata only. Do not branch formulas, databases, or canonical identity by payer.

12. Persist accepted Triage answers as governed evidence items linked to principal and optional BHR, with provenance, version, request/session IDs, and validation status.

13. Persist/retrieve one canonical Triage result/version for an idempotency key; duplicate submission returns stored result.

14. Return structured response including lifecycle_state, record_mode, protocol, triage state, next_action, correlation ID, and schema/release versions.

## 6.1 Triage negative tests

- Pre-Founder with client-supplied fake venture_id cannot force BHR creation.

- Cross-record or stale venture/BHR ID is rejected.

- Missing required consent blocks protected write according to Day 1 policy.

- Protocol/payer client field outside allowed enum fails structured validation.

- Duplicate client_request_id does not create duplicate answer/evidence/result rows.

- Unauthenticated or unauthorized protected Triage retrieval fails closed.

# 7. Phase 2 — Implement Deterministic Acuity Index

| **Dimension**           | **Clinical question**                                         | **Weight** | **Input scale** |
|-------------------------|---------------------------------------------------------------|------------|-----------------|
| Severity                | How large could business/economic impact become?              | 30%        | 0–4             |
| Urgency                 | How quickly could meaningful harm occur?                      | 25%        | 0–4             |
| Continuity              | Does this threaten ability to continue operating/progressing? | 20%        | 0–4             |
| Reversibility           | How difficult/costly will this become if delayed?             | 15%        | 0–4             |
| Complexity / Dependency | Does resolution depend on specialized or regulated expertise? | 10%        | 0–4             |

> **FORMULA CONTRACT**
>
> acuity_score = normalized_0_100(severity*0.30 + urgency*0.25 + continuity*0.20 + reversibility*0.15 + complexity*0.10). Use deterministic, versioned code. Persist component inputs and rules_version so the score is reproducible.

| **Band**     | **Disposition**  | **Default care behavior**                                                              |
|--------------|------------------|----------------------------------------------------------------------------------------|
| 0–24 Green   | Routine          | Passive monitoring; continue evidence capture; reassess 60–90 days or event-triggered. |
| 25–49 Yellow | Needs attention  | Passive intervention; GalviPath/education; shorter reassessment about 30 days.         |
| 50–74 Orange | Material concern | Active care recommended; GalviClinic generally within a defined short timeframe.       |
| 75–100 Red   | Urgent           | Prompt active/specialty care or qualified referral.                                    |

# 8. Phase 3 — Red-Flag Override Engine

Implement deterministic red-flag evaluation after validated intake/evidence collection and before final disposition. A red flag can elevate routing regardless of calculated score.

- Imminent inability to meet payroll or critical obligations.

- Material legal/regulatory deadline or substantial contractual dispute.

- Suspected fraud or material internal-control concern.

- Cybersecurity/data breach or other business-continuity event.

- Imminent insolvency/liquidity crisis or loss of a contract threatening continuity.

- Regulated financial, legal, tax, fiduciary, securities, or similar question requiring licensed expertise.

> **OVERRIDE BEHAVIOR**
>
> Set active_care / referral_required / specialty_diagnostic routing as appropriate. Preserve the underlying mathematical acuity score and the override reason separately. Do not let GalviCare autonomously solve or present licensed-professional advice for regulated/crisis issues.

# 9. Phase 4 — Clinical Confidence + Adaptive Follow-Up

> **SEPARATE SIGNAL**
>
> Clinical Confidence is independent from Business Health and Acuity. Low confidence means the system lacks enough reliable evidence; it does not mean the business is healthy, unhealthy, urgent, or safe.

| **Confidence component**   | **Required behavior**                                                               |
|----------------------------|-------------------------------------------------------------------------------------|
| required_data_completeness | Measure whether required data elements for the selected score/protocol are present. |
| evidence_quality           | Weight source quality/validation status using Day 1 evidence semantics.             |
| answer_consistency         | Detect contradictions across current answers and prior accepted evidence.           |
| corroboration              | Increase confidence when independent evidence supports the same fact.               |
| context_completeness       | Account for missing operating/lifecycle context needed to interpret the score.      |

Implementation rule: low confidence → targeted follow-up questions or requested evidence. If confidence remains below threshold → status=human_review or diagnostic_order. Never manufacture certainty. Question count must be adaptive and bounded; ask only questions that can materially change interpretation/routing or close a required evidence gap.

## 9.1 Follow-up control to prevent the 0.5 Day 7D defects

- Do not hard-code “one question” or “five questions” globally. Derive question count from unresolved confidence gaps.

- Do not let “Skip for now” trigger payment or an unrelated stage. Skip must preserve current evidence/confidence and route according to the explicit stage contract.

- Do not ask duplicate semantic questions already answered in the same session or supported by current accepted evidence.

- Persist each answer as evidence and recompute confidence deterministically; do not keep authoritative follow-up state only in browser memory.

- If follow-up cannot resolve confidence, return a visible recoverable human_review/needs_evidence state rather than a blank or false “complete” result.

# 10. Phase 5 — Pre-Founder Founder Readiness Pathway

| **Product**                      | **Required Pre-Founder behavior**                                                                                                                                                         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GalviTriage                      | Recognize exploration/idea/opportunity/no operating business; principal_only; no fake venture/BHR.                                                                                        |
| GalviVault                       | Use existing principal/person only; venture/BHR null until a real venture exists.                                                                                                         |
| GalviVitals                      | Founder Readiness Vitals: clarity, runway, time, capability, network, domain knowledge, opportunity evidence, decision confidence, leadership readiness, ability/willingness to operate.  |
| GalviScore                       | score_type=founder_readiness. Do not calculate business_health for nonexistent company.                                                                                                   |
| GalviShot handoff metadata       | Prepare downstream disposition values such as Explore \| Prepare \| Validate \| Proceed \| Defer \| Alternative Path; Day 3 owns upgraded Shot reasoning.                                 |
| GalviSight/Path handoff metadata | Allow later interpretation and route to SPUR/FDI, career/education prep, customer discovery, Clinic, external preparation, or no action yet; do not implement Day 6 Studio services here. |

# 11. Phase 6 — Venture Business Health Vitals + GalviScore 1.0

For a real operating venture, preserve the existing Business Health scoring dimensions/logic where authoritative and layer the Day 2 contract around it. Do not rewrite a known-good score engine solely to match naming conventions.

## 11.1 Required GalviScore response contract

```json
{
  "product": "GalviScore",
  "score_type": "business_health | founder_readiness",
  "overall_score": 68,
  "dimension_scores": {
    "...": "..."
  },
  "acuity_score": 42,
  "acuity_band": "yellow",
  "clinical_confidence": 86,
  "supporting_evidence_ids": [
    "ev_..."
  ],
  "contradictory_evidence_ids": [
    "ev_..."
  ],
  "rules_version": "galviengine_1_0_score_v1",
  "protocol_version": "universal_business_health_v1",
  "generation_source": "rules"
}
```

The exact physical schema may reuse existing fields/names. The semantic contract above must be available from the Worker response and persisted result/evidence lineage. generation_source must remain rules on Day 2.

# 12. Phase 7 — Persistence, Evidence Lineage & Idempotency

- Every material Triage/Vitals/Score input is traceable to a Day 1 evidence item or accepted result version.

- Every score output stores/supports evidence IDs, rules_version, protocol_version, score_type, acuity, confidence, disposition, and generation_source.

- Contradictory evidence is not silently discarded; retain references and let confidence reflect ambiguity.

- Replay with the same semantic idempotency key returns the stored canonical result version; it does not append duplicate evidence/results.

- Recalculation after genuinely new evidence creates a new governed result/version and preserves prior history.

- Pre-Founder rows remain principal-scoped only. Venture-scoped results may reference the one canonical venture BHR. Cross-scope linkage is a P0 defect.

- No browser/localStorage/query param can become canonical score, acuity, confidence, disposition, or entitlement state.

# 13. Phase 8 — Worker/API Actions & Structured Error Contract

Map to existing action names first. Add new action names only when an existing route cannot safely express the Day 2 contract.

| **Logical action**   | **Behavior**                                                                                         | **Idempotency / auth**                                            |
|----------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| submit_triage        | Resolve identity/context; validate lifecycle/protocol inputs; persist evidence; return Triage state. | Stable client_request_id; Day 1 auth/consent.                     |
| evaluate_acuity      | Calculate component scores, band, red flags, disposition.                                            | Pure deterministic function or stored result; no duplicate write. |
| evaluate_confidence  | Calculate confidence and unresolved evidence gaps.                                                   | Deterministic; bounded targeted follow-up.                        |
| get_or_create_vitals | Return Founder Readiness or Business Health Vitals subtype.                                          | Existing canonical result if same evidence/version.               |
| get_or_create_score  | Return Day 2 GalviScore response contract.                                                           | Stored version first; no duplicate result.                        |
| get_intake_state     | Resume same session/principal/BHR context and stage.                                                 | Authorized projection only.                                       |
| health/capabilities  | Expose QA environment, release/schema version, Day 1+Day 2 capabilities, ai_enabled=false.           | No secrets/PII/internal tokens.                                   |

> **ERROR CONTRACT**
>
> Every deployed failure on the API boundary must return structured JSON with success=false, stable status/code, correlation/run identifier, safe message, environment/release context, and no secrets/PII. Blank/HTML errors are P1 critical-path defects.

# 14. Phase 9 — Automated Test Catalog

| **ID** | **Test**                            | **Required result**                                                                                    |
|--------|-------------------------------------|--------------------------------------------------------------------------------------------------------|
| T01    | Day 1 exact baseline pre-regression | All inherited mandatory tests pass before Day 2 edits.                                                 |
| T02    | Pre-Founder lifecycle               | principal_only; venture/BHR null; founder_readiness subtype.                                           |
| T03    | Operating founder lifecycle         | Existing venture/BHR resolves one canonical aggregate; business_health subtype.                        |
| T04    | Acuity formula                      | Known five-dimension vectors produce exact expected 0–100 scores/bands.                                |
| T05    | Healthy + urgent                    | Business Health may be strong while acuity becomes Orange/Red.                                         |
| T06    | Unhealthy + non-urgent              | Low health score does not automatically create emergency acuity.                                       |
| T07    | Red-flag regulated issue            | referral_required/active specialty route; no autonomous licensed advice.                               |
| T08    | Low confidence                      | Only targeted evidence questions; no final certainty before threshold/human review.                    |
| T09    | Confidence vs severity independence | Confidence changes without silently altering acuity/health unless new evidence warrants recalculation. |
| T10    | Duplicate Triage submit             | Same request returns stored result; no duplicate evidence/result.                                      |
| T11    | Duplicate Vitals/Score retrieval    | Stored result returned; no duplicate rows/events beyond expected retrieval event.                      |
| T12    | Stale/cross-record ID negative      | Rejected with structured error; current canonical ID still passes.                                     |
| T13    | Missing consent negative            | Protected write denied according to Day 1 policy.                                                      |
| T14    | Unauthorized cross-founder access   | Denied; no data leakage.                                                                               |
| T15    | Adapter unavailable                 | Canonical Worker+D1 result persists; adapter failure is logged/non-blocking.                           |
| T16    | Structured runtime error            | Invalid action/payload returns JSON error with correlation ID.                                         |
| T17    | Health/capability                   | Day 2 version/capabilities + ai_enabled=false + correct QA env/binding.                                |
| T18    | Day 1 inherited full regression     | Identity/consent/evidence/RBAC/Vault/clinician remains green.                                          |
| T19    | 0.5 customer regression             | Known-good public unpaid/paid routing slice remains intact where test environment permits.             |
| T20    | No forbidden file/workflow drift    | Final diff matches allowed-files manifest; no main/work/new branch change.                             |

Mandatory skipped count must be 0. A test cannot be marked passing by weakening an authoritative validation rule, changing expected output to match a defect, or using a manual DB repair.

# 15. Day 2 Golden-Case QA Matrix

| **Golden case**                      | **Input pattern**                                                            | **Expected result / release proof**                                                                                            |
|--------------------------------------|------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| A — Healthy but urgent issue         | Relatively strong Business Health evidence + high urgency/continuity threat. | Business Health can remain strong; acuity Orange/Red; active/urgent route; correct evidence links.                             |
| B — Unhealthy but non-urgent         | Weak Business Health across dimensions but no near-term continuity threat.   | Low Business Health; low/moderate acuity; passive intervention/monitoring rather than false emergency.                         |
| C — Low confidence                   | Material required data gaps, contradictory evidence, or poor corroboration.  | Targeted follow-up/evidence request; if unresolved, human_review/diagnostic_order; no invented certainty.                      |
| D — Pre-Founder athlete/professional | No operating venture; career/ownership/idea intent.                          | Founder Readiness path; principal_only; no venture/BHR; specialty protocol overlay as appropriate; SPUR/FDI pathway available. |
| E — Regulated issue                  | Legal/tax/fiduciary/securities/regulated dependency.                         | Red-flag override; referral_required; no autonomous licensed advice.                                                           |
| F — Duplicate/replay                 | Resubmit same Triage/Vitals/Score idempotency key.                           | Stored canonical results returned; no duplicate evidence/results.                                                              |
| G — Resume/reload                    | Reload/back/resume after Triage/Vitals/Score.                                | Same principal/session/BHR context and stored outcomes; no reset to stale local-only state.                                    |

# 16. Phase 10 — QA Deployment & Exact Runtime Verification

15. Before deploy, record candidate SHA and final diff; verify no forbidden branch/workflow/production file changes.

16. Use the existing authorized QA deployment path proven on Day 1. If hosted runner is queued/unavailable, record platform state and retry/alternate authorized existing path; do not rewrite app code merely to force a runner.

17. If Wrangler returns 403 or binding errors, compare credential/environment/binding/config against known-good Day 1. Do not create a new Worker or D1.

18. After deploy, capture deployment ID/URL and prove the active Worker corresponds to the candidate SHA via health/capability release identifier and direct deployed API probes.

19. Probe QA D1 binding identity/schema and confirm Day 1 data/contracts remain present.

20. Run a focused deployed Triage/Vitals/Score smoke before the full Human E2E. Verify runtime JSON responses, not only browser rendering.

21. If UI appears stale, verify network/Worker version first; use refresh/incognito only as cache observation control.

# 17. Phase 11 — Human E2E Runbook

Execute against deployed QA using synthetic identities. Record run ID, tester, timestamp, candidate SHA, deployment ID, schema/release version, expected result, actual result, and evidence reference for every step.

| **Step** | **Action**                                | **PASS condition**                                                                                   |
|----------|-------------------------------------------|------------------------------------------------------------------------------------------------------|
| H1       | Open QA health/capabilities               | Correct QA environment, Day 2 release/capabilities, ai_enabled=false.                                |
| H2       | Start new Pre-Founder Triage              | Stable principal created/resolved; record_mode=principal_only; no venture/BHR.                       |
| H3       | Complete Pre-Founder Triage               | Lifecycle/protocol assigned correctly; Triage evidence persisted.                                    |
| H4       | Complete Founder Readiness Vitals         | Readiness dimensions saved; no Business Health result for nonexistent venture.                       |
| H5       | Request Founder Readiness GalviScore      | score_type=founder_readiness + acuity + confidence + evidence IDs + generation_source=rules.         |
| H6       | Replay Pre-Founder Score                  | Exact stored version returned; no duplicate evidence/result.                                         |
| H7       | Start operating-founder Triage            | Existing/real venture resolves one canonical BHR; business_health subtype path.                      |
| H8       | Complete Business Health Vitals           | Inputs/results linked to correct principal/BHR evidence.                                             |
| H9       | Request Business Health GalviScore        | Correct dimensions + health score + independent acuity/confidence.                                   |
| H10      | Golden A healthy/urgent                   | Strong health does not block Orange/Red acuity route.                                                |
| H11      | Golden B unhealthy/non-urgent             | Weak health does not force Red acuity.                                                               |
| H12      | Golden C low confidence                   | Targeted follow-up only; unresolved case returns human_review/diagnostic_order.                      |
| H13      | Golden E regulated red flag               | referral_required/active specialty route; no licensed advice.                                        |
| H14      | Skip/low-confidence navigation check      | No accidental Stripe/unrelated routing; state remains recoverable and evidence/confidence preserved. |
| H15      | Cross-record negative                     | Attempt to use another synthetic record ID is denied.                                                |
| H16      | Stale ID negative                         | Stale/superseded canonical ID rejected while current ID succeeds.                                    |
| H17      | Resume/reload/back                        | Same principal/session/BHR and stored Triage/Vitals/Score restored without duplication.              |
| H18      | Inherited 0.5/Day 1/Vault/clinician smoke | All required regression remains green.                                                               |
| H19      | Adapter fault slice where safe            | Canonical state remains intact if non-authoritative adapter is unavailable.                          |
| H20      | Evidence/rollback closeout                | D1 assertions clean, no manual repair, Day 1 rollback target still restorable.                       |

# 18. Phase 12 — D1 Integrity Assertion Catalog

Replace placeholders with actual canonical tables/columns discovered during inventory. Run read-only against QA. These examples are assertions, not permission to create duplicate schema.

| **ID** | **Assertion**                                                                                                                 |
|--------|-------------------------------------------------------------------------------------------------------------------------------|
| D1-1   | No duplicate principal identity for Day 2 synthetic identities.                                                               |
| D1-2   | Pre-Founder has no venture/BHR link after Triage/Vitals/Score.                                                                |
| D1-3   | Operating venture has exactly one canonical BMR/BHR backing aggregate.                                                        |
| D1-4   | Every Day 2 Triage/Vitals/Score evidence item belongs to the expected principal and optional expected BHR; none cross-record. |
| D1-5   | Every Day 2 result references valid supporting/contradictory evidence IDs where applicable.                                   |
| D1-6   | Duplicate/replay request IDs have no unexpected duplicate canonical result/evidence counts.                                   |
| D1-7   | Acuity result preserves component values, score/band, rules version, and any override reason.                                 |
| D1-8   | Clinical Confidence result preserves inputs/gaps/version and does not overwrite acuity/health.                                |
| D1-9   | Founder Readiness and Business Health score_type match record_mode/lifecycle.                                                 |
| D1-10  | Audit/journey events exist for material writes and denials without secret-bearing fields.                                     |
| D1-11  | Day 1 consent/evidence/RBAC records remain intact; no orphan/cross-record rows introduced.                                    |
| D1-12  | Migration ledger contains only intended additive Day 2 migration if one was genuinely required.                               |

# 19. Defect Triage & Critical-Path Remediation Playbook

| **Failure**                              | **Critical-path response**                                                                                         | **Exit proof**                                                      |
|------------------------------------------|--------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Wrong branch / QA ref                    | STOP. Inspect origin. Return to qa-revamped-galvicare-0-5 at exact handoff. No new branch.                         | Branch + SHA proof.                                                 |
| Runner queued/no runner                  | Record platform state; retry approved workflow/authorized path. No application rewrite.                            | Workflow status + unchanged diff.                                   |
| Wrangler 403 / binding mismatch          | Compare auth/env/binding/config to Day 1 known-good. Fix credential/config path only.                              | Same QA D1 + successful deploy/smoke.                               |
| Deployed API serves old logic            | Verify checkout SHA, deployment ID, route/env; redeploy exact candidate.                                           | Health + direct API show candidate.                                 |
| POST /api 500/blank                      | Capture correlation/action/log; isolate service layer; fix one root cause; preserve JSON envelope.                 | Failed request passes + regression green.                           |
| 422 canonical ID                         | Use current authoritative ID; fix stale client/test state, not Worker validation.                                  | Current ID passes; stale remains rejected.                          |
| Pre-Founder got venture/BHR              | P0. Fix record_mode/lifecycle path; corrective QA action through governed service; rerun clean synthetic identity. | Null venture/BHR + no duplicate residue.                            |
| Acuity equals health score               | P0/P1 clinical-model defect. Separate calculations/contracts and rerun Golden A/B.                                 | A and B demonstrate independent signals.                            |
| Low confidence still finalizes certainty | P0/P1. Enforce follow-up/human_review threshold and persisted confidence gaps.                                     | Golden C passes with no invented certainty.                         |
| Red flag ignored                         | Fix override evaluation/order and route mapping; do not change unrelated score dimensions.                         | Golden E passes; base score preserved + override recorded.          |
| Skip routes to Stripe/unrelated stage    | Fix exact UI/route state machine branch only; preserve existing payment semantics.                                 | Skip stays in correct non-payment flow; paid flow regression green. |
| Duplicate evidence/result                | Fix idempotency lookup/write boundary; do not delete history to hide duplicate.                                    | Replay stable; D1 duplicate assertion clean.                        |
| Cross-record data/access                 | P0. Stop release; fix scope resolution/auth; audit synthetic rows.                                                 | Negative tests + D1 clean.                                          |
| Adapter failure blocks canonical result  | Restore non-blocking adapter contract; core Worker+D1 succeeds independently.                                      | Canonical state exists; adapter error logged.                       |
| Human E2E needed manual repair           | FAIL until code/config root cause fixed and full affected path reruns clean.                                       | manual repair=NO.                                                   |

# 20. Release Evidence Package

| **ID** | **Evidence item**       | **Required artifact**                                                                     |
|--------|-------------------------|-------------------------------------------------------------------------------------------|
| E01    | Day 1 handoff baseline  | Signed Day 1 PASS, branch/SHA, deployment ID/URL, QA D1 binding/schema, rollback target.  |
| E02    | Pre-change regression   | 0.5 + Day 1 + Vault/clinician commands/results.                                           |
| E03    | Repo/scope control      | Remote/root/branch/status + allowed-files + DO NOT MODIFY + final diff.                   |
| E04    | Clinical implementation | Acuity/confidence/red-flag/scoring rule version and focused unit test output.             |
| E05    | Schema/persistence      | Before/after schema map, migration checksum if applicable, evidence/result lineage proof. |
| E06    | Automated QA            | T01-T20 results with failed=0 and mandatory skipped=0.                                    |
| E07    | Golden cases            | A-G inputs, expected/actual outputs, evidence links.                                      |
| E08    | Deployment proof        | Candidate SHA ↔ QA deployment ID ↔ health/capability ↔ D1 binding match.                  |
| E09    | Deployed runtime probes | Triage/Vitals/Score + structured negative responses from active QA.                       |
| E10    | Human E2E               | H1-H20 run sheet with metadata and evidence refs.                                         |
| E11    | D1 assertions           | D1-1 through D1-12 results.                                                               |
| E12    | Regression              | Post-change 0.5 + Day 1 + Vault/clinician regression.                                     |
| E13    | Defect log              | Each blocking defect: failure → root cause → minimal diff → retest → regression.          |
| E14    | Rollback proof          | Day 1 code/deployment restore procedure and verified non-destructive path.                |
| E15    | Final decision          | DAY 2 HUMAN E2E PASS / FAIL-STOP-ROLLBACK + exact Day 3 handoff baseline.                 |

# 21. Day 2 Stop/Go Gate

> **GO ONLY WHEN**
>
> All golden cases produce the correct lifecycle state, score subtype, acuity, Clinical Confidence, disposition, protocol, evidence links, and next-care route; duplicate/retrieval behavior is idempotent; deployed QA is the exact candidate; Day 1/0.5/Vault regression remains green; D1 integrity is clean; no manual repair was used; rollback remains proven.

> **STOP / ROLLBACK IF**
>
> Acuity and Business Health are conflated; low-confidence cases receive invented certainty; a Pre-Founder gets a fake venture/BHR; red flags fail to elevate routing; regulated issues are handled as autonomous advice; cross-record access/evidence occurs; duplicate canonical results are created; the active deployment/binding cannot be proven; inherited regression breaks; or rollback is not credible.

# Appendix A — One-Page Day 2 Completion Checklist

| **Gate**     | **Completion requirement**                                                                                      |
|--------------|-----------------------------------------------------------------------------------------------------------------|
| Entry        | Exact signed Day 1 Build Final baseline + rollback target verified.                                             |
| Repo         | Approved QA branch only; no work/new branch; main untouched; final diff scoped.                                 |
| Regression   | Pre- and post-change 0.5 + Day 1 + Vault/clinician green.                                                       |
| Triage       | Lifecycle/protocol/record_mode/payer metadata and next route correct.                                           |
| Pre-Founder  | principal_only; venture/BHR null; Founder Readiness subtype.                                                    |
| Founder      | One canonical venture/BHR; Business Health subtype.                                                             |
| Acuity       | Five dimensions/weights, 0–100 banding, independent from health.                                                |
| Red flags    | Override math when required; active/specialty/referral route; no licensed advice.                               |
| Confidence   | Independent deterministic score; targeted follow-up; human review when unresolved.                              |
| Vitals/Score | Correct subtype + overall/dimensions + acuity + confidence + evidence IDs + versions + generation_source=rules. |
| Evidence     | All Day 2 inputs/results governed, scoped, versioned, replay safe.                                              |
| QA           | T01-T20 + Golden A-G pass; mandatory skipped=0.                                                                 |
| Runtime      | Exact candidate SHA deployed to existing QA Worker/D1; health identifies Day 2; ai_enabled=false.               |
| Human        | H1-H20 PASS; D1 assertions clean; manual repair=NO.                                                             |
| Rollback     | Day 1 Build Final restore remains tested/non-destructive.                                                       |
| Decision     | DAY 2 HUMAN E2E PASS signed; exact Day 3 handoff baseline recorded.                                             |

# Appendix B — Day 3 Handoff Contract

Day 3 (GalviEngine 1.0 Governed AI + Evidence-Based Clinical Intelligence) may begin only from the exact Day 2 Build Final baseline. Day 3 must consume — not recreate — the deterministic Triage/Vitals/Score, evidence, acuity, confidence, protocol, identity, consent, authorization, and canonical-record contracts.

| **Inherited control** | **Day 3 obligation**                                                                                                                                                 |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity/record       | Use the same principal/BHR context; no AI-specific identity or shadow record.                                                                                        |
| Evidence              | Build governed AI bundles from Day 1/Day 2 evidence IDs and deterministic facts; no unscoped prompt data.                                                            |
| Acuity                | Treat Day 2 acuity/red-flag output as deterministic context; AI cannot silently override it.                                                                         |
| Clinical Confidence   | Use confidence/evidence gaps to bound reasoning; AI cannot convert low confidence into unsupported certainty.                                                        |
| Score                 | Use stored Day 2 score_type, dimension scores, rule/protocol versions; AI returns proposals, not replacement scores unless a later governed rule explicitly permits. |
| Generation source     | Day 2 outputs remain generation_source=rules; Day 3 adds openai_proposal/accepted governed intelligence with separate ledger.                                        |
| Health                | Day 3 may set ai_enabled=true only after provider/secret/governance tests pass; preserve all Day 1/2 capability flags.                                               |
| Regression            | Day 3 must rerun the full Day 2 gate as inherited regression before its own PASS.                                                                                    |

> **TARGET FINAL DECLARATION**
>
> DAY 2 HUMAN E2E PASS → DAY 2 BUILD FINAL → UNIVERSAL INTAKE / ACUITY / CLINICAL CONFIDENCE / FOUNDER READINESS / VITALS / SCORE FOUNDATION READY FOR DAY 3 GOVERNED AI. If any P0/P1 gate is red, the only valid declaration is FAIL / STOP / ROLLBACK.
