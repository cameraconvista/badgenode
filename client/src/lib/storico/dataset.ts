// Builder dataset per tabella con sotto-righe sessioni

import { GiornoLogicoDettagliato, StoricoRowData } from './types';

/**
 * Trasforma array giorni in dataset per tabella con sotto-righe
 * Intercala: riga giorno → righe sessioni (dalla 2ª) → riga giorno → ...
 */
export function buildStoricoDataset(giorni: GiornoLogicoDettagliato[]): StoricoRowData[] {
  const dataset: StoricoRowData[] = [];
  
  for (const giorno of giorni) {
    // Riga principale giorno (sempre presente)
    dataset.push({
      type: 'giorno',
      giorno
    });
    
    // Sotto-righe sessioni: SOLO dalla seconda sessione in poi
    if (giorno.sessioni.length > 1) {
      for (let i = 1; i < giorno.sessioni.length; i++) {
        const sessione = giorno.sessioni[i];
        dataset.push({
          type: 'sessione',
          sessione,
          giornoParent: giorno.giorno
        });
      }
    }
  }
  
  return dataset;
}
