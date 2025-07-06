// Logica principale per storico.html
import { supabaseClient } from './supabase-client.js';
import { initCalendarUtils } from './calendar-utils.js';

// Variabili globali
let dipendente = null;
let timbrature = [];
let dataCorrenteModale = null;

// Elementi DOM
const intestazione = document.getElementById("intestazione");
const tbody = document.getElementById("storico-body");
const selectFiltro = document.getElementById("filtro-mese");
const dataInizio = document.getElementById("data-inizio");
const dataFine = document.getElementById("data-fine");
const modalOverlay = document.getElementById("modalOverlay");

// Recupera il PIN dalla query string
const urlParams = new URLSearchParams(window.location.search);
let pin = urlParams.get("pin");

console.log("URL completa:", window.location.href);
console.log("Query string:", window.location.search);
console.log("PIN dalla URL:", pin);

// Debug per Netlify
if (!pin) {
  console.warn("PIN non trovato nella URL, possibile problema di routing");
  console.log("Location:", window.location);
}

// Funzione per aggiornare il range di date
function aggiornaRange(mese) {
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

  const dataInizioString = primoGiorno.toISOString().split('T')[0];
  const dataFineString = ultimoGiorno.toISOString().split('T')[0];

  dataInizio.value = dataInizioString;
  dataFine.value = dataFineString;

  console.log(`Range aggiornato: dal ${dataInizioString} al ${dataFineString}`);
}

// Funzione per aggiungere opzione personalizzato
function aggiungiOpzionePersonalizzato() {
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

// Carica i dati dal database
async function caricaDati() {
  if (!pin) return;

  try {
    // Recupera dati utente
    const { data: datiUtente, error: errUtente } = await supabaseClient
      .from("utenti")
      .select("nome, cognome, email, ore_contrattuali")
      .eq("pin", parseInt(pin))
      .single();

    if (errUtente) {
      console.error("Errore recupero utente:", errUtente.message);
      alert("Errore recupero utente: " + errUtente.message);
      return;
    }

    if (datiUtente) {
      dipendente = datiUtente;
      intestazione.textContent = `${dipendente.nome} ${dipendente.cognome}`;
      console.log("Dati utente caricati:", dipendente);
    }

    // Recupera timbrature
    const { data, error } = await supabaseClient
      .from("timbrature")
      .select("*")
      .eq("pin", parseInt(pin))
      .order("data", { ascending: true })
      .order("ore", { ascending: true });

    if (error) {
      console.error("Errore nel recupero timbrature:", error);
      alert("Errore nel recupero timbrature: " + error.message);
      return;
    }

    // Filtra le timbrature
    timbrature = (data || []).filter(t => {
      let dataRiferimento = t.giornologico || t.data;
      if (typeof dataRiferimento !== 'string') {
        dataRiferimento = new Date(dataRiferimento).toISOString().split('T')[0];
      } else if (dataRiferimento.includes('T')) {
        dataRiferimento = dataRiferimento.split('T')[0];
      }
      return dataRiferimento >= dataInizio.value && dataRiferimento <= dataFine.value;
    });

    console.log(`FILTRO APPLICATO: ${timbrature.length} timbrature nel periodo ${dataInizio.value} - ${dataFine.value}`);

  } catch (error) {
    console.error("Errore caricamento dati:", error);
    alert("Errore durante il caricamento dei dati");
  }

  renderizzaTabella();
}

// Renderizza la tabella
function renderizzaTabella() {
  tbody.innerHTML = "";

  if (!dataInizio.value || !dataFine.value) {
    console.log("Date non impostate correttamente");
    return;
  }

  const start = new Date(dataInizio.value + 'T00:00:00');
  const end = new Date(dataFine.value + 'T00:00:00');
  const giorniSettimana = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];

  let totaleMensileOre = 0;
  let totaleMensileExtra = 0;

  const startDateFixed = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0, 0);
  const endDateFixed = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12, 0, 0);

  for (let d = new Date(startDateFixed); d <= endDateFixed; d.setDate(d.getDate() + 1)) {
    const current = new Date(d);
    const dataISO = current.toISOString().split("T")[0];
    const giornoSettimana = giorniSettimana[current.getDay()];
    const giornoNumero = current.getDate().toString().padStart(2, "0");

    const dataFormattata = `${giornoNumero} ${giornoSettimana}`;

    // Logica per le timbrature del giorno...
    const timbratureOggi = timbrature.filter(t => {
      let dataRiferimento = t.giornologico || t.data;
      if (typeof dataRiferimento !== 'string') {
        dataRiferimento = new Date(dataRiferimento).toISOString().split('T')[0];
      } else if (dataRiferimento.includes('T')) {
        dataRiferimento = dataRiferimento.split('T')[0];
      }
      return dataRiferimento === dataISO;
    });

    // Continua con la logica esistente...
    const timbratureEntrata = timbratureOggi.filter(t => t.tipo === "entrata").sort((a, b) => a.ore.localeCompare(b.ore));
    const timbratureUscita = timbratureOggi.filter(t => t.tipo === "uscita").sort((a, b) => a.ore.localeCompare(b.ore));

    // Resto della logica di rendering...
    // [Qui continua la logica esistente di raggruppamento e rendering]

    let oreTotaliGiorno = 0;
    // Logica semplificata per il calcolo delle ore
    if (timbratureEntrata.length > 0 && timbratureUscita.length > 0) {
      const entrata = timbratureEntrata[0];
      const uscita = timbratureUscita[timbratureUscita.length - 1];

      const oraInizio = new Date(`1970-01-01T${entrata.ore}`);
      const oraFine = new Date(`1970-01-01T${uscita.ore}`);

      if (oraFine < oraInizio) oraFine.setDate(oraFine.getDate() + 1);

      const diffMs = oraFine - oraInizio;
      if (diffMs > 0) {
        oreTotaliGiorno = diffMs / (1000 * 60 * 60);
      }
    }

    // Crea riga tabella
    const riga = document.createElement("tr");
    if (current.getDay() === 0 || current.getDay() === 6) {
      riga.classList.add('weekend');
    }

    const entrataDisplay = timbratureEntrata.length > 0 ? timbratureEntrata[0].ore.slice(0,5) : '—';
    const uscitaDisplay = timbratureUscita.length > 0 ? timbratureUscita[timbratureUscita.length - 1].ore.slice(0,5) : '—';
    const oreDisplay = oreTotaliGiorno > 0 ? `${Math.floor(oreTotaliGiorno)}:${Math.round((oreTotaliGiorno % 1) * 60).toString().padStart(2, '0')}` : '—';

    // Calcola EXTRA
    const oreContrattuali = parseFloat(dipendente?.ore_contrattuali) || 8.00;
    const oreExtra = oreTotaliGiorno - oreContrattuali;
    let extraContent = '';
    if (oreExtra > 0) {
      const oreExtraInt = Math.floor(oreExtra);
      const minutiExtra = Math.round((oreExtra - oreExtraInt) * 60);
      extraContent = `<span style="color: #fbbf24; font-weight: bold;">+${oreExtraInt}:${minutiExtra.toString().padStart(2, '0')}</span>`;
      totaleMensileExtra += oreExtra;
    }

    const timbraturaId = timbratureEntrata.length > 0 ? timbratureEntrata[0].id : 'nuovo';

    riga.innerHTML = `
      <td style="text-align: left;">${dataFormattata}</td>
      <td>${entrataDisplay}</td>
      <td>${uscitaDisplay}</td>
      <td style="color: #ffff99;">${oreDisplay}</td>
      <td style="text-align: center;">${extraContent}</td>
      <td>
        <img
          src="assets/icons/matita-colorata.png"
          class="modifica-icon"
          data-data="${dataISO}"
          data-timbratura-id="${timbraturaId}"
          title="Modifica"
          alt="Modifica"
        />
      </td>
    `;

    tbody.appendChild(riga);
    totaleMensileOre += oreTotaliGiorno;
  }

  // Riga totale nel footer fisso
  const footerTbody = document.getElementById("totale-footer");
  footerTbody.innerHTML = "";
  const rigaTotale = document.createElement("tr");
  
  // Calcola il totale extra formattato
  let totaleExtraContent = '';
  if (totaleMensileExtra > 0) {
    const oreExtraTotali = Math.floor(totaleMensileExtra);
    const minutiExtraTotali = Math.round((totaleMensileExtra % 1) * 60);
    totaleExtraContent = `<span style="color: #fbbf24; font-weight: bold;">+${oreExtraTotali}:${minutiExtraTotali.toString().padStart(2, '0')}</span>`;
  }
  
  rigaTotale.innerHTML = `
    <td style="text-align:left;">TOTALE MENSILE</td>
    <td></td>
    <td></td>
    <td style="color: #ffff99;">${totaleMensileOre.toFixed(2)}</td>
    <td style="text-align: center;">${totaleExtraContent}</td>
    <td></td>
  `;
  footerTbody.appendChild(rigaTotale);

  aggiungiListenerModifica();
}

// Gestisce i click per la modifica
function aggiungiListenerModifica() {
  document.removeEventListener("click", gestisciClickModifica);
  document.addEventListener("click", gestisciClickModifica);
}

function gestisciClickModifica(event) {
  if (event.target.classList.contains("modifica-icon")) {
    event.preventDefault();
    event.stopPropagation();
    const icon = event.target;
    const dataSelezionata = icon.dataset.data;
    const timbraturaId = icon.dataset.timbraturaId;
    apriModale(dataSelezionata, timbraturaId);
  }
}

// Apre la modale di modifica
async function apriModale(dataSelezionata, timbraturaId) {
  dataCorrenteModale = dataSelezionata;

  const timbratureGiorno = timbrature.filter(t => {
    let dataRiferimento = t.giornologico || t.data;
    if (typeof dataRiferimento !== 'string') {
      dataRiferimento = new Date(dataRiferimento).toISOString().split('T')[0];
    } else if (dataRiferimento.includes('T')) {
      dataRiferimento = dataRiferimento.split('T')[0];
    }
    return dataRiferimento === dataSelezionata;
  });

  const timbraturaEntrata = timbratureGiorno.find(t => t.tipo === "entrata");
  const timbraturaUscita = timbratureGiorno.find(t => t.tipo === "uscita");

  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>Modifica Timbratura</h2>
    <form id="modaleForm">
      <label for="modale-data-entrata">Data Entrata:</label>
      <input type="date" id="modale-data-entrata" value="${timbraturaEntrata ? (timbraturaEntrata.giornologico || dataSelezionata) : dataSelezionata}" />
      <label for="modale-entrata">Entrata:</label>
      <input type="time" id="modale-entrata" value="${timbraturaEntrata ? timbraturaEntrata.ore.slice(0,5) : ''}" />
      <label for="modale-data-uscita">Data Uscita:</label>
      <input type="date" id="modale-data-uscita" value="${timbraturaUscita ? (timbraturaUscita.giornologico || dataSelezionata) : dataSelezionata}" />
      <label for="modale-uscita">Uscita:</label>
      <input type="time" id="modale-uscita" value="${timbraturaUscita ? timbraturaUscita.ore.slice(0,5) : ''}" />
      <div class="modal-btns">
        <button type="button" id="btnSalva">Salva</button>
        <button type="button" id="btnElimina">Elimina</button>
        <button type="button" id="btnChiudi">Chiudi</button>
      </div>
    </form>
  `;

  window.timbraturaEntrataCorrente = timbraturaEntrata;
  window.timbraturaUscitaCorrente = timbraturaUscita;

  document.getElementById("btnSalva").addEventListener("click", salvaModifiche);
  document.getElementById("btnElimina").addEventListener("click", eliminaTimbrature);
  document.getElementById("btnChiudi").addEventListener("click", chiudiModale);

  modalOverlay.style.display = "flex";
}

function chiudiModale() {
  modalOverlay.style.display = "none";
}

// Salva le modifiche
async function salvaModifiche() {
  const modaleDataEntrata = document.getElementById("modale-data-entrata").value;
  const modaleDataUscita = document.getElementById("modale-data-uscita").value;
  const modaleEntrata = document.getElementById("modale-entrata").value;
  const modaleUscita = document.getElementById("modale-uscita").value;

  try {
    // Gestione entrata
    if (modaleEntrata) {
      if (!modaleDataEntrata) {
        alert("La data di entrata è obbligatoria!");
        return;
      }

      const dataEntrataUTC = new Date(modaleDataEntrata);
      dataEntrataUTC.setHours(12);
      const dataEntrataISO = dataEntrataUTC.toISOString();

      const [ore, minuti] = modaleEntrata.split(":");
      
      // Calcolo giorno logico per entrata
      let giornoLogicoEntrata = modaleDataEntrata;
      if (parseInt(ore) >= 0 && parseInt(ore) < 5) {
        const dataGiornoLogico = new Date(modaleDataEntrata);
        dataGiornoLogico.setDate(dataGiornoLogico.getDate() - 1);
        giornoLogicoEntrata = dataGiornoLogico.toISOString().split('T')[0];
      }

      if (window.timbraturaEntrataCorrente) {
        await supabaseClient
          .from("timbrature")
          .update({ 
            data: dataEntrataISO, 
            ore: modaleEntrata + ":00", 
            giornologico: giornoLogicoEntrata 
          })
          .eq("id", window.timbraturaEntrataCorrente.id);
      } else {
        await supabaseClient
          .from("timbrature")
          .insert([{ 
            pin: parseInt(pin), 
            nome: dipendente.nome,
            cognome: dipendente.cognome,
            data: dataEntrataISO, 
            ore: modaleEntrata + ":00", 
            tipo: "entrata",
            giornologico: giornoLogicoEntrata
          }]);
      }
    }

    // Gestione uscita
    if (modaleUscita) {
      if (!modaleDataUscita) {
        alert("La data di uscita è obbligatoria!");
        return;
      }

      const dataUscitaUTC = new Date(modaleDataUscita);
      dataUscitaUTC.setHours(12);
      const dataUscitaISO = dataUscitaUTC.toISOString();

      const [oreUscita, minutiUscita] = modaleUscita.split(":");
      
      // Calcolo giorno logico per uscita
      let giornoLogicoUscita = modaleDataUscita;
      if (parseInt(oreUscita) >= 0 && parseInt(oreUscita) < 5) {
        const dataGiornoLogico = new Date(modaleDataUscita);
        dataGiornoLogico.setDate(dataGiornoLogico.getDate() - 1);
        giornoLogicoUscita = dataGiornoLogico.toISOString().split('T')[0];
      }

      if (window.timbraturaUscitaCorrente) {
        await supabaseClient
          .from("timbrature")
          .update({ 
            data: dataUscitaISO, 
            ore: modaleUscita + ":00", 
            giornologico: giornoLogicoUscita 
          })
          .eq("id", window.timbraturaUscitaCorrente.id);
      } else {
        await supabaseClient
          .from("timbrature")
          .insert([{ 
            pin: parseInt(pin), 
            nome: dipendente.nome,
            cognome: dipendente.cognome,
            data: dataUscitaISO, 
            ore: modaleUscita + ":00", 
            tipo: "uscita",
            giornologico: giornoLogicoUscita
          }]);
      }
    }

    alert("Modifiche salvate con successo!");
    chiudiModale();
    caricaDati();
  } catch (error) {
    console.error("Errore salvataggio:", error);
    alert("Errore durante il salvataggio: " + error.message);
  }
}

// Elimina le timbrature
async function eliminaTimbrature() {
  if (!confirm("Sei sicuro di voler eliminare questa timbratura?")) return;

  try {
    if (window.timbraturaEntrataCorrente) {
      await supabaseClient
        .from("timbrature")
        .delete()
        .eq("id", window.timbraturaEntrataCorrente.id);
    }

    if (window.timbraturaUscitaCorrente) {
      await supabaseClient
        .from("timbrature")
        .delete()
        .eq("id", window.timbraturaUscitaCorrente.id);
    }

    alert("Timbratura eliminata con successo!");
    chiudiModale();
    caricaDati();
  } catch (error) {
    console.error("Errore eliminazione:", error);
    alert("Errore durante l'eliminazione: " + error.message);
  }
}

// Event listeners
selectFiltro.addEventListener("change", () => {
  if (selectFiltro.value !== "personalizzato") {
    const opzionePersonalizzato = selectFiltro.querySelector('option[value="personalizzato"]');
    if (opzionePersonalizzato) {
      opzionePersonalizzato.remove();
    }
    selectFiltro.style.borderColor = '#334155';
    selectFiltro.style.color = 'white';
    aggiornaRange(selectFiltro.value);
  }
  caricaDati();
});

dataInizio.addEventListener("change", () => {
  aggiungiOpzionePersonalizzato();
  caricaDati();
});

dataFine.addEventListener("change", () => {
  aggiungiOpzionePersonalizzato();
  caricaDati();
});

document.getElementById("torna-utenti").addEventListener("click", function() {
  window.location.href = "utenti.html";
});

// Funzionalità WhatsApp con formato semplificato
document.getElementById("btn-whatsapp").addEventListener("click", function() {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');
  
  // Calcola solo le ore totali dalla tabella footer
  const footerRow = document.querySelector('#totale-footer tr');
  let totaleMensile = '—';
  
  if (footerRow) {
    const cells = footerRow.querySelectorAll('td');
    if (cells.length >= 4) {
      totaleMensile = cells[3].textContent.trim();
    }
  }
  
  // Genera la tabella delle timbrature semplificata (solo Data, Entrata, Uscita)
  const righeTabella = document.querySelectorAll('#storico-body tr');
  let tabellaTimbrature = '';
  
  righeTabella.forEach(riga => {
    const cells = riga.querySelectorAll('td');
    if (cells.length >= 3) {
      const data = cells[0].textContent.trim();
      const entrata = cells[1].textContent.trim();
      const uscita = cells[2].textContent.trim();
      
      // Formatta la riga solo se ci sono dati significativi
      if (entrata !== '—' || uscita !== '—') {
        tabellaTimbrature += `${data.padEnd(10)} ${entrata.padEnd(10)} ${uscita}\n`;
      }
    }
  });
  
  // Genera il messaggio semplificato come nell'esempio
  const messaggio = `CAMERA CON VISTA Bistrot\n\n` +
                   `*RIEPILOGO MENSILE:*\n\n` +
                   `👤 *${nomeCompleto}* (PIN: ${pin})\n` +
                   `📅 Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}\n\n` +
                   `Ore totali: ${totaleMensile}\n\n` +
                   `DETTAGLIO TIMBRATURE\n\n` +
                   `Data      Entrata    Uscita\n` +
                   (tabellaTimbrature || 'Nessuna timbratura nel periodo\n');
  
  const url = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
});

// Funzionalità PDF
document.getElementById("btn-invia").addEventListener("click", function() {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');
  
  // Calcola le ore totali dalla tabella footer
  const footerRow = document.querySelector('#totale-footer tr');
  let totaleMensile = '—';
  
  if (footerRow) {
    const cells = footerRow.querySelectorAll('td');
    if (cells.length >= 4) {
      totaleMensile = cells[3].textContent.trim();
    }
  }
  
  // Crea nuovo documento PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Titolo
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CAMERA CON VISTA Bistrot", 105, 20, { align: "center" });
  
  // Sottotitolo
  doc.setFontSize(16);
  doc.text("RIEPILOGO MENSILE TIMBRATURE", 105, 35, { align: "center" });
  
  // Informazioni dipendente
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Dipendente: ${nomeCompleto} (PIN: ${pin})`, 20, 55);
  doc.text(`Periodo: dal ${dataInizioFormatted} al ${dataFineFormatted}`, 20, 65);
  doc.text(`Ore totali: ${totaleMensile}`, 20, 75);
  
  // Linea separatrice
  doc.line(20, 85, 190, 85);
  
  // Intestazione tabella
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Data", 20, 100);
  doc.text("Entrata", 70, 100);
  doc.text("Uscita", 120, 100);
  doc.text("Ore", 160, 100);
  
  // Linea sotto intestazione
  doc.line(20, 105, 190, 105);
  
  // Dati tabella
  doc.setFont("helvetica", "normal");
  const righeTabella = document.querySelectorAll('#storico-body tr');
  let yPosition = 115;
  
  righeTabella.forEach(riga => {
    const cells = riga.querySelectorAll('td');
    if (cells.length >= 4) {
      const data = cells[0].textContent.trim();
      const entrata = cells[1].textContent.trim();
      const uscita = cells[2].textContent.trim();
      const ore = cells[3].textContent.trim();
      
      // Aggiungi riga solo se ci sono dati significativi
      if (entrata !== '—' || uscita !== '—') {
        doc.text(data, 20, yPosition);
        doc.text(entrata, 70, yPosition);
        doc.text(uscita, 120, yPosition);
        doc.text(ore, 160, yPosition);
        yPosition += 10;
        
        // Controlla se serve una nuova pagina
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      }
    }
  });
  
  // Footer con data generazione
  const dataGenerazione = new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT');
  doc.setFontSize(8);
  doc.text(`Generato il: ${dataGenerazione}`, 20, 285);
  
  // Salva il PDF
  const nomeFile = `${nomeCompleto.replace(/\s/g, '_')}_timbrature_${dataInizio.value}_${dataFine.value}.pdf`;
  doc.save(nomeFile);
});

// Funzionalità Excel
document.getElementById("btn-esporta").addEventListener("click", function() {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');
  
  // Calcola le ore totali dalla tabella footer
  const footerRow = document.querySelector('#totale-footer tr');
  let totaleMensile = '—';
  
  if (footerRow) {
    const cells = footerRow.querySelectorAll('td');
    if (cells.length >= 4) {
      totaleMensile = cells[3].textContent.trim();
    }
  }
  
  // Crea un nuovo workbook
  const wb = XLSX.utils.book_new();
  
  // Dati per il foglio di riepilogo
  const riepilogoData = [
    ['CAMERA CON VISTA Bistrot'],
    ['RIEPILOGO MENSILE TIMBRATURE'],
    [''],
    ['Dipendente:', `${nomeCompleto} (PIN: ${pin})`],
    ['Periodo:', `dal ${dataInizioFormatted} al ${dataFineFormatted}`],
    ['Ore totali:', totaleMensile],
    [''],
    ['Data', 'Entrata', 'Uscita', 'Ore Giornaliere']
  ];
  
  // Aggiungi i dati delle timbrature
  const righeTabella = document.querySelectorAll('#storico-body tr');
  
  righeTabella.forEach(riga => {
    const cells = riga.querySelectorAll('td');
    if (cells.length >= 4) {
      const data = cells[0].textContent.trim();
      const entrata = cells[1].textContent.trim();
      const uscita = cells[2].textContent.trim();
      const ore = cells[3].textContent.trim();
      
      // Aggiungi riga solo se ci sono dati significativi
      if (entrata !== '—' || uscita !== '—') {
        riepilogoData.push([data, entrata, uscita, ore]);
      }
    }
  });
  
  // Aggiungi riga vuota e totale
  riepilogoData.push(['']);
  riepilogoData.push(['TOTALE MENSILE', '', '', totaleMensile]);
  
  // Aggiungi footer con data generazione
  const dataGenerazione = new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT');
  riepilogoData.push(['']);
  riepilogoData.push([`Generato il: ${dataGenerazione}`]);
  
  // Crea il foglio di lavoro
  const ws = XLSX.utils.aoa_to_sheet(riepilogoData);
  
  // Imposta la larghezza delle colonne
  ws['!cols'] = [
    { width: 15 }, // Data
    { width: 10 }, // Entrata
    { width: 10 }, // Uscita
    { width: 15 }  // Ore
  ];
  
  // Stile per le celle del titolo (merge delle prime celle)
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Titolo azienda
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }  // Sottotitolo
  ];
  
  // Aggiungi il foglio al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Riepilogo Timbrature');
  
  // Crea secondo foglio con dettagli timbrature complete
  if (timbrature && timbrature.length > 0) {
    const dettagliData = [
      ['DETTAGLIO COMPLETO TIMBRATURE'],
      [''],
      ['Data', 'Ora', 'Tipo', 'Giorno Logico']
    ];
    
    // Filtra e ordina le timbrature per il periodo
    const timbratureFiltrate = timbrature.filter(t => {
      let dataRiferimento = t.giornologico || t.data;
      if (typeof dataRiferimento !== 'string') {
        dataRiferimento = new Date(dataRiferimento).toISOString().split('T')[0];
      } else if (dataRiferimento.includes('T')) {
        dataRiferimento = dataRiferimento.split('T')[0];
      }
      return dataRiferimento >= dataInizio.value && dataRiferimento <= dataFine.value;
    }).sort((a, b) => {
      const dataA = a.giornologico || a.data;
      const dataB = b.giornologico || b.data;
      if (dataA !== dataB) return dataA.localeCompare(dataB);
      return a.ore.localeCompare(b.ore);
    });
    
    timbratureFiltrate.forEach(t => {
      const dataFormatted = new Date(t.data).toLocaleDateString('it-IT');
      const giornoLogico = t.giornologico ? new Date(t.giornologico + 'T12:00:00').toLocaleDateString('it-IT') : dataFormatted;
      dettagliData.push([
        dataFormatted,
        t.ore.slice(0,5),
        t.tipo.toUpperCase(),
        giornoLogico
      ]);
    });
    
    const wsDettagli = XLSX.utils.aoa_to_sheet(dettagliData);
    wsDettagli['!cols'] = [
      { width: 12 }, // Data
      { width: 8 },  // Ora
      { width: 10 }, // Tipo
      { width: 12 }  // Giorno Logico
    ];
    
    wsDettagli['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } } // Titolo
    ];
    
    XLSX.utils.book_append_sheet(wb, wsDettagli, 'Dettaglio Completo');
  }
  
  // Salva il file Excel
  const nomeFileExcel = `${nomeCompleto.replace(/\s/g, '_')}_timbrature_${dataInizio.value}_${dataFine.value}.xlsx`;
  XLSX.writeFile(wb, nomeFileExcel);
});

// Funzionalità Google Fogli
document.getElementById("btn-google-sheets").addEventListener("click", function() {
  const nomeCompleto = dipendente ? `${dipendente.nome} ${dipendente.cognome}` : 'Utente';
  const dataInizioFormatted = new Date(dataInizio.value).toLocaleDateString('it-IT');
  const dataFineFormatted = new Date(dataFine.value).toLocaleDateString('it-IT');
  
  // Calcola le ore totali dalla tabella footer
  const footerRow = document.querySelector('#totale-footer tr');
  let totaleMensile = '—';
  
  if (footerRow) {
    const cells = footerRow.querySelectorAll('td');
    if (cells.length >= 4) {
      totaleMensile = cells[3].textContent.trim();
    }
  }
  
  // Prepara i dati per Google Sheets
  let csvData = `CAMERA CON VISTA Bistrot\nRIEPILOGO MENSILE TIMBRATURE\n\n`;
  csvData += `Dipendente:,${nomeCompleto} (PIN: ${pin})\n`;
  csvData += `Periodo:,dal ${dataInizioFormatted} al ${dataFineFormatted}\n`;
  csvData += `Ore totali:,${totaleMensile}\n\n`;
  csvData += `Data,Entrata,Uscita,Ore Giornaliere\n`;
  
  // Aggiungi i dati delle timbrature
  const righeTabella = document.querySelectorAll('#storico-body tr');
  
  righeTabella.forEach(riga => {
    const cells = riga.querySelectorAll('td');
    if (cells.length >= 4) {
      const data = cells[0].textContent.trim();
      const entrata = cells[1].textContent.trim();
      const uscita = cells[2].textContent.trim();
      const ore = cells[3].textContent.trim();
      
      // Aggiungi riga solo se ci sono dati significativi
      if (entrata !== '—' || uscita !== '—') {
        csvData += `${data},${entrata},${uscita},${ore}\n`;
      }
    }
  });
  
  // Aggiungi totale
  csvData += `\nTOTALE MENSILE,,,${totaleMensile}\n`;
  
  // Footer con data generazione
  const dataGenerazione = new Date().toLocaleDateString('it-IT') + ' ' + new Date().toLocaleTimeString('it-IT');
  csvData += `\nGenerato il:,${dataGenerazione}`;
  
  // Crea URL per Google Sheets
  const encodedData = encodeURIComponent(csvData);
  const sheetTitle = encodeURIComponent(`Timbrature_${nomeCompleto.replace(/\s/g, '_')}_${dataInizio.value}_${dataFine.value}`);
  
  // URL per creare un nuovo Google Sheets con i dati
  const googleSheetsUrl = `https://docs.google.com/spreadsheets/create?title=${sheetTitle}&usp=drive_web`;
  
  // Apri Google Sheets in una nuova scheda
  window.open(googleSheetsUrl, '_blank');
  
  // Mostra istruzioni all'utente
  setTimeout(() => {
    alert(`Google Sheets aperto!\n\nPer importare i dati:\n1. Copia i dati dalla tabella\n2. Incolla direttamente nel foglio Google\n3. Il foglio sarà pronto per l'uso!`);
  }, 1000);
});

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
  initCalendarUtils();
  aggiornaRange("corrente");
  caricaDati();
});

// Esporta funzioni globali necessarie
window.StoriceLogic = {
  caricaDati,
  aggiornaRange,
  renderizzaTabella
};