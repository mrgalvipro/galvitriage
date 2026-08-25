PRAGMA foreign_keys = ON;

-- GalviCare 1.0 Day 1 Human-E2E continuity patch.
-- The inherited gv1_assessment_sessions table is intentionally BMR/venture scoped
-- and therefore cannot represent a legitimate Pre-Founder. Keep that canonical
-- table unchanged for real ventures and add only the missing principal-only session
-- contract required to create/resume a person before a venture exists.

CREATE TABLE IF NOT EXISTS gv1_principal_sessions (
  session_id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL,
  founder_id TEXT NOT NULL,
  client_session_key TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'galvicare_1_0',
  current_stage TEXT NOT NULL DEFAULT 'GalviTriage',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned','cancelled')),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_session_key),
  FOREIGN KEY (context_id) REFERENCES gv1_principal_contexts(context_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id)
);

CREATE INDEX IF NOT EXISTS ix_gv1_principal_sessions_founder
  ON gv1_principal_sessions(founder_id, updated_at);
CREATE INDEX IF NOT EXISTS ix_gv1_principal_sessions_context
  ON gv1_principal_sessions(context_id, updated_at);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0101', 'galvicare_1_0_day1_principal_session_continuity', 'qa',
   'gc10-day1-principal-session-v1', CURRENT_TIMESTAMP);
