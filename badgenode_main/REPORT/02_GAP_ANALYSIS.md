# BadgeNode — Gap Analysis

Data audit: 2026-04-15

## Gap tra documentazione e codice reale

## 1. Struttura repository

- `DNA/02_struttura_progetto.md` descrive `ARCHIVE/`, `README_PROGETTO.md` e altre entità non presenti nella root reale.
- La root reale contiene invece `legacy/`, `scripts/_archive/`, `server/legacy/`, `coverage/`, `dist/`.

## 2. Governance file size

- La documentazione parla di hard limit a `220` righe e obbligo di splitting generalizzato.
- Il controllo reale `.husky + scripts/file-length-guard.cjs` si applica solo ai file staged in `client/src/` e ignora `server/`, `scripts/`, `shared/`.
- La governance richiesta per il consolidamento enterprise successivo è `~350` righe max per file funzionale, ma non è ancora codificata nei controlli.

## 3. Toolchain

- `DNA/04_config_sviluppo.md` dichiara Node `>=18`.
- `package.json` richiede `22.12.x`.
- `.github/workflows/ci.yml` usa Node `18`.
- Stato reale: tre versioni di riferimento diverse.

## 4. API e modello utenti

- `DNA/01_database_api.md` documenta campi estesi utenti come pienamente supportati.
- Stato reale:
  - `GET /api/utenti` production li sovrascrive con default/null
  - `POST /api/utenti` non li inserisce
  - `PUT /api/utenti/:pin` li gestisce
- Conclusione: documentazione più avanzata dell'implementazione reale.

## 5. Storico

- La documentazione continua a parlare di `v_turni_giornalieri` come percorso principale con fallback.
- Il codice reale in `server/routes/modules/other/internal/storicoRoutes.ts` forza subito il fallback e non usa realmente la view.

## 6. Offline

- `DNA/09_offline.md` descrive un flusso con RPC `insert_timbro_offline` e `syncRunner`.
- Il runtime attuale usa queue IndexedDB e flush HTTP verso `/api/timbrature`.
- Anche le API diagnostiche esposte in documentazione non coincidono perfettamente con quelle effettive.

## 7. Auth

- La documentazione e parte dell'architettura fanno pensare a flusso auth Supabase operativo.
- Stato reale: `client/src/contexts/AuthContext.tsx` usa `mockSession` e login/logout fittizi.

## 8. Quality gate

- I documenti descrivono un processo di verifica solido.
- Stato reale:
  - lint rosso
  - coverage non eseguibile
  - check:ci rosso
  - e2e non affidabili

## Gap organizzativi

## Da correggere subito

- Allineamento qualità minima: lint, coverage, CI Node version
- Correzione endpoint utenti per evitare perdita silente di dati applicativi
- Documentazione su offline, auth e storico

## Da consolidare dopo

- Unificazione boundary client-server
- Rimozione residui template/legacy
- Razionalizzazione bootstrap offline e osservabilità

## Solo da monitorare

- bundle size export
- warning PWA
- risultato depcheck/ts-prune da ripulire con analisi più granulare
