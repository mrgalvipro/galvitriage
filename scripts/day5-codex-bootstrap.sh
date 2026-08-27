#!/usr/bin/env bash
set -euo pipefail

# GalviCare 1.0 Day 5 Codex bootstrap
# Purpose: make Codex Web's managed `work` shell usable without ever authoring/publishing `work`.
# This script configures the authoritative public origin when the Codex snapshot omits it,
# fetches ONLY the approved QA/main refs, and proves the current QA head before Day 5 edits.

EXPECTED_REPO="mrgalvipro/galvitriage"
EXPECTED_ORIGIN="https://github.com/mrgalvipro/galvitriage.git"
QA_REF="qa-revamped-galvicare-0-5"

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

task_branch="$(git branch --show-current || true)"
task_head="$(git rev-parse HEAD)"

if git remote get-url origin >/dev/null 2>&1; then
  origin_url="$(git remote get-url origin)"
  case "$origin_url" in
    *github.com/mrgalvipro/galvitriage* ) ;;
    * )
      echo "STOP: unexpected origin: $origin_url" >&2
      exit 41
      ;;
  esac
else
  # Codex Web can materialize a repository snapshot without .git/config remote metadata.
  # The repository is public, so adding the canonical read/write URL does not create a branch.
  git remote add origin "$EXPECTED_ORIGIN"
  origin_url="$EXPECTED_ORIGIN"
fi

# Never use `work` as a publication ref. It is a disposable Codex shell only.
if [[ "$task_branch" == "main" ]]; then
  echo "STOP: Codex task shell is main; do not author Day 5 here." >&2
  exit 42
fi

git fetch --prune origin \
  "+refs/heads/${QA_REF}:refs/remotes/origin/${QA_REF}" \
  "+refs/heads/main:refs/remotes/origin/main"

remote_qa_sha="$(git rev-parse "origin/${QA_REF}")"
remote_main_sha="$(git rev-parse origin/main)"

printf '%s\n' \
  "DAY5_BOOTSTRAP=PASS" \
  "repo_root=$repo_root" \
  "origin_url=$origin_url" \
  "task_shell_branch=${task_branch:-DETACHED}" \
  "task_shell_head=$task_head" \
  "remote_qa_ref=refs/heads/${QA_REF}" \
  "remote_qa_sha=$remote_qa_sha" \
  "remote_main_sha=$remote_main_sha" \
  "work_is_publish_target=NO" \
  "new_branch_created=NO"

# Optional exact Day 4 proof supplied by the execution runbook.
# A docs-only QA descendant is valid as the Day 5 starting ref when its code ancestor is the
# signed Day 4 Build Final and every intervening change is non-runtime documentation only.
if [[ -n "${SIGNED_DAY4_SHA:-}" ]]; then
  git cat-file -e "${SIGNED_DAY4_SHA}^{commit}" 2>/dev/null || {
    echo "STOP: SIGNED_DAY4_SHA is not available after fetch: ${SIGNED_DAY4_SHA}" >&2
    exit 43
  }

  if [[ "$remote_qa_sha" == "$SIGNED_DAY4_SHA" ]]; then
    echo "day4_relation=EXACT_REMOTE_QA"
  elif git merge-base --is-ancestor "$SIGNED_DAY4_SHA" "$remote_qa_sha"; then
    changed="$(git diff --name-only "$SIGNED_DAY4_SHA..$remote_qa_sha")"
    runtime_changed="$(printf '%s\n' "$changed" | grep -Ev '^(docs/|.*\.md$|.*\.txt$|$)' || true)"
    if [[ -n "$runtime_changed" ]]; then
      echo "STOP: QA is ahead of signed Day 4 with runtime/code changes:" >&2
      printf '%s\n' "$runtime_changed" >&2
      exit 44
    fi
    echo "day4_relation=DOCS_ONLY_DESCENDANT"
    echo "signed_day4_sha=$SIGNED_DAY4_SHA"
    echo "docs_only_delta_begin"
    printf '%s\n' "$changed"
    echo "docs_only_delta_end"
  else
    echo "STOP: remote QA does not descend from signed Day 4 Build Final." >&2
    exit 45
  fi
fi

# Do not switch branches or write files here. The caller must author Day 5 in a detached
# exact-QA worktree or use the approved GitHub blob/tree/commit path and update only QA_REF.
