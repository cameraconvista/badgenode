import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';

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
  onExportXLS 
}: StoricoHeaderProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-6 flex-shrink-0 relative">
      {/* Pulsanti in alto a destra */}
      <div className="absolute top-4 right-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onExportPDF}
          className="border-gray-600 hover:bg-gray-700 p-3"
          size="lg"
        >
          <FileText className="w-12 h-12 text-red-500" />
        </Button>
        <Button
          variant="outline"
          onClick={onExportXLS}
          className="border-gray-600 hover:bg-gray-700 p-3"
          size="lg"
        >
          <FileSpreadsheet className="w-12 h-12 text-green-500" />
        </Button>
      </div>

      {/* Logo centrato */}
      <div className="flex justify-center mb-4">
        <img 
          src="/logo2_app.png" 
          alt="BADGENODE" 
          className="h-10 w-auto"
        />
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
