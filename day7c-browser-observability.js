// GalviCare 0.5 Day 7C QA observability contract.
// Browser telemetry contains operational identifiers only; no clinical/free-text payloads.
export const DAY7C_QA_OBSERVABILITY = Object.freeze({
  environment: 'qa',
  ga4_measurement_id: 'G-V5ZPM5L19T',
  clarity_project_id: 'xswd8m446z',
  calendly_url: 'https://calendly.com/galvilpro/galviclinic-day7c-qa',
  hubspot_enabled: true,
  pii_policy: 'no_free_text_in_browser_analytics'
});

export function sanitizeDay7CAnalytics(payload = {}) {
  const blocked = new Set([
    'name','email','phone','first_name','last_name','website','linkedin_url',
    'biggest_challenge','one_30_day_problem','growth_blocker','feels_broken','keeps_up_at_night'
  ]);
  return Object.fromEntries(Object.entries(payload).filter(([key]) => !blocked.has(key)));
}
