import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { UtenteInput } from '@/services/utenti.service';

interface FormModificaDipendenteProps {
  formData: UtenteInput;
  errors: Record<string, string>;
  isLoading: boolean;
  onInputChange: (field: keyof UtenteInput, value: string | number) => void;
  firstInputRef: React.RefObject<HTMLInputElement>;
}

export default function FormModificaDipendente({
  formData,
  errors,
  isLoading,
  onInputChange,
  firstInputRef,
}: FormModificaDipendenteProps) {
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
              onChange={(e) => onInputChange('nome', e.target.value)}
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
              onChange={(e) => onInputChange('cognome', e.target.value)}
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
              className={`bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.telefono ? 'border-red-500' : 'focus:border-violet-400'
              }`}
              disabled={isLoading}
            />
            {errors.telefono && <p className="text-sm text-red-400">{errors.telefono}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-yellow-400 font-bold">
              PIN
            </Label>
            <Input
              id="pin"
              type="number"
              value={formData.pin}
              disabled={true}
              className="bg-gray-600/50 border-gray-500 text-gray-300 cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <p className="text-sm text-gray-400">Il PIN non può essere modificato</p>
          </div>
        </div>
      </div>
      {/* Errore generale */}
      {errors.general && <p className="text-sm text-red-400 text-center">{errors.general}</p>}
    </div>
  );
}
