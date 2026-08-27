/* GalviCare 1.0 Day 5 customer care-routing + GalviGuide adapter.
 * H02/H06-H08 critical path: project server-owned GalviScore/Acuity/Disposition,
 * expose bounded GalviGuide navigation, and make passive-vs-active routing visible.
 * It does not recompute Score/Acuity, does not call OpenAI, does not submit BMR
 * authority, and does not alter the Day 3/Day7D clarification or governed-AI routes.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 5 customer care routing + GalviGuide v1';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const STAGES=['galviscore-result','galvishot-result','galvisight-handoff','galvipath-result'];
  const text=(value)=>String(value??'').trim();
  const byId=(id)=>document.getElementById(id);
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const session=()=>typeof window.getStoredSessionId==='function'
    ?text(window.getStoredSessionId())
    :text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  let cached=null,inFlight=null,retryTimer=null,retryCount=0;

  function installStyle(){
    if(byId('day5-care-routing-style'))return;
    const style=document.createElement('style');style.id='day5-care-routing-style';
    style.textContent=`
      .day5-care-route{border:1px solid #d9e3ea;background:#fbfdff;border-radius:14px;padding:16px;margin:18px 0}
      .day5-care-route h3{margin:4px 0 10px}
      .day5-acuity-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid;border-radius:999px;padding:6px 10px;font-weight:800}
      .day5-acuity-green{background:#ecfdf5;border-color:#86efac;color:#166534}
      .day5-acuity-yellow{background:#fef9c3;border-color:#facc15;color:#713f12}
      .day5-acuity-orange{background:#ffedd5;border-color:#fb923c;color:#9a3412}
      .day5-acuity-red{background:#fee2e2;border-color:#f87171;color:#991b1b}
      .day5-route-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:12px 0}
      .day5-route-cell{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px}
      .day5-guide-box{border-left:4px solid #174a73;background:#f8fafc;border-radius:10px;padding:12px;margin-top:12px}
      .day5-route-muted{color:#4b5563;font-size:13px;line-height:1.5}
    `;
    document.head.appendChild(style);
  }

  async function api(intent='explain_route'){
    const sid=session();if(!sid)throw new Error('Your authenticated GalviCare session is required.');
    const response=await fetch(`${BASE}/api/v1/day5/customer/galviguide`,{
      method:'POST',cache:'no-store',
      headers:{
        'Accept':'application/json','Content-Type':'application/json','Cache-Control':'no-cache',
        [SESSION_HEADER]:sid,'X-Correlation-Id':`day5-guide-${crypto.randomUUID()}`
      },
      body:JSON.stringify({intent})
    });
    let payload={};try{payload=await response.json()}catch{}
    if(!response.ok||payload?.success===false){
      const error=new Error(payload?.error?.message||`GalviGuide request failed (${response.status}).`);
      error.code=payload?.error?.code||'GV_GUIDE_FAILED';error.status=response.status;error.payload=payload;throw error;
    }
    return payload?.data||{};
  }

  const bandLabel=(band)=>({
    green:'Green — routine',
    yellow:'Yellow — passive care / needs attention',
    orange:'Orange — active care recommended',
    red:'Red — urgent / specialty escalation'
  })[text(band).toLowerCase()]||text(band)||'Unavailable';

  const careLabel=(route)=>({
    passive_monitoring:'Passive monitoring',
    passive_intervention:'Passive intervention',
    active_care_recommended:'Active care recommended',
    urgent_active_specialty_referral:'Urgent active / specialty referral'
  })[text(route)]||text(route).replaceAll('_',' ')||'Care route unavailable';

  const supportLabel=(value)=>({
    self_guided:'Self-guided + GalviGuide available',
    galviguide:'GalviGuide',
    galviclinic:'GalviClinic / Business Physician',
    qualified_referral:'Qualified referral / specialty care'
  })[text(value)]||text(value).replaceAll('_',' ')||'—';

  function actionCopy(route,hostId){
    if(route.referral_required)return 'Continue the governed GalviPath and specialty/referral route. GalviGuide remains bounded and cannot provide the licensed conclusion.';
    if(route.clinic_recommended)return hostId==='galvipath-result'
      ?'Your Acuity supports active care. Use the existing Book GalviClinic action for Business Physician review.'
      :'Continue through the existing Shot → Sight → Path sequence; GalviClinic becomes the active-care destination after GalviPath.';
    if(text(route.acuity_band).toLowerCase()==='yellow')return hostId==='galvipath-result'
      ?'This is a passive-care route. Use GalviGuide for navigation/reminders and continue monitoring without forcing GalviClinic.'
      :'Continue through the existing Shot → Sight → Path sequence. The current route remains passive; GalviGuide can explain and navigate without forcing active care.';
    return 'Continue the governed customer journey and monitor the evidence. GalviGuide can explain the route without changing the score or treatment.';
  }

  function markup(route,hostId){
    const band=text(route.acuity_band).toLowerCase();
    const detailId=`day5-guide-detail-${hostId}`;
    return `<section class="day5-care-route" data-day5-care-routing="${esc(hostId)}">
      <p class="eyebrow">GALVICARE 1.0 | CARE ROUTING</p>
      <h3>GalviScore + Business Health Acuity</h3>
      <p><strong>GalviScore:</strong> ${route.overall_score==null?'—':esc(route.overall_score)}/100</p>
      <p><span class="day5-acuity-badge day5-acuity-${esc(band||'green')}">Acuity ${route.acuity_score==null?'—':esc(route.acuity_score)}/100 · ${esc(bandLabel(band))}</span></p>
      <p class="day5-route-muted"><strong>Important:</strong> GalviScore measures current Business Health. Acuity measures how urgently care should escalate. The existing “What you should watch?” box is GalviScore guidance; this Care Routing panel is the GalviGuide/GalviPath routing layer.</p>
      <div class="day5-route-grid">
        <div class="day5-route-cell"><strong>Disposition</strong><br>${esc(careLabel(route.disposition))}</div>
        <div class="day5-route-cell"><strong>Recommended support</strong><br>${esc(supportLabel(route.support_level))}</div>
        <div class="day5-route-cell"><strong>Clinical Confidence</strong><br>${route.clinical_confidence==null?'—':`${esc(route.clinical_confidence)}%`}</div>
      </div>
      <p><strong>Next step:</strong> ${esc(actionCopy(route,hostId))}</p>
      <button type="button" class="secondary-button" data-day5-guide-open="${esc(detailId)}">${route.clinic_recommended?'Prepare with GalviGuide':'Open GalviGuide'}</button>
      <div id="${esc(detailId)}" class="day5-guide-box hidden" aria-live="polite">
        <h4>GalviGuide — bounded care navigation</h4>
        <p>${esc(route.guide_message||'GalviGuide can explain approved outputs, navigate your care path, request evidence, prepare Clinic, remind milestones, and facilitate routine check-ins.')}</p>
        <p class="day5-route-muted"><strong>Boundary:</strong> GalviGuide cannot change GalviScore or Acuity, diagnose, approve a Treatment Plan, override Business Physician judgment, or provide licensed advice.</p>
        <p class="day5-route-muted"><strong>Current route:</strong> ${esc(route.reminder||actionCopy(route,hostId))}</p>
      </div>
    </section>`;
  }

  function bind(panel){
    panel?.querySelector('[data-day5-guide-open]')?.addEventListener('click',event=>{
      const detail=byId(event.currentTarget.dataset.day5GuideOpen);
      detail?.classList.toggle('hidden');
    });
  }

  function render(route){
    installStyle();
    for(const id of STAGES){
      const host=byId(id);if(!host)continue;
      const existing=host.querySelector(`[data-day5-care-routing="${id}"]`);
      if(existing)existing.remove();
      const holder=document.createElement('div');holder.innerHTML=markup(route,id);
      const panel=holder.firstElementChild;
      const row=host.querySelector('.button-row');
      if(row)host.insertBefore(panel,row);else host.appendChild(panel);
      bind(panel);
    }
  }

  function visible(node){
    if(!node)return false;const style=getComputedStyle(node);
    return !node.classList.contains('hidden')&&style.display!=='none'&&style.visibility!=='hidden';
  }

  function scheduleRetry(){
    if(retryTimer||retryCount>=8)return;
    retryCount++;
    retryTimer=setTimeout(()=>{retryTimer=null;refresh(true).catch(()=>{})},1500);
  }

  async function refresh(force=false){
    if(inFlight)return inFlight;
    if(cached&&!force){render(cached);return cached}
    inFlight=(async()=>{
      const route=await api('explain_route');cached=route;retryCount=0;render(route);return route;
    })();
    try{return await inFlight}
    catch(error){
      if(error?.code==='GV_DAY5_CARE_ROUTE_NOT_READY'||error?.status===409)scheduleRetry();
      else console.warn(SIGNATURE,error?.code||'',error?.message||error);
      throw error;
    }finally{inFlight=null}
  }

  function install(){
    installStyle();
    const observer=new MutationObserver(()=>{
      if(STAGES.some(id=>visible(byId(id))))queueMicrotask(()=>refresh(false).catch(()=>{}));
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    for(const event of ['pageshow','hashchange','popstate','focus'])window.addEventListener(event,()=>{
      if(STAGES.some(id=>visible(byId(id))))refresh(true).catch(()=>{});
    });
    if(STAGES.some(id=>visible(byId(id))))refresh(false).catch(()=>{});
    window.GalviCareDay5Routing=Object.freeze({
      refresh,
      getRoute:()=>refresh(true),
      explain:()=>api('explain_route'),
      reminder:()=>api('reminder'),
      requestEvidence:()=>api('request_evidence'),
      clinicPrep:()=>api('clinic_prep'),
      testBoundary:()=>api('change_score'),
      signature:SIGNATURE
    });
    console.info(SIGNATURE,'active');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
