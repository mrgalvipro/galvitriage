PRAGMA foreign_keys = ON;

-- GalviVault P0 Day 5 additive governed-care migration.
-- Runs after 0001 foundation, 0002 identity continuity, 0003 evidence versioning,
-- and 0004 governed reasoning. Prior migrations are never rewritten.

ALTER TABLE gv1_recommendations ADD COLUMN recommendation_group_id TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_recommendations ADD COLUMN supersedes_recommendation_id TEXT REFERENCES gv1_recommendations(recommendation_id);
ALTER TABLE gv1_recommendations ADD COLUMN recommendation_code TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN rationale TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN source_type TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN source_version TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN created_by_type TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN created_by_id TEXT;
ALTER TABLE gv1_recommendations ADD COLUMN correlation_id TEXT;
ALTER TABLE gv1_recommendation_findings ADD COLUMN relationship_type TEXT NOT NULL DEFAULT 'addresses';
ALTER TABLE gv1_recommendation_findings ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_treatment_plans ADD COLUMN treatment_plan_group_id TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_treatment_plans ADD COLUMN supersedes_treatment_plan_id TEXT REFERENCES gv1_treatment_plans(treatment_plan_id);
ALTER TABLE gv1_treatment_plans ADD COLUMN treatment_code TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN objective TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN owner_actor_type TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN owner_actor_id TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN target_outcomes_json TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN created_by_type TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN created_by_id TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_treatment_plan_items ADD COLUMN action_code TEXT;
ALTER TABLE gv1_treatment_plan_items ADD COLUMN description TEXT;
ALTER TABLE gv1_treatment_plan_items ADD COLUMN owner_actor_type TEXT;
ALTER TABLE gv1_treatment_plan_items ADD COLUMN owner_actor_id TEXT;
ALTER TABLE gv1_treatment_plan_items ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_treatment_events ADD COLUMN treatment_plan_id TEXT REFERENCES gv1_treatment_plans(treatment_plan_id);
ALTER TABLE gv1_treatment_events ADD COLUMN bmr_id TEXT REFERENCES gv1_business_medical_records(bmr_id);
ALTER TABLE gv1_treatment_events ADD COLUMN actor_type TEXT;
ALTER TABLE gv1_treatment_events ADD COLUMN actor_id TEXT;
ALTER TABLE gv1_treatment_events ADD COLUMN notes TEXT;
ALTER TABLE gv1_treatment_events ADD COLUMN metadata_json TEXT;
ALTER TABLE gv1_treatment_events ADD COLUMN correlation_id TEXT;

CREATE TABLE IF NOT EXISTS gv1_treatment_plan_recommendations (
  treatment_plan_id TEXT NOT NULL,
  recommendation_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  correlation_id TEXT,
  PRIMARY KEY (treatment_plan_id, recommendation_id),
  FOREIGN KEY (treatment_plan_id) REFERENCES gv1_treatment_plans(treatment_plan_id),
  FOREIGN KEY (recommendation_id) REFERENCES gv1_recommendations(recommendation_id)
);

CREATE TABLE IF NOT EXISTS gv1_treatment_plan_findings (
  treatment_plan_id TEXT NOT NULL,
  finding_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  correlation_id TEXT,
  PRIMARY KEY (treatment_plan_id, finding_id),
  FOREIGN KEY (treatment_plan_id) REFERENCES gv1_treatment_plans(treatment_plan_id),
  FOREIGN KEY (finding_id) REFERENCES gv1_findings(finding_id)
);

ALTER TABLE gv1_outcomes ADD COLUMN outcome_group_id TEXT;
ALTER TABLE gv1_outcomes ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_outcomes ADD COLUMN supersedes_outcome_id TEXT REFERENCES gv1_outcomes(outcome_id);
ALTER TABLE gv1_outcomes ADD COLUMN recommendation_id TEXT REFERENCES gv1_recommendations(recommendation_id);
ALTER TABLE gv1_outcomes ADD COLUMN outcome_code TEXT;
ALTER TABLE gv1_outcomes ADD COLUMN source_type TEXT;
ALTER TABLE gv1_outcomes ADD COLUMN source_ref TEXT;
ALTER TABLE gv1_outcomes ADD COLUMN status TEXT NOT NULL DEFAULT 'observed';
ALTER TABLE gv1_outcomes ADD COLUMN created_by_type TEXT;
ALTER TABLE gv1_outcomes ADD COLUMN created_by_id TEXT;
ALTER TABLE gv1_outcomes ADD COLUMN correlation_id TEXT;
ALTER TABLE gv1_outcome_evidence ADD COLUMN relationship_type TEXT NOT NULL DEFAULT 'supports';
ALTER TABLE gv1_outcome_evidence ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_feedback ADD COLUMN target_type TEXT;
ALTER TABLE gv1_feedback ADD COLUMN target_id TEXT;
ALTER TABLE gv1_feedback ADD COLUMN disposition TEXT;
ALTER TABLE gv1_feedback ADD COLUMN actor_type TEXT;
ALTER TABLE gv1_feedback ADD COLUMN actor_id TEXT;
ALTER TABLE gv1_feedback ADD COLUMN source TEXT;
ALTER TABLE gv1_feedback ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_learning_candidates ADD COLUMN title TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN rationale TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN risk_summary TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN proposed_by_type TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN proposed_by_id TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN reviewed_by_type TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN reviewed_by_id TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN reviewed_at TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN release_version TEXT;
ALTER TABLE gv1_learning_candidates ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_adapter_deliveries ADD COLUMN event_type TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN entity_type TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN entity_id TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN source_event_id TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN next_attempt_at TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN safe_error_code TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN safe_error_message TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN correlation_id TEXT;
ALTER TABLE gv1_adapter_deliveries ADD COLUMN updated_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_recommendation_group_version
  ON gv1_recommendations(recommendation_group_id, version_no)
  WHERE recommendation_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recommendations_bmr
  ON gv1_recommendations(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_recommendation_supersedes
  ON gv1_recommendations(supersedes_recommendation_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_treatment_plan_group_version
  ON gv1_treatment_plans(treatment_plan_group_id, version_no)
  WHERE treatment_plan_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatment_plans_bmr
  ON gv1_treatment_plans(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_treatment_plan_supersedes
  ON gv1_treatment_plans(supersedes_treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_treatment_events_plan
  ON gv1_treatment_events(treatment_plan_id, occurred_at);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_outcome_group_version
  ON gv1_outcomes(outcome_group_id, version_no)
  WHERE outcome_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_outcomes_bmr
  ON gv1_outcomes(bmr_id, measured_at);
CREATE INDEX IF NOT EXISTS ix_gv1_outcome_supersedes
  ON gv1_outcomes(supersedes_outcome_id);
CREATE INDEX IF NOT EXISTS idx_feedback_target
  ON gv1_feedback(target_type, target_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_adapter_source_event
  ON gv1_adapter_deliveries(adapter_name, source_event_id)
  WHERE source_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_adapter_status
  ON gv1_adapter_deliveries(status, next_attempt_at);

CREATE TRIGGER IF NOT EXISTS trg_gv1_treatment_events_no_update
BEFORE UPDATE ON gv1_treatment_events
BEGIN
  SELECT RAISE(ABORT, 'GV_APPEND_ONLY');
END;

CREATE TRIGGER IF NOT EXISTS trg_gv1_treatment_events_no_delete
BEFORE DELETE ON gv1_treatment_events
BEGIN
  SELECT RAISE(ABORT, 'GV_APPEND_ONLY');
END;

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0005', 'day5_governed_care_v1', 'qa',
   'gv1-0005-day5-governed-care', CURRENT_TIMESTAMP);
