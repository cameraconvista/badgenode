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
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
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
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleSave,
  handleDelete,
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
    <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
      {/* SINISTRA: SOLO ELIMINA */}
      <div className="shrink-0">
        <button
          type="button"
          aria-label="Elimina timbratura"
          className="bn-btn-large bn-btn-danger h-11 px-4 rounded-lg"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading || showDeleteConfirm}
        >
          Elimina
        </button>
      </div>

      {/* DESTRA: ANNULLA + SALVA */}
      <div className="flex items-center gap-3">
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

      {showDeleteConfirm && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Sei sicuro di voler eliminare tutte le timbrature di questo giorno?
            <div className="flex gap-3 mt-3">
              <button 
                className="bn-btn-large bn-btn-danger" 
                onClick={handleDelete} 
                disabled={isLoading}
              >
                Elimina
              </button>
              <button
                className="bn-btn-large bn-btn-neutral"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Annulla
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </ModalKit>
  );
}
