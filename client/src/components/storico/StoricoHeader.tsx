import { FileSpreadsheet, FileText } from "@/lib/icons";

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
  // Logo, titolo "Storico" e navigazione di ritorno sono forniti dal guscio
  // AdminLayout (sidebar desktop / drawer mobile): qui restano solo il nome del
  // dipendente selezionato e le azioni di export, per evitare duplicazioni.
  return (
    // Stessa struttura del titolo delle altre due sezioni (mb-4 text-center):
    // il nome del dipendente fa da titolo, alla stessa altezza. Export a destra.
    <div className="relative mb-3 flex-shrink-0 text-center">
      <h1 className="text-2xl font-bold text-[#7A1228]">
        {dipendente.nome} {dipendente.cognome}
      </h1>
      {/* Azioni di export: stessa riga del nome (centrate verticalmente sul titolo) */}
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 gap-3">
        <button onClick={onExportPDF} className="bn-export-btn" title="Esporta PDF">
          <FileText className="bn-export-icon text-red-600" aria-label="Esporta PDF" />
        </button>
        <button onClick={onExportXLS} className="bn-export-btn" title="Esporta Excel">
          <FileSpreadsheet className="bn-export-icon text-[#3E7D52]" aria-label="Esporta Excel" />
        </button>
      </div>
    </div>
  );
}
