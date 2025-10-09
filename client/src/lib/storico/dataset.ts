// Builder dataset per tabella con sotto-righe sessioni

import { GiornoLogicoDettagliato, StoricoRowData } from './types';

/**
 * Trasforma array giorni in dataset per tabella con sotto-righe
 * Intercala: riga giorno → righe sessioni → riga giorno → ...
 */
export function buildStoricoDataset(giorni: GiornoLogicoDettagliato[]): StoricoRowData[] {
  const dataset: StoricoRowData[] = [];
  
  for (const giorno of giorni) {
    // Riga principale giorno
    dataset.push({
      type: 'giorno',
      giorno
    });
    
    // Sotto-righe sessioni (solo se ci sono sessioni)
    if (giorno.sessioni.length > 0) {
      for (const sessione of giorno.sessioni) {
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
