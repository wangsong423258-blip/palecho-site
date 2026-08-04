#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC="${PROJECT_ROOT}/pages/legacy/PalEcho_website.html"
DST="${PROJECT_ROOT}/pages/index.html"

if [ ! -f "$SRC" ]; then
  echo "Source file not found: $SRC" >&2
  exit 1
fi

cp "$SRC" "$DST"

echo "Synced: $SRC -> $DST"
