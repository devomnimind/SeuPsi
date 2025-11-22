# 🧠 SeuPsi - Plataforma de Bem-Estar Mental

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

*Uma plataforma moderna e gamificada para saúde mental, mindfulness e apoio comunitário.*

[Demo](https://github.com/devomnimind/SeuPsi) • [Documentação](#-funcionalidades) • [Contribuir](CONTRIBUTING.md)

</div>

---

## 📋 Sobre o Projeto

**SeuPsi** é uma aplicação web progressiva (PWA) focada em saúde mental e bem-estar para jovens adultos. Combinando design futurista, gamificação avançada e suporte comunitário, criamos um ambiente seguro e engajador para:

- 🧘 **Mindfulness e Meditação** - Sessões guiadas geradas por IA
- 📚 **Estudos Personalizados** - Sistema RAG com geração de questões e cronogramas
- ⚔️ **Jornada do Herói** - Gamificação estilo RPG para motivação
- 🤝 **Comunidades** - Feed social, chat em tempo real e rodas de conversa (áudio)
- 🛡️ **Proteção para Adolescentes** - Sistema de guardiões e alertas de risco
- 💬 **IA Terapeuta** - Chat com múltiplas abordagens (TCC, Gestalt, Psicanálise, Psicodrama)

---

## 🚀 Tecnologias

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** (design system Neon/Glass)
- **React Router DOM** para roteamento
- **Lucide React** para ícones

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)** para proteção de dados
- **Edge Functions** para lógica serverless

### IA & RAG
- **Qdrant** (banco vetorial para RAG)
- **@xenova/transformers** (embeddings locais)
- **OpenAI/Gemini API** (geração de conteúdo - mock)

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ e npm
- Supabase CLI (opcional, para desenvolvimento local)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/devomnimind/SeuPsi.git
   cd SeuPsi
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` e adicione suas credenciais:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SEUPSI_QDRANT_URL=your_qdrant_url
   VITE_SEUPSI_QDRANT_API_KEY=your_qdrant_api_key
   ```

4. **Aplique as migrações do Supabase**
   ```bash
   npx supabase db push
   # ou aplique manualmente via dashboard do Supabase
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

6. **Acesse a aplicação**
   - URL: `http://localhost:3001`

---

## ✨ Funcionalidades

### 🎮 Gamificação Avançada
- Sistema de XP, níveis e conquistas
- Desafios diários e semanais
- "Jornada do Herói" com atributos RPG (Força, Sabedoria, Carisma)
- Meta360: acompanhamento de objetivos pessoais

### 🧠 IA Terapeuta
- Chat com 4 abordagens terapêuticas:
  - **TCC** (Terapia Cognitivo-Comportamental)
  - **Psicanálise** (Associação livre, inconsciente)
  - **Gestalt** (Aqui e agora, awareness)
  - **Psicodrama** (Dramatização, inversão de papéis)
- Histórico de sessões
- Análise de sentimentos

### 🌐 Sistema Social
- Feed de posts com likes e comentários
- Chat privado em tempo real
- Comunidades temáticas (estilo Orkut)
- Rodas de conversa (áudio spaces com WebRTC)
- Sistema de amizades e notificações

### 🛡️ Proteção e Segurança
- Sistema de guardiões (tutores para adolescentes)
- Análise de bem-estar e detecção de risco
- Alertas automáticos para contatos de emergência
- Privacidade granular (configurações de compartilhamento)
- Moderação de conteúdo (filtro de palavras)

### 📚 Mindfulness & Estudos
- Gerador de meditações guiadas (IA + TTS)
- Gerador de questões de múltipla escolha (RAG)
- Cronogramas de estudo personalizados
- Player de áudio para meditações

---

## 🗂️ Estrutura do Projeto

```
SeuPsi/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ai/          # Chat de IA
│   │   ├── gamification/# RPG e conquistas
│   │   ├── mindfulness/ # Meditação
│   │   ├── safety/      # Dashboard de guardiões
│   │   ├── social/      # Feed, chat, comunidades
│   │   └── ui/          # Componentes base (GlassCard, etc)
│   ├── pages/           # Páginas principais
│   ├── services/        # Lógica de negócio (RAG, RPG, etc)
│   ├── hooks/           # React hooks customizados
│   ├── contexts/        # Context providers (Auth, etc)
│   └── lib/             # Utilitários e configurações
├── supabase/
│   └── migrations/      # Migrações SQL (18 arquivos)
├── public/              # Assets estáticos
└── dist/                # Build de produção
```

---

## 🔐 Segurança

- ✅ **RLS Policies** em todas as tabelas
- ✅ **Row Level Security** habilitado
- ✅ **Validação de entrada** no frontend e backend
- ✅ **Moderação de conteúdo** (filtro de palavras inadequadas)
- ✅ **Detecção de risco** automática (análise de sentimento)
- ✅ **`.env` ignorado** no .gitignore
- ✅ **Sem chaves expostas** no código

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Por favor, leia nosso [guia de contribuição](CONTRIBUTING.md) antes de abrir PRs.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe **devomnimind**

- [GitHub](https://github.com/devomnimind)

---

## 📞 Suporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/devomnimind/SeuPsi/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/devomnimind/SeuPsi/discussions)

---

<div align="center">

**Desenvolvido com foco em Experiência do Usuário e Impacto Social** 🌟

</div>
