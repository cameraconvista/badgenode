
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
// Rendering dell'interfaccia delle timbrature
import { formatDataIT } from './timbrature-data.js';

// Renderizza la tabella delle timbrature
export function renderTabellaTimbrature(timbratureElaborate, containerBody) {
  if (!containerBody) {
    console.error("Container body non trovato");
    return;
  }

  containerBody.innerHTML = '';

  if (!timbratureElaborate || timbratureElaborate.length === 0) {
    containerBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">
          Nessuna timbratura trovata per il periodo selezionato
        </td>
      </tr>
    `;
    return;
  }

  timbratureElaborate.forEach(giorno => {
    const riga = document.createElement('tr');
    riga.className = 'riga-timbratura';
    
    // Determina se la riga è modificabile (ha almeno una timbratura)
    const haTimbrature = giorno.entrata || giorno.uscita;
    const classeModifica = haTimbrature ? 'btn-modifica-attivo' : 'btn-modifica-disabilitato';
    
    riga.innerHTML = `
      <td class="cella-data">${formatDataIT(giorno.data)}</td>
      <td class="cella-ora">${giorno.entrata ? giorno.entrata.substring(0, 5) : '—'}</td>
      <td class="cella-ora">${giorno.uscita ? giorno.uscita.substring(0, 5) : '—'}</td>
      <td class="cella-ore">${giorno.oreTotali.formatted}</td>
      <td class="cella-extra">${giorno.oreExtra.formatted}</td>
      <td class="cella-modifica">
        <button class="btn-modifica ${classeModifica}" 
                data-data="${giorno.data}"
                data-entrata="${giorno.entrata || ''}"
                data-uscita="${giorno.uscita || ''}"
                data-id-entrata="${giorno.id_entrata || ''}"
                data-id-uscita="${giorno.id_uscita || ''}"
                ${!haTimbrature ? 'disabled' : ''}
                title="${haTimbrature ? 'Modifica timbrature' : 'Nessuna timbratura da modificare'}">
          ✏️
        </button>
      </td>
    `;

    containerBody.appendChild(riga);
  });
}

// Renderizza il footer con i totali
export function renderFooterTotali(totaliPeriodo, containerFooter) {
  if (!containerFooter) {
    console.error("Container footer non trovato");
    return;
  }

  containerFooter.innerHTML = `
    <tr class="riga-totale">
      <td class="cella-totale-label"><strong>TOTALE PERIODO</strong></td>
      <td class="cella-totale-vuota">—</td>
      <td class="cella-totale-vuota">—</td>
      <td class="cella-totale-ore"><strong>${totaliPeriodo.totale.formatted}</strong></td>
      <td class="cella-totale-extra"><strong>${totaliPeriodo.extra.formatted}</strong></td>
      <td class="cella-totale-vuota">—</td>
    </tr>
  `;
}

// Aggiorna l'intestazione con nome utente
export function aggiornaIntestazione(utente, containerIntestazione) {
  if (containerIntestazione && utente) {
    containerIntestazione.textContent = `${utente.nome} ${utente.cognome}`;
  }
}

// Mostra stato di caricamento
export function mostraCaricamento(container, messaggio = "Caricamento in corso...") {
  if (!container) return;
  
  container.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 20px;">
        <div style="display: inline-flex; align-items: center; gap: 10px; color: #64748b;">
          <div style="width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          ${messaggio}
        </div>
      </td>
    </tr>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

// Mostra messaggio di errore
export function mostraErrore(container, messaggio = "Si è verificato un errore") {
  if (!container) return;
  
  container.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 20px;">
        <div style="color: #dc2626; display: inline-flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">⚠️</span>
          ${messaggio}
        </div>
      </td>
    </tr>
  `;
}

// Popola il modale di modifica
export function popolaModaleModifica(data, entrata, uscita, idEntrata, idUscita) {
  const modaleData = document.getElementById('modale-data');
  const modaleEntrata = document.getElementById('modale-entrata');
  const modaleUscita = document.getElementById('modale-uscita');
  const btnElimina = document.getElementById('btnElimina');

  if (modaleData) modaleData.value = data;
  if (modaleEntrata) modaleEntrata.value = entrata ? entrata.substring(0, 5) : '';
  if (modaleUscita) modaleUscita.value = uscita ? uscita.substring(0, 5) : '';

  // Abilita/disabilita il pulsante elimina in base alla presenza di timbrature
  if (btnElimina) {
    const haTimbrature = entrata || uscita;
    btnElimina.disabled = !haTimbrature;
    btnElimina.style.opacity = haTimbrature ? '1' : '0.5';
    btnElimina.style.cursor = haTimbrature ? 'pointer' : 'not-allowed';
  }

  // Memorizza gli ID per le operazioni successive
  if (modaleData) {
    modaleData.dataset.idEntrata = idEntrata || '';
    modaleData.dataset.idUscita = idUscita || '';
  }
}

// Mostra/nasconde il modale
export function mostraModale(modale) {
  if (modale) {
    modale.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

export function nascondiModale(modale) {
  if (modale) {
    modale.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Ottieni valori dal modale
export function ottieniValoriModale() {
  const modaleData = document.getElementById('modale-data');
  const modaleEntrata = document.getElementById('modale-entrata');
  const modaleUscita = document.getElementById('modale-uscita');

  return {
    data: modaleData ? modaleData.value : '',
    entrata: modaleEntrata ? modaleEntrata.value : '',
    uscita: modaleUscita ? modaleUscita.value : '',
    idEntrata: modaleData ? modaleData.dataset.idEntrata : '',
    idUscita: modaleData ? modaleData.dataset.idUscita : ''
  };
}

// Mostra notifica temporanea
export function mostraNotifica(messaggio, tipo = 'success', durata = 3000) {
  // Rimuovi notifiche esistenti
  const notificheEsistenti = document.querySelectorAll('.notifica-temporanea');
  notificheEsistenti.forEach(notifica => notifica.remove());

  const notifica = document.createElement('div');
  notifica.className = 'notifica-temporanea';
  
  const colori = {
    success: { bg: '#10b981', text: '#ffffff' },
    error: { bg: '#dc2626', text: '#ffffff' },
    warning: { bg: '#f59e0b', text: '#ffffff' },
    info: { bg: '#3b82f6', text: '#ffffff' }
  };

  const coloreTema = colori[tipo] || colori.info;

  notifica.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${coloreTema.bg};
    color: ${coloreTema.text};
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;

  notifica.textContent = messaggio;

  // Aggiungi animazione CSS
  if (!document.querySelector('#notifica-styles')) {
    const style = document.createElement('style');
    style.id = 'notifica-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notifica);

  // Rimuovi automaticamente dopo la durata specificata
  setTimeout(() => {
    notifica.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notifica.parentNode) {
        notifica.remove();
      }
    }, 300);
  }, durata);
}

// Aggiorna il range di date nei filtri
export function aggiornaRangeFiltri(dataInizio, dataFine) {
  const campoInizio = document.getElementById('data-inizio');
  const campoFine = document.getElementById('data-fine');

  if (campoInizio) campoInizio.value = dataInizio;
  if (campoFine) campoFine.value = dataFine;
}

// Evidenzia filtro attivo
export function evidenziaFiltroAttivo(filtroSelezionato) {
  const selectFiltro = document.getElementById('filtro-mese');
  if (selectFiltro) {
    selectFiltro.value = filtroSelezionato;
  }
}

// Genera dati per esportazione
export function generaDatiEsportazione(dipendente, dataInizio, dataFine) {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine).toLocaleDateString('it-IT');

  const footerRow = document.querySelector('#totale-footer tr');
  let totaleMensile = '—';

  if (footerRow) {
    const cells = footerRow.querySelectorAll('td');
    if (cells.length >= 4) {
      totaleMensile = cells[3].textContent.trim();
    }
  }

  const righeTabella = document.querySelectorAll('#storico-body tr');
  const datiTabella = [];

  righeTabella.forEach(riga => {
    const cells = riga.querySelectorAll('td');
    if (cells.length >= 4) {
      const data = cells[0].textContent.trim();
      const entrata = cells[1].textContent.trim();
      const uscita = cells[2].textContent.trim();
      const ore = cells[3].textContent.trim();

      if (entrata !== '—' || uscita !== '—') {
        datiTabella.push({ data, entrata, uscita, ore });
      }
    }
  });

  return { 
    nomeCompleto, 
    dataInizioFormatted, 
    dataFineFormatted, 
    totaleMensile, 
    datiTabella,
    pin: dipendente ? dipendente.pin : ''
  };
}

// Validazione campi modale
export function validaCampiModale(entrata, uscita) {
  const errori = [];

  // Validazione formato orario
  const regexOrario = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (entrata && !regexOrario.test(entrata)) {
    errori.push("Formato entrata non valido (HH:MM)");
  }

  if (uscita && !regexOrario.test(uscita)) {
    errori.push("Formato uscita non valido (HH:MM)");
  }

  // Almeno un campo deve essere compilato
  if (!entrata && !uscita) {
    errori.push("Inserisci almeno entrata o uscita");
  }

  return errori;
}

// Formatta messaggio di condivisione WhatsApp
export function generaMessaggioWhatsApp(dipendente, dataInizio, dataFine, totaleMensile) {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine).toLocaleDateString('it-IT');

  const messaggio = `🕐 *RIEPILOGO TIMBRATURE*

👤 *Dipendente:* ${nomeCompleto}
📅 *Periodo:* dal ${dataInizioFormatted} al ${dataFineFormatted}
⏱️ *Ore totali:* ${totaleMensile}

_Generato da BADGEBOX il ${new Date().toLocaleDateString('it-IT')}_`;

  return encodeURIComponent(messaggio);
}
