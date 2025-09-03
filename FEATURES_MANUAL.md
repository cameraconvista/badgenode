
# FEATURES_MANUAL.md

## Manuale Completo Funzionalità BADGEBOX

### 🏠 Homepage - Sistema Timbrature (index.html)

#### Interfaccia Principale
**Componenti**:
- **Logo BADGEBOX**: Identità visiva
- **Display PIN**: Campo input per PIN dipendente (max 2 cifre)
- **Tastierino numerico**: 3x4 grid con numeri 0-9, C (clear), ⚙️ (admin)
- **Data/Ora corrente**: Aggiornamento real-time ogni secondo  
- **Pulsanti azione**: ENTRATA (verde) e USCITA (rosso)

#### Flusso Timbratura Standard
1. **Inserimento PIN**: Tastierino o input diretto (1-99)
2. **Validazione**: Verifica PIN in database `utenti`  
3. **Anti-duplicazione**: Controlla ultima timbratura per evitare duplicati
4. **Registrazione**: Inserisce in tabella `timbrature` con timestamp preciso
5. **Feedback**: Messaggio lampeggiante con nome dipendente e orario

#### Giorno Logico Lavorativo
**Algoritmo speciale per turni notturni**:
- Orario 00:00-04:59 → Appartiene al giorno lavorativo precedente
- Orario 05:00-23:59 → Giorno corrente
- Esempio: timbratura ore 02:30 del 15/01 → giorno logico 14/01

#### Accesso Amministratore
- **PIN Admin**: `1909` (hardcoded)
- **Trigger**: Click icona ⚙️ → Modal password → Redirect `utenti.html`

---

### 👥 Gestione Dipendenti (utenti.html)

#### Lista Dipendenti Attivi
**Visualizzazione tabella**:
- **Storico**: Link icona orologio → `storico.html?pin=XX`
- **PIN**: Numero identificativo (01-99, zero-padded)
- **Nome/Cognome**: Dati anagrafici
- **Azioni**: Modifica (✏️), Archivia (📦), Elimina (❌)

#### Aggiunta Nuovo Dipendente
**Modal completo con sezioni**:

1. **Dati Anagrafici**:
   - Nome/Cognome (obbligatori)
   - Email (opzionale, validazione format)
   - Telefono (opzionale)
   - PIN (auto-generato o manuale 1-99)

2. **Contratto**:
   - Upload file (PDF/DOC, max 5MB)
   - Descrizione testuale contratto
   - Ore max giornaliere (default 8.00)

#### Modifica Dipendente
**Stesso modal aggiunta ma popolato con dati esistenti**:
- Recupera dati tramite PIN originale
- Aggiornamento atomico in database
- Validazioni integrità (nome/cognome obbligatori)

#### Archiviazione Dipendente  
**Processo completo automatizzato**:

1. **Backup completo**:
   - Dati anagrafici dipendente
   - Tutte le timbrature storiche
   - Generazione file Excel virtuale (JSON)

2. **Archiviazione**:
   - Inserimento in `dipendenti_archiviati`
   - Rimozione da `utenti` (libera PIN)
   - Conferma operazione con statistiche

3. **Risultato**:
   - PIN disponibile per nuovi dipendenti
   - Dati recuperabili in "ex Dipendenti"
   - File Excel scaricabile

---

### 🗂️ Archivio Ex Dipendenti (ex-dipendenti.html)

#### Visualizzazione Archivio
**Tabella dipendenti archiviati**:
- **Nome/Cognome**: Dati originali dipendente
- **Data Archiviazione**: Timestamp archiviazione
- **Azioni**: Scarica Excel, Elimina definitivamente

#### Download Dati Completi
**Generazione Excel automatica**:
- **Sezione 1**: Info dipendente (nome, PIN originale, contratto)
- **Sezione 2**: Storico completo timbrature
- **Formato**: CSV per compatibilità universale
- **Filename**: `Nome_Cognome_timbrature_completo.csv`

#### Eliminazione Definitiva
**Processo irreversibile**:
- Double confirmation con warning esplicito
- Rimozione totale da `dipendenti_archiviati`  
- Perdita definitiva dati (PIN non recuperabile)

---

### 📊 Storico Timbrature Dipendente (storico.html)

#### Filtri Temporali Intelligenti
**Opzioni predefinite**:
- **Mese corrente**: Dal 1° del mese ad oggi
- **Mese precedente**: Mese completo scorso
- **Anno corrente**: Dal 1° gennaio ad oggi
- **Personalizzato**: Range date manuali

#### Tabella Dettagliata
**Colonne**:
- **Data**: Formato italiano (DD/MM/AAAA)
- **Entrata**: Ora primo accesso (HH:MM o -)
- **Uscita**: Ora ultimo accesso (HH:MM o -)
- **Ore Giornaliere**: Calcolo automatico differenza
- **Azioni**: Link modifica (📝) per ogni giorno

#### Calcoli Automatici
**Algoritmi**:
- **Ore giornaliere**: Differenza ultima uscita - prima entrata
- **Totale mensile**: Somma ore giornaliere (formato HH:MM)
- **Giorni lavorativi**: Conteggio giorni con timbrature complete

#### Export Multiplo
**PDF (jsPDF)**:
- Header con logo e intestazioni
- Tabella formattata professionale
- Footer con timestamp generazione

**Excel (SheetJS)**:
- Fogli di calcolo nativi
- Formattazione automatica colonne
- Compatibilità Excel/LibreOffice

**WhatsApp**:
- Messaggio preformattato
- Intestazione aziendale
- Tabella ASCII art per condivisione mobile

#### Modifica Timbrature (Modal)
**Processo**:
1. Click su data → Modal popolato con timbrature esistenti
2. Modifica campi entrata/uscita
3. Salvataggio → Sovrascrittura timbrature giorno
4. Refresh automatico tabella

---

### 🔧 Funzionalità Tecniche Avanzate

#### PWA (Progressive Web App)
**Capabilities**:
- **Installabile**: Add to homescreen iOS/Android
- **Offline-ready**: Risorse cached (senza Service Worker attivo)
- **Responsive**: Design mobile-first
- **Performance**: Ottimizzato per dispositivi touch

#### Anti-Duplicazione Timbrature
**Algoritmo intelligente**:
```javascript
// Verifica ultima timbratura dello stesso tipo
if (ultimaTimbratura?.tipo === tipoCorrente) {
  // Blocca con messaggio specifico
  mostraStatus(`⚠️ ${tipo.toUpperCase()} già registrata!`);
  return;
}
```

#### Gestione Fuso Orario
**Luxon DateTime con zona Europe/Rome**:
```javascript
const ora = DateTime.now().setZone("Europe/Rome");
const dataISO = ora.toISODate();        // YYYY-MM-DD
const oraFormattata = ora.toFormat("HH:mm:ss"); // HH:MM:SS
```

#### Responsive Design Avanzato
**Breakpoints ottimizzati**:
- **Mobile Portrait**: ≤480px (touch ottimizzato)
- **Mobile Landscape**: ≤600px height
- **Tablet**: 481px-768px  
- **Tablet Large**: 769px-1024px
- **Desktop**: ≥1025px

**Touch Optimization**:
- Pulsanti min 48px per accessibilità
- Tap highlight disabled per controllo preciso
- Gesture prevention per prevenire zoom accidentale

#### Error Handling Stratificato
**Livelli gestione errori**:

1. **Network Level**: Timeout, connection lost
2. **Database Level**: Supabase error codes
3. **Business Level**: Validazioni logiche
4. **UI Level**: User-friendly messages

```javascript
// Pattern standard error handling
try {
  const { data, error } = await supabase.operation();
  if (error) throw error;
  
  if (!data) throw new Error('Nessun dato trovato');
  
  return data;
} catch (error) {
  console.error('❌ Errore operazione:', error);
  
  // User message based on error type  
  const userMessage = error.code === 'PGRST116' 
    ? 'Nessun risultato trovato'
    : 'Errore di connessione';
    
  alert(userMessage);
  throw error; // Re-throw per chiamante
}
```

### 🎯 User Experience Features

#### Status Messages Intelligenti
**Tipi di feedback**:
- **Info**: Messaggi informativi (durata 3s)
- **Success**: Operazioni riuscite con lampeggio (7s per timbrature)
- **Warning**: Attenzioni (durata 5s)
- **Error**: Errori con dettagli (durata 6-8s)

#### Animations & Transitions
**Timbrature flash**: Animazione lampeggiante per conferma visiva
**Hover effects**: Feedback sui pulsanti e tabelle
**Loading states**: Spinner e testi dinamici durante operazioni

#### Mobile-First UX
- **Touch targets**: Dimensioni ottimizzate per dita
- **Swipe gestures**: Navigazione naturale
- **Orientation handling**: Layout adattivo portrait/landscape
- **Safe areas**: Supporto notch iPhone/Android

### 🔍 Debugging & Monitoring

#### Console Logging Standards
```javascript
console.log('✅ Operazione completata:', { pin, timestamp, dettagli });
console.warn('⚠️ Attenzione:', messaggioWarning);  
console.error('❌ Errore:', { operazione, errore, context });
```

#### Performance Monitoring
- **Load times**: Tracking caricamento pagine
- **Query performance**: Monitoraggio query Supabase
- **User interactions**: Pattern utilizzo funzionalità
- **Error frequency**: Analisi errori ricorrenti

#### Health Checks
- **Database connectivity**: Test periodico connessione Supabase
- **Feature availability**: Verifica funzionalità core
- **Data integrity**: Controllo consistenza dati
