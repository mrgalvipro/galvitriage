import { GVError, clean, now } from '../day5-common.js';

const first=(db,sql,...p)=>db.prepare(sql).bind(...p).first();

function completionCourseId(payload={}){
  const data=payload?.data||{};
  return clean(data?.course?.id||data?.course_id||payload?.course_id||'');
}

export async function recordSystemeFulfillmentCompletion(env,orderId,completionKey,requestClone){
  const key=clean(completionKey),oid=clean(orderId);
  if(!oid||!key)throw new GVError('GV_SYSTEME_FULFILLMENT_REQUIRED','Systeme.io completion requires a canonical order and completion key.',422);

  const fulfillment=await first(env.DB,`SELECT fulfillment_id,systeme_course_id,enrollment_status,completion_status,completed_at FROM gv1_systeme_course_fulfillments WHERE order_id=? AND completion_key=? LIMIT 1`,oid,key);
  if(!fulfillment)throw new GVError('GV_SYSTEME_FULFILLMENT_NOT_FOUND','Systeme.io completion does not match a prescribed GalviVault Sprint fulfillment.',409,{order_id:oid,completion_key:key});
  if(fulfillment.enrollment_status!=='enrolled')throw new GVError('GV_SYSTEME_ENROLLMENT_REQUIRED','Provider completion cannot close a Sprint that GalviVault did not verify as enrolled.',409,{order_id:oid,completion_key:key,enrollment_status:fulfillment.enrollment_status});

  let payload={};
  try{payload=await requestClone.json();}catch{}
  const receivedCourseId=completionCourseId(payload),expectedCourseId=clean(fulfillment.systeme_course_id);
  if(receivedCourseId&&expectedCourseId&&receivedCourseId!==expectedCourseId)throw new GVError('GV_SYSTEME_COURSE_MISMATCH','Systeme.io completion course does not match the prescribed GalviVault fulfillment.',409,{completion_key:key});

  if(fulfillment.completion_status==='completed')return{fulfillment_id:fulfillment.fulfillment_id,completion_key:key,completion_status:'completed',idempotent_replay:true};
  const ts=now();
  await env.DB.prepare(`UPDATE gv1_systeme_course_fulfillments SET completion_status='completed',completed_at=COALESCE(completed_at,?),updated_at=? WHERE fulfillment_id=?`).bind(ts,ts,fulfillment.fulfillment_id).run();
  return{fulfillment_id:fulfillment.fulfillment_id,completion_key:key,completion_status:'completed',idempotent_replay:false};
}
