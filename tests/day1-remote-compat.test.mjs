import test from 'node:test';
import assert from 'node:assert/strict';
import { REQUIRED_SCHEMA, SERVICE, TABLE_PREFIX } from '../worker/day1.js';

const base=String(process.env.DAY1_BASE_URL||'').replace(/\/$/,'');
const origin=process.env.DAY1_ALLOWED_ORIGIN||'https://galvipro.com';
const unique=String(process.env.DAY1_RUN_SUFFIX||Date.now()).replace(/[^A-Za-z0-9._-]/g,'_');

async function request(pathname,options={}){
  const headers=new Headers(options.headers||{});
  headers.set('Origin',origin);
  headers.set('X-Correlation-Id',`corr_legacy_compat_${Date.now()}_${Math.random().toString(16).slice(2)}`);
  const response=await fetch(`${base}${pathname}`,{...options,headers});
  const payload=response.status===204?null:await response.json();
  assert.equal(response.headers.get('x-galvivault-environment'),'qa');
  assert.ok(response.headers.get('x-correlation-id'));
  return {response,payload};
}

test('deployed inherited Day 1 API remains compatible after additive GalviCare 1.0 schema',async()=>{
  assert.ok(base,'DAY1_BASE_URL is required');
  const health=await request('/health');
  assert.equal(health.response.status,200);
  assert.equal(health.payload.data.service,SERVICE);
  assert.equal(health.payload.data.schema_namespace,TABLE_PREFIX);

  const ready=await request('/ready');
  assert.equal(ready.response.status,200);
  assert.equal(ready.payload.data.ready,true);
  assert.equal(ready.payload.data.present_table_count,ready.payload.data.required_table_count);

  const schema=await request('/api/v1/schema-version');
  assert.equal(schema.response.status,200);
  assert.equal(schema.payload.data.compatible,true);
  const current=String(schema.payload.data.current_schema_version||'');
  assert.ok(current.localeCompare(REQUIRED_SCHEMA,undefined,{numeric:true})>=0,
    `deployed schema ${current} must be >= inherited minimum ${REQUIRED_SCHEMA}`);

  const session={
    session_id:`ses_day1_e2e_${unique}`,
    founder_id:`fdr_day1_e2e_${unique}`,
    venture_id:`ven_day1_e2e_${unique}`,
    bmr_id:`bmr_day1_e2e_${unique}`,
    source:'galvicare',current_stage:'GalviTriage',
    founder:{first_name:'Day 1',last_name:'Compatibility',email:`day1.legacy.${unique}@example.invalid`},
    venture_name:`Day 1 Compatibility Venture ${unique}`
  };
  const key=`day1-session-${unique}`;
  const created=await request('/api/v1/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(session)});
  assert.equal(created.response.status,201);
  assert.equal(created.payload.data.session.session_id,session.session_id);
  const replay=await request('/api/v1/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(session)});
  assert.equal(replay.response.status,200);
  assert.equal(replay.payload.meta.idempotent_replay,true);
  const mismatch=await request('/api/v1/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({...session,venture_name:'Changed Venture'})});
  assert.equal(mismatch.response.status,409);
  assert.equal(mismatch.payload.error.code,'GV_IDEMPOTENCY_REUSE_MISMATCH');
  const fetched=await request(`/api/v1/sessions/${session.session_id}`);
  assert.equal(fetched.response.status,200);
  assert.equal(fetched.payload.data.business_medical_record.bmr_id,session.bmr_id);

  const eventKey=`day1:${session.session_id}:triage_opened:001`;
  const eventBody={event_key:eventKey,session_id:session.session_id,event_name:'triage_opened',product:'GalviTriage',current_stage:'GalviTriage',metadata:{fixture:true,source:'legacy-compat-smoke'}};
  const eventIdem=`day1-event-${unique}`;
  const event=await request('/api/v1/journey-events',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':eventIdem},body:JSON.stringify(eventBody)});
  assert.equal(event.response.status,201);
  const eventReplay=await request('/api/v1/journey-events',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':eventIdem},body:JSON.stringify(eventBody)});
  assert.equal(eventReplay.response.status,200);
  assert.equal(eventReplay.payload.meta.idempotent_replay,true);
  const eventMismatch=await request('/api/v1/journey-events',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':eventIdem},body:JSON.stringify({...eventBody,event_name:'changed'})});
  assert.equal(eventMismatch.response.status,409);
  assert.equal(eventMismatch.payload.error.code,'GV_IDEMPOTENCY_REUSE_MISMATCH');

  const fixtureA=await request('/api/v1/fixtures/results',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  const fixtureB=await request('/api/v1/fixtures/results',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  assert.equal(fixtureA.response.status,200);
  assert.deepEqual(fixtureA.payload.data.fixture,fixtureB.payload.data.fixture);
});
