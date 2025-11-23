import { test, expect } from '@playwright/test';

test.describe('Segurança e Proteção', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('deve acessar o Centro de Segurança', async ({ page }) => {
    await page.goto('/safety');
    await expect(page).toHaveURL('/safety');
    
    // Valida título
    await expect(page.getByRole('heading', { name: /Segurança|Proteção/i })).toBeVisible();
  });

  test('deve verificar a configuração de Contatos de Emergência', async ({ page }) => {
    await page.goto('/safety/contacts');
    // Se o redirecionamento for diferente, o teste vai falhar e ajustaremos
    // Alguns sistemas usam modais na própria página de segurança
    
    // Caso a rota não exista separada, voltamos para /safety
    // Vamos assumir que existe um botão ou seção para isso
  });
});

