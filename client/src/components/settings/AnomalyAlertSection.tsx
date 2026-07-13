import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toggle from '@/components/ui/Toggle';
import { useToast } from '@/hooks/use-toast';
import { getAlertConfig, updateAlertConfig, ALERT_DEFAULTS, type AlertConfig } from '@/services/settings.service';

const ALERT_QK = ['settings', 'alert'];

/** Campo orario (HH:MM) con etichetta breve. */
function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#1C0A10]">
      <span className="text-[#7A5A64]">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[rgba(122,18,40,0.25)] bg-[#FDFAF8] px-3 py-2 text-[#1C0A10] focus:border-[#7A1228] focus:outline-none focus:ring-2 focus:ring-[#7A1228]/20"
      />
    </label>
  );
}

export default function AnomalyAlertSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ALERT_QK, queryFn: getAlertConfig });
  const [cfg, setCfg] = useState<AlertConfig>(ALERT_DEFAULTS);

  useEffect(() => {
    if (data) setCfg(data);
  }, [data]);

  const set = (patch: Partial<AlertConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<AlertConfig>) => updateAlertConfig(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALERT_QK });
      // aggiorna anche il calcolo dell'avviso nello Storico
      queryClient.invalidateQueries({ queryKey: ['settings', 'alert'] });
      toast({ title: 'Avviso aggiornato', description: 'Le impostazioni sono state salvate.', duration: 3000 });
    },
    onError: (e: Error) => toast({ title: 'Errore', description: e.message, variant: 'destructive' }),
  });

  const toggle = (enabled: boolean) => {
    set({ enabled });
    saveMutation.mutate({ enabled });
  };

  return (
    <div>
      {/* Toggle principale */}
      <div className="flex items-center gap-3">
        <Toggle checked={cfg.enabled} onChange={toggle} aria-label="Segnala timbrature fuori orario" />
        <span className="font-semibold text-[#1C0A10]">Segnala timbrature fuori orario</span>
      </div>
      <p className="mt-2 text-sm text-[#7A5A64]">
        {cfg.enabled
          ? 'Nello Storico un’icona segnala i giorni con orari fuori dalle fasce qui sotto.'
          : 'Nessuna segnalazione: lo Storico non mostra avvisi sugli orari.'}
      </p>

      {cfg.enabled && (
        <>
          <hr className="my-5 border-t border-[rgba(122,18,40,0.12)]" />

          {/* Entrata: due finestre valide */}
          <h3 className="mb-3 font-bold text-[#7A1228]">Orari di entrata validi</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <TimeField label="dalle" value={cfg.e1_start} onChange={(v) => set({ e1_start: v })} />
              <TimeField label="alle" value={cfg.e1_end} onChange={(v) => set({ e1_end: v })} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm font-medium text-[#7A5A64]">oppure</span>
              <TimeField label="dalle" value={cfg.e2_start} onChange={(v) => set({ e2_start: v })} />
              <TimeField label="alle" value={cfg.e2_end} onChange={(v) => set({ e2_end: v })} />
            </div>
          </div>

          {/* Uscita: sera → notte */}
          <h3 className="mb-3 mt-5 font-bold text-[#7A1228]">Orari di uscita validi</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <TimeField label="dalla sera, dalle" value={cfg.u_evening_from} onChange={(v) => set({ u_evening_from: v })} />
            <TimeField label="fino al mattino, alle" value={cfg.u_night_until} onChange={(v) => set({ u_night_until: v })} />
          </div>

          <button
            type="button"
            onClick={() => saveMutation.mutate(cfg)}
            disabled={saveMutation.isPending}
            className="mt-6 rounded-xl bg-[#3E7D52] px-5 py-3 font-medium text-white transition-colors hover:bg-[#4A9061] disabled:cursor-not-allowed disabled:bg-[rgba(62,125,82,0.35)]"
          >
            {saveMutation.isPending ? 'Salvataggio…' : 'Salva orari'}
          </button>
        </>
      )}
    </div>
  );
}
