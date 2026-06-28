// Smoke del flusso di timbratura COMPLETAMENTE ISOLATO.
// Tutte le chiamate /api/** sono intercettate e simulate: nessuna scrittura
// reale su Supabase. Verifica solo che la UI reagisca correttamente.

import { test, expect } from '@playwright/test';

test.describe('Flusso timbratura isolato (rete mockata)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercetta validazione PIN: simula un utente valido per PIN 1.
    await page.route('**/api/pin/validate**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true, pin: 1, nome: 'Test', cognome: 'Utente' }),
      })
    );

    // Intercetta lettura timbrature: nessuna timbratura pregressa.
    await page.route('**/api/timbrature**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
      // Una eventuale scrittura viene simulata come successo, MA non raggiunge il DB.
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, tipo: 'entrata', pin: 1, mocked: true }),
      });
    });
  });

  test('digitando un PIN i pulsanti azione restano visibili', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('button-key-1').click();
    await expect(page.getByTestId('button-entrata')).toBeVisible();
    await expect(page.getByTestId('button-uscita')).toBeVisible();
    // Nessun click su entrata/uscita: lo smoke verifica la resa, non scrive.
  });

  test('nessuna chiamata di scrittura raggiunge un backend reale', async ({ page }) => {
    const writes: string[] = [];
    page.on('request', (req) => {
      const m = req.method();
      if ((m === 'POST' || m === 'PATCH' || m === 'DELETE') && req.url().includes('/api/')) {
        writes.push(`${m} ${req.url()}`);
      }
    });

    await page.goto('/');
    await page.getByTestId('button-key-1').click();
    await page.waitForTimeout(300);

    // Se ci sono state scritture, sono comunque tutte intercettate dai mock sopra.
    // Il test documenta che durante la navigazione base non parte alcuna scrittura.
    expect(writes, `Scritture osservate: ${writes.join(', ')}`).toHaveLength(0);
  });
});
