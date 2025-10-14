import ModalKit from '@/components/ui/ModalKit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { formatDataItaliana } from '@/lib/time';
import ModaleTimbratureForm from '../ModaleTimbratureForm';
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
  const nomeCompleto =
    entrata?.nome && entrata?.cognome ? `${entrata.nome} ${entrata.cognome}` : 'Dipendente';

  const title = `Modifica Timbrature — ${formatDataItaliana(giornologico)}`;
  const description = `${nomeCompleto} (PIN: ${entrata?.pin || uscita?.pin})`;

  const footer = (
    <>
      <button
        type="button"
        className="btn-danger"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={isLoading || showDeleteConfirm}
      >
        Elimina
      </button>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-ghost" onClick={onClose} disabled={isLoading}>
          Annulla
        </button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={isLoading}>
          Salva
        </button>
      </div>
    </>
  );

  return (
    <ModalKit 
      open={isOpen} 
      onOpenChange={onClose}
      title={title}
      description={description}
      footer={footer}
      className="space-y-6 overflow-y-auto max-h-[75vh] md:max-h-[70vh]"
    >
      <div className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
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

        <ModaleTimbratureForm
          formData={formData}
          onInputChange={(field, value) => setFormData({ ...formData, [field]: value })}
          isLoading={isLoading}
        />

        {showDeleteConfirm && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sei sicuro di voler eliminare tutte le timbrature di questo giorno?
              <div className="flex gap-2 mt-2">
                <button className="btn-danger" onClick={handleDelete} disabled={isLoading}>
                  Elimina
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Annulla
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </ModalKit>
  );
}
