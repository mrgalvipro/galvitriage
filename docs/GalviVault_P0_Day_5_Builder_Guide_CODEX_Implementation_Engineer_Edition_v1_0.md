# GALVIVAULT™ P0 — DAY 5 BUILDER GUIDE

**Recommendations • Treatment • Outcomes • Governance • Non-Blocking Adapters**

**CODEX Implementation Engineer Edition | Version 1.0 | August 2026**

*Authoritative source: GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide v0.5*

> **DAY 5 BUILD OBJECTIVE**
>
> Complete the governed care chain from finding → recommendation → treatment plan → outcome, while proving that CRM, analytics, payment, notification, and future-intelligence adapters remain downstream, non-authoritative, and unable to invalidate canonical GalviVault success.

> **DAY 5 SUCCESS DECLARATION**
>
> Declare DAY 5 BUILD PASS only after all Day 5 blocking gates are evidenced: recommendations require findings and preserve versions; treatment requires authorized care context and atomic plan/items; plan revisions/events preserve history; outcomes are sourced/timed/related; feedback is append-only; learning candidates do not change active runtime knowledge; and adapter failures are recorded without rolling back canonical state.

| Document control | Value |
| --- | --- |
| Build day | Day 5 of 7 |
| Primary environment | QA only |
| Production posture | Preserve existing Production behavior; no Day 5 Production promotion |
| Canonical write authority | Cloudflare Worker |
| Canonical persistence authority | Cloudflare D1 |
| Primary aggregate | Business Medical Record (one canonical BMR per venture) |
| Day 5 scope owner | Recommendation / treatment / outcome / governance services and routes; adapters and delivery ledger; care fixtures/tests |
| Pass authority | Objective automated + D1 + Human evidence, not an implementation report |

## Table of Contents

1. Document Authority and How Codex Must Use This Guide

2. Day 5 Outcome, Scope, and Non-Negotiable Guardrails

3. Day 5 Entry Criteria and Starting Baseline

4. Day 5 Repository Ownership and File Plan

5. Canonical Architecture, Authorization, and Transaction Rules

6. Day 5 D1 Data Contract and Migration Discipline

7. Day 5 Domain and BMR Lifecycle Contract

8. Step-by-Step Day 5 Build Procedure

9. Day 5 REST API Contract and Request Shapes

10. Day 5 Direct D1 Verification Queries

11. Day 5 Automated QA Matrix

12. QA Deployment and Integrated Smoke

13. Day 5 Human E2E — Governed Care Chain

14. Adapter Failure and Recovery Human E2E

15. Regression / Do-Not-Break Gate

16. Release Evidence Package and Daily Gate

17. Stop / Go / Rollback Decision Rules

18. Defect Handling and Critical-Path Remediation

19. Codex End-to-End Execution Checklist

20. Required Day 5 Implementation Report

Appendix A. Day 5 File Manifest

Appendix B. Day 5 Schema Contract

Appendix C. Error Codes and Required Failure Behavior

Appendix D. Command / Evidence Runbook

## 1. Document Authority and How Codex Must Use This Guide

This Day 5 Builder Guide operationalizes the authoritative GalviVault P0 Seven-Day Build & Production Readiness Implementation Guide v0.5 for the fifth build day. It does not create a new architecture. Where this Builder Guide supplies an implementation filename or command pattern that the source guide leaves open, it is an implementation convention derived from the source repository tree, module contracts, naming rules, and Day 5 repository ownership.

> **Authority rule**
>
> If an existing Day 1–Day 4 implementation already satisfies the source contract, preserve it. Do not rewrite working code merely to match examples in this guide. Change only the critical-path files needed to satisfy Day 5 behavior and its regression gates.

### 1.1 Codex operating instructions

1.  Read the current QA branch before editing. Identify the exact Day 4 passing baseline, open defects, current Worker entry, D1 binding, migration ledger, and existing care/adaptor modules.

2.  Treat the authoritative v0.5 contract as the behavior source. Existing code is an implementation candidate, not the authority when it conflicts with the contract.

3.  Preserve Production entry files, Production Worker behavior, existing GalviCare integrations, and previously passing Day 1–Day 4 behavior unless a Day 5 blocking defect proves a targeted shared fix is required.

4.  Implement the smallest coherent Day 5 change set. Do not create parallel Worker paths, duplicate domain services, alternate databases, browser-side D1 writes, or direct CRM writes.

5.  Run local/domain/repository tests before remote QA deployment. After QA deployment, rerun the Day 5 integrated tests and the required prior-day regression suites.

6.  Use direct D1 assertions for every claim about persistence, atomicity, version history, append-only behavior, idempotency, lifecycle, or adapter delivery status.

7.  Do not declare a pass from a green deployment alone. Day 5 passes only when all applicable BLOCK gates and evidence requirements pass.

### 1.2 What Codex must never do on Day 5

- Do not point Production to a QA entry point or QA D1 database.
- Do not edit or destructively replace an already-applied migration to make the database resemble the desired schema.
- Do not collapse finding, recommendation, treatment, outcome, feedback, or learning records into one mutable JSON/report blob.
- Do not allow a rendered report, payment fact, client button, CRM update, analytics event, or AI output to approve or mutate canonical care state.
- Do not update or delete historical treatment events; they are append-only.
- Do not treat missing outcome data as success.
- Do not let adapter failures roll back canonical recommendations, plans, events, outcomes, or journey events.
- Do not skip required tests, change expected results merely to obtain green status, or use Production as the first test environment.
## 2. Day 5 Outcome, Scope, and Non-Negotiable Guardrails

### 2.1 Day 5 required outputs

- Versioned recommendations linked to current governed findings.
- Versioned treatment plans and plan items linked to approved recommendations/findings.
- Append-only treatment events and sourced outcomes.
- Feedback and confirmation/rejection/correction signals that do not overwrite their targets.
- Learning candidate creation with human-governed status and no automatic runtime promotion.
- Adapter delivery ledger with bounded retry/reconciliation behavior.
- Minimum authorized Business Physician/operator workflows for care actions.
### 2.2 Day 5 hard acceptance gates

| Gate | Acceptance criterion | Required proof | Level |
| --- | --- | --- | --- |
| D5-01 | Recommendation requires finding and is versioned. | Negative + positive link tests; D1 version/link rows. | BLOCK |
| D5-02 | Treatment requires authorization and approved care context; plan/items are atomic. | Auth/domain/API test plus D1 assertions. | BLOCK |
| D5-03 | Plan revision and treatment events preserve history. | Version/event queries; append-only trigger proof. | BLOCK |
| D5-04 | Outcome has source/time/relation; feedback does not overwrite target. | Outcome/feedback tests and target hash/state proof. | BLOCK |
| D5-05 | Learning candidate cannot change active runtime knowledge. | Governance/authorization test; knowledge item unchanged. | BLOCK |
| D5-06 | Adapter failure is non-blocking and recorded. | Forced failure plus canonical rows and adapter_deliveries row. | BLOCK |

### 2.3 Day 5 stop/go definition

> **GO**
>
> The complete governed care chain is stored as separated, linked, versioned records; outcomes are sourced and timed; feedback remains append-only; learning remains a proposal; and adapter failures do not invalidate canonical success.

> **STOP**
>
> Treatment can be activated without authority or findings/recommendations; plan revisions erase history; missing outcomes are interpreted as success; a learning proposal changes runtime knowledge; or an external system becomes a second source of truth.

## 3. Day 5 Entry Criteria and Starting Baseline

### 3.1 Mandatory entry criteria from Days 1–4

| Prerequisite | Day 5 may start only when |
| --- | --- |
| Day 1 foundation | QA Worker + D1 are isolated; migration/readiness is proven; canonical response/error envelope and idempotency foundation are working. |
| Day 2 identity | Founder, Venture, BMR, and session identity are stable and duplicate-safe; exactly one BMR exists per venture. |
| Day 3 evidence | Evidence is typed, versioned, accepted evidence is immutable, correction creates a new version, and support links are queryable. |
| Day 4 reasoning | Every finding has valid support lineage; confirmation status is explicit; prior reasoning versions remain retrievable; BMR current/history/timeline projections work. |
| Environment | QA branch, QA Worker, QA D1 database, allowlist, feature/fixture policy, and rollback reference are known and separate from Production. |

> **Dependency rule**
>
> Day 5 cannot create recommendations or treatment plans until findings and confirmation status are governed and retrievable. If Day 4 lineage/history is not objectively passing, stop Day 5 and repair the Day 4 blocker first.

### 3.2 Start-of-day 30-minute baseline freeze

1.  Confirm the working branch and exact starting commit. Record both in release-evidence/day5.

2.  Confirm working tree status. Do not carry unrelated or unexplained changes into the Day 5 change set.

3.  Identify the current QA Worker deployment and rollback deployment/reference.

4.  Confirm the QA D1 database/binding and the current schema_migrations ledger.

5.  Run the Day 1–Day 4 regression suites that define the starting baseline. Record totals and failures.

6.  Retrieve one known-good BMR from Day 4 that has at least one current governed finding suitable for Day 5 care-chain testing.

7.  Capture the starting BMR IDs, finding IDs/versions, BMR status/version, and timeline state.

8.  Restate the single Day 5 outcome: governed care chain + non-authoritative adapters. Do not add unrelated product/UI scope.

### 3.3 Required baseline record

| Artifact | Required starting state |
| --- | --- |
| BMR | Existing QA bmr_id, same venture as prior days, current and retrievable. |
| Finding | Current, supported finding with explicit confirmation_status and version. |
| Actor | Approved operator/Business Physician test actor with route/entity scope. |
| Correlation | New correlation IDs generated per operation; evidence captures them. |
| Rollback | Prior passing commit/deployment identified before Day 5 edits. |

## 4. Day 5 Repository Ownership and File Plan

The source contract assigns Day 5 primary repository ownership to recommendation/treatment/outcome/governance services and routes; adapters and the delivery ledger; and care fixtures/tests. The expanded canonical Worker tree already defines the intended module boundaries. Reuse files that already exist; create only missing contract files.

### 4.1 Day 5 implementation file set

| Path | Day 5 responsibility | Change rule |
| --- | --- | --- |
| worker/domain/recommendation-service.js | Create/revise versioned recommendations linked to finding(s). | Implement or complete; no SQL in route. |
| worker/repositories/recommendation-repository.js | Insert versions, finding links, current/history reads. | Parameterized D1 only; atomic with links. |
| worker/routes/recommendations.js | POST create; POST supersede/revision behavior. | Validate/auth/idempotency; call service. |
| worker/domain/treatment-service.js | Create/revise plan; activate only with approved care context; append events. | Enforce lifecycle and authority. |
| worker/repositories/treatment-repository.js | Insert plan versions/items; append treatment events; reads. | Plan+items atomic; events append-only. |
| worker/routes/treatments.js | Plan/revision/event routes. | Protected operator routes. |
| worker/domain/outcome-service.js | Record/revise sourced timed outcomes. | No inferred success. |
| worker/repositories/outcome-repository.js | Insert outcome version/evidence links; list by BMR/plan. | Preserve history. |
| worker/routes/outcomes.js | Outcome + feedback/care retrieval route integration. | Typed values; safe responses. |
| worker/domain/governance-service.js | Feedback/confirmation/archive/learning-candidate governance. | Human-authorized; no auto-promotion. |
| worker/repositories/governance-repository.js | Feedback, learning candidates, audit/journey append operations. | Append/version rules only. |
| worker/routes/governance.js | Confirm/reject/archive/learning-candidate endpoints. | Privileged and audited. |
| worker/repositories/adapter-repository.js | adapter_deliveries create/attempt/delivered/failed state. | Cannot alter canonical entity status. |
| worker/adapters/hubspot-adapter.js | Downstream approved commercial copy/reference. | Failure non-blocking. |
| worker/adapters/analytics-adapter.js | Safe event metadata handoff. | Failure non-blocking; no sensitive evidence. |
| worker/adapters/stripe-adapter.js | Verified provider event/payment fact handling. | Signature/replay verification first. |
| worker/adapters/notification-adapter.js | Approved template/recipient delivery. | Failure cannot change care state. |
| worker/http/routes.js / worker/router.js | Register exact Day 5 method/path metadata. | No duplicate business logic. |
| worker/routes/business-medical-records.js | Expose separated care current/history projection if not already present. | No mutable report blob. |
| worker/fixtures/canonical-bmr.js | Known-good governed Day 5 care fixture extensions. | QA-only data; no Production fixture import. |
| tests/day5-care.test.mjs | Recommended primary Day 5 test file consistent with naming convention. | Must map stable matrix IDs; no skipped BLOCK tests. |
| scripts/day5-smoke.mjs | Recommended QA smoke runner for Day 5 endpoints. | Fail nonzero on blocking defect. |
| release-evidence/day5/* | Day 5 build/test/D1/Human/rollback evidence. | Exact candidate identity required. |

### 4.2 Shared files that may need targeted edits

- worker/app.js: only if Day 5 route policy or post-commit adapter orchestration must be registered.
- worker/config/constants.js: only for source-defined Day 5 statuses/limits/error mapping not already centralized.
- worker/security/authorization.js: only to add exact operator/service/webhook route/entity policy needed by Day 5.
- worker/security/webhook-verification.js: only for Stripe/provider verification required by the existing contract.
- worker/lib/transactions.js and worker/lib/idempotency.js: reuse; modify only if a proven shared defect prevents atomicity/idempotency.
- package.json: add Day 5 scripts only if they do not weaken existing Day 1–Day 4 scripts.
- wrangler.json: do not change unless Day 5 requires an already-approved QA feature flag or adapter configuration name. Never change DB identity or Production entry merely for Day 5.
### 4.3 Files Day 5 should not rewrite

- worker/day1.js or the approved Production entry merely to expose Day 5 logic.
- Previously applied migration SQL content.
- Day 1–Day 4 fixtures/tests solely to hide a new regression.
- Existing GalviCare browser code unless a Day 5 test explicitly requires an approved operator/client connection and no alternative canonical API proof exists.
## 5. Canonical Architecture, Authorization, and Transaction Rules

### 5.1 One governed write path

> **Locked P0 path**
>
> Approved client/operator surface → Cloudflare Worker API → validation + identity + authorization + idempotency → domain service → D1 repository → canonical GalviVault record → structured response → non-blocking downstream adapter handoff.

### 5.2 Day 5 service invariants

| Service | Required operations | Binding invariant |
| --- | --- | --- |
| Recommendation | createRecommendation, reviseRecommendation | Must link to finding(s), code/protocol, rationale, status; revisions create versions. |
| Treatment | createTreatmentPlan, revisePlan, recordTreatmentEvent | Plan linked to approved care context; plan is versioned; events are append-only. |
| Outcome | recordOutcome, reviseMeasurement | Source, observed_at, and plan/recommendation relation required; no inference from missing data. |
| Governance | confirmRecord, rejectRecord, archiveEntity, createLearningCandidate | Authorized actor; append governance evidence; learning never auto-promotes. |

### 5.3 Authorization boundary

- Treatment-plan creation, approval/activation, governed confirmation/rejection, archive, learning review/approval, and adapter retry are operator/approved-service actions, never trust body-supplied role identifiers.
- Public journey callers cannot activate treatment or archive BMRs.
- Future AI/service callers may propose governed content but cannot confirm findings, approve treatment, approve learning, or directly mutate canonical truth.
- Stripe/payment facts are accepted only from verified provider events; query-string/client claims do not grant entitlement.
### 5.4 Transaction boundaries

| Operation | Must commit atomically |
| --- | --- |
| Create recommendation | Recommendation version + all finding links + domain event + audit + idempotency receipt where declared. |
| Create treatment plan | Plan version + all ordered items + care links + domain event + audit + idempotency receipt. |
| Transition BMR to treatment_active | Expected-version/lifecycle validation + BMR state/version + lifecycle event + audit + idempotency receipt. |
| Record outcome | Outcome version + optional evidence links + care relationship + event/audit; no partial relationship state. |

### 5.5 Canonical response rule

```json
{
  "success": true,
  "status": "ok | created | resumed | updated | no_change | accepted",
  "environment": "qa | production",
  "correlation_id": "corr_...",
  "data": { "...": "authoritative committed state" },
  "meta": {
    "api_version": "v1",
    "schema_version": "0001-or-current",
    "record_version": 1,
    "idempotent_replay": false
  }
}
```

Every error must use the same canonical JSON envelope, safe GV_* code, environment, and correlation ID. No raw SQL, stack trace, token, database identifier, or sensitive payload may leak to the caller.

## 6. Day 5 D1 Data Contract and Migration Discipline

The authoritative baseline migration includes the Day 5 care/governance/adapter tables. Therefore Day 5 begins by verifying the current schema, not by automatically creating a new migration. If the current QA database/repository is missing a contract element, Codex must treat it as schema drift and repair it through the next unused additive forward-only migration. Never edit an already-applied migration.

### 6.1 Day 5 table inventory

| Table | Purpose | Mutation model |
| --- | --- | --- |
| recommendations | Governed action versions. | Versioned |
| recommendation_findings | Recommendation-to-finding lineage. | Append-only links |
| treatment_plans | Approved treatment plan versions. | Versioned |
| treatment_plan_items | Actions/tasks within one plan version. | Plan-version scoped |
| treatment_events | Execution/adherence/status events. | Append-only |
| outcomes | Observed results/measurements. | Append/versioned correction |
| outcome_evidence | Outcome support/source evidence links. | Append-only |
| feedback | Confirmation/rejection/correction signals. | Append-only |
| learning_candidates | Governed proposal for future rule/content change. | No auto-promotion |
| knowledge_items | Approved versioned reusable knowledge/rule/content. | Versioned |
| adapter_deliveries | Non-canonical downstream delivery attempts. | Operational status |
| audit_log | Who/what/why/when for material changes. | Append-only |
| idempotency_keys | Request fingerprint and committed result receipt. | Immutable key/fingerprint |

### 6.2 Required Day 5 indexes / database protections

- idx_recommendations_bmr on recommendations(bmr_id, status, created_at)
- idx_treatment_plans_bmr on treatment_plans(bmr_id, status, created_at)
- idx_treatment_events_plan on treatment_events(treatment_plan_id, occurred_at)
- idx_outcomes_bmr on outcomes(bmr_id, observed_at)
- idx_feedback_target on feedback(target_type, target_id, created_at)
- idx_adapter_status on adapter_deliveries(status, next_attempt_at)
- Append-only trigger on treatment_events UPDATE and DELETE.
- Existing audit_log and journey_events append-only protections must remain intact.
### 6.3 Migration decision tree

1.  Query schema_migrations and sqlite_master before code changes.

2.  If all Day 5 tables, constraints, indexes, and triggers exist and match the authoritative contract: do not create a Day 5 schema migration.

3.  If a required contract element is absent because the migration has not been applied: apply the existing approved migration through the environment-specific process; verify the ledger and schema.

4.  If an already-applied migration is missing/incorrect relative to the contract: do not edit it. Create the next unused additive migration ID under migrations/day5/ using the existing repository sequence.

5.  The additive repair migration may add missing indexes/tables/columns/constraints only when safe and approved; it must not delete canonical rows or destructively rewrite history.

6.  Run clean-database and upgraded-database verification appropriate to the change, then record the exact migration ID in Day 5 evidence.

> **Migration stop condition**
>
> If the only way to make Day 5 pass appears to require destructive migration, table recreation with data loss, Production-first testing, or a second persistence authority, STOP and escalate as a contract/architecture exception.

## 7. Day 5 Domain and BMR Lifecycle Contract

### 7.1 Care-chain record separation

| Record class | Question it answers | Required Day 5 behavior |
| --- | --- | --- |
| Finding | What supported conclusion is current? | Must remain independently versioned/confirmed; recommendation links to it. |
| Recommendation | What governed action addresses finding(s)? | Proposed/approved action; revision creates new version. |
| Treatment plan | What intervention will be executed, by whom, when, toward what outcomes? | Approved plan + ordered items; revision creates plan version. |
| Treatment event | What execution/adherence event occurred? | Append-only event with occurred_at and actor. |
| Outcome | What happened after recommendation/treatment? | Observed result with source and time; correction/version, not overwrite. |
| Feedback | Was a record confirmed, rejected, corrected, clarified, or commented on? | Append-only governance signal; target remains unchanged. |
| Learning candidate | What future rule/content change should be reviewed? | Proposal only; runtime knowledge remains unchanged until separate governed release. |

### 7.2 BMR lifecycle states relevant to Day 5

| From | To | Actor | Precondition | Domain event |
| --- | --- | --- | --- | --- |
| under_review | treatment_active | operator/clinician | Approved treatment plan exists. | treatment_started |
| active | treatment_active | operator/clinician | Approved findings/recommendation and plan exist. | treatment_started |
| treatment_active | monitoring | operator/clinician | Intervention phase complete; outcome monitoring begins. | monitoring_started |
| monitoring | treatment_active | operator/clinician | Plan revised/reactivated. | treatment_reactivated |
| monitoring | active | operator | Monitoring complete; record remains open. | monitoring_completed |
| monitoring | closed | operator | Closure criteria/reason satisfied. | care_episode_closed |
| closed | active | operator | Approved care reopening reason. | bmr_reopened |

### 7.3 Day 5 lifecycle prohibitions

- created → treatment_active without active BMR and approved care artifacts.
- under_review → monitoring without approved treatment/recommendation context.
- Any treatment_active transition without an approved/active plan for the same BMR.
- Any lifecycle decision based only on client-side current_stage, payment status, or rendered report state.
- Any stale expected_version update that creates partial rows/events.
### 7.4 Day 5 identifiers and status enums

| Type | Prefix / status contract |
| --- | --- |
| Recommendation | rec_ row ID + stable recommendation group; proposed, approved, declined, superseded, completed, archived |
| Treatment plan | trp_ row ID + stable plan group; draft, approved, active, paused, completed, cancelled, superseded, archived |
| Treatment item | planned, in_progress, blocked, completed, cancelled |
| Outcome | out_ row ID + stable outcome group; observed, confirmed, rejected, superseded, archived |
| Learning candidate | proposed, under_review, approved, rejected, released, archived |
| Adapter delivery | pending, attempting, delivered, failed, dead_letter, cancelled |

## 8. Step-by-Step Day 5 Build Procedure

> **Build order**
>
> Implement repositories/domain behavior first → then routes and authorization → then care retrieval → then downstream adapters → then QA deployment. Do not begin with UI/integrations and work backward into canonical rules.

### 8.1 Step 5.0 — Pre-build inspection and contract map

1.  Inventory whether the Day 5 service/repository/route/adaptor files already exist and whether they are stubs, partial, or functional.

2.  Map each existing function to the authoritative operations: create/revise recommendation; create/revise plan; append treatment event; record/revise outcome; feedback/learning governance; adapter delivery/retry.

3.  Inspect current route registration and route metadata. Identify which Day 5 endpoints already exist and which are missing.

4.  Inspect D1 schema and migration ledger for all Day 5 tables/indexes/triggers.

5.  Inspect authorization policy for operator, service, public journey, and webhook actor classes.

6.  Create a Day 5 test-ID traceability list before implementation so no BLOCK scenario is forgotten.

### 8.2 Step 5.1 — Implement recommendations

1.  Validate bmr_id and finding_ids against the same BMR. Reject missing or cross-BMR finding lineage.

2.  Require at least one current finding plus an approved recommendation_code/protocol or authorized operator source.

3.  Validate title, action_text, rationale, priority, source_type/source_version, status, and actor context.

4.  Generate server-side recommendation row/group identifiers. Client payloads do not select canonical IDs.

5.  Create the recommendation version and all recommendation_findings links in one logical atomic operation.

6.  Emit recommendation_created and append audit evidence with correlation ID and source/version context.

7.  For a material revision, create a new recommendation version; set supersession relationship/status without deleting the prior version.

8.  Approval, decline, completion, and archive must be explicit governed status changes. Never infer approval from a report, payment event, or client button.

9.  Current care retrieval must return the latest active/non-superseded recommendation while operator history can retrieve prior versions.

> **Recommendation failure behavior**
>
> Recommendation without finding(s) must fail with GV_LINEAGE_REQUIRED / 422 and create zero recommendation/link/event/audit rows for that failed operation.

### 8.3 Step 5.2 — Implement treatment plans and events

1.  Authenticate and authorize the operator/clinical actor before plan creation.

2.  Verify the BMR is valid and the plan references approved/current care context (recommendation(s) and/or finding(s) for the same BMR).

3.  Validate treatment_code, title/objective, owner, start_date, target_end_date, target outcomes, and ordered items.

4.  Validate every plan item before persistence. A single invalid item must prevent the entire plan/items write.

5.  Insert the treatment plan version and all ordered plan items atomically. No orphan or partial plan is permitted.

6.  Emit treatment_plan_created and audit evidence. Preserve all canonical IDs/correlation.

7.  Approve/activate only after lifecycle preconditions pass. Transition BMR to treatment_active with expected-version validation and lifecycle event/audit.

8.  On revision, insert a new plan version and new version-scoped items; link supersedes_treatment_plan_id; preserve version 1 and historical items.

9.  Append execution/adherence/status treatment_events. Never UPDATE or DELETE an existing historical event.

10.  When treatment completes and follow-up begins, use the governed lifecycle transition to monitoring; do not infer from UI stage.

> **Treatment atomicity test**
>
> Force one invalid plan item. Expected: API 4xx/422, no treatment_plans row, no treatment_plan_items row, no treatment event/audit for the rejected plan operation.

### 8.4 Step 5.3 — Implement outcomes and feedback

1.  Require bmr_id and a valid relationship to treatment_plan_id and/or recommendation_id as contracted.

2.  Require outcome_code, outcome_type, observed_at, source_type/source_ref, and exactly/validly typed value fields as appropriate.

3.  Validate optional evidence links against the same BMR and persist outcome_evidence links with the outcome.

4.  Do not synthesize success/failure from absence of an outcome. Missing observation is missing data.

5.  If a measurement is materially corrected, create a new outcome version with supersedes_outcome_id; do not rewrite the prior result.

6.  Create feedback as a separate append-only record with target_type, target_id, feedback_type, disposition/comment, actor/source.

7.  Prove target rows remain unchanged after confirm/reject/correct/clarify/comment feedback.

8.  Use the authorized governance confirmation route for finding confirmations; do not let generic feedback bypass authorization.

### 8.5 Step 5.3B — Implement learning candidates

1.  Accept candidate_type, title/proposed change, source case references, rationale, risk summary, and proposer context.

2.  Create the record with status proposed.

3.  Do not modify active knowledge_items, runtime rule selection, recommendation logic, or another venture's canonical care state.

4.  Reject AI/service attempts to approve or release a learning candidate when that actor lacks governance authority.

5.  Authorized review/approval may update the governance status and audit trail, but runtime knowledge remains unchanged until a separate governed knowledge release.

### 8.6 Step 5.3C — Extend BMR care retrieval

1.  Implement/verify GET /api/v1/business-medical-records/{bmr_id}/care with current/history filters.

2.  Return separated typed collections: recommendations, treatment plans, plan items/events as appropriate, outcomes, and feedback.

3.  Current mode returns current/non-superseded approved/active state according to status rules.

4.  History mode requires operator authorization, is bounded/paginated, and preserves version/supersession/event chronology.

5.  Do not return an undifferentiated report blob. Do not expose protected operator/audit fields to customer-scoped callers.

6.  Ensure the BMR timeline can incorporate Day 5 care/outcome/feedback/governance entries as typed chronological events without breaking the Day 4 timeline contract.

### 8.7 Step 5.4 — Implement downstream adapters

| Adapter | Canonical input | Failure behavior | Required proof |
| --- | --- | --- | --- |
| HubSpot | Approved founder/venture commercial facts + canonical IDs. | Record failed delivery; canonical BMR/care remains committed. | Forced failure still returns core success. |
| Analytics | Safe event name, stage/product, canonical IDs, non-sensitive metadata. | Log/queue failure; canonical journey event remains. | D1 event exists on analytics failure. |
| Stripe/payment | Verified provider event only. | Reject invalid signature/replay; no entitlement from query string. | Provider event replay is idempotent. |
| Notification | Approved template code + recipient reference. | Delivery failure cannot change recommendation/treatment status. | adapter_deliveries retry count/status. |
| Future AI | Governed proposal input/output references. | Cannot confirm/approve/mutate canonical truth. | Authorization rejects direct mutation. |

1.  Create the canonical record/event first. Adapter orchestration occurs only after canonical success.

2.  Create/resolve one adapter_deliveries row per adapter + source_event_id. Duplicate source event must not create duplicate delivery rows.

3.  Record status, attempt_count, next_attempt_at, safe error code/message, correlation ID, external ID where appropriate.

4.  Use bounded retry/reconciliation. Authorized retry changes only delivery attempt state; it must not rewrite the canonical entity result.

5.  Redact sensitive evidence, secrets, payment details, raw SQL, and unbounded payloads from adapter logs and delivery error fields.

### 8.8 Step 5.5 — Wire routes, package scripts, fixtures, and evidence

1.  Register Day 5 routes in the canonical route table/router; do not create a parallel compatibility implementation.

2.  Reuse standard request parsing, CORS, authentication, authorization, redaction, response, error, correlation, idempotency, and transaction helpers.

3.  Extend the QA known-good canonical BMR fixture with a current finding, operator actor, recommendation/treatment/outcome inputs, and controlled adapter fault configuration.

4.  Add the primary Day 5 automated test file and package script using the repository naming convention if not already present.

5.  Add a Day 5 smoke script that calls QA endpoints and exits nonzero on any blocking contract mismatch.

6.  Create release-evidence/day5 and capture candidate identity, test report, D1 assertions, adapter-failure proof, Human E2E, and rollback reference.

## 9. Day 5 REST API Contract and Request Shapes

### 9.1 Standard request/response headers

| Header | Contract |
| --- | --- |
| Content-Type: application/json | Required for JSON writes; otherwise 415. |
| Idempotency-Key | Required for declared writes; 1–128 safe chars; mismatch reuse returns 409. |
| X-Correlation-Id | Optional inbound, required response; invalid/missing values are replaced server-side. |
| X-GalviVault-Environment | Response must identify qa on Day 5 QA deployment. |
| X-GalviVault-Api-Version | Response v1. |
| Authorization | Required on protected operator/service routes; never echoed. |
| Provider signature | Webhook only; validate signature/timestamp/provider event/replay before trusting facts. |

### 9.2 Day 5 route inventory

| Route | Key fields | Invariant |
| --- | --- | --- |
| POST /api/v1/recommendations | bmr_id, finding_ids, recommendation_code, title/action/rationale, priority, source/rule version | At least one finding; explicit status; versioned. |
| POST /api/v1/recommendations/{id}/supersede | updated recommendation, reason, expected version as implementation requires | New version; history preserved. |
| POST /api/v1/treatment-plans | bmr_id, recommendation_ids/finding_ids, treatment_code, objective, target outcomes, owner, dates, items | Authorized action; plan + items atomic. |
| POST /api/v1/treatment-plans/{plan_id}/revisions | expected_version, changed plan/items, reason | New plan version; prior plan remains. |
| POST /api/v1/treatment-plans/{plan_id}/events | event_type, occurred_at, actor, safe notes/metadata | Append-only execution/adherence event. |
| POST /api/v1/outcomes | bmr_id, plan/recommendation relation, outcome_code, typed value, observed_at, source, evidence links | Source/time/relation required; no inferred success. |
| POST /api/v1/feedback | bmr_id, target_type/id, feedback_type, disposition, actor/source | Append governance signal; no target overwrite. |
| GET /api/v1/business-medical-records/{bmr_id}/care | current/history filters | Separated recommendations/plans/events/outcomes/feedback. |
| POST /api/v1/governance/confirmations | typed target, confirm/reject, reason, expected version | Authorized operator; audit appended. |
| POST /api/v1/learning-candidates | candidate, source cases, rationale, proposed change | Status proposed only. |
| POST /api/v1/webhooks/stripe | verified provider body/signature | Reject invalid/replay; approved payment fact only. |
| POST /api/v1/adapters/{adapter}/retry | failed delivery reference | Retry delivery only; canonical result unchanged. |

### 9.3 Builder request examples

The authoritative source defines required fields/invariants but does not prescribe every JSON property name for nested Day 5 payloads. The following examples are implementation shapes for Codex to map onto the existing repository validators; do not treat them as permission to add new product scope.

#### Recommendation create

```http
POST /api/v1/recommendations
Authorization: Bearer <operator-session>
Idempotency-Key: day5-rec-001

{
  "bmr_id": "bmr_...",
  "finding_ids": ["fnd_..."],
  "recommendation_code": "REC_P0_001",
  "title": "Focus the next intervention",
  "action": "Execute the approved action",
  "rationale": "Addresses the confirmed finding.",
  "priority": 1,
  "source_type": "operator_protocol",
  "source_version": "v1",
  "status": "proposed"
}
```

#### Treatment plan create

```http
POST /api/v1/treatment-plans
Authorization: Bearer <operator-session>
Idempotency-Key: day5-plan-001

{
  "bmr_id": "bmr_...",
  "recommendation_ids": ["rec_..."],
  "finding_ids": ["fnd_..."],
  "treatment_code": "TRT_P0_001",
  "title": "Approved treatment plan",
  "objective": "Produce the target business-health outcome.",
  "owner": {"actor_type": "operator", "actor_id": "op_..."},
  "start_date": "2026-08-07",
  "target_end_date": "2026-08-21",
  "target_outcomes": ["OUTCOME_P0_001"],
  "items": [
    {"sequence_no": 1, "action_code": "ACT_001", "description": "First approved action", "status": "planned"},
    {"sequence_no": 2, "action_code": "ACT_002", "description": "Second approved action", "status": "planned"}
  ]
}
```

#### Treatment event

```http
POST /api/v1/treatment-plans/trp_.../events
Authorization: Bearer <operator-session>

{
  "event_type": "execution_completed",
  "occurred_at": "2026-08-07T15:00:00.000Z",
  "notes": "Safe operational summary only.",
  "metadata": {"item_sequence_no": 1}
}
```

#### Outcome

```http
POST /api/v1/outcomes
Authorization: Bearer <operator-session>

{
  "bmr_id": "bmr_...",
  "treatment_plan_id": "trp_...",
  "recommendation_id": "rec_...",
  "outcome_code": "OUTCOME_P0_001",
  "outcome_type": "number",
  "value_number": 75,
  "observed_at": "2026-08-07T16:00:00.000Z",
  "source_type": "operator_observation",
  "source_ref": "day5-human-e2e",
  "evidence_ids": ["evd_..."]
}
```

#### Feedback

```http
POST /api/v1/feedback
Authorization: Bearer <operator-session>

{
  "bmr_id": "bmr_...",
  "target_type": "recommendation",
  "target_id": "rec_...",
  "feedback_type": "confirm",
  "disposition": "accepted",
  "comment": "Confirmed for the current care episode.",
  "source": "operator"
}
```

#### Learning candidate

```http
POST /api/v1/learning-candidates
Authorization: Bearer <operator-session>

{
  "candidate_type": "protocol_change",
  "title": "Proposed future protocol adjustment",
  "proposed_change": {"proposal": "review only"},
  "source_bmr_ids": ["bmr_..."],
  "rationale": "Observed pattern for later human review.",
  "risk_summary": "Must not alter active runtime logic."
}
```

## 10. Day 5 Direct D1 Verification Queries

Substitute only approved QA IDs. Release evidence should capture IDs, statuses, counts, versions, timestamps, and safe metadata — not sensitive evidence payloads.

```sql
-- Recommendation versions and finding lineage
SELECT recommendation_group_id, recommendation_id, version_no,
       supersedes_recommendation_id, recommendation_code, status, created_at
FROM recommendations
WHERE bmr_id = ?
ORDER BY recommendation_group_id, version_no;

SELECT rf.recommendation_id, rf.finding_id, rf.relationship_type, rf.created_at
FROM recommendation_findings rf
JOIN recommendations r ON r.recommendation_id = rf.recommendation_id
WHERE r.bmr_id = ?
ORDER BY rf.created_at;

-- Treatment plan versions and items
SELECT treatment_plan_group_id, treatment_plan_id, version_no,
       supersedes_treatment_plan_id, treatment_code, status, created_at, updated_at
FROM treatment_plans
WHERE bmr_id = ?
ORDER BY treatment_plan_group_id, version_no;

SELECT treatment_plan_id, sequence_no, action_code, description, status, target_date
FROM treatment_plan_items
WHERE treatment_plan_id IN (
  SELECT treatment_plan_id FROM treatment_plans WHERE bmr_id = ?
)
ORDER BY treatment_plan_id, sequence_no;

-- Append-only treatment events
SELECT treatment_event_id, treatment_plan_id, event_type, occurred_at,
       actor_type, actor_id, created_at
FROM treatment_events
WHERE bmr_id = ?
ORDER BY occurred_at, created_at;

-- Outcomes and evidence relationships
SELECT outcome_group_id, outcome_id, version_no, supersedes_outcome_id,
       treatment_plan_id, recommendation_id, outcome_code, outcome_type,
       observed_at, source_type, status, created_at
FROM outcomes
WHERE bmr_id = ?
ORDER BY outcome_group_id, version_no;

SELECT oe.outcome_id, oe.evidence_id, oe.relationship_type, oe.created_at
FROM outcome_evidence oe
JOIN outcomes o ON o.outcome_id = oe.outcome_id
WHERE o.bmr_id = ?
ORDER BY oe.created_at;

-- Append-only feedback
SELECT feedback_id, target_type, target_id, feedback_type,
       disposition, actor_type, source, created_at
FROM feedback
WHERE bmr_id = ?
ORDER BY created_at;

-- Learning candidates and active knowledge comparison
SELECT learning_candidate_id, candidate_type, status, proposed_by_type,
       reviewed_by_type, release_version, created_at, updated_at
FROM learning_candidates
ORDER BY created_at DESC;

SELECT knowledge_code, version_no, status, effective_at, retired_at
FROM knowledge_items
WHERE status = 'active'
ORDER BY knowledge_code, version_no;

-- Adapter delivery status
SELECT adapter_delivery_id, adapter_name, event_type, entity_type, entity_id,
       source_event_id, status, attempt_count, next_attempt_at,
       safe_error_code, correlation_id, created_at, updated_at
FROM adapter_deliveries
WHERE entity_id = ? OR correlation_id = ?
ORDER BY created_at;

-- BMR lifecycle
SELECT bmr_id, venture_id, status, record_version, current_session_id, updated_at
FROM business_medical_records
WHERE bmr_id = ?;

-- Audit trail for Day 5 correlations
SELECT entity_type, entity_id, operation, prior_version, new_version,
       actor_type, source, reason_code, correlation_id, occurred_at
FROM audit_log
WHERE correlation_id IN (?, ?, ?, ?)
ORDER BY occurred_at;
```

### 10.1 Required negative database proofs

- Recommendation-without-finding attempt leaves recommendations and recommendation_findings counts unchanged.
- Unauthorized treatment attempt leaves treatment_plans and treatment_plan_items counts unchanged.
- Invalid plan-item attempt leaves no partial plan or item rows.
- Stale version attempt leaves prior version and audit/event counts unchanged for the rejected mutation.
- Treatment event UPDATE and DELETE attempts are rejected by the append-only trigger.
- Feedback append leaves target row/version/hash/state unchanged unless a separate authorized target mutation is explicitly invoked.
- Learning candidate creation leaves active knowledge_items selection unchanged.
- Forced adapter failure leaves canonical recommendation/treatment/outcome rows committed and adds/updates adapter_deliveries only.
## 11. Day 5 Automated QA Matrix

The following stable test IDs are the authoritative minimum Day 5 automated verification set. Equivalent file organization is allowed; omitting a BLOCK behavior is not.

| Test ID | Category | Scenario | Expected result | Proof |
| --- | --- | --- | --- | --- |
| MG-011 | Migration | Treatment event append-only trigger. | Update/delete aborts. | DB trigger |
| SC-009 | Security | Future AI attempts canonical confirmation. | 403; proposal-only capability. | HTTP + DB |
| SC-010 | Security | Invalid webhook signature/replay. | Rejected; no payment/canonical fact. | HTTP + DB |
| IP-005 | Idempotency | Treatment plan exact replay. | Same plan/version/items; no duplicate event. | HTTP + DB counts |
| IP-006 | Idempotency | Webhook provider event replay. | Accepted/no_change; one provider fact/delivery. | HTTP + DB |
| LC-005 | Lifecycle | treatment_active without plan. | 409; no state change. | HTTP + DB |
| LC-006 | Lifecycle | Activate with approved plan. | BMR treatment_active; event/audit. | HTTP + DB |
| LC-007 | Lifecycle | treatment_active → monitoring → active/closed. | Only valid preconditions; history preserved. | HTTP + DB |
| LC-011 | Lifecycle | Archive via public caller. | 403; no state change. | HTTP + DB |
| LC-012 | Lifecycle | Reopen closed BMR authorized. | Active version increment + event/audit. | HTTP + DB |
| CR-001 | Care | Recommendation without finding. | 422; no row. | HTTP + DB |
| CR-002 | Care | Recommendation with finding. | Version row + link + event/audit. | HTTP + DB |
| CR-003 | Care | Supersede recommendation. | New version; prior retained. | HTTP + DB |
| CR-004 | Care | Treatment plan unauthenticated/unauthorized. | 401/403; no plan/items. | HTTP + DB |
| CR-005 | Care | Treatment plan valid. | Plan + items atomic; event/audit. | HTTP + DB |
| CR-006 | Care | Plan item failure/invalid. | No partial plan/items. | HTTP + DB |
| CR-007 | Care | Revise plan. | Version 2; version 1/items/events retained. | HTTP + DB |
| CR-008 | Care | Treatment event append. | New event; update/delete blocked. | HTTP + DB |
| CR-009 | Care | Outcome without source/time. | 422; no row. | HTTP + DB |
| CR-010 | Care | Valid outcome. | Outcome + relation/evidence + event/audit. | HTTP + DB |
| CR-011 | Care | Feedback confirm/reject/correct. | Append feedback; target row unchanged. | HTTP + DB hash |
| CR-012 | Care | Current care/history retrieval. | Separated current/history versions/events/outcomes. | HTTP + DB |
| LN-001 | Learning | Create learning candidate. | Status proposed; source/rationale stored. | HTTP + DB |
| LN-002 | Learning | AI/service attempts approval. | 403; status unchanged. | HTTP + DB |
| LN-003 | Learning | Authorized review/approval. | Governance/audit updated; active knowledge unchanged until release. | HTTP + DB |
| AD-001 | Adapter | HubSpot forced failure. | Canonical 2xx; delivery failed/pending. | HTTP + DB |
| AD-002 | Adapter | Analytics forced failure. | Journey event remains; delivery failure recorded. | HTTP + DB |
| AD-003 | Adapter | Notification forced failure. | Care status unchanged. | HTTP + DB |
| AD-004 | Adapter | Retry failed delivery. | Attempt count/status updated; canonical entity unchanged. | HTTP + DB |
| AD-005 | Adapter | Duplicate source event. | One adapter delivery per adapter/source event. | DB count |

### 11.1 Required regression on the Day 5 candidate

- RG-001 — Day 1 foundation suite remains green.
- RG-002 — Identity/continuity suite remains green.
- RG-003 — Evidence version/history suite remains green.
- RG-004 — Reasoning lineage/timeline suite remains green.
- Existing Production GalviCare smoke remains green; Day 5 must not introduce an unapproved regression before Day 7 cutover.
### 11.2 Automated QA execution order

1.  Static repository/configuration checks.

2.  Clean/local migration and schema assertions relevant to the candidate.

3.  Unit/domain tests.

4.  Repository integration tests against migrated test D1.

5.  API contract and security tests in the Worker harness.

6.  Integrated QA Worker + QA D1 smoke/workflow tests.

7.  Failure/recovery and adapter tests.

8.  Full Day 1–Day 5 regression and evidence manifest validation.

9.  Only after every applicable BLOCK test passes: Human E2E.

### 11.3 Test report contract

```json
{
  "suite": "galvivault-p0-day5",
  "candidate_commit": "<sha>",
  "environment": "local | qa",
  "worker_deployment": "<id-or-null>",
  "schema_version": "<current-ledger-version>",
  "started_at": "...",
  "completed_at": "...",
  "summary": {"total": 0, "passed": 0, "failed": 0, "skipped": 0},
  "blocking_failures": [],
  "tests": [
    {
      "id": "CR-005",
      "status": "pass",
      "duration_ms": 0,
      "correlation_id": "corr_...",
      "canonical_ids": ["bmr_...", "trp_..."],
      "evidence": ["release-evidence/day5/cr-005.json"]
    }
  ]
}
```

## 12. QA Deployment and Integrated Smoke

### 12.1 Pre-deploy gate

- Working tree contains only the intended Day 5 change set.
- Local Day 5 tests and Day 1–Day 4 regression pass.
- Required migration verification passes; no applied migration was modified.
- QA configuration still points to QA D1 and QA environment; Production entry/binding remains unchanged.
- No secrets or sensitive payloads appear in source, fixtures, evidence, or logs.
- Rollback commit/deployment is recorded.
### 12.2 Deploy only the QA candidate

1.  Deploy the exact candidate commit through the existing QA deployment path.

2.  Capture QA Worker deployment metadata/ID, commit SHA, branch, schema version, QA database identity/name reference, and timestamp.

3.  Call /health and /ready. Require canonical JSON, environment=qa, valid correlation, db readiness, and current schema >= required.

4.  Run the Day 5 smoke sequence using the known-good BMR/finding fixture.

5.  Run forced adapter-failure smoke in QA only.

6.  Rerun the full applicable Day 1–Day 5 automated BLOCK tests against the deployed QA candidate where the test layer requires remote proof.

### 12.3 Immediate deployment failure rule

> **Do not speculate around the exact failure**
>
> If QA deployment/readiness fails, use the exact failure as the next remediation target. Do not rewrite unrelated care logic, migrations, or GalviCare files. Preserve the prior working deployment and fix only the verified deployment/configuration defect.

## 13. Day 5 Human E2E — Governed Care Chain

Day 5 Human E2E may start from the already-proven Day 4 known-good BMR rather than recreating Days 1–4 manually. The start record must contain the canonical IDs and a current supported finding. The purpose is to prove the new care chain and its persistence/history.

| Step | Action | Expected result | Canonical proof |
| --- | --- | --- | --- |
| H5.1 | Retrieve known-good BMR + current finding. | BMR/finding versions match Day 4 baseline. | BMR/findings queries. |
| H5.2 | Create recommendation linked to the finding. | Versioned recommendation created with finding link. | recommendations + recommendation_findings + audit/event. |
| H5.3 | Attempt a recommendation with no finding. | 422; no new row/link. | Count before/after. |
| H5.4 | Attempt treatment-plan creation without authorization. | 401/403; no plan/items. | Plan/item counts unchanged. |
| H5.5 | Create approved treatment plan with ordered items as authorized operator. | Plan and all items commit atomically. | treatment_plans/items + audit/event. |
| H5.6 | Activate treatment / transition BMR to treatment_active. | Lifecycle preconditions pass; version increments. | BMR + lifecycle event/audit. |
| H5.7 | Record a treatment event. | Append-only event created. | treatment_events. |
| H5.8 | Revise the treatment plan. | New plan version; prior plan/items/event retained. | Plan version/history queries. |
| H5.9 | Attempt invalid outcome without source or observed_at. | 422; no outcome row. | Outcome count unchanged. |
| H5.10 | Record valid sourced/timed outcome linked to care. | Outcome and relation/evidence commit. | outcomes + outcome_evidence + audit/event. |
| H5.11 | Record feedback against recommendation/outcome/finding as approved. | Feedback appends; target row remains unchanged. | feedback + target snapshot/hash. |
| H5.12 | Create learning candidate. | Status proposed; no active knowledge change. | learning_candidates + knowledge_items comparison. |
| H5.13 | Retrieve BMR care current + history + timeline. | Separated current/history and typed chronological care entries. | HTTP IDs reconcile to D1. |
| H5.14 | Refresh/retrieve again. | Same canonical IDs/history; no duplicates. | D1 counts + API response. |

### 13.1 Evidence captured for every Human step

- Timestamp and exact candidate commit/deployment.
- Safe request summary and response status/body.
- Correlation ID.
- Canonical IDs created/used.
- Direct D1 proof with sensitive values omitted.
- Pass/fail and any defect ID.
## 14. Adapter Failure and Recovery Human E2E

| Step | Action | Pass condition |
| --- | --- | --- |
| H7.1 | Use QA fault configuration/approved stub to force HubSpot, analytics, or notification delivery failure. | Fault is controlled and identified. |
| H7.2 | Perform the canonical action that generates the adapter delivery. | Core API returns success; canonical record/event/audit commit. |
| H7.3 | Inspect adapter_deliveries. | failed/pending status, safe error, attempt_count, correlation present. |
| H7.4 | Retrieve BMR/current care. | Canonical record remains present and is not downgraded/rolled back. |
| H7.5 | Retry through authorized adapter retry route. | Attempt count/status changes; canonical entity remains unchanged. |

### 14.1 Stripe/payment negative proof

1.  Submit an invalid signature/provider verification scenario in the approved QA harness.

2.  Require GV_WEBHOOK_INVALID (400/401 as contracted) and zero canonical payment fact/entitlement mutation.

3.  Replay a previously accepted provider event ID.

4.  Require idempotent/no-change behavior and one provider fact/delivery record, not a duplicate.

### 14.2 Future AI negative proof

1.  Use a service/AI actor context that may propose but is not authorized to confirm/approve.

2.  Attempt direct canonical confirmation or learning approval.

3.  Require 403 and prove target/learning/knowledge state is unchanged.

## 15. Regression / Do-Not-Break Gate

### 15.1 Canonical invariants that must remain green

| Invariant | Regression proof |
| --- | --- |
| One BMR per venture | Day 2 identity/BMR duplicate tests. |
| Session belongs to one BMR/venture | Cross-BMR boundary tests. |
| Accepted evidence immutable | Day 3 update/supersession tests. |
| Observation/finding lineage | Day 4 lineage tests. |
| Reasoning current/history/timeline | Day 4 retrieval tests. |
| Customer protected view boundary | Security/view tests. |
| Canonical JSON envelope/error safety | Foundation HTTP tests. |
| QA/Production isolation | Static config + response environment proof. |
| Production GalviCare flow | Existing production-safe smoke evidence; no unapproved Day 5 change. |

### 15.2 Day 5 regression trigger rule

Any shared change to identity, migration, lifecycle, authorization, idempotency, response helpers, BMR retrieval, or route registration requires rerunning the full affected prior-day matrix — not only the Day 5 test that originally failed.

> **Production protection**
>
> Production remains untouched during Day 5. A green Day 5 QA build is not authorization to cut over Production. Production promotion is a Day 7 controlled decision.

## 16. Release Evidence Package and Daily Gate

### 16.1 Day 5 evidence directory

Recommended Day 5 evidence paths below extend the source release-evidence convention. If the repository already has a standardized evidence generator, use it rather than duplicating formats.

```text
release-evidence/
└── day5/
    ├── README.md
    ├── candidate-metadata.json
    ├── deployment-metadata.json
    ├── automated-tests.json
    ├── automated-tests.txt
    ├── database-assertions.sql
    ├── database-assertions.txt
    ├── care-chain-e2e.md
    ├── adapter-failure-e2e.md
    ├── defect-register.md
    ├── rollback.md
    └── daily-gate.md
```

### 16.2 Minimum evidence contents

| Evidence category | Required Day 5 contents |
| --- | --- |
| Candidate identity | Branch, commit, timestamp, QA Worker deployment, QA D1/schema version, changed-file inventory. |
| Automated QA | Every applicable Day 5 BLOCK test, regression totals, failed=0, required skipped=0. |
| Database proof | Recommendation lineage/version, plan/items atomicity, event append-only, outcome source/time/relation, feedback target unchanged, learning/knowledge separation, adapter status. |
| Human E2E | H5.* care-chain steps with response/correlation/IDs/D1 proof. |
| Adapter E2E | Forced failure + non-blocking canonical success + retry proof. |
| Security | Unauthorized treatment, AI governance, webhook invalid/replay, protected care/history behavior. |
| Rollback | Prior passing commit/deployment and instructions to restore QA application state. |
| Defects | Open blockers/highs = 0 for Day 5 GO; accepted non-blocking issues documented with owner/impact. |

### 16.3 Daily gate record

```text
GALVIVAULT P0 DAILY GATE
Day: 5
Date/time:
Branch and commit:
QA Worker deployment:
QA D1 database/migration:
Daily objective: Governed care chain + non-blocking adapters

Mandatory gate results:
- Scope:
- Repository/static:
- Migration/data:
- Worker/API:
- Security/privacy:
- Regression:
- Recovery/rollback:
- Human proof:

Automated tests: total / passed / failed / skipped
Blocking defects:
Accepted non-blocking defects:
Evidence paths/links:
Rollback commit/deployment:
Decision: GO | STOP | ROLLBACK
Decision owner and rationale:
Next-day starting baseline:
```

## 17. Stop / Go / Rollback Decision Rules

| Decision | Conditions | Required action |
| --- | --- | --- |
| GO — Day 5 complete | D5-01 through D5-06 pass; all applicable BLOCK tests pass; no required skip; Human care/adaptor proof complete; prior-day regressions green. | Freeze Day 5 commit/deployment/evidence as Day 6 starting baseline. |
| STOP — hold candidate | Any Day 5 BLOCK criterion fails, evidence is missing/contradictory, or a blocker/high defect remains. | Fix in QA; rerun failed test plus affected regression; do not advance to Day 6. |
| ROLLBACK | QA candidate becomes unstable or threatens data integrity / prior-day baseline. | Restore prior working Worker deployment/commit; preserve additive schema; capture failed-attempt evidence; repair from stable baseline. |

### 17.1 Day 5 pass declaration wording

> **DAY 5 BUILD PASS**
>
> Use this declaration only when the exact candidate commit/deployment/schema is identified, D5-01…D5-06 and the applicable automated matrix are green, direct D1 proof confirms the governed care chain and history, adapter failure is non-blocking, Day 1–Day 4 regression remains green, and no undocumented manual repair was required.

## 18. Defect Handling and Critical-Path Remediation

### 18.1 Failure handling rule

- A failed blocking criterion means Day 5 is not complete, even if unrelated tests are green.
- Do not change expected values, disable constraints, skip tests, or edit evidence to convert a failure into a pass.
- Fix the verified defect in QA and rerun the failed test plus the applicable regression scope.
- Identity, migration, lifecycle, security, canonical-data, or shared routing changes require the full affected matrix.
- If the QA state is unstable or data integrity is at risk, roll back to the recorded start-of-day commit/deployment.
### 18.2 Critical-path defect triage order

1.  Reproduce the exact failure on the candidate commit and capture correlation ID / safe error / failing test ID.

2.  Classify the failed contract: configuration, migration/schema, authorization, lineage, versioning, atomicity, lifecycle, adapter boundary, or regression.

3.  Inspect the narrowest authoritative layer first (route metadata → service invariant → repository/SQL → D1 state).

4.  Make the smallest change that resolves the proven root cause.

5.  Rerun the exact failing test.

6.  Rerun all tests that share the modified layer.

7.  Rerun Day 1–Day 5 regression if the fix touches shared infrastructure.

8.  Replace stale evidence with evidence from the new exact candidate; never mix artifacts from different commits/deployments.

### 18.3 Common Day 5 failure signatures

| Failure | Likely contract defect | Do not 'fix' by |
| --- | --- | --- |
| Recommendation created with no finding | Missing lineage validation/atomic link requirement. | Making finding_ids optional. |
| Plan exists but items partially missing | Transaction/validation ordering defect. | Retrying manually or inserting missing rows by hand. |
| BMR treatment_active without plan | Lifecycle precondition/authorization bypass. | Setting BMR status directly in SQL. |
| Plan revision deletes/replaces v1 | Versioning/supersession defect. | Updating prior row in place. |
| Outcome accepted with no observed_at/source | Domain validation defect. | Inventing current timestamp/source silently. |
| Feedback changes target | Governance separation defect. | Treating feedback as generic PATCH. |
| Learning approval changes active rule immediately | Governed-learning boundary defect. | Relaxing approval test. |
| Adapter failure returns canonical 5xx/rollback | Adapter executed inside critical transaction / wrong failure mapping. | Marking adapter as authoritative. |
| Retry changes recommendation/treatment status | Adapter repository/service boundary defect. | Coupling delivery status to care status. |

## 19. Codex End-to-End Execution Checklist

- [ ] Confirm Day 4 PASS evidence, branch, commit, QA deployment, QA D1, schema ledger, rollback reference.
- [ ] Run starting Day 1–Day 4 regression and record results.
- [ ] Inventory Day 5 files; reuse existing modules; create only missing contract files.
- [ ] Verify Day 5 schema tables/indexes/triggers; do not rewrite applied migrations.
- [ ] Implement recommendation repository/service/route and lineage/versioning.
- [ ] Implement treatment repository/service/route, atomic plan/items, lifecycle activation, append-only events.
- [ ] Implement outcome recording/versioning and evidence/care relationships.
- [ ] Implement feedback and learning-candidate governance without target/runtime overwrite.
- [ ] Implement/verify BMR care current/history retrieval and timeline integration.
- [ ] Implement adapter delivery ledger and HubSpot/analytics/Stripe/notification boundaries.
- [ ] Implement authorized retry and forced-failure test hooks for QA only.
- [ ] Run local Day 5 unit/domain/repository/API/security/idempotency tests.
- [ ] Run required Day 1–Day 4 regression locally.
- [ ] Deploy exact candidate to QA only and capture deployment metadata.
- [ ] Verify /health and /ready with qa environment and correct schema.
- [ ] Run integrated Day 5 BLOCK matrix and direct D1 assertions.
- [ ] Run Day 5 Human governed-care-chain E2E.
- [ ] Run adapter failure/recovery E2E and Stripe/AI negative checks.
- [ ] Rerun required regression after any shared-layer fix.
- [ ] Complete evidence package, defect register, rollback record, and daily gate.
- [ ] Declare GO only if D5-01…D5-06 and all applicable BLOCK tests pass with no required skips.
## 20. Required Day 5 Implementation Report

Codex must finish the Day 5 build with a concise evidence-indexed implementation report. The report summarizes proof; it does not replace tests or D1 evidence.

```text
GALVIVAULT P0 — DAY 5 IMPLEMENTATION REPORT

1. Candidate identity
- Branch:
- Commit:
- QA Worker deployment:
- QA D1 / schema version:
- Rollback reference:

2. Scope implemented
- Recommendation:
- Treatment:
- Outcome:
- Feedback/governance:
- Learning:
- Adapters:
- BMR care retrieval:

3. Files changed
- <path> — <why required>

4. Migration decision
- No schema migration required | Additive migration <ID>
- Verification evidence:

5. Automated QA
- Total / passed / failed / skipped:
- D5-01:
- D5-02:
- D5-03:
- D5-04:
- D5-05:
- D5-06:
- Prior-day regression:

6. Human E2E
- Care chain:
- Adapter failure/retry:
- Negative authorization/webhook/AI:
- D1 proof:

7. Defects
- Blocker/Critical/High:
- Accepted non-blocking:

8. Day 5 decision
- GO | STOP | ROLLBACK
- Rationale:
- Evidence paths:
- Day 6 starting baseline:
```

## Appendix A. Day 5 File Manifest

| Area | Canonical / recommended path | Required Day 5 role |
| --- | --- | --- |
| Domain | worker/domain/recommendation-service.js | Recommendation create/revision invariants. |
| Domain | worker/domain/treatment-service.js | Treatment plan/revision/event + lifecycle preconditions. |
| Domain | worker/domain/outcome-service.js | Outcome source/time/relation + revision. |
| Domain | worker/domain/governance-service.js | Feedback/confirmation/archive/learning governance. |
| Repository | worker/repositories/recommendation-repository.js | Recommendation versions + finding links. |
| Repository | worker/repositories/treatment-repository.js | Plan versions/items + append events. |
| Repository | worker/repositories/outcome-repository.js | Outcomes + evidence links. |
| Repository | worker/repositories/governance-repository.js | Feedback/learning/audit/journey append. |
| Repository | worker/repositories/adapter-repository.js | Delivery ledger. |
| Route | worker/routes/recommendations.js | Recommendation API. |
| Route | worker/routes/treatments.js | Plan/revision/event API. |
| Route | worker/routes/outcomes.js | Outcome/feedback/care-related API. |
| Route | worker/routes/governance.js | Governed privileged actions. |
| Adapter | worker/adapters/hubspot-adapter.js | Downstream CRM copy/reference. |
| Adapter | worker/adapters/analytics-adapter.js | Non-sensitive analytics handoff. |
| Adapter | worker/adapters/stripe-adapter.js | Verified payment fact boundary. |
| Adapter | worker/adapters/notification-adapter.js | Non-blocking notification. |
| Shared | worker/http/routes.js | Route registration metadata. |
| Shared | worker/security/authorization.js | Day 5 operator/service permissions. |
| Shared | worker/security/webhook-verification.js | Provider signature/replay. |
| Fixture | worker/fixtures/canonical-bmr.js | Known-good care-chain QA fixture. |
| Test | tests/day5-care.test.mjs | Recommended Day 5 primary matrix file. |
| Script | scripts/day5-smoke.mjs | Recommended integrated QA smoke. |
| Evidence | release-evidence/day5/ | Candidate/test/D1/Human/rollback evidence. |

> **Manifest convention**
>
> If an existing repository uses equivalent names/locations that already conform to the source's canonical module boundaries, do not move files simply for naming consistency. Record the mapping in the implementation report.

## Appendix B. Day 5 Schema Contract

### B.1 recommendations / lineage

```text
recommendations
- recommendation_id TEXT PRIMARY KEY
- recommendation_group_id TEXT NOT NULL
- version_no INTEGER >= 1
- supersedes_recommendation_id TEXT
- bmr_id TEXT NOT NULL
- recommendation_code TEXT NOT NULL
- title TEXT NOT NULL
- action_text TEXT NOT NULL
- rationale TEXT
- priority INTEGER
- source_type TEXT NOT NULL
- source_version TEXT
- status: proposed | approved | declined | superseded | completed | archived
- created_by_type / created_by_id / created_at
- UNIQUE (recommendation_group_id, version_no)
- FK to BMR and prior recommendation version

recommendation_findings
- recommendation_id + finding_id + relationship_type
- relationship_type: addresses | mitigates | monitors
- composite primary key; append-only relationship semantics
```

### B.2 treatment plans / items / events

```text
treatment_plans
- treatment_plan_id TEXT PRIMARY KEY
- treatment_plan_group_id TEXT NOT NULL
- version_no INTEGER >= 1
- supersedes_treatment_plan_id TEXT
- bmr_id TEXT NOT NULL
- treatment_code TEXT NOT NULL
- title TEXT NOT NULL
- objective TEXT NOT NULL
- owner_actor_type / owner_actor_id
- start_date / target_end_date
- status: draft | approved | active | paused | completed | cancelled | superseded | archived
- created_by_type / created_by_id / created_at / updated_at
- UNIQUE (treatment_plan_group_id, version_no)

treatment_plan_items
- treatment_plan_item_id TEXT PRIMARY KEY
- treatment_plan_id TEXT NOT NULL
- sequence_no INTEGER NOT NULL
- action_code / description / owner / target_date
- status: planned | in_progress | blocked | completed | cancelled
- UNIQUE (treatment_plan_id, sequence_no)

treatment_events
- treatment_event_id TEXT PRIMARY KEY
- treatment_plan_id / bmr_id
- event_type / occurred_at / actor_type / actor_id
- notes / metadata_json / created_at
- append-only trigger blocks UPDATE and DELETE
```

### B.3 outcomes / feedback / learning / adapter delivery

```text
outcomes
- outcome_id TEXT PRIMARY KEY
- outcome_group_id TEXT NOT NULL
- version_no INTEGER >= 1
- supersedes_outcome_id TEXT
- bmr_id TEXT NOT NULL
- treatment_plan_id / recommendation_id
- outcome_code / outcome_type
- value_text | value_number | value_boolean
- observed_at TEXT NOT NULL
- source_type TEXT NOT NULL / source_ref
- status: observed | confirmed | rejected | superseded | archived
- created_by_type / created_by_id / created_at
- UNIQUE (outcome_group_id, version_no)

outcome_evidence
- outcome_id + evidence_id + relationship_type
- relationship_type: supports | contradicts | documents

feedback
- feedback_id / bmr_id / target_type / target_id
- feedback_type: confirm | reject | correct | clarify | comment
- disposition / comment_text / actor_type / actor_id / source / created_at
- append-only signal; no target overwrite

learning_candidates
- candidate_type / title / proposed_change_json / source_bmr_ids_json
- rationale / risk_summary
- status starts proposed; under_review | approved | rejected | released | archived
- proposal/review fields; no automatic active-knowledge mutation

adapter_deliveries
- adapter_name / event_type / entity_type / entity_id / source_event_id
- status: pending | attempting | delivered | failed | dead_letter | cancelled
- attempt_count / next_attempt_at / external_id / safe_error_code/message
- correlation_id / created_at / updated_at
- UNIQUE (adapter_name, source_event_id)
```

## Appendix C. Error Codes and Required Failure Behavior

| Code | Meaning | HTTP |
| --- | --- | --- |
| GV_REQ_SCHEMA | Field/domain validation failed. | 422 |
| GV_AUTH_REQUIRED | Authentication required. | 401 |
| GV_AUTH_FORBIDDEN | Caller lacks route/entity scope. | 403 |
| GV_DB_UNAVAILABLE | D1 binding/query unavailable. | 503 |
| GV_DB_SCHEMA_OUTDATED | Required migration not applied. | 503 |
| GV_NOT_FOUND | Requested resource absent. | 404 |
| GV_IDEMPOTENCY_REQUIRED | Required Idempotency-Key missing. | 400 |
| GV_IDEMPOTENCY_REUSE_MISMATCH | Key reused with different fingerprint. | 409 |
| GV_VERSION_CONFLICT | Expected version does not match current version. | 409 |
| GV_LIFECYCLE_INVALID_TRANSITION | Requested BMR transition not permitted. | 409 |
| GV_LINEAGE_REQUIRED | Derived/care record lacks required support lineage. | 422 |
| GV_WEBHOOK_INVALID | Provider signature/replay validation failed. | 400/401 |
| GV_INTERNAL | Unexpected safe-mapped internal failure. | 500 |

### C.1 Day 5 error-safety rule

Every failure must leave canonical state unchanged unless the contract explicitly defines a committed partial operational record (for example, a failed adapter delivery after canonical success). The client receives a safe error envelope and correlation ID; sensitive payloads, SQL, tokens, stack traces, and environment secrets remain server-side and redacted.

## Appendix D. Command / Evidence Runbook

Use the repository's existing package scripts and current Wrangler syntax as the execution source. The source guide requires equivalent executable commands but does not mandate a fixed Day 5 package-script name. The following sequence is the required operational order.

| Phase | Required action |
| --- | --- |
| Baseline | Record branch/commit/status; run existing Day 1–Day 4 tests; capture rollback deployment. |
| Schema | Run migration verification / schema inventory; prove Day 5 tables/indexes/triggers and migration ledger. |
| Local Day 5 | Run the Day 5 care test suite and direct local D1 assertions. |
| Local regression | Run all prior-day suites affected by changes. |
| Static/security | Run import resolution, secret scan, route authorization, fixture/Production isolation checks. |
| QA deploy | Deploy exact candidate via existing QA script/path; capture deployment ID. |
| QA readiness | GET /health + /ready; confirm environment=qa and schema ready. |
| QA Day 5 | Run care endpoints, negative authorization/lineage/version cases, and D1 proof. |
| Adapter QA | Run forced failure + retry, webhook invalid/replay, AI governance negative proof. |
| Regression | Rerun Day 1–Day 5 BLOCK suites against final candidate as applicable. |
| Human E2E | Execute H5.* and adapter H7.* procedures; capture correlation/IDs/D1 proof. |
| Closeout | Generate evidence package, defect register, rollback record, daily gate, implementation report. |

### D.1 Final binary Day 5 checklist

- [ ] D5-01 recommendation finding/version proof PASS
- [ ] D5-02 treatment authorization/context/atomicity PASS
- [ ] D5-03 plan revision + treatment event history PASS
- [ ] D5-04 outcome source/time/relation + feedback non-overwrite PASS
- [ ] D5-05 learning candidate no runtime-knowledge mutation PASS
- [ ] D5-06 adapter failure non-blocking + delivery ledger PASS
- [ ] Day 1–Day 4 regression PASS
- [ ] QA environment/readiness PASS
- [ ] Human care-chain E2E PASS
- [ ] Adapter failure/recovery E2E PASS
- [ ] Blocking defects = 0
- [ ] Required skipped tests = 0
- [ ] Rollback reference recorded
- [ ] Evidence package tied to exact final commit/deployment/schema
> **DAY 5 COMPLETE**
>
> Only after every box above is objectively proven may Codex mark the fifth-day GalviVault build complete and hand the exact QA candidate baseline to Day 6 integration/hardening.
