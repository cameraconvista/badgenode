
# PROJECT_STRUCTURE.md

## Struttura del Progetto BADGEBOX

### 📁 Directory Root
```
/
├── assets/                     # Risorse statiche
├── .github-config.json        # Configurazione GitHub
├── .gitignore                 # File ignorati da Git
├── .htaccess                  # Configurazione Apache
├── .replit                    # Configurazione Replit IDE
├── _redirects                 # Regole redirect Netlify
├── backup-current-system.js   # Script backup sistema
├── create-zip.js             # Utility creazione ZIP
├── fix-database.sql          # Script correzioni DB
├── index.html                # 🏠 Homepage - Sistema timbrature
├── manifest.json             # Configurazione PWA
├── netlify.toml              # Configurazione deploy Netlify
├── package.json              # Dipendenze Node.js
├── setup-database.sql        # Script inizializzazione DB
├── storico.html              # 📊 Pagina storico timbrature
├── style.css                 # 🎨 Stili globali applicazione
├── utenti.html               # 👥 Gestione dipendenti attivi
├── ex-dipendenti.html        # 🗂️ Archivio ex dipendenti
├── vite.config.js            # Configurazione Vite dev server
└── upgrade.sh                # Script aggiornamento sistema
```

### 📂 assets/
Directory per tutte le risorse statiche dell'applicazione.

#### 📁 assets/icons/
- **Responsabilità**: Icone e loghi dell'applicazione
- **Convenzione naming**: lowercase con trattini per icone generiche, CamelCase per loghi specifici
```
icons/
├── BADGENODE.png           # Logo principale app
├── calendario.png          # Icona calendario
├── cancella.png           # Icona eliminazione
├── esporta.png            # Icona esportazione Excel
├── freccia.png            # Icone navigazione
├── googlesheet.png        # Icona Google Sheets
├── invia.png              # Icona invio/submit
├── logo.png               # Logo standard
├── logoBN 2.png           # Logo alternativo
├── matita-colorata.png    # Icona modifica
├── orologio.png           # Icona storico timbrature
└── pdf.png                # Icona PDF
```

#### 📁 assets/scripts/
- **Responsabilità**: Moduli JavaScript riutilizzabili
- **Convenzione naming**: kebab-case con suffisso funzionale

```
scripts/
├── calendar-utils.js       # Utilità gestione calendario
├── calendario-popup.js     # Popup calendario interattivo
├── modale-modifica.js     # Gestione modali modifica timbrature
├── storico-logic.js       # Logica business storico dipendenti
├── supabase-client.js     # Client configurato Supabase + utilities
├── timbrature-data.js     # Gestione dati timbrature (CRUD)
└── timbrature-render.js   # Rendering tabelle timbrature
```

#### 📁 assets/styles/
- **Responsabilità**: Fogli di stile modulari
```
styles/
└── storico-styles.css      # Stili specifici pagina storico
```

### 🔧 File di Configurazione

#### Development & Build
- **vite.config.js**: Configurazione dev server (porta 5173, hot reload)
- **package.json**: Dipendenze, script npm
- **.replit**: Configurazione IDE Replit (workflow, porte)

#### Deployment
- **netlify.toml**: Configurazione hosting Netlify
- **_redirects**: Regole redirect single-page app
- **.htaccess**: Configurazione Apache (fallback)

#### PWA (Progressive Web App)
- **manifest.json**: Metadati PWA (icone, colori, orientamento)

### 🗄️ Database & Backend
- **setup-database.sql**: Schema iniziale tabelle Supabase
- **fix-database.sql**: Patch e correzioni DB

### 📱 Pagine Principali

#### index.html - Sistema Timbrature
- **Funzione**: Homepage con tastierino PIN e pulsanti Entrata/Uscita
- **Componenti**: Keypad, display orario, status messages
- **Integrazione**: Supabase per timbrature, validazioni anti-duplicazione

#### utenti.html - Gestione Dipendenti
- **Funzione**: CRUD dipendenti attivi
- **Features**: 
  - Lista dipendenti con PIN
  - Modale aggiunta/modifica
  - Archiviazione dipendenti (libera PIN)
  - Link storico individuale

#### ex-dipendenti.html - Archivio
- **Funzione**: Visualizzazione dipendenti archiviati
- **Features**: 
  - Scarico Excel dati completi
  - Eliminazione definitiva
  - Data archiviazione

#### storico.html - Storico Timbrature
- **Funzione**: Visualizzazione dettagliata timbrature dipendente
- **Features**:
  - Filtri temporali (mese corrente, precedente, personalizzato)
  - Esportazione PDF/Excel
  - Condivisione WhatsApp
  - Modifica/eliminazione timbrature

### 🎨 Styling
- **style.css**: Stili globali, responsive design, PWA optimizations
- **Approccio**: CSS vanilla, media queries extensive, mobile-first

### 📦 Utilities & Tools
- **backup-current-system.js**: Backup automatico configurazioni
- **create-zip.js**: Creazione archivi progetto
- **upgrade.sh**: Script aggiornamento versioni

### 🔄 Convenzioni

#### Naming Files
- **HTML**: kebab-case (es: `ex-dipendenti.html`)
- **CSS**: kebab-case (es: `storico-styles.css`)
- **JS Modules**: kebab-case (es: `calendar-utils.js`)
- **Assets**: descriptive lowercase (es: `orologio.png`)

#### Code Organization
- **Modularità**: Un file = una responsabilità specifica
- **Separazione**: Business logic separata da rendering
- **Riusabilità**: Utilities condivise in `/scripts`

#### Database Naming
- **Tabelle**: snake_case (es: `dipendenti_archiviati`)
- **Campi**: snake_case (es: `ore_contrattuali`)
- **Relazioni**: PIN come chiave di collegamento

### 🔗 Flusso Dati
1. **Timbratura**: index.html → Supabase `timbrature`
2. **Gestione utenti**: utenti.html → Supabase `utenti` 
3. **Archiviazione**: utenti.html → `dipendenti_archiviati` (libera PIN)
4. **Storico**: storico.html → query `timbrature` + utilities rendering
5. **Ex dipendenti**: ex-dipendenti.html → `dipendenti_archiviati`
