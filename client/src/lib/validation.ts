// Validazioni per timbrature e business logic
import { Timbratura } from './time';

/**
 * Calcola ore lavorate tra due timbrature considerando turni notturni
 */
function calcolaOreLavorateTraDue(entrata: Timbratura, uscita: Timbratura): number {
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
 * Valida coerenza timbrature
 */
export function validateTimbratura(entrata: Timbratura, uscita: Timbratura): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Stesso giorno logico
  if (entrata.giorno_logico !== uscita.giorno_logico) {
    errors.push('Entrata e uscita devono appartenere allo stesso giorno logico');
  }
  
  // Calcola ore
  const ore = calcolaOreLavorateTraDue(entrata, uscita);
  
  // Minimo 30 minuti
  if (ore < 0.5) {
    errors.push('Turno minimo 30 minuti');
  }
  
  // Massimo 24 ore
  if (ore > 24) {
    errors.push('Turno non può superare 24 ore');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
