# 06 🎨 ICONS GUIDE - BadgeNode

**Guida completa all'uso di unplugin-icons con collezioni Lucide e Tabler**  
**Versione**: 2.0 • **Data**: 2025-10-09

---

## 📋 Contenuti

1. [Overview Sistema](#overview-sistema)
2. [Configurazione](#configurazione)
3. [Utilizzo Base](#utilizzo-base)
4. [Collezioni Disponibili](#collezioni-disponibili)
5. [Best Practices](#best-practices)

---

## 🔧 Overview Sistema

### **unplugin-icons**

```
Vantaggi:
- Tree-shaking automatico (solo icone utilizzate)
- Bundle size ottimizzato
- TypeScript support completo
- Import diretti come componenti React
- Nessun runtime overhead

Collezioni supportate:
- Lucide (primary): ~1000+ icone moderne
- Tabler (secondary): ~4000+ icone outline
- Heroicons, Phosphor, etc. (opzionali)
```

### **Configurazione Vite**

```typescript
// vite.config.ts
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    Icons({
      compiler: 'jsx',
      jsx: 'react',
      autoInstall: true,
      scale: 1,
      defaultStyle: '',
      defaultClass: '',
    }),
  ],
});
```

---

## 📦 Configurazione

### **Installazione**

```bash
# Plugin principale
npm install -D unplugin-icons

# Collezioni icone (auto-install abilitato)
npm install -D @iconify/json

# TypeScript types (opzionale)
npm install -D @types/react
```

### **TypeScript Configuration**

```typescript
// vite-env.d.ts
declare module '~icons/*' {
  import { FunctionComponent, SVGProps } from 'react';
  const component: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default component;
}
```

### **ESLint Configuration**

```json
// eslint.config.js
{
  "rules": {
    "import/no-unresolved": [
      "error",
      {
        "ignore": ["^~icons/"]
      }
    ]
  }
}
```

---

## 🎯 Utilizzo Base

### **Import Pattern**

```typescript
// Pattern: ~icons/{collection}/{icon-name}
import IconClock from '~icons/lucide/clock';
import IconUser from '~icons/lucide/user';
import IconSettings from '~icons/tabler/settings';
import IconHome from '~icons/lucide/home';

// Utilizzo in componente
export const Dashboard = () => {
  return (
    <div>
      <IconHome className="w-6 h-6" />
      <IconUser className="w-5 h-5 text-blue-500" />
      <IconClock size={24} color="red" />
    </div>
  );
};
```

### **Props Disponibili**

```typescript
interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;    // Dimensione (width + height)
  color?: string;           // Colore fill/stroke
  className?: string;       // Classi CSS
  style?: CSSProperties;    // Stili inline
}

// Esempi utilizzo
<IconClock size={24} />                    // 24x24px
<IconUser className="w-6 h-6 text-blue-500" />  // Tailwind
<IconSettings style={{ color: 'red' }} />       // Inline style
```

---

## 🎨 Collezioni Disponibili

### **Lucide Icons (Primary)**

```typescript
// Icone comuni BadgeNode
import IconClock from '~icons/lucide/clock';
import IconUser from '~icons/lucide/user';
import IconUsers from '~icons/lucide/users';
import IconCalendar from '~icons/lucide/calendar';
import IconBarChart from '~icons/lucide/bar-chart';
import IconSettings from '~icons/lucide/settings';
import IconLogIn from '~icons/lucide/log-in';
import IconLogOut from '~icons/lucide/log-out';
import IconHome from '~icons/lucide/home';
import IconArchive from '~icons/lucide/archive';
import IconDownload from '~icons/lucide/download';
import IconUpload from '~icons/lucide/upload';
import IconEdit from '~icons/lucide/edit';
import IconTrash from '~icons/lucide/trash';
import IconPlus from '~icons/lucide/plus';
import IconMinus from '~icons/lucide/minus';
import IconCheck from '~icons/lucide/check';
import IconX from '~icons/lucide/x';
import IconChevronLeft from '~icons/lucide/chevron-left';
import IconChevronRight from '~icons/lucide/chevron-right';
import IconSearch from '~icons/lucide/search';
import IconFilter from '~icons/lucide/filter';

// Caratteristiche Lucide:
// - Design moderno e pulito
// - Stroke width: 2px (default)
// - Dimensioni: 24x24px (default)
// - Stile: outline/stroke based
```

### **Tabler Icons (Secondary)**

```typescript
// Icone aggiuntive se Lucide non disponibile
import IconDashboard from '~icons/tabler/dashboard';
import IconReport from '~icons/tabler/report';
import IconDatabase from '~icons/tabler/database';
import IconApi from '~icons/tabler/api';
import IconBrandGithub from '~icons/tabler/brand-github';
import IconMail from '~icons/tabler/mail';
import IconPhone from '~icons/tabler/phone';

// Caratteristiche Tabler:
// - Collezione più ampia (4000+ icone)
// - Stroke width: 2px
// - Stile: outline consistent
// - Buona per icone specifiche/tecniche
```

---

## 🎨 Design Guidelines

### **Dimensioni Standard**

```typescript
// Sizing system BadgeNode
const IconSizes = {
  xs: 'w-3 h-3',    // 12px - badges, indicators
  sm: 'w-4 h-4',    // 16px - buttons small
  md: 'w-5 h-5',    // 20px - buttons standard
  lg: 'w-6 h-6',    // 24px - headers, navigation
  xl: 'w-8 h-8',    // 32px - hero sections
  '2xl': 'w-12 h-12' // 48px - large displays
};

// Utilizzo
<IconUser className={IconSizes.md} />
<IconClock size={20} />  // Equivalente a md
```

### **Colori e Stati**

```typescript
// Color system BadgeNode
const IconColors = {
  primary: 'text-violet-600',     // #510357
  secondary: 'text-pink-400',     // #e774f0
  success: 'text-green-500',      // Entrata
  danger: 'text-red-500',         // Uscita
  warning: 'text-yellow-500',     // Ore extra
  muted: 'text-gray-400',         // Disabled
  current: 'text-current'         // Inherit
};

// Stati interattivi
<IconSettings className="text-gray-400 hover:text-violet-600 transition-colors" />
```

### **Stroke Width**

```typescript
// Consistenza stroke (Lucide/Tabler = 2px default)
// Non modificare stroke-width per mantenere coerenza

// ✅ CORRETTO
<IconClock className="w-6 h-6" />

// ❌ EVITARE
<IconClock className="w-6 h-6" style={{ strokeWidth: 1 }} />
```

---

## 🚀 Best Practices

### **Performance**

```typescript
// ✅ TREE-SHAKING OTTIMALE
import IconClock from '~icons/lucide/clock';
import IconUser from '~icons/lucide/user';

// ❌ EVITARE - Import multipli da stesso modulo
import { Clock, User } from 'lucide-react'; // Bundle più grande

// ✅ LAZY LOADING per icone non critiche
const IconSettings = lazy(() => import('~icons/lucide/settings'));
```

### **Naming Conventions**

```typescript
// ✅ NAMING CONSISTENTE
import IconClock from '~icons/lucide/clock'; // Icon + PascalCase
import IconUserPlus from '~icons/lucide/user-plus'; // Kebab-case → PascalCase

// Utilizzo in componente
const ClockIcon = IconClock; // Alias se necessario
```

### **Accessibilità**

```typescript
// ✅ ACCESSIBILITÀ COMPLETA
<IconClock
  className="w-5 h-5"
  aria-label="Orario corrente"
  role="img"
/>

// Per icone decorative
<IconUser
  className="w-4 h-4"
  aria-hidden="true"
/>

// Con testo alternativo
<span className="sr-only">Utente</span>
<IconUser className="w-5 h-5" aria-hidden="true" />
```

### **Componenti Wrapper**

```typescript
// Wrapper riutilizzabile per icone comuni
interface BadgeIconProps {
  name: 'clock' | 'user' | 'settings';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  name,
  size = 'md',
  color = 'current',
  className
}) => {
  const icons = {
    clock: IconClock,
    user: IconUser,
    settings: IconSettings
  };

  const Icon = icons[name];
  const sizeClass = IconSizes[size];
  const colorClass = IconColors[color];

  return (
    <Icon className={cn(sizeClass, colorClass, className)} />
  );
};

// Utilizzo
<BadgeIcon name="clock" size="lg" color="primary" />
```

---

## 🔍 Ricerca e Discovery

### **Browsing Icone**

```bash
# Siti per browsing icone
https://lucide.dev/icons/          # Lucide icons
https://tabler-icons.io/           # Tabler icons
https://icon-sets.iconify.design/  # Tutte le collezioni

# Ricerca locale (se installato @iconify/json)
npx @iconify/json-tools search clock
npx @iconify/json-tools list lucide
```

### **Verifica Disponibilità**

```typescript
// Test import prima dell'uso
try {
  const IconTest = await import('~icons/lucide/new-icon');
  console.log('Icona disponibile');
} catch {
  console.log('Icona non trovata, usa fallback');
}
```

---

## 🚨 Troubleshooting

### **Errori Comuni**

#### **Import non risolto**

```bash
# Verifica auto-install attivo
grep -r "autoInstall.*true" vite.config.ts

# Installa collezione manualmente
npm install -D @iconify-json/lucide

# Restart dev server
npm run dev
```

#### **TypeScript errors**

```typescript
// Aggiungi types in vite-env.d.ts
/// <reference types="unplugin-icons/types/react" />

// O crea file dedicato
// types/icons.d.ts
declare module '~icons/*' {
  const component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default component;
}
```

#### **Bundle size issues**

```bash
# Analizza bundle
npm run build -- --analyze

# Verifica tree-shaking
grep -r "lucide-react" src/  # Dovrebbe essere vuoto
grep -r "~icons" src/        # Dovrebbe mostrare import specifici
```

---

## 📊 Metriche Performance

### **Bundle Impact**

```
Icona singola: ~1-2KB (minified)
Collezione completa: ~500KB+ (evitare)
Tree-shaking: ~95% riduzione size

Target: <50KB totale icone in bundle
Monitoring: webpack-bundle-analyzer
```

### **Runtime Performance**

```
Rendering: <1ms per icona
Memory: ~100B per istanza
DOM nodes: 1 SVG per icona
```

---

**Nota**: Non sostituire icone esistenti senza necessità. Il sistema attuale è ottimizzato per performance e consistenza visiva.
