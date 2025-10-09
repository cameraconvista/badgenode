# 🔗 SUPABASE SETUP - BadgeNode

**Versione:** 1.0  
**Data:** 09 Ottobre 2025  
**Progetto:** BadgeNode - Sistema di timbratura con PIN

---

## 🌍 AMBIENTE & VARIABILI

### Variabili Ambiente Richieste
```bash
# Client-side (esposte al browser)
VITE_SUPABASE_URL=https://hjbungtedtgffmnficmp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-side (solo per script admin - NON committare)
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Configurazione File
- **Development:** `.env`
- **Production:** `.env.production.local`
- **Template:** `.env.example` (già presente)

### ⚠️ SICUREZZA
- **MAI committare** service role key nel repository
- Solo anon key può essere esposta al client
- Service role solo per script di manutenzione

### 🔐 Sicurezza Chiavi

#### Gestione Service Role Key
**Dove salvare:**
- **Locale:** File `.env` (mai committato)
- **Server:** Secrets/Environment Variables del servizio hosting
- **CI/CD:** Encrypted secrets del pipeline

**Dove NON salvare:**
- ❌ Hardcoded nel codice sorgente
- ❌ File committati nel repository
- ❌ Documentazione pubblica
- ❌ Client-side (browser)

#### Procedura di Rotazione
1. **Accedi a Supabase Dashboard**
   - Project Settings → API → Service Role Key
   
2. **Genera nuova chiave**
   - Click "Rotate" → Conferma operazione
   - Copia la nuova chiave generata
   
3. **Aggiorna configurazioni**
   - Locale: `.env` → `SUPABASE_SERVICE_ROLE_KEY=nuova-chiave`
   - Server: Secrets del servizio hosting
   - Script admin: Verifica funzionamento
   
4. **Verifica funzionamento**
   - Test script admin: `npm run clean:demo-users`
   - Controllo log errori Supabase
   
5. **Cleanup (opzionale)**
   - Purge della vecchia chiave dalla storia Git
   - Audit log accessi con vecchia chiave

#### Frequenza Rotazione
- **Raccomandato:** Ogni 6 mesi
- **Obbligatorio:** In caso di compromissione
- **Trigger:** Cambio team, leak accidentale

---

## 🔐 AUTENTICAZIONE

### Provider Utilizzati
**Analisi dal codice:**
- **Modalità:** Anon access (nessun auth provider configurato)
- **Context:** `AuthContext.tsx` presente ma non implementato
- **Login:** `LoginPage.tsx` presente ma non funzionale

### Configurazione Attuale
```typescript
// client/src/lib/supabaseClient.ts
export const supabase = createClient(url, anon);
```

### RLS (Row Level Security)
**Stato assumibile:** ATTIVO
- App usa solo anon key → RLS necessario per sicurezza
- Policies da configurare per ogni tabella

---

## 🗄️ TABELLE & COLONNE

### Tabelle Principali (inferite dal codice)

#### `timbrature`
**Utilizzo:** Registrazione entrate/uscite
```sql
-- Colonne identificate dal codice:
pin INTEGER                    -- PIN dipendente
data TIMESTAMP                 -- Data/ora timbratura  
tipo VARCHAR                   -- 'entrata' | 'uscita'
giornologico DATE             -- Giorno logico (logica 00:00-04:59)
ore TIME                      -- Ora timbratura
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### `utenti`
**Utilizzo:** Anagrafica dipendenti attivi
```sql
-- Colonne identificate dal codice:
id UUID PRIMARY KEY
pin INTEGER UNIQUE             -- PIN univoco dipendente
nome VARCHAR                   -- Nome dipendente
cognome VARCHAR               -- Cognome dipendente
email VARCHAR                 -- Email (opzionale)
telefono VARCHAR              -- Telefono (opzionale)
ore_contrattuali DECIMAL      -- Ore contrattuali giornaliere
descrizione_contratto TEXT    -- Descrizione contratto
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### `ex_dipendenti`
**Utilizzo:** Archivio dipendenti eliminati
```sql
-- Colonne identificate dal codice:
-- (eredita da utenti)
archiviato_at TIMESTAMP       -- Data archiviazione
motivo_archiviazione TEXT     -- Motivo eliminazione
```

#### `v_turni_giornalieri` (Vista)
**Utilizzo:** Aggregazione turni per storico
```sql
-- Vista per calcoli giornalieri
-- Raggruppa timbrature per giornologico
-- Calcola ore lavorate e straordinari
```

### Schema Drizzle (Separato)
**File:** `shared/schema.ts`
```sql
-- Tabella non correlata a Supabase
users (
  id UUID,
  username TEXT,
  password TEXT
)
```
**Nota:** Schema Drizzle non utilizzato nell'app principale

---

## 🔒 POLICIES RLS (Da Configurare)

### `timbrature`
```sql
-- Lettura: tutti possono leggere le proprie timbrature
CREATE POLICY "Users can read own timbrature" ON timbrature
FOR SELECT USING (true); -- TODO: Filtrare per PIN se auth implementato

-- Inserimento: tutti possono timbrare
CREATE POLICY "Users can insert timbrature" ON timbrature
FOR INSERT WITH CHECK (true);

-- Aggiornamento: solo admin (TODO)
CREATE POLICY "Admin can update timbrature" ON timbrature
FOR UPDATE USING (false); -- Disabilitato per ora

-- Eliminazione: solo admin (TODO)
CREATE POLICY "Admin can delete timbrature" ON timbrature
FOR DELETE USING (false); -- Disabilitato per ora
```

### `utenti`
```sql
-- Lettura: tutti possono leggere anagrafica
CREATE POLICY "Public read utenti" ON utenti
FOR SELECT USING (true);

-- Inserimento: solo admin
CREATE POLICY "Admin can insert utenti" ON utenti
FOR INSERT WITH CHECK (false); -- TODO: Implementare auth admin

-- Aggiornamento: solo admin
CREATE POLICY "Admin can update utenti" ON utenti
FOR UPDATE USING (false); -- TODO: Implementare auth admin

-- Eliminazione: solo admin (sposta in ex_dipendenti)
CREATE POLICY "Admin can archive utenti" ON utenti
FOR DELETE USING (false); -- TODO: Implementare auth admin
```

### `ex_dipendenti`
```sql
-- Solo admin può gestire archivio
CREATE POLICY "Admin only ex_dipendenti" ON ex_dipendenti
FOR ALL USING (false); -- TODO: Implementare auth admin
```

---

## 📡 REALTIME

### Canali Sottoscritti
**Implementazione:** `client/src/lib/realtime.ts`

#### Channel: `timbrature:all`
```typescript
// Sottoscrizione globale (admin)
supabase.channel('timbrature:all')
  .on('postgres_changes', {
    event: '*',
    schema: 'public', 
    table: 'timbrature'
  })
```

#### Channel: `timbrature:pin:${pin}`
```typescript
// Sottoscrizione per PIN specifico
supabase.channel(`timbrature:pin:${pin}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'timbrature',
    filter: `pin=eq.${pin}`
  })
```

### Punti di Subscribe/Unsubscribe
1. **Home.tsx** (linea 34): PIN specifico
2. **StoricoTimbrature.tsx** (linea 47): Globale admin
3. **ArchivioDipendenti.tsx** (linea 32): Globale per cache

### Cleanup
✅ **Implementato correttamente:**
```typescript
return () => {
  supabase.removeChannel(channel);
};
```

---

## 📁 STORAGE (Non Utilizzato)

**Stato:** Nessun bucket Supabase Storage identificato nel codice
**File upload:** Non implementato
**Policies:** N/A

---

## ⚡ FUNZIONI/TRIGGER

### RPC Functions (Non Identificate)
**Stato:** Nessuna chiamata `rpc()` trovata nel codice
**Edge Functions:** Non utilizzate

### Database Triggers (Da Confermare)
**Possibili trigger necessari:**
- Auto-update `updated_at` su modifiche
- Calcolo automatico `giornologico` su insert timbrature
- Validazione PIN esistente

---

## ✅ CHECKLIST PERIODICA

### Verifica Chiavi
- [ ] Rotazione anon key (ogni 6 mesi)
- [ ] Verifica service role key non esposta
- [ ] Controllo accessi Dashboard

### Controlli RLS
- [ ] Test policies con utenti diversi
- [ ] Verifica filtri per PIN
- [ ] Audit log accessi

### Quote & Performance
- [ ] Monitoraggio query count
- [ ] Verifica dimensioni database
- [ ] Controllo realtime connections

### Log Errori
- [ ] Controllo error logs Supabase
- [ ] Monitoraggio failed queries
- [ ] Verifica cold starts

---

## 🔍 SEZIONE "DA CONFERMARE"

### Database Schema
**TODO:** Verificare in Supabase Dashboard
- [ ] Confermare struttura tabelle effettiva
- [ ] Verificare indici per performance
- [ ] Controllare foreign keys e constraints

### RLS Policies
**TODO:** Implementare e testare
- [ ] Creare policies per ogni tabella
- [ ] Testare con diversi livelli di accesso
- [ ] Implementare auth se necessario

### Realtime Configuration
**TODO:** Verificare in Dashboard
- [ ] Abilitare Realtime per tabelle necessarie
- [ ] Configurare filtri RLS per Realtime
- [ ] Testare performance con molti client

### Backup & Recovery
**TODO:** Configurare
- [ ] Backup automatici database
- [ ] Strategia disaster recovery
- [ ] Test restore procedure

### Monitoring
**TODO:** Implementare
- [ ] Alert su errori critici
- [ ] Monitoraggio performance query
- [ ] Dashboard metriche utilizzo

---

## 🚀 DEPLOYMENT NOTES

### Variabili Render/Netlify
```bash
# Produzione
VITE_SUPABASE_URL=https://hjbungtedtgffmnficmp.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key-from-dashboard>
```

### Build Configuration
**Vite:** Variabili definite in `vite.config.ts`
```typescript
define: {
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
  'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
}
```

---

*Setup guide generato automaticamente il 09/10/2025 alle 02:41*  
*Basato sull'analisi del codice BadgeNode v1.0.0*
