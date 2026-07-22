**GALVICARE™ 0.5**

**DAY 4 BUILDER GUIDE**

**Codex Implementation Engineer Edition**

**GalviShot → GalviSight → Chart Your GalviPath → GalviClinic**

One Concentrated 3-Hour QA Build Session • Human-Governed Production Approval

No Make • No OpenAI • One Cloudflare Worker + D1 • Browser Presentation Only

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>PURPOSE OF THIS EDITION<br />
</strong>Convert the approved Day 3 clinical findings record into a deterministic GalviSight interpretation and a deterministic Chart Your GalviPath care sequence. The system must explain what the findings mean, identify risks and opportunities, classify urgency, generate a coherent 30/60/90-day pathway, preserve the same session and clinical file, and return stored results without regeneration.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>NON-NEGOTIABLE HUMAN AUTHORITY<br />
</strong>CODEX MAY DISCOVER, IMPLEMENT, TEST, AND PREPARE A QA PULL REQUEST. CODEX MAY NOT INVENT STRATEGIC CLAIMS, CHANGE DAY 2 OR DAY 3 AUTHORITATIVE LOGIC, EXPOSE RULES IN THE BROWSER, MERGE TO MAIN, DEPLOY PRODUCTION, OR DECLARE DAY 4 ACCEPTED. ONLY THE HUMAN PRODUCT OWNER MAY APPROVE PRODUCT MEANING, PATHWAY CREDIBILITY, COMMERCIAL VALUE, AND RELEASE PROMOTION.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

*Prepared for GalviPro / GalviStudio \| July 2026 \| Version 2.0 FINAL*

# Document Map

| **Part**                        | **Sections**      | **Primary outcome**                                                                                                                      |
|---------------------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| A — Concentrated Codex Runbook  | 0–10              | Complete one discovery pass, one authorized implementation pass, one QA pass, and one PR recommendation.                                 |
| B — Day 4 Engineering Contract  | 11–28             | Implement deterministic GalviSight interpretation, GalviPath protocol selection, persistence, APIs, UI adapters, and server-side safety. |
| C — QA, Release, and Operations | 29–42             | Prove coherence, traceability, non-duplication, security, regression safety, rollback readiness, and Day 5 handoff.                      |
| Appendices A–H                  | Copy/paste assets | Prompts, schemas, pseudocode, migrations, fixtures, test matrices, evidence forms, and PR template.                                      |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>RELEASE PRINCIPLE<br />
</strong>Day 4 succeeds only when GalviScore quantifies health, GalviShot identifies findings, GalviSight explains why they matter, and GalviPath sequences care without repetition or unsupported invention. The four products must feel progressive, coherent, and commercially useful.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>LESSONS LEARNED FROM DAYS 2–3<br />
</strong>This guide removes repeated discovery, duplicated stabilization, unnecessary branch churn, and vague approval loops. Codex receives one authoritative specification, must reconcile it against repository reality before editing, and then performs one bounded implementation with checkpoint evidence. No step is repeated unless a specific failed acceptance criterion requires a targeted correction.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# PART A — CONCENTRATED CODEX SESSION RUNBOOK

# 0. How to Use This Guide

This document is simultaneously the Product Owner supervision runbook and Codex’s authoritative Day 4 engineering contract. Repository reality controls implementation details; this guide controls scope, safety, clinical meaning, acceptance, and prohibited behavior. When repository reality conflicts with the guide, Codex must stop and report the conflict rather than improvise.

| **Layer**                  | **Primary user**              | **Purpose**                                                                                                                                          |
|----------------------------|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Codex session runbook      | Human Product Owner           | Start the correct QA branch, require one discovery report, authorize one implementation, review checkpoint evidence, and prevent production changes. |
| Day 4 engineering contract | Codex implementation engineer | Build interpretation and pathway services using the approved Day 3 record, D1, existing Worker router, and existing frontend.                        |
| Human verification gates   | Human Product Owner           | Judge meaning, urgency, opportunity realism, care sequencing, security boundaries, regression risk, and PR readiness.                                |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>OPERATING MODEL<br />
</strong>Builder Guide → discovery-only report → one human authorization → QA implementation → automated tests → Codex self-review → one human live QA → GO / NO-GO. Production promotion remains a separate future action.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 1. Day 4 Mission and Release Gate

| **Area**               | **Must be true before Day 4 can be accepted**                                                                                                              |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Interpretation         | GalviSight explains the approved Day 3 findings without repeating them or adding unsupported facts.                                                        |
| Traceability           | Every meaning statement, risk, opportunity, urgency signal, and action links to stored finding codes, evidence references, assumptions, and rule versions. |
| Hypothesis safety      | Root-cause statements remain explicitly labeled hypotheses unless directly supported by stored evidence.                                                   |
| Pathway                | Exactly one primary care pathway is selected from the governed protocol library with a documented rationale.                                               |
| 30/60/90 sequence      | Actions are prioritized, time-bounded, measurable, capacity-aware, and connected to evidence-to-collect and escalation triggers.                           |
| Persistence            | GalviSight and GalviPath each store one active result per session/product/rules version and return it unchanged on refresh.                                |
| Frontend               | Existing locked/result designs are preserved; the browser renders server responses and contains no proprietary interpretation or pathway logic.            |
| Regression             | Triage, Vitals, Score, Shot, session continuity, CORS, analytics, and legacy routes continue to pass.                                                      |
| Commercial progression | Shot → Sight → Path feels additive: findings → meaning → sequence, not three versions of the same report.                                                  |

# 2. Codex Responsibilities and Prohibitions

| **Codex responsibility** | **Required output**                                                                                                                                                       |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Repository discovery     | Map Worker router, Day 2/3 rules, Day 3 result schema, D1 tables, current Sight/Path screens, payment gates, tests, and deployment configuration before editing.          |
| Implementation           | Add governed interpretation components, confidence/follow-up evaluation, pathway protocols, 30/60/90 sequencing, API actions, D1 migration, frontend adapters, and tests. |
| Preservation             | Keep one Worker, QA isolation, session continuity, existing paywall semantics, legacy routes, and rollback artifacts.                                                     |
| Verification             | Run unit, integration, contract, persistence, entitlement, regression, security, and golden-case tests; provide exact commands and results.                               |
| Documentation            | Provide changed-file inventory, architecture notes, migrations, rollback commands, assumptions, unresolved decisions, and manual QA steps.                                |
| PR preparation           | Prepare one reviewable QA pull request. Do not merge, production-deploy, alter secrets, or approve release.                                                               |

## Codex is explicitly forbidden to:

- Invent causal explanations, market conditions, customer behavior, founder biography, capability, urgency, opportunity, or outcome not supported by the clinical file.

- Change the Day 2 question contract, score formula, dimension mapping, or rules version.

- Change Day 3 finding eligibility, ranking, confidence, evidence, or entitlement behavior without written Product Owner approval.

- Place interpretation triggers, pathway protocols, ranking rules, urgency logic, paid narrative components, or entitlement logic in browser-delivered code.

- Grant access from URL parameters, localStorage, sessionStorage, success-page state, or any unverified client assertion.

- Create a second Worker, bypass the existing action router, or add Make, OpenAI, Airtable, or browser-to-secret calls.

- Regenerate a stored Sight or Path result on refresh or silently overwrite a result under the same rules version.

- Refactor unrelated code for cleanliness or expand Day 4 into Day 5 Stripe/Clinic hardening.

- Use production D1, production secrets, live Stripe mode, main branch, or production deployment.

- Silently resolve ambiguous product language. Stop and request a Product Owner decision.

# 3. Prerequisites Carried Forward from Day 3

| **Prerequisite**     | **Required evidence**                                                                                                                                          |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| QA branch            | Approved Day 3 code is present on the active QA branch/worktree.                                                                                               |
| Day 3 release record | Stable GalviShot result contract contains ranked finding codes, evidence links, risks, actions, assumptions, confidence, generation source, and rules version. |
| D1 persistence       | Known-good sessions return identical GalviShot results without duplicate rows.                                                                                 |
| Entitlement path     | Existing verified entitlement or QA-only override is mapped and remains authoritative.                                                                         |
| Sight/Path UI        | Existing locked/result sections, CTAs, routing, session handling, and safe renderer are identified.                                                            |
| Fixtures             | At least four sanitized clinical files exist: stabilize, validate/grow, diagnose/low-confidence, and broad weakness.                                           |
| Rollback             | Pre-Day-4 branch/tag/ZIP, Worker source copy, and D1 rollback plan are available.                                                                              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>PRECONDITION GATE<br />
</strong>STOP before implementation if Day 3 is not accepted, the GalviShot schema is unstable, the deployed Worker source cannot be identified, session continuity is broken, or Codex proposes browser-side clinical logic.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 4. Repository Readiness Checklist

| **Required item**                        | **Ready?** | **Evidence / path**                                            |
|------------------------------------------|------------|----------------------------------------------------------------|
| Correct QA branch/worktree checked out   | ☐          | Branch: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_   |
| Day 3 merge/commit identified            | ☐          | Commit SHA: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_       |
| Deployed QA Worker source identified     | ☐          | Path: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Worker action router identified          | ☐          | Path/function: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_        |
| Day 3 rules and schemas identified       | ☐          | Paths: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  |
| D1 migrations and commands identified    | ☐          | Path/command: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_         |
| Current GalviSight UI identified         | ☐          | Path/lines: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_       |
| Current GalviPath UI identified          | ☐          | Path/lines: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_       |
| Payment/entitlement authority identified | ☐          | Backend/frontend path: \_\_\_\_\_\_\_\_\_\_\_                  |
| Four golden fixtures available           | ☐          | Paths/session IDs: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_              |
| Test commands identified                 | ☐          | Command: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_    |
| Production secrets excluded              | ☐          | Confirmed by: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_         |
| Rollback package saved                   | ☐          | Folder/tag: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_       |

# 5. Codex Discovery Prompt — Copy and Paste

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>You are the implementation engineer for GalviCare 0.5 Day 4.<br />
<br />
MODE: DISCOVERY ONLY. DO NOT EDIT FILES, RUN DESTRUCTIVE COMMANDS, APPLY MIGRATIONS, CHANGE DATA, DEPLOY, MERGE, OR CREATE A PULL REQUEST.<br />
<br />
Read CODEX_DAY4_IMPLEMENTATION_BRIEF.md and the Day 4 Builder Guide. Inspect the approved QA branch/worktree and return one consolidated discovery report containing:<br />
1. Repository map and exact files for Worker routing, Day 2 scoring, Day 3 GalviShot rules/results, D1, entitlement, GalviSight UI, GalviPath UI, tests, and deployment.<br />
2. Exact current Shot → Sight → Path flow, including locked state, payment return, generation/retrieval calls, render, refresh, and next-screen routing.<br />
3. Authoritative Day 3 result schema and evidence fields available to Day 4.<br />
4. Current D1 tables, indexes, uniqueness constraints, migrations, and the safest additive Day 4 migration.<br />
5. Existing entitlement authority and any temporary gap that must be preserved without weakening access control.<br />
6. Existing automated tests, missing tests, and commands.<br />
7. Legacy actions, CORS, analytics, session behavior, and integrations that must remain untouched.<br />
8. Every difference between repository reality and this guide.<br />
9. Security, privacy, clinical-credibility, duplication, persistence, and production risks.<br />
10. Proposed changed files, exact implementation sequence, checkpoints, test plan, manual QA plan, migration, and rollback.<br />
11. A binary recommendation: READY FOR ONE-PASS IMPLEMENTATION or BLOCKED, with precise reasons.<br />
<br />
Non-negotiable constraints:<br />
- One existing Worker only; QA branch/worktree only.<br />
- No Make, no OpenAI, no Airtable in the customer path, no browser clinical logic.<br />
- Never invent facts; every interpretation and pathway element must trace to stored findings/evidence.<br />
- Preserve Day 2 and Day 3 contracts, paywall semantics, session continuity, and all legacy routes.<br />
- Return stored Sight/Path before attempting creation.<br />
- Do not merge or deploy.<br />
<br />
Stop after this single discovery report and wait for Product Owner authorization.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 6. Human Discovery Approval Gate

| **Approval item**                                                             | **Decision**     |
|-------------------------------------------------------------------------------|------------------|
| Repository, branch/worktree, and Worker source are correct                    | APPROVE / BLOCK  |
| Day 3 source record is authoritative and complete                             | APPROVE / BLOCK  |
| Current Sight/Path UI and entitlement path are correctly mapped               | APPROVE / BLOCK  |
| D1 migration is additive and preserves uniqueness/data                        | APPROVE / BLOCK  |
| Interpretation families and permitted language remain human-governed          | APPROVE / REVISE |
| Pathway protocols and care sequencing remain human-governed                   | APPROVE / REVISE |
| Tests cover coherence, safety, persistence, security, payment, and regression | APPROVE / REVISE |
| One-pass implementation authorized                                            | GO / NO-GO       |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>HUMAN REVIEW REQUIRED<br />
</strong>Do not approve when Codex cannot identify the exact deployed Worker source, proposes a new Worker, proposes browser-side rules, changes Day 3 findings, treats client state as entitlement, or cannot explain how the same clinical file drives both Sight and Path.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 7. Three-Hour Build Session Checkpoints

| **Elapsed target** | **Checkpoint**           | **Codex output**                                                                                       | **Human action**                                         |
|--------------------|--------------------------|--------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| 0:00–0:25          | 0 — Discovery            | One consolidated repository report, risks, plan, changed files, and READY/BLOCKED recommendation.      | Review once and authorize or block.                      |
| 0:25–0:45          | 1 — Contracts            | Sight schema, Path schema, rule/component contracts, confidence behavior, persistence keys, and tests. | Approve product meaning and pathway language.            |
| 0:45–1:45          | 2 — D1 + backend         | Migration, libraries, evaluation, sequencing, storage/retrieval, entitlement gate, backend tests.      | Review representative golden outputs and evidence trace. |
| 1:45–2:25          | 3 — Frontend integration | Locked/follow-up/result/error states, safe renderers, routing, stored refresh, print/booking CTAs.     | Confirm browser contains presentation only.              |
| 2:25–2:50          | 4 — Full QA/self-review  | Full test matrix, security scan, regression, migration/rollback evidence.                              | Perform one manual live QA pass.                         |
| 2:50–3:00          | 5 — PR recommendation    | Reviewable diff and GO/BLOCK recommendation with reasons.                                              | Independently decide PR approval.                        |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>TIMEBOX RULE<br />
</strong>The three-hour target assumes prerequisites pass. Codex must not repeat successful discovery, migrations, or full regression runs. A failed criterion receives one targeted correction and targeted re-test; the full suite is rerun only once at final closeout.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 8. Codex One-Pass Build Prompt — Copy and Paste

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>Proceed with the approved GalviCare 0.5 Day 4 implementation on the approved QA branch/worktree.<br />
<br />
Use the Day 4 Builder Guide as the authoritative scope and safety contract. Reconcile implementation details with the approved discovery report. Work in the five checkpoints defined by the guide. Do not reopen discovery unless a new repository contradiction appears.<br />
<br />
Required scope:<br />
- Add versioned, server-side governed libraries for interpretation components, strategic risks, opportunities, urgency, actions, follow-up questions, assumptions, and pathway protocols.<br />
- Add only the additive D1 schema/indexes needed to link GalviSight interpretations and GalviPath recommendations to Day 3 findings, evidence, assumptions, rules versions, and the same session clinical file.<br />
- Implement evaluate_galvisight, save_galvisight_followup, get_or_create_galvisight, get_galvisight, evaluate_galvipath, get_or_create_galvipath, and get_galvipath in the existing Worker action router (adapt names only when repository conventions require it).<br />
- Load the authoritative stored GalviShot plus Day 2 source record. Never recalculate or alter Day 2/3 authoritative outputs.<br />
- Compute Sight confidence; return targeted follow-up questions or facilitator_review when evidence is insufficient.<br />
- Assemble meaning, explicitly labeled root-cause hypotheses, strategic risks, opportunities, urgency, actions, assumptions, and evidence trace from governed components.<br />
- Select exactly one primary pathway from stabilize, diagnose, validate, build, grow, fundraise, automate, or transform. Generate coherent 30/60/90-day objectives/actions, evidence to collect, cadence, support recommendation, and escalation triggers.<br />
- Store each result once per session/product/rules_version and always return the stored result before creation.<br />
- Enforce verified entitlement or environment-scoped QA override. Never trust browser state or query parameters.<br />
- Preserve existing Sight/Path paywall and result designs, safe renderers, session continuity, Continue to Chart Your GalviPath, Book GalviClinic, and Print behavior.<br />
- Keep all rules and paid narrative content server-side.<br />
- Add automated tests for golden cases, low confidence, no invention, evidence traceability, hypothesis labeling, contradiction, urgency, opportunity capacity, pathway selection, 30/60/90 ordering, suppression, entitlement, QA override isolation, duplicate refresh, invalid payload, storage failure, safe rendering, and legacy regression.<br />
<br />
Checkpoint protocol:<br />
A. State planned files before editing; do not ask for re-approval if they match the approved discovery plan.<br />
B. After contracts/migration/backend, run backend tests and report exact commands/results.<br />
C. After frontend integration, run affected tests and report exact commands/results.<br />
D. Perform one final full suite and self-review every Day 4 acceptance item.<br />
<br />
Final output:<br />
1. Implementation summary.<br />
2. Changed files and why.<br />
3. Commands/tests and exact results.<br />
4. Migration and rollback instructions.<br />
5. Golden-case outputs with evidence trace and pathway rationale.<br />
6. Assumptions and unresolved Product Owner decisions.<br />
7. Security/browser-boundary confirmation.<br />
8. Manual QA steps.<br />
9. Pull request description.<br />
10. GO/BLOCK recommendation.<br />
<br />
Do not merge, production-deploy, change live data, rotate secrets, weaken entitlement, or declare Product Owner approval.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 9. Human Product Owner Verification — Mandatory

- Load the four approved fixtures and judge whether Sight adds meaning beyond Shot and Path adds sequencing beyond Sight.

- For every meaning statement, risk, opportunity, urgency signal, and action, identify the source finding/evidence/assumption.

- Confirm every root cause is labeled hypothesis unless directly evidenced.

- Confirm low-confidence sessions receive only relevant follow-up or facilitator-review behavior and no unsupported paid interpretation.

- Confirm pathway selection is traceable to one governed protocol and capacity constraints are respected.

- Confirm 30/60/90 actions are ordered, measurable, and not a generic checklist.

- Confirm unpaid access remains locked and QA override works only in QA.

- Refresh and reopen the same session; confirm stable stored output and no duplicate result/interpretation/recommendation rows.

- Review browser-delivered files for rules, triggers, paid copy, secrets, and entitlement logic.

- Test mobile width, retry/error states, visible session ID, print, Continue to Path, and Book GalviClinic.

- Re-run Triage, Vitals, Score, and Shot once and confirm no regression.

- Review migration and rollback commands before approving the PR.

# 10. Human Approval Record

| **Approval**                          | **Human decision / evidence**                                                      |
|---------------------------------------|------------------------------------------------------------------------------------|
| Day 3 prerequisite accepted           | Commit/evidence: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_      |
| Sight interpretation library approved | Version/date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_   |
| Hypothesis/urgency behavior approved  | Decision: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Pathway protocol library approved     | Version/date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_   |
| Golden fixture 1 approved             | Session/result: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_     |
| Golden fixture 2 approved             | Session/result: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_     |
| Golden fixture 3 approved             | Session/result: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_     |
| Golden fixture 4 approved             | Session/result: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_     |
| Evidence traceability approved        | PASS / BLOCK                                                                       |
| Entitlement boundary approved         | PASS / BLOCK                                                                       |
| Browser security boundary approved    | PASS / BLOCK                                                                       |
| Regression approved                   | PASS / BLOCK                                                                       |
| Day 4 PR approved                     | GO / NO-GO                                                                         |

# PART B — DAY 4 ENGINEERING CONTRACT

# 11. Day 4 Product Progression Contract

| **Product**          | **Clinical question**                      | **Day 4 dependency/output**                                                                                |
|----------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| GalviScore           | How healthy is the venture quantitatively? | Authoritative dimension scores, overall score, classification, and confidence; Day 4 must not recalculate. |
| GalviShot            | What findings are presenting?              | Authoritative 3–5 ranked finding codes, evidence, risks, actions, assumptions, and confidence.             |
| GalviSight           | What do the findings mean now?             | Meaning, hypotheses, implications, risks, opportunities, urgency, and strategic actions.                   |
| Chart Your GalviPath | What sequence of care should follow?       | One primary pathway, rationale, 30/60/90 sequence, evidence plan, cadence, support, escalation.            |
| GalviClinic          | What treatment should be executed?         | Day 5 consumes the pathway; Day 4 only provides Book GalviClinic handoff.                                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>ANTI-REPETITION CONTRACT<br />
</strong>GalviSight may reference findings but must not reproduce the GalviShot report. GalviPath may reference meaning and urgency but must not reproduce GalviSight. Each screen must answer a distinct clinical question.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 12. Source-of-Truth and Data Authority

| **Record/data**               | **Authority**                            | **Day 4 permitted behavior**                                                      |
|-------------------------------|------------------------------------------|-----------------------------------------------------------------------------------|
| Triage raw/normalized answers | Day 2 stored clinical record             | Read only for context/evidence; never modify.                                     |
| Vitals and Score              | Day 2 rules/versioned stored result      | Read only; never recalculate or reinterpret dimension formulas.                   |
| GalviShot findings            | Day 3 stored result and finding rows     | Primary Day 4 source; never rerank or alter finding codes.                        |
| Entitlement                   | Server-side verified payment/QA override | Check before returning paid results.                                              |
| Sight result                  | Day 4 stored product result              | Create once; return stored result on repeat.                                      |
| Path result                   | Day 4 stored product result              | Create once; return stored result on repeat.                                      |
| Browser state                 | Presentation convenience only            | Never authoritative for score, findings, entitlement, interpretation, or pathway. |

# 13. Common API Contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>POST https://&lt;qa-worker&gt;/api<br />
{<br />
"action": "evaluate_galvisight | save_galvisight_followup | get_or_create_galvisight | get_galvisight | evaluate_galvipath | get_or_create_galvipath | get_galvipath",<br />
"session_id": "gc_...",<br />
"current_stage": "GalviSight | GalviPath",<br />
"payload": { }<br />
}<br />
<br />
Response:<br />
{<br />
"success": true,<br />
"status": "ok | locked | needs_followup | facilitator_review | not_found | error",<br />
"session_id": "gc_...",<br />
"data": { },<br />
"next_screen": "Chart Your GalviPath | GalviClinic"<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>CONTRACT RULE<br />
</strong>All errors return structured JSON. The Worker must never return HTML, an empty body, a stack trace, secrets, SQL, or rule internals to the browser.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 14. GalviSight Interpretation Library

Create or adapt a server-side module such as rules/galvisight_interpretations_v0_5.js. Components are selected using approved Day 3 finding codes and contextual attributes. The component library contains language, not free-form generation.

| **Component field**    | **Requirement**                                                                                 |
|------------------------|-------------------------------------------------------------------------------------------------|
| component_id           | Stable unique code.                                                                             |
| version                | Library/rule version.                                                                           |
| eligible_finding_codes | One or more Day 3 finding codes.                                                                |
| required_evidence      | Evidence keys/thresholds that must be present.                                                  |
| meaning_component      | What the finding means in decision terms.                                                       |
| hypothesis_component   | Possible root cause, explicitly labeled as hypothesis.                                          |
| risk_components        | Approved strategic risk objects.                                                                |
| opportunity_components | Approved opportunity objects with impact/effort/capacity requirements.                          |
| urgency_effect         | Numeric or categorical effect with stated rationale.                                            |
| action_components      | Approved strategic actions; not detailed treatment.                                             |
| assumptions            | Required limitations/assumptions.                                                               |
| suppression_rules      | Contradictions, missing evidence, duplicates, capacity constraints, or incompatible components. |
| evidence_template      | How evidence references are surfaced without exposing rules.                                    |

# 15. Minimum Interpretation Families

| **Family**             | **Typical source findings**                                            | **Permitted Day 4 meaning**                                                                 |
|------------------------|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Revenue viability      | Revenue signal weak, business model unclear, pricing/monetization gaps | Explain sustainability/decision implications; avoid forecasting revenue.                    |
| Customer evidence      | Customer proof weak, retention/adoption gaps, problem evidence weak    | Explain uncertainty in demand or adoption; avoid claiming customers reject the offer.       |
| Product readiness      | Product validation/delivery/quality gaps                               | Explain execution and learning implications; avoid technical claims not in evidence.        |
| Founder capacity       | Founder strain, leadership bandwidth, operating discipline gaps        | Explain constraint and decision-load implications; avoid health or psychological diagnosis. |
| Distribution/GTM       | Acquisition, conversion, positioning, channel gaps                     | Explain growth-system implications; avoid market-size or competitor claims not provided.    |
| Technology/operations  | Process, system, automation, delivery bottlenecks                      | Explain repeatability/scalability risk; avoid prescribing tools without evidence.           |
| Fundraising readiness  | Narrative, evidence, metrics, diligence gaps                           | Explain capital-readiness implications; avoid predicting investor outcomes.                 |
| Multi-system fragility | Several weak/contradictory dimensions                                  | Explain compound risk and sequencing need; avoid implying business failure.                 |

# 16. GalviSight Confidence and Follow-Up

| **Band**         | **Customer behavior**                                                                | **Implementation behavior**                                                                   |
|------------------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| 0–59 Low         | Withhold final paid interpretation.                                                  | Return needs_followup or facilitator_review with only targeted missing-context questions.     |
| 60–79 Medium     | May show bounded result with explicit assumptions after approved follow-up behavior. | Limit strong language, include assumptions, avoid precise root cause, preserve evidence gaps. |
| 80–89 High       | Standard governed deliverable.                                                       | Return full approved component set with evidence trace.                                       |
| 90–100 Very high | Most complete governed deliverable.                                                  | Still preserve hypothesis language and no unsupported facts.                                  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>sight_confidence = clamp(<br />
shot_confidence<br />
+ evidence_coverage_effect<br />
+ context_completeness_effect<br />
- contradiction_penalty<br />
- missing_constraint_penalty,<br />
0,<br />
100<br />
)<br />
<br />
Important: use repository-approved formula constants. If none exist, Codex must propose constants for Product Owner approval before coding them.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 17. GalviSight API Actions

| **Action**               | **Required behavior**                                                                                                                                                               |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| evaluate_galvisight      | Load stored Day 2/3 clinical file; validate prerequisites; compute confidence; return eligible component IDs, questions, assumptions, and status without storing final paid result. |
| save_galvisight_followup | Validate question IDs and answers; persist raw/normalized follow-up evidence idempotently; log event; do not create paid result unless explicitly called.                           |
| get_or_create_galvisight | Verify entitlement/QA override; return stored result first; otherwise assemble approved interpretation, persist one result plus linked interpretation records, and return.          |
| get_galvisight           | Verify access and return stored active result; never regenerate.                                                                                                                    |

# 18. GalviSight Result Schema

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"product": "GalviSight",<br />
"session_id": "gc_...",<br />
"status": "ok",<br />
"confidence": 88,<br />
"confidence_band": "high",<br />
"meaning_summary": "...",<br />
"root_cause_hypotheses": [<br />
{<br />
"hypothesis_code": "HYP_...",<br />
"statement": "A possible contributing cause is ...",<br />
"evidence_refs": ["finding:REVENUE_SIGNAL_WEAK", "score:Revenue:42"],<br />
"confidence": "medium"<br />
}<br />
],<br />
"strategic_risks": [<br />
{"code":"RISK_DECISION_DELAY","title":"Decision delay","impact":"high","why_it_matters":"...","evidence_refs":["finding:..."]}<br />
],<br />
"opportunities": [<br />
{"code":"OPP_EVIDENCE_SPRINT","title":"Focused evidence sprint","impact":"high","effort":"low","rationale":"...","capacity_warning":false,"evidence_refs":["finding:..."]}<br />
],<br />
"urgency": {"level":"high","rationale":"...","time_horizon":"30_days","evidence_refs":["finding:..."]},<br />
"recommended_actions": [<br />
{"code":"ACTION_...","sequence":1,"action":"...","rationale":"...","evidence_refs":["finding:..."]}<br />
],<br />
"assumptions": ["..."],<br />
"source_finding_codes": ["..."],<br />
"generation_source": "rules",<br />
"rules_version": "galvisight_rules_v0_5_1",<br />
"created_at": "ISO-8601",<br />
"next_step": "Chart Your GalviPath"<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 19. Interpretation Assembly Rules

1.  Load the stored active GalviShot for the same session and accepted rules version.

2.  Validate that every finding has evidence references and confidence.

3.  Identify dominant and contributing finding families without reranking Day 3.

4.  Select eligible interpretation components; suppress contradictions, duplicates, and unsupported components.

5.  Assemble one meaning summary that connects the findings to the founder’s stated goal/constraint.

6.  Generate zero or more explicitly labeled hypotheses only from approved components.

7.  Select non-duplicative strategic risks and opportunities with evidence references.

8.  Compute urgency from approved severity, consequence, time horizon, and compounding effects.

9.  Select strategic actions that prepare pathway selection but do not become a treatment plan.

10. Persist the result and linked records transactionally; return the stored representation.

# 20. Urgency, Risk, and Opportunity Safety

| **Concern**         | **Required rule**                                                                                                        |
|---------------------|--------------------------------------------------------------------------------------------------------------------------|
| Urgency             | Must be traceable to severity, likely consequence, and time horizon. Never use “critical” merely because a score is low. |
| Risk                | Describe decision/business-health exposure, not certainty of failure.                                                    |
| Opportunity         | Must be feasible within stated founder capacity; add capacity warning or suppress when effort exceeds capacity.          |
| Hypothesis          | Must use language such as “may,” “could,” or “possible contributing cause” unless directly evidenced.                    |
| Contradiction       | When evidence conflicts, expose the contradiction or request follow-up; do not choose a preferred story silently.        |
| Sensitive inference | Do not diagnose mental health, personal character, intent, ethics, or protected attributes.                              |
| Market claims       | Do not claim market demand, competitor behavior, or investor response without stored evidence.                           |

# 21. GalviPath Protocol Library

Create or adapt rules/galvipath_protocols_v0_5.js. GalviPath is a care-sequencing engine, not a generic action list. One primary pathway is selected; secondary considerations may be noted but cannot create multiple competing plans.

| **Pathway** | **Primary eligibility**                                                                        | **30-day focus**                                                  | **Likely GalviClinic route**             |
|-------------|------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|------------------------------------------|
| stabilize   | Critical urgency; capacity, cash, delivery, or continuity risk                                 | Reduce immediate exposure and protect continuity.                 | Founder or Venture Readiness Sprint      |
| diagnose    | Low confidence, missing evidence, or contradiction                                             | Collect the evidence required for a sound decision.               | Diagnostic deep dive / Founder Readiness |
| validate    | Customer, product, problem, or revenue evidence gap                                            | Run focused customer/offer evidence experiments.                  | Product or GTM Readiness Sprint          |
| build       | Clear need but weak product/operating readiness                                                | Create minimum capability required to deliver reliably.           | Product Readiness Sprint                 |
| grow        | Stable product/customer signal with distribution, conversion, retention, or revenue constraint | Strengthen the growth system.                                     | GTM Readiness Sprint                     |
| fundraise   | Evidence/readiness supports capital pursuit but gaps remain                                    | Close narrative, metrics, diligence, and investor-readiness gaps. | Fundraising Readiness Sprint             |
| automate    | Healthy demand but process/system bottleneck                                                   | Remove bottlenecks and establish repeatable workflows.            | Venture/Product Systems Sprint           |
| transform   | Multiple mature capabilities require coordinated operating-model change                        | Sequence broader business-health transformation.                  | Custom GalviClinic treatment plan        |

# 22. Pathway Selection Precedence

11. If critical continuity/capacity exposure is present, select stabilize unless evidence is contradictory or confidence is low.

12. If confidence is below the approved threshold or material contradictions remain, select diagnose.

13. If primary constraint is evidence of customer/problem/product/revenue viability, select validate.

14. If viability is sufficiently clear but delivery/product/operating capability is weak, select build.

15. If delivery and customer signal are stable but acquisition/conversion/retention/revenue system is constrained, select grow.

16. If capital pursuit is an explicit goal and evidence readiness is the binding constraint, select fundraise.

17. If demand exists and repeatability/process/system capacity is the binding constraint, select automate.

18. If multiple mature systems require coordinated redesign and no prior pathway dominates, select transform.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>PRECEDENCE RULE<br />
</strong>The implementation must expose pathway rationale and the decisive evidence. Do not select a pathway solely from the lowest score; use the complete stored clinical file, urgency, confidence, constraints, stated target, and support preference.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 23. GalviPath Result Requirements

| **Field**                | **Required content**                                                                       |
|--------------------------|--------------------------------------------------------------------------------------------|
| primary_pathway          | Exactly one of stabilize, diagnose, validate, build, grow, fundraise, automate, transform. |
| clinical_rationale       | Why this pathway follows from stored findings, interpretation, urgency, and constraints.   |
| 30_day_objective         | One measurable business-health outcome.                                                    |
| 30_day_actions           | 3–5 sequenced actions.                                                                     |
| 60_day_objective/actions | Consolidate evidence/capability and adjust based on 30-day checkpoint.                     |
| 90_day_objective/actions | Advance to next health state; never promise outcome.                                       |
| evidence_to_collect      | Signals that prove progress or change the recommendation.                                  |
| cadence                  | Weekly review plus a 30-day GalviScore checkpoint.                                         |
| support_recommendation   | Self-guided, GalviClinic session, or treatment sprint.                                     |
| escalation_triggers      | Conditions requiring faster intervention or pathway reassessment.                          |
| assumptions              | Known limitations and capacity assumptions.                                                |
| source_refs              | Sight/Shot/finding/evidence references.                                                    |
| rules_version            | Versioned protocol identifier.                                                             |

# 24. GalviPath Result Schema

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
"product": "Chart Your GalviPath",<br />
"session_id": "gc_...",<br />
"status": "ok",<br />
"confidence": 86,<br />
"primary_pathway": "validate",<br />
"pathway_title": "Validate the Evidence Before Scaling",<br />
"clinical_rationale": "...",<br />
"source_refs": ["galvisight:...", "finding:..."],<br />
"plan": {<br />
"day_30": {<br />
"objective": "...",<br />
"actions": [{"sequence":1,"code":"...","action":"...","measure":"..."}],<br />
"evidence_to_collect": ["..."]<br />
},<br />
"day_60": {<br />
"objective": "...",<br />
"actions": [ ],<br />
"evidence_to_collect": ["..."]<br />
},<br />
"day_90": {<br />
"objective": "...",<br />
"actions": [ ],<br />
"evidence_to_collect": ["..."]<br />
}<br />
},<br />
"cadence": {"weekly_review":true,"galviscore_checkpoint_day":30},<br />
"support_recommendation": {"level":"GalviClinic session","clinic_route":"Product Readiness Sprint","rationale":"..."},<br />
"escalation_triggers": ["..."],<br />
"assumptions": ["..."],<br />
"generation_source": "rules",<br />
"rules_version": "galvipath_protocols_v0_5_1",<br />
"created_at": "ISO-8601",<br />
"next_step": "GalviClinic"<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 25. GalviPath API Actions

| **Action**              | **Required behavior**                                                                                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| evaluate_galvipath      | Load stored Sight + source file; evaluate confidence, pathway eligibility, contradictions, capacity, and support preference; return proposed pathway/rationale without storing paid result. |
| get_or_create_galvipath | Verify entitlement/QA override; return stored result first; otherwise select one pathway, assemble 30/60/90 plan, persist transactionally, and return.                                      |
| get_galvipath           | Verify access and return stored active result; never regenerate.                                                                                                                            |

# 26. D1 Additive Migration Contract

Codex must adapt table and column names to repository conventions. The following is a reference contract, not permission to replace existing schema.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>-- Example additive migration only. Use repository naming conventions.<br />
CREATE TABLE IF NOT EXISTS galvisight_interpretations (<br />
interpretation_id TEXT PRIMARY KEY,<br />
session_id TEXT NOT NULL,<br />
result_id TEXT NOT NULL,<br />
component_id TEXT NOT NULL,<br />
interpretation_type TEXT NOT NULL,<br />
statement TEXT NOT NULL,<br />
confidence TEXT,<br />
evidence_refs_json TEXT NOT NULL,<br />
assumptions_json TEXT,<br />
rules_version TEXT NOT NULL,<br />
created_at TEXT NOT NULL,<br />
FOREIGN KEY (session_id) REFERENCES sessions(session_id)<br />
);<br />
<br />
CREATE TABLE IF NOT EXISTS galvipath_recommendations (<br />
recommendation_id TEXT PRIMARY KEY,<br />
session_id TEXT NOT NULL,<br />
result_id TEXT NOT NULL,<br />
pathway_code TEXT NOT NULL,<br />
sequence INTEGER NOT NULL,<br />
horizon_days INTEGER NOT NULL,<br />
action_code TEXT NOT NULL,<br />
action_text TEXT NOT NULL,<br />
measure_text TEXT,<br />
evidence_refs_json TEXT NOT NULL,<br />
rules_version TEXT NOT NULL,<br />
created_at TEXT NOT NULL,<br />
FOREIGN KEY (session_id) REFERENCES sessions(session_id)<br />
);<br />
<br />
CREATE UNIQUE INDEX IF NOT EXISTS ux_sight_active_result<br />
ON product_results(session_id, product, rules_version)<br />
WHERE product = 'GalviSight' AND status = 'active';<br />
<br />
CREATE UNIQUE INDEX IF NOT EXISTS ux_path_active_result<br />
ON product_results(session_id, product, rules_version)<br />
WHERE product = 'GalviPath' AND status = 'active';</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>MIGRATION RULE<br />
</strong>Apply only to QA after schema inspection and backup. Use transactions. Preserve existing records. Provide exact rollback SQL. Never drop, rename, or rebuild an existing table during the Day 4 timebox.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 27. Persistence and Idempotency

| **Requirement**        | **Implementation expectation**                                                                    |
|------------------------|---------------------------------------------------------------------------------------------------|
| Stored-first retrieval | get_or_create checks for active stored product/rules version before evaluation/creation.          |
| Unique result          | One active Sight and one active Path per session/product/rules version.                           |
| Linked records         | Interpretation/recommendation rows link to result_id and session_id.                              |
| Transaction            | Result and child rows commit together or roll back together.                                      |
| Repeat request         | Concurrent/repeated request returns the same stored result rather than a duplicate.               |
| Version change         | A new rules version may create a new versioned result; never silently overwrite the prior record. |
| Failure                | Return structured recoverable error with session_id; do not leave partial active result.          |

# 28. Frontend Integration Contract

| **State**          | **GalviSight behavior**                                                                                         | **GalviPath behavior**                                                                  |
|--------------------|-----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| Locked             | Preserve existing paywall and benefit copy; server determines entitlement.                                      | Preserve/build universal locked screen; server determines entitlement.                  |
| Loading            | Show bounded loading indicator and session ID; prevent duplicate clicks.                                        | Same.                                                                                   |
| Needs follow-up    | Render only server-provided questions and limitations.                                                          | Render pathway clarification only when server requests it.                              |
| Facilitator review | Explain that the result requires clinical review; preserve recovery/contact path.                               | Same.                                                                                   |
| Result             | Render safe schema: meaning, hypotheses, risks, opportunities, urgency, actions, assumptions, Continue to Path. | Render pathway, rationale, 30/60/90, evidence, cadence, escalation, Book Clinic, Print. |
| Error              | Visible recoverable error, retry action, session ID; no blank screen.                                           | Same.                                                                                   |
| Refresh/reopen     | Call get/get_or_create and render stored result.                                                                | Same.                                                                                   |

## Browser security checklist

- No rule codes, thresholds, component libraries, pathway protocols, paid narrative libraries, secrets, SQL, or entitlement authority in HTML/JS.

- All dynamic text uses the existing safe renderer or textContent-style escaping.

- No untrusted HTML injection.

- No customer-facing stack traces or raw backend errors.

- Analytics failures remain non-blocking.

- Session ID remains visible/recoverable but contains no secret.

# PART C — QA, RELEASE, AND OPERATIONS

# 29. Automated Test Layers

| **Layer**       | **Minimum Day 4 tests**                                                                                                               |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------|
| Unit            | Component eligibility/suppression, confidence, hypothesis labels, urgency, opportunity capacity, pathway precedence, action ordering. |
| Contract        | Every action returns the common response envelope and required product schema.                                                        |
| Integration     | Day 3 stored result → Sight stored result → Path stored result from same session.                                                     |
| Persistence     | Stored-first retrieval, uniqueness, concurrent duplicate protection, transaction rollback.                                            |
| Entitlement     | Locked without verified entitlement; QA override isolated to QA.                                                                      |
| Security        | No secrets/rules in frontend bundle; safe renderer; invalid payload; CORS.                                                            |
| Regression      | Day 1–3 actions, routes, existing UI, analytics, session continuity.                                                                  |
| Golden fixtures | Four clinically distinct cases with expected families/pathways and no unsupported language.                                           |

# 30. Day 4 QA Matrix

| **Scenario**        | **Procedure**                              | **Pass criteria**                                                                   |
|---------------------|--------------------------------------------|-------------------------------------------------------------------------------------|
| Meaning consistency | Generate Sight for each fixture.           | Meaning matches actual Day 3 findings and adds implications rather than repetition. |
| Hypothesis safety   | Inspect every root-cause statement.        | Explicitly labeled hypothesis unless directly supported.                            |
| Risk traceability   | Inspect risk evidence refs.                | Every risk links to stored findings/evidence.                                       |
| Opportunity realism | Use constrained-capacity fixture.          | High-effort opportunity is warned or suppressed.                                    |
| Urgency             | Compare severity/time horizon fixtures.    | Urgency rationale matches evidence; no automatic “critical” from low score alone.   |
| Low confidence      | Use contradiction/missing-context fixture. | Targeted follow-up or facilitator review; no unsupported final result.              |
| Pathway selection   | Generate Path for all fixtures.            | Exactly one primary pathway with decisive evidence and rationale.                   |
| 30/60/90 sequence   | Inspect objectives/actions.                | Ordered, measurable, capacity-aware, non-generic.                                   |
| Stored results      | Refresh/reopen twice.                      | Identical/semantically identical result; no duplicate rows.                         |
| Entitlement         | Call unpaid and paid/QA sessions.          | Locked unless server-verified entitlement or QA-only override.                      |
| Journey             | Shot → Sight → Path on desktop/mobile.     | Correct routing and same session_id.                                                |
| Regression          | Run Day 1–3 suite.                         | No new failures.                                                                    |
| Rollback            | Execute dry-run/document review.           | Known-good files and rollback SQL are complete.                                     |

# 31. Golden Fixture Specifications

| **Fixture**            | **Clinical pattern**                                                                              | **Expected Sight behavior**                                                                | **Expected primary pathway**                           |
|------------------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------|
| GC-D4-01 Stabilize     | Severe founder capacity/continuity strain plus weak cash/delivery signals; sufficient confidence. | High urgency, continuity risk, capacity-aware actions, no personal diagnosis.              | stabilize                                              |
| GC-D4-02 Validate      | Customer/product/revenue evidence gaps; manageable capacity; medium/high confidence.              | Meaning centers on evidence uncertainty and opportunity to run focused experiments.        | validate                                               |
| GC-D4-03 Diagnose      | Contradictory or incomplete evidence; low confidence.                                             | needs_followup/facilitator_review; no definitive root cause or paid plan before threshold. | diagnose after approved follow-up                      |
| GC-D4-04 Grow/Automate | Stable customer/product evidence; distribution/revenue or process bottleneck.                     | Meaning distinguishes demand/growth constraint from operating repeatability.               | grow or automate according to decisive stored evidence |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>GOLDEN FIXTURE RULE<br />
</strong>Fixtures must be sanitized, deterministic, committed outside production data, and include expected component IDs/pathway rather than exact long-form prose where prose may change under an approved library version.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 32. No-Invention Test

19. Collect every factual claim in the rendered Sight and Path output.

20. Map it to a stored raw answer, score, Day 3 finding/evidence reference, approved follow-up, or approved governed component.

21. Classify unmapped statements as unsupported.

22. Fail the test if any unsupported factual or causal claim remains.

23. Permit bounded connective language only when it does not add a new fact and remains labeled as interpretation/hypothesis.

# 33. Coherence and Non-Repetition Test

| **Comparison** | **Pass question**                                                                                          |
|----------------|------------------------------------------------------------------------------------------------------------|
| Score vs Shot  | Does Shot identify findings rather than restate scores?                                                    |
| Shot vs Sight  | Does Sight explain meaning, implications, urgency, and opportunity rather than repeat findings?            |
| Sight vs Path  | Does Path sequence care rather than repeat interpretation?                                                 |
| Path vs Clinic | Does Path stop at recommended sequence and support level rather than create the full Day 5 treatment plan? |
| Whole journey  | Can a founder explain the distinct value of each paid step?                                                |

# 34. Entitlement and QA Override Tests

| **Test**                                 | **Expected**                                                             |
|------------------------------------------|--------------------------------------------------------------------------|
| No entitlement                           | locked; no paid result content returned.                                 |
| Client query parameter only              | locked.                                                                  |
| localStorage/sessionStorage flag only    | locked.                                                                  |
| Verified QA entitlement                  | ok in QA.                                                                |
| QA override in production environment    | rejected/ignored.                                                        |
| Stored paid result after adapter failure | result remains retrievable when authoritative entitlement/result exists. |
| Repeated paid request                    | same stored result, no duplicate purchase prompt or result row.          |

# 35. Failure and Recovery Tests

| **Failure**               | **Expected customer/system behavior**                                      |
|---------------------------|----------------------------------------------------------------------------|
| Missing session           | Structured invalid_request/not_found with recovery CTA; no blank screen.   |
| Missing Day 3 result      | Structured prerequisite_missing; route back to Shot or facilitator review. |
| D1 read failure           | Recoverable error, log event/error, preserve session ID.                   |
| D1 write failure          | Transaction rollback; no partial active result.                            |
| Invalid follow-up         | Validation error; no persistence.                                          |
| CORS failure              | Detected in automated/manual QA; no production promotion.                  |
| Analytics failure         | Result continues; event logs best-effort.                                  |
| Print/booking unavailable | Visible fallback action/contact; result remains accessible.                |

# 36. Regression Matrix

| **Existing capability**      | **Required regression evidence**                                 |
|------------------------------|------------------------------------------------------------------|
| Health/session/event actions | Existing tests pass.                                             |
| GalviTriage                  | Submission, validation, persistence, routing pass.               |
| GalviVitals                  | Stored-first deterministic result and render pass.               |
| GalviScore                   | Authoritative score contract and render pass.                    |
| GalviShot                    | Entitlement, generation/retrieval, evidence trace, refresh pass. |
| Legacy Worker actions        | No action removed or signature changed unexpectedly.             |
| CORS                         | QA frontend origin succeeds.                                     |
| GA4/Clarity                  | No blocking errors introduced.                                   |
| Mobile/desktop               | Core path renders and routes.                                    |
| Production                   | No production file, binding, secret, or deployment changed.      |

# 37. Security and Privacy Review

| **Boundary** | **Required confirmation**                                                                            |
|--------------|------------------------------------------------------------------------------------------------------|
| Browser      | Presentation only; no proprietary logic, paid libraries, secrets, SQL, or authoritative entitlement. |
| Worker       | Validates action, session_id, payload, environment, entitlement, and allowed transitions.            |
| D1           | Parameterized queries, additive migration, transactionality, uniqueness, no excessive PII in logs.   |
| Errors       | Structured customer-safe errors; internal detail only in protected logs.                             |
| Fixtures     | Sanitized; no real founder PII or proprietary customer narrative.                                    |
| Analytics    | No paid report content or sensitive raw evidence sent as event parameters.                           |
| Print        | Customer-facing result only; no internal evidence IDs/rule internals unless intentionally displayed. |
| Future AI    | generation_source and schemas remain compatible, but no OpenAI call exists in Day 4.                 |

# 38. Manual QA Script — One Pass

24. Open the QA app in a clean/incognito browser and confirm the QA Worker/environment.

25. Load GC-D4-01; obtain/open GalviShot; continue to GalviSight.

26. Confirm locked/override behavior, then render Sight and inspect meaning, hypotheses, risks, opportunities, urgency, actions, assumptions, and session ID.

27. Refresh twice and reopen; confirm stored identical result and no duplicates.

28. Continue to Chart Your GalviPath; inspect pathway, rationale, 30/60/90 sequence, evidence, cadence, escalation, Print, and Book GalviClinic.

29. Refresh/reopen and confirm stored result/no duplicates.

30. Repeat targeted checks for GC-D4-02, GC-D4-03, and GC-D4-04; do not repeat full UI checks unless a defect is found.

31. Inspect mobile width for one high-content fixture and one low-confidence state.

32. Inspect browser sources/network for exposed rules/secrets and entitlement bypass.

33. Run one Triage → Vitals → Score → Shot regression path.

34. Review Codex test report, migration, rollback, changed files, and PR diff.

35. Record GO / NO-GO in the approval record.

# 39. Stop/Go Gate

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>DAY 4 GO<br />
</strong>GO only when the same stored clinical file produces a coherent chain: GalviScore quantifies health, GalviShot identifies findings, GalviSight explains meaning, and GalviPath sequences care. Meaning, risks, opportunities, urgency, actions, and pathway must be evidence-linked, stored once, safely rendered, and regression-safe.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>DAY 4 NO-GO<br />
</strong>BLOCK when outputs are repetitive, causal claims are unsupported, pathway selection is generic or untraceable, refresh regenerates/duplicates, client state bypasses entitlement, proprietary logic appears in the browser, Day 1–3 regressions exist, or rollback is incomplete.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 40. Rollback Plan

| **Layer**  | **Rollback artifact/action**                                                                                                |
|------------|-----------------------------------------------------------------------------------------------------------------------------|
| Git        | Pre-Day-4 tag/branch/ZIP; revert Day 4 commit(s) only.                                                                      |
| Worker     | Restore exact pre-Day-4 QA Worker source/deployment.                                                                        |
| D1         | Run documented additive rollback (drop only Day 4-created indexes/tables if safe and empty; otherwise retain inert schema). |
| Frontend   | Restore pre-Day-4 Sight/Path adapters and routes.                                                                           |
| Rules      | Restore prior module state; no Day 2/3 rule changes should exist.                                                           |
| Data       | Do not delete legitimate preexisting records. Mark failed Day 4 test results inactive only through approved QA cleanup.     |
| Production | No rollback should be necessary because Day 4 does not touch production.                                                    |

# 41. Pull Request Requirements

| **PR element**       | **Required content**                                                     |
|----------------------|--------------------------------------------------------------------------|
| Title                | GalviCare 0.5 Day 4 — deterministic GalviSight and GalviPath (QA only)   |
| Scope                | Exact Day 4 features; explicitly state exclusions.                       |
| Changed files        | Every file and purpose.                                                  |
| Schema               | Migration and rollback commands.                                         |
| Tests                | Commands, counts, pass/fail, and golden fixtures.                        |
| Security             | Browser/server boundary and entitlement confirmation.                    |
| Screenshots/evidence | Sight result, Path result, low-confidence state, mobile, stored refresh. |
| Risks/assumptions    | Open decisions and known limitations.                                    |
| Deployment           | State: no production deployment; human approval required.                |
| Recommendation       | Codex GO/BLOCK with reasons; not Product Owner approval.                 |

# 42. Closeout and Day 5 Handoff

| **Handoff asset**        | **Required Day 5 input**                                                                                                         |
|--------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Stable Sight result      | Meaning, hypothesis codes, risk codes, opportunity codes, urgency, actions, assumptions, evidence refs.                          |
| Stable Path result       | Primary pathway, rationale, 30/60/90 plan, support recommendation, escalation, rules version.                                    |
| Entitlement observations | Current verified path and any remaining Day 5 hardening gap.                                                                     |
| Clinic handoff           | Book GalviClinic CTA, route, selected Clinic route, and session continuity.                                                      |
| QA evidence              | Automated results, manual approval record, screenshots, D1 row checks.                                                           |
| Rollback                 | Tag/commit, Worker copy, migration rollback, known-good state.                                                                   |
| Deferred items           | Anything explicitly outside Day 4: final Stripe webhook hardening, Clinic treatment logic, HubSpot recovery, production cutover. |

# APPENDIX A — Implementation File Pattern

| **Concern**            | **Preferred pattern (adapt to repo)**                |
|------------------------|------------------------------------------------------|
| Interpretation library | src/rules/galvisight_interpretations_v0_5.js         |
| Sight service          | src/services/galvisight.js                           |
| Path protocols         | src/rules/galvipath_protocols_v0_5.js                |
| Path service           | src/services/galvipath.js                            |
| Router                 | Existing Worker router file only                     |
| Schemas/validation     | Existing schema/validator module                     |
| D1 migration           | migrations/\<next\>\_day4_sight_path.sql             |
| Tests                  | Existing unit/integration/contract fixture structure |
| Frontend               | Existing index/app module adapters; no rule library  |

# APPENDIX B — Reference Interpretation Component

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
id: "INT_REVENUE_SIGNAL_WEAK_V1",<br />
version: "galvisight_rules_v0_5_1",<br />
eligibleFindingCodes: ["REVENUE_SIGNAL_WEAK"],<br />
requires: ["finding.evidence_refs", "score.Revenue"],<br />
meaning: "The current revenue evidence may be insufficient to support the next scale decision.",<br />
hypotheses: [<br />
{<br />
code: "HYP_MONETIZATION_EVIDENCE_GAP",<br />
text: "A possible contributing cause is that the offer, pricing, or conversion evidence has not yet been validated sufficiently."<br />
}<br />
],<br />
risks: ["RISK_PREMATURE_SCALE"],<br />
opportunities: ["OPP_MONETIZATION_EVIDENCE_SPRINT"],<br />
urgencyEffect: { level: "medium", reasonCode: "REVENUE_DECISION_DEPENDENCY" },<br />
actions: ["ACTION_DEFINE_REVENUE_EVIDENCE", "ACTION_RUN_PRICING_TEST"],<br />
assumptions: ["This interpretation does not predict future revenue."],<br />
suppressWhen: ["CONTRADICTS_VERIFIED_REVENUE_TRACTION"]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# APPENDIX C — Reference Pathway Protocol

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>{<br />
pathway: "validate",<br />
version: "galvipath_protocols_v0_5_1",<br />
eligibility: {<br />
anyFindingFamilies: ["customer_evidence", "product_evidence", "revenue_evidence"],<br />
excludedUrgency: ["critical_continuity"],<br />
minimumConfidence: 60<br />
},<br />
precedence: 30,<br />
rationaleTemplate: "The primary constraint is evidence quality rather than execution scale, so the next care sequence should reduce uncertainty before expansion.",<br />
day30: {<br />
objectiveCode: "OBJ_VALIDATE_PRIMARY_ASSUMPTION",<br />
actionCodes: ["ACTION_SELECT_ASSUMPTION", "ACTION_DEFINE_TEST", "ACTION_RUN_TEST", "ACTION_REVIEW_EVIDENCE"]<br />
},<br />
day60: {<br />
objectiveCode: "OBJ_REFINE_OFFER_FROM_EVIDENCE",<br />
actionCodes: ["ACTION_UPDATE_OFFER", "ACTION_REPEAT_TEST"]<br />
},<br />
day90: {<br />
objectiveCode: "OBJ_DECIDE_BUILD_OR_GROW",<br />
actionCodes: ["ACTION_REASSESS_GALVISCORE", "ACTION_SELECT_NEXT_PATH"]<br />
},<br />
clinicRoute: "Product or GTM Readiness Sprint"<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# APPENDIX D — Backend Pseudocode

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>async function getOrCreateGalviSight(env, request) {<br />
validateRequest(request);<br />
await requireServerEntitlementOrQaOverride(env, request.session_id, "GalviSight");<br />
<br />
const stored = await findActiveResult(env.DB, request.session_id, "GalviSight", SIGHT_RULES_VERSION);<br />
if (stored) return success(stored, "Chart Your GalviPath");<br />
<br />
const clinicalFile = await loadAuthoritativeDay2Day3Record(env.DB, request.session_id);<br />
const evaluation = evaluateSightEligibility(clinicalFile);<br />
if (evaluation.status !== "ok") return success(evaluation, "GalviSight");<br />
<br />
const result = assembleGovernedSight(clinicalFile, evaluation);<br />
assertEvidenceTrace(result);<br />
assertNoUnsupportedClaims(result);<br />
<br />
return await env.DB.transaction(async tx =&gt; {<br />
const persisted = await insertUniqueProductResult(tx, result);<br />
await insertInterpretationRows(tx, persisted.result_id, result);<br />
await logJourneyEvent(tx, request.session_id, "galvisight_generated");<br />
return success(persisted, "Chart Your GalviPath");<br />
});<br />
}<br />
<br />
async function getOrCreateGalviPath(env, request) {<br />
validateRequest(request);<br />
await requireServerEntitlementOrQaOverride(env, request.session_id, "GalviPath");<br />
const stored = await findActiveResult(env.DB, request.session_id, "GalviPath", PATH_RULES_VERSION);<br />
if (stored) return success(stored, "GalviClinic");<br />
<br />
const clinicalFile = await loadAuthoritativeClinicalFileThroughSight(env.DB, request.session_id);<br />
const pathway = selectOneGovernedPathway(clinicalFile);<br />
const result = assembleGovernedThirtySixtyNinety(pathway, clinicalFile);<br />
assertPathwayTrace(result);<br />
assertSequencedMeasurableActions(result);<br />
<br />
return persistPathTransactionally(env.DB, result);<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# APPENDIX E — Test Case Inventory

| **ID**   | **Test**                          | **Expected**                                                    |
|----------|-----------------------------------|-----------------------------------------------------------------|
| D4-U-001 | Sight component requires evidence | Component suppressed when required evidence missing.            |
| D4-U-002 | Hypothesis label                  | Every hypothesis retains bounded language/code.                 |
| D4-U-003 | Contradiction                     | Conflicting evidence triggers suppression/follow-up.            |
| D4-U-004 | Opportunity capacity              | Excess-effort opportunity warned/suppressed.                    |
| D4-U-005 | Urgency                           | Severity + consequence + horizon produce expected band.         |
| D4-U-006 | Path precedence                   | Stabilize/diagnose override lower-priority paths when eligible. |
| D4-U-007 | Exactly one pathway               | Selection returns one primary pathway.                          |
| D4-U-008 | 30/60/90 ordering                 | Sequences and horizons are valid.                               |
| D4-I-001 | Shot→Sight                        | Stored Shot creates traceable Sight.                            |
| D4-I-002 | Sight→Path                        | Stored Sight creates traceable Path.                            |
| D4-I-003 | Repeat retrieval                  | Second request returns stored result.                           |
| D4-I-004 | Concurrent request                | Unique constraint prevents duplicate.                           |
| D4-I-005 | Transaction failure               | No partial active result.                                       |
| D4-E-001 | Unpaid                            | locked.                                                         |
| D4-E-002 | Client bypass                     | locked.                                                         |
| D4-E-003 | QA override isolation             | works QA, rejected production.                                  |
| D4-S-001 | Frontend scan                     | No rule/copy/secret leakage.                                    |
| D4-R-001 | Day 1–3 regression                | All existing tests pass.                                        |
| D4-G-001 | Stabilize fixture                 | Expected safe high-urgency interpretation/path.                 |
| D4-G-002 | Validate fixture                  | Expected evidence-focused interpretation/path.                  |
| D4-G-003 | Diagnose fixture                  | No final unsupported output.                                    |
| D4-G-004 | Grow/automate fixture             | Decisive evidence determines expected path.                     |

# APPENDIX F — QA Evidence Record

| **Evidence item**            | **Record**                                                                       |
|------------------------------|----------------------------------------------------------------------------------|
| QA branch/worktree           | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Day 3 commit                 | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Day 4 commit(s)              | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Worker QA deployment/version | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| D1 migration applied         | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Automated test command       | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Automated result             | \_\_\_\_\_\_ passed / \_\_\_\_\_\_ failed                                        |
| GC-D4-01 result/path         | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| GC-D4-02 result/path         | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| GC-D4-03 status              | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| GC-D4-04 result/path         | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Duplicate row query result   | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Frontend security scan       | PASS / BLOCK                                                                     |
| Mobile QA                    | PASS / BLOCK                                                                     |
| Day 1–3 regression           | PASS / BLOCK                                                                     |
| Rollback reviewed            | PASS / BLOCK                                                                     |
| Product Owner decision       | GO / NO-GO                                                                       |
| Decision date/time           | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |

# APPENDIX G — Pull Request Template

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>## GalviCare 0.5 Day 4 — Deterministic GalviSight + GalviPath (QA only)<br />
<br />
### Scope<br />
- [ ] GalviSight governed interpretation library/service<br />
- [ ] GalviSight API actions and persistence<br />
- [ ] GalviPath governed protocol/30-60-90 service<br />
- [ ] GalviPath API actions and persistence<br />
- [ ] Existing frontend adapters and routing<br />
- [ ] Automated tests and fixtures<br />
<br />
### Explicit exclusions<br />
- No production deployment<br />
- No main merge by Codex<br />
- No OpenAI, Make, Airtable customer-path dependency<br />
- No Day 2/3 rule changes<br />
- No final Stripe/Clinic/HubSpot Day 5 hardening<br />
<br />
### Changed files<br />
&lt;list each file and purpose&gt;<br />
<br />
### Migration<br />
&lt;exact QA apply command&gt;<br />
<br />
### Rollback<br />
&lt;exact code and D1 rollback commands&gt;<br />
<br />
### Tests<br />
&lt;commands and exact results&gt;<br />
<br />
### Golden fixtures<br />
&lt;table of session, expected, actual, evidence trace&gt;<br />
<br />
### Security<br />
- [ ] Browser presentation only<br />
- [ ] Server-side entitlement<br />
- [ ] QA override isolated<br />
- [ ] No secrets/rules/paid libraries exposed<br />
- [ ] Safe rendering confirmed<br />
<br />
### Risks / assumptions / Product Owner decisions<br />
&lt;list&gt;<br />
<br />
### Codex recommendation<br />
GO / BLOCK — &lt;reasons&gt;<br />
<br />
Human Product Owner approval is required before merge or production promotion.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# APPENDIX H — Final Day 4 Acceptance Matrix

| **Complete** | **Acceptance item**                                                   |
|--------------|-----------------------------------------------------------------------|
| ☐            | One discovery report completed; no duplicate discovery loop.          |
| ☐            | One authorized implementation pass completed.                         |
| ☐            | Sight meaning library works from stored Day 3 findings.               |
| ☐            | Hypotheses, risks, opportunities, urgency, and actions are traceable. |
| ☐            | Low-confidence behavior withholds unsupported output.                 |
| ☐            | One governed primary pathway selected.                                |
| ☐            | 30/60/90 plan is ordered, measurable, and capacity-aware.             |
| ☐            | Sight and Path results store once and refresh from storage.           |
| ☐            | Verified entitlement/QA override boundary holds.                      |
| ☐            | Browser contains presentation only.                                   |
| ☐            | Desktop/mobile journey routes Shot → Sight → Path.                    |
| ☐            | Print and Book GalviClinic handoffs work or show safe fallback.       |
| ☐            | Day 1–3 regression suite passes.                                      |
| ☐            | Migration and rollback are documented and reviewed.                   |
| ☐            | PR is reviewable and unmerged.                                        |
| ☐            | Human Product Owner recorded GO / NO-GO.                              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>FINAL ACCEPTANCE STATEMENT<br />
</strong>Day 4 is complete only when GalviCare turns quantified health and evidence-based findings into a safe interpretation and a governed sequence of care—without OpenAI, without browser intelligence, without duplicate records, without weakened payment controls, and without repeating the Day 2/3 build cycle.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>
