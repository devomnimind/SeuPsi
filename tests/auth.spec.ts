import { test, expect } from '@playwright/test';

test.describe('Autenticação e Registro', () => {
  
  test('deve registrar um novo usuário com sucesso', async ({ page }) => {
    // 1. Gerar dados aleatórios para teste
    const timestamp = Date.now();
    const email = `test.agent.${timestamp}@seupsi.local`;
    const password = 'TestPassword123!';
    const name = `Agente Teste ${timestamp}`;

    console.log(`Iniciando teste de registro para: ${email}`);

    // 2. Navegar para página de registro
    await page.goto('/register');

    // 3. Preencher formulário
    // Assumindo que os inputs têm placeholders ou names identificáveis. 
    // Ajustarei os seletores se necessário após a primeira falha.
    await page.fill('input[type="text"]', name); // Nome
    await page.fill('input[type="email"]', email); // Email
    await page.fill('input[type="password"]', password); // Senha

    // 4. Submeter
    await page.click('button[type="submit"]');

    // 5. Validar sucesso
    // Espera ser redirecionado para a página de Perfil
    await expect(page).toHaveURL(/\/profile/);
    
    // Valida elementos visuais reais da página de perfil (baseado em src/pages/Profile.tsx)
    // O componente exibe 'Nível' e 'XP' nos cards de estatísticas
    await expect(page.getByText('Nível', { exact: true })).toBeVisible();
    await expect(page.getByText('XP', { exact: true })).toBeVisible();
    
    // Salva o estado da autenticação
    await page.context().storageState({ path: 'playwright/.auth/user.json' });
  });

  test('deve fazer login com usuário existente', async () => {
    // Implementaremos login recorrente numa próxima etapa usando setup global.
  });
});

