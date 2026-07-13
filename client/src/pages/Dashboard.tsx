import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, FileText } from '@/lib/icons';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import StoricoFilters from '@/components/storico/StoricoFilters';
import DashboardTable from '@/components/admin/dashboard/DashboardTable';
import { useDashboardTotals } from '@/hooks/useDashboardTotals';
import { UtentiService } from '@/services/utenti.service';
import { useToast } from '@/hooks/use-toast';
import { formatDateLocal } from '@/lib/time';
import { qk } from '@/state/timbrature.cache';

/** Filtri iniziali = mese corrente (come lo Storico). */
function meseCorrente() {
  const today = new Date();
  return {
    dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 1)),
    al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  };
}

export default function Dashboard() {
  const { toast } = useToast();
  const [filters, setFilters] = useState(meseCorrente);

  // Dipendenti attivi (stessa fonte/chiave delle altre sezioni admin).
  const { data: utenti = [], isLoading: isLoadingUtenti } = useQuery({
    queryKey: qk.utenti,
    queryFn: () => UtentiService.getUtenti(),
  });

  const { rows, totali, isLoading: isLoadingTotali, isError } = useDashboardTotals(utenti, filters);
  const isLoading = isLoadingUtenti || isLoadingTotali;

  const handleExportPDF = async () => {
    try {
      const { exportDashboardPDF } = await import('@/hooks/useDashboardExport');
      await exportDashboardPDF({ rows, totali, filters, toast });
    } catch (error) {
      console.error('[Dashboard] Export PDF failed:', error);
    }
  };

  const handleExportXLS = async () => {
    try {
      const { exportDashboardXLS } = await import('@/hooks/useDashboardExport');
      await exportDashboardXLS({ rows, totali, filters, toast });
    } catch (error) {
      console.error('[Dashboard] Export Excel failed:', error);
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="flex h-full flex-col gap-4">
        {/* Header: titolo centrato + export a sinistra (come lo Storico). */}
        <div className="relative mb-1 flex-shrink-0 text-center">
          <h1 className="text-2xl font-bold text-[#7A1228]">Dashboard</h1>
          <div className="absolute left-0 top-1/2 flex -translate-y-1/2 gap-1.5">
            <button onClick={handleExportPDF} className="bn-export-btn" title="Esporta PDF">
              <FileText className="bn-export-icon text-red-600" aria-label="Esporta PDF" />
            </button>
            <button onClick={handleExportXLS} className="bn-export-btn" title="Esporta Excel">
              <FileSpreadsheet className="bn-export-icon text-[#3E7D52]" aria-label="Esporta Excel" />
            </button>
          </div>
        </div>

        {/* Filtri periodo — stesso box dello Storico. */}
        <div className="flex-shrink-0">
          <StoricoFilters
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Tabella riepilogo dipendenti — scrolla SOLO internamente (come le altre sezioni). */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <DashboardTable rows={rows} totali={totali} isLoading={isLoading} isError={isError} />
        </div>
      </div>
    </AdminLayout>
  );
}
