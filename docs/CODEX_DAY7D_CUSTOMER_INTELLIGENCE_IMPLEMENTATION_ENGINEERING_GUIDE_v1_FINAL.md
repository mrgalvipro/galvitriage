<!--
FILE: CODEX_DAY7D_CUSTOMER_INTELLIGENCE_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md
PURPOSE: Authoritative Codex implementation contract for GalviCare 0.5 Day 7D.
EXECUTION MODEL: QA = BUILD; Production = RUN.
DO NOT: use OpenAI, Make, Airtable writes, a second Worker, or piecemeal production changes.
-->

# GALVICARE™ 0.5 — DAY 7D CUSTOMER INTELLIGENCE BUILDER GUIDE

## CODEX IMPLEMENTATION ENGINEER EDITION

**Restore Progressive Clinical Intelligence • Make Intake Evidence Matter • QA Once • Production Once**

Prepared for GalviPro / GalviStudio | July 2026 | Version 1.0 FINAL • Secure • Deterministic • Learning-Ready

> **AUTHORITATIVE DAY 7D IMPLEMENTATION CONTRACT**  
> Read this file in full before editing, deploying, migrating, or testing.  
> Day 7D restores functionality that belongs to the approved GalviCare 0.5 design. It is not permission for a rewrite.

GALVICARE™ 0.5 DAY 7D CUSTOMER INTELLIGENCE BUILDER GUIDE

CODEX IMPLEMENTATION ENGINEER EDITION Restore Progressive Clinical Intelligence • Make Intake Evidence Matter • QA Once • Production Once

Prepared for GalviPro / GalviStudio | July 2026 | Version 1.0 FINAL • Secure • Deterministic • Learning-Ready

| Contract field | Day 7D locked value |
| --- | --- |
| Release | GalviCare 0.5 Day 7D / Customer Intelligence Restoration |
| Build theme | Collect → Reconcile → Clarify → Diagnose → Interpret → Prescribe → Learn |
| Primary objective | Restore the originally specified cumulative Customer Intelligence Engine so each downstream deliverable uses all prior evidence and targeted follow-up answers. |
| Execution target | One discovery/preflight → one authoritative QA implementation → automated intelligence tests → one complete QA Human E2E → one production promotion after approval. |
| Architecture | QA = BUILD; Production = RUN. One frontend, one Worker/GalviEngine, one D1/GalviVault per environment. No Make. No OpenAI for 0.5. |
| Critical constraint | Do not destabilize accepted Day 7A–7C routing, payments, entitlements, analytics, CRM, Clarity, Clinic booking, or environment separation. |


## 1. Document Purpose and Day 7D Mission

Day 7D is corrective product work: it restores functionality that belongs to the approved GalviCare 0.5 clinical-intelligence design but was not fully realized in the stabilized build. The release is not a new AI feature and is not permission for a rewrite.

MISSION

Make GalviCare cumulative rather than episodic. GalviTriage captures the founder’s presenting hypothesis; GalviVitals/GalviScore quantify health; GalviShot reconciles evidence into findings; GalviSight interprets findings; GalviPath sequences care; GalviClinic inherits the complete clinical record. When evidence is insufficient or contradictory, GalviEngine asks only the minimum targeted clarifying questions needed to improve the next output.

Day 7D PASS means changing meaningful intake/follow-up evidence produces deterministic, traceable, clinically coherent changes downstream while identical evidence reproduces identical results.


## 2. Authoritative Product Principle

Each interaction must make BOTH sides of the care relationship smarter.

| Stage | Founder learns | GalviEngine learns | Required cumulative behavior |
| --- | --- | --- | --- |
| GalviTriage | What I think is wrong / what matters now | Presenting concern, priority, constraint, urgency | Persist quantitative + qualitative raw evidence. |
| GalviVitals | Where health appears strong/weak | Completeness, weak dimensions, urgent flags | Reconcile objective pattern with stated concern without altering score from free text. |
| GalviScore | How health is quantified | Severity by dimension | Keep objective scoring deterministic; expose evidence context separately. |
| GalviShot | What appears to be happening | Evidence-supported findings | Use scores + intake context + follow-ups; ask targeted questions when confidence requires. |
| GalviSight | What it means and why it matters | Supported interpretation, contradictions, risks/opportunities | Consume entire prior clinical file; ask interpretation questions only when ambiguity remains. |
| GalviPath | What to do first | Feasible treatment sequence | Use findings + interpretation + founder priorities/capacity; clarify feasibility if needed. |
| GalviClinic | What treatment to pursue | Human confirmation/rejection and treatment decision | Receive complete Founder Health Record and unresolved hypotheses. |


## 3. Scope Lock: What Day 7D Changes / Does Not Change

| IN SCOPE | OUT OF SCOPE |
| --- | --- |
| Restore clinical_followups for GalviShot, GalviSight, GalviPath. | OpenAI/LLM narrative generation, Make, Airtable writes. |
| Make qualitative intake evidence analytically consequential downstream. | Changing GalviScore weights or letting free text directly alter objective score. |
| Evidence reconciliation, contradiction detection, confidence impact, progressive result regeneration. | New pricing, new products, new payment architecture. |
| Cumulative Founder Health Record assembly and traceability. | New framework, second Worker, broad UI redesign. |
| Versioned rules/question banks/content templates. | Autonomous learning or self-modifying production rules. |
| QA tests proving differential outputs and deterministic replay. | Reopening accepted Day 7A–7C ecosystem work absent a proven regression. |


## 4. Non-Negotiable Existing Contracts

- Preserve canonical public route and accepted QA/Production separation.
- Preserve one stable galvicare_session_id for the entire journey.
- Preserve Stripe TEST in QA and LIVE only in Production; entitlement remains server-authoritative.
- Preserve HubSpot, GA4 and Clarity as non-blocking adapters.
- Preserve current GalviTriage/Vitals/Score scoring contract unless a test proves an implementation defect.
- Preserve one active diagnostic result per session + product and idempotent retrieval.
- Never expose secrets or proprietary rule logic in browser code. Intelligence belongs in Worker/GalviEngine.
- Never promote synthetic QA customer data to Production.

## 5. Required Customer Intelligence Data Model

Codex must inspect the current schema first and migrate only missing fields/tables. Never drop or destructively recreate populated tables.

| Record class | Minimum requirement | Purpose |
| --- | --- | --- |
| raw evidence | session, question/evidence id, product/stage, source, raw/normalized value, version, timestamp | What founder submitted/selected/said. |
| observation | observation_code, evidence_refs, rule_version | Neutral deterministic statement. |
| hypothesis | hypothesis_code, evidence_refs, confidence, status | Possible explanation; never presented as fact unless promoted. |
| clinical finding | finding_code, evidence_refs, confidence, confirmation_status, rules_version | Supported hypothesis above threshold. |
| clinical_followups | session_id, product, question_id, question_text/version, answer, normalized_answer, confidence_impact, created_at | Progressive clinical intelligence. |
| recommendation | recommendation_code, finding_refs, pathway/timing, rules_version | Governed action connected to findings. |
| treatment | treatment_code, indication_refs, target_outcome, facilitator_confirmation | GalviClinic intervention. |
| diagnostic result | session_id + product unique, confidence, status, result_json, rules_version, generation_source | Canonical customer-facing view. |

```text
Required uniqueness:
triage answer            UNIQUE(session_id, question_id)
follow-up answer          UNIQUE(session_id, product, question_id)
diagnostic result         UNIQUE(session_id, product)
payment                   UNIQUE(session_id, product) + unique Stripe session
result generation         GET EXISTING before CREATE; regenerate only when evidence_version changes
```


## 6. Intake Evidence Contract — Make the Existing Questions Matter

| Intake question / signal | Clinical role | Direct score effect | Required downstream use |
| --- | --- | --- | --- |
| Greatest positive-impact area | Founder-perceived priority | NO | Vitals context; Shot alignment/contradiction; Sight meaning; Path prioritization; Clinic reason-for-visit. |
| Biggest challenge to solve | Presenting problem | NO | Primary qualitative evidence for Shot findings/hypotheses; Sight root-cause interpretation; Clinic brief. |
| ONE problem in next 30 days | Immediate treatment target | NO | Urgency/time-horizon evidence; Path 30-day sequence; Clinic desired outcome. |
| What is preventing growth? | Suspected constraint/root cause | NO | Hypothesis evidence; contradiction comparison against objective dimensions. |
| What feels broken today? | Operational symptom | NO | Finding evidence and impact narrative. |
| What keeps you up at night? | Risk/urgency/founder concern | NO | Sight risk/urgency and Clinic agenda; never used as unbounded psychological inference. |

Critical rule: qualitative evidence must influence interpretation, findings, prioritization and treatment context, but MUST NOT arbitrarily mutate GalviScore. The engine must distinguish founder hypothesis from objective evidence.


## 7. GalviEngine Evidence Reconciliation Model

Implement a deterministic reconciliation layer before downstream product composition.

```text
clinical_file = {
  session,
  profile,
  triage: { scored_answers, qualitative_context },
  vitals,
  score,
  followups_by_product,
  observations,
  hypotheses,
  findings,
  interpretations,
  recommendations,
  treatments,
  evidence_version
}

reconcile():
  1. normalize qualitative context into approved topic/dimension tags
  2. compare stated priority/challenge/30-day target with weakest dimensions and score pattern
  3. emit alignment, mismatch, contradiction, missing-evidence observations
  4. apply approved hypothesis rules only
  5. calculate product confidence from evidence completeness + consistency + follow-up impact
  6. choose minimum targeted follow-ups when threshold/ambiguity rules require them
  7. compose result only from evidence-linked governed components
```


## 8. Confidence and Progressive Follow-Up Contract

Use the existing approved confidence behavior as the baseline. Codex must first locate current thresholds/rules and preserve them where already implemented; do not silently invent competing formulas.

| Confidence / condition | Required behavior |
| --- | --- |
| 0–59 | Ask 3 targeted GalviShot questions; withhold final Shot until submitted or explicitly marked facilitator_review. |
| 60–79 | Ask 1–3 targeted questions; regenerate using answers. |
| 80–89 | Normal deterministic result; follow-up only for a material contradiction/missing critical evidence. |
| 90–100 | No unnecessary questions; use richer deterministic personalization from available evidence. |
| Any stage: material contradiction | Ask the smallest approved question set that can discriminate between competing hypotheses. |
| Repeated retrieval with no new evidence | Return stored result; do not ask again or create duplicates. |

Follow-up questions must be selected by rules, not generic random prompts. Every question needs: question_id, target product, trigger rule, evidence gap, allowed response type/options, confidence impact mapping, downstream fields affected, version.


## 9. Product-by-Product Intelligence Requirements


### 9.1 GalviVitals / GalviScore

- Do not change objective scoring because of qualitative prose.
- Add explicit stated-vs-observed context where supported: aligned / partially aligned / divergent / insufficient evidence.
- Store reconciliation observations for downstream use; do not clutter the free-value screen with unsupported diagnosis.

### 9.2 GalviShot — Findings

- Consume Score + Vitals + all Triage context + prior Shot follow-ups.
- Produce 3–5 evidence-linked findings from governed rules.
- Each finding must include finding_code, title, evidence_refs, confidence, implication, assumption/hypothesis marker where applicable.
- If confidence threshold requires follow-up, return status=needs_followup and questions; after submission, recompute against evidence_version and replace/upsert the active result.
- Different meaningful context must be capable of changing finding selection, ordering, confidence or implication when rules warrant it.

### 9.3 GalviSight — Interpretation

- Consume the complete Shot clinical record, not only rendered Shot prose.
- Explain meaning, implications, risks, opportunities, urgency and root-cause hypothesis without overstating certainty.
- Detect contradictions such as stated Product problem while objective evidence indicates Distribution/Customer constraint.
- Ask 1–3 targeted interpretation questions only when ambiguity materially changes the interpretation.
- Persist answers and regenerate deterministic interpretation.

### 9.4 GalviPath — Prescription / Sequencing

- Consume Score + Shot + Sight + all prior follow-ups + founder 30-day target and capacity/context evidence.
- Select pathway and 30/60/90 actions from governed protocols; recommendations must reference findings/interpretations.
- Ask 1–3 feasibility/prioritization questions only when answer would materially change sequence, timing or pathway.
- Founder preference can affect sequencing, not erase contradictory clinical evidence; show the tradeoff explicitly.

### 9.5 GalviClinic

- Build the Clinic brief from the cumulative stored record.
- Include reason for visit, health classification, priority findings, interpretation/urgency, pathway, treatment recommendation, three agenda items, stated 30/90-day outcome, unresolved hypotheses and follow-up evidence.
- Preserve facilitator confirmation/rejection so future learning can distinguish machine hypothesis from human-validated finding.

## 10. Worker/API Contract

| Action | Required Day 7D behavior |
| --- | --- |
| get_clinical_file | Return cumulative evidence graph for authorized/internal use; customer response remains bounded. |
| evaluate_galvishot | Return ok \| needs_followup \| facilitator_review with confidence/evidence gaps. |
| save_galvishot_followup | Validate, idempotently persist, bump evidence_version, re-evaluate Shot. |
| evaluate_galvisight | Use cumulative file and return interpretation/follow-up state. |
| save_galvisight_followup | Persist answer, bump evidence_version, re-evaluate Sight. |
| evaluate_galvipath | Use cumulative file and return pathway/follow-up state. |
| save_galvipath_followup | Persist answer, bump evidence_version, re-evaluate Path. |
| get_or_create_* | Return stored result if evidence_version/rules_version unchanged; otherwise deterministic recomposition. |

```text
Standard response:
{
  "success": true,
  "status": "ok | needs_followup | facilitator_review | locked",
  "session_id": "gc_...",
  "product": "GalviShot",
  "evidence_version": "...",
  "rules_version": "...",
  "confidence": 0,
  "data": {...},
  "followups": [...],
  "next_screen": "..."
}
```


## 11. Frontend Follow-Up Experience

- Reuse the current visual system; do not redesign the application.
- Render follow-up panel only when Worker returns needs_followup.
- Explain purpose briefly: 'A few details will help sharpen this result.' Do not expose internal scoring/rule mechanics.
- Submit all visible required questions in one bounded interaction when practical; avoid one-question-at-a-time churn.
- Disable duplicate submission while request is pending; show recoverable error without losing entered answers.
- After successful submission, render regenerated product in place and preserve session/payment entitlement.
- Refresh/back navigation must restore answered follow-ups and active result without re-asking.
- Mobile and print/PDF behavior must remain functional.

## 12. Day 7D Implementation Sequence — ONE AUTHORITATIVE QA BUILD


### 12.1 Freeze accepted Day 7C baseline

Record branch/SHA, QA frontend/Worker/D1 targets, test commands and rollback artifacts. Working tree must be understood before edits.


### 12.2 Discovery-only intelligence audit

Map current intake fields, question bank, confidence functions, Shot/Sight/Path generators, D1 tables, clinical_followups usage, result caching, frontend renderers and tests. Identify exactly what is absent vs present-but-unused.


### 12.3 Write the Day 7D contract tests FIRST

Create fixtures for aligned evidence, contradictory evidence, low confidence, high confidence, follow-up improvement, deterministic replay, duplicate submission, refresh restoration and entitlement preservation.


### 12.4 Add migration-safe schema delta

CREATE TABLE/ALTER only where required. No DROP. Add indexes/uniqueness for follow-ups/evidence version if absent. Run against QA D1 only.


### 12.5 Build cumulative clinical-file assembler

One authoritative server-side function loads all prior evidence/results/follow-ups and returns a normalized evidence graph.


### 12.6 Build qualitative evidence normalization

Map approved intake values/text to governed topic/dimension tags and evidence codes. Do not implement unrestricted NLP or keyword guessing beyond explicitly governed deterministic mappings.


### 12.7 Build reconciliation + contradiction rules

Compare founder-stated concerns with objective health pattern and emit evidence-linked observations/hypotheses.


### 12.8 Restore follow-up question bank + selector

Version questions, triggers and confidence impacts. Ensure minimal, stage-specific selection and no repeats.


### 12.9 Integrate GalviShot

Evaluate → needs_followup or result → persist → answer → evidence-version bump → deterministic regeneration.


### 12.10 Integrate GalviSight

Consume cumulative file; interpretation must visibly reflect relevant Shot/Triage/follow-up evidence.


### 12.11 Integrate GalviPath

Consume cumulative file; sequencing must reflect founder target, evidence, urgency and feasibility.


### 12.12 Integrate GalviClinic brief

Confirm complete inherited clinical record and unresolved/validated findings.


### 12.13 Frontend bounded change

Add/re-enable follow-up renderer/submission/restoration only. Preserve accepted routing/paywalls/Stripe returns.


### 12.14 Analytics/CRM event compatibility

Emit clinical_followup_viewed/submitted with non-sensitive metadata only. HubSpot/GA4/Clarity failures remain non-blocking.


### 12.15 Automated full regression

Run Day 7D tests plus all existing Day 7A–7C tests, lint/static checks, diff check, environment scans and deployment gate.


### 12.16 Deploy QA ONCE

Deploy the complete authoritative QA candidate after automated gates pass. Do not piecemeal-deploy successive experimental Workers.


### 12.17 One Human Day 7D E2E

Execute one synthetic customer through Triage → Vitals → Score → Shot follow-up → Shot → Sight follow-up if triggered → Sight → Path follow-up if triggered → Path → Clinic.


### 12.18 Reconcile QA evidence

Prove inputs/follow-ups/results/events share one session and that downstream outputs contain evidence references to prior stages.


### 12.19 One bounded correction pass

If P0/P1 exists, fix supported root cause in the smallest authoritative change set, rerun affected + shared regression, redeploy QA once.


### 12.20 Production promotion ONCE

Only after Human PASS: merge/promote exact QA candidate SHA/config-equivalent build; production environment uses LIVE resources. Run smoke test without synthetic QA data migration.


## 13. Mandatory Differential Intelligence Test Matrix

| Fixture | Change | Expected proof |
| --- | --- | --- |
| A baseline | Known quantitative + qualitative answers | Stable expected result chain. |
| B stated-priority change | Change greatest-impact area only | Score unchanged; downstream reconciliation/interpretation may change where rules map the signal. |
| C challenge change | Change biggest challenge | Score unchanged; Shot evidence/hypothesis/finding selection or confidence changes when relevant. |
| D 30-day target change | Change immediate problem | Path 30-day sequencing/Clinic desired outcome changes; objective score unchanged. |
| E contradiction | State Product concern; fixture has Customer/Distribution weakness | Sight explicitly labels mismatch/hypothesis; does not falsely declare Product failure. |
| F low confidence | Remove critical supporting evidence | needs_followup; correct targeted questions returned; final result withheld as specified. |
| G follow-up resolution | Submit discriminating answers | Confidence/evidence version changes; regenerated result reflects answer. |
| H high confidence | Complete consistent evidence | No gratuitous follow-up; deterministic result. |
| I duplicate follow-up | Submit same answer twice | One stored answer; no duplicate events/results. |
| J refresh | Reload after follow-up/result | Same stage/result restored; question not re-asked. |
| K payment continuity | Follow-up occurs around paid product | Entitlement preserved; no checkout loop. |
| L adapter failure | HubSpot/GA4/Clarity fail | Care/intelligence path still succeeds. |


## 14. Traceability Acceptance Contract

For every customer-facing clinical assertion, Codex must be able to answer: WHAT evidence supports it? WHICH rule/version produced it? WHAT confidence/status applies? WHICH follow-up changed it? WHICH downstream recommendation consumes it?

```text
Example trace:
triage.primary_challenge
 + score.customer
 + score.distribution
 -> observation OBS_CUSTOMER_GROWTH_ALIGNMENT
 -> hypothesis HYP_GTM_CONSTRAINT
 -> followup GS_Q_GTM_01
 -> finding FIND_GTM_02
 -> sight interpretation INT_GTM_02
 -> path recommendation REC_GTM_VALIDATE_ICP
 -> clinic treatment GTM_READINESS_SPRINT
```


## 15. Security / Privacy / Safety

- Never send raw qualitative clinical/customer free text to GA4 or Clarity.
- Never log secrets, tokens, full Stripe objects, or sensitive payloads in browser console/evidence packs.
- Keep proprietary deterministic mappings/rules server-side.
- Validate action allowlist, payload size/types, session/product access and entitlement before paid result/follow-up operations.
- Use safe structured errors; never return blank HTML from Worker API.
- Do not infer mental-health state from 'what keeps you up at night'; treat it only as business risk/urgency evidence.

## 16. Automated Pre-Human Gate

```text
Required PASS before Human E2E:
[ ] full existing automated suite
[ ] Day 7D customer-intelligence unit tests
[ ] differential fixture tests
[ ] follow-up idempotency tests
[ ] evidence-version cache invalidation tests
[ ] stored-result deterministic replay
[ ] payment/entitlement regression
[ ] routing/session restoration regression
[ ] HubSpot/GA4/Clarity non-blocking tests
[ ] QA/Production contamination/source scan
[ ] secret scan
[ ] git diff --check
[ ] deployment/stabilization gate
[ ] QA Worker health/environment assertion
```


## 17. Human Day 7D E2E Certification Script

- Use one unique synthetic QA founder and record run_id + galvicare_session_id.
- Enter deliberately meaningful qualitative context (priority, challenge, 30-day target, growth blocker, broken area, risk).
- Complete quantitative Triage and capture Vitals/Score.
- Verify Score is determined by scored assessment—not arbitrarily changed by qualitative prose.
- At GalviShot, verify qualitative context is reflected in evidence/finding logic. If low/moderate confidence fixture is used, answer targeted follow-ups and verify regenerated Shot improves/changes appropriately.
- Continue to GalviSight; verify meaning is consistent with Shot and explicitly handles any designed contradiction.
- Continue to GalviPath; verify 30-day target and cumulative evidence affect sequencing where appropriate.
- Reach GalviClinic; verify brief inherits reason for visit, score/classification, findings, interpretation, pathway, treatment, agenda and desired outcome.
- Refresh at least once after a follow-up and once after a paid result; confirm no loss, duplicate, re-questioning or entitlement loop.
- Verify HubSpot/GA4/Clarity evidence as required by Day 7C without allowing those systems to block care.

## 18. Day 7D GO / NO-GO

| GO — all required | NO-GO — any one blocks |
| --- | --- |
| Meaningful qualitative input is demonstrably consumed downstream. | Screenshot questions are merely stored/displayed but do not enter evidence reconciliation. |
| Progressive follow-ups trigger deterministically when required. | Generic questions always appear or follow-ups never appear under low confidence. |
| Follow-up answers materially update evidence/confidence/result when applicable. | Answers are saved but output is unchanged despite a rule-defined impact. |
| Score remains objective and deterministic. | Free text directly manipulates GalviScore without governed scoring rule. |
| Shot → Sight → Path → Clinic is cumulative and traceable. | Each product regenerates from isolated inputs / loses prior evidence. |
| Refresh/repeat is idempotent. | Duplicate follow-ups/results/events or re-asked answered questions. |
| Existing Day 7A–7C regression suite remains green. | Routing, payment, entitlement, CRM/analytics or environment separation regresses. |
| One QA candidate is promotable as-is. | Production requires a materially different code fix. |


## 19. Defect Rule — No Loops

A failed acceptance criterion must produce one consolidated defect report: criterion/severity; observed evidence; supported root cause; exact affected file/function/schema; smallest authoritative correction; exact affected tests plus shared regression; rollback impact. Do not regenerate unchanged files, create parallel Workers, or perform repeated speculative diagnostics.

After one bounded correction pass, a second materially different P0/P1 is BLOCKED unless the Human Product Owner explicitly authorizes another pass.


## 20. Production Promotion Contract

- Human Product Owner explicitly approves the exact QA candidate SHA after Day 7D E2E PASS.
- Promote code—not QA data. Production D1 remains Production; QA synthetic records remain QA.
- Use Production environment bindings/Stripe LIVE/production adapters already established by Day 7B/7C.
- No code edits during promotion. If a production-only code edit is required, STOP: QA and Production are no longer the same release candidate.
- Run production health + canonical route + one non-destructive smoke verification. Do not perform unnecessary live purchases.
- Tag release and retain rollback SHA/artifacts.

## 21. Codex One-Pass Day 7D Execution Prompt

```text
You are the implementation engineer for GalviCare 0.5 Day 7D.

READ THIS GUIDE IN FULL BEFORE ACTING.

MISSION
Restore the originally specified cumulative Customer Intelligence Engine (GalviEngine) in the accepted Day 7C QA candidate. Make GalviTriage qualitative context analytically consequential downstream, restore deterministic progressive clinical follow-ups for GalviShot/GalviSight/GalviPath, and ensure each downstream product consumes the complete prior Founder Health Record.

NON-NEGOTIABLES
- QA = BUILD; Production = RUN.
- Build/test in QA; promote the exact approved candidate to Production once.
- No Make. No OpenAI. No Airtable writes. No second Worker. No framework rewrite.
- Do not change GalviScore weights or let free text arbitrarily change objective scoring.
- Preserve Day 7A–7C routing, Stripe, entitlements, session restoration, HubSpot, GA4, Clarity, Clinic, security and environment separation.
- One galvicare_session_id across the journey.
- Intelligence/rules remain server-side.
- Downstream adapters remain non-blocking.
- No piecemeal Worker deployments and no speculative loops.

EXECUTION
1. Freeze and report the accepted Day 7C QA SHA/environment.
2. Audit current intake fields, clinical_followups schema/actions, confidence rules, Shot/Sight/Path generators, clinical-file assembly, frontend follow-up UI and tests.
3. Return one consolidated implementation delta; then implement it as one authoritative change set.
4. Add contract tests proving qualitative evidence use, contradiction handling, confidence-triggered follow-ups, answer impact, cumulative evidence, idempotency, refresh restoration and payment continuity.
5. Add only migration-safe QA D1 schema changes required.
6. Implement one cumulative clinical-file assembler and deterministic evidence reconciliation layer.
7. Restore/version targeted follow-up selection and confidence-impact logic.
8. Integrate Shot, then Sight, then Path, then Clinic against the cumulative record.
9. Re-enable/add the minimum frontend follow-up panel and restore behavior.
10. Preserve clinical_followup_viewed/submitted analytics using non-sensitive metadata only.
11. Run the entire existing regression suite + Day 7D tests + static/security/environment/deployment gates.
12. Deploy the complete QA candidate once.
13. Produce ONE PRE-HUMAN-E2E report containing exact QA URL, candidate SHA, automated pass matrix, synthetic fixture, expected follow-up behavior, and evidence queries.
14. STOP for the Human Day 7D E2E.
15. Reconcile the supplied Human evidence against D1/results/events and the intelligence traceability contract.
16. If one supported P0/P1 exists, perform at most one bounded authoritative correction, rerun affected + shared regression, and redeploy QA once.
17. When all Day 7D gates pass, report READY FOR DAY 7D PRODUCTION PROMOTION with exact SHA and rollback SHA.
18. Do not touch Production until explicit Human approval.
19. After approval, promote the exact QA candidate once with Production bindings, run non-destructive smoke checks, tag the release, and report DAY 7D PRODUCTION PASS or BLOCKED.

FINAL REPORT MUST INCLUDE
- changed files/schema
- rules/question versions
- automated test counts/results
- differential-intelligence fixture results
- Human E2E result
- input → evidence → observation/hypothesis → finding → interpretation → recommendation trace
- regression status for Day 7A–7C
- QA/Production contamination status
- exact QA candidate SHA / production SHA / rollback SHA
- deferred items (only true 1.0 scope)
```


## 22. Human Product Owner Final Checklist

- □ Intake context demonstrably influences downstream intelligence without corrupting objective scoring.
- □ GalviShot follow-ups work under the specified confidence/evidence conditions.
- □ GalviSight uses prior findings + new evidence and handles contradictions safely.
- □ GalviPath uses cumulative evidence + stated 30-day target for sequencing.
- □ GalviClinic receives the cumulative Founder Health Record.
- □ Follow-ups are targeted, bounded, non-repetitive and restored after refresh.
- □ One session can be traced from raw evidence to recommendation/treatment.
- □ Stripe/paywalls/entitlements remain correct.
- □ HubSpot/GA4/Clarity remain correct and non-blocking.
- □ QA contains TEST resources only; Production remains untouched before approval.
- □ Full regression passes.
- □ Exact QA SHA is approved for one production promotion.

## Appendix A — Suggested Rule/Question File Ownership

| Concern | Preferred ownership |
| --- | --- |
| Assessment contract | rules/questions_v0_5.* |
| Qualitative evidence mappings | rules/context_mappings_v0_5.* |
| Follow-up question bank | rules/clinical_followups_v0_5.* |
| Confidence/reconciliation | GalviEngine server module or existing authoritative Worker section |
| Shot/Sight/Path content | existing governed product content libraries |
| Schema delta | migration file / D1 migration mechanism already used by repo |
| Frontend follow-up UI | existing index/app module; minimum bounded change |

Codex must adapt these names to the actual repository structure discovered in preflight. Do not create duplicate parallel modules when an authoritative implementation already exists.


## Appendix B — Explicitly Deferred to GalviCare 1.0+

- OpenAI-assisted extraction/synthesis/personalization.
- Transcript/file ingestion and semantic retrieval.
- Autonomous cross-case learning or self-modifying rules.
- Unrestricted natural-language diagnosis.
- Continuous-care adherence/outcome portal beyond existing 0.5 capture.
- Enterprise rule editor/admin portal.