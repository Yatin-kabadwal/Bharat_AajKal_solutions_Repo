#!/bin/bash
set -euo pipefail

is_tag_push=false

while read local_ref local_sha remote_ref remote_sha
do
  # Check if the ref being pushed is a tag (refs/tags/)
  if [[ "$local_ref" == refs/tags/* ]]; then
    # Extract tag name from the ref
    tag_name=${local_ref#refs/tags/}
    echo "Tag $tag_name is being pushed"
    is_tag_push=true
  fi
done

# If no tag is being pushed, exit early
if [ "$is_tag_push" = false ]; then
  exit 0
fi

git status --porcelain \
  | grep -q "M" \
  && echo "Please commit everything before pushing or use git stash" \
  && exit 1

pnpm run lint
