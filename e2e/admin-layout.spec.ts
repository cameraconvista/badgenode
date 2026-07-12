// Layout admin (sidebar/drawer + scroll-x tabelle) — SOLO OSSERVAZIONE.
// Rete completamente mockata: nessuna chiamata reale, ZERO scritture DB.
// Copre ciò che smoke-isolated/visual-nav non toccano: la sidebar persistente
// (desktop), il drawer (mobile) e lo scroll orizzontale del redesign step 3.
// Selettori e label allineati alla UI reale (adminNavItems.ts / AdminLayout.tsx).

import { test, expect } from '@playwright/test';

// Un dipendente fittizio: serve perché lo Storico "parte dal primo dipendente"
// e senza almeno un utente la pagina resta in "Caricamento utenti...".
const FAKE_UTENTI = [{ pin: 1, nome: 'Mario', cognome: 'Rossi', descrizione: 'Test' }];

// Blocca in modo difensivo qualsiasi scrittura verso le API e simula letture.
// Le scritture vengono ABORTITE: non raggiungono mai un backend reale.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => {
    const method = route.request().method();
    if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
      return route.abort();
    }
    // Endpoint utenti (/api/utenti): ritorna un dipendente così lo Storico
    // può fare il redirect al primo utente e le pagine montano.
    if (/\/api\/utenti(\?|$)/.test(route.request().url())) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FAKE_UTENTI),
      });
    }
    // Ogni altra lettura (timbrature, ex-dipendenti, ecc.): vuota.
    return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  // Disabilita animazioni/transizioni per stabilità (drawer, hover, splash).
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }`,
  });
});

// Le tre voci principali della sidebar admin (ordine e label da adminNavItems.ts).
const NAV_LABELS = ['Dipendenti', 'Ex-Dipendenti', 'Storico'];

// Sezioni admin con montaggio diretto (la sidebar deve essere persistente).
// Lo Storico usa il pin esplicito /storico-timbrature/1: salta il redirect
// "primo utente" e monta subito, senza dipendere dal timing del mock utenti.
const ADMIN_ROUTES = ['/archivio-dipendenti', '/admin/ex-dipendenti', '/storico-timbrature/1'];

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP: la sidebar è laterale e SEMPRE presente in ogni sezione.
// Viewport largo esplicito così il test non dipende dal project (chromium/mobile).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Sidebar admin persistente (desktop)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const path of ADMIN_ROUTES) {
    test(`sidebar completa su ${path}`, async ({ page }) => {
      await page.goto(path);
      for (const label of NAV_LABELS) {
        await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
      }
      // Voce Timbratore (ritorno al keypad) presente nel footer.
      await expect(page.getByRole('button', { name: 'Timbratore' }).first()).toBeVisible();
    });
  }

  test('cliccando le voci si cambia sezione senza ricaricare', async ({ page }) => {
    await page.goto('/archivio-dipendenti');
    await expect(page.getByRole('heading', { name: 'Archivio Dipendenti' })).toBeVisible();

    await page.getByRole('button', { name: 'Ex-Dipendenti' }).first().click();
    await expect(page).toHaveURL(/\/admin\/ex-dipendenti$/);

    await page.getByRole('button', { name: 'Storico' }).first().click();
    await expect(page).toHaveURL(/\/storico-timbrature/);
  });

  test('/admin/ex-dipendenti monta con la sidebar (copertura mancante)', async ({ page }) => {
    await page.goto('/admin/ex-dipendenti');
    await expect(page.getByRole('button', { name: 'Dipendenti' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ex-Dipendenti' }).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE: la sidebar è un DRAWER a scomparsa; il trigger in topbar lo apre.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Drawer mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('il trigger apre il drawer e mostra le voci', async ({ page }) => {
    await page.goto('/archivio-dipendenti');
    // Il trigger (SidebarTrigger) è visibile solo su mobile (topbar md:hidden).
    const trigger = page.getByRole('button', { name: /toggle sidebar/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    // A drawer aperto, le voci di navigazione diventano visibili.
    await expect(page.getByRole('button', { name: 'Ex-Dipendenti' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Storico' }).first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL-X (redesign step 3): la tabella mantiene una larghezza minima e non
// comprime le colonne su schermo stretto.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Scroll orizzontale tabelle (step 3)', () => {
  test('la tabella Dipendenti ha larghezza minima (colonne non compresse)', async ({ page }) => {
    await page.goto('/archivio-dipendenti');
    const table = page.locator('table.archivio-table');
    await expect(table).toBeVisible();
    // min-w-[640px] in ArchivioTable.tsx: la tabella non collassa sotto la soglia.
    const width = await table.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeGreaterThanOrEqual(640);
  });
});
