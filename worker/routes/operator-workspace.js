import { GVError, clean, success, hash, newId, now } from '../day5-common.js';
import { getReasoning } from '../domain/reasoning-service.js';
import { getCare, createLearningCandidate } from '../domain/care-service.js';
import { getDay5Timeline } from '../domain/day5-timeline-service.js';
import { acceptedArtifactReviewCandidates } from '../domain/day5-artifact-review-service.js';
import { composeFounderIntelligenceContext, getFounderHealthProjection, importHistoricalFounder, planHistoricalImport, sanitizeIntelligenceReference } from '../domain/founder-history-service.js';

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
const text=v=>String(v??'').trim();
const parse=(v,fallback={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return fallback}};
const strings=(v,max=8)=>(Array.isArray(v)?v:[]).map(x=>typeof x==='string'?text(x):text(x?.statement||x?.action||x?.label)).filter(Boolean).slice(0,max);
const bounded=(v,max=3000)=>text(v).slice(0,max);

async function acceptedArtifact(env,bmrId,product){
  const row=await first(env.DB,`SELECT artifact_id,artifact_json,record_version,generation_source,created_at FROM gv1_day3_governed_artifacts
    WHERE bmr_id=? AND product=? AND validation_status='accepted' AND approval_status IN ('not_required','approved') AND customer_projection=1
    ORDER BY record_version DESC,created_at DESC LIMIT 1`,bmrId,product);
  if(!row)return null;
  const artifact=parse(row.artifact_json,{}),content=artifact?.content&&typeof artifact.content==='object'?artifact.content:artifact;
  return {...row,content};
}

async function canonicalGalviChart(env,core,care){
  const scoreRow=await first(env.DB,`SELECT result_id,payload_json,record_version,created_at FROM gv1_day2_intake_results WHERE bmr_id=? AND result_type='score' ORDER BY record_version DESC,created_at DESC LIMIT 1`,core.bmr_id);
  const score=parse(scoreRow?.payload_json,{});
  const [shot,sight,path]=await Promise.all([acceptedArtifact(env,core.bmr_id,'GalviShot'),acceptedArtifact(env,core.bmr_id,'GalviSight'),acceptedArtifact(env,core.bmr_id,'GalviPath')]);
  const shotFindings=(Array.isArray(shot?.content?.findings)?shot.content.findings:[]).slice(0,5).map(f=>({statement:text(f?.statement||f?.title||f?.finding_text),reasoning_summary:text(f?.reasoning_summary||f?.why_it_matters),next_step:text(f?.next_step||f?.action),confidence:Number.isFinite(Number(f?.confidence))?Number(f.confidence):null})).filter(f=>f.statement||f.reasoning_summary);
  const sightSummary=text(sight?.content?.summary||sight?.content?.interpretation||sight?.content?.clinical_summary);
  const pathContent=path?.content||{};
  const currentPlans=Array.isArray(care?.treatment_plans)?care.treatment_plans:[];
  return {
    projection:'galvichart_shared_clinician_v1',
    read_only:true,
    ai_called_on_read:false,
    sections:{
      overview:{
        founder_name:text(`${core.first_name||''} ${core.last_name||''}`),venture_name:core.venture_name,lifecycle_status:core.lifecycle_status,
        current_stage:core.current_stage||null,galviscore:score?.overall_score??score?.score??null,acuity_score:score?.acuity_score??null,
        acuity_band:text(score?.acuity_band),clinical_confidence:score?.clinical_confidence??null,classification:text(score?.classification),lowest_category:text(score?.lowest_category)
      },
      health:{galvishot_findings:shotFindings,galvisight_summary:sightSummary,risks:strings(sight?.content?.risks||sight?.content?.strategic_risks,5),opportunities:strings(sight?.content?.opportunities||sight?.content?.recommended_actions,5)},
      timeline:{current_stage:core.current_stage||null,last_updated:core.updated_at},
      care_plan:{objective:text(pathContent.objective||pathContent.primary_pathway||pathContent.clinical_rationale),actions:strings(pathContent.sequence,8),evidence_to_collect:strings(pathContent.evidence_to_collect,8),cadence:text(pathContent.cadence||pathContent.operating_cadence),owner:text(pathContent.owner||pathContent.check_in_owner),support_level:text(pathContent.support_level||pathContent.recommended_support_level),escalation:text(pathContent.escalation||pathContent.escalation_rule||pathContent.support_recommendation),treatment_plans:currentPlans},
      evidence:{summary:'Evidence is shown in customer-safe language. Source IDs and provider metadata remain available to governed services but are not the primary physician reading experience.',accepted_galvishot:shotFindings.length,accepted_galvisight:Boolean(sightSummary),accepted_galvipath:Boolean(path)},
      documents:{items:[]},
      galviclinic:{status:currentPlans.length?'treatment plan active or recorded':'Business Physician review in progress',treatment_plan_count:currentPlans.length},
      history:{bmr_status:core.lifecycle_status,record_version:core.record_version}
    }
  };
}

async function preFounderProjectionForPhysician(env,contextId){
  const core=await first(env.DB,`SELECT c.context_id,c.founder_id,c.lifecycle_state,c.record_mode,c.venture_id,c.bmr_id,c.status,c.created_at,c.updated_at,
      f.first_name,f.last_name,f.email
    FROM gv1_principal_contexts c JOIN gv1_founders f ON f.founder_id=c.founder_id
    WHERE c.context_id=?`,contextId);
  if(!core||core.lifecycle_state!=='pre_founder'||core.record_mode!=='principal_only'||core.venture_id!==null||core.bmr_id!==null) throw new GVError('GV_SCOPE_MISMATCH','Pre-Founder clinician review requires the canonical principal-only context.',409);
  const [vitalsRow,scoreRow,events,aiRow]=await Promise.all([
    first(env.DB,`SELECT result_id,payload_json,record_version,created_at FROM gv1_day2_intake_results WHERE context_id=? AND result_type='vitals' ORDER BY record_version DESC,created_at DESC LIMIT 1`,contextId),
    first(env.DB,`SELECT result_id,payload_json,record_version,created_at FROM gv1_day2_intake_results WHERE context_id=? AND result_type='score' ORDER BY record_version DESC,created_at DESC LIMIT 1`,contextId),
    all(env.DB,`SELECT event_id,event_type,product,payload_json,actor_type,actor_id,created_at FROM gv1_prefounder_care_events WHERE context_id=? ORDER BY created_at,event_id`,contextId),
    first(env.DB,`SELECT safe_change_json,occurred_at FROM gv1_audit_log WHERE entity_type='prefounder_readiness_interpretation' AND safe_change_json LIKE ? ORDER BY occurred_at DESC LIMIT 1`,`%${contextId}%`)
  ]);
  const normalizedEvents=events.map(e=>({...e,payload:parse(e.payload_json,{})}));
  const clinic=normalizedEvents.find(e=>e.event_type==='clinic_booking_requested');
  const physician=normalizedEvents.find(e=>e.event_type==='physician_plan');
  return {
    projection:'galvichart_prefounder_clinician_v1',read_only:false,ai_called_on_read:false,
    principal:{founder_id:core.founder_id,first_name:core.first_name,last_name:core.last_name,email:core.email},
    context:{context_id:core.context_id,lifecycle_state:core.lifecycle_state,record_mode:core.record_mode,venture_id:null,bmr_id:null,status:core.status,created_at:core.created_at,updated_at:core.updated_at},
    vitals:parse(vitalsRow?.payload_json,{}),score:parse(scoreRow?.payload_json,{}),ai:parse(aiRow?.safe_change_json,null),events:normalizedEvents,
    presenting_context:clinic?.payload?.presenting_context||{},
    clinic:{requested_at:clinic?.created_at||null,status:physician?'physician_plan_recorded':clinic?'awaiting_business_physician':'not_requested',physician_plan:physician?.payload||null},
    route:{program:'Founder Development Institute / SPUR Pre-Founder',prescription_candidate:'Founder Readiness Sprint',stage_sequence:['Discern','Discover','Prepare','Validate','Build','Steward']},
    manual_repair:'NO'
  };
}

async function recordPreFounderPhysicianPlan(env,ctx,identity,request,contextId){
  if(identity.role!=='business_physician') throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authority is required to record a Pre-Founder treatment decision.',403);
  const context=await first(env.DB,`SELECT context_id,founder_id,lifecycle_state,record_mode,venture_id,bmr_id FROM gv1_principal_contexts WHERE context_id=?`,contextId);
  if(!context||context.lifecycle_state!=='pre_founder'||context.record_mode!=='principal_only'||context.venture_id!==null||context.bmr_id!==null) throw new GVError('GV_SCOPE_MISMATCH','Pre-Founder treatment decision requires the canonical principal-only context.',409);
  const clinic=await first(env.DB,`SELECT event_id FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='clinic_booking_requested' ORDER BY created_at DESC LIMIT 1`,contextId);
  if(!clinic) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','GalviClinic booking/request must occur before the Business Physician plan.',409);
  const body=await request.json();
  const payload={response:bounded(body.response),treatment_plan:bounded(body.treatment_plan),intervention_code:bounded(body.intervention_code||'founder_readiness_sprint',120),monitoring_plan:bounded(body.monitoring_plan||'Complete prescribed Founder Readiness care, submit evidence, and return for reassessment.',1200),authority:'business_physician',principal_only:true};
  if(!payload.response||!payload.treatment_plan) throw new GVError('GV_REQ_SCHEMA','Business Physician response and treatment_plan are required.',422);
  const key=clean(request.headers.get('Idempotency-Key'));
  if(!key) throw new GVError('GV_IDEMPOTENCY_REQUIRED','Idempotency-Key is required.',422);
  const fp=await hash('day7:operator-prefounder-physician-plan',{context_id:contextId,payload,actor_id:identity.operator_id});
  const prior=await first(env.DB,`SELECT event_id,request_fingerprint,payload_json,created_at FROM gv1_prefounder_care_events WHERE client_request_id=?`,key);
  if(prior){if(prior.request_fingerprint!==fp)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused with different content.',409);return{event:{...prior,event_type:'physician_plan',payload:parse(prior.payload_json,{})},idempotent_replay:true};}
  const existing=await first(env.DB,`SELECT event_id,payload_json,created_at FROM gv1_prefounder_care_events WHERE context_id=? AND event_type='physician_plan' ORDER BY created_at DESC LIMIT 1`,contextId);
  if(existing)return{event:{...existing,event_type:'physician_plan',payload:parse(existing.payload_json,{})},idempotent_replay:true,canonical_existing:true};
  const ts=now(),eventId=newId('pce');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_prefounder_care_events(event_id,context_id,founder_id,event_type,product,payload_json,actor_type,actor_id,client_request_id,request_fingerprint,correlation_id,created_at) VALUES(?,?,?,'physician_plan','GalviClinic',?,'business_physician',?,?,?,?,?)`).bind(eventId,contextId,context.founder_id,JSON.stringify(payload),identity.operator_id,key,fp,ctx.correlation,ts),
    env.DB.prepare(`INSERT INTO gv1_audit_log(audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at) VALUES(?,'prefounder_care_event',?,'append',NULL,1,'business_physician','day7-clinician-workspace','physician_plan',?,?,?,?,?)`).bind(newId('aud'),eventId,JSON.stringify({context_id:contextId,founder_id:context.founder_id,product:'GalviClinic',intervention_code:payload.intervention_code}),ctx.correlation,ctx.environment,ts,ts)
  ]);
  return{event:{event_id:eventId,event_type:'physician_plan',product:'GalviClinic',payload,actor_type:'business_physician',actor_id:identity.operator_id,created_at:ts},idempotent_replay:false};
}

export async function handleOperatorWorkspace(request,env,ctx,path,identity){
  if(request.method==='GET'&&path==='/api/v1/operator/me')
    return success(ctx,{operator_id:identity.operator_id,display_name:identity.display_name,role:identity.role,environment:ctx.environment,expires_at:new Date(identity.exp*1000).toISOString()});
  if(request.method==='GET'&&path==='/api/v1/operator/clinic-queue'){
    const u=new URL(request.url),raw=Number(u.searchParams.get('limit')||25),limit=Number.isInteger(raw)&&raw>0?Math.min(raw,50):25;
    const rows=await all(env.DB,`SELECT c.context_id,c.founder_id,c.lifecycle_state,c.record_mode,c.created_at,c.updated_at,
        f.first_name,f.last_name,f.email,book.event_id AS booking_event_id,book.payload_json AS booking_payload,book.created_at AS requested_at,
        score.payload_json AS score_json
      FROM gv1_principal_contexts c
      JOIN gv1_founders f ON f.founder_id=c.founder_id
      JOIN gv1_prefounder_care_events book ON book.context_id=c.context_id AND book.event_type='clinic_booking_requested'
      LEFT JOIN gv1_prefounder_care_events plan ON plan.context_id=c.context_id AND plan.event_type='physician_plan'
      LEFT JOIN gv1_day2_intake_results score ON score.result_id=(SELECT s.result_id FROM gv1_day2_intake_results s WHERE s.context_id=c.context_id AND s.result_type='score' ORDER BY s.record_version DESC,s.created_at DESC LIMIT 1)
      WHERE c.lifecycle_state='pre_founder' AND c.record_mode='principal_only' AND c.venture_id IS NULL AND c.bmr_id IS NULL AND plan.event_id IS NULL
      ORDER BY book.created_at ASC,book.event_id ASC LIMIT ?`,limit);
    const items=rows.map(r=>{const score=parse(r.score_json,{}),booking=parse(r.booking_payload,{});return{queue_type:'galviclinic_prefounder_review',status:'awaiting_business_physician',reason:'Founder Readiness / SPUR Pre-Founder recommendation requires Business Physician review',principal_id:r.founder_id,context_id:r.context_id,first_name:r.first_name,last_name:r.last_name,email:r.email,lifecycle_state:r.lifecycle_state,record_mode:r.record_mode,requested_at:r.requested_at,founder_readiness_score:score.overall_score??null,acuity_score:score.acuity_score??null,acuity_band:score.acuity_band||null,clinical_confidence:score.clinical_confidence??null,presenting_context:booking.presenting_context||{},manual_repair:'NO'};});
    return success(ctx,{items,limit,queue_scope:'pending_galviclinic_business_physician_review',manual_repair:'NO'});
  }
  const preFounderChart=path.match(/^\/api\/v1\/operator\/principal-contexts\/([^/]+)\/chart$/);
  if(request.method==='GET'&&preFounderChart)return success(ctx,{chart:await preFounderProjectionForPhysician(env,decodeURIComponent(preFounderChart[1]))});
  const preFounderPlan=path.match(/^\/api\/v1\/operator\/principal-contexts\/([^/]+)\/physician-plan$/);
  if(request.method==='POST'&&preFounderPlan){const data=await recordPreFounderPhysicianPlan(env,ctx,identity,request,decodeURIComponent(preFounderPlan[1]));return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,manual_repair:'NO'});}
  if(request.method==='GET'&&path==='/api/v1/operator/founders'){
    const u=new URL(request.url), q=clean(u.searchParams.get('query')).toLowerCase(), raw=Number(u.searchParams.get('limit')||25), limit=Number.isInteger(raw)&&raw>0?Math.min(raw,25):25;
    if(q.length<3||q.length>180) throw new GVError('GV_REQ_SCHEMA','query must be 3-180 characters.',422);
    const like=`%${q}%`, cursor=clean(u.searchParams.get('cursor'));
    const rows=await all(env.DB,`
      SELECT DISTINCT f.founder_id,f.first_name,f.last_name,f.email,v.venture_id,v.venture_name,
             b.bmr_id,b.status AS bmr_status,b.record_version,b.current_session_id,b.updated_at
      FROM gv1_founders f
      JOIN gv1_founder_venture_roles r ON r.founder_id=f.founder_id AND r.status='active'
      JOIN gv1_ventures v ON v.venture_id=r.venture_id
      JOIN gv1_business_medical_records b ON b.venture_id=v.venture_id
      LEFT JOIN gv1_assessment_sessions s ON s.bmr_id=b.bmr_id
      WHERE (lower(coalesce(f.normalized_email,f.email,'')) LIKE ?
          OR lower(coalesce(f.first_name,'')||' '||coalesce(f.last_name,'')) LIKE ?
          OR lower(v.venture_name) LIKE ?
          OR lower(b.bmr_id) LIKE ?
          OR lower(coalesce(b.current_session_id,'')) LIKE ?
          OR lower(coalesce(s.session_id,'')) LIKE ?)
        AND (?='' OR b.bmr_id>?)
      ORDER BY b.bmr_id LIMIT ?`,like,like,like,like,like,like,cursor,cursor,limit+1);
    const more=rows.length>limit, items=rows.slice(0,limit);
    return success(ctx,{items,next_cursor:more?items.at(-1)?.bmr_id:null,limit,query_scope:'customer_founder_venture_bmr_or_session'});
  }
  if(request.method==='POST'&&path==='/api/v1/operator/day9/historical-import/plan'){
    const body=await request.json();
    return success(ctx,{plan:await planHistoricalImport(env,body)});
  }
  if(request.method==='POST'&&path==='/api/v1/operator/day9/historical-import'){
    const body=await request.json();
    return success(ctx,{import:await importHistoricalFounder(env,ctx,identity,body.row||body,{batchId:body.import_batch_id||null})},201,'created');
  }
  if(request.method==='POST'&&path==='/api/v1/operator/day9/intelligence-reference'){
    const body=await request.json();
    const sanitized=sanitizeIntelligenceReference(body);
    if(!sanitized.accepted_sections.length) throw new GVError('GV_IMPORT_QUARANTINED','No source-safe intelligence-reference sections remain after quarantine.',422);
    const key=clean(request.headers.get('Idempotency-Key'))||`day9-intelligence-reference-${await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(sanitized))).then(b=>[...new Uint8Array(b)].slice(0,8).map(x=>x.toString(16).padStart(2,'0')).join(''))}`;
    const proposal={candidate_type:sanitized.candidate_type,title:'Historical founder pattern reference',proposed_change:{accepted_sections:sanitized.accepted_sections,quarantined_count:sanitized.quarantined_count,canonical_profile_created:false,source_bmr_ids:[]},rationale:'Day 9 governed intelligence-reference only; no canonical founder profile or runtime rule.',risk_summary:sanitized.quarantined_count?'Mixed-source sections were excluded before proposal creation.':'No mixed-source contamination detected.'};
    const created=await createLearningCandidate(env,ctx,{role:'operator',id:identity.operator_id},key,proposal);
    return success(ctx,{sanitized,learning_candidate:created.learning_candidate,idempotent_replay:created.idempotent_replay},created.idempotent_replay?200:201,created.idempotent_replay?'no_change':'created');
  }
  const fhr=path.match(/^\/api\/v1\/operator\/business-medical-records\/([^/]+)\/founder-health-record$/);
  if(request.method==='GET'&&fhr)return success(ctx,{fhr:await getFounderHealthProjection(env,decodeURIComponent(fhr[1]))});
  const intelligence=path.match(/^\/api\/v1\/operator\/business-medical-records\/([^/]+)\/founder-intelligence-context$/);
  if(request.method==='GET'&&intelligence){
    const bmrId=decodeURIComponent(intelligence[1]),u=new URL(request.url);
    return success(ctx,{context:await composeFounderIntelligenceContext(env,identity,{founderId:clean(u.searchParams.get('founder_id')),ventureId:clean(u.searchParams.get('venture_id')),bmrId})});
  }
  const m=path.match(/^\/api\/v1\/operator\/business-medical-records\/([^/]+)\/chart$/);
  if(request.method==='GET'&&m){
    const bmrId=decodeURIComponent(m[1]);
    const core=await first(env.DB,`
      SELECT b.bmr_id,b.venture_id,b.status AS lifecycle_status,b.record_version,b.current_session_id,b.opened_at,b.updated_at,
             v.venture_name,v.stage,v.industry,
             f.founder_id,f.first_name,f.last_name,f.email,
             s.current_stage
      FROM gv1_business_medical_records b
      JOIN gv1_ventures v ON v.venture_id=b.venture_id
      LEFT JOIN gv1_founder_venture_roles r ON r.venture_id=v.venture_id AND r.status='active' AND r.is_primary=1
      LEFT JOIN gv1_founders f ON f.founder_id=r.founder_id
      LEFT JOIN gv1_assessment_sessions s ON s.session_id=b.current_session_id
      WHERE b.bmr_id=?`,bmrId);
    if(!core) throw new GVError('GV_NOT_FOUND','Business Medical Record not found.',404);
    const sessions=await all(env.DB,`SELECT session_id,current_stage,status,started_at,completed_at,updated_at FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY updated_at DESC LIMIT 25`,bmrId);
    const evidence=await all(env.DB,`SELECT evidence_id,session_id,evidence_type,source_product,source_reference,confidence,evidence_version,created_at FROM gv1_evidence_items WHERE bmr_id=? ORDER BY created_at DESC LIMIT 50`,bmrId);
    const [reasoningBase,care,timelineProjection,reviewCandidates]=await Promise.all([getReasoning(env,bmrId,{history:false}),getCare(env,bmrId,{history:false,limit:100}),getDay5Timeline(env,bmrId,{limit:100}),acceptedArtifactReviewCandidates(env,bmrId)]);
    const canonicalFindings=Array.isArray(reasoningBase?.findings)?reasoningBase.findings:[];
    const existing=new Set(canonicalFindings.map(f=>text(f.finding_id)));
    const reasoning={...reasoningBase,findings:[...canonicalFindings,...reviewCandidates.filter(f=>!existing.has(f.finding_id))],ai_review_candidates:reviewCandidates};
    const timeline=Array.isArray(timelineProjection)?timelineProjection:(timelineProjection?.entries||[]);
    let historical_founder_context=null,historical_context_error=null;
    try{historical_founder_context=await getFounderHealthProjection(env,bmrId);}catch(error){historical_context_error={code:'GV_OPTIONAL_PROJECTION_UNAVAILABLE',correlation_id:ctx.correlation};}
    const galvichart=await canonicalGalviChart(env,core,care);
    return success(ctx,{identity:{founder:{founder_id:core.founder_id,first_name:core.first_name,last_name:core.last_name,email:core.email},venture:{venture_id:core.venture_id,venture_name:core.venture_name,stage:core.stage,industry:core.industry},bmr:{bmr_id:core.bmr_id,lifecycle_status:core.lifecycle_status,record_version:core.record_version,current_session_id:core.current_session_id,opened_at:core.opened_at,updated_at:core.updated_at}},galvichart,sessions,evidence,reasoning,care,timeline,historical_founder_context,historical_context_error});
  }
  return null;
}