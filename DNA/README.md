# DNA Canonico

`DNA/` contiene solo il contesto operativo attivo utile all'agent.

## Come usarlo

- Leggere prima `README_OPERATIVO.md` in root.
- Aprire solo i file pertinenti al task.
- Verificare sempre il codice reale prima di intervenire.
- Considerare `DOCS_STORICO/` come archivio secondario.
- Valutare periodicamente i `.md` fuori da `DNA/` per evitare duplicati o drift.

## File canonici

- [ARCHITETTURA_REALE.md](ARCHITETTURA_REALE.md)
- [LOGICHE_CRITICHE.md](LOGICHE_CRITICHE.md)
- [SUPABASE_DATABASE.md](SUPABASE_DATABASE.md)
- [INTEGRAZIONI_DATI.md](INTEGRAZIONI_DATI.md)
- [OPERATIONS.md](OPERATIONS.md)
- [GUARDRAIL.md](GUARDRAIL.md)

## Criterio di manutenzione

Mantenere qui solo contenuti che riducono errori, regressioni o perdita di contesto. Se un dettaglio si capisce meglio dal codice e non aggiunge guardrail operativi, non va duplicato qui.

## Perimetro documentale fuori da `DNA/`

Markdown da mantenere fuori da `DNA/` solo se hanno una funzione chiara:
- file root operativi come `README_OPERATIVO.md`, `CHANGELOG.md`, `POST_DEPLOY_CHECKLIST.md`, `ALERT_UPTIME.md`
- archivio storico in `DOCS_STORICO/`
- README accoppiati a cartelle archiviate o legacy, ad esempio `scripts/_archive/.../README.md` e `server/legacy/README.md`

Markdown da non trattare come documentazione progetto:
- file in `.local/`, perche` appartengono al tooling locale dell'ambiente agente
