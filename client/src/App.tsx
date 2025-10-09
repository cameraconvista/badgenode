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
import StoricoTimbratureSimple from '@/pages/StoricoTimbratureSimple';
import StoricoWrapper from '@/components/storico/StoricoWrapper';
import LoginPage from '@/pages/Login/LoginPage';
import NotFound from '@/pages/not-found';
// [ROUTE-DIAG-STEP7] import
import RoutesInspector from '@/components/debug/RoutesInspector';

function Router() {
  return (
    <Switch>
      {/* Rotte specifiche PRIMA */}
      <Route path="/login" component={LoginPage} />

      {/* Archivio */}
      <Route path="/archivio-dipendenti" component={ArchivioDipendenti} />

      {/* Storico TIMBRATURE — rotta ufficiale */}
      <Route path="/storico-timbrature">
        <StoricoTimbrature />
      </Route>

      {/* Varianti con parametro PIN (se presente) */}
      <Route path="/storico-timbrature/:pin">
        <StoricoWrapper />
      </Route>

      {/* Alias utile (opzionale): /storico → /storico-timbrature */}
      <Route path="/storico">
        <StoricoTimbrature />
      </Route>

      {/* Debug routes */}
      <Route path="/_debug/storico-timbrature" component={StoricoTimbratureSimple} />
      <Route path="/_diag/routes">
        <RoutesInspector />
      </Route>

      {/* 👇 La HOME "/" *dopo* le rotte sopra */}
      {/* Se il router supporta "exact", usalo per evitare che "/" prenda tutto */}
      <Route path="/" component={Home} />

      {/* CATCH-ALL SEMPRE ULTIMA */}
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
