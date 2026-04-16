# BadgeNode — Piano Interventi Consigliati

Data audit: 2026-04-15

## Priorità critica

1. Correggere il ramo production di `GET /api/utenti` per restituire i campi reali del database senza fallback fittizi.
2. Allineare `POST /api/utenti` al contratto reale supportando i campi già presenti in UI/schema/documentazione.
3. Ripristinare una pipeline test affidabile aggiungendo la dipendenza coverage mancante e verificando che `npm run test` esegua davvero i test.
4. Rendere verde `lint` e `check:ci`, separando il codice attivo dal materiale archiviato dove necessario.
5. Allineare la versione Node tra `package.json`, GitHub Actions e documentazione.

## Priorità alta

1. Consolidare il boundary client-server sulle timbrature: decidere in modo esplicito cosa può leggere direttamente Supabase dal client e cosa deve transitare dal server.
2. Rendere atomici o comunque compensabili i flussi archive/restore utente.
3. Formalizzare la strategia di idempotenza offline end-to-end, verificando l'uso effettivo di `client_event_id`.
4. Eliminare la duplicazione degli endpoint di sistema.
5. Aggiornare la documentazione tecnica principale per riflettere il runtime reale.

## Priorità media

1. Ridurre il peso di `client/src/main.tsx` e del bootstrap offline senza cambiare UX.
2. Portare la governance file size dal perimetro `client/src/` a tutto il codice funzionale attivo, con soglia enterprise successiva circa `350` righe.
3. Valutare i falsi positivi di `depcheck` e `ts-prune` per stabilire una baseline pulita.
4. Pulire residui template e moduli non usati (`shared/schema.ts`, `server/storage.ts`, backup `.backup` attivi nel repo).

## Priorità bassa

1. Ottimizzare bundle e chunking export.
2. Migliorare osservabilità reale solo dopo aver chiuso le incongruenze funzionali.
3. Rivalutare la strategia PWA/workbox dopo stabilizzazione qualità.

## Sequenza raccomandata per il prossimo step

1. Mettere in sicurezza il contratto utenti.
2. Ripristinare la pipeline qualità.
3. Allineare documentazione e CI.
4. Preparare una fase successiva su offline/idempotenza e consistenza dati.
