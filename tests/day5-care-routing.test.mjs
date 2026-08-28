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

test('H06 customer UX places question before AI guidance, hides provider metadata, and keeps Recommended Next Actions distinct',()=>{
  for(const required of ['GalviCare Day 5 customer care routing + GalviGuide v2','Ask GalviGuide a Care-Navigation Question','GalviGuide AI Guidance','Recommended Next Actions','data-day5-guide-send','data-day5-guide-answer','data-day5-guide-actions-label'])assert.ok(browser.includes(required),required);
  const markup=section(browser,'function markup','function pathEvidenceSection');
  assert.ok(markup.indexOf('Ask GalviGuide a Care-Navigation Question')<markup.indexOf('data-day5-guide-answer'));
  assert.equal(markup.includes('provider_response_id'),false);
  assert.equal(markup.includes('Provider: OpenAI'),false);
  assert.equal(markup.includes('AI proof'),false);
  assert.equal(browser.includes('data-day5-guide-answer-source'),false);
  assert.equal(browser.includes('data-day5-guide-ai-proof'),false);
  assert.ok(browser.includes("answer.dataset.aiGenerated=used?'true':'false'"));
});

test('H06 GalviPath evidence-strengthening section can be replaced only by user-invoked governed AI plain-language guidance',()=>{
  for(const required of ['evidence to strengthen your care plan','applyPathEvidenceGuidance','ai_metadata?.used!==true','care_conversation','What evidence should I collect to strengthen my current GalviPath care plan','syncPathEvidence:true','GalviGuide synthesized the current governed evidence needs into plain-language requests'])assert.ok(browser.includes(required),required);
  const pathSync=section(browser,'function applyPathEvidenceGuidance','function renderGuide');
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(pathSync),false);
  assert.ok(pathSync.includes('next_actions'));
});

test('H06/H08 duplicate Business Acuity routing is not injected into GalviChart',()=>{
  const hosts=section(browser,'function stageHosts','function resultReady');
  for(const required of ['galviscore-result','galvishot-result','galvisight-result-panel','galvipath-result-panel'])assert.ok(hosts.includes(required),required);
  assert.equal(hosts.includes('galvichart-day4'),false);
});

test('H07 prohibited score diagnosis treatment and licensed-advice authority fails closed without write',()=>{
  for(const required of ['GUIDE_PROHIBITED_REQUEST','GV_GUIDE_BOUNDARY','may not change GalviScore or Acuity, diagnose, approve treatment','write_performed:false','Business Physician judgment'])assert.ok(core.includes(required),required);
  const guide=section(core,'async function customerGalviGuide','const worker=');
  assert.equal(/\bINSERT\b|\bUPDATE\b|\bDELETE\b/i.test(guide),false);
});

test('H02 clarification transition remains protected and browser invokes AI only through Worker GalviGuide',()=>{
  for(const required of ['FOLLOWUP_PANELS','followupActive','resultReady','routeFingerprint','insertPanelSafely','stageHosts','galviscore-followup','galvishot-followup','galvisight-followup','galvipath-followup','galvisight-result-panel','galvisight-handoff','galvipath-result-panel','galvipath-result',"row.insertAdjacentElement('beforebegin',panel)",'if(followupActive()){cached=null;return null}',"observer.observe(document.body,{subtree:true,childList:true,attributes:true",'getClientRects().length>0','data-day5-guide-send',"requestGuide(detail,'care_conversation',message)",'testBoundary'])assert.ok(browser.includes(required),required);
  assert.ok(browser.includes('GalviCare Day 5 customer care routing + GalviGuide v2'));
  assert.ok(browser.includes('/api/v1/day5/customer/galviguide'));
  assert.ok(browser.includes("api('explain_route')"));
  assert.equal(/api\.openai\.com|OPENAI_API_KEY|bmr_id\s*:/.test(browser),false);
});
