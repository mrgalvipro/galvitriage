import {
  GVError, clean, hash, newId, now, requireId
} from '../day5-common.js';
import { first } from '../repositories/care-repository.js';
import { submitCheckin } from './day5-active-care-service.js';

const MANAGE_ROLES = new Set(['business_physician','operator','admin']);
const CHECKIN_ROLES = new Set(['customer','business_physician','galviclinician','operator','admin','galviguide']);
const READ_ROLES = new Set([...CHECKIN_ROLES]);
const CUSTOMER_SESSION_HEADER='X-Galvi-Day3-Session';
const OFFER_SCOPE='day7:membership:recommend';
const OFFER_PRESENT_SCOPE='day7:membership:offer-presented';
const PAID_SCOPE='day7:membership:paid-activation';
const MEMBERSHIP_PRODUCT_ALIASES=new Set(['business_health_membership','business_health_membership_beta','business-health-membership']);

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
  if(clean(row.status).toLowerCase()!=='active') throw new GVError('GV_MEMBERSHIP_PLAN_INACTIVE','Business Health Membership requires an active Treatment Plan.',409);
  return row;
}
function audit(db,ctx,actor,{entityType,entityId,operation,change,ts,source='day7-membership',reasonCode=null}){
  return db.prepare(`INSERT INTO gv1_audit_log (
    audit_id,entity_type,entity_id,operation,prior_version,new_version,actor_type,source,
    reason_code,safe_change_json,correlation_id,environment,occurred_at,created_at
  ) VALUES (?,?,?,?,NULL,NULL,?,?,?,?,?,?,?,?)`)
    .bind(newId('aud'),entityType,entityId,operation,role(actor),source,reasonCode,JSON.stringify(change||{}),ctx.correlation,ctx.environment,ts,ts);
}
async function eventExists(db,key){
  return first(db,`SELECT * FROM gv1_membership_events WHERE client_request_id=?`,key);
}
async function getByRequest(db,key){
  return first(db,`SELECT * FROM gv1_memberships WHERE client_request_id=?`,key);
}
async function receipt(db,scope,key){
  return first(db,`SELECT request_fingerprint,response_entity_id,response_status FROM gv1_idempotency_keys WHERE scope=? AND idempotency_key=?`,scope,key);
}
function receiptInsert(db,scope,key,fp,status,type,id,ts){
  return db.prepare(`INSERT INTO gv1_idempotency_keys
    (idempotency_id,scope,idempotency_key,request_fingerprint,response_status,response_entity_type,response_entity_id,created_at)
    VALUES (?,?,?,?,?,?,?,?)`).bind(newId('idem'),scope,key,fp,status,type,id,ts);
}
async function canonicalPrincipal(db,bmrId){
  const row=await first(db,`SELECT f.founder_id,f.email,v.venture_name,b.current_session_id
    FROM gv1_business_medical_records b
    JOIN gv1_ventures v ON v.venture_id=b.venture_id
    JOIN gv1_founder_venture_roles r ON r.venture_id=b.venture_id AND r.status='active'
    JOIN gv1_founders f ON f.founder_id=r.founder_id
    WHERE b.bmr_id=? ORDER BY r.is_primary DESC,r.created_at ASC LIMIT 1`,bmrId);
  if(!row?.founder_id) throw new GVError('GV_LINEAGE_REQUIRED','Business Health Membership requires the canonical principal linked to this BHR.',409);
  return row;
}
async function activePlan(db,bmrId){
  return first(db,`SELECT treatment_plan_id,bmr_id,status FROM gv1_treatment_plans WHERE bmr_id=? AND status='active' ORDER BY updated_at DESC,created_at DESC LIMIT 1`,bmrId);
}
async function offerIdentity(principalId,bmrId,planId){
  const fp=await hash('day7:membership:offer-id',{principal_id:principalId,bmr_id:bmrId,treatment_plan_id:planId,membership_type:'business_health_beta'});
  return `moffer_${fp.slice(0,32)}`;
}
async function offerAudit(db,offerId,operation='membership_recommended'){
  const row=await first(db,`SELECT audit_id,entity_id,operation,safe_change_json,actor_type,occurred_at,created_at
    FROM gv1_audit_log WHERE entity_type='membership_offer' AND entity_id=? AND operation=? ORDER BY occurred_at DESC LIMIT 1`,offerId,operation);
  if(!row)return null;
  let change={};try{change=JSON.parse(row.safe_change_json||'{}')}catch{}
  return {...row,change};
}
async function activeForBmr(db,bmrId){
  return first(db,`SELECT * FROM gv1_memberships WHERE bmr_id=? AND status='active' ORDER BY created_at DESC LIMIT 1`,bmrId);
}

export async function recommendMembership(env,ctx,actor,key,input){
  requireRole(actor,MANAGE_ROLES,'Business Physician authority is required to recommend Business Health Membership.');
  if(role(actor)!=='business_physician'&&!['operator','admin'].includes(role(actor))) throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authority is required.',403);
  const bmrId=requireId('bmr_id',input.bmr_id),planId=requireId('treatment_plan_id',input.treatment_plan_id);
  const plan=await planScope(env.DB,bmrId,planId),principal=await canonicalPrincipal(env.DB,bmrId);
  const principalId=requireId('principal_id',input.principal_id||principal.founder_id);
  if(principalId!==principal.founder_id) throw new GVError('GV_AUTH_FORBIDDEN','Membership recommendation principal does not match the canonical BHR.',403);
  const active=await activeForBmr(env.DB,bmrId);
  if(active)return {offer:null,membership:active,already_active:true,idempotent_replay:true};
  const offerId=await offerIdentity(principalId,bmrId,plan.treatment_plan_id);
  const fp=await hash(OFFER_SCOPE,{offer_id:offerId,principal_id:principalId,bmr_id:bmrId,treatment_plan_id:plan.treatment_plan_id});
  const prior=await receipt(env.DB,OFFER_SCOPE,key);
  if(prior){
    if(prior.request_fingerprint!==fp) throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused with a different Membership recommendation.',409);
    const recommendation=await offerAudit(env.DB,offerId);
    return {offer:{offer_id:offerId,principal_id:principalId,bmr_id:bmrId,treatment_plan_id:plan.treatment_plan_id,status:'recommended',recommended_at:recommendation?.occurred_at||null,checkout_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK))},idempotent_replay:true};
  }
  const ts=now();
  const existing=await offerAudit(env.DB,offerId);
  const statements=[];
  if(!existing)statements.push(audit(env.DB,ctx,actor,{entityType:'membership_offer',entityId:offerId,operation:'membership_recommended',reasonCode:'business_physician_continuous_care_decision',change:{offer_id:offerId,principal_id:principalId,bmr_id:bmrId,treatment_plan_id:plan.treatment_plan_id,membership_type:'business_health_beta',commercial_state:'recommended',manual_repair:'NO'},ts,source:'day7-membership-commercial'}));
  statements.push(receiptInsert(env.DB,OFFER_SCOPE,key,fp,201,'membership_offer',offerId,ts));
  await env.DB.batch(statements);
  return {offer:{offer_id:offerId,principal_id:principalId,bmr_id:bmrId,treatment_plan_id:plan.treatment_plan_id,status:'recommended',recommended_at:existing?.occurred_at||ts,checkout_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK))},idempotent_replay:false};
}

export async function membershipCommercialState(env,bmrId){
  bmrId=requireId('bmr_id',bmrId);
  const principal=await canonicalPrincipal(env.DB,bmrId),plan=await activePlan(env.DB,bmrId),active=await activeForBmr(env.DB,bmrId);
  if(active)return {offer:null,membership:active,commercial_state:'active'};
  if(!plan)return {offer:null,membership:null,commercial_state:'not_recommended'};
  const offerId=await offerIdentity(principal.founder_id,bmrId,plan.treatment_plan_id),recommended=await offerAudit(env.DB,offerId),offered=await offerAudit(env.DB,offerId,'membership_offered');
  if(!recommended)return {offer:null,membership:null,commercial_state:'not_recommended'};
  return {offer:{offer_id:offerId,principal_id:principal.founder_id,bmr_id:bmrId,treatment_plan_id:plan.treatment_plan_id,status:offered?'offered':'recommended',recommended_at:recommended.occurred_at,offered_at:offered?.occurred_at||null,checkout_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK))},membership:null,commercial_state:offered?'offered':'recommended'};
}

async function legacyCustomerIdentity(db,sessionId){
  let legacy=await first(db,`SELECT f.email,v.venture_name FROM ventures v JOIN founders f ON f.founder_id=v.founder_id WHERE v.session_id=? ORDER BY v.updated_at DESC,v.created_at DESC LIMIT 1`,sessionId);
  if(!legacy)legacy=await first(db,`SELECT f.email,'' AS venture_name FROM founders f WHERE f.session_id=? ORDER BY f.updated_at DESC LIMIT 1`,sessionId);
  if(!legacy?.email) throw new GVError('GV_AUTH_REQUIRED','Authenticated GalviCare customer session is required.',401);
  const founder=await first(db,`SELECT founder_id,email FROM gv1_founders WHERE lower(email)=lower(?) LIMIT 1`,legacy.email);
  if(!founder?.founder_id) throw new GVError('GV_NOT_FOUND','Canonical customer principal was not found.',404);
  let context=null;
  if(clean(legacy.venture_name))context=await first(db,`SELECT c.context_id,c.bmr_id,c.venture_id,c.founder_id FROM gv1_principal_contexts c JOIN gv1_ventures v ON v.venture_id=c.venture_id WHERE c.founder_id=? AND c.status='active' AND c.bmr_id IS NOT NULL AND lower(trim(v.venture_name))=lower(trim(?)) ORDER BY c.updated_at DESC,c.created_at DESC LIMIT 1`,founder.founder_id,legacy.venture_name);
  if(!context)context=await first(db,`SELECT context_id,bmr_id,venture_id,founder_id FROM gv1_principal_contexts WHERE founder_id=? AND status='active' AND bmr_id IS NOT NULL ORDER BY updated_at DESC,created_at DESC LIMIT 1`,founder.founder_id);
  if(!context?.bmr_id) throw new GVError('GV_NOT_FOUND','Canonical Business Health Record was not found for this customer session.',404);
  return {...context,email:founder.email};
}
async function customerOffer(env,request){
  const token=clean(request.headers.get(CUSTOMER_SESSION_HEADER));
  if(!token)throw new GVError('GV_AUTH_REQUIRED','Authenticated GalviCare customer session is required.',401);
  const customer=await legacyCustomerIdentity(env.DB,token),plan=await activePlan(env.DB,customer.bmr_id),active=await activeForBmr(env.DB,customer.bmr_id);
  if(active)return {customer,plan,membership:active,offer:null};
  if(!plan)throw new GVError('GV_MEMBERSHIP_NOT_RECOMMENDED','An active Business Physician Treatment Plan is required before Membership can be offered.',409);
  const offerId=await offerIdentity(customer.founder_id,customer.bmr_id,plan.treatment_plan_id),recommended=await offerAudit(env.DB,offerId);
  if(!recommended)throw new GVError('GV_MEMBERSHIP_NOT_RECOMMENDED','Business Health Membership has not been recommended by the Business Physician.',404);
  return {customer,plan,membership:null,offer:{offer_id:offerId,principal_id:customer.founder_id,bmr_id:customer.bmr_id,treatment_plan_id:plan.treatment_plan_id,status:'recommended',recommended_at:recommended.occurred_at}};
}

export async function getCustomerMembershipOffer(env,request){
  const resolved=await customerOffer(env,request);
  if(resolved.membership)return {membership:resolved.membership,offer:null,commercial_state:'active'};
  const offered=await offerAudit(env.DB,resolved.offer.offer_id,'membership_offered');
  return {offer:{...resolved.offer,status:offered?'offered':'recommended',offered_at:offered?.occurred_at||null,checkout_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK))},membership:null,commercial_state:offered?'offered':'recommended'};
}

export async function presentCustomerMembershipOffer(env,ctx,request,key){
  const resolved=await customerOffer(env,request);
  if(resolved.membership)return {membership:resolved.membership,offer:null,commercial_state:'active',idempotent_replay:true};
  const offer=resolved.offer,fp=await hash(OFFER_PRESENT_SCOPE,{offer_id:offer.offer_id,principal_id:offer.principal_id,bmr_id:offer.bmr_id,treatment_plan_id:offer.treatment_plan_id});
  const prior=await receipt(env.DB,OFFER_PRESENT_SCOPE,key);
  if(prior){
    if(prior.request_fingerprint!==fp)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused for a different Membership offer.',409);
    return {offer:{...offer,status:'offered',checkout_url:clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK)||null,checkout_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK))},commercial_state:'offered',idempotent_replay:true};
  }
  const ts=now(),actor={role:'customer',id:offer.principal_id};
  const existing=await offerAudit(env.DB,offer.offer_id,'membership_offered'),statements=[];
  if(!existing)statements.push(audit(env.DB,ctx,actor,{entityType:'membership_offer',entityId:offer.offer_id,operation:'membership_offered',reasonCode:'customer_commercial_offer_presented',change:{...offer,commercial_state:'offered',manual_repair:'NO'},ts,source:'day7-membership-commercial'}));
  statements.push(receiptInsert(env.DB,OFFER_PRESENT_SCOPE,key,fp,200,'membership_offer',offer.offer_id,ts));
  await env.DB.batch(statements);
  return {offer:{...offer,status:'offered',checkout_url:clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK)||null,checkout_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK))},commercial_state:'offered',idempotent_replay:false};
}

async function stripeCheckout(env,stripeSessionId){
  const secret=clean(env.STRIPE_SECRET_KEY);
  if(!secret)throw new GVError('GV_MEMBERSHIP_PAYMENT_NOT_CONFIGURED','Server-side Stripe verification is not configured for Business Health Membership.',503);
  let response;
  try{response=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(stripeSessionId)}`,{headers:{Authorization:`Bearer ${secret}`}});}catch{throw new GVError('GV_STRIPE_UNAVAILABLE','Stripe payment verification is temporarily unavailable.',503,undefined,true);}
  let payload={};try{payload=await response.json()}catch{}
  if(!response.ok)throw new GVError('GV_STRIPE_VERIFICATION_FAILED','Stripe could not verify this Membership checkout.',502,{provider_status:response.status},true);
  return payload;
}

export async function resolvePaidMembershipActivation(env,ctx,request,key,input){
  const stripeSessionId=clean(input?.stripe_session_id);
  if(!stripeSessionId.startsWith('cs_'))throw new GVError('GV_REQ_SCHEMA','A valid Stripe Checkout Session ID is required.',422);
  const resolved=await customerOffer(env,request);
  if(resolved.membership)return {membership:resolved.membership,commercial_state:'active',idempotent_replay:true};
  const offer=resolved.offer,fp=await hash(PAID_SCOPE,{offer_id:offer.offer_id,stripe_session_id:stripeSessionId});
  const prior=await receipt(env.DB,PAID_SCOPE,key);
  if(prior){
    if(prior.request_fingerprint!==fp)throw new GVError('GV_IDEMPOTENCY_REUSE_MISMATCH','Idempotency key was reused for a different Membership payment.',409);
    const stored=await activeForBmr(env.DB,offer.bmr_id);
    if(!stored)throw new GVError('GV_MEMBERSHIP_ACTIVATION_MISSING','Stored Membership activation could not be replayed.',409);
    return {membership:stored,commercial_state:'active',idempotent_replay:true};
  }
  const checkout=await stripeCheckout(env,stripeSessionId);
  if(clean(checkout.payment_status).toLowerCase()!=='paid'||clean(checkout.status).toLowerCase()!=='complete')throw new GVError('GV_MEMBERSHIP_PAYMENT_REQUIRED','Business Health Membership activates only after a completed paid Stripe checkout.',402);
  if(clean(checkout.client_reference_id)!==offer.offer_id)throw new GVError('GV_MEMBERSHIP_PAYMENT_SCOPE_MISMATCH','Stripe checkout is not linked to this Membership offer.',409);
  const product=clean(checkout?.metadata?.product).toLowerCase();
  if(!MEMBERSHIP_PRODUCT_ALIASES.has(product))throw new GVError('GV_MEMBERSHIP_PAYMENT_PRODUCT_MISMATCH','Stripe checkout is not the approved Business Health Membership product.',409);
  const checkoutEmail=clean(checkout?.customer_details?.email||checkout?.customer_email).toLowerCase();
  if(checkoutEmail&&clean(resolved.customer.email).toLowerCase()!==checkoutEmail)throw new GVError('GV_MEMBERSHIP_PAYMENT_SCOPE_MISMATCH','Stripe checkout customer does not match the canonical Membership principal.',409);
  const existing=await activeForBmr(env.DB,offer.bmr_id);
  if(existing)return {membership:existing,commercial_state:'active',idempotent_replay:true,existing_active:true};
  const ts=now(),id=newId('mem'),eventId=newId('mev'),actor={role:'customer',id:offer.principal_id};
  const membershipFp=await hash('day7:membership:paid-row',{offer_id:offer.offer_id,stripe_session_id:stripeSessionId,principal_id:offer.principal_id,bmr_id:offer.bmr_id,treatment_plan_id:offer.treatment_plan_id});
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO gv1_memberships (
      membership_id,principal_id,bmr_id,treatment_plan_id,membership_type,status,started_at,
      version_no,actor_type,actor_id,client_request_id,request_fingerprint,correlation_id,created_at,updated_at
    ) VALUES (?,?,?,?,?,'active',?,1,?,?,?,?,?,?,?)`)
      .bind(id,offer.principal_id,offer.bmr_id,offer.treatment_plan_id,'business_health_beta',ts,'customer',offer.principal_id,`paid:${stripeSessionId}`,membershipFp,ctx.correlation,ts,ts),
    env.DB.prepare(`INSERT INTO gv1_membership_events (
      membership_event_id,membership_id,event_type,related_entity_type,related_entity_id,
      actor_type,actor_id,correlation_id,client_request_id,created_at
    ) VALUES (?,?, 'membership_started','treatment_plan',?,?,?,?,?,?)`)
      .bind(eventId,id,offer.treatment_plan_id,'customer',offer.principal_id,ctx.correlation,`paid:${stripeSessionId}:started`,ts),
    audit(env.DB,ctx,actor,{entityType:'membership_offer',entityId:offer.offer_id,operation:'membership_paid_activation',reasonCode:'stripe_server_verified_paid_activation',change:{...offer,commercial_state:'active',membership_id:id,stripe_session_id:stripeSessionId,stripe_payment_intent_id:clean(checkout.payment_intent)||null,amount_total:Number(checkout.amount_total)||null,currency:clean(checkout.currency)||null,payment_status:'paid',manual_repair:'NO'},ts,source:'day7-membership-commercial'}),
    receiptInsert(env.DB,PAID_SCOPE,key,fp,201,'membership',id,ts)
  ]);
  return {membership:await membership(env.DB,id),offer:{...offer,status:'converted'},commercial_state:'active',revenue_conversion_event:'membership_started',payment:{stripe_session_id:stripeSessionId,payment_status:'paid',amount_total:Number(checkout.amount_total)||null,currency:clean(checkout.currency)||null},idempotent_replay:false};
}

/* Legacy direct-start service is retained only for inherited automated compatibility.
 * New clinician/customer flows MUST use recommendation -> offer -> paid activation.
 */
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
    return {membership:prior,idempotent_replay:true,legacy_direct_start:true};
  }
  const active=await activeForBmr(env.DB,bmrId);
  if(active) return {membership:active,idempotent_replay:true,existing_active:true,legacy_direct_start:true};

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
    audit(env.DB,ctx,actor,{entityType:'membership',entityId:id,operation:'legacy_direct_start',change:{bmr_id:bmrId,treatment_plan_id:planId,status:'active',legacy_direct_start:true},ts})
  ]);
  return {membership:await membership(env.DB,id),idempotent_replay:false,legacy_direct_start:true};
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
    commercial_conversion:'clinical_decision_offer_server_verified_paid_activation_v1',
    revenue_conversion_event:'membership_started',
    payment_link_configured:Boolean(clean(env.BUSINESS_HEALTH_MEMBERSHIP_PAYMENT_LINK)),
    schema
  };
}
