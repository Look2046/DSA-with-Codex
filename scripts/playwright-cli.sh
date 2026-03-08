#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
CLI_BIN="$ROOT_DIR/node_modules/.bin/playwright-cli"
CONFIG_FILE="$ROOT_DIR/playwright-cli.json"

if [[ ! -x "$CLI_BIN" ]]; then
  echo "Missing local playwright-cli binary. Run: npm install" >&2
  exit 1
fi

# Keep browser downloads in the user cache so WSL-level installs are reusable.
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"

exec "$CLI_BIN" --config "$CONFIG_FILE" "$@"
