import day5Worker from './day5-entry.js';
import { GVError, context, failure, headers, success, hash, newId, now, requireId, requireText } from './day5-common.js';
import { requireClinicianIdentity, asLegacyOperatorHeaders } from './auth/operator-identity.js';
import { handleOperatorAuth } from './routes/operator-auth.js';
import { handleOperatorWorkspace } from './routes/operator-workspace.js';

const authPath=(path)=>path.startsWith('/api/v1/operator/auth/');
const activeCarePath=(path)=>
  /^\/api\/v1\/business-medical-records\/[^/]+\/clinic-brief$/.test(path) ||
  path==='/api/v1/finding-decisions' || path==='/api/v1/galvirx' ||
  path==='/api/v1/galviaudit-orders' || /^\/api\/v1\/galviaudit-orders\/[^/]+\/result$/.test(path) ||
  path==='/api/v1/referrals' || /^\/api\/v1\/referrals\/[^/]+\/(status|outcome)$/.test(path) ||
  path==='/api/v1/checkins' || path==='/api/v1/milestones' || path==='/api/v1/reassessments' ||
  path==='/api/v1/treatment-plans' || /^\/api\/v1\/treatment-plans\/[^/]+\/revisions$/.test(path);
const physicianOnly=(path)=>
  path==='/api/v1/finding-decisions' || path==='/api/v1/galvirx' || path==='/api/v1/galviaudit-orders' ||
  path==='/api/v1/referrals' || path==='/api/v1/reassessments' || path==='/api/v1/treatment-plans' ||
  /^\/api\/v1\/treatment-plans\/[^/]+\/revisions$/.test(path);
const protectedPath=(path)=> path.startsWith('/api/v1/operator/') || activeCarePath(path) ||
  /^\/api\/v1\/business-medical-records\/[^/]+\/(timeline|reasoning|care|transitions|evidence)/.test(path) ||
  path==='/api/v1/evidence' || path.startsWith('/api/v1/evidence/') ||
  path==='/api/v1/governance/confirmations' || path.startsWith('/api/v1/findings/') ||
  path==='/api/v1/recommendations' || path.startsWith('/api/v1/recommendations/') ||
  path==='/api/v1/treatment-plans' || path.startsWith('/api/v1/treatment-plans/') ||
  path==='/api/v1/outcomes' || path==='/api/v1/feedback';
const isApi=(path)=>path.startsWith('/api/')||path==='/health'||path==='/ready';

function asDay5CareHeaders(request,identity){
  const h=new Headers(request.headers);
  h.delete('X-Galvi-Role');h.delete('X-Galvi-Actor-Id');h.delete('X-Galvi-Email');
  h.set('X-Galvi-Role',identity.role==='business_physician'?'business_physician':'galviclinician');
  h.set('X-Galvi-Actor-Id',identity.operator_id);
  return new Request(request,{headers:h});
}

async function requestBody(request){
  try{return await request.clone().json();}catch{return {};}
}

function continuityIds(bmrId){
  const suffix=String(bmrId||'').replace(/[^a-zA-Z0-9]/g,'').slice(-28)||'bmr';
  return {
    sessionId:`gvs_day5_clinic_${suffix}`,
    clientKey:`day5-clinic:${bmrId}`,
    eventId:`jev_day5_clinic_${suffix}`,
    auditId:`aud_day5_clinic_${suffix}`
  };
}

/*
 * Day 5 active-care session bridge.
 *
 * A GalviClinic encounter is allowed to start a new session on the EXISTING BMR.
 * Reads never call this function. The bridge runs only as part of a clinician
 * write command and only when the canonical BMR has no valid assessment session.
 * It does not create a founder, venture, BMR, Chart, or shadow clinic record.
 * The deterministic IDs + INSERT OR IGNORE make retry/replay duplicate-safe.
 */
async function ensureActiveCareSession(request,env,identity){
  if(!['POST','PUT','PATCH'].includes(request.method)) return null;
  const body=await requestBody(request);
  const bmrId=String(body?.bmr_id||'').trim();
  if(!bmrId) return null;
  const bmr=await env.DB.prepare(`SELECT bmr_id,venture_id,current_session_id,record_version FROM gv1_business_medical_records WHERE bmr_id=? LIMIT 1`).bind(bmrId).first();
  if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);

  const currentId=String(bmr.current_session_id||'').trim();
  if(currentId){
    const current=await env.DB.prepare(`SELECT session_id,bmr_id FROM gv1_assessment_sessions WHERE session_id=? LIMIT 1`).bind(currentId).first();
    if(current?.bmr_id===bmrId) return currentId;
  }

  const latest=await env.DB.prepare(`SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY updated_at DESC,created_at DESC LIMIT 1`).bind(bmrId).first();
  if(latest?.session_id){
    await env.DB.prepare(`UPDATE gv1_business_medical_records SET current_session_id=?,updated_at=CURRENT_TIMESTAMP WHERE bmr_id=? AND (current_session_id IS NULL OR current_session_id='' OR current_session_id NOT IN (SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=?))`).bind(latest.session_id,bmrId,bmrId).run();
    return String(latest.session_id);
  }

  const founder=await env.DB.prepare(`SELECT founder_id FROM gv1_founder_venture_roles WHERE venture_id=? AND status='active' ORDER BY is_primary DESC,created_at ASC LIMIT 1`).bind(bmr.venture_id).first();
  if(!founder?.founder_id) throw new GVError('GV_LINEAGE_REQUIRED','Active care requires a canonical founder linked to this BMR venture.',409);

  const ids=continuityIds(bmrId), timestamp=new Date().toISOString();
  const actorType=identity?.role==='business_physician'?'business_physician':'galviclinician';
  const actorId=String(identity?.operator_id||'').trim()||'clinician';
  const fingerprint=`day5-active-care-session:${bmrId}`;
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO gv1_assessment_sessions
      (session_id,bmr_id,venture_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at)
      VALUES (?,?,?,?,?,'galviclinic_day5_continuity','GalviClinic','active',?,NULL,?,?)`)
      .bind(ids.sessionId,bmrId,bmr.venture_id,founder.founder_id,ids.clientKey,timestamp,timestamp,timestamp),
    env.DB.prepare(`UPDATE gv1_business_medical_records SET current_session_id=?,updated_at=? WHERE bmr_id=?`).bind(ids.sessionId,timestamp,bmrId),
    env.DB.prepare(`INSERT OR IGNORE INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,'galviclinic_active_care_session_started','GalviClinic','Day5',?,?,?,?,?,'qa',?)`)
      .bind(ids.eventId,`day5:active_care_session:${bmrId}`,bmrId,ids.sessionId,timestamp,actorType,JSON.stringify({actor_id:actorId,record_version:Number(bmr.record_version||1),reason:'missing_canonical_active_care_session'}),fingerprint,`day5-session-${ids.sessionId}`,timestamp),
    env.DB.prepare(`INSERT OR IGNORE INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,'business_medical_record',?,'session_link',?,?,?,?,?,?,?,'qa',?,?)`)
      .bind(ids.auditId,bmrId,Number(bmr.record_version||1),Number(bmr.record_version||1),actorType,'day8-entry','day5_active_care_session_bridge',JSON.stringify({session_id:ids.sessionId,venture_id:bmr.venture_id,founder_id:founder.founder_id}),`day5-session-${ids.sessionId}`,timestamp,timestamp)
  ]);

  const verified=await env.DB.prepare(`SELECT session_id,bmr_id FROM gv1_assessment_sessions WHERE session_id=? LIMIT 1`).bind(ids.sessionId).first();
  if(!verified||verified.bmr_id!==bmrId) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','Unable to establish the canonical GalviClinic active-care session.',409);
  return ids.sessionId;
}

async function recordClinicianNote(request,env,ctx,identity){
  const body=await requestBody(request);
  const bmrId=requireId('bmr_id',body.bmr_id);
  const sourceType=String(body?.source_type||'').trim();
  if(sourceType!=='facilitator_capture') throw new GVError('GV_REQ_SCHEMA','GalviClinic notes require source_type facilitator_capture.',422);
  if(String(body?.consent_status||'confirmed').trim()!=='confirmed') throw new GVError('GV_CONSENT_REQUIRED','Confirmed care-processing consent is required for a GalviClinic note.',403);
  const valueText=requireText('value_text',body.value_text,4000);
  const sourceRef=String(body?.source_ref||`galviclinic_note_${crypto.randomUUID()}`).trim().slice(0,240);
  const key=String(request.headers.get('Idempotency-Key')||'').trim();
  if(!key) throw new GVError('GV_IDEMPOTENCY_REQUIRED','Idempotency-Key header is required.',400);

  const sessionId=await ensureActiveCareSession(request,env,identity);
  if(!sessionId) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','A canonical GalviClinic session is required for a clinician note.',409);
  const record=await env.DB.prepare(`SELECT bmr_id,current_session_id FROM gv1_business_medical_records WHERE bmr_id=? LIMIT 1`).bind(bmrId).first();
  if(!record) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);

  const capturedAt=String(body?.captured_at||now()).trim();
  const fp=await hash('day8:clinician-note',{bmrId,sessionId,sourceRef,valueText,capturedAt});
  const scope='day8:clinician-note';
  const prior=await env.DB.prepare(`SELECT request_fingerprint,response_entity_id FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=? LIMIT 1`).bind(scope,key).first();
  if(prior){
    if(prior.request_fingerprint!==fp) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused with different content.',409);
    const evidence=await env.DB.prepare(`SELECT evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,confidence,evidence_version,created_at FROM gv1_evidence_items WHERE evidence_id=? AND bmr_id=? LIMIT 1`).bind(prior.response_entity_id,bmrId).first();
    if(!evidence) throw new GVError('GV_NOT_FOUND','Stored GalviClinic note evidence was not found.',404);
    return success(ctx,{evidence,idempotent_replay:true},200,'no_change',{idempotent_replay:true});
  }

  const ts=now(), evidenceId=newId('evd'), actorType=identity?.role==='business_physician'?'business_physician':'galviclinician';
  const actorId=String(identity?.operator_id||'').trim()||'clinician';
  const eventId=newId('jev'), auditId=newId('aud'), receiptId=newId('idem');
  const content=JSON.stringify({value_type:'text',value_text:valueText,captured_at:capturedAt,consent_status:'confirmed',actor_type:actorType,actor_id:actorId});
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_evidence_items
      (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at)
      VALUES (?,?,?,'clinician_note','GalviClinic',?,?,NULL,1,?)`)
      .bind(evidenceId,bmrId,sessionId,sourceRef,content,ts),
    env.DB.prepare(`INSERT INTO gv1_journey_events
      (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
      VALUES (?,?,?,?,'galviclinic_note_recorded','GalviClinic','Day5',?,?,?,?,?,'qa',?)`)
      .bind(eventId,`day8:clinician-note:${evidenceId}`,bmrId,sessionId,ts,actorType,JSON.stringify({evidence_id:evidenceId,source_reference:sourceRef}),fp,ctx.correlation,ts),
    env.DB.prepare(`INSERT INTO gv1_audit_log
      (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
      VALUES (?,'evidence',?,'create',NULL,1,?,'galviclinic','clinician_note',?,?,'qa',?,?)`)
      .bind(auditId,evidenceId,actorType,JSON.stringify({bmr_id:bmrId,session_id:sessionId,source_reference:sourceRef}),ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_idempotency_keys
      (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at)
      VALUES (?,?,?,?,201,'evidence',?,?)`)
      .bind(receiptId,scope,key,fp,evidenceId,ts)
  ]);

  const evidence=await env.DB.prepare(`SELECT evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,confidence,evidence_version,created_at FROM gv1_evidence_items WHERE evidence_id=? LIMIT 1`).bind(evidenceId).first();
  return success(ctx,{evidence,idempotent_replay:false},201,'created',{idempotent_replay:false});
}

async function preflightTreatmentPlanFk(request,env){
  if(request.method!=='POST') return;
  const body=await requestBody(request);
  const bmrId=String(body?.bmr_id||'').trim();
  if(!bmrId) return;
  const bmr=await env.DB.prepare(`SELECT bmr_id,current_session_id FROM gv1_business_medical_records WHERE bmr_id=? LIMIT 1`).bind(bmrId).first();
  if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  let sessionId=String(bmr.current_session_id||'').trim();
  if(!sessionId){
    const latest=await env.DB.prepare(`SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY created_at DESC LIMIT 1`).bind(bmrId).first();
    sessionId=String(latest?.session_id||'').trim();
  }
  if(!sessionId) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','Treatment plan requires a current BMR session.',409);
  const session=await env.DB.prepare(`SELECT session_id,bmr_id FROM gv1_assessment_sessions WHERE session_id=? LIMIT 1`).bind(sessionId).first();
  if(!session||session.bmr_id!==bmrId) throw new GVError('GV_LINEAGE_REQUIRED','Treatment plan session must exist and belong to the same BMR.',409);
  for(const recommendationId of Array.isArray(body?.recommendation_ids)?body.recommendation_ids:[]){
    const row=await env.DB.prepare(`SELECT recommendation_id,bmr_id FROM gv1_recommendations WHERE recommendation_id=? LIMIT 1`).bind(String(recommendationId)).first();
    if(!row||row.bmr_id!==bmrId) throw new GVError('GV_LINEAGE_REQUIRED','Treatment plan recommendation must exist and belong to the same BMR.',422);
  }
  for(const findingId of Array.isArray(body?.finding_ids)?body.finding_ids:[]){
    const row=await env.DB.prepare(`SELECT finding_id,bmr_id FROM gv1_findings WHERE finding_id=? LIMIT 1`).bind(String(findingId)).first();
    if(!row||row.bmr_id!==bmrId) throw new GVError('GV_LINEAGE_REQUIRED','Treatment plan finding must exist and belong to the same BMR.',422);
  }
  await env.DB.prepare('PRAGMA defer_foreign_keys = ON').run();
}

const worker={async fetch(request,env,executionContext){
  const url=new URL(request.url), ctx=context(request,env), path=url.pathname.replace(/\/+$/,'')||'/';
  try{
    if(ctx.origin&&ctx.origin!==url.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/')) return new Response(null,{status:204,headers:headers(ctx)});
    if(authPath(path)){
      const response=await handleOperatorAuth(request,env,ctx,path,success);
      if(response)return response;
    }
    if(!isApi(path)){
      if(!env?.ASSETS?.fetch) throw new GVError('GV_NOT_READY','Clinician portal assets are unavailable.',503);
      const response=await env.ASSETS.fetch(request);
      const h=new Headers(response.headers); h.set('Cache-Control','no-store'); h.set('X-Content-Type-Options','nosniff'); h.set('Referrer-Policy','no-referrer');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
    }
    if(!protectedPath(path)) return day5Worker.fetch(request,env,executionContext);
    const identity=await requireClinicianIdentity(request,env);
    if(identity.role!=='business_physician'&&(path==='/api/v1/governance/confirmations'||/\/transitions$/.test(path)||physicianOnly(path)))
      throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);

    if(request.method==='POST'&&path==='/api/v1/evidence')
      return recordClinicianNote(request,env,ctx,identity);

    // Start/restore GalviClinic continuity only on Day 5 write commands that require
    // the canonical session contract. This closes legacy-BMR continuity without a
    // read-side write, new BMR, manual SQL repair, or shadow clinical identity.
    if(request.method==='POST'&&(path==='/api/v1/recommendations'||path==='/api/v1/treatment-plans'))
      await ensureActiveCareSession(request,env,identity);
    if(path==='/api/v1/treatment-plans') await preflightTreatmentPlanFk(request,env);
    if(activeCarePath(path)) return day5Worker.fetch(asDay5CareHeaders(request,identity),env,executionContext);
    const secured=asLegacyOperatorHeaders(request,identity);
    const response=await handleOperatorWorkspace(secured,env,ctx,path,identity);
    return response||day5Worker.fetch(secured,env,executionContext);
  }catch(error){ return failure(ctx,error); }
}};
export default worker;
