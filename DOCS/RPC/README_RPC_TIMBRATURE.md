# 🔧 RPC TIMBRATURE — BadgeNode

**Data**: 2025-10-10  
**Versione**: v1.0  
**Autore**: BadgeNode • Revisione tecnica Cascade

---

## 🎯 Panoramica

Sistema di **Remote Procedure Calls** per gestione timbrature con **alternanza corretta** Entrata/Uscita e **giorno logico Europe/Rome**.

### **RPC Disponibili**
- **`insert_timbro_rpc`** (v1 legacy) — Alternanza errata, attiva in produzione
- **`insert_timbro_v2`** (v2 corretta) — **Deploy bloccato**, client con fallback automatico

---

## 📊 Stato Attuale

### **Client Behavior**
```typescript
// 1. TENTATIVO RPC v2 (alternanza corretta)
const { data, error } = await supabase.rpc('insert_timbro_v2', { p_pin, p_tipo });

// 2. FALLBACK AUTOMATICO a v1 (se v2 non esiste)
if (error?.code === '42883') {
  console.warn('[RPC v2] Funzione non disponibile, fallback a legacy');
  // Usa insert_timbro_rpc (v1)
}
```

### **Log Console**
- **`[RPC v2] Funzione non disponibile, fallback a legacy`** → v2 non deployata
- **Nessun log specifico** → v2 attiva e funzionante

---

## 🔄 RPC v1 (Legacy) — `insert_timbro_rpc`

### **Problemi Noti**
- ❌ **Alternanza errata**: Blocca sequenze valide `entry → exit → entry`
- ❌ **Timezone inconsistente**: Possibili derive su calcolo giorno logico
- ❌ **Logica invertita**: Controlli alternanza non conformi a spec

### **Stato**
- ✅ **Attiva in produzione**
- ✅ **Permessi**: `anon`, `authenticated`, `service_role`
- ⚠️ **Mantieni per compatibilità** fino a deploy v2

---

## 🚀 RPC v2 (Corretta) — `insert_timbro_v2`

### **Miglioramenti**
- ✅ **Alternanza corretta**: Basata su ultimo timestamp per PIN/giorno logico
- ✅ **Timezone coerente**: `Europe/Rome` in tutti i calcoli
- ✅ **Ordinamento stabile**: `ORDER BY giornologico DESC, ore DESC, created_at DESC`
- ✅ **Giorno logico spec**: 00:00-04:59 → giorno precedente

### **Logica Core**
1. **Calcolo giorno logico** con timezone Europe/Rome
2. **Query ultimo timbro** per PIN/giorno logico con ordinamento stabile
3. **Validazione alternanza** entry ↔ exit basata su ultimo tipo
4. **Insert atomico** con dati coerenti

### **Stato Deploy**
- ❌ **Non deployata**: Mancanza accesso diretto database
- ✅ **Migration pronta**: `supabase/migrations/20251009T2300__create_insert_timbro_v2.sql`
- ✅ **Rollback pronto**: `supabase/migrations/20251009T2300__create_insert_timbro_v2.down.sql`

---

## 🛠️ Deploy Manuale

### **Prerequisiti**
- Accesso **Supabase Dashboard** o **CLI configurato**
- Permessi **admin** su database

### **Procedura CLI**
```bash
# 1. Link progetto (se non fatto)
supabase link --project-ref hjbungtedtgffmnficmp

# 2. Apply migration
supabase db push

# 3. Verifica deploy
supabase db diff
```

### **Procedura Dashboard**
1. **Supabase Dashboard** → SQL Editor
2. **Copia contenuto** da `supabase/migrations/20251009T2300__create_insert_timbro_v2.sql`
3. **Esegui query** per creare funzione
4. **Verifica permessi** anon/authenticated/service_role

### **Permessi Richiesti**
```sql
GRANT EXECUTE ON FUNCTION public.insert_timbro_v2(integer, text) 
TO anon, authenticated, service_role;
```

---

## 🧪 Test Post-Deploy

### **Sequenze Test**
1. **Diurno**: `entry 09:00 → exit 17:00 → entry 09:00 (+1 giorno)`
2. **Notturno**: `entry 22:00 → exit 02:00 → entry 22:00 (+1 giorno)`
3. **Multi-sessione**: `entry → exit → entry → exit` (stesso giorno logico)
4. **Errori alternanza**: `entry → entry` (deve fallire)

### **Verifica Console**
- **Nessun log `[RPC v2] fallback`** → v2 attiva
- **Alternanza corretta** senza errori "già fatto entrata/uscita"

---

## 🔙 Rollback

### **Procedura Sicura**
```sql
-- Rimuove RPC v2 (client torna automaticamente a v1)
DROP FUNCTION IF EXISTS public.insert_timbro_v2(integer, text);
```

### **Verifica Rollback**
- **Console log**: `[RPC v2] Funzione non disponibile, fallback a legacy`
- **Funzionalità**: App continua con v1 (alternanza errata ma stabile)

---

## 📋 Checklist Operativa

### **Pre-Deploy**
- [ ] Backup database completo
- [ ] Test app in locale con v1 funzionante
- [ ] Migration files presenti e validati

### **Deploy**
- [ ] Esegui migration v2
- [ ] Verifica permessi funzione
- [ ] Test sequenze timbrature
- [ ] Monitor console log (no fallback)

### **Post-Deploy**
- [ ] Test multi-sessione completo
- [ ] Verifica alternanza corretta
- [ ] Monitor errori produzione
- [ ] Documentazione aggiornata

---

## 📚 Riferimenti

### **Migration Files**
- `supabase/migrations/20251009T2300__create_insert_timbro_v2.sql`
- `supabase/migrations/20251009T2300__create_insert_timbro_v2.down.sql`

### **Report Diagnostici**
- `REPORT_DIAGNOSI_RPC_TIMBRA_20251009.md`
- `REPORT_FIX_RPC_TIMBRA_20251009.md`
- `REPORT_BLOCCO_RPC_V2_20251009.md`

### **Documentazione Correlata**
- `DOCS/07_logica_giorno_logico.md` (v2.1)
- `DOCS/REPORT_GENERICI/STATO_SUPABASE_WINDSURF_2025-10-10.md`

---

## 🧾 Changelog

- **v1.0 — 2025-10-10**: Documentazione iniziale RPC v1/v2, stato deploy, procedure manuali.
