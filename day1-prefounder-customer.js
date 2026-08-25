/* GalviCare 1.0 Day 1 customer-facing Pre-Founder pathway.
 * Customer experience contract:
 * - hidden by default
 * - visible only when organization_stage === 'Idea'
 * - no QA/test controls
 * - customer language uses Pre-Founder only
 * - Idea-stage patients are never forced to invent a company/venture name
 */
(()=>{
  'use strict';
  const SIGNATURE='Day 1 customer Pre-Founder pathway adapter.';
  const IDEA_STAGE='Idea';
  const PANEL_ID='prefounder-customer-pathway';
  const STAGE_SELECTOR='select[name="organization_stage"]';
  const VENTURE_INPUT_SELECTOR='input[name="venture_name"]';
  let tracked=false;

  function findVentureLabel(input){
    if(!input)return null;
    let node=input.previousElementSibling;
    while(node&&node.tagName!=='LABEL')node=node.previousElementSibling;
    return node?.tagName==='LABEL'?node:null;
  }

  function ensurePanel(stageSelect){
    let panel=document.getElementById(PANEL_ID);
    if(panel)return panel;
    panel=document.createElement('section');
    panel.id=PANEL_ID;
    panel.className='inclusions hidden';
    panel.setAttribute('aria-hidden','true');
    panel.setAttribute('aria-live','polite');
    panel.setAttribute('data-galvicare-pathway','pre_founder');
    panel.innerHTML=`
      <p class="eyebrow">GALVICARE™ | PRE-FOUNDER PATHWAY</p>
      <h3>You Have an Idea. Here’s What Comes Next.</h3>
      <p>You do not need to already have a company — or know all the language of entrepreneurship — to begin. GalviCare™ can meet you at the idea stage and help you understand what comes next.</p>
      <h4>What is a Founder?</h4>
      <p>A founder is the person who takes responsibility for turning a business idea into a real company. Founders identify an opportunity, shape the product or service, bring together the resources needed to begin, establish the early vision, and start building the organization.</p>
      <h4>Your Pre-Founder Pathway</h4>
      <p>Because you selected <strong>Idea</strong>, GalviCare™ recognizes that you are still preparing to build the venture itself. The Pre-Founder Pathway helps you clarify the problem you want to solve, who you want to serve, what you may build, and what you need to learn before operating as a founder. You are not expected to already have a fully formed company.</p>
      <p><strong>Where this leads:</strong> this pathway prepares you for the GalviStudio™ Founder Development Institute, where you can develop the knowledge, decisions, and early evidence needed to move from an idea toward an operating venture.</p>
    `;
    stageSelect.insertAdjacentElement('afterend',panel);
    return panel;
  }

  function updateVentureField(isIdea){
    const input=document.querySelector(VENTURE_INPUT_SELECTOR);
    if(!input)return;
    const label=findVentureLabel(input);
    if(isIdea){
      input.required=false;
      input.placeholder='Optional: name your idea if you already have one';
      input.setAttribute('aria-required','false');
      if(label){
        if(!label.dataset.operatingFounderLabel)label.dataset.operatingFounderLabel=label.innerHTML;
        label.innerHTML='Company / Venture / Idea Name <span class="small">(optional at the Idea stage)</span>';
      }
    }else{
      input.required=true;
      input.removeAttribute('placeholder');
      input.setAttribute('aria-required','true');
      if(label?.dataset.operatingFounderLabel)label.innerHTML=label.dataset.operatingFounderLabel;
    }
  }

  function update(stageSelect,panel){
    const isIdea=String(stageSelect.value||'').trim()===IDEA_STAGE;
    panel.classList.toggle('hidden',!isIdea);
    panel.setAttribute('aria-hidden',isIdea?'false':'true');
    document.body.dataset.galvicareLifecycle=isIdea?'pre_founder':'operating_venture';
    updateVentureField(isIdea);
    if(isIdea&&!tracked){
      tracked=true;
      try{
        if(typeof trackGalviEvent==='function')trackGalviEvent('prefounder_pathway_viewed',{journey_step:'prefounder_pathway',organization_stage:IDEA_STAGE});
      }catch(error){console.warn(SIGNATURE,'analytics skipped',error);}
    }
  }

  function mount(){
    const stageSelect=document.querySelector(STAGE_SELECTOR);
    if(!stageSelect)return;
    const panel=ensurePanel(stageSelect);
    update(stageSelect,panel);
    stageSelect.addEventListener('change',()=>update(stageSelect,panel));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
