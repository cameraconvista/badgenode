#!/usr/bin/env node

import { DiagnosisResult } from './diagnose-core';

export function generateReport(result: DiagnosisResult): string {
  const timestamp = new Date().toISOString();
  
  let report = `# 🔍 DIAGNOSI CODEBASE - BadgeNode\n\n`;
  report += `**Data**: ${timestamp}\n`;
  report += `**File analizzati**: ${result.totalFiles}\n`;
  report += `**Righe totali**: ${result.totalLines.toLocaleString()}\n\n`;
  
  report += `---\n\n`;
  
  // File length violations
  report += `## 🚨 VIOLAZIONI LIMITE 200 RIGHE\n\n`;
  if (result.filesOver200.length === 0) {
    report += `✅ Nessuna violazione trovata\n\n`;
  } else {
    report += `❌ **${result.filesOver200.length} file superano il limite**:\n\n`;
    result.filesOver200
      .sort((a, b) => b.lines - a.lines)
      .forEach(file => {
        report += `- \`${file.path}\`: **${file.lines} righe** (${Math.round(file.size / 1024)}KB)\n`;
      });
    report += `\n`;
  }
  
  // Warning files
  report += `## ⚠️ FILE VICINI AL LIMITE (≥150 righe)\n\n`;
  if (result.filesOver150.length === 0) {
    report += `✅ Nessun file in warning\n\n`;
  } else {
    report += `⚠️ **${result.filesOver150.length} file in warning**:\n\n`;
    result.filesOver150
      .sort((a, b) => b.lines - a.lines)
      .forEach(file => {
        report += `- \`${file.path}\`: ${file.lines} righe\n`;
      });
    report += `\n`;
  }
  
  // Duplicate files
  report += `## 📋 FILE DUPLICATI\n\n`;
  if (result.duplicateFiles.length === 0) {
    report += `✅ Nessun duplicato trovato\n\n`;
  } else {
    report += `⚠️ **${result.duplicateFiles.length} gruppi di duplicati**:\n\n`;
    result.duplicateFiles.forEach((group, index) => {
      report += `**Gruppo ${index + 1}** (${Math.round(group.size / 1024)}KB):\n`;
      group.files.forEach(file => {
        report += `- \`${file}\`\n`;
      });
      report += `\n`;
    });
  }
  
  // TODO/FIXME
  report += `## 📝 TODO/FIXME NEL CODICE\n\n`;
  if (result.todoFixmeFiles.length === 0) {
    report += `✅ Nessun TODO/FIXME trovato\n\n`;
  } else {
    report += `📋 **${result.todoFixmeFiles.length} file con TODO/FIXME**:\n\n`;
    result.todoFixmeFiles.forEach(item => {
      report += `- \`${item.file}\`: ${item.matches.join(', ')}\n`;
    });
    report += `\n`;
  }
  
  // Temp files
  report += `## 🗑️ FILE TEMPORANEI\n\n`;
  if (result.tempFiles.length === 0) {
    report += `✅ Nessun file temporaneo trovato\n\n`;
  } else {
    report += `🧹 **${result.tempFiles.length} file temporanei**:\n\n`;
    result.tempFiles.forEach(file => {
      report += `- \`${file}\`\n`;
    });
    report += `\n`;
  }
  
  // Config errors
  report += `## ⚙️ ERRORI CONFIGURAZIONE\n\n`;
  if (result.configErrors.length === 0) {
    report += `✅ Configurazione OK\n\n`;
  } else {
    report += `❌ **${result.configErrors.length} errori**:\n\n`;
    result.configErrors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }
  
  report += `---\n\n`;
  report += `**Diagnosi completata**: ${timestamp}\n`;
  report += `**Prossimo step**: Risolvere violazioni limite 200 righe\n`;
  
  return report;
}
