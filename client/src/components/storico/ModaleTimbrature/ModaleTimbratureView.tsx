import ModalKit from '@/components/ui/ModalKit';
import BnDatePicker from '@/components/ui/BnDatePicker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from "@/lib/icons";
import ConfirmFullscreen from '@/components/ui/ConfirmFullscreen';
import { toInputDate } from '@/lib/dateFmt';
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
  giorno_logico,
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

  const title = (
    <div>
      <span className="block text-center text-[#1C0A10]">Modifica Timbrature</span>
      <span className="block text-center">{fullName}</span>
    </div>
  );

  // Footer rimosso - pulsanti ora nel body

  return (
    <ModalKit
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      contentClassName="bn-modal-square"
      className="bn-modal-body-scroll"
      preventDismiss
      hideClose
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
          <h3 className="text-[#3E7D52] font-semibold mb-2 text-lg">Entrata</h3>
          <div className="bn-field-row">
            <div>
              <label className="block text-sm text-[#7A5A64] mb-1 font-medium">Data</label>
              <BnDatePicker
                aria-label="Data entrata"
                value={toInputDate(formData.dataEntrata)}
                onChange={(v) => setFormData({ ...formData, dataEntrata: v })}
                className="bn-entrata-field"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm text-[#7A5A64] mb-1 font-medium">Ora</label>
              <TimeSelect
                value={formData.oraEntrata}
                onChange={(value) => setFormData({ ...formData, oraEntrata: value })}
                className="justify-end"
                disabled={isLoading}
              />
            </div>
          </div>
        </section>

        {/* USCITA */}
        <section>
          <h3 className="text-red-700 font-semibold mb-2 text-lg">Uscita</h3>
          <div className="bn-field-row">
            <div>
              <label className="block text-sm text-[#7A5A64] mb-1 font-medium">Data</label>
              <BnDatePicker
                aria-label="Data uscita"
                value={toInputDate(formData.dataUscita)}
                onChange={(v) => setFormData({ ...formData, dataUscita: v })}
                className="bn-uscita-field"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm text-[#7A5A64] mb-1 font-medium">Ora</label>
              <TimeSelect
                value={formData.oraUscita}
                onChange={(value) => setFormData({ ...formData, oraUscita: value })}
                className="justify-end"
                disabled={isLoading}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Tutti i pulsanti sulla stessa riga — footer con linea orizzontale
          (border-top esteso ai bordi del body via margini negativi, coerente
          con bn-admin-modal__footer). */}
      <div className="flex items-center justify-between mt-4 -mx-5 px-5 pt-4 border-t border-[rgba(122,18,40,0.12)]">
        <button
          type="button"
          className="bn-btn-large bn-btn-danger h-11 px-4 rounded-lg"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading || showDeleteConfirm}
        >
          Elimina
        </button>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Annulla"
            className="bn-btn-large bn-modal-btn-cancel h-11 px-4 rounded-lg"
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

      {showDeleteConfirm && (
        <ConfirmFullscreen
          open={showDeleteConfirm}
          title="Eliminare tutte le timbrature di questo giorno?"
          description={`Dipendente: ${fullName} (PIN: ${dipendente?.pin || entrata?.pin || uscita?.pin}) • Giorno logico: ${giorno_logico}`}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            await handleDelete();
            setShowDeleteConfirm(false);
          }}
        />
      )}

    </ModalKit>
  );
}
