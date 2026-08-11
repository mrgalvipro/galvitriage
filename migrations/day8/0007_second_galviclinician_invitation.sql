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
