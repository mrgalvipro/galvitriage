# GALVICARE 0.5 DAY 5

## CHECKPOINT 6 CLOUDFLARE VERSION-UPLOAD VALIDATION REPORT

### Build Summary

- **Build:** `e0c6977d`
- **Source commit:** `4119ea2`
- **Build result:** **PASSED**

## Validation Summary

1. Build `e0c6977d` completed successfully:
   - Initializing: passed
   - Cloning: passed
   - Installing: passed
   - Deploying: passed

2. The successful build used the connected source branch:
   - `codex/day5-clinic-payment-booking`

3. The successful build used source commit:
   - `4119ea2`

4. The deploy command used successfully was:

   ```bash
   npx wrangler versions upload
   ```

5. The successful build proves Wrangler automatically discovered the root-level `wrangler.jsonc` and resolved:
   - `worker/worker.js`

6. A new Worker candidate version was uploaded:
   - `448f4dc5-a9e3-4eb5-a15f-beb28fac7ce8`

7. The Worker name is verified:
   - `galvicare-triage-intake`

8. The D1 binding is verified:
   - `DB`

9. The D1 database is verified:
   - `galvivault-0-5-qa`

10. The previously active version remains active at 100% traffic:
    - Active version: `a41848c6`
    - Active traffic: `100%`

11. The candidate version has not been promoted:
    - Candidate `448f4dc5-a9e3-4eb5-a15f-beb28fac7ce8` appears in version history.
    - Active deployment remains `a41848c6` at `100%`.

12. No secret values are exposed in the Human Evidence:
    - The build log and Cloudflare screenshots show binding/resource names and version IDs only.
    - No Stripe secret key, webhook signing secret, HubSpot token, Cloudflare token, or credential value is visible.

## Verified State

| Item | Verified value |
|---|---|
| Candidate version | `448f4dc5-a9e3-4eb5-a15f-beb28fac7ce8` |
| Worker | `galvicare-triage-intake` |
| DB binding | `DB` |
| D1 database | `galvivault-0-5-qa` |
| Active version | `a41848c6` |
| Active traffic | `100%` |
| Candidate promoted | **NO** |
| Secret values exposed | **NO** |
| Checkpoint 6 | **VERIFIED** |

## Next Authorized Action

**DAY 5 QA PREPARATION**

> Do not deploy.  
> Do not promote.  
> Do not run checkout.  
> Stop.
