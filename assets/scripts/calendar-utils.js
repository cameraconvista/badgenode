
// Utilities per la gestione del calendario
export function initCalendarUtils() {
  // Gestione semplificata delle icone calendario
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.icona-calendario-campo').forEach(icon => {
      icon.addEventListener('click', function(e) {
        e.preventDefault();
        const campoId = this.getAttribute('data-campo');
        const campo = document.getElementById(campoId);
        if (campo) {
          try {
            campo.focus();
            if (campo.showPicker && typeof campo.showPicker === 'function') {
              campo.showPicker();
            }
          } catch (err) {
            campo.focus();
          }
        }
      });
    });
  });
}

// Formattazione data italiana
export function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const [anno, mese, giorno] = dataISO.split('-');
  return `${giorno}/${mese}/${anno}`;
}

// Calcolo ore lavorate
export function calcolaOreLavorate(oraInizio, oraFine) {
  if (!oraInizio || !oraFine) return null;

  const inizio = new Date(`1970-01-01T${oraInizio}`);
  const fine = new Date(`1970-01-01T${oraFine}`);

  if (fine < inizio) fine.setDate(fine.getDate() + 1);

  const diffMs = fine - inizio;
  const ore = Math.floor(diffMs / 3600000);
  const minuti = Math.floor((diffMs % 3600000) / 60000);

  return {
    ore,
    minuti,
    formatted: `${ore}:${minuti.toString().padStart(2, '0')}`,
    decimal: ore + minuti / 60
  };
}

// Validazione date
export function validaData(data) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(data);
}

// Ottieni range mensile
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
