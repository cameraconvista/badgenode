# 🔍 REPORT DIAGNOSI MULTI-SESSIONE GIORNO LOGICO

**Data**: 2025-10-09  
**Obiettivo**: Abilitare gestione multi-sessione per giorno logico + sotto-righe visualizzazione  
**Stato**: DIAGNOSI COMPLETATA - Piano chirurgico pronto  

---

## ✅ DOCUMENTI DI RIFERIMENTO VERIFICATI

### **Documenti Letti e Analizzati**
- ✅ **`DOCS/DOC IMPORTANTI/DOCUMENTAZIONE_LOGICA_GIORNO_LOGICO.md`** (136 righe)
- ✅ **`DOCS/07_logica_giorno_logico.md`** (136 righe, identico)

### **Specifiche Estratte**
- **Multi-sessione**: Più coppie Entrata/Uscita nello stesso giorno logico
- **Algoritmo pairing**: Entrata → prima Uscita successiva disponibile
- **Visualizzazione**: Sotto-righe sessioni sotto riga principale giorno
- **Layout invariato**: Nessun cambio HTML/CSS strutturale
- **Totali**: Basati su somma ore giornaliere, non duplicazione sotto-righe

---

## 🔍 ANALISI STATO ATTUALE

### **Architettura Corrente**
```
Query timbrature → aggregateTimbratureByGiornoLogico() → TurnoFull[]
                                                      ↓
                   StoricoTable → 1 riga per giorno logico
                                                      ↓
                              Footer totali (calcolaTotali)
```

### **Limitazioni Identificate**

#### **1. Aggregazione Semplificata**
**File**: `client/src/lib/storico/aggregate.ts` (88 righe)  
**Problema**: Funzione `aggregateTimbratureByGiornoLogico()` calcola solo:
- Prima entrata globale
- Ultima uscita globale  
- Ore totali (ultima - prima)

**Manca**: 
- Pairing Entrata→Uscita per sessioni individuali
- Array sessioni per sotto-righe
- Gestione sessioni aperte (entrata senza uscita)

#### **2. Tipo Dati Insufficiente**
**File**: `client/src/services/storico.service.ts` (124 righe)  
**Problema**: `TurnoFull` contiene solo riepilogo giorno:
```typescript
export type TurnoFull = {
  pin: number;
  giorno: string;
  entrata: string | null;  // Prima entrata
  uscita: string | null;   // Ultima uscita  
  ore: number;             // Totale giorno
  extra: number;
};
```

**Manca**: Array sessioni individuali

#### **3. Visualizzazione Monolitica**
**File**: `client/src/components/storico/StoricoTable.tsx` (133 righe)  
**Problema**: Rendering 1:1 con array `TurnoFull[]`:
```typescript
{giorni.map((giorno, index) => (
  <div key={giorno.giorno}>  // 1 riga per giorno
    {/* Colonne giorno */}
  </div>
))}
```

**Manca**: Logica per intercalare sotto-righe sessioni

---

## 📐 PIANO CHIRURGICO PROPOSTO

### **STEP 1: Nuovi Tipi e Interfacce**

#### **File**: `client/src/lib/storico/types.ts` (NUOVO - 45 righe stimato)
```typescript
// Nuovi tipi per multi-sessione
export interface SessioneTimbratura {
  numeroSessione: number;
  entrata: string | null;    // "HH:MM:SS" 
  uscita: string | null;     // "HH:MM:SS" o null se aperta
  ore: number;               // Ore sessione (0 se aperta)
  isAperta: boolean;         // true se uscita mancante
}

export interface GiornoLogicoDettagliato {
  pin: number;
  giorno: string;            // YYYY-MM-DD
  mese_label: string;
  // Riepilogo giorno (invariato per compatibilità)
  entrata: string | null;    // Prima entrata
  uscita: string | null;     // Ultima uscita
  ore: number;               // Totale ore giorno
  extra: number;
  // NUOVO: Dettaglio sessioni
  sessioni: SessioneTimbratura[];
}

export interface StoricoRowData {
  type: 'giorno' | 'sessione';
  giorno?: GiornoLogicoDettagliato;  // Se type='giorno'
  sessione?: SessioneTimbratura;     // Se type='sessione'
  giornoParent?: string;             // Se type='sessione', riferimento giorno
}
```

### **STEP 2: Algoritmo Pairing Sessioni**

#### **File**: `client/src/lib/storico/pairing.ts` (NUOVO - 85 righe stimato)
```typescript
import { TimbratureRaw } from './aggregate';
import { SessioneTimbratura } from './types';

/**
 * Algoritmo pairing Entrata→Uscita per giorno logico
 * Segue spec: ogni entrata → prima uscita successiva disponibile
 */
export function pairSessionsForGiorno(
  timbrature: TimbratureRaw[]
): SessioneTimbratura[] {
  // 1. Ordina per (ore, created_at)
  const sorted = timbrature.sort((a, b) => {
    const oreCompare = a.ore.localeCompare(b.ore);
    return oreCompare !== 0 ? oreCompare : a.created_at.localeCompare(b.created_at);
  });
  
  // 2. Pairing sequenziale
  const sessioni: SessioneTimbratura[] = [];
  const used = new Set<number>();
  let numeroSessione = 1;
  
  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i) || sorted[i].tipo !== 'entrata') continue;
    
    const entrata = sorted[i];
    used.add(i);
    
    // Cerca prima uscita successiva disponibile
    let uscita: TimbratureRaw | null = null;
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j) || sorted[j].tipo !== 'uscita') continue;
      uscita = sorted[j];
      used.add(j);
      break;
    }
    
    // Calcola ore sessione
    let ore = 0;
    let isAperta = !uscita;
    
    if (uscita) {
      ore = calculateSessionHours(entrata.ore, uscita.ore, entrata.giornologico);
    }
    
    sessioni.push({
      numeroSessione: numeroSessione++,
      entrata: entrata.ore,
      uscita: uscita?.ore || null,
      ore,
      isAperta
    });
  }
  
  return sessioni;
}

function calculateSessionHours(entrataOre: string, uscitaOre: string, giorno: string): number {
  // Implementazione calcolo ore con gestione turni notturni
  // (simile a logica esistente in aggregate.ts)
}
```

### **STEP 3: Aggiornamento Aggregazione**

#### **File**: `client/src/lib/storico/aggregate.ts` (MODIFICA - da 88 → ~120 righe)
**Sezioni da modificare**:

**Righe 29-33**: Aggiornare firma funzione
```typescript
// PRIMA:
export function aggregateTimbratureByGiornoLogico(
  timbrature: TimbratureRaw[], 
  pin: number, 
  oreContrattuali: number = 8
): TurnoFull[]

// DOPO:
export function aggregateTimbratureByGiornoLogico(
  timbrature: TimbratureRaw[], 
  pin: number, 
  oreContrattuali: number = 8
): GiornoLogicoDettagliato[]  // Nuovo tipo di ritorno
```

**Righe 51-86**: Aggiornare logica aggregazione
```typescript
// Aggiungere dopo riga 51:
import { pairSessionsForGiorno } from './pairing';

// Sostituire righe 51-86:
return Object.entries(grouped).map(([giorno, data]) => {
  // Combina entrate e uscite per pairing
  const allTimbrature = [...data.entrate, ...data.uscite];
  
  // Calcola sessioni con pairing
  const sessioni = pairSessionsForGiorno(allTimbrature);
  
  // Calcola totali giorno (solo sessioni chiuse)
  const sessioniChiuse = sessioni.filter(s => !s.isAperta);
  const oreTotali = sessioniChiuse.reduce((acc, s) => acc + s.ore, 0);
  const extra = Math.max(0, oreTotali - oreContrattuali);
  
  // Prima entrata e ultima uscita (per compatibilità)
  const primaEntrata = sessioni[0]?.entrata || null;
  const ultimaUscita = sessioni
    .filter(s => !s.isAperta)
    .slice(-1)[0]?.uscita || null;
  
  return {
    pin,
    giorno,
    mese_label: getMeseItaliano(giorno),
    entrata: primaEntrata,
    uscita: ultimaUscita,
    ore: oreTotali,
    extra,
    sessioni  // NUOVO: Array sessioni
  };
});
```

### **STEP 4: Aggiornamento Service**

#### **File**: `client/src/services/storico.service.ts` (MODIFICA - da 124 → ~140 righe)
**Sezioni da modificare**:

**Righe 1-3**: Aggiornare import
```typescript
import { normalizeDate, aggregateTimbratureByGiornoLogico } from '@/lib/storico/aggregate';
import { GiornoLogicoDettagliato, StoricoRowData } from '@/lib/storico/types';
```

**Righe 30-35**: Aggiornare firma loadTurniFull
```typescript
export async function loadTurniFull(
  pin: number,
  dal: string,
  al: string,
  oreContrattuali: number = 8
): Promise<GiornoLogicoDettagliato[]>  // Nuovo tipo ritorno
```

**Righe 58**: Aggiornare chiamata aggregazione (tipo ritorno cambiato)

**Righe 71-82**: Aggiornare mapping giorni vuoti
```typescript
const result: GiornoLogicoDettagliato[] = allDays.map(day => {
  const existing = dbResult.find((r: GiornoLogicoDettagliato) => r.giorno === day);
  return existing || {
    pin,
    giorno: day,
    mese_label: getMeseItaliano(day),
    entrata: null,
    uscita: null,
    ore: 0,
    extra: 0,
    sessioni: []  // NUOVO: Array vuoto per giorni senza timbrature
  };
});
```

**Righe 112-123**: Aggiornare calcolaTotali per compatibilità
```typescript
export function calcolaTotali(turni: (TurnoGiornaliero | TurnoFull | GiornoLogicoDettagliato)[]) {
  // Logica invariata, usa sempre campi .ore e .extra del riepilogo giorno
}
```

### **STEP 5: Trasformazione Dataset per Visualizzazione**

#### **File**: `client/src/lib/storico/dataset.ts` (NUOVO - 65 righe stimato)
```typescript
import { GiornoLogicoDettagliato, StoricoRowData } from './types';

/**
 * Trasforma array giorni in dataset per tabella con sotto-righe
 * Intercala: riga giorno → righe sessioni → riga giorno → ...
 */
export function buildStoricoDataset(
  giorni: GiornoLogicoDettagliato[]
): StoricoRowData[] {
  const dataset: StoricoRowData[] = [];
  
  for (const giorno of giorni) {
    // Riga principale giorno
    dataset.push({
      type: 'giorno',
      giorno
    });
    
    // Sotto-righe sessioni (solo se ci sono sessioni)
    if (giorno.sessioni.length > 0) {
      for (const sessione of giorno.sessioni) {
        dataset.push({
          type: 'sessione',
          sessione,
          giornoParent: giorno.giorno
        });
      }
    }
  }
  
  return dataset;
}
```

### **STEP 6: Aggiornamento Visualizzazione**

#### **File**: `client/src/pages/StoricoTimbrature.tsx` (MODIFICA - da 176 → ~185 righe)
**Sezioni da modificare**:

**Righe 1-7**: Aggiornare import
```typescript
import { loadTurniFull } from '@/services/storico.service';
import { buildStoricoDataset } from '@/lib/storico/dataset';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
```

**Righe 67-74**: Aggiornare query type
```typescript
const { 
  data: turniGiornalieri = [], 
  isLoading: isLoadingTimbrature
} = useQuery({
  queryKey: ['turni-completi', filters],
  queryFn: () => loadTurniFull(filters.pin, filters.dal, filters.al, dipendente?.ore_contrattuali || 8),
  enabled: !!dipendente
}) as { data: GiornoLogicoDettagliato[], isLoading: boolean };
```

**Dopo riga 74**: Aggiungere trasformazione dataset
```typescript
// Trasforma in dataset con sotto-righe
const storicoDataset = useMemo(() => 
  buildStoricoDataset(turniGiornalieri), 
  [turniGiornalieri]
);
```

**Righe 125-135**: Aggiornare props StoricoTable
```typescript
<StoricoTable
  timbrature={turniGiornalieri}        // Mantieni per totali
  storicoDataset={storicoDataset}      // NUOVO: Dataset con sotto-righe
  filters={filters}
  oreContrattuali={dipendente?.ore_contrattuali || 8}
  onEditTimbrature={handleEditTimbrature}
  isLoading={isLoadingTimbrature}
/>
```

### **STEP 7: Aggiornamento Componente Tabella**

#### **File**: `client/src/components/storico/StoricoTable.tsx` (MODIFICA - da 133 → ~180 righe)
**Sezioni da modificare**:

**Righe 1-9**: Aggiornare import
```typescript
import { StoricoRowData, GiornoLogicoDettagliato } from '@/lib/storico/types';
```

**Righe 11-17**: Aggiornare interface props
```typescript
interface StoricoTableProps {
  timbrature: GiornoLogicoDettagliato[];     // Per totali (invariato)
  storicoDataset: StoricoRowData[];          // NUOVO: Dataset con sotto-righe
  filters: { dal: string; al: string };
  oreContrattuali: number;
  onEditTimbrature: (giornologico: string) => void;
  isLoading?: boolean;
}
```

**Righe 19-25**: Aggiornare destructuring props
```typescript
export default function StoricoTable({ 
  timbrature,           // Per totali
  storicoDataset,       // NUOVO: Per rendering righe
  filters, 
  oreContrattuali, 
  onEditTimbrature, 
  isLoading 
}: StoricoTableProps) {
```

**Righe 61-122**: Sostituire logica rendering
```typescript
// SOSTITUIRE:
{giorni.map((giorno, index) => (
  // Riga singola giorno
))}

// CON:
{storicoDataset.map((row, index) => {
  if (row.type === 'giorno') {
    return renderRigaGiorno(row.giorno!, index);
  } else {
    return renderRigaSessione(row.sessione!, row.giornoParent!, index);
  }
})}
```

**Dopo riga 122**: Aggiungere funzioni render
```typescript
// Funzione render riga giorno (logica esistente)
function renderRigaGiorno(giorno: GiornoLogicoDettagliato, index: number) {
  return (
    <div key={`giorno-${giorno.giorno}`} className={/* classi esistenti */}>
      {/* Colonne esistenti invariate */}
    </div>
  );
}

// NUOVA: Funzione render riga sessione
function renderRigaSessione(sessione: SessioneTimbratura, giornoParent: string, index: number) {
  return (
    <div key={`sessione-${giornoParent}-${sessione.numeroSessione}`} 
         className="grid grid-cols-7 gap-4 p-2 border-b border-gray-600/30 text-sm bg-gray-800/20">
      {/* Data - vuota */}
      <div></div>
      
      {/* Mese - indicatore sessione */}
      <div className="text-gray-400 text-xs">
        #{sessione.numeroSessione}
      </div>
      
      {/* Entrata sessione */}
      <div className="text-center">
        <span className="text-white/70">{formatTimeOrDash(sessione.entrata)}</span>
      </div>
      
      {/* Uscita sessione */}
      <div className="text-center">
        <span className="text-white/70">
          {sessione.isAperta ? '—' : formatTimeOrDash(sessione.uscita)}
        </span>
      </div>
      
      {/* Ore sessione */}
      <div className="text-center tabular-nums">
        <span className="text-white/70">{formatOre(sessione.ore)}</span>
      </div>
      
      {/* Extra - vuoto per sessioni */}
      <div></div>
      
      {/* Modifica - vuoto per sessioni */}
      <div></div>
    </div>
  );
}
```

---

## 📊 STIMA IMPATTI

### **File Modificati**
| File | Righe Attuali | Righe Stimate | Diff | Tipo |
|------|---------------|---------------|------|------|
| `client/src/lib/storico/types.ts` | 0 | 45 | +45 | NUOVO |
| `client/src/lib/storico/pairing.ts` | 0 | 85 | +85 | NUOVO |
| `client/src/lib/storico/dataset.ts` | 0 | 65 | +65 | NUOVO |
| `client/src/lib/storico/aggregate.ts` | 88 | 120 | +32 | MODIFICA |
| `client/src/services/storico.service.ts` | 124 | 140 | +16 | MODIFICA |
| `client/src/pages/StoricoTimbrature.tsx` | 176 | 185 | +9 | MODIFICA |
| `client/src/components/storico/StoricoTable.tsx` | 133 | 180 | +47 | MODIFICA |

**Totale**: +299 righe (3 nuovi file, 4 modifiche)

### **Governance File Length**
- ✅ Tutti i file restano sotto 200 righe
- ✅ Logica modulare ben separata
- ✅ Nessun file monolitico

---

## ⚠️ RISCHI E MITIGAZIONI

### **Rischi Identificati**

#### **1. Compatibilità Tipi**
**Rischio**: Cambio tipo ritorno `loadTurniFull()` può rompere altri componenti  
**Mitigazione**: 
- Mantenere campi compatibili in `GiornoLogicoDettagliato`
- Aggiornare `calcolaTotali()` per accettare entrambi i tipi
- Test regressione su tutti i componenti che usano storico

#### **2. Performance Rendering**
**Rischio**: Più righe DOM possono rallentare rendering con molte sessioni  
**Mitigazione**:
- Virtualizzazione se necessario (React Window)
- Lazy loading sotto-righe (espandibili on-demand)
- Limite massimo sessioni per giorno (es. 10)

#### **3. Complessità Pairing**
**Rischio**: Algoritmo pairing può produrre risultati inattesi con dati irregolari  
**Mitigazione**:
- Log dettagliati con prefisso `[StoricoPairDiag]` in dev
- Test unitari per tutti gli edge case
- Fallback a logica esistente in caso di errore

#### **4. Layout Responsive**
**Rischio**: Sotto-righe possono rompere allineamento su mobile  
**Mitigazione**:
- Riutilizzo stesso grid 7 colonne
- Test su tutte le breakpoint
- Classi responsive esistenti

### **Piano Rollback**
1. **Backup pre-implementazione**: `npm run esegui:backup`
2. **Feature flag**: Variabile env per abilitare/disabilitare multi-sessione
3. **Fallback code**: Mantenere logica esistente commentata
4. **Rollback rapido**: Git revert + deploy in <5 minuti

---

## 🧪 TEST PLAN OBBLIGATORIO

### **Test Funzionali (8 scenari)**
1. **Diurno semplice**: 09:00–17:00 → 1 sessione, 1 sotto-riga
2. **Notturno**: 22:00–02:00 → 1 sessione, stesso giorno logico
3. **Multi-sessione**: 09–11 + 13–17 → 2 sessioni, 2 sotto-righe
4. **Sessione aperta**: Entrata senza uscita → sotto-riga con "—"
5. **Range inclusivo**: Ultimo giorno mese incluso
6. **PIN equivalenti**: "01" ≡ 1 → stesso risultato
7. **Timezone safety**: Nessuna deriva cambio fuso
8. **Performance**: Mese completo <2s

### **Test Edge Cases**
- Sequenze irregolari (E-E-U-U)
- Duplicati stesso orario
- Turni >16h
- Giorni senza timbrature
- Molte sessioni (>5 per giorno)

### **Test Regressione**
- Totali footer invariati
- Export PDF/XLS funzionanti
- Modale edit timbrature
- Real-time updates
- Responsive layout

---

## 🔐 SICUREZZA E GOVERNANCE

### **Pre-Implementazione**
- ✅ **Backup**: `npm run esegui:backup` → `backup_2025.10.09_21.XX.tar`
- ✅ **Branch**: Creare `feature/multi-sessione-giorno-logico`
- ✅ **Log diagnosi**: Prefisso `[StoricoPairDiag]` (rimuovere in produzione)

### **Durante Implementazione**
- ✅ **File length**: Monitoraggio continuo ≤200 righe
- ✅ **TypeScript**: 0 errori compilazione
- ✅ **Test**: Esecuzione completa prima di commit

### **Post-Implementazione**
- ✅ **Cleanup**: Rimozione log diagnosi
- ✅ **Performance**: Verifica <2s caricamento
- ✅ **Documentation**: Aggiornamento README se necessario

---

## ✅ CRITERIO COMPLETAMENTO STEP 1

### **Deliverable Prodotti**
- ✅ **Report diagnosi**: Questo documento completo
- ✅ **Piano chirurgico**: File/righe esatte identificate
- ✅ **Stima impatti**: 299 righe, 7 file coinvolti
- ✅ **Test plan**: 8 scenari funzionali + edge cases
- ✅ **Rollback plan**: Backup + feature flag + fallback

### **Validazioni Effettuate**
- ✅ **Documenti riferimento**: Entrambi letti e analizzati
- ✅ **Codice esistente**: Architettura compresa
- ✅ **Vincoli rispettati**: Layout invariato, file ≤200 righe
- ✅ **Nessun runtime diff**: Solo diagnosi, nessuna implementazione

---

## 🚀 PROSSIMO STEP

**STEP 2: IMPLEMENTAZIONE** (solo dopo approvazione)
1. Backup automatico
2. Creazione nuovi file types/pairing/dataset
3. Modifica file esistenti secondo piano
4. Test completi (8 scenari + edge cases)
5. Cleanup log diagnosi
6. Commit e push

**Tempo stimato implementazione**: 2-3 ore  
**Rischio**: Basso (piano dettagliato, rollback pronto)

---

**🎯 DIAGNOSI COMPLETATA - PIANO CHIRURGICO PRONTO PER APPROVAZIONE**
