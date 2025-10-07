# 🛠️ Script Utility - BadgeNode

## Indice

- [Panoramica](#panoramica)
- [Script Backup](#script-backup)
- [Script Diagnosi](#script-diagnosi)
- [Script Documentazione](#script-documentazione)
- [Script Template](#script-template)
- [File Length Guard](#file-length-guard)

---

## Panoramica

Tutti gli script sono in `/scripts` e utilizzano TypeScript con `tsx`.

---

## Script Backup

### `backup.ts`

**Funzione**: Crea archivi automatici con rotazione

**Uso**:

```bash
npm run esegui:backup
```

**Comportamento**:

- Crea `Backup_Automatico/backup_YYYYMMDD_HHMM.tar.gz`
- Esclude: node_modules, dist, build, .git, cache
- Mantiene solo ultimi 3 archivi
- Log in `Backup_Automatico/REPORT_BACKUP.txt`

### `backup-restore.ts`

**Funzione**: Ripristino sicuro backup

**Uso**:

```bash
# Preview contenuti
npm run backup:restore -- --preview backup_20241008_0114.tar.gz

# Ripristino confermato
npm run backup:restore -- --confirm backup_20241008_0114.tar.gz
```

**Sicurezza**: Non sovrascrive senza conferma esplicita

---

## Script Diagnosi

### `diagnose.ts`

**Funzione**: Scansione qualità codebase

**Uso**:

```bash
npm run diagnose          # Prima esecuzione
npm run diagnose:force    # Forza riesecuzione
```

**Controlli**:

- File >200 righe (violazioni)
- File ≥150 righe (warning)
- File duplicati
- TODO/FIXME nel codice
- File temporanei
- Errori configurazione

**Output**:

- `REPORT_DIAGNOSI_INIZIALE.txt`
- `.diagnose_done` (sentinella)

---

## Script Documentazione

### `consolidate-docs.ts`

**Funzione**: Unisce documentazione in report unico

**Uso**:

```bash
npm run docs:consolidate
```

**Output**: `DOCS/REPORT_CONSOLIDATO.txt` con:

- Sommario documenti
- Indice sorgenti
- Sezione file rimossi
- Timestamp consolidamento

---

## Script Template

### `template-component.ts`

**Funzione**: Genera scaffold componenti React

**Uso**:

```bash
npm run gen:component -- --name UserCard --type component
npm run gen:component -- --name useAuth --type hook
npm run gen:component -- --name Dashboard --type page
```

**Caratteristiche**:

- Template <140 righe
- Warning se supera 150 righe
- Suggerimenti split automatici
- TypeScript + best practices

---

## File Length Guard

### `file-length-guard.js`

**Funzione**: Controllo limite 200 righe

**Modalità**:

- `STRICT_200=false`: Solo warning (Prompt 1/2)
- `STRICT_200=true`: Blocca commit (Prompt 2/2)

**Comportamento**:

- Ispeziona solo file in stage (`git diff --cached`)
- Exit 1 se file >200 righe in modalità strict
- Warning sempre per file ≥150 righe

**Integrazione**: Hook pre-commit Husky

---

## NPM Scripts Correlati

```json
{
  "esegui:backup": "tsx scripts/backup.ts",
  "backup:list": "ls -lah Backup_Automatico",
  "backup:restore": "tsx scripts/backup-restore.ts",
  "diagnose": "tsx scripts/diagnose.ts",
  "diagnose:force": "rm -f .diagnose_done && tsx scripts/diagnose.ts",
  "docs:consolidate": "tsx scripts/consolidate-docs.ts",
  "gen:component": "tsx scripts/template-component.ts"
}
```

---

## Troubleshooting

### Errori Comuni

- **Permission denied**: `chmod +x scripts/*.ts`
- **tsx not found**: `npm i -D tsx`
- **Backup fallito**: Verificare spazio disco
- **Guard non attivo**: Controllare hook Husky

### Log Files

- `Backup_Automatico/REPORT_BACKUP.txt`
- `REPORT_DIAGNOSI_INIZIALE.txt`
- `DOCS/REPORT_CONSOLIDATO.txt`

---

**Policy**: Eseguire backup prima di ogni modifica strutturale
