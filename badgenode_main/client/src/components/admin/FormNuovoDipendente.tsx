import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, FileText } from "@/lib/icons";
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
              onChange={(e) => onInputChange('nome', e.target.value.toUpperCase())}
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
              onChange={(e) => onInputChange('cognome', e.target.value.toUpperCase())}
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
              placeholder="Non disponibile"
              className="bg-[#FDFAF8] border-[rgba(122,18,40,0.25)] text-[#1C0A10] placeholder:text-[#7A5A64]/60 focus:border-[#7A1228]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-[#7A1228] font-bold">
              PIN (1-99) *
            </Label>
            <Input
              id="pin"
              type="text"
              value={formData.pin ? String(formData.pin) : ''}
              placeholder="Inserisci PIN (1-99)"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value === '') {
                  onInputChange('pin', 0);
                } else {
                  const numValue = parseInt(value);
                  if (numValue >= 1 && numValue <= 99) {
                    onInputChange('pin', numValue);
                  }
                }
              }}
              className={`bg-[#FDFAF8] text-[#1C0A10] placeholder:text-[#7A5A64]/60 ${
                errors.pin ? 'border-red-500' : 'border-[rgba(122,18,40,0.25)] focus:border-[#7A1228]'
              }`}
              disabled={isLoading}
              maxLength={2}
            />
            {errors.pin && <p className="text-sm text-red-600">{errors.pin}</p>}
          </div>
        </div>
      </div>

      {/* Sezione Contratto Attivo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-[#7A1228]" />
          <h3 className="text-lg font-semibold text-[#1C0A10]">Contratto Attivo</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descrizione" className="text-[#1C0A10]">
              Descrizione Contratto in Corso
            </Label>
            <Textarea
              id="descrizione_contratto"
              value={formData.descrizione_contratto || ''}
              onChange={(e) => onInputChange('descrizione_contratto', e.target.value)}
              placeholder="Inserisci la descrizione del contratto attuale..."
              className="bg-[#FDFAF8] border-[rgba(122,18,40,0.25)] text-[#1C0A10] placeholder:text-[#7A5A64]/60 focus:border-[#7A1228] min-h-[80px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ore_contrattuali" className="text-[#1C0A10]">
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
              className={`bg-[#FDFAF8] text-[#1C0A10] placeholder:text-[#7A5A64]/60 ${
                errors.ore_contrattuali ? 'border-red-500' : 'border-[rgba(122,18,40,0.25)] focus:border-[#7A1228]'
              }`}
              disabled={isLoading}
            />
            {errors.ore_contrattuali && (
              <p className="text-sm text-red-600">{errors.ore_contrattuali}</p>
            )}
          </div>
        </div>
      </div>

      {/* Errore generale */}
      {errors.general && <p className="text-sm text-red-600 text-center">{errors.general}</p>}
    </div>
  );
}
