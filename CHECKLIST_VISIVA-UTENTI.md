
# CHECKLIST VISIVA - GESTIONE UTENTI

## Controlli Layout da Verificare Post-Estrazione CSS

### 📊 Tabella Dipendenti
- [ ] **Header tabella**: Background blu scuro (#1f3a56), altezza 54px
- [ ] **Righe dipendenti**: Background #1e293b, altezza 50px
- [ ] **Hover righe**: Effetto hover sottile, cursor pointer
- [ ] **Colonne**: Storico 12%, PIN 12%, Nome 17.5%, Cognome 17.5%, Azioni 12.3%
- [ ] **Bordi**: Grigi #374151 tra celle, radius 16px tabella
- [ ] **Overflow**: Tabella con box-shadow, layout fisso

### 🎭 Modali (Nuovo Dipendente / Dettagli)
- [ ] **Apertura**: Display flex, overlay rgba(0,0,0,0.8), z-index 10000
- [ ] **Contenuto**: Background #1e293b, border-radius 16px, padding 30px
- [ ] **Header**: Titolo blu (#60a5fa), bottone X rosso (#dc2626)
- [ ] **Chiusura**: Click X o fuori modale, display none
- [ ] **Sezioni**: Titoli gialli (#fbbf24), bordo sinistro 4px
- [ ] **Scroll**: max-height 90vh, overflow-y auto

### 📝 Campi Form nei Modali
- [ ] **Input/textarea**: Background #374151, border #4b5563, colore bianco
- [ ] **Focus**: Border blu, box-shadow subtle
- [ ] **Labels**: Grigio chiaro (#94a3b8), font-size 14px
- [ ] **Griglia**: Campo-gruppo 2 colonne su desktop, 1 su mobile
- [ ] **Validation**: Stati errore visibili, messaggi appropriati

### 📎 Upload Area
- [ ] **Stato normale**: Border dashed #4b5563, background #374151
- [ ] **Hover**: Border blu (#60a5fa)
- [ ] **Drag over**: Border #3b82f6, background #1e40af
- [ ] **File selezionato**: Info verde (#10b981), nome file, dimensione
- [ ] **Rimozione**: Bottone rosso (#dc2626), hover #b91c1c

### 🔘 Bottoni Azione
- [ ] **Tabella icone**: ✏️ Modifica, 📦 Archivia, ❌ Elimina
- [ ] **Hover tabella**: Background rgba(255,255,255,0.1)
- [ ] **Modal bottoni**: Annulla grigio (#6b7280), Salva verde (#16a34a)
- [ ] **Stati**: Hover più scuro, disabled quando loading
- [ ] **Azioni principali**: Login Utenti arancione, Aggiungi verde, ex Dipendenti giallo

### 📱 Responsive Layout
- [ ] **320px**: Padding ridotto, font-size 10px tabella, modali margin 5px
- [ ] **480px**: Grid colonne 1 sola, bottoni full-width, icone 12px
- [ ] **768px**: Tabella font 12px, modal padding 15px, grid mix
- [ ] **1024px**: Layout desktop completo, icone 22px, modal max-width 800px
- [ ] **Touch**: Bottoni area touch adeguata, scroll smooth

### 🎨 Stati Speciali
- [ ] **Caricamento**: "Salvando..." su bottoni, disabled state
- [ ] **Errori**: Alert browser, validazione form, colori errore
- [ ] **Successo**: Alert "aggiunto/modificato con successo"
- [ ] **Tabella vuota**: Messaggio centrato, istruzioni primo utilizzo
- [ ] **Logo**: Posizionamento corretto, dimensioni responsive

---

**Nota**: Verificare che tutti gli elementi mantengano comportamento identico al CSS inline originale. Layout deve essere pixel-perfect dopo estrazione.
