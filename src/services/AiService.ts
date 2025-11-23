import { supabase } from '../lib/supabase';
import { LocalLlmService } from '../lib/LocalLlmService';
import { VectorService } from './VectorService';

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
    user_id: string;
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

    // Enviar mensagem e obter resposta (REAL com RAG + Local LLM)
    async sendMessage(sessionId: string, content: string, mode: TherapyMode = 'tcc') {
        // 0. Buscar dados da sessão para obter user_id
        const { data: session } = await supabase
            .from('ai_chat_sessions')
            .select('user_id')
            .eq('id', sessionId)
            .single();
            
        if (!session) throw new Error("Sessão não encontrada");
        const userId = session.user_id;

        // 1. Salvar mensagem do usuário
        const { error: userMsgError } = await supabase
            .from('ai_chat_messages')
            .insert({
                session_id: sessionId,
                role: 'user',
                content: content
            });

        if (userMsgError) throw userMsgError;

        // 2. RAG: Buscar contexto relevante na memória de longo prazo
        console.log("Buscando memórias relevantes...");
        const memories = await VectorService.search(userId, content, 2);
        const memoryContext = memories.length > 0 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? "\nMemórias Relevantes (Contexto Passado):\n" + memories.map((m: any) => `- ${m.content}`).join("\n")
            : "";

        // 3. Preparar Prompt para o LLM com Persona Terapêutica e Contexto
        let systemInstruction = "";
        switch (mode) {
            case 'psicanalise':
                systemInstruction = "You are a Psychoanalyst. Focus on unconscious patterns, dreams, and childhood. Ask open, deep questions in Portuguese.";
                break;
            case 'tcc':
                systemInstruction = "You are a CBT Therapist. Focus on identifying cognitive distortions and asking for evidence. Be structured and practical in Portuguese.";
                break;
            case 'gestalt':
                systemInstruction = "You are a Gestalt Therapist. Focus on the 'here and now', body sensations, and awareness. Encourage the user to feel. Speak in Portuguese.";
                break;
            case 'psicodrama':
                systemInstruction = "You are a Psychodrama director. Encourage visualization, role-play, and scene setting. Speak in Portuguese.";
                break;
            default:
                systemInstruction = "You are a empathetic AI Therapist. Listen actively and provide support in Portuguese.";
        }

        const fullPrompt = `Instruction: ${systemInstruction}
        ${memoryContext}
        User: ${content}
        Therapist:`;

        // 4. Gerar resposta real via LLM Local
        let aiResponse = "";
        try {
            // Gerar resposta (max 150 tokens para ser rápido)
            aiResponse = await LocalLlmService.generate(fullPrompt, 150);
            
            // Limpeza simples caso o modelo repita o prompt
            if (aiResponse.includes("Therapist:")) {
                aiResponse = aiResponse.split("Therapist:").pop()?.trim() || aiResponse;
            }
        } catch (err) {
            console.error("Error generating AI response:", err);
            aiResponse = "Estou tendo dificuldade em processar isso agora. Podemos tentar reformular?";
        }

        // 5. Salvar resposta da IA no banco
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

        // 6. Memória: Salvar este turno de conversa no Vector Store (em background)
        // Não bloqueamos a resposta para o usuário
        const memoryContent = `User: ${content}\nAI: ${aiResponse}`;
        VectorService.saveMemory(userId, memoryContent, { sessionId, mode });

        return aiMsg;
    }
};
