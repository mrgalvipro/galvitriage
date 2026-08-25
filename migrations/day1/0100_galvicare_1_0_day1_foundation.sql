PRAGMA foreign_keys = ON;

-- GalviCare 1.0 Day 1 additive clinical/identity/consent foundation.
-- This migration intentionally does NOT alter or replace the canonical gv1_founders,
-- gv1_ventures, gv1_business_medical_records, or historical GalviVault migrations.
-- It only adds the missing principal-only, consent-ledger, and principal-evidence
-- capabilities required by the GalviCare 1.0 Day 1 contract.

CREATE TABLE IF NOT EXISTS gv1_principal_contexts (
  context_id TEXT PRIMARY KEY,
  founder_id TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL CHECK (lifecycle_state IN (
    'pre_founder','dreamer','founder','owner_operator','investor','steward'
  )),
  care_protocol TEXT NOT NULL DEFAULT 'founder_smb',
  payer_type TEXT NOT NULL DEFAULT 'self' CHECK (payer_type IN (
    'self','institution','sponsor','enterprise'
  )),
  record_mode TEXT NOT NULL CHECK (record_mode IN (
    'principal_only','principal_plus_venture'
  )),
  venture_id TEXT,
  bmr_id TEXT,
  source TEXT NOT NULL DEFAULT 'galvicare_1_0',
  status TEXT NOT NULL DEFAULT 'active',
  record_version INTEGER NOT NULL DEFAULT 1 CHECK (record_version >= 1),
  client_request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id),
  CHECK (
    (record_mode = 'principal_only' AND venture_id IS NULL AND bmr_id IS NULL)
    OR
    (record_mode = 'principal_plus_venture' AND venture_id IS NOT NULL AND bmr_id IS NOT NULL)
  ),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (venture_id) REFERENCES gv1_ventures(venture_id),
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);
CREATE INDEX IF NOT EXISTS ix_gv1_principal_contexts_founder
  ON gv1_principal_contexts(founder_id, created_at);
CREATE INDEX IF NOT EXISTS ix_gv1_principal_contexts_bmr
  ON gv1_principal_contexts(bmr_id, created_at);

CREATE TABLE IF NOT EXISTS gv1_consent_events (
  consent_id TEXT PRIMARY KEY,
  founder_id TEXT NOT NULL,
  bmr_id TEXT,
  purpose TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'granted','withdrawn','declined','superseded'
  )),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  effective_at TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  supersedes_consent_id TEXT,
  client_request_id TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'galvicare_1_0',
  metadata_json TEXT,
  UNIQUE (client_request_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id),
  FOREIGN KEY (supersedes_consent_id) REFERENCES gv1_consent_events(consent_id)
);
CREATE INDEX IF NOT EXISTS ix_gv1_consent_current
  ON gv1_consent_events(founder_id, purpose, recorded_at DESC, consent_id DESC);

-- Existing gv1_evidence_items remains canonical for venture/BMR-scoped evidence.
-- This table exists only because the historical gv1_evidence_items contract requires
-- bmr_id NOT NULL and therefore cannot represent a legitimate Pre-Founder.
CREATE TABLE IF NOT EXISTS gv1_principal_evidence_items (
  evidence_id TEXT PRIMARY KEY,
  founder_id TEXT NOT NULL,
  evidence_group_id TEXT NOT NULL,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  supersedes_evidence_id TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'foundational','operational','strategic','behavioral'
  )),
  source_type TEXT NOT NULL,
  source_ref TEXT,
  validation_status TEXT NOT NULL CHECK (validation_status IN (
    'reported','validated','contradicted','pending'
  )),
  payload_json TEXT NOT NULL,
  provenance_json TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '0100',
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN (
    'accepted','superseded','rejected','archived'
  )),
  UNIQUE (evidence_group_id, version_no),
  UNIQUE (client_request_id),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (supersedes_evidence_id) REFERENCES gv1_principal_evidence_items(evidence_id)
);
CREATE INDEX IF NOT EXISTS ix_gv1_principal_evidence_founder
  ON gv1_principal_evidence_items(founder_id, evidence_group_id, version_no DESC);

CREATE TABLE IF NOT EXISTS gv1_evidence_lineage_links (
  lineage_id TEXT PRIMARY KEY,
  founder_id TEXT NOT NULL,
  bmr_id TEXT,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('principal','bmr')),
  source_evidence_id TEXT NOT NULL,
  target_kind TEXT NOT NULL CHECK (target_kind IN ('principal','bmr')),
  target_evidence_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (source_kind, source_evidence_id, target_kind, target_evidence_id, relationship_type),
  FOREIGN KEY (founder_id) REFERENCES gv1_founders(founder_id),
  FOREIGN KEY (bmr_id) REFERENCES gv1_business_medical_records(bmr_id)
);
CREATE INDEX IF NOT EXISTS ix_gv1_evidence_lineage_founder
  ON gv1_evidence_lineage_links(founder_id, created_at);

CREATE TABLE IF NOT EXISTS gv1_day1_request_receipts (
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_json TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (scope, idempotency_key)
);

-- Reinforce the inherited one-record-per-real-venture invariant without creating
-- a second BMR/BHR store. If historical QA data violates this, migration must fail
-- rather than silently normalize or delete records.
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_bmr_one_per_venture
  ON gv1_business_medical_records(venture_id);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id, name, environment, checksum, applied_at)
VALUES
  ('0100', 'galvicare_1_0_day1_foundation', 'qa',
   'gc10-day1-principal-consent-evidence-v1', CURRENT_TIMESTAMP);
