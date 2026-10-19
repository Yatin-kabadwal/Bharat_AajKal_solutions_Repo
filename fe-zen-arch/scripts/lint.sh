#!/bin/bash
set -euo pipefail

# Handle path properly for multi-project setup 
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

function format {
  echo "Checking file formatting"
  pFmt=$(node_modules/.bin/prettier . --write --list-different --cache --cache-strategy metadata | wc -l)
  if [[ $pFmt -gt 0 ]]; then
    echo "Some files weren't formatted and have been formatted, please check and commit again"
    exit 1
  fi
}

format

echo "Checking typescript issues"
tsc --incremental

# Convert eslint plugin written in typescript to javascript
node fe-zen-arch/scripts/compile-typescript.js fe-zen-arch/scripts/eslint-plugins/const-to-function.ts

echo "Checking eslint issues"
if [[ "$*" == *"--fix"* ]]; then
  eslint . --fix --cache --cache-location ./node_modules/.tmp/.eslintcache
else
  eslint . --cache --cache-location ./node_modules/.tmp/.eslintcache
fi
