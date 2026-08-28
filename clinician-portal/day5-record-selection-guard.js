/* Day 5 critical-path clinician record-selection guard.
 * Prevents a Business Physician from attaching treatment to a same-name QA venture/BMR
 * when Human E2E is continuing from a specific GalviCare customer session.
 * This is UI guardrail only; server authorization and canonical BMR checks remain authoritative.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviVault Day 5 exact customer record selection guard v1';
  const text=value=>String(value??'').trim();
  const exact=value=>/^(?:bmr_[A-Za-z0-9_-]{8,}|gt_[A-Za-z0-9_-]{5,}|gc_[A-Za-z0-9_-]{5,})$/.test(text(value));

  function labelResults(){
    const results=document.getElementById('results');if(!results)return;
    for(const button of results.querySelectorAll('button[data-bmr]')){
      const bmr=text(button.dataset.bmr);if(!bmr||button.dataset.day5ExactLabel==='1')continue;
      button.dataset.day5ExactLabel='1';
      const suffix=document.createElement('small');suffix.className='day5-record-id';suffix.textContent=`Canonical BMR: ${bmr}`;button.append(document.createElement('br'),suffix);
    }
  }

  function install(){
    const form=document.getElementById('search'),input=document.getElementById('query'),results=document.getElementById('results');
    if(!form||!input||!results)return;
    const style=document.createElement('style');style.textContent='.day5-record-id{display:block;margin-top:5px;overflow-wrap:anywhere;color:#475569}.day5-record-warning{border:1px solid #f1c27d;background:#fff8ed;color:#7c4a12;border-radius:8px;padding:10px;margin:10px 0}';document.head.appendChild(style);
    form.addEventListener('submit',event=>{
      const value=text(input.value);
      // During Day 5 active-care Human E2E, a name/venture-only search is not a safe
      // continuation key because QA can contain repeated venture names. Require the
      // exact canonical BMR or GalviCare session used by the customer run.
      if(!exact(value)){
        event.preventDefault();event.stopImmediatePropagation();
        results.innerHTML='<div class="day5-record-warning"><strong>Day 5 exact-record guard:</strong> Continue active care by searching the customer’s exact GalviCare session ID or canonical BMR ID. Do not select a treatment record by founder/venture name alone.</div>';
      }
    },true);
    new MutationObserver(labelResults).observe(results,{childList:true,subtree:true});
    labelResults();
    console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
