/* GalviCare 1.0 Day 5 canonical GalviScore metadata projection.
 * Renderer only: Classification, Lowest Category and Acuity are supplied by the
 * cumulative Day 5 Worker after the inherited clarification persists. The browser
 * never recomputes GalviScore or Acuity.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 5 canonical GalviScore metadata v1';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const text=value=>String(value??'').trim();
  const byId=id=>document.getElementById(id);
  const session=()=>typeof window.getStoredSessionId==='function'
    ?text(window.getStoredSessionId())
    :text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  let inFlight=null,cached=null,retry=null,retryCount=0;

  function visible(node){if(!node||!node.isConnected)return false;const style=getComputedStyle(node);return !node.classList.contains('hidden')&&style.display!=='none'&&style.visibility!=='hidden';}
  function clarificationActive(){const host=byId('followup-question-container');return visible(host)&&Boolean(host.querySelector('textarea,[data-question-id],[data-question-code]'));}
  function scoreVisible(){return visible(byId('galviscore-result'))&&!clarificationActive();}
  function label(value){return text(value).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}
  function acuityLabel(band){return ({green:'Green — routine',yellow:'Yellow — passive care / needs attention',orange:'Orange — active care recommended',red:'Red — urgent / specialty escalation'})[text(band).toLowerCase()]||label(band)||'Unavailable';}

  async function api(){
    const sid=session();if(!sid)throw new Error('Authenticated GalviCare session is required.');
    const response=await fetch(`${BASE}/api/v1/day5/customer/score-metadata`,{method:'POST',cache:'no-store',headers:{'Accept':'application/json','Content-Type':'application/json','Cache-Control':'no-cache',[SESSION_HEADER]:sid,'X-Correlation-Id':`day5-score-meta-${crypto.randomUUID()}`},body:'{}'});
    let payload={};try{payload=await response.json()}catch{}
    if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`GalviScore metadata request failed (${response.status}).`);error.status=response.status;error.code=payload?.error?.code||'GV_DAY5_SCORE_METADATA_FAILED';throw error;}
    return payload?.data||{};
  }

  function render(data){
    if(!scoreVisible())return;
    const classification=byId('galviscore-classification');
    const lowest=byId('galviscore-lowest-category');
    if(classification&&text(data?.classification))classification.textContent=text(data.classification);
    if(lowest&&text(data?.lowest_category))lowest.textContent=label(data.lowest_category);
    let acuity=byId('day5-score-acuity-summary');
    if(!acuity){acuity=document.createElement('p');acuity.id='day5-score-acuity-summary';acuity.dataset.day5ScoreMetadata='canonical';const anchor=lowest?.closest('p')||byId('galviscore-category-bars');if(anchor?.parentNode)anchor.insertAdjacentElement('afterend',acuity);}
    const score=data?.acuity_score==null?'—':text(data.acuity_score);
    acuity.innerHTML=`Acuity: <strong>${score}/100 · ${acuityLabel(data?.acuity_band)}</strong>`;
    acuity.title='Acuity is server-owned care urgency and is distinct from the GalviScore Business Health score.';
  }

  function schedule(){if(retry||retryCount>=6)return;retryCount++;retry=setTimeout(()=>{retry=null;refresh(true).catch(()=>{})},1200);}
  async function refresh(force=false){
    if(!scoreVisible())return null;
    if(inFlight)return inFlight;
    if(cached&&!force){render(cached);return cached;}
    inFlight=api();
    try{const data=await inFlight;cached=data;retryCount=0;render(data);return data;}
    catch(error){if(error?.status===404||error?.status===409)schedule();else console.warn(SIGNATURE,error?.code||'',error?.message||error);throw error;}
    finally{inFlight=null;}
  }

  function install(){
    const observer=new MutationObserver(()=>{if(scoreVisible())queueMicrotask(()=>refresh(false).catch(()=>{}));});
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
    for(const event of ['pageshow','hashchange','popstate','focus'])window.addEventListener(event,()=>{if(scoreVisible())refresh(true).catch(()=>{});});
    if(scoreVisible())refresh(false).catch(()=>{});
    window.GalviCareDay5ScoreMetadata=Object.freeze({refresh,get:()=>refresh(true),signature:SIGNATURE});
    console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
