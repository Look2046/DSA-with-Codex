#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

fail_count=0

while IFS= read -r -d '' file; do
  while IFS= read -r link; do
    target="$link"

    # Skip anchors, external URLs, and mail links
    case "$target" in
      ""|\#*|http://*|https://*|mailto:*)
        continue
        ;;
    esac

    # Drop optional anchor suffix
    target="${target%%#*}"

    # Decode the most common URL-encoded spaces used in repo docs
    target="${target//%20/ }"

    # Resolve relative path from current markdown file
    if [[ "$target" = /* ]]; then
      resolved="$ROOT_DIR$target"
    else
      resolved="$(cd "$(dirname "$file")" && realpath -m "$target")"
    fi

    if [[ ! -e "$resolved" ]]; then
      printf 'BROKEN: %s -> %s\n' "${file#$ROOT_DIR/}" "$link"
      fail_count=$((fail_count + 1))
    fi
  done < <(grep -oE '\[[^]]+\]\(([^)]+)\)' "$file" | sed -E 's/^\[[^]]+\]\(([^)]+)\)$/\1/' || true)
done < <(find "$ROOT_DIR/docs" -type f -name '*.md' -print0)

if [[ "$fail_count" -gt 0 ]]; then
  printf '\nFound %d broken local link(s).\n' "$fail_count"
  exit 1
fi

echo "All local markdown links are valid."
