// Funzioni di utilità condivise tra le pagine

// Formattazione data italiana (da ISO a GG/MM/AAAA)
function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

// Calcolo ore lavorate, inclusa uscita dopo mezzanotte
function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return null;

  const inizio = new Date(`1970-01-01T${oraInizio}`);
  const fine = new Date(`1970-01-01T${oraFine}`);

  if (fine < inizio) fine.setDate(fine.getDate() + 1);

  const diffMs = fine - inizio;
  const ore = Math.floor(diffMs / 3_600_000);
  const minuti = Math.floor((diffMs % 3_600_000) / 60_000);

  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: ore + minuti / 60
  };
}

// Validazione PIN (1 o 2 cifre)
function validaPin(pin) {
  return /^\d{1,2}$/.test(pin);
}

// Validazione email base
function validaEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Gestione errori Supabase
function gestisciErroreSupabase(error) {
  console.error('Errore Supabase:', error);
  switch (error?.code) {
    case 'PGRST116': return 'Nessun dato trovato';
    case '23505': return 'PIN già esistente';
    default: return error?.message || 'Errore sconosciuto';
  }
}
