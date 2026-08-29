#!/usr/bin/env bash
set -euo pipefail

# GalviStudio | GalviCare 1.0 Day 7 Codex bootstrap.
# Repairs a Codex Web snapshot that is labeled `work` and/or has no origin.
# It never authors or publishes `work`, never creates a branch, and fetches only
# the already-authorized QA and production refs.

EXPECTED_ORIGIN="https://github.com/mrgalvipro/galvitriage.git"
QA_REF="qa-revamped-galvicare-0-5"
DAY6_RUNTIME_CANDIDATE="${DAY6_RUNTIME_CANDIDATE:-a197197217939f6301ca96c6ff0310bb8724d778}"

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
task_branch="$(git branch --show-current || true)"
task_head="$(git rev-parse HEAD)"

if git remote get-url origin >/dev/null 2>&1; then
  origin_url="$(git remote get-url origin)"
  case "$origin_url" in
    *github.com/mrgalvipro/galvitriage* ) ;;
    *) echo "STOP: unexpected origin: $origin_url" >&2; exit 41 ;;
  esac
else
  git remote add origin "$EXPECTED_ORIGIN"
  origin_url="$EXPECTED_ORIGIN"
fi

# `work` is a disposable task-shell label, not a publication ref. `main` is never
# an authoring checkout. Day 7 work must occur in a detached exact-QA worktree or
# through the GitHub blob/tree/commit lane.
if [[ "$task_branch" == "main" ]]; then
  echo "STOP: main is production destination only." >&2
  exit 42
fi

git fetch --prune origin \
  "+refs/heads/${QA_REF}:refs/remotes/origin/${QA_REF}" \
  "+refs/heads/main:refs/remotes/origin/main"

remote_qa_sha="$(git rev-parse "origin/${QA_REF}")"
remote_main_sha="$(git rev-parse origin/main)"

git cat-file -e "${DAY6_RUNTIME_CANDIDATE}^{commit}" 2>/dev/null || {
  echo "STOP: Day 6 runtime candidate is unavailable: ${DAY6_RUNTIME_CANDIDATE}" >&2
  exit 43
}

# The known Day 6 runtime candidate may have only release-control/non-runtime
# descendants before Day 7 starts. This is the same guard pattern proven in the
# Day 5 bootstrap; it prevents a documentation upload from being mistaken for
# runtime drift while still rejecting unreviewed application changes.
if [[ "$remote_qa_sha" == "$DAY6_RUNTIME_CANDIDATE" ]]; then
  relation="EXACT_DAY6_RUNTIME"
elif git merge-base --is-ancestor "$DAY6_RUNTIME_CANDIDATE" "$remote_qa_sha"; then
  changed="$(git diff --name-only "$DAY6_RUNTIME_CANDIDATE..$remote_qa_sha")"
  unexpected="$(printf '%s\n' "$changed" | grep -Ev \
    '^(docs/|release-evidence/day7/|scripts/day7-codex-bootstrap\.sh|tests/day7-branchless-release-gate\.test\.mjs|\.github/workflows/galvistudio-day7-qa\.yml)$' || true)"
  if [[ -n "$unexpected" ]]; then
    echo "STOP: QA is ahead of the Day 6 runtime candidate with unapproved runtime/code changes:" >&2
    printf '%s\n' "$unexpected" >&2
    exit 44
  fi
  relation="APPROVED_RELEASE_CONTROL_DESCENDANT"
else
  echo "STOP: QA does not descend from the Day 6 runtime candidate." >&2
  exit 45
fi

printf '%s\n' \
  "DAY7_BOOTSTRAP=PASS" \
  "repo_root=$repo_root" \
  "origin_url=$origin_url" \
  "task_shell_branch=${task_branch:-DETACHED}" \
  "task_shell_head=$task_head" \
  "remote_qa_sha=$remote_qa_sha" \
  "remote_main_sha=$remote_main_sha" \
  "day6_runtime_candidate=$DAY6_RUNTIME_CANDIDATE" \
  "day6_relation=$relation" \
  "work_is_publish_target=NO" \
  "new_branch_created=NO" \
  "force_push_allowed=NO"

if [[ "${DAY7_CREATE_DETACHED_WORKTREE:-0}" == "1" ]]; then
  build_dir="${DAY7_BUILD_DIR:-/tmp/galvicare-day7-${remote_qa_sha:0:8}}"
  rm -rf "$build_dir"
  git worktree add --detach "$build_dir" "$remote_qa_sha"
  printf 'detached_worktree=%s\n' "$build_dir"
fi

# Publication rule:
#   - never `git push origin work`
#   - never create a Day7/release/hotfix branch
#   - after a fresh remote-base race check, publish a tested detached commit only
#     to refs/heads/qa-revamped-galvicare-0-5, or use GitHub blob/tree/commit API.
