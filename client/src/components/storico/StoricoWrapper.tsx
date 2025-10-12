import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import StoricoTimbrature from '@/pages/StoricoTimbrature';
import { UtentiService } from '@/services/utenti.service';

export default function StoricoWrapper() {
  const [match, params] = useRoute('/storico-timbrature/:pin');
  const [, setLocation] = useLocation();

  // Estrazione robusta del PIN
  const raw = params?.pin;
  const pin = Number(raw);
  const isValidPin = Number.isFinite(pin) && pin > 0;

  // Query per ottenere il primo utente se PIN non specificato o non valido
  const { data: utenti } = useQuery({
    queryKey: ['utenti'],
    queryFn: () => UtentiService.getUtenti(),
    enabled: !isValidPin,
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
        <div className="min-h-screen bg-gray-900 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800/50 rounded-lg p-8 text-center">
              <span className="text-gray-300">Caricamento utenti...</span>
            </div>
          </div>
        </div>
      );
    }

    // Se PIN non valido, non renderizzare nulla (il redirect è in corso)
    return null;
  }

  // PIN valido, passa al componente principale
  return <StoricoTimbrature pin={pin} />;
}
