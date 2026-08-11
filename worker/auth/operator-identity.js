import { GVError, clean } from '../day5-common.js';

const b64u = (s) => {
  try {
    const p = String(s).replace(/-/g,'+').replace(/_/g,'/');
    return Uint8Array.from(atob(p + '='.repeat((4-p.length%4)%4)), c=>c.charCodeAt(0));
  } catch { throw new GVError('GV_AUTH_INVALID','Invalid Access token encoding.',401); }
};
const jsonPart = (s) => { try { return JSON.parse(new TextDecoder().decode(b64u(s))); } catch { throw new GVError('GV_AUTH_INVALID','Invalid Access token.',401); } };
const teamBase = (env) => {
  const raw=clean(env?.CF_ACCESS_TEAM_DOMAIN).replace(/\/+$/,'');
  if(!raw) throw new GVError('GV_AUTH_UNAVAILABLE','Cloudflare Access is not configured.',503);
  return /^https?:\/\//.test(raw)?raw:`https://${raw}`;
};
async function jwkFor(env,kid){
  const res=await fetch(`${teamBase(env)}/cdn-cgi/access/certs`,{headers:{Accept:'application/json'},cf:{cacheTtl:300,cacheEverything:true}});
  if(!res.ok) throw new GVError('GV_AUTH_UNAVAILABLE','Unable to validate clinician identity.',503);
  const body=await res.json(); const keys=body.keys||body.public_certs||[];
  const jwk=keys.find(k=>k.kid===kid);
  if(!jwk) throw new GVError('GV_AUTH_INVALID','Access signing key is not trusted.',401);
  return jwk;
}
function directory(env){
  try{
    const parsed=JSON.parse(clean(env?.OPERATOR_DIRECTORY_JSON)||'[]');
    if(!Array.isArray(parsed)) throw new Error();
    return parsed;
  }catch{ throw new GVError('GV_AUTH_UNAVAILABLE','Operator directory is not configured.',503); }
}
export async function requireClinicianIdentity(request,env){
  const token=clean(request.headers.get('Cf-Access-Jwt-Assertion'));
  if(!token) throw new GVError('GV_AUTH_REQUIRED','Clinician authentication is required.',401);
  const parts=token.split('.'); if(parts.length!==3) throw new GVError('GV_AUTH_INVALID','Invalid Access token.',401);
  const header=jsonPart(parts[0]), payload=jsonPart(parts[1]);
  if(header.alg!=='RS256'||!header.kid) throw new GVError('GV_AUTH_INVALID','Unsupported Access token.',401);
  const key=await crypto.subtle.importKey('jwk',await jwkFor(env,header.kid),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64u(parts[2]),new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  if(!ok) throw new GVError('GV_AUTH_INVALID','Invalid Access token signature.',401);
  const now=Math.floor(Date.now()/1000), aud=clean(env?.CF_ACCESS_AUD), issuer=teamBase(env);
  const audiences=Array.isArray(payload.aud)?payload.aud:[payload.aud].filter(Boolean);
  if(!payload.sub||!payload.exp||payload.exp<=now||(payload.nbf&&payload.nbf>now)) throw new GVError('GV_AUTH_INVALID','Expired or invalid Access token.',401);
  if(aud&&!audiences.includes(aud)) throw new GVError('GV_AUTH_INVALID','Access token audience is invalid.',401);
  if(payload.iss&&payload.iss.replace(/\/+$/,'')!==issuer.replace(/\/+$/,'')) throw new GVError('GV_AUTH_INVALID','Access token issuer is invalid.',401);
  const subject=clean(payload.sub), email=clean(payload.email).toLowerCase();
  const matches=directory(env).filter(x=>{
    const configuredSubject=clean(x.subject), configuredEmail=clean(x.email).toLowerCase();
    return (configuredSubject&&configuredSubject===subject)||(configuredEmail&&configuredEmail===email);
  });
  if(matches.length!==1) throw new GVError('GV_AUTH_FORBIDDEN','Clinician identity is not provisioned.',403);
  const op=matches[0], role=clean(op.role).toLowerCase();
  if(clean(op.status).toLowerCase()!=='active'||!['business_physician','clinician'].includes(role)||!clean(op.operator_id)||!clean(op.display_name))
    throw new GVError('GV_AUTH_FORBIDDEN','Clinician identity is not authorized.',403);
  return {operator_id:clean(op.operator_id),display_name:clean(op.display_name),role,subject,email,exp:payload.exp};
}
export function asLegacyOperatorHeaders(request,identity){
  const h=new Headers(request.headers);
  h.delete('X-Galvi-Role'); h.delete('X-Galvi-Actor-Id');
  h.set('X-Galvi-Role',identity.role==='business_physician'?'admin':'operator');
  h.set('X-Galvi-Actor-Id',identity.operator_id);
  return new Request(request,{headers:h});
}
