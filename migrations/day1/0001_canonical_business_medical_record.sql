PRAGMA foreign_keys = ON;

-- GalviVault P0 Day 1 canonical Business Medical Record baseline.
-- All Day 1 tables are namespaced with gv1_ so this additive migration can be
-- applied safely to the existing GalviCare QA D1 database without colliding
-- with legacy tables that use similar business names but different columns.

CREATE TABLE IF NOT EXISTS gv1_schema_migrations (
  migration_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('qa','local','production')),
  checksum TEXT,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gv1_founders (
  founder_id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  consent_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'active',
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_founders_email
  ON gv1_founders(lower(email)) WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS gv1_ventures (
  venture_id TEXT PRIMARY KEY,
  venture_name TEXT NOT NULL,
  stage TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gv1_founder_venture_roles (
  founder_id TEXT NOT NULL,
  venture_id TEXT NOT NULL,
  role_code TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0,1)),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (founder_id, venture_id, role_code),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (venture_id) REFERENCES gv1_ventures(venture_id)
);

CREATE TABLE IF NOT EXISTS gv1_business_medical_records (
  bmr_id TEXT PRIMARY KEY,
  venture_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  current_session_id TEXT,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (venture_id) REFERENCES gv1_ventures(venture_id)
);
CREATE INDEX IF NOT EXISTS ix_gv1_bmr_venture
  ON gv1_business_medical_records(venture_id, updated_at);

CREATE TABLE IF NOT EXISTS gv1_assessment_sessions (
  session_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  venture_id TEXT NOT NULL,
  founder_id TEXT NOT NULL,
  client_session_key TEXT NOT NULL,
  source TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (venture_id) REFERENCES gv1_ventures(venture_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_sessions_client_key
  ON gv1_assessment_sessions(client_session_key);
CREATE INDEX IF NOT EXISTS ix_gv1_sessions_bmr
  ON gv1_assessment_sessions(bmr_id, updated_at);

CREATE TABLE IF NOT EXISTS gv1_question_definitions (
  question_id TEXT PRIMARY KEY,
  product TEXT NOT NULL,
  version TEXT NOT NULL,
  dimension TEXT,
  prompt TEXT NOT NULL,
  response_type TEXT NOT NULL,
  display_order INTEGER,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gv1_assessment_answers (
  answer_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer_text TEXT,
  answer_number REAL,
  answer_json TEXT,
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (session_id, question_id, evidence_version),
  FOREIGN KEY (session_id) REFERENCES gv1_assessment_sessions(session_id),
  FOREIGN KEY (question_id) REFERENCES gv1_question_definitions(question_id)
);

CREATE TABLE IF NOT EXISTS gv1_evidence_items (
  evidence_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  session_id TEXT,
  evidence_type TEXT NOT NULL,
  source_product TEXT,
  source_reference TEXT,
  content_json TEXT NOT NULL,
  confidence REAL,
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (session_id) REFERENCES gv1_assessment_sessions(session_id)
);

CREATE TABLE IF NOT EXISTS gv1_evidence_relationships (
  relationship_id TEXT PRIMARY KEY,
  from_evidence_id TEXT NOT NULL,
  to_evidence_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (from_evidence_id, to_evidence_id, relationship_type),
  FOREIGN KEY (from_evidence_id) REFERENCES gv1_evidence_items(evidence_id),
  FOREIGN KEY (to_evidence_id) REFERENCES gv1_evidence_items(evidence_id)
);

CREATE TABLE IF NOT EXISTS gv1_observations (
  observation_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  session_id TEXT,
  observation_type TEXT NOT NULL,
  dimension TEXT,
  statement TEXT NOT NULL,
  severity TEXT,
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (session_id) REFERENCES gv1_assessment_sessions(session_id)
);

CREATE TABLE IF NOT EXISTS gv1_observation_evidence (
  observation_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (observation_id, evidence_id),
  FOREIGN KEY (observation_id) REFERENCES gv1_observations(observation_id),
  FOREIGN KEY (evidence_id) REFERENCES gv1_evidence_items(evidence_id)
);

CREATE TABLE IF NOT EXISTS gv1_hypotheses (
  hypothesis_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  statement TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  confidence REAL,
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE TABLE IF NOT EXISTS gv1_hypothesis_observations (
  hypothesis_id TEXT NOT NULL,
  observation_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'supports',
  created_at TEXT NOT NULL,
  PRIMARY KEY (hypothesis_id, observation_id),
  FOREIGN KEY (hypothesis_id) REFERENCES gv1_hypotheses(hypothesis_id),
  FOREIGN KEY (observation_id) REFERENCES gv1_observations(observation_id)
);

CREATE TABLE IF NOT EXISTS gv1_findings (
  finding_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  product TEXT NOT NULL,
  finding_type TEXT NOT NULL,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  priority INTEGER,
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE TABLE IF NOT EXISTS gv1_finding_evidence (
  finding_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (finding_id, evidence_id),
  FOREIGN KEY (finding_id) REFERENCES gv1_findings(finding_id),
  FOREIGN KEY (evidence_id) REFERENCES gv1_evidence_items(evidence_id)
);

CREATE TABLE IF NOT EXISTS gv1_finding_observations (
  finding_id TEXT NOT NULL,
  observation_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (finding_id, observation_id),
  FOREIGN KEY (finding_id) REFERENCES gv1_findings(finding_id),
  FOREIGN KEY (observation_id) REFERENCES gv1_observations(observation_id)
);

CREATE TABLE IF NOT EXISTS gv1_finding_hypotheses (
  finding_id TEXT NOT NULL,
  hypothesis_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (finding_id, hypothesis_id),
  FOREIGN KEY (finding_id) REFERENCES gv1_findings(finding_id),
  FOREIGN KEY (hypothesis_id) REFERENCES gv1_hypotheses(hypothesis_id)
);

CREATE TABLE IF NOT EXISTS gv1_recommendations (
  recommendation_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  product TEXT NOT NULL,
  title TEXT NOT NULL,
  recommendation_text TEXT NOT NULL,
  priority INTEGER,
  status TEXT NOT NULL DEFAULT 'proposed',
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE TABLE IF NOT EXISTS gv1_recommendation_findings (
  recommendation_id TEXT NOT NULL,
  finding_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (recommendation_id, finding_id),
  FOREIGN KEY (recommendation_id) REFERENCES gv1_recommendations(recommendation_id),
  FOREIGN KEY (finding_id) REFERENCES gv1_findings(finding_id)
);

CREATE TABLE IF NOT EXISTS gv1_treatment_plans (
  treatment_plan_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date TEXT,
  target_end_date TEXT,
  evidence_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE TABLE IF NOT EXISTS gv1_treatment_plan_items (
  treatment_plan_item_id TEXT PRIMARY KEY,
  treatment_plan_id TEXT NOT NULL,
  recommendation_id TEXT,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  sequence_number INTEGER,
  due_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (treatment_plan_id) REFERENCES gv1_treatment_plans(treatment_plan_id),
  FOREIGN KEY (recommendation_id) REFERENCES gv1_recommendations(recommendation_id)
);

CREATE TABLE IF NOT EXISTS gv1_treatment_events (
  treatment_event_id TEXT PRIMARY KEY,
  treatment_plan_item_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_payload_json TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (treatment_plan_item_id) REFERENCES gv1_treatment_plan_items(treatment_plan_item_id)
);

CREATE TABLE IF NOT EXISTS gv1_outcomes (
  outcome_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  treatment_plan_id TEXT,
  outcome_type TEXT NOT NULL,
  outcome_value_json TEXT NOT NULL,
  measured_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (treatment_plan_id) REFERENCES gv1_treatment_plans(treatment_plan_id)
);

CREATE TABLE IF NOT EXISTS gv1_outcome_evidence (
  outcome_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (outcome_id, evidence_id),
  FOREIGN KEY (outcome_id) REFERENCES gv1_outcomes(outcome_id),
  FOREIGN KEY (evidence_id) REFERENCES gv1_evidence_items(evidence_id)
);

CREATE TABLE IF NOT EXISTS gv1_feedback (
  feedback_id TEXT PRIMARY KEY,
  bmr_id TEXT NOT NULL,
  session_id TEXT,
  feedback_type TEXT NOT NULL,
  feedback_text TEXT,
  rating REAL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (session_id) REFERENCES gv1_assessment_sessions(session_id)
);

CREATE TABLE IF NOT EXISTS gv1_learning_candidates (
  learning_candidate_id TEXT PRIMARY KEY,
  bmr_id TEXT,
  candidate_type TEXT NOT NULL,
  candidate_payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE TABLE IF NOT EXISTS gv1_knowledge_items (
  knowledge_item_id TEXT PRIMARY KEY,
  knowledge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gv1_journey_events (
  journey_event_id TEXT PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  bmr_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  product TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  metadata_json TEXT,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (session_id) REFERENCES gv1_assessment_sessions(session_id)
);
CREATE INDEX IF NOT EXISTS ix_gv1_journey_session
  ON gv1_journey_events(session_id, occurred_at);

CREATE TABLE IF NOT EXISTS gv1_audit_log (
  audit_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  prior_version INTEGER,
  new_version INTEGER,
  actor_type TEXT NOT NULL,
  source TEXT NOT NULL,
  reason_code TEXT,
  safe_change_json TEXT,
  correlation_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_gv1_audit_entity
  ON gv1_audit_log(entity_type, entity_id, occurred_at);

CREATE TABLE IF NOT EXISTS gv1_idempotency_keys (
  idempotency_id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_entity_type TEXT,
  response_entity_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (scope, idempotency_key)
);

CREATE TABLE IF NOT EXISTS gv1_adapter_deliveries (
  adapter_delivery_id TEXT PRIMARY KEY,
  bmr_id TEXT,
  adapter_name TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  status TEXT NOT NULL,
  request_reference TEXT,
  response_reference TEXT,
  attempted_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);

CREATE TABLE IF NOT EXISTS gv1_import_batches (
  import_batch_id TEXT PRIMARY KEY,
  source_system TEXT NOT NULL,
  source_reference TEXT,
  status TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gv1_import_errors (
  import_error_id TEXT PRIMARY KEY,
  import_batch_id TEXT NOT NULL,
  source_row_reference TEXT,
  error_code TEXT NOT NULL,
  safe_error_message TEXT NOT NULL,
  safe_error_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (import_batch_id) REFERENCES gv1_import_batches(import_batch_id)
);

CREATE TABLE IF NOT EXISTS gv1_application_errors (
  application_error_id TEXT PRIMARY KEY,
  correlation_id TEXT NOT NULL,
  service TEXT NOT NULL,
  error_code TEXT NOT NULL,
  safe_error_message TEXT NOT NULL,
  route TEXT,
  environment TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TRIGGER IF NOT EXISTS trg_gv1_journey_events_no_update
BEFORE UPDATE ON gv1_journey_events
BEGIN
  SELECT RAISE(ABORT, 'gv1_journey_events is append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_gv1_journey_events_no_delete
BEFORE DELETE ON gv1_journey_events
BEGIN
  SELECT RAISE(ABORT, 'gv1_journey_events is append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_gv1_audit_log_no_update
BEFORE UPDATE ON gv1_audit_log
BEGIN
  SELECT RAISE(ABORT, 'gv1_audit_log is append-only');
END;

CREATE TRIGGER IF NOT EXISTS trg_gv1_audit_log_no_delete
BEFORE DELETE ON gv1_audit_log
BEGIN
  SELECT RAISE(ABORT, 'gv1_audit_log is append-only');
END;

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0001', 'canonical_business_medical_record_v1', 'qa', 'gv1-0001-namespaced-additive', CURRENT_TIMESTAMP);
