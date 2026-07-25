const endpoint =
  process.env.GALVICARE_QA_WORKER_URL ||
  'https://galvicare-triage-intake.mrgalvipro.workers.dev/api';

const expectedMarker = 'day7a-payment-products-v1';
const requiredProducts = ['GalviScore','GalviShot','GalviSight','GalviPath'];
const requiredAliases = {
  galviscore:'GalviScore',
  galvi_score:'GalviScore',
  galvishot:'GalviShot',
  galvi_shot:'GalviShot',
  galvisight:'GalviSight',
  galvi_sight:'GalviSight',
  galvipath:'GalviPath',
  galvi_path:'GalviPath'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastError;

for (let attempt = 1; attempt <= 8; attempt += 1) {
  try {
    const response = await fetch(endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'health_check'})
    });
    const body = await response.json();

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(body)}`);
    if (body.success !== true) throw new Error('health_check success=false');
    if (body.runtime_marker !== expectedMarker) throw new Error(`runtime marker mismatch: ${body.runtime_marker}`);
    if (body.environment !== 'qa') throw new Error(`environment mismatch: ${body.environment}`);
    if (body.branch !== 'qa-revamped-galvicare-0-5') throw new Error(`branch mismatch: ${body.branch}`);

    const products = Array.isArray(body.payment_return_products) ? body.payment_return_products : [];
    for (const product of requiredProducts) {
      if (!products.includes(product)) throw new Error(`missing payment product ${product}`);
    }

    const aliases = body.payment_return_aliases || {};
    for (const [alias, product] of Object.entries(requiredAliases)) {
      if (aliases[alias] !== product) throw new Error(`alias mismatch ${alias}: ${aliases[alias]}`);
    }

    console.log(JSON.stringify({
      status:'PASS',
      runtime_marker:body.runtime_marker,
      environment:body.environment,
      branch:body.branch,
      payment_return_products:products,
      payment_return_aliases:aliases
    }, null, 2));
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(`Attempt ${attempt}/8 failed: ${error.message}`);
    if (attempt < 8) await sleep(3000);
  }
}

console.error(`QA runtime verification failed: ${lastError?.message || 'unknown error'}`);
process.exit(1);
