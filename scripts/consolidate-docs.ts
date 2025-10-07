#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const DOCS_DIR = 'DOCS';
const OUTPUT_FILE = join(DOCS_DIR, 'REPORT_CONSOLIDATO.txt');

interface DocFile {
  name: string;
  path: string;
  size: number;
  lines: number;
  modified: Date;
}

function getDocFiles(): DocFile[] {
  if (!existsSync(DOCS_DIR)) {
    console.log(`⚠️  Directory ${DOCS_DIR} not found`);
    return [];
  }

  const files = readdirSync(DOCS_DIR);
  const docFiles: DocFile[] = [];

  files.forEach((file) => {
    const filePath = join(DOCS_DIR, file);
    const ext = extname(file);

    // Only process markdown files, skip the output file itself
    if (ext === '.md' && file !== 'REPORT_CONSOLIDATO.txt') {
      try {
        const stats = statSync(filePath);
        const content = readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;

        docFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          lines,
          modified: stats.mtime,
        });
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}:`, error);
      }
    }
  });

  return docFiles.sort((a, b) => a.name.localeCompare(b.name));
}

function extractTitle(content: string): string {
  const lines = content.split('\n');

  // Look for first # heading
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2).trim();
    }
  }

  return 'No title found';
}

function extractSections(content: string): string[] {
  const lines = content.split('\n');
  const sections: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      sections.push(trimmed.substring(3).trim());
    }
  }

  return sections;
}

function generateConsolidatedReport(docFiles: DocFile[]): string {
  const timestamp = new Date().toISOString();
  const totalFiles = docFiles.length;
  const totalSize = docFiles.reduce((sum, file) => sum + file.size, 0);
  const totalLines = docFiles.reduce((sum, file) => sum + file.lines, 0);

  let report = `# 📚 REPORT CONSOLIDATO DOCUMENTAZIONE - BadgeNode\n\n`;
  report += `**Generato**: ${timestamp}\n`;
  report += `**File processati**: ${totalFiles}\n`;
  report += `**Dimensione totale**: ${Math.round(totalSize / 1024)}KB\n`;
  report += `**Righe totali**: ${totalLines.toLocaleString()}\n\n`;

  report += `---\n\n`;

  // Summary table
  report += `## 📊 SOMMARIO DOCUMENTI\n\n`;
  report += `| File | Titolo | Righe | Dimensione | Modificato |\n`;
  report += `|------|--------|-------|------------|------------|\n`;

  docFiles.forEach((file) => {
    const content = readFileSync(file.path, 'utf8');
    const title = extractTitle(content);
    const sizeKB = Math.round(file.size / 1024);
    const modifiedDate = file.modified.toLocaleDateString('it-IT');

    report += `| \`${file.name}\` | ${title} | ${file.lines} | ${sizeKB}KB | ${modifiedDate} |\n`;
  });

  report += `\n---\n\n`;

  // Detailed content
  report += `## 📖 CONTENUTI DETTAGLIATI\n\n`;

  docFiles.forEach((file, index) => {
    const content = readFileSync(file.path, 'utf8');
    const title = extractTitle(content);
    const sections = extractSections(content);

    report += `### ${index + 1}. ${file.name}\n\n`;
    report += `**Titolo**: ${title}\n`;
    report += `**Righe**: ${file.lines}\n`;
    report += `**Dimensione**: ${Math.round(file.size / 1024)}KB\n`;
    report += `**Ultimo aggiornamento**: ${file.modified.toLocaleString('it-IT')}\n\n`;

    if (sections.length > 0) {
      report += `**Sezioni**:\n`;
      sections.forEach((section) => {
        report += `- ${section}\n`;
      });
    } else {
      report += `**Sezioni**: Nessuna sezione trovata\n`;
    }

    report += `\n`;
  });

  // File analysis
  report += `---\n\n`;
  report += `## 🔍 ANALISI QUALITÀ\n\n`;

  // Check for files over 200 lines
  const longFiles = docFiles.filter((f) => f.lines > 200);
  if (longFiles.length > 0) {
    report += `⚠️ **File che superano 200 righe**:\n`;
    longFiles.forEach((file) => {
      report += `- \`${file.name}\`: ${file.lines} righe\n`;
    });
    report += `\n`;
  } else {
    report += `✅ Tutti i file rispettano il limite di 200 righe\n\n`;
  }

  // Check for missing essential docs
  const essentialDocs = [
    '01_database_api.md',
    '02_struttura_progetto.md',
    '03_scripts_utilita.md',
    '04_config_sviluppo.md',
    '05_setup_sviluppo.md',
    'ICONS_GUIDE.md',
    'LOGICA_GIORNO_LOGICO.md',
  ];

  const missingDocs = essentialDocs.filter((doc) => !docFiles.some((file) => file.name === doc));

  if (missingDocs.length > 0) {
    report += `❌ **Documenti mancanti**:\n`;
    missingDocs.forEach((doc) => {
      report += `- \`${doc}\`\n`;
    });
    report += `\n`;
  } else {
    report += `✅ Tutti i documenti essenziali sono presenti\n\n`;
  }

  // Coverage analysis
  report += `## 📈 COPERTURA DOCUMENTAZIONE\n\n`;
  const coverage = Math.round((docFiles.length / essentialDocs.length) * 100);
  report += `**Copertura**: ${coverage}% (${docFiles.length}/${essentialDocs.length} documenti essenziali)\n\n`;

  if (coverage >= 100) {
    report += `🎉 Documentazione completa!\n\n`;
  } else if (coverage >= 80) {
    report += `👍 Buona copertura documentazione\n\n`;
  } else {
    report += `⚠️ Documentazione incompleta\n\n`;
  }

  // Recent changes
  const recentFiles = docFiles
    .filter((f) => {
      const daysSinceModified = (Date.now() - f.modified.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceModified <= 7;
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());

  if (recentFiles.length > 0) {
    report += `## 🆕 MODIFICHE RECENTI (ultimi 7 giorni)\n\n`;
    recentFiles.forEach((file) => {
      const daysAgo = Math.floor((Date.now() - file.modified.getTime()) / (1000 * 60 * 60 * 24));
      const timeAgo = daysAgo === 0 ? 'oggi' : `${daysAgo} giorni fa`;
      report += `- \`${file.name}\`: modificato ${timeAgo}\n`;
    });
    report += `\n`;
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
