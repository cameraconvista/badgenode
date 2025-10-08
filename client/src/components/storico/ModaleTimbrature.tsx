import { useState, useEffect } from 'react';
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
import { Timbratura, formatDataItaliana } from '@/lib/time';
import { validateTimbratura } from '@/lib/validation';
import ModaleTimbratureForm, { FormData } from './ModaleTimbratureForm';

interface ModaleTimbratureProps {
  isOpen: boolean;
  onClose: () => void;
  giornologico: string;
  timbrature: Timbratura[];
  onSave: (updates: {
    dataEntrata: string;
    oraEntrata: string;
    dataUscita: string;
    oraUscita: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

// FormData moved to ModaleTimbratureForm.tsx

export default function ModaleTimbrature({
  isOpen,
  onClose,
  giornologico,
  timbrature,
  onSave,
  onDelete,
  isLoading
}: ModaleTimbratureProps) {
  const [formData, setFormData] = useState<FormData>({
    dataEntrata: '',
    oraEntrata: '',
    dataUscita: '',
    oraUscita: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inizializza form con dati esistenti
  useEffect(() => {
    if (isOpen && timbrature.length > 0) {
      const entrate = timbrature.filter(t => t.tipo === 'entrata').sort((a, b) => a.ore.localeCompare(b.ore));
      const uscite = timbrature.filter(t => t.tipo === 'uscita').sort((a, b) => b.ore.localeCompare(a.ore));
      
      setFormData({
        dataEntrata: entrate.length > 0 ? entrate[0].data : giornologico,
        oraEntrata: entrate.length > 0 ? entrate[0].ore.substring(0, 5) : '',
        dataUscita: uscite.length > 0 ? uscite[0].data : giornologico,
        oraUscita: uscite.length > 0 ? uscite[0].ore.substring(0, 5) : ''
      });
      setErrors([]);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, timbrature, giornologico]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Pulisci errori quando l'utente modifica
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Verifica campi obbligatori
    if (!formData.dataEntrata || !formData.oraEntrata) {
      newErrors.push('Data e ora entrata sono obbligatorie');
    }
    if (!formData.dataUscita || !formData.oraUscita) {
      newErrors.push('Data e ora uscita sono obbligatorie');
    }

    if (newErrors.length === 0) {
      // Crea timbrature temporanee per validazione
      const entrataTemp: Timbratura = {
        id: 'temp-entrata',
        pin: timbrature[0]?.pin || 0,
        tipo: 'entrata',
        data: formData.dataEntrata,
        ore: formData.oraEntrata + ':00',
        giornologico: giornologico,
        nome: timbrature[0]?.nome || '',
        cognome: timbrature[0]?.cognome || '',
        created_at: new Date().toISOString()
      };

      const uscitaTemp: Timbratura = {
        id: 'temp-uscita',
        pin: timbrature[0]?.pin || 0,
        tipo: 'uscita',
        data: formData.dataUscita,
        ore: formData.oraUscita + ':00',
        giornologico: giornologico,
        nome: timbrature[0]?.nome || '',
        cognome: timbrature[0]?.cognome || '',
        created_at: new Date().toISOString()
      };

      // Valida coerenza business
      const validation = validateTimbratura(entrataTemp, uscitaTemp);
      if (!validation.valid) {
        newErrors.push(...validation.errors);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave({
        dataEntrata: formData.dataEntrata,
        oraEntrata: formData.oraEntrata,
        dataUscita: formData.dataUscita,
        oraUscita: formData.oraUscita
      });
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Errore durante il salvataggio']);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Errore durante l\'eliminazione']);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-violet-300">
            <Edit className="w-5 h-5" />
            Modifica Timbrature
          </DialogTitle>
          <p className="text-gray-300 text-sm">
            Giorno logico: <strong>{formatDataItaliana(giornologico)}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Errori */}
          {errors.length > 0 && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300">
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
            onInputChange={handleInputChange}
            isLoading={isLoading}
          />
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Conferma
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                >
                  Annulla
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Chiudi
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salva
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
