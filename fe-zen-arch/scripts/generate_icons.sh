#!/bin/bash
set -euo pipefail

# Handle path properly for multi-project setup 
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

svgr_process () {
    local outDir="$1"
    local srcDir="$2"

    rm -rf "$outDir"
    mkdir -p "$outDir"
    npx @svgr/cli \
        --out-dir "$outDir" \
        --filename-case kebab \
        --template icons/svg/svgr-template.cjs \
        --no-dimensions \
        --no-prettier \
        --typescript \
        --no-index \
        --ext "tsx" \
        -- "$srcDir"
}

for dir in "$@"
do
    svgr_process "icons/$dir" "icons/svg/$dir"
done
