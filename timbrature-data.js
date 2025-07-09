
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
// Gestione dati delle timbrature
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

let supabaseClient = null;

// Inizializza il client Supabase
export function initSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      "https://txmjqrnitfsiytbytxlc.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzY1MDcsImV4cCI6MjA2NzExMjUwN30.lag16Oxh_UQL4WOeU9-pVxIzvUyiNQMhKUY5Y5s9DPg"
    );
  }
  return supabaseClient;
}

// Ottieni dati utente per PIN
export async function ottieniDatiUtente(pin) {
  const supabase = initSupabase();
  
  try {
    const { data, error } = await supabase
      .from("utenti")
      .select("nome, cognome, pin, email, telefono, descrizione_contratto, ore_contrattuali")
      .eq("pin", parseInt(pin))
      .single();

    if (error) {
      console.error("Errore recupero utente:", error);
      throw new Error("Errore nel recupero dati utente");
    }

    return data;
  } catch (error) {
    console.error("Errore ottieniDatiUtente:", error);
    throw error;
  }
}

// Carica timbrature per periodo
export async function caricaTimbrature(pin, dataInizio, dataFine) {
  const supabase = initSupabase();
  
  try {
    const { data, error } = await supabase
      .from("timbrature")
      .select("*")
      .eq("pin", parseInt(pin))
      .gte("data", dataInizio)
      .lte("data", dataFine)
      .order("data", { ascending: true })
      .order("ore", { ascending: true });

    if (error) {
      console.error("Errore caricamento timbrature:", error);
      throw new Error("Errore nel caricamento delle timbrature");
    }

    return data || [];
  } catch (error) {
    console.error("Errore caricaTimbrature:", error);
    throw error;
  }
}

// Raggruppa timbrature per giorno logico
export function raggruppaTimbraturePerGiorno(timbrature) {
  const timbratureGiorno = {};

  timbrature.forEach(timbratura => {
    const giornoLogico = timbratura.giornologico || timbratura.data;
    
    if (!timbratureGiorno[giornoLogico]) {
      timbratureGiorno[giornoLogico] = {
        data: giornoLogico,
        entrata: null,
        uscita: null,
        id_entrata: null,
        id_uscita: null
      };
    }

    if (timbratura.tipo === "entrata") {
      timbratureGiorno[giornoLogico].entrata = timbratura.ore;
      timbratureGiorno[giornoLogico].id_entrata = timbratura.id;
    } else if (timbratura.tipo === "uscita") {
      timbratureGiorno[giornoLogico].uscita = timbratura.ore;
      timbratureGiorno[giornoLogico].id_uscita = timbratura.id;
    }
  });

  return Object.values(timbratureGiorno).sort((a, b) => new Date(a.data) - new Date(b.data));
}

// Calcola ore giornaliere
export function calcolaOreGiornaliere(entrata, uscita) {
  if (!entrata || !uscita) {
    return { ore: 0, minuti: 0, formatted: "—", decimal: 0 };
  }

  const [oreE, minutiE] = entrata.split(':').map(Number);
  const [oreU, minutiU] = uscita.split(':').map(Number);

  let minutiTotaliEntrata = oreE * 60 + minutiE;
  let minutiTotaliUscita = oreU * 60 + minutiU;

  // Gestione uscita dopo mezzanotte
  if (minutiTotaliUscita < minutiTotaliEntrata) {
    minutiTotaliUscita += 24 * 60;
  }

  const differenzaMinuti = minutiTotaliUscita - minutiTotaliEntrata;
  const ore = Math.floor(differenzaMinuti / 60);
  const minuti = differenzaMinuti % 60;

  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: ore + minuti / 60
  };
}

// Calcola ore extra oltre soglia
export function calcolaOreExtra(oreDecimali, sogliaOre = 8) {
  if (oreDecimali <= sogliaOre) {
    return { ore: 0, minuti: 0, formatted: "—", decimal: 0 };
  }

  const oreExtra = oreDecimali - sogliaOre;
  const ore = Math.floor(oreExtra);
  const minuti = Math.round((oreExtra - ore) * 60);

  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: oreExtra
  };
}

// Calcola totali periodo
export function calcolaTotaliPeriodo(timbratureElaborate) {
  let totaleTotalmiMinuti = 0;
  let totaleExtraMinuti = 0;

  timbratureElaborate.forEach(giorno => {
    totaleTotalmiMinuti += giorno.oreTotali.ore * 60 + giorno.oreTotali.minuti;
    totaleExtraMinuti += giorno.oreExtra.ore * 60 + giorno.oreExtra.minuti;
  });

  const totaleOre = Math.floor(totaleTotalmiMinuti / 60);
  const totaleMinuti = totaleTotalmiMinuti % 60;

  const extraOre = Math.floor(totaleExtraMinuti / 60);
  const extraMinuti = totaleExtraMinuti % 60;

  return {
    totale: {
      ore: totaleOre,
      minuti: totaleMinuti,
      formatted: `${totaleOre}:${totaleMinuti.toString().padStart(2, '0')}`,
      decimal: totaleOre + totaleMinuti / 60
    },
    extra: {
      ore: extraOre,
      minuti: extraMinuti,
      formatted: extraOre > 0 || extraMinuti > 0 ? `${extraOre}:${extraMinuti.toString().padStart(2, '0')}` : "—",
      decimal: extraOre + extraMinuti / 60
    }
  };
}

// Salva modifiche timbratura
export async function salvaModificaTimbratura(pin, data, nuovaEntrata, nuovaUscita, idEntrata, idUscita) {
  const supabase = initSupabase();
  
  try {
    // Elimina timbrature esistenti per la data
    if (idEntrata) {
      await supabase.from("timbrature").delete().eq("id", idEntrata);
    }
    if (idUscita) {
      await supabase.from("timbrature").delete().eq("id", idUscita);
    }

    // Ottieni dati utente
    const utente = await ottieniDatiUtente(pin);
    
    // Calcolo giorno logico
    const dataObj = new Date(data + 'T12:00:00');
    let giornoLogico = data;
    
    // Se l'entrata è nelle prime ore del mattino (00:00-04:59), 
    // potrebbe appartenere al giorno lavorativo precedente
    if (nuovaEntrata) {
      const [oreEntrata] = nuovaEntrata.split(':').map(Number);
      if (oreEntrata >= 0 && oreEntrata < 5) {
        giornoLogico = new Date(dataObj.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    }

    const nuoveTimbrature = [];

    // Inserisci nuova entrata se specificata
    if (nuovaEntrata) {
      nuoveTimbrature.push({
        tipo: "entrata",
        pin: parseInt(pin),
        nome: utente.nome,
        cognome: utente.cognome,
        data: data,
        ore: nuovaEntrata + ":00",
        giornologico: giornoLogico
      });
    }

    // Inserisci nuova uscita se specificata
    if (nuovaUscita) {
      nuoveTimbrature.push({
        tipo: "uscita",
        pin: parseInt(pin),
        nome: utente.nome,
        cognome: utente.cognome,
        data: data,
        ore: nuovaUscita + ":00",
        giornologico: giornoLogico
      });
    }

    if (nuoveTimbrature.length > 0) {
      const { error } = await supabase.from("timbrature").insert(nuoveTimbrature);
      if (error) {
        console.error("Errore inserimento timbrature:", error);
        throw new Error("Errore nel salvataggio delle modifiche");
      }
    }

    return true;
  } catch (error) {
    console.error("Errore salvaModificaTimbratura:", error);
    throw error;
  }
}

// Elimina timbrature di un giorno
export async function eliminaTimbratureGiorno(idEntrata, idUscita) {
  const supabase = initSupabase();
  
  try {
    if (idEntrata) {
      const { error: errorEntrata } = await supabase.from("timbrature").delete().eq("id", idEntrata);
      if (errorEntrata) {
        console.error("Errore eliminazione entrata:", errorEntrata);
        throw new Error("Errore nell'eliminazione dell'entrata");
      }
    }

    if (idUscita) {
      const { error: errorUscita } = await supabase.from("timbrature").delete().eq("id", idUscita);
      if (errorUscita) {
        console.error("Errore eliminazione uscita:", errorUscita);
        throw new Error("Errore nell'eliminazione dell'uscita");
      }
    }

    return true;
  } catch (error) {
    console.error("Errore eliminaTimbratureGiorno:", error);
    throw error;
  }
}

// Elabora timbrature per la visualizzazione
export function elaboraTimbrature(timbratureRaggruppate, oreContrattuali = 8) {
  return timbratureRaggruppate.map(giorno => {
    const oreTotali = calcolaOreGiornaliere(giorno.entrata, giorno.uscita);
    const oreExtra = calcolaOreExtra(oreTotali.decimal, oreContrattuali);

    return {
      ...giorno,
      oreTotali,
      oreExtra
    };
  });
}

// Formattazione data italiana
export function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

// Validazione orario
export function validaOrario(orario) {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(orario);
}

// Ottieni range di date mensili
export function getRangeMensile(mese) {
  const oggi = new Date();
  let anno = oggi.getFullYear();
  let meseIndice = oggi.getMonth();

  if (mese === "precedente") {
    meseIndice -= 1;
    if (meseIndice < 0) {
      meseIndice = 11;
      anno -= 1;
    }
  } else if (mese === "due-precedenti") {
    meseIndice -= 2;
    if (meseIndice < 0) {
      meseIndice += 12;
      anno -= 1;
    }
  }

  const primoGiorno = new Date(anno, meseIndice, 1);
  const ultimoGiorno = new Date(anno, meseIndice + 1, 0);

  return {
    inizio: primoGiorno.toISOString().split('T')[0],
    fine: ultimoGiorno.toISOString().split('T')[0]
  };
}
