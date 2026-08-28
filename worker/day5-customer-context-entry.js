import day5Runtime from './day5-entry.js';
import day4Worker from './day4-session-identity-entry.js';
import { GVError, CUSTOMER_SESSION_HEADER, context, failure, idempotencyKey, jsonBody, requireRuntime, success } from './day5-common.js';
import { first } from './repositories/care-repository.js';
import { acknowledgeTreatmentPlan, submitCheckin } from './domain/day5-active-care-service.js';

/*
 * Day 5 H19 customer continuity boundary.
 *
 * The current GalviCare session is authoritative for customer active care. Resolve
 * exactly the same canonical chain used by the Day 3 customer bridge:
 * legacy session -> founder email -> canonical founder -> founder/venture role ->
 * canonical venture -> canonical BMR -> active principal context.
 *
 * Do not pick a context merely because it is the founder's latest active context and
 * do not match arbitrary same-name ventures directly from principal_contexts. Both
 * patterns can render a valid Chart for the wrong BMR and make a physician-authored
 * Treatment Plan disappear from H19 while still returning HTTP 200.
 *
 * Browser-supplied BMR identity remains prohibited. Day 4 entitlement/consent checks
 * still run before projection or any customer acknowledgement/check-in write.
 */
export const DAY5_CUSTOMER_CONTEXT_RESOLUTION='session_venture_bmr_context_v2';
const text=value=>String(value??'').trim();

async function resolveCustomerRecord(request,env){
  const sessionId=text(request.headers.get(CUSTOMER_SESSION_HEADER));
  if(!sessionId)throw new GVError('GV_AUTH_REQUIRED','An authenticated GalviCare customer session is required.',401);

  const legacy=await first(env.DB,`SELECT f.email,v.venture_name
    FROM ventures v
    JOIN founders f ON f.founder_id=v.founder_id
    WHERE v.session_id=?
    ORDER BY v.updated_at DESC,v.created_at DESC
    LIMIT 1`,sessionId)
    ||await first(env.DB,`SELECT f.email,'' AS venture_name
      FROM founders f
      WHERE f.session_id=?
      ORDER BY f.updated_at DESC
      LIMIT 1`,sessionId);
  if(!legacy?.email)throw new GVError('GV_DAY5_SESSION_IDENTITY_MISSING','GalviCare session identity is unavailable.',401);

  const founder=await first(env.DB,`SELECT founder_id,email,status
    FROM gv1_founders
    WHERE lower(email)=lower(?)
    LIMIT 1`,legacy.email);
  if(!founder?.founder_id)throw new GVError('GV_DAY5_CANONICAL_IDENTITY_MISSING','Canonical GalviVault identity has not been established for this GalviCare session.',409);

  const ventureName=text(legacy.venture_name);
  if(!ventureName)throw new GVError('GV_DAY5_CANONICAL_VENTURE_MISSING','The authenticated GalviCare session is not bound to an operating venture.',409);

  const venture=await first(env.DB,`SELECT v.venture_id,v.venture_name,v.status,v.updated_at
    FROM gv1_founder_venture_roles r
    JOIN gv1_ventures v ON v.venture_id=r.venture_id
    WHERE r.founder_id=?
      AND r.status='active'
      AND v.status='active'
      AND lower(trim(v.venture_name))=lower(trim(?))
    ORDER BY r.is_primary DESC,v.updated_at DESC,v.created_at DESC
    LIMIT 1`,founder.founder_id,ventureName);
  if(!venture?.venture_id)throw new GVError('GV_DAY5_CANONICAL_VENTURE_MISSING','Canonical GalviVault venture identity is unavailable for this GalviCare session.',409);

  const record=await first(env.DB,`SELECT bmr_id,venture_id,status,record_version,current_session_id,updated_at
    FROM gv1_business_medical_records
    WHERE venture_id=? AND status IN ('open','active')
    ORDER BY CASE WHEN current_session_id=? THEN 0 ELSE 1 END,updated_at DESC,created_at DESC
    LIMIT 1`,venture.venture_id,sessionId);
  if(!record?.bmr_id)throw new GVError('GV_DAY5_CANONICAL_BMR_MISSING','Canonical Business Health Record is unavailable for this GalviCare session venture.',409);

  const canonical=await first(env.DB,`SELECT context_id,founder_id,venture_id,bmr_id,record_mode,status,updated_at
    FROM gv1_principal_contexts
    WHERE founder_id=? AND venture_id=? AND bmr_id=? AND status='active'
    ORDER BY updated_at DESC,created_at DESC
    LIMIT 1`,founder.founder_id,venture.venture_id,record.bmr_id);
  if(!canonical?.context_id)throw new GVError('GV_DAY5_CANONICAL_CONTEXT_MISSING','The authenticated GalviCare session could not be matched to its canonical venture/BHR context.',409);

  return {session_id:sessionId,founder,venture,record,context:canonical};
}

async function scopedChartRequest(request,env){
  const canonical=await resolveCustomerRecord(request,env);
  let body={};
  try{const parsed=await request.clone().json();if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))body=parsed;}catch{}
  const requested=text(body?.context_id);
  if(requested&&requested!==canonical.context.context_id){
    throw new GVError('GV_AUTH_FORBIDDEN','Requested GalviChart context does not match the authenticated GalviCare session venture/BHR.',403,{write_performed:false});
  }
  const headers=new Headers(request.headers);headers.set('Content-Type','application/json');
  return {canonical,request:new Request(request.url,{method:'POST',headers,body:JSON.stringify({...body,context_id:canonical.context.context_id})})};
}

async function authorizedCustomerChart(request,env,executionContext){
  const canonical=await resolveCustomerRecord(request,env);
  const headers=new Headers({
    Accept:'application/json',
    'Content-Type':'application/json',
    'Cache-Control':'no-cache',
    [CUSTOMER_SESSION_HEADER]:canonical.session_id,
    'X-Correlation-Id':`day5-h19-${crypto.randomUUID()}`
  });
  const origin=text(request.headers.get('Origin'));if(origin)headers.set('Origin',origin);
  const chartRequest=new Request(`${new URL(request.url).origin}/api/v1/day4/chart`,{
    method:'POST',headers,body:JSON.stringify({context_id:canonical.context.context_id})
  });
  const response=await day4Worker.fetch(chartRequest,env,executionContext);let payload={};
  try{payload=await response.json()}catch{}
  const data=payload?.data||{};
  const sameRecord=response.ok
    &&payload?.success===true
    &&payload?.status==='ok'
    &&data?.activated===true
    &&text(data?.principal_id)===text(canonical.founder.founder_id)
    &&text(data?.context_id)===text(canonical.context.context_id)
    &&text(data?.bmr_id)===text(canonical.record.bmr_id);
  if(!sameRecord)throw new GVError(response.status===401?'GV_AUTH_REQUIRED':'GV_AUTH_FORBIDDEN','Customer active care could not verify the same authenticated GalviChart/BHR.',response.status===401?401:403,{write_performed:false});
  return {session_id:canonical.session_id,principal_id:data.principal_id,context_id:data.context_id,bmr_id:data.bmr_id};
}

function markContextResolution(response){
  const headers=new Headers(response.headers);headers.set('X-Galvi-Day5-Customer-Context',DAY5_CUSTOMER_CONTEXT_RESOLUTION);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}

export default{async fetch(request,env,executionContext){
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin))throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    const path=new URL(request.url).pathname.replace(/\/+$/,'')||'/';

    if(request.method==='POST'&&path==='/api/v1/day4/chart'&&text(request.headers.get(CUSTOMER_SESSION_HEADER))){
      const scoped=await scopedChartRequest(request,env);
      return markContextResolution(await day5Runtime.fetch(scoped.request,env,executionContext));
    }

    const customerAck=path.match(/^\/api\/v1\/day5\/customer\/treatment-plans\/([^/]+)\/acknowledgement$/);
    if(request.method==='POST'&&customerAck){
      const customer=await authorizedCustomerChart(request,env,executionContext),input=await jsonBody(request);
      const data=await acknowledgeTreatmentPlan(env,ctx,{role:'customer',id:customer.principal_id},idempotencyKey(request),decodeURIComponent(customerAck[1]),{...input,bmr_id:customer.bmr_id});
      return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,identity_source:DAY5_CUSTOMER_CONTEXT_RESOLUTION});
    }

    if(request.method==='POST'&&path==='/api/v1/day5/customer/checkins'){
      const customer=await authorizedCustomerChart(request,env,executionContext),input=await jsonBody(request);
      const data=await submitCheckin(env,ctx,{role:'customer',id:customer.principal_id},idempotencyKey(request),{...input,bmr_id:customer.bmr_id});
      return success(ctx,data,data.idempotent_replay?200:201,data.idempotent_replay?'no_change':'created',{idempotent_replay:data.idempotent_replay,identity_source:DAY5_CUSTOMER_CONTEXT_RESOLUTION});
    }

    return day5Runtime.fetch(request,env,executionContext);
  }catch(error){
    console.error('GalviCare 1.0 Day 5 customer context error',error?.code||'GV_INTERNAL',error?.message||'unexpected');
    return failure(ctx,error);
  }
}};
