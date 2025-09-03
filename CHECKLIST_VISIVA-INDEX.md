
# CHECKLIST VISIVA - INDEX.HTML (BADGEBOX HOMEPAGE)

## Controlli Layout da Verificare Post-Estrazione CSS

### 🔢 Tastierino PIN e Input
- [ ] **Display PIN**: Input readonly, centratura, placeholder "PIN"
- [ ] **Tastierino numerico**: Grid 3x4, bottoni responsivi
- [ ] **Bottone C**: Clear function, posizionamento angolo
- [ ] **Bottone ⚙️**: Admin access, icona visibile
- [ ] **Focus states**: Input attivo, outline visibile
- [ ] **Maxlength**: Limitazione 2 caratteri PIN

### 🎨 Stati Pulsanti e Interazioni
- [ ] **Hover effects**: Scale/colore su tastierino
- [ ] **Active states**: Feedback visivo al click
- [ ] **Disabled states**: Bottoni inattivi durante processing
- [ ] **Loading states**: "Verifica in corso..." styling
- [ ] **Entrata/Uscita**: Colori distintivi (verde/rosso)
- [ ] **Transizioni**: Smooth animations 0.3s

### 📢 Messaggi e Status
- [ ] **Status display**: Centratura, visibilità
- [ ] **Tipologie**: info, success, error, warning, loading
- [ ] **Timbratura flash**: Animazione lampeggiante 7s
- [ ] **Durata messaggi**: 3s standard, 7s timbrature
- [ ] **Colori stato**: Verde success, rosso error, giallo warning
- [ ] **Multilinea**: Supporto \n nei messaggi lunghi

### 📱 Layout Responsive
- [ ] **320px (mobile)**: Tastierino ridimensionato, testo leggibile
- [ ] **768px (tablet)**: Layout bilanciato, spaziatura adeguata
- [ ] **1024px+ (desktop)**: Centratura, max-width container
- [ ] **Orientamento**: Portrait/landscape funzionanti
- [ ] **Touch targets**: Min 44px per mobile accessibility
- [ ] **Viewport meta**: Scaling e zoom corretti

### 🏠 Elementi Strutturali Homepage
- [ ] **Logo BADGEBOX**: Dimensioni, centratura, quality
- [ ] **Main container**: Centratura verticale/orizzontale
- [ ] **Background**: Gradient linear-gradient mantenuto
- [ ] **Data/ora display**: Formato italiano, aggiornamento real-time
- [ ] **PWA icons**: Favicons, apple-touch-icon visibili
- [ ] **Font family**: 'Segoe UI' fallback chain

### 🔐 Modal Admin Access
- [ ] **Overlay**: Background rgba blur, z-index 9999
- [ ] **Modal box**: Centratura, border-radius, shadow
- [ ] **Input password**: Styling, placeholder, focus
- [ ] **Bottoni**: Conferma verde, Annulla rosso
- [ ] **Chiusura**: ESC key, click esterno
- [ ] **Responsive**: Mobile-friendly sizing

### ⚡ Performance e Funzionalità
- [ ] **Supabase init**: Client connection, no console errors
- [ ] **Luxon DateTime**: Timezone Europe/Rome, formato corretto
- [ ] **Event listeners**: Click/keypress funzionanti
- [ ] **PIN validation**: 2 digits max, numeric only
- [ ] **Admin PIN**: "1909" check, redirect to utenti.html
- [ ] **Real-time clock**: Aggiornamento ogni secondo

---

**Nota**: Questa checklist verifica che l'estrazione CSS non abbia compromesso l'aspetto visivo o funzionale della homepage BADGEBOX. Layout deve restare identico al CSS inline originale.
