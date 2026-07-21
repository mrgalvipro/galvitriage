# Day 3 QA Evidence

## Automated coverage

- Golden revenue/customer fixture: deterministic stored GalviShot, 3+ findings, evidence links, stored refresh unchanged.
- Locked/unpaid request: returns `locked` without paid result payload.
- QA override isolation: production environment rejects the QA override token.
- Low confidence: withholds final GalviShot and asks targeted follow-up.
- Follow-up duplicate save: upserts a single follow-up row.
- Frontend security: no browser result builder or localStorage payment unlock; frontend calls `get_or_create_galvishot`.

## Production controls

No migration, deployment, merge, live Stripe change, production secret access, or live-data mutation was performed.
