-- GalviCare 0.5 Day 3 GalviShot QA-only additive migration draft.
-- Do not apply to production. Do not apply during Codex implementation without Product Owner approval.

CREATE INDEX IF NOT EXISTS idx_results_session_product_rules
  ON product_results(session_id, product, rules_version);

CREATE INDEX IF NOT EXISTS idx_findings_session_product_rules
  ON clinical_findings(session_id, product, rules_version);

CREATE INDEX IF NOT EXISTS idx_followups_session_product_question
  ON clinical_followups(session_id, product, question_id);

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

CREATE INDEX IF NOT EXISTS idx_galvishot_evidence_links_session
  ON galvishot_evidence_links(session_id, product, finding_code);
