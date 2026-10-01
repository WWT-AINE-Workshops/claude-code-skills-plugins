#!/usr/bin/env bash
set -euo pipefail

# Prints the facts a review starts from: for each file (or each file a commit
# touches), its size, its last commits and the test files that mention it.

if [ "$#" -eq 0 ]; then
  echo "usage: review-context.sh <file-or-commit>..." >&2
  exit 2
fi

files=()
# git show prints paths from the repository root; this turns them into paths from here.
up=$(git rev-parse --show-cdup)
for arg in "$@"; do
  if [ -f "$arg" ]; then
    files+=("$arg")
  elif git rev-parse --verify --quiet "${arg}^{commit}" >/dev/null; then
    while IFS= read -r f; do
      [ -n "$f" ] && files+=("${up}${f}")
    done < <(git show --name-only --format= "$arg")
  else
    echo "not a file or a commit: ${arg}" >&2
    exit 2
  fi
done

if [ "${#files[@]}" -eq 0 ]; then
  echo "nothing to review: no files found" >&2
  exit 2
fi

for f in "${files[@]}"; do
  echo "== ${f}"
  if [ -f "$f" ]; then
    echo "lines: $(wc -l < "$f" | tr -d ' ')"
  else
    echo "lines: (deleted)"
  fi
  echo "recent commits:"
  git log -3 --format='  %h %s' -- "$f"
  name=$(basename "$f")
  name=${name%%.*}
  echo "tests named after or mentioning ${name:-this file}:"
  if [ -z "$name" ]; then
    echo "  (none)"
    continue
  fi
  tests=$(git ls-files '*.test.ts' | grep -e "/${name}\.test\.ts$" || true)
  mentions=$(git ls-files '*.test.ts' | xargs grep -l -w -- "$name" 2>/dev/null || true)
  found=$(printf '%s\n%s\n' "$tests" "$mentions" | sed '/^$/d' | sort -u)
  if [ -n "$found" ]; then
    printf '%s\n' "$found" | sed 's/^/  /'
  else
    echo "  (none)"
  fi
done
