import { GVError, clean, newId, now, hash, requireId, requireText, optionalText, confidence, enumValue } from '../day4-common.js';
import {
  first, findBmr, findEvidence, findObservation, findHypothesis, findFinding,
  loadReceipt, receiptStmt, currentFindingForGroup, observationLinks, hypothesisLinks,
  findingLinks, listCurrentReasoning, listReasoningHistory
} from '../repositories/reasoning-repository.js';

const OBS_SUPPORT = ['supports','contradicts','contextualizes'];
const HYP_REL = ['supports','contradicts','contextualizes'];
const FIND_REL = ['supports','contradicts','contextualizes'];
const FIND_HYP_REL = ['derived_from','supports','rejects'];

async function sessionForBmr(db, bmr) {
  if (bmr.current_session_id) return bmr.current_session_id;
  const row = await first(db, `SELECT session_id FROM gv1_assessment_sessions WHERE bmr_id=? ORDER BY created_at DESC LIMIT 1`, bmr.bmr_id);
  if (!row?.session_id) throw new GVError('GV_LIFECYCLE_INVALID_TRANSITION', 'A current BMR session is required for Day 4 reasoning.', 409);
  return row.session_id;
}

function eventStmt(db, { id, key, bmrId, sessionId, name, timestamp, actor, metadata, fingerprint, correlation, environment }) {
  return db.prepare(`INSERT INTO gv1_journey_events
    (journey_event_id,event_key,bmr_id,session_id,event_name,product,current_stage,occurred_at,actor_type,metadata_json,request_fingerprint,correlation_id,environment,created_at)
    VALUES (?,?,?,?,?,'GalviVault','Day4',?,?,?,?,?,?,?)`)
    .bind(id,key,bmrId,sessionId,name,timestamp,actor.role,JSON.stringify(metadata),fingerprint,correlation,environment,timestamp);
}

function auditStmt(db, { id, entityType, entityId, operation, priorVersion, newVersion, actor, source, reason, change, correlation, environment, timestamp }) {
  return db.prepare(`INSERT INTO gv1_audit_log
    (audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id,entityType,entityId,operation,priorVersion,newVersion,actor.role,source,reason || null,JSON.stringify(change || {}),correlation,environment,timestamp,timestamp);
}

async function replay(db, scope, key, fingerprint, loader) {
  const receipt = await loadReceipt(db, scope, key);
  if (!receipt) return null;
  if (receipt.request_fingerprint !== fingerprint) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH', 'The idempotency key was reused with different content.', 409);
  return loader(receipt.response_entity_id);
}

async function sameBmrEvidence(db, bmrId, refs) {
  const rows = [];
  for (const item of refs) {
    const evidenceId = requireId('evidence_id', item.evidence_id || item.id);
    const supportType = enumValue('support_type', item.support_type, OBS_SUPPORT, 'supports');
    const row = await findEvidence(db, evidenceId);
    if (!row) throw new GVError('GV_NOT_FOUND', `Evidence ${evidenceId} was not found.`, 404);
    if (row.bmr_id !== bmrId) throw new GVError('GV_AUTH_FORBIDDEN', 'Cross-BMR evidence support is prohibited.', 403);
    if (!['accepted','draft'].includes(clean(row.status).toLowerCase())) throw new GVError('GV_REQ_SCHEMA', 'Evidence is not eligible for reasoning support.', 422);
    rows.push({ row, evidenceId, supportType, weight: item.weight ?? null });
  }
  return rows;
}

async function sameBmrObservations(db, bmrId, refs) {
  const rows = [];
  for (const item of refs) {
    const observationId = requireId('observation_id', item.observation_id || item.id);
    const relationshipType = enumValue('relationship_type', item.relationship_type || item.support_type, HYP_REL, 'supports');
    const row = await findObservation(db, observationId);
    if (!row) throw new GVError('GV_NOT_FOUND', `Observation ${observationId} was not found.`, 404);
    if (row.bmr_id !== bmrId) throw new GVError('GV_AUTH_FORBIDDEN', 'Cross-BMR observation support is prohibited.', 403);
    const links = await observationLinks(db, observationId);
    if (!links.length) throw new GVError('GV_LINEAGE_REQUIRED', 'A supporting observation must retain evidence lineage.', 422);
    rows.push({ row, observationId, relationshipType });
  }
  return rows;
}

async function resolveFindingSupports(db, bmrId, input) {
  const evidence = await sameBmrEvidence(db, bmrId, Array.isArray(input.evidence) ? input.evidence : []);
  const observations = [];
  for (const item of Array.isArray(input.observations) ? input.observations : []) {
    const observationId = requireId('observation_id', item.observation_id || item.id);
    const supportType = enumValue('support_type', item.support_type, FIND_REL, 'supports');
    const row = await findObservation(db, observationId);
    if (!row) throw new GVError('GV_NOT_FOUND', `Observation ${observationId} was not found.`, 404);
    if (row.bmr_id !== bmrId) throw new GVError('GV_AUTH_FORBIDDEN', 'Cross-BMR observation support is prohibited.', 403);
    observations.push({ row, observationId, supportType });
  }
  const hypotheses = [];
  for (const item of Array.isArray(input.hypotheses) ? input.hypotheses : []) {
    const hypothesisId = requireId('hypothesis_id', item.hypothesis_id || item.id);
    const relationshipType = enumValue('relationship_type', item.relationship_type, FIND_HYP_REL, 'derived_from');
    const row = await findHypothesis(db, hypothesisId);
    if (!row) throw new GVError('GV_NOT_FOUND', `Hypothesis ${hypothesisId} was not found.`, 404);
    if (row.bmr_id !== bmrId) throw new GVError('GV_AUTH_FORBIDDEN', 'Cross-BMR hypothesis support is prohibited.', 403);
    hypotheses.push({ row, hypothesisId, relationshipType });
  }
  if (!evidence.length && !observations.length && !hypotheses.length) throw new GVError('GV_LINEAGE_REQUIRED', 'A finding requires explicit support lineage.', 422);
  return { evidence, observations, hypotheses };
}

export async function createObservation(env, ctx, actor, key, input) {
  const bmrId = requireId('bmr_id', input.bmr_id);
  const bmr = await findBmr(env.DB, bmrId);
  if (!bmr) throw new GVError('GV_NOT_FOUND', 'BMR was not found.', 404);
  const refs = Array.isArray(input.evidence) ? input.evidence : Array.isArray(input.evidence_links) ? input.evidence_links : [];
  if (!refs.length) throw new GVError('GV_LINEAGE_REQUIRED', 'An observation requires at least one evidence link.', 422);
  const supports = await sameBmrEvidence(env.DB, bmrId, refs);
  const statement = requireText('statement', input.statement, 2000);
  const domain = optionalText('domain', input.domain, 120);
  const conf = confidence(input.confidence, false);
  const sourceType = requireText('source_type', input.source_type, 80);
  const sourceVersion = optionalText('source_version', input.source_version, 120);
  const fp = await hash('day4:observation:create', { bmrId, statement, domain, conf, sourceType, sourceVersion, supports: supports.map(x => [x.evidenceId,x.supportType]) });
  const prior = await replay(env.DB, 'day4:observation:create', key, fp, async (id) => ({ observation: await findObservation(env.DB,id), links: await observationLinks(env.DB,id), idempotent_replay: true }));
  if (prior) return prior;
  const timestamp = now();
  const observationId = newId('obs');
  const groupId = newId('obg');
  const sessionId = await sessionForBmr(env.DB, bmr);
  const stmts = [
    env.DB.prepare(`INSERT INTO gv1_observations
      (observation_id,bmr_id,session_id,observation_type,dimension,statement,severity,evidence_version,created_at,updated_at,observation_group_id,version_no,supersedes_observation_id,domain,confidence,source_type,source_version,status,created_by_type,created_by_id,correlation_id)
      VALUES (?,?,?,'reasoning',?,?,NULL,1,?,?,?,?,NULL,?,?,?,?,?,?,?,?)`)
      .bind(observationId,bmrId,sessionId,domain,statement,timestamp,timestamp,groupId,1,domain,conf,sourceType,sourceVersion,'active',actor.role,actor.id,ctx.correlation),
    ...supports.map(x => env.DB.prepare(`INSERT INTO gv1_observation_evidence (observation_id,evidence_id,created_at,support_type,correlation_id) VALUES (?,?,?,?,?)`).bind(observationId,x.evidenceId,timestamp,x.supportType,ctx.correlation)),
    eventStmt(env.DB,{id:newId('jev'),key:`day4:observation:${observationId}`,bmrId,sessionId,name:'observation_created',timestamp,actor,metadata:{observation_id:observationId,version_no:1},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),
    auditStmt(env.DB,{id:newId('aud'),entityType:'observation',entityId:observationId,operation:'create',priorVersion:null,newVersion:1,actor,source:sourceType,reason:null,change:{group_id:groupId,support_count:supports.length},correlation:ctx.correlation,environment:ctx.environment,timestamp}),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day4:observation:create',key,fingerprint:fp,status:201,entityType:'observation',entityId:observationId,timestamp})
  ];
  await env.DB.batch(stmts);
  return { observation: await findObservation(env.DB,observationId), links: await observationLinks(env.DB,observationId), idempotent_replay:false };
}

export async function createHypothesis(env, ctx, actor, key, input) {
  const bmrId = requireId('bmr_id', input.bmr_id);
  const bmr = await findBmr(env.DB,bmrId);
  if (!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const refs = Array.isArray(input.observations) ? input.observations : Array.isArray(input.observation_links) ? input.observation_links : [];
  if (!refs.length) throw new GVError('GV_LINEAGE_REQUIRED','A hypothesis requires at least one observation.',422);
  const supports = await sameBmrObservations(env.DB,bmrId,refs);
  const statement = requireText('statement',input.statement,2000);
  const uncertainty = requireText('uncertainty',input.uncertainty,1000);
  const domain = optionalText('domain',input.domain,120);
  const conf = confidence(input.confidence,false);
  const sourceType = requireText('source_type',input.source_type,80);
  const sourceVersion = optionalText('source_version',input.source_version,120);
  const fp = await hash('day4:hypothesis:create',{bmrId,statement,uncertainty,domain,conf,sourceType,sourceVersion,supports:supports.map(x=>[x.observationId,x.relationshipType])});
  const prior = await replay(env.DB,'day4:hypothesis:create',key,fp,async(id)=>({hypothesis:await findHypothesis(env.DB,id),links:await hypothesisLinks(env.DB,id),idempotent_replay:true}));
  if (prior) return prior;
  const timestamp=now(); const hypothesisId=newId('hyp'); const groupId=newId('hyg'); const sessionId=await sessionForBmr(env.DB,bmr);
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_hypotheses
      (hypothesis_id,bmr_id,statement,status,confidence,evidence_version,created_at,updated_at,hypothesis_group_id,version_no,supersedes_hypothesis_id,domain,uncertainty,source_type,source_version,created_by_type,created_by_id,correlation_id)
      VALUES (?,?,?,'active',?,1,?,?,?,?,NULL,?,?,?,?,?,?,?)`)
      .bind(hypothesisId,bmrId,statement,conf,timestamp,timestamp,groupId,1,domain,uncertainty,sourceType,sourceVersion,actor.role,actor.id,ctx.correlation),
    ...supports.map(x=>env.DB.prepare(`INSERT INTO gv1_hypothesis_observations (hypothesis_id,observation_id,relationship_type,created_at,correlation_id) VALUES (?,?,?,?,?)`).bind(hypothesisId,x.observationId,x.relationshipType,timestamp,ctx.correlation)),
    eventStmt(env.DB,{id:newId('jev'),key:`day4:hypothesis:${hypothesisId}`,bmrId,sessionId,name:'hypothesis_created',timestamp,actor,metadata:{hypothesis_id:hypothesisId,version_no:1},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),
    auditStmt(env.DB,{id:newId('aud'),entityType:'hypothesis',entityId:hypothesisId,operation:'create',priorVersion:null,newVersion:1,actor,source:sourceType,reason:null,change:{group_id:groupId,support_count:supports.length},correlation:ctx.correlation,environment:ctx.environment,timestamp}),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day4:hypothesis:create',key,fingerprint:fp,status:201,entityType:'hypothesis',entityId:hypothesisId,timestamp})
  ]);
  return {hypothesis:await findHypothesis(env.DB,hypothesisId),links:await hypothesisLinks(env.DB,hypothesisId),idempotent_replay:false};
}

function findingInsert(db,{findingId,bmrId,groupId,versionNo,supersedesId,findingCode,domain,headline,statement,conf,sourceType,sourceVersion,actor,correlation,timestamp}) {
  return db.prepare(`INSERT INTO gv1_findings
    (finding_id,bmr_id,product,finding_type,title,statement,priority,evidence_version,created_at,updated_at,finding_group_id,version_no,supersedes_finding_id,finding_code,domain,confidence,confidence_band,confirmation_status,governance_version,status,source_type,source_version,created_by_type,created_by_id,confirmation_reason,confirmed_by_type,confirmed_by_id,confirmed_at,correlation_id)
    VALUES (?,?,'GalviVault','governed',?,?,NULL,?,?,?,?,?,?,?,?,?,NULL,'unconfirmed',1,'active',?,?,?,?,NULL,NULL,NULL,NULL,?)`)
    .bind(findingId,bmrId,headline || findingCode,statement,versionNo,timestamp,timestamp,groupId,versionNo,supersedesId,findingCode,domain,conf,sourceType,sourceVersion,actor.role,actor.id,correlation);
}

function findingSupportStatements(db,findingId,supports,timestamp,correlation) {
  return [
    ...supports.evidence.map(x=>db.prepare(`INSERT INTO gv1_finding_evidence (finding_id,evidence_id,created_at,support_type,weight,correlation_id) VALUES (?,?,?,?,?,?)`).bind(findingId,x.evidenceId,timestamp,x.supportType,x.weight,correlation)),
    ...supports.observations.map(x=>db.prepare(`INSERT INTO gv1_finding_observations (finding_id,observation_id,created_at,support_type,correlation_id) VALUES (?,?,?,?,?)`).bind(findingId,x.observationId,timestamp,x.supportType,correlation)),
    ...supports.hypotheses.map(x=>db.prepare(`INSERT INTO gv1_finding_hypotheses (finding_id,hypothesis_id,created_at,relationship_type,correlation_id) VALUES (?,?,?,?,?)`).bind(findingId,x.hypothesisId,timestamp,x.relationshipType,correlation))
  ];
}

export async function createFinding(env,ctx,actor,key,input) {
  const bmrId=requireId('bmr_id',input.bmr_id); const bmr=await findBmr(env.DB,bmrId); if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const findingCode=requireText('finding_code',input.finding_code,120); const statement=requireText('statement',input.statement,2400); const domain=requireText('domain',input.domain,120);
  const headline=optionalText('headline',input.headline,240); const conf=confidence(input.confidence,true); const sourceType=requireText('source_type',input.source_type,80); const sourceVersion=optionalText('source_version',input.source_version,120);
  if (input.confirmation_status && clean(input.confirmation_status).toLowerCase() !== 'unconfirmed') throw new GVError('GV_AUTH_FORBIDDEN','New findings cannot self-confirm.',403);
  const supportInput=input.support && typeof input.support==='object'?input.support:input;
  const supports=await resolveFindingSupports(env.DB,bmrId,supportInput);
  const supportFingerprint={evidence:supports.evidence.map(x=>[x.evidenceId,x.supportType,x.weight]),observations:supports.observations.map(x=>[x.observationId,x.supportType]),hypotheses:supports.hypotheses.map(x=>[x.hypothesisId,x.relationshipType])};
  const fp=await hash('day4:finding:create',{bmrId,findingCode,statement,domain,headline,conf,sourceType,sourceVersion,supportFingerprint});
  const prior=await replay(env.DB,'day4:finding:create',key,fp,async(id)=>({finding:await findFinding(env.DB,id),links:await findingLinks(env.DB,id),idempotent_replay:true})); if(prior)return prior;
  const timestamp=now(); const findingId=newId('fnd'); const groupId=newId('fng'); const sessionId=await sessionForBmr(env.DB,bmr);
  await env.DB.batch([
    findingInsert(env.DB,{findingId,bmrId,groupId,versionNo:1,supersedesId:null,findingCode,domain,headline,statement,conf,sourceType,sourceVersion,actor,correlation:ctx.correlation,timestamp}),
    ...findingSupportStatements(env.DB,findingId,supports,timestamp,ctx.correlation),
    eventStmt(env.DB,{id:newId('jev'),key:`day4:finding:${findingId}`,bmrId,sessionId,name:'finding_created',timestamp,actor,metadata:{finding_id:findingId,version_no:1,confirmation_status:'unconfirmed'},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),
    auditStmt(env.DB,{id:newId('aud'),entityType:'finding',entityId:findingId,operation:'create',priorVersion:null,newVersion:1,actor,source:sourceType,reason:null,change:{group_id:groupId,support_count:supports.evidence.length+supports.observations.length+supports.hypotheses.length},correlation:ctx.correlation,environment:ctx.environment,timestamp}),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day4:finding:create',key,fingerprint:fp,status:201,entityType:'finding',entityId:findingId,timestamp})
  ]);
  return {finding:await findFinding(env.DB,findingId),links:await findingLinks(env.DB,findingId),idempotent_replay:false};
}

export async function supersedeFinding(env,ctx,actor,key,findingId,input) {
  findingId=requireId('finding_id',findingId); const source=await findFinding(env.DB,findingId); if(!source) throw new GVError('GV_NOT_FOUND','Finding was not found.',404);
  const current=await currentFindingForGroup(env.DB,source.finding_group_id); if(!current || current.finding_id!==source.finding_id) throw new GVError('GV_VERSION_CONFLICT','Only the current finding leaf can be superseded.',409);
  const expected=Number(input.expected_version); if(!Number.isInteger(expected)||expected!==Number(source.version_no)) throw new GVError('GV_VERSION_CONFLICT','expected_version does not match the current finding version.',409);
  const reason=requireText('reason',input.reason||input.rationale,500); const statement=requireText('statement',input.statement,2400); const domain=requireText('domain',input.domain??source.domain,120); const findingCode=requireText('finding_code',input.finding_code??source.finding_code,120); const headline=optionalText('headline',input.headline??source.title,240); const conf=confidence(input.confidence??source.confidence,true); const sourceType=requireText('source_type',input.source_type??source.source_type,80); const sourceVersion=optionalText('source_version',input.source_version??source.source_version,120);
  const supportInput=input.support && typeof input.support==='object'?input.support:input; const hasExplicit=['evidence','observations','hypotheses'].some(k=>Array.isArray(supportInput[k]));
  let supports;
  if(hasExplicit){ supports=await resolveFindingSupports(env.DB,source.bmr_id,supportInput); }
  else {
    const links=await findingLinks(env.DB,source.finding_id);
    supports=await resolveFindingSupports(env.DB,source.bmr_id,{evidence:links.evidence,observations:links.observations,hypotheses:links.hypotheses});
  }
  const fp=await hash('day4:finding:supersede',{findingId,expected,reason,statement,domain,findingCode,headline,conf,sourceType,sourceVersion,supports:{evidence:supports.evidence.map(x=>[x.evidenceId,x.supportType]),observations:supports.observations.map(x=>[x.observationId,x.supportType]),hypotheses:supports.hypotheses.map(x=>[x.hypothesisId,x.relationshipType])}});
  const prior=await replay(env.DB,'day4:finding:supersede',key,fp,async(id)=>({finding:await findFinding(env.DB,id),links:await findingLinks(env.DB,id),idempotent_replay:true})); if(prior)return prior;
  const timestamp=now(); const newFindingId=newId('fnd'); const versionNo=Number(source.version_no)+1; const bmr=await findBmr(env.DB,source.bmr_id); const sessionId=await sessionForBmr(env.DB,bmr);
  await env.DB.batch([
    findingInsert(env.DB,{findingId:newFindingId,bmrId:source.bmr_id,groupId:source.finding_group_id,versionNo,supersedesId:source.finding_id,findingCode,domain,headline,statement,conf,sourceType,sourceVersion,actor,correlation:ctx.correlation,timestamp}),
    ...findingSupportStatements(env.DB,newFindingId,supports,timestamp,ctx.correlation),
    eventStmt(env.DB,{id:newId('jev'),key:`day4:finding_superseded:${newFindingId}`,bmrId:source.bmr_id,sessionId,name:'finding_superseded',timestamp,actor,metadata:{finding_id:newFindingId,supersedes_finding_id:source.finding_id,version_no:versionNo},fingerprint:fp,correlation:ctx.correlation,environment:ctx.environment}),
    auditStmt(env.DB,{id:newId('aud'),entityType:'finding',entityId:newFindingId,operation:'supersede',priorVersion:source.version_no,newVersion:versionNo,actor,source:sourceType,reason,change:{supersedes_finding_id:source.finding_id},correlation:ctx.correlation,environment:ctx.environment,timestamp}),
    receiptStmt(env.DB,{id:newId('idem'),scope:'day4:finding:supersede',key,fingerprint:fp,status:201,entityType:'finding',entityId:newFindingId,timestamp})
  ]);
  return {finding:await findFinding(env.DB,newFindingId),links:await findingLinks(env.DB,newFindingId),previous_finding_id:source.finding_id,idempotent_replay:false};
}

export async function getReasoning(env,bmrId,{history=false,limit=100}={}) {
  bmrId=requireId('bmr_id',bmrId); const bmr=await findBmr(env.DB,bmrId); if(!bmr) throw new GVError('GV_NOT_FOUND','BMR was not found.',404);
  const result=history?await listReasoningHistory(env.DB,bmrId,limit):await listCurrentReasoning(env.DB,bmrId);
  for(const observation of result.observations) observation.support=await observationLinks(env.DB,observation.observation_id);
  for(const hypothesis of result.hypotheses) hypothesis.support=await hypothesisLinks(env.DB,hypothesis.hypothesis_id);
  for(const finding of result.findings) finding.support=await findingLinks(env.DB,finding.finding_id);
  return {bmr:{bmr_id:bmr.bmr_id,venture_id:bmr.venture_id,status:bmr.status,record_version:bmr.record_version,current_session_id:bmr.current_session_id},mode:history?'history':'current',...result};
}

export async function getCustomerProjection(env,bmrId) {
  const current=await getReasoning(env,bmrId,{history:false});
  return {bmr:current.bmr,findings:current.findings.filter(f=>f.confirmation_status==='confirmed').map(f=>({finding_id:f.finding_id,finding_group_id:f.finding_group_id,version_no:f.version_no,finding_code:f.finding_code,domain:f.domain,headline:f.title,statement:f.statement,confidence:f.confidence,confirmation_status:f.confirmation_status,source_type:f.source_type,source_version:f.source_version}))};
}
