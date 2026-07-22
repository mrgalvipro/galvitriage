-- GalviCare 0.5 Day 5 clinic payment and booking additive migration.
-- QA-only migration; do not apply to production during Codex implementation.

CREATE TABLE IF NOT EXISTS stripe_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  stripe_session_id TEXT,
  payment_status TEXT,
  processed_at TEXT NOT NULL,
  payload_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_session
  ON stripe_events(stripe_session_id, event_type);

CREATE TABLE IF NOT EXISTS clinic_records (
  clinic_record_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL DEFAULT 'galviclinic',
  source_product TEXT NOT NULL DEFAULT 'GalviPath',
  source_result_id TEXT,
  pathway_code TEXT,
  indication_codes_json TEXT NOT NULL DEFAULT '[]',
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  clinic_status TEXT NOT NULL DEFAULT 'active',
  booking_status TEXT NOT NULL DEFAULT 'not_started',
  rules_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_clinic_records_active_session_product
  ON clinic_records(session_id, product)
  WHERE clinic_status = 'active';

CREATE INDEX IF NOT EXISTS idx_clinic_records_session
  ON clinic_records(session_id, product, clinic_status);

CREATE TABLE IF NOT EXISTS clinic_bookings (
  booking_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  clinic_record_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual_followup',
  provider_booking_id TEXT,
  booking_status TEXT NOT NULL,
  booking_url TEXT,
  source_product TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (clinic_record_id) REFERENCES clinic_records(clinic_record_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_clinic_booking_provider_id
  ON clinic_bookings(provider, provider_booking_id)
  WHERE provider_booking_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_clinic_booking_bounded_manual
  ON clinic_bookings(session_id, clinic_record_id, booking_status)
  WHERE provider_booking_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_clinic_bookings_session
  ON clinic_bookings(session_id, clinic_record_id, booking_status);

CREATE INDEX IF NOT EXISTS idx_payments_day5_session_product_status
  ON payments(session_id, product, payment_status);

CREATE INDEX IF NOT EXISTS idx_entitlements_day5_session_product_status
  ON entitlements(session_id, product, entitlement_status);

INSERT OR REPLACE INTO release_metadata(metadata_key, metadata_value, updated_at)
VALUES ('day5_clinic_payment_booking', 'galviclinic_v0_5_1', datetime('now'));
