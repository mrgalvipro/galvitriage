// GalviCare 0.5 QA browser/customer E2E static frontend host.
// Deploy ONLY to galvicare-0-5-qa. Never bind this Worker to Production D1.
import QA_HTML from './dist-qa/index.html';

const PHASE_B_BROWSER_PATCH=`(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 7 Phase B operating-founder critical-path presentation v1';
  const LABELS=new Map([
    ['Consulting Practice','Consulting / Coaching / Creative Entrepreneur'],
    ['Nonprofit','NFP / Academic Institution']
  ]);
  const CARE_COPY={
    green:'Why This Requires Attention: Routine care — no urgent escalation identified',
    yellow:'Why This Requires Attention: Needs attention — passive intervention / ~30-day reassessment',
    orange:'Why This Is Urgent: Material concern — active care recommended',
    red:'Why This Is Urgent: Urgent — prompt active / specialty care'
  };
  let scheduled=false;
  function relabel(){
    document.querySelectorAll('select option').forEach(option=>{
      const next=LABELS.get(String(option.textContent||'').trim());
      if(next)option.textContent=next;
    });
  }
  function canonicalBand(){
    const badge=document.querySelector('.day5-acuity-badge');
    const value=String(badge?.textContent||'').toLowerCase();
    return ['green','yellow','orange','red'].find(b=>value.includes(b))||'';
  }
  function alignFallbackUrgency(){
    const band=canonicalBand(),replacement=CARE_COPY[band];
    if(!replacement)return;
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;
      if(!parent||parent.closest('script,style,textarea,input,select,option,code,pre'))continue;
      const value=String(node.nodeValue||'').trim();
      if(/^Why This Is Urgent:\s*(Immediate|Priority)\s*[—-]\s*Act within \d+ days\.?$/i.test(value)){
        node.nodeValue=node.nodeValue.replace(value,replacement);
        parent.dataset.day7CanonicalAcuity=band;
      }
    }
  }
  function apply(){scheduled=false;relabel();alignFallbackUrgency();}
  function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(apply);}
  function install(){apply();new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});console.info(SIGNATURE,'active; labels changed without changing stored option values; urgency display follows server-owned Acuity');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();`;

const CUSTOMER_ACCESS_PATCH=`(()=>{
  'use strict';
  const SIGNATURE='GalviCare Day 7 returning-patient GalviChart access v1';
  const BASE='https://galvivault-p0-day1-qa.mrgalvipro.workers.dev';
  const text=v=>String(v??'').trim();
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  let working=false;
  function inviteToken(){try{const raw=text(location.hash).replace(/^#/,'');const match=raw.match(/(?:^|&)galviaccess=([^&]+)/);return text(match?.[1]?decodeURIComponent(match[1]):'');}catch{return''}}
  function cleanInvite(){try{const raw=text(location.hash).replace(/^#/,'');const pieces=raw.split('&').filter(x=>!x.startsWith('galviaccess='));history.replaceState(null,'',location.pathname+location.search+'#'+(pieces.join('&')||'galvitriage'));}catch{}}
  async function api(path,body){const r=await fetch(BASE+path,{method:'POST',cache:'no-store',headers:{Accept:'application/json','Content-Type':'application/json','Cache-Control':'no-cache','X-Correlation-Id':'day7-return-'+crypto.randomUUID()},body:JSON.stringify(body||{})});let p={};try{p=await r.json()}catch{}if(!r.ok||p?.success===false){const e=new Error(p?.error?.message||'Unable to access your GalviCare record.');e.code=p?.error?.code||'';e.status=r.status;throw e}return p.data||{}}
  function persistLegacy(sid){if(typeof window.persistSessionId!=='function')throw new Error('GalviCare session continuity is unavailable.');window.persistSessionId(sid);localStorage.setItem('galvitriage_session_submitted','true');}
  async function openChart(data){persistLegacy(data.legacy_session_id);document.getElementById('assessmentForm')?.style.setProperty('display','none','important');for(let i=0;i<20&&!window.GalviChartDay4?.open;i++)await new Promise(r=>setTimeout(r,100));if(!window.GalviChartDay4?.open)throw new Error('GalviChart is not ready. Refresh and log in again.');await window.GalviChartDay4.open();document.getElementById('galvichart-day4')?.scrollIntoView({behavior:'smooth',block:'start'});}
  function installStyle(){if(document.getElementById('day7-returning-patient-style'))return;const s=document.createElement('style');s.id='day7-returning-patient-style';s.textContent='.day7-return-login{margin:16px auto 2px;text-align:center}.day7-return-login button{margin:0 auto}.day7-return-panel{display:none;max-width:520px;margin:14px auto 0;padding:14px;border:1px solid #dbe5ee;border-radius:12px;background:#f8fbff;text-align:left}.day7-return-panel.active{display:block}.day7-return-panel input{width:100%;box-sizing:border-box;margin:5px 0 10px}.day7-return-status{font-size:13px;line-height:1.45;color:#475569;margin-top:10px}.day7-return-status.error{color:#991b1b}.day7-return-intro{font-size:13px;color:#475569;line-height:1.45}';document.head.appendChild(s)}
  function ui(){const form=document.getElementById('assessmentForm'),about=form?.querySelector('.panel');if(!about||about.querySelector('[data-day7-return-login]'))return null;installStyle();const consent=[...about.querySelectorAll('label')].find(l=>l.querySelector('input[name="consent"]'));if(!consent)return null;const wrap=document.createElement('div');wrap.className='day7-return-login';wrap.dataset.day7ReturnLogin='1';wrap.innerHTML='<button type="button" class="secondary-button" data-day7-login-toggle>Returning Patient? Log in to GalviCare</button><div class="day7-return-panel" data-day7-login-panel><p class="day7-return-intro"><strong>Returning care access</strong><br>Log in to view the GalviChart update or treatment item your Business Physician has waiting. If no care item is waiting, begin a new GalviTriage visit below.</p><div data-day7-login-fields><label>Email<input type="email" autocomplete="username" data-day7-login-email></label><label>Password<input type="password" autocomplete="current-password" data-day7-login-password></label><button type="button" data-day7-login-submit>Log in & View GalviChart</button></div><div data-day7-activate-fields hidden><p class="day7-return-intro">Your Business Physician has shared a GalviChart update. If this is your first GalviCare login, create a password of at least 12 characters. Existing patients may continue from this secure invitation without resetting their password.</p><label>New password (first login only)<input type="password" autocomplete="new-password" minlength="12" data-day7-activate-password></label><button type="button" data-day7-activate-submit>Open My GalviChart Update</button></div><p class="day7-return-status" data-day7-return-status aria-live="polite"></p></div>';consent.insertAdjacentElement('afterend',wrap);return wrap}
  function status(w,message,error=false){const n=w?.querySelector('[data-day7-return-status]');if(n){n.textContent=message;n.classList.toggle('error',error)}}
  async function runLogin(w){if(working)return;working=true;const email=text(w.querySelector('[data-day7-login-email]')?.value),password=text(w.querySelector('[data-day7-login-password]')?.value);status(w,'Checking for a Business Physician update…');try{const data=await api('/api/v1/day7/customer-access/login',{email,password});status(w,'Your record is ready. Opening the same GalviChart…');await openChart(data)}catch(e){status(w,e.message,true)}finally{working=false}}
  async function runActivate(w,token){if(working)return;working=true;const password=text(w.querySelector('[data-day7-activate-password]')?.value);status(w,'Verifying your Business Physician update…');try{const data=await api('/api/v1/day7/customer-access/activate',{invite_token:token,password});cleanInvite();status(w,'Access verified. Opening your existing GalviChart…');await openChart(data)}catch(e){status(w,e.message,true)}finally{working=false}}
  function bind(){const w=ui();if(!w)return;const panel=w.querySelector('[data-day7-login-panel]'),token=inviteToken();w.querySelector('[data-day7-login-toggle]').onclick=()=>panel.classList.toggle('active');w.querySelector('[data-day7-login-submit]').onclick=()=>runLogin(w);w.querySelector('[data-day7-login-password]').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runLogin(w)}});if(token.startsWith('gva1_')){panel.classList.add('active');w.querySelector('[data-day7-login-fields]').hidden=true;w.querySelector('[data-day7-activate-fields]').hidden=false;w.querySelector('[data-day7-activate-submit]').onclick=()=>runActivate(w,token);status(w,'A secure GalviChart update invitation was found.')}console.info(SIGNATURE,'active')}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();`;

const SECURITY_HEADERS = Object.freeze({
  'Content-Type': 'text/html; charset=UTF-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://buy.stripe.com"
});

const QA_RUNTIME_HTML=QA_HTML.replace('</body>',`<script>${PHASE_B_BROWSER_PATCH}</script><script>${CUSTOMER_ACCESS_PATCH}</script></body>`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({
        success: true,
        service: 'GalviCare 0.5 QA Frontend',
        environment: 'qa',
        stripe_mode: 'test',
        api: 'https://galvicare-triage-intake.mrgalvipro.workers.dev/api',
        build: 'day7d-cumulative-customer-intelligence-v3',
        release_id: String(env?.DAY7D_FRONTEND_RELEASE_ID || ''),
        day7_phase_b_patch: 'operating-founder-score-acuity-picklist-v1',
        returning_customer_access: 'business-physician-queue-only-v1'
      }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return new Response(request.method === 'HEAD' ? null : QA_RUNTIME_HTML, { status: 200, headers: SECURITY_HEADERS });
  }
};
