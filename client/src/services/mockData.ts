import { Utente, ExDipendente } from './utenti.service';

// Mock data per sviluppo - 15 dipendenti demo
export const mockUtenti: Utente[] = [
  { id: '1', pin: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - Sviluppatore Senior', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', pin: 2, nome: 'Giulia', cognome: 'Bianchi', email: 'giulia.bianchi@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo determinato - Project Manager', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', pin: 3, nome: 'Luca', cognome: 'Verdi', email: 'luca.verdi@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - Designer UX/UI', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '4', pin: 4, nome: 'Anna', cognome: 'Neri', email: 'anna.neri@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto part-time - Amministrazione', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '5', pin: 5, nome: 'Marco', cognome: 'Blu', email: 'marco.blu@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - DevOps Engineer', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '6', pin: 6, nome: 'Sara', cognome: 'Gialli', email: 'sara.gialli@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo determinato - Marketing Specialist', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '7', pin: 7, nome: 'Andrea', cognome: 'Rosa', email: 'andrea.rosa@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - Full Stack Developer', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '8', pin: 8, nome: 'Elena', cognome: 'Viola', email: 'elena.viola@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto freelance - Consulente IT', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '9', pin: 9, nome: 'Francesco', cognome: 'Arancio', email: 'francesco.arancio@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - Data Analyst', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '10', pin: 10, nome: 'Chiara', cognome: 'Marrone', email: 'chiara.marrone@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo determinato - HR Specialist', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '11', pin: 11, nome: 'Davide', cognome: 'Grigio', email: 'davide.grigio@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - QA Tester', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '12', pin: 12, nome: 'Federica', cognome: 'Oro', email: 'federica.oro@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto part-time - Contabilità', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '13', pin: 13, nome: 'Matteo', cognome: 'Argento', email: 'matteo.argento@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo indeterminato - System Administrator', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '14', pin: 14, nome: 'Valentina', cognome: 'Bronzo', email: 'valentina.bronzo@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto a tempo determinato - Business Analyst', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '15', pin: 15, nome: 'Simone', cognome: 'Rame', email: 'simone.rame@badgenode.com', ore_contrattuali: 8, descrizione_contratto: 'Contratto freelance - Graphic Designer', created_at: '2024-01-01', updated_at: '2024-01-01' }
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
