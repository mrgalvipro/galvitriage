PRAGMA foreign_keys = ON;

-- Day 8 E2E-16 additive QA invitation for the required second approved GalviClinician.
-- Only the one-time enrollment token hash is persisted; no plaintext credential is stored.
INSERT OR IGNORE INTO gv8_operator_invitations (
  invitation_hash,
  operator_id,
  email_normalized,
  display_name,
  role,
  expires_at,
  used_at,
  created_at,
  created_by
) VALUES (
  'fU1XLyJ32Uwnf1Jili4g72BSZU6-HZ6Xy2aHFKhXwvQ',
  'op_galviclinician_qa_01',
  'galviclinician.qa@galvipro.com',
  'GalviClinician QA',
  'clinician',
  '2026-08-18T23:59:59.000Z',
  NULL,
  '2026-08-11T22:02:00.000Z',
  'day8_e2e16'
);

INSERT OR IGNORE INTO gv1_schema_migrations (migration_id, name, environment, checksum)
VALUES ('0007', 'day8_second_galviclinician_invitation', 'qa', 'day8-second-galviclinician-invitation-v1');

-- Day 7 Human-E2E synthetic fixture identity reconciliation.
-- Maya Ellis / Brightline Growth Studio was created through controlled QA fixture setup
-- rather than a normal GalviTriage submission, so the fixture did not receive the
-- customer-entered email lineage that production receives naturally. Reconcile ONLY the
-- exact QA BMR below. This is a source-controlled, idempotent migration; manual_repair=NO.
--
-- Permanent identity contract (already used by the normal customer journey):
-- GalviTriage founder.email -> legacy founders.email -> canonical gv1_founders.email ->
-- primary founder/venture role -> gv1_customer_accounts.email_normalized -> returning login.
-- Email remains a principal identity field; it is NOT added to the BMR table.

-- Precondition guard. gv1_schema_migrations.environment has a CHECK constraint. An invalid
-- value intentionally aborts before identity writes if Maya cannot be resolved uniquely or
-- the test login email is owned by another legacy/canonical principal/account.
INSERT INTO gv1_schema_migrations (migration_id,name,environment,checksum,applied_at)
SELECT
  'D7MAYA1',
  'day7_maya_ellis_primary_identity_fixture',
  CASE WHEN
    (
      SELECT COUNT(*)
      FROM gv1_business_medical_records b
      JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
      JOIN gv1_founders f ON f.founder_id=r.founder_id
      WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
        AND lower(trim(COALESCE(f.first_name,'')))='maya'
        AND lower(trim(COALESCE(f.last_name,'')))='ellis'
    )=1
    AND NOT EXISTS (
      SELECT 1 FROM gv1_founders other
      WHERE lower(trim(COALESCE(other.email,'')))='maya.ellis.day7.e2e@example.com'
        AND other.founder_id<>(
          SELECT f.founder_id
          FROM gv1_business_medical_records b
          JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
          JOIN gv1_founders f ON f.founder_id=r.founder_id
          WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
            AND lower(trim(COALESCE(f.first_name,'')))='maya'
            AND lower(trim(COALESCE(f.last_name,'')))='ellis'
          LIMIT 1
        )
    )
    AND NOT EXISTS (
      SELECT 1 FROM gv1_customer_accounts a
      WHERE lower(trim(a.email_normalized))='maya.ellis.day7.e2e@example.com'
        AND a.principal_id<>(
          SELECT f.founder_id
          FROM gv1_business_medical_records b
          JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
          JOIN gv1_founders f ON f.founder_id=r.founder_id
          WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
            AND lower(trim(COALESCE(f.first_name,'')))='maya'
            AND lower(trim(COALESCE(f.last_name,'')))='ellis'
          LIMIT 1
        )
    )
    AND NOT EXISTS (
      SELECT 1 FROM founders lf
      WHERE lower(trim(COALESCE(lf.email,'')))='maya.ellis.day7.e2e@example.com'
        AND NOT (
          lower(trim(COALESCE(lf.first_name,'')))='maya'
          AND lower(trim(COALESCE(lf.last_name,'')))='ellis'
        )
    )
  THEN 'qa' ELSE 'invalid_fixture_identity' END,
  'day7-maya-primary-identity-v1',
  CURRENT_TIMESTAMP
ON CONFLICT(migration_id) DO UPDATE SET
  environment=excluded.environment,
  checksum=excluded.checksum,
  applied_at=excluded.applied_at;

-- Make the synthetic legacy GalviCare founder look exactly like a real Triage-created
-- identity. Match the exact canonical Brightline venture; do not create a new session.
UPDATE founders
SET email='maya.ellis.day7.e2e@example.com',
    updated_at=CURRENT_TIMESTAMP
WHERE founder_id=(
  SELECT lf.founder_id
  FROM founders lf
  JOIN ventures lv ON lv.session_id=lf.session_id
  JOIN gv1_business_medical_records b ON b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
  JOIN gv1_ventures cv ON cv.venture_id=b.venture_id
  WHERE lower(trim(COALESCE(lf.first_name,'')))='maya'
    AND lower(trim(COALESCE(lf.last_name,'')))='ellis'
    AND lower(trim(COALESCE(lv.venture_name,'')))=lower(trim(COALESCE(cv.venture_name,'')))
  ORDER BY lf.updated_at DESC,lf.created_at DESC
  LIMIT 1
);

-- Reconcile an already-created returning account without resetting its password. If no
-- account exists yet, first-login activation creates it from the same canonical email.
UPDATE gv1_customer_accounts
SET email_normalized='maya.ellis.day7.e2e@example.com',
    updated_at=CURRENT_TIMESTAMP
WHERE principal_id=(
  SELECT f.founder_id
  FROM gv1_business_medical_records b
  JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
  JOIN gv1_founders f ON f.founder_id=r.founder_id
  WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
    AND lower(trim(COALESCE(f.first_name,'')))='maya'
    AND lower(trim(COALESCE(f.last_name,'')))='ellis'
  LIMIT 1
);

-- Canonical principal identity used by the BMR/GalviChart and customer access service.
UPDATE gv1_founders
SET email='maya.ellis.day7.e2e@example.com',
    updated_at=CURRENT_TIMESTAMP
WHERE founder_id=(
  SELECT f.founder_id
  FROM gv1_business_medical_records b
  JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
  JOIN gv1_founders f ON f.founder_id=r.founder_id
  WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
    AND lower(trim(COALESCE(f.first_name,'')))='maya'
    AND lower(trim(COALESCE(f.last_name,'')))='ellis'
  LIMIT 1
);

-- Explicitly flag Maya as the primary principal for this synthetic BMR. Preserve the
-- existing venture/BMR and all clinical/commercial history.
UPDATE gv1_founder_venture_roles
SET is_primary=0,
    updated_at=CURRENT_TIMESTAMP
WHERE venture_id=(
  SELECT venture_id FROM gv1_business_medical_records
  WHERE bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
)
  AND status='active';

UPDATE gv1_founder_venture_roles
SET is_primary=1,
    updated_at=CURRENT_TIMESTAMP
WHERE venture_id=(
  SELECT venture_id FROM gv1_business_medical_records
  WHERE bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
)
  AND founder_id=(
    SELECT f.founder_id
    FROM gv1_business_medical_records b
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
    JOIN gv1_founders f ON f.founder_id=r.founder_id
    WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
      AND lower(trim(COALESCE(f.first_name,'')))='maya'
      AND lower(trim(COALESCE(f.last_name,'')))='ellis'
    LIMIT 1
  )
  AND status='active';

INSERT OR IGNORE INTO gv1_audit_log
  (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,
   reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
SELECT
  'aud_day7_maya_primary_identity_v1',
  'founder',
  f.founder_id,
  'qa_fixture_identity_reconciled',
  NULL,
  NULL,
  'system',
  'day8-qa-migration',
  'day7_e2e_synthetic_identity',
  '{"bmr_id":"bmr_0d72e878cc634917ae2ac8430a73331f","login_email":"maya.ellis.day7.e2e@example.com","primary_identity":true,"manual_repair":"NO"}',
  'day7-maya-e2e-primary-identity',
  'qa',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM gv1_business_medical_records b
JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1
JOIN gv1_founders f ON f.founder_id=r.founder_id
WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
  AND lower(trim(COALESCE(f.first_name,'')))='maya'
  AND lower(trim(COALESCE(f.last_name,'')))='ellis'
  AND lower(trim(COALESCE(f.email,'')))='maya.ellis.day7.e2e@example.com';

-- Postcondition guard. A successful workflow proves that the deployed D1 fixture has one
-- primary Maya principal, the expected canonical email, matching legacy intake identity,
-- and no mismatched existing account. Failure aborts the migration automatically.
UPDATE gv1_schema_migrations
SET environment=CASE WHEN
  (
    SELECT COUNT(*)
    FROM gv1_business_medical_records b
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1
    JOIN gv1_founders f ON f.founder_id=r.founder_id
    WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
      AND lower(trim(COALESCE(f.first_name,'')))='maya'
      AND lower(trim(COALESCE(f.last_name,'')))='ellis'
      AND lower(trim(COALESCE(f.email,'')))='maya.ellis.day7.e2e@example.com'
  )=1
  AND (
    SELECT COUNT(*)
    FROM gv1_business_medical_records b
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1
    WHERE b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
  )=1
  AND NOT EXISTS (
    SELECT 1
    FROM gv1_customer_accounts a
    JOIN gv1_business_medical_records b ON b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1
    WHERE a.principal_id=r.founder_id
      AND lower(trim(a.email_normalized))<>'maya.ellis.day7.e2e@example.com'
  )
  AND EXISTS (
    SELECT 1
    FROM founders lf
    JOIN ventures lv ON lv.session_id=lf.session_id
    JOIN gv1_business_medical_records b ON b.bmr_id='bmr_0d72e878cc634917ae2ac8430a73331f'
    JOIN gv1_ventures cv ON cv.venture_id=b.venture_id
    WHERE lower(trim(COALESCE(lf.first_name,'')))='maya'
      AND lower(trim(COALESCE(lf.last_name,'')))='ellis'
      AND lower(trim(COALESCE(lf.email,'')))='maya.ellis.day7.e2e@example.com'
      AND lower(trim(COALESCE(lv.venture_name,'')))=lower(trim(COALESCE(cv.venture_name,'')))
  )
THEN 'qa' ELSE 'invalid_fixture_identity' END,
    checksum='day7-maya-primary-identity-v1',
    applied_at=CURRENT_TIMESTAMP
WHERE migration_id='D7MAYA1';

UPDATE gv1_schema_migrations
SET checksum='day8-second-galviclinician-invitation-plus-day7-maya-identity-v2'
WHERE migration_id='0007' AND name='day8_second_galviclinician_invitation';
