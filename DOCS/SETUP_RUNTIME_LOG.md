# SETUP_RUNTIME_LOG — BadgeNode (Mac nuovo)

Data: 2025-10-17
Ambiente: macchina locale utente
Ambito: sola diagnostica e istruzioni (nessuna installazione automatica, nessun commit)

---

## 1) System Info
- arch: arm64
- CPU: Apple M4
- macOS: 26.0.1 (Build 25A362)

## 2) Shell & PATH
- SHELL: /bin/zsh
- zsh: yes
- PATH: /usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin

## 3) Xcode Command Line Tools
- Stato: non configurati (xcode-select errore: "Unable to get active developer directory")

## 4) Rosetta (solo per Apple Silicon)
- Rosetta process: running
- Pacchetto: com.apple.pkg.RosettaUpdateAuto (install-time presente)

## 5) Node & Package Managers
- node: not found
- npm: not found
- yarn: not found
- pnpm: not found
- bun: not found

---

## 6) Prossimi passi raccomandati (riassunto)
1. Installa Xcode Command Line Tools: `xcode-select --install`
2. Installa Homebrew (se assente), poi NVM.
3. Installa Node LTS via nvm (es. 20.x): `nvm install --lts && nvm use --lts`
4. Configura `.env.local` con le variabili Supabase (non committare).
5. Installa dipendenze `npm install` e avvia `npm run dev`.
6. Verifica endpoint `/api/health`, `/api/ready`, `/api/version`.

Note: log creato a sola consultazione locale.
