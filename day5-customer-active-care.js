/* GalviCare 1.0 Day 5 customer active-care adapter.
 * H19 critical path: customer acknowledges the Business Physician-authored Treatment Plan,
 * then submits one idempotent scheduled check-in. The browser never supplies BMR identity,
 * role authority, D1 access, OpenAI access, Stripe secret access, or treatment authorship.
 *
 * Day 7 commercial close:
 * - Business Physician recommendation remains a clinical decision, not a paid activation;
 * - the customer receives a server-scoped Business Health Membership offer on the same BHR/plan;
 * - Stripe Checkout is opened only from the server-configured approved Payment Link;
 * - paid return is resolved by the Worker, and Membership becomes active only after server verification.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 5 customer Treatment Plan acknowledgement + Day 7 Membership conversion v1.2';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const text=(value)=>String(value??'').trim();
  const byId=(id)=>document.getElementById(id);
  const esc=(value)=>String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const session=()=>typeof window.getStoredSessionId==='function'?text(window.getStoredSessionId()):text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  let rendering=false,chartWasActive=false,lastActiveFingerprint='',boundedRereadPending=false,membershipRendering=false,lastMembershipFingerprint='';

  function stableKey(kind,planId){
    const storageKey=`galvicare_day5_h19_${kind}_${planId}`;
    let key=localStorage.getItem(storageKey);
    if(!key){key=`d5-${kind}-${crypto.randomUUID()}`;localStorage.setItem(storageKey,key)}
    return key;
  }
  function membershipKey(kind,offerId='current'){
    const storageKey=`galvicare_day7_membership_${kind}_${offerId}`;
    let key=localStorage.getItem(storageKey);
    if(!key){key=`d7-membership-${kind}-${crypto.randomUUID()}`;localStorage.setItem(storageKey,key)}
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
    if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`Day 5 customer care request failed (${response.status}).`);error.code=payload?.error?.code||'GV_DAY5_CUSTOMER_FAILED';error.status=response.status;throw error}
    return payload;
  }
  async function membershipRequest(path,{method='GET',body,key}={}){
    const sid=session();if(!sid)throw new Error('Your authenticated GalviCare session is required.');
    const response=await fetch(BASE+path,{method,cache:'no-store',headers:{
      'Accept':'application/json','Content-Type':'application/json','Cache-Control':'no-cache',
      [SESSION_HEADER]:sid,'X-Correlation-Id':`day7-membership-${crypto.randomUUID()}`,
      ...(key?{'Idempotency-Key':key}:{})
    },...(body===undefined?{}:{body:JSON.stringify(body)})});
    let payload={};try{payload=await response.json()}catch{}
    if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`Business Health Membership request failed (${response.status}).`);error.code=payload?.error?.code||'GV_MEMBERSHIP_FAILED';error.status=response.status;throw error}
    return payload?.data||{};
  }

  function activeCareFromChart(chart){
    return chart?.data?.sections?.active_care||chart?.data?.active_care||chart?.sections?.active_care||chart?.active_care||null;
  }
  function currentPlan(active){return Array.isArray(active?.treatment_plans)?active.treatment_plans[0]||null:null}
  function alreadyAcknowledged(active,planId){return (active?.acknowledgements||[]).some((row)=>text(row?.treatment_plan_id)===text(planId)&&row?.event_type==='customer_acknowledged')}
  function checkinCount(active,planId){return (active?.checkins||[]).filter((row)=>text(row?.treatment_plan_id)===text(planId)).length}
  function activeFingerprint(plan,ack,checks){return JSON.stringify([text(plan?.treatment_plan_id),Number(plan?.version_no||1),text(plan?.status),text(plan?.name),text(plan?.objective||plan?.clinical_priority),Boolean(ack),Number(checks||0)]);}

  function chartTargets(){
    return [
      byId('galvishot-result'),
      byId('galvisight-result-panel')||byId('galvisight-handoff'),
      byId('galvipath-result-panel')||byId('galvipath-result')
    ].filter((node,index,array)=>node&&array.indexOf(node)===index);
  }
  function ensureChartButtons(){
    if(typeof window.GalviChartDay4?.open!=='function')return;
    for(const host of chartTargets()){
      if(host.querySelector('[data-day4-chart-button]'))continue;
      const container=host.querySelector('.button-row')||host;
      const button=document.createElement('button');button.type='button';button.className='secondary-button';button.dataset.day4ChartButton='true';button.textContent='View GalviChart™';
      button.addEventListener('click',()=>window.GalviChartDay4.open());container.appendChild(button);
    }
  }

  function checkoutUrl(base,offerId){
    const raw=text(base);if(!raw)return'';
    try{const u=new URL(raw);u.searchParams.set('client_reference_id',offerId);return u.toString()}catch{return''}
  }
  async function renderMembershipOffer(host,plan){
    if(membershipRendering||!host?.isConnected||!plan)return;
    membershipRendering=true;
    try{
      let data;
      try{data=await membershipRequest('/api/v1/day7/customer/membership-offer')}catch(error){
        if([404,409].includes(Number(error?.status))){byId('galvichart-day7-membership-offer')?.remove();lastMembershipFingerprint='';return}
        throw error;
      }
      const active=data?.membership,offer=data?.offer;
      const fp=JSON.stringify([text(active?.membership_id),text(active?.status),text(offer?.offer_id),text(offer?.status),Boolean(offer?.checkout_configured),text(plan?.treatment_plan_id)]);
      let node=byId('galvichart-day7-membership-offer');
      if(lastMembershipFingerprint===fp&&node?.dataset?.membershipFingerprint===fp)return;
      if(!node){node=document.createElement('section');node.id='galvichart-day7-membership-offer';node.className='gchart-section';host.appendChild(node)}
      node.dataset.membershipFingerprint=fp;lastMembershipFingerprint=fp;
      if(active?.status==='active'){
        node.innerHTML=`<h3>Business Health Membership™</h3><p><strong>Continuous Care is active.</strong></p><p>Your Membership remains connected to this Business Health Record and Business Physician Treatment Plan.</p><p class="gchart-muted">Membership ID: ${esc(active.membership_id)}</p>`;
        return;
      }
      if(!offer){node.remove();lastMembershipFingerprint='';return}
      const configured=offer.checkout_configured===true;
      node.innerHTML=`<h3>Business Health Membership™</h3><p><strong>Your Business Physician recommends Continuous Care.</strong></p><p>Continue your Treatment Plan with ongoing Business Health check-ins, monitoring, care-plan management, reassessment, and navigation on this same GalviChart.</p><p class="gchart-muted">Clinical decision and purchase are separate. Your Business Physician recommends the care relationship; you decide whether to enroll.</p>${configured?'<button type="button" data-day7-membership-offer>Review Membership & Continue</button>':'<p class="gchart-muted"><strong>Enrollment checkout is not yet configured for this environment.</strong> Your recommendation remains recorded; no Membership has been activated or charged.</p>'}<p data-day7-membership-status class="gchart-muted"></p>`;
      if(configured){
        const status=node.querySelector('[data-day7-membership-status]');
        try{
          const presented=await membershipRequest('/api/v1/day7/customer/membership-offer',{method:'POST',key:membershipKey('offered',offer.offer_id),body:{}});
          const presentedOffer=presented?.offer||offer,link=checkoutUrl(presentedOffer.checkout_url,presentedOffer.offer_id||offer.offer_id);
          node.querySelector('[data-day7-membership-offer]')?.addEventListener('click',()=>{
            if(!link){status.textContent='The approved Membership checkout is not available. No charge or activation occurred.';return}
            status.textContent='Opening the secure Business Health Membership checkout…';
            window.location.assign(link);
          });
        }catch(error){status.textContent=error?.message||'Membership offer could not be prepared. No charge or activation occurred.'}
      }
    }catch(error){console.warn(SIGNATURE,'membership-offer',error?.code||'',error?.message||error)}finally{membershipRendering=false}
  }

  async function resolveMembershipReturnOnLoad(){
    const u=new URL(window.location.href),product=text(u.searchParams.get('product')).toLowerCase(),paid=text(u.searchParams.get('paid')).toLowerCase();
    if(product!=='business_health_membership'&&paid!=='membership_success')return false;
    const stripeSessionId=text(u.searchParams.get('stripe_session_id')||u.searchParams.get('session_id'));
    if(!stripeSessionId.startsWith('cs_'))return false;
    try{
      const data=await membershipRequest('/api/v1/day7/customer/membership-payment-return',{method:'POST',key:membershipKey('paid',stripeSessionId),body:{stripe_session_id:stripeSessionId}});
      localStorage.setItem('galvicare_day7_membership_last_activation',JSON.stringify({membership_id:data?.membership?.membership_id||null,activated_at:new Date().toISOString(),event:data?.revenue_conversion_event||'membership_started'}));
      for(const key of ['product','paid','stripe_session_id','session_id'])u.searchParams.delete(key);
      history.replaceState({},'',u.toString());
      lastMembershipFingerprint='';
      return true;
    }catch(error){console.warn(SIGNATURE,'membership-paid-return',error?.code||'',error?.message||error);return false}
  }

  async function refresh(){
    if(rendering||!window.GalviChartDay4?.read)return;
    const host=byId('galvichart-day4');if(!host?.classList.contains('active'))return;
    rendering=true;
    try{
      let chart=await window.GalviChartDay4.read();let active=activeCareFromChart(chart),plan=currentPlan(active);
      if(!plan&&!boundedRereadPending){
        boundedRereadPending=true;
        await new Promise(resolve=>setTimeout(resolve,350));
        chart=await window.GalviChartDay4.read();active=activeCareFromChart(chart);plan=currentPlan(active);
      }
      if(plan)boundedRereadPending=false;
      let node=byId('galvichart-day5-active-care');
      if(!plan){if(node)node.remove();byId('galvichart-day7-membership-offer')?.remove();lastActiveFingerprint='';lastMembershipFingerprint='';return}
      const ack=alreadyAcknowledged(active,plan.treatment_plan_id),checks=checkinCount(active,plan.treatment_plan_id),fingerprint=activeFingerprint(plan,ack,checks);
      if(!node){node=document.createElement('section');node.id='galvichart-day5-active-care';node.className='gchart-section';host.appendChild(node)}
      if(lastActiveFingerprint!==fingerprint||node.dataset.day5ActiveFingerprint!==fingerprint){
        node.dataset.day5ActiveFingerprint=fingerprint;
        node.innerHTML=`<h3>Active Care</h3><p><strong>${esc(plan.name||'Treatment Plan')}</strong> · ${esc(plan.status||'active')} · v${esc(plan.version_no||1)}</p><p>${esc(plan.objective||plan.clinical_priority||'Follow your Business Physician-approved care plan.')}</p><p class="gchart-muted">Acknowledgement is separate from Treatment Plan authorship. Your Business Physician remains the treatment author.</p><div data-day5-status>${ack?'Treatment Plan acknowledged.':'Please acknowledge that you received this Treatment Plan.'}${checks?` Scheduled check-ins recorded: ${checks}.`:''}</div>${ack?'':`<button type="button" data-day5-ack>Acknowledge Treatment Plan</button>`}<label for="day5-checkin-summary">Scheduled check-in</label><textarea id="day5-checkin-summary" maxlength="1000" placeholder="Share progress, blockers, or new evidence since your Treatment Plan was issued."></textarea><button type="button" data-day5-checkin>Submit scheduled check-in</button>`;
        lastActiveFingerprint=fingerprint;
        const status=node.querySelector('[data-day5-status]');
        node.querySelector('[data-day5-ack]')?.addEventListener('click',async(event)=>{
          const button=event.currentTarget;button.disabled=true;status.textContent='Saving acknowledgement…';
          try{await api(`/api/v1/day5/customer/treatment-plans/${encodeURIComponent(plan.treatment_plan_id)}/acknowledgement`,{key:stableKey('ack',plan.treatment_plan_id)});status.textContent='Treatment Plan acknowledged. Your Business Physician remains the author.';lastActiveFingerprint='';boundedRereadPending=false;await window.GalviChartDay4.open();setTimeout(()=>refresh().catch(()=>{}),0)}
          catch(error){status.textContent=`${error.code||'GV_DAY5_ACK'}: ${error.message}`;button.disabled=false}
        });
        node.querySelector('[data-day5-checkin]')?.addEventListener('click',async(event)=>{
          const button=event.currentTarget,summary=text(byId('day5-checkin-summary')?.value);button.disabled=true;status.textContent='Saving scheduled check-in…';
          try{await api('/api/v1/day5/customer/checkins',{key:stableKey('checkin',plan.treatment_plan_id),body:{treatment_plan_id:plan.treatment_plan_id,due_context:'scheduled',responses:{summary:summary||'Scheduled Business Health check-in submitted.'},adherence_state:'reported'}});status.textContent='Scheduled check-in saved to the same Business Health Record.';lastActiveFingerprint='';boundedRereadPending=false;await window.GalviChartDay4.open();setTimeout(()=>refresh().catch(()=>{}),0)}
          catch(error){status.textContent=`${error.code||'GV_DAY5_CHECKIN'}: ${error.message}`;button.disabled=false}
        });
      }
      await renderMembershipOffer(host,plan);
    }catch(error){console.warn(SIGNATURE,error?.code||'',error?.message||error)}finally{rendering=false}
  }

  function install(){
    ensureChartButtons();
    resolveMembershipReturnOnLoad().then(changed=>{if(changed&&typeof window.GalviChartDay4?.open==='function')window.GalviChartDay4.open().then(()=>refresh().catch(()=>{})).catch(()=>{})});
    const observer=new MutationObserver((mutations)=>{
      ensureChartButtons();
      const chart=byId('galvichart-day4'),active=Boolean(chart?.classList.contains('active'));
      const chartRebuilt=Boolean(chart&&mutations.some(mutation=>mutation.type==='childList'&&mutation.target===chart));
      const needsActiveCare=active&&!byId('galvichart-day5-active-care');
      if(active&&(!chartWasActive||(chartRebuilt&&needsActiveCare)))queueMicrotask(()=>refresh().catch(()=>{}));
      chartWasActive=active;
    });
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('click',(event)=>{if(event.target?.closest?.('[data-day4-chart-button]')){boundedRereadPending=false;setTimeout(()=>refresh().catch(()=>{}),400)}});
    chartWasActive=Boolean(byId('galvichart-day4')?.classList.contains('active'));
    if(chartWasActive)refresh().catch(()=>{});
    window.GalviCareDay5Customer=Object.freeze({refresh,ensureChartButtons,resolveMembershipReturnOnLoad,signature:SIGNATURE});
    console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();