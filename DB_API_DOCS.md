
# DB_API_DOCS.md

## Database Schema & API Documentation

### 📊 Schema Database (Supabase PostgreSQL)

#### Tabella `utenti` - Dipendenti Attivi
```sql
CREATE TABLE utenti (
  id SERIAL PRIMARY KEY,
  pin INTEGER UNIQUE NOT NULL CHECK (pin >= 1 AND pin <= 99),
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  telefono VARCHAR(20),
  ore_contrattuali DECIMAL(4,2) DEFAULT 8.00,
  descrizione_contratto TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici
CREATE UNIQUE INDEX idx_utenti_pin ON utenti(pin);
CREATE INDEX idx_utenti_nome_cognome ON utenti(nome, cognome);
```

**Vincoli & Validazioni**:
- `pin`: Univoco, range 1-99, liberato quando dipendente archiviato
- `ore_contrattuali`: Max ore giornaliere, default 8.00
- `email`: Opzionale, format validation frontend
- `nome`, `cognome`: Obbligatori, max 50 caratteri

#### Tabella `timbrature` - Registro Presenze
```sql
CREATE TABLE timbrature (
  id SERIAL PRIMARY KEY,
  pin INTEGER NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL, 
  data DATE NOT NULL,
  ore TIME NOT NULL,
  giornologico DATE NOT NULL, -- Giorno lavorativo (shift notturni)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_timbrature_pin ON timbrature(pin);
CREATE INDEX idx_timbrature_data ON timbrature(data);
CREATE INDEX idx_timbrature_pin_giornologico ON timbrature(pin, giornologico);
CREATE INDEX idx_timbrature_created_at ON timbrature(created_at);
```

**Business Logic**:
- `giornologico`: Gestisce turni notturni (00:00-04:59 = giorno precedente)
- `tipo`: Solo 'entrata' o 'uscita'
- **Anti-duplicazione**: Blocca timbrature consecutive stesso tipo

#### Tabella `dipendenti_archiviati` - Archivio Storico
```sql
CREATE TABLE dipendenti_archiviati (
  id SERIAL PRIMARY KEY,
  pin INTEGER NOT NULL, -- PIN originale (non più univoco qui)
  nome VARCHAR(50) NOT NULL,
  cognome VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  telefono VARCHAR(20),
  ore_contrattuali DECIMAL(4,2),
  descrizione_contratto TEXT,
  data_archiviazione TIMESTAMP DEFAULT NOW(),
  file_excel_path TEXT, -- JSON serializzato con dati completi
  file_excel_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_dipendenti_archiviati_data ON dipendenti_archiviati(data_archiviazione);
CREATE INDEX idx_dipendenti_archiviati_pin ON dipendenti_archiviati(pin);
```

**Struttura `file_excel_path` (JSON)**:
```json
{
  "dipendente": {
    "pin": 10,
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario@example.com",
    "telefono": "+39123456789",
    "ore_contrattuali": 8.00,
    "descrizione_contratto": "Contratto part-time"
  },
  "timbrature": [
    {
      "data": "2024-01-15",
      "ore": "08:30:00",
      "tipo": "entrata",
      "pin": 10,
      "nome": "Mario",
      "cognome": "Rossi"
    }
  ],
  "totaleTimbrature": 245,
  "dataGenerazione": "2024-09-03T10:30:00Z",
  "pinLiberato": 10
}
```

### 🔗 Relazioni tra Tabelle

#### Flusso Dati Principale
```
utenti (PIN attivo)
   ↓ timbratura
timbrature (storico presenze)
   ↓ archiviazione  
dipendenti_archiviati (PIN liberato) + JSON backup completo
```

#### Referential Integrity
- **`timbrature.pin`** → deve esistere in `utenti.pin` (solo per utenti attivi)
- **`dipendenti_archiviati.pin`** → PIN storico, non più vincolato
- **Cascade**: Archiviazione manuale (mantiene storico)

### 🎯 API Endpoints (Supabase REST)

#### Autenticazione
```javascript
// Headers standard per tutte le chiamate
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

#### Gestione Utenti

**Recupera tutti utenti attivi**
```javascript
const { data, error } = await supabase
  .from("utenti")
  .select("*")
  .order("pin", { ascending: true });
```

**Verifica utente per timbratura**
```javascript
const { data, error } = await supabase
  .from("utenti")
  .select("nome, cognome, email, ore_contrattuali")
  .eq("pin", parseInt(pin))
  .single();
```

**Inserisci nuovo dipendente**
```javascript
const { error } = await supabase
  .from("utenti")
  .insert([{
    pin: uniquePin,
    nome: nome.trim(),
    cognome: cognome.trim(),
    email: email || null,
    ore_contrattuali: 8.00
  }]);
```

#### Gestione Timbrature

**Inserisci timbratura**
```javascript
const { error } = await supabase
  .from("timbrature")
  .insert([{
    tipo: 'entrata', // o 'uscita'
    pin: parseInt(pin),
    nome: utente.nome,
    cognome: utente.cognome,
    data: DateTime.now().toISODate(), 
    ore: DateTime.now().toFormat("HH:mm:ss"),
    giornologico: calcolaGiornoLogico(DateTime.now())
  }]);
```

**Recupera storico timbrature**
```javascript
const { data, error } = await supabase
  .from("timbrature")
  .select("*")
  .eq("pin", parseInt(pin))
  .gte("data", dataInizio)
  .lte("data", dataFine)
  .order("data", { ascending: true })
  .order("ore", { ascending: true });
```

**Verifica ultima timbratura (anti-duplicazione)**
```javascript
const { data, error } = await supabase
  .from("timbrature")
  .select("tipo, created_at, data, ore")
  .eq("pin", parseInt(pin))
  .order("created_at", { ascending: false })
  .limit(1);
```

#### Gestione Archivio

**Archivia dipendente completo**
```javascript
// 1. Backup dati completi
const excelData = {
  dipendente: dipendenteData,
  timbrature: timbratureStoriche,
  totaleTimbrature: count,
  dataGenerazione: new Date().toISOString(),
  pinLiberato: pin
};

// 2. Inserisci in archivio
const { error } = await supabase
  .from("dipendenti_archiviati")
  .insert([{
    ...dipendenteData,
    data_archiviazione: new Date().toISOString(),
    file_excel_path: JSON.stringify(excelData),
    file_excel_name: generateFileName()
  }]);

// 3. Rimuovi da utenti attivi (libera PIN)
const { error: deleteError } = await supabase
  .from("utenti")
  .delete()
  .eq("pin", parseInt(pin));
```

### ⚡ Performance Optimization

#### Query Patterns
```javascript
// ✅ Select specifici (non SELECT *)
.select("nome, cognome, email, ore_contrattuali")

// ✅ Filtri efficienti
.eq("pin", parseInt(pin))        // Usa indice
.gte("data", dataInizio)         // Range queries ottimizzate
.order("created_at", { ascending: false })

// ✅ Limit per pagination
.limit(50)
```

#### Caching Strategy
```javascript
// ✅ Cache per librerie pesanti
let XLSXLib = null;
if (!XLSXLib) {
  XLSXLib = await import("https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs");
}

// ✅ Cache DOM elements
const tbody = document.getElementById("lista-dipendenti");
const pinInput = document.getElementById("pinInput");
```

### 🔐 Security & Validation

#### Input Validation
```javascript
// ✅ Client-side validation
function validatePIN(pin) {
  const num = parseInt(pin);
  return num >= 1 && num <= 99 && !isNaN(num);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ File upload validation
function validateFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'application/msword'];
  return file.size <= maxSize && allowedTypes.includes(file.type);
}
```

#### Error Messages (User-Friendly)
```javascript
// ✅ Messaggi chiari per utenti
const errorMap = {
  'PIN_NOT_FOUND': 'PIN non trovato. Verifica di aver inserito il PIN corretto.',
  'DUPLICATE_ENTRY': 'Hai già registrato questa timbratura. Verifica l\'ultima operazione.',
  'NETWORK_ERROR': 'Problema di connessione. Riprova tra qualche secondo.',
  'VALIDATION_ERROR': 'Dati non validi. Controlla i campi evidenziati.'
};
```

### 📈 Monitoring & Analytics

#### Key Metrics da Monitorare
- **Timbrature giornaliere**: Picchi e anomalie
- **Errori frequenti**: Pattern di errori utente
- **Performance query**: Tempo risposta database
- **Usage patterns**: Pagine più utilizzate

#### Logging Standards
```javascript
// ✅ Log strutturati
console.log('✅ Operazione completata:', {
  operazione: 'archiviazione_dipendente',
  pin: pin,
  timestamp: new Date().toISOString(),
  dettagli: { nome, cognome, timbratureCount }
});

// ✅ Error logging
console.error('❌ Errore:', {
  operazione: 'inserimento_timbratura',
  errore: error.message,
  pin: pin,
  timestamp: new Date().toISOString()
});
```
