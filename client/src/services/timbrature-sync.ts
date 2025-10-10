// Singleton per sync timbrature offline-first BadgeNode
// Punto di accesso unico per insert con coda automatica

import { TimbratureInsertAdapter } from './timbrature-insert.adapter';

// Istanza singleton
export const timbratureSync = new TimbratureInsertAdapter();

// Helper per conferma timbratura con feedback
export async function confermaTimbratura(pin: number, tipo: 'entrata' | 'uscita') {
  try {
    const result = await timbratureSync.insertNowOrEnqueue({ pin, tipo });
    
    if (result.ok) {
      console.log('✅ Timbratura sincronizzata immediatamente');
    } else {
      console.log('📥 Timbratura accodata per sync successivo');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Errore conferma timbratura:', error);
    throw error;
  }
}
