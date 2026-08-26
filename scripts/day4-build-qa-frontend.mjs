import { readFileSync, writeFileSync } from 'node:fs';

const OUT='dist-qa/index.html';
const ADAPTER='day4-galvichart-browser.js';
const HARDENING='day4-customer-experience-hardening.js';
const SIGNATURE='GalviCare Day 4 GalviChart customer projection v1';
const HARDENING_SIGNATURE='GalviCare Day 4 customer experience hardening v1';
const DRAFT_SIGNATURE='GalviCare Day 4 follow-up draft resilience v1';
const CUSTOMER_COPY_SIGNATURE='GalviCare Day 4 customer-safe governed interpretation v1';
let html=readFileSync(OUT,'utf8');
const adapter=readFileSync(ADAPTER,'utf8');
const hardening=readFileSync(HARDENING,'utf8');
if(!adapter.includes(SIGNATURE))throw new Error('Day 4 GalviChart adapter signature missing.');
for(const required of [HARDENING_SIGNATURE,DRAFT_SIGNATURE,CUSTOMER_COPY_SIGNATURE])if(!hardening.includes(required))throw new Error(`Day 4 customer hardening contract missing: ${required}`);
if(/api\.openai\.com|OPENAI_API_KEY/.test(adapter+hardening))throw new Error('Day 4 browser code must never call OpenAI or reference its secret.');
if(!adapter.includes('/api/v1/day4/chart'))throw new Error('Day 4 Chart API contract missing.');
if(!adapter.includes('X-Galvi-Day3-Session'))throw new Error('Day 4 secure customer-session contract missing.');
if(!adapter.includes('View GalviChart™'))throw new Error('Day 4 Chart customer CTA missing.');
for(const marker of [SIGNATURE,HARDENING_SIGNATURE]){
  while(html.includes(marker)){
    const index=html.indexOf(marker),start=html.lastIndexOf('<script>',index),end=html.indexOf('</script>',index);
    if(start<0||end<0)throw new Error(`Existing Day 4 script for ${marker} is not bounded by a script tag.`);
    html=html.slice(0,start)+html.slice(end+9);
  }
}
html=html.replace('</body>',`<script>\n${adapter}\n</script>\n<script>\n${hardening}\n</script>\n</body>`);
if((html.split(SIGNATURE).length-1)!==1)throw new Error('Generated QA frontend must contain exactly one Day 4 GalviChart adapter.');
if((html.split(HARDENING_SIGNATURE).length-1)!==1)throw new Error('Generated QA frontend must contain exactly one Day 4 customer hardening adapter.');
for(const required of ['GALVICHART™ | BUSINESS HEALTH RECORD','Overview','Health','Timeline','Care Plan','Evidence','Documents','GalviClinic','History','/api/v1/day4/chart','What GalviCare understands right now'])if(!html.includes(required))throw new Error(`Generated QA frontend missing Day 4 contract: ${required}`);
if(/api\.openai\.com|OPENAI_API_KEY/.test(adapter+hardening))throw new Error('Browser-to-OpenAI regression.');
writeFileSync(OUT,html,'utf8');
console.log('PASS — cumulative QA frontend contains secure Day 4 Chart plus follow-up draft resilience and customer-safe governed interpretation.');
