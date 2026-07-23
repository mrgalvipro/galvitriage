import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/worker.js';

class MockStmt { constructor(db, sql){ this.db=db; this.sql=sql; this.params=[]; } bind(...p){ this.params=p; return this; } async run(){ return this.db.run(this.sql,this.params); } async first(){ return this.db.first(this.sql,this.params); } async all(){ return { results:this.db.all(this.sql,this.params) }; } }
class MockD1 {
  constructor(){ this.sessions=new Map(); this.results=new Map(); this.notes=[]; }
  prepare(sql){ return new MockStmt(this, sql); }
  async run(sql,p){ if(sql.includes('INSERT INTO fcd_notes')){ this.notes.push({ note_id:p[0], session_id:p[1], facilitator_name:p[2], discussion_summary:p[3], objections:p[4], clinical_observations:p[5], recommended_next_step:p[6], upsell_status:p[7], created_at:p[8], updated_at:p[9] }); return {success:true}; } throw new Error(`Unhandled run ${sql}`); }
  async first(sql,p){ if(sql.includes('FROM sessions')) return this.sessions.get(p[0]) || null; if(sql.includes('FROM product_results')) return this.results.get(`${p[0]}:${p[1]}`) || null; throw new Error(`Unhandled first ${sql}`); }
  all(sql,p){ if(sql.includes('FROM fcd_notes')) return this.notes.filter(n=>n.session_id===p[0]); throw new Error(`Unhandled all ${sql}`); }
}
function env(extra={}){ return { DB:new MockD1(), FCD_API_TOKEN:'fcd-ok', ...extra }; }
function req(body){ return new Request('https://worker.test/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); }
async function json(r){ return r.json(); }
function seed(e){
  e.DB.sessions.set('gt_day6', { session_id:'gt_day6', current_stage:'GalviPath', status:'active' });
  e.DB.results.set('gt_day6:GalviVitals', { result_json:JSON.stringify({ product:'GalviVitals', classification:'At Risk', score:52 }) });
  e.DB.results.set('gt_day6:GalviShot', { result_json:JSON.stringify({ product:'GalviShot', executive_summary:'Stored GalviShot summary', findings:[{ title:'Stored finding' }] }) });
  e.DB.results.set('gt_day6:GalviSight', { result_json:JSON.stringify({ product:'GalviSight', interpretation:'Stored interpretation' }) });
  e.DB.results.set('gt_day6:GalviPath', { result_json:JSON.stringify({ product:'GalviPath', primary_pathway:'stabilize', sequence:[{ window:'30 days', actions:['Act'] }], support_recommendation:'Book GalviClinic' }) });
}

test('Day 6 get_session_state restores downstream product availability', async()=>{
  const e=env({FCD_API_TOKEN:''}); seed(e);
  const res=await worker.fetch(req({action:'get_session_state',session_id:'gt_day6'}),e);
  const body=await json(res);
  assert.equal(res.status,200);
  assert.equal(body.current_stage,'GalviPath');
  assert.deepEqual(body.available_products, ['GalviVitals','GalviShot','GalviSight','GalviPath']);
});

test('Day 6 FCD summary reads stored data only and uses not-yet-available fallbacks', async()=>{
  const e=env(); seed(e);
  const res=await worker.fetch(req({action:'get_clinical_summary',session_id:'gt_day6',payload:{fcd_token:'fcd-ok'}}),e);
  const body=await json(res);
  assert.equal(res.status,200);
  assert.equal(body.sections.reason_for_visit,'GalviPath');
  assert.deepEqual(body.sections.galvishot_findings, ['Stored finding']);
  assert.equal(body.sections.galvisight_interpretation, 'Stored interpretation');
  assert.equal(body.sections.galvipath_recommendation.primary_pathway, 'stabilize');
  assert.equal(body.sections.facilitator_notes, 'Not yet available');
});

test('Day 6 facilitator capture stores separate FCD note and does not mutate product result', async()=>{
  const e=env(); seed(e);
  const before=e.DB.results.get('gt_day6:GalviShot').result_json;
  const res=await worker.fetch(req({action:'save_fcd_note',session_id:'gt_day6',payload:{fcd_token:'fcd-ok',confirmed_finding:'Stored finding',decision:'Proceed',next_action:'Clinic discussion',follow_up_date:'2026-08-01'}}),e);
  const body=await json(res);
  assert.equal(res.status,200);
  assert.equal(body.saved,true);
  assert.equal(e.DB.notes.length,1);
  assert.equal(e.DB.results.get('gt_day6:GalviShot').result_json,before);
});

test('Day 6 protected FCD actions reject missing token when configured', async()=>{
  const e=env(); seed(e);
  const res=await worker.fetch(req({action:'get_clinical_summary',session_id:'gt_day6'}),e);
  assert.equal(res.status,403);
});
