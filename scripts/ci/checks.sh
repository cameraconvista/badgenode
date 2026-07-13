#!/usr/bin/env bash
set -euo pipefail

echo "▶ Lint"
npm run lint

echo "▶ Typecheck"
npm run check

echo "▶ Unit tests"
npm run test

echo "▶ Build"
npm run build

echo "▶ Active source guard"
node scripts/ci/active-source-guard.mjs

echo "✅ Checks passed"
