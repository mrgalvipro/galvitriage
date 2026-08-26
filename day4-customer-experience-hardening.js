/* GalviCare 1.0 Day 4 customer-experience hardening adapter — QA only.
 * Critical-path purpose:
 * 1) preserve unsaved GalviScore/GalviShot/GalviSight/GalviPath follow-up drafts when
 *    the customer changes tabs/windows, loses focus, or dynamic follow-up UI re-renders;
 * 2) translate the authorized GalviChart projection into novice-founder language while
 *    preserving deterministic facts and accepted governed intelligence;
 * 3) never treat browser drafts as canonical evidence and never call OpenAI/D1 directly.
 *
 * v2 remediation: Chart hardening no longer depends on intercepting the browser's first
 * Chart fetch. The base renderer can auto-open before this script installs, so this adapter
 * observes the rendered Chart and performs a side-effect-free authorized Chart read when
 * needed. That removes the prior timing race while keeping GalviVault as source of truth.
 */
(()=>{
  'use strict';

  const SIGNATURE='GalviCare Day 4 customer experience hardening v1';
  const DRAFT_SIGNATURE='GalviCare Day 4 follow-up draft resilience v1';
  const CHART_SIGNATURE='GalviCare Day 4 customer-safe governed interpretation v1';
  const REMEDIATION_SIGNATURE='GalviCare Day 4 customer continuity remediation v2';
  const DRAFT_STORE='galvicare_followup_drafts_v2';
  const LEGACY_DRAFT_STORE='galvicare_followup_drafts_v1';
  const BRIDGE_STORE='galvicare_day3_customer_bridge_v2';
  const DAY4_BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const FOLLOWUP_HOSTS=Object.freeze({
    'followup-question-container':'GalviScore',
    'galvishot-followup-questions':'GalviShot',
    'galvisight-followup-questions':'GalviSight',
    'galvipath-followup-questions':'GalviPath'
  });
  const SAVE_ACTION_PRODUCTS=Object.freeze({
    save_galviscore_followup:'GalviScore',
    save_galvishot_followup:'GalviShot',
    save_galvisight_followup:'GalviSight',
    save_galvipath_followup:'GalviPath'
  });
  const text=(value)=>String(value??'').trim();
  const byId=(id)=>document.getElementById(id);
  const session=()=>typeof window.getStoredSessionId==='function'
    ?text(window.getStoredSessionId())
    :text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  let chartReadPromise=null;
  let chartQueued=false;
  let latestChartPayload=null;

  function parseJsonStore(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch{return{}}
  }

  function parseDraftStore(){return parseJsonStore(DRAFT_STORE)}
  function writeDraftStore(value){try{localStorage.setItem(DRAFT_STORE,JSON.stringify(value||{}))}catch{}}

  function migrateLegacyStore(){
    const current=parseDraftStore();
    const legacy=parseJsonStore(LEGACY_DRAFT_STORE);
    if(!Object.keys(legacy).length)return;
    const migrated={...current};
    for(const [legacyKey,value] of Object.entries(legacy)){
      const parts=legacyKey.split('::');
      if(parts.length<3)continue;
      const stableQuestion=parts.slice(2).join('::').split('|')[0];
      if(stableQuestion)migrated[[parts[0],parts[1],stableQuestion].join('::')]=value;
    }
    writeDraftStore(migrated);
    try{localStorage.removeItem(LEGACY_DRAFT_STORE)}catch{}
  }

  function productForField(field){
    if(!field||field.tagName!=='TEXTAREA')return '';
    for(const [hostId,product] of Object.entries(FOLLOWUP_HOSTS))if(field.closest?.('#'+hostId))return product;
    return '';
  }

  function questionKey(field){
    return text(field?.dataset?.questionCode||field?.dataset?.questionId||field?.name||field?.id);
  }

  function scopedDraftKey(product,key){
    const sid=session();
    return sid&&product&&key?[sid,product,key].join('::'):'';
  }

  function persistDraft(field){
    const product=productForField(field),key=questionKey(field),scope=scopedDraftKey(product,key);
    if(!scope)return false;
    const drafts=parseDraftStore(),value=String(field.value??'');
    if(value)drafts[scope]={value,updated_at:new Date().toISOString()};else delete drafts[scope];
    writeDraftStore(drafts);return true;
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
    return [...document.querySelectorAll('textarea[data-day7d-authoritative="1"], #followup-question-container textarea, #galvishot-followup-questions textarea, #galvisight-followup-questions textarea, #galvipath-followup-questions textarea')]
      .filter((field)=>{const actual=productForField(field);return actual&&(product?actual===product:true)});
  }
  function persistAllDrafts(){followupFields().forEach(persistDraft)}
  function restoreAllDrafts(){followupFields().forEach(restoreDraft)}

  function submittedQuestionIds(body){
    let request={};try{request=typeof body==='string'?JSON.parse(body):body||{}}catch{return[]}
    const answers=request?.payload?.answers||request?.answers||[];
    return (Array.isArray(answers)?answers:[answers]).map((answer)=>text(answer?.question_id||answer?.question_code)).filter(Boolean);
  }

  function clearSavedDrafts(product,questionIds){
    const sid=session();if(!sid||!product)return;
    const ids=new Set(Array.isArray(questionIds)?questionIds:[]);if(!ids.size)return;
    const drafts=parseDraftStore(),prefix=sid+'::'+product+'::';
    for(const storedKey of Object.keys(drafts))if(storedKey.startsWith(prefix)&&ids.has(storedKey.slice(prefix.length)))delete drafts[storedKey];
    writeDraftStore(drafts);
  }

  function installDraftResilience(){
    document.addEventListener('input',(event)=>{if(productForField(event.target))persistDraft(event.target)},true);
    document.addEventListener('change',(event)=>{if(productForField(event.target))persistDraft(event.target)},true);
    document.addEventListener('focusin',(event)=>{if(productForField(event.target))restoreDraft(event.target)},true);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistAllDrafts();else queueMicrotask(restoreAllDrafts)});
    window.addEventListener('blur',persistAllDrafts);
    window.addEventListener('focus',()=>queueMicrotask(restoreAllDrafts));
    window.addEventListener('pagehide',persistAllDrafts);
    window.addEventListener('pageshow',()=>queueMicrotask(restoreAllDrafts));
    console.info(DRAFT_SIGNATURE,'active');
  }

  function installSaveInspection(){
    if(window.__galviDay4DraftFetchIntercepted)return;
    window.__galviDay4DraftFetchIntercepted=true;
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async function(input,init){
      if(init?.body)persistAllDrafts();
      const response=await nativeFetch(input,init);
      try{
        if(response.ok&&init?.body){
          const request=JSON.parse(init.body),action=text(request?.action||request?.payload?.action),product=SAVE_ACTION_PRODUCTS[action];
          if(product){
            const clone=response.clone();let payload={};try{payload=await clone.json()}catch{payload={}}
            if(payload?.success!==false)clearSavedDrafts(product,submittedQuestionIds(init.body));
          }
        }
      }catch(error){console.warn(SIGNATURE,'save inspection skipped',error)}
      return response;
    };
  }

  function prettyLabel(value){return text(value).replaceAll('_',' ').replace(/\b\w/g,(c)=>c.toUpperCase())}
  function statusCopy(value){
    const key=text(value).toLowerCase();
    return ({
      critical:'Critical — your business is showing material pressure that deserves immediate attention.',
      'at risk':'At Risk — important Business Health pressure is present and should be treated before it compounds.',
      strained:'Strained — the business can keep moving, but unresolved symptoms are limiting healthy execution.',
      stable:'Stable — the business is functioning, with specific areas that still need attention.',
      'stable but watch':'Stable, but watch closely — the business is functioning while important symptoms remain.',
      healthy:'Healthy — the current record shows stronger Business Health signals, with continued monitoring still useful.',
      'healthy/scaling':'Healthy / Scaling — the business shows strong current health and should focus on sustaining what works.',
      recommended_path_available:'Your recommended GalviPath is available.',
      not_yet_available:'Not available yet — complete the next eligible GalviCare step to add this part of your record.',
      available_when_approved:'No approved record documents are available yet.',
      available:'Available now.'
    })[key]||prettyLabel(value);
  }
  function nextActionCopy(value){
    const key=text(value).toLowerCase();
    return ({
      complete_galvishot:'Complete GalviShot so GalviCare can identify the conditions driving your symptoms.',
      complete_galvishot_entitlement:'Complete GalviShot access to activate your GalviChart.',
      obtain_galvisight:'Continue to GalviSight to understand why these symptoms may be happening.',
      obtain_galvipath:'Continue to GalviPath to turn the diagnosis into a sequenced care plan.',
      obtain_galvisight_or_galvipath:'Continue your diagnostic pathway so GalviCare can build the next layer of your care plan.',
      book_galviclinic:'Book GalviClinic when live Business Physician judgment would help confirm treatment, priorities, or next steps.'
    })[key]||prettyLabel(value);
  }
  function chartStateCopy(value){
    return ({
      explorer:'Explorer — your Business Health Record now includes Vitals, GalviScore, and accepted GalviShot findings.',
      sight:'GalviSight added — your record now includes evidence interpretation behind the diagnosis.',
      path:'GalviPath added — your record now includes a personalized Business Health care pathway.',
      clinic:'GalviClinic added — your record now includes authorized Business Physician care context.'
    })[text(value).toLowerCase()]||'Your Business Health Record is active and becomes more complete as your GalviCare journey continues.';
  }
  function confidenceCopy(value){
    const n=Number(value);if(!Number.isFinite(n))return '';
    const pct=n<=1?Math.round(n*100):Math.round(n);
    const meaning=pct<40?'Early evidence — useful, but additional evidence can materially sharpen the diagnosis.'
      :pct<70?'Developing evidence — useful now, while more evidence can improve precision.'
      :pct<90?'Strong evidence — well supported, with remaining uncertainty still worth validating.'
      :'Very strong evidence — highly supported by the evidence currently in your record.';
    return `${pct}% — ${meaning}`;
  }
  function formatDate(value){const raw=text(value);if(!raw)return '';const date=new Date(raw);return Number.isNaN(date.getTime())?raw:date.toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
  function dimensionMeaning(value){const n=Number(value);if(!Number.isFinite(n))return '';if(n<40)return'Critical — a priority constraint.';if(n<55)return'High risk — needs near-term attention.';if(n<70)return'Needs attention — strengthen before it limits growth.';if(n<85)return'Monitor — generally stable with room to improve.';return'Healthy — currently a relative strength.'}

  function findSection(title){const chart=byId('galvichart-day4');if(!chart)return null;return[...chart.querySelectorAll('.gchart-section')].find((node)=>text(node.querySelector('h3')?.textContent)===title)||null}
  function kvNodes(section){return[...(section?.querySelectorAll?.('.gchart-kv')||[])]}
  function replaceKv(section,label,newLabel,value){
    const row=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')===label);if(!row)return false;
    row.innerHTML='';const strong=document.createElement('strong');strong.textContent=newLabel+': ';row.append(strong,document.createTextNode(text(value)));return true;
  }
  function list(node,items,formatter=(item)=>text(item)){
    const values=Array.isArray(items)?items:[];if(!values.length)return;
    const ul=document.createElement('ul');ul.className='gchart-list';values.slice(0,10).forEach((item)=>{const li=document.createElement('li');li.textContent=formatter(item);ul.appendChild(li)});node.appendChild(ul);
  }
  function addStyle(){
    if(byId('day4-customer-hardening-style'))return;
    const style=document.createElement('style');style.id='day4-customer-hardening-style';style.textContent=`
      .gchart-customer-guidance{border:1px solid #b9d5e8;border-left:5px solid #174a73;background:#f6fbff;border-radius:12px;padding:16px;margin:15px 0}
      .gchart-customer-guidance h3{margin:0 0 9px;color:#0f2f47}.gchart-customer-guidance h4{margin:12px 0 5px;color:#174a73}
      .gchart-customer-guidance p{line-height:1.55;margin:7px 0}.gchart-dimensions-friendly{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin:10px 0}
      .gchart-dimension-friendly{border:1px solid #dbe5ee;background:#fff;border-radius:9px;padding:10px;line-height:1.4}.gchart-technical-details{margin-top:10px;color:#64748b;font-size:12px}.gchart-technical-details summary{cursor:pointer;font-weight:700}
    `;document.head.appendChild(style);
  }

  function renderDimensions(section,dimensions){
    if(!section||!dimensions||typeof dimensions!=='object'||Array.isArray(dimensions))return;
    const old=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')==='Dimensions');if(!old)return;
    const grid=document.createElement('div');grid.className='gchart-dimensions-friendly';
    for(const [key,value] of Object.entries(dimensions)){
      const card=document.createElement('div');card.className='gchart-dimension-friendly';const title=document.createElement('strong');title.textContent=prettyLabel(key);card.appendChild(title);
      const score=document.createElement('div');score.textContent=`${Number(value)}/100`;card.appendChild(score);const meaning=document.createElement('div');meaning.className='gchart-muted';meaning.textContent=dimensionMeaning(value);card.appendChild(meaning);grid.appendChild(card);
    }
    old.replaceWith(grid);
  }

  function acceptedGuidance(data){
    const sections=data?.sections||{},intel=sections.customer_intelligence||{},shot=intel.shot||{},sight=intel.sight||{},path=intel.path||{},overview=sections.overview||{};
    const finding=(Array.isArray(shot.findings)?shot.findings[0]:null)||overview.top_finding;
    const statement=typeof finding==='string'?text(finding):text(finding?.statement||finding?.title||finding?.finding_code);
    const why=typeof finding==='object'?text(finding?.reasoning_summary||finding?.why_it_matters):'';
    const next=text(finding?.next_step)||text(path.objective)||nextActionCopy(overview.next_action);
    return {statement,why,sightSummary:text(sight.summary),pathObjective:text(path.objective),next};
  }

  function addGuidance(chart,data){
    if(!chart||chart.querySelector('.gchart-customer-guidance'))return;
    const {statement,why,sightSummary,pathObjective,next}=acceptedGuidance(data);if(!statement&&!why&&!sightSummary&&!pathObjective&&!next)return;
    const card=document.createElement('section');card.className='gchart-customer-guidance';const h=document.createElement('h3');h.textContent='What GalviCare understands right now';card.appendChild(h);
    if(statement){const p=document.createElement('p');p.textContent=statement;card.appendChild(p)}
    if(why){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent='What the evidence suggests: ';p.append(strong,document.createTextNode(why));card.appendChild(p)}
    if(sightSummary){const h4=document.createElement('h4');h4.textContent='Why these symptoms may be happening';card.appendChild(h4);const p=document.createElement('p');p.textContent=sightSummary;card.appendChild(p)}
    if(pathObjective){const h4=document.createElement('h4');h4.textContent='Your care objective';card.appendChild(h4);const p=document.createElement('p');p.textContent=pathObjective;card.appendChild(p)}
    if(next){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent='What to do next: ';p.append(strong,document.createTextNode(next));card.appendChild(p)}
    const note=document.createElement('p');note.className='gchart-muted';note.textContent='This explanation uses your stored deterministic GalviScore and accepted GalviEngine reasoning already saved in GalviVault. Opening GalviChart does not rerun AI or change your clinical record.';card.appendChild(note);
    (chart.querySelector('.gchart-status')||chart.querySelector('h2'))?.insertAdjacentElement('afterend',card);
  }

  function hardenTimeline(data){
    const section=findSection('Timeline'),events=Array.isArray(data?.sections?.timeline)?data.sections.timeline:[],ul=section?.querySelector('.gchart-list');if(!section||!ul)return;
    ul.innerHTML='';if(!events.length){const li=document.createElement('li');li.textContent='Your care timeline will appear as you complete GalviCare steps.';ul.appendChild(li);return}
    events.slice(0,12).forEach((item)=>{const li=document.createElement('li');li.textContent=`${prettyLabel(item?.event_name||item?.event_type)}${item?.occurred_at?` — ${formatDate(item.occurred_at)}`:''}`;ul.appendChild(li)});
  }

  function hardenEvidence(data){
    const section=findSection('Evidence'),ev=data?.sections?.evidence||{},sight=data?.sections?.customer_intelligence?.sight||{};if(!section)return;
    replaceKv(section,'Supporting evidence','Evidence supporting the current view',`${Number(ev.supporting_count||0)} signal${Number(ev.supporting_count||0)===1?'':'s'}`);
    replaceKv(section,'Contradictory evidence','Evidence that still needs validation',`${Number(ev.contradictory_count||0)} signal${Number(ev.contradictory_count||0)===1?'':'s'}`);
    const old=section.querySelector('.gchart-list');if(old)old.remove();
    if(text(sight.summary)){const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent='GalviSight interpretation: ';p.append(strong,document.createTextNode(text(sight.summary)));section.appendChild(p)}
    if(Array.isArray(sight.risks)&&sight.risks.length){const h=document.createElement('h4');h.textContent='Risks to watch';section.appendChild(h);list(section,sight.risks)}
    if(Array.isArray(sight.opportunities)&&sight.opportunities.length){const h=document.createElement('h4');h.textContent='Opportunities to test';section.appendChild(h);list(section,sight.opportunities)}
    const p=document.createElement('p');p.className='gchart-muted';p.textContent=Number(ev.contradictory_count||0)>0?'GalviCare keeps conflicting evidence visible so you know what still needs validation before a hypothesis becomes a settled conclusion.':'The accepted evidence currently shown in this Chart does not contain a recorded contradiction.';section.appendChild(p);
    if(Array.isArray(ev.lineage)&&ev.lineage.length){const details=document.createElement('details');details.className='gchart-technical-details';const summary=document.createElement('summary');summary.textContent='Evidence lineage details';details.appendChild(summary);list(details,ev.lineage,(item)=>`${prettyLabel(item?.product)} — ${item?.relationship==='contradicts'?'needs validation':'supports the current view'}`);section.appendChild(details)}
  }

  function hardenCarePlan(data){
    const section=findSection('Care Plan'),cp=data?.sections?.care_plan||{},path=data?.sections?.customer_intelligence?.path||{};if(!section)return;
    replaceKv(section,'Status','Care Plan status',statusCopy(cp.status));
    const row=kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')==='Recommended path');
    if(row){const objective=text(path.objective||cp.recommendation?.objective||cp.recommendation);replaceKv(section,'Recommended path','Care objective',objective)}
    if(Array.isArray(path.sequence)&&path.sequence.length&&!section.querySelector('[data-day4-path-sequence]')){const wrap=document.createElement('div');wrap.dataset.day4PathSequence='1';const h=document.createElement('h4');h.textContent='What happens next';wrap.appendChild(h);list(wrap,path.sequence);section.appendChild(wrap)}
    if(text(path.cadence)&&!section.querySelector('[data-day4-path-cadence]')){const p=document.createElement('p');p.dataset.day4PathCadence='1';const strong=document.createElement('strong');strong.textContent='Check-in cadence: ';p.append(strong,document.createTextNode(path.cadence));section.appendChild(p)}
    if(text(path.escalation)&&!section.querySelector('[data-day4-path-escalation]')){const p=document.createElement('p');p.dataset.day4PathEscalation='1';const strong=document.createElement('strong');strong.textContent='Escalate when: ';p.append(strong,document.createTextNode(path.escalation));section.appendChild(p)}
  }

  function hardenHistory(data){
    const section=findSection('History'),history=data?.sections?.history||{};if(!section)return;
    kvNodes(section).find((node)=>text(node.querySelector('strong')?.textContent).replace(/:\s*$/,'')==='Active projection')?.remove();
    const old=section.querySelector('.gchart-list');if(old){old.innerHTML='';const entries=[...(history.result_versions||[]),...(history.intelligence_versions||[]),...(history.command_events||[])];entries.slice(0,12).forEach((item)=>{const li=document.createElement('li');li.textContent=item.product?`${item.product} added or updated — ${formatDate(item.created_at)}`:item.type?`${prettyLabel(item.type)} updated — ${formatDate(item.created_at)}`:`${prettyLabel(item.event)} — ${formatDate(item.occurred_at)}`;old.appendChild(li)})}
    if(!section.querySelector('.gchart-history-explainer')){const results=Array.isArray(history.result_versions)?history.result_versions:[],intelligence=Array.isArray(history.intelligence_versions)?history.intelligence_versions:[];const p=document.createElement('p');p.className='gchart-muted gchart-history-explainer';p.textContent=`Your Business Health Record preserves ${results.length} diagnostic update${results.length===1?'':'s'} and ${intelligence.length} governed intelligence update${intelligence.length===1?'':'s'}. New care does not replace the earlier evidence that produced it.`;section.insertBefore(p,section.querySelector('.gchart-list'))}
    if(history.active_projection_version&&!section.querySelector('.gchart-technical-details')){const details=document.createElement('details');details.className='gchart-technical-details';const summary=document.createElement('summary');summary.textContent='Record version details';details.appendChild(summary);const p=document.createElement('p');p.textContent=`Active projection: ${text(history.active_projection_version)}`;details.appendChild(p);section.appendChild(details)}
  }

  function hardenChart(data){
    const chart=byId('galvichart-day4');if(!chart||!chart.classList.contains('active')||!data?.sections)return false;
    addStyle();const state=chart.querySelector('.gchart-muted');if(state&&text(state.textContent).startsWith('Chart state:'))state.textContent=chartStateCopy(data.chart_state);addGuidance(chart,data);
    const overview=findSection('Overview'),ov=data.sections.overview||{};replaceKv(overview,'Health status','Business Health status',statusCopy(ov.health_status));replaceKv(overview,'Clinical Confidence','How confident is this view?',confidenceCopy(ov.clinical_confidence));replaceKv(overview,'Last checkup','Last Business Health check',formatDate(ov.last_checkup));replaceKv(overview,'Next action','Recommended next step',nextActionCopy(ov.next_action));replaceKv(overview,'Top finding','Highest-priority finding',typeof ov.top_finding==='string'?ov.top_finding:(ov.top_finding?.statement||ov.top_finding?.title||''));
    const health=findSection('Health'),hl=data.sections.health||{};renderDimensions(health,hl.dimensions);replaceKv(health,'Clinical Confidence','Clinical Confidence',confidenceCopy(hl.clinical_confidence));hardenTimeline(data);hardenCarePlan(data);hardenEvidence(data);
    const documents=findSection('Documents'),docs=data.sections.documents||{};replaceKv(documents,'Status','Document status',statusCopy(docs.status));
    const clinic=findSection('GalviClinic'),gc=data.sections.galviclinic||{};replaceKv(clinic,'Status','Care access',statusCopy(gc.status));if(clinic&&!clinic.querySelector('.gchart-clinic-explainer')){const p=document.createElement('p');p.className='gchart-muted gchart-clinic-explainer';p.textContent='GalviClinic connects this record to live Business Physician review when human judgment, treatment selection, accountability, or intervention would help.';clinic.insertBefore(p,clinic.querySelector('a'))}
    hardenHistory(data);chart.dataset.day4CustomerHardened='v2';console.info(CHART_SIGNATURE,'rendered',data.chart_state||'unknown');return true;
  }

  async function requestChartProjection(){
    const sid=session(),ref=parseJsonStore(BRIDGE_STORE),contextId=text(ref.context_id);if(!sid||!contextId)return null;
    const response=await fetch(DAY4_BASE+'/api/v1/day4/chart',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json','Cache-Control':'no-cache',[SESSION_HEADER]:sid,'X-Correlation-Id':'day4-hardening-'+crypto.randomUUID()},body:JSON.stringify({context_id:contextId})});
    let payload={};try{payload=await response.json()}catch{return null}
    if(!response.ok||payload?.success===false||payload?.status!=='ok')return null;
    return payload;
  }

  async function ensureChartHardening(){
    chartQueued=false;const chart=byId('galvichart-day4');if(!chart||!chart.classList.contains('active')||chart.querySelector('.gchart-customer-guidance'))return;
    if(latestChartPayload?.data?.sections&&hardenChart(latestChartPayload.data))return;
    if(chartReadPromise)return;
    chartReadPromise=requestChartProjection();
    try{const payload=await chartReadPromise;if(payload?.data){latestChartPayload=payload;hardenChart(payload.data)}}catch(error){console.warn(SIGNATURE,'authorized Chart hardening read skipped',error)}finally{chartReadPromise=null}
  }

  function queueChartHardening(){if(chartQueued)return;chartQueued=true;setTimeout(ensureChartHardening,0)}

  function install(){
    migrateLegacyStore();installDraftResilience();installSaveInspection();
    const observer=new MutationObserver(()=>{restoreAllDrafts();queueChartHardening()});observer.observe(document.body,{subtree:true,childList:true});
    restoreAllDrafts();queueChartHardening();
    window.addEventListener('galvicare:day4-chart-rendered',(event)=>{if(event?.detail?.data){latestChartPayload=event.detail;queueChartHardening()}});
    window.GalviCareDay4CustomerHardening=Object.freeze({persistFollowupDrafts:persistAllDrafts,restoreFollowupDrafts:restoreAllDrafts,hardenChart:()=>latestChartPayload?.data?hardenChart(latestChartPayload.data):false,signature:SIGNATURE,draftSignature:DRAFT_SIGNATURE,chartSignature:CHART_SIGNATURE,remediationSignature:REMEDIATION_SIGNATURE});
    console.info(SIGNATURE,'active');console.info(REMEDIATION_SIGNATURE,'active');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();