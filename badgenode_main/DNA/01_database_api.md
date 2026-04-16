# 01 📊 DATABASE API - BadgeNode

**Descrizione concettuale del modello dati e API endpoints**  
**Versione**: 5.2 • **Data**: 2026-04-15 • **Stato**: Audit allineato a evidenze reali  
**Ultima modifica**: Audit read-only schema Supabase reale

---

## 📋 Contenuti

1. [Schema Tabelle](#schema-tabelle)
2. [Relazioni e Indici](#relazioni-e-indici)
3. [API Endpoints](#api-endpoints)
4. [Payload Examples](#payload-examples)
5. [Security & RLS](#security--rls)

---

## 🗄️ Schema Tabelle

### Audit 2026-04-15

`Certo`
- schema reale verificato in `public`: `utenti`, `timbrature`, `ex_dipendenti`
- in `public` non risultano presenti view né materialized view
- tipo enum reale: `timbro_tipo` con valori `entrata`, `uscita`
- funzioni reali presenti: `insert_timbro_v2`, `enforce_alternanza_fn`, `enforce_alternanza_simple_fn`, `generate_timbrature_report`
- la view `v_turni_giornalieri` non risulta presente nel DB reale
- non risultano trigger attivi su `public.timbrature`
- il database reale non mostra colonne `device_id` e `client_seq` in `timbrature`
- il database reale mostra invece `client_event_id` con indice univoco parziale

`Legacy / disallineato`
- `insert_timbro_v2` esiste ed è invocabile, ma il suo commento interno sui trigger non riflette lo stato reale corrente perché oggi non ci sono trigger attivi su `public.timbrature`
- `enforce_alternanza_fn` e `enforce_alternanza_simple_fn` esistono come funzioni trigger legacy, ma non sono operative perché non risultano agganciate a trigger attivi
- il runtime applicativo corrente non va descritto come dipendente da view DB o da trigger DB attivi

`Da verificare`
- nullabilita` completa di alcuni campi testuali nei tipi condivisi, lasciata conservativa dove il runtime assume ancora stringhe valorizzate
- eventuali oggetti fuori `public`, non inclusi in questo audit mirato

Nota tipi condivisi:
- `shared/types/database.ts` e` stato riallineato al perimetro reale `public`
- la view `v_turni_giornalieri` non e` piu` rappresentata come view DB reale nei tipi condivisi
- il tipo `TurnoGiornaliero` resta un contratto applicativo legacy e non una `View` reale del database
- `ore_contrattuali` resta tipizzato in modo conservativo come numero nei tipi condivisi per non propagare regressioni sul runtime, pur essendo nullable nello schema reale

### **utenti** - Dipendenti Attivi

```
Campi principali:
- pin: INTEGER (PK reale)
- nome: TEXT
- cognome: TEXT
- created_at: TIMESTAMPTZ NOT NULL DEFAULT date_trunc('second', now())
- email: TEXT NULL
- telefono: TEXT NULL
- ore_contrattuali: NUMERIC NULL DEFAULT 8.00
- note: TEXT NULL

Vincoli:
- PK reale: `utenti_pkey(pin)`
- non risultano CHECK DB su range PIN o su `ore_contrattuali`
- non risulta colonna `id`
- non risulta colonna `updated_at`

Migration:
- 20251102_add_utenti_extra_fields.sql
- campi extra verificati come presenti nel DB reale
```

### **timbrature** - Registrazioni Entrate/Uscite

```
Campi principali:
- id: BIGSERIAL (PK)
- pin: INTEGER NOT NULL
- tipo: public.timbro_tipo NOT NULL
- ts_order: TIMESTAMPTZ NOT NULL DEFAULT now()
- created_at: TIMESTAMPTZ NOT NULL DEFAULT date_trunc('second', now())
- giorno_logico: DATE NULL
- data_locale: DATE NULL
- ora_locale: TIME NULL
- client_event_id: UUID NULL
- giornologico: DATE NULL

Logica giorno logico:
- il runtime attivo usa `giorno_logico`
- nel DB reale è ancora presente anche `giornologico` come colonna residua
```

### **ex_dipendenti** - Archivio

```
Campi principali:
- pin: INTEGER (PK reale)
- nome: TEXT NULL
- cognome: TEXT NULL
- archiviato_il: TIMESTAMPTZ NOT NULL DEFAULT now()

Nota:
- il DB reale non mostra `id`
- il DB reale non mostra `email`, `telefono`, `ore_contrattuali`, `motivo_archiviazione`
```

---

## 🔗 Relazioni e Indici

### **Relazioni Principali**

- il codice applicativo tratta `pin` come chiave logica condivisa tra `utenti`, `timbrature`, `ex_dipendenti`
- nell'audit schema read-only del 2026-04-15 non risultano foreign key DB tra queste tabelle

### **Indici Suggeriti**

```
Indici reali verificati su `timbrature`:
- timbrature_pkey (id)
- timbrature_pin_idx (pin)
- timbrature_giorno_logico_idx (giorno_logico)
- timbrature_pin_giorno_idx (pin, giorno_logico)
- idx_timbrature_pin_giorno (pin, giorno_logico)
- timbrature_ts_order_idx (ts_order)
- idx_timbrature_pin_ts (pin, ts_order DESC)
- ux_timbrature_client_event_id (client_event_id) WHERE client_event_id IS NOT NULL

Indici reali verificati:
- utenti_pkey (pin)
- ex_dipendenti_pkey (pin)

Non verificati nel DB reale:
- indici su `device_id`, `client_seq`
- FK con `CASCADE DELETE`
```

### **View, Trigger e Funzioni**

```text
View:
- `v_turni_giornalieri` non presente nel DB reale verificato
- nessuna `view` o `materialized view` presente in `public`

Trigger:
- nessun trigger attivo non-internal risulta collegato a `public.timbrature`

Funzioni presenti:
- `insert_timbro_v2(p_pin integer, p_tipo timbro_tipo, p_client_event_id uuid)`
- `enforce_alternanza_fn()`
- `enforce_alternanza_simple_fn()`
- `generate_timbrature_report()`

Note operative:
- le funzioni risultano `SECURITY INVOKER`
- la logica runtime attiva non dipende oggi da trigger DB su `timbrature`
- i grant `EXECUTE` risultano presenti anche per `PUBLIC`, `anon`, `authenticated`, `service_role`
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
POST /api/timbrature
- Registra entrata/uscita via server con SERVICE_ROLE (bypass RLS)
- Body: { pin: number, tipo: 'entrata'|'uscita', ts?: string }
- Response OK: { success: true, data: { id: number, ... } }
- Response errore: { success: false, error: string, code?: string }
- Validazioni: alternanza entrata/uscita, giorno logico, PIN numerico 1-99

GET /api/storico
- Report giornaliero; il codice runtime forza oggi il fallback applicativo su tabella `timbrature`
- Query: ?pin=<num>&dal=YYYY-MM-DD&al=YYYY-MM-DD
- Response: { success: true, data: Array<TurnoGiornaliero> }

GET /api/timbrature/:pin (legacy)
- Storico timbrature per PIN (compat)
```

Nota:
- La precedente RPC `insert_timbro_v2` esiste ancora nel DB reale, ma il runtime applicativo usa come percorso principale l'endpoint server `POST /api/timbrature`.
- La validazione PIN è esposta su `GET /api/pin/validate?pin=..` ed è schema-agnostica (selezione del solo campo `pin`).
- L'assenza di trigger attivi su `timbrature` implica che l'alternanza/giorno logico oggi non viene applicata dal DB tramite trigger.
- Il runtime applicativo corrente non deve essere descritto come dipendente da view DB operative.

### **Ex-Dipendenti**

```
GET /api/ex-dipendenti
- Lista archivio
- Query: ?limit=50&offset=0

GET /api/ex-dipendenti/:id/export
- Export storico completo
- Format: CSV/PDF
```

Nota:
- il contratto dati reale di `ex_dipendenti` è oggi più ridotto di quello storicamente documentato

---

## 📦 Payload Examples

### **Registrazione Timbratura**

```json
Request RPC insert_timbro_v2 (riferimento legacy/documentale):
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

Nota:
- l'esempio RPC sopra e` mantenuto come riferimento storico/documentale
- il runtime applicativo corrente usa come percorso principale `POST /api/timbrature`
- la forma di risposta illustrata non va considerata il contratto operativo corrente della app

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

### Audit 2026-04-15

`Certo`
- `utenti`: RLS attivo, non forzato, una policy `SELECT` per `anon, authenticated`
- `timbrature`: RLS attivo, non forzato, policy `SELECT` per `anon, authenticated` e policy `INSERT` per `authenticated`
- `ex_dipendenti`: RLS disattivo, nessuna policy
- `service_role` ha `rolbypassrls = true`
- `anon` e `authenticated` non hanno bypass RLS

```text
Policy reali:
- utenti_select_all
  cmd: SELECT
  ruoli: anon, authenticated
  qual: true

- timbrature_select_all
  cmd: SELECT
  ruoli: anon, authenticated
  qual: true

- timbrature_insert_authenticated
  cmd: INSERT
  ruoli: authenticated
  with_check: EXISTS (SELECT 1 FROM utenti u WHERE u.pin = timbrature.pin)
```

### **Row Level Security (Concettuale)**

```
Policies principali coerenti con audit:
- utenti: lettura `anon/authenticated`
- timbrature: lettura `anon/authenticated`, inserimento `authenticated` con check su esistenza `utenti.pin`
- ex_dipendenti: nessuna RLS

Nota: in ambienti con RLS attivo, le operazioni di scrittura devono transitare dal server utilizzando la `SUPABASE_SERVICE_ROLE_KEY` (server-only). Le richieste dal client con `VITE_SUPABASE_ANON_KEY` potrebbero ricevere `42501` (violazione RLS) quando una RPC o endpoint comporta write; questo indica che le policy sono applicate correttamente.

Ruoli:
- anon: timbrature base, lettura utenti
- authenticated: stesso di anon
- service_role: accesso completo (solo server)
```

Nota audit:
- le policy RLS sopra riportate sono state verificate direttamente sul DB reale
- restano da verificare solo eventuali oggetti esterni al perimetro `public` non inclusi in questo audit mirato

### **Validazioni Business**

```
Timbrature:
- PIN deve esistere in utenti attivi
- Non duplicare entrate senza uscita
- non risultano trigger DB attivi su `public.timbrature`; l'esistenza di funzioni trigger legacy non equivale a operatività

Idempotenza:
- il DB reale ha indice unico parziale su `client_event_id`
- non risultano nel DB reale colonne `device_id` e `client_seq`
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
