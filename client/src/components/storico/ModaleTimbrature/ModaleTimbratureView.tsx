import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit, Save, Trash2, X, AlertTriangle } from 'lucide-react';
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
  handleDelete
}: ModaleTimbratureViewProps) {
  const entrata = timbrature.find(t => t.tipo === 'entrata');
  const uscita = timbrature.find(t => t.tipo === 'uscita');
  const nomeCompleto = entrata?.nome && entrata?.cognome 
    ? `${entrata.nome} ${entrata.cognome}` 
    : 'Dipendente';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifica Timbrature - {formatDataItaliana(giornologico)}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {nomeCompleto} (PIN: {entrata?.pin || uscita?.pin})
          </p>
        </DialogHeader>

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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Elimina
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Annulla
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading || showDeleteConfirm}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Salva
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
