# GALVISTUDIO 1.0 | GALVICARE 1.0

## Day 6 Builder Guide

**GalviStudio 1.0 Venture Development Management + GalviPro Practice System**

**CODEX IMPLEMENTATION ENGINEER EDITION | v1.0**

> **CURRENT BUILD STATUS**
>
> DAY 5 BUILD FINAL IS THE ONLY AUTHORIZED STARTING POINT. The current handoff from the Day 5 Build2 execution is QA run #64 at 43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c. Codex must independently fetch and prove that this exact signed Day 5 Build Final is still the authoritative origin/qa-revamped-galvicare-0-5 baseline before any edit. If the remote ref moved or any Day 5 P0/P1 gate is red, STOP.

> **DAY 6 MISSION**
>
> Make GalviStudio a procurement-ready Venture Development & Innovation Management Studio that can receive a governed care prescription, place the person/venture into the correct SPUR/program/stage, execute an evidence-gated intervention, and write outcomes back to the same GalviVault/GalviChart record. Standardize GalviPro as a Business Physician practice using the Day 5 Clinic/Treatment Plan system rather than creating an unstructured advisory layer.

> **CRITICAL-PATH RULE**
>
> Every Day 6 change must do one of seven things: preserve the exact Day 5 closed-loop baseline; operationalize the four GalviStudio pillars; productize FDI/SPUR; implement evidence-gated Venture Development stage gates; connect prescribed Sprints/interventions to the existing Treatment Plan and BHR; standardize GalviPro practice roles and regulated boundaries; or close Day 6 QA/release evidence. Anything else is deferred.

# How Codex Must Use This Builder

This is an implementation runbook, not a design brainstorm. Prove the exact Day 5 Build Final baseline first; inventory the real repository, existing Worker actions, D1 schema, Treatment Plan/monitoring objects, Chart projection, clinician workspace, deployment workflow/path filters, and current tests; then implement the smallest additive Day 6 delta. Run focused tests, the full inherited Day 5 + Day 4 + Day 3 regression, exact-SHA deployed QA verification, D1 integrity assertions, Human E2E, and rollback. Stop on the first P0/P1 defect and remediate only the proven root cause.

| **Priority** | **Instruction** | **Practical meaning** |
| --- | --- | --- |
| P0 | Exact Day 5 handoff only | Begin only from signed Day 5 Build Final SHA, QA runtime, QA D1 binding/schema, Day 5 evidence, and rollback target. |
| P0 | Approved QA ref only | Use existing qa-revamped-galvicare-0-5. Never create/push work, Day6, workaround, or branch-family refs. main is read-only. |
| P0 | Production untouched | No main merge, PROD deploy/migration, LIVE Stripe/auth change, or public cutover on Day 6. |
| P0 | One canonical longitudinal record | Studio engagement, gates, artifacts and outcomes attach to existing principal/BHR/plan/action context; no Studio shadow record system. |
| P0 | Evidence-gated advancement | ADVANCE/HOLD/REWORK/STOP must be based on required/current evidence and actor authority; no narrative-only advancement. |
| P0 | Business Physician boundaries preserved | Studio cannot become a bypass around clinician governance or regulated external referral rules. |
| P0 | Material writes idempotent/versioned | Replay must not duplicate engagement, gate decision, artifact, outcome, or Chart history. |
| P1 | Evidence decides completion | Local rendering is insufficient. Exact-SHA QA, D1 assertions, permission negatives, Human E2E and rollback determine PASS/FAIL. |

# 1. Day 6 Scope Decision, Objectives & Definition of Done

Authoritative Day 6 objective: make GalviStudio 1.0 a real Venture Development operating system connected to care, and make GalviPro a standardized Business Physician practice. The Day 6 build is not a new platform rewrite; it is the minimum operational layer required to convert a governed care prescription into a staged Studio intervention and return outcome evidence to the same longitudinal record.

## 1.1 Day 6 Definition of Done

- [ ] Exact Day 5 Build Final SHA/deployment/D1 binding/schema/rollback target is captured before edits; DAY 5 HUMAN E2E PASS evidence exists and inherited tests are green.

- [ ] qa-revamped-galvicare-0-5 is the only remote implementation ref; main remains untouched; no work/new remote branch is created or pushed.

- [ ] Four-pillar GalviStudio service catalog is operational with customer, entry signal, deliverable, duration pattern, evidence/outcome, and next handoff for each launch package.

- [ ] FDI is represented as an institution inside GalviStudio, and SPUR Dreamer / Founder / Operator-Steward tracks use the six stages Discern, Discover, Prepare, Validate, Build, Steward.

- [ ] Venture Development Management stage gates persist entry criteria, required evidence, current evidence, intervention, capital exposure, decision, actor, exit criteria, and outcome.

- [ ] ADVANCE, HOLD, REWORK, and STOP are server-governed decisions; insufficient evidence can hold or stop progress without forcing venture launch or capital deployment.

- [ ] Initial repeatable Sprint library is operational: Founder Readiness, Venture Validation, Product Readiness, GTM Readiness, Revenue/Growth Recovery, Operational Readiness, Fundraising/Capital Readiness.

- [ ] GalviPath or GalviClinic Treatment Plan can prescribe a Studio engagement using support_level=galvistudio and an intervention_code linked to source plan/action.

- [ ] Studio engagement can be created for a principal-only Pre-Founder without fabricating a venture/BHR; operating-venture engagements use the same canonical BHR.

- [ ] Studio entry gate, evidence requirements, artifacts, exit gate, and outcome evidence are persisted/versioned and can update Chart only through the existing governed projection path.

- [ ] Studio outcome writeback reaches GalviVault and produces an explicit reassessment event for the next GalviEngine/GalviCare decision.

- [ ] GalviCare Venture 001 proof case is populated with evidence across Founder, Product, Business and Corporate Development plus Studio operating proof.

- [ ] GalviPro practice protocol preserves Business Physician judgment/clinical sign-off while GalviClinician/GalviGuide handle bounded routine coordination/navigation.

- [ ] GalviGage requires a diagnosed/treatment-plan use case, fixed scope, objective, expected evidence, duration, and follow-up; no diagnosis-free custom consulting project.

- [ ] Regulated legal/tax/securities/fiduciary/regulated financial and other licensed specialties remain external referral paths.

- [ ] No Day 6 read causes a write, AI regeneration, duplicate Studio object, new principal/BHR/Chart identity, or silent stage advance.

- [ ] Full inherited Day 5 + Day 4 + Day 3 regression, Day 6 automated QA, D1 assertions, exact-SHA deployed probes, Human E2E, and rollback pass with manual repair=NO.

- [ ] Final declaration is DAY 6 HUMAN E2E PASS / DAY 6 BUILD FINAL or DAY 6 FAIL / STOP / ROLLBACK.

## 1.2 Explicit in-scope / out-of-scope

| **Capability** | **Day 6 requirement** | **Not authorized on Day 6** |
| --- | --- | --- |
| GalviStudio 1.0 | Operational four-pillar catalog and prescribed intervention lifecycle. | Large standalone Studio application, generic project-management suite, unrelated CRM rewrite. |
| FDI / SPUR | Three tracks and six-stage curriculum architecture tied to principal/venture state and evidence. | Accreditation claims, broad LMS build, speculative community platform. |
| VDM stage gates | Evidence-gated ADVANCE/HOLD/REWORK/STOP with optionality-first capital policy. | Automatic capital deployment, forced venture launch, narrative-only gate passage. |
| Sprints | Initial repeatable Treatment/Readiness Sprint definitions and engagement lifecycle. | Unlimited custom consulting work without treatment/entry/outcome contract. |
| Care -> Studio handoff | Treatment Plan/Path prescription creates linked Studio engagement on same canonical context. | Manual reconstruction, copying records to another system, client-side truth. |
| Studio -> Vault | Artifacts/outcomes return as governed evidence and trigger reassessment. | Direct customer-side overwrite of canonical Chart/BHR history. |
| Venture 001 | Evidence-backed flagship proof case across all four pillars. | Marketing-only case study with unsupported claims. |
| GalviPro practice | Standardized encounter/treatment/intervention protocol and role split. | Separate advisory chart, hidden clinician authority, bypass of Day 5 governance. |
| Commercial packaging | Minimum market-ready package definitions/service copy; data and CTA contract only. | Pricing redesign, LIVE checkout changes, production cutover. |
| Production | None. QA only. | main merge, PROD deploy/migration, LIVE secrets/payment/auth change. |

# 2. Recurring GalviCare/GalviVault Defects - Day 6 Mandatory Prevention Controls

These controls convert the recurring work-branch, stale-base, deployment-path, path-filter, D1, identity, authorization, projection, and manual-repair failures into Day 6 release gates. They are release controls, not optional engineering preferences.

| **Defect pattern** | **Observed risk** | **Day 6 control** | **Required proof** |
| --- | --- | --- | --- |
| Branch drift / work checkout | Codex edits or commits on work and cannot safely advance QA. | STOP before edits if checkout is work/main or upstream is not origin/qa-revamped-galvicare-0-5. Use approved QA ref or detached/API fallback lane. | Repo + remote + branch/upstream + base SHA + final remote QA SHA. |
| Wrong remote/base | Day 6 patch is based on stale/non-authoritative history. | Fetch origin; verify mrgalvipro/galvitriage; capture exact signed Day 5 Build Final SHA; do not infer from local latest HEAD. | Signed Day 5 SHA equals candidate parent; remote QA proof. |
| Deployment path-filter drift | A valid code change is not deployed because the workflow does not watch the changed path. | Before coding, inspect deploy trigger/path filters. Any critical new/changed path must be demonstrably included or an existing watched location reused. Change workflow only for a proven coverage defect. | Candidate SHA -> workflow run -> deployed runtime marker, including changed Day 6 service file. |
| Unrelated workflow rewrite | Studio feature destabilizes existing Day 1-5 deploy/QA. | Create allowed-file manifest after discovery; no workflow/YAML rewrite unless failing deployment coverage proves necessity. | Diff manifest + reason each file is critical path. |
| Deployment drift | Local candidate passes while active QA serves older code. | Deploy exact candidate SHA only through proven Day 5 path; verify runtime marker/capability and direct Studio probes. | SHA <-> deployment ID <-> runtime behavior chain. |
| Wrangler/auth/binding mismatch | Auth/config issue triggers speculative Worker/DB creation. | Compare to known-good Day 5 Cloudflare config/bindings. Fix auth/config only; never create bypass Worker/DB. | Same existing QA Worker/D1 binding + smoke PASS. |
| Shadow Studio record system | Developer creates separate canonical Studio/customer record. | Attach engagements/gates/outcomes to principal/BHR/plan/action; Pre-Founder may be principal-only without fake BHR. | No competing truth; scope lineage proven. |
| Stage gate without evidence | UI can advance venture/program from arbitrary payload. | Worker validates required/current evidence and allowed transition; decision actor stored. | Negative denied; positive gate row contains evidence refs and actor. |
| Optionality policy bypass | System nudges venture launch/capital despite weak evidence. | HOLD/REWORK/STOP are first-class; capital_exposure requires gate evidence and explicit authorized decision. | Weak-evidence E2E does not advance or deploy capital. |
| Manual care-to-Studio reconstruction | User or operator retypes clinical context into Studio. | Create engagement from source plan/action IDs and resolve canonical context server-side. | Same principal/BHR/plan IDs across handoff. |
| Cross-record Studio write | Client-supplied BHR writes another record. | Resolve scope from authenticated canonical assignment and verify any IDs against it. | Cross-record create/update 403/404-safe + no leak. |
| Duplicate replay | Refresh/retry duplicates engagement/gate/outcome. | client_request_id/idempotency + uniqueness/domain dedupe + side-effect-free reads. | Replay returns stored/current object; counts unchanged. |
| History overwrite | New gate or outcome replaces prior decision. | Append/version corrections; prior gate history remains traceable. | Before/after versions + audit trail. |
| GalviGuide/GalviClinician authority creep | Routine actor confirms high-stakes diagnosis/treatment or stage/capital decision beyond scope. | Server-side role/action matrix; bounded explanation/navigation only; escalate. | Adversarial role tests + audit evidence. |
| Regulated work absorbed by Studio | Studio appears to provide licensed legal/tax/securities/fiduciary advice. | Red-flag/referral policy remains fail-closed; external qualified routing. | Regulated E2E routes externally, no prohibited advice. |
| Commercial packaging breaks care | New service CTAs alter Stripe/Calendly/session contracts prematurely. | Day 6 may define package/CTA metadata but reuse Day 5 verified commercial adapters; no live changes. | Inherited payment/booking replay stays green. |
| Speculative multi-layer rewrite | UI + Worker + DB + workflows changed before failing layer known. | Name exact failing assertion/route/SQL/runtime first; smallest diff; focused retest then full regression. | Defect log proves failure -> root cause -> minimal diff -> PASS. |
| Manual QA repair | Ad hoc SQL/delete makes E2E pass. | Use migration/domain service/corrective versioning. Manual repair prohibited for PASS run. | Evidence sheet manual repair=NO. |

> **REMEDIATION RULE**
>
> When a Day 6 test fails, Codex must name the exact failing assertion, actor/authorization decision, principal/BHR/plan scope, Worker action, schema field, SQL statement, projection field, deployment path/filter, or runtime layer before editing. Fix the smallest proven root cause. Rerun the failed test first, then its regression slice, then the complete Day 6 gate. Do not simultaneously change UI + Worker + D1 + workflows unless evidence independently proves each layer is broken.

# 3. Day 6 Entry Gate & Exact Baseline Fingerprint

> **STOP UNLESS ALL ARE TRUE**
>
> Day 6 must not build the Studio operating system on top of an unproven Day 5 state. The currently expected signed Day 5 Build Final is 43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c, but Codex must re-fetch and prove the remote ref and deployed runtime before editing. If the signed final cannot be proven, restore/synchronize it first.

| **Check** | **Required starting state** | **Codex evidence** |
| --- | --- | --- |
| Repository | Authoritative mrgalvipro/galvitriage repository used by QA. | git rev-parse --show-toplevel + origin URL. |
| QA ref | Existing qa-revamped-galvicare-0-5 at exact signed Day 5 Build Final. | remote ref SHA + local/detached base SHA + parent proof. |
| Production | main is read-only reference. | origin/main SHA; no implementation checkout/deploy. |
| Working tree | Clean or explicitly explained pre-existing changes. | git status --short. |
| QA runtime | Existing QA Worker/frontend serving Day 5 Build Final. | health/capabilities + deployed SHA/version IDs. |
| D1 binding | Existing QA GalviVault D1 binding/schema; no new DB. | wrangler config + database/binding identity + schema manifest. |
| Day 3 AI | Accepted/rejected/fallback behavior remains proven; no browser OpenAI. | direct governed-AI regression. |
| Day 4 Chart | Shot activation, secure return, customer/clinician projections, History/commands remain green. | deployed regression evidence. |
| Day 5 active care | Clinic brief, finding governance, Treatment Plan, Rx/Audit/referral, bounded Guide, monitoring/outcomes all green. | Day 5 signed evidence index. |
| Rollback | Known-good Day 5 candidate and prior runtime fallback recorded. | rollback SHAs/version IDs + procedure. |
| Deployment trigger | Day 6 changed-file paths are covered by the proven QA deployment trigger/path filters. | workflow path/filter inspection before implementation. |

## 3.1 First Codex actions - no implementation yet

```text
set -euo pipefail

pwd
git rev-parse --show-toplevel
git remote -v

ORIGIN_URL="$(git remote get-url origin)"
case "$ORIGIN_URL" in
  *mrgalvipro/galvitriage* ) ;;
  * ) echo "STOP: unexpected repository remote: $ORIGIN_URL"; exit 41 ;;
esac

git fetch --prune origin qa-revamped-galvicare-0-5 main
REMOTE_QA_SHA="$(git rev-parse origin/qa-revamped-galvicare-0-5)"
REMOTE_MAIN_SHA="$(git rev-parse origin/main)"
CURRENT_BRANCH="$(git branch --show-current || true)"

printf 'current_branch=%s\nremote_qa=%s\nremote_main=%s\n' \
  "$CURRENT_BRANCH" "$REMOTE_QA_SHA" "$REMOTE_MAIN_SHA"
git status --short --branch
git branch -vv

SIGNED_DAY5_SHA="43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c"
[ "$REMOTE_QA_SHA" = "$SIGNED_DAY5_SHA" ] || {
  echo "STOP: remote QA does not equal the signed Day 5 Build Final baseline"
  exit 44
}

if [ "$CURRENT_BRANCH" = "work" ] || [ "$CURRENT_BRANCH" = "main" ]; then
  echo "STOP: do not author Day 6 on '$CURRENT_BRANCH'. Use approved QA checkout or detached/API lane."
  exit 42
fi
```

## 3.2 Preferred lane - existing QA branch checkout

- Use only when the local repository can safely checkout the already-existing qa-revamped-galvicare-0-5 ref.

- Require HEAD = origin/qa-revamped-galvicare-0-5 = signed Day 5 Build Final before edits.

- Never branch from QA into Day6/work. A local tracking checkout with the same existing remote name is allowed; no new remote ref.

- Before commit and before push, rerun branch/upstream and remote-base guards.

- Push only HEAD:refs/heads/qa-revamped-galvicare-0-5 after a final remote-base race check.

```text
git switch qa-revamped-galvicare-0-5
git merge --ff-only origin/qa-revamped-galvicare-0-5
[ "$(git rev-parse HEAD)" = "$SIGNED_DAY5_SHA" ] || exit 45
[ "$(git branch --show-current)" = "qa-revamped-galvicare-0-5" ] || exit 46
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}')"
[ "$UPSTREAM" = "origin/qa-revamped-galvicare-0-5" ] || exit 47
```

## 3.3 Fallback lane - Codex environment is pinned to work; no new branch

> **ANTI-WORK-BRANCH FALLBACK**
>
> If the Codex environment is forced to remain on work and cannot safely switch, DO NOT COMMIT OR PUSH work. Create a detached worktree from the exact signed remote QA SHA, or use the repository's previously proven GitHub blob/tree/commit API publication path. Update only the existing qa-revamped-galvicare-0-5 ref after re-verifying the remote base has not moved.

```text
BASE_SHA="$SIGNED_DAY5_SHA"
BUILD_DIR="/tmp/galvicare-day6-${BASE_SHA:0:8}"
rm -rf "$BUILD_DIR"
git worktree add --detach "$BUILD_DIR" "$BASE_SHA"
cd "$BUILD_DIR"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || exit 48

# Implement/test/commit in detached worktree.
# Then re-fetch and require the remote QA ref still equals BASE_SHA.
git fetch origin qa-revamped-galvicare-0-5
[ "$(git rev-parse origin/qa-revamped-galvicare-0-5)" = "$BASE_SHA" ] || {
  echo "STOP: remote QA moved; do not publish"
  exit 49
}

# Publication must update ONLY the existing QA ref.
git push origin HEAD:refs/heads/qa-revamped-galvicare-0-5
```

## 3.4 Required baseline fingerprint artifact

| **Field** | **Value to capture before edits** |
| --- | --- |
| repo_root | absolute repository root |
| origin_url | exact origin URL |
| signed_day5_build_final_sha | 43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c, re-verified |
| origin_qa_sha | exact fetched SHA |
| origin_main_sha | read-only reference |
| authoring_lane | approved QA checkout \| detached exact-base \| proven GitHub object API |
| qa_worker/runtime | Worker name/version/deployment ID/source SHA |
| qa_frontend | deployment ID/source SHA/URL |
| qa_d1 | binding name/database ID/schema or migration checksum |
| day3_versions | rules/prompt/schema/provider versions |
| day4_chart | activation/secure return/projection/history proof |
| day5_active_care | Clinic/plan/Rx/Audit/referral/Guide/monitoring proof |
| deploy_path_filters | workflow + path-filter coverage for intended Day 6 files |
| rollback_target | Day 5 exact immutable runtime restore target |

# 4. Day 6 Target Architecture & Authority Boundary

> **PERMANENT OPERATING MODEL**
>
> GalviCare cares. GalviEngine thinks. GalviVault remembers. GalviChart shows. GalviClinic encounters. The Business Physician decides. GalviStudio develops. GalviGuide navigates. Day 6 adds a prescribed Venture Development operating loop; it does not move clinical authority into Studio.

```text
GalviPath / GalviClinic Treatment Plan
  -> support_level = "galvistudio"
  -> intervention_code = <approved Studio/Sprint code>
  -> Worker resolves authenticated principal / optional venture BHR / source plan/action
  -> create Studio engagement
  -> entry gate + required evidence
  -> Studio work / artifact references
  -> evidence-gated ADVANCE | HOLD | REWORK | STOP
  -> exit gate + outcome evidence
  -> GalviVault append/version
  -> GalviChart authorized projection
  -> explicit reassessment
  -> next GalviEngine / GalviCare decision
```

| **Actor/layer** | **Owns** | **Must not own** |
| --- | --- | --- |
| Customer / Founder | Provide evidence, acknowledge plan/engagement, participate in work, view authorized outcomes. | Canonical stage truth, clinician-only rationale, cross-record access. |
| Business Physician | Clinical interpretation, treatment/intervention decision, escalations, complex cases, clinical sign-off. | Routine scheduling, reminders, ordinary documentation that can be delegated. |
| GalviClinician | Routine care coordination, check-ins, evidence collection/documentation, referral status. | Independent high-stakes diagnosis/treatment approval outside defined scope. |
| GalviGuide | Bounded explanation/navigation/reminders/approved resources/rule-based escalation. | Score mutation, treatment approval, licensed advice, protected notes. |
| GalviStudio operator | Execute prescribed development intervention; collect artifacts/evidence; make authorized stage-gate decisions by policy. | Rewrite clinical truth, bypass treatment/referral governance, create shadow BHR. |
| Cloudflare Worker | Authorization, canonical context resolution, idempotency, transition validation, orchestration, safe errors. | Client-side trust of IDs/roles. |
| GalviVault D1 | Canonical principal/BHR, treatment lineage, Studio engagement/gate/outcome history, audit. | Silent overwrite or projection-only competing truth. |
| GalviChart | Authorized customer/clinician/Studio projection of canonical state. | Canonical write authority. |

# 5. Repository Change Strategy - Discover First, Then Minimal Additive Delta

- Inventory existing Worker action router, domain services, schema/migrations, Chart projection service, clinician workspace, test locations, fixture strategy, and deployment workflow.

- Search for any already-existing studio_engagement / studio_stage_gate / intervention / sprint / program / stage-gate fields before adding schema.

- Inspect deployment workflow path filters BEFORE selecting new file locations. Prefer existing watched directories for Day 6 code when architecturally appropriate.

- Create an allowed-file manifest. Every changed file must map to a Day 6 gate or a proven deployment defect.

- Do not rename/reformat broad files. Do not update package versions, workflows, infrastructure, or unrelated customer screens for cleanup.

- If a migration is required, use the authoritative additive 0006_studio_vdm_stage_gates.sql slot or adapt to the current migration sequence rather than creating a parallel migration family.

## 5.1 Discovery commands

```text
git ls-files | sort > /tmp/day6-files.txt
git grep -n -E "studio|engagement|stage_gate|sprint|intervention|SPUR|Founder Development|GalviGage" -- \
  worker migrations tests public src 2>/dev/null || true

git grep -n -E "paths:|paths-ignore:|workflow_dispatch|push:" .github/workflows 2>/dev/null || true
git grep -n -E "treatment_plan|monitoring|reassessment|projection|chart" worker tests migrations 2>/dev/null || true

# Capture schema before deciding whether to migrate.
# Use the repository's proven D1 schema/introspection command against the EXISTING QA binding.
```

## 5.2 Allowed-file manifest template

| **File/path** | **Reason allowed** | **Gate/test protected** |
| --- | --- | --- |
| existing Worker router/service | Add/extend Studio engagement + stage-gate actions only. | Txx API/authorization/idempotency tests |
| existing projection service | Add authorized Studio projection fields/timeline entries only. | Chart same-identity/history tests |
| existing clinician/Studio surface | Minimal UI for prescribed engagement/gate/outcome workflow. | Human E2E |
| migrations/...0006...sql | Only if current QA schema lacks required canonical Day 6 objects/fields. | D1 integrity/rollback |
| tests/day6... | Mandatory Day 6 automated gate. | T01-T50 |
| .github/workflows/... | ONLY if proven path-filter coverage defect would prevent Day 6 candidate deployment. | exact-SHA deployment proof |

# 6. GalviVault 1.0 Data Strategy - Studio Is a Care-Linked Development Record, Not a Second MDM

Map to the current QA schema first. The authoritative data model already anticipates Studio engagement and Studio stage-gate objects. Reuse canonical equivalents if present. Add only the missing fields/tables/indexes required to preserve source lineage, versioning, idempotency, and projection.

## 6.1 Logical Day 6 objects

| **Logical object** | **Minimum fields / behavior** | **Critical invariant** |
| --- | --- | --- |
| Studio engagement | engagement_id, principal_id, bhr_id nullable when principal-only, source_plan_id, source_action_id, support_level, pillar, program_code/sprint_code, intervention_code, entry_gate, assigned_actor, status, started_at, completed_at, outcome_refs, version. | One engagement belongs to one authorized principal context and traces to care when prescribed. |
| Studio stage gate | gate_id, engagement_id, lifecycle_stage, entry_criteria, required_evidence_refs, current_evidence_refs, intervention, capital_exposure, decision, decision_actor, decision_at, exit_criteria, outcome_refs, version. | Append/version; no silent replacement of prior gate decisions. |
| Studio artifact/evidence ref | artifact_ref/evidence_id, engagement_id, type, uri or canonical evidence ref, provenance, validation_status, created_by, created_at. | Do not duplicate raw file systems in D1 if current evidence/document model already exists. |
| Studio outcome | outcome_id, engagement_id, source_gate_id, objective, metrics/evidence refs, status, recorded_by, recorded_at, reassessment_required, version. | Outcome must link back to intervention and feed reassessment. |
| Service catalog entry | pillar, package_code, audience, entry_signal, deliverables, duration_pattern, required_evidence, expected_outcomes, handoff, active/version. | Versioned configuration/content, not hidden business logic in client. |
| SPUR track/stage config | track, stage, question, minimum_deliverable, entry/exit criteria, next stage. | No fabricated venture for Dreamer/Pre-Founder. |
| Audit event | actor, role, action, entity/entity_id, purpose, environment, correlation_id, timestamp. | Append-only for material gate/intervention decisions. |

## 6.2 Migration sequence if gaps actually exist

- Inspect current QA schema and migrations. Reuse any existing studio/engagement/stage-gate structures.

- If missing, create the smallest additive migration using stable IDs, foreign-key/index strategy consistent with the current repository, and nullable BHR for principal-only Pre-Founder engagements.

- Backfill nothing unless required. Do not synthesize historical Studio records from marketing copy or old notes.

- Make all new columns nullable/default-safe so the exact Day 5 runtime can ignore them during rollback rehearsal.

- Add unique/idempotency constraints only after proving they match current domain semantics and do not collide with existing rows.

- Validate the migration against the current QA schema and then against the existing QA D1 binding only after exact binding identity is re-proven.

## 6.3 State machines

| **Object** | **Allowed 1.0 states / transitions** | **Invalid examples** |
| --- | --- | --- |
| Studio engagement | proposed -> accepted -> active -> waiting_evidence -> completed \| cancelled \| closed; adapt to current enums if already defined. | completed -> proposed by overwrite; customer directly sets completed. |
| VDM stage | Discover -> Validate -> Build -> Launch -> Operate -> Scale -> Steward -> Exit/Reinvest. | Skip directly to Scale without explicit governed evidence/gate decision. |
| Gate decision | ADVANCE \| HOLD \| REWORK \| STOP. | Implicit ADVANCE because a button was clicked. |
| SPUR stage | Discern -> Discover -> Prepare -> Validate -> Build -> Steward, with track-specific start/stop as configured. | Creating venture/BHR during Discern for a principal-only Dreamer. |
| Reassessment | continue \| modify \| escalate \| close \| prescribe_next_intervention; reuse Day 5 semantics where possible. | Studio outcome silently changes Score/Path without explicit reassessment. |

# 7. Productize the GalviStudio Four-Pillar Service Catalog

Day 6 must operationalize GalviStudio as Venture Development & Innovation Management, not as a list of capabilities. Each market-ready package needs a defined customer, entry signal, deliverable, duration pattern, evidence/outcome, and handoff.

| **Pillar** | **1.0 launch packages** | **Entry signal** | **Minimum deliverable / outcome** | **Care/Studio handoff** |
| --- | --- | --- | --- | --- |
| Founder Development | Founder Readiness \| SPUR Pathway \| Targeted Founder Development Sprint | Readiness/capability/identity gap; Pre-Founder or founder development need. | Readiness delta, development plan, thesis/curriculum evidence, demonstrated cadence. | Can originate from GalviPath/Clinic or direct Studio intake; writes evidence/outcome to principal/BHR context. |
| Product Development | Venture Validation \| Product Build \| Product Launch Readiness | Problem/customer/product/MVP/technology uncertainty. | Validated thesis, MVP/build/QA evidence, launch-readiness decision. | Treatment/Studio intervention may request product evidence then reassess care. |
| Business Development | GTM Readiness \| Commercial Launch \| Revenue/Growth Optimization | ICP/positioning/pricing/distribution/conversion/revenue weakness. | ICP/offer/channel/funnel evidence, launch plan, measured experiment/result. | Common route from GTM findings/Treatment Plan. |
| Corporate Development | Capital/Investor Readiness \| Governance/Operating Model Readiness \| Strategic Partnership Readiness | Capital/governance/partnership/portfolio/succession need. | Diligence package, governance/operating-model artifacts, partnership readiness evidence. | Regulated matters route externally; internal Studio work remains bounded. |

## 7.1 Service catalog implementation contract

- Store service-package definitions in a versioned server-readable configuration or existing content/service catalog mechanism; do not hard-code decision truth only in the browser.

- Each package_code must be stable and eligible for use as an intervention_code or explicit mapping target.

- Each package must declare whether it can be directly purchased, care-prescribed, or both; Day 6 does not change live payment architecture.

- Entry signal is not a diagnosis. It is the governed condition under which the package becomes an appropriate development intervention.

- Exit evidence must be concrete enough to support a stage-gate or GalviCare reassessment.

- External licensed-professional dependencies are represented as referral boundaries, not internal Studio deliverables.

# 8. Founder Development Institute + SPUR Productization

| **SPUR track** | **Primary person** | **Core stages / outcome** |
| --- | --- | --- |
| SPUR Dreamer | Athlete/student/professional/opportunity holder without company | Discernment + Opportunity Discovery -> Founder Life/Ownership Thesis + Evidence-Based Opportunity Thesis. |
| SPUR Founder | Individual preparing to create a venture | Founder Readiness + Venture Validation -> Readiness Development Plan + evidence-based go/no-go. |
| SPUR Operator/Steward | Existing owner/executive | Venture Creation + Founder Stewardship -> operating venture/treatment roadmap + stewardship plan. |

| **Stage** | **Clinical / development question** | **Minimum deliverable** |
| --- | --- | --- |
| 1 Discern | What life/career/ownership future is this person trying to create? | Founder Life/Ownership Thesis. |
| 2 Discover | Where does experience/capital/network create a credible opportunity to solve a real problem? | Evidence-Based Opportunity Thesis. |
| 3 Prepare | Is this person ready to become responsible for enterprise? | Founder Readiness Assessment + Development Plan. |
| 4 Validate | Is problem/customer/product/business model/distribution/revenue evidence sufficient to proceed? | Validated venture thesis + go/no-go. |
| 5 Build | Can validated evidence become a functioning enterprise? | Operating MVP/venture + 90/180/365-day roadmap. |
| 6 Steward | Can the owner responsibly scale, govern, allocate capital and plan succession/exit? | Founder Stewardship Plan. |

## 8.1 Pre-Founder identity rule

> **PRINCIPAL-ONLY SAFE PATH**
>
> A Pre-Founder/Dreamer may have a principal/FHR context and a Studio engagement before a real venture exists. Do NOT fabricate company data, venture_id, or BHR merely to satisfy a Studio schema. The engagement links to principal_id; bhr_id remains null until a real venture exists under the inherited Day 1 rules.

## 8.2 SPUR implementation acceptance

- Track/stage assignment is explicit and versioned.

- Stage transitions use evidence-gated decisions, not page completion alone.

- The current track/stage and approved deliverables may be projected to Chart/Studio UI as appropriate without exposing protected notes.

- Creating a real venture later links forward through the canonical identity mechanism; do not rewrite historical principal-only evidence.

# 9. Venture Development Management Stage Gates

```text
Discover -> Validate -> Build -> Launch -> Operate -> Scale -> Steward -> Exit/Reinvest
```

| **Gate** | **Minimum evidence before advancing** |
| --- | --- |
| Discover -> Validate | Credible problem/opportunity evidence; founder intent/readiness; target customer hypothesis. |
| Validate -> Build | Validated problem/customer evidence; value proposition; business model/GTM hypothesis; explicit go/no-go. |
| Build -> Launch | Working MVP/service; product/technical QA; launch instrumentation; clear ICP/pricing/offer. |
| Launch -> Operate | First real usage/customer/revenue evidence; delivery/ops process; health monitoring active. |
| Operate -> Scale | Repeatable demand/delivery economics; leadership capacity; systems readiness; evidence capital should be deployed. |
| Scale -> Steward | Governance, capital allocation, portfolio/succession/enterprise stewardship readiness. |

> **STAGE-GATE POLICY**
>
> Policy: Protect optionality first. Deploy capital second. A HOLD, REWORK, or STOP decision is a successful governed outcome when the evidence does not justify advancement.

## 9.1 Gate command contract

```text
POST /api
{
  "action": "record_studio_stage_gate",
  "session_id": "gc_...",
  "principal_id": "pr_...",
  "bhr_id": "bhr_... | null",
  "current_stage": "Studio",
  "payload": {
    "engagement_id": "se_...",
    "lifecycle_stage": "Validate",
    "decision": "HOLD | REWORK | ADVANCE | STOP",
    "required_evidence_ids": ["ev_..."],
    "current_evidence_ids": ["ev_..."],
    "capital_exposure": "...",
    "exit_criteria": ["..."],
    "outcome_refs": []
  },
  "client_request_id": "uuid"
}

Server must resolve actor/role/scope, validate allowed transition,
validate evidence requirements, append/version the gate decision,
write audit, and return the authorized projection.
```

## 9.2 Gate transition rules

- ADVANCE requires the configured minimum evidence or an explicitly authorized exception recorded with rationale; exceptions must not be available to customer/Guide roles.

- HOLD preserves current stage and states what evidence is still required.

- REWORK preserves traceability to the prior attempt and identifies the intervention/evidence needed before reevaluation.

- STOP closes the current venture/program path without deleting history or forcing capital/launch activity.

- capital_exposure must never be treated as approval for regulated investment/securities activity; it is internal Venture Development planning metadata.

# 10. Initial 1.0 Treatment / Readiness Sprint Library

| **Sprint** | **Typical prescription trigger** | **Required outcome evidence** |
| --- | --- | --- |
| Founder Readiness | Leadership/capability/clarity/runway gap. | Readiness delta + development plan + demonstrated operating cadence. |
| Venture Validation | Problem/customer/business model uncertainty. | Customer discovery evidence + validated thesis + go/no-go. |
| Product Readiness | Product promise/MVP/delivery/technology gap. | Defined product thesis + MVP/QA evidence + launch readiness. |
| GTM Readiness | ICP/positioning/distribution/conversion weakness. | ICP + offer + channel/funnel evidence + launch plan. |
| Revenue/Growth Recovery | Commercial weakness after basic market evidence exists. | Measured funnel/revenue experiment + result. |
| Operational Readiness | Process/system/capacity constraint. | Defined operating workflow + KPI + reliability evidence. |
| Fundraising/Capital Readiness | Capital objective with weak narrative/metrics/diligence readiness. | Diligence package + metrics/narrative + capital-use thesis. |

## 10.1 Sprint definition contract

| **Field** | **Requirement** |
| --- | --- |
| sprint_code | Stable versioned code; map to service package/intervention code. |
| pillar | Exactly one primary pillar; secondary tags allowed only if current schema supports them. |
| trigger | Governed care/development condition, not arbitrary marketing label. |
| entry_criteria | Evidence/readiness prerequisites and role/consent requirements. |
| objective | Observable development/treatment objective. |
| duration_pattern | Bounded pattern/range, not a silent promise or auto-renewal mechanism. |
| required_evidence | Evidence/artifact classes required to prove work/outcome. |
| milestones | 1.0 minimum milestones sufficient for monitoring. |
| exit_gate | Evidence-based completion/hold/rework/stop criteria. |
| expected_outcomes | Concrete evidence that can return to GalviVault and support reassessment. |
| regulated_boundary | Any external licensed-professional requirement. |
| version | Catalog/sprint version captured on each engagement. |

# 11. GalviCare -> GalviStudio Prescription / Handoff

The handoff must be a server-side domain operation over the Day 5 Treatment Plan / action lineage. It must not rely on an operator manually reconstructing the clinical context.

## 11.1 Orchestration sequence

- Receive explicit care decision from GalviPath or authorized GalviClinic Treatment Plan with support_level=galvistudio.

- Validate intervention_code against the active Studio catalog/sprint configuration.

- Resolve authenticated canonical principal and optional BHR; validate source plan/action belongs to the same context.

- Copy references, not duplicated truth: source objective, expected evidence, monitoring cadence, and escalation trigger remain linked by IDs/version.

- Create idempotent Studio engagement with source_plan_id/source_action_id and catalog/sprint version.

- Create/resolve entry gate and required evidence.

- Project the authorized engagement summary to clinician/Studio/customer surfaces as allowed.

- On completion or gate decision, append artifact/outcome refs to the same longitudinal record.

- Create explicit reassessment event so the next GalviEngine/GalviCare decision is based on new governed evidence.

## 11.2 Minimal handoff action

```text
action: create_studio_engagement
requires:
  authenticated actor
  authorized principal/BHR scope
  support_level == "galvistudio"
  valid source_plan_id or source_path/action reference
  valid intervention_code
  idempotency key

returns:
  success
  status
  engagement_id
  principal_id
  bhr_id | null
  source_plan_id
  source_action_id
  entry_gate
  required_evidence
  next_action
  schema_version
```

## 11.3 Pre-Founder route

> **NO FAKE VENTURE**
>
> For SPUR Dreamer/Founder before a venture exists: create engagement against principal_id with bhr_id=null. The route may later create/link a real venture only through the inherited canonical venture-creation path after the product/business evidence and explicit go/no-go support it.

# 12. Studio Engagement Execution, Evidence & Outcome Writeback

## 12.1 Evidence lifecycle

```text
source care decision
  -> engagement entry gate
  -> evidence/artifact request
  -> evidence received + provenance/validation
  -> gate decision
  -> intervention milestone(s)
  -> exit evidence
  -> outcome record
  -> audit
  -> authorized Chart timeline update
  -> explicit reassessment
```

- Use existing evidence/document objects wherever possible. Day 6 should store references and provenance, not create a second document repository.

- Every outcome must identify the engagement and, when care-prescribed, the source plan/action.

- A Studio artifact is not automatically clinical truth; the existing evidence acceptance/validation rules still apply.

- A completed engagement may yield HOLD/REWORK/STOP at a Venture Development gate; do not confuse work completion with permission to advance.

- Chart enrichment must preserve prior Day 1-5 history and the same Chart identity.

## 12.2 Reassessment contract

| **Outcome condition** | **Required next action** |
| --- | --- |
| Objective met; evidence adequate | Record outcome -> reassessment -> continue/close care or ADVANCE Studio gate if authorized. |
| Objective partially met | Record current evidence -> REWORK/HOLD -> revised intervention or monitoring. |
| Contradiction/new risk | Record evidence -> clinician/human review -> modify/escalate care. |
| Regulated issue discovered | Create/advance referral intent through Day 5 referral contract; Studio stops internal advice on regulated question. |
| No venture should proceed | STOP gate; preserve evidence and principal record; no fake venture/capital deployment. |

# 13. GalviCare Venture 001 - Evidence-Backed Flagship Proof System

GalviCare itself is the first proof that GalviStudio can execute all four pillars. Day 6 must create a structured proof-case template populated from existing build/release evidence; it must not become unsupported marketing copy.

| **Proof dimension** | **Evidence to document** |
| --- | --- |
| Founder Development | Founder thesis, Business Physician identity/methodology formation, capability evolution. |
| Product Development | Problem discovery, customer discovery, 0.5 -> GalviVault -> 1.0 architecture, MVP/build/QA evidence. |
| Business Development | ICP evolution, category positioning, pricing/paywalls, CRM/analytics, launch/conversion evidence. |
| Corporate Development | IDN architecture, partnerships/referrals, IP/category governance, long-term portfolio/enterprise roadmap. |
| Studio operating proof | Stage gates, decisions stopped/reworked, time-to-market, resource/capital efficiency, customer/outcome evidence. |

## 13.1 Proof-case data shape

- venture_case_id and version

- proof_dimension

- claim or decision

- source evidence references

- date/time window

- decision/gate references

- measured outcome where available

- validation/approval status

- customer-facing summary separated from internal evidence/audit detail

> **EVIDENCE RULE**
>
> A claim without a resolvable evidence reference remains draft/unsupported and must not be promoted to a validated Venture 001 proof statement.

# 14. GalviPro 1.0 Business Physician Practice Protocol

| **Role** | **Keeps / owns** | **Moves off plate / prohibited** |
| --- | --- | --- |
| Business Physician | Diagnosis/clinical interpretation; treatment planning; escalations; executive judgment/coaching; complex cases; clinical sign-off. | Routine intake, scheduling, reminders, evidence collection, routine monitoring, common-output explanation, standard documentation where safely delegable. |
| GalviClinician / GalviGuide | Routine care coordination/navigation, check-ins, education, documentation, referral status. | Cannot independently confirm high-stakes diagnosis/treatment outside defined scope; cannot provide licensed professional advice. |
| GalviStudio operator | Execute prescribed development work, collect evidence, operate authorized Venture Development gates. | Cannot create/approve Treatment Plan unless separately authorized as Business Physician; cannot absorb regulated specialty work. |

## 14.1 Standard encounter -> intervention protocol

- Open the same authorized GalviChart/BHR context and Day 5 Clinic brief.

- Review accepted evidence/findings and current Treatment Plan/reassessment state.

- Business Physician confirms/modifies treatment decision as required using existing Day 5 governance.

- If development intervention is indicated, select an approved Studio intervention_code and expected outcome evidence.

- Create the linked Studio engagement rather than a separate advisory note/system.

- Routine coordination may transition to GalviClinician/GalviGuide within bounded permissions.

- Complex/high-stakes/regulated matters remain clinician/external-specialist controlled.

- Outcome returns to GalviVault and the same follow-up/reassessment loop.

## 14.2 Terminology / trust boundary

> **TRUST BOUNDARY**
>
> Business Physician and GalviClinician are GalviCare/GalviStudio methodology/practice designations at 1.0. Do not imply independent medical credentialing/accreditation. Customer-facing language must clearly distinguish Business Healthcare from legal, medical, financial, tax, investment, securities, fiduciary, or other licensed professional advice.

# 15. GalviGage 1.0 - Fixed-Scope Intervention Only After Treatment Order

| **Requirement** | **Day 6 rule** |
| --- | --- |
| Trigger | Diagnosed/governed treatment-plan use case or authorized Studio intervention need. |
| Scope | Fixed, explicit and bounded; no diagnosis-free generic consulting project. |
| Objective | Measurable objective linked to plan/action or Studio engagement. |
| Evidence | Required starting and completion evidence identified. |
| Duration | Explicit duration pattern or milestone window. |
| Owner | Named implementation owner; does not change clinical authority. |
| Follow-up | Mandatory outcome/reassessment date or condition. |
| Regulated boundary | External qualified professional when required. |

# 16. Worker API Actions - Extend the Existing Common Envelope

Use the existing /api envelope and current authentication/authorization conventions. Add the minimum Day 6 actions only if equivalent actions do not already exist.

| **Action** | **Actor** | **Write?** | **Key requirements** |
| --- | --- | --- | --- |
| get_studio_catalog | authorized customer/clinician/Studio role as appropriate | No | Versioned package/SPUR/Sprint definitions; projection-safe. |
| create_studio_engagement | Business Physician / authorized Studio intake flow | Yes | Canonical context, source care refs when prescribed, idempotency. |
| get_studio_engagement | authorized assigned actor/customer projection | No | Scope check; side-effect-free. |
| record_studio_stage_gate | authorized Studio/Business Physician role by policy | Yes | Transition + evidence validation; append/version; audit. |
| record_studio_artifact_ref | authorized Studio/participant actor | Yes | Use canonical evidence/document service; provenance. |
| complete_studio_engagement | authorized Studio role | Yes | Exit gate/outcome evidence; no silent care mutation. |
| record_studio_outcome | authorized role | Yes | Links engagement + source plan/action; idempotent. |
| request_studio_reassessment | authorized workflow | Yes | Explicit next-decision event; rules/AI only through governed path. |
| get_studio_projection | authorized role | No | Allowlist only; no protected clinical notes. |

## 16.1 Common response rules

- Structured JSON only; never blank/HTML runtime responses.

- Safe status values should reuse the existing common envelope where possible: ok, locked, needs_evidence, active_care, referral_required, human_review.

- Reads are side-effect-free and do not create rows, regenerate AI, advance stages, or mutate projections.

- Writes require client_request_id/idempotency and correlation ID.

- Cross-record/unauthorized responses do not leak entity existence or protected content.

- Provider/adapter failures never erase canonical treatment/Studio state.

# 17. Authorization, Consent, Projection & Audit Policy

| **Operation** | **Customer** | **GalviGuide** | **GalviClinician** | **Business Physician** | **Studio operator** |
| --- | --- | --- | --- | --- | --- |
| View own authorized Studio engagement | YES | bounded assist | assigned only | assigned/authorized | assigned only |
| Create care-prescribed Studio engagement | NO direct clinical authority | NO | only if policy explicitly permits routine order | YES | only direct Studio intake or delegated order path |
| ADVANCE/HOLD/REWORK/STOP gate | NO | NO | limited only if configured | YES if assigned/authorized | YES within Studio gate policy |
| Approve/modify Treatment Plan | NO | NO | NO outside defined scope | YES | NO unless separately authorized as physician |
| Record artifact/evidence | YES own contribution | bounded collection | YES | YES | YES |
| View protected clinician notes | NO | NO | limited by role | YES authorized | NO by default |
| Regulated specialist decision | NO | NO | NO | coordinate/escalate | NO; route external |

## 17.1 Deny-by-default policy order

- Authenticate server-side.

- Resolve actor role and assignment.

- Resolve canonical principal/BHR scope from server context.

- Validate consent/purpose for the requested projection/action.

- Validate source plan/action/engagement belongs to the same context.

- Validate role is authorized for the specific action.

- Validate state transition/evidence requirements.

- Execute idempotent/versioned write or side-effect-free read.

- Append material audit event and return projection-safe response.

# 18. Frontend Integration - Minimum Operational Studio Surfaces, Not a New Platform

## 18.1 Customer / GalviChart

- Show an approved Studio care/intervention card only when an engagement is authorized for customer view.

- Display program/Sprint, objective, status, approved milestones, required participant evidence, next action, and approved outcome summary.

- Do not display protected clinician notes, internal gate rationale, raw hypotheses, secret/provider metadata, or unauthorized capital/referral detail.

- Preserve same Chart identity and History/timeline; Studio enrichment is a new authorized projection, not a new chart.

## 18.2 Business Physician / clinician workspace

- Open the existing Chart/BHR and Day 5 active-care context.

- Show source plan/action and why Studio support was prescribed.

- Allow only role-authorized selection/creation of intervention, gate review, and reassessment controls.

- Do not duplicate the Clinic brief or Treatment Plan editor; link/reuse the current objects.

## 18.3 Studio operator workspace

- Minimal queue/list/detail view is sufficient for 1.0 if the existing app architecture supports it.

- Must resolve assigned engagement, stage, required evidence, milestones, gate decision controls, artifact refs, and outcome capture.

- No need for a large standalone Studio application, generic project management, or new authentication stack.

- Responsive and keyboard-usable; clear status/error messages; color not sole status indicator.

# 19. Commercial Package Definitions - Day 6 Data/Copy Only

Day 6 makes offers procurement-ready but does not alter LIVE payment architecture. Package metadata should be sufficient for Day 7 commercial lock and storefront copy.

| **Package metadata** | **Required 1.0 content** |
| --- | --- |
| name / code | Stable customer-facing name and internal code. |
| who it is for | Target lifecycle/person/venture condition. |
| entry signal | Evidence/readiness condition making the service relevant. |
| what is delivered | Specific deliverables, not vague advisory language. |
| duration pattern | Expected bounded service pattern; avoid unsupported guarantees. |
| required evidence | What participant/system must provide or generate. |
| success/outcome evidence | What proves work had the intended effect. |
| handoff | Return to GalviCare reassessment, next Studio stage, or external referral. |
| commercial mode | direct \| prescribed \| both; no new live checkout on Day 6. |
| regulated disclaimer/boundary | External licensed-professional dependency when applicable. |

# 20. Preserve Day 3, Day 4 & Day 5 Invariants

| **Inherited invariant** | **Day 6 regression proof** |
| --- | --- |
| Day 3 clarification + governed AI | Clarification answer remains versioned evidence; AI is server-side, schema-bound, rejectable/fallback-safe; Studio reads do not regenerate AI. |
| Day 4 Chart activation | GalviShot entitlement remains Chart activation event; Day 6 only enriches the existing Chart. |
| Day 4 secure return | Same principal/BHR across refresh/recovery/cross-device path. |
| Day 4 projection security | Customer/clinician allowlists remain permission-correct after Studio fields are added. |
| Day 5 active care | Clinic finding governance, Treatment Plan, Rx, Audit/referral, Guide bounds, monitoring/outcomes remain functional. |
| Day 5 idempotency/history | Plan/Rx/Audit/referral/check-in/outcome replay still does not duplicate; prior history remains traceable. |
| Day 5 booking/payment | Stripe/Calendly entitlement/session continuity remains green; Day 6 package metadata does not alter LIVE paths. |
| Day7D atomic persistence | Observation/product-result and existing closed-loop runtime remain stable; no 500/blank regression. |
| One canonical record | Studio engagement/outcome never creates new principal/BHR/Chart identity. |

# 21. Day 6 Implementation Sequence - Critical Path Order

| **Order** | **Build slice** | **Why this order** |
| --- | --- | --- |
| 1 | Entry gate + anti-work-branch lock + exact Day 5 fingerprint | Prevents wrong-ref authoring and protects signed Day 5 final. |
| 2 | Deployment path-filter inspection + allowed-file manifest | Prevents repeat of a candidate that is committed but not actually deployed. |
| 3 | Schema/domain inventory | Avoids shadow Studio schema and unnecessary migration. |
| 4 | Four-pillar service catalog config | Defines stable intervention/package codes consumed by later slices. |
| 5 | FDI/SPUR tracks + six-stage config | Defines principal-only and founder development routes. |
| 6 | VDM stage-gate service | Core evidence-gated advancement/hold/rework/stop logic. |
| 7 | Sprint library definitions | Creates repeatable prescribed intervention targets. |
| 8 | Care -> Studio handoff | Connects Day 5 Treatment Plan/Path to Studio engagement on same record. |
| 9 | Studio evidence/artifact/outcome writeback + reassessment | Closes Day 6 longitudinal loop. |
| 10 | GalviCare Venture 001 proof case | Exercises four-pillar evidence model without marketing-only claims. |
| 11 | GalviPro practice protocol + GalviGage/boundaries | Standardizes who decides, who coordinates, and what remains external. |
| 12 | Minimal UI/projection + commercial package metadata | Expose only after canonical services are stable. |
| 13 | Full inherited regression | Prove Day 6 did not break Days 1-5. |
| 14 | Exact-SHA QA + Human E2E + rollback | Evidence determines final PASS. |

# 22. Automated Day 6 QA Matrix - Mandatory Tests

| **ID** | **Pass criterion** | **Class** |
| --- | --- | --- |
| T01 | Branch guard rejects work/main authoring before edits. | MANDATORY |
| T02 | Remote QA SHA must equal signed Day 5 Build Final at start. | MANDATORY |
| T03 | Full inherited Day 5 gate passes before Day 6 delta. | MANDATORY |
| T04 | Full Day 4 Chart/secure-return regression passes. | MANDATORY |
| T05 | Full Day 3 clarification/governed-AI regression passes. | MANDATORY |
| T06 | Deployment workflow/path filters cover every intended Day 6 runtime file. | MANDATORY |
| T07 | No new remote branch/ref is created. | MANDATORY |
| T08 | Service catalog returns the four pillars and required launch package metadata. | MANDATORY |
| T09 | Catalog read is side-effect-free and does not create rows. | MANDATORY |
| T10 | SPUR Dreamer route works with principal-only context and bhr_id=null. | MANDATORY |
| T11 | Pre-Founder SPUR route does not fabricate venture/company/BHR. | MANDATORY |
| T12 | SPUR Founder/Operator-Steward assignments validate allowed track/stage. | MANDATORY |
| T13 | Six SPUR stages expose minimum deliverable and transition rules. | MANDATORY |
| T14 | Studio engagement can be created from authorized source Treatment Plan/action. | MANDATORY |
| T15 | Studio engagement rejects source plan/action from another BHR. | MANDATORY |
| T16 | Customer cannot create clinician-governed prescribed engagement by tampering payload. | MANDATORY |
| T17 | create_studio_engagement is idempotent under replay. | MANDATORY |
| T18 | Engagement stores source plan/action/catalog/sprint versions. | MANDATORY |
| T19 | Principal-only engagement persists without BHR and remains retrievable. | MANDATORY |
| T20 | Gate ADVANCE requires minimum evidence. | MANDATORY |
| T21 | Insufficient evidence can produce HOLD. | MANDATORY |
| T22 | REWORK preserves prior decision/history and identifies next evidence/intervention. | MANDATORY |
| T23 | STOP closes path without deleting evidence/history. | MANDATORY |
| T24 | Gate transition skips are rejected unless explicit authorized exception contract exists. | MANDATORY |
| T25 | Customer/GalviGuide cannot record privileged gate decision. | MANDATORY |
| T26 | Authorized Studio/Business Physician gate decision is actor/time/version/audit traceable. | MANDATORY |
| T27 | capital_exposure cannot by itself trigger autonomous capital deployment or regulated advice. | MANDATORY |
| T28 | Founder Readiness Sprint definition validates required trigger/outcome evidence. | MANDATORY |
| T29 | Venture Validation Sprint definition validates trigger/outcome evidence. | MANDATORY |
| T30 | Product Readiness Sprint definition validates trigger/outcome evidence. | MANDATORY |
| T31 | GTM Readiness Sprint definition validates trigger/outcome evidence. | MANDATORY |
| T32 | Revenue/Growth Recovery Sprint definition validates trigger/outcome evidence. | MANDATORY |
| T33 | Operational Readiness Sprint definition validates trigger/outcome evidence. | MANDATORY |
| T34 | Fundraising/Capital Readiness Sprint validates regulated boundary and required evidence. | MANDATORY |
| T35 | Artifact/evidence reference write uses canonical evidence/document contract. | MANDATORY |
| T36 | Outcome cannot be stored without engagement and source lineage when care-prescribed. | MANDATORY |
| T37 | Outcome write is idempotent under replay. | MANDATORY |
| T38 | Outcome append preserves prior Day 1-5 history. | MANDATORY |
| T39 | Authorized outcome causes explicit reassessment event; no silent score/path mutation. | MANDATORY |
| T40 | Chart Studio projection advances without new Chart identity. | MANDATORY |
| T41 | Customer projection excludes protected clinician/gate/internal fields. | MANDATORY |
| T42 | Cross-record get/update returns safe denial without content leak. | MANDATORY |
| T43 | GalviClinician/GalviGuide cannot approve high-stakes treatment through Studio actions. | MANDATORY |
| T44 | GalviGage creation requires treatment/intervention order, fixed scope, evidence, duration and follow-up. | MANDATORY |
| T45 | Regulated legal/tax/securities/fiduciary case routes to external qualified referral path. | MANDATORY |
| T46 | GalviCare Venture 001 validated proof statements require source evidence refs. | MANDATORY |
| T47 | Venture 001 unsupported claim remains draft/unsupported. | MANDATORY |
| T48 | Stripe/Calendly Day 5 entitlement/booking replay remains green. | MANDATORY |
| T49 | Structured errors/recovery work; no blank/HTML responses. | MANDATORY |
| T50 | Full Day 6 suite + inherited mandatory suites pass; mandatory skipped=0. | MANDATORY |

# 23. D1 Integrity Assertions - Before and After Deployed Human E2E

| **ID** | **Integrity assertion** |
| --- | --- |
| D1-1 | No new principal/BHR/Chart identity is created by a Day 6 Studio read or write. |
| D1-2 | Pre-Founder Studio engagement may have bhr_id null; no fabricated venture/company row is created. |
| D1-3 | Care-prescribed engagement references valid source plan/action and canonical principal/BHR. |
| D1-4 | Every Studio engagement has stable catalog/sprint/intervention version metadata. |
| D1-5 | Every gate decision references a valid engagement and stores decision actor/time/version. |
| D1-6 | Gate history is append/versioned; prior ADVANCE/HOLD/REWORK/STOP records are not silently overwritten. |
| D1-7 | Required/current evidence refs are scoped to the same authorized principal/BHR context. |
| D1-8 | Every Studio outcome references valid engagement and, when prescribed, source plan/action. |
| D1-9 | Replay counts unchanged for engagement/gate/artifact/outcome idempotency cases. |
| D1-10 | Customer-visible projection contains no protected clinician/internal gate truth as competing canonical state. |
| D1-11 | Studio writes do not reference rejected/raw AI proposals as accepted treatment truth. |
| D1-12 | Material gate/intervention/outcome and denied cross-record attempts have expected audit events. |
| D1-13 | Prior Day 1-5 evidence/findings/treatment/Rx/Audit/referral/monitoring/history remain intact and resolvable. |
| D1-14 | Current Chart projection version/fingerprint advances after approved Studio event without new Chart identity. |
| D1-15 | Reassessment event links Studio outcome to next care decision path. |
| D1-16 | No destructive migration/data delete/manual repair was used for PASS run. |
| D1-17 | Day 5 runtime rollback can ignore/read additive Day 6 rows without destructive SQL. |
| D1-18 | Exact Day 6 candidate restore reads the same Studio data after rollback rehearsal. |

# 24. Exact-SHA QA Deployment & Runtime Verification

## 24.1 Pre-deploy gate

- [ ] Working tree/detached build contains only intended Day 6 critical-path delta plus documented pre-existing files.

- [ ] All focused Day 6 tests and full inherited Day 5 + Day 4 + Day 3 gates pass locally/approved CI path.

- [ ] Any D1 migration is validated against current QA schema and has non-destructive Day 5 rollback compatibility.

- [ ] No secret, protected payload, raw AI prompt, private clinician note, or environment credential appears in diff/log/evidence.

- [ ] Candidate commit SHA is immutable and recorded before deployment.

- [ ] origin/qa-revamped-galvicare-0-5 equals candidate intended for QA; no work/new branch is involved.

- [ ] Deployment workflow/path-filter coverage for every changed runtime file is proven before relying on CI.

- [ ] If using detached/API publication lane, remote QA is re-fetched immediately before fast-forward and no race occurred.

## 24.2 Deploy exact candidate through existing approved path

> **DO NOT INVENT A NEW DEPLOYMENT PATH**
>
> Use the same known-good Cloudflare/GitHub deployment mechanism proven by Day 5. If Wrangler returns 403, CI is queued, or a path filter omits a changed file, diagnose the exact platform/auth/trigger issue. Do not create a new Worker, D1 database, branch, or deployment architecture as a workaround.

- Deploy the exact candidate SHA to the existing QA Worker/frontend using the approved path.

- If an additive Day 6 migration is required, apply only to the existing QA D1 binding after binding identity is re-verified.

- Capture deployment ID/version, deployed SHA/runtime marker, Worker route, D1 binding, schema/migration version, timestamp.

- Call health/capabilities and confirm inherited Day 1-5 flags plus Day 6 Studio/VDM capability markers if architecture exposes them.

- Run direct deployed probes for catalog read, principal-only SPUR route, engagement create/replay, gate HOLD/ADVANCE authorization, cross-record denial, regulated boundary, outcome/reassessment, and structured errors.

- Run full Day 3 + Day 4 + Day 5 regression on deployed QA before Human E2E.

- Capture before/after D1 integrity assertions for the chosen Human E2E subjects.

## 24.3 Deployed proof chain

| **Proof** | **Required evidence** |
| --- | --- |
| Git | Signed Day 5 base SHA + candidate SHA + remote QA SHA; no work/new ref. |
| Deployment | Existing QA backend/frontend deployment IDs/source commit. |
| Trigger coverage | Changed Day 6 runtime paths demonstrably triggered/included in deployed candidate. |
| D1 | Existing QA binding/database + schema/migration checksum. |
| Runtime | Health/capability response + direct Day 6 action probes. |
| Security | Unauthorized/cross-record/protected-field/role/regulated-boundary negatives. |
| Progression | Care -> Studio engagement -> gate -> outcome -> reassessment -> same Chart. |
| Inherited regression | Day 3 AI/clarification + Day 4 Chart + Day 5 active care/monitoring/payment/booking all green. |
| Human E2E | Run IDs + screenshots/logs/D1 assertions + manual repair=NO. |
| Rollback | Restore Day 5 runtime and prove non-destructive compatibility, then restore Day 6 candidate. |

# 25. Day 6 Human E2E Run Sheet - No Manual Repair

| **ID** | **Human step** | **Expected result / evidence** |
| --- | --- | --- |
| H01 | Open exact QA candidate and capture deployed SHA/runtime/D1 identity. | Runtime matches candidate; no stale deployment. |
| H02 | Verify signed Day 5 active-care subject still opens same Chart/Clinic context. | Same principal/BHR/Chart; Day 5 closed loop intact. |
| H03 | Run a fresh Pre-Founder/Dreamer intake through inherited path. | Principal-only state valid; no fabricated venture/BHR. |
| H04 | Prescribe or select SPUR Dreamer/Founder route as allowed. | Correct track/stage shown with minimum deliverable. |
| H05 | Create Studio engagement for principal-only Pre-Founder. | engagement_id created once; bhr_id remains null. |
| H06 | Refresh/replay H05. | Same engagement returned; row counts unchanged. |
| H07 | Open founder/venture case with Day 5 Treatment Plan requiring Studio support. | Same canonical BHR and source plan/action visible. |
| H08 | Prescribe GTM Readiness Sprint using support_level=galvistudio and intervention_code. | Valid catalog/sprint version and source lineage persisted. |
| H09 | Open Studio operator view / authorized engagement projection. | Entry gate, required evidence, objective, status visible; protected clinical fields excluded. |
| H10 | Attempt ADVANCE with insufficient evidence. | Denied or HOLD; no advancement. |
| H11 | Record missing evidence/artifact with provenance. | Evidence linked to same context. |
| H12 | Record REWORK when evidence is incomplete/contradictory. | Prior gate remains; rework requirement stored. |
| H13 | Add sufficient governed evidence and record ADVANCE. | Actor/time/evidence/version/audit traceable. |
| H14 | Run explicit STOP case on weak venture evidence. | STOP/HOLD occurs without forced venture launch or capital deployment. |
| H15 | Complete one Sprint milestone and record outcome evidence. | Outcome links engagement + source plan/action. |
| H16 | Refresh/replay outcome write. | No duplicate outcome; prior history intact. |
| H17 | Open customer Chart after approved Studio event. | Same Chart identity; authorized Studio timeline/enrichment visible. |
| H18 | Verify protected clinician/internal gate fields as customer. | Not visible. |
| H19 | Trigger reassessment from Studio outcome. | Explicit reassessment recorded; next care decision uses new evidence path. |
| H20 | Exercise Product Development package/Sprint path. | Correct package entry signal, deliverable, evidence/outcome and handoff. |
| H21 | Exercise Business Development package/Sprint path. | Correct package and GTM/commercial evidence contract. |
| H22 | Exercise Corporate Development package path. | Regulated boundaries remain external; internal deliverables bounded. |
| H23 | Open GalviCare Venture 001 proof record. | All four pillars + operating proof have evidence refs; unsupported claims not validated. |
| H24 | Run standardized GalviPro encounter from same Chart. | Traceable Treatment Plan/referral/intervention created/refined through existing Day 5 protocol. |
| H25 | Attempt GalviGuide/GalviClinician high-stakes treatment approval through Studio. | Server denies/escalates; no partial write. |
| H26 | Attempt GalviGage without treatment/intervention order. | Denied; with valid order, fixed scope/evidence/duration/follow-up required. |
| H27 | Run regulated legal/tax/securities/fiduciary scenario. | External qualified referral path; no autonomous/internal prohibited advice. |
| H28 | Attempt cross-record engagement/gate access with another BHR/principal ID. | Safe 403/404 behavior; no leak or write. |
| H29 | Run inherited Day 3/4/5 regression including payment/booking refresh/replay. | All green; same session/BHR continuity. |
| H30 | Rehearse runtime rollback to exact Day 5 Build Final then restore Day 6 candidate. | Non-destructive; Day 5 runtime usable; Day 6 candidate restores same Studio data. |

# 26. Critical-Path Defect Remediation Playbook

| **Failure class** | **First evidence to capture** | **Allowed response** | **Forbidden response** |
| --- | --- | --- | --- |
| Branch/base | remote refs, current checkout/upstream, signed base SHA. | Switch to existing QA checkout or detached/API lane; rebase only by explicit corrective plan if remote moved. | Push work/new branch; assume local HEAD. |
| Deployment trigger | candidate SHA, workflow run, path filters, changed files. | Fix proven watched-path/filter coverage or reuse correct watched path; rerun exact candidate. | Speculative app/workflow rewrite; claim deploy from local tests. |
| D1/schema | binding identity, schema diff, failing SQL, row scope. | Add smallest compatible migration/domain fix. | New DB, destructive SQL, manual PASS repair. |
| Authorization | actor/role/assignment/consent/action/scope. | Fix server policy/assignment resolution. | Hide UI button only; trust client role. |
| Stage-gate logic | required/current evidence, transition, decision actor. | Fix exact transition/evidence validator. | Auto-advance to make E2E pass. |
| Care -> Studio handoff | source plan/action IDs, resolved principal/BHR, request/response. | Fix canonical mapping/idempotency only. | Manual reconstruction or new record system. |
| Projection stale/blank | projection version, API response, runtime error, canonical row. | Fix proven projection/cache/render layer; preserve identity. | Recompute truth in browser; new Chart. |
| Outcome/reassessment | engagement/outcome/reassessment IDs, lineage query. | Fix exact linkage/explicit reassessment service. | Silent Score/Path mutation. |
| Regulated boundary | request category, route decision, response/audit. | Fail closed to referral/human review. | Generate internal licensed advice. |
| Payment/booking | server entitlement/booking record, source context. | Repair exact inherited adapter mapping if proven broken. | Change live pricing/checkout architecture. |
| Runner/Cloudflare outage | platform error IDs/status, unchanged diff. | Retry proven path or approved direct lane; preserve code. | Create new Worker/DB/branch. |

# 27. Day 6 Release Evidence Package

| **Artifact folder / section** | **Required Day 6 evidence** |
| --- | --- |
| 01_day5_baseline | Signed Day 5 Build Final SHA; branch/remote manifest; QA backend/frontend versions; D1 binding/schema; Day 5 evidence; rollback target. |
| 02_branch_lock | Anti-work-branch guard output; authoring/publication lane; no-new-ref proof; remote-base race check. |
| 03_deploy_trigger | Workflow/path-filter inventory; proof every changed runtime path is covered; candidate -> run -> deployment. |
| 04_change_manifest | Allowed files; git diff name/stat; reason each changed file is Day 6 critical path. |
| 05_schema_domain | Current schema inventory; logical-object mapping; migration/checksum/rollback compatibility if any. |
| 06_catalog_spur | Four-pillar catalog, service package definitions, SPUR tracks/stages and versions. |
| 07_stage_gates_sprints | Stage-gate examples for ADVANCE/HOLD/REWORK/STOP; Sprint definitions and evidence contracts. |
| 08_care_studio_loop | Treatment Plan/Path -> Studio engagement -> evidence/gate -> outcome -> reassessment examples with IDs/lineage. |
| 09_venture001 | GalviCare Venture 001 four-pillar proof with source evidence references and validation status. |
| 10_galvipro_practice | Role/authority matrix, standardized encounter/intervention/GalviGage/referral examples. |
| 11_automated_qa | T01-T50 results, skipped mandatory=0; inherited Day 3/4/5 gates. |
| 12_d1_integrity | D1-1..D1-18 before/after queries/results; manual repair=NO. |
| 13_deployed_qa | Candidate SHA, remote SHA, deployment IDs, capability markers, direct deployed probes. |
| 14_human_e2e | H01-H30 run sheet, screenshots/logs/record IDs, defect log. |
| 15_rollback | Day 5 immutable/runtime restore + Day 6 candidate restore; non-destructive D1 proof. |
| 16_final_status | DAY 6 HUMAN E2E PASS / DAY 6 BUILD FINAL or FAIL/STOP/ROLLBACK; exact Day 7 handoff baseline. |

# 28. Day 6 Rollback Strategy

## 28.1 Two rollback levels

| **Level** | **Use when** | **Action** |
| --- | --- | --- |
| Runtime rollback | Day 6 code/deployment causes P0/P1 while additive data remains safe. | Restore exact signed Day 5 backend/frontend immutable deployment/version through approved path; do not delete Day 6 rows. |
| Candidate reversion | A Day 6 commit must be removed from QA history before finalization. | Create normal corrective/revert commit on existing QA ref based on proven current remote; no new branch/force push unless repository governance explicitly requires/approves. |
| Schema compatibility | Additive migration exists. | Keep additive schema; Day 5 runtime must tolerate/ignore new tables/nullable columns; no destructive down-migration. |
| Adapter fallback | Noncritical external adapter fails but core record is safe. | Restore prior adapter/runtime behavior or documented fallback; preserve canonical care/Studio state. |

## 28.2 Rollback must prove

- [ ] Known-good Day 5 backend/frontend deployment can be restored through approved immutable/version path.

- [ ] Existing principal/BHR/evidence/accepted AI/Chart/Treatment/monitoring history remains intact.

- [ ] No Day 6 migration makes Day 5 Worker unreadable or requires destructive SQL.

- [ ] GalviTriage/Vitals/Score/Shot/Sight/Path/Chart/Clinic/Treatment/Rx/Audit/referral/monitoring closed loop remains usable after rollback.

- [ ] No manual destructive SQL/delete is required to recover.

- [ ] Rollback target, deployment/version IDs, SHA, D1 state, and post-rollback smoke evidence are recorded.

- [ ] Exact Day 6 candidate can be restored after rollback rehearsal and reads the same Studio engagement/gate/outcome data correctly.

# 29. Day 6 Stop/Go Gate

> **GO ONLY WHEN**
>
> GO only when GalviStudio can receive a governed care prescription, place the person/venture in the correct SPUR/program/stage, record evidence-gated ADVANCE/HOLD/REWORK/STOP decisions, execute a bounded repeatable intervention, return evidence/outcomes to the same GalviVault record, update the same authorized Chart, and trigger the next reassessment; GalviPro must deliver the active-care/intervention handoff through a standardized practice protocol. Exact-SHA QA, D1 integrity, inherited regressions, Human E2E and rollback must all pass with manual repair=NO.

> **STOP / ROLLBACK IF**
>
> STOP / ROLLBACK if Studio remains only a vague capability list; the care-to-Studio handoff requires manual reconstruction; a Pre-Founder causes a fabricated venture/BHR; stage gates can advance without evidence/authority; the system encourages venture creation or capital deployment without evidence gates; Studio/GalviGuide absorbs regulated work; cross-record access leaks; replay duplicates or history overwrites; the exact candidate is not deployed; Day 3/4/5 regress; or rollback is destructive/unavailable.

| **Gate** | **PASS evidence** |
| --- | --- |
| Baseline | Signed Day 5 Build Final proven; anti-work-branch execution lane locked. |
| Deployment | Every changed runtime path is covered; exact candidate deployed to existing QA runtime. |
| Catalog | Four pillars packaged with customer/entry/deliverable/evidence/outcome/handoff. |
| FDI/SPUR | Three tracks + six stages operational; principal-only path safe. |
| Stage gates | ADVANCE/HOLD/REWORK/STOP evidence/actor/transition logic works. |
| Sprints | Initial seven Sprint definitions and outcome evidence contracts operational. |
| Care -> Studio | Source plan/action creates linked Studio engagement on same canonical context. |
| Outcome -> Vault | Artifacts/outcome append/version and explicit reassessment update same Chart. |
| Venture 001 | All four pillars supported by evidence refs; unsupported claims not validated. |
| GalviPro | Standardized encounter/intervention/GalviGage/referral boundaries work. |
| Security | Customer/Guide/Clinician/Studio role and cross-record negatives pass. |
| Inherited | Day 3 clarification/AI + Day 4 Chart + Day 5 active-care/payment/booking loops green. |
| D1 | D1-1..D1-18 clean; manual repair=NO. |
| Rollback | Day 5 restore and Day 6 candidate restore non-destructive and verified. |
| Decision | DAY 6 HUMAN E2E PASS signed; exact Day 7 handoff baseline recorded. |

# Appendix A - One-Page Day 6 Completion Checklist

- [ ] Exact signed Day 5 Build Final 43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c re-fetched and proven as remote QA start baseline.

- [ ] Existing qa-revamped-galvicare-0-5 remote ref only; main untouched; no work/new remote branch.

- [ ] Anti-work-branch guard executed; approved branch or detached/API no-new-branch lane documented.

- [ ] Deployment workflow/path-filter coverage inspected before coding; every Day 6 runtime file covered.

- [ ] Full inherited Day 5, Day 4 and Day 3 gates green before Day 6 changes.

- [ ] One canonical principal/BHR/Chart retained; principal-only Pre-Founder path does not fabricate venture/BHR.

- [ ] Four GalviStudio pillars packaged into market-ready launch offers with operational metadata.

- [ ] FDI is institution inside GalviStudio; SPUR Dreamer/Founder/Operator-Steward and six stages productized.

- [ ] VDM stage gates operational with evidence-gated ADVANCE/HOLD/REWORK/STOP and optionality-first policy.

- [ ] Seven initial Treatment/Readiness Sprint definitions operational.

- [ ] Care -> Studio handoff uses source Treatment Plan/Path action and same canonical context.

- [ ] Studio entry gate, required evidence, artifacts, exit gate and outcomes append/version correctly.

- [ ] Studio outcome -> GalviVault -> Chart -> explicit reassessment -> next GalviEngine/GalviCare decision works.

- [ ] GalviCare Venture 001 proof case has four-pillar + operating evidence; unsupported claims remain unvalidated.

- [ ] GalviPro Business Physician/GalviClinician/GalviGuide/Studio role boundaries enforced server-side.

- [ ] GalviGage requires treatment/intervention order, fixed scope, evidence, duration and follow-up.

- [ ] Regulated legal/tax/securities/fiduciary/other licensed matters route externally.

- [ ] Unauthorized/cross-record/role/consent/protected-field negatives pass.

- [ ] Reads are side-effect-free; material writes are idempotent/versioned.

- [ ] T01-T50 automated tests PASS; mandatory skipped=0.

- [ ] D1-1..D1-18 clean; manual repair=NO.

- [ ] Exact candidate SHA deployed to existing QA Worker/frontend and expected QA D1 binding.

- [ ] H01-H30 Human E2E PASS with evidence.

- [ ] Runtime rollback to Day 5 and candidate restore pass non-destructively.

- [ ] Final declaration: DAY 6 HUMAN E2E PASS / DAY 6 BUILD FINAL.

# Appendix B - Day 7 Handoff Contract

Day 7 (Commercial Readiness, Human E2E, Release Gates, Production Cutover, and Evidence Package) may begin only from the exact Day 6 Build Final baseline. Day 7 freezes features and proves the complete ecosystem. It must not reopen architecture or use production cutover to conceal a Day 6 P0/P1 defect.

| **Inherited control** | **Day 7 obligation** |
| --- | --- |
| Canonical record | Use the same principal/BHR/Chart and preserve Day 6 Studio engagement/outcome lineage. |
| Studio operating system | Four pillars, SPUR, stage gates and Sprints are complete enough to sell/operate; no feature expansion. |
| GalviPro practice | Standardized Clinic/Treatment/Studio/referral protocol is frozen for release testing. |
| Commercial continuity | Lock entitlements/Membership/Clinic/Studio package metadata and server-verified payment rules. |
| Analytics | Instrument Studio prescription/engagement/gate/outcome events without sensitive payload logging. |
| Security/accessibility | Run full trust review across customer, clinician and Studio surfaces. |
| Human E2E | Run full P0 release matrix across customer -> care -> Studio -> outcome paths. |
| Production | Only controlled tested migrations/code/secrets/payments; no ad hoc production-only fixes. |
| Rollback | Production cutover has complete frontend/Worker/DB/OpenAI/Stripe/storefront/operations rollback package. |

> **TARGET DAY 7 START STATE**
>
> TARGET DAY 7 START STATE: DAY 6 HUMAN E2E PASS -> DAY 6 BUILD FINAL -> GALVISTUDIO FOUR-PILLAR + SPUR + STAGE-GATE + SPRINT OPERATING LOOP CONNECTED TO THE SAME GALVIVAULT/GALVICHART RECORD -> GALVIPRO PRACTICE PROTOCOL OPERATIONAL. If any P0/P1 gate is red, the only valid declaration is FAIL / STOP / ROLLBACK.

# Appendix C - Codex Evidence / Status Report Template

```text
DAY 6 BUILD STATUS

BASELINE
- repo/root:
- origin URL:
- implementation ref:
- signed Day 5 Build Final SHA:
- origin/qa SHA before:
- origin/main SHA:
- authoring lane: approved QA checkout | detached exact-base | GitHub object API
- QA backend Worker/version/runtime:
- QA frontend deployment/version:
- QA D1 binding/database:
- schema/migrations:
- Day 3 AI/rules/prompt/schema versions:
- Day 4 Chart capability proof:
- Day 5 active-care proof:
- rollback target:

BRANCH / PUBLICATION SAFETY
- current checkout before edits:
- anti-work-branch guard: PASS/FAIL
- new remote branches created: NO
- work ref pushed: NO
- remote QA base race check: PASS/FAIL

DEPLOYMENT TRIGGER COVERAGE
- workflow:
- path filters inspected:
- intended changed runtime files:
- every changed runtime file covered: PASS/FAIL
- candidate workflow run ID:

IMPLEMENTATION DELTA
- files changed:
- migration (if any):
- reason each file is critical path:
- unrelated workflow files changed: NO

AUTOMATED QA
- inherited Day 3 gate: PASS/FAIL
- inherited Day 4 gate: PASS/FAIL
- inherited Day 5 gate: PASS/FAIL
- Day 6 T01-T50: PASS/FAIL (mandatory skipped=0)
- D1-1..D1-18: PASS/FAIL

DEPLOYED QA
- candidate SHA:
- remote QA SHA:
- backend deployment/version ID:
- frontend deployment/version ID:
- D1 binding/schema checksum:
- direct Studio/VDM/security/idempotency probes:

HUMAN E2E
- H01-H30: PASS/FAIL
- run IDs / principal / BHR / plan / engagement / gate / outcome IDs:
- manual repair: NO

DEFECTS
- failure -> proven root cause -> minimal diff -> focused retest -> regression

ROLLBACK
- Day 5 immutable/runtime restore: PASS/FAIL
- Day 6 candidate restore: PASS/FAIL
- non-destructive D1 compatibility: PASS/FAIL

FINAL DECLARATION
DAY 6 HUMAN E2E PASS / DAY 6 BUILD FINAL
OR
DAY 6 FAIL / STOP / ROLLBACK
```

# Appendix D - Source Alignment Notes

- The Authoritative Seven-Day Guide defines Day 6 as GalviStudio 1.0 Venture Development Management + GalviPro Practice System and requires a procurement-ready four-pillar service catalog, FDI/SPUR, stage gates, initial Sprints, care-to-Studio handoff, Venture 001 evidence, standardized Business Physician practice, and market-ready package definitions.

- The authoritative Day 6 stop/go gate requires Studio to receive a care prescription, place the person/venture correctly, record evidence-gated decisions/outcomes, return outcomes to the same GalviVault record, and preserve standardized GalviPro active-care practice.

- The Day 5 Builder handoff requires Day 6 to begin only from exact Day 5 Build Final, use the same principal/BHR/Chart, link prescribed Studio interventions to source plan/action, preserve GalviGuide/referral boundaries, return Studio outcomes to the longitudinal loop, and rerun inherited Day 5/4/3 gates.

- The Day 5/Day 5 Build2 execution showed why exact-SHA deployment proof and deployment path-filter coverage are mandatory: a correct code change is not complete if the active QA runtime did not deploy it.

- The recurring GalviCare/GalviVault work-branch failure is prevented by refusing to author/push work and using only the existing QA ref or detached/proven object-API publication to that exact existing ref.

- Day 6 remains QA-only. Day 7 owns feature freeze, final commercial lock, P0 Human E2E, production cutover, and release evidence.
