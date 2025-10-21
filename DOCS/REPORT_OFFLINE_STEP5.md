# BadgeNode — Offline Timbrature (Step 5 • Acceptance finale, badge opzionale sotto flag)

## Scopo
Validare in produzione pilota l’offline single-device (Step 1–4) con checklist di accettazione e micro-badge opzionale sotto flag (default OFF). Nessuna regressione UI/UX.

## Setup variabili
```bash
VITE_FEATURE_OFFLINE_QUEUE=true
VITE_OFFLINE_DEVICE_WHITELIST="tablet-123"
VITE_FEATURE_OFFLINE_BADGE=false  # (true solo per vedere il badge in pilota)
```

## Implementazione
- `client/src/config/featureFlags.ts`
  - `FEATURE_OFFLINE_BADGE` + `isOfflineBadgeEnabled()`
  - `isOfflineEnabled()` già presente (flag globale AND whitelist)
- `client/src/offline/OfflineBadge.tsx`
  - Micro overlay DEV-only, mostra: `offline` | `queued: N` | `syncing…` | `ok`
  - Nessuna dipendenza, nessun impatto layout
- `client/src/main.tsx`
  - Mount condizionale in DEV: se `isOfflineEnabled()` AND `isOfflineBadgeEnabled()` → `mountOfflineBadge()`
- `client/src/offline/diagnostic.ts`
  - `getAcceptanceSnapshot()` + esposizione `window.__BADGENODE_DIAG__.offline.acceptance()`

## Uso diagnostica
- In DevTools:
```js
await window.__BADGENODE_DIAG__.offline.acceptance()
// → { deviceId, allowed, queueCount, lastSeq, online, lastSyncAt }
```

## Acceptance (pilot tablet)
1. Offline puro: rete OFF → 3 timbri (E/U/E) → nessun errore; `queueCount=3`.
2. Ritorno rete: online/foreground → coda svuotata; in DB 3 record, nessun duplicato.
3. Rete ballerina: interrompere durante sync → ripresa automatica.
4. Idempotenza: doppio tap ravvicinato → nessun duplicato (debounce + unique idx DB).
5. Alternanza: ENTRATA, ENTRATA → seconda `REVIEW_REQUIRED`; le altre non bloccate.
6. Kill-switch: rimuovere device da whitelist → offline disabilitato (nessun enqueue).
7. Silenziosità: con badge OFF nessun impatto UI, niente log rumorosi.

## Note
- Nessuna nuova dipendenza; file piccoli/modulari.
- Badge OFF per default; visibile solo in pilota/DEV.
