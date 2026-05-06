# Aggiornamento Enterprise 2026-04-18

## Scope

Consolidamento tecnico post-fix retention/auth con vincoli:
- nessuna modifica layout UX
- nessuna alterazione business logic
- nessuna modifica dati Supabase in questo ciclo

## Delta introdotto

1. Modularizzazione sicura file oversize:
- `client/src/components/admin/ConfirmDialogs.tsx` convertito in barrel + dialog separati
- `client/src/services/utenti.service.ts` con helper dedicati
- `client/src/services/timbrature.service.ts` con helper dedicati e validate-pin separato
- `server/routes/modules/utenti.ts` con helper dedicati

2. Qualità codice:
- rimozione file obsoleti `.DS_Store`
- riduzione ridondanze locali senza cambiare comportamento runtime

3. Validazione:
- `npm run check:ci` = OK
- `npm run test` = OK
- build production = OK

4. Note operative:
- `smoke:runtime` può restituire `42501` con anon key su ambienti RLS strict; atteso.

## Esito

Stato progetto: stabile, coerente, modulare.
Perimetro funzionale invariato.
