
// Utilities per la gestione del calendario
let calendarioAperto = null;

export function initCalendarUtils() {
  // Assicurati che il DOM sia caricato
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCalendar);
  } else {
    setupCalendar();
  }
}

function setupCalendar() {
  // Crea il contenitore del calendario se non esiste
  if (!document.getElementById('calendario-popup')) {
    createCalendarioPopup();
  }
  
  // Aggiungi event listeners alle icone calendario
  const iconeCalendario = document.querySelectorAll('.icona-calendario-campo');
  console.log('Icone calendario trovate:', iconeCalendario.length);
  
  iconeCalendario.forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Icona calendario cliccata');
      const campoId = this.getAttribute('data-campo');
      console.log('Campo ID:', campoId);
      const campo = document.getElementById(campoId);
      if (campo) {
        console.log('Campo trovato, mostro calendario');
        mostraCalendario(campo, this);
      } else {
        console.log('Campo non trovato');
      }
    });
  });

  // Chiudi calendario quando si clicca fuori
  document.addEventListener('click', function(e) {
    const calendarioPopup = document.getElementById('calendario-popup');
    if (calendarioPopup && calendarioAperto && !calendarioPopup.contains(e.target)) {
      // Verifica se il click è su un'icona calendario
      if (!e.target.classList.contains('icona-calendario-campo')) {
        nascondiCalendario();
      }
    }
  });
}

function createCalendarioPopup() {
  const popup = document.createElement('div');
  popup.id = 'calendario-popup';
  popup.className = 'calendario-popup';
  popup.style.cssText = `
    position: fixed;
    background: #1e293b;
    border: 2px solid #334155;
    border-radius: 8px;
    padding: 12px;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
    display: none;
    width: 280px;
    color: white;
    font-family: Arial, sans-serif;
  `;
  
  document.body.appendChild(popup);
  console.log('Popup calendario creato');
}

function mostraCalendario(campoInput, iconaElemento) {
  const popup = document.getElementById('calendario-popup');
  if (!popup) {
    console.log('Popup non trovato');
    return;
  }

  console.log('Mostro calendario per campo:', campoInput.id);
  calendarioAperto = campoInput;
  
  // Ottieni la data corrente del campo o oggi
  let dataCorrente = campoInput.value ? new Date(campoInput.value + 'T12:00:00') : new Date();
  
  // Genera il calendario
  generaCalendario(popup, dataCorrente, campoInput);
  
  // Posiziona il popup vicino all'icona
  const rect = iconaElemento.getBoundingClientRect();
  popup.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
  popup.style.top = (rect.bottom + 5) + 'px';
  
  // Se il popup va fuori schermo in basso, mettilo sopra
  if (rect.bottom + 350 > window.innerHeight) {
    popup.style.top = (rect.top - 350) + 'px';
  }
  
  popup.style.display = 'block';
  console.log('Calendario mostrato');
}

function nascondiCalendario() {
  const popup = document.getElementById('calendario-popup');
  if (popup) {
    popup.style.display = 'none';
    console.log('Calendario nascosto');
  }
  calendarioAperto = null;
}

function generaCalendario(container, dataCorrente, campoInput) {
  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  
  const giorni = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  
  const anno = dataCorrente.getFullYear();
  const mese = dataCorrente.getMonth();
  
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <button type="button" class="btn-nav-calendario" data-azione="prev-mese" style="
        background: #475569; color: white; border: none; 
        width: 30px; height: 30px; border-radius: 4px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      ">‹</button>
      <div style="font-weight: bold; font-size: 14px;">${mesi[mese]} ${anno}</div>
      <button type="button" class="btn-nav-calendario" data-azione="next-mese" style="
        background: #475569; color: white; border: none; 
        width: 30px; height: 30px; border-radius: 4px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      ">›</button>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 8px;">
  `;
  
  // Intestazioni giorni
  giorni.forEach(giorno => {
    html += `<div class="giorno-settimana" style="
      text-align: center; font-size: 11px; color: #94a3b8; 
      font-weight: 600; padding: 4px 0;
    ">${giorno}</div>`;
  });
  
  html += `</div><div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;">`;
  
  // Primo giorno del mese
  const primoGiorno = new Date(anno, mese, 1);
  const ultimoGiorno = new Date(anno, mese + 1, 0);
  const giorniDelMese = ultimoGiorno.getDate();
  const giornoSettimanaPrimoGiorno = primoGiorno.getDay();
  
  // Giorni del mese precedente per riempire
  const mesePrec = mese === 0 ? 11 : mese - 1;
  const annoPrec = mese === 0 ? anno - 1 : anno;
  const ultimoGiornoMesePrec = new Date(annoPrec, mesePrec + 1, 0).getDate();
  
  for (let i = giornoSettimanaPrimoGiorno - 1; i >= 0; i--) {
    const giorno = ultimoGiornoMesePrec - i;
    html += `<div class="giorno-calendario altro-mese" style="
      width: 32px; height: 28px; display: flex; align-items: center; 
      justify-content: center; font-size: 12px; color: #64748b; 
      cursor: pointer; border-radius: 4px; transition: all 0.2s;
    " data-giorno="${giorno}" data-mese="${mesePrec}" data-anno="${annoPrec}">${giorno}</div>`;
  }
  
  // Giorni del mese corrente
  const oggi = new Date();
  const dataSelezionata = campoInput.value ? new Date(campoInput.value + 'T12:00:00') : null;
  
  for (let giorno = 1; giorno <= giorniDelMese; giorno++) {
    const dataGiorno = new Date(anno, mese, giorno);
    let classi = 'giorno-calendario';
    let stili = `
      width: 32px; height: 28px; display: flex; align-items: center; 
      justify-content: center; font-size: 12px; color: white; 
      cursor: pointer; border-radius: 4px; transition: all 0.2s;
    `;
    
    // Evidenzia oggi
    if (dataGiorno.toDateString() === oggi.toDateString()) {
      classi += ' oggi';
      stili += ' background-color: #dc2626; font-weight: bold;';
    }
    
    // Evidenzia data selezionata
    if (dataSelezionata && dataGiorno.toDateString() === dataSelezionata.toDateString()) {
      classi += ' selezionato';
      stili += ' background-color: #1e90ff; font-weight: bold;';
    }
    
    html += `<div class="${classi}" style="${stili}" 
             data-giorno="${giorno}" data-mese="${mese}" data-anno="${anno}"
             onmouseover="this.style.backgroundColor = this.classList.contains('oggi') || this.classList.contains('selezionato') ? this.style.backgroundColor : '#334155'"
             onmouseout="this.style.backgroundColor = this.classList.contains('oggi') ? '#dc2626' : this.classList.contains('selezionato') ? '#1e90ff' : 'transparent'"
             >${giorno}</div>`;
  }
  
  // Giorni del mese successivo per riempire
  const celleRimanenti = 42 - (giornoSettimanaPrimoGiorno + giorniDelMese);
  const meseSucc = mese === 11 ? 0 : mese + 1;
  const annoSucc = mese === 11 ? anno + 1 : anno;
  
  for (let giorno = 1; giorno <= celleRimanenti; giorno++) {
    html += `<div class="giorno-calendario altro-mese" style="
      width: 32px; height: 28px; display: flex; align-items: center; 
      justify-content: center; font-size: 12px; color: #64748b; 
      cursor: pointer; border-radius: 4px; transition: all 0.2s;
    " data-giorno="${giorno}" data-mese="${meseSucc}" data-anno="${annoSucc}">${giorno}</div>`;
  }
  
  html += `</div>
    <div style="display: flex; justify-content: space-between; margin-top: 12px; gap: 8px;">
      <button type="button" class="btn-oggi" style="
        border: none; padding: 6px 12px; border-radius: 4px; 
        font-size: 12px; cursor: pointer; background: #16a34a; color: white;
      ">Oggi</button>
      <button type="button" class="btn-chiudi-calendario" style="
        border: none; padding: 6px 12px; border-radius: 4px; 
        font-size: 12px; cursor: pointer; background: #64748b; color: white;
      ">Chiudi</button>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Event listeners
  container.addEventListener('click', function(e) {
    e.stopPropagation();
    
    if (e.target.classList.contains('giorno-calendario')) {
      const giorno = e.target.dataset.giorno;
      const mese = e.target.dataset.mese;
      const anno = e.target.dataset.anno;
      
      const dataSelezionata = new Date(parseInt(anno), parseInt(mese), parseInt(giorno), 12, 0, 0);
      const dataISO = dataSelezionata.toISOString().split('T')[0];
      
      campoInput.value = dataISO;
      campoInput.dispatchEvent(new Event('change'));
      nascondiCalendario();
    }
    
    else if (e.target.classList.contains('btn-nav-calendario')) {
      const azione = e.target.dataset.azione;
      let nuovaData = new Date(dataCorrente);
      
      if (azione === 'prev-mese') {
        nuovaData.setMonth(nuovaData.getMonth() - 1);
      } else if (azione === 'next-mese') {
        nuovaData.setMonth(nuovaData.getMonth() + 1);
      }
      
      generaCalendario(container, nuovaData, campoInput);
    }
    
    else if (e.target.classList.contains('btn-oggi')) {
      const oggi = new Date();
      const dataISO = oggi.toISOString().split('T')[0];
      campoInput.value = dataISO;
      campoInput.dispatchEvent(new Event('change'));
      nascondiCalendario();
    }
    
    else if (e.target.classList.contains('btn-chiudi-calendario')) {
      nascondiCalendario();
    }
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
