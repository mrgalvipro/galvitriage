import { readFileSync, writeFileSync } from 'node:fs';

const OUT='dist-qa/index.html';
const ADAPTER='day4-galvichart-browser.js';
const SIGNATURE='GalviCare Day 4 GalviChart customer projection v1';
let html=readFileSync(OUT,'utf8');
const adapter=readFileSync(ADAPTER,'utf8');
if(!adapter.includes(SIGNATURE))throw new Error('Day 4 GalviChart adapter signature missing.');
if(/api\.openai\.com|OPENAI_API_KEY/.test(adapter))throw new Error('Day 4 browser adapter must never call OpenAI or reference its secret.');
if(!adapter.includes('/api/v1/day4/chart'))throw new Error('Day 4 Chart API contract missing.');
if(!adapter.includes('X-Galvi-Day3-Session'))throw new Error('Day 4 secure customer-session contract missing.');
if(!adapter.includes('View GalviChart™'))throw new Error('Day 4 Chart customer CTA missing.');
while(html.includes(SIGNATURE)){
  const marker=html.indexOf(SIGNATURE), start=html.lastIndexOf('<script>',marker), end=html.indexOf('</script>',marker);
  if(start<0||end<0)throw new Error('Existing Day 4 adapter is not bounded by a script tag.');
  html=html.slice(0,start)+html.slice(end+9);
}
html=html.replace('</body>',`<script>\n${adapter}\n</script>\n</body>`);
if((html.split(SIGNATURE).length-1)!==1)throw new Error('Generated QA frontend must contain exactly one Day 4 GalviChart adapter.');
for(const required of ['GALVICHART™ | BUSINESS HEALTH RECORD','Overview','Health','Timeline','Care Plan','Evidence','Documents','GalviClinic','History','/api/v1/day4/chart'])if(!html.includes(required))throw new Error(`Generated QA frontend missing Day 4 contract: ${required}`);
if(/api\.openai\.com|OPENAI_API_KEY/.test(adapter))throw new Error('Browser-to-OpenAI regression.');
writeFileSync(OUT,html,'utf8');
console.log('PASS — cumulative QA frontend contains one secure Day 4 GalviChart projection adapter.');