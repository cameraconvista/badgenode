import { createContext, useContext, useState, ReactNode } from 'react';
// reserved: api-internal (non rimuovere senza migrazione)
// import { useEffect } from 'react';
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
  // TODO(BUSINESS): re-enable Auth when backend ready
  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'mock-user-id',
      email: 'mock@local.dev',
      app_metadata: {},
      user_metadata: {}, // Rimosso PIN hardcoded
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  } as Session;
  const [loading] = useState(false); // Always loaded in mock mode

  // TODO(BUSINESS): re-enable Auth when backend ready
  // useEffect(() => {
  //   // Get initial session
  //   AuthService.getSession().then(setSession);
  //
  //   // Listen for auth changes
  //   const { data: { subscription } } = AuthService.onAuthStateChange((session) => {
  //     setSession(session);
  //     setLoading(false);
  //   });
  //
  //   return () => subscription.unsubscribe();
  // }, []);

  const user = AuthService.getUserInfo(mockSession);
  const isAdmin = AuthService.isAdmin(mockSession);
  const pin = AuthService.getPin(mockSession);

  const login = async (_email: string, _password: string) => {
    // TODO(BUSINESS): re-enable Auth when backend ready
    // Mock login always succeeds and redirects to home
    window.location.href = '/';
  };

  const logout = async () => {
    // TODO(BUSINESS): re-enable Auth when backend ready
    // Mock logout always succeeds
  };

  const value = {
    session: mockSession,
    user,
    loading,
    isAdmin,
    pin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
