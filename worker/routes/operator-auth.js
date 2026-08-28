import { GVError, clean, newId, jsonBody } from '../day5-common.js';

const enc=new TextEncoder();
const b64u=(bytes)=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromB64u=(s)=>Uint8Array.from(atob(String(s).replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-String(s).length%4)%4)),c=>c.charCodeAt(0));
const iso=(ms=0)=>new Date(Date.now()+ms).toISOString();
const normEmail=(v)=>clean(v).toLowerCase();
const sha256=async(v)=>b64u(await crypto.subtle.digest('SHA-256',enc.encode(String(v))));
const randomToken=(n=32)=>{const b=new Uint8Array(n);crypto.getRandomValues(b);return b64u(b)};
const cookie=(request)=>Object.fromEntries((request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),x.slice(i+1)]}));
const sessionCookie=(value,maxAge)=>`gv8_session=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
const body=(request)=>jsonBody(request);
async function one(db,sql,...args){return db.prepare(sql).bind(...args).first()}
async function run(db,sql,...args){return db.prepare(sql).bind(...args).run()}

async function issueSession(env,operator,credentialId){
  const token=randomToken(32), hash=await sha256(token), expires=iso(8*60*60*1000);
  await run(env.DB,`INSERT INTO gv8_operator_sessions(session_hash,operator_id,credential_id,expires_at,created_at) VALUES(?,?,?,?,?)`,hash,operator.operator_id,credentialId,expires,iso());
  return {token,expires};
}

export async function resolveClinicianSession(request,env){
  const raw=clean(cookie(request).gv8_session);
  if(!raw)throw new GVError('GV_AUTH_REQUIRED','Clinician authentication is required.',401);
  const hash=await sha256(raw);
  const row=await one(env.DB,`SELECT s.operator_id,s.credential_id,s.expires_at,c.email_normalized,c.display_name,c.role,c.status
    FROM gv8_operator_sessions s JOIN gv8_operator_credentials c ON c.credential_id=s.credential_id AND c.operator_id=s.operator_id
    WHERE s.session_hash=? AND s.revoked_at IS NULL AND s.expires_at>?`,hash,iso());
  if(!row)throw new GVError('GV_AUTH_REQUIRED','Clinician session is invalid or expired.',401);
  if(row.status!=='active')throw new GVError('GV_AUTH_FORBIDDEN','Clinician identity is not authorized.',403);
  return {operator_id:row.operator_id,credential_id:row.credential_id,email:row.email_normalized,display_name:row.display_name,role:row.role,exp:Math.floor(new Date(row.expires_at).getTime()/1000)};
}

export async function logoutClinician(request,env){
  const raw=clean(cookie(request).gv8_session);
  if(raw){const hash=await sha256(raw);await run(env.DB,`UPDATE gv8_operator_sessions SET revoked_at=? WHERE session_hash=? AND revoked_at IS NULL`,iso(),hash)}
}

export async function handleOperatorAuth(request,env,ctx,path,success){
  if(request.method==='POST'&&path==='/api/v1/operator/auth/enroll'){
    const p=await body(request), email=normEmail(p.email), token=clean(p.enrollment_token), credentialId=clean(p.credential_id), publicJwk=p.public_jwk;
    if(!email||!token||!credentialId||!publicJwk)throw new GVError('GV_REQ_SCHEMA','email, enrollment_token, credential_id, and public_jwk are required.',422);
    if(clean(publicJwk.kty)!=='EC'||clean(publicJwk.crv)!=='P-256'||!clean(publicJwk.x)||!clean(publicJwk.y))throw new GVError('GV_REQ_SCHEMA','A P-256 public credential is required.',422);

    const tokenHash=await sha256(token), bootstrapEmail=normEmail(env.BUSINESS_PHYSICIAN_EMAIL), bootstrapHash=clean(env.BUSINESS_PHYSICIAN_ENROLLMENT_HASH);
    const bootstrapUse=bootstrapHash?await one(env.DB,`SELECT used_at FROM gv8_operator_invitations WHERE invitation_hash=?`,bootstrapHash):null;
    const bootstrapAuthorized=email===bootstrapEmail&&Boolean(bootstrapHash)&&tokenHash===bootstrapHash&&!bootstrapUse?.used_at;
    const existing=await one(env.DB,`SELECT credential_id,operator_id,email_normalized,display_name,role,status FROM gv8_operator_credentials WHERE email_normalized=? AND status='active'`,email);
    let operator=null, invitation=null, deviceReplaced=false;

    if(bootstrapAuthorized){
      operator={operator_id:'op_mrgalvipro_qa',email_normalized:email,display_name:'Mr. GalviPro',role:'business_physician'};
      if(existing){
        if(existing.operator_id!==operator.operator_id||existing.role!=='business_physician')throw new GVError('GV_AUTH_FORBIDDEN','Existing clinician identity cannot be replaced by the Business Physician recovery flow.',403);
        deviceReplaced=true;
      }
    }else{
      invitation=await one(env.DB,`SELECT invitation_hash,operator_id,email_normalized,display_name,role,expires_at,used_at FROM gv8_operator_invitations WHERE invitation_hash=?`,tokenHash);
      if(invitation&&!invitation.used_at&&invitation.expires_at>iso()&&invitation.email_normalized===email)operator=invitation;
    }
    if(existing&&!deviceReplaced)throw new GVError('GV_AUTH_FORBIDDEN','This operator is already enrolled. Use the approved-device sign-in or a newly issued one-time Business Physician recovery code.',403);
    if(!operator)throw new GVError('GV_AUTH_FORBIDDEN','Enrollment is not authorized or the one-time code has already been used.',403);

    const now=iso(), statements=[];
    if(deviceReplaced){
      statements.push(env.DB.prepare(`UPDATE gv8_operator_credentials SET status='disabled',updated_at=? WHERE operator_id=? AND email_normalized=? AND status='active'`).bind(now,operator.operator_id,email));
      statements.push(env.DB.prepare(`UPDATE gv8_operator_sessions SET revoked_at=? WHERE operator_id=? AND revoked_at IS NULL`).bind(now,operator.operator_id));
    }
    statements.push(env.DB.prepare(`INSERT INTO gv8_operator_credentials(credential_id,operator_id,email_normalized,display_name,role,public_jwk,status,created_at,updated_at) VALUES(?,?,?,?,?,?, 'active',?,?)`).bind(credentialId,operator.operator_id,email,operator.display_name,operator.role,JSON.stringify(publicJwk),now,now));
    if(invitation)statements.push(env.DB.prepare(`UPDATE gv8_operator_invitations SET used_at=? WHERE invitation_hash=? AND used_at IS NULL`).bind(now,tokenHash));
    if(bootstrapAuthorized)statements.push(env.DB.prepare(`INSERT OR REPLACE INTO gv8_operator_invitations(invitation_hash,operator_id,email_normalized,display_name,role,expires_at,used_at,created_at,created_by) VALUES(?,?,?,?,?,?,?,?,?)`).bind(bootstrapHash,operator.operator_id,email,operator.display_name,operator.role,now,now,now,'qa_business_physician_bootstrap'));
    await env.DB.batch(statements);

    const session=await issueSession(env,operator,credentialId);
    const response=success(ctx,{operator_id:operator.operator_id,display_name:operator.display_name,role:operator.role,environment:ctx.environment,auth_expires_at:session.expires,device_replaced:deviceReplaced,enrollment_code_consumed:true},201);
    response.headers.append('Set-Cookie',sessionCookie(session.token,8*60*60)); return response;
  }

  if(request.method==='POST'&&path==='/api/v1/operator/auth/login/options'){
    const p=await body(request), email=normEmail(p.email);
    if(!email)throw new GVError('GV_REQ_SCHEMA','email is required.',422);
    const cred=await one(env.DB,`SELECT credential_id,operator_id FROM gv8_operator_credentials WHERE email_normalized=? AND status='active'`,email);
    const challenge=randomToken(32), challengeId=newId('ach');
    if(cred)await run(env.DB,`INSERT INTO gv8_auth_challenges(challenge_id,operator_id,purpose,challenge,credential_id,expires_at,created_at) VALUES(?,?,'login',?,?,?,?)`,challengeId,cred.operator_id,challenge,cred.credential_id,iso(5*60*1000),iso());
    return success(ctx,{challenge_id:challengeId,challenge,credential_id:cred?.credential_id||`cred_${randomToken(12)}`,expires_in_seconds:300});
  }

  if(request.method==='POST'&&path==='/api/v1/operator/auth/login/verify'){
    const p=await body(request), challengeId=clean(p.challenge_id), credentialId=clean(p.credential_id), signature=clean(p.signature);
    if(!challengeId||!credentialId||!signature)throw new GVError('GV_REQ_SCHEMA','challenge_id, credential_id, and signature are required.',422);
    const row=await one(env.DB,`SELECT a.challenge_id,a.challenge,a.expires_at,a.used_at,c.credential_id,c.operator_id,c.email_normalized,c.display_name,c.role,c.status,c.public_jwk
      FROM gv8_auth_challenges a JOIN gv8_operator_credentials c ON c.credential_id=a.credential_id AND c.operator_id=a.operator_id
      WHERE a.challenge_id=? AND a.credential_id=? AND a.purpose='login'`,challengeId,credentialId);
    if(!row||row.used_at||row.expires_at<=iso()||row.status!=='active')throw new GVError('GV_AUTH_INVALID','Authentication failed.',401);
    let key; try{key=await crypto.subtle.importKey('jwk',JSON.parse(row.public_jwk),{name:'ECDSA',namedCurve:'P-256'},false,['verify'])}catch{throw new GVError('GV_AUTH_INVALID','Authentication failed.',401)}
    let valid=false; try{valid=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,fromB64u(signature),enc.encode(row.challenge))}catch{}
    if(!valid)throw new GVError('GV_AUTH_INVALID','Authentication failed.',401);
    await env.DB.batch([
      env.DB.prepare(`UPDATE gv8_auth_challenges SET used_at=? WHERE challenge_id=? AND used_at IS NULL`).bind(iso(),challengeId),
      env.DB.prepare(`UPDATE gv8_operator_credentials SET last_used_at=?,updated_at=? WHERE credential_id=?`).bind(iso(),iso(),credentialId)
    ]);
    const session=await issueSession(env,row,credentialId);
    const response=success(ctx,{operator_id:row.operator_id,display_name:row.display_name,role:row.role,environment:ctx.environment,auth_expires_at:session.expires});
    response.headers.append('Set-Cookie',sessionCookie(session.token,8*60*60)); return response;
  }

  if(request.method==='POST'&&path==='/api/v1/operator/auth/logout'){
    await logoutClinician(request,env); const response=success(ctx,{logged_out:true}); response.headers.append('Set-Cookie',sessionCookie('',0)); return response;
  }
  return null;
}
