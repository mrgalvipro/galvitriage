PRAGMA foreign_keys = ON;

-- GalviVault P0 Day 3 additive evidence/versioning migration.
-- Extends the applied gv1_ Day 1 schema without rewriting migration 0001.

ALTER TABLE gv1_question_definitions ADD COLUMN required_flag INTEGER NOT NULL DEFAULT 0 CHECK (required_flag IN (0,1));
ALTER TABLE gv1_question_definitions ADD COLUMN minimum_value REAL;
ALTER TABLE gv1_question_definitions ADD COLUMN maximum_value REAL;
ALTER TABLE gv1_question_definitions ADD COLUMN weight REAL;
ALTER TABLE gv1_question_definitions ADD COLUMN score_direction TEXT;
ALTER TABLE gv1_question_definitions ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','retired'));
ALTER TABLE gv1_question_definitions ADD COLUMN effective_at TEXT;
ALTER TABLE gv1_question_definitions ADD COLUMN retired_at TEXT;

ALTER TABLE gv1_assessment_answers ADD COLUMN bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id);
ALTER TABLE gv1_assessment_answers ADD COLUMN question_version TEXT;
ALTER TABLE gv1_assessment_answers ADD COLUMN answer_group_id TEXT;
ALTER TABLE gv1_assessment_answers ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_assessment_answers ADD COLUMN supersedes_answer_id TEXT REFERENCES gv1_assessment_answers(answer_id);
ALTER TABLE gv1_assessment_answers ADD COLUMN raw_value_text TEXT;
ALTER TABLE gv1_assessment_answers ADD COLUMN raw_value_number REAL;
ALTER TABLE gv1_assessment_answers ADD COLUMN normalized_value_text TEXT;
ALTER TABLE gv1_assessment_answers ADD COLUMN normalized_value_number REAL;
ALTER TABLE gv1_assessment_answers ADD COLUMN confidence_effect REAL;
ALTER TABLE gv1_assessment_answers ADD COLUMN source TEXT;
ALTER TABLE gv1_assessment_answers ADD COLUMN captured_at TEXT;
ALTER TABLE gv1_assessment_answers ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','accepted','superseded','rejected'));
ALTER TABLE gv1_assessment_answers ADD COLUMN content_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_answer_group_version
  ON gv1_assessment_answers(answer_group_id, version_no)
  WHERE answer_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_gv1_answers_session_question_version
  ON gv1_assessment_answers(session_id, question_id, version_no DESC);
CREATE INDEX IF NOT EXISTS ix_gv1_answers_bmr
  ON gv1_assessment_answers(bmr_id, captured_at DESC);

ALTER TABLE gv1_evidence_items ADD COLUMN evidence_group_id TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_evidence_items ADD COLUMN supersedes_evidence_id TEXT REFERENCES gv1_evidence_items(evidence_id);
ALTER TABLE gv1_evidence_items ADD COLUMN source_type TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN source_ref TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN value_type TEXT CHECK (value_type IN ('text','number','boolean','date','json','reference','file_reference'));
ALTER TABLE gv1_evidence_items ADD COLUMN value_text TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN value_number REAL;
ALTER TABLE gv1_evidence_items ADD COLUMN value_boolean INTEGER CHECK (value_boolean IN (0,1));
ALTER TABLE gv1_evidence_items ADD COLUMN value_date TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN value_json TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','accepted','superseded','rejected','archived'));
ALTER TABLE gv1_evidence_items ADD COLUMN consent_status TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN source_actor_type TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN source_actor_id TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN captured_at TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN content_hash TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN rejection_reason TEXT;
ALTER TABLE gv1_evidence_items ADD COLUMN updated_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_evidence_group_version
  ON gv1_evidence_items(evidence_group_id, version_no)
  WHERE evidence_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_gv1_evidence_bmr_current
  ON gv1_evidence_items(bmr_id, evidence_group_id, version_no DESC, status);
CREATE INDEX IF NOT EXISTS ix_gv1_evidence_session
  ON gv1_evidence_items(session_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS ix_gv1_evidence_source
  ON gv1_evidence_items(source_type, source_ref);
CREATE INDEX IF NOT EXISTS ix_gv1_evidence_supersedes
  ON gv1_evidence_items(supersedes_evidence_id);

ALTER TABLE gv1_evidence_relationships ADD COLUMN rationale TEXT;
ALTER TABLE gv1_evidence_relationships ADD COLUMN correlation_id TEXT;
CREATE INDEX IF NOT EXISTS ix_gv1_evidence_relationship_to
  ON gv1_evidence_relationships(to_evidence_id, relationship_type);

ALTER TABLE gv1_import_batches ADD COLUMN source_name TEXT;
ALTER TABLE gv1_import_batches ADD COLUMN source_checksum TEXT;
ALTER TABLE gv1_import_batches ADD COLUMN environment TEXT;
ALTER TABLE gv1_import_batches ADD COLUMN expected_count INTEGER CHECK (expected_count IS NULL OR expected_count >= 0);
ALTER TABLE gv1_import_batches ADD COLUMN processed_count INTEGER NOT NULL DEFAULT 0 CHECK (processed_count >= 0);
ALTER TABLE gv1_import_batches ADD COLUMN imported_count INTEGER NOT NULL DEFAULT 0 CHECK (imported_count >= 0);
ALTER TABLE gv1_import_batches ADD COLUMN skipped_count INTEGER NOT NULL DEFAULT 0 CHECK (skipped_count >= 0);
ALTER TABLE gv1_import_batches ADD COLUMN error_count INTEGER NOT NULL DEFAULT 0 CHECK (error_count >= 0);
ALTER TABLE gv1_import_batches ADD COLUMN created_by TEXT;
ALTER TABLE gv1_import_batches ADD COLUMN updated_at TEXT;

ALTER TABLE gv1_import_errors ADD COLUMN source_row_key TEXT;
ALTER TABLE gv1_import_errors ADD COLUMN field_name TEXT;
ALTER TABLE gv1_import_errors ADD COLUMN quarantined_payload_json TEXT;
ALTER TABLE gv1_import_errors ADD COLUMN correlation_id TEXT;

CREATE TABLE IF NOT EXISTS gv1_import_row_receipts (
  import_batch_id TEXT NOT NULL,
  source_row_key TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  result_type TEXT NOT NULL CHECK (result_type IN ('imported','skipped','error')),
  canonical_entity_id TEXT,
  error_code TEXT,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (import_batch_id, source_row_key),
  FOREIGN KEY (import_batch_id) REFERENCES gv1_import_batches(import_batch_id)
);

CREATE INDEX IF NOT EXISTS ix_gv1_import_errors_batch
  ON gv1_import_errors(import_batch_id, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_import_receipts_result
  ON gv1_import_row_receipts(import_batch_id, result_type);

CREATE TRIGGER IF NOT EXISTS trg_gv1_accepted_evidence_no_update
BEFORE UPDATE ON gv1_evidence_items
WHEN OLD.status = 'accepted'
BEGIN
  SELECT RAISE(ABORT, 'GV_EVIDENCE_IMMUTABLE');
END;

INSERT OR IGNORE INTO gv1_question_definitions (
  question_id, product, version, dimension, prompt, response_type,
  display_order, active, created_at, updated_at, required_flag,
  minimum_value, maximum_value, weight, score_direction, status,
  effective_at, retired_at
) VALUES (
  'triage.problem_clarity', 'GalviTriage', 'v1', 'Problem',
  'How clearly defined is the problem your venture solves?',
  'number', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1,
  0, 100, 1.0, 'higher_is_better', 'active', CURRENT_TIMESTAMP, NULL
);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0002', 'day3_evidence_versioning_v1', 'qa',
   'gv1-0002-day3-evidence-versioning', CURRENT_TIMESTAMP);
