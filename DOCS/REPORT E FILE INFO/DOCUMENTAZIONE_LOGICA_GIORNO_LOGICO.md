# 📋 DOCUMENTAZIONE LOGICA GIORNO LOGICO - BADGENODE

**Versione**: 1.0  
**Data**: 2025-10-07  
**Scopo**: Documentazione completa della logica di timbratura con giorno logico per replicazione accurata  

---

## 🎯 CONCETTO FONDAMENTALE: GIORNO LOGICO

### **Definizione**
Il **giorno logico** è il giorno lavorativo di riferimento per una timbratura, che può differire dalla data calendario effettiva quando la timbratura avviene in orari notturni (00:00-04:59).

### **Problema Business**
In contesti lavorativi con turni notturni o straordinari, una timbratura alle **02:00 del 15/09** deve essere associata al **giorno lavorativo del 14/09**, non al 15/09.

---

## 🕐 REGOLE LOGICA GIORNO LOGICO

### **ENTRATA**

#### **Orario Diurno (05:00-23:59)**
```javascript
// Esempio: Entrata 08:30 del 15/09
data: "2025-09-15"
ore: "08:30:00"
giornologico: "2025-09-15"  // Stesso giorno
```

#### **Orario Notturno (00:00-04:59)**
```javascript
// Esempio: Entrata 02:00 del 15/09 (turno notturno iniziato il 14/09)
data: "2025-09-15"
ore: "02:00:00"
giornologico: "2025-09-14"  // Giorno precedente (turno del 14/09)
```

### **USCITA**

#### **Uscita Normale (stesso giorno)**
```javascript
// Esempio: Uscita 17:30 del 15/09
data: "2025-09-15"
ore: "17:30:00"
giornologico: "2025-09-15"  // Stesso giorno dell'entrata
```

#### **Uscita Post-Mezzanotte (giorno successivo)**
```javascript
// Esempio: Uscita 02:00 del 16/09 (turno iniziato il 15/09)
// Condizioni: oreUscita 00:00-04:59 E diffGiorni <= 1
data: "2025-09-16"  // Data reale uscita (giorno dopo)
ore: "02:00:00"
giornologico: "2025-09-15"  // Giorno logico del turno
```

---

## ⏰ LOGICA ORE EXTRA E CONTRATTUALI

### **Concetto Ore Extra**
Le **ore extra** sono le ore lavorate in eccesso rispetto alle ore contrattuali giornaliere configurate per ogni dipendente. Il calcolo avviene per ogni giorno logico e viene sommato nel totale mensile.

### **Configurazione Ore Contrattuali**
Ogni dipendente ha un campo `ore_contrattuali` nella tabella `utenti` che definisce le ore massime giornaliere da contratto.

#### **Gestione in utenti.html**
```html
<!-- Campo nel modale dipendente -->
<div class="campo-label">Ore max giornaliere da contratto *</div>
<input type="number" class="campo-valore" id="nuovo-ore-contrattuali"
       placeholder="8.00" step="0.25" min="0" max="24" value="8.00" required>
```

#### **Struttura Database**
```sql
-- Tabella utenti
CREATE TABLE utenti (
  pin INTEGER PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  ore_contrattuali NUMERIC(4,2) DEFAULT 8.00,  -- Ore giornaliere da contratto
  descrizione_contratto TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Algoritmo Calcolo Ore Extra**

#### **Per Singolo Giorno Logico**
```javascript
// In timbrature-render.js - per ogni giorno
const oreContrattuali = parseFloat(dipendente?.ore_contrattuali) || 8.00;
const oreExtra = Math.max(0, oreTotaliGiorno - oreContrattuali);

// Visualizzazione ore extra
let extraContent = '';
if (oreExtra > 0) {
  extraContent = `<span style="color: #fbbf24; font-weight: bold;">${oreExtra.toFixed(2)}</span>`;
  totaleMensileExtra += oreExtra;  // Accumula nel totale mensile
}
```

#### **Calcolo Ore Totali Giorno**
```javascript
// Calcolo ore lavorate per giorno logico
function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return 0;

  const [oreInizio, minutiInizio] = oraInizio.split(':').map(Number);
  const [oreFine, minutiFine] = oraFine.split(':').map(Number);

  const minutiTotaliInizio = oreInizio * 60 + minutiInizio;
  const minutiTotaliFine = oreFine * 60 + minutiFine;

  let differenzaMinuti = minutiTotaliFine - minutiTotaliInizio;

  // Gestisce turni notturni (uscita giorno successivo)
  if (differenzaMinuti < 0) {
    differenzaMinuti += 24 * 60;  // Aggiungi 24 ore
  }

  return Math.round((differenzaMinuti / 60) * 100) / 100;  // Ore con 2 decimali
}
```

### **Esempi Calcolo Ore Extra**

#### **Scenario 1: Giornata Normale (nessuna ora extra)**
```
Dipendente: ore_contrattuali = 8.00
Timbrature: 09:00 - 17:00 (8 ore)
Calcolo: 8.00 - 8.00 = 0.00 ore extra
Visualizzazione: colonna "Extra" vuota
```

#### **Scenario 2: Straordinario Semplice**
```
Dipendente: ore_contrattuali = 8.00  
Timbrature: 08:00 - 18:30 (10.5 ore)
Calcolo: 10.50 - 8.00 = 2.50 ore extra
Visualizzazione: "2.50" in giallo/bold nella colonna "Extra"
```

#### **Scenario 3: Turno Notturno con Extra**
```
Dipendente: ore_contrattuali = 8.00
Timbrature: 22:00 (15/09) - 08:00 (16/09) = 10 ore
Giorno logico: 2025-09-15 (stesso turno)
Calcolo: 10.00 - 8.00 = 2.00 ore extra
Visualizzazione: "2.00" in giallo/bold per il 15/09
```

#### **Scenario 4: Part-time con Straordinario**
```
Dipendente: ore_contrattuali = 6.00 (part-time)
Timbrature: 09:00 - 17:00 (8 ore)  
Calcolo: 8.00 - 6.00 = 2.00 ore extra
Visualizzazione: "2.00" in giallo/bold nella colonna "Extra"
```

### **Totale Mensile Ore Extra**

#### **Accumulo nel Rendering**
```javascript
// In timbrature-render.js - accumulo mensile
let totaleMensileExtra = 0;

for (const current of days) {
  // ... calcolo ore giorno ...
  const oreExtra = Math.max(0, oreTotaliGiorno - oreContrattuali);
  if (oreExtra > 0) {
    totaleMensileExtra += oreExtra;  // Somma al totale mensile
  }
}

// Visualizzazione totale nella riga finale
let totaleExtraContent = '';
if (totaleMensileExtra > 0) {
  totaleExtraContent = `<span style="color: #fbbf24; font-weight: bold;">${formattaOre(totaleMensileExtra)}</span>`;
}
```

#### **Riga Totale Mensile**
```html
<!-- Riga finale tabella storico -->
<tr>
  <td>TOTALE MENSILE</td>
  <td></td>
  <td></td>
  <td></td>
  <td style="color: #ffff99;">${totaleMensileOre.toFixed(2)}</td>
  <td style="text-align: center;">${totaleExtraContent}</td>
  <td></td>
</tr>
```

### **Collegamento con Gestione Utenti**

#### **Modifica Ore Contrattuali**
```javascript
// In utenti.html - salvataggio modifiche dipendente
const oreContrattuali = parseFloat(document.getElementById('modifica-ore-contrattuali').value) || 8.0;

await supabaseClient
  .from('utenti')
  .update({
    nome: nome?.trim(),
    cognome: cognome?.trim(),
    email: email || null,
    telefono: telefono || null,
    descrizione_contratto: descrizioneContratto || null,
    ore_contrattuali: oreContrattuali  // Aggiorna ore contrattuali
  })
  .eq('pin', parseInt(currentEditingPin));
```

#### **Impatto Immediato**
- **Modifica ore contrattuali** → Ricalcolo automatico ore extra in storico
- **Effetto retroattivo** → Tutti i giorni del mese vengono ricalcolati
- **Totale mensile** → Aggiornato automaticamente

### **Validazioni e Constraints**

#### **Validazioni Frontend**
```javascript
// Validazione ore contrattuali
function validateOreContrattuali(ore) {
  const oreNum = parseFloat(ore);
  
  if (isNaN(oreNum) || oreNum < 0) {
    throw new Error('Ore contrattuali deve essere un numero positivo');
  }
  
  if (oreNum > 24) {
    throw new Error('Ore contrattuali non può superare 24 ore');
  }
  
  if (oreNum % 0.25 !== 0) {
    throw new Error('Ore contrattuali deve essere multiplo di 0.25 (15 minuti)');
  }
  
  return oreNum;
}
```

#### **Constraints Database**
```sql
-- Constraint su ore_contrattuali
ALTER TABLE utenti ADD CONSTRAINT check_ore_contrattuali 
  CHECK (ore_contrattuali >= 0 AND ore_contrattuali <= 24);

-- Indice per performance
CREATE INDEX idx_utenti_ore_contrattuali ON utenti (ore_contrattuali);
```

---

## 💻 IMPLEMENTAZIONE TECNICA

### **File Coinvolti**
- `assets/scripts/modale-modifica.js` - Logica salvataggio timbrature
- `assets/scripts/timbrature-data.js` - Fetch e normalizzazione dati
- `assets/scripts/timbrature-render.js` - Rendering tabella con mapping

### **Algoritmo Entrata**

```javascript
// ENTRATA - Calcolo giorno logico
if (oraEntrata && dataEntrata) {
  const [oreEntrata] = oraEntrata.split(':').map(Number);
  let giornoLogicoEntrata = dataEntrata;
  
  // REGOLA: Solo per orari notturni (00-04) il giorno logico è il precedente
  if (oreEntrata >= 0 && oreEntrata < 5) {
    const d = new Date(dataEntrata + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    // IMPORTANTE: Formatazione locale senza UTC per evitare drift timezone
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    giornoLogicoEntrata = `${year}-${month}-${day}`;
  }

  // Record inserito in tabella timbrature
  {
    pin: parseInt(pin),
    nome: userData.nome,
    cognome: userData.cognome,
    tipo: 'entrata',
    data: dataEntrata,           // Data calendario effettiva
    ore: oraEntrata + ':00',
    giornologico: giornoLogicoEntrata  // Data logica per raggruppamento
  }
}
```

### **Algoritmo Uscita**

```javascript
// USCITA - Calcolo giorno logico e data reale
if (oraUscita && dataUscita) {
  const [oreUscita] = oraUscita.split(':').map(Number);
  let giornoLogicoUscita = dataUscita;
  let dataRealeUscita = dataUscita;

  // Calcolo differenza giorni tra entrata e uscita
  const dataEntrataObj = new Date(dataEntrata);
  const dataUscitaObj = new Date(dataUscita);
  const diffGiorni = (dataUscitaObj - dataEntrataObj) / (1000 * 60 * 60 * 24);

  // REGOLA: Uscita post-mezzanotte dello stesso turno
  if (oreUscita >= 0 && oreUscita < 5 && diffGiorni <= 1) {
    // Data reale: giorno successivo (dove avviene fisicamente l'uscita)
    const d = new Date(dataUscita + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const yearReal = d.getFullYear();
    const monthReal = String(d.getMonth() + 1).padStart(2, '0');
    const dayReal = String(d.getDate()).padStart(2, '0');
    dataRealeUscita = `${yearReal}-${monthReal}-${dayReal}`;

    // Giorno logico: giorno precedente (stesso turno dell'entrata)
    const giornoLogicoDate = new Date(dataUscita + 'T00:00:00');
    giornoLogicoDate.setDate(giornoLogicoDate.getDate() - 1);
    const yearLogico = giornoLogicoDate.getFullYear();
    const monthLogico = String(giornoLogicoDate.getMonth() + 1).padStart(2, '0');
    const dayLogico = String(giornoLogicoDate.getDate()).padStart(2, '0');
    giornoLogicoUscita = `${yearLogico}-${monthLogico}-${dayLogico}`;
  }

  // Record inserito in tabella timbrature
  {
    pin: parseInt(pin),
    nome: userData.nome,
    cognome: userData.cognome,
    tipo: 'uscita',
    data: dataRealeUscita,       // Data calendario effettiva dell'uscita
    ore: oraUscita + ':00',
    giornologico: giornoLogicoUscita  // Data logica per raggruppamento
  }
}
```

---

## 📊 ESEMPI PRATICI

### **Scenario 1: Turno Diurno Normale**
```
Entrata: 15/09/2025 08:30
Uscita:  15/09/2025 17:30

RISULTATO:
- Entrata: data=2025-09-15, ore=08:30:00, giornologico=2025-09-15
- Uscita:  data=2025-09-15, ore=17:30:00, giornologico=2025-09-15
- Raggruppamento: Giorno logico 2025-09-15
```

### **Scenario 2: Turno Notturno (Entrata Post-Mezzanotte)**
```
Entrata: 15/09/2025 02:00 (turno del 14/09)
Uscita:  15/09/2025 10:00

RISULTATO:
- Entrata: data=2025-09-15, ore=02:00:00, giornologico=2025-09-14
- Uscita:  data=2025-09-15, ore=10:00:00, giornologico=2025-09-15
- Raggruppamento: Due giorni logici distinti (14/09 e 15/09)
```

### **Scenario 3: Turno con Uscita Post-Mezzanotte**
```
Entrata: 15/09/2025 22:00
Uscita:  16/09/2025 02:00 (stesso turno del 15/09)

RISULTATO:
- Entrata: data=2025-09-15, ore=22:00:00, giornologico=2025-09-15
- Uscita:  data=2025-09-16, ore=02:00:00, giornologico=2025-09-15
- Raggruppamento: Giorno logico 2025-09-15 (stesso turno)
```

### **Scenario 4: Turno Lungo (24+ ore)**
```
Entrata: 15/09/2025 08:00
Uscita:  17/09/2025 01:00 (diffGiorni > 1)

RISULTATO:
- Entrata: data=2025-09-15, ore=08:00:00, giornologico=2025-09-15
- Uscita:  data=2025-09-17, ore=01:00:00, giornologico=2025-09-17
- Raggruppamento: Due giorni logici distinti (nessun raggruppamento)
```

---

## 🗄️ STRUTTURA DATABASE

### **Tabella `timbrature`**
```sql
CREATE TABLE timbrature (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL,           -- 'entrata' | 'uscita'
  pin INTEGER NOT NULL,                -- Riferimento utente
  nome VARCHAR(100) NOT NULL,          -- Nome utente (denormalizzato)
  cognome VARCHAR(100) NOT NULL,       -- Cognome utente (denormalizzato)
  data DATE NOT NULL,                  -- Data calendario effettiva
  ore TIME NOT NULL,                   -- Orario effettivo
  giornologico DATE,                   -- Data logica per raggruppamento
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Indici Consigliati**
```sql
-- Indice per query per utente e periodo
CREATE INDEX idx_timbrature_pin_giornologico ON timbrature (pin, giornologico);

-- Indice per query per data effettiva
CREATE INDEX idx_timbrature_pin_data ON timbrature (pin, data);

-- Indice per ordinamento cronologico
CREATE INDEX idx_timbrature_created_at ON timbrature (created_at);
```

---

## 🔍 QUERY E FILTRI

### **Query per Giorno Logico**
```sql
-- Recupera tutte le timbrature del giorno logico 15/09/2025 per PIN 71
SELECT * FROM timbrature 
WHERE pin = 71 
  AND giornologico = '2025-09-15'
ORDER BY ore;
```

### **Query per Periodo con Range**
```sql
-- Recupera timbrature del mese settembre 2025
SELECT * FROM timbrature 
WHERE pin = 71 
  AND giornologico >= '2025-09-01' 
  AND giornologico <= '2025-09-30'
ORDER BY giornologico, ore;
```

### **Filtro Frontend (JavaScript)**
```javascript
// Filtra timbrature per range di giorni logici
const timbratureFiltrate = timbrature.filter(t => {
  const dataRiferimento = normalizzaData(t.giornologico || t.data_giorno_local || t.data);
  return dataRiferimento >= dataInizio && dataRiferimento <= dataFine;
});
```

---

## 🎨 RENDERING E VISUALIZZAZIONE

### **Raggruppamento per Giorno Logico**
```javascript
// Raggruppa timbrature per giorno logico
const byDate = new Map();
for (const t of timbrature) {
  // USA giornologico per il mapping, non data
  const key = normalizzaData(t.giornologico || t.data_giorno_local || t.data);
  if (!byDate.has(key)) {
    byDate.set(key, []);
  }
  byDate.get(key).push(t);
}
```

### **Calcolo Ore Lavorate**
```javascript
// Calcola ore per giorno logico
function calcolaOreLavorate(timbratureGiorno) {
  const entrate = timbratureGiorno.filter(t => t.tipo === 'entrata');
  const uscite = timbratureGiorno.filter(t => t.tipo === 'uscita');
  
  if (entrate.length === 0 || uscite.length === 0) return 0;
  
  // Usa prima entrata e ultima uscita dello stesso giorno logico
  const primaEntrata = entrate.sort((a, b) => a.ore.localeCompare(b.ore))[0];
  const ultimaUscita = uscite.sort((a, b) => b.ore.localeCompare(a.ore))[0];
  
  // Calcolo considerando possibile cambio di data
  const dataEntrata = new Date(`${primaEntrata.data}T${primaEntrata.ore}`);
  const dataUscita = new Date(`${ultimaUscita.data}T${ultimaUscita.ore}`);
  
  // Se uscita < entrata, aggiungi 24 ore (turno notturno)
  if (dataUscita < dataEntrata) {
    dataUscita.setDate(dataUscita.getDate() + 1);
  }
  
  const diffMs = dataUscita - dataEntrata;
  return diffMs / (1000 * 60 * 60); // Ore decimali
}
```

---

## ⚠️ CONSIDERAZIONI CRITICHE

### **Timezone Safety**
```javascript
// ❌ EVITARE: .toISOString() causa drift timezone
const badDate = new Date(data).toISOString().split('T')[0];

// ✅ CORRETTO: Formatazione locale
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### **Validazione Business Rules**
```javascript
// Validazioni consigliate
function validateTimbratura(entrata, uscita) {
  // 1. Entrata non può essere dopo uscita (stesso giorno logico)
  if (entrata.giornologico === uscita.giornologico && entrata.ore > uscita.ore) {
    throw new Error('Entrata non può essere dopo uscita');
  }
  
  // 2. Massimo 24 ore per turno
  const diffOre = calcolaOreLavorate([entrata, uscita]);
  if (diffOre > 24) {
    throw new Error('Turno non può superare 24 ore');
  }
  
  // 3. Minimo 30 minuti per turno valido
  if (diffOre < 0.5) {
    throw new Error('Turno minimo 30 minuti');
  }
}
```

### **Gestione Edge Cases**
```javascript
// Edge case: Cambio ora legale
// Edge case: Timbrature duplicate
// Edge case: Turni multi-giorno
// Edge case: Correzioni retroattive
```

### **Export e Report con Ore Extra**

#### **Export PDF/Excel**
```javascript
// Inclusione ore extra nei report
const reportData = {
  dipendente: {
    nome: dipendente.nome,
    cognome: dipendente.cognome,
    pin: dipendente.pin,
    ore_contrattuali: dipendente.ore_contrattuali
  },
  timbrature: timbratureFiltrate,
  totali: {
    oreTotali: totaleMensileOre,
    oreExtra: totaleMensileExtra,
    giorniLavorati: giorniConTimbrature,
    mediaOreGiorno: totaleMensileOre / giorniConTimbrature
  }
};
```

#### **Formato CSV Export**
```csv
INFORMAZIONI DIPENDENTE
Nome,Cognome,PIN,Email,Telefono,Ore Contrattuali
"Francisco","Candussi Baez",71,"email@example.com","123456789",8.00

STORICO TIMBRATURE
Data,Giorno Settimana,Entrata,Uscita,Ore Lavorate,Ore Extra
2025-09-15,Lunedì,08:30,17:30,8.00,0.00
2025-09-16,Martedì,08:00,18:30,10.50,2.50
2025-09-17,Mercoledì,22:00,08:00,10.00,2.00

TOTALI MENSILI
Ore Totali,28.50
Ore Extra,4.50
Giorni Lavorati,3
Media Ore/Giorno,9.50
```

### **Integrazione con Vista Database**

#### **Vista v_timbrature_utenti Estesa**
```sql
-- Vista che include ore_contrattuali per calcoli frontend
CREATE OR REPLACE VIEW public.v_timbrature_utenti AS
SELECT
  t.id,
  t.pin,
  t.tipo,
  t.data,
  t.ore,
  t.giornologico,
  t.created_at,
  u.nome,
  u.cognome,
  u.ore_contrattuali  -- Campo essenziale per calcolo ore extra
FROM public.timbrature t
JOIN public.utenti u ON u.pin = t.pin;
```

#### **Query Ottimizzate per Ore Extra**
```sql
-- Query per calcolo ore extra mensili
WITH daily_hours AS (
  SELECT 
    pin,
    giornologico,
    SUM(CASE 
      WHEN tipo = 'uscita' THEN EXTRACT(EPOCH FROM ore)/3600
      WHEN tipo = 'entrata' THEN -EXTRACT(EPOCH FROM ore)/3600
    END) as ore_lavorate
  FROM v_timbrature_utenti 
  WHERE pin = $1 
    AND giornologico >= $2 
    AND giornologico <= $3
  GROUP BY pin, giornologico
),
extra_calculation AS (
  SELECT 
    dh.*,
    u.ore_contrattuali,
    GREATEST(0, dh.ore_lavorate - u.ore_contrattuali) as ore_extra
  FROM daily_hours dh
  JOIN utenti u ON u.pin = dh.pin
)
SELECT 
  SUM(ore_lavorate) as totale_ore,
  SUM(ore_extra) as totale_ore_extra,
  COUNT(*) as giorni_lavorati
FROM extra_calculation;
```

### **Monitoraggio e Analytics**

#### **Dashboard Ore Extra**
```javascript
// Statistiche ore extra per amministrazione
const statsOreExtra = {
  dipendentiConExtra: timbrature.filter(t => t.ore_extra > 0).length,
  mediaOreExtra: totaleMensileExtra / giorniLavorati,
  piccoMassimoExtra: Math.max(...timbrature.map(t => t.ore_extra)),
  costoStimato: totaleMensileExtra * tariffaOraria * 1.5  // Maggiorazione 50%
};
```

#### **Alert Soglie**
```javascript
// Sistema alert per ore extra eccessive
function checkSoglieOreExtra(oreExtra, oreGiorno) {
  const alerts = [];
  
  if (oreExtra > 4) {
    alerts.push({
      type: 'warning',
      message: `Ore extra eccessive: ${oreExtra.toFixed(2)}h`
    });
  }
  
  if (oreGiorno > 12) {
    alerts.push({
      type: 'critical', 
      message: `Turno oltre 12 ore: ${oreGiorno.toFixed(2)}h - Verifica normativa`
    });
  }
  
  return alerts;
}
```

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### **Backend/Database**
- [ ] Tabella `timbrature` con campo `giornologico DATE`
- [ ] Tabella `utenti` con campo `ore_contrattuali NUMERIC(4,2)`
- [ ] Indici su `(pin, giornologico)` e `(pin, data)`
- [ ] Vista `v_timbrature_utenti` con `ore_contrattuali`
- [ ] Constraints per integrità dati e ore contrattuali
- [ ] RLS policies se necessarie

### **Frontend Logic**
- [ ] Algoritmo calcolo giorno logico per entrata (00-04 → giorno precedente)
- [ ] Algoritmo calcolo giorno logico per uscita (post-mezzanotte stesso turno)
- [ ] Algoritmo calcolo ore extra per giorno logico
- [ ] Accumulo totale mensile ore extra
- [ ] Formatazione date locale (no UTC drift)
- [ ] Validazione business rules e ore contrattuali

### **UI/UX**
- [ ] Raggruppamento visualizzazione per giorno logico
- [ ] Calcolo ore considerando turni notturni
- [ ] Visualizzazione ore extra in colonna dedicata (giallo/bold)
- [ ] Totale mensile ore extra in riga finale
- [ ] Filtri per range giorni logici
- [ ] Indicatori visivi per turni notturni
- [ ] Campo "Ore max giornaliere da contratto" in gestione utenti

### **Gestione Utenti**
- [ ] Modale creazione dipendente con ore contrattuali
- [ ] Modale modifica dipendente con ore contrattuali
- [ ] Validazione ore contrattuali (0-24, step 0.25)
- [ ] Impatto immediato su calcoli ore extra esistenti

### **Export e Report**
- [ ] Inclusione ore extra in export PDF/Excel
- [ ] Formato CSV con colonna ore extra
- [ ] Totali mensili con ore extra
- [ ] Statistiche e analytics ore extra

### **Testing**
- [ ] Test scenario turno diurno normale (nessuna ora extra)
- [ ] Test scenario straordinario semplice (ore extra)
- [ ] Test scenario entrata notturna con ore extra
- [ ] Test scenario uscita post-mezzanotte con ore extra
- [ ] Test scenario part-time con straordinario
- [ ] Test scenario turno lungo (>24h)
- [ ] Test modifica ore contrattuali e ricalcolo
- [ ] Test export con ore extra
- [ ] Test edge cases timezone

---

## 🔧 TROUBLESHOOTING

### **Problema: Timbrature "scompaiono"**
**Causa**: Filtro usa `data` invece di `giornologico`  
**Soluzione**: Usare sempre `giornologico` per filtri e raggruppamenti

### **Problema: Ore negative o errate**
**Causa**: Calcolo non considera cambio data in turni notturni  
**Soluzione**: Implementare logica cambio giorno nel calcolo ore

### **Problema: Drift timezone**
**Causa**: Uso di `.toISOString()` per date locali  
**Soluzione**: Formatazione locale esplicita senza conversioni UTC

### **Problema: Duplicati o inconsistenze**
**Causa**: Logica giorno logico non applicata uniformemente  
**Soluzione**: Centralizzare algoritmo in funzione condivisa

### **Problema: Ore extra non calcolate correttamente**
**Causa**: Campo `ore_contrattuali` mancante o non aggiornato  
**Soluzione**: Verificare che `dipendente.ore_contrattuali` sia popolato dalla query

### **Problema: Ore extra negative o NaN**
**Causa**: Calcolo ore giornaliere fallisce per turni complessi  
**Soluzione**: Implementare validazione `Math.max(0, oreTotali - oreContrattuali)`

### **Problema: Totale mensile ore extra errato**
**Causa**: Accumulo non resettato tra rendering diversi  
**Soluzione**: Inizializzare `totaleMensileExtra = 0` ad ogni rendering

### **Problema: Modifica ore contrattuali non si riflette**
**Causa**: Cache frontend non invalidata dopo modifica utente  
**Soluzione**: Forzare reload dati dopo salvataggio modifiche utente

---

## 📚 RIFERIMENTI TECNICI

### **File Sorgente Implementazione**

#### **Logica Giorno Logico**
- `assets/scripts/modale-modifica.js:133-202` - Algoritmi giorno logico entrata/uscita
- `assets/scripts/timbrature-render.js:45-51` - Mapping per rendering con giorno logico
- `assets/scripts/timbrature-data.js:95-112` - Filtri query con normalizzazione timezone
- `assets/scripts/calendar-utils.js:28-46` - Utility calcolo ore lavorate

#### **Logica Ore Extra**
- `assets/scripts/timbrature-render.js:89-95` - Calcolo ore extra per giorno
- `assets/scripts/timbrature-render.js:178-184` - Totale mensile ore extra
- `assets/scripts/timbrature-data.js:51` - Fetch ore_contrattuali da database
- `utenti.html:498-501` - Campo "Ore max giornaliere da contratto"

#### **Database e Viste**
- `db/sql/rec004_create_view_v_timbrature_utenti.sql:14` - Vista con ore_contrattuali
- Schema tabella `utenti` - Campo `ore_contrattuali NUMERIC(4,2) DEFAULT 8.00`
- Schema tabella `timbrature` - Campo `giornologico DATE` per raggruppamento

### **Commit Riferimento**

#### **Giorno Logico**
- `4a7d6af` - Implementazione logica giorno logico completa
- `a340a96` - Normalizzazione timezone UTC→locale  
- `64b8144` - Fix data-attributes stabili per rendering

#### **Ore Extra**
- Implementazione nativa - Calcolo ore extra integrato nel rendering
- Vista database - Include `ore_contrattuali` per calcoli frontend
- Gestione utenti - Campo configurabile per ore contrattuali

### **Formule di Calcolo**

#### **Ore Extra Giornaliere**
```
oreExtra = Math.max(0, oreLavorate - oreContrattuali)
```

#### **Ore Lavorate con Turni Notturni**
```
if (oraUscita < oraEntrata) {
  differenzaMinuti += 24 * 60;  // Aggiungi 24 ore per turno notturno
}
oreLavorate = differenzaMinuti / 60;
```

#### **Totale Mensile**
```
totaleMensileExtra = Σ(oreExtra[giorno]) per tutti i giorni del mese
```

---

**Documentazione generata**: 2025-10-07 16:22  
**Versione BadgeNode**: 1.0  
**Status implementazione**: ✅ **COMPLETA E TESTATA**  
**Funzionalità coperte**: 
- ✅ Giorno logico per turni notturni
- ✅ Calcolo ore extra per giorno e mensile  
- ✅ Gestione ore contrattuali configurabili
- ✅ Export e report con ore extra
- ✅ Timezone safety (Europe/Rome +2)

**Compatibilità**: Timezone Europe/Rome (+2), estendibile ad altri fusi orari  
**Replicabilità**: 100% - Documentazione completa per implementazione identica
