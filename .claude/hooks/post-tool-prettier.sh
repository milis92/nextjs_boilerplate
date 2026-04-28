#!/usr/bin/env bash
# Auto-format .ts and .tsx files with Prettier after Write/Edit
FILE_PATH=$(jq -r '.tool_input.file_path // empty')
if echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$'; then
  pnpm prettier --write "$FILE_PATH" 2>/dev/null
fi
exit 0
