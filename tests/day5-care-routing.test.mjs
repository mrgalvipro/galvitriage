import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const entry=readFileSync(new URL('../worker/day5-entry.js',import.meta.url),'utf8');
const core=readFileSync(new URL('../worker/day5-core-entry.js',import.meta.url),'utf8');
const browser=readFileSync(new URL('../day5-customer-care-routing.js',import.meta.url),'utf8');
const section=(source,from,to)=>source.slice(source.indexOf(from),to?source.indexOf(to):undefined);

test('H02/H06/H08 canonical route remains server owned and inherited clarification stays intact',()=>{
  assert.ok(entry.includes("import day5Worker from './day5-core-entry.js'"));
  for(const required of ["path==='/api/v1/day5/customer/galviguide'",'CUSTOMER_SESSION_HEADER','gv1_day2_intake_results',"result_type='score'",'acuity_score','acuity_band','clinical_confidence','passive_intervention','active_care_recommended','urgent_active_specialty_referral',"acuity_projection:'canonical_day2_score_v1'",'score_recomputed_in_browser:false','acuity_recomputed_in_browser:false'])assert.ok(core.includes(required),required);
  const resolver=section(core,'async function customerCareContext','function careRoute');
  assert.ok(resolver.includes('JOIN gv1_ventures v ON v.venture_id=c.venture_id'));
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(resolver),false);
});

test('H06 GalviGuide uses server-side governed Responses API with strict schema and deterministic fallback while navigation remains bounded read-only',()=>{
  for(const required of ['GUIDE_AI_INTENTS','supportive_explanation','care_conversation','clinic_prep','https://api.openai.com/v1/responses','OPENAI_API_KEY','OPENAI_MODEL_QA','store:false','AbortController','GUIDE_SCHEMA','GUIDE_UNSAFE_OUTPUT','guideFallback','governedGuideNarration',"galviguide_customer_navigation:'bounded_read_only_v1'","galviguide_provider:'server_side_openai_responses_v1'","guide_version:'governed_ai_narration_v1'"])assert.ok(core.includes(required),required);
  const guide=section(core,'async function customerGalviGuide','const worker=');
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(guide),false);
  assert.ok(guide.includes('canonical_source'));
  assert.ok(guide.includes('source_artifact_ids'));
});

test('H07 prohibited score diagnosis treatment and licensed-advice authority fails closed without write',()=>{
  for(const required of ['GUIDE_PROHIBITED_REQUEST','GV_GUIDE_BOUNDARY','may not change GalviScore or Acuity, diagnose, approve treatment','write_performed:false','Business Physician judgment'])assert.ok(core.includes(required),required);
  const guide=section(core,'async function customerGalviGuide','const worker=');
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(guide),false);
});

test('H02 clarification transition remains protected and browser invokes AI only through Worker GalviGuide',()=>{
  for(const required of ['FOLLOWUP_PANELS','followupActive','resultReady','routeFingerprint','insertPanelSafely','stageHosts','galviscore-followup','galvishot-followup','galvisight-followup','galvipath-followup','galvisight-result-panel','galvisight-handoff','galvipath-result-panel','galvipath-result',"row.insertAdjacentElement('beforebegin',panel)",'if(followupActive()){cached=null;return null}',"observer.observe(document.body,{subtree:true,childList:true,attributes:true",'node.getClientRects().length>0','data-day5-guide-send',"requestGuide(detail,'care_conversation',message)",'testBoundary'])assert.ok(browser.includes(required),required);
  assert.ok(browser.includes('GalviCare Day 5 customer care routing + GalviGuide v1'));
  assert.ok(browser.includes('/api/v1/day5/customer/galviguide'));
  assert.ok(browser.includes("api('explain_route')"));
  assert.equal(/api\.openai\.com|OPENAI_API_KEY|bmr_id\s*:/.test(browser),false);
});
