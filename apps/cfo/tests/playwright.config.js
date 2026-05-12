// @ts-check
const { defineConfig, devices } = require('@playwright/test')

/**
 * Playwright config — Painel CFO.
 *
 * Estrutura:
 *   - apps/cfo/tests/e2e/*.spec.js   — specs E2E
 *   - apps/cfo/tests/fixtures/        — fixtures compartilhados (futuro)
 *
 * Base URL: lê de env BASE_URL ou default localhost:3000.
 * Pra rodar contra preview Vercel: BASE_URL=https://cfo-preview-XYZ.vercel.app npx playwright test
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Não inicia dev server automaticamente — assume que já está rodando
  // (CI faz `npm run build && npm run start` antes do test, ver workflow).
})
