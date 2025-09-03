
# CHECKLIST VISIVA - EX DIPENDENTI

## Controlli Layout da Verificare Post-Estrazione CSS

### 📊 Tabella Elenco Ex-Dipendenti
- [ ] **Header tabella**: Colore blu (#38bdf8), background gradient, sticky
- [ ] **Righe alternate**: Background rgba(51, 65, 85, 0.3) su righe pari
- [ ] **Hover righe**: Background blu trasparente + scale(1.01)
- [ ] **Padding celle**: 12px verticale, 15px header
- [ ] **Bordi**: Sottili grigi tra le righe

### 🔘 Bottoni Azione
- [ ] **Stato normale**: Gradient blu/grigio/rosso per view/restore/delete
- [ ] **Hover**: Opacity 1, scale(1.1), colori più scuri
- [ ] **Active**: Nessun cambiamento comportamento
- [ ] **Dimensioni**: Bottoni piccoli 6px 12px, font 12px

### 🎭 Modali
- [ ] **Apertura**: Animazione slideIn, blur backdrop
- [ ] **Overlay**: Background rgba(0,0,0,0.7) + backdrop-filter blur(5px)
- [ ] **Posizione**: Centrata, max-width 500px, margin 5% auto
- [ ] **Header**: Blu, separatore, X rossa su hover
- [ ] **Form**: Input scuri, focus blu, textarea ridimensionabile
- [ ] **Chiusura**: Click X o fuori modale

### 📱 Responsive
- [ ] **320px**: Bottoni centrati, form colonna singola
- [ ] **768px**: Controlli in colonna, tabella scrollabile orizzontale
- [ ] **1024px+**: Layout completo, max-width 1200px centrato

### 🖨️ Stampa/Export
- [ ] **Print media**: Sfondo bianco, testo nero, nasconde controlli
- [ ] **CSV/Excel**: Bottoni funzionanti (se presenti)

### 🎨 Altri Elementi Critici
- [ ] **Ricerca**: Input focus blu, transizione smooth
- [ ] **Background**: Gradient blu scuro mantenuto
- [ ] **Animazioni**: Smooth 0.3s su hover/focus
- [ ] **File upload**: Drag&drop area, stati hover/dragover
- [ ] **Typography**: Font Segoe UI, gerarchie colori mantenute

## ⚠️ Controlli Prioritari
1. **Tabella hover**: Deve mantenere effetto scale + colore
2. **Modali**: Animazione apertura + blur background
3. **Bottoni**: Tutti i gradienti e hover funzionanti
4. **Mobile**: Layout responsive senza break

## 🧪 Test Rapidi
- Hover su ogni riga tabella
- Apertura/chiusura modale
- Ridimensiona finestra 320px → 1200px
- Stampa (Ctrl+P) verifica layout
