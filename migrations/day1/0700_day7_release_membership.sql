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

-- Day 7 P0 returning-customer access. Passwords are never stored. GalviVault stores
-- PBKDF2-SHA256 verifier material only; invite and login tokens are stored only as hashes.
-- A returning-login session remains bound to one canonical principal/BHR and the existing
-- GalviCare session lineage. It does not create a new care event or a shadow BHR.
CREATE TABLE IF NOT EXISTS gv1_customer_accounts (
  account_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL UNIQUE REFERENCES gv1_founders(founder_id),
  email_normalized TEXT NOT NULL UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL CHECK (password_iterations >= 100000),
  password_version INTEGER NOT NULL DEFAULT 1 CHECK (password_version >= 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','locked','disabled')),
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_accounts_email
  ON gv1_customer_accounts(email_normalized,status);

CREATE TABLE IF NOT EXISTS gv1_customer_login_invites (
  invite_hash TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  legacy_session_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'business_health_membership'
    CHECK (source_type IN ('business_health_membership')),
  source_entity_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL UNIQUE,
  created_by_actor_type TEXT NOT NULL,
  created_by_actor_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_login_invites_principal
  ON gv1_customer_login_invites(principal_id,bmr_id,expires_at);

CREATE TABLE IF NOT EXISTS gv1_customer_login_sessions (
  session_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES gv1_customer_accounts(account_id),
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  legacy_session_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_login_sessions_account
  ON gv1_customer_login_sessions(account_id,expires_at);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_login_sessions_bmr
  ON gv1_customer_login_sessions(bmr_id,expires_at);

-- Day 7 P1: customer-facing Pre-Founder identity/session and principal-only care lineage.
-- Pre-Founder is a real principal with no fabricated venture/BHR. These tables provide
-- the longitudinal care envelope until canonical venture creation is evidence-supported.
CREATE TABLE IF NOT EXISTS gv1_prefounder_sessions (
  session_hash TEXT PRIMARY KEY,
  context_id TEXT NOT NULL REFERENCES gv1_principal_contexts(context_id),
  founder_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_sessions_context
  ON gv1_prefounder_sessions(context_id,expires_at);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_sessions_founder
  ON gv1_prefounder_sessions(founder_id,expires_at);

CREATE TABLE IF NOT EXISTS gv1_prefounder_care_events (
  event_id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL REFERENCES gv1_principal_contexts(context_id),
  founder_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'galvishot_completed','galvichart_activated','galvisight_completed','galvipath_completed',
    'clinic_booking_requested','physician_plan','customer_acknowledged','monitoring_checkin',
    'reassessment_requested'
  )),
  product TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer','business_physician')),
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL UNIQUE,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_care_context
  ON gv1_prefounder_care_events(context_id,created_at,event_id);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_care_founder
  ON gv1_prefounder_care_events(founder_id,created_at,event_id);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A1','day7_business_health_membership_beta_v1','qa',
   'gv1-d7a1-membership-beta-v1',CURRENT_TIMESTAMP);

-- Day 7 is intentionally cumulative. Preserve the migration identity while making
-- its checksum describe the final signed Membership + returning-customer schema.
UPDATE gv1_schema_migrations
SET checksum='gv1-d7a1-membership-prefounder-customer-access-v3'
WHERE migration_id='D7A1' AND name='day7_business_health_membership_beta_v1';

-- Release migrations must never rewrite a named Human-E2E patient's identity to make a test pass.
-- Returning-login identity is established by the normal GalviTriage -> canonical principal bridge.
-- QA fixture-specific proof belongs in release evidence; it does not belong in the additive
-- production-target schema migration. manual_repair=NO.

-- D7A2: release-closing Commercial + Return/Retrieval loop and FounderShot.
-- This remains additive. A named venture by itself never creates an operating-Founder BMR.
CREATE TABLE IF NOT EXISTS gv1_commercial_care_orders (
  order_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  context_id TEXT REFERENCES gv1_principal_contexts(context_id),
  bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id),
  source_physician_event_id TEXT,
  source_treatment_plan_id TEXT,
  studio_engagement_id TEXT REFERENCES gv1_studio_engagements(engagement_id),
  persona_code TEXT NOT NULL DEFAULT 'A' CHECK (persona_code IN ('A','B','C','D')),
  service_code TEXT NOT NULL,
  service_kind TEXT NOT NULL CHECK (service_kind IN ('course','sprint','treatment_plan','diagnostic','surgery','membership')),
  provider TEXT NOT NULL CHECK (provider IN ('systeme','stripe','internal')),
  provider_offer_key TEXT,
  provider_sale_id TEXT,
  purchaser_email_normalized TEXT NOT NULL,
  amount_cents INTEGER CHECK (amount_cents IS NULL OR amount_cents >= 0),
  currency TEXT,
  required_completion_keys_json TEXT NOT NULL DEFAULT '[]',
  completed_completion_keys_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (
    'proposed','checkout_started','paid','enrolled','course_completed','customer_confirmed','fulfilled','refunded','canceled'
  )),
  paid_at TEXT,
  completed_at TEXT,
  customer_confirmed_at TEXT,
  client_request_id TEXT NOT NULL UNIQUE,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK ((context_id IS NOT NULL) OR (bmr_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_principal
  ON gv1_commercial_care_orders(principal_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_context
  ON gv1_commercial_care_orders(context_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_bmr
  ON gv1_commercial_care_orders(bmr_id,status,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_commercial_orders_provider_sale
  ON gv1_commercial_care_orders(provider,provider_sale_id)
  WHERE provider_sale_id IS NOT NULL AND provider_sale_id<>'';

CREATE TABLE IF NOT EXISTS gv1_systeme_integration_events (
  integration_event_id TEXT PRIMARY KEY,
  provider_event_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL CHECK (event_type IN ('new_sale','course_completed','sale_canceled')),
  order_id TEXT REFERENCES gv1_commercial_care_orders(order_id),
  contact_email_normalized TEXT,
  completion_key TEXT,
  request_fingerprint TEXT NOT NULL,
  safe_payload_json TEXT NOT NULL DEFAULT '{}',
  processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received','processed','quarantined','ignored')),
  failure_code TEXT,
  correlation_id TEXT,
  received_at TEXT NOT NULL,
  processed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_gv1_systeme_events_order
  ON gv1_systeme_integration_events(order_id,received_at);

CREATE TABLE IF NOT EXISTS gv1_care_reassessment_queue (
  queue_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  context_id TEXT REFERENCES gv1_principal_contexts(context_id),
  bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id),
  order_id TEXT NOT NULL REFERENCES gv1_commercial_care_orders(order_id),
  status TEXT NOT NULL DEFAULT 'awaiting_customer_return' CHECK (status IN ('awaiting_customer_return','pending','reviewed','superseded','closed')),
  reason_code TEXT NOT NULL,
  source_completion_ref TEXT,
  physician_decision_json TEXT,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  customer_confirmed_at TEXT,
  reviewed_at TEXT,
  UNIQUE (order_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_care_reassessment_pending
  ON gv1_care_reassessment_queue(status,created_at);

CREATE TABLE IF NOT EXISTS gv1_founder_snapshots (
  founder_snapshot_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  context_id TEXT REFERENCES gv1_principal_contexts(context_id),
  bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id),
  snapshot_json TEXT NOT NULL,
  lifecycle_assessment_json TEXT NOT NULL,
  generation_source TEXT NOT NULL CHECK (generation_source IN ('openai_governed','deterministic_fallback','historical_import')),
  provider TEXT,
  provider_response_id TEXT,
  model TEXT,
  prompt_version TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  validation_status TEXT NOT NULL DEFAULT 'accepted' CHECK (validation_status IN ('accepted','needs_review','rejected','superseded')),
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_founder_snapshots_principal
  ON gv1_founder_snapshots(principal_id,version_no,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_founder_snapshots_bmr
  ON gv1_founder_snapshots(bmr_id,version_no,created_at);

CREATE TABLE IF NOT EXISTS gv1_lifecycle_transition_reviews (
  review_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  source_context_id TEXT NOT NULL REFERENCES gv1_principal_contexts(context_id),
  source_snapshot_id TEXT NOT NULL REFERENCES gv1_founder_snapshots(founder_snapshot_id),
  from_lifecycle TEXT NOT NULL,
  proposed_lifecycle TEXT NOT NULL CHECK (proposed_lifecycle IN ('pre_founder','operating_founder','uncertain')),
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  rationale_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','confirmed','applied','rejected')),
  venture_name TEXT,
  applied_context_id TEXT REFERENCES gv1_principal_contexts(context_id),
  applied_bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id),
  actor_type TEXT,
  actor_id TEXT,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  decided_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_gv1_lifecycle_reviews_pending
  ON gv1_lifecycle_transition_reviews(status,created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A2','day7_commercial_return_foundershot_v1','qa',
   'gv1-d7a2-commercial-return-foundershot-v1',CURRENT_TIMESTAMP);