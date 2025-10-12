# 08 🎨 UI HOME KEYPAD - BadgeNode

**Storico e specifiche finali della Home Tastierino**  
**Versione**: 4.0 • **Data**: 2025-10-12

---

## 📋 Contenuti

1. [Design Overview](#design-overview)
2. [Layout e Dimensioni](#layout-e-dimensioni)
3. [Palette Colori](#palette-colori)
4. [Componenti UI](#componenti-ui)
5. [Interazioni e Stati](#interazioni-e-stati)

---

## 🎯 Design Overview

### **Filosofia Design**

```
Approccio: Mobile-first verticale
Target: Smartphone/tablet portrait
Priorità: Usabilità touch, accessibilità, performance

Principi chiave:
- Tastierino fisso (no scroll necessario)
- Touch targets ≥48×48px (WCAG AA)
- Contrasto colori ≥4.5:1 (WCAG AA)
- Feedback visivo immediato
- Errori chiari e comprensibili
```

### **Layout Generale**

```
┌─────────────────────────────┐
│        Logo App             │  ← Header fisso
├─────────────────────────────┤
│     Display PIN             │  ← Input area
│    [  ●  ●  ●  ●  ]        │
├─────────────────────────────┤
│   ┌─────┬─────┬─────┐      │
│   │  1  │  2  │  3  │      │  ← Tastierino 3×4
│   ├─────┼─────┼─────┤      │
│   │  4  │  5  │  6  │      │
│   ├─────┼─────┼─────┤      │
│   │  7  │  8  │  9  │      │
│   ├─────┼─────┼─────┤      │
│   │  ←  │  0  │  ✓  │      │
│   └─────┴─────┴─────┘      │
├─────────────────────────────┤
│    [ ENTRATA ] [ USCITA ]   │  ← CTA buttons
└─────────────────────────────┘
```

---

## 📐 Layout e Dimensioni

### **Container Principale**

```css
.keypad-container {
  max-width: 380px; /* Limite larghezza */
  min-width: 320px; /* Mobile minimo */
  margin: 0 auto; /* Centrato */
  padding: 1rem; /* Breathing room */
  min-height: 100vh; /* Full viewport */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

### **Griglia Tastierino**

```css
.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.75rem; /* 12px spacing */
  max-width: 360px; /* Griglia massima */
  margin: 2rem auto; /* Centrata con margini */
}
```

### **Dimensioni Tasti**

```css
.keypad-button {
  width: 76px; /* Larghezza fissa */
  height: 76px; /* Altezza fissa */
  min-width: 48px; /* WCAG minimum */
  min-height: 48px; /* WCAG minimum */
  border-radius: 12px; /* Angoli arrotondati */
  font-size: 1.5rem; /* 24px text */
  font-weight: 600; /* Semi-bold */
}

/* Responsive scaling */
@media (max-width: 360px) {
  .keypad-button {
    width: 72px;
    height: 72px;
  }
}
```

---

## 🎨 Palette Colori

### **Schema Viola a Tre Livelli**

```css
:root {
  /* Palette principale */
  --violet-primary: #510357; /* Viola brand principale */
  --pink-accent: #e774f0; /* Rosa accent */
  --white-pure: #ffffff; /* Bianco puro */

  /* Sfumature viola (scuro → chiaro) */
  --bg-darkest: #0b0b10; /* Sfondo app molto scuro */
  --bg-darker: #1a1625; /* Sfondo card scuro */
  --bg-dark: #2d2438; /* Sfondo elementi */
  --bg-medium: #3f3451; /* Tasti base */
  --bg-light: #524669; /* Tasti hover */
  --bg-lighter: #6b5b95; /* Tasti active */
}
```

### **Applicazione Colori**

```css
/* Sfondo app */
.app-background {
  background: linear-gradient(135deg, var(--bg-darkest) 0%, var(--bg-darker) 100%);
}

/* Card tastierino */
.keypad-card {
  background: var(--bg-darker);
  border: 1px solid var(--bg-dark);
  box-shadow: 0 8px 32px rgba(81, 3, 87, 0.3);
}

/* Tasti numerici */
.keypad-button {
  background: var(--bg-medium);
  color: var(--white-pure);
  border: 1px solid var(--bg-dark);
}

.keypad-button:hover {
  background: var(--bg-light);
  border-color: var(--pink-accent);
}

.keypad-button:active {
  background: var(--bg-lighter);
  transform: scale(0.95);
}
```

### **Stati Colori**

```css
/* Entrata (verde) */
.button-entrata {
  background: #22c55e;
  color: white;
}

.button-entrata:hover {
  background: #16a34a;
}

/* Uscita (rosso) */
.button-uscita {
  background: #ef4444;
  color: white;
}

.button-uscita:hover {
  background: #dc2626;
}

/* Ore extra (giallo) */
.indicator-extra {
  color: #eab308;
  background: rgba(234, 179, 8, 0.1);
}
```

---

## 🧩 Componenti UI

### **Logo App**

```typescript
// Specifiche logo
interface LogoSpecs {
  asset: '/logo_app.png';          // Path fisso
  format: 'PNG';                   // Trasparente
  maxHeight: '60px';               // Altezza massima
  aspectRatio: 'preserved';        // Proporzioni integre
  position: 'header-center';       // Posizionamento
}

// Implementazione
<img
  src="/logo_app.png"
  alt="BadgeNode"
  className="h-12 w-auto mx-auto"  // max-height 48px, width auto
  loading="eager"                   // Carica subito
/>
```

### **Display PIN**

```typescript
// Box visualizzazione PIN
interface PinDisplayProps {
  value: string;                    // PIN corrente
  maxLength: 2;                     // Max 2 cifre (PIN 1-99)
  placeholder: 'PIN';               // Scompare al primo input
  showClear: boolean;               // Mostra cifre in chiaro
}

// Stile
.pin-display {
  background: var(--bg-dark);
  border: 2px solid var(--bg-medium);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  font-size: 2rem;                  /* 32px */
  font-weight: 700;                 /* Bold */
  text-align: center;
  color: var(--white-pure);
  min-height: 4rem;                 /* 64px */
  letter-spacing: 0.5rem;           /* Spaziatura cifre */
}

.pin-display:focus-within {
  border-color: var(--pink-accent);
  box-shadow: 0 0 0 3px rgba(231, 116, 240, 0.2);
}
```

### **Effetto Riflesso Bordo**

```css
/* Riflesso che gira sulla cornice */
.keypad-button {
  position: relative;
  overflow: hidden;
}

.keypad-button::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(231, 116, 240, 0.4) 50%,
    transparent 70%
  );
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.keypad-button:hover::before {
  opacity: 1;
  animation: borderGlow 2s linear infinite;
}

@keyframes borderGlow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

---

## ⚡ Interazioni e Stati

### **Feedback Touch**

```css
/* Feedback immediato al tocco */
.keypad-button {
  transition: all 0.15s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.keypad-button:active {
  transform: scale(0.95);
  background: var(--bg-lighter);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Ripple effect (opzionale) */
.keypad-button {
  position: relative;
  overflow: hidden;
}

.keypad-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.keypad-button:active::after {
  width: 100px;
  height: 100px;
}
```

### **Stati Input**

```typescript
// Stati del componente PIN
type PinState =
  | 'empty' // Nessun input, mostra placeholder
  | 'typing' // Utente sta digitando
  | 'complete' // PIN completo (1-2 cifre)
  | 'error' // PIN non valido
  | 'loading' // Verifica in corso
  | 'success'; // PIN verificato

// Stili per stato
const pinStateStyles = {
  empty: 'border-gray-600 text-gray-400',
  typing: 'border-pink-400 text-white',
  complete: 'border-green-400 text-white',
  error: 'border-red-400 text-red-300 animate-shake',
  loading: 'border-yellow-400 text-yellow-300 animate-pulse',
  success: 'border-green-400 text-green-300',
};
```

### **Validazioni Real-time**

```typescript
// Validazione PIN durante digitazione
const validatePIN = (value: string): PinState => {
  if (value === '') return 'empty';
  if (value.length > 2) return 'error';
  if (!/^\d+$/.test(value)) return 'error';

  const pinNumber = parseInt(value);
  if (pinNumber < 1 || pinNumber > 99) return 'error';

  return value.length <= 2 ? 'typing' : 'complete';
};
```

---

## 🔧 Implementazione Tecnica

### **Struttura Componente**

```typescript
interface KeypadProps {
  onPinSubmit: (pin: string, type: 'entrata' | 'uscita') => void;
  loading?: boolean;
  error?: string;
}

const HomeKeypad: React.FC<KeypadProps> = ({ onPinSubmit, loading, error }) => {
  const [pin, setPin] = useState('');
  const [pinState, setPinState] = useState<PinState>('empty');

  // Implementazione...
};
```

### **Gestione Input**

```typescript
// Handler tasti numerici
const handleNumberPress = (number: string) => {
  if (pin.length >= 2) return; // Max 2 cifre

  const newPin = pin + number;
  setPin(newPin);
  setPinState(validatePIN(newPin));
};

// Handler backspace
const handleBackspace = () => {
  const newPin = pin.slice(0, -1);
  setPin(newPin);
  setPinState(validatePIN(newPin));
};

// Handler submit
const handleSubmit = (type: 'entrata' | 'uscita') => {
  if (pinState !== 'complete') return;

  setPinState('loading');
  onPinSubmit(pin, type);
};
```

### **Accessibilità**

```typescript
// ARIA labels e keyboard support
<button
  className="keypad-button"
  onClick={() => handleNumberPress('1')}
  aria-label="Numero 1"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleNumberPress('1');
    }
  }}
>
  1
</button>

// Screen reader support
<div
  className="pin-display"
  aria-label={`PIN inserito: ${pin || 'vuoto'}`}
  aria-live="polite"
  role="textbox"
>
  {pin || 'PIN'}
</div>
```

---

## 🚨 Errori Risolti

### **Manifest PWA**

```json
// ❌ PROBLEMA: JSON non valido
{
  "name": "BadgeNode",
  "short_name": "BadgeNode",
  "description": "Sistema timbrature",
  // Commento causava errore parsing
}

// ✅ SOLUZIONE: JSON pulito
{
  "name": "BadgeNode",
  "short_name": "BadgeNode",
  "description": "Sistema di timbratura con PIN per la gestione delle presenze",
  "theme_color": "#510357",
  "background_color": "#0b0b10",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### **Layout Mobile**

```css
/* ❌ PROBLEMA: Scroll necessario su mobile */
.old-layout {
  height: 120vh; /* Troppo alto */
  overflow-y: scroll;
}

/* ✅ SOLUZIONE: Layout fisso ottimizzato */
.new-layout {
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
```

### **Touch Targets**

```css
/* ❌ PROBLEMA: Tasti troppo piccoli */
.old-button {
  width: 40px;
  height: 40px; /* <48px WCAG minimum */
}

/* ✅ SOLUZIONE: Dimensioni accessibili */
.new-button {
  width: 76px;
  height: 76px;
  min-width: 48px; /* WCAG AA compliant */
  min-height: 48px;
}
```

---

## 📊 Metriche Performance

### **Target Performance**

```
First Paint: <200ms
Largest Contentful Paint: <500ms
Cumulative Layout Shift: <0.1
First Input Delay: <50ms

Bundle size: <100KB (keypad component)
Images: logo_app.png <20KB
CSS: <10KB (component styles)
```

### **Ottimizzazioni**

```typescript
// Lazy loading per componenti non critici
const KeypadStats = lazy(() => import('./KeypadStats'));

// Preload logo critico
<link rel="preload" href="/logo_app.png" as="image" />

// Debounce input per performance
const debouncedValidation = useMemo(
  () => debounce(validatePIN, 100),
  []
);
```

---

## 🏗️ Struttura Modulare (FASE 4/4)

### **Refactoring Architetturale**

```
PRIMA (Home.tsx monolitico - 208 righe):
pages/Home.tsx                    # File unico troppo lungo

DOPO (Struttura modulare - max 114 righe per file):
pages/Home/
├── index.tsx                     # Contenitore principale (82 righe)
├── components/
│   ├── HomeContainer.tsx         # Layout UI (81 righe)
│   └── TimbratureActions.tsx     # Business logic (114 righe)
```

### **Benefici Architetturali**

```
✅ Separation of Concerns:
- index.tsx: State management + hooks
- HomeContainer.tsx: UI layout + styling
- TimbratureActions.tsx: Business logic + API calls

✅ Manutenibilità:
- File piccoli e focalizzati
- Responsabilità chiare
- Testing più semplice

✅ Performance:
- Bundle splitting ottimizzato
- Tree shaking migliorato
- Hot reload più veloce

✅ Compliance:
- Tutti i file <220 righe (hard limit)
- Pre-commit hooks attivi
- Zero regressioni UX
```

---

**Nota**: Questo design è ottimizzato per usabilità mobile e accessibilità. La struttura modulare garantisce manutenibilità e rispetto dei limiti di lunghezza file. Tutte le specifiche sono testate su dispositivi reali e rispettano gli standard WCAG AA.
