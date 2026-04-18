import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { AuthService, AuthUser } from '@/services/auth.service';
import { isAuthBypassEnabled } from '@/config/featureFlags';

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

function buildMockSession(): Session {
  return {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'mock-user-id',
      email: 'mock@local.dev',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  } as Session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const bypass = isAuthBypassEnabled();
  const [session, setSession] = useState<Session | null>(() => (bypass ? buildMockSession() : null));
  const [loading, setLoading] = useState<boolean>(() => !bypass);

  useEffect(() => {
    if (bypass) {
      setSession(buildMockSession());
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    AuthService.getCurrentUser()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [bypass]);

  const user = useMemo(() => AuthService.getUserInfo(session), [session]);
  const isAdmin = useMemo(() => AuthService.isAdmin(session), [session]);
  const pin = useMemo(() => AuthService.getPin(session), [session]);

  const login = async (email: string, password: string) => {
    if (bypass) {
      window.location.href = '/';
      return;
    }
    await AuthService.login(email, password);
  };

  const logout = async () => {
    if (bypass) {
      return;
    }
    await AuthService.logout();
  };

  const value: AuthContextType = {
    session,
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
