# 📘 BADGENODE - DOCUMENTAZIONE MASTER

**Versione:** 2.0 • **Data:** 2025-10-09 • **Stato:** Production Ready

---

## 🧭 VISIONE D'INSIEME

**BadgeNode** è una **PWA mobile-first** per la gestione delle **timbrature** dei dipendenti tramite **PIN (1-99)**, con sezione **Admin** desktop-first.

### **Architettura Generale**

- **PWA mobile-first** per timbrature dipendenti tramite PIN (1-99)
- **Admin desktop-first** per gestione utenti e storico
- **Backend**: Supabase PostgreSQL + Realtime + RLS
- **Frontend**: React + TypeScript + Vite + Tailwind + Radix UI
- **Timezone**: Europe/Rome (no UTC conversions)

### **Stack Tecnico**

- React 18.3.1 + TypeScript 5.6.3
- Vite 5.4.20 + PWA plugin
- Supabase 2.74.0 + Realtime
- Radix UI + Tailwind CSS
- Express server + Drizzle ORM
- Wouter router + React Query

---

## 🏗️ STRUTTURA PROGETTO

### **Struttura Pagine**

1. **Home (/)** - Tastierino PIN + timbrature live
2. **Storico (/storico-timbrature)** - Report mensili con ore extra e export PDF/XLS
3. **Admin Utenti (/archivio-dipendenti)** - Gestione dipendenti (solo PIN 1909)
4. **Ex-Dipendenti** - Archivio con export storico
5. **Login (/login)** - Autenticazione admin

### **Routing Ottimizzato**

```
/login → /archivio-dipendenti → /storico-timbrature/:pin → /storico-timbrature → / → *
```

### **Cartelle Principali**

```
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/     # Componenti UI organizzati per funzione
│   │   ├── pages/          # Pagine principali dell'app
│   │   ├── services/       # Servizi API e business logic
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility e configurazioni
│   │   └── contexts/       # React contexts
├── server/                 # Backend Express + Supabase
├── scripts/                # Utility e automazione
├── shared/                 # Tipi condivisi
├── DOCS/                   # Documentazione
└── Backup_Automatico/      # Sistema backup automatico
```

---

## 🎨 DESIGN SYSTEM

### **Palette Colori**

- **Primario**: Viola #510357, Rosa #e774f0, Bianco #ffffff
- **Stati**: Verde (entrata), Rosso (uscita), Giallo (ore extra)
- **Temi**: Dark/Light coerenti con contrasto AA

### **UX Guidelines**

- **Mobile**: Portrait-first, touch targets 44px+
- **Desktop**: Admin interface ottimizzata
- **PWA**: Installabile, offline-capable

---

## 🗄️ DATABASE SCHEMA

### **Tabelle Principali**

```sql
-- Utenti attivi
utenti: pin(PK), nome, cognome, ore_contrattuali(8.00), email, telefono

-- Timbrature
timbrature: id, pin(FK), tipo(entrata/uscita), data, ore, giornologico, created_at

-- Vista aggregata per storico
v_turni_giornalieri: vista aggregata per storico

-- Ex dipendenti archiviati
ex_dipendenti: archivio dipendenti con data archiviazione
```

### **Logica Giorno Logico**

- **Entrate 00:00-04:59** → giorno logico = giorno precedente
- **Uscite 00:00-04:59** → stesso giorno logico dell'entrata se turno notturno
- **Calcolo ore**: prima entrata → ultima uscita del giorno logico
- **Ore Extra**: Math.max(0, ore_lavorate - ore_contrattuali)

---

## ⚙️ CONFIGURAZIONE SVILUPPO

### **Environment Variables**

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# .env.production.local (solo per admin server)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Scripts Principali**

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "esegui:backup": "tsx scripts/backup.ts",
  "lint": "eslint . --ext ts,tsx",
  "check": "tsc -p tsconfig.json --noEmit"
}
```

### **Build Configuration**

- **Root**: `client/`
- **Output**: `dist/public/`
- **Base**: `/`
- **Alias**: `@` → `client/src`, `@shared` → `shared`

---

## 🔧 GOVERNANCE CODICE

### **Limiti e Regole**

- **Limite rigido**: 200 righe per file (pre-commit hook)
- **Warning**: ≥150 righe
- **ESLint + Prettier** attivi
- **TypeScript strict mode**

### **Sistema Backup**

- **Rotazione automatica**: 3 copie in `Backup_Automatico/`
- **Nomenclatura**: `backup_YYYY.MM.DD_HH.MM.tar`
- **Comando**: `npm run esegui:backup`

### **Ottimizzazioni Implementate**

- Singleton Supabase client
- Icone canonicalizzate in `/assets/icons/`
- Service Worker guard su porta 8080 e Render
- Anti-reload loop con debounce 10s
- Users stabilizer con exponential backoff

---

## 🚀 DEPLOY E PRODUZIONE

### **Configurazione Render**

- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist/public`
- **Rewrite Rule**: `/* → /index.html`

### **Stato Attuale**

- ✅ **Console pulita** senza errori SW o 404
- ✅ **Pagina Storico** completamente funzionante
- ✅ **PIN dinamico** operativo
- ✅ **Integrazione Supabase** ottimizzata
- ✅ **Build production-ready**

---

## 📋 CHECKLIST MANUTENZIONE

### **Prima di ogni deploy**

1. ✅ Lint: 0 errori (warning entro baseline)
2. ✅ TypeCheck: 0 errori
3. ✅ Build: successo frontend
4. ✅ Test dev server: funzionante
5. ✅ Backup automatico eseguito
6. ✅ Tag Git creato

### **Monitoraggio Post-Deploy**

- Console browser pulita
- Routing funzionante su tutte le pagine
- Timbrature salvate correttamente
- Storico accessibile con PIN dinamico
- PWA installabile

---

## 🔗 RIFERIMENTI RAPIDI

### **URL Principali**

- **Dev**: `http://localhost:3001`
- **Prod**: `https://badgenode.onrender.com`

### **Comandi Utili**

```bash
# Sviluppo
npm run dev
npm run esegui:backup

# Produzione
npm run build
npm run start

# Manutenzione
npm run lint
npm run check
npm run diagnose
```

### **File Configurazione Chiave**

- `vite.config.ts` - Build e alias
- `tailwind.config.ts` - Styling
- `drizzle.config.ts` - Database
- `eslint.config.js` - Linting
- `package.json` - Scripts e dipendenze

---

**Ultimo aggiornamento**: 2025-10-09 19:46  
**Tag corrente**: `bonifica-chirurgica-finale`  
**Backup**: `backup_2025.10.09_19.33.tar`
