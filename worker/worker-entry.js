import worker from './worker.js';

function bindWithFounderResolution(db, state, sql, params) {
  const normalizedSql = String(sql || '').replace(/\s+/g, ' ').trim().toLowerCase();

  if (normalizedSql.startsWith('insert or ignore into founders')) {
    return {
      async run() {
        const requestedFounderId = params[0];
        const email = String(params[4] || '').trim().toLowerCase();

        if (email) {
          const existing = await db
            .prepare('SELECT founder_id FROM founders WHERE lower(email)=? LIMIT 1')
            .bind(email)
            .first();

          if (existing?.founder_id) {
            state.founderId = existing.founder_id;
            return { success: true, meta: { changes: 0 } };
          }
        }

        const result = await db.prepare(sql).bind(...params).run();
        state.founderId = requestedFounderId;
        return result;
      }
    };
  }

  if (normalizedSql.startsWith('insert into ventures') && state.founderId) {
    const resolvedParams = [...params];
    resolvedParams[2] = state.founderId;
    return db.prepare(sql).bind(...resolvedParams);
  }

  return db.prepare(sql).bind(...params);
}

function createRequestDb(db) {
  const state = { founderId: null };

  return new Proxy(db, {
    get(target, property) {
      if (property === 'prepare') {
        return (sql) => ({
          bind: (...params) => bindWithFounderResolution(target, state, sql, params)
        });
      }

      const value = target[property];
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const requestEnv = env.DB
      ? { ...env, DB: createRequestDb(env.DB) }
      : env;

    return worker.fetch(request, requestEnv, ctx);
  }
};
