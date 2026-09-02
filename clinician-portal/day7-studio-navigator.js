(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
const fmt=v=>v===null||v===undefined?'Not instrumented':Number(v).toLocaleString();
async function api(path){const r=await fetch(path,{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});let p={};try{p=await r.json()}catch{}if(!r.ok||p?.success===false)throw new Error(p?.error?.message||`Request failed (${r.status})`);return p.data||{};}
function desiredView(){const v=new URLSearchParams(location.search).get('view');return v==='clinic'||v==='vault'?v:'navigator';}
function show(view){
  const nav=$('#studioNavigator'),clinic=$('#clinicWorkspace'),vault=$('#vaultWorkspace');
  if(nav)nav.hidden=view!=='navigator';
  if(clinic)clinic.hidden=view!=='clinic';
  if(vault)vault.hidden=view!=='vault';
  document.body.dataset.galviRoleView=view;
  if(view==='clinic')loadClinicMetrics();
}
async function loadClinicMetrics(){
  const host=$('#clinicMetrics');if(!host||host.dataset.loading==='1')return;host.dataset.loading='1';host.innerHTML='<p>Loading GalviClinic operating counts…</p>';
  try{const d=await api('/api/v1/operator/galviboard'),m=d.clinic_metrics||{};const cells=[['Recommendations',m.recommendations],['Treatment Plans',m.treatment_plans],['GalviRx',m.galvirx],['GalviAudit',m.galviaudit],['Referrals',m.referrals],['Check Ins',m.check_ins],['Milestones',m.milestones],['Reassessments',m.reassessments],['Treatment Events',m.treatment_events],['Outcomes',m.outcomes]];host.innerHTML=`<div class="grid">${cells.map(([k,v])=>`<div class="record"><strong>${esc(k)}</strong><br><span>${esc(fmt(v))}</span></div>`).join('')}</div><p class="small">${esc(m.scope_note||'Counts are read-only projections of canonical GalviVault care records.')}</p>`;}catch(e){host.innerHTML=`<p class="error">${esc(e.message)}</p>`}finally{host.dataset.loading='0'}
}
function install(){
  $('#openGalviBoard')?.addEventListener('click',()=>location.assign('./galviboard'));
  $('#openGalviClinic')?.addEventListener('click',()=>show('clinic'));
  $('#openGalviVault')?.addEventListener('click',()=>show('vault'));
  document.querySelectorAll('[data-studio-home]').forEach(b=>b.addEventListener('click',()=>show('navigator')));
  const workspace=$('#workspace');if(workspace&&!workspace.hidden)show(desiredView());
  new MutationObserver(()=>{if(workspace&&!workspace.hidden&&!document.body.dataset.galviRoleView)show(desiredView());if(workspace?.hidden)delete document.body.dataset.galviRoleView}).observe(workspace||document.body,{attributes:true,attributeFilter:['hidden']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
