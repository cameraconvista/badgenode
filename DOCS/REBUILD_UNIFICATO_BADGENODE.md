# BadgeNode — Rebuild Unificato (Backend + Frontend)

Data esecuzione: 2025-10-20

## Obiettivo
- Unificare backend Express e frontend React in un unico servizio.
- Servire build React da `dist/public` tramite Express.
- Nessun import/require di Vite in produzione.
- Compatibilità con Supabase invariata.

---

## Diagnosi iniziale
- File con riferimenti a Vite (build-time e dev):
  - `package.json` → script `build`/`postbuild`, devDep `vite`, plugin PWA.
  - `vite.config.ts` → config client, plugin `@vitejs/plugin-react`, `vite-plugin-pwa`, `unplugin-icons`.
  - `server/vite.ts` → import diretto di `vite` (causa crash se eseguito in prod).
  - `server/index.ts` → prima importava `{ setupVite, serveStatic, log }` da `./vite`.
- Export “Esporta Tutto”:
  - Pulsante in `client/src/pages/ArchivioDipendenti.tsx` (rimosso).
  - Non presenti file `exportAll.service.ts`, `xlsxUtils.ts` nel repo corrente.
- API `/api/utenti` definite in `server/routes.ts`.
- Base URL API lato client in `client/src/lib/apiBase.ts` usava `VITE_API_BASE_URL` anche in prod.

---

## Modifiche effettuate

- Server Express (produzione senza Vite):
  - File: `server/index.ts`
    - Rimosso import statico di `./vite`.
    - Aggiunto import dinamico di `./vite.ts` solo in sviluppo (dev middleware Vite).
    - In produzione: serve statici da `dist/public` e SPA fallback a `index.html`.
    - Logging semplificato con `console.log`.
  - File: `server/vite.ts`
    - Invariato. Resta solo per sviluppo (middleware Vite) e non viene importato in prod.

- Frontend (same-origin e rimozione “Esporta Tutto”):
  - File: `client/src/lib/apiBase.ts`
    - In produzione ritorna stringa vuota per usare same-origin.
    - In sviluppo mantiene override opzionale `VITE_API_BASE_URL` altrimenti `http://localhost:3001`.
  - File: `client/src/pages/ArchivioDipendenti.tsx`
    - Rimosso pulsante “Esporta Tutto” e relativo handler.
    - Fix: `UtentiService.updateUtente` ora riceve `pin` (number) invece di `id` (string).
  - Export di storico (`useStoricoExport`) non toccato: non fa parte del pulsante “Esporta Tutto”.

- Build pipeline:
  - `npm ci` eseguito con successo.
  - `npm run build` esegue:
    - `vite build` → output client in `dist/public` (PWA files inclusi).
    - `esbuild server/index.ts` → `dist/index.js` bundle server ESM.
  - Avvio: `npm run start` → `node dist/index.js`.

---

## Verifiche locali
- Server avviato: `serving on port 3001`.
- Root: `http://localhost:3001` → 200 OK (app React servita).
- API: `GET http://localhost:3001/api/utenti` → 200 JSON con lista utenti demo.
- Anteprima WindSurf attiva.

---

## Scelte su Vite e pulizia
- Requisito critico: nessun import di Vite in produzione. Soddisfatto con import dinamico solo in dev.
- Manteniamo Vite come devDependency e per build del client. Rimuoverlo dal `package.json` impedirebbe la build del frontend.
- Nessun `vite` importato/richiesto a runtime in prod.

---

## Istruzioni Deploy Render (unico servizio Node)
- Root directory: repo root.
- Build Command:
```
npm ci && npm run build
```
- Start Command:
```
npm run start
```
- Publish directory: non necessario (gli statici sono serviti dal backend).
- Env Vars suggerite:
```
NODE_VERSION=22.6.0
NODE_ENV=production
PORT=10000
VITE_SUPABASE_URL=https://tutllgsjrbxkmrwseogz.supabase.co
VITE_SUPABASE_ANON_KEY=***
```
- Rimuovere `VITE_API_BASE_URL` (non serve con same-origin).

Note: Render userà automaticamente la `PORT` assegnata; l’app legge `process.env.PORT`.

---

## Sicurezza e rollback
- Backup pre-unify creato in `backups/backup_preunify_<timestamp>.tar.gz` (warning innocuo: "Can't add archive to itself" se la cartella di destinazione rientra nel perimetro; l’archivio è stato generato).
- Nessun branch nuovo: modifiche su `main`.
- Rollback: `git reset --hard HEAD~1` (se necessario).

---

## Azioni residue consigliate
- Pulizia `package.json` opzionale:
  - Verificare se tool di analisi (`knip`, `depcheck`, `ts-prune`) e plugin Vite non indispensabili possono essere rimossi senza impattare la build PWA.
- Impostare variabili ENV su Render e lanciare deploy.
- Monitorare il tempo di risposta prima visualizzazione (cold start Render) e valutare `keep-alive`/cron ping se necessario.

---

## File toccati
- `server/index.ts` (prod senza Vite, dev con Vite middleware dinamico)
- `client/src/lib/apiBase.ts` (same-origin prod)
- `client/src/pages/ArchivioDipendenti.tsx` (rimosso pulsante “Esporta Tutto”, fix update)

