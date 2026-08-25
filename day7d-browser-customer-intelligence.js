/* Day 7D cumulative customer-intelligence browser adapter.
   Browser renders Worker-owned follow-ups and regenerated results only.
   Day 3: pre-entitlement evidence may be saved, but paid results remain server-gated. */
(function(){
  'use strict';

  const STAGES={
    GalviScore:{host:'galviscore-followup',followup:'galviscore-followup',questions:'followup-question-container',submit:'submit-followup',skip:'skip-galviscore-followup',status:'galviscore-followup-status',error:'galviscore-error',save:'save_galviscore_followup',get:'get_or_generate_galviscore'},
    GalviShot:{host:'galvishot-paywall',followup:'galvishot-followup',questions:'galvishot-followup-questions',submit:'submit-galvishot-followup',skip:'skip-galvishot-followup',status:'galvishot-followup-status',error:'galvishot-paywall-error',save:'save_galvishot_followup',get:'get_or_create_galvishot'},
    GalviSight:{host:'galvisight-handoff',followup:'galvisight-followup',questions:'galvisight-followup-questions',submit:'submit-galvisight-followup',skip:'skip-galvisight-followup',status:'galvisight-followup-status',error:'galvisight-error',save:'save_galvisight_followup',get:'get_or_generate_galvisight'},
    GalviPath:{host:'galvipath-result',followup:'galvipath-followup',questions:'galvipath-followup-questions',submit:'submit-galvipath-followup',skip:'skip-galvipath-followup',status:'galvipath-followup-status',error:'galvipath-error',save:'save_galvipath_followup',get:'get_or_generate_galvipath'}
  };
  const MAX_VISIBLE_TARGETED_QUESTIONS=3;
  const SKIPPED_ANSWER='Skipped for now — no additional evidence supplied.';
  const queues={GalviScore:[],GalviShot:[],GalviSight:[],GalviPath:[]};
  const inFlight={GalviScore:null,GalviShot:null,GalviSight:null,GalviPath:null};
  const scoreBaseline={value:null};
  const el=id=>document.getElementById(id);
  const session=()=>typeof getStoredSessionId==='function'?getStoredSessionId():(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id')||'');
  const endpoint=()=>typeof GALVICARE_API_ENDPOINT!=='undefined'?GALVICARE_API_ENDPOINT:`${GALVICARE_INTAKE_ENDPOINT}/api`;
  const objectiveScore=value=>{const result=value?.result||value?.data||value||{};const candidates=[result.galviscore_score,result.score,result.overall_score,result.total_score];const found=candidates.find(candidate=>Number.isFinite(Number(candidate)));return found===undefined?null:Number(found);};
  const responseStatus=response=>String(response?.status||response?.evaluation?.status||'').toLowerCase();
  const entitlementPending=response=>responseStatus(response)==='entitlement_required'||(response?.payment_required===true&&response?.evidence_ready===true&&response?.result_generation_locked===true);

  async function call(action,payload={}){
    const sid=session();if(!sid)throw new Error('GalviCare session is unavailable. Refresh and resume the same QA journey.');
    if(typeof callGalviCareApi==='function')return callGalviCareApi({action,session_id:sid,payload});
    const response=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'application/json','Cache-Control':'no-cache'},body:JSON.stringify({action,session_id:sid,payload})});
    const body=await response.json();if(!response.ok||body?.success===false)throw new Error(body?.detail||body?.message||`GalviCare request failed (${response.status})`);return body;
  }

  function ensureStageUi(product){
    const cfg=STAGES[product];
    if(product==='GalviScore'){
      const panel=el(cfg.followup),questions=el(cfg.questions),submit=el(cfg.submit);if(!panel||!questions||!submit)return null;
      let status=el(cfg.status);if(!status){status=document.createElement('p');status.id=cfg.status;status.setAttribute('aria-live','polite');submit.closest('.button-row')?.after(status);}
      if(!el(cfg.skip)){const skip=document.createElement('button');skip.id=cfg.skip;skip.className='secondary-button';skip.type='button';skip.textContent='Skip for Now';submit.closest('.button-row')?.appendChild(skip);}return panel;
    }
    const host=el(cfg.host);if(!host)return null;let panel=el(cfg.followup);
    if(!panel){panel=document.createElement('div');panel.id=cfg.followup;panel.className='gshot-followup hidden';host.insertBefore(panel,host.lastChild);}
    if(!el(cfg.questions))panel.innerHTML=`<p class="eyebrow">GALVIENGINE CUSTOMER INTELLIGENCE</p><h3>A few details will help sharpen your ${product} result.</h3><div id="${cfg.questions}"></div><div class="button-row"><button id="${cfg.submit}" class="primary-btn" type="button">Save Answers & Continue</button><button id="${cfg.skip}" class="secondary-button" type="button">Skip for Now</button></div><p id="${cfg.status}" aria-live="polite"></p>`;
    return panel;
  }

  const questionsFrom=response=>response?.followup_questions||response?.followups||response?.evaluation?.followup_questions||response?.evaluation?.followups||[];
  function renderQuestions(product,response){const cfg=STAGES[product],panel=ensureStageUi(product),host=el(cfg.questions);if(!panel||!host)return false;queues[product]=questionsFrom(response).slice(0,MAX_VISIBLE_TARGETED_QUESTIONS);host.innerHTML='';if(!queues[product].length){panel.classList.add('hidden');return false;}queues[product].forEach((question,index)=>{const wrapper=document.createElement('div');wrapper.className='day7d-targeted-question';const label=document.createElement('label');label.htmlFor=`${cfg.questions}-${index}`;label.textContent=question.question_text||question.question;const textarea=document.createElement('textarea');textarea.id=label.htmlFor;textarea.required=true;textarea.dataset.questionCode=question.question_id||question.question_code||'';textarea.dataset.questionText=question.question_text||question.question||'';textarea.dataset.confidenceImpact=String(question.confidence_impact||5);textarea.dataset.day7dAuthoritative='1';wrapper.append(label,textarea);host.append(wrapper);});panel.classList.remove('hidden');return true;}

  function exposeFollowupStage(product,response){const cfg=STAGES[product];if(product==='GalviScore'){if(typeof hideGalviScoreScreens==='function')hideGalviScoreScreens();el(cfg.host)?.classList.remove('hidden');}else{if(typeof hideUpstream==='function')hideUpstream();const host=el(cfg.host);if(host){host.classList.remove('hidden');host.style.display='block';}}renderQuestions(product,response);el(cfg.followup)?.scrollIntoView({behavior:'smooth',block:'start'});return true;}

  function holdForEntitlement(product,response,status){
    const cfg=STAGES[product];el(cfg.followup)?.classList.add('hidden');
    if(product==='GalviShot'){
      el('galvishot-result')?.classList.add('hidden');
      if(el('galvishot-result'))el('galvishot-result').style.display='none';
      el('galvishot-paywall')?.classList.remove('hidden');
      if(el('galvishot-paywall'))el('galvishot-paywall').style.display='block';
    }else if(product==='GalviSight'){
      el('galvisight-result-panel')?.classList.add('hidden');
      el('galvisight-handoff')?.classList.remove('hidden');
      if(el('galvisight-handoff'))el('galvisight-handoff').style.display='block';
    }else if(product==='GalviPath'){
      el('galvipath-result-panel')?.classList.add('hidden');
      el('galvipath-result')?.classList.remove('hidden');
      if(el('galvipath-result'))el('galvipath-result').style.display='block';
    }
    if(status)status.textContent=`Evidence saved. Complete verified ${product} payment to unlock the result.`;
    if(typeof fireGalviEvent==='function')fireGalviEvent('clinical_evidence_saved',{product:product.toLowerCase(),session_id:session(),stage:`${product} Paywall`,payment_required:true,evidence_version:response?.evidence_version});
    return true;
  }

  async function invokeLegacyWithResponse(action,response,renderer,options={}){if(typeof renderer!=='function')return false;const original=window.callGalviCareApi;let consumed=false;window.callGalviCareApi=async request=>{if(!consumed&&String(request?.action||'')===action){consumed=true;return response;}if(typeof original==='function')return original(request);throw new Error(`Unexpected legacy API request during authoritative ${action} render.`);};try{return await renderer(options);}finally{window.callGalviCareApi=original;}}
  function assertImmutableGalviScore(response){const regenerated=objectiveScore(response);if(scoreBaseline.value!==null&&regenerated!==null&&regenerated!==scoreBaseline.value)throw new Error(`GalviScore objective score changed from ${scoreBaseline.value} to ${regenerated} during clarification.`);if(regenerated!==null)scoreBaseline.value=regenerated;}

  async function renderReadyStage(product,response){
    if(product==='GalviScore'){assertImmutableGalviScore(response);const result=response?.result||response?.data||response;if(typeof cacheGalviScoreResult==='function')cacheGalviScoreResult(result);if(typeof renderUnlockedGalviScore==='function'){renderUnlockedGalviScore(result);return true;}}
    if(product==='GalviShot'){if(response?.result&&typeof window.GalviCareDay7DRenderShotResult==='function')return window.GalviCareDay7DRenderShotResult(response.result);return invokeLegacyWithResponse(STAGES.GalviShot.get,response,window.__galviLegacyShowGalviShotResult);}
    if(product==='GalviSight')return invokeLegacyWithResponse(STAGES.GalviSight.get,response,window.__galviLegacyShowGalviSight);
    if(product==='GalviPath')return invokeLegacyWithResponse(STAGES.GalviPath.get,response,window.__galviLegacyShowGalviPath);
    return false;
  }

  function collectAnswers(product,skip){const cfg=STAGES[product],fields=[...(el(cfg.questions)?.querySelectorAll('textarea[data-day7d-authoritative="1"]')||[])];if(!fields.length)throw new Error(`${product} follow-up questions are unavailable.`);const answers=fields.map(field=>{const answer=skip?SKIPPED_ANSWER:field.value.trim();if(!answer){field.focus();throw new Error('Please answer every visible question or choose Skip for Now.');}return{question_id:field.dataset.questionCode,question_text:field.dataset.questionText,answer,skipped:skip,confidence_impact:skip?0:Number(field.dataset.confidenceImpact||5)};});return answers.slice(0,MAX_VISIBLE_TARGETED_QUESTIONS);}
  function setBusy(product,busy){const cfg=STAGES[product];for(const control of [el(cfg.submit),el(cfg.skip)])if(control){control.disabled=busy;control.setAttribute('aria-busy',busy?'true':'false');}}

  async function completeVisibleQuestions(product,skip=false){
    if(inFlight[product])return inFlight[product];
    const operation=(async()=>{
      const cfg=STAGES[product],status=el(cfg.status),answers=collectAnswers(product,skip);setBusy(product,true);if(status)status.textContent='Saving evidence…';
      const saved=await call(cfg.save,{answers,submission_id:`${session()}:${product}:${answers.map(item=>item.question_id).join(',')}`});
      const savedStatus=responseStatus(saved);
      if(savedStatus==='needs_followup'){renderQuestions(product,saved.evaluation||saved);if(status)status.textContent='Evidence saved. Continue with the next targeted question.';return true;}
      if(product!=='GalviScore'&&entitlementPending(saved))return holdForEntitlement(product,saved,status);
      const regenerated=(saved.result||saved.data)?saved:await call(cfg.get,{});
      if(responseStatus(regenerated)==='needs_followup')return exposeFollowupStage(product,regenerated);
      if(product!=='GalviScore'&&entitlementPending(regenerated))return holdForEntitlement(product,regenerated,status);
      el(cfg.followup)?.classList.add('hidden');if(status)status.textContent='Evidence saved. Rendering your enriched result…';const rendered=await renderReadyStage(product,regenerated);if(rendered===false)throw new Error(`${product} result renderer did not complete.`);return true;
    })();
    inFlight[product]=operation;try{return await operation;}finally{inFlight[product]=null;setBusy(product,false);}
  }

  function ownsEvent(product,event){const cfg=STAGES[product],target=event.target;return target===el(cfg.submit)||target===el(cfg.skip)||target?.closest?.(`#${cfg.followup}`);}
  function suppressLegacyFormSubmit(product){const cfg=STAGES[product],panel=el(cfg.followup),form=panel?.closest('form');if(!form||form.dataset.day7dAuthoritativeSubmit==='1')return;form.dataset.day7dAuthoritativeSubmit='1';form.addEventListener('submit',event=>{if(ownsEvent(product,event)){event.preventDefault();event.stopImmediatePropagation();}},true);}
  function bind(product){const cfg=STAGES[product];ensureStageUi(product);suppressLegacyFormSubmit(product);const submit=el(cfg.submit),skip=el(cfg.skip);if(submit&&submit.dataset.day7dAuthoritative!=='1'){submit.dataset.day7dAuthoritative='1';submit.type='button';submit.addEventListener('click',async event=>{event.preventDefault();event.stopImmediatePropagation();try{await completeVisibleQuestions(product,false);}catch(error){const status=el(cfg.status);if(status)status.textContent=error.message;}},true);}if(skip&&skip.dataset.day7dAuthoritative!=='1'){skip.dataset.day7dAuthoritative='1';skip.type='button';skip.addEventListener('click',async event=>{event.preventDefault();event.stopImmediatePropagation();try{await completeVisibleQuestions(product,true);}catch(error){const status=el(cfg.status);if(status)status.textContent=error.message;}},true);}}

  function installAuthoritativeStageRoutes(){
    if(typeof window.routeByGalviScoreConfidence==='function'&&!window.__galviLegacyRouteByGalviScoreConfidence){window.__galviLegacyRouteByGalviScoreConfidence=window.routeByGalviScoreConfidence;window.routeByGalviScoreConfidence=async scoreResult=>{scoreBaseline.value=objectiveScore(scoreResult);if(typeof cacheGalviScoreResult==='function')cacheGalviScoreResult(scoreResult);const response=await call(STAGES.GalviScore.get,{});if(responseStatus(response)==='needs_followup')return exposeFollowupStage('GalviScore',response);await renderReadyStage('GalviScore',response);return'result';};}
    if(typeof window.showIntegratedGalviShotResult==='function'&&!window.__galviLegacyShowGalviShotResult){window.__galviLegacyShowGalviShotResult=window.showIntegratedGalviShotResult;window.showIntegratedGalviShotResult=async()=>{const response=await call(STAGES.GalviShot.get,{});return responseStatus(response)==='needs_followup'?exposeFollowupStage('GalviShot',response):entitlementPending(response)?holdForEntitlement('GalviShot',response,el(STAGES.GalviShot.status)):renderReadyStage('GalviShot',response);};}
    if(typeof window.showGalviSight==='function'&&!window.__galviLegacyShowGalviSight){window.__galviLegacyShowGalviSight=window.showGalviSight;window.showGalviSight=async()=>{const response=await call(STAGES.GalviSight.get,{});return responseStatus(response)==='needs_followup'?exposeFollowupStage('GalviSight',response):entitlementPending(response)?holdForEntitlement('GalviSight',response,el(STAGES.GalviSight.status)):renderReadyStage('GalviSight',response);};}
    if(typeof window.showGalviPath==='function'&&!window.__galviLegacyShowGalviPath){window.__galviLegacyShowGalviPath=window.showGalviPath;window.showGalviPath=async()=>{const response=await call(STAGES.GalviPath.get,{});return responseStatus(response)==='needs_followup'?exposeFollowupStage('GalviPath',response):entitlementPending(response)?holdForEntitlement('GalviPath',response,el(STAGES.GalviPath.status)):renderReadyStage('GalviPath',response);};}
  }

  function initialize(){Object.keys(STAGES).forEach(bind);installAuthoritativeStageRoutes();}
  document.addEventListener('DOMContentLoaded',initialize);if(document.readyState!=='loading')queueMicrotask(initialize);const routeInstaller=setInterval(initialize,50);setTimeout(()=>clearInterval(routeInstaller),5000);
  window.GalviCareDay7D={renderQuestions,saveAnswers:product=>completeVisibleQuestions(product,false),skipCurrentQuestion:product=>completeVisibleQuestions(product,true),ensureStageUi,exposeFollowupStage,renderReadyStage,installAuthoritativeStageRoutes,assertImmutableGalviScore,holdForEntitlement,entitlementPending};
})();
