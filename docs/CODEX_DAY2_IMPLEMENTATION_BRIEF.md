# GalviCare 0.5 Day 2 Implementation Brief

## Mission

Implement the deterministic GalviTriage → GalviVitals → GalviScore QA path
inside the existing `galvicare-triage-intake` Cloudflare Worker and QA D1
database.

## Non-negotiable architecture

- Use one existing Worker only.
- Do not create a second Worker.
- QA branch/worktree only.
- No Make.
- No OpenAI.
- Browser is presentation only.
- Proprietary weights, normalization rules, scoring, classifications,
  templates, and confidence calculations remain Worker-side.
- Preserve all existing legacy routes and approved CORS behavior.
- Do not deploy, merge, modify live customer data, or write to production.
- Human Product Owner issues all GO / NO-GO decisions.

## Authoritative QA branch

`qa-revamped-galvicare-0-5`

## Existing Worker

Name: `galvicare-triage-intake`

Existing API:
`https://galvicare-triage-intake.mrgalvipro.workers.dev/api`

Existing root endpoint:
`https://galvicare-triage-intake.mrgalvipro.workers.dev`

## D1 QA database

Database: `galvivault-0-5-qa`
Binding name: `DB`
Environment: `qa_migration`

Current flags:

- `D1_FOUNDATION_ENABLED=true`
- `D1_WRITE_MODE=foundation_only`

## Day 2 scope

Implement:

- Exact versioned 20-question assessment contract
- `submit_triage`
- `get_triage`
- `triage_completeness`
- `get_or_create_vitals`
- `get_or_create_score`
- Idempotent D1 persistence
- Stored-result retrieval when `rules_version` matches
- QA frontend integration
- Governed visible error card
- Automated or repeatable tests
- Known-good session comparison

## Explicitly out of Day 2 scope

Do not modify:

- GalviShot business logic
- GalviSight business logic
- Stripe architecture
- HubSpot architecture
- Make scenarios
- OpenAI integration
- Production deployment
- Full Airtable history

Existing later-product screens and routes must continue working but should not
be redesigned during Day 2.

## Rules versions

- Scoring rules: `galviengine_score_v0_5_1`
- Question contract: `galvitriage_questions_v0_5_1`
- Generation source: `rules`

## Approved dimension weights

- Problem: 0.12
- Customer: 0.15
- Product: 0.15
- Revenue: 0.16
- Business Model: 0.12
- Distribution: 0.10
- Leadership: 0.10
- Technology / Operations: 0.10

## Authoritative questions

The current 20-question set in `index.html` is the authoritative Day 2 source
for exact wording, order, keys, required state, and 1–5 response scale.

`galvitriage-cta.html` is a legacy 19-question variant and must not replace the
authoritative `index.html` contract.

Do not alter wording, order, keys, scales, dimensions, weight, required state,
or score direction without Product Owner approval.

## Session key decision

`galvicare_session_id` is the canonical customer-journey key for Day 2.

Preserve temporary backward compatibility with:

- `galvitriage_session_id`
- `galvicare_day1_qa_session_id`

Do not silently delete legacy keys in Day 2.

## Result requirements

GalviVitals must be free and immediate.

GalviScore must return:

- `session_id`
- `product`
- `score`
- `classification`
- `dimension_scores`
- `strongest_dimensions`
- `weakest_dimensions`
- `confidence`
- `confidence_band`
- `rules_version`
- `generation_source`

## Human-controlled decisions

Stop and request Product Owner approval if:

- Existing score and new score differ
- Question mapping is ambiguous
- CORS behavior would change
- A legacy action appears incompatible
- A destructive D1 migration appears necessary
- Production access is needed
- A secret is needed
- A second Worker appears necessary

## Known-good comparison

Session:
`gt_mrdoy5xk_wdh09y41`

Previous Triage result:

- Total score: 30
- Health band: Critical
- Lowest domain: `revenue_health`
- Confidence: 100
- Previous scoring version:
  `galvitriage_0_5_final_worker_ga4_clarity_v2_fetch_required`

Use the sanitized fixture under `fixtures/` for answer values.

## Required checkpoint behavior

1. Discovery report
2. Product Owner approval
3. Contract lock
4. D1 + Worker implementation
5. Backend tests
6. QA frontend integration
7. Security and legacy regression review
8. Manual Product Owner QA
9. PR/diff recommendation

Do not merge or deploy.
