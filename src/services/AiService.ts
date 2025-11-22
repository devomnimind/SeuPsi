import { supabase } from '../lib/supabase';

export type TherapyMode = 'tcc' | 'psicanalise' | 'gestalt' | 'psicodrama';

export type Message = {
    id: number;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
};

export type Session = {
    id: string;
    title: string;
    updated_at: string;
    summary?: string;
    therapy_mode: TherapyMode;
};

// Base de conhecimento simulada para cada abordagem
const KNOWLEDGE_BASE = {
    psicanalise: {
        concepts: [
            "Associação Livre", "Inconsciente", "Transferência", "Ato Falho", "Sonhos", "Desejo", "Pulsão"
        ],
        patterns: [
            { keywords: ['mãe', 'pai', 'família', 'infância'], response: "Essas figuras primordiais deixam marcas profundas. O que lhe ocorre agora ao pensar nessa relação específica?" },
            { keywords: ['sonho', 'sonhei', 'dormir'], response: "O sonho é a via régia para o inconsciente. Não se preocupe com a lógica, apenas me diga: quais imagens ou sentimentos desse sonho mais lhe chamaram a atenção?" },
            { keywords: ['esqueci', 'não lembro', 'branco'], response: "O esquecimento muitas vezes é uma defesa. O que você acha que poderia estar tentando não lembrar?" },
            { keywords: ['raiva', 'ódio', 'amor'], response: "Os afetos são intensos. Como você percebe esse sentimento se manifestando em outras relações da sua vida?" },
            { keywords: ['sempre', 'nunca', 'todo mundo'], response: "Percebo uma generalização. Isso me soa como algo que se repete. Onde mais você viu esse padrão?" }
        ],
        default_responses: [
            "Fale mais sobre isso. O que lhe vem à mente?",
            "E o que isso significa para você?",
            "Continue, estou escutando. Deixe seus pensamentos fluírem livremente.",
            "Há algo nessa fala que lhe surpreende?",
            "Interessante. Onde você acha que isso se originou?"
        ]
    },
    tcc: {
        concepts: [
            "Pensamentos Automáticos", "Distorções Cognitivas", "Crenças Nucleares", "Evidências", "Reestruturação"
        ],
        patterns: [
            { keywords: ['sempre', 'nunca', 'jamais'], response: "Isso soa como uma generalização excessiva. Você consegue lembrar de alguma situação, mesmo que pequena, onde isso não foi verdade?" },
            { keywords: ['deveria', 'tenho que'], response: "Esses 'deveria' muitas vezes são regras rígidas que nos impomos. O que aconteceria se você trocasse 'eu deveria' por 'eu gostaria'?" },
            { keywords: ['vão pensar', 'acham que'], response: "Isso parece 'leitura mental', uma distorção comum. Que evidências reais você tem de que eles estão pensando isso?" },
            { keywords: ['fracasso', 'inútil', 'horrível'], response: "Esses são rótulos muito duros. Vamos olhar para os fatos: o que você fez especificamente que não saiu como esperado? Isso define você por inteiro?" },
            { keywords: ['medo', 'ansioso', 'pânico'], response: "A ansiedade costuma superestimar o perigo e subestimar nossa capacidade de lidar. De 0 a 10, qual a probabilidade real do pior cenário acontecer?" }
        ],
        default_responses: [
            "O que passou pela sua cabeça nesse momento?",
            "Que evidências você tem que apoiam esse pensamento? E quais evidências o contradizem?",
            "Existe uma outra maneira de ver essa situação?",
            "Se um amigo estivesse nessa situação, o que você diria a ele?",
            "Vamos tentar identificar se há alguma distorção cognitiva nesse pensamento."
        ]
    },
    gestalt: {
        concepts: [
            "Aqui e Agora", "Awareness (Consciência)", "Figura-Fundo", "Contato", "Responsabilidade", "Corpo"
        ],
        patterns: [
            { keywords: ['sinto', 'sensação', 'aperto', 'nó'], response: "Fique com essa sensação por um momento. Onde ela está no seu corpo? Se ela tivesse uma voz, o que diria?" },
            { keywords: ['ele', 'ela', 'me fez'], response: "Tente reformular essa frase assumindo a responsabilidade pelo seu sentimento. Experimente dizer: 'Eu me senti...' ao invés de 'Ele me fez sentir...'." },
            { keywords: ['passado', 'futuro', 'amanhã', 'ontem'], response: "Percebo que você foi para o passado/futuro. Tente voltar para o agora. O que está acontecendo com você neste exato momento?" },
            { keywords: ['não consigo', 'não posso'], response: "Experimente substituir 'não consigo' por 'não quero' ou 'escolho não fazer' e veja como isso soa para você." },
            { keywords: ['cabeça', 'penso', 'acho'], response: "Você está muito na 'cabeça'. O que seus olhos veem agora? O que sua pele sente? Vamos descer para o corpo." }
        ],
        default_responses: [
            "O que você está percebendo agora?",
            "Como você se sente ao me contar isso?",
            "Tente completar a frase: 'Agora eu estou consciente de...'",
            "Respire fundo e entre em contato com essa emoção.",
            "O que o seu corpo está querendo fazer agora?"
        ]
    },
    psicodrama: {
        concepts: [
            "Espontaneidade", "Criatividade", "Papel", "Cena", "Inversão de Papéis", "Cadeira Vazia"
        ],
        patterns: [
            { keywords: ['ele', 'ela', 'pai', 'mãe', 'chefe'], response: "Vamos imaginar que essa pessoa está sentada na cadeira vazia à sua frente. Diga a ela, em voz alta, o que você está sentindo." },
            { keywords: ['não consigo falar', 'travado'], response: "Se você não consegue falar, mostre com um gesto. Que movimento seu corpo quer fazer para expressar isso?" },
            { keywords: ['conflito', 'briga', 'discussão'], response: "Vamos inverter os papéis. Seja a outra pessoa por um instante. O que ela diria sobre essa briga, do ponto de vista dela?" },
            { keywords: ['futuro', 'medo do que vem'], response: "Vamos projetar essa cena futura. Imagine que já aconteceu. O que você está vendo e fazendo nessa cena?" },
            { keywords: ['eu mesmo', 'comigo'], response: "Faça um solilóquio. Fale em voz alta seus pensamentos mais íntimos, como se ninguém estivesse ouvindo." }
        ],
        default_responses: [
            "Se pudéssemos colocar essa situação em uma cena, como ela seria?",
            "Quem são os personagens principais dessa história?",
            "Experimente dizer isso com uma entonação diferente, talvez mais forte ou mais suave.",
            "Qual papel você sente que está desempenhando nessa situação?",
            "Vamos tentar uma ação diferente para essa cena."
        ]
    }
};

export const AiService = {
    // Criar nova sessão
    async createSession(userId: string, mode: TherapyMode = 'tcc', firstMessage?: string) {
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .insert({
                user_id: userId,
                therapy_mode: mode,
                title: firstMessage ? firstMessage.substring(0, 30) + '...' : 'Nova Conversa'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Buscar sessões do usuário
    async getSessions(userId: string) {
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Buscar mensagens de uma sessão
    async getMessages(sessionId: string) {
        const { data, error } = await supabase
            .from('ai_chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Enviar mensagem e obter resposta (Simulada com Lógica Profunda)
    async sendMessage(sessionId: string, content: string, mode: TherapyMode = 'tcc') {
        // 1. Salvar mensagem do usuário
        const { error: userMsgError } = await supabase
            .from('ai_chat_messages')
            .insert({
                session_id: sessionId,
                role: 'user',
                content: content
            });

        if (userMsgError) throw userMsgError;

        // 2. Simular "Thinking" (delay variável para parecer natural)
        const delay = Math.floor(Math.random() * 1000) + 1000; // 1s a 2s
        await new Promise(resolve => setTimeout(resolve, delay));

        // 3. Gerar resposta baseada na Persona e Base de Conhecimento
        let aiResponse = "";
        const lowerContent = content.toLowerCase();
        const knowledge = KNOWLEDGE_BASE[mode];

        // Tenta encontrar um padrão correspondente
        const matchedPattern = knowledge.patterns.find(p => 
            p.keywords.some(k => lowerContent.includes(k))
        );

        if (matchedPattern) {
            aiResponse = matchedPattern.response;
        } else {
            // Se não encontrar padrão, usa uma resposta genérica da abordagem
            const randomIdx = Math.floor(Math.random() * knowledge.default_responses.length);
            aiResponse = knowledge.default_responses[randomIdx];
        }

        // 4. Salvar resposta da IA
        const { data: aiMsg, error: aiMsgError } = await supabase
            .from('ai_chat_messages')
            .insert({
                session_id: sessionId,
                role: 'assistant',
                content: aiResponse
            })
            .select()
            .single();

        if (aiMsgError) throw aiMsgError;
        return aiMsg;
    }
};
