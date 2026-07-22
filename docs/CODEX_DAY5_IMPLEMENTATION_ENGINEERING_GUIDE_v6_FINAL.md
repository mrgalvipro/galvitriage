# GALVICARE™ 0.5
# DAY 5 BUILDER GUIDE — CODEX IMPLEMENTATION ENGINEER EDITION

**File:** `CODEX_DAY5_IMPLEMENTATION_ENGINEERING_GUIDE_v6_FINAL.md`  
**Release:** GalviCare 0.5 Day 5  
**Build theme:** Convert • Verify • Book • Recover • Prove  
**Execution target:** One concentrated three-hour QA build session  
**Architecture:** No Make • No OpenAI • One Cloudflare Worker + D1 • Browser presentation only  
**Authority:** Human Product Owner approval required before implementation, merge, production deployment, live secret changes, or production data changes.

---

## Document Purpose

This document is simultaneously:

1. the Human Product Owner supervision runbook;
2. Codex’s authoritative Day 5 engineering contract;
3. the Day 5 QA and rollback plan; and
4. the formal handoff from Day 4 to Day 6.

Repository reality controls exact implementation details. This guide controls scope, security, payment authority, transactional behavior, acceptance, and prohibited behavior. When repository reality conflicts with this guide, Codex must stop and report the conflict instead of improvising.

Day 5 completes clinical conversion and transactional integrity. A founder must be able to move from the stored Day 4 care pathway into GalviClinic, complete one verified Stripe test transaction for the intended product, retain entitlement after refresh, follow the booking route, and continue even when HubSpot is unavailable.

---

# PART A — CONCENTRATED CODEX SESSION RUNBOOK

## 0. Operating Model

The permitted workflow is:

**Builder Guide → one discovery-only report → one human authorization → one bounded QA implementation → checkpoint tests → Codex self-review → one human live QA pass → GO / BLOCK decision**

No repeated discovery loop is permitted unless repository reality changes after the approved discovery report. No repository-wide rewrite is permitted. No failed test justifies restarting Day 5; Codex must isolate the failed acceptance criterion and apply one targeted correction.

### Three-Hour Timebox

| Elapsed target | Checkpoint | Codex output | Human action |
|---|---|---|---|
| 0:00–0:25 | Discovery | Consolidated repository report, risks, changed-file plan, migration, rollback, READY/BLOCKED | Approve once or block |
| 0:25–0:45 | Contracts | Final API, schema, payment, entitlement, Clinic, booking, HubSpot and test contracts | Approve commercial and payment semantics |
| 0:45–1:45 | D1 + backend | Additive migration, Worker actions, Stripe verification, entitlement, Clinic record, non-blocking HubSpot, backend tests | Review exact test output |
| 1:45–2:25 | Frontend integration | Payment return handling, entitlement restore, Clinic brief, booking CTA, fallback and safe errors | Confirm browser presentation-only boundary |
| 2:25–2:50 | Full QA | Payment, refresh, duplicate, failure, booking, HubSpot, security and Days 1–4 regression evidence | Perform one live QA pass |
| 2:50–3:00 | PR recommendation | Reviewable diff, migration/rollback, GO/BLOCK reasons | Independent approval decision |

### Timebox Rule

If a test fails, Codex must identify:

- the exact acceptance criterion;
- the smallest affected file set;
- the root cause supported by evidence;
- the targeted correction;
- the exact re-test.

Codex must not reopen discovery, change architecture, replace the Worker, or refactor unrelated code to solve one failed criterion.

---

## 1. Day 5 Mission and Release Gate

Day 5 is accepted only when all of the following are true:

| Area | Required release behavior |
|---|---|
| GalviClinic conversion | The stored Day 4 pathway produces a coherent Clinic conversion brief without recomputing or changing Day 2–4 outputs. |
| Stripe authority | Permanent access is granted only after Worker-side Checkout Session verification or a verified Stripe webhook. |
| Product mapping | The verified Stripe price/product maps to exactly one approved GalviCare product. |
| Entitlement | The correct product entitlement survives refresh and reopening of the same session. |
| Idempotency | Replayed webhooks, repeated return-page calls and refreshes do not duplicate payments, entitlements, Clinic records or bookings. |
| Booking | The approved booking route opens with the session and source product preserved where supported. |
| Booking recovery | A visible contact fallback remains available when scheduling fails or is unavailable. |
| HubSpot | HubSpot is called only after customer-facing persistence succeeds; HubSpot failure is logged and never blocks the founder. |
| Security | No secret, signature verification, entitlement rule, product mapping or proprietary Clinic logic is shipped to the browser. |
| Regression | Day 1–4 APIs, stored outputs, routes, session continuity, CORS, GA4 and Clarity remain functional. |
| Rollback | Git, Worker and D1 rollback steps are documented and executable before the PR is recommended. |

### Day 5 GO

GO only when one Stripe test checkout unlocks exactly the intended product, the entitlement remains active after refresh, one Clinic booking path completes or reaches an approved pending state, duplicate operations remain idempotent, HubSpot failure is non-blocking, and Days 1–4 pass regression.

### Day 5 BLOCK

BLOCK when any of the following occurs:

- a URL parameter or browser storage grants permanent access;
- Stripe signature or Checkout Session verification is absent;
- product mapping is ambiguous or client-controlled;
- entitlement disappears on refresh;
- duplicate payments, entitlements, Clinic records or bookings are created;
- booking can occur for an ineligible session when eligibility is required;
- HubSpot failure produces a customer-facing failure;
- proprietary rules or secrets appear in browser-delivered code;
- Day 1–4 behavior regresses;
- rollback is incomplete.

---

## 2. Codex Responsibilities and Prohibitions

### Codex Responsibilities

Codex must:

1. map the current repository before editing;
2. identify the exact QA Worker source and action router;
3. identify the current Stripe Payment Links or Checkout implementation;
4. identify the current payment return URLs and all client-side access logic;
5. identify D1 payment, entitlement, journey-event, error and Clinic-related tables;
6. identify current GalviClinic UI, booking CTA, Calendly URL and fallback;
7. identify HubSpot integration and recovery behavior;
8. produce one additive migration plan;
9. implement server-side payment verification and idempotent entitlement;
10. implement Clinic conversion and booking event persistence;
11. keep HubSpot non-blocking;
12. write or extend tests;
13. run exact commands and provide exact results;
14. provide migration, rollback, manual QA and PR evidence.

### Codex Is Explicitly Forbidden To

- Change Day 2 question contracts, scoring, dimensions, weights or rules versions.
- Change Day 3 finding eligibility, ranking, confidence, evidence or stored result semantics.
- Change Day 4 interpretation, urgency, pathway selection or 30/60/90 sequencing.
- Recompute stored Day 2–4 results during Day 5.
- Trust `paid=...`, `success=true`, product query strings, localStorage, sessionStorage or browser state as payment proof.
- Put Stripe secret keys, webhook secrets, HubSpot tokens, server-side product maps, entitlement rules or Clinic treatment rules in frontend code.
- Create a second Worker or bypass the existing Worker action router.
- Add Make, OpenAI or Airtable to the customer execution path.
- Apply destructive D1 migrations.
- Modify production D1, live Stripe mode, live secrets, main branch or production deployment.
- Merge or approve the PR.
- Convert HubSpot into a blocking dependency.
- Expand Day 5 into Day 6 journey integration or Day 7 production cutover.
- Refactor unrelated code for cleanliness.
- Silently decide ambiguous pricing, product entitlement or Clinic eligibility language.

---

## 3. Preconditions Carried Forward from Day 4

| Prerequisite | Required evidence |
|---|---|
| QA branch | Approved Day 4 code exists on the active QA branch/worktree. |
| Day 4 release record | Stored GalviSight and GalviPath results are stable and retrieve without regeneration. |
| Session continuity | The same `session_id` reaches GalviClinic. |
| Worker | The exact deployed QA Worker source and action router are identifiable. |
| D1 | QA database and migration commands are known. |
| Entitlement baseline | Existing entitlement behavior is mapped, including temporary or legacy client-side behavior to be replaced safely. |
| Stripe test mode | Approved test product/price or Payment Link exists for every paid product being tested. |
| Booking | Approved GalviClinic Calendly event or booking URL is known. |
| HubSpot | Existing token/configuration and direct API behavior are understood, or manual recovery fallback is accepted. |
| Fixtures | At least: one unpaid session, one paid-eligible session, one duplicate/replay fixture and one HubSpot-failure fixture. |
| Rollback | Pre-Day-5 tag/branch/ZIP, Worker source copy and D1 rollback plan exist. |

### Precondition Stop Gate

Stop before implementation if:

- Day 4 is not accepted;
- the same session cannot reach GalviClinic;
- the deployed Worker source cannot be identified;
- Stripe test product/price mapping is unknown;
- the booking destination is not approved;
- Codex proposes browser-side payment or entitlement logic;
- a destructive migration appears necessary.

---

## 4. Repository Readiness Checklist

Codex must complete this table in its discovery report.

| Required item | Evidence to return |
|---|---|
| Active QA branch/worktree | Branch name and `git status` |
| Day 4 merge/commit | Commit SHA |
| QA Worker source | Exact path |
| Worker action router | Path and function |
| Wrangler configuration | Path and QA environment |
| D1 binding | Binding name and database |
| Existing migrations | Directory and apply command |
| Payment UI/redirect | File paths and functions |
| Stripe server integration | File paths and functions |
| Webhook route | Route and handler, or “absent” |
| Product/price mapping | Current authority and location |
| Entitlement authority | Table, Worker function and client use |
| GalviClinic UI | File path and relevant functions |
| Booking URL/CTA | File path and destination |
| HubSpot adapter | Path and error behavior |
| D1 events/errors | Table names and write functions |
| Test commands | Exact commands |
| QA fixtures | Paths/session IDs |
| Rollback package | Path/tag |
| Production exclusion | Evidence QA bindings/secrets only |

---

## 5. Codex Discovery Prompt — Copy and Paste

```text
You are the implementation engineer for GalviCare 0.5 Day 5.

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

Read CODEX_DAY5_IMPLEMENTATION_ENGINEERING_GUIDE_v6_FINAL.md and inspect the approved QA branch/worktree.

Return ONE consolidated discovery report containing:

1. Repository map and exact paths for:
   - Worker entrypoint and action router;
   - D1 helpers, migrations and bindings;
   - existing payment and entitlement logic;
   - Stripe Payment Link/Checkout redirects;
   - Stripe webhook or server verification;
   - product/price mapping;
   - GalviClinic UI and routes;
   - booking/Calendly CTA and fallback;
   - HubSpot adapter and recovery;
   - journey-event and error logging;
   - tests and deployment configuration.

2. Exact current Day 4 → GalviClinic flow:
   - source CTA;
   - session preservation;
   - locked/unlocked behavior;
   - payment redirect;
   - payment return;
   - entitlement restore;
   - Clinic brief;
   - booking redirect;
   - HubSpot call;
   - final state.

3. Current payment authority:
   - what presently grants access;
   - whether query parameters or browser state are trusted;
   - current Stripe server calls;
   - webhook signature behavior;
   - current idempotency keys;
   - all security gaps.

4. Current D1 schema:
   - tables, columns, indexes and uniqueness constraints for payments,
     entitlements, clinic records, bookings, journey events and errors;
   - additive Day 5 migration required;
   - rollback strategy.

5. Current Stripe configuration assumptions:
   - expected test product IDs, price IDs or Payment Links;
   - success URL pattern;
   - cancel URL pattern;
   - Checkout Session metadata currently available;
   - secrets expected by the Worker.
   Do not reveal secret values.

6. Current Clinic and booking contract:
   - eligibility source;
   - required stored Day 4 inputs;
   - current booking provider;
   - approved fallback;
   - whether a webhook exists.

7. Current HubSpot contract:
   - contact upsert key;
   - properties written;
   - call order;
   - timeout and error behavior;
   - current recovery mechanism.

8. Existing automated tests and exact commands.

9. Every conflict between repository reality and this guide.

10. Proposed changed files with:
    - purpose;
    - exact change;
    - dependency;
    - risk;
    - rollback.

11. Exact implementation sequence and checkpoint test plan.

12. Binary conclusion:
    READY FOR ONE-PASS DAY 5 IMPLEMENTATION
    or
    BLOCKED
    with precise reasons.

Non-negotiable constraints:
- one existing Worker only;
- QA branch/worktree only;
- no Make, OpenAI or Airtable in customer path;
- server-side payment verification only;
- client return parameters are signals, not proof;
- preserve Days 1–4;
- HubSpot non-blocking;
- additive D1 migration only;
- no merge or production deployment.

STOP after the report.
```

---

## 6. Human Discovery Approval Gate

The Product Owner must approve or block:

| Approval item | Decision |
|---|---|
| Correct repository, branch and Worker identified | APPROVE / BLOCK |
| Day 4 prerequisite is stable | APPROVE / BLOCK |
| Current payment authority is correctly mapped | APPROVE / BLOCK |
| Stripe test product/price mapping is unambiguous | APPROVE / REVISE |
| D1 migration is additive and idempotent | APPROVE / REVISE |
| Clinic conversion contract is commercially correct | APPROVE / REVISE |
| Booking route and fallback are approved | APPROVE / REVISE |
| HubSpot is demonstrably non-blocking | APPROVE / REVISE |
| Tests cover payment, duplicate, booking, failure and regression | APPROVE / REVISE |
| One-pass implementation is authorized | GO / NO-GO |

Do not authorize implementation if Codex cannot identify the exact QA Worker, proposes client-side payment authority, cannot map verified Stripe products to GalviCare products, or cannot explain idempotency.

---

# PART B — DAY 5 ENGINEERING CONTRACT

## 7. Locked Architecture

```text
Carrd / GalviPro storefront
  → GitHub Pages GalviCare app
  → Existing Cloudflare Worker action router
  → Cloudflare D1 / GalviVault
  → Stripe test mode
  → Calendly or approved booking destination
  → HubSpot (non-blocking)
  → GA4 + Clarity + canonical D1 journey events
```

### Failure Behavior

| Layer | Failure behavior |
|---|---|
| Frontend | Visible structured error; session ID remains available. |
| Worker | Structured JSON error; never blank HTML. |
| D1 | No entitlement grant without successful authoritative write. |
| Stripe return | `paid_pending` with retry, not false success. |
| Webhook | Idempotent replay; log invalid signatures. |
| Booking | Show retry and contact fallback. |
| HubSpot | Log and continue. |
| Analytics | Log locally/D1 and continue. |

---

## 8. Common Worker API Envelope

Use the existing API route and action router discovered in the repository. Preserve its actual route and naming. The logical envelope must remain compatible with:

```json
{
  "action": "confirm_payment_return",
  "session_id": "gc_example",
  "current_stage": "GalviClinic",
  "payload": {}
}
```

Success response:

```json
{
  "success": true,
  "status": "ok",
  "session_id": "gc_example",
  "data": {},
  "next_screen": "GalviClinic"
}
```

Known non-success states must be structured:

```json
{
  "success": false,
  "status": "paid_pending",
  "session_id": "gc_example",
  "error": {
    "code": "PAYMENT_PENDING",
    "message": "Payment confirmation is still processing.",
    "retryable": true
  }
}
```

### Required Status Vocabulary

- `ok`
- `locked`
- `paid_pending`
- `payment_failed`
- `booking_pending`
- `booking_unavailable`
- `facilitator_review`
- `invalid_request`
- `not_found`
- `conflict`
- `server_error`

Do not return raw provider responses to the browser.

---

## 9. Day 5 Worker Actions

Codex must implement, map to existing equivalents, or explicitly justify why an existing action satisfies each contract.

### `confirm_payment_return`

Purpose: verify the returned Stripe Checkout Session server-side.

Required input:

```json
{
  "action": "confirm_payment_return",
  "session_id": "gc_...",
  "payload": {
    "stripe_session_id": "cs_test_...",
    "expected_product": "galviclinic"
  }
}
```

Rules:

1. Validate `session_id`.
2. Validate Stripe Session ID format conservatively.
3. Retrieve the Checkout Session using `STRIPE_SECRET_KEY`.
4. Require a successful paid state appropriate to the configured Stripe flow.
5. Derive the GalviCare product from a server-side product/price mapping or trusted Stripe metadata.
6. Reject client/product mismatch.
7. Upsert the payment idempotently.
8. Upsert exactly one active entitlement for the verified product.
9. Return the entitlement and next screen.
10. When the Stripe state is still processing, return `paid_pending`.
11. Never grant based only on return URL parameters.

### `get_entitlement`

Required input:

```json
{
  "action": "get_entitlement",
  "session_id": "gc_...",
  "payload": {
    "product": "galviclinic"
  }
}
```

Return:

```json
{
  "success": true,
  "status": "ok",
  "session_id": "gc_...",
  "data": {
    "product": "galviclinic",
    "entitlement_status": "active",
    "source": "stripe",
    "verified_at": "ISO-8601",
    "expires_at": null
  }
}
```

Allowed entitlement states:

- `pending`
- `active`
- `failed`
- `refunded`
- `revoked`
- `test_override`

A QA override must be impossible in production and must require a server-side QA-only authorization mechanism already approved in the repository.

### `get_or_create_clinic`

Rules:

1. Retrieve the existing active Clinic record first.
2. Require the authoritative Day 4 clinical file.
3. Do not alter Day 4 outputs.
4. Store one active record per `session_id + product + rules_version`.
5. Return stored data unchanged on refresh.
6. Store evidence references, pathway code, source product, treatment indication and booking state.
7. If evidence is insufficient, return `facilitator_review`; do not invent treatment claims.

### `record_booking_click`

Rules:

- validate session;
- confirm the Clinic record exists;
- confirm required entitlement/eligibility;
- write `clinic_booking_clicked`;
- generate or return the approved booking destination;
- include safe non-secret query parameters only where supported;
- never include private clinical narrative in a third-party booking URL.

### `record_booking_status`

Use only when the current booking integration supports a trusted callback or approved manual update.

Allowed states:

- `not_started`
- `clicked`
- `pending`
- `booked`
- `cancelled`
- `failed`
- `manual_followup`

### `sync_hubspot_recovery`

This action may be internal or reused from an existing adapter.

Rules:

- execute only after customer-facing D1 work succeeds;
- use email as the contact upsert key when that is the approved existing contract;
- send only approved properties;
- apply a short timeout;
- catch provider errors;
- write a D1 recovery/error record;
- return customer success regardless of HubSpot result.

---

## 10. Stripe Verification Contract

### Critical Rule

A return parameter such as:

```text
?paid=clinic_success
```

or:

```text
?stripe_session_id=cs_test_...
```

is a return signal, not payment proof.

Permanent entitlement is granted only after:

1. a verified Stripe webhook; or
2. Worker-side retrieval and verification of the Checkout Session.

### Required Stripe Events

At minimum:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Optional for QA evidence:

- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`

### Webhook Requirements

- Route through the existing Worker.
- Read raw request body before JSON parsing.
- Verify `Stripe-Signature` with `STRIPE_WEBHOOK_SECRET`.
- Reject invalid signatures with a structured 4xx response.
- Store the Stripe event ID.
- Process each event ID once.
- Upsert payment and entitlement idempotently.
- Return a 2xx response for already-processed valid events.
- Never expose webhook secret or verification code to frontend.

### Server-Side Product Map

Codex must locate the existing authoritative map or create one server-side. Example shape:

```js
const STRIPE_PRODUCT_MAP = {
  "price_test_example_clinic": {
    product: "galviclinic",
    entitlement: "galviclinic",
    mode: "payment"
  }
};
```

Do not copy actual secret values into the repository. Product/price IDs may be configuration variables if the existing project uses that pattern.

### Verification Conditions

Codex must reconcile exact Stripe fields with repository/API version. At minimum verify:

- Checkout Session exists;
- session is in the expected mode;
- payment state is successful;
- currency and amount match approved configuration when available;
- price/product maps to one allowed GalviCare product;
- metadata session ID matches the GalviCare session when metadata exists;
- the same Stripe session is not associated with a different GalviCare session;
- refunded/revoked states cannot remain active.

---

## 11. Payment and Entitlement State Machines

### Payment State

```text
created
  → pending
  → paid
  → failed
  → refunded
```

A payment may move from pending to paid. A paid payment may later become refunded. It must not move from failed to paid without a new verified provider event or authoritative retrieval.

### Entitlement State

```text
pending
  → active
  → revoked
  → refunded
```

`test_override` is a separate QA-only state and must never be created from a public client request.

### Idempotency

Use these provider/business keys where available:

- Stripe event: `stripe_event_id`
- payment: `stripe_session_id`
- entitlement: `session_id + product`
- Clinic record: `session_id + product + rules_version`
- booking: trusted provider booking ID, or `session_id + clinic_record_id + booking_state` for the bounded MVP
- HubSpot recovery record: `session_id + adapter + event_type + source_record_id`

A repeated request must return the existing authoritative state rather than create another row.

---

## 12. Additive D1 Migration Specification

Codex must adapt names to repository conventions. Do not duplicate existing tables or columns. Use this as the required semantic model.

```sql
-- Example only: reconcile with existing schema before implementation.

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_session_id TEXT NOT NULL,
  provider_payment_intent_id TEXT,
  provider_event_id TEXT,
  amount_total INTEGER,
  currency TEXT,
  payment_status TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_provider_session
ON payments(provider, provider_session_id);

CREATE INDEX IF NOT EXISTS ix_payments_session_product
ON payments(session_id, product);

CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  entitlement_status TEXT NOT NULL,
  source TEXT NOT NULL,
  payment_id TEXT,
  verified_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_id, product)
);

CREATE TABLE IF NOT EXISTS clinic_records (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL DEFAULT 'galviclinic',
  rules_version TEXT NOT NULL,
  source_product TEXT,
  pathway_code TEXT,
  treatment_indication_code TEXT,
  treatment_brief_json TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'not_started',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_id, product, rules_version)
);

CREATE TABLE IF NOT EXISTS clinic_bookings (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  clinic_record_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_booking_id TEXT,
  booking_status TEXT NOT NULL,
  booking_url TEXT,
  clicked_at TEXT,
  booked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_clinic_booking_provider_id
ON clinic_bookings(provider, provider_booking_id)
WHERE provider_booking_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS integration_recovery (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  adapter TEXT NOT NULL,
  operation TEXT NOT NULL,
  source_record_id TEXT,
  status TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_error_code TEXT,
  last_error_message TEXT,
  next_retry_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_integration_recovery_work
ON integration_recovery(adapter, operation, source_record_id);
```

### Migration Rules

- Use `CREATE TABLE IF NOT EXISTS` and additive indexes.
- Reuse existing canonical payments/entitlements/events/errors tables when present.
- Do not drop or rename current columns during Day 5.
- Do not migrate historical Airtable records.
- Do not place secret or raw sensitive provider payloads in D1.
- Store only required provider IDs and normalized states.
- Preserve one active result per session/product/rules version.

### Rollback SQL Principle

SQLite/D1 rollback must be safe and conservative. If newly created tables contain only Day 5 QA data and removal is approved, drop only Day 5-created indexes/tables in reverse dependency order. Otherwise leave additive schema inert and revert code. Never delete preexisting legitimate records.

---

## 13. GalviClinic Record Contract

Day 5 does not invent a new diagnosis. It converts the stored Day 4 care pathway into a treatment-entry brief.

Minimum logical response:

```json
{
  "clinic_record_id": "gclinic_...",
  "session_id": "gc_...",
  "product": "galviclinic",
  "source_product": "galvipath",
  "rules_version": "galviclinic_v0_5_1",
  "pathway_code": "validate",
  "treatment_indication_code": "VALIDATION_SPRINT",
  "treatment_brief": {
    "reason_for_care": "Evidence-linked summary",
    "primary_objective": "Approved treatment objective",
    "recommended_sprint": "Product Readiness",
    "expected_work": [
      "Approved action component"
    ],
    "evidence_to_bring": [
      "Approved evidence requirement"
    ],
    "not_included": [
      "No guaranteed outcome"
    ]
  },
  "evidence_refs": [
    {
      "source_type": "galvipath",
      "source_code": "validate"
    }
  ],
  "booking_status": "not_started",
  "generation_source": "rules"
}
```

### Clinic Safety Rules

- Treatment indication must trace to the stored Day 4 pathway.
- No guaranteed revenue, fundraising, clinical or business outcome language.
- No unsupported founder biography or market fact.
- No autonomous treatment plan expansion.
- Low-confidence or contradictory files may require facilitator review.
- The browser receives only the approved rendered brief, not rule libraries or selection logic.
- Refresh returns the stored Clinic record.

---

## 14. Booking Contract

### Approved MVP Behavior

1. Founder reaches eligible GalviClinic state.
2. Frontend calls `record_booking_click`.
3. Worker validates session and Clinic record.
4. Worker writes canonical event.
5. Frontend redirects to approved Calendly/event URL.
6. Safe identifiers may be passed where supported:
   - `session_id`
   - `source_product`
   - non-sensitive campaign/source code
7. Founder sees a fallback contact CTA if scheduling is unavailable.
8. Booking becomes `pending` or `booked` only through approved provider callback or manual operational update.

### Booking URL Safety

Never place these in the URL:

- full findings;
- clinical narrative;
- score details;
- private founder notes;
- payment secret;
- entitlement token;
- HubSpot token;
- raw email unless the approved provider integration already safely pre-fills it and the Product Owner accepts the behavior.

### Required Canonical Events

- `clinic_viewed`
- `clinic_payment_started`
- `clinic_payment_returned`
- `clinic_entitlement_active`
- `clinic_booking_clicked`
- `clinic_booking_pending`
- `clinic_booking_booked`
- `clinic_booking_failed`
- `clinic_contact_fallback_clicked`

---

## 15. HubSpot Non-Blocking Adapter Contract

### Approved Call Order

```text
Customer-facing Worker validation
  → D1 payment / entitlement / Clinic / event persistence
  → successful customer response can be formed
  → HubSpot adapter attempt
  → log success or recovery item
```

The adapter may run before the HTTP response only if it has a strict timeout and cannot change customer success. Prefer background execution supported by the current Worker pattern when already available and tested.

### Contact Upsert

Use the approved repository contract, generally email as the contact key. Approved properties may include:

- `galvicare_session_id`
- `current_stage`
- `last_event`
- `product`
- `recovery_tag`
- payment/booking status categories that do not expose unnecessary clinical detail

Do not send full clinical reports, proprietary reasoning or sensitive notes to HubSpot during Day 5.

### Failure Behavior

On timeout, 4xx, 5xx or malformed response:

1. catch the error;
2. sanitize the error message;
3. write `integration_recovery`;
4. write a D1 journey/error event;
5. return the customer-facing success generated from authoritative D1 state;
6. include no raw HubSpot error in the UI.

### Manual Recovery Fallback

If direct HubSpot integration remains unstable at Day 5 close:

- preserve D1 as the source of truth;
- generate a bounded QA recovery report/export process;
- mark records `manual_followup`;
- do not delay Stripe, entitlement, Clinic or booking acceptance.

---

## 16. Frontend Integration Contract

### Allowed Frontend Responsibilities

- preserve and restore `session_id`;
- initiate Stripe redirect;
- read Stripe Session ID from return URL as a signal;
- call `confirm_payment_return`;
- display pending, retry, failure and active states;
- call `get_entitlement` on refresh;
- render the server-provided Clinic brief safely;
- call `record_booking_click`;
- redirect to the approved booking URL;
- show fallback contact CTA;
- fire GA4/Clarity events without blocking.

### Forbidden Frontend Responsibilities

- deciding whether payment is valid;
- mapping price/product to entitlement;
- granting or persisting authoritative access;
- validating Stripe signatures;
- containing secret keys or provider tokens;
- selecting Clinic treatment;
- embedding proprietary treatment rules;
- deciding HubSpot recovery;
- regenerating stored Clinic content on refresh.

### Payment Return Sequence

```text
1. Read session_id from approved session mechanism.
2. Read stripe_session_id from URL.
3. Show “Confirming payment”.
4. POST confirm_payment_return to Worker.
5. If active:
     remove or neutralize unnecessary return parameters;
     render/route to unlocked product.
6. If paid_pending:
     show retry action;
     preserve session.
7. If failed:
     show retry/payment support state.
8. On refresh:
     call get_entitlement;
     never rely on previous browser state.
```

### Rendering Safety

Use existing safe rendering helpers. Do not inject provider/error strings with `innerHTML`. All customer-visible errors must be controlled copy.

---

## 17. Backend Pseudocode

### Confirm Payment

```js
async function confirmPaymentReturn(env, request) {
  const input = validateConfirmPaymentRequest(request);
  const session = await requireGalviCareSession(env.DB, input.session_id);

  const stripeSession = await retrieveStripeCheckoutSession(
    env.STRIPE_SECRET_KEY,
    input.stripe_session_id
  );

  const mappedProduct = mapStripeSessionToProduct(stripeSession, env);

  assertExpectedProduct(input.expected_product, mappedProduct.product);
  assertSessionOwnership(stripeSession, session.id);
  assertPaymentState(stripeSession);

  const payment = await upsertPaymentIdempotently(env.DB, {
    sessionId: session.id,
    product: mappedProduct.product,
    providerSessionId: stripeSession.id,
    providerPaymentIntentId: normalizePaymentIntent(stripeSession),
    amountTotal: stripeSession.amount_total,
    currency: stripeSession.currency,
    paymentStatus: normalizeStripePaymentStatus(stripeSession),
    verifiedAt: nowIso()
  });

  if (payment.paymentStatus === "pending") {
    return responsePaidPending(session.id);
  }

  const entitlement = await upsertEntitlementIdempotently(env.DB, {
    sessionId: session.id,
    product: mappedProduct.entitlement,
    status: "active",
    source: "stripe",
    paymentId: payment.id,
    verifiedAt: nowIso()
  });

  await writeJourneyEvent(env.DB, {
    sessionId: session.id,
    eventType: "clinic_entitlement_active",
    product: mappedProduct.product
  });

  scheduleNonBlockingHubSpotSync(env, session, entitlement);

  return successResponse(session.id, entitlement, "GalviClinic");
}
```

### Webhook

```js
async function handleStripeWebhook(request, env) {
  const rawBody = await request.text();
  const signature = request.headers.get("Stripe-Signature");

  const event = await verifyStripeWebhook(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  const existing = await getProcessedStripeEvent(env.DB, event.id);
  if (existing) return json({ received: true, duplicate: true }, 200);

  await processStripeEventTransactionally(env, event);
  return json({ received: true }, 200);
}
```

### HubSpot

```js
async function syncHubSpotNonBlocking(env, payload) {
  try {
    await withTimeout(
      upsertHubSpotContact(env.HUBSPOT_TOKEN, sanitizeHubSpotPayload(payload)),
      HUBSPOT_TIMEOUT_MS
    );
    await markIntegrationSuccess(env.DB, payload);
  } catch (error) {
    await writeIntegrationRecovery(env.DB, {
      adapter: "hubspot",
      operation: "contact_upsert",
      sourceRecordId: payload.sourceRecordId,
      error: sanitizeIntegrationError(error)
    });
  }
}
```

Codex must follow repository coding conventions and existing helpers rather than copying pseudocode blindly.

---

## 18. Error Contract

Example controlled codes:

| Code | HTTP | Retryable | Customer behavior |
|---|---:|---:|---|
| `INVALID_SESSION` | 400/404 | No | Restart or contact support |
| `INVALID_STRIPE_SESSION` | 400 | No | Return to payment |
| `PAYMENT_PENDING` | 202 | Yes | Retry confirmation |
| `PAYMENT_NOT_SUCCESSFUL` | 402/409 | Yes | Retry payment |
| `PRODUCT_MISMATCH` | 409 | No | Support/review |
| `ENTITLEMENT_NOT_ACTIVE` | 403 | Yes | Payment/restore state |
| `CLINIC_SOURCE_NOT_READY` | 409 | Yes | Return to pathway |
| `BOOKING_UNAVAILABLE` | 503 | Yes | Show fallback |
| `STORAGE_ERROR` | 500 | Yes | Preserve session and retry |
| `INTERNAL_ERROR` | 500 | Yes | Controlled message |

Do not expose stack traces, provider payloads, SQL, tokens or secret names to the browser.

---

## 19. Secrets and Configuration

Expected QA secrets/configuration, subject to repository discovery:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `HUBSPOT_TOKEN`
- approved Stripe price/product configuration
- approved Calendly/booking URL
- QA environment flag
- D1 binding

Rules:

- Do not print secret values.
- Do not commit `.dev.vars`, `.env`, Wrangler secret output or dashboard values.
- Do not rotate secrets during Day 5 unless separately authorized.
- Do not copy QA secrets into production or production secrets into QA.
- Fail closed for payment verification.
- Fail open only for non-authoritative adapters such as HubSpot and analytics.

---

## 20. Automated Test Contract

Codex must use the repository’s actual test runner. Add tests at the lowest appropriate layer and run the full affected suite.

### Required Unit Tests

1. Stripe product/price maps to exactly one GalviCare product.
2. Unknown product/price is rejected.
3. Client expected-product mismatch is rejected.
4. Paid Checkout Session normalizes to paid.
5. Processing session normalizes to pending.
6. Failed/unpaid state does not grant entitlement.
7. Entitlement upsert is idempotent.
8. QA override cannot execute in production.
9. Clinic indication derives only from approved Day 4 pathway.
10. HubSpot payload excludes full clinical narrative.
11. Error sanitizer removes provider detail.
12. Booking URL excludes sensitive narrative.

### Required Integration Tests

1. Valid payment return creates/updates one payment and one entitlement.
2. Repeating the same return call returns the same entitlement.
3. Replaying the same webhook does not duplicate data.
4. Webhook then return call remains idempotent.
5. Return call then webhook remains idempotent.
6. Refresh retrieves active entitlement.
7. Wrong GalviCare session cannot claim another Stripe Session.
8. Unknown product cannot unlock.
9. D1 failure does not falsely grant access.
10. HubSpot failure still returns customer success after D1 succeeds.
11. Clinic record returns stored result on refresh.
12. Booking click creates one canonical event.
13. Booking fallback appears on provider failure.
14. Legacy Worker actions still respond.

### Required Security Tests

- invalid webhook signature rejected;
- missing webhook signature rejected;
- client cannot send `entitlement_status=active`;
- query parameter alone does not unlock;
- localStorage/sessionStorage state alone does not unlock;
- browser bundle contains no Stripe secret, webhook secret, HubSpot token or server product map;
- CORS remains restricted to approved behavior;
- logs contain no secret values.

---

## 21. Golden QA Fixtures

Codex must reconcile fixtures with existing repository data and sanitize any real founder information.

### Fixture A — Unpaid Eligible Clinic Session

```json
{
  "session_id": "gc_day5_unpaid_001",
  "day4_status": "complete",
  "pathway_code": "validate",
  "entitlement_status": "pending",
  "expected": "locked"
}
```

### Fixture B — Successful Test Payment

```json
{
  "session_id": "gc_day5_paid_001",
  "stripe_session_id": "use_actual_stripe_test_fixture_or_mock",
  "expected_product": "galviclinic",
  "expected": {
    "payment_rows": 1,
    "entitlement_rows": 1,
    "entitlement_status": "active",
    "next_screen": "GalviClinic"
  }
}
```

### Fixture C — Duplicate/Replay

Call the same payment return at least twice and replay the same event.

Expected:

```json
{
  "payment_rows": 1,
  "entitlement_rows": 1,
  "clinic_rows": 1,
  "duplicate_customer_charge": false
}
```

### Fixture D — HubSpot Failure

Force the approved adapter failure mechanism without exposing or altering a live token.

Expected:

```json
{
  "customer_success": true,
  "integration_recovery_rows": 1,
  "hubspot_blocked_customer": false
}
```

### Fixture E — Wrong Session Claim

Attempt to confirm a Stripe Session linked to a different GalviCare session.

Expected:

```json
{
  "success": false,
  "error_code": "PRODUCT_MISMATCH_OR_SESSION_MISMATCH",
  "entitlement_created": false
}
```

### Fixture F — Booking Failure

Simulate unavailable booking destination or rejected provider response.

Expected:

```json
{
  "booking_status": "failed_or_manual_followup",
  "fallback_visible": true,
  "session_preserved": true
}
```

---

## 22. Day 5 QA Matrix

| Scenario | Pass criteria |
|---|---|
| Stripe test checkout | Return reaches correct QA route and remains in the same session. |
| Server verification | Worker retrieves/verifies the Checkout Session or processes a verified webhook. |
| Correct product | Only the verified product entitlement becomes active. |
| Pending payment | UI shows pending/retry; no active entitlement. |
| Failed payment | UI shows controlled retry state; no active entitlement. |
| Refresh | Active entitlement restores from Worker/D1. |
| Duplicate return | No duplicate payment or entitlement. |
| Webhook replay | No duplicate processing. |
| Wrong session | Entitlement denied. |
| Unknown price | Entitlement denied. |
| Clinic creation | One stored Clinic record is returned. |
| Clinic refresh | Stored record returns unchanged. |
| Booking click | D1 event written and approved route opens. |
| Booking failure | Contact fallback visible. |
| HubSpot failure | Customer path succeeds; recovery row logged. |
| GA4/Clarity failure | Customer path succeeds. |
| Mobile | Locked, pending, Clinic and booking states are usable. |
| Browser security | No secret/business rule/payment authority exposed. |
| Days 1–4 regression | Triage, Vitals, Score, Shot, Sight and Path still work. |
| Rollback | Documented rollback can restore pre-Day-5 QA state. |

---

## 23. Required Test Evidence

Codex’s final response must include:

- every command executed;
- exact pass/fail counts;
- exact failing test names, if any;
- D1 row counts before and after idempotency tests;
- evidence that entitlement survives a new page load;
- evidence that query parameters alone cannot unlock;
- evidence that webhook replay does not duplicate;
- evidence that HubSpot failure is non-blocking;
- browser source/bundle search results for secrets and rule exposure;
- one representative Clinic response;
- one booking event;
- Days 1–4 regression result;
- unresolved limitations.

“Tests passed” without commands and counts is insufficient.

---

## 24. Checkpoint Protocol

### Checkpoint A — Before Editing

Codex states:

- exact files to change;
- exact files not to change;
- migration file;
- test files;
- rollback artifact.

No re-approval is required when these match the approved discovery plan.

### Checkpoint B — Contracts + Migration

Codex returns:

- final action contracts;
- final D1 schema delta;
- product mapping authority;
- entitlement uniqueness;
- Clinic uniqueness;
- test list.

### Checkpoint C — Backend

Codex runs backend tests and returns:

- command;
- pass/fail;
- D1 fixture evidence;
- payment verification result;
- duplicate/replay result;
- HubSpot-failure result.

### Checkpoint D — Frontend

Codex returns:

- changed frontend files;
- payment-return flow;
- entitlement-refresh flow;
- Clinic rendering;
- booking/fallback behavior;
- security boundary confirmation.

### Checkpoint E — Final QA

Codex runs:

- full affected suite;
- security scan;
- manual QA checklist;
- Days 1–4 regression;
- migration and rollback review.

### Checkpoint F — PR Recommendation

Codex produces one GO/BLOCK recommendation. This is not Product Owner approval.

---

# PART C — IMPLEMENTATION PROMPT, HUMAN QA, RELEASE AND ROLLBACK

## 25. Codex One-Pass Implementation Prompt — Copy and Paste After Approval

```text
You are authorized to implement GalviCare 0.5 Day 5 on the approved QA branch/worktree.

Use:
- CODEX_DAY5_IMPLEMENTATION_ENGINEERING_GUIDE_v6_FINAL.md;
- your approved discovery report;
- the existing repository conventions.

Implement only the approved changed-file plan.

Primary objective:
Complete GalviClinic conversion, server-verified Stripe entitlement, booking flow, idempotent persistence and non-blocking HubSpot recovery.

Mandatory requirements:
1. Reuse the existing Worker and action router.
2. Apply only the approved additive D1 migration.
3. Preserve Days 1–4 contracts and stored results.
4. Treat all browser return parameters as signals, never proof.
5. Verify Stripe server-side by verified webhook or Checkout Session retrieval.
6. Map verified Stripe product/price to one server-authoritative GalviCare product.
7. Upsert payment and entitlement idempotently.
8. Restore entitlement from D1 on refresh.
9. Create/retrieve one Clinic record per session/product/rules_version.
10. Persist booking click/status and provide the approved fallback.
11. Call HubSpot only after customer-facing persistence succeeds.
12. Catch/log HubSpot failure and return customer success.
13. Keep secrets, payment authority, product mapping and Clinic rules out of browser code.
14. Add/extend automated tests.
15. Do not merge or deploy production.

Checkpoint protocol:
A. State planned files before editing.
B. Implement migration/contracts/backend and run backend tests.
C. Implement frontend integration and run affected tests.
D. Run the full Day 5 matrix and Days 1–4 regression.
E. Self-review every acceptance item.
F. Prepare one QA PR recommendation.

Final output:
1. Implementation summary.
2. Changed files and why.
3. Commands and exact results.
4. Migration apply command.
5. Rollback commands.
6. Payment and idempotency evidence.
7. Clinic and booking evidence.
8. HubSpot failure evidence.
9. Security/browser-boundary confirmation.
10. Manual QA steps.
11. PR title/body.
12. Assumptions and unresolved decisions.
13. GO or BLOCK recommendation with reasons.

STOP if:
- repository reality invalidates the approved plan;
- a second Worker is required;
- a destructive migration is required;
- client-side payment authority is required;
- product mapping is ambiguous;
- production changes are required.
```

---

## 26. Human Product Owner Verification

The Product Owner must manually verify:

1. Open an approved Day 4 session and continue to GalviClinic.
2. Confirm the same session ID remains visible/traceable.
3. Confirm unpaid access remains locked.
4. Complete one Stripe test checkout.
5. Confirm the return page shows a processing state before verification.
6. Confirm the correct product unlocks.
7. Refresh and reopen; confirm entitlement remains active.
8. Confirm no second payment is requested after verified entitlement.
9. Confirm a different/unpaid session cannot reuse the successful return URL.
10. Confirm the Clinic brief is additive to Path and does not repeat or alter Day 4.
11. Confirm treatment language is commercially credible and does not guarantee outcomes.
12. Click the booking CTA.
13. Confirm booking destination is correct.
14. Confirm no sensitive clinical narrative appears in the booking URL.
15. Test booking failure/fallback.
16. Confirm HubSpot failure does not block the founder.
17. Confirm GA4/Clarity events do not block.
18. Inspect browser sources/network for secrets, product maps, entitlement logic and proprietary Clinic rules.
19. Test mobile width.
20. Re-run one complete Triage → Vitals → Score → Shot → Sight → Path regression.
21. Review migration and rollback.
22. Review the PR diff for unrelated changes.

---

## 27. Pull Request Requirements

### Required Title

```text
GalviCare 0.5 Day 5 — verified entitlement, GalviClinic conversion and booking (QA only)
```

### Required PR Body

```markdown
## Scope
- GalviClinic conversion
- Stripe server verification
- Payment and entitlement idempotency
- Entitlement restore
- Booking event and fallback
- HubSpot non-blocking recovery

## Explicit exclusions
- No Day 2–4 logic changes
- No Make
- No OpenAI
- No Airtable customer-path writes
- No second Worker
- No production deployment

## Changed files
[List every file and purpose.]

## D1 migration
[Migration file and apply command.]

## Rollback
[Git, Worker and D1 rollback.]

## Tests
[Commands, counts and exact results.]

## Evidence
- valid payment
- pending/failed payment
- duplicate return
- webhook replay
- entitlement refresh
- wrong-session denial
- Clinic stored refresh
- booking/fallback
- HubSpot failure
- Days 1–4 regression
- browser security scan

## Risks and assumptions
[List unresolved items.]

## Deployment
QA only. Human approval required. No production deployment performed.

## Codex recommendation
GO / BLOCK with reasons.
```

---

## 28. Rollback Plan

| Layer | Rollback artifact/action |
|---|---|
| Git | Revert Day 5 commit(s) only or restore pre-Day-5 QA tag/branch. |
| Worker | Restore exact pre-Day-5 QA Worker source/deployment. |
| D1 | Apply documented conservative rollback; retain inert additive schema when data safety is uncertain. |
| Frontend | Restore pre-Day-5 payment-return, Clinic and booking adapters. |
| Stripe | Do not delete or alter test transactions; disable only newly created QA webhook endpoint if separately authorized. |
| HubSpot | Disable Day 5 adapter invocation or restore prior function; preserve D1 recovery records. |
| Data | Do not delete legitimate preexisting records; clean only approved synthetic QA fixtures. |
| Production | No rollback should be necessary because Day 5 must not touch production. |

### Rollback Verification

After rollback:

- Worker health passes;
- Days 1–4 regression passes;
- no Day 5 frontend route remains partially active;
- no client-side entitlement bypass exists;
- QA database remains readable;
- test Stripe records remain auditable.

---

## 29. Day 6 Handoff Record

Day 5 may hand off to Day 6 only when:

- Clinic brief works;
- Stripe webhook or server verification works;
- entitlement survives refresh;
- booking route works;
- HubSpot is non-blocking;
- canonical journey events exist;
- manual recovery is documented;
- Day 1–4 regression passes;
- QA PR is approved by the Product Owner.

Codex must list the exact stable contracts Day 6 may rely on:

- payment confirmation action;
- entitlement retrieval action;
- Clinic retrieval action;
- booking action;
- event names;
- session continuity behavior;
- error states;
- fallback behavior.

---

# APPENDIX A — ACCEPTANCE CHECKLIST

## Payment and Entitlement

- [ ] Stripe test mode only.
- [ ] Server-side Checkout Session verification implemented or confirmed.
- [ ] Verified webhook signature implemented or confirmed.
- [ ] Invalid signature rejected.
- [ ] Product/price map server-side.
- [ ] Unknown product denied.
- [ ] Client mismatch denied.
- [ ] Same Stripe Session cannot be claimed by another GalviCare session.
- [ ] One payment row per Stripe Session.
- [ ] One entitlement per session/product.
- [ ] Pending does not unlock.
- [ ] Failed does not unlock.
- [ ] Refunded/revoked does not remain active.
- [ ] Refresh restores entitlement.
- [ ] Query parameter alone cannot unlock.
- [ ] Browser storage alone cannot unlock.
- [ ] Webhook replay is idempotent.
- [ ] Return replay is idempotent.

## GalviClinic

- [ ] Day 4 source record required.
- [ ] No Day 4 recomputation.
- [ ] Treatment indication evidence-linked.
- [ ] One active Clinic record per session/product/rules version.
- [ ] Stored refresh is stable.
- [ ] Low-confidence behavior safe.
- [ ] No guaranteed outcome language.
- [ ] Browser receives approved rendered content only.

## Booking

- [ ] Approved provider URL.
- [ ] Booking click written to D1.
- [ ] Session/source product preserved safely.
- [ ] Sensitive clinical data excluded from URL.
- [ ] Booking state recorded.
- [ ] Duplicate click does not create uncontrolled duplicates.
- [ ] Fallback visible.
- [ ] Failure preserves session.

## HubSpot and Analytics

- [ ] HubSpot executes after authoritative D1 work.
- [ ] HubSpot has timeout/error handling.
- [ ] HubSpot failure logs recovery.
- [ ] HubSpot failure does not block.
- [ ] Full clinical narrative excluded.
- [ ] GA4/Clarity events fire where expected.
- [ ] Analytics failure does not block.

## Security and Regression

- [ ] No secrets in browser.
- [ ] No server product map in browser.
- [ ] No entitlement authority in browser.
- [ ] No Clinic rules in browser.
- [ ] Structured errors only.
- [ ] CORS preserved.
- [ ] Triage passes.
- [ ] Vitals passes.
- [ ] Score passes.
- [ ] Shot passes.
- [ ] Sight passes.
- [ ] Path passes.
- [ ] Mobile passes.
- [ ] Rollback documented.
- [ ] No production change.
- [ ] No merge performed by Codex.

---

# APPENDIX B — FINAL CODEX OUTPUT TEMPLATE

```markdown
# Day 5 Codex Completion Report

## 1. Recommendation
GO / BLOCK

## 2. Repository and branch
- Repository:
- Branch/worktree:
- Starting commit:
- Ending commit:

## 3. Implementation summary

## 4. Changed files
| File | Purpose | Risk | Rollback |
|---|---|---|---|

## 5. D1 migration
- File:
- Apply command:
- Result:
- Rollback:

## 6. Tests
| Command | Passed | Failed | Notes |
|---|---:|---:|---|

## 7. Payment evidence
- Valid payment:
- Pending:
- Failed:
- Unknown product:
- Wrong session:
- Duplicate return:
- Webhook replay:
- Refresh restore:

## 8. GalviClinic evidence
- Source Day 4 record:
- Stored Clinic record:
- Refresh stability:
- Low-confidence behavior:

## 9. Booking evidence
- Click event:
- Approved destination:
- Fallback:
- Duplicate behavior:

## 10. HubSpot recovery evidence
- Failure method:
- Customer response:
- D1 recovery row:

## 11. Security review
- Browser secret scan:
- Entitlement bypass test:
- URL/query test:
- CORS:
- Logs:

## 12. Days 1–4 regression

## 13. Manual QA instructions

## 14. Risks, limitations and Product Owner decisions

## 15. Pull request
- Title:
- Body:
- URL, if created:

## 16. Production statement
No production deployment, merge, live-data change or secret rotation was performed.
```

---

# FINAL AUTHORITY

Codex may discover, implement, test and prepare a QA pull request. Codex may not approve product meaning, pricing, treatment value, production promotion or release acceptance.

Only the Human Product Owner may authorize:

- implementation after discovery;
- ambiguous product/price mapping;
- Clinic treatment language;
- booking destination;
- use of a QA override;
- PR approval;
- production deployment.

This guide is complete only when Codex reconciles it against repository reality through the single discovery report. It intentionally does not fabricate repository paths, existing function names, Stripe IDs, live URLs, secrets or current D1 structures. Codex must discover those once, report them, and then implement the approved bounded plan.
