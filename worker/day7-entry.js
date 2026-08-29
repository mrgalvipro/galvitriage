import day6Worker from './day6-entry.js';
import { GVError, context, failure, headers, requireRuntime } from './day5-common.js';
import { handleDay7ReleaseRoute } from './routes/day7-release.js';

export const DAY7_RELEASE_RUNTIME='galvistudio_galvicare_1_0_day7_release_v1';

function wrap(response){
  if(!response)return response;
  const out=new Headers(response.headers);
  out.set('X-Galvi-Day7-Release',DAY7_RELEASE_RUNTIME);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers:out});
}

export default {async fetch(request,env,executionContext){
  const ctx=context(request,env);
  try{
    requireRuntime(env,ctx);
    if(ctx.origin&&!ctx.allowedOrigins.includes(ctx.origin)) throw new GVError('GV_CORS_DENIED','The request origin is not allowed.',403);
    const url=new URL(request.url),path=url.pathname.replace(/\/+$/,'')||'/';
    if(request.method==='OPTIONS'&&path.startsWith('/api/v1/day7/')) return new Response(null,{status:204,headers:headers(ctx)});
    const response=await handleDay7ReleaseRoute(request,env,ctx,path);
    if(response)return wrap(response);
    return wrap(await day6Worker.fetch(request,env,executionContext));
  }catch(error){return wrap(failure(ctx,error));}
}};
