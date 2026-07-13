import { useState, type ReactNode } from 'react';
import { ChevronDown } from '@/lib/icons';

interface SettingsCardProps {
  title: string;
  subtitle?: string;
  /** Aperta di default? (le altre restano chiuse finché non cliccate) */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Card a comparsa per la pagina Impostazioni: intestazione cliccabile (titolo +
 * sottotitolo + freccia) che apre/chiude il contenuto. Ogni sezione futura è una
 * SettingsCard impilata nella pagina.
 */
export default function SettingsCard({ title, subtitle, defaultOpen = false, children }: SettingsCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(122,18,40,0.15)] bg-white">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
      >
        <div>
          <h2 className="text-lg font-bold text-[#7A1228] md:text-xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-[#7A5A64]">{subtitle}</p>}
        </div>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-[#7A1228] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-[rgba(122,18,40,0.12)] px-5 py-5 md:px-6">
          {children}
        </div>
      )}
    </div>
  );
}
