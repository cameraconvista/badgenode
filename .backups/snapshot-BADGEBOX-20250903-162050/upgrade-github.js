
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BADGEBOX - Upgrade GitHub Automatico');
console.log('=====================================');

// Verifica se ci sono modifiche da committare
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  
  if (!status.trim()) {
    console.log('✅ Nessuna modifica da committare');
    process.exit(0);
  }
  
  console.log('📝 Modifiche rilevate:');
  console.log(status);
  
  // Aggiungi tutti i file
  console.log('📦 Aggiunta file...');
  execSync('git add .', { stdio: 'inherit' });
  
  // Crea commit con timestamp
  const timestamp = new Date().toLocaleString('it-IT');
  const commitMessage = `🔄 Aggiornamento automatico BADGEBOX - ${timestamp}`;
  
  console.log('💾 Creazione commit...');
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  // Push al repository
  console.log('🌐 Push a GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ Upgrade completato con successo!');
  console.log(`📨 Commit: ${commitMessage}`);
  
} catch (error) {
  console.error('❌ Errore durante l\'upgrade:', error.message);
  process.exit(1);
}
