-- GalviCare 0.5 Day 7D — cumulative Customer Intelligence schema
-- QA-safe, additive and idempotent.
-- IMPORTANT: Day 1 already owns clinical_evidence and clinical_observations
-- with different column contracts. Day 7D therefore uses dedicated tables
-- rather than altering or replacing accepted Day 1–7C clinical structures.

CREATE TABLE IF NOT EXISTS day7d_context_evidence (
  evidence_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  stage TEXT NOT NULL,
  evidence_key TEXT NOT NULL,
  evidence_role TEXT,
  raw_value TEXT,
  normalized_value TEXT,
  rules_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_id, evidence_key)
);
CREATE INDEX IF NOT EXISTS idx_day7d_context_evidence_session
  ON day7d_context_evidence(session_id);

CREATE TABLE IF NOT EXISTS clinical_evidence_versions (
  session_id TEXT PRIMARY KEY,
  evidence_version INTEGER NOT NULL DEFAULT 0,
  last_reason TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS day7d_observations (
  observation_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  observation_code TEXT NOT NULL,
  observation_type TEXT NOT NULL,
  statement TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  rules_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(session_id, observation_code)
);
CREATE INDEX IF NOT EXISTS idx_day7d_observations_session
  ON day7d_observations(session_id);
