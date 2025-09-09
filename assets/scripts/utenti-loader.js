import { supabase } from './supabase-client.js';

// Cella AZIONI: bottoni con data-action + classi legacy (per compatibilità)
function renderAzioniCell(pin) {
  return `
    <button type="button"
            class="btn-modifica edit-btn"
            data-action="edit" data-pin="${pin}"
            title="Modifica">
      <img src="assets/icons/matita-colorata.png" alt="Modifica" class="icon-16" />
    </button>
    <button type="button"
            class="btn-archivia archive-btn"
            data-action="archive" data-pin="${pin}"
            title="Archivia">
      <img src="public/icons/archive.png" alt="Archivia" class="icon-16" />
    </button>
  `;
}

// Cella STORICO: link con icona clock (resta <a>, non <button>)
function renderStoricoCell(pin) {
  return `
    <a href="storico.html?pin=${pin}"
       class="link-storico storico-link"
       data-action="storico" data-pin="${pin}"
       title="Storico timbrature">
      <img src="public/icons/clock.png" alt="Storico" class="icon-16" />
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  console.info('[UTENTI] init DOMContentLoaded');
  console.time('[UTENTI] load');

  try {
    const { data, error, status } = await supabase
      .from('utenti')
      .select('*')
      .order('pin', { ascending: true });

    if (error) {
      console.error('[UTENTI] supabase error', { status, error });
      document.getElementById('lista-dipendenti').innerHTML = `
        <tr><td colspan="5" style="color: red; text-align: center; padding: 20px;">
          Errore caricamento utenti: ${error.message}
        </td></tr>
      `;
      return;
    }

    console.debug('[UTENTI] rows', data?.length ?? 0);
    renderUtenti(data || []);
  } catch (e) {
    console.error('[UTENTI] exception', e);
    document.getElementById('lista-dipendenti').innerHTML = `
      <tr><td colspan="5" style="color: red; text-align: center; padding: 20px;">
        Errore di connessione: ${e.message}
      </td></tr>
    `;
  } finally {
    console.timeEnd('[UTENTI] load');
  }

  const tbody = document.getElementById('lista-dipendenti');
  if (tbody && !tbody.__actionsBound) {
    tbody.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      const pin = el.dataset.pin;
      if (!pin) return;
      try {
        if (action === 'edit') {
          // preferisci funzione legacy se esiste
          if (typeof window.apriModaleModifica === 'function') return window.apriModaleModifica(pin);
          if (typeof window.openEditModal === 'function') return window.openEditModal(pin);
        }
        if (action === 'archive') {
          if (typeof window.archiviaDipendente === 'function') return window.archiviaDipendente(pin);
          if (typeof window.archiveUser === 'function') return window.archiveUser(pin);
        }
        if (action === 'storico') {
          // Link già gestito via href; niente da fare.
          return;
        }
      } catch (err) {
        console.error('[UTENTI] action error', action, pin, err);
      }
    });
    tbody.__actionsBound = true;
  }
});

function renderUtenti(utenti) {
  const tbody = document.getElementById('lista-dipendenti');

  if (!tbody) {
    console.error('[UTENTI] Elemento lista-dipendenti non trovato');
    return;
  }

  if (utenti.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">
        Nessun utente trovato
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = utenti.map(dipendente => {
    const row = document.createElement('tr');

    // Cella Storico
    const storicoCell = row.insertCell();
    storicoCell.innerHTML = renderStoricoCell(dipendente.pin);

    // Cella PIN
    const pinCell = row.insertCell();
    pinCell.textContent = dipendente.pin;

    // Cella Nome
    const nomeCell = row.insertCell();
    nomeCell.textContent = dipendente.nome;

    // Cella Cognome
    const cognomeCell = row.insertCell();
    cognomeCell.textContent = dipendente.cognome;

    // Cella Email
    const emailCell = row.insertCell();
    emailCell.textContent = dipendente.email || 'Non specificata';

    // Cella Telefono
    const telefonoCell = row.insertCell();
    telefonoCell.textContent = dipendente.telefono || 'Non disponibile';

    // Cella Ore Max Giornaliere
    const oreMaxCell = row.insertCell();
    oreMaxCell.textContent = dipendente.ore_max_giornaliere || '8,00';

    // Cella Azioni
    const azioniCell = row.insertCell();
    azioniCell.innerHTML = renderAzioniCell(dipendente.pin);

    return row.outerHTML;
  }).join('');

  console.info('[UTENTI] render complete', utenti.length, 'users');
}

// Funzione per aprire lo storico
  function apriStorico(pin, nome, cognome) {
    console.log('🔍 Apertura storico per:', { pin, nome, cognome });
    window.location.href = `storico.html?pin=${pin}&nome=${encodeURIComponent(nome)}&cognome=${encodeURIComponent(cognome)}`;
  }

  // Funzioni globali
    window.modificaUtente = modificaUtente;
    window.eliminaDipendente = eliminaDipendente;
    window.archiviaDipendente = archiviaDipendente;
    window.apriStorico = apriStorico;


window.modificaUtente = async function(pin) {
  try {
    console.log('🔧 Modifica utente PIN:', pin);

    // Recupera i dati attuali del dipendente
    const { data: utente, error } = await supabase
      .from('utenti')
      .select('*')
      .eq('pin', parseInt(pin))
      .single();

    if (error || !utente) {
      alert('Errore: Dipendente non trovato');
      return;
    }

    // Usa il modale esistente nell'HTML
    const modal = document.getElementById('modalModificaDipendente');
    const modalTitle = document.getElementById('modalTitleModifica');
    const inputNome = document.getElementById('inputNomeModifica');
    const inputCognome = document.getElementById('inputCognomeModifica');
    const inputEmail = document.getElementById('inputEmailModifica');
    const inputOre = document.getElementById('inputOreModifica');
    const btnSalva = document.getElementById('btnSalvaModifica');
    const btnAnnulla = document.getElementById('btnAnnullaModifica');

    if (!modal) {
      console.error('❌ Modale esistente non trovato');
      alert('Errore: Modale di modifica non disponibile');
      return;
    }

    // Precompila i campi con i dati attuali
    if (modalTitle) modalTitle.textContent = `🔧 Modifica Dipendente (PIN: ${pin})`;
    if (inputNome) inputNome.value = utente.nome || '';
    if (inputCognome) inputCognome.value = utente.cognome || '';
    if (inputEmail) inputEmail.value = utente.email || '';
    if (inputOre) inputOre.value = utente.ore_contrattuali || 8;

    // Configura i pulsanti
    if (btnSalva) {
      btnSalva.onclick = () => salvaModificheUtente(pin);
    }
    if (btnAnnulla) {
      btnAnnulla.onclick = chiudiModaleModifica;
    }

    // Mostra il modale
    modal.style.display = 'block';

    // Focus sul primo campo
    if (inputNome) inputNome.focus();

  } catch (error) {
    console.error('❌ Errore modifica utente:', error);
    alert('Errore nel caricamento dei dati del dipendente');
  }
};

window.archiviaUtente = async function(pin, nome, cognome) {
  if (!confirm(`⚠️ ATTENZIONE! Stai per archiviare il dipendente:\n\n${nome} ${cognome} (PIN: ${pin})\n\nQuesta azione:\n• Sposterà il dipendente nell'archivio\n• Genererà un file Excel con tutto lo storico\n• Libererà il PIN per nuovi dipendenti\n\nProcedere con l'archiviazione?`)) return;

  try {
    console.log(`🗂️ Inizio archiviazione per PIN ${pin}:`);
    console.log(`   • Nome: ${nome} ${cognome}`);

    // 1. Recupera tutti i dati del dipendente
    const { data: dipendenteData, error: dipendenteError } = await supabase
      .from('utenti')
      .select('*')
      .eq('pin', parseInt(pin))
      .single();

    if (dipendenteError || !dipendenteData) {
      throw new Error('Dipendente non trovato nel database');
    }

    // 2. Recupera tutte le timbrature del dipendente
    const { data: timbratureData, error: timbratureError } = await supabase
      .from('timbrature')
      .select('*')
      .eq('pin', parseInt(pin))
      .order('data', { ascending: true })
      .order('ore', { ascending: true });

    if (timbratureError) {
      console.error('Errore recupero timbrature:', timbratureError);
      // Continua comunque l'archiviazione anche senza timbrature
    }

    // 3. Genera il contenuto Excel con tutti i dati
    const excelData = {
      dipendente: {
        pin: dipendenteData.pin,
        nome: dipendenteData.nome,
        cognome: dipendenteData.cognome,
        email: dipendenteData.email || 'Non disponibile',
        telefono: dipendenteData.telefono || 'Non disponibile',
        ore_contrattuali: dipendenteData.ore_contrattuali || 8.0
      },
      timbrature: timbratureData || [],
      totaleTimbrature: timbratureData?.length || 0,
      dataGenerazione: new Date().toISOString()
    };

    // 4. Inserisci nella tabella dipendenti_archiviati
    const { data: archiviatiData, error: archiviatiError } = await supabase
      .from('dipendenti_archiviati')
      .insert({
        pin: dipendenteData.pin,
        nome: dipendenteData.nome,
        cognome: dipendenteData.cognome,
        email: dipendenteData.email,
        telefono: dipendenteData.telefono,
        ore_contrattuali: dipendenteData.ore_contrattuali,
        data_archiviazione: new Date().toISOString(),
        file_excel_path: JSON.stringify(excelData),
        file_excel_name: `${nome}_${cognome}_timbrature_completo.csv`
      })
      .select();

    if (archiviatiError) {
      throw new Error(`Errore durante l'archiviazione: ${archiviatiError.message}`);
    }

    // 5. Elimina il dipendente dalla tabella utenti (libera il PIN)
    const { error: deleteError } = await supabase
      .from('utenti')
      .delete()
      .eq('pin', parseInt(pin));

    if (deleteError) {
      console.error('Errore eliminazione dipendente:', deleteError);
      // Non blocca l'operazione, l'archiviazione è già avvenuta
    }

    console.log(`✅ Archiviazione completata per PIN ${pin}:`);
    console.log(`   • Nome: ${nome} ${cognome}`);
    console.log(`   • Timbrature archiviate: ${timbratureData?.length || 0}`);
    console.log(`   • PIN liberato: ${pin}`);

    alert(`✅ Dipendente ${nome} ${cognome} archiviato con successo!\n\n📊 Riepilogo archiviazione:\n• Timbrature salvate: ${timbratureData?.length || 0}\n• PIN liberato: ${pin}\n• File Excel generato\n\nIl dipendente è ora disponibile nella sezione "ex Dipendenti".`);

    // Ricarica la pagina per aggiornare la lista
    setTimeout(() => location.reload(), 1500);

  } catch (error) {
    console.error('❌ Errore durante l\'archiviazione:', error);
    alert('Errore durante l\'archiviazione: ' + (error.message || 'Errore sconosciuto'));
  }
};

window.eliminaUtente = function(pin, nome, cognome) {
  if (confirm(`Eliminare ${nome} ${cognome} (PIN: ${pin})?`)) {
    console.log('Elimina utente PIN:', pin);
    // TODO: implementare eliminazione
    alert('Funzione elimina in sviluppo');
  }
};

// Funzioni per il modale di modifica
window.chiudiModaleModifica = function() {
  const modal = document.getElementById('modalModificaDipendente');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.salvaModificheUtente = async function(pin) {
  try {
    const nome = document.getElementById('inputNomeModifica').value.trim();
    const cognome = document.getElementById('inputCognomeModifica').value.trim();
    const email = document.getElementById('inputEmailModifica').value.trim();
    const oreContrattuali = parseFloat(document.getElementById('inputOreModifica').value);

    // Validazione
    if (!nome || !cognome) {
      alert('Nome e Cognome sono obbligatori');
      return;
    }

    if (oreContrattuali < 1 || oreContrattuali > 12) {
      alert('Le ore contrattuali devono essere tra 1 e 12');
      return;
    }

    console.log('💾 Salvataggio modifiche per PIN:', pin);

    // Aggiorna nel database
    const { error } = await supabase
      .from('utenti')
      .update({
        nome: nome,
        cognome: cognome,
        email: email || null,
        ore_contrattuali: oreContrattuali
      })
      .eq('pin', parseInt(pin));

    if (error) {
      throw error;
    }

    // Aggiorna anche le timbrature esistenti con i nuovi nome/cognome
    await supabase
      .from('timbrature')
      .update({
        nome: nome,
        cognome: cognome
      })
      .eq('pin', parseInt(pin));

    alert(`✅ Dipendente ${nome} ${cognome} aggiornato con successo!`);

    // Chiudi il modale e ricarica la lista
    chiudiModaleModifica();
    setTimeout(() => location.reload(), 500);

  } catch (error) {
    console.error('❌ Errore nel salvataggio:', error);
    alert('Errore nel salvataggio: ' + (error.message || 'Errore sconosciuto'));
  }
};