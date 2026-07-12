import { Users, Archive, History } from '@/lib/icons';
import type { ComponentType } from 'react';

/**
 * Voci principali della sidebar admin.
 * `match` decide quale voce è attiva in base al path corrente (wouter).
 * L'ordine qui è l'ordine mostrato in sidebar.
 */
export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Ritorna true se il path corrente appartiene a questa sezione. */
  match: (path: string) => boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'dipendenti',
    label: 'Dipendenti',
    href: '/archivio-dipendenti',
    icon: Users,
    match: (p) => p === '/archivio-dipendenti',
  },
  {
    id: 'ex-dipendenti',
    label: 'Ex-Dipendenti',
    href: '/admin/ex-dipendenti',
    icon: Archive,
    match: (p) => p.startsWith('/admin/ex-dipendenti'),
  },
  {
    id: 'storico',
    label: 'Storico',
    href: '/storico-timbrature',
    icon: History,
    match: (p) => p.startsWith('/storico-timbrature'),
  },
];
