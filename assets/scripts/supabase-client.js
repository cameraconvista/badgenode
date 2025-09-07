// Client Supabase configurato
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabaseClient = createClient(
  "https://txmjqrnitfsiytbytxlc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzY1MDcsImV4cCI6MjA2NzExMjUwN30.lag16Oxh_UQL4WOeU9-pVxIzvUyiNQMhKUY5Y5s9DPg"
);

// Compatibilità retro: espone client anche come variabile globale se window esiste
if (typeof window !== 'undefined') {
    window.supabaseClient = supabaseClient;
}

// Funzione helper per gestire gli errori Supabase
export function gestisciErroreSupabase(error) {
  console.error('Errore Supabase:', error);
  switch (error?.code) {
    case 'PGRST116': return 'Nessun dato trovato';
    case '23505': return 'PIN già esistente';
    default: return error?.message || 'Errore sconosciuto';
  }
}

// Funzioni helper per le timbrature
export async function recuperaTimbrature(pin, dataInizio, dataFine) {
  try {
    const { data, error } = await supabaseClient
      .from("timbrature")
      .select("*")
      .eq("pin", parseInt(pin))
      .gte("data", dataInizio)
      .lte("data", dataFine)
      .order("data", { ascending: true })
      .order("ore", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Errore recupero timbrature:", error);
    throw error;
  }
}

export async function recuperaUtente(pin) {
  try {
    const { data, error } = await supabaseClient
      .from("utenti")
      .select("nome, cognome, email, ore_contrattuali")
      .eq("pin", parseInt(pin))
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Errore recupero utente:", error);
    throw error;
  }
}