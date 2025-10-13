# Archivio 2025-10-13 - Deep Clean & Stability Pass + Root Cleanup

## File Archiviati

### `index-broken.css`
**Motivo**: File CSS con sintassi corrotta che causava crash del server e pagina bianca
**Problema**: Regole CSS fuori dai selettori, blocchi :root duplicati e malformati
**Sostituito con**: `index.css` ricreato con sintassi corretta
**Data**: 2025-10-13 13:38

### Script Legacy da Root (`root-scripts/`)
**Motivo**: Pulizia root repository - script "una tantum" già completati
**Problema**: 26 script di fix/debug/test in root che ingombravano la struttura
**Azione**: Spostati in archivio con tracciabilità completa
**Data**: 2025-10-13 15:51

**Script archiviati:**
- Report legacy: `REPORT_PROBLEMI_TABELLA_STORICO_TIMBRATURE.md`
- Fix colori: `colori-grigio-chiaro-finale.js`, `correzione-colori-tabella.js`, `fix-finale-colori-e-prod.js`
- Debug: `debug-calcolo-ore.js`, `debug-tabella-struttura.js`, `diagnosi-prod-vs-local.js`
- Refactoring: `refactoring-grid-to-table-completato.js`, `refinement-tabella-completato.js`
- Test: 12 script di test vari completati
- Fix vari: `fix-centrature-larghezze-completato.js`, `soluzione-chirurgica-finale.js`

## Note
Tutti i file in questa directory sono stati rimossi durante il processo di pulizia e stabilizzazione del repository. Non sono più referenziati nel codice attivo. La root è ora pulita con solo file di configurazione essenziali.
