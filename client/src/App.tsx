import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminRoute, UserRoute } from '@/components/auth/RouteGuard';
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
      <Route path="/">
        <UserRoute>
          <Home />
        </UserRoute>
      </Route>
      <Route path="/archivio-dipendenti">
        <AdminRoute>
          <ArchivioDipendenti />
        </AdminRoute>
      </Route>
      <Route path="/storico-timbrature">
        <AdminRoute>
          <StoricoTimbrature />
        </AdminRoute>
      </Route>
      <Route path="/storico-timbrature/:pin">
        <AdminRoute>
          <StoricoWrapper />
        </AdminRoute>
      </Route>
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
