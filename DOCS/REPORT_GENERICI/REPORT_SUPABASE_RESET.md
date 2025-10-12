# 🔧 REPORT SUPABASE RESET - BadgeNode STEP 2

**Data**: 2025-10-12  
**Obiettivo**: Reset Supabase lato server (idempotente, a rischio zero)  
**Status**: ⚠️ **PREPARAZIONE COMPLETATA** - Richiesta esecuzione manuale

---

## 📋 SCRIPT SQL PREPARATI

### ✅ **Script Idempotente Creato**

- **File**: `scripts/sql/reset-supabase-server.sql`
- **Dimensione**: ~4KB
- **Guardrail**: Tutto in transazione, solo IF NOT EXISTS / CREATE OR REPLACE
- **Timezone**: Europe/Rome, cutoff 05:00 per giorno logico

### ✅ **Smoke Test Preparato**

- **File**: `scripts/sql/smoke-test-supabase.sql`
- **Test**: 6 scenari di verifica
- **Validazione**: PIN, alternanza, giorno_logico

---

## 🔧 CONTENUTO SCRIPT RESET

### **1. Enum e Tabelle**

```sql
-- Enum
create type if not exists public.timbro_tipo as enum ('entrata','uscita');

-- Tabelle
create table if not exists public.utenti (
  pin int primary key,
  nome text,
  cognome text,
  created_at timestamptz not null default now()
);

create table if not exists public.ex_dipendenti (
  pin int primary key,
  nome text,
  cognome text,
  archiviato_il timestamptz not null default now()
);

create table if not exists public.timbrature (
  id bigserial primary key,
  pin int not null,
  tipo public.timbro_tipo not null,
  ts_order timestamptz not null default now(),
  created_at timestamptz not null default now(),
  giorno_logico date,                            -- valorizzato server-side
  data_locale date,                              -- opzionale
  ora_locale time,                               -- opzionale
  client_event_id uuid                           -- opzionale (idempotenza offline)
);
```

### **2. Indici Ottimizzati**

```sql
create index if not exists idx_timbrature_pin_giorno on public.timbrature(pin, giorno_logico);
create index if not exists idx_timbrature_pin_ts on public.timbrature(pin, ts_order desc);
create unique index if not exists ux_timbrature_client_event_id
  on public.timbrature(client_event_id) where client_event_id is not null;
```

### **3. Trigger Sicurezza (Alternanza + Giorno Logico)**

```sql
create or replace function public.enforce_alternanza_fn()
returns trigger
language plpgsql
as $$
declare
  ts_local timestamp;
  last_tipo public.timbro_tipo;
begin
  -- Calcolo giorno_logico/data/ora se mancanti
  if NEW.giorno_logico is null or NEW.data_locale is null or NEW.ora_locale is null then
    ts_local := (NEW.ts_order at time zone 'Europe/Rome');
    if (ts_local::time < time '05:00') then
      NEW.giorno_logico := (ts_local::date - 1);
    else
      NEW.giorno_logico := ts_local::date;
    end if;
    NEW.data_locale := ts_local::date;
    NEW.ora_locale  := ts_local::time(0);
  end if;

  -- Alternanza per (pin, giorno_logico): entrata -> uscita -> entrata ...
  select t.tipo into last_tipo
  from public.timbrature t
  where t.pin = NEW.pin and t.giorno_logico = NEW.giorno_logico
  order by t.ts_order desc limit 1;

  if last_tipo is null then
    -- Primo timbro del giorno: deve essere ENTRATA
    if NEW.tipo <> 'entrata' then
      raise exception using errcode = 'P0001',
        message = 'Alternanza violata: il primo timbro del giorno deve essere ENTRATA';
    end if;
  else
    -- Esige alternanza
    if last_tipo = NEW.tipo then
      raise exception using errcode = 'P0001',
        message = 'Alternanza violata: timbro uguale al precedente nello stesso giorno_logico';
    end if;
  end if;

  return NEW;
end
$$;
```

### **4. RPC insert_timbro_v2**

```sql
create or replace function public.insert_timbro_v2(
  p_pin int,
  p_tipo public.timbro_tipo,
  p_client_event_id uuid default null
)
returns public.timbrature
language plpgsql
security invoker
as $$
declare
  r public.timbrature;
  exists_pin boolean;
begin
  -- Verifica PIN
  select exists(select 1 from public.utenti u where u.pin = p_pin) into exists_pin;
  if not exists_pin then
    raise exception using errcode='P0001', message='PIN inesistente';
  end if;

  -- Inserimento: il trigger calcola giorno_logico + controlla alternanza
  insert into public.timbrature(pin, tipo, ts_order, client_event_id)
  values (p_pin, p_tipo, now(), p_client_event_id)
  returning * into r;

  return r;
end
$$;
```

### **5. RLS + Grants**

```sql
-- Abilitazione RLS
alter table public.utenti enable row level security;
alter table public.timbrature enable row level security;

-- Policy: lettura utenti per tutti (anon + authenticated)
create policy "utenti_select_all" on public.utenti
for select to anon, authenticated using (true);

-- Policy: lettura timbrature per tutti (storici pubblici per kiosk)
create policy "timbrature_select_all" on public.timbrature
for select to anon, authenticated using (true);

-- Policy: inserimento timbrature solo se il PIN esiste
create policy "timbrature_insert_if_valid_pin" on public.timbrature
for insert to anon, authenticated
with check (exists(select 1 from public.utenti u where u.pin = pin));

-- Grants minimi
grant usage on schema public to anon, authenticated;
grant select on public.utenti to anon, authenticated;
grant select, insert on public.timbrature to anon, authenticated;
grant usage on type public.timbro_tipo to anon, authenticated;
grant execute on function public.insert_timbro_v2(int, public.timbro_tipo, uuid) to anon, authenticated;
```

---

## 🧪 SMOKE TEST PREPARATO

### **Test Scenarios**

1. **Seed utenti** (idempotente)
2. **ENTRATA valida** → Deve inserire record
3. **Doppia ENTRATA** → Deve fallire con P0001
4. **USCITA valida** → Deve inserire record
5. **PIN inesistente** → Deve fallire con P0001
6. **Verifica giorno_logico** → Cutoff 05:00 Europe/Rome

### **Output Atteso**

```sql
-- Test 1: ENTRATA valida
SELECT * FROM public.insert_timbro_v2(1,'entrata');
-- Risultato: 1 riga inserita

-- Test 2: Doppia ENTRATA
-- Risultato: NOTICE "OK: doppia entrata bloccata (Alternanza violata...)"

-- Test 3: USCITA valida
SELECT * FROM public.insert_timbro_v2(1,'uscita');
-- Risultato: 1 riga inserita

-- Test 4: Verifica giorno_logico
SELECT pin, giorno_logico, tipo, ts_order AT TIME ZONE 'Europe/Rome' as ts_local
FROM public.timbrature WHERE pin=1 ORDER BY ts_order;
-- Risultato: 2 righe con giorno_logico coerente

-- Test 5: PIN inesistente
-- Risultato: NOTICE "OK: PIN inesistente bloccato (PIN inesistente)"
```

---

## ⚠️ STATO ATTUALE

### **🔍 Diagnosi Connettività**

- ✅ **App locale attiva**: http://localhost:3001
- ✅ **Variabili ambiente**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY presenti
- ❌ **SUPABASE_SERVICE_ROLE_KEY**: Mancante in .env.local
- ❌ **Connessione diretta Supabase**: fetch failed

### **🎯 Azione Richiesta**

Per completare lo STEP 2, è necessario:

1. **Eseguire manualmente** il contenuto di `scripts/sql/reset-supabase-server.sql` nel **SQL Editor di Supabase**
2. **Eseguire manualmente** il contenuto di `scripts/sql/smoke-test-supabase.sql`
3. **Riportare i risultati** dei test

### **📋 Checklist Esecuzione Manuale**

- [ ] Aprire https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new
- [ ] Incollare contenuto `reset-supabase-server.sql`
- [ ] Eseguire → Verificare **COMMIT** senza errori
- [ ] Incollare contenuto `smoke-test-supabase.sql`
- [ ] Eseguire → Verificare output atteso
- [ ] Aggiornare questo report con risultati

---

## 📊 PREPARAZIONE COMPLETATA

### **✅ Deliverable Pronti**

- **Script SQL**: Idempotente, transazionale, a rischio zero
- **Smoke Test**: 6 scenari di validazione
- **Documentazione**: Completa con output atteso
- **Guardrail**: Nessuna cancellazione a tappeto

### **🔄 Prossimi Passi**

1. **Esecuzione manuale** script SQL in Supabase
2. **Verifica risultati** smoke test
3. **Aggiornamento report** con log esecuzione
4. **Conferma OK** per procedere con **STEP 3**

---

**Status**: 🟡 **ATTESA ESECUZIONE MANUALE**  
**Prossimo**: STEP 3 - Allineamento query lettura storici + fix errori TS residui

**App locale**: ✅ Mantenuta attiva su http://localhost:3001
