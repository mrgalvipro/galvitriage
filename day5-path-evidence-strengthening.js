/* GalviCare 1.0 Day 5 Path evidence-strengthening projection.
 * Critical-path purpose:
 * - never expose internal deterministic confidence-gap keys as customer instructions;
 * - preserve the stored governed GalviPath as canonical truth;
 * - render a bounded customer-safe deterministic fallback on read;
 * - allow the existing user-invoked GalviGuide flow to replace this fallback only
 *   when server-side governed AI returns ai_metadata.used=true.
 *
 * This adapter does not call OpenAI, D1, or any API and performs no canonical write.
 *
 * H19 browser-stability invariant:
 * DOM reconciliation MUST be idempotent. A MutationObserver callback may inspect the
 * projection repeatedly, but it must not rewrite an already-reconciled status node or
 * dataset marker. Rewriting identical innerHTML from inside the observer creates a
 * self-sustaining microtask loop that starves click/input events and makes Human E2E
 * appear frozen even though the page renders and network requests can complete.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 5 Path evidence strengthening projection v1';
  const FALLBACK_VERSION='customer_safe_v1';
  const STATUS_HTML='<strong>Evidence guidance:</strong> These are governed evidence gaps rendered in customer-safe language. Use Prepare with GalviGuide to synthesize customer-specific evidence requests from the approved Business Health record.';
  const GAP_COPY=Object.freeze({
    required_data_completeness:'Provide the missing operating facts needed to validate the current care priority and next decision.',
    evidence_quality:'Provide primary-source evidence that supports the current finding or care priority, such as a report, system record, customer record, or operating artifact.',
    answer_consistency:'Resolve any conflicting or changed answers that could materially affect the current care recommendation.',
    corroboration:'Provide an independent source, observation, or result that corroborates the current finding before the next care decision.',
    context_completeness:'Add the operating context that could materially change how the current evidence should be interpreted or acted on.'
  });
  const text=value=>String(value??'').trim();
  const byId=id=>document.getElementById(id);

  function pathHost(){return byId('galvipath-result-panel')||byId('galvipath-result')}
  function evidenceSection(){
    const host=pathHost();if(!host)return null;
    return [...host.querySelectorAll('.galvipath-detail-section')].find(section=>text(section.querySelector('h3')?.textContent).toLowerCase()==='evidence to strengthen your care plan')||null;
  }
  function installStyle(){
    if(byId('day5-evidence-strengthening-style'))return false;
    const style=document.createElement('style');style.id='day5-evidence-strengthening-style';
    style.textContent='.day5-evidence-strengthening-status{font-size:13px;line-height:1.45;color:#475569;margin-top:8px}.day5-evidence-strengthening-status strong{color:#0f2f47}';
    document.head.appendChild(style);return true;
  }
  function humanize(){
    const section=evidenceSection();if(!section||section.dataset.day5AiEvidence==='1')return false;
    const items=[...section.querySelectorAll('li')];let changed=0;
    for(const item of items){
      const key=text(item.textContent).toLowerCase().replace(/[\s-]+/g,'_');
      const copy=GAP_COPY[key];if(!copy)continue;
      if(item.textContent!==copy)item.textContent=copy;
      if(item.dataset.day5EvidenceGap!==key)item.dataset.day5EvidenceGap=key;
      changed++;
    }
    const hasHumanizedItems=items.some(item=>item.dataset.day5EvidenceGap);
    if(!changed&&!hasHumanizedItems)return false;

    let mutated=changed>0;
    if(installStyle())mutated=true;
    let status=section.querySelector('[data-day5-evidence-strengthening-status]');
    if(!status){
      status=document.createElement('p');
      status.dataset.day5EvidenceStrengtheningStatus='1';
      status.className='day5-evidence-strengthening-status';
      section.appendChild(status);
      mutated=true;
    }
    // Critical: never rewrite identical markup from inside the MutationObserver.
    if(status.innerHTML!==STATUS_HTML){status.innerHTML=STATUS_HTML;mutated=true}
    if(section.dataset.day5EvidenceFallback!==FALLBACK_VERSION){section.dataset.day5EvidenceFallback=FALLBACK_VERSION;mutated=true}
    return mutated;
  }
  function install(){
    humanize();
    let scheduled=false;
    const observer=new MutationObserver(()=>{
      if(scheduled)return;
      scheduled=true;
      queueMicrotask(()=>{scheduled=false;humanize()});
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    window.GalviCareDay5EvidenceStrengthening=Object.freeze({humanize,signature:SIGNATURE,gapKeys:Object.keys(GAP_COPY)});
    console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
