# Supabase Database

Documento canonico Supabase. Contiene solo dati verificati da:

- codice reale del repository
- migrazioni SQL presenti in `supabase/migrations/`
- audit storico gia` presente nel repository in `08_AUDIT_DATABASE.md`

Se in futuro emergono dubbi sul DB reale non risolvibili con queste fonti, serve nuova verifica via Supabase SQL Editor prima di aggiornare questo file.

## Variabili ambiente usate dal progetto

Verificate nel codice:

- `VITE_SUPABASE_URL`: client runtime
- `VITE_SUPABASE_ANON_KEY`: client runtime
- `SUPABASE_URL`: server runtime, con fallback a `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`: server runtime privilegiato
- `DATABASE_URL`: Drizzle config / tooling SQL

Nota:
- `SUPABASE_DB_URL` puo` esistere in `.env.local`, ma non risultano letture nel codice attivo.

## Client e ruoli

- Client browser: `client/src/adapters/supabaseAdapter.ts`
  usa `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- Server admin: `server/lib/supabaseAdmin.ts`
  usa `SUPABASE_URL || VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Bootstrap env: `server/bootstrap/env.ts`
- Drizzle: `drizzle.config.ts`

## Schema `public` verificato

Verificato tramite:
- `shared/types/database.ts`
- audit storico `08_AUDIT_DATABASE.md`

Tabelle confermate nel perimetro operativo reale:
- `utenti`
- `timbrature`
- `ex_dipendenti`

View confermate:
- nessuna view o materialized view operativa in `public`

Enum confermato:
- `timbro_tipo`: `entrata | uscita`

## Tabelle reali

### `public.utenti`

Verifiche:
- `shared/types/database.ts`
- `supabase/migrations/20251102_add_utenti_extra_fields.sql`
- audit storico `08_AUDIT_DATABASE.md`

Colonne verificate:
- `pin`: integer, chiave primaria reale
- `nome`: text
- `cognome`: text
- `created_at`: timestamptz
- `email`: text nullable
- `telefono`: text nullable
- `ore_contrattuali`: numeric, default `8.00`
- `note`: text nullable

Delicatezze:
- il codice e l'audit concordano che `utenti.id` non esiste
- `ore_contrattuali` e` trattato dal runtime come numero; la documentazione storica segnala schema reale nullable
- `shared/types/database.ts` espone anche campi compat locali non verificati nel DB reale: `descrizione_contratto`, `updated_at`

### `public.timbrature`

Verifiche:
- `shared/types/database.ts`
- audit storico `08_AUDIT_DATABASE.md`
- codice server/client che legge e scrive questi campi

Colonne verificate nel runtime attivo:
- `id`: bigint/bigserial, chiave primaria tecnica
- `pin`: integer
- `tipo`: enum `timbro_tipo`
- `ts_order`: timestamptz
- `created_at`: timestamptz
- `giorno_logico`: date nullable
- `data_locale`: date nullable
- `ora_locale`: time nullable
- `client_event_id`: uuid nullable
- `giornologico`: date nullable, residuo legacy ancora presente

Delicatezze:
- il runtime attivo usa `giorno_logico`, non `giornologico`
- il DB reale auditato usa `client_event_id` per l'idempotenza
- l'audit storico del DB reale indica che `device_id` e `client_seq` non risultano presenti, nonostante esista una migration che li aggiunge

### `public.ex_dipendenti`

Verifiche:
- `shared/types/database.ts`
- audit storico `08_AUDIT_DATABASE.md`
- route server che leggono/scrivono archivio

Colonne verificate:
- `pin`: integer, chiave primaria reale
- `nome`: text nullable
- `cognome`: text nullable
- `archiviato_il`: timestamptz

Delicatezze:
- il DB reale auditato non mostra `id`
- il DB reale auditato non mostra i campi extra storicamente descritti per questa tabella

## Relazioni e chiavi

Verificato da audit storico e codice:
- l'applicazione usa `pin` come chiave logica comune fra `utenti`, `timbrature`, `ex_dipendenti`
- non risultano foreign key DB verificate nel perimetro `public`

Chiavi primarie verificate:
- `utenti_pkey(pin)`
- `timbrature_pkey(id)`
- `ex_dipendenti_pkey(pin)`

## Indici e vincoli delicati

Verificato da audit storico:
- indice su `timbrature.pin`
- indice su `timbrature.giorno_logico`
- indice su combinazioni `pin, giorno_logico`
- indice su `ts_order`
- indice unico parziale `ux_timbrature_client_event_id` quando `client_event_id is not null`

Da non assumere come reali senza nuova verifica:
- indice unico su `(device_id, client_seq)` nel DB attuale
- foreign key con `cascade`

## Funzioni / RPC

### Confermate nel DB reale auditato

Da `shared/types/database.ts` + audit storico:
- `insert_timbro_v2`
- `enforce_alternanza_fn`
- `enforce_alternanza_simple_fn`
- `generate_timbrature_report`

Note:
- il runtime applicativo corrente usa come percorso principale `POST /api/timbrature`, non la RPC come percorso principale
- le funzioni trigger legacy esistono, ma l'audit storico indica che non risultano agganciate a trigger attivi su `public.timbrature`

### Presenti nel repo ma non confermate nel DB reale auditato

Presenti nelle migrazioni, ma non elencate nei tipi condivisi attivi ne` nell'audit storico del DB reale:
- `insert_timbro_offline`
- `insert_utente_v1`

Stato operativo corretto:
- trattarle come funzioni definite nel repository, non come schema reale confermato del DB attuale

## Trigger

Verificato dall'audit storico:
- non risultano trigger attivi non-internal collegati a `public.timbrature`

Nota importante:
- esistono migrazioni che creano/ricreano trigger su `timbrature`
- il DB reale auditato risulta pero` senza trigger attivi su quella tabella
- quindi il runtime non va descritto come dipendente da trigger DB attivi

## Policy RLS

Verificate dall'audit storico `08_AUDIT_DATABASE.md`:

- `utenti`: RLS attivo, non forzato
  - policy `SELECT` per `anon`, `authenticated`
- `timbrature`: RLS attivo, non forzato
  - policy `SELECT` per `anon`, `authenticated`
  - policy `INSERT` per `authenticated` con check su esistenza `utenti.pin`
- `ex_dipendenti`: RLS attivo (migrazione `20260629T0300`), non forzato
  - policy `SELECT` per `anon`, `authenticated` (`using true`)
  - nessuna policy di write → INSERT/UPDATE/DELETE anon negati di default (come `utenti`)
  - prima del 2026-06-29 la RLS era DISATTIVATA: una INSERT anon riusciva (buco chiuso dall'audit)

Ruoli:
- `service_role` bypassa RLS (tutte le scritture dell'app passano di qui, lato server)
- `anon` e `authenticated` non hanno bypass RLS

Conseguenza operativa:
- le scritture sensibili devono passare dal server con `SUPABASE_SERVICE_ROLE_KEY`
- client e script con anon key possono ricevere `42501` in scenari di write, ed e` coerente con il modello di sicurezza

## Storage bucket

Non risultano verifiche positive nel repository su bucket Supabase Storage:
- nessuna migration storage
- nessuna chiamata a `supabase.storage`
- nessun bucket documentato come parte del runtime attivo

Stato corretto:
- nessun bucket Supabase verificato da documentare al momento

## Punti del codice che leggono/scrivono su Supabase

### Client read

- `client/src/pages/Home/index.tsx`
  legge `timbrature` per decidere `lastAllowed`
- `client/src/services/timbrature.service.ts`
  legge `timbrature`
- `client/src/adapters/realtimeAdapter.ts`
  subscribe realtime su `timbrature`
- `server/routes/modules/other/internal/userManagement/testPermissionsRoutes.ts`
  usa anon key per verificare lettura `utenti`

### Server write / privileged read

- `server/routes/timbrature/postTimbratura.ts`
  insert su `timbrature`
- `server/routes/timbrature/updateTimbratura.ts`
  update su `timbrature`
- `server/routes/timbrature/deleteTimbrature.ts`
  delete su `timbrature`
- `server/routes/timbrature/validation.ts`
  legge `timbrature` per alternanza
- `server/routes/modules/utenti.helpers.ts`
  adapter su `utenti`
- `server/routes/modules/other/internal/pinRoutes.ts`
  legge `utenti`
- `server/routes/modules/other/internal/storicoRoutes.ts`
  legge `timbrature`
- `server/routes/modules/other/internal/exDipendentiRoutes.ts`
  legge `ex_dipendenti`
- `server/routes/modules/other/internal/userManagement/*`
  legge/scrive `utenti` e `ex_dipendenti`

### Script e tooling

- `scripts/ci/smoke-runtime.ts`
  select su `utenti`, RPC `insert_timbro_v2`
- `scripts/seed-auth.mjs`
- `scripts/seed_dev_supabase.ts`
- `scripts/seed_dev_cleanup.ts`
- `scripts/write-env.mjs`

Questi script sono sensibili e non vanno eseguiti senza controllo.

## Logiche e vincoli delicati collegati al database

- `pin` e` la chiave logica reale del dominio, non un `id` numerico separato per utenti/ex-dipendenti
- `giorno_logico` e` fondamentale per alternanza e storico
- `client_event_id` e` la chiave di idempotenza runtime confermata
- non basarsi sulla presenza di view DB operative
- non basarsi sulla presenza di trigger attivi
- non dedurre che una migration sia stata applicata al DB reale solo perche` esiste nel repo

## Quando aggiornare questo file

Aggiornare `SUPABASE_DATABASE.md` solo se cambia almeno uno di questi punti con evidenza verificata:
- schema reale delle tabelle
- RLS/policy
- funzioni/RPC confermate
- trigger attivi o assenti
- env Supabase realmente usate
- punti di accesso del codice a Supabase
