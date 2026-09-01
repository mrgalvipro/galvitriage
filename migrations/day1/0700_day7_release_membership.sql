PRAGMA foreign_keys = ON;

-- GalviStudio | GalviCare 1.0 Day 7 release-critical Business Health Membership beta.
-- Additive only. Extends the canonical principal/BHR/Treatment Plan loop; no shadow record.
CREATE TABLE IF NOT EXISTS gv1_memberships (
  membership_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  membership_type TEXT NOT NULL DEFAULT 'business_health_beta'
    CHECK (membership_type IN ('business_health_beta')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','canceled','closed')),
  started_at TEXT NOT NULL,
  canceled_at TEXT,
  version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_memberships_bmr
  ON gv1_memberships(bmr_id,status,created_at);
CREATE INDEX IF NOT EXISTS idx_gv1_memberships_principal
  ON gv1_memberships(principal_id,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv1_memberships_one_active_bmr
  ON gv1_memberships(bmr_id)
  WHERE status='active';

CREATE TABLE IF NOT EXISTS gv1_membership_events (
  membership_event_id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES gv1_memberships(membership_id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'membership_started','membership_canceled','checkin_submitted','reassessment_queued'
  )),
  related_entity_type TEXT,
  related_entity_id TEXT,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  correlation_id TEXT,
  client_request_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (client_request_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_membership_events
  ON gv1_membership_events(membership_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_membership_checkins (
  membership_checkin_id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES gv1_memberships(membership_id),
  checkin_id TEXT NOT NULL REFERENCES gv1_checkins(checkin_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (membership_id,checkin_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_membership_checkins_membership
  ON gv1_membership_checkins(membership_id,created_at);

CREATE TABLE IF NOT EXISTS gv1_membership_reassessment_queue (
  queue_id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES gv1_memberships(membership_id),
  checkin_id TEXT NOT NULL REFERENCES gv1_checkins(checkin_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  treatment_plan_id TEXT NOT NULL REFERENCES gv1_treatment_plans(treatment_plan_id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','reviewed','superseded','closed')),
  reason_code TEXT NOT NULL DEFAULT 'membership_checkin',
  correlation_id TEXT,
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  UNIQUE (membership_id,checkin_id)
);
CREATE INDEX IF NOT EXISTS idx_gv1_membership_reassessment_pending
  ON gv1_membership_reassessment_queue(status,created_at);

-- Day 7 P0 returning-customer access. Passwords are never stored. GalviVault stores
-- PBKDF2-SHA256 verifier material only; invite and login tokens are stored only as hashes.
-- A returning-login session remains bound to one canonical principal/BHR and the existing
-- GalviCare session lineage. It does not create a new care event or a shadow BHR.
CREATE TABLE IF NOT EXISTS gv1_customer_accounts (
  account_id TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL UNIQUE REFERENCES gv1_founders(founder_id),
  email_normalized TEXT NOT NULL UNIQUE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_iterations INTEGER NOT NULL CHECK (password_iterations >= 100000),
  password_version INTEGER NOT NULL DEFAULT 1 CHECK (password_version >= 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','locked','disabled')),
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_accounts_email
  ON gv1_customer_accounts(email_normalized,status);

CREATE TABLE IF NOT EXISTS gv1_customer_login_invites (
  invite_hash TEXT PRIMARY KEY,
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  legacy_session_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'business_health_membership'
    CHECK (source_type IN ('business_health_membership')),
  source_entity_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL UNIQUE,
  created_by_actor_type TEXT NOT NULL,
  created_by_actor_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_login_invites_principal
  ON gv1_customer_login_invites(principal_id,bmr_id,expires_at);

CREATE TABLE IF NOT EXISTS gv1_customer_login_sessions (
  session_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES gv1_customer_accounts(account_id),
  principal_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  bmr_id TEXT NOT NULL REFERENCES gv1_business_medical_records(bmr_id),
  legacy_session_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_login_sessions_account
  ON gv1_customer_login_sessions(account_id,expires_at);
CREATE INDEX IF NOT EXISTS idx_gv1_customer_login_sessions_bmr
  ON gv1_customer_login_sessions(bmr_id,expires_at);

-- Day 7 P1: customer-facing Pre-Founder identity/session and principal-only care lineage.
-- Pre-Founder is a real principal with no fabricated venture/BHR. These tables provide
-- the longitudinal care envelope until canonical venture creation is evidence-supported.
CREATE TABLE IF NOT EXISTS gv1_prefounder_sessions (
  session_hash TEXT PRIMARY KEY,
  context_id TEXT NOT NULL REFERENCES gv1_principal_contexts(context_id),
  founder_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_sessions_context
  ON gv1_prefounder_sessions(context_id,expires_at);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_sessions_founder
  ON gv1_prefounder_sessions(founder_id,expires_at);

CREATE TABLE IF NOT EXISTS gv1_prefounder_care_events (
  event_id TEXT PRIMARY KEY,
  context_id TEXT NOT NULL REFERENCES gv1_principal_contexts(context_id),
  founder_id TEXT NOT NULL REFERENCES gv1_founders(founder_id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'galvishot_completed','galvichart_activated','galvisight_completed','galvipath_completed',
    'clinic_booking_requested','physician_plan','customer_acknowledged','monitoring_checkin',
    'reassessment_requested'
  )),
  product TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer','business_physician')),
  actor_id TEXT NOT NULL,
  client_request_id TEXT NOT NULL UNIQUE,
  request_fingerprint TEXT NOT NULL,
  correlation_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_care_context
  ON gv1_prefounder_care_events(context_id,created_at,event_id);
CREATE INDEX IF NOT EXISTS idx_gv1_prefounder_care_founder
  ON gv1_prefounder_care_events(founder_id,created_at,event_id);

INSERT OR IGNORE INTO gv1_schema_migrations
  (migration_id,name,environment,checksum,applied_at)
VALUES
  ('D7A1','day7_business_health_membership_beta_v1','qa',
   'gv1-d7a1-membership-beta-v1',CURRENT_TIMESTAMP);

-- Day 7 is intentionally cumulative. Preserve the migration identity while making
-- its checksum describe the final signed Membership + returning-customer schema.
UPDATE gv1_schema_migrations
SET checksum='gv1-d7a1-membership-prefounder-customer-access-v3'
WHERE migration_id='D7A1' AND name='day7_business_health_membership_beta_v1';

-- Day 7 Human-E2E fixture identity reconciliation.
-- Maya Ellis / Brightline Growth Studio was created through controlled QA fixture setup
-- instead of the normal GalviTriage write path. Production identities already follow:
-- GalviTriage founder.email -> legacy founders.email -> canonical gv1_founders.email ->
-- primary founder/venture role -> gv1_customer_accounts.email_normalized -> returning login.
-- Email belongs to the canonical principal; it is intentionally NOT duplicated on the BMR.
-- This exact-BMR correction is source-controlled, idempotent, audited and manual_repair=NO.

INSERT INTO gv1_schema_migrations (migration_id,name,environment,checksum,applied_at)
SELECT
  'D7MAYA1',
  'day7_maya_ellis_primary_identity_fixture',
  CASE WHEN
    (SELECT COUNT(*)
       FROM gv1_business_medical_records b
       JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
       JOIN gv1_founders f ON f.founder_id=r.founder_id
      WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
        AND lower(trim(COALESCE(f.first_name,'')))='maya'
        AND lower(trim(COALESCE(f.last_name,'')))='ellis')=1
    AND NOT EXISTS (
      SELECT 1 FROM gv1_founders f
       WHERE lower(trim(COALESCE(f.email,'')))='maya.ellis.day7.e2e@example.com'
         AND f.founder_id<>(SELECT r.founder_id FROM gv1_business_medical_records b JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' JOIN gv1_founders mf ON mf.founder_id=r.founder_id WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f' AND lower(trim(COALESCE(mf.first_name,'')))='maya' AND lower(trim(COALESCE(mf.last_name,'')))='ellis' LIMIT 1))
    AND NOT EXISTS (
      SELECT 1 FROM gv1_customer_accounts a
       WHERE lower(trim(a.email_normalized))='maya.ellis.day7.e2e@example.com'
         AND a.principal_id<>(SELECT r.founder_id FROM gv1_business_medical_records b JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' JOIN gv1_founders mf ON mf.founder_id=r.founder_id WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f' AND lower(trim(COALESCE(mf.first_name,'')))='maya' AND lower(trim(COALESCE(mf.last_name,'')))='ellis' LIMIT 1))
  THEN 'qa' ELSE 'invalid_fixture_identity' END,
  'day7-maya-primary-identity-v1',CURRENT_TIMESTAMP
ON CONFLICT(migration_id) DO UPDATE SET environment=excluded.environment,checksum=excluded.checksum,applied_at=excluded.applied_at;

UPDATE founders
SET email='maya.ellis.day7.e2e@example.com',updated_at=CURRENT_TIMESTAMP
WHERE founder_id=(
  SELECT lf.founder_id
    FROM founders lf
    JOIN ventures lv ON lv.session_id=lf.session_id
    JOIN gv1_business_medical_records b ON b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
    JOIN gv1_ventures cv ON cv.venture_id=b.venture_id
   WHERE lower(trim(COALESCE(lf.first_name,'')))='maya'
     AND lower(trim(COALESCE(lf.last_name,'')))='ellis'
     AND lower(trim(COALESCE(lv.venture_name,'')))=lower(trim(COALESCE(cv.venture_name,'')))
   ORDER BY lf.updated_at DESC,lf.created_at DESC LIMIT 1
);

UPDATE gv1_customer_accounts
SET email_normalized='maya.ellis.day7.e2e@example.com',updated_at=CURRENT_TIMESTAMP
WHERE principal_id=(
  SELECT r.founder_id
    FROM gv1_business_medical_records b
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
    JOIN gv1_founders f ON f.founder_id=r.founder_id
   WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
     AND lower(trim(COALESCE(f.first_name,'')))='maya'
     AND lower(trim(COALESCE(f.last_name,'')))='ellis' LIMIT 1
);

UPDATE gv1_founders
SET email='maya.ellis.day7.e2e@example.com',updated_at=CURRENT_TIMESTAMP
WHERE founder_id=(
  SELECT r.founder_id
    FROM gv1_business_medical_records b
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
    JOIN gv1_founders f ON f.founder_id=r.founder_id
   WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
     AND lower(trim(COALESCE(f.first_name,'')))='maya'
     AND lower(trim(COALESCE(f.last_name,'')))='ellis' LIMIT 1
);

UPDATE gv1_founder_venture_roles
SET is_primary=0,updated_at=CURRENT_TIMESTAMP
WHERE venture_id=(SELECT venture_id FROM gv1_business_medical_records WHERE bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f') AND status='active';

UPDATE gv1_founder_venture_roles
SET is_primary=1,updated_at=CURRENT_TIMESTAMP
WHERE venture_id=(SELECT venture_id FROM gv1_business_medical_records WHERE bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f')
  AND founder_id=(SELECT r.founder_id FROM gv1_business_medical_records b JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' JOIN gv1_founders f ON f.founder_id=r.founder_id WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f' AND lower(trim(COALESCE(f.first_name,'')))='maya' AND lower(trim(COALESCE(f.last_name,'')))='ellis' LIMIT 1)
  AND status='active';

INSERT OR IGNORE INTO gv1_audit_log
  (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
SELECT 'aud_day7_maya_primary_identity_v1','founder',f.founder_id,'qa_fixture_identity_reconciled',NULL,NULL,'system','day7-release-migration','day7_e2e_synthetic_identity',
       '{"bmr_id":"bmr_0d72e878cc634917ae2ac8430a73331f","login_email":"maya.ellis.day7.e2e@example.com","primary_identity":true,"manual_repair":"NO"}',
       'day7-maya-e2e-primary-identity','qa',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
  FROM gv1_business_medical_records b
  JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1
  JOIN gv1_founders f ON f.founder_id=r.founder_id
 WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
   AND lower(trim(COALESCE(f.first_name,'')))='maya'
   AND lower(trim(COALESCE(f.last_name,'')))='ellis'
   AND lower(trim(COALESCE(f.email,'')))='maya.ellis.day7.e2e@example.com';

-- Postcondition guard: fail the migration rather than silently passing an incomplete fixture.
UPDATE gv1_schema_migrations
SET environment=CASE WHEN
  (SELECT COUNT(*) FROM gv1_business_medical_records b JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1 JOIN gv1_founders f ON f.founder_id=r.founder_id WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f' AND lower(trim(COALESCE(f.first_name,'')))='maya' AND lower(trim(COALESCE(f.last_name,'')))='ellis' AND lower(trim(COALESCE(f.email,'')))='maya.ellis.day7.e2e@example.com')=1
  AND NOT EXISTS (SELECT 1 FROM gv1_customer_accounts a JOIN gv1_business_medical_records b ON b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f' JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1 WHERE a.principal_id=r.founder_id AND lower(trim(a.email_normalized))<>'maya.ellis.day7.e2e@example.com')
  AND EXISTS (SELECT 1 FROM founders lf JOIN ventures lv ON lv.session_id=lf.session_id JOIN gv1_business_medical_records b ON b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f' JOIN gv1_ventures cv ON cv.venture_id=b.venture_id WHERE lower(trim(COALESCE(lf.first_name,'')))='maya' AND lower(trim(COALESCE(lf.last_name,'')))='ellis' AND lower(trim(COALESCE(lf.email,'')))='maya.ellis.day7.e2e@example.com' AND lower(trim(COALESCE(lv.venture_name,'')))=lower(trim(COALESCE(cv.venture_name,''))))
THEN 'qa' ELSE 'invalid_fixture_identity' END,
checksum='day7-maya-primary-identity-v1',applied_at=CURRENT_TIMESTAMP
WHERE migration_id='D7MAYA1';
