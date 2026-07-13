import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import StoricoTimbrature from '@/pages/StoricoTimbrature';
import { UtentiService } from '@/services/utenti.service';

export default function StoricoWrapper() {
  const [_match, params] = useRoute('/storico-timbrature/:pin?');
  void _match;
  const [, setLocation] = useLocation();

  // Estrazione robusta del PIN
  const raw = params?.pin;
  const pin = Number(raw);
  const isValidPin = Number.isFinite(pin) && pin > 0;

  // Lista dipendenti attivi: serve sia per il redirect al primo utente (PIN
  // assente) sia per il selettore di dipendente nell'header Storico.
  const { data: utenti } = useQuery({
    queryKey: ['utenti'],
    queryFn: () => UtentiService.getUtenti(),
  });

  // Se PIN non valido, reindirizza al primo utente disponibile
  useEffect(() => {
    if (!isValidPin && utenti && utenti.length > 0) {
      const primoUtente = utenti[0];
      setLocation(`/storico-timbrature/${primoUtente.pin}`);
    }
  }, [isValidPin, raw, utenti, setLocation]);

  // Validazione PIN con log di errore
  if (!isValidPin) {
    if (raw) {
    }

    // Se non c'è PIN e stiamo ancora caricando utenti, mostra loading
    if (!utenti || utenti.length === 0) {
      return (
        <div className="min-h-screen bg-[#F8F3EE] p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/70 border border-[rgba(122,18,40,0.12)] rounded-lg p-8 text-center">
              <span className="text-[#7A5A64]">Caricamento utenti...</span>
            </div>
          </div>
        </div>
      );
    }

    // Se PIN non valido, non renderizzare nulla (il redirect è in corso)
    return null;
  }

  // PIN valido, passa al componente principale.
  // key={pin}: al cambio dipendente (via selettore header → nuova URL) forza il
  // remount così TUTTO lo stato interno (filtri inclusi) si reinizializza sul
  // nuovo PIN — evita che la tabella resti sui dati del dipendente precedente.
  return <StoricoTimbrature key={pin} pin={pin} utenti={utenti ?? []} />;
}
