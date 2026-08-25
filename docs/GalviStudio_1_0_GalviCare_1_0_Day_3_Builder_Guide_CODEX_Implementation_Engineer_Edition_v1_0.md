<!--
GalviStudio 1.0 | GalviCare 1.0
Day 3 Builder Guide - CODEX Implementation Engineer Edition v1.0
Git/Codex consumption copy converted from the authoritative DOCX.
Source content preserved; visual Word callouts are represented as Markdown blockquotes.
-->

**GALVISTUDIO 1.0 \| GALVICARE 1.0**

**Day 3 Builder Guide**

**GalviEngine 1.0 • Governed OpenAI • Evidence-Based Clinical Intelligence • GalviShot • GalviSight • GalviPath**

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

> **CURRENT BUILD STATUS — DAY 2 BUILD FINAL IS THE ONLY AUTHORIZED STARTING POINT**
>
> Day 3 is the governed-intelligence activation day. Codex must start from the exact signed Day 2 HUMAN E2E PASS candidate SHA, deployed QA Worker, QA D1 binding/schema, prompt/rules/protocol versions, and rollback target. No work branch, no new branch family, no Production deployment, no broad rewrite, and no direct browser-to-OpenAI path are authorized.

> **DAY 3 MISSION**
>
> Turn on the OpenAI API only as a bounded, server-side reasoning capability inside GalviEngine 1.0. Preserve deterministic GalviScore arithmetic, Acuity/red-flag routing, Clinical Confidence, identity/authorization, and GalviVault canonical authority. AI may propose findings, hypotheses, interpretation, and draft care-path content only when grounded in governed evidence, schema-valid, policy-valid, traceable, rejectable, replay-safe, and fallback-safe.

> **CRITICAL-PATH RULE**
>
> Every Day 3 change must do one of four things: (1) safely activate the provider in QA, (2) create/validate/persist governed evidence-bound proposals, (3) integrate accepted intelligence into Shot/Sight/Path without changing deterministic truth, or (4) close a Day 3 release/evidence gate. If a change does not directly improve DAY 3 HUMAN E2E PASS probability or preserve an inherited Day 1/2 invariant, do not make it.

# How Codex Must Use This Builder

> **EXECUTION CONTRACT**
>
> This is an implementation runbook, not a design brainstorm. Prove the exact Day 2 Build Final baseline first. Inventory the real repository, Worker routes, existing GalviEngine/rules code, Day 1/2 evidence services, current D1 schema/migrations, wrangler bindings, tests, QA deployment path, and package/runtime versions. Reuse existing contracts. Implement the smallest additive Day 3 delta. Run focused unit/contract tests, inherited Day 2 regression, deployed exact-SHA QA verification, adversarial AI tests, D1 integrity assertions, and Human E2E. Stop on the first P0/P1 defect and remediate only the proven root cause.

| **Priority** | **Instruction**                    | **Practical meaning**                                                                                                                                                                       |
|--------------|------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Exact Day 2 handoff only           | Day 3 begins only from the signed Day 2 candidate SHA, QA Worker deployment, QA D1 schema/binding, release evidence, and rollback target.                                                   |
| P0           | Approved branch only               | Implementation stays on qa-revamped-galvicare-0-5. Never create/use work or a workaround branch. main is read-only reference.                                                               |
| P0           | Production untouched               | No main merge, Production Worker deploy, Production D1 mutation, LIVE payment changes, or PROD OpenAI secret activation on Day 3.                                                           |
| P0           | Deterministic authority preserved  | GalviScore, Acuity/red flags, Clinical Confidence, identity, authorization, consent, protocol, and canonical record remain authoritative outside the model.                                 |
| P0           | Server-side OpenAI only            | Only the Worker/provider adapter may call the OpenAI Responses API. Never expose API keys or provider calls to browser code.                                                                |
| P0           | Proposal before truth              | Model output starts as openai_proposal. It becomes projectable governed intelligence only after schema + evidence + deterministic-fact + policy validation and any required human approval. |
| P0           | Evidence scoped to one record/task | Prompts contain only minimum necessary current principal/BHR evidence and explicit contradictions. Cross-record evidence is a release-stopping defect.                                      |
| P0           | Fallback is part of the feature    | Timeout, outage, invalid schema, or rejected proposal must preserve care state and return deterministic/stored output or recoverable needs_review without blocking the journey.             |
| P0           | Idempotent/versioned generation    | Repeat requests over the same evidence/rules/prompt/schema version return the stored accepted artifact; regeneration requires an explicit material version/fingerprint change.              |
| P1           | Evidence decides completion        | Local success is insufficient. Exact-SHA deployed QA, AI ledger, negative/adversarial tests, inherited regression, Human E2E, and rollback proof determine PASS/FAIL.                       |

# 1. Day 3 Scope Decision, Objectives & Definition of Done

Authoritative Day 3 objective: activate OpenAI as a governed server-side reasoning capability inside GalviEngine while preserving deterministic scoring/routing, GalviVault authority, evidence lineage, human oversight, and a no-AI fallback path.

> **FASTEST SAFE PATH**
>
> Freeze exact Day 2 Build Final -> map existing GalviEngine/evidence/schema/provider seams -> add QA secret/config -> implement provider adapter -> build governed evidence bundle -> add prompt/schema registry -> add/extend AI generation ledger -> validate schema/evidence/deterministic facts/policy -> expose idempotent ai_reason action -> integrate accepted proposals into Shot/Sight/Path -> prove outage/rejection fallback -> run AI golden/adversarial suite -> rerun full Day 2 gate -> deploy exact SHA to existing QA Worker/D1 -> Human E2E + D1 assertions -> rollback rehearsal -> sign Day 3 PASS/STOP.

## 1.1 Day 3 Definition of Done

- Exact Day 2 Build Final SHA/deployment/schema/binding/rollback target is recorded before edits; Day 2 HUMAN E2E PASS evidence is available.

- qa-revamped-galvicare-0-5 is the only implementation branch; main is untouched; no work/new branch exists for Day 3.

- Full Day 2 inherited gate is green before AI activation: identity, consent, evidence, Triage/Vitals/Score, lifecycle/protocol, Acuity, Clinical Confidence, record scoping, and clinician/Vault regression.

- OPENAI_API_KEY exists only as a QA Worker secret; no key appears in repository, HTML/JS, logs, screenshots, error payloads, evidence artifacts, or client network traffic.

- QA model/provider configuration is environment-driven; product clinical contracts do not depend on one hard-coded model name.

- Provider adapter uses the current OpenAI Responses API server-side and has explicit timeout, bounded request size, safe error handling, and deterministic/stored fallback behavior.

- Governed evidence bundle includes minimum identity/protocol context, immutable deterministic facts, authorized evidence IDs/content, explicit contradictions, task constraints, and fixed output schema metadata.

- Prompt registry and output schemas are versioned. Structured Outputs / JSON Schema are used where supported; unknown or invalid output is rejected rather than loosely parsed into canonical truth.

- Every generation is written to a GalviVault AI generation ledger with principal/BHR scope, task, request fingerprint, provider response ID, model, prompt/schema versions, evidence IDs/hashes, validation result, approval state, and timestamps.

- AI cannot change stored GalviScore arithmetic, Acuity/red-flag disposition, Clinical Confidence, identity, protocol, consent, authorization, entitlement, or canonical history.

- Validation pipeline rejects unsupported evidence IDs, cross-record content, deterministic-fact conflicts, ungrounded claims, unsafe regulated advice, prompt-injection attempts, and policy/schema violations.

- Only accepted/governed artifacts can set customer_projection=true; human/Business Physician approval is required where policy or treatment language requires it.

- GalviShot, GalviSight, and GalviPath can consume accepted governed intelligence while remaining usable with deterministic/stored fallback if AI is disabled or unavailable.

- Repeat request with unchanged inputs/version fingerprint returns stored accepted artifact and does not duplicate generation/evidence lineage rows.

- Golden + adversarial AI cases pass locally and on deployed QA; provider outage/timeout, invalid schema, cross-record, and injection negatives pass.

- Health/capabilities set ai_enabled=true only after provider/secret/governance tests pass; all inherited Day 1/2 capability flags remain intact.

- Exact candidate SHA is deployed to the existing QA Worker with the expected QA D1 binding; deployed API behavior and AI ledger match the candidate.

- Day 3 Human E2E passes with manual repair=NO; D1 assertions show no duplicate, unscoped, or incorrectly projected AI data.

- Rollback to Day 2 Build Final is tested, non-destructive, and provider-disable fallback remains immediately available.

- Final declaration is DAY 3 HUMAN E2E PASS / DAY 3 BUILD FINAL or FAIL / STOP / ROLLBACK.

## 1.2 Explicit in-scope / out-of-scope

| **Capability**      | **Day 3 requirement**                                                                                          | **Not authorized on Day 3**                                                                                       |
|---------------------|----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| OpenAI provider     | QA server-side Responses API adapter, secret/config, timeout, structured output, error handling.               | Browser calls, public API key, Production activation, provider-specific rewrite of clinical contracts.            |
| GalviEngine         | Evidence-bundle builder, prompt/schema registry, validators, generation orchestration, deterministic fallback. | Replacing deterministic Score/Acuity/Confidence or building autonomous agent workflows.                           |
| GalviVault          | Minimal additive/versioned AI generation ledger and lineage links if existing schema lacks equivalents.        | New database, shadow BHR, destructive schema rewrite, raw prompt dump containing secrets/unrelated personal data. |
| GalviShot           | 3–5 evidence-informed priority findings with severity/confidence/why-it-matters/next step.                     | Unsupported causal certainty or autonomous regulated advice.                                                      |
| GalviSight          | Evidence interpretation with support, contradiction, confidence, implications, and hypothesis labeling.        | Treating hypotheses as confirmed facts.                                                                           |
| GalviPath           | Draft care-path options using diagnosis/evidence/acuity/constraints/goals; bounded by governance.              | AI independently confirming active treatment, payment, referral qualification, or clinician decision.             |
| GalviChart          | Only existing projections needed to verify accepted intelligence is safely consumable later.                   | Day 4 Chart UX build or activation/economics changes.                                                             |
| GalviGuide          | No broad autonomous navigator build.                                                                           | Day 5/6 autonomous conversational care agent expansion.                                                           |
| Commercial adapters | Regression only; non-blocking.                                                                                 | Unrelated Stripe/Calendly/HubSpot/GA4/Clarity redesign.                                                           |
| Production          | None.                                                                                                          | main merge, PROD deploy/migration, LIVE secret/model activation, public cutover.                                  |

# 2. Recurring GalviCare/GalviVault Build Defects — Day 3 Mandatory Prevention Controls

These controls convert the recurring branch/deployment/schema/runtime defects from prior GalviCare/GalviVault work into release gates, and add AI-specific failure prevention. They are not optional engineering preferences.

| **Defect pattern**                        | **Observed risk**                                                                                       | **Day 3 control**                                                                                                        | **Required proof**                                                                        |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Branch drift / work checkout              | AI changes land on local work or non-authoritative branch.                                              | STOP on work/main. Synchronize only qa-revamped-galvicare-0-5; no new branch.                                            | Remote + branch + origin tracking + candidate SHA before edit and deploy.                 |
| Repo/remote ambiguity                     | Tests/deploy run against reconstructed or wrong repo.                                                   | Capture repo root + git remote -v; never rebuild a “similar” repo.                                                       | Authoritative repo/root/SHA manifest.                                                     |
| Deployment drift                          | Source passes while active Worker serves older code.                                                    | Deploy exact candidate SHA; verify health/capability + direct deployed ai_reason probe.                                  | SHA \<-> deployment ID \<-> health \<-> runtime match.                                 |
| Wrangler 403 / binding mismatch           | Cloudflare auth/config failure misdiagnosed as application defect; new Worker/DB created as workaround. | Compare to known-good auth/config/binding; remediate only credential/config. Never create bypass DB/Worker.              | Same QA Worker/D1 binding + successful deploy/smoke.                                      |
| Hosted runner queue/outage                | CI platform delay triggers needless application/workflow changes.                                       | Separate platform state from code state; retry approved path; no speculative rewrite.                                    | Run state evidence + unchanged application diff.                                          |
| Unrelated workflow triggering             | Non-Day workflow changes or deploys unrelated code.                                                     | No workflow edits by default. If proven necessary, isolate Day 3 QA/exact-SHA verification only.                         | Final diff has no unrelated workflow rewrite.                                             |
| Schema duplication / wrong D1             | New AI table/DB created before current schema is understood.                                            | Map schema/migrations/bindings first; reuse generic artifact/evidence/idempotency equivalents; additive only if missing. | Before/after schema map + binding identity + migration checksum.                          |
| Direct/unsafe QA repair                   | Manual delete/SQL makes AI tests pass but breaks lineage.                                               | Use migration/domain service/corrective versioning; no undocumented repair.                                              | Evidence sheet says manual repair=NO.                                                     |
| Client state treated as truth             | URL/localStorage says AI accepted or entitlement valid.                                                 | Worker/D1 canonical response decides; client only projects.                                                              | Client-only tamper negative cannot alter accepted/locked state.                           |
| Blank/HTML runtime error                  | Provider/validation exception becomes unusable response.                                                | Structured JSON error with action/correlation/code/environment; fallback remains available.                              | Deployed negative probe returns JSON and journey continues.                               |
| Secret exposure                           | API key/model prompt data leaks into repo/log/browser/evidence.                                         | Secret-only key, redacted logging, network/source scan, no prompt/evidence dump by default.                              | Secret scan + browser network inspection + evidence package contains no secret.           |
| Provider output trusted directly          | Model proposal written/projected as canonical without validators.                                       | Explicit proposal -> validate -> accept/reject/needs_review -> project sequence.                                      | Rejected sample persisted but customer_projection=false.                                  |
| Cross-record contamination                | AI bundle/proposal includes evidence from another BHR/principal.                                        | Scope every bundle and evidence lookup using canonical auth context; validate every referenced evidence ID.              | Cross-record negative rejected/audited; no leaked text/IDs.                               |
| Prompt injection in evidence              | Source text instructs model to ignore policy, reveal secrets, or change authority.                      | Treat evidence as data, not instructions; immutable system/task policy + output schema + post-validation.                | Injection case cannot alter rules, access secrets, or bypass validation.                  |
| AI overrides deterministic truth          | Model changes score, acuity, confidence, red flag, lifecycle, protocol.                                 | Pass deterministic facts as immutable context; validator compares proposal claims to stored truth.                       | Conflict proposal rejected; canonical values unchanged.                                   |
| Low confidence becomes invented certainty | Plausible narrative fills evidence gaps.                                                                | Bundle explicit confidence/gaps; prompt requires uncertainty; validator may return needs_review/evidence_required.       | Low-confidence case does not finalize unsupported finding.                                |
| Provider timeout blocks care              | OpenAI outage makes Shot/Sight/Path unusable or loses state.                                            | Timeout/recoverable error -> deterministic/stored fallback; request can retry safely.                                   | Outage/timeout E2E continues with state intact.                                           |
| Duplicate AI generations                  | Refresh/retry creates multiple accepted artifacts/lineage.                                              | Use stable input/request fingerprint + existing idempotency service; retrieve stored accepted artifact.                  | Replay produces one accepted version for unchanged fingerprint.                           |
| Evidence ambiguity                        | Screenshots are treated as proof without build/runtime identity.                                        | Index artifacts to run ID, SHA, deployment, schema/prompt/rules versions, expected/actual.                               | Complete evidence index; screenshots supplemental only.                                   |
| Speculative multi-file remediation        | UI + Worker + DB + workflow all changed before root cause isolated.                                     | Name exact failing assertion/layer first; smallest diff; focused retest; then regression.                                | Defect log: failure -> root cause -> minimal diff -> focused PASS -> regression PASS. |

> **REMEDIATION RULE**
>
> When a Day 3 test fails, Codex must name the exact failing assertion, request, route, generation row, evidence ID, validation stage, provider response, deployment, or runtime layer before editing. Fix the smallest proven root cause. Rerun the failed test first, then its regression slice, then the complete Day 3 gate. Do not simultaneously change UI + Worker + database + prompt + workflow unless evidence independently proves each layer is broken.

# 3. Day 3 Entry Gate & Exact Baseline Fingerprint

> **STOP UNLESS ALL ARE TRUE**
>
> Day 3 must not activate a model on top of an unproven Day 2 state. If the signed Day 2 HUMAN E2E PASS baseline cannot be proven, restore/synchronize it first. AI implementation must never be used to conceal a deterministic, identity, evidence, routing, or deployment defect.

| **Check**          | **Required starting state**                                                                 | **Codex evidence**                                      |
|--------------------|---------------------------------------------------------------------------------------------|---------------------------------------------------------|
| Repository         | Authoritative mrgalvipro/galvitriage repository used by QA.                                 | git remote -v + repository root.                        |
| QA branch          | qa-revamped-galvicare-0-5 at exact Day 2 Build Final SHA.                                   | branch + origin tracking + HEAD SHA.                    |
| Production         | main is read-only reference.                                                                | origin/main HEAD; no implementation checkout/deploy.    |
| Working tree       | Clean or explicitly explained pre-existing changes.                                         | git status --short.                                     |
| QA Worker          | Exact Day 2 Build Final deployment.                                                         | deployment ID/URL + health/capabilities payload.        |
| QA D1              | Known Day 2 schema/binding/migration ledger.                                                | wrangler config + read-only schema/migration proof.     |
| Day 2 gate         | HUMAN E2E PASS; Triage/Vitals/Score/Acuity/Confidence/evidence/idempotency/rollback proven. | Day 2 final report/evidence + H1-H20 + D1 assertions.   |
| Generation state   | ai_enabled=false before Day 3 provider activation; no prior shadow AI ledger.               | health response + schema inventory.                     |
| OpenAI client path | No browser/client OpenAI code or leaked key.                                                | repo grep + browser network/source inspection baseline. |
| Regression         | 0.5 + Day 1 + Day 2 + Vault/clinician known-good.                                           | pre-change smoke outputs.                               |
| Rollback           | Day 2 code/deployment restore point retained.                                               | rollback manifest and deployment identifier.            |
| Scope              | Allowed-files manifest + DO NOT MODIFY list drafted.                                        | manifest evidence.                                      |

## 3.1 First Codex actions — no implementation yet

1.  Confirm repository root, remote, QA branch, origin tracking, exact Day 2 Build Final SHA, clean working tree, and Day 2 rollback target. If current branch is work/main/unapproved: STOP. Do not create another branch.

2.  Fetch/synchronize remote refs through the existing authenticated path; prove local QA HEAD equals the signed Day 2 candidate before edits.

3.  Capture package-lock/dependency checksum, Node/runtime version, existing workflow inventory, Worker/wrangler identity, QA D1 binding, schema/migration ledger, deployment identity, health/capabilities payload, and Day 2 evidence IDs.

4.  Inventory all current GalviEngine/scoring/routing/evidence/authorization modules and the Worker action router. Do not assume file names from this guide are real.

5.  Inventory current Shot/Sight/Path generation paths. Classify what is deterministic/stored today and where an additive accepted-intelligence seam can be inserted without rewriting the journey.

6.  Inspect current D1 schema for generic artifacts, versioning, evidence links, idempotency/client_request_id, audit/event, model generation, or metadata tables. Reuse equivalents before proposing a migration.

7.  Run pre-change inherited regression and archive exact outputs. Do not begin AI work until deterministic baseline is green.

8.  Write an allowed-files manifest based on the discovered implementation seam and a DO NOT MODIFY list for unrelated workflows, payment, scheduling, production configuration, and known-good Day 1/2 contracts.

## 3.2 Baseline fingerprint artifact

DAY3_BASELINE.json (conceptual evidence artifact)  
```json
{
"repo": "mrgalvipro/galvitriage",
"branch": "qa-revamped-galvicare-0-5",
"day2_sha": "<exact signed SHA>",
"qa_deployment_id": "<id>",
"qa_worker_url": "<url>",
"qa_d1_binding": "<binding/name>",
"schema_migration_head": "<migration/checksum>",
"rules_version": "<Day 2 value>",
"protocol_version": "<Day 2 value>",
"health_ai_enabled": false,
"rollback_target": "<Day 2 SHA/deployment>",
"prechange_regression": "PASS"
}
```

# 4. Day 3 Target Architecture & Authority Boundary

```text
Founder / Customer / Business Physician
|
Existing GalviCare journey / Worker API boundary
|
+--> Day 1/2 deterministic GalviEngine rules
| Score • Acuity • Red flags • Clinical Confidence • protocol/routing
|
+--> Governed AI Orchestrator (Day 3)
|
+--> buildEvidenceBundle(scope, task, deterministic facts)
+--> prompt/schema registry (versioned)
+--> OpenAI Provider Adapter --> Responses API (server-side only)
+--> parse + schema validation
+--> evidence-scope validation
+--> deterministic-fact consistency validation
+--> policy / regulated-advice / uncertainty validation
|
+--> rejected / needs_review -> generation ledger only + fallback
+--> accepted -> governed intelligence artifact + evidence lineage
|
+--> Shot / Sight / Path projections
+--> GalviVault canonical governed intelligence history
+--> later Chart / Clinician projections
```

Provider outage or provider disabled => deterministic/stored path remains usable.

| **System**                      | **Authoritative Day 3 role**                                                                               | **What it must never do**                                                         |
|---------------------------------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| GalviCare / Worker              | API, authorization, orchestration, product progression, safe error/fallback response.                      | Send browser directly to OpenAI or trust client state as acceptance.              |
| GalviEngine rules               | Deterministic score, acuity, confidence, red flags, protocol and governed validation inputs.               | Allow model to silently mutate deterministic truth.                               |
| OpenAI provider adapter         | Bounded reasoning over one governed evidence bundle/task; returns structured proposal + provider metadata. | Own identity, record, entitlement, score, disposition, treatment, or persistence. |
| GalviVault D1                   | Canonical evidence, generations, accepted governed intelligence, lineage, version/audit history.           | Store shadow identity/BHR or silently overwrite prior accepted versions.          |
| Business Physician / governance | Approve/reject content requiring human clinical judgment and active treatment language.                    | Be bypassed by model output.                                                      |

# 5. Repository Change Strategy — Discover First, Then Minimal Additive Delta

Codex must map these logical responsibilities to the repository that actually exists. File names below are roles, not permission to create duplicates. Reuse the current structure whenever an equivalent module is present.

| **Logical responsibility**  | **Prefer reusing**                                        | **Create only if genuinely absent**                                 |
|-----------------------------|-----------------------------------------------------------|---------------------------------------------------------------------|
| Provider adapter            | Existing external-provider/service adapter pattern.       | A single OpenAI provider module behind a stable internal interface. |
| AI orchestrator             | Existing GalviEngine service/orchestrator/action handler. | Small ai_reason orchestration module.                               |
| Evidence bundle             | Day 1/2 evidence query + authorization helpers.           | A scoped bundle builder that calls those helpers.                   |
| Prompt registry             | Existing rules/protocol/version registry.                 | Minimal versioned prompt/task registry.                             |
| Schemas/validators          | Existing JSON schema/validation utility.                  | Day 3 proposal schemas + semantic validators.                       |
| Generation ledger           | Existing artifact/generation/audit/version table.         | Additive migration for minimal AI generation metadata only.         |
| Evidence links              | Existing evidence-artifact junction/lineage service.      | Minimal generation-evidence link rows if no generic link exists.    |
| Idempotency                 | Existing client_request_id/session/result dedupe service. | Request fingerprint layer scoped to task + versions.                |
| Shot/Sight/Path integration | Existing product result builders.                         | Small accepted-intelligence adapter/merge seam; no product rewrite. |
| Tests                       | Existing Day 1/2 test harness.                            | Focused Day 3 AI provider/validator/fallback/golden suites.         |

> **DO NOT MODIFY BY DEFAULT**
>
> Unrelated GalviCare 0.5/Day 1/Day 2 flows; branch strategy; main/Production deploy config; Stripe LIVE/payment semantics; Calendly; HubSpot/GA4/Clarity; unrelated GitHub Actions; GalviVault clinician UI; GalviChart Day 4 UX; public Carrd/CTA; broad CSS cleanup; historical migrations. Any exception requires a proven Day 3 blocker and a documented smallest-scope change.

# 6. Configure OpenAI Safely in QA — Secret, Model, Feature Flag, Runtime Contract

## 6.1 Secret and environment rules

- Add OPENAI_API_KEY only through the existing Cloudflare Worker secret mechanism for QA. Never commit it, echo it, serialize it into health output, return it in errors, or place it in frontend code.

- Use environment-driven model configuration. Preserve the authoritative names OPENAI_MODEL_QA and OPENAI_MODEL_PROD if compatible with the existing config convention. Day 3 activates QA only; do not add/rotate a Production API key or deploy Production.

- Add or reuse an AI feature flag. ai_enabled remains false until secret resolution, provider connectivity, schema validation, rejection/fallback, and no-secret-leak tests pass. Then QA may report ai_enabled=true.

- Expose only safe capability metadata in health/capabilities: day/build version, ai_enabled, provider configured boolean, prompt/schema versions, and deterministic fallback availability. Never expose key, full prompt, full evidence bundle, or sensitive provider payload.

- Use the exact existing Worker environment/binding separation. Do not create a new Worker or D1 database to isolate AI unless the authoritative architecture explicitly changes later.

## 6.2 Current OpenAI API implementation note — 2026-08-25

> **OFFICIAL API ALIGNMENT**
>
> The current OpenAI developer documentation identifies /v1/responses / responses.create as the Responses API path and supports schema-constrained Structured Outputs. For supported models, prefer JSON Schema Structured Outputs over legacy JSON mode. Keep the model name environment-driven so GalviCare clinical contracts do not depend on a particular model alias or snapshot.

Reference URLs for Codex implementation verification: https://developers.openai.com/api/reference/ and https://developers.openai.com/api/docs/ . Re-check the installed SDK version and its exact Responses/Structured Outputs syntax before coding; do not copy stale examples from unrelated packages.

## 6.3 Provider activation order

9.  Implement provider interface and mock/fake path first; unit-test timeout/error/metadata behavior without a real secret.

10. Add QA secret/config using the known-good Cloudflare path; do not change application code merely to work around a Wrangler/auth error.

11. Run a minimal server-side connectivity probe through the adapter with a non-sensitive synthetic input and structured schema.

12. Confirm provider response ID/model metadata can be captured without logging prompt/evidence content.

13. Run secret/source/network scans and invalid-schema/timeout tests.

14. Only after those gates pass, enable the QA feature flag and report ai_enabled=true in health/capabilities.

# 7. Implement the OpenAI Provider Adapter — Stable Internal Contract

The provider adapter is infrastructure, not clinical logic. It receives a pre-built governed task request, calls OpenAI, and returns a proposal plus safe provider metadata. It does not query arbitrary records, choose evidence, accept clinical content, write customer projections, or decide treatment.

```text
reasonWithModel({
task, // allow-listed Day 3 task
evidenceBundle, // already scoped + governed
deterministicContext, // immutable stored facts
protocolConstraints, // rules / prohibited outputs
outputSchema, // JSON Schema object or registry key
outputSchemaVersion,
promptVersion,
correlationId
}) -> {
proposal, // structured candidate only
providerMetadata: {
provider, provider_response_id, model,
usage_metadata?, latency_ms, completed_at
}
}
```

| **Adapter requirement** | **Implementation rule**                                                                                                  | **Failure behavior**                                                                        |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Responses API           | Use current supported SDK/direct API path server-side.                                                                   | Provider-specific error normalized into internal recoverable error.                         |
| Structured output       | Use JSON Schema Structured Outputs where supported; strict known fields.                                                 | Parse/schema failure => rejected generation + fallback; never best-effort canonical parse. |
| Timeout                 | Use bounded timeout configured to fit Worker execution constraints.                                                      | Return provider_timeout; do not lose session/BHR state.                                     |
| Request size            | Bound evidence/prompt payload; build summary from governed evidence rather than dumping entire record.                   | Return needs_evidence / request_too_large or deterministic fallback.                        |
| Retry                   | Retry only safe transient provider failures using bounded policy; never duplicate accepted artifacts.                    | Idempotency fingerprint prevents duplicate finalization.                                    |
| Logging                 | Log IDs/status/latency/versions and redacted error class.                                                                | No API key, raw secret, or unnecessary full evidence/prompt log.                            |
| Metadata                | Capture provider response ID, model, prompt/schema versions, correlation ID, evidence fingerprint, usage when available. | Missing critical metadata prevents acceptance or sets needs_review per validator policy.    |

# 8. Build the Governed Evidence Bundle — One Principal/BHR, One Task

The model must never be allowed to retrieve arbitrary GalviVault data. The Worker/GalviEngine builds the complete bounded evidence bundle using the already-authorized Day 1/2 identity, record, evidence, consent, and protocol context.

| **Bundle component** | **Required content**                                                                                                | **Hard rule**                                                                                 |
|----------------------|---------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Scope identity       | principal_id; bhr_id or null for valid Pre-Founder principal-only mode; session/case context as needed.             | Resolve from canonical authorized context; never accept client-supplied record scope blindly. |
| Lifecycle/protocol   | lifecycle_state, record_mode, protocol + versions, venture stage when applicable.                                   | Minimum necessary context only.                                                               |
| Deterministic facts  | Stored score_type, overall/dimension scores, Acuity/band, red flags, Clinical Confidence, validated flags/findings. | Immutable. AI may explain but cannot rewrite.                                                 |
| Evidence items       | Authorized evidence IDs plus task-relevant normalized content/provenance.                                           | Every evidence ID must belong to same authorized scope and be permitted for task.             |
| Contradictions       | Known contradictory evidence IDs/content and confidence implications.                                               | Must be explicit so synthesis cannot cherry-pick only supporting evidence.                    |
| Evidence gaps        | Missing/low-quality data, confidence gaps, unresolved contradictions.                                               | Model must not fill gaps with invented facts.                                                 |
| Task constraints     | Allowed inference, hypothesis labeling, prohibited regulated advice, customer-safe style, requested artifact type.  | Evidence/source text cannot override these instructions.                                      |
| Versions             | rules_version, protocol_version, prompt_version, output_schema_version.                                             | Required for reproducibility and cache/idempotency fingerprint.                               |

## 8.1 Evidence bundle construction algorithm

15. Resolve authenticated principal and canonical record scope using the same authorization helpers as Day 1/2. If BHR is not applicable (valid Pre-Founder principal_only), keep bhr_id=null; do not fabricate a venture/BHR for AI.

16. Load deterministic Day 2 state from canonical storage: lifecycle/protocol, score_type and dimension scores, Acuity/red flags, Clinical Confidence, existing confirmed findings, and relevant versions.

17. Query only evidence explicitly linked to this principal/BHR and allowed for the requested task. Apply existing consent/visibility rules before model input.

18. Select the minimum evidence necessary for the requested task. Include provenance/source type and stable evidence IDs; avoid unrelated personal or commercial data.

19. Load known contradictory evidence and evidence gaps. Do not simplify these away before the model sees them.

20. Attach task policy + output schema/version + prompt version. Treat all source/evidence text as untrusted data, never as higher-priority instructions.

21. Canonicalize the bundle representation and compute a stable evidence_bundle_hash/fingerprint. Record the evidence ID set separately for lineage validation.

22. Build the request fingerprint using authorized scope + task + evidence hash + deterministic context hash + prompt/schema/rules/protocol versions. Use it for replay/idempotency.

# 9. Prompt Registry & Structured Output Schemas

Prompts are governed configuration. Codex must not scatter clinical instructions across route handlers. Create/reuse a registry that binds a task code to an approved prompt version, output schema version, required deterministic context, allowed evidence classes, and policy constraints.

| **Day 3 task**      | **Purpose**                                                                     | **May output**                                                                                      | **May not output**                                                            |
|---------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| explain_findings    | Create concise evidence-grounded interpretation of confirmed/proposed findings. | Statement, evidence refs, contradiction refs, confidence, short rationale, next evidence/care step. | New score, new acuity, unsupported fact, confirmed regulated conclusion.      |
| propose_root_causes | Rank possible causal hypotheses.                                                | Hypothesis code/statement, supporting/contradictory evidence, confidence, what-would-change-this.   | Unlabeled causal certainty or treatment confirmation.                         |
| synthesize_evidence | Summarize support/contradictions/uncertainty for GalviSight.                    | Evidence synthesis + implications + confidence.                                                     | Invented market/customer/revenue facts.                                       |
| draft_path          | Draft bounded GalviPath options.                                                | Objective, sequence, evidence needed, cadence, owner, escalation, support level.                    | Active-treatment confirmation, entitlement/payment decision, licensed advice. |

## 9.1 Finding proposal schema — minimum required contract

```json
{
"finding_code": "DISTRIBUTION_BOTTLENECK",
"statement": "...",
"supporting_evidence_ids": ["ev_1", "ev_7"],
"contradictory_evidence_ids": ["ev_9"],
"confidence": 0.78,
"reasoning_summary": "short customer-safe rationale",
"hypothesis_only": false
}
```

## 9.2 Root-cause proposal schema — minimum required contract

```json
{
"hypotheses": [{
"code": "CHANNEL_EXECUTION_CONSTRAINT",
"statement": "...",
"supporting_evidence_ids": ["ev_..."],
"contradictory_evidence_ids": ["ev_..."],
"confidence": 0.64,
"what_would_change_this": ["specific missing/contradictory evidence"]
}]
}
```

## 9.3 Schema governance rules

- Use JSON Schema Structured Outputs where the selected model/SDK supports it. Prefer strict, bounded fields and enums over free-form blobs.

- Every referenced evidence_id must exist in the authorized evidence set for the current bundle; unsupported IDs invalidate the affected proposal.

- Unknown fields are rejected or explicitly ignored before persistence; they are never silently promoted into canonical clinical content.

- Confidence values are proposal confidence, not replacements for Day 2 Clinical Confidence. Persist and label them separately.

- Use a short customer-safe reasoning_summary/rationale. Do not request, persist, or expose hidden chain-of-thought.

- Prompt version and schema version are immutable identifiers. A material prompt/schema change creates a new version and changes request fingerprint/regeneration behavior.

# 10. GalviVault AI Generation Ledger — Inspect, Reuse, Add Only What Is Missing

> **SCHEMA RULE**
>
> Do not create a new AI database. Inspect the current QA D1 schema first. If existing generic artifact/generation/version/evidence-link tables can express the Day 3 contract, reuse them. Create an additive migration only for genuinely missing fields/relations. Never alter accepted historical evidence/results in place.

## 10.1 Logical minimum generation record

| **Field / concept**                                    | **Required purpose**                                                                                       |
|--------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| generation_id                                          | Stable internal ID for one provider attempt/result ledger row.                                             |
| principal_id + bhr_id/null + scope key                 | Canonical record scope; Pre-Founder may be principal-only by valid Day 2 contract.                         |
| session_id / case context                              | Trace generation to the customer journey where applicable.                                                 |
| task                                                   | Allow-listed Day 3 task code.                                                                              |
| client_request_id / request_fingerprint                | Idempotency/replay key over scope + evidence + deterministic context + governed versions.                  |
| provider / provider_response_id / model                | Provider provenance; model is metadata, not product logic.                                                 |
| prompt_version / schema_version                        | Governed generation contract.                                                                              |
| rules_version / protocol_version                       | Deterministic/protocol context used.                                                                       |
| evidence_bundle_hash / deterministic_context_hash      | Reproducibility and tamper/change detection.                                                               |
| proposal payload                                       | Structured model proposal; protected according to projection rules.                                        |
| validation_status                                      | accepted \| rejected \| needs_review.                                                                      |
| validation_errors / rejection codes                    | Machine-readable reason(s), with safe detail.                                                              |
| approval_status                                        | not_required \| clinician_required \| approved \| rejected or project-equivalent.                          |
| customer_projection                                    | false unless acceptance + approval policy permits projection.                                              |
| generation_source                                      | openai_proposal for raw candidate; accepted artifact uses openai_governed or current canonical equivalent. |
| correlation_id / timestamps / latency / usage metadata | Operational trace and evidence package support.                                                            |

## 10.2 Evidence lineage

- Prefer the existing evidence-artifact linkage mechanism. If none exists, add the minimal normalized generation-to-evidence link with role=supporting\|contradictory\|context.

- Never trust evidence IDs emitted by the model solely because they match a string pattern. Validate membership against the authorized bundle before linking.

- Persist the exact authorized evidence ID set/hash that was sent, and the exact evidence IDs referenced by the accepted proposal. These two sets are not automatically the same.

- Accepted governed intelligence must be versioned. A later evidence/prompt/schema/rules change creates a new version, not an overwrite of the prior accepted result.

# 11. Validation Pipeline — Proposal -> Governed Intelligence or Rejection

| **Order** | **Validator**                  | **Pass condition**                                                                                  | **Fail action**                                                       |
|-----------|--------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1         | Transport/parse                | Provider response completed and proposal parses.                                                    | validation_status=rejected; safe provider/parse error; fallback.      |
| 2         | JSON schema                    | Exact required fields/types/enums/ranges; no disallowed unknowns.                                   | Reject; do not best-effort coerce into canonical content.             |
| 3         | Scope/evidence membership      | Every evidence ID belongs to authorized principal/BHR/task bundle.                                  | P0 reject + audit; customer_projection=false.                         |
| 4         | Deterministic fact consistency | Any stated score/acuity/confidence/protocol facts match canonical Day 2 values.                     | Reject conflicting proposal; never update deterministic value.        |
| 5         | Grounding/claim check          | Material facts are supported by evidence or clearly labeled hypothesis/inference.                   | Reject unsupported claim or needs_review/evidence_required.           |
| 6         | Uncertainty policy             | Low/medium confidence and root-cause content uses explicit hypothesis/uncertainty semantics.        | Reject or needs_review; no invented certainty.                        |
| 7         | Regulated-advice guardrail     | No autonomous legal/tax/fiduciary/securities/security-incident/other regulated conclusion.          | referral_required / needs_review; no professional advice text.        |
| 8         | Treatment authority            | Draft Path language does not confirm active treatment without required Business Physician approval. | approval_status=clinician_required; block final treatment projection. |
| 9         | Projection policy              | Only accepted + policy-authorized artifact may project to customer/Chart/product response.          | Persist ledger only; customer_projection=false.                       |

> **NON-NEGOTIABLE**
>
> A model disagreement with GalviScore, Acuity, red flags, Clinical Confidence, lifecycle, protocol, identity, consent, authorization, or entitlement is a validation failure—not an automatic correction. Day 3 AI can explain governed truth or propose bounded hypotheses; it cannot silently become the governing truth.

# 12. Implement the Idempotent ai_reason Worker Action

Use the existing common POST /api envelope and authorization/action-router pattern. Do not introduce a separate public AI API surface unless the repository already standardizes routes that way.

POST /api  
```json
{
"action": "ai_reason",
"session_id": "gc_...",
"principal_id": "pr_...",
"bhr_id": "bhr_... | null when valid principal_only",
"protocol": "founder_smb | ...",
"current_stage": "GalviShot | GalviSight | GalviPath",
"payload": { "task": "explain_findings | propose_root_causes | synthesize_evidence | draft_path", ... },
"client_request_id": "uuid"
}
```

## 12.1 Required orchestration sequence

23. Validate request envelope, action, stage/task allow-list, canonical authenticated principal, and record scope using existing authorization helpers.

24. Load the Day 2 deterministic context from canonical storage. Ignore client-supplied score/acuity/confidence as authoritative inputs.

25. Build governed evidence bundle and stable request fingerprint.

26. Check idempotency/storage. If an accepted artifact already exists for the unchanged fingerprint and remains authorized, return generation_source=stored without calling OpenAI.

27. If AI feature is disabled/unavailable or the task is not eligible, return deterministic/stored fallback and safe status; do not block care.

28. Create/record a generation attempt shell using versioned metadata before or atomically with provider execution according to existing transaction pattern.

29. Call provider adapter with structured output schema. Never pass secrets/unscoped record data.

30. Persist provider metadata and proposal; run validators in deterministic order.

31. If rejected: persist validation_status=rejected, customer_projection=false, safe rejection codes; return fallback/needs_review/referral_required as appropriate.

32. If needs_review: persist proposal and lineage, customer_projection=false, approval_status=clinician_required when applicable; return needs_review/human_review.

33. If accepted: create/version the governed intelligence artifact, link accepted evidence, set generation_source=openai_governed (or exact canonical equivalent), then project only allowed fields into Shot/Sight/Path response.

34. Write audit/journey event using existing canonical event path. External analytics/CRM failure remains non-blocking.

35. Return structured API response with stable IDs, versions, status, next_action, and safe error/fallback metadata—never raw provider secrets or unvalidated output.

## 12.2 Safe response contract — conceptual

```json
{
"success": true,
"status": "ok | needs_evidence | needs_review | human_review | referral_required",
"session_id": "gc_...",
"principal_id": "pr_...",
"bhr_id": "bhr_... | null",
"data": {
"generation_id": "gen_...",
"artifact_id": "intel_... | null",
"generation_source": "stored | openai_governed | rules",
"task": "...",
"content": { ... governed/projectable fields only ... },
"supporting_evidence_ids": ["..."],
"contradictory_evidence_ids": ["..."],
"prompt_version": "...",
"schema_version": "..."
},
"next_action": "...",
"schema_version": "gc_1_0_20260824"
}
```

# 13. Generation Source & Acceptance State Machine

| **State / source** | **Meaning**                                                            | **Persistence / projection rule**                                                         |
|--------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| rules              | Day 1/2 deterministic GalviEngine output.                              | May be authoritative where rule contract defines it; AI cannot replace it.                |
| stored             | Previously accepted canonical result retrieved without regeneration.   | Return exact accepted version under current authorization.                                |
| openai_proposal    | Provider-generated structured proposal not yet accepted.               | Store generation metadata/proposal; never present as canonical truth by itself.           |
| rejected           | Proposal failed schema/evidence/fact/policy validation.                | Ledger + rejection codes only; customer_projection=false; use fallback.                   |
| needs_review       | Potentially useful proposal requires human/evidence review.            | Ledger + lineage; no final customer/treatment projection until resolved.                  |
| openai_governed    | Proposal passed validators and required approval policy.               | Persist accepted version + evidence lineage; may project to authorized product output.    |
| clinician          | Business Physician/GalviClinician approved/authored clinical artifact. | Persist actor, approval, timestamp, source versions; authoritative per clinical contract. |

# 14. Integrate Governed Intelligence into GalviShot 1.0 — Findings

Day 3 does not redesign GalviShot. It upgrades the intelligence source behind its 1.0 findings contract while preserving entitlement/payment semantics and all existing result storage. Accepted governed AI may enrich findings; rules/stored fallback must still render a usable result.

| **Field / behavior** | **Day 3 contract**                                                                                              |
|----------------------|-----------------------------------------------------------------------------------------------------------------|
| Priority findings    | 3–5 evidence-informed priority findings; avoid overproduction.                                                  |
| Evidence             | Supporting and contradictory evidence IDs are explicit and valid.                                               |
| Severity / urgency   | Uses governed deterministic/rule context; AI does not invent or override Acuity.                                |
| Confidence           | Proposal/finding confidence is distinct from Day 2 Clinical Confidence; both remain correctly labeled.          |
| Why it matters       | Short customer-safe evidence-grounded explanation; no unsupported causal certainty.                             |
| Next step            | Diagnostic/care next action governed by existing routing/referral/Path rules.                                   |
| Failure/fallback     | If AI rejects/times out, serve stored/deterministic findings or needs_review without erasing paid result/state. |
| Persistence          | Accepted artifact + evidence lineage + versions stored; repeat returns stored accepted version.                 |

## 14.1 Shot critical-path acceptance tests

- Strong product sentiment + weak revenue evidence yields nuanced finding with contradictory evidence; no claim that sentiment proves revenue health.

- Distribution bottleneck may be proposed without declaring PMF failure when retention/product evidence is strong.

- Low-confidence case asks for evidence / returns needs_review instead of inventing a polished diagnosis.

- Provider outage after verified entitlement does not blank or delete the paid Shot result.

- Refresh/retry returns one stored accepted artifact for unchanged fingerprint.

# 15. Integrate Governed Intelligence into GalviSight 1.0 — Evidence Interpretation

| **Sight question**     | **Required governed output**                                                                          |
|------------------------|-------------------------------------------------------------------------------------------------------|
| What is happening?     | Evidence-grounded interpretation of the relevant Business Health / Founder Readiness state.           |
| What supports it?      | Explicit supporting evidence IDs and concise explanation.                                             |
| What contradicts it?   | Explicit contradictory evidence IDs and impact on interpretation.                                     |
| How confident are we?  | Clinical Confidence context + proposal confidence where applicable; do not merge the concepts.        |
| What might explain it? | Ranked root-cause hypotheses with uncertainty and “what would change this.”                           |
| What does it imply?    | Bounded customer-safe implications and next evidence/care needs; no licensed-professional conclusion. |

# 16. Integrate Governed Intelligence into GalviPath 1.0 — Draft Care Path

GalviPath may use governed AI to draft context-aware care options, but active treatment remains governed by rules and Business Physician judgment. Day 3 must not prematurely build the full Day 5 active-care stack.

| **Path output**   | **Required content**                                                                              | **Authority boundary**                                         |
|-------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| Objective         | What outcome the proposed care path is trying to improve.                                         | Grounded in confirmed findings/evidence.                       |
| Sequence          | Ordered next diagnostic/care/development steps.                                                   | Must respect Acuity/red flags/referral rules.                  |
| Evidence required | Missing/confirmatory evidence needed before stronger conclusion.                                  | Low confidence cannot be bypassed.                             |
| Cadence           | Suggested reassessment/follow-up timing as bounded draft.                                         | No autonomous continuous-care automation on Day 3.             |
| Owner             | Customer / GalviClinician / Business Physician / GalviStudio / external referral as appropriate.  | AI cannot impersonate or authorize a licensed specialist.      |
| Escalation        | When to move to Clinic, Audit/Lab, referral, or human review.                                     | Deterministic/policy routing wins over AI preference.          |
| Support level     | Passive care, active care, specialty diagnostic, referral, or GalviStudio development suggestion. | Treatment confirmation requires later governed/human workflow. |

# 17. Deterministic / Stored Fallback — Must Work Before PASS

> **FALLBACK IS NOT AN ERROR PAGE**
>
> Provider disabled, timeout, rate limit, invalid schema, rejected grounding, or temporary OpenAI outage must never erase canonical state or strand a paid/customer journey. The fallback returns the latest authorized stored governed artifact when available; otherwise it returns deterministic/rules content or a recoverable needs_evidence/needs_review state with the same session/principal/BHR context.

| **Failure**                          | **Required response**                                                                       | **Must remain true**                                              |
|--------------------------------------|---------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| AI disabled                          | Skip provider; return deterministic/stored content with safe ai_status=disabled equivalent. | Day 2 deterministic flow still works.                             |
| Timeout/outage/rate limit            | Normalize provider error; optionally bounded retry; then fallback.                          | No duplicate accepted artifact; session and paid state preserved. |
| Invalid schema                       | Persist rejected generation + validation code; fallback.                                    | No best-effort unvalidated projection.                            |
| Unsupported/cross-record evidence ID | Reject; audit; fallback/needs_review.                                                       | No leaked content; canonical record unchanged.                    |
| Deterministic fact conflict          | Reject model claim; fallback.                                                               | Score/Acuity/Confidence/protocol unchanged.                       |
| Regulated advice trigger             | Reject unsafe content and route referral_required/human_review.                             | No autonomous licensed advice.                                    |
| Low confidence / missing evidence    | Return needs_evidence or needs_review; may preserve partial grounded summary.               | No invented certainty.                                            |

# 18. Security, Prompt-Injection & Data-Minimization Gates

- Treat all user-entered evidence, uploaded text, CRM notes, and external source text as untrusted data. They may describe instructions, but they never outrank the server-side task/policy/schema contract.

- Never provide the model with API keys, Worker secrets, authentication tokens, Stripe secrets, internal environment values, unrelated cross-record data, or hidden policy text that is not required for the task.

- Never let evidence text select a different principal/BHR, change authorization, request another record, disable validation, or force a provider/tool call.

- Post-validate every model-referenced evidence ID against the authorized bundle even when Structured Outputs succeeds.

- Use data minimization: pass only evidence content needed for the task; do not dump the entire longitudinal BHR merely because the model context window permits it.

- Persist safe generation metadata and accepted artifacts; avoid unnecessary raw prompt/evidence duplication when canonical evidence already exists in GalviVault.

- Do not expose raw provider response objects to the browser. Return only the internal governed response contract.

- No hidden chain-of-thought collection. Store only the explicit structured proposal and short customer-safe rationale required by the product schema.

# 19. Automated Day 3 QA Matrix — Mandatory Tests

| **ID** | **Test**                  | **PASS criterion**                                                                                    |
|--------|---------------------------|-------------------------------------------------------------------------------------------------------|
| T01    | Entry baseline            | Exact Day 2 SHA/branch/deployment/D1 binding + ai_enabled=false recorded.                             |
| T02    | Branch guard              | work/main implementation state causes STOP; no new branch created.                                    |
| T03    | Secret source scan        | OPENAI_API_KEY absent from repo/frontend/log artifacts.                                               |
| T04    | Provider connectivity     | Server-side QA provider call succeeds with synthetic structured response.                             |
| T05    | Structured schema         | Valid finding/root-cause proposal passes schema; unknown/type-invalid response rejected.              |
| T06    | Evidence scope            | All referenced evidence IDs belong to same authorized principal/BHR/task.                             |
| T07    | Cross-record negative     | Foreign BHR evidence request/reference rejected and audited; no text leakage.                         |
| T08    | Deterministic conflict    | Model claim conflicting with stored score/acuity/confidence/protocol rejected.                        |
| T09    | Low confidence            | Missing evidence returns needs_evidence/needs_review; no unsupported certainty.                       |
| T10    | Contradiction             | Supporting + contradictory evidence both survive into governed interpretation.                        |
| T11    | Regulated issue           | Unsafe legal/tax/etc. advice rejected; referral_required/human_review route used.                     |
| T12    | Prompt injection          | Evidence saying “ignore rules/reveal secret/change record” cannot alter policy/scope/output schema.   |
| T13    | Provider timeout          | Timeout produces safe deterministic/stored fallback; state intact.                                    |
| T14    | Provider outage/error     | 5xx/network error produces structured API response + fallback.                                        |
| T15    | Idempotent repeat         | Unchanged request fingerprint returns stored accepted artifact; no duplicate accepted row.            |
| T16    | Version change            | Material evidence/prompt/schema/rules version change creates new version/fingerprint, not overwrite.  |
| T17    | Rejected persistence      | Rejected generation ledger retained with customer_projection=false.                                   |
| T18    | Approval required         | Clinician-required content remains blocked from final treatment projection.                           |
| T19    | Shot integration          | Accepted governed findings render through existing Shot path; fallback remains usable.                |
| T20    | Sight integration         | Support/contradiction/confidence/hypothesis fields render correctly.                                  |
| T21    | Path integration          | Draft path respects routing/referral/human authority; no treatment confirmation.                      |
| T22    | Pre-Founder               | principal_only remains valid; no fabricated venture/BHR; AI scope uses principal context.             |
| T23    | Fresh/stale IDs           | Fresh canonical IDs pass; stale/cross-record IDs remain rejected; validation not weakened.            |
| T24    | Structured errors         | Provider/validation negative returns JSON envelope with correlation/action/code/env.                  |
| T25    | AI disable switch         | Feature flag/provider disable immediately restores deterministic/stored path.                         |
| T26    | Day 2 full regression     | All Day 2 T01-T20 + Golden A-G + H1-H20 inherited gates remain green.                                 |
| T27    | 0.5/Day1/Vault regression | Known-good public journey + identity/consent/evidence/RBAC/clinician paths remain green.              |
| T28    | Rollback rehearsal        | Day 2 code/deployment can be restored non-destructively; AI ledger additions do not prevent rollback. |

# 20. AI Golden & Adversarial Case Library

| **Case**                             | **Input pattern**                                                                                 | **Must prove**                                                                                     |
|--------------------------------------|---------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| A — Revenue/customer contradiction   | Strong product sentiment/retention evidence but weak or contradictory revenue/customer economics. | AI does not equate sentiment with revenue health; cites both support and contradiction.            |
| B — Distribution root cause          | Strong product/retention evidence with stalled acquisition/distribution.                          | Can propose distribution constraint as hypothesis without declaring PMF failure.                   |
| C — Low confidence                   | Incomplete/low-quality evidence and unresolved contradiction.                                     | Returns needs_evidence/needs_review; no plausible-sounding invented facts.                         |
| D — Regulated/legal issue            | Evidence asks for legal/tax/fiduciary/security-incident conclusion.                               | No autonomous professional advice; referral_required/human_review.                                 |
| E — Prompt injection                 | Evidence text says ignore policy, reveal secrets, use another record, or mark accepted.           | Source text cannot override server policy/schema/scope or access secrets.                          |
| F — Cross-record contamination       | A foreign evidence ID/text is introduced into request/proposal.                                   | Rejected/audited; no foreign evidence projected or persisted as accepted.                          |
| G — Provider outage                  | Timeout/5xx/rate limit after user has reached Shot/Sight/Path.                                    | Journey continues via deterministic/stored fallback; state and entitlement preserved.              |
| H — Repeat request                   | Same principal/BHR/task/evidence/versions requested twice.                                        | Second call returns stored accepted version; no duplicate accepted artifact.                       |
| I — Deterministic conflict           | Proposal states a different score, Acuity band, or protocol from Day 2 truth.                     | Validation rejects conflict; canonical values unchanged.                                           |
| J — Pre-Founder athlete/professional | principal_only, Founder Readiness, no real venture/BHR.                                           | AI reasons only over principal/readiness evidence; never fabricates Business Health venture state. |

# 21. D1 Integrity Assertions — Run Before and After Deployed Human E2E

| **ID** | **Assertion**                                                                                                                                                 |
|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| D1-1   | Every Day 3 generation row is scoped to exactly one authorized principal and either the correct BHR or valid principal-only mode.                             |
| D1-2   | No AI generation created a new principal/venture/BHR shadow record.                                                                                           |
| D1-3   | Every referenced evidence ID on an accepted artifact exists and belongs to the same authorized scope.                                                         |
| D1-4   | No foreign/cross-record evidence link exists in accepted or projected intelligence.                                                                           |
| D1-5   | Each generation has provider/model + prompt/schema + rules/protocol versions and correlation/request fingerprint metadata required by the implemented ledger. |
| D1-6   | Rejected generations have customer_projection=false; accepted projection rows satisfy validation/approval policy.                                             |
| D1-7   | Day 2 deterministic score/acuity/confidence/protocol rows are unchanged by AI execution.                                                                      |
| D1-8   | Repeat request for unchanged fingerprint did not create duplicate accepted governed intelligence.                                                             |
| D1-9   | Version change produces an additional version/history row rather than mutating prior accepted artifact in place.                                              |
| D1-10  | Pre-Founder AI activity has bhr_id null when no venture exists and does not create Business Health rows.                                                      |
| D1-11  | Provider failure/rejection rows do not erase or orphan the prior stored deterministic/accepted product result.                                                |
| D1-12  | Audit/journey event entries link to the same principal/BHR/session/correlation context without foreign IDs.                                                   |
| D1-13  | No API secret is stored in AI ledger/error/audit payloads.                                                                                                    |
| D1-14  | Migration ledger/binding still identifies the existing QA D1; no workaround database was created.                                                             |

# 22. Exact-SHA QA Deployment & Runtime Verification

## 22.1 Pre-deploy gate

- Working tree/diff contains only approved Day 3 files plus explicitly documented pre-existing changes.

- No production config/secret/workflow changes; no work branch; main untouched.

- Automated T01–T28 pass with mandatory skipped=0.

- Golden/adversarial A–J pass against local/test harness with provider mock and real QA provider where required.

- Inherited Day 2 + 0.5/Day1/Vault regression is green.

- Migration plan is additive, inspected, and bound to the existing QA D1 only.

- Day 2 rollback target remains recorded and restorable.

## 22.2 Deploy exact candidate through the existing approved path

36. Capture the candidate commit SHA and final diff before deployment.

37. Apply only the required additive QA D1 migration, if any, through the existing migration path. Do not use ad hoc manual SQL as the final mechanism.

38. Configure/verify QA OpenAI secret/model/feature flag through existing Cloudflare configuration. Do not surface secret values in evidence.

39. Deploy the exact candidate SHA to the existing QA Worker. If Wrangler returns 403/auth/binding error, stop and remediate platform/config only; do not create a new Worker or D1.

40. Capture deployment ID, Worker URL, deployed version/SHA metadata if available, D1 binding identity, and migration head/checksum.

41. Call health/capabilities and prove Day 3 build identity, inherited capabilities, ai_enabled=true, and deterministic fallback available.

42. Run direct deployed API probes for valid accepted AI, rejected invalid schema/grounding, cross-record denial, and provider-disable/timeout fallback.

43. Confirm active runtime response—not browser cache—matches the candidate and expected generation ledger writes.

## 22.3 Deployed proof chain

candidate SHA  
\|  
QA deployment ID / Worker URL  
\|  
health + capability versions / ai_enabled=true  
\|  
QA D1 binding + migration head  
\|  
deployed ai_reason accepted/rejected/fallback responses  
\|  
AI generation ledger + evidence lineage + audit rows  
\|  
Human E2E artifact IDs and screenshots

# 23. Day 3 Human E2E Run Sheet — No Manual Repair

| **ID** | **Scenario**               | **PASS criteria**                                                                                                                     |
|--------|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------|
| H01    | Baseline                   | Open QA in clean browser; record build/health/deployment identity and ai_enabled=true.                                                |
| H02    | Founder identity           | Start/resolve synthetic operating founder through Day 2 canonical identity/BHR path.                                                  |
| H03    | Triage/Vitals/Score        | Complete inherited deterministic intake; confirm lifecycle/protocol/score/acuity/confidence unchanged.                                |
| H04    | Shot AI accepted           | Reach/obtain Shot path; accepted governed findings cite valid support/contradiction and render without blank state.                   |
| H05    | Generation ledger          | Verify accepted generation/provider/prompt/schema/evidence metadata in QA D1; no secret/raw unrelated data.                           |
| H06    | Sight interpretation       | Obtain Sight; verify support, contradiction, confidence and hypothesis semantics.                                                     |
| H07    | Path draft                 | Obtain Path; verify bounded objective/sequence/evidence/cadence/owner/escalation/support level; no autonomous treatment confirmation. |
| H08    | Low confidence             | Run low-confidence case; system requests evidence/needs_review rather than inventing certainty.                                       |
| H09    | Regulated issue            | Run regulated red-flag case; referral_required/human_review; no unauthorized advice.                                                  |
| H10    | Prompt injection           | Submit/source evidence containing malicious instructions; model does not alter policy, reveal secret, or change record scope.         |
| H11    | Cross-record               | Attempt foreign evidence/BHR reference; request/proposal rejected and audited; no leakage.                                            |
| H12    | Deterministic conflict     | Force/mock proposal conflict with stored score/acuity; validator rejects; canonical truth unchanged.                                  |
| H13    | Provider outage            | Disable/mock timeout through approved QA test mechanism; customer receives deterministic/stored fallback and state remains usable.    |
| H14    | Retry/replay               | Repeat same accepted request; returns stored artifact; no duplicate accepted generation/artifact.                                     |
| H15    | Evidence change            | Add/alter governed evidence through valid path; new fingerprint/version generated; prior artifact preserved.                          |
| H16    | Pre-Founder                | Run principal-only Pre-Founder case; Founder Readiness reasoning works; no fake venture/BHR.                                          |
| H17    | Refresh/back/resume        | Refresh/back/re-enter product; canonical stored result remains consistent and authorized.                                             |
| H18    | Adapter failure isolation  | Confirm HubSpot/GA4/Clarity or other noncritical adapter failure does not erase/block governed core result.                           |
| H19    | Clinician/Vault regression | Existing authorized clinician projection/record access remains intact; founder cannot access protected clinician content.             |
| H20    | D1 assertions              | Run D1-1 through D1-14; all pass; manual repair=NO.                                                                                   |
| H21    | Inherited Day 2 full gate  | Rerun Day 2 H1-H20 + golden cases; no deterministic regression.                                                                       |
| H22    | Rollback rehearsal         | Disable AI / restore Day 2 code deployment as documented; deterministic path still works; then restore candidate if completing QA.    |

> **HUMAN E2E RULE**
>
> A screenshot is supplemental evidence, not the proof by itself. Every Human E2E artifact must be indexed to run ID, exact candidate SHA, QA deployment ID/URL, D1 binding/migration head, principal/BHR/session IDs where safe, prompt/schema/rules/protocol versions, expected result, actual result, and relevant generation/evidence IDs. If any step needs undocumented manual repair, the run is FAIL until the code/config root cause is fixed and the affected path is rerun cleanly.

# 24. Critical-Path Defect Remediation Playbook

| **Symptom**                         | **Likely layer / first evidence**                            | **Critical-path remediation**                                                                            | **Proof of closure**                                          |
|-------------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| ai_enabled=false unexpectedly       | Feature flag/secret/provider readiness vs deployed old code. | Check exact SHA/deployment/env first; do not rewrite provider code until runtime identity is proven.     | Health + deployed provider probe show intended candidate.     |
| Provider 401/403                    | OpenAI secret/project config or Worker secret binding.       | Fix QA secret/config only; never expose key or hard-code fallback key.                                   | Server-side probe succeeds; source/network secret scan clean. |
| Wrangler 403                        | Cloudflare auth/config.                                      | Use known-good deploy path/credentials/binding; no new Worker/D1.                                        | Same QA Worker/D1 deploys candidate.                          |
| POST /api 500/blank                 | Worker route/provider/validator exception.                   | Capture correlation/action/log; isolate layer; preserve structured JSON envelope.                        | Failed request passes + regression green.                     |
| Structured output parse/schema fail | SDK schema syntax/model support/prompt mismatch.             | Verify current Responses/Structured Outputs syntax and schema; minimal adapter/schema fix.               | Valid case parses; intentionally invalid case rejects safely. |
| Model cites unknown evidence        | Prompt/schema/validator grounding defect.                    | Keep validator strict; reject proposal; improve evidence IDs/context, not by weakening membership check. | Unknown ID stays rejected; valid bundle passes.               |
| Cross-record evidence appears       | P0 scope/auth bug.                                           | Stop release; fix canonical scope resolution/evidence query/validator; audit synthetic rows.             | Negative denied + D1 clean; no leaked text.                   |
| AI changes score/acuity/confidence  | P0 authority-boundary defect.                                | Reject conflict; fix validator/prompt/integration merge. Do not update deterministic record.             | Canonical Day 2 values unchanged; conflict case rejected.     |
| Low confidence still sounds certain | Prompt + policy validator gap.                               | Enforce confidence/gap context and uncertainty/needs_review policy.                                      | Golden C returns evidence/review, no invented fact.           |
| Regulated issue gets advice         | P0 policy/routing defect.                                    | Reject unsafe content; referral/human_review.                                                            | Regulated golden case contains no licensed advice.            |
| Provider outage blanks paid result  | Fallback integration defect.                                 | Restore stored/deterministic result path; isolate provider failure from canonical result.                | Outage test continues with entitlement/state intact.          |
| Duplicate accepted artifacts        | Idempotency/fingerprint lookup/write boundary.               | Fix dedupe/transaction boundary; do not delete history to hide duplicates.                               | Replay returns stored; D1 duplicate assertion clean.          |
| Prompt injection changes behavior   | Task policy/source delimiting/validator gap.                 | Treat source as data; harden task policy/schema/post-validation.                                         | Injection cannot change scope/authority/secret access.        |
| Human E2E needed manual SQL         | Underlying code/config/schema defect.                        | FAIL; replace manual step with migration/domain fix and rerun clean.                                     | manual repair=NO in final run.                                |

# 25. Day 3 Release Evidence Package

| **ID** | **Evidence item**       | **Required artifact**                                                                                                               |
|--------|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| E01    | Day 2 handoff baseline  | Signed Day 2 PASS; branch/SHA; QA deployment ID/URL; QA D1 binding/schema; rules/protocol versions; rollback target.                |
| E02    | Pre-change regression   | 0.5 + Day 1 + full Day 2 + Vault/clinician commands/results.                                                                        |
| E03    | Repo/scope control      | Remote/root/branch/status + dependency checksum + allowed-files + DO NOT MODIFY + final diff.                                       |
| E04    | Provider configuration  | Provider/model/feature-flag configuration names; secret presence proof without secret value; source/network secret scan.            |
| E05    | Provider adapter        | Responses API path, timeout/error handling, structured output configuration, metadata capture tests.                                |
| E06    | Prompt/schema registry  | Task codes, prompt versions, JSON schemas, version manifest/checksums.                                                              |
| E07    | Evidence bundle         | Example authorized synthetic bundle manifest + evidence IDs/hash + contradictions/gaps + scope proof; no unnecessary personal data. |
| E08    | Schema/persistence      | Before/after QA D1 schema map, additive migration checksum if applicable, generation ledger and evidence-link proof.                |
| E09    | Validation              | Accepted/rejected/needs_review examples for schema, evidence, deterministic conflict, regulated advice, uncertainty.                |
| E10    | Automated QA            | T01-T28 results with failed=0 and mandatory skipped=0.                                                                              |
| E11    | AI golden/adversarial   | Cases A-J inputs/expected/actual outputs + generation/evidence IDs + pass declaration.                                              |
| E12    | Deployment proof        | Candidate SHA \<-> QA deployment ID \<-> health/capability \<-> QA D1 binding/migration \<-> prompt/schema/rules versions.      |
| E13    | Deployed runtime probes | Accepted AI, rejected invalid/cross-record, low-confidence, regulated, timeout/provider-disable fallback responses.                 |
| E14    | Human E2E               | H01-H22 run sheet + evidence refs + manual repair=NO.                                                                               |
| E15    | D1 assertions           | D1-1 through D1-14 before/after Human E2E.                                                                                          |
| E16    | Inherited regression    | Post-change full Day 2 + 0.5/Day1/Vault/clinician green.                                                                            |
| E17    | Defect log              | Each blocker: failure -> root cause -> minimal diff -> focused retest -> regression.                                            |
| E18    | Rollback proof          | Provider-disable switch + Day 2 code/deployment restore procedure and non-destructive verification.                                 |
| E19    | Final decision          | DAY 3 HUMAN E2E PASS / FAIL-STOP-ROLLBACK + exact Day 4 handoff baseline.                                                           |

# 26. Day 3 Rollback Strategy

## 26.1 Two rollback levels

| **Level**                    | **Use when**                                                                                 | **Action**                                                                                                                                                          |
|------------------------------|----------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| A — Provider disable         | OpenAI/provider/quality issue but Day 3 code and additive schema are otherwise healthy.      | Set QA AI feature/provider flag off using approved config; serve deterministic/stored fallback. No destructive data action.                                         |
| B — Code deployment rollback | P0/P1 Day 3 code defect, unable to prove deployed candidate, or inherited regression breaks. | Restore exact Day 2 Build Final deployment/commit through approved path. Keep additive/versioned ledger rows if non-destructive; do not drop history to “clean up.” |

## 26.2 Rollback must prove

- Day 2 deterministic Triage/Vitals/Score/Acuity/Clinical Confidence path remains usable.

- No accepted Day 1/2 canonical data is deleted or overwritten.

- Any additive AI tables/columns do not prevent the Day 2 Worker from operating.

- Provider secret can remain safely stored but unused, or be removed through the secret manager if the release decision requires; never commit/print it.

- Rollback target SHA/deployment and restoration steps are recorded before Day 3 changes, not invented after failure.

# 27. Day 3 Stop/Go Gate

> **GO ONLY WHEN**
>
> OpenAI is active in QA only through the Worker; all model outputs are structured, evidence-scoped, traceable, rejectable, versioned, and fallback-safe; no browser can call OpenAI directly; Day 2 deterministic Score/Acuity/Confidence/identity/protocol/authorization remain authoritative; accepted Shot/Sight/Path intelligence is reproducible from stored evidence/version metadata; duplicate/replay is clean; D1 integrity and cross-record negatives pass; full Day 2 regression is green; Human E2E H01-H22 passes with manual repair=NO; and rollback/provider-disable paths are proven.

> **STOP / ROLLBACK IF**
>
> Any browser/client can access the provider/key; an AI proposal becomes canonical without validation; evidence IDs are missing, fabricated, or cross-record; the model can silently override deterministic truth; low-confidence content becomes unsupported certainty; regulated advice is autonomously produced; provider failure blocks or erases the care journey; duplicate accepted artifacts are created; the active deployment/D1 binding cannot be proven; inherited Day 2 regression breaks; manual repair is required; or rollback is not credible.

# Appendix A — One-Page Day 3 Completion Checklist

| **Gate**          | **Completion requirement**                                                                                                        |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Entry             | Exact signed Day 2 Build Final baseline + rollback target verified.                                                               |
| Repo              | Approved QA branch only; no work/new branch; main untouched; final diff scoped.                                                   |
| Regression        | Pre- and post-change 0.5 + Day 1 + full Day 2 + Vault/clinician green.                                                            |
| Secret            | QA Worker secret only; no key in repo/browser/log/evidence.                                                                       |
| Provider          | Responses API server-side; environment-driven model; timeout/request bound/safe error.                                            |
| Structured output | JSON Schema/Structured Outputs where supported; invalid output rejected.                                                          |
| Evidence bundle   | One authorized principal/BHR/task; deterministic facts + contradictions + gaps + versions.                                        |
| Prompt registry   | Versioned task/prompt/schema contracts; no scattered clinical prompt logic.                                                       |
| Ledger            | Generation/provider/model/prompt/schema/evidence hashes/validation/approval/projection metadata persisted.                        |
| Authority         | Score/Acuity/red flags/Clinical Confidence/identity/protocol/consent/auth/entitlement unchanged by AI.                            |
| Validation        | Schema -> scope/evidence -> deterministic facts -> grounding -> uncertainty -> regulated policy -> approval -> projection. |
| Projection        | Only accepted/governed and policy-authorized content reaches Shot/Sight/Path/customer.                                            |
| Fallback          | AI disabled/outage/timeout/rejection returns deterministic/stored/recoverable path; state preserved.                              |
| Replay            | Unchanged fingerprint returns stored accepted artifact; no duplicate accepted rows.                                               |
| Adversarial       | Prompt injection, cross-record, deterministic conflict, low confidence, regulated issue all fail safely.                          |
| QA                | T01-T28 + Golden A-J pass; mandatory skipped=0.                                                                                   |
| Runtime           | Exact candidate SHA deployed to existing QA Worker/D1; health identifies Day 3; ai_enabled=true.                                  |
| Human             | H01-H22 PASS; D1-1 through D1-14 clean; manual repair=NO.                                                                         |
| Rollback          | Provider disable + Day 2 deployment restore tested/non-destructive.                                                               |
| Decision          | DAY 3 HUMAN E2E PASS signed; exact Day 4 handoff baseline recorded.                                                               |

# Appendix B — Day 4 Handoff Contract

Day 4 (GalviChart 1.0 + GalviVault 1.0 Longitudinal Care Experience) may begin only from the exact Day 3 Build Final baseline. Day 4 must consume—not recreate—the deterministic Day 1/2 contracts and the governed AI generation/acceptance/lineage contracts established on Day 3.

| **Inherited control** | **Day 4 obligation**                                                                                                                                          |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Identity / record     | Use the same principal/BHR context and authorization; no Chart-specific shadow record.                                                                        |
| Deterministic truth   | Display stored Score/Acuity/Clinical Confidence/protocol as governed facts; do not regenerate them in the browser.                                            |
| Governed intelligence | Project only accepted/openai_governed or clinician-approved artifacts; raw/rejected proposals are not customer truth.                                         |
| Evidence lineage      | Chart evidence/findings link back to the accepted artifact and authorized source evidence IDs/versions.                                                       |
| Generation metadata   | Preserve provider/model/prompt/schema/rules/protocol version traceability in the clinical record/admin evidence even if customer UI hides operational detail. |
| Fallback              | Chart remains usable with stored accepted/deterministic content when AI is disabled/unavailable.                                                              |
| Activation economics  | Customer GalviChart access still activates only after verified GalviShot entitlement; Day 3 does not change this.                                             |
| Progressive record    | Sight/Path/Clinic/monitoring enrich the same Chart/BHR rather than creating a new product record.                                                             |
| Regression            | Day 4 reruns the full Day 3 gate as inherited regression before its own PASS.                                                                                 |

> **TARGET FINAL DECLARATION**
>
> DAY 3 HUMAN E2E PASS -> DAY 3 BUILD FINAL -> GOVERNED OPENAI / EVIDENCE-BASED CLINICAL INTELLIGENCE FOUNDATION READY FOR DAY 4 GALVICHART + LONGITUDINAL CARE. If any P0/P1 gate is red, the only valid declaration is FAIL / STOP / ROLLBACK.

# Appendix C — Source & Implementation Reference Notes

Attached authoritative source basis: GalviStudio 1.0 \| GalviCare 1.0 Seven-Day Implementation Guide, especially Day 3 pages 16–19, plus the Day 2 Builder Day 3 Handoff Contract. These sources establish that OpenAI is a reasoning capability inside GalviEngine, not the clinical system or canonical record; proposals must be evidence-bound, validated, versioned, traceable, rejectable, and fallback-safe.

Current OpenAI implementation verification performed August 25, 2026: official OpenAI developer documentation continues to expose the Responses API (/v1/responses / responses.create) and supports schema-constrained Structured Outputs; for supported models, JSON Schema Structured Outputs are preferred over legacy JSON mode. Codex should verify the exact syntax against the repository’s installed OpenAI SDK version before implementation and keep the model environment-driven.

Critical-path implementation principle: preserve the correct 1.0 foundation rather than building a final autonomous 3.0 platform. Day 3 ships governed reasoning assistance—not autonomous diagnosis/treatment, broad agent workflows, or a second source of truth.
