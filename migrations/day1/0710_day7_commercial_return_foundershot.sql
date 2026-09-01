PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 7 release-closing Commercial + Return/Retrieval + FounderShot layer.
-- Additive only. A named/self-reported venture does not by itself establish an operating-Founder BMR.

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
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_principal ON gv1_commercial_care_orders(principal_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_context ON gv1_commercial_care_orders(context_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_bmr ON gv1_commercial_care_orders(bmr_id,status,created_at);
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
CREATE INDEX IF NOT EXISTS idx_gv1_systeme_events_order ON gv1_systeme_integration_events(order_id,received_at);

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
CREATE INDEX IF NOT EXISTS idx_gv1_care_reassessment_pending ON gv1_care_reassessment_queue(status,created_at);

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
CREATE INDEX IF NOT EXISTS idx_gv1_founder_snapshots_principal ON gv1_founder_snapshots(principal_id,version_no,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_founder_snapshots_bmr ON gv1_founder_snapshots(bmr_id,version_no,created_at);

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
CREATE INDEX IF NOT EXISTS idx_gv1_lifecycle_reviews_pending ON gv1_lifecycle_transition_reviews(status,created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A2','day7_commercial_return_foundershot_v1','qa',
   'gv1-d7a2-commercial-return-foundershot-v1',CURRENT_TIMESTAMP);
