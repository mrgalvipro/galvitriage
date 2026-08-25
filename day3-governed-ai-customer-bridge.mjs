/* GalviCare 1.0 Day 3 governed-AI customer bridge — QA only.
 * Critical-path purpose:
 * 1) keep the passed deterministic 0.5/Day 1/Day 2 customer journey intact;
 * 2) project accepted Day 3 governed OpenAI intelligence into the paid customer surfaces;
 * 3) keep one canonical QA principal/BHR and persist the deterministic baseline in GalviVault before AI reasoning;
 * 4) never call OpenAI from the browser and never replace deterministic GalviScore truth.
 */
const DAY3_CUSTOMER_BRIDGE_SOURCE = String.raw`(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 3 governed AI customer bridge v1';
  const DAY3_BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const BRIDGE_STORE='galvicare_day3_customer_bridge_v1';
  const DAY1_HUMAN_STORE='galvicare_day1_human_e2e_v1';
  const OLD_SCORE_ACTION='get_or_generate_galviscore';
  const CANONICAL_SCORE_ACTION='get_or_create_score';
  const inflight=new Map();
  const rendered=new Map();
  let canonicalPromise=null;
  const q=(selector)=>document.querySelector(selector);
  const byId=(id)=>document.getElementById(id);
  const text=(value)=>String(value??'').trim();
  const safe=(value)=>text(value).replace(/[^A-Za-z0-9._:-]/g,'_').slice(0,120);
  const number=(value)=>Number.isFinite(Number(value))?Number(value):null;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)));
  const session=()=>typeof window.getStoredSessionId==='function'?text(window.getStoredSessionId()):text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  const scoreResult=()=>{try{return typeof window.getCachedGalviScoreResult==='function'?(window.getCachedGalviScoreResult()||{}):JSON.parse(localStorage.getItem('galviscore_last_result')||'{}')}catch{return{}}};
  const currentEmail=()=>text(q('[name="email"]')?.value).toLowerCase();
  const currentVenture=()=>text(q('[name="venture_name"]')?.value);
  const consentChecked=()=>Boolean(q('[name="consent"]')?.checked);
  const parseStore=(key)=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}};
  const saveStore=(patch)=>{const next={...parseStore(BRIDGE_STORE),...patch};localStorage.setItem(BRIDGE_STORE,JSON.stringify(next));return next};
  const actorFromEmail=(email)=>{const match=text(email).toLowerCase().match(/^day1\.([a-z0-9._-]+)@example\.invalid$/);return match?'principal:'+match[1]:''};

  function patchLegacyScoreAction(){
    const original=window.callGalviCareApi;
    if(typeof original!=='function'||original.__day3CanonicalScoreBridge)return false;
    const wrapped=async function(request){
      if(request&&request.action===OLD_SCORE_ACTION)request={...request,action:CANONICAL_SCORE_ACTION};
      return original(request);
    };
    wrapped.__day3CanonicalScoreBridge=true;
    wrapped.__day3Original=original;
    window.callGalviCareApi=wrapped;
    return true;
  }

  async function api(path,{method='GET',actor,idempotency,body}={}){
    const headers={'Accept':'application/json','Cache-Control':'no-cache','X-Correlation-Id':'day3-browser-'+crypto.randomUUID()};
    if(actor)headers['X-Galvi-Day1-Actor']=actor;
    if(idempotency)headers['Idempotency-Key']=idempotency;
    if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetch(DAY3_BASE+path,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
    let payload={};
    try{payload=await response.json()}catch{payload={success:false,error:{code:'NON_JSON',message:'Non-JSON GalviEngine response'}}}
    if(!response.ok||payload?.success===false){
      const err=new Error(payload?.error?.message||payload?.message||('GalviEngine request failed ('+response.status+')'));
      err.code=payload?.error?.code||payload?.code||'DAY3_BRIDGE_REQUEST_FAILED';
      err.status=response.status;
      err.payload=payload;
      throw err;
    }
    return payload;
  }

  function identityFromExistingState(){
    const email=currentEmail();
    const hasVenture=Boolean(currentVenture());
    const human=parseStore(DAY1_HUMAN_STORE);
    if(!hasVenture&&human.context_id&&human.actor&&text(human.email).toLowerCase()===email){
      return {actor:human.actor,context_id:human.context_id,founder_id:human.founder_id,bmr_id:null,record_mode:'principal_only',email};
    }
    if(hasVenture&&human.operating_context_id&&human.operating_actor&&text(human.operating_email).toLowerCase()===email){
      return {actor:human.operating_actor,context_id:human.operating_context_id,founder_id:human.operating_founder_id,bmr_id:human.operating_bmr_id,record_mode:'principal_plus_venture',email};
    }
    const bridge=parseStore(BRIDGE_STORE);
    if(bridge.context_id&&bridge.actor&&text(bridge.email).toLowerCase()===email&&bridge.session_id===session())return bridge;
    return null;
  }

  async function ensureCanonicalContext(){
    if(canonicalPromise)return canonicalPromise;
    canonicalPromise=(async()=>{
      const existing=identityFromExistingState();
      if(existing){await ensureConsent(existing);return existing;}
      const email=currentEmail();
      const actor=actorFromEmail(email);
      if(!actor)throw new Error('Day 3 QA governed intelligence requires a synthetic QA email in the form day1.<name>@example.invalid so the browser can prove one canonical principal/BHR without creating a shadow identity.');
      const sid=session();
      if(!sid)throw new Error('A valid GalviCare session is required before Day 3 governed intelligence can run.');
      const venture=currentVenture();
      const principalOnly=!venture;
      const suffix=actor.slice('principal:'.length);
      const idem='ctx.day3browser.'+safe(suffix)+'.'+safe(sid);
      const body={
        email,
        first_name:text(q('[name="first_name"]')?.value)||'QA',
        last_name:text(q('[name="last_name"]')?.value)||'Founder',
        lifecycle_state:principalOnly?'pre_founder':'founder',
        record_mode:principalOnly?'principal_only':'principal_plus_venture',
        care_protocol:'founder_smb',
        payer_type:'self',
        client_session_key:'day3-browser:'+sid,
        ...(principalOnly?{}:{venture_name:venture})
      };
      const created=await api('/api/v1/principal-contexts',{method:'POST',actor,idempotency:idem,body});
      const context=created?.data?.context||{};
      const principal=created?.data?.principal||{};
      if(!context.context_id||!principal.founder_id)throw new Error('Canonical Day 3 principal/BHR context was not returned.');
      const ref={actor,context_id:context.context_id,founder_id:principal.founder_id,bmr_id:context.bmr_id||null,record_mode:context.record_mode,email,session_id:sid};
      saveStore(ref);
      await ensureConsent(ref);
      return ref;
    })();
    try{return await canonicalPromise;}catch(error){canonicalPromise=null;throw error;}
  }

  async function ensureConsent(ref){
    if(!consentChecked())throw new Error('Care-processing consent must be checked before GalviEngine can use the Business Health Record.');
    const sid=session()||'session';
    const body={founder_id:ref.founder_id,purpose:'care_processing',policy_version:'day3_customer_qa_v1',status:'granted',...(ref.bmr_id?{bmr_id:ref.bmr_id}:{})};
    await api('/api/v1/consents',{method:'POST',actor:ref.actor,idempotency:'cns.day3browser.'+safe(ref.context_id)+'.'+safe(sid),body});
  }

  function canonicalDimensions(raw={}){
    const aliases={problem:'problem',customer:'customer',product:'product',revenue:'revenue',business_model:'business_model',distribution:'distribution',leadership:'leadership',technology:'technology',technology_operations:'technology'};
    const out={};
    for(const [key,value] of Object.entries(raw||{})){
      const canonical=aliases[key];
      const n=number(value);
      if(canonical&&n!==null)out[canonical]=clamp(n,0,100);
    }
    const required=['revenue','customer','product','leadership','technology','distribution','problem','business_model'];
    if(required.some(key=>out[key]===undefined))throw new Error('The deterministic GalviScore does not contain all eight Business Health dimensions required for governed AI.');
    return out;
  }

  function confidenceComponents(confidence){
    const c=clamp(number(confidence)??100,0,100);
    return {required_data_completeness:c,evidence_quality:c,answer_consistency:c,corroboration:c,context_completeness:c};
  }

  function acuityFromClassification(classification){
    const value=text(classification).toLowerCase();
    if(value.includes('critical'))return {severity:3,urgency:3,continuity:3,reversibility:2,complexity:2};
    if(value.includes('strained')||value.includes('at risk'))return {severity:2,urgency:2,continuity:2,reversibility:2,complexity:2};
    if(value.includes('stable'))return {severity:1,urgency:1,continuity:1,reversibility:1,complexity:1};
    return {severity:0,urgency:0,continuity:0,reversibility:0,complexity:0};
  }

  function idempotency(scope,ref){return scope+'.'+safe(ref.context_id)+'.'+safe(session()||'session');}

  async function ensureCanonicalDay2(ref){
    if(ref.record_mode==='principal_only')throw new Error('Pre-Founder principal-only intelligence uses the dedicated Day 3 Pre-Founder QA case; the Business Health customer bridge will not fabricate venture dimensions.');
    const legacy=scoreResult();
    if(!legacy||number(legacy.galviscore_score)===null)throw new Error('The deterministic GalviScore must be completed before governed AI can enrich the paid products.');
    const dimensions=canonicalDimensions(legacy.category_scores||{});
    let state=(await api('/api/v1/day2/intake-state/'+encodeURIComponent(ref.context_id),{actor:ref.actor})).data||{};
    if(!state.triage){
      await api('/api/v1/day2/triage',{method:'POST',actor:ref.actor,idempotency:idempotency('d2triage',ref),body:{
        context_id:ref.context_id,
        acuity:acuityFromClassification(legacy.galviscore_classification),
        confidence:confidenceComponents(legacy.galviscore_confidence),
        red_flags:[],followup_round:0,
        answers:{source:'galvicare_customer_deterministic_bridge_v1',legacy_session_id:session(),classification:legacy.galviscore_classification,top_priorities:legacy.galviscore_top_priorities||'',category_scores:legacy.category_scores||{}}
      }});
    }
    if(!state.vitals){
      await api('/api/v1/day2/vitals',{method:'POST',actor:ref.actor,idempotency:idempotency('d2vitals',ref),body:{context_id:ref.context_id,dimensions,confidence:confidenceComponents(legacy.galviscore_confidence)}});
    }
    state=(await api('/api/v1/day2/intake-state/'+encodeURIComponent(ref.context_id),{actor:ref.actor})).data||{};
    if(!state.score){
      await api('/api/v1/day2/score',{method:'POST',actor:ref.actor,idempotency:idempotency('d2score',ref),body:{context_id:ref.context_id}});
      state=(await api('/api/v1/day2/intake-state/'+encodeURIComponent(ref.context_id),{actor:ref.actor})).data||{};
    }
    const canonical=number(state?.score?.overall_score);
    const visible=number(legacy.galviscore_score);
    if(canonical===null||visible===null||Math.abs(canonical-visible)>1){
      const error=new Error('Day 3 STOP: canonical Day 2 score does not match the visible deterministic GalviScore. Governed AI was not projected.');
      error.code='GV_DAY3_CUSTOMER_SCORE_MISMATCH';
      throw error;
    }
    return state;
  }

  async function reason(product,ref){
    const routes={GalviShot:['/api/v1/day3/shot','GalviShot'],GalviSight:['/api/v1/day3/sight','GalviSight'],GalviPath:['/api/v1/day3/path','GalviPath']};
    const route=routes[product];
    if(!route)throw new Error('Unsupported Day 3 customer product.');
    const response=await api(route[0],{method:'POST',actor:ref.actor,body:{context_id:ref.context_id,current_stage:route[1]}});
    const source=text(response?.data?.generation_source);
    if(!['openai_governed','stored'].includes(source))return null;
    return response;
  }

  function style(){
    if(byId('day3-governed-ai-style'))return;
    const node=document.createElement('style');node.id='day3-governed-ai-style';node.textContent='.day3-ai-card{border:1px solid #cbd5e1;background:#f8fbff;border-radius:14px;padding:18px;margin:16px 0 22px}.day3-ai-eyebrow{letter-spacing:.11em;text-transform:uppercase;font-size:12px;font-weight:800;color:#174a73}.day3-ai-card h2{margin:7px 0 8px}.day3-ai-lead{font-size:15px;line-height:1.55;color:#334155}.day3-ai-insight{background:#fff;border:1px solid #dbe5ee;border-left:4px solid #174a73;border-radius:10px;padding:14px;margin:12px 0}.day3-ai-insight h3{margin:0 0 8px;font-size:16px}.day3-ai-insight p{margin:7px 0;line-height:1.5}.day3-ai-meta{font-size:12px;color:#64748b}.day3-ai-list{padding-left:20px;line-height:1.55}.day3-ai-status{font-size:13px;color:#475569}.day3-ai-chip{display:inline-block;padding:4px 8px;border-radius:999px;background:#eaf3f8;color:#174a73;font-size:11px;font-weight:700;margin-right:6px}';document.head.appendChild(node);
  }
  function addText(parent,tag,value,className){if(!text(value))return null;const node=document.createElement(tag);if(className)node.className=className;node.textContent=value;parent.appendChild(node);return node;}
  function addLabeled(parent,label,value){if(!text(value))return;const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+' ';p.appendChild(strong);p.appendChild(document.createTextNode(text(value)));parent.appendChild(p);}
  function list(parent,items,className='day3-ai-list'){const values=(Array.isArray(items)?items:[]).map(text).filter(Boolean);if(!values.length)return;const ul=document.createElement('ul');ul.className=className;values.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.appendChild(li)});parent.appendChild(ul)}
  function card(product,title,lead){style();const id='day3-ai-'+product.toLowerCase();byId(id)?.remove();const host=product==='GalviShot'?byId('galvishot-result'):product==='GalviSight'?(byId('galvisight-result-panel')||byId('galvisight-handoff')):(byId('galvipath-result-panel')||byId('galvipath-result'));if(!host)return null;const node=document.createElement('section');node.id=id;node.className='day3-ai-card';addText(node,'div','GALVIENGINE™ | GOVERNED BUSINESS HEALTH INTELLIGENCE','day3-ai-eyebrow');addText(node,'h2',title);addText(node,'p',lead,'day3-ai-lead');host.insertBefore(node,host.firstChild);return node;}
  function metaLine(node,response){const meta=response?.meta||{};const p=document.createElement('p');p.className='day3-ai-meta';p.textContent='Evidence-grounded • '+(response?.data?.generation_source==='stored'?'Longitudinal result restored':'New governed analysis')+' • '+text(meta.model||'GalviEngine model')+' • '+text(meta.prompt_version||'versioned prompt');node.appendChild(p)}

  function renderShot(response){
    const content=response?.data?.content||{};const node=card('GalviShot','What GalviCare Understands About Your Situation','GalviCare connected the evidence in your Business Health Record to explain which conditions deserve attention first, why they matter together, and what would reduce uncertainty next.');if(!node)return;
    (content.findings||[]).forEach((finding,index)=>{const box=document.createElement('div');box.className='day3-ai-insight';addText(box,'h3',(index+1)+'. '+text(finding.statement||finding.finding_code||'Priority finding'));addLabeled(box,'What the evidence suggests:',finding.reasoning_summary);addLabeled(box,'Why this matters now:',finding.why_it_matters);addLabeled(box,'Next best move:',finding.next_step);const footer=document.createElement('div');footer.className='day3-ai-meta';footer.textContent='Severity: '+text(finding.severity||'bounded')+' • Evidence confidence: '+Math.round(clamp(number(finding.confidence)??0,0,1)*100)+'%'+(finding.hypothesis_only?' • Hypothesis — not established fact':'');box.appendChild(footer);node.appendChild(box)});metaLine(node,response);
  }
  function renderSight(response){
    const content=response?.data?.content||{};const node=card('GalviSight','Why These Symptoms May Be Happening','GalviSight moves beyond the score to connect patterns across the record, distinguish evidence from hypotheses, and show what would change the working diagnosis.');if(!node)return;addText(node,'p',content.summary,'day3-ai-lead');if((content.implications||[]).length){addText(node,'h3','What this means for your next decision');list(node,content.implications)};(content.hypotheses||[]).forEach((hypothesis,index)=>{const box=document.createElement('div');box.className='day3-ai-insight';addText(box,'h3','Hypothesis '+(index+1)+': '+text(hypothesis.statement||hypothesis.code));addLabeled(box,'Evidence confidence:',Math.round(clamp(number(hypothesis.confidence)??0,0,1)*100)+'%');if((hypothesis.what_would_change_this||[]).length){addText(box,'strong','What would change this view');list(box,hypothesis.what_would_change_this)}node.appendChild(box)});metaLine(node,response);
  }
  function renderPath(response){
    const content=response?.data?.content||{};const node=card('GalviPath','Your Personalized Business Health Care Plan','GalviPath turns the diagnosis into a bounded sequence: what to do first, what evidence to collect, when to reassess, and when the situation should escalate to human care.');if(!node)return;addLabeled(node,'Care objective:',content.objective);if((content.sequence||[]).length){addText(node,'h3','Recommended sequence');const ol=document.createElement('ol');ol.className='day3-ai-list';content.sequence.forEach(step=>{const li=document.createElement('li');li.textContent=text(step);ol.appendChild(li)});node.appendChild(ol)}if((content.evidence_required||[]).length){addText(node,'h3','Evidence to collect');list(node,content.evidence_required)}addLabeled(node,'Check-in cadence:',content.cadence);addLabeled(node,'Escalate when:',content.escalation);const chips=document.createElement('div');const owner=document.createElement('span');owner.className='day3-ai-chip';owner.textContent='Owner: '+text(content.owner);chips.appendChild(owner);const support=document.createElement('span');support.className='day3-ai-chip';support.textContent='Care level: '+text(content.support_level);chips.appendChild(support);node.appendChild(chips);metaLine(node,response);
  }
  function render(product,response){if(product==='GalviShot')renderShot(response);else if(product==='GalviSight')renderSight(response);else renderPath(response)}

  async function enrich(product){
    const legacy=scoreResult();const key=product+':'+session()+':'+JSON.stringify({score:legacy?.galviscore_score,confidence:legacy?.galviscore_confidence,dimensions:legacy?.category_scores});
    if(rendered.get(product)===key||inflight.has(key))return;
    const op=(async()=>{
      try{
        const ref=await ensureCanonicalContext();
        await ensureCanonicalDay2(ref);
        const response=await reason(product,ref);
        if(response){render(product,response);rendered.set(product,key);console.info(SIGNATURE,product,'projected',response?.data?.generation_source,response?.meta?.ai_status||'')}
      }catch(error){console.warn(SIGNATURE,product,'not projected:',error?.code||'',error?.message||error)}
    })();inflight.set(key,op);try{await op}finally{inflight.delete(key)}
  }

  function visible(node){if(!node)return false;const style=getComputedStyle(node);return !node.classList.contains('hidden')&&style.display!=='none'&&style.visibility!=='hidden'}
  function scan(){patchLegacyScoreAction();if(visible(byId('galvishot-result')))enrich('GalviShot');if(visible(byId('galvisight-result-panel')))enrich('GalviSight');if(visible(byId('galvipath-result-panel')))enrich('GalviPath')}
  function init(){patchLegacyScoreAction();scan();const observer=new MutationObserver(()=>queueMicrotask(scan));observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});let count=0;const timer=setInterval(()=>{scan();if(++count>120)clearInterval(timer)},500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.GalviCareDay3GovernedAI={enrich,ensureCanonicalContext,ensureCanonicalDay2,patchLegacyScoreAction,signature:SIGNATURE};
})();`;

export default DAY3_CUSTOMER_BRIDGE_SOURCE;
