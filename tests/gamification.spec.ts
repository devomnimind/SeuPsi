import { test, expect } from '@playwright/test';

test.describe('Gamificação e Jornada do Herói', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('deve exibir o nível e XP do usuário no Dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Verifica indicadores de progresso na Home ou Sidebar
    // Usando .first() para resolver ambiguidade, pois ambos indicam presença de gamificação
    await expect(page.getByText('Nível', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('XP', { exact: false }).first()).toBeVisible();
  });

  test('deve acessar a Jornada do Herói', async ({ page }) => {
    await page.goto('/hero-journey');
    
    // Verifica elementos da jornada (mapa, missões)
    await expect(page).toHaveURL('/hero-journey');
    
    // Procura por títulos de missões ou cards
    // Exemplo genérico de validação de carregamento
    await expect(page.locator('h1, h2')).toContainText(/Jornada|Missões|Hero/i);
  });
});

