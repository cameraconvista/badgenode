#!/usr/bin/env node

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const REPORT_FILE = 'REPORT_DIAGNOSI_INIZIALE.txt';
const SENTINEL_FILE = '.diagnose_done';
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', 'Backup_Automatico'];

interface FileInfo {
  path: string;
  lines: number;
  size: number;
}

interface DiagnosisResult {
  filesOver200: FileInfo[];
  filesOver150: FileInfo[];
  duplicateFiles: Array<{ files: string[]; size: number }>;
  todoFixmeFiles: Array<{ file: string; matches: string[] }>;
  tempFiles: string[];
  configErrors: string[];
  totalFiles: number;
  totalLines: number;
}

function shouldSkipDirectory(dir: string): boolean {
  return EXCLUDE_DIRS.some((excluded) => dir.includes(excluded));
}

function isCodeFile(filePath: string): boolean {
  return CODE_EXTENSIONS.includes(extname(filePath));
}

function countLines(filePath: string): number {
  try {
    const content = readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function getFileSize(filePath: string): number {
  try {
    return statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

function findAllFiles(dir: string = '.', files: string[] = []): string[] {
  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);

      if (shouldSkipDirectory(fullPath)) {
        continue;
      }

      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        findAllFiles(fullPath, files);
      } else if (isCodeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files;
}

function analyzeFileLengths(files: string[]): {
  over200: FileInfo[];
  over150: FileInfo[];
  totalLines: number;
} {
  const over200: FileInfo[] = [];
  const over150: FileInfo[] = [];
  let totalLines = 0;

  files.forEach((file) => {
    const lines = countLines(file);
    const size = getFileSize(file);
    totalLines += lines;

    const fileInfo: FileInfo = { path: file, lines, size };

    if (lines > 200) {
      over200.push(fileInfo);
    } else if (lines >= 150) {
      over150.push(fileInfo);
    }
  });

  return { over200, over150, totalLines };
}

function findDuplicateFiles(files: string[]): Array<{ files: string[]; size: number }> {
  const sizeGroups = new Map<number, string[]>();

  files.forEach((file) => {
    const size = getFileSize(file);
    if (!sizeGroups.has(size)) {
      sizeGroups.set(size, []);
    }
    sizeGroups.get(size)!.push(file);
  });

  return Array.from(sizeGroups.entries())
    .filter(([_, files]) => files.length > 1)
    .map(([size, files]) => ({ files, size }));
}

function findTodoFixme(files: string[]): Array<{ file: string; matches: string[] }> {
  const results: Array<{ file: string; matches: string[] }> = [];
  const patterns = /TODO|FIXME|BUG|HACK/gi;

  files.forEach((file) => {
    try {
      const content = readFileSync(file, 'utf8');
      const matches = content.match(patterns);

      if (matches && matches.length > 0) {
        results.push({ file, matches: [...new Set(matches)] });
      }
    } catch (error) {
      // Skip files we can't read
    }
  });

  return results;
}

function findTempFiles(): string[] {
  const tempPatterns = ['**/*.tmp', '**/*.temp', '**/*~', '**/.DS_Store', '**/Thumbs.db'];

  const tempFiles: string[] = [];

  try {
    tempPatterns.forEach((pattern) => {
      try {
        const output = execSync(
          `find . -name "${pattern.replace('**/', '')}" 2>/dev/null || true`,
          { encoding: 'utf8' }
        );
        const files = output
          .trim()
          .split('\n')
          .filter((f) => f.length > 0);
        tempFiles.push(...files);
      } catch (error) {
        // Skip if find command fails
      }
    });
  } catch (error) {
    // Skip if find is not available
  }

  return [...new Set(tempFiles)];
}

function checkConfigErrors(): string[] {
  const errors: string[] = [];

  // Check if essential files exist
  const essentialFiles = ['package.json', 'tsconfig.json', '.gitignore'];

  essentialFiles.forEach((file) => {
    if (!existsSync(file)) {
      errors.push(`Missing essential file: ${file}`);
    }
  });

  // Check package.json structure
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

    if (!pkg.scripts) {
      errors.push('package.json missing scripts section');
    }

    if (!pkg.dependencies && !pkg.devDependencies) {
      errors.push('package.json missing dependencies');
    }
  } catch (error) {
    errors.push('package.json is invalid JSON');
  }

  // Check TypeScript config
  try {
    JSON.parse(readFileSync('tsconfig.json', 'utf8'));
  } catch (error) {
    errors.push('tsconfig.json is invalid JSON');
  }

  return errors;
}

function generateReport(result: DiagnosisResult): string {
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
      .forEach((file) => {
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
      .forEach((file) => {
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
      group.files.forEach((file) => {
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
    result.todoFixmeFiles.forEach((item) => {
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
    result.tempFiles.forEach((file) => {
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
    result.configErrors.forEach((error) => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }

  report += `---\n\n`;
  report += `**Diagnosi completata**: ${timestamp}\n`;
  report += `**Prossimo step**: Risolvere violazioni limite 200 righe\n`;

  return report;
}

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
