# 📅 LOGICA GIORNO LOGICO — BadgeNode

**Data aggiornamento**: 2026-04-18
**Versione documento**: v5.2 (allineamento schema reale + retention operativa 6 mesi) • **Stato**: Enterprise Stable
**Autore**: BadgeNode • Revisione tecnica Cascade

**Fix Recenti (Sprint 10)**:
- ✅ Server: Auto-recovery `anchorDate` per uscite notturne (00:00-05:00) senza client anchor
- ✅ Client: Calcolo giorno logico in UI Home per abilitazione pulsante Uscita
- ✅ Offline: Bypass validazione per turni notturni (00:00-05:00)

---

## 🎯 Scopo

Definire in modo univoco la **logica del giorno logico** e il **comportamento di calcolo/visualizzazione** delle timbrature nella pagina **Storico Timbrature**, includendo la gestione di **più sessioni Entrata/Uscita nello stesso giorno**.

---

## 🧠 Concetto base — “Giorno logico”

Il **giorno logico** è l’unità su cui BadgeNode aggrega le timbrature di uno **stesso turno**, anche se attraversa la mezzanotte. Serve a evitare che i turni notturni vengano “spezzati” su due date di calendario.

- Fuso orario **Europe/Rome** obbligatorio in TUTTI i calcoli.
- È **vietato** usare `.toISOString()` o conversioni UTC che possano spostare la data.
- La colonna di riferimento per query e aggregazione è **`giorno_logico`** (tipo `date`).

---

## 📏 Regole principali di assegnazione

| Caso                                    | Regola                                   | Esempio                                   |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| Entrata tra **05:00–23:59**             | `giorno_logico` = **data dell’entrata**  | Entrata 09:00 → 2025‑10‑09                |
| Entrata tra **00:00–04:59**             | `giorno_logico` = **giorno precedente**  | Entrata 02:00 del 10/10 → 2025‑10‑09      |
| Uscita dopo mezzanotte (entro le 04:59) | resta sul **giorno logico dell’entrata** | Entrata 22:00 → Uscita 02:00 → 2025‑10‑09 |

**Nota:** per semplicità operativa, consideriamo “finestra notturna” **[00:00, 04:59]**. Uscite oltre le 04:59 sono comunque attribuite al **giorno logico di entrata**, ma sono considerate **edge case** e devono rientrare in una durata massima ragionevole di turno (es. ≤ 16h).

---

## 🗄️ Modello dati minimo (lettura)

Si legge direttamente dalla tabella **`timbrature`** (NO vista):

- `pin` (int) — identificativo dipendente
- `tipo` (`entrata` | `uscita`)
- `data_locale` (date) — data di calendario locale della timbratura
- `ora_locale` (time) — orario locale
- `giorno_logico` (date) — **chiave** di aggregazione
- `created_at` (timestamptz)
- (facoltativi) `nome`, `cognome`

**Filtro periodo:** `giorno_logico >= dal` **e** `giorno_logico <= al` (**range inclusivo**).
Le pagine devono mostrare **tutti i giorni** del periodo, anche senza timbri (righe a `0.00`).

---

## 🧮 Calcolo ore — definizioni

- **Sessione**: coppia _Entrata_ → _Uscita_; se l’uscita manca, la sessione è **aperta** e non rientra nei totali.
- **Ore sessione**: differenza temporale normalizzata (gestendo eventuale passaggio di data).
- **Ore giornaliere**: somma delle ore di **tutte le sessioni** del giorno logico.
- **Totale giorno**: **9.00** (formato ore.minuti) — **Extra**: in base a configurazione, `max(0, ore_giornaliere − oreContrattuali)`. In assenza di `oreContrattuali`, impostare **`extra = 0`** e annotare `// FIXME` nel codice.

---

## 🔁 Gestione **multi‑sessione** (NUOVO in v2)

Un dipendente può **entrare/uscire più volte** nello stesso giorno logico. Ogni coppia produce una **sessione** distinta e deve essere **visibile** sotto la riga principale del giorno.

### Algoritmo di pairing

1. **Raggruppa** record per `giorno_logico` e **ordina** per (`ora_locale`, `created_at` come tie‑breaker).
2. **Scorri** la lista: ad ogni `entrata` associa la **prima `uscita` successiva disponibile**.
3. Se l’uscita è assente → sessione **aperta** (uscita = “—”) → **esclusa** dai totali.
4. **Calcola** ore di ogni sessione; somma per ottenere il **totale giornaliero**.
5. Rendi disponibile sia il **riepilogo per giorno** sia l’array **delle sessioni**.

### Esempio (giorno logico 2025‑10‑09)

|   # | Entrata | Uscita     |  Ore |
| --: | :------ | :--------- | ---: |
|   1 | 09:00   | 11:00      | 2.00 |
|   2 | 13:00   | 17:00      | 4.00 |
|   3 | 22:00   | 01:00 (+1) | 3.00 |

---

## 🖥️ Regole di visualizzazione — pagina **Storico Timbrature**

- **Riga principale del giorno** (già esistente, **layout invariato**): mostra _prima entrata_, _ultima uscita_, **ore totali** e **extra** del giorno logico.
- **Sotto‑righe di dettaglio** (**hotfix v2.1**): mostrate **solo dalla 2ª sessione in poi**
  - Se giorno ha 1 sola sessione → **nessuna sotto-riga**
  - Se giorno ha ≥2 sessioni → sotto-righe per sessioni #2, #3, etc.
  - Formato: "**#N** — Entrata hh:mm · Uscita hh:mm · Ore x,xx"
  - Ordinamento: per orario di entrata crescente
- **Giorni senza timbri**: riga vuota con ore **0.00**.
- **Footer**:
  - **Giorni lavorati** = count dei giorni con `ore_giornaliere > 0`
  - **Ore totali** = somma `ore_giornaliere` su tutto il periodo
  - **Ore totali extra** = somma `extra` su tutto il periodo

---

## 🧪 Test funzionali (obbligatori)

1. **Diurno semplice**: 09:00–17:00 → 1 sessione, ore = 8.00; footer aggiornato.
2. **Notturno**: 22:00–02:00 → stesso giorno logico dell’entrata; ore = 4.00.
3. **Multi‑sessione**: 09–11 + 13–17 → 2 sessioni; totale = 6.00.
4. **Sessione aperta**: Entrata senza uscita → riga sessione con uscita = “—”; non conteggiata nel totale.
5. **Range inclusivo**: `Al` = ultimo giorno del mese → incluso.
6. **PIN equivalenti**: `"01"` ≡ `1` → stesso storico.
7. **Timezone safety**: cambio fuso PC → nessuna deriva ±1 giorno.
8. **Performance**: mese completo carica **< 2s** su macchina standard.

---

## ⚠️ Edge cases e regole di sicurezza

- **Duplicati** (stesso orario): ordinare stabilmente con `created_at` per pairing deterministico.
- **Sequenze irregolari** (Entrata–Entrata, Uscita–Uscita): ignorare i record “fuori coppia” fino alla successiva corrispondenza valida; loggare in dev con prefisso `[StoricoPair]` (rimuovere in produzione).
- **Turni lunghi** (> 16h): considerare anomalia da segnalare nel report amministratore.
- **Nessun impatto su schema DB**: tutto calcolato lato client.
- **Refetch/Realtime**: invalidare cache storico dopo una timbratura o affidarsi a subscription su `timbrature`.

---

## 🔌 Query di riferimento (read‑only)

- Tabella: `timbrature`
- Campi minimi: `pin, tipo, ora_locale, giorno_logico, created_at[, nome, cognome]`
- Filtro: `.eq('pin', pin).gte('giorno_logico', dal).lte('giorno_logico', al)`
- Ordinamento: `.order('giorno_logico', { ascending: true }).order('ora_locale', { ascending: true })`

---

## 🗃️ Retention Operativa

- La retention operativa storica è impostata a **6 mesi**.
- Al 2026-04-18 i controlli globali riportano:
  - `fuori_retention_6m = 0`
  - `future_anomale = 0`
  - intervallo residuo: `2025-10-18` → `2026-04-17`
- La retention non è automatizzata via job DB nel perimetro runtime corrente: richiede procedura amministrativa controllata.

---

## 🧱 Non‑obiettivi (espliciti)

- Nessuna modifica a **layout/UX** della pagina.
- Nessuna modifica a **schema DB** o alle **RPC** di timbratura.
- Nessuna nuova dipendenza lato client.

---

## 🗂️ Collocazione documento

Percorso consigliato nel repo: `DNA/07_logica_giorno_logico.md`  


---

## 🧾 Cronologia versioni

- **v5.0 — 2025-10-13**: **MAJOR FIX** - Implementato calcolo giorno_logico con cutoff 05:00 nel trigger DB, formato ore.minuti (es. 2.27 per 2h27m), visualizzazione di tutti i giorni del periodo anche senza timbrature.
- **v2.1 — 2025-10-10**: Hotfix sotto-righe solo dalla #2 sessione; chiarimenti algoritmo pairing e test performance.
- **v2.0 — 2025-10-09**: Aggiunta **gestione multi‑sessione** e regole di visualizzazione delle sotto‑righe; chiariti edge cases e test obbligatori.
- **v1.x — storico**: Definizione base del giorno logico con riepilogo per giorno (prima entrata/ultima uscita) e calcolo ore.

---

> **Documento aggiornato alla baseline Enterprise Stable (v1.0.0 — 2025-10-21)**  
> Autore: BadgeNode / Cascade AI
