
// assets/pages/utenti/index.js
'use strict';

// === Codice migrato dall'inline (copiato così com'è) ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://txmjqrnitfsiytbytxlc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzY1MDcsImV4cCI6MjA2NzExMjUwN30.lag16Oxh_UQL4WOeU9-pVxIzvUyiNQMhKUY5Y5s9DPg"
);

// Funzioni globali per l'interfaccia
window.apriModalNuovoDipendente = () => document.getElementById("modalNuovoDipendente").style.display = "flex";
window.chiudiModalNuovoDipendente = () => document.getElementById("modalNuovoDipendente").style.display = "none";
window.apriModalDettagli = (utente) => {
  document.getElementById("modalTitolo").textContent = `${utente.nome} ${utente.cognome}`;
  document.getElementById("dettagli-nome").value = utente.nome;
  document.getElementById("dettagli-cognome").value = utente.cognome;
  document.getElementById("dettagli-email").value = utente.email || "";
  document.getElementById("dettagli-telefono").value = utente.telefono || "";
  document.getElementById("dettagli-descrizione-contratto").value = utente.descrizione_contratto || "";
  document.getElementById("dettagli-ore-contrattuali").value = utente.ore_contrattuali || 8.00;
  document.getElementById("modalDettagli").style.display = "flex";
};
window.chiudiModalDettagli = () => document.getElementById("modalDettagli").style.display = "none";
window.annullaNuovoDipendente = () => {
  document.getElementById("modalNuovoDipendente").style.display = "none";
  document.getElementById("nuovo-nome").value = "";
  document.getElementById("nuovo-cognome").value = "";
  document.getElementById("nuovo-email").value = "";
  document.getElementById("nuovo-telefono").value = "";
  document.getElementById("nuovo-pin").value = "";
  document.getElementById("nuovo-descrizione-contratto").value = "";
  document.getElementById("nuovo-ore-contrattuali").value = "8.00";
};
window.annullaModifiche = () => document.getElementById("modalDettagli").style.display = "none";

window.salvaNuovoDipendente = async () => {
  const nome = document.getElementById("nuovo-nome").value.trim();
  const cognome = document.getElementById("nuovo-cognome").value.trim();
  const email = document.getElementById("nuovo-email").value.trim();
  const telefono = document.getElementById("nuovo-telefono").value.trim();
  const pin = parseInt(document.getElementById("nuovo-pin").value) || Math.floor(Math.random() * 99) + 1;
  const descrizioneContratto = document.getElementById("nuovo-descrizione-contratto").value.trim();
  const oreContrattuali = parseFloat(document.getElementById("nuovo-ore-contrattuali").value);

  if (!nome || !cognome || !oreContrattuali) {
    alert("Compila tutti i campi obbligatori: Nome, Cognome e Ore max giornaliere");
    return;
  }

  try {
    const { error } = await supabase.from("utenti").insert([{
      pin, nome, cognome, email, telefono, descrizione_contratto: descrizioneContratto, ore_contrattuali: oreContrattuali
    }]);

    if (error) throw error;
    alert("Dipendente aggiunto con successo!");
    window.annullaNuovoDipendente();
    caricaUtenti();
  } catch (error) {
    console.error("Errore:", error);
    alert("Errore durante l'inserimento: " + error.message);
  }
};

window.salvaModifiche = async () => {
  const btn = document.querySelector('.btn-salva');
  const originalText = btn.textContent;
  btn.textContent = "Salvando...";
  btn.disabled = true;

  try {
    // Recupera i dati dal modale
    const nome = document.getElementById("dettagli-nome").value.trim();
    const cognome = document.getElementById("dettagli-cognome").value.trim();
    const email = document.getElementById("dettagli-email").value.trim();
    const telefono = document.getElementById("dettagli-telefono").value.trim();
    const descrizioneContratto = document.getElementById("dettagli-descrizione-contratto").value.trim();
    const oreContrattuali = parseFloat(document.getElementById("dettagli-ore-contrattuali").value) || 8.00;

    // Recupera il PIN dal titolo del modale (formato: "Nome Cognome")
    const titoloModale = document.getElementById("modalTitolo").textContent;
    const [nomeOriginale, cognomeOriginale] = titoloModale.split(' ');

    // Trova il dipendente nel database per recuperarne il PIN
    const { data: dipendenteCorrente, error: errorFind } = await supabase
      .from("utenti")
      .select("pin")
      .eq("nome", nomeOriginale)
      .eq("cognome", cognomeOriginale)
      .single();

    if (errorFind || !dipendenteCorrente) {
      throw new Error("Dipendente non trovato");
    }

    if (!nome || !cognome || !oreContrattuali) {
      alert("Compila tutti i campi obbligatori: Nome, Cognome e Ore max giornaliere");
      return;
    }

    // Aggiorna i dati nel database
    const { error } = await supabase
      .from("utenti")
      .update({
        nome,
        cognome, 
        email,
        telefono: telefono || null,
        descrizione_contratto: descrizioneContratto || null,
        ore_contrattuali: oreContrattuali
      })
      .eq("pin", dipendenteCorrente.pin);

    if (error) throw error;

    alert("Modifiche salvate con successo!");
    chiudiModalDettagli();
    caricaUtenti(); // Ricarica la tabella

  } catch (error) {
    console.error("Errore nel salvataggio:", error);
    alert("Errore durante il salvataggio: " + error.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
};

const archiviaUtente = async (pin) => {
  if (!confirm("Sei sicuro di voler archiviare questo dipendente?\n\nIl dipendente verrà rimosso dai dipendenti attivi e il suo PIN tornerà disponibile.")) {
    return;
  }

  try {
    console.log(`🗃️ Avvio archiviazione dipendente PIN ${pin}...`);

    // 1. Recupera dati completi del dipendente
    const { data: dipendente, error: errorDipendente } = await supabase
      .from("utenti")
      .select("*")
      .eq("pin", parseInt(pin))
      .single();

    if (errorDipendente || !dipendente) {
      throw new Error(`Dipendente con PIN ${pin} non trovato: ${errorDipendente?.message}`);
    }

    // 2. Recupera tutte le timbrature storiche del dipendente
    const { data: timbrature, error: errorTimbrature } = await supabase
      .from("timbrature")
      .select("*")
      .eq("pin", parseInt(pin))
      .order("data", { ascending: true })
      .order("ore", { ascending: true });

    if (errorTimbrature) {
      console.warn("Errore recupero timbrature:", errorTimbrature);
    }

    // 3. Genera dati Excel completi (formato JSON serializzato)
    const dataGenerazione = new Date().toISOString();
    const excelData = {
      dipendente: {
        pin: dipendente.pin,
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        email: dipendente.email,
        telefono: dipendente.telefono,
        ore_contrattuali: dipendente.ore_contrattuali,
        descrizione_contratto: dipendente.descrizione_contratto
      },
      timbrature: timbrature || [],
      totaleTimbrature: (timbrature || []).length,
      dataGenerazione: dataGenerazione,
      pinLiberato: dipendente.pin // Traccia che questo PIN è ora libero
    };

    const nomeFileExcel = `${dipendente.nome}_${dipendente.cognome}_completo_${new Date().toISOString().split('T')[0]}.xlsx`;

    // 4. Inserisci nella tabella dipendenti_archiviati
    const { error: errorArchiviazione } = await supabase
      .from("dipendenti_archiviati")
      .insert([{
        pin: dipendente.pin,
        nome: dipendente.nome,
        cognome: dipendente.cognome,
        email: dipendente.email,
        telefono: dipendente.telefono,
        ore_contrattuali: dipendente.ore_contrattuali,
        descrizione_contratto: dipendente.descrizione_contratto,
        data_archiviazione: dataGenerazione,
        file_excel_path: JSON.stringify(excelData), // Serializza come JSON
        file_excel_name: nomeFileExcel
      }]);

    if (errorArchiviazione) {
      throw new Error(`Errore durante l'archiviazione: ${errorArchiviazione.message}`);
    }

    // 5. Rimuovi dipendente dalla tabella utenti attivi (libera il PIN)
    const { error: errorRimozione } = await supabase
      .from("utenti")
      .delete()
      .eq("pin", parseInt(pin));

    if (errorRimozione) {
      throw new Error(`Errore durante la rimozione: ${errorRimozione.message}`);
    }

    // Successo!
    alert(`✅ Dipendente ${dipendente.nome} ${dipendente.cognome} archiviato con successo!\n\n📊 Dati archiviati:\n• ${(timbrature || []).length} timbrature storiche\n• File Excel generato: ${nomeFileExcel}\n• PIN ${pin} ora disponibile per nuovi dipendenti\n\nIl dipendente è ora consultabile in "ex Dipendenti".`);
    
    console.log(`✅ Archiviazione completata per PIN ${pin}:`);
    console.log(`   • Nome: ${dipendente.nome} ${dipendente.cognome}`);
    console.log(`   • Timbrature archiviate: ${(timbrature || []).length}`);
    console.log(`   • PIN liberato: ${pin}`);
    console.log(`   • File Excel: ${nomeFileExcel}`);

    // Ricarica la tabella per riflettere le modifiche
    caricaUtenti();

  } catch (error) {
    console.error("❌ Errore durante l'archiviazione:", error);
    alert(`Errore durante l'archiviazione: ${error.message}`);
  }
};

// Espone la funzione globalmente per gli attributi onclick
window.archiviaUtente = archiviaUtente;
window.eliminaUtente = (pin, nome, cognome) => {
  if (confirm(`Sei sicuro di voler eliminare definitivamente ${nome} ${cognome}?`)) {
    alert(`Dipendente ${nome} ${cognome} eliminato (funzione in fase di implementazione)`);
  }
};

// Gestione upload file
function setupFileUpload(areaId, inputId, textId, infoId, nameId, sizeId, removeBtnId) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  const text = document.getElementById(textId);
  const info = document.getElementById(infoId);
  const nameEl = document.getElementById(nameId);
  const sizeEl = document.getElementById(sizeId);
  const removeBtn = document.getElementById(removeBtnId);

  area.addEventListener("click", () => input.click());
  area.addEventListener("dragover", (e) => { e.preventDefault(); area.classList.add("dragover"); });
  area.addEventListener("dragleave", () => area.classList.remove("dragover"));
  area.addEventListener("drop", (e) => {
    e.preventDefault();
    area.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);      });

  input.addEventListener("change", (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  removeBtn.addEventListener("click", () => {
    input.value = "";
    text.style.display = "block";
    info.style.display = "none";
  });

  function handleFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("File troppo grande. Massimo 5MB.");
      return;
    }
    nameEl.textContent = file.name;
    sizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + " MB";
    text.style.display = "none";
    info.style.display = "block";
  }
}

// Carica utenti dal database
async function caricaUtenti() {
  try {
    const { data: utenti, error } = await supabase
      .from("utenti")
      .select("*")
      .order("pin", { ascending: true });

    if (error) {
      console.error("Errore caricamento utenti:", error);
      return;
    }

    const tbody = document.getElementById("lista-dipendenti");
    tbody.innerHTML = "";

    if (!utenti || utenti.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">
            Nessun dipendente registrato.<br>
            <small>Utilizza il pulsante "Aggiungi" per inserire il primo dipendente.</small>
          </td>
        </tr>
      `;
      return;
    }

    utenti.forEach(utente => {
      const riga = document.createElement('tr');
      riga.style.cssText = "background-color: #1e293b; cursor: pointer; transition: background-color 0.2s;";

      riga.innerHTML = `
        <td><a href="storico.html?pin=${utente.pin}" title="Storico" onclick="event.stopPropagation()"><img src="assets/icons/orologio.png" alt="Storico" style="width:24px;height:24px;" /></a></td>
        <td>${utente.pin.toString().padStart(2, '0')}</td>
        <td>${utente.nome}</td>
        <td>${utente.cognome}</td>
        <td onclick="event.stopPropagation()">
          <div style="display: flex; justify-content: center; align-items: center; gap: 4px; height: 100%;">
            <button onclick="apriModalDettagli({pin: ${utente.pin}, nome: '${utente.nome}', cognome: '${utente.cognome}', email: '${utente.email || ''}', telefono: '${utente.telefono || ''}', descrizione_contratto: '${utente.descrizione_contratto || ''}', ore_contrattuali: ${utente.ore_contrattuali || 8.00}})" style="background: none; border: none; font-size: 20px; padding: 4px;" title="Modifica">✏️</button>
            <button onclick="archiviaUtente('${utente.pin}')" title="Archivia dipendente" style="background: none; border: none; font-size: 20px; padding: 4px;">📦</button>
            <button onclick="eliminaUtente('${utente.pin}', '${utente.nome}', '${utente.cognome}')" title="Elimina definitivamente" style="background: none; border: none; font-size: 20px; padding: 4px; color: #dc2626;">❌</button>
          </div>
        </td>
      `;
      tbody.appendChild(riga);
    });

  } catch (error) {
    console.error("Errore imprevisto:", error);
  }
}

// Setup upload areas
setupFileUpload("nuovo-upload-area", "nuovo-file-input", "nuovo-upload-text", "nuovo-file-info", "nuovo-file-name", "nuovo-file-size", "nuovo-remove-file-btn");
setupFileUpload("upload-area", "file-input", "upload-text", "file-info", "file-name", "file-size", "remove-file-btn");

// Carica utenti all'avvio
caricaUtenti();

// === Esposizione globale delle funzioni chiamate da attributi HTML ===
// Esposizione per attributi onclick
try { if (typeof window.apriModalNuovoDipendente !== 'function' && typeof apriModalNuovoDipendente === 'function') { window.apriModalNuovoDipendente = apriModalNuovoDipendente; } } catch (e) {}
try { if (typeof window.chiudiModalNuovoDipendente !== 'function' && typeof chiudiModalNuovoDipendente === 'function') { window.chiudiModalNuovoDipendente = chiudiModalNuovoDipendente; } } catch (e) {}
try { if (typeof window.apriModalDettagli !== 'function' && typeof apriModalDettagli === 'function') { window.apriModalDettagli = apriModalDettagli; } } catch (e) {}
try { if (typeof window.chiudiModalDettagli !== 'function' && typeof chiudiModalDettagli === 'function') { window.chiudiModalDettagli = chiudiModalDettagli; } } catch (e) {}
try { if (typeof window.annullaNuovoDipendente !== 'function' && typeof annullaNuovoDipendente === 'function') { window.annullaNuovoDipendente = annullaNuovoDipendente; } } catch (e) {}
try { if (typeof window.annullaModifiche !== 'function' && typeof annullaModifiche === 'function') { window.annullaModifiche = annullaModifiche; } } catch (e) {}
try { if (typeof window.salvaNuovoDipendente !== 'function' && typeof salvaNuovoDipendente === 'function') { window.salvaNuovoDipendente = salvaNuovoDipendente; } } catch (e) {}
try { if (typeof window.salvaModifiche !== 'function' && typeof salvaModifiche === 'function') { window.salvaModifiche = salvaModifiche; } } catch (e) {}
try { if (typeof window.archiviaUtente !== 'function' && typeof archiviaUtente === 'function') { window.archiviaUtente = archiviaUtente; } } catch (e) {}
try { if (typeof window.eliminaUtente !== 'function' && typeof eliminaUtente === 'function') { window.eliminaUtente = eliminaUtente; } } catch (e) {}
