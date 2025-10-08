// Servizio per gestione utenti/dipendenti
// TODO: Integrare con Supabase quando disponibile

import { mockUtenti, mockExDipendenti, delay } from './mockData';

export interface Utente {
  id: string;
  pin: number;
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  ore_contrattuali: number;
  descrizione_contratto?: string;
  created_at: string;
  updated_at: string;
}

export interface ExDipendente extends Utente {
  archiviato_at: string;
  motivo_archiviazione?: string;
}

export interface UtenteInput {
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  pin: number;
  ore_contrattuali: number;
  descrizione_contratto?: string;
}

export class UtentiService {
  // Ottieni lista utenti attivi
  static async getUtenti(): Promise<Utente[]> {
    await delay(300);
    console.log('📋 Caricamento utenti attivi...');
    return [...mockUtenti].sort((a, b) => a.pin - b.pin);
  }

  // Ottieni lista ex-dipendenti
  static async getExDipendenti(): Promise<ExDipendente[]> {
    await delay(300);
    console.log('📋 Caricamento ex-dipendenti...');
    return [...mockExDipendenti];
  }

  // Ottieni utente per ID
  static async getUtenteById(id: string): Promise<Utente | null> {
    await delay(200);
    const utente = mockUtenti.find(u => u.id === id);
    return utente || null;
  }

  // Crea nuovo utente
  static async createUtente(input: UtenteInput): Promise<Utente> {
    await delay(500);
    
    // Verifica che il PIN sia disponibile
    if (!await this.isPinAvailable(input.pin)) {
      throw new Error(`PIN ${input.pin} già in uso`);
    }

    const newUtente: Utente = {
      id: Date.now().toString(),
      ...input,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUtenti.push(newUtente);
    console.log('✅ Utente creato:', newUtente);
    return newUtente;
  }

  // Aggiorna utente esistente
  static async updateUtente(id: string, input: Partial<UtenteInput>): Promise<Utente> {
    await delay(400);
    
    const index = mockUtenti.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Utente non trovato');
    }

    mockUtenti[index] = {
      ...mockUtenti[index],
      ...input,
      updated_at: new Date().toISOString(),
    };

    console.log('✅ Utente aggiornato:', mockUtenti[index]);
    return mockUtenti[index];
  }

  // Archivia utente (sposta in ex-dipendenti e libera PIN)
  static async archiviaUtente(id: string, motivo?: string): Promise<void> {
    await delay(600);
    
    const index = mockUtenti.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Utente non trovato');
    }

    const utente = mockUtenti[index];
    const exDipendente: ExDipendente = {
      ...utente,
      archiviato_at: new Date().toISOString(),
      motivo_archiviazione: motivo,
    };

    // Sposta in ex-dipendenti
    mockExDipendenti.push(exDipendente);
    
    // Rimuovi da utenti attivi (libera PIN)
    mockUtenti.splice(index, 1);
    
    console.log('📦 Utente archiviato:', exDipendente);
    console.log(`🔓 PIN ${utente.pin} liberato`);
  }

  // Elimina utente definitivamente
  static async deleteUtente(id: string): Promise<void> {
    await delay(500);
    
    const index = mockUtenti.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Utente non trovato');
    }

    const utente = mockUtenti[index];
    mockUtenti.splice(index, 1);
    
    console.log('❌ Utente eliminato definitivamente:', utente);
    console.log(`🔓 PIN ${utente.pin} liberato`);
  }

  // Verifica disponibilità PIN
  static async isPinAvailable(pin: number): Promise<boolean> {
    await delay(100);
    return !mockUtenti.some(u => u.pin === pin);
  }
}
