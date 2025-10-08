import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: re-enable Auth when backend ready
    // Mock login - always redirect to home
    setLocation('/');
  };

  return (
    <div 
      className="h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}
    >
      <div className="w-full max-w-md">
        <div 
          className="rounded-3xl p-8 shadow-2xl border-2"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            boxShadow: '0 0 50px rgba(231, 116, 240, 0.3)'
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo2_app.png" 
              alt="BADGENODE" 
              className="h-12 w-auto"
            />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Accesso BadgeNode
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-200 text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white text-base mt-1"
                placeholder="inserisci@email.com"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-200 text-base">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white text-base mt-1"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-base py-3"
            >
              {loading ? 'Accesso in corso...' : 'Entra'}
            </Button>
          </form>

          {/* Debug info in development */}
          {import.meta.env.DEV && user && (
            <div className="mt-6 p-3 bg-gray-800/50 rounded text-xs text-gray-300">
              <div>Stato: {isAdmin ? 'Admin' : `PIN ${user.pin}`}</div>
              <div>Email: {user.email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
