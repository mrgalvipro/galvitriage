-- GalviVault P0 Day 1 canonical Business Medical Record foundation.
-- QA additive baseline. No destructive statements.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  migration_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT,
  applied_at TEXT NOT NULL,
  applied_by TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('local','qa','production'))
);

CREATE TABLE IF NOT EXISTS founders (
  founder_id TEXT PRIMARY KEY,
  normalized_email TEXT UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  linkedin_url TEXT,
  consent_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (consent_status IN ('unknown','requested','approved','declined','withdrawn')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','archived')),
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS ventures (
  venture_id TEXT PRIMARY KEY,
  venture_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  stage TEXT,
  revenue_range TEXT,
  profile_json TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','archived')),
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS founder_venture_roles (
  founder_id TEXT NOT NULL,
  venture_id TEXT NOT NULL,
  role_code TEXT NOT NULL DEFAULT 'founder',
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','inactive','archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (founder_id, venture_id, role_code),
  FOREIGN KEY (founder_id) REFERENCES founders(founder_id) ON DELETE RESTRICT,
  FOREIGN KEY (venture_id) REFERENCES ventures(venture_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS business_medical_records (
  bmr_id TEXT PRIMARY KEY,
  venture_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created','active','assessment_in_progress','under_review','treatment_active','monitoring','closed','archived')),
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  current_session_id TEXT,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (venture_id) REFERENCES ventures(venture_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS assessment_sessions (
  session_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  venture_id TEXT NOT NULL,
  founder_id TEXT,
  client_session_key TEXT UNIQUE,
  source TEXT NOT NULL,
  current_stage TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','abandoned','expired','archived')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT,
  FOREIGN KEY (venture_id) REFERENCES ventures(venture_id) ON DELETE RESTRICT,
  FOREIGN KEY (founder_id) REFERENCES founders(founder_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS question_definitions (
  question_id TEXT NOT NULL,
  question_version TEXT NOT NULL,
  product TEXT NOT NULL,
  dimension TEXT,
  prompt TEXT NOT NULL,
  response_type TEXT NOT NULL,
  required_flag INTEGER NOT NULL DEFAULT 0 CHECK (required_flag IN (0,1)),
  minimum_value REAL,
  maximum_value REAL,
  weight REAL,
  score_direction TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','retired')),
  effective_at TEXT,
  retired_at TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (question_id, question_version)
);

CREATE TABLE IF NOT EXISTS assessment_answers (
  answer_id TEXT PRIMARY KEY,
  answer_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_answer_id TEXT,
  bmr_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_version TEXT NOT NULL,
  raw_value_text TEXT,
  raw_value_number REAL,
  normalized_value_text TEXT,
  normalized_value_number REAL,
  confidence_effect REAL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('draft','accepted','superseded','rejected')),
  captured_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (answer_group_id, version_no),
  UNIQUE (session_id, question_id, version_no),
  FOREIGN KEY (supersedes_answer_id) REFERENCES assessment_answers(answer_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT,
  FOREIGN KEY (session_id) REFERENCES assessment_sessions(session_id) ON DELETE RESTRICT,
  FOREIGN KEY (question_id, question_version) REFERENCES question_definitions(question_id, question_version) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS evidence_items (
  evidence_id TEXT PRIMARY KEY,
  evidence_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_evidence_id TEXT,
  bmr_id TEXT NOT NULL,
  session_id TEXT,
  source_type TEXT NOT NULL,
  source_ref TEXT,
  value_type TEXT NOT NULL CHECK (value_type IN ('text','number','boolean','date','json','reference','file_reference')),
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER CHECK (value_boolean IN (0,1)),
  value_date TEXT,
  value_json TEXT,
  source_actor_type TEXT,
  source_actor_id TEXT,
  consent_status TEXT,
  content_hash TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','accepted','superseded','rejected','archived')),
  captured_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (evidence_group_id, version_no),
  FOREIGN KEY (supersedes_evidence_id) REFERENCES evidence_items(evidence_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT,
  FOREIGN KEY (session_id) REFERENCES assessment_sessions(session_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS evidence_relationships (
  relationship_id TEXT PRIMARY KEY,
  from_evidence_id TEXT NOT NULL,
  to_evidence_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('corrects','duplicates','contradicts','contextualizes','derived_from')),
  rationale TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (from_evidence_id, to_evidence_id, relationship_type),
  FOREIGN KEY (from_evidence_id) REFERENCES evidence_items(evidence_id) ON DELETE RESTRICT,
  FOREIGN KEY (to_evidence_id) REFERENCES evidence_items(evidence_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS observations (
  observation_id TEXT PRIMARY KEY,
  observation_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_observation_id TEXT,
  bmr_id TEXT NOT NULL,
  statement TEXT NOT NULL,
  domain TEXT,
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)),
  source_type TEXT NOT NULL,
  source_version TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','superseded','rejected','archived')),
  created_by_type TEXT NOT NULL,
  created_by_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (observation_group_id, version_no),
  FOREIGN KEY (supersedes_observation_id) REFERENCES observations(observation_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS observation_evidence (
  observation_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  support_type TEXT NOT NULL DEFAULT 'supports' CHECK (support_type IN ('supports','contradicts','contextualizes')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (observation_id, evidence_id, support_type),
  FOREIGN KEY (observation_id) REFERENCES observations(observation_id) ON DELETE RESTRICT,
  FOREIGN KEY (evidence_id) REFERENCES evidence_items(evidence_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS hypotheses (
  hypothesis_id TEXT PRIMARY KEY,
  hypothesis_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_hypothesis_id TEXT,
  bmr_id TEXT NOT NULL,
  statement TEXT NOT NULL,
  domain TEXT,
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)),
  uncertainty TEXT,
  source_type TEXT NOT NULL,
  source_version TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','superseded','rejected','archived')),
  created_by_type TEXT NOT NULL,
  created_by_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (hypothesis_group_id, version_no),
  FOREIGN KEY (supersedes_hypothesis_id) REFERENCES hypotheses(hypothesis_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS hypothesis_observations (
  hypothesis_id TEXT NOT NULL,
  observation_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('supports','contradicts','contextualizes')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (hypothesis_id, observation_id, relationship_type),
  FOREIGN KEY (hypothesis_id) REFERENCES hypotheses(hypothesis_id) ON DELETE RESTRICT,
  FOREIGN KEY (observation_id) REFERENCES observations(observation_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS findings (
  finding_id TEXT PRIMARY KEY,
  finding_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_finding_id TEXT,
  bmr_id TEXT NOT NULL,
  finding_code TEXT NOT NULL,
  domain TEXT,
  headline TEXT,
  statement TEXT NOT NULL,
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100)),
  confidence_band TEXT CHECK (confidence_band IS NULL OR confidence_band IN ('low','medium','high','very_high')),
  confirmation_status TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (confirmation_status IN ('unconfirmed','confirmed','rejected','needs_review')),
  source_type TEXT NOT NULL,
  source_version TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','superseded','rejected','archived')),
  created_by_type TEXT NOT NULL,
  created_by_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (finding_group_id, version_no),
  FOREIGN KEY (supersedes_finding_id) REFERENCES findings(finding_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS finding_evidence (
  finding_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  support_type TEXT NOT NULL DEFAULT 'supports' CHECK (support_type IN ('supports','contradicts','contextualizes')),
  weight REAL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (finding_id, evidence_id, support_type),
  FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE RESTRICT,
  FOREIGN KEY (evidence_id) REFERENCES evidence_items(evidence_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS finding_observations (
  finding_id TEXT NOT NULL,
  observation_id TEXT NOT NULL,
  support_type TEXT NOT NULL DEFAULT 'supports' CHECK (support_type IN ('supports','contradicts','contextualizes')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (finding_id, observation_id, support_type),
  FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE RESTRICT,
  FOREIGN KEY (observation_id) REFERENCES observations(observation_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS finding_hypotheses (
  finding_id TEXT NOT NULL,
  hypothesis_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'derived_from' CHECK (relationship_type IN ('derived_from','supports','rejects')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (finding_id, hypothesis_id, relationship_type),
  FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE RESTRICT,
  FOREIGN KEY (hypothesis_id) REFERENCES hypotheses(hypothesis_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS recommendations (
  recommendation_id TEXT PRIMARY KEY,
  recommendation_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_recommendation_id TEXT,
  bmr_id TEXT NOT NULL,
  recommendation_code TEXT NOT NULL,
  title TEXT NOT NULL,
  action_text TEXT NOT NULL,
  rationale TEXT,
  priority INTEGER,
  source_type TEXT NOT NULL,
  source_version TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','declined','superseded','completed','archived')),
  created_by_type TEXT NOT NULL,
  created_by_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (recommendation_group_id, version_no),
  FOREIGN KEY (supersedes_recommendation_id) REFERENCES recommendations(recommendation_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS recommendation_findings (
  recommendation_id TEXT NOT NULL,
  finding_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'addresses' CHECK (relationship_type IN ('addresses','mitigates','monitors')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (recommendation_id, finding_id, relationship_type),
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id) ON DELETE RESTRICT,
  FOREIGN KEY (finding_id) REFERENCES findings(finding_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS treatment_plans (
  treatment_plan_id TEXT PRIMARY KEY,
  treatment_plan_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  supersedes_treatment_plan_id TEXT,
  bmr_id TEXT NOT NULL,
  treatment_code TEXT NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  owner_actor_type TEXT,
  owner_actor_id TEXT,
  start_date TEXT,
  target_end_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','active','paused','completed','cancelled','superseded','archived')),
  created_by_type TEXT NOT NULL,
  created_by_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (treatment_plan_group_id, version_no),
  FOREIGN KEY (supersedes_treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS treatment_plan_items (
  treatment_plan_item_id TEXT PRIMARY KEY,
  treatment_plan_id TEXT NOT NULL,
  sequence_no INTEGER NOT NULL,
  action_code TEXT,
  description TEXT NOT NULL,
  owner_actor_type TEXT,
  owner_actor_id TEXT,
  target_date TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','blocked','completed','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (treatment_plan_id, sequence_no),
  FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS treatment_events (
  treatment_event_id TEXT PRIMARY KEY,
  treatment_plan_id TEXT NOT NULL,
  bmr_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  notes TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS outcomes (
  outcome_id TEXT PRIMARY KEY,
  outcome_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  supersedes_outcome_id TEXT,
  bmr_id TEXT NOT NULL,
  treatment_plan_id TEXT,
  recommendation_id TEXT,
  outcome_code TEXT NOT NULL,
  outcome_type TEXT NOT NULL,
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER CHECK (value_boolean IN (0,1)),
  observed_at TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_ref TEXT,
  status TEXT NOT NULL DEFAULT 'observed' CHECK (status IN ('observed','confirmed','rejected','superseded','archived')),
  created_by_type TEXT NOT NULL,
  created_by_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (outcome_group_id, version_no),
  FOREIGN KEY (supersedes_outcome_id) REFERENCES outcomes(outcome_id) ON DELETE RESTRICT,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT,
  FOREIGN KEY (treatment_plan_id) REFERENCES treatment_plans(treatment_plan_id) ON DELETE SET NULL,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS outcome_evidence (
  outcome_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'supports' CHECK (relationship_type IN ('supports','contradicts','documents')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (outcome_id, evidence_id, relationship_type),
  FOREIGN KEY (outcome_id) REFERENCES outcomes(outcome_id) ON DELETE RESTRICT,
  FOREIGN KEY (evidence_id) REFERENCES evidence_items(evidence_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('confirm','reject','correct','clarify','comment')),
  disposition TEXT,
  comment_text TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS learning_candidates (
  learning_candidate_id TEXT PRIMARY KEY,
  candidate_type TEXT NOT NULL,
  title TEXT NOT NULL,
  proposed_change_json TEXT NOT NULL,
  source_bmr_ids_json TEXT,
  rationale TEXT NOT NULL,
  risk_summary TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','under_review','approved','rejected','released','archived')),
  proposed_by_type TEXT NOT NULL,
  proposed_by_id TEXT,
  reviewed_by_type TEXT,
  reviewed_by_id TEXT,
  reviewed_at TEXT,
  release_version TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_items (
  knowledge_item_id TEXT PRIMARY KEY,
  knowledge_code TEXT NOT NULL,
  knowledge_type TEXT NOT NULL,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  content_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','active','retired','archived')),
  approved_by TEXT,
  approved_at TEXT,
  effective_at TEXT,
  retired_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (knowledge_code, version_no)
);

CREATE TABLE IF NOT EXISTS journey_events (
  journey_event_id TEXT PRIMARY KEY,
  event_key TEXT UNIQUE,
  bmr_id TEXT,
  session_id TEXT,
  event_name TEXT NOT NULL,
  product TEXT,
  current_stage TEXT,
  occurred_at TEXT NOT NULL,
  actor_type TEXT,
  actor_id TEXT,
  metadata_json TEXT,
  correlation_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('local','qa','production')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES business_medical_records(bmr_id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES assessment_sessions(session_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  prior_version INTEGER,
  new_version INTEGER,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  source TEXT NOT NULL,
  reason_code TEXT,
  safe_change_json TEXT,
  correlation_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('local','qa','production')),
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  idempotency_id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_entity_type TEXT,
  response_entity_id TEXT,
  response_json TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  UNIQUE (scope, idempotency_key)
);

CREATE TABLE IF NOT EXISTS adapter_deliveries (
  adapter_delivery_id TEXT PRIMARY KEY,
  adapter_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  source_event_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','attempting','delivered','failed','dead_letter','cancelled')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at TEXT,
  external_id TEXT,
  safe_error_code TEXT,
  safe_error_message TEXT,
  correlation_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (adapter_name, source_event_id)
);

CREATE TABLE IF NOT EXISTS import_batches (
  import_batch_id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_checksum TEXT,
  environment TEXT NOT NULL CHECK (environment IN ('local','qa','production')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','validating','importing','completed','completed_with_errors','failed','cancelled')),
  expected_count INTEGER,
  processed_count INTEGER NOT NULL DEFAULT 0,
  imported_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS import_errors (
  import_error_id TEXT PRIMARY KEY,
  import_batch_id TEXT NOT NULL,
  source_row_key TEXT,
  field_name TEXT,
  error_code TEXT NOT NULL,
  safe_message TEXT NOT NULL,
  quarantined_payload_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (import_batch_id) REFERENCES import_batches(import_batch_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS application_errors (
  application_error_id TEXT PRIMARY KEY,
  correlation_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('local','qa','production')),
  route TEXT,
  action TEXT,
  error_code TEXT NOT NULL,
  safe_message TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  retryable INTEGER NOT NULL DEFAULT 0 CHECK (retryable IN (0,1)),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_founders_status ON founders(status);
CREATE INDEX IF NOT EXISTS idx_ventures_status_stage ON ventures(status, stage);
CREATE INDEX IF NOT EXISTS idx_roles_venture ON founder_venture_roles(venture_id, status);
CREATE INDEX IF NOT EXISTS idx_bmr_status ON business_medical_records(status);
CREATE INDEX IF NOT EXISTS idx_sessions_bmr ON assessment_sessions(bmr_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_venture ON assessment_sessions(venture_id, created_at);
CREATE INDEX IF NOT EXISTS idx_answers_session_question ON assessment_answers(session_id, question_id, version_no);
CREATE INDEX IF NOT EXISTS idx_evidence_bmr_current ON evidence_items(bmr_id, evidence_group_id, version_no);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON evidence_items(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_observations_bmr ON observations(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_hypotheses_bmr ON hypotheses(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_findings_bmr ON findings(bmr_id, status, confirmation_status, created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_bmr ON recommendations(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_bmr ON treatment_plans(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_treatment_events_plan ON treatment_events(treatment_plan_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_outcomes_bmr ON outcomes(bmr_id, observed_at);
CREATE INDEX IF NOT EXISTS idx_feedback_target ON feedback(target_type, target_id, created_at);
CREATE INDEX IF NOT EXISTS idx_journey_session ON journey_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_journey_bmr ON journey_events(bmr_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_log(correlation_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_adapter_status ON adapter_deliveries(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_import_errors_batch ON import_errors(import_batch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_application_errors_correlation ON application_errors(correlation_id, created_at);

CREATE TRIGGER IF NOT EXISTS trg_schema_migrations_no_update
BEFORE UPDATE ON schema_migrations BEGIN
  SELECT RAISE(ABORT, 'schema_migrations is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_schema_migrations_no_delete
BEFORE DELETE ON schema_migrations BEGIN
  SELECT RAISE(ABORT, 'schema_migrations is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_audit_log_no_update
BEFORE UPDATE ON audit_log BEGIN
  SELECT RAISE(ABORT, 'audit_log is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_audit_log_no_delete
BEFORE DELETE ON audit_log BEGIN
  SELECT RAISE(ABORT, 'audit_log is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_journey_events_no_update
BEFORE UPDATE ON journey_events BEGIN
  SELECT RAISE(ABORT, 'journey_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_journey_events_no_delete
BEFORE DELETE ON journey_events BEGIN
  SELECT RAISE(ABORT, 'journey_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_treatment_events_no_update
BEFORE UPDATE ON treatment_events BEGIN
  SELECT RAISE(ABORT, 'treatment_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_treatment_events_no_delete
BEFORE DELETE ON treatment_events BEGIN
  SELECT RAISE(ABORT, 'treatment_events is append-only');
END;
CREATE TRIGGER IF NOT EXISTS trg_accepted_evidence_no_content_update
BEFORE UPDATE ON evidence_items
WHEN OLD.status = 'accepted' BEGIN
  SELECT RAISE(ABORT, 'accepted evidence is immutable; create a new version');
END;

INSERT OR IGNORE INTO schema_migrations
  (migration_id, name, checksum, applied_at, applied_by, environment)
VALUES
  ('0001', 'canonical_business_medical_record', NULL,
   strftime('%Y-%m-%dT%H:%M:%fZ','now'), 'wrangler', 'qa');
