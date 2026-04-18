import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isAuthBypassEnabled } from '@/config/featureFlags';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAdmin, login } = useAuth();
  const [, setLocation] = useLocation();
  const bypassEnabled = isAuthBypassEnabled();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setLocation('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore di autenticazione';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, #EDE3D9 0%, #E5D8CC 50%, #F8F3EE 100%)',
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-3xl p-8 shadow-lg border-2"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: 'rgba(122,18,40,0.25)',
            boxShadow: '0 4px 32px rgba(122,18,40,0.10)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/logo_badgenode.png" alt="BADGENODE" className="h-12 w-auto" />
          </div>

          <h1 className="text-2xl font-bold text-[#1C0A10] text-center mb-8">Accesso BadgeNode</h1>
          {bypassEnabled && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Modalita` bypass autenticazione attiva (`VITE_FEATURE_AUTH_BYPASS=true`).
            </div>
          )}
          {!!error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-[#1C0A10] text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#FDFAF8] border-[rgba(122,18,40,0.25)] text-[#1C0A10] placeholder:text-[#7A5A64]/60 text-base mt-1 focus:border-[#7A1228]"
                placeholder="inserisci@email.com"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#1C0A10] text-base">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#FDFAF8] border-[rgba(122,18,40,0.25)] text-[#1C0A10] placeholder:text-[#7A5A64]/60 text-base mt-1 focus:border-[#7A1228]"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-[#7A1228] hover:bg-[#9B1E35] text-white text-base py-3"
            >
              {loading ? 'Accesso in corso...' : 'Entra'}
            </Button>
          </form>

          {/* Debug info in development */}
          {import.meta.env.DEV && user && (
            <div className="mt-6 p-3 bg-[#F8F3EE] border border-[rgba(122,18,40,0.10)] rounded text-xs text-[#7A5A64]">
              <div>Stato: {isAdmin ? 'Admin' : `PIN ${user.pin}`}</div>
              <div>Email: {user.email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
