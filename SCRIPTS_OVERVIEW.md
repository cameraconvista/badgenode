
# SCRIPTS_OVERVIEW.md

## Overview Script e Moduli JavaScript

### 📂 Directory `/assets/scripts/`

#### 📅 calendar-utils.js
**Responsabilità**: Gestione utility calendario e range date

**Funzioni principali**:
```javascript
// Aggiunge opzione "personalizzato" quando date cambiano
export function aggiungiOpzionePersonalizzato(selectElement)

// Aggiorna range date basato su selezione predefinita
export function aggiornaRange(valore, dataInizioEl, dataFineEl)
```

**Utilizzo**:
```javascript
import { aggiungiOpzionePersonalizzato, aggiornaRange } from './calendar-utils.js';

// Quando utente seleziona periodo predefinito
aggiornaRange('corrente', dataInizio, dataFine); // Mese corrente
aggiornaRange('precedente', dataInizio, dataFine); // Mese scorso
aggiornaRange('anno', dataInizio, dataFine); // Anno intero
```

#### 🗓️ calendario-popup.js  
**Responsabilità**: Popup calendario interattivo per selezione date

**Features**:
- Calendario visuale cliccabile
- Navigazione mesi/anni
- Integrazione con range selector
- Responsive mobile-first

**Template implementazione**:
```javascript
// Include in pagina che necessita date picker
import './calendario-popup.js';
```

#### 🔧 modale-modifica.js
**Responsabilità**: Gestione modifica/eliminazione timbrature esistenti

**Funzioni principali**:
```javascript
// Apre modale per modifica timbratura specifica
window.apriModifica = (data, pin, nome, cognome)

// Salva modifiche timbratura
window.salvaModifiche = async ()

// Elimina tutte timbrature di un giorno
async function eliminaTimbrature(data, pin)
```

**Flusso operativo**:
1. Click su data → `apriModifica()`
2. Modale popolata con dati esistenti
3. Modifica campi → `salvaModifiche()`
4. Refresh automatico tabella

#### 📊 storico-logic.js
**Responsabilità**: Business logic pagina storico dipendente

**Componenti gestiti**:
- **Filtri temporali**: Mese corrente/precedente/personalizzato
- **Rendering tabella**: Delegato a `timbrature-render.js`
- **Export**: PDF (jsPDF) + Excel (SheetJS)
- **Condivisione**: WhatsApp formatted message

**Funzioni chiave**:
```javascript
async function aggiornaDati() // Ricarica dati + re-render
```

**Event listeners**:
- Select filtro → aggiorna range + ricarica dati
- Date input → modalità personalizzata + ricarica
- Bottoni export → genera PDF/Excel

#### 🌐 supabase-client.js
**Responsabilità**: Client Supabase configurato + utility database

**Configurazione**:
```javascript
export const supabaseClient = createClient(
  "https://txmjqrnitfsiytbytxlc.supabase.co",
  "ANON_KEY"
);
```

**Utility functions**:
```javascript
// Error handling standardizzato
export function gestisciErroreSupabase(error)

// Helper timbrature
export async function recuperaTimbrature(pin, dataInizio, dataFine)
export async function recuperaUtente(pin)
```

**Pattern utilizzo**:
```javascript
import { supabaseClient, gestisciErroreSupabase } from './supabase-client.js';

try {
  const { data, error } = await supabaseClient.from('utenti').select();
  if (error) throw error;
} catch (error) {
  alert(gestisciErroreSupabase(error));
}
```

#### 💾 timbrature-data.js
**Responsabilità**: Layer di accesso dati per timbrature (CRUD operations)

**Funzioni principali**:
```javascript
// Carica dati combinati utente + timbrature
export async function caricaDati(pin, dataInizio, dataFine)

// Cache management per performance
export function pulisciCache()
```

**Cache strategy**:
- Cache in-memory per sessione corrente
- Invalidazione automatica su modifica dati
- Lazy loading dipendente se non in cache

#### 🎨 timbrature-render.js  
**Responsabilità**: Rendering HTML tabelle timbrature + calcoli ore

**Funzione principale**:
```javascript
export function renderizzaTabella(dipendente, timbrature, dataInizio, dataFine, tbody, footerTbody, pin)
```

**Capabilities**:
- **Calcolo ore**: Differenza entrata/uscita per giorno
- **Totali**: Ore giornaliere + mensili
- **Formattazione**: Date italiane, ore HH:MM
- **Actions**: Link modifica per ogni giorno
- **Responsività**: Adatta layout a dispositivo

**Output**:
```javascript
return {
  totaleMensile: "165:30", // Formato HH:MM
  giorniBuoniFine: 22,     // Giorni con timbrature complete
  oreProgressive: "165.50" // Formato decimale
};
```

### 🚀 Template per Nuovi Script

#### Struttura Base Modulo
```javascript
// /assets/scripts/nuovo-modulo.js

/**
 * NUOVO MODULO - [Descrizione responsabilità]
 * @author BADGEBOX Team
 * @version 1.0.0
 */

import { supabaseClient } from './supabase-client.js';

// ✅ Costanti modulo
const CONFIGURAZIONE_DEFAULT = {
  timeout: 5000,
  maxRetry: 3
};

// ✅ Stato interno modulo
let cacheModulo = null;

// ✅ Funzioni private
async function operazioneInterna() {
  // Implementation...
}

// ✅ Funzioni esportate (API pubblica)
export async function funzionePrincipale(parametri) {
  try {
    // Validazione input
    if (!parametri) throw new Error('Parametri obbligatori mancanti');
    
    // Business logic
    const risultato = await operazioneInterna();
    
    // Return standardizzato
    return {
      success: true,
      data: risultato,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Errore ${funzionePrincipale.name}:`, error);
    throw error;
  }
}

// ✅ Cleanup function
export function cleanup() {
  cacheModulo = null;
  // Cleanup risorse...
}
```

#### Template Integrazione HTML
```html
<!-- Includi modulo in pagina -->
<script type="module">
  import { funzionePrincipale } from './assets/scripts/nuovo-modulo.js';
  
  // Funzione globale per compatibilità onclick
  window.nuovaFunzioneGlobale = async (parametri) => {
    try {
      const risultato = await funzionePrincipale(parametri);
      console.log('✅ Operazione completata:', risultato);
    } catch (error) {
      alert('Errore: ' + error.message);
    }
  };
</script>
```

### 🔧 Patterns di Implementazione

#### Pattern Gestione Stati UI
```javascript
// ✅ Loading states per operazioni async
async function operazioneConLoading() {
  const btn = document.getElementById('action-btn');
  const originalText = btn.textContent;
  btn.textContent = "Elaborando...";
  btn.disabled = true;
  
  try {
    const risultato = await operazioneAsincrona();
    btn.textContent = "✅ Completato";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  } catch (error) {
    btn.textContent = "❌ Errore";
    setTimeout(() => {
      btn.textContent = originalText;  
      btn.disabled = false;
    }, 3000);
    throw error;
  }
}
```

#### Pattern Error Handling
```javascript
// ✅ Gestione errori a livelli
async function operazioneComplessa() {
  try {
    // Operazione database
    const { data, error } = await supabaseClient
      .from('tabella')
      .operation();
      
    if (error) {
      // Error specifico Supabase
      throw new Error(`DB Error: ${error.message}`);
    }
    
    // Validazione business logic
    if (!data || data.length === 0) {
      throw new Error('Nessun risultato trovato');
    }
    
    return data;
    
  } catch (error) {
    // Log tecnico
    console.error('❌ Errore tecnico:', error);
    
    // User-friendly message
    const userMessage = error.message.includes('DB Error') 
      ? 'Problema di connessione al database'
      : error.message;
      
    throw new Error(userMessage);
  }
}
```

#### Pattern Modularità
```javascript
// ✅ Modulo auto-contenuto
export const ModuloUtilities = {
  // Configurazione
  config: {
    timeout: 10000,
    retryAttempts: 3
  },
  
  // Cache interno
  _cache: new Map(),
  
  // Metodi pubblici
  async operazione1(params) { /* ... */ },
  async operazione2(params) { /* ... */ },
  
  // Utility interne
  _validateParams(params) { /* ... */ },
  _formatOutput(data) { /* ... */ }
};
```

### 📋 Checklist Qualità Script

#### Pre-commit
```
□ Import/export corretti
□ Error handling completo  
□ Console.log informativi (✅❌📊)
□ Validazione parametri input
□ Gestione stati loading UI
□ Compatibilità browser target
□ Mobile responsive
□ Performance acceptable (<2s operations)
```

#### Testing Scenarios  
```
□ Happy path funzionante
□ Error cases gestiti gracefully
□ Edge cases coperti (dati vuoti, connessione persa)
□ Mobile usability verificata
□ Memory leaks controllati
```

### 🎯 Future Enhancements

#### Script Candidati
- **backup-automation.js**: Backup automatico schedulato
- **analytics-tracker.js**: Tracking utilizzo funzionalità
- **offline-sync.js**: Sincronizzazione offline (Service Worker)
- **bulk-operations.js**: Operazioni massive (import CSV, bulk edit)
- **report-generator.js**: Report automatici e statistiche

#### Refactoring Priorities
1. **Consolidare client Supabase**: Un unico punto di configurazione
2. **Standardizzare error handling**: Utility condivisa per tutti i moduli
3. **Cache layer unificato**: Strategy condivisa tra moduli
4. **UI state management**: Pattern consistente per loading/error states
