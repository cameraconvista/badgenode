#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  getDocFiles,
  generateSummaryTable,
  generateDetailedContent,
  analyzeQuality,
  getRecentChanges
} from './utils/docs-core';

const DOCS_DIR = 'DOCS';
const OUTPUT_FILE = join(DOCS_DIR, 'REPORT_CONSOLIDATO.txt');

function generateConsolidatedReport(docFiles: any[]): string {
  const timestamp = new Date().toISOString();
  const totalFiles = docFiles.length;
  const totalSize = docFiles.reduce((sum: number, file: any) => sum + file.size, 0);
  const totalLines = docFiles.reduce((sum: number, file: any) => sum + file.lines, 0);
  
  let report = `# 📚 REPORT CONSOLIDATO DOCUMENTAZIONE - BadgeNode\n\n`;
  report += `**Generato**: ${timestamp}\n`;
  report += `**File processati**: ${totalFiles}\n`;
  report += `**Dimensione totale**: ${Math.round(totalSize / 1024)}KB\n`;
  report += `**Righe totali**: ${totalLines.toLocaleString()}\n\n`;
  
  report += `---\n\n`;
  
  // Summary table
  report += `## 📊 SOMMARIO DOCUMENTI\n\n`;
  report += generateSummaryTable(docFiles);
  
  report += `\n---\n\n`;
  
  // Detailed content
  report += `## 📖 CONTENUTI DETTAGLIATI\n\n`;
  report += generateDetailedContent(docFiles);
  
  // File analysis
  report += `---\n\n`;
  report += `## 🔍 ANALISI QUALITÀ\n\n`;
  report += analyzeQuality(docFiles);
  
  // Coverage analysis
  report += `## 📈 COPERTURA DOCUMENTAZIONE\n\n`;
  report += analyzeQuality(docFiles);
  
  // Recent changes
  const recentChanges = getRecentChanges(docFiles);
  if (recentChanges) {
    report += recentChanges;
  }
  
  report += `---\n\n`;
  report += `**Consolidamento completato**: ${timestamp}\n`;
  report += `**File di output**: \`${OUTPUT_FILE}\`\n`;
  report += `**Prossimo aggiornamento**: Eseguire \`npm run docs:consolidate\`\n`;
  
  return report;
}

function main(): void {
  console.log('📚 Consolidamento documentazione...');
  
  const docFiles = getDocFiles();
  
  if (docFiles.length === 0) {
    console.log('⚠️  Nessun file di documentazione trovato');
    return;
  }
  
  console.log(`📊 Trovati ${docFiles.length} file di documentazione`);
  
  const report = generateConsolidatedReport(docFiles);
  
  try {
    writeFileSync(OUTPUT_FILE, report);
    console.log(`✅ Report consolidato creato: ${OUTPUT_FILE}`);
    
    // Summary to console
    const totalSize = docFiles.reduce((sum, file) => sum + file.size, 0);
    const totalLines = docFiles.reduce((sum, file) => sum + file.lines, 0);
    
    console.log('📋 SOMMARIO:');
    console.log(`   File: ${docFiles.length}`);
    console.log(`   Righe: ${totalLines.toLocaleString()}`);
    console.log(`   Dimensione: ${Math.round(totalSize / 1024)}KB`);
    
  } catch (error) {
    console.error('❌ Errore nella creazione del report:', error);
    process.exit(1);
  }
}

main();
