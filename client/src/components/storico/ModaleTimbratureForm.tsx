// reserved: api-internal (non rimuovere senza migrazione)
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Clock } from 'lucide-react';

interface FormData {
  dataEntrata: string;
  oraEntrata: string;
  dataUscita: string;
  oraUscita: string;
}

interface ModaleTimbratureFormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  isLoading?: boolean;
}

export default function ModaleTimbratureForm({
  formData,
  onInputChange,
  isLoading,
}: ModaleTimbratureFormProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* ENTRATA */}
      <section>
        <p className="text-green-400 font-semibold mb-2">Entrata</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bn-modal-field">
            <label className="block text-sm text-white/80 mb-1">Data</label>
            <input 
              type="date" 
              className="bn-input w-full text-white" 
              value={formData.dataEntrata} 
              onChange={(e) => onInputChange('dataEntrata', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="bn-modal-field">
            <label className="block text-sm text-white/80 mb-1">Ora</label>
            <input 
              type="time" 
              className="bn-input w-full text-white" 
              value={formData.oraEntrata} 
              onChange={(e) => onInputChange('oraEntrata', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </section>

      {/* USCITA */}
      <section>
        <p className="text-red-400 font-semibold mb-2">Uscita</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bn-modal-field">
            <label className="block text-sm text-white/80 mb-1">Data</label>
            <input 
              type="date" 
              className="bn-input w-full text-white" 
              value={formData.dataUscita} 
              onChange={(e) => onInputChange('dataUscita', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="bn-modal-field">
            <label className="block text-sm text-white/80 mb-1">Ora</label>
            <input 
              type="time" 
              className="bn-input w-full text-white" 
              value={formData.oraUscita} 
              onChange={(e) => onInputChange('oraUscita', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export type { FormData };
