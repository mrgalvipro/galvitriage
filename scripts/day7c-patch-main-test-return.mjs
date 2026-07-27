import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2] || 'index.html';
const QA_URL = 'https://galvicare-0-5-qa.mrgalvipro.workers.dev/';
const MARKER = 'DAY7C_TEST_RETURN_QUARANTINE_V1';

let html = readFileSync(path, 'utf8');

const bridge = `\n  <!-- ${MARKER}: TEST Stripe returns are quarantined to QA before Production telemetry/API initializes. -->\n  <script>\n  (function(){\n    try {\n      var p = new URLSearchParams(window.location.search);\n      var stripeSessionId = String(p.get('stripe_session_id') || p.get('session_id') || '');\n      var paid = String(p.get('paid') || '');\n      var product = String(p.get('product') || '').toLowerCase();\n      var paidMarkers = ['score_success','shot_success','sight_success','path_success'];\n      var products = ['galviscore','galvishot','galvisight','galvipath'];\n      if (stripeSessionId.indexOf('cs_test_') === 0 && paidMarkers.indexOf(paid) !== -1 && products.indexOf(product) !== -1) {\n        var target = new URL('${QA_URL}');\n        target.search = window.location.search;\n        target.hash = 'galvitriage';\n        window.location.replace(target.toString());\n      }\n    } catch (error) {\n      console.error('Day 7C TEST return quarantine failed.', error);\n    }\n  })();\n  <\/script>\n`;

if (!html.includes(MARKER)) {
  if (!html.includes('<head>')) throw new Error('index.html is missing <head>.');
  html = html.replace('<head>', `<head>${bridge}`);
}

if (!html.includes(MARKER)) throw new Error('TEST return quarantine marker was not installed.');
if (!html.includes(QA_URL)) throw new Error('QA destination was not installed.');

writeFileSync(path, html, 'utf8');
console.log(`PASS — ${MARKER} installed in ${path}.`);
