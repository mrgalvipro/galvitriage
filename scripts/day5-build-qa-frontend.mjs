import { readFileSync, writeFileSync } from 'node:fs';
const OUT='dist-qa/index.html';
const SOURCE='day5-customer-active-care.js';
const SIGNATURE='GalviCare Day 5 customer Treatment Plan acknowledgement v1';
let html=readFileSync(OUT,'utf8');
const adapter=readFileSync(SOURCE,'utf8');
for(const required of [SIGNATURE,'/api/v1/day5/customer/treatment-plans/','/acknowledgement','/api/v1/day5/customer/checkins','X-Galvi-Day3-Session','authorship','Idempotency-Key','GalviChartDay4.read']) if(!adapter.includes(required)) throw new Error(`Day 5 customer active-care contract missing: ${required}`);
if(/api\.openai\.com|OPENAI_API_KEY|bmr_id\s*:/.test(adapter)) throw new Error('Day 5 browser must not contain OpenAI access or submit BMR authority.');
while(html.includes(SIGNATURE)){
  const index=html.indexOf(SIGNATURE),start=html.lastIndexOf('<script>',index),end=html.indexOf('</script>',index);
  if(start<0||end<0)throw new Error('Existing Day 5 adapter is not bounded by a script tag.');
  html=html.slice(0,start)+html.slice(end+9);
}
html=html.replace('</body>',`<script>\n${adapter}\n</script>\n</body>`);
if((html.split(SIGNATURE).length-1)!==1)throw new Error('Generated QA frontend must contain exactly one Day 5 customer active-care adapter.');
for(const required of ['Acknowledge Treatment Plan','Submit scheduled check-in','Acknowledgement is separate from Treatment Plan authorship.','/api/v1/day5/customer/checkins']) if(!html.includes(required)) throw new Error(`Generated QA frontend missing Day 5 H19 contract: ${required}`);
writeFileSync(OUT,html,'utf8');
console.log('PASS — cumulative QA frontend contains Day 5 customer Treatment Plan acknowledgement + scheduled check-in without browser BMR authority.');
