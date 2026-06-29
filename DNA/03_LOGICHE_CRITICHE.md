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

Regole di pairing/edge-case (fonte codice: `client/src/utils/timbrature-pairing.ts`, `client/src/lib/storico/pairing.ts`; test in `tests/storico/pairing.test.ts`, `tests/storico/sessioni-split.test.ts`):
- Pairing deterministico: ordinare per `created_at` (ordine cronologico reale), tie-break su `ora_locale`. NON ordinare per la stringa orario `HH:MM`: un'uscita dopo mezzanotte (es. 01:30) verrebbe messa prima di un'entrata serale (22:00) e spezzerebbe il pairing dei turni a cavallo di mezzanotte.
- Sequenze irregolari (entrata-entrata, uscita-uscita): la prima entrata resta aperta, i record fuori coppia non vanno conteggiati nel totale.
- Sessione aperta (entrata senza uscita): mostrata con uscita "—" e non conteggiata.
- Multi-sessione nello stesso giorno logico: ogni coppia chiusa somma la sua durata al totale del giorno.
- Turni > 16h: trattare come anomalia da segnalare nel report, non bloccare.
- Tutto calcolato lato client: nessun impatto su schema DB. Invalidare la cache storico dopo una timbratura (o subscription su `timbrature`).
- Comportamenti attesi (riferimento, coperti dai test): diurno 09-17 = 8.00; notturno 22-02 = stesso giorno logico dell'entrata, 4.00; spezzato chef 09-13 + 17-02 = 13.00 (4+9) sul giorno dell'entrata; PIN `"01"` ≡ `1`; nessuna deriva ±1 giorno al cambio fuso.

### Visualizzazione turni spezzati nello Storico ("due righe pari" + totale)
Fonte codice: `client/src/hooks/useStoricoTimbrature.ts`, `client/src/components/storico/StoricoTable.tsx`, `client/src/lib/storico/aggregate.ts`, `client/src/lib/storico/pairing.ts`.
- La tabella Storico carica i record GREZZI del range (`TimbratureService.getTimbratureByRange`) e ricostruisce le sessioni con `aggregateTimbratureByGiornoLogico` → `pairSessionsForGiorno`. Stessa pipeline già usata da `ExStoricoModal` (dipendenti archiviati).
- Resa "due righe pari": per un giorno spezzato la riga-giorno mostra la PRIMA sessione (es. 09-13) con le sue ore; ogni sessione successiva è una riga allo stesso livello (stesso sfondo, nessuna etichetta nella colonna Mese). NON si mostra l'intervallo compresso prima-entrata→ultima-uscita (sarebbe fuorviante, es. 09-02).
- Riga "Totale giorno": chiude il giorno spezzato con ORE TOTALI ed EXTRA del giorno. Le ore totali restano governate da `storicoDatasetV5` (API `/api/storico`) come fonte di verita`: la visualizzazione delle sessioni NON altera mai un totale.
- EXTRA: e` una proprieta` del GIORNO, calcolato sul TOTALE ore di tutte le sessioni dello stesso giorno logico (`max(0, ore_giorno − ore_contrattuali)`). Mai per singola sessione. Per i giorni non spezzati resta sulla riga-giorno; per gli spezzati solo sulla riga "Totale giorno".
- Giorno con turno unico: una sola riga, nessuna riga totale aggiuntiva. Caso d'uso reale: spezzato tipico chef mattina+sera (2 sessioni); il motore regge anche N>2 senza limiti.
- Export PDF/XLS (`useStoricoExport.ts`): stessa resa (prima sessione + sessioni + "Totale giorno"); include TUTTI i giorni del periodo, anche vuoti; orari troncati a HH:MM (no secondi); ore come valore numerico. Totali invariati.
- La modale di modifica giorno NON e` stata estesa: continua a gestire la prima coppia entrata/uscita (scelta esplicita, fuori ambito).

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
