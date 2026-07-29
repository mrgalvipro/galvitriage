import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY7D_RULES_VERSION,
  DAY7D_QUESTION_VERSION,
  DAY7D_CONTENT_VERSION,
  DAY7D_RELEASE_CONTRACT,
  extractQualitativeContext,
  normalizeContextDimension,
  scoreRows,
  reconcile,
  chooseFollowups
} from '../worker/day7d-engine