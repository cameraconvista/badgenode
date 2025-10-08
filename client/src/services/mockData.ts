import { Utente, ExDipendente } from './utenti.service';

// Empty mock data - all data cleaned for fresh start
export const mockUtenti: Utente[] = [];

export const mockExDipendenti: ExDipendente[] = [];

// Simula delay di rete
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
