// timbrature-data.js

import { supabaseClient } from './supabase-client.js';
import { normalizzaData } from './calendar-utils.js';

export async function caricaDati(pin, dataInizio, dataFine) {
  if (!pin) return { dipendente: null, timbrature: [] };

  try {
    const { data: datiUtente, error: errUtente } = await supabaseClient
      .from("utenti")
      .select("nome, cognome, email, ore_contrattuali")
      .eq("pin", parseInt(pin))
      .single();

    if (errUtente) throw new Error("Errore recupero utente: " + errUtente.message);
    const dipendente = datiUtente;

    const { data, error } = await supabaseClient
      .from("timbrature")
      .select("*")
      .eq("pin", parseInt(pin))
      .order("data", { ascending: true })
      .order("ore", { ascending: true });

    if (error) throw new Error("Errore recupero timbrature: " + error.message);

    const timbratureFiltrate = (data || []).filter(t => {
      const dataRiferimento = normalizzaData(t.giornologico || t.data);
      return dataRiferimento >= dataInizio && dataRiferimento <= dataFine;
    });

    return { dipendente, timbrature: timbratureFiltrate };
  } catch (error) {
    alert(error.message);
    return { dipendente: null, timbrature: [] };
  }
}
