PRAGMA foreign_keys = ON;

-- GalviVault P0 Day 4 additive governed reasoning migration.
-- Runs after 0001 foundation, 0002 identity continuity, and 0003 evidence versioning.
-- Prior migrations are never rewritten.

ALTER TABLE gv1_observations ADD COLUMN observation_group_id TEXT;
ALTER TABLE gv1_observations ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_observations ADD COLUMN supersedes_observation_id TEXT REFERENCES gv1_observations(observation_id);
ALTER TABLE gv1_observations ADD COLUMN domain TEXT;
ALTER TABLE gv1_observations ADD COLUMN confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100));
ALTER TABLE gv1_observations ADD COLUMN source_type TEXT;
ALTER TABLE gv1_observations ADD COLUMN source_version TEXT;
ALTER TABLE gv1_observations ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','superseded','rejected','archived'));
ALTER TABLE gv1_observations ADD COLUMN created_by_type TEXT;
ALTER TABLE gv1_observations ADD COLUMN created_by_id TEXT;
ALTER TABLE gv1_observations ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_observation_evidence ADD COLUMN support_type TEXT NOT NULL DEFAULT 'supports' CHECK (support_type IN ('supports','contradicts','contextualizes'));
ALTER TABLE gv1_observation_evidence ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_hypotheses ADD COLUMN hypothesis_group_id TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_hypotheses ADD COLUMN supersedes_hypothesis_id TEXT REFERENCES gv1_hypotheses(hypothesis_id);
ALTER TABLE gv1_hypotheses ADD COLUMN domain TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN uncertainty TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN source_type TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN source_version TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN created_by_type TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN created_by_id TEXT;
ALTER TABLE gv1_hypotheses ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_hypothesis_observations ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_findings ADD COLUMN finding_group_id TEXT;
ALTER TABLE gv1_findings ADD COLUMN version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1);
ALTER TABLE gv1_findings ADD COLUMN supersedes_finding_id TEXT REFERENCES gv1_findings(finding_id);
ALTER TABLE gv1_findings ADD COLUMN finding_code TEXT;
ALTER TABLE gv1_findings ADD COLUMN domain TEXT;
ALTER TABLE gv1_findings ADD COLUMN confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100));
ALTER TABLE gv1_findings ADD COLUMN confidence_band TEXT CHECK (confidence_band IS NULL OR confidence_band IN ('low','medium','high','very_high'));
ALTER TABLE gv1_findings ADD COLUMN confirmation_status TEXT NOT NULL DEFAULT 'unconfirmed' CHECK (confirmation_status IN ('unconfirmed','confirmed','rejected','needs_review'));
ALTER TABLE gv1_findings ADD COLUMN governance_version INTEGER NOT NULL DEFAULT 1 CHECK (governance_version >= 1);
ALTER TABLE gv1_findings ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','superseded','rejected','archived'));
ALTER TABLE gv1_findings ADD COLUMN source_type TEXT;
ALTER TABLE gv1_findings ADD COLUMN source_version TEXT;
ALTER TABLE gv1_findings ADD COLUMN created_by_type TEXT;
ALTER TABLE gv1_findings ADD COLUMN created_by_id TEXT;
ALTER TABLE gv1_findings ADD COLUMN confirmation_reason TEXT;
ALTER TABLE gv1_findings ADD COLUMN confirmed_by_type TEXT;
ALTER TABLE gv1_findings ADD COLUMN confirmed_by_id TEXT;
ALTER TABLE gv1_findings ADD COLUMN confirmed_at TEXT;
ALTER TABLE gv1_findings ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_finding_evidence ADD COLUMN support_type TEXT NOT NULL DEFAULT 'supports' CHECK (support_type IN ('supports','contradicts','contextualizes'));
ALTER TABLE gv1_finding_evidence ADD COLUMN weight REAL;
ALTER TABLE gv1_finding_evidence ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_finding_observations ADD COLUMN support_type TEXT NOT NULL DEFAULT 'supports' CHECK (support_type IN ('supports','contradicts','contextualizes'));
ALTER TABLE gv1_finding_observations ADD COLUMN correlation_id TEXT;

ALTER TABLE gv1_finding_hypotheses ADD COLUMN relationship_type TEXT NOT NULL DEFAULT 'derived_from' CHECK (relationship_type IN ('derived_from','supports','rejects'));
ALTER TABLE gv1_finding_hypotheses ADD COLUMN correlation_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_observation_group_version
  ON gv1_observations(observation_group_id, version_no)
  WHERE observation_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_observations_bmr
  ON gv1_observations(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_observation_supersedes
  ON gv1_observations(supersedes_observation_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_hypothesis_group_version
  ON gv1_hypotheses(hypothesis_group_id, version_no)
  WHERE hypothesis_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hypotheses_bmr
  ON gv1_hypotheses(bmr_id, status, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_hypothesis_supersedes
  ON gv1_hypotheses(supersedes_hypothesis_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_finding_group_version
  ON gv1_findings(finding_group_id, version_no)
  WHERE finding_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_findings_bmr
  ON gv1_findings(bmr_id, status, confirmation_status, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_finding_supersedes
  ON gv1_findings(supersedes_finding_id);
CREATE INDEX IF NOT EXISTS ix_gv1_finding_evidence_support
  ON gv1_finding_evidence(evidence_id, support_type);
CREATE INDEX IF NOT EXISTS ix_gv1_finding_observation_support
  ON gv1_finding_observations(observation_id, support_type);
CREATE INDEX IF NOT EXISTS ix_gv1_finding_hypothesis_support
  ON gv1_finding_hypotheses(hypothesis_id, relationship_type);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0004', 'day4_governed_reasoning_v1', 'qa',
   'gv1-0004-day4-governed-reasoning', CURRENT_TIMESTAMP);
