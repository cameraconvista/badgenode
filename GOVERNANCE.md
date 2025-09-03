
# GOVERNANCE.md

## Governance e Qualità del Codice - BADGEBOX

### 📋 Standards di Qualità

#### Naming Conventions
```javascript
// ✅ Funzioni: camelCase descrittivo
async function caricaUtentiAttivi() {}
window.archiviaUtente = (pin) => {}

// ✅ Variabili: camelCase significativo  
const nomeCompleto = `${dipendente.nome} ${dipendente.cognome}`;
const dataFormattata = new Date().toLocaleDateString('it-IT');

// ✅ Costanti: UPPERCASE_SNAKE_CASE
const PIN_ADMIN = "1909";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ✅ ID HTML: kebab-case
<div id="lista-dipendenti"></div>
<button id="btn-esporta"></button>
```

#### Database Schema Standards
```sql
-- ✅ Tabelle: snake_case plurale
CREATE TABLE dipendenti_archiviati;
CREATE TABLE timbrature;

-- ✅ Campi: snake_case descrittivo
ore_contrattuali DECIMAL(4,2)
data_archiviazione TIMESTAMP
file_excel_path TEXT

-- ✅ Relazioni: PIN come chiave naturale
pin INTEGER REFERENCES utenti(pin)
```

### 🔍 Code Quality Rules

#### JavaScript Best Practices
```javascript
// ✅ Async/Await invece di Promises
async function salvaModifiche() {
  try {
    const { data, error } = await supabase.from('utenti').insert(userData);
    if (error) throw error;
  } catch (error) {
    console.error('Errore:', error);
    alert('Errore durante il salvataggio: ' + error.message);
  }
}

// ✅ Destructuring per parametri Supabase
const { data: utenti, error: errorUtenti } = await supabase
  .from("utenti")
  .select("*");

// ✅ Validazioni input esplicite
if (!nome || !cognome || !oreContrattuali) {
  alert("Compila tutti i campi obbligatori");
  return;
}

// ✅ Error handling specifico
switch (error?.code) {
  case 'PGRST116': return 'Nessun dato trovato';
  case '23505': return 'PIN già esistente';
  default: return error?.message || 'Errore sconosciuto';
}
```

#### HTML Structure Standards
```html
<!-- ✅ Semantic HTML -->
<main class="container">
  <header>
    <h1>Titolo Pagina</h1>
  </header>
  
  <section class="data-section">
    <table>
      <!-- Contenuto tabulare -->
    </table>
  </section>
</main>

<!-- ✅ Accessibilità -->
<button 
  title="Descrizione azione"
  aria-label="Archivia dipendente"
  onclick="archiviaUtente('${pin}')"
>
  📦
</button>

<!-- ✅ Form validation -->
<input 
  type="number" 
  required
  min="1" 
  max="99"
  aria-describedby="pin-help"
>
```

### 📐 Architecture Guidelines

#### Separation of Concerns
```
Frontend (HTML)     →  Presentation Layer
Scripts (JS)        →  Business Logic Layer  
Supabase           →  Data Persistence Layer
```

#### Module Organization
```javascript
// ✅ Un file = Una responsabilità
calendar-utils.js    // Solo utilità calendario
timbrature-data.js   // Solo operazioni CRUD timbrature
timbrature-render.js // Solo rendering HTML timbrature

// ✅ Import/Export pattern
export { aggiungiOpzionePersonalizzato, aggiornaRange };
import { caricaDati } from './timbrature-data.js';
```

### 🔄 File Management Rules

#### Rotazione e Backup
- **Backup automatico**: Prima di modifiche strutturali
- **Versioning**: Commit frequenti con messaggi descrittivi
- **Rollback**: Mantieni sempre versione stabile funzionante

```bash
# Pre-modifica backup
node backup-current-system.js
git add . && git commit -m "backup pre-modifica: [descrizione]"

# Post-modifica
git add . && git commit -m "feat: [nuova funzionalità implementata]"
```

#### File Size Limits
- **HTML/CSS/JS**: Max 500KB per file
- **Images**: Ottimizzate WebP/PNG, max 200KB
- **Upload utente**: Max 5MB (configurabile)

### 🧪 Testing Standards

#### Manual Testing Checklist
```
□ Timbratura entrata/uscita funzionante
□ Validazione anti-duplicazione attiva
□ Responsive design su mobile/tablet
□ PWA installabile
□ Export Excel/PDF funzionanti
□ Archiviazione dipendente completa
□ Navigazione tra pagine fluida
```

#### Error Handling Pattern
```javascript
// ✅ Pattern standard per gestione errori
async function operazioneDatabase() {
  try {
    // Operazione
    const { data, error } = await supabase.from('tabella').select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Errore operazione:', error);
    throw new Error(`Descrizione user-friendly: ${error.message}`);
  }
}
```

### 📊 Performance Guidelines

#### Frontend Optimization
```javascript
// ✅ Lazy loading per librerie pesanti
let XLSXLib = null;
if (!XLSXLib) {
  XLSXLib = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
}

// ✅ Cache DOM queries
const tbody = document.getElementById("lista-dipendenti");

// ✅ Debouncing per input frequenti
const debouncedSearch = debounce(searchFunction, 300);
```

#### Database Optimization
```sql
-- ✅ Indici per query frequenti
CREATE INDEX idx_timbrature_pin_data ON timbrature(pin, data);
CREATE INDEX idx_utenti_pin ON utenti(pin);

-- ✅ Query ottimizzate
SELECT * FROM timbrature 
WHERE pin = $1 AND data BETWEEN $2 AND $3
ORDER BY data, ore;
```

### 🛡️ Security Standards

#### Frontend Security
- **Sanitization**: Escape HTML user input
- **Validation**: Client + server-side validation
- **PIN Protection**: Admin PIN separato da utenti

```javascript
// ✅ Input sanitization
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}

// ✅ PIN validation
function validatePIN(pin) {
  const numPin = parseInt(pin);
  return numPin >= 1 && numPin <= 99;
}
```

#### Database Security
- **RLS**: Row Level Security attiva
- **Permissions**: Solo operazioni necessarie
- **API Keys**: Anon key per frontend, service key solo backend

### 📝 Documentation Standards

#### Code Comments
```javascript
// ✅ Commenti funzionali
// CALCOLO GIORNO LOGICO ESTESO (8:00-5:00)
// Se è tra 00:00 e 04:59, appartiene al giorno lavorativo precedente

// ✅ Documenta decisioni complesse
// Blocca timbrature consecutive dello stesso tipo
if (ultimoTipo === tipo) {
  // Logic...
}
```

#### Git Commit Messages
```
feat: aggiunta archiviazione dipendenti
fix: correzione calcolo ore giornaliere  
style: miglioramento responsive mobile
docs: aggiornamento documentazione API
refactor: riorganizzazione utilities calendario
```

### 🔄 Maintenance Schedule

#### Settimanale
- Backup database Supabase
- Verifica log errori
- Test funzionalità critiche

#### Mensile
- Pulizia file temporanei
- Aggiornamento dipendenze
- Review performance queries

#### Trimestrale
- Audit sicurezza
- Ottimizzazione immagini
- Review architettura codice
