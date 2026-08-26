/* GalviCare 1.0 Day 4 single-current governed Sight/Path projection — QA only.
 * Critical-path purpose:
 * 1) preserve the Day 3 clarification/evidence closed loop and Day 4 draft resilience;
 * 2) after a successful Sight/Path evidence-version advance, invalidate only the stale
 *    browser projection so the existing governed bridge re-reads the newest accepted
 *    canonical evidence/result;
 * 3) present exactly one current customer-facing GalviSight/GalviPath view while keeping
 *    deterministic content available as the safe fallback if governed projection fails;
 * 4) keep prior accepted versions in GalviChart History instead of rendering them as
 *    parallel "current" product results;
 * 5) hide provider/model/prompt machinery and internal record vocabulary from the normal
 *    customer surface without changing canonical evidence, lineage, or governed reasoning.
 *
 * Projection-only: no OpenAI call, no D1 call, no identity/entitlement mutation, no
 * canonical write, and no read/clear/rewrite of follow-up draft storage or input fields.
 */
(()=>{
  'use strict';

  const SIGNATURE='GalviCare Day 4 single-current governed product projection v1';
  const PRIMARY='day3-governed-primary';
  const SUPERSEDED='day4-superseded-current';
  const CURRENT_ATTR='data-day4-governed-current';
  const CURRENT_NOTE='Current view — updated using your latest answers. Earlier accepted views remain preserved in GalviChart History.';
  const SUPPORT_LEVEL_COPY=Object.freeze({
    passive_care:'Ongoing monitoring',
    active_care:'Business Physician-guided care',
    human_review:'Business Physician review',
    clinician_review:'Business Physician review',
    self_guided:'Self-guided monitoring'
  });
  const OWNER_COPY=Object.freeze({
    customer:'You',
    founder:'You',
    business_physician:'Your Business Physician',
    clinician:'Your GalviClinician'
  });
  const PRODUCTS=Object.freeze({
    GalviSight:Object.freeze({
      panel:'galvisight-result-panel',
      card:'day3-ai-galvisight',
      failure:'day3-ai-failure-galvisight',
      followup:'galvisight-followup',
      submit:'submit-galvisight-followup',
      save:'save_galvisight_followup'
    }),
    GalviPath:Object.freeze({
      panel:'galvipath-result-panel',
      card:'day3-ai-galvipath',
      failure:'day3-ai-failure-galvipath',
      followup:'galvipath-followup',
      submit:'submit-galvipath-followup',
      save:'save_galvipath_followup'
    })
  });
  const ACTION_PRODUCT=Object.freeze(Object.fromEntries(Object.entries(PRODUCTS).map(([product,cfg])=>[cfg.save,product])));
  const pending=new Set();
  let queued=false;

  const byId=(id)=>document.getElementById(id);
  const text=(value)=>String(value??'').trim();
  const visible=(node)=>{
    if(!node)return false;
    const style=getComputedStyle(node);
    return !node.classList.contains('hidden')&&style.display!=='none'&&style.visibility!=='hidden';
  };
  const firstFinite=(...values)=>{
    for(const value of values){const number=Number(value);if(Number.isFinite(number))return number;}
    return null;
  };
  const humanize=(value)=>text(value).replaceAll('_',' ').replace(/\b\w/g,(c)=>c.toUpperCase());
  const strongLabel=(node)=>text(node?.querySelector?.('strong')?.textContent).replace(/:\s*$/,'');

  function evidenceAdvanced(payload){
    const bumped=payload?.evidence_version_bumped===true||payload?.data?.evidence_version_bumped===true||payload?.evaluation?.evidence_version_bumped===true;
    const after=firstFinite(payload?.evidence_version,payload?.data?.evidence_version,payload?.evaluation?.evidence_version);
    const before=firstFinite(payload?.evidence_version_before,payload?.data?.evidence_version_before,payload?.evaluation?.evidence_version_before);
    return bumped||(after!==null&&before!==null&&after>before);
  }

  function clearSightSuppression(){
    const panel=byId(PRODUCTS.GalviSight.panel);if(!panel)return;
    panel.removeAttribute(CURRENT_ATTR);
    panel.querySelectorAll('.'+SUPERSEDED).forEach((node)=>{node.classList.remove(SUPERSEDED);node.removeAttribute('aria-hidden')});
  }

  function ensureCurrentNote(card){
    if(!card)return;
    let note=card.querySelector('.day4-current-governed-note');
    if(!note){
      note=document.createElement('p');
      note.className='day4-current-governed-note';
      note.setAttribute('aria-live','polite');
      card.appendChild(note);
    }
    note.textContent=CURRENT_NOTE;
  }

  function customerSafeCardCopy(product,card){
    if(!card)return;
    const lead=card.querySelector('.day3-ai-lead');
    if(product==='GalviPath'&&lead){
      lead.textContent='Your 90-day care plan has been updated using the evidence in your Business Health Record, including your latest answers.';
    }
    card.querySelectorAll('.day3-ai-meta').forEach((node)=>node.setAttribute('data-day4-technical-meta','1'));
    ensureCurrentNote(card);
  }

  function rewriteLabeledRow(row,nextLabel,nextValue){
    if(!row||!nextLabel||!text(nextValue))return false;
    const desired=`${nextLabel}: ${text(nextValue)}`;
    if(text(row.textContent)===desired)return false;
    row.innerHTML='';
    const strong=document.createElement('strong');
    strong.textContent=nextLabel+': ';
    row.append(strong,document.createTextNode(text(nextValue)));
    return true;
  }

  function customerizePathOperationalMetadata(panel){
    if(!panel)return false;
    let changed=false;
    const sections=[...panel.querySelectorAll('.galvipath-detail-section')];
    const pathway=sections.find((section)=>[...section.querySelectorAll('p')].some((row)=>['Owner','Recommended support level'].includes(strongLabel(row))));
    if(pathway){
      for(const row of [...pathway.querySelectorAll('p')]){
        const label=strongLabel(row),strong=row.querySelector('strong');
        if(!strong)continue;
        const raw=text(row.textContent).slice(text(strong.textContent).length).trim();
        if(label==='Owner')changed=rewriteLabeledRow(row,'Care owner',OWNER_COPY[text(raw).toLowerCase()]||humanize(raw))||changed;
        if(label==='Recommended support level')changed=rewriteLabeledRow(row,'Recommended level of care',SUPPORT_LEVEL_COPY[text(raw).toLowerCase()]||humanize(raw))||changed;
      }
    }

    const evidenceSection=sections.find((section)=>text(section.querySelector('h3')?.textContent).toLowerCase()==='galvilab samples to collect');
    if(evidenceSection){
      const heading=evidenceSection.querySelector('h3');
      if(heading&&heading.textContent!=='Evidence to Strengthen Your Care Plan'){
        heading.textContent='Evidence to Strengthen Your Care Plan';
        changed=true;
      }
      const rawItems=[...evidenceSection.querySelectorAll('li')].filter((item)=>/^evi_[A-Za-z0-9:._-]+$/i.test(text(item.textContent)));
      if(rawItems.length){
        const count=rawItems.length;
        rawItems.forEach((item)=>item.remove());
        evidenceSection.querySelectorAll('ul,ol').forEach((list)=>{if(!list.querySelector('li'))list.remove()});
        let status=evidenceSection.querySelector('.day4-customer-evidence-status');
        if(!status){
          status=document.createElement('p');
          status.className='day4-customer-evidence-status';
          evidenceSection.appendChild(status);
        }
        status.textContent=`GalviCare has identified ${count} follow-up evidence item${count===1?'':'s'} that can strengthen this care plan. You will receive each request in plain language when it is useful for the next care decision.`;
        changed=true;
      }
    }
    return changed;
  }

  function sightGovernedComplete(cfg,panel,card){
    return Boolean(panel&&card&&!byId(cfg.failure)&&text(card.textContent));
  }

  function pathGovernedComplete(cfg,panel){
    return Boolean(panel&&!byId(cfg.failure)&&panel.querySelector('.galvipath-detail-section.'+PRIMARY));
  }

  function enforceSingleSightCurrent(){
    const cfg=PRODUCTS.GalviSight,panel=byId(cfg.panel),card=byId(cfg.card);
    if(!sightGovernedComplete(cfg,panel,card)){
      clearSightSuppression();
      return false;
    }
    customerSafeCardCopy('GalviSight',card);
    panel.setAttribute(CURRENT_ATTR,'1');
    for(const child of [...panel.children]){
      const keep=child===card||child.classList.contains('button-row')||child.classList.contains('persistent-galviscore')||Boolean(child.querySelector?.('button, a[href], .cta-link'));
      if(keep){
        child.classList.remove(SUPERSEDED);child.removeAttribute('aria-hidden');
      }else{
        child.classList.add(SUPERSEDED);child.setAttribute('aria-hidden','true');
      }
    }
    return true;
  }

  function enforceSinglePathCurrent(){
    const cfg=PRODUCTS.GalviPath,panel=byId(cfg.panel),card=byId(cfg.card);
    if(!pathGovernedComplete(cfg,panel))return false;
    // GalviPath's governed bridge already rewrites the detailed 90-day sequence and
    // evidence-to-collect sections in place. The extra governed summary card is therefore
    // redundant and is removed so the customer sees one integrated current care plan.
    card?.remove();
    customerizePathOperationalMetadata(panel);
    panel.setAttribute(CURRENT_ATTR,'1');
    let note=panel.querySelector('.day4-current-path-note');
    if(!note){
      note=document.createElement('p');
      note.className='day4-current-path-note';
      panel.insertBefore(note,panel.firstChild);
    }
    note.textContent=CURRENT_NOTE;
    return true;
  }

  function readyToInvalidate(product,cfg){
    if(!pending.has(product))return false;
    const followup=byId(cfg.followup),submit=byId(cfg.submit),panel=byId(cfg.panel);
    if(followup&&visible(followup))return false;
    if(submit&&(submit.disabled||submit.getAttribute('aria-busy')==='true'))return false;
    return Boolean(panel&&visible(panel));
  }

  function invalidateStaleProjection(product,cfg){
    if(!readyToInvalidate(product,cfg))return false;
    // DOM-only cache invalidation. Removing the previous governed marker makes the
    // already-installed Day 3 bridge re-read the current canonical BHR evidence.
    byId(cfg.card)?.remove();
    byId(cfg.failure)?.remove();
    const panel=byId(cfg.panel);
    if(panel){
      panel.removeAttribute('data-day3-governed-generation');
      panel.removeAttribute(CURRENT_ATTR);
      panel.querySelectorAll('.'+PRIMARY).forEach((node)=>{
        node.classList.remove(PRIMARY);
        node.removeAttribute('data-day3-governed-generation');
      });
      panel.querySelector('.day4-current-path-note')?.remove();
    }
    if(product==='GalviSight')clearSightSuppression();
    pending.delete(product);
    console.info(SIGNATURE,product,'stale current projection invalidated after evidence-version advance');
    return true;
  }

  function reconcile(){
    for(const [product,cfg] of Object.entries(PRODUCTS))invalidateStaleProjection(product,cfg);
    enforceSingleSightCurrent();
    enforceSinglePathCurrent();
  }

  function queueReconcile(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      queued=false;
      reconcile();
    }));
  }

  function installSaveInvalidation(){
    if(window.__galviDay4SingleCurrentFetchIntercepted)return;
    window.__galviDay4SingleCurrentFetchIntercepted=true;
    const priorFetch=window.fetch.bind(window);
    window.fetch=async function(input,init){
      const response=await priorFetch(input,init);
      try{
        if(response.ok&&typeof init?.body==='string'){
          const request=JSON.parse(init.body),action=text(request?.action||request?.payload?.action),product=ACTION_PRODUCT[action];
          if(product){
            const payload=await response.clone().json();
            if(payload?.success!==false&&evidenceAdvanced(payload)){
              pending.add(product);
              queueReconcile();
            }
          }
        }
      }catch(error){console.warn(SIGNATURE,'save-response inspection skipped',error)}
      return response;
    };
  }

  function addStyle(){
    if(byId('day4-single-current-product-style'))return;
    const style=document.createElement('style');
    style.id='day4-single-current-product-style';
    style.textContent=`
      #galvisight-result-panel[${CURRENT_ATTR}="1"] > .${SUPERSEDED}{display:none!important}
      .day4-current-governed-note,.day4-current-path-note{margin:12px 0;padding:10px 12px;border:1px solid #dbe5ee;border-radius:9px;background:#f8fafc;color:#475569;font-size:12px;line-height:1.45}
      .day4-customer-evidence-status{margin:8px 0;line-height:1.5;color:#334155}
      [data-day4-technical-meta="1"]{display:none!important}
      body.qa-debug-enabled [data-day4-technical-meta="1"]{display:block!important}
    `;
    document.head.appendChild(style);
  }

  function initialize(){
    addStyle();
    installSaveInvalidation();
    reconcile();
    const observer=new MutationObserver(()=>queueReconcile());
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','aria-busy','disabled']});
    for(const event of ['pageshow','focus','hashchange','popstate'])window.addEventListener(event,queueReconcile);
    console.info(SIGNATURE,'active');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else queueMicrotask(initialize);

  window.GalviCareDay4SingleCurrent={reconcile,queueReconcile,evidenceAdvanced,customerizePathOperationalMetadata,signature:SIGNATURE};
})();
