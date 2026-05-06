# Script Archiviati - 2025-11-02

Documento storico locale alla cartella archivio. Non e` documentazione canonica `DNA/`.

**Data archiviazione**: 2025-11-02T03:17:00+01:00  
**Motivo**: Cleanup script one-time/storici non più necessari  
**Totale file**: 25  
**Spazio**: 144 KB

## File Archiviati

### Batch Insert/Correct (14 file)
Script usati per import iniziale dati ottobre/novembre 2025:
- batch-insert-novembre.ts
- batch-insert-pin1-ottobre.ts
- batch-insert-pin2-ottobre.ts
- batch-insert-pin5-novembre.ts
- batch-insert-pin7-novembre.ts
- batch-insert-veronica.ts
- correct-pin04-ottobre.ts
- correct-pin05-ottobre.ts
- correct-pin07-ottobre.ts
- fix-pin1-ottobre.ts
- fix-pin2-final.ts
- fix-pin2-ottobre.ts
- insert-direct-pin2.ts
- delete-wrong-november.ts

### Verify Scripts (7 file)
Script di verifica post-import:
- verify-all-corrections.ts
- verify-insert.ts
- verify-novembre.ts
- verify-pin1-ottobre.ts
- verify-pin2-ottobre.ts
- verify-pin5-novembre.ts
- verify-pin7-novembre.ts

### Test/Debug (4 file)
Script di test/debug una tantum:
- analyze-wrong-dates.ts
- test-client-giorno-logico.ts
- test-fix-giorno-logico.ts
- clean-demo-users.ts

## Uso corretto

Se serve consultare o riusare questi script:
- trattarli come materiale storico
- verificare sempre il codice e il DB reale prima di eseguirli
- non riportarli in `scripts/` attivi senza richiesta esplicita

Se necessario ripristinare temporaneamente per analisi:
```bash
cp scripts/_archive/2025-11-02_cleanup/*.ts scripts/
```

---

**Nota**: Questi script sono stati archiviati perché:
1. Dati già importati nel database
2. Verifiche già completate
3. Debug/test già eseguiti
4. Non più necessari per il funzionamento dell'app
