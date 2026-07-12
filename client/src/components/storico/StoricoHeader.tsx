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
    <div className="bg-[#F5EBE0] border border-[rgba(122,18,40,0.15)] rounded-lg p-6 flex-shrink-0 relative">
      {/* Azioni di export in alto a destra */}
      <div className="absolute top-4 right-4 flex gap-3">
        <button
          onClick={onExportPDF}
          className="bn-export-btn border border-[rgba(122,18,40,0.20)]"
        >
          <FileText className="bn-export-icon text-red-600" aria-label="Esporta PDF" />
        </button>
        <button
          onClick={onExportXLS}
          className="bn-export-btn border border-[rgba(122,18,40,0.20)]"
        >
          <FileSpreadsheet className="bn-export-icon text-green-700" aria-label="Esporta Excel" />
        </button>
      </div>

      {/* Nome del dipendente selezionato */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-lg font-normal text-[#7A5A64] mb-3">Storico Timbrature</h1>
          <p className="text-[#7A1228] text-3xl font-semibold">
            {dipendente.nome} {dipendente.cognome}
          </p>
        </div>
      </div>
    </div>
  );
}
