# Day 3 Stabilization QA Evidence Template

- PR number:
- Merge commit:
- GitHub Actions run:
- Cloudflare previous version:
- Cloudflare new version:
- Deployment timestamp:
- Tester:
- Test session ID:

## Health result

- HTTP status:
- `build.environment`:
- `build.stabilization_version`:
- `build.legacy_make_api_enabled`:
- Build headers present:
- Six baseline security headers present:
- Content-Security-Policy absent:

## Root 410 result

- HTTP status:
- Response code:
- Make scenario execution observed: no / yes

## `/api` result

- Unsupported action HTTP status:
- Unsupported action response code:
- `get_or_create_galvishot` HTTP status:
- `get_or_create_galvishot` response status:
- Same upstream session ID: no / yes

## D1 row counts

- `sessions`:
- `product_results` GalviVitals:
- `product_results` GalviScore:
- `product_results` GalviShot:
- `clinical_findings`:
- `galvishot_evidence_links`:
- Rules versions match expected values: no / yes

## Browser storage values

Record session IDs only. Do not record tokens.

- `galvicare_session_id`:
- `galvitriage_session_id`:
- `galvicare_day1_qa_session_id`:
- Values identical: no / yes

## Final approval

- Approved by:
- Approval timestamp:
- Notes:
