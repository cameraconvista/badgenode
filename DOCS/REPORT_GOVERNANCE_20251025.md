# REPORT GOVERNANCE — 2025-10-25

Stato: Completato

## 1) File > 200 righe (escluse estensioni .md/.txt)

- 618 server/routes/modules/other.ts
- 511 client/src/styles/badgenode.css
- 488 client/src/components/admin/ConfirmDialogs.tsx
- 466 server/routes.ts.backup
- 311 client/src/hooks/useStoricoMutations.ts
- 295 server/routes/timbrature/__tests__/postTimbratura.test.ts
- 283 client/src/services/utenti.service.ts
- 269 server/routes/modules/utenti.ts
- 262 client/src/services/timbrature.service.ts
- 257 client/src/services/__tests__/timbratureRpc.test.ts
- 245 client/src/components/storico/StoricoTable.tsx
- 242 client/src/pages/ArchivioDipendenti.tsx
- 233 client/src/services/__tests__/utenti.service.test.ts
- 232 client/src/components/ui/menubar.tsx
- 216 client/src/components/admin/ModaleNuovoDipendente.tsx
- 210 client/src/components/storico/StoricoFilters.tsx
- 209 client/src/hooks/useStoricoTimbrature.ts
- 206 client/src/lib/time.ts
- 201 client/src/services/storico.service.ts

Note: superano la soglia di avviso (200). Raccomandazione governance: mantenere <300 righe; per i file oltre 300 — valutare refactor a moduli più piccoli.

## 2) Violazioni governance rilevate

- Nessuna violazione esplicita rilevata dallo scanner (forbidden patterns: console.log, FIXME, HACK, TODO non business, eval). Nota: possono esistere log controllati via `import.meta.env.DEV`/`NODE_ENV` ammessi.

## 3) Duplicati e file potenzialmente obsoleti

- Duplicati per basename: nessuno rilevante (index.ts[x]/types.ts esclusi di default).
- Potenziali file obsoleti:
  - server/routes.ts.backup (466 righe) — file di backup non referenziato in runtime. Proposta: archiviarlo in cartella `legacy/` o rimuoverlo dopo verifica.

## 4) Raccomandazioni

- Refactor suggeriti (>300 righe):
  - server/routes/modules/other.ts (618): suddividere per dominio (pin.validate, storico, ex-dipendenti) in router separati.
  - client/src/styles/badgenode.css (511): modularizzare in sezioni (tabelle, modali, popover) o migrare porzioni a CSS Modules/scoped.
  - client/src/components/admin/ConfirmDialogs.tsx (488): valutare estrazione dei tre dialog in file separati per migliorare manutenibilità.
  - client/src/hooks/useStoricoMutations.ts (311): spezzare per feature (create/update/delete).
- Pulizia:
  - Valutare rimozione/move di `server/routes.ts.backup`.

## 5) Appendice — Metodo di scansione

- Esclusi: node_modules, build/dist, immagini, Backup_Automatico, .md, .txt.
- Soglie: warning >200, hard-limit >300.
- Forbidden: console.log, FIXME, HACK, TODO (non business), eval.

