/* GalviCare 1.0 Day 3 governed-AI customer bridge — QA only.
 * Critical-path purpose:
 * 1) preserve the passed deterministic GalviScore contract;
 * 2) bind governed AI to the authoritative GalviCare session and canonical BHR;
 * 3) project only accepted/stored governed intelligence into paid customer surfaces;
 * 4) never call OpenAI from the browser and never synthesize a shadow identity.
 * 5) make accepted governed intelligence the primary Shot/Sight/Path customer projection;
 *    deterministic product copy remains the safe fallback only.
 */
const DAY3_CUSTOMER_BRIDGE_SOURCE = String.raw`(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 3 governed AI customer bridge v2';
  const DAY3_BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const BRIDGE_STORE='galvicare_day3_customer_bridge_v2';
  const SESSION_HEADER='X-Galvi-Day3-Session';
  const OLD_SCORE_ACTION='get_or_generate_galviscore';
  const PRIMARY_MARKER='day3-governed-primary';
  const inflight=new Map();
  const rendered=new Map();
  let canonicalPromise=null;
  const q=(selector)=>document.querySelector(selector);
  const byId=(id)=>document.getElementById(id);
  const text=(value)=>String(value??'').trim();
  const number=(value)=>Number.isFinite(Number(value))?Number(value):null;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)));
  const session=()=>typeof window.getStoredSessionId==='function'?text(window.getStoredSessionId()):text(localStorage.getItem('galvicare_session_id')||localStorage.getItem('galvishot_session_id'));
  const scoreResult=()=>{try{return typeof window.getCachedGalviScoreResult==='function'?(window.getCachedGalviScoreResult()||{}):JSON.parse(localStorage.getItem('galviscore_last_result')||'{}')}catch{return{}}};
  const parseStore=()=>{try{return JSON.parse(localStorage.getItem(BRIDGE_STORE)||'{}')}catch{return{}}};
  const saveStore=(patch)=>{const next={...parseStore(),...patch};localStorage.setItem(BRIDGE_STORE,JSON.stringify(next));return next};
  const unique=(items)=>[...new Set((Array.isArray(items)?items:[]).map(text).filter(Boolean))];

  function patchLegacyScoreAction(){
    const current=window.callGalviCareApi;
    if(typeof current!=='function')return false;
    if(current.__day3CanonicalScoreBridge&&typeof current.__day3Original==='function')window.callGalviCareApi=current.__day3Original;
    return true;
  }

  async function api(path,{method='GET',legacySession,body}={}){
    const headers={'Accept':'application/json','Cache-Control':'no-cache','X-Correlation-Id':'day3-browser-'+crypto.randomUUID()};
    if(legacySession)headers[SESSION_HEADER]=legacySession;
    if(body!==undefined)headers['Content-Type']='application/json';
    const response=await fetch(DAY3_BASE+path,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
    let payload={};
    try{payload=await response.json()}catch{payload={success:false,error:{code:'NON_JSON',message:'Non-JSON GalviEngine response'}}}
    if(!response.ok||payload?.success===false){
      const err=new Error(payload?.error?.message||payload?.message||('GalviEngine request failed ('+response.status+')'));
      err.code=payload?.error?.code||payload?.code||'DAY3_BRIDGE_REQUEST_FAILED';err.status=response.status;err.payload=payload;throw err;
    }
    return payload;
  }

  function assertLegacyScoreContract(legacy){
    const required=['galviscore_score','category_scores'];
    const missing=required.filter(key=>key==='category_scores'?!legacy?.category_scores||typeof legacy.category_scores!=='object':legacy?.[key]===undefined||legacy?.[key]===null||legacy?.[key]==='');
    if(missing.length){const error=new Error('Day 3 STOP: deterministic GalviScore projection contract is incomplete ('+missing.join(', ')+'). Governed AI was not projected.');error.code='GV_DAY3_LEGACY_SCORE_CONTRACT';throw error;}
    return legacy;
  }

  async function ensureCanonicalContext(){
    if(canonicalPromise)return canonicalPromise;
    canonicalPromise=(async()=>{
      const sid=session();
      if(!sid)throw Object.assign(new Error('A valid GalviCare session is required before governed intelligence can run.'),{code:'GV_DAY3_SESSION_REQUIRED'});
      const legacy=assertLegacyScoreContract(scoreResult());
      const response=await api('/api/v1/day3/customer-bootstrap',{
        method:'POST',legacySession:sid,
        body:{
          legacy_session_id:sid,
          visible_score:legacy.galviscore_score,
          visible_confidence:legacy.galviscore_confidence??legacy.confidence??null,
          classification:legacy.galviscore_classification||''
        }
      });
      const data=response?.data||{};
      if(!data.context_id||!data.principal_id||!data.bmr_id)throw Object.assign(new Error('Canonical Day 3 principal/BHR context was not returned.'),{code:'GV_DAY3_CANONICAL_CONTEXT_MISSING'});
      const visible=number(legacy.galviscore_score),canonical=number(data.canonical_score);
      if(visible===null||canonical===null||Math.abs(visible-canonical)>1)throw Object.assign(new Error('Day 3 STOP: canonical score does not match the visible deterministic GalviScore.'),{code:'GV_DAY3_CUSTOMER_SCORE_MISMATCH'});
      return saveStore({
        legacy_session_id:sid,session_id:sid,context_id:data.context_id,founder_id:data.founder_id||data.principal_id,
        principal_id:data.principal_id,bmr_id:data.bmr_id,venture_id:data.venture_id,record_mode:data.record_mode,
        canonical_score:canonical,clinical_confidence:data.clinical_confidence,cumulative_followup_count:data.cumulative_followup_count,
        identity_source:data.identity_source||'authoritative_galvicare_session'
      });
    })();
    try{return await canonicalPromise;}catch(error){canonicalPromise=null;throw error;}
  }

  async function ensureCanonicalDay2(ref){
    const legacy=assertLegacyScoreContract(scoreResult());
    const visible=number(legacy.galviscore_score),canonical=number(ref?.canonical_score);
    if(visible===null||canonical===null||Math.abs(visible-canonical)>1)throw Object.assign(new Error('Day 3 STOP: canonical Day 2 score does not match the visible deterministic GalviScore.'),{code:'GV_DAY3_CUSTOMER_SCORE_MISMATCH'});
    return ref;
  }

  async function reason(product,ref){
    const routes={GalviShot:['/api/v1/day3/shot','GalviShot'],GalviSight:['/api/v1/day3/sight','GalviSight'],GalviPath:['/api/v1/day3/path','GalviPath']};
    const route=routes[product];if(!route)throw new Error('Unsupported Day 3 customer product.');
    const response=await api(route[0],{method:'POST',legacySession:ref.legacy_session_id||session(),body:{context_id:ref.context_id,current_stage:route[1]}});
    const source=text(response?.data?.generation_source);
    if(!['openai_governed','stored'].includes(source)){
      const error=new Error(response?.data?.content?.message||('GalviEngine did not return accepted governed intelligence for '+product+'.'));
      error.code=response?.status==='needs_evidence'?'GV_DAY3_NEEDS_EVIDENCE':'GV_DAY3_AI_NOT_PROJECTABLE';error.payload=response;throw error;
    }
    return response;
  }

  function style(){if(byId('day3-governed-ai-style'))return;const node=document.createElement('style');node.id='day3-governed-ai-style';node.textContent='.day3-ai-card{border:1px solid #cbd5e1;background:#f8fbff;border-radius:14px;padding:18px;margin:16px 0 22px}.day3-ai-eyebrow{letter-spacing:.11em;text-transform:uppercase;font-size:12px;font-weight:800;color:#174a73}.day3-ai-card h2{margin:7px 0 8px}.day3-ai-lead{font-size:15px;line-height:1.55;color:#334155}.day3-ai-insight{background:#fff;border:1px solid #dbe5ee;border-left:4px solid #174a73;border-radius:10px;padding:14px;margin:12px 0}.day3-ai-insight h3{margin:0 0 8px;font-size:16px}.day3-ai-insight p{margin:7px 0;line-height:1.5}.day3-ai-meta{font-size:12px;color:#64748b}.day3-ai-list{padding-left:20px;line-height:1.55}.day3-ai-chip{display:inline-block;padding:4px 8px;border-radius:999px;background:#eaf3f8;color:#174a73;font-size:11px;font-weight:700;margin-right:6px}.day3-ai-failure{border:1px solid #f0c7c7;background:#fff7f7;color:#7f1d1d;border-radius:12px;padding:14px;margin:14px 0;font-size:13px;line-height:1.45}.day3-governed-primary{position:relative}.day3-governed-primary-note{font-size:12px;color:#174a73;font-weight:700;margin:4px 0 10px}';document.head.appendChild(node)}
  function addText(parent,tag,value,className){if(!text(value))return null;const node=document.createElement(tag);if(className)node.className=className;node.textContent=value;parent.appendChild(node);return node}
  function addLabeled(parent,label,value){if(!text(value))return;const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=label+' ';p.appendChild(strong);p.appendChild(document.createTextNode(text(value)));parent.appendChild(p)}
  function list(parent,items,className='day3-ai-list'){const values=unique(items);if(!values.length)return;const ul=document.createElement('ul');ul.className=className;values.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.appendChild(li)});parent.appendChild(ul)}
  function fillPrimaryList(id,items,generationId){const host=byId(id);if(!host)return false;const values=unique(items);if(!values.length)return false;host.innerHTML='';host.dataset.day3GovernedGeneration=generationId||'accepted';values.forEach(value=>{const li=document.createElement('li');li.className=PRIMARY_MARKER;li.textContent=value;host.appendChild(li)});return true}
  function resultHost(product){return product==='GalviShot'?byId('galvishot-result'):product==='GalviSight'?(byId('galvisight-result-panel')||byId('galvisight-handoff')):(byId('galvipath-result-panel')||byId('galvipath-result'))}
  function card(product,title,lead){style();const id='day3-ai-'+product.toLowerCase();byId(id)?.remove();const host=resultHost(product);if(!host)return null;byId('day3-ai-failure-'+product.toLowerCase())?.remove();const node=document.createElement('section');node.id=id;node.className='day3-ai-card '+PRIMARY_MARKER;addText(node,'div','GALVIENGINE™ | GOVERNED BUSINESS HEALTH INTELLIGENCE','day3-ai-eyebrow');addText(node,'h2',title);addText(node,'p',lead,'day3-ai-lead');host.insertBefore(node,host.firstChild);return node}
  function projectionFailure(product,error){style();const host=resultHost(product);if(!host)return;const id='day3-ai-failure-'+product.toLowerCase();byId(id)?.remove();const node=document.createElement('div');node.id=id;node.className='day3-ai-failure';node.textContent='QA GOVERNED-AI GATE: '+product+' deterministic fallback remains available, but governed intelligence was not projected in this run. Day 3 Human E2E must not be marked PASS. '+text(error?.code||'')+' '+text(error?.message||error);host.insertBefore(node,host.firstChild)}
  function metaLine(node,response){const meta=response?.meta||{};const p=document.createElement('p');p.className='day3-ai-meta';p.textContent='Evidence-grounded • '+(response?.data?.generation_source==='stored'?'Longitudinal result restored':'New governed analysis')+' • '+text(meta.model||'GalviEngine model')+' • '+text(meta.prompt_version||'versioned prompt');node.appendChild(p)}
  function generationId(response){return text(response?.data?.generation_id||response?.data?.artifact_id||response?.meta?.provider_response_id||'accepted')}
  function invalidProjection(code,message){const error=new Error(message);error.code=code;throw error}

  function assertPrimaryProjection(product,response){
    const content=response?.data?.content||{};
    if(product==='GalviShot'){
      const findings=Array.isArray(content.findings)?content.findings:[];
      if(!findings.length||!findings.some(item=>text(item?.next_step))||!findings.some(item=>text(item?.why_it_matters)))invalidProjection('GV_DAY3_SHOT_PRIMARY_PROJECTION_INVALID','Accepted GalviShot intelligence is missing the governed finding/action/risk projection contract.');
    }else if(product==='GalviSight'){
      if(!text(content.summary))invalidProjection('GV_DAY3_SIGHT_PRIMARY_PROJECTION_INVALID','Accepted GalviSight intelligence is missing its governed interpretation summary.');
    }else{
      if(!text(content.objective)||!Array.isArray(content.sequence)||!content.sequence.map(text).filter(Boolean).length||!text(content.cadence)||!text(content.owner)||!text(content.escalation)||!text(content.support_level))invalidProjection('GV_DAY3_PATH_PRIMARY_PROJECTION_INVALID','Accepted GalviPath intelligence is missing objective/sequence/evidence/cadence/owner/escalation/support-level content.');
    }
    return content;
  }

  function renderShotPrimary(response){
    const content=assertPrimaryProjection('GalviShot',response);const findings=content.findings||[];const host=byId('galvishot-findings');const gid=generationId(response);
    if(!host)invalidProjection('GV_DAY3_SHOT_PRIMARY_HOST_MISSING','GalviShot primary findings host is unavailable.');
    host.innerHTML='';host.dataset.day3GovernedGeneration=gid;
    findings.forEach((finding,index)=>{
      const node=document.createElement('div');node.className='gshot-finding '+PRIMARY_MARKER;
      const fp=Math.round(clamp(number(finding.confidence)??0,0,1)*100);
      addText(node,'div','GalviShot Prescription '+(index+1),'gshot-finding-title');
      addLabeled(node,'Finding:',finding.statement||finding.finding_code);
      addLabeled(node,'What the evidence suggests:',finding.reasoning_summary);
      addLabeled(node,'Prescription:',finding.next_step);
      addLabeled(node,'Why This Matters:',finding.why_it_matters);
      addText(node,'p','Evidence confidence: '+fp+'%'+(finding.hypothesis_only?' • Hypothesis — not established fact':''),'small');
      host.appendChild(node);
    });
    const actions=unique(findings.map(item=>item?.next_step));
    const risks=unique(findings.map(item=>item?.why_it_matters));
    if(!fillPrimaryList('galvishot-actions',actions,gid))invalidProjection('GV_DAY3_SHOT_ACTIONS_HOST_MISSING','GalviShot governed Next Best Actions could not be projected.');
    if(!fillPrimaryList('galvishot-risks',risks,gid))invalidProjection('GV_DAY3_SHOT_RISKS_HOST_MISSING','GalviShot governed Symptom Side Effects could not be projected.');
    return content;
  }

  function findDetailSection(host,headingText){
    const wanted=text(headingText).toLowerCase();
    return [...(host?.querySelectorAll?.('.galvipath-detail-section')||[])].find(section=>text(section.querySelector('h3')?.textContent).toLowerCase()===wanted)||null;
  }
  function governedPathSection(heading,gid){const section=document.createElement('div');section.className='galvipath-detail-section '+PRIMARY_MARKER;section.dataset.day3GovernedGeneration=gid;addText(section,'h3',heading);return section}
  function replaceOrInsertPathSection(panel,heading,build){let section=findDetailSection(panel,heading);if(!section){section=governedPathSection(heading,'accepted');const firstDetail=panel.querySelector('.galvipath-detail-section');if(firstDetail)panel.insertBefore(section,firstDetail);else panel.appendChild(section)}else{section.innerHTML='';section.classList.add(PRIMARY_MARKER);addText(section,'h3',heading)}build(section);return section}

  function renderPathPrimary(response){
    const content=assertPrimaryProjection('GalviPath',response);const panel=resultHost('GalviPath');const gid=generationId(response);
    if(!panel)invalidProjection('GV_DAY3_PATH_PRIMARY_HOST_MISSING','GalviPath result panel is unavailable.');
    panel.dataset.day3GovernedGeneration=gid;
    replaceOrInsertPathSection(panel,'90 Day GalviPath™ Sequence',(section)=>{
      section.dataset.day3GovernedGeneration=gid;
      addLabeled(section,'Care objective:',content.objective);
      const note=addText(section,'p','GalviEngine governed sequence synthesized from this record and the customer’s current-stage evidence.','day3-governed-primary-note');if(note)note.classList.add(PRIMARY_MARKER);
      const ol=document.createElement('ol');ol.className='gshot-action-list '+PRIMARY_MARKER;unique(content.sequence).forEach(step=>{const li=document.createElement('li');li.textContent=step;ol.appendChild(li)});section.appendChild(ol);
      addLabeled(section,'Check-in cadence:',content.cadence);
      addLabeled(section,'Owner:',content.owner);
      addLabeled(section,'Recommended support level:',content.support_level);
      addLabeled(section,'Escalate when:',content.escalation);
    });
    replaceOrInsertPathSection(panel,'GalviLab Samples to Collect',(section)=>{
      section.dataset.day3GovernedGeneration=gid;
      const evidence=unique(content.evidence_required);
      if(evidence.length)list(section,evidence,'gshot-risk-list');else addText(section,'p','No additional evidence was requested by the accepted governed plan.','small');
    });
    return content;
  }

  function renderShot(response){renderShotPrimary(response);const node=card('GalviShot','What GalviCare Understands About Your Situation','The GalviShot prescriptions, Next Best Actions and Symptom Side Effects below are now the accepted GalviEngine synthesis of your governed Business Health evidence — not a generic deterministic template.');if(!node)return;metaLine(node,response)}
  function renderSight(response){const content=assertPrimaryProjection('GalviSight',response);const node=card('GalviSight','Why These Symptoms May Be Happening','GalviSight connects your stated situation with patterns across the record, distinguishes evidence from hypotheses, and shows what would change the working diagnosis.');if(!node)return;addText(node,'p',content.summary,'day3-ai-lead');if((content.implications||[]).length){addText(node,'h3','What this means for your next decision');list(node,content.implications)};(content.hypotheses||[]).forEach((hypothesis,index)=>{const box=document.createElement('div');box.className='day3-ai-insight';addText(box,'h3','Hypothesis '+(index+1)+': '+text(hypothesis.statement||hypothesis.code));addLabeled(box,'Evidence confidence:',Math.round(clamp(number(hypothesis.confidence)??0,0,1)*100)+'%');if((hypothesis.what_would_change_this||[]).length){addText(box,'strong','What would change this view');list(box,hypothesis.what_would_change_this)}node.appendChild(box)});metaLine(node,response)}
  function renderPath(response){renderPathPrimary(response);const node=card('GalviPath','Your Personalized Business Health Care Plan','The 90 Day GalviPath sequence below is the accepted, context-aware GalviEngine care-plan synthesis. It preserves deterministic diagnosis/acuity as governed facts while using your evidence, constraints and goals to determine what should happen next.');if(!node)return;metaLine(node,response)}
  function render(product,response){if(product==='GalviShot')renderShot(response);else if(product==='GalviSight')renderSight(response);else renderPath(response)}

  function primaryProjectionPresent(product){
    if(product==='GalviShot')return Boolean(byId('galvishot-findings')?.querySelector('.'+PRIMARY_MARKER)&&byId('galvishot-actions')?.querySelector('.'+PRIMARY_MARKER)&&byId('galvishot-risks')?.querySelector('.'+PRIMARY_MARKER));
    if(product==='GalviSight')return Boolean(byId('day3-ai-galvisight'));
    const panel=resultHost('GalviPath');return Boolean(findDetailSection(panel,'90 Day GalviPath™ Sequence')?.classList.contains(PRIMARY_MARKER));
  }

  async function enrich(product){
    const legacy=scoreResult();const key=product+':'+session()+':'+JSON.stringify({score:legacy?.galviscore_score,confidence:legacy?.galviscore_confidence,dimensions:legacy?.category_scores});
    if(rendered.get(product)===key&&primaryProjectionPresent(product))return;
    if(inflight.has(key))return;
    const op=(async()=>{try{const ref=await ensureCanonicalContext();await ensureCanonicalDay2(ref);const response=await reason(product,ref);render(product,response);rendered.set(product,key);console.info(SIGNATURE,product,'primary governed projection',response?.data?.generation_source,response?.meta?.ai_status||'',ref.identity_source)}catch(error){projectionFailure(product,error);console.warn(SIGNATURE,product,'not projected:',error?.code||'',error?.message||error)}})();
    inflight.set(key,op);try{await op}finally{inflight.delete(key)}
  }

  function visible(node){if(!node)return false;const s=getComputedStyle(node);return !node.classList.contains('hidden')&&s.display!=='none'&&s.visibility!=='hidden'}
  function scan(){patchLegacyScoreAction();if(visible(byId('galvishot-result')))enrich('GalviShot');if(visible(byId('galvisight-result-panel')))enrich('GalviSight');if(visible(byId('galvipath-result-panel')))enrich('GalviPath')}
  function init(){patchLegacyScoreAction();scan();const observer=new MutationObserver(()=>queueMicrotask(scan));observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});let count=0;const timer=setInterval(()=>{scan();if(++count>240)clearInterval(timer)},500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.GalviCareDay3GovernedAI={enrich,ensureCanonicalContext,ensureCanonicalDay2,patchLegacyScoreAction,assertLegacyScoreContract,assertPrimaryProjection,renderShotPrimary,renderPathPrimary,primaryProjectionPresent,signature:SIGNATURE,sessionHeader:SESSION_HEADER};
})();`;

export default DAY3_CUSTOMER_BRIDGE_SOURCE;
