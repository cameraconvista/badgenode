# 📊 SNAPSHOT SUPABASE/WINDSURF — BadgeNode

**Data**: 2025-10-10  
**Versione**: v1.0  
**Scopo**: Snapshot configurazione per recovery/troubleshooting

---

## 🗄️ Supabase Configuration

### **Project Details**
- **Project Ref**: `hjbungtedtgffmnficmp`
- **URL**: `https://hjbungtedtgffmnficmp.supabase.co`
- **Region**: Auto-assigned
- **Tier**: Free/Pro (da verificare in dashboard)

### **Database Functions**

#### **Funzioni Attive**
- ✅ **`insert_timbro_rpc`** (v1 legacy)
  - **Stato**: Attiva in produzione
  - **Permessi**: `anon`, `authenticated`, `service_role`
  - **Problemi**: Alternanza errata entry/exit

#### **Funzioni da Deployare**
- ❌ **`insert_timbro_v2`** (v2 corretta)
  - **Stato**: Migration pronta, deploy bloccato
  - **File**: `supabase/migrations/20251009T2300__create_insert_timbro_v2.sql`
  - **Permessi attesi**: `anon`, `authenticated`, `service_role`

### **Checklist Verifica Rapida**

#### **SQL Queries Dashboard**
```sql
-- 1. Lista funzioni timbrature
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE 'insert_timbro%';

-- 2. Verifica permessi v2 (post-deploy)
SELECT has_function_privilege('anon', 'insert_timbro_v2(integer, text)', 'EXECUTE');
SELECT has_function_privilege('authenticated', 'insert_timbro_v2(integer, text)', 'EXECUTE');

-- 3. Test chiamata v2 (post-deploy)
SELECT * FROM insert_timbro_v2(7, 'entrata');
```

#### **Expected Results**
- **Pre-deploy**: Solo `insert_timbro_rpc` presente
- **Post-deploy**: Entrambe le funzioni presenti, permessi `true`

---

## 🛠️ Windsurf/Cascade Environment

### **Governance Attiva**
- **File limit**: ≤200 righe (hard limit)
- **Warning**: ≥150 righe
- **Backup**: Rotazione automatica 3 copie in `ARCHIVE/`
- **Modularità**: Componenti separati per funzionalità

### **Branching Strategy**
- **Main**: Produzione stabile
- **Feature branches**: `feature/nome-funzionalità`
- **Merge**: No-fast-forward con commit descrittivo
- **Cleanup**: Branch feature eliminati post-merge

### **Build Requirements**
- **TypeScript**: 0 errori compilazione
- **ESLint**: Warnings accettabili, no errori
- **File structure**: Modularità rispettata
- **Performance**: Build <30s, dev server <5s startup

### **Scripts Disponibili**
```bash
# Backup automatico
npm run esegui:backup

# Check compilazione
npm run check

# Dev server
npm run dev

# Build produzione
npm run build
```

---

## 🔧 Configurazione Locale

### **Environment Variables**
```bash
# Supabase (da .env.local)
VITE_SUPABASE_URL=https://hjbungtedtgffmnficmp.supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]
```

### **Database Access**
- **Client**: Supabase JS SDK
- **Auth**: Service role per operazioni admin
- **RLS**: Row Level Security attiva
- **Realtime**: Subscription su tabella `timbrature`

### **Local Development**
- **Port**: 3001 (Express + Vite)
- **Hot reload**: Attivo su file changes
- **Proxy**: Browser preview disponibile
- **Console**: Clean, no errori SW o 404

---

## 🚨 Fallback Operativo

### **RPC v2 Assente**
- **Comportamento**: Client fallback automatico a v1
- **Log**: `[RPC v2] Funzione non disponibile, fallback a legacy`
- **Funzionalità**: App completamente funzionante (alternanza errata ma stabile)
- **Azione**: Nessuna interruzione servizio

### **Database Issues**
- **Connection**: Retry automatico Supabase client
- **Timeout**: 30s default, configurabile
- **Offline**: PWA cache per UI, sync al reconnect
- **Backup**: Dati locali in localStorage per recovery

### **Build Failures**
- **TypeScript**: Fix errori prima deploy
- **Dependencies**: `npm ci` per clean install
- **Cache**: `npm run build --force` se problemi cache
- **Rollback**: Git revert + redeploy precedente

---

## 📋 Checklist Troubleshooting

### **App Non Risponde**
- [ ] Verifica porta 3001 libera: `lsof -i :3001`
- [ ] Check process: `ps aux | grep node`
- [ ] Restart: `npm run dev`
- [ ] Browser cache: Hard refresh (Cmd+Shift+R)

### **RPC Errors**
- [ ] Console log per identificare v1/v2
- [ ] Supabase dashboard → SQL Editor test
- [ ] Verifica permessi funzioni
- [ ] Check migration status

### **Build Issues**
- [ ] `npm run check` per TypeScript
- [ ] File size governance: `find . -name "*.ts*" -exec wc -l {} +`
- [ ] Dependencies: `npm audit` e `npm update`
- [ ] Clean: `rm -rf node_modules && npm ci`

### **Database Connectivity**
- [ ] Supabase status page
- [ ] Network connectivity
- [ ] API keys validity
- [ ] RLS policies check

---

## 🔗 Quick Links

### **Supabase Dashboard**
- **Project**: https://supabase.com/dashboard/project/hjbungtedtgffmnficmp
- **SQL Editor**: https://supabase.com/dashboard/project/hjbungtedtgffmnficmp/sql
- **Functions**: https://supabase.com/dashboard/project/hjbungtedtgffmnficmp/database/functions

### **Local Development**
- **App**: http://localhost:3001
- **Browser Preview**: Disponibile via Windsurf
- **Console**: DevTools per debug client-side

### **Documentation**
- **RPC**: `DOCS/RPC/README_RPC_TIMBRATURE.md`
- **Giorno Logico**: `DOCS/07_logica_giorno_logico.md`
- **Reports**: `DOCS/REPORT_GENERICI/REPORT_*_20251009.md`

---

## 📝 Recovery Procedures

**Dettagli completi**: Vedi [STATO_SUPABASE_WINDSURF_2025-10-10_APPENDIX.md](STATO_SUPABASE_WINDSURF_2025-10-10_APPENDIX.md)

### **Quick Recovery**
1. **System**: Clone repo → `npm ci` → copy `.env.local`
2. **Code**: `git pull` → clean install → `npm run dev`
3. **Database**: Apply migration → verify functions → test client

---

## 🧾 Changelog

- **v1.0 — 2025-10-10**: Snapshot iniziale configurazione Supabase/Windsurf, procedure recovery.
