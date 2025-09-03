    import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

    const supabase = createClient(
      "https://txmjqrnitfsiytbytxlc.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzY1MDcsImV4cCI6MjA2NzExMjUwN30.lag16Oxh_UQL4WOeU9-pVxIzvUyiNQMhKUY5Y5s9DPg"
    );

    const tbody = document.getElementById("lista-ex-dipendenti");

    async function caricaExDipendenti() {
      try {
        const { data, error } = await supabase
          .from("dipendenti_archiviati")
          .select("*")
          .order("data_archiviazione", { ascending: false });

        if (error) {
          console.error("Errore caricamento ex dipendenti:", error);
          alert("Errore durante il caricamento: " + error.message);
          return;
        }

        tbody.innerHTML = "";

        if (!data || data.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="4" class="empty-message">
                <div>📂 Nessun dipendente archiviato</div>
                <small style="display: block; margin-top: 10px; color: #6b7280;">
                  I dipendenti archiviati appariranno qui con la possibilità di scaricare il file Excel completo
                </small>
              </td>
            </tr>
          `;
          return;
        }

        data.forEach(exDipendente => {
          const dataArchiviazione = new Date(exDipendente.data_archiviazione).toLocaleDateString('it-IT');
          const riga = document.createElement('tr');
          riga.innerHTML = `
            <td title="${exDipendente.nome}">${exDipendente.nome}</td>
            <td title="${exDipendente.cognome}">${exDipendente.cognome}</td>
            <td title="${dataArchiviazione}">${dataArchiviazione}</td>
            <td>
              <div class="actions-container">
                <button class="download-btn" onclick="scaricaExcel('${exDipendente.id}', '${exDipendente.nome}', '${exDipendente.cognome}')" title="Scarica Excel">
                  <img src="assets/icons/esporta.png" alt="Esporta Excel" style="width: 24px; height: 24px;" />
                </button>
                <button class="delete-btn" onclick="eliminaExDipendente('${exDipendente.id}', '${exDipendente.nome}', '${exDipendente.cognome}')" title="Elimina Definitivamente">
                  ❌
                </button>
              </div>
            </td>
          `;
          tbody.appendChild(riga);
        });

      } catch (error) {
        console.error("Errore imprevisto:", error);
        alert("Errore durante il caricamento ex dipendenti");
      }
    }

    window.scaricaExcel = async (id, nome, cognome) => {
      try {
        const { data, error } = await supabase
          .from("dipendenti_archiviati")
          .select("file_excel_path, file_excel_name")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Errore recupero file:", error);
          alert("Errore durante il recupero del file: " + error.message);
          return;
        }

        if (!data.file_excel_path) {
          alert("File Excel non disponibile per questo dipendente");
          return;
        }

        const excelData = JSON.parse(data.file_excel_path);
        let csvContent = "data:text/csv;charset=utf-8,";

        csvContent += "INFORMAZIONI DIPENDENTE\n";
        csvContent += "Nome,Cognome,PIN,Email,Telefono,Ore Contrattuali\n";
        csvContent += `"${excelData.dipendente.nome}","${excelData.dipendente.cognome}",${excelData.dipendente.pin},"${excelData.dipendente.email}","${excelData.dipendente.telefono || 'N/A'}",${excelData.dipendente.ore_contrattuali}\n\n`;

        csvContent += "STORICO TIMBRATURE\n";
        csvContent += "Data,Ora,Tipo,PIN,Nome,Cognome\n";

        if (excelData.timbrature && excelData.timbrature.length > 0) {
          excelData.timbrature.forEach(timbratura => {
            csvContent += `"${timbratura.data}","${timbratura.ore}","${timbratura.tipo}",${timbratura.pin},"${timbratura.nome}","${timbratura.cognome}"\n`;
          });
        }

        csvContent += `\nTOTALE TIMBRATURE: ${excelData.totaleTimbrature || 0}\n`;
        csvContent += `GENERATO IL: ${new Date(excelData.dataGenerazione).toLocaleString('it-IT')}\n`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${nome}_${cognome}_timbrature_completo.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error("Errore scaricamento file:", error);
        alert("Errore durante lo scaricamento del file");
      }
    };



    window.eliminaExDipendente = async (id, nome, cognome) => {
      if (!confirm(`⚠️ ATTENZIONE! Stai per eliminare DEFINITIVAMENTE l'ex dipendente:\n\n${nome} ${cognome}\n\nQuesta azione eliminerà:\n• L'ex dipendente dall'archivio\n• Tutti i suoi dati archiviati\n• Il file Excel associato\n\nQuesta operazione NON può essere annullata!\n\nSei sicuro di voler procedere?`)) return;

      if (!confirm(`⚠️ ULTIMA CONFERMA!\n\nStai per eliminare definitivamente ${nome} ${cognome}.\n\nDigita "ELIMINA" per confermare:`)) return;

      try {
        const { error } = await supabase
          .from("dipendenti_archiviati")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Errore eliminazione ex dipendente:", error);
          alert("Errore durante l'eliminazione: " + error.message);
          return;
        }

        alert(`✅ Ex dipendente ${nome} ${cognome} eliminato definitivamente dall'archivio!`);
        caricaExDipendenti();

      } catch (error) {
        console.error("Errore imprevisto:", error);
        alert("Errore durante l'eliminazione definitiva");
      }
    };

    caricaExDipendenti();

