// Utilità per calcoli dataset v5
import { StoricoDatasetV5 } from './types';

/**
 * Calcola totali dal dataset v5 per footer
 */
export function calcolaTotaliV5(dataset: StoricoDatasetV5[], oreContrattuali: number = 8) {
  const giorniLavorati = dataset.filter(d => d.ore_totali_chiuse > 0).length;
  const totOre = dataset.reduce((acc, d) => acc + d.ore_totali_chiuse, 0);
  const totExtra = dataset.reduce((acc, d) => acc + Math.max(d.ore_totali_chiuse - oreContrattuali, 0), 0);
  
  return {
    totOre,
    totExtra,
    giorniLavorati,
    totGiorni: dataset.length
  };
}
