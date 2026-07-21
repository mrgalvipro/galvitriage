# GalviCare 0.5 Day 3 Builder Guide — Codex-Readable Markdown

> Authoritative source: `GalviCare_0_5_Day_3_Builder_Guide_v1_0_CODEX_IMPLEMENTATION_ENGINEER_EDITION.docx`
>
> This Markdown copy is provided so Codex can read the Day 3 specification directly from the repository. If formatting differs from the DOCX, the substantive security, evidence, entitlement, preservation, QA, and human-approval requirements remain controlling.

GALVICARE™ 0.5
DAY 3 BUILDER GUIDE
Codex Implementation Engineer Edition
GalviScore → GalviShot → GalviSight
One Concentrated QA Build Session • Human-Governed Production Approval
No Make • No OpenAI • Single Cloudflare Worker + D1 • Browser Presentation Only
Prepared for GalviPro / GalviStudio | July 2026 | Version 1.0 Secure + Deterministic Findings

| Purpose of this edition<br>Convert the approved Day 2 clinical record into a governed, paid GalviShot experience that produces 3–5 evidence-grounded findings, stores them once, retrieves them without regeneration, and preserves the existing paywall and downstream GalviSight route. |
| --- |



| NON-NEGOTIABLE HUMAN AUTHORITY<br>CODEX MAY IMPLEMENT AND TEST IN QA. CODEX MAY NOT INVENT CLINICAL CLAIMS, CHANGE PRODUCT MEANING, WEAKEN PAYMENT CONTROL, EXPOSE RULES IN THE BROWSER, MERGE TO MAIN, OR DECLARE THE RELEASE ACCEPTED. ONLY THE HUMAN PRODUCT OWNER MAY APPROVE FINDING LOGIC, COMMERCIAL CREDIBILITY, AND PRODUCTION PROMOTION. |
| --- |



# Document Map

| Part | Sections | Primary outcome |
| --- | --- | --- |
| A — Codex Runbook | 0–10 | Safely supervise repository discovery, implementation, review, and approval. |
| B — Day 3 Engineering Contract | 11–27 | Implement the deterministic GalviShot findings engine, D1 persistence, API actions, UI integration, and tests. |
| C — QA, Release, and Operations | 28–39 | Prove evidence grounding, payment protection, non-duplication, regression safety, rollback, and PR readiness. |
| Appendices | A–F | Copy/paste prompts, schemas, code skeletons, fixtures, QA evidence forms, and acceptance matrices. |


| Release principle<br>Day 3 succeeds only when the result feels commercially useful without unsupported invention. The system must be willing to withhold, ask follow-up questions, or label assumptions rather than manufacture confidence. |
| --- |



# PART A — CODEX SESSION RUNBOOK
# 0. How to Use This Guide
This document is both the Product Owner’s supervision runbook and Codex’s authoritative implementation contract. The stricter requirement controls whenever two instructions appear to conflict.

| Layer | Primary user | Purpose |
| --- | --- | --- |
| Codex Session Runbook | Human Product Owner | Prepare the QA branch, launch discovery, approve the plan, supervise checkpoints, and prevent production changes. |
| Day 3 Engineering Specification | Codex implementation engineer | Build GalviShot rules, confidence/follow-up logic, actions, persistence, frontend integration, and automated tests. |
| Human Verification and Approval Gates | Human Product Owner | Judge finding credibility, evidence traceability, commercial value, paywall behavior, regression risk, and release readiness. |


| Operating model<br>Builder Guide → discovery-only report → human authorization → QA implementation → automated tests → Codex self-review → human live QA → GO / NO-GO. Production promotion is a separate future action. |
| --- |


# 1. Day 3 Mission and Release Gate

| Area | Must be true before Day 3 can be accepted |
| --- | --- |
| Finding library | Versioned, reusable finding components exist for the minimum MVP families; each component has explicit eligibility, evidence, risk, action, assumption, and suppression rules. |
| Evidence grounding | Every displayed finding cites actual Day 2 scores, normalized answers, or approved follow-up answers. |
| Confidence | The system computes GalviShot confidence and follows the approved low/medium/high behavior without inventing missing evidence. |
| Persistence | A generated GalviShot is stored once per session/product/rules version and returned identically on refresh. |
| Payment | Locked requests remain locked unless entitlement is verified or an environment-scoped QA override is active. |
| Frontend | Existing paywall and result layout are preserved; browser only renders the Worker response. |
| Regression | GalviTriage, GalviVitals, GalviScore, legacy routes, CORS, analytics, and current production behavior remain intact. |
| Golden cases | Revenue/customer weakness, founder-capacity strain, and broad multi-dimension weakness each produce credible evidence-based results. |


# 2. Codex Responsibilities and Prohibitions

| Codex responsibility | Required output |
| --- | --- |
| Repository discovery | Map Worker router, Day 2 rules, D1 schema, payment/entitlement code, current GalviShot UI, tests, and legacy integrations before editing. |
| Implementation | Add governed finding/risk/action libraries, confidence/follow-up evaluation, API actions, D1 migration, frontend adapters, and tests. |
| Preservation | Keep one Worker, QA isolation, current session_id continuity, existing paywall semantics, all legacy routes, and rollback artifacts. |
| Verification | Run unit, integration, contract, persistence, entitlement, regression, and fixture tests; provide exact evidence. |
| Documentation | Provide architecture notes, changed-file inventory, migration/rollback commands, assumptions, unresolved decisions, and manual QA steps. |
| PR preparation | Prepare one reviewable QA pull request. Do not merge, deploy production, alter secrets, or approve release. |

## Codex is explicitly forbidden to:
- Invent new facts, causal claims, market conditions, customer evidence, revenue performance, or founder biography.
- Change Day 2’s authoritative question contract, dimension mapping, score formula, or rules version without written approval.
- Place finding triggers, weights, confidence calculations, ranking rules, or paid result content in index.html or browser-delivered JavaScript.
- Grant entitlement based only on a URL parameter, success page, browser storage flag, or unverified client assertion.
- Create a second Worker, bypass the existing action router, or call Airtable/OpenAI/Make from the customer path.
- Regenerate a stored GalviShot on refresh or silently overwrite a prior result under the same rules version.
- Remove or refactor unrelated legacy behavior merely for cleanliness.
- Use production D1, production secrets, live Stripe mode, main branch, or production deployment.
- Silently resolve conflicting product language or clinical logic. Stop and request a Product Owner decision.
# 3. Prerequisites Carried Forward from Day 2

| Prerequisite | Required evidence |
| --- | --- |
| QA branch | qa-revamped-galvicare-0-5 is current and contains the approved Day 2 merge. |
| Day 2 contract | The exact 20-question contract and galviengine_score_v0_5_1 are present. |
| Day 2 APIs | submit_triage, get_triage, triage_completeness, get_or_create_vitals, and get_or_create_score pass. |
| D1 persistence | Known-good session returns identical Vitals/Score without duplicate rows. |
| Current GalviShot UI | Paywall, result section, CTA, and session handling are committed in the QA branch. |
| Entitlement path | Existing Stripe/entitlement behavior is identified, even if Day 5 will complete final webhook hardening. |
| Golden fixtures | At least three sanitized Day 2 records exist for Day 3 finding tests. |
| Rollback | Pre-Day-3 branch/tag/ZIP and Worker source copy are available. |


| Precondition gate<br>STOP before implementation if Day 2 is not accepted, the GalviScore response contract is unstable, or the repository does not contain the deployed Worker source. |
| --- |



# 4. Repository Readiness Checklist

| Required item | Ready? | Evidence / path |
| --- | --- | --- |
| Correct QA branch checked out | ☐ | Branch: qa-revamped-galvicare-0-5 |
| Day 2 merge commit identified | ☐ | Commit SHA: __________________ |
| Worker source and router identified | ☐ | Path: ________________________ |
| Day 2 rules modules identified | ☐ | Paths: _______________________ |
| D1 migrations identified | ☐ | Path/command: _________________ |
| Current GalviShot UI identified | ☐ | Path/lines: ___________________ |
| Current payment gate identified | ☐ | Backend/frontend path: _________ |
| Three golden fixtures available | ☐ | Paths/session IDs: _____________ |
| Tests and commands identified | ☐ | Command: ______________________ |
| Production secrets excluded | ☐ | Confirmed by: _________________ |
| Rollback package saved | ☐ | Folder/tag: ____________________ |

# 5. Codex Discovery Prompt — Copy and Paste

| You are the implementation engineer for GalviCare 0.5 Day 3.<br><br>MODE: DISCOVERY ONLY. DO NOT EDIT FILES, RUN DESTRUCTIVE COMMANDS, DEPLOY, APPLY MIGRATIONS, OR CHANGE DATA.<br><br>Read CODEX_DAY3_IMPLEMENTATION_BRIEF.md and the Day 3 Builder Guide. Inspect the approved QA branch and return:<br>1. Repository map and exact files relevant to Worker routing, Day 2 scoring, D1, payment entitlement, GalviShot UI, tests, and deployment.<br>2. Exact current GalviShot flow, including locked state, payment return, generation call, result render, refresh behavior, and Continue to GalviSight.<br>3. Day 2 result schema and fields available for evidence grounding.<br>4. Current D1 tables/constraints and the safest Day 3 migration plan.<br>5. Current entitlement authority and any temporary gaps that Day 3 must preserve without weakening.<br>6. Existing tests and missing tests.<br>7. Legacy routes/integrations/CORS behavior that must remain untouched.<br>8. Differences between repository reality and this guide.<br>9. Security, privacy, clinical-credibility, duplication, and production risks.<br>10. Proposed changed files, sequence, checkpoints, test plan, manual QA plan, migration, and rollback.<br><br>Non-negotiable constraints:<br>- One existing Worker only; QA branch/worktree only.<br>- No Make, no OpenAI, no browser scoring or finding rules.<br>- Never invent facts; every finding must trace to stored evidence.<br>- Preserve current paywall semantics and all legacy routes.<br>- Return stored GalviShot before attempting generation.<br>- Do not merge or deploy.<br><br>Stop after the discovery report and wait for Product Owner approval. |
| --- |


# 6. Human Discovery Approval Gate

| Approval item | Decision |
| --- | --- |
| Repository and branch are correct | APPROVE / BLOCK |
| Day 2 source record is authoritative | APPROVE / BLOCK |
| Current GalviShot UI and entitlement path are correctly mapped | APPROVE / BLOCK |
| D1 migration preserves existing data and uniqueness | APPROVE / BLOCK |
| Finding families and copy remain human-governed | APPROVE / REVISE |
| Proposed tests cover credibility, security, payment, and regression | APPROVE / REVISE |
| Implementation authorized | GO / NO-GO |


| Human review required<br>Do not approve implementation when Codex cannot identify the exact source of the deployed Worker, proposes browser-side rules, or treats Stripe query parameters as permanent entitlement. |
| --- |


# 7. Concentrated Build Session Checkpoints

| Checkpoint | Codex must complete | Human action |
| --- | --- | --- |
| 0 — Discovery | Repository report, risks, plan, files, decisions. | Review and explicitly authorize. |
| 1 — Contracts | Result schema, finding library schema, evidence contract, confidence bands, suppression rules, tests. | Approve product meaning and permitted language. |
| 2 — D1 + backend | Migration, rule libraries, evaluation, storage/retrieval, entitlement gate, backend tests. | Review evidence and golden-case outputs. |
| 3 — Frontend QA | Locked/eligible/follow-up/result/error states, stored refresh, mobile behavior. | Confirm browser contains no proprietary rules or paid content. |
| 4 — Self-review | Full QA matrix, security scan, legacy regression, rollback. | Run manual QA personally. |
| 5 — PR recommendation | Reviewable diff and recommended GO/BLOCK with reasons. | Product Owner independently decides. |


# 8. Codex Build Prompt — Copy and Paste

| Proceed with the approved GalviCare 0.5 Day 3 implementation on qa-revamped-galvicare-0-5.<br><br>Use the Day 3 Builder Guide as the authoritative engineering specification. Work in checkpoints and stop for any product-language, score-authority, entitlement, or evidence ambiguity.<br><br>Required scope:<br>- Add versioned governed libraries for findings, risks, actions, follow-up questions, templates, and suppression rules.<br>- Add D1 schema needed to store evidence-linked findings and follow-up answers without combining raw evidence and polished output into one record.<br>- Implement evaluate_galvishot, save_galvishot_followup, get_or_create_galvishot, and get_galvishot in the existing Worker router.<br>- Load authoritative Day 2 Triage/Vitals/Score data; compute confidence; return follow-up questions or eligibility.<br>- Rank eligible findings deterministically; select 3–5 diverse findings; compose a governed result; store once; return stored results unchanged.<br>- Enforce verified entitlement or QA-only override. Never trust browser state or query parameters as entitlement.<br>- Preserve the existing GalviShot paywall/result layout and Continue to GalviSight route.<br>- Keep all rules and paid content server-side.<br>- Add automated tests for golden cases, low confidence, no invention, evidence traceability, contradiction, diversity, suppression, entitlement, QA override isolation, duplicate refresh, invalid payload, storage failure, and legacy regression.<br><br>Checkpoint protocol:<br>A. State planned files before editing.<br>B. After contracts/migration/backend, run tests and report exact results.<br>C. After frontend integration, run all tests and report exact results.<br>D. Self-review every Day 3 QA item and security boundary.<br><br>Final output:<br>1. Implementation summary.<br>2. Changed files and why.<br>3. Commands/tests and results.<br>4. Migration and rollback instructions.<br>5. Golden-case outputs and evidence trace.<br>6. Assumptions/unresolved decisions.<br>7. Security confirmation.<br>8. Manual QA steps.<br>9. Pull request description.<br><br>Do not merge, deploy production, change live data, rotate secrets, or declare Product Owner approval. |
| --- |

# 9. Human Product Owner Verification — Mandatory
- Complete or load the three approved golden cases and judge whether each result is useful, grounded, and appropriately cautious.
- For every finding, identify the source score/answer/follow-up and confirm the narrative does not extend beyond that evidence.
- Confirm low-confidence sessions receive only relevant follow-up questions and no final paid report before the gate is satisfied.
- Confirm unpaid access remains locked and QA override works only in QA.
- Refresh and reopen the same session; confirm byte-equivalent or semantically identical stored output and no duplicate result/finding rows.
- Review the browser bundle for triggers, weights, finding copy, action libraries, secrets, or entitlement logic.
- Test mobile width, retry/error states, visible session ID, and Continue to GalviSight.
- Re-run GalviTriage, GalviVitals, and GalviScore and confirm no regression.
- Review migration and rollback commands before approving Day 3.
# 10. Human Approval Record

| Approval | Human decision / evidence |
| --- | --- |
| Day 2 prerequisite accepted | Commit/evidence: __________________________ |
| Finding families/copy approved | Version/date: _____________________________ |
| Confidence/follow-up behavior approved | Decision: _________________________________ |
| Golden case 1 approved | Session/result: ____________________________ |
| Golden case 2 approved | Session/result: ____________________________ |
| Golden case 3 approved | Session/result: ____________________________ |
| Evidence traceability approved | PASS / BLOCK |
| Entitlement boundary approved | PASS / BLOCK |
| Browser security boundary approved | PASS / BLOCK |
| Regression approved | PASS / BLOCK |
| Day 3 acceptance | GO / NO-GO |
| Production promotion | NOT AUTHORIZED / SEPARATELY AUTHORIZED: ____ |


# PART B — AUTHORITATIVE DAY 3 ENGINEERING SPECIFICATION
# 11. Day 3 Objective, Scope, and Non-Goals
Day 3 replaces the OpenAI-dependent GalviShot generation path with governed deterministic GalviEngine rules while preserving the paid clinical findings experience. The minimum accepted result is 3–5 evidence-based findings that render from rules and refresh from storage.

| In scope | Deferred |
| --- | --- |
| Finding/risk/action/question/template libraries sufficient for the current ICP and golden fixtures. | Full FCD-level founder biography or unrestricted narrative generation. |
| Evidence-linked deterministic findings and confidence/follow-up logic. | Autonomous learning, rule authoring UI, or self-modifying logic. |
| D1 storage, retrieval, confirmation metadata, and QA fixtures. | Full Airtable history migration or enterprise knowledge graph. |
| Existing paywall/result UI integration. | Day 5 final Stripe webhook redesign, product catalog redesign, or pricing changes. |
| Automated/manual QA and rollback. | GalviSight/Pathway interpretation, GalviClinic treatment selection, email automation. |


| Scope boundary<br>Day 3 does not redesign GalviScore. It consumes the approved Day 2 record as evidence. Any required scoring change is a Day 2 reopening decision, not a Day 3 convenience edit. |
| --- |


# 12. Target Day 3 Architecture

| GitHub Pages browser (presentation only)<br> └─ POST /api { action, session_id, payload }<br> └─ Existing Cloudflare Worker action router<br> ├─ entitlement service / QA override guard<br> ├─ Day 2 clinical record loader<br> ├─ GalviShot confidence evaluator<br> ├─ governed finding + risk + action libraries<br> ├─ deterministic ranking / diversity / suppression<br> ├─ narrative assembler<br> └─ D1 GalviVault<br> ├─ diagnostic_results (customer result)<br> ├─ clinical_findings (one row per finding)<br> ├─ evidence_links (finding ↔ evidence)<br> ├─ clinical_followups (question/answer)<br> └─ journey_events / errors |
| --- |


| Learning-ready record separation<br>The polished GalviShot is a view of the clinical record, not the clinical record itself. Raw evidence, observations, hypotheses, findings, recommendations, and customer presentation must remain distinguishable. |
| --- |



# 13. Canonical API Contract and State Machine

| POST https://<qa-worker>/api<br>{<br> "action": "evaluate_galvishot | save_galvishot_followup | get_or_create_galvishot | get_galvishot",<br> "session_id": "gc_...",<br> "current_stage": "GalviShot",<br> "payload": {}<br>}<br><br>Response envelope:<br>{<br> "success": true,<br> "status": "locked | needs_followup | eligible | ok | facilitator_review",<br> "session_id": "gc_...",<br> "data": {},<br> "next_screen": "GalviShot | GalviSight"<br>} |
| --- |


| State | Meaning | Permitted response |
| --- | --- | --- |
| locked | No verified entitlement and no permitted QA override. | No paid findings; payment_required metadata and safe CTA only. |
| needs_followup | Evidence confidence below threshold and approved questions can increase it. | 1–3 targeted questions; no final GalviShot. |
| eligible | Evidence sufficient; no stored result exists. | Eligibility metadata only until get_or_create is called. |
| ok | Stored or newly generated result is available. | Full governed result with generation_source rules/stored. |
| facilitator_review | Evidence conflicts or remains insufficient after allowed follow-up. | Assumptions/review message; no invented final claim. |

# 14. Rules and Content Library File Structure

| worker/<br> rules/<br> galvishot_findings_v0_5.js<br> galvishot_risks_v0_5.js<br> galvishot_actions_v0_5.js<br> galvishot_followups_v0_5.js<br> galvishot_templates_v0_5.js<br> galvishot_suppression_v0_5.js<br> services/<br> galvishotEvidence.js<br> galvishotConfidence.js<br> galvishotRanker.js<br> galvishotComposer.js<br> galvishotStore.js<br> entitlement.js<br> handlers/<br> galvishot.js<br> tests/<br> galvishot.*.test.js<br>fixtures/<br> day3-golden-revenue-customer.json<br> day3-golden-founder-capacity.json<br> day3-golden-broad-weakness.json<br>migrations/<br> 000X_day3_galvishot.sql<br>docs/<br> CODEX_DAY3_IMPLEMENTATION_BRIEF.md<br> DAY3_QA_EVIDENCE.md |
| --- |


| Repository adaptation rule<br>Codex may adapt paths to repository conventions, but must preserve separation of contracts, pure rules, services, persistence, handlers, tests, fixtures, and documentation. |
| --- |


# 15. Finding Component Contract
Each finding is a reusable governed component. It is not a free-form paragraph and cannot contain dynamic facts that are not supplied through approved evidence placeholders.

| {<br> code: "REVENUE_SIGNAL_WEAK",<br> version: "galvishot_rules_v0_5_1",<br> family: "revenue_signal_weakness",<br> domain: "Revenue",<br> title: "Revenue evidence is not yet keeping pace with venture activity.",<br> base_priority: 90,<br> eligibility: { all: [], any: [], none: [] },<br> evidence_requirements: [<br> { source: "score", field: "revenue_score", operator: "lt", value: 55, required: true },<br> { source: "score", field: "customer_score", operator: "lt", value: 65, required: false }<br> ],<br> contradiction_checks: [],<br> suppress_when: [],<br> narrative_template: "Your current Revenue score is {revenue_score}/100...",<br> evidence_template: "Revenue {revenue_score}; Customer {customer_score}.",<br> risk_codes: ["REVENUE_ASSUMPTION_UNVALIDATED"],<br> action_codes: ["RUN_OFFER_EVIDENCE_SPRINT", "DEFINE_CONVERSION_SIGNAL"],<br> assumptions: ["Revenue evidence is based on self-reported assessment inputs."],<br> max_per_result: 1<br>} |
| --- |


| Required field | Rule |
| --- | --- |
| code | Stable uppercase identifier; never reuse for a different meaning. |
| version | Rules version that generated the finding. |
| family/domain | Used for diversity and downstream GalviSight mapping. |
| eligibility | Explicit boolean conditions only; no hidden prose logic. |
| evidence_requirements | Named source fields and thresholds; required evidence must exist. |
| contradiction_checks | Prevents simplistic claims when signals conflict. |
| suppress_when | Explicit conditions that block display. |
| templates | Approved placeholders only; render fails closed on missing required placeholders. |
| risk/action codes | References governed libraries; no ad hoc generated advice. |
| assumptions | Visible limitation language attached when needed. |


# 16. Minimum MVP Finding Families

| Family | Primary trigger example | Customer meaning | Default priority |
| --- | --- | --- | --- |
| Problem clarity gap | problem < 55 | The venture may be building or communicating before the problem is sufficiently specific. | 82 |
| Customer evidence gap | customer < 55 | Founder conviction is stronger than customer evidence. | 90 |
| Product validation gap | product < 55 | Solution effort is outpacing proof of value. | 86 |
| Revenue signal weakness | revenue < 55 | Commercial activity is not yet producing repeatable evidence. | 92 |
| Business model strain | business_model < 55 | Value creation may not yet translate into sustainable economics. | 84 |
| Distribution bottleneck | distribution < 55 | The venture may have value but lacks a repeatable route to demand. | 88 |
| Leadership capacity strain | leadership < 55 or approved capacity signal | Execution risk is concentrated in founder bandwidth or decision discipline. | 94 |
| Systems/operations fragility | technology_operations < 55 | Processes or systems may not support consistent delivery or growth. | 80 |
| Cross-dimension contradiction | high product + low customer/revenue | The solution may be advancing faster than market evidence. | 96 |
| Broad focus dilution | 3+ dimensions under 60 | Too many simultaneous weaknesses may be reducing learning and execution speed. | 98 |

## 16.1 Required paired positive/context finding
A report should not read as a list of deficits when the evidence contains a credible strength. Add at least one governed strength/context component when an approved dimension is high and it does not contradict the priority risk. This is not encouragement filler; it must also be evidence-linked.

# 17. Evidence Contract and Traceability

| Evidence source | Permitted use | Prohibited use |
| --- | --- | --- |
| Normalized triage answer | Directly support a condition, stated preference, stage, challenge, or constraint. | Infer facts beyond the selected/text response. |
| Dimension score | Describe relative health in the named domain. | Claim causation, market size, revenue amount, or customer behavior. |
| GalviVitals classification | Provide current snapshot/context. | Treat a label as a diagnosis beyond the approved definition. |
| Follow-up answer | Clarify a targeted evidence gap. | Use unrelated free text to support multiple unsupported findings. |
| Stored venture metadata | Personalize name/stage/industry where present. | Invent missing firmographics or external market facts. |
| Facilitator override | Use only when approved, attributed, and versioned. | Treat unconfirmed facilitator notes as founder-submitted fact. |


| Evidence link object:<br>{<br> "evidence_id": "ev_...",<br> "source_type": "triage_answer | score | vitals | followup | facilitator",<br> "source_record_id": "...",<br> "field": "revenue_score",<br> "display_label": "Revenue health",<br> "display_value": "42/100",<br> "used_for": "eligibility | ranking | narrative | assumption",<br> "rules_version": "galvishot_rules_v0_5_1"<br>} |
| --- |


| Evidence hard gate<br>A finding without at least one stored evidence link must not be displayed. The composer should fail closed and log a governed error. |
| --- |


# 18. Confidence and Follow-Up Logic

| galvishot_confidence =<br> source_completeness * 0.35 +<br> score_consistency * 0.25 +<br> business_context * 0.20 +<br> optional_enrichment * 0.20 |
| --- |


| Factor | Definition | 0–100 calculation guidance |
| --- | --- | --- |
| source_completeness | Required Day 2 questions and required source fields are present. | Percent of required evidence available; never award points for nonexistent fields. |
| score_consistency | Scores and answers do not materially contradict the selected findings. | Start at 100; subtract governed penalties for contradictions or unstable mappings. |
| business_context | Minimum stage/challenge/customer/product context exists. | Award only for named approved context fields. |
| optional_enrichment | Approved follow-up or optional context improves specificity. | Supplemental only; cannot rescue missing required evidence alone. |


| Confidence | Behavior |
| --- | --- |
| 0–59 | Return needs_followup with up to 3 targeted questions. Do not display a final customer-facing GalviShot. |
| 60–79 | Return 1–3 targeted questions. After answers, generate with visible assumptions or route to facilitator_review. |
| 80–89 | Generate a standard GalviShot with 3 findings and visible assumptions. |
| 90–100 | Generate 3–5 findings with stronger evidence references and only necessary assumptions. |


| Explainability rule<br>Store factor scores and the final confidence value in the result’s reasoning metadata, but expose only the approved customer-facing confidence presentation. |
| --- |



# 19. Follow-Up Question Selection

| Weakest area | Approved questions — select no more than 3 |
| --- | --- |
| Revenue | Which KPI concerns you most: leads, conversion, pricing, retention, or cash flow? What have you already tried? |
| Customer | Who is the highest-priority customer? What evidence shows the problem matters enough to act? |
| Product | What result should the product reliably create? What evidence shows customers experience that result? |
| Distribution | How do qualified customers currently discover and choose you? |
| Leadership | What decision or responsibility is consuming the most founder capacity? |
| Operations | Which process breaks most often or creates the greatest delivery risk? |
| General | What business outcome matters most during the next 90 days? |

- Calculate missing/weak evidence areas.
- Rank candidate questions by expected confidence gain, not by generic completeness.
- Deduplicate semantically overlapping questions.
- Select no more than three and preserve a stable order.
- Do not ask for information already stored.
- Validate length/type and sanitize free text.
- Upsert one answer per session_id + question_code + rules_version.
- Recompute confidence after save; do not auto-generate unless entitlement and eligibility are both satisfied.

# 20. Deterministic Ranking, Diversity, and Suppression

| candidate_score =<br> base_priority<br> + severity_adjustment<br> + evidence_strength_adjustment<br> + contradiction_priority<br> + strategic_relevance_adjustment<br> - assumption_penalty<br> - duplication_penalty |
| --- |


| Stage | Required behavior |
| --- | --- |
| Candidate generation | Evaluate every active finding component against normalized evidence. |
| Eligibility | Reject candidates missing required evidence or matching suppression conditions. |
| Contradiction | Run explicit cross-field checks; create a contradiction finding only when its own rule is satisfied. |
| Ranking | Use deterministic numeric ordering and stable code tie-breaker. |
| Diversity | Normally select no more than two findings from one domain and avoid synonymous families. |
| Coverage | Prefer a mix of primary constraint, evidence gap/contradiction, and execution implication. |
| Count | Select 3 findings for confidence 80–89; 3–5 for 90–100; never pad with weak candidates. |
| Suppression | Suppress lower-specificity findings when a stronger governed composite finding explains the same evidence. |
| Stability | Same input + rules version must produce the same ordered codes and result JSON. |


| Selection principle<br>Commercial credibility comes from prioritization and specificity, not from maximizing the number of findings. |
| --- |


# 21. Governed Risk and Action Libraries

| Risk component:<br>{ code, version, headline, explanation_template, evidence_requirements, severity, suppress_when }<br><br>Action component:<br>{ code, version, title, objective, steps[], expected_evidence, time_horizon, linked_families[], contraindications[] } |
| --- |


| Library rule | Requirement |
| --- | --- |
| One meaning per code | Never repurpose a code under the same version. |
| Evidence-linked | Risks must reference the finding/evidence that triggered them. |
| Actionable | Actions must include a concrete objective and next observable evidence. |
| No treatment overreach | Day 3 actions prepare for GalviSight/Clinic; they are not personalized treatment plans. |
| No unsupported urgency | Urgency language must be threshold-driven and approved. |
| No generic filler | Do not include advice that would appear regardless of evidence. |
| Downstream compatibility | Codes must be stable enough for Day 4 pathway mapping. |


# 22. D1 Migration — Learning-Ready GalviShot Records

| -- migrations/000X_day3_galvishot.sql<br>CREATE TABLE IF NOT EXISTS clinical_findings (<br> finding_id TEXT PRIMARY KEY,<br> session_id TEXT NOT NULL,<br> diagnostic_result_id INTEGER NOT NULL,<br> product TEXT NOT NULL DEFAULT 'GalviShot',<br> finding_code TEXT NOT NULL,<br> family TEXT NOT NULL,<br> domain TEXT NOT NULL,<br> rank INTEGER NOT NULL,<br> confidence REAL,<br> confidence_band TEXT,<br> status TEXT DEFAULT 'active',<br> finding_json TEXT NOT NULL,<br> rules_version TEXT NOT NULL,<br> confirmed_status TEXT DEFAULT 'unreviewed',<br> confirmed_by TEXT,<br> confirmed_at TEXT,<br> created_at TEXT NOT NULL,<br> updated_at TEXT NOT NULL,<br> UNIQUE(session_id, product, finding_code, rules_version)<br>);<br><br>CREATE TABLE IF NOT EXISTS evidence_links (<br> evidence_link_id TEXT PRIMARY KEY,<br> session_id TEXT NOT NULL,<br> finding_id TEXT NOT NULL,<br> source_type TEXT NOT NULL,<br> source_record_id TEXT,<br> source_field TEXT NOT NULL,<br> display_label TEXT,<br> display_value TEXT,<br> used_for TEXT NOT NULL,<br> rules_version TEXT NOT NULL,<br> created_at TEXT NOT NULL,<br> UNIQUE(finding_id, source_type, source_record_id, source_field, used_for)<br>);<br><br>CREATE TABLE IF NOT EXISTS galvishot_followups (<br> id INTEGER PRIMARY KEY AUTOINCREMENT,<br> session_id TEXT NOT NULL,<br> question_code TEXT NOT NULL,<br> question_version TEXT NOT NULL,<br> answer_text TEXT,<br> answer_number REAL,<br> normalized_json TEXT,<br> created_at TEXT NOT NULL,<br> updated_at TEXT NOT NULL,<br> UNIQUE(session_id, question_code, question_version)<br>);<br><br>CREATE INDEX IF NOT EXISTS idx_findings_session ON clinical_findings(session_id, product);<br>CREATE INDEX IF NOT EXISTS idx_evidence_finding ON evidence_links(finding_id);<br>CREATE INDEX IF NOT EXISTS idx_followups_session ON galvishot_followups(session_id); |
| --- |


| Migration adaptation<br>Adapt foreign-key syntax and table names to the approved Day 1/2 schema. Do not duplicate an existing equivalent table. Migration must be additive, repeatable, and QA-tested. |
| --- |


# 23. Migration Execution and Rollback
- Back up the QA D1 database or export relevant schema/fixture rows.
- Run the migration locally or against an isolated preview database first.
- Run schema introspection and uniqueness tests.
- Apply to QA D1 only using the repository’s approved command.
- Insert fixture data through application services, not ad hoc production-like SQL.
- Run duplicate and rollback rehearsal.
- Document the exact migration command and result.

| Rollback strategy:<br>1. Disable Day 3 routes behind the QA feature flag.<br>2. Restore the pre-Day-3 frontend/Worker commit.<br>3. Preserve diagnostic evidence for investigation; do not drop tables automatically.<br>4. If schema removal is explicitly approved, export rows, drop only Day 3 indexes/tables, and record the action.<br>5. Re-run Day 2 regression tests. |
| --- |


# 24. Backend Action Specifications

| Action | Input | Required behavior | Output |
| --- | --- | --- | --- |
| evaluate_galvishot | session_id | Load Day 2 record; validate completeness; compute confidence; identify questions; check stored result and entitlement state. | locked / needs_followup / eligible / ok |
| save_galvishot_followup | session_id + answers | Validate/sanitize; upsert answers; recompute confidence; write journey event; never duplicate. | needs_followup / eligible / facilitator_review |
| get_or_create_galvishot | session_id | Enforce entitlement; return stored first; otherwise evaluate, rank, compose, persist transactionally, return. | locked / needs_followup / ok |
| get_galvishot | session_id | Enforce entitlement; read stored result/findings/evidence only; never generate. | locked / not_found / ok |

## 24.1 Required handler order
- Validate action and session_id format.
- Resolve environment and allowed origin.
- Load session and Day 2 record.
- Resolve verified entitlement or tightly scoped QA override.
- For retrieval, query stored result before evaluation or generation.
- For generation, evaluate confidence and follow-up state.
- Generate only if eligible and not stored.
- Persist result, findings, evidence links, and event in one logical transaction or compensating-safe sequence.
- Return the canonical response envelope with safe errors.

# 25. Stored-First, Idempotency, and Concurrency

| Risk | Required control |
| --- | --- |
| Double click / retry | Unique diagnostic_results(session_id, product) or approved equivalent; use upsert/select-after-conflict. |
| Concurrent generation | Acquire transaction/insert guard; only one result wins; loser reads stored result. |
| Refresh | get_galvishot reads only; frontend must not call create by default after result exists. |
| Rules version change | Do not silently overwrite. New version requires explicit regeneration policy and human approval. |
| Partial persistence | Do not return success until result and minimum finding/evidence rows are persisted. |
| Follow-up duplicate | Unique session/question/version upsert. |
| Event duplicate | Use idempotency key where existing event model supports it. |


| Pseudo-flow:<br>existing = await store.getGalviShot(session_id)<br>if (existing) return stored(existing)<br>assertEntitledOrQaOverride(context)<br>assessment = await evaluate(session_id)<br>if (assessment.status !== "eligible") return assessment<br>result = compose(rank(findCandidates(loadEvidence(session_id))))<br>await store.createGalviShotAtomically(result)<br>return await store.getGalviShot(session_id) |
| --- |


# 26. Customer-Facing Result Contract

| {<br> "product": "GalviShot",<br> "status": "ok",<br> "confidence": 88,<br> "confidence_band": "high",<br> "executive_summary": "The current findings indicate...",<br> "findings": [<br> {<br> "rank": 1,<br> "code": "REVENUE_SIGNAL_WEAK",<br> "family": "revenue_signal_weakness",<br> "domain": "Revenue",<br> "headline": "Revenue evidence is not yet keeping pace with venture activity.",<br> "finding": "...",<br> "evidence": [<br> { "label": "Revenue health", "value": "42/100" },<br> { "label": "Customer health", "value": "55/100" }<br> ],<br> "confidence": "high",<br> "risk_codes": ["REVENUE_ASSUMPTION_UNVALIDATED"],<br> "action_codes": ["RUN_OFFER_EVIDENCE_SPRINT"]<br> }<br> ],<br> "strategic_risks": [{ "code": "...", "title": "...", "detail": "..." }],<br> "recommended_actions": [{ "code": "...", "title": "...", "steps": ["..."] }],<br> "assumptions": ["..."],<br> "next_step": "GalviSight",<br> "generation_source": "rules",<br> "rules_version": "galvishot_rules_v0_5_1",<br> "generated_at": "ISO-8601"<br>} |
| --- |


| Contract rule | Requirement |
| --- | --- |
| Stable schema | Frontend must render rules/stored/future approved sources through the same shape. |
| No raw reasoning exposure | Do not return proprietary thresholds, candidate scores, suppression rules, or internal debug traces. |
| Evidence display | Show safe labels and values, not database internals. |
| Assumptions | Visible when material; never hide uncertainty. |
| Paid value | Full findings/risks/actions are never returned in locked responses. |
| Storage | Store canonical JSON plus normalized finding/evidence rows. |


# 27. Frontend Integration — Preserve, Do Not Rewrite
- Identify the existing GalviShot locked screen, payment CTA, loading state, result container, error state, and Continue to GalviSight CTA.
- Preserve visual design and routing unless a defect prevents the Day 3 contract from rendering.
- On screen entry, call get_galvishot first when the session exists.
- When locked, render the existing paywall without paid content.
- When needs_followup, render only the returned approved questions and save through save_galvishot_followup.
- When eligible and entitlement is valid, call get_or_create_galvishot once.
- When ok, render confidence, executive summary, ranked findings, evidence, risks, actions, assumptions, and Continue to GalviSight.
- On network/server failure, show a visible recoverable card with Retry and session ID; never blank the app or show raw JSON.
- On refresh, retrieve stored output and preserve identical ordering/content.
- At mobile widths, ensure cards, evidence labels, question inputs, and CTAs remain readable.

| Frontend pseudocode:<br>const stored = await api({ action: "get_galvishot", session_id });<br>if (stored.status === "ok") return renderGalviShot(stored.data);<br>if (stored.status === "locked") return renderPaywall(stored.data);<br>const evaluation = await api({ action: "evaluate_galvishot", session_id });<br>if (evaluation.status === "needs_followup") return renderFollowups(evaluation.data.questions);<br>if (evaluation.status === "eligible") {<br> const result = await api({ action: "get_or_create_galvishot", session_id });<br> return routeResult(result);<br>}<br>return renderGovernedError(evaluation); |
| --- |


| GalviSecurity boundary<br>The browser may contain render mappings and accessibility labels. It may not contain finding triggers, weights, ranking, confidence formulas, paid narratives, risk/action libraries, or entitlement authority. |
| --- |



# PART C — TESTING, QA, RELEASE, AND OPERATIONS
# 28. Automated Test Strategy

| Test layer | Minimum coverage |
| --- | --- |
| Pure rule unit tests | Eligibility, suppression, contradiction, missing evidence, ranking, diversity, stable tie-breaking. |
| Confidence tests | All factor boundaries; 59/60/79/80/89/90; follow-up count and relevance. |
| Composer contract tests | Placeholder validation, no raw internal fields, schema completeness, assumptions. |
| Persistence tests | Create once, stored retrieval, concurrency conflict, partial failure, follow-up upsert. |
| Entitlement tests | Unpaid locked, verified paid allowed, URL/localStorage spoof rejected, QA override environment isolation. |
| Handler tests | Invalid action/session/payload, state transitions, safe error envelope, CORS. |
| Frontend tests | Locked/follow-up/result/error states, refresh stored-first, mobile DOM/accessibility. |
| Regression tests | All Day 1/2 routes and existing legacy routes unchanged. |

# 29. Required Golden Fixtures

| Fixture | Minimum evidence pattern | Expected dominant findings |
| --- | --- | --- |
| Revenue/customer weakness | Revenue <55, Customer <55, no stronger contradictory evidence. | Revenue signal weakness + customer evidence gap; possibly business model/distribution depending on actual data. |
| Founder-capacity strain | Leadership <55 or approved capacity answer; other scores not uniformly weak. | Leadership capacity strain with evidence-specific action; no invented burnout/health claim. |
| Broad multi-dimension weakness | At least three dimensions <60. | Broad focus dilution plus top 2 specific constraints; avoid repetitive deficit list. |


| Golden-case governance<br>Expected finding codes must be reviewed and pinned in fixture snapshots. Codex must not choose “commercially credible” language without Product Owner review. |
| --- |



# 30. Day 3 QA Matrix

| Scenario | Expected result | Evidence |
| --- | --- | --- |
| High confidence | No unnecessary questions; 3–5 findings; visible evidence; stable ordering. | Screenshot + response + D1 query |
| Low confidence | Only relevant questions; final result withheld or assumptions/review status. | Response + UI screenshot |
| Boundary 79→80 | Behavior changes exactly at approved threshold. | Automated test output |
| Evidence grounding | Every finding has at least one actual stored evidence link. | D1 join/query |
| No invention | No unsupported revenue/customer/market/causal claim. | Human review checklist |
| Contradiction | Composite contradiction appears only when rule is satisfied; simplistic finding suppressed when required. | Fixture output |
| Diversity | No redundant synonymous findings; no more than approved domain maximum. | Finding code list |
| Duplicate refresh | One result per session/product; identical stored output. | D1 count + hashes |
| Concurrent request | Only one persisted result; both callers receive same stored result. | Integration test |
| Locked access | Unpaid request returns locked/payment_required with no paid payload. | Network response |
| Spoofed payment | Query/localStorage flag does not unlock. | Manual + automated test |
| QA override | Works in QA only; production-mode test blocks it. | Environment tests |
| Error recovery | Visible error card, Retry, session ID; no raw JSON/blank screen. | Screenshot |
| Mobile | Readable cards/questions/CTA at iPhone width. | Screenshot |
| Regression | GalviScore and legacy routes still pass. | Test report |


# 31. API Test Payloads — Copy/Paste Templates

| # Evaluate<br>curl -sS -X POST "$QA_WORKER/api" -H "Content-Type: application/json" \<br> -d '{"action":"evaluate_galvishot","session_id":"gc_fixture_revenue","current_stage":"GalviShot","payload":{}}'<br><br># Save follow-up<br>curl -sS -X POST "$QA_WORKER/api" -H "Content-Type: application/json" \<br> -d '{"action":"save_galvishot_followup","session_id":"gc_fixture_revenue","current_stage":"GalviShot","payload":{"answers":[{"question_code":"REV_KPI_CONCERN","answer_text":"Conversion"}]}}'<br><br># Create or retrieve<br>curl -sS -X POST "$QA_WORKER/api" -H "Content-Type: application/json" \<br> -d '{"action":"get_or_create_galvishot","session_id":"gc_fixture_revenue","current_stage":"GalviShot","payload":{}}'<br><br># Stored-only retrieval<br>curl -sS -X POST "$QA_WORKER/api" -H "Content-Type: application/json" \<br> -d '{"action":"get_galvishot","session_id":"gc_fixture_revenue","current_stage":"GalviShot","payload":{}}' |
| --- |

# 32. D1 Verification Queries

| SELECT session_id, product, rules_version, generation_source, confidence, status, created_at, updated_at<br>FROM diagnostic_results<br>WHERE session_id = ? AND product = 'GalviShot';<br><br>SELECT session_id, product, COUNT(*) AS result_count<br>FROM diagnostic_results<br>WHERE product = 'GalviShot'<br>GROUP BY session_id, product<br>HAVING COUNT(*) > 1;<br><br>SELECT finding_code, family, domain, rank, confidence, rules_version<br>FROM clinical_findings<br>WHERE session_id = ?<br>ORDER BY rank;<br><br>SELECT cf.finding_code, el.source_type, el.source_field, el.display_value, el.used_for<br>FROM clinical_findings cf<br>LEFT JOIN evidence_links el ON el.finding_id = cf.finding_id<br>WHERE cf.session_id = ?<br>ORDER BY cf.rank, el.source_field;<br><br>SELECT question_code, COUNT(*)<br>FROM galvishot_followups<br>WHERE session_id = ?<br>GROUP BY question_code<br>HAVING COUNT(*) > 1; |
| --- |


# 33. Security and Privacy Review

| Control | PASS criteria |
| --- | --- |
| Browser intelligence boundary | No triggers, thresholds, weights, ranker, confidence formula, paid narrative library, or secrets in frontend. |
| CORS | Only approved QA/production origins; no wildcard with credentials. |
| Input validation | Session/action enums validated; free text bounded, normalized, and safely rendered. |
| Output minimization | Locked/error responses omit paid content and internal reasoning. |
| Entitlement | Server-side verified authority; QA override guarded by environment and non-production secret/config. |
| Logging | No unnecessary PII, full answer payloads, secrets, or paid report bodies in logs. |
| SQL safety | Parameterized queries; no string-built SQL from user input. |
| Rules confidentiality | Rule libraries remain in Worker source, not public GitHub Pages assets. |
| Error safety | Structured safe errors; no stack traces or database schema leakage. |
| Production isolation | No production DB, keys, branch, deploy command, or live payment used during Day 3. |

# 34. Failure and Recovery Behavior

| Failure | Customer behavior | Operational behavior |
| --- | --- | --- |
| Day 2 record missing | Show recoverable “complete GalviTriage” state. | Log missing prerequisite; do not generate. |
| Low confidence | Show targeted follow-up or facilitator review. | Store state/event; no paid result. |
| Entitlement unavailable | Show payment pending/retry without losing session. | Do not unlock; retry verification later. |
| D1 read failure | Visible retry card with session ID. | Safe error log; no regeneration loop. |
| D1 write failure | Do not claim success. | Rollback/compensate partial rows; retry idempotently. |
| Template placeholder missing | Governed error/facilitator review. | Block finding; log code/version. |
| No eligible findings | Facilitator review, not generic filler. | Record reason and evidence state. |
| Legacy adapter failure | GalviShot still renders if core stored result exists. | Log and continue where adapter is non-blocking. |


# 35. Human Manual QA Runbook
- Open QA in incognito and start with a brand-new session or load an approved fixture through the QA-safe path.
- Confirm GalviTriage/Vitals/Score data is available and GalviShot preserves session_id.
- Test unpaid/locked access; inspect the network response for absence of paid content.
- Test a spoofed success/payment query parameter and localStorage flag; confirm locked state remains.
- Enable the approved QA override and confirm only the QA environment can use it.
- Run the revenue/customer fixture. Read every sentence and map it to visible evidence.
- Run the founder-capacity fixture. Confirm the result does not claim medical burnout, mental health, or unsupported personal facts.
- Run the broad-weakness fixture. Confirm prioritization avoids a repetitive list of every low score.
- Run a low-confidence fixture; confirm relevant follow-up questions and withheld final output.
- Submit follow-ups twice; confirm upsert and no duplicates.
- Refresh twice, close/reopen, and call get_galvishot; confirm stored output is identical.
- Trigger a controlled API error; confirm visible recoverable card and session ID.
- Test iPhone-sized width and desktop width.
- Click Continue to GalviSight and confirm session continuity.
- Re-run Day 2 happy path and one legacy route.
- Review the PR diff for unrelated changes, secrets, browser rules, and weakened entitlement.

# 36. Stop / Go Gate

| DAY 3 GO<br>GO when GalviShot produces commercially credible, evidence-grounded findings for at least the three golden cases; each finding has stored evidence; low-confidence behavior is honest; entitlement is protected; stored refresh is stable; and all Day 2/legacy regressions pass. |
| --- |



| DAY 3 STOP<br>STOP when the result needs unsupported language to feel useful; any paid content or rule logic is exposed in the browser; entitlement can be spoofed; refresh regenerates or duplicates; evidence links are missing; or prior stages regress. |
| --- |



| Gate | Result | Evidence |
| --- | --- | --- |
| Three golden cases credible | PASS / BLOCK | ____________________________ |
| Evidence trace complete | PASS / BLOCK | ____________________________ |
| Confidence/follow-up honest | PASS / BLOCK | ____________________________ |
| Payment/QA override secure | PASS / BLOCK | ____________________________ |
| Stored-first/idempotent | PASS / BLOCK | ____________________________ |
| Frontend/mobile/error states | PASS / BLOCK | ____________________________ |
| Security review | PASS / BLOCK | ____________________________ |
| Day 1/2/legacy regression | PASS / BLOCK | ____________________________ |
| Rollback rehearsed | PASS / BLOCK | ____________________________ |
| Human acceptance | GO / NO-GO | Name/date: __________________ |


# 37. Pull Request Preparation

| PR title:<br>Day 3: deterministic evidence-grounded GalviShot in QA<br><br>PR summary:<br>- Replaces OpenAI-dependent GalviShot generation with governed Worker-side rules.<br>- Adds confidence/follow-up evaluation, evidence-linked findings, stored-first retrieval, and QA-safe frontend states.<br>- Preserves one Worker, Day 2 contracts, paywall semantics, and legacy routes.<br><br>Changed areas:<br>- Rules/content libraries<br>- GalviShot services/handlers<br>- Additive D1 migration<br>- QA frontend integration<br>- Fixtures/tests/docs<br><br>Verification:<br>- [ ] Golden revenue/customer case<br>- [ ] Golden founder-capacity case<br>- [ ] Golden broad-weakness case<br>- [ ] Low confidence/follow-up<br>- [ ] Evidence traceability<br>- [ ] Entitlement and spoof rejection<br>- [ ] Stored refresh/idempotency<br>- [ ] Mobile/error state<br>- [ ] Day 1/2/legacy regression<br><br>Not included:<br>- Production deployment<br>- Main-branch merge<br>- Live Stripe changes<br>- GalviSight/Clinic implementation<br>- OpenAI/Make<br><br>Rollback:<br><exact commit/migration/feature-flag steps> |
| --- |

# 38. Codex Final Report Template

| Section | Required content |
| --- | --- |
| Implementation summary | What was built and what remains deferred. |
| Changed files | Exact path and reason for each change. |
| Architecture | How rules, evidence, confidence, storage, entitlement, and frontend connect. |
| Tests | Commands, counts, pass/fail, and unresolved failures. |
| Golden cases | Input fixture, ordered finding codes, confidence, evidence trace, human-review flags. |
| Migration | Exact apply/verify/rollback commands. |
| Security | Browser boundary, CORS, entitlement, validation, logs, secrets. |
| Assumptions | Every assumption Codex made; unresolved Product Owner decisions. |
| Manual QA | Step-by-step runbook and URLs/fixture IDs. |
| Recommendation | GO/BLOCK recommendation with reasons; never declare acceptance. |


# 39. Closeout and Day 4 Handoff
- Record the accepted Day 3 commit SHA and rules version.
- Save QA screenshots, API responses, D1 queries, and test logs in the private evidence package.
- Confirm one active stored GalviShot per golden session and no duplicate findings/follow-ups.
- Document any finding/copy decisions made by the Product Owner.
- Tag or otherwise mark the approved QA baseline.
- Keep production unchanged until the approved cutover day.
- Prepare Day 4 inputs: stable finding codes, risk codes, action codes, evidence links, assumptions, confidence, and next_step GalviSight.

| Handoff contract<br>Day 4 must interpret and plan from the same clinical file. It must not re-diagnose from browser data or regenerate Day 3 findings. |
| --- |



# APPENDIX A — Suggested Initial Finding Matrix

| Code | Family | Key eligibility | Suppress / caution | Primary actions |
| --- | --- | --- | --- | --- |
| PROBLEM_CLARITY_GAP | Problem clarity | problem_score <55 | Suppress if customer/revenue evidence clearly validates a specific problem; use caution with ambiguous scoring. | CLARIFY_PROBLEM_STATEMENT; TEST_URGENCY |
| CUSTOMER_EVIDENCE_GAP | Customer evidence | customer_score <55 | Do not claim customers reject the offer; state evidence gap. | DEFINE_ICP_EVIDENCE; RUN_CUSTOMER_SIGNAL_TEST |
| PRODUCT_VALIDATION_GAP | Product validation | product_score <55 | Do not imply product failure without direct evidence. | DEFINE_VALUE_OUTCOME; RUN_PROOF_OF_VALUE_TEST |
| REVENUE_SIGNAL_WEAK | Revenue weakness | revenue_score <55 | Do not state revenue amount or runway. | DEFINE_CONVERSION_SIGNAL; RUN_OFFER_EVIDENCE_SPRINT |
| BUSINESS_MODEL_STRAIN | Business model | business_model_score <55 | Avoid profitability claims absent evidence. | TEST_UNIT_ECONOMICS_ASSUMPTIONS |
| DISTRIBUTION_BOTTLENECK | Distribution | distribution_score <55 | Do not claim channel failure; describe repeatability gap. | MAP_DISCOVERY_TO_CHOICE; TEST_CHANNEL_SIGNAL |
| LEADERSHIP_CAPACITY_STRAIN | Leadership capacity | leadership_score <55 OR approved capacity answer | No medical/mental-health diagnosis; no burnout claim unless explicitly stated and approved. | FOUNDER_CAPACITY_TRIAGE; DECISION_LOAD_REDUCTION |
| OPERATIONS_FRAGILITY | Operations | technology_operations_score <55 | Do not claim system outage or delivery failure absent evidence. | IDENTIFY_BREAKING_PROCESS; STANDARDIZE_CRITICAL_WORKFLOW |
| PRODUCT_MARKET_EVIDENCE_CONTRADICTION | Cross-dimension contradiction | product >=70 AND (customer <55 OR revenue <55) | Requires both signals; suppress generic product gap if composite is clearer. | REBALANCE_BUILD_VS_EVIDENCE |
| BROAD_FOCUS_DILUTION | Broad weakness | count(dimensions <60) >=3 | Do not display every low-dimension finding; select top two specific constraints. | CHOOSE_90_DAY_CONSTRAINT; SEQUENCE_EVIDENCE_SPRINTS |


# APPENDIX B — Example Result Composition Rules
- Executive summary: two to four sentences; name the dominant pattern, not every score.
- Finding 1: highest-priority constraint or contradiction.
- Finding 2: evidence gap or enabling cause from a different family/domain where possible.
- Finding 3: execution/capacity/system implication.
- Optional findings 4–5: only when confidence ≥90 and materially distinct.
- Strategic risks: maximum three, mapped to selected findings.
- Recommended actions: maximum three near-term actions, each with observable evidence.
- Assumptions: show all material limitations; remove duplicates.
- Next step: Continue to GalviSight; no Day 4 pathway content is generated here.

| Forbidden sentence patterns unless directly supported:<br>- “Your market does not want this.”<br>- “You are running out of cash.”<br>- “Your customers are confused.”<br>- “Your leadership is causing the problem.”<br>- “You are burned out.”<br>- “This will fail unless...”<br><br>Preferred evidence-safe patterns:<br>- “The current assessment shows limited evidence of...”<br>- “The strongest constraint in the present record is...”<br>- “This pattern may indicate...; the current result assumes...”<br>- “The next useful evidence would be...” |
| --- |


# APPENDIX C — Acceptance Test Catalog

| ID | Test | Expected |
| --- | --- | --- |
| D3-001 | Stored result exists before create call | Stored result returned; generator not invoked. |
| D3-002 | Required evidence missing | Candidate suppressed; logged; no unsupported text. |
| D3-003 | Confidence 59 | needs_followup; no final result. |
| D3-004 | Confidence 60 | targeted follow-up/assumption behavior per contract. |
| D3-005 | Confidence 79 | still follow-up/assumption behavior. |
| D3-006 | Confidence 80 | standard 3-finding result. |
| D3-007 | Confidence 90 | 3–5 finding result; stronger evidence references. |
| D3-008 | Duplicate follow-up save | One row, updated answer. |
| D3-009 | Two simultaneous create requests | One stored result; identical response. |
| D3-010 | Unpaid create | locked; no paid content. |
| D3-011 | Spoofed query success | still locked. |
| D3-012 | QA override in QA | allowed. |
| D3-013 | QA override in production mode | blocked. |
| D3-014 | Cross-dimension contradiction | composite finding selected; redundant lower finding suppressed as configured. |
| D3-015 | Broad weakness | broad finding + prioritized specifics; no exhaustive deficit list. |
| D3-016 | Template missing placeholder | finding blocked; governed error. |
| D3-017 | D1 partial failure | no success response; idempotent retry possible. |
| D3-018 | Refresh | stored output unchanged. |
| D3-019 | Mobile render | no overflow; readable evidence/actions. |
| D3-020 | Day 2 regression | Triage/Vitals/Score pass unchanged. |


# APPENDIX D — Product Owner Evidence Worksheet

| Golden case | Session ID | Confidence | Ordered finding codes | Credibility decision |
| --- | --- | --- | --- | --- |
| Revenue/customer weakness | ________________ | _____ | ____________________________ | APPROVE / REVISE / BLOCK |
| Founder-capacity strain | ________________ | _____ | ____________________________ | APPROVE / REVISE / BLOCK |
| Broad multi-dimension weakness | ________________ | _____ | ____________________________ | APPROVE / REVISE / BLOCK |
| Low confidence | ________________ | _____ | Questions: __________________ | APPROVE / REVISE / BLOCK |


| Finding code | Evidence source(s) | Exact customer statement reviewed | Supported? |
| --- | --- | --- | --- |
| ________________ | ________________ | ________________________________ | YES / NO |
| ________________ | ________________ | ________________________________ | YES / NO |
| ________________ | ________________ | ________________________________ | YES / NO |
| ________________ | ________________ | ________________________________ | YES / NO |
| ________________ | ________________ | ________________________________ | YES / NO |


# APPENDIX E — Day 3 Definition of Done
- Approved QA branch contains additive Day 3 implementation and documentation.
- One existing Worker serves all Day 3 actions through the existing router.
- No Make or OpenAI runtime dependency exists.
- No proprietary rule, paid content library, or entitlement authority executes in the browser.
- Finding/risk/action/question/template/suppression libraries are versioned and governed.
- Every finding is evidence-linked and stored separately from the polished report.
- Confidence and follow-up boundaries pass automated tests.
- Paid result requires verified entitlement or environment-scoped QA override.
- get_galvishot never generates; get_or_create returns stored first.
- Golden fixtures pass and receive human credibility approval.
- No duplicate result/finding/follow-up rows occur after retry/refresh/concurrency.
- Visible error and mobile states pass.
- Day 1/2 and legacy regressions pass.
- Migration, rollback, PR, and QA evidence are complete.
- Human Product Owner issues explicit GO; production remains separately unauthorized.

# APPENDIX F — Source Alignment Notes
This Builder Guide operationalizes the Seven-Day Build Implementation Guide’s Day 3 objective: replace AI-generated findings with governed evidence-based GalviEngine rules; create reusable finding components; apply confidence and targeted follow-up logic; implement evaluate/save/get-or-create/get actions; preserve the existing paywall and result layout; return stored results on refresh; and pass the Day 3 credibility/evidence/payment/regression gate.
It also carries forward the Day 2 Builder Guide’s execution model: discovery first, one Worker, QA isolation, D1 as source of truth, browser presentation only, versioned deterministic logic, automated tests, human approval gates, reviewable pull request, and no production promotion without explicit authorization.

| MEASURE TWICE • BUILD ONCE • PROVE THE RECORD • PRESERVE THE CUSTOMER JOURNEY |
| --- |

