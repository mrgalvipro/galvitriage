import coreWorker from './worker.js';

const HUBSPOT_BASE = 'https://api.hubapi.com';
const HUBSPOT_TIMEOUT_MS = 5000;

function isQa(env = {}) {
  const value = String(env.ENVIRONMENT || env.APP_ENV || 'qa').trim().toLowerCase();
  return value === 'qa';
}

function hubspotConfigured(env = {}) {
  return isQa(env) && String(env.HUBSPOT_ENABLED || '').toLowerCase() === 'true' && Boolean(String(env.HUBSPOT_PRIVATE_APP_TOKEN || '').trim());
}

function safeString(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function buildProperties(payload = {}) {
  const founder = payload.founder || {};
  const venture = payload.venture || {};
  const properties = {
    email: safeString(founder.email, 320).toLowerCase(),
    firstname: safeString(founder.first_name, 120),
    lastname: safeString(founder.last_name, 120),
    phone: safeString(founder.phone, 80),
    company: safeString(venture.venture_name, 250),
    website: safeString(venture.website, 500),
    galvicare_environment: 'qa',
    galvicare_test_record: 'true'
  };

  for (const [key, value] of Object.entries(properties)) {
    if (value === '') delete properties[key];
  }
  return properties;
}

async function hubspotFetch(env, path, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HUBSPOT_TIMEOUT_MS);
  try {
    return await fetch(`${HUBSPOT_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.HUBSPOT_PRIVATE_APP_TOKEN}`,
        'Content-Type': 'application/json',
        ...(init.headers || {})
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response) {
  try { return await response.json(); } catch { return {}; }
}

async function trace(env, sessionId, eventName, status, externalId = null) {
  if (!env.DB || !sessionId) return;
  try {
    await env.DB.prepare(
      `INSERT INTO integration_trace(session_id,integration,event_name,status,environment,external_id,created_at)
       VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP)`
    ).bind(sessionId, 'hubspot', eventName, status, 'qa', externalId).run();
  } catch (error) {
    console.error('Day7C HubSpot trace write failed', error?.message || error);
  }
}

async function upsertHubSpotContact(env, payload, sessionId) {
  if (!hubspotConfigured(env)) {
    await trace(env, sessionId, 'contact_upsert', 'skipped');
    return { attempted: false, success: false, status: 'skipped' };
  }

  const properties = buildProperties(payload);
  const email = properties.email;
  if (!email) {
    await trace(env, sessionId, 'contact_upsert', 'skipped');
    return { attempted: false, success: false, status: 'missing_email' };
  }

  try {
    const lookup = await hubspotFetch(
      env,
      `/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&properties=email`,
      { method: 'GET' }
    );

    if (lookup.ok) {
      const existing = await readJson(lookup);
      const contactId = safeString(existing.id, 100);
      const update = await hubspotFetch(
        env,
        `/crm/v3/objects/contacts/${encodeURIComponent(contactId)}`,
        { method: 'PATCH', body: JSON.stringify({ properties }) }
      );
      const updated = await readJson(update);
      if (!update.ok) throw new Error(`HubSpot update failed (${update.status}): ${safeString(updated.message || updated.category || 'unknown error', 500)}`);
      const externalId = safeString(updated.id || contactId, 100);
      await trace(env, sessionId, 'contact_upsert', 'delivered', externalId);
      return { attempted: true, success: true, operation: 'update', contact_id: externalId };
    }

    if (lookup.status !== 404) {
      const lookupError = await readJson(lookup);
      throw new Error(`HubSpot lookup failed (${lookup.status}): ${safeString(lookupError.message || lookupError.category || 'unknown error', 500)}`);
    }

    const create = await hubspotFetch(
      env,
      '/crm/v3/objects/contacts',
      { method: 'POST', body: JSON.stringify({ properties }) }
    );
    const created = await readJson(create);
    if (!create.ok) throw new Error(`HubSpot create failed (${create.status}): ${safeString(created.message || created.category || 'unknown error', 500)}`);
    const externalId = safeString(created.id, 100);
    await trace(env, sessionId, 'contact_upsert', 'delivered', externalId);
    return { attempted: true, success: true, operation: 'create', contact_id: externalId };
  } catch (error) {
    const status = error?.name === 'AbortError' ? 'timeout' : 'failed';
    await trace(env, sessionId, 'contact_upsert', status);
    console.error('Day7C HubSpot sync failed', error?.message || error);
    return { attempted: true, success: false, status };
  }
}

async function maybeAugmentHealth(request, env, coreResponse) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || !['/', '/health'].includes(url.pathname)) return coreResponse;

  try {
    const body = await coreResponse.clone().json();
    body.hubspot_enabled = String(env.HUBSPOT_ENABLED || '').toLowerCase() === 'true';
    body.hubspot_credential_present = Boolean(String(env.HUBSPOT_PRIVATE_APP_TOKEN || '').trim());
    body.day7c_hubspot_adapter = 'day7c-hubspot-upsert-v1';
    const headers = new Headers(coreResponse.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify(body), { status: coreResponse.status, headers });
  } catch {
    return coreResponse;
  }
}

export default {
  async fetch(request, env, ctx) {
    let payload = null;
    if (request.method === 'POST' && new URL(request.url).pathname === '/api') {
      try { payload = await request.clone().json(); } catch { payload = null; }
    }

    const coreResponse = await coreWorker.fetch(request, env, ctx);
    const action = safeString(payload?.action, 100);

    if (action === 'submit_triage' && coreResponse.ok) {
      try {
        const coreBody = await coreResponse.clone().json();
        if (coreBody?.success === true) {
          const sessionId = safeString(coreBody.session_id || payload?.session_id || payload?.session?.session_id, 200);
          await upsertHubSpotContact(env, payload || {}, sessionId);
        }
      } catch (error) {
        console.error('Day7C HubSpot post-submit adapter failed', error?.message || error);
      }
    }

    return maybeAugmentHealth(request, env, coreResponse);
  }
};
