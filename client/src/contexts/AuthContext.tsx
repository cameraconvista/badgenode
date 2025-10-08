import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthService, AuthUser } from '@/services/auth.service';

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  pin: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    AuthService.getSession().then(setSession);

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const user = AuthService.getUserInfo(session);
  const isAdmin = AuthService.isAdmin(session);
  const pin = AuthService.getPin(session);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    pin,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
