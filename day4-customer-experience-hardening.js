/* GalviCare 1.0 Day 4 customer-experience hardening adapter — QA only.
 * Critical-path purpose:
 * 1) preserve unsaved GalviShot/GalviSight/GalviPath targeted follow-up drafts when the
 *    customer switches tabs/windows or the dynamic follow-up UI re-renders;
 * 2) translate the authorized GalviChart projection into novice-founder language while
 *    preserving stored deterministic facts and accepted governed intelligence;
 * 3) never treat browser drafts as canonical evidence and never call OpenAI/D1 directly.
 */
(()=>{
  'use strict';

  const SIGNATURE='GalviCare Day 4 customer experience hardening v1';
  const DRAFT_SIGNATURE='GalviCare Day 4 follow-up draft resilience v1';
  const CHART_SIGNATURE='GalviCare Day 4 customer-safe governed interpretation v1';
  const DRAFT_STORE='galvicare_followup_drafts_v1';
  const FOLLOWUP_HOSTS=Object.freeze({
    'galvishot-followup-questions':'GalviShot',
    'galvisight-followup-questions':'GalviSight',
    'galvipath-followup-questions':'GalviPath'
  });
  const SAVE_ACTION_PRODUCTS=Object.freeze({
    save_galvishot_followup:'GalviShot',
    save_galvisight_followup:'GalviSight',
    save_galvipath_followup:'GalviPath'
  });
  const text=(value)=>String(value??'').trim();
  const byId=(id)=>document.getElementById(id);
  const session=()=>typeof window.getStoredSessionId==='function'
    ?text(window.getStoredSessionId())
    :text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  let latestChartPayload=null;
  let hardeningQueued=false;

  function parseDraftStore(){
    try{
      const value=JSON.parse(localStorage.getItem(DRAFT_STORE)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return{}}
  }

  function writeDraftStore(value){
    try{localStorage.setItem(DRAFT_STORE,JSON.stringify(value||{}))}catch{}
  }

  function productForField(field){
    if(!field||field.tagName!=='TEXTAREA')return '';
    for(const [hostId,product] of Object.entries(FOLLOWUP_HOSTS)){
      if(field.closest?.('#'+hostId))return product;
    }
    return '';
  }

  function questionKey(field){
    const code=text(field?.dataset?.questionCode||field?.dataset?.questionId);
    const question=text(field?.dataset?.questionText);
    const fallback=text(field?.name||field?.id);
    return [code,question].filter(Boolean).join('|')||fallback;
  }

  function scopedDraftKey(product,key){
    const sid=session();
    return sid&&product&&key?[sid,product,key].join('::'):'';
  }

  function persistDraft(field){
    const product=productForField(field),key=questionKey(field),scope=scopedDraftKey(product,key);
    if(!scope)return false;
    const drafts=parseDraftStore();
    const value=String(field.value??'');
    if(value)drafts[scope]={value,updated_at:new Date().toISOString()};
    else delete drafts[scope];
    writeDraftStore(drafts);
    return true;
  }

  function restoreDraft(field){
    if(!field||String(field.value??'').trim())return false;
    const product=productForField(field),key=questionKey(field),scope=scopedDraftKey(product,key);
    if(!scope)return false;
    const draft=parseDraftStore()[scope];
    if(!draft||typeof draft.value!=='string'||!draft.value)return false;
    field.value=draft.value;
    field.dataset.day4DraftRestored='1';
    return true;
  }

  function followupFields(product=''){
    return [...document.querySelectorAll('textarea')].filter((field)=>{
      const actual=productForField(field);
      return actual&&(product?actual===product:true);
    });
  }

  function persistAllDrafts(){followupFields().forEach(persistDraft)}
  function restoreAllDrafts(){followupFields().forEach(restoreDraft)}

  function answerKey(answer){
    const code=text(answer?.question_id||answer?.question_code);
    const question=text(answer?.question_text);
    return [code,question].filter(Boolean).join('|')||code||question;
  }

  function clearSavedDrafts(product,answers){
    const sid=session();
    if(!sid||!product)return;
    const keys=new Set((Array.isArray(answers)?answers:[]).map(answerKey).filter(Boolean));
    const drafts=parseDraftStore(),prefix=sid+'::'+product+'::';
    for(const storedKey of Object.keys(drafts)){
      if(!storedKey.startsWith(prefix))continue;
      const key=storedKey.slice(prefix.length);
      if(!keys.size||keys.has(key))delete drafts[storedKey];
    }
    writeDraftStore(drafts);
  }

  function installDraftResilience(){
    document.addEventListener('input',(event)=>{if(productForField(event.target))persistDraft(event.target)},true);
    document.addEventListener('change',(event)=>{if(productForField(event.target))persistDraft(event.target)},true);
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='hidden')persistAllDrafts();
      else queueMicrotask(restoreAllDrafts);
    });
    window.addEventListener('blur',persistAllDrafts);
    window.addEventListener('focus',()=>queueMicrotask(restoreAllDrafts));
    window.addEventListener('pagehide',persistAllDrafts);
    window.addEventListener('pageshow',()=>queueMicrotask(restoreAllDrafts));
    console.info(DRAFT_SIGNATURE,'active');
  }

  function prettyLabel(value){
    return text(value).replaceAll('_',' ').replace(/\b\w/g,(c)=>c.toUpperCase());
  }

  function statusCopy(value){
    const key=text(value).toLowerCase();
    const map={
      critical:'Critical — the business is showing material pressure that deserves immediate attention.',
      'at risk':'At Risk — important business-health pressure is present and should be treated before it compounds.',
      strained:'Strained — the business can keep moving, but unresolved symptoms are limiting healthy execution.',
      stable:'Stable — the business is functioning, with specific areas that still need attention.',
      'stable but watch':'Stable, but watch closely — the business is functioning while important symptoms remain.',
      healthy:'Healthy — the current record shows stronger business-health signals, with continued monitoring still useful.',
      'healthy/scaling':'Healthy / Scaling — the business shows strong current health and should focus on sustaining what works.',
      recommended_path_available:'Your recommended GalviPath is available.',
      not_yet_available:'Not available yet — complete the next eligible GalviCare step to add this part of your record.',
      available_when_approved:'No approved record documents are available yet.',
      available:'Available now.'
    };
    return map[key]||prettyLabel(value);
  }

  function nextActionCopy(value){
    const key=text(value).toLowerCase();
    const map={
      complete_galvishot:'Complete GalviShot so GalviCare can identify the conditions driving your symptoms.',
      complete_galvishot_entitlement:'Complete GalviShot access to activate your GalviChart.',
      obtain_galvisight:'Continue to GalviSight to understand why these symptoms may be happening.',
      obtain_galvipath:'Continue to GalviPath to turn the diagnosis into a sequenced care plan.',
      obtain_galvisight_or_galvipath:'Continue your diagnostic pathway so GalviCare can build the next layer of your care plan.',
      book_galviclinic:'Book GalviClinic when live Business Physician judgment would help confirm treatment, priorities, or next steps.'
    };
    return map[key]||prettyLabel(value);
  }

  function chartStateCopy(value){
    const key=text(value).toLowerCase();
    const map={
      explorer:'Explorer — your baseline Business Health Record now includes Vitals, GalviScore, and accepted GalviShot findings.',
      sight:'GalviSight added — your record now includes interpretation of the evidence behind the diagnosis.',
      path:'GalviPath added — your record now includes a personalized Business Health care pathway.',
      clinic:'GalviClinic added — your record now includes authorized Business Physician care context.'
    };
    return map[key]||'Your Business Health Record is active and will become more complete as your GalviCare journey continues.';
  }

  function confidenceCopy(value){
    const n=Number(value);
    if(!Number.isFinite(n))return '';
    const pct=n<=1?Math.round(n*100):Math.round(n);
    const meaning=pct<40
      ?'Early evidence — your answers are useful, but additional evidence can materially sharpen the diagnosis.'
      :pct<70
        ?'Developing evidence — the current view is useful, while more evidence can improve precision.'
        :pct<90
          ?'Strong evidence — the current view is well supported, with remaining uncertainty still worth validating.'
          :'Very strong evidence — the current view is highly supported by the evidence currently in your record.';
    return `${pct}% — ${meaning}`;
  }

  function formatDate(value){
    const raw=text(value);
    if(!raw)return '';
    const date=new Date(raw);
    if(Number.isNaN(date.getTime()))return raw;
    return date.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
  }

  function dimensionMeaning(value){
    const n=Number(value);
    if(!Number.isFinite(n))return '';
    if(n<40)return 'Critical — a priority constraint.';
    if(n<55)return 'High risk — needs near-term attention.';
    if(n<70)return 'Needs attention — strengthen before it limits growth.';
    if(n<85)return 'Monitor — generally stable with room to improve.';
    return 'Healthy — currently a relative strength.';
  }

  function findSection(title){
    const chart=byId('galvichart-day4');
    if(!chart)return null;
    return [...chart.querySelectorAll('.gchart-section')].find((node)=>text(node.querySelector('h3')?.textContent)===title)||null;
  }

  function kvNodes(section){
    return [...(section?.querySelectorAll?.('.gchart-kv')||[])];
  }

  function kvValue(section,label){
    const row=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')===label);
    if(!row)return '';
    const clone=row.cloneNode(true);
    clone.querySelector('strong')?.remove();
    return text(clone.textContent);
  }

  function replaceKv(section,label,newLabel,value){
    const row=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')===label);
    if(!row)return false;
    row.innerHTML='';
    const strong=document.createElement('strong');strong.textContent=newLabel+': ';
    row.append(strong,document.createTextNode(text(value)));
    return true;
  }

  function addStyle(){
    if(byId('day4-customer-hardening-style'))return;
    const style=document.createElement('style');
    style.id='day4-customer-hardening-style';
    style.textContent=`
      .gchart-customer-guidance{border:1px solid #b9d5e8;border-left:5px solid #174a73;background:#f6fbff;border-radius:12px;padding:16px;margin:15px 0}
      .gchart-customer-guidance h3{margin:0 0 9px;color:#0f2f47}
      .gchart-customer-guidance p{line-height:1.55;margin:7px 0}
      .gchart-dimensions-friendly{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin:10px 0}
      .gchart-dimension-friendly{border:1px solid #dbe5ee;background:#fff;border-radius:9px;padding:10px;line-height:1.4}
      .gchart-technical-details{margin-top:10px;color:#64748b;font-size:12px}
      .gchart-technical-details summary{cursor:pointer;font-weight:700}
    `;
    document.head.appendChild(style);
  }

  function renderDimensions(section,dimensions){
    if(!section||!dimensions||typeof dimensions!=='object'||Array.isArray(dimensions))return;
    const old=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')==='Dimensions');
    if(!old)return;
    const grid=document.createElement('div');grid.className='gchart-dimensions-friendly';
    for(const [key,value] of Object.entries(dimensions)){
      const card=document.createElement('div');card.className='gchart-dimension-friendly';
      const title=document.createElement('strong');title.textContent=prettyLabel(key);card.appendChild(title);
      const score=document.createElement('div');score.textContent=`${Number(value)}/100`;card.appendChild(score);
      const meaning=document.createElement('div');meaning.className='gchart-muted';meaning.textContent=dimensionMeaning(value);card.appendChild(meaning);
      grid.appendChild(card);
    }
    old.replaceWith(grid);
  }

  function acceptedGuidance(data){
    const sections=data?.sections||{},overview=sections.overview||{},care=sections.care_plan||{};
    const finding=overview.top_finding;
    const statement=typeof finding==='string'?text(finding):text(finding?.statement||finding?.title||finding?.finding_code);
    const why=typeof finding==='object'?text(finding?.reasoning_summary||finding?.why_it_matters):'';
    const recommendation=care.recommendation;
    const sequence=Array.isArray(recommendation?.sequence)?recommendation.sequence:[];
    const first=sequence[0];
    const actions=first&&typeof first==='object'&&Array.isArray(first.actions)?first.actions:[];
    const next=text(actions[0]||(typeof first==='string'?first:first?.action||first?.statement)||finding?.next_step)||nextActionCopy(overview.next_action);
    return {statement,why,next};
  }

  function addGuidance(chart,data){
    if(!chart||chart.querySelector('.gchart-customer-guidance'))return;
    const {statement,why,next}=acceptedGuidance(data);
    if(!statement&&!why&&!next)return;
    const card=document.createElement('section');card.className='gchart-customer-guidance';
    const heading=document.createElement('h3');heading.textContent='What GalviCare understands right now';card.appendChild(heading);
    if(statement){const p=document.createElement('p');p.textContent=statement;card.appendChild(p)}
    if(why){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent='Why this matters: ';p.append(strong,document.createTextNode(why));card.appendChild(p)}
    if(next){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent='What to do next: ';p.append(strong,document.createTextNode(next));card.appendChild(p)}
    const note=document.createElement('p');note.className='gchart-muted';note.textContent='This explanation uses your stored GalviScore and accepted GalviEngine reasoning already saved in GalviVault. Opening GalviChart does not rerun AI or change your clinical record.';card.appendChild(note);
    const status=chart.querySelector('.gchart-status');
    (status||chart.querySelector('h2'))?.insertAdjacentElement('afterend',card);
  }

  function hardenTimeline(data){
    const section=findSection('Timeline');
    if(!section)return;
    const events=Array.isArray(data?.sections?.timeline)?data.sections.timeline:[];
    const list=section.querySelector('.gchart-list');
    if(!list)return;
    list.innerHTML='';
    if(!events.length){const li=document.createElement('li');li.textContent='Your care timeline will appear as you complete GalviCare steps.';list.appendChild(li);return}
    events.slice(0,12).forEach((item)=>{
      const li=document.createElement('li');
      li.textContent=`${prettyLabel(item?.event_name||item?.event_type)}${item?.occurred_at?` — ${formatDate(item.occurred_at)}`:''}`;
      list.appendChild(li);
    });
  }

  function hardenEvidence(data){
    const section=findSection('Evidence'),ev=data?.sections?.evidence||{};
    if(!section)return;
    replaceKv(section,'Supporting evidence','Evidence supporting the current view',`${Number(ev.supporting_count||0)} signal${Number(ev.supporting_count||0)===1?'':'s'}`);
    replaceKv(section,'Contradictory evidence','Evidence that still needs validation',`${Number(ev.contradictory_count||0)} signal${Number(ev.contradictory_count||0)===1?'':'s'}`);
    const list=section.querySelector('.gchart-list');
    if(list){
      list.innerHTML='';
      const lineage=Array.isArray(ev.lineage)?ev.lineage:[];
      if(!lineage.length){const li=document.createElement('li');li.textContent='No additional evidence relationship is available yet.';list.appendChild(li)}
      else lineage.slice(0,12).forEach((item)=>{const li=document.createElement('li');li.textContent=`${prettyLabel(item?.product)} — ${item?.relationship==='contradicts'?'Needs validation before the current view is treated as settled.':'Supports the current view.'}`;list.appendChild(li)});
    }
    if(!section.querySelector('.gchart-evidence-explainer')){
      const p=document.createElement('p');p.className='gchart-muted gchart-evidence-explainer';
      p.textContent=Number(ev.contradictory_count||0)>0
        ?'GalviCare keeps conflicting evidence visible so you know what still needs to be validated before a hypothesis becomes a settled conclusion.'
        :'The accepted evidence currently shown in this Chart does not contain a recorded contradiction.';
      section.appendChild(p);
    }
  }

  function hardenHistory(data){
    const section=findSection('History'),history=data?.sections?.history||{};
    if(!section)return;
    const active=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')==='Active projection');
    active?.remove();
    if(!section.querySelector('.gchart-history-explainer')){
      const results=Array.isArray(history.result_versions)?history.result_versions:[];
      const intelligence=Array.isArray(history.intelligence_versions)?history.intelligence_versions:[];
      const p=document.createElement('p');p.className='gchart-muted gchart-history-explainer';
      p.textContent=`Your Business Health Record preserves ${results.length} diagnostic update${results.length===1?'':'s'} and ${intelligence.length} governed intelligence update${intelligence.length===1?'':'s'}. Earlier accepted versions remain available in the longitudinal record.`;
      section.insertBefore(p,section.querySelector('.gchart-list'));
    }
    if(history.active_projection_version&&!section.querySelector('.gchart-technical-details')){
      const details=document.createElement('details');details.className='gchart-technical-details';
      const summary=document.createElement('summary');summary.textContent='Record version details';details.appendChild(summary);
      const p=document.createElement('p');p.textContent=`Active projection: ${text(history.active_projection_version)}`;details.appendChild(p);
      section.appendChild(details);
    }
  }

  function hardenChart(){
    hardeningQueued=false;
    const chart=byId('galvichart-day4');
    if(!chart||!chart.classList.contains('active')||!latestChartPayload?.data)return;
    const data=latestChartPayload.data,sections=data.sections||{};
    addStyle();
    const state=chart.querySelector('.gchart-muted');
    if(state&&text(state.textContent).startsWith('Chart state:'))state.textContent=chartStateCopy(data.chart_state);
    addGuidance(chart,data);

    const overview=findSection('Overview'),ov=sections.overview||{};
    replaceKv(overview,'Health status','Business Health status',statusCopy(ov.health_status));
    replaceKv(overview,'Clinical Confidence','How confident is this view?',confidenceCopy(ov.clinical_confidence));
    replaceKv(overview,'Last checkup','Last Business Health check',formatDate(ov.last_checkup));
    replaceKv(overview,'Next action','Recommended next step',nextActionCopy(ov.next_action));
    replaceKv(overview,'Top finding','Highest-priority finding',typeof ov.top_finding==='string'?ov.top_finding:(ov.top_finding?.statement||ov.top_finding?.title||''));

    const health=findSection('Health'),hl=sections.health||{};
    renderDimensions(health,hl.dimensions);
    replaceKv(health,'Clinical Confidence','Clinical Confidence',confidenceCopy(hl.clinical_confidence));

    hardenTimeline(data);

    const care=findSection('Care Plan'),cp=sections.care_plan||{};
    replaceKv(care,'Status','Care Plan status',statusCopy(cp.status));
    if(cp.recommendation)replaceKv(care,'Recommended path','Care objective',text(cp.recommendation?.objective||cp.recommendation));

    hardenEvidence(data);

    const documents=findSection('Documents'),docs=sections.documents||{};
    replaceKv(documents,'Status','Document status',statusCopy(docs.status));

    const clinic=findSection('GalviClinic'),gc=sections.galviclinic||{};
    replaceKv(clinic,'Status','Care access',statusCopy(gc.status));
    if(clinic&&!clinic.querySelector('.gchart-clinic-explainer')){
      const p=document.createElement('p');p.className='gchart-muted gchart-clinic-explainer';p.textContent='GalviClinic connects this record to live Business Physician review when human judgment, treatment selection, accountability, or intervention would help.';clinic.insertBefore(p,clinic.querySelector('a'));
    }

    hardenHistory(data);
    chart.dataset.day4CustomerHardened='1';
    console.info(CHART_SIGNATURE,'rendered',data.chart_state||'unknown');
  }

  function queueHardening(){
    if(hardeningQueued)return;
    hardeningQueued=true;
    queueMicrotask(hardenChart);
  }

  function installFetchInspection(){
    if(window.__galviDay4CustomerHardeningFetchIntercepted)return;
    window.__galviDay4CustomerHardeningFetchIntercepted=true;
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async function(input,init){
      const response=await nativeFetch(input,init);
      try{
        const url=typeof input==='string'?input:input?.url||'';
        if(response.ok&&url.includes('/api/v1/day4/chart')&&!url.includes('/command')){
          const clone=response.clone();
          const payload=await clone.json();
          if(payload?.success!==false){latestChartPayload=payload;queueHardening()}
        }
        if(response.ok&&init?.body){
          const request=JSON.parse(init.body);
          const action=text(request?.action||request?.payload?.action);
          const product=SAVE_ACTION_PRODUCTS[action];
          if(product){
            const clone=response.clone();let payload={};
            try{payload=await clone.json()}catch{payload={}}
            if(payload?.success!==false){
              const answers=request?.payload?.answers||request?.answers||[];
              clearSavedDrafts(product,answers);
            }
          }
        }
      }catch(error){console.warn(SIGNATURE,'response inspection skipped',error)}
      return response;
    };
  }

  function install(){
    installDraftResilience();
    installFetchInspection();
    const observer=new MutationObserver(()=>{restoreAllDrafts();queueHardening()});
    observer.observe(document.body,{subtree:true,childList:true});
    restoreAllDrafts();
    queueHardening();
    window.GalviCareDay4CustomerHardening=Object.freeze({
      persistFollowupDrafts:persistAllDrafts,
      restoreFollowupDrafts:restoreAllDrafts,
      hardenChart,
      signature:SIGNATURE,
      draftSignature:DRAFT_SIGNATURE,
      chartSignature:CHART_SIGNATURE
    });
    console.info(SIGNATURE,'active');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
