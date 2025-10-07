#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const BACKUP_DIR = 'Backup_Automatico';

function showUsage(): void {
  console.log(`
Usage:
  npm run backup:restore -- --preview <backup-file>   # Preview backup contents
  npm run backup:restore -- --confirm <backup-file>   # Restore backup (DESTRUCTIVE)

Examples:
  npm run backup:restore -- --preview backup_20241008_0114.tar.gz
  npm run backup:restore -- --confirm backup_20241008_0114.tar.gz
`);
}

function listAvailableBackups(): void {
  try {
    const files = readdirSync(BACKUP_DIR);
    const backups = files.filter((file) => file.startsWith('backup_') && file.endsWith('.tar.gz'));

    if (backups.length === 0) {
      console.log('📭 No backups found in Backup_Automatico/');
      return;
    }

    console.log('📦 Available backups:');
    backups.forEach((backup, index) => {
      console.log(`   ${index + 1}. ${backup}`);
    });
  } catch (error) {
    console.error('❌ Error listing backups:', error);
  }
}

function previewBackup(backupFile: string): void {
  const backupPath = join(BACKUP_DIR, backupFile);

  if (!existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    console.log('');
    listAvailableBackups();
    process.exit(1);
  }

  console.log(`🔍 Preview contents of: ${backupFile}`);
  console.log('─'.repeat(50));

  try {
    const output = execSync(`tar -tzf ${backupPath}`, { encoding: 'utf8' });
    const files = output.trim().split('\n');

    console.log(`📊 Total files: ${files.length}`);
    console.log('');

    // Show directory structure
    const dirs = new Set<string>();
    files.forEach((file) => {
      const parts = file.split('/');
      if (parts.length > 1) {
        dirs.add(parts[0]);
      }
    });

    console.log('📁 Top-level directories:');
    Array.from(dirs)
      .sort()
      .forEach((dir) => {
        const dirFiles = files.filter((f) => f.startsWith(dir + '/'));
        console.log(`   ${dir}/ (${dirFiles.length} files)`);
      });

    console.log('');
    console.log('📄 Root files:');
    files
      .filter((f) => !f.includes('/'))
      .forEach((file) => {
        console.log(`   ${file}`);
      });
  } catch (error) {
    console.error('❌ Error reading backup:', error);
    process.exit(1);
  }
}

function confirmRestore(backupFile: string): void {
  const backupPath = join(BACKUP_DIR, backupFile);

  if (!existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupFile}`);
    console.log('');
    listAvailableBackups();
    process.exit(1);
  }

  console.log(`⚠️  DESTRUCTIVE OPERATION WARNING`);
  console.log(`   This will restore: ${backupFile}`);
  console.log(`   Current files may be overwritten!`);
  console.log('');

  // Show what will be restored
  previewBackup(backupFile);

  console.log('');
  console.log('🚨 CONFIRM RESTORE');
  console.log('   Type "YES" to proceed with restore:');

  // In a real implementation, you'd use readline for interactive input
  // For now, we'll require explicit confirmation via environment variable
  if (process.env.CONFIRM_RESTORE !== 'YES') {
    console.log('❌ Restore cancelled. Set CONFIRM_RESTORE=YES to proceed.');
    console.log(
      '   Example: CONFIRM_RESTORE=YES npm run backup:restore -- --confirm backup_file.tar.gz'
    );
    process.exit(1);
  }

  console.log('🔄 Starting restore process...');

  try {
    // Extract backup
    execSync(`tar -xzf ${backupPath}`, { stdio: 'inherit' });

    console.log('✅ Restore completed successfully!');
    console.log('⚠️  Please verify your application works correctly');
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  }
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showUsage();
    listAvailableBackups();
    return;
  }

  const command = args[0];
  const backupFile = args[1];

  if (!backupFile) {
    console.error('❌ Please specify a backup file');
    showUsage();
    process.exit(1);
  }

  switch (command) {
    case '--preview':
      previewBackup(backupFile);
      break;

    case '--confirm':
      confirmRestore(backupFile);
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }
}

main();
