import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'index.html';
const DAY7D_BROWSER = 'day7d-browser-customer-intelligence.js';
const OUT_DIR = 'dist-qa';
const OUT = `${OUT_DIR}/index.html`;
const QA_FRONTEND_ORIGIN = 'https://galvicare-0-5-qa.mrgalvipro.workers.dev';
const QA_CUSTOMER_URL