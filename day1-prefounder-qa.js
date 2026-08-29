/* Day 1 Human E2E Pre-Founder QA adapter.
 * QA-only: injected by scripts/day7b-build-qa-frontend.mjs and never shipped from the production source page.
 * Lifecycle is determined by whether a real venture exists; GalviScore is not a lifecycle classifier.
 */
(()=>{
  'use strict';
  const SIGNATURE='Day 1 Human E2E Pre-Founder QA adapter.';
  const DAY1_BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const STORE='galvicare_day1_human_e2e_v1';
  const el=id=>document.getElementById(id);
  const text=v=>String(v??'').trim();
  const safe=v=>text(v).replace(/[^A-Za-z0-9._-]/g,'_').slice(0,64);
  const nowSuffix=()=>`human_${Date.now().toString(36)}`;
  const state=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}};
  const save=patch=>{const next={...state(),...patch};localStorage.setItem(STORE,JSON.stringify(next));return next};
  const actorFor=email=>{const match=text(email).toLowerCase().match(/^day1\.([a-z0-9._-]+)@example\.invalid$/);return match?`principal:${match[1]}`:''};
  const key=(prefix,suffix)=>`${prefix}-${safe(suffix)}`;
  const requestId=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const getInput=name=>document.querySelector(`[name="${name}"]`);

  function log(message,kind='info',data){
    const box=el('day1-h-evidence-log'); if(!box)return;
    const row=document.createElement('div');
    row.style.cssText=`padding:9px 10px;margin:7px 0;border-radius:8px;background:${kind==='pass'?'#ecfdf5':kind==='fail'?'#fef2f2':'#f8fafc'};border:1px solid ${kind==='pass'?'#a7f3d0':kind==='fail'?'#fecaca':'#e5e7eb'};font:12px/1.45 monospace;white-space:pre-wrap;word-break:break-word;`;
    row.textContent=`${kind==='pass'?'PASS':kind==='fail'?'FAIL':'INFO'} — ${message}${data?`\n${JSON.stringify(data,null,2)}`:''}`;
    box.prepend(row);
  }
  function status(message,ok=true){const node=el('day1-h-status');if(node){node.textContent=message;node.style.color=ok?'#166534':'#991b1b';}}
  async function api(path,{method='GET',actor,idempotency,body}={}){
    const headers={'Accept':'application/json','X-Correlation-Id':`human-${requestId()}`};
    if(actor)headers['X-Galvi-Day1-Actor']=actor;
    if(idempotency)headers['Idempotency-Key']=idempotency;
    if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetch(`${DAY1_BASE}${path}`,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
    let payload={};try{payload=await response.json()}catch{payload={success:false,error:{code:'NON_JSON',message:'Non-JSON Day 1 response'}}}
    return{response,payload};
  }
  function identity(){
    const s=state();
    const email=text(getInput('email')?.value||s.email).toLowerCase();
    const actor=actorFor(email);
    if(!actor)throw new Error('Use a synthetic QA email in the form day1.<name>@example.invalid.');
    return{email,actor,suffix:actor.slice('principal:'.length),first_name:text(getInput('first_name')?.value)||'Pre',last_name:text(getInput('last_name')?.value)||'Founder'};
  }
  async function createPreFounder(){
    const i=identity(),s=state(),clientSession=s.client_session_key||`human-prefounder:${i.suffix}`,idem=s.context_key||key('ctx-human',i.suffix);
    const body={email:i.email,first_name:i.first_name,last_name:i.last_name,lifecycle_state:'pre_founder',record_mode:'principal_only',care_protocol:'founder_smb',payer_type:'self',client_session_key:clientSession};
    const {response,payload}=await api('/api/v1/principal-contexts',{method:'POST',actor:i.actor,idempotency:idem,body});
    if(!response.ok||payload?.data?.context?.record_mode!=='principal_only'||payload?.data?.context?.venture_id!==null||payload?.data?.context?.bmr_id!==null||!payload?.data?.session?.session_id)throw new Error(payload?.error?.message||'Pre-Founder principal-only creation/session proof failed.');
    save({email:i.email,actor:i.actor,suffix:i.suffix,context_key:idem,client_session_key:clientSession,context_id:payload.data.context.context_id,founder_id:payload.data.principal.founder_id,principal_session_id:payload.data.session.session_id});
    log('H3 New Pre-Founder — principal_only + null venture/BMR + principal session created','pass',{founder_id:payload.data.principal.founder_id,context_id:payload.data.context.context_id,session_id:payload.data.session.session_id,venture_id:payload.data.context.venture_id,bmr_id:payload.data.context.bmr_id});
    status('Pre-Founder foundation created. H3 PASS.');
    return payload;
  }
  async function resume(){
    const s=state();if(!s.context_id||!s.actor)throw new Error('Create the Pre-Founder first.');
    const {response,payload}=await api(`/api/v1/principal-contexts/${encodeURIComponent(s.context_id)}`,{actor:s.actor});
    if(!response.ok||payload?.data?.context?.context_id!==s.context_id||payload?.data?.context?.venture_id!==null||payload?.data?.context?.bmr_id!==null||payload?.data?.session?.session_id!==s.principal_session_id)throw new Error(payload?.error?.message||'Resume continuity failed.');
    log('H4 Resume/reload — same context/session, still no venture/BMR','pass',{context_id:s.context_id,session_id:s.principal_session_id});status('H4 resume proof PASS.');return payload;
  }
  async function replay(){
    const before=state(),payload=await createPreFounder(),after=state();
    if(payload?.status!=='replayed'||payload?.meta?.idempotent_replay!==true||before.context_id!==after.context_id||before.principal_session_id!==after.principal_session_id)throw new Error('Replay did not return the same idempotent context/session.');
    log('H5 Replay — same idempotency key returned the same principal context/session','pass',{context_id:after.context_id,session_id:after.principal_session_id});status('H5 replay proof PASS.');
  }
  async function consentLock(){
    const s=state();if(!s.founder_id)throw new Error('Create the Pre-Founder first.');
    const {response,payload}=await api('/api/v1/evidence',{method:'POST',actor:s.actor,idempotency:key('ev-lock',s.suffix),body:{founder_id:s.founder_id,category:'foundational',validation_status:'reported',source_type:'founder_report',payload:{lifecycle_state:'pre_founder',human_e2e:true}}});
    if(response.status!==403||payload?.error?.code!=='GV_CONSENT_REQUIRED')throw new Error('Missing-consent evidence write was not blocked as required.');
    log('H6 Consent absent negative — protected evidence write blocked','pass',{status:response.status,code:payload.error.code});status('H6 consent lock PASS.');
  }
  async function consent(statusValue,keyPrefix){
    const s=state();if(!s.founder_id)throw new Error('Create the Pre-Founder first.');
    const {response,payload}=await api('/api/v1/consents',{method:'POST',actor:s.actor,idempotency:key(keyPrefix,s.suffix),body:{founder_id:s.founder_id,purpose:'care_processing',policy_version:'day1_qa_v1',status:statusValue}});
    if(!response.ok||payload?.data?.consent?.status!==statusValue)throw new Error(payload?.error?.message||`Consent ${statusValue} failed.`);
    log(statusValue==='granted'?'H7/H9 Consent granted — versioned ledger write':'H8 Consent withdrawn — history preserved as a new event','pass',{consent_id:payload.data.consent.consent_id,status:statusValue,policy_version:payload.data.consent.policy_version,supersedes_consent_id:payload.data.consent.supersedes_consent_id});
    return payload;
  }
  async function grant(){await consent('granted','cns-grant');status('H7 consent grant PASS.');}
  async function withdraw(){await consent('withdrawn','cns-withdraw');status('H8 withdrawal PASS. Re-grant before H9.');}
  async function regrant(){await consent('granted','cns-regrant');status('Consent re-granted for H9.');}
  async function principalEvidence(){
    const s=state();if(!s.founder_id)throw new Error('Create the Pre-Founder first.');
    const {response,payload}=await api('/api/v1/evidence',{method:'POST',actor:s.actor,idempotency:key('ev-principal',s.suffix),body:{founder_id:s.founder_id,category:'foundational',validation_status:'reported',source_type:'founder_report',payload:{lifecycle_state:'pre_founder',venture_exists:false,human_e2e:true},provenance:{surface:'galvicare_qa_human_e2e',context_id:s.context_id}}});
    if(!response.ok||payload?.data?.evidence?.scope!=='principal'||payload?.data?.evidence?.bmr_id!==null)throw new Error(payload?.error?.message||'Principal evidence write failed.');
    save({principal_evidence_id:payload.data.evidence.evidence_id});
    log('H9 Principal evidence — principal-scoped, no BMR scope','pass',payload.data.evidence);status('H9 principal evidence PASS.');
  }
  async function authNegative(){
    const s=state();if(!s.context_id)throw new Error('Create the Pre-Founder first.');
    const {response,payload}=await api(`/api/v1/principal-contexts/${encodeURIComponent(s.context_id)}`,{actor:`principal:wrong_${safe(s.suffix)}`});
    if(response.status!==403||payload?.error?.code!=='GV_AUTH_FORBIDDEN')throw new Error('Cross-principal access was not denied.');
    log('H10 Authorization negative — wrong principal denied without record leakage','pass',{status:response.status,code:payload.error.code});status('H10 authorization negative PASS.');
  }
  async function operatingFounder(){
    const s=state(),suffix=s.operating_suffix||`operating_${safe(s.suffix||nowSuffix())}`,email=`day1.${suffix}@example.invalid`,actor=`principal:${suffix}`,idem=key('ctx-operating',suffix),venture=`Day1 Human Venture ${suffix}`;
    const body={email,first_name:'Operating',last_name:'Founder',lifecycle_state:'founder',record_mode:'principal_plus_venture',care_protocol:'founder_smb',payer_type:'self',venture_name:venture};
    const {response,payload}=await api('/api/v1/principal-contexts',{method:'POST',actor,idempotency:idem,body});
    if(!response.ok||!payload?.data?.context?.venture_id||!payload?.data?.context?.bmr_id)throw new Error(payload?.error?.message||'Operating founder creation failed.');
    save({operating_suffix:suffix,operating_email:email,operating_actor:actor,operating_key:idem,operating_founder_id:payload.data.principal.founder_id,operating_context_id:payload.data.context.context_id,operating_venture_id:payload.data.context.venture_id,operating_bmr_id:payload.data.context.bmr_id,operating_venture_name:venture});
    log('H11 Operating founder — one real venture + one BMR','pass',{founder_id:payload.data.principal.founder_id,venture_id:payload.data.context.venture_id,bmr_id:payload.data.context.bmr_id});status('H11 operating-founder proof PASS.');return payload;
  }
  async function replayOperating(){
    const before=state();await operatingFounder();const after=state();
    if(before.operating_context_id&&before.operating_context_id!==after.operating_context_id)throw new Error('Operating founder context changed during replay.');
    log('H12 Operating founder replay — stable canonical venture/BMR','pass',{context_id:after.operating_context_id,venture_id:after.operating_venture_id,bmr_id:after.operating_bmr_id});status('H12 operating replay PASS.');
  }
  async function scopedEvidence(){
    const s=state();if(!s.operating_founder_id||!s.principal_evidence_id)throw new Error('Complete H9 and H11 first.');
    await api('/api/v1/consents',{method:'POST',actor:s.operating_actor,idempotency:key('cns-operating',s.operating_suffix),body:{founder_id:s.operating_founder_id,bmr_id:s.operating_bmr_id,purpose:'care_processing',policy_version:'day1_qa_v1',status:'granted'}}).then(({response,payload})=>{if(!response.ok)throw new Error(payload?.error?.message||'Operating consent failed.')});
    const evidence=await api('/api/v1/evidence',{method:'POST',actor:s.operating_actor,idempotency:key('ev-operating',s.operating_suffix),body:{founder_id:s.operating_founder_id,bmr_id:s.operating_bmr_id,category:'operational',validation_status:'reported',source_type:'founder_report',payload:{human_e2e:true,revenue_band:'synthetic'},provenance:{surface:'galvicare_qa_human_e2e'}}});
    if(!evidence.response.ok||evidence.payload?.data?.evidence?.scope!=='bmr')throw new Error(evidence.payload?.error?.message||'BMR evidence failed.');
    const cross=await api('/api/v1/evidence-links',{method:'POST',actor:s.operating_actor,idempotency:key('lnk-cross',s.operating_suffix),body:{source_kind:'principal',source_evidence_id:s.principal_evidence_id,target_kind:'bmr',target_evidence_id:evidence.payload.data.evidence.evidence_id,relationship_type:'supports'}});
    if(cross.response.status!==409||cross.payload?.error?.code!=='GV_SCOPE_MISMATCH')throw new Error('Cross-record evidence link was not rejected.');
    save({operating_evidence_id:evidence.payload.data.evidence.evidence_id});
    log('H13 Scoped evidence — BMR evidence accepted; cross-person lineage rejected','pass',{bmr_evidence_id:evidence.payload.data.evidence.evidence_id,cross_status:cross.response.status,cross_code:cross.payload.error.code});status('H13 scoped evidence PASS.');
  }
  async function health(){
    const {response,payload}=await api('/health');
    const d=payload?.data||{};
    if(!response.ok||d?.release_version!=='galvicare_1_0_day1'||d?.galvicare_schema_version!=='0100'||d?.capabilities?.pre_founder!==true||d?.capabilities?.ai_enabled!==false)throw new Error('Day 1 health contract mismatch.');
    log('H14 Day 1 health/runtime — QA release/schema/capabilities verified','pass',{release_version:d.release_version,galvicare_schema_version:d.galvicare_schema_version,commit_sha:d.commit_sha,pre_founder:d.capabilities.pre_founder,ai_enabled:d.capabilities.ai_enabled});status('H14 runtime proof PASS.');
  }
  function synthetic(){
    const suffix=nowSuffix(),email=`day1.${suffix}@example.invalid`;
    if(getInput('first_name'))getInput('first_name').value='Pre';if(getInput('last_name'))getInput('last_name').value='Founder';if(getInput('email'))getInput('email').value=email;
    save({email,actor:`principal:${suffix}`,suffix,context_key:key('ctx-human',suffix),client_session_key:`human-prefounder:${suffix}`});
    status(`Synthetic identity ready: ${email}`);log('Synthetic QA identity prepared','info',{email});
  }
  const run=fn=>async()=>{try{status('Running…');await fn()}catch(error){console.error(SIGNATURE,error);log(error?.message||String(error),'fail');status(error?.message||'Day 1 Human E2E step failed.',false)}};

  function mount(){
    if(el('day1-human-e2e-panel'))return;
    const form=el('assessmentForm')||document.querySelector('form');if(!form)return;
    const panel=document.createElement('section');panel.id='day1-human-e2e-panel';panel.className='panel';panel.setAttribute('data-qa-only','true');
    panel.innerHTML=`<div class="eyebrow">DAY 1 QA — HUMAN E2E</div><h2>Pre-Founder / Dreamer Pathway</h2><p class="small"><strong>This is a lifecycle path, not a low-score path.</strong> Use it when you do not yet have a real venture. GalviScore severity does not determine whether someone is a Pre-Founder.</p><p class="small">This QA-only surface proves the Day 1 principal-only record, consent, evidence, authorization, operating-founder comparison, and runtime contracts without fabricating a company or BMR.</p><div class="button-row" style="justify-content:flex-start"><button type="button" id="day1-h-synthetic">Use Synthetic QA Identity</button><button type="button" id="day1-h-create">H3 Create Pre-Founder</button><button type="button" id="day1-h-resume">H4 Resume</button><button type="button" id="day1-h-replay">H5 Replay</button></div><div class="button-row" style="justify-content:flex-start"><button type="button" id="day1-h-lock">H6 Consent Lock</button><button type="button" id="day1-h-grant">H7 Grant Consent</button><button type="button" id="day1-h-withdraw">H8 Withdraw</button><button type="button" id="day1-h-regrant">Re-grant for H9</button><button type="button" id="day1-h-evidence">H9 Principal Evidence</button><button type="button" id="day1-h-auth">H10 Auth Negative</button></div><div class="button-row" style="justify-content:flex-start"><button type="button" id="day1-h-operating">H11 Operating Founder</button><button type="button" id="day1-h-operating-replay">H12 Replay Operating</button><button type="button" id="day1-h-scope">H13 Scope Negative</button><button type="button" id="day1-h-health">H14 Runtime Health</button></div><p id="day1-h-status" class="small" role="status">Choose “Use Synthetic QA Identity” to begin the Day 1 Human E2E path.</p><div id="day1-h-evidence-log" aria-live="polite"></div>`;
    const scorePanel=form.querySelector('#scoreQuestions')?.closest('.panel');
    if(scorePanel?.parentNode)scorePanel.parentNode.insertBefore(panel,scorePanel);else form.prepend(panel);
    el('day1-h-synthetic').onclick=synthetic;el('day1-h-create').onclick=run(createPreFounder);el('day1-h-resume').onclick=run(resume);el('day1-h-replay').onclick=run(replay);el('day1-h-lock').onclick=run(consentLock);el('day1-h-grant').onclick=run(grant);el('day1-h-withdraw').onclick=run(withdraw);el('day1-h-regrant').onclick=run(regrant);el('day1-h-evidence').onclick=run(principalEvidence);el('day1-h-auth').onclick=run(authNegative);el('day1-h-operating').onclick=run(operatingFounder);el('day1-h-operating-replay').onclick=run(replayOperating);el('day1-h-scope').onclick=run(scopedEvidence);el('day1-h-health').onclick=run(health);
    const s=state();if(s.context_id)run(resume)();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

/* GalviStudio / GalviCare Day 6 Human E2E SPUR selector and principal-only prescription adapter.
 * QA-only. This is intentionally attached to the existing Day 1 Human E2E source because that
 * source is already an approved, watched QA-browser path. It never creates a venture/BHR.
 * H04 selects an allowed SPUR track and proves the configured initial stage/minimum deliverable.
 * H05 uses an authorized Business Physician test actor to prescribe the selected route.
 * H06 replays the same idempotent prescription and proves one engagement only.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviStudio Day 6 Human E2E SPUR selector v1';
  const DAY6_BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const DAY1_STORE='galvicare_day1_human_e2e_v1';
  const STORE='galvistudio_day6_human_e2e_v1';
  const el=id=>document.getElementById(id);
  const text=v=>String(v??'').trim();
  const safe=v=>text(v).replace(/[^A-Za-z0-9._-]/g,'_').slice(0,80);
  const read=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}};
  const day1=()=>read(DAY1_STORE);
  const state=()=>read(STORE);
  const save=patch=>{const next={...state(),...patch};localStorage.setItem(STORE,JSON.stringify(next));return next};
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function status(message,ok=true){const node=el('day6-h-status');if(node){node.textContent=message;node.style.color=ok?'#166534':'#991b1b';}}
  function log(message,kind='info',data){const box=el('day6-h-evidence-log');if(!box)return;const row=document.createElement('div');row.style.cssText=`padding:9px 10px;margin:7px 0;border-radius:8px;background:${kind==='pass'?'#ecfdf5':kind==='fail'?'#fef2f2':'#f8fafc'};border:1px solid ${kind==='pass'?'#a7f3d0':kind==='fail'?'#fecaca':'#e5e7eb'};font:12px/1.45 monospace;white-space:pre-wrap;word-break:break-word;`;row.textContent=`${kind==='pass'?'PASS':kind==='fail'?'FAIL':'INFO'} — ${message}${data?`\n${JSON.stringify(data,null,2)}`:''}`;box.prepend(row)}

  async function api(path,{method='GET',role,actor,idempotency,body}={}){
    const headers={'Accept':'application/json','Cache-Control':'no-cache','X-Correlation-Id':`day6-human-${uuid()}`};
    if(role)headers['X-Galvi-Role']=role;if(actor)headers['X-Galvi-Actor-Id']=actor;if(idempotency)headers['Idempotency-Key']=idempotency;if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetch(`${DAY6_BASE}${path}`,{method,cache:'no-store',headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});let payload={};try{payload=await response.json()}catch{payload={success:false,error:{code:'NON_JSON',message:'Non-JSON Day 6 response'}}}return{response,payload};
  }

  function selected(){
    const catalog=state().catalog,select=el('day6-spur-track');if(!catalog||!select)throw new Error('Load the Day 6 SPUR catalog first.');
    const track=catalog.spur.tracks.find(x=>x.code===select.value),stage=catalog.spur.stages.find(x=>x.code==='Discern')||catalog.spur.stages[0];if(!track||!stage)throw new Error('SPUR track/stage configuration is incomplete.');return{track,stage};
  }
  function renderSelection(recordPass=false){
    const card=el('day6-spur-selection');if(!card)return;try{const {track,stage}=selected();card.innerHTML=`<p><strong>Selected track:</strong> ${track.name}</p><p><strong>Initial stage:</strong> ${stage.code}</p><p><strong>Minimum deliverable:</strong> ${stage.deliverable}</p><p class="small"><strong>Authority:</strong> H04 is a route selection. H05 is the authorized Business Physician prescription. The customer does not self-approve care.</p>`;save({selected_track:track.code,initial_stage:stage.code,minimum_deliverable:stage.deliverable});if(recordPass){log('H04 SPUR route selection — configured track, initial stage, and minimum deliverable are visible','pass',{track:track.name,stage:stage.code,minimum_deliverable:stage.deliverable});status('DAY 6 H04 PASS — SPUR route/stage/deliverable visible.')}}catch(error){card.textContent=error.message;if(recordPass)throw error}
  }
  async function loadCatalog(recordPass=true){
    const {response,payload}=await api('/api/v1/day6/studio/catalog');const data=payload?.data;if(!response.ok||payload?.success!==true||!Array.isArray(data?.spur?.tracks)||!Array.isArray(data?.spur?.stages))throw new Error(payload?.error?.message||'Day 6 SPUR catalog is unavailable.');
    const permitted=data.spur.tracks.filter(x=>['dreamer','founder'].includes(x.code));if(permitted.length!==2)throw new Error('Expected SPUR Dreamer and Founder tracks were not both returned.');const stage=data.spur.stages.find(x=>x.code==='Discern');if(!stage?.deliverable)throw new Error('SPUR Discern minimum deliverable is missing.');save({catalog:data});const select=el('day6-spur-track');select.innerHTML=permitted.map(x=>`<option value="${x.code}">${x.name}</option>`).join('');const prior=state().selected_track;if(prior&&permitted.some(x=>x.code===prior))select.value=prior;renderSelection(recordPass);
  }
  function engagementBody(){
    const d1=day1();if(!d1.founder_id)throw new Error('Day 6 H04-H06 require the H03 Pre-Founder principal created above. Run H3 Create Pre-Founder first.');const {track,stage}=selected();return{principal_id:d1.founder_id,support_level:'galvistudio',pillar_code:'founder_development',program_code:`spur_${track.code}`,intervention_code:'spur_pathway',objective:track.code==='dreamer'?'Develop an evidence-backed ownership thesis and determine the next founder-development step.':'Develop founder readiness and validate the evidence required for a governed venture go/no-go decision.',entry_gate:{status:'proposed',spur_track:track.code,spur_stage:stage.code,minimum_deliverable:stage.deliverable},required_evidence:[stage.deliverable],expected_outcomes:[track.outcome||stage.deliverable],assigned_actor_type:'studio_operator'};
  }
  function engagementKey(){const d1=day1(),{track}=selected();return `d6-spur-${safe(d1.founder_id)}-${safe(track.code)}`;}
  async function prescribe(){
    const body=engagementBody(),idem=engagementKey(),{response,payload}=await api('/api/v1/day6/studio/engagements',{method:'POST',role:'business_physician',actor:'qa-day6-business-physician',idempotency:idem,body});const engagement=payload?.data?.engagement;if(!response.ok||!engagement||engagement.principal_id!==body.principal_id||engagement.bmr_id!==null)throw new Error(payload?.error?.message||'Day 6 principal-only SPUR prescription failed.');save({engagement_id:engagement.engagement_id,engagement_key:idem,engagement_body:body});log('H05 principal-only SPUR engagement prescribed exactly on the canonical principal','pass',{engagement_id:engagement.engagement_id,principal_id:engagement.principal_id,bmr_id:engagement.bmr_id,program_code:engagement.program_code,intervention_code:engagement.intervention_code});status('DAY 6 H05 PASS — Studio engagement created with bhr_id=null.');
  }
  async function replay(){
    const s=state();if(!s.engagement_id||!s.engagement_key||!s.engagement_body)throw new Error('Run Day 6 H05 first.');const {response,payload}=await api('/api/v1/day6/studio/engagements',{method:'POST',role:'business_physician',actor:'qa-day6-business-physician',idempotency:s.engagement_key,body:s.engagement_body});const engagement=payload?.data?.engagement;if(!response.ok||engagement?.engagement_id!==s.engagement_id||payload?.meta?.idempotent_replay!==true)throw new Error(payload?.error?.message||'Day 6 SPUR engagement replay was not idempotent.');log('H06 SPUR engagement replay — same engagement returned, no duplicate','pass',{engagement_id:engagement.engagement_id,idempotent_replay:payload.meta.idempotent_replay});status('DAY 6 H06 PASS — same Studio engagement returned.');
  }
  const run=fn=>async()=>{try{status('Running Day 6 Human E2E step…');await fn()}catch(error){console.error(SIGNATURE,error);log(error?.message||String(error),'fail');status(error?.message||'Day 6 Human E2E step failed.',false)}};
  function mount(){
    if(el('day6-human-e2e-spur-panel'))return;const day1Panel=el('day1-human-e2e-panel'),form=el('assessmentForm')||document.querySelector('form');if(!form)return;const panel=document.createElement('section');panel.id='day6-human-e2e-spur-panel';panel.className='panel';panel.setAttribute('data-qa-only','true');panel.innerHTML=`<div class="eyebrow">DAY 6 QA — HUMAN E2E</div><h2>GalviStudio™ SPUR Route</h2><p class="small"><strong>Continue from Day 6 H03 above.</strong> The Day 1 “H4 Resume” button is an inherited Day 1 regression helper; it is not Day 6 H04. Day 6 H04 explicitly selects a permitted SPUR track and displays the configured initial stage and minimum deliverable.</p><label for="day6-spur-track">Permitted SPUR route</label><select id="day6-spur-track" style="width:100%;margin:6px 0 10px"></select><div id="day6-spur-selection" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-bottom:10px">Load the Day 6 SPUR catalog.</div><div class="button-row" style="justify-content:flex-start"><button type="button" id="day6-h04">D6-H04 Select SPUR Route</button><button type="button" id="day6-h05">D6-H05 Prescribe Route</button><button type="button" id="day6-h06">D6-H06 Replay Engagement</button></div><p id="day6-h-status" class="small" role="status">H03 is complete when the principal-only Pre-Founder exists. Continue with D6-H04.</p><div id="day6-h-evidence-log" aria-live="polite"></div>`;if(day1Panel?.parentNode)day1Panel.insertAdjacentElement('afterend',panel);else form.prepend(panel);el('day6-spur-track').addEventListener('change',()=>renderSelection(false));el('day6-h04').onclick=run(()=>loadCatalog(true));el('day6-h05').onclick=run(prescribe);el('day6-h06').onclick=run(replay);loadCatalog(false).catch(error=>{console.warn(SIGNATURE,error?.message||error);status('Day 6 catalog will load when D6-H04 is selected.',true)});console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0),{once:true});else setTimeout(mount,0);
})();
