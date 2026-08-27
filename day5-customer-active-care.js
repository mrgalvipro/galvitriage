/* GalviCare 1.0 Day 5 customer active-care adapter.
 * H19 critical path: customer acknowledges the Business Physician-authored Treatment Plan,
 * then submits one idempotent scheduled check-in. The browser never supplies BMR identity,
 * role authority, D1 access, OpenAI access, or treatment authorship.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 5 customer Treatment Plan acknowledgement v1';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const text=(value)=>String(value??'').trim();
  const byId=(id)=>document.getElementById(id);
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const session=()=>typeof window.getStoredSessionId==='function'?text(window.getStoredSessionId()):text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  let rendering=false;

  function stableKey(kind,planId){
    const storageKey=`galvicare_day5_h19_${kind}_${planId}`;
    let key=localStorage.getItem(storageKey);
    if(!key){key=`d5-${kind}-${crypto.randomUUID()}`;localStorage.setItem(storageKey,key)}
    return key;
  }

  async function api(path,{body={},key}={}){
    const sid=session();if(!sid)throw new Error('Your authenticated GalviCare session is required.');
    const response=await fetch(BASE+path,{method:'POST',cache:'no-store',headers:{
      'Accept':'application/json','Content-Type':'application/json','Cache-Control':'no-cache',
      [SESSION_HEADER]:sid,'X-Correlation-Id':`day5-browser-${crypto.randomUUID()}`,
      ...(key?{'Idempotency-Key':key}:{})
    },body:JSON.stringify(body)});
    let payload={};try{payload=await response.json()}catch{}
    if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`Day 5 customer care request failed (${response.status}).`);error.code=payload?.error?.code||'GV_DAY5_CUSTOMER_FAILED';throw error}
    return payload;
  }

  function currentPlan(active){return Array.isArray(active?.treatment_plans)?active.treatment_plans[0]||null:null}
  function alreadyAcknowledged(active,planId){return (active?.acknowledgements||[]).some((row)=>text(row?.treatment_plan_id)===text(planId)&&row?.event_type==='customer_acknowledged')}
  function checkinCount(active,planId){return (active?.checkins||[]).filter((row)=>text(row?.treatment_plan_id)===text(planId)).length}

  async function refresh(){
    if(rendering||!window.GalviChartDay4?.read)return;
    const host=byId('galvichart-day4');if(!host?.classList.contains('active'))return;
    rendering=true;
    try{
      const chart=await window.GalviChartDay4.read();const active=chart?.data?.sections?.active_care,plan=currentPlan(active);
      let node=byId('galvichart-day5-active-care');
      if(!plan){if(node)node.remove();return}
      if(!node){node=document.createElement('section');node.id='galvichart-day5-active-care';node.className='gchart-section';host.appendChild(node)}
      const ack=alreadyAcknowledged(active,plan.treatment_plan_id),checks=checkinCount(active,plan.treatment_plan_id);
      node.innerHTML=`<h3>Active Care</h3><p><strong>${esc(plan.name||'Treatment Plan')}</strong> · ${esc(plan.status||'active')} · v${esc(plan.version_no||1)}</p><p>${esc(plan.objective||plan.clinical_priority||'Follow your Business Physician-approved care plan.')}</p><p class="gchart-muted">Acknowledgement is separate from Treatment Plan authorship. Your Business Physician remains the treatment author.</p><div data-day5-status>${ack?'Treatment Plan acknowledged.':'Please acknowledge that you received this Treatment Plan.'}${checks?` Scheduled check-ins recorded: ${checks}.`:''}</div>${ack?'':`<button type="button" data-day5-ack>Acknowledge Treatment Plan</button>`}<label for="day5-checkin-summary">Scheduled check-in</label><textarea id="day5-checkin-summary" maxlength="1000" placeholder="Share progress, blockers, or new evidence since your Treatment Plan was issued."></textarea><button type="button" data-day5-checkin>Submit scheduled check-in</button>`;
      const status=node.querySelector('[data-day5-status]');
      node.querySelector('[data-day5-ack]')?.addEventListener('click',async(event)=>{
        const button=event.currentTarget;button.disabled=true;status.textContent='Saving acknowledgement…';
        try{await api(`/api/v1/day5/customer/treatment-plans/${encodeURIComponent(plan.treatment_plan_id)}/acknowledgement`,{key:stableKey('ack',plan.treatment_plan_id)});status.textContent='Treatment Plan acknowledged. Your Business Physician remains the author.';await window.GalviChartDay4.open()}
        catch(error){status.textContent=`${error.code||'GV_DAY5_ACK'}: ${error.message}`;button.disabled=false}
      });
      node.querySelector('[data-day5-checkin]')?.addEventListener('click',async(event)=>{
        const button=event.currentTarget,summary=text(byId('day5-checkin-summary')?.value);button.disabled=true;status.textContent='Saving scheduled check-in…';
        try{await api('/api/v1/day5/customer/checkins',{key:stableKey('checkin',plan.treatment_plan_id),body:{treatment_plan_id:plan.treatment_plan_id,due_context:'scheduled',responses:{summary:summary||'Scheduled Business Health check-in submitted.'},adherence_state:'reported'}});status.textContent='Scheduled check-in saved to the same Business Health Record.';await window.GalviChartDay4.open()}
        catch(error){status.textContent=`${error.code||'GV_DAY5_CHECKIN'}: ${error.message}`;button.disabled=false}
      });
    }catch(error){console.warn(SIGNATURE,error?.code||'',error?.message||error)}finally{rendering=false}
  }

  function install(){
    const observer=new MutationObserver(()=>{if(byId('galvichart-day4')?.classList.contains('active'))queueMicrotask(refresh)});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('click',(event)=>{if(event.target?.closest?.('[data-day4-chart-button]'))setTimeout(refresh,400)});
    if(byId('galvichart-day4')?.classList.contains('active'))refresh();
    window.GalviCareDay5Customer=Object.freeze({refresh,signature:SIGNATURE});
    console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
