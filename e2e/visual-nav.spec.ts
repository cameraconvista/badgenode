// Test di navigazione e regressione visiva — SOLO OSSERVAZIONE.
// Nessuna interazione di scrittura, nessuna chiamata reale al DB.
// Gira sui project chromium (desktop) e mobile (Pixel 5) definiti in playwright.config.ts.
// I selettori usati corrispondono alla UI reale (auth bypass attivo: route accessibili).

import { test, expect } from '@playwright/test';

// Disabilita animazioni/caret per screenshot stabili.
test.beforeEach(async ({ page }) => {
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }`,
  });
});

test.describe('Navigazione pagine', () => {
  test('home carica con keypad e display PIN', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BadgeNode/);
    await expect(page.getByTestId('display-pin')).toBeVisible();
    await expect(page.getByTestId('button-entrata')).toBeVisible();
    await expect(page.getByTestId('button-uscita')).toBeVisible();
    // tastierino numerico presente
    await expect(page.getByTestId('button-key-1')).toBeVisible();
    await expect(page.getByTestId('button-key-0')).toBeVisible();
  });

  test('archivio dipendenti carica con intestazione', async ({ page }) => {
    await page.goto('/archivio-dipendenti');
    await expect(page.getByRole('heading', { name: 'Archivio Dipendenti' })).toBeVisible();
  });

  test('storico timbrature carica nel guscio admin', async ({ page }) => {
    await page.goto('/storico-timbrature');
    // L'intestazione "Storico Timbrature" è stata rimossa (ora l'header mostra il
    // nome del dipendente): verifica invece che la pagina monti nel guscio admin
    // (logo BADGENODE presente sia su desktop che nella topbar mobile).
    await expect(page.getByRole('img', { name: 'BADGENODE' }).first()).toBeVisible();
  });

  test('rotta inesistente mostra la pagina 404', async ({ page }) => {
    await page.goto('/rotta-che-non-esiste');
    await expect(page.getByText('404 Page Not Found')).toBeVisible();
  });
});

test.describe('Interazione keypad (read-only, nessuna scrittura)', () => {
  test('digitare un PIN aggiorna il display senza inviare nulla', async ({ page }) => {
    // Blocca per sicurezza qualsiasi POST/PATCH/DELETE verso le API: questo test non scrive.
    await page.route('**/api/**', (route) => {
      const m = route.request().method();
      if (m === 'POST' || m === 'PATCH' || m === 'DELETE') {
        return route.abort();
      }
      return route.continue();
    });

    await page.goto('/');
    await page.getByTestId('button-key-1').click();
    await page.getByTestId('button-key-2').click();
    // il display PIN deve riflettere l'input (mascherato o numerico)
    const display = page.getByTestId('display-pin');
    await expect(display).toBeVisible();
    await expect(display).not.toBeEmpty();

    // clear riporta il display allo stato vuoto/iniziale
    await page.getByTestId('button-key-clear').click();
  });
});

test.describe('Regressione visiva', () => {
  test('snapshot home', async ({ page }) => {
    await page.goto('/');
    // Attende che l'intro splash (overlay fixed) lasci interagibile il keypad,
    // così lo screenshot cattura la UI reale e non la schermata di intro animata.
    const entrata = page.getByTestId('button-entrata');
    await expect(entrata).toBeVisible();
    await expect(async () => {
      await entrata.click({ trial: true, timeout: 500 });
    }).toPass({ timeout: 5000 });
    await expect(page).toHaveScreenshot('home.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      // l'orologio live cambia a ogni run: mascherato per evitare falsi positivi
      mask: [page.getByTestId('text-datetime')],
    });
  });

  test('snapshot 404', async ({ page }) => {
    await page.goto('/rotta-che-non-esiste');
    await expect(page.getByText('404 Page Not Found')).toBeVisible();
    await expect(page).toHaveScreenshot('not-found.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
