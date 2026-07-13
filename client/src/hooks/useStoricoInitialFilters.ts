import { formatDateLocal } from '@/lib/time';

export interface StoricoFiltersState {
  pin: number;
  dal: string;
  al: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Periodo iniziale dei filtri Storico.
 *
 * Se l'URL porta `?dal=YYYY-MM-DD&al=YYYY-MM-DD` (es. arrivo dalla Dashboard con
 * un periodo selezionato) lo si eredita; altrimenti si usa il mese corrente.
 * NB: definisce SOLO il valore iniziale dei filtri, nessun calcolo di ore.
 */
export function computeStoricoInitialFilters(pin: number): StoricoFiltersState {
  const today = new Date();
  let dal = formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 1));
  let al = formatDateLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search);
    const qDal = q.get('dal');
    const qAl = q.get('al');
    if (qDal && qAl && DATE_RE.test(qDal) && DATE_RE.test(qAl) && qDal <= qAl) {
      dal = qDal;
      al = qAl;
    }
  }

  return { pin, dal, al };
}
