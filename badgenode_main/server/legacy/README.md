# Server Legacy Modules

**Status**: DEPRECATED  
**Created**: STEP B - Server-only consolidation  
**Purpose**: Archivio moduli non più utilizzati dopo migrazione a `/api` endpoints

## Contenuto

Questa cartella contiene moduli server deprecati dopo il consolidamento server-only:

- Funzioni RPC non più invocate direttamente dal client
- Adapter e helper sostituiti da endpoint Express
- Codice di diagnostica Supabase sostituito da `/api/health`

## Migrazione

**Prima del STEP B** (client-server misto):
```typescript
// Client chiamava direttamente Supabase
const { data } = await supabase.from('utenti').select('*');
const rpcResult = await supabase.rpc('insert_timbro_v2', params);
```

**Dopo STEP B** (server-only):
```typescript
// Client usa solo /api endpoints
const response = await safeFetchJson('/api/utenti');
const result = await safeFetchJsonPost('/api/timbrature/manual', params);
```

## Istruzioni

1. **NON eliminare** questi file fino a verifica completa STEP B
2. **NON importare** moduli da questa cartella in codice attivo
3. **Rimuovere definitivamente** dopo test integrazione superati

## Rollback

Per rollback emergenza a client-server misto:
1. Ripristinare import Supabase nei servizi client
2. Riattivare chiamate dirette commentate
3. Impostare `VITE_API_SERVER_ONLY=0` in `.env.local`
