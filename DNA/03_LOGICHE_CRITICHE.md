# Logiche Critiche

## Giorno logico

Fonte primaria: `server/shared/time/computeGiornoLogico.ts`.

Regole runtime correnti:
- Entrata `00:00-04:59`: `giorno_logico` = giorno precedente.
- Entrata `05:00-23:59`: `giorno_logico` = stesso giorno.
- Uscita `00:00-04:59`: tenta ancoraggio al giorno dell'entrata; se manca, fallback al giorno precedente.
- Uscita `05:00-23:59`: stesso giorno.

I calcoli operativi usano timezone `Europe/Rome`.

## Alternanza entrata/uscita

Fonte primaria: `server/routes/timbrature/validation.ts`.

Regole correnti:
- Non accettare entrata consecutiva nello stesso giorno logico.
- Non accettare uscita senza entrata di ancoraggio.
- Per uscite notturne il server prova auto-recovery dell'`anchorDate` cercando l'ultima entrata utile.
- Il controllo e` applicato lato server, non da trigger DB attivi.

## Scrittura timbrature

Fonte primaria: `server/routes/timbrature/postTimbratura.ts`.

Punti da non rompere:
- Le scritture passano dal server con `SUPABASE_SERVICE_ROLE_KEY`.
- L'idempotenza runtime si basa su `client_event_id`.
- In caso di duplicato (`23505`) il server recupera il record esistente e risponde come successo idempotente.
- Il client non deve scrivere direttamente record sensibili bypassando questo flusso.

## Storico

Fonte primaria: `server/routes/modules/other/internal/storicoRoutes.ts`.

Punti da ricordare:
- Il codice prova `v_turni_giornalieri`, ma il comportamento reale atteso e` il fallback applicativo sulla tabella `timbrature`.
- Il DB reale verificato non ha view operative in `public`.
- Il pairing e le aggregazioni devono restare coerenti con il giorno logico.

Regole di pairing/edge-case (fonte codice: `client/src/utils/timbrature-pairing.ts`, `client/src/lib/storico/pairing.ts`; test in `tests/storico/pairing.test.ts`):
- Pairing deterministico: a parita` di orario ordinare stabilmente per `created_at`.
- Sequenze irregolari (entrata-entrata, uscita-uscita): la prima entrata resta aperta, i record fuori coppia non vanno conteggiati nel totale.
- Sessione aperta (entrata senza uscita): mostrata con uscita "—" e non conteggiata.
- Multi-sessione nello stesso giorno logico: ogni coppia chiusa somma la sua durata al totale del giorno.
- Turni > 16h: trattare come anomalia da segnalare nel report, non bloccare.
- Tutto calcolato lato client: nessun impatto su schema DB. Invalidare la cache storico dopo una timbratura (o subscription su `timbrature`).
- Comportamenti attesi (riferimento, coperti dai test): diurno 09-17 = 8.00; notturno 22-02 = stesso giorno logico dell'entrata, 4.00; PIN `"01"` ≡ `1`; nessuna deriva ±1 giorno al cambio fuso.

Segnali visivi correnti nello Storico Timbrature:
- Riga rossa: solo caso `entrata` presente con `uscita` assente nel riepilogo giorno.
- Alert giallo vicino alla data: solo indicazione UI per orari fuori fascia standard.
- La modale `Anomalia oraria` e` informativa e non persiste alcuno stato.
- Questi segnali non devono modificare calcoli ore, export, pairing, giorno logico, mutazioni o dati DB.

## Validazione PIN

Fonte primaria: `server/routes/modules/other/internal/pinRoutes.ts`.

- La query e` schema-agnostica: legge solo `utenti.pin`.
- Non assumere esistenza di `utenti.id`.
- Il range valido operativo e` `1..99`.

## Offline

Fonti primarie: `client/src/offline/*`, `client/src/services/timbrature.service.ts`.

Regole correnti:
- Feature offline disabilitabile via env.
- Gating per device whitelist lato client.
- Queue persistente IndexedDB con fallback safe.
- Flush automatico su `online` e `visibilitychange`.
- La chiave di idempotenza DB resta `client_event_id`, non `device_id/client_seq`.

## Dati sensibili da preservare

- `utenti.pin` e` la chiave logica reale degli utenti attivi.
- `ex_dipendenti.pin` e` la chiave logica reale archivio.
- `timbrature.id` e` PK tecnica, ma i flussi applicativi ragionano soprattutto per `pin`, `giorno_logico`, `client_event_id`.
- Non introdurre assunzioni su colonne `id` assenti in `utenti` o `ex_dipendenti`.

## Retention

- La retention operativa documentata e` ultimi 6 mesi.
- Non esiste purge automatica nel runtime applicativo corrente.
- Qualsiasi cleanup dati va trattato come attivita` amministrativa esplicita, non come manutenzione ordinaria dell'agent.
