import governedDay3 from './day3-customer-session.js';
import customerEvidenceApi from './day7d-day3-critical-path.js';

/*
 * GalviCare 1.0 Day 3 unified QA entrypoint.
 *
 * The governed Day 3 Worker is the stable customer-intelligence boundary:
 * - /api serves GalviScore clarification + GalviShot/Sight/Path customer evidence.
 * - /api/v1/day3/* serves governed GalviEngine/OpenAI reasoning.
 * - /health remains the governed Day 3 readiness/capability surface.
 *
 * This deliberately removes Day 3 customer-evidence requests from the mutable
 * legacy galvicare-triage-intake runtime without changing deterministic
 * GalviTriage/GalviVitals/GalviScore arithmetic or creating a new Worker/DB.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (path === '/api' && (request.method === 'POST' || request.method === 'OPTIONS')) {
      return customerEvidenceApi.fetch(request, env, ctx);
    }

    return governedDay3.fetch(request, env, ctx);
  }
};
