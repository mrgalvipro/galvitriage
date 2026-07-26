import { readFileSync, writeFileSync } from 'node:fs';

const path='index.html';
let s=readFileSync(path,'utf8');
function rep(oldText,newText,label){
  if(s.includes(newText)) return;
  if(!s.includes(oldText)) throw new Error(`SOURCE DRIFT: ${label}`);
  s=s.replace(oldText,newText);
}

rep('<h1 class="center">Your Executive Clinical Findings Are Ready</h1>','<h1 class="center">Your GalviShot™ Is Ready</h1>','GalviShot paywall heading');
rep('<div class="gshot-inclusion"><span class="gshot-check">✓</span><span>3–5 prioritized executive findings from your GalviTriage and GalviScore data.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Evidence behind each finding so the result feels specific rather than generic.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Strategic risks, bottlenecks, assumptions, and next-best actions.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Clear handoff into GalviSight™ for executive interpretation.</span></div>',
'<div class="gshot-inclusion"><span class="gshot-check">✓</span><span>The business conditions driving your symptoms and what needs treatment first.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>GalviLab Results supporting each diagnosis.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Your GalviShot Prescriptions and why each treatment matters.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>A clear handoff into GalviSight™ for your business prescription.</span></div>','GalviShot inclusion copy');
rep('<h3>Assumptions</h3>\n    <ul id="galvishot-assumptions" class="gshot-risk-list"></ul>','<h3 class="hidden">Assumptions</h3>\n    <ul id="galvishot-assumptions" class="gshot-risk-list"></ul>','GalviShot assumptions heading');

rep('<li>Executive interpretation of the strongest supported findings</li>\n        <li>Prioritized hypotheses, risks, and opportunities</li>\n        <li>Recommended actions and urgency</li>\n        <li>Evidence trace and assumptions</li>',
'<li>Understand what your symptoms are telling us</li>\n        <li>See what requires attention first</li>\n        <li>Know exactly What to Do Next</li>\n        <li>Understand how urgently you should act</li>\n        <li>See which GalviLab Results support your prescription</li>','GalviSight paywall copy');
rep('<h1>Your Business Prescription</h1>','<h1>Your GalviSight Prescription</h1>','GalviSight result heading');
rep('<strong>Urgency:</strong> <span id="galvisight-urgency"></span>','<strong>Why This Is Urgent:</strong> <span id="galvisight-urgency"></span>','GalviSight urgency label');
rep('<h3>Your GalviSight Prescription</h3>\n        <ol id="galvisight-actions" class="gshot-action-list"></ol>','<h3>What to Do Next</h3>\n        <ol id="galvisight-actions" class="gshot-action-list"></ol>','GalviSight actions heading');

rep('<ol id="galvipath-sequence" class="gshot-action-list"></ol>\n      <div class="button-row"><button id="print-galvipath" type="button" class="secondary-button">Print / Save GalviPath™</button><button id="galvipath-book-galviclinic" type="button" class="primary-btn">Book GalviClinic™</button></div>',
'<ol id="galvipath-sequence" class="gshot-action-list"></ol>\n      <div class="gshot-preview-card"><h3>GalviLab Samples to Collect</h3><ul id="galvipath-lab-samples" class="gshot-risk-list"></ul></div>\n      <div class="gshot-preview-card"><h3>GalviCare Markers</h3><ul id="galvipath-markers" class="gshot-risk-list"></ul></div>\n      <div class="gshot-preview-card"><h3>GalviCare Recovery Indicators</h3><ul id="galvipath-recovery" class="gshot-risk-list"></ul></div>\n      <div class="gshot-preview-card"><h3>Future GalviPath Discussions</h3><ul id="galvipath-future-discussions" class="gshot-risk-list"><li>Your business results materially change from what GalviCare originally assessed.</li><li>New customer, revenue, product, market, or operating information changes the diagnosis.</li><li>Multiple business symptoms begin worsening at the same time.</li><li>You are unsure which treatment priority to address first.</li><li>Your GalviCare Recovery Indicators are not improving as expected.</li></ul></div>\n      <div class="button-row"><button id="print-galvipath" type="button" class="secondary-button">Print / Save GalviPath™</button><button id="galvipath-checkup" type="button" class="secondary-button">GalviPath Check Up</button><button id="galvipath-book-galviclinic" type="button" class="primary-btn">Book GalviClinic™</button></div>','GalviPath clinical sections');

const hook='document.getElementById(\'galvipath-book-galviclinic\').addEventListener(\'click\',()=>{';
if(!s.includes("document.getElementById('galvipath-checkup')?.addEventListener")){
  if(!s.includes(hook)) throw new Error('SOURCE DRIFT: GalviPath button hook');
  s=s.replace(hook,`document.getElementById('galvipath-checkup')?.addEventListener('click',openGalviPathCheckUp);\n${hook}`);
}

writeFileSync(path,s,'utf8');
console.log('Day 7A final source convergence applied.');
