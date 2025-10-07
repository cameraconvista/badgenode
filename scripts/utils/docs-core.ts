#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const DOCS_DIR = 'DOCS';

export interface DocFile {
  name: string;
  path: string;
  size: number;
  lines: number;
  modified: Date;
}

export function getDocFiles(): DocFile[] {
  if (!existsSync(DOCS_DIR)) {
    console.log(`⚠️  Directory ${DOCS_DIR} not found`);
    return [];
  }
  
  const files = readdirSync(DOCS_DIR);
  const docFiles: DocFile[] = [];
  
  files.forEach(file => {
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
          modified: stats.mtime
        });
      } catch (error) {
        console.warn(`⚠️  Could not read ${file}:`, error);
      }
    }
  });
  
  return docFiles.sort((a, b) => a.name.localeCompare(b.name));
}

export function extractTitle(content: string): string {
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

export function extractSections(content: string): string[] {
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

export function generateSummaryTable(docFiles: DocFile[]): string {
  let table = `| File | Titolo | Righe | Dimensione | Modificato |\n`;
  table += `|------|--------|-------|------------|------------|\n`;
  
  docFiles.forEach(file => {
    const content = readFileSync(file.path, 'utf8');
    const title = extractTitle(content);
    const sizeKB = Math.round(file.size / 1024);
    const modifiedDate = file.modified.toLocaleDateString('it-IT');
    
    table += `| \`${file.name}\` | ${title} | ${file.lines} | ${sizeKB}KB | ${modifiedDate} |\n`;
  });
  
  return table;
}

export function generateDetailedContent(docFiles: DocFile[]): string {
  let content = '';
  
  docFiles.forEach((file, index) => {
    const fileContent = readFileSync(file.path, 'utf8');
    const title = extractTitle(fileContent);
    const sections = extractSections(fileContent);
    
    content += `### ${index + 1}. ${file.name}\n\n`;
    content += `**Titolo**: ${title}\n`;
    content += `**Righe**: ${file.lines}\n`;
    content += `**Dimensione**: ${Math.round(file.size / 1024)}KB\n`;
    content += `**Ultimo aggiornamento**: ${file.modified.toLocaleString('it-IT')}\n\n`;
    
    if (sections.length > 0) {
      content += `**Sezioni**:\n`;
      sections.forEach(section => {
        content += `- ${section}\n`;
      });
    } else {
      content += `**Sezioni**: Nessuna sezione trovata\n`;
    }
    
    content += `\n`;
  });
  
  return content;
}

export function analyzeQuality(docFiles: DocFile[]): string {
  let analysis = '';
  
  // Check for files over 200 lines
  const longFiles = docFiles.filter(f => f.lines > 200);
  if (longFiles.length > 0) {
    analysis += `⚠️ **File che superano 200 righe**:\n`;
    longFiles.forEach(file => {
      analysis += `- \`${file.name}\`: ${file.lines} righe\n`;
    });
    analysis += `\n`;
  } else {
    analysis += `✅ Tutti i file rispettano il limite di 200 righe\n\n`;
  }
  
  // Check for missing essential docs
  const essentialDocs = [
    '01_database_api.md',
    '02_struttura_progetto.md',
    '03_scripts_utilita.md',
    '04_config_sviluppo.md',
    '05_setup_sviluppo.md',
    'ICONS_GUIDE.md',
    'LOGICA_GIORNO_LOGICO.md'
  ];
  
  const missingDocs = essentialDocs.filter(doc => 
    !docFiles.some(file => file.name === doc)
  );
  
  if (missingDocs.length > 0) {
    analysis += `❌ **Documenti mancanti**:\n`;
    missingDocs.forEach(doc => {
      analysis += `- \`${doc}\`\n`;
    });
    analysis += `\n`;
  } else {
    analysis += `✅ Tutti i documenti essenziali sono presenti\n\n`;
  }
  
  // Coverage analysis
  const coverage = Math.round((docFiles.length / essentialDocs.length) * 100);
  analysis += `**Copertura**: ${coverage}% (${docFiles.length}/${essentialDocs.length} documenti essenziali)\n\n`;
  
  if (coverage >= 100) {
    analysis += `🎉 Documentazione completa!\n\n`;
  } else if (coverage >= 80) {
    analysis += `👍 Buona copertura documentazione\n\n`;
  } else {
    analysis += `⚠️ Documentazione incompleta\n\n`;
  }
  
  return analysis;
}

export function getRecentChanges(docFiles: DocFile[]): string {
  const recentFiles = docFiles
    .filter(f => {
      const daysSinceModified = (Date.now() - f.modified.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceModified <= 7;
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());
  
  if (recentFiles.length === 0) {
    return '';
  }
  
  let changes = `## 🆕 MODIFICHE RECENTI (ultimi 7 giorni)\n\n`;
  recentFiles.forEach(file => {
    const daysAgo = Math.floor((Date.now() - file.modified.getTime()) / (1000 * 60 * 60 * 24));
    const timeAgo = daysAgo === 0 ? 'oggi' : `${daysAgo} giorni fa`;
    changes += `- \`${file.name}\`: modificato ${timeAgo}\n`;
  });
  changes += `\n`;
  
  return changes;
}
