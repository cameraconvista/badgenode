import ModalKit from '@/components/ui/ModalKit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { formatDataItaliana } from '@/lib/time';
import TimeSelect from './TimeSelect';
import type { FormData, ModaleTimbratureProps } from './types';

interface ModaleTimbratureViewProps extends ModaleTimbratureProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: string[];
  handleSave: () => Promise<void>;
}

export default function ModaleTimbratureView({
  isOpen,
  onClose,
  giornologico,
  timbrature,
  dipendente,
  isLoading,
  formData,
  setFormData,
  errors,
  handleSave,
}: ModaleTimbratureViewProps) {
  const entrata = timbrature.find((t) => t.tipo === 'entrata');
  const uscita = timbrature.find((t) => t.tipo === 'uscita');
  
  // Usa dipendente passato come prop, fallback su timbrature, poi "Sconosciuto"
  const fullName = dipendente?.nome && dipendente?.cognome 
    ? `${dipendente.nome} ${dipendente.cognome}`
    : entrata?.nome && entrata?.cognome 
    ? `${entrata.nome} ${entrata.cognome}` 
    : 'Sconosciuto';

  const title = `Modifica Timbrature — ${formatDataItaliana(giornologico)}`;
  const description = `Dipendente ${fullName} (PIN: ${dipendente?.pin || entrata?.pin || uscita?.pin})`;

  const footer = (
    <div className="flex items-center justify-end gap-3 px-5 py-4">
      <button 
        type="button" 
        aria-label="Annulla"
        className="bn-btn-large bn-btn-neutral h-11 px-4 rounded-lg" 
        onClick={onClose} 
        disabled={isLoading}
      >
        Annulla
      </button>
      <button 
        type="button" 
        aria-label="Salva"
        className="bn-btn-large bn-btn-success h-11 px-5 rounded-lg" 
        onClick={handleSave} 
        disabled={isLoading}
      >
        Salva
      </button>
    </div>
  );

  return (
    <ModalKit 
      open={isOpen} 
      onOpenChange={onClose}
      title={title}
      description={description}
      footer={footer}
      contentClassName="bn-modal-square"
      className="bn-modal-body-scroll"
    >
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="bn-timbrature-grid">
        {/* ENTRATA */}
        <section>
          <h3 className="text-green-400 font-semibold mb-3 text-lg">Entrata</h3>
          <div className="bn-field-row">
            <div>
              <label className="block text-sm text-white/80 mb-2 font-medium">Data</label>
              <input
                type="date"
                value={formData.dataEntrata}
                onChange={(e) => setFormData({ ...formData, dataEntrata: e.target.value })}
                className="bn-field-input bn-entrata-field w-full"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2 font-medium">Ora</label>
              <TimeSelect
                value={formData.oraEntrata}
                onChange={(value) => setFormData({ ...formData, oraEntrata: value })}
                className=""
                disabled={isLoading}
              />
            </div>
          </div>
        </section>

        {/* USCITA */}
        <section>
          <h3 className="text-red-400 font-semibold mb-3 text-lg">Uscita</h3>
          <div className="bn-field-row">
            <div>
              <label className="block text-sm text-white/80 mb-2 font-medium">Data</label>
              <input
                type="date"
                value={formData.dataUscita}
                onChange={(e) => setFormData({ ...formData, dataUscita: e.target.value })}
                className="bn-field-input bn-uscita-field w-full"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2 font-medium">Ora</label>
              <TimeSelect
                value={formData.oraUscita}
                onChange={(value) => setFormData({ ...formData, oraUscita: value })}
                className=""
                disabled={isLoading}
              />
            </div>
          </div>
        </section>
      </div>

    </ModalKit>
  );
}
