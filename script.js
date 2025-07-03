// Funzioni di utilità condivise tra le pagine

// Formattazione data italiana (da ISO a GG/MM/AAAA)
export function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

// Calcolo ore lavorate, inclusa uscita dopo mezzanotte
export function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return null;

  const baseDate = '1970-01-01';
  const inizio = new Date(`${baseDate}T${oraInizio}`);
  let fine = new Date(`${baseDate}T${oraFine}`);

  if (fine < inizio) {
    fine.setDate(fine.getDate() + 1); // Uscita dopo mezzanotte
  }

  const diffMs = fine - inizio;
  const ore = Math.floor(diffMs / 3600000);
  const minuti = Math.floor((diffMs % 3600000) / 60000);

  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: +(ore + minuti / 60).toFixed(2)
  };
}

// Validazione PIN (1 o 2 cifre numeriche)
export function validaPin(pin) {
  return /^\d{1,2}$/.test(pin);
}

// Validazione email base
export function validaEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Gestione errori Supabase
export function gestisciErroreSupabase(error) {
  console.error('Errore Supabase:', error);
  switch (error?.code) {
    case 'PGRST116': return 'Nessun dato trovato';
    case '23505': return 'PIN già esistente';
    default: return error?.message || 'Errore sconosciuto';
  }
}

// Funzione SQL per ottenere timestamp da data + ora
// Uso suggerito in SQL: EXTRACT(EPOCH FROM TIMESTAMP '${data} ${ora}')
export function generaQueryTimestamp(data, ora) {
  return `EXTRACT(EPOCH FROM TIMESTAMP '${data} ${ora}')`;
}
// Funzioni di utilità condivise tra le pagine

// Formattazione data italiana (da ISO a GG/MM/AAAA)
export function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

// Calcolo ore lavorate, inclusa uscita dopo mezzanotte
export function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return null;

  const baseDate = '1970-01-01';
  const inizio = new Date(`${baseDate}T${oraInizio}`);
  let fine = new Date(`${baseDate}T${oraFine}`);

  if (fine < inizio) {
    fine.setDate(fine.getDate() + 1); // Uscita dopo mezzanotte
  }

  const diffMs = fine - inizio;
  const ore = Math.floor(diffMs / 3600000);
  const minuti = Math.floor((diffMs % 3600000) / 60000);

  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: +(ore + minuti / 60).toFixed(2)
  };
}

// Validazione PIN (1 o 2 cifre numeriche)
export function validaPin(pin) {
  return /^\d{1,2}$/.test(pin);
}

// Validazione email base
export function validaEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Gestione errori Supabase
export function gestisciErroreSupabase(error) {
  console.error('Errore Supabase:', error);
  switch (error?.code) {
    case 'PGRST116': return 'Nessun dato trovato';
    case '23505': return 'PIN già esistente';
    default: return error?.message || 'Errore sconosciuto';
  }
}

// Funzione SQL per ottenere timestamp da data + ora
// Uso suggerito in SQL: EXTRACT(EPOCH FROM TIMESTAMP '${data} ${ora}')
export function generaQueryTimestamp(data, ora) {
  return `EXTRACT(EPOCH FROM TIMESTAMP '${data} ${ora}')`;
}
