import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');

test('returning customer access is additive, hashed, queue-scoped, and same-record only',()=>{
  const sql=read('migrations/day1/0700_day7_release_membership.sql');
  const svc=read('worker/domain/day7-customer-access-service.js');
  for(const table of ['gv1_customer_accounts','gv1_customer_login_invites','gv1_customer_login_sessions'])assert.match(sql,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  assert.match(sql,/password_salt TEXT NOT NULL/);assert.match(sql,/password_hash TEXT NOT NULL/);assert.doesNotMatch(sql,/password TEXT|plaintext_password/i);
  for(const marker of ['PBKDF2','SHA-256','PASSWORD_ITERATIONS=210000','MAX_FAILED_ATTEMPTS=5','membership_recommended','active_membership','membership_reassessment','GalviShot','legacy_session_id','manual_repair:\'NO\''])assert.ok(svc.includes(marker),marker);
  assert.match(svc,/Customer GalviChart access opens only when Business Physician care is waiting or Continuous Care is active/);
  assert.match(svc,/There is no current Business Physician update waiting\. Complete GalviTriage to begin a new care event/);
  assert.match(svc,/More than one Business Health Record has an active care item/);
  assert.doesNotMatch(svc,/localStorage|document\.|window\./);
});

test('customer access audit SQL has exact gv1_audit_log value arity',()=>{
  const svc=read('worker/domain/day7-customer-access-service.js');
  assert.match(svc,/VALUES \(\?,\?,\?,\?,NULL,NULL,\?,'day7-customer-access',\?,\?,\?,\?,\?,\?\)/);
  assert.doesNotMatch(svc,/VALUES \(\?,\?,\?,\?,NULL,NULL,\?,'day7-customer-access',\?,\?,\?,\?,\?,\?,\?\)/);
});

test('GalviCare QA exposes login beneath intake without turning login into a new GalviTriage event',()=>{
  const ui=read('qa-frontend-worker.js');
  for(const marker of ['Returning Patient? Log in to GalviCare','Log in & View GalviChart','customer-access/login','customer-access/activate','persistSessionId','GalviChartDay4.open','If no care item is waiting, begin a new GalviTriage visit below'])assert.ok(ui.includes(marker),marker);
  assert.match(ui,/input\[name="consent"\]/);
  assert.doesNotMatch(ui,/STRIPE_SECRET_KEY|HUBSPOT_PRIVATE_APP_TOKEN|password_hash|password_salt/);
});

test('returning patient invite hash is parsed without consuming the GalviTriage fragment marker',()=>{
  const ui=read('qa-frontend-worker.js');
  assert.match(ui,/match=raw\.match\(\/\(\?:\^\|&\)galviaccess=\(\[\^&\]\+\)\/\)/);
  assert.match(ui,/decodeURIComponent\(match\[1\]\)/);
  assert.doesNotMatch(ui,/new URLSearchParams\(raw\.replace\(\/\^galvitriage&\?\//);
});

test('customer activation commits account invite session and audit in one D1 batch and fails closed',()=>{
  const svc=read('worker/domain/day7-customer-access-service.js');
  for(const marker of ['activationAccountState','prepareSession','GV_CUSTOMER_ACCOUNT_IDENTITY_CONFLICT','GV_CUSTOMER_ACTIVATION_WRITE_FAILED','activation_transaction'])assert.ok(svc.includes(marker),marker);
  assert.match(svc,/if\(accountState\.insert\)statements\.push\(accountState\.insert\)/);
  assert.match(svc,/sessionState\.insert/);
  assert.match(svc,/sessionState\.audit/);
  assert.match(svc,/await env\.DB\.batch\(statements\)/);
  assert.doesNotMatch(svc,/await env\.DB\.prepare\(`INSERT INTO gv1_customer_accounts[\s\S]*?\.run\(\);account=/);
});

test('Business Physician can issue a patient GalviChart update without activating Membership',()=>{
  const wrapper=read('worker/day8-day7-entry.js'),ui=read('clinician-portal/day7-customer-access.js');
  assert.match(wrapper,/requireClinicianIdentity/);assert.match(wrapper,/identity\.role!==\'business_physician\'/);assert.match(wrapper,/customer-access-invite/);assert.match(wrapper,/day8Day6Worker\.fetch/);
  assert.match(ui,/Send \/ Generate Patient Login Link/);assert.match(ui,/customer-access-invite/);assert.match(ui,/GalviVault stores only its hash/);
  assert.doesNotMatch(ui,/membership-payment-return|membership\/start|STRIPE_SECRET_KEY|api\.stripe\.com/);
});

test('Membership clinician surface is Care Plan only and loads the patient-access action',()=>{
  const ui=read('clinician-portal/day7-membership.js');
  assert.match(ui,/data-day7-membership-surface="care-plan-only"/);
  assert.match(ui,/\^Current Care\$/);
  assert.match(ui,/carePlanContext/);
  assert.match(ui,/ensureCustomerAccessScript/);
  assert.match(ui,/day7-customer-access\.js/);
  assert.doesNotMatch(ui,/treatmentForm=panel\.querySelector\('#treatment_event,#plan'\)/);
});

test('HubSpot notification remains an optional non-blocking adapter',()=>{
  const svc=read('worker/domain/day7-customer-access-service.js');
  assert.match(svc,/HUBSPOT_PRIVATE_APP_TOKEN/);assert.match(svc,/HUBSPOT_TRANSACTIONAL_EMAIL_ID/);assert.match(svc,/marketing\/v3\/transactional\/single-email\/send/);assert.match(svc,/skipped_not_configured/);
  assert.match(svc,/const hubspot=await hubSpotNotification/);
});

test('customer and clinician runtime wrappers preserve inherited Day 7 and Day 8 implementations',()=>{
  const customer=read('worker/day7-customer-entry.js'),clinician=read('worker/day8-day7-entry.js');
  assert.match(customer,/import day7Worker from '.\/day7-entry\.js'/);assert.match(customer,/day7Worker\.fetch/);
  assert.match(clinician,/import day8Day6Worker from '.\/day8-day6-entry\.js'/);assert.match(clinician,/day8Day6Worker\.fetch/);
});