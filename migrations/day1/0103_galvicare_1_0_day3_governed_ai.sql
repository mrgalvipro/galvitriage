PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 3 additive governed-AI substrate.
-- Reuses Day 1/2 identity, consent, evidence, audit and canonical BHR authority.
-- This migration creates only generation/artifact lineage; it does not create a
-- second principal, venture, BHR, evidence store, payment store, or clinical truth.

CREATE TABLE IF NOT EXISTS gv1_day3_ai_generations (
  generation_id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL,
  founder_id TEXT NOT NULL,
  bmr_id TEXT,
  task TEXT NOT NULL CHECK (task IN (
    'explain_findings','propose_root_causes','synthesize_evidence','draft_path'
  )),
  request_fingerprint TEXT NOT NULL,
  attempt_no INTEGER NOT NULL DEFAULT 1 CHECK (attempt_no >= 1),
  provider TEXT,
  provider_response_id TEXT,
  model TEXT,
  prompt_version TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  evidence_bundle_hash TEXT NOT NULL,
  deterministic_context_hash TEXT NOT NULL,
  proposal_json TEXT,
  validation_status TEXT NOT NULL CHECK (validation_status IN (
    'accepted','rejected','needs_review'
  )),
  validation_errors_json TEXT NOT NULL DEFAULT '[]',
  approval_status TEXT NOT NULL CHECK (approval_status IN (
    'not_required','clinician_required','approved','rejected'
  )),
  customer_projection INTEGER NOT NULL DEFAULT 0 CHECK (customer_projection IN (0,1)),
  correlation_id TEXT NOT NULL,
  latency_ms INTEGER,
  usage_json TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  UNIQUE (request_fingerprint, attempt_no),
  FOREIGN KEY (context_id) REFERENCES gv1_principal_contexts(context_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE INDEX IF NOT EXISTS ix_gv1_day3_generation_scope
  ON gv1_day3_ai_generations(context_id, task, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_gv1_day3_generation_fingerprint
  ON gv1_day3_ai_generations(request_fingerprint, attempt_no DESC);
CREATE INDEX IF NOT EXISTS ix_gv1_day3_generation_bmr
  ON gv1_day3_ai_generations(bmr_id, created_at DESC);

CREATE TABLE IF NOT EXISTS gv1_day3_generation_evidence (
  generation_id TEXT NOT NULL,
  evidence_kind TEXT NOT NULL CHECK (evidence_kind IN ('principal','bmr')),
  evidence_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('supporting','contradictory','context')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (generation_id, evidence_kind, evidence_id, role),
  FOREIGN KEY (generation_id) REFERENCES gv1_day3_ai_generations(generation_id)
);

CREATE INDEX IF NOT EXISTS ix_gv1_day3_generation_evidence_id
  ON gv1_day3_generation_evidence(evidence_kind, evidence_id);

CREATE TABLE IF NOT EXISTS gv1_day3_governed_artifacts (
  artifact_id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL UNIQUE,
  context_id TEXT NOT NULL,
  founder_id TEXT NOT NULL,
  bmr_id TEXT,
  task TEXT NOT NULL CHECK (task IN (
    'explain_findings','propose_root_causes','synthesize_evidence','draft_path'
  )),
  product TEXT NOT NULL CHECK (product IN ('GalviShot','GalviSight','GalviPath')),
  artifact_json TEXT NOT NULL,
  supporting_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  contradictory_evidence_ids_json TEXT NOT NULL DEFAULT '[]',
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  generation_source TEXT NOT NULL CHECK (generation_source IN ('openai_governed','clinician')),
  validation_status TEXT NOT NULL CHECK (validation_status='accepted'),
  approval_status TEXT NOT NULL CHECK (approval_status IN (
    'not_required','approved'
  )),
  customer_projection INTEGER NOT NULL DEFAULT 1 CHECK (customer_projection IN (0,1)),
  request_fingerprint TEXT NOT NULL UNIQUE,
  prompt_version TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (context_id, task, record_version),
  FOREIGN KEY (generation_id) REFERENCES gv1_day3_ai_generations(generation_id),
  FOREIGN KEY (context_id) REFERENCES gv1_principal_contexts(context_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE INDEX IF NOT EXISTS ix_gv1_day3_artifact_scope
  ON gv1_day3_governed_artifacts(context_id, task, record_version DESC);
CREATE INDEX IF NOT EXISTS ix_gv1_day3_artifact_bmr
  ON gv1_day3_governed_artifacts(bmr_id, created_at DESC);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0103', 'galvicare_1_0_day3_governed_ai', 'qa',
   'gc10-day3-governed-ai-v1', CURRENT_TIMESTAMP);
