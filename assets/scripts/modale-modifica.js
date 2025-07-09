
// modale-modifica.js

export function apriModaleModifica(data, timbratureEntrata, timbratureUscita, pin, timbraturaId) {
  console.log('🔧 Apertura modale modifica per data:', data);
  
  const modal = document.getElementById('modalOverlay');
  const modaleData = document.getElementById('modale-data');
  const modaleEntrata = document.getElementById('modale-entrata');
  const modaleUscita = document.getElementById('modale-uscita');
  
  if (!modal || !modaleData || !modaleEntrata || !modaleUscita) {
    console.error('❌ Elementi modale non trovati');
    return;
  }

  // Imposta la data
  modaleData.value = data;
  
  // Imposta orari esistenti
  if (timbratureEntrata && timbratureEntrata.length > 0) {
    modaleEntrata.value = timbratureEntrata[0].ore.slice(0, 5);
  } else {
    modaleEntrata.value = '';
  }
  
  if (timbratureUscita && timbratureUscita.length > 0) {
    modaleUscita.value = timbratureUscita[timbratureUscita.length - 1].ore.slice(0, 5);
  } else {
    modaleUscita.value = '';
  }

  // Mostra il modale
  modal.style.display = 'flex';
  
  // Gestori eventi
  const btnSalva = document.getElementById('btnSalva');
  const btnElimina = document.getElementById('btnElimina');
  const btnChiudi = document.getElementById('btnChiudi');
  
  // Rimuovi eventi precedenti
  btnSalva.onclick = null;
  btnElimina.onclick = null;
  btnChiudi.onclick = null;
  
  // Salva modifiche
  btnSalva.onclick = async () => {
    await salvaModifiche(data, modaleEntrata.value, modaleUscita.value, pin, timbraturaId);
    chiudiModale();
  };
  
  // Elimina timbrature
  btnElimina.onclick = async () => {
    if (confirm('Sei sicuro di voler eliminare le timbrature di questo giorno?')) {
      await eliminaTimbrature(data, pin);
      chiudiModale();
    }
  };
  
  // Chiudi modale
  btnChiudi.onclick = chiudiModale;
  
  // Chiudi cliccando fuori
  modal.onclick = (e) => {
    if (e.target === modal) {
      chiudiModale();
    }
  };
}

function chiudiModale() {
  const modal = document.getElementById('modalOverlay');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function salvaModifiche(data, entrata, uscita, pin, timbraturaId) {
  try {
    console.log('💾 Salvataggio modifiche per:', { data, entrata, uscita, pin });
    
    const url = 'https://db3cae29-6f00-4872-abaf-3aa3cb08cd7e-00-2v1otxtl8dccv.riker.replit.dev/api/timbrature';
    
    // Se ci sono orari da salvare
    if (entrata || uscita) {
      const promises = [];
      
      if (entrata) {
        promises.push(fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin: pin,
            tipo: 'entrata',
            data: data,
            ore: entrata + ':00',
            giornologico: data
          })
        }));
      }
      
      if (uscita) {
        promises.push(fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin: pin,
            tipo: 'uscita',
            data: data,
            ore: uscita + ':00',
            giornologico: data
          })
        }));
      }
      
      await Promise.all(promises);
    }
    
    // Ricarica i dati
    location.reload();
    
  } catch (error) {
    console.error('❌ Errore nel salvataggio:', error);
    alert('Errore nel salvataggio delle modifiche');
  }
}

async function eliminaTimbrature(data, pin) {
  try {
    console.log('🗑️ Eliminazione timbrature per:', { data, pin });
    
    const url = `https://db3cae29-6f00-4872-abaf-3aa3cb08cd7e-00-2v1otxtl8dccv.riker.replit.dev/api/timbrature/${pin}/${data}`;
    
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Errore nella cancellazione');
    }
    
    // Ricarica i dati
    location.reload();
    
  } catch (error) {
    console.error('❌ Errore nell\'eliminazione:', error);
    alert('Errore nell\'eliminazione delle timbrature');
  }
}
