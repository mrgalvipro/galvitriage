export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/__qa_health') {
      const body = {
        success: true,
        service: 'GalviCare QA Frontend',
        environment: 'qa',
        frontend: 'galvicare-0-5-qa',
        d1_binding: Boolean(env.D1),
        d1_query: false,
        progressive_customer_intelligence: true,
        api_worker: 'galvicare-triage-intake'
      };

      if (!env.D1) {
        return Response.json({...body, success:false, error:'D1 binding is absent'}, {status:500});
      }

      try {
        const result = await env.D1.prepare('SELECT 1 AS ok').first();
        body.d1_query = Number(result?.ok) === 1;
      } catch (error) {
        return Response.json({...body, success:false, error:String(error?.message||error)}, {status:500});
      }

      return Response.json(body, {
        status: body.d1_query ? 200 : 500,
        headers: {'Cache-Control':'no-store'}
      });
    }

    if (!env.ASSETS) {
      return new Response('QA frontend assets binding is unavailable.', {status:500});
    }
    return env.ASSETS.fetch(request);
  }
};
