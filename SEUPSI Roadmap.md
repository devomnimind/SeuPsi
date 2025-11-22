SEUPSI — Documento de Projeto (Resumo da Conversa)
Visão Geral

SEUPSI é um aplicativo focado em bem‑estar mental, aprendizado personalizado e superação de vícios, direcionado a adolescentes (15+) e jovens adultos, com alcance ampliável para outras faixas etárias. Objetivos principais:

    Oferecer suporte emocional e ferramentas práticas (meditação, diário, técnicas de regulação).

    Prover trilhas de estudo personalizadas por interesse (biologia, matemática, filosofia etc.).

    Incluir uma sessão específica e confidencial para redução de vícios (álcool, drogas, cigarro, pornografia).

    Criar comunidade, gamificação e IA que personaliza conteúdo com base em comportamento e preferências.

    Lançamento inicial gratuito, usando recursos grátis/opensource e arquitetado para escalar.

Público‑alvo

    Primário: adolescentes (15–17) e jovens adultos (18–30).

    Secundário: adultos (30–60+) quando aplicável.

    Conteúdo adaptado por faixa etária/padrões de desenvolvimento: 13–15, 15–17, 18–20, 20–25, 25–30, 30–40, 40–50, 60–80.

Objetivos do Produto

    Engajamento diário e retenção por conteúdo relevante e personalizado.

    Acolhimento e segurança para tratar temas sensíveis (vícios, emoções).

    Ensino adaptativo com trilhas e recursos multimídia.

    Comunidade moderada e segura.

    Monetização escalável via plataformas intermediárias (Hotmart, Eduzz, Google Play) sem necessidade de abrir CNPJ na fase inicial.

Arquitetura e Stack (Frontend já existente)

    SPA React + TypeScript, Vite, Tailwind, Framer Motion, React Router, Zustand.

    Estrutura modular de componentes e páginas.

    Dados inicialmente mockados; pronto para integrar backend/serviços.

    Requisitos: mobile‑first, acessibilidade (WCAG 2.1 AA), performance, animações leves.

Estrutura de Diretórios (resumo)

    src/components/ — componentes reutilizáveis

    src/pages/ — Home, Mindfulness, Studies, DailyInfo, Profile, Engagement, Customization, Reports, LibertaMente

    src/store/ — estados (tema, auth, perfil)

    src/lib/ — integrações/SDKs placeholder

Módulos e Sessões — Descrição e Comportamento
1. Home (Dashboard)

    Função: entrada personalizada com resumo diário.

    Conteúdo: atividades diárias, quick stats (sequência, pontos), tópicos trending, mood check rápido.

    Lógica: priorizar itens com maior probabilidade de engajamento (IA usa histórico).

2. Mindfulness

    Itens: meditações guiadas (variações temporais), exercícios de respiração interativos, sons ambientes, meditações rápidas.

    UX: timers, animações de respiração, possibilidade de download offline de áudios.

    Personalização: seleção de trilhas sonoras por usuário; IA sugere sessão baseada no humor.

3. Studies (Estudos Personalizados)

    Itens: trilhas por área (biologia, matemática, filosofia, etc.), resumos, quizzes, cursos curtos, workshops.

    Lógica adaptativa: recomendações baseadas em preferências, desempenho em quizzes e histórico.

    Formatos: texto curto, carrossel, vídeos, PDFs para download.

4. DailyInfo (Diário & Reflexões)

    Itens: check‑in de humor, prompts guiados, registro de eventos, insights automáticos.

    Lógica IA: análise de linguagem e padrões para sugerir intervenções e conteúdos.

    Privacidade: entradas podem ser anônimas/offline; opção de criptografia local.

5. Profile & Preferências

    Itens: interesses, faixa etária, metas, histórico de atividades, ajustes de privacidade.

    Uso da IA: perfil alimenta recomendações (conteúdo, tom de linguagem, horários de notificação).

6. Engagement (Gamificação)

    Itens: sistema de XP/níveis, conquistas, desafios diários/semanas, leaderboard opcional.

    Integração social: badges visíveis no perfil; recompensas não prejudiciais (stickers, temas).

    Regras: gamificação saudável, evitar gatilhos para vício de recompensas.

7. Customization (Personalização Visual)

    Itens: temas, modo claro/escuro, avatares, ajustes de fonte e acessibilidade.

    Persistência: preferências salvas por usuário e aplicadas por toda a UI.

8. Reports (Relatórios & Analytics)

    Itens: gráficos de progresso emocional e acadêmico, comparativos, relatórios semanais.

    Fornecimento: insights práticos e sugestões acionáveis pela IA.

9. LibertaMente (Superação de Vícios) — Sessão Sensível

    Telas: seleção de foco (álcool, drogas, cigarro, pornografia), avaliação inicial, plano de redução, emergência.

    Ferramentas:

        Questionário confidencial de início.

        Planos de metas semanais e técnicas de substituição.

        Diário com IA analisando gatilhos.

        Botão de emergência com técnicas rápidas e meditações curtas.

        Comunidade de apoio segmentada (anônima por opção).

    Segurança: modo confidencial ocultável; criptografia; moderação por IA; verificação de idade para conteúdo adulto.

    Lógica IA: adaptar metas, detectar recaídas, sugerir intervenções e encaminhamentos (sempre com aviso para procurar ajuda humana quando necessário).

10. SocialHub (Rede Social Interna)

    Itens: feed de posts, comentários, reações, sistema de seguidores e lista de amigos.

    Moderação: IA para detectar conteúdo nocivo; filtros temáticos.

    Privacidade: perfis configuráveis; possibilidade de anonimato em grupos de apoio.

11. Grupos & Comunidades

    Itens: grupos por interesse, chats em real‑time, eventos (meditação coletiva), permissões (público/privado).

    Moderação: regras comunitárias e IA moderadora.

12. Copiloto Emocional (Chat IA)

    Função: chat assistente que conversa sobre emoções, sugere conteúdos, propõe exercícios.

    Limites: não substitui terapia; mensagens com disclaimer e opção de encaminhar para ajuda humana.

    Adaptação: usa psicologia/psicanálise para adequar linguagem e intervenções.

13. MediaLab (Multimídia)

    Itens: podcasts curtos, vídeos, áudios de meditação, histórico e favoritos.

    Integração: players embutidos; downloads offline para usuários premium/gratuitos conforme estratégia.

14. NeuroPlay (Mini‑jogos Cognitivos)

    Itens: jogos de atenção, memória, lógica; ranking entre amigos; recomendações de jogos por estado emocional.

    Objetivo: treinar foco e fornecer recompensas educacionais.

15. Kit Offline

    Itens: PDFs, trilhas de estudo baixáveis, áudios de meditação offline, diário local.

    Sincronização: sincroniza quando o dispositivo volta a ficar online.

16. Meta360 (Evolução Pessoal)

    Itens: metas, comparação entre metas e resultados, sugestões semanais da IA.

    Visual: painéis de progresso e recomendações priorizadas.

17. LabSEUPSI (Experimentos)

    Itens: funcionalidades experimentais A/B, espaço para feedback, votação de recursos.

    Risco controlado: testes só visíveis a amostras de usuários.

18. Privacidade & Segurança

    Controles granulares de visibilidade e dados.

    Opção de navegação anônima.

    Logs e histórico de interações com IA.

    Conformidade com melhores práticas de proteção de dados (design privacy‑by‑default).

Agente de IA de Conteúdo — Especificação Detalhada
Funções principais

    Gerar todos os tipos de texto: posts, artigos, e‑mails promocionais, roteiros de Reels, respostas WhatsApp, textos in‑app.

    Usar base de dados fornecida (textos de psicanálise, psicologia, bibliotecas por disciplina) como guia de conteúdo e tom.

    Adaptar formato, complexidade e tom por faixa etária definida.

    Analisar métricas de uso e linguagens dos usuários para priorizar temas e ajustar tom.

    Produzir variações (curta, média, longa) para cada necessidade (stories, post, artigo).

Regras e princípios do conteúdo

    Empatia e acolhimento; evitar julgamentos.

    Precisão ao repassar conceitos científicos; sempre traduzir termos técnicos com linguagem acessível.

    Avisos: quando abordar vícios ou temas clínicos, incluir orientação clara sobre procurar ajuda profissional.

    Adaptabilidade: gerar CTAs apropriados (ex: chamar para um desafio, sugerir sessão de .LibertaMente).

    Diversidade e inclusão: linguagem neutra, sem estereótipos.

Estrutura de geração por canal

    Posts rápidos (Instagram/TikTok): 1–2 frases de impacto + sugestão visual + CTA.

    Carrosséis: título, 4–8 slides com micro‑insights, CTA final.

    Artigos/Blog: introdução, desenvolvimento com sub‑títulos, conclusão prática, referências/links internos.

    E‑mails: assunto atraente, preheader, corpo em 3 blocos (problema, promessa, ação), CTA.

    WhatsApp: mensagens curtas, respostas rápidas, botão de encaminhar para sessão/contato humano.

Personalização por faixa etária (resumo)

    Vocabulário, referências culturais, profundidade conceitual e abordagem emocional variam conforme a faixa.

    A IA deve mapear estilos e salvar preferências para cada usuário.

Lógica de Personalização e Dados

    Fontes de personalização:

        Questionário inicial (interesses, objetivos, vícios a trabalhar).

        Interações no app (tempo em tela, conteúdo consumido, check‑ins).

        Entradas do diário (palavras‑chave, sentimentos).

        Engajamento social (postagens curtidas, comentários).

    Mecanismo: pipeline que transforma sinais em “personas” dinâmicas; cada persona define tom, frequência e tipo de conteúdo.

    Regras de notificação: IA sugere horários com base em hábitos; limites para evitar sobrecarga.

Gamificação e Retenção

    Sistemas de XP, conquistas e desafios com recompensas não monetárias.

    Eventos comunitários e rank entre amigos (opt‑in).

    Notificações inteligentes: lembretes para check‑in, desafios, conteúdo novo.

    Estratégia de progressão: pequenos marcos semanais que alimentam o sentimento de progresso.

Monetização e Lançamento (modelo intermediário)

    Fase 1 (gratuito): distribuir versão básica sem necessidade de CNPJ, usar plataformas intermediárias para vender conteúdos/pacotes.

    Produtos para venda via intermediárias:

        Acesso premium (recursos offline, trilhas exclusivas).

        Pacotes temáticos (Desafio Sem Vício, Trilha ENEM).

        Conteúdos avulsos (ebooks, áudios).

    Plataformas sugeridas: Hotmart, Eduzz, Monetizze, Google Play (in‑app purchases) — escolhe conforme formato do produto.

    Estratégia de marketing: landing page, redes sociais (Instagram/TikTok), afiliados, conteúdo educativo e provas sociais.

Requisitos Técnicos e Ferramentas Gratuitas (recomendadas)

    Backend opcional inicial: Firebase (Auth, Firestore, Storage, Functions) ou Supabase.

    Real‑time / chat: Pusher / Socket.IO / Firebase Realtime.

    Storage de mídia: Firebase Storage / Cloudinary (plano gratuito).

    Analytics: Google Analytics / Firebase Analytics / Amplitude (planos gratuitos).

    Moderação IA: modelos open source e regras customizadas; filtros de NLP para detectar linguagem de risco.

    Infraestrutura: manter separação clara entre módulos para escalabilidade (microfrontends ou módulos desacoplados).

Operacional, Segurança e Regulatório

    Idade mínima: implementar verificação simples/consentimento para menores; limitar conteúdo adulto.

    Criptografia de dados sensíveis; políticas claras de privacidade.

    Logs de auditoria para moderação; possibilidade de exportação de dados pelo usuário.

    Disclaimers em conteúdos clínicos: IA não substitui profissionais; encorajar busca por ajuda humana quando necessário.

Roadmap de Prioridades (sugestão prática)

    Lançamento MVP: Home, Mindfulness, DailyInfo, Profile, Studies básicas, LibertaMente (funcionalidade essencial com disclaimers).

    Integração com plataforma intermediária para venda de conteúdo premium.

    Implementação do agente IA de conteúdo e personalização por faixa etária.

    SocialHub básico (feed + comentários + moderação IA).

    Grupos temáticos e chat em tempo real.

    MediaLab, NeuroPlay, Kit Offline, Meta360.

    LabSEUPSI para experimentos e coleta de feedback.

    Escala: otimização, testes A/B e integração com serviços pagos conforme crescimento.

Riscos e Mitigações

    Tema sensível (vícios/emocional): garantir moderação, avisos e encaminhamento a serviços humanos.

    Privacidade de menores: controles rigorosos, anonimização e consentimento.

    Dependência de plataformas intermediárias: diversificar canais de receita com planos próprios conforme escala.

    Gamificação excessiva: desenhar recompensas saudáveis e não viciante.

Próximos Passos Imediatos (sugeridos)

    Gerar documentação técnica completa (endpoints, contratos de dados) para integração backend.

    Criar templates de conteúdo para cada faixa etária e sessão (agente IA usa como prompt base).

    Implementar fluxo mínimo de LibertaMente com perguntas iniciais e botão de emergência.

    Configurar conta em Hotmart/Eduzz e preparar página de vendas + material de lançamento (landing + assets).

    Iniciar campanhas orgânicas nas redes sociais com conteúdo educativo alinhado ao tom do app.
