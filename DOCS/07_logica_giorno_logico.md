# 07 📅 LOGICA GIORNO LOGICO - BadgeNode

**Descrizione concettuale della logica business per turni notturni**  
**Versione**: 2.0 • **Data**: 2025-10-09 • **Stato**: Non implementata

---

## 📋 Contenuti

1. [Concetto Base](#concetto-base)
2. [Regole Business](#regole-business)
3. [Esempi Pratici](#esempi-pratici)
4. [Calcolo Ore](#calcolo-ore)
5. [Implementazione Futura](#implementazione-futura)

---

## 🧠 Concetto Base

### **Definizione Giorno Logico**
```
Il "giorno logico" è una convenzione per gestire turni di lavoro 
che attraversano la mezzanotte, permettendo di calcolare 
correttamente le ore lavorate per turni notturni.

Problema risolto:
- Turno 22:00-06:00 → span su 2 giorni calendario
- Necessità di raggruppare come singolo turno
- Calcolo ore corretto (8 ore, non 6+2)

Soluzione:
- Giorno logico basato su orario entrata
- Soglia: 05:00 (configurabile)
- Timbrature 00:00-04:59 → giorno precedente
```

### **Timeline Concettuale**
```
Giorno Calendario:  |-- 2025-10-09 --|-- 2025-10-10 --|
Orario:            00:00    12:00    00:00    12:00    00:00
                     |        |        |        |        |
Giorno Logico A:     |<------- 2025-10-09 ------>|
Giorno Logico B:                      |<------- 2025-10-10 ------>

Soglia: 05:00
- 00:00-04:59 → appartiene al giorno logico precedente
- 05:00-23:59 → appartiene al proprio giorno calendario
```

---

## 📏 Regole Business

### **Regola 1: Assegnazione Giorno Logico**
```
IF orario_timbratura >= 00:00 AND orario_timbratura < 05:00 THEN
    giorno_logico = data_calendario - 1 giorno
ELSE
    giorno_logico = data_calendario
END IF

Esempi:
- 2025-10-10 03:30 → giorno_logico = 2025-10-09
- 2025-10-10 07:15 → giorno_logico = 2025-10-10
- 2025-10-10 23:45 → giorno_logico = 2025-10-10
```

### **Regola 2: Validazione Entrata/Uscita**
```
Per ogni giorno_logico:
1. Prima timbratura deve essere "entrata"
2. Ultima timbratura deve essere "uscita"  
3. Alternanza entrata → uscita → entrata → uscita
4. Non più di 1 entrata senza uscita corrispondente

Validazioni:
- Entrata duplicata → ERRORE
- Uscita senza entrata → ERRORE
- Sequenza non valida → ERRORE
```

### **Regola 3: Calcolo Ore Lavorate**
```
ore_lavorate = ultima_uscita - prima_entrata (stesso giorno_logico)

Considerazioni:
- Ignora pause non registrate
- Calcolo su base oraria decimale
- Arrotondamento ai minuti

Esempio:
- Entrata: 22:30 (giorno_logico: 2025-10-09)
- Uscita: 06:15 (giorno_logico: 2025-10-09, data: 2025-10-10)
- Ore lavorate: 06:15 - 22:30 = 7.75 ore
```

---

## 💡 Esempi Pratici

### **Scenario 1: Turno Diurno Standard**
```
Data: 2025-10-09
Entrata: 08:30 → giorno_logico = 2025-10-09
Uscita: 17:30 → giorno_logico = 2025-10-09

Calcolo:
- Ore lavorate: 17:30 - 08:30 = 9.0 ore
- Ore extra: 9.0 - 8.0 = 1.0 ora
- Giorno logico: 2025-10-09
```

### **Scenario 2: Turno Notturno Completo**
```
Entrata: 2025-10-09 22:00 → giorno_logico = 2025-10-09
Uscita: 2025-10-10 06:00 → giorno_logico = 2025-10-09

Calcolo:
- Ore lavorate: 06:00 - 22:00 = 8.0 ore
- Ore extra: 8.0 - 8.0 = 0.0 ore  
- Giorno logico: 2025-10-09 (entrambe le timbrature)
```

### **Scenario 3: Turno Notturno con Straordinario**
```
Entrata: 2025-10-09 21:30 → giorno_logico = 2025-10-09
Uscita: 2025-10-10 07:00 → giorno_logico = 2025-10-09

Calcolo:
- Ore lavorate: 07:00 - 21:30 = 9.5 ore
- Ore extra: 9.5 - 8.0 = 1.5 ore
- Giorno logico: 2025-10-09
```

### **Scenario 4: Entrata Mattina Presto**
```
Entrata: 2025-10-10 04:30 → giorno_logico = 2025-10-09
Uscita: 2025-10-10 12:30 → giorno_logico = 2025-10-10

PROBLEMA: Timbrature su giorni logici diversi!
SOLUZIONE: Validazione deve impedire questo caso
ALTERNATIVA: Considerare 04:30 come inizio nuovo giorno logico
```

---

## ⏰ Calcolo Ore

### **Formula Base**
```
ore_lavorate = (ultima_uscita - prima_entrata) in ore decimali

Conversione minuti → decimale:
- 15 minuti = 0.25 ore
- 30 minuti = 0.50 ore  
- 45 minuti = 0.75 ore

Esempio:
- 8:30 → 8.50 ore
- 17:15 → 17.25 ore
- Differenza: 17.25 - 8.50 = 8.75 ore
```

### **Ore Extra**
```
ore_extra = MAX(0, ore_lavorate - ore_contrattuali)

Esempi:
- Lavorate: 9.5, Contrattuali: 8.0 → Extra: 1.5
- Lavorate: 7.0, Contrattuali: 8.0 → Extra: 0.0
- Lavorate: 8.0, Contrattuali: 8.0 → Extra: 0.0
```

### **Arrotondamenti**
```
Precisione: minuti (no secondi)
Arrotondamento: matematico standard

Esempi:
- 8:29:30 → 8:30 (arrotonda su)
- 8:29:29 → 8:29 (arrotonda giù)
- 8:30:00 → 8:30 (esatto)
```

---

## 🔮 Implementazione Futura

### **Database Schema**
```sql
-- Tabella timbrature con giorno_logico
CREATE TABLE timbrature (
    id BIGSERIAL PRIMARY KEY,
    pin INTEGER NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('entrata', 'uscita')),
    data_calendario DATE NOT NULL,
    orario TIME NOT NULL,
    giorno_logico DATE NOT NULL,  -- Calcolato automaticamente
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indice per query performance
CREATE INDEX idx_timbrature_giorno_logico ON timbrature(pin, giorno_logico);
```

### **Trigger Automatico**
```sql
-- Calcolo automatico giorno_logico
CREATE OR REPLACE FUNCTION calcola_giorno_logico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.orario >= '00:00:00' AND NEW.orario < '05:00:00' THEN
        NEW.giorno_logico := NEW.data_calendario - INTERVAL '1 day';
    ELSE
        NEW.giorno_logico := NEW.data_calendario;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_giorno_logico
    BEFORE INSERT OR UPDATE ON timbrature
    FOR EACH ROW
    EXECUTE FUNCTION calcola_giorno_logico();
```

### **Vista Aggregata**
```sql
-- Vista per report giornalieri
CREATE VIEW v_turni_giornalieri AS
SELECT 
    pin,
    giorno_logico,
    MIN(CASE WHEN tipo = 'entrata' THEN orario END) as prima_entrata,
    MAX(CASE WHEN tipo = 'uscita' THEN orario END) as ultima_uscita,
    CASE 
        WHEN MIN(CASE WHEN tipo = 'entrata' THEN orario END) IS NOT NULL 
        AND MAX(CASE WHEN tipo = 'uscita' THEN orario END) IS NOT NULL
        THEN EXTRACT(EPOCH FROM (
            MAX(CASE WHEN tipo = 'uscita' THEN orario END) - 
            MIN(CASE WHEN tipo = 'entrata' THEN orario END)
        )) / 3600.0
        ELSE 0
    END as ore_lavorate
FROM timbrature
GROUP BY pin, giorno_logico
ORDER BY giorno_logico DESC, pin;
```

---

## ⚙️ Configurazione

### **Parametri Configurabili**
```typescript
interface GiornoLogicoConfig {
  soglia_mattina: string;        // "05:00" default
  ore_contrattuali_default: number; // 8.0 default
  arrotondamento_minuti: boolean;   // true default
  timezone: string;                 // "Europe/Rome"
}

// Esempio configurazione
const config: GiornoLogicoConfig = {
  soglia_mattina: "05:00",
  ore_contrattuali_default: 8.0,
  arrotondamento_minuti: true,
  timezone: "Europe/Rome"
};
```

### **Validazioni Business**
```typescript
interface ValidazioniTurno {
  max_ore_consecutive: number;      // 12 ore max
  min_pausa_tra_turni: number;     // 11 ore min
  max_giorni_consecutivi: number;   // 6 giorni max
  richiedi_pausa_pranzo: boolean;   // se turno > 6 ore
}
```

---

## 🚨 Edge Cases

### **Casi Limite da Gestire**
```
1. Cambio ora legale
   - Marzo: 02:00 → 03:00 (ora persa)
   - Ottobre: 03:00 → 02:00 (ora duplicata)

2. Timbrature esatte sulla soglia
   - 05:00:00 → quale giorno logico?
   - Convenzione: >= 05:00 = giorno corrente

3. Turni multi-giorno
   - Entrata lunedì 22:00
   - Uscita mercoledì 06:00
   - Gestione: errore o split automatico?

4. Fuso orario
   - Server UTC vs client Europe/Rome
   - Conversioni consistenti richieste
```

### **Soluzioni Proposte**
```
1. Cambio ora: usa timestamp UTC interno
2. Soglia: regola esplicita >= 05:00
3. Multi-giorno: validazione impedisce (max 24h)
4. Timezone: sempre Europe/Rome, no conversioni UTC
```

---

## 📊 Metriche e Monitoring

### **KPI da Tracciare**
```
- Turni notturni vs diurni (%)
- Ore extra medie per turno notturno
- Errori validazione giorno logico
- Performance calcolo ore aggregate
```

### **Alerting**
```
- Turno > 12 ore consecutive
- Timbratura fuori orario normale (00:00-05:00)
- Calcolo ore negative o impossibili
- Validazioni fallite frequenti
```

---

**Nota Importante**: Questa logica è **concettuale** e non ancora implementata. L'implementazione richiederà testing approfondito con casi reali e validazione business prima del deploy in produzione.
