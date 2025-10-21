import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('dovrebbe mostrare la home page per default', async ({ page }) => {
    await page.goto('/');
    
    // Verifica che la home page sia caricata
    await expect(page).toHaveTitle(/BadgeNode/);
    
    // Verifica presenza del keypad per PIN
    await expect(page.locator('[data-testid="keypad"]')).toBeVisible();
    
    // Verifica presenza dei pulsanti numerici
    for (let i = 0; i <= 9; i++) {
      await expect(page.locator(`[data-testid="key-${i}"]`)).toBeVisible();
    }
    
    // Verifica presenza pulsanti di controllo
    await expect(page.locator('[data-testid="key-clear"]')).toBeVisible();
    await expect(page.locator('[data-testid="key-backspace"]')).toBeVisible();
  });

  test('dovrebbe permettere inserimento PIN valido', async ({ page }) => {
    await page.goto('/');
    
    // Inserisci PIN valido (assumendo PIN 1 esista)
    await page.click('[data-testid="key-1"]');
    
    // Verifica che il PIN sia visualizzato (mascherato)
    const pinDisplay = page.locator('[data-testid="pin-display"]');
    await expect(pinDisplay).toContainText('*');
    
    // Conferma PIN
    await page.click('[data-testid="key-enter"]');
    
    // Verifica che venga mostrato il form timbrature o messaggio di successo
    // (dipende dalla logica dell'app)
    await expect(page.locator('[data-testid="timbrature-form"]')).toBeVisible();
  });

  test('dovrebbe gestire PIN non valido', async ({ page }) => {
    await page.goto('/');
    
    // Inserisci PIN non valido (assumendo PIN 99 non esista)
    await page.click('[data-testid="key-9"]');
    await page.click('[data-testid="key-9"]');
    
    // Conferma PIN
    await page.click('[data-testid="key-enter"]');
    
    // Verifica messaggio di errore
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/PIN non valido|PIN non trovato/);
  });

  test('dovrebbe permettere cancellazione PIN', async ({ page }) => {
    await page.goto('/');
    
    // Inserisci alcuni numeri
    await page.click('[data-testid="key-1"]');
    await page.click('[data-testid="key-2"]');
    
    // Verifica che il PIN sia visualizzato
    const pinDisplay = page.locator('[data-testid="pin-display"]');
    await expect(pinDisplay).toContainText('**');
    
    // Usa backspace
    await page.click('[data-testid="key-backspace"]');
    await expect(pinDisplay).toContainText('*');
    
    // Usa clear
    await page.click('[data-testid="key-clear"]');
    await expect(pinDisplay).toHaveText('');
  });

  test('dovrebbe gestire PIN fuori range', async ({ page }) => {
    await page.goto('/');
    
    // Inserisci PIN 0 (non valido)
    await page.click('[data-testid="key-0"]');
    await page.click('[data-testid="key-enter"]');
    
    // Verifica messaggio di errore per PIN fuori range
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/PIN deve essere tra 1 e 99/);
  });

  test('dovrebbe navigare alla pagina admin', async ({ page }) => {
    await page.goto('/');
    
    // Cerca link o pulsante per accesso admin
    const adminLink = page.locator('[data-testid="admin-link"]');
    if (await adminLink.isVisible()) {
      await adminLink.click();
      
      // Verifica navigazione alla pagina admin
      await expect(page).toHaveURL(/\/admin|\/archivio-dipendenti/);
    }
  });

  test('dovrebbe essere responsive su mobile', async ({ page }) => {
    // Simula viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verifica che il keypad sia ancora visibile e usabile
    await expect(page.locator('[data-testid="keypad"]')).toBeVisible();
    
    // Verifica che i pulsanti abbiano dimensioni adeguate per touch
    const keyButton = page.locator('[data-testid="key-1"]');
    const boundingBox = await keyButton.boundingBox();
    
    // Verifica dimensioni minime per touch targets (48px)
    expect(boundingBox?.width).toBeGreaterThanOrEqual(48);
    expect(boundingBox?.height).toBeGreaterThanOrEqual(48);
  });
});
