const API=globalThis.GALVIVAULT_API_BASE||'';
const $=s=>document.querySelector(s); let chart=null, selected=null, retry=new Map();
const tabs=['Overview','Timeline','Evidence','Findings','Care Plan','GalviClinic Session','Outcomes / Follow-up'];
const enc=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const vals=f=>Object.fromEntries(new FormData(f));

async function api(path,opt={}){
  const res=await fetch(API+path,{credentials:'include',cache:'no-store',...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})}});
  const body=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(body?.error?.message||`Request failed (${res.status})`);e.status=res.status;throw e;} return body.data;
}

function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open('galvivault-day8-auth',1);r.onupgradeneeded=()=>r.result.createObjectStore('keys');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putKey(id,key){const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction('keys','readwrite');t.objectStore('keys').put(key,id);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
async function getKey(id){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('keys').objectStore('keys').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function createDeviceKey(){const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const public_jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);const pkcs8=await crypto.subtle.exportKey('pkcs8',pair.privateKey);const privateKey=await crypto.subtle.importKey('pkcs8',pkcs8,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);return {public_jwk,privateKey}}

function clear(){chart=null;selected=null;$('#workspace').hidden=true;$('#chart').hidden=true;$('#results').replaceChildren();$('#logout').hidden=true;}
function showAuth(message){clear();$('#status').textContent=message;$('#authForms').hidden=false;}
async function load(){
  try{const me=await api('/api/v1/operator/me');$('#status').textContent=`Signed in: ${me.display_name} (${me.role})`;$('#authForms').hidden=true;$('#workspace').hidden=false;$('#logout').hidden=false;window.operator=me;}
  catch(e){showAuth(e.status===401?'Secure clinician sign-in is required.':e.message);}
}

$('#enroll').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,msg=f.querySelector('.msg'),p=vals(f);f.querySelector('button').disabled=true;try{const credential_id=`cred_${crypto.randomUUID().replaceAll('-','')}`;const {public_jwk,privateKey}=await createDeviceKey();await api('/api/v1/operator/auth/enroll',{method:'POST',body:JSON.stringify({email:p.email,enrollment_token:p.enrollment_token,credential_id,public_jwk})});await putKey(credential_id,privateKey);f.reset();msg.textContent='Device enrolled securely.';await load();}catch(err){msg.textContent=err.message;}finally{f.querySelector('button').disabled=false}});

$('#login').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,msg=f.querySelector('.msg'),p=vals(f);f.querySelector('button').disabled=true;try{const options=await api('/api/v1/operator/auth/login/options',{method:'POST',body:JSON.stringify({email:p.email})});const key=await getKey(options.credential_id);if(!key)throw new Error('This browser is not enrolled for that clinician. Use the one-time enrollment flow on this approved device.');const sig=await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,enc.encode(options.challenge));await api('/api/v1/operator/auth/login/verify',{method:'POST',body:JSON.stringify({challenge_id:options.challenge_id,credential_id:options.credential_id,signature:b64u(sig)})});msg.textContent='';await load();}catch(err){msg.textContent=err.message;}finally{f.querySelector('button').disabled=false}});

$('#search').addEventListener('submit',async e=>{e.preventDefault();try{const d=await api(`/api/v1/operator/founders?query=${encodeURIComponent($('#query').value)}&limit=25`);$('#results').innerHTML=d.items.map(x=>`<button class="card result" data-bmr="${x.bmr_id}">${x.first_name||''} ${x.last_name||''} — ${x.venture_name} — ${x.bmr_status} v${x.record_version}</button>`).join('');}catch(e){if(e.status===401)return load();$('#results').textContent=e.message;}});
$('#results').addEventListener('click',e=>{const b=e.target.closest('[data-bmr]');if(b)openChart(b.dataset.bmr)});
async function openChart(id){selected=id;$('#panel').textContent='Loading…';try{chart=await api(`/api/v1/operator/business-medical-records/${encodeURIComponent(id)}/chart`);}catch(e){if(e.status===401)return load();throw e}if(selected!==id)return;$('#chart').hidden=false;$('#chartTitle').textContent=`${chart.identity.founder.first_name||''} ${chart.identity.founder.last_name||''} — ${chart.identity.venture.venture_name}`;$('#tabs').innerHTML=tabs.map((t,i)=>`<button data-tab="${i}">${t}</button>`).join('');render(0)}
$('#tabs').addEventListener('click',e=>{if(e.target.dataset.tab)render(Number(e.target.dataset.tab))});
function esc(x){return String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
const arr=v=>Array.isArray(v)?v:[];
const first=(o,keys,blank='—')=>{for(const k of keys){if(o?.[k]!==undefined&&o?.[k]!==null&&String(o[k]).trim()!=='')return o[k]}return blank};
const kv=(label,value)=>`<p><strong>${esc(label)}:</strong> ${esc(value)}</p>`;
const empty=label=>`<p>No ${esc(label)} recorded for this canonical BMR.</p>`;
function reasoningSection(title,items,type){
  if(!items.length)return `<section class="card"><h3>${esc(title)}</h3>${empty(title.toLowerCase())}</section>`;
  return `<section class="card"><h3>${esc(title)}</h3>${items.map(x=>`<article class="record ${esc(type)}">${kv('ID',first(x,[`${type}_id`,'id']))}${kv('Statement',first(x,['statement','description','text']))}${kv('Status',first(x,['confirmation_status','status']))}${kv('Confidence',first(x,['confidence']))}${kv('Source',`${first(x,['source_type'])} ${first(x,['source_version'],'')}`.trim())}${kv('Version',first(x,['version_no','version','record_version']))}${type==='finding'?kv('Governance version',first(x,['governance_version'])):''}${kv('Support count',arr(x.support).length)}</article>`).join('')}</section>`;
}
function renderReasoning(){const r=chart.reasoning||{};return `<div class="clinical-projection"><h2>Current Reasoning</h2>${reasoningSection('Observations',arr(r.observations),'observation')}${reasoningSection('Hypotheses',arr(r.hypotheses),'hypothesis')}${reasoningSection('Findings',arr(r.findings),'finding')}</div>`;}
function careSection(title,items,type){
  if(!items.length)return `<section class="card"><h3>${esc(title)}</h3>${empty(title.toLowerCase())}</section>`;
  return `<section class="card"><h3>${esc(title)}</h3>${items.map(x=>`<article class="record ${esc(type)}">${kv('ID',first(x,[`${type}_id`,'id']))}${kv('Title',first(x,['title','name','objective','description']))}${kv('Status',first(x,['status','disposition']))}${kv('Code',first(x,[`${type}_code`,'code','action_code']))}${kv('Version',first(x,['version','version_no','record_version']))}${kv('Created',first(x,['created_at','occurred_at','observed_at']))}</article>`).join('')}</section>`;
}
function renderCare(){const c=chart.care||{};return `<div class="clinical-projection"><h2>Current Care</h2>${careSection('Recommendations',arr(c.recommendations),'recommendation')}${careSection('Treatment Plans',arr(c.treatment_plans),'treatment_plan')}${careSection('Treatment Events',arr(c.treatment_events),'treatment_event')}${careSection('Outcomes',arr(c.outcomes),'outcome')}${careSection('Feedback / Follow-up',arr(c.feedback),'feedback')}</div>`;}
function timelineCard(x){return `<article class="card record timeline-entry"><h3>${esc(first(x,['safe_summary','title','statement','source_reference','entry_type'],'Clinical record event'))}</h3>${kv('Type',first(x,['entry_type','type']))}${kv('Canonical ID',first(x,['canonical_id','entity_id','id']))}${kv('Version',first(x,['version_no','version','record_version']))}${kv('Occurred',first(x,['occurred_at','created_at','observed_at','captured_at','updated_at']))}${kv('Source',first(x,['source','source_type','source_product']))}${kv('Correlation ID',first(x,['correlation_id']))}</article>`;}
function projectedTimeline(){
  const direct=arr(chart.timeline).length?arr(chart.timeline):arr(chart.entries);
  if(direct.length)return direct;
  const r=chart.reasoning||{},c=chart.care||{};
  const typed=[];
  const add=(items,type,idKeys)=>arr(items).forEach(x=>typed.push({...x,entry_type:type,canonical_id:first(x,idKeys),occurred_at:first(x,['occurred_at','created_at','observed_at','captured_at','updated_at'],''),source:first(x,['source','source_type','source_product'],'')}));
  add(chart.evidence,'evidence',['evidence_id','id']);
  add(r.observations,'observation',['observation_id','id']);
  add(r.hypotheses,'hypothesis',['hypothesis_id','id']);
  add(r.findings,'finding',['finding_id','id']);
  add(c.recommendations,'recommendation',['recommendation_id','id']);
  add(c.treatment_plans,'treatment_plan',['treatment_plan_id','id']);
  add(c.treatment_events,'treatment_event',['treatment_event_id','id']);
  add(c.outcomes,'outcome',['outcome_id','id']);
  add(c.feedback,'feedback',['feedback_id','id']);
  return typed.sort((a,b)=>String(first(a,['occurred_at'],'')).localeCompare(String(first(b,['occurred_at'],''))));
}
function renderTimeline(){const items=projectedTimeline();return `<div class="clinical-projection"><h2>Longitudinal Timeline</h2>${items.length?items.map(timelineCard).join(''):empty('timeline events')}</div>`;}
function evidenceCard(x){const value=first(x,['value_text','safe_summary','content','statement'],'—');return `<article class="card record evidence-entry"><h3>${esc(first(x,['source_reference','source_ref','evidence_type'],'Evidence'))}</h3>${kv('Evidence ID',first(x,['evidence_id','id']))}${kv('Type',first(x,['evidence_type','value_type','source_type']))}${kv('Source',first(x,['source_product','source_type']))}${kv('Source reference',first(x,['source_reference','source_ref']))}${kv('Value',typeof value==='object'?JSON.stringify(value):value)}${kv('Confidence',first(x,['confidence']))}${kv('Version',first(x,['evidence_version','version_no','version']))}${kv('Captured / created',first(x,['captured_at','created_at','observed_at']))}</article>`;}
function renderEvidence(){const items=arr(chart.evidence);return `<div class="clinical-projection"><h2>Evidence & Source Material</h2>${items.length?items.map(evidenceCard).join(''):empty('evidence records')}</div>`;}
function render(i){const p=$('#panel');if(!chart)return;
 if(i===0)p.innerHTML=`<div class=grid><div class=card><h3>BMR</h3><p>${esc(chart.identity.bmr.bmr_id)}</p><p>${esc(chart.identity.bmr.lifecycle_status)} · v${esc(chart.identity.bmr.record_version)}</p></div><div class=card><h3>Venture</h3><p>${esc(chart.identity.venture.venture_name)}</p></div></div>`;
 else if(i===1)p.innerHTML=renderTimeline();
 else if(i===2)p.innerHTML=renderEvidence();
 else if(i===3)p.innerHTML=renderReasoning()+(window.operator.role==='business_physician'?governanceForm():'');
 else if(i===4)p.innerHTML=renderCare()+careForms();
 else if(i===5)p.innerHTML=noteForm();
 else p.innerHTML=outcomeForms();
 bindActions();
}
const form=(id,title,fields)=>`<form class=action id="${id}"><h3>${title}</h3>${fields}<button>Save</button><p class=msg></p></form>`;
const field=(n,l,tag='input')=>`<label>${l}<${tag} name="${n}" required></${tag}></label>`;
function noteForm(){return form('note','GalviClinic Note',field('value_text','Clinical note','textarea'))}
function governanceForm(){
  const findings=arr(chart?.reasoning?.findings);
  if(!findings.length)return `<section class="card"><h3>Finding Governance</h3>${empty('eligible findings')}</section>`;
  const options=findings.map(x=>{const id=first(x,['finding_id','id'],'');const gv=first(x,['governance_version'],'');const statement=first(x,['statement','title'],id);return `<option value="${esc(id)}" data-version="${esc(gv)}">${esc(statement)} — ${esc(first(x,['confirmation_status','status']))} — gv${esc(gv)}</option>`}).join('');
  const initialVersion=first(findings[0],['governance_version'],'');
  return form('gov','Finding Governance',`<label>Finding<select name="finding_id" required>${options}</select></label>`+`<label>Decision<select name="decision" required><option value="">Choose</option><option value="confirm">Confirm</option><option value="reject">Reject</option></select></label>`+field('reason','Reason / clinical rationale','textarea')+`<label>Expected governance version<input name="expected_version" value="${esc(initialVersion)}" readonly required></label>`);
}
function careForms(){
  const confirmed=arr(chart?.reasoning?.findings).filter(x=>String(first(x,['confirmation_status'],'')).toLowerCase()==='confirmed');
  const findingOptions=confirmed.map(x=>`<option value="${esc(first(x,['finding_id','id'],''))}">${esc(first(x,['statement','title','finding_id']))} — confirmed</option>`).join('');
  const recommendationForm=confirmed.length
    ? form('rec','Recommendation',`<label>Confirmed finding<select name="finding_id" required>${findingOptions}</select></label>`+field('title','Title')+field('action','Action','textarea')+field('rationale','Rationale','textarea')+`<label>Priority<input name="priority" type="number" min="0" step="1" value="1" required></label>`)
    : `<section class="card"><h3>Recommendation</h3><p>A confirmed governed finding is required before a recommendation can be created.</p></section>`;
  const eligibleRecommendations=arr(chart?.care?.recommendations).filter(x=>['proposed','approved'].includes(String(first(x,['status'],'')).toLowerCase()));
  const recommendationOptions=eligibleRecommendations.map(x=>`<option value="${esc(first(x,['recommendation_id','id'],''))}">${esc(first(x,['title','recommendation_text','recommendation_id']))} — ${esc(first(x,['status']))} — ${esc(first(x,['recommendation_id','id']))}</option>`).join('');
  const treatmentForm=eligibleRecommendations.length&&confirmed.length
    ? form('plan','Treatment Plan',`<label>BMR ID<input name="bmr_id" value="${esc(chart.identity.bmr.bmr_id)}" readonly required></label>`+`<label>Recommendation<select name="recommendation_id" required>${recommendationOptions}</select></label>`+`<label>Confirmed finding<select name="finding_id" required>${findingOptions}</select></label>`+field('title','Title')+field('objective','Objective','textarea'))
    : `<section class="card"><h3>Treatment Plan</h3><p>A canonical recommendation and confirmed governed finding from this BMR are required before a treatment plan can be created.</p></section>`;
  const eventPlans=arr(chart?.care?.treatment_plans).filter(x=>!['superseded','archived'].includes(String(first(x,['status'],'')).toLowerCase()));
  const eventPlanOptions=eventPlans.map(x=>`<option value="${esc(first(x,['treatment_plan_id','id'],''))}">${esc(first(x,['title','name','treatment_plan_id']))} — ${esc(first(x,['status']))} — ${esc(first(x,['treatment_plan_id','id']))}</option>`).join('');
  const treatmentEventForm=eventPlans.length
    ? form('treatment_event','Treatment Event',`<label>Treatment plan<select name="treatment_plan_id" required>${eventPlanOptions}</select></label>`+field('event_type','Event type')+`<label>Occurred at<input name="occurred_at" type="datetime-local" required></label>`+field('notes','Notes','textarea'))
    : `<section class="card"><h3>Treatment Event</h3><p>An existing treatment plan is required before an append-only treatment event can be recorded.</p></section>`;
  return recommendationForm+treatmentForm+treatmentEventForm;
}
function outcomeForms(){
  const plans=arr(chart?.care?.treatment_plans).filter(x=>!['superseded','archived'].includes(String(first(x,['status'],'')).toLowerCase()));
  const planOptions=plans.map(x=>`<option value="${esc(first(x,['treatment_plan_id','id'],''))}">${esc(first(x,['title','name','treatment_plan_id']))} — ${esc(first(x,['status']))}</option>`).join('');
  const outcomeForm=plans.length
    ? form('outcome','Outcome',`<label>BMR ID<input name="bmr_id" value="${esc(chart.identity.bmr.bmr_id)}" readonly required></label>`+`<label>Treatment plan<select name="treatment_plan_id" required>${planOptions}</select></label>`+field('outcome_code','Outcome code')+field('value_text','Observed value','textarea')+`<label>Observed at<input name="observed_at" type="datetime-local" required></label>`)
    : `<section class="card"><h3>Outcome</h3><p>An existing treatment plan is required before a related outcome can be recorded.</p></section>`;
  return outcomeForm+form('feedback','Feedback / Follow-up',field('target_type','Target type')+field('target_id','Target ID')+field('feedback_type','Feedback type')+field('comment','Comment','textarea'));
}
const key=(name,payload)=>{const raw=JSON.stringify(payload);const prev=retry.get(name);if(prev?.raw===raw)return prev.key;const k=`d8_${crypto.randomUUID().replaceAll('-','')}`;retry.set(name,{raw,key:k});return k};
async function postForm(f,path,payload){const name=f.id;f.querySelector('button').disabled=true;try{await api(path,{method:'POST',headers:{'Idempotency-Key':key(name,payload)},body:JSON.stringify(payload)});retry.delete(name);await openChart(selected);return true}catch(e){f.querySelector('.msg').textContent=e.status===409?'Record changed. Canonical chart refreshed; review before retry.':e.message;if(e.status===409)await openChart(selected);if(e.status===401)await load();return false}finally{f.querySelector('button').disabled=false}}
function bindActions(){
 const note=$('#note');if(note)note.onsubmit=e=>{e.preventDefault();const v=vals(note);postForm(note,'/api/v1/evidence',{bmr_id:selected,session_id:chart.identity.bmr.current_session_id,source_type:'facilitator_capture',source_ref:`galviclinic_note_${Date.now()}`,value_type:'text',value_text:v.value_text,captured_at:new Date().toISOString(),consent_status:'confirmed'})};
 const gov=$('#gov');if(gov){const finding=gov.querySelector('[name="finding_id"]'),expected=gov.querySelector('[name="expected_version"]');if(finding&&expected)finding.onchange=()=>{expected.value=finding.selectedOptions[0]?.dataset.version||''};gov.onsubmit=e=>{e.preventDefault();const v=vals(gov);postForm(gov,'/api/v1/governance/confirmations',{bmr_id:selected,finding_id:v.finding_id,decision:v.decision,reason:v.reason,expected_version:Number(v.expected_version)})}};
 const rec=$('#rec');if(rec)rec.onsubmit=e=>{e.preventDefault();const v=vals(rec);postForm(rec,'/api/v1/recommendations',{bmr_id:selected,finding_ids:[v.finding_id],recommendation_code:'GALVICLINIC_DAY8',title:v.title,action:v.action,rationale:v.rationale,priority:Number(v.priority),status:'proposed',source_type:'clinician',source_version:'day8'})};
 const plan=$('#plan');if(plan)plan.onsubmit=e=>{e.preventDefault();const v=vals(plan);postForm(plan,'/api/v1/treatment-plans',{...v,bmr_id:selected,recommendation_ids:[v.recommendation_id],finding_ids:[v.finding_id],treatment_code:'galviclinic',status:'approved',target_outcome:'follow_up',items:[{item_code:'initial',title:v.title,owner:'clinician'}]})};
 const tev=$('#treatment_event');if(tev)tev.onsubmit=e=>{e.preventDefault();const v=vals(tev);postForm(tev,`/api/v1/treatment-plans/${encodeURIComponent(v.treatment_plan_id)}/events`,{event_type:v.event_type,occurred_at:new Date(v.occurred_at).toISOString(),notes:v.notes,metadata:{source:'galviclinic_day8'}})};
 const out=$('#outcome');if(out)out.onsubmit=e=>{e.preventDefault();const v=vals(out);postForm(out,'/api/v1/outcomes',{bmr_id:selected,treatment_plan_id:v.treatment_plan_id,outcome_code:v.outcome_code,outcome_type:'observed',value_text:v.value_text,observed_at:new Date(v.observed_at).toISOString(),source_type:'clinician',source_ref:'galviclinic_day8',status:'observed'})};
 const fb=$('#feedback');if(fb)fb.onsubmit=e=>{e.preventDefault();const v=vals(fb);postForm(fb,'/api/v1/feedback',{...v,bmr_id:selected,disposition:'follow_up',source:'clinician'})};
}
$('#logout').addEventListener('click',async()=>{try{await api('/api/v1/operator/auth/logout',{method:'POST',body:'{}'})}finally{showAuth('Signed out securely.');}});load();