# Device ID per Offline Queue - BadgeNode

## Come Ottenere il Device ID

1. Apri l'app BadgeNode nel browser del dispositivo
2. Apri DevTools (F12) → Console
3. Esegui: `window.__BADGENODE_DIAG__.offline.deviceId`

## Device ID Autorizzati per Produzione

```
# Aggiornare questa lista con i device ID reali
# Formato: ID1,ID2,ID3 (separati da virgola, no spazi)

# Esempio:
# BN_DEV_abc123def456,BN_DEV_789xyz012,BN_PROD_mobile001

# TODO: Sostituire con device ID reali prima del deploy in produzione
BN_DEV_localhost_demo
```

## Configurazione ENV

Aggiornare `VITE_OFFLINE_DEVICE_WHITELIST` in `.env` di produzione:

```bash
VITE_OFFLINE_DEVICE_WHITELIST=BN_DEV_abc123def456,BN_DEV_789xyz012,BN_PROD_mobile001
```

⚠️ **IMPORTANTE**: Non usare mai `*` in produzione!
