// Test del tastierino: fluidità, precisione, reattività.
// SOLO interazione UI sul display PIN — nessuna timbratura, nessuna scrittura DB.
// Per sicurezza assoluta, ogni scrittura verso /api/** viene bloccata.

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Blocca QUALSIASI scrittura: questi test toccano solo il keypad, mai il DB.
  await page.route('**/api/**', (route) => {
    const m = route.request().method();
    if (m === 'POST' || m === 'PATCH' || m === 'DELETE') return route.abort();
    return route.continue();
  });
  await page.addStyleTag({
    content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
  });
  await page.goto('/');
  // attende che il keypad sia interagibile (oltre l'intro splash)
  await expect(page.getByTestId('button-key-1')).toBeVisible();
});

// Il display mostra il placeholder 'PIN' quando vuoto: lo normalizziamo a stringa vuota.
async function pinText(page: import('@playwright/test').Page): Promise<string> {
  const raw = ((await page.getByTestId('display-pin').textContent()) || '').replace(/\s/g, '');
  return raw === 'PIN' ? '' : raw;
}

test.describe('Tastierino — precisione input', () => {
  test('digita una cifra e la riflette nel display', async ({ page }) => {
    await page.getByTestId('button-key-7').click();
    const txt = await pinText(page);
    expect(txt.length).toBeGreaterThan(0);
  });

  test('digita 4 cifre: il display mostra esattamente la sequenza', async ({ page }) => {
    for (const k of ['1', '2', '3', '4']) await page.getByTestId(`button-key-${k}`).click();
    expect(await pinText(page)).toBe('1234');
  });

  test('limite massimo 4 cifre: la 5ª viene ignorata', async ({ page }) => {
    for (const k of ['1', '2', '3', '4', '5']) await page.getByTestId(`button-key-${k}`).click();
    expect(await pinText(page)).toBe('1234'); // la 5 non entra
  });

  test('clear azzera il display', async ({ page }) => {
    for (const k of ['9', '9']) await page.getByTestId(`button-key-${k}`).click();
    expect((await pinText(page)).length).toBe(2);
    await page.getByTestId('button-key-clear').click();
    expect((await pinText(page)).length).toBe(0);
  });
});

test.describe('Tastierino — fluidità e reattività', () => {
  test('digitazione rapida di tutte le cifre resta coerente (max 4)', async ({ page }) => {
    // sequenza incrociata rapida: simula tap veloci
    for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']) {
      await page.getByTestId(`button-key-${k}`).click();
    }
    // il display non deve mai superare 4 caratteri qualunque sia la velocità
    expect((await pinText(page)).length).toBe(4);
  });

  test('cicli digita/clear ripetuti restano stabili (nessuno stato residuo)', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByTestId('button-key-1').click();
      await page.getByTestId('button-key-2').click();
      await page.getByTestId('button-key-clear').click();
      expect((await pinText(page)).length).toBe(0);
    }
  });

  test('sequenza incrociata cifre+clear+cifre produce lo stato atteso', async ({ page }) => {
    await page.getByTestId('button-key-5').click();
    await page.getByTestId('button-key-5').click();
    await page.getByTestId('button-key-clear').click();
    await page.getByTestId('button-key-3').click();
    expect((await pinText(page)).length).toBe(1);
  });

  test('reattività: 4 tap rapidi completano e il display è coerente', async ({ page }) => {
    for (const k of ['1', '2', '3', '4']) await page.getByTestId(`button-key-${k}`).click();
    // la reattività si misura sulla coerenza dello stato dopo input rapidi:
    // ogni tap deve essere registrato esattamente una volta, nell'ordine corretto.
    expect(await pinText(page)).toBe('1234');
  });
});

test.describe('Tastierino — pulsanti azione presenti', () => {
  test('entrata e uscita sono visibili e cliccabili dopo PIN', async ({ page }) => {
    await page.getByTestId('button-key-9').click();
    await page.getByTestId('button-key-9').click();
    await expect(page.getByTestId('button-entrata')).toBeVisible();
    await expect(page.getByTestId('button-uscita')).toBeVisible();
  });
});
