import day8Worker from './day8-entry.js';
import { GVError, context, failure, headers, success } from './day5-common.js';
import { requireClinicianIdentity, asLegacyOperatorHeaders } from './auth/operator-identity.js';
import { handleDay6StudioRoute } from './routes/day6-studio.js';

const isDay6 = (path) => path.startsWith('/api/v1/day6/');
const clean = (v) => String(v ?? '').trim();
const parse = (v,fallback=[]) => { try { return typeof v==='object'&&v!==null?v:JSON.parse(v||''); } catch { return fallback; } };

async function clinicianStudioContext(env, ctx, identity, bmrId) {
  if (identity.role !== 'business_physician') throw new GVError('GV_AUTH_FORBIDDEN', 'Business Physician authorization is required.', 403);
  const bmr = await env.DB.prepare(`SELECT b.bmr_id,b.venture_id,b.status,b.record_version,v.venture_name,f.founder_id,f.first_name,f.last_name
    FROM gv1_business_medical_records b JOIN gv1_ventures v ON v.venture_id=b.venture_id
    JOIN gv1_founder_venture_roles r ON r.venture_id=v.venture_id AND r.status='active' AND r.is_primary=1
    JOIN gv1_founders f ON f.founder_id=r.founder_id WHERE b.bmr_id=? LIMIT 1`).bind(bmrId).first();
  if (!bmr) throw new GVError('GV_NOT_FOUND', 'Business Medical Record was not found.', 404);
  const plans = (await env.DB.prepare(`SELECT treatment_plan_id,name,status,version_no,objective,created_at FROM gv1_treatment_plans WHERE bmr_id=? AND status NOT IN ('cancelled','archived','superseded') ORDER BY created_at DESC LIMIT 25`).bind(bmrId).all()).results || [];
  const planIds = new Set(plans.map((p) => p.treatment_plan_id));
  const items = (await env.DB.prepare(`SELECT i.treatment_plan_item_id,i.treatment_plan_id,i.action_code,i.title,i.description,i.status,i.sequence_number,i.owner_actor_type,i.owner_actor_id
    FROM gv1_treatment_plan_items i JOIN gv1_treatment_plans p ON p.treatment_plan_id=i.treatment_plan_id WHERE p.bmr_id=? ORDER BY p.created_at DESC,i.sequence_number,i.created_at`).bind(bmrId).all()).results || [];
  const evidence = (await env.DB.prepare(`SELECT evidence_id,evidence_type,source_product,source_reference,evidence_version,created_at FROM gv1_evidence_items WHERE bmr_id=? ORDER BY created_at DESC LIMIT 50`).bind(bmrId).all()).results || [];
  const engagements = (await env.DB.prepare(`SELECT engagement_id,principal_id,bmr_id,source_treatment_plan_id,source_action_id,support_level,pillar_code,program_code,sprint_code,intervention_code,catalog_version,sprint_version,objective,required_evidence_json,expected_outcomes_json,status,version_no,created_at,updated_at FROM gv1_studio_engagements WHERE bmr_id=? ORDER BY updated_at DESC,created_at DESC LIMIT 25`).bind(bmrId).all()).results || [];
  const reassessments = (await env.DB.prepare(`SELECT reassessment_id,bmr_id,treatment_plan_id,decision,reason,evidence_refs_json,outcome_refs_json,source_versions_json,actor_type,created_at FROM gv1_reassessments WHERE bmr_id=? ORDER BY created_at DESC LIMIT 25`).bind(bmrId).all()).results || [];
  return success(ctx,{bmr:{bmr_id:bmr.bmr_id,venture_id:bmr.venture_id,venture_name:bmr.venture_name,status:bmr.status,record_version:bmr.record_version},principal:{founder_id:bmr.founder_id,first_name:bmr.first_name,last_name:bmr.last_name},treatment_plans:plans,treatment_plan_items:items.filter(x=>planIds.has(x.treatment_plan_id)),evidence,studio_engagements:engagements.map(x=>({...x,required_evidence:parse(x.required_evidence_json,[]),expected_outcomes:parse(x.expected_outcomes_json,[])})),reassessments,read_only:true},200,'ok',{day6:true,clinician_bridge:'v2'});
}

async function ventureProofView(env,ctx,identity,caseId){
  if (identity.role !== 'business_physician') throw new GVError('GV_AUTH_FORBIDDEN','Business Physician authorization is required.',403);
  const rows=(await env.DB.prepare(`SELECT proof_id,venture_case_id,proof_dimension,claim_text,evidence_refs_json,validation_status,actor_type,version_no,created_at,updated_at FROM gv1_studio_venture_proof WHERE venture_case_id=? ORDER BY proof_dimension,version_no,created_at`).bind(caseId).all()).results||[];
  return success(ctx,{venture_case_id:caseId,proofs:rows.map(x=>({...x,evidence_refs:parse(x.evidence_refs_json,[])})),read_only:true},200,'ok',{day6:true,venture_proof_projection:'v1'});
}

async function validateCareSourceAction(request, env) {
  if (request.method !== 'POST') return;
  const body = await request.clone().json().catch(() => ({}));
  const bmrId = clean(body.bmr_id), planId = clean(body.source_treatment_plan_id), actionId = clean(body.source_action_id);
  if (!bmrId) return;
  if (!planId || !actionId) throw new GVError('GV_LINEAGE_REQUIRED', 'Care-prescribed Studio engagement requires source Treatment Plan and action.', 422);
  const action = await env.DB.prepare(`SELECT i.treatment_plan_item_id,p.bmr_id FROM gv1_treatment_plan_items i JOIN gv1_treatment_plans p ON p.treatment_plan_id=i.treatment_plan_id WHERE i.treatment_plan_item_id=? AND i.treatment_plan_id=? LIMIT 1`).bind(actionId,planId).first();
  if (!action || action.bmr_id !== bmrId) throw new GVError('GV_LINEAGE_REQUIRED', 'Source Treatment Plan action is not part of the authorized canonical BMR.', 422);
}

async function validateEngagementScope(request,env,path){
  const bmrId=clean(request.headers.get('X-Galvi-BMR-Id'));
  if(!bmrId)return;
  let engagementId='';
  const getMatch=path.match(/^\/api\/v1\/day6\/studio\/engagements\/([^/]+)$/);
  if(getMatch)engagementId=decodeURIComponent(getMatch[1]);
  else if(request.method==='POST'&&['/api/v1/day6/studio/stage-gates','/api/v1/day6/studio/artifacts','/api/v1/day6/studio/outcomes'].includes(path)){
    const body=await request.clone().json().catch(()=>({}));engagementId=clean(body.engagement_id);
  }
  if(!engagementId)return;
  const row=await env.DB.prepare('SELECT engagement_id,bmr_id FROM gv1_studio_engagements WHERE engagement_id=? LIMIT 1').bind(engagementId).first();
  if(!row)throw new GVError('GV_NOT_FOUND','Studio engagement was not found.',404);
  if(clean(row.bmr_id)!==bmrId)throw new GVError('GV_AUTH_FORBIDDEN','Cross-record Studio access is prohibited.',403);
}

const worker = {
  async fetch(request, env, executionContext) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (!isDay6(path)) return day8Worker.fetch(request, env, executionContext);
    const ctx = context(request, env);
    try {
      if (ctx.origin && ctx.origin !== url.origin && !ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED', 'The request origin is not allowed.', 403);
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(ctx) });
      const identity = await requireClinicianIdentity(request, env);
      const contextMatch = path.match(/^\/api\/v1\/day6\/clinician-context\/([^/]+)$/);
      if (request.method === 'GET' && contextMatch) return clinicianStudioContext(env,ctx,identity,decodeURIComponent(contextMatch[1]));
      const proofMatch=path.match(/^\/api\/v1\/day6\/venture-proof\/([^/]+)$/);
      if(request.method==='GET'&&proofMatch)return ventureProofView(env,ctx,identity,decodeURIComponent(proofMatch[1]));
      if (path === '/api/v1/day6/studio/engagements') await validateCareSourceAction(request,env);
      await validateEngagementScope(request,env,path);
      const secured = asLegacyOperatorHeaders(request, identity);
      const response = await handleDay6StudioRoute(secured, env, ctx, path);
      if (response) {
        const h = new Headers(response.headers); h.set('X-Galvi-Day6-Clinician-Bridge', 'v2');
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
      }
      throw new GVError('GV_NOT_FOUND', 'Day 6 clinician route was not found.', 404);
    } catch (error) { return failure(ctx, error); }
  }
};
export default worker;
