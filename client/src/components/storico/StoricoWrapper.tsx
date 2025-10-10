import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import StoricoTimbrature from '@/pages/StoricoTimbrature';
import { UtentiService } from '@/services/utenti.service';

export default function StoricoWrapper() {
  const params = useParams();
  const [, setLocation] = useLocation();
  
  // Query per ottenere il primo utente se PIN non specificato
  const { data: utenti } = useQuery({
    queryKey: ['utenti'],
    queryFn: () => UtentiService.getUtenti(),
    enabled: !params.pin
  });
  
  // Se non c'è PIN nell'URL, reindirizza al primo utente disponibile
  useEffect(() => {
    if (!params.pin && utenti && utenti.length > 0) {
      const primoUtente = utenti[0];
      console.log('🔄 [StoricoWrapper] Nessun PIN specificato, reindirizzo a PIN:', primoUtente.pin);
      setLocation(`/storico-timbrature/${primoUtente.pin}`);
    }
  }, [params.pin, utenti, setLocation]);
  
  const pin = params.pin ? parseInt(params.pin) : undefined;
  
  // Se non c'è PIN e stiamo ancora caricando utenti, mostra loading
  if (!pin && (!utenti || utenti.length === 0)) {
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
  
  return <StoricoTimbrature pin={pin} />;
}
