import { useMemo, useState } from 'react';
import { ArrowUpDown } from '@/lib/icons';

export type SortDirection = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

/**
 * Ordinamento tabelle admin (Dipendenti / Ex-Dipendenti), condiviso per coerenza.
 * - `getValue` estrae il valore ordinabile per una data colonna.
 * - Confronto: numeri per differenza, stringhe con localeCompare('it') (A→Z / Z→A).
 * Al click su un'intestazione: se è già la colonna attiva inverte la direzione,
 * altrimenti passa a quella colonna partendo da 'asc'.
 */
export function useSortableTable<T, K extends string>(
  items: T[],
  getValue: (item: T, key: K) => string | number,
  initial: SortState<K>,
) {
  const [sort, setSort] = useState<SortState<K>>(initial);

  const sorted = useMemo(() => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      const va = getValue(a, sort.key);
      const vb = getValue(b, sort.key);
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb), 'it', { numeric: true }) * dir;
    });
  }, [items, sort, getValue]);

  const toggle = (key: K) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  return { sorted, sort, toggle };
}

/**
 * Intestazione di colonna ordinabile: testo + icona sort (due frecce, uguale per
 * tutte le colonne). Al click alterna A→Z / Z→A sulla colonna.
 */
export function SortableHeader<K extends string>({
  label,
  columnKey,
  onSort,
}: {
  label: string;
  columnKey: K;
  onSort: (key: K) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      aria-label={`Ordina per ${label}`}
      className="mx-auto inline-flex items-center gap-1.5 select-none hover:opacity-80 focus:outline-none"
    >
      <span>{label}</span>
      <ArrowUpDown className="h-4 w-4 text-white/70" />
    </button>
  );
}
