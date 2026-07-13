# Decision Log

Decisioni tecniche rilevanti già prese, con il loro perché. Aggiungere in testa le nuove (più recente in alto). Registrare solo scelte che cambierebbero il comportamento di un agent futuro.

## 2026-07-13 — Sezione Dashboard + icona attenzione + ombreggiatura tabelle

- **Dashboard** (`/dashboard`, prima voce sidebar, admin-guarded): tabella riepilogo
  PIN/Nome/Cognome/Ore/Extra per tutti i dipendenti attivi, default mese corrente.
  Totali per dipendente via endpoint storico esistente, **1 query per PIN in parallelo**
  (`useDashboardTotals` con `useQueries`, cache condivisa con le chiavi Storico) — zero
  modifiche a DB/server. Filtri riusano `StoricoFilters`; export PDF/Excel una riga per
  dipendente (`useDashboardExport` + `.xls`). Ordinamento solo su PIN/Nome/Cognome.
- **Click su riga Dashboard → Storico del dipendente** ereditando il periodo: `dal`/`al`
  passati in query string; `computeStoricoInitialFilters` (nuovo file) legge l'URL
  all'init dei filtri Storico (fallback mese corrente). Cambia solo il valore iniziale,
  nessun calcolo Storico toccato.
- **Icona attenzione**: componente condiviso `AttenzioneIcon` (PNG tondo
  `client/public/icona-attenzione.png`) sostituisce il triangolo SVG del marcatore
  anomalia oraria e del box "Anomalia oraria" nello Storico. Gli avvisi rosso/verde
  (elimina/ripristino) e `AlertCircle` (errori) restano invariati: significato diverso.
- **Ombreggiatura tabelle** (Dipendenti/Ex/Dashboard): classe condivisa `.bn-table-shell`
  con la STESSA ombra/raggio/overflow del container Storico (`.bn-table__container`),
  un unico elemento (niente doppio wrapper/border che dava contorno incoerente). La barra
  totali interna usa `rounded-b-lg` per non sbordare; la pagina avvolge in `p-1` (non
  `overflow-hidden`, che tagliava l'ombra). Ombra accentuata a `0.40` in entrambi i punti.

## 2026-07-13 — Consolidamento UI modali + ordinamento tabelle + sidebar

- **Modali unificati**: `ModalKit` ha prop `hideClose` (nasconde la X quando c'è già
  Annulla/Chiudi in fondo). Rimossa la X ridondante da tutti i modali con pulsante di
  uscita. Titoli centrati (`bn-admin-modal__header` → center). Footer con linea
  orizzontale (`border-top`) su tutti; pulsanti "Annulla" uniformi
  (`bn-modal-btn-cancel`), positivi verdi (`bn-modal-btn-confirm`), distruttivi rossi
  (`bn-modal-btn-danger`). Termini a due step uniformati: 1° "Procedi", 2° "Conferma".
- **Ordinamento tabelle admin**: hook condiviso `useSortableTable` + componente
  `SortableHeader` (in `components/admin/`). Dipendenti ordina PIN/Nome/Cognome, Ex
  ordina Nome/Cognome/Archiviazione. Icona `ArrowUpDown` (due frecce) uguale per tutte
  le colonne; click alterna asc/desc. Comparatore: numeri per differenza, stringhe con
  `localeCompare('it', {numeric:true})`.
- **Sidebar** (`adminNavItems.ts`): ordine = **Timbrature** (ex "Storico", href
  `/storico-timbrature`), **Dipendenti**, **Ex-Dipendenti**. L'ordine dell'array = ordine
  mostrato. (Aggiornamento: "Dashboard" poi aggiunta come PRIMA voce — vedi sopra.)
- **Barra totali storico** (`StoricoTotalsBar`): compattata, etichette+valori su una riga,
  valori Totali allineati sotto le colonne Ore/Extra via `ColGroupStorico`.
- **Export** (`useStoricoExport`): toast con `duration: 3000`; file splittato in
  `.shared.ts` + `.xls.ts` per il limite 220. Il browser non notifica la conferma del
  dialog di sistema "Salva con nome": il toast resta emesso dopo la generazione.
- **Tabella Ex**: mese abbreviato 3 lettere (`formatDataGiornoMeseAnno`, `month:'short'`),
  intestazione "Archiviazione".

## 2026-07-13 — Pulizia progetto (dead code, deps, hook, split file) + deploy

- **Pulizia in 5 step** (branch dedicati, poi merge su main, tutti i check verdi):
  - Rimosse **20 dipendenze** non usate (18 radix + phosphor-icons + react-hook-form).
  - Rimossi **file orfani** verificati a 0 import: `ui/chart*` (9 file), `ui/toggle`,
    `ui/textarea`, `offline/diagnostic|seq|OfflineBadge`. Rimosso script morto
    `clean:demo-users`. Aggiornata `active-source-guard.allowlist.json`.
  - Rimosso **unplugin-icons** (plugin Vite caricato a vuoto: 0 import `~icons/`, nessun
    @iconify). Le icone usano `client/src/lib/icons.tsx` (lucide).
  - Allineato `.env.example` al codice reale: tolti `VITE_FEATURE_MONITORING`,
    `SENTRY_DSN` (0 usi); aggiunti `VITE_FEATURE_LAZY_EXPORT`, `VITE_API_PROXY_TARGET`,
    `VITE_API_BASE_URL` (usati).
- **Pre-commit hook riparato + husky reinstallato.** `scripts/ci/checks.sh` cercava
  `scripts/sql/smoke-test-supabase.sql` (rimosso in un cleanup precedente) → riga tolta.
  Husky mancava del tutto da node_modules/deps: reinstallato `husky@9` + script `prepare`,
  `.husky/pre-commit` (v9) esegue `check:ci` (lint+typecheck+test+build+guard) +
  `file-length-guard`. **Il guardiano pre-commit ora è ATTIVO**: i commit girano i check.
- **Split file oltre il limite 220** (solo spostamento, zero logica toccata):
  - `Home/index.tsx` 349→162: estratti hook `useIntroSplash` + `useLastAllowedPrecheck`
    in `client/src/pages/Home/hooks/`.
  - `timbratureRpc.ts` 343→199: offline-queue → `timbratureRpc.offline.ts`
    (`tryEnqueueOffline`, flusso `throw error` invariato); tipi → `timbratureRpc.types.ts`
    (re-export per compatibilità import); CRUD delete/update → `timbratureRpc.crud.ts`
    (re-export). Console spostati aggiunti all'allowlist.
  - **`StoricoTable.tsx` (407) NON toccato** — scelta utente: file più delicato (tabella
    timbrature, dati reali). Resta sopra 220 finché non lo si modifica.
- **Deploy Render**: l'auto-deploy da push è **rotto** (webhook GitHub→Render addormentato,
  nonostante config corretta). Si pubblica con **deploy manuale via API** (`POST
  /v1/services/srv-d3r9miali9vc73cv7qag/deploys`, key da `.env`). Vedi memory
  `badgenode-deploy-render`. Non risolto lato Render (uninstall/reinstall o ticket).

## 2026-07-13 — Selettore dipendente nell'header Storico + rifiniture

- **Il nome dipendente nell'header Storico è un selettore** (Select shadcn con
  freccetta ▾): cambia dipendente restando nello Storico, senza tornare in
  Dipendenti. Implementato via NAVIGAZIONE (URL = source-of-truth del PIN, come già
  faceva `ArchivioDipendenti.handleStorico` e il redirect "primo utente"):
  `onValueChange → setLocation('/storico-timbrature/<pin>')`. La lista dipendenti
  viene dalla query `['utenti']` in StoricoWrapper (tolto il gate `enabled:!isValidPin`
  così è disponibile anche con PIN valido), passata giù come prop `utenti`.
- **`key={pin}` su `<StoricoTimbrature>`** in StoricoWrapper: la route non usa key,
  quindi al cambio PIN wouter riusava la stessa istanza e `filters.pin` (initializer
  di useState in useStoricoTimbrature) restava bloccato → tabella sul dipendente
  vecchio. Il remount forzato reinizializza tutto lo stato sul nuovo PIN.
  Trade-off accettato: il periodo/filtro torna a default al cambio dipendente.
- **Modale Timbrature**: titolo "Modifica Timbrature <Nome Cognome>" (rimossa la
  data dal titolo e la riga descrizione "Dipendente … (PIN)"). Box Ora/Minuti
  (`TimeSelect`) resi bianchi e stretti (classe `.bn-time-field`, ~4.25rem) invece
  di w-full: non sprecano spazio per 2 cifre.
- **Topbar mobile**: rimosso il titolo di sezione, logo centrato (prop `title` di
  AdminLayout resta accettata ma non mostrata). Icone export Storico spostate a
  sinistra e ravvicinate (gap-1.5).

## 2026-07-13 — Date-picker custom nel tema (BnDatePicker)

- Sostituito `<input type="date">` (calendario nativo, aspetto diverso per OS/browser)
  con `client/src/components/ui/BnDatePicker.tsx`: popover Radix + `react-day-picker`
  (già in deps) stilizzato bordeaux/crema (`styles/bn-datepicker.css`), locale it,
  settimana da lunedì, celle 42px touch-friendly. Aspetto identico su ogni device.
- **Drop-in dell'input**: props `value`/`onChange` su stringhe `YYYY-MM-DD` (come
  prima) → le logiche a valle NON cambiano. Agganciato a StoricoFilters (Dal/Al) e
  ModaleTimbratureView (Entrata/Uscita, bordi verde/rosso mantenuti via className).
- **Apertura controllata a mano** (`onClick` sul button + `Popover.Anchor`, non
  `Popover.Trigger`): dentro il Dialog Radix del modale Timbrature il Trigger veniva
  neutralizzato dal focus-trap del Dialog. Popover in Portal con z-index 80 (sopra
  bn-z-modal=70). **Perché:** calendario coerente e prevedibile, il nativo mostrava
  layout Chromium/Safari diversi e non tematizzabili.
- Rimosso da StoricoFilters il codice morto `handleCalendarClick`/`showPicker` e i
  ref agli input, non più necessari.

## 2026-07-13 — Responsive tablet + consolidamento modali admin

- **Sidebar a drawer sotto 1024px** (tablet portrait + telefono), fissa da 1024px
  (desktop + tablet landscape). Soglia dedicata `useIsSidebarDrawer()` (=1024) in
  `hooks/use-mobile.tsx`, separata da `useIsMobile()` (=768) che NON è cambiata:
  così la sidebar diventa drawer su tablet SENZA spostare il confine `md:` del
  resto della UI. Coerenza classi: SidebarMain `lg:block/lg:flex`, topbar AdminLayout
  `lg:hidden`. **Perché:** su iPad portrait la sidebar fissa (256px) tagliava le
  colonne delle tabelle (Dipendenti −104/−170px, Storico "Extra" −56/−70px);
  liberando la larghezza il taglio sparisce senza toccare le tabelle.
- **Drawer da destra** (`side="right"` solo sul SheetContent mobile) coerente con
  l'hamburger in topbar a destra; sidebar fissa desktop resta a sinistra. Icona
  trigger = hamburger `Menu` (3 linee) 40px touch-friendly. Overlay drawer = classe
  `bn-overlay` (blur 6px) come i modali.
- **Head bar mobile a 3 zone**: logo sx, titolo centrato geometricamente (absolute
  left-1/2), hamburger dx (standard nativo).
- **Storico**: header ultima colonna "Modifica" svuotato (solo icona matita),
  `ColGroupStorico` w-12→w-10, `min-width` tabella 560→552px. Media query
  `max-width:1023px`: padding celle 1rem→0.5rem + header `ellipsis nowrap` per non
  far sforare le colonne su schermo stretto. Desktop invariato.
- **Guscio modale admin unico** (`.bn-admin-modal` + `__header/__title/__body/__footer/__box`
  in badgenode.css): sfondo app crema #F8F3EE, box/campi interni bianchi, titolo
  rosso #7A1228, testo nero #1C0A10. 3 pulsanti semantici: `.bn-modal-btn-confirm`
  (verde #3E7D52), `.bn-modal-btn-danger` (rosso #C0392B, per Elimina/Archivia),
  `.bn-modal-btn-cancel` (bianco bordo rosso). Applicato ai 7 modali admin (Nuovo,
  Modifica, Elimina, Archivia, Ripristina, Elimina-ex, Storico-ex) toccando SOLO le
  classi visive — logiche (focus-trap, doppie conferme, submit, mutation) intatte.
  Corretti bug contrasto residui (testo bianco/red-300 su sfondo chiaro).
  `.bn-modal` (usato dal modale Timbrature) NON toccato. **Perché:** i modali erano
  costruiti in 4 modi diversi con colori sparsi (verde/rosso/ambra/bordeaux per lo
  stesso significato); serviva coerenza senza riscrivere logica critica su DB reale.
- **Overlay modali centrati su tutto lo schermo sotto 1024px**: il margine sidebar
  degli overlay cambiato da `md:left-[16rem]` a `lg:left-[16rem]` (8 file). Sotto
  1024px la sidebar è drawer → l'overlay copre tutto e il modale è centrato pieno;
  da 1024px resta spostato nell'area contenuto a destra della sidebar fissa.

## 2026-07-13 — Consolidamento UI admin (colori, tabelle, modali, sidebar)

- **Standard tabella unico** (rif. Storico): header bar bordeaux #7A1228 + testo
  bianco, font 1rem, righe compatte uniformi, icone azioni 16px. Dipendenti ed
  Ex-Dipendenti allineati (Ex: azioni testo→icone RotateCcw/Trash2). Zebra striping
  righe pari #FAF4EE. Ombra tabelle: wrapper dedicato (rounded-xl + shadow) separato
  dall'overflow-hidden per non clippare gli angoli.
- **Colori unificati**: titoli sezione #7A1228; UNICO verde di progetto **#3E7D52**
  (hover #4A9061) per pulsante Aggiungi, tutti i "Salva" (incl. `.bn-btn-success`),
  icone Ripristina/Excel, testi Entrata/ripristino — rimossi i vari green-600/700.
  Sidebar item attivo #B68787 (rosso "NODE" del logo).
- **Modali admin**: centrati nell'area contenuto (`md:left-[16rem]`, sidebar esclusa
  su desktop, pieni su mobile); pulsante Aggiungi in alto a destra.
- **Sidebar**: font/altezza allineati all'header tabella; "Timbratore"→"Torna al Badge".
- **Storico**: rimosso box container e sottotitolo; nome dipendente come titolo, export
  senza bordo sulla stessa riga. Data Ex in formato esteso (`formatDataGiornoMeseAnno`).
- **Perché**: coerenza estetica enterprise dell'area admin. Solo layout/stile: nessuna
  logica, dato, API o comportamento modificato. Coperto da e2e (50/50).

## 2026-07-13 — Rifinitura layout admin (step 4): dedup header Storico + coerenza

- `StoricoHeader.tsx` alleggerito: rimossi **pulsante TORNA**, **logo** e navigazione
  di ritorno, ora forniti dal guscio `AdminLayout` (sidebar/drawer) → niente più
  duplicati. Mantenuti nome dipendente selezionato + export PDF/XLS (invariati).
- Coerenza: raggio dei bottoni export allineato al `lg` standard (0.5625rem, come
  Tailwind config) invece di 0.75rem. Rimosse dal CSS le classi orfane
  `.bn-accent-light` e `.bn-back` (non più referenziate da alcun componente).
- Scelta conservativa su app in produzione: **nessuna** sostituzione dei ~250 hex
  inline con i token (`--bn-primary`, `--foreground`…) — troppo rischio cromatico.
  Colori invariati al 100%; toccati solo forma (raggio) e ridondanze.
- **Perché:** header coerente col nuovo guscio senza duplicazioni, senza toccare
  colori/logica/dati. La sostituzione hex→token resta un possibile lavoro futuro
  a parte, da verificare visivamente sezione per sezione.

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
