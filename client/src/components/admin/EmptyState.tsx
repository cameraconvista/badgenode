import { Search, Users } from 'lucide-react';

interface EmptyStateProps {
  hasSearch: boolean;
  searchTerm: string;
}

export default function EmptyState({ hasSearch, searchTerm }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <tr>
        <td colSpan={5} className="text-center py-12">
          <div className="text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2 text-gray-300">Nessun risultato</p>
            <p>Nessun dipendente trovato per "{searchTerm}"</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={5} className="text-center py-12">
        <div className="text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2 text-gray-300">Nessun dipendente</p>
          <p>Non ci sono dipendenti attivi al momento</p>
        </div>
      </td>
    </tr>
  );
}
