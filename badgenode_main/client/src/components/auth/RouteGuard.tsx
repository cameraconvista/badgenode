import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

interface RouteGuardProps {
  children: ReactNode;
}

export function AdminRoute({ children }: RouteGuardProps) {
  const { isAdmin, loading, session } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!session && location !== '/login') {
      setLocation('/login');
      return;
    }
    if (session && !isAdmin && location !== '/') {
      setLocation('/');
    }
  }, [loading, session, isAdmin, setLocation, location]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F3EE]">
        <div className="text-[#7A5A64]">Caricamento...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

export function UserRoute({ children }: RouteGuardProps) {
  const { pin, loading, session } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!session && location !== '/login') {
      setLocation('/login');
    }
  }, [loading, session, setLocation, location]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F3EE]">
        <div className="text-[#7A5A64]">Caricamento...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!pin) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F3EE]">
        <div className="bg-white border border-[rgba(122,18,40,0.25)] rounded-lg p-6 max-w-md shadow-md">
          <h2 className="text-[#1C0A10] text-xl font-bold mb-4">PIN non configurato</h2>
          <p className="text-[#7A5A64] mb-4">
            Il tuo account non ha un PIN valido configurato. Contatta l'amministratore per
            configurare il PIN.
          </p>
          <button
            onClick={() => setLocation('/login')}
            className="bg-[#7A1228] hover:bg-[#9B1E35] text-white px-4 py-2 rounded"
          >
            Torna al Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
