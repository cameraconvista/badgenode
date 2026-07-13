import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import LogoHeader from '@/components/home/LogoHeader';
import PinDisplay from '@/components/home/PinDisplay';
import Keypad from '@/components/home/Keypad';
import { getPinSettings } from '@/services/settings.service';

const UNLOCK_KEY = 'bn_app_unlocked';

/**
 * Gate d'accesso all'app: se il PIN generale è attivo (scope 'general') mostra una
 * schermata col tastierino PRIMA della Home. Superato una volta, lo sblocco resta
 * in sessionStorage per la sessione corrente. Se il PIN è disattivato (default) o
 * la config non è ancora caricata, l'app si apre subito (fallback prudente).
 */
export default function AppPinGate({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'pin', 'general'],
    queryFn: () => getPinSettings('general'),
    staleTime: 60_000,
  });

  const [unlocked, setUnlocked] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(UNLOCK_KEY) === '1',
  );
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Finché non sappiamo lo stato, o se il gate è disattivato, o già sbloccato →
  // mostra l'app. Non blocchiamo mai l'app per un caricamento config.
  if (isLoading || !data?.requirePin || unlocked) {
    return <>{children}</>;
  }

  const submit = (value: string) => {
    if (value === data.pin) {
      sessionStorage.setItem(UNLOCK_KEY, '1');
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
          <p className="mb-2 text-center text-sm font-medium text-[#7A5A64]">
            Inserisci il PIN per accedere
          </p>
          <PinDisplay pin={pin} />
          {error && (
            <p className="mb-1 text-center text-sm font-medium text-red-600">PIN non valido</p>
          )}
          <Keypad onKeyPress={handleKey} onClear={() => setPin('')} onSettings={() => { /* inerte nel gate */ }} />
        </div>
      </div>
    </div>
  );
}
