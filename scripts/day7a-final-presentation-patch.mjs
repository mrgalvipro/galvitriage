import fs from 'node:fs';

const file = process.argv[2] || 'index.html';
let html = fs.readFileSync(file, 'utf8');

function replaceRequired(oldText, newText, label) {
  if (html.includes(newText)) return;
  if (!html.includes(oldText)) {
    throw new Error(`SOURCE DRIFT: ${label}\nExpected source text was not found.`);
  }
  html = html.replace(oldText, newText);
}

/* FINAL DAY 7A PRESENTATION NORMALIZATION — CRITICAL PATH ONLY */
replaceRequired(
  'Burn Cash. Or worse — make decisions without realizing the real problem isn\'t where they\'re looking.',
  'Burn cash or worse — make decisions without realizing the real problem isn\'t where they\'re looking.',
  'GalviTriage header sentence'
);
html = html.replace(/Burn cash\. Or worse\s*[—-]\s*make decisions without realizing the real problem isn't where they're looking\./g,"Burn cash or worse — make decisions without realizing the real problem isn't where they're looking.");
html = html.replace(/<h1 class="center">Your Executive Clinical Findings Are Ready<\/h1>/g,'<h1 class="center">Your GalviShot™ is Ready</h1>');
html = html.replace(/<h1>Your Executive Clinical Findings Are Ready\.?<\/h1>/g,'<h1>Your GalviShot™ is Ready</h1>');
html = html.replace(/<p class="eyebrow">GALVISIGHT™<\/p>\s*<h1>Your GalviSight Prescription<\/h1>/g,'<p class="eyebrow">GALVISIGHT™ UNLOCKED</p>\n    <h1 class="center">Your GalviSight Prescription</h1>');
html = html.replace(/<p class="eyebrow">GALVISIGHT™<\/p>\s*<h1 class="center">Your GalviSight Prescription<\/h1>/g,'<p class="eyebrow">GALVISIGHT™ UNLOCKED</p>\n    <h1 class="center">Your GalviSight Prescription</h1>');
html = html.replace(/if\s*\(\s*stateMessage\s*\)\s*\{\s*stateMessage\.textContent\s*=\s*['"]GalviSight interpretation ready\.['"];\s*stateMessage\.classList\.add\(['"]gshot-success['"]\);\s*\}/g,"if(stateMessage){ stateMessage.textContent=''; stateMessage.classList.remove('gshot-success'); stateMessage.classList.add('hidden'); }");
html = html.replace(/stateMessage\.textContent\s*=\s*['"]GalviSight interpretation ready\.['"];/g,"stateMessage.textContent=''; stateMessage.classList.add('hidden');");
html = html.replace(/<div class="gshot-stage-pill">Current Stage: Chart Your GalviPath<\/div>\s*<h2>Chart Your GalviPath™<\/h2>/g,'<p class="eyebrow">GALVIPATH™ UNLOCKED</p>\n    <h2 class="center">Chart Your GalviPath™</h2>');
html = html.replace(/<div class="gshot-stage-pill">Current Stage: GalviPath Result<\/div>\s*<h2>Chart Your GalviPath™<\/h2>/g,'<p class="eyebrow">GALVIPATH™ UNLOCKED</p>\n    <h2 class="center">Chart Your GalviPath™</h2>');
html = html.replace(/stateMessage\.textContent\s*=\s*['"]Your GalviPath™ is ready\.['"];/g,"stateMessage.textContent=''; stateMessage.classList.add('hidden');");
html = html.replace(/stateMessage\.textContent\s*=\s*['"]Your deterministic GalviPath is ready\.['"];/g,"stateMessage.textContent=''; stateMessage.classList.add('hidden');");
html = html.replace(/<p[^>]*>\s*Confidence:\s*<strong[^>]*id="galvipath-confidence"[^>]*>[\s\S]*?<\/p>/g,'');
html = html.replace(/<p[^>]*>\s*Band:\s*<strong[^>]*id="galvipath-confidence-band"[^>]*>[\s\S]*?<\/p>/g,'');
html = html.replace(/<p[^>]*>\s*Confidence:\s*<span[^>]*id="galvipath-confidence"[^>]*>[\s\S]*?<\/p>/g,'');
html = html.replace(/<p[^>]*>\s*Confidence:\s*[\s\S]*?\|\s*Band:\s*[\s\S]*?<\/p>/g,'');
const checkupButtonPattern=/(<button[^>]*id="galvipath-checkup"[^>]*>GalviPath(?:™)? Check Up<\/button>)/;
if(checkupButtonPattern.test(html)&&!html.includes('Book GalviPath™ Check Up to help you Chart Your GalviPath™ with additional clarity & insight.')) html=html.replace(checkupButtonPattern,'<div class="center"><p>Book GalviPath™ Check Up to help you Chart Your GalviPath™ with additional clarity &amp; insight.</p>$1</div>');
const brandPairs=[['GalviCare ','GalviCare™ '],['GalviTriage ','GalviTriage™ '],['GalviVitals ','GalviVitals™ '],['GalviScore ','GalviScore™ '],['GalviShot ','GalviShot™ '],['GalviSight ','GalviSight™ '],['GalviPath ','GalviPath™ '],['GalviClinic ','GalviClinic™ '],['GalviLab ','GalviLab™ ']];
for(const [plain,marked] of brandPairs){const escaped=plain.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(`\\b${escaped}(?!™)\\b`,'g'),marked.trim());}
html=html.replace(/™™/g,'™');
html=html.replace(/\bBusiness Physician care\b/g,'GalviClinician care');
html=html.replace(/\ba Business Physician\b/g,'a GalviClinician');
html=html.replace(/\bBusiness Physician\b/g,'GalviClinician');
html=html.replace(/Book GalviClinic™? when live (?:Business Physician|GalviClinician) care would provide additional reassurance, decision support, accountability, or intervention\./g,'Booking a GalviClinic™ session with a live GalviClinician would provide additional reassurance, decision support, accountability, or intervention.');
html=html.replace(/Your GalviPath™ gives you the treatment plan\. GalviClinic™ provides focused live (?:Business Physician|GalviClinician) care to address the root cause of your most serious business symptoms and help your venture recover, stabilize, and grow\./g,'Your GalviPath™ gives you the treatment plan. GalviClinic™ enables a live GalviClinician to surgically address the root cause of your most serious business symptoms and help your venture recover, stabilize, and grow.');
if(!html.includes('function normalizeCustomerSentence(')){
  const marker='function scoreClinicalCopy(key)';
  const helper=`function normalizeCustomerSentence(value){\n  const text=String(value??'').trim();\n  if(!text) return '';\n  const first=text.charAt(0).toUpperCase()+text.slice(1);\n  return /[.!?]$/.test(first)?first:first+'.';\n}\nfunction normalizeCustomerPhrase(value){\n  const text=String(value??'').trim();\n  if(!text) return '';\n  return text.charAt(0).toUpperCase()+text.slice(1);\n}\n`;
  if(html.includes(marker)) html=html.replace(marker,helper+marker); else throw new Error('SOURCE DRIFT: grammar helper insertion marker');
}
html=html.replace(/review whether ([^'"`]+?) is improving and whether the prescribed treatment should continue unchanged\./g,'review whether $1 are improving and whether the prescribed treatment should continue unchanged.');
html=html.replace(/<strong>Prescription:<\/strong>\s*\$\{([^}]+)\}/g,'<strong>Prescription:</strong> ${normalizeCustomerSentence($1)}');
html=html.replace(/<strong>Why This Matters:<\/strong>\s*\$\{([^}]+)\}/g,'<strong>Why This Matters:</strong> ${normalizeCustomerSentence($1)}');
html=html.replace(/\.textContent\s*=\s*item\.action\s*;/g,'.textContent=normalizeCustomerSentence(item.action);');
html=html.replace(/\.textContent\s*=\s*item\.statement\s*;/g,'.textContent=normalizeCustomerSentence(item.statement);');
const required=['Your GalviShot™ is Ready','GALVISIGHT™ UNLOCKED','Your GalviSight Prescription','GALVIPATH™ UNLOCKED','Chart Your GalviPath™','GalviClinician',"const GALVIPATH_CHECKUP_URL = 'https://calendly.com/galvilpro/chartyourgalvipath';"];
for(const value of required) if(!html.includes(value)) throw new Error(`FINAL CONTRACT MISSING: ${value}`);
if(html.includes('Your Executive Clinical Findings Are Ready')) throw new Error('FINAL CONTRACT FAILED: obsolete GalviShot paywall heading remains.');
fs.writeFileSync(file,html,'utf8');
console.log(`Day 7A final presentation normalization applied to ${file}.`);
