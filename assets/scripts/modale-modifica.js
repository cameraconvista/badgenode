
// modale-modifica.js

export function apriModaleModifica(data, timbratureEntrata, timbratureUscita, pin, timbraturaId) {
  console.log('🔧 Apertura modale modifica per data:', data);
  
  const modal = document.getElementById('modalOverlay');
  const modaleDataEntrata = document.getElementById('modale-data-entrata');
  const modaleDataUscita = document.getElementById('modale-data-uscita');
  const modaleEntrata = document.getElementById('modale-entrata');
  const modaleUscita = document.getElementById('modale-uscita');
  
  if (!modal || !modaleDataEntrata || !modaleDataUscita || !modaleEntrata || !modaleUscita) {
    console.error('❌ Elementi modale non trovati');
    return;
  }

  // Imposta le date e orari esistenti
  if (timbratureEntrata && timbratureEntrata.length > 0) {
    modaleDataEntrata.value = timbratureEntrata[0].giornologico || timbratureEntrata[0].data || data;
    modaleEntrata.value = timbratureEntrata[0].ore.slice(0, 5);
  } else {
    modaleDataEntrata.value = data;
    modaleEntrata.value = '';
  }
  
  if (timbratureUscita && timbratureUscita.length > 0) {
    modaleDataUscita.value = timbratureUscita[timbratureUscita.length - 1].giornologico || timbratureUscita[timbratureUscita.length - 1].data || data;
    modaleUscita.value = timbratureUscita[timbratureUscita.length - 1].ore.slice(0, 5);
  } else {
    modaleDataUscita.value = data;
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
    await salvaModifiche(
      modaleDataEntrata.value, 
      modaleEntrata.value, 
      modaleDataUscita.value, 
      modaleUscita.value, 
      pin, 
      timbraturaId,
      data // data originale per eventuali cancellazioni
    );
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

async function salvaModifiche(dataEntrata, oraEntrata, dataUscita, oraUscita, pin, timbraturaId, dataOriginale) {
  try {
    console.log('💾 Salvataggio modifiche per:', { dataEntrata, oraEntrata, dataUscita, oraUscita, pin });
    
    const url = 'https://db3cae29-6f00-4872-abaf-3aa3cb08cd7e-00-2v1otxtl8dccv.riker.replit.dev/api/timbrature';
    
    // Prima elimina le timbrature esistenti per la data originale
    if (dataOriginale) {
      try {
        const deleteUrl = `https://db3cae29-6f00-4872-abaf-3aa3cb08cd7e-00-2v1otxtl8dccv.riker.replit.dev/api/timbrature/${pin}/${dataOriginale}`;
        await fetch(deleteUrl, { method: 'DELETE' });
      } catch (deleteError) {
        console.warn('⚠️ Errore nella cancellazione delle timbrature esistenti:', deleteError);
      }
    }
    
    // Salva le nuove timbrature se presenti
    const promises = [];
    
    if (oraEntrata && dataEntrata) {
      promises.push(fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin,
          tipo: 'entrata',
          data: dataEntrata,
          ore: oraEntrata + ':00',
          giornologico: dataEntrata
        })
      }));
    }
    
    if (oraUscita && dataUscita) {
      promises.push(fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin,
          tipo: 'uscita',
          data: dataUscita,
          ore: oraUscita + ':00',
          giornologico: dataUscita
        })
      }));
    }
    
    if (promises.length > 0) {
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
