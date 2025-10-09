// [ROUTE-DIAG-STEP7] RoutesInspector.tsx
import { useEffect } from 'react';

type RouteInfo = { path: string; order: number; note?: string };

const routes: RouteInfo[] = [
  // Ordine aggiornato dopo QUICKWIN
  { path: '/login', order: 1 },
  { path: '/archivio-dipendenti', order: 2 },
  { path: '/storico-timbrature', order: 3, note: 'TARGET' },
  { path: '/storico-timbrature/:pin', order: 4 },
  { path: '/storico', order: 5, note: 'ALIAS' },
  { path: '/_debug/storico-timbrature', order: 6 },
  { path: '/_diag/routes', order: 7, note: 'DIAG' },
  { path: '/', order: 8, note: 'HOME (moved down)' },
  { path: '*', order: 9, note: 'NotFound' },
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
