/* GalviCare 1.0 Day 5 governed Path-evidence renderer.
 * Makes the existing GalviPath evidence-strengthening section customer-specific by
 * invoking the server-side bounded GalviGuide route once when a completed Path is visible.
 * OpenAI remains Worker-only. Canonical Path/Score/BHR state is never written or changed.
 */
(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 5 governed Path evidence synthesis v1';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const text=v=>String(v??'').trim();
  const byId=id=>document.getElementById(id);
  let inFlight=false,lastSection=null,lastSession='';
  const session=()=>typeof window.getStoredSessionId==='function'?text(window.getStoredSessionId()):text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  function section(){const host=byId('galvipath-result-panel')||byId('galvipath-result');if(!host)return null;return [...host.querySelectorAll('.galvipath-detail-section')].find(node=>text(node.querySelector('h3')?.textContent).toLowerCase()==='evidence to strengthen your care plan')||null}
  function pathVisible(node){if(!node?.isConnected)return false;for(let c=node;c&&c.nodeType===1;c=c.parentElement){if(c.hidden||c.classList?.contains('hidden'))return false;const s=getComputedStyle(c);if(s.display==='none'||s.visibility==='hidden')return false}return node.getClientRects().length>0}
  async function synthesize(){
    const node=section(),sid=session();if(!node||!pathVisible(node)||!sid||inFlight)return false;
    if(node.dataset.day5AiEvidence==='1')return true;
    if(lastSection===node&&lastSession===sid&&node.dataset.day5AiAttempted==='1')return false;
    lastSection=node;lastSession=sid;node.dataset.day5AiAttempted='1';inFlight=true;
    let status=node.querySelector('[data-day5-path-ai-status]');if(!status){status=document.createElement('p');status.dataset.day5PathAiStatus='1';status.className='day5-path-ai-evidence';node.appendChild(status)}status.textContent='GalviGuide is synthesizing the approved evidence into customer-specific evidence requests…';
    try{
      const response=await fetch(`${BASE}/api/v1/day5/customer/galviguide`,{method:'POST',cache:'no-store',headers:{Accept:'application/json','Content-Type':'application/json','Cache-Control':'no-cache',[SESSION_HEADER]:sid,'X-Correlation-Id':`day5-path-ai-${crypto.randomUUID()}`},body:JSON.stringify({intent:'care_conversation',message:'Synthesize the accepted evidence for my current GalviPath into concrete evidence I should collect to strengthen this care plan and the next Business Physician decision.'})});
      let payload={};try{payload=await response.json()}catch{}
      const data=payload?.data||{};if(!response.ok||payload?.success===false)throw new Error(payload?.error?.message||`GalviGuide evidence synthesis failed (${response.status}).`);
      const items=(Array.isArray(data.next_actions)?data.next_actions:[]).map(text).filter(Boolean).slice(0,5);if(!items.length)throw new Error('GalviGuide did not return evidence actions.');
      let list=node.querySelector('ul,ol');if(!list){list=document.createElement('ul');node.appendChild(list)}list.replaceChildren(...items.map(item=>{const li=document.createElement('li');li.textContent=item;return li}));
      if(data?.ai_metadata?.used===true){node.dataset.day5AiEvidence='1';status.textContent='GalviGuide synthesized these customer-specific evidence requests from the accepted Business Health record.';}
      else{node.dataset.day5AiEvidence='0';status.textContent='Governed evidence guidance is shown using the safe fallback because live AI synthesis was unavailable. The care plan and canonical record were not changed.';}
      return data?.ai_metadata?.used===true;
    }catch(error){status.textContent='Customer-safe evidence guidance remains available. Live GalviGuide synthesis can be retried without changing the care plan.';console.warn(SIGNATURE,error?.message||error);return false}
    finally{inFlight=false}
  }
  function install(){
    const observer=new MutationObserver(()=>{const node=section();if(node&&pathVisible(node))queueMicrotask(()=>synthesize().catch(()=>{}))});observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    setTimeout(()=>synthesize().catch(()=>{}),300);
    window.GalviCareDay5PathAI=Object.freeze({synthesize,signature:SIGNATURE});console.info(SIGNATURE,'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
