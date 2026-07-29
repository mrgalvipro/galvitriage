import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY7D_RULES_VERSION,
  DAY7D_QUESTION_VERSION,
  DAY7D_CONTENT_VERSION,
  DAY7D_RELEASE_CONTRACT,
  extractQualitativeContext,
  normalizeContextDimension,
  scoreRows,
  reconcile,
  chooseFollowups
} from '../worker/day7d-engine.js';

const dimensions={customer:25,distribution:35,product:45,revenue:50,problem:70,business_model:75,leadership:80,technology_operations:85};

function reconciliation(confidence,overrides={}){
  return {
    confidence,
    weakest_dimension:'customer',
    second_weakest_dimension:'distribution',
    stated:{biggest_challenge:'customer',highest_impact_area:'product',one_30_day_problem:'revenue'},
    observations:[],
    material_contradiction:false,
    ...overrides
  };
}

test('Day 7D versions identify the active authoritative release',()=>{
  assert.equal(DAY7D_RULES_VERSION,'galviengine_customer_intelligence_v0_5_3');
  assert.equal(DAY7D_QUESTION_VERSION,'clinical_followups_v0_5_3');
  assert.equal(DAY7D_CONTENT_VERSION,'galvicare_day7d_customer_intelligence_v0_5_4');
  assert.equal(DAY7D_RELEASE_CONTRACT,'day7d_progressive_customer_intelligence_v2');
});

test('all six qualitative fields are normalized from Triage',()=>{
  const c=extractQualitativeContext({
    priority:{highest_impact_area:'Product & Service Strategy'},
    open_text:{
      biggest_challenge:'Customer Growth',
      one_30_day_problem:'Product Marketing',
      growth_blocker:'Qualified customers do not understand why it is for them',
      feels_broken:'Customer acquisition and positioning are disconnected',
      keeps_up_at_night:'Marketing spend before proving conversion'
    }
  });
  assert.equal(Object.values(c).filter(Boolean).length,6);
});

test('governed founder language maps to approved dimensions',()=>{
  assert.equal(normalizeContextDimension('Customer Growth'),'customer');
  assert.equal(normalizeContextDimension('Product Marketing'),'distribution');
  assert.equal(normalizeContextDimension('Product & Service Strategy'),'product');
});

test('qualitative context does not mutate objective scoring',()=>{
  const rows=[
    {question_id:'q04_ideal_customer',answer_number:1},
    {question_id:'q10_customer_satisfaction',answer_number:5},
    {question_id:'q05_attract_customers',answer_number:2}
  ];
  const before=scoreRows(rows);
  normalizeContextDimension('Product Marketing');
  const after=scoreRows(rows);
  assert.deepEqual(after,before);
});

test('stated versus observed divergence becomes an explicit observation',()=>{
  const r=reconcile({biggest_challenge:'Product Strategy'},dimensions,0,36);
  assert.equal(r.observations[0].type,'divergence');
  assert.equal(r.observations[0].observed_dimension,'customer');
  assert.equal(r.material_contradiction,true);
});

test('aligned founder and objective evidence is recognized',()=>{
  const r=reconcile({biggest_challenge:'Customer Growth'},dimensions,0,36);
  assert.equal(r.observations[0].type,'alignment');
});

test('0–59 confidence returns three targeted questions',()=>{
  const q=chooseFollowups(reconciliation(36),{},'GalviShot');
  assert.equal(q.length,3);
  assert.equal(new Set(q.map(x=>x.question_id)).size,3);
  for(const item of q){
    assert.match(item.question_id,/^CI_SHOT_/);
    assert.equal(item.product,'GalviShot');
    assert.equal(item.question_version,DAY7D_QUESTION_VERSION);
  }
});

test('60–69 confidence returns two targeted questions',()=>{
  const q=chooseFollowups(reconciliation(65),{},'GalviSight');
  assert.equal(q.length,2);
  assert.ok(q.every(x=>x.product==='GalviSight'));
});

test('70–79 confidence returns one targeted question',()=>{
  const q=chooseFollowups(reconciliation(75),{},'GalviPath');
  assert.equal(q.length,1);
  assert.equal(q[0].product,'GalviPath');
});

test('80–89 asks only for a material contradiction',()=>{
  assert.equal(chooseFollowups(reconciliation(85),{},'GalviSight').length,0);
  assert.equal(chooseFollowups(reconciliation(85,{material_contradiction:true}),{},'GalviSight').length,1);
});

test('90–100 does not ask gratuitous questions',()=>{
  assert.equal(chooseFollowups(reconciliation(95),{},'GalviShot').length,0);
});

test('completed questions are not repeated and remaining questions continue',()=>{
  const first=chooseFollowups(reconciliation(36),{},'GalviShot');
  const existing={[first[0].question_id]:'answered'};
  const remaining=chooseFollowups(reconciliation(36),existing,'GalviShot');
  assert.ok(remaining.length>=1);
  assert.ok(!remaining.some(x=>x.question_id===first[0].question_id));
});

test('explicitly skipped questions are not repeated',()=>{
  const first=chooseFollowups(reconciliation(36),{},'GalviShot');
  const existing={[first[0].question_id]:'Skipped for now — no additional evidence supplied.'};
  const remaining=chooseFollowups(reconciliation(36),existing,'GalviShot');
  assert.ok(!remaining.some(x=>x.question_id===first[0].question_id));
});
