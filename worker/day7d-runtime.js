import day7dWorker, { persistContext, DAY7D_RULES_VERSION, DAY7D_QUESTION_VERSION } from './day7d-engine.js';

const DAY7D_ACTIONS = new Set([
  'evaluate_galvishot','save_galvishot_followup','get_or_create_galvishot','get_galvishot','generate_galvishot',
  'evaluate_galvisight_readiness','evaluate_galvisight','save_galvisight_followup','get_or_generate_galvisight',
  'evaluate_galvipath','save_galvipath_followup','get_or_generate_galvipath','get_galvipath'
]);

function rewriteSql(sql) {
  return String(sql)
    .replace(/\bclinical_evidence\b/g, 'day7d_context_evidence')
    .replace(/\bclinical_observations\b/g, 'day7d_observations');
}

function day7dDb(db) {
  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === 'prepare') {
        return (sql) => target.prepare(rewriteSql(sql));
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
      'X-Galvi-Day7D-Rules': DAY7D_RULES_VERSION
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/api') {
      return day7dWorker.fetch(request, env, ctx);
    }

    let payload;
    try {
      payload = await request.clone().json();
    } catch {
      return day7dWorker.fetch(request, env, ctx);
    }

    const action = String(payload?.action || '').trim();

    if (action === 'health_check') {
      const response = await day7dWorker.fetch(request, env, ctx);
      let body = {};
      try { body = await response.clone().json(); } catch {}
      return json({
        ...body,
        day7d: {
          enabled: true,
          rules_version: DAY7D_RULES_VERSION,
          question_version: DAY7D_QUESTION_VERSION,
          entrypoint: 'worker/day7d-runtime.js',
          schema_adapter: 'day7d_dedicated_tables_v1'
        }
      }, response.status);
    }

    if (action === 'submit_triage') {
      // Preserve the already-accepted Day 1–7C submit path against its original schema.
      const response = await day7dWorker.fetch(request.clone(), env, ctx);
      if (response.ok && env.DB) {
        const sid = String(payload?.session_id || payload?.session?.session_id || '').trim();
        if (sid) {
          try {
            await persistContext(day7dDb(env.DB), sid, payload);
          } catch (error) {
            console.error('Day 7D context persistence failed', error?.message || error);
          }
        }
      }
      return response;
    }

    if (!DAY7D_ACTIONS.has(action)) {
      return day7dWorker.fetch(request, env, ctx);
    }

    if (!env.DB) {
      return json({success:false,status:'error',action,message:'D1 binding DB is not configured'},500);
    }

    try {
      // Only Day 7D intelligence actions receive the schema adapter. Legacy Day 1–7C
      // actions continue to use their original clinical_evidence/clinical_observations tables.
      return await day7dWorker.fetch(request, {...env, DB: day7dDb(env.DB)}, ctx);
    } catch (error) {
      console.error('Day 7D runtime error', action, error?.stack || error?.message || error);
      return json({
        success:false,
        status:'error',
        action,
        error_code:'DAY7D_RUNTIME_ERROR',
        message:'Day 7D customer-intelligence processing failed safely.',
        detail:String(error?.message || error || 'unknown error')
      },500);
    }
  }
};
