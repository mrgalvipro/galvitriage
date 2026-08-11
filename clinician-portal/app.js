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
  return `<section class="card"><h3>${esc(title)}</h3>${items.map(x=>`<article class="record ${esc(type)}">${kv('ID',first(x,[`${type}_id`,'id']))}${kv('Statement',first(x,['statement','description','text']))}${kv('Status',first(x,['confirmation_status','status']))}${kv('Confidence',first(x,['confidence']))}${kv('Source',`${first(x,['source_type'])} ${first(x,['source_version'],'')}`.trim())}${kv('Version',first(x,['version','record_version']))}${kv('Support count',arr(x.support).length)}</article>`).join('')}</section>`;
}
function renderReasoning(){const r=chart.reasoning||{};return `<div class="clinical-projection"><h2>Current Reasoning</h2>${reasoningSection('Observations',arr(r.observations),'observation')}${reasoningSection('Hypotheses',arr(r.hypotheses),'hypothesis')}${reasoningSection('Findings',arr(r.findings),'finding')}</div>`;}
function careSection(title,items,type){
  if(!items.length)return `<section class="card"><h3>${esc(title)}</h3>${empty(title.toLowerCase())}</section>`;
  return `<section class="card"><h3>${esc(title)}</h3>${items.map(x=>`<article class="record ${esc(type)}">${kv('ID',first(x,[`${type}_id`,'id']))}${kv('Title',first(x,['title','name','objective','description']))}${kv('Status',first(x,['status','disposition']))}${kv('Code',first(x,[`${type}_code`,'code','action_code']))}${kv('Version',first(x,['version','version_no','record_version']))}${kv('Created',first(x,['created_at','occurred_at','observed_at']))}</article>`).join('')}</section>`;
}
function renderCare(){const c=chart.care||{};return `<div class="clinical-projection"><h2>Current Care</h2>${careSection('Recommendations',arr(c.recommendations),'recommendation')}${careSection('Treatment Plans',arr(c.treatment_plans),'treatment_plan')}${careSection('Treatment Events',arr(c.treatment_events),'treatment_event')}${careSection('Outcomes',arr(c.outcomes),'outcome')}${careSection('Feedback / Follow-up',arr(c.feedback),'feedback')}</div>`;}
function render(i){const p=$('#panel');if(!chart)return;
 if(i===0)p.innerHTML=`<div class=grid><div class=card><h3>BMR</h3><p>${esc(chart.identity.bmr.bmr_id)}</p><p>${esc(chart.identity.bmr.lifecycle_status)} · v${esc(chart.identity.bmr.record_version)}</p></div><div class=card><h3>Venture</h3><p>${esc(chart.identity.venture.venture_name)}</p></div></div>`;
 else if(i===1)p.innerHTML=`<pre>${esc(JSON.stringify(chart.timeline,null,2))}</pre>`;
 else if(i===2)p.innerHTML=`<pre>${esc(JSON.stringify(chart.evidence,null,2))}</pre>`;
 else if(i===3)p.innerHTML=renderReasoning()+(window.operator.role==='business_physician'?governanceForm():'');
 else if(i===4)p.innerHTML=renderCare()+careForms();
 else if(i===5)p.innerHTML=noteForm();
 else p.innerHTML=outcomeForms();
 bindActions();
}
const form=(id,title,fields)=>`<form class=action id="${id}"><h3>${title}</h3>${fields}<button>Save</button><p class=msg></p></form>`;
const field=(n,l,tag='input')=>`<label>${l}<${tag} name="${n}" required></${tag}></label>`;
function noteForm(){return form('note','GalviClinic Note',field('value_text','Clinical note','textarea'))}
function governanceForm(){return form('gov','Finding Governance',field('finding_id','Finding ID')+`<label>Decision<select name=decision><option value="">Choose</option><option>confirmed</option><option>rejected</option></select></label>`+field('expected_version','Expected version'))}
function careForms(){return form('rec','Recommendation',field('bmr_id','BMR ID')+field('finding_id','Confirmed finding ID')+field('title','Title')+field('action','Action','textarea'))+form('plan','Treatment Plan',field('bmr_id','BMR ID')+field('recommendation_id','Recommendation ID')+field('finding_id','Finding ID')+field('title','Title')+field('objective','Objective','textarea'))}
function outcomeForms(){return form('outcome','Outcome',field('bmr_id','BMR ID')+field('outcome_code','Outcome code')+field('observed_value','Observed value')+field('observed_at','Observed at'))+form('feedback','Feedback / Follow-up',field('target_type','Target type')+field('target_id','Target ID')+field('feedback_type','Feedback type')+field('comment','Comment','textarea'))}
const key=(name,payload)=>{const raw=JSON.stringify(payload);const prev=retry.get(name);if(prev?.raw===raw)return prev.key;const k=`d8_${crypto.randomUUID().replaceAll('-','')}`;retry.set(name,{raw,key:k});return k};
async function postForm(f,path,payload){const name=f.id;f.querySelector('button').disabled=true;try{await api(path,{method:'POST',headers:{'Idempotency-Key':key(name,payload)},body:JSON.stringify(payload)});retry.delete(name);await openChart(selected);return true}catch(e){f.querySelector('.msg').textContent=e.status===409?'Record changed. Canonical chart refreshed; review before retry.':e.message;if(e.status===409)await openChart(selected);if(e.status===401)await load();return false}finally{f.querySelector('button').disabled=false}}
function bindActions(){
 const note=$('#note');if(note)note.onsubmit=e=>{e.preventDefault();const v=vals(note);postForm(note,'/api/v1/evidence',{bmr_id:selected,session_id:chart.identity.bmr.current_session_id,evidence_type:'facilitator_capture',source_product:'galviclinic',source_reference:`galviclinic_note_${Date.now()}`,content:{value_text:v.value_text},observed_at:new Date().toISOString(),consent_status:'confirmed'})};
 const gov=$('#gov');if(gov)gov.onsubmit=e=>{e.preventDefault();const v=vals(gov);postForm(gov,'/api/v1/governance/confirmations',{bmr_id:selected,finding_id:v.finding_id,decision:v.decision,expected_version:Number(v.expected_version)})};
 const rec=$('#rec');if(rec)rec.onsubmit=e=>{e.preventDefault();const v=vals(rec);postForm(rec,'/api/v1/recommendations',{...v,bmr_id:selected,finding_ids:[v.finding_id],recommendation_code:'galviclinic',rationale:v.action,priority:'high',status:'active',source_type:'clinician',source_version:'day8'})};
 const plan=$('#plan');if(plan)plan.onsubmit=e=>{e.preventDefault();const v=vals(plan);postForm(plan,'/api/v1/treatment-plans',{...v,bmr_id:selected,recommendation_ids:[v.recommendation_id],finding_ids:[v.finding_id],treatment_code:'galviclinic',status:'approved',target_outcome:'follow_up',items:[{item_code:'initial',title:v.title,owner:'clinician'}]})};
 const out=$('#outcome');if(out)out.onsubmit=e=>{e.preventDefault();const v=vals(out);postForm(out,'/api/v1/outcomes',{...v,bmr_id:selected,outcome_type:'observed',source_type:'clinician',source_reference:'galviclinic_day8'})};
 const fb=$('#feedback');if(fb)fb.onsubmit=e=>{e.preventDefault();const v=vals(fb);postForm(fb,'/api/v1/feedback',{...v,bmr_id:selected,disposition:'follow_up',source:'clinician'})};
}
$('#logout').addEventListener('click',async()=>{try{await api('/api/v1/operator/auth/logout',{method:'POST',body:'{}'})}finally{showAuth('Signed out securely.');}});load();
