PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 7 D7A4
-- Release-closing Option B fulfillment contract:
-- GalviVault remains the Treatment Plan orchestrator and creates one Systeme.io
-- fulfillment/enrollment record for each prescribed Sprint completion key.
-- Payment authority remains Stripe. Systeme.io remains treatment-delivery/completion authority.
-- Additive, replay-safe, no destructive migration.

CREATE TABLE IF NOT EXISTS gv1_systeme_course_fulfillments (
  fulfillment_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES gv1_commercial_care_orders(order_id),
  completion_key TEXT NOT NULL,
  systeme_course_id TEXT NOT NULL,
  systeme_contact_id TEXT,
  systeme_enrollment_id TEXT,
  access_type TEXT NOT NULL DEFAULT 'full_access'
    CHECK (access_type IN ('full_access')),
  enrollment_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (enrollment_status IN (
      'not_started','pending_configuration','requested','enrolled','retry_required','failed'
    )),
  completion_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (completion_status IN ('not_started','completed')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  enrollment_attempted_at TEXT,
  enrolled_at TEXT,
  completed_at TEXT,
  enrollment_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(order_id, completion_key)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_systeme_fulfillment_enrollment
  ON gv1_systeme_course_fulfillments(systeme_enrollment_id)
  WHERE systeme_enrollment_id IS NOT NULL AND systeme_enrollment_id <> '';

CREATE INDEX IF NOT EXISTS idx_gv1_systeme_fulfillment_order_state
  ON gv1_systeme_course_fulfillments(order_id,enrollment_status,completion_status,updated_at);

CREATE INDEX IF NOT EXISTS idx_gv1_systeme_fulfillment_course
  ON gv1_systeme_course_fulfillments(systeme_course_id,completion_key);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A4','day7_multi_sprint_systeme_fulfillment_v1','qa',
   'gv1-d7a4-galvivault-multi-sprint-systeme-public-api-v1',CURRENT_TIMESTAMP);
