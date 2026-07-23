import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import worker from '../worker/worker.js';

class MockStmt{constructor(db,sql){this.db=db;this.sql=sql}bind(...p){this.p=p;return this}async run(){return this.db.run(this.sql,this.p)}async first(){return this.db.first(this.sql,this.p)}async all(){return{results:this.db.all(this.sql,this.p)}}}
class MockD1{constructor(){this.payments=new Map();this.entitlements=new Map();this.results=new Map();this.clinics=new Map();this.bookings=new Map();this.events=[];this.errors=[];this.stripeEvents=new Set()}prepare(sql){return new MockStmt(this,sql)}async run(sql,p){
 if(sql.includes('INSERT INTO payments')){const row={payment_id:p[0],session_id:p[1],product:p[2],stripe_session_id:p[3],payment_status:p[7]};this.payments.set(p[3],row);return{success:true}}
 if(sql.includes('INSERT INTO entitlements')){this.entitlements.set(`${p[1]}:${p[2]}`,{session_id:p[1],product:p[2],entitlement_status:p[3]});return{success:true}}
 if(sql.includes('INSERT INTO clinic_records')){if(!this.clinics.has(`${p[1]}:${p[2]}`))this.clinics.set(`${p[1]}:${p[2]}`,{clinic_record_id:p[0],session_id:p[1],product:p[2],booking_status:p[9],pathway_code:p[5],clinic_status:p[8]});return{success:true}}
 if(sql.includes('INSERT INTO clinic_bookings')){this.bookings.set(`${p[1]}:${p[2]}:${p[5]}`,{booking_id:p[0],session_id:p[1],clinic_record_id:p[2],booking_status:p[5],booking_url:p[6]});return{success:true}}
 if(sql.includes('UPDATE clinic_records')){for(const c of this.clinics.values())if(c.clinic_record_id===p[2])c.booking_status=p[0];return{success:true}}
 if(sql.includes('INSERT INTO journey_events')){this.events.push({session_id:p[1],event_name:p[2],product:p[3]});return{success:true}}
 if(sql.includes('INSERT INTO system_errors')){this.errors.push({session_id:p[1],action:p[2],error_code:p[3]});return{success:true}}
 if(sql.includes('INSERT OR IGNORE INTO stripe_events')){if(!this.stripeEvents.has(p[0]))this.stripeEvents.add(p[0]);return{success:true}}
 throw new Error(`Unhandled run ${sql}`)}
 async first(sql,p){if(sql.includes('FROM entitlements'))return this.entitlements.get(`${p[0]}:${p[1]}`)||null;if(sql.includes('FROM clinic_records'))return this.clinics.get(`${p[0]}:${p[1]}`)||null;if(sql.includes('FROM product_results'))return this.results.get(`${p[0]}:${p[1]}`)||null;throw new Error(`Unhandled first ${sql}`)}all(){return[]}}
const req=(body,path='/api')=>new Request(`https://worker.test${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function env(db,overrides={}){return{DB:db,STRIPE_SECRET_KEY:'sk_test_unit',STRIPE_GALVICLINIC_PRICE_ID:'price_clinic',STRIPE_WEBHOOK_SECRET:'whsec_unit',...overrides}}
function stripeSession(id,{session='s1',status='paid',price='price_clinic'}={}){return{id,client_reference_id:session,payment_status:status,status:'complete',amount_total:50000,currency:'usd',payment_intent:`pi_${id}`,line_items:{data:[{price:{id:price}}]},metadata:{galvicare_session_id:session}}}
async function json(res){return res.json()}
async function signedWebhook(event){const raw=JSON.stringify(event);const t='1';const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('whsec_unit'),{name:'HMAC',hash:'SHA-256'},false,['sign']);const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${t}.${raw}`));const v1=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');return new Request('https://worker.test/stripe/webhook',{method:'POST',headers:{'stripe-signature':`t=${t},v1=${v1}`},body:raw});}

function checkoutNavigationHelper() {
  const html = readFileSync(new URL('../public/embedded-checkout-fix.js', import.meta.url), 'utf8');
  const start = html.indexOf('function navigateToTopLevelCheckout(checkoutUrl)');
  assert.notEqual(start, -1);
  let depth = 0;
  let end = start;
  for (; end < html.length; end += 1) {
    const char = html[end];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) { end += 1; break; }
    }
  }
  return new Function('window', 'return (' + html.slice(start, end) + ');');
}

test('Day 5 verifies paid session and persists one payment and entitlement',async()=>{const db=new MockD1();const old=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify(stripeSession('cs_paid')),{status:200,headers:{'Content-Type':'application/json'}});try{let res=await worker.fetch(req({action:'verify_clinic_payment_return',session_id:'s1',stripe_session_id:'cs_paid',expected_product:'galviclinic'}),env(db));assert.equal(res.status,200);let body=await json(res);assert.equal(body.entitlement_status,'active');await worker.fetch(req({action:'verify_clinic_payment_return',session_id:'s1',stripe_session_id:'cs_paid',expected_product:'galviclinic'}),env(db));assert.equal(db.payments.size,1);assert.equal(db.entitlements.size,1);res=await worker.fetch(req({action:'get_clinic_entitlement',session_id:'s1'}),env(db));assert.equal(res.status,200)}finally{globalThis.fetch=old}});

test('Day 5 denies pending, failed, unknown product, client mismatch and wrong session',async()=>{const cases=[['pending',stripeSession('cs_pending',{status:'unpaid'}),200],['failed',stripeSession('cs_failed',{status:'failed'}),402],['unknown',stripeSession('cs_unknown',{price:'price_other'}),403],['wrong',stripeSession('cs_wrong',{session:'other'}),403]];for(const [,session,status]of cases){const db=new MockD1();const old=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify(session),{status:200,headers:{'Content-Type':'application/json'}});try{const res=await worker.fetch(req({action:'verify_clinic_payment_return',session_id:'s1',stripe_session_id:session.id,expected_product:'galviclinic'}),env(db));assert.equal(res.status,status)}finally{globalThis.fetch=old}}const db=new MockD1();const old=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify(stripeSession('cs_mismatch')),{status:200,headers:{'Content-Type':'application/json'}});try{const res=await worker.fetch(req({action:'verify_clinic_payment_return',session_id:'s1',stripe_session_id:'cs_mismatch',expected_product:'galvishot'}),env(db));assert.equal(res.status,403)}finally{globalThis.fetch=old}});

test('Day 5 webhook and return order are idempotent',async()=>{for(const order of ['webhook-return','return-webhook']){const db=new MockD1();const old=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify(stripeSession('cs_order')),{status:200,headers:{'Content-Type':'application/json'}});try{const webhook=async()=>worker.fetch(await signedWebhook({id:'evt_1',type:'checkout.session.completed',data:{object:stripeSession('cs_order')}}),env(db));const ret=()=>worker.fetch(req({action:'verify_clinic_payment_return',session_id:'s1',stripe_session_id:'cs_order',expected_product:'galviclinic'}),env(db));if(order==='webhook-return'){await webhook();await webhook();await ret()}else{await ret();await webhook();await webhook()}assert.equal(db.payments.size,1);assert.equal(db.entitlements.size,1);assert.equal(db.stripeEvents.size,1)}finally{globalThis.fetch=old}}});

test('Day 5 creates stable Clinic record, facilitator review, booking fallback, and bounded duplicate booking',async()=>{const db=new MockD1();db.entitlements.set('s1:galviclinic',{session_id:'s1',product:'galviclinic',entitlement_status:'active'});db.results.set('s1:GalviPath',{result_id:'r1',session_id:'s1',product:'GalviPath',confidence:90,result_json:JSON.stringify({primary_pathway:'Stabilize',source_references:['r1']})});let res=await worker.fetch(req({action:'get_or_create_clinic',session_id:'s1'}),env(db));assert.equal(res.status,200);let body=await json(res);assert.equal(body.clinic_record.clinic_record_id,'gclinic_s1');await worker.fetch(req({action:'get_or_create_clinic',session_id:'s1'}),env(db));assert.equal(db.clinics.size,1);res=await worker.fetch(req({action:'record_booking_click',session_id:'s1'}),env(db));body=await json(res);assert.equal(body.destination_url,'https://www.galvipro.com/#contact');await worker.fetch(req({action:'record_booking_click',session_id:'s1'}),env(db));assert.equal(db.bookings.size,1);const reviewDb=new MockD1();reviewDb.entitlements.set('low:galviclinic',{session_id:'low',product:'galviclinic',entitlement_status:'active'});reviewDb.results.set('low:GalviPath',{result_id:'r2',confidence:40,result_json:JSON.stringify({status:'needs_followup'})});res=await worker.fetch(req({action:'get_or_create_clinic',session_id:'low'}),env(reviewDb));body=await json(res);assert.equal(body.status,'facilitator_review')});

test('Day 5 HubSpot failure is non-blocking and browser has no secret or entitlement authority',async()=>{const db=new MockD1();const old=globalThis.fetch;globalThis.fetch=async(url)=>String(url).includes('stripe.com')?new Response(JSON.stringify(stripeSession('cs_hub')),{status:200,headers:{'Content-Type':'application/json'}}):new Response('{}',{status:500});try{const res=await worker.fetch(req({action:'verify_clinic_payment_return',session_id:'s1',stripe_session_id:'cs_hub',expected_product:'galviclinic'}),env(db,{HUBSPOT_ENABLED:'true',HUBSPOT_PRIVATE_APP_TOKEN:'token',HUBSPOT_TIMEOUT_MS:'250'}));assert.equal(res.status,200);assert.equal(db.entitlements.size,1);assert.equal(db.errors.length,1)}finally{globalThis.fetch=old}const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');for(const forbidden of ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','HUBSPOT_PRIVATE_APP_TOKEN','STRIPE_PRODUCT_MAP_JSON','stripe.webhooks','grantEntitlement','DIMENSION_WEIGHTS'])assert.equal(html.includes(forbidden),false);assert.ok(html.includes('verify_clinic_payment_return'));assert.ok(html.includes('record_booking_click'));assert.ok(html.includes('https://www.galvipro.com/#contact'))});


test('Day 5 browser uses top-level or new-tab Stripe checkout navigation and query-before-hash return URL',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const publicHtml=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');const fix=readFileSync(new URL('../public/embedded-checkout-fix.js',import.meta.url),'utf8');for (const candidate of [html, publicHtml]) assert.ok(candidate.includes('<script src="/embedded-checkout-fix.js"></script>'));assert.ok(fix.includes('function navigateToTopLevelCheckout(checkoutUrl)'));assert.ok(fix.includes("url.startsWith('https://buy.stripe.com/')"));assert.ok(fix.includes('window.location.assign(url)'));assert.equal(fix.includes('window.top.location.assign'),false);assert.ok(fix.includes("window.open("));assert.equal(fix.includes("'about:blank'"),false);assert.ok(fix.includes("'_blank'"));assert.ok(fix.includes("'noopener,noreferrer'"));assert.equal(fix.includes('checkoutWindow.location.replace(url)'),false);assert.ok(fix.includes("navigation: 'top_navigation'"));assert.ok(fix.includes("navigation: 'new_tab'"));assert.ok(fix.includes('Checkout could not open. Please allow pop-ups and try again.'));assert.equal(html.includes('window.location.href=GSHOT.PAYMENT_LINK'),false);assert.equal(html.includes('window.location.href=GALVISCORE_STRIPE_PAYMENT_LINK'),false);assert.ok(html.includes('new URLSearchParams(location.search)'));assert.ok(html.includes('verify_clinic_payment_return'));const successUrl='https://galvipro.com/?paid=clinic_success&stripe_session_id={CHECKOUT_SESSION_ID}#galvitriage';assert.equal(new URL(successUrl).searchParams.get('paid'),'clinic_success');assert.equal(new URL(successUrl).searchParams.get('stripe_session_id'),'{CHECKOUT_SESSION_ID}');assert.equal(new URL(successUrl).hash,'#galvitriage');});

test('Day 5 checkout navigation uses top-level navigation outside frames and new-tab navigation inside frames',()=>{
test('Day 5 browser uses top-level or new-tab Stripe checkout navigation and query-before-hash return URL',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const publicHtml=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');const fix=readFileSync(new URL('../public/embedded-checkout-fix.js',import.meta.url),'utf8');for (const candidate of [html, publicHtml]) assert.ok(candidate.includes('<script src="/embedded-checkout-fix.js"></script>'));assert.ok(fix.includes('function navigateToTopLevelCheckout(checkoutUrl)'));assert.ok(fix.includes("url.startsWith('https://buy.stripe.com/')"));assert.ok(fix.includes('window.location.assign(url)'));assert.equal(fix.includes('window.top.location.assign'),false);assert.ok(fix.includes("window.open("));assert.ok(fix.includes("'about:blank'"));assert.ok(fix.includes("'_blank'"));assert.ok(fix.includes("'noopener,noreferrer'"));assert.ok(fix.includes('checkoutWindow.location.replace(url)'));assert.ok(fix.includes("navigation: 'top_navigation'"));assert.ok(fix.includes("navigation: 'new_tab'"));assert.ok(fix.includes('Checkout could not open. Please allow pop-ups and try again.'));assert.equal(html.includes('window.location.href=GSHOT.PAYMENT_LINK'),false);assert.equal(html.includes('window.location.href=GALVISCORE_STRIPE_PAYMENT_LINK'),false);assert.ok(html.includes('new URLSearchParams(location.search)'));assert.ok(html.includes('verify_clinic_payment_return'));const successUrl='https://galvipro.com/?paid=clinic_success&stripe_session_id={CHECKOUT_SESSION_ID}#galvitriage';assert.equal(new URL(successUrl).searchParams.get('paid'),'clinic_success');assert.equal(new URL(successUrl).searchParams.get('stripe_session_id'),'{CHECKOUT_SESSION_ID}');assert.equal(new URL(successUrl).hash,'#galvitriage');});

test('Day 5 checkout navigation uses top-level navigation outside frames and blank-tab navigation inside frames',()=>{
test('Day 5 browser uses new-tab Stripe checkout navigation and query-before-hash return URL',()=>{const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');const publicHtml=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');const fix=readFileSync(new URL('../public/embedded-checkout-fix.js',import.meta.url),'utf8');for (const candidate of [html, publicHtml]) assert.ok(candidate.includes('<script src="/embedded-checkout-fix.js"></script>'));assert.ok(fix.includes('function navigateToTopLevelCheckout(checkoutUrl)'));assert.ok(fix.includes("url.startsWith('https://buy.stripe.com/')"));assert.equal(fix.includes('window.location.assign'),false);assert.equal(fix.includes('window.top.location.assign'),false);assert.ok(fix.includes("window.open('about:blank', '_blank')"));assert.ok(fix.includes('checkoutWindow.location.replace(url)'));assert.ok(fix.includes("navigation: 'new_tab'"));assert.ok(fix.includes('Stripe Checkout was blocked. Please allow pop-ups for GalviCare and try again.'));assert.equal(html.includes('window.location.href=GSHOT.PAYMENT_LINK'),false);assert.equal(html.includes('window.location.href=GALVISCORE_STRIPE_PAYMENT_LINK'),false);assert.ok(html.includes('new URLSearchParams(location.search)'));assert.ok(html.includes('verify_clinic_payment_return'));const successUrl='https://galvipro.com/?paid=clinic_success&stripe_session_id={CHECKOUT_SESSION_ID}#galvitriage';assert.equal(new URL(successUrl).searchParams.get('paid'),'clinic_success');assert.equal(new URL(successUrl).searchParams.get('stripe_session_id'),'{CHECKOUT_SESSION_ID}');assert.equal(new URL(successUrl).hash,'#galvitriage');});

test('Day 5 checkout navigation opens a blank tab synchronously before redirecting',()=>{
  const makeHelper = checkoutNavigationHelper();
  assert.throws(() => makeHelper({}).call(null, 'https://example.com/checkout'), /Invalid Stripe Checkout URL/);

  const topCalls = [];
  const topWindow = { location: { assign: url => topCalls.push(url) } };
  topWindow.top = topWindow;
  topWindow.self = topWindow;
  topWindow.open = () => { throw new Error('top-level flow should not open a tab'); };
  assert.deepEqual(makeHelper(topWindow)('https://buy.stripe.com/test_safe'), { navigation: 'top_navigation' });
  assert.deepEqual(topCalls, ['https://buy.stripe.com/test_safe']);

  const calls = [];
  const openedWindow = {
    set opener(value) { calls.push(['opener', value]); }
  };
  const iframeWindow = {
    self: {},
    top: {},
    open: (url, target, features) => { calls.push(['open', url, target, features]); return openedWindow; }
  };
  assert.deepEqual(makeHelper(iframeWindow)('https://buy.stripe.com/test_safe'), { navigation: 'new_tab' });
  assert.deepEqual(calls, [
    ['open', 'https://buy.stripe.com/test_safe', '_blank', 'noopener,noreferrer'],
    ['opener', null]
    set opener(value) { calls.push(['opener', value]); },
    location: { replace: url => calls.push(['replace', url]) }
  };
  const iframeWindow = {
    self: {},
    top: {},
    open: (url, target, features) => { calls.push(['open', url, target, features]); return openedWindow; }
  };
  assert.deepEqual(makeHelper(iframeWindow)('https://buy.stripe.com/test_safe'), { navigation: 'new_tab' });
  assert.deepEqual(calls, [
    ['open', 'about:blank', '_blank', 'noopener,noreferrer'],
  };
  const mockWindow = {
    open: (url, target) => { calls.push(['open', url, target]); return openedWindow; }
  };
  assert.deepEqual(makeHelper(mockWindow)('https://buy.stripe.com/test_safe'), { success: true, navigation: 'new_tab' });
  assert.deepEqual(calls, [
    ['open', 'about:blank', '_blank'],
    ['opener', null],
    ['replace', 'https://buy.stripe.com/test_safe']
  ]);

  const blockedWindow = { self: {}, top: {}, open: () => null };
  assert.throws(() => makeHelper(blockedWindow)('https://buy.stripe.com/test_blocked'), /Checkout could not open/);
  const blockedWindow = { open: () => null };
  assert.throws(() => makeHelper(blockedWindow)('https://buy.stripe.com/test_blocked'), /Stripe Checkout was blocked/);
});

test('Day 5 Cloudflare static assets are configured and frontend copies stay QA-safe',()=>{
  const rootHtml=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const publicUrl=new URL('../public/index.html',import.meta.url);
  assert.equal(existsSync(publicUrl),true);
  const publicHtml=readFileSync(publicUrl,'utf8');
  assert.equal(publicHtml,rootHtml);
  const wrangler=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
  assert.equal(wrangler.assets.directory,'./public');
  assert.equal(wrangler.assets.binding,'ASSETS');
  for (const html of [rootHtml, publicHtml]) {
    assert.equal(/id=["']galviscore[^"']*qa[^"']*override/i.test(html),false);
    assert.equal(/id=["']qa[^"']*override[^"']*galviscore/i.test(html),false);
  }
});

test('Day 5 Worker keeps API and webhook POST routing with static assets binding',async()=>{
  const db=new MockD1();
  const assetCalls=[];
  const assets={fetch:async request=>{assetCalls.push(request.url);return new Response('<!doctype html><title>asset</title>',{headers:{'Content-Type':'text/html'}})}};
  let res=await worker.fetch(new Request('https://worker.test/',{method:'GET',headers:{accept:'text/html'}}),env(db,{ASSETS:assets}));
  assert.equal(res.status,200);
  assert.equal(await res.text(),'<!doctype html><title>asset</title>');
  assert.deepEqual(assetCalls,['https://worker.test/']);
  res=await worker.fetch(req({action:'get_clinic_entitlement',session_id:'missing'}),env(db,{ASSETS:assets}));
  assert.notEqual(res.status,404);
  assert.equal(assetCalls.length,1);
  res=await worker.fetch(await signedWebhook({id:'evt_assets',type:'checkout.session.completed',data:{object:stripeSession('cs_assets')}}),env(db,{ASSETS:assets}));
  assert.equal(res.status,200);
  assert.equal(db.stripeEvents.has('evt_assets'),true);
  assert.equal(assetCalls.length,1);
});

test('Day 5 Stripe CTAs use the checkout navigation helper before analytics without iframe-local Stripe redirects',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const publicHtml=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  for (const candidate of [html, publicHtml]) {
    assert.match(candidate, /galviscore-stripe-cta[\s\S]*?const checkoutUrl=GALVISCORE_STRIPE_PAYMENT_LINK; navigateToTopLevelCheckout\(checkoutUrl\);[\s\S]*?fireGalviEvent\('stripe_click'/);
    assert.match(candidate, /galvishot-stripe-cta[\s\S]*?const checkoutUrl=GSHOT\.PAYMENT_LINK; navigateToTopLevelCheckout\(checkoutUrl\);[\s\S]*?fireGalviEvent\('stripe_click'/);
    for (const forbidden of ['window.top.location.assign', 'window.location.href=GSHOT.PAYMENT_LINK', 'window.location.href=GALVISCORE_STRIPE_PAYMENT_LINK', 'location.assign(GSHOT.PAYMENT_LINK)', 'location.assign(GALVISCORE_STRIPE_PAYMENT_LINK)', 'iframe.src']) assert.equal(candidate.includes(forbidden),false);
    for (const forbidden of ['window.location.assign', 'window.top.location.assign', 'window.location.href=GSHOT.PAYMENT_LINK', 'window.location.href=GALVISCORE_STRIPE_PAYMENT_LINK', 'location.assign(GSHOT.PAYMENT_LINK)', 'location.assign(GALVISCORE_STRIPE_PAYMENT_LINK)', 'iframe.src']) assert.equal(candidate.includes(forbidden),false);
    assert.equal(candidate.includes('<iframe'),false);
  }
  for(const forbidden of ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','HUBSPOT_PRIVATE_APP_TOKEN','STRIPE_PRODUCT_MAP_JSON','DIMENSION_WEIGHTS'])assert.equal(html.includes(forbidden),false);
});
