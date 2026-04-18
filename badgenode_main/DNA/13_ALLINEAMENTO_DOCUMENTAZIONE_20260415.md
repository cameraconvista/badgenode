# 13 Allineamento Documentazione 2026-04-18

Questa nota aggiorna la documentazione esistente senza sostituire i documenti storici.

## Stato

Dal confronto tra `DNA/` e codice reale emergono alcuni disallineamenti importanti:

- la struttura repository documentata non coincide completamente con la root reale
- la governance `220 righe` non è applicata uniformemente al codice attivo
- il flusso offline documentato è più evoluto di quello effettivamente in runtime
- la documentazione auth non riflette il fatto che il client usa ancora `mockSession`
- il percorso storico documentato tramite `v_turni_giornalieri` non rappresenta il comportamento corrente, che forza il fallback applicativo
- l'audit Supabase read-only conferma che in `public` non esistono view/materialized view e che `v_turni_giornalieri` è realmente assente
- l'audit Supabase read-only conferma che le funzioni `enforce_alternanza_*` esistono ma non sono operative perché `public.timbrature` non ha trigger attivi
- il perimetro funzioni `public` reale è limitato a `enforce_alternanza_fn`, `enforce_alternanza_simple_fn`, `generate_timbrature_report`, `insert_timbro_v2`
- `shared/types/database.ts` e` stato riallineato ai tre soli tavoli reali (`utenti`, `timbrature`, `ex_dipendenti`) e alle quattro funzioni `public` confermate
- nei tipi condivisi, `TurnoGiornaliero` resta un tipo applicativo legacy separato e non rappresenta una view reale presente nel DB
- la toolchain documentata usa riferimenti Node diversi da quelli dichiarati in `package.json` e in CI
- retention timbrature non automatizzata a livello runtime/DB: gestione operativa manuale
- retention operativa verificata al 2026-04-18: finestra coerente ultimi 6 mesi (`fuori_retention_6m=0`, `future_anomale=0`)

## Nota operativa

I dettagli puntuali del censimento, dell'audit tecnico, della gap analysis e della governance sono stati raccolti nella cartella root `REPORT/`, dedicata esclusivamente alla fase di consolidamento enterprise.

## Chiusura blocco Supabase

Il blocco di allineamento Supabase a rischio 0 puo` considerarsi chiuso lato:
- documentazione tecnica principale `DNA`
- tipi condivisi `shared/types/database.ts`
- perimetro runtime applicativo descritto in modo coerente con il DB reale `public`

Residuo non chiuso in questa fase:
- commento interno della funzione DB `public.insert_timbro_v2`, che parla ancora di trigger attivi non presenti nel DB reale
- questo punto richiede eventualmente solo una `CREATE OR REPLACE FUNCTION` mirata sul DB e resta fuori dal perimetro documentale/typing-safe
- policy automatica di retention (job schedulato + audit trail) non ancora implementata nel perimetro applicativo corrente
