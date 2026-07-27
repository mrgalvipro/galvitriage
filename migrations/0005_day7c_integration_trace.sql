-- GalviCare 0.5 Day 7C additive QA integration trace.
-- No existing tables or columns are modified.
CREATE TABLE IF NOT EXISTS integration_trace (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  integration TEXT NOT NULL,
  event_name TEXT NOT NULL,
  status TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'qa',
  external_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_integration_trace_session
  ON integration_trace(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_integration_trace_integration
  ON integration_trace(integration, created_at);
