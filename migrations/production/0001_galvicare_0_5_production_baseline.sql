-- GalviCare 0.5 Production baseline schema
-- Purpose: initialize an EMPTY galvivault-0-5-production database.
-- Source: approved Day 7A QA schema snapshot plus additive Day 2/3/4 schema changes.
-- This file is schema-only except for release_metadata rows. It MUST NOT copy QA customer/test data.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  current_stage TEXT NOT NULL DEFAULT 'Welcome',
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS founders (
  founder_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  consent_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS ventures (
  venture_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  founder_id TEXT,
  venture_name TEXT,
  organization_type TEXT,
  stage TEXT,
  industry TEXT,
  revenue_range TEXT,
  primary_goal TEXT,
  primary_challenge TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (founder_id) REFERENCES founders(founder_id)
);

CREATE TABLE IF NOT EXISTS assessment_responses (
  response_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  question_id TEXT NOT NULL,
  dimension TEXT,
  answer_text TEXT,
  answer_number REAL,
  answer_json TEXT,
  rules_version TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product, question_id)
);

CREATE TABLE IF NOT EXISTS product_results (
  result_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  confidence REAL,
  confidence_band TEXT,
  result_json TEXT NOT NULL,
  generation_source TEXT NOT NULL DEFAULT 'rules',
  rules_version TEXT,
  content_version TEXT,
  evidence_trace_json TEXT,
  pathway_code TEXT,
  review_state TEXT,
  generated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product)
);

CREATE TABLE IF NOT EXISTS payments (
  payment_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS entitlements (
  entitlement_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  entitlement_status TEXT NOT NULL DEFAULT 'locked',
  source TEXT,
  source_reference TEXT,
  granted_at TEXT,
  expires_at TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product)
);

CREATE TABLE IF NOT EXISTS journey_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT,
  event_name TEXT NOT NULL,
  product TEXT,
  current_stage TEXT,
  event_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clinical_evidence (
  evidence_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  founder_id TEXT,
  venture_id TEXT,
  product TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_reference TEXT,
  question_id TEXT,
  question_version TEXT,
  raw_text TEXT,
  normalized_value TEXT,
  evidence_summary TEXT,
  consent_scope TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS clinical_feedback (
  feedback_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT,
  finding_code TEXT,
  recommendation_code TEXT,
  feedback_source TEXT NOT NULL,
  accuracy_rating INTEGER,
  relevance_rating INTEGER,
  confirmed INTEGER,
  feedback_text TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS clinical_findings (
  finding_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  finding_code TEXT NOT NULL,
  finding_text TEXT NOT NULL,
  evidence_ids_json TEXT NOT NULL,
  hypothesis_ids_json TEXT,
  severity TEXT,
  confidence REAL,
  confidence_band TEXT,
  status TEXT NOT NULL DEFAULT 'supported',
  rules_version TEXT NOT NULL,
  confirmed_by_customer INTEGER,
  confirmed_by_clinician INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product, finding_code)
);

CREATE TABLE IF NOT EXISTS clinical_followups (
  followup_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  product TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT,
  confidence_impact REAL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product, question_id)
);

CREATE TABLE IF NOT EXISTS clinical_hypotheses (
  hypothesis_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  hypothesis_code TEXT NOT NULL,
  hypothesis_text TEXT NOT NULL,
  supporting_observation_ids_json TEXT,
  alternative_hypotheses_json TEXT,
  contradiction_evidence_ids_json TEXT,
  confidence REAL,
  status TEXT NOT NULL DEFAULT 'candidate',
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS clinical_observations (
  observation_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  observation_code TEXT NOT NULL,
  observation_text TEXT NOT NULL,
  evidence_ids_json TEXT NOT NULL,
  confidence REAL,
  created_by TEXT NOT NULL DEFAULT 'rules',
  rules_version TEXT,
  status TEXT NOT NULL DEFAULT 'candidate',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS clinical_outcomes (
  outcome_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  treatment_code TEXT,
  recommendation_code TEXT,
  measurement_name TEXT NOT NULL,
  baseline_value TEXT,
  target_value TEXT,
  observed_value TEXT,
  measurement_date TEXT,
  outcome_status TEXT,
  clinician_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS fcd_notes (
  note_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  facilitator_name TEXT,
  discussion_summary TEXT,
  objections TEXT,
  clinical_observations TEXT,
  recommended_next_step TEXT,
  upsell_status TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS knowledge_items (
  knowledge_item_id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_code TEXT NOT NULL,
  internal_label TEXT,
  customer_label TEXT,
  content_json TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'draft',
  version TEXT NOT NULL,
  effective_from TEXT,
  effective_to TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(item_type, item_code, version)
);

CREATE TABLE IF NOT EXISTS learning_candidates (
  learning_candidate_id TEXT PRIMARY KEY,
  candidate_type TEXT NOT NULL,
  candidate_code TEXT,
  candidate_summary TEXT NOT NULL,
  supporting_case_count INTEGER NOT NULL DEFAULT 1,
  supporting_record_ids_json TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  reviewed_by TEXT,
  decision_notes TEXT,
  approved_rules_version TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendations (
  recommendation_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  recommendation_code TEXT NOT NULL,
  recommendation_text TEXT NOT NULL,
  finding_codes_json TEXT,
  priority INTEGER,
  status TEXT NOT NULL DEFAULT 'recommended',
  rules_version TEXT NOT NULL,
  customer_response TEXT,
  clinician_response TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product, recommendation_code)
);

CREATE TABLE IF NOT EXISTS release_metadata (
  metadata_key TEXT PRIMARY KEY,
  metadata_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_errors (
  error_id TEXT PRIMARY KEY,
  session_id TEXT,
  action TEXT,
  error_code TEXT,
  error_message TEXT,
  error_json TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS treatment_records (
  treatment_record_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  treatment_code TEXT NOT NULL,
  source_product TEXT,
  indication_codes_json TEXT,
  treatment_status TEXT NOT NULL DEFAULT 'recommended',
  outcome_target TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS galvishot_evidence_links (
  evidence_link_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL DEFAULT 'GalviShot',
  finding_code TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_field TEXT NOT NULL,
  display_value TEXT NOT NULL,
  used_for TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  UNIQUE(session_id, product, finding_code, source_field, rules_version)
);

CREATE TABLE IF NOT EXISTS day4_evidence_traces (
  trace_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product TEXT NOT NULL,
  source_product TEXT NOT NULL,
  source_code TEXT,
  source_field TEXT,
  trace_json TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_founders_email ON founders(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_founders_session ON founders(session_id);
CREATE INDEX IF NOT EXISTS idx_ventures_session ON ventures(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_session_product ON assessment_responses(session_id, product);
CREATE INDEX IF NOT EXISTS idx_results_session ON product_results(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_session_created ON journey_events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_evidence_session_product ON clinical_evidence(session_id, product);
CREATE INDEX IF NOT EXISTS idx_followups_session_product ON clinical_followups(session_id, product);
CREATE INDEX IF NOT EXISTS idx_hypotheses_session ON clinical_hypotheses(session_id);
CREATE INDEX IF NOT EXISTS idx_observations_session ON clinical_observations(session_id);

CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_product_results_session_product_rules ON product_results(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session_product_rules ON assessment_responses(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_journey_events_session_product_stage ON journey_events(session_id, product, current_stage);

CREATE INDEX IF NOT EXISTS idx_results_session_product_rules ON product_results(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_findings_session_product_rules ON clinical_findings(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_followups_session_product_question ON clinical_followups(session_id, product, question_id);
CREATE INDEX IF NOT EXISTS idx_galvishot_evidence_links_session ON galvishot_evidence_links(session_id, product, finding_code);

CREATE INDEX IF NOT EXISTS idx_product_results_day4_session_product_rules ON product_results(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_product_results_day4_pathway ON product_results(product, pathway_code, rules_version);
CREATE INDEX IF NOT EXISTS idx_day4_evidence_traces_session_product ON day4_evidence_traces(session_id, product, rules_version);

INSERT OR REPLACE INTO release_metadata(metadata_key, metadata_value, updated_at) VALUES
  ('environment', 'production', datetime('now')),
  ('release_commit', '5544ffeee7a165eb358bbeafc0755c755d6eb46c', datetime('now')),
  ('day2_question_contract', 'galvitriage_questions_v0_5_1', datetime('now')),
  ('day2_scoring_rules', 'galviengine_score_v0_5_1', datetime('now')),
  ('day2_generation_source', 'rules', datetime('now'));
