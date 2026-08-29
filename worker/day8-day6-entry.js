import day8Worker from './day8-entry.js';
import { GVError, context, failure, headers } from './day5-common.js';
import { requireClinicianIdentity, asLegacyOperatorHeaders } from './auth/operator-identity.js';
import { handleDay6StudioRoute } from './routes/day6-studio.js';

const isDay6 = (path) => path.startsWith('/api/v1/day6/');

const worker = {
  async fetch(request, env, executionContext) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (!isDay6(path)) return day8Worker.fetch(request, env, executionContext);

    const ctx = context(request, env);
    try {
      if (ctx.origin && ctx.origin !== url.origin && !ctx.allowedOrigins.includes(ctx.origin)) {
        throw new GVError('GV_CORS_DENIED', 'The request origin is not allowed.', 403);
      }
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: headers(ctx) });
      }

      const identity = await requireClinicianIdentity(request, env);
      const secured = asLegacyOperatorHeaders(request, identity);
      const response = await handleDay6StudioRoute(secured, env, ctx, path);
      if (response) {
        const h = new Headers(response.headers);
        h.set('X-Galvi-Day6-Clinician-Bridge', 'v1');
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
      }
      throw new GVError('GV_NOT_FOUND', 'Day 6 clinician route was not found.', 404);
    } catch (error) {
      return failure(ctx, error);
    }
  }
};

export default worker;
