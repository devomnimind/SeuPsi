# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **SeuPsi**! Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Código de Conduta

Este projeto segue um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e acolhedor para todos.

### Comportamentos Esperados:
- ✅ Comunicação respeitosa e construtiva
- ✅ Foco no que é melhor para a comunidade
- ✅ Empatia com outros colaboradores
- ✅ Feedback construtivo

### Comportamentos Inaceitáveis:
- ❌ Linguagem ou imagens inadequadas
- ❌ Assédio de qualquer tipo
- ❌ Ataques pessoais ou políticos
- ❌ Divulgação de informações privadas

---

## 🐛 Reportando Bugs

Encontrou um bug? Ajude-nos a corrigi-lo!

### Antes de Reportar:
1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/devomnimind/SeuPsi/issues)
2. Certifique-se de estar usando a versão mais recente
3. Confirme que o bug é reproduzível

### Como Reportar:
1. Abra uma nova [Issue](https://github.com/devomnimind/SeuPsi/issues/new)
2. Use o template de bug report (se disponível)
3. Inclua:
   - **Título claro e descritivo**
   - **Passos para reproduzir**
   - **Comportamento esperado vs atual**
   - **Screenshots/vídeos** (se aplicável)
   - **Versão do navegador e sistema operacional**
   - **Mensagens de erro** (console do navegador)

---

## 💡 Sugerindo Funcionalidades

Tem uma ideia para melhorar o SeuPsi?

1. Verifique se a funcionalidade já não foi sugerida
2. Abra uma nova [Issue](https://github.com/devomnimind/SeuPsi/issues/new) com:
   - **Descrição clara** da funcionalidade
   - **Problema que ela resolve**
   - **Exemplos de uso**
   - **Mockups/wireframes** (se aplicável)

---

## 🔧 Processo de Desenvolvimento

### 1. Fork e Clone
```bash
# Fork via interface do GitHub, depois:
git clone https://github.com/seu-usuario/SeuPsi.git
cd SeuPsi
git remote add upstream https://github.com/devomnimind/SeuPsi.git
```

### 2. Crie uma Branch
Use prefixos semânticos:
- `feat/` - Nova funcionalidade
- `fix/` - Correção de bug
- `docs/` - Documentação
- `refactor/` - Refatoração de código
- `test/` - Testes
- `chore/` - Tarefas de manutenção

```bash
git checkout -b feat/minha-feature
```

### 3. Desenvolva
- Siga as [Convenções de Código](#-convenções-de-código)
- Escreva código limpo e bem documentado
- Adicione testes quando aplicável
- Garanta que o build passa (`npm run build`)

### 4. Commit
Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: adiciona gerador de meditações personalizadas"
git commit -m "fix: corrige erro de autenticação no chat"
git commit -m "docs: atualiza README com instruções de deploy"
```

**Tipos de commit:**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (sem mudança de lógica)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de build/config

### 5. Push e Pull Request
```bash
git push origin feat/minha-feature
```

Abra um PR com:
- **Título descritivo**
- **Descrição detalhada** das mudanças
- **Referência à issue** (se aplicável): `Closes #123`
- **Screenshots/vídeos** (para mudanças visuais)
- **Checklist** marcado

---

## 📝 Convenções de Código

### TypeScript/React
- Use **TypeScript** para todo código novo
- Componentes funcionais com hooks
- Props tipadas com interfaces
- Evite `any`, use tipos específicos

```typescript
// ✅ Bom
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  // ...
};

// ❌ Evitar
export const Button = (props: any) => {
  // ...
};
```

### Componentes
- Um componente por arquivo
- Nome do arquivo = nome do componente (`Button.tsx`)
- Use PascalCase para componentes
- Use kebab-case para arquivos CSS

### Hooks Customizados
- Prefixo `use` (ex: `useAuth`, `useGuardianData`)
- Retorne objetos (não arrays) para melhor DX

```typescript
// ✅ Bom
const { user, loading, signOut } = useAuth();

// ❌ Evitar
const [user, loading, signOut] = useAuth();
```

### Estilos
- Use **Tailwind CSS** classes
- Evite CSS inline (exceto para estilos dinâmicos)
- Componentes base em `src/components/ui/`

### Imports
- Imports absolutos: `@/components/...`
- Agrupe imports:
  1. React/bibliotecas
  2. Componentes internos
  3. Tipos
  4. Estilos

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

import type { User } from '@/types';
```

---

## 🧪 Testes

### Rodando Testes
```bash
npm run test           # Roda todos os testes
npm run test:watch     # Modo watch
npm run test:coverage  # Cobertura
```

### Escrevendo Testes
- Use **Vitest** + **React Testing Library**
- Teste comportamento, não implementação
- Cubra casos de sucesso e erro

```typescript
describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## 🗄️ Banco de Dados (Supabase)

### Migrações
- Nunca edite migrações existentes
- Crie novas migrações:
  ```bash
  npx supabase migration new nome_da_migracao
  ```
- Nomeie com timestamp: `YYYYMMDDHHMMSS_descricao.sql`

### RLS Policies
- **Sempre** habilite RLS em novas tabelas
- Políticas devem ser específicas e restritivas
- Teste políticas com diferentes usuários

```sql
-- Exemplo de RLS
create policy "Users can view their own data"
  on user_data for select
  using (auth.uid() = user_id);
```

---

## 📦 Pull Request Checklist

Antes de abrir um PR, verifique:

- [ ] Código segue as convenções do projeto
- [ ] Testes passam (`npm run test`)
- [ ] Build passa (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] TypeScript compila sem erros
- [ ] Documentação atualizada (se aplicável)
- [ ] Screenshots adicionados (para mudanças visuais)
- [ ] Commits seguem Conventional Commits
- [ ] Branch está atualizada com `main`

---

## 🔍 Revisão de Código

### Para Revisores:
- Seja construtivo e respeitoso
- Foque na solução, não no autor
- Explique o "porquê" das sugestões
- Aprove quando pronto, solicite mudanças se necessário

### Para Autores:
- Responda aos comentários
- Aplique sugestões razoáveis
- Pergunte se não entender
- Iteração é normal e bem-vinda!

---

## 📞 Dúvidas?

- 💬 Abra uma [Discussion](https://github.com/devomnimind/SeuPsi/discussions)
- 🐛 Relate problemas via [Issues](https://github.com/devomnimind/SeuPsi/issues)
- 📧 Entre em contato com os mantenedores

---

## 🙏 Agradecimentos

Toda contribuição, grande ou pequena, é muito valorizada! Obrigado por ajudar a tornar o SeuPsi melhor! ❤️

---

<div align="center">

**Feito com ❤️ pela comunidade devomnimind**

</div>
