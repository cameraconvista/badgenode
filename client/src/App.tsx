import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import Home from '@/pages/Home';
import ArchivioDipendenti from '@/pages/ArchivioDipendenti';
import StoricoTimbrature from '@/pages/StoricoTimbrature';
import StoricoWrapper from '@/components/storico/StoricoWrapper';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/archivio-dipendenti" component={ArchivioDipendenti} />
      <Route path="/storico-timbrature">
        {() => <StoricoTimbrature />}
      </Route>
      <Route path="/storico-timbrature/:pin" component={StoricoWrapper} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
