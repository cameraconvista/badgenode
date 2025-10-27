# Environment Setup — BadgeNode

**Guida completa per configurazione variabili ambiente in sviluppo locale e produzione**

---

## 🎯 Panoramica

BadgeNode utilizza variabili ambiente per configurare:
- **Connessione Supabase** (database e autenticazione)
- **Feature flags** (offline queue, badge diagnostici)
- **Configurazioni runtime** (porte, modalità debug)

### **Architettura ENV**

- **Client-side** (Vite): Solo variabili con prefisso `VITE_*`
- **Server-side** (Node.js): Accesso completo a `process.env.*`
- **Sicurezza**: Chiavi sensibili (`SERVICE_ROLE_KEY`, `DATABASE_URL`) solo server-side

---

## 🔧 Setup Locale (Sviluppo)

### **1. Crea file `.env.local`**

```bash
# Dalla root del progetto
cp .env.local.sample .env.local
```

### **2. Configura credenziali Supabase**

Modifica `.env.local` con i dati reali:

```bash
# === Supabase Configuration ===
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.your-project:password@host:6543/postgres

# === Offline Queue (solo test locale) ===
VITE_FEATURE_OFFLINE_QUEUE=false  # true per test offline
VITE_FEATURE_OFFLINE_BADGE=false  # true per badge diagnostico
VITE_OFFLINE_DEVICE_WHITELIST=    # vuoto = disabilitato

# === Build/Node ===
NODE_ENV=development
```

### **3. Ottieni credenziali Supabase**

1. **Dashboard Supabase** → Settings → API
2. **Project URL**: `VITE_SUPABASE_URL`
3. **anon public**: `VITE_SUPABASE_ANON_KEY`
4. **service_role**: `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **SENSIBILE**
5. **Database URL**: Settings → Database → Connection string

### **4. Avvia sviluppo**

```bash
npm run dev
```

**Verifica**: App disponibile su http://localhost:10000

---

## 🧪 Test Offline Queue

Per testare la funzionalità offline:

### **Setup Rapido**
```bash
# Usa template pre-configurato
cp .env.offline-test.sample .env.local
# Aggiungi credenziali Supabase reali
# Riavvia: npm run dev
```

### **Configurazione Manuale**
```bash
# Nel file .env.local
VITE_FEATURE_OFFLINE_QUEUE=true
VITE_FEATURE_OFFLINE_BADGE=true
VITE_OFFLINE_DEVICE_WHITELIST=*  # Solo test locale!
```

### **Verifica Diagnostica**
```javascript
// Console browser
(() => {
  const d = window.__BADGENODE_DIAG__;
  return {
    enabled: d?.offline?.enabled ?? null,
    allowed: d?.offline?.allowed ?? null,
    deviceId: d?.offline?.deviceId ?? null
  };
})();
```

**Atteso**: `enabled: true`, `allowed: true`, `deviceId` valorizzato

---

## 🚀 Produzione (Render)

### **Configurazione Dashboard Render**

**Environment Variables** (Settings → Environment):

```bash
# === Supabase (REQUIRED) ===
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# === Production Config ===
NODE_ENV=production
PORT=10000

# === Feature Flags (OPTIONAL) ===
VITE_FEATURE_OFFLINE_QUEUE=false  # Default OFF
# VITE_OFFLINE_DEVICE_WHITELIST=tablet-001,tablet-002  # Solo se necessario

# === Monitoring (OPTIONAL) ===
# READ_ONLY_MODE=0  # 1 per disabilitare scritture
# APP_VERSION=v1.0.0
# BUILD_TIME=2025-01-01T00:00:00Z
```

### **⚠️ Sicurezza Produzione**

- **MAI** usare `VITE_OFFLINE_DEVICE_WHITELIST=*` in produzione
- **Service Role Key** solo in variabili Render (mai nel codice)
- **Database URL** gestita automaticamente da Supabase

---

## 📋 Variabili Supportate

### **Client-side (VITE_\*)**

| Variabile | Tipo | Descrizione |
|-----------|------|-------------|
| `VITE_SUPABASE_URL` | **Required** | URL progetto Supabase |
| `VITE_SUPABASE_ANON_KEY` | **Required** | Chiave pubblica Supabase |
| `VITE_FEATURE_OFFLINE_QUEUE` | Optional | Abilita coda offline (`true`/`false`) |
| `VITE_FEATURE_OFFLINE_BADGE` | Optional | Badge diagnostico DEV (`true`/`false`) |
| `VITE_OFFLINE_DEVICE_WHITELIST` | Optional | Lista device abilitati (`*` o `id1,id2`) |
| `VITE_APP_VERSION` | Optional | Versione app per diagnostica |

### **Server-side (process.env)**

| Variabile | Tipo | Descrizione |
|-----------|------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Required** | Chiave admin Supabase ⚠️ |
| `DATABASE_URL` | Optional | URL database PostgreSQL |
| `NODE_ENV` | Optional | Ambiente (`development`/`production`) |
| `PORT` | Optional | Porta server (default: 10000) |
| `READ_ONLY_MODE` | Optional | Disabilita scritture (`1`/`0`) |
| `APP_VERSION` | Optional | Versione per endpoint `/api/version` |
| `BUILD_TIME` | Optional | Timestamp build |
| `COMMIT_SHA` | Optional | Hash commit Git |

---

## 🔒 Sicurezza

### **File da NON committare**
- `.env.local` (credenziali reali)
- `.env.production` (se presente)
- `.env.*.local` (backup locali)

### **File committabili**
- `.env.local.sample` (solo placeholder)
- `.env.offline-test.sample` (solo placeholder)
- `.env.example` (documentazione)

### **⚠️ Rotazione Chiavi**

Se chiavi sensibili sono mai finite nel repository:

1. **Supabase Dashboard** → Settings → API → **Regenerate service_role key**
2. **Aggiorna** `.env.local` e variabili Render
3. **Riavvia** applicazioni

---

## 🛠️ Troubleshooting

### **Errore: Missing Supabase environment variables**
```bash
# Verifica file .env.local esiste e contiene:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### **Errore: Service admin non disponibile**
```bash
# Verifica SERVICE_ROLE_KEY valida
# Dashboard Supabase → Settings → API → service_role
```

### **Offline queue non funziona**
```bash
# Verifica feature flags
VITE_FEATURE_OFFLINE_QUEUE=true
VITE_OFFLINE_DEVICE_WHITELIST=*  # Solo test locale
```

### **Debug ENV in browser**
```javascript
// Console DevTools
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  offline: import.meta.env.VITE_FEATURE_OFFLINE_QUEUE,
  env: import.meta.env.MODE
});
```

### **Debug ENV server**
```bash
# GET /api/debug/env (solo development)
curl http://localhost:10000/api/debug/env
```

---

## 📚 Riferimenti

- **Vite ENV**: https://vitejs.dev/guide/env-and-mode.html
- **Supabase API Keys**: https://supabase.com/docs/guides/api/api-keys
- **Render Environment**: https://render.com/docs/environment-variables

---

**Documento creato**: 2025-10-27  
**Versione**: BadgeNode Enterprise v5.0  
**Ambiente**: Sviluppo locale + Produzione Render
