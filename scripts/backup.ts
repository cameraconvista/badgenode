#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = 'Backup_Automatico';
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  '.cache',
  'coverage',
  'temp',
  'tmp',
  '.DS_Store',
  'Backup_Automatico',
];

const MONTH_NAMES = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

function getCurrentTimestamp(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[now.getMonth()];
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  return `${day} ${month}_${hour}.${minute}`;
}

function createExcludeArgs(): string {
  return EXCLUDE_PATTERNS.map((pattern) => `--exclude='${pattern}'`).join(' ');
}

function getExistingBackups(): Array<{ name: string; path: string; mtime: Date }> {
  try {
    const files = readdirSync(BACKUP_DIR);
    return files
      .filter(
        (file) =>
          (file.startsWith('backup_') || file.startsWith('Backup_')) &&
          (file.endsWith('.tar.gz') || file.endsWith('.tar'))
      )
      .map((file) => {
        const path = join(BACKUP_DIR, file);
        const stats = statSync(path);
        return { name: file, path, mtime: stats.mtime };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch (error) {
    return [];
  }
}

function buildUniqueBackupName(): string {
  const baseName = `Backup_${getCurrentTimestamp()}`;
  const extension = '.tar.gz';
  let candidate = `${baseName}${extension}`;
  let counter = 2;

  while (existsSync(join(BACKUP_DIR, candidate))) {
    candidate = `${baseName}_${String(counter).padStart(2, '0')}${extension}`;
    counter += 1;
  }

  return candidate;
}

function createBackup(): void {
  const backupName = buildUniqueBackupName();
  const backupPath = join(BACKUP_DIR, backupName);
  const excludeArgs = createExcludeArgs();

  console.log(`📦 Creating backup: ${backupName}`);

  try {
    // Create backup directory if it doesn't exist
    execSync(`mkdir -p ${BACKUP_DIR}`, { stdio: 'pipe' });

    // Create tar archive
    const command = `tar -czf "${backupPath}" ${excludeArgs} --exclude='${BACKUP_DIR}' .`;
    execSync(command, { stdio: 'pipe' });

    // Get file size
    const stats = statSync(backupPath);
    const sizeKB = Math.round(stats.size / 1024);

    console.log(`✅ Backup created successfully: ${sizeKB}KB`);

  } catch (error) {
    console.error('❌ Backup failed:', error);

    process.exit(1);
  }
}

function main(): void {
  console.log('🚀 Starting backup process...');

  // Create new backup
  createBackup();

  // Show current backups
  const backups = getExistingBackups();
  console.log(`📊 Total backups: ${backups.length}`);

  backups.forEach((backup, index) => {
    const stats = statSync(backup.path);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ${index + 1}. ${backup.name} (${sizeKB}KB)`);
  });

  console.log('✨ Backup process completed!');
}

main();
