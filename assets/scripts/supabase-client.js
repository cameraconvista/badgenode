// Client Supabase configurato
import { createClient } from '@supabase/supabase-js';

function readMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`);
  return el?.content || '';
}

// Diagnostica ENV presenza (senza stampare le chiavi)
console.info('[SUPABASE] env present', {
  hasUrl: !!(import.meta.env?.VITE_SUPABASE_URL),
  hasAnon: !!(import.meta.env?.VITE_SUPABASE_ANON_KEY)
});

const url =
  import.meta.env?.VITE_SUPABASE_URL ||
  (window.__SUPABASE__ && window.__SUPABASE__.url) ||
  readMeta('supabase-url');

const anonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (window.__SUPABASE__ && window.__SUPABASE__.anonKey) ||
  readMeta('supabase-anon-key');

if (!url || !anonKey) {
  // Log non sensibile: non stampiamo le chiavi, solo presenza/assenza
  console.error('[SUPABASE] Config mancante', { hasUrl: !!url, hasAnonKey: !!anonKey });
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export async function pingSupabase() {
  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'cors' });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Compatibilità retro: espone client anche come variabile globale se window esiste
if (typeof window !== 'undefined') {
    window.supabaseClient = supabase;
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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