#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/5] Installing workspace dependencies..."
npm ci

echo "[2/5] Building workspace packages (for cross-package type resolution)..."
npm run build

echo "[3/5] Running TypeScript type checks..."
npm run typecheck

echo "[4/5] Running unit tests..."
npm test

echo "[5/5] Building static sites..."
npm run build:sites

echo "Environment setup completed successfully."
