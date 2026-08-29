PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 7 release-critical Business Health Membership beta.
-- Additive only. Extends the canonical principal/BHR/Treatment Plan loop; no shadow record.
CREATE TABLE IF NOT EXISTS gv1_memberships (
  membership_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  membership_type TEXT NOT NULL DEFAULT 'business_health_beta'
    CHECK (membership_type IN ('business_health_beta')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','canceled','closed')),
  started_at TEXT NOT NULL,
  canceled_at TEXT,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_memberships_bmr
  ON gv1_memberships(bmr_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_memberships_principal
  ON gv1_memberships(principal_id,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_memberships_one_active_bmr
  ON gv1_memberships(bmr_id)
  WHERE status='active';

CREATE TABLE IF NOT EXISTS gv1_membership_events (
  membership_event_id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES gv1_memberships(membership_id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'membership_started','membership_canceled','checkin_submitted','reassessment_queued'
  )),
  related_entity_type TEXT,
  related_entity_id TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  correlation_id TEXT,
  client_request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_membership_events
  ON gv1_membership_events(membership_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_membership_checkins (
  membership_checkin_id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES gv1_memberships(membership_id),
  checkin_id TEXT NOT NULL REFERENCES gv1_checkins(checkin_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (membership_id,checkin_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_membership_checkins_membership
  ON gv1_membership_checkins(membership_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_membership_reassessment_queue (
  queue_id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES gv1_memberships(membership_id),
  checkin_id TEXT NOT NULL REFERENCES gv1_checkins(checkin_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','reviewed','superseded','closed')),
  reason_code TEXT NOT NULL DEFAULT 'membership_checkin',
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  UNIQUE (membership_id,checkin_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_membership_reassessment_pending
  ON gv1_membership_reassessment_queue(status,created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A1','day7_business_health_membership_beta_v1','qa',
   'gv1-d7a1-membership-beta-v1',CURRENT_TIMESTAMP);
