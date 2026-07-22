# Day 3 Stabilization Deployment Runbook

## 1. Authoritative source

- Repository: `galvitriage`.
- QA branch: `qa-revamped-galvicare-0-5`.
- PR branch: `codex/day3-stabilization-gate`.
- Worker source path: `worker/worker.js`.
- Frontend source path: `index.html`.
- Stabilization version: `day3_stabilization_v1`.
- Expected GalviScore rules version: `galviengine_score_v0_5_1`.
- Expected GalviShot rules version: `galvishot_rules_v0_5_1`.
- Expected GalviShot content version: `galvishot_content_v0_5_1`.

## 2. Pre-deployment checks

- Confirm the PR CI passed for `Day 3 stabilization: CI, routing, session continuity and CISO controls`.
- Confirm PR base is `qa-revamped-galvicare-0-5` and head is `codex/day3-stabilization-gate`.
- Confirm there are no unresolved test, review, or merge failures.
- Confirm the Cloudflare Worker name in the Cloudflare dashboard before editing it.
- Manually verify the existing D1 binding name; do not change the binding during this deployment.
- Confirm the required QA override token remains an encrypted Cloudflare secret.
- Do not copy any token into GitHub, pull request comments, issues, docs, or local evidence files.

## 3. Worker deployment procedure

Automated Cloudflare deployment is not configured for this repository.

1. Merge the PR only after CI passes and human approval is recorded.
2. Open `worker/worker.js` from the merged `qa-revamped-galvicare-0-5` branch.
3. Copy the complete raw file.
4. In Cloudflare, replace the complete Worker source with the copied file.
5. Do not patch individual blocks.
6. Deploy once.
7. Record the new Cloudflare version identifier in `docs/DAY3_STABILIZATION_QA_EVIDENCE_TEMPLATE.md`.

## 4. Frontend deployment procedure

1. Confirm whether GitHub Pages publishes `qa-revamped-galvicare-0-5` or another configured source.
2. Do not assume automatic publication.
3. Verify deployed `index.html` contains `isValidGalviCareSessionId`, `persistSessionId`, `getStoredSessionId`, `getOrCreateSessionId`, and `startNewGalviCareAssessment`.
4. Use a cache-busting URL for verification: append `?day3_stabilization_v1=<UTC_TIMESTAMP>` to the deployed page URL.
5. In browser DevTools, confirm the fetched document source includes the session-continuity functions from the merged `index.html`.

## 5. Runtime smoke tests

Set these shell variables locally before running the smoke tests:

```sh
WORKER_URL="https://<qa-worker-host>"
SESSION_ID="gt_<verified_test_session>"
```

### GET Worker health

```sh
curl -i "$WORKER_URL"
```

Expected:

- HTTP `200`.
- JSON `build.environment` is `qa`.
- JSON `build.stabilization_version` is `day3_stabilization_v1`.
- JSON `build.legacy_make_api_enabled` is `false`.
- Headers present: `X-Galvi-Environment`, `X-Galvi-Stabilization`, `X-Galvi-Score-Rules`, `X-GalviShot-Rules`.
- Baseline security headers present: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-Frame-Options`.
- No `Content-Security-Policy` header.

### OPTIONS `/api`

```sh
curl -i -X OPTIONS "$WORKER_URL/api"
```

Expected:

- HTTP `204`.
- CORS headers present: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`.
- Six baseline security headers present.

### POST `/api` unsupported action

```sh
curl -i -X POST "$WORKER_URL/api" \
  -H 'Content-Type: application/json' \
  --data '{"action":"unsupported_smoke_test"}'
```

Expected:

- Controlled JSON response.
- JSON `code` is `UNSUPPORTED_API_ACTION`.
- No Make, Airtable, HubSpot, or legacy root execution.

### POST root GalviShot action

```sh
curl -i -X POST "$WORKER_URL/" \
  -H 'Content-Type: application/json' \
  --data "{\"action\":\"evaluate_galvishot\",\"session_id\":\"$SESSION_ID\"}"
```

Expected:

- HTTP `410`.
- JSON `code` is `LEGACY_DIAGNOSTIC_ROUTE_DISABLED`.
- No Make scenario execution.

### POST `/api` `get_or_create_galvishot`

```sh
curl -i -X POST "$WORKER_URL/api" \
  -H 'Content-Type: application/json' \
  --data "{\"action\":\"get_or_create_galvishot\",\"session_id\":\"$SESSION_ID\",\"payload\":{}}"
```

Expected:

- HTTP `200` after the session is entitled or QA-unlocked through the approved Cloudflare secret flow.
- JSON `success` is `true`.
- JSON `status` is `ok`.
- JSON `session_id` matches `$SESSION_ID`.

## 6. D1 verification queries

Use the same `:session_id` for every query. These queries are read-only.

```sql
SELECT session_id, current_stage, status, created_at, updated_at
FROM sessions
WHERE session_id = :session_id;
```

```sql
SELECT session_id, product, status, rules_version, content_version, confidence, confidence_band
FROM product_results
WHERE session_id = :session_id AND product = 'GalviVitals';
```

```sql
SELECT session_id, product, status, rules_version, content_version, confidence, confidence_band
FROM product_results
WHERE session_id = :session_id AND product = 'GalviScore';
```

```sql
SELECT session_id, product, status, rules_version, content_version, confidence, confidence_band
FROM product_results
WHERE session_id = :session_id AND product = 'GalviShot';
```

```sql
SELECT session_id, product, finding_code, rules_version, confidence, confidence_band, status
FROM clinical_findings
WHERE session_id = :session_id AND product = 'GalviShot'
ORDER BY finding_code;
```

```sql
SELECT session_id, product, finding_code, source_type, source_field, used_for, rules_version
FROM galvishot_evidence_links
WHERE session_id = :session_id AND product = 'GalviShot'
ORDER BY finding_code, source_field;
```

Expected:

- Every returned row uses the same `:session_id`.
- GalviVitals and GalviScore rows use `galviengine_score_v0_5_1`.
- GalviShot, clinical findings, and evidence links use `galvishot_rules_v0_5_1`.

## 7. Browser journey verification

Run one browser journey:

GalviTriage → GalviVitals → GalviScore → GalviShot → GalviSight.

Do not print, inspect, or copy the QA token. After each stage, run this console command:

```js
(() => {
  const keys = ['galvicare_session_id', 'galvitriage_session_id', 'galvicare_day1_qa_session_id'];
  const values = keys.map(key => localStorage.getItem(key));
  return {
    keys,
    values,
    all_present: values.every(Boolean),
    all_identical: values.every(value => value === values[0]),
    session_id: values[0]
  };
})();
```

Expected:

- `all_present` is `true`.
- `all_identical` is `true`.
- `session_id` starts with `gt_`.
- The same `session_id` appears from GalviTriage through GalviSight.

## 8. Rollback

1. Retain the current Cloudflare version identifier before deployment.
2. If any smoke test fails, restore the prior Worker version.
3. Do not repair production manually during the approval test.
4. Record the failed test and return to the GitHub branch for a code fix.

## 9. Final sign-off table

| Item | Owner | Evidence | Status |
| --- | --- | --- | --- |
| PR CI |  |  |  |
| Worker deployment |  |  |  |
| Health metadata |  |  |  |
| CISO headers |  |  |  |
| `/api` closure |  |  |  |
| Make disabled for Day 3 |  |  |  |
| Session continuity |  |  |  |
| Day 3 persistence |  |  |  |
| D1 evidence links |  |  |  |
| Token rotation |  |  |  |
| Rollback identifier |  |  |  |
