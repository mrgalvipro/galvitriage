/* GalviCare 1.0 Day 4 GalviChart customer projection adapter.
 * Critical-path purpose:
 * - GalviShot server-verified entitlement/result activates Explorer GalviChart.
 * - Chart is a read-only browser projection of canonical GalviVault state.
 * - Browser never unlocks from URL/localStorage and never calls OpenAI/D1 directly.
 * - Day 3 clarification/evidence/governed intelligence remains upstream and intact.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 4 GalviChart customer projection v1';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const STORE='galvicare_day3_customer_bridge_v2';
  const OPEN_STORE='galvicare_day4_chart_open_v1';
  const q=(selector)=>document.querySelector(selector);
  const byId=(id)=>document.getElementById(id);
  const text=(value)=>String(value??'').trim();
  const session=()=>typeof window.getStoredSessionId==='function'?text(window.getStoredSessionId()):text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  const bridge=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return{}}};
  const score=()=>{try{return typeof window.getCachedGalviScoreResult==='function'?(window.getCachedGalviScoreResult()||{}):JSON.parse(localStorage.getItem('galviscore_last_result')||'{}')}catch{return{}}};

  async function api(path,{body,key}={}){
    const sid=session();
    const headers={
      'Accept':'application/json',
      'Cache-Control':'no-cache',
      'Content-Type':'application/json',
      'X-Correlation-Id':'day4-browser-'+crypto.randomUUID()
    };
    if(sid)headers[SESSION_HEADER]=sid;
    if(key)headers['Idempotency-Key']=key;
    const response=await fetch(BASE+path,{method:'POST',headers,body:JSON.stringify(body||{})});
    let payload={};
    try{payload=await response.json()}catch{payload={success:false,error:{code:'NON_JSON',message:'Non-JSON GalviChart response'}}}
    if(!response.ok||payload?.success===false){
      const error=new Error(payload?.error?.message||payload?.message||('GalviChart request failed ('+response.status+')'));
      error.code=payload?.error?.code||'GV_DAY4_BROWSER_REQUEST_FAILED';
      error.status=response.status;
      error.payload=payload;
      throw error;
    }
    return payload;
  }

  async function context(){
    const current=bridge();
    if(current?.context_id&&current?.bmr_id)return current;
    const sid=session();
    if(!sid)throw Object.assign(new Error('Your GalviCare session is required to open GalviChart.'),{code:'GV_DAY4_SESSION_REQUIRED'});
    const legacy=score();
    const response=await api('/api/v1/day3/customer-bootstrap',{body:{
      legacy_session_id:sid,
      visible_score:legacy?.galviscore_score??legacy?.score,
      visible_confidence:legacy?.galviscore_confidence??legacy?.confidence??null,
      classification:legacy?.galviscore_classification||legacy?.classification||''
    }});
    const data=response?.data||{};
    if(!data.context_id||!data.bmr_id)throw Object.assign(new Error('Canonical Business Health Record is not available for GalviChart.'),{code:'GV_DAY4_CONTEXT_MISSING'});
    const next={...current,legacy_session_id:sid,session_id:sid,context_id:data.context_id,principal_id:data.principal_id,bmr_id:data.bmr_id,venture_id:data.venture_id,record_mode:data.record_mode};
    localStorage.setItem(STORE,JSON.stringify(next));
    return next;
  }

  function installStyle(){
    if(byId('day4-galvichart-style'))return;
    const style=document.createElement('style');
    style.id='day4-galvichart-style';
    style.textContent=`
      #galvichart-day4{display:none;background:#fff;padding:26px;border-radius:14px;box-shadow:0 1px 8px rgba(0,0,0,.08);margin:20px 0}
      #galvichart-day4.active{display:block}
      .gchart-eyebrow{letter-spacing:.12em;text-transform:uppercase;font-weight:800;color:#174a73;font-size:12px;margin:0 0 7px}
      .gchart-status{padding:11px 13px;border:1px solid #dbe5ee;background:#f8fbff;border-radius:10px;color:#334155;margin:12px 0;line-height:1.45}
      .gchart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:13px;margin-top:16px}
      .gchart-section{border:1px solid #dbe5ee;border-radius:12px;padding:15px;background:#fbfdff;min-width:0}
      .gchart-section h3{margin:0 0 9px;color:#0f2f47;font-size:17px}
      .gchart-kv{margin:7px 0;line-height:1.45;overflow-wrap:anywhere}
      .gchart-list{padding-left:20px;margin:8px 0;line-height:1.5}
      .gchart-muted{color:#64748b;font-size:13px}
      .gchart-error{border:1px solid #f0c7c7;background:#fff7f7;color:#7f1d1d;border-radius:10px;padding:12px;margin:12px 0}
      .gchart-locked{border:1px solid #f0d8ad;background:#fff8ed;color:#7c4a12;border-radius:10px;padding:12px;margin:12px 0}
      @media(max-width:640px){#galvichart-day4{padding:18px 14px}.gchart-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function addText(parent,tag,value,className){
    const node=document.createElement(tag);
    if(className)node.className=className;
    node.textContent=text(value);
    parent.appendChild(node);
    return node;
  }

  function section(host,title){
    const node=document.createElement('section');
    node.className='gchart-section';
    addText(node,'h3',title);
    host.appendChild(node);
    return node;
  }

  function kv(node,label,value){
    if(value===undefined||value===null||value==='')return;
    const p=document.createElement('p');p.className='gchart-kv';
    const strong=document.createElement('strong');strong.textContent=label+': ';
    p.appendChild(strong);p.appendChild(document.createTextNode(typeof value==='object'?JSON.stringify(value):String(value)));
    node.appendChild(p);
  }

  function list(node,items,formatter=(item)=>String(item)){
    const values=Array.isArray(items)?items:[];
    if(!values.length){addText(node,'p','No additional record entries are available yet.','gchart-muted');return}
    const ul=document.createElement('ul');ul.className='gchart-list';
    values.slice(0,12).forEach((item)=>{const li=document.createElement('li');li.textContent=formatter(item);ul.appendChild(li)});
    node.appendChild(ul);
  }

  function host(){
    installStyle();
    let node=byId('galvichart-day4');
    if(node)return node;
    node=document.createElement('section');
    node.id='galvichart-day4';
    node.setAttribute('aria-live','polite');
    const wrap=q('.wrap')||document.body;
    wrap.appendChild(node);
    return node;
  }

  function renderLocked(payload){
    const node=host();node.innerHTML='';node.classList.add('active');
    addText(node,'div','GALVICHART™ | BUSINESS HEALTH RECORD','gchart-eyebrow');
    addText(node,'h2','Your GalviChart is not activated yet');
    addText(node,'div','GalviChart Explorer activates only after GalviShot entitlement and an accepted GalviShot result are verified by the server.','gchart-locked');
    const next=payload?.data?.next_action;
    if(next)addText(node,'p','Next step: '+next,'gchart-muted');
    node.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderChart(payload){
    const data=payload?.data||{},sections=data.sections||{},node=host();
    node.innerHTML='';node.classList.add('active');
    addText(node,'div','GALVICHART™ | BUSINESS HEALTH RECORD','gchart-eyebrow');
    addText(node,'h2','Your Business Health Record');
    addText(node,'p','A secure, progressively complete view of the same GalviVault record that supports your GalviCare journey.','gchart-status');
    addText(node,'p',`Chart state: ${text(data.chart_state)||'Explorer'} • Projection ${text(data.projection_version).slice(0,12)}`,'gchart-muted');

    const grid=document.createElement('div');grid.className='gchart-grid';node.appendChild(grid);

    const overview=section(grid,'Overview'),ov=sections.overview||{};
    kv(overview,'Current GalviScore',ov.current_score);
    kv(overview,'Health status',ov.health_status);
    kv(overview,'Clinical Confidence',ov.clinical_confidence);
    kv(overview,'Last checkup',ov.last_checkup);
    kv(overview,'Next action',ov.next_action);
    if(ov.top_finding)kv(overview,'Top finding',ov.top_finding?.statement||ov.top_finding?.title||ov.top_finding);

    const health=section(grid,'Health'),hl=sections.health||{};
    kv(health,'Dimensions',hl.dimensions);
    kv(health,'Clinical Confidence',hl.clinical_confidence);
    list(health,hl.findings,(item)=>text(item?.statement||item?.title||item?.finding_code||item));

    const timeline=section(grid,'Timeline');
    list(timeline,sections.timeline,(item)=>`${text(item?.event_name||item?.event_type)}${item?.version?` v${item.version}`:''} — ${text(item?.occurred_at)}`);

    const care=section(grid,'Care Plan'),cp=sections.care_plan||{};
    kv(care,'Status',cp.status);
    if(cp.recommendation)kv(care,'Recommended path',cp.recommendation?.objective||cp.recommendation);

    const evidence=section(grid,'Evidence'),ev=sections.evidence||{};
    kv(evidence,'Supporting evidence',ev.supporting_count);
    kv(evidence,'Contradictory evidence',ev.contradictory_count);
    list(evidence,ev.lineage,(item)=>`${text(item?.product)} • ${text(item?.relationship)} • ${text(item?.evidence_id)}`);

    const documents=section(grid,'Documents'),docs=sections.documents||{};
    kv(documents,'Status',docs.status);
    list(documents,docs.items,(item)=>text(item?.title||item?.name||item));

    const clinic=section(grid,'GalviClinic'),gc=sections.galviclinic||{};
    kv(clinic,'Status',gc.status);
    if(gc.booking_url){
      const a=document.createElement('a');a.href=gc.booking_url;a.target='_blank';a.rel='noopener';a.className='cta-link';a.textContent='Book GalviClinic™';clinic.appendChild(a);
    }

    const history=section(grid,'History'),hs=sections.history||{};
    kv(history,'Active projection',hs.active_projection_version?text(hs.active_projection_version).slice(0,16):null);
    list(history,[...(hs.result_versions||[]),...(hs.intelligence_versions||[]),...(hs.command_events||[])],(item)=>{
      if(item.product)return `${item.product} v${item.version||1} — ${text(item.created_at)}`;
      if(item.type)return `${item.type} v${item.version||1} — ${text(item.created_at)}`;
      return `${text(item.event)} — ${text(item.occurred_at)}`;
    });

    localStorage.setItem(OPEN_STORE,'1');
    node.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function renderError(error){
    const node=host();node.innerHTML='';node.classList.add('active');
    addText(node,'div','GALVICHART™ | BUSINESS HEALTH RECORD','gchart-eyebrow');
    addText(node,'h2','GalviChart could not be opened');
    addText(node,'div',`${text(error?.code||'GV_DAY4_ERROR')} ${text(error?.message||error)}`,'gchart-error');
  }

  async function openChart(){
    const buttonTargets=document.querySelectorAll('[data-day4-chart-button]');
    buttonTargets.forEach((button)=>{button.disabled=true;button.textContent='Opening GalviChart…'});
    try{
      const ref=await context();
      const payload=await api('/api/v1/day4/chart',{body:{context_id:ref.context_id}});
      if(payload?.status==='locked')renderLocked(payload);else renderChart(payload);
    }catch(error){renderError(error)}
    finally{buttonTargets.forEach((button)=>{button.disabled=false;button.textContent='View GalviChart™'})}
  }

  function addButton(container){
    if(!container||container.querySelector('[data-day4-chart-button]'))return;
    const button=document.createElement('button');
    button.type='button';button.className='secondary-button';button.dataset.day4ChartButton='true';button.textContent='View GalviChart™';
    button.addEventListener('click',openChart);
    container.appendChild(button);
  }

  function install(){
    installStyle();
    const shot=byId('galvishot-result');
    const path=byId('galvipath-result')||byId('galvipath-result-panel');
    addButton(shot?.querySelector('.button-row')||shot);
    addButton(path?.querySelector('.button-row')||path);
    const observer=new MutationObserver(()=>{
      const s=byId('galvishot-result'),p=byId('galvipath-result')||byId('galvipath-result-panel');
      addButton(s?.querySelector('.button-row')||s);addButton(p?.querySelector('.button-row')||p);
    });
    observer.observe(document.body,{subtree:true,childList:true});
    window.GalviChartDay4=Object.freeze({open:openChart,signature:SIGNATURE});
    if(localStorage.getItem(OPEN_STORE)==='1'&&session())openChart().catch(()=>{});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();