
// Gestione dati timbrature
let supabaseClient = null;

export function initSupabaseClient() {
  if (window.supabase) {
    supabaseClient = window.supabase;
    return true;
  }
  console.error('Supabase client non disponibile');
  return false;
}

// Normalizza data per confronti
export function normalizzaData(data) {
  if (typeof data !== 'string') {
    data = new Date(data).toISOString().split('T')[0];
  } else if (data.includes('T')) {
    data = data.split('T')[0];
  }
  return data;
}

// Carica dati utente
export async function caricaDatiUtente(pin) {
  if (!supabaseClient) {
    throw new Error('Supabase client non inizializzato');
  }

  const { data, error } = await supabaseClient
    .from("utenti")
    .select("nome, cognome, email, ore_contrattuali")
    .eq("pin", parseInt(pin))
    .single();

  if (error) {
    throw new Error("Errore recupero utente: " + error.message);
  }

  return data;
}

// Carica timbrature filtrate per data
export async function caricaTimbrature(pin, dataInizio, dataFine) {
  if (!supabaseClient) {
    throw new Error('Supabase client non inizializzato');
  }

  const { data, error } = await supabaseClient
    .from("timbrature")
    .select("*")
    .eq("pin", parseInt(pin))
    .order("data", { ascending: true })
    .order("ore", { ascending: true });

  if (error) {
    throw new Error("Errore nel recupero timbrature: " + error.message);
  }

  // Filtra le timbrature per range di date
  return (data || []).filter(t => {
    const dataRiferimento = normalizzaData(t.giornologico || t.data);
    return dataRiferimento >= dataInizio && dataRiferimento <= dataFine;
  });
}

// Salva modifiche timbrature
export async function salvaModificheTimbrature(modifiche) {
  if (!supabaseClient) {
    throw new Error('Supabase client non inizializzato');
  }

  const risultati = [];

  for (const modifica of modifiche) {
    try {
      if (modifica.tipo === 'update') {
        const { data, error } = await supabaseClient
          .from("timbrature")
          .update(modifica.dati)
          .eq("id", modifica.id);
        
        if (error) throw error;
        risultati.push({ success: true, data });
      } else if (modifica.tipo === 'insert') {
        const { data, error } = await supabaseClient
          .from("timbrature")
          .insert([modifica.dati]);
        
        if (error) throw error;
        risultati.push({ success: true, data });
      } else if (modifica.tipo === 'delete') {
        const { data, error } = await supabaseClient
          .from("timbrature")
          .delete()
          .eq("id", modifica.id);
        
        if (error) throw error;
        risultati.push({ success: true, data });
      }
    } catch (error) {
      risultati.push({ success: false, error: error.message });
    }
  }

  return risultati;
}

// Calcola giorno logico (per turni notturni)
export function calcolaGiornoLogico(data, ora) {
  const [ore] = ora.split(':').map(Number);
  
  // Se l'ora è tra 00:00 e 04:59, appartiene al giorno lavorativo precedente
  if (ore >= 0 && ore < 5) {
    const dataObj = new Date(data);
    dataObj.setDate(dataObj.getDate() - 1);
    return dataObj.toISOString().split('T')[0];
  }
  
  return data;
}

// Raggruppa timbrature per giorno logico
export function raggruppaTimbraturePerGiorno(timbrature) {
  const gruppi = {};
  
  timbrature.forEach(timbratura => {
    const giornoLogico = timbratura.giornologico || timbratura.data;
    const chiave = normalizzaData(giornoLogico);
    
    if (!gruppi[chiave]) {
      gruppi[chiave] = {
        data: chiave,
        entrate: [],
        uscite: []
      };
    }
    
    if (timbratura.tipo === 'entrata') {
      gruppi[chiave].entrate.push(timbratura);
    } else {
      gruppi[chiave].uscite.push(timbratura);
    }
  });
  
  return gruppi;
}

// Calcola ore lavorate tra due orari
export function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return 0;

  const [oreInizio, minInizio] = oraInizio.split(':').map(Number);
  const [oreFine, minFine] = oraFine.split(':').map(Number);

  let minutiInizio = oreInizio * 60 + minInizio;
  let minutiFine = oreFine * 60 + minFine;

  // Gestisce il caso di orario notturno (fine < inizio)
  if (minutiFine < minutiInizio) {
    minutiFine += 24 * 60; // Aggiungi 24 ore
  }

  const differenzaMinuti = minutiFine - minutiInizio;
  return differenzaMinuti / 60; // Ritorna in ore decimali
}

// Formatta ore in formato HH:MM
export function formattaOre(oreDecimali) {
  if (oreDecimali === 0 || oreDecimali === null || oreDecimali === undefined) return '—';
  
  const ore = Math.floor(oreDecimali);
  const minuti = Math.round((oreDecimali - ore) * 60);
  
  return `${ore}:${minuti.toString().padStart(2, '0')}`;
}

// Valida formato orario
export function validaOrario(orario) {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(orario);
}

// Esporta configurazioni per diversi formati
export const formatoEsportazione = {
  excel: {
    estensione: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  csv: {
    estensione: 'csv',
    mimeType: 'text/csv'
  },
  pdf: {
    estensione: 'pdf',
    mimeType: 'application/pdf'
  }
};
