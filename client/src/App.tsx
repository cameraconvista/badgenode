import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
// TODO: re-enable Auth when backend ready
// import { AdminRoute, UserRoute } from '@/components/auth/RouteGuard';
import Home from '@/pages/Home';
import ArchivioDipendenti from '@/pages/ArchivioDipendenti';
import StoricoTimbrature from '@/pages/StoricoTimbrature';
import StoricoWrapper from '@/components/storico/StoricoWrapper';
import LoginPage from '@/pages/Login/LoginPage';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/archivio-dipendenti" component={ArchivioDipendenti} />
      <Route path="/storico-timbrature/:pin">
        <StoricoWrapper />
      </Route>
      <Route path="/storico-timbrature">
        <StoricoTimbrature />
      </Route>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
