# 01 📊 DATABASE API - BadgeNode

**Descrizione concettuale del modello dati e API endpoints**  
**Versione**: 5.0 • **Data**: 2025-10-21 • **Stato**: Enterprise Stable

---

## 📋 Contenuti

1. [Schema Tabelle](#schema-tabelle)
2. [Relazioni e Indici](#relazioni-e-indici)
3. [API Endpoints](#api-endpoints)
4. [Payload Examples](#payload-examples)
5. [Security & RLS](#security--rls)

---

## 🗄️ Schema Tabelle

### **utenti** - Dipendenti Attivi

```
Campi principali:
- id: UUID (PK, auto-generated)
- pin: INTEGER (1-99, UNIQUE)
- nome: VARCHAR(100)
- cognome: VARCHAR(100)
- ore_contrattuali: DECIMAL(4,2) default 8.00
- email: VARCHAR(255) optional
- telefono: VARCHAR(20) optional
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

Vincoli:
- PIN deve essere tra 1 e 99
- Nome e cognome obbligatori
- Ore contrattuali positive
```

### **timbrature** - Registrazioni Entrate/Uscite

```
Campi principali:
- id: BIGSERIAL (PK)
- pin: INTEGER (FK → utenti.pin)
- tipo: VARCHAR(10) ('entrata'|'uscita')
- data: DATE
- ore: TIME
- giornologico: DATE (calcolato)
- created_at: TIMESTAMP

Logica giorno logico:
- Entrate 00:00-04:59 → giorno precedente
- Uscite seguono logica turno notturno
```

### **ex_dipendenti** - Archivio

```
Campi principali:
- id: UUID (PK)
- pin: INTEGER (storico)
- nome, cognome: VARCHAR(100)
- ore_contrattuali: DECIMAL(4,2)
- email, telefono: VARCHAR optional
- archiviato_at: TIMESTAMP
- motivo_archiviazione: TEXT
```

---

## 🔗 Relazioni e Indici

### **Relazioni Principali**

- `timbrature.pin` → `utenti.pin` (CASCADE DELETE)
- `ex_dipendenti` → copia dati da `utenti` prima dell'eliminazione

### **Indici Suggeriti**

```
Performance critici:
- idx_utenti_pin (UNIQUE)
- idx_timbrature_pin
- idx_timbrature_giornologico
- idx_timbrature_pin_giorno (composto)
- idx_timbrature_created_at

Ricerche frequenti:
- idx_ex_dipendenti_archiviato_at
- idx_utenti_nome_cognome (ricerca testuale)
```

---

## 🌐 API Endpoints

### **Utenti Management**

```
GET /api/utenti
- Lista utenti attivi
- Response: Array<Utente>

POST /api/utenti
- Crea nuovo utente
- Body: {pin, nome, cognome, ore_contrattuali?, email?, telefono?}

PUT /api/utenti/:pin
- Aggiorna utente esistente
- Body: Partial<Utente>

DELETE /api/utenti/:pin
- Elimina utente (sposta in ex_dipendenti)
- Query: ?motivo=string
```

### **Timbrature**

```
RPC insert_timbro_v2
- Registra entrata/uscita con validazione PIN
- Params: {p_pin: number, p_tipo: 'entrata'|'uscita'}
- Response: {success: boolean, message: string}
- Validazione: PIN deve esistere in tabella utenti

GET /api/timbrature/:pin
- Storico timbrature per PIN
- Query: ?dal=YYYY-MM-DD&al=YYYY-MM-DD

GET /api/storico/:pin
- Report aggregato giornaliero
- Query: ?mese=YYYY-MM
- Response: Array<TurnoGiornaliero>
```

### **Ex-Dipendenti**

```
GET /api/ex-dipendenti
- Lista archivio
- Query: ?limit=50&offset=0

GET /api/ex-dipendenti/:id/export
- Export storico completo
- Format: CSV/PDF
```

---

## 📦 Payload Examples

### **Registrazione Timbratura**

```json
Request RPC insert_timbro_v2:
{
  "p_pin": 15,
  "p_tipo": "entrata"
}

Response 200:
{
  "success": true,
  "message": "Entrata registrata",
  "timestamp": "2025-10-12T08:30:00+02:00",
  "giornologico": "2025-10-12"
}

Response 400 (errore business):
{
  "success": false,
  "error": "Alternanza entrata/uscita non rispettata",
  "code": "INVALID_SEQUENCE"
}

Response 400 (PIN non valido):
{
  "success": false,
  "error": "PIN non registrato nel sistema",
  "code": "INVALID_PIN"
}
```

### **Creazione Utente**

```json
Request POST /api/utenti:
{
  "pin": 25,
  "nome": "Mario",
  "cognome": "Rossi",
  "ore_contrattuali": 8.0,
  "email": "mario.rossi@example.com"
}

Response 201:
{
  "id": "uuid-generated",
  "pin": 25,
  "nome": "Mario",
  "cognome": "Rossi",
  "ore_contrattuali": 8.0,
  "created_at": "2025-10-09T10:00:00+02:00"
}
```

### **Report Storico**

```json
Response GET /api/storico/25?mese=2025-10:
[
  {
    "pin": 25,
    "nome": "Mario",
    "cognome": "Rossi",
    "giornologico": "2025-10-09",
    "prima_entrata": "08:30:00",
    "ultima_uscita": "17:30:00",
    "ore_lavorate": 8.5,
    "ore_extra": 0.5
  }
]
```

---

## 🔐 Security & RLS

### **Row Level Security (Concettuale)**

```
Policies principali:
- utenti: lettura pubblica, scrittura admin
- timbrature: lettura pubblica, inserimento tutti, modifica admin
- ex_dipendenti: solo admin

Nota: in ambienti con RLS attivo, le operazioni di scrittura devono transitare dal server utilizzando la `SUPABASE_SERVICE_ROLE_KEY` (server-only). Le richieste dal client con `VITE_SUPABASE_ANON_KEY` potrebbero ricevere `42501` (violazione RLS) quando una RPC o endpoint comporta write; questo indica che le policy sono applicate correttamente.

Ruoli:
- anon: timbrature base, lettura utenti
- authenticated: stesso di anon
- service_role: accesso completo (solo server)
```

### **Validazioni Business**

```
Timbrature:
- PIN deve esistere in utenti attivi
- Non duplicare entrate senza uscita
- Non uscire senza entrata precedente
- Rispettare logica giorno logico

Utenti:
- PIN univoco (1-99)
- Nome/cognome non vuoti
- Ore contrattuali > 0
```

### **Rate Limiting**

```
Suggerimenti:
- /api/timbrature: 10 req/min per PIN
- /api/utenti: 100 req/min globale
- /api/storico: 20 req/min per PIN
```

---

## 🔧 Implementazione Notes

### **Database Provider**

- **Supabase PostgreSQL** (production)
- **SQLite** (development/testing)
- **Migrations**: Drizzle ORM

### **Caching Strategy**

```
Cache layers:
- React Query: client-side (5min TTL)
- Redis: server-side (opzionale)
- CDN: static assets

Invalidation:
- Timbrature: real-time via Supabase
- Utenti: manual refresh
- Storico: daily cache
```

### **Monitoring**

```
Metriche chiave:
- Latency API < 200ms
- Uptime > 99.5%
- Error rate < 1%
- Timbrature/giorno tracking
```

---

**Note**: Questo documento descrive il modello concettuale. L'implementazione effettiva può variare in base ai requisiti specifici e alle limitazioni tecniche.

---

> **Documento aggiornato alla baseline Enterprise Stable (v1.0.0 — 2025-10-21)**  
> Autore: BadgeNode / Cascade AI
