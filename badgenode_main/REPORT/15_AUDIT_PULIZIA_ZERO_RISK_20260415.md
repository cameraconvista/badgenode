# Audit Pulizia Zero-Risk - 2026-04-15

## Obiettivo

Identificare e rimuovere solo file o cartelle sicuramente inutilizzati al 100%, senza supposizioni e senza impatto su runtime, build, deploy, CI, documentazione tecnica attiva o asset richiamati indirettamente.

## Perimetro analizzato

- codice applicativo `client/`, `server/`, `shared/`
- asset statici `public/`, `client/public/`
- script `scripts/`, `scripts/sql/`, `scripts/db/`, `scripts/_archive/`
- configurazioni build/test/CI
- documentazione `DNA/`, `REPORT/`
- output generati presenti nel worktree

## File/cartelle sicuramente eliminabili

### 1. `coverage/`

Motivazione certa:
- contiene solo report di coverage temporanei
- viene rigenerata da `npm run test`
- e` esclusa da lint e test config
- non e` usata da runtime, deploy o build come input
- in CI viene prodotta come artifact del job test, non consumata come sorgente

### 2. `dist/`

Motivazione certa:
- contiene solo output di build
- viene rigenerata da `npm run build`
- il runtime di produzione usa `dist/` come output, non come sorgente versionata
- in CI viene prodotta e pubblicata come artifact del job build
- nel repo corrente non risulta usata come input da script applicativi

## File dubbi da non toccare

### `public/` e `client/public/`
- presenti riferimenti reali via Vite PWA, manifest, `index.html`, script `generate-pwa-icons.ts`
- presenza di duplicati apparenti, ma non eliminabili a rischio 0 senza riallineamento documentale e del flusso asset

### `scripts/_archive/`
- esclusa dal quality gate, ma documentata e mantenuta come archivio operativo/storico
- non eliminabile al 100% senza decisione esplicita di rimozione dell'archivio tecnico

### `supabase/`
- non usata dal runtime diretto, ma ancora baseline SQL e sorgente storica/documentale

### `Backup_Automatico/`
- in questo stato e` vuota; nessun file da rimuovere
- la cartella e` ancora referenziata da script npm e tooling backup/restore

### `REPORT_AUDIT_PULIZIA.md`
- documento storico preesistente, non usato dal runtime
- non eliminato in questo step per evitare cancellazioni documentali non richieste

## Stima alleggerimento

- `coverage/`: circa `296K`
- `dist/`: circa `3.7M`
- totale stimato: circa `4.0M`

## Rimozioni effettive eseguite

- rimossa cartella `coverage/`
- rimossa cartella `dist/`

## Verifiche post-rimozione richieste

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:ci`

## Esito

Pulizia limitata ai soli artefatti generabili e sicuramente non-sorgente.
