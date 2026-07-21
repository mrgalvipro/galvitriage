# Day 3 QA Evidence

## Automated coverage

- Golden revenue/customer fixture: deterministic stored GalviShot, 3+ findings, evidence links, stored refresh unchanged.
- Relational evidence persistence: every displayed GalviShot finding writes at least one `galvishot_evidence_links` row whose `source_type`, `source_field`, `display_value`, `used_for`, `rules_version`, product, and finding code match the finding evidence object.
- Evidence idempotency: repeated `get_or_create_galvishot` calls return the stored result and create zero duplicate `galvishot_evidence_links` rows.
- Locked/unpaid request: returns `locked` without paid result payload.
- QA override isolation: production environment rejects the QA override token.
- Low confidence: withholds final GalviShot and asks targeted follow-up.
- Follow-up duplicate save: upserts a single follow-up row.
- Frontend security: no browser result builder or localStorage payment unlock; frontend calls `get_or_create_galvishot`.

## Production controls

No migration, deployment, merge, live Stripe change, production secret access, or live-data mutation was performed.
