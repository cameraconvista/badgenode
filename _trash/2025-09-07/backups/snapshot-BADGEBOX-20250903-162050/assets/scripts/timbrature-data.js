// timbrature-data.js

import { supabaseClient } from './supabase-client.js';
import { normalizzaData } from './calendar-utils.js';

// Cache per evitare richieste duplicate
const cache = new Map();
const CACHE_TTL = 30000; // 30 secondi

export async function caricaDati(pin, dataInizio, dataFine) {
  if (!pin) return { dipendente: null, timbrature: [] };

  // Chiave cache
  const cacheKey = `${pin}_${dataInizio}_${dataFine}`;
  const cached = cache.get(cacheKey);
  
  // Verifica cache
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('✅ Dati caricati da cache');
    return cached.data;
  }

  try {
    console.log('🔄 Caricamento dati da server...');
    
    // Query ottimizzata con JOIN per un'unica richiesta
    const { data, error } = await supabaseClient
      .from("timbrature")
      .select(`
        *,
        utenti!inner (
          nome,
          cognome,
          email,
          ore_contrattuali
        )
      `)
      .eq("pin", parseInt(pin))
      .gte("data", dataInizio)
      .lte("data", dataFine)
      .order("data", { ascending: true })
      .order("ore", { ascending: true });

    if (error) throw new Error("Errore recupero dati: " + error.message);

    // Estrai dipendente dai dati
    const dipendente = data && data.length > 0 ? {
      nome: data[0].utenti.nome,
      cognome: data[0].utenti.cognome,
      email: data[0].utenti.email,
      ore_contrattuali: data[0].utenti.ore_contrattuali
    } : null;

    // Filtra solo le timbrature (rimuovi dati utente)
    const timbrature = (data || []).map(t => ({
      id: t.id,
      tipo: t.tipo,
      pin: t.pin,
      nome: t.nome,
      cognome: t.cognome,
      data: t.data,
      ore: t.ore,
      giornologico: t.giornologico
    }));

    // Applica filtro aggiuntivo solo se necessario (per giornologico)
    const timbratureFiltrate = timbrature.filter(t => {
      const dataRiferimento = normalizzaData(t.giornologico || t.data);
      return dataRiferimento >= dataInizio && dataRiferimento <= dataFine;
    });

    const result = { dipendente, timbrature: timbratureFiltrate };
    
    // Salva in cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`✅ Caricati ${timbratureFiltrate.length} record dal server`);
    return result;
    
  } catch (error) {
    console.error('❌ Errore caricamento dati:', error);
    alert(error.message);
    return { dipendente: null, timbrature: [] };
  }
}

// Funzione per pulire cache quando necessario
export function pulisciCache() {
  cache.clear();
  console.log('🧹 Cache pulita');
}
