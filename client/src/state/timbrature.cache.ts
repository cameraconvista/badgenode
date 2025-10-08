import { queryClient } from '@/lib/queryClient';

// Query keys per React Query
export const qk = {
  storicoByPin: (pin: number) => ['timbrature', 'storico', pin],
  totaliByPin: (pin: number) => ['timbrature', 'totali', pin],
  storicoAdmin: ['timbrature', 'storico', 'ALL'],
  totaliAdmin: ['timbrature', 'totali', 'ALL'],
  utenti: ['utenti'],
  exDipendenti: ['ex-dipendenti']
};

// Invalidazioni per dipendente (PIN specifico)
export function invalidateStoricoForPin(pin: number) {
  queryClient.invalidateQueries({ queryKey: qk.storicoByPin(pin) });
  console.debug('🔄 Invalidated storico for PIN:', pin);
}

export function invalidateTotaliForPin(pin: number) {
  queryClient.invalidateQueries({ queryKey: qk.totaliByPin(pin) });
  console.debug('🔄 Invalidated totali for PIN:', pin);
}

// Invalidazioni per admin (globali)
export function invalidateStoricoGlobale() {
  queryClient.invalidateQueries({ queryKey: qk.storicoAdmin });
  console.debug('🔄 Invalidated storico globale');
}

export function invalidateTotaliGlobali() {
  queryClient.invalidateQueries({ queryKey: qk.totaliAdmin });
  console.debug('🔄 Invalidated totali globali');
}

// Invalidazioni liste utenti (per admin)
export function invalidateUtenti() {
  queryClient.invalidateQueries({ queryKey: qk.utenti });
  console.debug('🔄 Invalidated utenti');
}

export function invalidateExDipendenti() {
  queryClient.invalidateQueries({ queryKey: qk.exDipendenti });
  console.debug('🔄 Invalidated ex-dipendenti');
}

// Utility per debounce
export const debounce = (fn: Function, ms = 250) => {
  let timeout: any;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};
