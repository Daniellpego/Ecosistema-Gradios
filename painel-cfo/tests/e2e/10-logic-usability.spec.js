// @ts-check
const { test, expect } = require('@playwright/test');
const {
  login,
  waitForSync,
  navigateToTab,
  openNewEntryDrawer,
  fillAndSaveEntry,
  uniqueName,
  cleanupTestItems,
  fetchRowDirect,
} = require('./helpers');

const parseBRL = (s = '') => parseFloat(String(s).replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.')) || 0;

test.describe('E2E 10 - Logic & Operational Usability Audit', () => {
  test.beforeEach(async () => {
    await cleanupTestItems('LOGIC10_').catch(() => {});
  });

  test('T1 filters: month/day boundaries included in same month', async ({ page }) => {
    const d1 = uniqueName('LOGIC10_D1');
    const d2 = uniqueName('LOGIC10_D2');

    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'entradas');

    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    await openNewEntryDrawer(page, 'entrada');
    await page.fill('#f-data', `${y}-${m}-01`);
    await fillAndSaveEntry(page, { nome: d1, valor: '100,00', status: 'Confirmado' });

    await openNewEntryDrawer(page, 'entrada');
    await page.fill('#f-data', `${y}-${m}-31`);
    await fillAndSaveEntry(page, { nome: d2, valor: '150,00', status: 'Confirmado' });

    await page.fill('#search-entradas', 'LOGIC10_D');
    await expect(page.locator('#table-entradas tr')).toHaveCount(2);
  });

  test('T2 filters: client/project affect table and KPI consistently', async ({ page }) => {
    const a = uniqueName('LOGIC10_A');
    const b = uniqueName('LOGIC10_B');
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'entradas');

    await openNewEntryDrawer(page, 'entrada');
    await page.fill('#f-cliente', 'Cliente A');
    await page.fill('#f-projeto', 'Projeto A');
    await fillAndSaveEntry(page, { nome: a, valor: '1000,00', status: 'Confirmado' });

    await openNewEntryDrawer(page, 'entrada');
    await page.fill('#f-cliente', 'Cliente B');
    await page.fill('#f-projeto', 'Projeto B');
    await fillAndSaveEntry(page, { nome: b, valor: '2000,00', status: 'Confirmado' });

    await page.selectOption('#fClient', 'Cliente A');
    await page.selectOption('#fProject', 'Projeto A');
    await page.waitForTimeout(300);
    await page.fill('#search-entradas', 'LOGIC10_');
    await expect(page.locator('#table-entradas tr')).toHaveCount(1);

    await navigateToTab(page, 'overview');
    const receita = parseBRL(await page.locator('#v-receita-ov').textContent());
    expect(receita).toBeGreaterThanOrEqual(900);
    expect(receita).toBeLessThanOrEqual(1100);
  });

  test('T3 date parsing legacy DD/MM/YYYY is counted in month', async ({ page }) => {
    await login(page);
    await waitForSync(page);
    const row = await fetchRowDirect();
    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    const payload = {
      fixos: row.fixos || [],
      unicos: row.unicos || [],
      entradas: [...(row.entradas || []), { id: `legacy:${Date.now()}`, nome: uniqueName('LOGIC10_LEG'), valor: 321, data: `15/${m}/${y}`, categoria: 'Outras Receitas', status: 'Confirmado' }],
      projecoes: row.projecoes || { entradas: [], saidas: [] },
      caixa_disponivel: Number(row.caixa_disponivel || 0),
      updated_at: new Date().toISOString(),
    };
    await page.request.post('/api/painel?init=1', { data: payload });

    await page.reload();
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'overview');
    const receita = parseBRL(await page.locator('#v-receita-ov').textContent());
    expect(receita).toBeGreaterThan(0);
  });

  test('T4 status canceled does not enter KPI sums', async ({ page }) => {
    const c = uniqueName('LOGIC10_CANCEL');
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'entradas');

    await openNewEntryDrawer(page, 'entrada');
    await fillAndSaveEntry(page, { nome: c, valor: '9999,00', status: 'Cancelado' });

    await navigateToTab(page, 'overview');
    const receita = parseBRL(await page.locator('#v-receita-ov').textContent());
    expect(receita).toBeLessThan(9999);
  });

  test('T5 recurring edit does not create duplicates runaway', async ({ page }) => {
    const n = uniqueName('LOGIC10_REC');
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'fixos');

    await openNewEntryDrawer(page);
    await fillAndSaveEntry(page, { nome: n, valor: '111,00', status: 'Confirmado', recorrente: 'mensal' });

    await page.fill('#search-gastos', n);
    await expect(page.locator('#table-body tr')).toHaveCount(12);
  });

  test('T6 KPI guard: no NaN/Infinity with zero revenue', async ({ page }) => {
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'overview');

    const ids = ['#v-runway', '#v-receita-ov', '#v-res-liq', '#v-burn-ov'];
    for (const id of ids) {
      const txt = await page.locator(id).textContent();
      expect(txt || '').not.toContain('NaN');
      expect(txt || '').not.toContain('Infinity');
    }
  });

  test('T7 DRE and overview should be numerically coherent in controlled scenario', async ({ page }) => {
    const inN = uniqueName('LOGIC10_DRE_IN');
    const fxN = uniqueName('LOGIC10_DRE_FX');
    const vrN = uniqueName('LOGIC10_DRE_VR');
    await login(page);
    await waitForSync(page);

    await navigateToTab(page, 'entradas');
    await openNewEntryDrawer(page, 'entrada');
    await fillAndSaveEntry(page, { nome: inN, valor: '1000,00', status: 'Confirmado' });

    await navigateToTab(page, 'fixos');
    await openNewEntryDrawer(page);
    await fillAndSaveEntry(page, { nome: fxN, valor: '200,00', status: 'Confirmado' });

    await navigateToTab(page, 'unicos');
    await openNewEntryDrawer(page);
    await fillAndSaveEntry(page, { nome: vrN, valor: '100,00', status: 'Confirmado' });

    await navigateToTab(page, 'overview');
    const receita = parseBRL(await page.locator('#v-receita-ov').textContent());
    const burn = parseBRL(await page.locator('#v-burn-ov').textContent());
    expect(receita).toBeGreaterThanOrEqual(1000);
    expect(burn).toBeGreaterThanOrEqual(360); // 200 + 100 + 6%
  });

  test('T8 projection cash table renders deterministic auto tax row once', async ({ page }) => {
    const n = uniqueName('LOGIC10_PROJ');
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'projecoes');

    await page.click('button:has-text("Projetar Receita")');
    await page.fill('#pf-nome', n);
    await page.fill('#pf-valor', '2000,00');
    await page.click('#btn-proj-save');

    const autoRows = page.locator('tr[data-auto-id^="proj:auto:"]');
    await expect(autoRows).toHaveCount(1);
  });

  test('T9 export CSV escapes formula injection', async ({ page }) => {
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'entradas');

    await openNewEntryDrawer(page, 'entrada');
    await fillAndSaveEntry(page, { nome: '=HYPERLINK("http://x")', valor: '10,00', status: 'Confirmado' });

    const escaped = await page.evaluate(() => window.escCSV('=HYPERLINK("http://x")'));
    expect(escaped.startsWith('"\t=HYPERLINK')).toBeTruthy();
  });

  test('T10 offline flow keeps app responsive and shows sync error state', async ({ page }) => {
    await page.route('**/api/painel**', route => route.abort());
    await login(page);
    await page.waitForTimeout(1500);
    const txt = await page.locator('#sync-txt').textContent();
    expect(txt || '').toContain('Offline');
  });

  test('T11 rapid tab switching does not zero KPIs', async ({ page }) => {
    await login(page);
    await waitForSync(page);
    await navigateToTab(page, 'overview');
    const before = await page.locator('#v-burn-ov').textContent();
    for (let i = 0; i < 4; i++) {
      await navigateToTab(page, 'fixos');
      await navigateToTab(page, 'entradas');
      await navigateToTab(page, 'dre');
      await navigateToTab(page, 'overview');
    }
    const after = await page.locator('#v-burn-ov').textContent();
    expect(after).toBe(before);
  });

  test('T12 sync button does not regress state indicators', async ({ page }) => {
    await login(page);
    await waitForSync(page);
    await page.click('#btn-sync');
    await page.waitForTimeout(500);
    const txt = await page.locator('#sync-txt').textContent();
    expect((txt || '').length).toBeGreaterThan(0);
  });
});
