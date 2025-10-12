# 🗄️ BADGENODE - SQL REFERENCE & DATABASE

**Riferimento completo per database, policies e configurazioni Supabase**  
**Versione**: 2.0 • **Data**: 2025-10-09

---

## 🏗️ SCHEMA DATABASE

### **Tabelle Principali**

#### **utenti** - Dipendenti Attivi

```sql
CREATE TABLE utenti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pin INTEGER UNIQUE NOT NULL CHECK (pin >= 1 AND pin <= 99),
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    ore_contrattuali DECIMAL(4,2) DEFAULT 8.00,
    email VARCHAR(255),
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **timbrature** - Registrazioni Entrate/Uscite

```sql
CREATE TABLE timbrature (
    id BIGSERIAL PRIMARY KEY,
    pin INTEGER NOT NULL REFERENCES utenti(pin) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
    data DATE NOT NULL,
    ore TIME NOT NULL,
    giornologico DATE NOT NULL, -- Calcolato con logica turni notturni
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **ex_dipendenti** - Archivio Dipendenti

```sql
CREATE TABLE ex_dipendenti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pin INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    ore_contrattuali DECIMAL(4,2),
    email VARCHAR(255),
    telefono VARCHAR(20),
    archiviato_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    motivo_archiviazione TEXT
);
```

---

## 📊 VISTE AGGREGATE

### **v_turni_giornalieri** - Vista Principale Storico

```sql
CREATE VIEW v_turni_giornalieri AS
SELECT
    t.pin,
    u.nome,
    u.cognome,
    t.giornologico,
    MIN(CASE WHEN t.tipo = 'entrata' THEN t.ore END) as prima_entrata,
    MAX(CASE WHEN t.tipo = 'uscita' THEN t.ore END) as ultima_uscita,
    CASE
        WHEN MIN(CASE WHEN t.tipo = 'entrata' THEN t.ore END) IS NOT NULL
        AND MAX(CASE WHEN t.tipo = 'uscita' THEN t.ore END) IS NOT NULL
        THEN EXTRACT(EPOCH FROM (
            MAX(CASE WHEN t.tipo = 'uscita' THEN t.ore END) -
            MIN(CASE WHEN t.tipo = 'entrata' THEN t.ore END)
        )) / 3600.0
        ELSE 0
    END as ore_lavorate,
    u.ore_contrattuali,
    GREATEST(0,
        CASE
            WHEN MIN(CASE WHEN t.tipo = 'entrata' THEN t.ore END) IS NOT NULL
            AND MAX(CASE WHEN t.tipo = 'uscita' THEN t.ore END) IS NOT NULL
            THEN EXTRACT(EPOCH FROM (
                MAX(CASE WHEN t.tipo = 'uscita' THEN t.ore END) -
                MIN(CASE WHEN t.tipo = 'entrata' THEN t.ore END)
            )) / 3600.0 - u.ore_contrattuali
            ELSE 0
        END
    ) as ore_extra
FROM timbrature t
JOIN utenti u ON t.pin = u.pin
GROUP BY t.pin, u.nome, u.cognome, t.giornologico, u.ore_contrattuali
ORDER BY t.giornologico DESC, t.pin;
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### **Policies Utenti**

```sql
-- Abilita RLS
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;

-- Policy lettura per tutti (ANON_KEY)
CREATE POLICY "utenti_read_all" ON utenti
FOR SELECT USING (true);

-- Policy inserimento/aggiornamento per admin
CREATE POLICY "utenti_admin_write" ON utenti
FOR ALL USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);
```

### **Policies Timbrature**

```sql
-- Abilita RLS
ALTER TABLE timbrature ENABLE ROW LEVEL SECURITY;

-- Policy lettura per tutti
CREATE POLICY "timbrature_read_all" ON timbrature
FOR SELECT USING (true);

-- Policy inserimento per tutti (timbrature dipendenti)
CREATE POLICY "timbrature_insert_all" ON timbrature
FOR INSERT WITH CHECK (true);

-- Policy aggiornamento/eliminazione solo admin
CREATE POLICY "timbrature_admin_modify" ON timbrature
FOR UPDATE USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "timbrature_admin_delete" ON timbrature
FOR DELETE USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);
```

### **Policies Ex-Dipendenti**

```sql
-- Abilita RLS
ALTER TABLE ex_dipendenti ENABLE ROW LEVEL SECURITY;

-- Policy lettura per admin
CREATE POLICY "ex_dipendenti_admin_read" ON ex_dipendenti
FOR SELECT USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);

-- Policy scrittura per admin
CREATE POLICY "ex_dipendenti_admin_write" ON ex_dipendenti
FOR ALL USING (
    auth.role() = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
);
```

---

## ⚡ STORED PROCEDURES (RPC)

### **insert_timbro_rpc** - Inserimento Timbratura

```sql
CREATE OR REPLACE FUNCTION insert_timbro_rpc(
    p_pin INTEGER,
    p_tipo VARCHAR(10)
) RETURNS BIGINT AS $$
DECLARE
    v_data DATE;
    v_ora TIME;
    v_giorno_logico DATE;
    v_id BIGINT;
BEGIN
    -- Ottieni data e ora correnti (timezone Europe/Rome)
    v_data := CURRENT_DATE;
    v_ora := CURRENT_TIME;

    -- Calcola giorno logico
    IF v_ora >= '00:00:00' AND v_ora < '05:00:00' THEN
        v_giorno_logico := v_data - INTERVAL '1 day';
    ELSE
        v_giorno_logico := v_data;
    END IF;

    -- Validazioni business logic
    IF p_tipo = 'entrata' THEN
        -- Verifica che non ci sia già un'entrata senza uscita
        IF EXISTS (
            SELECT 1 FROM timbrature
            WHERE pin = p_pin
            AND giornologico = v_giorno_logico
            AND tipo = 'entrata'
            AND NOT EXISTS (
                SELECT 1 FROM timbrature t2
                WHERE t2.pin = p_pin
                AND t2.giornologico = v_giorno_logico
                AND t2.tipo = 'uscita'
                AND t2.created_at > timbrature.created_at
            )
        ) THEN
            RAISE EXCEPTION 'Hai già fatto entrata per oggi';
        END IF;
    END IF;

    IF p_tipo = 'uscita' THEN
        -- Verifica che ci sia un'entrata precedente
        IF NOT EXISTS (
            SELECT 1 FROM timbrature
            WHERE pin = p_pin
            AND giornologico = v_giorno_logico
            AND tipo = 'entrata'
        ) THEN
            RAISE EXCEPTION 'Devi prima fare entrata';
        END IF;

        -- Verifica che non ci sia già un'uscita dopo l'ultima entrata
        IF EXISTS (
            SELECT 1 FROM timbrature
            WHERE pin = p_pin
            AND giornologico = v_giorno_logico
            AND tipo = 'uscita'
            AND created_at > (
                SELECT MAX(created_at) FROM timbrature
                WHERE pin = p_pin
                AND giornologico = v_giorno_logico
                AND tipo = 'entrata'
            )
        ) THEN
            RAISE EXCEPTION 'Hai già fatto uscita';
        END IF;
    END IF;

    -- Inserisci timbratura
    INSERT INTO timbrature (pin, tipo, data, ore, giornologico)
    VALUES (p_pin, p_tipo, v_data, v_ora, v_giorno_logico)
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **upsert_utente_rpc** - Gestione Utenti

```sql
CREATE OR REPLACE FUNCTION upsert_utente_rpc(
    p_pin INTEGER,
    p_nome VARCHAR(100),
    p_cognome VARCHAR(100)
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Upsert utente
    INSERT INTO utenti (pin, nome, cognome)
    VALUES (p_pin, p_nome, p_cognome)
    ON CONFLICT (pin) DO UPDATE SET
        nome = EXCLUDED.nome,
        cognome = EXCLUDED.cognome,
        updated_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📈 INDICI PERFORMANCE

### **Indici Principali**

```sql
-- Indice per ricerche per PIN
CREATE INDEX idx_timbrature_pin ON timbrature(pin);

-- Indice per ricerche per giorno logico
CREATE INDEX idx_timbrature_giornologico ON timbrature(giornologico);

-- Indice composto per query storico
CREATE INDEX idx_timbrature_pin_giorno ON timbrature(pin, giornologico);

-- Indice per ordinamento temporale
CREATE INDEX idx_timbrature_created_at ON timbrature(created_at);

-- Indice per PIN utenti (già UNIQUE)
CREATE UNIQUE INDEX idx_utenti_pin ON utenti(pin);
```

### **Statistiche e Manutenzione**

```sql
-- Aggiorna statistiche per ottimizzatore
ANALYZE utenti;
ANALYZE timbrature;
ANALYZE ex_dipendenti;

-- Verifica utilizzo indici
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 🔧 CONFIGURAZIONI SUPABASE

### **Environment Variables**

```bash
# Client (pubbliche)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Server (private)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Configurazione Client**

```typescript
// client/src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon);
```

### **Configurazione Server**

```typescript
// server/supabase.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(url, serviceKey);
```

---

## 🚨 TROUBLESHOOTING

### **Errori Comuni**

#### **Error 42883: Function does not exist**

```sql
-- Verifica esistenza RPC
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%timbro%';
```

#### **Error 42501: Permission denied**

```sql
-- Verifica policies attive
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

#### **Performance Issues**

```sql
-- Analizza query lente
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%timbrature%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### **Comandi Diagnostici**

```sql
-- Verifica connessioni attive
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Dimensioni tabelle
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ultimo backup
SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
```

---

## 📋 CHECKLIST MANUTENZIONE

### **Settimanale**

- [ ] Verifica performance query principali
- [ ] Controllo dimensioni database
- [ ] Backup policies verificate

### **Mensile**

- [ ] Analisi indici utilizzati
- [ ] Pulizia log vecchi (se applicabile)
- [ ] Verifica RLS policies

### **Trimestrale**

- [ ] Review schema per ottimizzazioni
- [ ] Aggiornamento statistiche
- [ ] Test disaster recovery

---

**Ultimo aggiornamento**: 2025-10-09 19:46  
**Schema version**: 2.0  
**Compatibilità**: Supabase PostgreSQL 15+
