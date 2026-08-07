import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const engine = readFileSync('worker/day7d-engine.js', 'utf8');
const day7dWrangler = JSON.parse(readFileSync('wrangler.day7d.json', 'utf8'));
const galviVaultWrangler = JSON.parse(readFileSync('wrangler.json', 'utf8'));

test('authoritative Day 7D Worker delegates legacy payment return before Day 7D session governance', () => {
  assert.equal(day7dWrangler.main, 'worker/day7d-engine.js');
  assert.equal(galviVaultWrangler.main, 'worker/day1.js');
  assert.equal(galviVaultWrangler.name, 'galvivault-p0-day1-qa');
  assert.match(engine, /const product=ACTION_PRODUCT\[action\]/);
  assert.match(engine, /const day7dOwned=Boolean\(product\)\|\|action==='get_clinical_file'/);
  assert.match(engine, /if\(!day7dOwned\)return legacyWorker\.fetch\(request,env,ctx\)/);
  assert.match(engine, /if\(!sid\)return json\(\{success:false,status:'error',message:'Missing session_id'\},400\)/);

  const delegation = engine.indexOf("if(!day7dOwned)return legacyWorker.fetch(request,env,ctx)");
  const sessionGate = engine.indexOf("if(!sid)return json({success:false,status:'error',message:'Missing session_id'},400)");
  assert.ok(delegation >= 0 && sessionGate >= 0 && delegation < sessionGate,
    'legacy actions such as resolve_payment_return must delegate before the Day 7D session_id gate');

  assert.doesNotMatch(engine, /qa-entry\.js/);
});