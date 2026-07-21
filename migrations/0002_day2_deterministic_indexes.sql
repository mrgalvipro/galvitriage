-- GALVICARE 0.5 DAY 2 DETERMINISTIC QA ADDITIONS
-- Scope: additive-only indexes and release metadata for GalviTriage -> GalviVitals -> GalviScore.
-- Cloudflare D1 migration execution remains human-controlled.

CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_product_results_session_product_rules ON product_results(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session_product_rules ON assessment_responses(session_id, product, rules_version);
CREATE INDEX IF NOT EXISTS idx_journey_events_session_product_stage ON journey_events(session_id, product, current_stage);

INSERT OR REPLACE INTO release_metadata(metadata_key, metadata_value, updated_at)
VALUES
  ('day2_question_contract', 'galvitriage_questions_v0_5_1', datetime('now')),
  ('day2_scoring_rules', 'galviengine_score_v0_5_1', datetime('now')),
  ('day2_generation_source', 'rules', datetime('now'));
