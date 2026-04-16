#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const activeRoots = ['client/src', 'server', 'shared'];
const excludedDirs = new Set(['node_modules', 'dist', 'coverage', 'legacy', 'Backup_Automatico']);
const excludedSuffixes = ['.backup'];
const allowlistPath = path.join(rootDir, 'scripts/ci/active-source-guard.allowlist.json');
const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));

const consoleAllowlist = new Set(allowlist.console || []);
const todoAllowlist = new Set(allowlist.todo || []);

function isCommentOnly(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('*/');
}

function shouldSkipDir(direntName) {
  return excludedDirs.has(direntName) || direntName.startsWith('.');
}

function shouldSkipFile(filePath) {
  return excludedSuffixes.some((suffix) => filePath.endsWith(suffix));
}

function collectFiles(dirPath, acc = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      collectFiles(fullPath, acc);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    const relativePath = path.relative(rootDir, fullPath);
    if (shouldSkipFile(relativePath)) continue;
    acc.push(relativePath);
  }
  return acc;
}

function scanConsoleViolations(relativePath, source) {
  if (consoleAllowlist.has(relativePath)) return [];
  const violations = [];
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isCommentOnly(line)) continue;
    if (/\bconsole\.(log|info|debug)\s*\(/.test(line)) {
      violations.push(`${relativePath}:${index + 1}:${line.trim()}`);
    }
  }
  return violations;
}

function scanTodoViolations(relativePath, source) {
  if (todoAllowlist.has(relativePath)) return [];
  const violations = [];
  const lines = source.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!/TODO|FIXME|HACK/.test(line)) continue;
    if (/TODO\(BUSINESS\)/.test(line)) continue;
    if (/\b(TODO|FIXME|HACK)\b/.test(line)) {
      violations.push(`${relativePath}:${index + 1}:${line.trim()}`);
    }
  }
  return violations;
}

const files = activeRoots.flatMap((dir) => collectFiles(path.join(rootDir, dir)));
const consoleViolations = [];
const todoViolations = [];

for (const relativePath of files) {
  const source = fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
  consoleViolations.push(...scanConsoleViolations(relativePath, source));
  todoViolations.push(...scanTodoViolations(relativePath, source));
}

console.log(`Active source guard scanned ${files.length} files`);
console.log(`Allowlisted console debt: ${consoleAllowlist.size} files`);
console.log(`Allowlisted TODO debt: ${todoAllowlist.size} files`);

if (consoleViolations.length > 0) {
  console.error('\n❌ console.log/info/debug found outside allowlist:');
  for (const violation of consoleViolations) console.error(violation);
}

if (todoViolations.length > 0) {
  console.error('\n❌ TODO/FIXME/HACK found outside allowlist:');
  for (const violation of todoViolations) console.error(violation);
}

if (consoleViolations.length > 0 || todoViolations.length > 0) {
  process.exit(1);
}

console.log('✅ Active source guard passed');
