import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Final Day 7A GalviTriage copy is normalized', () => {
  assert.match(html, /Burn cash or worse — make decisions without realizing the real problem isn't where they're looking\./);
});

test('Final Day 7A GalviShot paywall uses approved heading', () => {
  assert.match(html, /Your GalviShot™ is Ready/);
  assert.doesNotMatch(html, /Your Executive Clinical Findings Are Ready/);
});

test('Final Day 7A GalviSight uses unlocked result hierarchy', () => {
  assert.match(html, /GALVISIGHT™ UNLOCKED/);
  assert.match(html, /class="center">Your GalviSight Prescription/);
  assert.doesNotMatch(html, />GalviSight interpretation ready\.</);
});

test('Final Day 7A GalviPath uses unlocked result hierarchy', () => {
  assert.match(html, /GALVIPATH™ UNLOCKED/);
  assert.match(html, /class="center">Chart Your GalviPath™/);
});

test('Final Day 7A GalviPath Check Up retains approved scheduling destination', () => {
  assert.match(html, /const GALVIPATH_CHECKUP_URL = 'https:\/\/calendly\.com\/galvilpro\/chartyourgalvipath';/);
  assert.match(html, /Book GalviPath™ Check Up to help you Chart Your GalviPath™ with additional clarity/);
});

test('Final Day 7A customer-facing care role is GalviClinician', () => {
  assert.match(html, /GalviClinician/);
  assert.match(html, /Booking a GalviClinic™ session with a live GalviClinician would provide additional reassurance, decision support, accountability, or intervention\./);
  assert.match(html, /GalviClinic™ enables a live GalviClinician to surgically address the root cause/);
});

test('Final Day 7A includes customer grammar normalization helpers', () => {
  assert.match(html, /function normalizeCustomerSentence\(value\)/);
  assert.match(html, /function normalizeCustomerPhrase\(value\)/);
});
