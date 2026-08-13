PRAGMA foreign_keys = ON;

-- Production promotion of the already-proven Day 8 operator authentication boundary.
-- Additive only; canonical GalviVault business/clinical records remain untouched.

CREATE TABLE IF NOT EXISTS gv8_operator_credentials (
  credential_id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business_physician','clinician')),
  public_jwk TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv8_operator_credentials_operator
  ON gv8_operator_credentials(operator_id) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS ux_gv8_operator_credentials_email
  ON gv8_operator_credentials(email_normalized) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS gv8_operator_invitations (
  invitation_hash TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('business_physician','clinician')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_gv8_operator_invitations_email
  ON gv8_operator_invitations(email_normalized, expires_at);

CREATE TABLE IF NOT EXISTS gv8_auth_challenges (
  challenge_id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('login')),
  challenge TEXT NOT NULL,
  credential_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_gv8_auth_challenges_operator
  ON gv8_auth_challenges(operator_id, purpose, expires_at);

CREATE TABLE IF NOT EXISTS gv8_operator_sessions (
  session_hash TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  credential_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS ix_gv8_operator_sessions_operator
  ON gv8_operator_sessions(operator_id, expires_at);

INSERT OR IGNORE INTO gv1_schema_migrations (migration_id, name, environment, checksum)
VALUES ('0006', 'day8_operator_device_auth', 'production', 'prod-day8-operator-device-auth-v1');
