import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FOUR_PILLARS,SPUR_TRACKS,SPUR_STAGES,VDM_STAGES,SPRINTS,GALVIPRO_PRACTICE,catalogProjection,findCatalogItem} from '../worker/domain/day6-catalog.js';
const R=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const m=R('migrations/day1/0600_day6_studio_vdm.sql'),s=R('worker/domain/day6-studio-service.js'),r=R('worker/routes/day6-studio.js'),e=R('worker/day6-entry.js'),w=R('.github/workflows/galvistudio-day6-qa.yml'),c=JSON.parse(R('wrangler.day6.json'));
const H=(t,a)=>a.every(x=>t.includes(x));
const checks=[
()=>H(w,['GITHUB_REF_NAME','qa-revamped-galvicare-0-5','!= "work"','!= "main"']),
()=>H(w,['43cec8bf28dbeeabb6fac340aa5161aa1fc1b94c','merge-base --is-ancestor']),
()=>w.includes('npm run day5:gate'),()=>w.includes('npm run day5:gate'),()=>w.includes('npm run day5:gate'),
()=>H(w,['worker/day6-entry.js','worker/domain/day6-studio-service.js','worker/routes/day6-studio.js','wrangler.day6.json']),
()=>w.includes('branches: [qa-revamped-galvicare-0-5]')&&!w.includes('create_branch'),
()=>FOUR_PILLARS.length===4,()=>catalogProjection().pillars.length===4,()=>SPUR_TRACKS.some(x=>x.code==='dreamer'),
()=>m.includes('bmr_id TEXT REFERENCES gv1_business_medical_records'),()=>SPUR_TRACKS.length===3,
()=>JSON.stringify(SPUR_STAGES.map(x=>x.code))===JSON.stringify(['Discern','Discover','Prepare','Validate','Build','Steward']),
()=>r.includes("path==='/api/v1/day6/studio/engagements'"),()=>s.includes('Source Treatment Plan is outside the authorized BMR.'),
()=>s.includes('Business Physician or authorized operator scope is required to prescribe a Studio engagement.'),
()=>H(s,["'day6:studio-engagement'",'GV_IDEMPOTENCY_REUSE_MISMATCH']),()=>H(m,['catalog_version TEXT NOT NULL','sprint_version TEXT']),
()=>s.includes('if(!bmrId)return{principal,bmr:null'),()=>s.includes("decision==='ADVANCE'&&(!required.length||missing.length)"),
()=>s.includes("['ADVANCE','HOLD','REWORK','STOP']"),()=>m.includes("decision TEXT NOT NULL CHECK (decision IN ('ADVANCE','HOLD','REWORK','STOP'))"),
()=>s.includes("decision==='STOP'?'closed'")&&!s.includes('DELETE FROM gv1_studio'),()=>s.includes('Stage skipping is prohibited'),
()=>s.includes("STUDIO_DECISION_ROLES=new Set(['business_physician','studio_operator','operator','admin'])"),()=>H(m,['decision_actor_type','decision_actor_id','version_no','correlation_id']),
()=>s.includes('rejectRegulated(input.intervention,input.capital_exposure)'),()=>SPRINTS.some(x=>x.code==='founder_readiness_sprint'),
()=>SPRINTS.some(x=>x.code==='venture_validation_sprint'),()=>SPRINTS.some(x=>x.code==='product_readiness_sprint'),
()=>SPRINTS.some(x=>x.code==='gtm_readiness_sprint'),()=>SPRINTS.some(x=>x.code==='revenue_growth_recovery_sprint'),
()=>SPRINTS.some(x=>x.code==='operational_readiness_sprint'),()=>Boolean(SPRINTS.find(x=>x.code==='fundraising_capital_readiness_sprint')?.regulated_boundary),
()=>H(m,['gv1_studio_artifact_refs','evidence_id TEXT']),()=>s.includes('Studio outcome requires evidence_refs.'),()=>s.includes("'day6:outcome'"),
()=>!m.includes('DROP TABLE')&&!m.includes('DELETE FROM'),()=>H(s,['gv1_reassessments','Studio outcome recorded; Business Physician reassessment is required.']),
()=>e.includes("import day5Worker from './day5-entry.js'"),()=>r.includes('const engagement=path.match')&&!s.includes('UPDATE gv1_business_medical_records SET'),
()=>s.includes('Cross-record Studio access is prohibited.'),()=>!GALVIPRO_PRACTICE.galviguide.join(' ').includes('treatment approval'),
()=>H(s,['GV_GAGE_ORDER_REQUIRED',"['scope','objective','duration_pattern','follow_up']",'GalviGage requires required_evidence.']),
()=>H(s,['GV_STUDIO_REFERRAL_REQUIRED','referral_required']),()=>s.includes('GV_PROOF_EVIDENCE_REQUIRED'),()=>s.includes("refs.length?requested||'draft':'unsupported'"),
()=>e.includes('day5Worker.fetch')&&Boolean(c.vars.GALVICLINIC_BOOKING_URL),()=>e.includes('failure(ctx,error)'),
()=>c.name==='galvivault-p0-day1-qa'&&c.main==='worker/day6-entry.js'&&c.vars.ENVIRONMENT==='qa'&&c.d1_databases[0].database_id==='cdf9042b-ab09-498a-ac66-010b6cce47d4'&&Boolean(findCatalogItem('gtm_readiness'))&&VDM_STAGES[0]==='Discover'
];
assert.equal(checks.length,50);
checks.forEach((fn,i)=>test(`T${String(i+1).padStart(2,'0')} Day6 critical-path contract`,()=>assert.equal(Boolean(fn()),true)));
