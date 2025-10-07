# 🎨 Icons Guide - BadgeNode

## Indice

- [Panoramica](#panoramica)
- [Setup unplugin-icons](#setup-unplugin-icons)
- [Collezioni Disponibili](#collezioni-disponibili)
- [Esempi Uso](#esempi-uso)
- [Best Practices](#best-practices)

---

## Panoramica

**Sistema**: unplugin-icons con collezioni Iconify  
**Stile**: 24×24px, stroke 2, consistente  
**Collezioni**: Tabler Icons + Lucide

**Vantaggi**:

- Tree-shaking automatico
- TypeScript support
- Import on-demand
- Consistenza visiva

---

## Setup unplugin-icons

### Installazione

```bash
npm i -D unplugin-icons @iconify-json/tabler @iconify-json/lucide
```

### Configurazione Vite

```typescript
// vite.config.ts
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    react(),
    Icons({
      compiler: 'jsx',
      jsx: 'react',
    }),
  ],
});
```

### TypeScript Types

```typescript
// types/icons.d.ts
declare module '~icons/*' {
  import { ComponentType, SVGProps } from 'react';
  const component: ComponentType<SVGProps<SVGSVGElement>>;
  export default component;
}
```

---

## Collezioni Disponibili

### Tabler Icons

- **Stile**: Outline, 24×24, stroke 2
- **Quantità**: 4000+ icone
- **Naming**: `~icons/tabler/icon-name`

### Lucide

- **Stile**: Outline, 24×24, stroke 2
- **Quantità**: 1000+ icone
- **Naming**: `~icons/lucide/icon-name`

---

## Esempi Uso

### Import Base

```typescript
// Tabler Icons
import IconClock from '~icons/tabler/clock';
import IconUser from '~icons/tabler/user';
import IconSettings from '~icons/tabler/settings';

// Lucide Icons
import IconHome from '~icons/lucide/home';
import IconMail from '~icons/lucide/mail';
import IconSearch from '~icons/lucide/search';
```

### Componenti React

```typescript
import IconClock from '~icons/tabler/clock'

function TimeDisplay() {
  return (
    <div className="flex items-center gap-2">
      <IconClock className="w-5 h-5 text-gray-600" />
      <span>14:30</span>
    </div>
  )
}
```

### Con Props

```typescript
import IconUser from '~icons/tabler/user'

function UserButton({ isActive }: { isActive: boolean }) {
  return (
    <button className="p-2">
      <IconUser
        className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
        strokeWidth={isActive ? 2.5 : 2}
      />
    </button>
  )
}
```

### Icone Comuni BadgeNode

```typescript
// Timbrature
import IconClock from '~icons/tabler/clock'; // Orario
import IconClockIn from '~icons/tabler/clock-play'; // Entrata
import IconClockOut from '~icons/tabler/clock-stop'; // Uscita
import IconClockPause from '~icons/tabler/clock-pause'; // Pausa

// Navigazione
import IconHome from '~icons/lucide/home'; // Home
import IconCalendar from '~icons/tabler/calendar'; // Calendario
import IconChart from '~icons/tabler/chart-line'; // Statistiche
import IconSettings from '~icons/tabler/settings'; // Impostazioni

// Azioni
import IconPlus from '~icons/lucide/plus'; // Aggiungi
import IconEdit from '~icons/lucide/edit'; // Modifica
import IconTrash from '~icons/lucide/trash'; // Elimina
import IconSave from '~icons/lucide/save'; // Salva

// Stati
import IconCheck from '~icons/lucide/check'; // Successo
import IconX from '~icons/lucide/x'; // Errore
import IconAlert from '~icons/lucide/alert-triangle'; // Warning
import IconInfo from '~icons/lucide/info'; // Info
```

---

## Best Practices

### Naming Convention

```typescript
// ✅ Buono - Descrittivo
import IconUserProfile from '~icons/tabler/user-circle';
import IconTimeClock from '~icons/tabler/clock';

// ❌ Evitare - Generico
import Icon1 from '~icons/tabler/user';
import SomeIcon from '~icons/tabler/clock';
```

### Sizing Consistente

```typescript
// ✅ Buono - Classi Tailwind standard
<IconClock className="w-4 h-4" />  // 16px - small
<IconClock className="w-5 h-5" />  // 20px - default
<IconClock className="w-6 h-6" />  // 24px - large

// ❌ Evitare - Dimensioni custom
<IconClock style={{ width: '23px', height: '19px' }} />
```

### Colori Semantici

```typescript
// ✅ Buono - Colori semantici
<IconCheck className="w-5 h-5 text-green-600" />      // Successo
<IconX className="w-5 h-5 text-red-600" />            // Errore
<IconAlert className="w-5 h-5 text-yellow-600" />     // Warning
<IconInfo className="w-5 h-5 text-blue-600" />        // Info

// Stato interattivo
<IconSettings className="w-5 h-5 text-gray-400 hover:text-gray-600" />
```

### Performance

```typescript
// ✅ Buono - Import specifico
import IconClock from '~icons/tabler/clock';

// ❌ Evitare - Import di massa
import * as TablerIcons from '~icons/tabler/*';
```

### Accessibilità

```typescript
// ✅ Buono - Con aria-label
<IconClock
  className="w-5 h-5"
  aria-label="Orario corrente"
  role="img"
/>

// Per icone decorative
<IconClock
  className="w-5 h-5"
  aria-hidden="true"
/>
```

---

## Migrazione da react-icons

### Mapping Comune

```typescript
// Prima (react-icons)
import { FaClock } from 'react-icons/fa';
import { MdHome } from 'react-icons/md';

// Dopo (unplugin-icons)
import IconClock from '~icons/tabler/clock';
import IconHome from '~icons/lucide/home';
```

### Script Migrazione

```bash
# Cerca e sostituisci pattern
find . -name "*.tsx" -exec sed -i 's/react-icons\/fa/~icons\/tabler/g' {} \;
find . -name "*.tsx" -exec sed -i 's/react-icons\/md/~icons\/lucide/g' {} \;
```

---

## Troubleshooting

### Icona non trovata

```bash
# Verifica collezione installata
npm list @iconify-json/tabler

# Cerca icona disponibile
npx iconify search clock
```

### TypeScript errori

```typescript
// Aggiungi types in vite-env.d.ts
/// <reference types="unplugin-icons/types/react" />
```

### Build errori

```typescript
// Verifica configurazione Vite
import Icons from 'unplugin-icons/vite';

// Non dimenticare compiler config
Icons({ compiler: 'jsx', jsx: 'react' });
```

---

**Nota**: In questo step solo predisposizione. Sostituzione icone esistenti nel Prompt 2/2.
