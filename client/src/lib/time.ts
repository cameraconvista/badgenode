// Utility centralizzate per gestione tempo e logica giorno logico
// Timezone: Europe/Rome (+2)

import type { Timbratura } from '@/types/timbrature';

export interface TimbratureGiorno {
  giorno_logico: string;
  entrate: Timbratura[];
  uscite: Timbratura[];
  oreLavorate: number;
  oreExtra: number;
}

/**
 * Calcola il giorno logico per una timbratura
 * REGOLE:
 * - Entrate 00:00-04:59 → giorno precedente
 * - Uscite 00:00-04:59 con diff ≤ 1 giorno → stesso giorno logico dell'entrata
 */
export function computeGiornoLogico(params: {
  data: string;
  ora: string;
  tipo: 'entrata' | 'uscita';
  dataEntrata?: string; // Per uscite, data dell'entrata corrispondente
}): { giornologico: string; dataReale: string } {
  const { data, ora, tipo, dataEntrata } = params;
  const [ore] = ora.split(':').map(Number);

  if (tipo === 'entrata') {
    // ENTRATA: Solo orari notturni (00-04) → giorno precedente
    if (ore >= 0 && ore < 5) {
      const d = new Date(data + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return {
        giornologico: formatDateLocal(d),
        dataReale: data,
      };
    }
    return {
      giornologico: data,
      dataReale: data,
    };
  } else {
    // USCITA: Logica più complessa per turni notturni
    if (ore >= 0 && ore < 5 && dataEntrata) {
      const dataEntrataObj = new Date(dataEntrata);
      const dataUscitaObj = new Date(data);
      const diffGiorni =
        (dataUscitaObj.getTime() - dataEntrataObj.getTime()) / (1000 * 60 * 60 * 24);

      // Se diff ≤ 1 giorno, appartiene allo stesso turno
      if (diffGiorni <= 1) {
        const d = new Date(data + 'T00:00:00');
        d.setDate(d.getDate() + 1); // Data reale: giorno successivo
        return {
          giornologico: dataEntrata, // Stesso giorno logico dell'entrata
          dataReale: formatDateLocal(d),
        };
      }
    }
    return {
      giornologico: data,
      dataReale: data,
    };
  }
}

/**
 * Calcola ore lavorate per un giorno logico
 * Usa prima entrata e ultima uscita dello stesso giorno logico
 */
export function computeOreLavoratePerGiorno(timbrature: Timbratura[]): number {
  const entrate = timbrature
    .filter((t) => t.tipo === 'entrata' && t.ora_locale)
    .sort((a, b) => (a.ora_locale || '').localeCompare(b.ora_locale || ''));
  const uscite = timbrature
    .filter((t) => t.tipo === 'uscita' && t.ora_locale)
    .sort((a, b) => (b.ora_locale || '').localeCompare(a.ora_locale || ''));

  if (entrate.length === 0 || uscite.length === 0) return 0;

  const primaEntrata = entrate[0];
  const ultimaUscita = uscite[0];

  return calcolaOreLavorateTraDue(primaEntrata, ultimaUscita);
}

/**
 * Calcola ore lavorate tra due timbrature considerando turni notturni
 */
function calcolaOreLavorateTraDue(entrata: Timbratura, uscita: Timbratura): number {
  if (!entrata.data_locale || !entrata.ora_locale || !uscita.data_locale || !uscita.ora_locale) {
    return 0; // Dati mancanti
  }

  const dataEntrata = new Date(`${entrata.data_locale}T${entrata.ora_locale}`);
  const dataUscita = new Date(`${uscita.data_locale}T${uscita.ora_locale}`);

  // Se uscita < entrata, aggiungi 24 ore (turno notturno)
  if (dataUscita < dataEntrata) {
    dataUscita.setDate(dataUscita.getDate() + 1);
  }

  const diffMs = dataUscita.getTime() - dataEntrata.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Ore con 2 decimali
}

/**
 * Calcola ore extra per un giorno
 */
export function computeOreExtra(oreLavorate: number, oreContrattuali: number): number {
  return Math.max(0, oreLavorate - oreContrattuali);
}

/**
 * Formatta data in locale Europe/Rome senza UTC drift
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Genera array di tutti i giorni in un range (anche senza timbrature)
 */
export function expandDaysRange(dal: string, al: string): string[] {
  const days: string[] = [];
  const current = new Date(dal + 'T00:00:00');
  const end = new Date(al + 'T00:00:00');

  while (current <= end) {
    days.push(formatDateLocal(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/**
 * Formatta ore per visualizzazione in formato ore:minuti (es. 2.27 per 2h27m)
 * 
 * ⚠️  FUNZIONE STABILE - NON MODIFICARE
 * Questa funzione è utilizzata in tutta l'applicazione per garantire
 * un formato consistente delle ore. Qualsiasi modifica potrebbe causare
 * inconsistenze nella visualizzazione.
 * 
 * Esempi:
 * - 2.45 ore decimali → "2.27" (2 ore e 27 minuti)
 * - 8.5 ore decimali → "8.30" (8 ore e 30 minuti)
 * - 1.75 ore decimali → "1.45" (1 ora e 45 minuti)
 */
export function formatOre(n?: number | null): string {
  const v = Number.isFinite(n as number) ? (n as number) : 0;
  
  // Converte ore decimali in formato ore.minuti
  const ore = Math.floor(v);
  const minutiDecimali = (v - ore) * 60;
  const minuti = Math.round(minutiDecimali);
  
  // Formato: ore.minuti (es. 2.27 per 2h27m)
  return `${ore}.${minuti.toString().padStart(2, '0')}`;
}

/**
 * Formatta data per visualizzazione italiana
 */
export function formatDataItaliana(data: string): string {
  const d = new Date(data + 'T00:00:00');
  return d.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formatta data solo con giorno settimana + numero (per colonna Data)
 */
export function formatDataBreve(data: string): string {
  const d = new Date(data + 'T00:00:00');
  const formatted = d.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
  });
  // Capitalizza prima lettera del giorno della settimana
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Ottieni nome mese in italiano
 */
export function getMeseItaliano(data: string): string {
  const d = new Date(data + 'T00:00:00');
  const formatted = d.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });
  // Capitalizza prima lettera del mese
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formatta timestamp created_at per visualizzazione (solo secondi, no millisecondi)
 */
export function formatCreatedAt(created_at: string): string {
  return new Date(created_at).toLocaleTimeString('it-IT', {
    hour12: false,
    timeStyle: 'medium',
  });
}
