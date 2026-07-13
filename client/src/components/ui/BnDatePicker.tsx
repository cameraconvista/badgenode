import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { it } from 'date-fns/locale';
import { Calendar } from '@/lib/icons';
import { formatDateLocal } from '@/lib/time';
import 'react-day-picker/dist/style.css';
import '@/styles/bn-datepicker.css';

/** YYYY-MM-DD → GG/MM/AAAA (formato mostrato nel campo, familiare all'utente). */
function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

interface BnDatePickerProps {
  /** Data corrente in formato YYYY-MM-DD (stesso di <input type="date">). */
  value: string;
  /** Riceve la nuova data in formato YYYY-MM-DD (drop-in dell'input nativo). */
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Date-picker coerente col tema (bordeaux/crema), identico su ogni dispositivo e
 * touch-friendly. Sostituisce `<input type="date">` mantenendone l'interfaccia:
 * value/onChange lavorano su stringhe YYYY-MM-DD, così le logiche a valle non
 * cambiano.
 *
 * Apertura controllata a mano (onClick sul button, non Popover.Trigger): dentro
 * un Radix Dialog (modale Timbrature) il Trigger Radix veniva neutralizzato dal
 * focus-trap del Dialog; un onClick React normale scatta sempre. Popover.Anchor
 * àncora il calendario al campo; il Portal lo rende sopra a tutto (z-index alto).
 */
export default function BnDatePicker({
  value,
  onChange,
  id,
  disabled,
  className,
  'aria-label': ariaLabel,
}: BnDatePickerProps) {
  const [open, setOpen] = useState(false);

  // Stringa YYYY-MM-DD → Date (mezzogiorno locale per evitare slittamenti di fuso).
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;

  const handleSelect = (day?: Date) => {
    if (!day) return;
    onChange(formatDateLocal(day));
    setOpen(false);
  };

  // Etichetta nel campo (es. "02/07/2026"); vuoto se nessuna data.
  const label = value ? toDisplayDate(value) : '';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <button
          type="button"
          id={id}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`bn-datepicker-trigger ${className ?? ''}`}
        >
          <Calendar className="bn-datepicker-trigger__icon" />
          <span className={value ? 'bn-datepicker-trigger__value' : 'bn-datepicker-trigger__placeholder'}>
            {label || 'Seleziona data'}
          </span>
        </button>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="bn-datepicker-popover"
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DayPicker
            mode="single"
            required={false}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            locale={it}
            weekStartsOn={1}
            showOutsideDays
            fixedWeeks
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
