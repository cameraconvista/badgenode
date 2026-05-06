# Guardrail

## Regole non negoziabili

- Il progetto e` attivo nel locale dell'utente.
- Non corrompere layout, UX, funzioni, logiche o record Supabase.
- Nessuna mutazione dati o schema senza richiesta esplicita e verifica impatto.
- Nessun refactor documentale inutile se non riduce davvero il rischio operativo.
- Nessuna documentazione duplicata con lo stesso scopo.

## Regole per l'agent

1. Leggere prima `README_OPERATIVO.md`.
2. Leggere solo i file `DNA/` pertinenti al task.
3. Verificare sempre il codice reale prima di intervenire.
4. Trattare `DNA/` come contesto operativo canonico, non come sostituto del codice.
5. Trattare `DOCS_STORICO/` come secondario.
6. Aggiornare `DNA/` quando cambia una logica, un vincolo o un workflow reale.
7. Aggiornare `DNA/SUPABASE_DATABASE.md` solo con dati verificati da codice, migrazioni, script SQL o query SQL Editor.

## Cose da non assumere

- che `utenti.id` esista
- che `v_turni_giornalieri` esista nel DB reale
- che `public.timbrature` abbia trigger attivi
- che i default auth descritti in vecchi doc coincidano col codice corrente
- che i documenti di diagnostica siano canonici
- che una migration Supabase sia stata applicata sul DB reale solo perche` esiste nel repo

## Cose da non fare senza richiesta

- eseguire seed o cleanup DB
- cambiare chiavi/env sensibili senza motivo operativo
- rimuovere o alterare retention dati
- cambiare flussi di timbratura, alternanza, offline o storico
- alterare la modalita` di avvio del progetto
- documentare schema Supabase per deduzione quando non e` verificato
