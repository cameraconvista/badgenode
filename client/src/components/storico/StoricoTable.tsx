import { Edit, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Timbratura, 
  expandDaysRange, 
  computeOreLavoratePerGiorno, 
  computeOreExtra,
  formatOre,
  formatDataBreve,
  getMeseItaliano
} from '@/lib/time';
import StoricoTotalsBar from './StoricoTotalsBar';

interface StoricoTableProps {
  timbrature: Timbratura[];
  filters: { dal: string; al: string };
  oreContrattuali: number;
  onEditTimbrature: (giornologico: string) => void;
  isLoading?: boolean;
}

interface GiornoData {
  giornologico: string;
  timbrature: Timbratura[];
  entrata?: string;
  uscita?: string;
  oreLavorate: number;
  oreExtra: number;
  hasTimbrature: boolean;
}

export default function StoricoTable({ 
  timbrature, 
  filters, 
  oreContrattuali, 
  onEditTimbrature, 
  isLoading 
}: StoricoTableProps) {
  
  // Raggruppa timbrature per giorno logico
  const timbratureByDate = new Map<string, Timbratura[]>();
  for (const t of timbrature) {
    const key = t.giornologico;
    if (!timbratureByDate.has(key)) {
      timbratureByDate.set(key, []);
    }
    timbratureByDate.get(key)!.push(t);
  }

  // Genera tutti i giorni del periodo (anche senza timbrature)
  const allDays = expandDaysRange(filters.dal, filters.al);
  
  // Prepara dati per ogni giorno
  const giorni: GiornoData[] = allDays.map(giorno => {
    const timbratureGiorno = timbratureByDate.get(giorno) || [];
    const entrate = timbratureGiorno.filter(t => t.tipo === 'entrata').sort((a, b) => a.ore.localeCompare(b.ore));
    const uscite = timbratureGiorno.filter(t => t.tipo === 'uscita').sort((a, b) => b.ore.localeCompare(a.ore));
    
    const oreLavorate = timbratureGiorno.length > 0 ? computeOreLavoratePerGiorno(timbratureGiorno) : 0;
    const oreExtra = computeOreExtra(oreLavorate, oreContrattuali);
    
    return {
      giornologico: giorno,
      timbrature: timbratureGiorno,
      entrata: entrate.length > 0 ? entrate[0].ore.substring(0, 5) : undefined,
      uscita: uscite.length > 0 ? uscite[0].ore.substring(0, 5) : undefined,
      oreLavorate,
      oreExtra,
      hasTimbrature: timbratureGiorno.length > 0
    };
  });

  // Calcola totali mensili
  const totaleMensileOre = giorni.reduce((sum, g) => sum + g.oreLavorate, 0);
  const totaleMensileExtra = giorni.reduce((sum, g) => sum + g.oreExtra, 0);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <Clock className="w-6 h-6 text-violet-400 animate-spin mr-2" />
          <span className="text-gray-300">Caricamento storico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header fisso */}
      <div className="bg-gray-700/50 border-b border-gray-600 flex-shrink-0">
        <div className="grid grid-cols-7 gap-4 p-4 text-white font-semibold text-base">
          <div>Data</div>
          <div>Mese</div>
          <div className="text-center">Entrata</div>
          <div className="text-center">Uscita</div>
          <div className="text-right tabular-nums">Ore</div>
          <div className="text-right tabular-nums">Extra</div>
          <div className="text-center">Modifica</div>
        </div>
      </div>
      
      {/* Body scrollabile */}
      <div className="flex-1 overflow-y-auto">
        {giorni.map((giorno, index) => (
          <div 
            key={giorno.giornologico}
            className={`
              grid grid-cols-7 gap-4 p-4 border-b border-gray-600/50 text-base
              ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-700/30'}
              ${!giorno.hasTimbrature ? 'opacity-60' : ''}
              hover:bg-gray-600/30 transition-colors
            `}
          >
            {/* Data */}
            <div className="font-medium text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDataBreve(giorno.giornologico)}
            </div>
            
            {/* Mese */}
            <div className="text-white">
              {getMeseItaliano(giorno.giornologico)}
            </div>
            
            {/* Entrata */}
            <div className="text-center">
              {giorno.entrata ? (
                <span className="text-white font-medium">{giorno.entrata}</span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            
            {/* Uscita */}
            <div className="text-center">
              {giorno.uscita ? (
                <span className="text-white font-medium">{giorno.uscita}</span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            
            {/* Ore Lavorate */}
            <div className="text-right tabular-nums">
              {giorno.oreLavorate > 0 ? (
                <span className="text-white font-medium">{formatOre(giorno.oreLavorate)}</span>
              ) : (
                <span className="text-gray-500">0.00</span>
              )}
            </div>
            
            {/* Ore Extra */}
            <div className="text-right tabular-nums">
              {giorno.oreExtra > 0 ? (
                <span className="text-yellow-400 font-bold">{formatOre(giorno.oreExtra)}</span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            
            {/* Modifica */}
            <div className="text-center">
              {giorno.hasTimbrature ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTimbrature(giorno.giornologico)}
                  className="text-violet-400 hover:text-violet-300 hover:bg-violet-400/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer fisso - Totali Mensili */}
      <StoricoTotalsBar
        totaleMensileOre={totaleMensileOre}
        totaleMensileExtra={totaleMensileExtra}
        giorniLavorati={giorni.filter(g => g.hasTimbrature).length}
      />
    </div>
  );
}
