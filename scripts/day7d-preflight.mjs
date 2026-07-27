import fs from 'node:fs';

const requiredFiles = [
  'worker/day7d-engine.js',
  'worker/day7d-runtime.js',
  'migrations/0006_day7d_customer_intelligence.sql',
  'tests/day7d-customer-intelligence.test.mjs'
];

const failures = [];
for (const path of requiredFiles) {
  if (!fs.existsSync(path)) failures.push(`missing required Day 