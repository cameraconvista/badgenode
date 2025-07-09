// calendar-utils.js

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
