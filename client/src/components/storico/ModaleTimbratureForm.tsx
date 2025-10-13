import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

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
    <div className="space-y-6">
      {/* ENTRATA */}
      <section>
        <div className="bn-modal-section-title">Entrata</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bn-modal-field">
            <label>Data</label>
            <input 
              type="date" 
              className="bn-input w-full" 
              value={formData.dataEntrata} 
              onChange={(e) => onInputChange('dataEntrata', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="bn-modal-field">
            <label>Ora</label>
            <input 
              type="time" 
              className="bn-input w-full" 
              value={formData.oraEntrata} 
              onChange={(e) => onInputChange('oraEntrata', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </section>

      {/* USCITA */}
      <section>
        <div className="bn-modal-section-title" style={{color:"#ffb3b3"}}>Uscita</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bn-modal-field">
            <label>Data</label>
            <input 
              type="date" 
              className="bn-input w-full" 
              value={formData.dataUscita} 
              onChange={(e) => onInputChange('dataUscita', e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="bn-modal-field">
            <label>Ora</label>
            <input 
              type="time" 
              className="bn-input w-full" 
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
