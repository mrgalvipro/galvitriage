import { GVError, clean, success } from '../day5-common.js';
import { getReasoning } from '../domain/reasoning-service.js';
import { getCare, createLearningCandidate } from '../domain/care-service.js';
import { getDay5Timeline } from '../domain/day5-timeline-service.js';
import { composeFounderIntelligenceContext, getFounderHealthProjection, importHistoricalFounder, planHistoricalImport, sanitizeIntelligenceReference } from '../domain/founder-history-service.js';

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];

export async function handleOperatorWorkspace(request,env,ctx,path,identity){
  if(request.method==='GET'&&path==='/api/v1/operator/me')
    return success(ctx,{operator_id:identity.operator_id,display_name:identity.display_name,role:identity.role,environment:ctx.environment,expires_at:new Date(identity.exp*1000).toISOString()});
  if(request.method==='GET'&&path==='/api/v1/operator/founders'){
    const u=new URL(request.url), q=clean(u.searchParams.get('query')).toLowerCase(), raw=Number(u.searchParams.get('limit')||25), limit=Number.isInteger(raw)&&raw>0?Math.min(raw,25):25;
    if(q.length<3||q.length>180) throw new GVError('GV_REQ_SCHEMA','query must be 3-180 characters.',422);
    const like=`%${q}%`, cursor=clean(u.searchParams.get('cursor'));
    const rows=await all(env.DB,`
      SELECT f.founder_id,f.first_name,f.last_name,f.email,v.venture_id,v.venture_name,
             b.bmr_id,b.status AS bmr_status,b.record_version,b.updated_at
      FROM gv1_founders f
      JOIN gv1_founder_venture_roles r ON r.founder_id=f.founder_id AND r.status='active'
      JOIN gv1_ventures v ON v.venture_id=r.venture_id
      JOIN gv1_business_medical_records b ON b.venture_id=v.venture_id
      WHERE (lower(coalesce(f.normalized_email,f.email,'')) LIKE ? OR lower(coalesce(f.first_name,'')||' '||coalesce(f.last_name,'')) LIKE ? OR lower(v.venture_name) LIKE ?)
        AND (?='' OR b.bmr_id>?)
      ORDER BY b.bmr_id LIMIT ?`,like,like,like,cursor,cursor,limit+1);
    const more=rows.length>limit, items=rows.slice(0,limit);
    return success(ctx,{items,next_cursor:more?items.at(-1)?.bmr_id:null,limit});
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
             f.founder_id,f.first_name,f.last_name,f.email
      FROM gv1_business_medical_records b
      JOIN gv1_ventures v ON v.venture_id=b.venture_id
      LEFT JOIN gv1_founder_venture_roles r ON r.venture_id=v.venture_id AND r.status='active' AND r.is_primary=1
      LEFT JOIN gv1_founders f ON f.founder_id=r.founder_id WHERE b.bmr_id=?`,bmrId);
    if(!core) throw new GVError('GV_NOT_FOUND','Business Medical Record not found.',404);
    const sessions=await all(env.DB,`SELECT session_id,current_stage,status,started_at,completed_at,updated_at FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY updated_at DESC LIMIT 25`,bmrId);
    const evidence=await all(env.DB,`SELECT evidence_id,session_id,evidence_type,source_product,source_reference,confidence,evidence_version,created_at FROM gv1_evidence_items WHERE bmr_id=? ORDER BY created_at DESC LIMIT 50`,bmrId);
    const [reasoning,care,timelineProjection]=await Promise.all([getReasoning(env,bmrId,{history:false}),getCare(env,bmrId,{history:false,limit:100}),getDay5Timeline(env,bmrId,{limit:100})]);
    const timeline=Array.isArray(timelineProjection)?timelineProjection:(timelineProjection?.entries||[]);
    let historical_founder_context=null,historical_context_error=null;
    try{historical_founder_context=await getFounderHealthProjection(env,bmrId);}catch(error){historical_context_error={code:'GV_OPTIONAL_PROJECTION_UNAVAILABLE',correlation_id:ctx.correlation};}
    return success(ctx,{identity:{founder:{founder_id:core.founder_id,first_name:core.first_name,last_name:core.last_name,email:core.email},venture:{venture_id:core.venture_id,venture_name:core.venture_name,stage:core.stage,industry:core.industry},bmr:{bmr_id:core.bmr_id,lifecycle_status:core.lifecycle_status,record_version:core.record_version,current_session_id:core.current_session_id,opened_at:core.opened_at,updated_at:core.updated_at}},sessions,evidence,reasoning,care,timeline,historical_founder_context,historical_context_error});
  }
  return null;
}
