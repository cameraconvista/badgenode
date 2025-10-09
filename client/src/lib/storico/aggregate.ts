// Utility per aggregazione timbrature per giorno logico (client-side)

import { formatDateLocal, getMeseItaliano } from '@/lib/time';
import { TurnoFull } from '@/services/storico.service';

interface TimbratureRaw {
  pin: number;
  tipo: 'entrata' | 'uscita';
  ore: string;
  giornologico: string;
  created_at: string;
  nome?: string;
  cognome?: string;
}

/**
 * Normalizza data in formato YYYY-MM-DD (Europe/Rome, no UTC)
 */
export function normalizeDate(date: string): string {
  if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date; // Già in formato corretto
  }
  return formatDateLocal(new Date(date));
}

/**
 * Aggrega timbrature per giorno logico (client-side)
 */
export function aggregateTimbratureByGiornoLogico(
  timbrature: TimbratureRaw[], 
  pin: number, 
  oreContrattuali: number = 8
): TurnoFull[] {
  // Group by giornologico
  const grouped = timbrature.reduce((acc, t) => {
    const key = t.giornologico;
    if (!acc[key]) {
      acc[key] = { entrate: [], uscite: [] };
    }
    
    if (t.tipo === 'entrata') {
      acc[key].entrate.push(t);
    } else if (t.tipo === 'uscita') {
      acc[key].uscite.push(t);
    }
    
    return acc;
  }, {} as Record<string, { entrate: TimbratureRaw[]; uscite: TimbratureRaw[] }>);

  // Calcola aggregati per ogni giorno
  return Object.entries(grouped).map(([giorno, data]) => {
    // Ordina per orario
    const entrate = data.entrate.sort((a, b) => a.ore.localeCompare(b.ore));
    const uscite = data.uscite.sort((a, b) => b.ore.localeCompare(a.ore)); // Desc per ultima uscita
    
    const primaEntrata = entrate[0]?.ore || null;
    const ultimaUscita = uscite[0]?.ore || null;
    
    // Calcola ore lavorate
    let ore = 0;
    if (primaEntrata && ultimaUscita) {
      const entrata = new Date(`${giorno}T${primaEntrata}`);
      const uscita = new Date(`${giorno}T${ultimaUscita}`);
      
      // Se uscita < entrata, turno notturno (aggiungi 24h)
      if (uscita < entrata) {
        uscita.setDate(uscita.getDate() + 1);
      }
      
      const diffMs = uscita.getTime() - entrata.getTime();
      ore = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimali
    }
    
    // Calcola ore extra
    const extra = Math.max(0, ore - oreContrattuali);
    
    return {
      pin,
      giorno,
      mese_label: getMeseItaliano(giorno),
      entrata: primaEntrata,
      uscita: ultimaUscita,
      ore,
      extra
    };
  });
}
