import { writeFileSync } from 'node:fs';

const prodUrl = String(process.env.PROD_URL || '').replace(/\/$/, '');
const versionId = String(process.env.VERSION_ID || '').trim();
const suffix = String(process.env.CANARY_SUFFIX || Date.now()).replace(/[^A-Za-z0-9_-]/g, '-');
const output = process.env.CANARY_OUTPUT || '/tmp/production-galvivault-canary.json';
if (!prodUrl || !versionId) throw new Error('PROD_URL and VERSION_ID are required');

const email = `prod.galvicare.galvivault.e2e+${suffix}@example.invalid`;
const primaryVenture = `PROD E2E Continuity ${suffix}`;
const secondaryVenture = `PROD E2E Continuity ${suffix} Venture B`;
const answerKeys = Array.from({ length: 20 }, (_, i) => `q${String(i + 1).padStart(2, '0')}_${[
  'business_clarity','stage_signal','real_problem','ideal_customer','attract_customers','customer_conversations','predictable_revenue','revenue_growth_confidence','revenue_driver_clarity','customer_satisfaction','feedback_improvement','organized_operations','founder_dependency','systems_support_growth','technology_effectiveness','ai_readiness','leadership_confidence','vision_clarity','decision_information','execution_action'
][i]}`);
const scoredAnswers = Object.fromEntries(answerKeys.map((key, i) => [key, 2 + (i % 4)]));

function payload(sessionId, ventureName) {
  return {
    action: 'submit_triage',
    session: {
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      source: 'production_galvicare_galvivault_e2e',
      utm_source: 'internal_e2e',
      utm_campaign: 'galvicare_galvivault_production_promotion',
      device_type: 'github_actions_canary'
    },
    founder: {
      first_name: 'Production',
      last_name: 'E2E',
      email,
      phone: '',
      linkedin_url: '',
      consent: true
    },
    venture: {
      venture_name: ventureName,
      website: '',
      organization_stage: 'Pre-Revenue',
      organization_type: 'Nonprofit',
      industry: 'Technology',
      revenue_range: '$10K-$50K',
      team_size: '1-5'
    },
    scored_answers: scoredAnswers,
    priority: { highest_impact_area: 'Customer Growth' },
    open_text: {
      biggest_challenge: 'Production integration continuity verification',
      one_30_day_problem: 'Verify canonical Business Medical Record continuity',
      growth_blocker: 'Internal release canary only',
      feels_broken: 'No customer-facing defect; bounded release verification',
      keeps_up_at_night: 'Production data integrity during promotion'
    },
    journey_event: { event_name: 'galvitriage_submitted', screen: 'GalviTriage' }
  };
}

async function submit(sessionId, ventureName) {
  const response = await fetch(`${prodUrl}/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://www.galvipro.com',
      'Cloudflare-Workers-Version-Overrides': `galvicare-0-5-production="${versionId}"`
    },
    body: JSON.stringify(payload(sessionId, ventureName))
  });
  const body = await response.json().catch(() => ({}));
  const continuity = response.headers.get('X-GalviVault-Day9-Continuity');
  const runtime = response.headers.get('X-GalviVault-Day9-Continuity-Runtime');
  if (response.status !== 200 || body?.success !== true || continuity !== 'attached' || runtime !== 'active') {
    throw new Error(`Production canary failed for ${ventureName}: HTTP ${response.status}; continuity=${continuity}; runtime=${runtime}; body=${JSON.stringify(body)}`);
  }
  return { session_id: sessionId, venture_name: ventureName, http_status: response.status, continuity, runtime };
}

const runs = [
  await submit(`gc_prod_e2e_${suffix}_a1`, primaryVenture),
  await submit(`gc_prod_e2e_${suffix}_a2`, primaryVenture),
  await submit(`gc_prod_e2e_${suffix}_b1`, secondaryVenture)
];

const result = { email, primary_venture: primaryVenture, secondary_venture: secondaryVenture, runs };
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, email: '[REDACTED_TEST_IDENTITY]' }, null, 2));
