
// Binder robusto per pulsante ingranaggio (index)
(function () {
  function resolveHandler() {
    const candidates = [
      'apriImpostazioni',
      'openSettings',
      'openAdmin',
      'apriAdmin',
      'mostraImpostazioni',
      'openAdminModal',
      'showSettingsModal'
    ];
    for (const name of candidates) {
      if (typeof window[name] === 'function') return window[name];
    }
    return null;
  }

  function bind() {
    const btn = document.getElementById('settings-btn')
      || document.querySelector('.settings-btn, [data-action="settings"]');
    if (!btn) {
      console.warn('[SETTINGS] bottone non trovato');
      return;
    }
    if (btn.__settingsBound) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const handler = resolveHandler();
      if (handler) {
        try { handler(); }
        catch (err) { console.error('[SETTINGS] handler errore:', err); }
      } else {
        console.warn('[SETTINGS] nessun handler globale trovato (apriImpostazioni/openSettings/…).');
        // Fallback: naviga direttamente alla pagina utenti se PIN admin
        const pin = document.getElementById('pin-display')?.textContent?.trim();
        if (pin === '1909') {
          window.location.href = 'utenti.html';
        } else {
          alert('Inserisci il PIN amministratore per accedere alle impostazioni');
        }
      }
    });
    btn.__settingsBound = true;
    console.info('[SETTINGS] click binder agganciato');
  }

  // Aggancia dopo che il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
