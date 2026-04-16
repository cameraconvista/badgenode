import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, FileText } from 'lucide-react';
import { UtenteInput } from '@/services/utenti.service';

interface FormNuovoDipendenteProps {
  formData: UtenteInput;
  errors: Record<string, string>;
  isLoading: boolean;
  onInputChange: (field: keyof UtenteInput, value: string | number) => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

export default function FormNuovoDipendente({
  formData,
  errors,
  isLoading,
  onInputChange,
  firstInputRef,
}: FormNuovoDipendenteProps) {
  return (
    <div className="space-y-6">
      {/* Sezione Dati Anagrafici */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Dati Anagrafici</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-gray-200">
              Nome *
            </Label>
            <Input
              ref={firstInputRef}
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => onInputChange('nome', e.target.value.toUpperCase())}
              className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.nome ? 'border-red-500' : 'focus:border-violet-400'
              }`}
              disabled={isLoading}
            />
            {errors.nome && <p className="text-sm text-red-400">{errors.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cognome" className="text-gray-200">
              Cognome *
            </Label>
            <Input
              id="cognome"
              type="text"
              value={formData.cognome}
              onChange={(e) => onInputChange('cognome', e.target.value.toUpperCase())}
              className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.cognome ? 'border-red-500' : 'focus:border-violet-400'
              }`}
              disabled={isLoading}
            />
            {errors.cognome && <p className="text-sm text-red-400">{errors.cognome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email ?? ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.email ? 'border-red-500' : 'focus:border-violet-400'
              }`}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-gray-200">
              Numero di Telefono
            </Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono ?? ''}
              onChange={(e) => onInputChange('telefono', e.target.value)}
              placeholder="Non disponibile"
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-400"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-yellow-400 font-bold">
              PIN (1-99) *
            </Label>
            <Input
              id="pin"
              type="text"
              value={formData.pin ? String(formData.pin) : ''}
              placeholder="Inserisci PIN (1-99)"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Solo numeri
                if (value === '') {
                  onInputChange('pin', 0);
                } else {
                  const numValue = parseInt(value);
                  if (numValue >= 1 && numValue <= 99) {
                    onInputChange('pin', numValue);
                  }
                }
              }}
              className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.pin ? 'border-red-500' : 'focus:border-violet-400'
              }`}
              disabled={isLoading}
              maxLength={2}
            />
            {errors.pin && <p className="text-sm text-red-400">{errors.pin}</p>}
          </div>
        </div>
      </div>

      {/* Sezione Contratto Attivo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Contratto Attivo</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descrizione" className="text-gray-200">
              Descrizione Contratto in Corso
            </Label>
            <Textarea
              id="descrizione_contratto"
              value={formData.descrizione_contratto || ''}
              onChange={(e) => onInputChange('descrizione_contratto', e.target.value)}
              placeholder="Inserisci la descrizione del contratto attuale..."
              className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-400 min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ore_contrattuali" className="text-gray-200">
              Ore max giornaliere da contratto *
            </Label>
            <Input
              id="ore_contrattuali"
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              value={formData.ore_contrattuali}
              onChange={(e) => onInputChange('ore_contrattuali', parseFloat(e.target.value) || 0)}
              className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.ore_contrattuali ? 'border-red-500' : 'focus:border-violet-400'
              }`}
              disabled={isLoading}
            />
            {errors.ore_contrattuali && (
              <p className="text-sm text-red-400">{errors.ore_contrattuali}</p>
            )}
          </div>
        </div>
      </div>

      {/* Errore generale */}
      {errors.general && <p className="text-sm text-red-400 text-center">{errors.general}</p>}
    </div>
  );
}
