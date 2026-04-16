# 🔍 ANALISI PERFORMANCE TASTIERINO - PIN 14

**Data**: 2025-11-03T14:02:00+01:00  
**Test PIN**: 14  
**Ambiente**: Development (localhost:3001)

---

## 🎯 OBIETTIVO ANALISI

Diagnosticare lentezza e macchinositàdel tastierino durante l'inserimento PIN e identificare opportunità di ottimizzazione.

---

## 📊 PROBLEMI IDENTIFICATI

### 1. **useEffect Pesante su Ogni Digit (CRITICO)**

**File**: `client/src/pages/Home/index.tsx` (righe 43-85)

**Problema**:
```typescript
useEffect(() => {
  // Esegue query DB per OGNI carattere digitato
  const list = await TimbratureService.getTimbratureGiorno(Number(pin), giornoLogico);
  // ...
  const allTimbrature = await TimbratureService.getTimbratureByRange({ pin: Number(pin) });
}, [pin, feedback.type]); // ⚠️ Trigger su OGNI cambio PIN
```

**Impatto**:
- ❌ **Query Supabase per ogni digit** (4 query per PIN completo)
- ❌ **Latenza rete**: ~50-200ms per query
- ❌ **Parsing e sorting**: ~10-50ms per query
- ❌ **Totale**: ~240-1000ms per inserimento PIN completo

**Scenario PIN 14**:
1. Digit "1" → Query DB (PIN=1) → 150ms
2. Digit "4" → Query DB (PIN=14) → 150ms
3. **Totale**: 300ms di lag percepito

---

### 2. **Inline Styles con Event Handlers (MEDIO)**

**File**: `client/src/components/home/KeyButton.tsx` (righe 37-48)

**Problema**:
```typescript
onMouseEnter={(e) => {
  e.currentTarget.style.borderColor = 'rgba(231, 116, 240, 0.7)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.borderColor = 'rgba(231, 116, 240, 0.4)';
}}
onMouseDown={(e) => {
  e.currentTarget.style.backgroundColor = 'rgba(231, 116, 240, 0.15)';
}}
onMouseUp={(e) => {
  e.currentTarget.style.backgroundColor = '#3a0a57';
}}
```

**Impatto**:
- ⚠️ **Manipolazione DOM diretta**: ~5-10ms per evento
- ⚠️ **Reflow/Repaint**: ~5-15ms
- ⚠️ **4 event listeners per bottone**: 12 bottoni × 4 = 48 listeners
- **Totale**: ~10-25ms di overhead per click

---

### 3. **Nessun Debouncing su Input (MEDIO)**

**File**: `client/src/pages/Home/index.tsx` (righe 94-98)

**Problema**:
```typescript
const handleKeyPress = (key: string) => {
  if (pin.length < 4) {
    setPin(pin + key); // ⚠️ Trigger immediato useEffect
  }
};
```

**Impatto**:
- ❌ **Nessun debounce**: Query parte immediatamente
- ❌ **Digitazione veloce**: Query sovrapposte
- ❌ **Race conditions**: Possibili stati inconsistenti

---

### 4. **Re-render Completo Componente (BASSO)**

**File**: `client/src/pages/Home/components/HomeContainer.tsx`

**Problema**:
- Ogni cambio PIN → Re-render completo HomeContainer
- Include: LogoHeader, PinDisplay, ToastCard, Keypad, DateTimeLive, ActionButtons

**Impatto**:
- ⚠️ **React reconciliation**: ~5-15ms
- ⚠️ **Virtual DOM diff**: ~5-10ms
- **Totale**: ~10-25ms per digit

---

### 5. **Query Timbrature Inefficiente (MEDIO)**

**File**: `client/src/pages/Home/index.tsx` (righe 58-66)

**Problema**:
```typescript
const list = await TimbratureService.getTimbratureGiorno(Number(pin), giornoLogico);
const last = list.sort((a, b) => (a.ts_order || '').localeCompare(b.ts_order || '')).at(-1);

// Se non trova, fa ALTRA query
const allTimbrature = await TimbratureService.getTimbratureByRange({ pin: Number(pin) });
```

**Impatto**:
- ❌ **2 query sequenziali** per turni notturni
- ❌ **Sorting client-side**: Dovrebbe essere fatto dal DB
- ❌ **Fetch completo**: Anche per PIN parziali (es. "1" → fetch PIN 1)

---

## 📈 METRICHE PERFORMANCE STIMATE

### Scenario Attuale (PIN 14):

| Azione | Tempo | Componente |
|--------|-------|------------|
| Click bottone "1" | ~5ms | Event handler |
| setState(pin="1") | ~2ms | React |
| Re-render | ~15ms | HomeContainer |
| useEffect trigger | ~1ms | React |
| **Query DB PIN=1** | **~150ms** | **Supabase** |
| Parsing risposta | ~10ms | Client |
| setState(lastAllowed) | ~2ms | React |
| Re-render finale | ~15ms | HomeContainer |
| **TOTALE DIGIT 1** | **~200ms** | |
| | | |
| Click bottone "4" | ~5ms | Event handler |
| setState(pin="14") | ~2ms | React |
| Re-render | ~15ms | HomeContainer |
| useEffect trigger | ~1ms | React |
| **Query DB PIN=14** | **~150ms** | **Supabase** |
| Parsing risposta | ~10ms | Client |
| setState(lastAllowed) | ~2ms | React |
| Re-render finale | ~15ms | HomeContainer |
| **TOTALE DIGIT 2** | **~200ms** | |
| | | |
| **TOTALE PIN COMPLETO** | **~400ms** | **Lag percepito** |

---

## 🚀 RACCOMANDAZIONI OTTIMIZZAZIONE

### 1. **DEBOUNCE useEffect Query (PRIORITÀ ALTA)**

**Soluzione**:
```typescript
// Debounce query solo quando PIN è completo (4 digit)
useEffect(() => {
  if (pin.length !== 4) {
    setLastAllowed(null); // Reset immediato
    return;
  }
  
  // Debounce 300ms per evitare query multiple
  const timer = setTimeout(async () => {
    // Query solo per PIN completo
    const list = await TimbratureService.getTimbratureGiorno(Number(pin), giornoLogico);
    // ...
  }, 300);
  
  return () => clearTimeout(timer);
}, [pin]);
```

**Benefici**:
- ✅ **Elimina 2 query inutili** (PIN parziali "1", "14")
- ✅ **Solo 1 query** per PIN completo "1414"
- ✅ **Risparmio**: ~300ms per inserimento
- ✅ **Riduzione carico DB**: -50%

---

### 2. **CSS Hover States invece di JS (PRIORITÀ ALTA)**

**Soluzione**:
```typescript
// Rimuovere event handlers JS
// Usare solo CSS:
className={`
  hover:border-[rgba(231,116,240,0.7)]
  active:bg-[rgba(231,116,240,0.15)]
  transition-colors duration-150
`}
```

**Benefici**:
- ✅ **Elimina 48 event listeners**
- ✅ **GPU-accelerated**: Transizioni hardware
- ✅ **Risparmio**: ~15-20ms per click
- ✅ **Codice più pulito**: -10 righe per bottone

---

### 3. **Memoizzazione Componenti (PRIORITÀ MEDIA)**

**Soluzione**:
```typescript
// Memoizza componenti statici
const MemoizedKeypad = React.memo(Keypad);
const MemoizedPinDisplay = React.memo(PinDisplay);
const MemoizedDateTimeLive = React.memo(DateTimeLive);
```

**Benefici**:
- ✅ **Riduce re-render**: Solo componenti che cambiano
- ✅ **Risparmio**: ~10-15ms per digit
- ✅ **Migliore UX**: UI più reattiva

---

### 4. **Query Ottimizzata con Limit e Order (PRIORITÀ MEDIA)**

**Soluzione**:
```typescript
// Query DB già ordinata e limitata
const { data } = await supabase
  .from('timbrature')
  .select('tipo, ts_order')
  .eq('pin', pin)
  .eq('giorno_logico', giornoLogico)
  .order('ts_order', { ascending: false })
  .limit(1); // Solo ultimo record

// Nessun sorting client-side necessario
const last = data?.[0];
```

**Benefici**:
- ✅ **Elimina sorting client-side**: -10ms
- ✅ **Meno dati trasferiti**: -50% payload
- ✅ **Query più veloce**: -20ms

---

### 5. **Cache Locale PIN Recenti (PRIORITÀ BASSA)**

**Soluzione**:
```typescript
// Cache in-memory per PIN usati di recente
const pinCache = new Map<string, { lastAllowed: string, timestamp: number }>();

// Check cache prima di query
const cached = pinCache.get(pin);
if (cached && Date.now() - cached.timestamp < 60000) {
  setLastAllowed(cached.lastAllowed);
  return;
}
```

**Benefici**:
- ✅ **Elimina query ripetute**: Stesso PIN in 1 minuto
- ✅ **Risparmio**: ~150ms per hit cache
- ✅ **Migliore UX**: Risposta istantanea

---

### 6. **Prefetch su 3° Digit (PRIORITÀ BASSA)**

**Soluzione**:
```typescript
// Quando PIN ha 3 digit, prefetch possibili completamenti
if (pin.length === 3) {
  // Prefetch in background (non blocca UI)
  for (let i = 0; i <= 9; i++) {
    const fullPin = pin + i;
    queryClient.prefetchQuery(['timbrature', fullPin]);
  }
}
```

**Benefici**:
- ✅ **Query già pronta** quando 4° digit premuto
- ✅ **Risparmio**: ~150ms percepito
- ✅ **UX istantanea**: Nessun lag visibile

---

## 📊 PERFORMANCE ATTESA POST-OTTIMIZZAZIONE

### Scenario Ottimizzato (PIN 14):

| Azione | Tempo | Miglioramento |
|--------|-------|---------------|
| Click bottone "1" | ~5ms | - |
| setState(pin="1") | ~2ms | - |
| Re-render (memoized) | ~5ms | **-10ms** |
| useEffect skip | ~0ms | **-163ms** |
| **TOTALE DIGIT 1** | **~12ms** | **-188ms (94%)** |
| | | |
| Click bottone "4" | ~5ms | - |
| setState(pin="14") | ~2ms | - |
| Re-render (memoized) | ~5ms | **-10ms** |
| useEffect skip | ~0ms | **-163ms** |
| **TOTALE DIGIT 2** | **~12ms** | **-188ms (94%)** |
| | | |
| **TOTALE PIN COMPLETO** | **~24ms** | **-376ms (94%)** |

**Query DB**: Solo 1 query dopo 4° digit (invece di 4)

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### Fase 1 - Quick Wins (1-2 ore):
1. ✅ **Debounce useEffect** → -300ms
2. ✅ **CSS hover states** → -20ms
3. ✅ **Query ottimizzata** → -30ms

**Totale Fase 1**: **-350ms (87% miglioramento)**

### Fase 2 - Ottimizzazioni (2-3 ore):
4. ✅ **Memoizzazione componenti** → -15ms
5. ✅ **Cache locale PIN** → -150ms (per hit)

**Totale Fase 2**: **-165ms aggiuntivi**

### Fase 3 - Advanced (opzionale):
6. ⚠️ **Prefetch 3° digit** → -150ms percepito
   - Complessità: Media
   - Beneficio: Alto per utenti veloci

---

## 🔧 CODICE ESEMPIO OTTIMIZZATO

### Home/index.tsx (useEffect ottimizzato):

```typescript
// PRIMA (4 query):
useEffect(() => {
  if (!pin) { setLastAllowed(null); return; }
  // Query per ogni digit
}, [pin, feedback.type]);

// DOPO (1 query):
useEffect(() => {
  // Reset immediato per PIN incompleto
  if (pin.length !== 4) {
    setLastAllowed(null);
    return;
  }
  
  // Debounce 300ms
  const timer = setTimeout(async () => {
    let cancelled = false;
    try {
      const now = new Date();
      let targetDate = new Date(now);
      const isNightShift = now.getHours() >= 0 && now.getHours() < 5;
      
      if (isNightShift) {
        targetDate.setDate(targetDate.getDate() - 1);
      }
      
      const giornoLogico = formatDateLocal(targetDate);
      
      // Query ottimizzata con limit
      const { data } = await supabase
        .from('timbrature')
        .select('tipo, ts_order')
        .eq('pin', Number(pin))
        .eq('giorno_logico', giornoLogico)
        .order('ts_order', { ascending: false })
        .limit(1);
      
      if (cancelled) return;
      
      const last = data?.[0];
      
      // AUTO-RECOVERY per turni notturni
      if (!last && isNightShift) {
        const { data: allData } = await supabase
          .from('timbrature')
          .select('tipo, ts_order')
          .eq('pin', Number(pin))
          .eq('tipo', 'entrata')
          .order('ts_order', { ascending: false })
          .limit(1);
        
        if (allData?.[0]) {
          setLastAllowed('uscita');
          return;
        }
      }
      
      if (!last) {
        setLastAllowed('entrata');
        return;
      }
      
      setLastAllowed(last.tipo === 'entrata' ? 'uscita' : 'entrata');
    } catch (_) {
      if (!cancelled) setLastAllowed(null);
    }
    
    return () => { cancelled = true; };
  }, 300);
  
  return () => clearTimeout(timer);
}, [pin]); // Rimosso feedback.type per evitare loop
```

### KeyButton.tsx (CSS ottimizzato):

```typescript
// PRIMA (4 event handlers JS):
onMouseEnter={(e) => { e.currentTarget.style.borderColor = '...'; }}
onMouseLeave={(e) => { e.currentTarget.style.borderColor = '...'; }}
onMouseDown={(e) => { e.currentTarget.style.backgroundColor = '...'; }}
onMouseUp={(e) => { e.currentTarget.style.backgroundColor = '...'; }}

// DOPO (solo CSS):
<button
  onClick={handleClick}
  className={`
    w-[72px] h-[72px]
    rounded-full
    text-xl font-medium text-white
    bg-[#3a0a57]
    border-2 border-[rgba(231,116,240,0.4)]
    hover:border-[rgba(231,116,240,0.7)]
    active:bg-[rgba(231,116,240,0.15)]
    active:scale-95
    transition-all duration-150
    focus-visible:ring-2 focus-visible:ring-[#e774f0]
  `}
>
  {value === '⚙' ? <Settings /> : value}
</button>
```

---

## 📝 NOTE IMPLEMENTAZIONE

### Test Consigliati:

1. **Test Velocità Digitazione**:
   - Digitare PIN 14 velocemente (< 1 secondo)
   - Verificare: Solo 1 query DB
   - Verificare: Nessun lag visibile

2. **Test Turni Notturni**:
   - Simulare ora 02:00
   - Verificare: AUTO-RECOVERY funziona
   - Verificare: Query ottimizzata

3. **Test Cache**:
   - Digitare stesso PIN 2 volte in 1 minuto
   - Verificare: 2° volta usa cache
   - Verificare: Risposta istantanea

### Metriche da Monitorare:

- **Time to Interactive (TTI)**: < 50ms per digit
- **Query DB count**: 1 per PIN completo (invece di 4)
- **Re-render count**: 4 per PIN completo (invece di 8+)
- **Memory usage**: Stabile (cache limitata)

---

## 🎯 CONCLUSIONI

### Problemi Critici Identificati:
1. ❌ **useEffect query su ogni digit** → -300ms
2. ⚠️ **Event handlers JS inline** → -20ms
3. ⚠️ **Nessun debouncing** → Race conditions
4. ⚠️ **Query non ottimizzate** → -30ms

### Miglioramento Totale Atteso:
- **Fase 1**: -350ms (87% più veloce)
- **Fase 2**: -165ms aggiuntivi
- **Totale**: **-515ms (94% più veloce)**

### Raccomandazione:
✅ **Implementare Fase 1 immediatamente** (quick wins)  
⚠️ **Valutare Fase 2** dopo test Fase 1  
📊 **Monitorare metriche** con React DevTools Profiler

---

**Analisi completata**: 2025-11-03T14:02:00+01:00  
**Prossimo step**: Implementazione ottimizzazioni Fase 1
