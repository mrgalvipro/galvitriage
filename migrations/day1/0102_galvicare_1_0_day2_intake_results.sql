PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 2 additive intake/result substrate.
-- Reuses Day 1 identity, consent, evidence, request receipts, audit and one-BMR authority.
-- No existing table is rewritten or dropped.

CREATE TABLE IF NOT EXISTS gv1_day2_intake_results (
  result_id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL,
  founder_id TEXT NOT NULL,
  bmr_id TEXT,
  result_type TEXT NOT NULL CHECK (result_type IN ('triage','vitals','score')),
  score_type TEXT CHECK (score_type IN ('founder_readiness','business_health')),
  payload_json TEXT NOT NULL,
  supporting_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  contradictory_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  rules_version TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  generation_source TEXT NOT NULL DEFAULT 'rules' CHECK (generation_source='rules'),
  request_fingerprint TEXT NOT NULL,
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  client_request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (result_type, client_request_id),
  UNIQUE (context_id, result_type, record_version),
  FOREIGN KEY (context_id) REFERENCES gv1_principal_contexts(context_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE INDEX IF NOT EXISTS ix_gv1_day2_results_context
  ON gv1_day2_intake_results(context_id, result_type, record_version DESC);

CREATE INDEX IF NOT EXISTS ix_gv1_day2_results_founder
  ON gv1_day2_intake_results(founder_id, created_at);

CREATE INDEX IF NOT EXISTS ix_gv1_day2_results_bmr
  ON gv1_day2_intake_results(bmr_id, created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0102', 'galvicare_1_0_day2_intake_results', 'qa',
   'gc10-day2-intake-results-v1', CURRENT_TIMESTAMP);
