PRAGMA foreign_keys = ON;

-- Day 5 Treatment Plan contract: additive fields only.
ALTER TABLE gv1_treatment_plans ADD COLUMN clinical_priority TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN source_versions_json TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN target_metrics_json TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN milestones_json TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN monitoring_plan_json TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN escalation_triggers_json TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN follow_up_at TEXT;
ALTER TABLE gv1_treatment_plans ADD COLUMN brief_fingerprint TEXT;

CREATE INDEX IF NOT EXISTS idx_treatment_plans_bmr_group_version
  ON gv1_treatment_plans(bmr_id,treatment_plan_group_id,version_no);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0007', 'day5_treatment_contract_v1', 'qa',
   'gv1-0007-day5-treatment-contract', CURRENT_TIMESTAMP);
