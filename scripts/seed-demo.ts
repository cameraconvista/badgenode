/* Seed 10 demo users and random timbrature for the last 3 months.
   Uses local server APIs: /api/utenti and /api/timbrature
   Requirements: dev server running on :3001
*/

const BASE = process.env.BADGENODE_BASE_URL || 'http://localhost:3001';

async function postJson(path: string, body: any) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const msg = (data && typeof data === 'object' && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(`${path} → ${msg}`);
  }
  return data;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWorkDaysWithin(daysBack: number, count: number): Date[] {
  const set = new Set<string>();
  while (set.size < count) {
    const offset = randInt(0, daysBack);
    const d = new Date();
    d.setDate(d.getDate() - offset);
    // skip weekends ~50%
    const wd = d.getDay();
    if (wd === 0 || wd === 6) continue;
    set.add(d.toISOString().slice(0, 10));
  }
  return Array.from(set).map(s => new Date(`${s}T12:00:00Z`));
}

async function seed() {
  console.log('🚀 Seed demo — base:', BASE);

  const demoUsers = Array.from({ length: 10 }).map((_, i) => {
    const pin = 11 + i; // 11..20
    const nome = `Demo${String(i + 1).padStart(2, '0')}`;
    const cognome = `Utente${String(i + 1).padStart(2, '0')}`;
    return { pin, nome, cognome };
  });

  // 1) Upsert utenti
  for (const u of demoUsers) {
    try {
      const r = await postJson('/api/utenti', u);
      console.log('👤 Utente ok:', r?.data?.pin ?? u.pin, r?.data?.nome ?? u.nome);
    } catch (e) {
      console.warn('⚠️  Utente skip:', u.pin, (e as Error).message);
    }
  }

  // 2) Timbrature casuali negli ultimi 90 giorni (circa 12 giorni a testa)
  for (const u of demoUsers) {
    const days = randomWorkDaysWithin(90, 12);
    for (const day of days) {
      const yyyy = day.getUTCFullYear();
      const mm = String(day.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(day.getUTCDate()).padStart(2, '0');

      // Entrata tra 07:30 e 10:00
      const hIn = randInt(7, 10);
      const mIn = hIn === 7 ? randInt(30, 59) : randInt(0, 59);
      const tsIn = new Date(Date.UTC(yyyy, Number(mm) - 1, Number(dd), hIn, mIn, 0)).toISOString();

      // Uscita 7..10 ore dopo
      const hDelta = randInt(7, 10);
      const mDelta = randInt(0, 30);
      const tsOut = new Date(Date.parse(tsIn) + (hDelta * 60 + mDelta) * 60 * 1000).toISOString();

      try {
        await postJson('/api/timbrature', { pin: u.pin, tipo: 'entrata', ts: tsIn });
        await postJson('/api/timbrature', { pin: u.pin, tipo: 'uscita', ts: tsOut });
        console.log(`⏱️  PIN ${u.pin} ${yyyy}-${mm}-${dd} OK`);
      } catch (e) {
        console.warn(`⚠️  Timbrature skip PIN ${u.pin} ${yyyy}-${mm}-${dd}:`, (e as Error).message);
      }
    }
  }

  console.log('✅ Seed completato');
}

seed().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
