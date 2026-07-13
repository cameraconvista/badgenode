# Architettura Reale

## Perimetro reale

- La root `badgenode` e` il progetto reale.
- Stack principale: React 18, Vite, Wouter, TanStack Query, Express 4, Supabase, TypeScript, PWA.

## Entry point e runtime

- Server dev/prod: `server/start.ts`
- Creazione app Express: `server/createApp.ts`
- Registrazione route: `server/routes.ts`
- Entry client: `client/src/main.tsx`
- Router applicativo: `client/src/App.tsx`

In sviluppo non esistono due processi separati client/server: Express avvia Vite come middleware. La porta effettiva e` `PORT`, con default codice `3001`.

## Struttura utile

- `client/src/pages/Home/`: flusso principale di timbratura.
- `client/src/services/`: servizi client e orchestrazione chiamate.
- `client/src/offline/`: coda offline, IndexedDB, gating, diagnostica.
- `server/routes/timbrature/`: scrittura, update e delete timbrature.
- `server/routes/modules/`: utenti, storico, validazione PIN, system routes.
- `server/shared/time/`: logica condivisa del giorno logico.
- `shared/types/`: tipi condivisi runtime.
- `client/public/`: sorgente UNICA degli asset statici (favicon, icone PWA, logo, manifest); Vite la usa per il build e il dev server la serve. Non esiste piu` una `public/` in root.
- `supabase/migrations/`: SQL applicativo versionato.
- `scripts/`: utility operative; alcune sono solo diagnostiche, altre toccano DB.

## Routing reale

Client:
- `/`
- `/login`
- `/archivio-dipendenti`
- `/admin/ex-dipendenti`
- `/storico-timbrature`
- `/storico-timbrature/:pin`

Server:
- `/api/health`, `/api/ready`, `/api/version`
- `/api/utenti*`
- `/api/pin/validate`
- `/api/storico`
- `/api/timbrature*`
- `/api/ex-dipendenti*`

## Layout admin (guscio)

Le tre pagine admin (`ArchivioDipendenti`, `ExDipendenti`, `StoricoTimbrature`)
sono avvolte da un guscio condiviso `client/src/components/admin/layout/AdminLayout.tsx`:
- **≥1024px** (desktop, tablet landscape): sidebar laterale persistente a sinistra;
- **<1024px** (tablet portrait, telefono): la stessa sidebar diventa un drawer a
  scomparsa da destra, aperto dall'hamburger in topbar (shadcn Sidebar/Sheet, base
  in `client/src/components/ui/sidebar/`). Soglia in `useIsSidebarDrawer()` (1024),
  distinta da `useIsMobile()` (768) usata altrove.
- Voci in `adminNavItems.ts`: Dipendenti · Ex-Dipendenti · Storico, più "Torna al
  Badge" (ritorno al keypad) nel footer. Il guscio non contiene logica di business.
- Le tabelle admin scorrono in orizzontale su schermo stretto (larghezza minima,
  header sticky) senza comprimere le colonne.
- **Modali admin**: guscio visivo unico via classi `.bn-admin-modal*` +
  `.bn-modal-btn-{confirm,danger,cancel}` (in `styles/badgenode.css`) — sfondo crema,
  campi bianchi, titolo rosso, pulsanti semantici. La struttura/logica di ogni modale
  resta nel suo componente; le classi danno solo l'aspetto condiviso.

## Stato auth reale

Il codice client legge i flag in `client/src/config/featureFlags.ts`. Se non overrideati da env, i default correnti del codice sono:

- `VITE_FEATURE_AUTH_BYPASS=true`
- `VITE_FEATURE_AUTH_ROUTE_GUARDS=false`

Questo punto e` operativo: non assumere i default descritti in vecchia documentazione o changelog senza ricontrollare il codice e l'env locale.

## Osservabilita`

- `requestIdMiddleware` aggiunge tracciamento richiesta.
- Sono presenti endpoint health/version.
- In dev il progetto espone diagnostica minima Supabase/offline su `window.__BADGENODE_DIAG__`.
