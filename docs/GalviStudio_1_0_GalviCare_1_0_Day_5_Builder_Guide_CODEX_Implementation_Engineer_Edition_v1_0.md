**GALVISTUDIO 1.0 | GALVICARE 1.0**

# Day 5 Builder Guide

*Treatment • Active Care • GalviClinic • GalviRx • GalviAudit/GalviLab • GalviGuide • Referrals • Monitoring & Outcomes*

**CODEX IMPLEMENTATION ENGINEER EDITION • v1.0**

---

> **CURRENT BUILD STATUS — DAY 4 BUILD FINAL IS THE ONLY AUTHORIZED STARTING POINT**
>
> This guide may be prepared before Day 4 is fully signed, but Codex must not execute Day 5 changes until the exact DAY 4 HUMAN E2E PASS / DAY 4 BUILD FINAL baseline is proven in Git, deployed QA, GalviVault D1, release evidence, and rollback evidence. Day 5 consumes the secure persistent GalviChart/GalviVault continuity created on Day 4; it must not rebuild identity, entitlement, projection, the Day 3 clarification loop, or governed AI.

> **DAY 5 MISSION**
>
> Close the care loop so accepted digital evidence and GalviPath recommendations can become a Business Physician-governed treatment decision, a versioned Treatment Plan, embedded GalviRx resources, GalviAudit/GalviLab diagnostics, qualified referrals, bounded GalviGuide support, and monitored outcomes — all on the same canonical principal/BHR and visible through the existing GalviChart projection.

> **CRITICAL-PATH RULE**
>
> Every Day 5 change must do one of six things: (1) preserve the exact Day 4 canonical record/Chart baseline, (2) convert governed evidence into authorized active-care decisions, (3) persist treatment/Rx/Audit/referral/monitoring objects with lineage and versioning, (4) enforce Business Physician vs GalviGuide vs customer decision rights, (5) keep payment/booking and Day 1–4 journeys intact, or (6) close Day 5 QA/release evidence. If a change does not materially increase DAY 5 HUMAN E2E PASS probability or preserve an inherited invariant, do not make it.

## How Codex Must Use This Builder

> **EXECUTION CONTRACT**
>
> This is an implementation runbook, not a design brainstorm. Prove the exact Day 4 Build Final baseline first; inventory the real repository and existing Worker actions, D1 schema, Chart projection, clinician portal/workspace, Stripe/Calendly adapters, tests, deployment path, and runtime versions; then implement the smallest additive Day 5 delta. Run focused tests, full inherited Day 4 + Day 3 regression, exact-SHA deployed QA verification, D1 integrity assertions, Human E2E, and rollback. Stop on the first P0/P1 defect and remediate only the proven root cause.

| **Priority** | **Instruction** | **Practical meaning** |
| --- | --- | --- |
| P0 | Exact Day 4 handoff only | Begin only from the signed Day 4 Build Final SHA, QA Worker/frontend deployment, QA D1 binding/schema, H01–H22 evidence, and non-destructive rollback target. |
| P0 | Approved QA ref only | Implementation target is the existing qa-revamped-galvicare-0-5 remote ref. Never create/push a work branch, Day5 branch, workaround branch, or branch family. main is read-only reference. |
| P0 | Production untouched | No main merge, PROD deploy, Production D1 mutation, LIVE payment/auth change, or public cutover on Day 5. |
| P0 | One canonical longitudinal record | Treatment, Rx, Audit, referral, monitoring, and outcome objects attach to the existing principal/BHR/Chart context. No shadow clinic/treatment record system. |
| P0 | Business Physician governs treatment | Digital intelligence may recommend; GalviGuide may navigate; only an authorized Business Physician may confirm/modify findings and approve active Treatment Plans. |
| P0 | Evidence and source versions required | A treatment decision must trace to accepted evidence/findings and source Score/Shot/Sight/Path versions; unsupported or rejected AI cannot silently become treatment truth. |
| P0 | Regulated boundaries fail closed | Legal/tax/fiduciary/securities/security-incident and other licensed matters route to qualified external professionals; GalviGuide/OpenAI must not autonomously resolve them. |
| P0 | Material writes idempotent/versioned | Create/update actions require request idempotency and append/version semantics; refresh/replay may not duplicate plans, orders, referrals, check-ins, or outcomes. |
| P0 | Day 3/4 loops preserved | Clarification questions, governed AI, Chart activation/secure return, projection permissions, and Day7D atomic persistence remain intact. |
| P1 | Evidence decides completion | Local rendering is insufficient. Exact-SHA QA, D1 assertions, permission negatives, Human E2E, and rollback determine PASS/FAIL. |

## 1. Day 5 Scope Decision, Objectives & Definition of Done

Authoritative Day 5 objective: close the care loop so digital evidence can become a Business Physician treatment decision, a structured prescription/intervention, a specialty diagnostic or referral, and a monitored outcome in the same longitudinal record.

### 1.1 Day 5 Definition of Done

- [ ] Exact Day 4 Build Final SHA/deployment/D1 binding/schema/rollback target is captured before edits; Day 4 HUMAN E2E PASS evidence exists and inherited tests are green.

- [ ] qa-revamped-galvicare-0-5 is the only remote implementation ref; main remains untouched; no work/new remote branch is created or pushed.

- [ ] GalviPath 1.0 exposes clinical priority, measurable objective, 3–5 sequenced actions, owner, required evidence, cadence, support level, escalation trigger, and next reassessment.

- [ ] GalviClinic pre-visit brief resolves the same principal/BHR and summarizes Triage target, Score/acuity/confidence, accepted Shot findings, Sight meaning/hypotheses, Path, evidence lineage, and desired outcome.

- [ ] Business Physician encounter workspace supports Confirm / Reject / Modify finding, request evidence, order GalviAudit, refer specialist, and create Treatment Plan; every decision is actor/time/version/audit traceable.

- [ ] A first-class Treatment Plan persists objective, actions, owners, target metrics, milestones, monitoring plan, escalation triggers, follow-up, status, clinician actor, and source Score/Shot/Sight/Path versions.

- [ ] GalviRx is embedded as a structured resource/prescription object linked to a Path/plan/action; no standalone pharmacy app or hidden clinical authority is introduced.

- [ ] GalviLab functions as the diagnostics service line and GalviAudit as an ordered specialty diagnostic case; result evidence returns to the same BHR and can update Path/Chart only through governance.

- [ ] GalviGuide is bounded to explanation/navigation/evidence requests/Clinic prep/reminders/check-ins/approved resources/rule-based escalation; it cannot change scores, diagnose, approve treatment, override clinician judgment, or provide licensed advice.

- [ ] Minimum referral directory, consent-aware handoff, status lifecycle, and authorized outcome return to GalviVault are operational.

- [ ] Monitoring loop persists scheduled check-ins, adherence/milestones, new evidence, outcomes, reassessment decisions, and current Chart updates without deleting prior state.

- [ ] Stripe/Calendly entitlement and Clinic booking continuity survive refresh/replay and preserve source session/BHR context.

- [ ] Customer Chart is progressively enriched with approved Clinic, Treatment Plan, Rx, referral, monitoring, and outcome projections while protected clinician context remains protected.

- [ ] No Day 5 read causes a write, AI regeneration, duplicate treatment object, or new principal/BHR/Chart identity.

- [ ] Full inherited Day 4 + Day 3 regression, Day 5 automated QA, D1 assertions, exact-SHA deployed probes, Human E2E, and rollback pass with manual repair=NO.

- [ ] Final declaration is DAY 5 HUMAN E2E PASS / DAY 5 BUILD FINAL or DAY 5 FAIL / STOP / ROLLBACK.

### 1.2 Explicit in-scope / out-of-scope

| **Capability** | **Day 5 requirement** | **Not authorized on Day 5** |
| --- | --- | --- |
| GalviPath | Finalize care-path contract and escalation semantics; reuse governed evidence and existing Path result. | New autonomous treatment agent; broad product redesign; client-side recomputation of score/acuity. |
| GalviClinic | Pre-visit brief + Business Physician encounter controls against existing authorized Chart/BHR. | Separate clinic database, unrelated portal rewrite, public clinician admin platform. |
| Treatment Plan | First-class physician-governed versioned object with source lineage and monitoring. | Customer-created clinical authority; silent overwrite of prior plans. |
| GalviRx | Embedded resources/prescriptions linked to plan/action. | Standalone pharmacy, prescribing licensed products/services, autonomous medication/legal/investment advice. |
| GalviAudit / GalviLab | Ordered specialty diagnostics + evidence/result loop. | Generic consulting project system or unrelated broad diagnostics marketplace. |
| GalviGuide | Bounded navigator/routine-care support under policy. | Autonomous physician, diagnostic authority, treatment-plan approval, protected-note access. |
| Referrals | Curated provider directory, consented handoff, status/outcome loop. | National referral network automation, unverified provider claims, regulated advice. |
| Monitoring / outcomes | Check-ins, adherence, milestones, outcomes, reassessment, Chart update. | Predictive 2.0 intervention engine, broad always-on automation. |
| Commercial adapters | Preserve existing verified Stripe/Calendly flow; regression only unless proven Day 5 defect. | Pricing redesign, LIVE payment changes, new checkout architecture. |
| Production | None. QA only. | main merge, PROD deploy/migration, LIVE cutover. |

## 2. Recurring GalviCare/GalviVault Defects — Day 5 Mandatory Prevention Controls

These controls convert the recurring work-branch, deployment, D1, runtime, identity, authorization, and treatment-governance failure modes into explicit Day 5 release gates. They are not optional engineering preferences.

| **Defect pattern** | **Observed risk** | **Day 5 control** | **Required proof** |
| --- | --- | --- | --- |
| Branch drift / work checkout | Codex edits or commits on work and cannot safely advance QA. | STOP before edits if current checkout is work/main or upstream is not origin/qa-revamped-galvicare-0-5. Use only the existing QA ref or the no-new-branch fallback lane in §3.3. | Repo + remote + branch/upstream + base SHA + final remote QA SHA. |
| Wrong remote/base | Day 5 patch is based on stale/non-authoritative history. | Fetch origin; prove repository slug; capture exact signed Day 4 Build Final SHA; refuse to base on local latest HEAD by assumption. | Signed base SHA equals candidate parent; remote QA ref proof. |
| Unrelated workflow rewrite | A Day 5 feature destabilizes GalviCare 0.5/Days 1–4 deployment. | Create allowed-file manifest after discovery; no workflow/YAML or unrelated route changes without proven root-cause need. | Diff manifest + reason each file is critical path. |
| Deployment drift | Local candidate passes while active QA serves older code. | Deploy exact candidate SHA only through approved path; verify runtime marker/capability and direct Day 5 probes. | SHA ↔ deployment ID ↔ runtime behavior chain. |
| Wrangler 403/binding mismatch | Auth/config issue causes new Worker/DB or speculative app changes. | Compare with known-good Day 4 Cloudflare config/bindings. Fix auth/config only; never create bypass Worker/DB. | Same existing QA Worker/D1 binding + smoke PASS. |
| Duplicate clinic/treatment truth | Developer creates a second clinic chart/treatment DB. | Attach all Day 5 objects to canonical principal/BHR and existing Chart projection. | No competing canonical payload; FK/scope lineage proven. |
| Treatment without evidence | Plan can be created from arbitrary UI payload. | Worker requires accepted/confirmed evidence/finding scope and source version references; Business Physician authorization required. | Negative returns safe denial; positive plan contains source_versions. |
| AI proposal becomes treatment | Raw openai_proposal or rejected hypothesis is copied into plan. | Only accepted/openai_governed or clinician-confirmed content may support plan; provenance retained. | Rejected proposal hidden; accepted/confirmed lineage shown. |
| GalviGuide authority creep | Navigator approves plan, changes score, or gives regulated advice. | Deny prohibited actions server-side; enforce response policy and escalation. | Behavioral adversarial tests + audit evidence. |
| Cross-record treatment | Client-supplied bhr_id writes to another record. | Resolve scope from authenticated canonical context; validate requested IDs against assignment/ownership. | Cross-record create/update 403/404-safe + no leaked existence/content. |
| Duplicate replay | Refresh/retry produces duplicate plan/order/referral/check-in/outcome. | Use client_request_id/idempotency key + unique constraints/domain dedupe + side-effect-free reads. | Replay returns stored/current object; row counts unchanged. |
| History overwrite | Modify plan/finding erases previous decision. | Version/append correction; prior version remains traceable; current pointer changes only after authorized write. | Before/after versions and audit trail. |
| Monitoring disconnect | Outcome is stored without plan/action source. | Every milestone/check-in/outcome references active plan/action and BHR; reassessment event records next decision. | Lineage query from outcome → action → plan → source evidence. |
| Regulated case mishandled | System treats licensed matter as ordinary treatment. | Red-flag/routing policy forces qualified referral; GalviGuide/OpenAI output bounded. | Regulated-case E2E routes externally with consent and no prohibited advice. |
| Payment/booking regression | Clinic active-care path breaks existing entitlement/session continuity. | Reuse existing Stripe/Calendly adapters and source context; do not redesign unless failing assertion proves need. | Refresh/replay booking/entitlement test + same session/BHR. |
| Manual QA repair | Ad hoc SQL/delete makes E2E pass. | Use migration/domain service/corrective versioning; manual repair prohibited for PASS run. | Evidence sheet manual repair=NO. |
| Speculative multi-layer rewrite | UI + Worker + DB + workflows changed before failing layer known. | Name exact failing assertion/request/route/SQL/runtime first; smallest diff; focused retest then full regression. | Defect log proves failure → root cause → minimal diff → PASS. |

> **REMEDIATION RULE**
>
> When a Day 5 test fails, Codex must name the exact failing assertion, actor/authorization decision, BHR/plan scope, Worker action, schema field, SQL statement, booking/entitlement adapter, projection field, deployment, or runtime layer before editing. Fix the smallest proven root cause. Rerun the failed test first, then its regression slice, then the complete Day 5 gate. Do not simultaneously change UI + Worker + D1 + workflows unless evidence independently proves each layer is broken.

## 3. Day 5 Entry Gate & Exact Baseline Fingerprint

> **STOP UNLESS ALL ARE TRUE**
>
> Day 5 must not build active care on top of an unproven Day 4 state. If signed Day 4 Build Final cannot be proven, restore/synchronize it first. Day 5 implementation must never conceal a Chart/identity/entitlement/governed-AI/clarification/D1/deployment defect.

| **Check** | **Required starting state** | **Codex evidence** |
| --- | --- | --- |
| Repository | Authoritative mrgalvipro/galvitriage repository used by QA. | git rev-parse --show-toplevel + git remote -v / origin URL. |
| QA ref | Existing qa-revamped-galvicare-0-5 at exact signed Day 4 Build Final SHA. | remote ref SHA + local/detached base SHA + parent proof. |
| Production | main is read-only reference. | origin/main SHA; no implementation checkout/deploy. |
| Working tree | Clean or explicitly explained pre-existing changes. | git status --short. |
| QA runtime | Existing QA Worker/frontend serving Day 4 Build Final. | health/capabilities + deployed SHA/version IDs. |
| D1 binding | Existing QA GalviVault D1 binding/schema; no new DB. | wrangler config + D1 database/binding identity + schema manifest. |
| Day 3 AI | accepted/rejected/fallback behavior still proven; no Chart-read regeneration. | direct governed-AI regression. |
| Day 3 closed loop | Score clarification → answer → versioned evidence → targeted Shot questions → governed Shot/Sight/Path. | deployed regression evidence. |
| Day 4 Chart | Shot activation, secure return, customer/clinician projections, History, commands, H01–H22. | Day 4 signed evidence index. |
| Rollback | Known-good Day 4 deployment and prior Day 3 fallback recorded. | rollback SHAs/version IDs + procedure. |

### 3.1 First Codex actions — no implementation yet

```bash
set -euo pipefail

# 1) Prove repository / remote
pwd
git rev-parse --show-toplevel
git remote -v
ORIGIN_URL="$(git remote get-url origin)"
case "$ORIGIN_URL" in
  *mrgalvipro/galvitriage* ) ;;
  * ) echo "STOP: unexpected repository remote: $ORIGIN_URL"; exit 41 ;;
esac

# 2) Fetch authoritative refs only; do not create/push work branches
git fetch --prune origin qa-revamped-galvicare-0-5 main
REMOTE_QA_SHA="$(git rev-parse origin/qa-revamped-galvicare-0-5)"
REMOTE_MAIN_SHA="$(git rev-parse origin/main)"
CURRENT_BRANCH="$(git branch --show-current || true)"
printf 'current_branch=%s\nremote_qa=%s\nremote_main=%s\n' "$CURRENT_BRANCH" "$REMOTE_QA_SHA" "$REMOTE_MAIN_SHA"

git status --short --branch
git branch -vv

# 3) STOP if the active checkout is a prohibited authoring branch
if [ "$CURRENT_BRANCH" = "work" ] || [ "$CURRENT_BRANCH" = "main" ]; then
  echo "STOP: do not author Day 5 on '$CURRENT_BRANCH'. Use §3.2 or §3.3."
  exit 42
fi

# 4) When on the approved QA branch, prove tracking
if [ "$CURRENT_BRANCH" = "qa-revamped-galvicare-0-5" ]; then
  UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}')"
  [ "$UPSTREAM" = "origin/qa-revamped-galvicare-0-5" ] || { echo "STOP: wrong upstream $UPSTREAM"; exit 43; }
fi

# 5) Capture the SIGNED Day 4 Build Final SHA from release evidence.
# Never infer it merely from local HEAD.
SIGNED_DAY4_SHA="<populate-from-signed-Day-4-evidence>"
[ "$REMOTE_QA_SHA" = "$SIGNED_DAY4_SHA" ] || { echo "STOP: remote QA is not signed Day 4 Build Final"; exit 44; }
```

### 3.2 Preferred lane — existing QA branch checkout

- Use this lane only when the local repository can checkout the already-existing qa-revamped-galvicare-0-5 ref safely.

- If the working tree is clean, switch to the existing QA branch and fast-forward only. Never branch from it into a Day5/work branch.

- Require HEAD = origin/qa-revamped-galvicare-0-5 = signed Day 4 Build Final before edits.

- Before commit and before push, rerun the branch/upstream guard. Push only HEAD:refs/heads/qa-revamped-galvicare-0-5.

```bash
git switch qa-revamped-galvicare-0-5
# If a local checkout of this already-existing remote ref does not exist,
# create ONLY a local tracking checkout with the SAME name; do not create a new remote branch.
# git switch --track -c qa-revamped-galvicare-0-5 origin/qa-revamped-galvicare-0-5

git merge --ff-only origin/qa-revamped-galvicare-0-5
[ "$(git rev-parse HEAD)" = "$SIGNED_DAY4_SHA" ] || exit 45
[ "$(git branch --show-current)" = "qa-revamped-galvicare-0-5" ] || exit 46
```

### 3.3 Fallback lane — Codex environment is pinned to work; no new branch

> **ANTI-WORK-BRANCH FALLBACK**
>
> If the Codex environment is forced to remain on work and cannot safely switch, do not commit or push work. Create a detached worktree from the exact signed remote QA SHA (or use the repository’s proven GitHub blob/tree/commit API path) and update only the existing qa-revamped-galvicare-0-5 ref after re-verifying the remote base has not moved. This prevents the recurring work-branch delay without creating a new remote branch.

```bash
# Detached-worktree option (no new branch)
BASE_SHA="$SIGNED_DAY4_SHA"
BUILD_DIR="/tmp/galvicare-day5-${BASE_SHA:0:8}"
rm -rf "$BUILD_DIR"
git worktree add --detach "$BUILD_DIR" "$BASE_SHA"
cd "$BUILD_DIR"
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || exit 47

# ...make only Day 5 critical-path edits here, test, and commit on detached HEAD...
# git add <allowed-files>
# git commit -m "GalviCare 1.0 Day 5 active-care critical path"
# CANDIDATE_SHA=$(git rev-parse HEAD)

# Immediately before updating QA, fetch and prove no remote race:
git fetch origin qa-revamped-galvicare-0-5
[ "$(git rev-parse origin/qa-revamped-galvicare-0-5)" = "$BASE_SHA" ] || {
  echo "STOP: QA moved; rebase/reconstruct from new signed base rather than force-push"; exit 48;
}

# Publish ONLY to the existing QA ref; never push work/main/new ref.
# git push origin "$CANDIDATE_SHA:refs/heads/qa-revamped-galvicare-0-5"
```

If GitHub object APIs are used instead of a detached worktree, Codex must create blobs/tree/commit with parent = exact signed Day 4 Build Final SHA, compare the resulting tree/diff to the allowed-file manifest, then atomically fast-forward only refs/heads/qa-revamped-galvicare-0-5. No force update is allowed if the remote ref moved.

### 3.4 Required baseline fingerprint artifact

| **Field** | **Required value** |
| --- | --- |
| repo_root | Absolute repository root used for build. |
| origin_url | Authoritative mrgalvipro/galvitriage remote URL. |
| implementation_ref | refs/heads/qa-revamped-galvicare-0-5 only. |
| signed_day4_sha | Exact signed DAY 4 BUILD FINAL SHA. |
| origin_qa_sha_before | Must equal signed_day4_sha before edit. |
| origin_main_sha | Read-only reference. |
| qa_backend_worker | Existing QA backend Worker name + URL. |
| qa_frontend | Existing QA frontend deployment/project + URL. |
| qa_d1_binding | Existing GalviVault QA D1 binding/database ID/name. |
| schema_migration_state | Current applied migration/checksum list. |
| day3_ai_versions | Provider/model/prompt/schema/rules versions currently approved. |
| day4_chart_capabilities | Activation/secure-return/projection/history capability proof. |
| rollback_target | Day 4 deployment/version + prior fallback. |
| working_tree | Clean / explained pre-existing changes. |
| allowed_files_manifest | Files Codex may touch for Day 5 after discovery. |

## 4. Day 5 Target Architecture & Authority Boundary

```text
Customer / Founder
    |
    | existing GalviCare + GalviChart 1.0
    v
Cloudflare Worker — authorization + clinical orchestration + idempotency
    |                     |                        |
    |                     |                        +--> Stripe / Calendly adapters (existing)
    |                     +--> GalviEngine / governed AI (evidence-bound proposal only)
    v
GalviVault D1 — canonical principal/BHR + evidence + findings + Path + care history
    |
    +--> GalviClinic pre-visit brief / Business Physician encounter
           |
           +--> Confirm / Reject / Modify finding
           +--> Treatment Plan (physician-governed, versioned)
           |      +--> embedded GalviRx resources
           |      +--> monitoring cadence / milestones / outcomes
           |
           +--> GalviAudit order --> GalviLab diagnostic service --> new governed evidence
           +--> qualified external referral --> consented handoff --> returned outcome
           +--> GalviStudio route (order/handoff substrate; Day 6 productizes execution)
    |
    +--> GalviGuide bounded navigation / reminders / evidence requests / escalation
    |
    +--> GalviChart authorized customer + clinician projections
           |
           +--> reassessment -> next governed decision
```

| **Layer** | **Day 5 authority** | **Must not do** |
| --- | --- | --- |
| Browser/UI | Render authorized projection; submit explicit commands with request IDs. | Direct D1 writes; invent actor/role; create treatment truth client-side. |
| Worker | Authenticate/authorize; resolve scope; validate source lineage; orchestrate writes/adapters; return structured JSON. | Trust client bhr_id/role/entitlement; expose secrets; allow unsafe autonomous treatment. |
| GalviVault D1 | Canonical longitudinal care state and append/version history. | Become duplicated by clinic/Chart shadow stores; destructive rewrite. |
| GalviEngine/OpenAI | Evidence-bound explanation/hypothesis/proposal/fallback under Day 3 governance. | Approve Treatment Plan or override Business Physician. |
| Business Physician | Confirm/modify/reject findings; approve Treatment Plan; order Audit/referral; set active-care follow-up. | Bypass evidence/consent/audit requirements. |
| GalviGuide | Explain/navigate/remind/request evidence/facilitate check-ins/escalate by rule. | Change score/acuity; diagnose; approve plan; provide licensed advice. |
| GalviLab/GalviAudit | Generate/validate requested diagnostic evidence in defined scope. | Operate as generic unrelated consulting workflow. |
| External provider | Perform regulated/specialty work under consented handoff. | Receive excess protected data or become unverified automated advice source. |

## 5. Repository Change Strategy — Discover First, Then Minimal Additive Delta

1. Inventory the actual repository tree, package scripts, Worker entrypoint/router, existing Day 1–4 domain modules, D1 migrations, Chart projection service, clinician portal/UI, entitlement/booking adapters, and tests. Do not assume filenames from this guide.

2. Locate existing logical equivalents for recommendation/Path, treatment, Rx, audit order, referral, monitoring/check-in/outcome, clinic encounter, access audit, and Chart projection. Reuse/extend them before adding a new table/module.

3. Create a Day 5 allowed-file manifest. Typical categories are Worker route/domain modules, one additive migration only if gaps remain, existing customer/clinician UI files, focused tests, and release-evidence scripts. Unrelated workflow/YAML/docs refactors are excluded.

4. Make the smallest vertical slice first: get_clinic_brief → physician finding decision → create Treatment Plan → project into Chart. Prove it end-to-end before adding Rx/Audit/referral/monitoring.

5. Add GalviRx, GalviAudit/Lab, referrals, GalviGuide, and monitoring as subordinate extensions of the same plan/BHR context — not as separate mini-products/databases.

6. After each slice: focused automated test → inherited regression slice → D1 row/version assertions. Do not wait until the end to discover canonical-state defects.

7. Before candidate commit, produce git diff --stat, git diff --name-only, and a rationale mapping every changed file to a Day 5 release gate. Any unexplained file is a STOP condition.

| **Discovery target** | **Questions Codex must answer before editing** |
| --- | --- |
| Worker/API | What is the authoritative /api action router? How are auth, record scope, role, client_request_id, structured errors, and adapters already implemented? |
| GalviVault schema | Which existing tables/columns already represent recommendations, plans, findings, evidence relations, audit orders, referrals, check-ins/outcomes, encounters? Which logical gaps actually require migration? |
| Chart projection | How are Care Plan, GalviClinic, Timeline, Documents, and History assembled? Where should Day 5 approved artifacts appear? |
| Clinician workspace | What Day 8/Day 4 clinician UI already exists? How is assigned/authorized record context resolved? |
| Day 3 intelligence | How are accepted/governed artifacts and source versions identified? How are rejected/raw proposals excluded? |
| Payments/booking | What verified Stripe entitlement and Calendly booking/source-session contracts already work and must be reused? |
| Deployment | What exact QA backend/frontend deploy path and capability/runtime marker was proven on Day 4? |
| Rollback | Can Day 4 runtime read the proposed Day 5 additive schema? What feature flags or tolerant reads are required? |

## 6. GalviVault 1.0 Data Strategy — Add Active Care Without a Second Record System

> **MIGRATION RULE**
>
> Do not blindly create a second GalviVault schema. Inspect existing GalviVault 0.5/P0 and Day 1–4 migrations and map each Day 5 logical object to existing canonical tables where possible. Add only migration-safe columns/tables/indexes. No destructive migration is authorized.

### 6.1 Logical Day 5 objects — map to existing schema first

| **Logical object** | **Minimum Day 5 behavior** | **Critical constraints** |
| --- | --- | --- |
| Recommendation / GalviPath | target condition/priority, actions, evidence_needed, cadence, escalation, version. | Digital recommended care; not physician-confirmed treatment. |
| Clinic encounter | encounter_id, bhr_id, reason, source brief/version, actor, decisions, approved note, follow-up. | Authorized clinician scope; notes separated by visibility policy. |
| Finding decision | finding_id, decision=confirm\|reject\|modify, clinician_actor, rationale/evidence refs, version/timestamp. | Original finding preserved; modified decision creates new governed version. |
| Treatment Plan | plan_id, priority/diagnosis, objective, actions/owners, metrics, milestones, monitoring, escalation, follow-up, status, clinician_actor, source_versions. | First-class active-care object; versioned; evidence-bound. |
| GalviRx | rx_id, intervention_code, resource_type, resource_ref, instructions, owner, duration, guardrails, plan/action ref. | Embedded; cannot imply unlicensed prescribing authority. |
| GalviAudit order | order_id, domain, reason, evidence_requested, status, assigned service/specialist, result_ref. | Specialty diagnostic case; result returns as governed evidence. |
| Referral | referral_id, category, reason/source finding, consent, provider, status, handoff metadata, outcome. | Minimum necessary disclosure; status lifecycle; no unverified claims. |
| Monitoring/check-in | cadence, measures, due_at, responses, adherence, alert/escalation state, plan/action ref. | Append/version; scheduled task != autonomous clinical decision. |
| Outcome | outcome_id, treatment/action ref, measure, baseline, observed value, status, observed_at, interpretation. | Must link to plan/action and feed reassessment. |
| Access/audit event | actor, role, action, entity, entity_id, purpose, environment, correlation_id, timestamp. | Append-only; protected from customer projection except approved history semantics. |

### 6.2 Migration sequence if gaps actually exist

- First inspect whether the Authoritative Guide’s logical migrations 0004_chart_treatment_monitoring.sql and 0005_referrals_audit_rx.sql already exist, have been renamed, or were partially implemented in Day 4. Do not duplicate them by filename or schema meaning.

- If a required object is absent, create the smallest additive migration under the repository’s established GalviCare 1.0 migration convention. Prefer nullable additions/default-safe tables and indexes.

- Every new table must carry canonical BHR/principal scope, created/updated timestamps as appropriate, version/status, and idempotency/audit fields consistent with existing conventions.

- Use foreign-key/reference checks or equivalent domain validation so cross-BHR treatment/order/referral relations cannot be written.

- Validate migration re-run/no-op behavior where practical and prove Day 4 runtime can tolerate the additive schema during rollback.

### 6.3 Idempotency and versioning invariants

| **Write** | **Idempotency key / uniqueness** | **Version/history rule** |
| --- | --- | --- |
| Finding decision | client_request_id + finding_id + actor/action fingerprint | Append decision version; do not delete original finding. |
| Treatment Plan create | client_request_id; one canonical create response per request | plan_id stable; subsequent edits create new version/current pointer. |
| GalviRx add | client_request_id + plan/action/resource fingerprint | Preserve withdrawn/replaced resource history. |
| Audit order | client_request_id + plan/finding/domain intent | Status transitions append/audit; result_ref immutable once finalized except corrected version. |
| Referral | client_request_id + plan/finding/provider/handoff intent | Status/outcome transitions recorded; consent version retained. |
| Check-in | client_request_id + due event/check-in identity | Each response new event/version; no overwrite on refresh. |
| Outcome | client_request_id + plan/action/measure/observation identity | Corrections create new version; prior observed value retained. |

## 7. Finalize GalviPath 1.0 Contract

Day 5 consumes the Day 3 governed reasoning and Day 4 Chart projection to finalize GalviPath as a care recommendation contract. Path remains recommendation, not physician-confirmed treatment.

| **Field** | **Required content** | **Validation / projection rule** |
| --- | --- | --- |
| clinical_priority | Dominant condition/findings and why it deserves attention. | References governed finding IDs/source versions; no unsupported statement. |
| objective | One measurable Business Health or Founder Readiness outcome. | Specific enough to evaluate during monitoring. |
| actions | 3–5 sequenced steps; each has owner and expected evidence. | Owner enum/policy validated; action must not exceed support level. |
| evidence_required | What will prove progress or change the recommendation. | Links to evidence schema/categories and requested-evidence commands. |
| cadence | 30/60/90 milestones or appropriate interval; next reassessment. | Due dates deterministic and timezone-safe. |
| support_level | self_guided \| galviguide \| galviclinic \| galviaudit \| galvistudio_sprint \| qualified_referral. | Server policy derives/validates based on acuity/confidence/escalation. |
| escalation_trigger | Condition that changes passive care into active/specialty/referral care. | Machine-readable when practical; human-readable projection. |
| source_versions | score/shot/sight/path rules/evidence versions. | Required on persistence; survives later AI/model changes. |

### 7.1 Passive vs active care routing

| **Case** | **Expected Day 5 behavior** |
| --- | --- |
| Green / stable | Path may remain self-guided; GalviGuide can explain/navigate/remind. No forced Clinic. |
| Yellow / needs evidence | Path requests evidence, sets cadence, may use GalviGuide; Clinic only if trigger/complexity requires. |
| Orange / active care | Clinic booking/encounter is recommended/required by governed route; physician validates findings and creates/updates plan. |
| Red / regulated or urgent specialty | Fail closed to qualified referral / specialty diagnostic route; no autonomous professional conclusion. |
| Low confidence / contradiction | May order GalviAudit/GalviLab or request evidence before active treatment; plan creation requires sufficient governed basis or explicit human review state. |

## 8. Build GalviClinic Pre-Visit Brief

The brief is an authorized projection assembled server-side from the same Chart/BHR context. It is not a copied document that can drift from canonical truth.

| **Brief element** | **Source / action** | **Projection rule** |
| --- | --- | --- |
| Reason for visit | Triage concern + founder target outcome. | Current authorized version + relevant historical context. |
| Current health/readiness | GalviScore + acuity + Clinical Confidence. | Stored deterministic facts; do not recompute in browser. |
| Priority findings | GalviShot + evidence lineage. | Only canonical/accepted findings. |
| Meaning/root-cause hypotheses | GalviSight. | AI content visibly distinguishable from confirmed clinician judgment. |
| Recommended pathway | GalviPath. | Show support level, actions, evidence, cadence, escalation. |
| Evidence summary | Supporting/contradicting evidence IDs/versions, provenance, validation status. | Protected detail can be clinician-only; no cross-record evidence. |
| Prior care | Prior encounters, plans, Rx, audits, referrals, monitoring/outcomes. | Chronological; current + relevant prior versions. |
| Desired outcome | Founder/venture 30/90-day goal and measurable target. | Editable only through authorized encounter command/version. |
| Open questions | Missing/contradictory evidence, overdue milestones, pending referrals/orders. | No raw model prompt/chain-of-thought exposure. |
| Controls | Confirm/reject/modify finding; request evidence; order audit; refer; create plan. | Business Physician-only authorization; GalviClinician permissions narrower. |

### 8.1 Brief assembly sequence

1. Authenticate actor and resolve role/assignment server-side.

2. Resolve canonical principal/BHR from authorized context; reject client record switching.

3. Load current deterministic facts and accepted governed intelligence using the existing Day 4 projection/read services.

4. Load active and prior care objects required for continuity; exclude protected fields not authorized for this clinician role.

5. Assemble a version/fingerprint that identifies the source record state used for the encounter.

6. Return structured JSON with source IDs/versions and explicit stale/needs_evidence flags when appropriate.

7. Do not call OpenAI merely to render the brief. AI may be invoked only through the existing governed reasoning path when an explicit new clinical reasoning action is requested and allowed.

## 9. Business Physician Encounter & Finding Governance

| **Control** | **Required behavior** | **Forbidden behavior** |
| --- | --- | --- |
| Confirm finding | Record clinician actor, finding ID/version, evidence basis, timestamp, encounter, decision version. | Mutate original AI/digital artifact in place. |
| Reject finding | Preserve original; mark clinician decision and downstream treatment exclusion/implication. | Delete evidence or pretend finding never existed. |
| Modify finding | Create clinician-confirmed version with rationale/evidence refs; preserve prior. | Overwrite source statement or lose generation metadata. |
| Request evidence | Create requested-evidence action linked to finding/plan/Path. | Store arbitrary unvalidated upload as canonical truth. |
| Order GalviAudit | Create ordered diagnostic case with domain/reason/evidence requested. | Launch broad unrelated consulting work. |
| Refer specialist | Capture regulated/specialty reason, consent, provider, handoff scope/status. | Provide the licensed conclusion internally as a substitute. |
| Create Treatment Plan | Require authorized Business Physician + sufficient accepted/confirmed evidence + source versions. | Allow customer/GalviGuide/OpenAI to approve plan. |
| Close/modify care | Record reason/outcomes and new plan version/status. | Erase prior active-care history. |

### 9.1 Decision-rights matrix

| **Actor** | **May do** | **May not do** |
| --- | --- | --- |
| Customer | Acknowledge plan; submit check-in; report milestone; provide requested evidence; accept/decline referral sharing where applicable. | Confirm clinical finding; approve/author treatment; view protected notes. |
| GalviGuide | Explain approved output; navigate; request evidence; prepare Clinic; remind; facilitate check-ins; surface approved Rx resources; rule-based escalation. | Change score/acuity; confirm diagnosis/finding; approve plan; override clinician; licensed advice. |
| GalviClinician | Routine-care documentation/actions within assigned permissions; evidence collection; follow-up support. | Exercise Business Physician treatment authority unless role explicitly grants it. |
| Business Physician | Confirm/reject/modify findings; approve Treatment Plan; order Audit/referral; set active-care monitoring and follow-up. | Bypass consent/RBAC/evidence/audit boundaries. |
| GalviEngine/OpenAI | Produce evidence-bound proposal/hypothesis/explanation under schema and validation. | Become canonical actor, plan approver, or licensed professional. |

## 10. Treatment Plan Domain Contract & Service

```json
{
  "plan_id": "tp_...",
  "bhr_id": "bhr_...",
  "clinical_priority": "Distribution readiness deficiency",
  "objective": "Increase qualified-pipeline evidence within 90 days",
  "actions": [
    {"action_id":"act_...","action":"...","owner":"founder","evidence_required":"...","due_at":"..."}
  ],
  "target_metrics": [{"metric":"qualified opportunities","baseline":4,"target":12}],
  "milestones": [{"day":30,"objective":"..."},{"day":60,"objective":"..."},{"day":90,"objective":"..."}],
  "monitoring_plan": {"cadence":"weekly","measures":["..."]},
  "escalation_triggers": ["..."],
  "follow_up_at": "...",
  "status": "active",
  "clinician_actor_id": "...",
  "source_versions": {"score":"...","shot":"...","sight":"...","path":"..."},
  "version": 1,
  "created_at": "..."
}
```

### 10.1 Create-plan orchestration

1. Authenticate actor; require Business Physician treatment authority and active authorized BHR scope.

2. Validate client_request_id and dedupe/replay before any side effects.

3. Load source Path/findings/evidence and verify accepted/confirmed canonical status and record scope.

4. Validate source_versions match the intended encounter brief state; if stale, return needs_review/stale_source rather than silently binding to new evidence.

5. Validate objective/actions/metrics/milestones/monitoring/escalation against schema and prohibited-content policies.

6. Persist plan + plan version + action children/links atomically using repository conventions; append access/audit event.

7. Project approved plan into clinician and customer Chart allowlists; customer view excludes protected rationale/internal notes.

8. Emit canonical journey/treatment event where the existing event contract supports it; third-party analytics failure is non-blocking.

9. Return exact stored plan version. Replaying the same client_request_id returns the stored response and creates no additional rows.

### 10.2 Plan modification / closure

- Never update clinical_priority/objective/actions/source_versions in place without a version event. The stable plan_id identifies the longitudinal plan; version identifies the approved state.

- Changing a plan after new evidence or outcome must record the triggering evidence/outcome/reassessment reason.

- Status transitions should be explicit (for example draft/review/active/paused/completed/closed/cancelled as compatible with existing schema). Do not invent statuses if the repository already defines them.

- Customer acknowledgement is a separate event and does not change author/approval ownership.

- If active plan source evidence is later corrected, mark plan for review or create a new version; do not silently rewrite history.

## 11. Embed GalviRx — Do Not Build a Standalone Pharmacy App

| **GalviRx resource type** | **Examples** | **Day 5 implementation rule** |
| --- | --- | --- |
| Playbook / framework | Customer discovery protocol; pricing test; decision cadence; operating review. | Link to plan/action; include owner, instructions, duration/cadence and guardrails. |
| Template / SOP | Interview guide; CRM pipeline definition; meeting cadence; evidence log. | Version/reference approved resource; avoid duplicating document truth. |
| AI prompt / workflow | Approved bounded prompt/workflow for a defined task. | Must carry bounded purpose, prohibited behavior, and no hidden clinical authority. |
| Technology recommendation | Tool category/stack recommendation with rationale/constraints. | Category/rationale/constraints; no undisclosed affiliate or autonomous procurement behavior. |
| Learning module | SPUR lesson or FDI resource. | Link to resource/program; Day 6 productizes broader Studio delivery. |
| Partner referral | Qualified external specialist/service. | Use referral contract and consent/handoff rules; do not bypass referral governance. |

### 11.1 Rx object minimum fields

- rx_id; plan_id and action_id or recommendation_id; bhr_id resolved server-side.

- intervention_code / resource_type / resource_ref or structured resource payload.

- instructions, owner, expected evidence, duration/cadence, guardrail/contraindication notes where relevant.

- author/approver actor, status, version, created_at/updated_at, client_request_id/idempotency fingerprint.

- customer visibility flag/policy derived server-side; protected internal rationale excluded from customer projection.

## 12. GalviLab & GalviAudit Routing

| **Concept** | **1.0 definition** | **Day 5 implementation** |
| --- | --- | --- |
| GalviLab | Business Diagnostics service line that generates/validates Business Health Evidence; GalviEngine powers reasoning, GalviLab delivers diagnostic service. | Represent routing/service metadata and result evidence; do not create a separate data platform. |
| GalviAudit | A specialty diagnostic order/case in domains such as Growth/Distribution, Revenue, Operations, Product/Technology, Leadership, Innovation, Corporate Development. | Order object linked to BHR/finding/plan; evidence_requested; status; assigned service/specialist; result_ref. |
| Order trigger | Low confidence; contradictory evidence; material complexity; specialist diagnostic need; clinician order. | Server validates reason/source and actor authority; client cannot fabricate trigger truth. |
| Result | New evidence + diagnostic result linked to original finding/hypothesis; may update Chart/Path after governance. | Persist evidence with provenance/version; rerun governed reasoning only via explicit action. |
| Regulated boundary | Legal/tax/fiduciary/securities/security-incident and other licensed matters route externally. | Return referral_required/human_review; no autonomous internal professional advice. |

### 12.1 Audit order status and result flow

```text
finding/Path -> order_galviaudit
    -> requested evidence + domain + reason + actor
    -> proposed/ordered/in_progress/waiting_evidence/completed/cancelled (adapt to existing enum)
    -> result evidence persisted with provenance
    -> result_ref linked to order + source finding/hypothesis
    -> governed acceptance / clinician review
    -> Chart/Path/plan reassessment event
```

## 13. GalviGuide 1.0 — Bounded Navigator

| **Allowed behaviors** | **Prohibited behaviors** |
| --- | --- |
| Explain approved outputs; navigate Chart/Path; request missing evidence; prepare Clinic; remind milestones; facilitate check-ins; surface approved GalviRx resources; route/escalate based on governed rules. | Change scores/acuity; confirm a diagnosis/finding; create or approve a Treatment Plan; override clinician decision; provide licensed legal/tax/investment advice; expose internal notes; bypass consent/RBAC. |

### 13.1 Enforcement layers

1. Frontend affordances: do not render prohibited clinician-only controls to GalviGuide/customer roles; this is convenience only, not security.

2. Worker authorization: reject prohibited action names for non-Business-Physician actors regardless of payload tampering.

3. Policy/safe-completion layer: classify regulated/prohibited request categories and return bounded explanation + referral/escalation path.

4. Governed AI schema: response schema cannot include plan approval, score mutation, clinician confirmation, or protected fields for GalviGuide actions.

5. Projection allowlist: customer/Guide context excludes clinician internal notes, audit metadata, raw hypotheses, and secret/provider metadata.

6. Audit: record meaningful navigation/escalation/check-in actions with correlation ID; do not log sensitive raw prompts to GA4/third parties.

### 13.2 Failure behavior

- OpenAI/provider timeout or invalid schema: use deterministic approved navigation/fallback; stored Chart/Path/plan remains usable.

- Prohibited request: structured refused/escalate response; no partial write.

- Missing evidence: return needs_evidence with explicit approved request; no invented answer.

- Regulated matter: return referral_required/human_review and create referral intent only through an authorized/consented workflow.

## 14. Minimum External Referral Network Contract

- Provider directory includes category, name/organization, basic credential-verification status, geography/service mode, contact/handoff method. 1.0 may be curated/manual.

- Referral records the reason and source finding/acuity/red-flag or plan action.

- Customer consent is captured before sharing; only the minimum required information is included in handoff.

- Status lifecycle: proposed | accepted | sent | scheduled | completed | declined | closed (reuse existing enum if present).

- Outcome/documentation returns to GalviVault only when authorized and is linked to the referral and originating plan/finding.

- Service expectations and responsibility boundaries are documented; GalviCare does not misrepresent third-party credentials or licensed conclusions.

### 14.1 Referral negative tests

| **Negative** | **Expected result** |
| --- | --- |
| No consent | No protected handoff; referral can remain proposed/needs_consent. |
| Customer tampers provider/referral BHR | 403/404-safe; no cross-record leak; audit event. |
| Unverified/disabled provider | Cannot be represented as verified/active; safe fallback to manual review. |
| Regulated question sent to GalviGuide | No substantive licensed advice; referral_required/human_review. |
| Repeated send request | No duplicate handoff; idempotent stored referral/status response. |
| Outcome arrives for wrong referral/BHR | Reject; no evidence write; audit discrepancy. |

## 15. Monitoring, Check-In, Adherence, Milestones & Outcome Loop

```text
Treatment Plan -> scheduled check-in -> new evidence -> milestone/adherence -> outcome -> updated Vitals/Score/Chart -> reassessment -> continue/modify/escalate/close treatment
```

### 15.1 Monitoring command contract

| **Command** | **Required server behavior** |
| --- | --- |
| submit_checkin | Authorize record; validate plan/action and due context; append responses/evidence; calculate non-clinical adherence state by approved rules; never overwrite prior check-in. |
| report_milestone | Append milestone event linked to plan/action; capture evidence/result; update projection version. |
| record_outcome | Require plan/action/source measure; preserve baseline; append observed value/status/interpretation and actor/source. |
| reassess_care | Load latest governed evidence/outcomes; run deterministic/rules and, when explicitly allowed, governed AI proposal; Business Physician approves active-treatment change. |
| acknowledge_plan | Customer acknowledgement only; does not change plan author/clinical approval. |
| close_plan | Authorized clinician closes with reason/outcome summary; prior versions remain accessible. |

### 15.2 Chart enrichment

- Timeline adds encounter, plan, Rx, audit, referral, check-in, milestone, outcome, reassessment events chronologically.

- Care Plan shows recommended GalviPath plus active physician-approved Treatment Plan when one exists.

- GalviClinic section shows upcoming/previous encounters, approved notes, plan/follow-up, booking CTA.

- Health/Overview may show current outcome/status and next check-in without rewriting prior Vitals/Score snapshots.

- History preserves plan/reassessment versions and longitudinal changes. Customers receive approved summaries, not protected internal rationale.

## 16. Stripe / Calendly Continuity — Reuse the Proven 0.5/Day 4 Contract

> **NO PAYMENT/BOOKING REDESIGN**
>
> Day 5 requires continuity, not a commercial rewrite. Verified entitlement and Clinic booking must survive refresh/replay and preserve source session/BHR context. If Stripe/Calendly fails, isolate the exact adapter defect; do not redesign checkout or alter LIVE settings.

| **Flow** | **Pass condition** |
| --- | --- |
| Clinic booking CTA | Only shown/usable in correct care state/entitlement according to existing contract; source session/BHR/context carried to booking intent. |
| Refresh/replay | Verified entitlement remains server-derived; no URL/localStorage unlock; booking intent does not duplicate. |
| Calendly return/webhook | Maps back to same session/principal/BHR; duplicate delivery is idempotent. |
| Payment failure/pending | Care state preserved; structured pending/retry/fallback; no false entitlement. |
| Adapter outage | Canonical care state/result remains intact; approved manual/contact fallback can be shown. |
| Production safety | QA uses test/sandbox configuration; no LIVE changes on Day 5. |

## 17. Worker API Actions — Extend the Existing Common Envelope

Adapt names to the existing router. Do not create a parallel API style if the common POST /api action envelope already exists.

```http
POST https://<qa-worker>/api
{
  "action": "get_clinic_brief | record_finding_decision | create_treatment_plan | add_galvirx | order_galviaudit | create_referral | update_referral_status | submit_checkin | record_outcome | reassess_care | ...",
  "session_id": "gc_...",
  "bhr_id": "bhr_...",                // advisory only; server resolves/validates scope
  "principal_id": "pr_...",           // advisory only; server resolves/validates scope
  "current_stage": "GalviClinic",
  "payload": { ... },
  "client_request_id": "uuid"
}

Response
{
  "success": true,
  "status": "ok | locked | needs_evidence | needs_followup | active_care | referral_required | human_review | conflict",
  "session_id": "gc_...",
  "principal_id": "pr_...",
  "bhr_id": "bhr_...",
  "data": { ... },
  "next_action": "view_chart | complete_plan | provide_evidence | book_clinic | referral | check_in | reassess",
  "schema_version": "gc_1_0_20260824"
}
```

### 17.1 Action-level requirements

| **Action** | **Authorization / validation** | **Atomic side effects** |
| --- | --- | --- |
| get_clinic_brief | Assigned/authorized clinician role + BHR scope. | Read only; no AI regeneration/write. |
| record_finding_decision | Business Physician or permitted clinician scope; source finding/version/evidence valid. | Decision version + audit; projection version update. |
| create_treatment_plan | Business Physician treatment authority; source evidence/versions current; request idempotent. | Plan/version/actions + audit + projection update + canonical event. |
| add_galvirx | Authorized plan context; resource type/policy valid. | Rx resource/version + plan/action link + audit. |
| order_galviaudit | Authorized clinician; domain/reason/source valid. | Order + requested evidence + audit; no duplicate on replay. |
| create_referral | Authorized reason + provider + consent state. | Referral + handoff metadata/status + audit; minimum disclosure. |
| submit_checkin | Customer/authorized actor + active plan/action scope. | Check-in/evidence + timeline/projection event. |
| record_outcome | Authorized actor + plan/action/measure scope. | Outcome + audit + reassessment/projection trigger metadata. |
| reassess_care | Authorized context; latest evidence/outcomes; governed reasoning only if explicitly requested. | New recommendation/proposal/plan review state; never silent overwrite. |

## 18. Authorization, Consent, Projection & Audit Policy

### 18.1 Deny-by-default policy order

1. Authenticate actor/session.

2. Resolve canonical principal/BHR from server-side identity/assignment.

3. Validate consent purpose/status for requested action and data sharing.

4. Validate role and decision right (customer, GalviGuide, GalviClinician, Business Physician, support).

5. Validate entitlement/care-state preconditions where applicable.

6. Validate object/source versions and canonical status.

7. Execute domain write atomically/idempotently.

8. Append access/audit event and canonical journey/care event as appropriate.

9. Build role-specific projection allowlist and return structured response.

### 18.2 Protected clinician context

- Internal hypotheses/diagnostic reasoning not approved for customer display.

- Protected notes and sensitive evidence detail.

- Clinician confirmation/rejection rationale beyond approved summary.

- Audit metadata/controls, provider secrets, internal policy flags, raw model/provider prompt content.

- Unaccepted/rejected AI proposals or unsupported content.

- Other records or referral data outside authorized scope.

## 19. Frontend Integration — Active Care Without Re-Authoring Truth

### 19.1 Business Physician workspace

- Reuse the same GalviCare visual language and Day 4 clinician projection. Add controls where authorized rather than building a separate visual system.

- Display source status clearly: deterministic fact, governed AI interpretation, clinician-confirmed decision, pending/needs evidence.

- Before a material decision, display source versions/evidence summary and a stale-state warning when the current record changed since brief load.

- All controls call Worker actions; disable double-submit locally but rely on server idempotency for correctness.

- On structured error, preserve session/BHR/encounter context and present recovery. Never blank/crash the entire record.

### 19.2 Customer Chart

- Care Plan: recommended Path + active approved Treatment Plan; plan acknowledgement CTA where applicable.

- GalviClinic: booking/encounter summary, approved notes, next follow-up, active-care status.

- Timeline/History: plan versions, Rx resources, referrals/orders, check-ins/outcomes shown according to projection policy.

- Evidence: newly authorized diagnostic/outcome evidence appears only after governance.

- No clinician-only controls, raw hypotheses, internal audit metadata, or prohibited referral/provider notes.

### 19.3 Accessibility/responsiveness minimum

- Keyboard reachable controls, visible focus, semantic labels, error summaries, and readable table/card alternatives.

- Mobile/narrow layouts must preserve critical clinical labels, status, action ownership, due dates, and warning/escalation content.

- Do not encode care status solely by color; include text labels.

- Loading states must distinguish pending action from completed/failed write; avoid duplicate submit during retry.

## 20. Preserve Day 3 Governed Intelligence & Day 4 Chart Invariants

> **INHERITED CLOSED LOOP**
>
> The expected closed loop remains: GalviTriage → GalviVitals → deterministic GalviScore → clarification question → customer answer → versioned Business Health evidence → targeted GalviShot questions where clinically useful → more evidence → GalviEngine/OpenAI governed synthesis → GalviShot/GalviSight/GalviPath → secure GalviChart → GalviClinic/Business Physician → Treatment Plan / Rx / Audit / referral → monitoring/outcomes → GalviVault → next governed decision. Day 5 must extend this loop, not remove earlier evidence-gathering steps to avoid defects.

| **Inherited invariant** | **Day 5 regression proof** |
| --- | --- |
| Deterministic Score/Acuity/Clinical Confidence | Stored facts unchanged by Clinic/Chart/GalviGuide; browser never recomputes. |
| Clarification questions | Question → answer → versioned evidence still writes exactly once and affects downstream reasoning. |
| Targeted Shot questions | Still appear where clinically useful; not bypassed by active-care UI. |
| Governed AI | Accepted/rejected/fallback/source metadata behavior unchanged; raw proposal not treatment truth. |
| Day7D runtime remediation | Observation/product-result upserts remain atomic/idempotent; repeated reads/replays no 500/blank. |
| Chart activation | Verified GalviShot entitlement remains activation event; Day 5 enriches existing Chart only. |
| Secure return | Same principal/BHR across supported refresh/recovery/cross-device path. |
| Projection security | Customer and clinician allowlists remain permission-correct. |
| History | Day 5 writes append/version; prior Day 1–4 truth remains traceable. |

## 21. Day 5 Implementation Sequence — Critical Path Order

| **Order** | **Build slice** | **Why this order** |
| --- | --- | --- |
| 1 | Entry gate + anti-work-branch lock + baseline fingerprint | Prevents another build on wrong ref/runtime and protects Day 4 known-good state. |
| 2 | Schema/domain inventory + allowed-file manifest | Avoids shadow schema and speculative rewrites. |
| 3 | Finalize Path contract + care-state routing | Defines passive/active/specialty/referral semantics consumed by every later slice. |
| 4 | Clinic brief read path | Proves clinician can consume the same Chart/BHR safely without writes. |
| 5 | Finding decision governance | Establishes human authority bridge from digital evidence to active care. |
| 6 | Treatment Plan create/version/project | Core Day 5 value; prove before adding subordinate services. |
| 7 | GalviRx embedded resource | Attach to proven plan/action contract. |
| 8 | GalviAudit/GalviLab order/result | Add diagnostic loop with same evidence lineage. |
| 9 | Referral + regulated boundary | Add specialty care safely and consent-aware. |
| 10 | Monitoring/check-in/outcome/reassessment | Close longitudinal care loop and Chart updates. |
| 11 | GalviGuide bounded support | Enable routine navigation over now-stable care objects; adversarially test limits. |
| 12 | Stripe/Calendly regression + full inherited gates | Prove active-care commercialization did not break existing journey. |
| 13 | Exact-SHA QA + Human E2E + rollback | Evidence, not local code, determines final PASS. |

## 22. Automated Day 5 QA Matrix — Mandatory Tests

| **ID** | **Pass criterion** | **Class** |
| --- | --- | --- |
| T01 | Branch guard rejects work checkout before edits/publish. | MANDATORY |
| T02 | Remote QA SHA must equal signed Day 4 Build Final at start. | MANDATORY |
| T03 | Full inherited Day 4 gate passes before Day 5 delta. | MANDATORY |
| T04 | Full Day 3 clarification/governed-AI regression passes. | MANDATORY |
| T05 | Clinic brief resolves same authorized principal/BHR and is read-only. | MANDATORY |
| T06 | Clinic brief cross-record request denied without leak. | MANDATORY |
| T07 | Customer cannot fetch clinician-only brief fields. | MANDATORY |
| T08 | Path contract validates priority/objective/actions/evidence/cadence/support/escalation/source versions. | MANDATORY |
| T09 | Passive yellow case can remain Path/Guide without unnecessary Clinic. | MANDATORY |
| T10 | Active orange case routes to Clinic correctly. | MANDATORY |
| T11 | Business Physician can confirm finding with audit/version lineage. | MANDATORY |
| T12 | Reject finding preserves original artifact and downstream history. | MANDATORY |
| T13 | Modify finding creates governed clinician version; no overwrite. | MANDATORY |
| T14 | Customer/GalviGuide cannot confirm finding or create Treatment Plan. | MANDATORY |
| T15 | Plan create requires accepted/confirmed evidence and source versions. | MANDATORY |
| T16 | Plan replay with same client_request_id creates one plan/version. | MANDATORY |
| T17 | Plan edit creates new version; prior remains traceable. | MANDATORY |
| T18 | Stale source version returns conflict/needs_review, not silent bind. | MANDATORY |
| T19 | Plan projects correctly to clinician and customer allowlists. | MANDATORY |
| T20 | GalviRx links to plan/action and customer projection as approved. | MANDATORY |
| T21 | Duplicate GalviRx request is idempotent. | MANDATORY |
| T22 | GalviAudit order requests correct evidence/domain and stays in same BHR. | MANDATORY |
| T23 | Audit result returns as new evidence linked to original finding/hypothesis. | MANDATORY |
| T24 | Regulated Audit/referral case routes externally; no prohibited advice. | MANDATORY |
| T25 | Referral requires consent before protected handoff. | MANDATORY |
| T26 | Referral status lifecycle/outcome returns to same BHR. | MANDATORY |
| T27 | Cross-record referral/order/outcome writes denied. | MANDATORY |
| T28 | GalviGuide allowed navigation/evidence/reminder/check-in behavior passes. | MANDATORY |
| T29 | GalviGuide prohibited score/diagnosis/plan/override/licensed-advice requests fail closed. | MANDATORY |
| T30 | Check-in appends once; refresh/replay does not duplicate. | MANDATORY |
| T31 | Milestone/outcome links to plan/action and updates current projection. | MANDATORY |
| T32 | Outcome correction versions history rather than overwriting. | MANDATORY |
| T33 | Reassessment uses latest evidence/outcome and preserves prior plan/version. | MANDATORY |
| T34 | Chart Timeline/Care Plan/GalviClinic/History progressively enrich same Chart. | MANDATORY |
| T35 | No Chart/brief read calls OpenAI or creates database rows. | MANDATORY |
| T36 | Stripe entitlement remains server-verified; URL/localStorage tamper fails. | MANDATORY |
| T37 | Calendly/booking intent preserves source session/BHR and replay idempotency. | MANDATORY |
| T38 | Provider/adapter outage leaves canonical care state intact with structured fallback. | MANDATORY |
| T39 | Structured JSON error on invalid action/runtime failure; no HTML/blank critical path. | MANDATORY |
| T40 | No secrets/protected prompt/raw clinician notes in analytics/log output. | MANDATORY |
| T41 | Migration re-run/no-op and Day 4 runtime compatibility proven. | MANDATORY |
| T42 | D1 row counts/unique keys show no duplicate plan/order/referral/check-in/outcome after replay. | MANDATORY |
| T43 | Exact candidate remote SHA equals deployed QA source/version. | MANDATORY |
| T44 | Direct deployed permission and regulated-boundary negatives pass. | MANDATORY |
| T45 | Day7D atomic/idempotent persistence remains green under Day 5 replay. | MANDATORY |
| T46 | Full inherited customer journey Triage→Vitals→Score→Shot→Sight→Path remains green. | MANDATORY |
| T47 | Secure return/cross-device uses same canonical record after active-care updates. | MANDATORY |
| T48 | Rollback to Day 4 runtime is non-destructive and reads additive schema. | MANDATORY |
| T49 | Manual repair=NO for automated/deployed/Human E2E run. | MANDATORY |
| T50 | Evidence package contains complete baseline→candidate→deployment→D1→Human E2E→rollback chain. | MANDATORY |

## 23. D1 Integrity Assertions — Before and After Deployed Human E2E

| **ID** | **Integrity assertion** |
| --- | --- |
| D1-1 | No new principal/BHR/Chart identity for existing Day 4 test subject during active-care flow. |
| D1-2 | Exactly one canonical Treatment Plan create for one idempotent request; edits produce versions, not duplicate plan identities. |
| D1-3 | Every plan version references same authorized BHR and source Score/Shot/Sight/Path versions. |
| D1-4 | Finding confirm/reject/modify decisions preserve original finding and actor/audit lineage. |
| D1-5 | Every GalviRx record references valid BHR + plan/action/recommendation and approved resource type. |
| D1-6 | Every GalviAudit order references valid BHR + source reason/finding/plan; result_ref is same-scope. |
| D1-7 | Every referral references valid BHR/source and consent state; no cross-record provider/outcome relation. |
| D1-8 | Every check-in/milestone/outcome references valid plan/action and BHR; no orphan outcome. |
| D1-9 | Replay counts unchanged for plan/Rx/order/referral/check-in/outcome idempotency cases. |
| D1-10 | No customer-visible projection row stores clinician-only protected fields as competing truth. |
| D1-11 | Rejected/raw AI artifacts are not referenced as approved treatment basis. |
| D1-12 | Audit events exist for material clinician decisions/referrals and denied cross-record attempts as expected. |
| D1-13 | Prior Day 1–4 evidence/findings/results/history remain intact and version references resolvable. |
| D1-14 | Current Chart projection version/fingerprint advances after approved Day 5 event without new Chart identity. |
| D1-15 | No destructive migration/data delete/manual repair was used for PASS run. |
| D1-16 | Rollback to Day 4 runtime leaves Day 5 additive rows intact/readable or safely ignored; canonical earlier state not corrupted. |

## 24. Exact-SHA QA Deployment & Runtime Verification

### 24.1 Pre-deploy gate

- [ ] Working tree/detached build contains only the intended Day 5 critical-path delta plus documented pre-existing files.

- [ ] All focused Day 5 tests and full inherited Day 4 + Day 3 gates pass locally/approved CI path.

- [ ] Any D1 migration is validated against current QA schema and has a non-destructive Day 4 rollback compatibility plan.

- [ ] No secret, protected payload, raw AI prompt, private clinician note, or environment credential appears in diff/log/evidence.

- [ ] Candidate commit SHA is immutable and recorded before deployment.

- [ ] origin/qa-revamped-galvicare-0-5 equals the candidate intended for QA; no work/new branch is involved.

- [ ] If using detached/API publication lane, remote QA was re-fetched immediately before fast-forward and no race occurred.

### 24.2 Deploy exact candidate through existing approved path

> **DO NOT INVENT A NEW DEPLOYMENT PATH**
>
> Use the same known-good Cloudflare/GitHub deployment mechanism proven by Day 4. If Wrangler returns 403 or CI is queued, diagnose platform/auth state; do not create a new Worker, D1 database, workflow, or branch as a workaround.

1. Deploy the exact candidate SHA to the existing QA Worker/frontend using the approved path.

2. If a Day 5 additive migration is required, apply only to the existing QA D1 binding after binding identity is re-verified.

3. Capture deployment ID/version, deployed SHA/runtime marker, Worker route, D1 binding, schema/migration version, timestamp.

4. Call health/capabilities and confirm inherited Day 1–4 capability flags plus Day 5 active-care markers if architecture exposes them.

5. Run direct deployed probes for clinic brief, plan authorization, GalviGuide prohibited action, cross-record denial, regulated referral, idempotent replay, and structured errors.

6. Run full Day 3 clarification/AI + Day 4 Chart/secure-return regression on deployed QA before Human E2E.

7. Capture before/after D1 integrity assertions for the chosen Human E2E subject.

### 24.3 Deployed proof chain

| **Proof** | **Required evidence** |
| --- | --- |
| Git | Signed Day 4 base SHA + candidate SHA + remote QA SHA; no work/new ref. |
| Deployment | Existing QA backend/frontend deployment IDs/source commit. |
| D1 | Existing QA binding/database + schema/migration checksum. |
| Runtime | Health/capability response + direct Day 5 action probes. |
| Security | Unauthorized/cross-record/protected-field/GalviGuide authority/regulated-boundary negatives. |
| Progression | Path → Clinic → plan → Rx/Audit/referral → monitoring/outcome enrich same Chart. |
| Inherited regression | Day 3 clarification/governed AI + Day 4 activation/return/projection/history + Day7D replay green. |
| Human E2E | Run ID + screenshots/logs/D1 assertions + manual repair=NO. |
| Rollback | Restore Day 4 runtime and prove non-destructive compatibility. |

## 25. Day 5 Human E2E Run Sheet — No Manual Repair

| **ID** | **Human step** | **Expected result / evidence** |
| --- | --- | --- |
| H01 | Open a clean customer session and complete/resolve Triage. | Canonical principal/BHR follows inherited rules; no duplicate. |
| H02 | Complete Vitals/Score including clarification question and answer. | Versioned evidence persists once; deterministic Score/acuity/confidence correct. |
| H03 | Complete targeted GalviShot questions where presented, then Shot/Sight/Path. | Governed evidence synthesis visible; accepted lineage preserved; no runtime error. |
| H04 | Verify Shot-activated GalviChart and secure return. | Same Chart/BHR; customer projection correct; no protected fields. |
| H05 | Inspect final GalviPath. | Priority/objective/actions/evidence/cadence/support/escalation complete and source-linked. |
| H06 | For a passive/yellow case, use GalviGuide without Clinic. | Approved explanation/navigation/reminder works; no forced active care. |
| H07 | Attempt prohibited GalviGuide treatment/diagnosis/score action. | Fails closed with safe bounded response; no write. |
| H08 | For active/orange case, choose/continue to GalviClinic booking. | Verified entitlement/booking/source session/BHR preserved. |
| H09 | Open Business Physician encounter from clinician workspace. | Same authorized BHR/Chart; pre-visit brief complete; customer-private vs clinician context correct. |
| H10 | Confirm one accepted finding. | Clinician decision version + actor/audit recorded; original finding preserved. |
| H11 | Reject or modify another finding. | Prior artifact remains; new clinician decision/version traceable. |
| H12 | Create a Treatment Plan from governed evidence. | One versioned plan stored with objective/actions/metrics/milestones/monitoring/escalation/source_versions. |
| H13 | Refresh/replay the plan create request. | No duplicate plan/version; stored response returned. |
| H14 | Add an embedded GalviRx resource. | Linked to plan/action; appropriate customer Chart visibility. |
| H15 | Order GalviAudit for low-confidence/contradictory evidence case. | Correct domain/reason/evidence requested; order on same BHR. |
| H16 | Record/ingest an authorized Audit result. | New evidence/result links to original finding/order; governed reassessment path available. |
| H17 | Create a regulated/specialty referral with consent. | Minimum data handoff; no internal licensed advice; status recorded. |
| H18 | Advance referral status and record authorized outcome. | Outcome returns to same BHR/referral; audit/history updated. |
| H19 | Customer acknowledges Treatment Plan and submits scheduled check-in. | Acknowledgement separate from authorship; check-in appends once. |
| H20 | Report milestone/outcome. | Linked to plan/action; Timeline/current Chart updates without deleting prior state. |
| H21 | Perform reassessment/plan modification as Business Physician. | New plan version/reassessment decision; prior plan/source history retained. |
| H22 | Refresh/cross-device return after active-care updates. | Same principal/BHR/Chart; current projection reflects care; no duplicate identity. |
| H23 | Attempt cross-record plan/order/referral access. | Denied safely; no leaked existence/content; audit evidence. |
| H24 | Simulate provider/OpenAI/adapter failure where approved test harness exists. | Stored deterministic/accepted care state remains usable; structured fallback. |
| H25 | Verify D1-1..D1-16 after run. | Integrity clean; manual repair=NO. |
| H26 | Rollback runtime to signed Day 4 Build Final using immutable/approved path. | Restore succeeds; Day 1–4 journey works; additive Day 5 data not corrupted/destructively removed. |
| H27 | Restore exact Day 5 candidate deployment. | Same candidate SHA/runtime returns; active-care records still readable and projection correct. |
| H28 | Sign evidence index and final status. | All mandatory tests pass; exact baseline/candidate/deploy/D1/rollback chain recorded. |

## 26. Critical-Path Defect Remediation Playbook

| **Failure class** | **First evidence to capture** | **Allowed response** | **Forbidden response** |
| --- | --- | --- | --- |
| Wrong branch/ref | branch, upstream, remote QA SHA, signed base SHA. | Stop edits; switch/use detached/API lane from exact QA base; publish only existing QA ref. | Continue on work; create Day5 branch; force-push over moved QA. |
| Deployment mismatch | candidate SHA, remote SHA, deployment ID/version, health marker. | Redeploy exact candidate via approved path; fix platform/auth if needed. | Change application code to compensate for stale deploy. |
| D1 schema error | exact SQL/error, schema info, binding identity, migration checksum. | Minimal additive migration/query correction after schema inspection. | Create new DB; destructive migration; manual row deletes. |
| Authorization leak | request, actor/role, resolved BHR, policy decision, response fields. | Fix server scope/allowlist at proven layer; rerun negatives. | Hide button only; rely on client BHR/role. |
| Treatment integrity | plan/source versions/evidence status/actor decision. | Tighten domain validation/authorization/versioning. | Allow unsupported treatment for demo convenience. |
| GalviGuide boundary | prompt/action/schema/policy trace + persisted effects. | Fail closed, bound schema/action, deterministic escalation. | Add broader autonomous authority. |
| Replay duplicate | client_request_id, request fingerprint, row/version counts. | Fix idempotency/unique/upsert transaction at write service. | Disable refresh/retry or delete duplicate manually. |
| Chart stale/blank | projection version, API response, JS/runtime error, canonical row state. | Fix proven projection/cache/render layer; preserve session/BHR. | Recompute truth in browser; new Chart identity. |
| Payment/booking | server entitlement/booking record, adapter response/webhook, source context. | Repair exact adapter mapping/idempotency only. | Change pricing/live config or bypass verification. |
| Runner/Cloudflare outage | platform status/error IDs/logs, unchanged code diff. | Retry proven path or use approved direct deploy lane; preserve code. | Rewrite workflows/application speculatively. |

## 27. Day 5 Release Evidence Package

| **Artifact folder / section** | **Required Day 5 evidence** |
| --- | --- |
| 01_day4_baseline | Signed Day 4 Build Final SHA; branch/remote manifest; QA backend/frontend versions; D1 binding/schema; H01–H22 evidence; rollback target. |
| 02_branch_lock | Anti-work-branch guard output; chosen publication lane; no-new-ref proof; remote base race check. |
| 03_change_manifest | Allowed files; git diff name/stat; reason each changed file is Day 5 critical path. |
| 04_schema_domain | Current schema inventory; logical-object mapping; additive migration/checksum/rollback compatibility if any. |
| 05_api_contracts | New/extended action request/response examples; authorization/structured error/idempotency cases. |
| 06_active_care | Clinic brief, finding decision, Treatment Plan, GalviRx, Audit/Lab, referral, monitoring/outcome examples with IDs/version lineage. |
| 07_safety_governance | GalviGuide allowed/prohibited adversarial results; regulated routing; customer/clinician projection negatives. |
| 08_automated_qa | T01–T50 results, skipped mandatory=0; inherited Day 3/4 gates. |
| 09_d1_integrity | D1-1..D1-16 before/after queries/results; manual repair=NO. |
| 10_deployed_qa | Candidate SHA, remote SHA, deployment IDs, capability markers, direct deployed probes. |
| 11_human_e2e | H01–H28 run sheet, screenshots/logs/record IDs, defect log. |
| 12_rollback | Day 4 immutable/runtime restore + candidate restore; non-destructive D1 proof. |
| 13_final_status | DAY 5 HUMAN E2E PASS / DAY 5 BUILD FINAL or FAIL/STOP/ROLLBACK; exact Day 6 handoff baseline. |

## 28. Day 5 Rollback Strategy

### 28.1 Two rollback levels

| **Level** | **Use when** | **Action** |
| --- | --- | --- |
| Runtime rollback | Day 5 code/deployment causes P0/P1 while additive data remains safe. | Restore exact signed Day 4 backend/frontend immutable deployment/version through approved path; do not delete Day 5 rows. |
| Candidate reversion | A Day 5 commit must be removed from QA history before finalization. | Create a normal corrective/revert commit on existing QA ref based on proven current remote; no force push unless repository governance explicitly requires and approves it. |
| Schema compatibility | Additive migration exists. | Keep additive schema; Day 4 runtime must tolerate/ignore new tables/nullable columns. No down-migration that destroys care history. |
| Adapter fallback | Stripe/Calendly/provider integration fails but core record is safe. | Restore prior adapter/runtime behavior or documented fallback; preserve canonical care state. |

### 28.2 Rollback must prove

- [ ] Known-good Day 4 backend/frontend deployment can be restored through approved immutable/version path.

- [ ] Existing principal/BHR/evidence/accepted AI/Chart history remains intact.

- [ ] No Day 5 migration makes Day 4 Worker unreadable or requires destructive SQL.

- [ ] GalviTriage/Vitals/Score/Shot/Sight/Path/Chart secure-return closed loop remains usable after rollback.

- [ ] No manual destructive SQL/delete is required to recover.

- [ ] Rollback target, deployment/version IDs, SHA, D1 state, and post-rollback smoke evidence are recorded.

- [ ] Exact Day 5 candidate can be restored after rollback rehearsal and reads the same active-care data correctly.

## 29. Day 5 Stop/Go Gate

> **GO ONLY WHEN**
>
> A customer can move from governed evidence → recommended GalviPath → GalviClinic/active care when appropriate → Business Physician finding validation → versioned Treatment Plan → embedded GalviRx / GalviAudit-GalviLab / qualified referral / future GalviStudio route → monitoring/check-in/outcome → reassessment, with every decision linked to the same canonical record. Day 3 clarification/governed AI and Day 4 Chart/secure-return invariants remain green; exact-SHA QA + D1 assertions + Human E2E + rollback all pass with manual repair=NO.

> **STOP / ROLLBACK IF**
>
> Treatment can be created without accepted/confirmed evidence or authorized Business Physician governance; GalviGuide/OpenAI becomes an autonomous treatment authority; a regulated matter is handled autonomously; customer sees protected clinician context; cross-record writes/leaks occur; plan/Rx/Audit/referral/check-in/outcome replay duplicates or overwrites history; monitoring/outcomes are disconnected from the plan/action that produced them; exact QA deployment/D1 identity cannot be proven; Day 3/4 regress; or rollback is destructive/unavailable.

| **Gate** | **PASS evidence** |
| --- | --- |
| Baseline | Signed Day 4 Build Final baseline proven; anti-work-branch execution lane locked. |
| Path | Final contract complete; passive/active/specialty/referral routing correct. |
| Clinic | Authorized pre-visit brief + Business Physician encounter controls work from same Chart/BHR. |
| Treatment | Finding governance + versioned evidence-bound Treatment Plan + source versions + actor/audit. |
| Rx/Audit/Referral | Embedded Rx; Audit/Lab evidence loop; consented qualified referral; regulated boundary safe. |
| Guide | Allowed behaviors work; prohibited authority tests fail closed. |
| Monitoring | Check-ins/milestones/outcomes/reassessment link to plan/action and update same Chart without history loss. |
| Commercial | Existing Stripe/Calendly entitlement/booking continuity intact. |
| Security | Customer/clinician allowlists; cross-record/role/consent negatives pass. |
| Inherited | Day 3 clarification/governed AI + Day 4 Chart/return/history + Day7D replay green. |
| Runtime | Exact candidate on existing QA Worker/frontend + expected D1 binding; structured errors/recovery pass. |
| D1 | D1-1..D1-16 clean; manual repair=NO. |
| Rollback | Day 4 restore and Day 5 candidate restore non-destructive and verified. |
| Decision | DAY 5 HUMAN E2E PASS signed; exact Day 6 handoff baseline recorded. |

## Appendix A — One-Page Day 5 Completion Checklist

- [ ] Exact signed Day 4 Build Final SHA/deployment/D1/rollback baseline recorded.

- [ ] Existing qa-revamped-galvicare-0-5 remote ref only; main untouched; no work/new remote branch.

- [ ] Anti-work-branch guard executed; approved branch or detached/API no-new-branch lane documented.

- [ ] Full inherited Day 4 and Day 3 gates green before Day 5 changes.

- [ ] Clarification question → answer → versioned evidence → targeted Shot questions → governed Shot/Sight/Path closed loop preserved.

- [ ] Day7D atomic/idempotent observation/product-result upsert regression green.

- [ ] GalviChart remains projection of one canonical GalviVault record; secure return still resolves same principal/BHR.

- [ ] Final GalviPath priority/objective/actions/evidence/cadence/support/escalation contract works.

- [ ] GalviClinic pre-visit brief and Business Physician encounter work from same authorized Chart/BHR.

- [ ] Finding confirm/reject/modify governance is versioned/audited and preserves source artifacts.

- [ ] Treatment Plan is evidence-bound, Business Physician-approved, versioned, idempotent, and projected correctly.

- [ ] GalviRx embedded and linked to plan/action; no standalone pharmacy/hidden authority.

- [ ] GalviAudit/GalviLab order/result returns governed evidence to same BHR.

- [ ] GalviGuide bounded; prohibited authority/advice tests fail closed.

- [ ] Referral directory/handoff/status/outcome works with consent and regulated boundaries.

- [ ] Monitoring/check-in/milestone/outcome/reassessment loop works and updates same Chart/history.

- [ ] Stripe/Calendly entitlement/booking continuity survives refresh/replay and preserves source session/BHR.

- [ ] Unauthorized/cross-record/role/consent/protected-field negatives pass.

- [ ] T01–T50 automated tests PASS; mandatory skipped=0.

- [ ] D1-1..D1-16 clean; manual repair=NO.

- [ ] Exact candidate SHA deployed to existing QA Worker/frontend and expected QA D1 binding.

- [ ] H01–H28 Human E2E PASS with evidence index.

- [ ] Rollback to Day 4 Build Final and restore to Day 5 candidate tested/non-destructive.

- [ ] DAY 5 HUMAN E2E PASS / DAY 5 BUILD FINAL signed and Day 6 handoff baseline recorded.

## Appendix B — Day 6 Handoff Contract

Day 6 (GalviStudio 1.0 Venture Development Management + GalviPro Practice System) may begin only from the exact Day 5 Build Final baseline. Day 6 consumes the active-care system built on Day 5; it must not rebuild identity, evidence intelligence, Chart continuity, Clinic treatment governance, referral boundaries, or longitudinal outcomes.

| **Inherited control** | **Day 6 obligation** |
| --- | --- |
| Canonical record | Use same principal/BHR/Chart for prescribed Studio engagement and returned outcomes. |
| Treatment order | A GalviStudio Sprint/intervention prescribed from care identifies source plan/action, objective, expected evidence, and outcome. |
| Business Physician practice | Standardize the now-working encounter/treatment protocol; do not create a separate advisory record. |
| Stage gates | Studio entry/advance/hold/rework/stop decisions must be evidence-gated and write outcomes back to GalviVault. |
| GalviGuide / referral boundaries | Preserve bounded navigation and qualified external routing; Studio does not absorb regulated work. |
| Monitoring/outcomes | Studio engagement evidence/outcomes return to same longitudinal care loop and can inform reassessment. |
| Commercial continuity | Day 6 packaging may expose care-to-Studio offers but must not break Day 5 booking/payment/entitlement contracts. |
| Regression | Day 6 reruns Day 5 + inherited Day 4/Day 3 gates before PASS. |

> **TARGET DAY 6 START STATE**
>
> DAY 5 HUMAN E2E PASS → DAY 5 BUILD FINAL → BUSINESS PHYSICIAN ACTIVE-CARE LOOP OPERATIONAL ON THE SAME LONGITUDINAL GALVIVAULT / GALVICHART RECORD. If any P0/P1 gate is red, the only valid declaration is FAIL / STOP / ROLLBACK.

## Appendix C — Codex Evidence / Status Report Template

```text
DAY 5 BUILD STATUS

BASELINE
- repo/root:
- origin URL:
- implementation ref:
- signed Day 4 Build Final SHA:
- origin/qa SHA before:
- origin/main SHA:
- authoring lane: approved QA checkout | detached exact-base | GitHub object API
- QA backend Worker/version/runtime:
- QA frontend deployment/version:
- QA D1 binding/database:
- schema/migrations:
- Day 3 AI/rules/prompt/schema versions:
- Day 4 Chart capability proof:
- rollback target:

BRANCH / PUBLICATION SAFETY
- current checkout before edits:
- anti-work-branch guard: PASS/FAIL
- new remote branches created: NO
- work ref pushed: NO
- remote QA base race check: PASS/FAIL

IMPLEMENTATION DELTA
- files changed:
- migration (if any):
- reason each file is critical path:
- unrelated workflow files changed: NO

AUTOMATED QA
- inherited Day 3 gate: PASS/FAIL
- inherited Day 4 gate: PASS/FAIL
- Day 5 T01-T50: PASS/FAIL (mandatory skipped=0)
- D1-1..D1-16: PASS/FAIL

DEPLOYED QA
- candidate SHA:
- remote QA SHA:
- backend deployment/version ID:
- frontend deployment/version ID:
- D1 binding/schema checksum:
- direct active-care/security/regulated/idempotency probes:

HUMAN E2E
- H01-H28: PASS/FAIL
- run IDs / principal / BHR / plan IDs:
- manual repair: NO

DEFECTS
- failure -> proven root cause -> minimal diff -> focused retest -> regression

ROLLBACK
- Day 4 immutable/runtime restore: PASS/FAIL
- Day 5 candidate restore: PASS/FAIL
- non-destructive D1 compatibility: PASS/FAIL

FINAL DECLARATION
DAY 5 HUMAN E2E PASS / DAY 5 BUILD FINAL
OR
DAY 5 FAIL / STOP / ROLLBACK
```

## Appendix D — Source Alignment Notes

- The Authoritative Seven-Day Guide defines Day 5 as closing the treatment loop from digital recommendation to Business Physician care, prescription, referral, and monitoring, with GalviPath, GalviClinic, Treatment Plan, GalviRx, GalviAudit/GalviLab, GalviGuide, referrals, and outcomes as the core modules.

- The Authoritative Guide requires the same canonical longitudinal record: evidence → finding → hypothesis → recommendation → treatment → outcome lineage is preserved and versioned; D1 remains GalviVault system of record and the Worker remains the authoritative API/orchestration boundary.

- The Day 4 Builder handoff requires Day 5 to begin only from exact Day 4 Build Final, preserve Shot-based Chart activation, use the same authorized principal/BHR and Chart context, preserve customer/clinician projection security, retain Day 3 governed intelligence and clarification evidence, and rerun Day 4 + Day 3 regressions.

- The Day 4 Builder explicitly deferred full treatment workflow, broad referral/Lab build, and autonomous treatment to Day 5, while preserving two-way append/version commands and Chart continuity that Day 5 now extends.

- The recurring work-branch issue is addressed as a hard build gate: never author/push work; target only the existing qa-revamped-galvicare-0-5 ref, with a detached exact-base or GitHub object API publication lane when the Codex checkout is pinned to work. No new remote branch is required or permitted.

- Critical-path principle: ship the correct 1.0 active-care foundation, not a final 2.0 predictive system, 3.0 autonomous care platform, national referral network, standalone pharmacy, or broad enterprise admin system.

*Document control: Prepared August 27, 2026 for GalviStudio 1.0 | GalviCare 1.0 Day 5 implementation. This runbook intentionally uses repository-discovery language for filenames/routes because Codex must inspect and extend the real Day 4 Build Final codebase rather than fabricate a parallel implementation.*
