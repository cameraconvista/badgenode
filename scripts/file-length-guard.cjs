#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STRICT_MODE = true; // Attivato per Prompt 2/2
const MAX_LINES = 200;
const WARNING_LINES = 150;

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output
      .trim()
      .split('\n')
      .filter((file) => file.length > 0);
  } catch (error) {
    console.log('No staged files found');
    return [];
  }
}

function countLines(filePath) {
  try {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
  }
}

function isCodeFile(filePath) {
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const excludeDirs = ['/ARCHIVE/', '/DOCS/', '/Backup_Automatico/', 'node_modules/', '.git/'];
  
  // Escludi directory specifiche
  if (excludeDirs.some(dir => filePath.includes(dir))) {
    return false;
  }
  
  return codeExtensions.some(ext => filePath.endsWith(ext));
}

function main() {
  const stagedFiles = getStagedFiles();
  const codeFiles = stagedFiles.filter(isCodeFile);
  if (codeFiles.length === 0) {
    console.log('✅ No code files to check');
    process.exit(0);
  }

  const violations = [];
  const warnings = [];

  codeFiles.forEach((file) => {
    const lines = countLines(file);

    if (lines > MAX_LINES) {
      violations.push({ file, lines });
    } else if (lines >= WARNING_LINES) {
      warnings.push({ file, lines });
    }
  });

  // Mostra sempre i warnings
  if (warnings.length > 0) {
    console.log('\n⚠️  Files approaching 200 line limit:');
    warnings.forEach(({ file, lines }) => {
      console.log(`   ${file}: ${lines} lines (warning ≥${WARNING_LINES})`);
    });
  }

  // Gestisci violazioni
  if (violations.length > 0) {
    console.log('\n🚨 Files exceeding 200 line limit:');
    violations.forEach(({ file, lines }) => {
      console.log(`   ${file}: ${lines} lines (max ${MAX_LINES})`);
    });

    if (STRICT_MODE) {
      console.log('\n❌ COMMIT BLOCKED: Files exceed 200 line limit');
      console.log('   Please split these files before committing');
      process.exit(1);
    } else {
      console.log('\n⚠️  WARNING MODE: Files exceed 200 line limit');
      console.log('   Will be enforced in Prompt 2/2');
    }
  }

  console.log('✅ File length check completed');
  process.exit(0);
}

main();
