# GALVIVAULT™ P0 — DAY 2 BUILDER GUIDE

**Codex Implementation Engineer Edition**

*Resolve • Relate • Preserve Canonical Identity and Continuous Record*

> **Authoritative derivative**
>
> This Day 2 Builder Guide is derived from the GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5, and uses the approved Day 1 Builder Guide as its execution-format model. It converts the governing identity, Business Medical Record, session-continuity, Worker, D1, QA, Human E2E, rollback, and evidence contracts into one executable Day 2 instruction set for Codex.

**Repository:** `mrgalvipro/galvitriage`  
**Implementation branch:** `qa-revamped-galvicare-0-5`  
**Production branch:** `main`  
August 2026 • Version 1.0

# Document Control and Builder Authority

| **Item** | **Binding value** |
| --- | --- |
| Document | GalviVault™ P0 Day 2 Builder Guide — Codex Implementation Engineer Edition |
| Source authority | GalviVault™ P0 Seven-Day Build, QA, and Production Readiness Implementation Guide, Version 0.5 |
| Execution-format precedent | GalviVault™ P0 Day 1 Builder Guide — Codex Implementation Engineer Edition, Version 1.0 |
| Repository | mrgalvipro/galvitriage |
| Implementation branch | qa-revamped-galvicare-0-5 |
| Production branch | main |
| Day 2 objective | Establish stable Founder, Venture, founder-to-venture role, Business Medical Record, and assessment-session identity so a person can leave and return without fragmented records. |
| Prerequisite | Day 1 BUILD FINAL with a clean migration, isolated QA Worker, QA D1 binding DB, deterministic envelopes, session/event foundation, and complete Day 1 evidence. |
| Canonical QA authority | Existing isolated QA Worker and QA D1 established on Day 1; extend the approved Day 1 entry and modules without redirecting Production. |
| Final status language | DAY 2 HUMAN E2E PASS → DAY 2 BUILD FINAL only when every blocking gate and required evidence artifact passes. |

> **No-assumption rule for Codex**
>
> Repository files, current QA deployment configuration, D1 identifiers, Day 1 evidence, migration ledger, and command output are authoritative. Codex must inspect the actual QA branch and deployed resources before editing. It must not reconstruct unseen contents from chat history, screenshots, or reports. A retrieval or platform failure must be recorded exactly and the dependent step stopped.

## How Codex must use this guide

1. Read Sections 1–5 before modifying any repository file. Confirm Day 1 completion and environment isolation first.
1. Retrieve the actual QA-branch versions of every Day 2 critical file and all Day 1 files that will be extended. Record the starting commit and deployment.
1. Build in the sequence defined in Sections 6–14. Do not deploy until local migration verification and the complete automated BLOCK matrix pass.
1. Preserve all Day 1 routes and behavior. Day 2 is additive: no replacement of the Day 1 Worker foundation, migration history, or Production entry.
1. Use complete replacement content for small critical files only after inspecting the current file. Prefer focused modules over a monolithic entry file.
1. Execute the Day 2 Human E2E exactly as written. API success without D1 identity, relationship, version, and no-duplicate proof is not a pass.
1. Complete release-evidence/day2 and a tested rollback record before declaring Day 2 complete.
1. Return a final implementation report containing exact changed files, commit, commands, results, QA deployment, D1 assertions, Human E2E evidence, defects, and final gate decision.

## Contents

- 1. Day 2 Executive Outcome and Definition of Done
- 2. Locked Architecture, Scope, and Do-Not-Break Rules
- 3. Day 1 Prerequisite Verification and Starting-State Inspection
- 4. Day 2 Repository Target and File Inventory
- 5. Canonical Identity, Ownership, and Continuity Contracts
- 6. Phase A — Freeze Day 1 Baseline and Establish Day 2 Evidence
- 7. Phase B — Domain Constants, Validation, Authentication, and Authorization
- 8. Phase C — Founder Identity
- 9. Phase D — Venture Identity and Founder–Venture Roles
- 10. Phase E — Canonical Business Medical Record
- 11. Phase F — Session Continuity and Returning-Founder Behavior
- 12. Phase G — REST Routes and Compatibility Actions
- 13. Phase H — Fixtures, Tests, Scripts, Documentation, and Evidence
- 14. Automated QA Matrix and Execution Order
- 15. Local and QA Deployment Runbook
- 16. Day 2 Human E2E Procedure
- 17. Acceptance Gate, Rollback, and Final Codex Handoff
- Appendix A — Day 2 API Contract
- Appendix B — Identity/BMR SQL Verification Queries
- Appendix C — Fixture Catalog and Expected Identity Sets
- Appendix D — Release-Evidence Templates
- Appendix E — Codex Final Implementation Report Template

# 1. Day 2 Executive Outcome and Definition of Done

Day 2 establishes the canonical identity and continuity layer on top of the proven Day 1 Worker + D1 foundation. It creates stable, server-governed identities for a Founder and Venture; explicitly relates them through a role; creates or retrieves exactly one Business Medical Record per Venture; and allows assessment sessions to resume or restart without duplicating the canonical record.

> **Day 2 outcome**
>
> A new founder and venture can be created or resolved through the QA Worker, related by an approved role, assigned exactly one canonical BMR, and attached to resumable assessment sessions. Retries, refreshes, case/whitespace differences, profile corrections, and a new session for the same venture preserve the same founder_id, venture_id, and bmr_id. A second venture for the same founder receives a new venture_id and BMR without duplicating the founder.

## 1.1 Required outputs

- Founder, Venture, founder-venture role, BMR, and session repositories and domain services at the approved canonical paths.
- REST routes and compatibility actions for create/resolve/update Founder and Venture, role attachment, create/get BMR, and create/resume/get session.
- One-BMR-per-venture enforcement through the existing unique constraint plus transaction-safe create-or-get logic.
- Stable canonical IDs generated or governed server-side and returned across retries, refreshes, and new sessions.
- Audited profile corrections using expected_version and record_version without replacing canonical IDs.
- Authorization and scope checks that never trust privileged role, owner, venture, or operator fields from the request body.
- Identity/continuity fixtures for new, returning, duplicate, incomplete, stale-version, cross-venture, and multi-venture cases.
- Automated tests, D1 assertions, Human E2E evidence, deployment metadata, and rollback record in release-evidence/day2.

## 1.2 Definition of Done

| **Dimension** | **Pass condition** |
| --- | --- |
| Prerequisite | Day 1 evidence is complete; Day 1 QA routes and Production baseline still pass. |
| Founder identity | Email normalization prevents case/whitespace duplicates; founder_id is server-governed and stable; permitted corrections increment record_version. |
| Venture identity | venture_id remains stable when mutable profile fields change; one founder can relate to multiple ventures without duplicate founder rows. |
| Role integrity | founder_venture_roles contains explicit approved role_code and is_primary context; privileged roles cannot be self-assigned. |
| BMR | Exactly one BMR exists per venture; create-or-get is idempotent; actual transitions emit events/audit while exact replay does not duplicate them. |
| Session continuity | Same session business key resumes the same session; a new session for the same venture creates only a new session_id and reuses founder_id, venture_id, and bmr_id. |
| Concurrency/versioning | Stale expected_version returns 409 GV_VERSION_CONFLICT and produces no profile or audit mutation. |
| Scope safety | Cross-venture mismatch returns 403/409 and produces no reassignment or partial write. |
| Automated QA | Every Day 2 BLOCK test passes; mandatory skipped count is zero; Day 1 regression passes. |
| Human E2E | New, returning, multi-session, multi-venture, profile-correction, duplicate, and negative-scope evidence passes with D1 proof. |
| Evidence | Day 2 package identifies branch, commit, deployment, QA D1, commands, test results, identity set, D1 assertions, defects, and rollback. |
| Final decision | Only then may Codex state: DAY 2 HUMAN E2E PASS → DAY 2 BUILD FINAL. |

## 1.3 Explicit non-goals

- Do not build assessment-answer/evidence versioning; that is Day 3.
- Do not build observations, hypotheses, findings, or BMR timeline reasoning; that is Day 4.
- Do not build recommendations, treatment plans, outcomes, feedback, or production adapters; that is Day 5.
- Do not promote to main or declare Production readiness.
- Do not redesign the existing Production Worker, GalviCare UI, Stripe, HubSpot, GA4, Clarity, Calendly, or Pages routing.
- Do not add autonomous AI, Make, Airtable writes, a second writable database, GraphQL, a new repository, or a new implementation branch.
- Do not perform broad historical identity merging or destructive data cleanup.

# 2. Locked Architecture, Scope, and Do-Not-Break Rules

## 2.1 Locked execution path

````text
Approved QA client or test harness
  -> isolated Cloudflare Worker QA deployment
  -> approved QA entry (Day 1 foundation extended additively)
  -> request/CORS/environment/authentication/authorization/error/response utilities
  -> versioned route or compatibility action
  -> Founder/Venture/BMR/Session domain service
  -> parameterized D1 repository
  -> QA D1 binding: DB
  -> transaction-safe canonical state + domain event/audit/idempotency receipt
  -> canonical JSON response
````

No browser, fixture, CRM, script, or adapter may write canonical Founder, Venture, role, BMR, or assessment-session state directly to D1 outside approved migration/test setup and Worker repositories.

## 2.2 Binding Day 2 decisions

| **Decision** | **Day 2 consequence** |
| --- | --- |
| D1 is the sole writable P0 system of record. | All canonical identity and BMR writes flow through DB. Browser state and external systems are non-authoritative. |
| One Worker is the runtime write authority. | No parallel identity implementation or direct D1 client path. |
| Canonical IDs are stable and server-governed. | Email, venture name, website, and session labels are lookup/profile data, not replaceable primary identities. |
| One BMR per venture. | UNIQUE(venture_id) plus create-or-get transaction logic; retries return the existing bmr_id. |
| Roles are explicit. | Authorization is based on approved actor/service context and persisted relationships, never client-declared privileged role fields. |
| Material profile changes are versioned and audited. | expected_version is required for updates; successful change increments record_version and writes audit evidence. |
| Writes are idempotent by declared business key. | Request fingerprint and key mismatch handling prevent the same key from being reused for a different semantic request. |
| QA and Production remain isolated. | Day 2 extends only QA resources and never changes Production routing or D1 bindings. |
| Canonical JSON envelope remains mandatory. | Every success/error includes correlation and environment context; no raw exception, SQL, stack trace, or HTML body. |
| Day 1 remains regression-protected. | Health, readiness, schema version, session/event foundation, fixture policy, and Production baseline must remain green. |

## 2.3 Do-not-break rules

- Do not overwrite or repurpose the Production entry point or point Production at the Day 2 QA entry.
- Do not rewrite the already-applied Day 1 migration. Day 2 schema changes, if genuinely needed, require a new additive migration.
- Do not delete, merge, archive, or manually edit canonical identities to force a test pass.
- Do not use normalized_email as founder_id or venture_name/website as venture_id.
- Do not allow request-body role_code, owner_id, actor_type, is_operator, or similar fields to grant privilege.
- Do not permit a profile update without expected_version.
- Do not return or log sensitive payloads, DB identifiers, secrets, SQL errors, or raw stack traces.
- Do not weaken, skip, or catch-and-ignore tests.
- Do not create another branch to bypass connector, merge, deployment, or test problems.
- At closeout, QA must be stable and evidenced or reverted to the Day 1 rollback point.

## 2.4 Stop conditions

| **Stop condition** | **Required response** |
| --- | --- |
| Day 1 final evidence or deployed QA baseline cannot be verified. | Stop Day 2. Re-establish the Day 1 approved baseline before editing. |
| QA and Production resources cannot be distinguished. | Stop configuration/deployment work until actual Worker and D1 targets are identified. |
| Current critical files cannot be retrieved. | Record exact connector/tool error; do not fabricate unseen content. |
| Day 1 regression fails before Day 2 changes. | Record as pre-existing and obtain Product Owner direction; do not overwrite Production. |
| Existing migration does not contain contracted identity/BMR constraints. | Stop and determine whether Day 1 is incomplete or an approved additive migration is required. |
| A BLOCK test fails or is skipped. | Stop acceptance; fix and rerun affected plus regression tests. |
| Human E2E requires direct D1 repair/browser manipulation. | Fail the run, reset the synthetic fixture, and correct implementation. |
| Secret/Production identifier is exposed. | Stop, rotate/remove if needed, scrub evidence, and rerun security checks. |

# 3. Day 1 Prerequisite Verification and Starting-State Inspection

## 3.1 Required retrieval set

| **Priority** | **Path/resource** | **Why inspect** |
| --- | --- | --- |
| Critical | package.json | Confirm Day 1 scripts/tooling and define additive Day 2 scripts without placeholders. |
| Critical | wrangler.json | Confirm QA entry, DB binding, environment variables, origins, and Production isolation. |
| Critical | worker/day1.js and current QA entry | Identify exact Day 1 routing/wiring and extend additively. |
| Critical | worker/domain, lib, routes, services, repositories | Reuse approved utilities; avoid duplicate abstractions. |
| Critical | migrations/day1/0001_canonical_business_medical_record.sql | Verify founders, ventures, roles, BMR, sessions, events, audit, idempotency, indexes, and unique constraints exist. |
| Critical | tests/day1-foundation.test.mjs + helpers | Preserve Day 1 contract and reuse proven test client/D1 assertions. |
| Critical | release-evidence/day1/* | Verify Day 1 final commit/deployment, QA D1, migration version, Human E2E, and rollback point. |
| Preserve | Production entry files and deployment | Establish regression baseline; no Day 2 functional edit. |
| Platform | QA Worker, QA D1, Production Worker/D1, Pages/public route | Prove environment isolation and record exact rollback references. |

## 3.2 Baseline capture procedure

1. Confirm repository and branch; record starting SHA.
1. Read release-evidence/day1 and verify its final commit matches the selected branch or document an approved later commit.
1. Run Day 1 file inventory, migration verification, automated tests, QA smoke, and non-destructive Production baseline smoke.
1. Query schema_migrations and verify the Day 1 migration ledger in QA D1.
1. Inspect founders, ventures, founder_venture_roles, business_medical_records, and assessment_sessions row counts before Day 2 fixtures.
1. Record QA Worker deployment/version, QA D1 safe name/reference, Wrangler/Node/npm versions, compatibility date, and approved QA origins.
1. Hash or preserve pre-Day 2 versions of every critical file to be edited.
1. Create release-evidence/day2 and write baseline.json before modification.

## 3.3 Day 2 resolved variables

| **Variable** | **Resolution rule** |
| --- | --- |
| `<STARTING_QA_COMMIT_SHA>` | Read from qa-revamped-galvicare-0-5 at Day 2 start. |
| `<DAY1_FINAL_COMMIT_SHA>` | Read from Day 1 evidence and verify against repository history. |
| `<QA_WORKER_NAME/DEPLOYMENT>` | Read actual isolated QA deployment; never guess. |
| `<QA_D1_DATABASE_NAME/SAFE_REFERENCE>` | Read actual QA DB bound as DB; never reuse Production. |
| `<PRODUCTION_BASELINE_COMMIT/DEPLOYMENT>` | Record for regression/rollback only. |
| `<ALLOWED_QA_ORIGINS>` | Exact approved QA/local origins; no privileged wildcard. |
| `<DAY2_MIGRATION_ID>` | Use only if additive schema change is required; do not create one merely for documentation. |
| `<KNOWN_GOOD_DAY2_IDEMPOTENCY_KEYS>` | Synthetic fixture keys, deterministic and non-sensitive. |
| `<QA_WORKER_URL>` | Capture after deployment and use consistently in smoke/Human E2E. |

# 4. Day 2 Repository Target and File Inventory

## 4.1 Canonical additive tree

````text
mrgalvipro/galvitriage/
├── package.json
├── wrangler.json
├── worker/
│   ├── day1.js                         # preserve entry name unless approved config already uses app.js
│   ├── app.js / router.js              # extend if present; do not duplicate
│   ├── domain/
│   │   ├── founder-service.js
│   │   ├── venture-service.js
│   │   ├── bmr-service.js
│   │   ├── session-service.js
│   │   ├── identifiers.js
│   │   ├── invariants.js
│   │   └── lifecycle.js
│   ├── security/
│   │   ├── authentication.js
│   │   └── authorization.js
│   ├── lib/
│   │   ├── fingerprints.js
│   │   ├── idempotency.js
│   │   ├── transactions.js
│   │   └── validation.js
│   ├── repositories/
│   │   ├── founder-repository.js
│   │   ├── venture-repository.js
│   │   ├── bmr-repository.js
│   │   └── session-repository.js
│   └── routes/
│       ├── founders.js
│       ├── ventures.js
│       ├── business-medical-records.js
│       └── sessions.js
├── migrations/day2/                    # only when additive SQL is required
├── tests/day2-identity-continuity.test.mjs
├── tests/fixtures/day2-identity.json
├── scripts/day2-smoke.mjs
├── scripts/verify-day2-identity.mjs
├── docs/api/day2-identity-continuity.md
├── docs/operations/day2-human-e2e.md
└── release-evidence/day2/
    ├── README.md
    ├── baseline.json
    ├── deployment-metadata.json
    ├── automated-tests.txt
    ├── database-assertions.sql
    ├── identity-set.json
    ├── human-e2e.md
    └── rollback.md
````

## 4.2 File responsibilities

| **Path/class** | **Day 2 responsibility** |
| --- | --- |
| worker/domain/founder-service.js | Normalize/resolve/create/update Founder identity; enforce permitted fields, expected_version, audit, and stable founder_id. |
| worker/domain/venture-service.js | Create/resolve/update Venture and founder role relationships; enforce scope and stable venture_id. |
| worker/domain/bmr-service.js | Create-or-get one BMR per venture, lifecycle initialization/activation, idempotency, events, and audit. |
| worker/domain/session-service.js | Resolve founder/venture/BMR and create/resume sessions without duplicate canonical identity. |
| security/authentication.js | Resolve approved actor/service context; no trust in body-declared actor identity. |
| security/authorization.js | Enforce venture/BMR/session scope and privileged role restrictions. |
| lib/fingerprints.js + idempotency.js | Canonical request fingerprint, key ownership, replay return, and key-reuse conflict. |
| repositories/* | Only parameterized SQL; transaction-safe reads/inserts/updates; unique conflict resolution; no raw SQL in routes. |
| routes/* | HTTP parsing, validation, service invocation, status mapping, canonical envelope, and headers only. |
| tests/day2-identity-continuity.test.mjs | Primary executable Day 2 BLOCK contract plus Day 1 regression invocation. |
| scripts/day2-smoke.mjs | New founder → same retry → new session → profile update → second venture → negative mismatch. |
| release-evidence/day2/* | Immutable redacted proof for exact reviewed commit/deployment. |

# 5. Canonical Identity, Ownership, and Continuity Contracts

## 5.1 Identity rules

- founder_id, venture_id, bmr_id, and server-created session_id are opaque, immutable canonical identifiers.
- normalized_email is a unique lookup aid when email is supplied; it is not the immutable Founder identity.
- Email normalization trims leading/trailing whitespace and applies the approved case normalization. Do not invent provider-specific transformations such as removing dots or plus tags unless separately approved.
- Venture name, website, stage, industry, and revenue range are mutable profile attributes; changes never create a replacement venture_id.
- Every update accepts only an allowlisted field set and rejects unknown privileged/ownership fields.
- Every material update requires expected_version, increments record_version exactly once, updates updated_at, and appends audit evidence in one transaction.
- Archive is soft and governed; Day 2 does not hard-delete identity records.

## 5.2 Relationship and ownership invariants

| **Invariant** | **Executable rule** |
| --- | --- |
| Founder–Venture relationship | A founder may relate to multiple ventures; a venture may have multiple founder roles; each role row is explicit and status-governed. |
| Primary founder context | is_primary is relationship context, not global privilege. At most one active primary role per venture should be enforced by service logic and tested. |
| Privileged role restriction | Client payload cannot assign operator/admin/clinician/service privilege; only approved authenticated service/operator context may do so. |
| One BMR per venture | business_medical_records.venture_id is unique and create-or-get resolves conflict to the existing row. |
| Session attachment | Every assessment session references the resolved venture and BMR; cross-venture/BMR mismatch is rejected before write. |
| No orphan records | Roles require existing Founder and Venture; BMR requires Venture; session requires valid Venture/BMR and contracted Founder context. |
| No silent reassignment | A session or BMR cannot be moved to another Venture by update. |
| No partial identity set | Multi-row create workflow commits all required rows or none. |

## 5.3 Required scenario outcomes

| **Scenario** | **Expected identity result** |
| --- | --- |
| New founder + new venture | One founder, one venture, one role, one BMR, one session. |
| Same email, same venture, same session key | Same IDs; resumed/no_change; no duplicate rows. |
| Same venture, new session | Same founder_id, venture_id, bmr_id; new session_id only. |
| Same founder, second venture | Same founder_id; new venture_id, role, BMR, and session. |
| Changed venture name/stage | Same venture_id and bmr_id; audited profile version. |
| Email case/whitespace variation | Same founder_id; normalized lookup; no duplicate founder. |
| Cross-venture session/BMR mismatch | 403 or 409; no reassignment or partial write. |
| Stale expected_version | 409 GV_VERSION_CONFLICT; no profile/audit mutation. |
| Same idempotency key, changed request | 409 GV_IDEMPOTENCY_KEY_REUSE; no mutation. |
| Incomplete invalid payload | 400/422 canonical error with field details; no partial identity rows. |

# 6. Phase A — Freeze Day 1 Baseline and Establish Day 2 Evidence

1. Run npm ci (or the repository-approved locked install) and record tool versions.
1. Run Day 1 required-file, migration, automated, QA smoke, and Production-regression commands.
1. Verify the QA D1 schema_migrations ledger and core unique/foreign-key constraints.
1. Capture baseline row counts for identity/BMR/session/audit/event/idempotency tables.
1. Create release-evidence/day2/baseline.json and README.md with exact commit/deployment/resource references.
1. Create a rollback checkpoint: Day 1 final commit SHA and QA Worker deployment/version.
1. Do not proceed if any Day 1 BLOCK condition is red.

## 6.1 Required baseline commands

````bash
git status --short
git rev-parse HEAD
git log -1 --oneline
npm ci
npm run verify:day1:files
npm run test:day1
npm run smoke:day1:qa
# Use repository-approved Wrangler command syntax:
npx wrangler d1 execute <QA_DB> --remote --command "SELECT * FROM schema_migrations ORDER BY applied_at;"
````

Codex must use the actual script names from package.json. When names differ, update the Day 2 evidence with the resolved command rather than inventing a command that was not executed.

# 7. Phase B — Domain Constants, Validation, Authentication, and Authorization

## 7.1 Constants and error codes

- Define stable action names, route names, allowed role codes, identity statuses, BMR statuses, session statuses, source values, and error codes in one constants module.
- Preserve existing Day 1 constants and add only Day 2 values.
- Required conflict codes include GV_VERSION_CONFLICT, GV_IDEMPOTENCY_KEY_REUSE, GV_IDENTITY_CONFLICT, GV_SCOPE_MISMATCH, GV_BMR_ALREADY_EXISTS (internal or public mapping as approved), and GV_FORBIDDEN.

## 7.2 Input validation

- Validate JSON object shape, maximum string lengths, URLs, email format, enums, booleans, IDs, expected_version integer, and Idempotency-Key format.
- Reject unknown privileged fields. Prefer reject-over-ignore for owner/role/actor/security fields so attempted privilege injection is visible.
- Bound profile_json or metadata fields; do not allow an unrestricted blob to become canonical identity state.
- Return field-level safe errors without echoing unnecessary sensitive values.

## 7.3 Authentication and authorization

- Resolve actor/service context from the approved QA authentication pattern established by the repository.
- A synthetic QA test identity may be used only under explicit QA fixture/test guards.
- Authorize each Venture/BMR/session operation using persisted scope and trusted actor context.
- Create/update routes must not infer authorization solely from founder_id, venture_id, email, role_code, or is_primary in the body.
- Record actor_type, actor_id/service name, source, environment, correlation_id, and entity/version context in audit evidence.

# 8. Phase C — Founder Identity

## 8.1 Founder create-or-resolve algorithm

1. Parse and validate the allowlisted Founder payload.
1. Normalize email only when supplied. Preserve the approved display email separately.
1. When an approved canonical founder_id is supplied by a trusted internal continuation path, validate it and resolve directly. Public/untrusted clients cannot choose a new founder_id.
1. Resolve by normalized_email when available.
1. If found, compare permitted profile fields and return existing identity; do not silently mutate unless the operation is explicitly update and includes expected_version.
1. If not found, generate founder_id server-side and insert the Founder with record_version=1.
1. On unique conflict caused by a concurrent create, re-read by normalized_email and return the canonical existing row if semantically compatible.
1. Write idempotency receipt, journey/domain event, and audit evidence only as contracted and in the same transaction boundary.
1. Return stable founder_id, record_version, status, and timestamps in the canonical envelope.

## 8.2 Founder update algorithm

1. Require founder_id in path and expected_version in body or approved conditional header.
1. Load current Founder and authorize actor scope.
1. Reject immutable-field mutation and unknown fields.
1. If current record_version differs, return 409 GV_VERSION_CONFLICT with no change.
1. If the normalized email changes, verify uniqueness before update; founder_id remains unchanged.
1. If no allowlisted value changes, return no_change without incrementing version or duplicating audit.
1. When changed, update fields, increment record_version, set updated_at, and append audit in one transaction.
1. Return the new version and changed_fields list without exposing prior sensitive values.

## 8.3 Founder repository obligations

- findById(founder_id)
- findByNormalizedEmail(normalized_email)
- insertFounder(founder)
- updateFounderWithExpectedVersion(founder_id, expected_version, patch)
- assertNoDuplicateNormalizedEmail(normalized_email)
- readFounderForAudit(founder_id)

# 9. Phase D — Venture Identity and Founder–Venture Roles

## 9.1 Venture creation

1. Validate venture_name and allowlisted profile fields.
1. Generate venture_id server-side.
1. Do not deduplicate ventures solely by a common name or website without an approved identity key; false merges are more harmful than an explicit second venture.
1. When the workflow is a founder-led create, create the founder_venture_roles row in the same transaction as Venture/BMR/session orchestration where applicable.
1. Assign only approved founder role_code values. Any operator/admin/clinician role request from an untrusted client is rejected.
1. Set is_primary only under approved service logic and test that a second primary relationship cannot be created accidentally.

## 9.2 Venture update

1. Require expected_version and authorize actor against persisted Venture scope.
1. Allow changes to approved profile fields such as venture_name, website, industry, stage, revenue_range, and bounded profile_json.
1. Keep venture_id and associated bmr_id unchanged.
1. Return 409 on stale version and no audit mutation.
1. Return no_change on exact replay/no-op.
1. Append a safe audit record containing changed field names, prior/new record_version, actor, source, and correlation—not full sensitive payloads.

## 9.3 Role operations

- Create or resolve the Founder–Venture role using the declared relationship business key.
- Enforce foreign keys and active status on both identities.
- Prevent a client from escalating role_code.
- Treat role updates as governed relationship changes with explicit status/version/audit behavior where supported by the schema.
- Reject cross-venture role reuse and duplicate active role rows.

# 10. Phase E — Canonical Business Medical Record

## 10.1 Create-or-get BMR transaction

1. Accept venture_id, source, approved initial_status, and Idempotency-Key.
1. Authorize Venture scope and load the Venture.
1. Check idempotency key ownership/fingerprint.
1. Read existing BMR by venture_id. If present, return it as resumed/existing without a duplicate event or audit for exact replay.
1. If absent, generate bmr_id server-side and insert status=created, record_version=1.
1. Apply the approved lifecycle transition to active when Day 2 workflow requires immediate activation.
1. Emit bmr_created and bmr_activated only for actual state changes.
1. Write audit and idempotency receipt in the same transaction.
1. Handle concurrent UNIQUE(venture_id) conflict by re-reading and returning the canonical existing BMR.

## 10.2 BMR invariants

- UNIQUE(venture_id) is mandatory and must be verified in the applied schema.
- A BMR cannot change venture_id.
- current_session_id may change only to a session belonging to the same BMR/Venture.
- record_version increments on material state transition, not on exact idempotent replay.
- BMR event/audit history is append-only.
- A create/get response always includes bmr_id, venture_id, status, record_version, created_at, and updated_at.

## 10.3 BMR retrieval

- GET by bmr_id returns authoritative current state from D1.
- GET by venture context may resolve the one BMR when authorized.
- Retrieval never reconstructs canonical state solely from browser/session storage.
- Not-found and forbidden responses must not disclose whether an unrelated BMR exists.

# 11. Phase F — Session Continuity and Returning-Founder Behavior

## 11.1 Create/resume identity orchestration

1. Resolve/create Founder.
1. Resolve/create Venture and Founder–Venture role.
1. Create/get the Venture BMR.
1. Validate that all resolved IDs form one coherent identity set.
1. Resolve the assessment session by the declared idempotency/business key.
1. Exact retry returns the same session_id and canonical identity set.
1. A new session request creates a new session_id attached to the same founder_id, venture_id, and bmr_id.
1. Update BMR current_session_id only under the same-BMR invariant and with appropriate version/event behavior.
1. Return one canonical response containing the full stable identity set.

## 11.2 Return/refresh behavior

- The client may persist opaque IDs as hints, but the Worker/D1 remains authoritative.
- A refresh or new browser context must retrieve the same identity set through the Worker.
- When client hints conflict with D1 relationships, reject with scope/conflict; never silently repair by reassignment.
- A changed email, venture name, or stage does not create a replacement canonical identity. Profile correction is a separate versioned operation.

## 11.3 Transaction boundaries

| **Command** | **Atomic boundary** |
| --- | --- |
| Create new Founder only | Founder + idempotency receipt + contracted event/audit. |
| Create Venture + founder role | Venture + relationship + idempotency/event/audit. |
| Create/get BMR | BMR + lifecycle event(s) + audit + idempotency receipt. |
| Create/resume full identity/session | All new identity/relationship/BMR/session rows and receipts required by the command, or none. |
| Profile update | Expected-version update + one audit/event set, or none. |
| Cross-scope mismatch | No state mutation anywhere. |

# 12. Phase G — REST Routes and Compatibility Actions

## 12.1 Required routes

| **Method/path** | **Purpose** | **Success** |
| --- | --- | --- |
| POST /api/v1/founders | Create or resolve Founder under approved identity rules. | 201 created or 200 existing/resumed. |
| GET /api/v1/founders/{founder_id} | Retrieve authorized Founder current profile. | 200. |
| PATCH /api/v1/founders/{founder_id} | Versioned allowlisted correction. | 200 changed/no_change. |
| POST /api/v1/ventures | Create Venture and optional approved founder relationship. | 201. |
| GET /api/v1/ventures/{venture_id} | Retrieve authorized Venture. | 200. |
| PATCH /api/v1/ventures/{venture_id} | Versioned profile correction. | 200. |
| POST /api/v1/ventures/{venture_id}/founder-roles | Create/resolve approved Founder–Venture role. | 201/200. |
| POST /api/v1/business-medical-records | Create or get one BMR for Venture. | 201/200. |
| GET /api/v1/business-medical-records/{bmr_id} | Retrieve BMR current state. | 200. |
| POST /api/v1/sessions | Create/resume session with coherent identity set. | 201/200. |
| GET /api/v1/sessions/{session_id} | Retrieve session and stable identity context. | 200. |

## 12.2 Standard behavior

- All mutation routes require a valid Idempotency-Key where contracted.
- All requests receive/produce a correlation ID and environment header.
- All responses use the existing canonical success/error envelope.
- POST returns 201 only for actual creation and 200 for existing/resumed replay.
- PATCH requires expected_version and returns 409 GV_VERSION_CONFLICT when stale.
- Cross-scope requests return 403 or 409 according to the approved error catalog and leak no unrelated record detail.
- OPTIONS/CORS behavior remains environment allowlist-controlled.

## 12.3 Compatibility action router

When the existing client uses action-based POST compatibility, map actions to the same domain services; do not implement duplicate logic. Required Day 2 actions should include the repository-approved equivalents of: create_or_resolve_founder, update_founder, create_venture, update_venture, create_or_resolve_founder_role, create_or_get_bmr, create_or_resume_session, get_founder, get_venture, get_bmr, and get_session.

# 13. Phase H — Fixtures, Tests, Scripts, Documentation, and Evidence

## 13.1 Fixture catalog

| **Fixture** | **Purpose** | **Expected IDs** |
| --- | --- | --- |
| D2_NEW | New founder + new venture + role + BMR + session. | All new. |
| D2_RETRY | Exact replay of D2_NEW with same keys. | All same. |
| D2_EMAIL_VARIANT | Same email with case/whitespace variation. | Same founder. |
| D2_NEW_SESSION | Same founder/venture, new session key. | Same founder/venture/BMR; new session. |
| D2_SECOND_VENTURE | Same founder, different venture. | Same founder; new venture/BMR/session. |
| D2_PROFILE_UPDATE | Update venture name/stage with current version. | Same IDs; version +1. |
| D2_STALE_VERSION | Repeat update with old expected_version. | 409; unchanged. |
| D2_SCOPE_MISMATCH | Session/BMR from different ventures. | 403/409; no write. |
| D2_KEY_REUSE | Same idempotency key with changed body. | 409; no write. |
| D2_INVALID | Missing/unknown/oversized fields. | 400/422; no write. |

## 13.2 Required package scripts

````json
"verify:day2:files": "node scripts/verify-day2-files.mjs",
"verify:day2:identity": "node scripts/verify-day2-identity.mjs",
"test:day2": "node --test tests/day2-identity-continuity.test.mjs",
"test:day2:regression": "npm run test:day1 && npm run test:day2",
"smoke:day2:local": "node scripts/day2-smoke.mjs --target local",
"smoke:day2:qa": "node scripts/day2-smoke.mjs --target qa"
````

Merge with the actual package.json and project conventions. No script may be a placeholder that prints success without assertions.

## 13.3 Documentation obligations

- docs/api/day2-identity-continuity.md: route/action payloads, headers, envelopes, statuses, errors, examples, and idempotency/version behavior.
- docs/operations/day2-human-e2e.md: exact operator steps, synthetic data, expected IDs, screenshots/transcripts, D1 queries, and pass/fail rules.
- docs/repository-inventory.md: update Day 2 file status/ownership and deviations.
- release-evidence/day2/README.md: exact candidate identity, environment, evidence inventory, known defects, and final decision.

# 14. Automated QA Matrix and Execution Order

## 14.1 Execution order

1. Static file/config/secret scan.
1. Day 1 regression suite.
1. Clean/local migration verification and schema constraints.
1. Pure unit tests: normalization, validation, fingerprints, ID format, version rules, scope predicates.
1. Repository integration tests against isolated D1.
1. Service transaction and concurrency tests.
1. REST/compatibility contract tests.
1. Negative security/scope tests.
1. QA deployment smoke.
1. Remote QA D1 assertion queries.
1. Human E2E.
1. Production baseline regression.

## 14.2 BLOCK matrix

| **ID** | **Test** | **Pass assertion** | **Gate** |
| --- | --- | --- | --- |
| D2-A01 | Day 1 regression | All Day 1 BLOCK tests pass; skipped=0. | BLOCK |
| D2-A02 | Schema core | Identity/BMR/session tables, FKs, unique keys, and indexes exist. | BLOCK |
| D2-A03 | New identity | New workflow creates one complete identity set. | BLOCK |
| D2-A04 | Email normalization | Case/whitespace variation resolves same Founder. | BLOCK |
| D2-A05 | Exact retry | Same keys/body return same IDs and no duplicate rows/events. | BLOCK |
| D2-A06 | Key reuse conflict | Same key/different fingerprint returns 409; no write. | BLOCK |
| D2-A07 | One BMR | Repeated/concurrent create yields one BMR per Venture. | BLOCK |
| D2-A08 | New session | Same Venture creates new session only; BMR/Founder/Venture stable. | BLOCK |
| D2-A09 | Second Venture | Same Founder supports second Venture and BMR without duplicate Founder. | BLOCK |
| D2-A10 | Founder update | Permitted correction keeps founder_id and increments version once. | BLOCK |
| D2-A11 | Venture update | Name/stage update keeps venture_id/bmr_id and increments version once. | BLOCK |
| D2-A12 | No-op update | Exact no-change does not increment version or duplicate audit. | BLOCK |
| D2-A13 | Stale version | 409 GV_VERSION_CONFLICT; row and audit counts unchanged. | BLOCK |
| D2-A14 | Privilege injection | Body-declared privileged role is rejected. | BLOCK |
| D2-A15 | Cross-scope mismatch | 403/409; no reassignment/partial row. | BLOCK |
| D2-A16 | Invalid payload | Canonical 400/422, field errors, no raw stack/SQL. | BLOCK |
| D2-A17 | Missing DB/schema | Readiness false/safe error; no HTML or blank body. | BLOCK |
| D2-A18 | CORS | Approved QA origins pass; disallowed origin fails safely. | BLOCK |
| D2-A19 | Refresh retrieval | Authoritative IDs return from D1 in new client context. | BLOCK |
| D2-A20 | Production protection | Production path/config/data remain unchanged; fixtures unavailable. | BLOCK |

## 14.3 Required D1 assertions

- One founder row for normalized email fixture.
- One venture and one active founder role for the first Venture.
- Exactly one BMR for each venture_id.
- Expected session counts: retry does not add; new-session fixture adds exactly one.
- Second Venture reuses founder_id and creates its own role/BMR/session.
- record_version values match successful material changes only.
- No audit row for stale-version or invalid/cross-scope requests.
- No orphan role, BMR, or session rows.
- Idempotency receipt fingerprint matches its request and key is not reused across semantic requests.

# 15. Local and QA Deployment Runbook

## 15.1 Local build and verification

1. Confirm clean working tree or document approved pre-existing changes.
1. Install locked dependencies.
1. Run file/config/secret verification.
1. Apply/verify the Day 1 baseline schema to a clean local D1. Apply a Day 2 additive migration only when one is approved and required.
1. Run Day 1 regression then Day 2 tests.
1. Run local Day 2 smoke twice to prove deterministic replay.
1. Query local D1 and save redacted assertion output.
1. Commit only reviewed source, tests, docs, migration (if any), and evidence templates—not local D1 state or secrets.

## 15.2 QA deployment

1. Confirm Wrangler QA entry and DB binding still target only QA.
1. Confirm ENVIRONMENT=qa and fixture/test mode only under approved guard.
1. Run dry-run/config validation if supported.
1. Deploy the reviewed candidate and record deployment ID/version, commit SHA, timestamp, Worker URL, compatibility date, and QA DB safe reference.
1. Run health, readiness, schema version, Day 1 smoke, then Day 2 smoke.
1. Execute remote D1 assertions.
1. Do not begin Human E2E until all automated and remote DB gates are green.

## 15.3 QA smoke sequence

````text
1. GET health
2. GET readiness and schema version
3. POST new Founder/Venture/BMR/session fixture
4. Repeat exact request and verify same identity set
5. GET Founder, Venture, BMR, Session
6. Create a new session and verify only session_id changes
7. PATCH Venture with current expected_version
8. Repeat with stale expected_version and verify 409/no write
9. Create second Venture for same Founder
10. Send cross-venture mismatch and verify safe rejection
11. Run remote D1 assertions
12. Run Production baseline smoke
````

# 16. Day 2 Human E2E Procedure

## 16.1 Preconditions

- Reviewed Day 2 commit deployed to isolated QA Worker.
- QA D1 migration ledger and schema constraints verified.
- Day 1 + Day 2 automated BLOCK suites green with zero mandatory skips.
- Synthetic fixture values approved; no real customer data.
- Production baseline smoke recorded before Human E2E.
- Evidence directory open and timestamps/correlation IDs captured.

## 16.2 Human evidence steps

### H2.1 — New identity

Submit the new-founder/new-venture fixture through the intended QA client or approved operator harness. Capture response and canonical IDs. Query D1 and prove one Founder, one Venture, one role, one BMR, and one Session.

### H2.2 — Exact retry

Repeat with the same idempotency/session business keys and unchanged payload. Prove all IDs are identical and row/event/audit counts do not duplicate beyond contracted receipts.

### H2.3 — Refresh/new client context

Clear only non-authoritative client state or open a new context. Retrieve the session/identity through the Worker. Prove D1 returns the same founder_id, venture_id, and bmr_id.

### H2.4 — New session

Create a later session for the same Founder/Venture. Prove same founder_id, venture_id, bmr_id and a new session_id only.

### H2.5 — Profile correction

Update Venture name/stage with current expected_version. Prove venture_id/bmr_id stable, record_version +1, and one audit record.

### H2.6 — Stale version

Replay update with stale expected_version. Prove 409 GV_VERSION_CONFLICT, unchanged profile/version, and no new audit mutation.

### H2.7 — Second Venture

Create a second Venture for the same Founder. Prove one Founder total, two Ventures, two role contexts, two BMRs, and distinct sessions.

### H2.8 — Privilege/scope negative

Attempt privileged role injection and cross-venture BMR/session mismatch. Prove safe 403/409 and no partial/reassigned records.

### H2.9 — Idempotency key misuse

Reuse a prior key with changed semantic payload. Prove 409 key-reuse conflict and no mutation.

### H2.10 — Production regression

Run the approved non-destructive Production smoke and prove Production entry, route, and data behavior remain unchanged.

## 16.3 Human E2E evidence standard

- Record timestamp, commit, deployment, environment, request/action, HTTP status, correlation ID, returned canonical IDs, and operator result.
- Capture D1 query output for each identity set with sensitive values redacted.
- Screenshots alone are insufficient; pair visual evidence with API transcript and D1 assertions.
- Do not paste secrets, raw authorization headers, Production DB IDs, or real customer data into evidence.
- A failed attempt remains recorded; rerun after a new reviewed commit/deployment and label the superseded attempt.

## 16.4 Final Day 2 database assertion sheet

````sql
SELECT founder_id, normalized_email, record_version, status
FROM founders WHERE normalized_email = ?;

SELECT venture_id, venture_name, stage, record_version, status
FROM ventures WHERE venture_id IN (?, ?);

SELECT founder_id, venture_id, role_code, is_primary, status
FROM founder_venture_roles WHERE founder_id = ? ORDER BY venture_id;

SELECT bmr_id, venture_id, status, record_version, current_session_id
FROM business_medical_records WHERE venture_id IN (?, ?) ORDER BY venture_id;

SELECT session_id, founder_id, venture_id, bmr_id, status, current_stage, created_at
FROM assessment_sessions WHERE founder_id = ? ORDER BY created_at;

SELECT entity_type, entity_id, action, correlation_id, created_at
FROM audit_log WHERE correlation_id IN (...) ORDER BY created_at;
````

> **Day 2 Human E2E pass rule**
>
> PASS only when the new and returning workflows produce stable canonical IDs, exactly one BMR per Venture, correct Founder-to-Venture roles, resumable sessions, audited versioned corrections, and safe negative behavior with no duplicate, orphan, cross-venture, or partial records.

# 17. Acceptance Gate, Rollback, and Final Codex Handoff

## 17.1 GO/STOP gate

| **Gate** | **GO condition** | **STOP condition** |
| --- | --- | --- |
| Day 1 protection | All Day 1 tests/smoke and Production baseline pass. | Any Day 1 regression or Production routing/data change. |
| Identity | Stable server-governed Founder and Venture IDs across retry/update. | Email/name changes replace IDs or create duplicates. |
| Relationships | Correct roles and scope; no privilege injection. | Body fields grant privilege or cross-scope operation succeeds. |
| BMR | Exactly one per Venture under retry/concurrency. | Second BMR or silent reassignment. |
| Continuity | New session reuses Founder/Venture/BMR. | Browser-only identity or fragmented canonical record. |
| Versioning | Expected-version update + audit; stale conflict no write. | Silent overwrite, wrong version, or audit mutation on failure. |
| Evidence | Complete automated/D1/Human/deployment/rollback package. | Missing or contradictory evidence, skipped BLOCK test. |

## 17.2 Rollback strategy

1. Rollback target is the recorded Day 1 final commit and QA Worker deployment/version.
1. Application rollback is preferred. Re-deploy the Day 1 approved candidate to the isolated QA Worker.
1. Do not run destructive down migrations. If Day 2 required an additive migration, confirm the Day 1 application remains backward-compatible; otherwise use an approved compensating migration.
1. Preserve Day 2 synthetic rows unless cleanup is an approved non-destructive fixture operation; do not delete canonical history merely to make QA look clean.
1. After rollback, run health/readiness, Day 1 automated/smoke, remote schema assertions, and Production baseline regression.
1. Record trigger, authority, commands, deployment, data impact, verification, and final state in release-evidence/day2/rollback.md.

## 17.3 Final Codex handoff requirements

- Exact repository, branch, starting SHA, final SHA, and changed-file list.
- Summary of preserved Day 1/Production paths.
- Migration decision: none required or exact additive migration ID/checksum/apply result.
- All commands actually run with exit/result summary.
- Automated matrix result and skipped count.
- QA Worker deployment/version and QA D1 safe reference.
- Stable known-good identity set (redacted) and D1 assertion summary.
- Human E2E H2.1–H2.10 result and evidence paths.
- Known defects with severity and explicit acceptance status.
- Rollback point and rollback verification result.
- Final decision: GO, STOP, or ROLLED BACK.
- The phrase DAY 2 HUMAN E2E PASS → DAY 2 BUILD FINAL only when every BLOCK condition is green.

# Appendix A — Day 2 API Contract

## A.1 Canonical success envelope

````json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "correlation_id": "cor_...",
    "environment": "qa",
    "request_version": "v1",
    "status": "created | existing | resumed | changed | no_change"
  }
}
````

## A.2 Canonical error envelope

````json
{
  "ok": false,
  "error": {
    "code": "GV_VERSION_CONFLICT",
    "message": "The record changed before this update was applied.",
    "fields": [{"field":"expected_version","issue":"stale"}]
  },
  "meta": {"correlation_id":"cor_...","environment":"qa"}
}
````

## A.3 Example — create or resolve Founder

````http
POST /api/v1/founders
Idempotency-Key: d2-founder-001
Content-Type: application/json

{
  "email": "founder.day2@example.test",
  "first_name": "Day",
  "last_name": "Two",
  "consent_status": "approved",
  "source": "galvicare"
}

201/200 data
{
  "founder_id": "fdr_...",
  "record_version": 1,
  "status": "active",
  "created_at": "...",
  "updated_at": "..."
}
````

## A.4 Example — versioned Venture correction

````http
PATCH /api/v1/ventures/ven_...
Idempotency-Key: d2-venture-update-001

{
  "expected_version": 1,
  "venture_name": "Canonical Venture Labs",
  "stage": "validation",
  "source": "operator"
}

200 data
{
  "venture_id": "ven_...",
  "bmr_id": "bmr_...",
  "record_version": 2,
  "changed_fields": ["venture_name","stage"],
  "status": "changed"
}
````

## A.5 Example — create or get BMR

````http
POST /api/v1/business-medical-records
Idempotency-Key: d2-bmr-ven-001

{
  "venture_id": "ven_...",
  "source": "galvicare",
  "initial_status": "created"
}

201/200 data
{
  "bmr_id": "bmr_...",
  "venture_id": "ven_...",
  "status": "active",
  "record_version": 2,
  "created_at": "...",
  "updated_at": "..."
}
````

## A.6 Error/status catalog

| **HTTP** | **Code** | **Use** |
| --- | --- | --- |
| 400 | GV_INVALID_REQUEST | Malformed JSON, unsupported shape, missing required request metadata. |
| 401 | GV_UNAUTHENTICATED | Approved authentication context missing/invalid. |
| 403 | GV_FORBIDDEN / GV_SCOPE_MISMATCH | Actor lacks scope or attempted privilege/cross-venture action. |
| 404 | GV_NOT_FOUND | Authorized target not found without leaking unrelated state. |
| 409 | GV_VERSION_CONFLICT | expected_version stale. |
| 409 | GV_IDEMPOTENCY_KEY_REUSE | Same key used for a different request fingerprint. |
| 409 | GV_IDENTITY_CONFLICT | Supplied identity hints conflict with canonical relationships. |
| 422 | GV_VALIDATION_FAILED | Field validation or prohibited field failure. |
| 500 | GV_INTERNAL_ERROR | Safe bounded internal error; no stack/SQL exposure. |
| 503 | GV_NOT_READY | DB binding/schema/readiness unavailable. |

# Appendix B — Identity/BMR SQL Verification Queries

````sql
-- One BMR per Venture
SELECT venture_id, COUNT(*) AS bmr_count
FROM business_medical_records
GROUP BY venture_id
HAVING COUNT(*) <> 1;

-- Duplicate normalized email
SELECT normalized_email, COUNT(*) AS founder_count
FROM founders
WHERE normalized_email IS NOT NULL
GROUP BY normalized_email
HAVING COUNT(*) > 1;

-- Orphan roles
SELECT r.* FROM founder_venture_roles r
LEFT JOIN founders f ON f.founder_id=r.founder_id
LEFT JOIN ventures v ON v.venture_id=r.venture_id
WHERE f.founder_id IS NULL OR v.venture_id IS NULL;

-- Orphan or mismatched sessions
SELECT s.* FROM assessment_sessions s
LEFT JOIN business_medical_records b ON b.bmr_id=s.bmr_id
WHERE b.bmr_id IS NULL OR b.venture_id <> s.venture_id;

-- Version/audit comparison for fixture entity
SELECT record_version, updated_at FROM ventures WHERE venture_id=?;
SELECT COUNT(*) FROM audit_log WHERE entity_type='venture' AND entity_id=?;
````

## B.1 Constraint inspection

````sql
SELECT name, sql FROM sqlite_master
WHERE type IN ('table','index')
  AND name IN ('founders','ventures','founder_venture_roles','business_medical_records','assessment_sessions','idx_founders_status','idx_roles_venture','idx_bmr_status','idx_sessions_bmr');
````

# Appendix C — Fixture Catalog and Expected Identity Sets

| **Run** | **Founder** | **Venture** | **BMR** | **Session** | **Expected delta** |
| --- | --- | --- | --- | --- | --- |
| NEW | F1 | V1 | B1 | S1 | +1 Founder, +1 Venture, +1 role, +1 BMR, +1 Session |
| RETRY | F1 | V1 | B1 | S1 | No canonical row delta |
| EMAIL VARIANT | F1 | V1 | B1 | S1 | No Founder delta |
| NEW SESSION | F1 | V1 | B1 | S2 | +1 Session only |
| PROFILE UPDATE | F1 | V1 | B1 | S2 | Venture version +1; +1 audit |
| STALE UPDATE | F1 | V1 | B1 | S2 | No delta |
| SECOND VENTURE | F1 | V2 | B2 | S3 | +1 Venture, +1 role, +1 BMR, +1 Session |
| SCOPE MISMATCH | — | — | — | — | No delta |
| KEY REUSE | — | — | — | — | No delta |

# Appendix D — Release-Evidence Templates

## D.1 deployment-metadata.json

````json
{
  "day": 2,
  "repository": "mrgalvipro/galvitriage",
  "branch": "qa-revamped-galvicare-0-5",
  "starting_commit": "<sha>",
  "candidate_commit": "<sha>",
  "day1_final_commit": "<sha>",
  "qa_worker": "<safe-name>",
  "qa_deployment": "<id/version>",
  "qa_d1": "<safe-reference>",
  "migration": "none | <id/checksum>",
  "deployed_at": "<utc>",
  "human_e2e": "pass | fail",
  "final_decision": "go | stop | rolled_back"
}
````

## D.2 human-e2e.md

````markdown
# Day 2 Human E2E
- Candidate commit:
- QA deployment:
- QA D1 safe reference:
- Operator:
- Start/end UTC:

| Step | Correlation ID | HTTP | Canonical IDs | D1 proof | Result |
|---|---|---:|---|---|---|
| H2.1 | | | | | |
...

## Defects
## Production regression
## Final gate decision
````

## D.3 rollback.md

````text
# Day 2 Rollback Record
- Trigger:
- Decision authority:
- Day 1 rollback commit/deployment:
- Commands/actions:
- Migration/data impact:
- Verification:
- Production regression:
- Final state:
- Evidence paths:
````

# Appendix E — Codex Final Implementation Report Template

````markdown
# GalviVault Day 2 Final Implementation Report

## 1. Candidate Identity
Repository / branch / starting SHA / final SHA / QA deployment / QA D1 / migration.

## 2. Files Changed
Exact path, purpose, and whether new/modified/preserved.

## 3. Implementation Summary
Founder, Venture, role, BMR, session continuity, auth/scope, idempotency/versioning.

## 4. Commands and Results
Actual commands, exit status, test totals, skipped count.

## 5. D1 Assertions
Stable identity set, one BMR per Venture, session counts, versions, no orphans/duplicates.

## 6. Human E2E
H2.1–H2.10 result and evidence paths.

## 7. Production Protection
Production baseline before/after and preserved paths.

## 8. Defects and Risks
Severity, scope, disposition, owner.

## 9. Rollback
Rollback point, procedure, verification.

## 10. Final Decision
GO / STOP / ROLLED BACK.
Use DAY 2 HUMAN E2E PASS → DAY 2 BUILD FINAL only when every BLOCK gate is green.
````
