import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');

test('Day 7 branchless release controls are present and fail closed', () => {
  const bootstrap = read('scripts/day7-codex-bootstrap.sh');
  assert.match(bootstrap, /git remote add origin/);
  assert.match(bootstrap, /work_is_publish_target=NO/);
  assert.match(bootstrap, /new_branch_created=NO/);
  assert.match(bootstrap, /qa-revamped-galvicare-0-5/);
  assert.doesNotMatch(bootstrap, /git (?:checkout|switch) -b|git branch Day7|git push origin work/);

  const manifest = JSON.parse(read('release-evidence/day7/day7-baseline-manifest.json'));
  assert.equal(manifest.repository, 'mrgalvipro/galvitriage');
  assert.equal(manifest.qa_ref, 'qa-revamped-galvicare-0-5');
  assert.equal(manifest.production_ref, 'main');
  assert.equal(manifest.branch_policy.new_branches_allowed, false);
  assert.equal(manifest.branch_policy.work_is_publish_target, false);
  assert.equal(manifest.branch_policy.force_push_allowed, false);
  assert.equal(manifest.manual_repair, false);
});

test('Day 7 source-of-truth documents are in repository', () => {
  assert.ok(fs.existsSync('docs/GalviStudio_1_0_GalviCare_1_0_Day_7_Builder_Guide_CODEX_Implementation_Engineer_Edition_v1_0.md'));
  assert.ok(fs.existsSync('docs/GalviStudio_1_0_GalviCare_1_0_Seven_Day_Implementation_Guide_AUTHORITATIVE_v1_0.md'));
});

test('Day 7 workflow uses existing QA only and owns critical release checks', () => {
  const workflow = read('.github/workflows/galvistudio-day7-qa.yml');
  assert.match(workflow, /qa-revamped-galvicare-0-5/);
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /scripts\/day7-codex-bootstrap\.sh/);
  assert.match(workflow, /scripts\/day7b-build-qa-frontend\.mjs/);
  assert.match(workflow, /tests\/day7-branchless-release-gate\.test\.mjs/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /day5:gate/);
  assert.match(workflow, /tests\/day6-studio\.test\.mjs/);
  assert.match(workflow, /scripts\/day6-deployed-e2e\.mjs/);
  assert.doesNotMatch(workflow, /refs\/heads\/work|branches:\s*\[?work|git push --force/);
});
