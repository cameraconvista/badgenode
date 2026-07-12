# Decision Log

Decisioni tecniche rilevanti già prese, con il loro perché. Aggiungere in testa le nuove (più recente in alto). Registrare solo scelte che cambierebbero il comportamento di un agent futuro.

## 2026-07-13 — Redesign layout admin: guscio AdminLayout (sidebar/drawer)

- La sezione admin è passata da "card fullscreen con navigazione dentro i pulsanti"
  a un guscio condiviso `client/src/components/admin/layout/AdminLayout.tsx`:
  **sidebar laterale persistente su desktop**, **drawer a scomparsa su mobile**
  (shadcn Sidebar/Sheet). Le 3 pagine admin (`ArchivioDipendenti`, `ExDipendenti`,
  `StoricoTimbrature`) sono avvolte dal guscio; header/nav duplicati rimossi.
- Voci sidebar in `adminNavItems.ts`: Dipendenti · Ex-Dipendenti · Storico + Timbratore
  nel footer. Import della base sidebar da `@/components/ui/sidebar/index` (non lo shim).
- Tabelle admin: scroll orizzontale su schermo stretto (`overflow-auto` + larghezza
  minima), header sticky, colonne non compresse. Solo cornice/responsive.
- Copertura e2e isolata in `e2e/admin-layout.spec.ts` (rete mockata, zero scritture):
  sidebar in ogni sezione, drawer mobile, rotta `/admin/ex-dipendenti`, scroll-x.
- **Perché:** layout professionale e coerente desktop+mobile senza toccare logiche,
  dati o API. Nota tecnica: lo Storico senza pin fa redirect al primo utente
  (`/storico-timbrature/:pin`) — i test lo montano con pin esplicito per stabilità.

## 2026-07-13 — Vincolo assoluto anti-push + hook di enforcement

- L'utente ha dichiarato un **vincolo assoluto**: app ONLINE con dati reali, logiche consolidate da non corrompere MAI; `git push` **solo su sua autorizzazione esplicita**, senza richiederlo ogni volta (default = mai push).
- Enforcement tecnico: creato **`.claude/settings.json`** con hook `PreToolUse` su `Bash` (filtro `if: Bash(git push*)`) che intercetta ogni comando contenente `git push` (regex `git[[:space:]]+push`, copre `--force`/spazi multipli) e lo **nega** con `permissionDecision: deny`. Non dipende dalla memoria dell'agent: blocca a livello harness. I commit locali restano liberi (sicuri e reversibili).
- **Perché:** un push su `main` = autodeploy in produzione su dati reali di clienti; il blocco automatico elimina il rischio di push non voluto anche in sessioni future senza storico. Vincolo memorizzato anche in auto-memory (`badgenode-vincolo-assoluto`).

## 2026-06-29 — Governance: integrate lacune in CLAUDE.md + AGENTS.md puntatore

- La governance esisteva gia ed era solida (`CLAUDE.md` root, caricato auto da Claude Code). Verificata e **integrata senza duplicare**: aggiunti (1) limite righe **esplicito 300/file** applicato in scrittura, (2) sezione **Checklist pre/post-modifica** vincolante, (3) sezione **Handoff per sessioni future** (ripartenza senza storico), (4) nota **portabilita**. Sezioni gia presenti (Enforcement, Reasoning, Flusso modifiche, DB unica fonte, parita admin/user, segreti, git) lasciate invariate.
- Creato **`AGENTS.md`** come puntatore canonico per agent non-Claude (Codex/Cursor): non duplica regole, rimanda a `CLAUDE.md` + `DNA/`. File canonico unico = `CLAUDE.md`.
- Limite 300 scelto sui dati reali (6 file gia >300, max 405 in `StoricoTable.tsx`): trattati come **debito noto** da ridurre quando toccati, non refactor a parte.
- **Da fare (utente):** allineare anche il prompt `CLAUDE.MD` su App Control, altrimenti un sync futuro potrebbe sovrascrivere le aggiunte locali.
- **Perché:** garantire che ogni sessione/agent futuro, anche senza storico, applichi automaticamente le stesse regole.

## 2026-06-29 — Sicurezza: attivata RLS su ex_dipendenti (chiuso buco scrittura anon)

- Audit privacy/sicurezza (sola lettura + pentest non distruttivo) ha rilevato che `public.ex_dipendenti` aveva la **RLS DISATTIVATA** (`pg_tables.rowsecurity = false`): una INSERT anonima con la sola chiave pubblica riusciva (HTTP 201). `utenti` e `timbrature` erano invece protette.
- Fix applicato via migrazione versionata additiva `20260629T0300__rls_ex_dipendenti_block_anon_write.sql` (+ `.down.sql`): `enable row level security` + policy `ex_dipendenti_select_all` (SELECT per anon/authenticated, `using true`), nessuna policy di write. Replica esatta del pattern di `utenti`.
- Applicata con `psql` in transazione (`--single-transaction`, `ON_ERROR_STOP`). Verifica post: INSERT anon → 401/42501 (bloccata), SELECT anon → 200, app legge l'archivio via backend → 200 (4 record), scrittura service_role → 201 (archiviazione/ripristino OK). Dati reali invariati, zero residui di test.
- Le scritture dell'app passano dal backend con `SERVICE_ROLE_KEY` (bypassa RLS): nessun impatto funzionale.
- **NON risolto (segnalato nell'audit):** endpoint backend `/api/utenti`, `/api/ex-dipendenti`, `/api/storico` senza auth; `FEATURE_AUTH_BYPASS=true` default; SELECT anon aperta (PII leggibile con chiave pubblica). Da affrontare in sessione dedicata.
- **Perché:** chiudere subito l'unico buco di SCRITTURA anonima reale, con intervento minimo, idempotente e reversibile, senza toccare l'app.

## 2026-06-29 — Storico: visualizzazione turni spezzati ("due righe pari" + totale) + fix pairing mezzanotte

- Lo Storico mostrava per ogni giorno solo prima entrata/ultima uscita: i turni spezzati (es. chef 09-13 + 17-02) apparivano come intervallo compresso fuorviante (09-02), pur con ore totali corrette. Collegata la pipeline multi-sessione già esistente (`aggregateTimbratureByGiornoLogico` → `pairSessionsForGiorno`, usata da `ExStoricoModal`) anche allo storico dei dipendenti attivi (`useStoricoTimbrature.ts`).
- Resa finale "due righe pari": riga-giorno = prima sessione; sessioni successive su righe allo stesso livello (stesso sfondo, senza etichetta); riga "Totale giorno" con ore totali + extra. Niente piu` intervallo compresso. Per giorni non spezzati: una riga sola.
- **EXTRA sul totale del giorno logico:** calcolato su `max(0, ore_giorno − ore_contrattuali)` sommando tutte le sessioni, mai per singola sessione. Mostrato solo su riga totale (spezzati) o riga-giorno (turno unico).
- **Fix bug latente** in `pairSessionsForGiorno`: ordinava per stringa orario `HH:MM`, quindi un'uscita dopo mezzanotte (02:00) finiva prima dell'entrata serale (17:00) → sessione serale erroneamente "aperta", ore perse. Ora ordina per `created_at` (tie-break `ora_locale`). Coperto da `tests/storico/sessioni-split.test.ts`.
- **Invariante di sicurezza:** le ore totali restano governate da `storicoDatasetV5` (API `/api/storico`); la visualizzazione non altera mai un totale. Server/API e logiche di scrittura non toccati.
- Export PDF/XLS (`useStoricoExport.ts`): stessa resa; include TUTTI i giorni del periodo (anche vuoti); orari HH:MM (no secondi); totali invariati.
- Verifica: 86/86 test, typecheck/lint/build puliti, prova visiva su PIN 99 di test su 3 mesi (giugno/maggio/aprile, spezzato 09-13+17-02 = 13h) poi rimosso; dati reali intatti (19 utenti, 2041 timbrature). Nota: nessun blocco orario sulle timbrature (24h); le 05:00 sono solo confine del giorno logico, non un divieto.
- **Perché:** rendere leggibile lo spezzato (requisito apertura pranzo/chef) riusando codice gia` collaudato, senza toccare i calcoli ne` il server.

## 2026-06-29 — Consolidamento asset grafici su client/public (sorgente unica)

- Esisteva una doppia cartella asset: `public/` root (servita solo dal dev server) e `client/public/` (usata dal build Vite). Disallineamento dev/prod. Consolidato tutto su `client/public/`, eliminata `public/` root.
- Fix: `logo_intro.svg` (usato da `IntroSplash`) era solo in `public/` root e non entrava nel build → splash usava il fallback PNG in prod. Spostato in `client/public/`, ora presente in `dist/public`.
- Aggiornati `server/vite.ts` (dev serve da `client/public`) e `scripts/generate-pwa-icons.ts` (sorgente unica). Rimossi asset logo orfani e 4 script SQL obsoleti (viste v5 inesistenti, colonna legacy `giornologico`).
- **Perché:** una sola sorgente asset elimina incoerenze dev/prod e riduce il peso del repo.

## 2026-06-29 — Consolidamento documentazione: DOCS_STORICO assorbito nel DNA

- Prima di eliminare i file storici, verificato che le logiche aggiornate fossero nel DNA o nel codice. Estratte in `03_LOGICHE_CRITICHE.md` le regole di pairing/edge-case del giorno logico (dal vecchio `legacy-guides/07`), con riferimento al codice come fonte.
- Eliminati i report diagnosi datati 2025-2026 (snapshot una-tantum) e le legacy-guides superate da codice+DNA.
- L'audit storico del DB (vecchio `legacy-guides/01_database_api.md`) e` stato spostato in `DNA/08_AUDIT_DATABASE.md`; i riferimenti in `04` aggiornati. La cartella `DOCS_STORICO/` e` stata rimossa: tutta la documentazione canonica vive ora in `DNA/`.
- **Perché:** ridurre il rumore documentale mantenendo intatte le logiche correnti. Doc da 42 a ~12 file .md, tutto in un unico posto canonico.

## 2026-06-29 — DNA rinumerato per importanza + indice 00

- Adottata numerazione `00`–`07` per priorità di lettura (sicurezza prima), come richiesto dallo standard `CLAUDE.md`. `00_INDICE.md` sostituisce il vecchio `DNA/README.md`. Aggiunto questo decision-log.
- **Perché:** lo standard enterprise richiede `00`=indice, numerazione per importanza e un decision-log in `DNA/06_DECISION_LOG.md`. Il DNA precedente era valido ma non numerato.

## 2026-06-29 — Allineamento chiavi env tra .env.local, App Control e Render

- Le chiavi Supabase (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`) salvate in App Control erano errate ("Invalid API key"). Riallineate ai valori reali del `.env.local`, già identici a quelli di produzione su Render. Verificate valide in lettura/scrittura.
- **Perché:** rigenerare il `.env` da App Control con chiavi errate avrebbe rotto la connessione al DB.

## Storico precedente (sintesi da CHANGELOG/archivio)

- **Idempotenza su `client_event_id`**, non su `device_id/client_seq`: una migration aggiungeva quei campi ma il DB reale auditato non li ha; il runtime resta su `client_event_id`.
- **Migrazione da RPC a endpoint REST `/api/timbrature`** come percorso principale di scrittura; le RPC legacy restano definite ma non sono il percorso primario.
- **Separazione chiavi:** anon key lato client, service role solo lato server (le scritture sensibili passano dal server per via di RLS).
- **Storico con fallback applicativo su `timbrature`**: il codice prova la view `v_turni_giornalieri` ma il DB reale non ha view operative.
- **File-length guard ≤220 righe** come policy di modularità.
