#!/usr/bin/env bash
set -euo pipefail

PROD_DB="galvivault-0-5-production"
PROD_CONFIG="wrangler.production.jsonc"
SCHEMA="migrations/production/0001_galvicare_0_5_production_baseline.sql"

printf '\n[Day 7B] Production schema critical-path gate\n'

for f in "$PROD_CONFIG" worker/production-entry.js "$SCHEMA"; do
  test -f "$f" || { echo "BLOCKED: missing $f"; exit 1; }
done

grep -q 'galvivault-0-5-production' "$PROD_CONFIG" || { echo 'BLOCKED: production DB name missing from Wrangler config'; exit 1; }
grep -q '2fc954b7-00ca-405b-8313-f91e706845a2' "$PROD_CONFIG" || { echo 'BLOCKED: verified production D1 ID missing from Wrangler config'; exit 1; }
if grep -q 'galvivault-0-5-qa' "$PROD_CONFIG"; then
  echo 'BLOCKED: QA D1 reference found in production Wrangler config'
  exit 1
fi

printf '\n[1/4] Running Day 7A + Day 7B regression gates...\n'
npm run day7b:gate

printf '\n[2/4] Applying schema to verified Production D1 only...\n'
npx wrangler d1 execute "$PROD_DB" --remote --config "$PROD_CONFIG" --file "$SCHEMA"

printf '\n[3/4] Verifying Production tables...\n'
npx wrangler d1 execute "$PROD_DB" --remote --config "$PROD_CONFIG" --command "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"

printf '\n[4/4] Verifying Production starts without customer/session/payment data...\n'
npx wrangler d1 execute "$PROD_DB" --remote --config "$PROD_CONFIG" --command "SELECT 'sessions' AS table_name, COUNT(*) AS row_count FROM sessions UNION ALL SELECT 'founders', COUNT(*) FROM founders UNION ALL SELECT 'ventures', COUNT(*) FROM ventures UNION ALL SELECT 'payments', COUNT(*) FROM payments UNION ALL SELECT 'entitlements', COUNT(*) FROM entitlements UNION ALL SELECT 'product_results', COUNT(*) FROM product_results;"

printf '\nPASS: Production schema initialized. Next gate is Human Evidence for runtime security/isolation and public payment/frontend routing.\n'
