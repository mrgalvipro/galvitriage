import { readFileSync, writeFileSync } from 'node:fs';

const path = 'index.html';
let html = readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (html.includes(newText)) return;
  if (!html.includes(oldText)) throw new Error(`SOURCE DRIFT: ${label}`);
  html = html.replace(oldText, newText);
}

// GalviShot: active customer-facing diagnosis/treatment framing.
replaceOnce(
  '<h1 class="center">Your Executive Clinical Findings Are Ready</h1>',
  '<h1 class="center">Your GalviShot™ Is Ready</h1>',
  'GalviShot paywall heading'
);
replaceOnce(
  '<div class="gshot-inclusion"><span class="gshot-check">✓</span><span>3–5 prioritized executive findings from your GalviTriage and GalviScore data.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Evidence behind each finding so the result feels specific rather than generic.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Strategic risks, bottlenecks, assumptions, and next-best actions.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Clear handoff into GalviSight™ for executive interpretation.</span></div>',
  '<div class="gshot-inclusion"><span class="gshot-check">✓</span><span>The business conditions driving your symptoms and what needs treatment first.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>GalviLab Results supporting each diagnosis.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>Your GalviShot Prescriptions and why each treatment matters.</span></div>\n      <div class="gshot-inclusion"><span class="gshot-check">✓</span><span>A clear handoff into GalviSight™ for your business prescription.</span></div>',
  'GalviShot paywall inclusions'
);
replaceOnce(
  '<h3>Assumptions</h3>\n    <ul id="galvishot-assumptions" class="gshot-risk-list"></ul>',
  '<h3 class="hidden">Assumptions</h3>\n    <ul id="galvishot-assumptions" class="gshot-risk-list"></ul>',
  'GalviShot assumptions heading'
);

// GalviSight: clearly distinct prescription + urgency experience.
replaceOnce(
  '<li>Executive interpretation of the strongest supported findings</li>\n        <li>Prioritized hypotheses, risks, and opportunities</li>\n        <li>Recommended actions and urgency</li>\n        <li>Evidence trace and assumptions</li>',
  '<li>Understand what your symptoms are telling us</li>\n        <li>See what requires attention first</li>\n        <li>Know exactly What to Do Next</li>\n        <li>Understand how urgently you should act</li>\n        <li>See which GalviLab Results support your prescription</li>',
  'GalviSight paywall inclusions'
);
replaceOnce(
  '<h1>Your Business Prescription</h1>',
  '<h1>Your GalviSight Prescription</h1>',
  'GalviSight result heading'
);
replaceOnce(
  '<strong>Urgency:</strong> <span id="galvisight-urgency"></span>',
  '<strong>Why This Is Urgent:</strong> <span id="galvisight-urgency"></span>',
  'GalviSight urgency heading'
);
replaceOnce(
  '<h3>Your GalviSight Prescription</h3>\n        <ol id="galvisight-actions" class="gshot-action-list"></ol>',
  '<h3>What to Do Next</h3>\n        <ol id="galvisight-actions" class="gshot-action-list"></ol>',
  'GalviSight actions heading'
);

// Remove obsolete customer-facing engineering copy from the GalviShot paywall.
replaceOnce(
  '<p class="gshot-status-note">Secure checkout powered by Stripe. The full GalviShot appears after payment confirmation. QA override is for controlled testing only.</p>',
  '<p class="gshot-status-note"></p>',
  'GalviShot implementation microcopy'
);

writeFileSync(path, html, 'utf8');
console.log('Day 7A authoritative index.html convergence complete.');
