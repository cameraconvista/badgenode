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

// Funzione corretta per ottenere l'ora in formato decimale da data e ora stringa
function getOraDecimale(data, ora) {
  try {
    const timestamp = new Date(`${data}T${ora}`);
    if (isNaN(timestamp)) return null;
    const ore = timestamp.getHours();
    const minuti = timestamp.getMinutes();
    return ore + minuti / 60;
  } catch (e) {
    console.error("Errore nel parsing dell'orario:", e);
    return null;
  }
}

// Esportazione globale opzionale (se richiesto da altri script)
window.utils = {
  formatDataIT,
  calcolaOreLavorate,
  validaPin,
  validaEmail,
  gestisciErroreSupabase,
  getOraDecimale
};

// Placeholder for the part of the code that needs to be modified
function updateStatusMessage(utente, tipo, oraAttuale, statusDiv) {
    const tipoColorato = tipo === 'entrata' 
      ? `<span style="color: #10b981; font-weight: bold;">ENTRATA</span>`
      : `<span style="color: #ef4444; font-weight: bold;">USCITA</span>`;

    statusDiv.innerHTML = `${utente.nome} ${utente.cognome} ${tipoColorato} ${oraAttuale}`;
    statusDiv.className = `status-message visible ${tipo === 'entrata' ? 'success' : 'error'}`;
}