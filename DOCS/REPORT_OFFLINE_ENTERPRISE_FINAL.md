# BadgeNode — Offline Timbrature (Step 1–6 • Enterprise Final)

## Sommario degli step
- **Step 1**: scaffolding client, flag `FEATURE_OFFLINE_QUEUE`, `DEVICE_ID`, diagnostica base.
- **Step 2**: DB e RPC idempotente `insert_timbro_offline`, indici parziali `(device_id, client_seq)`.
- **Step 3**: coda persistente (IndexedDB) + sync FIFO, fallback client → RPC.
- **Step 4**: rollout per-device (whitelist), kill-switch, timeout/backoff sicuri.
- **Step 5**: acceptance pilota, micro-badge opzionale sotto flag, snapshot diagnostico.
- **Step 6**: consolidamento enterprise: cleanup diagnostica/logging, helper flag unificato, report finale.

## Configurazione ENV (prod/staging)
```bash
# Offline (global flag OFF di default)
VITE_FEATURE_OFFLINE_QUEUE=false
# Lista device autorizzati (CSV)
VITE_OFFLINE_DEVICE_WHITELIST=""
# Badge opzionale di diagnostica (default OFF)
VITE_FEATURE_OFFLINE_BADGE=false
# Versione app (opzionale, per diagnostica)
VITE_APP_VERSION="2025.10.21-enterprise"
```

- **Produzione**: mantenere OFF; abilitare solo su tablet whitelisted.
- **Staging/Pilota**: `VITE_FEATURE_OFFLINE_QUEUE=true`, `VITE_OFFLINE_DEVICE_WHITELIST="tablet-123"` (o device reale). Badge a discrezione QA (`VITE_FEATURE_OFFLINE_BADGE=true`).

## Flusso e schema
- **Device** → **Coda locale (IDB / fallback in-memory)** → **Sync Runner** → **RPC `insert_timbro_offline`** → **Supabase (indici/idempotenza)**.

## Criteri di fallback e recovery
- **Offline / rete lenta**: enqueue locale; sync su `online`/focus o backoff DEV.
- **Timeout**: abort dopo 12s; riprova al prossimo trigger.
- **Idempotenza**: duplicati evitati da `(device_id, client_seq)` + RPC.
- **Kill‑switch**: spegnere flag o rimuovere device dalla whitelist.
- **Private mode**: IDB non disponibile → fallback in‑memory senza crash.

## Sicurezza e RLS
- RPC esegue risoluzione PIN lato server e calcolo del giorno logico; indici parziali prevengono duplicati.
- Conservare le policy RLS esistenti per letture/visibilità; l’RPC è controllato dal lato server.

## Helper flag unificato
- `client/src/config/featureFlags.ts`:
```ts
export function getOfflineFlags() {
  return { queue: isOfflineQueueEnabled(), badge: isOfflineBadgeEnabled(), env: import.meta.env.MODE };
}
```

## Stato finale delle feature
- Default: OFF. Attivabili solo su device whitelisted.
- Nessuna modifica UI/UX con flag OFF. Nessun import attivo quando OFF (tree‑shake safe).

## Checklist di validazione finale
- **App avviabile** in DEV/PROD senza errori.
- **Flag OFF** = comportamento identico al pre‑offline.
- **Flag ON + whitelisted** = timbri offline enqueued e sincronizzati correttamente; `__BADGENODE_DIAG__.offline.lastSyncAt` aggiornato.
- **Private mode** = nessun crash, fallback in‑memory attivo.
- **Badge OFF** = nessun impatto visivo.
- **Report**: questo documento generato e archiviato.
