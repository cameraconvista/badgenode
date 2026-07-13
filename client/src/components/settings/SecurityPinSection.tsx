import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toggle from '@/components/ui/Toggle';
import { Eye, EyeOff } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { getPinSettings, setRequirePin, changePin, type PinScope } from '@/services/settings.service';

/** Campo PIN (numerico, 4 cifre). Con `revealable` mostra l'icona occhio per
 *  vedere/nascondere il PIN digitato. */
function PinField({
  id,
  label,
  value,
  onChange,
  revealable = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  revealable?: boolean;
}) {
  // Campi rivelabili (PIN attuale): oscurati di default, l'occhio permette di rivelare.
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-[#1C0A10]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={revealable && show ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="off"
          pattern="\d*"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className={`w-full rounded-xl border border-[rgba(122,18,40,0.25)] bg-[#FDFAF8] py-3 text-[#1C0A10] focus:border-[#7A1228] focus:outline-none focus:ring-2 focus:ring-[#7A1228]/20 ${
            revealable ? 'pl-4 pr-11' : 'px-4'
          }`}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Nascondi PIN' : 'Mostra PIN'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5A64] hover:text-[#7A1228] focus:outline-none"
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

interface SecurityPinSectionProps {
  /** Scope PIN gestito da questa sezione. */
  scope: PinScope;
  /** Etichetta breve per i messaggi toggle (es. "alle impostazioni", "all'app"). */
  targetLabel: string;
}

export default function SecurityPinSection({ scope, targetLabel }: SecurityPinSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const settingsQk = ['settings', 'pin', scope];

  const { data, isLoading } = useQuery({
    queryKey: settingsQk,
    queryFn: () => getPinSettings(scope),
  });

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const toggleMutation = useMutation({
    mutationFn: (next: boolean) => setRequirePin(scope, next),
    onSuccess: (_r, next) => {
      queryClient.setQueryData(settingsQk, (prev: { requirePin: boolean; pin: string } | undefined) =>
        prev ? { ...prev, requirePin: next } : prev,
      );
      toast({
        title: next ? 'Richiesta PIN attivata' : 'Richiesta PIN disattivata',
        description: next ? `Ora serve il PIN per accedere ${targetLabel}.` : `L'accesso ${targetLabel} è libero, senza PIN.`,
        duration: 3000,
      });
    },
    onError: () => toast({ title: 'Errore', description: 'Impossibile aggiornare il toggle', variant: 'destructive' }),
  });

  const changePinMutation = useMutation({
    mutationFn: () => changePin(scope, currentPin, newPin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQk });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      toast({ title: 'PIN aggiornato', description: 'Il nuovo PIN è attivo.', duration: 3000 });
    },
    onError: (e: Error) =>
      toast({ title: 'Errore', description: e.message || 'Impossibile cambiare il PIN', variant: 'destructive' }),
  });

  const canSubmitPin =
    /^\d{4}$/.test(currentPin) && /^\d{4}$/.test(newPin) && newPin === confirmPin && !changePinMutation.isPending;

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      toast({ title: 'PIN non coincidono', description: 'Il nuovo PIN e la conferma sono diversi.', variant: 'destructive' });
      return;
    }
    changePinMutation.mutate();
  };

  return (
    <div>
      {/* Sezione toggle (titolo/sottotitolo sono nell'intestazione della SettingsCard) */}
      <div className="flex items-center gap-3">
        <Toggle
          checked={data?.requirePin ?? false}
          onChange={(v) => toggleMutation.mutate(v)}
          disabled={isLoading || toggleMutation.isPending}
          aria-label={`Richiedi PIN per accedere ${targetLabel}`}
        />
        <span className="font-semibold text-[#1C0A10]">Richiedi PIN per accedere {targetLabel}</span>
      </div>
      <p className="mt-2 text-sm text-[#7A5A64]">
        {(data?.requirePin ?? false)
          ? `L'accesso ${targetLabel} è protetto: serve il PIN per entrare.`
          : `L'accesso ${targetLabel} è libero, senza PIN.`}
      </p>

      <hr className="my-6 border-t border-[rgba(122,18,40,0.12)]" />

      {/* Sezione cambio PIN */}
      <h2 className="text-xl font-bold text-[#7A1228]">Cambia PIN</h2>
      <form onSubmit={handleChangePin} autoComplete="off" className="mt-4 max-w-md space-y-4">
        <PinField id={`${scope}-current-pin`} label="PIN attuale" value={currentPin} onChange={setCurrentPin} revealable />
        <PinField id={`${scope}-new-pin`} label="Nuovo PIN" value={newPin} onChange={setNewPin} />
        <PinField id={`${scope}-confirm-pin`} label="Conferma nuovo PIN" value={confirmPin} onChange={setConfirmPin} />
        <button
          type="submit"
          disabled={!canSubmitPin}
          className="rounded-xl bg-[#3E7D52] px-5 py-3 font-medium text-white transition-colors hover:bg-[#4A9061] disabled:cursor-not-allowed disabled:bg-[rgba(62,125,82,0.35)]"
        >
          {changePinMutation.isPending ? 'Aggiornamento…' : 'Aggiorna PIN'}
        </button>
      </form>
    </div>
  );
}
