// calendar-utils.js

// Aggiorna il range di date nei campi input
export function aggiornaRange(valore, dataInizio, dataFine) {
  const oggi = new Date();
  let inizio, fine;

  switch (valore) {
    case 'corrente':
      inizio = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
      fine = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
      break;
    case 'precedente':
      inizio = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
      fine = new Date(oggi.getFullYear(), oggi.getMonth(), 0);
      break;
    case 'due-precedenti':
      inizio = new Date(oggi.getFullYear(), oggi.getMonth() - 2, 1);
      fine = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 0);
      break;
    default:
      return;
  }

  dataInizio.value = inizio.toISOString().split('T')[0];
  dataFine.value = fine.toISOString().split('T')[0];
}

// Normalizza data nel formato YYYY-MM-DD
export function normalizzaData(data) {
  if (!data) return '';
  if (data.includes('T')) {
    return data.split('T')[0];
  }
  return data;
}

// Formatta ore decimali in formato HH:MM
export function formattaOre(oreDecimali) {
  if (!oreDecimali || oreDecimali === 0) return '—';
  
  const ore = Math.floor(oreDecimali);
  const minuti = Math.round((oreDecimali - ore) * 60);
  
  return `${ore}:${minuti.toString().padStart(2, '0')}`;
}

// Aggiunge opzione personalizzato al select
export function aggiungiOpzionePersonalizzato(selectElement) {
  if (!selectElement) return;
  
  const esistePersonalizzato = selectElement.querySelector('option[value="personalizzato"]');
  if (!esistePersonalizzato) {
    const opzionePersonalizzato = document.createElement('option');
    opzionePersonalizzato.value = 'personalizzato';
    opzionePersonalizzato.textContent = 'Personalizzato';
    selectElement.appendChild(opzionePersonalizzato);
  }
  
  selectElement.value = 'personalizzato';
  selectElement.style.borderColor = '#fbbf24';
  selectElement.style.color = '#fbbf24';
}

// Calcola ore lavorate tra due orari (restituisce numero decimale)
export function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return 0;

  const inizio = new Date(`1970-01-01T${oraInizio}`);
  const fine = new Date(`1970-01-01T${oraFine}`);

  // Gestisce il caso in cui l'uscita sia dopo mezzanotte
  if (fine < inizio) {
    fine.setDate(fine.getDate() + 1);
  }

  const diffMs = fine - inizio;
  return diffMs / (1000 * 60 * 60); // Converti millisecondi in ore decimali
}

let calendarioAperto = null;

export function normalizzaData(data) {
  if (typeof data !== 'string') {
    data = new Date(data).toISOString().split('T')[0];
  } else if (data.includes('T')) {
    data = data.split('T')[0];
  }
  return data;
}

export function aggiornaRange(mese, dataInizio, dataFine) {
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

  const primoGiorno = new Date(anno, meseIndice, 1, 12, 0, 0);
  const ultimoGiorno = new Date(anno, meseIndice + 1, 0, 12, 0, 0);

  dataInizio.value = primoGiorno.toISOString().split('T')[0];
  dataFine.value = ultimoGiorno.toISOString().split('T')[0];
}

export function aggiungiOpzionePersonalizzato(selectFiltro) {
  let opzionePersonalizzato = selectFiltro.querySelector('option[value="personalizzato"]');
  if (!opzionePersonalizzato) {
    opzionePersonalizzato = document.createElement('option');
    opzionePersonalizzato.value = 'personalizzato';
    opzionePersonalizzato.textContent = '✓ Personalizzato';
    opzionePersonalizzato.style.color = '#90EE90';
    opzionePersonalizzato.style.backgroundColor = '#1e293b';
    opzionePersonalizzato.style.fontWeight = 'bold';
    selectFiltro.appendChild(opzionePersonalizzato);
  }
  selectFiltro.value = "personalizzato";
  selectFiltro.style.borderColor = '#90EE90';
  selectFiltro.style.color = '#90EE90';
}

export function calcolaOreLavorate(oraInizio, oraFine) {
  const inizio = new Date(`1970-01-01T${oraInizio}`);
  const fine = new Date(`1970-01-01T${oraFine}`);

  if (fine < inizio) fine.setDate(fine.getDate() + 1);

  const diffMs = fine - inizio;
  return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
}

export function formattaOre(ore) {
  if (ore <= 0) return '—';
  const oreInt = Math.floor(ore);
  const minuti = Math.round((ore % 1) * 60);
  return `${oreInt}:${minuti.toString().padStart(2, '0')}`;
}
