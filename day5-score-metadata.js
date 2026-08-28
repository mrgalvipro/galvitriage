/* GalviCare 1.0 Day 5 canonical GalviScore metadata projection.
 * Renderer only: Classification, Lowest Category and Acuity are supplied by the
 * cumulative Day 5 Worker after the inherited clarification persists. The browser
 * never recomputes GalviScore or Acuity.
 *
 * H02/H06 runtime remediation:
 * - rendering is fingerprinted/idempotent so this adapter cannot trigger its own
 *   MutationObserver forever;
 * - blank metadata fields render an explicit unavailable state rather than a silent blank;
 * - canonical refresh remains blocked only while the inherited Score clarification
 *   panel is actually visible. A stale textarea retained inside a hidden follow-up
 *   panel must never suppress Acuity/Classification after clarification completes.
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
  let inFlight=null,cached=null,retry=null,retryCount=0,lastFingerprint='';

  function visible(node){
    if(!node||!node.isConnected)return false;
    for(let current=node;current&&current.nodeType===1;current=current.parentElement){
      if(current.hidden||current.classList?.contains('hidden'))return false;
      const style=getComputedStyle(current);
      if(style.display==='none'||style.visibility==='hidden')return false;
    }
    return node.getClientRects().length>0;
  }
  function clarificationActive(){
    const panel=byId('galviscore-followup'),host=byId('followup-question-container');
    return visible(panel)&&Boolean(host?.querySelector('textarea,[data-question-id],[data-question-code]'));
  }
  function scoreVisible(){return visible(byId('galviscore-result'))&&!clarificationActive();}
  function label(value){return text(value).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}
  function acuityLabel(band){return ({green:'Green — routine',yellow:'Yellow — passive care / needs attention',orange:'Orange — active care recommended',red:'Red — urgent / specialty escalation'})[text(band).toLowerCase()]||label(band)||'Unavailable';}
  function fingerprint(data){return JSON.stringify([text(data?.classification),text(data?.lowest_category),data?.acuity_score??null,text(data?.acuity_band),data?.clinical_confidence??null,text(data?.score_result_id),Number(data?.score_record_version||0)]);}

  async function api(){
    const sid=session();if(!sid)throw new Error('Authenticated GalviCare session is required.');
    const response=await fetch(`${BASE}/api/v1/day5/customer/score-metadata`,{method:'POST',cache:'no-store',headers:{'Accept':'application/json','Content-Type':'application/json','Cache-Control':'no-cache',[SESSION_HEADER]:sid,'X-Correlation-Id':`day5-score-meta-${crypto.randomUUID()}`},body:'{}'});
    let payload={};try{payload=await response.json()}catch{}
    if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`GalviScore metadata request failed (${response.status}).`);error.status=response.status;error.code=payload?.error?.code||'GV_DAY5_SCORE_METADATA_FAILED';throw error;}
    return payload?.data||{};
  }

  function ensureAcuityNode(lowest){
    let acuity=byId('day5-score-acuity-summary');
    if(acuity)return acuity;
    acuity=document.createElement('p');acuity.id='day5-score-acuity-summary';acuity.dataset.day5ScoreMetadata='canonical';
    const anchor=lowest?.closest('p')||byId('galviscore-category-bars');
    if(anchor?.parentNode)anchor.insertAdjacentElement('afterend',acuity);
    return acuity;
  }

  function render(data){
    if(!scoreVisible())return false;
    const fp=fingerprint(data);
    const classification=byId('galviscore-classification');
    const lowest=byId('galviscore-lowest-category');
    const classificationValue=text(data?.classification)||'Unavailable';
    const lowestValue=text(data?.lowest_category)?label(data.lowest_category):'Unavailable';
    const acuity=ensureAcuityNode(lowest);
    const score=data?.acuity_score==null?'—':text(data.acuity_score);
    const acuityHtml=`Acuity: <strong>${score}/100 · ${acuityLabel(data?.acuity_band)}</strong>`;
    if(fp===lastFingerprint
      && (!classification||text(classification.textContent)===classificationValue)
      && (!lowest||text(lowest.textContent)===lowestValue)
      && (!acuity||acuity.innerHTML===acuityHtml)) return false;
    if(classification&&text(classification.textContent)!==classificationValue)classification.textContent=classificationValue;
    if(lowest&&text(lowest.textContent)!==lowestValue)lowest.textContent=lowestValue;
    if(acuity&&acuity.innerHTML!==acuityHtml)acuity.innerHTML=acuityHtml;
    if(acuity)acuity.title='Acuity is server-owned care urgency and is distinct from the GalviScore Business Health score.';
    lastFingerprint=fp;
    return true;
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
