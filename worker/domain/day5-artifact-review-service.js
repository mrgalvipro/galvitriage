import { GVError, clean } from '../day5-common.js';

const text=(v)=>String(v??'').trim();
const parse=(v,fallback={})=>{try{return typeof v==='object'&&v!==null?v:JSON.parse(v||'')}catch{return fallback}};
const candidateRe=/^fnd_ai_([A-Za-z0-9_-]+)_(\d+)$/;

export async function acceptedArtifactReviewCandidates(env,bmrId){
  const row=await env.DB.prepare(`SELECT artifact_id,artifact_json,record_version,generation_source,prompt_version,schema_version,created_at
    FROM gv1_day3_governed_artifacts
    WHERE bmr_id=? AND product='GalviShot' AND validation_status='accepted'
      AND approval_status IN ('not_required','approved') AND customer_projection=1
    ORDER BY record_version DESC,created_at DESC LIMIT 1`).bind(clean(bmrId)).first();
  if(!row)return [];
  const artifact=parse(row.artifact_json,{}), content=artifact?.content&&typeof artifact.content==='object'?artifact.content:artifact;
  return (Array.isArray(content?.findings)?content.findings:[]).slice(0,8).map((finding,index)=>{
    const statement=text(finding?.statement||finding?.title||finding?.finding_text||finding?.finding_code);
    if(!statement)return null;
    return {
      finding_id:`fnd_ai_${row.artifact_id}_${index}`,
      review_candidate:true,
      canonical:false,
      product:'GalviShot',
      finding_type:'governed_ai_review_candidate',
      finding_code:text(finding?.finding_code)||`GALVISHOT_${index+1}`,
      title:text(finding?.title)||statement.slice(0,140),
      statement,
      reasoning_summary:text(finding?.reasoning_summary||finding?.why_it_matters||finding?.implication),
      next_step:text(finding?.next_step||finding?.action||finding?.prescription),
      domain:text(finding?.domain||finding?.dimension),
      confidence:Number.isFinite(Number(finding?.confidence))?Number(finding.confidence):null,
      confirmation_status:'needs_review',
      source_type:'openai_governed',
      source_version:String(row.record_version||1),
      source_artifact_id:row.artifact_id,
      generation_source:row.generation_source,
      prompt_version:row.prompt_version,
      schema_version:row.schema_version,
      created_at:row.created_at
    };
  }).filter(Boolean);
}

export async function materializeAcceptedFindingCandidate(env,ctx,input){
  const supplied=clean(input?.finding_id),match=supplied.match(candidateRe);
  if(!match)return input;
  const artifactId=match[1],index=Number(match[2]);
  const row=await env.DB.prepare(`SELECT artifact_id,bmr_id,artifact_json,record_version,generation_source,created_at
    FROM gv1_day3_governed_artifacts
    WHERE artifact_id=? AND validation_status='accepted' AND approval_status IN ('not_required','approved')
      AND customer_projection=1 AND product='GalviShot'`).bind(artifactId).first();
  if(!row)throw new GVError('GV_FINDING_SOURCE_INVALID','The governed AI finding candidate is no longer eligible for physician review.',409);
  if(clean(input?.bmr_id)!==clean(row.bmr_id))throw new GVError('GV_BMR_SCOPE','The governed AI finding candidate is outside the requested Business Health Record.',403);
  const artifact=parse(row.artifact_json,{}),content=artifact?.content&&typeof artifact.content==='object'?artifact.content:artifact,findings=Array.isArray(content?.findings)?content.findings:[],finding=findings[index];
  if(!finding)throw new GVError('GV_FINDING_SOURCE_INVALID','The governed AI finding candidate could not be resolved.',409);
  const statement=text(finding?.statement||finding?.title||finding?.finding_text||finding?.finding_code);
  if(!statement)throw new GVError('GV_FINDING_SOURCE_INVALID','The governed AI finding candidate is empty.',409);
  const now=new Date().toISOString(),canonicalId=supplied;
  await env.DB.prepare(`INSERT OR IGNORE INTO gv1_findings
    (finding_id,bmr_id,product,finding_type,title,statement,priority,evidence_version,created_at,updated_at,
     finding_group_id,version_no,finding_code,domain,confidence,confidence_band,confirmation_status,governance_version,status,
     source_type,source_version,created_by_type,created_by_id,correlation_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(
      canonicalId,row.bmr_id,'GalviShot','governed_ai_review_candidate',text(finding?.title)||statement.slice(0,140),statement,index+1,Number(row.record_version||1),now,now,
      `fg_${artifactId}_${index}`,1,text(finding?.finding_code)||`GALVISHOT_${index+1}`,text(finding?.domain||finding?.dimension)||null,
      Number.isFinite(Number(finding?.confidence))?Number(finding.confidence):null,null,'needs_review',1,'active','openai_governed',String(row.record_version||1),'galviengine',artifactId,ctx?.correlation||''
    ).run();
  return {...input,finding_id:canonicalId};
}
