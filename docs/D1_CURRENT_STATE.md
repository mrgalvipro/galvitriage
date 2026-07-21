# GalviVault 0.5 QA D1 Current State

Database: `galvivault-0-5-qa`

Binding: `DB`

Environment: `qa_migration`

Current Worker flags:

- `D1_FOUNDATION_ENABLED=true`
- `D1_WRITE_MODE=foundation_only`

Current schema version:

`galvivault_schema_v0_5_1`

Day 1 foundation actions:

- `health_check`
- `create_or_resume_session`
- `journey_event`
- `get_fixture_result`

Day 2 database changes must be additive-only.

Do not:

- Drop tables
- Rename current tables
- Delete QA history without approval
- Apply migration to production
- Change the D1 binding name
- Create a second Worker

Cloudflare deployment and D1 migration execution remain human-controlled.
Codex may prepare code and commands but may not deploy or execute remote
migration without explicit Product Owner approval.
