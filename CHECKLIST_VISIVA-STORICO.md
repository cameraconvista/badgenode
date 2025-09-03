
# CHECKLIST VISIVA - STORICO TIMBRATURE

## Controlli Layout da Verificare Post-Estrazione CSS

### 📊 Tabella Storico Timbrature
- [ ] **Header tabella**: Colore, background, sticky positioning
- [ ] **Righe dati**: Background alternate, padding consistente
- [ ] **Hover righe**: Effetti di hover mantengono colore/scala
- [ ] **Colonne**: Data, Entrata, Uscita, Ore, Extra, Modifica - larghezza corretta
- [ ] **Footer totali**: Riga totale ore mensile, formattazione corretta

### 🎛️ Filtri e Controlli
- [ ] **Select filtro mese**: Dropdown styling, opzioni colore
- [ ] **Input date**: Calendario styling, icone calendario
- [ ] **Range personalizzato**: Aggiornamento automatico select
- [ ] **Header fisso**: Posizionamento, scroll behaviour
- [ ] **Container filtro**: Layout flex, responsive wrapping

### 📅 Calendario Popup
- [ ] **Apertura**: Click icona calendario, positioning corretto
- [ ] **Z-index**: Popup sopra altri elementi
- [ ] **Chiusura**: Click esterno, selezione data
- [ ] **Styling**: Tema scuro consistente, navigazione mesi
- [ ] **Responsive**: Dimensioni adatte a mobile

### 🔘 Bottoni Export e Azioni
- [ ] **PDF**: Icona, colore, hover state
- [ ] **Excel**: Icona, colore, loading state "Generando Excel..."
- [ ] **WhatsApp**: Icona SVG, verde WhatsApp, link corretto
- [ ] **Google Sheets**: Icona, colore, funzionalità
- [ ] **Torna Utenti**: Posizione assoluta, hover effects

### 🪟 Modal Modifica Timbrature
- [ ] **Overlay**: Background blur, click-to-close
- [ ] **Posizionamento**: Centrato, responsive
- [ ] **Form**: Input date/time styling, labels
- [ ] **Bottoni modal**: Salva/Elimina/Chiudi - colori e stati
- [ ] **Animazioni**: Apertura/chiusura smooth

### 📱 Responsive Breakpoints
- [ ] **320px**: 
  - [ ] Tabella scrollabile orizzontale
  - [ ] Bottoni stack verticale
  - [ ] Font sizes ridotte
  - [ ] Header compatto
  
- [ ] **768px**:
  - [ ] Controlli in due righe
  - [ ] Tabella responsive
  - [ ] Modal sizing appropriato
  
- [ ] **1024px+**:
  - [ ] Layout completo desktop
  - [ ] Max-width container
  - [ ] Tutti elementi visibili

### 🎨 Elementi Stilistici Specifici
- [ ] **Intestazione utente**: Nome/cognome, styling titolo
- [ ] **Container**: Max-width, centrato, padding
- [ ] **Icone**: Dimensioni consistenti (32px), svg coloring
- [ ] **Gradients**: Background, bottoni, hover states
- [ ] **Shadows**: Box-shadow tabella, bottoni, modal
- [ ] **Transitions**: Smooth su hover, focus, state changes

### ⚡ Funzionalità Critica
- [ ] **Real-time loading**: Stati loading bottoni export
- [ ] **Error states**: Gestione errori visuali
- [ ] **Success feedback**: Conferme operazioni
- [ ] **Touch targets**: Dimensioni minime 44px mobile
- [ ] **Scroll performance**: Smooth scrolling, momentum iOS

### 🖨️ Print/Export Styling
- [ ] **Print media**: Nascondi controlli, ottimizza tabella
- [ ] **PDF generation**: Layout corretto, font consistency  
- [ ] **Excel export**: Dati completi, formattazione

---

**Nota**: Questa checklist verifica che l'estrazione CSS non abbia compromesso l'aspetto visivo o funzionale della pagina storico.html. Ogni elemento deve comportarsi esattamente come prima dell'estrazione.
