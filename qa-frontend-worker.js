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

const SECURITY_HEADERS = Object.freeze({
  'Content-Type': 'text/html; charset=UTF-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://buy.stripe.com"
});

const QA_RUNTIME_HTML=QA_HTML.replace('</body>',`<script>${PHASE_B_BROWSER_PATCH}</script></body>`);

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
        day7_phase_b_patch: 'operating-founder-score-acuity-picklist-v1'
      }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    return new Response(request.method === 'HEAD' ? null : QA_RUNTIME_HTML, { status: 200, headers: SECURITY_HEADERS });
  }
};
