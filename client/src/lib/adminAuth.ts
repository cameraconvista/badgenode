// Gestione del "lasciapassare" admin lato client.
//
// Quando l'utente supera il gate admin (o vi accede quando il gate è disattivato),
// salviamo il PIN admin corrente in sessionStorage. Le richieste di scrittura admin
// lo allegano nell'header 'x-admin-pin', che il server verifica (middleware
// requireAdminPin) contro il PIN salvato in DB.
//
// Sicurezza: sessionStorage è per-scheda ed effimero (si svuota alla chiusura).
// Il PIN resta una protezione UI a bassa criticità; questo lo rende però verificato
// anche lato server, non più aggirabile chiamando direttamente l'API senza credenziali.

const ADMIN_PIN_KEY = 'bn_admin_pin';

/** Salva il PIN admin per la sessione corrente (dopo gate superato o accesso diretto). */
export function setAdminPin(pin: string): void {
  try {
    sessionStorage.setItem(ADMIN_PIN_KEY, pin);
  } catch {
    // sessionStorage non disponibile: le scritture admin falliranno con 401,
    // comportamento sicuro (fail-closed).
  }
}

/** Legge il PIN admin salvato, o null se assente. */
export function getAdminPin(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_PIN_KEY);
  } catch {
    return null;
  }
}

/** Rimuove il PIN admin salvato (al logout / uscita dall'area admin). */
export function clearAdminPin(): void {
  try {
    sessionStorage.removeItem(ADMIN_PIN_KEY);
  } catch {
    // no-op
  }
}

/** Header da allegare alle richieste di scrittura admin (vuoto se PIN assente). */
export function adminAuthHeader(): Record<string, string> {
  const pin = getAdminPin();
  return pin ? { 'x-admin-pin': pin } : {};
}
