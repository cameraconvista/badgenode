#!/usr/bin/env bash
set -euo pipefail

echo "▶ Typecheck"
npm run check

echo "▶ Build (test)"
npm run build

echo "▶ Grep guard (niente console.log/FIXME/HACK/TODO non-business)"
! grep -R --line-number --include="*.ts" --include="*.tsx" -E "console\.log\(|FIXME|HACK" client/src || (echo "❌ Debug/FIXME/HACK trovati"; exit 1)
! grep -R --line-number --include="*.ts" --include="*.tsx" "TODO" client/src | grep -v "TODO(BUSINESS)" || (echo "❌ TODO non-business trovati (usa TODO(BUSINESS))"; exit 1)

echo "▶ Smoke SQL files presenti"
test -f scripts/sql/smoke-test-supabase.sql

echo "✅ Checks passed"
