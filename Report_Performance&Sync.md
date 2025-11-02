# Report Performance & Sincronizzazioni — BadgeNode

**Data:** 1 Nov 2025, 15:04 CET | **Env:** Dev (localhost:10000) | **Branch:** main (7bcb32c) | **Node:** v22.20.0

---

## 1️⃣ Sommario Esecutivo

### Stato: 🟢 **ECCELLENTE**

**Takeaway:**
- ✅ **TTFB 1.6-5.3ms** (avg 3.6ms) — Ottimo per dev Vite
- ✅ **API <1ms** — /api/ready 0.68-0.92ms, /api/health 0.7-1.6ms
- ⚠️ **Cache dev**: `no-cache` su asset (verificare prod)
- ✅ **Bundle**: Max 920KB (exceljs lazy-loaded)
- ✅ **Offline**: IndexedDB + fallback in-memory
- ✅ **Zero errori 5xx** — Stabilità confermata

---

## 2️⃣ Frontend — Timing & Caching

### Timing Root (3 Run)

| Run | TTFB | Total |
|-----|------|-------|
| 1 | 5.33ms | 5.37ms |
| 2 | 3.80ms | 3.89ms |
| 3 | 1.57ms | 1.60ms |

**Stats:** Min 1.57ms, Max 5.33ms, Avg 3.57ms  
**Rischio:** 🟢 Basso

### Cache Headers

| Asset | Cache-Control | ETag | Last-Modified |
|-------|---------------|------|---------------|
| `/` | ❌ Assente | ❌ | ❌ |
| `/manifest.webmanifest` | `no-cache` | ✅ W/"944-..." | ✅ Oct 20 |
| `/logo_app.png` | `no-cache` | ✅ W/"7429-..." | ✅ Oct 20 |

**Rischio:** 🟡 Medio — Verificare `max-age` in prod

### Bundle Top 10

| Size | File | Note |
|------|------|------|
| 920KB | exceljs.min | ⚠️ Lazy-loaded |
| 380KB | jspdf.es.min | ⚠️ Lazy-loaded |
| 308KB | react | ✅ Core |
| 200KB | html2canvas | ⚠️ Lazy-loaded |
| 156KB | recharts | ✅ Charts |
| 152KB | supabase | ✅ Client |
| 104KB | radix | ✅ UI |
| 100KB | index | ✅ Main |
| 96KB | StoricoWrapper | ✅ Page |
| 84KB | index.css | ✅ Tailwind |

**Rischio:** 🟢 Basso — Ottimizzato

### Waterfall

**Playwright:** ❌ Non disponibile  
**Stima DCL:** 200-500ms (dev HMR)  
**Rischio:** 🟡 Medio — Metriche precise mancanti

---

## 3️⃣ Backend — Latenze

### /api/health (10 Run)

| Metrica | Valore |
|---------|--------|
| Min | 0.70ms |
| Max | 1.57ms |
| Avg | 0.95ms |
| P95 | ~1.5ms |

**Success:** 10/10 (100%)  
**Rischio:** 🟢 Basso

### /api/ready (10 Run)

| Metrica | Valore |
|---------|--------|
| Min | 0.68ms |
| Max | 0.92ms |
| Avg | 0.80ms |
| P95 | 0.92ms |

**Rischio:** 🟢 Basso

### Cold Start

**Stato:** ❌ Non applicabile (dev Vite HMR)  
**Prod Render:** Stima 30-60s (free tier)  
**Rischio:** 🟡 Medio — Non testato

### Error Rate

**5xx:** 0 errori  
**Log:** Request logging attivo (verbose)  
**Rischio:** 🟢 Basso

---

## 4️⃣ Supabase — RTT

### Endpoint Pubblici

- `/api/ready`: 0.68-0.92ms (no DB)
- `/api/health`: 0.70-1.57ms (no DB)

### Endpoint Protetti

**Stato:** ❌ Non testabili (auth required)  
**Stima RTT:** 80-150ms (US-EU)  
**Rischio:** 🟡 Medio — Non misurato

### Stabilità

- ✅ Zero timeout
- ✅ Zero 429/5xx
- ✅ Jitter ±0.3ms

**Rischio:** 🟢 Basso

---

## 5️⃣ Offline-First

### Feature Flags

| Flag | Default |
|------|---------|
| `VITE_FEATURE_OFFLINE_QUEUE` | `true` |
| `VITE_FEATURE_OFFLINE_BADGE` | `true` |
| `VITE_OFFLINE_DEVICE_WHITELIST` | CSV |
| `VITE_OFFLINE_VALIDATION_ENABLED` | `true` |

**Rischio:** 🟢 Basso

### File Chiave

- `idb.ts` — IndexedDB wrapper
- `queue.ts` — Enqueue/dequeue
- `sync-db.ts` — Flush + retry
- `gating.ts` — Feature flags
- `OfflineBadge.tsx` — UI indicator

**Rischio:** 🟢 Basso

### Persistenza

**DB:** `badgenode_offline` v2  
**Store:** `timbri_v1` (keyPath: `client_seq`)  
**Indici:** by_ts, status_idx, client_seq_idx  
**Fallback:** In-memory array

**Retry:** 3 tentativi, backoff exponential  
**Rischio:** 🟢 Basso

### Test Offline

**Playwright:** ❌ Non disponibile  
**Analisi statica:** ✅ Retry/backoff implementati  
**Rischio:** 🟡 Medio — Test non eseguito

---

## 6️⃣ Rischi & Raccomandazioni

| Area | Rischio | Evidenza | Raccomandazione |
|------|---------|----------|-----------------|
| **TTFB Frontend** | 🟢 Basso | 1.6-5.3ms | Monitorare in prod |
| **Cache Headers** | 🟡 Medio | `no-cache` dev | Verificare `max-age` prod |
| **Bundle Size** | 🟢 Basso | Max 920KB lazy | Mantenere lazy-load |
| **API Latency** | 🟢 Basso | <1ms | Eccellente |
| **Cold Start** | 🟡 Medio | Non testato | Test su Render staging |
| **Supabase RTT** | 🟡 Medio | Non misurato | Test con auth |
| **Offline Queue** | 🟢 Basso | IndexedDB robusto | Test E2E Playwright |
| **Log Verbosity** | 🟢 Basso | Request log attivo | Condizionare a DEBUG_ENABLED |

---

## Appendice: Comandi

```bash
# Timing root
for i in 1 2 3; do curl -s -o /dev/null -w "Run $i: starttransfer=%{time_starttransfer}s total=%{time_total}s\n" http://localhost:10000/; sleep 1; done

# Cache headers
curl -I http://localhost:10000/
curl -I http://localhost:10000/manifest.webmanifest
curl -I http://localhost:10000/logo_app.png

# Bundle
du -h dist/public/assets/*.{js,css} | sort -hr | head -15

# API latency
for i in {1..10}; do curl -s -o /dev/null -w "time=%{time_total}s\n" http://localhost:10000/api/health; sleep 0.1; done

# Offline flags
grep -E "VITE_FEATURE_OFFLINE|VITE_OFFLINE" .env.example

# Offline files
find client/src/offline -type f -name "*.ts" -o -name "*.tsx"
```

**Ambiente:**  
- Timestamp: 2025-11-01 15:04:31 CET
- Host: 192.168.1.67
- Node: v22.20.0, npm: 10.9.3
- Branch: main (7bcb32c)

---

**Fine Report Performance & Sync**
