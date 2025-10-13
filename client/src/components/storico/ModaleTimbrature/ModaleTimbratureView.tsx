// reserved: api-internal (non rimuovere senza migrazione)
// import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  // DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
// reserved: api-internal (non rimuovere senza migrazione)
// import { Edit, Save, Trash2, X } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bn-modal w-full max-w-[720px] md:max-w-[800px] lg:max-w-[880px] xl:max-w-[960px] mx-auto p-0">
        <DialogTitle className="sr-only">
          Modifica Timbrature — {formatDataItaliana(giornologico)}
        </DialogTitle>
        
        <DialogDescription className="sr-only">
          Modifica orari di entrata e uscita per la giornata selezionata.
        </DialogDescription>

        <div className="bn-modal-header flex justify-between items-center">
          <div>
            <h3 className="bn-modal-title">Modifica Timbrature — {formatDataItaliana(giornologico)}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {nomeCompleto} (PIN: {entrata?.pin || uscita?.pin})
            </p>
          </div>
          <button 
            className="text-white/60 hover:text-white transition-colors text-lg font-bold" 
            onClick={onClose} 
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="bn-modal-body space-y-6 overflow-y-auto max-h-[75vh] md:max-h-[70vh] px-2 sm:px-4 md:px-6 lg:px-8">
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
        </div>

        {showDeleteConfirm && (
          <div className="bn-modal-body px-4 sm:px-6 md:px-8">
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
          </div>
        )}

        <div className="bn-modal-footer px-4 sm:px-6 md:px-8">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
