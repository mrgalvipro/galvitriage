/* GalviCare 1.0 Day 1 customer-facing Pre-Founder pathway.
 * Customer experience contract:
 * - hidden by default
 * - visible only when organization_stage === 'Idea'
 * - customer language uses Pre-Founder only
 * - Idea-stage patients are never forced to invent a company/venture name
 *
 * Day 7 P0-02 release remediation:
 * - preserve the QA Human-E2E marker across same-browser navigation;
 * - when and only when ?human_e2e=1 is active, an Idea-stage submission uses the
 *   canonical Day 1 principal-only + Day 2 Founder Readiness APIs instead of the
 *   legacy operating-venture Business Health intake;
 * - no venture/BHR is fabricated, no browser scoring is performed, and the
 *   canonical Day 6 SPUR catalog is projected from the same principal context.
 * Default customer behavior remains unchanged outside the explicit Human-E2E gate.
 */
(()=>{
  'use strict';
  const SIGNATURE='Day 1 customer Pre-Founder pathway adapter.';
  const IDEA_STAGE='Idea';
  const PANEL_ID='prefounder-customer-pathway';
  const READINESS_PANEL_ID='day7-prefounder-readiness-input';
  const RESULT_ID='day7-prefounder-readiness-result';
  const STAGE_SELECTOR='select[name="organization_stage"]';
  const VENTURE_INPUT_SELECTOR='input[name="venture_name"]';
  const HUMAN_E2E_KEY='galvicare_human_e2e_active_v1';
  const HUMAN_STORE='galvicare_day1_human_e2e_v1';
  const API='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const READINESS=[
    ['clarity','Clarity','How clear are you about the problem or opportunity you want to pursue?'],
    ['runway','Runway','How prepared are you financially to explore or begin building?'],
    ['time','Time','How much protected time can you consistently devote to becoming a founder?'],
    ['capability','Capability','How prepared are your current skills for the work required to start and operate a venture?'],
    ['network','Network','How strong is the network you can draw on for customers, mentors, partners, and expertise?'],
    ['domain_knowledge','Domain Knowledge','How well do you understand the domain in which you want to build?'],
    ['opportunity_evidence','Opportunity Evidence','How much real-world evidence do you have that this opportunity matters?'],
    ['decision_confidence','Decision Confidence','How confident are you in deciding what to test or do next?'],
    ['leadership_readiness','Leadership Readiness','How ready are you to lead through ambiguity, learning, and accountability?'],
    ['operating_willingness','Operating Willingness','How willing are you to do the sustained operating work required after the idea stage?']
  ];
  const text=v=>String(v??'').trim();
  const safe=v=>text(v).replace(/[^A-Za-z0-9._-]/g,'_').slice(0,72);
  const getInput=name=>document.querySelector(`[name="${name}"]`);
  let tracked=false,submitting=false;

  function humanState(){try{return JSON.parse(localStorage.getItem(HUMAN_STORE)||'{}')}catch{return{}}}
  function saveHuman(patch){const next={...humanState(),...patch};localStorage.setItem(HUMAN_STORE,JSON.stringify(next));return next}
  function preserveHumanE2EContext(){
    try{
      const url=new URL(window.location.href);
      const explicit=url.searchParams.get('human_e2e')==='1';
      if(explicit)sessionStorage.setItem(HUMAN_E2E_KEY,'1');
      const active=explicit||sessionStorage.getItem(HUMAN_E2E_KEY)==='1';
      if(active&&!explicit){url.searchParams.set('human_e2e','1');history.replaceState(history.state,'',url.pathname+url.search+url.hash)}
      document.documentElement.dataset.galvicareHumanE2e=active?'true':'false';
      return active;
    }catch{return false}
  }
  function isIdea(){return text(document.querySelector(STAGE_SELECTOR)?.value)===IDEA_STAGE}
  function findVentureLabel(input){let node=input?.previousElementSibling;while(node&&node.tagName!=='LABEL')node=node.previousElementSibling;return node?.tagName==='LABEL'?node:null}
  function ensurePanel(stageSelect){
    let panel=document.getElementById(PANEL_ID);if(panel)return panel;
    panel=document.createElement('section');panel.id=PANEL_ID;panel.className='inclusions hidden';panel.setAttribute('aria-hidden','true');panel.setAttribute('aria-live','polite');panel.setAttribute('data-galvicare-pathway','pre_founder');
    panel.innerHTML=`<p class="eyebrow">GALVICARE™ | PRE-FOUNDER PATHWAY</p><h3>You Have an Idea. Here’s What Comes Next.</h3><p>You do not need to already have a company — or know all the language of entrepreneurship — to begin. GalviCare™ can meet you at the idea stage and help you understand what comes next.</p><h4>What is a Founder?</h4><p>A founder is the person who takes responsibility for turning a business idea into a real company. Founders identify an opportunity, shape the product or service, bring together the resources needed to begin, establish the early vision, and start building the organization.</p><h4>Your Pre-Founder Pathway</h4><p>Because you selected <strong>Idea</strong>, GalviCare™ recognizes that you are still preparing to build the venture itself. The Pre-Founder Pathway helps you clarify the problem you want to solve, who you want to serve, what you may build, and what you need to learn before operating as a founder. You are not expected to already have a fully formed company.</p><p><strong>Where this leads:</strong> this pathway prepares you for the GalviStudio™ Founder Development Institute, where you can develop the knowledge, decisions, and early evidence needed to move from an idea toward an operating venture.</p>`;
    stageSelect.insertAdjacentElement('afterend',panel);return panel
  }
  function updateVentureField(idea){
    const input=document.querySelector(VENTURE_INPUT_SELECTOR);if(!input)return;const label=findVentureLabel(input);
    if(idea){input.required=false;input.placeholder='Optional: name your idea if you already have one';input.setAttribute('aria-required','false');if(label){if(!label.dataset.operatingFounderLabel)label.dataset.operatingFounderLabel=label.innerHTML;label.innerHTML='Company / Venture / Idea Name <span class="small">(optional at the Idea stage)</span>'}}
    else{input.required=true;input.removeAttribute('placeholder');input.setAttribute('aria-required','true');if(label?.dataset.operatingFounderLabel)label.innerHTML=label.dataset.operatingFounderLabel}
  }
  function ensureReadinessPanel(){
    const scoreQuestions=document.getElementById('scoreQuestions');if(!scoreQuestions)return null;
    let panel=document.getElementById(READINESS_PANEL_ID);if(panel)return panel;
    panel=document.createElement('section');panel.id=READINESS_PANEL_ID;panel.className='panel hidden';panel.dataset.qaOnly='true';panel.innerHTML='<p class="eyebrow">GALVIVITALS™ | FOUNDER READINESS</p><h2>Founder Readiness Signals</h2><p class="small">Because no real venture exists yet, GalviCare measures your readiness to become and operate as a founder. It does not calculate Business Health for a company that does not exist.</p>';
    READINESS.forEach(([key,,question],i)=>{const l=document.createElement('label');l.textContent=`${i+1}. ${question}`;const scale=document.createElement('div');scale.className='scale';for(let n=1;n<=5;n++){const item=document.createElement('label');item.innerHTML=`<input type="radio" name="fr_${key}" value="${n}"> ${n}`;scale.appendChild(item)}panel.append(l,scale)});
    scoreQuestions.insertAdjacentElement('beforebegin',panel);return panel
  }
  function setLegacyBusinessQuestionsActive(active){const host=document.getElementById('scoreQuestions');if(!host)return;host.classList.toggle('hidden',!active);for(const input of host.querySelectorAll('input,select,textarea'))input.required=active}
  function setOperatingProfileRequired(active){for(const name of ['industry','team_size','revenue_range']){const input=getInput(name);if(input)input.required=active}}
  function readinessValues(){const out={};for(const [key] of READINESS){const checked=document.querySelector(`input[name="fr_${key}"]:checked`);if(!checked)throw new Error('Complete all Founder Readiness signals before continuing.');const n=Number(checked.value);out[key]=Math.round(((n-1)/4)*100)}return out}
  function identity(){const email=text(getInput('email')?.value).toLowerCase();const match=email.match(/^day1\.([a-z0-9._-]+)@example\.invalid$/);if(!match)throw new Error('P0-02 Human E2E requires a synthetic QA email in the form day1.<name>@example.invalid.');return{email,actor:`principal:${match[1]}`,suffix:match[1],first_name:text(getInput('first_name')?.value)||'Pre',last_name:text(getInput('last_name')?.value)||'Founder'}}
  async function api(path,{method='GET',actor,idempotency,body}={}){
    const headers={Accept:'application/json','Cache-Control':'no-cache','X-Correlation-Id':`day7-p02-${crypto.randomUUID()}`};if(actor)headers['X-Galvi-Day1-Actor']=actor;if(idempotency)headers['Idempotency-Key']=idempotency;if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetch(API+path,{method,cache:'no-store',headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});let payload={};try{payload=await response.json()}catch{}
    if(!response.ok||payload?.success===false){const error=new Error(payload?.error?.message||`P0-02 request failed (${response.status}).`);error.code=payload?.error?.code||'GV_DAY7_P02_FAILED';error.status=response.status;throw error}return payload
  }
  function key(prefix,suffix,extra=''){return`${prefix}.${safe(suffix)}${extra?'.'+safe(extra):''}`.slice(0,170)}
  function hideLegacyOutputs(){for(const id of ['result','galviscore-paywall','galviscore-followup','galviscore-result','galviscore-repair']){const n=document.getElementById(id);if(!n)continue;n.classList.add('hidden');if(id==='result')n.style.display='none'}}
  function statusBox(message,error=false){let box=document.getElementById('day7-p02-status');if(!box){box=document.createElement('div');box.id='day7-p02-status';box.className='inclusions';document.getElementById(READINESS_PANEL_ID)?.appendChild(box)}box.textContent=message;box.style.borderColor=error?'#fecaca':'#a7f3d0';box.style.background=error?'#fef2f2':'#ecfdf5';box.style.color=error?'#991b1b':'#166534'}
  function label(v){return text(v).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
  function renderCanonical(data,catalog){
    hideLegacyOutputs();document.getElementById(RESULT_ID)?.remove();const form=document.getElementById('assessmentForm');const result=document.createElement('section');result.id=RESULT_ID;result.className='galvicare-card';result.dataset.qaOnly='true';
    const score=data.score||{},vitals=data.vitals||{},context=data.context||{},principal=data.principal||{};const tracks=catalog?.data?.spur?.tracks||[];const track=tracks.find(x=>x.code==='dreamer')||tracks.find(x=>/pre-founder/i.test(text(x.name)))||{};const stages=catalog?.data?.spur?.stages||[];
    const dimensionHtml=Object.entries(vitals.dimension_scores||{}).map(([k,v])=>`<div class="category-row"><div class="category-label"><strong>${label(k)}</strong><span>${v}/100</span></div><div class="category-bar"><div class="category-fill" style="width:${Math.max(0,Math.min(100,Number(v)||0))}%"></div></div></div>`).join('');
    result.innerHTML=`<p class="eyebrow">GALVICARE 1.0 | P0-02 CANONICAL PRE-FOUNDER</p><h2>GalviVitals™ | Founder Readiness Vitals</h2><div class="score-hero">${vitals.overall_score??'—'}<small>/100</small></div><p>Clinical Confidence: <strong>${vitals.clinical_confidence??'—'}%</strong></p><p class="small">These vitals measure readiness to become and operate as a founder. No Business Health score or venture diagnosis has been fabricated.</p>${dimensionHtml}<hr><h2>GalviScore™ | Founder Readiness</h2><div class="score-hero">${score.overall_score??'—'}<small>/100</small></div><p><strong>Subtype:</strong> ${label(score.score_type||'founder_readiness')}</p><p><strong>Acuity:</strong> ${score.acuity_score??'—'}/100 · ${label(score.acuity_band||'green')}</p><p><strong>Clinical Confidence:</strong> ${score.clinical_confidence??'—'}%</p><p><strong>Canonical identity:</strong> ${principal.founder_id||context.founder_id||'—'}</p><p><strong>Venture/BHR:</strong> ${context.venture_id||'null'} / ${context.bmr_id||'null'}</p><hr><p class="eyebrow">GALVISTUDIO™ | FOUNDER DEVELOPMENT</p><h2>SPUR™ Pre-Founder Route</h2><p><strong>Route:</strong> ${text(track.name)||'SPUR Pre-Founder'}</p><p><strong>Six-stage pathway:</strong> ${stages.map(x=>text(x.name||x.code)).filter(Boolean).join(' → ')||'Discern → Discover → Prepare → Validate → Build → Steward'}</p><p><strong>Next action:</strong> Continue through the Founder Development Institute / SPUR Pre-Founder pathway. A real venture/BHR is created only when a real venture exists.</p><div class="inclusions"><strong>P0-02 evidence:</strong> principal-only=${context.record_mode==='principal_only'?'YES':'NO'} · venture_id=${context.venture_id??'null'} · bmr_id=${context.bmr_id??'null'} · score_type=${score.score_type||'—'} · SPUR=${text(track.name)||'SPUR Pre-Founder'}</div>`;
    form?.insertAdjacentElement('afterend',result);result.scrollIntoView({behavior:'smooth'});
  }
  async function submitCanonical(event){
    if(submitting||!preserveHumanE2EContext()||!isIdea())return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();submitting=true;
    try{
      const i=identity(),dimensions=readinessValues(),dimKey=Object.values(dimensions).join('-');statusBox('Creating the canonical principal-only record and Founder Readiness assessment…');
      const contextResponse=await api('/api/v1/principal-contexts',{method:'POST',actor:i.actor,idempotency:key('d7p02.ctx',i.suffix),body:{email:i.email,first_name:i.first_name,last_name:i.last_name,lifecycle_state:'pre_founder',record_mode:'principal_only',care_protocol:'founder_smb',payer_type:'self'}});
      const context=contextResponse.data.context,principal=contextResponse.data.principal;if(context.record_mode!=='principal_only'||context.venture_id!==null||context.bmr_id!==null)throw new Error('P0-02 STOP: canonical Pre-Founder unexpectedly has a venture/BHR.');
      await api('/api/v1/consents',{method:'POST',actor:i.actor,idempotency:key('d7p02.consent',i.suffix),body:{founder_id:principal.founder_id,purpose:'care_processing',policy_version:'day7_p0_02_v1',status:'granted'}});
      const confidence={required_data_completeness:100,evidence_quality:80,answer_consistency:90,corroboration:70,context_completeness:90};
      await api('/api/v1/day2/triage',{method:'POST',actor:i.actor,idempotency:key('d7p02.triage',i.suffix,dimKey),body:{context_id:context.context_id,acuity:{severity:0,urgency:0,continuity:0,reversibility:0,complexity:0},confidence,red_flags:[],followup_round:0,answers:{lifecycle_state:'pre_founder',venture_exists:false,human_e2e:true}}});
      const vitalsResponse=await api('/api/v1/day2/vitals',{method:'POST',actor:i.actor,idempotency:key('d7p02.vitals',i.suffix,dimKey),body:{context_id:context.context_id,dimensions,confidence}});
      const scoreResponse=await api('/api/v1/day2/score',{method:'POST',actor:i.actor,idempotency:key('d7p02.score',i.suffix,dimKey),body:{context_id:context.context_id}});
      const catalog=await api('/api/v1/day6/studio/catalog');
      const vitals=vitalsResponse.data,score=scoreResponse.data;if(vitals.score_type!=='founder_readiness'||score.score_type!=='founder_readiness')throw new Error('P0-02 STOP: canonical score subtype is not Founder Readiness.');
      saveHuman({email:i.email,actor:i.actor,suffix:i.suffix,context_key:key('d7p02.ctx',i.suffix),context_id:context.context_id,founder_id:principal.founder_id,principal_session_id:contextResponse.data?.session?.session_id||null,principal_evidence_id:vitals.supporting_evidence_ids?.[0]||null,p0_02_score_result_id:score.result_id,p0_02_complete:true});
      renderCanonical({context,principal,vitals,score},catalog);statusBox('P0-02 canonical Founder Readiness + SPUR route rendered. No venture/BHR was created.');
      window.dispatchEvent(new CustomEvent('galvicare:p0-02-ready',{detail:{context_id:context.context_id,founder_id:principal.founder_id,score_type:score.score_type}}));
    }catch(error){console.error(SIGNATURE,'P0-02 canonical flow failed',error);statusBox(`${error.code?error.code+': ':''}${error.message||error}`,true)}finally{submitting=false}
  }
  function update(stageSelect,panel){
    const human=preserveHumanE2EContext(),idea=text(stageSelect.value)===IDEA_STAGE;panel.classList.toggle('hidden',!idea);panel.setAttribute('aria-hidden',idea?'false':'true');document.body.dataset.galvicareLifecycle=idea?'pre_founder':'operating_venture';updateVentureField(idea);
    const readiness=ensureReadinessPanel();if(readiness)readiness.classList.toggle('hidden',!(human&&idea));if(human&&idea){setLegacyBusinessQuestionsActive(false);setOperatingProfileRequired(false)}else{setLegacyBusinessQuestionsActive(true);setOperatingProfileRequired(true);document.getElementById(RESULT_ID)?.remove()}
    window.dispatchEvent(new CustomEvent('galvicare:lifecycle-change',{detail:{lifecycle:idea?'pre_founder':'operating_venture',human_e2e:human}}));
    if(idea&&!tracked){tracked=true;try{if(typeof trackGalviEvent==='function')trackGalviEvent('prefounder_pathway_viewed',{journey_step:'prefounder_pathway',organization_stage:IDEA_STAGE})}catch(error){console.warn(SIGNATURE,'analytics skipped',error)}}
  }
  function mount(){
    const human=preserveHumanE2EContext(),stageSelect=document.querySelector(STAGE_SELECTOR);if(!stageSelect)return;const panel=ensurePanel(stageSelect);ensureReadinessPanel();update(stageSelect,panel);stageSelect.addEventListener('change',()=>update(stageSelect,panel));
    const form=document.getElementById('assessmentForm')||document.querySelector('form');form?.addEventListener('submit',submitCanonical,true);
    window.addEventListener('pageshow',()=>{preserveHumanE2EContext();update(stageSelect,panel)});window.addEventListener('hashchange',()=>{preserveHumanE2EContext();update(stageSelect,panel)});
    console.info(SIGNATURE,human?'active with P0-02 canonical Human E2E':'active');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
