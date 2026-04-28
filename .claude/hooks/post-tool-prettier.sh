#!/usr/bin/env bash
# Auto-format Prettier-handled files after Write/Edit
FILE_PATH=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|json|jsonc|md|yml|yaml|css)$'; then
  if ! output=$(pnpm prettier --write "$FILE_PATH" 2>&1); then
    echo "ERROR: Prettier failed on $FILE_PATH"
    echo "$output"
    exit 1
  fi
fi
exit 0
