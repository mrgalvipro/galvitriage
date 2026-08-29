**GALVISTUDIO 1.0 \| GALVICARE 1.0**

**Day 7 Builder Guide**

**Commercial Readiness + Human E2E + Release Gates + Production Cutover + Evidence Package**

**CODEX IMPLEMENTATION ENGINEER EDITION \| v1.0**

CURRENT BUILD STATUS

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>DAY 6 BUILD FINAL IS THE ONLY AUTHORIZED STARTING POINT</strong></p>
<p>Day 7 may begin only after Codex independently proves the exact signed Day 6 Build Final SHA, the deployed QA frontend/Worker versions, the QA D1 binding/schema, the Day 6 Human E2E PASS evidence, and the non-destructive rollback/restore evidence. The attached Day 6 Builder defines this handoff but does not contain an executed Day 6 final SHA. DO NOT substitute the historical Day 5 SHA, local HEAD, a work-branch commit, or the newest remote commit. If the exact signed Day 6 baseline cannot be proven, STOP before editing or cutover.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

DAY 7 MISSION

Freeze the 1.0 feature set, prove the complete GalviCare + GalviStudio + GalviPro ecosystem under real customer, clinician, Studio, payment, governed-AI, security, recovery, and rollback conditions, then cut over only the paths that satisfy every applicable 1.0 release gate. Day 7 is a release-and-proof day, not an architecture day.

CRITICAL-PATH RULE

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ONLY RELEASE-CLOSING WORK IS AUTHORIZED</strong></p>
<p>Every Day 7 change must close a proven P0/P1 defect, security/data defect, payment/entitlement defect, unsafe-AI defect, wrong care-routing defect, production-cutover defect, trust-breaking copy defect, or release-evidence gap. No new feature, branch family, application rewrite, schema redesign, pricing experiment, protocol expansion, or unrelated workflow cleanup is authorized.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# How Codex Must Use This Builder

This is an implementation and production-release runbook, not a design brainstorm. Prove the exact Day 6 Build Final first; freeze features; inventory the real repository, deployment workflows/path filters, D1 migrations, runtime bindings, version manifests, QA evidence, and production state; then make only the smallest release-critical delta. Execute the complete QA release gate, Human E2E P0 matrix, security/accessibility review, commercial lock, controlled production cutover, production smoke, rollback rehearsal, and final evidence package. Stop on the first P0/P1 failure and remediate only the proven root cause.

| **Priority** | **Instruction**                             | **Practical meaning**                                                                                                                                                                      |
|--------------|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P0           | Exact Day 6 handoff only                    | Begin only from the signed Day 6 Build Final SHA + deployed QA runtime + QA D1/schema + H01-H30/Day 6 evidence + rollback target.                                                          |
| P0           | No work/new branch                          | Use existing qa-revamped-galvicare-0-5 for any final QA fixes. Never create/push work, Day7, release, workaround, or branch-family refs.                                                   |
| P0           | Production publication is existing-ref only | Production source is the exact signed QA candidate. Destination is existing main only. No release branch. If repository protection requires PR, open it from existing QA to existing main. |
| P0           | Feature freeze                              | No net-new 1.0 feature after Day 7 begins. P2/P3 work is deferred.                                                                                                                         |
| P0           | One canonical record                        | The same principal/BHR/Chart and Day 6 Studio engagement/outcome lineage must survive QA, production, refresh, return, and rollback.                                                       |
| P0           | Environment separation                      | QA uses QA D1/TEST payment/config; PROD uses production D1/LIVE payment/config. Never “fix” production by pointing it at QA resources.                                                     |
| P0           | Server authority                            | Worker remains authoritative for auth, entitlement, clinical orchestration, AI provider calls, and canonical writes.                                                                       |
| P0           | Rollback before public cutover              | No public CTA/embed switch until rollback assets are identified and controlled production tests pass.                                                                                      |
| P1           | Evidence decides release                    | Local/CI success is insufficient. Exact SHA -\> deployment -\> runtime -\> D1/audit -\> Human E2E -\> controlled production transaction -\> rollback evidence determines PASS.             |

# 1. Day 7 Scope Decision, Objectives & Definition of Done

Authoritative Day 7 objective: freeze features, prove the complete ecosystem under real customer, clinician, Studio, payment, AI, security, recovery, and rollback conditions, then cut over only the paths that satisfy all applicable 1.0 gates.

## 1.1 Day 7 Definition of Done

\[ \] Exact signed Day 6 Build Final SHA, QA frontend/Worker deployment IDs, QA D1 binding/schema checksum, Day 6 PASS evidence, and rollback target are captured before any Day 7 edit.

\[ \] Feature freeze is active; any changed file is tied to a documented P0/P1 or release-gate failure.

\[ \] Existing qa-revamped-galvicare-0-5 is the only implementation ref; no work/new remote branch is created or pushed.

\[ \] Final QA candidate is immutable, tagged/version-manifested, and deployed exactly to the proven QA runtime before Human E2E.

\[ \] Commercial architecture is locked: GalviChart activation, approved paid diagnostics, GalviClinic payment/booking, Business Health Membership beta, and Studio program/Sprint order contracts are server-governed and coherent.

\[ \] Canonical D1 journey/clinical/commercial events are present; HubSpot/GA4/Clarity remain non-blocking adapters and never receive sensitive AI prompts/protected payloads.

\[ \] Security/accessibility/trust review passes across customer, clinician, and Studio surfaces; no secret/client trust boundary violation remains.

\[ \] P0-01 through P0-16 Human E2E all PASS with manual_repair=NO.

\[ \] GalviCare 1.0, GalviStudio 1.0, and GalviPro 1.0 formal release gates all PASS for the paths intended to launch.

\[ \] Production D1 receives only the exact tested additive 1.0 migration set; no production-only SQL or destructive migration is used.

\[ \] Production Worker/app use the signed candidate with production environment/bindings/secrets, fixture/test overrides disabled, approved origins, and server-verified LIVE payment entitlement.

\[ \] Controlled production no-payment, paid Shot -\> Chart, governed-AI, record/audit, Clinic booking, and non-regulated referral/Studio prescription checks pass before public CTA cutover.

\[ \] Public Carrd/primary CTA moves only after production smoke passes and rollback package is ready.

\[ \] Rollback package covers frontend, Worker, D1/schema, OpenAI disable/fallback, Stripe entitlement path, storefront route, and operational fallback; rehearsal proves recovery without destructive data repair.

\[ \] The 14-part release evidence package and final sign-offs are complete.

\[ \] Final declaration is GALVISTUDIO 1.0 \| GALVICARE 1.0 PRODUCTION RELEASE PASS / DAY 7 BUILD FINAL, or NO-GO / STOP / ROLLBACK.

## 1.2 Explicit in-scope / out-of-scope

| **Capability** | **Day 7 requirement**                                                                    | **Not authorized on Day 7**                                                                        |
|----------------|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| Feature set    | Freeze Day 1-6 1.0 scope; repair only release blockers.                                  | New product features, broad UX redesign, protocol expansion, speculative automation.               |
| Commercial     | Lock entitlements, Membership beta, Clinic and Studio package/order metadata.            | Unapproved pricing redesign, new subscription tiers, new payment architecture.                     |
| Analytics      | Canonical D1 events + non-blocking GA4/Clarity/HubSpot evidence.                         | Sensitive payload/prompt logging; analytics as system of record.                                   |
| Security/trust | Secrets, RBAC, consent, safe errors, input controls, accessibility, boundary copy.       | Client-side authorization; production debug leakage; cosmetic-only security fixes.                 |
| QA             | Full inherited regression + Day 7 release tests + P0-01..P0-16.                          | Skipping tests because earlier days passed.                                                        |
| Production     | Exact tested code/migrations/config; controlled transaction; public cutover after proof. | Ad-hoc production-only patching, QA DB in PROD, force-push main.                                   |
| Rollback       | Predefined tested rollback/disable/fallback package.                                     | Destructive down-migration or deleting canonical 1.0 data to make rollback appear clean.           |
| Roadmap        | Defer 1.5/2.0/3.0 capabilities.                                                          | Mobile app, institutional admin, predictive intelligence, enterprise APIs, large network features. |

# 2. Recurring GalviCare/GalviVault Defects - Day 7 Mandatory Prevention Controls

These controls convert the recurring work-branch, stale-base, deployment-path, wrong-runtime, D1-binding, environment-mixing, entitlement, identity, authorization, AI-governance, and manual-repair failures into release gates. They are mandatory release controls, not preferences.

| **Defect pattern**              | **Observed risk**                                                            | **Day 7 control**                                                                                                         | **Required proof**                                                               |
|---------------------------------|------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| Branch drift / work checkout    | Codex authors on work and cannot safely publish the signed QA candidate.     | STOP before edits when checkout is work/main. Use existing QA checkout or detached exact-base/API lane.                   | Repo + remote + current branch/upstream + signed Day 6 SHA + final QA/main SHAs. |
| Unsigned Day 6 baseline         | Day 7 starts from local latest rather than signed Day 6 Build Final.         | Load Day 6 status/evidence, capture signed SHA, then fetch and prove origin/qa equals it.                                 | Signed evidence SHA == remote QA == authoring base.                              |
| New release branch              | A Day7/release branch recreates branch-family drift.                         | No new remote ref. Existing QA -\> existing main only after final release gates.                                          | Remote heads before/after; no new branch.                                        |
| Remote-base race                | QA or main moves after tests but before push/cutover.                        | Re-fetch immediately before QA push/main publication and require expected remote SHA.                                     | Race-check output + expected-old -\> new SHA.                                    |
| Deployment path-filter drift    | Valid release-critical file does not trigger deploy.                         | Inspect workflow/path filters before editing; prove every runtime file is watched or deliberately reuse watched location. | Changed-file manifest -\> workflow run -\> deployed runtime marker.              |
| Premature main cutover          | QA candidate is published before Human E2E/release gates complete.           | main is read-only until final QA candidate is signed and all pre-prod gates pass.                                         | Pre-cutover main SHA; signed candidate; gate sign-off timestamps.                |
| Production-only fix             | Live defect is patched directly in production and diverges from QA evidence. | Fix on existing QA ref, rerun affected/full gates, then publish exact new candidate.                                      | QA defect -\> candidate -\> tests -\> main -\> production chain.                 |
| QA/PROD binding mix             | Production points to QA D1/Stripe/OpenAI/config or vice versa.               | Explicit environment manifest and binding identity checks before deployment; fail closed.                                 | Worker env, DB ID/binding, origin allowlist, Stripe mode, model config.          |
| Ad-hoc production SQL           | Production schema is changed outside tested migrations.                      | Apply only exact tested additive migration set. No console-only patch.                                                    | Migration hashes + pre/post schema manifest.                                     |
| Destructive rollback            | Rollback deletes 1.0 rows or requires schema downgrade.                      | Runtime rollback must tolerate additive 1.0 schema; preserve canonical history.                                           | Prior runtime reads/ignores additive schema; no destructive SQL.                 |
| Entitlement trust in URL/client | Paid path unlocks from query flag/local state.                               | Server verifies Stripe entitlement/payment and returns stored result idempotently.                                        | Controlled LIVE payment + duplicate return + one entitlement/result.             |
| Webhook replay/duplicate        | Retries create duplicate payment/entitlement/events.                         | Idempotency/domain uniqueness and replay-safe handler.                                                                    | Counts unchanged on replay.                                                      |
| AI secret/debug leakage         | Production logs expose key, prompt, or protected evidence.                   | Secrets only in Worker env; disable evidence/prompt debug; safe logging.                                                  | Source/network/log scan; no secret/protected payload.                            |
| Unsafe AI accepted              | Model content bypasses schema/evidence/policy validation.                    | Keep provider adapter + validator + accepted/rejected ledger + deterministic/stored fallback.                             | P0-06 + generation ledger + outage/fallback.                                     |
| Cross-record access             | User/role accesses another principal/BHR.                                    | Resolve server-side scope; deny safe 403/404; audit.                                                                      | P0-13 + no leak/no write.                                                        |
| Adapter becomes blocking        | HubSpot/GA4/Clarity outage blocks core care.                                 | Canonical D1 first; log adapter failure and continue.                                                                     | P0-14 completes core journey.                                                    |
| Manual PASS repair              | Ad hoc SQL/delete/session manipulation makes test pass.                      | Use migration/domain corrective commit only; manual_repair=NO for signed run.                                             | Evidence sheet + defect log.                                                     |
| Tag/runtime mismatch            | Release tag points to commit not actually deployed.                          | Record SHA/tag/deployment IDs/runtime marker together; verify equality before sign-off.                                   | tag -\> SHA -\> deploy -\> runtime chain.                                        |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>REMEDIATION RULE</strong></p>
<p>When a Day 7 test fails, Codex must identify the exact failing assertion, actor/authorization decision, principal/BHR scope, entitlement/payment row, AI generation/validator step, D1 statement, migration hash, deployment path/filter, environment binding, runtime version, or public-route layer before editing. Fix the smallest proven root cause. Rerun the failed test first, then its regression slice, then the complete release gate. Do not simultaneously rewrite UI + Worker + D1 + workflows unless evidence independently proves each layer is broken.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 3. Day 7 Entry Gate & Exact Day 6 Baseline Fingerprint

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>STOP UNLESS ALL ARE TRUE</strong></p>
<p>Day 7 is not authorized to compensate for an incomplete Day 6. The signed Day 6 Build Final must already prove the four-pillar GalviStudio operating loop, FDI/SPUR, VDM gates, Sprints, care-to-Studio handoff, outcome writeback/reassessment, Venture 001, GalviPro practice boundaries, inherited Day 3/4/5 regressions, D1 integrity, and rollback. The exact Day 6 final SHA is not stated in the attached source files; retrieve it from the executed Day 6 status/evidence and prove it against the remote QA ref.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Check**         | **Required starting state**                                                                   | **Codex evidence**                                                      |
|-------------------|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| Repository        | Authoritative mrgalvipro/galvitriage repository used by QA.                                   | repo root + origin URL.                                                 |
| QA ref            | Existing qa-revamped-galvicare-0-5 at exact signed Day 6 Build Final.                         | signed Day 6 SHA + remote QA SHA + authoring base.                      |
| Production ref    | Existing main captured as pre-cutover rollback reference; not authoring checkout.             | origin/main SHA + production deployed SHA/version.                      |
| Working tree      | Clean or explicitly explained pre-existing non-Day7 changes.                                  | git status --short.                                                     |
| QA runtime        | Existing QA frontend/Worker serving Day 6 final.                                              | health/capabilities + deployed SHA/version IDs.                         |
| QA D1             | Existing QA GalviVault binding/schema; no new DB.                                             | wrangler binding/database ID + schema/migration manifest.               |
| Day 3 AI          | Accepted/rejected/fallback path still proven; no browser OpenAI.                              | governed-AI regression + versions.                                      |
| Day 4 Chart       | Shot activation, return/resume, customer/clinician projections, history.                      | deployed regression evidence.                                           |
| Day 5 active care | Clinic, Treatment Plan, Rx/Audit/referral, Guide, monitoring/outcomes, payment/booking.       | signed Day 5 evidence inherited by Day 6.                               |
| Day 6 Studio/Pro  | Four pillars, SPUR, gates, Sprints, Studio outcome writeback, Venture 001, GalviPro protocol. | Day 6 H01-H30 + D1-1..18 + rollback evidence.                           |
| Rollback          | Known-good pre-Day7 production and Day 6 QA restore targets recorded.                         | frontend/Worker versions, public route, config snapshot, migration set. |
| Deploy trigger    | All possible Day 7 changed runtime paths are covered.                                         | workflow/path-filter inspection.                                        |

## 3.1 First Codex actions - no implementation yet

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>set -euo pipefail<br />
pwd<br />
git rev-parse --show-toplevel<br />
git remote -v<br />
ORIGIN_URL="$(git remote get-url origin)"<br />
case "$ORIGIN_URL" in<br />
*mrgalvipro/galvitriage* ) ;;<br />
* ) echo "STOP: unexpected repository remote: $ORIGIN_URL"; exit 41 ;;<br />
esac<br />
<br />
git fetch --prune origin qa-revamped-galvicare-0-5 main<br />
REMOTE_QA_SHA="$(git rev-parse origin/qa-revamped-galvicare-0-5)"<br />
REMOTE_MAIN_SHA="$(git rev-parse origin/main)"<br />
CURRENT_BRANCH="$(git branch --show-current || true)"<br />
printf 'current_branch=%s\nremote_qa=%s\nremote_main=%s\n' \<br />
"$CURRENT_BRANCH" "$REMOTE_QA_SHA" "$REMOTE_MAIN_SHA"<br />
git status --short --branch<br />
git branch -vv<br />
<br />
# Load this from the signed/executed Day 6 status/evidence package.<br />
SIGNED_DAY6_SHA="&lt;REQUIRED_FROM_DAY6_BUILD_FINAL_EVIDENCE&gt;"<br />
[ -n "$SIGNED_DAY6_SHA" ] &amp;&amp; [ "$SIGNED_DAY6_SHA" != "&lt;REQUIRED_FROM_DAY6_BUILD_FINAL_EVIDENCE&gt;" ] || {<br />
echo "STOP: exact signed Day 6 Build Final SHA not supplied/proven"; exit 42;<br />
}<br />
[ "$REMOTE_QA_SHA" = "$SIGNED_DAY6_SHA" ] || {<br />
echo "STOP: remote QA does not equal signed Day 6 Build Final"; exit 43;<br />
}<br />
<br />
if [ "$CURRENT_BRANCH" = "work" ] || [ "$CURRENT_BRANCH" = "main" ]; then<br />
echo "STOP: do not author Day 7 on '$CURRENT_BRANCH'. Use approved QA checkout or detached/API lane."<br />
exit 44<br />
fi</th>
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
<th><p><strong>DO NOT GUESS THE DAY 6 SHA</strong></p>
<p>The historical signed Day 5 Build Final SHA (43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c) is a Day 6 starting/rollback reference, not the Day 7 starting SHA. Day 7 must use the executed Day 6 Build Final SHA.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 4. Branch, Publication & Production Promotion Strategy - No Work Branch

## 4.1 Preferred lane - existing QA branch checkout

- Use only when the local repository can safely checkout the already-existing qa-revamped-galvicare-0-5 ref.

- Require HEAD = origin/qa-revamped-galvicare-0-5 = signed Day 6 Build Final before any release fix.

- Never branch from QA into work/Day7/release/hotfix.

- Before commit and push, rerun branch/upstream and remote-base guards.

- Push only HEAD:refs/heads/qa-revamped-galvicare-0-5 after a final remote-base race check.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>git switch qa-revamped-galvicare-0-5<br />
git merge --ff-only origin/qa-revamped-galvicare-0-5<br />
[ "$(git rev-parse HEAD)" = "$SIGNED_DAY6_SHA" ] || exit 45<br />
[ "$(git branch --show-current)" = "qa-revamped-galvicare-0-5" ] || exit 46<br />
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}')"<br />
[ "$UPSTREAM" = "origin/qa-revamped-galvicare-0-5" ] || exit 47</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 4.2 Fallback lane - Codex environment is pinned to work

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>ANTI-WORK-BRANCH FALLBACK</strong></p>
<p>If the Codex environment is forced to remain on work and cannot safely switch, DO NOT COMMIT OR PUSH work. Create a detached worktree from the exact signed Day 6 remote QA SHA, or use the previously proven GitHub blob/tree/commit API publication path. Update only the existing qa-revamped-galvicare-0-5 ref after re-verifying the remote base has not moved.</p></th>
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
<th>BASE_SHA="$SIGNED_DAY6_SHA"<br />
BUILD_DIR="/tmp/galvicare-day7-${BASE_SHA:0:8}"<br />
rm -rf "$BUILD_DIR"<br />
git worktree add --detach "$BUILD_DIR" "$BASE_SHA"<br />
cd "$BUILD_DIR"<br />
[ "$(git rev-parse HEAD)" = "$BASE_SHA" ] || exit 48<br />
# Implement only proven P0/P1/release fixes, test, then commit in detached worktree.<br />
# Before publication:<br />
git fetch origin qa-revamped-galvicare-0-5<br />
[ "$(git rev-parse origin/qa-revamped-galvicare-0-5)" = "$BASE_SHA" ] || {<br />
echo "STOP: QA ref moved during Day 7 work"; exit 49;<br />
}<br />
# Publish candidate only to existing QA ref through approved fast-forward/object-API path.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 4.3 Production promotion - existing QA -\> existing main only

- Do not author production fixes on main. main is a destination ref, not a Day 7 development branch.

- After the final QA candidate is signed, re-fetch origin and prove origin/main has not moved since the pre-cutover capture.

- Require origin/main to be an ancestor of the signed QA candidate. If history diverged, STOP; do not force push, rebase blindly, or synthesize a merge without explicit architecture/release decision.

- If branch protection permits direct fast-forward, update existing main to the exact signed candidate. If protection requires PR, open the PR from existing qa-revamped-galvicare-0-5 to existing main; do not create another branch.

- After merge/update, prove origin/main equals the intended release SHA before relying on a production deployment workflow.

- Production deployment is not complete until runtime marker/version and production behavior prove that exact SHA.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># Run only after all pre-production release gates are PASS.<br />
FINAL_QA_SHA="&lt;SIGNED_DAY7_QA_CANDIDATE_SHA&gt;"<br />
EXPECTED_MAIN_SHA="&lt;CAPTURED_PRE_CUTOVER_MAIN_SHA&gt;"<br />
git fetch --prune origin qa-revamped-galvicare-0-5 main<br />
[ "$(git rev-parse origin/qa-revamped-galvicare-0-5)" = "$FINAL_QA_SHA" ] || exit 60<br />
[ "$(git rev-parse origin/main)" = "$EXPECTED_MAIN_SHA" ] || {<br />
echo "STOP: main moved since cutover approval"; exit 61;<br />
}<br />
git merge-base --is-ancestor "$EXPECTED_MAIN_SHA" "$FINAL_QA_SHA" || {<br />
echo "STOP: main is not an ancestor of release candidate; no force/rebase"; exit 62;<br />
}<br />
# Then use the repository-approved direct fast-forward or PR from existing QA -&gt; existing main.<br />
# Re-fetch and require origin/main == FINAL_QA_SHA after publication.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. Feature Freeze & Allowed-File Manifest

Day 7 begins with a release freeze. Codex must inventory the repository and create an allowed-file manifest before changing code. Any file not tied to a failing Day 7 gate is out of scope.

| **Change class**                                  | **Allowed?**  | **Required evidence before edit**                                            |
|---------------------------------------------------|---------------|------------------------------------------------------------------------------|
| P0 security/data/cross-record/record-loss         | YES           | Failing test/probe + exact scope + root-cause layer.                         |
| P0 payment/entitlement/session integrity          | YES           | Stripe/D1/session evidence + failing assertion.                              |
| P0 unsafe AI / wrong clinical routing             | YES           | Generation/evidence/validator or deterministic routing proof.                |
| P1 broken release path/CTA/booking/Studio handoff | YES           | Exact Human E2E step + runtime evidence.                                     |
| Trust-breaking copy/regulatory boundary           | YES           | Specific customer-facing statement that violates approved boundary.          |
| Deployment/path-filter blocker                    | YES           | Changed file not covered or candidate not deploying.                         |
| Evidence/observability needed to prove release    | YES, minimal  | Missing release proof that cannot be obtained from existing instrumentation. |
| P2 copy/layout polish                             | NO by default | Defer unless it blocks trust/usability of a launch path.                     |
| P3 enhancement/new feature                        | NO            | Backlog only.                                                                |
| Workflow cleanup/refactor                         | NO            | Only if a proven deployment failure requires smallest correction.            |

REQUIRED CHANGE MANIFEST

\[ \] Current signed Day 6 base SHA.

\[ \] Failing release gate / test ID.

\[ \] Exact files proposed to change.

\[ \] Why each file is required to fix that failure.

\[ \] Whether each runtime file is covered by current deploy path filters.

\[ \] Focused test to rerun first.

\[ \] Inherited regression slices affected.

\[ \] Rollback impact (code/config/schema/data).

# 6. Repository, Workflow, D1 & Runtime Discovery Before Any Day 7 Delta

Do not assume filenames, Worker entry points, migration directories, frontend deploy roots, or workflow path filters. Discover the real Day 6 repository state first and reuse the proven path.

- Inventory package scripts and release test commands.

- Locate Worker/API router, authorization/entitlement services, AI provider/validator, Chart projection, Clinic/Treatment/monitoring, Studio services, analytics/event writer, and environment config.

- Inventory migrations in execution order and calculate hashes for the exact 1.0 additive set.

- Inspect wrangler config/bindings and QA/production environment sections without exposing secret values.

- Inspect GitHub Actions/Cloudflare deployment workflows and path filters for both QA and production.

- Identify frontend deployment source/root and current production/public route.

- Identify existing release evidence/output conventions and artifact paths.

- Identify current tests by day and map Day 7 release suite to inherited gates rather than duplicating logic.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th># Examples; adapt to actual repository layout after discovery.<br />
find . -maxdepth 3 -type f \( -name 'package.json' -o -name 'wrangler*.json*' -o -name '*.yml' -o -name '*.yaml' \) -print<br />
find . -maxdepth 4 -type f | grep -E '(migration|schema|worker|test|qa|deploy|studio|chart|clinic|engine|analytics)' | sort<br />
git log --oneline --decorate -n 40<br />
# Record sha256 hashes for the migration files actually used by the signed candidate.</th>
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
<th><p><strong>DO NOT INVENT A NEW DEPLOYMENT PATH</strong></p>
<p>Use the same QA and production deployment mechanisms already proven by the repository. A CI outage, Wrangler authorization problem, or path-filter defect is not permission to create a new Worker, D1 database, repository, branch, or production origin.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 7. Release Candidate Version Manifest & Tagging

Before final Human E2E, freeze and record the release candidate identity. The authoritative guide recommends the following 1.0 manifest; Codex must reconcile these values with the implemented Day 6 runtime and record the exact effective versions.

| **Version key**          | **Recommended 1.0 value**         | **Day 7 requirement**                               |
|--------------------------|-----------------------------------|-----------------------------------------------------|
| schema_version           | gc_1_0_20260824                   | Record effective production-target schema contract. |
| clinical_rules_version   | galviengine_1_0_clinical_v1       | Trace clinical/routing behavior.                    |
| score_version            | galviscore_1_0_v1                 | Trace GalviScore calculations.                      |
| acuity_version           | galvitriage_acuity_1_0_v1         | Trace acuity/red-flag routing.                      |
| protocol_version         | universal_business_health_v1      | Universal core protocol.                            |
| athlete_protocol_version | athlete_career_ownership_v1       | First specialty overlay.                            |
| ai_prompt_version        | galviengine_evidence_reasoning_v1 | Trace customer-facing AI proposals.                 |
| ai_output_schema_version | galviengine_ai_schema_v1          | Trace AI validation contract.                       |
| chart_projection_version | galvichart_1_0_v1                 | Trace authorized Chart projection.                  |
| treatment_plan_version   | galviclinic_treatment_1_0_v1      | Trace active-care Treatment Plan.                   |
| studio_vdm_version       | galvistudio_vdm_1_0_v1            | Trace Studio engagement/gate/outcome logic.         |

- Record final QA commit SHA, tag name, commit timestamp, deployment run IDs, frontend deployment ID, Worker version/deployment ID, D1 schema/migration hashes, model config name (not secret), and all manifest versions.

- Use repository existing tag convention. If none exists, use a release-candidate tag that embeds 1.0 + date + short SHA; do not create a branch to represent the tag.

- Do not retag a different commit after Human E2E. A code change creates a new candidate and invalidates prior release evidence until retested.

- Final production sign-off must reference the exact same release SHA/tag that is deployed.

# 8. Commercial Architecture Lock

Day 7 does not redesign monetization. It locks the approved 1.0 commercial contracts so the customer experiences one care system rather than unrelated upsells.

| **Commercial object**           | **1.0 launch rule**                                                                                                                                                                    | **Day 7 validation**                                                                                                 |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| GalviChart                      | Record/retention substrate; Explorer access begins after verified GalviShot; customer history is not held hostage.                                                                     | Pre-Shot locked; verified Shot activates; later Sight/Path/Clinic/monitoring enrich same Chart; return/resume works. |
| Business Health Membership beta | Ongoing care: check-ins, monitoring, care-plan management, periodic summaries, navigation, preferred care access. Start simple with one core Member tier; optional higher-touch pilot. | Membership start/cancel state, monitoring/check-in path, next reassessment, entitlement/record continuity.           |
| GalviLeague                     | Not a public 1.0 launch dependency; remains future/1.5.                                                                                                                                | No release gate or CTA requires it.                                                                                  |
| Paid diagnostics                | Existing/approved Score/Shot/Sight/Path pricing and Stripe entitlement logic remain server-verified.                                                                                   | TEST QA + controlled LIVE production; refresh/replay safe; stored result persists.                                   |
| GalviClinic                     | Paid active-care encounter; booking/payment linked to source session/BHR.                                                                                                              | Source context survives booking/payment/return; no duplicate booking/entitlement record.                             |
| Studio programs/Sprints         | Can be sold directly or prescribed through care; order/engagement identifies entry gate, deliverable and outcome.                                                                      | Direct/prescribed path does not create shadow record; same principal/BHR lineage.                                    |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>COMMERCIAL NO-GO</strong></p>
<p>Any payment/session integrity failure, incorrect paid unlock, lost paid result, duplicate entitlement, cross-record linkage, or pricing/config mismatch on an intended launch path is P0 and blocks that path.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 9. Payment, Entitlement, Booking & Membership Release Checks

## 9.1 QA payment/booking lock

- Confirm QA uses Stripe TEST mode and approved QA links/Checkout metadata; no LIVE secret in QA.

- Verify entitlement only after server-side payment/checkout/webhook verification according to the existing contract.

- Verify duplicate return, webhook retry, page refresh, browser back, and repeat retrieval do not create duplicate payment/entitlement/result rows.

- Verify already-authorized clinical results remain available if Stripe/Calendly/HubSpot is unavailable after purchase.

- Verify GalviClinic booking preserves principal/session/BHR/source-plan context and a customer cannot swap IDs to book/access another record.

- Verify Membership beta creates/updates membership state once and ties monitoring to the canonical record.

## 9.2 Production payment controls

- Do not configure LIVE payment secrets until the final signed candidate and production environment manifest are approved.

- Keep existing live products/links available as rollback assets until the new path is proven.

- Perform exactly one controlled paid Shot -\> Chart transaction before public CTA switch; use an approved operational test identity/order method.

- Verify D1 entitlement/payment row, resulting stored deliverable, audit/journey events, Chart activation, and duplicate-return behavior.

- If entitlement mismatches, disable the affected paid unlock path, preserve authorized record access, reconcile Stripe and D1, and return to QA for corrective candidate.

# 10. Canonical Analytics & Growth Events

D1 journey events are the canonical event record. GA4, Clarity, and HubSpot are non-blocking adapters. No sensitive prompt/evidence payload, protected clinician note, secret, or raw regulated detail may be emitted to external analytics.

| **Event**                                                                    | **When it fires / why**                                              |
|------------------------------------------------------------------------------|----------------------------------------------------------------------|
| galvicare_started                                                            | Care front door entered.                                             |
| triage_started / triage_submitted                                            | Intake begins/completes.                                             |
| protocol_assigned                                                            | Lifecycle/protocol route established.                                |
| acuity_calculated / disposition_assigned                                     | Clinical routing evidence.                                           |
| diagnostic_viewed                                                            | Vitals/Score/Shot/Sight/Path render.                                 |
| chart_activated / chart_viewed / chart_updated                               | GalviShot activation and progressive retention.                      |
| ai_generation_requested / accepted / rejected                                | Governed AI performance/quality; never log sensitive prompt payload. |
| clinic_booking_clicked / clinic_completed                                    | Active-care conversion.                                              |
| treatment_plan_created / acknowledged                                        | Care decision and adherence.                                         |
| studio_prescribed / studio_started / studio_gate_decision / studio_completed | Venture Development handoff/outcomes.                                |
| referral_created / referral_closed                                           | External specialty loop.                                             |
| checkin_submitted / outcome_recorded                                         | Continuous care evidence.                                            |
| membership_started / membership_canceled                                     | Recurring care economics.                                            |
| journey_error / recovery_success                                             | Reliability/recovery.                                                |

## 10.1 Analytics acceptance rules

- Canonical D1 event is written idempotently/appropriately even if GA4/Clarity/HubSpot adapter fails.

- Events carry environment, correlation/session, principal/BHR scope where appropriate, event code, timestamp, and safe version metadata; avoid protected free text.

- Refresh/replay does not inflate material conversion events when domain semantics require uniqueness.

- Adapter failure is logged with safe error_code and does not block care, payment result retrieval, Chart access, or Treatment Plan access.

- Production event stream can distinguish environment and release version.

# 11. Security, Accessibility & Trust Review

\[ \] No D1, Stripe, HubSpot, OpenAI, clinician-auth, or other secret appears in HTML, client JavaScript, public logs, screenshots, static bundles, network payloads, or error messages.

\[ \] All privileged actions use server-side authentication + authorization; role/entity scope is verified for every record request.

\[ \] Explicit consent is visible and versioned; withdrawal/change is traceable; sponsor/payer metadata never grants access to protected participant-level records.

\[ \] Input/action allowlists, payload size limits, parameterized D1 statements, safe file ingestion, safe error messages, and minimal logging are enforced.

\[ \] Cross-record principal/BHR/engagement/gate/treatment access attempts fail 403/404-safe with no information leak or partial write.

\[ \] Customer, clinician, GalviClinician/GalviGuide, and Studio projections expose only authorized fields.

\[ \] AI evidence bundles are scoped to one authorized record/task; rejected/raw proposals are not projected as canonical truth.

\[ \] CORS is environment-specific and production allows only approved production origins.

\[ \] Form fields have labels; keyboard order is logical; focus is visible; status/error updates are accessible; color is not the sole severity indicator; headings are hierarchical.

\[ \] Customer-facing language distinguishes Business Healthcare guidance from legal/medical/financial/tax/investment advice and distinguishes hypotheses from confirmed findings.

\[ \] Production debug flags, fixture/test overrides, broad dev origins, and verbose prompt/evidence logging are disabled.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>SECURITY NO-GO</strong></p>
<p>Wrong-record/cross-record exposure, secret exposure, client-side authorization, unbounded privileged action, production debug leakage, unsafe AI projection, or consent bypass is an automatic NO-GO for the affected path.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 12. Day 7 Automated Release Test Matrix

Codex should implement/assemble the Day 7 release gate from existing inherited tests wherever possible. Do not rewrite already-proven Day 1-6 coverage merely to rename it. Mandatory tests may not be skipped in the signed run.

| **ID** | **Area**         | **Required assertion**                                                                          |
|--------|------------------|-------------------------------------------------------------------------------------------------|
| T01    | Baseline         | Signed Day 6 SHA equals origin/qa and authoring base.                                           |
| T02    | Branch safety    | Current authoring lane is QA or detached exact-base; never work/main.                           |
| T03    | Branch safety    | Remote heads inventory proves no new Day7/release/work branch.                                  |
| T04    | Freeze           | Diff contains only documented P0/P1/release-critical files.                                     |
| T05    | Deploy coverage  | Every changed runtime path is covered by QA deploy trigger/path filters.                        |
| T06    | Versioning       | Candidate SHA/tag/version manifest is internally consistent.                                    |
| T07    | Inherited        | Full Day 1-6 automated regression passes; mandatory skipped=0.                                  |
| T08    | Canonical record | Founder replay resolves one principal/venture/BHR/Chart.                                        |
| T09    | Pre-Founder      | Principal-only path keeps BHR/venture null until real venture exists.                           |
| T10    | Consent          | Required consent blocks protected workflow when absent and versions changes.                    |
| T11    | Acuity           | Acuity/health distinction and red-flag overrides remain correct.                                |
| T12    | Confidence       | Low confidence requests targeted evidence; no fabricated certainty.                             |
| T13    | AI               | Accepted AI proposal references valid same-record evidence and versions.                        |
| T14    | AI               | Invalid/cross-record/unsupported proposal is rejected or needs_review.                          |
| T15    | AI               | Provider timeout/outage returns deterministic/stored safe fallback.                             |
| T16    | Chart            | Pre-Shot locked; verified Shot activates Chart.                                                 |
| T17    | Chart            | Sight/Path/Clinic/monitoring enrich same Chart identity.                                        |
| T18    | Projection       | Customer cannot see protected clinician/internal gate fields.                                   |
| T19    | Clinic           | Business Physician projection can create governed Treatment Plan from same Chart.               |
| T20    | Rx/Audit         | GalviRx and GalviAudit/Lab remain linked to plan/action/case.                                   |
| T21    | Referral         | Regulated/red-flag matter routes externally; no prohibited advice.                              |
| T22    | Guide            | GalviGuide/GalviClinician cannot authorize high-stakes treatment/stage/capital action.          |
| T23    | Monitoring       | Outcome/check-in appends to plan/timeline and triggers reassessment.                            |
| T24    | Studio           | Care prescription creates one linked Studio engagement on same context.                         |
| T25    | Studio           | ADVANCE denied/HOLD when required evidence is insufficient.                                     |
| T26    | Studio           | REWORK/STOP append history; no silent overwrite or forced venture/capital.                      |
| T27    | Studio           | Approved outcome writes back to Vault/Chart and creates explicit reassessment.                  |
| T28    | Venture 001      | Four-pillar proof uses evidence refs; unsupported claims remain unvalidated.                    |
| T29    | Entitlement      | QA Stripe TEST verifies paid unlock server-side.                                                |
| T30    | Entitlement      | Duplicate payment/return/webhook replay does not duplicate entitlement/result.                  |
| T31    | Booking          | Clinic booking preserves session/principal/BHR source context.                                  |
| T32    | Membership       | Membership start/cancel is idempotent and scoped to canonical record.                           |
| T33    | Membership       | Member check-in updates monitoring/outcome/next reassessment.                                   |
| T34    | Analytics        | Required D1 canonical event codes fire on representative journey.                               |
| T35    | Analytics        | No sensitive AI prompt/protected payload is sent to analytics adapters.                         |
| T36    | Adapters         | HubSpot/GA4/Clarity failure is logged/non-blocking.                                             |
| T37    | Auth             | Customer cannot call clinician-only/Studio-only privileged action.                              |
| T38    | Auth             | Cross-record principal/BHR read/write denied safely and audited.                                |
| T39    | Auth             | Sponsor/payer metadata does not grant protected participant access.                             |
| T40    | Input            | Action allowlist rejects unknown/privileged action misuse.                                      |
| T41    | Input            | Oversized/malformed payload fails safely; no stack/secret leak.                                 |
| T42    | SQL              | Parameterized D1 paths resist injection payloads.                                               |
| T43    | Secrets          | Static source/build/log scan finds no production/QA secret values.                              |
| T44    | CORS             | QA/PROD approved origins are environment-correct; broad dev origin absent in PROD manifest.     |
| T45    | Accessibility    | Labels, keyboard order, status/error semantics, headings, non-color severity pass checklist.    |
| T46    | Recovery         | Authenticated refresh/return resumes canonical record.                                          |
| T47    | Recovery         | Incognito/new user does not inherit another user/session state.                                 |
| T48    | Read purity      | GET/read/re-render does not regenerate AI or create material writes.                            |
| T49    | Idempotency      | Replay counts unchanged for score/AI/Chart/plan/Studio/payment critical objects.                |
| T50    | Migration        | Exact 1.0 migration set is additive and hashes recorded.                                        |
| T51    | Rollback         | Prior runtime can operate/read safely with additive 1.0 schema.                                 |
| T52    | Rollback         | Day 6 candidate restore after rollback reads same canonical data.                               |
| T53    | Prod manifest    | Production DB/Worker/origins/Stripe/OpenAI config identities are explicit and distinct from QA. |
| T54    | Prod plan        | Pre-cutover main SHA + production runtime + public route + rollback assets captured.            |
| T55    | Release gates    | GalviCare release gate all required checks mapped to evidence.                                  |
| T56    | Release gates    | GalviStudio release gate all required checks mapped to evidence.                                |
| T57    | Release gates    | GalviPro release gate all required checks mapped to evidence.                                   |
| T58    | Human E2E        | P0-01..P0-16 run sheet prepared with deterministic evidence locations.                          |
| T59    | Evidence         | 14-part evidence package has required manifests/paths and no secret leakage.                    |
| T60    | Decision         | Pre-production GO is impossible unless all mandatory release gates are green.                   |

# 13. D1 / Canonical Record Integrity Gate

| **ID** | **Integrity assertion**                                                                                                              |
|--------|--------------------------------------------------------------------------------------------------------------------------------------|
| D1-1   | No duplicate principal/venture/BHR/Chart identity for signed Founder journey.                                                        |
| D1-2   | Pre-Founder principal-only path has no fabricated venture/BHR.                                                                       |
| D1-3   | Consent ledger contains current policy/version/status and traceable changes for protected flows.                                     |
| D1-4   | Every accepted evidence/finding/AI result is scoped to same authorized principal/BHR and source lineage.                             |
| D1-5   | Accepted/rejected AI generations contain model/prompt/schema/evidence/validation metadata; rejected proposal not customer-projected. |
| D1-6   | Chart activation entitlement traces to verified Shot payment/entitlement where required.                                             |
| D1-7   | Paid replay does not create duplicate payment, entitlement, paid diagnostic, or Chart activation.                                    |
| D1-8   | Clinic booking/encounter/Treatment Plan reference the same canonical session/principal/BHR context.                                  |
| D1-9   | GalviRx/Audit/referral rows reference valid plan/action/case and retain history.                                                     |
| D1-10  | Monitoring/check-in/outcome rows reference active plan/action and append rather than overwrite history.                              |
| D1-11  | Studio engagement references valid principal/BHR when applicable and valid source plan/action for prescribed care.                   |
| D1-12  | Studio gate history is append/versioned; ADVANCE/HOLD/REWORK/STOP actor/evidence/time preserved.                                     |
| D1-13  | Studio outcome references engagement/gate/source action and creates explicit reassessment event.                                     |
| D1-14  | Current Chart projection version/fingerprint advances after governed care/Studio event without new Chart identity.                   |
| D1-15  | Membership state is scoped to one principal/context; start/cancel replay is safe.                                                    |
| D1-16  | Required journey/clinical/commercial event codes exist with safe environment/release metadata.                                       |
| D1-17  | No protected raw AI prompt, clinician note, secret, or inappropriate free text appears in external-adapter event payloads.           |
| D1-18  | Unauthorized/cross-record attempts create expected audit evidence without leaking target data.                                       |
| D1-19  | Exact migration file set and hashes match QA-tested release manifest; no ad hoc schema delta.                                        |
| D1-20  | Additive schema remains compatible with prior runtime rollback; no destructive recovery dependency.                                  |
| D1-21  | Production pre/post migration schema manifests reconcile to expected additive diff only.                                             |
| D1-22  | manual_repair=NO for the signed QA/production release proof; no hidden delete/backfill was used to pass.                             |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>D1 FAIL-CLOSED RULE</strong></p>
<p>If record integrity is uncertain, stop writes on the affected path and do not continue production cutover. Capture the failing row/constraint/query/migration/binding first. Never “repair” the release with destructive SQL or a new database.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 14. Golden Case Library Required at Release

| **Case**                                           | **Purpose**                                                                               | **Required Day 7 evidence**                                          |
|----------------------------------------------------|-------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| A - Founder/SMB revenue/customer evidence gap      | Evidence weighting, contradiction, governed Shot/Sight/Path and GTM route.                | Rendered outputs + evidence IDs + AI/rules lineage + next route.     |
| B - Founder capacity strain                        | Leadership/readiness, acuity, Founder Development recommendation and active/passive care. | Score/acuity distinction + Path/Studio recommendation.               |
| C - Product readiness gap                          | Product Sprint route and Studio handoff.                                                  | Treatment/Studio order -\> engagement -\> gate -\> outcome.          |
| D - Broad early-stage weakness + low confidence    | Adaptive evidence request and refusal to invent certainty.                                | Follow-ups + needs_evidence/human_review + no unsupported finality.  |
| E - Strong venture with distribution bottleneck    | Positive framing and root-cause hypothesis without PMF overdiagnosis.                     | Supporting/contradictory evidence + hypothesis language.             |
| F - Pre-Founder athlete/professional               | Principal-only record, Founder Readiness subtype, SPUR pathway and no fabricated venture. | principal_id with null venture/BHR until venture creation.           |
| G - Regulated/red-flag issue                       | Acuity override, referral, safe AI boundary.                                              | referral_required + no autonomous regulated advice.                  |
| H - Payment / Chart activation recovery            | Verified entitlement, Chart unlock, duplicate replay.                                     | one payment/entitlement/result + same Chart after return.            |
| I - Active treatment -\> Studio Sprint -\> outcome | Full IDN/Venture Development closed loop.                                                 | Clinic/plan -\> Studio -\> outcome -\> Vault/Chart -\> reassessment. |

# 15. P0 Human E2E Release Matrix - P0-01 through P0-16

| **ID** | **Scenario**                                 | **Pass criteria**                                                                                                                                    | **Evidence to capture**                                                      |
|--------|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| P0-01  | New Founder/SMB high-confidence full journey | Triage -\> Vitals -\> Score -\> Shot -\> Chart -\> Sight -\> Path -\> Clinic -\> Treatment Plan; no duplicate record; correct evidence/entitlements. | session/principal/BHR/Chart/result/plan IDs + screenshots + D1/audit.        |
| P0-02  | Pre-Founder / athlete specialty protocol     | Principal-only record; Founder Readiness subtype; SPUR/FDI route; venture BHR only when/if real venture created.                                     | principal_id + null BHR before venture + protocol/version + SPUR route.      |
| P0-03  | Low-confidence path                          | Targeted follow-ups/evidence request; no fabricated certainty; human_review/audit if threshold remains low.                                          | question/evidence IDs + confidence before/after + audit.                     |
| P0-04  | Acuity vs health distinction                 | Healthy urgent and unhealthy non-urgent cases route correctly.                                                                                       | acuity, score, disposition, rules versions.                                  |
| P0-05  | Red-flag / regulated referral                | Referral required; no unauthorized regulated advice; consent/handoff recorded.                                                                       | route/referral/audit + customer-safe language.                               |
| P0-06  | OpenAI governed reasoning                    | AI proposal references valid evidence; validator accepts/rejects correctly; generation ledger complete; provider failure fallback works.             | generation IDs, evidence refs, versions, accepted/rejected/fallback outputs. |
| P0-07  | GalviChart activation/progression            | Locked pre-Shot; activated after verified Shot; Sight/Path/Clinic/monitoring enrich same Chart.                                                      | entitlement + chart identity/version timeline.                               |
| P0-08  | Clinician projection                         | Business Physician sees authorized context; founder cannot see protected notes; same core Chart language.                                            | role views + protected-field negative.                                       |
| P0-09  | Treatment -\> Studio Sprint                  | Clinic prescribes Sprint; Studio engagement/stage gate/outcome writes back to GalviVault/Chart timeline.                                             | plan/action/engagement/gate/outcome/reassessment IDs.                        |
| P0-10  | GalviAudit / Lab                             | Ordered diagnostic produces evidence/result linked to same case.                                                                                     | order/result/evidence IDs + Chart/plan linkage.                              |
| P0-11  | Stripe paid journey / duplicate return       | Server verifies entitlement; replay yields one payment and correct stored result.                                                                    | Stripe ref + D1 entitlement/result counts + return screenshots.              |
| P0-12  | Membership monitoring                        | Member check-in updates plan/outcome/timeline and next reassessment without mobile dependency.                                                       | membership/checkin/outcome/reassessment IDs.                                 |
| P0-13  | Unauthorized/cross-record attempt            | Denied and audit logged; no record leakage.                                                                                                          | 403/404-safe response + audit + unchanged target counts.                     |
| P0-14  | HubSpot/GA4/Clarity failure                  | Core care journey completes; failure logged/non-blocking.                                                                                            | adapter error + successful canonical care state.                             |
| P0-15  | Refresh/incognito/recovery                   | Same authenticated user resumes canonical record; new incognito user starts independently; no stale cross-user state.                                | return/resume + new-user separation evidence.                                |
| P0-16  | Rollback rehearsal                           | Known-good prior deployment can be restored; no destructive migration prevents recovery.                                                             | rollback/restore deployment IDs, smoke, D1 compatibility, no manual repair.  |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>HUMAN E2E RULE</strong></p>
<p>Run P0-01..P0-16 against the exact deployed final QA candidate after feature freeze. If any code/config/migration changes afterward, the candidate changes and all impacted Human E2E/release evidence must be rerun. manual_repair must remain NO.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16. Formal 1.0 Release Gates

## 16.1 GalviCare 1.0 Release Gate

\[ \] Universal clinical model + Core/Protocol/Payer architecture operational.

\[ \] Acuity/routing + Clinical Confidence + red-flag overrides operational.

\[ \] Pre-Founder/Founder Readiness pathway operational.

\[ \] Vitals/Score/Shot/Sight/Path 1.0 evidence and progressive intelligence contract operational.

\[ \] GalviEngine 1.0 governed AI operational with evidence lineage, versioning, rejection/fallback and human review.

\[ \] GalviChart activation/progressive enrichment operational.

\[ \] GalviVault 1.0 longitudinal care foundation operational.

\[ \] GalviClinic + Treatment Plan + embedded GalviRx + monitoring/outcome loop operational.

\[ \] GalviAudit/GalviLab and minimum referral network operational.

\[ \] GalviGuide bounded navigator operational.

\[ \] Customer authentication, consent, basic RBAC, protected projections, audit history, safe ingestion, QA/PROD separation operational.

\[ \] Outcome capture, payments, booking, Membership beta, CRM/analytics and recovery operational.

## 16.2 GalviStudio 1.0 Release Gate

\[ \] GalviStudio publicly/operationally defined as Venture Development & Innovation Management Studio.

\[ \] Four-pillar operating model complete and packaged into market-ready offers.

\[ \] Founder Development Institute established as institution inside GalviStudio.

\[ \] SPUR Dreamer / Founder / Operator-Steward and six-stage curriculum productized.

\[ \] Pre-Founder GalviCare -\> GalviStudio handoff operational.

\[ \] Venture Development stage gates operational with ADVANCE/HOLD/REWORK/STOP.

\[ \] Initial Treatment/Readiness Sprint library operational.

\[ \] Protect Optionality First / evidence-gated capital policy documented.

\[ \] GalviCare Venture 001 flagship proof case documented with evidence.

\[ \] External specialist/referral boundaries operational.

\[ \] Core Studio KPI/scorecard defined.

## 16.3 GalviPro 1.0 Release Gate

\[ \] Business Physician methodology/scope and regulated boundaries published internally/operationally.

\[ \] Business Physician vs GalviClinician/GalviGuide responsibilities defined.

\[ \] Standard GalviClinic encounter protocol operational from the same GalviChart context.

\[ \] Treatment Plan schema/protocol standardized and stored in GalviVault.

\[ \] Passive/active/specialty/referral escalation rules standardized.

\[ \] GalviGage requires treatment order, fixed scope, expected evidence and outcome.

\[ \] Business Physician findings/treatment decisions are actor/version/audit traceable.

\[ \] Follow-up/outcome capture mandatory for active treatment.

\[ \] Scheduling/payment/service expectations commercially usable.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>FORMAL RELEASE DECISION</strong></p>
<p>Release an affected 1.0 path only when all relevant GalviCare, GalviStudio, and GalviPro gates pass. A noncritical external adapter may launch with a documented fallback. Payment/session integrity, record correctness, authorization, AI governance, treatment integrity, or rollback failure is an automatic NO-GO for the affected path.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 17. Pre-Production GO Gate

Production cutover is prohibited until the following evidence exists for one immutable final QA candidate.

\[ \] Signed Day 6 baseline proven; no new branch; final Day 7 QA candidate SHA recorded.

\[ \] Feature freeze manifest shows only release-critical changes.

\[ \] Focused tests + full inherited Day 1-6 regression + Day 7 T01-T60 PASS, mandatory skipped=0.

\[ \] D1-1..D1-22 integrity assertions PASS, manual_repair=NO.

\[ \] P0-01..P0-16 Human E2E PASS against exact deployed candidate.

\[ \] Security/accessibility/trust checklist PASS.

\[ \] Commercial entitlement/Membership/Clinic/Studio contract PASS in QA.

\[ \] All three formal 1.0 release gates PASS for intended launch paths.

\[ \] Exact production migration set and hashes identified; additive rollback compatibility proven.

\[ \] Production environment manifest completed: DB, Worker name, origins, Stripe mode, OpenAI model config, frontend/public route.

\[ \] Pre-cutover origin/main SHA, current production frontend/Worker deployment/version, production D1 schema, and public CTA/embed route captured.

\[ \] Rollback package complete and pre-production rollback rehearsal PASS.

\[ \] Release evidence folders 01-13 are complete enough to support cutover; 14_release waits for production proof.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PRE-PRODUCTION STOP</strong></p>
<p>Do not use production cutover as a test environment or as a way to discover whether a Day 6/Day 7 feature works. If the exact QA candidate has not passed every applicable release gate, the only valid action is STOP / REMEDIATE IN QA / RETEST.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 18. Production Environment Manifest & Pre-Cutover Capture

| **Asset**           | **Capture before cutover**                                                              | **Release check**                                                        |
|---------------------|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| origin/main         | Exact SHA and ancestry vs final QA candidate.                                           | main unchanged since approval; candidate can be published without force. |
| Production frontend | Current deployment/version/URL and public Carrd/CTA/embed route.                        | Rollback URL/route available.                                            |
| Production Worker   | Current deployment/version, Worker name, environment marker.                            | Rollback version identified.                                             |
| Production D1       | Database/binding ID, current schema/migration manifest.                                 | Correct production DB; no QA binding.                                    |
| OpenAI              | Secret presence + environment-configured production model name; no value disclosed.     | Server-side only; debug off; disable/fallback mechanism known.           |
| Stripe              | LIVE mode config, webhook endpoint/config identity, approved product/link/metadata map. | Server verification; old live path retained for rollback until proven.   |
| CORS/auth           | Approved production origins and role matrix.                                            | No QA/dev origin or fixture auth bypass.                                 |
| Storefront          | Current public route and new candidate route.                                           | Candidate can be tested before route switch.                             |
| Operations          | Clinic/referral/Studio fallback procedures and contacts/process.                        | First customers can be served without reconstructing records.            |

# 19. Production Cutover - Exact Step-by-Step Sequence

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CONTROLLED CUTOVER ONLY</strong></p>
<p>Execute in order. Stop immediately on any P0/P1, wrong environment/binding, record-integrity, authorization, payment, AI-governance, or rollback defect. Do not continue downstream steps to “see if the rest works.”</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

1.  Freeze the final QA candidate. Record SHA/tag/version manifest and archive final QA evidence.

2.  Re-fetch QA/main. Re-prove final QA SHA and expected pre-cutover main SHA. Prove main is an ancestor of candidate; no race/divergence.

3.  Publish the exact signed candidate from existing QA to existing main through the repository-approved direct fast-forward or PR from existing QA -\> existing main. Create no new branch.

4.  Fetch origin and require origin/main == signed release SHA. Record publication/merge evidence.

5.  Verify production D1 binding and current canonical schema. Apply only the exact tested additive 1.0 migration set in the tested order. Record migration hashes/results and post-migration schema manifest. No production-only SQL.

6.  Deploy production Worker using the exact signed code. Set ENVIRONMENT=production, disable fixture/test overrides, bind production D1 and production secrets. Record Worker deployment/version and runtime marker.

7.  Configure/verify OPENAI_API_KEY and OPENAI_MODEL_PROD as Worker secret/config only. Confirm prompt/evidence debug logging is off and deterministic/stored fallback is available.

8.  Configure/verify Stripe LIVE secrets/webhook and approved production payment links/Checkout metadata. Confirm server-side entitlement verification and rollback/disable path.

9.  Confirm production CORS origins, customer/clinician authentication, role/entity scope matrix, and consent policy/version behavior.

10. Deploy production candidate frontend/app to a testable production URL/path before replacing the public Carrd/primary CTA route. Verify it reports/behaves as the signed release candidate.

11. Run no-payment production smoke through Triage -\> Vitals. Verify principal/session/evidence/events/audit and correct production D1.

12. Run one controlled paid production transaction through Shot -\> Chart. Verify Stripe LIVE payment, one entitlement, one stored result, Chart activation, refresh/replay safety, D1/audit/events.

13. Run one governed production AI generation. Verify evidence lineage, validation status, model/prompt/schema versions, customer-safe projection, and no sensitive debug leakage.

14. Run one controlled GalviClinic booking and one non-regulated referral or Studio prescription test if operationally feasible. Verify source session/BHR/plan lineage.

15. Execute production role/cross-record negative probe using safe test records/accounts; verify denial/audit and no leak.

16. Check production observability for API, record integrity, AI, care progression, commercial, security, and adapter errors.

17. Only after steps 1-16 PASS, switch the public Carrd/primary CTA/embed to the production candidate. Record previous and new route values.

18. Run public-route smoke from a clean browser. Verify no stale QA URL/config, no mixed environment, and correct production journey.

19. Complete 14_release evidence and final owner sign-offs. Declare PASS only if rollback remains ready.

# 20. Controlled Production Smoke Matrix

| **ID**  | **Scenario**        | **PASS evidence**                                                                                    |
|---------|---------------------|------------------------------------------------------------------------------------------------------|
| PROD-01 | Runtime identity    | Production frontend/Worker runtime markers equal signed release SHA/version.                         |
| PROD-02 | Environment         | D1/Stripe/OpenAI/CORS/auth are production-specific; no QA/test override.                             |
| PROD-03 | No-payment path     | Fresh Triage -\> Vitals succeeds; correct record/event/audit in production D1.                       |
| PROD-04 | Paid Shot -\> Chart | One controlled LIVE transaction verifies entitlement and activates same Chart.                       |
| PROD-05 | Paid replay         | Refresh/return/webhook replay does not duplicate payment/entitlement/result/Chart.                   |
| PROD-06 | Governed AI         | One accepted bounded generation has evidence lineage/versions; safe fallback is still available.     |
| PROD-07 | Clinic booking      | Controlled booking preserves source session/principal/BHR and no duplicate context.                  |
| PROD-08 | Studio/referral     | One non-regulated Studio prescription or referral preserves same record/plan lineage.                |
| PROD-09 | Authorization       | Safe negative cross-record/role probe denied and audited.                                            |
| PROD-10 | Analytics           | Canonical D1 events present; external adapters non-blocking; no sensitive payload leakage.           |
| PROD-11 | Public route        | Carrd/primary CTA points to production candidate only after prior checks; clean-browser smoke works. |
| PROD-12 | Rollback readiness  | Previous frontend/Worker/public route and disable/fallback assets still immediately available.       |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>CONTROLLED PAID TEST IS A RELEASE GATE</strong></p>
<p>The authoritative Day 7 contract requires a controlled production transaction. Do not infer LIVE payment correctness from QA TEST mode. Conversely, do not expose general traffic until the controlled LIVE transaction has passed.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 21. Rollback Package & Rehearsal

| **Asset**        | **Required rollback contents**                                                                                                                 |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Frontend         | Last known-good pre-1.0/previous production commit or deployment + prior public route value.                                                   |
| Worker           | Last known-good production deployment/version + wrangler/config snapshot excluding secret values.                                              |
| Database         | All tested migration files/hashes; backup/export/recovery procedure; additive compatibility; no destructive migration dependency.              |
| OpenAI           | Feature/provider disable switch; deterministic/stored fallback remains deployable.                                                             |
| Stripe           | Existing live products/links retained until new flow proven; ability to disable affected entitlement path without deleting authorized records. |
| Carrd/storefront | Previous embed/CTA URL/value and exact switch-back procedure.                                                                                  |
| Operations       | Manual Clinic/referral/Studio scheduling fallback and ability to use stored/printed records if an adapter fails.                               |

## 21.1 Mandatory pre-production rollback rehearsal

- Restore prior known-good runtime/deployment in QA or the approved safe rehearsal lane; do not destroy additive Day 6/7 data.

- Verify Triage/Vitals and representative stored Chart/Clinic/Studio data remain readable/usable according to prior-runtime compatibility expectations.

- Restore the final Day 7 candidate and prove the same canonical data remains present.

- Record deployment IDs/SHAs, schema state, smoke evidence, duration, and manual_repair=NO.

## 21.2 Production rollback triggers

- Wrong-record/cross-record exposure or authorization leak.

- Payment entitlement mismatch or paid result loss.

- Canonical record corruption, duplicate identity, or migration uncertainty.

- Unsafe AI projection or inability to fall back safely.

- Treatment/referral integrity failure on a launched path.

- Production runtime is not the signed release SHA or wrong DB/environment is bound.

- Public critical path blank/unrecoverable and cannot be corrected through a proven QA-tested minimal fix.

- Rollback itself is unavailable or destructive.

## 21.3 Production rollback order

1\. If public route is causing exposure, immediately restore previous Carrd/primary CTA/embed or disable affected path.

2\. Disable affected paid entitlement or AI/provider path when that isolates the failure without removing already-authorized record access.

3\. Restore last known-good frontend/Worker immutable deployment/version through approved path.

4\. Do not down-migrate destructively. Preserve additive schema and canonical 1.0 history; stop writes if integrity is uncertain.

5\. Run post-rollback smoke and verify record/payment/access integrity.

6\. Return to existing QA ref for root-cause fix, full affected regression, new signed candidate, and controlled re-cutover.

# 22. Production Operations & Runtime Observability

| **Signal**        | **Minimum 1.0 monitoring**                                                                                |
|-------------------|-----------------------------------------------------------------------------------------------------------|
| API health        | Request success/failure by action; latency; safe error_code; environment/release.                         |
| Record integrity  | Duplicate/constraint errors; wrong/missing BHR; evidence-link failures; migration errors.                 |
| AI quality        | Generation count; timeout; schema/evidence/policy reject; human-review rate; model/prompt versions.       |
| Care progression  | Triage completion; Chart activation; Sight/Path/Clinic conversion; Treatment Plan; monitoring completion. |
| Commercial        | Payment success/pending/failure; Membership start/cancel; Studio prescription/start/completion.           |
| Security          | Auth failure; forbidden route; unusual export/access; privileged change; consent errors.                  |
| External adapters | Stripe/Calendly/HubSpot/GA4/Clarity failure and recovery.                                                 |

- Immediately after cutover, inspect the controlled transaction correlation/session IDs end to end rather than relying only on aggregate dashboards.

- Keep release SHA/version and environment in safe operational logs so a stale deployment can be identified quickly.

- Treat D1 canonical evidence/clinical/payment state as authoritative; external analytics/CRM counts are secondary.

- Do not add sensitive logging “temporarily” in production to debug. Use safe IDs/error codes and reproduce in QA.

# 23. Business Physician / AI Governance Decision Rights

| **Decision**                                                        | **Authority / rule**                                                                                  |
|---------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| Change scoring formula / acuity thresholds                          | GalviStandards / product-clinical governance approval; versioned release.                             |
| Accept model-generated explanatory narrative within approved bounds | Automated validator may accept when policy permits; generation remains traceable.                     |
| Confirm material diagnosis / active treatment                       | Business Physician / authorized clinician.                                                            |
| Override red-flag referral rule                                     | Not by AI or front-end. Requires explicit authorized governance exception; default is route/escalate. |
| Change prompt/model                                                 | Engineering/Product only through approved versioned deployment; clinical eval suite must pass.        |
| Delete/alter canonical historical evidence                          | Never as silent mutation. Correction/retention/deletion follows governed policy and audit history.    |
| Advance Studio VDM gate / expose capital                            | Authorized actor under required evidence/transition rules; AI/Guide cannot bypass.                    |

## 23.1 Incident rules

- Wrong-record/cross-record exposure: immediately disable affected path, preserve audit evidence, investigate before re-enable.

- Payment entitlement mismatch: disable affected paid unlock; preserve already-authorized record access; reconcile Stripe and D1.

- AI unsafe/unsupported output: quarantine generation, do not expose, use deterministic/stored fallback, add case to eval set before re-enable if systemic.

- Database/migration issue: stop writes if integrity is uncertain; use tested rollback/recovery path; do not patch production blindly.

- External adapter outage: continue core care where safe; document manual fallback; do not let CRM/analytics outage block treatment or record access.

# 24. QA & Release Evidence Package

| **Folder / artifact**     | **Required evidence**                                                                                                                                                                                     |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 01_baseline               | Pre-1.0 known-good screenshots/URLs/commit/Worker deployment and 0.5/Vault regression; signed Day 6 handoff and pre-cutover main/prod fingerprint.                                                        |
| 02_architecture           | 1.0 system diagram; Core/Protocol/Payer contract; product/service scope; version manifest.                                                                                                                |
| 03_schema                 | D1 schema diff, exact migration files + hashes, indexes, rollback notes, consent/RBAC mapping; QA/prod binding identities.                                                                                |
| 04_api_contracts          | Request/response examples for new/changed actions; safe errors; authorization failures.                                                                                                                   |
| 05_clinical_golden_cases  | Founder, Pre-Founder, acuity, low-confidence, red-flag, contradiction cases with expected outputs.                                                                                                        |
| 06_governed_ai            | Provider configuration without secrets; prompt/schema/model versions; accepted/rejected examples; evidence lineage; outage/fallback.                                                                      |
| 07_galvichart             | Activation, progressive update, customer/clinician projection, return/resume, export/correction evidence.                                                                                                 |
| 08_active_care            | Clinic brief, finding validation, Treatment Plan, Rx, Audit, referral, monitoring/outcome evidence.                                                                                                       |
| 09_galvistudio            | Four-pillar catalog, SPUR stages, stage-gate examples, prescribed Sprint, Venture 001 proof, outcome/reassessment lineage.                                                                                |
| 10_payments_membership    | Stripe TEST + controlled LIVE verification, entitlement row, Membership beta path, duplicate/replay evidence.                                                                                             |
| 11_security_accessibility | Secret/source/network review, RBAC negatives, consent, safe errors, input controls, accessibility checklist.                                                                                              |
| 12_analytics_growth       | D1 canonical events + GA4/Clarity/HubSpot non-blocking evidence and funnel definitions.                                                                                                                   |
| 13_human_e2e              | P0-01 through P0-16 run sheet, screenshots/logs/record IDs, defects/resolutions, PASS declaration, manual_repair=NO.                                                                                      |
| 14_release                | Production URLs, final SHAs/tag, main publication, Worker/frontend deployment IDs, schema/prompt/rules/protocol versions, controlled transaction, public cutover, rollback instructions, final sign-offs. |

- Each artifact must be attributable to exact environment + release SHA/version.

- Never include secret values, private tokens, raw protected evidence, or sensitive prompt content in release artifacts.

- A screenshot alone is not canonical proof when D1/audit/runtime identity is required; pair UI evidence with record/runtime evidence.

- A test result is not valid production evidence if it ran against QA, stale runtime, or a different commit.

# 25. Final Production Sign-Off

| **Owner decision**           | **Sign-off question**                                                                                                                                                                                   |
|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Product                      | Does every step deliver distinct customer value and create a clinically logical next care/development decision?                                                                                         |
| Clinical / Business Medicine | Can every score, acuity, finding, hypothesis, pathway, treatment and escalation be traced to evidence, rules/protocol versions and authorized decision rights?                                          |
| AI governance                | Can every model-generated customer-facing statement be traced to an evidence bundle, model/prompt/schema version and validation/approval status? Can the system function safely when AI is unavailable? |
| GalviVault / data            | Is there one canonical longitudinal record per authorized principal/venture with no duplicate/cross-BHR contamination and full treatment/outcome history?                                               |
| Security / privacy           | Are secrets server-side, consent persisted, RBAC enforced, customer/clinician projections separated, and recovery/export/retention rules defined?                                                       |
| GalviStudio                  | Can a prescribed Venture Development intervention be entered, stage-gated, measured, and written back as outcome evidence?                                                                              |
| GalviPro                     | Can the Business Physician conduct a standardized Clinic encounter and create/refine treatment from one coherent GalviChart?                                                                            |
| Commercial                   | Do paywalls, GalviChart activation, Membership, Clinic, Studio programs and referrals feel like one care system rather than unrelated upsells?                                                          |
| Operations                   | Can the first customers be operated with clear fallbacks without reconstructing records across tools?                                                                                                   |
| Release                      | Have all P0 Human E2E tests passed, all three 1.0 gates passed, a controlled production transaction completed, public cutover been verified, and rollback been rehearsed?                               |

# 26. Day 7 Stop / Go Gate

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>GO ONLY WHEN</strong></p>
<p>GO only when the exact signed final QA candidate has passed the full inherited regression, Day 7 release tests, D1 integrity, security/accessibility review, P0-01..P0-16 Human E2E, and all applicable GalviCare/GalviStudio/GalviPro release gates; the exact candidate has been published to existing main without a new branch or force; the exact tested additive migrations and production bindings/config are verified; the controlled production no-payment, LIVE paid Shot -&gt; Chart, governed-AI, record/audit, and operational Clinic/referral/Studio checks pass; the public CTA is switched only afterward; rollback remains available; and the evidence package is complete with manual_repair=NO.</p></th>
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
<th><p><strong>STOP / NO-GO / ROLLBACK IF</strong></p>
<p>STOP if the Day 6 baseline is unsigned/unproven; Codex is on work/main for authoring; a new branch is required to make progress; QA/main moves unexpectedly; the production runtime is not the signed SHA; production uses a QA/test binding; a production-only SQL/code fix is proposed; payment/session integrity fails; record identity or authorization is wrong; AI governance or deterministic fallback fails; regulated routing/treatment integrity fails; a P0 Human E2E or release gate is red; rollback is destructive/unavailable; or any pass depends on manual repair.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 27. Critical-Path Defect Remediation Playbook

| **Failure class**        | **First evidence to capture**                                          | **Allowed response**                                                                     | **Forbidden response**                                      |
|--------------------------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| Branch/base              | Remote refs, checkout/upstream, signed Day 6/final QA SHA.             | Use existing QA checkout or detached/API exact-base lane; re-fetch/race-check.           | Push work/new branch; assume local HEAD; force main.        |
| Deployment trigger       | Candidate SHA, workflow run, path filters, changed files.              | Fix proven watched-path coverage or use approved deployment path; rerun exact candidate. | Invent new workflow/Worker because CI is inconvenient.      |
| Environment/binding      | Runtime env marker, D1 binding ID, Stripe mode, origins, model config. | Correct exact environment configuration and redeploy same/new QA-tested candidate.       | Point PROD at QA DB/TEST Stripe; expose secret.             |
| D1/schema                | Binding identity, schema diff, failing SQL, migration hash, row scope. | Smallest additive migration/domain fix in QA; retest rollback compatibility.             | New DB, destructive SQL, manual PASS repair.                |
| Authorization            | Actor/role/assignment/consent/action/scope.                            | Fix server policy/assignment resolution; negative retest.                                | Hide UI button only; trust client IDs.                      |
| Payment                  | Stripe event/session, D1 entitlement/result, idempotency key.          | Fix exact server verification/replay mapping in QA; controlled retest.                   | Unlock from URL/local storage; edit D1 manually.            |
| AI governance            | Generation ID, evidence refs, validator rejection reason, versions.    | Fix exact bundle/schema/policy/provider boundary; preserve fallback.                     | Relax validator to make test pass; expose raw model output. |
| Chart/projection         | Projection version, API response, canonical row, entitlement.          | Fix proven projection/cache/render layer; preserve identity.                             | Create new Chart or recompute canonical truth in browser.   |
| Care/Studio lineage      | plan/action/engagement/gate/outcome/reassessment IDs.                  | Fix exact canonical mapping/idempotency only.                                            | Manual reconstruction/shadow record.                        |
| Analytics adapter        | Canonical D1 event, adapter error, correlation ID.                     | Fix adapter mapping or document fallback; core remains non-blocking.                     | Block care until external analytics works.                  |
| Production-only failure  | Production logs/IDs + reproduction boundary.                           | Disable/rollback affected path, reproduce/fix on QA, issue new signed candidate.         | Patch live only and leave QA divergent.                     |
| Runner/Cloudflare outage | Platform error/run IDs, unchanged diff.                                | Retry proven path or approved direct lane; preserve code/refs.                           | Create new branch/Worker/DB.                                |

# 28. Codex Operator Execution Sequence - Critical Path Only

| **Phase**                        | **Action**                                                                                                               | **Exit criterion**                                 |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| Phase 0 - Entry proof            | Load signed Day 6 final evidence; fetch origin; prove repo, QA SHA, main SHA, QA/prod runtime/bindings; anti-work guard. | No edits.                                          |
| Phase 1 - Freeze/discovery       | Freeze features; inventory tests/workflows/path filters/migrations/runtime config; create allowed-file manifest.         | Only release blockers may be scheduled.            |
| Phase 2 - Final QA fixes         | Fix only proven P0/P1/release defects on existing QA/detached exact-base lane.                                           | Smallest diff; no new branch.                      |
| Phase 3 - Automated gate         | Run focused retests -\> inherited Day 1-6 -\> Day 7 T01-T60 -\> D1-1..22.                                                | mandatory skipped=0; manual_repair=NO.             |
| Phase 4 - QA deploy              | Publish exact candidate to existing QA; prove workflow/path-filter coverage and deployed runtime identity.               | candidate SHA == remote QA == runtime.             |
| Phase 5 - Human release proof    | Run security/accessibility + golden cases + P0-01..P0-16 + all three release gates.                                      | Any code/config change invalidates affected proof. |
| Phase 6 - Rollback rehearsal     | Restore prior runtime safely and restore candidate; prove additive D1 compatibility.                                     | No destructive SQL.                                |
| Phase 7 - Pre-prod sign-off      | Finalize version manifest, migration hashes, production manifest, rollback assets, evidence 01-13.                       | main still unchanged.                              |
| Phase 8 - Publish main           | Race-check; existing QA -\> existing main only; no new branch; prove origin/main == release SHA.                         | No force/rebase if divergence.                     |
| Phase 9 - Production deploy      | Apply exact additive migrations; deploy Worker/app; configure production secrets/bindings/origins/Stripe/OpenAI.         | No production-only fix.                            |
| Phase 10 - Controlled prod proof | Run PROD-01..PROD-12 including controlled LIVE paid Shot -\> Chart and governed AI.                                      | Stop on first P0/P1.                               |
| Phase 11 - Public cutover        | Switch Carrd/primary CTA/embed only after controlled prod proof; run clean-browser smoke.                                | Retain previous route for rollback.                |
| Phase 12 - Evidence/sign-off     | Complete 14_release, final owner sign-offs, declare PASS or rollback.                                                    | No ambiguous “mostly pass”.                        |

# 29. Day 7 Evidence / Status Report Template

Codex must populate this template with concrete values and artifact references. Do not leave PASS claims unsupported.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>DAY 7 BUILD / RELEASE STATUS<br />
<br />
BASELINE<br />
- repo/root:<br />
- origin URL:<br />
- signed Day 6 Build Final SHA:<br />
- origin/qa SHA before Day 7:<br />
- origin/main SHA before cutover:<br />
- QA backend Worker/version/runtime:<br />
- QA frontend deployment/version:<br />
- QA D1 binding/database/schema checksum:<br />
- production frontend/Worker/version before cutover:<br />
- production D1 binding/database/schema before cutover:<br />
- public CTA/embed before cutover:<br />
- rollback target(s):<br />
<br />
BRANCH / PUBLICATION SAFETY<br />
- authoring lane: existing QA | detached exact-base | GitHub object API<br />
- current checkout before edits:<br />
- anti-work-branch guard: PASS/FAIL<br />
- new remote branches created: NO<br />
- work ref pushed: NO<br />
- QA remote-base race check: PASS/FAIL<br />
- main remote-base race check: PASS/FAIL<br />
- main ancestry check: PASS/FAIL<br />
<br />
FEATURE FREEZE / CHANGE MANIFEST<br />
- feature freeze active: YES/NO<br />
- P0/P1 defects addressed:<br />
- files changed:<br />
- reason each file is release-critical:<br />
- unrelated workflow/refactor files changed: NO<br />
- deploy path-filter coverage: PASS/FAIL<br />
<br />
VERSION MANIFEST<br />
- final QA candidate SHA:<br />
- release tag:<br />
- schema_version:<br />
- clinical_rules_version:<br />
- score_version:<br />
- acuity_version:<br />
- protocol_version:<br />
- athlete_protocol_version:<br />
- ai_prompt_version:<br />
- ai_output_schema_version:<br />
- chart_projection_version:<br />
- treatment_plan_version:<br />
- studio_vdm_version:<br />
- model config name (no secret):<br />
<br />
QA AUTOMATED / D1<br />
- inherited Day 1-6 regression: PASS/FAIL<br />
- Day 7 T01-T60: PASS/FAIL (mandatory skipped=0)<br />
- D1-1..D1-22: PASS/FAIL<br />
- manual repair: NO<br />
<br />
QA DEPLOYED RELEASE PROOF<br />
- origin/qa final SHA:<br />
- QA backend deployment/version:<br />
- QA frontend deployment/version:<br />
- QA D1 schema checksum:<br />
- direct runtime/capability probes:<br />
<br />
SECURITY / COMMERCIAL / HUMAN E2E<br />
- security/accessibility/trust review: PASS/FAIL<br />
- commercial entitlement/Membership/Clinic/Studio lock: PASS/FAIL<br />
- golden cases A-I: PASS/FAIL<br />
- P0-01..P0-16: PASS/FAIL<br />
- GalviCare release gate: PASS/FAIL<br />
- GalviStudio release gate: PASS/FAIL<br />
- GalviPro release gate: PASS/FAIL<br />
<br />
ROLLBACK REHEARSAL<br />
- prior runtime restore: PASS/FAIL<br />
- final candidate restore: PASS/FAIL<br />
- non-destructive D1 compatibility: PASS/FAIL<br />
- rollback duration / evidence:<br />
<br />
PRODUCTION CUTOVER<br />
- final signed release SHA:<br />
- origin/main after publication:<br />
- production migration hashes/results:<br />
- production Worker deployment/version:<br />
- production frontend deployment/version:<br />
- production D1 binding/schema after cutover:<br />
- Stripe LIVE controlled transaction ref:<br />
- production governed-AI generation ref:<br />
- controlled Clinic/referral/Studio ref:<br />
- public CTA/embed after cutover:<br />
- PROD-01..PROD-12: PASS/FAIL<br />
<br />
EVIDENCE PACKAGE<br />
- 01_baseline through 14_release complete: YES/NO<br />
- secret/protected-data review: PASS/FAIL<br />
- final owner sign-offs:<br />
<br />
DEFECTS<br />
- failure -&gt; proven root cause -&gt; minimal diff -&gt; focused retest -&gt; full regression<br />
<br />
FINAL DECLARATION<br />
GALVISTUDIO 1.0 | GALVICARE 1.0 PRODUCTION RELEASE PASS / DAY 7 BUILD FINAL<br />
OR<br />
DAY 7 NO-GO / STOP / ROLLBACK</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix A - One-Page Day 7 Completion Checklist

\[ \] Exact signed Day 6 Build Final retrieved from executed Day 6 evidence and proven equal to origin/qa before edits.

\[ \] Existing qa-revamped-galvicare-0-5 only; no work/new Day7/release/workaround branch; main not used for authoring.

\[ \] Feature freeze enforced; every changed file maps to a proven P0/P1/release gate.

\[ \] Deployment workflow/path filters inspected before changes; all runtime files covered.

\[ \] Final candidate SHA/tag/version manifest captured and immutable before Human E2E.

\[ \] Commercial architecture locked: GalviChart, approved diagnostics, Clinic, Membership beta, Studio program/Sprint contracts.

\[ \] Canonical D1 analytics/growth events verified; HubSpot/GA4/Clarity non-blocking; no sensitive logging.

\[ \] Security/accessibility/trust review PASS.

\[ \] Inherited Day 1-6 regression PASS; Day 7 T01-T60 PASS; mandatory skipped=0.

\[ \] D1-1..D1-22 clean; manual_repair=NO.

\[ \] Golden cases A-I PASS.

\[ \] P0-01..P0-16 Human E2E PASS on exact deployed QA candidate.

\[ \] GalviCare, GalviStudio, and GalviPro 1.0 release gates PASS for launch paths.

\[ \] Pre-production rollback rehearsal PASS; prior runtime and final candidate restore non-destructively.

\[ \] Pre-cutover main/prod/D1/public-route fingerprints and rollback assets captured.

\[ \] Existing QA -\> existing main publication performed with race/ancestry checks; no new branch or force push.

\[ \] Exact tested additive 1.0 migrations applied to production; no ad-hoc production SQL.

\[ \] Production Worker/app use correct production bindings/secrets/origins; fixtures/debug disabled.

\[ \] Controlled production no-payment Triage/Vitals PASS.

\[ \] Controlled LIVE paid Shot -\> Chart PASS; replay/entitlement integrity PASS.

\[ \] Controlled governed-AI production generation PASS with lineage/versions/fallback.

\[ \] Controlled Clinic booking + non-regulated referral/Studio prescription PASS if operationally feasible.

\[ \] PROD-01..PROD-12 PASS.

\[ \] Public Carrd/primary CTA/embed moved only after production proof; clean-browser public smoke PASS.

\[ \] Rollback package remains immediately usable after cutover.

\[ \] 01_baseline..14_release evidence package complete and secret-safe.

\[ \] Final owner sign-offs complete.

\[ \] Final declaration: GALVISTUDIO 1.0 \| GALVICARE 1.0 PRODUCTION RELEASE PASS / DAY 7 BUILD FINAL.

# Appendix B - Anti-Work-Branch & Main-Promotion Guards

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>PERMANENT BRANCH RULE</strong></p>
<p>No new branch is needed for Day 7. QA authoring remains on the existing qa-revamped-galvicare-0-5 ref or a detached/object-API lane that publishes only to that existing ref. Production promotion uses existing QA as source and existing main as destination.</p></th>
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
<th># PRE-EDIT GUARD<br />
CURRENT_BRANCH="$(git branch --show-current || true)"<br />
case "$CURRENT_BRANCH" in<br />
work|main) echo "STOP: forbidden Day 7 authoring branch: $CURRENT_BRANCH"; exit 71 ;;<br />
qa-revamped-galvicare-0-5|'') ;; # '' means detached lane<br />
*) echo "STOP: unexpected branch; no new Day 7 branch authorized"; exit 72 ;;<br />
esac<br />
<br />
# PRE-QA-PUSH RACE GUARD<br />
git fetch origin qa-revamped-galvicare-0-5<br />
REMOTE_QA_NOW="$(git rev-parse origin/qa-revamped-galvicare-0-5)"<br />
[ "$REMOTE_QA_NOW" = "$EXPECTED_QA_BASE_SHA" ] || {<br />
echo "STOP: QA moved; do not push over another candidate"; exit 73;<br />
}<br />
<br />
# PRE-MAIN-PROMOTION GUARD<br />
git fetch origin qa-revamped-galvicare-0-5 main<br />
[ "$(git rev-parse origin/qa-revamped-galvicare-0-5)" = "$FINAL_QA_SHA" ] || exit 74<br />
[ "$(git rev-parse origin/main)" = "$EXPECTED_MAIN_SHA" ] || exit 75<br />
git merge-base --is-ancestor "$EXPECTED_MAIN_SHA" "$FINAL_QA_SHA" || exit 76<br />
# Publish via approved fast-forward or PR existing QA -&gt; existing main.<br />
# NEVER: git push --force origin main<br />
# NEVER: create work/day7/release/hotfix branch solely to perform cutover.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Appendix C - Source Alignment Notes

- The Authoritative Seven-Day Guide defines Day 7 as Commercial Readiness, Human E2E, Release Gates, Production Cutover, and Evidence Package, with feature freeze and proof of the complete ecosystem before cutover.

- The authoritative Day 7 commercial rules preserve GalviChart as record/retention substrate, keep paid diagnostics server-verified, make GalviClinic a paid active-care encounter tied to source session/BHR, make Membership beta an ongoing care relationship, and keep GalviLeague out of the public 1.0 dependency.

- The authoritative Day 7 P0 Human E2E matrix is P0-01 through P0-16 and includes Founder, Pre-Founder, low confidence, acuity, regulated referral, governed AI, Chart, clinician projection, Treatment -\> Studio, Audit/Lab, Stripe, Membership, unauthorized access, adapter failure, recovery, and rollback.

- The authoritative production cutover requires exact tested additive D1 migrations, production Worker/config/secrets, server-verified Stripe LIVE configuration, approved CORS/auth, candidate deployment before public-route switch, controlled no-payment + paid + AI + Clinic/referral/Studio checks, then public CTA cutover.

- The authoritative release decision makes payment/session integrity, record correctness, authorization, AI governance, treatment integrity, or rollback failure an automatic NO-GO for the affected path.

- The Day 6 Builder handoff requires Day 7 to begin only from exact Day 6 Build Final, preserve the same principal/BHR/Chart and Studio lineage, freeze four pillars/SPUR/gates/Sprints and GalviPro practice protocol, run the full trust/P0 release matrix, and use a complete rollback package.

- The recurring GalviCare/GalviVault work-branch failure is prevented here by forbidding work/new remote refs, using only the existing QA ref or detached/object-API publication to that exact ref, and promoting the signed candidate from existing QA to existing main without a new release branch.

- This Day 7 Builder intentionally does not invent the executed Day 6 final SHA because it is not stated in the attached source documents. Codex must retrieve and prove that value from the actual Day 6 execution evidence before Day 7 begins.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>TARGET END STATE</strong></p>
<p>GALVISTUDIO 1.0 | GALVICARE 1.0 DAY 7 BUILD FINAL: one governed Business Healthcare + Venture Development closed loop operates in production from Triage -&gt; evidence -&gt; governed intelligence -&gt; Chart -&gt; Path/Clinic/Treatment -&gt; Rx/Audit/referral/Studio -&gt; monitoring/outcome -&gt; GalviVault -&gt; next decision; commercial entitlements, Membership, analytics, security, recovery, and rollback are proven; the same canonical record is preserved; and the release is supported by exact-SHA evidence from QA through production.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>
