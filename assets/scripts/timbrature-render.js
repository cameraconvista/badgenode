// timbrature-render.js

import { calcolaOreLavorate, formattaOre, normalizzaData } from './calendar-utils.js';
import { apriModaleModifica } from './modale-modifica.js';

export function renderizzaTabella(dipendente, timbrature, dataInizio, dataFine, tbody, footerTbody, pin) {
  tbody.innerHTML = "";
  footerTbody.innerHTML = "";

  // Se non ci sono timbrature, mostra messaggio di stato vuoto
  if (!timbrature || timbrature.length === 0) {
    const rigaVuota = document.createElement("tr");
    rigaVuota.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 40px; color: #a0aec0; font-style: italic;">
        Nessuna timbratura nel periodo selezionato
      </td>
    `;
    tbody.appendChild(rigaVuota);
    
    // Riga totale anche quando vuoto
    const rigaTotale = document.createElement("tr");
    rigaTotale.innerHTML = `
      <td style="text-align:left;">TOTALE MENSILE</td>
      <td></td>
      <td></td>
      <td style="color: #ffff99;">0.00</td>
      <td style="text-align: center;"></td>
      <td></td>
    `;
    footerTbody.appendChild(rigaTotale);
    
    return { totaleMensile: '0.00', totaleMensileExtra: 0 };
  }

  const start = new Date(dataInizio + 'T00:00:00');
  const end = new Date(dataFine + 'T00:00:00');
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

    const timbratureOggi = timbrature.filter(t => {
      const dataRiferimento = normalizzaData(t.giornologico || t.data);
      return dataRiferimento === dataISO;
    });

    const timbratureEntrata = timbratureOggi.filter(t => t.tipo === "entrata").sort((a, b) => a.ore.localeCompare(b.ore));
    const timbratureUscita = timbratureOggi.filter(t => t.tipo === "uscita").sort((a, b) => a.ore.localeCompare(b.ore));

    let oreTotaliGiorno = 0;
    if (timbratureEntrata.length > 0 && timbratureUscita.length > 0) {
      const entrata = timbratureEntrata[0];
      const uscita = timbratureUscita[timbratureUscita.length - 1];
      oreTotaliGiorno = calcolaOreLavorate(entrata.ore, uscita.ore);
    }

    const entrataDisplay = timbratureEntrata.length > 0 ? timbratureEntrata[0].ore.slice(0,5) : '—';
    const uscitaDisplay = timbratureUscita.length > 0 ? timbratureUscita[timbratureUscita.length - 1].ore.slice(0,5) : '—';
    const oreDisplay = formattaOre(oreTotaliGiorno);

    const oreContrattuali = parseFloat(dipendente?.ore_contrattuali) || 8.00;
    const oreExtra = oreTotaliGiorno - oreContrattuali;
    let extraContent = '';
    if (oreExtra > 0) {
      extraContent = `<span style="color: #fbbf24; font-weight: bold;">${formattaOre(oreExtra)}</span>`;
      totaleMensileExtra += oreExtra;
    }

    const timbraturaId = timbratureEntrata.length > 0 ? timbratureEntrata[0].id : 'nuovo';

    const riga = document.createElement("tr");
    if (current.getDay() === 0 || current.getDay() === 6) riga.classList.add('weekend');
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

        // Aggiungi evento click al pulsante modifica
        const btnModifica = riga.querySelector('.modifica-icon'); // Corrected selector
        if (btnModifica) {
          btnModifica.addEventListener('click', (e) => {
            e.preventDefault();
            // Assuming apriModaleModifica is defined elsewhere and accessible
            apriModaleModifica(dataISO, timbratureEntrata, timbratureUscita, pin, timbraturaId); // Pass timbraturaId
          });
        }
  }

  const rigaTotale = document.createElement("tr");
  let totaleExtraContent = '';
  if (totaleMensileExtra > 0) {
    totaleExtraContent = `<span style="color: #fbbf24; font-weight: bold;">${formattaOre(totaleMensileExtra)}</span>`;
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

  return {
    totaleMensile: totaleMensileOre.toFixed(2),
    totaleMensileExtra: totaleMensileExtra,
  };
}