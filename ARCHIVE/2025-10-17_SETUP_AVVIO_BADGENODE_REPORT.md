# REPORT FINALE — Setup & Avvio BadgeNode su Mac nuovo (Esecuzione Assistita, NO commit)

Data: 2025-10-17
Responsabile: Cascade (assistente)
Percorso repo: `/Users/dero/Documents/badgenode_main/badgenode`

---

## 1) Obiettivo
- Portare in esecuzione BadgeNode in locale su Mac nuovo, installando strumenti minimi, configurando `.env.local` con variabili Supabase fornite, installando le dipendenze, avviando il server e verificando endpoint/feature principali.
- Esclusi commit/push GitHub e senza scrivere segreti in sorgente.

## 2) Dati e Sicurezza
- Porta dev prevista: `3001`.
- Supabase forniti dall’utente (mascherati nei log):
  - `VITE_SUPABASE_URL`: `https://tutl...ogz.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `eyJh...WfcY`
  - `SUPABASE_URL`: `https://tutl...ogz.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY`: `eyJh...RGwUvE`
- Segreti solo in `.env.local` (gitignored). Nessun commit/push.

## 3) Stato ambiente (diagnostica)
- Architettura: ARM64 (Apple M4) • macOS 26.0.1
- Shell: zsh • PATH valido di sistema
- Xcode Command Line Tools: non configurati (errore `xcode-select`).
- Rosetta: presente/attiva.
- Node/npm/yarn/pnpm/bun: non installati.
- Log tecnico: `DOCS/SETUP_RUNTIME_LOG.md` (generato).

## 4) Piano operativo eseguito/parziale
- Preparazione documentazione (fasi 0–5) completate in sessioni precedenti:
  - Consolidati: `CHANGELOG.md`, `DOCS/ARCHIVIO_REPORTS.md`, `README_PROGETTO.md`.
  - Aggiornati: `DOCS/04_config_sviluppo.md` (placeholder env), `DOCS/07_logica_giorno_logico.md`, `DOCS/02_struttura_progetto.md`.
  - Pulizia: rimossi `CHANGELOG_STEP_*`, `DOCS/REPORT_GENERICI/`, `DOCS/DOC IMPORTANTI/`, residui.
- Esecuzione assistita setup (questa sessione):
  - Raccolta dati Supabase (usati solo in `.env.local`).
  - Creazione log diagnostico `DOCS/SETUP_RUNTIME_LOG.md`.
  - Non eseguite installazioni/avvio perché assente Node/npm.

## 5) Checklist esecuzione (comandi pronti)

1) Prerequisiti macOS
```
xcode-select --install || true
```
2) Homebrew + NVM + Node LTS
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || true
brew --version
brew install nvm jq wget tree fd || true
mkdir -p ~/.nvm
grep -q 'NVM_DIR' ~/.zshrc || cat >> ~/.zshrc <<'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"
EOF
. ~/.zshrc
. "$(brew --prefix nvm)/nvm.sh"
nvm install --lts && nvm alias default 'lts/*' && nvm use --lts
node -v && npm -v
corepack disable || true
```
3) Posizionamento progetto
```
cd /Users/dero/Documents/badgenode_main/badgenode
pwd
```
4) Configura `.env.local` (solo locale; segreti non committati)
```
[ -f .env.local ] || cp .env.example .env.local
# Inserisci valori reali forniti dall'utente:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
# PORT=3001
# VITE_API_SERVER_ONLY=1
# READ_ONLY_MODE=1  # consigliato al primo avvio
```
5) Dipendenze & build check
```
npm ci || npm install
npm run build || true
npm run lint || true
```
6) Avvio + verifiche endpoint
```
npm run dev &
# attesa server up su 3001
n=0; until curl -fsS http://localhost:3001/api/health >/dev/null 2>&1; do ((n++>60)) && { echo "Server non raggiungibile"; break; }; sleep 1; done
curl -s http://localhost:3001/api/health || true
curl -s http://localhost:3001/api/ready  || true
curl -s http://localhost:3001/api/version || true
```
7) Smoke test Supabase (lettura)
- Usare `npm run smoke:runtime` (già presente) per validare connessione e query in sola lettura.

## 6) Esito sessione
- Documentazione: consolidata e pronta.
- Setup runtime: parzialmente completato (diagnostica + istruzioni). Mancano installazione Node/npm e avvio.
- Nessun commit/push eseguito.

## 7) Cosa resta da fare
- Installare Xcode CLT e Node LTS con NVM.
- Compilare `.env.local` con i valori forniti (già in tuo possesso) e mantenere `READ_ONLY_MODE=1` al primo avvio.
- `npm install` → `npm run dev` → aprire `http://localhost:3001`.
- Verificare endpoints `/api/health`, `/api/ready`, `/api/version` e smoke test `npm run smoke:runtime`.

## 8) Riferimenti
- Documentazione entry point: `README_PROGETTO.md`
- Archivio storico: `DOCS/ARCHIVIO_REPORTS.md`
- Changelog unico: `CHANGELOG.md`
- Log diagnostico macchina: `DOCS/SETUP_RUNTIME_LOG.md`
