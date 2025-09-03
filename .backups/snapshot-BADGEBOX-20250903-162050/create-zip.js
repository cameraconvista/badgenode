
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// File e cartelle da includere nel ZIP
const filesToInclude = [
  'index.html',
  'utenti.html', 
  'storico.html',
  'manifest.json',
  'style.css',
  'script.js',
  'package.json',
  'vite.config.js',
  'README.md',
  '.htaccess',
  '_redirects',
  'netlify.toml',
  'assets/',
  '.replit'
];

console.log('Creazione ZIP per GitHub...');

// Rimuovi ZIP precedente se esiste
if (fs.existsSync('BADGEBOX-github.zip')) {
  fs.unlinkSync('BADGEBOX-github.zip');
}

// Crea il comando zip
const fileList = filesToInclude.join(' ');
const command = `zip -r BADGEBOX-github.zip ${fileList}`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log('✅ ZIP creato: BADGEBOX-github.zip');
  console.log('Ora puoi scaricare questo file e caricarlo su GitHub');
} catch (error) {
  console.error('❌ Errore nella creazione del ZIP:', error.message);
}
