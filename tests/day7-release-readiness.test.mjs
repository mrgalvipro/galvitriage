import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const worker = readFileSync(new URL('../worker/worker.js', import.meta.url), 'utf8');

function has(value) {
  assert.equal(html.includes(value), true, `Expected index.html to include: ${value}`);
}
function lacks(value) {
  assert.equal(html.includes(value), false, `Expected index.html to exclude: ${value}`);
}

// Critical functional/security contracts remain unchanged.
test('Day 7 exact-product entitlement remains product scoped', () => {
  const start = worker.indexOf('async function hasProductEntitlement');
  const end = worker.indexOf('async function storedDay4Result', start);
  assert.ok(start >= 0 && end > start);
  const entitlement = worker.slice(start, end);
  assert.match(entitlement, /WHERE session_id=\? AND product=\?/);
  assert.doesNotMatch(entitlement, /product === 'GalviSight' \|\| product === 'GalviPath'/);
});

test('Day 7 Worker supports all required paid-return aliases and runtime marker', () => {
  for (const value of [
    "galviscore: 'GalviScore'",
    "galvi_score: 'GalviScore'",
    "galvishot: 'GalviShot'",
    "galvi_shot: 'GalviShot'",
    "galvisight: 'GalviSight'",
    "galvi_sight: 'GalviSight'",
    "galvipath: 'GalviPath'",
    "galvi_path: 'GalviPath'"
  ]) assert.equal(worker.includes(value), true, value);
  assert.equal(worker.includes("const DAY7A_RUNTIME_MARKER = 'day7a-payment-products-v1';"), true);
});

test('Day 7 Production payment links remain the approved LIVE baseline', () => {
  has("const GALVISCORE_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/14A00kbjycvpgoGfBY53O00';");
  has("const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/00w14odrG1QLdcu9dA53O02';");
  has("const GALVIPATH_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/eVq3cw3R63YT6O6ahE53O03';");
  lacks('buy.stripe.com/test_');
});

test('Day 7 canonical customer URL and GalviClinic destination remain unchanged', () => {
  has("const GALVICARE_CANONICAL_CUSTOMER_URL = 'https://www.galvipro.com/#galvitriage';");
  has("const GALVICLINIC_FALLBACK_URL = 'https://calendly.com/galvilpro/gearupwithgalviclinic?month=2026-07';");
});

test('Day 7 downstream transitions retain exact-product paywall stops', () => {
  has('showGalviSightPaywall()');
  has('showGalviPathPaywall()');
  has('id="galvisight-paywall"');
  has('id="galvipath-paywall"');
});

test('Day 7 exact entitlement restoration exists for all paid products', () => {
  for (const p of ['GalviPath','GalviSight','GalviShot','GalviScore']) {
    has(`available.includes('${p}')&&entitled.includes('${p}')`);
  }
});

test('Day 7A persistent GalviCare clinic identity and Triage framing are final', () => {
  has('<h1 class="hero-title">GalviCare™</h1>');
  has('<strong>Your Digital Business Clinic</strong>');
  has('GalviTriage™ | Business Health Intake');
  has("Your Venture Doesn't Need Another Business Plan. It Needs a Diagnosis.");
  has('Tell us where it hurts.');
  has('placeholder="Example: I need a more consistent way to find and convert customers."');
  has('placeholder="Example: I need help deciding which business priority to focus on first."');
});

test('Day 7A GalviVitals presentation is educational and clinically staged', () => {
  has('GalviVitals™ | Business Vital Signs');
  has('function vitalStatusLabel(score)');
  has('function vitalEducationForDimension(key)');
  has('function growthInsightForDimension(key)');
  lacks('42% of failed startups');
});

test('Day 7A GalviScore uses symptom and care language while preserving Top 3 logic', () => {
  has('GalviScore™ | Business Symptom Assessment');
  has('Top Business Symptoms');
  has('Symptom Side Effects');
  has('Strategic Care Steps');
  has('What should you watch?');
  has('function topThreePriorityText(result)');
  has('.slice(0,3)');
});

test('Day 7A GalviShot presentation is diagnosis and treatment recommendation', () => {
  has('GalviShot™ | Diagnosis + Treatment Recommendation');
  has('Your GalviShot™ Is Ready');
  has('Take Your GalviShots');
  has('GalviShot Prescription');
  has('GalviLab Result');
  has('Why This Matters');
  has('function confidencePresentation(value)');
});

test('Day 7A GalviSight presentation is a distinct prescription', () => {
  has('GalviSight™ | Business Prescription');
  has('Your GalviSight Prescription');
  has('Unlock GalviSight™ to:');
  has('What to Do Next');
  has('Why This Is Urgent');
  has('>Unlock GalviSight™</button>');
  has("setSectionVisibility('galvisight-assumptions-section',false)");
  has("setSectionVisibility('galvisight-evidence-section',false)");
});

test('Day 7A GalviPath presentation is the 90 Day treatment plan', () => {
  has('GalviPath™ | 90 Day Business Treatment Plan');
  has('GalviLab Samples to Collect');
  has('GalviCare Markers');
  has('GalviCare Recovery Indicators');
  has('Future GalviPath Discussions');
  has('GalviPath Check Up');
  has("const GALVIPATH_CHECKUP_URL = 'https://calendly.com/galvilpro/chartyourgalvipath';");
  has('>Unlock GalviPath™</button>');
});

test('Day 7A customer view hides QA/internal sections while retaining debug support', () => {
  has('qa-debug-enabled');
  has('#galviscore-qa-override');
  has('#galvishot-live-test-override');
  has('#galvisight-assumptions-section');
  has('#galvisight-evidence-section');
});

test('Day 7A persistent GalviScore reference exists downstream', () => {
  has('function updatePersistentGalviScore(score)');
  has('Your GalviScore™: ${n}/100');
});

test('Day 7A canonical clinical stage taxonomy is present', () => {
  for (const value of [
    'Business Health Intake',
    'Business Vital Signs',
    'Business Symptom Assessment',
    'Diagnosis + Treatment Recommendation',
    'Business Prescription',
    '90 Day Business Treatment Plan',
    'Live Business Physician Care / Intervention'
  ]) has(value);
});

test('Day 7A deterministic clinical differentiation helpers exist', () => {
  assert.equal(worker.includes('clinicalDimensionLanguage'), true);
  assert.equal(worker.includes('clinicalSeverityProfile'), true);
  assert.equal(worker.includes('connectedDimensionContext'), true);
  assert.equal(worker.includes('galvishot_prescription'), true);
  assert.equal(worker.includes('galvilab_samples'), true);
  assert.equal(worker.includes('galvicare_markers'), true);
  assert.equal(worker.includes('recovery_indicators'), true);
});

test('Day 7 paid product print controls remain product scoped', () => {
  has('body.print-galviscore #galviscore-result');
  has('body.print-galvishot #galvishot-result');
  has('body.print-galvisight #galvisight-handoff');
  has('body.print-galvipath #galvipath-result');
  has('Print / Save GalviScore™');
  has('Print / Save GalviShot™');
  has('Print / Save GalviSight™');
  has('Print / Save GalviPath™');
});