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
  isLoading
}: ModaleTimbratureFormProps) {
  return (
    <div className="space-y-4">
      {/* Entrata */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-400" />
          <h4 className="font-semibold text-green-400">Entrata</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="dataEntrata" className="text-gray-200">Data</Label>
            <Input
              id="dataEntrata"
              type="date"
              value={formData.dataEntrata}
              onChange={(e) => onInputChange('dataEntrata', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-green-400"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oraEntrata" className="text-gray-200">Ora</Label>
            <Input
              id="oraEntrata"
              type="time"
              value={formData.oraEntrata}
              onChange={(e) => onInputChange('oraEntrata', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-green-400"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Uscita */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-400" />
          <h4 className="font-semibold text-red-400">Uscita</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="dataUscita" className="text-gray-200">Data</Label>
            <Input
              id="dataUscita"
              type="date"
              value={formData.dataUscita}
              onChange={(e) => onInputChange('dataUscita', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-red-400"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oraUscita" className="text-gray-200">Ora</Label>
            <Input
              id="oraUscita"
              type="time"
              value={formData.oraUscita}
              onChange={(e) => onInputChange('oraUscita', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white focus:border-red-400"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FormData };
