# GALVICARE™ 0.5 — DAY 7 BUILDER GUIDE
## CODEX IMPLEMENTATION ENGINEER EDITION

> Full QA • Controlled Production Cutover • FCD Launch Readiness

**Authoritative Codex filename:** `CODEX_DAY7_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md`

---
## CODEX LOAD DIRECTIVE

Codex: treat this file as the authoritative Day 7 release-engineering contract for GalviCare 0.5.

- Read this entire file before proposing or making changes.
- Repository reality controls exact paths, function names, IDs, URLs, deployment commands, environment names, and current schema.
- This guide controls Day 7 scope, release order, security boundaries, acceptance criteria, evidence, rollback, and Human Product Owner approval gates.
- Do not invent repository facts. If repository reality conflicts with this guide, stop and report the conflict.
- Feature development is frozen on Day 7.
- Do not deploy, merge, change production secrets, modify live Stripe configuration, change Carrd/public routing, or write production data without the explicit Human Product Owner approval required by the applicable gate.
- Preserve all accepted Days 1–6 contracts unless a proven P0/P1 regression requires the smallest possible correction.

---

| Contract field | Day 7 locked value |
| --- | --- |
| File | CODEX_DAY7_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md |
| Release | GalviCare 0.5 Day 7 / Production Release Candidate |
| Build theme | Freeze • Prove • Cut Over • Rehearse • Observe • Roll Back |
| Execution target | One release-readiness discovery pass; one P0/P1 correction pass; one controlled cutover window |
| Architecture | No Make • No OpenAI • One Cloudflare Worker + D1 • Browser presentation only |
| Day 7 objective | Prove the accepted Day 6 candidate, configure production safely, execute one controlled production transaction, rehearse the live FCD workflow, and release only if every critical gate passes. |
| Authority | Human Product Owner approval required before merge, production deployment, live Stripe changes, Carrd cutover, live-secret changes, production-data writes, or launch. |

> **CRITICAL-PATH DIRECTIVE Day 7 is a release-validation and controlled-cutover day, not a feature-build day. Codex must freeze feature development, preserve the accepted Days 1–6 contracts, repair only proven P0/P1 defects or bounded trust-breaking issues, and never use a failed test as permission for redesign. Production is touched only after the QA release candidate passes its gates and the Human Product Owner gives explicit authorization.**

Prepared for GalviPro / GalviStudio | July 2026 | Secure + Learning-Ready

# Table of Contents

1. Document Purpose and Day 7 Mission

2. Critical-Path Release Operating Model and Timebox

3. Lessons Carried Forward from Days 1–6

4. Day 7 GO / NO-GO Gates and Absolute Prohibitions

5. Preconditions and Day 6 Handoff Acceptance

6. Codex Release-Readiness Discovery Prompt

7. Release Candidate Freeze and Integrity Baseline

8. P0 End-to-End Regression Matrix

9. Security Verification Contract

10. Accessibility and Trust Verification

11. Data Integrity and Traceability Audit

12. Payment and Entitlement Production Gate

13. Session, Routing, Recovery, and Duplicate-Proof Gate

14. FCD Operating Readiness and Rehearsal

15. Print / PDF and Customer Record QA

16. Observability, Analytics, and Error Monitoring

17. Production Environment Configuration Contract

18. Controlled Production Cutover Sequence

19. Controlled Production Transaction

20. Carrd / Public Entry Cutover

21. Rollback Package and Rollback Rehearsal

22. Post-Cutover Production Smoke Test

23. Launch-Day Operating Procedure

24. Checkpoint Protocol and Human Evidence

25. Codex One-Pass Day 7 Execution Prompt

26. Human Product Owner Verification

27. Pull Request / Release Record / Tagging

28. Final Codex Report Template

29. Day 7 Release Decision and Post-Launch Handoff

Appendix A. P0 Test Scripts

Appendix B. Production Change Ledger

Appendix C. Release Evidence Pack

Appendix D. Critical-Path Defect Response Template

Appendix E. Explicit Deferred Backlog

> **Source alignment This Day 7 guide operationalizes the seven-day implementation plan’s final mandate: full regression, security, accessibility, observability, rollback, controlled production cutover, one controlled production transaction, and FCD launch rehearsal. It also carries forward the Day 6 handoff model: one accepted candidate SHA, canonical route ownership, authoritative Worker/D1 state, protected facilitator summary, verified Stripe entitlement, non-blocking adapters, printable records, and a binary GO/BLOCK recommendation.**

# 1. Document Purpose and Day 7 Mission

This document is simultaneously:

- the Human Product Owner supervision runbook for the final GalviCare 0.5 release day;
- Codex’s authoritative Day 7 release-engineering contract;
- the final regression, security, accessibility, observability, payment, rollback and production-cutover procedure;
- the launch rehearsal for the Founder Collaboration Discussion (FCD) clinical diagnostic upsell operating model;
- the release evidence standard that determines whether GalviCare 0.5 is commercially usable and safe enough to accept real customer transactions.
Repository reality controls exact file paths, function names, deployment commands, environment names, Cloudflare resource identifiers, Stripe object IDs, URLs and schema details. This guide controls scope, release order, authority, acceptance criteria, evidence, rollback and prohibited behavior. Codex must never invent missing production details.

| Area | Day 7 required release behavior |
| --- | --- |
| Release candidate | The exact accepted Day 6 candidate SHA is frozen before regression; all Day 7 edits are bounded and reviewable. |
| Regression | All P0 customer, payment, session, security, recovery, mobile, FCD, print and adapter tests pass. |
| Production | Production Worker, D1, secrets, CORS, frontend config, Stripe live links/webhook and public entry are configured only from the tested QA contracts. |
| Transaction | One controlled production transaction proves session continuity, verified entitlement, correct product restoration, D1 persistence and public return routing. |
| FCD operations | Facilitator can open one protected clinical summary, conduct the full conversation, capture notes and reach the correct care/commercial next step. |
| Rollback | Git/frontend, Worker, D1/config, Carrd and Stripe rollback paths are documented and rehearsed before launch. |
| Observability | Health, structured errors, canonical D1 events and analytics provide enough evidence to diagnose launch problems without exposing secrets or PII. |
| Security | Browser contains presentation logic only; no secrets, proprietary GalviEngine logic, payment authority, production admin token or unrestricted record access. |

> **Single release objective A real founder can enter from the public GalviPro/Carrd entry point, complete the GalviCare pathway, make an approved paid purchase, return to the correct product, retain entitlement and session state, receive the correct deterministic output, and reach the appropriate GalviClinic decision with no manual data repair—while the facilitator can operate the FCD from one protected clinical summary.**

# 2. Critical-Path Release Operating Model and Timebox

> **Permitted Day 7 workflow Day 6 handoff acceptance → one release-readiness discovery report → Human GO to test → frozen release candidate → P0 regression → one bounded correction pass if required → Human GO to cut over → production environment verification → controlled transaction → Carrd/public cutover → production smoke test → FCD rehearsal → GO / ROLLBACK.**

| Elapsed target | Checkpoint | Codex output | Human action |
| --- | --- | --- | --- |
| 0:00–0:20 | Handoff + discovery | Candidate SHA, environment map, production delta, release blockers, rollback assets, READY/BLOCKED. | Approve test start once. |
| 0:20–1:20 | P0 regression | P0-01 through P0-12 plus Day 6 route/state tests; exact evidence; no feature work. | Review failures only. |
| 1:20–1:45 | Security/accessibility/data | Source/network scan, privilege boundaries, accessibility/trust checklist, D1 integrity queries. | Approve release candidate. |
| 1:45–2:15 | Production staging | Production D1/Worker/config/secrets/CORS/Stripe verification without public cutover. | Approve cutover window. |
| 2:15–2:35 | Controlled production transaction | One live or approved production verification; evidence across Stripe, Worker, D1 and frontend. | Confirm transaction. |
| 2:35–2:50 | Public cutover + smoke | Carrd/CTA cutover, public entry smoke, analytics/error checks. | Observe live path. |
| 2:50–3:10 | Rollback rehearsal + FCD rehearsal | Rollback proof and one exact FCD operating rehearsal. | GO / ROLLBACK. |
| 3:10–3:20 | Release record | Tag, release ledger, known limitations, post-launch monitoring checklist. | Final sign-off. |

## 2.1 Failed-Test Rule

Every failure must be handled as an isolated release defect. Codex returns exactly:

- failed acceptance criterion and severity (P0/P1/P2 trust-breaking/P3);
- environment where observed (QA candidate, production candidate, public production);
- smallest affected file/config/resource set;
- observed evidence and supported root cause;
- targeted correction only;
- exact re-test command or Human step;
- whether the correction changes any previously accepted Day 1–6 contract;
- whether rollback is required.
> **No architecture reopening A single production-config, Stripe, route, analytics, accessibility or FCD defect does not authorize a Worker rewrite, framework migration, route-system replacement, new database, new Worker, data-model redesign or UI rewrite.**

# 3. Lessons Carried Forward from Days 1–6

| Lesson | Day 7 release rule |
| --- | --- |
| Duplicate route/config assets caused real runtime contradictions. | Re-prove one canonical public entry, one API target and one active owner for every critical transition before cutover. |
| Stripe return behavior is part of the journey, not an isolated confirmation page. | Production return must verify payment server-side, restore entitlement and continue the correct downstream state. |
| Browser/local state is not authoritative. | Production Worker/D1 state and verified entitlements override browser hints. |
| Repeated broad troubleshooting delayed prior days. | Day 7 allows one bounded correction pass. Additional failures trigger BLOCK/rollback, not exploratory redesign. |
| Non-blocking adapters are not customer-path dependencies. | HubSpot, GA4 and Clarity can fail without blocking care, payment persistence or navigation. |
| Refresh/back/incognito exposed hidden continuity defects. | These are mandatory P0 regression paths before production cutover. |
| FCD quality depends on one coherent operating view. | Launch is blocked if facilitator must reconstruct founder condition across unrelated systems. |
| Security is architectural, not cosmetic. | Secrets, proprietary rules, entitlement authority and facilitator authorization remain server-side. |
| Production change order matters. | Configure and verify production resources before changing public Carrd/CTA routing. |
| Rollback must exist before launch. | Every production change gets a before-state and reversal step before it is executed. |

## 3.1 Severity Definitions

| Priority | Definition | Day 7 action |
| --- | --- | --- |
| P0 | Launch/customer journey cannot complete; wrong session/product; unauthorized paid access; lost entitlement; blank required state; exposed secret/admin access; corrupt production data. | Immediate BLOCK or rollback. |
| P1 | Core journey requires manual repair; wrong redirect; stale stage; broken mobile control; unusable print/FCD view; observability too weak to support launch. | Fix only if bounded before cutover; otherwise BLOCK. |
| P2 trust-breaking | Copy/layout/accessibility issue likely to cause loss of trust or wrong decision. | Fix only if one-file/bounded and low risk. |
| P2 cosmetic / P3 | Noncritical polish, refactor, nice-to-have admin/analytics. | Defer. |

# 4. Day 7 GO / NO-GO Gates and Absolute Prohibitions

## 4.1 Day 7 GO

- All P0 tests pass on the frozen QA candidate.
- Security source/network inspection finds no exposed secrets, proprietary rules, unrestricted facilitator/admin endpoints or client-side payment authority.
- Production Worker and D1 are identifiable, correctly bound, health-checkable and separate from QA.
- FIXTURE_MODE and every test override are disabled in production.
- Production CORS permits only approved public origins.
- Live Stripe verification is server-authoritative; product mapping, webhook or server confirmation, return routing and entitlement persistence are proven.
- One controlled production transaction completes with correct session, product, payment row, entitlement, stored result and next route.
- Public Carrd/CTA enters the canonical production app and does not route to QA or stale assets.
- Rollback can restore the known-good prior public entry, frontend and Worker/config state quickly.
- FCD facilitator rehearsal completes from one protected clinical summary.
- Only documented non-blocking P2/P3 limitations remain.
## 4.2 Day 7 NO-GO / Immediate Rollback

- Any secret, token, privileged endpoint, proprietary rule or server product map is exposed in browser source or network responses.
- URL parameters or browser state can grant permanent paid access without server verification.
- Production and QA Worker/D1/Stripe configuration cannot be distinguished confidently.
- Wrong founder/session/product can be retrieved, unlocked or rendered.
- Public Carrd/CTA points to a stale, duplicate or noncanonical app path.
- Production health/API returns HTML, stack traces or malformed/blank responses on core actions.
- Controlled transaction cannot be reconciled across Stripe, entitlement, D1 result and session.
- Any Day 2–6 clinical or transactional semantic contract regresses.
- Rollback assets are missing, untested or ambiguous.
## 4.3 Codex Is Explicitly Forbidden To

- add features, new products, new screens, AI, Make, Airtable writes, a second Worker, a second route system or a second session authority;
- change scoring weights, question contracts, findings, confidence semantics, GalviSight interpretation, pathway protocol, Clinic treatment logic or payment entitlement semantics except to correct a proven regression while preserving the accepted contract;
- perform destructive D1 migrations or production-history rewrites;
- copy QA secrets into production or production secrets into repository files;
- enable test override, fixture mode, debugging bypasses or permissive CORS in production;
- change live Stripe products/prices/links unless explicitly required by the approved release plan and separately authorized;
- merge or deploy to production without explicit Human approval at the named gates;
- continue after a production P0 without rollback or explicit Human decision.
# 5. Preconditions and Day 6 Handoff Acceptance

| Required Day 6 handoff | Evidence required before Day 7 starts |
| --- | --- |
| QA candidate SHA | Exact commit recommended for release. |
| P0/P1 status | No known P0; no unresolved P1 unless explicitly accepted as non-launching affected path. |
| Canonical route ownership | Transition map from Welcome through Clinic, including Stripe return and recovery. |
| State restoration | Documented Worker/D1 precedence and verified existing paid-result restoration. |
| D1/schema state | Applied additive migrations, relevant indexes and rollback treatment. |
| FCD summary/capture | Protected summary and facilitator note persistence proven. |
| Print | Representative paid records print cleanly. |
| Analytics | Canonical event map, GA4/Clarity integration and non-blocking failure behavior. |
| Duplicate/conflict disposition | No competing runtime handler/config for critical paths. |
| Rollback | Pre-Day-6 and current known-good artifacts identifiable. |
| Known limitations | Only bounded P2/P3 items with owner/backlog. |

## 5.1 Stop Gate

- Stop before testing if the Day 6 candidate SHA is not known.
- Stop if the candidate branch/worktree is dirty and the changes cannot be accounted for.
- Stop if the deployed QA Worker source/version is not traceable to the candidate.
- Stop if live production Worker, D1, Stripe or Carrd targets are ambiguous.
- Stop if rollback artifacts do not exist.
- Stop if the only way to pass Day 7 appears to require redesign.
# 6. Codex Release-Readiness Discovery Prompt

## 6.1 Copy/Paste Prompt — Discovery Only

```text
You are the release implementation engineer for GalviCare 0.5 Day 7.

MODE: RELEASE-READINESS DISCOVERY ONLY.

DO NOT edit files, change data, change secrets, deploy, merge, create a PR, change Stripe, change Carrd, apply migrations, or run destructive commands.

Read CODEX_DAY7_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md and inspect the accepted Day 6 QA branch/worktree.

Return ONE consolidated report with:

1. Candidate integrity
- active branch/worktree
- git status
- accepted Day 6 candidate SHA
- exact changed files since that SHA, if any
- test commands and current QA deployment version

2. Environment map
- QA frontend URL and production frontend candidate/public URL
- QA Worker and production Worker names/routes
- QA D1 and production D1 bindings
- ENVIRONMENT, FIXTURE_MODE and test-override flags (values only; never reveal secrets)
- approved Carrd/public origin(s)
- Stripe test/live mode objects required by the existing contract
- GA4/Clarity/HubSpot/Calendly production dependencies

3. Production delta
List every concrete change required to move the accepted QA candidate into production:
- Git/front-end deployment
- Worker deployment/config
- D1 schema/binding
- CORS
- Stripe live product/payment-link/webhook/return configuration
- Carrd/embed/CTA
- analytics/adapters
For each, show BEFORE / AFTER / verification / rollback.

4. P0 regression readiness
Map exact code/functions and test mechanism for P0-01 through P0-12.

5. Security release scan plan
Identify browser bundles/source, secret references, privileged actions, CORS, admin/facilitator authorization, payment authority, stack-trace behavior and production test bypasses.

6. Data integrity plan
Identify queries/tests proving one session, one active result per session+product, one verified payment/entitlement record, no duplicate generation on refresh, and evidence/rules-version traceability.

7. Rollback package
Identify exact Git tag/commit, frontend artifact, Worker version/source, prior Carrd target, Stripe state, D1 migration posture, and restoration steps.

8. FCD readiness
Identify protected summary route/action, facilitator authorization, note capture, print behavior and exact rehearsal path.

9. Release blockers
Return P0/P1/P2/P3 issues only. Do not propose enhancements.

10. FINAL DISCOVERY STATUS
READY FOR P0 REGRESSION
or
BLOCKED
with the exact blocking reason.

Do not begin implementation or production changes until the Human Product Owner explicitly authorizes the next phase.
```

> **Human approval gate Codex may proceed only after the Human Product Owner accepts the discovered candidate SHA, environment map, production delta and rollback package. Discovery is not permission to deploy.**

# 7. Release Candidate Freeze and Integrity Baseline

1. Confirm the accepted Day 6 QA candidate commit and working tree.
1. Create a release-candidate tag or immutable reference before any Day 7 edit.
1. Record git status, candidate SHA, deployment version and current QA Worker version.
1. Export or record the exact QA Worker environment configuration names without exposing secret values.
1. Record D1 migration filenames already applied to QA.
1. Record the current canonical frontend entrypoint and critical runtime asset list.
1. Record the current test-mode Stripe product/payment-link mapping used in Day 5/6.
1. Record the current Carrd QA/public target and prior production target.
1. Create a release evidence folder structure before testing.
1. After freeze, reject every non-P0/P1 code change from Day 7.
```text
Recommended release evidence layout:

release-evidence/day7/
  00-baseline/
  01-p0-regression/
  02-security/
  03-accessibility/
  04-data-integrity/
  05-production-config/
  06-controlled-transaction/
  07-public-cutover/
  08-rollback/
  09-fcd-rehearsal/
  10-final-report/
```

## 7.1 Candidate Integrity Evidence

| Evidence | Pass condition |
| --- | --- |
| git status | Clean or every change explicitly accounted for. |
| candidate SHA | Matches accepted Day 6 handoff. |
| QA deployment | Serves candidate assets/Worker version. |
| No test bypass drift | Fixture/test overrides remain QA-only. |
| Runtime duplicate audit | One frontend config/API target and one route owner per critical CTA. |

# 8. P0 End-to-End Regression Matrix

| ID | Scenario | Procedure | Pass criteria |
| --- | --- | --- | --- |
| P0-01 | New high-confidence founder | Complete full intake and downstream diagnostics using the normal QA journey. | Correct outputs; minimal follow-up; one session; correct next states. |
| P0-02 | Low-confidence founder | Omit/contradict context and complete targeted follow-ups. | Only relevant follow-ups; confidence recalculates; no fabricated certainty. |
| P0-03 | Stripe paid journey | Complete one Stripe Test Mode payment on approved paid path. | Server-verified entitlement; correct stored result; correct return state. |
| P0-04 | Unpaid access | Call paid product action directly without entitlement. | Locked response; no paid result exposed. |
| P0-05 | Duplicate/refresh | Refresh result, replay Continue, and replay Stripe return. | One session; one payment; one active result per product; no restart to Triage. |
| P0-06 | Worker error | Use invalid action or approved safe failure. | Visible recovery; structured JSON; session preserved; no blank screen. |
| P0-07 | HubSpot failure | Disable/break QA adapter safely. | Customer journey completes; D1/error evidence exists. |
| P0-08 | Mobile | Run iPhone-width and actual iOS browser when available. | No horizontal scroll; controls usable; no hidden required CTA. |
| P0-09 | Incognito/session | Run independent incognito journey. | New session works with no dependency on prior cache. |
| P0-10 | FCD facilitator | Open protected summary and perform 15-minute rehearsal. | Evidence, meaning, pathway, treatment and commercial status explainable from one view. |
| P0-11 | Print | Print representative GalviShot, GalviSight and GalviPath records. | Readable/branded; no nav/paywall/QA controls; required metadata/disclaimer present. |
| P0-12 | Security | Inspect source, network, CORS and privileged actions. | No exposed secrets/proprietary logic/unrestricted admin or client-side entitlement authority. |

## 8.1 Additional Day 6 Regression Carry-Forward

- Carrd QA entry equals direct canonical app behavior.
- Browser back then continue restores the server-authoritative stage.
- Existing paid entitlement bypasses paywall and returns stored result.
- Stripe return never lands on generic dead-end confirmation or initial GalviTriage for a valid downstream session.
- Booking failure shows approved retry/contact fallback.
- GA4/Clarity failure cannot block the founder.
- Facilitator note capture does not mutate historical diagnostic results.
- Day 2–5 result rules_version and generation_source remain unchanged.
# 9. Security Verification Contract

| Control | Required verification | Block condition |
| --- | --- | --- |
| Browser boundary | Search HTML/JS/build output for API secrets, tokens, proprietary rules, scoring logic, server product maps and admin credentials. | Any sensitive or proprietary server logic present. |
| Secrets | Confirm secret names exist only in Worker secret/config systems; never print secret values. | Secret committed, logged or returned. |
| CORS | Production allows only approved Carrd/GitHub production origins; OPTIONS behavior correct. | Wildcard or unapproved origin can call privileged/customer data actions. |
| Action allowlist | Unknown actions return safe structured error. | Arbitrary function/action execution possible. |
| Facilitator/admin protection | Protected summary/note actions use approved authorization boundary. | Records enumerable without approved protection. |
| Payment authority | Entitlement comes only from verified Stripe server state. | URL/browser/localStorage grants permanent access. |
| Error safety | Founder errors contain safe message and reference, not stack trace or secrets. | Technical detail exposed. |
| D1 safety | Parameterized statements and idempotent writes used for customer input. | Unsafe dynamic SQL or duplicate-prone critical write. |
| Test bypass | FIXTURE_MODE=false and ALLOW_TEST_OVERRIDE=false in production. | Any production bypass enabled. |
| PII minimization | Logs/events avoid unnecessary personal data. | Sensitive content logged without need. |

## 9.1 Codex Security Evidence Commands

```text
Codex must adapt commands to repository reality; examples:

git grep -nEi "(sk_live|sk_test|STRIPE_SECRET|HUBSPOT_TOKEN|OPENAI_API_KEY|Bearer [A-Za-z0-9])" -- .
git grep -nEi "(ALLOW_TEST_OVERRIDE|FIXTURE_MODE|grant_test_override|admin|facilitator)" -- .
git grep -nEi "(score_weight|rules_version|finding_rules|pathway_protocol|treatment_rules)" -- <frontend paths>

Report matches; do NOT print actual secret values.
```

# 10. Accessibility and Trust Verification

| Check | Pass criteria |
| --- | --- |
| Visible labels | Every required form field/control has a visible, understandable label. |
| Keyboard order | Tab/focus follows visual reading and action order. |
| Descriptive controls | Buttons/links say what happens; avoid generic “Click here.” |
| Status announcements | Loading/error/success states use role=status or aria-live where appropriate. |
| Color independence | Severity/status is conveyed by text/icon/structure, not color alone. |
| Heading hierarchy | Logical H1/H2/H3 structure; no visual-only hierarchy. |
| Mobile readability | Text, controls and error messages remain readable at target mobile width. |
| Trust disclaimer | Outputs clearly state business guidance and not legal, medical, financial, tax or investment advice. |
| Payment clarity | Price/product/next step are clear before checkout. |
| Recovery clarity | Error states say what was saved, what failed and the next safe action. |

> **Day 7 scope rule Accessibility fixes are permitted only when they remove a release-blocking usability/trust issue and can be made without changing clinical or transactional semantics.**

# 11. Data Integrity and Traceability Audit

Codex must prove the production candidate preserves GalviVault as an auditable clinical record.

| Invariant | Required proof |
| --- | --- |
| One session authority | session_id maps to one authoritative session/current_stage. |
| One active product result | No duplicate active diagnostic result for the same session + product. |
| Payment uniqueness | Stripe session and session+product uniqueness/idempotency preserved. |
| Stored retrieval | Refresh returns stored result without silent regeneration unless the accepted contract explicitly requires versioned regeneration. |
| Evidence traceability | Findings reference stored evidence and rules_version. |
| Progressive chain | Vitals/Score → Shot → Sight → Path → Clinic outputs do not contradict stored upstream record. |
| Facilitator capture isolation | Notes/confirmations are additive and do not rewrite historic customer-facing result. |
| Generation source | rules/stored/facilitator semantics remain explicit and compatible with future AI schema. |
| Error/event traceability | Launch-critical errors/events can be queried by session_id without exposing unnecessary PII. |

```text
Codex should produce read-only QA queries appropriate to the actual schema, for example:

-- duplicate active results
SELECT session_id, product, COUNT(*)
FROM diagnostic_results
WHERE status='active'
GROUP BY session_id, product
HAVING COUNT(*) > 1;

-- payment duplicate check
SELECT session_id, product, COUNT(*)
FROM payments
GROUP BY session_id, product
HAVING COUNT(*) > 1;

-- journey trace
SELECT event_name, product, current_stage, created_at
FROM journey_events
WHERE session_id = ?
ORDER BY id;
```

# 12. Payment and Entitlement Production Gate

> **Critical payment rule A return query parameter is never permanent proof of payment. Production entitlement becomes active only after verified Stripe server state through the accepted Worker confirmation/webhook contract.**

1. Verify each paid MVP product has the intended live Stripe object or approved live Payment Link.
1. Verify each live success URL points to the canonical production app path and includes only the accepted non-authoritative return context/session placeholder.
1. Verify cancel/failure returns preserve the GalviCare session and return to the correct product/paywall context.
1. Verify production STRIPE_SECRET_KEY and webhook secret are configured as encrypted Worker secrets, never repository values.
1. Verify the production webhook endpoint is the intended production Worker route and signature verification is active.
1. Verify product/price metadata mapping resolves to the correct GalviCare product.
1. Verify confirm_payment_return retrieves/verifies Stripe server-side when needed.
1. Verify delayed confirmation yields paid_pending rather than false failure or false access.
1. Verify refresh after entitlement returns the stored paid result without re-purchase.
1. Verify the production test-override action is disabled or impossible.
| Production payment test | Pass condition |
| --- | --- |
| Unpaid direct access | Locked; no paid data. |
| Live/test-mode separation | Production cannot accept QA test override or test key. |
| Verified success | Correct product entitlement active. |
| Replay return | No duplicate payment/result. |
| Wrong product/session | Cannot unlock another product or founder. |
| Pending | Visible pending/retry state, no permanent access until verified. |
| Failure/cancel | Preserves session; no entitlement. |

# 13. Session, Routing, Recovery, and Duplicate-Proof Gate

| Transition/state | Day 7 release assertion |
| --- | --- |
| Public entry | Carrd/public CTA enters one canonical production app entrypoint. |
| Session creation | New founder creates one session; reload does not create a second. |
| Downstream restore | Worker/D1 current_stage and stored results control restoration. |
| Continue | Each CTA has one effective runtime handler and one intended next state. |
| Stripe return | Server verification occurs before product restoration; never generic dead-end. |
| Back/refresh | No paid access loss, duplicate result or Triage restart for valid downstream session. |
| Unknown session | Controlled new-session/restart option; never attaches to another founder. |
| Worker failure | Visible structured recovery; no blank state/endless spinner. |
| Booking failure | Retry or contact fallback; Clinic/session record preserved. |
| Adapter failure | HubSpot/GA4/Clarity failure never blocks care. |

## 13.1 Runtime Duplicate-Proof Procedure

1. Identify the actual production-served HTML entry file.
1. Identify the one API/Worker base URL used by that entrypoint.
1. Search for duplicate CONFIG/API_URL blocks, redirect helpers, event listeners and stale HTML entry files.
1. Trace each critical click: rendered CTA → event handler → state write → Worker action → response → route/render.
1. Confirm no second handler can control the same critical transition.
1. Confirm Carrd embed/direct URL and GitHub Pages deployment resolve to the same canonical app.
1. Record evidence; do not delete archival files solely for cleanliness.
# 14. FCD Operating Readiness and Rehearsal

The launch is operationally successful only if the FCD can function as a coherent diagnostic upsell discussion rather than a technical demo.

| Before discussion | During discussion | After discussion |
| --- | --- | --- |
| Open founder summary; confirm session, reason for visit, score, priority findings and recommended next product. | Use the clinical flow: reason for visit → Vitals/Score → findings → meaning → pathway → treatment decision. | Save facilitator notes, objection, clinical decision, next action and follow-up date. |
| Confirm correct payment and booking links are available. | Do not demo every feature; focus on founder condition and next care decision. | Check D1 events/payment status; use documented HubSpot manual recovery only if adapter failed. |
| Have launch-support/rollback checklist available. | Use outputs as evidence; keep hypotheses/assumptions appropriately qualified. | Move defects/objections to backlog; do not alter production live during discussion unless P0 rollback is required. |

## 14.1 Exact 15-Minute FCD Rehearsal

1. Open with the founder’s reason for visit: summarize the concern they reported.
1. Confirm the GalviVitals/GalviScore health picture without overloading them with numbers.
1. Use GalviShot to name the highest-priority evidence-based findings.
1. Use GalviSight to explain what the findings mean, relevant risks/opportunities and urgency.
1. Use Chart Your GalviPath to show the appropriate sequence of care and immediate objective.
1. Present GalviClinic as the treatment-plan discussion/intervention when clinically indicated, not as unrelated consulting.
1. Close on one next-care decision: self-guided path, obtain the next diagnostic, or book GalviClinic.
1. Capture confirmed/rejected finding, new observation, objection, decision, next action and follow-up date.
## 14.2 FCD Launch Blockers

- Facilitator must search Airtable/HubSpot/multiple unrelated tabs to explain the founder.
- Summary exposes another founder or lacks authorization.
- Stored evidence cannot support the findings/pathway shown.
- Payment or booking next step cannot be reached from the live journey.
- Facilitator capture changes historical result instead of adding learning evidence.
# 15. Print / PDF and Customer Record QA

| Record requirement | Pass condition |
| --- | --- |
| Products | Representative paid GalviShot, GalviSight and GalviPath records are printable. |
| Content | Founder/venture, product, generated date, confidence, result, assumptions, rules_version and disclaimer appear where applicable. |
| Exclusions | Navigation, paywalls, QA ribbons, debug controls and nonessential buttons do not print. |
| Pagination | No clipped headings/tables; logical page breaks. |
| Privacy | No hidden admin data, raw tokens, unrelated founder records or technical stack detail. |
| Usability | Browser Print → Save as PDF is sufficient; no new paid PDF service is introduced. |

# 16. Observability, Analytics, and Error Monitoring

Observability must help launch diagnosis without becoming a customer-path dependency.

| Signal | Required Day 7 evidence |
| --- | --- |
| Worker health | Production health action returns environment=production, DB bound/healthy, valid JSON and no secret leakage. |
| D1 events | Critical funnel events query by session_id and appear in correct order. |
| D1 errors | Recoverable adapter/API failures write safe diagnostic records where supported. |
| GA4 | Critical funnel events fire on public production path; failure cannot block journey. |
| Clarity | Loads on production path where approved; failure non-blocking. |
| HubSpot | Production adapter works or documented manual recovery is ready. |
| Stripe | Payment/entitlement status is reconciled server-side. |
| Browser console | No uncaught errors on public happy path. |
| Network | No calls to QA Worker/D1 endpoints; no secret-bearing browser requests. |

## 16.1 Canonical Funnel Events to Verify

- galvicare_started
- triage_started / triage_submitted
- diagnostic_viewed
- paywall_viewed
- clinical_followup_viewed / clinical_followup_submitted
- stripe_click / stripe_success
- continue_clicked
- clinic_booking_clicked
- journey_error
- fcd_reviewed
# 17. Production Environment Configuration Contract

> **Production is configured from the tested QA contract Do not “improve” production while copying it. Production should differ only by approved environment-specific resources: D1 database/binding, Worker environment flag, encrypted secrets, approved CORS origins, live Stripe objects/webhook and public URLs.**

1. Create or verify the production D1 database identified by the implementation guide.
1. Apply the exact tested non-destructive schema and indexes. Record each applied migration.
1. Bind production Worker to production D1 using the same binding name expected by tested code.
1. Set ENVIRONMENT=production.
1. Set FIXTURE_MODE=false.
1. Set ALLOW_TEST_OVERRIDE=false or ensure the test action is unreachable in production.
1. Configure production Stripe secret(s) and webhook secret(s) only through encrypted Worker secrets.
1. Configure production HubSpot token only if the accepted direct integration is stable; otherwise use the documented manual recovery fallback.
1. Set production CORS allowlist to the real Carrd and GitHub Pages production origins only.
1. Deploy production Worker candidate; run health and safe read-only actions before public frontend cutover.
1. Deploy frontend to a production-candidate URL using only the production Worker/public live-link config delta.
1. Verify browser network traffic contains no QA endpoints.
1. Do not update the public Carrd embed/CTA yet.
| Production variable | Required state |
| --- | --- |
| ENVIRONMENT | production |
| FIXTURE_MODE | false |
| ALLOW_TEST_OVERRIDE | false / hard-disabled |
| D1 binding | production database |
| CORS | approved production origins only |
| Stripe mode | live for controlled production verification |
| Secrets | encrypted Worker secrets only |
| Frontend API base | production Worker only |
| Analytics IDs | approved production configuration |

# 18. Controlled Production Cutover Sequence

The order below is mandatory because it preserves a recoverable known-good public state until the production candidate is proven.

| Order | Action | Verification | Rollback if failed |
| --- | --- | --- | --- |
| 1 | Freeze candidate and release ledger. | SHA/tag known. | Do not proceed. |
| 2 | Verify production D1/schema/binding. | Health/read-only checks pass. | Unbind/revert config; no public impact. |
| 3 | Deploy production Worker candidate. | Valid JSON, CORS, environment headers, safe actions. | Restore prior Worker deployment. |
| 4 | Configure encrypted production secrets and live Stripe webhook/link return. | Server verification path passes safe checks. | Restore prior secret/config/webhook state. |
| 5 | Deploy production frontend candidate to non-public candidate URL. | No QA endpoint; no console errors; core free path works. | Restore prior frontend artifact. |
| 6 | Run no-payment production smoke through GalviVitals/GalviScore. | Session/result/events correct. | Rollback candidate; public remains unchanged. |
| 7 | Run controlled production transaction. | Payment→entitlement→result→next state reconciles. | Rollback affected public/payment path; investigate offline. |
| 8 | Human GO for public cutover. | Evidence complete. | Stop if not approved. |
| 9 | Update Carrd/public CTA/embed to canonical production app. | Public entry reaches production candidate. | Restore prior Carrd target. |
| 10 | Run public smoke and FCD rehearsal. | All launch gates pass. | Rollback public entry and/or Worker/frontend as needed. |

# 19. Controlled Production Transaction

> **Do not improvise a real-money test Use the implementation guide’s approved controlled low-value live transaction or another explicitly approved production verification method. The Human Product Owner must authorize the live transaction and any associated charge/refund handling before execution.**

1. Start from the production-candidate frontend using a clean/incognito session.
1. Complete the founder path to the paid product using sanitized test identity data appropriate for production validation.
1. Record session_id before checkout.
1. Confirm the checkout destination is the intended live Stripe object/product.
1. Complete the approved controlled transaction.
1. On return, confirm the app does not trust the URL alone and invokes the server payment confirmation path.
1. Confirm the Worker verifies the Stripe session/event and activates entitlement for the exact session + product.
1. Confirm D1 contains one payment record and one active product result, with no duplicate session.
1. Refresh the result and confirm entitlement/store retrieval persists.
1. Continue to the intended next product/state; confirm no generic confirmation dead-end.
1. Confirm canonical journey/stripe events were written.
1. Confirm HubSpot behavior succeeds or fails non-blockingly with recovery evidence.
1. Capture evidence sufficient to reconcile the transaction end-to-end.
1. Refund/reverse only according to the Human-approved operational procedure; do not alter code to erase the evidence.
| Evidence artifact | Must show |
| --- | --- |
| Frontend | Correct product, return state, session continuity. |
| Stripe | Successful approved transaction/session and product mapping. |
| Worker | Verified confirmation path; no client-only authority. |
| D1 payments | One payment/entitlement record. |
| D1 results | One active paid result for session+product. |
| D1 events | stripe_click, stripe_success and subsequent progression. |
| Refresh | Stored access persists. |
| Security | No secret/token exposed during flow. |

# 20. Carrd / Public Entry Cutover

1. Record the current public Carrd embed/CTA/direct-link value before changing it.
1. Confirm the production candidate has already passed the free-path smoke and controlled transaction.
1. Human Product Owner explicitly authorizes public cutover.
1. Change only the intended Carrd embed/CTA/direct target to the canonical production app URL.
1. Publish Carrd.
1. Open a new incognito browser and enter from the real public GalviPro route.
1. Confirm the browser reaches the production frontend, not QA or a stale duplicate path.
1. Confirm production Worker responses indicate production environment without exposing secrets.
1. Start a new session and reach at least the free GalviVitals/GalviScore milestone.
1. Confirm analytics/canonical event evidence appears.
1. Keep the prior Carrd value immediately available for rollback.
> **Public-entry rollback trigger If Carrd opens QA, a stale GitHub asset, a blank page, the wrong Worker, or a broken free journey, restore the prior Carrd target immediately before any further troubleshooting.**

# 21. Rollback Package and Rollback Rehearsal

| Rollback asset | Required contents / action |
| --- | --- |
| Frontend | Pre-release production artifact and last known-good Git commit/tag; one-command or documented restore. |
| Worker | Prior production Worker deployment/version/source and restore command/path. |
| D1 | Schema/migration ledger; additive migrations may remain inert when rollback is safer than destructive reversal. |
| Carrd | Previous embed URL/CTA/direct target. |
| Stripe | Existing live products/links remain available until new flow is proven; webhook/config change reversal documented. |
| Secrets/config | Before-state names/settings documented without recording secret values. |
| Operational fallback | Facilitator can use stored/printed outputs and manual booking/HubSpot update if a noncritical adapter fails. |

## 21.1 Rollback Rehearsal

1. Before public cutover, verbally and technically identify the exact reversal for each production change.
1. Prove the prior frontend artifact/tag can be redeployed or restored.
1. Prove the prior Worker version can be selected/redeployed.
1. Confirm D1 rollback does not require destructive deletion to recover the public experience.
1. Confirm prior Carrd target is copied and ready.
1. Confirm Stripe prior objects remain active or recoverable.
1. Time the rollback steps conceptually; any ambiguous step is a launch blocker.
1. Do not intentionally break production merely to rehearse. Use non-public candidate resources and documented restore commands.
# 22. Post-Cutover Production Smoke Test

| Gate | GO when | NO-GO / rollback when |
| --- | --- | --- |
| Frontend | No console errors; all required views/recovery states render. | Blank screen, syntax error, broken upstream product. |
| Backend | Core actions return valid JSON with correct CORS. | HTML error, wrong session, unsafe access. |
| Data | One active result per session+product; traceable record. | Duplicates, mismatched session IDs, lost answers. |
| Payment | Verified live entitlement and correct return. | URL flag alone unlocks or wrong product/session unlock. |
| Clinical logic | Golden cases remain credible and progressive. | Finding/meaning/pathway contradict one another. |
| FCD readiness | Facilitator can run discussion from one summary. | Requires reconstruction across systems. |
| Security | No exposed secrets/admin routes/test bypass. | Any credential or unrestricted record access visible. |
| Rollback | Known-good system can be restored quickly. | No tested recovery path. |

# 23. Launch-Day Operating Procedure

## 23.1 Before First Founder

- Confirm production health endpoint and D1 binding.
- Confirm public Carrd entry works in incognito.
- Confirm live Stripe link/product mapping and webhook/confirmation path are available.
- Open facilitator summary path and confirm authorization.
- Open rollback checklist and known-good references.
- Confirm Calendly/booking destination and fallback contact method.
- Confirm no new code is pending deployment.
## 23.2 During Live Founder Use

- Do not edit production code during the FCD for cosmetic issues.
- Record session_id for any real defect report.
- Use the visible recovery path rather than manual database repair when possible.
- For noncritical HubSpot/analytics failure, continue care and use the documented manual recovery.
- For payment/session/security P0, stop the affected paid path and execute rollback/no-go procedure.
## 23.3 After Each Initial FCD

- Save facilitator notes and next action.
- Check payment/entitlement and booking status when applicable.
- Review D1 journey/error evidence for the session.
- Capture objections/confusing language as backlog items.
- Do not change production rules from one founder’s feedback; learning candidates require human governance and a future versioned release.
# 24. Checkpoint Protocol and Human Evidence

| Checkpoint | Codex must return | Human evidence/action |
| --- | --- | --- |
| A — Before P0 regression | Candidate SHA, clean status, QA environment map, rollback assets, test list. | Approve candidate to test. |
| B — P0 complete | P0-01..12 result table with commands/screens/manual evidence and defects. | Approve security/accessibility stage. |
| C — Release candidate | Security, accessibility, data integrity, duplicate-route, payment test evidence. | Approve production configuration. |
| D — Pre-cutover production | Production Worker/D1/config/CORS/Stripe candidate verification and free-path smoke. | Approve controlled transaction. |
| E — Transaction | End-to-end transaction reconciliation, refresh persistence and next-state proof. | Approve public Carrd cutover. |
| F — Public smoke | Public entry/free path/analytics/console evidence. | Approve launch rehearsal. |
| G — Rollback/FCD | Rollback rehearsal proof and FCD rehearsal outcome. | Final GO / ROLLBACK. |

## 24.1 Human Evidence Pack

- Screenshot of GitHub candidate branch/SHA and clean status or Codex text evidence.
- Cloudflare production Worker environment name and D1 binding screen without secret values.
- Production health response showing production environment and valid JSON.
- Stripe controlled transaction evidence showing correct product/session status; redact sensitive payment information.
- GalviCare return screen and stored entitlement/result after refresh.
- D1 row/query evidence for session, payment, result and events.
- Public Carrd entry screenshot/URL behavior.
- FCD clinical summary screenshot with sanitized founder fixture.
- Print/PDF preview evidence.
- Final GO/BLOCK report and rollback ledger.
# 25. Codex One-Pass Day 7 Execution Prompt

```text
You are the GalviCare 0.5 Day 7 release implementation engineer.

AUTHORITATIVE GUIDE:
CODEX_DAY7_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md

MODE:
BOUNDED RELEASE EXECUTION.
Feature development is frozen.

PRIMARY OBJECTIVE:
Prove the accepted Day 6 candidate, prepare production safely, complete the authorized controlled production transaction, cut over the public entry only after proof, rehearse the live FCD operating procedure, and return a binary GO / ROLLBACK recommendation.

NON-NEGOTIABLES:
- No Make.
- No OpenAI.
- One Cloudflare Worker + D1 authority.
- Browser is presentation only.
- No proprietary rules, secrets, payment authority or facilitator authorization in browser code.
- Do not change accepted Day 2–5 clinical/payment semantics.
- Do not introduce a second route/session/payment authority.
- Do not use destructive production migration.
- Do not expose secret values in output.
- Do not deploy, merge, modify live Stripe, modify Carrd, or write production data until the corresponding Human approval gate is explicitly given.

PHASE 1 — RELEASE BASELINE
1. Confirm accepted Day 6 candidate SHA, branch/worktree, git status and QA deployment.
2. Create/confirm immutable release-candidate tag/reference.
3. Confirm rollback artifacts.
4. Return CHECKPOINT A. Stop for Human approval if not already provided.

PHASE 2 — P0 REGRESSION
Run P0-01 through P0-12 exactly as defined.
Also rerun Day 6 route/state/Stripe-return/duplicate/print/FCD regressions.
For every failure, isolate the smallest defect and apply only a bounded P0/P1 correction after authorization.
Return a result table with evidence.

PHASE 3 — RELEASE ASSURANCE
Run:
- security source/network scan;
- production-test-bypass scan;
- CORS/action-allowlist/facilitator-access review;
- accessibility/trust checklist;
- D1 duplicate and traceability queries;
- payment authority/entitlement checks;
- route/config duplicate audit.
Return CHECKPOINT C.

PHASE 4 — PRODUCTION CANDIDATE CONFIGURATION
After Human approval:
- verify/create production D1;
- apply exact tested non-destructive schema;
- bind production Worker;
- set ENVIRONMENT=production;
- ensure FIXTURE_MODE=false and ALLOW_TEST_OVERRIDE=false;
- configure encrypted production secrets;
- verify production CORS allowlist;
- verify live Stripe product/link/webhook/return mapping;
- deploy production Worker candidate;
- deploy frontend to a non-public production-candidate URL;
- run production health + free-path smoke.
Do NOT change public Carrd yet.
Return CHECKPOINT D.

PHASE 5 — CONTROLLED PRODUCTION TRANSACTION
Only after explicit Human authorization:
- run the approved controlled production transaction;
- reconcile Stripe server verification, entitlement, payment row, active result, session state and events;
- refresh and prove entitlement persistence;
- prove correct next route;
- prove no duplicate payment/result.
Return CHECKPOINT E.
Do not include sensitive payment data in the report.

PHASE 6 — PUBLIC CUTOVER
Only after explicit Human authorization:
- record prior Carrd target;
- update only the canonical Carrd embed/CTA/direct target;
- publish;
- run public incognito smoke from GalviPro entry;
- verify production frontend/Worker, free journey, analytics and console.
Return CHECKPOINT F.

PHASE 7 — ROLLBACK + FCD REHEARSAL
- verify rollback steps are immediately executable;
- rehearse one complete 15-minute FCD using protected clinical summary;
- verify facilitator capture, print, payment/booking links and fallback;
- record only launch-blocking defects.

FINAL REPORT:
Return:
A. candidate SHA and release tag
B. files/configs changed
C. P0 matrix results
D. security/accessibility/data integrity results
E. production environment verification
F. controlled transaction reconciliation
G. public cutover evidence
H. rollback evidence
I. FCD rehearsal evidence
J. known P2/P3 limitations
K. final recommendation: GO or ROLLBACK/BLOCK
L. exact reasons

If any payment, session-continuity, clinical-result-integrity, public-route, security or rollback gate fails, recommend ROLLBACK/BLOCK. Do not redesign the product.
```

# 26. Human Product Owner Verification

| Human verification | Pass question |
| --- | --- |
| Product | Does every step provide distinct value and create a clinically logical next decision? |
| Clinical logic | Can each score/finding/meaning/pathway/treatment be traced to stored evidence and a rule version? |
| Engineering | Can the journey recover from refresh, duplicate requests, adapter failures and delayed payment confirmation? |
| Security | Are secrets/server logic/privileged actions protected and all production test bypasses disabled? |
| Commercial | Does the next paid diagnostic or GalviClinic step feel clinically necessary rather than arbitrary? |
| Operations | Can the FCD be conducted and closed from one protected clinical summary? |
| Payment | Did the controlled production transaction reconcile end-to-end with verified entitlement? |
| Release | Have all P0 tests passed, public smoke passed and rollback been rehearsed? |

> **Final authority The Human Product Owner—not Codex—authorizes the production launch. Codex provides evidence and a recommendation; it does not self-authorize live deployment or commercial release.**

# 27. Pull Request / Release Record / Tagging

## 27.1 Required PR / Release Title

GalviCare 0.5 Day 7 — full QA, production cutover and FCD launch readiness

## 27.2 Required Release Record

```text
## Release candidate
SHA:
Tag:
Branch/worktree:

## Scope
- P0 regression
- security/accessibility/data integrity
- production environment configuration
- controlled production transaction
- Carrd/public entry cutover
- observability
- rollback rehearsal
- FCD launch rehearsal

## Explicit exclusions
- No new features
- No Make
- No OpenAI
- No Day 2–5 semantic redesign
- No destructive migration
- No browser proprietary logic
- No production test override

## Changed files
[List exact files and purpose.]

## Production configuration delta
[Worker / D1 / CORS / frontend config / Stripe / Carrd / adapters.]

## P0 results
[Table P0-01..P0-12.]

## Security/accessibility/data
[Evidence.]

## Controlled production transaction
[Redacted reconciliation evidence.]

## Public cutover
[Before/after target and smoke evidence.]

## Rollback
[Exact assets and reversal steps.]

## FCD rehearsal
[Outcome.]

## Known limitations
[P2/P3 only.]

## Final recommendation
GO / ROLLBACK / BLOCK with reasons.
```

# 28. Final Codex Report Template

| Report section | Required content |
| --- | --- |
| 1. Executive status | GO / ROLLBACK / BLOCK and one-paragraph rationale. |
| 2. Candidate identity | SHA, tag, branch, deployed versions. |
| 3. Change ledger | Every code/config/environment change and purpose. |
| 4. P0 regression | P0-01..P0-12 exact result/evidence. |
| 5. Security | Browser boundary, secrets, CORS, privileged actions, payment authority, test bypass. |
| 6. Accessibility/trust | Checklist and bounded fixes. |
| 7. Data integrity | Duplicate, traceability, stored retrieval, event evidence. |
| 8. Production config | Worker/D1/frontend/Stripe/Carrd/adapters. |
| 9. Controlled transaction | Redacted end-to-end reconciliation. |
| 10. Public smoke | Carrd → frontend → Worker → free path. |
| 11. FCD rehearsal | Protected summary, flow, facilitator capture, print, booking. |
| 12. Rollback | Assets, rehearsal and trigger conditions. |
| 13. Known limitations | P2/P3 only. |
| 14. Human approvals | Gates explicitly received. |
| 15. Final recommendation | GO only if every launch-critical gate passes. |

# 29. Day 7 Release Decision and Post-Launch Handoff

> **Day 7 release decision Release GalviCare 0.5 for FCD clinical diagnostic upsell discussions only after every P0 test passes. A noncritical external adapter may launch with a documented manual fallback. If payment, session continuity, clinical-result integrity, public routing, security or rollback fails, do not launch the affected path.**

## 29.1 Immediate Post-Launch Handoff

- Production release SHA/tag and deployment versions.
- Public Carrd/app URL and production Worker identity.
- Production D1 migration/schema ledger.
- Stripe live mapping and webhook/confirmation path documentation without secret values.
- Known P2/P3 backlog.
- Launch support/rollback runbook.
- First-week FCD operating checklist.
- First-week evidence review: conversion, payment, recovery errors, objections and learning candidates.
- Explicit rule: no production rule changes from anecdotal founder feedback without governed review and a new version.
# Appendix A. P0 Test Scripts

## P0-01 — New high-confidence founder

Procedure: Complete full intake and downstream diagnostics using the normal QA journey.

Pass: Correct outputs; minimal follow-up; one session; correct next states.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-02 — Low-confidence founder

Procedure: Omit/contradict context and complete targeted follow-ups.

Pass: Only relevant follow-ups; confidence recalculates; no fabricated certainty.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-03 — Stripe paid journey

Procedure: Complete one Stripe Test Mode payment on approved paid path.

Pass: Server-verified entitlement; correct stored result; correct return state.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-04 — Unpaid access

Procedure: Call paid product action directly without entitlement.

Pass: Locked response; no paid result exposed.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-05 — Duplicate/refresh

Procedure: Refresh result, replay Continue, and replay Stripe return.

Pass: One session; one payment; one active result per product; no restart to Triage.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-06 — Worker error

Procedure: Use invalid action or approved safe failure.

Pass: Visible recovery; structured JSON; session preserved; no blank screen.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-07 — HubSpot failure

Procedure: Disable/break QA adapter safely.

Pass: Customer journey completes; D1/error evidence exists.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-08 — Mobile

Procedure: Run iPhone-width and actual iOS browser when available.

Pass: No horizontal scroll; controls usable; no hidden required CTA.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-09 — Incognito/session

Procedure: Run independent incognito journey.

Pass: New session works with no dependency on prior cache.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-10 — FCD facilitator

Procedure: Open protected summary and perform 15-minute rehearsal.

Pass: Evidence, meaning, pathway, treatment and commercial status explainable from one view.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-11 — Print

Procedure: Print representative GalviShot, GalviSight and GalviPath records.

Pass: Readable/branded; no nav/paywall/QA controls; required metadata/disclaimer present.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

## P0-12 — Security

Procedure: Inspect source, network, CORS and privileged actions.

Pass: No exposed secrets/proprietary logic/unrestricted admin or client-side entitlement authority.

Codex evidence required: exact command/manual steps, session_id, relevant response/status, D1/Stripe/event proof where applicable, and any screenshot instruction for the Human Product Owner.

# Appendix B. Production Change Ledger

| Sequence | Layer | Before state | Approved change | Verification | Rollback | Human approval |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Git/frontend |  |  |  |  |  |
| 2 | Worker deployment |  |  |  |  |  |
| 3 | D1 binding/schema |  |  |  |  |  |
| 4 | Worker variables/secrets |  |  |  |  |  |
| 5 | CORS |  |  |  |  |  |
| 6 | Stripe live objects/webhook |  |  |  |  |  |
| 7 | Frontend production config |  |  |  |  |  |
| 8 | Carrd public target |  |  |  |  |  |
| 9 | Analytics/adapters |  |  |  |  |  |

# Appendix C. Release Evidence Pack

| Folder | Minimum artifacts |
| --- | --- |
| 00-baseline | Candidate SHA/tag, git status, QA deployment/version, Day 6 handoff. |
| 01-p0-regression | P0 result table, session IDs, relevant console/API/D1 evidence. |
| 02-security | Source/network scan summary, CORS/privileged-action/test-bypass evidence. |
| 03-accessibility | Checklist and any bounded fixes. |
| 04-data-integrity | Duplicate/traceability queries and results. |
| 05-production-config | Worker/D1/env/CORS/Stripe/frontend candidate evidence. |
| 06-controlled-transaction | Redacted Stripe + entitlement + D1 + return/refresh reconciliation. |
| 07-public-cutover | Prior/new Carrd target and public smoke. |
| 08-rollback | Artifact list and rehearsal proof. |
| 09-fcd-rehearsal | Summary view, rehearsal checklist, facilitator capture, print. |
| 10-final-report | Release record, known limitations, final GO/BLOCK. |

# Appendix D. Critical-Path Defect Response Template

```text
DEFECT ID:
Observed environment:
Severity: P0 / P1 / P2 trust-breaking / P3

Failed acceptance criterion:
Observed evidence:
Supported root cause:
Smallest affected file/config/resource set:
Previously accepted contract affected? YES / NO
Proposed targeted correction:
Production/public impact:
Exact re-test:
Rollback required? YES / NO
Human authorization required before action? YES / NO
Result after re-test:
Disposition: RESOLVED / BLOCK / ROLLBACK / DEFER
```

> **Defect discipline Do not broaden scope because a test failed. Fix the acceptance criterion or block the release.**

# Appendix E. Explicit Deferred Backlog

- AI/OpenAI narrative generation or autonomous learning.
- Make scenarios or additional workflow orchestration.
- Native mobile application.
- Enterprise SSO / broad role-based staff administration.
- Full historical Airtable migration.
- Self-service rules editor.
- Complex HubSpot workflow automation that can threaten the care path.
- Automated file/transcript ingestion.
- Multi-tenant architecture.
- Paid PDF-generation service.
- Cosmetic redesign, noncritical analytics expansion and repository-wide refactor.
- Any new product capability not required to make the existing 0.5 journey safe, transactional and operational.
> **Permanent GalviSecurity principles 1) The browser should display intelligence—not contain intelligence. 2) Assume every line of browser code is public. Permanent engineering principle: nothing proprietary should execute in the browser unless it is presentation logic.**
