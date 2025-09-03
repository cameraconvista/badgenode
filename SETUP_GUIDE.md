
# SETUP_GUIDE.md

## Guida Setup BADGEBOX

### 🚀 Installazione Rapida

#### Requisiti Sistema
- **Node.js**: 18+ (per dev server Vite)
- **Browser moderno**: Chrome/Firefox/Safari con supporto ES6+
- **Account Supabase**: Per database PostgreSQL

#### Setup Locale
```bash
# 1. Clona il progetto
git clone <repository-url>
cd badgebox

# 2. Installa dipendenze
npm install

# 3. Avvia dev server
npm run dev
```

### 🔧 Configurazione Database

#### Supabase Setup
1. Crea nuovo progetto su [supabase.com](https://supabase.com)
2. Esegui script inizializzazione:
```sql
-- Copia contenuto di setup-database.sql
-- ed eseguilo nel SQL Editor di Supabase
```

#### Configurazione Connessione
File da aggiornare con le tue credenziali Supabase:
- `index.html` (script inline)
- `utenti.html` (script inline) 
- `ex-dipendenti.html` (script inline)
- `assets/scripts/supabase-client.js`

Sostituisci:
```javascript
const supabase = createClient(
  "TUA_SUPABASE_URL",
  "TUA_SUPABASE_ANON_KEY"
);
```

### 📋 Comandi Disponibili

#### Development
```bash
npm run dev          # Avvia dev server (porta 5173)
```

#### Deployment
- **Netlify**: Push su repository → deploy automatico
- **Replit**: Usa il pulsante Run → workflow automatico

### 🛠️ Workflow di Sviluppo

#### 1. Modifiche Frontend
```bash
# Modifica file HTML/CSS/JS
# Hot reload automatico su porta 5173
npm run dev
```

#### 2. Testing Locale
- Apri `http://localhost:5173`
- Testa funzionalità su mobile (DevTools responsive)
- Verifica PWA (Application tab DevTools)

#### 3. Modifiche Database
- Usa Supabase Dashboard → SQL Editor
- Backup con `backup-current-system.js`
- Test su staging prima di production

### 🐛 Troubleshooting

#### Problema: Server non raggiungibile
```
Error: Server non raggiungibile
```
**Soluzione**: Verifica configurazione host in `vite.config.js`:
```javascript
server: {
  host: '0.0.0.0',
  allowedHosts: ['.replit.dev']
}
```

#### Problema: WebSocket HTTPS/HTTP
```
Error: An insecure WebSocket connection may not be initiated from a page loaded over HTTPS
```
**Soluzione**: Configurazione HMR sicura:
```javascript
hmr: {
  protocol: 'wss', // Usa WSS per HTTPS
  host: '0.0.0.0'
}
```

#### Problema: Timbrature duplicate
**Sintomo**: Alert "ENTRATA già registrata"
**Causa**: Sistema anti-duplicazione attivo
**Soluzione**: Verifica ultima timbratura in tabella `timbrature`

#### Problema: PIN non trovato
**Sintomo**: "PIN non trovato" durante timbratura
**Verifiche**:
1. PIN esiste in tabella `utenti`
2. PIN è numerico (1-99)
3. Connessione Supabase funzionante

#### Problema: Modali non responsive
**Soluzione**: Verifica media queries in `style.css`:
```css
@media (max-width: 480px) {
  .modal-content { 
    margin: 5px; 
    padding: 10px; 
    max-width: calc(100vw - 10px);
  }
}
```

### 🔄 Maintenance Tasks

#### Backup Periodico
```bash
# Backup configurazioni
node backup-current-system.js

# Backup database (da Supabase Dashboard)
# Settings → Database → Backup
```

#### Log Monitoring
- **Browser Console**: Errori JavaScript
- **Supabase Dashboard**: Query performance, errori DB
- **Replit Console**: Output server sviluppo

#### Performance Monitoring
```javascript
// Verifica caricamento pagine
console.time('pagina-load');
// ...codice caricamento...
console.timeEnd('pagina-load');
```

### 🌐 Deploy in Produzione

#### Netlify
1. Collega repository GitHub
2. Configurazione automatica da `netlify.toml`
3. Deploy su push main branch

#### Replit (Hosting)
1. Usa workflow "Run Dev Server" 
2. Porta 5173 → forwarding automatico
3. URL replit.dev pubblico

### 📱 PWA Setup
L'app è già configurata come PWA:
- **Manifest**: `manifest.json`
- **Service Worker**: Non implementato (future enhancement)
- **Icons**: Ottimizzate per iOS/Android
- **Install prompt**: Automatico sui browser supportati

### 🔐 Sicurezza
- **Supabase RLS**: Row Level Security attiva
- **API Keys**: Solo anon key esposta (sicura per frontend)
- **HTTPS**: Obbligatorio in produzione
- **Pin Admin**: Hardcoded `1909` per accesso admin
