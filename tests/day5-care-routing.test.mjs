import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const entry=readFileSync(new URL('../worker/day5-entry.js',import.meta.url),'utf8');
const section=(from,to)=>entry.slice(entry.indexOf(from),to?entry.indexOf(to):undefined);

test('H02/H06/H08 customer care route reads canonical Day 2 Score/Acuity from authenticated session without client recomputation',()=>{
  for(const required of [
    "path==='/api/v1/day5/customer/galviguide'",
    'CUSTOMER_SESSION_HEADER','GV_DAY5_SESSION_IDENTITY_MISSING','GV_DAY5_CANONICAL_CONTEXT_MISSING',
    'gv1_day2_intake_results',"result_type='score'",'acuity_score','acuity_band','clinical_confidence',
    'passive_intervention','active_care_recommended','urgent_active_specialty_referral',
    "customer_care_routing:'v1'","acuity_projection:'canonical_day2_score_v1'",
    'score_recomputed_in_browser:false','acuity_recomputed_in_browser:false'
  ]) assert.ok(entry.includes(required),required);

  const resolver=section('async function customerCareContext','function careRoute');
  assert.ok(resolver.includes('JOIN gv1_ventures v ON v.venture_id=c.venture_id'));
  assert.ok(resolver.includes('lower(trim(v.venture_name))=lower(trim(?))'));
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(resolver),false);
});

test('H07 GalviGuide customer endpoint is bounded, read-only and fails prohibited score/treatment/diagnosis authority closed',()=>{
  for(const required of [
    'GUIDE_ALLOWED_INTENTS','explain_route','navigate','reminder','request_evidence','clinic_prep',
    'GV_GUIDE_BOUNDARY','may not change GalviScore or Acuity, diagnose, approve treatment',
    "read_only:true","galviguide_customer_navigation:'bounded_read_only_v1'"
  ]) assert.ok(entry.includes(required),required);
  const guide=section('async function customerGalviGuide','const worker=');
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(guide),false);
  assert.equal(guide.includes('openai'),false);
  assert.equal(guide.includes('bmr_id'),false);
});
