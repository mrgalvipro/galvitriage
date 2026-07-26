import fs from 'node:fs';

const file = process.argv[2] || 'index.html';
let html = fs.readFileSync(file, 'utf8');

const replaceOnce = (from, to) => {
  if (html.includes(from)) html = html.replace(from, to);
};

// GalviTriage™ approved copy.
replaceOnce(
  "Burn cash. Or worse — make decisions without realizing the real problem isn't where they're looking.",
  "Burn cash or worse — make decisions without realizing the real problem isn't where they're looking."
);

// Active GalviShot™ paywall heading. Keep the legacy Day 7 anchor using the old capitalization only.
replaceOnce(
  '<h1 class="center">Your Executive Clinical Findings Are Ready</h1>',
  '<h1 class="center">Your GalviShot™ is Ready</h1>'
);
html = html.replaceAll('Your Executive Clinical Findings Are Ready', 'Your GalviShot™ Is Ready');

// GalviSight™ unlocked result hierarchy and removal of the obsolete ready-status message.
replaceOnce(
  '<p class="eyebrow">GALVISIGHT™</p>\n    <h1>Your GalviSight Prescription</h1>',
  '<p class="eyebrow">GALVISIGHT™ UNLOCKED</p>\n    <h1 class="center">Your GalviSight Prescription</h1>'
);
replaceOnce(
  "          if(stateMessage){\n            stateMessage.textContent='GalviSight interpretation ready.';\n            stateMessage.classList.add('gshot-success');\n          }",
  "          if(stateMessage){\n            stateMessage.textContent='';\n            stateMessage.classList.remove('gshot-success');\n            stateMessage.classList.add('hidden');\n          }"
);

// GalviPath™ unlocked result hierarchy and ready-status removal.
replaceOnce(
  '<div class="gshot-stage-pill">Current Stage: Chart Your GalviPath</div>\n    <h2>Chart Your GalviPath™</h2>',
  '<p class="eyebrow">GALVIPATH™ UNLOCKED</p>\n    <h2 class="center">Chart Your GalviPath™</h2>'
);
replaceOnce(
  "        if(stateMessage){\n          stateMessage.textContent='Your GalviPath™ is ready.';\n          stateMessage.classList.add('gshot-success');\n        }",
  "        if(stateMessage){\n          stateMessage.textContent='';\n          stateMessage.classList.remove('gshot-success');\n          stateMessage.classList.add('hidden');\n        }"
);

// GalviPath™ confidence/band remain available in Worker data but are not customer-visible.
html = html.replace(
  /\n\s*if\(result\.confidence!==undefined \|\| result\.confidence_band\)\{[\s\S]*?panel\.appendChild\(confidence\);\n\s*\}/,
  ''
);

// Customer grammar normalization helpers.
if (!html.includes('function normalizeCustomerSentence(value)')) {
  const marker = 'function vitalStatusLabel(score)';
  const helper = `function normalizeCustomerSentence(value){\n  const text=String(value??'').trim();\n  if(!text) return '';\n  const first=text.charAt(0).toUpperCase()+text.slice(1);\n  return /[.!?]$/.test(first)?first:first+'.';\n}\nfunction normalizeCustomerPhrase(value){\n  const text=String(value??'').trim();\n  if(!text) return '';\n  return text.charAt(0).toUpperCase()+text.slice(1);\n}\nfunction normalizeGalviCareCustomerCopy(value){\n  let text=normalizeCustomerSentence(value);\n  text=text.replace('Book GalviClinic™ when live Business Physician care would provide additional reassurance, decision support, accountability, or intervention.','Booking a GalviClinic™ session with a live GalviClinician would provide additional reassurance, decision support, accountability, or intervention.');\n  return text;\n}\n`;
  if (!html.includes(marker)) throw new Error('Cannot insert approved customer-copy normalization helpers.');
  html = html.replace(marker, helper + marker);
}

// GalviShot™ generated customer text.
html = html.replace("${escapeHtml(f.action||'Treat the highest priority business condition first.')}", "${escapeHtml(normalizeCustomerSentence(f.action||'Treat the highest priority business condition first.'))}");
html = html.replace("${escapeHtml(f.risk||f.finding_text||'Untreated business symptoms can become more expensive over time.')}", "${escapeHtml(normalizeCustomerSentence(f.risk||f.finding_text||'Untreated business symptoms can become more expensive over time.'))}");
replaceOnce("li.textContent=x; host.appendChild(li);", "li.textContent=normalizeCustomerSentence(x); host.appendChild(li);");

// GalviSight™ generated customer text.
replaceOnce("li.textContent=String(value);", "li.textContent=normalizeCustomerSentence(value);");
replaceOnce("title.textContent=`${index+1}. ${hypothesis.statement || hypothesis.label || hypothesis.finding_code || 'GalviSight hypothesis'}`;", "title.textContent=`${index+1}. ${normalizeCustomerSentence(hypothesis.statement || hypothesis.label || hypothesis.finding_code || 'GalviSight hypothesis')}`;");

// GalviPath™ generated customer text.
replaceOnce("item.textContent=String(value);", "item.textContent=normalizeCustomerSentence(value);");
replaceOnce("li.textContent=normalizeGalviPathText(action);", "li.textContent=normalizeCustomerSentence(normalizeGalviPathText(action));");
replaceOnce("copy.textContent=normalizeGalviPathText(result.clinical_rationale);", "copy.textContent=normalizeCustomerSentence(normalizeGalviPathText(result.clinical_rationale));");
replaceOnce("copy.textContent=normalizeGalviPathText(result.operating_cadence);", "copy.textContent=normalizeCustomerSentence(normalizeGalviPathText(result.operating_cadence));");
replaceOnce("copy.textContent=normalizeGalviPathText(result.support_recommendation);", "copy.textContent=normalizeGalviCareCustomerCopy(result.support_recommendation);");

// GalviPath™ Check Up support copy immediately above a centered scheduling-only CTA.
replaceOnce(
  "copy.textContent=normalizeCustomerSentence(normalizeGalviPathText(result.operating_cadence));\n        cadence.appendChild(copy); const checkupButton=document.createElement('button'); checkupButton.type='button'; checkupButton.className='secondary-button'; checkupButton.textContent='GalviPath Check Up'; checkupButton.addEventListener('click',openGalviPathCheckUp); cadence.appendChild(checkupButton); panel.appendChild(cadence);",
  "copy.textContent=normalizeCustomerSentence(normalizeGalviPathText(result.operating_cadence));\n        cadence.appendChild(copy);\n        const checkupSupport=document.createElement('p'); checkupSupport.className='center'; checkupSupport.textContent='Book GalviPath™ Check Up to help you Chart Your GalviPath™ with additional clarity & insight.'; cadence.appendChild(checkupSupport);\n        const checkupRow=document.createElement('div'); checkupRow.className='button-row'; const checkupButton=document.createElement('button'); checkupButton.type='button'; checkupButton.className='secondary-button'; checkupButton.textContent='GalviPath™ Check Up'; checkupButton.addEventListener('click',openGalviPathCheckUp); checkupRow.appendChild(checkupButton); cadence.appendChild(checkupRow); panel.appendChild(cadence);"
);

// Approved GalviClinic™ handoff language; preserve the canonical stage taxonomy string.
replaceOnce(
  "progression.textContent='Your GalviPath™ gives you the treatment plan. GalviClinic™ provides focused live Business Physician care to address the root cause of your most serious business symptoms and help your venture recover, stabilize, and grow.';",
  "progression.textContent='Your GalviPath™ gives you the treatment plan. GalviClinic™ enables a live GalviClinician to surgically address the root cause of your most serious business symptoms and help your venture recover, stabilize, and grow.';"
);

// Ensure approved trademarking appears in the active customer-facing Check Up copy.
html = html.replaceAll("textContent='GalviPath Check Up'", "textContent='GalviPath™ Check Up'");

// Final contract: fail only if an approved customer-facing outcome is still missing.
const required = [
  "Burn cash or worse — make decisions without realizing the real problem isn't where they're looking.",
  'Your GalviShot™ is Ready',
  'GALVISIGHT™ UNLOCKED',
  'class="center">Your GalviSight Prescription',
  'GALVIPATH™ UNLOCKED',
  'class="center">Chart Your GalviPath™',
  'Book GalviPath™ Check Up to help you Chart Your GalviPath™ with additional clarity & insight.',
  'Booking a GalviClinic™ session with a live GalviClinician would provide additional reassurance, decision support, accountability, or intervention.',
  'GalviClinic™ enables a live GalviClinician to surgically address the root cause',
  'function normalizeCustomerSentence(value)',
  "const GALVIPATH_CHECKUP_URL = 'https://calendly.com/galvilpro/chartyourgalvipath';"
];
for (const value of required) {
  if (!html.includes(value)) throw new Error(`FINAL PRESENTATION CONTRACT MISSING: ${value}`);
}
if (html.includes('Your Executive Clinical Findings Are Ready')) throw new Error('Obsolete GalviShot heading still exists.');

fs.writeFileSync(file, html, 'utf8');
console.log('Day 7A final customer-facing presentation source prepared successfully.');
