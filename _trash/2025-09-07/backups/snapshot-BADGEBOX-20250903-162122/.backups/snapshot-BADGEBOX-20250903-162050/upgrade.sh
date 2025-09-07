
#!/bin/bash

echo "🔐 BADGEBOX - Controllo Sicurezza Upgrade"
echo "========================================="

# Verifica se siamo nella directory corretta
if [ ! -f "package.json" ] || [ ! -f "index.html" ]; then
    echo "❌ Errore: Non sei nella directory corretta del progetto BADGEBOX"
    exit 1
fi

# Verifica connessione GitHub
echo "🌐 Verifica connessione GitHub..."
if ! git ls-remote origin &> /dev/null; then
    echo "❌ Errore: Impossibile connettersi al repository GitHub"
    exit 1
fi

echo "✅ Connessione GitHub verificata"

# Esegui l'upgrade
echo "🚀 Avvio upgrade automatico..."
node upgrade-github.js

echo "🎉 Processo completato!"
