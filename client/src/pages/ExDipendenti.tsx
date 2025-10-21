import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Users } from 'lucide-react';
import ExDipendentiTable from '@/components/admin/ExDipendentiTable';
import { useAuth } from '@/contexts/AuthContext';
import { useExDipendentiQuery } from '@/hooks/useExDipendenti';

export default function ExDipendenti() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  
  // Query ex-dipendenti con hook dedicato
  const { data: exDipendenti = [], isLoading, isError } = useExDipendentiQuery();

  const handleBackToArchivio = () => {
    setLocation('/archivio-dipendenti');
  };

  const handleStorico = (pin: number) => {
    // TODO(BUSINESS): Implementare navigazione storico ex-dipendente
    console.log('Storico ex-dipendente PIN:', pin);
  };

  const handleEsporta = (exDipendente: any) => {
    // TODO(BUSINESS): Implementare esportazione dati ex-dipendente
    console.log('Esporta ex-dipendente:', exDipendente);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 overflow-hidden fixed inset-0"
      style={{
        background: 'radial-gradient(ellipse at center, #2d1b3d 0%, #1a0f2e 50%, #0f0a1a 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-[1120px] flex items-center justify-center h-full">
        <div
          className="rounded-3xl p-4 shadow-2xl border-2 w-full h-[90vh] overflow-hidden relative flex flex-col"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)',
          }}
        >
          {/* Header con logo centrato */}
          <div className="flex justify-center mb-4">
            <img src="/logo2_app.png" alt="BADGENODE" className="h-10 w-auto" />
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">Ex-Dipendenti</h1>
            <p className="text-yellow-300 text-base md:text-lg font-medium">
              {exDipendenti.length} ex-dipendenti archiviati
            </p>
          </div>

          <div className="flex-1 overflow-hidden mb-4">
            <ExDipendentiTable
              exDipendenti={exDipendenti}
              isLoading={isLoading}
              isError={isError}
              onStorico={handleStorico}
              onEsporta={handleEsporta}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-3 border-t border-gray-600">
            <Button
              variant="outline"
              onClick={handleBackToArchivio}
              className="flex items-center gap-2 bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Archivio
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // TODO(BUSINESS): Implementare esportazione completa
                  console.log('Esporta tutti ex-dipendenti');
                }}
                className="flex items-center gap-2 bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
              >
                <Users className="w-4 h-4" />
                Esporta Tutti
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
