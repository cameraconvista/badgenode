// Servizio per calcolo statistiche timbrature
import { Timbratura } from '@/lib/time';

export interface TimbratureStats {
  totaleMensileOre: number;
  totaleMensileExtra: number;
  giorniLavorati: number;
  mediaOreGiorno: number;
}

export class TimbratureStatsService {
  // Calcola statistiche periodo
  static calculateStats(timbrature: Timbratura[], oreContrattuali: number): TimbratureStats {
    // Raggruppa per giorno logico
    const byDate = new Map<string, Timbratura[]>();
    for (const t of timbrature) {
      const key = t.giornologico;
      if (!byDate.has(key)) {
        byDate.set(key, []);
      }
      byDate.get(key)!.push(t);
    }

    let totaleMensileOre = 0;
    let totaleMensileExtra = 0;
    let giorniLavorati = 0;

    // Calcola per ogni giorno
    for (const [, timbratureGiorno] of Array.from(byDate.entries())) {
      const entrate = timbratureGiorno.filter((t: Timbratura) => t.tipo === 'entrata');
      const uscite = timbratureGiorno.filter((t: Timbratura) => t.tipo === 'uscita');
      
      if (entrate.length > 0 && uscite.length > 0) {
        // Calcola ore lavorate (prima entrata, ultima uscita)
        const primaEntrata = entrate.sort((a: Timbratura, b: Timbratura) => a.ore.localeCompare(b.ore))[0];
        const ultimaUscita = uscite.sort((a: Timbratura, b: Timbratura) => b.ore.localeCompare(a.ore))[0];
        
        const dataEntrata = new Date(`${primaEntrata.data}T${primaEntrata.ore}`);
        const dataUscita = new Date(`${ultimaUscita.data}T${ultimaUscita.ore}`);
        
        // Gestione turni notturni
        if (dataUscita < dataEntrata) {
          dataUscita.setDate(dataUscita.getDate() + 1);
        }
        
        const diffMs = dataUscita.getTime() - dataEntrata.getTime();
        const oreLavorate = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        
        totaleMensileOre += oreLavorate;
        totaleMensileExtra += Math.max(0, oreLavorate - oreContrattuali);
        giorniLavorati++;
      }
    }

    return {
      totaleMensileOre,
      totaleMensileExtra,
      giorniLavorati,
      mediaOreGiorno: giorniLavorati > 0 ? totaleMensileOre / giorniLavorati : 0
    };
  }
}
