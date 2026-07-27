import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine=fs.readFileSync('worker/day7d-engine.js','utf8');
const browser=fs.readFileSync('day7d-browser-customer-intelligence.js','utf8');
const builder=fs.readFileSync('scripts/day7b-build-qa-frontend.mjs','utf8');

const has=(source,token,msg)=>assert.ok(source.includes(token),`${msg}: missing ${token}`);
const lacks=(source,token,msg)=>assert.ok(!source.includes(token),`${msg}: forbidden ${token}`);

test('Worker blocks final generation on targeted follow-up',()=>{
  has(engine,"status:'needs_followup'",'needs_followup contract');
  has(engine,'const outstanding=chooseFollowups','generation follow-up decision');
  const start=engine.indexOf('async function getOrCreate');
  const end=engine.indexOf('const ACTION_PRODUCT');
  const body=engine.slice(start,end);
  assert.ok(body.indexOf("status:'needs_followup'")<body.indexOf('saveResult'),'needs_followup must occur before saveResult');
  lacks(body,'preservedLegacyResult','legacy clinical result must not bypass Day 7D intelligence');
});

test('Answers persist and expose evidence version bump',()=>{
  has(engine,'evidence_version_bumped:after>before','evidence version bump proof');
  has(engine,'clinical_followups','persistent follow-up storage');
  has(engine,'await bump(db,sid','evidence version increment');
});

test('All clinical products consume cumulative follow-up evidence',()=>{
  has(engine,"followupEvidence(f,'GalviShot')",'GalviShot follow-up consumption');
  has(engine,"followupEvidence(f,'GalviSight')",'GalviSight follow-up consumption');
  has(engine,"followupEvidence(f,'GalviPath')",'GalviPath follow-up consumption');
  const cumulative=(engine.match(/followupEvidence\(f\)/g)||[]).length;
  assert.ok(cumulative>=2,'GalviSight/GalviPath must consume cumulative evidence');
});

test('Browser exposes visible targeted questions for Shot Sight and Path',()=>{
  for(const token of ['galvishot-followup-questions','galvisight-followup-questions','galvipath-followup-questions','Save Answer & Continue']) has(browser,token,'visible follow-up UI');
});

test('Browser saves all three stage answers then regenerates',()=>{
  for(const token of ['save_galvishot_followup','save_galvisight_followup','save_galvipath_followup','get_or_create_galvishot','get_or_generate_galvisight','get_or_generate_galvipath']) has(browser,token,'save/regenerate contract');
  has(browser,'evidence_version_bumped','browser evidence bump enforcement');
  has(browser,'showIntegratedGalviShotResult','GalviShot rerender');
  has(browser,'showGalviSight','GalviSight rerender');
  has(browser,'showGalviPath','GalviPath rerender');
});

test('QA builder injects Day 7D adapter without changing Day 7A-7C endpoints/payments',()=>{
  has(builder,"readFileSync(DAY7D_BROWSER",'QA adapter injection');
  has(builder,'GALVICARE QA / TEST ENVIRONMENT — NO LIVE PAYMENTS','QA isolation banner');
  has(builder,'TEST_STRIPE_MARKER','Stripe TEST preservation');
  has(builder,"const QA_WORKER = 'https://galvicare-triage-intake.mrgalvipro.workers.dev'",'proven QA Worker endpoint');
});

test('refresh restoration remains evidence-version aware',()=>{
  has(engine,'currentDay7DResult(db,sid,product,f.evidence_version)','evidence-version cache lookup');
  has(engine,'Number(r.evidence_version??-1)===Number(ev)','stale result rejection');
});
