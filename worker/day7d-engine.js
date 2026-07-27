import legacyWorker from './worker.js';

export const DAY7D_RULES_VERSION = 'galviengine_customer_intelligence_v0_5_1';
export const DAY7D_QUESTION_VERSION = 'clinical_followups_v0_5_1';
export const DAY7D_CONTENT_VERSION = 'galvicare_day7d_customer_intelligence_v0_5_2';
export const DAY7D_SCHEMA_VERSION = 'day7d_dedicated_tables_v1';
export const DAY7D_RELEASE_CONTRACT = 'day7d_progressive_customer_intelligence_v1';

const LABELS = Object.freeze({
  problem: 'Problem', customer: 'Customer', product: 'Product', revenue: 'Revenue',
  business_model: 'Business Model', distribution: 'Distribution', leadership: 'Leadership',
  technology_operations: 'Technology / Operations'
});
const WEIGHTS = Object.freeze({
  problem: .12, customer: .15, product: .15, revenue: .16,
  business_model: .12, distribution: .10, leadership: .10, technology_operations: .10
});
const QDIM = Object.freeze({
  q01_business_clarity:'business_model', q02_stage_signal:'business_model', q03_real_problem:'problem',
  q04_ideal_customer:'customer', q05_attract_customers:'distribution', q06_customer_conversations:'distribution',
  q07_predictable_revenue:'revenue', q08_revenue_growth_confidence:'revenue', q09_revenue_driver_clarity:'revenue',
  q10_customer_satisfaction:'customer', q11_feedback_improvement:'product', q12_organized_operations:'technology_operations',
  q13_founder_dependency:'business_model', q14_systems_support_growth:'technology_operations',
  q15_technology_effectiveness:'technology_operations', q16_ai_readiness:'technology_operations',
  q17_leadership_confidence:'leadership', q18_vision_clarity:'leadership', q19_decision_information:'leadership',
  q20_execution_action:'leadership'
});
const CONTEXT = Object.freeze([
  ['highest_impact_area','priority.highest_impact_area','Founder-perceived highest-impact area'],
  ['biggest_challenge','open_text.biggest_challenge','Presenting challenge'],
  ['one_30_day_problem','open_text.one_30_day_problem','Immediate 30-day target'],
  ['growth_blocker','open_text.growth_blocker','Suspected growth constraint'],
  ['feels_broken','open_text.feels_broken','Operational symptom'],
  ['keeps_up_at_night','open_text.keeps_up_at_night','Business risk / urgency concern']
]);

const STAGE_FOLLOWUPS = Object.freeze({
  GalviShot: {
    customer:[['CI_SHOT_CUSTOMER_01','Which customer segment is experiencing this problem most acutely right now?'],['CI_SHOT_CUSTOMER_02','What direct evidence shows that customer will act or pay to solve it?']],
    revenue:[['CI_SHOT_REVENUE_01','Which revenue or funding signal is weakest right now: leads, conversion, pricing, retention, cash flow, or funding?'],['CI_SHOT_REVENUE_02','What have you already tried to improve that signal, and what happened?']],
    product:[['CI_SHOT_PRODUCT_01','What customer outcome should the product or service reliably create?'],['CI_SHOT_PRODUCT_02','What evidence shows customers consistently experience that outcome today?']],
    distribution:[['CI_SHOT_DISTRIBUTION_01','Which channel currently produces the most qualified customer conversations?'],['CI_SHOT_DISTRIBUTION_02','What evidence shows that channel can repeat rather than depend on one-off outreach?']],
    problem:[['CI_SHOT_PROBLEM_01','What direct evidence shows this customer problem is urgent enough to act on now?']],
    business_model:[['CI_SHOT_MODEL_01','Which business-model assumption creates the greatest risk if it proves false?']],
    leadership:[['CI_SHOT_LEADERSHIP_01','Which decision or responsibility is consuming the most leadership capacity right now?']],
    technology_operations:[['CI_SHOT_OPERATIONS_01','Which operating process breaks most often or creates the greatest delivery risk?']],
    general:[['CI_SHOT_GENERAL_01','What business outcome matters most during the next 90 days, and how will you know it improved?']]
  },
  GalviSight: {
    customer:[['CI_SIGHT_CUSTOMER_01','What customer behavior would prove the diagnosis is correct?']],
    revenue:[['CI_SIGHT_REVENUE_01','Which measurable commercial signal should improve first if the prescription works?']],
    product:[['CI_SIGHT_PRODUCT_01','What single product or service change can test this diagnosis with the least wasted effort?']],
    distribution:[['CI_SIGHT_DISTRIBUTION_01','Which qualified-demand signal should be monitored weekly to prove the prescription is working?']],
    problem:[['CI_SIGHT_PROBLEM_01','What evidence would disprove the current problem hypothesis?']],
    business_model:[['CI_SIGHT_MODEL_01','What smallest test can validate the highest-risk business-model assumption?']],
    leadership:[['CI_SIGHT_LEADERSHIP_01','Who owns the first decision required to act on this prescription?']],
    technology_operations:[['CI_SIGHT_OPERATIONS_01','What operating constraint must be removed before this prescription can be executed reliably?']],
    general:[['CI_SIGHT_GENERAL_01','What evidence should GalviCare monitor to determine whether this prescription is working?']]
  },
  GalviPath: {
    customer:[['CI_PATH_CUSTOMER_01','Which customer proof must exist before you expand the treatment beyond the first 30 days?']],
    revenue:[['CI_PATH_REVENUE_01','What 30-day revenue or funding target is realistic enough to guide the first treatment cycle?']],
    product:[['CI_PATH_PRODUCT_01','What product or service milestone must be reached before the next treatment phase begins?']],
    distribution:[['CI_PATH_DISTRIBUTION_01','Which channel will receive focused effort during the first 30 days, and what weekly signal will determine whether to continue?']],
    problem:[['CI_PATH_PROBLEM_01','What customer evidence must be collected in the first 30 days to confirm the problem remains urgent?']],
    business_model:[['CI_PATH_MODEL_01','Which model assumption must be resolved before increasing fixed cost or operating complexity?']],
    leadership:[['CI_PATH_LEADERSHIP_01','What leadership commitment or decision cadence can realistically be sustained for the next 90 days?']],
    technology_operations:[['CI_PATH_OPERATIONS_01','Which process or system must be stabilized first so the treatment plan can be sustained?']],
    general:[['CI_PATH_GENERAL_01','What constraint could prevent you from executing the first 30 days of this treatment plan?']]
  }
});

const txt = v => String(v ?? '').trim();
const low = v => txt(v).toLowerCase();
const label = d => LABELS[d] || d || 'business';
const now = () => new Date().toISOString();
const sidFrom = p => txt(p?.session_id || p?.session?.session_id);
const at = (o,path) => path.split('.').reduce((a,k)=>a && Object.prototype.hasOwnProperty.call(a,k) ? a[k] : undefined,o);
const first = (db,sql,...p) => db.prepare(sql).bind(...p).first();
const run = (db,sql,...p) => db.prepare(sql).bind(...p).run();
const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{
  'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Cache-Control':'no-store, no-cache, must-revalidate',
  'X-Galvi-Day7D-Rules':DAY7D_RULES_VERSION
}});

export function extractQualitativeContext(payload={}) {
  const out={};
  for(const [key,path] of CONTEXT) out[key]=txt(at(payload,path));
  return out;
}

export function normalizeContextDimension(value) {
  const t=low(value);
  if(!t) return null;
  if(/customer growth|ideal customer|customer|audience|buyer|stakeholder|retention/.test(t)) return 'customer';
  if(/product marketing|marketing|channel|distribution|demand|acquisition|go[- ]?to[- ]?market|gtm/.test(t)) return 'distribution';
  if(/product|service strategy|offer|offering|feature|solution/.test(t)) return 'product';
  if(/revenue|funding|cash|pricing|conversion|sales/.test(t)) return 'revenue';
  if(/problem|need|pain|urgency/.test(t)) return 'problem';
  if(/business model|model|stage|founder dependency/.test(t)) return 'business_model';
  if(/leadership|decision|team|capacity|priority/.test(t)) return 'leadership';
  if(/operation|process|system|technology|workflow|delivery|automation/.test(t)) return 'technology_operations';
  return null;
}

export function scoreRows(rows=[]) {
  const buckets=Object.fromEntries(Object.keys(LABELS).map(d=>[d,[]]));
  for(const r of rows){
    const d=r.dimension||QDIM[r.question_id], a=Number(r.answer_number);
    if(!d||!buckets[d]||!Number.isInteger(a)||a<1||a>5) continue;
    buckets[d].push(Math.round(((a-1)/4)*100));
  }
  const dimension_scores={};
  for(const [d,values] of Object.entries(buckets)) dimension_scores[d]=values.length?Math.round(values.reduce((a,x)=>a+x,0)/values.length):0;
  return {score:Math.round(Object.entries(WEIGHTS).reduce((s,[d,w])=>s+dimension_scores[d]*w,0)),dimension_scores};
}

export function reconcile(context={},scores={},answeredCount=0) {
  const ranked=Object.entries(scores).sort((a,b)=>Number(a[1])-Number(b[1]));
  const weakest=ranked[0]||[null,null], second=ranked[1]||[null,null];
  const stated={
    highest_impact_area:normalizeContextDimension(context.highest_impact_area), biggest_challenge:normalizeContextDimension(context.biggest_challenge),
    one_30_day_problem:normalizeContextDimension(context.one_30_day_problem), growth_blocker:normalizeContextDimension(context.growth_blocker),
    feels_broken:normalizeContextDimension(context.feels_broken), keeps_up_at_night:normalizeContextDimension(context.keeps_up_at_night)
  };
  const primary=stated.biggest_challenge||stated.highest_impact_area||stated.one_30_day_problem;
  const observations=[];
  if(primary&&weakest[0]){
    const aligned=primary===weakest[0]||primary===second[0];
    const gap=Math.abs(Number(scores[primary]??100)-Number(weakest[1]??100));
    observations.push({
      observation_code:aligned?'OBS_STATED_OBJECTIVE_ALIGNMENT':'OBS_STATED_OBJECTIVE_DIVERGENCE',
      type:aligned?'alignment':'divergence',stated_dimension:primary,observed_dimension:weakest[0],material:aligned||gap>=15,
      evidence_refs:['triage.biggest_challenge',`score.${weakest[0]}`],
      statement:aligned?`The founder's stated concern aligns with the objective ${label(weakest[0])} health signal.`:`The founder frames the priority as ${label(primary)}, while the lowest objective health signal is ${label(weakest[0])}.`
    });
  }
  const mapped=Object.values(stated).filter(Boolean);
  const agreement=mapped.filter(d=>d===weakest[0]||d===second[0]).length;
  const complete=Object.values(context).filter(v=>txt(v)).length;
  const confidence=Math.max(0,Math.min(100,70+Math.min(18,complete*3)+Math.min(12,agreement*4)+Math.min(12,answeredCount*3)-(observations.some(o=>o.type==='divergence'&&o.material)?10:0)));
  return {weakest_dimension:weakest[0],second_weakest_dimension:second[0],stated,observations,confidence};
}

export function chooseFollowups(r,existing={},product='GalviShot') {
  const bank=STAGE_FOLLOWUPS[product]||STAGE_FOLLOWUPS.GalviShot;
  const divergence=r.observations?.some(o=>o.type==='divergence'&&o.material);
  let count=0;
  if(r.confidence<60) count=3;
  else if(r.confidence<80) count=2;
  else if(divergence) count=1;
  if(!count) return [];
  const dims=[r.weakest_dimension,r.stated?.biggest_challenge,'general'].filter(Boolean);
  const candidates=[];
  for(const d of dims) for(const q of (bank[d]||bank.general)) candidates.push(q);
  const seen=new Set(),out=[];
  for(const [qid,text] of candidates){
    if(seen.has(qid)||txt(existing[qid])) continue;
    seen.add(qid);
    out.push({question_id:qid,question_code:qid,question_text:text,product,question_version:DAY7D_QUESTION_VERSION,confidence_impact:5});
    if(out.length>=count) break;
  }
  return out;
}

async function evidenceVersion(db,sid){
  const r=await first(db,'SELECT evidence_version FROM clinical_evidence_versions WHERE session_id=?',sid);
  return Number(r?.evidence_version||0);
}
async function bump(db,sid,reason){
  await run(db,`INSERT INTO clinical_evidence_versions(session_id,evidence_version,last_reason,updated_at) VALUES(?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET evidence_version=clinical_evidence_versions.evidence_version+1,last_reason=excluded.last_reason,updated_at=excluded.updated_at`,sid,1,reason,now());
  return evidenceVersion(db,sid);
}

export async function persistContext(db,sid,payload){
  const context=extractQualitativeContext(payload),ts=now();
  let changed=false;
  for(const [key,,role] of CONTEXT){
    const value=txt(context[key]);
    if(!value) continue;
    const old=await first(db,'SELECT raw_value FROM day7d_context_evidence WHERE session_id=? AND evidence_key=?',sid,key);
    if(txt(old?.raw_value)===value) continue;
    await run(db,`INSERT INTO day7d_context_evidence(evidence_id,session_id,product,stage,evidence_key,evidence_role,raw_value,normalized_value,rules_version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,evidence_key) DO UPDATE SET raw_value=excluded.raw_value,normalized_value=excluded.normalized_value,evidence_role=excluded.evidence_role,rules_version=excluded.rules_version,updated_at=excluded.updated_at`,`evidence_${sid}_${key}`,sid,'GalviTriage','GalviTriage',key,role,value,normalizeContextDimension(value)||'',DAY7D_RULES_VERSION,ts,ts);
    changed=true;
  }
  if(changed) await bump(db,sid,'triage_context');
  return context;
}

async function loadContext(db,sid){
  const rows=await db.prepare(`SELECT evidence_key,raw_value FROM day7d_context_evidence WHERE session_id=? AND product='GalviTriage'`).bind(sid).all();
  return (rows.results||[]).reduce((a,r)=>(a[r.evidence_key]=r.raw_value,a),{});
}
async function loadFollowups(db,sid){
  const rows=await db.prepare('SELECT product,question_id,question_text,answer,confidence_impact,updated_at FROM clinical_followups WHERE session_id=? ORDER BY updated_at,question_id').bind(sid).all();
  const all={},byProduct={};
  for(const row of rows.results||[]){
    if(!txt(row.answer)) continue;
    all[row.question_id]=row.answer;
    byProduct[row.product] ||= {};
    byProduct[row.product][row.question_id]=row.answer;
  }
  return {all,byProduct,rows:(rows.results||[]).filter(r=>txt(r.answer))};
}
async function loadScore(db,sid){
  const row=await first(db,`SELECT result_json FROM product_results WHERE session_id=? AND product='GalviScore' LIMIT 1`,sid);
  if(row?.result_json){try{const p=JSON.parse(row.result_json);if(p?.dimension_scores)return{score:Number(p.score??p.galviscore_score??0),dimension_scores:p.dimension_scores};if(p?.category_scores)return{score:Number(p.score??p.galviscore_score??0),dimension_scores:p.category_scores};}catch{}}
  const rows=await db.prepare(`SELECT question_id,dimension,answer_number FROM assessment_responses WHERE session_id=? AND product='GalviTriage'`).bind(sid).all();
  return scoreRows(rows.results||[]);
}

export async function clinicalFile(db,sid){
  const [context,score,followups,ev]=await Promise.all([loadContext(db,sid),loadScore(db,sid),loadFollowups(db,sid),evidenceVersion(db,sid)]);
  return {session_id:sid,context,score,followups:followups.all,followups_by_product:followups.byProduct,followup_rows:followups.rows,evidence_version:ev,reconciliation:reconcile(context,score.dimension_scores||{},followups.rows.length)};
}

function followupEvidence(file,product=null){
  return (file.followup_rows||[]).filter(r=>!product||r.product===product).map(r=>({
    source_id:`followup_${r.product}_${r.question_id}`,source_type:'clinical_followup',source_field:r.question_id,
    display_value:txt(r.answer),question_text:txt(r.question_text),product:r.product
  }));
}
function followupSummary(file,product=null){
  const rows=followupEvidence(file,product);
  if(!rows.length) return '';
  return rows.map(r=>`${r.question_text}: ${r.display_value}`).join(' ');
}

async function saveObservation(db,sid,o){
  await run(db,`INSERT INTO day7d_observations(observation_id,session_id,observation_code,observation_type,statement,evidence_refs_json,rules_version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id,observation_code) DO UPDATE SET observation_type=excluded.observation_type,statement=excluded.statement,evidence_refs_json=excluded.evidence_refs_json,rules_version=excluded.rules_version,updated_at=excluded.updated_at`,`observation_${sid}_${o.observation_code}`,sid,o.observation_code,o.type,o.statement,JSON.stringify(o.evidence_refs||[]),DAY7D_RULES_VERSION,now(),now());
}
async function saveResult(db,sid,product,result){
  const existing=await first(db,'SELECT result_id FROM product_results WHERE session_id=? AND product=? LIMIT 1',sid,product),ts=now(),band=result.confidence>=90?'high':result.confidence>=80?'standard':'provisional';
  if(existing?.result_id) await run(db,'UPDATE product_results SET status=?,confidence=?,confidence_band=?,result_json=?,generation_source=?,rules_version=?,content_version=?,updated_at=? WHERE result_id=?','generated',result.confidence||0,band,JSON.stringify(result),'rules',DAY7D_RULES_VERSION,DAY7D_CONTENT_VERSION,ts,existing.result_id);
  else await run(db,'INSERT INTO product_results(result_id,session_id,product,status,confidence,confidence_band,result_json,generation_source,rules_version,content_version,generated_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',`result_${sid}_${product}`,sid,product,'generated',result.confidence||0,band,JSON.stringify(result),'rules',DAY7D_RULES_VERSION,DAY7D_CONTENT_VERSION,ts,ts);
  return result;
}
async function currentDay7DResult(db,sid,product,ev){
  const row=await first(db,'SELECT result_json,rules_version FROM product_results WHERE session_id=? AND product=? LIMIT 1',sid,product);
  if(!row?.result_json||row.rules_version!==DAY7D_RULES_VERSION) return null;
  try{const r=JSON.parse(row.result_json);return Number(r.evidence_version??-1)===Number(ev)?r:null;}catch{return null;}
}

async function saveFollowup(db,sid,product,a){
  const qid=txt(a.question_id||a.question_code).slice(0,80),qtext=txt(a.question_text||qid).slice(0,500),answer=txt(a.answer||a.answer_text).slice(0,1000),impact=Number(a.confidence_impact||5),ts=now();
  if(!qid||!answer) return {changed:false,evidence_version:await evidenceVersion(db,sid)};
  const old=await first(db,'SELECT followup_id,answer FROM clinical_followups WHERE session_id=? AND product=? AND question_id=? LIMIT 1',sid,product,qid);
  if(old?.followup_id&&txt(old.answer)===answer) return {changed:false,evidence_version:await evidenceVersion(db,sid)};
  if(old?.followup_id) await run(db,'UPDATE clinical_followups SET question_text=?,answer=?,confidence_impact=?,updated_at=? WHERE followup_id=?',qtext,answer,impact,ts,old.followup_id);
  else await run(db,'INSERT INTO clinical_followups(followup_id,session_id,current_stage,product,question_id,question_text,answer,confidence_impact,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',`followup_${sid}_${product}_${qid}`,sid,product,product,qid,qtext,answer,impact,ts,ts);
  return {changed:true,evidence_version:await bump(db,sid,`${product}:${qid}`)};
}

async function entitled(db,sid,product){
  const e=await first(db,'SELECT entitlement_status FROM entitlements WHERE session_id=? AND product=? LIMIT 1',sid,product);
  if(e&&['active','paid','granted','test_override'].includes(low(e.entitlement_status))) return true;
  const p=await first(db,'SELECT payment_status FROM payments WHERE session_id=? AND product=? LIMIT 1',sid,product);
  return Boolean(p&&['paid','succeeded','complete'].includes(low(p.payment_status)));
}

function shotResult(f){
  const ranked=Object.entries(f.score.dimension_scores||{}).sort((a,b)=>a[1]-b[1]);
  const shotFollowups=followupEvidence(f,'GalviShot');
  let findings=ranked.slice(0,3).map(([d,v],i)=>({
    rank:i+1,finding_code:`FIND_${d.toUpperCase()}_HEALTH_GAP`,family:'Health constraint',domain:d,
    title:`${label(d)} is a priority health constraint`,
    finding_text:`GalviCare identified that ${label(d)} is currently ${v}/100 and requires focused evidence-based improvement.`,
    evidence:[{source_id:`evidence_${d}`,source_type:'assessment_response',source_field:d,display_value:`${label(d)}: ${v}/100`,used_for:`FIND_${d.toUpperCase()}_HEALTH_GAP`},...shotFollowups],
    confidence:f.reconciliation.confidence,confidence_language:'supported clinical signal with defined limits',
    risk:`Expanding activity before ${label(d)} improves may compound the current constraint.`,
    action:`Strengthen ${label(d)} evidence before expanding scope.`,why_this_matters:`${label(d)} is one of the weakest objective business-health signals.`
  }));
  const div=f.reconciliation.observations.find(o=>o.type==='divergence'&&o.material);
  if(div){
    findings.unshift({rank:1,finding_code:'FIND_STATED_OBJECTIVE_DIVERGENCE',family:'Cross-evidence contradiction',domain:div.observed_dimension,title:'The stated problem and objective health signal are not fully aligned',finding_text:div.statement,evidence:[{source_id:'evidence_biggest_challenge',source_type:'qualitative_context',source_field:'biggest_challenge',display_value:f.context.biggest_challenge||'',used_for:'FIND_STATED_OBJECTIVE_DIVERGENCE'},{source_id:`evidence_${div.observed_dimension}`,source_type:'assessment_response',source_field:div.observed_dimension,display_value:`${label(div.observed_dimension)}: ${f.score.dimension_scores[div.observed_dimension]}/100`,used_for:'FIND_STATED_OBJECTIVE_DIVERGENCE'},...shotFollowups],confidence:f.reconciliation.confidence,confidence_language:'supported hypothesis requiring reconciliation',risk:'Investing directly in the stated solution may not improve the lowest objective health signal.',action:`Validate the ${label(div.observed_dimension)} constraint before increasing investment in ${label(div.stated_dimension)}.`,why_this_matters:'This prevents founder preference from being mistaken for diagnosis.'});
    findings=findings.slice(0,4).map((x,i)=>({...x,rank:i+1}));
  }
  const extra=followupSummary(f,'GalviShot');
  return {session_id:f.session_id,product:'GalviShot',status:'ok',rules_version:DAY7D_RULES_VERSION,content_version:DAY7D_CONTENT_VERSION,generation_source:'rules',evidence_version:f.evidence_version,confidence:f.reconciliation.confidence,confidence_band:f.reconciliation.confidence>=90?'high':f.reconciliation.confidence>=80?'standard':'provisional',executive_summary:(div?`${div.statement} GalviShot treats this difference as a hypothesis to reconcile rather than assuming the founder's framing is the diagnosis.`:`The founder's stated concern is broadly consistent with the objective health pattern.`)+(extra?` Follow-up evidence further clarifies the diagnosis: ${extra}`:''),findings,strategic_risks:[...new Set(findings.map(x=>x.risk))].slice(0,3),recommended_actions:[...new Set(findings.map(x=>x.action))].slice(0,3),assumptions:['This result is constrained to stored GalviCare assessment, qualitative context, and saved follow-up evidence.'],customer_intelligence_evidence:shotFollowups,next_step:{label:'Continue to GalviSight',route:'GalviSight Paywall'}};
}

function sightResult(f,shot){
  const div=f.reconciliation.observations.find(o=>o.type==='divergence'&&o.material),w=f.reconciliation.weakest_dimension,findings=shot.findings||[],top=findings[0]||{};
  const sightFollowups=followupEvidence(f,'GalviSight');
  const cumulative=followupEvidence(f);
  const extra=followupSummary(f,'GalviSight');
  return {session_id:f.session_id,product:'GalviSight',status:'ready',rules_version:DAY7D_RULES_VERSION,content_version:DAY7D_CONTENT_VERSION,generation_source:'rules',evidence_version:f.evidence_version,confidence:f.reconciliation.confidence,confidence_band:f.reconciliation.confidence>=90?'high':f.reconciliation.confidence>=80?'standard':'provisional',interpretation:(div?`${div.statement} Investing directly in the stated solution may not improve the lowest objective health signal. The current root-cause hypothesis is that ${label(w)} evidence should be strengthened first or the contradiction resolved with targeted evidence.`:`The founder's stated concern and the objective health pattern point in the same general direction. Strengthen ${label(w)} before broadening execution.`)+(extra?` GalviSight also incorporates the founder's prescription evidence: ${extra}`:''),hypotheses:[{label:'Customer intelligence interpretation',finding_code:top.finding_code||'DAY7D_CONTEXT',statement:div?.statement||`The current record supports ${label(w)} as the priority constraint.`,support:[...(top.evidence||[]),...sightFollowups]}],risks:[div?'Scaling activity against an unverified diagnosis may consume resources without improving the underlying health signal.':`Expanding scope before ${label(w)} improves may dilute execution.`],opportunities:[{finding_code:top.finding_code||'DAY7D_CONTEXT',statement:`Use the next evidence cycle to improve ${label(w)} and compare the result against the founder's stated priority.`}],urgency:{label:Number(f.score.score)<60?'Immediate':Number(f.score.score)<80?'Priority':'Monitor',horizon:Number(f.score.score)<60?'Act within 7 days':Number(f.score.score)<80?'Act within 30 days':'Address within 90 days',reason:`${label(w)} is the lowest objective health signal in the current record.`},assumptions:['Interpretation is constrained to cumulative GalviCare evidence and saved follow-ups.'],recommended_actions:[{priority:1,finding_code:top.finding_code||'DAY7D_CONTEXT',action:`Strengthen ${label(w)} evidence before expanding the founder's stated solution.`,why:'The action treats the lowest objective health constraint first.',evidence_refs:[...(top.evidence||[]).map(e=>e.source_id),...sightFollowups.map(e=>e.source_id)]}],evidence_trace:[...findings.flatMap(x=>(x.evidence||[]).map(e=>({finding_code:x.finding_code,title:x.title,...e}))),...cumulative],customer_intelligence_evidence:cumulative,next_step:{label:'Continue to GalviPath',route:'GalviPath Paywall'}};
}

function pathResult(f,shot,sight){
  const w=f.reconciliation.weakest_dimension,target=txt(f.context.one_30_day_problem)||`improve ${label(w)}`,td=normalizeContextDimension(target),conflict=td&&w&&td!==w;
  const pathFollowups=followupEvidence(f,'GalviPath');
  const cumulative=followupEvidence(f);
  const extra=followupSummary(f,'GalviPath');
  const firstAction=conflict?`Validate the ${label(w)} constraint and define one measurable recovery signal before increasing investment in ${target}.`:`Focus the first treatment cycle on ${target} while measuring the ${label(w)} signal.`;
  return {session_id:f.session_id,product:'GalviPath',status:'ready',rules_version:DAY7D_RULES_VERSION,content_version:DAY7D_CONTENT_VERSION,generation_source:'rules',evidence_version:f.evidence_version,confidence:f.reconciliation.confidence,confidence_band:f.reconciliation.confidence>=90?'high':f.reconciliation.confidence>=80?'standard':'provisional',primary_pathway:`${label(w)} Readiness`,primary_pathway_count:1,clinical_rationale:(conflict?`The founder's 30-day target maps to ${label(td)}, while the lowest objective signal is ${label(w)}. This plan sequences the objective constraint first without discarding the founder's goal.`:`The founder's 30-day priority is sufficiently aligned with the objective health pattern to support a direct treatment sequence.`)+(extra?` Treatment sequencing also incorporates the founder's execution evidence: ${extra}`:''),sequence:[{window:'Days 1 to 14',order:1,actions:[firstAction,...pathFollowups.slice(0,1).map(e=>`Use this founder-provided constraint when sequencing the first treatment cycle: ${e.display_value}`)]},{window:'Days 15 to 30',order:2,actions:[`Compare the first ${label(w)} evidence against the stated 30-day target: ${target}.`]},{window:'Days 31 to 60',order:3,actions:['Standardize the action producing the strongest measurable recovery signal.']},{window:'Days 61 to 90',order:4,actions:['Scale only the validated treatment and reassess GalviScore against the original founder hypothesis.']}],evidence_to_collect:[`Current baseline for ${label(w)}.`,`Evidence showing whether the founder's stated target (${target}) is addressing the same underlying constraint.`,...pathFollowups.map(e=>`Track founder constraint: ${e.display_value}`)],galvilab_samples:[`Current ${label(w)} baseline.`],galvicare_markers:[`${label(w)} health signal`,`30-day target: ${target}`],recovery_indicators:[`${label(w)} improves without creating a new constraint.`],operating_cadence:`Initial GalviPath Check Up Discussion Topic: determine whether ${label(w)} is improving and whether ${target} should remain the next treatment priority.`,support_recommendation:'Book GalviClinic when live Business Physician care would provide additional reassurance, decision support, accountability, or intervention.',escalation_triggers:['The new evidence materially changes the diagnosis.','Multiple business symptoms worsen at the same time.','The 30-day target fails to improve the objective health signal.'],assumptions:[...(sight.assumptions||[]),'GalviPath sequences care from the cumulative Day 7D Founder Health Record.'],evidence_trace:[...(sight.evidence_trace||[]),...cumulative],source_references:[...(sight.evidence_trace||[]).map(e=>e.source_id).filter(Boolean),...cumulative.map(e=>e.source_id)],customer_intelligence_evidence:cumulative,ctas:{print:'Print GalviPath',checkup:'GalviPath Check Up',clinic:'Book GalviClinic'}};
}

async function evaluate(db,sid,product){
  const f=await clinicalFile(db,sid);
  for(const o of f.reconciliation.observations) await saveObservation(db,sid,o);
  const existing=f.followups_by_product?.[product]||{};
  const qs=chooseFollowups(f.reconciliation,existing,product);
  return qs.length?{success:true,status:'needs_followup',session_id:sid,product,confidence:f.reconciliation.confidence,evidence_version:f.evidence_version,rules_version:DAY7D_RULES_VERSION,followups:qs,followup_questions:qs}:{success:true,status:'ok',session_id:sid,product,confidence:f.reconciliation.confidence,evidence_version:f.evidence_version,rules_version:DAY7D_RULES_VERSION,followups:[],followup_questions:[]};
}

async function getOrCreate(db,sid,product){
  const f=await clinicalFile(db,sid);
  const cached=await currentDay7DResult(db,sid,product,f.evidence_version);
  if(cached) return {success:true,status:'ok',stored:true,session_id:sid,product,evidence_version:f.evidence_version,result:cached,data:cached};

  const existing=f.followups_by_product?.[product]||{};
  const outstanding=chooseFollowups(f.reconciliation,existing,product);
  if(outstanding.length){
    return {success:true,status:'needs_followup',session_id:sid,product,confidence:f.reconciliation.confidence,evidence_version:f.evidence_version,rules_version:DAY7D_RULES_VERSION,followups:outstanding,followup_questions:outstanding};
  }

  let result;
  if(product==='GalviShot') result=shotResult(f);
  else {
    const sr=await getOrCreate(db,sid,'GalviShot');
    const shot=sr.result||sr.data;
    if(!shot) return sr;
    if(product==='GalviSight') result=sightResult(f,shot);
    else {
      const ir=await getOrCreate(db,sid,'GalviSight');
      const sight=ir.result||ir.data;
      if(!sight) return ir;
      result=pathResult(f,shot,sight);
    }
  }
  result={...result,intelligence_status:'complete',followup_questions:[]};
  await saveResult(db,sid,product,result);
  return {success:true,status:'ok',stored:false,session_id:sid,product,evidence_version:f.evidence_version,result,data:result};
}

const ACTION_PRODUCT=Object.freeze({
  evaluate_galvishot:'GalviShot',save_galvishot_followup:'GalviShot',get_or_create_galvishot:'GalviShot',get_galvishot:'GalviShot',generate_galvishot:'GalviShot',
  evaluate_galvisight_readiness:'GalviSight',evaluate_galvisight:'GalviSight',save_galvisight_followup:'GalviSight',get_or_generate_galvisight:'GalviSight',
  evaluate_galvipath:'GalviPath',save_galvipath_followup:'GalviPath',get_or_generate_galvipath:'GalviPath',get_galvipath:'GalviPath'
});
const GENERATE=new Set(['get_or_create_galvishot','get_galvishot','generate_galvishot','get_or_generate_galvisight','get_or_generate_galvipath','get_galvipath']);
const SAVE=new Set(['save_galvishot_followup','save_galvisight_followup','save_galvipath_followup']);
const EVAL=new Set(['evaluate_galvishot','evaluate_galvisight_readiness','evaluate_galvisight','evaluate_galvipath']);

export default {
  async fetch(request,env,ctx){
    if(request.method==='OPTIONS') return legacyWorker.fetch(request,env,ctx);
    const url=new URL(request.url);
    if(request.method!=='POST'||url.pathname!=='/api') return legacyWorker.fetch(request,env,ctx);
    let payload;
    try{payload=await request.clone().json();}catch{return legacyWorker.fetch(request,env,ctx);}
    const action=txt(payload?.action);

    if(action==='health_check'){
      const legacy=await legacyWorker.fetch(request.clone(),env,ctx);
      let body={};try{body=await legacy.clone().json();}catch{}
      return json({...body,day7d:{enabled:true,rules_version:DAY7D_RULES_VERSION,question_version:DAY7D_QUESTION_VERSION,entrypoint:'worker/day7d-engine.js',schema_adapter:DAY7D_SCHEMA_VERSION,worker_name:String(env.DAY7D_DEPLOY_TARGET||'galvicare-triage-intake'),deployment_sha:String(env.DAY7D_DEPLOY_SHA||''),release_contract:DAY7D_RELEASE_CONTRACT,payment_intelligence_decoupled:true,legacy_paid_result_preservation:false,legacy_runtime_preservation:true,progressive_followups:true,evidence_versioned_results:true}},legacy.status);
    }

    if(action==='submit_triage'){
      const response=await legacyWorker.fetch(request.clone(),env,ctx);
      if(response.ok&&env.DB){const sid=sidFrom(payload);if(sid){try{await persistContext(env.DB,sid,payload);}catch(error){console.error('Day 7D qualitative evidence persistence failed',error?.message||error);}}}
      return response;
    }

    const product=ACTION_PRODUCT[action];
    if(!product) return legacyWorker.fetch(request,env,ctx);
    if(!env.DB) return json({success:false,status:'error',action,message:'D1 binding DB is not configured'},500);
    const sid=sidFrom(payload);
    if(!sid) return json({success:false,status:'error',action,message:'Missing session_id'},400);

    try{
      if(SAVE.has(action)){
        const before=await evidenceVersion(env.DB,sid);
        const answers=payload?.payload?.answers||payload?.answers||[];
        let after=before;
        for(const a of (Array.isArray(answers)?answers:[answers])){const saved=await saveFollowup(env.DB,sid,product,a);after=Math.max(after,Number(saved.evidence_version||after));}
        const evaluation=await evaluate(env.DB,sid,product);
        return json({action,...evaluation,evaluation,evidence_version_before:before,evidence_version:after,evidence_version_bumped:after>before});
      }
      if(EVAL.has(action)) return json({action,...await evaluate(env.DB,sid,product)});
      if(GENERATE.has(action)){
        if(!(await entitled(env.DB,sid,product))) return json({success:false,action,status:'locked',product,session_id:sid,payment_required:true,message:`${product} is locked until server-side entitlement is verified.`},402);
        return json({action,...await getOrCreate(env.DB,sid,product)});
      }
      return legacyWorker.fetch(request,env,ctx);
    }catch(error){
      console.error('Day 7D progressive runtime error',action,error?.stack||error?.message||error);
      return json({success:false,status:'error',action,error_code:'DAY7D_RUNTIME_ERROR',message:'Day 7D customer-intelligence processing failed safely.',detail:String(error?.message||error||'unknown error')},500);
    }
  }
};
