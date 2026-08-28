import { readFileSync, writeFileSync } from 'node:fs';
const OUT='dist-qa/index.html';
const ADAPTERS=[
  {
    source:'day5-score-metadata.js',
    signature:'GalviCare Day 5 canonical GalviScore metadata v1',
    required:[
      '/api/v1/day5/customer/score-metadata','X-Galvi-Day3-Session','galviscore-classification',
      'galviscore-lowest-category','day5-score-acuity-summary','Acuity is server-owned care urgency',
      'GalviCareDay5ScoreMetadata'
    ]
  },
  {
    source:'day5-path-evidence-strengthening.js',
    signature:'GalviCare Day 5 Path evidence strengthening projection v1',
    required:[
      'Evidence guidance:','required_data_completeness','evidence_quality','answer_consistency',
      'corroboration','context_completeness','customer_safe_v1','GalviCareDay5EvidenceStrengthening'
    ]
  },
  {
    source:'day5-customer-care-routing.js',
    signature:'GalviCare Day 5 customer care routing + GalviGuide v2',
    required:[
      '/api/v1/day5/customer/galviguide','X-Galvi-Day3-Session','GalviScore + Business Health Acuity',
      'Acuity','Open GalviGuide','Prepare with GalviGuide','GV_DAY5_CARE_ROUTE_NOT_READY',
      'Ask GalviGuide a Care-Navigation Question','GalviGuide AI Guidance','Recommended Next Actions',
      'data-day5-guide-answer','applyPathEvidenceGuidance','testBoundary'
    ]
  },
  {
    source:'day5-customer-active-care.js',
    signature:'GalviCare Day 5 customer Treatment Plan acknowledgement v1',
    required:[
      '/api/v1/day5/customer/treatment-plans/','/acknowledgement','/api/v1/day5/customer/checkins',
      'X-Galvi-Day3-Session','authorship','Idempotency-Key','GalviChartDay4.read'
    ]
  }
];

let html=readFileSync(OUT,'utf8');

function stripExisting(signature){
  while(html.includes(signature)){
    const index=html.indexOf(signature),start=html.lastIndexOf('<script>',index),end=html.indexOf('</script>',index);
    if(start<0||end<0)throw new Error(`Existing Day 5 adapter ${signature} is not bounded by a script tag.`);
    html=html.slice(0,start)+html.slice(end+9);
  }
}

// Remove the immediately previous adapter signature during the v1 -> v2 H6 presentation-only upgrade.
stripExisting('GalviCare Day 5 customer care routing + GalviGuide v1');

for(const config of ADAPTERS){
  const adapter=readFileSync(config.source,'utf8');
  for(const required of [config.signature,...config.required]){
    if(!adapter.includes(required))throw new Error(`Day 5 customer contract missing from ${config.source}: ${required}`);
  }
  if(/api\.openai\.com|OPENAI_API_KEY|bmr_id\s*:/.test(adapter)){
    throw new Error(`Day 5 browser adapter ${config.source} must not contain OpenAI access or submit BMR authority.`);
  }
  stripExisting(config.signature);
  html=html.replace('</body>',`<script>\n${adapter}\n</script>\n</body>`);
}

for(const config of ADAPTERS){
  if((html.split(config.signature).length-1)!==1)throw new Error(`Generated QA frontend must contain exactly one ${config.signature} adapter.`);
}
for(const required of [
  'galviscore-classification','galviscore-lowest-category','day5-score-acuity-summary','/api/v1/day5/customer/score-metadata',
  'GalviCare Day 5 Path evidence strengthening projection v1','Evidence guidance:','customer_safe_v1',
  'GalviScore + Business Health Acuity','Yellow — passive care / needs attention','Orange — active care recommended',
  'Open GalviGuide','Prepare with GalviGuide','The existing “What you should watch?” box is GalviScore guidance',
  'Ask GalviGuide a Care-Navigation Question','GalviGuide AI Guidance','Recommended Next Actions','data-day5-guide-answer',
  'applyPathEvidenceGuidance','Acknowledge Treatment Plan','Submit scheduled check-in','Acknowledgement is separate from Treatment Plan authorship.',
  '/api/v1/day5/customer/galviguide','/api/v1/day5/customer/checkins'
]){
  if(!html.includes(required))throw new Error(`Generated QA frontend missing Day 5 customer critical-path contract: ${required}`);
}
for(const prohibited of ['Provider: OpenAI','AI proof:','generated from your approved care state']){
  if(html.includes(prohibited))throw new Error(`Generated QA frontend exposes customer-facing GalviGuide technical metadata/copy that must remain hidden: ${prohibited}`);
}
writeFileSync(OUT,html,'utf8');
console.log('PASS — cumulative QA frontend contains canonical Score metadata, customer-safe governed GalviGuide AI guidance, customer-safe Path evidence fallback, server-owned Acuity routing, AI-synthesized Path evidence support, and Treatment Plan acknowledgement/check-in without browser score/Acuity/BMR/OpenAI authority.');
