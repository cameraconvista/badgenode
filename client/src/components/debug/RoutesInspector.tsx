// [ROUTE-DIAG-STEP7] RoutesInspector.tsx
import { useEffect } from 'react';

type RouteInfo = { path: string; order: number; note?: string };

const routes: RouteInfo[] = [
  // Inserisci qui le route dichiarate in App.tsx nello stesso ordine
  { path: '/login', order: 1 },
  { path: '/', order: 2 },
  { path: '/archivio-dipendenti', order: 3 },
  { path: '/storico-timbrature', order: 4, note: 'TARGET' },
  { path: '/_debug/storico-timbrature', order: 5 },
  { path: '/storico-timbrature/:pin', order: 6 },
  { path: '*', order: 7, note: 'NotFound' },
];

export default function RoutesInspector() {
  useEffect(() => {
    // Log essenziali per capire cosa succede in prod
    console.info('[ROUTE-DIAG-STEP7] location.pathname =', window.location.pathname);
    console.table(routes);
  }, []);
  
  return (
    <div style={{padding:16}}>
      <strong>[ROUTE-DIAG-STEP7] Routes Inspector</strong>
      <pre>{JSON.stringify({ pathname: window.location.pathname, routes }, null, 2)}</pre>
    </div>
  );
}
