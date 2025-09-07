
#!/usr/bin/env node

// BACKUP COMPLETO SISTEMA BADGEBOX - Punto di ripristino
// Eseguire: node backup-current-system.js

const fs = require('fs');
const path = require('path');

console.log('🔄 BADGEBOX - Creazione Backup Completo');
console.log('=====================================');

// File critici da backuppare
const fileCritici = [
  'assets/scripts/timbrature-data.js',
  'assets/scripts/timbrature-render.js', 
  'assets/scripts/storico-logic.js',
  'assets/scripts/calendar-utils.js',
  'assets/scripts/supabase-client.js',
  'script.js',
  'style.css',
  'index.html',
  'storico.html',
  'utenti.html',
  'package.json',
  'vite.config.js'
];

// Crea cartella backup con timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = `backup-${timestamp}`;

try {
  // Crea directory backup
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Crea struttura sottocartelle
  fs.mkdirSync(path.join(backupDir, 'assets', 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(backupDir, 'assets', 'styles'), { recursive: true });

  // Copia tutti i file critici
  fileCritici.forEach(file => {
    if (fs.existsSync(file)) {
      const destPath = path.join(backupDir, file);
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(file, destPath);
      console.log(`✅ Copiato: ${file}`);
    } else {
      console.log(`⚠️  File non trovato: ${file}`);
    }
  });

  // Crea script di ripristino
  const scriptRipristino = `#!/usr/bin/env node

// SCRIPT DI RIPRISTINO AUTOMATICO
// Eseguire: node ripristina-backup.js

const fs = require('fs');
const path = require('path');

console.log('🔄 RIPRISTINO BACKUP IN CORSO...');

const files = ${JSON.stringify(fileCritici, null, 2)};

files.forEach(file => {
  const backupPath = path.join(__dirname, file);
  if (fs.existsSync(backupPath)) {
    const destDir = path.dirname(file);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(backupPath, file);
    console.log('✅ Ripristinato:', file);
  }
});

console.log('🎉 RIPRISTINO COMPLETATO!');
console.log('Riavvia il server con: npm run dev');
`;

  fs.writeFileSync(path.join(backupDir, 'ripristina-backup.js'), scriptRipristino);

  // Crea file di informazioni
  const infoBackup = `BACKUP BADGEBOX - ${new Date().toLocaleString('it-IT')}
=============================================

STATO SISTEMA AL MOMENTO DEL BACKUP:
- ✅ App funzionante
- ✅ Timbrature visualizzate correttamente  
- ✅ Calendario operativo
- ✅ Calcolo ore funzionante
- ✅ Export PDF/Excel operativo

PROBLEMA IDENTIFICATO:
- Lentezza nel caricamento pagine
- Query database non ottimizzate
- Filtri applicati lato client

COME RIPRISTINARE:
1. cd ${backupDir}
2. node ripristina-backup.js
3. npm run dev

FILES BACKUPPATI:
${fileCritici.map(f => `- ${f}`).join('\n')}
`;

  fs.writeFileSync(path.join(backupDir, 'INFO-BACKUP.txt'), infoBackup);

  console.log(`\n🎉 BACKUP COMPLETATO!`);
  console.log(`📁 Cartella: ${backupDir}`);
  console.log(`📋 File backuppati: ${fileCritici.length}`);
  console.log(`\n🔄 PER RIPRISTINARE:`);
  console.log(`cd ${backupDir} && node ripristina-backup.js`);

} catch (error) {
  console.error('❌ Errore durante il backup:', error.message);
  process.exit(1);
}
