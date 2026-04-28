#!/usr/bin/env bash
# Blocks Write/Edit on protected files (.env variants and lock files)
command -v jq >/dev/null 2>&1 || { echo "BLOCK: jq is required for pre-tool-guard"; exit 2; }

FILE_PATH=$(jq -r '.tool_input.file_path // empty')
[ -z "$FILE_PATH" ] && exit 0

BASENAME=$(basename "$FILE_PATH")
if [[ "$BASENAME" =~ ^\.env(\..+)?$ && "$BASENAME" != ".env.example" ]] \
   || [[ "$BASENAME" == "pnpm-lock.yaml" ]] \
   || [[ "$BASENAME" =~ \.lock$ ]]; then
  echo "BLOCK: Protected file — .env and lock files must not be edited by Claude"
  exit 2
fi
exit 0
