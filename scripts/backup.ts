#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, statSync, writeFileSync, appendFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = 'Backup_Automatico';
const MAX_BACKUPS = 3;
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

function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day}_${hour}.${minute}`;
}

function createExcludeArgs(): string {
  return EXCLUDE_PATTERNS.map((pattern) => `--exclude='${pattern}'`).join(' ');
}

function getExistingBackups(): Array<{ name: string; path: string; mtime: Date }> {
  try {
    const files = readdirSync(BACKUP_DIR);
    return files
      .filter(
        (file) => file.startsWith('backup_') && (file.endsWith('.tar.gz') || file.endsWith('.tar'))
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

function cleanupOldBackups(): void {
  const backups = getExistingBackups();

  if (backups.length >= MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS - 1);
    toDelete.forEach((backup) => {
      try {
        unlinkSync(backup.path);
        console.log(`🗑️  Removed old backup: ${backup.name}`);
      } catch (error) {
        console.error(`❌ Failed to remove ${backup.name}:`, error);
      }
    });
  }
}

function createBackup(): void {
  const timestamp = getCurrentTimestamp();
  const backupName = `backup_${timestamp}.tar`;
  const backupPath = join(BACKUP_DIR, backupName);
  const excludeArgs = createExcludeArgs();

  console.log(`📦 Creating backup: ${backupName}`);

  try {
    // Create backup directory if it doesn't exist
    execSync(`mkdir -p ${BACKUP_DIR}`, { stdio: 'pipe' });

    // Create tar archive
    const command = `tar -czf ${backupPath} ${excludeArgs} --exclude='${BACKUP_DIR}' .`;
    execSync(command, { stdio: 'pipe' });

    // Get file size
    const stats = statSync(backupPath);
    const sizeKB = Math.round(stats.size / 1024);

    console.log(`✅ Backup created successfully: ${sizeKB}KB`);

    // Log to report file
    const logEntry = `${new Date().toISOString()} - ${backupName} - ${sizeKB}KB - SUCCESS\n`;
    appendFileSync(join(BACKUP_DIR, 'REPORT_BACKUP.txt'), logEntry);
  } catch (error) {
    console.error('❌ Backup failed:', error);

    // Log error to report file
    const logEntry = `${new Date().toISOString()} - ${backupName} - ERROR: ${error}\n`;
    appendFileSync(join(BACKUP_DIR, 'REPORT_BACKUP.txt'), logEntry);

    process.exit(1);
  }
}

function main(): void {
  console.log('🚀 Starting backup process...');

  // Cleanup old backups first
  cleanupOldBackups();

  // Create new backup
  createBackup();

  // Show current backups
  const backups = getExistingBackups();
  console.log(`📊 Total backups: ${backups.length}/${MAX_BACKUPS}`);

  backups.forEach((backup, index) => {
    const stats = statSync(backup.path);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   ${index + 1}. ${backup.name} (${sizeKB}KB)`);
  });

  console.log('✨ Backup process completed!');
}

main();
