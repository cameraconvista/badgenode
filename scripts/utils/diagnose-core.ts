#!/usr/bin/env node

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git', 'coverage', 'Backup_Automatico'];

export interface FileInfo {
  path: string;
  lines: number;
  size: number;
}

export interface DiagnosisResult {
  filesOver200: FileInfo[];
  filesOver150: FileInfo[];
  duplicateFiles: Array<{ files: string[]; size: number }>;
  todoFixmeFiles: Array<{ file: string; matches: string[] }>;
  tempFiles: string[];
  configErrors: string[];
  totalFiles: number;
  totalLines: number;
}

export function shouldSkipDirectory(dir: string): boolean {
  return EXCLUDE_DIRS.some(excluded => dir.includes(excluded));
}

export function isCodeFile(filePath: string): boolean {
  return CODE_EXTENSIONS.includes(extname(filePath));
}

export function countLines(filePath: string): number {
  try {
    const content = readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

export function getFileSize(filePath: string): number {
  try {
    return statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

export function findAllFiles(dir: string = '.', files: string[] = []): string[] {
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

export function analyzeFileLengths(files: string[]): { over200: FileInfo[]; over150: FileInfo[]; totalLines: number } {
  const over200: FileInfo[] = [];
  const over150: FileInfo[] = [];
  let totalLines = 0;
  
  files.forEach(file => {
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

export function findDuplicateFiles(files: string[]): Array<{ files: string[]; size: number }> {
  const sizeGroups = new Map<number, string[]>();
  
  files.forEach(file => {
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

export function findTodoFixme(files: string[]): Array<{ file: string; matches: string[] }> {
  const results: Array<{ file: string; matches: string[] }> = [];
  const patterns = /TODO|FIXME|BUG|HACK/gi;
  
  files.forEach(file => {
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

export function findTempFiles(): string[] {
  const tempPatterns = [
    '**/*.tmp',
    '**/*.temp',
    '**/*~',
    '**/.DS_Store',
    '**/Thumbs.db'
  ];
  
  const tempFiles: string[] = [];
  
  try {
    tempPatterns.forEach(pattern => {
      try {
        const output = execSync(`find . -name "${pattern.replace('**/', '')}" 2>/dev/null || true`, { encoding: 'utf8' });
        const files = output.trim().split('\n').filter(f => f.length > 0);
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

export function checkConfigErrors(): string[] {
  const errors: string[] = [];
  
  // Check if essential files exist
  const essentialFiles = [
    'package.json',
    'tsconfig.json',
    '.gitignore'
  ];
  
  essentialFiles.forEach(file => {
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
