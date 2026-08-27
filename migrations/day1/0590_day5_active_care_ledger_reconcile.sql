PRAGMA foreign_keys = ON;

-- Corrective ledger-only migration.
-- The shared QA database already uses numeric migration IDs 0006/0007 for legacy Day 8 migrations.
-- Day 5 active-care schema was applied successfully but its INSERT OR IGNORE ledger rows collided.
-- Do not re-run destructive/duplicate ALTER statements; record unique semantic Day 5 ledger identities instead.

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('D5A1', 'day5_active_care_loop_v1', 'qa',
   'gv1-d5a1-day5-active-care-loop', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('D5A2', 'day5_treatment_contract_v1', 'qa',
   'gv1-d5a2-day5-treatment-contract', CURRENT_TIMESTAMP);
