import { test, expect } from '@playwright/test';

test.describe('Storico Timbrature', () => {
  test('dovrebbe navigare alla pagina storico', async ({ page }) => {
    await page.goto('/');
    
    // Cerca link per storico (potrebbe essere in menu admin o link diretto)
    const storicoLink = page.locator('[data-testid="storico-link"], a[href*="storico"]').first();
    
    if (await storicoLink.isVisible()) {
      await storicoLink.click();
      
      // Verifica navigazione alla pagina storico
      await expect(page).toHaveURL(/\/storico/);
    } else {
      // Navigazione diretta se il link non è visibile
      await page.goto('/storico-timbrature');
    }
    
    // Verifica che la pagina storico sia caricata
    await expect(page.locator('[data-testid="storico-page"]')).toBeVisible();
  });

  test('dovrebbe mostrare filtri per ricerca storico', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Verifica presenza filtri
    await expect(page.locator('[data-testid="filter-pin"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-date-from"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-date-to"]')).toBeVisible();
    
    // Verifica pulsante ricerca
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
  });

  test('dovrebbe permettere ricerca per PIN specifico', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Inserisci PIN per ricerca
    await page.fill('[data-testid="filter-pin"]', '1');
    
    // Imposta range date (ultimo mese)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    await page.fill('[data-testid="filter-date-from"]', lastMonth.toISOString().split('T')[0]);
    await page.fill('[data-testid="filter-date-to"]', today.toISOString().split('T')[0]);
    
    // Esegui ricerca
    await page.click('[data-testid="search-button"]');
    
    // Verifica che i risultati siano mostrati
    await expect(page.locator('[data-testid="storico-results"]')).toBeVisible();
    
    // Verifica che i risultati contengano il PIN cercato
    const results = page.locator('[data-testid="storico-row"]');
    if (await results.count() > 0) {
      const firstRow = results.first();
      await expect(firstRow).toContainText('1');
    }
  });

  test('dovrebbe mostrare dettagli timbrature giornaliere', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Esegui una ricerca base
    await page.fill('[data-testid="filter-pin"]', '1');
    await page.click('[data-testid="search-button"]');
    
    // Attendi risultati
    await expect(page.locator('[data-testid="storico-results"]')).toBeVisible();
    
    // Verifica colonne della tabella
    await expect(page.locator('[data-testid="column-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-entrata"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-uscita"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-ore"]')).toBeVisible();
    
    // Se ci sono righe, verifica il contenuto
    const rows = page.locator('[data-testid="storico-row"]');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      
      // Verifica formato data (dovrebbe essere leggibile)
      const dateCell = firstRow.locator('[data-testid="cell-date"]');
      const dateText = await dateCell.textContent();
      expect(dateText).toMatch(/\d{1,2}\/\d{1,2}|\w{3}\s+\d{1,2}/); // DD/MM o "Lun 01"
      
      // Verifica formato ore (se presente)
      const oreCell = firstRow.locator('[data-testid="cell-ore"]');
      const oreText = await oreCell.textContent();
      if (oreText && oreText.trim() !== '-') {
        expect(oreText).toMatch(/\d+\.\d{2}/); // Formato ore.minuti
      }
    }
  });

  test('dovrebbe permettere export Excel', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Esegui ricerca per avere dati da esportare
    await page.fill('[data-testid="filter-pin"]', '1');
    await page.click('[data-testid="search-button"]');
    
    // Cerca pulsante export Excel
    const excelButton = page.locator('[data-testid="export-excel"]');
    
    if (await excelButton.isVisible()) {
      // Setup per intercettare il download
      const downloadPromise = page.waitForEvent('download');
      
      await excelButton.click();
      
      // Verifica che il download sia iniziato
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
    }
  });

  test('dovrebbe permettere export PDF', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Esegui ricerca per avere dati da esportare
    await page.fill('[data-testid="filter-pin"]', '1');
    await page.click('[data-testid="search-button"]');
    
    // Cerca pulsante export PDF
    const pdfButton = page.locator('[data-testid="export-pdf"]');
    
    if (await pdfButton.isVisible()) {
      // Setup per intercettare il download
      const downloadPromise = page.waitForEvent('download');
      
      await pdfButton.click();
      
      // Verifica che il download sia iniziato
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    }
  });

  test('dovrebbe gestire ricerca senza risultati', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Cerca PIN inesistente
    await page.fill('[data-testid="filter-pin"]', '999');
    await page.click('[data-testid="search-button"]');
    
    // Verifica messaggio "nessun risultato"
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results"]')).toContainText(/Nessun risultato|Nessuna timbratura trovata/);
  });

  test('dovrebbe validare range date', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Imposta data "da" successiva a data "a" (non valido)
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    await page.fill('[data-testid="filter-date-from"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('[data-testid="filter-date-to"]', today.toISOString().split('T')[0]);
    
    await page.click('[data-testid="search-button"]');
    
    // Verifica messaggio di errore validazione
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText(/Data di inizio deve essere precedente/);
  });

  test('dovrebbe mostrare totali e statistiche', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Esegui ricerca con dati
    await page.fill('[data-testid="filter-pin"]', '1');
    await page.click('[data-testid="search-button"]');
    
    // Verifica presenza sezione totali (se implementata)
    const totalsSection = page.locator('[data-testid="totals-section"]');
    if (await totalsSection.isVisible()) {
      // Verifica totale ore lavorate
      await expect(page.locator('[data-testid="total-hours"]')).toBeVisible();
      
      // Verifica totale giorni lavorati
      await expect(page.locator('[data-testid="total-days"]')).toBeVisible();
      
      // Verifica ore extra (se presenti)
      const extraHours = page.locator('[data-testid="extra-hours"]');
      if (await extraHours.isVisible()) {
        const extraText = await extraHours.textContent();
        expect(extraText).toMatch(/\d+\.\d{2}/);
      }
    }
  });

  test('dovrebbe essere responsive su mobile', async ({ page }) => {
    // Simula viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/storico-timbrature');
    
    // Verifica che i filtri siano ancora accessibili
    await expect(page.locator('[data-testid="filter-pin"]')).toBeVisible();
    
    // Verifica che la tabella sia scrollabile orizzontalmente o adattata
    const table = page.locator('[data-testid="storico-table"]');
    if (await table.isVisible()) {
      const tableBox = await table.boundingBox();
      expect(tableBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('dovrebbe gestire paginazione per grandi dataset', async ({ page }) => {
    await page.goto('/storico-timbrature');
    
    // Esegui ricerca con range ampio per avere molti risultati
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
    
    await page.fill('[data-testid="filter-pin"]', '1');
    await page.fill('[data-testid="filter-date-from"]', sixMonthsAgo.toISOString().split('T')[0]);
    await page.fill('[data-testid="filter-date-to"]', today.toISOString().split('T')[0]);
    
    await page.click('[data-testid="search-button"]');
    
    // Verifica presenza controlli paginazione (se implementati)
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // Verifica pulsanti next/prev
      await expect(page.locator('[data-testid="page-next"]')).toBeVisible();
      await expect(page.locator('[data-testid="page-prev"]')).toBeVisible();
      
      // Verifica info pagina corrente
      await expect(page.locator('[data-testid="page-info"]')).toBeVisible();
    }
  });
});
