import { Button } from '@/components/ui/button';
import { Download, FileText, User, Clock } from 'lucide-react';

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
    <div className="bg-gray-800/50 rounded-lg p-6 flex-shrink-0">
      {/* Logo centrato */}
      <div className="flex justify-center mb-4">
        <img 
          src="/logo2_app.png" 
          alt="BADGENODE" 
          className="h-10 w-auto"
        />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Storico Timbrature</h1>
            <p className="text-gray-200 text-base">
              <User className="w-4 h-4 inline mr-1" />
              {dipendente.nome} {dipendente.cognome} (PIN: {dipendente.pin})
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onExportPDF}
            className="border-gray-600 hover:bg-gray-700 p-3"
            size="sm"
          >
            <FileText className="w-6 h-6 text-red-500" />
          </Button>
          <Button
            variant="outline"
            onClick={onExportXLS}
            className="border-gray-600 hover:bg-gray-700 p-3"
            size="sm"
          >
            <Download className="w-6 h-6 text-green-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
