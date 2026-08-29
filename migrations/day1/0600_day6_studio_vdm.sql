PRAGMA foreign_keys = ON;

-- GalviStudio 1.0 / GalviCare 1.0 Day 6 additive Venture Development layer.
-- Extends the canonical principal/BHR record only. No shadow record system.

CREATE TABLE IF NOT EXISTS gv1_studio_engagements (
  engagement_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id),
  source_treatment_plan_id TEXT REFERENCES gv1_treatment_plans(treatment_plan_id),
  source_action_id TEXT,
  support_level TEXT NOT NULL DEFAULT 'galvistudio',
  pillar_code TEXT NOT NULL,
  program_code TEXT,
  sprint_code TEXT,
  intervention_code TEXT NOT NULL,
  catalog_version TEXT NOT NULL,
  sprint_version TEXT,
  objective TEXT NOT NULL,
  entry_gate_json TEXT NOT NULL DEFAULT '{}',
  required_evidence_json TEXT NOT NULL DEFAULT '[]',
  expected_outcomes_json TEXT NOT NULL DEFAULT '[]',
  assigned_actor_type TEXT,
  assigned_actor_id TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','active','waiting_evidence','completed','cancelled','closed')),
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id),
  CHECK ((bmr_id IS NULL AND source_treatment_plan_id IS NULL) OR bmr_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_studio_engagement_principal ON gv1_studio_engagements(principal_id,created_at);
CREATE INDEX IF NOT EXISTS idx_studio_engagement_bmr ON gv1_studio_engagements(bmr_id,created_at);
CREATE INDEX IF NOT EXISTS idx_studio_engagement_plan ON gv1_studio_engagements(source_treatment_plan_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_studio_stage_gates (
  gate_id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL REFERENCES gv1_studio_engagements(engagement_id),
  lifecycle_stage TEXT NOT NULL,
  entry_criteria_json TEXT NOT NULL DEFAULT '[]',
  required_evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  current_evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  intervention TEXT,
  capital_exposure TEXT,
  decision TEXT NOT NULL CHECK (decision IN ('ADVANCE','HOLD','REWORK','STOP')),
  decision_actor_type TEXT NOT NULL,
  decision_actor_id TEXT NOT NULL,
  exit_criteria_json TEXT NOT NULL DEFAULT '[]',
  outcome_refs_json TEXT NOT NULL DEFAULT '[]',
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  decision_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id),
  UNIQUE (engagement_id, version_no)
);
CREATE INDEX IF NOT EXISTS idx_studio_gate_engagement ON gv1_studio_stage_gates(engagement_id,version_no,decision_at);

CREATE TABLE IF NOT EXISTS gv1_studio_artifact_refs (
  artifact_ref_id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL REFERENCES gv1_studio_engagements(engagement_id),
  evidence_id TEXT,
  artifact_type TEXT NOT NULL,
  artifact_ref TEXT NOT NULL,
  provenance_json TEXT NOT NULL DEFAULT '{}',
  validation_status TEXT NOT NULL DEFAULT 'reported' CHECK (validation_status IN ('reported','validated','contradicted','pending','rejected')),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_studio_artifact_engagement ON gv1_studio_artifact_refs(engagement_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_studio_outcomes (
  studio_outcome_id TEXT PRIMARY KEY,
  engagement_id TEXT NOT NULL REFERENCES gv1_studio_engagements(engagement_id),
  source_gate_id TEXT REFERENCES gv1_studio_stage_gates(gate_id),
  objective TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  outcome_payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded','validated','needs_review','superseded','archived')),
  reassessment_required INTEGER NOT NULL DEFAULT 1 CHECK (reassessment_required IN (0,1)),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  recorded_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_studio_outcome_engagement ON gv1_studio_outcomes(engagement_id,recorded_at);

CREATE TABLE IF NOT EXISTS gv1_studio_venture_proof (
  proof_id TEXT PRIMARY KEY,
  venture_case_id TEXT NOT NULL,
  proof_dimension TEXT NOT NULL CHECK (proof_dimension IN ('founder_development','product_development','business_development','corporate_development','studio_operating')),
  claim_text TEXT NOT NULL,
  evidence_refs_json TEXT NOT NULL DEFAULT '[]',
  validation_status TEXT NOT NULL DEFAULT 'draft' CHECK (validation_status IN ('draft','unsupported','validated','rejected')),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_studio_proof_case ON gv1_studio_venture_proof(venture_case_id,proof_dimension,created_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D6A1','day6_studio_vdm_v1','qa','gv1-d6a1-studio-vdm-v1',CURRENT_TIMESTAMP);
