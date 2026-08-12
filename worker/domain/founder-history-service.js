import { GVError, clean, hash, newId, now, requireId } from '../day4-common.js';

const SNAPSHOT_FIELDS=['archetype','founder_identity','stage','trajectory','transition','long_term_potential'];
const GENOME_FIELDS=['primary_motivation','decision_style','leadership_style','learning_style','communication_style','risk_orientation','founder_energy','greatest_untapped_asset'];
const CONTAMINATION=/\b(harry|duplex|microbeads|\bamr\b|hospital|healthcare[- ]regulatory)\b/i;
const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();
const all=async(db,sql,...p)=>(await db.prepare(sql).bind(...p).all()).results||[];
const bounded=(value,max=1000)=>{const v=clean(value);return v?v.slice(0,max):null;};
const actorId=(actor)=>actor?.operator_id||actor?.id||'operator';

export const normalizeFounderEmail=(value)=>clean(value).toLowerCase();
export const normalizeVentureName=(value)=>clean(value).toLowerCase().replace(/\s+/g,' ');

export async function validateHistoricalRow(row){
  const sourceRowKey=bounded(row?.source_row_key,180);
  const email=normalizeFounderEmail(row?.email);
  const ventureName=bounded(row?.venture_name,240);
  const sourceRef=bounded(row?.source_ref||row?.source_artifact,500);
  const checksum=clean(row?.source_artifact_checksum).toLowerCase();
  const disposition=clean(row?.import_disposition||'canonical_fhr_backfill');
  const issues=[];
  if(!sourceRowKey)issues.push('source_row_key_required');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))issues.push('approved_identity_required');
  if(!ventureName)issues.push('venture_required');
  if(!sourceRef)issues.push('source_reference_required');
  if(!/^[a-f0-9]{64}$/.test(checksum))issues.push('sha256_checksum_required');
  if(!['canonical_fhr_backfill','intelligence_reference','source_pending'].includes(disposition))issues.push('invalid_disposition');
  const observations=[];
  for(const [section,fields] of [['snapshot',SNAPSHOT_FIELDS],['genome',GENOME_FIELDS]]){
    for(const field of fields){const statement=bounded(row?.[section]?.[field]);if(statement)observations.push({section,field,statement});}
  }
  for(const statement of Array.isArray(row?.historical_growth_opportunities)?row.historical_growth_opportunities:[]){const value=bounded(statement);if(value)observations.push({section:'growth_opportunity',field:'growth_opportunity',statement:value});}
  for(const statement of Array.isArray(row?.historical_next_steps)?row.historical_next_steps:[]){const value=bounded(statement);if(value)observations.push({section:'next_step',field:'next_step',statement:value});}
  return {valid:issues.length===0,issues,normalized:{source_row_key:sourceRowKey,email,display_name:bounded(row?.display_name,240),venture_name:ventureName,source_ref:sourceRef,source_artifact_version:bounded(row?.source_artifact_version,120),source_artifact_checksum:checksum,source_event_at:bounded(row?.source_event_at,40),import_disposition:disposition,observations}};
}

export async function planHistoricalImport(env,row){
  const validation=await validateHistoricalRow(row), r=validation.normalized;
  if(!validation.valid||r.import_disposition==='source_pending')return {source_row_key:r.source_row_key||'invalid',disposition:'quarantine',reasons:validation.issues.length?validation.issues:['source_pending'],email:'[REDACTED]'};
  const founder=await first(env.DB,'SELECT founder_id FROM gv1_founders WHERE normalized_email=?',r.email);
  const ventures=founder?await all(env.DB,`SELECT v.venture_id,b.bmr_id FROM gv1_founder_venture_roles x JOIN gv1_ventures v ON v.venture_id=x.venture_id LEFT JOIN gv1_business_medical_records b ON b.venture_id=v.venture_id WHERE x.founder_id=? AND x.status='active' AND lower(trim(v.venture_name))=?`,founder.founder_id,normalizeVentureName(r.venture_name)):[];
  return {source_row_key:r.source_row_key,disposition:ventures.length>1?'quarantine':'ready',founder:founder?'existing':'create',venture:ventures[0]?'existing':'create',bmr:ventures[0]?.bmr_id?'existing':'create',historical_session:'new_or_replay',expected_evidence_count:1,expected_observation_count:r.observations.length,source_checksum_status:'valid',identity_venture_conflict:ventures.length>1,email:'[REDACTED]'};
}

async function reconcileQuarantinedHistoricalRow(env,ctx,actor,{batchId,r,validation,fingerprint,timestamp}){
  const sourceRowKey=r.source_row_key||'invalid';
  const reasons=validation.issues.length?validation.issues:['source_pending'];
  const result={import_batch_id:batchId,source_row_key:sourceRowKey,disposition:'quarantine',result_type:'skipped',reasons,idempotent_replay:false};
  const safeMessage=`Historical row quarantined: ${reasons.join(',')}.`;
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO gv1_import_batches
      (import_batch_id,source_system,source_reference,status,row_count,accepted_count,rejected_count,started_at,completed_at,created_at,source_name,source_checksum,environment,expected_count,processed_count,imported_count,skipped_count,error_count,created_by,updated_at)
      VALUES (?,'historical_galvishot',?,'completed',1,0,1,?,?,?,?,?,?,1,1,0,1,0,?,?)`)
      .bind(batchId,r.source_ref,timestamp,timestamp,timestamp,'FCD/GalviShot',r.source_artifact_checksum||null,ctx.environment,actorId(actor),timestamp),
    env.DB.prepare(`INSERT INTO gv1_import_errors
      (import_error_id,import_batch_id,source_row_reference,error_code,safe_error_message,safe_error_json,created_at,source_row_key,field_name,quarantined_payload_json,correlation_id)
      VALUES (?,?,?,?,?,?,?,?,NULL,?,?)`)
      .bind(newId('ime'),batchId,sourceRowKey,'GV_IMPORT_QUARANTINED',safeMessage,JSON.stringify({reasons}),timestamp,sourceRowKey,JSON.stringify({source_row_key:sourceRowKey,disposition:'quarantine',reasons}),ctx.correlation),
    env.DB.prepare(`INSERT INTO gv1_import_row_receipts
      (import_batch_id,source_row_key,request_fingerprint,result_type,canonical_entity_id,error_code,response_json,created_at)
      VALUES (?,?,?,'skipped',NULL,'GV_IMPORT_QUARANTINED',?,?)`)
      .bind(batchId,sourceRowKey,fingerprint,JSON.stringify(result),timestamp)
  ]);
  return result;
}

export async function importHistoricalFounder(env,ctx,actor,row,{batchId=null}={}){
  const validation=await validateHistoricalRow(row), r=validation.normalized, timestamp=now();
  batchId=batchId?requireId('import_batch_id',batchId):newId('imp');
  const fingerprint=await hash('day9:fhr-row',r);
  const receipt=await first(env.DB,'SELECT request_fingerprint,response_json FROM gv1_import_row_receipts WHERE import_batch_id=? AND source_row_key=?',batchId,r.source_row_key||'invalid');
  if(receipt){if(receipt.request_fingerprint!==fingerprint)throw new GVError('GV_IMPORT_FINGERPRINT_CONFLICT','The source row changed after it was reconciled.',409);return {...JSON.parse(receipt.response_json),idempotent_replay:true};}
  if(!validation.valid||r.import_disposition==='source_pending')return reconcileQuarantinedHistoricalRow(env,ctx,actor,{batchId,r,validation,fingerprint,timestamp});
  if(r.import_disposition!=='canonical_fhr_backfill')throw new GVError('GV_IMPORT_DISPOSITION','Canonical import requires canonical_fhr_backfill disposition.',422);
  let founder=await first(env.DB,'SELECT founder_id FROM gv1_founders WHERE normalized_email=?',r.email), creatingFounder=!founder;
  if(!founder)founder={founder_id:newId('fdr')};
  const matches=creatingFounder?[]:await all(env.DB,`SELECT v.venture_id,b.bmr_id FROM gv1_founder_venture_roles x JOIN gv1_ventures v ON v.venture_id=x.venture_id LEFT JOIN gv1_business_medical_records b ON b.venture_id=v.venture_id WHERE x.founder_id=? AND x.status='active' AND lower(trim(v.venture_name))=?`,founder.founder_id,normalizeVentureName(r.venture_name));
  if(matches.length>1)throw new GVError('GV_VENTURE_AMBIGUOUS','Venture identity is ambiguous; no canonical state was changed.',409);
  const venture={venture_id:matches[0]?.venture_id||newId('ven')}, creatingVenture=!matches[0];
  const bmr={bmr_id:matches[0]?.bmr_id||newId('bmr')};
  const sessionId=newId('ses'), evidenceId=newId('evi');
  const result={import_batch_id:batchId,source_row_key:r.source_row_key,founder_id:founder.founder_id,venture_id:venture.venture_id,bmr_id:bmr.bmr_id,historical_session_id:sessionId,evidence_id:evidenceId,observation_ids:r.observations.map(()=>newId('obs')),idempotent_replay:false};
  const statements=[];
  statements.push(env.DB.prepare(`INSERT OR IGNORE INTO gv1_import_batches (import_batch_id,source_system,source_reference,status,row_count,accepted_count,rejected_count,started_at,created_at,source_name,source_checksum,environment,expected_count,processed_count,imported_count,skipped_count,error_count,created_by,updated_at) VALUES (?,'historical_galvishot',?,'completed',1,1,0,?,?,?,?,?,1,1,1,0,0,?,?)`).bind(batchId,r.source_ref,timestamp,timestamp,'FCD/GalviShot',r.source_artifact_checksum,ctx.environment,actorId(actor),timestamp));
  if(creatingFounder)statements.push(env.DB.prepare(`INSERT INTO gv1_founders (founder_id,first_name,last_name,email,normalized_email,consent_status,status,record_version,created_at,updated_at) VALUES (?,?,?,?,?,'approved','active',1,?,?)`).bind(founder.founder_id,r.display_name,null,r.email,r.email,timestamp,timestamp));
  if(creatingVenture){statements.push(env.DB.prepare(`INSERT INTO gv1_ventures (venture_id,venture_name,status,record_version,created_at,updated_at) VALUES (?,?,'active',1,?,?)`).bind(venture.venture_id,r.venture_name,timestamp,timestamp));statements.push(env.DB.prepare(`INSERT INTO gv1_founder_venture_roles (founder_id,venture_id,role_code,is_primary,status,created_at,updated_at) VALUES (?,?,'founder',1,'active',?,?)`).bind(founder.founder_id,venture.venture_id,timestamp,timestamp));statements.push(env.DB.prepare(`INSERT INTO gv1_business_medical_records (bmr_id,venture_id,status,record_version,current_session_id,opened_at,created_at,updated_at) VALUES (?,?,'active',1,NULL,?,?,?)`).bind(bmr.bmr_id,venture.venture_id,timestamp,timestamp,timestamp));}
  statements.push(env.DB.prepare(`INSERT INTO gv1_assessment_sessions (session_id,bmr_id,venture_id,founder_id,client_session_key,source,current_stage,status,started_at,completed_at,created_at,updated_at) VALUES (?,?,?,?,?,'historical_galvishot','Historical Founder Context','completed',?,?,?,?)`).bind(sessionId,bmr.bmr_id,venture.venture_id,founder.founder_id,`day9:${batchId}:${r.source_row_key}`,r.source_event_at||timestamp,r.source_event_at||timestamp,timestamp,timestamp));
  statements.push(env.DB.prepare(`INSERT INTO gv1_evidence_items (evidence_id,bmr_id,session_id,evidence_type,source_product,source_reference,content_json,confidence,evidence_version,created_at,evidence_group_id,version_no,source_type,source_ref,value_type,value_json,status,consent_status,source_actor_type,captured_at,content_hash,updated_at) VALUES (?,?,?,'source_artifact','GalviShot',?,?,100,1,?,?,1,'historical_galvishot',?,'file_reference',?,'accepted','approved','operator',?,?,?)`).bind(evidenceId,bmr.bmr_id,sessionId,r.source_ref,JSON.stringify({artifact_version:r.source_artifact_version,checksum:r.source_artifact_checksum,as_of:r.source_event_at}),timestamp,`day9:${r.source_row_key}`,r.source_ref,JSON.stringify({checksum:r.source_artifact_checksum}),r.source_event_at||timestamp,r.source_artifact_checksum,timestamp));
  r.observations.forEach((o,i)=>{const id=result.observation_ids[i];statements.push(env.DB.prepare(`INSERT INTO gv1_observations (observation_id,bmr_id,session_id,observation_type,dimension,statement,severity,evidence_version,created_at,updated_at,version_no,source_type,source_version,status,correlation_id) VALUES (?,?,?,'historical_founder_context',?,?,'historical',1,?,?,1,'historical_galvishot',?,'active',?)`).bind(id,bmr.bmr_id,sessionId,`${o.section}.${o.field}`,o.statement,timestamp,timestamp,r.source_artifact_version||'historical',ctx.correlation));statements.push(env.DB.prepare('INSERT INTO gv1_observation_evidence (observation_id,evidence_id,created_at) VALUES (?,?,?)').bind(id,evidenceId,timestamp));});
  statements.push(env.DB.prepare(`INSERT INTO gv1_journey_events (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at) VALUES (?,?,?,?, 'historical_founder_context_imported','GalviVault','Historical Founder Context',?,'operator',?,?,?, ?,?)`).bind(newId('jev'),`day9:${batchId}:${r.source_row_key}`,bmr.bmr_id,sessionId,r.source_event_at||timestamp,JSON.stringify({source_row_key:r.source_row_key}),fingerprint,ctx.correlation,ctx.environment,timestamp));
  statements.push(env.DB.prepare(`INSERT INTO gv1_audit_log (audit_id,entity_type,entity_id,operation,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at) VALUES (?,'historical_import',?,'create','operator','day9-fhr-import','historical_context_imported',?,?,?,?,?)`).bind(newId('aud'),sessionId,JSON.stringify({source_row_key:r.source_row_key,evidence_count:1,observation_count:r.observations.length}),ctx.correlation,ctx.environment,timestamp,timestamp));
  statements.push(env.DB.prepare(`INSERT INTO gv1_import_row_receipts (import_batch_id,source_row_key,request_fingerprint,result_type,canonical_entity_id,response_json,created_at) VALUES (?,?,?,'imported',?,?,?)`).bind(batchId,r.source_row_key,fingerprint,sessionId,JSON.stringify(result),timestamp));
  await env.DB.batch(statements); return result;
}

export async function getFounderHealthProjection(env,bmrId,{limit=40}={}){
  bmrId=requireId('bmr_id',bmrId);limit=Math.max(1,Math.min(100,Number(limit)||40));
  const core=await first(env.DB,`SELECT b.bmr_id,b.venture_id,r.founder_id FROM gv1_business_medical_records b JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active' AND r.is_primary=1 WHERE b.bmr_id=?`,bmrId);
  if(!core)throw new GVError('GV_NOT_FOUND','Business Medical Record not found.',404);
  const rows=await all(env.DB,`SELECT o.observation_id,o.session_id,o.dimension,o.statement,o.created_at,e.evidence_id,e.source_ref,e.content_hash,e.captured_at,e.value_json FROM gv1_observations o JOIN gv1_observation_evidence x ON x.observation_id=o.observation_id JOIN gv1_evidence_items e ON e.evidence_id=x.evidence_id WHERE o.bmr_id=? AND o.observation_type='historical_founder_context' AND e.bmr_id=o.bmr_id ORDER BY o.created_at DESC LIMIT ?`,bmrId,limit);
  const projection={context_version:'day9-fhr-v1',founder_id:core.founder_id,venture_id:core.venture_id,bmr_id:core.bmr_id,context_as_of:rows[0]?.captured_at||null,historical_sessions:[...new Set(rows.map(x=>x.session_id))],founder_snapshot:{},genome:{},historical_growth_opportunities:[],historical_next_steps:[],provenance:{source_bmr_ids:[bmrId],source_artifact_checksums:[...new Set(rows.map(x=>x.content_hash).filter(Boolean))],evidence_refs:[...new Set(rows.map(x=>x.evidence_id))],observation_refs:rows.map(x=>x.observation_id)}};
  for(const row of rows){const [section,field]=String(row.dimension||'').split('.');const fact={value:row.statement,as_of:row.captured_at,evidence_ref:row.evidence_id,observation_ref:row.observation_id,source_ref:row.source_ref};if(section==='snapshot')projection.founder_snapshot[field]=fact;else if(section==='genome')projection.genome[field]=fact;else if(section==='growth_opportunity')projection.historical_growth_opportunities.push(fact);else if(section==='next_step')projection.historical_next_steps.push(fact);}
  return projection;
}

export async function composeFounderIntelligenceContext(env,actor,{founderId,ventureId,bmrId,maxEvidenceRefs=25}={}){
  if(!actor||!['business_physician','clinician','operator','admin','internal_service'].includes(actor.role))throw new GVError('GV_AUTH_FORBIDDEN','Founder Intelligence Context is internal only.',403);
  const maxRefs=Math.max(1,Math.min(50,Number(maxEvidenceRefs)||25));
  const fhr=await getFounderHealthProjection(env,bmrId,{limit:Math.min(100,maxRefs*4)});
  if(fhr.founder_id!==founderId||fhr.venture_id!==ventureId)throw new GVError('GV_SCOPE_MISMATCH','Founder Intelligence scope does not match the canonical BMR.',403);

  const currentSession=await first(env.DB,`SELECT session_id,source,current_stage,status,started_at,completed_at,updated_at
    FROM gv1_assessment_sessions
    WHERE bmr_id=? AND lower(coalesce(source,'')) NOT IN ('historical_galvishot','historical_fcd_galvishot')
    ORDER BY updated_at DESC LIMIT 1`,bmrId);
  const currentEvidence=currentSession?await all(env.DB,`SELECT evidence_id,session_id,source_product,source_type,source_ref,evidence_version,status,captured_at,created_at
    FROM gv1_evidence_items
    WHERE bmr_id=? AND session_id=? AND lower(coalesce(source_type,'')) NOT IN ('historical_galvishot','historical_fcd_galvishot')
    ORDER BY created_at DESC LIMIT ?`,bmrId,currentSession.session_id,maxRefs):[];
  const currentFindings=await all(env.DB,`SELECT finding_id,finding_code,confirmation_status,status,confidence,source_type,source_version
    FROM gv1_findings
    WHERE bmr_id=? AND status IN ('draft','active')
    ORDER BY created_at DESC LIMIT 10`,bmrId);
  const treatmentPlans=await all(env.DB,`SELECT treatment_plan_id,treatment_code,status,version_no
    FROM gv1_treatment_plans
    WHERE bmr_id=? AND status NOT IN ('cancelled','superseded','archived')
    ORDER BY created_at DESC LIMIT 10`,bmrId);
  const outcomes=await all(env.DB,`SELECT outcome_id,outcome_code,status,measured_at
    FROM gv1_outcomes
    WHERE bmr_id=? AND status NOT IN ('rejected','superseded','archived')
    ORDER BY measured_at DESC LIMIT 10`,bmrId);

  const currentEvidenceRefs=currentEvidence.map(x=>x.evidence_id);
  const historicalRefs=fhr.provenance.evidence_refs||[];
  return {
    context_version:'day9-founder-intelligence-v1',
    founder_identity_ref:founderId,
    venture_ref:ventureId,
    bmr_ref:bmrId,
    continuity_status:currentSession&&fhr.historical_sessions.length?'returning_same_venture':fhr.historical_sessions.length?'historical_only':'current_only',
    historical_fhr:fhr,
    current_business_health:{
      source:'canonical_bmr',
      bmr_id:bmrId,
      current_session_ref:currentSession?.session_id||null,
      current_session:currentSession||null,
      current_evidence_refs:currentEvidenceRefs
    },
    current_findings_summary:currentFindings,
    treatment_outcome_summary:{
      treatment_plan_refs:treatmentPlans.map(x=>x.treatment_plan_id),
      outcome_refs:outcomes.map(x=>x.outcome_id)
    },
    evidence_refs:[...new Set([...historicalRefs,...currentEvidenceRefs])].slice(0,maxRefs),
    source_versions:fhr.provenance.source_artifact_checksums,
    contradictions_or_staleness:[],
    generated_at:now()
  };
}

export function sanitizeIntelligenceReference(input){const sections=(Array.isArray(input?.sections)?input.sections:[]).map(value=>bounded(value)).filter(Boolean);const accepted=sections.filter(x=>!CONTAMINATION.test(x));return {candidate_type:'historical_founder_pattern_reference',status:'proposed',source_bmr_ids:[],accepted_sections:accepted,quarantined_count:sections.length-accepted.length,canonical_profile_created:false};}
