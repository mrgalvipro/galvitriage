/* Day 7D progressive customer-intelligence browser adapter.
   Authoritative owner of needs_followup -> answer/skip -> regenerate -> advance for
   GalviShot, GalviSight and GalviPath, including Stripe paid-return recovery. */
(function(){
  'use strict';

  const STAGES={
    GalviShot:{host:'galvishot-paywall',followup:'galvishot-followup',questions:'galvishot-followup-questions',submit:'submit-galvishot-followup',skip:'skip-galvishot-followup',status:'galvishot-followup-status',error:'galvishot-paywall-error',save:'save_galvishot_followup',get:'get_or_create_galvishot'},
    GalviSight:{host:'galvisight-handoff',followup:'galvisight-followup',questions:'galvisight-followup-questions',submit:'submit-galvisight-followup',skip:'skip-galvisight-followup',status:'galvisight-followup-status',error:'galvisight-error',save:'save_galvisight_followup',get:'get_or_generate_galvisight'},
    GalviPath:{host:'galvipath-result',followup:'galvipath-followup',questions:'galvipath-followup-questions',submit:'submit-galvipath-followup',skip:'skip-galvipath-followup',status:'galvipath-followup-status',error:'galvipath-error',save:'save_galvipath_followup',get:'get_or_generate_galvipath'}
  };
  const MAX_VISIBLE_TARGETED_QUESTIONS=3;
  const SKIPPED_ANSWER='Skipped for now — no additional evidence supplied.';
  const queues={GalviShot:[],GalviSight:[],GalviPath:[]};

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
      panel=document.createElement('div'); panel.id=cfg.followup; panel.className='gshot-followup hidden';
      const anchor=product==='GalviShot'?host.querySelector('.gshot-confidence-row'):host.querySelector('[id$="result-panel"]');
      host.insertBefore(panel,anchor||host.lastChild);
    }
    if(!el(cfg.questions)) panel.innerHTML=`<p class="eyebrow">GALVIENGINE CUSTOMER INTELLIGENCE</p><h3>A few details will help sharpen your ${product} result.</h3><div id="${cfg.questions}"></div><div class="button-row"><button id="${cfg.submit}" class="primary-btn" type="button">Save Answer & Continue</button><button id="${cfg.skip}" class="secondary-button" type="button">Skip for Now</button></div><p id="${cfg.status}" class="gshot-status-note" aria-live="polite"></p>`;
    else if(!el(cfg.skip)){
      const row=el(cfg.submit)?.closest('.button-row');
      if(row){const skip=document.createElement('button');skip.id=cfg.skip;skip.className='secondary-button';skip.type='button';skip.textContent='Skip for Now';row.appendChild(skip);}
    }
    return panel;
  }

  function questionsFrom(response){return response?.followup_questions||response?.followups||response?.evaluation?.followup_questions||response?.evaluation?.followups||[];}
  function renderCurrentQuestion(product){
    const cfg=STAGES[product],panel=ensureStageUi(product),host=el(cfg.questions),q=queues[product][0];
    if(!panel||!host) return false;
    host.innerHTML='';
    if(!q){panel.classList.add('hidden');return false;}
    const wrap=document.createElement('div'); wrap.className='day7d-followup-question';
    const label=document.createElement('label'); label.htmlFor=`${cfg.questions}-0`; label.textContent=q.question_text||q.question||'Tell us a little more.';
    const textarea=document.createElement('textarea'); textarea.id=label.htmlFor; textarea.required=true; textarea.dataset.questionCode=q.question_id||q.question_code||''; textarea.dataset.questionText=q.question_text||q.question||''; textarea.dataset.confidenceImpact=String(q.confidence_impact||5);
    wrap.append(label,textarea); host.appendChild(wrap);
    panel.classList.remove('hidden');
    const status=el(cfg.status); if(status) status.textContent=`Question 1 of ${queues[product].length} remaining.`;
    return true;
  }
  function renderQuestions(product,response){
    queues[product]=questionsFrom(response).slice(0,MAX_VISIBLE_TARGETED_QUESTIONS);
    return renderCurrentQuestion(product);
  }

  function exposeFollowupStage(product,response){
    const cfg=STAGES[product],host=el(cfg.host);
    if(typeof hideUpstream==='function') hideUpstream();
    if(host){host.classList.remove('hidden');host.style.display='block';}
    el(cfg.error)?.classList.add('hidden');
    if(product==='GalviSight'){
      el('galvisight-result-panel')?.classList.add('hidden'); el('galvisight-locked')?.classList.add('hidden');
      const state=el('galvisight-state-message'); if(state){state.textContent='Answer or skip the targeted questions below so GalviCare can generate your enriched GalviSight prescription.';state.classList.remove('hidden');}
    }
    if(product==='GalviPath'){
      el('galvipath-result-panel')?.classList.add('hidden'); el('galvipath-locked')?.classList.add('hidden');
      const state=el('galvipath-state-message'); if(state){state.textContent='Answer or skip the targeted questions below so GalviCare can generate your enriched 90-day GalviPath treatment plan.';state.classList.remove('hidden');}
    }
    renderQuestions(product,response);
    el(cfg.followup)?.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  }

  async function invokeLegacyWithResponse(action,response,legacyRenderer,options={}){
    if(typeof legacyRenderer!=='function') return false;
    const original=window.callGalviCareApi; let consumed=false;
    window.callGalviCareApi=async function(request){
      if(!consumed&&String(request?.action||'')===action){consumed=true;return response;}
      if(typeof original==='function') return original(request);
      throw new Error(`Unexpected GalviCare request while rendering ${action}.`);
    };
    try{return await legacyRenderer(options);}finally{window.callGalviCareApi=original;}
  }

  async function renderReadyStage(product,response){
    if(product==='GalviShot'){
      if(response?.result&&typeof window.GalviCareDay7DRenderShotResult==='function') return window.GalviCareDay7DRenderShotResult(response.result);
      if(typeof window.__galviLegacyShowGalviShotResult==='function') return invokeLegacyWithResponse(STAGES.GalviShot.get,response,window.__galviLegacyShowGalviShotResult);
    }
    if(product==='GalviSight'&&typeof window.__galviLegacyShowGalviSight==='function') return invokeLegacyWithResponse(STAGES.GalviSight.get,response,window.__galviLegacyShowGalviSight);
    if(product==='GalviPath'&&typeof window.__galviLegacyShowGalviPath==='function') return invokeLegacyWithResponse(STAGES.GalviPath.get,response,window.__galviLegacyShowGalviPath);
    return false;
  }

  async function completeCurrentQuestion(product,skip=false){
    const cfg=STAGES[product],field=el(cfg.questions)?.querySelector('textarea'),status=el(cfg.status),q=queues[product][0];
    if(!q||!field) return;
    const answer=skip?SKIPPED_ANSWER:field.value.trim();
    if(!answer){field.focus();return;}
    if(status) status.textContent=skip?'Recording this question as skipped and checking the remaining approved questions…':'Saving your evidence and updating your Founder Health Record…';
    const saved=await call(cfg.save,{answers:[{question_id:field.dataset.questionCode,question_code:field.dataset.questionCode,question_text:field.dataset.questionText,answer,answer_text:answer,skipped:skip,confidence_impact:skip?0:Number(field.dataset.confidenceImpact||5)}]});
    const savedStatus=String(saved.status||saved.evaluation?.status||'').toLowerCase();
    if(savedStatus==='validation_error'||savedStatus==='unexpected_error'||saved.success===false) throw new Error(saved.detail||saved.message||'Unable to save this follow-up state.');
    if(savedStatus==='needs_followup'){
      renderQuestions(product,saved.evaluation||saved);
      if(status) status.textContent=skip?'Question skipped. Continue with the next approved question.':'Evidence saved. Continue with the next approved question.';
      return true;
    }
    queues[product]=[];
    if(status) status.textContent=skip?'All required questions are complete or skipped. Rendering the result from evidence collected so far…':'Evidence saved. Rendering your enriched result…';
    const regenerated=(saved.result||saved.data)?saved:await call(cfg.get,{});
    if(String(regenerated.status||'').toLowerCase()==='needs_followup'){
      exposeFollowupStage(product,regenerated);
      return true;
    }
    el(cfg.followup)?.classList.add('hidden');
    const rendered=await renderReadyStage(product,regenerated);
    if(rendered===false) throw new Error(`${product} was generated but its result renderer did not complete.`);
    return true;
  }

  async function saveAnswers(product){return completeCurrentQuestion(product,false);}
  async function skipCurrentQuestion(product){return completeCurrentQuestion(product,true);}

  function bind(product){
    const cfg=STAGES[product]; ensureStageUi(product);
    const submit=el(cfg.submit),skip=el(cfg.skip);
    if(submit&&submit.dataset.day7dAuthoritative!=='1'){
      submit.dataset.day7dAuthoritative='1';
      submit.addEventListener('click',async event=>{
        event.preventDefault();event.stopImmediatePropagation();
        if(submit.dataset.day7dSaving==='1')return;
        submit.dataset.day7dSaving='1';submit.disabled=true;if(skip)skip.disabled=true;
        try{await saveAnswers(product);}catch(error){const status=el(cfg.status);if(status)status.textContent=error.message||'Unable to save this evidence.';el(cfg.followup)?.classList.remove('hidden');console.error('Day 7D follow-up save failed',product,error);}finally{submit.dataset.day7dSaving='0';submit.disabled=false;if(skip)skip.disabled=false;}
      },true);
    }
    if(skip&&skip.dataset.day7dAuthoritative!=='1'){
      skip.dataset.day7dAuthoritative='1';
      skip.addEventListener('click',async event=>{
        event.preventDefault();event.stopImmediatePropagation();
        if(skip.dataset.day7dSaving==='1')return;
        skip.dataset.day7dSaving='1';skip.disabled=true;if(submit)submit.disabled=true;
        try{await skipCurrentQuestion(product);}catch(error){const status=el(cfg.status);if(status)status.textContent=error.message||'Unable to skip this question safely.';el(cfg.followup)?.classList.remove('hidden');console.error('Day 7D follow-up skip failed',product,error);}finally{skip.dataset.day7dSaving='0';skip.disabled=false;if(submit)submit.disabled=false;}
      },true);
    }
  }

  function installAuthoritativeStageRoutes(){
    if(typeof window.showIntegratedGalviShotResult==='function'&&!window.__galviLegacyShowGalviShotResult){
      window.__galviLegacyShowGalviShotResult=window.showIntegratedGalviShotResult;
      window.showIntegratedGalviShotResult=async function(options={}){const response=await call(STAGES.GalviShot.get,{});if(String(response.status||'').toLowerCase()==='needs_followup'){exposeFollowupStage('GalviShot',response);const status=el(STAGES.GalviShot.status);if(status)status.textContent=options?.paidReturn?'Payment verified. Complete or skip the targeted questions shown to generate your enriched GalviShot diagnosis.':'Complete or skip the targeted questions shown to generate your enriched GalviShot diagnosis.';return true;}return renderReadyStage('GalviShot',response);};
    }
    if(typeof window.showGalviSight==='function'&&!window.__galviLegacyShowGalviSight){window.__galviLegacyShowGalviSight=window.showGalviSight;window.showGalviSight=async function(){const response=await call(STAGES.GalviSight.get,{});if(String(response.status||'').toLowerCase()==='needs_followup')return exposeFollowupStage('GalviSight',response);return renderReadyStage('GalviSight',response);};}
    if(typeof window.showGalviPath==='function'&&!window.__galviLegacyShowGalviPath){window.__galviLegacyShowGalviPath=window.showGalviPath;window.showGalviPath=async function(){const response=await call(STAGES.GalviPath.get,{});if(String(response.status||'').toLowerCase()==='needs_followup')return exposeFollowupStage('GalviPath',response);return renderReadyStage('GalviPath',response);};}
  }

  function interceptFetch(){
    if(window.__galviDay7DFetchIntercepted)return;
    window.__galviDay7DFetchIntercepted=true;const nativeFetch=window.fetch.bind(window);
    window.fetch=async function(input,init){const response=await nativeFetch(input,init);try{const url=typeof input==='string'?input:input?.url||'';if(url.includes('/api')&&init?.body){const request=JSON.parse(init.body),action=String(request?.action||'');const product=action.includes('galvipath')?'GalviPath':action.includes('galvisight')?'GalviSight':action.includes('galvishot')?'GalviShot':null;if(product&&STAGES[product].get===action){const body=await response.clone().json();if(String(body?.status||'').toLowerCase()==='needs_followup')queueMicrotask(()=>exposeFollowupStage(product,body));}}}catch(error){console.warn('Day 7D response inspection skipped',error);}return response;};
  }

  function initialize(){Object.keys(STAGES).forEach(bind);installAuthoritativeStageRoutes();interceptFetch();}
  document.addEventListener('DOMContentLoaded',initialize);
  if(document.readyState!=='loading')queueMicrotask(initialize);
  const routeInstaller=setInterval(()=>{initialize();if(window.__galviLegacyShowGalviShotResult&&window.__galviLegacyShowGalviSight&&window.__galviLegacyShowGalviPath)clearInterval(routeInstaller);},50);
  setTimeout(()=>clearInterval(routeInstaller),5000);
  window.GalviCareDay7D={renderQuestions,saveAnswers,skipCurrentQuestion,ensureStageUi,exposeFollowupStage,renderReadyStage,installAuthoritativeStageRoutes};
})();
