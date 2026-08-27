import {
  GVError, actor, idempotencyKey, jsonBody, requireOperator, success
} from '../day5-common.js';
import {
  createRecommendation, supersedeRecommendation, createTreatmentPlan,
  reviseTreatmentPlan, recordTreatmentEvent, recordOutcome, createFeedback,
  createLearningCandidate, reviewLearningCandidate, transitionCareBmr, getCare,
  retryAdapterDelivery, recordStripeWebhook
} from '../domain/care-service.js';
import {
  recordFindingDecision, addGalviRx, orderGalviAudit,
  createReferral, updateReferralStatus, submitCheckin, reportMilestone,
  reassessCare, enforceGalviGuideBoundary
} from '../domain/day5-active-care-service.js';
import { getGovernedClinicBrief } from '../domain/day5-projection-service.js';
import { recordGalviAuditResult, recordReferralOutcome } from '../domain/day5-care-result-service.js';
import { getDay5Timeline } from '../domain/day5-timeline-service.js';

async function verifyStripe(request,env){
  const secret=String(env?.STRIPE_WEBHOOK_SECRET||'').trim();
  if(!secret) throw new GVError('GV_WEBHOOK_INVALID','Stripe webhook verification is not configured.',401);
  const header=String(request.headers.get('Stripe-Signature')||'');
  const parts=Object.fromEntries(header.split(',').map(p=>p.split('=',2)).filter(x=>x.length===2));
  const timestamp=parts.t, supplied=parts.v1;
  if(!timestamp||!supplied) throw new GVError('GV_WEBHOOK_INVALID','Stripe webhook signature is invalid.',401);
  const nowSeconds=Math.floor(Date.now()/1000); const ts=Number(timestamp);
  if(!Number.isFinite(ts)||Math.abs(nowSeconds-ts)>300) throw new GVError('GV_WEBHOOK_INVALID','Stripe webhook timestamp is outside the allowed tolerance.',401);
  const body=await request.text();
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${body}`));
  const expected=[...new Uint8Array(signed)].map(b=>b.toString(16).padStart(2,'0')).join('');
  if(expected.length!==supplied.length) throw new GVError('GV_WEBHOOK_INVALID','Stripe webhook signature is invalid.',401);
  let diff=0; for(let i=0;i<expected.length;i++) diff|=expected.charCodeAt(i)^supplied.charCodeAt(i);
  if(diff!==0) throw new GVError('GV_WEBHOOK_INVALID','Stripe webhook signature is invalid.',401);
  try{return JSON.parse(body);}catch{throw new GVError('GV_REQ_BODY_INVALID','Stripe webhook body must be valid JSON.',400);}
}

export async function handleCareRoute(request,env,ctx,path){
  const caller=actor(request);

  const clinicBrief=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/clinic-brief$/);
  if(request.method==='GET'&&clinicBrief){
    enforceGalviGuideBoundary(caller,'get_clinic_brief');
    const data=await getGovernedClinicBrief(env,caller,decodeURIComponent(clinicBrief[1]));
    return success(ctx,data);
  }
  if(request.method==='POST'&&path==='/api/v1/finding-decisions'){
    enforceGalviGuideBoundary(caller,'record_finding_decision');
    const input=await jsonBody(request),data=await recordFindingDecision(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/galvirx'){
    enforceGalviGuideBoundary(caller,'add_galvirx');
    const input=await jsonBody(request),data=await addGalviRx(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/galviaudit-orders'){
    enforceGalviGuideBoundary(caller,'order_galviaudit');
    const input=await jsonBody(request),data=await orderGalviAudit(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const auditResult=path.match(/^\/api\/v1\/galviaudit-orders\/([^/]+)\/result$/);
  if(request.method==='POST'&&auditResult){
    const input=await jsonBody(request),data=await recordGalviAuditResult(env,ctx,caller,idempotencyKey(request),decodeURIComponent(auditResult[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/referrals'){
    enforceGalviGuideBoundary(caller,'create_referral');
    const input=await jsonBody(request),data=await createReferral(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const referralStatus=path.match(/^\/api\/v1\/referrals\/([^/]+)\/status$/);
  if(request.method==='POST'&&referralStatus){
    enforceGalviGuideBoundary(caller,'update_referral_status');
    const input=await jsonBody(request),data=await updateReferralStatus(env,ctx,caller,idempotencyKey(request),decodeURIComponent(referralStatus[1]),input);
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
  }
  const referralOutcome=path.match(/^\/api\/v1\/referrals\/([^/]+)\/outcome$/);
  if(request.method==='POST'&&referralOutcome){
    const input=await jsonBody(request),data=await recordReferralOutcome(env,ctx,caller,idempotencyKey(request),decodeURIComponent(referralOutcome[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/checkins'){
    enforceGalviGuideBoundary(caller,'submit_checkin');
    const input=await jsonBody(request),data=await submitCheckin(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/milestones'){
    enforceGalviGuideBoundary(caller,'report_milestone');
    const input=await jsonBody(request),data=await reportMilestone(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/reassessments'){
    enforceGalviGuideBoundary(caller,'reassess_care');
    const input=await jsonBody(request),data=await reassessCare(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }

  if(request.method==='POST'&&path==='/api/v1/recommendations'){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await createRecommendation(env,ctx,operator,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const recSupersede=path.match(/^\/api\/v1\/recommendations\/([^/]+)\/supersede$/);
  if(request.method==='POST'&&recSupersede){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await supersedeRecommendation(env,ctx,operator,idempotencyKey(request),decodeURIComponent(recSupersede[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/treatment-plans'){
    enforceGalviGuideBoundary(caller,'create_treatment_plan');
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await createTreatmentPlan(env,ctx,operator,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const revision=path.match(/^\/api\/v1\/treatment-plans\/([^/]+)\/revisions$/);
  if(request.method==='POST'&&revision){
    enforceGalviGuideBoundary(caller,'revise_treatment_plan');
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await reviseTreatmentPlan(env,ctx,operator,idempotencyKey(request),decodeURIComponent(revision[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const treatmentEvent=path.match(/^\/api\/v1\/treatment-plans\/([^/]+)\/events$/);
  if(request.method==='POST'&&treatmentEvent){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await recordTreatmentEvent(env,ctx,operator,idempotencyKey(request),decodeURIComponent(treatmentEvent[1]),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/outcomes'){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await recordOutcome(env,ctx,operator,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/feedback'){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await createFeedback(env,ctx,operator,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  if(request.method==='POST'&&path==='/api/v1/learning-candidates'){
    const input=await jsonBody(request);
    const data=await createLearningCandidate(env,ctx,caller,idempotencyKey(request),input);
    return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay});
  }
  const review=path.match(/^\/api\/v1\/learning-candidates\/([^/]+)\/review$/);
  if(request.method==='POST'&&review){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await reviewLearningCandidate(env,ctx,operator,idempotencyKey(request),decodeURIComponent(review[1]),input);
    return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
  }
  const care=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/care$/);
  if(request.method==='GET'&&care){
    const url=new URL(request.url), history=url.searchParams.get('history')==='true'||url.searchParams.get('include_history')==='true';
    if(history) requireOperator(request);
    const data=await getCare(env,decodeURIComponent(care[1]),{history,limit:url.searchParams.get('limit')||100});
    return success(ctx,data);
  }
  const timeline=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/timeline$/);
  if(request.method==='GET'&&timeline){
    requireOperator(request);
    const url=new URL(request.url);
    const data=await getDay5Timeline(env,decodeURIComponent(timeline[1]),{limit:url.searchParams.get('limit')||100});
    return success(ctx,data);
  }
  const transition=path.match(/^\/api\/v1\/business-medical-records\/([^/]+)\/transitions$/);
  if(request.method==='POST'&&transition){
    const operator=requireOperator(request), input=await jsonBody(request);
    const to=String(input.to_status||'').trim();
    if(['treatment_active','monitoring','active','closed'].includes(to)){
      const data=await transitionCareBmr(env,ctx,operator,idempotencyKey(request),decodeURIComponent(transition[1]),input);
      return success(ctx,data,200,data.idempotent_replay?'no_change':'ok',{idempotent_replay:data.idempotent_replay});
    }
  }
  const retry=path.match(/^\/api\/v1\/adapters\/([^/]+)\/retry$/);
  if(request.method==='POST'&&retry){
    const operator=requireOperator(request), input=await jsonBody(request);
    const data=await retryAdapterDelivery(env,ctx,operator,input.adapter_delivery_id||input.delivery_id);
    return success(ctx,data,200,'ok');
  }
  if(request.method==='POST'&&path==='/api/v1/webhooks/stripe'){
    const event=await verifyStripe(request,env);
    const data=await recordStripeWebhook(env,ctx,event);
    return success(ctx,data,200,data.idempotent_replay?'no_change':'accepted',{idempotent_replay:data.idempotent_replay});
  }
  return null;
}
