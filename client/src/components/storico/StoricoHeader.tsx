import { FileSpreadsheet, FileText, ChevronDown } from "@/lib/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import type { Utente } from '@/services/utenti.service';

interface StoricoHeaderProps {
  dipendente: {
    nome: string;
    cognome: string;
    pin: number;
  };
  /** Dipendenti attivi selezionabili dal titolo. */
  utenti?: Utente[];
  /** Cambio dipendente: naviga allo Storico del PIN scelto. */
  onSelectDipendente?: (pin: number) => void;
  onExportPDF: () => void;
  onExportXLS: () => void;
}

export default function StoricoHeader({
  dipendente,
  utenti = [],
  onSelectDipendente,
  onExportPDF,
  onExportXLS,
}: StoricoHeaderProps) {
  // Ordina i dipendenti per cognome+nome (lista del selettore leggibile).
  const utentiOrdinati = [...utenti].sort((a, b) =>
    `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`, 'it')
  );
  // Il selettore è attivo solo se abbiamo la lista e il callback di navigazione.
  const selettoreAttivo = utentiOrdinati.length > 0 && !!onSelectDipendente;

  // Il nome del dipendente fa da titolo, centrato. Cliccandolo (se il selettore è
  // attivo) si sceglie un altro dipendente e lo Storico naviga sui suoi dati.
  // Export a sinistra, ravvicinate.
  return (
    <div className="relative mb-3 flex-shrink-0 text-center">
      {selettoreAttivo ? (
        <Select
          value={String(dipendente.pin)}
          onValueChange={(v) => onSelectDipendente?.(Number(v))}
        >
          <SelectTrigger
            className="mx-auto inline-flex w-auto items-center gap-2 border-0 bg-transparent p-0 text-2xl font-bold text-[#7A1228] shadow-none hover:opacity-80 focus:ring-0"
            aria-label="Seleziona dipendente"
          >
            <span>
              {dipendente.nome} {dipendente.cognome}
            </span>
            <ChevronDown className="h-5 w-5 text-[#7A1228]" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="z-[80] max-h-72 rounded-xl border border-[rgba(122,18,40,0.18)] bg-white text-[#1C0A10] shadow-lg"
            align="center"
            sideOffset={8}
          >
            {utentiOrdinati.map((u) => (
              <SelectItem
                key={u.pin}
                value={String(u.pin)}
                className="cursor-pointer select-none rounded-md px-3 py-2 pl-8 text-base text-[#1C0A10] outline-none data-[highlighted]:bg-[rgba(122,18,40,0.08)] data-[highlighted]:text-[#1C0A10] data-[state=checked]:bg-[rgba(122,18,40,0.12)]"
              >
                {u.nome} {u.cognome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <h1 className="text-2xl font-bold text-[#7A1228]">
          {dipendente.nome} {dipendente.cognome}
        </h1>
      )}

      {/* Azioni di export: a sinistra del nome, sulla stessa riga, ravvicinate. */}
      <div className="absolute left-0 top-1/2 flex -translate-y-1/2 gap-1.5">
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
