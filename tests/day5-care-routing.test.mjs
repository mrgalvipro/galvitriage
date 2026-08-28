import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const entry=readFileSync(new URL('../worker/day5-entry.js',import.meta.url),'utf8');
const core=readFileSync(new URL('../worker/day5-core-entry.js',import.meta.url),'utf8');
const browser=readFileSync(new URL('../day5-customer-care-routing.js',import.meta.url),'utf8');
const section=(source,from,to)=>source.slice(source.indexOf(from),to?source.indexOf(to):undefined);

test('H02/H06/H08 composed customer care route reads canonical Day 2 Score/Acuity from authenticated session without client recomputation',()=>{
  assert.ok(entry.includes("import day5Worker from './day5-core-entry.js'"));
  assert.ok(entry.includes('day5Worker.fetch'));
  for(const required of [
    "path==='/api/v1/day5/customer/galviguide'",
    'CUSTOMER_SESSION_HEADER','GV_DAY5_SESSION_IDENTITY_MISSING','GV_DAY5_CANONICAL_CONTEXT_MISSING',
    'gv1_day2_intake_results',"result_type='score'",'acuity_score','acuity_band','clinical_confidence',
    'passive_intervention','active_care_recommended','urgent_active_specialty_referral',
    "customer_care_routing:'v1'","acuity_projection:'canonical_day2_score_v1'",
    'score_recomputed_in_browser:false','acuity_recomputed_in_browser:false'
  ]) assert.ok(core.includes(required),required);

  const resolver=section(core,'async function customerCareContext','function careRoute');
  assert.ok(resolver.includes('JOIN gv1_ventures v ON v.venture_id=c.venture_id'));
  assert.ok(resolver.includes('lower(trim(v.venture_name))=lower(trim(?))'));
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(resolver),false);
});

test('H07 GalviGuide customer endpoint is bounded, read-only and fails prohibited score/treatment/diagnosis authority closed',()=>{
  for(const required of [
    'GUIDE_ALLOWED_INTENTS','explain_route','navigate','reminder','request_evidence','clinic_prep',
    'GV_GUIDE_BOUNDARY','may not change GalviScore or Acuity, diagnose, approve treatment',
    "read_only:true","galviguide_customer_navigation:'bounded_read_only_v1'"
  ]) assert.ok(core.includes(required),required);
  const guide=section(core,'async function customerGalviGuide','const worker=');
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(guide),false);
  assert.equal(guide.includes('openai'),false);
  assert.equal(guide.includes('bmr_id'),false);
});

test('H02 clarification transition and H06 Acuity projection cannot be broken by current Sight/Path host variants',()=>{
  for(const required of [
    'FOLLOWUP_IDS','followupActive','resultReady','routeFingerprint','insertPanelSafely','stageHosts',
    'galvisight-result-panel','galvisight-handoff','galvipath-result-panel','galvipath-result',
    "row.insertAdjacentElement('beforebegin',panel)",
    'if(followupActive()){cached=null;return null}',
    'if(followupActive()){cached=null;return}',
    "observer.observe(document.body,{subtree:true,childList:true,attributes:true"
  ]) assert.ok(browser.includes(required),required);

  for(const followupId of [
    'followup-question-container','galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions'
  ]) assert.ok(browser.includes(followupId),followupId);

  assert.equal(browser.includes('if(row)host.insertBefore(panel,row)'),false);
  assert.ok(browser.includes('existing?.dataset?.day5CareFingerprint===fingerprint'));
  assert.ok(browser.includes('for(const host of stageHosts())'));
  assert.ok(browser.includes('if(!visible(host))continue'));
  assert.ok(browser.includes('/api/v1/day5/customer/galviguide'));
  assert.ok(browser.includes('testBoundary'));
  assert.equal(/api\.openai\.com|OPENAI_API_KEY|bmr_id\s*:/.test(browser),false);
});
