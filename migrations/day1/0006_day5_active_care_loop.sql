PRAGMA foreign_keys = ON;

-- GalviCare 1.0 Day 5 additive active-care loop.
-- Extends the canonical BHR only. No shadow record system and no destructive changes.

CREATE TABLE IF NOT EXISTS gv1_finding_decisions (
  finding_decision_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  finding_id TEXT NOT NULL REFERENCES gv1_findings(finding_id),
  decision TEXT NOT NULL CHECK (decision IN ('confirm','reject','modify')),
  rationale TEXT,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  modified_statement TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  source_finding_version TEXT,
  encounter_fingerprint TEXT,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_finding_decisions_bmr_finding ON gv1_finding_decisions(bmr_id,finding_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_galvirx (
  rx_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  action_id TEXT,
  recommendation_id TEXT REFERENCES gv1_recommendations(recommendation_id),
  intervention_code TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_ref TEXT,
  resource_payload_json TEXT,
  instructions TEXT NOT NULL,
  owner TEXT NOT NULL,
  expected_evidence TEXT,
  cadence TEXT,
  guardrails TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  customer_visible INTEGER NOT NULL DEFAULT 1 CHECK (customer_visible IN (0,1)),
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_galvirx_bmr_plan ON gv1_galvirx(bmr_id,treatment_plan_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_galviaudit_orders (
  audit_order_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT REFERENCES gv1_treatment_plans(treatment_plan_id),
  finding_id TEXT REFERENCES gv1_findings(finding_id),
  domain TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_requested_json TEXT NOT NULL DEFAULT '[]',
  assigned_service TEXT,
  assigned_specialist TEXT,
  status TEXT NOT NULL DEFAULT 'ordered',
  result_ref TEXT,
  result_evidence_id TEXT REFERENCES gv1_evidence_items(evidence_id),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_galviaudit_bmr_status ON gv1_galviaudit_orders(bmr_id,status,created_at);

CREATE TABLE IF NOT EXISTS gv1_referrals (
  referral_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT REFERENCES gv1_treatment_plans(treatment_plan_id),
  finding_id TEXT REFERENCES gv1_findings(finding_id),
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_verification_status TEXT NOT NULL DEFAULT 'unverified',
  service_mode TEXT,
  geography TEXT,
  handoff_method TEXT,
  consent_status TEXT NOT NULL DEFAULT 'needs_consent',
  consent_version TEXT,
  minimum_disclosure_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposed',
  outcome_summary TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_referrals_bmr_status ON gv1_referrals(bmr_id,status,created_at);

CREATE TABLE IF NOT EXISTS gv1_checkins (
  checkin_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  action_id TEXT,
  due_context TEXT,
  responses_json TEXT NOT NULL DEFAULT '{}',
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  adherence_state TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_checkins_bmr_plan ON gv1_checkins(bmr_id,treatment_plan_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_milestones (
  milestone_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  action_id TEXT,
  milestone_code TEXT NOT NULL,
  status TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  observed_value TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_milestones_bmr_plan ON gv1_milestones(bmr_id,treatment_plan_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_reassessments (
  reassessment_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  decision TEXT NOT NULL CHECK (decision IN ('continue','modify','escalate','close','needs_evidence','human_review')),
  reason TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  outcome_refs_json TEXT NOT NULL DEFAULT '[]',
  source_versions_json TEXT NOT NULL DEFAULT '{}',
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_reassessments_bmr_plan ON gv1_reassessments(bmr_id,treatment_plan_id,created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0006', 'day5_active_care_loop_v1', 'qa',
   'gv1-0006-day5-active-care-loop', CURRENT_TIMESTAMP);
