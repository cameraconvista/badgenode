import { Utente, ExDipendente } from './utenti.service';

// Mock data per sviluppo
export const mockUtenti: Utente[] = [
  {
    id: '1',
    pin: 1,
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@example.com',
    telefono: '+39 123 456 7890',
    ore_contrattuali: 8.0,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    pin: 2,
    nome: 'Giulia',
    cognome: 'Bianchi',
    email: 'giulia.bianchi@example.com',
    telefono: '+39 123 456 7891',
    ore_contrattuali: 6.0,
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z',
  },
  {
    id: '3',
    pin: 5,
    nome: 'Luca',
    cognome: 'Verdi',
    email: 'luca.verdi@example.com',
    ore_contrattuali: 8.0,
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z',
  },
  {
    id: '4',
    pin: 7,
    nome: 'Anna',
    cognome: 'Neri',
    email: 'anna.neri@example.com',
    telefono: '+39 123 456 7893',
    ore_contrattuali: 4.0,
    created_at: '2024-04-05T11:00:00Z',
    updated_at: '2024-04-05T11:00:00Z',
  },
];

export const mockExDipendenti: ExDipendente[] = [
  {
    id: '99',
    pin: 99,
    nome: 'Franco',
    cognome: 'Gialli',
    email: 'franco.gialli@example.com',
    ore_contrattuali: 8.0,
    created_at: '2023-01-01T08:00:00Z',
    updated_at: '2023-12-31T17:00:00Z',
    archiviato_at: '2023-12-31T17:00:00Z',
    motivo_archiviazione: 'Dimissioni volontarie',
  },
];

// Simula delay di rete
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
