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

test('Day 7D versions are locked to the authoritative v2 release',()=>{
  assert.equal(DAY7D_RULES_VERSION,'galviengine_customer_intelligence_v0_5_2');
  assert.equal(DAY7D_QUESTION_VERSION,'clinical_followups_v0_5_2');
  assert.equal(DAY7D_CONTENT_VERSION,'galvicare_day7d_customer_intelligence_v0_5_3');
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

test('founder language maps to clinical dimensions',()=>{
  assert.equal(normalizeContextDimension('Customer Growth'),'customer');
  assert.equal(normalizeContextDimension('Product Marketing'),'distribution');
  assert.equal(normalizeContextDimension('Product & Service Strategy'),'product');
});

test('qualitative context does not mutate objective score',()=>{
  const rows=[
    {question_id:'q04_ideal_customer',answer_number:1},
    {question_id:'q10_customer_satisfaction',answer_number:5},
    {question_id:'q05_attract_customers',answer_number:2}
  ];
  const a=scoreRows(rows);
  normalizeContextDimension('Product Marketing');
  const b=scoreRows(rows);
  assert.deepEqual(a,b);
});

test('stated versus observed divergence becomes an explicit observation',()=>{
  const r=reconcile(
    {biggest_challenge:'Customer Growth'},
    {customer:80,distribution:25,product:70,revenue:65,problem:75,business_model:70,leadership:70,technology_operations:70}
  );
  assert.equal(r.observations[0].type,'divergence');
  assert.equal(r.observations[0].observed_dimension,'distribution');
});

test('aligned founder and objective evidence is recognized',()=>{
  const r=reconcile(
    {biggest_challenge:'Customer Growth'},
    {customer:25,distribution:70,product:70,revenue:65,problem:75,business_model:70,leadership:70,technology_operations:70}
  );
  assert.equal(r.observations[0].type,'alignment');
});

test('follow-ups are targeted and bounded',()=>{
  const r={confidence:70,weakest_dimension:'customer',stated:{biggest_challenge:'customer'},observations:[]};
  const q=chooseFollowups(r,{},'GalviShot');
  assert.equal(q.length,1);
  assert.match(q[0].question_id,/^CI_/);
  assert.equal(q[0].product,'GalviShot');
  assert.equal(q[0].question_version,DAY7D_QUESTION_VERSION);
});

test('answered follow-up is not asked again',()=>{
  const r={confidence:70,weakest_dimension:'customer',stated:{biggest_challenge:'customer'},observations:[]};
  const first=chooseFollowups(r,{},'GalviShot');
  const second=chooseFollowups(r,{[first[0].question_id]:'answered'},'GalviShot');
  assert.equal(second.length,0);
});
