import {
  GVError, clean, hash, newId, now, requireId
} from '../day5-common.js';
import { first } from '../repositories/care-repository.js';
import { submitCheckin } from './day5-active-care-service.js';

const MANAGE_ROLES = new Set(['business_physician','operator','admin']);
const CHECKIN_ROLES = new Set(['customer','business_physician','galviclinician','operator','admin','galviguide']);
const READ_ROLES = new Set([...CHECKIN_ROLES]);

function role(actor){ return clean(actor?.role).toLowerCase(); }
function requireRole(actor,allowed,message){
  if(!allowed.has(role(actor))) throw new GVError('GV_AUTH_FORBIDDEN',message,403);
}
async function membership(db,id){
  const row=await first(db,`SELECT * FROM gv1_memberships WHERE membership_id=?`,requireId('membership_id',id));
  if(!row) throw new GVError('GV_NOT_FOUND','Business Health Membership was not found.',404);
  return row;
}
async function planScope(db,bmrId,planId){
  const row=await first(db,`SELECT treatment_plan_id,bmr_id,status FROM gv1_treatment_plans WHERE treatment_plan_id=?`,requireId('treatment_plan_id',planId));
  if(!row) throw new GVError('GV_NOT_FOUND','Treatment Plan was not found.',404);
  if(row.bmr_id!==requireId('bmr_id',bmrId)) throw new GVError('GV_AUTH_FORBIDDEN','Cross-BMR membership treatment scope is prohibited.',403);
  return row;
}
function audit(db,ctx,actor,{entityType,entityId,operation,change,ts}){
  return db.prepare(`INSERT INTO gv1_audit_log (
    audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,
    reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at
  ) VALUES (?,?,?,?,NULL,NULL,?,'day7-membership',NULL,?,?,?,?,?)`)
    .bind(newId('aud'),entityType,entityId,operation,role(actor),JSON.stringify(change||{}),ctx.correlation,ctx.environment,ts,ts);
}
async function eventExists(db,key){
  return first(db,`SELECT * FROM gv1_membership_events WHERE client_request_id=?`,key);
}
async function getByRequest(db,key){
  return first(db,`SELECT * FROM gv1_memberships WHERE client_request_id=?`,key);
}

export async function startMembership(env,ctx,actor,key,input){
  requireRole(actor,MANAGE_ROLES,'Business Physician or operator authority is required to start Membership.');
  const bmrId=requireId('bmr_id',input.bmr_id);
  const principalId=requireId('principal_id',input.principal_id);
  const planId=requireId('treatment_plan_id',input.treatment_plan_id);
  const plan=await planScope(env.DB,bmrId,planId);
  const principal=await first(env.DB,`SELECT founder_id FROM gv1_founders WHERE founder_id=?`,principalId);
  if(!principal) throw new GVError('GV_NOT_FOUND','Principal was not found.',404);
  const context=await first(env.DB,`SELECT context_id FROM gv1_principal_contexts WHERE founder_id=? AND bmr_id=? AND status='active' ORDER BY updated_at DESC LIMIT 1`,principalId,bmrId);
  if(!context) throw new GVError('GV_AUTH_FORBIDDEN','Membership principal and BMR do not resolve to the same active canonical context.',403);

  const fp=await hash('day7:membership:start',{principal_id:principalId,bmr_id:bmrId,treatment_plan_id:plan.treatment_plan_id,membership_type:'business_health_beta'});
  const prior=await getByRequest(env.DB,key);
  if(prior){
    if(prior.request_fingerprint!==fp) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused with different Membership content.',409);
    return {membership:prior,idempotent_replay:true};
  }
  const active=await first(env.DB,`SELECT * FROM gv1_memberships WHERE bmr_id=? AND status='active' ORDER BY created_at DESC LIMIT 1`,bmrId);
  if(active) return {membership:active,idempotent_replay:true,existing_active:true};

  const ts=now(),id=newId('mem'),eventId=newId('mev');
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_memberships (
      membership_id,principal_id,bmr_id,treatment_plan_id,membership_type,status,started_at,
      version_no,actor_type,actor_id,client_request_id,request_fingerprint,correlation_id,created_at,updated_at
    ) VALUES (?,?,?,?,?,'active',?,1,?,?,?,?,?,?,?)`)
      .bind(id,principalId,bmrId,planId,'business_health_beta',ts,role(actor),actor.id,key,fp,ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_membership_events (
      membership_event_id,membership_id,event_type,related_entity_type,related_entity_id,
      actor_type,actor_id,correlation_id,client_request_id,created_at
    ) VALUES (?,?, 'membership_started','treatment_plan',?,?,?,?,?,?)`)
      .bind(eventId,id,planId,role(actor),actor.id,ctx.correlation,`${key}:started`,ts),
    audit(env.DB,ctx,actor,{entityType:'membership',entityId:id,operation:'start',change:{bmr_id:bmrId,treatment_plan_id:planId,status:'active'},ts})
  ]);
  return {membership:await membership(env.DB,id),idempotent_replay:false};
}

export async function cancelMembership(env,ctx,actor,key,membershipId){
  requireRole(actor,MANAGE_ROLES,'Business Physician or operator authority is required to cancel Membership.');
  const row=await membership(env.DB,membershipId);
  const prior=await eventExists(env.DB,`${key}:canceled`);
  if(prior) return {membership:await membership(env.DB,membershipId),idempotent_replay:true};
  if(row.status==='canceled'||row.status==='closed') return {membership:row,idempotent_replay:true,already_inactive:true};
  const ts=now(),eventId=newId('mev');
  await env.DB.batch([
    env.DB.prepare(`UPDATE gv1_memberships SET status='canceled',canceled_at=?,version_no=version_no+1,updated_at=? WHERE membership_id=?`)
      .bind(ts,ts,row.membership_id),
    env.DB.prepare(`INSERT INTO gv1_membership_events (
      membership_event_id,membership_id,event_type,related_entity_type,related_entity_id,
      actor_type,actor_id,correlation_id,client_request_id,created_at
    ) VALUES (?,?, 'membership_canceled',NULL,NULL,?,?,?,?,?)`)
      .bind(eventId,row.membership_id,role(actor),actor.id,ctx.correlation,`${key}:canceled`,ts),
    audit(env.DB,ctx,actor,{entityType:'membership',entityId:row.membership_id,operation:'cancel',change:{status:'canceled'},ts})
  ]);
  return {membership:await membership(env.DB,row.membership_id),idempotent_replay:false};
}

export async function submitMembershipCheckin(env,ctx,actor,key,membershipId,input){
  requireRole(actor,CHECKIN_ROLES,'Current role cannot submit a Membership check-in.');
  const row=await membership(env.DB,membershipId);
  if(row.status!=='active') throw new GVError('GV_MEMBERSHIP_INACTIVE','Business Health Membership is not active.',409);
  const checkinInput={
    bmr_id:row.bmr_id,
    treatment_plan_id:row.treatment_plan_id,
    action_id:input.action_id||null,
    due_context:input.due_context||'business_health_membership',
    responses:input.responses||{},
    evidence_refs:Array.isArray(input.evidence_refs)?input.evidence_refs:[],
    adherence_state:input.adherence_state||null
  };
  const checkinResult=await submitCheckin(env,ctx,actor,`${key}:checkin`,checkinInput);
  const checkin=checkinResult.checkin;
  let link=await first(env.DB,`SELECT * FROM gv1_membership_checkins WHERE membership_id=? AND checkin_id=?`,row.membership_id,checkin.checkin_id);
  let queue=await first(env.DB,`SELECT * FROM gv1_membership_reassessment_queue WHERE membership_id=? AND checkin_id=?`,row.membership_id,checkin.checkin_id);
  if(!link||!queue){
    const ts=now(),linkId=newId('mci'),queueId=newId('mrq');
    const statements=[];
    if(!link) statements.push(env.DB.prepare(`INSERT INTO gv1_membership_checkins (
      membership_checkin_id,membership_id,checkin_id,bmr_id,treatment_plan_id,correlation_id,created_at
    ) VALUES (?,?,?,?,?,?,?)`).bind(linkId,row.membership_id,checkin.checkin_id,row.bmr_id,row.treatment_plan_id,ctx.correlation,ts));
    if(!queue) statements.push(env.DB.prepare(`INSERT INTO gv1_membership_reassessment_queue (
      queue_id,membership_id,checkin_id,bmr_id,treatment_plan_id,status,reason_code,correlation_id,created_at
    ) VALUES (?,?,?,?,?,'pending','membership_checkin',?,?)`).bind(queueId,row.membership_id,checkin.checkin_id,row.bmr_id,row.treatment_plan_id,ctx.correlation,ts));
    if(!(await eventExists(env.DB,`${key}:checkin-event`))) statements.push(env.DB.prepare(`INSERT INTO gv1_membership_events (
      membership_event_id,membership_id,event_type,related_entity_type,related_entity_id,
      actor_type,actor_id,correlation_id,client_request_id,created_at
    ) VALUES (?,?, 'checkin_submitted','checkin',?,?,?,?,?,?)`).bind(newId('mev'),row.membership_id,checkin.checkin_id,role(actor),actor.id,ctx.correlation,`${key}:checkin-event`,ts));
    if(!(await eventExists(env.DB,`${key}:queue-event`))) statements.push(env.DB.prepare(`INSERT INTO gv1_membership_events (
      membership_event_id,membership_id,event_type,related_entity_type,related_entity_id,
      actor_type,actor_id,correlation_id,client_request_id,created_at
    ) VALUES (?,?, 'reassessment_queued','checkin',?,?,?,?,?,?)`).bind(newId('mev'),row.membership_id,checkin.checkin_id,role(actor),actor.id,ctx.correlation,`${key}:queue-event`,ts));
    statements.push(audit(env.DB,ctx,actor,{entityType:'membership_checkin',entityId:checkin.checkin_id,operation:'create',change:{membership_id:row.membership_id,reassessment_queued:true},ts}));
    await env.DB.batch(statements);
    link=await first(env.DB,`SELECT * FROM gv1_membership_checkins WHERE membership_id=? AND checkin_id=?`,row.membership_id,checkin.checkin_id);
    queue=await first(env.DB,`SELECT * FROM gv1_membership_reassessment_queue WHERE membership_id=? AND checkin_id=?`,row.membership_id,checkin.checkin_id);
  }
  return {membership:row,checkin,membership_checkin:link,reassessment_queue:queue,idempotent_replay:Boolean(checkinResult.idempotent_replay)};
}

export async function getMembership(env,actor,membershipId){
  requireRole(actor,READ_ROLES,'Current role cannot read Membership.');
  const row=await membership(env.DB,membershipId);
  const events=await env.DB.prepare(`SELECT membership_event_id,event_type,related_entity_type,related_entity_id,created_at
    FROM gv1_membership_events WHERE membership_id=? ORDER BY created_at`).bind(row.membership_id).all();
  const queue=await env.DB.prepare(`SELECT queue_id,checkin_id,status,reason_code,created_at,reviewed_at
    FROM gv1_membership_reassessment_queue WHERE membership_id=? ORDER BY created_at DESC LIMIT 25`).bind(row.membership_id).all();
  return {membership:row,events:events.results||[],reassessment_queue:queue.results||[]};
}

export async function membershipReadiness(env){
  const schema=await first(env.DB,`SELECT migration_id,name,checksum FROM gv1_schema_migrations WHERE name='day7_business_health_membership_beta_v1'`);
  return {
    ready:schema?.migration_id==='D7A1',
    current_schema_version:schema?.migration_id||null,
    membership_beta:'server_governed_v1',
    membership_checkins:'treatment_plan_bound_v1',
    reassessment_queue:'human_review_required_v1',
    schema
  };
}
