import { test, expect } from '@playwright/test';

test.describe('Navegação Principal (Smoke Test)', () => {
  // Carrega a sessão salva antes de cada teste
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('deve acessar a Home/Dashboard', async ({ page }) => {
    await page.goto('/');
    // Verifica um elemento único da Home, ex: "Olá, [Nome]" ou cards de atalhos
    // Lendo o código da Home, geralmente tem saudações ou resumo diário
    await expect(page).toHaveURL('/');
  });

  test('deve acessar a área de Mindfulness', async ({ page }) => {
    await page.goto('/mindfulness');
    await expect(page).toHaveURL('/mindfulness');
    // Verifica título ou player de meditação
    await expect(page.getByText('Mindfulness', { exact: false })).toBeVisible();
  });

  test('deve acessar a Comunidade', async ({ page }) => {
    await page.goto('/community');
    await expect(page).toHaveURL('/community');
    // Verifica feed ou lista de grupos
  });
  
  test('deve acessar a área de Estudos', async ({ page }) => {
    await page.goto('/studies');
    await expect(page).toHaveURL('/studies');
  });

  test('deve acessar o Chat IA (Terapeuta)', async ({ page }) => {
    await page.goto('/ai-therapist');
    await expect(page).toHaveURL('/ai-therapist');
    // Verifica se a interface de chat carregou
    // Geralmente tem um input de mensagem
    await expect(page.getByPlaceholder(/digite/i)).toBeVisible();
  });
});

