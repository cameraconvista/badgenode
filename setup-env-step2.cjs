#!/usr/bin/env node

/**
 * Setup variabili ambiente per STEP 2
 * Configura SERVICE_ROLE_KEY per endpoint server
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SETUP ENV STEP 2 - Configurazione SERVICE_ROLE_KEY\n');

// Dati forniti dall'utente
const SUPABASE_URL = 'https://tutllgsjrbxkmrwseogz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dGxsZ3NqcmJ4a21yd3Nlb2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIxNTgxNCwiZXhwIjoyMDc1NzkxODE0fQ.uA4YB955SdeNQ8SagprHaciWtFqfithLauVpORGwUvE';

const envPath = path.join(__dirname, '.env.local');

// Leggi .env.local esistente se presente
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ File .env.local esistente trovato');
} else {
  console.log('📝 Creazione nuovo file .env.local');
}

// Aggiorna o aggiungi le variabili necessarie
const updates = {
  'SUPABASE_URL': SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': SERVICE_ROLE_KEY,
  'VITE_SUPABASE_URL': SUPABASE_URL,
};

let updatedContent = envContent;

Object.entries(updates).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(updatedContent)) {
    updatedContent = updatedContent.replace(regex, `${key}=${value}`);
    console.log(`🔄 Aggiornato: ${key}`);
  } else {
    updatedContent += `\n${key}=${value}`;
    console.log(`➕ Aggiunto: ${key}`);
  }
});

// Scrivi il file aggiornato
fs.writeFileSync(envPath, updatedContent.trim() + '\n');

console.log('\n✅ CONFIGURAZIONE COMPLETATA');
console.log('📁 File:', envPath);
console.log('🔑 SERVICE_ROLE_KEY configurato per endpoint server');
console.log('🚀 Server pronto per bypassare RLS');

console.log('\n⚠️  SICUREZZA:');
console.log('- SERVICE_ROLE_KEY ha accesso completo al database');
console.log('- Usato solo lato server, mai esposto al client');
console.log('- .env.local è in .gitignore (non committato)');

console.log('\n🎯 PROSSIMO STEP:');
console.log('1. Riavvia server: npm run dev');
console.log('2. Testa modifica timbratura');
console.log('3. Verifica endpoint /api/timbrature/:id funzionante');
