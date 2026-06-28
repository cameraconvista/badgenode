# README Operativo

Leggere questo file prima di lavorare sul progetto.

## Scopo

Questo repository e` in uso locale attivo. Il codice reale resta la fonte di verita` primaria. `DNA/` e` il contesto operativo canonico per lavorare con continuita` e ridurre il rischio, non un sostituto del codice.

## Percorso di lettura obbligatorio

1. Leggere questo file.
2. Aprire solo i file canonici in `DNA/` pertinenti al task.
3. Verificare sempre il codice reale prima di modificare documentazione, logiche o workflow.
4. Trattare `DOCS_STORICO/` come materiale secondario.
5. Valutare i Markdown fuori da `DNA/` prima di duplicarli o spostarli.

## Documentazione canonica

- [DNA/00_INDICE.md](DNA/00_INDICE.md): indice di ingresso e mappa dei documenti attivi.
- [DNA/01_GUARDRAIL.md](DNA/01_GUARDRAIL.md): vincoli non negoziabili e cose da non rompere.
- [DNA/02_ARCHITETTURA_REALE.md](DNA/02_ARCHITETTURA_REALE.md): struttura reale, entrypoint, runtime, moduli chiave.
- [DNA/03_LOGICHE_CRITICHE.md](DNA/03_LOGICHE_CRITICHE.md): giorno logico, alternanza, idempotenza, storico, offline.
- [DNA/04_SUPABASE_DATABASE.md](DNA/04_SUPABASE_DATABASE.md): struttura Supabase verificata e punti di contatto col codice.
- [DNA/05_OPERATIONS.md](DNA/05_OPERATIONS.md): avvio, build, test, script, deploy, workflow operativi.
- [DNA/06_DECISION_LOG.md](DNA/06_DECISION_LOG.md): decisioni tecniche rilevanti già prese.
- [DNA/07_INTEGRAZIONI_DATI.md](DNA/07_INTEGRAZIONI_DATI.md): integrazioni esterne, env, storage locale, GitHub.

## Vincoli non negoziabili

- Non corrompere layout, funzioni, logiche o record su Supabase.
- Non eseguire azioni distruttive o mutazioni DB non richieste esplicitamente.
- Non assumere che la documentazione storica descriva il runtime corrente.
- Non creare documentazione parallela con lo stesso scopo.
- Aggiornare `DNA/` quando cambia davvero un flusso, un vincolo o un workflow reale.

## Note operative rapide

- La root `badgenode` e` il progetto reale.
- In sviluppo gira un solo server Node/Express con Vite montato come middleware.
- Le variabili sensibili stanno in `.env.local`, gia` gitignored.
- Alcuni documenti storici descrivono strutture, default auth o flussi offline non piu` perfettamente allineati: usare sempre i file canonici sopra e poi il codice.
- I Markdown in `.local/` appartengono a tooling locale Codex e non fanno parte della documentazione progetto.
- I README collocati dentro cartelle archivio o legacy restano nella loro posizione perche` spiegano materiale storico accoppiato a quei file, non perche` siano canonici.

## File root da considerare operativi

- [CHANGELOG.md](CHANGELOG.md)
- [POST_DEPLOY_CHECKLIST.md](POST_DEPLOY_CHECKLIST.md)
- [ALERT_UPTIME.md](ALERT_UPTIME.md)
