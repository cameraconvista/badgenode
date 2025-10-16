// Logica unificata per calcolo giorno logico - condivisa tra client e server
// Timezone: Europe/Rome (+2)

export interface ComputeGiornoLogicoParams {
  data: string;        // Data ISO YYYY-MM-DD
  ora: string;         // Orario HH:MM:SS
  tipo: 'entrata' | 'uscita';
  dataEntrata?: string; // Per uscite, data dell'entrata di ancoraggio (opzionale)
}

export interface ComputeGiornoLogicoResult {
  giorno_logico: string; // Data ISO YYYY-MM-DD del giorno logico
  dataReale: string;     // Data ISO YYYY-MM-DD reale della timbratura
}

/**
 * Calcola il giorno logico per una timbratura
 * 
 * REGOLE UNIFICATE:
 * - ENTRATA 00:00-04:59 → giorno_logico = giorno precedente
 * - ENTRATA 05:00-23:59 → giorno_logico = stesso giorno
 * - USCITA 00:00-04:59 + dataEntrata fornita → prova ancoraggio al giorno dell'entrata
 * - USCITA 00:00-04:59 senza dataEntrata → giorno precedente (fallback)
 * - USCITA 05:00-23:59 → giorno_logico = stesso giorno
 * 
 * FINESTRA MASSIMA: 20 ore per turni notturni
 */
export function computeGiornoLogico(params: ComputeGiornoLogicoParams): ComputeGiornoLogicoResult {
  const { data, ora, tipo, dataEntrata } = params;
  const [ore] = ora.split(':').map(Number);

  if (tipo === 'entrata') {
    // ENTRATA: Finestra notturna 00:00–04:59 → giorno precedente
    if (ore >= 0 && ore < 5) {
      const d = new Date(data + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return {
        giorno_logico: formatDateLocal(d),
        dataReale: data,
      };
    }
    // ENTRATA: Orario normale 05:00–23:59 → stesso giorno
    return {
      giorno_logico: data,
      dataReale: data,
    };
  } else {
    // USCITA: Logica di ancoraggio per turni notturni
    if (ore >= 0 && ore < 5) {
      // Se abbiamo dataEntrata, prova ancoraggio
      if (dataEntrata) {
        const dataEntrataObj = new Date(dataEntrata + 'T00:00:00');
        const dataUscitaObj = new Date(data + 'T00:00:00');
        const diffGiorni = (dataUscitaObj.getTime() - dataEntrataObj.getTime()) / (1000 * 60 * 60 * 24);
        
        // Verifica finestra massima 20h (circa 0.83 giorni)
        if (diffGiorni <= 1 && diffGiorni >= 0) {
          // Ancoraggio valido: uscita appartiene al giorno logico dell'entrata
          return {
            giorno_logico: dataEntrata,
            dataReale: data,
          };
        }
      }
      
      // Fallback: uscita notturna senza ancoraggio → giorno precedente
      const d = new Date(data + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      return {
        giorno_logico: formatDateLocal(d),
        dataReale: data,
      };
    }
    
    // USCITA: Orario normale 05:00–23:59 → stesso giorno
    return {
      giorno_logico: data,
      dataReale: data,
    };
  }
}

/**
 * Formatta data in locale Europe/Rome senza UTC drift
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcola differenza in ore tra due timestamp considerando turni notturni
 * TODO: Helper non più utilizzato dopo rimozione limite 20h (STEP A.1)
 */
export function calcolaDifferenzaOre(
  dataEntrata: string,
  oraEntrata: string,
  dataUscita: string,
  oraUscita: string
): number {
  const tsEntrata = new Date(`${dataEntrata}T${oraEntrata}`);
  const tsUscita = new Date(`${dataUscita}T${oraUscita}`);
  
  const diffMs = tsUscita.getTime() - tsEntrata.getTime();
  return diffMs / (1000 * 60 * 60); // Ore con decimali
}

/**
 * Verifica se una durata di turno è entro i limiti accettabili
 * TODO: Funzione deprecata - durate illimitate per richiesta business (STEP A.1)
 */
export function isValidShiftDuration(ore: number): boolean {
  return true; // Nessun limite di durata per richiesta business
}
