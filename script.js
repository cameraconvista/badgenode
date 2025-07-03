
// Funzioni di utilità condivise tra le pagine

// Formattazione data italiana
function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

// Calcolo ore lavorate
function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return null;
  
  const inizio = new Date(`1970-01-01T${oraInizio}`);
  const fine = new Date(`1970-01-01T${oraFine}`);
  
  // Gestisce il caso in cui l'uscita è il giorno dopo
  if (fine < inizio) {
    fine.setDate(fine.getDate() + 1);
  }
  
  const diffMs = fine - inizio;
  const ore = Math.floor(diffMs / (1000 * 60 * 60));
  const minuti = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: ore + minuti / 60
  };
}

// Validazione PIN
function validaPin(pin) {
  return pin && pin.length >= 1 && pin.length <= 2 && /^\d+$/.test(pin);
}

// Validazione email
function validaEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Gestione errori Supabase
function gestisciErroreSupabase(error) {
  console.error('Errore Supabase:', error);
  
  if (error.code === 'PGRST116') {
    return 'Nessun dato trovato';
  } else if (error.code === '23505') {
    return 'PIN già esistente';
  } else {
    return error.message || 'Errore sconosciuto';
  }
}

// Export per uso in moduli ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDataIT,
    calcolaOreLavorate,
    validaPin,
    validaEmail,
    gestisciErroreSupabase
  };
}
