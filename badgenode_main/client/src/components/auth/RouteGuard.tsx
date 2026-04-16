import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

interface RouteGuardProps {
  children: ReactNode;
}

export function AdminRoute({ children }: RouteGuardProps) {
  const { isAdmin, loading, session } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (!session) {
    setLocation('/login');
    return null;
  }

  if (!isAdmin) {
    setLocation('/');
    return null;
  }

  return <>{children}</>;
}

export function UserRoute({ children }: RouteGuardProps) {
  const { pin, loading, session } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (!session) {
    setLocation('/login');
    return null;
  }

  if (!pin) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-white text-xl font-bold mb-4">PIN non configurato</h2>
          <p className="text-gray-300 mb-4">
            Il tuo account non ha un PIN valido configurato. Contatta l'amministratore per
            configurare il PIN.
          </p>
          <button
            onClick={() => setLocation('/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Torna al Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
