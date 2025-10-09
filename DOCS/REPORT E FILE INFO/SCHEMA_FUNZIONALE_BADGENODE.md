# 📱 SCHEMA FUNZIONALE BADGENODE - GUIDA COMPLETA

**Versione**: 1.0  
**Data**: 2025-10-07  
**Scopo**: Schema completo dei flussi, pagine e funzionalità per replicazione applicazione  

---

## 🎯 PANORAMICA APPLICAZIONE

### **Concept**
BadgeNode è una **PWA (Progressive Web App)** per la gestione delle timbrature aziendali con sistema di autenticazione basato su PIN dipendenti. L'applicazione gestisce timbrature in tempo reale, storico completo, gestione utenti e archiviazione ex-dipendenti.

### **Architettura Visuale**
```
┌─────────────────────────────────────────────────────────────┐
│                    BADGENODE PWA                            │
├─────────────────────────────────────────────────────────────┤
│  🏠 INDEX.HTML     📊 STORICO.HTML     👥 UTENTI.HTML      │
│  (Timbrature)      (Report)            (Gestione)          │
│                                                             │
│              📦 EX-DIPENDENTI.HTML                         │
│              (Archivio)                                     │
└─────────────────────────────────────────────────────────────┘
```

### **Flusso di Navigazione Principale**
```
START → PIN Input → Pagina Principale → Funzionalità Specifiche
  ↓         ↓            ↓                    ↓
 1-99    Validazione   index.html         Timbrature
Admin    Supabase     storico.html       Storico
1909     Database     utenti.html        Gestione
                      ex-dipendenti.html  Archivio
```

---

## 🏠 PAGINA PRINCIPALE: INDEX.HTML (Timbrature Live)

### **Layout Visuale**
```
┌─────────────────────────────────────────────────────────────┐
│                    🏷️ BADGENODE LOGO                        │
│                                                             │
│  👤 Francisco Candussi Baez                    📅 07/10/25  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   🟢 ENTRATA    │  │   🔴 USCITA     │                  │
│  │                 │  │                 │                  │
│  │   [15:30:45]    │  │   [--:--:--]    │                  │
│  │                 │  │                 │                  │
│  │   ✅ Registra   │  │   ⏸️ Disabilitato│                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  📊 Ore Oggi: 7.5h          🕐 Ultima: Entrata 08:00      │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┤
│  │  📊 Storico  👥 Utenti  📦 Ex-Dipendenti  🚪 Esci     │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### **Funzionalità Principali**

#### **1. Autenticazione PIN**
- **Input**: Campo PIN (1-99 per dipendenti, 1909 per admin)
- **Validazione**: Controllo esistenza PIN in database Supabase
- **Persistenza**: Sessione mantenuta fino a logout esplicito
- **Feedback**: Messaggio errore per PIN non validi

#### **2. Timbratura Entrata**
- **Stato**: Attivo se nessuna entrata registrata oggi
- **Click**: Registra timestamp corrente come entrata
- **Feedback**: Conferma visiva + aggiornamento interfaccia
- **Logica**: Considera giorno logico per orari notturni (00:00-04:59)

#### **3. Timbratura Uscita**
- **Stato**: Attivo solo dopo entrata registrata
- **Click**: Registra timestamp corrente come uscita
- **Feedback**: Calcolo ore lavorate + conferma
- **Logica**: Gestisce turni notturni con uscita giorno successivo

#### **4. Dashboard Tempo Reale**
- **Ore Oggi**: Calcolo dinamico ore lavorate (entrata → ora corrente)
- **Ultima Timbratura**: Tipo e orario ultima registrazione
- **Status Visivo**: Colori diversi per entrata (verde) e uscita (rosso)
- **Timer Live**: Aggiornamento ogni secondo se in turno attivo

#### **5. Menu Navigazione**
- **Storico**: Accesso a storico-timbrature con PIN precompilato
- **Utenti**: Solo per admin (PIN 1909) - gestione dipendenti
- **Ex-Dipendenti**: Solo per admin - archivio storico
- **Esci**: Logout e ritorno a schermata PIN

---

## 📊 PAGINA STORICO: STORICO.HTML (Report e Modifiche)

### **Layout Visuale**
```
┌─────────────────────────────────────────────────────────────┐
│  🏷️ BADGENODE          Storico Timbrature                   │
│                                                             │
│  👤 Francisco Candussi Baez                                │
│                                                             │
│  📅 [Mese corrente ▼] 📅 01/09/2025 📅 30/09/2025         │
│      Mese precedente     [Calendario]   [Calendario]       │
│      2 mesi fa                                              │
│                                          📄 PDF  📊 XLS    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Data     │Mese    │Entrata │Uscita  │Ore   │Extra│✏️  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │01 Lun    │Set 2025│08:30   │17:30   │8.00  │     │✏️  │ │
│  │02 Mar    │Set 2025│08:00   │18:30   │10.50 │2.50 │✏️  │ │
│  │03 Mer    │Set 2025│—       │—       │0.00  │     │✏️  │ │
│  │...       │        │        │        │      │     │    │ │
│  │30 Sab    │Set 2025│09:00   │17:00   │8.00  │     │✏️  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │TOTALE    │        │        │        │168.5 │12.5 │    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🔙 Torna alla Timbratura                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Funzionalità Principali**

#### **1. Filtri Temporali**
- **Dropdown Mese**: Corrente, Precedente, 2 mesi fa
- **Date Picker**: Selezione range personalizzato (da/a)
- **Auto-Update**: Ricaricamento automatico dati al cambio filtro
- **Persistenza**: Mantiene filtro selezionato durante sessione

#### **2. Tabella Storico Completa**
- **Tutti i giorni**: Mostra ogni giorno del periodo (anche senza timbrature)
- **Giorni vuoti**: Visualizza "—" per entrata/uscita, "0.00" per ore
- **Ore Extra**: Colonna dedicata (giallo/bold) per ore oltre contratto
- **Giorno Logico**: Raggruppa timbrature per giorno lavorativo

#### **3. Calcoli Automatici**
- **Ore Giornaliere**: Differenza uscita - entrata (gestisce turni notturni)
- **Ore Extra**: `Math.max(0, oreLavorate - oreContrattuali)`
- **Totali Mensili**: Somma ore totali e ore extra del periodo
- **Validazioni**: Controllo coerenza entrata/uscita

#### **4. Modifica Timbrature (Matita ✏️)**
- **Click Matita**: Apre modale modifica per giorno specifico
- **Modale**: Form con data entrata, ora entrata, data uscita, ora uscita
- **Validazioni**: Controllo orari validi e coerenza temporale
- **Salvataggio**: Aggiornamento database + refresh tabella
- **Eliminazione**: Opzione rimozione timbrature giorno

#### **5. Export Dati**
- **PDF**: Report formattato con logo, intestazione, tabella completa
- **Excel/CSV**: Dati strutturati per analisi esterne
- **Contenuto**: Include info dipendente + storico + totali

---

## 👥 PAGINA GESTIONE: UTENTI.HTML (Solo Admin)

### **Layout Visuale**
```
┌─────────────────────────────────────────────────────────────┐
│  🏷️ BADGENODE          Gestione Dipendenti                 │
│                                                             │
│  ➕ Aggiungi Nuovo Dipendente                              │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │📊Storico│PIN │Nome      │Cognome    │Azioni            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │   📊    │ 71 │Francisco │Candussi B.│✏️ Modifica 📦 Arch│ │
│  │   📊    │ 72 │Mario     │Rossi      │✏️ Modifica 📦 Arch│ │
│  │   📊    │ 73 │Giulia    │Bianchi    │✏️ Modifica 📦 Arch│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🔙 Torna alla Timbratura                                  │
└─────────────────────────────────────────────────────────────┘
```

### **Funzionalità Principali**

#### **1. Lista Dipendenti Attivi**
- **Visualizzazione**: Tabella con PIN, Nome, Cognome
- **Link Storico**: Click su 📊 → Accesso diretto storico dipendente
- **Ordinamento**: Per PIN crescente
- **Ricerca**: Filtro real-time per nome/cognome

#### **2. Aggiungi Nuovo Dipendente**
- **Modale**: Form completo dati anagrafici
- **Campi Obbligatori**: Nome, Cognome, PIN (1-99)
- **Campi Opzionali**: Email, Telefono, Descrizione Contratto
- **Ore Contrattuali**: Campo numerico (default 8.00, step 0.25)
- **Validazioni**: PIN univoco, formato email, range ore

#### **3. Modifica Dipendente (✏️)**
- **Modale Pre-popolata**: Tutti i campi con dati esistenti
- **Modifica Completa**: Tutti i campi editabili tranne PIN
- **Ore Contrattuali**: Impatto immediato su calcoli ore extra
- **Salvataggio**: Aggiornamento database + refresh lista

#### **4. Archiviazione Dipendente (📦)**
- **Conferma**: Dialog conferma con nome dipendente
- **Processo**: Spostamento da `utenti` a `dipendenti_archiviati`
- **Backup**: Salvataggio storico timbrature in formato JSON
- **Cleanup**: Rimozione da lista attivi

---

## 📦 PAGINA ARCHIVIO: EX-DIPENDENTI.HTML (Solo Admin)

### **Layout Visuale**
```
┌─────────────────────────────────────────────────────────────┐
│  🏷️ BADGENODE          Archivio Ex-Dipendenti              │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │📊Storico│PIN │Nome      │Cognome    │Azioni            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │   📊    │ 65 │Marco     │Verdi      │📄 CSV  🗑️ Elimina│ │
│  │   📊    │ 68 │Anna      │Neri       │📄 CSV  🗑️ Elimina│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🔙 Torna alla Gestione Utenti                             │
└─────────────────────────────────────────────────────────────┘
```

### **Funzionalità Principali**

#### **1. Lista Ex-Dipendenti**
- **Visualizzazione**: Dipendenti archiviati con data archiviazione
- **Ordinamento**: Per data archiviazione (più recenti primi)
- **Ricerca**: Filtro per nome/cognome ex-dipendente

#### **2. Visualizzazione Storico Archiviato (📊)**
- **Accesso**: Storico completo timbrature ex-dipendente
- **Read-Only**: Solo visualizzazione, nessuna modifica
- **Export**: Possibilità download dati storici

#### **3. Download CSV (📄)**
- **Contenuto**: Dati anagrafici + storico timbrature completo
- **Formato**: CSV strutturato per analisi esterne
- **Nome File**: `{Nome}_{Cognome}_timbrature.csv`

#### **4. Eliminazione Definitiva (🗑️)**
- **Conferma Doppia**: Warning + conferma eliminazione
- **Irreversibile**: Rimozione completa da database
- **Backup Consigliato**: Download CSV prima eliminazione

---

## 🔄 FLUSSI OPERATIVI PRINCIPALI

### **Flusso 1: Timbratura Giornaliera Standard**
```
1. Dipendente inserisce PIN → Validazione → Dashboard personale
2. Click "ENTRATA" → Registrazione timestamp → Feedback conferma
3. Lavoro durante giornata → Timer live aggiornamento ore
4. Click "USCITA" → Registrazione timestamp → Calcolo ore finali
5. Logout automatico o manuale
```

### **Flusso 2: Correzione Timbratura Passata**
```
1. Accesso Storico → Selezione periodo → Visualizzazione tabella
2. Click matita (✏️) su giorno da correggere → Modale modifica
3. Inserimento/correzione orari → Validazione → Salvataggio
4. Refresh automatico tabella → Aggiornamento totali
```

### **Flusso 3: Gestione Nuovo Dipendente (Admin)**
```
1. Login Admin (PIN 1909) → Accesso Gestione Utenti
2. Click "Aggiungi Nuovo" → Modale inserimento dati
3. Compilazione form completo → Validazione → Salvataggio
4. Refresh lista → Nuovo dipendente disponibile per timbrature
```

### **Flusso 4: Archiviazione Dipendente (Admin)**
```
1. Gestione Utenti → Click "Archivia" su dipendente
2. Conferma archiviazione → Backup automatico dati
3. Spostamento in archivio → Rimozione da attivi
4. Accesso Ex-Dipendenti per gestione archivio
```

### **Flusso 5: Export Report Mensile**
```
1. Storico → Selezione periodo desiderato
2. Click PDF/Excel → Generazione report
3. Download automatico file → Salvataggio locale
```

---

## 🎨 ELEMENTI UI/UX DISTINTIVI

### **Design System**
- **Colori**: Tema scuro (background #1a1a1a, testi chiari)
- **Accent**: Arancione per elementi attivi (#f97316)
- **Status**: Verde (entrata), Rosso (uscita), Giallo (ore extra)
- **Typography**: Font system, dimensioni responsive

### **Componenti Ricorrenti**

#### **1. Card Timbratura**
- **Forma**: Rettangolare arrotondata con ombra
- **Stati**: Attivo (colorato), Disabilitato (grigio)
- **Feedback**: Animazione click + cambio colore

#### **2. Tabella Dati**
- **Header Fisso**: Intestazioni sempre visibili
- **Righe Alternate**: Zebra striping per leggibilità
- **Responsive**: Scroll orizzontale su mobile
- **Azioni**: Icone intuitive (✏️📊📦🗑️)

#### **3. Modale**
- **Overlay**: Background semi-trasparente
- **Contenuto**: Centrato, max-width responsive
- **Form**: Campi chiari con label e placeholder
- **Azioni**: Bottoni Salva/Annulla ben distinti

#### **4. Navigation**
- **Breadcrumb**: Sempre visibile percorso corrente
- **Menu**: Icone + testo per chiarezza
- **Logout**: Sempre accessibile da ogni pagina

### **Responsive Design**
- **Mobile First**: Ottimizzato per smartphone
- **Breakpoints**: 320px, 768px, 1024px, 1400px
- **Touch Friendly**: Bottoni dimensioni adeguate
- **Scroll**: Gestione contenuti lunghi

### **Feedback Utente**
- **Loading States**: Spinner durante operazioni
- **Success/Error**: Toast notifications colorate
- **Validation**: Messaggi errore inline real-time
- **Confirmation**: Dialog per azioni critiche

---

## 🔐 LOGICHE DI SICUREZZA E ACCESSO

### **Autenticazione**
- **PIN System**: Semplice ma efficace per ambiente industriale
- **Session Management**: Persistenza sicura lato client
- **Auto-Logout**: Timeout inattività configurabile
- **Admin Separation**: PIN speciale per funzioni amministrative

### **Autorizzazioni**
```
PIN 1-99 (Dipendenti):
✅ Timbrature personali
✅ Storico personale
✅ Modifica timbrature proprie
❌ Gestione utenti
❌ Accesso dati altri dipendenti

PIN 1909 (Admin):
✅ Tutte le funzioni dipendenti
✅ Gestione completa utenti
✅ Accesso storico tutti dipendenti
✅ Archiviazione/eliminazione
✅ Export dati completi
```

### **Validazioni Business**
- **Timbrature**: Non sovrapposte, orari logici
- **Ore Extra**: Calcolo automatico basato su contratto
- **Giorno Logico**: Gestione turni notturni
- **Data Integrity**: Controlli coerenza temporale

---

## 📱 ESPERIENZA UTENTE OTTIMIZZATA

### **Workflow Dipendente Tipo**
1. **Arrivo**: PIN → Dashboard → Entrata (2 click)
2. **Durante**: Visualizzazione ore live, no interazioni
3. **Partenza**: Uscita → Conferma ore → Logout (2 click)
4. **Correzioni**: Storico → Matita → Modifica → Salva (4 click)

### **Workflow Admin Tipo**
1. **Gestione**: PIN Admin → Utenti → Operazioni varie
2. **Monitoring**: Accesso storico qualsiasi dipendente
3. **Reports**: Export periodici per contabilità
4. **Manutenzione**: Archiviazione ex-dipendenti

### **Ottimizzazioni UX**
- **Zero Training**: Interfaccia auto-esplicativa
- **Error Prevention**: Validazioni preventive
- **Quick Actions**: Operazioni comuni in 1-2 click
- **Visual Hierarchy**: Informazioni importanti evidenziate
- **Consistent Patterns**: Comportamenti prevedibili

---

## 🎯 OBIETTIVI FUNZIONALI RAGGIUNTI

### **Per i Dipendenti**
✅ **Semplicità**: Timbratura in 2 click  
✅ **Chiarezza**: Status sempre visibile  
✅ **Autonomia**: Correzioni self-service  
✅ **Trasparenza**: Ore e calcoli sempre accessibili  

### **Per l'Amministrazione**
✅ **Controllo Completo**: Gestione centralizzata  
✅ **Reportistica**: Export automatizzati  
✅ **Storicizzazione**: Archivio organizzato  
✅ **Compliance**: Tracciabilità completa  

### **Per l'Azienda**
✅ **Efficienza**: Riduzione tempi gestione  
✅ **Accuratezza**: Calcoli automatici ore extra  
✅ **Flessibilità**: Gestione turni complessi  
✅ **Scalabilità**: Supporto crescita organico  

---

**Schema generato**: 2025-10-07 16:30  
**Versione BadgeNode**: 1.0  
**Completezza**: ✅ **100% - Tutti i flussi e funzionalità documentati**  
**Utilizzo**: Guida completa per replicazione identica su Windsurf  
**Focus**: Logiche visive e funzionali, pronto per implementazione
