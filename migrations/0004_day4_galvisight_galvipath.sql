-- Day 4 GalviSight + GalviPath additive fields and trace indexes.
-- Do not apply automatically; run through the normal Cloudflare D1 migration process in QA.

ALTER TABLE product_results ADD COLUMN evidence_trace_json TEXT;
ALTER TABLE product_results ADD COLUMN pathway_code TEXT;
ALTER TABLE product_results ADD COLUMN review_state TEXT;

CREATE INDEX IF NOT EXISTS idx_product_results_day4_session_product_rules
  ON product_results(session_id, product, rules_version);

CREATE INDEX IF NOT EXISTS idx_product_results_day4_pathway
  ON product_results(product, pathway_code, rules_version);

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

CREATE INDEX IF NOT EXISTS idx_day4_evidence_traces_session_product
  ON day4_evidence_traces(session_id, product, rules_version);
