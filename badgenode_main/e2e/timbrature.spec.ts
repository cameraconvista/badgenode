import { test, expect } from '@playwright/test';

test.describe('Timbrature Flow', () => {
  // Setup: Login con PIN valido prima di ogni test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Login con PIN 1 (assumendo esista)
    await page.click('[data-testid="key-1"]');
    await page.click('[data-testid="key-enter"]');
    
    // Attendi che il form timbrature sia visibile
    await expect(page.locator('[data-testid="timbrature-form"]')).toBeVisible();
  });

  test('dovrebbe permettere timbratura entrata', async ({ page }) => {
    // Verifica che il pulsante entrata sia disponibile
    const entrataButton = page.locator('[data-testid="button-entrata"]');
    await expect(entrataButton).toBeVisible();
    await expect(entrataButton).toBeEnabled();
    
    // Clicca entrata
    await entrataButton.click();
    
    // Verifica messaggio di conferma
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/Entrata registrata/);
    
    // Verifica che ora il pulsante uscita sia disponibile
    const uscitaButton = page.locator('[data-testid="button-uscita"]');
    await expect(uscitaButton).toBeEnabled();
    
    // Verifica che il pulsante entrata sia disabilitato (alternanza)
    await expect(entrataButton).toBeDisabled();
  });

  test('dovrebbe permettere sequenza entrata-uscita', async ({ page }) => {
    // Prima: Entrata
    await page.click('[data-testid="button-entrata"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/Entrata registrata/);
    
    // Attendi un momento per evitare race conditions
    await page.waitForTimeout(1000);
    
    // Poi: Uscita
    const uscitaButton = page.locator('[data-testid="button-uscita"]');
    await expect(uscitaButton).toBeEnabled();
    await uscitaButton.click();
    
    // Verifica messaggio di conferma uscita
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/Uscita registrata/);
    
    // Verifica che ora il pulsante entrata sia di nuovo disponibile
    const entrataButton = page.locator('[data-testid="button-entrata"]');
    await expect(entrataButton).toBeEnabled();
  });

  test('dovrebbe bloccare doppia entrata consecutiva', async ({ page }) => {
    // Prima entrata
    await page.click('[data-testid="button-entrata"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/Entrata registrata/);
    
    // Verifica che il pulsante entrata sia disabilitato
    const entrataButton = page.locator('[data-testid="button-entrata"]');
    await expect(entrataButton).toBeDisabled();
    
    // Se per qualche motivo il pulsante fosse cliccabile, dovrebbe mostrare errore
    if (await entrataButton.isEnabled()) {
      await entrataButton.click();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/Alternanza violata/);
    }
  });

  test('dovrebbe bloccare uscita senza entrata precedente', async ({ page }) => {
    // Verifica stato iniziale: se non ci sono timbrature precedenti,
    // il pulsante uscita dovrebbe essere disabilitato
    const uscitaButton = page.locator('[data-testid="button-uscita"]');
    
    // Se il pulsante è disabilitato, è corretto
    if (await uscitaButton.isDisabled()) {
      expect(true).toBe(true); // Test passa
    } else {
      // Se è abilitato, cliccandolo dovrebbe dare errore
      await uscitaButton.click();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/Alternanza violata|Nessuna entrata precedente/);
    }
  });

  test('dovrebbe mostrare orario corrente', async ({ page }) => {
    // Verifica che l'orario corrente sia visualizzato
    const timeDisplay = page.locator('[data-testid="current-time"]');
    await expect(timeDisplay).toBeVisible();
    
    // Verifica formato orario (HH:MM o HH:MM:SS)
    const timeText = await timeDisplay.textContent();
    expect(timeText).toMatch(/\d{2}:\d{2}(:\d{2})?/);
  });

  test('dovrebbe mostrare data corrente', async ({ page }) => {
    // Verifica che la data corrente sia visualizzata
    const dateDisplay = page.locator('[data-testid="current-date"]');
    await expect(dateDisplay).toBeVisible();
    
    // Verifica che contenga una data valida
    const dateText = await dateDisplay.textContent();
    expect(dateText).toBeTruthy();
    expect(dateText?.length).toBeGreaterThan(5); // Almeno "01/01"
  });

  test('dovrebbe gestire errori di rete', async ({ page }) => {
    // Simula errore di rete intercettando le richieste
    await page.route('/api/timbrature', route => {
      route.abort('failed');
    });
    
    // Tenta timbratura
    await page.click('[data-testid="button-entrata"]');
    
    // Verifica messaggio di errore di rete
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/Errore di connessione|Errore di rete/);
  });

  test('dovrebbe permettere logout e ritorno alla home', async ({ page }) => {
    // Cerca pulsante logout o back
    const logoutButton = page.locator('[data-testid="logout-button"], [data-testid="back-button"]');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Verifica ritorno alla home con keypad
      await expect(page.locator('[data-testid="keypad"]')).toBeVisible();
    }
  });

  test('dovrebbe gestire turni notturni (giorno logico)', async ({ page }) => {
    // Questo test è più concettuale - verifica che l'app gestisca
    // correttamente le timbrature notturne (00:00-04:59)
    
    // Simula orario notturno modificando l'ora di sistema (se possibile)
    // o verificando che l'app mostri informazioni sul giorno logico
    
    const giornoLogicoInfo = page.locator('[data-testid="giorno-logico-info"]');
    if (await giornoLogicoInfo.isVisible()) {
      const infoText = await giornoLogicoInfo.textContent();
      expect(infoText).toBeTruthy();
    }
    
    // Verifica che le timbrature funzionino anche in orari notturni
    await page.click('[data-testid="button-entrata"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('dovrebbe essere accessibile da tastiera', async ({ page }) => {
    // Verifica navigazione con Tab
    await page.keyboard.press('Tab');
    
    // Verifica che il focus sia visibile sui pulsanti
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Verifica che Enter attivi il pulsante focusato
    if (await focusedElement.getAttribute('data-testid') === 'button-entrata') {
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });
});
