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

-- Permanent D1 backstop for overlapping browser/legacy submissions.
-- The application owns normal idempotency. This trigger guarantees that a
-- second write for the required unique key updates the canonical answer
-- instead of returning HTTP 500 and breaking Shot → Sight → Path → Clinic.
CREATE TRIGGER IF NOT EXISTS day7d_clinical_followups_collision_safe
BEFORE INSERT ON clinical_followups
WHEN EXISTS (
  SELECT 1
  FROM clinical_followups
  WHERE session_id = NEW.session_id
    AND product = NEW.product
    AND question_id = NEW.question_id
)
BEGIN
  UPDATE clinical_followups
  SET current_stage = NEW.current_stage,
      question_text = NEW.question_text,
      answer = NEW.answer,
      confidence_impact = NEW.confidence_impact,
      updated_at = NEW.updated_at
  WHERE session_id = NEW.session_id
    AND product = NEW.product
    AND question_id = NEW.question_id;
  SELECT RAISE(IGNORE);
END;
