import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const engine=fs.readFileSync('worker/day7d-engine.js','utf8');
const browser=fs.readFileSync('day7d-browser-customer-intelligence.js','utf8');
const builder=fs.readFileSync('scripts/day7b-build-qa-frontend.mjs','utf8');

const