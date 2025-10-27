# client/src/offline/syncRunner.ts

## PROBLEMA CRITICO - Import di funzioni non esistenti (riga 8)

```typescript
import { getAllPending, markSending, markSent, markReview, remove } from './queue';
```

**ERRORE**: Le funzioni `markSending`, `markSent`, `markReview` NON sono esportate da `queue.ts`

## Funzioni utilizzate ma non definite:
- `markSending(it.client_seq)` - riga 50
- `markSent(it.client_seq)` - riga 61  
- `markReview(it.client_seq, reason)` - riga 77

## Funzioni disponibili in queue.ts:
- `getAllPending()` ✅
- `remove()` ✅
- `enqueuePending()`
- `flushPending()`
- `count()`
- `peekClientSeq()`

**CAUSA ROOT**: Mancanza di implementazione delle funzioni di stato nella queue
**IMPATTO**: Build fallisce completamente, app non si avvia
**SEVERITÀ**: CRITICA
