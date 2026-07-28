/* Day 7D progressive customer-intelligence browser adapter.
   Single owner of needs_followup -> answer -> regenerate behavior for the
   GalviShot, GalviSight and GalviPath customer journey. */
(function(){
  'use strict';

  const STAGES={
    GalviShot:{host:'galvishot-paywall',followup:'galvishot-followup',questions:'galvishot-followup-questions',submit:'submit-galvishot-followup',status:'galvishot-followup-status',error:'galvishot-paywall-error',save:'save_galvishot_followup',get:'get_or_create_galvishot'},
    GalviSight:{host:'galvisight-handoff',followup:'galvisight-followup',questions:'galvisight-followup-questions',submit:'submit-galvisight-followup',status:'galvisight-followup-status',error:'galvisight-error',save:'save_galvisight_followup',get:'get_or_generate_galvisight'},
    GalviPath:{host:'galvipath-result',followup:'galvipath-followup',questions:'galvipath-followup-questions',submit:'submit-galvipath-followup',status:'galvipath-followup-status',error:'galvipath-error',save:'save_galvipath_followup',get:'get_or_generate_galvipath'}
  };

  function el(id){return document.getElementById(id);}
  function apiEndpoint(){return typeof GALVICARE_API_ENDPOINT!=='undefined'?GALVICARE_API_ENDPOINT:(typeof GALVICARE_INTAKE_ENDPOINT!=='undefined'?`${GALVICARE_INTAKE_ENDPOINT}/api`:'');}
  function session(){return typeof getStoredSessionId==='function'?getStoredSessionId():(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id')||'');}
  async function call(action,payload={}){
    if(typeof callGalviCareApi==='function') return callGalviCareApi({action,session_id:session(),payload});
    const response=await fetch(apiEndpoint(),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,session_id:session(),payload})});
    const body=await response.json();
    if(!response.ok||body?.success===false) throw new Error(body?.detail||body?.message||`GalviCare request failed (${response.status})`);
    return body;
  }

  function ensureStageUi(product){
    const cfg=STAGES[product],host=el(cfg.host);
    if(!host) return null;
    let panel=el(cfg.followup);
    if(!panel){
      panel=document.createElement('div');
      panel.id=cfg.followup;
      panel.className='gshot-followup hidden';
      const anchor=product==='GalviShot'?host.querySelector('.gshot-confidence-row'):host.querySelector('[id$="result-panel"]');
      host.insertBefore(panel,anchor||host.lastChild);
    }
    if(!el(cfg.questions)){
      panel.innerHTML=`<p class="eyebrow">GALVIENGINE CUSTOMER INTELLIGENCE</p><h3>One more detail will make your ${product} more specific to your business.</h3><div id="${cfg.questions}"></div><div class="button-row"><button id="${cfg.submit}" class="primary-btn" type="button">Save Answer & Continue</button></div><p id="${cfg.status}" class="gshot-status-note" aria-live="polite"></p>`;
    }
    return panel;
  }

  function questionsFrom(response){return response?.followup_questions||response?.followups||response?.evaluation?.followup_questions||response?.evaluation?.followups||[];}
  function renderQuestions(product,response){
    const cfg=STAGES[product],panel=ensureStageUi(product),host=el(cfg.questions),questions=questionsFrom(response);
    if(!panel||!host) return false;
    host.innerHTML='';
    questions.slice(0,3).forEach((q,index)=>{
      const wrap=document.createElement('div'); wrap.className='day7d-followup-question';
      const label=document.createElement('label'); label.htmlFor=`${cfg.questions}-${index}`; label.textContent=q.question_text||q.question||'Tell us a little more.';
      const textarea=document.createElement('textarea'); textarea.id=label.htmlFor; textarea.required=true; textarea.dataset.questionCode=q.question_id||q.question_code||''; textarea.dataset.questionText=q.question_text||q.question||''; textarea.dataset.confidenceImpact=String(q.confidence_impact||5);
      wrap.append(label,textarea); host.appendChild(wrap);
    });
    panel.classList.toggle('hidden',questions.length===0);
    return questions.length>0;
  }

  function exposeFollowupStage(product,response){
    const cfg=STAGES[product],host=el(cfg.host);
    if(typeof hideUpstream==='function') hideUpstream();
    if(host){host.classList.remove('hidden');host.style.display='block';}
    el(cfg.error)?.classList.add('hidden');
    if(product==='GalviSight'){
      el('galvisight-result-panel')?.classList.add('hidden');
      el('galvisight-locked')?.classList.add('hidden');
      const state=el('galvisight-state-message'); if(state){state.textContent='Answer the targeted question below so GalviCare can update your GalviSight using your evidence.';state.classList.remove('hidden');}
    }
    if(product==='GalviPath'){
      el('galvipath-result-panel')?.classList.add('hidden');
      el('galvipath-locked')?.classList.add('hidden');
      const state=el('galvipath-state-message'); if(state){state.textContent='Answer the targeted question below so GalviCare can update your GalviPath using your evidence.';state.classList.remove('hidden');}
    }
    renderQuestions(product,response);
    el(cfg.followup)?.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  }

  async function saveAnswers(product){
    const cfg=STAGES[product],fields=Array.from(document.querySelectorAll(`#${cfg.questions} textarea`)),status=el(cfg.status);
    if(!fields.length) return;
    const missing=fields.find(x=>!x.value.trim()); if(missing){missing.focus();return;}
    if(status) status.textContent='Saving your evidence and updating your Founder Health Record…';
    const saved=await call(cfg.save,{answers:fields.map(x=>({question_id:x.dataset.questionCode,question_code:x.dataset.questionCode,question_text:x.dataset.questionText,answer:x.value.trim(),answer_text:x.value.trim(),confidence_impact:Number(x.dataset.confidenceImpact||5)}))});
    const savedStatus=String(saved.status||saved.evaluation?.status||'').toLowerCase();
    if(savedStatus==='needs_followup'){
      renderQuestions(product,saved.evaluation||saved);
      if(status) status.textContent='Evidence saved. One additional targeted answer is needed before GalviCare finalizes this stage.';
      return;
    }

    if(product==='GalviShot'){
      el(cfg.followup)?.classList.add('hidden');
      if(status) status.textContent='Evidence saved. Unlock GalviShot to generate your enriched diagnosis.';
      if(typeof window.showIntegratedGalviShotPaywall==='function') await window.showIntegratedGalviShotPaywall();
      return;
    }

    if(status) status.textContent='Evidence saved. Regenerating your more specific result…';
    const regenerated=await call(cfg.get,{});
    if(String(regenerated.status||'').toLowerCase()==='needs_followup'){
      exposeFollowupStage(product,regenerated);
      if(status) status.textContent='Evidence saved. One additional targeted answer is needed before GalviCare finalizes this stage.';
      return;
    }
    el(cfg.followup)?.classList.add('hidden');
    if(product==='GalviSight'&&typeof window.__galviLegacyShowGalviSight==='function') await window.__galviLegacyShowGalviSight();
    if(product==='GalviPath'&&typeof window.__galviLegacyShowGalviPath==='function') await window.__galviLegacyShowGalviPath();
  }

  function bind(product){
    const cfg=STAGES[product]; ensureStageUi(product);
    const button=el(cfg.submit); if(!button||button.dataset.day7dAuthoritative==='1') return;
    button.dataset.day7dAuthoritative='1';
    button.addEventListener('click',async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      if(button.dataset.day7dSaving==='1') return;
      button.dataset.day7dSaving='1'; button.disabled=true;
      try{await saveAnswers(product);}
      catch(error){const status=el(cfg.status);if(status)status.textContent=error.message||'Unable to save this evidence.';el(cfg.followup)?.classList.remove('hidden');console.error('Day 7D follow-up save failed',product,error);}
      finally{button.dataset.day7dSaving='0';button.disabled=false;}
    },true);
  }

  function installAuthoritativeStageRoutes(){
    if(typeof window.showGalviSight==='function'&&!window.__galviLegacyShowGalviSight){
      window.__galviLegacyShowGalviSight=window.showGalviSight;
      window.showGalviSight=async function(){
        const response=await call(STAGES.GalviSight.get,{});
        if(String(response.status||'').toLowerCase()==='needs_followup') return exposeFollowupStage('GalviSight',response);
        return window.__galviLegacyShowGalviSight();
      };
    }
    if(typeof window.showGalviPath==='function'&&!window.__galviLegacyShowGalviPath){
      window.__galviLegacyShowGalviPath=window.showGalviPath;
      window.showGalviPath=async function(){
        const response=await call(STAGES.GalviPath.get,{});
        if(String(response.status||'').toLowerCase()==='needs_followup') return exposeFollowupStage('GalviPath',response);
        return window.__galviLegacyShowGalviPath();
      };
    }
  }

  function interceptFetch(){
    if(window.__galviDay7DFetchIntercepted) return;
    window.__galviDay7DFetchIntercepted=true;
    const nativeFetch=window.fetch.bind(window);
    window.fetch=async function(input,init){
      const response=await nativeFetch(input,init);
      try{
        const url=typeof input==='string'?input:input?.url||'';
        if(url.includes('/api')&&init?.body){
          const request=JSON.parse(init.body),action=String(request?.action||'');
          const product=action.includes('galvipath')?'GalviPath':action.includes('galvisight')?'GalviSight':action.includes('galvishot')?'GalviShot':null;
          if(product&&STAGES[product].get===action){
            const body=await response.clone().json();
            if(String(body?.status||'').toLowerCase()==='needs_followup') queueMicrotask(()=>exposeFollowupStage(product,body));
          }
        }
      }catch(error){console.warn('Day 7D response inspection skipped',error);}
      return response;
    };
  }

  document.addEventListener('DOMContentLoaded',()=>{
    Object.keys(STAGES).forEach(bind);
    installAuthoritativeStageRoutes();
    interceptFetch();
  });
  window.GalviCareDay7D={renderQuestions,saveAnswers,ensureStageUi,exposeFollowupStage};
})();