import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtenteInput } from '@/services/utenti.service';

interface FormDipendenteProps {
  initialData: UtenteInput;
  onSubmit: (data: UtenteInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function FormDipendente({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: FormDipendenteProps) {
  const [formData, setFormData] = useState<UtenteInput>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome obbligatorio';
    }

    if (!formData.cognome.trim()) {
      newErrors.cognome = 'Cognome obbligatorio';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (formData.ore_contrattuali <= 0 || formData.ore_contrattuali > 12) {
      newErrors.ore_contrattuali = 'Ore contrattuali devono essere tra 0.25 e 12';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Errore salvataggio:', error);
      setErrors({ general: 'Errore durante il salvataggio' });
    }
  };

  const handleInputChange = (field: keyof UtenteInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Rimuovi errore quando l'utente inizia a digitare
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          type="text"
          value={formData.nome}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          className={errors.nome ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
      </div>

      {/* Cognome */}
      <div className="space-y-2">
        <Label htmlFor="cognome">Cognome *</Label>
        <Input
          id="cognome"
          type="text"
          value={formData.cognome}
          onChange={(e) => handleInputChange('cognome', e.target.value)}
          className={errors.cognome ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.cognome && <p className="text-sm text-red-500">{errors.cognome}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Telefono */}
      <div className="space-y-2">
        <Label htmlFor="telefono">Telefono</Label>
        <Input
          id="telefono"
          type="tel"
          value={formData.telefono}
          onChange={(e) => handleInputChange('telefono', e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Ore contrattuali */}
      <div className="space-y-2">
        <Label htmlFor="ore_contrattuali">Ore contrattuali *</Label>
        <Input
          id="ore_contrattuali"
          type="number"
          min="0.25"
          max="12"
          step="0.25"
          value={formData.ore_contrattuali}
          onChange={(e) => handleInputChange('ore_contrattuali', parseFloat(e.target.value) || 0)}
          className={errors.ore_contrattuali ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.ore_contrattuali && (
          <p className="text-sm text-red-500">{errors.ore_contrattuali}</p>
        )}
      </div>

      {/* Errore generale */}
      {errors.general && (
        <p className="text-sm text-red-500 text-center">{errors.general}</p>
      )}

      {/* Pulsanti */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annulla
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvataggio...' : 'Salva'}
        </Button>
      </div>
    </form>
  );
}
