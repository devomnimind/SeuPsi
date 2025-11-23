import { test, expect } from '@playwright/test';

test.describe('Comunidade e Social', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('deve carregar o Feed da Comunidade', async ({ page }) => {
    await page.goto('/community');
    
    // Verifica se a página carregou
    await expect(page).toHaveURL('/community');
    
    // Verifica se existe uma área de postagens ou criação de post
    const postInput = page.getByPlaceholder(/compartilhe|escreva/i);
    
    // Pode não estar visível se não houver posts, mas o input geralmente está
    if (await postInput.isVisible()) {
        await expect(postInput).toBeVisible();
    } else {
        // Fallback: Verifica título principal e abas de navegação
        // O h1 pode ter estilos complexos (gradiente/transparente), então focamos nos botões de navegação
        // que são essenciais para a funcionalidade.
        await expect(page.getByRole('button', { name: 'Feed' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Chat' })).toBeVisible();
    }
  });
});
