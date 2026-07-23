GALVICARE™ 0.5 DAY 6 BUILDER GUIDE --- CODEX IMPLEMENTATION ENGINEER
EDITION Full Journey Integration • FCD Operating View • Experience QA

  ---------------------------------------------------------------------------------------------
  Contract field                      Day 6 locked value
  ----------------------------------- ---------------------------------------------------------
  File                                CODEX_DAY6_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md

  Release                             GalviCare 0.5 Day 6

  Build theme                         Integrate • Restore • Explain • Recover • Prove

  Execution target                    One concentrated QA build session; one discovery pass;
                                      one bounded implementation pass

  Architecture                        No Make • No OpenAI • One Cloudflare Worker + D1 •
                                      Browser presentation only

  Day 6 objective                     Make the entire GalviCare journey behave as one
                                      continuous clinical system and give the facilitator one
                                      coherent operating view.

  Authority                           Human Product Owner approval required before
                                      implementation, merge, production deployment, live secret
                                      changes, or production data changes.
  ---------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  CRITICAL-PATH DIRECTIVE`<br>`{=html}Day 6 is an integration and
  stabilization day, not a redesign day. Codex must repair only the
  smallest set of defects that prevent the founder from moving through
  the existing journey or prevent the facilitator from operating the FCD.
  No speculative architecture, no repository-wide cleanup, no repeated
  discovery cycles, and no cosmetic backlog work.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

Prepared for GalviPro / GalviStudio \| July 2026 \| Secure +
Learning-Ready

# Table of Contents

1.  Document Purpose and Day 6 Mission
2.  Critical-Path Operating Model and Timebox
3.  Lessons Carried Forward from Days 1--5
4.  Release Gate, GO/BLOCK Criteria, and Prohibitions
5.  Preconditions and Repository Readiness
6.  Codex Discovery Prompt and Human Approval Gate
7.  Locked Day 6 Architecture and Route Authority
8.  Universal Screen Pattern
9.  Session and State Restoration Contract
10. Duplicate Route / Duplicate Asset Elimination
11. Recovery-State Engineering
12. FCD Clinical Summary and Facilitator Capture
13. Print / PDF Record Contract
14. Analytics and Canonical Event Contract
15. Mobile / Desktop Experience Contract
16. Security and Browser-Presentation Boundary
17. Additive D1 / Worker Contract
18. Golden QA Fixtures and Full Journey Matrix
19. Checkpoint Protocol and Required Evidence
20. Codex One-Pass Implementation Prompt
21. Human Product Owner Verification
22. Pull Request, Rollback, and Day 7 Handoff
23. Codex Final Report Template and Final Authority

  -----------------------------------------------------------------------
  Source alignment`<br>`{=html}This Day 6 guide carries forward the 7-Day
  Implementation Guide's Day 6 mandate: Carrd/app routing, analytics, FCD
  view, print, recovery, and full desktop/mobile journey completion with
  no manual data repair. It also preserves the Day 5 Codex operating
  model: one discovery-only report, one authorization, bounded
  implementation, checkpoint tests, targeted corrections, and a binary
  GO/BLOCK recommendation.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 1. Document Purpose and Day 6 Mission

This document is simultaneously: 1. the Human Product Owner supervision
runbook for Day 6; 1. Codex's authoritative Day 6 engineering
contract; 1. the journey-integration, experience-QA, analytics,
FCD-view, recovery, print and rollback plan; 1. the formal handoff from
the accepted Day 5 QA build to Day 7 release QA and production cutover.
Repository reality controls exact file paths, function names, deployment
commands and current schema. This guide controls scope, integration
semantics, state authority, security boundaries, acceptance, evidence
and prohibited behavior. When repository reality conflicts with this
guide, Codex must stop and report the conflict instead of improvising.

  -----------------------------------------------------------------------
  Area                                Day 6 required release behavior
  ----------------------------------- -----------------------------------
  Full customer journey               Welcome → GalviTriage → GalviVitals
                                      → GalviScore → GalviShot →
                                      GalviSight → Chart Your GalviPath →
                                      GalviClinic behaves as one
                                      continuous session.

  Routing                             Every Continue, Unlock, Stripe
                                      return, booking and recovery CTA
                                      lands on the intended next state;
                                      no loop back to the initial
                                      GalviTriage page unless the session
                                      is actually incomplete.

  State authority                     Worker/D1 session state and
                                      verified entitlements are
                                      authoritative. Browser state may
                                      assist presentation but may not
                                      override server truth.

  FCD operating view                  One protected summary lets the
                                      facilitator explain reason for
                                      visit, health, findings, meaning,
                                      pathway, treatment and commercial
                                      status without searching multiple
                                      systems.

  Recovery                            Refresh, back navigation, Stripe
                                      returns, provider failures and
                                      recoverable API errors preserve the
                                      session and return the founder to
                                      the correct repair point.

  Print                               Paid diagnostic results produce
                                      readable browser Print → Save as
                                      PDF records with customer-facing
                                      content and without
                                      navigation/paywall/QA controls.

  Analytics                           GA4, Clarity and canonical D1
                                      events cover the critical funnel
                                      and never block care.

  Learning readiness                  Minimal facilitator capture stores
                                      confirmed/rejected findings and new
                                      observations without adding
                                      transcription, AI or file-ingestion
                                      automation.

  Regression                          Accepted Days 1--5 logic, stored
                                      results, Stripe verification,
                                      entitlement, booking, CORS and
                                      security boundaries remain
                                      unchanged.
  -----------------------------------------------------------------------

## 1.1 Day 6 Single Release Objective

  -----------------------------------------------------------------------
  Single objective`<br>`{=html}A founder can start from the
  GalviPro/Carrd entry point and reach the appropriate end of the
  GalviCare pathway on desktop, mobile-width and incognito without a
  blank screen, duplicate session, wrong redirect, false paywall, or
  manual data repair; meanwhile the facilitator can open one protected
  summary and conduct a coherent clinical diagnostic upsell discussion.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 1.2 What Day 6 Is Not

-   Not a rewrite of index.html, the Worker, GalviEngine rules, payment
    logic or the data model.
-   Not a Day 7 production cutover.
-   Not a UI beautification sprint.
-   Not an admin portal, role-based permissions project, historical
    Airtable migration, native mobile build, transcription workflow or
    AI feature.
-   Not a reason to revisit accepted Day 2 scoring, Day 3 findings, Day
    4 interpretation/pathway or Day 5 payment/Clinic semantics.

# 2. Critical-Path Operating Model and Timebox

## 2.1 Permitted Workflow

  -----------------------------------------------------------------------
  Operating model`<br>`{=html}Builder Guide → one discovery-only report →
  one Human Product Owner authorization → one bounded QA implementation →
  checkpoint tests → Codex self-review → one human live QA pass → GO /
  BLOCK decision.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

No repeated discovery loop is permitted unless repository reality
materially changes after the approved discovery report. No failed test
justifies restarting Day 6. Codex must isolate the exact failed
acceptance criterion and apply one targeted correction. \## 2.2
Concentrated Timebox

  --------------------------------------------------------------------------------------------------------
  Elapsed target    Checkpoint        Codex output                                     Human action
  ----------------- ----------------- ------------------------------------------------ -------------------
  0:00--0:25        Discovery         Consolidated                                     Approve once or
                                      route/state/asset/FCD/analytics/print/recovery   block.
                                      map; changed-file plan; READY/BLOCKED.           

  0:25--0:45        Contracts         Final route matrix, state restoration            Approve integration
                                      precedence, FCD summary contract, event map,     semantics.
                                      recovery and print contract.                     

  0:45--1:40        Backend + state   Minimal Worker/D1 additions; session             Review exact test
                                      summary/facilitator actions; state restoration   output.
                                      tests; no business-logic rewrites.               

  1:40--2:20        Frontend          Canonical routing, duplicate-route cleanup,      Confirm browser
                    integration       universal screen recovery, FCD view, print CSS,  presentation-only
                                      analytics wiring.                                boundary.

  2:20--2:50        Full journey QA   Three founders; desktop/mobile/incognito;        Perform one live QA
                                      payment return; refresh/back; print; FCD         pass.
                                      rehearsal; Days 1--5 regression evidence.        

  2:50--3:00        PR recommendation Reviewable diff, rollback, Day 7 handoff,        Independent
                                      GO/BLOCK reasons.                                approval decision.
  --------------------------------------------------------------------------------------------------------

## 2.3 Failed-Test Rule

For every failed test, Codex must return exactly: - the failed
acceptance criterion; - the smallest affected file set; - the observed
evidence and supported root cause; - the targeted correction; - the
exact re-test command or manual step; - whether the correction changes
the approved Day 6 scope.

  -----------------------------------------------------------------------
  Do not reopen the architecture`<br>`{=html}A single routing, analytics,
  print, recovery or FCD-view defect must never trigger a Worker
  replacement, framework migration, route-system rewrite, UI rewrite, new
  database, new Worker or broad refactor.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 3. Lessons Carried Forward from Days 1--5

  -----------------------------------------------------------------------
  Lesson learned                      Day 6 engineering rule
  ----------------------------------- -----------------------------------
  Duplicate files/routes can produce  Codex must perform one explicit
  contradictory behavior even when an duplicate-route/duplicate-config
  individual file appears correct.    audit before editing and establish
                                      one canonical owner for each
                                      journey transition.

  A correct redirect in one place is  Trace the actual click → handler →
  insufficient when a second handler, URL/state → route → render chain
  stale branch asset or duplicate     for every critical CTA. Remove or
  HTML path can win at runtime.       disable conflicting QA-path
                                      handlers only after evidence.

  Stripe success must continue the    Process Stripe return first; verify
  customer journey, not fall to a     entitlement server-side; then
  generic confirmation screen or      restore the authoritative
  restart GalviTriage.                stage/result. Never route an
                                      already-valid paid session back to
                                      Welcome/Triage.

  Repeated broad troubleshooting      One discovery report only. After
  creates build delay.                approval, use targeted edits and
                                      targeted re-tests.

  The frontend must display           No proprietary rules, server
  intelligence, not contain           product maps, secret tokens,
  intelligence.                       payment authority or facilitator
                                      authorization logic in browser
                                      code.

  Refresh/back/incognito expose       State restoration is a first-class
  hidden state defects.               release criterion, not a late QA
                                      check.

  A working screen is not enough if   Every result and paywall must have
  the founder cannot progress to the  one explicit next-state contract.
  next screen.                        

  Non-blocking adapters must remain   HubSpot, GA4 and Clarity failure
  non-blocking.                       cannot block core customer-facing
                                      persistence or navigation.

  The FCD is a diagnostic upsell      Day 6 must provide one coherent
  conversation, not a hunt across     facilitator summary and minimal
  tools.                              note capture.

  P2 polish can consume the critical  Fix only P0/P1 defects or
  path.                               trust-breaking P2 defects on Day 6.
  -----------------------------------------------------------------------

## 3.1 Critical-Path Severity Definitions

  -----------------------------------------------------------------------
  Priority                Definition              Day 6 action
  ----------------------- ----------------------- -----------------------
  P0                      Journey cannot          Fix immediately; blocks
                          complete; paid access   Day 6.
                          lost; wrong             
                          founder/session shown;  
                          security/payment        
                          authority bypass; blank 
                          screen at a required    
                          step.                   

  P1                      Core journey completes  Fix on Day 6.
                          only with manual        
                          repair; wrong redirect; 
                          stale stage;            
                          facilitator cannot      
                          explain care path;      
                          mobile control          
                          unusable; print record  
                          unusable.               

  P2 trust-breaking       Copy/layout defect      Fix only if bounded.
                          materially reduces      
                          trust or causes a       
                          likely wrong customer   
                          decision.               

  P2 cosmetic / P3        Spacing, minor styling, Defer.
                          noncritical refactor,   
                          nice-to-have analytics  
                          or admin convenience.   
  -----------------------------------------------------------------------

# 4. Release Gate, GO/BLOCK Criteria, and Prohibitions

## 4.1 Day 6 GO

-   Three rehearsed QA founders complete the full intended journey from
    Welcome through the correct GalviClinic booking/end state.
-   Desktop, iPhone-width and incognito paths preserve the same session
    and do not require manual data repair.
-   Refresh, browser back and Stripe return restore the correct
    stage/result instead of creating a new session or returning to
    GalviTriage incorrectly.
-   Every critical CTA has exactly one effective route owner and no
    runtime duplicate handler conflict.
-   One protected FCD summary exposes the complete clinical progression
    needed for a 15-minute diagnostic discussion.
-   Minimal facilitator capture can save confirmed/rejected findings and
    new observations without exposing founder records publicly.
-   Paid result print/PDF is readable and excludes navigation, paywall
    controls, QA ribbons and nonessential buttons.
-   GA4/Clarity and D1 canonical events exist for the critical funnel
    and fail non-blockingly.
-   Days 1--5 regression passes, including Stripe verification,
    entitlement persistence, Clinic booking and HubSpot recovery.
-   Rollback and Day 7 handoff are complete. \## 4.2 Day 6 BLOCK
-   A founder can be routed to the wrong product, wrong stage, generic
    dead-end confirmation page, or initial GalviTriage after a valid
    downstream state exists.
-   Refresh or back navigation creates a second session or loses
    verified entitlement.
-   Duplicate HTML, config, route handlers or event listeners remain
    capable of controlling the same critical transition.
-   FCD view requires Airtable, HubSpot, multiple unrelated tabs, memory
    or manual record stitching to explain the founder's condition.
-   Facilitator route is publicly enumerable without the approved
    protection available in the repository.
-   Client code contains secrets, proprietary GalviEngine logic, server
    product maps or permanent entitlement authority.
-   Analytics/HubSpot/Clarity failure blocks the customer journey.
-   Day 2--5 accepted behavior regresses.
-   Codex proposes production deployment, live secret changes,
    destructive D1 migration or a new Worker. \## 4.3 Codex Is
    Explicitly Forbidden To
-   Change Day 2 question contracts, score weights, dimensions,
    normalization or rules versions.
-   Change Day 3 finding eligibility, ranking, evidence, confidence or
    stored result semantics.
-   Change Day 4 interpretation, urgency, pathway selection or 30/60/90
    protocol logic.
-   Change Day 5 payment verification, product mapping, entitlement
    authority, Clinic eligibility or booking semantics except for a
    proven Day 6 integration defect that preserves the same contract.
-   Recompute stored Day 2--5 outputs during route restoration.
-   Create a second Worker, second session authority, second route
    system or second canonical app entry point.
-   Add Make, OpenAI or Airtable writes to the customer execution path.
-   Apply destructive D1 migration or modify production D1.
-   Modify main/production branch, live Stripe mode, live secrets or
    production Carrd embed.
-   Refactor unrelated code for cleanliness.
-   Invent repository paths, IDs, URLs, secrets, current route names or
    event functions instead of discovering them.
-   Continue implementation when repository reality contradicts the
    approved plan.

# 5. Preconditions and Repository Readiness

## 5.1 Preconditions Carried Forward from Day 5

  -----------------------------------------------------------------------
  Prerequisite                        Required evidence
  ----------------------------------- -----------------------------------
  QA branch/worktree                  Accepted Day 5 code exists on the
                                      active QA branch/worktree.

  Day 5 release record                Server-verified Stripe payment,
                                      entitlement restore, Clinic record
                                      and booking path have passed.

  Session continuity                  The same session_id can reach
                                      GalviClinic from the Day 4/5 flow.

  Worker                              Exact deployed QA Worker source and
                                      action router are identifiable.

  D1                                  QA database, binding and migration
                                      commands are known.

  Frontend                            Exact GitHub Pages app entry file
                                      and runtime assets are
                                      identifiable.

  Carrd                               Current QA/embedded route and
                                      direct fallback link are known.

  Analytics                           GA4 ID and Clarity integration
                                      currently load in QA or known
                                      failure is documented.

  FCD data                            Stored Day 2--5 outputs can be
                                      retrieved for a known QA session.

  Fixtures                            At least high-confidence,
                                      low-confidence and payment/recovery
                                      sessions exist or can be created
                                      safely.

  Rollback                            Pre-Day-6 tag/branch/ZIP, Worker
                                      source copy and conservative D1
                                      rollback plan exist.
  -----------------------------------------------------------------------

## 5.2 Precondition Stop Gate

-   Stop before implementation if Day 5 is not accepted.
-   Stop if the deployed QA Worker or actual GitHub Pages app entry
    cannot be identified.
-   Stop if there are multiple possible production/QA app roots and
    Codex cannot determine which is actually served.
-   Stop if the authoritative session state cannot be identified.
-   Stop if the approved Stripe-return/entitlement path is not stable.
-   Stop if a destructive migration or production change appears
    necessary.
-   Stop if the only proposed solution is a broad frontend rewrite. \##
    5.3 Repository Readiness Checklist

  -----------------------------------------------------------------------
  Required item                       Evidence Codex must return
  ----------------------------------- -----------------------------------
  Active QA branch/worktree           Branch name, worktree path, git
                                      status, starting SHA.

  QA app entrypoint                   Exact served HTML path and GitHub
                                      Pages configuration.

  Critical frontend assets            JS/CSS files controlling routing,
                                      state, analytics, print and FCD
                                      view.

  Duplicate candidate inventory       Same/similar HTML files, route
                                      modules, redirect functions, CONFIG
                                      blocks, event handlers.

  QA Worker source                    Exact path and deployed QA
                                      environment.

  Worker action router                Path and function.

  D1 binding/schema                   Binding name, relevant
                                      tables/indexes, migration
                                      directory.

  Session authority                   get_session path/function and
                                      current_stage persistence behavior.

  Payment-return integration          Frontend handler, server
                                      confirmation action and route
                                      continuation.

  Entitlement restore                 Worker action, D1 source and
                                      frontend restore logic.

  Carrd entry                         Current embed/direct URL and app
                                      landing behavior.

  FCD summary                         Existing route/action/view or
                                      "absent".

  Facilitator notes                   Existing table/action or additive
                                      delta needed.

  Print CSS                           Current print styles or "absent".

  GA4/Clarity                         Exact integration files/functions
                                      and failure behavior.

  D1 journey events                   Table/write helper and existing
                                      event names.

  Tests                               Exact commands and test files.

  Rollback package                    Tag/branch/archive path and Worker
                                      rollback.

  Production exclusion                Evidence only QA
                                      bindings/URLs/secrets are in scope.
  -----------------------------------------------------------------------

# 6. Codex Discovery Prompt and Human Approval Gate

## 6.1 Codex Discovery Prompt --- Copy and Paste

``` text
You are the implementation engineer for GalviCare 0.5 Day 6.

MODE: DISCOVERY ONLY.

DO NOT:
- edit files;
- run destructive commands;
- apply migrations;
- change data;
- change secrets;
- deploy;
- merge;
- create a pull request;
- create a new Worker;
- start implementation.

Read CODEX_DAY6_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md and inspect the approved QA branch/worktree.

Return ONE consolidated discovery report containing:

1. Repository map and exact paths for the actual GitHub Pages app entrypoint; routing/navigation;
   session/local-state helpers; Stripe-return handler; Worker; D1; Carrd; FCD/facilitator view;
   facilitator notes; print CSS; GA4; Clarity; tests and deployment configuration.

2. The exact runtime customer journey:
   Welcome -> GalviTriage -> GalviVitals -> GalviScore -> GalviShot
   -> GalviSight -> Chart Your GalviPath -> GalviClinic / booking,
   including every paywall, unlock, Continue CTA, Stripe redirect/return,
   refresh restoration and error-recovery branch.

3. For every critical transition identify source screen, source file/function, handler,
   state written, Worker action, destination, and competing/duplicate handler if any.

4. Duplicate/conflict audit:
   duplicate HTML entry files; route/redirect functions; CONFIG/API URL blocks;
   event listeners; stale scripts; ambiguous QA vs production assets.
   Identify one canonical owner for every critical transition.

5. Current state-restoration algorithm:
   session_id loading; get_session; current_stage; stored paid results;
   Stripe return; refresh/back/incognito; new-session conditions;
   any route that can incorrectly send a valid downstream session to Welcome/Triage.

6. Current FCD operating capability:
   stored Vitals/Score/Shot/Sight/Path/Clinic retrieval; summary view; protection;
   facilitator notes; smallest additive delta for confirmed/rejected findings and new observations.

7. Current print/PDF behavior and defects.

8. Current analytics behavior:
   GA4/Clarity integration points; D1 journey-event helper; event names;
   duplicate/missing critical events; failure behavior.

9. Current mobile/desktop risks.

10. Existing automated tests and exact commands.

11. Every conflict between repository reality and this guide.

12. Proposed changed files with purpose, exact change, dependency, risk and rollback.

13. Exact implementation sequence and checkpoint test plan.

14. Binary conclusion:
   READY FOR ONE-PASS DAY 6 IMPLEMENTATION
   or BLOCKED with precise reasons.

Non-negotiable constraints:
- one existing Worker only;
- QA branch/worktree only;
- no Make, OpenAI or Airtable writes in customer path;
- Worker/D1 session state is authoritative;
- Stripe return parameters are signals, not payment proof;
- preserve Days 1–5;
- analytics and HubSpot remain non-blocking;
- additive D1 changes only;
- no production deployment;
- no broad rewrite;
- one canonical route owner per critical transition.

STOP after the report.
```

## 6.2 Human Discovery Approval Gate

  -----------------------------------------------------------------------
  Approval item                       Decision
  ----------------------------------- -----------------------------------
  Correct repository, QA branch,      APPROVE / BLOCK
  served app entry and Worker         
  identified                          

  Day 5 prerequisite is stable        APPROVE / BLOCK

  Full critical route map is accurate APPROVE / REVISE

  Duplicate/conflict audit identifies APPROVE / REVISE
  canonical owners                    

  State-restoration precedence is     APPROVE / REVISE
  correct                             

  Stripe return continues to          APPROVE / REVISE
  authoritative product state         

  FCD summary contract is             APPROVE / REVISE
  clinically/commercially correct     

  Facilitator capture is minimal and  APPROVE / REVISE
  learning-ready                      

  Print and analytics scope is        APPROVE / REVISE
  bounded                             

  Changed-file plan is smallest       APPROVE / REVISE
  reasonable set                      

  Tests cover journey, state, mobile, APPROVE / REVISE
  recovery, print, FCD and regression 

  One-pass implementation is          GO / NO-GO
  authorized                          
  -----------------------------------------------------------------------

# 7. Locked Day 6 Architecture and Route Authority

``` text
Carrd / GalviPro storefront
  -> GitHub Pages GalviCare app
  -> existing Cloudflare Worker action router
  -> Cloudflare D1 / GalviVault
  -> Stripe test mode (verified entitlement)
  -> Calendly / approved booking destination
  -> HubSpot (non-blocking)
  -> GA4 + Clarity + canonical D1 journey events

Facilitator:
  protected FCD summary route
  -> existing Worker
  -> D1 authoritative clinical file + facilitator notes
```

## 7.1 Route Authority Rule

  -----------------------------------------------------------------------
  One transition, one owner`<br>`{=html}For every critical CTA or return
  path, exactly one runtime function/handler must own the transition.
  Duplicate files may exist as backups, but they must not be referenced
  or registered in a way that can compete at runtime.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 7.2 Canonical Journey Contract

  --------------------------------------------------------------------------
  Stage                   Authoritative entry        Primary next-state
                          condition                  behavior
  ----------------------- -------------------------- -----------------------
  Welcome                 No valid session or        Create/resume session,
                          intentionally new journey. fire galvicare_started,
                                                     enter GalviTriage.

  GalviTriage             Session exists but         Complete/repair intake;
                          required triage is         submit to Worker;
                          incomplete.                continue to
                                                     GalviVitals.

  GalviVitals             Triage complete; free      Render stored/generated
                          result available.          Vitals; continue to
                                                     GalviScore.

  GalviScore              Score available or         Render authoritative
                          paid/preview contract      Score; continue to
                          satisfied.                 GalviShot/paywall
                                                     according to
                                                     entitlement/product
                                                     contract.

  GalviShot               Eligible/entitled or       Render stored finding
                          approved QA condition.     result; continue to
                                                     GalviSight.

  GalviSight              Eligible/entitled or       Render stored
                          approved QA condition.     interpretation;
                                                     continue to Chart Your
                                                     GalviPath.

  GalviPath               Eligible/entitled or       Render stored care
                          approved QA condition.     pathway; continue to
                                                     GalviClinic.

  GalviClinic             Authoritative Clinic       Render Clinic brief;
                          record + required          booking CTA; preserve
                          entitlement/eligibility.   session.

  Stripe return           Return signal + Stripe     Verify server-side
                          session identifier.        first; restore correct
                                                     verified
                                                     product/result; never
                                                     generic dead end.

  Recovery                Known session plus         Retry exact failed
                          recoverable failure.       action or route to
                                                     authoritative repair
                                                     point; preserve
                                                     session.
  --------------------------------------------------------------------------

## 7.3 Routing Precedence

1.  Stripe-return processing, when present and validly formatted,
    executes before ordinary stage restoration.
2.  Server-side payment verification/entitlement result determines
    paid-product access.
3.  get_session/D1 current_stage and authoritative stored product state
    determine the next render.
4.  An existing active entitlement + stored result routes to the result,
    not the paywall.
5.  An incomplete prerequisite routes to the exact repair point, not
    necessarily to GalviTriage.
6.  Only the absence of a valid session justifies creating a new session
    and showing Welcome.
7.  Browser localStorage may provide the session_id pointer; it may not
    independently determine paid access or clinical truth.

# 8. Universal Screen Pattern

Day 6 standardizes the experience without rewriting already-working
product screens. Codex must add only the missing elements necessary for
continuity and recovery.

  -----------------------------------------------------------------------
  Order                   Required screen element Purpose
  ----------------------- ----------------------- -----------------------
  1                       Progress/result         Confirms the founder
                          confirmation            has advanced and
                                                  reduces uncertainty.

  2                       What this product is    Explains the clinical
                                                  function.

  3                       Why it matters          Connects the product to
                                                  the founder's problem
                                                  and risk.

  4                       What is included        Makes the deliverable
                                                  tangible.

  5                       Clinical Follow-Up      Asks only minimum
                                                  needed questions when
                                                  the product contract
                                                  requires it.

  6                       Why the next product    Creates logical
                          matters                 clinical progression.

  7                       Unlock or continue CTA  Creates revenue or
                                                  advances care.

  8                       Processing/recovery     Protects trust during
                          state                   backend work.

  9                       Result + print +        Delivers value and
                          handoff                 prepares the next
                                                  discussion.
  -----------------------------------------------------------------------

## 8.1 Screen-State Requirements

  -----------------------------------------------------------------------
  State                               Required behavior
  ----------------------------------- -----------------------------------
  Loading                             Visible status, no duplicate
                                      request on accidental double click,
                                      session retained.

  Locked/paywall                      Explain product value; no protected
                                      result content leak; preserve
                                      session/product.

  Payment pending                     Explain verification in progress;
                                      offer bounded retry; do not falsely
                                      unlock.

  Result                              Render authoritative stored schema;
                                      display next action; print where
                                      required.

  Needs follow-up                     Ask only approved context
                                      questions; do not restart the full
                                      intake.

  Facilitator review                  Explain that the record needs
                                      review; preserve clinical file and
                                      session.

  Recoverable error                   Safe message, session ID or support
                                      reference, retry action; never
                                      blank screen.

  Booking unavailable                 Visible contact/manual follow-up
                                      fallback; Clinic record remains
                                      available.
  -----------------------------------------------------------------------

## 8.2 CTA Integrity

-   Each visible primary CTA must map to one destination contract.
-   Disable or debounce critical CTA while its request is in flight when
    duplicate requests are possible.
-   Do not leave an obsolete confirmation CTA or duplicate event
    listener active behind a new handler.
-   After a result renders, the next CTA must continue forward; it must
    not call an earlier initialization route unless the authoritative
    session says repair is required.

# 9. Session and State Restoration Contract

## 9.1 Required Page-Load Algorithm

``` text
1. Read galvicare_session_id (or the repository's existing canonical key).
2. Parse return parameters, but do not trust them as payment proof.
3. If this is a Stripe return:
     a. call the existing server-side payment-confirmation action;
     b. receive authoritative entitlement/product state;
     c. continue restoration using the verified result.
4. If a session_id exists:
     a. call get_session;
     b. retrieve authoritative current_stage and relevant available products;
     c. query entitlement/stored result only where required by the existing contract.
5. If active entitlement + stored result exists:
     route to the result, not the paywall.
6. If prerequisites are incomplete:
     route to the exact repair point.
7. If session does not exist:
     create one and display Welcome.
8. Never create a second session merely because the page refreshed.
```

## 9.2 Restoration Scenarios

  -----------------------------------------------------------------------
  Scenario                            Expected result
  ----------------------------------- -----------------------------------
  Normal refresh on GalviSight result Same session, same stored Sight
                                      result, same logical next CTA.

  Refresh after verified Stripe       Active entitlement restored from
  payment                             Worker/D1; no second payment
                                      request.

  Browser back from a downstream      No duplicate result generation;
  result                              screen reconciles with
                                      authoritative stage.

  Copied successful Stripe return URL No entitlement transfer; mismatch
  opened by another/unpaid session    denied per Day 5 contract.

  Stale localStorage session ID not   Controlled not-found/new-session
  found server-side                   path; no fabricated stage.

  Incomplete triage session           Exact missing/repair point, not a
                                      false paid result.

  Incognito                           New session works independently; no
                                      dependency on prior cache.

  Payment provider still pending      Readable pending/retry state;
                                      session preserved.

  HubSpot/analytics unavailable       Customer-facing state still
                                      completes.
  -----------------------------------------------------------------------

## 9.3 State Authority Boundaries

  -----------------------------------------------------------------------
  Data                    Authoritative source    Browser role
  ----------------------- ----------------------- -----------------------
  session_id              Worker/D1 identity;     Persist pointer and
                          browser stores pointer  send with requests.

  current_stage           Worker/D1               Render/route after
                                                  server reconciliation.

  paid entitlement        Worker/D1 after         Display status only.
                          verified Stripe         
                          authority               

  clinical results        D1 stored result /      Render schema only.
                          Worker response         

  product/rules logic     Worker modules/governed No proprietary
                          content                 calculation.

  temporary UI state      Browser                 Allowed for loading,
                                                  accordion, selected
                                                  tab, unsaved input.

  facilitator             Server-side approved    Browser may send proof,
  authorization           mechanism / Access      not define authority.
  -----------------------------------------------------------------------

# 10. Duplicate Route / Duplicate Asset Elimination

  -----------------------------------------------------------------------
  Why this is Day 6 critical path`<br>`{=html}Recent build behavior
  showed that duplicated or competing route assets can make a correct
  redirect appear broken. Day 6 must eliminate runtime ambiguity before
  adding new navigation code.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 10.1 Required Audit

-   List every index*.html, app*.html, QA copy, backup copy and GitHub
    Pages entry candidate.
-   Search for all occurrences of Worker base URL/configuration
    constants.
-   Search for every Stripe success/cancel return parser and redirect
    function.
-   Search for every Continue/next-screen function and direct assignment
    to window.location/location.href.
-   Search for duplicate DOM IDs and duplicate event-listener
    registration for critical CTAs.
-   Search for stale script tags referencing old JS assets.
-   Compare Carrd embed/direct link to the actual QA GitHub Pages route.
-   Confirm which file is actually served by GitHub Pages and which
    script bundle the browser actually loads. \## 10.2 Canonical
    Ownership Report

  -----------------------------------------------------------------------
  Transition        Canonical         Competing         Disposition
                    file/function     candidate         
  ----------------- ----------------- ----------------- -----------------
  Carrd → app       \[Codex fills\]   \[Codex fills\]   Keep one
                                                        referenced QA
                                                        route.

  Welcome → Triage  \[Codex fills\]   \[Codex fills\]   One handler.

  Triage → Vitals   \[Codex fills\]   \[Codex fills\]   One handler.

  Result → next     \[Codex fills\]   \[Codex fills\]   One route owner
  product                                               per CTA.

  Paywall → Stripe  \[Codex fills\]   \[Codex fills\]   One payment
                                                        launch owner.

  Stripe return →   \[Codex fills\]   \[Codex fills\]   Server
  result                                                verification then
                                                        restore.

  Path → Clinic     \[Codex fills\]   \[Codex fills\]   One forward
                                                        route.

  Clinic → booking  \[Codex fills\]   \[Codex fills\]   One approved
                                                        destination.

  Recovery retry    \[Codex fills\]   \[Codex fills\]   Retry exact
                                                        failed action.
  -----------------------------------------------------------------------

## 10.3 Removal Rule

Codex must not delete backup/history files merely because their names
are similar. A candidate is removed, renamed, unreferenced or
de-registered only when evidence shows it is active and conflicting.
Prefer the smallest reversible change. \## 10.4 Regression Proof -
Browser network/source confirms only the intended active asset is
loaded. - One click produces one intended critical request/route
action. - Stripe return executes once and restores the intended
screen. - Refresh does not re-register multiple listeners or duplicate
navigation. - Direct QA route and Carrd entry produce the same canonical
journey.

# 11. Recovery-State Engineering

## 11.1 Standard Safe Error Contract

``` text
{
  "success": false,
  "status": "recoverable_error",
  "error_code": "SOURCE_DATA_INCOMPLETE",
  "message": "We could not complete this step yet. Your information is saved.",
  "session_id": "gc_...",
  "retry_action": "get_or_create_galvishot"
}
```

## 11.2 Recovery Rules

  -----------------------------------------------------------------------
  Failure                 Founder experience      System behavior
  ----------------------- ----------------------- -----------------------
  Worker action fails     Visible error with      Write/report error
  safely                  retry; session          where contract exists;
                          reference retained.     do not blank screen.

  D1 transient read/write Explain saved/retry     Do not fabricate
  issue                   state conservatively.   success; avoid
                                                  duplicate writes on
                                                  retry.

  Stripe pending          Payment confirmation    No active entitlement
                          pending; retry.         until verified.

  Stripe failure/cancel   Return to correct       No entitlement;
                          paywall/product         preserve session.
                          context.                

  HubSpot failure         No visible care         Log recovery row/error
                          interruption.           and continue.

  GA4 failure             No visible              Continue; D1 event
                          interruption.           where available.

  Clarity failure         No visible              Continue.
                          interruption.           

  Booking failure         Show retry/contact      Clinic record and
                          fallback.               session remain
                                                  available.

  Missing prerequisite    Explain exact missing   Route only to required
                          item/repair point.      repair stage.

  Unknown/invalid session Controlled              Do not attach to
                          restart/new-session     another session.
                          option.                 
  -----------------------------------------------------------------------

## 11.3 No Blank States

  -----------------------------------------------------------------------
  Blank screen = P0`<br>`{=html}Any required journey state that can
  render an empty page, unhandled exception, invisible error, or endless
  spinner is a Day 6 blocker. Codex must convert the specific failure
  into a bounded visible state rather than redesign the screen.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 12. FCD Clinical Summary and Facilitator Capture

## 12.1 FCD Summary Purpose

The facilitator must be able to conduct the FCD as a clinical diagnostic
upsell discussion using one authoritative Founder Health Record view.
The summary is an operating view over stored clinical records, not a new
intelligence generator.

  -----------------------------------------------------------------------
  FCD view section                    What the facilitator needs during
                                      the discussion
  ----------------------------------- -----------------------------------
  Reason for visit                    Primary symptom, stated goal,
                                      urgency and founder language.

  Health at a glance                  Overall GalviScore, classification,
                                      confidence and eight dimensions.

  Clinical findings                   Top GalviShot findings and
                                      evidence.

  Interpretation                      GalviSight meaning, root-cause
                                      hypothesis, risk, opportunity and
                                      urgency.

  Care pathway                        GalviPath recommendation and 30-day
                                      objective.

  Treatment opportunity               Recommended GalviClinic program and
                                      rationale.

  Commercial status                   Products obtained,
                                      entitlements/payments, paywalls
                                      viewed and Clinic booking status.

  Facilitator notes                   Objections, founder language,
                                      decisions, next-best offer/action
                                      and follow-up date.

  Learning-ready confirmation         Confirmed/rejected findings and new
                                      observations captured separately
                                      from polished deliverables.
  -----------------------------------------------------------------------

## 12.2 Required Worker Action: get_clinical_summary

Codex must reuse an existing equivalent or implement the smallest
protected action. It must aggregate authoritative stored records; it
must not regenerate Day 2--5 intelligence.

``` text
Logical request:
{
  "action": "get_clinical_summary",
  "session_id": "gc_...",
  "payload": {}
}

Logical response data:
{
  "reason_for_visit": {...},
  "health_at_a_glance": {...},
  "findings": [...],
  "interpretation": {...},
  "pathway": {...},
  "clinic": {...},
  "commercial_status": {...},
  "facilitator_notes": [...],
  "traceability": {
    "rules_versions": [...],
    "generation_sources": [...]
  }
}
```

## 12.3 Facilitator Protection

-   Use the protection mechanism already approved/available in the
    repository, such as Cloudflare Access or an existing server-side
    admin/facilitator secret.
-   Do not put a reusable secret directly in public frontend source.
-   Do not expose a public endpoint that accepts only a guessable
    session_id and returns the entire founder record.
-   Do not expand Day 6 into enterprise staff RBAC/SSO. \## 12.4 Minimal
    Learning-Ready Capture

  -------------------------------------------------------------------------------
  Capture type            Minimum fields                  Rule
  ----------------------- ------------------------------- -----------------------
  finding_confirmation    session_id, finding_id/code,    Never overwrite the
                          status                          original finding.
                          confirmed/rejected/uncertain,   
                          note, created_at                

  new_observation         session_id, observation         Store as observation;
                          text/code, source=fcd/clinic,   do not silently promote
                          note, created_at                to finding.

  objection               session_id, objection           Commercial/operating
                          type/text, product/context,     evidence.
                          created_at                      

  decision                session_id, decision,           Supports
                          next_action, follow_up_date,    clinical/commercial
                          created_at                      continuity.

  facilitator_note        session_id, note_type, note,    Internal operating
                          created_at                      record.
  -------------------------------------------------------------------------------

## 12.5 FCD Conversation Sequence

1.  Open with the founder's reason for visit: "You shared that the
    central concern is..."
2.  Confirm what GalviVitals and GalviScore show without overwhelming
    the founder with every number.
3.  Use GalviShot to name the highest-priority findings.
4.  Use GalviSight to explain why the findings matter and what may
    happen if they remain untreated.
5.  Use GalviPath to show the appropriate sequence of care.
6.  Present GalviClinic as the treatment-plan discussion, not as an
    unrelated consulting sale.
7.  Close with one care decision: self-guided pathway, obtain the next
    diagnostic, book treatment, or documented follow-up.

# 13. Print / PDF Record Contract

## 13.1 Scope

Use browser Print → Save as PDF. Do not build a paid server-side PDF
service during Day 6. - Apply print CSS to paid diagnostic result views
that require a portable record. - Remove navigation, paywall controls,
QA ribbons, debug information and nonessential buttons. - Preserve brand
hierarchy and readable margins. - Avoid clipped cards, hidden overflow,
tiny font and mid-heading page breaks. - Do not print internal-only
facilitator notes in customer diagnostic PDFs unless explicitly intended
by the existing product contract. \## 13.2 Minimum Printed Record

  -----------------------------------------------------------------------
  Field                               Requirement
  ----------------------------------- -----------------------------------
  Product                             Clear product name.

  Founder / venture                   Approved display identity only.

  Generated date                      Human-readable date/time.

  Confidence                          Score/band where product contract
                                      uses confidence.

  Result                              Authoritative stored
                                      customer-facing content.

  Assumptions                         Clearly labeled when present.

  rules_version                       Visible or traceable in
                                      footer/metadata area.

  generation_source                   Rules/stored/facilitator as
                                      appropriate; no internal secret
                                      data.

  Disclaimer                          Business guidance disclaimer; not
                                      legal, medical, financial, tax or
                                      investment advice.

  Session reference                   Safe support/reference identifier
                                      where appropriate.
  -----------------------------------------------------------------------

## 13.3 Print QA

-   Preview on desktop for GalviShot, GalviSight and GalviPath at
    minimum where those products support print.
-   Confirm no navigation/paywall controls appear.
-   Confirm text is not clipped and long content wraps.
-   Confirm critical content is not lost at page boundaries.
-   Confirm print action does not mutate session or generate a new
    result.

# 14. Analytics and Canonical Event Contract

## 14.1 Critical Event Map

  -----------------------------------------------------------------------
  Event                               When it fires
  ----------------------------------- -----------------------------------
  galvicare_started                   Welcome CTA clicked.

  triage_started                      Assessment begins.

  triage_submitted                    Assessment submission succeeds.

  diagnostic_viewed                   Vitals/Score/Shot/Sight/Path result
                                      successfully renders.

  paywall_viewed                      Paid-product education/paywall
                                      screen renders.

  clinical_followup_viewed            Targeted context panel appears.

  clinical_followup_submitted         Targeted context submission
                                      succeeds.

  stripe_click                        Checkout starts.

  stripe_success                      Verified payment return completes
                                      successfully.

  continue_clicked                    Founder advances to the next
                                      product.

  clinic_booking_clicked              Treatment booking route selected.

  journey_error                       Recoverable founder-facing
                                      frontend/backend failure.

  fcd_reviewed                        Facilitator opens the clinical
                                      summary.
  -----------------------------------------------------------------------

## 14.2 Event Semantics

-   Fire outcome events after the relevant authoritative action
    succeeds, not merely because a button was clicked.
-   Do not fire diagnostic_viewed for a blank/loading/failed result.
-   stripe_success requires verified Day 5 payment authority, not a
    success query string.
-   Do not emit duplicate events because duplicate handlers/listeners
    are registered.
-   Include session_id, product/current_stage and safe event context in
    canonical D1 events where the existing schema allows.
-   Do not include sensitive clinical narrative or secrets in analytics
    payloads. \## 14.3 Non-Blocking Rule

  -----------------------------------------------------------------------
  Analytics can observe care; analytics cannot control
  care`<br>`{=html}GA4 and Clarity errors must be isolated so the founder
  journey still completes. D1 canonical event failure should be
  logged/recovered according to the existing architecture and must not
  turn a successful clinical result into a blank screen.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 14.4 Analytics QA

-   One event per intended transition in the browser/network evidence.
-   D1 event row exists for the critical canonical events implemented
    server-side.
-   GA4/Clarity are present where expected.
-   Temporarily block/fail GA4 or Clarity using the approved QA method
    and confirm customer flow continues.
-   No duplicate stripe_success or fcd_reviewed on refresh unless
    intentionally defined.

# 15. Mobile / Desktop Experience Contract

## 15.1 Required Test Modes

  -----------------------------------------------------------------------
  Mode                                Purpose
  ----------------------------------- -----------------------------------
  Desktop normal window               Primary QA operating path.

  iPhone-width DevTools               Detect overflow, fixed widths,
                                      inaccessible CTA, dense tables.

  Incognito/private window            Prove no dependency on stale cache
                                      or prior session state.

  Carrd embedded route                Prove storefront-to-app handoff
                                      where current architecture uses
                                      embed/route.

  Direct GitHub Pages QA route        Fallback and isolation path.
  -----------------------------------------------------------------------

## 15.2 Mobile Acceptance

-   No horizontal scroll on critical journey screens.
-   Primary CTA is visible, tappable and not hidden by fixed elements.
-   Inputs and buttons remain usable at common mobile width.
-   Long diagnostic content wraps and scrolls vertically.
-   Locked, payment-pending, recovery, result and booking states all
    remain usable.
-   Tables/cards in FCD summary may use a facilitator desktop layout if
    the facilitator route is explicitly desktop-only, but founder-facing
    screens must remain mobile-usable. \## 15.3 Trust and Accessibility
    Essentials
-   Visible labels remain associated with form fields.
-   Button text describes the action.
-   Loading/error status is announced where the current app already
    supports aria-live/role=status or can add it safely.
-   Color is not the sole severity indicator.
-   No new inaccessible interaction is introduced on Day 6.

# 16. Security and Browser-Presentation Boundary

## 16.1 Permanent GalviSecurity Principles

  -----------------------------------------------------------------------
  GalviSecurity Principle #1`<br>`{=html}The browser should display
  intelligence---not contain intelligence.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  GalviSecurity Principle #2`<br>`{=html}Assume every line of browser
  code is public.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 16.2 Day 6 Browser Prohibitions

-   No Stripe secret key, webhook secret, HubSpot token, D1 credential
    or future OpenAI key.
-   No server product/price authority map if it controls entitlement.
-   No proprietary GalviEngine scoring, finding, pathway or treatment
    logic.
-   No facilitator admin secret embedded in public source.
-   No unrestricted endpoint that exposes full founder clinical files by
    session_id alone.
-   No technical stack trace returned to founders. \## 16.3 Required
    Security Tests
-   Search browser-delivered source/bundle for secret variable names and
    known secret patterns without printing secret values.
-   Verify query parameters/localStorage cannot grant payment
    entitlement.
-   Verify FCD summary authorization is required by the approved
    server-side mechanism.
-   Verify CORS remains limited to approved origins/behavior.
-   Verify logs and analytics payloads do not include secrets or
    unnecessary full clinical narrative.
-   Verify no Day 6 change bypasses the Day 5 verified payment contract.

# 17. Additive D1 / Worker Contract

## 17.1 Existing Actions to Reuse

  -----------------------------------------------------------------------
  Domain                              Required existing/equivalent
                                      actions
  ----------------------------------- -----------------------------------
  Foundation                          health, create_or_resume_session,
                                      get_session, journey_event,
                                      report_error

  Triage                              submit_triage, get_triage,
                                      triage_completeness

  Vitals/Score                        get_or_create_vitals/get_vitals;
                                      get_or_create_score/get_score

  Shot                                evaluate/save
                                      follow-up/get_or_create/get

  Sight                               evaluate/save
                                      follow-up/get_or_create/get

  Path                                evaluate/save
                                      follow-up/get_or_create/get

  Clinic                              get_or_create_clinic or clinic
                                      brief, record_booking status/click

  Payment                             confirm_payment_return,
                                      get_entitlement, stripe_webhook

  CRM                                 sync/recovery actions -
                                      non-blocking

  Facilitator                         get_clinical_summary;
                                      save_facilitator_note or repository
                                      equivalent
  -----------------------------------------------------------------------

## 17.2 Additive Schema Guidance

Codex must first reconcile the existing Day 1--5 schema. Do not
duplicate tables/columns. Add only the minimum fields/tables required
for the approved facilitator capture.

``` text
-- Semantic example only; reconcile with repository conventions.
CREATE TABLE IF NOT EXISTS facilitator_notes (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  note_type TEXT NOT NULL,
  finding_ref TEXT,
  confirmation_status TEXT,
  note TEXT,
  objection TEXT,
  decision TEXT,
  next_action TEXT,
  follow_up_date TEXT,
  source TEXT DEFAULT 'fcd',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_facilitator_notes_session
ON facilitator_notes(session_id);
```

## 17.3 Idempotency / Mutation Rules

-   Do not rewrite historical clinical results when a facilitator
    confirms/rejects a finding.
-   Repeated clinical-summary reads are read-only.
-   Repeated same-note submit must follow existing repository
    idempotency conventions where available; avoid duplicate notes on
    double-click.
-   Journey events may be append-only, but duplicate frontend handlers
    must not generate accidental duplicate funnel events.
-   State restoration retrieves existing results before invoking any
    create/generate action. \## 17.4 get_clinical_summary Aggregation
    Rule Aggregate from canonical stored Day 2--5 records. Missing
    optional sections should render as unavailable/pending, not trigger
    regeneration or cross-system manual lookup.

# 18. Golden QA Fixtures and Full Journey Matrix

## 18.1 Golden Fixture A --- High-Confidence Founder

``` text
{
  "session_id": "gc_day6_high_001",
  "profile": "complete",
  "confidence": "high",
  "expected": {"followups": "minimal", "journey_complete": true, "fcd_summary_complete": true}
}
```

## 18.2 Golden Fixture B --- Low-Confidence Founder

``` text
{
  "session_id": "gc_day6_low_001",
  "profile": "intentionally incomplete/contradictory",
  "expected": {"targeted_followup_or_facilitator_review": true, "no_fabricated_claims": true, "session_preserved": true}
}
```

## 18.3 Golden Fixture C --- Payment / Recovery Founder

``` text
{
  "session_id": "gc_day6_payment_001",
  "expected": {"stripe_return_verified_server_side": true, "correct_product_restored": true,
               "refresh_entitlement_active": true, "booking_or_fallback_available": true}
}
```

## 18.4 Golden Fixture D --- Duplicate Route / Refresh Stress

``` text
{
  "session_id": "gc_day6_route_001",
  "procedure": ["open canonical QA route", "advance through multiple products", "refresh", "browser back", "repeat Continue once"],
  "expected": {"one_session": true, "one_effective_route_handler_per_transition": true,
               "no_restart_to_triage": true, "no_duplicate_result_generation": true}
}
```

## 18.5 Day 6 QA Matrix

  -----------------------------------------------------------------------
  Area / scenario                     Pass criteria
  ----------------------------------- -----------------------------------
  Journey                             Every critical CTA reaches the
                                      correct screen and next product.

  Carrd entry                         Carrd route/embed enters the same
                                      canonical QA app path as the direct
                                      link.

  State                               Refresh/back/Stripe return restore
                                      the correct session and stage.

  Existing paid result                Active entitlement + stored result
                                      bypasses paywall and returns
                                      result.

  No duplicate session                Refresh/navigation does not create
                                      second session.

  Duplicate-route audit               One active canonical owner per
                                      critical transition.

  Mobile                              No horizontal scroll; founder
                                      inputs/buttons usable.

  Incognito                           New independent journey works.

  Error recovery                      Retry works; session/reference
                                      remains visible.

  Stripe return                       Verified Day 5 authority continues
                                      to intended product, not generic
                                      confirmation/Triage.

  Booking recovery                    Approved destination or visible
                                      fallback; session preserved.

  HubSpot failure                     Founder path succeeds.

  GA4/Clarity failure                 Founder path succeeds.

  Analytics                           Expected GA4/Clarity and D1
                                      canonical events exist; no
                                      accidental duplicates.

  Print                               Paid result produces a clean
                                      record.

  FCD view                            Facilitator can explain condition,
                                      evidence, pathway and treatment
                                      from one view.

  Facilitator capture                 Confirmed/rejected finding and new
                                      observation can be stored without
                                      altering historical result.

  Commercial logic                    Next paid step feels clinically
                                      necessary, not arbitrary.

  Security                            No secret/proprietary logic/payment
                                      authority exposed.

  Days 1--5 regression                Accepted clinical, payment,
                                      entitlement and booking behavior
                                      remains functional.

  Rollback                            Pre-Day-6 QA state can be restored.
  -----------------------------------------------------------------------

## 18.6 Full Rehearsal Procedure

1.  Create or reset the three primary QA founder fixtures using
    sanitized data.
2.  Run each from Welcome through the correct GalviClinic booking/end
    state.
3.  Run desktop normal mode, iPhone-width DevTools and incognito.
4.  At least once, refresh on a downstream diagnostic result.
5.  At least once, use browser back and then continue forward.
6.  Complete or replay the approved Stripe test return flow and confirm
    correct restoration.
7.  Force one approved recoverable integration failure and verify
    fallback.
8.  Open the FCD summary for each founder and rehearse a 15-minute
    diagnostic conversation.
9.  Print representative paid diagnostic results to browser preview/PDF.
10. Record only P0/P1 and trust-breaking defects for Day 6 correction.

# 19. Checkpoint Protocol and Required Evidence

## 19.1 Checkpoint A --- Before Editing

-   Exact files to change.
-   Exact files explicitly not to change.
-   Canonical app entrypoint.
-   Canonical route owners.
-   Duplicate assets/handlers requiring bounded disposition.
-   Migration file, if any.
-   Test files/commands.
-   Rollback artifact. \## 19.2 Checkpoint B --- Contracts
-   Final route matrix.
-   Final state-restoration precedence.
-   FCD summary action/authorization.
-   Facilitator capture schema delta.
-   Analytics event map.
-   Print scope.
-   Mobile/recovery test list. \## 19.3 Checkpoint C --- Backend / State
-   get_session/restoration tests.
-   Clinical-summary response for representative session.
-   Facilitator-note persistence test if added.
-   No Day 2--5 result mutation.
-   D1 migration result and row evidence.
-   Structured recovery response evidence. \## 19.4 Checkpoint D ---
    Frontend Integration
-   Changed frontend files.
-   Canonical route-handler evidence.
-   Duplicate/obsolete handler disposition.
-   Stripe-return continuation behavior.
-   Refresh/back restore behavior.
-   FCD view rendering.
-   Print CSS behavior.
-   Analytics wiring and non-blocking guards.
-   Browser security boundary confirmation. \## 19.5 Checkpoint E ---
    Final QA
-   Three-founder full journey results.
-   Desktop/mobile/incognito evidence.
-   Payment/refresh/recovery evidence.
-   Print evidence.
-   FCD rehearsal evidence.
-   Analytics evidence.
-   Security scan.
-   Days 1--5 regression.
-   Migration/rollback review. \## 19.6 Required Final Test Evidence

  -----------------------------------------------------------------------
  Evidence                            Minimum required output
  ----------------------------------- -----------------------------------
  Commands                            Every automated command executed.

  Results                             Exact pass/fail counts and failing
                                      test names.

  Route audit                         Canonical owner per critical
                                      transition and resolved conflicts.

  Session evidence                    Session ID before/after
                                      refresh/back/Stripe return.

  D1 evidence                         Relevant row counts/records before
                                      and after idempotency/recovery
                                      tests.

  FCD summary                         Representative sanitized summary
                                      response/render.

  Facilitator note                    Representative sanitized
                                      confirmation/observation record if
                                      added.

  Analytics                           Representative event evidence; no
                                      blocking failure.

  Print                               Representative print preview/PDF QA
                                      result.

  Security                            Bundle/source scan and
                                      authorization checks.

  Regression                          Days 1--5 results.

  Limitations                         Unresolved non-blocking issues for
                                      Day 7/backlog.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Evidence standard`<br>`{=html}"Tests passed" is insufficient. Codex
  must provide commands, counts, representative state evidence, exact
  failing test names if any, and a binary GO/BLOCK recommendation.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 20. Codex One-Pass Implementation Prompt

## 20.1 Copy and Paste After Human Approval

``` text
You are authorized to implement GalviCare 0.5 Day 6 on the approved QA branch/worktree.

Use:
- CODEX_DAY6_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md;
- your approved Day 6 discovery report;
- the existing repository conventions.

Implement only the approved changed-file plan.

PRIMARY OBJECTIVE:
Make the entire GalviCare 0.5 journey operate as one continuous clinical system,
with authoritative state restoration, one canonical route owner per transition,
a protected FCD operating view, clean print records, non-blocking analytics,
visible recovery states, and full desktop/mobile/incognito QA.

MANDATORY REQUIREMENTS:
1. Reuse the existing Worker and action router.
2. Preserve Days 1–5 contracts and stored results.
3. Do not recompute accepted clinical results during restoration.
4. Process Stripe return before ordinary stage restoration.
5. Treat return/query/browser state as signals; use Worker/D1 as authority.
6. Route active entitlement + stored result to the result, not the paywall.
7. Route incomplete sessions to the exact repair point.
8. Never create a second session merely because the page refreshed.
9. Establish one runtime owner for every critical route/CTA.
10. Resolve only evidenced duplicate asset/handler conflicts.
11. Build/reuse protected get_clinical_summary using stored records.
12. Add only minimum learning-ready facilitator capture:
    confirmed/rejected/uncertain finding + new observation + operating notes.
13. Do not overwrite historical findings/results with facilitator notes.
14. Add/complete print CSS for the approved paid result screens.
15. Wire only the canonical Day 6 analytics events.
16. GA4, Clarity and HubSpot must remain non-blocking.
17. Keep all proprietary rules, secrets, payment authority and facilitator authority server-side.
18. Use additive D1 migration only if approved and necessary.
19. Test desktop, iPhone-width, incognito, refresh, back, Stripe return,
    recovery, print, FCD view, analytics and Days 1–5 regression.
20. Fix only P0/P1 or trust-breaking bounded defects.

DO NOT:
- change Day 2 scoring;
- change Day 3 finding rules;
- change Day 4 interpretation/pathway rules;
- change Day 5 payment/entitlement/Clinic semantics;
- add Make, OpenAI or Airtable writes;
- create a second Worker;
- perform a broad frontend rewrite;
- deploy to production;
- change live secrets;
- merge or approve the PR;
- refactor unrelated code.

CHECKPOINTS:
A. Before editing: restate exact changed files, files not changing, route owners,
   migration (if any), tests and rollback.
B. Contracts: return route matrix, restoration precedence, FCD contract,
   facilitator schema, print and event map.
C. Backend/state: run exact tests and return results.
D. Frontend: return changed files and route/restore/recovery/print/FCD evidence.
E. Final QA: run full affected suite + security + Days 1–5 regression.
F. PR recommendation: GO or BLOCK with reasons.

If a test fails:
- identify the exact acceptance criterion;
- identify the smallest affected file set;
- identify the root cause supported by evidence;
- apply one targeted correction;
- run the exact re-test.
Do not restart discovery or redesign the architecture.

STOP and report BLOCKED if:
- repository reality invalidates the approved plan;
- a second Worker or destructive migration is required;
- production changes are required;
- the authoritative session/payment state cannot be preserved;
- a public facilitator route would expose founder records;
- a broad rewrite is the only proposed solution.

At completion, provide implementation summary, changed files, migration result,
exact tests/counts, route-conflict resolution, session restoration evidence,
FCD summary/capture evidence, print evidence, analytics evidence, security review,
Days 1–5 regression, rollback, Day 7 handoff, and GO/BLOCK recommendation.
```

# 21. Human Product Owner Verification

The Product Owner should perform one live QA pass after Codex reports
Checkpoint E. 1. Open the approved Carrd/GalviPro QA entry and confirm
it reaches the intended GalviCare app. 1. Confirm a new journey
creates/resumes one session and Welcome → GalviTriage behaves
correctly. 1. Complete GalviTriage and confirm GalviVitals renders
without blank state. 1. Continue through GalviScore and confirm the next
CTA is correct. 1. Continue/unlock through GalviShot, GalviSight and
GalviPath using the approved QA/payment state. 1. At each result,
confirm the next CTA advances forward and does not restart
GalviTriage. 1. Refresh on a downstream result and confirm the same
session/result restores. 1. Use browser back once, then continue;
confirm no duplicate session/result is created. 1. Complete the approved
Stripe test checkout/return and confirm the return processes
verification before routing. 1. Confirm the verified paid state lands on
the correct product/result, not a generic dead-end confirmation page. 1.
Refresh after verified payment; confirm no second payment is
requested. 1. Confirm an unpaid/different session cannot reuse the
successful return to unlock. 1. Confirm GalviClinic and the booking CTA
preserve the session and approved destination. 1. Trigger the approved
booking fallback and confirm visible recovery. 1. Trigger the approved
HubSpot failure and confirm the founder is not blocked. 1. Confirm
GA4/Clarity failure does not block the founder. 1. Inspect
analytics/network for intended critical events and obvious
duplicates. 1. Open the protected FCD summary for the QA founder. 1.
Confirm reason for visit, score, findings, interpretation, pathway,
treatment and commercial status are coherent. 1. Save one
confirmed/rejected/uncertain finding and one new observation if
facilitator capture was added. 1. Confirm the original historical
finding/result remains unchanged. 1. Run browser print preview for
representative paid diagnostics; confirm controls are removed and
content is readable. 1. Test iPhone-width; confirm no horizontal scroll
and primary controls are usable. 1. Open incognito and complete a new
independent journey. 1. Inspect browser source/network for secrets,
product maps, entitlement authority and proprietary clinical rules. 1.
Re-run one Days 1--5 regression path. 1. Review the PR diff for
unrelated changes. 1. Review rollback steps and Day 7 handoff. 1. Make
the independent GO / BLOCK decision.

# 22. Pull Request, Rollback, and Day 7 Handoff

## 22.1 Required PR Title

``` text
GalviCare 0.5 Day 6 — full journey integration, FCD operating view and experience QA (QA only)
```

## 22.2 Required PR Body

``` text
## Scope
- canonical full-journey routing
- authoritative state restoration
- duplicate route/config/handler conflict resolution
- recovery states
- protected FCD clinical summary
- minimal facilitator capture
- print/PDF CSS
- canonical analytics events
- desktop/mobile/incognito integration QA

## Explicit exclusions
- No Day 2–5 clinical/payment semantic changes
- No Make
- No OpenAI
- No Airtable customer-path writes
- No second Worker
- No production deployment
- No broad UI rewrite

## Changed files
[List every file and purpose.]

## Canonical route ownership
[List every critical transition and owning file/function.]

## Duplicate/conflict disposition
[List every active conflict removed/disabled and evidence.]

## D1 migration
[Migration file/apply result or "none required".]

## FCD operating view
[Action, authorization, data sources, facilitator capture.]

## Print
[Files/styles and tested products.]

## Analytics
[Canonical events and non-blocking behavior.]

## Tests
[Commands, counts and exact results.]

## Evidence
- full journey x3 founders
- refresh/back
- Stripe return restoration
- duplicate-route proof
- mobile
- incognito
- recovery
- FCD summary/capture
- print
- analytics
- browser security scan
- Days 1–5 regression

## Rollback
[Git, Worker, D1 and frontend rollback.]

## Day 7 handoff
[Candidate SHA, known limitations, exact P0/P1 status.]

## Deployment
QA only. Human approval required. No production deployment performed.

## Codex recommendation
GO / BLOCK with reasons.
```

## 22.3 Rollback Plan

  -----------------------------------------------------------------------
  Layer                               Rollback artifact/action
  ----------------------------------- -----------------------------------
  Git                                 Revert Day 6 commit(s) only or
                                      restore pre-Day-6 QA tag/branch.

  Frontend                            Restore exact pre-Day-6
                                      route/state/FCD/print/analytics
                                      assets.

  Worker                              Restore exact pre-Day-6 QA Worker
                                      source/deployment if Worker
                                      changed.

  D1                                  Apply documented conservative
                                      rollback; retain inert additive
                                      schema when data safety is
                                      uncertain.

  Carrd QA route                      Restore prior QA embed/direct
                                      target only if Day 6 changed a QA
                                      reference.

  Analytics                           Restore prior non-blocking
                                      instrumentation if a new event
                                      integration causes runtime failure.
  -----------------------------------------------------------------------

## 22.4 Day 7 Handoff Package

  -----------------------------------------------------------------------
  Handoff item                        Required Day 6 output
  ----------------------------------- -----------------------------------
  QA candidate SHA                    Exact commit recommended for Day 7.

  Full journey evidence               Three founder cases and exact
                                      results.

  Route ownership                     Canonical transition map.

  Known limitations                   Only non-blocking P2/P3 issues;
                                      explicit owner/backlog.

  D1/schema state                     Applied migration(s), if any, and
                                      rollback.

  Worker state                        QA deployment/version and rollback.

  Security state                      Browser scan and facilitator
                                      protection result.

  Payment state                       Day 5 verification preserved; Day 6
                                      return restoration proof.

  Print state                         Products tested and result.

  Analytics state                     Events tested and non-blocking
                                      proof.

  FCD state                           Summary + facilitator capture
                                      tested.

  Day 7 blockers                      Zero P0; P1 only if explicitly
                                      accepted as BLOCK.
  -----------------------------------------------------------------------

# 23. Codex Final Report Template and Final Authority

## 23.1 Final Report Template

``` text
# GalviCare 0.5 Day 6 — Codex Final Implementation Report

## 1. Decision
GO / BLOCK

## 2. Repository and branch
- Repository:
- Branch/worktree:
- Starting commit:
- Ending commit:
- QA app URL:
- QA Worker environment:

## 3. Implementation summary

## 4. Changed files
| File | Purpose | Risk | Rollback |

## 5. Canonical route ownership
| Transition | Owner file/function | Duplicate found? | Resolution |

## 6. State restoration evidence
- refresh:
- browser back:
- Stripe return:
- active entitlement restore:
- incomplete-session repair:
- no duplicate session:

## 7. D1 migration
- File:
- Apply command:
- Result:
- Rollback:
(or "none required")

## 8. Tests
| Command | Passed | Failed | Notes |

## 9. Full journey evidence
- High-confidence founder:
- Low-confidence founder:
- Payment/recovery founder:
- Mobile:
- Incognito:

## 10. Recovery evidence
- Worker:
- payment pending/failure:
- booking fallback:
- HubSpot:
- analytics:

## 11. FCD operating view
- Protected route/action:
- Representative summary:
- Finding confirmation:
- New observation:
- Historical-result immutability:

## 12. Print/PDF evidence

## 13. Analytics evidence

## 14. Security review

## 15. Days 1–5 regression

## 16. Manual QA instructions

## 17. Risks, limitations and Product Owner decisions

## 18. Pull request

## 19. Rollback

## 20. Day 7 handoff

No production deployment, merge, live-data change, live secret rotation
or production Carrd cutover was performed.

## 21. Codex recommendation
GO / BLOCK with exact reasons.
```

## 23.2 Final Authority

Codex may discover, implement, test and prepare a QA pull request. Codex
may not approve product meaning, commercial positioning, production
promotion or release acceptance. - Only the Human Product Owner may
authorize implementation after discovery. - Only the Human Product Owner
may approve ambiguous customer journey semantics. - Only the Human
Product Owner may approve FCD facilitator language and
treatment/commercial framing. - Only the Human Product Owner may approve
PR merge and production deployment. - Only Day 7 may perform the
controlled production cutover.

  -----------------------------------------------------------------------
  Day 6 completion standard`<br>`{=html}The guide is complete only when
  Codex reconciles it against repository reality through the single
  discovery report and proves the integrated journey. The Day 6 build is
  complete when the founder can traverse the clinical pathway without
  manual repair and the facilitator can explain the founder's condition,
  evidence, pathway and treatment from one protected operating view.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# Appendix A --- Critical-Path Route Trace Worksheet

  -------------------------------------------------------------------------------------------------------------------------------
  \#       Source    Trigger           Handler/file   Worker action            Authoritative state   Destination         Pass
           screen                                                              change                                    
  -------- --------- ----------------- -------------- ------------------------ --------------------- ------------------- --------
  1        Carrd     Obtain GalviCare  \[fill\]       ---                      ---                   Welcome/app         □

  2        Welcome   Start             \[fill\]       create/resume            session               Triage              □
                                                                               created/resumed                           

  3        Triage    Submit            \[fill\]       submit_triage            current_stage         Vitals              □

  4        Vitals    Continue          \[fill\]       score action             stage/result          Score               □

  5        Score     Continue/unlock   \[fill\]       entitlement/product      stage/entitlement     Shot                □

  6        Shot      Continue          \[fill\]       Sight action             stage/result          Sight               □

  7        Sight     Continue          \[fill\]       Path action              stage/result          Path                □

  8        Path      Book/continue     \[fill\]       Clinic action            clinic state          Clinic              □

  9        Paid      Stripe click      \[fill\]       ---                      external checkout     Stripe              □
           product                                                                                                       

  10       Stripe    Return            \[fill\]       confirm_payment_return   payment/entitlement   Correct result      □

  11       Clinic    Book              \[fill\]       booking action           booking event/state   Calendly/fallback   □

  12       Any       Recover           \[fill\]       retry_action             existing session      Correct repair      □
                                                                                                     point               
  -------------------------------------------------------------------------------------------------------------------------------

# Appendix B --- Day 6 No-Delay Decision Rules

  -----------------------------------------------------------------------
  Situation                           Required decision
  ----------------------------------- -----------------------------------
  One acceptance test fails           Isolate and fix only the smallest
                                      evidenced defect.

  Repository path differs from guide  Use repository reality; do not
  example                             fabricate.

  Duplicate file exists but is not    Do not delete solely for
  loaded                              cleanliness.

  Duplicate handler is active and     Disable/remove the competing
  conflicting                         runtime registration with
                                      reversible change.

  Analytics event missing but journey Add bounded event wiring; do not
  works                               restructure navigation.

  Clarity/GA4 unreliable              Keep non-blocking; do not delay
                                      core release.

  HubSpot direct sync unreliable      Use accepted recovery/manual
                                      fallback; do not delay core
                                      release.

  FCD summary section legitimately    Show unavailable/pending; do not
  absent upstream                     regenerate or invent.

  Print has minor cosmetic issue but  Defer unless trust-breaking.
  readable                            

  Mobile has horizontal scroll or     P1; fix before GO.
  inaccessible CTA                    

  Stripe verified return lands wrong  P0; fix canonical
  screen                              return/restoration logic.

  Valid downstream session restarts   P0/P1; fix restoration/route
  Triage                              conflict before GO.
  -----------------------------------------------------------------------
