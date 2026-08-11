import { resolveClinicianSession } from '../routes/operator-auth.js';

export async function requireClinicianIdentity(request,env){
  return resolveClinicianSession(request,env);
}

export function asLegacyOperatorHeaders(request,identity){
  const h=new Headers(request.headers);
  h.delete('X-Galvi-Role'); h.delete('X-Galvi-Actor-Id'); h.delete('X-Galvi-Email');
  h.set('X-Galvi-Role',identity.role==='business_physician'?'admin':'operator');
  h.set('X-Galvi-Actor-Id',identity.operator_id);
  return new Request(request,{headers:h});
}
