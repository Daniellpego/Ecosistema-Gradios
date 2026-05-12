// @ts-check
const { test, expect } = require('@playwright/test')

/**
 * 01-smoke.spec.js — testes mínimos de "página responde + auth redirect funciona".
 *
 * Os specs originais 06-10 (concurrency, persistence, dashboard-sync, mixbug,
 * logic-usability) precisam ser escritos antes de serem habilitados no CI.
 * Ver UPGRADE-PLAN.md raiz.
 */

test.describe('Smoke — Painel CFO', () => {
  test('rota raiz redireciona pra login se não autenticado', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
    // Deve redirecionar pra /login (middleware Supabase Auth)
    expect(page.url()).toMatch(/\/login/)
    expect(response?.status()).toBeLessThan(500)
  })

  test('página /login carrega com formulário visível', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    // Tem input de email (pode ser type=email ou name=email)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    await expect(emailInput).toBeVisible({ timeout: 10_000 })
  })

  test('headers de segurança presentes', async ({ page }) => {
    const response = await page.goto('/login')
    const headers = response?.headers() || {}
    // Headers críticos da auditoria de segurança (SECURITY_REPORT.md)
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBeTruthy()
    expect(headers['permissions-policy']).toBeTruthy()
    // CSP com nonce dinâmico (middleware)
    expect(headers['content-security-policy']).toMatch(/'nonce-/)
  })

  test('app retorna 404 customizado em rota inexistente', async ({ page }) => {
    const response = await page.goto('/rota-que-nao-existe-xyz123')
    // Next.js retorna 404 com página customizada (not-found.tsx)
    expect(response?.status()).toBe(404)
  })
})
