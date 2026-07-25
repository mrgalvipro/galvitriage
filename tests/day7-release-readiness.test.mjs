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

// Critical functional/security contracts.
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

test('Day 7 approved Stripe TEST links remain unchanged', () => {
  has("const GALVISIGHT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_eVq3cw3R63YT6O6ahE53O03';");
  has("const GALVIPATH_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_fZu14ofzO9jd8We1L853O05';");
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

// Approved Day 7A customer presentation.
test('Day 7A GalviTriage presentation is final', () => {
  lacks('Baseline QA sequence:');
  has('<h1 class="hero-title">GalviTriage™</h1>');
  has('GalviCare™ can prepare your initial business health snapshot: GalviVitals™.');
  has('placeholder="Example: I need a more consistent way to find and convert customers."');
  has('placeholder="Example: I need help deciding which business priority to focus on first."');
});

test('Day 7A GalviVitals presentation is final', () => {
  has('<h2 class="center">GalviVitals™</h2>');
  has('Your business health snapshot: ${vitals.classification||vitals.health_band||\'Pending\'}.');
  lacks('data-cta-location="galvivitals_result">Print / Save Results</button>');
});

test('Day 7A GalviScore preserves proprietary naming and Top 3 logic', () => {
  has('Your GalviScore™ is Ready');
  has('<h2 class="center">Your GalviScore™</h2>');
  lacks('Built from your GalviTriage data using rules-first GalviEngine logic.');
  lacks('Secure checkout powered by Stripe. Your score unlocks after payment confirmation.');
  has('function topThreePriorityText(result)');
  has('.slice(0,3)');
});

test('Day 7A GalviShot presentation is final', () => {
  has('<h1 class="center">Your Executive Clinical Findings Are Ready</h1>');
  lacks('<strong>Preview:</strong>');
  has('<h3>Recommended Next Best Actions</h3>');
  has('function confidencePresentation(value)');
  has("label:'Strong'");
  has("label:'Moderate'");
  has("label:'Limited'");
});

test('Day 7A GalviSight presentation is final', () => {
  has('>Unlock GalviSight™</button>');
  lacks('>Unlock GalviSight™ — $29</button>');
  has('GalviShot™ explains why your business is showing these symptoms. GalviSight™ turns those findings into clear actions');
  has("setSectionVisibility('galvisight-assumptions-section',false)");
  has("setSectionVisibility('galvisight-evidence-section',false)");
});

test('Day 7A GalviPath presentation is final', () => {
  has('<h1>Chart Your GalviPath™</h1>');
  has('GalviPath™ turns your GalviCare™ findings into a focused 90 day plan.');
  has('<li>Primary Treatment Pathway</li>');
  has('<li>90 Day GalviPath™ Sequence</li>');
  has('<li>90 Day GalviPath™ Actions</li>');
  has('<li>GalviPath™ Guidance</li>');
  has('>Unlock GalviPath™</button>');
  lacks('>Unlock GalviPath™ — $29</button>');
});

test('Day 7A customer view hides QA/internal presentation while retaining debug mode', () => {
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

test('Day 7A approved product progression copy is present', () => {
  has('GalviScore™ shows where your business stands. GalviShot™ helps you understand');
  has('GalviShot™ explains why your business is showing these symptoms. GalviSight™ turns those findings into clear actions');
  has('GalviSight™ shows what actions deserve your attention. GalviPath™ organizes those actions into a focused 90 day path');
  has('Your GalviPath™ gives you a clear direction for the next 90 days. GalviClinic™ gives you dedicated support');
});

test('Day 7A customer-readable evidence helpers exist', () => {
  has('function contextualEvidenceSentence(value)');
  has('function formatCustomerEvidence(value)');
  has('function humanizeCustomerText(value)');
  has('function pruneGalviPathInternalSections(panel)');
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
