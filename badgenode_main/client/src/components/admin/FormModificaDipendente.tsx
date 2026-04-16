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
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-[#7A1228]" />
          <h3 className="text-lg font-semibold text-[#1C0A10]">Dati Anagrafici</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-[#1C0A10]">
              Nome *
            </Label>
            <Input
              ref={firstInputRef}
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => onInputChange('nome', e.target.value)}
              className={`bg-[#FDFAF8] text-[#1C0A10] placeholder:text-[#7A5A64]/60 ${
                errors.nome ? 'border-red-500' : 'border-[rgba(122,18,40,0.25)] focus:border-[#7A1228]'
              }`}
              disabled={isLoading}
            />
            {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cognome" className="text-[#1C0A10]">
              Cognome *
            </Label>
            <Input
              id="cognome"
              type="text"
              value={formData.cognome}
              onChange={(e) => onInputChange('cognome', e.target.value)}
              className={`bg-[#FDFAF8] text-[#1C0A10] placeholder:text-[#7A5A64]/60 ${
                errors.cognome ? 'border-red-500' : 'border-[rgba(122,18,40,0.25)] focus:border-[#7A1228]'
              }`}
              disabled={isLoading}
            />
            {errors.cognome && <p className="text-sm text-red-600">{errors.cognome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#1C0A10]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email ?? ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              className={`bg-[#FDFAF8] text-[#1C0A10] placeholder:text-[#7A5A64]/60 ${
                errors.email ? 'border-red-500' : 'border-[rgba(122,18,40,0.25)] focus:border-[#7A1228]'
              }`}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-[#1C0A10]">
              Numero di Telefono
            </Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono ?? ''}
              onChange={(e) => onInputChange('telefono', e.target.value)}
              className={`bg-[#FDFAF8] text-[#1C0A10] placeholder:text-[#7A5A64]/60 ${
                errors.telefono ? 'border-red-500' : 'border-[rgba(122,18,40,0.25)] focus:border-[#7A1228]'
              }`}
              disabled={isLoading}
            />
            {errors.telefono && <p className="text-sm text-red-600">{errors.telefono}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-[#7A1228] font-bold">
              PIN
            </Label>
            <Input
              id="pin"
              type="number"
              value={formData.pin}
              disabled={true}
              className="bg-[#E8DDD5] border-[rgba(122,18,40,0.15)] text-[#7A5A64] cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <p className="text-sm text-[#7A5A64]">Il PIN non può essere modificato</p>
          </div>
        </div>
      </div>
      {errors.general && <p className="text-sm text-red-600 text-center">{errors.general}</p>}
    </div>
  );
}
