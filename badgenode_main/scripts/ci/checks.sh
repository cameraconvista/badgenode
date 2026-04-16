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

echo "▶ Smoke SQL files presenti"
test -f scripts/sql/smoke-test-supabase.sql

echo "✅ Checks passed"
