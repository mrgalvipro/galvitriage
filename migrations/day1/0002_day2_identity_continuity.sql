PRAGMA foreign_keys = ON;

-- GalviVault P0 Day 2 additive identity and continuity migration.
-- This migration is forward-only and intentionally remains in migrations/day1
-- because wrangler.json already binds the isolated GalviVault QA Worker to that
-- migration directory. Migration 0001 is never rewritten.

ALTER TABLE gv1_founders ADD COLUMN normalized_email TEXT;
ALTER TABLE gv1_founders ADD COLUMN profile_json TEXT;

UPDATE gv1_founders
SET normalized_email = lower(trim(email))
WHERE email IS NOT NULL
  AND trim(email) <> ''
  AND normalized_email IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_founders_normalized_email
  ON gv1_founders(normalized_email)
  WHERE normalized_email IS NOT NULL AND normalized_email <> '';

ALTER TABLE gv1_ventures ADD COLUMN website TEXT;
ALTER TABLE gv1_ventures ADD COLUMN industry TEXT;
ALTER TABLE gv1_ventures ADD COLUMN revenue_range TEXT;
ALTER TABLE gv1_ventures ADD COLUMN profile_json TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_bmr_one_per_venture
  ON gv1_business_medical_records(venture_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_roles_one_active_primary
  ON gv1_founder_venture_roles(venture_id)
  WHERE is_primary = 1 AND status = 'active';

ALTER TABLE gv1_idempotency_keys ADD COLUMN response_json TEXT;

CREATE INDEX IF NOT EXISTS ix_gv1_founders_normalized_email
  ON gv1_founders(normalized_email);
CREATE INDEX IF NOT EXISTS ix_gv1_roles_founder_status
  ON gv1_founder_venture_roles(founder_id, status, venture_id);
CREATE INDEX IF NOT EXISTS ix_gv1_roles_venture_status
  ON gv1_founder_venture_roles(venture_id, status, founder_id);
CREATE INDEX IF NOT EXISTS ix_gv1_bmr_venture_status
  ON gv1_business_medical_records(venture_id, status);
CREATE INDEX IF NOT EXISTS ix_gv1_sessions_founder_venture
  ON gv1_assessment_sessions(founder_id, venture_id, created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0002', 'day2_identity_continuity', 'qa', 'galvivault-day2-identity-v1', CURRENT_TIMESTAMP);
