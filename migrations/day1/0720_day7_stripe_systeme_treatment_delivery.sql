PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 7 D7A3
-- Release-closing correction: Stripe is the commercial payment authority; Systeme.io is the
-- prescribed-treatment delivery/LMS authority. This migration is additive and preserves D7A2.
-- The legacy D7A2 provider field remains readable for compatibility and represents the
-- fulfillment/provider side for D7A3 rows; payment authority is explicit below.

ALTER TABLE gv1_commercial_care_orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT 'stripe'
  CHECK (payment_provider IN ('stripe'));
ALTER TABLE gv1_commercial_care_orders ADD COLUMN stripe_price_id TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN stripe_checkout_session_id TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN stripe_checkout_url TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN stripe_payment_intent_id TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'not_started'
  CHECK (payment_status IN ('not_started','checkout_started','paid','failed','refunded'));
ALTER TABLE gv1_commercial_care_orders ADD COLUMN payment_verified_at TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN fulfillment_provider TEXT NOT NULL DEFAULT 'systeme'
  CHECK (fulfillment_provider IN ('systeme'));
ALTER TABLE gv1_commercial_care_orders ADD COLUMN systeme_course_id TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN systeme_contact_id TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN systeme_enrollment_id TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN enrollment_status TEXT NOT NULL DEFAULT 'not_started'
  CHECK (enrollment_status IN ('not_started','pending_configuration','requested','enrolled','retry_required','failed'));
ALTER TABLE gv1_commercial_care_orders ADD COLUMN enrollment_attempted_at TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN enrolled_at TEXT;
ALTER TABLE gv1_commercial_care_orders ADD COLUMN enrollment_error_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_commercial_orders_stripe_checkout
  ON gv1_commercial_care_orders(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL AND stripe_checkout_session_id<>'';
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_orders_payment
  ON gv1_commercial_care_orders(payment_status,enrollment_status,created_at);

CREATE TABLE IF NOT EXISTS gv1_treatment_payment_events (
  payment_event_id TEXT PRIMARY KEY,
  provider_event_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'checkout.session.completed','checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed','charge.refunded'
  )),
  order_id TEXT REFERENCES gv1_commercial_care_orders(order_id),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT,
  amount_cents INTEGER,
  currency TEXT,
  request_fingerprint TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received','processed','quarantined','ignored')),
  failure_code TEXT,
  correlation_id TEXT,
  received_at TEXT NOT NULL,
  processed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_gv1_treatment_payment_events_order
  ON gv1_treatment_payment_events(order_id,received_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A3','day7_stripe_systeme_treatment_delivery_v1','qa',
   'gv1-d7a3-stripe-payment-systeme-fulfillment-v1',CURRENT_TIMESTAMP);
