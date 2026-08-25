/* Day 7D cumulative customer-intelligence browser adapter.
   Browser renders Worker-owned follow-ups and regenerated results only.
   Day 3: authoritative customer-evidence API calls go directly to the canonical
   GalviCare Worker /api surface; mutable legacy API wrappers cannot intercept them. */
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
  const CLIENT_ACTION_ALIASES={
    get_or_generate_galvishot:'get_or_create_galvishot',get_galvishot:'get_or_create_galvishot',generate_galvishot:'get_or_create_galvishot',
    get_or_create_galvisight:'get_or_generate_galvisight',get_galvisight:'get_or_generate_galvisight',generate_galvisight:'get_or_generate_galvisight',
    get_or_create_galvipath:'get_or_generate_galvipath',generate_galvipath:'get_or_generate_galvipath'
  };
  const queues={GalviScore:[],GalviShot:[],GalviSight:[],GalviPath:[]};
  const inFlight={GalviScore:null,GalviShot:null,GalviSight:null,GalviPath:null};
  const hydration={GalviScore:'',GalviShot:'',GalviSight:'',GalviPath:''};
  const scoreBaseline={value:null};
  const el=id=>document.getElementById(id);
  const session=()=>typeof getStoredSessionId==='function'?String(getStoredSessionId()||'').trim():String(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id')||'').trim();
  const endpoint=()=>typeof GALVICARE_API_ENDPOINT!=='undefined'?GALVICARE_API_ENDPOINT:`${GALVICARE_INTAKE_ENDPOINT}/api`;
  const objectiveScore=value=>{const result=value?.result||value?.data||value||{};const candidates=[result.galviscore_score,result.score,result.overall_score,result.total_score];const found=candidates.find(candidate=>Number.isFinite(Number(candidate)));return found===undefined?null:Number(found);};
  const responseStatus=response=>String(response?.status||response?.evaluation?.status||'').toLowerCase();
  const entitlementPending=response=>responseStatus(response)==='entitlement_required'||(response?.payment_required===true&&response?.evidence_ready===true&&response?.result_generation_locked===true);

  async function call(action,payload={}){
    const sid=session();
    if(!sid)throw new Error('GalviCare session is unavailable. Refresh and resume the same QA journey.');
    const requestedAction=String(action||'').trim();
    const canonicalAction=CLIENT_ACTION_ALIASES[requestedAction]||requestedAction;
    const response=await fetch(endpoint(),{
      method:'POST',
      headers:{'Content-Type':'application/json','Cache-Control':'no-cache'},
      body:JSON.stringify({action:canonicalAction,session_id:sid,payload})
    });
    const raw=await response.text();
    let body={};
    try{body=raw?JSON.parse(raw):{};}catch{body={success:false,code:'NON_JSON_API_RESPONSE',message:'GalviCare API returned a non-JSON response.'};}
    if(!response.ok||body?.success===false){
      const code=body?.error_code||body?.error?.code||body?.code||`HTTP_${response.status}`;
      const detail=body?.detail||body?.error?.message||body?.message||`GalviCare request failed (${response.status})`;
      const error=new Error(`${canonicalAction}: ${detail}`);error.code=code;error.status=response.status;error.payload=body;error.action=canonicalAction;throw error;
    }
    return body;
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
    if(!el(cfg.questions))panel.innerHTML=`<p class="eyebrow">GALVIENGINE CLINICAL FOLLOW-UP</p><h3>Answer up to three quick questions to improve finding accuracy.</h3><div id="${cfg.questions}"></div><div class="button-row"><button id="${cfg.submit}" class="primary-btn" type="button">Submit Follow-Up</button><button id="${cfg.skip}" class="secondary-button" type="button">Skip for Now</button></div><p id="${cfg.status}" aria-live="polite"></p>`;
    return panel;
  }

  const questionsFrom=response=>response?.followup_questions||response?.followups||response?.evaluation?.followup_questions||response?.evaluation?.followups||[];
  function renderQuestions(product,response){
    const cfg=STAGES[product],panel=ensureStageUi(product),host=el(cfg.questions);if(!panel||!host)return false;
    queues[product]=questionsFrom(response).slice(0,MAX_VISIBLE_TARGETED_QUESTIONS);host.innerHTML='';
    if(!queues[product].length){panel.classList.add('hidden');return false;}
    queues[product].forEach((question,index)=>{const wrapper=document.createElement('div');wrapper.className='day7d-targeted-question';const label=document.createElement('label');label.htmlFor=`${cfg.questions}-${index}`;label.textContent=question.question_text||question.question;const textarea=document.createElement('textarea');textarea.id=label.htmlFor;textarea.required=true;textarea.dataset.questionCode=question.question_id||question.question_code||'';textarea.dataset.questionText=question.question_text||question.question||'';textarea.dataset.confidenceImpact=String(question.confidence_impact||5);textarea.dataset.day7dAuthoritative='1';wrapper.append(label,textarea);host.append(wrapper);});
    panel.classList.remove('hidden');return true;
  }

  function exposeFollowupStage(product,response){
    const cfg=STAGES[product];
    if(product==='GalviScore'){if(typeof hideGalviScoreScreens==='function')hideGalviScoreScreens();el(cfg.host)?.classList.remove('hidden');}
    else{if(typeof hideUpstream==='function')hideUpstream();const host=el(cfg.host);if(host){host.classList.remove('hidden');host.style.display='block';}}
    renderQuestions(product,response);el(cfg.followup)?.scrollIntoView({behavior:'smooth',block:'start'});return true;
  }

  function holdForEntitlement(product,response,status){
    const cfg=STAGES[product];el(cfg.followup)?.classList.add('hidden');
    if(product==='GalviShot'){el('galvishot-result')?.classList.add('hidden');if(el('galvishot-result'))el('galvishot-result').style.display='none';el('galvishot-paywall')?.classList.remove('hidden');if(el('galvishot-paywall'))el('galvishot-paywall').style.display='block';}
    else if(product==='GalviSight'){el('galvisight-result-panel')?.classList.add('hidden');el('galvisight-handoff')?.classList.remove('hidden');if(el('galvisight-handoff'))el('galvisight-handoff').style.display='block';}
    else if(product==='GalviPath'){el('galvipath-result-panel')?.classList.add('hidden');el('galvipath-result')?.classList.remove('hidden');if(el('galvipath-result'))el('galvipath-result').style.display='block';}
    if(status)status.textContent=`Evidence saved. Complete verified ${product} payment to unlock the result.`;
    if(typeof fireGalviEvent==='function')fireGalviEvent('clinical_evidence_saved',{product:product.toLowerCase(),session_id:session(),stage:`${product} Paywall`,payment_required:true,evidence_version:response?.evidence_version});
    return true;
  }

  async function invokeLegacyWithResponse(action,response,renderer,options={}){
    if(typeof renderer!=='function')return false;
    const original=window.callGalviCareApi;let consumed=false;
    window.callGalviCareApi=async request=>{if(!consumed&&String(request?.action||'')===action){consumed=true;return response;}if(typeof original==='function')return original(request);throw new Error(`Unexpected legacy API request during authoritative ${action} render.`);};
    try{return await renderer(options);}finally{window.callGalviCareApi=original;}
  }
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
  function showError(product,error){const cfg=STAGES[product],status=el(cfg.status),box=el(cfg.error);const message=`${error?.code?error.code+': ':''}${error?.message||error}`;if(status)status.textContent=message;if(box){box.textContent=message;box.style.display='block';box.classList.remove('hidden');}}

  async function completeVisibleQuestions(product,skip=false){
    if(inFlight[product])return inFlight[product];
    const operation=(async()=>{
      const cfg=STAGES[product],status=el(cfg.status),answers=collectAnswers(product,skip);setBusy(product,true);if(status)status.textContent='Saving evidence…';
      const saved=await call(cfg.save,{answers,submission_id:`${session()}:${product}:${answers.map(item=>item.question_id).join(',')}`});
      const savedStatus=responseStatus(saved);
      if(savedStatus==='needs_followup'){renderQuestions(product,saved.evaluation||saved);if(status)status.textContent='Evidence saved. Continue with the remaining targeted questions.';return true;}
      if(product!=='GalviScore'&&entitlementPending(saved))return holdForEntitlement(product,saved,status);
      const regenerated=(saved.result||saved.data)?saved:await call(cfg.get,{});
      if(responseStatus(regenerated)==='needs_followup')return exposeFollowupStage(product,regenerated);
      if(product!=='GalviScore'&&entitlementPending(regenerated))return holdForEntitlement(product,regenerated,status);
      el(cfg.followup)?.classList.add('hidden');if(status)status.textContent='Evidence saved. Rendering your enriched result…';const rendered=await renderReadyStage(product,regenerated);if(rendered===false)throw new Error(`${product} result renderer did not complete.`);return true;
    })();
    inFlight[product]=operation;try{return await operation;}catch(error){showError(product,error);throw error;}finally{inFlight[product]=null;setBusy(product,false);}
  }

  function ownsEvent(product,event){const cfg=STAGES[product],target=event.target;return target===el(cfg.submit)||target===el(cfg.skip)||target?.closest?.(`#${cfg.followup}`);}
  function suppressLegacyFormSubmit(product){const cfg=STAGES[product],panel=el(cfg.followup),form=panel?.closest('form');if(!form||form.dataset.day7dAuthoritativeSubmit==='1')return;form.dataset.day7dAuthoritativeSubmit='1';form.addEventListener('submit',event=>{if(ownsEvent(product,event)){event.preventDefault();event.stopImmediatePropagation();}},true);}
  function bind(product){const cfg=STAGES[product];ensureStageUi(product);suppressLegacyFormSubmit(product);const submit=el(cfg.submit),skip=el(cfg.skip);if(submit&&submit.dataset.day7dAuthoritative!=='1'){submit.dataset.day7dAuthoritative='1';submit.type='button';submit.addEventListener('click',async event=>{event.preventDefault();event.stopImmediatePropagation();try{await completeVisibleQuestions(product,false);}catch{}},true);}if(skip&&skip.dataset.day7dAuthoritative!=='1'){skip.dataset.day7dAuthoritative='1';skip.type='button';skip.addEventListener('click',async event=>{event.preventDefault();event.stopImmediatePropagation();try{await completeVisibleQuestions(product,true);}catch{}},true);}}

  const routeWrappers={};
  function installRoute(name,product){
    const current=window[name];if(typeof current!=='function'||current?.__day7dAuthoritative===true)return;
    if(product==='GalviScore')window.__galviLegacyRouteByGalviScoreConfidence=current;
    else if(product==='GalviShot')window.__galviLegacyShowGalviShotResult=current;
    else if(product==='GalviSight')window.__galviLegacyShowGalviSight=current;
    else if(product==='GalviPath')window.__galviLegacyShowGalviPath=current;
    const wrapper=product==='GalviScore'?async scoreResult=>{scoreBaseline.value=objectiveScore(scoreResult);if(typeof cacheGalviScoreResult==='function')cacheGalviScoreResult(scoreResult);const response=await call(STAGES.GalviScore.get,{});if(responseStatus(response)==='needs_followup')return exposeFollowupStage('GalviScore',response);await renderReadyStage('GalviScore',response);return'result';}:async()=>{const response=await call(STAGES[product].get,{});return responseStatus(response)==='needs_followup'?exposeFollowupStage(product,response):entitlementPending(response)?holdForEntitlement(product,response,el(STAGES[product].status)):renderReadyStage(product,response);};
    wrapper.__day7dAuthoritative=true;routeWrappers[name]=wrapper;window[name]=wrapper;
  }
  function installAuthoritativeStageRoutes(){installRoute('routeByGalviScoreConfidence','GalviScore');installRoute('showIntegratedGalviShotResult','GalviShot');installRoute('showGalviSight','GalviSight');installRoute('showGalviPath','GalviPath');}

  function visible(node){if(!node)return false;const style=getComputedStyle(node);return !node.classList.contains('hidden')&&style.display!=='none'&&style.visibility!=='hidden';}
  function stageShouldHydrate(product){
    if(product==='GalviScore')return visible(el('galviscore-result'))||visible(el('galviscore-followup'));
    if(product==='GalviShot')return visible(el('galvishot-paywall'))||visible(el('galvishot-result'));
    if(product==='GalviSight')return visible(el('galvisight-handoff'))||visible(el('galvisight-result-panel'));
    if(product==='GalviPath')return visible(el('galvipath-result'))||visible(el('galvipath-result-panel'));
    return false;
  }
  function hydrationKey(product){
    const sid=session();
    if(product==='GalviScore')return `${sid}|score-result:${visible(el('galviscore-result'))?1:0}|score-followup:${visible(el('galviscore-followup'))?1:0}`;
    if(product==='GalviShot')return `${sid}|shot-paywall:${visible(el('galvishot-paywall'))?1:0}|shot-result:${visible(el('galvishot-result'))?1:0}`;
    if(product==='GalviSight')return `${sid}|sight-handoff:${visible(el('galvisight-handoff'))?1:0}|sight-result:${visible(el('galvisight-result-panel'))?1:0}`;
    return `${sid}|path-host:${visible(el('galvipath-result'))?1:0}|path-result:${visible(el('galvipath-result-panel'))?1:0}`;
  }
  async function hydrate(product,force=false){
    if(!session()||!stageShouldHydrate(product)||inFlight[product])return false;
    const key=hydrationKey(product);if(!force&&hydration[product]===key)return false;hydration[product]=key;
    try{
      const response=await call(STAGES[product].get,{});
      if(responseStatus(response)==='needs_followup')return exposeFollowupStage(product,response);
      if(product!=='GalviScore'&&entitlementPending(response))return false;
      return false;
    }catch(error){
      if(!(product==='GalviScore'&&Number(error?.status)===402))showError(product,error);
      return false;
    }
  }

  function initialize(forceHydration=false){Object.keys(STAGES).forEach(bind);installAuthoritativeStageRoutes();for(const product of Object.keys(STAGES))hydrate(product,forceHydration);}
  document.addEventListener('DOMContentLoaded',()=>initialize(true));
  if(document.readyState!=='loading')queueMicrotask(()=>initialize(true));
  for(const event of ['pageshow','focus','hashchange','popstate'])window.addEventListener(event,()=>initialize(true));
  const routeInstaller=setInterval(()=>initialize(false),250);setTimeout(()=>clearInterval(routeInstaller),30000);
  const observer=new MutationObserver(()=>queueMicrotask(()=>initialize(false)));observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});

  window.GalviCareDay7D={renderQuestions,saveAnswers:product=>completeVisibleQuestions(product,false),skipCurrentQuestion:product=>completeVisibleQuestions(product,true),ensureStageUi,exposeFollowupStage,renderReadyStage,installAuthoritativeStageRoutes,assertImmutableGalviScore,holdForEntitlement,entitlementPending,hydrate,callAuthoritativeApi:call};
})();
