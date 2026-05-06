# Integrazioni e Dati

## Supabase

Per la parte schema, RLS, RPC, trigger e punti di lettura/scrittura usare come fonte canonica:
- [SUPABASE_DATABASE.md](SUPABASE_DATABASE.md)

Questo file tiene solo il contesto integrativo attorno a Supabase:
- env e responsabilita` dei ruoli
- storage locale/browser
- integrazioni esterne non-Supabase

## Storage locale / browser

- IndexedDB: coda offline.
- `sessionStorage`: gestione intro splash.
- `window.__BADGENODE_DIAG__`: diagnostica runtime in dev.

## GitHub

Variabili presenti in `.env.local`:
- `GITHUB_URL`
- `GITHUB_TOKEN`

Stato attuale:
- non risultano usate dal runtime applicativo
- sono da considerare credenziali operative esterne, non parte del funzionamento core dell'app

## Segreti

- `.env.local` e` gitignored.
- Non stampare chiavi o token in output, log o documentazione.
- Se si cambiano segreti, aggiornare solo i punti realmente consumati dal codice o dai workflow operativi.
