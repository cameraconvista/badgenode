# 📋 APPENDIX — Recovery Procedures Dettagliate

**File principale**: [STATO_SUPABASE_WINDSURF_2025-10-10.md](STATO_SUPABASE_WINDSURF_2025-10-10.md)  
**Data**: 2025-10-10

---

## 🔧 Complete System Recovery

### **Step 1: Repository Setup**
```bash
# Clone repository
git clone https://github.com/cameraconvista/badgenode.git
cd badgenode

# Install dependencies
npm ci

# Copy environment file
cp .env.example .env.local
# Edit .env.local with valid Supabase keys
```

### **Step 2: Environment Configuration**
```bash
# Required variables in .env.local
VITE_SUPABASE_URL=https://hjbungtedtgffmnficmp.supabase.co
VITE_SUPABASE_ANON_KEY=[your_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]
```

### **Step 3: Database Verification**
```bash
# Test connection
npm run dev
# Check console for Supabase connection logs
```

### **Step 4: RPC Deploy (if needed)**
```bash
# Option A: CLI
supabase link --project-ref hjbungtedtgffmnficmp
supabase db push

# Option B: Dashboard SQL Editor
# Copy content from supabase/migrations/20251009T2300__create_insert_timbro_v2.sql
# Execute in Supabase Dashboard
```

### **Step 5: Full Functionality Test**
- Navigate to Storico Timbrature
- Verify multi-session display
- Check console for RPC v2/v1 logs
- Test timbrature entry/exit flow

---

## 🔄 Partial Recovery (Code Only)

### **Quick Update**
```bash
# Pull latest changes
git pull origin main

# Clean dependencies
rm -rf node_modules package-lock.json
npm ci

# Verify build
npm run check
npm run build

# Restart development
npm run dev
```

### **Troubleshooting Build Issues**
```bash
# TypeScript errors
npm run check

# File size governance
find client/src -name "*.ts*" -exec wc -l {} + | awk '$1 > 200'

# Dependencies audit
npm audit
npm update

# Force clean build
npm run build --force
```

---

## 🗄️ Database Recovery (RPC)

### **Backup Current State**
1. Supabase Dashboard → Settings → Database
2. Export → Full backup
3. Save locally before changes

### **Apply Migration v2**
```sql
-- Via SQL Editor in Supabase Dashboard
-- Copy full content from:
-- supabase/migrations/20251009T2300__create_insert_timbro_v2.sql

-- Verify creation
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'insert_timbro_v2';

-- Test permissions
SELECT has_function_privilege('anon', 'insert_timbro_v2(integer, text)', 'EXECUTE');
```

### **Verify Client Switch**
```bash
# Start app and check console
npm run dev

# Look for logs:
# - No "[RPC v2] fallback" = v2 active
# - "[RPC v2] Funzione non disponibile, fallback a legacy" = v1 active
```

### **Rollback if Issues**
```sql
-- Remove v2 (client automatically falls back to v1)
DROP FUNCTION IF EXISTS public.insert_timbro_v2(integer, text);
```

---

## 🚨 Emergency Procedures

### **App Completely Down**
```bash
# Check port availability
lsof -i :3001

# Kill existing processes
pkill -f "node.*3001"

# Restart clean
npm run dev
```

### **Database Connection Lost**
1. Check Supabase status page
2. Verify network connectivity
3. Regenerate API keys if needed
4. Update .env.local with new keys

### **Build Failures**
```bash
# Nuclear option - complete reset
rm -rf node_modules package-lock.json
rm -rf dist build
npm ci
npm run build
```

### **Data Corruption**
1. Stop all operations
2. Restore from latest backup
3. Verify data integrity
4. Resume operations with monitoring

---

## 📊 Monitoring & Health Checks

### **Daily Checks**
- App responds on http://localhost:3001
- Console clean (no critical errors)
- RPC v2 active (no fallback logs)
- Build passes (`npm run check`)

### **Weekly Checks**
- Dependencies audit (`npm audit`)
- File size governance check
- Backup rotation verification
- Performance monitoring

### **Monthly Checks**
- Full system backup
- Documentation updates
- Security patches
- Performance optimization review
