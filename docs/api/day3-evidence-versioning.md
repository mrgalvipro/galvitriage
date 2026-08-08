# GalviVault P0 Day 3 Evidence and Versioning API

Authoritative QA branch: `qa-revamped-galvicare-0-5`

Authoritative QA Worker config: `wrangler.day3.json`

Required schema: `0003`

## Runtime routes

- `GET /api/v1/day3/readiness`
- `GET /api/v1/schema-version`
- `POST /api/v1/evidence`
- `GET /api/v1/evidence/{evidence_id}`
- `POST /api/v1/evidence/{evidence_id}/accept`
- `POST /api/v1/evidence/{evidence_id}/reject`
- `POST /api/v1/evidence/{evidence_id}/supersede`
- `GET /api/v1/business-medical-records/{bmr_id}/evidence?view=current`
- `GET /api/v1/business-medical-records/{bmr_id}/evidence?view=history`
- `POST /api/v1/import-batches`
- `POST /api/v1/import-batches/{import_batch_id}/rows`
- `POST /api/v1/import-batches/{import_batch_id}/close`

## Required headers

Material writes require `Content-Type: application/json` and `Idempotency-Key`.

Authorized governance actions use server-recognized operator context through `X-Galvi-Role` and `X-Galvi-Actor-Id`. Import actions require import or admin role.

## Typed evidence

Supported value types are `text`, `number`, `boolean`, `date`, `json`, `reference`, and `file_reference`. Exactly one compatible typed value field must be populated. Mismatched, missing, ambiguous, malformed, or oversized values return a canonical 4xx response and create no canonical row.

## Version and immutability rules

Accepted evidence cannot be updated in place. Correction uses `POST .../supersede`, inserts a new evidence version in the same group, creates a `corrects` relationship, and preserves the prior accepted row unchanged. Assessment-answer evidence also creates the corresponding next assessment-answer version.

## Import reconciliation

Each first-processed row increments exactly one of imported, skipped, or errors and increments processed once. Exact source-row replay creates no count change. Closing requires `processed = imported + skipped + errors` and, when supplied, `processed = expected_count`.
