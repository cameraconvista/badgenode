
# SUPABASE_SETUP.md

## Setup e Configurazione Supabase per BADGEBOX

### 🚀 Creazione Progetto Supabase

#### 1. Account e Progetto
1. Vai su [supabase.com](https://supabase.com) e crea account
2. Clicca **"New Project"**
3. Scegli organizzazione e inserisci:
   - **Project Name**: `BADGEBOX-Production`
   - **Database Password**: Genera password sicura (salvala!)
   - **Region**: Europe (West) per performance EU
4. Attendi creazione progetto (~2 minuti)

#### 2. Configurazione Database
```sql
-- Vai su SQL Editor in Supabase Dashboard
-- Copia e incolla tutto il contenuto di setup-database.sql
-- Clicca "Run" per eseguire lo schema completo
```

### 🔑 Gestione Credenziali e Variabili

#### Recupero API Keys
Nel tuo progetto Supabase:
1. **Settings** → **API**
2. Copia questi valori:
   ```
   Project URL: https://[ID_PROGETTO].supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SOLO per admin)
   ```

#### Configurazione in Replit
Aggiorna queste credenziali nei file:

**File da modificare**:
- `assets/scripts/supabase-client.js`
- `index.html` (script inline)
- `utenti.html` (script inline)
- `ex-dipendenti.html` (script inline)

**Template sostituzione**:
```javascript
const supabase = createClient(
  "https://[TUO_PROJECT_ID].supabase.co",  // Project URL
  "[TUA_ANON_KEY]"                        // anon public key
);
```

### 🔄 Sincronizzazione Schema Database

#### Esecuzione Migrazioni
```sql
-- 1. Backup schema esistente
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Applica nuovo schema
-- Esegui setup-database.sql completo nel SQL Editor

-- 3. Verifica tabelle create
\dt public.*
```

#### Comandi Utili Supabase

**Reset completo database**:
```sql
-- ⚠️ ATTENZIONE: Cancella tutti i dati!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Poi riesegui setup-database.sql
```

**Seed dati di test**:
```sql
-- Inserisci utenti demo (già nel setup-database.sql)
INSERT INTO public.utenti (pin, nome, cognome, email, ore_contrattuali) 
VALUES (99, 'Test', 'User', 'test@example.com', 8.00)
ON CONFLICT (pin) DO NOTHING;
```

**Controllo integrità**:
```sql
-- Verifica constraint e indici
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### 📊 Monitoraggio e Performance

#### Dashboard Controlli
1. **Database** → **Tables**: Verifica struttura tabelle
2. **Authentication** → **Policies**: Controlla RLS policies
3. **Database** → **Backups**: Programma backup automatici
4. **Settings** → **Database**: Monitora storage usage

#### Ottimizzazioni Performance
```sql
-- Analizza query lente
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

-- Ricostruisci statistiche
ANALYZE;

-- Verifica indici utilizzati
EXPLAIN ANALYZE SELECT * FROM timbrature WHERE pin = 1;
```

### 🔧 Linee Guida Mantenimento

#### Allineamento Codice-Database
1. **Modifiche Schema**: Sempre via SQL Editor Supabase
2. **Test Locale**: Usa sempre dati di test con PIN > 90
3. **Backup**: Scarica backup settimanale da Dashboard
4. **Versioning**: Documenta modifiche schema in `DB_API_DOCS.md`

#### Workflow Aggiornamenti
```bash
# 1. Modifica locale in Replit
# 2. Test con utenti di prova
# 3. Backup Supabase manuale
# 4. Applica modifiche schema su Supabase
# 5. Verifica integrità dati
# 6. Aggiorna documentazione
```

#### Sicurezza Best Practices
- **Mai esporre service_role key** nel frontend
- **Usa solo anon key** per operazioni pubbliche
- **RLS attivo** su tutte le tabelle
- **Backup automatici** configurati
- **Monitoring attivo** su query anomale

### 🆘 Troubleshooting Comune

#### Errore Connessione
```javascript
// Verifica configurazione
console.log('Supabase URL:', supabase.supabaseUrl);
console.log('Supabase Key:', supabase.supabaseKey.substring(0, 20) + '...');
```

#### Errore RLS (Row Level Security)
```sql
-- Disabilita temporaneamente per debug
ALTER TABLE public.utenti DISABLE ROW LEVEL SECURITY;
-- Ricorda di riabilitare dopo test!
```

#### Errore 23505 (PIN duplicato)
```sql
-- Verifica PIN disponibili
SELECT pin FROM generate_series(1, 99) pin 
WHERE pin NOT IN (SELECT pin FROM utenti);
```

#### Connessione Database Timeout
- Verifica region Supabase (usa Europe-West)
- Controlla limiti piano (free/pro)
- Ottimizza query con troppi JOIN

### 📞 Supporto
- **Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [Discord Supabase](https://discord.supabase.com)
- **Dashboard**: Sezione Help nel progetto
