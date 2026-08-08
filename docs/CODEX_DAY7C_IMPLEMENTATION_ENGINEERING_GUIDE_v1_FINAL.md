# GALVICARE™ 0.5 --- DAY 7C CODEX IMPLEMENTATION ENGINEERING GUIDE

> **DAY 7C SCOPE LOCK**
>
> Day 7C is **ecosystem integration validation/UAT, not a new GalviCare
> feature build**. Preserve the accepted Day 7A application and Day 7B
> environment contracts.
>
> **QA = BUILD / TEST**
>
> **PRODUCTION = RUN / LIVE**
>
> **Primary proof:** One synthetic customer → one session → complete QA
> customer journey → Stripe TEST → HubSpot QA → GA4 QA → Clarity QA →
> GalviClinic QA → cross-system reconciliation → zero Production
> contamination.
>
> Codex may make only bounded integration/configuration/instrumentation
> corrections required by a failed Day 7C acceptance criterion. Do not
> reopen accepted scoring, clinical logic, product semantics,
> application routing, entitlement semantics, or Day 7A/7B functionality
> without a proven regression and Human Product Owner approval.

------------------------------------------------------------------------

GALVICARE™ 0.5

DAY 7C BUILDER GUIDE --- CODEX IMPLEMENTATION ENGINEER EDITION

Full QA Ecosystem Validation • Customer Intelligence Reconciliation •
Launch Readiness

Prepared for GalviPro / GalviStudio \| July 2026 \| Secure +
Learning-Ready

# Table of Contents

1.  Document Purpose and Day 7C Mission

2.  Day 7A / Day 7B Handoff and Scope Lock

3.  Day 7C Operating Model and Timebox

4.  Locked Architecture and Environment Separation Contract

5.  GO / NO-GO Gates and Absolute Prohibitions

6.  Required Customer Identity, Correlation, and Traceability Contract

7.  Canonical Journey and Event Taxonomy

8.  Preflight Discovery and Readiness Audit

9.  QA Frontend / Worker / D1 Instrumentation Gate

10. Stripe TEST Integration and Revenue-Isolation Gate

11. HubSpot QA Integration Contract

12. GA4 QA Analytics Contract

13. Microsoft Clarity QA Behavioral-Intelligence Contract

14. GalviClinic QA / Calendly Conversion Contract

15. Downstream Adapter Non-Blocking Failure Contract

16. Synthetic Customer Test Persona and Test Data

17. Full Day 7C Human E2E Execution Script

18. D1 / GalviVault Reconciliation

19. Stripe Reconciliation

20. HubSpot Reconciliation

21. GA4 Reconciliation

22. Clarity Reconciliation

23. GalviClinic Reconciliation

24. Cross-System Customer 360 Reconciliation

25. Duplicate / Missing / Out-of-Order Event Audit

26. Production-Contamination Audit

27. Security, Privacy, PII, and Secret Verification

28. Customer Intelligence Interpretation and Next-Best-Action Output

29. Evidence Package and Human Verification

30. Defect Classification and One-Pass Correction Rule

31. Codex One-Pass Day 7C Execution Prompt

32. Human Product Owner Verification Checklist

33. Pull Request / Release Record / Tagging

34. Final Codex Report Template

35. Day 7C Exit Decision and Post-7C Handoff

Appendix A. Day 7C Test Matrix

Appendix B. Canonical Event Dictionary

Appendix C. HubSpot Property / Stage Mapping

Appendix D. GA4 QA Validation Matrix

Appendix E. Clarity QA Validation Matrix

Appendix F. SQL Reconciliation Queries

Appendix G. Evidence Folder Structure

Appendix H. Critical-Path Defect Response Template

Appendix I. Explicit Deferred Backlog

# 1. Document Purpose and Day 7C Mission

This document is simultaneously:

-   the Human Product Owner supervision runbook for GalviCare 0.5 Day
    7C;
-   Codex's authoritative QA ecosystem-integration and systems-UAT
    implementation contract;
-   the minimum-build specification for making HubSpot, GA4, Clarity,
    Stripe TEST, GalviClinic QA, and GalviVault traceable around the
    already-accepted GalviCare application;
-   the full synthetic-customer execution script and evidence standard;
-   the reconciliation contract that determines whether the GalviPro
    customer operating system is ready to support launch learning
    without accumulating environment/data technical debt. Day 7C does
    not re-prove whether the GalviCare screens work in isolation. Day 7A
    established application functionality, and Day 7B established QA =
    BUILD / Production = RUN separation. Day 7C proves that the
    integrated operating ecosystem tells one coherent customer story.

# 2. Day 7A / Day 7B Handoff and Scope Lock

## 2.1 Preconditions

-   Accepted Day 7B QA candidate SHA is known and working tree is clean
    or fully accounted for.
-   QA frontend URL and QA Worker endpoint are known and do not rely on
    Production resources.
-   QA D1/GalviVault binding is known and distinct from Production.
-   Stripe TEST Payment Links / Checkout objects are known for every
    paid product in the QA journey.
-   Production Stripe LIVE links are not present in the QA runtime.
-   QA and Production GA4/Clarity configuration are distinguishable.
-   HubSpot QA/test-data strategy is explicit: separate sandbox/portal
    where available, or rigorously tagged synthetic records that cannot
    enter live customer automation/reporting.
-   GalviClinic QA/test booking mechanism is explicit and will not
    create unwanted real operational appointments.
-   Rollback artifacts from Day 7B exist. \# 3. Day 7C Operating Model
    and Timebox

## 3.1 Failed-Test Rule

Every failure must be handled as an isolated ecosystem defect. Codex
returns exactly:

-   failed acceptance criterion and severity;
-   system/environment where observed;
-   synthetic customer/session identifiers involved;
-   smallest affected file/config/resource set;
-   observed evidence and supported root cause;
-   targeted correction only;
-   exact automated or Human re-test;
-   whether any accepted Day 7A/7B contract changes;
-   whether rollback is required. \# 4. Locked Architecture and
    Environment Separation Contract

QA (BUILD) qa.galvipro.com or approved QA entry -\> GalviCare QA
frontend -\> QA Worker / GalviEngine -\> QA GalviVault / D1 -\> Stripe
TEST -\> HubSpot QA/Test Data -\> GA4 QA -\> Clarity QA -\> GalviClinic
QA/Test

PRODUCTION (RUN) www.galvipro.com/#galvitriage or approved canonical
public route -\> Production GalviCare frontend -\> Production Worker /
GalviEngine -\> Production GalviVault / D1 -\> Stripe LIVE -\> HubSpot
Production -\> GA4 Production -\> Clarity Production -\> GalviClinic
Production

# 5. GO / NO-GO Gates and Absolute Prohibitions

## 5.1 Day 7C GO

-   All required QA system targets are identifiable and separate from
    Production.

-   One synthetic customer completes the full QA journey without manual
    data repair.

-   The same galvicare_session_id and/or approved correlation key can
    reconcile the journey across all feasible systems.

-   Every required Stripe transaction is TEST mode and no live revenue
    is created.

-   HubSpot contact/customer state is correct and duplicate-free.

-   GA4 QA receives the canonical events required to reconstruct the
    funnel.

-   Clarity QA contains the corresponding behavioral session or a
    documented tool-delay exception with other evidence intact.

-   GalviClinic QA conversion is recorded or test-safe booking evidence
    exists.

-   No critical event is missing, duplicated, or materially out of
    order.

-   No QA customer data contaminates Production CRM, analytics, payment,
    D1, Clarity, or booking systems.

-   Failures of HubSpot/GA4/Clarity remain non-blocking to the core
    customer path.

-   Final evidence pack can answer: who was the customer, what did they
    do, what did they buy, where did they hesitate, what did GalviPro
    learn, where are they now, and what should GalviPro do next? \## 5.2
    Immediate NO-GO

-   QA touches Production D1 or grants a live Stripe entitlement.

-   QA sends live customer email/automation from HubSpot or is counted
    as a real customer without deliberate test tagging.

-   QA events appear in Production GA4 or Production Clarity.

-   Production IDs/secrets are hard-coded into QA frontend bundles or
    committed to source.

-   Adapter failures break GalviCare navigation, payment return,
    deterministic outputs, or session state.

-   The same synthetic journey creates multiple HubSpot contacts,
    multiple D1 sessions, or duplicate payment entitlements.

-   No reliable way exists to correlate the synthetic customer across
    systems.

-   Any production resource is changed without explicit Human approval.
    \## 5.3 Codex Is Explicitly Forbidden To

-   add new product features, screens, AI/OpenAI, Make, Airtable write
    flows, a second Worker, or a new application framework;

-   change scoring weights, clinical logic, product pricing, deliverable
    semantics, or accepted Day 7A routing except for a proven bounded
    regression;

-   use Production Stripe objects, Production D1, Production HubSpot
    customer data, Production GA4 stream, or Production Clarity project
    to simulate Day 7C;

-   place HubSpot private tokens, Stripe secrets, admin tokens, or any
    other privileged secret in browser code or repository files;

-   make downstream adapters synchronous prerequisites to customer
    success;

-   create broad CRM workflows or marketing automations solely to pass
    Day 7C;

-   delete/rewrite real Production data to remove test contamination;
    stop and report instead;

-   deploy/merge/cut over public Production without a separate explicit
    Human directive. \# 6. Required Customer Identity, Correlation, and
    Traceability Contract

## 6.1 Minimum synthetic-customer naming standard

Name: Day7C Synthetic Founder `<UTC timestamp or run number>`{=html}
Email: day7c+`<run-id>`{=html}@`<approved-test-domain>`{=html} Venture:
GalviCare QA Venture `<run-id>`{=html} Environment: qa Test marker:
galvicare_test_record=true Run ID:
d7c\_`<YYYYMMDD_HHMM>`{=html}\_`<short-random>`{=html}

If the currently configured HubSpot or booking system would send a real
email to that address, use an inbox/domain owned for testing. Do not
invent a nonexistent email if doing so prevents the workflow from being
verified.

# 7. Canonical Journey and Event Taxonomy

Day 7C must preserve the canonical event model already defined during
Day 6/7 and make it consistent across D1 and GA4, with HubSpot
stage/last-event updates derived from the same business milestones.

## 7.1 Event envelope

{ "event_name": "triage_submitted", "session_id": "gc\_...", "run_id":
"d7c\_...", "environment": "qa", "product": "GalviTriage",
"current_stage": "GalviVitals", "event_version": "v0_5_1", "timestamp":
"server or client timestamp as appropriate", "source": "frontend \|
worker \| stripe \| adapter", "metadata": { "non_sensitive": "only" } }

# 8. Preflight Discovery and Readiness Audit

## 8.1 Copy/Paste Prompt --- Discovery Only

You are the implementation engineer for GalviCare 0.5 Day 7C. MODE:
ECOSYSTEM READINESS DISCOVERY ONLY. DO NOT edit files, deploy, merge,
change secrets, alter Stripe, write Production data, change HubSpot
workflows, change GA4/Clarity configuration, or create bookings.

Read CODEX_DAY7C_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md and
inspect the accepted Day 7B QA branch/worktree. Return ONE consolidated
report with:

1.  Candidate integrity

-   active branch/worktree
-   git status
-   accepted Day 7B candidate SHA
-   deployed QA frontend/Worker version
-   changed files since the accepted SHA, if any

2.  QA/Production environment map

-   frontend URLs
-   Worker names/routes
-   D1 bindings/database names
-   ENVIRONMENT/FIXTURE_MODE/test-override flags (values only; never
    reveal secrets)
-   Stripe TEST vs LIVE Payment Link/Checkout mappings by product (IDs
    masked if sensitive)
-   HubSpot QA/test-data vs Production strategy
-   GA4 QA vs Production property/data-stream configuration
-   Clarity QA vs Production project configuration
-   GalviClinic QA/test vs Production booking route

3.  Current integration implementation For D1, Stripe, HubSpot, GA4,
    Clarity, and GalviClinic identify exact files/functions/config
    owners and whether each adapter is implemented, partially
    implemented, absent, or unverified.

4.  Correlation contract Map galvicare_session_id, email, run_id,
    stripe_session_id, HubSpot contact ID, GA4 context, Clarity session
    evidence, and booking identifier. Identify gaps that prevent
    one-customer reconciliation.

5.  Event map Map every canonical Day 7C event to its D1 write, GA4
    event, HubSpot state effect, and QA evidence mechanism. Identify
    duplicates or inconsistent names.

6.  Non-blocking behavior Show whether HubSpot/GA4/Clarity failures can
    break the customer path. Flag any synchronous dependency.

7.  Production contamination risks Search QA source/config for
    Production Worker URLs, live Stripe links, Production analytics IDs,
    Production Clarity IDs, or unguarded HubSpot production behavior. Do
    not print secrets.

8.  Minimum Day 7C implementation delta List only the concrete bounded
    changes required to make the QA ecosystem testable and reconcilable.
    For each: file/config, reason, test, rollback.

9.  Automated test plan List exact existing/new tests and commands
    required before Human E2E.

10. FINAL DISCOVERY STATUS READY FOR DAY 7C IMPLEMENTATION / READY FOR
    HUMAN E2E / BLOCKED, with exact blockers.

Do not implement until the Human Product Owner authorizes the next
phase.

## 8.2 Discovery stop conditions

-   Accepted Day 7B SHA cannot be identified.
-   QA vs Production targets cannot be distinguished confidently.
-   QA frontend currently contains live Stripe links.
-   QA D1 binding points to Production.
-   No safe HubSpot QA/test-data strategy exists and the only available
    action would modify real customer state.
-   Production analytics/Clarity contamination cannot be prevented
    without configuration change requiring Human approval.
-   Required adapter token/secrets are missing and cannot be supplied
    securely. \# 9. QA Frontend / Worker / D1 Instrumentation Gate

Codex must inspect first and reuse existing abstractions. Add no new
event system if one canonical function already exists.

## 9.1 Frontend requirements

-   Expose no secrets. Public IDs such as GA4 Measurement ID or Clarity
    project ID may be configured in browser code only when that is the
    intended vendor model.

-   Use a single environment-aware analytics configuration source.

-   Attach environment=qa and run_id where appropriate and privacy-safe.

-   Fire events once at business milestones, not on every
    render/re-render.

-   Prevent refresh/back from duplicating canonical conversion events
    when the underlying transaction has not changed.

-   Preserve customer navigation when analytics calls fail. \## 9.2
    Worker requirements

-   Core transaction/result writes complete before HubSpot adapter
    calls.

-   HubSpot calls are wrapped in bounded timeout + try/catch and write
    safe adapter status/error evidence to D1.

-   Payment verification remains server-authoritative and independent of
    analytics.

-   Environment guard rejects QA requests/config that reference LIVE
    payment mode where detectable.

-   Health response identifies environment=qa and D1 binding health
    without leaking secrets.

-   If a dedicated adapter-status table exists, upsert by session_id +
    adapter + event/action rather than creating uncontrolled duplicates.
    \## 9.3 Optional additive adapter-status schema

Only create this if no equivalent table/status fields exist. Repository
reality controls naming.

CREATE TABLE IF NOT EXISTS adapter_deliveries ( id INTEGER PRIMARY KEY
AUTOINCREMENT, session_id TEXT NOT NULL, run_id TEXT, adapter TEXT NOT
NULL, event_name TEXT NOT NULL, status TEXT NOT NULL, external_id TEXT,
attempt_count INTEGER DEFAULT 1, safe_error_code TEXT, created_at TEXT
NOT NULL, updated_at TEXT NOT NULL, UNIQUE(session_id, adapter,
event_name, external_id) ); CREATE INDEX IF NOT EXISTS
idx_adapter_deliveries_session ON adapter_deliveries(session_id,
adapter);

# 10. Stripe TEST Integration and Revenue-Isolation Gate

1.  Confirm every QA paid product uses Stripe TEST mode.
2.  Confirm QA Payment Link/Checkout success URLs return to the approved
    QA customer route or approved canonical QA-compatible return path,
    not Production customer state.
3.  Confirm server-side payment verification uses test secret in QA and
    cannot be switched to live by browser parameters.
4.  Attach galvicare_session_id and product metadata when supported by
    the established checkout implementation.
5.  Upsert payment state idempotently by stripe_session_id and
    session_id + product.
6.  After payment return, emit stripe_success only after server
    verification succeeds.
7.  For Day 7C evidence, capture Stripe TEST checkout session/payment
    intent identifiers and payment status for reconciliation.
8.  Query or visually verify Stripe LIVE Payments remains unchanged by
    the synthetic run. \# 11. HubSpot QA Integration Contract

HubSpot is the operational "WHO needs action?" layer. Day 7C must prove
contact identity, journey state, intent, and next-best-action readiness
without making HubSpot a dependency of care.

## 11.1 Required minimum contact fields

## 11.2 HubSpot implementation rules

-   Upsert by email or the accepted unique contact key; do not create
    one contact per event.

-   Perform HubSpot sync only after D1/customer-facing operation
    succeeds.

-   Use encrypted Worker secret for private app token; never
    browser-side.

-   Use bounded timeout/retry behavior. Day 7C does not require a
    queueing platform if one is not already present.

-   On HubSpot failure: log adapter failure safely, preserve core
    response success, and make recovery evidence visible.

-   If no separate HubSpot sandbox exists, every synthetic record must
    carry galvicare_environment=qa and galvicare_test_record=true and
    must be excluded from production marketing automation and KPI
    reporting.

-   Do not create complex nurture workflows on Day 7C. Validate state
    capture and next-best-action readiness only. \## 11.3 HubSpot
    acceptance evidence

-   Exactly one synthetic contact exists.

-   Email and galvicare_session_id match the QA run.

-   Environment/test markers are correct.

-   Current stage and latest product reflect final journey state.

-   Paid-product state matches Stripe TEST/D1.

-   No Production customer was modified.

-   No real-customer marketing automation was triggered. \# 12. GA4 QA
    Analytics Contract

GA4 answers WHAT is happening in the funnel. Day 7C must validate event
arrival and sequence in the QA property/data stream, not merely that
gtag code exists.

## 12.1 Required QA analytics behavior

-   QA frontend loads only the approved QA GA4 Measurement ID/data
    stream.
-   Production Measurement ID is absent from QA runtime unless a
    formally approved dual-tagging design exists; dual-tagging is not
    required for Day 7C.
-   Canonical events use stable names and environment=qa.
-   Include non-sensitive dimensions such as product, stage,
    environment, run_id where already permitted.
-   Acquisition parameters (UTM/source/medium/campaign) survive enough
    of the journey to support attribution.
-   No raw triage answers, clinical narratives, email addresses, phone
    numbers, names, Stripe session IDs, or other PII are sent as GA4
    event parameters.
-   Analytics failure does not block customer progression. \## 12.2 GA4
    Human verification sequence

1.  Open GA4 QA DebugView/Realtime before starting the synthetic run if
    available.
2.  Start with a unique UTM campaign such as day7c_ecosystem_validation
    and record the exact link.
3.  At each critical milestone, observe or later verify the event in QA
    reporting.
4.  After the run, confirm a coherent progression from galvicare_started
    through clinic_booking_clicked.
5.  Open Production GA4 realtime/debug and confirm the Day 7C
    run_id/campaign does not appear. \# 13. Microsoft Clarity QA
    Behavioral-Intelligence Contract

Clarity answers WHY behavior occurred. Day 7C validates that the QA
session can be found and replayed without turning Clarity into a
transactional dependency.

-   QA frontend loads only the approved QA Clarity project ID.

-   Production Clarity project ID is absent from QA runtime.

-   Clarity script failure is ignored/logged non-blockingly.

-   Sensitive inputs must be masked by Clarity defaults/config and must
    not be intentionally added as custom tags.

-   Use privacy-safe custom tags only if already supported:
    environment=qa, run_id or journey_stage when allowed.

-   After the synthetic run, locate the corresponding recording using
    timestamp, page sequence, test campaign, or safe custom tag.

-   Validate that observed clicks/scrolls/navigation correspond to the
    human journey and identify any friction worth logging as post-launch
    optimization---not Day 7C feature scope.

-   Confirm the synthetic QA session does not appear in the Production
    Clarity project. \# 14. GalviClinic QA / Calendly Conversion
    Contract

-   Use the approved QA/test booking mechanism. If a separate Calendly
    sandbox does not exist, use a test-safe event/process explicitly
    designated for synthetic bookings.

-   Before redirect, write clinic_booking_clicked to D1 and fire GA4 QA.

-   Carry session_id/source_product in query/custom fields only where
    the booking platform supports it and privacy/security are
    acceptable.

-   Capture booking ID/event URI/status when available.

-   If the booking cannot be fully automated, a Human may complete the
    test booking and provide evidence; Codex must not fabricate
    appointment success.

-   Ensure the synthetic booking does not create an operational
    obligation to a real customer and is clearly marked/canceled if
    needed after evidence capture.

-   HubSpot should reflect high-intent/clinic-booking state only after
    the corresponding action succeeds or according to the accepted
    current contract. \# 15. Downstream Adapter Non-Blocking Failure
    Contract

Codex should implement automated adapter-failure tests with mocks/stubs
where practical. Do not deliberately break live SaaS accounts or rotate
credentials to simulate failure.

# 16. Synthetic Customer Test Persona and Test Data

## 16.1 Final-run cleanliness rules

-   Do not reuse an existing customer session.
-   Do not manually edit D1/HubSpot state mid-run.
-   Do not use browser console/localStorage edits to grant access.
-   Do not switch between QA and Production URLs.
-   Do not use live Stripe credentials or live Payment Links.
-   Record exact start time, end time, run ID, session ID, email alias,
    and browser mode. \# 17. Full Day 7C Human E2E Execution Script

This is the certification run. Codex prepares the environment and
automated checks; the Human Product Owner performs any SaaS
UI/payment/booking actions that require interactive access.

## 17.1 Phase A --- Acquisition / entry

1.  Open GA4 QA DebugView/Realtime and Clarity QA project in separate
    admin tabs if practical.

2.  Open Stripe Dashboard in TEST mode, HubSpot QA/test-data view, and
    QA D1 query access.

3.  Generate or record the unique QA entry URL with day7c campaign
    parameters.

4.  Open a fresh incognito browser and enter through that QA link.

5.  Record browser start timestamp and confirm QA environment
    marker/network target.

6.  Click the GalviCare start/entry CTA.

7.  Capture galvicare_started in D1 and expected GA4 QA evidence. \##
    17.2 Phase B --- GalviTriage / lead intelligence

8.  Begin GalviTriage; record triage_started.

9.  Use the agreed synthetic persona responses. Do not optimize answers
    to force a particular score unless the test contract requires a
    deterministic expected result.

10. Submit once; capture session_id immediately after it is known.

11. Verify D1 session/triage rows exist and are QA-only.

12. Verify triage_submitted event.

13. Verify exactly one HubSpot synthetic contact is created/updated with
    environment/test markers.

14. Verify GA4 QA event and that Clarity session recording has begun.
    \## 17.3 Phase C --- Free value / GalviVitals

15. Allow GalviVitals to render normally.

16. Capture screenshot and product/stage.

17. Verify diagnostic_viewed event in D1 and GA4 QA.

18. Verify HubSpot current_stage/last_event update if that is part of
    the accepted mapping.

19. Proceed using normal customer CTA. \## 17.4 Phase D --- Paid
    diagnostic progression

Repeat the following pattern for each paid product actually present in
the accepted QA journey (GalviScore, GalviShot, GalviSight, GalviPath as
applicable):

1.  Observe/capture paywall_viewed.

2.  Click unlock/checkout; verify stripe_click before redirect.

3.  Confirm Stripe opens in TEST mode.

4.  Complete checkout with an approved Stripe test payment method.

5.  Capture Stripe TEST Checkout Session/Payment evidence.

6.  Return to QA GalviCare.

7.  Allow Worker to confirm payment server-side; do not grant access
    from query parameters alone.

8.  Verify stripe_success, payment row, entitlement, correct product
    restoration, and deterministic/stored result.

9.  Verify diagnostic_viewed for the rendered paid result.

10. Verify HubSpot paid-product/current-stage update.

11. Verify GA4 QA events; note Clarity behavior.

12. Continue to the next product without manipulating browser state. \##
    17.5 Phase E --- GalviClinic treatment conversion

13. From the final diagnostic/pathway state, select the GalviClinic
    booking CTA.

14. Verify clinic_booking_clicked in D1 and GA4 QA before leaving the
    app.

15. Complete the QA/test-safe scheduling flow or reach the approved
    booking-confirmation state.

16. Capture booking evidence/identifier where available.

17. Verify HubSpot reflects the expected high-intent/booking state or
    recovery NBA.

18. Capture final GalviCare session state in D1.

19. Record Human E2E end timestamp. \## 17.6 Phase F --- No-touch rule

# 18. D1 / GalviVault Reconciliation

1.  Query the sessions record by galvicare_session_id.
2.  Query triage responses/raw evidence tied to the same session.
3.  Query diagnostic results for every rendered product and confirm one
    active result per session + product.
4.  Query payments/entitlements for each paid product.
5.  Query journey_events ordered by created_at/id.
6.  Query errors and adapter delivery/status evidence.
7.  Confirm final current_stage and booking status/intent.
8.  Confirm every row belongs to QA and there is no duplicate session
    split. \# 19. Stripe Reconciliation

# 20. HubSpot Reconciliation

1.  Search by synthetic email.

2.  Confirm one contact only.

3.  Record HubSpot contact ID.

4.  Confirm session_id, environment, test marker, run_id.

5.  Confirm final stage/last event/product/paid-product summary.

6.  Confirm next-best-action/recovery tag matches highest completed
    stage.

7.  Confirm no real-customer workflow/email was triggered.

8.  Confirm synthetic record is excluded from Production KPI reporting
    as designed. \# 21. GA4 Reconciliation

9.  Filter QA DebugView/Realtime/exploration by run_id/campaign where
    available.

10. Verify all expected critical events are present.

11. Verify event order is plausible and product/stage parameters are
    correct.

12. Verify acquisition source/medium/campaign reflect the entry URL.

13. Verify no PII is visible in event parameters.

14. Search Production GA4 for the unique Day 7C campaign/run marker;
    expected result = absent. \# 22. Clarity Reconciliation

15. Locate the QA session by timestamp, QA page URL, campaign, or safe
    tag.

16. Confirm page sequence matches the GalviCare journey.

17. Inspect for dead clicks/rage clicks/navigation confusion and record
    observations separately from PASS/FAIL unless they break the
    journey.

18. Confirm sensitive fields are masked as expected.

19. Search Production Clarity for the synthetic run
    marker/timestamp/page activity; expected result = absent. \# 23.
    GalviClinic Reconciliation

20. Find the QA/test booking or booking-attempt evidence.

21. Confirm synthetic email/name and session/source correlation where
    supported.

22. Confirm booking status matches D1/HubSpot state.

23. Confirm no unintended real-customer appointment or operational
    notification remains.

24. If a test booking was created on a real operational calendar,
    cancel/remove it after evidence capture according to the approved
    process, without deleting audit evidence. \# 24. Cross-System
    Customer 360 Reconciliation

## 24.1 Reconciliation matrix --- required final evidence

# 25. Duplicate / Missing / Out-of-Order Event Audit

# 26. Production-Contamination Audit

# 27. Security, Privacy, PII, and Secret Verification

-   Search frontend/source bundles for Stripe secret keys, HubSpot
    private tokens, webhook secrets, admin tokens, D1 credentials, or
    privileged Worker secrets; result must be zero.
-   Confirm only public vendor IDs intended for browser use are present
    client-side.
-   Confirm QA CORS does not allow arbitrary origins if the accepted
    architecture restricts origins.
-   Confirm browser parameters cannot grant paid entitlement.
-   Confirm analytics payloads do not contain email/name/raw triage
    responses/clinical narratives.
-   Confirm Clarity input masking and privacy settings are appropriate
    for assessment/payment screens.
-   Confirm HubSpot test records are clearly tagged and do not trigger
    real lifecycle communications.
-   Confirm logs and adapter error records contain safe error
    codes/messages rather than secret-bearing responses.
-   Confirm network requests from QA do not call Production Worker or
    payment endpoints. \# 28. Customer Intelligence Interpretation and
    Next-Best-Action Output

Day 7C is not complete merely because integrations emit data. The
ecosystem must support an actionable customer-management interpretation.

# 29. Evidence Package and Human Verification

## 29.1 Required evidence folder

evidence/day7c/`<run_id>`{=html}/ 00_run_manifest.md 01_preflight/
02_app/ 03_d1/ 04_stripe_test/ 05_hubspot/ 06_ga4_qa/ 07_clarity_qa/
08_galviclinic_qa/ 09_contamination_audit/ 10_reconciliation/
11_final_report/

## 29.2 Human screenshot/checkpoint set

Codex must not claim SaaS dashboard evidence it cannot access. Mark such
evidence HUMAN REQUIRED and provide the exact screen/filter/query the
Human should capture.

# 30. Defect Classification and One-Pass Correction Rule

## 30.1 Correction discipline

-   Patch the smallest responsible file/config.
-   Do not regenerate worker.js or index.html wholesale unless the
    defect demonstrably spans the entire file and replacement is safer
    than a targeted patch.
-   Preserve accepted Day 7A/7B contracts.
-   Run the smallest relevant automated tests first, then the affected
    human checkpoint, then final reconciliation if the defect changes
    shared state.
-   Do not repeat all Day 7C steps when only one downstream evidence
    path failed unless correlation/state changed. \# 31. Codex One-Pass
    Day 7C Execution Prompt

You are the implementation engineer for GalviCare 0.5 Day 7C. Read
CODEX_DAY7C_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md in full before
acting.

MISSION Make the accepted Day 7B QA candidate capable of proving one
complete synthetic-customer journey across the QA GalviCare ecosystem:
GalviCare QA -\> QA Worker/D1 -\> Stripe TEST -\> HubSpot QA/Test -\>
GA4 QA -\> Clarity QA -\> GalviClinic QA/Test -\> cross-system
reconciliation.

NON-NEGOTIABLES - Day 7A application behavior is frozen unless a proven
Day 7C integration regression requires a bounded fix. - Day 7B QA=BUILD
/ Production=RUN separation is frozen. - Do not touch Production
resources, LIVE Stripe, public routing, Production
analytics/CRM/Clarity/booking, or Production data. - No Make. No OpenAI.
No new product features. No framework rewrite. No second Worker. -
Downstream adapters must remain non-blocking. - Never expose secrets in
browser/source/output. - Use one canonical galvicare_session_id and one
Day 7C run_id for reconciliation. - One bounded correction pass only. No
loops.

EXECUTION 1. Run the Day 7C discovery audit and confirm the accepted Day
7B candidate SHA and QA/Production environment map. 2. Inspect existing
D1, Stripe, HubSpot, GA4, Clarity, and GalviClinic integrations. Reuse
existing abstractions. 3. Implement only missing QA-safe correlation,
environment guards, canonical event emission, adapter status/error
evidence, HubSpot test-record state, GA4 QA event mapping, Clarity QA
configuration, and Clinic QA traceability required by the guide. 4.
Add/update automated tests that prove: - QA never references live
Stripe/Production API targets; - HubSpot/GA4/Clarity failures do not
break the customer path; - canonical events are emitted idempotently; -
one session/product has one active entitlement/result; -
environment/test markers are present; - no secrets are present in
frontend source. 5. Run the full relevant test suite, lint/static
checks, git diff --check, and any existing
stabilization/source/deployment gates. 6. Produce a PRE-HUMAN-E2E report
with exact QA URLs, run prerequisites, expected event sequence, SQL
queries, and Human-required SaaS dashboard steps. 7. STOP for the Human
Product Owner to run the certification journey if any interactive
payment/CRM/analytics/Clarity/booking evidence cannot be produced by
automation. 8. After evidence is supplied, reconcile D1, Stripe TEST,
HubSpot, GA4 QA, Clarity QA, and GalviClinic QA against the same
session/run/customer. 9. Run the Production-contamination audit. 10. If
a P0/P1 failure exists, perform at most one bounded correction pass and
re-test only the affected scope plus shared reconciliation. 11. Produce
the final Day 7C report and binary status: READY --- DAY 7C ECOSYSTEM
VALIDATION PASSED or BLOCKED --- DAY 7C ECOSYSTEM VALIDATION FAILED

FINAL REPORT MUST INCLUDE - candidate SHA and changed files - QA
environment map - implementation delta - automated test results -
synthetic customer run manifest - expected vs actual event sequence - D1
reconciliation - Stripe TEST reconciliation - HubSpot reconciliation -
GA4 QA reconciliation - Clarity QA reconciliation - GalviClinic QA
reconciliation - duplicate/missing-event audit -
Production-contamination audit - security/privacy scan - current
customer lifecycle stage + next-best action - known P2/P3 limitations -
exact evidence paths/screens required from Human - binary READY/BLOCKED
decision

Do not create a PR, merge, deploy to Production, or alter public routing
unless separately instructed by the Human Product Owner.

# 32. Human Product Owner Verification Checklist

# 33. Pull Request / Release Record / Tagging

Day 7C may require code/config changes to QA. The release record must be
precise and must not imply Production launch.

-   PR title: GalviCare 0.5 Day 7C --- QA Ecosystem Validation
    Instrumentation (or equivalent).
-   PR body lists accepted Day 7B base SHA, exact Day 7C delta,
    automated tests, Human E2E status, and Production untouched
    statement.
-   No secret values in PR body/screenshots/logs.
-   If Day 7C passes, create an immutable QA evidence tag/reference such
    as galvicare-0.5-day7c-ecosystem-validated only after Human
    approval.
-   Production promotion remains a separate controlled action governed
    by the accepted release process. \# 34. Final Codex Report Template

# GalviCare 0.5 Day 7C --- Final Ecosystem Validation Report

## 1. Release identity

-   Branch:
-   Candidate SHA:
-   QA frontend:
-   QA Worker:
-   QA D1:
-   Day 7C run ID:
-   Synthetic email:
-   galvicare_session_id:

## 2. Day 7C implementation delta

| File/config \| Change \| Why \| Test \| Rollback \|

## 3. Automated verification

-   tests:
-   lint/static checks:
-   source/deployment gates:
-   diff check:
-   security scan:

## 4. Synthetic customer journey

| Stage \| Expected \| Actual \| Evidence \| PASS/FAIL \|

## 5. System reconciliation

### D1 / GalviVault

### Stripe TEST

### HubSpot QA/Test

### GA4 QA

### Clarity QA

### GalviClinic QA/Test

## 6. Cross-system identity matrix

| System \| ID \| Customer/session match \| Final state \| PASS/FAIL \|

## 7. Canonical event audit

| Event \| D1 \| GA4 QA \| HubSpot effect \| Expected order \| PASS/FAIL
  \|

## 8. Production-contamination audit

| Production system \| Search performed \| Result \| PASS/FAIL \|

## 9. Non-blocking adapter test

| Adapter \| Failure test \| Core path result \| PASS/FAIL \|

## 10. Security/privacy

-   frontend secret scan:
-   PII analytics scan:
-   CORS/environment:

## 11. Customer intelligence interpretation

-   final lifecycle stage:
-   treatment/commercial intent:
-   next-best GalviPro action:

## 12. Known limitations

-   P2/P3 only:

## 13. Human evidence still required

-   exact screen/filter/action:

## 14. Final decision

READY --- DAY 7C ECOSYSTEM VALIDATION PASSED or BLOCKED --- DAY 7C
ECOSYSTEM VALIDATION FAILED

No Production deployment/cutover is implied by this status.

# 35. Day 7C Exit Decision and Post-7C Handoff

## 35.1 READY --- Day 7C Ecosystem Validation Passed

Declare READY only when the final synthetic customer can be
reconstructed across the complete QA ecosystem and zero Production
contamination is proven. The approved statement is:

## 35.2 BLOCKED --- Day 7C Ecosystem Validation Failed

Declare BLOCKED when any P0 remains, any P1 remains after the bounded
correction pass, or required cross-system evidence cannot be reconciled
reliably. State the exact failing system and criterion; do not reopen
the entire application.

## 35.3 Post-7C operating handoff

-   QA remains the permanent BUILD environment and becomes the
    development environment for GalviCare MVP 1.0.
-   Production remains the RUN environment for real customers only.
-   Future releases promote code/config contracts forward; synthetic
    customer data does not migrate forward.
-   Launch optimization uses GA4 to identify WHAT is happening, Clarity
    to understand WHY, HubSpot to identify WHO needs action, GalviVault
    to preserve WHAT GALVIPRO KNOWS, Stripe to confirm WHAT WAS
    PURCHASED, and GalviEngine to determine WHAT SHOULD HAPPEN NEXT.
-   Day 7C evidence becomes the baseline for future release regression
    of the customer operating system. \# Appendix A. Day 7C Test Matrix

# Appendix B. Canonical Event Dictionary

# Appendix C. HubSpot Property / Stage Mapping

# Appendix D. GA4 QA Validation Matrix

# Appendix E. Clarity QA Validation Matrix

# Appendix F. SQL Reconciliation Queries

Codex must adapt table/column names to repository reality. Never run
destructive SQL. These are read-only patterns.

SELECT \* FROM sessions WHERE session_id = '`<SESSION_ID>`{=html}';
SELECT \* FROM triage_responses WHERE session_id =
'`<SESSION_ID>`{=html}' ORDER BY created_at; SELECT \* FROM
diagnostic_results WHERE session_id = '`<SESSION_ID>`{=html}' ORDER BY
product, generated_at; SELECT \* FROM payments WHERE session_id =
'`<SESSION_ID>`{=html}' ORDER BY created_at; SELECT \* FROM
journey_events WHERE session_id = '`<SESSION_ID>`{=html}' ORDER BY
created_at, id; SELECT \* FROM errors WHERE session_id =
'`<SESSION_ID>`{=html}' ORDER BY created_at;

-- Duplicate event review SELECT event_name, product, COUNT(*) AS n FROM
journey_events WHERE session_id = '`<SESSION_ID>`{=html}' GROUP BY
event_name, product HAVING COUNT(*) \> 1;

-- Duplicate payment/product review SELECT product, COUNT(*) AS n FROM
payments WHERE session_id = '`<SESSION_ID>`{=html}' AND
entitlement_status = 'active' GROUP BY product HAVING COUNT(*) \> 1;

-- Cross-session synthetic identity review (adapt founder/email table)
SELECT session_id, email, current_stage, created_at FROM sessions WHERE
email = '`<SYNTHETIC_EMAIL>`{=html}' ORDER BY created_at;

# Appendix G. Evidence Folder Structure

Every evidence item should be named with run_id + system + checkpoint.
Example: d7c_20260727_2300_ga4_triage_submitted.png. Avoid
secret-bearing screenshots. Redact sensitive token values before
inclusion.

# Appendix H. Critical-Path Defect Response Template

DEFECT ID: DAY 7C TEST ID: SEVERITY: P0 / P1 / P2 / P3 SYSTEM: App /
Worker / D1 / Stripe TEST / HubSpot / GA4 / Clarity / GalviClinic /
Cross-system ENVIRONMENT: QA / Production contamination evidence RUN ID:
SESSION ID: EXPECTED: OBSERVED: EVIDENCE: SUPPORTED ROOT CAUSE: SMALLEST
AFFECTED FILE/CONFIG: TARGETED CORRECTION: ACCEPTED DAY 7A/7B CONTRACT
CHANGED? YES/NO ROLLBACK REQUIRED? YES/NO AUTOMATED RETEST: HUMAN
RETEST: RESULT:

# Appendix I. Explicit Deferred Backlog

-   Full enterprise HubSpot marketing automation and advanced nurture
    workflows.
-   Customer-facing continuous-care portal and longitudinal 1.5
    experience.
-   OpenAI/LLM narrative generation, autonomous learning, transcript
    ingestion, and AI agent orchestration.
-   Enterprise identity/SSO, multi-tenant architecture, self-service
    rules/admin portal.
-   Advanced BI warehouse/CDP, multi-touch attribution modeling,
    automated reverse ETL.
-   Complex Calendly webhook orchestration if a manual/test-safe
    confirmation is sufficient for 0.5.
-   Real-time event bus/queue infrastructure solely for adapter
    reliability unless required by proven volume/failure needs.
-   New KPI dashboards beyond the minimum Day 7C reconciliation
    evidence.
-   Automated remediation of analytics/CRM discrepancies.
-   Production launch/cutover work not explicitly authorized as part of
    Day 7C. End of CODEX Day 7C Implementation Engineer Edition

  ----------------------------------------------------------------------------------------------
  Contract field                      Day 7C locked value
  ----------------------------------- ----------------------------------------------------------
  File                                CODEX_DAY7C_IMPLEMENTATION_ENGINEERING_GUIDE_v1_FINAL.md

  Release                             GalviCare 0.5 Day 7C / Integrated QA Ecosystem Validation

  Build theme                         Instrument • Integrate • Isolate • Traverse • Reconcile •
                                      Prove

  Execution target                    One preflight discovery pass; one bounded adapter
                                      correction pass; one complete synthetic-customer QA
                                      journey; one cross-system reconciliation

  Architecture                        QA = BUILD; Production = RUN. One QA frontend + Worker +
                                      D1. Stripe TEST. HubSpot QA strategy. GA4 QA. Clarity QA.
                                      GalviClinic QA/test path.

  Day 7C objective                    Prove that one synthetic customer can traverse the
                                      complete QA GalviCare ecosystem and leave traceable,
                                      internally consistent evidence in every required
                                      downstream system without contaminating Production.

  Authority                           Human Product Owner approval required before any change
                                      that touches Production, live Stripe, production
                                      analytics, production CRM data, public routing, secrets,
                                      or launch.
  ----------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  CRITICAL-PATH DIRECTIVE Day 7C is an ecosystem-integration and
  systems-UAT day, not a new-feature day and not a repeat of Day 7A/7B.
  Codex must preserve the accepted GalviCare 0.5 application and the
  permanent QA/Production separation already established. Day 7C may add
  or repair only the minimum non-blocking adapter instrumentation,
  correlation identifiers, QA configuration, evidence capture, and
  reconciliation logic required to prove the operating ecosystem. A
  downstream adapter failure must never break care, payment entitlement,
  deterministic outputs, or customer navigation.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Single Day 7C objective One synthetic QA customer enters GalviCare,
  completes the complete digital customer-acquisition and diagnostic
  journey, performs all required Stripe TEST transactions, reaches the
  GalviClinic QA booking path, and can then be reconstructed as the same
  customer/session across GalviVault, Stripe TEST, HubSpot QA, GA4 QA,
  Clarity QA, and GalviClinic QA---with zero Production data
  contamination.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  System                  Day 7C role             Required proof
  ----------------------- ----------------------- -----------------------
  GalviCare QA App        Digital acquisition /   Customer completes
                          diagnostic experience   journey with one stable
                                                  session and correct
                                                  stage/entitlement
                                                  progression.

  Cloudflare Worker /     Orchestration,          Canonical events and
  GalviEngine             deterministic           safe adapter calls are
                          intelligence, adapter   generated after core
                          execution               operations succeed.

  D1 / GalviVault QA      Authoritative journey   One queryable session
                          and clinical/customer   reconstructs customer
                          state                   input, outputs,
                                                  transactions, events,
                                                  and errors.

  Stripe TEST             Transaction +           Every paid test action
                          entitlement evidence    is test-mode only,
                                                  correlated to
                                                  session/product, and
                                                  absent from live
                                                  revenue.

  HubSpot QA strategy     WHO needs action        Contact/customer state,
                                                  lifecycle stage, last
                                                  event, product status,
                                                  recovery/NBA fields
                                                  reconcile to the
                                                  journey.

  GA4 QA                  WHAT is happening       Acquisition/funnel
                                                  events arrive in the QA
                                                  stream/property with
                                                  correct event names,
                                                  source, sequence, and
                                                  environment.

  Microsoft Clarity QA    WHY it is happening     The QA session is
                                                  observable and behavior
                                                  matches the human
                                                  journey without
                                                  Production
                                                  contamination.

  GalviClinic QA /        Treatment conversion    The booking CTA is
  Calendly                                        traceable to the same
                                                  session/customer and
                                                  uses a QA/test-safe
                                                  mechanism.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Day 7 phase contract Day 7A = Application stabilization. Day 7B =
  Environment separation and production cutover readiness. Day 7C = Full
  ecosystem validation. Codex must not use Day 7C as permission to
  revisit accepted product logic, scoring, routing, or UI unless a Day 7C
  integration defect proves that a bounded regression exists.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------
  Phase                   Accepted outcome        Day 7C treatment
                          entering Day 7C         
  ----------------------- ----------------------- -----------------------------------
  Day 7A                  GalviCare 0.5 customer  Treat as frozen application
                          journey functions       contract.
                          end-to-end.             

  Day 7B                  QA and Production are   Verify separation; do not redesign
                          independently           it.
                          deployable and clearly  
                          separated across        
                          frontend, Worker, D1,   
                          Stripe,                 
                          analytics/adapters.     

  Day 7C                  Not yet proven until    Build only missing
                          one synthetic customer  instrumentation/adapters/evidence
                          reconciles across the   necessary for validation.
                          QA ecosystem.           
  -----------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Permitted Day 7C workflow Day 7B handoff acceptance → discovery-only
  ecosystem audit → Human GO → minimum QA adapter/instrumentation build →
  automated adapter/unit checks → preflight gate → one synthetic-customer
  human E2E → system-by-system reconciliation → contamination audit → one
  bounded correction pass if required → exact re-test → final evidence
  package → READY / BLOCKED.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------
  Elapsed target    Checkpoint           Codex output        Human action
  ----------------- -------------------- ------------------- ------------------------
  0:00--0:30        Discovery +          Candidate SHA,      Approve build/test start
                    environment map      integration         once.
                                         inventory, exact    
                                         QA/PROD IDs/targets 
                                         by name, missing    
                                         pieces,             
                                         READY/BLOCKED.      

  0:30--1:30        Adapter /            Only missing        Review bounded change
                    instrumentation      QA-safe             set.
                    completion           integrations,       
                                         event/correlation   
                                         fields, config      
                                         guards, tests.      

  1:30--2:00        Automated preflight  Tests, lint, source Approve human E2E.
                                         scan, QA            
                                         environment         
                                         assertions, no LIVE 
                                         object detection.   

  2:00--2:45        Synthetic customer   One complete        Execute
                    Human E2E            journey; evidence   browser/Stripe/booking
                                         IDs captured at     steps.
                                         checkpoints.        

  2:45--3:30        Cross-system         D1 + Stripe +       Provide dashboard
                    reconciliation       HubSpot + GA4 +     screenshots where Codex
                                         Clarity + Clinic    cannot access SaaS UI.
                                         evidence matrix.    

  3:30--4:00        Correction/re-test   One targeted        Approve correction if
                    if required          correction set and  bounded.
                                         exact affected      
                                         re-tests only.      

  4:00--4:20        Final evidence +     PASS/FAIL matrix,   Final sign-off.
                    release record       contamination       
                                         audit, known        
                                         limitations, Day 7C 
                                         status.             
  -----------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  No looping After one bounded correction pass, a second materially
  different P0/P1 failure is a BLOCKED Day 7C outcome unless the Human
  Product Owner explicitly authorizes another pass. Do not repeat the
  same diagnostic sequence or regenerate unchanged files.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Hard architecture rule Code may move QA → Production after approval.
  Synthetic QA customer data must not move into Production. No QA test
  transaction, CRM contact, analytics event, Clarity session, or test
  booking may be counted as a real Production customer signal.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------------
  Boundary          QA required state  Production required      Day 7C assertion
                                       state                    
  ----------------- ------------------ ------------------------ ---------------------------
  Frontend          QA URL/build       Canonical public URL     QA browser never loads
                    marker                                      Production
                                                                API/analytics/live payment
                                                                objects.

  Worker            ENVIRONMENT=qa     ENVIRONMENT=production   Response
                                                                header/body/environment
                                                                checks distinguish them.

  D1                QA DB binding      Production DB binding    Synthetic customer exists
                                                                only in QA DB.

  Stripe            TEST mode          LIVE mode links/secrets  No live Payment Link or
                    links/secrets                               live session is reachable
                                                                from QA.

  HubSpot           QA/sandbox or      Real customer records    Synthetic contact cannot
                    synthetic-tagged                            trigger Production customer
                    test records                                communications/reporting.

  GA4               QA property/data   Production property/data QA events visible only in
                    stream             stream                   QA reporting/debug.

  Clarity           QA project         Production project       QA recording visible only
                                                                in QA project.

  Clinic            QA/test-safe       Live scheduling          Synthetic booking cannot
                    booking                                     create an unrecognized real
                                                                patient appointment.
  -----------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Traceability principle Day 7C can only pass if one synthetic customer
  can be reconstructed across systems without guessing. The authoritative
  primary journey key is galvicare_session_id. Email is the
  human-readable cross-system identity key where appropriate. Stripe
  session IDs, GA client/session identifiers, Clarity session evidence,
  HubSpot record ID, and booking ID are secondary correlation keys.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------
  Identifier             Created by             Stored/propagated   Rule
                                                to                  
  ---------------------- ---------------------- ------------------- -----------------
  galvicare_session_id   GalviCare QA           D1; HubSpot         Primary internal
                                                property; Stripe    journey
                                                metadata/return     correlation key.
                                                context where       Never regenerated
                                                supported; booking  mid-journey.
                                                query/custom field  
                                                where supported;    
                                                analytics event     
                                                parameter if        
                                                privacy-safe        

  synthetic_email        Human test persona     GalviCare; HubSpot; Use unique +day7c
                                                Stripe checkout     timestamped
                                                customer email if   synthetic
                                                collected; booking  identity; never
                                                                    reuse a real
                                                                    customer email.

  stripe_session_id      Stripe TEST            D1 payment record;  Unique per
                                                return              checkout; never
                                                handler/evidence    used as the sole
                                                                    customer key.

  hubspot_contact_id     HubSpot QA             Evidence pack;      Must resolve to
                                                optionally D1       one synthetic
                                                adapter status      contact only.

  ga_client_id / session GA4 browser            Evidence/debug only Do not expose or
  context                                       unless already      persist more data
                                                supported           than needed.

  clarity_session        Clarity QA             Evidence pack       Use
  evidence                                                          timestamp/page
                                                                    sequence; avoid
                                                                    PII in custom
                                                                    tags.

  booking_id / event URI Calendly/GalviClinic   Evidence pack; D1   Must correspond
                         QA                     if integration      to same synthetic
                                                exists              identity.
  -----------------------------------------------------------------------------------

  -----------------------------------------------------------------------------------
  Customer stage    Canonical event(s)            Product /         Expected
                                                  business meaning  downstream effect
  ----------------- ----------------------------- ----------------- -----------------
  Entry             galvicare_started             Customer enters   D1 event; GA4
                                                  GalviCare         event; optional
                                                                    HubSpot source
                                                                    attribution after
                                                                    identity capture.

  Assessment        triage_started                Assessment begins D1 + GA4.

  Assessment        triage_submitted              Assessment        D1 + GA4; HubSpot
                                                  completed / lead  upsert after core
                                                  qualified         write succeeds.

  Free value        diagnostic_viewed             GalviVitals or    D1 + GA4; HubSpot
                                                  paid diagnostic   last
                                                  result rendered   product/stage
                                                                    update.

  Monetization      paywall_viewed                Customer sees     D1 + GA4.
                                                  paid product      
                                                  value proposition 

  Context           clinical_followup_viewed /    Clarifying        D1 + GA4; HubSpot
                    clinical_followup_submitted   customer          latest context if
                                                  intelligence      mapped.
                                                  captured          

  Checkout          stripe_click                  Stripe TEST       D1 + GA4 before
                                                  checkout begins   redirect.

  Entitlement       stripe_success                Server-verified   D1 + GA4 after
                                                  test payment      verification;
                                                  return completes  HubSpot
                                                                    paid-product
                                                                    state.

  Progression       continue_clicked              Customer advances D1 + GA4.
                                                  to next product   

  Treatment         clinic_booking_clicked        GalviClinic       D1 + GA4; HubSpot
  conversion                                      booking selected  high-intent
                                                                    stage/NBA.

  Error             journey_error                 Recoverable       D1 safe error +
                                                  failure           optional GA4
                                                                    technical event;
                                                                    never
                                                                    PII/secrets.

  Facilitator       fcd_reviewed                  Protected         D1 + operational
                                                  customer summary  evidence where
                                                  reviewed          applicable.
  -----------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Event rule Do not put raw triage answers, private clinical text, Stripe
  secrets, HubSpot tokens, or customer-sensitive free text into GA4 or
  Clarity custom event metadata. D1/GalviVault is the richer
  authoritative clinical/customer record.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Schema restriction Do not create this table if existing
  journey_events/errors/payment/contact-sync fields already provide
  equivalent traceability. Day 7C prefers reuse over schema expansion.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Critical Stripe isolation assertion A Day 7C run that creates any LIVE
  charge or LIVE entitlement is an immediate NO-GO. Test success URLs or
  paid=... query parameters are return signals only; they never grant
  permanent access without server verification.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Property / logical      Required Day 7C meaning Update timing
  field                                           
  ----------------------- ----------------------- -----------------------
  email                   Unique synthetic        On/after Triage
                          customer identity       identity capture.

  galvicare_session_id    Primary internal        Initial upsert; never
                          journey key             replaced by another
                                                  session during the run.

  galvicare_environment   qa                      Every Day 7C synthetic
                                                  record.

  galvicare_test_record   true                    Hard tag for exclusion
                                                  from real customer
                                                  automation/reporting.

  galvicare_run_id        Day 7C run ID           Initial upsert.

  current_stage           Current GalviCare stage After successful
                                                  core-stage progression.

  last_event              Latest canonical        After event.
                          milestone               

  last_product            Latest product          After product
                          viewed/obtained         transition.

  paid_products /         Products                After verified Stripe
  entitlement summary     server-verified as      TEST success.
                          entitled                

  recovery_tag /          Operational follow-up   Derived from highest
  next_best_action        segmentation            completed stage / next
                                                  missing action.

  source / campaign       Acquisition attribution On first known source;
                          where available         do not overwrite
                                                  unnecessarily.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Expected tool delay Clarity recordings may not be instant. If the
  session is not immediately available, Day 7C may mark Clarity as
  PENDING EVIDENCE only when the script/project/environment are verified,
  no Production contamination exists, and the run is later reconciled
  before final sign-off.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Core rule HubSpot, GA4, and Clarity are downstream
  observability/engagement adapters. They may fail without denying a
  customer GalviVitals, a paid entitlement, a deterministic diagnostic,
  or the GalviClinic path.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------------
  Failure injected /      Customer-path expected  Evidence expected
  simulated               result                  
  ----------------------- ----------------------- --------------------------------
  HubSpot API unavailable Core D1 write and       D1 adapter error/status; no
  / token missing in      result/entitlement      browser secret; retry/manual
  controlled QA test      succeed; response       recovery path documented.
                          remains usable.         

  GA4 blocked by          Journey continues       D1 canonical events still
  browser/ad blocker      normally.               reconstruct path.

  Clarity script blocked  Journey continues       No JS exception that breaks app;
                          normally.               D1/GA4 continue.

  Stripe verification     Paid product must NOT   Payment pending/error evidence;
  unavailable             unlock permanently;     core free content/session
                          show pending/retry      remains intact.
                          safely.                 

  Calendly unavailable    Customer sees fallback  clinic_booking_clicked/failure
                          contact/scheduling      evidence; no false booking
                          action if existing      status.
                          contract provides one.  
  --------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  One customer. One session. One complete journey. Every ecosystem system
  reconciles. Zero Production contamination. Use one fresh synthetic
  customer for the final Day 7C certification run. Prior test records may
  be used for engineering checks, but final evidence must come from one
  clean run.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------------------
  Field                               Required final-run value
  ----------------------------------- ----------------------------------------------------------
  Run ID                              d7c\_`<date>`{=html}*`<time>`{=html}*`<short-id>`{=html}

  Founder name                        Day7C Synthetic Founder `<run-id>`{=html}

  Email                               Unique test inbox/alias controlled by GalviPro

  Venture                             Day7C QA Venture `<run-id>`{=html}

  Entry URL                           QA URL with unique UTM source/medium/campaign

  Browser                             Fresh incognito/private window

  Payment method                      Stripe TEST approved test card / method only

  Expected path                       GalviTriage → GalviVitals → GalviScore → GalviShot →
                                      GalviSight → GalviPath → GalviClinic QA

  Test marker                         galvicare_test_record=true / equivalent

  Evidence owner                      Human Product Owner + Codex report
  ----------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  No repair during certification If the final run fails, stop at the
  failing checkpoint and preserve evidence. Do not manually patch the
  contact, edit D1 rows, change localStorage, replay webhooks, or
  fabricate analytics/booking evidence just to complete the journey. Fix
  only after the defect is classified and authorized.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Check                               Pass condition
  ----------------------------------- -----------------------------------
  Mode                                Every Day 7C checkout exists in
                                      TEST mode.

  Identity                            Checkout customer email/metadata
                                      matches synthetic identity where
                                      supported.

  Session correlation                 stripe_session_id maps to D1
                                      payment and correct
                                      galvicare_session_id/product.

  Payment state                       Verified success/pending/failure
                                      matches D1 entitlement state.

  Duplicates                          No duplicate charge/session caused
                                      by refresh/back.

  LIVE contamination                  No Day 7C transaction appears in
                                      Stripe LIVE.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  The Day 7C reconciliation equation GalviCare Customer A = D1 Session A
  = Stripe TEST Payments A = HubSpot Contact A = GA4 QA Journey A =
  Clarity QA Session A = GalviClinic QA Conversion A.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  ------------------------------------------------------------------------------
  Question                Authoritative / primary Day 7C answer must be
                          system                  reconstructable
  ----------------------- ----------------------- ------------------------------
  How did this customer   GA4 QA + entry UTM      Source / medium / campaign /
  find GalviCare?                                 entry timestamp.

  Who are they?           D1 + HubSpot            Synthetic identity, session,
                                                  venture, environment/test
                                                  marker.

  What did they tell us?  D1 / GalviVault         Triage evidence and clarifying
                                                  context.

  What did GalviCare      D1 diagnostic results   Vitals/Score/Shot/Sight/Path
  conclude?                                       outputs and rule versions.

  What did they buy?      Stripe TEST + D1        Products, verified payment
                                                  state, entitlement.

  What did they do?       D1 + GA4 QA             Ordered funnel progression.

  Where did they          Clarity QA + GA4        Behavioral friction /
  hesitate?                                       abandonment signals.

  Where are they now?     HubSpot + D1            Current lifecycle stage and
                                                  customer intent.

  What should GalviPro do HubSpot +               Next-best customer action /
  next?                   GalviEngine-derived     recovery / treatment
                          logic                   follow-up.
  ------------------------------------------------------------------------------

  ----------------------------------------------------------------------------------------------
  System        External/internal   Environment   Final          Matches             PASS/FAIL
                ID                                stage/status   session/customer?   
  ------------- ------------------- ------------- -------------- ------------------- -----------
  D1 /                              QA                                               
  GalviVault                                                                         

  Stripe                            TEST                                             

  HubSpot                           QA/Test                                          

  GA4                               QA                                               

  Clarity                           QA                                               

  GalviClinic                       QA/Test                                          
  ----------------------------------------------------------------------------------------------

  -------------------------------------------------------------------------------------
  Audit                   Method                          Pass condition
  ----------------------- ------------------------------- -----------------------------
  Duplicate canonical     D1 GROUP BY                     No duplicate conversion event
  events                  session_id,event_name,product   caused by refresh/re-render;
                          plus business-key review        repeated view events only
                                                          where explicitly allowed.

  Missing events          Compare actual sequence to      No missing critical
                          expected event dictionary       acquisition/payment/booking
                                                          milestones.

  Out-of-order events     Order D1 events by server       Payment success does not
                          timestamp/id and compare GA4    precede checkout; booking
                          sequence                        click does not precede final
                                                          path stage; etc.

  Duplicate HubSpot       Search synthetic email/session  Exactly one contact.
  contact                 ID                              

  Duplicate entitlement   D1 payment/entitlement          One active entitlement per
                          uniqueness checks               session + product.

  Multiple sessions       Search synthetic email/run ID   Exactly one intended customer
                          across QA D1                    journey session unless the
                                                          current accepted architecture
                                                          explicitly creates a known
                                                          parent/child relationship.
  -------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Zero Production contamination is a Day 7C P0 requirement The purpose of
  Day 7B separation is defeated if Day 7C test data enters Production.
  Therefore contamination checks are part of the certification, not
  optional cleanup.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Production system       Search key              Expected result
  ----------------------- ----------------------- -----------------------
  Production D1           synthetic email /       0 rows.
                          session_id / run_id     

  Stripe LIVE             synthetic email /       0 live transactions.
                          timestamp / product     

  HubSpot Production      synthetic email / test  No real-customer
  reporting/automation    marker / run ID         KPI/automation impact;
                                                  ideally no record
                                                  unless deliberate
                                                  tagged test-data
                                                  strategy uses one
                                                  portal.

  GA4 Production          day7c campaign/run      No events.
                          marker                  

  Clarity Production      QA URL / run marker /   No QA session.
                          timestamp               

  GalviClinic Production  synthetic name/email    No unintended live
                                                  appointment.
  -----------------------------------------------------------------------

  -------------------------------------------------------------------------
  Observed final state    Example operational     Expected next-best action
                          interpretation          category
  ----------------------- ----------------------- -------------------------
  Triage + Vitals only    Lead received free      GalviScore education /
                          value but did not       trust-building recovery.
                          monetize.               

  GalviScore paid; no     Diagnostic buyer with   Explain why deeper
  GalviShot               limited depth intent.   findings matter.

  GalviShot paid; no      Understands condition   GalviSight
  GalviSight              but has not purchased   recovery/nurture.
                          action guidance.        

  GalviSight paid; no     High action intent but  GalviPath
  GalviPath               no formal pathway       treatment-qualification
                          progression.            CTA.

  GalviPath complete; no  Very high treatment     Priority GalviClinic
  Clinic booking          intent, unresolved      booking recovery.
                          conversion.             

  Clinic booked           Acquisition complete;   Prepare clinical summary
                          treatment pipeline      / treatment discussion /
                          created.                retention plan.
  -------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Day 7C output principle The final report must state the synthetic
  customer's current lifecycle stage and the correct GalviPro next-best
  action. This proves HubSpot/analytics data is operationally useful, not
  merely collectible.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  Checkpoint                          Minimum evidence
  ----------------------------------- -----------------------------------
  A                                   QA entry URL + environment marker /
                                      browser address bar.

  B                                   GalviTriage completed / session ID
                                      captured.

  C                                   GalviVitals rendered.

  D                                   Each paid product paywall + Stripe
                                      TEST checkout.

  E                                   Each paid return/result.

  F                                   Final GalviPath / treatment
                                      qualification state.

  G                                   GalviClinic QA/test booking state.

  H                                   Stripe TEST dashboard transactions.

  I                                   HubSpot synthetic contact record.

  J                                   GA4 QA DebugView/Realtime events.

  K                                   Clarity QA recording/session.

  L                                   D1 query output for
                                      session/events/payments.

  M                                   Production-contamination searches
                                      showing zero/expected isolation.
  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------
  Priority                Definition                   Day 7C action
  ----------------------- ---------------------------- -----------------------
  P0                      Environment contamination;   Immediate BLOCK.
                          live charge from QA; wrong   Correct only if bounded
                          customer/session; duplicate  and authorized;
                          paid entitlement; core       otherwise rollback.
                          customer path broken by      
                          adapter; exposed secret;     
                          cannot reconcile customer    
                          identity.                    

  P1                      Missing critical             One bounded correction
                          HubSpot/GA4/Clarity/Clinic   pass, then exact
                          evidence; wrong stage        re-test.
                          mapping; important event     
                          duplicated/missing;          
                          analytics adapter causes     
                          recurring errors; no         
                          reliable recovery/NBA state. 

  P2 trust/measurement    Noncritical event parameter  Document or fix only if
                          mismatch, delayed Clarity    low risk and bounded.
                          evidence, minor dashboard    
                          mapping issue that does not  
                          change customer truth.       

  P3                      Cosmetic reporting polish,   Defer.
                          optional dashboard, advanced 
                          segmentation, new            
                          automation.                  
  ----------------------------------------------------------------------------

  -----------------------------------------------------------------------
  \#                      Human verification      PASS/FAIL
  ----------------------- ----------------------- -----------------------
  1                       Accepted Day 7B         
                          candidate and QA URL    
                          are correct.            

  2                       Fresh synthetic         
                          identity/run ID used.   

  3                       QA entry uses QA        
                          Worker/D1 and no        
                          Production network      
                          targets.                

  4                       All paid checkouts are  
                          Stripe TEST.            

  5                       Core GalviCare journey  
                          completes without       
                          manual state repair.    

  6                       One D1 session          
                          reconstructs the whole  
                          journey.                

  7                       Exactly one HubSpot     
                          synthetic contact       
                          exists with QA/test     
                          markers.                

  8                       GA4 QA shows the        
                          critical funnel         
                          sequence.               

  9                       Clarity QA              
                          session/recording is    
                          present or              
                          pending-evidence        
                          exception is resolved   
                          before final sign-off.  

  10                      GalviClinic QA/test     
                          booking path completes. 

  11                      Stripe TEST, HubSpot,   
                          GA4, Clarity, and       
                          Clinic evidence maps to 
                          the same                
                          customer/session.       

  12                      No duplicate/missing    
                          critical events or      
                          entitlements.           

  13                      No Production           
                          contamination across    
                          D1, Stripe LIVE,        
                          HubSpot real            
                          reporting/automation,   
                          GA4, Clarity, Clinic.   

  14                      No secret/PII leakage   
                          identified.             

  15                      Final lifecycle stage   
                          and next-best action    
                          are correct.            
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  READY statement GalviCare 0.5 Day 7C PASS: one synthetic QA customer
  completed the integrated GalviCare ecosystem; payment, CRM,
  quantitative analytics, behavioral analytics, GalviVault state, and
  treatment-conversion evidence reconcile to the same customer/session;
  no critical duplicate/missing events were found; downstream adapters
  remained non-blocking; and no Production customer/revenue/analytics
  data was contaminated.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------------------------
  ID             Area             Scenario           Pass criteria                       Status
  -------------- ---------------- ------------------ ----------------------------------- --------------
  D7C-01         Environment      QA health/config   QA                                  
                                                     frontend/Worker/D1/analytics/test   
                                                     payments identifiable; no           
                                                     Production targets.                 

  D7C-02         Acquisition      Unique UTM entry   GA4 QA and D1 record start;         
                                                     Production GA4 absent.              

  D7C-03         Identity         Triage synthetic   One D1 session + one HubSpot        
                                  contact            synthetic contact.                  

  D7C-04         Free value       Vitals render      D1/GA4 event; no adapter            
                                                     dependency.                         

  D7C-05         Payment          GalviScore TEST    Server-verified entitlement; Stripe 
                                  checkout           TEST only.                          

  D7C-06         Payment          GalviShot TEST     Correct product/session and         
                                  checkout           idempotent payment.                 

  D7C-07         Payment          GalviSight TEST    Correct product/session and         
                                  checkout           downstream event state.             

  D7C-08         Payment          GalviPath TEST     Correct product/session and         
                                  checkout           treatment qualification.            

  D7C-09         Clinic           QA booking         D1/GA4 click + booking evidence +   
                                                     HubSpot stage.                      

  D7C-10         HubSpot          Final contact      Stage/last event/paid products/NBA  
                                  state              match D1/Stripe.                    

  D7C-11         GA4              Full funnel        Expected events visible in QA in    
                                                     plausible order.                    

  D7C-12         Clarity          Session replay     QA session corresponds to journey;  
                                                     sensitive data masked.              

  D7C-13         D1               Journey            One session reconstructs            
                                  reconstruction     results/payments/events/errors.     

  D7C-14         Duplicates       Refresh/back       No duplicate                        
                                  protections        conversion/entitlement/contact.     

  D7C-15         Adapter failure  HubSpot            Core journey succeeds; safe         
                                  unavailable        error/recovery evidence.            

  D7C-16         Adapter failure  Analytics blocked  Core journey succeeds; D1 still     
                                                     authoritative.                      

  D7C-17         Security         Frontend/network   No secrets, privileged tokens, or   
                                  scan               Production calls.                   

  D7C-18         Isolation        Production         Zero QA data in Production systems. 
                                  contamination                                          
                                  audit                                                  

  D7C-19         Reconciliation   Customer 360       All systems map to same synthetic   
                                  equation           customer/session.                   

  D7C-20         Actionability    Next-best action   Final lifecycle stage and NBA are   
                                                     unambiguous.                        
  -----------------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------------------
  Event                         Required trigger  Idempotency /     Minimum safe
                                                  duplication note  parameters
  ----------------------------- ----------------- ----------------- -----------------
  galvicare_started             Entry             Once per new      environment,
                                CTA/customer      session/run       run_id,
                                start                               source/campaign

  triage_started                First assessment  Once per          environment,
                                interaction       assessment start  run_id

  triage_submitted              Accepted submit   Once per          environment,
                                response          successful        run_id, stage
                                                  submission        

  diagnostic_viewed             Product result    One per first     environment,
                                visible           successful        product, stage
                                                  product render;   
                                                  repeated views    
                                                  only if           
                                                  intentionally     
                                                  tracked           
                                                  separately        

  paywall_viewed                Paywall visible   Avoid duplicate   environment,
                                                  firing on same    product
                                                  re-render         

  clinical_followup_viewed      Follow-up panel   Once per          environment,
                                visible           product/context   product
                                                  interaction       

  clinical_followup_submitted   Accepted          Once per accepted environment,
                                follow-up save    save              product

  stripe_click                  Checkout redirect Once per checkout environment,
                                initiated         attempt           product

  stripe_success                Server-verified   Exactly once per  environment,
                                payment return    verified checkout product
                                                  session/product   

  continue_clicked              Customer          Per intentional   environment,
                                continues         click             from_product,
                                                                    to_stage

  clinic_booking_clicked        Treatment booking Once per          environment,
                                CTA               intentional       source_product
                                                  booking attempt   

  journey_error                 Recoverable error Per distinct      environment,
                                                  error instance;   action,
                                                  suppress noisy    safe_error_code
                                                  repeats where     
                                                  supported         

  fcd_reviewed                  Protected summary Per facilitator   environment; no
                                opened            review event      raw clinical data
                                                                    in analytics
  -----------------------------------------------------------------------------------

  -----------------------------------------------------------------------------------------
  Logical field                Example value            Required?         Notes
  ---------------------------- ------------------------ ----------------- -----------------
  galvicare_session_id         gc\_...                  Yes               Primary internal
                                                                          journey
                                                                          correlation.

  galvicare_environment        qa                       Yes               Hard QA marker.

  galvicare_test_record        true                     Yes               Exclusion marker.

  galvicare_run_id             d7c\_...                 Yes               Certification
                                                                          run.

  current_stage                GalviPath / GalviClinic  Yes               Final journey
                                                                          state.

  last_event                   clinic_booking_clicked   Yes               Latest canonical
                                                                          milestone.

  last_product                 GalviPath                Recommended       Latest meaningful
                                                                          product.

  paid_products                GalviScore, GalviShot,   Recommended       Use accepted
                               ...                                        property
                                                                          type/format.

  recovery_tag                 clinic_recovery          Recommended       Operational
                                                                          segment.

  next_best_action             Book GalviClinic /       Recommended       Derived
                               follow-up                                  operational
                                                                          action.

  utm_source/medium/campaign   birthday / referral /    Recommended       Do not overwrite
                               day7c                                      first-touch
                                                                          attribution
                                                                          carelessly.
  -----------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  Validation              Human/Codex method      Pass
  ----------------------- ----------------------- -----------------------
  QA Measurement ID only  Inspect                 
                          source/network/config   

  Realtime/Debug event    GA4 QA                  
  arrival                 DebugView/Realtime      

  Canonical event names   Compare to Appendix B   

  Campaign attribution    Unique day7c UTM        

  Product/stage params    Inspect event details   

  No PII                  Inspect payload/debug   
                          parameters              

  Production isolation    Search Production GA4   
                          for run/campaign marker 
  -----------------------------------------------------------------------

  Validation                 Method                                Pass
  -------------------------- ------------------------------------- ------
  QA project ID only         Inspect script/config/network         
  Session exists             Search by timestamp/URL/safe tag      
  Journey sequence matches   Replay pages/clicks                   
  Sensitive fields masked    Inspect recording                     
  No fatal JS interaction    Browser console + completed journey   
  Production isolation       Search Production project             

  -----------------------------------------------------------------------
  FINAL CONTRACT Day 7C passes only when the GalviPro customer operating
  system---not merely the GalviCare browser application---can tell one
  consistent, traceable, actionable story about one synthetic QA customer
  from acquisition through treatment conversion, while preserving strict
  QA/Production separation.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
