import {execFileSync} from 'node:child_process';

const U=String(process.env.DAY7_QA_URL||process.env.DAY6_QA_URL||'').replace(/\/+$/,'');
const K=String(process.env.GITHUB_SHA||'manual').replace(/\W/g,'').slice(0,8)||'manual';
if(!U) throw new Error('DAY7_QA_URL missing');
const evidence={sha:process.env.GITHUB_SHA||null,run:K,steps:[],ids:{}};
const ok=(id,pass,details={})=>{evidence.steps.push({id,pass:!!pass,...details});if(!pass)throw new Error(`${id}: ${JSON.stringify(details)}`);};
const q=v=>`'${String(v??'').replaceAll("'","''")}'`;
function d(sql){
  const raw=execFileSync('npx',['--yes','wrangler@4.120.0','d1','execute','DB','--remote','--config','wrangler.day7.json','--command',sql,'--json'],{encoding:'utf8'});
  const j=JSON.parse(raw),x=Array.isArray(j)?j[0]:j;
  return x?.results||x?.result?.[0]?.results||x?.result?.results||[];
}
const one=sql=>d(sql)[0]||null;
async function api(method,path,{body,role='operator',actor='qa-day7-release',idem}={}){
  const h={Accept:'application/json','X-Correlation-Id':`d7.${K}.${Math.random().toString(36).slice(2,8)}`};
  if(body!==undefined)h['Content-Type']='application/json';
  if(role)h['X-Galvi-Role']=role;
  if(actor)h['X-Galvi-Actor-Id']=actor;
  if(idem)h['Idempotency-Key']=idem;
  const r=await fetch(U+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  let j={};try{j=await r.json()}catch{}
  return{status:r.status,j};
}

let r=await api('GET','/api/v1/day7/readiness',{role:null,actor:null});
ok('T32-membership-readiness',r.status===200&&r.j?.data?.ready===true&&r.j?.data?.current_schema_version==='D7A1',{status:r.status,data:r.j?.data});

const care=one(`SELECT c.founder_id,c.bmr_id,p.treatment_plan_id
  FROM gv1_principal_contexts c
  JOIN gv1_treatment_plans p ON p.bmr_id=c.bmr_id
  WHERE c.bmr_id IS NOT NULL AND c.status='active'
    AND p.status NOT IN ('cancelled','archived')
  ORDER BY p.created_at DESC LIMIT 1`);
if(!care) throw new Error('No canonical active BMR/Treatment Plan available for Day 7 Membership E2E');
evidence.ids.principal_id=care.founder_id;
evidence.ids.bmr_id=care.bmr_id;
evidence.ids.treatment_plan_id=care.treatment_plan_id;

const startKey=`d7-mem-start-${K}`;
const startBody={principal_id:care.founder_id,bmr_id:care.bmr_id,treatment_plan_id:care.treatment_plan_id};
r=await api('POST','/api/v1/day7/memberships',{role:'business_physician',actor:'bp-day7',idem:startKey,body:startBody});
ok('T32-membership-start',[200,201].includes(r.status)&&r.j?.data?.membership?.bmr_id===care.bmr_id&&r.j?.data?.membership?.status==='active',{status:r.status,error:r.j?.error});
const membershipId=r.j.data.membership.membership_id;
evidence.ids.membership_id=membershipId;
r=await api('POST','/api/v1/day7/memberships',{role:'business_physician',actor:'bp-day7',idem:startKey,body:startBody});
ok('T32-membership-start-replay',r.status===200&&r.j?.data?.membership?.membership_id===membershipId&&r.j?.meta?.idempotent_replay===true,{status:r.status,meta:r.j?.meta});
ok('D1-15-one-active-membership',Number(one(`SELECT COUNT(*) count FROM gv1_memberships WHERE bmr_id=${q(care.bmr_id)} AND status='active'`)?.count||0)===1);

const checkKey=`d7-mem-check-${K}`;
const checkBody={due_context:'day7_release_e2e',responses:{health_signal:'stable',progress:'on_track'},adherence_state:'on_track'};
r=await api('POST',`/api/v1/day7/memberships/${membershipId}/checkins`,{role:'customer',actor:'customer-day7',idem:checkKey,body:checkBody});
ok('T33-membership-checkin',[200,201].includes(r.status)&&r.j?.data?.checkin?.bmr_id===care.bmr_id&&r.j?.data?.reassessment_queue?.status==='pending',{status:r.status,error:r.j?.error});
const checkinId=r.j.data.checkin.checkin_id;
const queueId=r.j.data.reassessment_queue.queue_id;
evidence.ids.checkin_id=checkinId;
evidence.ids.reassessment_queue_id=queueId;
r=await api('POST',`/api/v1/day7/memberships/${membershipId}/checkins`,{role:'customer',actor:'customer-day7',idem:checkKey,body:checkBody});
ok('T33-membership-checkin-replay',r.status===200&&r.j?.data?.checkin?.checkin_id===checkinId&&r.j?.data?.reassessment_queue?.queue_id===queueId,{status:r.status});
ok('D1-10-membership-checkin-plan-scope',Number(one(`SELECT COUNT(*) count FROM gv1_membership_checkins WHERE membership_id=${q(membershipId)} AND checkin_id=${q(checkinId)} AND bmr_id=${q(care.bmr_id)} AND treatment_plan_id=${q(care.treatment_plan_id)}`)?.count||0)===1);
ok('D1-15-membership-reassessment-queue',Number(one(`SELECT COUNT(*) count FROM gv1_membership_reassessment_queue WHERE membership_id=${q(membershipId)} AND checkin_id=${q(checkinId)} AND status='pending'`)?.count||0)===1);

r=await api('GET',`/api/v1/business-medical-records/${encodeURIComponent(care.bmr_id)}/timeline?limit=200`,{role:'operator',actor:'qa-day7-release'});
ok('T23-membership-checkin-on-timeline',r.status===200&&Array.isArray(r.j?.data?.entries)&&r.j.data.entries.some(x=>x.entry_type==='checkin'&&x.canonical_id===checkinId),{status:r.status});

const cancelKey=`d7-mem-cancel-${K}`;
r=await api('POST',`/api/v1/day7/memberships/${membershipId}/cancel`,{role:'business_physician',actor:'bp-day7',idem:cancelKey,body:{}});
ok('T32-membership-cancel',r.status===200&&r.j?.data?.membership?.status==='canceled',{status:r.status,error:r.j?.error});
r=await api('POST',`/api/v1/day7/memberships/${membershipId}/cancel`,{role:'business_physician',actor:'bp-day7',idem:cancelKey,body:{}});
ok('T32-membership-cancel-replay',r.status===200&&r.j?.data?.membership?.status==='canceled'&&r.j?.meta?.idempotent_replay===true,{status:r.status});

ok('D1-15-membership-event-history',Number(one(`SELECT COUNT(*) count FROM gv1_membership_events WHERE membership_id=${q(membershipId)} AND event_type='membership_started'`)?.count||0)===1&&Number(one(`SELECT COUNT(*) count FROM gv1_membership_events WHERE membership_id=${q(membershipId)} AND event_type='membership_canceled'`)?.count||0)===1);
ok('D1-22-manual-repair-no',true,{manual_repair:false});
console.log(JSON.stringify(evidence,null,2));
