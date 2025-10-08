// Servizio per gestione timbrature e storico
// TODO: Integrare con Supabase quando disponibile

import { Timbratura, computeGiornoLogico } from '@/lib/time';
import { delay } from './mockData';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';

// Mock data per timbrature
const mockTimbrature: Timbratura[] = [
  {
    id: '1',
    pin: 71,
    tipo: 'entrata',
    data: '2024-10-07',
    ore: '08:30:00',
    giornologico: '2024-10-07',
    nome: 'Francisco',
    cognome: 'Candussi Baez',
    created_at: '2024-10-07T08:30:00Z'
  },
  {
    id: '2',
    pin: 71,
    tipo: 'uscita',
    data: '2024-10-07',
    ore: '17:30:00',
    giornologico: '2024-10-07',
    nome: 'Francisco',
    cognome: 'Candussi Baez',
    created_at: '2024-10-07T17:30:00Z'
  },
  {
    id: '3',
    pin: 71,
    tipo: 'entrata',
    data: '2024-10-08',
    ore: '08:00:00',
    giornologico: '2024-10-08',
    nome: 'Francisco',
    cognome: 'Candussi Baez',
    created_at: '2024-10-08T08:00:00Z'
  },
  {
    id: '4',
    pin: 71,
    tipo: 'uscita',
    data: '2024-10-08',
    ore: '18:30:00',
    giornologico: '2024-10-08',
    nome: 'Francisco',
    cognome: 'Candussi Baez',
    created_at: '2024-10-08T18:30:00Z'
  },
  // Turno notturno
  {
    id: '5',
    pin: 71,
    tipo: 'entrata',
    data: '2024-10-09',
    ore: '22:00:00',
    giornologico: '2024-10-09',
    nome: 'Francisco',
    cognome: 'Candussi Baez',
    created_at: '2024-10-09T22:00:00Z'
  },
  {
    id: '6',
    pin: 71,
    tipo: 'uscita',
    data: '2024-10-10',
    ore: '06:00:00',
    giornologico: '2024-10-09',
    nome: 'Francisco',
    cognome: 'Candussi Baez',
    created_at: '2024-10-10T06:00:00Z'
  }
];

export interface TimbratureFilters {
  pin: number;
  dal: string;
  al: string;
}

// Interface moved to timbrature-stats.service.ts

export class TimbratureService {
  // Ottieni timbrature per periodo (filtrate per giorno logico)
  static async getTimbraturePeriodo(filters: TimbratureFilters): Promise<Timbratura[]> {
    await delay(400);
    console.log('📊 Caricamento timbrature per periodo:', filters);
    
    return mockTimbrature.filter(t => {
      return t.pin === filters.pin &&
             t.giornologico >= filters.dal &&
             t.giornologico <= filters.al;
    }).sort((a, b) => {
      // Ordina per giorno logico, poi per orario
      const dateCompare = a.giornologico.localeCompare(b.giornologico);
      if (dateCompare !== 0) return dateCompare;
      return a.ore.localeCompare(b.ore);
    });
  }

  // Ottieni timbrature per singolo giorno logico
  static async getTimbratureGiorno(pin: number, giornologico: string): Promise<Timbratura[]> {
    await delay(200);
    
    return mockTimbrature.filter(t => 
      t.pin === pin && t.giornologico === giornologico
    ).sort((a, b) => a.ore.localeCompare(b.ore));
  }

  // Crea nuova timbratura
  static async createTimbratura(input: {
    pin: number;
    tipo: 'entrata' | 'uscita';
    data: string;
    ore: string;
    nome: string;
    cognome: string;
    dataEntrata?: string; // Per calcolo giorno logico uscite
  }): Promise<Timbratura> {
    await delay(300);
    
    // Calcola giorno logico
    const { giornologico, dataReale } = computeGiornoLogico({
      data: input.data,
      ora: input.ore,
      tipo: input.tipo,
      dataEntrata: input.dataEntrata
    });

    const newTimbratura: Timbratura = {
      id: Date.now().toString(),
      pin: input.pin,
      tipo: input.tipo,
      data: dataReale,
      ore: input.ore,
      giornologico,
      nome: input.nome,
      cognome: input.cognome,
      created_at: new Date().toISOString()
    };

    mockTimbrature.push(newTimbratura);
    console.log('✅ Timbratura creata:', newTimbratura);
    return newTimbratura;
  }

  // Aggiorna timbratura esistente
  static async updateTimbratura(id: string, input: {
    data: string;
    ore: string;
    dataEntrata?: string;
  }): Promise<Timbratura> {
    await delay(400);
    
    const index = mockTimbrature.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Timbratura non trovata');
    }

    const timbratura = mockTimbrature[index];
    
    // Ricalcola giorno logico
    const { giornologico, dataReale } = computeGiornoLogico({
      data: input.data,
      ora: input.ore,
      tipo: timbratura.tipo,
      dataEntrata: input.dataEntrata
    });

    mockTimbrature[index] = {
      ...timbratura,
      data: dataReale,
      ore: input.ore,
      giornologico
    };

    console.log('✅ Timbratura aggiornata:', mockTimbrature[index]);
    return mockTimbrature[index];
  }

  // Elimina timbratura
  static async deleteTimbratura(id: string): Promise<void> {
    await delay(300);
    
    const index = mockTimbrature.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Timbratura non trovata');
    }

    const timbratura = mockTimbrature[index];
    mockTimbrature.splice(index, 1);
    
    console.log('❌ Timbratura eliminata:', timbratura);
  }

  // Calcola statistiche periodo
  static async getStatsPeriodo(filters: TimbratureFilters, oreContrattuali: number): Promise<TimbratureStats> {
    const timbrature = await this.getTimbraturePeriodo(filters);
    return TimbratureStatsService.calculateStats(timbrature, oreContrattuali);
  }

  // RPC: Inserisci timbratura via Supabase
  static async timbra(tipo: 'entrata' | 'uscita', when?: string): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('insert_timbro', {
        p_tipo: tipo,
        p_ts: when || null
      });

      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          throw new Error('Non autorizzato: controlla PIN/ruolo');
        }
        throw error;
      }

      console.log('✅ Timbratura registrata:', { tipo, when: when || 'now', data });
    } catch (error) {
      console.error('❌ Errore timbratura:', error);
      throw error;
    }
  }
}
