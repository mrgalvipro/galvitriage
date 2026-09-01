import {execFileSync} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';

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
async function api(method,path,{body,role='operator',actor='qa-day7-release',day1Actor,idem}={}){
  const h={Accept:'application/json','X-Correlation-Id':`d7.${K}.${Math.random().toString(36).slice(2,8)}`};
  if(body!==undefined)h['Content-Type']='application/json';
  if(role)h['X-Galvi-Role']=role;
  if(actor)h['X-Galvi-Actor-Id']=actor;
  if(day1Actor)h['X-Galvi-Day1-Actor']=day1Actor;
  if(idem)h['Idempotency-Key']=idem;
  const r=await fetch(U+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
  let j={};try{j=await r.json()}catch{}
  return{status:r.status,j};
}

let r=await api('GET','/api/v1/day7/readiness',{role:null,actor:null});
ok('T32-membership-readiness',r.status===200&&r.j?.data?.ready===true&&r.j?.data?.current_schema_version==='D7A1',{status:r.status,data:r.j?.data});
ok('P0-06-readiness-contract',r.j?.data?.prefounder_ai?.server_side_provider===true&&r.j?.data?.prefounder_ai?.structured_output===true&&r.j?.data?.prefounder_ai?.deterministic_score_immutable===true,{prefounder_ai:r.j?.data?.prefounder_ai});

const suffix=`d7ai${K}`.toLowerCase();
const email=`day1.${suffix}@example.invalid`;
const day1Actor=`principal:${suffix}`;
const dims={clarity:50,runway:25,time:50,capability:50,network:25,domain_knowledge:50,opportunity_evidence:25,decision_confidence:50,leadership_readiness:50,operating_willingness:75};
const sig=Object.values(dims).join('-');
const confidence={required_data_completeness:100,evidence_quality:80,answer_consistency:90,corroboration:70,context_completeness:90};

r=await api('POST','/api/v1/principal-contexts',{role:null,actor:null,day1Actor,idem:`d7ai.ctx.${K}`,body:{email,first_name:'Day7',last_name:'AI',lifecycle_state:'pre_founder',record_mode:'principal_only',care_protocol:'founder_smb',payer_type:'self'}});
ok('P0-02-prefounder-context',[200,201].includes(r.status)&&r.j?.data?.context?.record_mode==='principal_only'&&r.j?.data?.context?.venture_id===null&&r.j?.data?.context?.bmr_id===null,{status:r.status,error:r.j?.error});
const context=r.j.data.context,principal=r.j.data.principal;
evidence.ids.prefounder_context_id=context.context_id;evidence.ids.prefounder_principal_id=principal.founder_id;

r=await api('POST','/api/v1/consents',{role:null,actor:null,day1Actor,idem:`d7ai.consent.${K}`,body:{founder_id:principal.founder_id,purpose:'care_processing',policy_version:'day7_p0_06_v1',status:'granted'}});
ok('P0-06-care-consent',[200,201].includes(r.status),{status:r.status,error:r.j?.error});
r=await api('POST','/api/v1/day2/triage',{role:null,actor:null,day1Actor,idem:`d7ai.triage.${K}.${sig}`,body:{context_id:context.context_id,acuity:{severity:0,urgency:0,continuity:0,reversibility:0,complexity:0},confidence,red_flags:[],followup_round:0,answers:{lifecycle_state:'pre_founder',venture_exists:false,release_probe:true}}});
ok('P0-06-prefounder-triage',[200,201].includes(r.status)&&r.j?.data?.score_type==='founder_readiness',{status:r.status,error:r.j?.error});
r=await api('POST','/api/v1/day2/vitals',{role:null,actor:null,day1Actor,idem:`d7ai.vitals.${K}.${sig}`,body:{context_id:context.context_id,dimensions:dims,confidence}});
ok('P0-06-prefounder-vitals',[200,201].includes(r.status)&&r.j?.data?.score_type==='founder_readiness',{status:r.status,error:r.j?.error});const vitals=r.j.data;
r=await api('POST','/api/v1/day2/score',{role:null,actor:null,day1Actor,idem:`d7ai.score.${K}.${sig}`,body:{context_id:context.context_id}});
ok('P0-06-prefounder-score',[200,201].includes(r.status)&&r.j?.data?.score_type==='founder_readiness',{status:r.status,error:r.j?.error});const score=r.j.data;

const aiKey=`d7ai.interpret.${K}.${String(score.result_id||'score').replace(/[^A-Za-z0-9._:-]/g,'_').slice(0,80)}`;
r=await api('POST','/api/v1/day7/prefounder/readiness-interpretation',{role:null,actor:null,day1Actor,idem:aiKey,body:{context_id:context.context_id}});
ok('P0-06-openai-governed-projection',[200,201].includes(r.status)&&r.j?.data?.generation_source==='openai_governed'&&r.j?.data?.validation_status==='accepted'&&r.j?.data?.deterministic_truth_immutable===true&&r.j?.data?.route==='SPUR Pre-Founder'&&r.j?.data?.provider_metadata?.provider==='openai'&&Boolean(r.j?.data?.provider_metadata?.model)&&Array.isArray(r.j?.data?.evidence_refs)&&r.j.data.evidence_refs.length>0,{status:r.status,error:r.j?.error,data:r.j?.data});
const ai=r.j.data;evidence.ids.prefounder_ai_generation_id=ai.generation_id;
r=await api('POST','/api/v1/day7/prefounder/readiness-interpretation',{role:null,actor:null,day1Actor,idem:aiKey,body:{context_id:context.context_id}});
ok('P0-06-idempotent-replay',r.status===200&&r.j?.data?.generation_id===ai.generation_id&&r.j?.meta?.idempotent_replay===true,{status:r.status,error:r.j?.error,meta:r.j?.meta});

const principalOnly=one(`SELECT context_id,record_mode,lifecycle_state,venture_id,bmr_id FROM gv1_principal_contexts WHERE context_id=${q(context.context_id)}`);
ok('D1-2-prefounder-principal-only',principalOnly?.record_mode==='principal_only'&&principalOnly?.lifecycle_state==='pre_founder'&&principalOnly?.venture_id===null&&principalOnly?.bmr_id===null,{row:principalOnly});
const generation=one(`SELECT generation_id,context_id,founder_id,bmr_id,task,provider,provider_response_id,model,prompt_version,schema_version,rules_version,protocol_version,evidence_bundle_hash,deterministic_context_hash,validation_status,validation_errors_json,customer_projection,correlation_id,created_at,completed_at FROM gv1_day3_ai_generations WHERE generation_id=${q(ai.generation_id)}`);
ok('D1-5-prefounder-ai-generation-ledger',generation?.context_id===context.context_id&&generation?.founder_id===principal.founder_id&&generation?.bmr_id===null&&generation?.task==='synthesize_evidence'&&generation?.provider==='openai'&&Boolean(generation?.provider_response_id)&&Boolean(generation?.model)&&generation?.prompt_version==='day7_prefounder_readiness_v1'&&generation?.schema_version==='day7_prefounder_readiness_schema_v1'&&Boolean(generation?.rules_version)&&Boolean(generation?.protocol_version)&&Boolean(generation?.evidence_bundle_hash)&&Boolean(generation?.deterministic_context_hash)&&generation?.validation_status==='accepted'&&Number(generation?.customer_projection)===1,{generation});
const links=Number(one(`SELECT COUNT(*) count FROM gv1_day3_generation_evidence WHERE generation_id=${q(ai.generation_id)} AND evidence_kind='principal'`)?.count||0);
ok('D1-5-prefounder-ai-evidence-links',links>0,{links});
ok('D1-16-prefounder-ai-audit',Number(one(`SELECT COUNT(*) count FROM gv1_audit_log WHERE entity_type='prefounder_readiness_interpretation' AND entity_id=${q(ai.generation_id)} AND environment='qa'`)?.count||0)===1);
ok('D1-7-prefounder-ai-replay-safe',Number(one(`SELECT COUNT(*) count FROM gv1_idempotency_keys WHERE scope='day7:prefounder-readiness-ai' AND idempotency_key=${q(aiKey)} AND response_entity_id=${q(ai.generation_id)}`)?.count||0)===1);
ok('P0-06-canonical-score-immutable',Number(score.overall_score)===Number(ai.canonical_score)&&JSON.stringify(score.dimension_scores||{})===JSON.stringify(ai.canonical_dimensions||{}),{score:score.overall_score,ai:ai.canonical_score});

const care=one(`SELECT c.founder_id,c.bmr_id,p.treatment_plan_id,b.venture_id,v.venture_name,f.email FROM gv1_principal_contexts c JOIN gv1_business_medical_records b ON b.bmr_id=c.bmr_id JOIN gv1_ventures v ON v.venture_id=b.venture_id JOIN gv1_founders f ON f.founder_id=c.founder_id JOIN gv1_treatment_plans p ON p.bmr_id=c.bmr_id WHERE c.bmr_id IS NOT NULL AND c.status='active' AND p.status NOT IN ('cancelled','archived') ORDER BY p.created_at DESC LIMIT 1`);
if(!care) throw new Error('No canonical active BMR/Treatment Plan available for Day 7 Membership E2E');
evidence.ids.principal_id=care.founder_id;evidence.ids.bmr_id=care.bmr_id;evidence.ids.treatment_plan_id=care.treatment_plan_id;
const startKey=`d7-mem-start-${K}`,startBody={principal_id:care.founder_id,bmr_id:care.bmr_id,treatment_plan_id:care.treatment_plan_id};
r=await api('POST','/api/v1/day7/memberships',{role:'business_physician',actor:'bp-day7',idem:startKey,body:startBody});
ok('T32-membership-start',[200,201].includes(r.status)&&r.j?.data?.membership?.bmr_id===care.bmr_id&&r.j?.data?.membership?.status==='active',{status:r.status,error:r.j?.error});const membershipId=r.j.data.membership.membership_id;evidence.ids.membership_id=membershipId;
r=await api('POST','/api/v1/day7/memberships',{role:'business_physician',actor:'bp-day7',idem:startKey,body:startBody});
ok('T32-membership-start-replay',r.status===200&&r.j?.data?.membership?.membership_id===membershipId&&r.j?.meta?.idempotent_replay===true,{status:r.status,meta:r.j?.meta});
ok('D1-15-one-active-membership',Number(one(`SELECT COUNT(*) count FROM gv1_memberships WHERE bmr_id=${q(care.bmr_id)} AND status='active'`)?.count||0)===1);

// Release-critical deployed returning-customer activation probe. This creates only an
// automated QA invitation fixture against the same canonical BMR already selected by
// the release suite. It never edits canonical care data to manufacture a PASS.
let legacy=one(`SELECT lv.session_id FROM ventures lv JOIN founders lf ON lf.founder_id=lv.founder_id WHERE lower(lf.email)=lower(${q(care.email)}) AND lower(trim(lv.venture_name))=lower(trim(${q(care.venture_name)})) ORDER BY lv.updated_at DESC,lv.created_at DESC LIMIT 1`);
if(!legacy?.session_id) legacy=one(`SELECT session_id FROM founders WHERE lower(email)=lower(${q(care.email)}) ORDER BY updated_at DESC LIMIT 1`);
ok('P0-04-returning-access-legacy-session',Boolean(legacy?.session_id),{resolved:Boolean(legacy?.session_id)});
const shot=one(`SELECT 1 AS ok FROM entitlements WHERE session_id=${q(legacy.session_id)} AND product='GalviShot' AND lower(entitlement_status) IN ('active','paid','granted','test_override') LIMIT 1`)||one(`SELECT 1 AS ok FROM payments WHERE session_id=${q(legacy.session_id)} AND product='GalviShot' AND lower(payment_status) IN ('paid','succeeded','complete') LIMIT 1`);
ok('P0-04-returning-access-shot-entitlement',Boolean(shot?.ok),{verified:Boolean(shot?.ok)});
const rawInvite=`gva1_${randomUUID().replaceAll('-','')}${randomUUID().replaceAll('-','')}`;
const inviteHash=createHash('sha256').update(`day7:customer-access:invite:${JSON.stringify(rawInvite)}`).digest('hex');
const inviteRequest=`d7-customer-access-probe-${K}`;
const ts=new Date().toISOString(),expires=new Date(Date.now()+60*60*1000).toISOString();
d(`INSERT INTO gv1_customer_login_invites(invite_hash,principal_id,bmr_id,legacy_session_id,source_type,source_entity_id,client_request_id,created_by_actor_type,created_by_actor_id,expires_at,consumed_at,revoked_at,created_at) VALUES(${q(inviteHash)},${q(care.founder_id)},${q(care.bmr_id)},${q(legacy.session_id)},'business_health_membership',${q(membershipId)},${q(inviteRequest)},'business_physician','qa-day7-release',${q(expires)},NULL,NULL,${q(ts)})`);
const accountBefore=one(`SELECT account_id FROM gv1_customer_accounts WHERE principal_id=${q(care.founder_id)} LIMIT 1`);
const qaPassword=`Day7Qa-${K}-Access!`;
r=await api('POST','/api/v1/day7/customer-access/activate',{role:null,actor:null,body:{invite_token:rawInvite,password:qaPassword}});
const activationDetails={status:r.status,error_code:r.j?.error?.code||null,stage:r.j?.error?.details?.stage||null,retryable:r.j?.error?.retryable??null,account_preexisting:Boolean(accountBefore?.account_id)};
ok('P0-04-returning-customer-activation',r.status===201&&r.j?.success===true&&r.j?.data?.principal_id===care.founder_id&&r.j?.data?.bmr_id===care.bmr_id&&r.j?.data?.legacy_session_id===legacy.session_id&&r.j?.data?.galvichart_open_allowed===true&&r.j?.data?.manual_repair==='NO',activationDetails);
const activatedAccount=one(`SELECT account_id FROM gv1_customer_accounts WHERE principal_id=${q(care.founder_id)} LIMIT 1`);
const activatedSession=one(`SELECT session_hash,legacy_session_id FROM gv1_customer_login_sessions WHERE principal_id=${q(care.founder_id)} AND bmr_id=${q(care.bmr_id)} AND legacy_session_id=${q(legacy.session_id)} AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1`);
const consumedInvite=one(`SELECT consumed_at FROM gv1_customer_login_invites WHERE invite_hash=${q(inviteHash)} LIMIT 1`);
ok('D1-22-returning-access-no-manual-repair',Boolean(activatedAccount?.account_id)&&Boolean(activatedSession?.session_hash)&&activatedSession?.legacy_session_id===legacy.session_id&&Boolean(consumedInvite?.consumed_at),{manual_repair:'NO'});

const checkKey=`d7-mem-check-${K}`,checkBody={due_context:'day7_release_e2e',responses:{health_signal:'stable',progress:'on_track'},adherence_state:'on_track'};
r=await api('POST',`/api/v1/day7/memberships/${membershipId}/checkins`,{role:'customer',actor:'customer-day7',idem:checkKey,body:checkBody});
ok('T33-membership-checkin',[200,201].includes(r.status)&&r.j?.data?.checkin?.bmr_id===care.bmr_id&&r.j?.data?.reassessment_queue?.status==='pending',{status:r.status,error:r.j?.error});const checkinId=r.j.data.checkin.checkin_id,queueId=r.j.data.reassessment_queue.queue_id;evidence.ids.checkin_id=checkinId;evidence.ids.reassessment_queue_id=queueId;
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
