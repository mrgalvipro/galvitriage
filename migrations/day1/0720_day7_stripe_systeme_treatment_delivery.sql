PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 7 D7A3
-- Release-closing correction: Stripe is the commercial payment authority; Systeme.io is the
-- prescribed-treatment delivery/LMS authority. This migration is additive, replay-safe and
-- preserves the signed D7A2 commercial order contract unchanged.

CREATE TABLE IF NOT EXISTS gv1_commercial_order_delivery (
  order_id TEXT PRIMARY KEY REFERENCES gv1_commercial_care_orders(order_id),
  payment_provider TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_provider IN ('stripe')),
  stripe_price_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_checkout_url TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (payment_status IN ('not_started','checkout_started','paid','failed','refunded')),
  payment_verified_at TEXT,
  fulfillment_provider TEXT NOT NULL DEFAULT 'systeme' CHECK (fulfillment_provider IN ('systeme')),
  systeme_course_id TEXT,
  systeme_contact_id TEXT,
  systeme_enrollment_id TEXT,
  enrollment_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (enrollment_status IN ('not_started','pending_configuration','requested','enrolled','retry_required','failed')),
  enrollment_attempted_at TEXT,
  enrolled_at TEXT,
  enrollment_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_commercial_delivery_stripe_checkout
  ON gv1_commercial_order_delivery(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL AND stripe_checkout_session_id<>'';
CREATE INDEX IF NOT EXISTS idx_gv1_commercial_delivery_state
  ON gv1_commercial_order_delivery(payment_status,enrollment_status,updated_at);

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
   'gv1-d7a3-stripe-payment-systeme-fulfillment-v2',CURRENT_TIMESTAMP);
