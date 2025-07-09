
// Rendering della tabella timbrature
import { formattaOre, calcolaOreLavorate, normalizzaData } from './timbrature-data.js';

let dipendente = null;
let timbrature = [];

export function setDipendente(datiDipendente) {
  dipendente = datiDipendente;
}

export function setTimbrature(datiTimbrature) {
  timbrature = datiTimbrature;
}

// Renderizza la tabella completa
export function renderizzaTabella() {
  const tbody = document.getElementById('storico-body');
  const footer = document.getElementById('totale-footer');
  
  if (!tbody || !footer) {
    console.error('Elementi tabella non trovati');
    return;
  }

  // Pulisci la tabella
  tbody.innerHTML = '';
  footer.innerHTML = '';

  if (!timbrature || timbrature.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Nessuna timbratura trovata nel periodo selezionato</td></tr>';
    return;
  }

  // Raggruppa timbrature per giorno logico
  const gruppi = raggruppaTimbraturePerGiorno();
  const giorniOrdinati = Object.keys(gruppi).sort();

  let totaleMensileOre = 0;
  let totaleMensileExtra = 0;

  // Renderizza ogni giorno
  giorniOrdinati.forEach(data => {
    const gruppo = gruppi[data];
    const rigaHtml = creaRigaGiorno(gruppo);
    
    tbody.insertAdjacentHTML('beforeend', rigaHtml.html);
    totaleMensileOre += rigaHtml.ore;
    totaleMensileExtra += rigaHtml.extra;
  });

  // Renderizza footer con totali
  renderizzaFooter(totaleMensileOre, totaleMensileExtra);
}

// Raggruppa timbrature per giorno logico
function raggruppaTimbraturePerGiorno() {
  const gruppi = {};
  
  timbrature.forEach(timbratura => {
    const giornoLogico = normalizzaData(timbratura.giornologico || timbratura.data);
    
    if (!gruppi[giornoLogico]) {
      gruppi[giornoLogico] = {
        data: giornoLogico,
        entrate: [],
        uscite: []
      };
    }
    
    if (timbratura.tipo === 'entrata') {
      gruppi[giornoLogico].entrate.push(timbratura);
    } else {
      gruppi[giornoLogico].uscite.push(timbratura);
    }
  });
  
  return gruppi;
}

// Crea HTML per una riga giorno
function creaRigaGiorno(gruppo) {
  const dataObj = new Date(gruppo.data + 'T12:00:00');
  const dataFormatted = dataObj.toLocaleDateString('it-IT');
  const isWeekend = dataObj.getDay() === 0 || dataObj.getDay() === 6;

  // Trova prima entrata e ultima uscita
  const primaEntrata = gruppo.entrate.length > 0 ? gruppo.entrate[0] : null;
  const ultimaUscita = gruppo.uscite.length > 0 ? gruppo.uscite[gruppo.uscite.length - 1] : null;

  // Calcola ore lavorate
  let oreLavorate = 0;
  if (primaEntrata && ultimaUscita) {
    oreLavorate = calcolaOreLavorate(primaEntrata.ore, ultimaUscita.ore);
  }

  // Calcola ore extra
  const oreContrattuali = parseFloat(dipendente?.ore_contrattuali) || 8.00;
  const oreExtra = Math.max(0, oreLavorate - oreContrattuali);

  // Formatta visualizzazione
  const entrataDisplay = primaEntrata ? primaEntrata.ore.slice(0, 5) : '—';
  const uscitaDisplay = ultimaUscita ? ultimaUscita.ore.slice(0, 5) : '—';
  const oreDisplay = formattaOre(oreLavorate);
  
  let extraContent = '';
  if (oreExtra > 0) {
    extraContent = `<span style="color: #fbbf24; font-weight: bold;">${formattaOre(oreExtra)}</span>`;
  } else {
    extraContent = '—';
  }

  // ID per modifica (usa prima entrata se disponibile)
  const timbraturaId = primaEntrata ? primaEntrata.id : (ultimaUscita ? ultimaUscita.id : '');

  const weekendClass = isWeekend ? ' weekend' : '';
  
  const html = `
    <tr class="${weekendClass}">
      <td>${dataFormatted}</td>
      <td>${entrataDisplay}</td>
      <td>${uscitaDisplay}</td>
      <td>${oreDisplay}</td>
      <td>${extraContent}</td>
      <td>
        <img src="assets/icons/matita-colorata.png" 
             class="modifica-icon" 
             data-data="${gruppo.data}" 
             data-timbratura-id="${timbraturaId}"
             title="Modifica timbrature" 
             style="cursor: pointer; width: 20px; height: 20px;" />
      </td>
    </tr>
  `;

  return {
    html,
    ore: oreLavorate,
    extra: oreExtra
  };
}

// Renderizza footer con totali
function renderizzaFooter(totaleMensileOre, totaleMensileExtra) {
  const footer = document.getElementById('totale-footer');
  
  const oreContrattualiMensili = parseFloat(dipendente?.ore_contrattuali) || 8.00;
  const giorniLavorativi = calcolaGiorniLavorativi();
  const oreContrattualiForecast = oreContrattualiMensili * giorniLavorativi;

  const html = `
    <tr class="totale-row">
      <td><strong>TOTALE MENSILE</strong></td>
      <td>—</td>
      <td>—</td>
      <td><strong>${formattaOre(totaleMensileOre)}</strong></td>
      <td><strong style="color: #fbbf24;">${totaleMensileExtra > 0 ? formattaOre(totaleMensileExtra) : '—'}</strong></td>
      <td>—</td>
    </tr>
    <tr class="previsione-row">
      <td><strong>ORE CONTRATTUALI</strong></td>
      <td>—</td>
      <td>—</td>
      <td><strong style="color: #64748b;">${formattaOre(oreContrattualiForecast)}</strong></td>
      <td>—</td>
      <td>—</td>
    </tr>
  `;

  footer.innerHTML = html;
}

// Calcola giorni lavorativi nel periodo
function calcolaGiorniLavorativi() {
  const dataInizio = document.getElementById('data-inizio')?.value;
  const dataFine = document.getElementById('data-fine')?.value;
  
  if (!dataInizio || !dataFine) return 22; // Default

  const inizio = new Date(dataInizio);
  const fine = new Date(dataFine);
  let giorni = 0;
  
  for (let d = new Date(inizio); d <= fine; d.setDate(d.getDate() + 1)) {
    const giorno = d.getDay();
    if (giorno !== 0 && giorno !== 6) { // Esclude domenica (0) e sabato (6)
      giorni++;
    }
  }
  
  return giorni;
}

// Aggiorna una singola riga dopo modifica
export function aggiornaRigaGiorno(data) {
  const tbody = document.getElementById('storico-body');
  if (!tbody) return;

  // Trova e aggiorna la riga specifica
  const righe = tbody.querySelectorAll('tr');
  righe.forEach(riga => {
    const icona = riga.querySelector('.modifica-icon');
    if (icona && icona.dataset.data === data) {
      // Ricarica i dati per questo giorno e aggiorna la riga
      const nuovaRiga = creaRigaGiornoPerData(data);
      riga.outerHTML = nuovaRiga.html;
    }
  });
}

// Crea riga per una data specifica
function creaRigaGiornoPerData(data) {
  const timbratureGiorno = timbrature.filter(t => {
    const dataRiferimento = normalizzaData(t.giornologico || t.data);
    return dataRiferimento === data;
  });

  const gruppo = {
    data: data,
    entrate: timbratureGiorno.filter(t => t.tipo === 'entrata'),
    uscite: timbratureGiorno.filter(t => t.tipo === 'uscita')
  };

  return creaRigaGiorno(gruppo);
}

// Evidenzia riga durante modifica
export function evidenziaRiga(data, evidenzia = true) {
  const tbody = document.getElementById('storico-body');
  if (!tbody) return;

  const righe = tbody.querySelectorAll('tr');
  righe.forEach(riga => {
    const icona = riga.querySelector('.modifica-icon');
    if (icona && icona.dataset.data === data) {
      if (evidenzia) {
        riga.style.backgroundColor = '#334155';
        riga.style.border = '2px solid #60a5fa';
      } else {
        riga.style.backgroundColor = '';
        riga.style.border = '';
      }
    }
  });
}

// Utility per formattare data italiana
export function formatDataIT(dataISO) {
  if (!dataISO) return '';
  const dataObj = new Date(dataISO + 'T12:00:00');
  return dataObj.toLocaleDateString('it-IT');
}

// Utility per ottenere nome giorno
export function getNomeGiorno(dataISO) {
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const dataObj = new Date(dataISO + 'T12:00:00');
  return giorni[dataObj.getDay()];
}
