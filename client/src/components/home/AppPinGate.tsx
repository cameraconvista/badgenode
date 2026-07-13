import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import { getPinSettings } from '@/services/settings.service';

/** Chiave sessionStorage dello sblocco gate PIN app (condivisa col logout). */
export const APP_UNLOCK_KEY = 'bn_app_unlocked';
/** Flag: forza il blocco dell'app dopo un Logout, anche se il PIN app è disattivato. */
export const APP_FORCE_LOCK_KEY = 'bn_app_force_lock';

/**
 * Gate d'accesso all'app: mostra una schermata col tastierino PRIMA della Home
 * quando il PIN generale è attivo (scope 'general') OPPURE dopo un Logout (flag
 * force-lock), anche a PIN disattivato. Superato una volta, lo sblocco resta in
 * sessionStorage per la sessione corrente. Se la config non è ancora caricata,
 * l'app si apre (fallback prudente: mai bloccare per un semplice caricamento).
 */
export default function AppPinGate({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'pin', 'general'],
    queryFn: () => getPinSettings('general'),
    staleTime: 60_000,
  });

  const [unlocked, setUnlocked] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(APP_UNLOCK_KEY) === '1',
  );
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const forceLock = typeof window !== 'undefined' && sessionStorage.getItem(APP_FORCE_LOCK_KEY) === '1';
  // Il gate va mostrato se il PIN app è attivo OPPURE se un Logout ha forzato il blocco.
  const mustLock = (data?.requirePin ?? false) || forceLock;

  // Finché non sappiamo lo stato, o se non serve bloccare, o già sbloccato → app.
  if (isLoading || !mustLock || unlocked) {
    return <>{children}</>;
  }

  const expectedPin = data?.pin ?? '0000';
  const submit = (value: string) => {
    if (value === expectedPin) {
      sessionStorage.setItem(APP_UNLOCK_KEY, '1');
      sessionStorage.removeItem(APP_FORCE_LOCK_KEY); // sblocco: rimuove il force-lock del logout
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleKey = (key: string) => {
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) submit(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center overflow-auto bg-[radial-gradient(ellipse_at_center,_#F5EBE0_0%,_#F0E2D4_50%,_#E8D5C4_100%)] p-3 sm:p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border-2 border-[rgba(122,18,40,0.30)] bg-white p-4 shadow-[0_8px_40px_rgba(122,18,40,0.15)] sm:p-6">
          <LogoHeader />
          <p className="mb-3 text-center text-lg font-bold text-[#7A1228]">
            Inserisci il PIN per accedere a BADGENODE
          </p>
          <PinDisplay pin={pin} />
          {error && (
            <p className="mb-1 text-center text-sm font-medium text-red-600">PIN non valido</p>
          )}
          <Keypad onKeyPress={handleKey} onClear={() => setPin('')} onSettings={() => { /* inerte nel gate */ }} />
        </div>
        {/* Scritta sotto la card, evidente. */}
        <p className="mt-5 text-center text-base font-semibold text-[#7A1228]">
          Inserisci il PIN per accedere a BADGENODE
        </p>
      </div>
    </div>
  );
}
