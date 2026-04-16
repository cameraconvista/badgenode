#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import {
  findAllFiles,
  analyzeFileLengths,
  findDuplicateFiles,
  findTodoFixme,
  findTempFiles,
  checkConfigErrors,
  DiagnosisResult,
} from './utils/diagnose-core';
import { generateReport } from './utils/diagnose-report';

const REPORT_FILE = 'REPORT_DIAGNOSI_INIZIALE.txt';
const SENTINEL_FILE = '.diagnose_done';

function main(): void {
  // Check if already run (unless forced)
  if (existsSync(SENTINEL_FILE) && !process.argv.includes('--force')) {
    console.log('✅ Diagnosi già eseguita. Usa --force per rieseguire.');
    console.log(`📄 Report disponibile: ${REPORT_FILE}`);
    return;
  }

  console.log('🔍 Avvio diagnosi codebase...');

  // Find all code files
  const allFiles = findAllFiles();
  console.log(`📊 Trovati ${allFiles.length} file di codice`);

  // Analyze file lengths
  const { over200, over150, totalLines } = analyzeFileLengths(allFiles);

  // Find duplicates
  const duplicateFiles = findDuplicateFiles(allFiles);

  // Find TODO/FIXME
  const todoFixmeFiles = findTodoFixme(allFiles);

  // Find temp files
  const tempFiles = findTempFiles();

  // Check config errors
  const configErrors = checkConfigErrors();

  const result: DiagnosisResult = {
    filesOver200: over200,
    filesOver150: over150,
    duplicateFiles,
    todoFixmeFiles,
    tempFiles,
    configErrors,
    totalFiles: allFiles.length,
    totalLines,
  };

  // Generate and save report
  const report = generateReport(result);
  writeFileSync(REPORT_FILE, report);

  // Create sentinel file
  writeFileSync(SENTINEL_FILE, new Date().toISOString());

  // Console summary
  console.log('📋 RISULTATI DIAGNOSI:');
  console.log(`   File >200 righe: ${over200.length} ❌`);
  console.log(`   File ≥150 righe: ${over150.length} ⚠️`);
  console.log(`   File duplicati: ${duplicateFiles.length}`);
  console.log(`   TODO/FIXME: ${todoFixmeFiles.length}`);
  console.log(`   File temp: ${tempFiles.length}`);
  console.log(`   Errori config: ${configErrors.length}`);
  console.log('');
  console.log(`📄 Report completo: ${REPORT_FILE}`);
  console.log('✅ Diagnosi completata!');
}

main();
