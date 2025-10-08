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
  // TODO: re-enable Auth when backend ready
  // Mock session for development without Supabase
  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'mock-user-id',
      email: 'mock@local.dev',
      app_metadata: {},
      user_metadata: { pin: 7 },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    }
  } as Session;

  const [session] = useState<Session | null>(mockSession);
  const [loading] = useState(false); // Always loaded in mock mode

  // TODO: re-enable Auth when backend ready
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

  const user = AuthService.getUserInfo(session);
  const isAdmin = AuthService.isAdmin(session);
  const pin = AuthService.getPin(session);

  const login = async (email: string, password: string) => {
    // TODO: re-enable Auth when backend ready
    console.log('Mock login:', email, password);
    // Mock login always succeeds and redirects to home
    window.location.href = '/';
  };

  const logout = async () => {
    // TODO: re-enable Auth when backend ready
    console.log('Mock logout');
    // Mock logout always succeeds
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
