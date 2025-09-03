      <script type="module">
        import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
        window.supabase = createClient(
          "https://txmjqrnitfsiytbytxlc.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzY1MDcsImV4cCI6MjA2NzExMjUwN30.lag16Oxh_UQL4WOeU9-pVxIzvUyiNQMhKUY5Y5s9DPg"
        );
      </script>
      <script>
        const { DateTime } = luxon;
        const giorni = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
        const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        const pinInput = document.getElementById("pinInput");
        const status = document.getElementById("status");
    
        function aggiornaDataOra() {
          const ora = DateTime.now().setZone("Europe/Rome");
          document.getElementById("dataGiorno").textContent = `${giorni[ora.weekday % 7]} ${ora.day} ${mesi[ora.month - 1]}`;
          document.getElementById("ora").textContent = ora.toFormat("HH:mm");
        }
    
        function mostraStatus(messaggio, tipo = "info", durata = 3000) {
          status.textContent = messaggio;
          
          // Applica l'animazione lampeggiante per le timbrature (entrata e uscita)
          if (tipo === "success" && (messaggio.includes("ENTRATA") || messaggio.includes("USCITA"))) {
            status.className = `status-message ${tipo} visible timbratura-flash`;
            // Per le timbrature, usa sempre 7 secondi
            setTimeout(() => status.className = "status-message", 7000);
          } else {
            status.className = `status-message ${tipo} visible`;
            setTimeout(() => status.className = "status-message", durata);
          }
        }
    
        function pulisciPin() {
          pinInput.value = "";
        }
    
        function verificaAccessoAdmin() {
          // Crea modal personalizzato
          const modalHTML = `
            <div id="adminModal" style="
              position: fixed; 
              top: 0; 
              left: 0; 
              width: 100%; 
              height: 100%; 
              background: rgba(0,0,0,0.8); 
              z-index: 9999; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            ">
              <div style="
                background: #1e293b; 
                padding: 30px; 
                border-radius: 15px; 
                text-align: center; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                min-width: 300px;
              ">
                <h3 style="color: white; margin-bottom: 20px;">Accesso Amministratore</h3>
                <input 
                  type="password" 
                  id="adminPinInput" 
                  placeholder="Inserisci PIN admin" 
                  style="
                    width: 100%; 
                    padding: 12px; 
                    font-size: 18px; 
                    text-align: center; 
                    border: none; 
                    border-radius: 8px; 
                    margin-bottom: 20px;
                    letter-spacing: 2px;
                  "
                />
                <div>
                  <button onclick="verificaPinAdmin()" style="
                    background: #15803d; 
                    color: white; 
                    border: none; 
                    padding: 12px 20px; 
                    margin: 0 10px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 16px;
                  ">Conferma</button>
                  <button onclick="chiudiModalAdmin()" style="
                    background: #dc2626; 
                    color: white; 
                    border: none; 
                    padding: 12px 20px; 
                    margin: 0 10px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 16px;
                  ">Annulla</button>
                </div>
              </div>
            </div>
          `;
          
          document.body.insertAdjacentHTML('beforeend', modalHTML);
          document.getElementById('adminPinInput').focus();
          
          // Gestisce Enter
          document.getElementById('adminPinInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') verificaPinAdmin();
          });
        }
    
        function verificaPinAdmin() {
          const pinAdmin = document.getElementById('adminPinInput').value;
          if (pinAdmin === "1909") {
            window.location.href = "utenti.html";
          } else {
            alert("PIN non valido. Accesso negato.");
            chiudiModalAdmin();
          }
        }
    
        function chiudiModalAdmin() {
          const modal = document.getElementById('adminModal');
          if (modal) modal.remove();
        }
    
        document.querySelectorAll(".keypad-button").forEach((key) => {
          key.addEventListener("click", () => {
            const valore = key.textContent;
            if (valore === "C") pulisciPin();
            else if (valore === "⚙️") verificaAccessoAdmin();
            else if (pinInput.value.length < 2) pinInput.value += valore;
          });
        });
    
        async function verificaUtente(pin) {
          const { data, error } = await supabase.from("utenti").select("nome, cognome").eq("pin", pin).single();
          if (error) throw new Error("PIN non valido");
          return data;
        }
    
        async function verificaUltimaTimbratura(pin) {
          const { data, error } = await supabase.from("timbrature").select("tipo").eq("pin", parseInt(pin)).order("data", { ascending: false }).order("ore", { ascending: false }).limit(1);
          if (error) throw new Error("Errore verifica");
          return data.length > 0 ? data[0].tipo : null;
        }
    
        async function registraTimbratura(tipo) {
          const pin = pinInput.value.trim();
          if (!pin) {
            mostraStatus("Inserisci il PIN", "error");
            return;
          }
    
          try {
            mostraStatus("Verifica in corso...", "loading");
    
            // Verifica connessione Supabase
            if (!window.supabase) {
              mostraStatus("Errore: connessione database non disponibile", "error");
              return;
            }
    
            const { data: utente, error: erroreUtente } = await supabase
              .from("utenti")
              .select("*")
              .eq("pin", parseInt(pin))
              .single();
    
            if (erroreUtente || !utente) {
              mostraStatus("PIN non trovato", "error");
              return;
            }
    
            // CONTROLLO ANTI-DUPLICAZIONE MIGLIORATO: Verifica ultima timbratura
            const { data: ultimaTimbratura, error: erroreUltima } = await supabase
              .from("timbrature")
              .select("tipo, created_at, data, ore")
              .eq("pin", parseInt(pin))
              .order("created_at", { ascending: false })
              .limit(1);
    
            if (erroreUltima && erroreUltima.code !== 'PGRST116') {
              console.error("Errore verifica ultima timbratura:", erroreUltima);
              mostraStatus("Errore di sistema", "error");
              return;
            }
    
            // Blocca timbrature consecutive dello stesso tipo (solo se ci sono timbrature precedenti)
            if (ultimaTimbratura && ultimaTimbratura.length > 0) {
              const ultimoTipo = ultimaTimbratura[0].tipo;
              if (ultimoTipo === tipo) {
                const ultimaData = ultimaTimbratura[0].data;
                const ultimaOra = ultimaTimbratura[0].ore;
                const messaggioBlocco = tipo === "entrata" ? 
                  `⚠️ ENTRATA già registrata!\nUltima: ${ultimaData} ${ultimaOra.slice(0,5)}\n\nDevi prima fare l'USCITA.` :
                  `⚠️ USCITA già registrata!\nUltima: ${ultimaData} ${ultimaOra.slice(0,5)}\n\nDevi prima fare l'ENTRATA.`;
                mostraStatus(messaggioBlocco, "error", 8000);
                return;
              }
            }
    
            const ora = DateTime.now().setZone("Europe/Rome");
    
            // CALCOLO GIORNO LOGICO ESTESO (8:00-5:00)
            // Se è tra 00:00 e 04:59, appartiene al giorno lavorativo precedente
            let giornoLogico = ora.toISODate();
            if (ora.hour >= 0 && ora.hour < 5) {
              giornoLogico = ora.minus({ days: 1 }).toISODate();
            }
    
            // Format the time to HH:MM:SS with zero padding
            const oraFormatted = ora.toFormat("HH:mm:ss");
    
            const nuovaTimbratura = {
              tipo, 
              pin: parseInt(pin), 
              nome: utente.nome, 
              cognome: utente.cognome,
              data: ora.toISODate(), 
              ore: oraFormatted,
              giornologico: giornoLogico
            };
    
            const { error } = await supabase.from("timbrature").insert([nuovaTimbratura]);
    
            if (error) {
              console.error("Errore inserimento timbratura:", error);
              throw new Error("Errore durante la registrazione: " + error.message);
            }
    
            mostraStatus(`${utente.nome} ${utente.cognome}\n${tipo.toUpperCase()} ${ora.toFormat("HH:mm")}`, "success", 7000);
            pulisciPin();
          } catch (e) {
            console.error("Errore generale:", e);
            mostraStatus(e.message || "Errore di connessione", "error", 6000);
          }
        }
    
        document.querySelector(".entrata").addEventListener("click", () => {
          const pin = pinInput.value.trim();
          if (!pin) return mostraStatus("Inserisci il PIN", "warning");
          registraTimbratura("entrata");
        });
    
        document.querySelector(".uscita").addEventListener("click", () => {
          const pin = pinInput.value.trim();
          if (!pin) return mostraStatus("Inserisci il PIN", "warning");
          registraTimbratura("uscita");
        });
    
        aggiornaDataOra();
        setInterval(aggiornaDataOra, 1000);
        pinInput.focus();
      </script>
