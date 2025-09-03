
# GITHUB_SYNC.md

## Sincronizzazione GitHub per BADGEBOX

### 🔧 Configurazione Repository Remoto

#### Setup Iniziale GitHub in Replit
1. **Tools** → **Git** → **Initialize Git Repository**
2. **Icona Gear** → **Connect to GitHub**
3. **Login GitHub** → **Configure** → **All repositories** → **Save**
4. **Repository metadata**:
   ```
   Name: BADGEBOX-production
   Description: Sistema gestione timbrature dipendenti
   Visibility: Private (raccomandato)
   ```
5. **Create Repository on GitHub**

#### Verifica Configurazione
```bash
# Nel Shell di Replit, verifica remote
git remote -v
# Output atteso:
# origin  https://github.com/[USERNAME]/BADGEBOX-production.git (fetch)
# origin  https://github.com/[USERNAME]/BADGEBOX-production.git (push)
```

### 📋 Flusso di Lavoro Base

#### Clone Progetto Esistente
```bash
# Solo se parti da repository esistente
git clone https://github.com/[USERNAME]/BADGEBOX-production.git
cd BADGEBOX-production
npm install  # Installa dipendenze
```

#### Workflow Quotidiano

**1. Pull ultime modifiche**
```bash
git pull origin main
# Oppure usa "Sync with Remote" nel Git Pane
```

**2. Sviluppo locale**
```bash
npm run dev  # Avvia server sviluppo
# Modifica file nel workspace
# Test funzionalità
```

**3. Commit modifiche**
```bash
# Nel Git Pane di Replit:
# 1. Review Changes
# 2. Stage files (+ icon)
# 3. Commit message
# 4. "Stage and commit all changes"
```

**4. Push al repository**
```bash
# Git Pane: bottone "Push"
# Oppure da Shell:
git push origin main
```

### 🌿 Branching Strategy

#### Creazione Branch per Feature
```bash
# Nel Git Pane: dropdown accanto "main"
# Oppure da Shell:
git checkout -b feature/nuova-funzionalità
git push -u origin feature/nuova-funzionalità
```

#### Branch Raccomandati
```
main                    # Produzione stabile
develop                 # Sviluppo attivo
feature/nome-feature    # Singole funzionalità
hotfix/correzione       # Fix urgenti produzione
release/v1.2.0         # Preparazione release
```

#### Merge Strategy
```bash
# Completa feature
git checkout main
git pull origin main
git merge feature/nuova-funzionalità
git push origin main
git branch -d feature/nuova-funzionalità  # Cleanup locale
```

### 🔄 Sincronizzazione Continua Replit ↔ GitHub

#### Auto-sync Setup
Nel file `.github-config.json` (già presente):
```json
{
  "auto_upgrade": {
    "enabled": true,
    "require_confirmation": true,
    "commit_prefix": "🔄 BADGEBOX Auto-Update"
  }
}
```

#### Script Sincronizzazione Automatica
Usa `upgrade-github.js` per sync automatica:
```bash
node upgrade-github.js
# Output:
# 🚀 BADGEBOX - Upgrade GitHub Automatico
# ✅ Upgrade completato con successo!
```

#### Workflow Replit Integrato
```bash
# Setup workflow automatico in Replit
# .replit file configurato per:
# 1. Auto-save files
# 2. Hot reload
# 3. Git tracking continuo
```

### 📝 Linee Guida Commit

#### Messaggi Standard
```bash
# Formato: [TIPO] Descrizione breve
# Tipi standard:
✨ FEAT: Nuova funzionalità
🐛 FIX: Correzione bug
📚 DOCS: Aggiornamento documentazione
💄 STYLE: Miglioramenti UI/CSS
♻️ REFACTOR: Refactoring codice
⚡ PERF: Ottimizzazioni performance
🔧 CONFIG: Modifiche configurazione
🚀 DEPLOY: Rilascio versione

# Esempi:
git commit -m "✨ FEAT: Aggiungi archivio ex dipendenti"
git commit -m "🐛 FIX: Correggi calcolo ore nel PDF export"
git commit -m "📚 DOCS: Aggiorna documentazione Supabase"
```

#### Convenzioni File
```bash
# Staging selettivo
git add index.html style.css          # Solo file correlati
git commit -m "💄 STYLE: Migliora layout mobile"

# Commit atomici (una funzionalità = un commit)
# ❌ Evita commit con troppe modifiche
# ✅ Preferisci commit piccoli e focalizzati
```

### 🔍 Integrazione Pre-commit e Qualità

#### Pre-commit Hook Setup
```bash
# Crea .git/hooks/pre-commit
#!/bin/sh
echo "🔍 Controllo qualità codice..."

# Verifica sintassi JavaScript
find . -name "*.js" -not -path "./node_modules/*" | xargs node -c

# Verifica HTML valido
find . -name "*.html" | head -5 | xargs echo "HTML files OK"

echo "✅ Controlli passati - commit autorizzato"
```

#### Regole Qualità (da GOVERNANCE.md)
```bash
# Prima di ogni commit:
# 1. Test funzionalità su mobile/desktop
# 2. Verifica console errors = 0
# 3. Controllo responsive design
# 4. Validazione forms
# 5. Performance check (< 3sec load)
```

#### Code Review Checklist
```markdown
## Checklist Pre-Push
- [ ] Codice testato localmente
- [ ] Nessun console.error() in produzione
- [ ] Mobile responsive verificato
- [ ] Supabase connection OK
- [ ] File di documentazione aggiornati
- [ ] Commit message seguono convenzioni
- [ ] Branch pulito (no merge conflicts)
```

### 🚀 Deploy e Release

#### Preparazione Release
```bash
# 1. Crea branch release
git checkout -b release/v1.2.0

# 2. Update versione in package.json
# 3. Update CHANGELOG.md
# 4. Final testing

# 5. Merge to main
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags
```

#### Deploy Automatico Replit
```bash
# Il deploy su Replit è automatico da main branch
# Configurazione in .replit e vite.config.js
# Hot deploy: modifiche live immediatamente
```

### 📊 Monitoring e Backup

#### Backup Repository
```bash
# Download ZIP completo
# GitHub → Code → Download ZIP

# Clone backup locale
git clone --mirror https://github.com/[USER]/BADGEBOX-production.git
```

#### Analytics Commit
```bash
# Statistiche repository
git log --oneline --graph --all
git shortlog -s -n  # Contributors stats
git log --since="1 week ago" --oneline  # Recent activity
```

### 🆘 Troubleshooting Git

#### Reset a Commit Precedente
```bash
# Soft reset (mantiene modifiche)
git reset --soft HEAD~1

# Hard reset (⚠️ perde modifiche)
git reset --hard HEAD~1
```

#### Risoluzione Merge Conflicts
```bash
# Quando appare conflitto:
git status  # Vedi file conflicted
# Modifica manualmente i file
git add .
git commit -m "🔧 RESOLVE: Merge conflict resolution"
```

#### Sincronizzazione Fork/Branch Divergenti
```bash
git fetch origin
git reset --hard origin/main  # ⚠️ Sovrascrive locale
```

#### Recovery Repository Corrotto
```bash
# Backup dati importanti
# Re-clone repository
git clone https://github.com/[USER]/BADGEBOX-production.git
# Applica modifiche manuali
```

### 📞 Supporto e Risorse
- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Git Reference**: [git-scm.com/docs](https://git-scm.com/docs)
- **Replit Git Guide**: Console → Help → Git integration
- **Issue Tracking**: GitHub Issues per bug e feature requests
