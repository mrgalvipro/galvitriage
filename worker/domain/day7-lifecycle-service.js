import { GVError, clean, newId, now } from '../day5-common.js';

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
const parse=(v,f={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return f}};

export async function latestFounderShot(env,contextId){
  const context=await first(env.DB,'SELECT context_id,founder_id,bmr_id,record_mode,lifecycle_state FROM gv1_principal_contexts WHERE context_id=?',clean(contextId));
  if(!context)throw new GVError('GV_NOT_FOUND','Principal context was not found.',404);
  const row=await first(env.DB,"SELECT * FROM gv1_founder_snapshots WHERE principal_id=? AND validation_status IN ('accepted','needs_review') ORDER BY version_no DESC,created_at DESC LIMIT 1",context.founder_id);
  return row?{...row,snapshot:parse(row.snapshot_json,{}),lifecycle_assessment:parse(row.lifecycle_assessment_json,{})}:null;
}

async function copyPrincipalEvidenceToBmr(env,ctx,principalId,bmrId,sessionId){
  const rows=await all(env.DB,"SELECT evidence_id,category,source_type,source_ref,validation_status,payload_json,provenance_json,schema_version,captured_at,created_at FROM gv1_principal_evidence_items WHERE founder_id=? AND status='accepted' ORDER BY created_at,evidence_id",principalId);
  const stmts=[],links=[];for(const row of rows){
    const evidenceId=newId('evd'),ts=now(),content={founder_id:principalId,validation_status:row.validation_status,payload:parse(row.payload_json,{}),provenance:{...parse(row.provenance_json,{}),migrated_from_principal_evidence_id:row.evidence_id},schema_version:row.schema_version||'0100'};
    stmts.push(env.DB.prepare(`INSERT INTO gv1_evidence_items(evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at) VALUES(?,?,?,?,?,?,?,NULL,1,?)`).bind(evidenceId,bmrId,sessionId,row.category,'FounderShot',row.source_ref||row.evidence_id,JSON.stringify(content),row.captured_at||row.created_at||ts));
    stmts.push(env.DB.prepare(`INSERT INTO gv1_evidence_lineage_links(lineage_id,founder_id,bmr_id,source_kind,source_evidence_id,target_kind,target_evidence_id,relationship_type,actor_type,actor_id,correlation_id,created_at) VALUES(?,? ,?,'principal',?,'bmr',?,'graduated_to_business_health','business_physician','business_physician',?,?)`).bind(newId('lin'),principalId,bmrId,row.evidence_id,evidenceId,ctx.correlation,ts));
    links.push({source_evidence_id:row.evidence_id,target_evidence_id:evidenceId});
  }
  if(stmts.length)await env.DB.batch(stmts);return links;
}

export async function applyLifecycleReview(env,ctx,identity,reviewId,input={}){
  if(identity?.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authority is required to apply a founder lifecycle transition.',403);
  const review=await first(env.DB,`SELECT r.*,c.record_mode,c.lifecycle_state,c.bmr_id,c.venture_id,c.status AS context_status FROM gv1_lifecycle_transition_reviews r JOIN gv1_principal_contexts c ON c.context_id=r.source_context_id WHERE r.review_id=?`,clean(reviewId));
  if(!review)throw new GVError('GV_NOT_FOUND','Lifecycle transition review was not found.',404);
  if(review.status==='applied')return{review,idempotent_replay:true};
  if(review.status!=='proposed')throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION','Only a proposed lifecycle review can be applied.',409);
  const target=clean(input.classification||review.proposed_lifecycle);if(!['pre_founder','operating_founder'].includes(target))throw new GVError('GV_LIFECYCLE_EVIDENCE_REQUIRED','Lifecycle must be resolved to Pre-Founder or Operating Founder before applying.',409);
  const evidence=Array.isArray(input.formation_evidence)?input.formation_evidence.map(clean).filter(Boolean):[];
  const ts=now();let contextId=review.source_context_id,bmrId=review.bmr_id||null,ventureId=review.venture_id||null,links=[];
  if(target==='pre_founder'){
    if(review.record_mode==='principal_only'){
      await env.DB.prepare("UPDATE gv1_lifecycle_transition_reviews SET status='applied',actor_type='business_physician',actor_id=?,decided_at=? WHERE review_id=?").bind(identity.operator_id||identity.id,ts,review.review_id).run();
      return{review:await first(env.DB,'SELECT * FROM gv1_lifecycle_transition_reviews WHERE review_id=?',review.review_id),context_id:contextId,bmr_id:null,idempotent_replay:false};
    }
    const existing=await first(env.DB,"SELECT context_id FROM gv1_principal_contexts WHERE founder_id=? AND lifecycle_state='pre_founder' AND record_mode='principal_only' AND status='active' LIMIT 1",review.principal_id);
    contextId=existing?.context_id||newId('ctx');
    const stmts=[env.DB.prepare("UPDATE gv1_principal_contexts SET status='superseded',record_version=record_version+1,updated_at=? WHERE context_id=?").bind(ts,review.source_context_id)];
    if(review.bmr_id)stmts.push(env.DB.prepare("UPDATE gv1_business_medical_records SET status='closed',closed_at=COALESCE(closed_at,?),updated_at=? WHERE bmr_id=?").bind(ts,ts,review.bmr_id));
    if(!existing)stmts.push(env.DB.prepare(`INSERT INTO gv1_principal_contexts(context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,source,status,record_version,client_request_id,created_at,updated_at) VALUES(?,?,'pre_founder','founder_smb','self','principal_only',NULL,NULL,'foundershot_lifecycle_review','active',1,?,?,?)`).bind(contextId,review.principal_id,`lifecycle.${review.review_id}.prefounder`,ts,ts));
    stmts.push(env.DB.prepare("UPDATE gv1_lifecycle_transition_reviews SET status='applied',proposed_lifecycle='pre_founder',applied_context_id=?,applied_bmr_id=NULL,actor_type='business_physician',actor_id=?,decided_at=? WHERE review_id=?").bind(contextId,identity.operator_id||identity.id,ts,review.review_id));
    await env.DB.batch(stmts);bmrId=null;
  }else{
    if(review.record_mode==='principal_plus_venture'&&review.bmr_id){await env.DB.prepare("UPDATE gv1_lifecycle_transition_reviews SET status='applied',proposed_lifecycle='operating_founder',applied_context_id=?,applied_bmr_id=?,actor_type='business_physician',actor_id=?,decided_at=? WHERE review_id=?").bind(review.source_context_id,review.bmr_id,identity.operator_id||identity.id,ts,review.review_id).run();return{review:await first(env.DB,'SELECT * FROM gv1_lifecycle_transition_reviews WHERE review_id=?',review.review_id),context_id:review.source_context_id,bmr_id:review.bmr_id,idempotent_replay:false};}
    if(!clean(input.venture_name)||!evidence.length)throw new GVError('GV_VENTURE_FORMATION_EVIDENCE_REQUIRED','Operating-Founder graduation requires a venture name and at least one Business Physician-confirmed formation/operation evidence statement.',409);
    const existingRole=await first(env.DB,`SELECT v.venture_id,b.bmr_id FROM gv1_founder_venture_roles r JOIN gv1_ventures v ON v.venture_id=r.venture_id LEFT JOIN gv1_business_medical_records b ON b.venture_id=v.venture_id WHERE r.founder_id=? AND r.status='active' AND lower(trim(v.venture_name))=lower(trim(?)) ORDER BY r.is_primary DESC LIMIT 1`,review.principal_id,clean(input.venture_name));
    ventureId=existingRole?.venture_id||newId('ven');bmrId=existingRole?.bmr_id||newId('bmr');contextId=newId('ctx');const sessionId=newId('gvs');
    const stmts=[env.DB.prepare("UPDATE gv1_principal_contexts SET status='superseded',record_version=record_version+1,updated_at=? WHERE context_id=?").bind(ts,review.source_context_id)];
    if(!existingRole?.venture_id){stmts.push(env.DB.prepare("INSERT INTO gv1_ventures(venture_id,venture_name,stage,status,record_version,created_at,updated_at) VALUES(?,?,'launching','active',1,?,?)").bind(ventureId,clean(input.venture_name),ts,ts));stmts.push(env.DB.prepare("INSERT INTO gv1_founder_venture_roles(founder_id,venture_id,role_code,is_primary,status,created_at,updated_at) VALUES(?,?,'founder',1,'active',?,?)").bind(review.principal_id,ventureId,ts,ts));}
    if(!existingRole?.bmr_id)stmts.push(env.DB.prepare("INSERT INTO gv1_business_medical_records(bmr_id,venture_id,status,record_version,current_session_id,opened_at,closed_at,created_at,updated_at) VALUES(?,?,'open',1,?,?,NULL,?,?)").bind(bmrId,ventureId,sessionId,ts,ts,ts));
    stmts.push(env.DB.prepare(`INSERT INTO gv1_assessment_sessions(session_id,bmr_id,venture_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at) VALUES(?,?,?,?,?,'foundershot_lifecycle_transition','GalviTriage','active',?,NULL,?,?)`).bind(sessionId,bmrId,ventureId,review.principal_id,`scenario-c:${review.review_id}`,ts,ts,ts));
    stmts.push(env.DB.prepare(`INSERT INTO gv1_principal_contexts(context_id,founder_id,lifecycle_state,care_protocol,payer_type,record_mode,venture_id,bmr_id,source,status,record_version,client_request_id,created_at,updated_at) VALUES(?,?,'owner_operator','founder_smb','self','principal_plus_venture',?,?,'foundershot_lifecycle_review','active',1,?,?,?)`).bind(contextId,review.principal_id,ventureId,bmrId,`lifecycle.${review.review_id}.operating`,ts,ts));
    stmts.push(env.DB.prepare("UPDATE gv1_business_medical_records SET current_session_id=?,updated_at=? WHERE bmr_id=?").bind(sessionId,ts,bmrId));
    stmts.push(env.DB.prepare("UPDATE gv1_lifecycle_transition_reviews SET status='applied',proposed_lifecycle='operating_founder',venture_name=?,applied_context_id=?,applied_bmr_id=?,actor_type='business_physician',actor_id=?,decided_at=? WHERE review_id=?").bind(clean(input.venture_name),contextId,bmrId,identity.operator_id||identity.id,ts,review.review_id));
    await env.DB.batch(stmts);links=await copyPrincipalEvidenceToBmr(env,ctx,review.principal_id,bmrId,sessionId);
    const snapshot=await first(env.DB,'SELECT snapshot_json,lifecycle_assessment_json FROM gv1_founder_snapshots WHERE founder_snapshot_id=?',review.source_snapshot_id),evidenceId=newId('evd');
    await env.DB.prepare(`INSERT INTO gv1_evidence_items(evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at) VALUES(?,?,?,'founder_snapshot','FounderShot',?,?,NULL,1,?)`).bind(evidenceId,bmrId,sessionId,review.source_snapshot_id,JSON.stringify({founder_snapshot:parse(snapshot?.snapshot_json,{}),lifecycle_assessment:parse(snapshot?.lifecycle_assessment_json,{}),formation_evidence:evidence,source_context_id:review.source_context_id}),ts).run();
  }
  return{review:await first(env.DB,'SELECT * FROM gv1_lifecycle_transition_reviews WHERE review_id=?',review.review_id),context_id:contextId,bmr_id:bmrId,venture_id:ventureId,evidence_lineage_links:links,manual_repair:'NO',idempotent_replay:false};
}

export async function pendingLifecycleReviews(env){const items=await all(env.DB,`SELECT r.review_id,r.principal_id,r.source_context_id,r.source_snapshot_id,r.from_lifecycle,r.proposed_lifecycle,r.confidence,r.rationale_json,r.status,r.venture_name,r.created_at,f.first_name,f.last_name,f.email FROM gv1_lifecycle_transition_reviews r JOIN gv1_founders f ON f.founder_id=r.principal_id WHERE r.status='proposed' ORDER BY r.created_at`);return{items:items.map(x=>({...x,rationale:parse(x.rationale_json,{})})),manual_repair:'NO'}}
