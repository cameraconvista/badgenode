// Utility per gestione automatica report in DNA/REPORT_GENERICI/

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export type ReportType = 'DIAGNOSI' | 'FIX' | 'OTTIMIZZAZIONE' | 'ANALISI';

export interface ReportConfig {
  type: ReportType;
  component: string;
  content: string;
  date?: string;
}

/**
 * Salva automaticamente un report nella cartella DNA/REPORT_GENERICI/
 */
export function saveReport(config: ReportConfig): string {
  const { type, component, content, date = getCurrentDate() } = config;

  // Assicura che la cartella esista
  const reportDir = join(process.cwd(), 'DNA', 'REPORT_GENERICI');
  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  // Genera nome file standardizzato
  const fileName = `REPORT_${type}_${component.toUpperCase()}_${date}.md`;
  const filePath = join(reportDir, fileName);

  // Salva il file
  writeFileSync(filePath, content, 'utf8');

  console.log(`📋 Report salvato: DNA/REPORT_GENERICI/${fileName}`);
  return filePath;
}

/**
 * Ottieni data corrente in formato YYYYMMDD
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Template per report di diagnosi
 */
export function createDiagnosisTemplate(component: string, problem: string): string {
  return `# 🔍 REPORT DIAGNOSI ${component.toUpperCase()}

**Data**: ${new Date().toISOString().split('T')[0]}  
**Problema**: ${problem}  
**Stato**: DIAGNOSI IN CORSO

---

## 🎯 SINTOMI OSSERVATI

### **Comportamento Attuale**
- [ ] Descrizione sintomo 1
- [ ] Descrizione sintomo 2

### **Test Case Specifico**
\`\`\`
Scenario: 
Azione: 
Risultato Atteso: 
Risultato Attuale: 
\`\`\`

---

## 🔍 ANALISI CODICE

### **File Coinvolti**
1. **File 1**: Descrizione
2. **File 2**: Descrizione

### **Root Cause Ipotizzata**
- Causa principale: 
- Evidenze: 

---

## 🔧 PIANO FIX PROPOSTO

### **Step 1**: 
### **Step 2**: 
### **Step 3**: 

---

## ✅ CHECK-LIST TEST

- [ ] Test scenario 1
- [ ] Test scenario 2
- [ ] Test scenario 3

---

**Conclusioni**: Da completare dopo analisi
`;
}

/**
 * Template per report di fix
 */
export function createFixTemplate(component: string, problem: string): string {
  return `# 🛠️ REPORT FIX ${component.toUpperCase()}

**Data**: ${new Date().toISOString().split('T')[0]}  
**Problema Risolto**: ${problem}  
**Stato**: FIX APPLICATO

---

## 🎯 PROBLEMA ORIGINALE

### **Sintomi**
- Sintomo 1
- Sintomo 2

### **Root Cause**
Causa identificata e risolta

---

## 🔧 SOLUZIONE IMPLEMENTATA

### **Modifiche Applicate**
1. **File modificato 1**: Descrizione modifica
2. **File modificato 2**: Descrizione modifica

### **Codice Cambiato**
\`\`\`typescript
// Prima
// codice vecchio

// Dopo  
// codice nuovo
\`\`\`

---

## ✅ TEST ESEGUITI

- [x] Test scenario 1: ✅ PASS
- [x] Test scenario 2: ✅ PASS
- [x] Test scenario 3: ✅ PASS

---

## 📊 RISULTATO FINALE

### **Benefici**
- Beneficio 1
- Beneficio 2

### **Rischi Residui**
- Nessuno identificato

---

**Fix completato con successo** ✅
`;
}
