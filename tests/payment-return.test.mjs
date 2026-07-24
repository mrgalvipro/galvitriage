import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../worker/worker.js';

class MockStmt {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.params = [];
  }
  bind(...params) {
    this.params = params;
    return this;
  }
  async run() {
    return this.db.run(this.sql, this.params);
  }
  async first() {
    return this.db.first(this.sql, this.params);
  }
  async all() {
    return { results: this.db.all(this.sql, this.params) };
  }
}

class MockD1 {
  constructor() {
    this.sessions = new Map();
    this.payments = new Map();
    this.entitlements = new Map();
    this.results = new Map();
  }

  prepare(sql) {
    return new MockStmt(this, sql);
  }

  findPaymentById(paymentId) {
    for (const row of this.payments.values()) {
      if (row?.payment_id === paymentId) return row;
    }
    return null;
  }

  findEntitlementById(entitlementId) {
    for (const row of this.entitlements.values()) {
      if (row?.entitlement_id === entitlementId) return row;
    }
    return null;
  }

  async run(sql, p) {
    if (sql.includes('INSERT INTO payments')) {
      const row = {
        payment_id: p[0],
        session_id: p[1],
        product: p[2],
        stripe_session_id: p[3],
        stripe_payment_intent_id: p[4],
        amount_cents: p[5],
        currency: p[6],
        payment_status: p[7],
        paid_at: p[8],
        created_at: p[9],
        updated_at: p[10]
      };
      this.payments.set(row.stripe_session_id, row);
      this.payments.set(`${row.session_id}:${row.product}`, row);
      return { success: true };
    }

    if (sql.includes('UPDATE payments')) {
      const row = this.findPaymentById(p[7]);
      if (!row) throw new Error(`Payment not found for update: ${p[7]}`);
      const oldSessionProductKey = `${row.session_id}:${row.product}`;
      row.session_id = p[0];
      row.product = p[1];
      row.stripe_payment_intent_id = p[2];
      row.amount_cents = p[3];
      row.currency = p[4];
      row.payment_status = 'paid';
      row.paid_at ||= p[5];
      row.updated_at = p[6];
      this.payments.delete(oldSessionProductKey);
      this.payments.set(row.stripe_session_id, row);
      this.payments.set(`${row.session_id}:${row.product}`, row);
      return { success: true };
    }

    if (sql.includes('INSERT INTO entitlements')) {
      const row = {
        entitlement_id: p[0],
        session_id: p[1],
        product: p[2],
        entitlement_status: p[3],
        source: p[4],
        source_reference: p[5],
        granted_at: p[6],
        updated_at: p[7]
      };
      this.entitlements.set(`${row.session_id}:${row.product}`, row);
      return { success: true };
    }

    if (sql.includes('UPDATE entitlements')) {
      const row = this.findEntitlementById(p[3]);
      if (!row) throw new Error(`Entitlement not found for update: ${p[3]}`);
      row.entitlement_status = 'active';
      row.source = 'stripe_checkout';
      row.source_reference = p[0];
      row.granted_at ||= p[1];
      row.updated_at = p[2];
      this.entitlements.set(`${row.session_id}:${row.product}`, row);
      return { success: true };
    }

    if (sql.includes('UPDATE sessions')) {
      const row = this.sessions.get(p[3]);
      if (!row) throw new Error(`Session not found for update: ${p[3]}`);
      row.current_stage = p[0];
      row.updated_at = p[1];
      row.last_seen_at = p[2];
      this.sessions.set(row.session_id, row);
      return { success: true };
    }

    throw new Error(`Unhandled SQL run: ${sql}`);
  }

  async first(sql, p) {
    if (sql.includes('FROM sessions')) {
      return this.sessions.get(p[0]) || null;
    }
    if (sql.includes('FROM payments') && sql.includes('stripe_session_id=?')) {
      return this.payments.get(p[0]) || null;
    }
    if (sql.includes('FROM payments')) {
      return this.payments.get(`${p[0]}:${p[1]}`) || null;
    }
    if (sql.includes('FROM entitlements')) {
      return this.entitlements.get(`${p[0]}:${p[1]}`) || null;
    }
    if (sql.includes('FROM product_results')) {
      return this.results.get(`${p[0]}:${p[1]}`) || null;
    }
    throw new Error(`Unhandled SQL first: ${sql}`);
  }

  all() {
    return [];
  }
}

function req(body) {
  return new Request('https://worker.test/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function json(response) {
  return response.json();
}

async function withStripe(session, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /https:\/\/api\.stripe\.com\/v1\/checkout\/sessions\/cs_/);
    assert.equal(init.headers.Authorization, 'Bearer sk_test_mock');
    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
  try {
    return await fn();
  } finally {
    globalThis.fetch = original;
  }
}

test('Stripe checkout launches carry GalviCare session correlation', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /stripeCheckoutUrl\(GALVISCORE_STRIPE_PAYMENT_LINK,sessionId\)/);
  assert.match(html, /stripeCheckoutUrl\(GSHOT\.PAYMENT_LINK,sessionId\(\)\)/);
  assert.match(html, /checkoutUrl\.searchParams\.set\('client_reference_id',sessionId\)/);
});

test('Worker resolves paid Stripe return to authoritative GalviCare session and persists entitlement idempotently', async () => {
  const db = new MockD1();
  db.sessions.set('gt_paid_123', {
    session_id: 'gt_paid_123',
    current_stage: 'GalviScore Paywall'
  });
  const env = { DB: db, STRIPE_SECRET_KEY: 'sk_test_mock' };

  await withStripe({
    id: 'cs_test_paid',
    payment_status: 'paid',
    status: 'complete',
    client_reference_id: 'gt_paid_123',
    metadata: { product: 'galviscore' },
    payment_intent: 'pi_123',
    amount_total: 4900,
    currency: 'usd'
  }, async () => {
    const response = await worker.fetch(req({
      action: 'resolve_payment_return',
      payload: {
        stripe_session_id: 'cs_test_paid',
        expected_product: 'galviscore'
      }
    }), env);
    const body = await json(response);

    assert.equal(response.status, 200);
    assert.equal(body.status, 'paid');
    assert.equal(body.session_id, 'gt_paid_123');
    assert.equal(body.product, 'GalviScore');
    assert.equal(db.entitlements.get('gt_paid_123:GalviScore').entitlement_status, 'active');
    assert.equal(db.payments.get('cs_test_paid').session_id, 'gt_paid_123');
    assert.equal(db.sessions.get('gt_paid_123').current_stage, 'GalviScore Paid');

    const replay = await worker.fetch(req({
      action: 'resolve_payment_return',
      payload: {
        stripe_session_id: 'cs_test_paid',
        expected_product: 'galviscore'
      }
    }), env);

    assert.equal(replay.status, 200);
    assert.equal(db.entitlements.size, 1);
    assert.equal(db.payments.get('cs_test_paid').session_id, 'gt_paid_123');
  });
});

test('Worker denies unpaid, missing session, and wrong-product Stripe returns', async () => {
  let db = new MockD1();
  db.sessions.set('gt_paid_123', { session_id: 'gt_paid_123' });
  let env = { DB: db, STRIPE_SECRET_KEY: 'sk_test_mock' };

  await withStripe({
    id: 'cs_test_unpaid',
    payment_status: 'unpaid',
    status: 'open',
    client_reference_id: 'gt_paid_123',
    metadata: { product: 'galviscore' }
  }, async () => {
    const response = await worker.fetch(req({
      action: 'resolve_payment_return',
      payload: {
        stripe_session_id: 'cs_test_unpaid',
        expected_product: 'galviscore'
      }
    }), env);
    assert.equal(response.status, 402);
  });

  await withStripe({
    id: 'cs_test_missing',
    payment_status: 'paid',
    status: 'complete',
    client_reference_id: 'gt_missing',
    metadata: { product: 'galviscore' }
  }, async () => {
    const response = await worker.fetch(req({
      action: 'resolve_payment_return',
      payload: {
        stripe_session_id: 'cs_test_missing',
        expected_product: 'galviscore'
      }
    }), env);
    const body = await json(response);
    assert.equal(response.status, 404);
    assert.equal(body.status, 'session_not_found');
  });

  await withStripe({
    id: 'cs_test_wrong',
    payment_status: 'paid',
    status: 'complete',
    client_reference_id: 'gt_paid_123',
    metadata: { product: 'galvishot' }
  }, async () => {
    const response = await worker.fetch(req({
      action: 'resolve_payment_return',
      payload: {
        stripe_session_id: 'cs_test_wrong',
        expected_product: 'galviscore'
      }
    }), env);
    assert.equal(response.status, 409);
  });
});

test('Frontend paid return uses Worker resolver before restoring results and never uses Triage repair for missing localStorage', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /resolveStripePaymentReturn\(stripeSessionId,'galviscore'\)[\s\S]*persistSessionId\(resolved\.session_id\)[\s\S]*renderGalviScoreAfterPayment\(paidSessionId\)/);
  assert.match(html, /resolveStripePaymentReturn\(stripeSessionId,'galvishot'\)[\s\S]*persistSessionId\(resolved\.session_id\)[\s\S]*showIntegratedGalviShotResult/);
  const route = html.match(/async function routeGalviCareOnLoad\(\)[\s\S]*?function hasValidGalviScoreResult/)[0];
  assert.doesNotMatch(route, /renderTriageRepair/);
  assert.doesNotMatch(route, /galviSessionId/);
});

test('Day 6 paid GalviScore return preserves original GalviCare session through restoration', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const route = html.match(/if\(product==='galviscore'&&paid==='score_success'\)[\s\S]*?return true; \}\} if\(await restoreGalviCareSession/)?.[0];
  assert.ok(route, 'GalviScore paid return route must be present');
  assert.match(route, /resolveStripePaymentReturn\(stripeSessionId,'galviscore'\)[\s\S]*const paidSessionId=persistSessionId\(resolved\.session_id\)[\s\S]*renderGalviScoreAfterPayment\(paidSessionId\)/);
  assert.doesNotMatch(route, /getOrCreateSessionId\(|startNewGalviCareAssessment\(/);
  const render = html.match(/async function renderGalviScoreAfterPayment\(sessionId\)[\s\S]*?async function routeGalviCareOnLoad/)?.[0];
  assert.ok(render, 'paid result renderer must be present');
  assert.match(render, /const canonicalSessionId=persistSessionId\(sessionId\)/);
  assert.match(render, /restoreGalviScoreFromWorker\(canonicalSessionId\)/);
  assert.doesNotMatch(render, /getOrCreateSessionId\(|startNewGalviCareAssessment\(/);
});
