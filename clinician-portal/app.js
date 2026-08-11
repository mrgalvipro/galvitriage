const API=globalThis.GALVIVAULT_API_BASE||'https://galvivault-day8-qa.mrgalvipro.workers.dev';
const $=s=>document.querySelector(s); let chart=null, selected=null, retry=new Map();
const tabs=['Overview','Timeline','Evidence','Findings','Care Plan','GalviClinic Session','Outcomes / Follow-up'];
async function api(path,opt={}){
  const res=await fetch(API+path,{credentials:'include',cache:'no-store',...opt,headers:{'Content-Type':'application/json',...(opt.headers||{})}});
  const body=await res.json().catch(()=>({}));
  if(res.status===401){clear(); $('#status').textContent='Secure clinician sign-in is required.';}
  if(!res.ok){const e=new Error(body?.error?.message||`Request failed (${res.status})`);e.status=res.status;throw e;} return body.data;
}
const key=(name,payload)=>{const raw=JSON.stringify(payload);const prev=retry.get(name);if(prev?.raw===raw)return prev.key;const k=`d8_${crypto.randomUUID().replaceAll('-','')}`;retry.set(name,{raw,key:k});return k};
function clear(){chart=null;selected=null;$('#workspace').hidden=true;$('#chart').hidden=true;$('#results').replaceChildren();}
async function load(){
  try{const me=await api('/api/v1/operator/me');$('#status').textContent=`Signed in: ${me.display_name} (${me.role})`;$('#workspace').hidden=false;window.operator=me;}
  catch(e){$('#status').textContent=e.message;}
}
$('#search').addEventListener('submit',async e=>{e.preventDefault();try{const d=await api(`/api/v1/operator/founders?query=${encodeURIComponent($('#query').value)}&limit=25`);$('#results').innerHTML=d.items.map(x=>`<button class="card result" data-bmr="${x.bmr_id}">${x.first_name||''} ${x.last_name||''} — ${x.venture_name} — ${x.bmr_status} v${x.record_version}</button>`).join('');}catch(e){$('#results').textContent=e.message;}});
$('#results').addEventListener('click',e=>{const b=e.target.closest('[data-bmr]');if(b)openChart(b.dataset.bmr)});
async function openChart(id){selected=id;$('#panel').textContent='Loading…';chart=await api(`/api/v1/operator/business-medical-records/${encodeURIComponent(id)}/chart`);if(selected!==id)return;$('#chart').hidden=false;$('#chartTitle').textContent=`${chart.identity.founder.first_name||''} ${chart.identity.founder.last_name||''} — ${chart.identity.venture.venture_name}`;$('#tabs').innerHTML=tabs.map((t,i)=>`<button data-tab="${i}">${t}</button>`).join('');render(0)}
$('#tabs').addEventListener('click',e=>{if(e.target.dataset.tab)render(Number(e.target.dataset.tab))});
function esc(x){return String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function render(i){const p=$('#panel');if(!chart)return;
 if(i===0)p.innerHTML=`<div class=grid><div class=card><h3>BMR</h3><p>${esc(chart.identity.bmr.bmr_id)}</p><p>${esc(chart.identity.bmr.lifecycle_status)} · v${esc(chart.identity.bmr.record_version)}</p></div><div class=card><h3>Venture</h3><p>${esc(chart.identity.venture.venture_name)}</p></div></div>`;
 else if(i===1)p.innerHTML=`<pre>${esc(JSON.stringify(chart.timeline,null,2))}</pre>`;
 else if(i===2)p.innerHTML=`<pre>${esc(JSON.stringify(chart.evidence,null,2))}</pre>`;
 else if(i===3)p.innerHTML=`<pre>${esc(JSON.stringify(chart.reasoning,null,2))}</pre>`+(window.operator.role==='business_physician'?governanceForm():'');
 else if(i===4)p.innerHTML=`<pre>${esc(JSON.stringify(chart.care,null,2))}</pre>`+careForms();
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
function vals(f){return Object.fromEntries(new FormData(f))}
async function postForm(f,path,payload){const name=f.id;f.querySelector('button').disabled=true;try{await api(path,{method:'POST',headers:{'Idempotency-Key':key(name,payload)},body:JSON.stringify(payload)});retry.delete(name);await openChart(selected);return true}catch(e){f.querySelector('.msg').textContent=e.status===409?'Record changed. Canonical chart refreshed; review before retry.':e.message;if(e.status===409)await openChart(selected);return false}finally{f.querySelector('button').disabled=false}}
function bindActions(){
 const note=$('#note');if(note)note.onsubmit=e=>{e.preventDefault();const v=vals(note);postForm(note,'/api/v1/evidence',{bmr_id:selected,session_id:chart.identity.bmr.current_session_id,evidence_type:'facilitator_capture',source_product:'galviclinic',source_reference:`galviclinic_note_${Date.now()}`,content:{value_text:v.value_text},observed_at:new Date().toISOString(),consent_status:'confirmed'})};
 const gov=$('#gov');if(gov)gov.onsubmit=e=>{e.preventDefault();const v=vals(gov);postForm(gov,'/api/v1/governance/confirmations',{bmr_id:selected,finding_id:v.finding_id,decision:v.decision,expected_version:Number(v.expected_version)})};
 const rec=$('#rec');if(rec)rec.onsubmit=e=>{e.preventDefault();const v=vals(rec);postForm(rec,'/api/v1/recommendations',{...v,bmr_id:selected,finding_ids:[v.finding_id],recommendation_code:'galviclinic',rationale:v.action,priority:'high',status:'active',source_type:'clinician',source_version:'day8'})};
 const plan=$('#plan');if(plan)plan.onsubmit=e=>{e.preventDefault();const v=vals(plan);postForm(plan,'/api/v1/treatment-plans',{...v,bmr_id:selected,recommendation_ids:[v.recommendation_id],finding_ids:[v.finding_id],treatment_code:'galviclinic',status:'approved',target_outcome:'follow_up',items:[{item_code:'initial',title:v.title,owner:'clinician'}]})};
 const out=$('#outcome');if(out)out.onsubmit=e=>{e.preventDefault();const v=vals(out);postForm(out,'/api/v1/outcomes',{...v,bmr_id:selected,outcome_type:'observed',source_type:'clinician',source_reference:'galviclinic_day8'})};
 const fb=$('#feedback');if(fb)fb.onsubmit=e=>{e.preventDefault();const v=vals(fb);postForm(fb,'/api/v1/feedback',{...v,bmr_id:selected,disposition:'follow_up',source:'clinician'})};
}
$('#logout').addEventListener('click',()=>{clear();location.assign('/cdn-cgi/access/logout')}); load();
