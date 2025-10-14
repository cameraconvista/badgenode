import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface StoricoHeaderProps {
  dipendente: {
    nome: string;
    cognome: string;
    pin: number;
  };
  onExportPDF: () => void;
  onExportXLS: () => void;
}

export default function StoricoHeader({
  dipendente,
  onExportPDF,
  onExportXLS,
}: StoricoHeaderProps) {
  const [, setLocation] = useLocation();

  const handleTorna = () => {
    setLocation('/archivio-dipendenti');
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 flex-shrink-0 relative">
      {/* Pulsante TORNA in alto a sinistra */}
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          onClick={handleTorna}
          className="text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          TORNA
        </Button>
      </div>

      {/* Pulsanti in alto a destra */}
      <div className="absolute top-4 right-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onExportPDF}
          className="border-gray-600 hover:bg-gray-700 p-3"
          size="lg"
        >
          <FileText className="w-18 h-18 text-red-500" />
        </Button>
        <Button
          variant="outline"
          onClick={onExportXLS}
          className="border-gray-600 hover:bg-gray-700 p-3"
          size="lg"
        >
          <FileSpreadsheet className="w-18 h-18 text-green-500" />
        </Button>
      </div>

      {/* Logo centrato */}
      <div className="flex justify-center mb-4">
        <img src="/logo2_app.png" alt="BADGENODE" className="h-10 w-auto" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Storico Timbrature</h1>
          <p className="text-violet-300 text-2xl font-semibold">
            {dipendente.nome} {dipendente.cognome}
          </p>
        </div>
      </div>
    </div>
  );
}
