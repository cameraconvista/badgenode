# Decision Log

Decisioni tecniche rilevanti già prese, con il loro perché. Aggiungere in testa le nuove (più recente in alto). Registrare solo scelte che cambierebbero il comportamento di un agent futuro.

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
