#!/usr/bin/env bash
# Install Lefthook git hooks (run once per clone).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Migrate from legacy core.hooksPath=.githooks
if git config --get core.hooksPath &>/dev/null; then
  git config --unset core.hooksPath
  echo "Removed legacy core.hooksPath"
fi

deno run -A lefthook install

echo "Lefthook installed (see lefthook.yml)"
echo "  pre-commit → deno fmt (stage_fixed) + deno task lint"
echo "  pre-push   → deno task fmt:check"
echo "Manual: deno task pre-commit | deno task pre-push"
