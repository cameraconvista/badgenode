import { Switch, Route } from 'wouter';
import { Suspense, lazy } from 'react';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
// TODO(BUSINESS): re-enable Auth when backend ready
// import { AdminRoute, UserRoute } from '@/components/auth/RouteGuard';
import Home from '@/pages/Home';

// Lazy loading per pagine non critiche (bundle optimization)
const ArchivioDipendenti = lazy(() => import('@/pages/ArchivioDipendenti'));
const ExDipendenti = lazy(() => import('@/pages/ExDipendenti'));
const StoricoWrapper = lazy(() => import('@/components/storico/StoricoWrapper'));
const LoginPage = lazy(() => import('@/pages/Login/LoginPage'));
const NotFound = lazy(() => import('@/pages/not-found'));

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/archivio-dipendenti" component={ArchivioDipendenti} />
        <Route path="/admin/ex-dipendenti" component={ExDipendenti} />
        <Route path="/storico-timbrature/:pin">
          {(_params) => { void _params; return <StoricoWrapper />; }}
        </Route>
        <Route path="/storico-timbrature" component={StoricoWrapper} />
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
