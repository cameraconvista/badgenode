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
        <button 
          onClick={handleTorna}
          className="bn-back rounded-xl px-4 py-2 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span className="text-white font-medium">TORNA</span>
        </button>
      </div>

      {/* Pulsanti in alto a destra */}
      <div className="absolute top-4 right-4 flex gap-3">
        <button 
          onClick={onExportPDF}
          className="bn-export-btn border border-white/10"
        >
          <FileText className="bn-export-icon text-red-400" aria-label="Esporta PDF" />
        </button>
        <button 
          onClick={onExportXLS}
          className="bn-export-btn border border-white/10"
        >
          <FileSpreadsheet className="bn-export-icon text-green-400" aria-label="Esporta Excel" />
        </button>
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
